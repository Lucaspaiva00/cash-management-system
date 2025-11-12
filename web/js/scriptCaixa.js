const API = "https://cash-management-system.onrender.com/caixa";
const empresaId = JSON.parse(localStorage.getItem("usuarioLogado"))?.empresaId || 1;

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );

// === DOM ===
const form = document.querySelector("#caixaForm");
const lista = document.querySelector("#listaOperacoes");
const filtroTipo = document.querySelector("#filtroTipo");
const inputInicio = document.querySelector("#filtroInicio");
const inputFim = document.querySelector("#filtroFim");
const btnLimparFiltros = document.querySelector("#btnLimparFiltros");
const elTotalEntradas = document.querySelector("#totalEntradas");
const elTotalSaidas = document.querySelector("#totalSaidas");
const elSaldoGeral = document.querySelector("#saldoGeral");

let OPERACOES = [];

// === INIT ===
document.addEventListener("DOMContentLoaded", () => {
  if (form) form.addEventListener("submit", salvarOperacao);
  if (filtroTipo) filtroTipo.addEventListener("change", carregarOperacoes);
  if (inputInicio) inputInicio.addEventListener("change", carregarOperacoes);
  if (inputFim) inputFim.addEventListener("change", carregarOperacoes);
  if (btnLimparFiltros)
    btnLimparFiltros.addEventListener("click", limparFiltros);

  garantirModalEdicao();
  carregarOperacoes();
});

// === CREATE ===
async function salvarOperacao(e) {
  e.preventDefault();

  const payload = {
    tipoOperacao: form.tipoOperacao.value.trim(),
    meioPagamento: form.meioPagamento.value.trim(),
    descricao: form.descricao.value.trim(),
    valor: parseFloat(form.valor.value),
    dataOperacao: form.dataOperacao.value,
    empresaId,
  };

  if (
    !payload.tipoOperacao ||
    !payload.meioPagamento ||
    isNaN(payload.valor) ||
    payload.valor <= 0
  ) {
    alert("Preencha Tipo, Meio de Pagamento e Valor maior que zero.");
    return;
  }

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error("Erro ao salvar operação.");
    form.reset();
    carregarOperacoes();
  } catch (err) {
    alert("Erro ao salvar operação: " + err.message);
  }
}

// === READ + FILTRO ===
async function carregarOperacoes() {
  lista.innerHTML = `<p class="text-muted">Carregando...</p>`;
  let url = `${API}?empresaId=${empresaId}`;

  try {
    const resp = await fetch(url);
    const dados = await resp.json();

    if (!Array.isArray(dados)) throw new Error("Erro ao carregar.");

    OPERACOES = dados
      .map((op) => ({
        ...op,
        _dataTs: op.dataOperacao ? new Date(op.dataOperacao).getTime() : 0,
      }))
      .filter((op) => {
        // filtro por tipo
        if (filtroTipo && filtroTipo.value) {
          if (op.tipoOperacao !== filtroTipo.value) return false;
        }
        // filtro por intervalo de datas
        if (inputInicio && inputInicio.value) {
          const ini = new Date(inputInicio.value).setHours(0, 0, 0, 0);
          if (op._dataTs < ini) return false;
        }
        if (inputFim && inputFim.value) {
          const fim = new Date(inputFim.value).setHours(23, 59, 59, 999);
          if (op._dataTs > fim) return false;
        }
        return true;
      })
      .sort((a, b) => b._dataTs - a._dataTs);

    if (OPERACOES.length === 0) {
      lista.innerHTML = `<p class="text-muted">Nenhuma movimentação encontrada.</p>`;
      atualizarTotais([]);
      return;
    }

    lista.innerHTML = OPERACOES.map(cardOperacao).join("");
    atualizarTotais(OPERACOES);
  } catch (err) {
    lista.innerHTML = `<p class="text-danger">Erro: ${err.message}</p>`;
  }
}

// === LIMPAR FILTROS ===
function limparFiltros() {
  filtroTipo.value = "";
  inputInicio.value = "";
  inputFim.value = "";
  carregarOperacoes();
}

// === CARD (UI) ===
function cardOperacao(op) {
  const tipo = op.tipoOperacao.toUpperCase() === "ENTRADA" ? "entrada" : "saida";
  const corValor = tipo === "entrada" ? "text-success" : "text-danger";
  const valorFmt = fmtBRL(op.valor);

  // 🔧 Corrige data (sem fuso)
  const dataBR = op.dataOperacao
    ? new Date(op.dataOperacao + "T00:00:00").toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    })
    : "—";

  return `
    <div class="card-op ${tipo}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-1">${op.tipoOperacao}</h6>
          <p class="small text-muted mb-1">${op.meioPagamento} • ${dataBR}</p>
          <p class="mb-1">${op.descricao}</p>
          <strong class="${corValor}">${valorFmt}</strong>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary mr-2" title="Editar"
            onclick='abrirModalEdicao(${JSON.stringify(safeClone(op))})'>
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" title="Excluir"
            onclick="excluirOperacao(${op.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}

function safeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// === UPDATE ===
function garantirModalEdicao() {
  if (document.querySelector("#modalEdicaoCaixa")) return;
  const modal = document.createElement("div");
  modal.innerHTML = `
  <div class="modal fade" id="modalEdicaoCaixa" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <form id="formEditarOp">
          <div class="modal-header">
            <h5 class="modal-title">Editar Movimentação</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit_id">
            <div class="form-group">
              <label>Tipo de Operação</label>
              <select id="edit_tipoOperacao" class="form-control">
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>
            <div class="form-group">
              <label>Meio de Pagamento</label>
              <select id="edit_meioPagamento" class="form-control">
                <option value="PIX">Pix</option>
                <option value="CARTAO">Cartão</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="BOLETO">Boleto</option>
                <option value="TRANSFERENCIA">Transferência</option>
              </select>
            </div>
            <div class="form-group">
              <label>Valor (R$)</label>
              <input type="number" step="0.01" id="edit_valor" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Data</label>
              <input type="date" id="edit_dataOperacao" class="form-control" required>
            </div>
            <div class="form-group">
              <label>Descrição</label>
              <input type="text" id="edit_descricao" class="form-control">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-danger">Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);

  modal
    .querySelector("#formEditarOp")
    .addEventListener("submit", salvarEdicaoOperacao);
}

function abrirModalEdicao(op) {
  document.querySelector("#edit_id").value = op.id;
  document.querySelector("#edit_tipoOperacao").value =
    op.tipoOperacao || "ENTRADA";
  document.querySelector("#edit_meioPagamento").value =
    op.meioPagamento || "PIX";
  document.querySelector("#edit_valor").value = op.valor || 0;
  document.querySelector("#edit_dataOperacao").value = op.dataOperacao
    ? new Date(op.dataOperacao + "T00:00:00")
      .toISOString()
      .substring(0, 10)
    : "";
  document.querySelector("#edit_descricao").value = op.descricao || "";
  $("#modalEdicaoCaixa").modal("show");
}

async function salvarEdicaoOperacao(e) {
  e.preventDefault();
  const id = Number(document.querySelector("#edit_id").value);
  const payload = {
    tipoOperacao: document.querySelector("#edit_tipoOperacao").value,
    meioPagamento: document.querySelector("#edit_meioPagamento").value,
    valor: parseFloat(document.querySelector("#edit_valor").value),
    dataOperacao: document.querySelector("#edit_dataOperacao").value,
    descricao: document.querySelector("#edit_descricao").value.trim(),
  };

  try {
    const resp = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error("Erro ao atualizar movimentação.");
    $("#modalEdicaoCaixa").modal("hide");
    carregarOperacoes();
  } catch (err) {
    alert(err.message);
  }
}

// === DELETE ===
async function excluirOperacao(id) {
  if (!confirm("Deseja excluir esta movimentação?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao excluir movimentação.");
    carregarOperacoes();
  } catch (err) {
    alert(err.message);
  }
}

// === TOTAIS ===
function atualizarTotais(items = []) {
  const entradas = items
    .filter((i) => i.tipoOperacao === "ENTRADA")
    .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
  const saidas = items
    .filter((i) => i.tipoOperacao === "SAIDA")
    .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);
  const saldo = entradas - saidas;

  if (elTotalEntradas) elTotalEntradas.textContent = fmtBRL(entradas);
  if (elTotalSaidas) elTotalSaidas.textContent = fmtBRL(saidas);
  if (elSaldoGeral) elSaldoGeral.textContent = fmtBRL(saldo);
}
