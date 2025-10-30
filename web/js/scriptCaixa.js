const API = "https://cash-management-system.fly.dev/caixa";
const tipoOperacao = window.location.pathname.includes("credito") ? "ENTRADA" : "SAIDA";

const listaOperacoes = document.getElementById("listaOperacoes");
const form = document.getElementById("caixaForm");

const totalCredito = document.getElementById("totalCredito");
const ultimaEntrada = document.getElementById("ultimaEntrada");
const qtdEntradas = document.getElementById("qtdEntradas");

async function carregarOperacoes() {
    try {
        const resp = await fetch(API);
        const dados = await resp.json();
        const filtradas = dados.filter(op => op.tipoOperacao === tipoOperacao);

        // ✅ Atualiza cards
        const total = filtradas.reduce((acc, op) => acc + op.valor, 0);
        totalCredito.innerText = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        qtdEntradas.innerText = filtradas.length;
        ultimaEntrada.innerText = filtradas.length
            ? new Date(filtradas[filtradas.length - 1].dataOperacao).toLocaleDateString("pt-BR")
            : "-";

        // ✅ Renderiza cards de operações
        listaOperacoes.innerHTML = filtradas
            .map(
                (op) => `
        <div class="col-md-4 mb-4">
          <div class="card shadow card-op">
            <div class="card-body">
              <h5 class="card-title mb-2">
                <i class="fas ${tipoOperacao === "ENTRADA" ? "fa-arrow-up text-success" : "fa-arrow-down text-danger"}"></i>
                ${op.tipoOperacao}
              </h5>
              <p class="mb-1"><strong>Valor:</strong> ${op.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
              <p class="mb-1"><strong>Pagamento:</strong> ${op.meioPagamento}</p>
              <p class="mb-1"><strong>Descrição:</strong> ${op.descricao || "-"}</p>
              <p class="text-muted small">${new Date(op.dataOperacao).toLocaleDateString("pt-BR")}</p>
              <div class="text-right">
                <button class="btn btn-sm btn-warning" onclick="editarOperacao(${op.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirOperacao(${op.id})"><i class="fas fa-trash"></i></button>
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
        empresaId: 1, // Substituir por empresa real
    };

    try {
        const resp = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (resp.ok) {
            alert("✅ Operação registrada com sucesso!");
            form.reset();
            carregarOperacoes();
        } else {
            const err = await resp.json();
            alert(err.error || "Erro ao registrar operação.");
        }
    } catch (err) {
        console.error("Erro:", err);
    }
});

async function excluirOperacao(id) {
    if (!confirm("Deseja excluir esta operação?")) return;
    try {
        const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (resp.ok) {
            alert("Operação excluída com sucesso!");
            carregarOperacoes();
        }
    } catch (err) {
        console.error("Erro ao excluir:", err);
    }
}

function editarOperacao(id) {
    alert(`✏️ Edição da operação ${id} ainda em desenvolvimento.`);
}

document.addEventListener("DOMContentLoaded", carregarOperacoes);
