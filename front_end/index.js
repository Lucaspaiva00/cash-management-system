const saldoEntradas = document.querySelector("#saldoEntradas");
const saldoSaidas = document.querySelector("#saldoSaidas");
const totalprop = document.querySelector("#totalprop");
const saldo = document.querySelector("#saldo");
const msg = document.querySelector("#msg");
const uri = "http://localhost:3000";

fetch(`${uri}/caixa`)
    .then(resp => resp.json())
    .then(resp => {
        let saldoEntradas = 0;
        let saldoSaidas = 0;
        let saldo = 0;
        resp.forEach(e => {
            if (e.tipoOperacao == "Entrada") {
                saldoEntradas += e.valor;
                document.querySelector("#saldoEntradas").innerHTML = saldoEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            } else if (e.tipoOperacao == "Saída") {
                saldoSaidas += e.valor;
                document.querySelector("#saldoSaidas").innerHTML = saldoSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            } else {
                // saldo += e.valor;
                // saldo = saldoEntradas - saldoSaidas;
                // document.querySelector("#saldo").innerHTML = 
                //     saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                // console.log(saldo);

            }
        })

        JSC.Chart('chartDiv', {
            type: 'vertical column',
            series: [
                {
                    name: 'Entrada',
                    points: [
                        { x: 'Entrada', y: saldoEntradas }
                    ]
                }, {
                    name: 'Saída',
                    points: [
                        { x: 'Saida', y: saldoSaidas }
                    ]
                }
            ]
        });

    })



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
                    console.log("Caiu no Error");
                } else {
                    document.querySelector("#msg").innerHTML = resp.error;
                }
            });
    }
}








