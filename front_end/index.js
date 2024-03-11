const entradas = document.querySelector("#entradas");
const saidas = document.querySelector("#saidas");
const saldo = document.querySelector("#saldo");
const msg = document.querySelector("#msg")
const totalprop = document.querySelector("#totalprop");
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
                <button type="button" title="button" class='btn btn-primary' id='excluirPerfil' onClick='excluirPerfil(${e.id})'>Excluir</button></td>
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
function excluirPerfil(id) {
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
                    console.log("teste");
                } else {
                    document.querySelector("#msg").innerHTML = resp.error;
                }
            });
    }
}


// PUXANDO LISTA DE PRODUTOS
fetch("http://localhost:3000/produtos")
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            produtosCadastrados.innerHTML +=
                `
        <tr>
            <td>${e.id}</td>
            <td>${e.nomeProduto}</td>
            <td>${e.quantidadeProduto}</td>
            <td>${e.valorProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.statusProduto}</td>
        <tr>
        `
        });

    });




// PUXANDO TOTAL EM PROPOSTAS
fetch("http://localhost:3000/proposta")
    .then(resp => resp.json())
    .then(resp => {
        let totalprop = 0;
        resp.forEach(e => {
            totalprop += e.valorProposta;
            document.querySelector("#totalprop").innerHTML = totalprop.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        });
    })



















