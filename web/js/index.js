const API = "https://cash-management-system.onrender.com";

const cardsContainer = document.querySelector("#cardsResumo");
const filtroMes = document.getElementById("filtroMes");
const btnAplicarFiltro = document.getElementById("btnAplicarFiltro");
const labelPeriodoSelecionado = document.getElementById("labelPeriodoSelecionado");

let graficoFluxoMensal = null;
let graficoDistribuicao = null;
let graficoUltimosMeses = null;

const indicadores = [
  {
    id: "creditos",
    nome: "Crédito do Mês",
    cor: "primary",
    icone: "fa-arrow-up",
    moeda: true,
  },
  {
    id: "debitos",
    nome: "Débito do Mês",
    cor: "danger",
    icone: "fa-arrow-down",
    moeda: true,
  },
  {
    id: "lucro",
    nome: "Lucro Líquido",
    cor: "success",
    icone: "fa-balance-scale",
    moeda: true,
  },
  {
    id: "propostas",
    nome: "Propostas do Mês",
    cor: "info",
    icone: "fa-file-invoice",
    moeda: true,
  },
  {
    id: "aprovadas",
    nome: "Propostas Aprovadas",
    cor: "success",
    icone: "fa-check-circle",
    moeda: false,
  },
  {
    id: "pendentes",
    nome: "Propostas Pendentes",
    cor: "warning",
    icone: "fa-hourglass-half",
    moeda: false,
  },
  {
    id: "clientes",
    nome: "Clientes Cadastrados",
    cor: "secondary",
    icone: "fa-users",
    moeda: false,
  },
  {
    id: "empresas",
    nome: "Empresas",
    cor: "dark",
    icone: "fa-building",
    moeda: false,
  },
];

function criarCards() {
  cardsContainer.innerHTML = "";

  indicadores.forEach((ind) => {
    cardsContainer.innerHTML += `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card card-resumo border-left-${ind.cor} shadow h-100 py-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <div class="text-title text-${ind.cor}">${ind.nome}</div>
              <div class="h5 mb-0 font-weight-bold text-gray-800" id="${ind.id}">
                ${ind.moeda ? "R$ 0,00" : "0"}
              </div>
            </div>
            <i class="fas ${ind.icone} fa-2x text-gray-300"></i>
          </div>
        </div>
      </div>
    `;
  });
}

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`Erro ${response.status} ao acessar ${url}: ${texto}`);
  }

  return response.json();
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function atualizarValor(id, valor, moeda = true) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = moeda ? formatarMoeda(valor) : Number(valor || 0);
}

function getMesAtualInput() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function getNomeMesAno(ano, mes) {
  const data = new Date(ano, mes - 1, 1);
  return data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

function getDiasNoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

function dataEstaNoMes(dataString, ano, mes) {
  if (!dataString) return false;

  const data = new Date(dataString);
  if (isNaN(data.getTime())) return false;

  return data.getFullYear() === ano && data.getMonth() + 1 === mes;
}

function destruirGraficos() {
  if (graficoFluxoMensal) graficoFluxoMensal.destroy();
  if (graficoDistribuicao) graficoDistribuicao.destroy();
  if (graficoUltimosMeses) graficoUltimosMeses.destroy();
}

function montarGraficoFluxoMensal(caixaFiltrado, ano, mes) {
  const diasNoMes = getDiasNoMes(ano, mes);
  const labels = [];
  const entradas = [];
  const saidas = [];

  for (let dia = 1; dia <= diasNoMes; dia++) {
    labels.push(String(dia).padStart(2, "0"));
    entradas.push(0);
    saidas.push(0);
  }

  caixaFiltrado.forEach((item) => {
    const data = new Date(item.dataOperacao);
    if (isNaN(data.getTime())) return;

    const indiceDia = data.getDate() - 1;
    const valor = Number(item.valor || 0);

    if (item.tipoOperacao === "ENTRADA") {
      entradas[indiceDia] += valor;
    }

    if (item.tipoOperacao === "SAIDA") {
      saidas[indiceDia] += valor;
    }
  });

  const ctx = document.getElementById("graficoFluxoMensal").getContext("2d");

  graficoFluxoMensal = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Entradas",
          data: entradas,
          backgroundColor: "rgba(28, 200, 138, 0.75)",
          borderColor: "rgba(28, 200, 138, 1)",
          borderWidth: 1,
          borderRadius: 6,
        },
        {
          label: "Saídas",
          data: saidas,
          backgroundColor: "rgba(231, 74, 59, 0.75)",
          borderColor: "rgba(231, 74, 59, 1)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatarMoeda(context.raw)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatarMoeda(value);
            },
          },
        },
      },
    },
  });
}

function montarGraficoDistribuicao(entrada, saida) {
  const ctx = document.getElementById("graficoDistribuicao").getContext("2d");

  graficoDistribuicao = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [entrada, saida],
          backgroundColor: [
            "rgba(78, 115, 223, 0.9)",
            "rgba(231, 74, 59, 0.9)",
          ],
          borderColor: ["#fff", "#fff"],
          borderWidth: 3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${formatarMoeda(context.raw)}`;
            },
          },
        },
      },
    },
  });
}

function montarGraficoUltimosMeses(caixa, anoSelecionado, mesSelecionado) {
  const labels = [];
  const lucros = [];

  for (let i = 5; i >= 0; i--) {
    const base = new Date(anoSelecionado, mesSelecionado - 1 - i, 1);
    const ano = base.getFullYear();
    const mes = base.getMonth() + 1;

    let entradas = 0;
    let saidas = 0;

    caixa.forEach((item) => {
      if (!dataEstaNoMes(item.dataOperacao, ano, mes)) return;

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") entradas += valor;
      if (item.tipoOperacao === "SAIDA") saidas += valor;
    });

    labels.push(
      base.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      })
    );

    lucros.push(entradas - saidas);
  }

  const ctx = document.getElementById("graficoUltimosMeses").getContext("2d");

  graficoUltimosMeses = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Lucro líquido",
          data: lucros,
          borderColor: "rgba(28, 200, 138, 1)",
          backgroundColor: "rgba(28, 200, 138, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Lucro: ${formatarMoeda(context.raw)}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return formatarMoeda(value);
            },
          },
        },
      },
    },
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

    if (!filtroMes.value) {
      filtroMes.value = getMesAtualInput();
    }

    const [anoStr, mesStr] = filtroMes.value.split("-");
    const ano = Number(anoStr);
    const mes = Number(mesStr);

    labelPeriodoSelecionado.innerText = `Exibindo dados de ${getNomeMesAno(ano, mes)}`;

    const [caixa, propostas, clientes] = await Promise.all([
      fetchJson(`${API}/caixa?empresaId=${usuario.empresaId}`),
      fetchJson(`${API}/propostas?empresaId=${usuario.empresaId}`),
      fetchJson(`${API}/clientes?empresaId=${usuario.empresaId}`),
    ]);

    const caixaFiltrado = caixa.filter((item) =>
      dataEstaNoMes(item.dataOperacao, ano, mes)
    );

    const propostasFiltradas = propostas.filter((item) =>
      dataEstaNoMes(item.data, ano, mes)
    );

    let entrada = 0;
    let saida = 0;

    caixaFiltrado.forEach((item) => {
      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") entrada += valor;
      if (item.tipoOperacao === "SAIDA") saida += valor;
    });

    const lucro = entrada - saida;

    const totalPropostas = propostasFiltradas.reduce((acc, item) => {
      return acc + Number(item.valorTotal || 0);
    }, 0);

    const aprovadas = propostasFiltradas.filter((item) =>
      ["fechado", "aprovado"].includes((item.status || "").toLowerCase())
    ).length;

    const pendentes = propostasFiltradas.filter((item) =>
      ["aberto", "pendente"].includes((item.status || "").toLowerCase())
    ).length;

    atualizarValor("creditos", entrada, true);
    atualizarValor("debitos", saida, true);
    atualizarValor("lucro", lucro, true);
    atualizarValor("propostas", totalPropostas, true);
    atualizarValor("aprovadas", aprovadas, false);
    atualizarValor("pendentes", pendentes, false);
    atualizarValor("clientes", clientes.length, false);
    atualizarValor("empresas", 1, false);

    destruirGraficos();
    montarGraficoFluxoMensal(caixaFiltrado, ano, mes);
    montarGraficoDistribuicao(entrada, saida);
    montarGraficoUltimosMeses(caixa, ano, mes);
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    alert("Erro ao carregar dashboard. Verifique o console para mais detalhes.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  criarCards();

  if (filtroMes) {
    filtroMes.value = getMesAtualInput();
  }

  carregarDashboard();

  if (btnAplicarFiltro) {
    btnAplicarFiltro.addEventListener("click", carregarDashboard);
  }

  if (filtroMes) {
    filtroMes.addEventListener("change", carregarDashboard);
  }
});

// ===== MENU MOBILE =====
const menuToggleMobile = document.getElementById("menuToggleMobile");
const sidebar = document.querySelector(".sidebar");

if (menuToggleMobile && sidebar) {
  menuToggleMobile.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

// fechar ao clicar fora
document.addEventListener("click", function (e) {
  if (
    sidebar &&
    !sidebar.contains(e.target) &&
    !menuToggleMobile.contains(e.target)
  ) {
    sidebar.classList.remove("active");
  }
});