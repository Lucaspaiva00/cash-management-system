const entradas = document.querySelector("#entradas");
const caixaForm = document.querySelector("#caixaForm");
const uri = "http://localhost:3000/";

caixaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        meioPagamento: caixaForm.meioPagamento.value,
        tipoOperacao: caixaForm.tipoOperacao.value,
        dataOperacao: caixaForm.dataOperacao.value,
        valor: Number(caixaForm.valor.value)
    }
    fetch(`${uri}caixa`, {
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
        });
    console.log(data)
})

fetch(`${uri}caixa`)
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            if (e.tipoOperacao == "Entrada") {
                entradas.innerHTML +=
                    `
            <tr>
                <td>${e.id}</td>
                <td>${e.dataOperacao}</td>
                <td>${e.tipoOperacao}</td>
                <td>${e.meioPagamento}</td>
                <td>${e.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
                <button type="button" title="button" class='btn btn-primary' id='excluirPerfil' onClick='excluirPerfil(${e.id})'>Excluir</button></td>
            <tr>
            `;
            }
        });


    });

function excluirPerfil(id) {
    if (confirm(`Confirma a exclusão da operação?`)) {
        fetch(uri + "caixa/" + id, {
            method:
                "DELETE"
        })
            .then((resp) => {
                if (resp.status != 204) {
                    return {
                        error: "Erro ao excluir uma operação!",
                    };
                } else return {};
            })
            .then((resp) => {
                if (resp.error == undefined) {
                    window.location.reload();
                    console.log("Caiu no Error");
                } else {
                    document.querySelector('#msg').innerHTML = resp.error;
                }
            })
    }
}