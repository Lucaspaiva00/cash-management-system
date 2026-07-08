/* ==========================================================
   RELATÓRIOS FINANCEIROS
   PAIVA TECH
========================================================== */

/* ==========================================================
   CONFIGURAÇÕES
========================================================== */

const API = API_BASE;

const usuarioLogado =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    );

if (!usuarioLogado) {

    alert("Sua sessão expirou.");

    window.location.href =
        "login.html";

}

const empresaId =
    Number(
        usuarioLogado.empresaId
    );

let tipoRelatorio =
    "entradas";

/* ==========================================================
   DOM
========================================================== */

const selectTipo =
    document.getElementById(
        "tipoRelatorio"
    );

const dataInicial =
    document.getElementById(
        "dataInicial"
    );

const dataFinal =
    document.getElementById(
        "dataFinal"
    );

const btnPesquisar =
    document.getElementById(
        "btnPesquisar"
    );

const btnLimpar =
    document.getElementById(
        "btnLimpar"
    );

const btnExcel =
    document.getElementById(
        "btnExportarExcel"
    );

const tabelaHead =
    document.getElementById(
        "cabecalhoTabela"
    );

const tabelaBody =
    document.getElementById(
        "corpoTabela"
    );

/* ==========================================================
   START
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    iniciarPagina

);

function iniciarPagina() {

    registrarEventos();

    atualizarTitulo();

    carregarRelatorio();

}

/* ==========================================================
   EVENTOS
========================================================== */

function registrarEventos() {

    selectTipo.addEventListener(

        "change",

        () => {

            tipoRelatorio =
                selectTipo.value;

            atualizarTitulo();

            carregarRelatorio();

        }

    );

    btnPesquisar.addEventListener(

        "click",

        carregarRelatorio

    );

    btnLimpar.addEventListener(

        "click",

        limparFiltros

    );

    btnExcel.addEventListener(

        "click",

        exportarExcel

    );

}

/* ==========================================================
   TÍTULOS
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

    const textos = {

        entradas: {

            titulo:
                "Relatório de Entradas",

            subtitulo:
                "Todas as entradas financeiras.",

            card:
                "Entradas"

        },

        saidas: {

            titulo:
                "Relatório de Saídas",

            subtitulo:
                "Todas as saídas financeiras.",

            card:
                "Saídas"

        },

        clientes: {

            titulo:
                "Relatório por Clientes",

            subtitulo:
                "Resumo financeiro por cliente.",

            card:
                "Clientes"

        }

    };

    titulo.innerHTML =
        textos[tipoRelatorio].titulo;

    subtitulo.innerHTML =
        textos[tipoRelatorio].subtitulo;

    card.innerHTML =
        textos[tipoRelatorio].card;

}

/* ==========================================================
   LOADING
========================================================== */

function mostrarLoading(

    mostrar

) {

    const loading =
        document.getElementById(
            "loadingRelatorio"
        );

    if (!loading)
        return;

    loading.style.display =
        mostrar
            ? "block"
            : "none";

}

/* ==========================================================
   CARREGAR RELATÓRIO
========================================================== */

async function carregarRelatorio() {

    mostrarLoading(true);

    try {

        tipoRelatorio =
            selectTipo.value;

        let url =
            `${API}/relatorios/${tipoRelatorio}?empresaId=${empresaId}`;

        if (

            dataInicial.value &&
            dataFinal.value

        ) {

            url +=
                `&inicio=${dataInicial.value}&fim=${dataFinal.value}`;

        }

        console.log(

            "URL:",

            url

        );

        const resposta =
            await fetch(url);

        if (!resposta.ok) {

            const texto =
                await resposta.text();

            console.error(texto);

            throw new Error(

                "Erro ao consultar relatório."

            );

        }

        const dados =
            await resposta.json();

        console.log(dados);

        atualizarCards(

            dados

        );

        renderizarTabela(

            dados

        );

    }

    catch (erro) {

        console.error(

            erro

        );

        tabelaHead.innerHTML = "";

        tabelaBody.innerHTML = `

            <tr>

                <td
                    colspan="20"
                    class="text-center py-5 text-danger">

                    <i class="fas fa-exclamation-circle mr-2"></i>

                    Não foi possível carregar o relatório.

                </td>

            </tr>

        `;

    }

    finally {

        mostrarLoading(

            false

        );

    }

}

/* ==========================================================
   RENDERIZAÇÃO
========================================================== */

function renderizarTabela(

    dados

) {

    switch (

    tipoRelatorio

    ) {

        case "entradas":

        case "saidas":

            renderizarMovimentacoes(

                dados.movimentacoes || []

            );

            break;

        case "clientes":

            renderizarClientes(

                dados.clientes || []

            );

            break;

    }

}

/* ==========================================================
   MOVIMENTAÇÕES
========================================================== */

function renderizarMovimentacoes(

    lista

) {

    tabelaHead.innerHTML = `

        <tr>

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

        </tr>

    `;

    tabelaBody.innerHTML = "";

    if (

        lista.length === 0

    ) {

        tabelaBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5">

                    Nenhum registro encontrado.

                </td>

            </tr>

        `;

        return;

    }

    lista.forEach(

        item => {

            tabelaBody.innerHTML += `

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

                        ${item.status || "-"}

                    </td>

                    <td
                        class="text-right font-weight-bold ${tipoRelatorio === "entradas"
                    ? "text-success"
                    : "text-danger"}">

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

function renderizarClientes(

    clientes

) {

    tabelaHead.innerHTML = `

        <tr>

            <th>Cliente</th>

            <th class="text-right">Entradas</th>

            <th class="text-right">Saídas</th>

            <th class="text-right">Saldo</th>

            <th class="text-center">Movimentações</th>

        </tr>

    `;

    tabelaBody.innerHTML = "";

    if (

        clientes.length === 0

    ) {

        tabelaBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center py-5">

                    Nenhum cliente encontrado.

                </td>

            </tr>

        `;

        return;

    }

    clientes.forEach(

        cliente => {

            tabelaBody.innerHTML += `

                <tr>

                    <td>

                        <strong>

                            ${cliente.nome}

                        </strong>

                    </td>

                    <td class="text-right text-success">

                        ${formatarMoeda(

                cliente.entradas

            )}

                    </td>

                    <td class="text-right text-danger">

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
   CARDS
========================================================== */

function atualizarCards(

    dados

) {

    const cardRegistros =
        document.getElementById(
            "cardRegistros"
        );

    const cardTotal =
        document.getElementById(
            "cardTotal"
        );

    const cardPeriodo =
        document.getElementById(
            "cardPeriodo"
        );

    const badge =
        document.getElementById(
            "quantidadeRegistros"
        );

    if (

        tipoRelatorio === "clientes"

    ) {

        const quantidade =
            dados.quantidadeClientes || 0;

        cardRegistros.innerHTML =
            quantidade;

        badge.innerHTML =
            `${quantidade} clientes`;

        cardTotal.innerHTML =
            "-";

    }

    else {

        const quantidade =
            dados.quantidade || 0;

        const total =
            dados.total || 0;

        cardRegistros.innerHTML =
            quantidade;

        badge.innerHTML =
            `${quantidade} registros`;

        cardTotal.innerHTML =
            formatarMoeda(total);

    }

    if (

        dataInicial.value &&
        dataFinal.value

    ) {

        cardPeriodo.innerHTML =
            `${formatarData(dataInicial.value)}<br>${formatarData(dataFinal.value)}`;

    }

    else {

        cardPeriodo.innerHTML =
            "Todos";

    }

}

/* ==========================================================
   EXPORTAR EXCEL
========================================================== */

function exportarExcel() {

    let url =
        `${API}/relatorios/${tipoRelatorio}/excel?empresaId=${empresaId}`;

    if (

        dataInicial.value &&
        dataFinal.value

    ) {

        url +=
            `&inicio=${dataInicial.value}&fim=${dataFinal.value}`;

    }

    window.open(

        url,

        "_blank"

    );

}

/* ==========================================================
   LIMPAR
========================================================== */

function limparFiltros() {

    selectTipo.value =
        "entradas";

    dataInicial.value =
        "";

    dataFinal.value =
        "";

    tipoRelatorio =
        "entradas";

    atualizarTitulo();

    carregarRelatorio();

}

/* ==========================================================
   DATA
========================================================== */

function formatarData(

    data

) {

    if (!data)
        return "-";

    return new Date(data)

        .toLocaleDateString(

            "pt-BR"

        );

}

/* ==========================================================
   MOEDA
========================================================== */

function formatarMoeda(

    valor

) {

    return Number(

        valor || 0

    ).toLocaleString(

        "pt-BR",

        {

            style:

                "currency",

            currency:

                "BRL"

        }

    );

}