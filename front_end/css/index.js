const entradas = document.querySelector("#entradas");
const saidas = document.querySelector("#saidas");
var saldoEntrada = 0;
var saldoSaida = 0;

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
                <td>R$${e.valor}</td>
                <td><button>Editar</button><button>Excliur</button></td>
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
        document.querySelector("#saldoEntradas").innerHTML = saldoEntrada;
        document.querySelector("#saldoSaidas").innerHTML = saldoSaida;
        document.querySelector("#saldo").innerHTML = saldoEntrada - saldoSaida;
    });


























