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
            <td>${(e.valorProduto - e.custoProduto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td>${e.statusProduto}</td>
            <td>                
            <button onclick="del('${e.id}')">[ - ]</button>
                        <button onclick="edit(this)">[ * ]</button>
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

function del(id) {
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


function edit(id) {
    let btn = event.target;
    let linha = btn.parentNode.parentNode;
    let celulas = linha.cells;

    celulas[1].setAttribute('contenteditable', true);
    celulas[2].setAttribute('contenteditable', true);
    celulas[3].setAttribute('contenteditable', true);
    celulas[4].setAttribute('contenteditable', true);
    celulas[5].setAttribute('contenteditable', true);
    celulas[6].setAttribute('contenteditable', true);
    celulas[7].setAttribute('contenteditable', true);
    celulas[8].innerHTML = `<button onclick="edit('${celulas[0].innerHTML}')">[ Salvar ]</button>`;

    celulas[1].addEventListener('blur', function () {
        celulas[1].removeAttribute('contenteditable');
        celulas[2].removeAttribute('contenteditable');
        celulas[3].removeAttribute('contenteditable');
        celulas[4].removeAttribute('contenteditable');
        celulas[5].removeAttribute('contenteditable');
        celulas[6].removeAttribute('contenteditable');
        celulas[7].removeAttribute('contenteditable');
        celulas[8].innerHTML = `<button onclick="edit('${celulas[0].innerHTML}')">[ * ]</button>`;
        fetch(uri + "/produtos/" + celulas[0].innerHTML, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nomeProduto: celulas[1].innerHTML,
                descricaoProduto: celulas[2].innerHTML,
                quantidadeProduto: parseInt(celulas[3].innerHTML),
                valorProduto: parseFloat(celulas[4].innerHTML.
                    replace(',', '.')),
                custoProduto: parseFloat(celulas[5].innerHTML.
                    replace(',', '.')),
                statusProduto: celulas[8].innerHTML
                // statusProduto: celulas[8].innerHTML
            })
        })
    })




    // fetch("/produtos/" + id, { method: 'POST' })
    //     .then(resp => {
    //         if (resp.status != 200) {
    //             return {
    //                 error: "Erro ao editar o Produto",
    //             };
    //         } else return resp.json();
    //     })
    //     .then(resp => {
    //         if (resp.error == undefined) {
    //             console.log(resp);
    //             window.location.reload();
    //             btn.innerHTML = "[ * ]";
    //             celulas[1].removeAttribute('contenteditable');
    //             celulas[2].removeAttribute('contenteditable');
    //             celulas[3].removeAttribute('contenteditable');
    //             celulas[4].removeAttribute('contenteditable');
    //             celulas[5].removeAttribute('contenteditable');
    //             celulas[6].removeAttribute('contenteditable');
    //             celulas[7].removeAttribute('contenteditable');
    //         } else {
    //             console.log(resp.error);
    //         }
    //     })


    //     if (resp.status != 200) {
    //         return {
    //             error: "Erro ao editar o Produto",
    //         };
    //     } else return resp.json();

    // })
    // .then(resp => {
    //     if (resp.error == undefined) {
    //         console.log(resp);

    //     } else {
    //         console.log(resp.error);
    //     }
    // });

}