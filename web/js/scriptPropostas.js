const totalprop = document.querySelector("#totalprop");
const uri = "http://localhost:3000";

fetch("http://localhost:3000/proposta")
    .then(resp => resp.json())
    .then(resp => {
        let totalprop = 0;
        resp.forEach(e => {
            propostasCadastrados.innerHTML +=
                `
            <td>${e.nomeProposta}</td>
            <td>${e.descricaoProposta}</td>
            <td>${e.prazoproposta}</td>
            <td>${e.valorProposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.custoProposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td style="color: black;">${(e.valorProposta - e.custoProposta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.statusproposta}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='excluirProposta' onClick='excluirProposta(${e.id})'>Excluir</button>
            </td>
            `;
            // ACOMULADOR
            totalprop += e.valorProposta;
            document.querySelector("#totalprop").innerHTML = totalprop.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            // document.querySelector("#custo").innerHTML = e.custoProposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // document.querySelector("#liquido").innerHTML = (e.valorProposta - e.custoProposta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        });
       
    })

//Funções CRUD - DELETE
function excluirProposta(id) {
    if (confirm(`Confirma a exclusão da Proposta?`)) {
        fetch(uri + "/proposta/" + id, { method: "DELETE" })
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
