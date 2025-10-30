const API = "https://cash-management-system.onrender.com/propostas";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const propostasLista = document.querySelector("#propostasLista");
const formProposta = document.querySelector("#formProposta");

let editandoId = null; // controla se o usuário está editando

// Criar ou atualizar proposta
formProposta.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    clienteId: parseInt(formProposta.clienteId.value),
    descricao: formProposta.descricao.value.trim(),
    valor: parseFloat(formProposta.valor.value),
    status: formProposta.status.value,
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
      alert(result.error || "Erro ao salvar proposta.");
      return;
    }

    alert(
      editandoId
        ? "✅ Proposta atualizada com sucesso!"
        : "✅ Proposta criada com sucesso!"
    );
    formProposta.reset();
    editandoId = null;
    document.querySelector("#btnSalvarProposta").innerHTML =
      '<i class="fas fa-save"></i> Salvar';
    carregarPropostas();
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});

// Listar propostas
async function carregarPropostas() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();

    propostasLista.innerHTML = "";
    lista.forEach((p) => {
      propostasLista.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.cliente?.nome || "Sem cliente"}</td>
          <td>${p.descricao}</td>
          <td>${p.valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</td>
          <td>
            <span class="badge ${
              p.status === "APROVADA" ? "badge-success" : "badge-warning"
            }">
              ${p.status}
            </span>
          </td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarProposta(${
              p.id
            })">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="excluirProposta(${
              p.id
            })">
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

// Excluir proposta
async function excluirProposta(id) {
  if (!confirm("Deseja excluir esta proposta?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.ok) {
      alert("🗑️ Proposta excluída!");
      carregarPropostas();
    }
  } catch (err) {
    console.error(err);
  }
}

// Editar proposta
async function editarProposta(id) {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();
    const proposta = lista.find((p) => p.id === id);

    if (!proposta) {
      alert("Proposta não encontrada!");
      return;
    }

    formProposta.clienteId.value = proposta.clienteId;
    formProposta.descricao.value = proposta.descricao;
    formProposta.valor.value = proposta.valor;
    formProposta.status.value = proposta.status;

    editandoId = id;
    document.querySelector("#btnSalvarProposta").innerHTML =
      '<i class="fas fa-sync-alt"></i> Atualizar';
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar proposta para edição.");
  }
}

document.addEventListener("DOMContentLoaded", carregarPropostas);
