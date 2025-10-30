const API = "https://cash-management-system.onrender.com/caixa";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const tipoOperacao = window.location.pathname.includes("credito")
  ? "ENTRADA"
  : "SAIDA";
const listaOperacoes = document.getElementById("listaOperacoes");
const form = document.getElementById("caixaForm");
const totalCredito = document.getElementById("totalCredito");
const ultimaEntrada = document.getElementById("ultimaEntrada");
const qtdEntradas = document.getElementById("qtdEntradas");
let editandoId = null;

async function carregarOperacoes() {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const dados = await resp.json();
    const filtradas = dados.filter((op) => op.tipoOperacao === tipoOperacao);

    const total = filtradas.reduce((acc, op) => acc + op.valor, 0);
    if (totalCredito)
      totalCredito.innerText = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    if (qtdEntradas) qtdEntradas.innerText = filtradas.length;
    if (ultimaEntrada)
      ultimaEntrada.innerText = filtradas.length
        ? new Date(filtradas[0].dataOperacao).toLocaleDateString("pt-BR")
        : "-";

    listaOperacoes.innerHTML = filtradas
      .map(
        (op) => `
      <div class="col-md-4 mb-4">
        <div class="card shadow card-op">
          <div class="card-body">
            <h5 class="card-title mb-2">
              <i class="fas ${
                tipoOperacao === "ENTRADA"
                  ? "fa-arrow-up text-success"
                  : "fa-arrow-down text-danger"
              }"></i>
              ${op.tipoOperacao}
            </h5>
            <p class="mb-1"><strong>Valor:</strong> ${op.valor.toLocaleString(
              "pt-BR",
              { style: "currency", currency: "BRL" }
            )}</p>
            <p class="mb-1"><strong>Pagamento:</strong> ${op.meioPagamento}</p>
            <p class="mb-1"><strong>Descrição:</strong> ${
              op.descricao || "-"
            }</p>
            <p class="text-muted small">${new Date(
              op.dataOperacao
            ).toLocaleDateString("pt-BR")}</p>
            <div class="text-right">
              <button class="btn btn-sm btn-warning" onclick="editarOperacao(${
                op.id
              })"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-danger" onclick="excluirOperacao(${
                op.id
              })"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        </div>
      </div>`
      )
      .join("");
  } catch (error) {
    console.error("Erro ao carregar operações:", error);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    tipoOperacao,
    meioPagamento: form.meioPagamento.value,
    descricao: form.descricao.value,
    dataOperacao: form.dataOperacao.value,
    valor: parseFloat(form.valor.value),
    empresaId: usuario.empresaId,
  };

  try {
    const method = editandoId ? "PUT" : "POST";
    const url = editandoId ? `${API}/${editandoId}` : API;
    const resp = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await resp.json();
    if (!resp.ok) return alert(json.error || "Erro ao salvar operação.");

    alert(editandoId ? "✅ Operação atualizada!" : "✅ Operação registrada!");
    form.reset();
    editandoId = null;
    carregarOperacoes();
  } catch (err) {
    console.error("Erro:", err);
  }
});

async function editarOperacao(id) {
  const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
  const dados = await resp.json();
  const op = dados.find((o) => o.id === id);
  if (!op) return alert("Operação não encontrada.");

  form.valor.value = op.valor;
  form.meioPagamento.value = op.meioPagamento;
  form.descricao.value = op.descricao;
  form.dataOperacao.value = op.dataOperacao.split("T")[0];
  editandoId = id;
}

async function excluirOperacao(id) {
  if (!confirm("Deseja excluir esta operação?")) return;
  const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (resp.ok) {
    alert("🗑️ Operação excluída!");
    carregarOperacoes();
  }
}

document.addEventListener("DOMContentLoaded", carregarOperacoes);
