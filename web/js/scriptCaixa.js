const API = "https://cash-management-system.onrender.com/caixa";
const API_CLIENTES = "https://cash-management-system.onrender.com/clientes";
const API_CATEGORIAS = "https://cash-management-system.onrender.com/categorias";
const API_CENTROS = "https://cash-management-system.onrender.com/centros-custo";
const API_DASHBOARD = "https://cash-management-system.onrender.com/financeiro/dashboard";

const empresaId =
  JSON.parse(
    localStorage.getItem(
      "usuarioLogado"
    )
  )?.empresaId || 1;

const form =
  document.querySelector(
    "#caixaForm"
  );

const lista =
  document.querySelector(
    "#listaOperacoes"
  );

const filtroTipo =
  document.querySelector(
    "#filtroTipo"
  );

const inputInicio =
  document.querySelector(
    "#filtroInicio"
  );

const inputFim =
  document.querySelector(
    "#filtroFim"
  );

const btnLimparFiltros =
  document.querySelector(
    "#btnLimparFiltros"
  );

const selectCliente =
  document.querySelector(
    "#clienteId"
  );

const selectCategoria =
  document.querySelector(
    "#categoriaId"
  );

const selectCentroCusto =
  document.querySelector(
    "#centroCustoId"
  );

const elTotalEntradas =
  document.querySelector(
    "#totalEntradas"
  );

const elTotalSaidas =
  document.querySelector(
    "#totalSaidas"
  );

const elSaldoGeral =
  document.querySelector(
    "#saldoGeral"
  );

const elTotalPendentes =
  document.querySelector(
    "#totalPendentes"
  );

let OPERACOES = [];

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

document.addEventListener(
  "DOMContentLoaded",
  () => {

    if (form) {

      form.addEventListener(
        "submit",
        salvarOperacao
      );

    }

    [
      filtroTipo,
      inputInicio,
      inputFim
    ].forEach(el => {

      el?.addEventListener(
        "change",
        carregarOperacoes
      );

    });

    btnLimparFiltros?.addEventListener(
      "click",
      limparFiltros
    );

    garantirModalEdicao();

    carregarClientes();

    carregarCategorias();

    carregarCentrosCusto();

    carregarDashboard();

    carregarOperacoes();

  }
);

async function carregarClientes() {

  try {

    const resp =
      await fetch(
        `${API_CLIENTES}?empresaId=${empresaId}`
      );

    const clientes =
      await resp.json();

    if (!selectCliente)
      return;

    selectCliente.innerHTML =
      `<option value="">Sem cliente</option>`;

    clientes.forEach(cliente => {

      selectCliente.innerHTML += `
                <option value="${cliente.id}">
                    ${cliente.nome}
                </option>
            `;

    });

  } catch (error) {

    console.error(
      "Erro clientes:",
      error
    );

  }

}

async function carregarCategorias() {

  try {

    if (!selectCategoria)
      return;

    const resp =
      await fetch(
        `${API_CATEGORIAS}?empresaId=${empresaId}`
      );

    const categorias =
      await resp.json();

    selectCategoria.innerHTML =
      `<option value="">Selecione...</option>`;

    categorias.forEach(cat => {

      selectCategoria.innerHTML += `
                <option value="${cat.id}">
                    ${cat.nome}
                </option>
            `;

    });

  } catch (error) {

    console.error(
      "Erro categorias:",
      error
    );

  }

}

async function carregarCentrosCusto() {

  try {

    if (!selectCentroCusto)
      return;

    const resp =
      await fetch(
        `${API_CENTROS}?empresaId=${empresaId}`
      );

    const centros =
      await resp.json();

    selectCentroCusto.innerHTML =
      `<option value="">Selecione...</option>`;

    centros.forEach(centro => {

      selectCentroCusto.innerHTML += `
                <option value="${centro.id}">
                    ${centro.nome}
                </option>
            `;

    });

  } catch (error) {

    console.error(
      "Erro centros:",
      error
    );

  }

}

async function carregarDashboard() {

  try {

    const resp =
      await fetch(
        `${API_DASHBOARD}?empresaId=${empresaId}`
      );

    const dados =
      await resp.json();

    if (elTotalEntradas) {

      elTotalEntradas.textContent =
        fmtBRL(
          dados.totalEntradas
        );

    }

    if (elTotalSaidas) {

      elTotalSaidas.textContent =
        fmtBRL(
          dados.totalSaidas
        );

    }

    if (elSaldoGeral) {

      elSaldoGeral.textContent =
        fmtBRL(
          dados.saldo
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

async function salvarOperacao(e) {

  e.preventDefault();

  const payload = {

    empresaId,

    tipoOperacao:
      form.tipoOperacao.value,

    status:
      form.status?.value ||
      "PENDENTE",

    meioPagamento:
      form.meioPagamento.value,

    descricao:
      form.descricao.value,

    observacoes:
      form.observacoes?.value ||
      null,

    valor:
      parseFloat(
        form.valor.value
      ),

    valorPago:
      form.valorPago?.value
        ? parseFloat(
          form.valorPago.value
        )
        : null,

    dataOperacao:
      form.dataOperacao.value,

    dataVencimento:
      form.dataVencimento?.value ||
      null,

    clienteId:
      form.clienteId.value
        ? parseInt(
          form.clienteId.value
        )
        : null,

    categoriaId:
      form.categoriaId?.value
        ? parseInt(
          form.categoriaId.value
        )
        : null,

    centroCustoId:
      form.centroCustoId?.value
        ? parseInt(
          form.centroCustoId.value
        )
        : null,

    fornecedor:
      form.fornecedor?.value ||
      null,

    parcelas:
      parseInt(
        form.parcelas?.value || 1
      ),

    recorrente:
      form.recorrente?.value === "true",

    tipoRecorrencia:
      form.tipoRecorrencia?.value ||
      "NENHUMA",

    jurosMaquina:
      parseFloat(
        form.jurosMaquina?.value || 0
      )
  };

  try {

    const resp =
      await fetch(
        API,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

    if (!resp.ok) {

      throw new Error(
        "Erro ao salvar movimentação."
      );

    }

    form.reset();

    carregarDashboard();

    carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

async function carregarOperacoes() {

  lista.innerHTML =
    `<p class="text-muted">Carregando...</p>`;

  try {

    const resp =
      await fetch(
        `${API}?empresaId=${empresaId}`
      );

    const dados =
      await resp.json();

    if (!Array.isArray(dados)) {

      throw new Error(
        "Erro ao carregar movimentações."
      );

    }

    OPERACOES =
      dados
        .map(op => ({

          ...op,

          _data:
            op.dataOperacao
              ? op.dataOperacao.split("T")[0]
              : "",

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

      return;

    }

    lista.innerHTML =
      OPERACOES
        .map(criarCard)
        .join("");

    atualizarTotais(
      OPERACOES
    );

  } catch (error) {

    lista.innerHTML = `
            <p class="text-danger">
                ${error.message}
            </p>
        `;

  }

}

function criarCard(op) {

  const entrada =
    op.tipoOperacao ===
    "ENTRADA";

  const classe =
    entrada
      ? "entrada"
      : "saida";

  const corValor =
    entrada
      ? "text-success"
      : "text-danger";

  const dataFmt =
    op._data
      ? op._data
        .split("-")
        .reverse()
        .join("/")
      : "—";

  const statusBadge =
    obterBadgeStatus(
      op.status
    );

  return `

        <div class="card-op ${classe}">

            <div class="d-flex justify-content-between">

                <div>

                    <h6 class="mb-1">

                        ${op.tipoOperacao}

                    </h6>

                    <p class="small text-muted mb-1">

                        ${op.meioPagamento || "-"}

                        •

                        ${dataFmt}

                    </p>

                    ${statusBadge}

                    <p class="mt-2 mb-1">

                        ${op.descricao || "-"}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Cliente:</strong>

                        ${op.cliente?.nome || "-"}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Categoria:</strong>

                        ${op.categoria?.nome || "-"}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Centro:</strong>

                        ${op.centroCusto?.nome || "-"}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Fornecedor:</strong>

                        ${op.fornecedor || "-"}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Parcela:</strong>

                        ${op.parcelaAtual || 1}/${op.parcelas || 1}

                    </p>

                    <p class="small text-muted mb-1">

                        <strong>Juros:</strong>

                        ${fmtBRL(
    op.jurosMaquina
  )}

                    </p>

                    <strong class="${corValor}">

                        ${fmtBRL(
    op.valor
  )}

                    </strong>

                </div>

                <div class="text-right">

                    <button
                        class="btn btn-sm btn-outline-secondary mb-2"
                        onclick="abrirModalEdicao(${op.id})">

                        <i class="fas fa-edit"></i>

                    </button>

                    <br>

                    <button
                        class="btn btn-sm btn-outline-success mb-2"
                        onclick="marcarComoPaga(${op.id})">

                        <i class="fas fa-check"></i>

                    </button>

                    <br>

                    <button
                        class="btn btn-sm btn-outline-warning mb-2"
                        onclick="cancelarOperacao(${op.id})">

                        <i class="fas fa-ban"></i>

                    </button>

                    <br>

                    <button
                        class="btn btn-sm btn-outline-danger"
                        onclick="excluirOperacao(${op.id})">

                        <i class="fas fa-trash"></i>

                    </button>

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

async function marcarComoPaga(id) {

  if (
    !confirm(
      "Deseja marcar esta movimentação como paga?"
    )
  ) {

    return;

  }

  try {

    const resp =
      await fetch(
        `${API}/${id}/pagar`,
        {
          method: "PUT"
        }
      );

    if (!resp.ok) {

      throw new Error(
        "Erro ao marcar como paga."
      );

    }

    carregarDashboard();

    carregarOperacoes();

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

    const resp =
      await fetch(
        `${API}/${id}/cancelar`,
        {
          method: "PUT"
        }
      );

    if (!resp.ok) {

      throw new Error(
        "Erro ao cancelar lançamento."
      );

    }

    carregarDashboard();

    carregarOperacoes();

  } catch (error) {

    alert(
      error.message
    );

  }

}

function limparFiltros() {

  if (filtroTipo)
    filtroTipo.value = "";

  if (inputInicio)
    inputInicio.value = "";

  if (inputFim)
    inputFim.value = "";

  carregarOperacoes();

}

function atualizarTotais(items) {

  const entradas =
    items
      .filter(
        i =>
          i.tipoOperacao ===
          "ENTRADA"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.valor
          ),
        0
      );

  const saidas =
    items
      .filter(
        i =>
          i.tipoOperacao ===
          "SAIDA"
      )
      .reduce(
        (a, b) =>
          a +
          Number(
            b.valor
          ),
        0
      );

  if (elTotalEntradas) {

    elTotalEntradas.textContent =
      fmtBRL(
        entradas
      );

  }

  if (elTotalSaidas) {

    elTotalSaidas.textContent =
      fmtBRL(
        saidas
      );

  }

  if (elSaldoGeral) {

    elSaldoGeral.textContent =
      fmtBRL(
        entradas -
        saidas
      );

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
    document.createElement(
      "div"
    );

  modal.innerHTML = `

        <div class="modal fade"
            id="modalEdicaoCaixa"
            tabindex="-1"
            role="dialog">

            <div class="modal-dialog modal-lg modal-dialog-centered">

                <div class="modal-content">

                    <form id="formEditarOp">

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

                                <div class="col-md-4 mb-2">

                                    <label>Tipo</label>

                                    <select
                                        id="edit_tipoOperacao"
                                        class="form-control">

                                        <option value="ENTRADA">
                                            Entrada
                                        </option>

                                        <option value="SAIDA">
                                            Saída
                                        </option>

                                    </select>

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Status</label>

                                    <select
                                        id="edit_status"
                                        class="form-control">

                                        <option value="PENDENTE">
                                            Pendente
                                        </option>

                                        <option value="PAGO">
                                            Pago
                                        </option>

                                        <option value="ATRASADO">
                                            Atrasado
                                        </option>

                                        <option value="CANCELADO">
                                            Cancelado
                                        </option>

                                    </select>

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Pagamento</label>

                                    <select
                                        id="edit_meioPagamento"
                                        class="form-control">

                                        <option value="PIX">
                                            Pix
                                        </option>

                                        <option value="CARTAO">
                                            Cartão
                                        </option>

                                        <option value="DINHEIRO">
                                            Dinheiro
                                        </option>

                                        <option value="BOLETO">
                                            Boleto
                                        </option>

                                        <option value="TRANSFERENCIA">
                                            Transferência
                                        </option>

                                    </select>

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Valor</label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        id="edit_valor"
                                        class="form-control">

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Valor Pago</label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        id="edit_valorPago"
                                        class="form-control">

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Data Operação</label>

                                    <input
                                        type="date"
                                        id="edit_dataOperacao"
                                        class="form-control">

                                </div>

                                <div class="col-md-4 mb-2">

                                    <label>Data Vencimento</label>

                                    <input
                                        type="date"
                                        id="edit_dataVencimento"
                                        class="form-control">

                                </div>

                                <div class="col-md-8 mb-2">

                                    <label>Fornecedor</label>

                                    <input
                                        type="text"
                                        id="edit_fornecedor"
                                        class="form-control">

                                </div>

                                <div class="col-md-12">

                                    <label>Descrição</label>

                                    <input
                                        type="text"
                                        id="edit_descricao"
                                        class="form-control">

                                </div>

                                <div class="col-md-12 mt-2">

                                    <label>Observações</label>

                                    <textarea
                                        id="edit_observacoes"
                                        rows="3"
                                        class="form-control"></textarea>

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
    .querySelector(
      "#formEditarOp"
    )
    .addEventListener(
      "submit",
      salvarEdicaoOperacao
    );

}

function abrirModalEdicao(id) {

  const op =
    OPERACOES.find(
      item =>
        item.id === id
    );

  if (!op) {

    alert(
      "Movimentação não encontrada."
    );

    return;

  }

  document.querySelector("#edit_id").value =
    op.id;

  document.querySelector("#edit_tipoOperacao").value =
    op.tipoOperacao || "";

  document.querySelector("#edit_status").value =
    op.status || "PENDENTE";

  document.querySelector("#edit_meioPagamento").value =
    op.meioPagamento || "";

  document.querySelector("#edit_valor").value =
    op.valor || 0;

  document.querySelector("#edit_valorPago").value =
    op.valorPago || "";

  document.querySelector("#edit_dataOperacao").value =
    op._data || "";

  document.querySelector("#edit_dataVencimento").value =
    op.dataVencimento
      ? op.dataVencimento.split("T")[0]
      : "";

  document.querySelector("#edit_fornecedor").value =
    op.fornecedor || "";

  document.querySelector("#edit_descricao").value =
    op.descricao || "";

  document.querySelector("#edit_observacoes").value =
    op.observacoes || "";

  $("#modalEdicaoCaixa").modal(
    "show"
  );

}

async function salvarEdicaoOperacao(e) {

  e.preventDefault();

  const id =
    document.querySelector(
      "#edit_id"
    ).value;

  const payload = {

    tipoOperacao:
      document.querySelector(
        "#edit_tipoOperacao"
      ).value,

    status:
      document.querySelector(
        "#edit_status"
      ).value,

    meioPagamento:
      document.querySelector(
        "#edit_meioPagamento"
      ).value,

    valor:
      parseFloat(
        document.querySelector(
          "#edit_valor"
        ).value
      ),

    valorPago:
      document.querySelector(
        "#edit_valorPago"
      ).value
        ? parseFloat(
          document.querySelector(
            "#edit_valorPago"
          ).value
        )
        : null,

    dataOperacao:
      document.querySelector(
        "#edit_dataOperacao"
      ).value,

    dataVencimento:
      document.querySelector(
        "#edit_dataVencimento"
      ).value || null,

    fornecedor:
      document.querySelector(
        "#edit_fornecedor"
      ).value,

    descricao:
      document.querySelector(
        "#edit_descricao"
      ).value,

    observacoes:
      document.querySelector(
        "#edit_observacoes"
      ).value

  };

  try {

    const resp =
      await fetch(
        `${API}/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );

    if (!resp.ok) {

      throw new Error(
        "Erro ao atualizar movimentação."
      );

    }

    $("#modalEdicaoCaixa")
      .modal("hide");

    carregarDashboard();

    carregarOperacoes();

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

    const resp =
      await fetch(
        `${API}/${id}`,
        {
          method:
            "DELETE"
        }
      );

    if (!resp.ok) {

      throw new Error(
        "Erro ao excluir movimentação."
      );

    }

    carregarDashboard();

    carregarOperacoes();

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