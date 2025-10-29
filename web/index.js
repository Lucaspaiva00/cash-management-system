const saldoEntradas = document.querySelector("#saldoEntradas");
const saldoSaidas = document.querySelector("#saldoSaidas");
const totalprop = document.querySelector("#totalprop");
const saldo = document.querySelector("#saldo");
const msg = document.querySelector("#msg");
const uri = "https://cash-management-system.fly.dev";

fetch(`${uri}/caixa`)
  .then((resp) => resp.json())
  .then((resp) => {
    let saldoEntradas = 0;
    let saldoSaidas = 0;
    let saldo = 0;
    resp.forEach((e) => {
      if (e.tipoOperacao == "Entrada") {
        saldoEntradas += e.valor;
        document.querySelector("#saldoEntradas").innerHTML =
          saldoEntradas.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
        console.log("O valor de entrada no caixa é: R$", saldoEntradas);
      } else if (e.tipoOperacao == "Saída") {
        saldoSaidas += e.valor;
        document.querySelector("#saldoSaidas").innerHTML =
          saldoSaidas.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          });
        console.log("O valor de saída no caixa é: R$", saldoSaidas);
      }
      saldo += e.valor;
      saldo = saldoEntradas - saldoSaidas;
      document.querySelector("#saldo").innerHTML = saldo.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
      );
      console.log("O valor líquido do caixa é de: R$", saldo);
    });

    JSC.Chart("chartDiv", {
      type: "vertical column",
      series: [
        {
          name: "Entrada",
          points: [{ x: "Entrada", y: saldoEntradas }],
        },
        {
          name: "Saída",
          points: [{ x: "Saida", y: saldoSaidas }],
        },
        {
          name: "Lucro Líquido",
          points: [{ x: "Lucro Líquido", y: saldo }],
        },
      ],
    });
  });

// PUXANDO TOTAL EM PROPOSTAS
fetch(`${uri}/proposta`)
  .then((resp) => resp.json())
  .then((resp) => {
    let totalprop = 0;
    resp.forEach((e) => {
      totalprop += e.valor;
      document.querySelector("#totalprop").innerHTML = totalprop.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
      );
    });
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
          console.log("Caiu no Error");
        } else {
          document.querySelector("#msg").innerHTML = resp.error;
        }
      });
  }
}
