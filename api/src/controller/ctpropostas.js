// API endpoints
const API = "https://cash-management-system.onrender.com/propostas";
const API_CLIENTES = "https://cash-management-system.onrender.com/clientes";

// helpers
const fmtBRL = n =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
        .format(Number(n || 0));

const empresaId = JSON.parse(localStorage.getItem("usuarioLogado"))?.empresaId || 1;

// DOM
const form = document.querySelector("#formProposta");
const lista = document.querySelector("#propostasCadastrados");
const totalAberto = document.querySelector("#totalAberto");
const totalFechado = document.querySelector("#totalFechado");
const totalGeral = document.querySelector("#totalGeral");
const selCliente = document.querySelector("#clienteId");

// init
document.addEventListener("DOMContentLoaded", () => {
    carregarClientes();
    carregarPropostas();
    form.addEventListener("submit", salvarProposta);
});

// carregar clientes (select)
async function carregarClientes() {
    try {
        const resp = await fetch(`${API_CLIENTES}?empresaId=${empresaId}`);
        const clientes = await resp.json();
        if (!Array.isArray(clientes)) return;

        selCliente.innerHTML = '<option value="">(Opcional) Selecionar cliente</option>';
        clientes.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = c.nome;
            selCliente.appendChild(opt);
        });
    } catch (e) {
        console.warn("Não foi possível carregar clientes.", e);
    }
}

// salvar proposta
async function salvarProposta(e) {
    e.preventDefault();

    const data = {
        numero: parseInt(form.numero.value),
        // `data` é opcional no backend, mas se vier preenche:
        data: form.data.value || undefined,
        descricao: form.descricao.value.trim(),
        valorTotal: parseFloat(form.valor.value),          // <-- nome certo
        status: form.status.value.trim() || "Aberto",
        empresaId,
        clienteId: form.clienteId.value ? parseInt(form.clienteId.value) : null
    };

    // validação mínima
    if (!data.numero || !data.descricao || isNaN(data.valorTotal)) {
        alert("Preencha Número, Descrição e Valor corretamente.");
        return;
    }

    const resp = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const json = await resp.json();
    if (!resp.ok) {
        alert(json.error || "Erro ao salvar proposta.");
        return;
    }

    form.reset();
    carregarPropostas();
}

// carregar propostas
async function carregarPropostas() {
    lista.innerHTML = "<p>Carregando propostas...</p>";
    try {
        const resp = await fetch(`${API}?empresaId=${empresaId}`);
        const propostas = await resp.json();
        if (!Array.isArray(propostas) || propostas.length === 0) {
            lista.innerHTML = '<p class="text-muted">Nenhuma proposta cadastrada.</p>';
            totalAberto.textContent = totalFechado.textContent = totalGeral.textContent = "R$ 0,00";
            return;
        }

        lista.innerHTML = propostas.map(cardPropostaHTML).join("");

        const aberto = propostas
            .filter(p => (p.status || "").toLowerCase() === "aberto")
            .reduce((acc, p) => acc + (p.valorTotal || 0), 0);

        const fechado = propostas
            .filter(p => (p.status || "").toLowerCase() === "fechado")
            .reduce((acc, p) => acc + (p.valorTotal || 0), 0);

        totalAberto.textContent = fmtBRL(aberto);
        totalFechado.textContent = fmtBRL(fechado);
        totalGeral.textContent = fmtBRL(aberto + fechado);
    } catch (e) {
        console.error("Erro ao carregar propostas:", e);
        lista.innerHTML = '<p class="text-danger">Erro ao carregar propostas.</p>';
    }
}

// excluir
async function excluirProposta(id) {
    if (!confirm("Excluir esta proposta?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    carregarPropostas();
}

// alternar status
async function alternarStatus(p) {
    const novoStatus = (p.status || "Aberto").toLowerCase() === "aberto" ? "Fechado" : "Aberto";
    await fetch(`${API}/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
    });
    carregarPropostas();
}

// template do card
function cardPropostaHTML(p) {
    const statusLower = (p.status || "Aberto").toLowerCase();
    const cor = statusLower === "fechado" ? "card-status-fechado" : "card-status-aberto";
    const dataBR = p.data ? new Date(p.data).toLocaleDateString("pt-BR") : "—";
    const cliente = p.cliente?.nome || p.clienteNome || "";

    return `
    <div class="card card-proposta ${cor} p-3 shadow-sm">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="mb-1 text-dark">#${p.numero}</h5>
          <p class="small text-muted mb-1">${dataBR}${cliente ? " • " + cliente : ""}</p>
          <p class="small text-muted mb-1">${p.descricao || "Sem descrição"}</p>
          <p class="mb-1">
            <span class="badge badge-${statusLower === "fechado" ? "success" : "primary"} text-uppercase">
              ${p.status}
            </span>
          </p>
          <h6 class="text-primary font-weight-bold">${fmtBRL(p.valorTotal)}</h6>
        </div>
        <div>
          <button class="btn btn-sm btn-warning mr-1" onclick='alternarStatus(${JSON.stringify(p)})' title="Alternar status">
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="excluirProposta(${p.id})" title="Excluir">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
}
