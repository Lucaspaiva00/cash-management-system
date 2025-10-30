// ================================
// 📦 API CONFIGURAÇÃO
// ================================
const API = "https://cash-management-system.onrender.com/propostas";

// Função para formatar valores em Real
const fmtBRL = (n) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(n || 0));

// Dados do usuário logado (empresa)
const usuario = JSON.parse(localStorage.getItem("usuarioLogado")) || { empresaId: 1 };

// ================================
// 🧩 ELEMENTOS DO DOM
// ================================
const form = document.querySelector("#caixaForms");
const lista = document.querySelector("#propostasCadastrados");
const elTotal = document.querySelector("#totalprop");

// ================================
// 🚀 INICIALIZAÇÃO
// ================================
document.addEventListener("DOMContentLoaded", () => {
  carregarPropostas();

  if (form) {
    form.addEventListener("submit", salvarProposta);
  } else {
    console.error("❌ Formulário não encontrado no DOM!");
  }
});

// ================================
// 📝 SALVAR NOVA PROPOSTA
// ================================
async function salvarProposta(e) {
  e.preventDefault();

  const data = {
    numero: form.numero.value.trim(),
    data: form.data.value,
    descricao: form.descricao.value.trim(),
    valor: parseFloat(form.valor.value || 0),
    status: form.status.value.trim() || "Aberto",
    empresaId: usuario.empresaId || 1,
  };

  if (!data.numero || !data.valor) {
    alert("⚠️ Preencha o número e o valor da proposta!");
    return;
  }

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json.error || "Erro ao cadastrar proposta.");

    form.reset();
    carregarPropostas();
  } catch (err) {
    console.error("❌ Erro ao salvar proposta:", err);
    alert("Erro ao salvar proposta!");
  }
}

// ================================
// 📋 CARREGAR PROPOSTAS
// ================================
async function carregarPropostas() {
  lista.innerHTML = "<p>Carregando propostas...</p>";

  try {
    const resp = await fetch(`${API}?empresaId=${usuario.empresaId || 1}`);
    const propostas = await resp.json();

    if (!Array.isArray(propostas) || propostas.length === 0) {
      lista.innerHTML = '<p class="text-muted">Nenhuma proposta cadastrada.</p>';
      elTotal.textContent = "R$ 0,00";
      return;
    }

    lista.innerHTML = propostas.map(cardPropostaHTML).join("");

    const soma = propostas.reduce((acc, p) => acc + (p.valor || 0), 0);
    elTotal.textContent = fmtBRL(soma);
  } catch (err) {
    console.error("❌ Erro ao carregar propostas:", err);
    lista.innerHTML = '<p class="text-danger">Erro ao carregar propostas.</p>';
  }
}

// ================================
// 🗑️ EXCLUIR PROPOSTA
// ================================
async function excluirProposta(id) {
  if (!confirm("Deseja realmente excluir esta proposta?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!resp.ok) throw new Error("Erro ao excluir proposta.");
    carregarPropostas();
  } catch (err) {
    console.error("❌ Erro ao excluir proposta:", err);
    alert("Erro ao excluir proposta!");
  }
}

// ================================
// 🧱 TEMPLATE DO CARD
// ================================
function cardPropostaHTML(p) {
  const statusLower = (p.status || "Aberto").toLowerCase();
  const cor = statusLower === "fechado" ? "card-status-fechado" : "card-status-aberto";

  return `
    <div class="card card-proposta ${cor} p-3 shadow-sm" style="flex: 1 1 320px; max-width: 360px;">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="mb-1 text-dark">#${p.numero}</h5>
          <p class="small text-muted mb-1">${p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—"}</p>
          <p class="small text-muted mb-1">${p.descricao || "Sem descrição"}</p>
          <p class="mb-1"><span class="badge badge-${statusLower === "fechado" ? "success" : "primary"} text-uppercase">${p.status}</span></p>
          <h6 class="text-primary font-weight-bold">${fmtBRL(p.valor)}</h6>
        </div>
        <div>
          <button class="btn btn-danger btn-sm" onclick="excluirProposta(${p.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}
