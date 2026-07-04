const API = "https://cash-management-system.onrender.com";

/* ============================
   ELEMENTOS DA TELA
============================ */

const cardsContainer = document.querySelector("#cardsResumo");
const btnAplicarFiltro = document.getElementById("btnAplicarFiltro");
const labelPeriodoSelecionado = document.getElementById("labelPeriodoSelecionado");

const tituloFluxo = document.getElementById("tituloFluxo");
const tituloDistribuicao = document.getElementById("tituloDistribuicao");
const tituloLucro = document.getElementById("tituloLucro");

const dataInicio = document.getElementById("dataInicio");
const dataFim = document.getElementById("dataFim");
const datasPersonalizadas = document.getElementById("datasPersonalizadas");

const botoesPeriodo = document.querySelectorAll(".periodo-btn");

/* ============================
   CACHE
============================ */

let caixaCache = [];
let propostasCache = [];
let clientesCache = [];

let dadosCarregados = false;

/* ============================
   GRÁFICOS
============================ */

let graficoFluxoMensal = null;
let graficoDistribuicao = null;
let graficoLucro = null;

/* ============================
   FILTRO
============================ */

let periodoSelecionado = "mes";

/* ============================
   CARDS
============================ */

const indicadores = [

  {
    id: "creditos",
    nome: "Entradas",
    cor: "primary",
    icone: "fa-arrow-up",
    moeda: true
  },

  {
    id: "debitos",
    nome: "Saídas",
    cor: "danger",
    icone: "fa-arrow-down",
    moeda: true
  },

  {
    id: "lucro",
    nome: "Lucro",
    cor: "success",
    icone: "fa-balance-scale",
    moeda: true
  },

  {
    id: "propostas",
    nome: "Valor em Propostas",
    cor: "info",
    icone: "fa-file-invoice",
    moeda: true
  },

  {
    id: "aprovadas",
    nome: "Aprovadas",
    cor: "success",
    icone: "fa-check-circle",
    moeda: false
  },

  {
    id: "pendentes",
    nome: "Pendentes",
    cor: "warning",
    icone: "fa-hourglass-half",
    moeda: false
  },

  {
    id: "clientes",
    nome: "Clientes",
    cor: "secondary",
    icone: "fa-users",
    moeda: false
  },

  {
    id: "empresas",
    nome: "Empresas",
    cor: "dark",
    icone: "fa-building",
    moeda: false
  }

];

/* ============================
   CARDS
============================ */
function criarCards() {

  cardsContainer.innerHTML = "";

  indicadores.forEach(ind => {

    cardsContainer.innerHTML += `

      <div class="col-xl-3 col-md-6 mb-4">

        <div class="metric-card metric-${ind.cor}">

          <div class="metric-top">

            <div>
              <div class="metric-label">
                ${ind.nome}
              </div>
            </div>

            <div class="metric-icon">
              <i class="fas ${ind.icone}"></i>
            </div>

          </div>

          <div
            id="${ind.id}"
            class="metric-value">

            ${ind.moeda ? "R$ 0,00" : "0"}

          </div>

          <div class="metric-footer">
            Período selecionado
          </div>

        </div>

      </div>

    `;

  });

}

/* ============================
   FETCH
============================ */

async function fetchJson(url) {

  const response = await fetch(url);

  if (!response.ok) {

    const texto = await response.text();

    throw new Error(
      `Erro ${response.status} ao acessar ${url}: ${texto}`
    );

  }

  return response.json();

}

/* ============================
   CACHE
============================ */

async function carregarDados(usuario) {

  if (dadosCarregados) return;

  const [caixa, propostas, clientes] = await Promise.all([

    fetchJson(`${API}/caixa?empresaId=${usuario.empresaId}`),

    fetchJson(`${API}/propostas?empresaId=${usuario.empresaId}`),

    fetchJson(`${API}/clientes?empresaId=${usuario.empresaId}`)

  ]);

  caixaCache = caixa;
  propostasCache = propostas;
  clientesCache = clientes;

  dadosCarregados = true;

}

/* ============================
   FORMATADORES
============================ */

function formatarMoeda(valor) {

  return Number(valor || 0).toLocaleString("pt-BR", {

    style: "currency",

    currency: "BRL"

  });

}

function atualizarValor(id, valor, moeda = true) {

  const el = document.getElementById(id);

  if (!el) return;

  el.innerText = moeda
    ? formatarMoeda(valor)
    : Number(valor || 0);

}

/* ============================
   DATAS
============================ */

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

/* ============================
   PERÍODOS
============================ */

function obterPeriodo(periodo) {

  if (periodo === "personalizado") {

    if (!dataInicio.value || !dataFim.value) {

      return null;

    }

  }

  const hoje = new Date();

  let inicio;

  let fim;

  switch (periodo) {

    case "hoje":

      inicio = inicioDoDia(hoje);
      fim = fimDoDia(hoje);

      break;

    case "semana":

      inicio = inicioDoDia(
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() - 6
        )
      );

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

/* ============================
   FILTRAGEM
============================ */

function filtrarPeriodo(lista, campoData) {

  const periodo = obterPeriodo(periodoSelecionado);

  if (!periodo) return [];

  return lista.filter(item => {

    if (!item[campoData]) return false;

    const data = new Date(item[campoData]);

    return data >= periodo.inicio &&
      data <= periodo.fim;

  });

}

/* ============================
   TÍTULOS
============================ */

function atualizarTitulos() {

  const textos = {

    hoje: "Hoje",

    semana: "Últimos 7 Dias",

    mes: "Mês",

    trimestre: "Trimestre",

    semestre: "Semestre",

    ano: "Ano",

    personalizado: "Período Personalizado"

  };

  const texto = textos[periodoSelecionado];

  tituloFluxo.innerText = `Fluxo Financeiro - ${texto}`;

  tituloDistribuicao.innerText = `Distribuição Financeira`;

  tituloLucro.innerText = `Lucro Líquido - ${texto}`;

}

/* ============================
   GRÁFICOS
============================ */

function destruirGraficos() {

  graficoFluxoMensal?.destroy();

  graficoDistribuicao?.destroy();

  graficoLucro?.destroy();

}

function montarGraficoDistribuicao(entrada, saida) {

  graficoDistribuicao?.destroy();

  const total = entrada + saida;

  const percentualEntrada =
    total > 0 ? ((entrada / total) * 100).toFixed(1) : 0;

  const percentualSaida =
    total > 0 ? ((saida / total) * 100).toFixed(1) : 0;

  const ctx = document
    .getElementById("graficoDistribuicao")
    .getContext("2d");

  graficoDistribuicao = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels: [

        "Entradas",

        "Saídas"

      ],

      datasets: [

        {

          data: [

            entrada,

            saida

          ],

          backgroundColor: [

            "#1cc88a",

            "#e74a3b"

          ],

          hoverBackgroundColor: [

            "#17a673",

            "#c0392b"

          ],

          borderColor: "#ffffff",

          borderWidth: 3,

          hoverOffset: 15

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      cutout: "65%",

      animation: {

        animateRotate: true,

        animateScale: true

      },

      plugins: {

        legend: {

          position: "bottom",

          labels: {

            usePointStyle: true,

            pointStyle: "circle",

            padding: 20,

            font: {

              size: 13,

              weight: "bold"

            }

          }

        },

        tooltip: {

          callbacks: {

            label: function (context) {

              const percentual = context.dataIndex === 0
                ? percentualEntrada
                : percentualSaida;

              return `${context.label}: ${formatarMoeda(context.raw)} (${percentual}%)`;

            }

          }

        }

      }

    }

  });

}
function montarGraficoFluxoPorPeriodo(caixaFiltrado, inicio, fim) {

  graficoFluxoMensal?.destroy();

  const labels = [];
  const entradas = [];
  const saidas = [];

  const diffDias = Math.max(
    1,
    Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))
  );

  if (periodoSelecionado === "hoje") {

    for (let hora = 0; hora < 24; hora++) {

      labels.push(`${String(hora).padStart(2, "0")}h`);
      entradas.push(0);
      saidas.push(0);

    }

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const hora = data.getHours();

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") entradas[hora] += valor;

      if (item.tipoOperacao === "SAIDA") saidas[hora] += valor;

    });

  }

  else if (diffDias <= 31) {

    const mapa = {};

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const chave = data.toISOString().slice(0, 10);

      if (!mapa[chave]) {

        mapa[chave] = {

          label: data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit"
          }),

          entrada: 0,

          saida: 0

        };

      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        mapa[chave].entrada += valor;

      if (item.tipoOperacao === "SAIDA")
        mapa[chave].saida += valor;

    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {

        labels.push(mapa[chave].label);

        entradas.push(mapa[chave].entrada);

        saidas.push(mapa[chave].saida);

      });

  }

  else {

    const mapa = {};

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const chave =
        `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

      if (!mapa[chave]) {

        mapa[chave] = {

          label: data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit"
          }),

          entrada: 0,

          saida: 0

        };

      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        mapa[chave].entrada += valor;

      if (item.tipoOperacao === "SAIDA")
        mapa[chave].saida += valor;

    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {

        labels.push(mapa[chave].label);

        entradas.push(mapa[chave].entrada);

        saidas.push(mapa[chave].saida);

      });

  }

  const ctx = document
    .getElementById("graficoFluxoMensal")
    .getContext("2d");

  graficoFluxoMensal = new Chart(ctx, {

    type: "bar",

    data: {

      labels,

      datasets: [

        {

          label: "Entradas",

          data: entradas,

          backgroundColor: "#1cc88a",

          borderColor: "#17a673",

          borderWidth: 1,

          borderRadius: 8,

          maxBarThickness: 40

        },

        {

          label: "Saídas",

          data: saidas,

          backgroundColor: "#e74a3b",

          borderColor: "#c0392b",

          borderWidth: 1,

          borderRadius: 8,

          maxBarThickness: 40

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      interaction: {

        mode: "index",

        intersect: false

      },

      plugins: {

        legend: {

          position: "top",

          labels: {

            usePointStyle: true,

            pointStyle: "circle",

            font: {

              size: 13,

              weight: "bold"

            }

          }

        },

        tooltip: {

          callbacks: {

            label(context) {

              return `${context.dataset.label}: ${formatarMoeda(context.raw)}`;

            }

          }

        }

      },

      scales: {

        x: {

          grid: {

            display: false

          }

        },

        y: {

          beginAtZero: true,

          ticks: {

            callback(value) {

              return formatarMoeda(value);

            }

          }

        }

      }

    }

  });

}

function montarGraficoLucroPorPeriodo(caixaFiltrado, inicio, fim) {

  graficoLucro?.destroy();

  const labels = [];
  const lucros = [];

  const diffDias = Math.max(
    1,
    Math.ceil((fim - inicio) / (1000 * 60 * 60 * 24))
  );

  if (periodoSelecionado === "hoje") {

    for (let hora = 0; hora < 24; hora++) {

      labels.push(`${String(hora).padStart(2, "0")}h`);
      lucros.push(0);

    }

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const hora = data.getHours();

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        lucros[hora] += valor;

      if (item.tipoOperacao === "SAIDA")
        lucros[hora] -= valor;

    });

  }

  else if (diffDias <= 31) {

    const mapa = {};

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const chave = data.toISOString().slice(0, 10);

      if (!mapa[chave]) {

        mapa[chave] = {

          label: data.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit"
          }),

          lucro: 0

        };

      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        mapa[chave].lucro += valor;

      if (item.tipoOperacao === "SAIDA")
        mapa[chave].lucro -= valor;

    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {

        labels.push(mapa[chave].label);

        lucros.push(mapa[chave].lucro);

      });

  }

  else {

    const mapa = {};

    caixaFiltrado.forEach(item => {

      const data = new Date(item.dataOperacao);

      const chave =
        `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

      if (!mapa[chave]) {

        mapa[chave] = {

          label: data.toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit"
          }),

          lucro: 0

        };

      }

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        mapa[chave].lucro += valor;

      if (item.tipoOperacao === "SAIDA")
        mapa[chave].lucro -= valor;

    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {

        labels.push(mapa[chave].label);

        lucros.push(mapa[chave].lucro);

      });

  }

  const ctx = document
    .getElementById("graficoLucro")
    .getContext("2d");

  graficoLucro = new Chart(ctx, {

    type: "line",

    data: {

      labels,

      datasets: [

        {

          label: "Lucro Líquido",

          data: lucros,

          borderColor: "#1cc88a",

          backgroundColor: "rgba(28,200,138,0.12)",

          fill: true,

          tension: 0.35,

          pointRadius: 4,

          pointHoverRadius: 6,

          pointBackgroundColor: "#1cc88a",

          pointBorderColor: "#ffffff",

          pointBorderWidth: 2,

          borderWidth: 3

        }

      ]

    },

    options: {

      responsive: true,

      maintainAspectRatio: false,

      interaction: {

        mode: "index",

        intersect: false

      },

      plugins: {

        legend: {

          display: true,

          labels: {

            usePointStyle: true,

            pointStyle: "circle",

            font: {

              size: 13,

              weight: "bold"

            }

          }

        },

        tooltip: {

          callbacks: {

            label(context) {

              return `Lucro: ${formatarMoeda(context.raw)}`;

            }

          }

        }

      },

      scales: {

        x: {

          grid: {

            display: false

          }

        },

        y: {

          beginAtZero: true,

          ticks: {

            callback(value) {

              return formatarMoeda(value);

            }

          }

        }

      }

    }

  });

}

async function carregarDashboard() {

  try {

    const usuario = JSON.parse(
      localStorage.getItem("usuarioLogado")
    );

    if (!usuario || !usuario.empresaId) {

      alert("Sessão expirada. Faça login novamente.");

      window.location.href = "login.html";

      return;

    }

    await carregarDados(usuario);

    atualizarTitulos();

    const periodo = obterPeriodo(periodoSelecionado);

    if (!periodo) {

      alert("Selecione um período válido.");

      return;

    }

    labelPeriodoSelecionado.innerHTML = `
            <strong>
                ${periodo.inicio.toLocaleDateString("pt-BR")}
            </strong>

            até

            <strong>
                ${periodo.fim.toLocaleDateString("pt-BR")}
            </strong>
        `;

    const caixaFiltrado = filtrarPeriodo(
      caixaCache,
      "dataOperacao"
    );

    const propostasFiltradas = filtrarPeriodo(
      propostasCache,
      "data"
    );

    let entrada = 0;

    let saida = 0;

    caixaFiltrado.forEach(item => {

      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA")
        entrada += valor;

      if (item.tipoOperacao === "SAIDA")
        saida += valor;

    });

    const lucro = entrada - saida;
    const heroReceita = document.getElementById("heroReceita");
    const heroLucro = document.getElementById("heroLucro");
    const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");

    if (heroReceita) {
      heroReceita.innerText = formatarMoeda(entrada);
    }

    if (heroLucro) {
      heroLucro.innerText = `Lucro líquido: ${formatarMoeda(lucro)}`;
    }

    if (ultimaAtualizacao) {
      ultimaAtualizacao.innerText = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    const totalPropostas = propostasFiltradas.reduce(

      (total, item) => {

        return total + Number(item.valorTotal || 0);

      },

      0

    );

    const aprovadas = propostasFiltradas.filter(item =>

      ["fechado", "aprovado"]
        .includes((item.status || "").toLowerCase())

    ).length;

    const pendentes = propostasFiltradas.filter(item =>

      ["aberto", "pendente"]
        .includes((item.status || "").toLowerCase())

    ).length;

    atualizarValor("creditos", entrada);

    atualizarValor("debitos", saida);

    atualizarValor("lucro", lucro);

    atualizarValor("propostas", totalPropostas);

    atualizarValor("aprovadas", aprovadas, false);

    atualizarValor("pendentes", pendentes, false);

    atualizarValor(
      "clientes",
      clientesCache.length,
      false
    );

    atualizarValor(
      "empresas",
      1,
      false
    );

    destruirGraficos();

    montarGraficoFluxoPorPeriodo(

      caixaFiltrado,

      periodo.inicio,

      periodo.fim

    );

    montarGraficoDistribuicao(

      entrada,

      saida

    );

    montarGraficoLucroPorPeriodo(

      caixaFiltrado,

      periodo.inicio,

      periodo.fim

    );

  }

  catch (error) {

    console.error(error);

    alert(
      "Erro ao carregar dashboard."
    );

  }

}

document.addEventListener("DOMContentLoaded", async () => {

  criarCards();

  await carregarDashboard();

  botoesPeriodo.forEach(botao => {

    botao.addEventListener("click", () => {

      botoesPeriodo.forEach(b => {

        b.classList.remove("active");
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline-primary");

      });

      botao.classList.remove("btn-outline-primary");
      botao.classList.add("btn-primary");
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

  btnAplicarFiltro?.addEventListener(

    "click",

    carregarDashboard

  );

  const menuToggleMobile =
    document.getElementById("menuToggleMobile");

  const sidebar =
    document.querySelector(".sidebar");

  if (menuToggleMobile && sidebar) {

    menuToggleMobile.addEventListener("click", () => {

      sidebar.classList.toggle("active");

    });

    document.addEventListener("click", e => {

      if (

        !sidebar.contains(e.target) &&

        !menuToggleMobile.contains(e.target)

      ) {

        sidebar.classList.remove("active");

      }

    });

  }

});