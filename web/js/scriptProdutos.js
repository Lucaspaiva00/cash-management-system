const API = "https://cash-management-system.fly.dev/produtos";

const lista = document.querySelector("#produtosCadastrados");
const form = document.querySelector("#caixaForms");
const bruto = document.querySelector("#estoquevalorbruto");
const custo = document.querySelector("#estoquevalorcusto");
const liquido = document.querySelector("#estoquevalorliquido");

async function carregarProdutos() {
  try {
    const resp = await fetch(API);
    const produtos = await resp.json();

    let totalVenda = 0;
    let totalCompra = 0;

    lista.innerHTML = produtos
      .map(
        (p) => `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm border-left-primary h-100">
            <div class="card-body">
              <h5 class="card-title mb-2">
                <i class="fas fa-box text-primary"></i> ${p.nome}
              </h5>
              <p class="mb-1"><strong>Categoria:</strong> ${p.categoria}</p>
              <p class="mb-1"><strong>Marca:</strong> ${p.marca}</p>
              <p class="mb-1"><strong>Preço Venda:</strong> ${p.precovenda.toLocaleString(
          "pt-BR",
          { style: "currency", currency: "BRL" }
        )}</p>
              <p class="mb-1"><strong>Preço Compra:</strong> ${p.precocompra.toLocaleString(
          "pt-BR",
          { style: "currency", currency: "BRL" }
        )}</p>
              <p class="mb-1"><strong>Estoque:</strong> ${p.estoque}</p>
              <p class="mb-1"><strong>Quantidade:</strong> ${p.quantidade}</p>
              <div class="text-right mt-3">
                <button class="btn btn-sm btn-warning" onclick="editarProduto(${p.id})">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="excluirProduto(${p.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");

    produtos.forEach((p) => {
      totalVenda += p.precovenda;
      totalCompra += p.precocompra;
    });

    bruto.textContent = totalVenda.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    custo.textContent = totalCompra.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    liquido.textContent = (totalVenda - totalCompra).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nome: form.nome.value.trim(),
    precovenda: Number(form.precovenda.value),
    precocompra: Number(form.precocompra.value),
    estoque: Number(form.estoque.value),
    marca: form.marca.value.trim(),
    quantidade: Number(form.quantidade.value),
    categoria: form.categoria.value.trim(),
    empresaId: 1, // ajustar conforme login da empresa
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      alert("✅ Produto cadastrado com sucesso!");
      form.reset();
      carregarProdutos();
    } else {
      alert("❌ Erro ao cadastrar produto.");
    }
  } catch (err) {
    console.error("Erro:", err);
  }
});

async function excluirProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.ok) {
      alert("🗑️ Produto removido com sucesso!");
      carregarProdutos();
    } else {
      alert("❌ Erro ao excluir produto.");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
}

function editarProduto(id) {
  alert(`🛠️ Função de edição em desenvolvimento (ID: ${id})`);
}

document.addEventListener("DOMContentLoaded", () => {
  // Transforma a listagem em grid
  lista.classList.add("row");
  carregarProdutos();
});
