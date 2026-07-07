const API = `${API_BASE}/caixa`;
const API_CLIENTES = `${API_BASE}/clientes`;
const API_CATEGORIAS = `${API_BASE}/categorias`;
const API_CENTROS = `${API_BASE}/centros-custo`;
const API_DASHBOARD = `${API_BASE}/financeiro/dashboard`;

const usuarioLogado =
  JSON.parse(
    localStorage.getItem("usuarioLogado")
  );

const empresaId =
  usuarioLogado?.empresaId || 1;

const form =
  document.querySelector("#caixaForm");

const lista =
  document.querySelector("#listaOperacoes");

const filtroTipo =
  document.querySelector("#filtroTipo");

const filtroStatus =
  document.querySelector("#filtroStatus");

const filtroCliente =
  document.querySelector("#filtroCliente");

const inputInicio =
  document.querySelector("#filtroInicio");

const inputFim =
  document.querySelector("#filtroFim");

const btnLimparFiltros =
  document.querySelector("#btnLimparFiltros");

const selectCliente =
  document.querySelector("#clienteId");

const selectCategoria =
  document.querySelector("#categoriaId");

const selectCentroCusto =
  document.querySelector("#centroCustoId");

const elTotalEntradas =
  document.querySelector("#totalEntradas");

const elTotalSaidas =
  document.querySelector("#totalSaidas");

const elSaldoGeral =
  document.querySelector("#saldoGeral");

const elTotalPendentes =
  document.querySelector("#totalPendentes");

const elLucroVendas =
  document.querySelector("#lucroVendas");

const elTotalRegistros =
  document.querySelector("#totalRegistros");

let OPERACOES = [];
let CLIENTES = [];
let CATEGORIAS = [];
let CENTROS = [];

const fmtBRL = valor =>
  new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  ).format(
    Number(valor || 0)
  );

const somenteData = data => {
  if (!data) return "";
  return String(data).split("T")[0];
};

const formatarDataBR = data => {
  const d = somenteData(data);

  if (!d) return "—";

  return d
    .split("-")
    .reverse()
    .join("/");
};

const obterId = item =>
  item?.id ||
  item?.clienteid ||
  item?.categoriaid ||
  item?.centroCustoId ||
  item?.centrocustoid ||
  "";

const obterNome = item =>
  item?.nome ||
  item?.nomeCliente ||
  item?.razaoSocial ||
  item?.descricao ||
  "Sem nome";

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    garantirModalEdicao();

    if (form) {

      form.addEventListener(
        "submit",
        salvarOperacao
      );

    }

    [
      filtroTipo,
      filtroStatus,
      filtroCliente,
      inputInicio,
      inputFim
    ].forEach(campo => {

      campo?.addEventListener(
        "change",
        carregarOperacoes
      );

    });

    btnLimparFiltros?.addEventListener(
      "click",
      limparFiltros
    );

    await carregarDadosAuxiliares();

    await carregarDashboard();

    await carregarOperacoes();

  }
);

async function requestJson(url, options = {}) {

  const resp =
    await fetch(
      url,
      options
    );

  const data =
    await resp.json()
      .catch(() => null);

  if (!resp.ok) {

    throw new Error(
      data?.error ||
      data?.message ||
      "Erro na requisição."
    );

  }

  return data;

}

async function carregarDadosAuxiliares() {

  await Promise.all([
    carregarClientes(),
    carregarCategorias(),
    carregarCentrosCusto()
  ]);

}

async function carregarClientes() {

  try {

    CLIENTES =
      await requestJson(
        `${API_CLIENTES}?empresaId=${empresaId}`
      );

    preencherSelect(
      selectCliente,
      CLIENTES,
      "Sem cliente"
    );

    preencherSelect(
      filtroCliente,
      CLIENTES,
      "Todos"
    );

  } catch (error) {

    console.error(
      "Erro ao carregar clientes:",
      error
    );

  }

}

async function carregarCategorias() {

  try {

    CATEGORIAS =
      await requestJson(
        `${API_CATEGORIAS}?empresaId=${empresaId}`
      );

    preencherSelect(
      selectCategoria,
      CATEGORIAS,
      "Selecione..."
    );

  } catch (error) {

    console.error(
      "Erro ao carregar categorias:",
      error
    );

  }

}

async function carregarCentrosCusto() {

  try {

    CENTROS =
      await requestJson(
        `${API_CENTROS}?empresaId=${empresaId}`
      );

    preencherSelect(
      selectCentroCusto,
      CENTROS,
      "Selecione..."
    );

  } catch (error) {

    console.error(
      "Erro ao carregar centros de custo:",
      error
    );

  }

}

function preencherSelect(select, itens, textoInicial) {

  if (!select) return;

  select.innerHTML =
    `<option value="">${textoInicial}</option>`;

  itens.forEach(item => {

    const id =
      obterId(item);

    const nome =
      obterNome(item);

    if (!id) return;

    select.innerHTML += `
            <option value="${id}">
                ${nome}
            </option>
        `;

  });

}

function preencherSelectEdicao(selectId, itens, textoInicial) {

  const select =
    document.getElementById(selectId);

  preencherSelect(
    select,
    itens,
    textoInicial
  );

}

async function carregarDashboard() {

  try {

    const dados =
      await requestJson(
        `${API_DASHBOARD}?empresaId=${empresaId}`
      );

    if (elTotalEntradas) {

      elTotalEntradas.textContent =
        fmtBRL(
          dados.totalEntradas || 0
        );

    }

    if (elTotalSaidas) {

      elTotalSaidas.textContent =
        fmtBRL(
          dados.totalSaidas || 0
        );

    }

    if (elSaldoGeral) {

      elSaldoGeral.textContent =
        fmtBRL(
          dados.saldo || 0
        );

    }

    if (elLucroVendas) {

      elLucroVendas.textContent =
        fmtBRL(
          dados.lucroVendas || 0
        );

    }

    if (elTotalPendentes) {

      elTotalPendentes.textContent =
        dados.pendentes || 0;

    }

  } catch (error) {

    console.error(
      "Erro dashboard:",
      error
    );

  }

}

function montarPayloadFormulario(prefixo = "") {

  const get =
    id =>
      document.getElementById(
        `${prefixo}${id}`
      );

  return {

    empresaId,

    tipoOperacao:
      get("tipoOperacao")?.value || "",

    status:
      get("status")?.value || "PENDENTE",

    meioPagamento:
      get("meioPagamento")?.value || null,

    valor:
      parseFloat(
        get("valor")?.value || 0
      ),

    valorPago:
      get("valorPago")?.value
        ? parseFloat(
          get("valorPago").value
        )
        : null,

    dataOperacao:
      get("dataOperacao")?.value || null,

    dataVencimento:
      get("dataVencimento")?.value || null,

    clienteId:
      get("clienteId")?.value
        ? parseInt(
          get("clienteId").value
        )
        : null,

    categoriaId:
      get("categoriaId")?.value
        ? parseInt(
          get("categoriaId").value
        )
        : null,

    centroCustoId:
      get("centroCustoId")?.value
        ? parseInt(
          get("centroCustoId").value
        )
        : null,

    fornecedor:
      get("fornecedor")?.value || null,

    parcelas:
      parseInt(
        get("parcelas")?.value || 1
      ),

    recorrente:
      get("recorrente")?.value === "true",

    tipoRecorrencia:
      get("tipoRecorrencia")?.value || "NENHUMA",

    jurosMaquina:
      parseFloat(
        get("jurosMaquina")?.value || 0
      ),

    descricao:
      get("descricao")?.value || "",

    observacoes:
      get("observacoes")?.value || null

  };

}

async function salvarOperacao(e) {

  e.preventDefault();

  const payload =
    montarPayloadFormulario("");

  if (
    !payload.tipoOperacao ||
    !payload.valor ||
    payload.valor <= 0
  ) {

    alert(
      "Informe o tipo da operação e um valor maior que zero."
    );

    return;

  }

  try {

    await requestJson(
      API,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:
          JSON.stringify(
            payload
          )
      }
    );

    form.reset();

    $("#modalMovimentacao")
      .modal("hide");

    await carregarDashboard();

    await carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

async function carregarOperacoes() {

  if (!lista) return;

  lista.innerHTML =
    `<p class="text-muted">Carregando...</p>`;

  try {

    const dados =
      await requestJson(
        `${API}?empresaId=${empresaId}`
      );

    if (!Array.isArray(dados)) {

      throw new Error(
        "Erro ao carregar movimentações."
      );

    }

    OPERACOES =
      dados
        .map(op => ({

          ...op,

          clienteId:
            op.clienteId ||
            op.cliente?.id ||
            null,

          categoriaId:
            op.categoriaId ||
            op.categoria?.id ||
            null,

          centroCustoId:
            op.centroCustoId ||
            op.centroCusto?.id ||
            null,

          _data:
            somenteData(
              op.dataOperacao
            ),

          _ts:
            op.dataOperacao
              ? new Date(
                op.dataOperacao
              ).getTime()
              : 0

        }))
        .filter(op => {

          if (
            filtroTipo?.value &&
            op.tipoOperacao !== filtroTipo.value
          ) {

            return false;

          }

          if (
            filtroStatus?.value &&
            op.status !== filtroStatus.value
          ) {

            return false;

          }

          if (
            filtroCliente?.value &&
            String(op.clienteId || "") !== String(filtroCliente.value)
          ) {

            return false;

          }

          if (
            inputInicio?.value &&
            op._ts <
            new Date(
              inputInicio.value
            ).getTime()
          ) {

            return false;

          }

          if (
            inputFim?.value &&
            op._ts >
            (
              new Date(
                inputFim.value
              ).getTime() +
              86400000
            )
          ) {

            return false;

          }

          return true;

        })
        .sort(
          (a, b) =>
            b._ts - a._ts
        );

    if (!OPERACOES.length) {

      lista.innerHTML =
        `<p class="text-muted">Nenhuma movimentação encontrada.</p>`;

      atualizarTotais([]);

      atualizarTotalRegistros(0);

      return;

    }

    lista.innerHTML =
      OPERACOES
        .map(criarCard)
        .join("");

    atualizarTotais(
      OPERACOES
    );

    atualizarTotalRegistros(
      OPERACOES.length
    );

  } catch (error) {

    lista.innerHTML = `
            <p class="text-danger">
                ${error.message}
            </p>
        `;

  }

}

function atualizarTotalRegistros(total) {

  if (elTotalRegistros) {

    elTotalRegistros.textContent =
      `${total} registro${total === 1 ? "" : "s"}`;

  }

}

function criarCard(op) {

  const entrada = op.tipoOperacao === "ENTRADA";

  const corValor = entrada ? "text-success" : "text-danger";

  const icone = entrada
    ? "fa-arrow-down"
    : "fa-arrow-up";

  const corIcone = entrada
    ? "success"
    : "danger";

  const dataFmt = formatarDataBR(op.dataOperacao);

  const statusBadge = obterBadgeStatus(op.status);

  return `

<div class="col-xl-4 col-lg-6 mb-4">

    <div class="metric-card movimentacao-card">

        <div class="metric-top">

            <div>

                <div class="metric-label">

                    ${op.tipoOperacao}

                </div>

                <small class="text-muted">

                    ${op.meioPagamento || "-"}

                </small>

            </div>

            <div class="metric-icon metric-${corIcone}">

                <i class="fas ${icone}"></i>

            </div>

        </div>

        <div class="mt-3">

            ${statusBadge}

        </div>

        <div class="mt-3">

            <strong>

                ${op.descricao || "Sem descrição"}

            </strong>

        </div>

        <hr>

        <div class="row">

            <div class="col-6">

                <small class="text-muted">

                    Cliente

                </small>

                <div>

                    ${op.cliente?.nome || "-"}

                </div>

            </div>

            <div class="col-6">

                <small class="text-muted">

                    Categoria

                </small>

                <div>

                    ${op.categoria?.nome || "-"}

                </div>

            </div>

        </div>

        <div class="row mt-3">

            <div class="col-6">

                <small class="text-muted">

                    Centro

                </small>

                <div>

                    ${op.centroCusto?.nome || "-"}

                </div>

            </div>

            <div class="col-6">

                <small class="text-muted">

                    Fornecedor

                </small>

                <div>

                    ${op.fornecedor || "-"}

                </div>

            </div>

        </div>

        <div class="row mt-3">

            <div class="col-6">

                <small class="text-muted">

                    Parcela

                </small>

                <div>

                    ${op.parcelaAtual || 1}/${op.parcelas || 1}

                </div>

            </div>

            <div class="col-6">

                <small class="text-muted">

                    Data

                </small>

                <div>

                    ${dataFmt}

                </div>

            </div>

        </div>

        <div class="d-flex justify-content-between align-items-center mt-4">

            <div>

                <small class="text-muted">

                    Valor

                </small>

                <div class="metric-value ${corValor}" style="font-size:30px">

                    ${fmtBRL(op.valor)}

                </div>

            </div>

            <div class="btn-group-vertical">

                <button
                    class="btn btn-light mb-2"
                    onclick="abrirModalEdicao(${op.id})">

                    <i class="fas fa-edit"></i>

                </button>

                <button
                    class="btn btn-success mb-2"
                    onclick="marcarComoPaga(${op.id})">

                    <i class="fas fa-check"></i>

                </button>

                <button
                    class="btn btn-warning mb-2"
                    onclick="cancelarOperacao(${op.id})">

                    <i class="fas fa-ban"></i>

                </button>

                <button
                    class="btn btn-danger"
                    onclick="excluirOperacao(${op.id})">

                    <i class="fas fa-trash"></i>

                </button>

            </div>

        </div>

    </div>

</div>

`;

}

function obterBadgeStatus(status) {

  switch (status) {

    case "PAGO":

      return `
                <span class="badge badge-success">
                    Pago
                </span>
            `;

    case "ATRASADO":

      return `
                <span class="badge badge-danger">
                    Atrasado
                </span>
            `;

    case "CANCELADO":

      return `
                <span class="badge badge-secondary">
                    Cancelado
                </span>
            `;

    default:

      return `
                <span class="badge badge-warning">
                    Pendente
                </span>
            `;

  }

}

function limparFiltros() {

  if (filtroTipo) filtroTipo.value = "";
  if (filtroStatus) filtroStatus.value = "";
  if (filtroCliente) filtroCliente.value = "";
  if (inputInicio) inputInicio.value = "";
  if (inputFim) inputFim.value = "";

  carregarOperacoes();

}

function atualizarTotais(items) {

  const entradas =
    items
      .filter(
        i =>
          i.tipoOperacao === "ENTRADA"
      )
      .reduce(
        (acc, item) =>
          acc + Number(item.valor || 0),
        0
      );

  const saidas =
    items
      .filter(
        i =>
          i.tipoOperacao === "SAIDA"
      )
      .reduce(
        (acc, item) =>
          acc + Number(item.valor || 0),
        0
      );

  const pendentes =
    items
      .filter(
        i =>
          i.status === "PENDENTE"
      ).length;

  if (elTotalEntradas) {

    elTotalEntradas.textContent =
      fmtBRL(entradas);

  }

  if (elTotalSaidas) {

    elTotalSaidas.textContent =
      fmtBRL(saidas);

  }

  if (elSaldoGeral) {

    elSaldoGeral.textContent =
      fmtBRL(
        entradas - saidas
      );

  }

  if (elTotalPendentes) {

    elTotalPendentes.textContent =
      pendentes;

  }

}

function garantirModalEdicao() {

  if (
    document.querySelector(
      "#modalEdicaoCaixa"
    )
  ) {

    return;

  }

  const modal =
    document.createElement("div");

  modal.innerHTML = `

        <div
            class="modal fade"
            id="modalEdicaoCaixa"
            tabindex="-1"
            role="dialog">

            <div
                class="modal-dialog modal-xl modal-dialog-centered"
                role="document">

                <div class="modal-content">

                    <form id="formEditarOp" autocomplete="off">

                        <div class="modal-header">

                            <h5 class="modal-title">
                                Editar Movimentação
                            </h5>

                            <button
                                type="button"
                                class="close"
                                data-dismiss="modal">

                                <span>&times;</span>

                            </button>

                        </div>

                        <div class="modal-body">

                            <input
                                type="hidden"
                                id="edit_id">

                            <div class="form-row">

                                <div class="col-md-3 mb-3">
                                    <label>Tipo Operação</label>
                                    <select id="edit_tipoOperacao" class="form-control">
                                        <option value="ENTRADA">Entrada</option>
                                        <option value="SAIDA">Saída</option>
                                    </select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Status</label>
                                    <select id="edit_status" class="form-control">
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="PAGO">Pago</option>
                                        <option value="ATRASADO">Atrasado</option>
                                        <option value="CANCELADO">Cancelado</option>
                                    </select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Meio Pagamento</label>
                                    <select id="edit_meioPagamento" class="form-control">
                                        <option value="">Selecione...</option>
                                        <option value="PIX">Pix</option>
                                        <option value="CARTAO">Cartão</option>
                                        <option value="DINHEIRO">Dinheiro</option>
                                        <option value="BOLETO">Boleto</option>
                                        <option value="TRANSFERENCIA">Transferência</option>
                                    </select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Valor</label>
                                    <input type="number" step="0.01" id="edit_valor" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Valor Pago</label>
                                    <input type="number" step="0.01" id="edit_valorPago" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Data Operação</label>
                                    <input type="date" id="edit_dataOperacao" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Data Vencimento</label>
                                    <input type="date" id="edit_dataVencimento" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Cliente</label>
                                    <select id="edit_clienteId" class="form-control"></select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Categoria Financeira</label>
                                    <select id="edit_categoriaId" class="form-control"></select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Centro de Custo</label>
                                    <select id="edit_centroCustoId" class="form-control"></select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Fornecedor</label>
                                    <input type="text" id="edit_fornecedor" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Parcelas</label>
                                    <input type="number" min="1" id="edit_parcelas" class="form-control">
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Recorrente</label>
                                    <select id="edit_recorrente" class="form-control">
                                        <option value="false">Não</option>
                                        <option value="true">Sim</option>
                                    </select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Tipo Recorrência</label>
                                    <select id="edit_tipoRecorrencia" class="form-control">
                                        <option value="NENHUMA">Nenhuma</option>
                                        <option value="SEMANAL">Semanal</option>
                                        <option value="MENSAL">Mensal</option>
                                        <option value="ANUAL">Anual</option>
                                    </select>
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label>Juros Máquina</label>
                                    <input type="number" step="0.01" id="edit_jurosMaquina" class="form-control">
                                </div>

                                <div class="col-md-12 mb-3">
                                    <label>Descrição</label>
                                    <input type="text" id="edit_descricao" class="form-control">
                                </div>

                                <div class="col-md-12">
                                    <label>Observações</label>
                                    <textarea id="edit_observacoes" rows="3" class="form-control"></textarea>
                                </div>

                            </div>

                        </div>

                        <div class="modal-footer">

                            <button
                                type="button"
                                class="btn btn-light"
                                data-dismiss="modal">
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                class="btn btn-danger">
                                Salvar
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    `;

  document.body.appendChild(
    modal
  );

  document
    .querySelector("#formEditarOp")
    .addEventListener(
      "submit",
      salvarEdicaoOperacao
    );

}

async function abrirModalEdicao(id) {

  const op =
    OPERACOES.find(
      item =>
        Number(item.id) === Number(id)
    );

  if (!op) {

    alert(
      "Movimentação não encontrada."
    );

    return;

  }

  preencherSelectEdicao(
    "edit_clienteId",
    CLIENTES,
    "Sem cliente"
  );

  preencherSelectEdicao(
    "edit_categoriaId",
    CATEGORIAS,
    "Selecione..."
  );

  preencherSelectEdicao(
    "edit_centroCustoId",
    CENTROS,
    "Selecione..."
  );

  const clienteId =
    op.clienteId ||
    op.cliente?.id ||
    "";

  const categoriaId =
    op.categoriaId ||
    op.categoria?.id ||
    "";

  const centroCustoId =
    op.centroCustoId ||
    op.centroCusto?.id ||
    "";

  document.getElementById("edit_id").value =
    op.id || "";

  document.getElementById("edit_tipoOperacao").value =
    op.tipoOperacao || "ENTRADA";

  document.getElementById("edit_status").value =
    op.status || "PENDENTE";

  document.getElementById("edit_meioPagamento").value =
    op.meioPagamento || "";

  document.getElementById("edit_valor").value =
    op.valor ?? "";

  document.getElementById("edit_valorPago").value =
    op.valorPago ?? "";

  document.getElementById("edit_dataOperacao").value =
    somenteData(
      op.dataOperacao
    );

  document.getElementById("edit_dataVencimento").value =
    somenteData(
      op.dataVencimento
    );

  document.getElementById("edit_clienteId").value =
    clienteId ? String(clienteId) : "";

  document.getElementById("edit_categoriaId").value =
    categoriaId ? String(categoriaId) : "";

  document.getElementById("edit_centroCustoId").value =
    centroCustoId ? String(centroCustoId) : "";

  document.getElementById("edit_fornecedor").value =
    op.fornecedor || "";

  document.getElementById("edit_parcelas").value =
    op.parcelas || 1;

  document.getElementById("edit_recorrente").value =
    String(
      Boolean(op.recorrente)
    );

  document.getElementById("edit_tipoRecorrencia").value =
    op.tipoRecorrencia || "NENHUMA";

  document.getElementById("edit_jurosMaquina").value =
    op.jurosMaquina ?? 0;

  document.getElementById("edit_descricao").value =
    op.descricao || "";

  document.getElementById("edit_observacoes").value =
    op.observacoes || "";

  $("#modalEdicaoCaixa")
    .modal("show");

}

async function salvarEdicaoOperacao(e) {

  e.preventDefault();

  const id =
    document.getElementById(
      "edit_id"
    ).value;

  if (!id) {

    alert(
      "ID da movimentação não encontrado."
    );

    return;

  }

  const payload =
    montarPayloadFormulario(
      "edit_"
    );

  if (
    !payload.tipoOperacao ||
    !payload.valor ||
    payload.valor <= 0
  ) {

    alert(
      "Informe o tipo da operação e um valor maior que zero."
    );

    return;

  }

  try {

    await requestJson(
      `${API}/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body:
          JSON.stringify(
            payload
          )
      }
    );

    $("#modalEdicaoCaixa")
      .modal("hide");

    await carregarDashboard();

    await carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

async function marcarComoPaga(id) {

  if (
    !confirm(
      "Deseja marcar esta movimentação como paga?"
    )
  ) {

    return;

  }

  try {

    await requestJson(
      `${API}/${id}/pagar`,
      {
        method: "PUT"
      }
    );

    await carregarDashboard();

    await carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

async function cancelarOperacao(id) {

  if (
    !confirm(
      "Deseja cancelar este lançamento?"
    )
  ) {

    return;

  }

  try {

    await requestJson(
      `${API}/${id}/cancelar`,
      {
        method: "PUT"
      }
    );

    await carregarDashboard();

    await carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

async function excluirOperacao(id) {

  if (
    !confirm(
      "Deseja realmente excluir esta movimentação?"
    )
  ) {

    return;

  }

  try {

    await requestJson(
      `${API}/${id}`,
      {
        method: "DELETE"
      }
    );

    await carregarDashboard();

    await carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

window.abrirModalEdicao =
  abrirModalEdicao;

window.excluirOperacao =
  excluirOperacao;

window.marcarComoPaga =
  marcarComoPaga;

window.cancelarOperacao =
  cancelarOperacao;