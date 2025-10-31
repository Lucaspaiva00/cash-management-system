// ================== CONFIG ==================
const API = "https://cash-management-system.onrender.com/produtos";

// Formatação BRL
const fmtBRL = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

// Pega usuário logado
const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { empresaId: 1 };

// Elementos
const form = document.querySelector("#caixaForms");
const lista = document.querySelector("#produtosCadastrados");
const elVenda = document.querySelector("#estoquevalorbruto");
const elCusto = document.querySelector("#estoquevalorcusto");
const elLucro = document.querySelector("#estoquevalorliquido");

// Controle de edição
let produtoEditando = null;

// ================== EVENTOS ==================
document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  form.addEventListener("submit", salvarProduto);
});

// ================== SALVAR / ATUALIZAR ==================
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

  try {
    let resp;
    if (produtoEditando) {
      resp = await fetch(`${API}/${produtoEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    const json = await resp.json();
    if (!resp.ok) {
      alert(json.error || "Erro ao salvar produto.");
      return;
    }

    alert(produtoEditando ? "✅ Produto atualizado!" : "✅ Produto cadastrado!");
    form.reset();
    produtoEditando = null;

    // Restaura botão
    const btn = form.querySelector("button[type='submit']");
    btn.innerHTML = '<i class="fas fa-save"></i> Salvar Produto';
    btn.classList.remove("btn-warning");
    btn.classList.add("btn-success");

    carregarProdutos();
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    alert("❌ Falha ao salvar produto.");
  }
}

// ================== CARREGAR ==================
async function carregarProdutos() {
  lista.innerHTML = "<p>Carregando...</p>";

  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId || 1}`);
    const produtos = await resp.json();

    if (!Array.isArray(produtos) || produtos.length === 0) {
      lista.innerHTML = '<p class="text-muted">Nenhum produto cadastrado.</p>';
      elVenda.textContent = elCusto.textContent = elLucro.textContent = "R$ 0,00";
      return;
    }

    lista.innerHTML = produtos.map(p => cardProdutoHTML(p)).join("");

    const somaVenda = produtos.reduce((acc, p) => acc + (p.precoVenda * p.estoque), 0);
    const somaCusto = produtos.reduce((acc, p) => acc + (p.precoCompra * p.estoque), 0);
    elVenda.textContent = fmtBRL(somaVenda);
    elCusto.textContent = fmtBRL(somaCusto);
    elLucro.textContent = fmtBRL(somaVenda - somaCusto);
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    lista.innerHTML = "<p class='text-danger'>Erro ao carregar produtos.</p>";
  }
}

// ================== EDITAR ==================
window.editarProduto = function (p) {
  produtoEditando = p;

  form.nome.value = p.nome || "";
  form.precoVenda.value = p.precoVenda || "";
  form.precoCompra.value = p.precoCompra || "";
  form.estoque.value = p.estoque || "";
  form.marca.value = p.marca || "";
  form.categoria.value = p.categoria || "";

  const btn = form.querySelector("button[type='submit']");
  btn.innerHTML = '<i class="fas fa-save"></i> Atualizar Produto';
  btn.classList.remove("btn-success");
  btn.classList.add("btn-warning");
};

// ================== EXCLUIR ==================
window.excluirProduto = async function (id) {
  if (!confirm("⚠️ Deseja realmente excluir este produto?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const json = await resp.json();

    if (!resp.ok) {
      alert(json.error || "Erro ao excluir produto.");
      return;
    }

    alert("🗑️ Produto excluído com sucesso!");
    carregarProdutos();
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    alert("❌ Falha ao excluir produto.");
  }
};

// ================== TEMPLATE DE CARD ==================
function cardProdutoHTML(p) {
  return `
  <div class="card card-produto border-0 shadow-sm p-3" style="flex:1 1 320px; max-width:360px;">
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
        <button class="btn btn-warning btn-sm mr-1" onclick='editarProduto(${JSON.stringify(p)})'>
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick='excluirProduto(${p.id})'>
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </div>`;
}
