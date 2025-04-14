const caixaForms = document.querySelector("#caixaForms")
const totalprop = document.querySelector("#totalprop");
const uri = "http://localhost:3000/proposta";

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        numero: Number(caixaForms.numero.value),
        data: caixaForms.data.value,
        descricao: caixaForms.descricao.value,
        status: caixaForms.status.value
    }

    fetch(`${uri}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.status)
        .then(status => {
            if (status == 201) {
                window.location.reload();
            } else {
                alert('Erro ao enviar dados para a API');
            }
        })
    console.log(data)
})

fetch(uri)
    .then(resp => resp.json())
    .then(resp => {
        let totalprop = 0;
        resp.forEach(e => {
            propostasCadastrados.innerHTML +=
                `
            <td>${e.numero}</td>
            <td>${e.data}</td>
            <td>${e.descricao}</td>
            <td>${e.status}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='excluirProposta' onClick='excluirProposta(${e.id})'>Excluir</button>
            </td>
            `;
            totalprop += e.valorProposta;
            document.querySelector("#totalprop").innerHTML = totalprop.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            // document.querySelector("#custo").innerHTML = e.custoProposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // document.querySelector("#liquido").innerHTML = (e.valorProposta - e.custoProposta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        });
       
    })

//Funções CRUD - DELETE
function excluirProposta(id) {
    if (confirm(`Confirma a exclusão da Proposta?`)) {
        fetch(uri + "/" + id, { method: "DELETE" })
            .then((resp) => {
                if (resp.status != 204) {
                    return {
                        error: "Erro ao excluir uma Proposta",
                    };
                } else return {};
            })
            .then((resp) => {
                if (resp.error == undefined) {
                    window.location.reload();
                } else {
                    document.querySelector("#msg").innerHTML = resp.error;
                }
            });
    }
}
