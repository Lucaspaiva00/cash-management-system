const clientesCadastrados = document.querySelector("#clientesCadastrados");
const uri = "http://localhost:3000";


fetch("http://localhost:3000/cliente")
    .then(resp => resp.json())
    .then(resp => {
        resp.forEach(e => {
            clientesCadastrados.innerHTML +=
                `
            <tr>
                <td>${e.nomeCliente}</td>
                <td>${e.cnpjCliente}</td>
                <td>${e.cpfCliente}</td>
                <td>${e.rgCliente}</td>
                <td>${e.enderecoCliente}</td>
                <td>${e.numeroCliente}</td>
                <td>${e.emailCliente}</td>
                <td>${e.rgCliente}</td>
                <td>                
                <button type="button" title="button" class='btn btn-primary' id='editaroperacao' onClick='editaroperacao(${e.id})'>Editar</button>
                <button type="button" title="button" class='btn btn-primary' id='excluirCliente' onClick='excluirCliente(${e.id})'>Excluir</button>
                </td>
            <tr>
            `;
        });

    });


//Funções CRUD - DELETE
function excluirCliente(id) {
    if (confirm(`Confirma a exclusão do seu Produto?`)) {
        fetch(uri + "/produtos/" + id, { method: "DELETE" })
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

























