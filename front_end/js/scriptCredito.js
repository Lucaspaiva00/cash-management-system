const entradas = document.querySelector("#entradas");
const uri = "http://localhost:3000";

fetch("http://localhost:3000/caixa")
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