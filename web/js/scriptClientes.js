const clientesCadastrados = document.querySelector("#clientesCadastrados");
const uri = "https://cash-management-system.fly.dev/clientes";
const caixaForms = document.querySelector("#caixaForms");

caixaForms.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    nome: caixaForms.nome.value,
    cpf: caixaForms.cpf.value,
    cnpj: caixaForms.cnpj.value,
    endereco: caixaForms.endereco.value,
    telefone: caixaForms.telefone.value,
    email: caixaForms.email.value,
  };
  fetch(`${uri}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.status)
    .then((status) => {
      if (status == 201) {
        window.location.reload();
      } else {
        alert("Erro ao enviar dados para a API");
      }
    });
  console.log(data);
});

fetch(uri)
  .then((resp) => resp.json())
  .then((resp) => {
    resp.forEach((e) => {
      clientesCadastrados.innerHTML += `
            <tr>
                <td>${e.nome}</td>
                <td>${e.cpf}</td>
                <td>${e.cnpj}</td>
                <td>${e.endereco}</td>
                <td>${e.telefone}</td>
                <td>${e.email}</td>
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
