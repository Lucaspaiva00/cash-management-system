const API = "https://cash-management-system.fly.dev/clientes";
const lista = document.querySelector("#clientesCadastrados");
const form = document.querySelector("#caixaForms");

async function carregarClientes() {
  try {
    const resp = await fetch(API);
    const clientes = await resp.json();

    lista.innerHTML = clientes.length
      ? clientes.map(c => `
        <div class="col-md-4 mb-4">
          <div class="card card-cliente shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title text-primary mb-2">
                <i class="fas fa-user"></i> ${c.nome || "Sem nome"}
              </h5>
              <p class="mb-1"><strong>CPF:</strong> ${c.cpf || "-"}</p>
              <p class="mb-1"><strong>CNPJ:</strong> ${c.cnpj || "-"}</p>
              <p class="mb-1"><strong>Telefone:</strong> ${c.telefone || "-"}</p>
              <p class="mb-1"><strong>Email:</strong> ${c.email || "-"}</p>
              <p class="mb-2"><strong>Endereço:</strong> ${c.endereco || "-"}</p>
              <div class="text-right">
                <button class="btn btn-sm btn-warning" onclick="editarCliente(${c.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirCliente(${c.id})"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `).join("")
      : `<div class="text-center text-muted w-100">Nenhum cliente cadastrado.</div>`;
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
    lista.innerHTML = `<div class="alert alert-danger w-100">Erro ao carregar clientes.</div>`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nome: form.nome.value.trim(),
    cpf: form.cpf.value.trim(),
    cnpj: form.cnpj.value.trim(),
    endereco: form.endereco.value.trim(),
    telefone: form.telefone.value.trim(),
    email: form.email.value.trim(),
    empresaId: 1, // associar ao login depois
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      alert("✅ Cliente cadastrado com sucesso!");
      form.reset();
      carregarClientes();
    } else {
      const erro = await resp.json();
      alert(`❌ Erro: ${erro.error || "Falha no cadastro"}`);
    }
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    alert("Erro ao conectar com o servidor.");
  }
});

async function excluirCliente(id) {
  if (!confirm("Deseja excluir este cliente?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.status === 204) {
      alert("🗑️ Cliente removido com sucesso!");
      carregarClientes();
    } else {
      alert("❌ Erro ao excluir cliente.");
    }
  } catch (err) {
    console.error("Erro ao excluir:", err);
  }
}

function editarCliente(id) {
  alert(`✏️ Função de edição em desenvolvimento para o cliente ID: ${id}`);
}

document.addEventListener("DOMContentLoaded", () => {
  lista.classList.add("row");
  carregarClientes();
});
