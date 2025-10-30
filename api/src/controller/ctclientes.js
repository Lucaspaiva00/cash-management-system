const API = "https://cash-management-system.fly.dev";
const clientesCadastrados = document.querySelector("#clientesCadastrados");
const formCliente = document.querySelector("#caixaForms");
const modal = new bootstrap.Modal(document.getElementById("modalEditarCliente"));
const formEditar = document.querySelector("#formEditarCliente");

// ==========================
// 🔹 Cadastrar novo cliente
// ==========================
formCliente.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nome: formCliente.nome.value.trim(),
        cpf: formCliente.cpf.value.trim(),
        cnpj: formCliente.cnpj.value.trim(),
        endereco: formCliente.endereco.value.trim(),
        telefone: formCliente.telefone.value.trim(),
        email: formCliente.email.value.trim(),
        empresaId: 1 // pode ser dinâmico se cada empresa tiver login
    };

    try {
        const resp = await fetch(`${API}/clientes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const json = await resp.json();
        if (resp.ok) {
            alert("✅ Cliente cadastrado com sucesso!");
            formCliente.reset();
            carregarClientes();
        } else {
            alert(json.error || "Erro ao cadastrar cliente.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar com o servidor.");
    }
});

// ==========================
// 🔹 Listar clientes
// ==========================
async function carregarClientes() {
    try {
        const resp = await fetch(`${API}/clientes?empresaId=1`);
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
            <button class="btn btn-warning btn-sm" onclick="abrirModalEditar(${c.id})">
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

// ==========================
// 🔹 Excluir cliente
// ==========================
async function excluirCliente(id) {
    if (!confirm("Deseja realmente excluir este cliente?")) return;

    try {
        const resp = await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
        const data = await resp.json();

        if (resp.ok) {
            alert("🗑️ Cliente excluído com sucesso!");
            carregarClientes();
        } else {
            alert(data.error || "Erro ao excluir cliente.");
        }
    } catch (err) {
        console.error("Erro ao excluir cliente:", err);
        alert("Falha ao excluir cliente.");
    }
}

// ==========================
// 🔹 Abrir modal de edição
// ==========================
async function abrirModalEditar(id) {
    try {
        const resp = await fetch(`${API}/clientes?empresaId=1`);
        const clientes = await resp.json();
        const cliente = clientes.find((c) => c.id === id);
        if (!cliente) {
            alert("Cliente não encontrado.");
            return;
        }

        // Preenche campos do modal
        formEditar.id.value = cliente.id;
        formEditar.nome.value = cliente.nome || "";
        formEditar.cpf.value = cliente.cpf || "";
        formEditar.cnpj.value = cliente.cnpj || "";
        formEditar.endereco.value = cliente.endereco || "";
        formEditar.telefone.value = cliente.telefone || "";
        formEditar.email.value = cliente.email || "";

        modal.show();
    } catch (err) {
        console.error("Erro ao abrir modal de edição:", err);
        alert("Falha ao carregar dados do cliente.");
    }
}

// ==========================
// 🔹 Atualizar cliente
// ==========================
formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = formEditar.id.value;
    const data = {
        nome: formEditar.nome.value.trim(),
        cpf: formEditar.cpf.value.trim(),
        cnpj: formEditar.cnpj.value.trim(),
        endereco: formEditar.endereco.value.trim(),
        telefone: formEditar.telefone.value.trim(),
        email: formEditar.email.value.trim(),
        empresaId: 1
    };

    try {
        const resp = await fetch(`${API}/clientes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const json = await resp.json();
        if (resp.ok) {
            alert("✅ Cliente atualizado com sucesso!");
            modal.hide();
            carregarClientes();
        } else {
            alert(json.error || "Erro ao atualizar cliente.");
        }
    } catch (err) {
        console.error("Erro ao atualizar cliente:", err);
        alert("Falha ao atualizar cliente.");
    }
});

// ==========================
// 🔹 Inicialização
// ==========================
document.addEventListener("DOMContentLoaded", carregarClientes);
