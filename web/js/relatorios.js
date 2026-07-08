/* ==========================================================
   CONFIGURAÇÕES
========================================================== */

const empresaId =
    localStorage.getItem(
        "empresaId"
    );

const API =
    API_URL;

let tipoRelatorio =
    "entradas";

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        configurarEventos();

        carregarRelatorio();

    }

);

/* ==========================================================
   EVENTOS
========================================================== */

function configurarEventos() {

    document
        .getElementById("btnPesquisar")
        .addEventListener(

            "click",

            carregarRelatorio

        );

    document
        .getElementById("btnLimpar")
        .addEventListener(

            "click",

            limparFiltros

        );

    document
        .getElementById("btnExportarExcel")
        .addEventListener(

            "click",

            exportarExcel

        );

    document
        .getElementById("tipoRelatorio")
        .addEventListener(

            "change",

            e => {

                tipoRelatorio =
                    e.target.value;

                atualizarTitulo();

                carregarRelatorio();

            }

        );

}

/* ==========================================================
   CARREGAR RELATÓRIO
========================================================== */

async function carregarRelatorio() {

    mostrarLoading(true);

    try {

        const inicio =
            document.getElementById(
                "dataInicial"
            ).value;

        const fim =
            document.getElementById(
                "dataFinal"
            ).value;

        let url =
            `${API}/relatorios/${tipoRelatorio}?empresaId=${empresaId}`;

        if (inicio && fim) {

            url +=
                `&inicio=${inicio}&fim=${fim}`;

        }

        const resposta =
            await fetch(url);

        const dados =
            await resposta.json();

        renderizarTabela(
            dados
        );

        atualizarCards(
            dados
        );

    }

    catch (erro) {

        console.error(
            erro
        );

        alert(
            "Erro ao carregar relatório."
        );

    }

    finally {

        mostrarLoading(false);

    }

}

/* ==========================================================
   ATUALIZAR TÍTULO
========================================================== */

function atualizarTitulo() {

    const titulo =
        document.getElementById(
            "tituloTabela"
        );

    const subtitulo =
        document.getElementById(
            "subTituloTabela"
        );

    const card =
        document.getElementById(
            "cardTipo"
        );

    switch (tipoRelatorio) {

        case "entradas":

            titulo.innerHTML =
                "Relatório de Entradas";

            subtitulo.innerHTML =
                "Todas as entradas encontradas.";

            card.innerHTML =
                "Entradas";

            break;

        case "saidas":

            titulo.innerHTML =
                "Relatório de Saídas";

            subtitulo.innerHTML =
                "Todas as saídas encontradas.";

            card.innerHTML =
                "Saídas";

            break;

        case "clientes":

            titulo.innerHTML =
                "Relatório por Clientes";

            subtitulo.innerHTML =
                "Resumo financeiro por cliente.";

            card.innerHTML =
                "Clientes";

            break;

    }

}

/* ==========================================================
   LOADING
========================================================== */

function mostrarLoading(

    mostrar

) {

    document.getElementById(
        "loadingRelatorio"
    ).style.display =
        mostrar
            ? "block"
            : "none";

}

/* ==========================================================
   RENDERIZAR TABELA
========================================================== */

function renderizarTabela(dados) {

    switch (tipoRelatorio) {

        case "entradas":

            renderizarEntradas(
                dados
            );

            break;

        case "saidas":

            renderizarSaidas(
                dados
            );

            break;

        case "clientes":

            renderizarClientes(
                dados
            );

            break;

    }

}

/* ==========================================================
   ENTRADAS
========================================================== */

function renderizarEntradas(dados) {

    const cabecalho =
        document.getElementById(
            "cabecalhoTabela"
        );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    cabecalho.innerHTML = `

        <th>Data</th>

        <th>Descrição</th>

        <th>Cliente</th>

        <th>Categoria</th>

        <th>Centro de Custo</th>

        <th>Pagamento</th>

        <th>Status</th>

        <th class="text-right">

            Valor

        </th>

    `;

    corpo.innerHTML = "";

    dados.movimentacoes.forEach(

        item => {

            corpo.innerHTML += `

                <tr>

                    <td>

                        ${formatarData(
                item.dataOperacao
            )}

                    </td>

                    <td>

                        ${item.descricao || "-"}

                    </td>

                    <td>

                        ${item.cliente?.nome || "-"}

                    </td>

                    <td>

                        ${item.categoria?.nome || "-"}

                    </td>

                    <td>

                        ${item.centroCusto?.nome || "-"}

                    </td>

                    <td>

                        ${item.meioPagamento || "-"}

                    </td>

                    <td>

                        <span class="badge badge-success">

                            ${item.status}

                        </span>

                    </td>

                    <td class="text-right font-weight-bold text-success">

                        ${formatarMoeda(
                item.valor
            )}

                    </td>

                </tr>

            `;

        }

    );

}

/* ==========================================================
   SAÍDAS
========================================================== */

function renderizarSaidas(dados) {

    const cabecalho =
        document.getElementById(
            "cabecalhoTabela"
        );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    cabecalho.innerHTML = `

        <th>Data</th>

        <th>Descrição</th>

        <th>Cliente</th>

        <th>Categoria</th>

        <th>Centro de Custo</th>

        <th>Pagamento</th>

        <th>Status</th>

        <th class="text-right">

            Valor

        </th>

    `;

    corpo.innerHTML = "";

    dados.movimentacoes.forEach(

        item => {

            corpo.innerHTML += `

                <tr>

                    <td>

                        ${formatarData(
                item.dataOperacao
            )}

                    </td>

                    <td>

                        ${item.descricao || "-"}

                    </td>

                    <td>

                        ${item.cliente?.nome || "-"}

                    </td>

                    <td>

                        ${item.categoria?.nome || "-"}

                    </td>

                    <td>

                        ${item.centroCusto?.nome || "-"}

                    </td>

                    <td>

                        ${item.meioPagamento || "-"}

                    </td>

                    <td>

                        <span class="badge badge-danger">

                            ${item.status}

                        </span>

                    </td>

                    <td class="text-right font-weight-bold text-danger">

                        ${formatarMoeda(
                item.valor
            )}

                    </td>

                </tr>

            `;

        }

    );

}

/* ==========================================================
   CLIENTES
========================================================== */

function renderizarClientes(dados) {

    const cabecalho =
        document.getElementById(
            "cabecalhoTabela"
        );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    cabecalho.innerHTML = `

        <th>

            Cliente

        </th>

        <th class="text-right">

            Entradas

        </th>

        <th class="text-right">

            Saídas

        </th>

        <th class="text-right">

            Saldo

        </th>

        <th class="text-center">

            Movimentações

        </th>

    `;

    corpo.innerHTML = "";

    dados.clientes.forEach(

        cliente => {

            corpo.innerHTML += `

                <tr>

                    <td>

                        <strong>

                            ${cliente.nome}

                        </strong>

                    </td>

                    <td class="text-right text-success font-weight-bold">

                        ${formatarMoeda(
                cliente.entradas
            )}

                    </td>

                    <td class="text-right text-danger font-weight-bold">

                        ${formatarMoeda(
                cliente.saidas
            )}

                    </td>

                    <td class="text-right font-weight-bold">

                        ${formatarMoeda(
                cliente.saldo
            )}

                    </td>

                    <td class="text-center">

                        ${cliente.quantidadeMovimentacoes}

                    </td>

                </tr>

            `;

        }

    );

}

/* ==========================================================
   ATUALIZAR CARDS
========================================================== */

function atualizarCards(dados) {

    if (tipoRelatorio === "clientes") {

        document.getElementById(
            "cardRegistros"
        ).innerHTML =
            dados.quantidadeClientes;

        document.getElementById(
            "quantidadeRegistros"
        ).innerHTML =
            `${dados.quantidadeClientes} clientes`;

        document.getElementById(
            "cardTotal"
        ).innerHTML =
            "-";

        return;

    }

    document.getElementById(
        "cardRegistros"
    ).innerHTML =
        dados.quantidade;

    document.getElementById(
        "cardTotal"
    ).innerHTML =
        formatarMoeda(
            dados.total
        );

    document.getElementById(
        "quantidadeRegistros"
    ).innerHTML =
        `${dados.quantidade} registros`;

    const inicio =
        document.getElementById(
            "dataInicial"
        ).value;

    const fim =
        document.getElementById(
            "dataFinal"
        ).value;

    if (
        inicio &&
        fim
    ) {

        document.getElementById(
            "cardPeriodo"
        ).innerHTML =
            `${formatarData(inicio)}<br>${formatarData(fim)}`;

    }

    else {

        document.getElementById(
            "cardPeriodo"
        ).innerHTML =
            "Todos";

    }

}

/* ==========================================================
   EXPORTAR EXCEL
========================================================== */

function exportarExcel() {

    const inicio =
        document.getElementById(
            "dataInicial"
        ).value;

    const fim =
        document.getElementById(
            "dataFinal"
        ).value;

    let url =
        `${API}/relatorios/${tipoRelatorio}/excel?empresaId=${empresaId}`;

    if (
        inicio &&
        fim
    ) {

        url +=
            `&inicio=${inicio}&fim=${fim}`;

    }

    window.open(
        url,
        "_blank"
    );

}

/* ==========================================================
   LIMPAR FILTROS
========================================================== */

function limparFiltros() {

    document.getElementById(
        "tipoRelatorio"
    ).value =
        "entradas";

    document.getElementById(
        "dataInicial"
    ).value =
        "";

    document.getElementById(
        "dataFinal"
    ).value =
        "";

    tipoRelatorio =
        "entradas";

    atualizarTitulo();

    carregarRelatorio();

}

/* ==========================================================
   FORMATAR DATA
========================================================== */

function formatarData(data) {

    if (!data)
        return "-";

    return new Date(data)
        .toLocaleDateString(
            "pt-BR"
        );

}

/* ==========================================================
   FORMATAR MOEDA
========================================================== */

function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(

            "pt-BR",

            {

                style: "currency",

                currency: "BRL"

            }

        );

}