const API =
    "https://cash-management-system.onrender.com/centros-custo";

const empresaId =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    )?.empresaId || 1;

const form =
    document.querySelector(
        "#formCentro"
    );

const lista =
    document.querySelector(
        "#listaCentros"
    );

const filtroBusca =
    document.querySelector(
        "#filtroBusca"
    );

let CENTROS = [];

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarCentros();

        form.addEventListener(
            "submit",
            salvarCentro
        );

        filtroBusca?.addEventListener(
            "input",
            aplicarFiltros
        );

    }
);

function atualizarResumo(lista) {

    document.getElementById(
        "totalCentros"
    ).textContent =
        lista.length;

    document.getElementById(
        "totalAtivos"
    ).textContent =
        lista.length;

}

async function carregarCentros() {

    try {

        const resp =
            await fetch(
                `${API}?empresaId=${empresaId}`
            );

        CENTROS =
            await resp.json();

        atualizarResumo(
            CENTROS
        );

        renderizarCentros(
            CENTROS
        );

    } catch (erro) {

        console.error(
            erro
        );

    }

}

function aplicarFiltros() {

    const busca =
        filtroBusca.value
            .toLowerCase()
            .trim();

    const filtrados =
        CENTROS.filter(
            centro =>
                centro.nome
                    .toLowerCase()
                    .includes(
                        busca
                    )
        );

    renderizarCentros(
        filtrados
    );

}

async function salvarCentro(e) {

    e.preventDefault();

    const id =
        document.querySelector(
            "#centroId"
        ).value;

    const payload = {

        nome:
            document.querySelector(
                "#nome"
            ).value
                .trim(),

        empresaId

    };

    try {

        const metodo =
            id
                ? "PUT"
                : "POST";

        const url =
            id
                ? `${API}/${id}`
                : API;

        const resp =
            await fetch(
                url,
                {
                    method:
                        metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        if (!resp.ok)
            throw new Error(
                "Erro ao salvar."
            );

        form.reset();

        document.querySelector(
            "#centroId"
        ).value = "";

        carregarCentros();

    } catch (erro) {

        alert(
            erro.message
        );

    }

}
function criarCard(centro) {

    return `

        <div class="col-xl-4 col-lg-6 mb-4">

            <div class="metric-card">

                <div class="metric-top">

                    <div>

                        <div class="metric-label">

                            CENTRO DE CUSTO

                        </div>

                    </div>

                    <div class="metric-icon">

                        <i class="fas fa-sitemap text-primary"></i>

                    </div>

                </div>

                <div class="metric-value">

                    ${centro.nome}

                </div>

                <div class="metric-footer">

                    Utilizado para organizar receitas, despesas e relatórios financeiros.

                </div>

                <hr>

                <div class="d-flex justify-content-end">

                    <button
                        class="btn btn-outline-primary btn-sm mr-2"
                        onclick="abrirEdicao(${centro.id})"
                        title="Editar">

                        <i class="fas fa-edit"></i>

                    </button>

                    <button
                        class="btn btn-outline-danger btn-sm"
                        onclick="abrirExclusao(${centro.id})"
                        title="Excluir">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

                <div
                    id="area-${centro.id}"
                    class="mt-3">

                </div>

            </div>

        </div>

    `;

}

function renderizarCentros(listaCentros) {

    lista.innerHTML =
        listaCentros
            .map(
                criarCard
            )
            .join("");

}

function abrirEdicao(id) {

    const centro =
        CENTROS.find(
            c => c.id === id
        );

    if (!centro)
        return;

    document
        .getElementById(
            `area-${id}`
        )
        .innerHTML = `

        <div class="card-edicao">

            <div class="form-group">

                <label>

                    Nome

                </label>

                <input
                    id="editNome${id}"
                    class="form-control"
                    value="${centro.nome}">

            </div>

            <div class="text-right">

                <button
                    class="btn btn-secondary mr-2"
                    onclick="fecharAcao(${id})">

                    Cancelar

                </button>

                <button
                    class="btn btn-danger"
                    onclick="salvarEdicao(${id})">

                    Salvar

                </button>

            </div>

        </div>

    `;

}

async function salvarEdicao(id) {

    try {

        const nome =
            document
                .getElementById(
                    `editNome${id}`
                )
                .value
                .trim();

        if (!nome) {

            alert(
                "Informe o nome."
            );

            return;

        }

        const resp =
            await fetch(
                `${API}/${id}`,
                {
                    method:
                        "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            nome,
                            empresaId
                        })
                }
            );

        if (!resp.ok)
            throw new Error(
                "Erro ao atualizar."
            );

        carregarCentros();

    } catch (erro) {

        alert(
            erro.message
        );

    }

}

function abrirExclusao(id) {

    document
        .getElementById(
            `area-${id}`
        )
        .innerHTML = `

        <div class="card-exclusao">

            <p class="mb-3">

                Deseja realmente excluir este centro de custo?

            </p>

            <div class="text-right">

                <button
                    class="btn btn-secondary mr-2"
                    onclick="fecharAcao(${id})">

                    Cancelar

                </button>

                <button
                    class="btn btn-danger"
                    onclick="excluirCentro(${id})">

                    Excluir

                </button>

            </div>

        </div>

    `;

}

async function excluirCentro(id) {

    try {

        const resp =
            await fetch(
                `${API}/${id}`,
                {
                    method:
                        "DELETE"
                }
            );

        if (!resp.ok)
            throw new Error(
                "Erro ao excluir."
            );

        carregarCentros();

    } catch (erro) {

        alert(
            erro.message
        );

    }

}

function fecharAcao(id) {

    const area =
        document.getElementById(
            `area-${id}`
        );

    if (area)
        area.innerHTML = "";

}