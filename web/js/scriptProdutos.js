const produtosCadastrados = document.querySelector("#produtosCadastrados");
const estoquevalorbruto = document.querySelector("#estoquevalorbruto");
const estoquevalorcusto = document.querySelector("#estoquevalorcusto");
const estoquevalorliquido = document.querySelector("#estoquevalorliquido");
const caixaForms = document.querySelector("#caixaForms")
const uri = "http://localhost:3000/produtos";

caixaForms.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        nome: caixaForms.nome.value,
        precovenda: Number(caixaForms.precovenda.value),
        precocompra: Number(caixaForms.precocompra.value),
        estoque: Number(caixaForms.estoque.value),
        marca: caixaForms.marca.value,
        quantidade: Number(caixaForms.quantidade.value),
        categoria: caixaForms.categoria.value
    }

    fetch(uri, {
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
        let precovenda = 0;
        let precocompra = 0;
        resp.forEach(e => {
            produtosCadastrados.innerHTML +=
                `
        <tr>
            <td>${e.id}</td>
            <td>${e.nome}</td>
            <td>${e.precovenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.precocompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.estoque}</td>
            <td>${e.marca}</td>
            <td>${(e.quantidade)}</td>
            <td>${e.categoria}</td>
            <td>                
            <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(this)'>Editar</button>
            <button type="button" title="button" class='btn btn-primary' id='excluirproduto' onClick='excluirproduto(${e.id})'>Excluir</button></td>
            </td>
        <tr>
        `;
            precovenda += e.precovenda;
            document.querySelector("#estoquevalorbruto").innerHTML = precovenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            precocompra += e.precocompra;
            document.querySelector("#estoquevalorcusto").innerHTML = precocompra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            document.querySelector("#estoquevalorliquido").innerHTML = (precovenda - precocompra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        });

    });

    function excluirproduto(id) {
        if (confirm(`Confirma a exclusão do seu Produto?`)) {
            fetch(uri + "/" + id, { method: "DELETE" })
                .then((resp) => {
                    if (resp.status != 204) {
                        return {
                            error: "Erro ao excluir o Produto",
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
    
