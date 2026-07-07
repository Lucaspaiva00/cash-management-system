const API = `${API_BASE}/categorias`;

const empresaId =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    )?.empresaId || 1;
let categorias = [];
const form =
    document.querySelector(
        "#formCategoria"
    );

const lista =
    document.querySelector(
        "#listaCategorias"
    );

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarCategorias();

        form.addEventListener(
            "submit",
            salvarCategoria
        );

    }
);


function atualizarResumo(lista) {

    document.getElementById("totalCategorias").textContent =
        lista.length;

    document.getElementById("totalEntradasCategoria").textContent =
        lista.filter(
            c => c.tipo === "ENTRADA"
        ).length;

    document.getElementById("totalSaidasCategoria").textContent =
        lista.filter(
            c => c.tipo === "SAIDA"
        ).length;

}

function criarCard(cat) {

    const cor =
        cat.tipo === "ENTRADA"
            ? "success"
            : "danger";

    const icone =
        cat.tipo === "ENTRADA"
            ? "fa-arrow-down"
            : "fa-arrow-up";

    return `

        <div class="col-xl-4 col-lg-6 mb-4">

            <div class="metric-card">

                <div class="metric-top">

                    <div>

                        <div class="metric-label">

                            ${cat.tipo}

                        </div>

                    </div>

                    <div class="metric-icon">

                        <i class="fas ${icone} text-${cor}"></i>

                    </div>

                </div>

                <div class="metric-value">

                    ${cat.nome}

                </div>

                <div class="metric-footer">

                    Categoria financeira de ${cat.tipo.toLowerCase()}.

                </div>

                <hr>

                <div class="d-flex justify-content-end">

                    <button
                        class="btn btn-outline-primary btn-sm mr-2"
                        onclick="abrirEdicao(${cat.id})">

                        <i class="fas fa-edit"></i>

                    </button>

                    <button
                        class="btn btn-outline-danger btn-sm"
                        onclick="abrirExclusao(${cat.id})">

                        <i class="fas fa-trash"></i>

                    </button>

                </div>

                <div
                    id="area-${cat.id}"
                    class="mt-3">

                </div>

            </div>

        </div>

    `;

}
async function carregarCategorias() {

    const resp =
        await fetch(
            `${API}?empresaId=${empresaId}`
        );

    categorias =
        await resp.json();

    atualizarResumo(
        categorias
    );

    renderizarCategorias(
        categorias
    );

}
async function salvarCategoria(e) {

    e.preventDefault();

    const id =
        document.querySelector(
            "#categoriaId"
        ).value;

    const payload = {

        nome:
            document.querySelector(
                "#nome"
            ).value,

        tipo:
            document.querySelector(
                "#tipo"
            ).value,

        empresaId
    };

    const metodo =
        id
            ? "PUT"
            : "POST";

    const url =
        id
            ? `${API}/${id}`
            : API;

    await fetch(url, {

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

    });

    form.reset();

    document.querySelector(
        "#categoriaId"
    ).value = "";

    carregarCategorias();

}

function editarCategoria(id, nome, tipo) {

    document.querySelector(
        "#categoriaId"
    ).value = id;

    document.querySelector(
        "#nome"
    ).value = nome;

    document.querySelector(
        "#tipo"
    ).value = tipo;

}

async function excluirCategoria(id) {

    if (!confirm("Excluir categoria?"))
        return;

    await fetch(
        `${API}/${id}`,
        {
            method: "DELETE"
        }
    );

    carregarCategorias();

}

async function salvarEdicao(id) {

    const payload = {

        nome:
            document.getElementById(
                `editNome${id}`
            ).value,

        tipo:
            document.getElementById(
                `editTipo${id}`
            ).value,

        empresaId

    };

    try {

        const resp =
            await fetch(
                `${API}/${id}`,
                {
                    method: "PUT",
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
                "Erro ao atualizar"
            );

        carregarCategorias();

    } catch (err) {

        alert(
            err.message
        );

    }

}

function abrirEdicao(id) {

    const categoria =
        categorias.find(
            c => c.id === id
        );

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
                    value="${categoria.nome}">

            </div>

            <div class="form-group">

                <label>

                    Tipo

                </label>

                <select
                    id="editTipo${id}"
                    class="form-control">

                    <option value="ENTRADA"
                    ${categoria.tipo === "ENTRADA"
            ? "selected"
            : ""
        }>
                        Entrada
                    </option>

                    <option value="SAIDA"
                    ${categoria.tipo === "SAIDA"
            ? "selected"
            : ""
        }>
                        Saída
                    </option>

                </select>

            </div>

            <div class="text-right">

                <button
                    class="btn btn-secondary"

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

function abrirExclusao(id) {

    document
        .getElementById(
            `area-${id}`
        )
        .innerHTML = `

        <div class="card-exclusao">

            <p>

                Deseja realmente excluir esta categoria?

            </p>

            <div class="text-right">

                <button
                    class="btn btn-secondary"

                    onclick="fecharAcao(${id})">

                    Cancelar

                </button>

                <button
                    class="btn btn-danger"

                    onclick="excluirCategoria(${id})">

                    Excluir

                </button>

            </div>

        </div>

    `;
}
function fecharAcao(id) {

    document
        .getElementById(
            `area-${id}`
        )
        .innerHTML = "";

}
function renderizarCategorias(categorias) {

    const lista =
        document.getElementById(
            "listaCategorias"
        );

    lista.innerHTML =
        categorias.map(
            criarCard
        ).join("");

}