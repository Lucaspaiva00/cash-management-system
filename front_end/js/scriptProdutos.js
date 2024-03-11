const produtosCadastrados = document.querySelector("#produtosCadastrados");
const estoquevalorbruto = document.querySelector("#estoquevalorbruto");
const estoquevalorcusto = document.querySelector("#estoquevalorcusto");
const estoquevalorliquido = document.querySelector("#estoquevalorliquido");
const uri = "http://localhost:3000";

fetch("http://localhost:3000/produtos")
    .then(resp => resp.json())
    .then(resp => {
        let valorvenda = 0;
        let valorcusto = 0;
        let valorliquido = 0;
        resp.forEach(e => {
            produtosCadastrados.innerHTML +=
                `
        <tr>
            <td>${e.id}</td>
            <td>${e.nomeProduto}</td>
            <td>${e.descricaoProduto}</td>
            <td>${e.quantidadeProduto}</td>
            <td>${e.valorProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.custoProduto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${(e.valorProduto-e.custoProduto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.statusProduto}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='excluirProduto' onClick='excluirProduto(${e.id})'>Excluir</button>
            </td>
        <tr>
        `;
            valorvenda += e.valorProduto;
            document.querySelector("#estoquevalorbruto").innerHTML = valorvenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            valorcusto += e.custoProduto;
            document.querySelector("#estoquevalorcusto").innerHTML = valorcusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.querySelector("#estoquevalorliquido").innerHTML = (valorvenda - valorcusto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        });

    });

function excluirProduto(id) {
    if (confirm(`Confirma a exclusão do seu Cliente?`)) {
        fetch(uri + "/produtos/" + id, { method: "DELETE" })
            .then((resp) => {
                if (resp.status != 204) {
                    return {
                        error: "Erro ao excluir comentário",
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