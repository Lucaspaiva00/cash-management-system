// ================== CONFIG ==================
const API = "https://cash-management-system.onrender.com/produtos";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { empresaId: 1 };

// ================== ELEMENTOS ==================
const form = document.querySelector("#caixaForms");
const lista = document.querySelector("#produtosCadastrados");
const btnSalvarEdicao = document.querySelector("#btnSalvarEdicao");
let editandoId = null;

// ================== FUNÇÕES AUXILIARES ==================
const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

function alertar(msg, tipo = "info") {
  const cores = {
    success: "#28a745",
    error: "#dc3545",
    info: "#007bff",
    warning: "#ffc107"
  };
  const cor = cores[tipo] || "#007bff";
  const toast = document.createElement("div");
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: cor,
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    zIndex: 9999,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ================== EVENTOS PRINCIPAIS ==================
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  form.addEventListener("submit", salvarProduto);
  btnSalvarEdicao.addEventListener("click", salvarEdicao);
});

// ================== CRUD ==================

// Criar produto
async function salvarProduto(e) {
  e.preventDefault();

  const data = {
    nome: form.nome.value.trim(),
    precoVenda: parseFloat(form.precoVenda.value) || 0,
    precoCompra: parseFloat(form.precoCompra.value) || 0,
    estoque: parseInt(form.estoque.value) || 0,
    marca: form.marca.value.trim(),
    categoria: form.categoria.value.trim(),
    empresaId: usuario.empresaId
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || "Erro ao cadastrar produto.");

    alertar("✅ Produto cadastrado com sucesso!", "success");
    form.reset();
    carregarProdutos();
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    alertar(err.message, "error");
  }
}

// Listar produtos
async function carregarProdutos() {
  lista.innerHTML = "<p class='text-muted'>Carregando produtos...</p>";

  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const produtos = await resp.json();

    if (!Array.isArray(produtos) || produtos.length === 0) {
      lista.innerHTML = "<p class='text-muted'>Nenhum produto cadastrado.</p>";
      return;
    }

    lista.innerHTML = produtos.map(cardProdutoHTML).join("");
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    lista.innerHTML = "<p class='text-danger'>Falha ao carregar produtos.</p>";
  }
}

// Editar produto
async function editarProduto(id) {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const produtos = await resp.json();
    const p = produtos.find((x) => x.id === id);
    if (!p) return alertar("Produto não encontrado.", "warning");

    editandoId = id;
    document.querySelector("#edit-id").value = p.id;
    document.querySelector("#edit-nome").value = p.nome;
    document.querySelector("#edit-precoVenda").value = p.precoVenda;
    document.querySelector("#edit-precoCompra").value = p.precoCompra;
    document.querySelector("#edit-estoque").value = p.estoque;
    document.querySelector("#edit-marca").value = p.marca;
    document.querySelector("#edit-categoria").value = p.categoria;

    $("#modalEditarProduto").modal("show");
  } catch (err) {
    console.error(err);
    alertar("Erro ao abrir produto para edição.", "error");
  }
}

// Salvar edição
async function salvarEdicao() {
  if (!editandoId) return alertar("Nenhum produto selecionado.", "warning");

  const data = {
    nome: document.querySelector("#edit-nome").value.trim(),
    precoVenda: parseFloat(document.querySelector("#edit-precoVenda").value) || 0,
    precoCompra: parseFloat(document.querySelector("#edit-precoCompra").value) || 0,
    estoque: parseInt(document.querySelector("#edit-estoque").value) || 0,
    marca: document.querySelector("#edit-marca").value.trim(),
    categoria: document.querySelector("#edit-categoria").value.trim()
  };

  try {
    const resp = await fetch(`${API}/${editandoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || "Erro ao atualizar produto.");

    alertar("✅ Produto atualizado com sucesso!", "success");
    $("#modalEditarProduto").modal("hide");
    carregarProdutos();
  } catch (err) {
    console.error(err);
    alertar("Erro ao atualizar produto: " + err.message, "error");
  }
}

// Excluir produto
async function excluirProduto(id) {
  if (!confirm("⚠️ Deseja realmente excluir este produto?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || "Erro ao excluir produto.");

    alertar("🗑️ Produto excluído com sucesso!", "success");
    carregarProdutos();
  } catch (err) {
    console.error(err);
    alertar("Erro ao excluir produto.", "error");
  }
}

// ================== TEMPLATE CARD ==================
function cardProdutoHTML(p) {
  return `
    <div class="card card-produto border-0 shadow-sm p-3 mb-3">
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
          <button class="btn btn-warning btn-sm mr-1" onclick="editarProduto(${p.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="excluirProduto(${p.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}

// Expor funções globais
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
