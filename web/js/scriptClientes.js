const API = "https://cash-management-system.onrender.com/clientes";
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
// Listar clientes (em cards)
async function carregarClientes() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();

    clientesCadastrados.innerHTML = "";
    if (!lista.length) {
      clientesCadastrados.innerHTML = `<p class="text-muted">Nenhum cliente cadastrado ainda.</p>`;
      return;
    }

    lista.forEach((c) => {
      clientesCadastrados.innerHTML += `
        <div class="card-cliente card border-0 shadow-sm p-3" style="flex: 1 1 320px; max-width: 360px; border-left:5px solid #007bff;">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="font-weight-bold text-dark mb-1"><i class="fas fa-user text-primary mr-1"></i> ${c.nome}</h6>
              <p class="mb-1 small text-muted"><i class="fas fa-map-marker-alt mr-1 text-secondary"></i> ${c.endereco || "—"}</p>
              <p class="mb-1 small text-muted"><i class="fas fa-phone mr-1 text-secondary"></i> ${c.telefone || "—"}</p>
              <p class="mb-1 small text-muted"><i class="fas fa-envelope mr-1 text-secondary"></i> ${c.email || "—"}</p>
              <p class="mb-1 small text-muted"><i class="fas fa-id-card mr-1 text-secondary"></i> CPF: ${c.cpf || "—"} | CNPJ: ${c.cnpj || "—"}</p>
            </div>
          </div>

          <div class="mt-3 d-flex justify-content-end">
            <button class="btn btn-warning btn-sm mr-2" onclick="editarCliente(${c.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="excluirCliente(${c.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
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
