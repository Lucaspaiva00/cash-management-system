const API = "https://cash-management-system.fly.dev/clientes";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const clientesCadastrados = document.querySelector("#clientesCadastrados");
const caixaForms = document.querySelector("#caixaForms");

// Criar cliente
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nome: caixaForms.nome.value.trim(),
    cpf: caixaForms.cpf.value.trim(),
    cnpj: caixaForms.cnpj.value.trim(),
    endereco: caixaForms.endereco.value.trim(),
    telefone: caixaForms.telefone.value.trim(),
    email: caixaForms.email.value.trim(),
    empresaId: usuario.empresaId,
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!resp.ok) {
      const err = await resp.json();
      alert(err.error || "Erro ao cadastrar cliente.");
      return;
    }

    alert("✅ Cliente cadastrado com sucesso!");
    caixaForms.reset();
    carregarClientes();
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
});

// Listar clientes
async function carregarClientes() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();

    clientesCadastrados.innerHTML = "";
    lista.forEach((c) => {
      clientesCadastrados.innerHTML += `
        <tr>
          <td>${c.nome}</td>
          <td>${c.cpf || "-"}</td>
          <td>${c.cnpj || "-"}</td>
          <td>${c.endereco || "-"}</td>
          <td>${c.telefone || "-"}</td>
          <td>${c.email || "-"}</td>
          <td>
            <button class="btn btn-warning btn-sm" onclick="editarCliente(${c.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="excluirCliente(${c.id})">
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

// Excluir cliente
async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.ok) {
      alert("🗑️ Cliente excluído com sucesso!");
      carregarClientes();
    }
  } catch (err) {
    console.error(err);
  }
}

// Editar cliente
async function editarCliente(id) {
  const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
  const lista = await resp.json();
  const cliente = lista.find((c) => c.id === id);

  if (!cliente) return alert("Cliente não encontrado.");

  caixaForms.nome.value = cliente.nome;
  caixaForms.cpf.value = cliente.cpf || "";
  caixaForms.cnpj.value = cliente.cnpj || "";
  caixaForms.endereco.value = cliente.endereco || "";
  caixaForms.telefone.value = cliente.telefone || "";
  caixaForms.email.value = cliente.email || "";
}

document.addEventListener("DOMContentLoaded", carregarClientes);
