const API = "https://cash-management-system.onrender.com/clientes";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const clientesCadastrados = document.querySelector("#clientesCadastrados");
const caixaForms = document.querySelector("#caixaForms");
const btnSubmit = document.createElement("button");
btnSubmit.type = "submit";
btnSubmit.className = "btn btn-success";
btnSubmit.innerHTML = '<i class="fas fa-save"></i> Salvar Cliente';

let editandoId = null; // <<< estado de edição

// injeta botão e um botão de cancelar
(function ensureButtons() {
  const footer = caixaForms.querySelector(".col-md-12.text-right") || caixaForms.querySelector(".text-right") || caixaForms;
  footer.innerHTML = "";
  footer.appendChild(btnSubmit);

  const btnCancelar = document.createElement("button");
  btnCancelar.type = "button";
  btnCancelar.className = "btn btn-light ml-2";
  btnCancelar.textContent = "Cancelar";
  btnCancelar.onclick = cancelarEdicao;
  footer.appendChild(btnCancelar);
})();

// helpers
function normaliza(v) {
  const s = (v || "").toString().trim();
  return s === "" ? null : s;
}

function setModoEdicao(ativo) {
  if (ativo) {
    btnSubmit.className = "btn btn-warning";
    btnSubmit.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Cliente';
  } else {
    btnSubmit.className = "btn btn-success";
    btnSubmit.innerHTML = '<i class="fas fa-save"></i> Salvar Cliente';
  }
}

// submit (POST ou PUT)
caixaForms.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nome: normaliza(caixaForms.nome.value),
    cpf: normaliza(caixaForms.cpf.value),
    cnpj: normaliza(caixaForms.cnpj.value),
    endereco: normaliza(caixaForms.endereco.value),
    telefone: normaliza(caixaForms.telefone.value),
    email: normaliza(caixaForms.email.value),
    empresaId: Number(usuario.empresaId),
  };

  try {
    const method = editandoId ? "PUT" : "POST";
    const url = editandoId ? `${API}/${editandoId}` : API;

    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      alert(data.error || "Erro ao salvar cliente.");
      return;
    }

    alert(editandoId ? "✅ Cliente atualizado!" : "✅ Cliente cadastrado!");
    caixaForms.reset();
    editandoId = null;
    setModoEdicao(false);
    carregarClientes();
  } catch (error) {
    console.error(error);
    alert("Erro ao conectar com o servidor.");
  }
});

// listar (cards)
async function carregarClientes() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();

    clientesCadastrados.innerHTML = "";
    if (!Array.isArray(lista) || !lista.length) {
      clientesCadastrados.innerHTML = `<p class="text-muted">Nenhum cliente cadastrado ainda.</p>`;
      return;
    }

    lista.forEach((c) => {
      clientesCadastrados.innerHTML += `
        <div class="card-cliente card border-0 shadow-sm p-3" style="flex:1 1 320px; max-width:360px; border-left:5px solid #007bff;">
          <div>
            <h6 class="font-weight-bold text-dark mb-1">
              <i class="fas fa-user text-primary mr-1"></i> ${c.nome}
            </h6>
            <p class="mb-1 small text-muted"><i class="fas fa-map-marker-alt mr-1 text-secondary"></i> ${c.endereco || "—"}</p>
            <p class="mb-1 small text-muted"><i class="fas fa-phone mr-1 text-secondary"></i> ${c.telefone || "—"}</p>
            <p class="mb-1 small text-muted"><i class="fas fa-envelope mr-1 text-secondary"></i> ${c.email || "—"}</p>
            <p class="mb-1 small text-muted"><i class="fas fa-id-card mr-1 text-secondary"></i> CPF: ${c.cpf || "—"} | CNPJ: ${c.cnpj || "—"}</p>
          </div>
          <div class="mt-3 d-flex justify-content-end">
            <button class="btn btn-warning btn-sm mr-2" onclick="editarCliente(${c.id})" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="excluirCliente(${c.id})" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    clientesCadastrados.innerHTML = `<p class="text-danger">Falha ao listar clientes.</p>`;
  }
}

// excluir
async function excluirCliente(id) {
  if (!confirm("Deseja realmente excluir este cliente?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      alert(data.error || "Erro ao excluir.");
      return;
    }
    alert("🗑️ Cliente excluído com sucesso!");
    if (editandoId === id) cancelarEdicao();
    carregarClientes();
  } catch (err) {
    console.error(err);
  }
}

// preencher form para edição
async function editarCliente(id) {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const lista = await resp.json();
    const c = lista.find((x) => x.id === id);
    if (!c) return alert("Cliente não encontrado.");

    caixaForms.nome.value = c.nome || "";
    caixaForms.cpf.value = c.cpf || "";
    caixaForms.cnpj.value = c.cnpj || "";
    caixaForms.endereco.value = c.endereco || "";
    caixaForms.telefone.value = c.telefone || "";
    caixaForms.email.value = c.email || "";

    editandoId = id;
    setModoEdicao(true);
    caixaForms.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (e) {
    console.error(e);
  }
}

function cancelarEdicao() {
  editandoId = null;
  setModoEdicao(false);
  caixaForms.reset();
}

document.addEventListener("DOMContentLoaded", carregarClientes);
