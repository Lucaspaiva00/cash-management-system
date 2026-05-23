const API =
    "https://cash-management-system.onrender.com/categorias";

const empresaId =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    )?.empresaId || 1;

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

async function carregarCategorias() {

    const resp =
        await fetch(
            `${API}?empresaId=${empresaId}`
        );

    const dados =
        await resp.json();

    lista.innerHTML =
        dados.map(cat => `

        <tr>

            <td>${cat.nome}</td>

            <td>${cat.tipo}</td>

            <td>

                <button
                    class="btn btn-sm btn-primary"
                    onclick="editarCategoria(${cat.id},'${cat.nome}','${cat.tipo}')">

                    <i class="fas fa-edit"></i>

                </button>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="excluirCategoria(${cat.id})">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

    `).join("");

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