const API = "https://cash-management-system.onrender.com/caixa";
const empresaId = JSON.parse(localStorage.getItem("usuarioLogado"))?.empresaId || 1;

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));

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

document.addEventListener("DOMContentLoaded", () => {
  if (form) form.addEventListener("submit", salvarOperacao);
  [filtroTipo, inputInicio, inputFim].forEach(el => el?.addEventListener("change", carregarOperacoes));
  btnLimparFiltros?.addEventListener("click", limparFiltros);
  garantirModalEdicao();
  carregarOperacoes();
});

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

  if (!payload.tipoOperacao || !payload.meioPagamento || isNaN(payload.valor) || payload.valor <= 0) {
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
        _data: op.dataOperacao ? op.dataOperacao.split("T")[0] : "",
        _ts: op.dataOperacao ? new Date(op.dataOperacao).getTime() : 0,
      }))
      .filter((op) => {
        if (filtroTipo.value && op.tipoOperacao !== filtroTipo.value) return false;
        if (inputInicio.value && op._ts < new Date(inputInicio.value).getTime()) return false;
        if (inputFim.value && op._ts > new Date(inputFim.value).getTime() + 86400000) return false;
        return true;
      })
      .sort((a, b) => b._ts - a._ts);

    if (!OPERACOES.length) {
      lista.innerHTML = `<p class="text-muted">Nenhuma movimentação encontrada.</p>`;
      atualizarTotais([]);
      return;
    }

    lista.innerHTML = OPERACOES.map(criarCard).join("");
    atualizarTotais(OPERACOES);
  } catch (err) {
    lista.innerHTML = `<p class="text-danger">Erro: ${err.message}</p>`;
  }
}

function criarCard(op) {
  const tipo = op.tipoOperacao.toUpperCase() === "ENTRADA" ? "entrada" : "saida";
  const corValor = tipo === "entrada" ? "text-success" : "text-danger";
  const dataFmt = op._data ? op._data.split("-").reverse().join("/") : "—";
  const valorFmt = fmtBRL(op.valor);

  return `
    <div class="card-op ${tipo}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-1">${op.tipoOperacao}</h6>
          <p class="small text-muted mb-1">${op.meioPagamento} • ${dataFmt}</p>
          <p class="mb-1">${op.descricao}</p>
          <strong class="${corValor}">${valorFmt}</strong>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary mr-2" onclick="abrirModalEdicao(${op.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="excluirOperacao(${op.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}

function limparFiltros() {
  filtroTipo.value = "";
  inputInicio.value = "";
  inputFim.value = "";
  carregarOperacoes();
}

function garantirModalEdicao() {
  if (document.querySelector("#modalEdicaoCaixa")) return;
  const modal = document.createElement("div");
  modal.innerHTML = `
    <div class="modal fade" id="modalEdicaoCaixa" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
        <form id="formEditarOp">
          <div class="modal-header">
            <h5 class="modal-title">Editar Movimentação</h5>
            <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
          </div>
          <div class="modal-body">
            <input type="hidden" id="edit_id">
            <label>Tipo de Operação</label>
            <select id="edit_tipoOperacao" class="form-control mb-2">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
            <label>Meio de Pagamento</label>
            <select id="edit_meioPagamento" class="form-control mb-2">
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="BOLETO">Boleto</option>
              <option value="TRANSFERENCIA">Transferência</option>
            </select>
            <label>Valor (R$)</label>
            <input type="number" step="0.01" id="edit_valor" class="form-control mb-2">
            <label>Data</label>
            <input type="date" id="edit_dataOperacao" class="form-control mb-2">
            <label>Descrição</label>
            <input type="text" id="edit_descricao" class="form-control">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-light" data-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-danger">Salvar</button>
          </div>
        </form>
      </div></div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#formEditarOp").addEventListener("submit", salvarEdicaoOperacao);
}

function abrirModalEdicao(id) {
  const op = OPERACOES.find(o => o.id === id);
  if (!op) return alert("Operação não encontrada.");

  document.querySelector("#edit_id").value = op.id;
  document.querySelector("#edit_tipoOperacao").value = op.tipoOperacao;
  document.querySelector("#edit_meioPagamento").value = op.meioPagamento;
  document.querySelector("#edit_valor").value = op.valor;
  document.querySelector("#edit_dataOperacao").value = op._data;
  document.querySelector("#edit_descricao").value = op.descricao;
  $("#modalEdicaoCaixa").modal("show");
}

async function salvarEdicaoOperacao(e) {
  e.preventDefault();
  const id = document.querySelector("#edit_id").value;
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
    if (!resp.ok) throw new Error("Erro ao atualizar.");
    $("#modalEdicaoCaixa").modal("hide");
    carregarOperacoes();
  } catch (err) {
    alert(err.message);
  }
}

async function excluirOperacao(id) {
  if (!confirm("Deseja excluir esta movimentação?")) return;
  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao excluir.");
    carregarOperacoes();
  } catch (err) {
    alert(err.message);
  }
}

function atualizarTotais(items) {
  const entradas = items.filter(i => i.tipoOperacao === "ENTRADA").reduce((a, i) => a + Number(i.valor), 0);
  const saidas = items.filter(i => i.tipoOperacao === "SAIDA").reduce((a, i) => a + Number(i.valor), 0);
  if (elTotalEntradas) elTotalEntradas.textContent = fmtBRL(entradas);
  if (elTotalSaidas) elTotalSaidas.textContent = fmtBRL(saidas);
  if (elSaldoGeral) elSaldoGeral.textContent = fmtBRL(entradas - saidas);
}
