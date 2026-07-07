const API = API_BASE;

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

let caixaCache = [];
let propostasCache = [];
let clientesCache = [];
let vendasCache = [];
let dadosCarregados = false;

let graficoFluxoMensal = null;
let graficoDistribuicao = null;
let graficoLucro = null;

let periodoSelecionado = "mes";

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
    nome: "Saldo Caixa",
    cor: "success",
    icone: "fa-chart-line",
    moeda: true
  },
  {
    id: "lucroVendas",
    nome: "Lucro Vendas",
    cor: "info",
    icone: "fa-coins",
    moeda: true
  },
  {
    id: "propostas",
    nome: "Valor em Propostas",
    cor: "info",
    icone: "fa-file-invoice-dollar",
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

function criarCards() {
  cardsContainer.innerHTML = "";

  indicadores.forEach(ind => {
    cardsContainer.innerHTML += `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="metric-card metric-${ind.cor}">
          <div class="metric-top">
            <div>
              <div class="metric-label">${ind.nome}</div>
            </div>

            <div class="metric-icon">
              <i class="fas ${ind.icone}"></i>
            </div>
          </div>

          <div id="${ind.id}" class="metric-value">
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

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`Erro ${response.status} ao acessar ${url}: ${texto}`);
  }

  return response.json();
}

async function carregarDados(usuario) {
  if (dadosCarregados) return;

  const [caixa, propostas, clientes, vendas] = await Promise.all([
    fetchJson(`${API}/caixa?empresaId=${usuario.empresaId}`),
    fetchJson(`${API}/propostas?empresaId=${usuario.empresaId}`),
    fetchJson(`${API}/clientes?empresaId=${usuario.empresaId}`),
    fetchJson(`${API}/vendas?empresaId=${usuario.empresaId}`)
  ]);

  caixaCache = caixa || [];
  propostasCache = propostas || [];
  clientesCache = clientes || [];
  vendasCache = vendas || [];
  dadosCarregados = true;
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function animarNumero(elemento, valorFinal, moeda = true) {
  if (!elemento) return;

  const duracao = 650;
  const inicio = performance.now();
  const valorInicial = 0;

  function animar(tempoAtual) {
    const progresso = Math.min((tempoAtual - inicio) / duracao, 1);
    const valorAtual = valorInicial + (valorFinal - valorInicial) * progresso;

    elemento.innerText = moeda
      ? formatarMoeda(valorAtual)
      : Math.round(valorAtual);

    if (progresso < 1) {
      requestAnimationFrame(animar);
    }
  }

  requestAnimationFrame(animar);
}

function atualizarValor(id, valor, moeda = true) {
  const el = document.getElementById(id);
  if (!el) return;

  animarNumero(el, Number(valor || 0), moeda);
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
  if (periodo === "personalizado") {
    if (!dataInicio.value || !dataFim.value) return null;
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
        new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 6)
      );
      fim = fimDoDia(hoje);
      break;

    case "mes":
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
      break;

    case "trimestre":
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
      fim = fimDoDia(hoje);
      break;

    case "semestre":
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
      fim = fimDoDia(hoje);
      break;

    case "ano":
      inicio = new Date(hoje.getFullYear(), 0, 1);
      fim = fimDoDia(hoje);
      break;

    case "personalizado":
      inicio = inicioDoDia(dataInicio.value);
      fim = fimDoDia(dataFim.value);
      break;
  }

  return { inicio, fim };
}

function filtrarPeriodo(lista, campoData) {
  const periodo = obterPeriodo(periodoSelecionado);

  if (!periodo) return [];

  return lista.filter(item => {
    if (!item[campoData]) return false;

    const data = new Date(item[campoData]);

    return data >= periodo.inicio && data <= periodo.fim;
  });
}

function atualizarTitulos() {
  const textos = {
    hoje: "Hoje",
    semana: "Últimos 7 Dias",
    mes: "Mês Atual",
    trimestre: "Últimos 3 Meses",
    semestre: "Últimos 6 Meses",
    ano: "Ano Atual",
    personalizado: "Período Personalizado"
  };

  const texto = textos[periodoSelecionado];

  tituloFluxo.innerText = `Fluxo Financeiro - ${texto}`;
  tituloDistribuicao.innerText = "Distribuição Financeira";
  tituloLucro.innerText = `Lucro Líquido - ${texto}`;
}

function destruirGraficos() {
  graficoFluxoMensal?.destroy();
  graficoDistribuicao?.destroy();
  graficoLucro?.destroy();
}

function gerarGradiente(ctx, cor) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 360);
  gradient.addColorStop(0, cor);
  gradient.addColorStop(1, "rgba(255,255,255,0.05)");
  return gradient;
}

function montarGraficoDistribuicao(entrada, saida) {
  graficoDistribuicao?.destroy();

  const total = entrada + saida;

  const percentualEntrada = total > 0 ? ((entrada / total) * 100).toFixed(1) : 0;
  const percentualSaida = total > 0 ? ((saida / total) * 100).toFixed(1) : 0;

  const ctx = document.getElementById("graficoDistribuicao").getContext("2d");

  graficoDistribuicao = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [entrada, saida],
          backgroundColor: ["#22c55e", "#ef4444"],
          hoverBackgroundColor: ["#16a34a", "#dc2626"],
          borderColor: "#ffffff",
          borderWidth: 5,
          hoverOffset: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "72%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 18,
            font: {
              size: 12,
              weight: "700"
            }
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 12,
          titleFont: {
            size: 13,
            weight: "800"
          },
          bodyFont: {
            size: 12,
            weight: "600"
          },
          callbacks: {
            label(context) {
              const percentual =
                context.dataIndex === 0 ? percentualEntrada : percentualSaida;

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

      if (item.tipoOperacao === "ENTRADA") mapa[chave].entrada += valor;
      if (item.tipoOperacao === "SAIDA") mapa[chave].saida += valor;
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
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

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

      if (item.tipoOperacao === "ENTRADA") mapa[chave].entrada += valor;
      if (item.tipoOperacao === "SAIDA") mapa[chave].saida += valor;
    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {
        labels.push(mapa[chave].label);
        entradas.push(mapa[chave].entrada);
        saidas.push(mapa[chave].saida);
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
          backgroundColor: "#22c55e",
          borderColor: "#16a34a",
          borderWidth: 1,
          borderRadius: 12,
          maxBarThickness: 42
        },
        {
          label: "Saídas",
          data: saidas,
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          borderWidth: 1,
          borderRadius: 12,
          maxBarThickness: 42
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
            padding: 18,
            font: {
              size: 12,
              weight: "700"
            }
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 12,
          titleFont: {
            size: 13,
            weight: "800"
          },
          bodyFont: {
            size: 12,
            weight: "600"
          },
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
          },
          ticks: {
            font: {
              weight: "600"
            },
            color: "#64748b"
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.20)"
          },
          ticks: {
            color: "#64748b",
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

      if (item.tipoOperacao === "ENTRADA") lucros[hora] += valor;
      if (item.tipoOperacao === "SAIDA") lucros[hora] -= valor;
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

      if (item.tipoOperacao === "ENTRADA") mapa[chave].lucro += valor;
      if (item.tipoOperacao === "SAIDA") mapa[chave].lucro -= valor;
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
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;

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

      if (item.tipoOperacao === "ENTRADA") mapa[chave].lucro += valor;
      if (item.tipoOperacao === "SAIDA") mapa[chave].lucro -= valor;
    });

    Object.keys(mapa)
      .sort()
      .forEach(chave => {
        labels.push(mapa[chave].label);
        lucros.push(mapa[chave].lucro);
      });
  }

  const canvas = document.getElementById("graficoLucro");
  const ctx = canvas.getContext("2d");

  const gradient = gerarGradiente(ctx, "rgba(34,197,94,0.24)");

  graficoLucro = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Lucro Líquido",
          data: lucros,
          borderColor: "#22c55e",
          backgroundColor: gradient,
          fill: true,
          tension: 0.42,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: "#22c55e",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 3,
          borderWidth: 4
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
            padding: 18,
            font: {
              size: 12,
              weight: "700"
            }
          }
        },
        tooltip: {
          backgroundColor: "#0f172a",
          padding: 12,
          titleFont: {
            size: 13,
            weight: "800"
          },
          bodyFont: {
            size: 12,
            weight: "600"
          },
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
          },
          ticks: {
            font: {
              weight: "600"
            },
            color: "#64748b"
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.20)"
          },
          ticks: {
            color: "#64748b",
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
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

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
      <strong>${periodo.inicio.toLocaleDateString("pt-BR")}</strong>
      até
      <strong>${periodo.fim.toLocaleDateString("pt-BR")}</strong>
    `;

    const caixaFiltrado = filtrarPeriodo(caixaCache, "dataOperacao");
    const propostasFiltradas = filtrarPeriodo(propostasCache, "data");
    const vendasFiltradas = filtrarPeriodo(vendasCache, "data");

    let entrada = 0;
    let saida = 0;

    caixaFiltrado.forEach(item => {
      const valor = Number(item.valor || 0);

      if (item.tipoOperacao === "ENTRADA") entrada += valor;
      if (item.tipoOperacao === "SAIDA") saida += valor;
    });

    const lucro = entrada - saida;
    const lucroVendas = vendasFiltradas.reduce(
      (total, venda) => total + Number(venda.lucro || 0),
      0
    );

    const totalPropostas = propostasFiltradas.reduce((total, item) => {
      return total + Number(item.valorTotal || 0);
    }, 0);

    const aprovadas = propostasFiltradas.filter(item =>
      ["fechado", "aprovado"].includes((item.status || "").toLowerCase())
    ).length;

    const pendentes = propostasFiltradas.filter(item =>
      ["aberto", "pendente"].includes((item.status || "").toLowerCase())
    ).length;

    atualizarValor("creditos", entrada);
    atualizarValor("debitos", saida);
    atualizarValor("lucro", lucro);
    atualizarValor("lucroVendas", lucroVendas);
    atualizarValor("propostas", totalPropostas);
    atualizarValor("aprovadas", aprovadas, false);
    atualizarValor("pendentes", pendentes, false);
    atualizarValor("clientes", clientesCache.length, false);
    atualizarValor("empresas", 1, false);

    const heroReceita = document.getElementById("heroReceita");
    const heroLucro = document.getElementById("heroLucro");
    const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");

    if (heroReceita) {
      heroReceita.innerText = formatarMoeda(entrada);
    }

    if (heroLucro) {
      heroLucro.innerText = `Lucro vendas: ${formatarMoeda(lucroVendas)} · Saldo caixa: ${formatarMoeda(lucro)}`;
    }

    if (ultimaAtualizacao) {
      ultimaAtualizacao.innerText = new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    destruirGraficos();

    montarGraficoFluxoPorPeriodo(caixaFiltrado, periodo.inicio, periodo.fim);
    montarGraficoDistribuicao(entrada, saida);
    montarGraficoLucroPorPeriodo(caixaFiltrado, periodo.inicio, periodo.fim);

  } catch (error) {
    console.error(error);
    alert("Erro ao carregar dashboard.");
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
      });

      botao.classList.add("active");
      botao.classList.add("btn-primary");

      periodoSelecionado = botao.dataset.periodo;

      if (periodoSelecionado === "personalizado") {
        datasPersonalizadas.style.display = "flex";
        return;
      }

      datasPersonalizadas.style.display = "none";

      carregarDashboard();
    });
  });

  btnAplicarFiltro?.addEventListener("click", carregarDashboard);

  const menuToggleMobile = document.getElementById("menuToggleMobile");
  const sidebar = document.querySelector(".sidebar");

  if (menuToggleMobile && sidebar) {
    menuToggleMobile.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });

    document.addEventListener("click", e => {
      if (!sidebar.contains(e.target) && !menuToggleMobile.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }
});