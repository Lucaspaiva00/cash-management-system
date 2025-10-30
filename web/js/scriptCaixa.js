const API = "https://cash-management-system.onrender.com/caixa";
const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuario) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

const listaOperacoes = document.getElementById("listaOperacoes");
const form = document.getElementById("caixaForm");
let editandoId = null;

// 🔄 Carregar operações com filtro
async function carregarOperacoes(filtro = "TODAS") {
  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
    const dados = await resp.json();

    const filtradas =
      filtro === "TODAS"
        ? dados
        : dados.filter((op) => op.tipoOperacao === filtro);

    if (!filtradas.length) {
      listaOperacoes.innerHTML =
        "<p class='text-muted'>Nenhuma movimentação encontrada.</p>";
      return;
    }

    listaOperacoes.innerHTML = filtradas
      .map(
        (op) => `
      <div class="col-md-4 mb-4">
        <div class="card shadow card-op" style="border-left-color: ${op.tipoOperacao === "ENTRADA" ? "#28a745" : "#dc3545"
          }">
          <div class="card-body">
            <h5 class="card-title mb-2">
              <i class="fas ${op.tipoOperacao === "ENTRADA"
            ? "fa-arrow-up text-success"
            : "fa-arrow-down text-danger"
          }"></i>
              ${op.tipoOperacao}
            </h5>
            <p><strong>Valor:</strong> ${op.valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}</p>
            <p><strong>Pagamento:</strong> ${op.meioPagamento}</p>
            <p><strong>Descrição:</strong> ${op.descricao || "-"}</p>
            <p class="text-muted small">${new Date(
            op.dataOperacao
          ).toLocaleDateString("pt-BR")}</p>
            <div class="text-right">
              <button class="btn btn-sm btn-warning" onclick="editarOperacao(${op.id
          })"><i class="fas fa-edit"></i></button>
              <button class="btn btn-sm btn-danger" onclick="excluirOperacao(${op.id
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

// 💾 Salvar / Atualizar operação
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    tipoOperacao: form.tipoOperacao.value,
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

// ✏️ Editar operação
async function editarOperacao(id) {
  const resp = await fetch(`${API}?empresaId=${usuario.empresaId}`);
  const dados = await resp.json();
  const op = dados.find((o) => o.id === id);
  if (!op) return alert("Operação não encontrada.");

  form.tipoOperacao.value = op.tipoOperacao;
  form.meioPagamento.value = op.meioPagamento;
  form.valor.value = op.valor;
  form.descricao.value = op.descricao;
  form.dataOperacao.value = op.dataOperacao.split("T")[0];
  editandoId = id;
}

// 🗑️ Excluir operação
async function excluirOperacao(id) {
  if (!confirm("Deseja excluir esta operação?")) return;
  const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (resp.ok) {
    alert("🗑️ Operação excluída!");
    carregarOperacoes();
  }
}

document.addEventListener("DOMContentLoaded", () => carregarOperacoes());
