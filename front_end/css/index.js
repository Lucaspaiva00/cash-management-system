const entradas = document.querySelector("#entradas");
const saidas = document.querySelector("#saidas");
const saldo = document.querySelector("#saldo");
var saldoEntrada = 0;
var saldoSaida = 0;
const uri = "http://localhost:3000";

fetch("http://localhost:3000/caixa")
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            let dados =
                `
            <tr>
                <td>${e.id}</td>
                <td>${e.dataOperacao}</td>
                <td>${e.tipoOperacao}</td>
                <td>${e.meioPagamento}</td>
                <td>${e.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td>
                <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
                <button type="button" title="button" class='btn btn-primary' id='excluirOperacao' onClick='excluirOperacao(${e.id})'>Excluir</button></td>
            <tr>
            `;
            if (e.tipoOperacao == "Entrada") {
                entradas.innerHTML += dados;
                saldoEntrada += e.valor;
            } else {
                saidas.innerHTML += dados;
                saldoSaida += e.valor;
            }
        });
        document.querySelector("#saldoEntradas").innerHTML = saldoEntrada.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.querySelector("#saldoSaidas").innerHTML = saldoSaida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });;

        document.querySelector("#saldo").innerHTML = (saldoEntrada - saldoSaida).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    });

//Funções CRUD - DELETE
function excluirOperacao(id) {
    if (confirm(`Confirma a exclusão da sua operação?`)) {
        fetch(uri + "/caixa/" + id, { method: "DELETE" })
            .then((resp) => {
                if (resp.status != 204) {
                    return {
                        error: "Erro ao excluir a operação",
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
