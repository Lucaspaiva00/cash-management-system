const API = "https://cash-management-system.onrender.com/propostas";
const fmtBRL = n => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n || 0));
const empresaId = JSON.parse(localStorage.getItem("usuarioLogado"))?.empresaId || 1;

const form = document.querySelector("#formProposta");
const lista = document.querySelector("#propostasCadastrados");
const totalAberto = document.querySelector("#totalAberto");
const totalFechado = document.querySelector("#totalFechado");
const totalGeral = document.querySelector("#totalGeral");

document.addEventListener("DOMContentLoaded", () => {
  carregar();
  form.addEventListener("submit", salvar);
});

async function salvar(e) {
  e.preventDefault();
  const data = {
    descricao: form.descricao.value.trim(),
    valorTotal: parseFloat(form.valor.value), // ✅ nome compatível com schema
    status: form.status.value.trim() || "Aberto",
    numero: parseInt(form.numero.value),
    empresaId,
  };

  const resp = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await resp.json();
  if (!resp.ok) return alert(json.error);
  form.reset();
  carregar();
}

async function carregar() {
  const resp = await fetch(`${API}?empresaId=${empresaId}`);
  const propostas = await resp.json();
  lista.innerHTML = propostas.map(card).join("");

  const aberto = propostas.filter(p => p.status.toLowerCase() === "aberto").reduce((a, p) => a + p.valorTotal, 0);
  const fechado = propostas.filter(p => p.status.toLowerCase() === "fechado").reduce((a, p) => a + p.valorTotal, 0);
  totalAberto.textContent = fmtBRL(aberto);
  totalFechado.textContent = fmtBRL(fechado);
  totalGeral.textContent = fmtBRL(aberto + fechado);
}

async function excluir(id) {
  if (!confirm("Excluir esta proposta?")) return;
  await fetch(`${API}/${id}`, { method: "DELETE" });
  carregar();
}

async function alternarStatus(p) {
  const novoStatus = p.status.toLowerCase() === "aberto" ? "Fechado" : "Aberto";
  await fetch(`${API}/${p.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: novoStatus }),
  });
  carregar();
}

function card(p) {
  const statusLower = (p.status || "Aberto").toLowerCase();
  const cor = statusLower === "fechado" ? "card-status-fechado" : "card-status-aberto";
  return `
      <div class="card card-proposta ${cor} p-3 shadow-sm">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="mb-1 text-dark">#${p.numero}</h5>
            <p class="small text-muted mb-1">${p.descricao}</p>
            <p><span class="badge badge-${statusLower === "fechado" ? "success" : "primary"}">${p.status}</span></p>
            <h6 class="text-primary font-weight-bold">${fmtBRL(p.valorTotal)}</h6>
          </div>
          <div>
            <button class="btn btn-sm btn-warning" onclick='alternarStatus(${JSON.stringify(p)})'><i class="fas fa-sync"></i></button>
            <button class="btn btn-sm btn-danger" onclick="excluir(${p.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`;
}
