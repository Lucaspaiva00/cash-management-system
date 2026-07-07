// ======================================================
// CONFIGURAÇÕES
// ======================================================

const API = `${API_BASE}/propostas`;

const API_CLIENTES = `${API_BASE}/clientes`;

const usuario =
  JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {

  alert("Sessão expirada.");

  window.location.href = "login.html";

}

const empresaId =
  usuario.empresaId;

// ======================================================
// ELEMENTOS
// ======================================================

const form =
  document.querySelector("#formProposta");

const tabela =
  document.querySelector("#propostasCadastrados");

const buscar =
  document.querySelector("#buscarProposta");

const clienteSelect =
  document.querySelector("#clienteId");

let listaPropostas = [];

let editandoId = null;

// ======================================================
// HELPERS
// ======================================================

function moeda(valor) {

  return new Intl.NumberFormat(

    "pt-BR",

    {

      style: "currency",

      currency: "BRL"

    }

  ).format(Number(valor || 0));

}

function numero(v) {

  return Number(v || 0);

}

function toast(msg, tipo = "success") {

  const cores = {

    success: "#22c55e",

    error: "#ef4444",

    warning: "#f59e0b",

    info: "#2563eb"

  };

  const div =
    document.createElement("div");

  div.innerHTML = msg;

  Object.assign(div.style, {

    position: "fixed",

    right: "25px",

    bottom: "25px",

    background: cores[tipo],

    color: "#fff",

    padding: "12px 22px",

    borderRadius: "10px",

    fontWeight: "600",

    zIndex: 99999,

    boxShadow: "0 10px 25px rgba(0,0,0,.2)"

  });

  document.body.appendChild(div);

  setTimeout(() => {

    div.remove();

  }, 3000);

}

// ======================================================
// EVENTOS
// ======================================================

document.addEventListener(

  "DOMContentLoaded",

  () => {

    carregarClientes();

    carregarPropostas();

    form.addEventListener(

      "submit",

      salvarProposta

    );

    if (buscar) {

      buscar.addEventListener(

        "keyup",

        pesquisarPropostas

      );

    }

  }

);
// ======================================================
// KPIs
// ======================================================

function atualizarKPIs(propostas) {

  const total =
    propostas.length;

  const abertas =
    propostas
      .filter(p => (p.status || "").toLowerCase() === "aberto")
      .reduce((s, p) => s + numero(p.valorTotal), 0);

  const fechadas =
    propostas
      .filter(p => (p.status || "").toLowerCase() === "fechado")
      .reduce((s, p) => s + numero(p.valorTotal), 0);

  document.querySelector("#kpiTotalPropostas").innerHTML =
    total;

  document.querySelector("#kpiAberto").innerHTML =
    moeda(abertas);

  document.querySelector("#kpiFechado").innerHTML =
    moeda(fechadas);

  document.querySelector("#kpiTotalGeral").innerHTML =
    moeda(abertas + fechadas);

}

// ======================================================
// CARREGAR CLIENTES
// ======================================================

async function carregarClientes() {

  try {

    const resposta =
      await fetch(

        `${API_CLIENTES}?empresaId=${empresaId}`

      );

    const clientes =
      await resposta.json();

    clienteSelect.innerHTML = `

      <option value="">

        Selecione...

      </option>

    `;

    clientes.forEach(cliente => {

      clienteSelect.innerHTML += `

        <option value="${cliente.id}">

          ${cliente.nome}

        </option>

      `;

    });

  }

  catch (erro) {

    console.error(erro);

  }

}

// ======================================================
// LISTAR PROPOSTAS
// ======================================================

async function carregarPropostas() {

  tabela.innerHTML = `

      <tr>

        <td colspan="6"

            class="text-center py-4">

          Carregando...

        </td>

      </tr>

  `;

  try {

    const resposta =
      await fetch(

        `${API}?empresaId=${empresaId}`

      );

    listaPropostas =
      await resposta.json();

    if (!Array.isArray(listaPropostas)) {

      listaPropostas = [];

    }

    atualizarKPIs(

      listaPropostas

    );

    renderizarTabela(

      listaPropostas

    );

  }

  catch (erro) {

    console.error(erro);

    tabela.innerHTML = `

      <tr>

        <td colspan="6"

            class="text-center text-danger py-4">

          Erro ao carregar propostas.

        </td>

      </tr>

    `;

  }

}

// ======================================================
// SALVAR PROPOSTA
// ======================================================

async function salvarProposta(e) {

  e.preventDefault();

  const payload = {

    numero: parseInt(form.numero.value),

    data: form.data.value || null,

    descricao: form.descricao.value.trim(),

    valorTotal: numero(form.valorTotal.value),

    status: form.status.value,

    validade: form.validade?.value || null,

    formaPagamento: form.formaPagamento?.value || "",

    parcelas: parseInt(form.parcelas?.value || 1),

    observacoes: form.observacoes?.value || "",

    clienteId:

      form.clienteId.value

        ? parseInt(form.clienteId.value)

        : null,

    empresaId

  };

  try {

    const resposta = await fetch(

      editandoId

        ? `${API}/${editandoId}`

        : API,

      {

        method:

          editandoId

            ? "PUT"

            : "POST",

        headers: {

          "Content-Type": "application/json"

        },

        body: JSON.stringify(payload)

      }

    );

    const json =
      await resposta.json();

    if (!resposta.ok) {

      throw new Error(

        json.error ||

        "Erro ao salvar."

      );

    }

    toast(

      editandoId

        ? "Proposta atualizada."

        : "Proposta cadastrada."

    );

    form.reset();

    editandoId = null;

    $("#modalProposta").modal("hide");

    carregarPropostas();

  }

  catch (erro) {

    console.error(erro);

    toast(

      erro.message,

      "error"

    );

  }

}

// ======================================================
// TABELA
// ======================================================

function renderizarTabela(propostas) {

  if (!propostas.length) {

    tabela.innerHTML = `

      <tr>

        <td colspan="6"

            class="text-center py-5">

          Nenhuma proposta encontrada.

        </td>

      </tr>

    `;

    return;

  }

  tabela.innerHTML = propostas.map(p => {

    const badge =

      (p.status || "").toLowerCase() == "fechado"

        ? '<span class="badge badge-success">Fechado</span>'

        : '<span class="badge badge-warning">Aberto</span>';

    return `

      <tr>

        <td>

          ${p.numero}

        </td>

        <td>

          ${p.cliente?.nome || "-"}

        </td>

        <td>

          ${p.descricao}

        </td>

        <td>

          ${badge}

        </td>

        <td>

          ${moeda(p.valorTotal)}

        </td>

        <td>

          <button

            class="btn btn-warning btn-sm mr-1"

            onclick="editarProposta(${p.id})">

            <i class="fas fa-edit"></i>

          </button>

          <button

            class="btn btn-danger btn-sm"

            onclick="excluirProposta(${p.id})">

            <i class="fas fa-trash"></i>

          </button>

        </td>

      </tr>

    `;

  }).join("");

}

// ======================================================
// PESQUISA
// ======================================================

function pesquisarPropostas() {

  const texto =

    buscar.value

      .toLowerCase()

      .trim();

  const lista =

    listaPropostas.filter(p =>

      String(p.numero)

        .includes(texto)

      ||

      (p.descricao || "")

        .toLowerCase()

        .includes(texto)

      ||

      (p.cliente?.nome || "")

        .toLowerCase()

        .includes(texto)

    );

  renderizarTabela(lista);

}

// ======================================================
// EDITAR
// ======================================================

function editarProposta(id) {

  const proposta =

    listaPropostas.find(

      p => p.id === id

    );

  if (!proposta)

    return;

  editandoId = id;

  Object.keys(proposta).forEach(campo => {

    if (form[campo]) {

      form[campo].value =

        proposta[campo] ?? "";

    }

  });

  if (proposta.clienteId) {

    form.clienteId.value =

      proposta.clienteId;

  }

  $("#modalProposta").modal("show");

}

// ======================================================
// EXCLUIR
// ======================================================

async function excluirProposta(id) {

  if (!confirm("Deseja excluir esta proposta?"))

    return;

  try {

    const resposta = await fetch(

      `${API}/${id}`,

      {

        method: "DELETE"

      }

    );

    const json =
      await resposta.json();

    if (!resposta.ok) {

      throw new Error(

        json.error ||

        "Erro ao excluir."

      );

    }

    toast(

      "Proposta excluída."

    );

    carregarPropostas();

  }

  catch (erro) {

    console.error(erro);

    toast(

      erro.message,

      "error"

    );

  }

}

// ======================================================
// GLOBAIS
// ======================================================

window.editarProposta =
  editarProposta;

window.excluirProposta =
  excluirProposta;