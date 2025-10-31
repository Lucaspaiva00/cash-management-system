const API = "https://cash-management-system.onrender.com/produtos";
const fmtBRL = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));
const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { empresaId: 1 };

const form = document.querySelector("#caixaForms");
const lista = document.querySelector("#produtosCadastrados");
let produtoEditando = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  form.addEventListener("submit", salvarProduto);
  document.querySelector("#btnSalvarEdicao").addEventListener("click", salvarEdicao);
});

// =============== CRIAR ===============
async function salvarProduto(e) {
  e.preventDefault();

  const data = {
    nome: form.nome.value.trim(),
    precoVenda: parseFloat(form.precoVenda.value) || 0,
    precoCompra: parseFloat(form.precoCompra.value) || 0,
    estoque: parseInt(form.estoque.value) || 0,
    marca: form.marca.value.trim(),
    categoria: form.categoria.value.trim(),
    empresaId: usuario.empresaId || 1,
  };

  const resp = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await resp.json();
  if (!resp.ok) return alert(json.error || "Erro ao cadastrar produto.");

  alert("✅ Produto cadastrado!");
  form.reset();
  carregarProdutos();
}

// =============== LISTAR ===============
async function carregarProdutos() {
  lista.innerHTML = "<p>Carregando...</p>";
  const resp = await fetch(`${API}?empresaId=${usuario.empresaId || 1}`);
  const produtos = await resp.json();

  if (!Array.isArray(produtos) || produtos.length === 0) {
    lista.innerHTML = '<p class="text-muted">Nenhum produto cadastrado.</p>';
    return;
  }
  lista.innerHTML = produtos.map(cardProdutoHTML).join("");
}

// =============== CARD HTML ===============
function cardProdutoHTML(p) {
  const dataString = encodeURIComponent(JSON.stringify(p)); // evitar erro no onclick
  return `
  <div class="card card-produto p-3">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h5 class="mb-1 text-dark">${p.nome}</h5>
        <p class="small text-muted mb-1">Categoria: ${p.categoria || "—"}</p>
        <p class="small text-muted mb-1">Estoque: ${p.estoque || 0}</p>
        <p class="small mb-1">
          <span class="badge badge-success">Venda ${fmtBRL(p.precoVenda)}</span>
          <span class="badge badge-danger">Custo ${fmtBRL(p.precoCompra)}</span>
        </p>
      </div>
      <div>
        <button class="btn btn-warning btn-sm mr-1" onclick='editarProduto("${dataString}")'>
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick='excluirProduto(${p.id})'>
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>`;
}

// =============== EDITAR (MODAL) ===============
window.editarProduto = function (jsonString) {
  const p = JSON.parse(decodeURIComponent(jsonString));
  produtoEditando = p;

  $("#modalEditarProduto").modal("show");
  document.querySelector("#edit-id").value = p.id;
  document.querySelector("#edit-nome").value = p.nome;
  document.querySelector("#edit-precoVenda").value = p.precoVenda;
  document.querySelector("#edit-precoCompra").value = p.precoCompra;
  document.querySelector("#edit-estoque").value = p.estoque;
  document.querySelector("#edit-marca").value = p.marca;
  document.querySelector("#edit-categoria").value = p.categoria;
};

// =============== SALVAR EDIÇÃO ===============
async function salvarEdicao() {
  if (!produtoEditando) return alert("Nenhum produto em edição.");

  const id = produtoEditando.id;
  const data = {
    nome: document.querySelector("#edit-nome").value.trim(),
    precoVenda: parseFloat(document.querySelector("#edit-precoVenda").value) || 0,
    precoCompra: parseFloat(document.querySelector("#edit-precoCompra").value) || 0,
    estoque: parseInt(document.querySelector("#edit-estoque").value) || 0,
    marca: document.querySelector("#edit-marca").value.trim(),
    categoria: document.querySelector("#edit-categoria").value.trim(),
  };

  const resp = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await resp.json();
  if (!resp.ok) return alert(json.error || "Erro ao atualizar produto.");

  alert("✅ Produto atualizado com sucesso!");
  $("#modalEditarProduto").modal("hide");
  carregarProdutos();
}

// =============== EXCLUIR ===============
window.excluirProduto = async function (id) {
  if (!confirm("Deseja realmente excluir este produto?")) return;
  const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
  const json = await resp.json();
  if (!resp.ok) return alert(json.error || "Erro ao excluir produto.");
  alert("🗑️ Produto excluído!");
  carregarProdutos();
};
