// js/scriptProdutos.js

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

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
  form.addEventListener("submit", salvarProduto);
});

// Salvar novo produto
async function salvarProduto(e) {
  e.preventDefault();

  const data = {
    nome: form.nome.value.trim(),
    precovenda: form.precovenda.value,
    precocompra: form.precocompra.value,
    estoque: form.estoque.value,
    marca: form.marca.value.trim(),
    quantidade: form.quantidade.value,
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

  form.reset();
  carregarProdutos();
}

// Carregar produtos
async function carregarProdutos() {
  lista.innerHTML = "<p>Carregando...</p>";

  const resp = await fetch(`${API}?empresaId=${usuario.empresaId || 1}`);
  const produtos = await resp.json();

  if (!Array.isArray(produtos) || produtos.length === 0) {
    lista.innerHTML = '<p class="text-muted">Nenhum produto cadastrado.</p>';
    elVenda.textContent = elCusto.textContent = elLucro.textContent = "R$ 0,00";
    return;
  }

  lista.innerHTML = produtos.map(cardProdutoHTML).join("");

  const somaVenda = produtos.reduce((acc, p) => acc + (p.precovenda * p.estoque), 0);
  const somaCusto = produtos.reduce((acc, p) => acc + (p.precocompra * p.estoque), 0);
  elVenda.textContent = fmtBRL(somaVenda);
  elCusto.textContent = fmtBRL(somaCusto);
  elLucro.textContent = fmtBRL(somaVenda - somaCusto);
}

function cardProdutoHTML(p) {
  return `
  <div class="card card-produto border-0 shadow-sm p-3" style="flex:1 1 320px; max-width:360px;">
    <div class="d-flex justify-content-between align-items-start">
      <div>
        <h5 class="mb-1 text-dark">${p.nome}</h5>
        <p class="small text-muted mb-1">Categoria: ${p.categoria || "—"}</p>
        <p class="small text-muted mb-1">Estoque: ${p.estoque || 0}</p>
        <p class="small mb-1"><span class="badge badge-success">Venda ${fmtBRL(p.precovenda)}</span> <span class="badge badge-danger">Custo ${fmtBRL(p.precocompra)}</span></p>
      </div>
      <div>
        <button class="btn btn-warning btn-sm mr-1" onclick='editarProduto(${JSON.stringify(p)})'><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick='excluirProduto(${p.id})'><i class="fas fa-trash"></i></button>
      </div>
    </div>
  </div>`;
}

// Excluir
async function excluirProduto(id) {
  if (!confirm("Excluir este produto?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  carregarProdutos();
}
