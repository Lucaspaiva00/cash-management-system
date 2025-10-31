const API = "https://cash-management-system.onrender.com";
const cardsContainer = document.querySelector("#cardsResumo");
const filtroPeriodo = document.querySelector("#filtroPeriodo");

const indicadores = [
  { id: "creditos", nome: "Crédito Mensal", cor: "primary", icone: "fa-arrow-up" },
  { id: "debitos", nome: "Débito Mensal", cor: "danger", icone: "fa-arrow-down" },
  { id: "lucro", nome: "Lucro Líquido", cor: "success", icone: "fa-balance-scale" },
  { id: "propostas", nome: "Valor em Propostas", cor: "info", icone: "fa-file-invoice" },
  { id: "aprovadas", nome: "Propostas Aprovadas", cor: "success", icone: "fa-check-circle" },
  { id: "pendentes", nome: "Propostas Pendentes", cor: "warning", icone: "fa-hourglass-half" },
  { id: "clientes", nome: "Clientes Ativos", cor: "secondary", icone: "fa-users" },
  { id: "empresas", nome: "Empresas", cor: "dark", icone: "fa-building" },
];

// === Criação dos cards ===
function criarCards() {
  cardsContainer.innerHTML = "";
  indicadores.forEach((ind) => {
    cardsContainer.innerHTML += `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-${ind.cor} shadow h-100 py-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <div class="text-title text-${ind.cor}">${ind.nome}</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800" id="${ind.id}">R$ 0,00</div>
            </div>
            <i class="fas ${ind.icone} fa-2x text-gray-300"></i>
          </div>
        </div>
      </div>
    `;
  });
}

// === Função fetch segura ===
async function safeFetch(url) {
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const tipo = resp.headers.get("content-type");
  if (!tipo || !tipo.includes("application/json")) return [];
  return await resp.json();
}

// === Função principal ===
async function carregarDashboard(periodo = "mesAtual") {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.empresaId) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }

    // ⚙️ Busca os dados do caixa (sem query param, pois backend não filtra)
    const caixa = await safeFetch(`${API}/caixa`);
    const propostas = await safeFetch(`${API}/propostas`);
    const clientes = await safeFetch(`${API}/clientes`);

    // 🔹 Filtra conforme o período selecionado
    const hoje = new Date();
    const inicio = new Date();
    if (periodo === "7dias") inicio.setDate(hoje.getDate() - 7);
    if (periodo === "mesAtual") inicio.setDate(1);
    if (periodo === "ano") inicio.setMonth(0, 1);

    // ✅ Corrigido: campo genérico (dataOperacao OU data)
    const caixaFiltrada = caixa.filter((op) => {
      const data = new Date(op.dataOperacao || op.data || op.createdAt);
      return data >= inicio && data <= hoje;
    });

    let entrada = 0, saida = 0;
    const evolucao = {};

    caixaFiltrada.forEach((op) => {
      const tipo = op.tipoOperacao || op.tipo;
      const valor = Number(op.valor) || 0;
      const dia = new Date(op.dataOperacao || op.data || op.createdAt).toLocaleDateString("pt-BR");

      if (tipo === "ENTRADA") entrada += valor;
      if (tipo === "SAIDA") saida += valor;

      evolucao[dia] = evolucao[dia] || { entrada: 0, saida: 0 };
      evolucao[dia][tipo === "ENTRADA" ? "entrada" : "saida"] += valor;
    });

    const lucro = entrada - saida;

    atualizarValor("creditos", entrada);
    atualizarValor("debitos", saida);
    atualizarValor("lucro", lucro);

    const totalPropostas = propostas.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
    const aprovadas = propostas.filter((p) => p.status?.toLowerCase() === "fechado").length;
    const pendentes = propostas.filter((p) => p.status?.toLowerCase() === "aberto").length;

    atualizarValor("propostas", totalPropostas);
    document.getElementById("aprovadas").innerText = aprovadas;
    document.getElementById("pendentes").innerText = pendentes;
    document.getElementById("clientes").innerText = clientes.length;
    document.getElementById("empresas").innerText = "1";

    renderizarGraficoBarras(entrada, saida, lucro);
    renderizarGraficoLinha(evolucao);

  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
  }
}

// === Atualiza valores dos cards ===
function atualizarValor(id, valor) {
  document.getElementById(id).innerText = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// === Gráficos ===
function renderizarGraficoBarras(entrada, saida, lucro) {
  const ctx = document.getElementById("graficoBarras")?.getContext("2d");
  if (!ctx) return;
  if (window.graficoBarrasInstance) window.graficoBarrasInstance.destroy();

  window.graficoBarrasInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas", "Lucro Líquido"],
      datasets: [{
        label: "Valores (R$)",
        data: [entrada, saida, lucro],
        backgroundColor: ["#007bff", "#dc3545", "#28a745"],
        borderRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

function renderizarGraficoLinha(evolucao) {
  const ctx = document.getElementById("graficoLinha")?.getContext("2d");
  if (!ctx) return;
  if (window.graficoLinhaInstance) window.graficoLinhaInstance.destroy();

  const dias = Object.keys(evolucao).sort((a, b) => {
    const [dA, mA, yA] = a.split("/").map(Number);
    const [dB, mB, yB] = b.split("/").map(Number);
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  const entradas = dias.map((d) => evolucao[d].entrada);
  const saidas = dias.map((d) => evolucao[d].saida);

  window.graficoLinhaInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: dias,
      datasets: [
        { label: "Entradas", data: entradas, borderColor: "#007bff", borderWidth: 2 },
        { label: "Saídas", data: saidas, borderColor: "#dc3545", borderWidth: 2 },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
}

// === Inicialização ===
document.addEventListener("DOMContentLoaded", () => {
  criarCards();
  carregarDashboard();
});

// 🔹 Atualiza ao trocar filtro
filtroPeriodo?.addEventListener("change", (e) => carregarDashboard(e.target.value));
