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

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarCentros();

        form.addEventListener(
            "submit",
            salvarCentro
        );

    }
);

async function carregarCentros() {

    const resp =
        await fetch(
            `${API}?empresaId=${empresaId}`
        );

    const dados =
        await resp.json();

    lista.innerHTML =
        dados.map(c => `

        <tr>

            <td>${c.nome}</td>

            <td>

                <button
                    class="btn btn-sm btn-primary"
                    onclick="editarCentro(${c.id},'${c.nome}')">

                    <i class="fas fa-edit"></i>

                </button>

                <button
                    class="btn btn-sm btn-danger"
                    onclick="excluirCentro(${c.id})">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

    `).join("");

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
        "#centroId"
    ).value = "";

    carregarCentros();

}

function editarCentro(id, nome) {

    document.querySelector(
        "#centroId"
    ).value = id;

    document.querySelector(
        "#nome"
    ).value = nome;

}

async function excluirCentro(id) {

    if (!confirm("Excluir centro de custo?"))
        return;

    await fetch(
        `${API}/${id}`,
        {
            method: "DELETE"
        }
    );

    carregarCentros();

}