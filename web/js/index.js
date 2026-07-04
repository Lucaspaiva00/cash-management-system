const API = "https://cash-management-system.onrender.com";

const cardsContainer = document.querySelector("#cardsResumo");
const filtroMes = document.getElementById("filtroMes");
const btnAplicarFiltro = document.getElementById("btnAplicarFiltro");
const labelPeriodoSelecionado = document.getElementById("labelPeriodoSelecionado");

let graficoFluxoMensal = null;
let graficoDistribuicao = null;
let graficoUltimosMeses = null;

const tituloFluxo = document.getElementById("tituloFluxo");
const tituloDistribuicao = document.getElementById("tituloDistribuicao");
const tituloLucro = document.getElementById("tituloLucro");

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const datasPersonalizadas = document.getElementById("datasPersonalizadas");

const botoesPeriodo = document.querySelectorAll(".periodo-btn");

let periodoSelecionado = "mes";

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

function getDiasNoMes(ano, mes) {
  return new Date(ano, mes, 0).getDate();
}

function inicioDoDia(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fimDoDia(data) {
  const d = new Date(data);
  d.setHours(23, 59, 59, 999);
  return d;
}

function obterPeriodo(periodo) {

  const hoje = new Date();

  let inicio;
  let fim;

  switch (periodo) {

    case "hoje":

      inicio = inicioDoDia(hoje);
      fim = fimDoDia(hoje);

      break;

    case "semana":

      inicio = inicioDoDia(new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - 6
      ));

      fim = fimDoDia(hoje);

      break;

    case "mes":

      inicio = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
      );

      fim = new Date(
        hoje.getFullYear(),
        hoje.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      break;

    case "trimestre":

      inicio = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 2,
        1
      );

      fim = fimDoDia(hoje);

      break;

    case "semestre":

      inicio = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 5,
        1
      );

      fim = fimDoDia(hoje);

      break;

    case "ano":

      inicio = new Date(
        hoje.getFullYear(),
        0,
        1
      );

      fim = fimDoDia(hoje);

      break;

    case "personalizado":

      inicio = inicioDoDia(dataInicio.value);

      fim = fimDoDia(dataFim.value);

      break;

  }

  return {
    inicio,
    fim
  };

}

function filtrarPeriodo(lista, campoData) {

  const periodo = obterPeriodo(periodoSelecionado);

  return lista.filter(item => {

    const data = new Date(item[campoData]);

    return data >= periodo.inicio
      && data <= periodo.fim;

  });

}

function atualizarTitulos() {

  switch (periodoSelecionado) {

    case "hoje":

      tituloFluxo.innerText = "Fluxo de Hoje";
      tituloDistribuicao.innerText = "Distribuição de Hoje";
      tituloLucro.innerText = "Lucro de Hoje";

      break;

    case "semana":

      tituloFluxo.innerText = "Fluxo dos Últimos 7 Dias";
      tituloDistribuicao.innerText = "Distribuição dos Últimos 7 Dias";
      tituloLucro.innerText = "Lucro dos Últimos 7 Dias";

      break;

    case "mes":

      tituloFluxo.innerText = "Fluxo do Mês";
      tituloDistribuicao.innerText = "Distribuição do Mês";
      tituloLucro.innerText = "Lucro do Mês";

      break;

    case "trimestre":

      tituloFluxo.innerText = "Fluxo Trimestral";
      tituloDistribuicao.innerText = "Distribuição Trimestral";
      tituloLucro.innerText = "Lucro Trimestral";

      break;

    case "semestre":

      tituloFluxo.innerText = "Fluxo Semestral";
      tituloDistribuicao.innerText = "Distribuição Semestral";
      tituloLucro.innerText = "Lucro Semestral";

      break;

    case "ano":

      tituloFluxo.innerText = "Fluxo Anual";
      tituloDistribuicao.innerText = "Distribuição Anual";
      tituloLucro.innerText = "Lucro Anual";

      break;

    case "personalizado":

      tituloFluxo.innerText = "Fluxo Personalizado";
      tituloDistribuicao.innerText = "Distribuição Personalizada";
      tituloLucro.innerText = "Lucro Personalizado";

      break;

  }

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

function montarGraficoFluxoPorPeriodo(caixaFiltrado, inicio, fim) {
  const labels = [];
  const entradas = [];
  const saidas = [];

  const diffDias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

  if (periodoSelecionado === "hoje") {
    for (let hora = 0; hora <= 23; hora++) {
      labels.push(`${String(hora).padStart(2, "0")}h`);
      entradas.push(0);
      saidas.push(0);
    }

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);
      const hora = data.getHours();
      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") entradas[hora] += valor;
      if (item.tipoOperacao === "SAIDA") saidas[hora] += valor;
    });
  } else if (diffDias <= 31) {
    const dataAtual = new Date(inicio);

    while (dataAtual <= fim) {
      labels.push(dataAtual.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }));

      entradas.push(0);
      saidas.push(0);

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);
      data.setHours(0, 0, 0, 0);

      const indice = Math.floor((data - inicioDoDia(inicio)) / (1000 * 60 * 60 * 24));
      const valor = Number(item.valor || 0);

      if (indice < 0 || indice >= labels.length) return;

      if (item.tipoOperacao === "ENTRADA") entradas[indice] += valor;
      if (item.tipoOperacao === "SAIDA") saidas[indice] += valor;
    });
  } else {
    const meses = {};

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);

      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

      if (!meses[chave]) {
        meses[chave] = {
          label: data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          }),
          entrada: 0,
          saida: 0,
        };
      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") meses[chave].entrada += valor;
      if (item.tipoOperacao === "SAIDA") meses[chave].saida += valor;
    });

    Object.keys(meses).sort().forEach((chave) => {
      labels.push(meses[chave].label);
      entradas.push(meses[chave].entrada);
      saidas.push(meses[chave].saida);
    });
  }

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
        legend: { position: "top" },
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

function montarGraficoLucroPorPeriodo(caixaFiltrado, inicio, fim) {
  const labels = [];
  const lucros = [];

  const diffDias = Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24));

  if (periodoSelecionado === "hoje") {
    for (let hora = 0; hora <= 23; hora++) {
      labels.push(`${String(hora).padStart(2, "0")}h`);
      lucros.push(0);
    }

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);
      const hora = data.getHours();
      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") lucros[hora] += valor;
      if (item.tipoOperacao === "SAIDA") lucros[hora] -= valor;
    });
  } else if (diffDias <= 31) {
    const dataAtual = new Date(inicio);

    while (dataAtual <= fim) {
      labels.push(dataAtual.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }));

      lucros.push(0);

      dataAtual.setDate(dataAtual.getDate() + 1);
    }

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);
      data.setHours(0, 0, 0, 0);

      const indice = Math.floor((data - inicioDoDia(inicio)) / (1000 * 60 * 60 * 24));
      const valor = Number(item.valor || 0);

      if (indice < 0 || indice >= labels.length) return;

      if (item.tipoOperacao === "ENTRADA") lucros[indice] += valor;
      if (item.tipoOperacao === "SAIDA") lucros[indice] -= valor;
    });
  } else {
    const meses = {};

    caixaFiltrado.forEach((item) => {
      const data = new Date(item.dataOperacao);

      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

      if (!meses[chave]) {
        meses[chave] = {
          label: data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          }),
          lucro: 0,
        };
      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") meses[chave].lucro += valor;
      if (item.tipoOperacao === "SAIDA") meses[chave].lucro -= valor;
    });

    Object.keys(meses).sort().forEach((chave) => {
      labels.push(meses[chave].label);
      lucros.push(meses[chave].lucro);
    });
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
        legend: { display: true },
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

    atualizarTitulos();

    const periodo = obterPeriodo(periodoSelecionado);

    if (!periodo || !periodo.inicio || !periodo.fim || isNaN(periodo.inicio) || isNaN(periodo.fim)) {
      alert("Selecione um período válido.");
      return;
    }

    labelPeriodoSelecionado.innerText =
      `Período: ${periodo.inicio.toLocaleDateString("pt-BR")} até ${periodo.fim.toLocaleDateString("pt-BR")}`;

    const [caixa, propostas, clientes] = await Promise.all([
      fetchJson(`${API}/caixa?empresaId=${usuario.empresaId}`),
      fetchJson(`${API}/propostas?empresaId=${usuario.empresaId}`),
      fetchJson(`${API}/clientes?empresaId=${usuario.empresaId}`),
    ]);

    const caixaFiltrado = filtrarPeriodo(caixa, "dataOperacao");
    const propostasFiltradas = filtrarPeriodo(propostas, "data");

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

    montarGraficoFluxoPorPeriodo(caixaFiltrado, periodo.inicio, periodo.fim);
    montarGraficoDistribuicao(entrada, saida);
    montarGraficoLucroPorPeriodo(caixaFiltrado, periodo.inicio, periodo.fim);

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
    alert("Erro ao carregar dashboard. Verifique o console para mais detalhes.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  criarCards();

  carregarDashboard();

  botoesPeriodo.forEach((botao) => {
    botao.addEventListener("click", () => {
      botoesPeriodo.forEach((b) => b.classList.remove("active"));

      botao.classList.add("active");

      periodoSelecionado = botao.dataset.periodo;

      if (periodoSelecionado === "personalizado") {
        datasPersonalizadas.style.display = "flex";
        return;
      }

      datasPersonalizadas.style.display = "none";

      carregarDashboard();
    });
  });

  if (btnAplicarFiltro) {
    btnAplicarFiltro.addEventListener("click", carregarDashboard);
  }

  const menuToggleMobile = document.getElementById("menuToggleMobile");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggleMobile && sidebar) {
    menuToggleMobile.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    document.addEventListener("click", function (e) {
      if (
        !sidebar.contains(e.target) &&
        !menuToggleMobile.contains(e.target)
      ) {
        sidebar.classList.remove("active");
      }
    });
  }
});