const API_AGENDA = "https://cash-management-system.onrender.com/agenda";
const API_CLIENTES = "https://cash-management-system.onrender.com/clientes";

const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuario) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
}

const empresaId = usuario.empresaId;

const agendaForm = document.querySelector("#agendaForm");
const agendaId = document.querySelector("#agendaId");
const clienteId = document.querySelector("#clienteId");
const servico = document.querySelector("#servico");
const data = document.querySelector("#data");
const horario = document.querySelector("#horario");
const status = document.querySelector("#status");
const observacao = document.querySelector("#observacao");

const filtroBusca = document.querySelector("#filtroBusca");
const filtroStatus = document.querySelector("#filtroStatus");
const filtroCliente = document.querySelector("#filtroCliente");
const btnLimparFiltrosAgenda = document.querySelector("#btnLimparFiltrosAgenda");

const btnSemanaAnterior = document.querySelector("#btnSemanaAnterior");
const btnHoje = document.querySelector("#btnHoje");
const btnProximaSemana = document.querySelector("#btnProximaSemana");

const textoSemana = document.querySelector("#textoSemana");
const calendarHeader = document.querySelector("#calendarHeader");
const calendarGrid = document.querySelector("#calendarGrid");
const listaAgendaSemana = document.querySelector("#listaAgendaSemana");

const totalAgendados = document.querySelector("#totalAgendados");
const totalConcluidos = document.querySelector("#totalConcluidos");
const totalCancelados = document.querySelector("#totalCancelados");
const totalSemana = document.querySelector("#totalSemana");

const btnExcluirAgendamento = document.querySelector("#btnExcluirAgendamento");

const conteudoDetalhesAgenda = document.querySelector("#conteudoDetalhesAgenda");
const btnDetalheConcluir = document.querySelector("#btnDetalheConcluir");
const btnDetalheCancelar = document.querySelector("#btnDetalheCancelar");
const btnDetalheEditar = document.querySelector("#btnDetalheEditar");

let CLIENTES = [];
let AGENDAMENTOS = [];
let agendamentoSelecionado = null;
let dataReferenciaSemana = new Date();

const HORARIO_INICIO = 7;
const HORARIO_FIM = 21;
const ALTURA_HORA = 72;

document.addEventListener("DOMContentLoaded", () => {
    configurarEventos();
    carregarTudo();
});

function configurarEventos() {
    agendaForm?.addEventListener("submit", salvarAgendamento);

    btnSemanaAnterior?.addEventListener("click", () => {
        dataReferenciaSemana.setDate(dataReferenciaSemana.getDate() - 7);
        renderizarAgenda();
    });

    btnHoje?.addEventListener("click", () => {
        dataReferenciaSemana = new Date();
        renderizarAgenda();
    });

    btnProximaSemana?.addEventListener("click", () => {
        dataReferenciaSemana.setDate(dataReferenciaSemana.getDate() + 7);
        renderizarAgenda();
    });

    filtroBusca?.addEventListener("input", renderizarAgenda);
    filtroStatus?.addEventListener("change", renderizarAgenda);
    filtroCliente?.addEventListener("change", renderizarAgenda);

    btnLimparFiltrosAgenda?.addEventListener("click", () => {
        filtroBusca.value = "";
        filtroStatus.value = "";
        filtroCliente.value = "";
        renderizarAgenda();
    });

    btnExcluirAgendamento?.addEventListener("click", async () => {
        const id = Number(agendaId.value);
        if (!id) return;
        await excluirAgendamento(id);
    });

    btnDetalheConcluir?.addEventListener("click", async () => {
        if (!agendamentoSelecionado) return;
        await atualizarStatusAgendamento(agendamentoSelecionado.id, "CONCLUIDO");
        $("#modalDetalhesAgenda").modal("hide");
    });

    btnDetalheCancelar?.addEventListener("click", async () => {
        if (!agendamentoSelecionado) return;
        await atualizarStatusAgendamento(agendamentoSelecionado.id, "CANCELADO");
        $("#modalDetalhesAgenda").modal("hide");
    });

    btnDetalheEditar?.addEventListener("click", () => {
        if (!agendamentoSelecionado) return;
        $("#modalDetalhesAgenda").modal("hide");
        preencherFormularioEdicao(agendamentoSelecionado);
        $("#modalNovoAgendamento").modal("show");
    });

    $("#modalNovoAgendamento").on("hidden.bs.modal", limparFormulario);
}

async function carregarTudo() {
    await carregarClientes();
    await carregarAgenda();
}

async function carregarClientes() {
    try {
        const resp = await fetch(`${API_CLIENTES}?empresaId=${empresaId}`);
        const dados = await resp.json();

        CLIENTES = Array.isArray(dados) ? dados : [];

        clienteId.innerHTML = `<option value="">Selecione um cliente...</option>`;
        filtroCliente.innerHTML = `<option value="">Todos os clientes</option>`;

        CLIENTES.forEach((cliente) => {
            clienteId.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
            filtroCliente.innerHTML += `<option value="${cliente.id}">${cliente.nome}</option>`;
        });
    } catch (error) {
        console.error(error);
        alert("Erro ao carregar clientes.");
    }
}

async function carregarAgenda() {
    try {
        listaAgendaSemana.innerHTML = `<p class="text-muted">Carregando agendamentos...</p>`;

        const resp = await fetch(`${API_AGENDA}?empresaId=${empresaId}`);
        const dados = await resp.json();

        if (!Array.isArray(dados)) {
            AGENDAMENTOS = [];
        } else {
            AGENDAMENTOS = dados.map((item) => ({
                ...item,
                _data: item.data ? item.data.split("T")[0] : "",
                _clienteNome: item.cliente?.nome || buscarNomeCliente(item.clienteId),
                _status: item.status || "AGENDADO",
                _horario: item.horario || "00:00",
            }));
        }

        renderizarAgenda();
    } catch (error) {
        console.error(error);
        listaAgendaSemana.innerHTML = `<p class="text-danger">Erro ao carregar agenda.</p>`;
    }
}

async function salvarAgendamento(e) {
    e.preventDefault();

    const id = Number(agendaId.value);

    const payload = {
        clienteId: Number(clienteId.value),
        data: data.value,
        horario: horario.value,
        servico: servico.value.trim(),
        observacao: observacao.value.trim(),
        status: status.value,
        empresaId: Number(empresaId),
    };

    if (!payload.clienteId || !payload.data || !payload.horario || !payload.servico) {
        alert("Preencha cliente, serviço, data e horário.");
        return;
    }

    try {
        const url = id ? `${API_AGENDA}/${id}` : API_AGENDA;
        const method = id ? "PUT" : "POST";

        const resp = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const dados = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            alert(dados.error || "Erro ao salvar agendamento.");
            return;
        }

        $("#modalNovoAgendamento").modal("hide");
        await carregarAgenda();
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor.");
    }
}

async function atualizarStatusAgendamento(id, novoStatus) {
    try {
        const resp = await fetch(`${API_AGENDA}/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus }),
        });

        const dados = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            alert(dados.error || "Erro ao atualizar status.");
            return;
        }

        await carregarAgenda();
    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar status.");
    }
}

async function excluirAgendamento(id) {
    if (!confirm("Deseja realmente excluir este agendamento?")) return;

    try {
        const resp = await fetch(`${API_AGENDA}/${id}`, {
            method: "DELETE",
        });

        const dados = await resp.json().catch(() => ({}));

        if (!resp.ok) {
            alert(dados.error || "Erro ao excluir agendamento.");
            return;
        }

        $("#modalNovoAgendamento").modal("hide");
        $("#modalDetalhesAgenda").modal("hide");
        await carregarAgenda();
    } catch (error) {
        console.error(error);
        alert("Erro ao excluir agendamento.");
    }
}

function renderizarAgenda() {
    const diasSemana = obterDiasSemana(dataReferenciaSemana);
    const agendamentosFiltrados = aplicarFiltros(AGENDAMENTOS);
    const agendamentosDaSemana = agendamentosFiltrados.filter((item) =>
        diasSemana.some((dia) => formatarDataISO(dia) === item._data)
    );

    renderizarCabecalho(diasSemana);
    renderizarGrid(diasSemana, agendamentosDaSemana);
    renderizarListaSemana(agendamentosDaSemana);
    renderizarResumo(agendamentosDaSemana);
}

function renderizarCabecalho(diasSemana) {
    calendarHeader.innerHTML = "";

    const celulaHora = document.createElement("div");
    celulaHora.className = "calendar-header-time";
    celulaHora.innerHTML = `<i class="far fa-clock mr-1"></i> Horários`;
    calendarHeader.appendChild(celulaHora);

    const hojeISO = formatarDataISO(new Date());

    diasSemana.forEach((dia) => {
        const diaISO = formatarDataISO(dia);
        const head = document.createElement("div");
        head.className = "calendar-day-head";

        head.innerHTML = `
      <div class="calendar-day-name">${nomeDiaSemana(dia)}</div>
      <div class="calendar-day-number ${diaISO === hojeISO ? "today" : ""}">
        ${String(dia.getDate()).padStart(2, "0")}
      </div>
    `;

        calendarHeader.appendChild(head);
    });

    const primeiro = diasSemana[0];
    const ultimo = diasSemana[6];

    textoSemana.textContent = `${formatarDataBR(primeiro)} até ${formatarDataBR(ultimo)}`;
}

function renderizarGrid(diasSemana, eventos) {
    calendarGrid.innerHTML = "";

    const colunaHoras = document.createElement("div");
    colunaHoras.className = "calendar-hours";

    for (let hora = HORARIO_INICIO; hora < HORARIO_FIM; hora++) {
        const horaEl = document.createElement("div");
        horaEl.className = "calendar-hour";
        horaEl.textContent = `${String(hora).padStart(2, "0")}:00`;
        colunaHoras.appendChild(horaEl);
    }

    calendarGrid.appendChild(colunaHoras);

    diasSemana.forEach((dia) => {
        const diaISO = formatarDataISO(dia);

        const coluna = document.createElement("div");
        coluna.className = "calendar-day-column";
        coluna.style.height = `${(HORARIO_FIM - HORARIO_INICIO) * ALTURA_HORA}px`;

        const eventosDia = eventos
            .filter((evento) => evento._data === diaISO)
            .sort((a, b) => converterHorarioMinutos(a._horario) - converterHorarioMinutos(b._horario));

        eventosDia.forEach((evento, index) => {
            const eventoEl = criarElementoEvento(evento, index);
            coluna.appendChild(eventoEl);
        });

        calendarGrid.appendChild(coluna);
    });
}

function criarElementoEvento(evento, index) {
    const minutos = converterHorarioMinutos(evento._horario);
    const minutosInicio = HORARIO_INICIO * 60;
    const minutosFim = HORARIO_FIM * 60;

    let top = ((minutos - minutosInicio) / 60) * ALTURA_HORA;

    if (minutos < minutosInicio) top = 4;
    if (minutos > minutosFim) top = ((HORARIO_FIM - HORARIO_INICIO) * ALTURA_HORA) - 70;

    const altura = 58;
    const statusClass = classeStatusEvento(evento._status);

    const eventoEl = document.createElement("div");
    eventoEl.className = `calendar-event ${statusClass}`;
    eventoEl.style.top = `${top + (index % 2) * 6}px`;
    eventoEl.style.height = `${altura}px`;

    eventoEl.innerHTML = `
    <strong>${escapeHTML(evento.servico || "Serviço")}</strong>
    <span><i class="far fa-clock"></i> ${evento._horario}</span>
    <span><i class="fas fa-user"></i> ${escapeHTML(evento._clienteNome || "Cliente não informado")}</span>
  `;

    eventoEl.addEventListener("click", () => abrirDetalhes(evento));

    return eventoEl;
}

function renderizarListaSemana(eventos) {
    if (!eventos.length) {
        listaAgendaSemana.innerHTML = `<p class="text-muted">Nenhum agendamento encontrado nesta semana.</p>`;
        return;
    }

    const ordenados = [...eventos].sort((a, b) => {
        const dataA = `${a._data}T${a._horario}`;
        const dataB = `${b._data}T${b._horario}`;
        return new Date(dataA) - new Date(dataB);
    });

    listaAgendaSemana.innerHTML = ordenados.map((item) => {
        return `
      <div class="agenda-list-item">
        <div class="d-flex justify-content-between align-items-start flex-wrap">
          <div>
            <h6 class="font-weight-bold text-dark mb-1">
              ${escapeHTML(item.servico || "Serviço")}
            </h6>
            <p class="mb-1 small text-muted">
              <i class="far fa-calendar-alt mr-1"></i> ${formatarDataBR(item._data)}
              <span class="mx-1">•</span>
              <i class="far fa-clock mr-1"></i> ${item._horario}
            </p>
            <p class="mb-1 small text-muted">
              <i class="fas fa-user mr-1"></i> ${escapeHTML(item._clienteNome || "Cliente não informado")}
            </p>
            <p class="mb-0 small text-muted">
              <i class="fas fa-align-left mr-1"></i> ${escapeHTML(item.observacao || "Sem observações")}
            </p>
          </div>

          <div class="text-right mt-2 mt-md-0">
            <span class="badge-status ${classeBadgeStatus(item._status)}">${item._status}</span>
            <div class="mt-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="abrirDetalhesPorId(${item.id})">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-warning" onclick="editarAgendamentoPorId(${item.id})">
                <i class="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    }).join("");
}

function renderizarResumo(eventos) {
    const agendados = eventos.filter((e) => e._status === "AGENDADO").length;
    const concluidos = eventos.filter((e) => e._status === "CONCLUIDO").length;
    const cancelados = eventos.filter((e) => e._status === "CANCELADO").length;

    totalAgendados.textContent = agendados;
    totalConcluidos.textContent = concluidos;
    totalCancelados.textContent = cancelados;
    totalSemana.textContent = eventos.length;
}

function aplicarFiltros(lista) {
    const busca = (filtroBusca.value || "").toLowerCase().trim();
    const statusSelecionado = filtroStatus.value;
    const clienteSelecionado = filtroCliente.value;

    return lista.filter((item) => {
        const texto = `
      ${item.servico || ""}
      ${item.observacao || ""}
      ${item._clienteNome || ""}
      ${item._status || ""}
    `.toLowerCase();

        if (busca && !texto.includes(busca)) return false;
        if (statusSelecionado && item._status !== statusSelecionado) return false;
        if (clienteSelecionado && String(item.clienteId) !== String(clienteSelecionado)) return false;

        return true;
    });
}

function abrirDetalhes(evento) {
    agendamentoSelecionado = evento;

    conteudoDetalhesAgenda.innerHTML = `
    <div class="mb-3">
      <span class="badge-status ${classeBadgeStatus(evento._status)}">${evento._status}</span>
    </div>

    <h5 class="font-weight-bold text-dark mb-2">${escapeHTML(evento.servico || "Serviço")}</h5>

    <p class="mb-2">
      <strong>Cliente:</strong><br>
      ${escapeHTML(evento._clienteNome || "Cliente não informado")}
    </p>

    <p class="mb-2">
      <strong>Data e horário:</strong><br>
      ${formatarDataBR(evento._data)} às ${evento._horario}
    </p>

    <p class="mb-0">
      <strong>Observação:</strong><br>
      ${escapeHTML(evento.observacao || "Sem observações")}
    </p>
  `;

    $("#modalDetalhesAgenda").modal("show");
}

function abrirDetalhesPorId(id) {
    const item = AGENDAMENTOS.find((a) => Number(a.id) === Number(id));
    if (!item) return alert("Agendamento não encontrado.");
    abrirDetalhes(item);
}

function editarAgendamentoPorId(id) {
    const item = AGENDAMENTOS.find((a) => Number(a.id) === Number(id));
    if (!item) return alert("Agendamento não encontrado.");
    preencherFormularioEdicao(item);
    $("#modalNovoAgendamento").modal("show");
}

function preencherFormularioEdicao(item) {
    agendaId.value = item.id;
    clienteId.value = item.clienteId || "";
    servico.value = item.servico || "";
    data.value = item._data || "";
    horario.value = item._horario || "";
    status.value = item._status || "AGENDADO";
    observacao.value = item.observacao || "";

    btnExcluirAgendamento.classList.remove("d-none");
    document.querySelector("#modalNovoAgendamentoLabel").innerHTML =
        `<i class="fas fa-edit text-danger mr-2"></i> Editar agendamento`;
}

function limparFormulario() {
    agendaForm.reset();
    agendaId.value = "";
    status.value = "AGENDADO";
    btnExcluirAgendamento.classList.add("d-none");
    document.querySelector("#modalNovoAgendamentoLabel").innerHTML =
        `<i class="fas fa-calendar-plus text-danger mr-2"></i> Novo agendamento`;
}

function obterDiasSemana(dataBase) {
    const base = new Date(dataBase);
    const diaSemana = base.getDay();
    const domingo = new Date(base);

    domingo.setDate(base.getDate() - diaSemana);
    domingo.setHours(0, 0, 0, 0);

    const dias = [];

    for (let i = 0; i < 7; i++) {
        const dia = new Date(domingo);
        dia.setDate(domingo.getDate() + i);
        dias.push(dia);
    }

    return dias;
}

function buscarNomeCliente(id) {
    const cliente = CLIENTES.find((c) => Number(c.id) === Number(id));
    return cliente?.nome || "";
}

function converterHorarioMinutos(hora) {
    if (!hora || !hora.includes(":")) return 0;
    const [h, m] = hora.split(":").map(Number);
    return (h * 60) + (m || 0);
}

function formatarDataISO(dataObj) {
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
    const dia = String(dataObj.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function formatarDataBR(dataValor) {
    if (!dataValor) return "—";

    if (dataValor instanceof Date) {
        return dataValor.toLocaleDateString("pt-BR");
    }

    if (typeof dataValor === "string" && dataValor.includes("-")) {
        const [ano, mes, dia] = dataValor.split("T")[0].split("-");
        return `${dia}/${mes}/${ano}`;
    }

    return dataValor;
}

function nomeDiaSemana(dataObj) {
    return dataObj.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function classeStatusEvento(status) {
    if (status === "CONCLUIDO") return "event-concluido";
    if (status === "CANCELADO") return "event-cancelado";
    return "event-agendado";
}

function classeBadgeStatus(status) {
    if (status === "CONCLUIDO") return "badge-concluido";
    if (status === "CANCELADO") return "badge-cancelado";
    return "badge-agendado";
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}