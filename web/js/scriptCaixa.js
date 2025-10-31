const API = "https://cash-management-system.onrender.com/caixa";
const empresaId =
  JSON.parse(localStorage.getItem("usuarioLogado"))?.empresaId || 1;

const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(n || 0)
  );

// ===============================
// 🎯 DOM
// ===============================
const form = document.querySelector("#caixaForm");
const lista = document.querySelector("#listaOperacoes");
const filtroTipo = document.querySelector("#filtroTipo");

// opcionais (se existir, atualiza)
const elTotalEntradas = document.querySelector("#totalEntradas");
const elTotalSaidas = document.querySelector("#totalSaidas");
const elSaldoGeral = document.querySelector("#saldoGeral");

// opcionais (se existir, ativa)
const inputInicio = document.querySelector("#filtroInicio"); // <input type="date" id="filtroInicio">
const inputFim = document.querySelector("#filtroFim");       // <input type="date" id="filtroFim">
const btnExportCSV = document.querySelector("#exportCSV");   // <button id="exportCSV">

// estado local
let OPERACOES = [];

// ===============================
// 🚀 INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // listeners
  if (form) form.addEventListener("submit", salvarOperacao);
  if (filtroTipo) filtroTipo.addEventListener("change", carregarOperacoes);
  if (inputInicio) inputInicio.addEventListener("change", carregarOperacoes);
  if (inputFim) inputFim.addEventListener("change", carregarOperacoes);
  if (btnExportCSV) btnExportCSV.addEventListener("click", exportarCSV);

  garantirModalEdicao(); // cria modal de edição se não existir

  carregarOperacoes();
});

// ===============================
// 🟩 CREATE
// ===============================
async function salvarOperacao(e) {
  e.preventDefault();

  const payload = {
    tipoOperacao: (form.tipoOperacao?.value || "").trim(), // ENTRADA | SAIDA
    meioPagamento: (form.meioPagamento?.value || "").trim(), // PIX | CARTAO | ...
    descricao: (form.descricao?.value || "").trim(),
    valor: parseFloat(form.valor?.value),
    dataOperacao: form.dataOperacao?.value || undefined, // deixa o back aplicar default/parse
    empresaId,
  };

  // validação mínima (aceita R$ 0,00? normalmente não; aqui exigimos > 0)
  if (!payload.tipoOperacao || !payload.meioPagamento || isNaN(payload.valor) || payload.valor <= 0) {
    alert("Preencha Tipo, Meio de Pagamento e um Valor maior que zero.");
    return;
  }

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("Erro ao salvar:", json);
      alert(json.error || "Erro ao salvar operação.");
      return;
    }

    form.reset();
    carregarOperacoes();
  } catch (err) {
    console.error(err);
    alert("Falha de comunicação com o servidor.");
  }
}

// ===============================
// 📋 READ
// ===============================
async function carregarOperacoes() {
  lista.innerHTML = `<p class="text-muted">Carregando...</p>`;

  let url = `${API}?empresaId=${empresaId}`;
  if (filtroTipo && filtroTipo.value) {
    url += `&tipoOperacao=${encodeURIComponent(filtroTipo.value)}`; // se o back suportar
  }

  try {
    const resp = await fetch(url);
    const dados = await resp.json();

    if (!Array.isArray(dados)) {
      lista.innerHTML = `<p class="text-danger">Erro ao carregar movimentações.</p>`;
      return;
    }

    // guarda no estado
    OPERACOES = dados
      .map((op) => ({
        ...op,
        // normaliza data
        _dataTs: op.dataOperacao ? new Date(op.dataOperacao).getTime() : 0,
      }))
      // filtro de data no front (se inputs existirem)
      .filter((op) => {
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
      // ordena por data desc
      .sort((a, b) => b._dataTs - a._dataTs);

    if (OPERACOES.length === 0) {
      lista.innerHTML = `<p class="text-muted">Nenhuma movimentação encontrada.</p>`;
      atualizarTotais(OPERACOES);
      return;
    }

    lista.innerHTML = OPERACOES.map(cardOperacao).join("");
    atualizarTotais(OPERACOES);
  } catch (err) {
    console.error(err);
    lista.innerHTML = `<p class="text-danger">Erro ao carregar movimentações.</p>`;
  }
}

// ===============================
// 🟨 UPDATE (modal de edição)
// ===============================
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
              <select id="edit_tipoOperacao" class="form-control" required>
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
              </select>
            </div>

            <div class="form-group">
              <label>Meio de Pagamento</label>
              <select id="edit_meioPagamento" class="form-control" required>
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
              <input type="text" id="edit_descricao" class="form-control" placeholder="Descrição">
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

  // submit edição
  const formEditarOp = modal.querySelector("#formEditarOp");
  formEditarOp.addEventListener("submit", salvarEdicaoOperacao);
}

function abrirModalEdicao(op) {
  // preenche
  document.querySelector("#edit_id").value = op.id;
  document.querySelector("#edit_tipoOperacao").value = op.tipoOperacao || "ENTRADA";
  document.querySelector("#edit_meioPagamento").value = op.meioPagamento || "PIX";
  document.querySelector("#edit_valor").value = Number(op.valor || 0);
  document.querySelector("#edit_dataOperacao").value = op.dataOperacao
    ? new Date(op.dataOperacao).toISOString().substring(0, 10)
    : "";
  document.querySelector("#edit_descricao").value = op.descricao || "";

  // abre modal (Bootstrap)
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

  if (!id || !payload.tipoOperacao || !payload.meioPagamento || isNaN(payload.valor) || payload.valor <= 0) {
    alert("Preencha corretamente os campos.");
    return;
  }

  try {
    const resp = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error("Erro ao atualizar:", json);
      alert(json.error || "Erro ao atualizar movimentação.");
      return;
    }

    $("#modalEdicaoCaixa").modal("hide");
    carregarOperacoes();
  } catch (err) {
    console.error(err);
    alert("Falha de comunicação ao atualizar.");
  }
}

// ===============================
// 🟥 DELETE
// ===============================
async function excluirOperacao(id) {
  if (!confirm("Deseja excluir esta movimentação?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!resp.ok) {
      const json = await resp.json().catch(() => ({}));
      alert(json.error || "Erro ao excluir movimentação.");
      return;
    }
    carregarOperacoes();
  } catch (err) {
    console.error(err);
    alert("Falha de comunicação ao excluir.");
  }
}

// ===============================
// 📊 TOTAIS (opcional)
// ===============================
function atualizarTotais(items = []) {
  const entradas = items
    .filter((i) => (i.tipoOperacao || "").toUpperCase() === "ENTRADA")
    .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

  const saidas = items
    .filter((i) => (i.tipoOperacao || "").toUpperCase() === "SAIDA")
    .reduce((acc, i) => acc + (Number(i.valor) || 0), 0);

  const saldo = entradas - saidas;

  if (elTotalEntradas) elTotalEntradas.textContent = fmtBRL(entradas);
  if (elTotalSaidas) elTotalSaidas.textContent = fmtBRL(saidas);
  if (elSaldoGeral) elSaldoGeral.textContent = fmtBRL(saldo);
}

// ===============================
// 🧱 UI: Card
// ===============================
function cardOperacao(op) {
  const tipo = (op.tipoOperacao || "").toUpperCase() === "ENTRADA" ? "entrada" : "saida";
  const classeBorda = tipo === "entrada" ? "entrada" : "saida";
  const corValor = tipo === "entrada" ? "text-success" : "text-danger";
  const dataBR = op.dataOperacao
    ? new Date(op.dataOperacao).toLocaleDateString("pt-BR")
    : "—";
  const valorFmt = fmtBRL(op.valor);

  // botão editar chama modal
  return `
    <div class="card-op ${classeBorda}">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h6 class="mb-1">${op.tipoOperacao || "—"}</h6>
          <p class="small text-muted mb-1">${op.meioPagamento || "—"} • ${dataBR}</p>
          <p class="mb-1">${op.descricao || "Sem descrição"}</p>
          <strong class="${corValor}">${valorFmt}</strong>
        </div>
        <div class="d-flex gap-2">
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

// evita erro ao serializar funções/undefined
function safeClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ===============================
// ⬇️ Export CSV (opcional)
// ===============================
function exportarCSV() {
  if (!OPERACOES.length) {
    alert("Não há movimentações para exportar.");
    return;
  }
  const header = [
    "ID",
    "TipoOperacao",
    "MeioPagamento",
    "Valor",
    "DataOperacao",
    "Descricao",
  ];
  const rows = OPERACOES.map((o) => [
    o.id,
    o.tipoOperacao || "",
    o.meioPagamento || "",
    String(o.valor || 0).replace(".", ","),
    o.dataOperacao ? new Date(o.dataOperacao).toISOString().substring(0, 10) : "",
    (o.descricao || "").replaceAll("\n", " ").replaceAll(";", ","),
  ]);

  const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `movimentacoes_${new Date().toISOString().substring(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
