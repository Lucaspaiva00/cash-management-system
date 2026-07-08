/* ==========================================================
   CONFIGURAÇÕES
========================================================== */

const API = API_BASE;

const usuario =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    );

if (!usuario) {

    alert("Sessão expirada.");

    window.location.href =
        "login.html";

}

const empresaId =
    Number(usuario.empresaId);


let tipoRelatorio = "entradas";

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        atualizarTitulo();

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

            function () {

                tipoRelatorio = this.value;

                atualizarTitulo();

            }

        );

}

/* ==========================================================
   CARREGAR RELATÓRIO
========================================================== */

async function carregarRelatorio() {

    mostrarLoading(true);

    try {

        tipoRelatorio =
            document.getElementById(
                "tipoRelatorio"
            ).value;

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

        if (
            inicio &&
            fim
        ) {

            url +=
                `&inicio=${inicio}&fim=${fim}`;

        }

        console.log("URL:", url);

        const resposta =
            await fetch(url);

        const dados =
            await resposta.json();

        console.log(dados);

        if (!resposta.ok) {

            console.error(dados);

            alert(
                dados.error ||
                "Erro ao carregar relatório."
            );

            return;

        }

        renderizarTabela(
            dados
        );

        atualizarCards(
            dados
        );

    }

    catch (erro) {

        console.error(erro);

    }

    finally {

        mostrarLoading(false);

    }

}

function atualizarTitulo() {

    const titulo =
        document.getElementById("tituloTabela");

    const subtitulo =
        document.getElementById("subTituloTabela");

    const card =
        document.getElementById("cardTipo");

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
   RENDERIZAR TABELA
========================================================== */

function renderizarTabela(dados) {

    switch (tipoRelatorio) {

        case "entradas":

            renderizarMovimentacoes(
                dados.movimentacoes,
                "success"
            );

            break;

        case "saidas":

            renderizarMovimentacoes(
                dados.movimentacoes,
                "danger"
            );

            break;

        case "clientes":

            renderizarClientes(
                dados.clientes
            );

            break;

    }

}

/* ==========================================================
   MOVIMENTAÇÕES
========================================================== */

function renderizarMovimentacoes(

    movimentacoes,

    cor

) {

    const cabecalho =
        document.getElementById(
            "cabecalhoTabela"
        );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    cabecalho.innerHTML = `

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

    corpo.innerHTML = "";

    if (

        !movimentacoes ||

        movimentacoes.length === 0

    ) {

        corpo.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="text-center py-5 text-muted">

                    Nenhuma movimentação encontrada.

                </td>

            </tr>

        `;

        return;

    }

    movimentacoes.forEach(

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

                        <span class="badge badge-${cor}">

                            ${item.status || "-"}

                        </span>

                    </td>

                    <td class="text-right font-weight-bold text-${cor}">

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

    const cabecalho =
        document.getElementById(
            "cabecalhoTabela"
        );

    const corpo =
        document.getElementById(
            "corpoTabela"
        );

    cabecalho.innerHTML = `

        <tr>

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

        </tr>

    `;

    corpo.innerHTML = "";

    if (

        !clientes ||

        clientes.length === 0

    ) {

        corpo.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center py-5 text-muted">

                    Nenhum cliente encontrado.

                </td>

            </tr>

        `;

        return;

    }

    clientes.forEach(

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

    if (tipoRelatorio === "clientes") {

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

        cardPeriodo.innerHTML =
            `${formatarData(inicio)}<br>${formatarData(fim)}`;

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

    const d =
        new Date(data);

    return d.toLocaleDateString(
        "pt-BR"
    );

}

/* ==========================================================
   FORMATAR MOEDA
========================================================== */

function formatarMoeda(valor) {

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