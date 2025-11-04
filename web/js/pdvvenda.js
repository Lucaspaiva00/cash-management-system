const BASE = "https://cash-management-system.onrender.com";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario || !usuario.empresaId) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
}

let produtosVenda = [];
let listaProdutosBD = [];
let listaClientesBD = [];

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
    const lista = document.getElementById("listaProdutos");

    if (produtosVenda.length === 0) {
        lista.innerHTML = `<p class="text-muted text-center">Nenhum produto adicionado.</p>`;
        document.getElementById("total").innerText = "R$ 0,00";
        return;
    }

    lista.innerHTML = produtosVenda.map((p, i) => `
    <div class="produto-item">
      <span>${p.nome} (x${p.qtd})</span>
      <strong>R$ ${(p.preco * p.qtd).toFixed(2)}</strong>
      <button class="btn btn-sm btn-danger" onclick="removerProduto(${i})"><i class="fas fa-trash"></i></button>
    </div>
  `).join("");

    const total = produtosVenda.reduce((acc, p) => acc + p.preco * p.qtd, 0);
    document.getElementById("total").innerText = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    calcularTroco();
}

function removerProduto(i) {
    produtosVenda.splice(i, 1);
    atualizarLista();
}

document.getElementById("adicionar").addEventListener("click", () => {
    const produtoId = parseInt(document.getElementById("produto").value);
    const qtd = parseInt(document.getElementById("quantidade").value);

    if (!produtoId || qtd <= 0) return alert("Selecione um produto e quantidade válida!");

    const produto = listaProdutosBD.find(p => p.id === produtoId);
    if (!produto) return alert("Produto não encontrado.");
    if (produto.estoque < qtd) return alert(`Estoque insuficiente (${produto.estoque} disponível)`);

    produtosVenda.push({ produtoId, nome: produto.nome, preco: produto.precoVenda || 0, qtd });
    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = 1;
    atualizarLista();
});

document.getElementById("valorRecebido").addEventListener("input", calcularTroco);

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

    const body = {
        empresaId: usuario.empresaId,
        clienteId,
        meioPagamento,
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
        alert("✅ Venda registrada com sucesso!");
        gerarCupomPDF(data.data || body);
        produtosVenda = [];
        atualizarLista();
    } catch (err) {
        console.error(err);
        alert("Erro ao finalizar venda:\n" + err.message);
    }
});

async function gerarCupomPDF(venda) {
    const total = venda.valor?.toFixed(2) ||
        produtosVenda.reduce((a, b) => a + (b.preco * b.qtd), 0).toFixed(2);

    // Buscar informações da empresa
    let nomeEmpresa = "PAIVA TECH - PDV";
    try {
        const res = await fetch(`${BASE}/empresas/${usuario.empresaId}`);
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

    produtosVenda.forEach((p) => {
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
