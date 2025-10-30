const API = "https://cash-management-system.fly.dev";
const clientesCadastrados = document.querySelector("#clientesCadastrados");
const formCliente = document.querySelector("#caixaForms");

formCliente.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nome: formCliente.nome.value.trim(),
    cpf: formCliente.cpf.value.trim(),
    cnpj: formCliente.cnpj.value.trim(),
    endereco: formCliente.endereco.value.trim(),
    telefone: formCliente.telefone.value.trim(),
    email: formCliente.email.value.trim(),
  };

  try {
    const resp = await fetch(`${API}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.status === 201) {
      alert("✅ Cliente cadastrado com sucesso!");
      formCliente.reset();
      carregarClientes(); // atualiza lista sem reload
    } else {
      const erro = await resp.json();
      alert(`❌ Erro ao cadastrar cliente: ${erro.error || resp.statusText}`);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor.");
  }
});

async function carregarClientes() {
  try {
    const resp = await fetch(`${API}/clientes`);
    const clientes = await resp.json();

    clientesCadastrados.innerHTML = "";

    if (clientes.length === 0) {
      clientesCadastrados.innerHTML = `
        <tr><td colspan="7" class="text-center">Nenhum cliente cadastrado.</td></tr>
      `;
      return;
    }

    clientes.forEach((c) => {
      clientesCadastrados.innerHTML += `
        <tr>
          <td>${c.nome || "-"}</td>
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
    console.error("Erro ao carregar clientes:", err);
    alert("Falha ao carregar lista de clientes.");
  }
}

async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;

  try {
    const resp = await fetch(`${API}/clientes/${id}`, { method: "DELETE" });

    if (resp.status === 204) {
      alert("🗑️ Cliente excluído com sucesso!");
      carregarClientes();
    } else {
      const erro = await resp.json();
      alert(`❌ Erro ao excluir cliente: ${erro.error || resp.statusText}`);
    }
  } catch (err) {
    console.error("Erro ao excluir cliente:", err);
    alert("Falha ao excluir cliente.");
  }
}

function editarCliente(id) {
  alert(`Função de edição em desenvolvimento para o cliente ID: ${id}`);
  // Aqui você poderá abrir um modal futuramente com os dados do cliente
}

document.addEventListener("DOMContentLoaded", carregarClientes);
