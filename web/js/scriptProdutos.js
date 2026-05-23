// ================== CONFIG ==================
const API = "https://cash-management-system.onrender.com/produtos";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { empresaId: 1 };

// ================== ELEMENTOS ==================
const form = document.querySelector("#caixaForms");
const lista = document.querySelector("#produtosCadastrados");
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
});

// ================== CRUD ==================

async function salvarProduto(e) {

  e.preventDefault();

  const data = {

    nome: form.nome.value.trim(),

    descricao:
      form.descricao?.value?.trim() || "",

    sku:
      form.sku?.value?.trim() || "",

    codigoBarras:
      form.codigoBarras?.value?.trim() || "",

    marca:
      form.marca.value.trim(),

    categoria:
      form.categoria.value.trim(),

    unidade:
      form.unidade?.value || "UN",

    precoCompra:
      parseFloat(form.precoCompra.value) || 0,

    precoVenda:
      parseFloat(form.precoVenda.value) || 0,

    estoque:
      parseInt(form.estoque.value) || 0,

    estoqueMinimo:
      parseInt(form.estoqueMinimo?.value) || 0,

    ncm:
      form.ncm?.value || "",

    cest:
      form.cest?.value || "",

    cfop:
      form.cfop?.value || "",

    origem:
      form.origem?.value || "NACIONAL",

    aliquotaIcms:
      parseFloat(form.aliquotaIcms?.value) || null,

    aliquotaPis:
      parseFloat(form.aliquotaPis?.value) || null,

    aliquotaCofins:
      parseFloat(form.aliquotaCofins?.value) || null,

    aliquotaIpi:
      parseFloat(form.aliquotaIpi?.value) || null,

    empresaId:
      usuario.empresaId

  };

  const metodo =
    editandoId ? "PUT" : "POST";

  const url =
    editandoId
      ? `${API}/${editandoId}`
      : API;

  try {

    const resp = await fetch(url, {

      method: metodo,

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(data)

    });

    const json =
      await resp.json();

    if (!resp.ok) {

      throw new Error(
        json.error ||
        "Erro ao salvar produto."
      );

    }

    alertar(

      editandoId
        ? "✅ Produto atualizado com sucesso!"
        : "✅ Produto cadastrado com sucesso!",

      "success"

    );

    form.reset();

    editandoId = null;

    $("#modalProduto").modal("hide");

    carregarProdutos();

  } catch (err) {

    console.error(err);

    alertar(
      err.message,
      "error"
    );

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

    const resp =
      await fetch(
        `${API}?empresaId=${usuario.empresaId}`
      );

    const produtos =
      await resp.json();

    const p =
      produtos.find(
        item => item.id === id
      );

    if (!p) {

      return alertar(
        "Produto não encontrado.",
        "warning"
      );

    }

    editandoId = id;

    form.nome.value =
      p.nome || "";

    form.descricao.value =
      p.descricao || "";

    form.sku.value =
      p.sku || "";

    form.codigoBarras.value =
      p.codigoBarras || "";

    form.marca.value =
      p.marca || "";

    form.categoria.value =
      p.categoria || "";

    form.unidade.value =
      p.unidade || "UN";

    form.precoCompra.value =
      p.precoCompra || 0;

    form.precoVenda.value =
      p.precoVenda || 0;

    form.estoque.value =
      p.estoque || 0;

    form.estoqueMinimo.value =
      p.estoqueMinimo || 0;

    form.ncm.value =
      p.ncm || "";

    form.cest.value =
      p.cest || "";

    form.cfop.value =
      p.cfop || "";

    form.origem.value =
      p.origem || "NACIONAL";

    form.aliquotaIcms.value =
      p.aliquotaIcms || "";

    form.aliquotaPis.value =
      p.aliquotaPis || "";

    form.aliquotaCofins.value =
      p.aliquotaCofins || "";

    form.aliquotaIpi.value =
      p.aliquotaIpi || "";

    $("#modalProduto").modal("show");

  } catch (error) {

    console.error(error);

    alertar(
      "Erro ao carregar produto.",
      "error"
    );

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
