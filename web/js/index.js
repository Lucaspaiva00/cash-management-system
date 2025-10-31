const API = "https://cash-management-system.onrender.com";
const cardsContainer = document.querySelector("#cardsResumo");

const indicadores = [
  {
    id: "creditos",
    nome: "Crédito Mensal",
    cor: "primary",
    icone: "fa-arrow-up",
  },
  {
    id: "debitos",
    nome: "Débito Mensal",
    cor: "danger",
    icone: "fa-arrow-down",
  },
  {
    id: "lucro",
    nome: "Lucro Líquido",
    cor: "success",
    icone: "fa-balance-scale",
  },
  {
    id: "propostas",
    nome: "Valor em Propostas",
    cor: "info",
    icone: "fa-file-invoice",
  },
  {
    id: "aprovadas",
    nome: "Propostas Aprovadas",
    cor: "success",
    icone: "fa-check-circle",
  },
  {
    id: "pendentes",
    nome: "Propostas Pendentes",
    cor: "warning",
    icone: "fa-hourglass-half",
  },
  {
    id: "clientes",
    nome: "Clientes Ativos",
    cor: "secondary",
    icone: "fa-users",
  },
  { id: "empresas", nome: "Empresas", cor: "dark", icone: "fa-building" },
];

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

async function carregarDashboard() {
  try {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario || !usuario.empresaId) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }

    // --- Caixa (Entradas/Saídas) ---
    const caixa = await fetch(`${API}/caixa?empresaId=${usuario.empresaId}`).then((r) => r.json());

    let entrada = 0, saida = 0;
    const evolucao = {};

    caixa.forEach((op) => {
      const dia = new Date(op.dataOperacao).toLocaleDateString("pt-BR");
      if (op.tipoOperacao === "ENTRADA") entrada += op.valor;
      if (op.tipoOperacao === "SAIDA") saida += op.valor;

      evolucao[dia] = evolucao[dia] || { entrada: 0, saida: 0 };
      evolucao[dia][op.tipoOperacao === "ENTRADA" ? "entrada" : "saida"] += op.valor;
    });

    const lucro = entrada - saida;
    atualizarValor("creditos", entrada);
    atualizarValor("debitos", saida);
    atualizarValor("lucro", lucro);

    // --- Propostas ---
    const propostas = await fetch(`${API}/propostas?empresaId=${usuario.empresaId}`).then((r) => r.json());
    const totalPropostas = propostas.reduce((acc, p) => acc + (p.valorTotal || 0), 0);
    const aprovadas = propostas.filter((p) => p.status?.toLowerCase() === "fechado").length;
    const pendentes = propostas.filter((p) => p.status?.toLowerCase() === "aberto").length;
    atualizarValor("propostas", totalPropostas);
    document.getElementById("aprovadas").innerText = aprovadas;
    document.getElementById("pendentes").innerText = pendentes;

    // --- Clientes ---
    const clientes = await fetch(`${API}/clientes?empresaId=${usuario.empresaId}`).then((r) => r.json());
    document.getElementById("clientes").innerText = clientes.length;

    // --- Empresas ---
    const empresas = await fetch(`${API}/empresas`).then((r) => r.json());
    document.getElementById("empresas").innerText = empresas.length;

    // --- Gráficos ---
    renderizarGraficoBarras(entrada, saida, lucro);
    renderizarGraficoLinha(evolucao);

  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
  }
}


function atualizarValor(id, valor) {
  document.getElementById(id).innerText = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function renderizarGraficoBarras(entrada, saida, lucro) {
  const ctx = document.getElementById("graficoBarras").getContext("2d");
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
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `R$ ${value.toLocaleString("pt-BR")}`,
          },
        },
      },
    },
  });
}

function renderizarGraficoLinha(evolucao) {
  const ctx = document.getElementById("graficoLinha").getContext("2d");
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
        {
          label: "Entradas",
          data: entradas,
          borderColor: "#007bff",
          borderWidth: 2,
          tension: 0.3,
        },
        {
          label: "Saídas",
          data: saidas,
          borderColor: "#dc3545",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `R$ ${value.toLocaleString("pt-BR")}`,
          },
        },
      },
    },
  });
}


document.addEventListener("DOMContentLoaded", () => {
  criarCards();
  carregarDashboard();
});
