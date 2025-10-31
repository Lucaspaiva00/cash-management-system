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
        const clientes = await fetch(`${BASE}/clientes?empresaId=${usuario.empresaId}`).then(r => r.json());
        const produtos = await fetch(`${BASE}/produtos?empresaId=${usuario.empresaId}`).then(r => r.json());

        listaClientesBD = clientes;
        listaProdutosBD = produtos;

        // Clientes
        document.getElementById("cliente").innerHTML =
            '<option value="">Consumidor Final</option>' +
            clientes.map(c => `<option value="${c.id}">${c.nome}</option>`).join("");

        // Produtos
        document.getElementById("produto").innerHTML =
            '<option value="">Selecione...</option>' +
            produtos.map(p =>
                `<option value="${p.id}">${p.nome} - R$ ${p.precoVenda?.toFixed(2) || 0}</option>`
            ).join("");
    } catch (err) {
        console.error("Erro ao carregar selects:", err);
        alert("Falha ao carregar clientes e produtos.");
    }
}

function atualizarLista() {
    const lista = document.getElementById("listaProdutos");
    lista.innerHTML = produtosVenda.map((p, i) => `
    <div class="produto-item">
      <span>${p.nome} (x${p.qtd})</span>
      <strong>R$ ${(p.preco * p.qtd).toFixed(2)}</strong>
      <button class="btn btn-sm btn-danger" onclick="removerProduto(${i})"><i class="fas fa-trash"></i></button>
    </div>
  `).join("");

    const total = produtosVenda.reduce((acc, p) => acc + p.preco * p.qtd, 0);
    document.getElementById("total").innerText = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
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

    produtosVenda.push({
        produtoId,
        nome: produto.nome,
        preco: produto.precoVenda || 0,
        qtd,
    });

    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = 1;
    atualizarLista();
});

document.getElementById("valorRecebido").addEventListener("input", calcularTroco);

function calcularTroco() {
    const total = produtosVenda.reduce((acc, p) => acc + p.preco * p.qtd, 0);
    const recebido = parseFloat(document.getElementById("valorRecebido").value) || 0;
    const troco = Math.max(recebido - total, 0);
    document.getElementById("troco").value = troco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
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

        const data = await resp.json();

        if (!resp.ok) throw new Error(data.error || "Erro ao registrar venda.");

        alert("✅ Venda registrada com sucesso!");
        gerarCupomPDF(data.data || body);
        produtosVenda = [];
        atualizarLista();
        document.getElementById("valorRecebido").value = 0;
        document.getElementById("troco").value = "R$ 0,00";
    } catch (err) {
        console.error(err);
        alert("Erro ao finalizar venda: " + err.message);
    }
});

function gerarCupomPDF(venda) {
    const conteudo = `
*** CUPOM NÃO FISCAL ***

Paiva Tech - PDV
Data: ${new Date().toLocaleString()}
Pagamento: ${venda.meioPagamento}

Produtos:
${produtosVenda.map(p => `${p.nome} x${p.qtd} - R$ ${(p.preco * p.qtd).toFixed(2)}`).join("\n")}

TOTAL: R$ ${venda.valor?.toFixed(2) || produtosVenda.reduce((a, b) => a + (b.preco * b.qtd), 0).toFixed(2)}

Obrigado pela preferência!
`;

    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cupom-venda.txt";
    a.click();
    URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", carregarSelects);
