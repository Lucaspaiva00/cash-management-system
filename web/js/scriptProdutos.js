const API = "https://cash-management-system.fly.dev/produtos";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const produtosLista = document.querySelector("#produtosLista");
const formProduto = document.querySelector("#formProduto");

let editandoId = null; // controla se está editando

// Criar ou atualizar produto
formProduto.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nome: formProduto.nome.value.trim(),
    preco: parseFloat(formProduto.preco.value),
    descricao: formProduto.descricao.value.trim(),
    empresaId: usuario.empresaId,
  };

  try {
    const url = editandoId ? `${API}/${editandoId}` : API;
    const method = editandoId ? "PUT" : "POST";

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await resp.json();

    if (!resp.ok) {
      alert(result.error || "Erro ao salvar produto.");
      return;
    }

    alert(editandoId ? "✅ Produto atualizado com sucesso!" : "✅ Produto cadastrado com sucesso!");
    formProduto.reset();
    editandoId = null;
    document.querySelector("#btnSalvar").innerHTML = '<i class="fas fa-save"></i> Salvar';
    carregarProdutos();
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});

// Listar produtos
async function carregarProdutos() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();

    produtosLista.innerHTML = "";
    lista.forEach((p) => {
      produtosLista.innerHTML += `
        <tr>
          <td>${p.nome}</td>
          <td>${p.descricao || "-"}</td>
          <td>${p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarProduto(${p.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="excluirProduto(${p.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
  }
}

// Excluir produto
async function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.ok) {
      alert("🗑️ Produto excluído!");
      carregarProdutos();
    }
  } catch (err) {
    console.error(err);
  }
}

// Editar produto
async function editarProduto(id) {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();
    const produto = lista.find((p) => p.id === id);

    if (!produto) {
      alert("Produto não encontrado!");
      return;
    }

    formProduto.nome.value = produto.nome;
    formProduto.preco.value = produto.preco;
    formProduto.descricao.value = produto.descricao || "";

    editandoId = id;
    document.querySelector("#btnSalvar").innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar produto para edição.");
  }
}

document.addEventListener("DOMContentLoaded", carregarProdutos);
