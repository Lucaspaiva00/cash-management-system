// js/scriptProdutos.js

// === CONFIG ===
const API = "https://cash-management-system.onrender.com/produtos";

// Pega usuário logado
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

// Formata moeda BRL
const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );

// Elementos
const form = document.querySelector("#caixaForms");             // <- EXISTE no seu HTML
const lista = document.querySelector("#produtosCadastrados");
const elVenda = document.querySelector("#estoquevalorbruto");
const elCusto = document.querySelector("#estoquevalorcusto");
const elLucro = document.querySelector("#estoquevalorliquido");

// Garante que só executa quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  if (!form) {
    console.error('Formulário "#caixaForms" não encontrado no DOM.');
    return;
  }

  // Carrega a lista ao abrir
  carregarProdutos();

  // Submit do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      nome: form.nome.value.trim(),
      precovenda: form.precovenda.value,
      precocompra: form.precocompra.value,
      estoque: form.estoque.value,
      marca: form.marca.value.trim(),
      quantidade: form.quantidade.value,         // Campo existe no seu HTML
      categoria: form.categoria.value.trim(),
      empresaId: usuario.empresaId,
    };

    try {
      const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await resp.json();
      if (!resp.ok) {
        alert(json.error || "Erro ao cadastrar produto.");
        return;
      }

      // Sucesso
      form.reset();
      carregarProdutos();
    } catch (err) {
      console.error(err);
      alert("Falha ao comunicar com o servidor.");
    }
  });
});

// Lista + cards + totais
async function carregarProdutos() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const produtos = await resp.json();

    // Renderiza cards
    lista.innerHTML = "";
    if (!Array.isArray(produtos) || produtos.length === 0) {
      lista.innerHTML =
        '<p class="text-muted">Nenhum produto cadastrado ainda.</p>';
    } else {
      produtos.forEach((p) => {
        lista.innerHTML += cardProdutoHTML(p);
      });
    }

    // Totais (usa estoque para multiplicação)
    const somaVenda = produtos.reduce(
      (acc, p) => acc + (Number(p.precovenda) || 0) * (Number(p.estoque) || 0),
      0
    );
    const somaCusto = produtos.reduce(
      (acc, p) => acc + (Number(p.precocompra) || 0) * (Number(p.estoque) || 0),
      0
    );
    const somaLucro = somaVenda - somaCusto;

    if (elVenda) elVenda.textContent = fmtBRL(somaVenda);
    if (elCusto) elCusto.textContent = fmtBRL(somaCusto);
    if (elLucro) elLucro.textContent = fmtBRL(somaLucro);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar produtos.");
  }
}

function cardProdutoHTML(p) {
  return `
    <div class="card card-produto border-0 shadow-sm p-3" style="flex:1 1 320px; max-width:360px;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="mb-1 text-dark">${p.nome}</h5>
          <p class="mb-1 small text-muted">Categoria: ${p.categoria || "—"}</p>
          <p class="mb-1 small text-muted">Marca: ${p.marca || "—"}</p>
          <p class="mb-1 small text-muted">Estoque: ${p.estoque ?? 0
    } | Qtd: ${p.quantidade ?? 0}</p>
          <p class="mb-1"><span class="badge badge-success">Venda: ${fmtBRL(
      p.precovenda
    )}</span> <span class="badge badge-danger ml-1">Custo: ${fmtBRL(
      p.precocompra
    )}</span></p>
        </div>
        <div class="ml-2">
          <button class="btn btn-warning btn-sm mr-1" title="Editar" onclick='editarProduto(${JSON.stringify(
      p
    )})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" title="Excluir" onclick="excluirProduto(${p.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// Preenche formulário para edição
function editarProduto(p) {
  form.nome.value = p.nome || "";
  form.precovenda.value = p.precovenda || "";
  form.precocompra.value = p.precocompra || "";
  form.estoque.value = p.estoque || "";
  form.marca.value = p.marca || "";
  form.quantidade.value = p.quantidade || "";
  form.categoria.value = p.categoria || "";

  // Troca o submit para atualizar
  form.dataset.editingId = p.id;
  trocarParaModoAtualizar();
}

function trocarParaModoAtualizar() {
  const btn = form.querySelector('button[type="submit"]');
  btn.classList.remove("btn-success");
  btn.classList.add("btn-primary");
  btn.innerHTML = '<i class="fas fa-save mr-1"></i> Atualizar Produto';

  // Remove submit anterior e aplica novo handler só uma vez
  form.removeEventListener("submit", handleCreate);
  form.addEventListener("submit", handleUpdate, { once: true });
}

async function handleUpdate(e) {
  e.preventDefault();
  const id = form.dataset.editingId;
  if (!id) return;

  const data = {
    nome: form.nome.value.trim(),
    precovenda: form.precovenda.value,
    precocompra: form.precocompra.value,
    estoque: form.estoque.value,
    marca: form.marca.value.trim(),
    quantidade: form.quantidade.value,
    categoria: form.categoria.value.trim(),
  };

  try {
    const resp = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await resp.json();
    if (!resp.ok) {
      alert(json.error || "Erro ao atualizar produto.");
      return;
    }
    // Volta para modo criar
    form.reset();
    delete form.dataset.editingId;
    const btn = form.querySelector('button[type="submit"]');
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-success");
    btn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Produto';

    carregarProdutos();
  } catch (err) {
    console.error(err);
    alert("Falha ao comunicar com o servidor.");
  }
}

// Mantém referência para restaurar comportamento de criar
function handleCreate() { } // marcador
// Reinstala o listener padrão (create) quando página carrega (feito no DOMContentLoaded)

// Excluir
async function excluirProduto(id) {
  if (!confirm("Deseja realmente excluir este produto?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const json = await resp.json();
    if (!resp.ok) {
      alert(json.error || "Erro ao excluir produto.");
      return;
    }
    carregarProdutos();
  } catch (err) {
    console.error(err);
    alert("Falha ao comunicar com o servidor.");
  }
}
