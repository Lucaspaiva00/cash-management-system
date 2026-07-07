const API = `${API_BASE}/clientes`;

const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {

  alert("Sessão expirada.");

  window.location.href = "login.html";

}

const empresaId = Number(usuario.empresaId);

const modal = $("#modalCliente");

const form = document.getElementById("caixaForms");

const tabela = document.getElementById("clientesCadastrados");

const buscarCliente = document.getElementById("buscarCliente");

const tituloModal = document.getElementById("tituloModalCliente");

const totalClientes = document.getElementById("totalClientes");

const clientesMensal = document.getElementById("clientesMensal");

const clientesQuinzenal = document.getElementById("clientesQuinzenal");

let clientes = [];

let clienteEditando = null;

document.addEventListener("DOMContentLoaded", () => {

  carregarClientes();

  document
    .getElementById("btnNovoCliente")
    ?.addEventListener("click", abrirNovoCliente);

  document
    .getElementById("btnNovoClienteTabela")
    ?.addEventListener("click", abrirNovoCliente);

  buscarCliente?.addEventListener("input", pesquisarClientes);

  form.addEventListener("submit", salvarCliente);

});

function abrirNovoCliente() {

  clienteEditando = null;

  form.reset();

  tituloModal.innerText = "Novo Cliente";

  modal.modal("show");

}
async function carregarClientes() {

  try {

    const resp = await fetch(
      `${API}?empresaId=${empresaId}`
    );

    clientes = await resp.json();

    if (!Array.isArray(clientes)) {

      clientes = [];

    }

    atualizarResumo();

    renderizarTabela(clientes);

  } catch (err) {

    console.error(err);

    tabela.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Erro ao carregar clientes.
                </td>
            </tr>
        `;

  }

}

function atualizarResumo() {

  totalClientes.textContent =
    clientes.length;

  clientesMensal.textContent =
    clientes.filter(c =>
      c.pacoteMensal
    ).length;

  clientesQuinzenal.textContent =
    clientes.filter(c =>
      c.pacoteQuinzenal
    ).length;

}

function pesquisarClientes() {

  const texto =
    buscarCliente.value
      .toLowerCase()
      .trim();

  const filtrados =
    clientes.filter(c => {

      return (

        (c.nome || "")
          .toLowerCase()
          .includes(texto)

        ||

        (c.telefone || "")
          .toLowerCase()
          .includes(texto)

        ||

        (c.servico || "")
          .toLowerCase()
          .includes(texto)

      );

    });

  renderizarTabela(filtrados);

}

function renderizarTabela(lista) {

  tabela.innerHTML = "";

  if (!lista.length) {

    tabela.innerHTML = `

            <tr>

                <td colspan="5" class="text-center text-muted py-4">

                    Nenhum cliente encontrado.

                </td>

            </tr>

        `;

    return;

  }

  lista.forEach(cliente => {

    tabela.innerHTML += `

            <tr>

                <td>

                    <strong>

                        ${cliente.nome}

                    </strong>

                    <br>

                    <small class="text-muted">

                        ${cliente.email || "-"}

                    </small>

                </td>

                <td>

                    ${cliente.telefone || "-"}

                </td>

                <td>

                    ${cliente.servico || "-"}

                </td>

                <td>

                    ${cliente.pacoteMensal
        ? '<span class="badge badge-success">Mensal</span>'
        : cliente.pacoteQuinzenal
          ? '<span class="badge badge-warning">Quinzenal</span>'
          : '<span class="badge badge-secondary">Avulso</span>'
      }

                </td>

                <td>

                    <button

                        class="btn btn-sm btn-outline-primary"

                        onclick="editarCliente(${cliente.id})">

                        <i class="fas fa-edit"></i>

                    </button>

                    <button

                        class="btn btn-sm btn-outline-danger ml-1"

                        onclick="excluirCliente(${cliente.id})">

                        <i class="fas fa-trash"></i>

                    </button>

                </td>

            </tr>

        `;

  });

}
async function salvarCliente(event) {

  event.preventDefault();

  const payload = {

    nome: form.nome.value.trim(),
    cpf: form.cpf.value.trim(),
    cnpj: form.cnpj.value.trim(),
    endereco: form.endereco.value.trim(),
    telefone: form.telefone.value.trim(),
    email: form.email.value.trim(),

    servico: form.servico.value.trim(),
    descricao: form.descricao.value.trim(),
    porteCachorro: form.porteCachorro.value,

    pacoteMensal: form.pacoteMensal.checked,
    pacoteQuinzenal: form.pacoteQuinzenal.checked,

    empresaId

  };

  try {

    const url = clienteEditando
      ? `${API}/${clienteEditando}`
      : API;

    const method = clienteEditando
      ? "PUT"
      : "POST";

    const resp = await fetch(url, {

      method,

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify(payload)

    });

    const data = await resp.json();

    if (!resp.ok) {

      alert(data.error || "Erro ao salvar cliente.");

      return;

    }

    modal.modal("hide");

    clienteEditando = null;

    form.reset();

    carregarClientes();

  } catch (err) {

    console.error(err);

    alert("Erro ao salvar cliente.");

  }

}

async function editarCliente(id) {

  const cliente = clientes.find(c => c.id === id);

  if (!cliente) return;

  clienteEditando = id;

  tituloModal.innerText = "Editar Cliente";

  form.nome.value = cliente.nome || "";
  form.cpf.value = cliente.cpf || "";
  form.cnpj.value = cliente.cnpj || "";
  form.endereco.value = cliente.endereco || "";
  form.telefone.value = cliente.telefone || "";
  form.email.value = cliente.email || "";

  form.servico.value = cliente.servico || "";
  form.descricao.value = cliente.descricao || "";
  form.porteCachorro.value = cliente.porteCachorro || "";

  form.pacoteMensal.checked = cliente.pacoteMensal;
  form.pacoteQuinzenal.checked = cliente.pacoteQuinzenal;

  modal.modal("show");

}

async function excluirCliente(id) {

  if (!confirm("Deseja realmente excluir este cliente?")) {

    return;

  }

  try {

    const resp = await fetch(`${API}/${id}`, {

      method: "DELETE"

    });

    const data = await resp.json();

    if (!resp.ok) {

      alert(data.error || "Erro ao excluir cliente.");

      return;

    }

    carregarClientes();

  } catch (err) {

    console.error(err);

    alert("Erro ao excluir cliente.");

  }

}

window.editarCliente = editarCliente;
window.excluirCliente = excluirCliente;