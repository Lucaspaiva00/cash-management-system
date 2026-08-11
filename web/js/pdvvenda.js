const BASE = API_BASE;
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario || !usuario.empresaId) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
}

let produtosVenda = [];
let listaProdutosBD = [];
let listaClientesBD = [];

function formatarQuantidade(quantidade, unidade = "UN") {
    const valor = Number(quantidade || 0);

    if (unidade === "KG") {
        return `${valor.toLocaleString("pt-BR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        })} kg`;
    }

    return `${valor.toLocaleString("pt-BR", {
        maximumFractionDigits: 3
    })} ${unidade}`;
}

function atualizarCampoQuantidade() {
    const produtoId = Number(
        document.getElementById("produto").value
    );

    const produto = listaProdutosBD.find(
        p => p.id === produtoId
    );

    const campo = document.getElementById("quantidade");
    const label = document.getElementById("labelQuantidade");
    const ajuda = document.getElementById("ajudaQuantidade");

    if (produto?.unidade === "KG") {
        label.textContent = "Peso em kg";
        campo.min = "0.001";
        campo.step = "0.001";
        campo.value = "0.100";
        campo.placeholder = "Ex.: 0,200";

        ajuda.textContent =
            "Exemplo: informe 0,200 para vender 200 gramas.";
    } else {
        label.textContent = "Quantidade";
        campo.min = "1";
        campo.step = "1";
        campo.value = "1";
        campo.placeholder = "";

        ajuda.textContent = "";
    }
}

document
    .getElementById("produto")
    .addEventListener("change", atualizarCampoQuantidade);

async function carregarSelects() {
    try {
        const [clientes, produtos] = await Promise.all([
            fetch(`${BASE}/clientes?empresaId=${usuario.empresaId}`).then(r => r.json()),
            fetch(`${BASE}/produtos?empresaId=${usuario.empresaId}`).then(r => r.json())
        ]);

        listaClientesBD = clientes;
        listaProdutosBD = produtos;

        document.getElementById("cliente").innerHTML =
            `<option value="">Consumidor Final</option>` +
            clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");

        document.getElementById("produto").innerHTML =
            `<option value="">Selecione...</option>` +
            produtos.map(p => `<option value="${p.id}">${p.nome} - R$ ${p.precoVenda?.toFixed(2) || 0}</option>`).join("");
    } catch (err) {
        console.error("Erro ao carregar selects:", err);
        alert("Falha ao carregar clientes e produtos.");
    }
}

function atualizarLista() {

    const lista =
        document.getElementById("listaProdutos");

    const contador =
        document.getElementById("contadorProdutos");

    if (contador) {

        contador.textContent =
            `${produtosVenda.length} produto${produtosVenda.length != 1 ? "s" : ""}`;

    }

    if (produtosVenda.length === 0) {

        lista.innerHTML = `

            <div class="col-12">

                <div class="text-center py-5 text-muted">

                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>

                    <h5>

                        Nenhum produto adicionado

                    </h5>

                    <p>

                        Utilize o formulário acima para adicionar produtos.

                    </p>

                </div>

            </div>

        `;

        document.getElementById("total").innerHTML =
            "R$ 0,00";

        calcularTroco();

        return;

    }

    lista.innerHTML =
        produtosVenda.map((p, i) => `

            <div class="col-xl-4 col-lg-6 mb-4">

                <div class="metric-card">

                    <div class="metric-top">

                        <div>

                            <div class="metric-label">

                                PRODUTO

                            </div>

                        </div>

                        <div class="metric-icon">

                            <i class="fas fa-box text-primary"></i>

                        </div>

                    </div>

                    <div class="metric-value">

                        ${p.nome}

                    </div>

                    <hr>

                    <div class="row text-center">

                        <div class="col-4">

                            <small class="text-muted">

                                Quantidade

                            </small>

                            <h5>

                                ${formatarQuantidade(p.qtd, p.unidade)}

                            </h5>

                        </div>

                        <div class="col-4">

                            <small class="text-muted">

                                Unitário

                            </small>

                            <h6>

                           ${p.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}/${p.unidade || "UN"}
        

                            </h6>

                        </div>

                        <div class="col-4">

                            <small class="text-muted">

                                Subtotal

                            </small>

                            <h5 class="text-success">

                                ${(p.preco * p.qtd).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        )}

                            </h5>

                        </div>

                    </div>

                    <hr>

                    <button
                        class="btn btn-outline-danger btn-block"
                        onclick="removerProduto(${i})">

                        <i class="fas fa-trash mr-2"></i>

                        Remover Produto

                    </button>

                </div>

            </div>

        `).join("");

    const total =
        produtosVenda.reduce(
            (acc, p) => acc + (p.preco * p.qtd),
            0
        );

    document.getElementById("total").innerHTML =
        total.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    calcularTroco();

}

function removerProduto(i) {
    produtosVenda.splice(i, 1);
    atualizarLista();
}

document.getElementById("adicionar").addEventListener("click", () => {
    const produtoId = parseInt(
        document.getElementById("produto").value
    );

    const qtd = parseFloat(
        document.getElementById("quantidade").value
    );

    if (!produtoId || !Number.isFinite(qtd) || qtd <= 0) {
        return alert("Selecione um produto e informe uma quantidade válida!");
    }

    const produto = listaProdutosBD.find(
        p => p.id === produtoId
    );

    if (!produto) {
        return alert("Produto não encontrado.");
    }

    const existente = produtosVenda.find(
        p => p.produtoId === produtoId
    );

    const quantidadeNoCarrinho = existente
        ? existente.qtd
        : 0;

    const quantidadeTotal = quantidadeNoCarrinho + qtd;

    if (quantidadeTotal > Number(produto.estoque)) {
        return alert(
            `Estoque insuficiente. Disponível: ${formatarQuantidade(produto.estoque, produto.unidade)}`
        );
    }

    if (existente) {
        existente.qtd = quantidadeTotal;
    } else {
        produtosVenda.push({
            produtoId,
            nome: produto.nome,
            preco: Number(produto.precoVenda || 0),
            qtd,
            unidade: produto.unidade || "UN"
        });
    }

    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "1";

    atualizarCampoQuantidade();
    atualizarLista();
});

document.getElementById("valorRecebido").addEventListener("input", calcularTroco);

const situacaoPagamento = document.getElementById("situacaoPagamento");
const campoVencimento = document.getElementById("campoVencimento");
const camposRecebimento = document.getElementById("camposRecebimento");
const dataVencimento = document.getElementById("dataVencimento");

function atualizarSituacaoPagamento() {
    const pendente = situacaoPagamento.value === "PENDENTE";
    campoVencimento.style.display = pendente ? "block" : "none";
    camposRecebimento.style.display = pendente ? "none" : "flex";
    dataVencimento.required = pendente;

    if (!pendente) dataVencimento.value = "";
}

situacaoPagamento.addEventListener("change", atualizarSituacaoPagamento);
atualizarSituacaoPagamento();

function calcularTroco() {
    const total = produtosVenda.reduce((acc, p) => acc + p.preco * p.qtd, 0);
    const recebido = parseFloat(document.getElementById("valorRecebido").value) || 0;
    const troco = Math.max(recebido - total, 0);
    document.getElementById("troco").value = troco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

document.getElementById("finalizar").addEventListener("click", async () => {
    if (produtosVenda.length === 0) return alert("Nenhum produto adicionado!");

    const clienteId = document.getElementById("cliente").value || null;
    const meioPagamento = document.getElementById("pagamento").value;
    const statusPagamento = situacaoPagamento.value;
    const vencimento = dataVencimento.value;

    if (statusPagamento === "PENDENTE" && !clienteId) {
        return alert("Selecione o cliente para registrar uma venda pendente.");
    }

    if (statusPagamento === "PENDENTE" && !vencimento) {
        return alert("Informe a data de vencimento da venda pendente.");
    }

    const body = {
        empresaId: usuario.empresaId,
        clienteId,
        meioPagamento,
        statusPagamento,
        dataVencimento: statusPagamento === "PENDENTE" ? vencimento : null,
        itens: produtosVenda.map(p => ({
            produtoId: p.produtoId,
            quantidade: p.qtd,
        })),
    };

    try {
        const resp = await fetch(`${BASE}/vendas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Erro HTTP ${resp.status}: ${text.slice(0, 120)}`);
        }

        const data = await resp.json();
        const itensCupom = produtosVenda.map(item => ({ ...item }));
        alert(statusPagamento === "PENDENTE"
            ? "✅ Venda registrada como pendente!"
            : "✅ Venda registrada com sucesso!");
        await gerarCupomPDF(data.data || body, itensCupom, statusPagamento, vencimento);
        produtosVenda = [];
        situacaoPagamento.value = "PAGO";
        document.getElementById("valorRecebido").value = "0";
        document.getElementById("troco").value = "";
        atualizarSituacaoPagamento();
        atualizarLista();
    } catch (err) {
        console.error(err);
        alert("Erro ao finalizar venda:\n" + err.message);
    }
});

async function gerarCupomPDF(venda, itensCupom, statusPagamento, vencimento) {
    const total = Number(venda.total ??
        itensCupom.reduce((a, b) => a + (b.preco * b.qtd), 0)).toFixed(2);

    // Buscar informações da empresa
    let nomeEmpresa = "PAIVA TECH - PDV";
    try {
        const res = await fetch(`${BASE}/empresa/${usuario.empresaId}`);
        if (res.ok) {
            const empresa = await res.json();
            nomeEmpresa = empresa.nome || nomeEmpresa;
        }
    } catch (e) {
        console.warn("Erro ao carregar nome da empresa:", e);
    }

    // Buscar nome do cliente (se houver)
    let nomeCliente = "Consumidor Final";
    if (venda.clienteId) {
        const cliente = listaClientesBD.find(c => c.id == venda.clienteId);
        if (cliente) nomeCliente = cliente.nome;
    }

    // Biblioteca do PDF
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200], // formato de cupom
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;

    // Cabeçalho com nome da empresa
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(nomeEmpresa.toUpperCase(), pageWidth / 2, y, { align: "center" });

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, y, { align: "center" });

    y += 5;
    doc.text(`Cliente: ${nomeCliente}`, pageWidth / 2, y, { align: "center" });

    y += 6;
    doc.text(`Forma de Pagamento: ${venda.meioPagamento}`, pageWidth / 2, y, { align: "center" });

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text(
        statusPagamento === "PENDENTE" ? "SITUACAO: PAGAMENTO PENDENTE" : "SITUACAO: PAGO",
        pageWidth / 2,
        y,
        { align: "center" }
    );

    if (statusPagamento === "PENDENTE" && vencimento) {
        y += 5;
        const dataFormatada = new Date(`${vencimento}T12:00:00`).toLocaleDateString("pt-BR");
        doc.text(`VENCIMENTO: ${dataFormatada}`, pageWidth / 2, y, { align: "center" });
    }

    // Linha divisória
    y += 4;
    doc.setLineWidth(0.2);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    // Tabela de produtos
    doc.setFont("helvetica", "bold");
    doc.text("PRODUTO", 5, y);
    doc.text("QTD", 38, y);
    doc.text("TOTAL", 60, y);
    y += 3;
    doc.setFont("helvetica", "normal");

    itensCupom.forEach((p) => {
        doc.text(p.nome.substring(0, 20), 5, y);
        doc.text(String(p.qtd), 40, y);
        doc.text(`R$ ${(p.preco * p.qtd).toFixed(2)}`, 55, y);
        y += 5;
    });

    // Linha separadora
    y += 2;
    doc.line(5, y, pageWidth - 5, y);
    y += 6;

    // Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`TOTAL: R$ ${total}`, pageWidth / 2, y, { align: "center" });

    // Rodapé
    y += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("** CUPOM NÃO FISCAL **", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text("Obrigado pela preferência!", pageWidth / 2, y, { align: "center" });

    // Download
    doc.save(`cupom-${nomeEmpresa.replace(/\s+/g, "_")}.pdf`);
}



document.addEventListener("DOMContentLoaded", carregarSelects);
