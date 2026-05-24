const API =
    "https://cash-management-system.onrender.com";

const usuario =
    JSON.parse(
        localStorage.getItem(
            "usuarioLogado"
        )
    );

if (!usuario) {

    alert("Faça login.");

    location.href =
        "login.html";

}

const empresaId =
    usuario.empresaId;

/* ==========================================
   LOAD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await carregarEmpresa();

        await carregarConfiguracaoFiscal();

    }
);

/* ==========================================
   EMPRESA
========================================== */

async function carregarEmpresa() {

    try {

        const resp =
            await fetch(
                `${API}/empresa/${empresaId}`
            );

        const empresa =
            await resp.json();

        document.getElementById(
            "nome"
        ).value =
            empresa.nome || "";

        document.getElementById(
            "nomeFantasia"
        ).value =
            empresa.nomeFantasia || "";

        document.getElementById(
            "cnpj"
        ).value =
            empresa.cnpj || "";

        document.getElementById(
            "inscricaoEstadual"
        ).value =
            empresa.inscricaoEstadual || "";

        document.getElementById(
            "inscricaoMunicipal"
        ).value =
            empresa.inscricaoMunicipal || "";

        document.getElementById(
            "telefone"
        ).value =
            empresa.telefone || "";

        document.getElementById(
            "email"
        ).value =
            empresa.email || "";

        document.getElementById(
            "cep"
        ).value =
            empresa.cep || "";

        document.getElementById(
            "endereco"
        ).value =
            empresa.endereco || "";

        document.getElementById(
            "numero"
        ).value =
            empresa.numero || "";

        document.getElementById(
            "complemento"
        ).value =
            empresa.complemento || "";

        document.getElementById(
            "bairro"
        ).value =
            empresa.bairro || "";

        document.getElementById(
            "cidade"
        ).value =
            empresa.cidade || "";

        document.getElementById(
            "estado"
        ).value =
            empresa.estado || "";

        document.getElementById(
            "crt"
        ).value =
            empresa.crt || "1";

    } catch (error) {

        console.error(
            "Erro empresa:",
            error
        );

    }

}

/* ==========================================
   CONFIGURAÇÃO FISCAL
========================================== */

async function carregarConfiguracaoFiscal() {

    try {

        const resp =
            await fetch(
                `${API}/configuracao-fiscal/${empresaId}`
            );

        const fiscal =
            await resp.json();

        document.getElementById(
            "ambiente"
        ).value =
            fiscal.ambiente ||
            "HOMOLOGACAO";

        document.getElementById(
            "serieNfe"
        ).value =
            fiscal.serieNfe || 1;

        document.getElementById(
            "serieNfce"
        ).value =
            fiscal.serieNfce || 1;

        document.getElementById(
            "proximoNumeroNfe"
        ).value =
            fiscal.proximoNumeroNfe || 1;

        document.getElementById(
            "proximoNumeroNfce"
        ).value =
            fiscal.proximoNumeroNfce || 1;

        document.getElementById(
            "tokenApi"
        ).value =
            fiscal.tokenApi || "";

    } catch (error) {

        console.error(
            "Erro fiscal:",
            error
        );

    }

}

/* ==========================================
   SALVAR
========================================== */

document
    .getElementById(
        "btnSalvarEmpresa"
    )
    .addEventListener(
        "click",
        salvarTudo
    );

async function salvarTudo() {

    try {

        /* EMPRESA */

        const empresaPayload = {

            nome:
                document.getElementById(
                    "nome"
                ).value,

            nomeFantasia:
                document.getElementById(
                    "nomeFantasia"
                ).value,

            cnpj:
                document.getElementById(
                    "cnpj"
                ).value,

            inscricaoEstadual:
                document.getElementById(
                    "inscricaoEstadual"
                ).value,

            inscricaoMunicipal:
                document.getElementById(
                    "inscricaoMunicipal"
                ).value,

            telefone:
                document.getElementById(
                    "telefone"
                ).value,

            email:
                document.getElementById(
                    "email"
                ).value,

            cep:
                document.getElementById(
                    "cep"
                ).value,

            endereco:
                document.getElementById(
                    "endereco"
                ).value,

            numero:
                document.getElementById(
                    "numero"
                ).value,

            complemento:
                document.getElementById(
                    "complemento"
                ).value,

            bairro:
                document.getElementById(
                    "bairro"
                ).value,

            cidade:
                document.getElementById(
                    "cidade"
                ).value,

            estado:
                document.getElementById(
                    "estado"
                ).value,

            crt:
                document.getElementById(
                    "crt"
                ).value

        };

        await fetch(
            `${API}/empresa/${empresaId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        empresaPayload
                    )
            }
        );

        /* FISCAL */

        const fiscalPayload = {

            ambiente:
                document.getElementById(
                    "ambiente"
                ).value,

            serieNfe:
                Number(
                    document.getElementById(
                        "serieNfe"
                    ).value
                ),

            serieNfce:
                Number(
                    document.getElementById(
                        "serieNfce"
                    ).value
                ),

            proximoNumeroNfe:
                Number(
                    document.getElementById(
                        "proximoNumeroNfe"
                    ).value
                ),

            proximoNumeroNfce:
                Number(
                    document.getElementById(
                        "proximoNumeroNfce"
                    ).value
                ),

            tokenApi:
                document.getElementById(
                    "tokenApi"
                ).value

        };

        await fetch(
            `${API}/configuracao-fiscal/${empresaId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        fiscalPayload
                    )
            }
        );

        alert(
            "✅ Configurações salvas com sucesso!"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Erro ao salvar configurações."
        );

    }

}