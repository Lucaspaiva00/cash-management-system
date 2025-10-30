const API = "https://cash-management-system.fly.dev/caixa";
const tipoOperacao = window.location.pathname.includes("credito") ? "ENTRADA" : "SAIDA";

const listaOperacoes = document.getElementById("listaOperacoes");
const form = document.getElementById("caixaForm");

const totalCredito = document.getElementById("totalCredito");
const ultimaEntrada = document.getElementById("ultimaEntrada");
const qtdEntradas = document.getElementById("qtdEntradas");

let editandoId = null; // controla se o usuário está editando

// =======================
// 🔹 CARREGAR OPERAÇÕES
// =======================
async function carregarOperacoes() {
    try {
        const resp = await fetch(API);
        const dados = await resp.json();
        const filtradas = dados.filter(op => op.tipoOperacao === tipoOperacao);

        // ✅ Atualiza cards de resumo
        const total = filtradas.reduce((acc, op) => acc + op.valor, 0);
        totalCredito.innerText = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        qtdEntradas.innerText = filtradas.length;
        ultimaEntrada.innerText = filtradas.length
            ? new Date(filtradas[0].dataOperacao).toLocaleDateString("pt-BR")
            : "-";

        // ✅ Renderiza lista
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

// =======================
// 🔹 CADASTRAR / ATUALIZAR
// =======================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        tipoOperacao,
        meioPagamento: form.meioPagamento.value,
        descricao: form.descricao.value,
        dataOperacao: form.dataOperacao.value,
        valor: parseFloat(form.valor.value),
        empresaId: 1, // ⚠️ Substituir pelo ID real da empresa
    };

    try {
        let resp;

        if (editandoId) {
            // 🔄 Atualização (PUT)
            resp = await fetch(`${API}/${editandoId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // ➕ Criação (POST)
            resp = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }

        if (resp.ok) {
            alert(editandoId ? "✅ Operação atualizada com sucesso!" : "✅ Operação registrada com sucesso!");
            form.reset();
            editandoId = null; // sai do modo edição
            document.querySelector('button[type="submit"]').innerHTML = `<i class="fas fa-save"></i> Registrar`;
            carregarOperacoes();
        } else {
            const err = await resp.json();
            alert(err.error || "Erro ao salvar operação.");
        }
    } catch (err) {
        console.error("Erro:", err);
    }
});

// =======================
// 🔹 EXCLUIR
// =======================
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

// =======================
// 🔹 EDITAR
// =======================
const update = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { tipoOperacao, meioPagamento, descricao, valor, dataOperacao, empresaId } = req.body;

        const existe = await prisma.caixa.findUnique({ where: { id } });
        if (!existe) return res.status(404).json({ error: "Operação não encontrada." });

        const atualizada = await prisma.caixa.update({
            where: { id },
            data: {
                tipoOperacao,
                meioPagamento,
                descricao,
                valor: parseFloat(valor),
                dataOperacao: dataOperacao ? new Date(dataOperacao) : existe.dataOperacao,
                empresaId: empresaId ? parseInt(empresaId) : existe.empresaId,
            },
        });

        return res.status(200).json({
            message: "Operação atualizada com sucesso.",
            data: atualizada,
        });
    } catch (error) {
        console.error("Erro ao atualizar operação:", error);
        return res.status(500).json({ error: "Erro ao atualizar operação." });
    }
};

// =======================
document.addEventListener("DOMContentLoaded", carregarOperacoes);
