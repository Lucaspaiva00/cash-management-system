const baseURL = "http://localhost:3000/empresas"; // Trocar para seu endpoint no Render


async function carregarEmpresas() {
    try {
        const resp = await fetch(baseURL);
        const empresas = await resp.json();

        const tabela = document.querySelector("#tabelaEmpresas tbody");
        tabela.innerHTML = "";

        empresas.forEach(e => {
            tabela.innerHTML += `
        <tr>
          <td>${e.id}</td>
          <td>${e.nome}</td>
          <td>${e.cnpj || "-"}</td>
          <td>${e.email || "-"}</td>
          <td>${e.telefone || "-"}</td>
          <td>${e.endereco || "-"}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="removerEmpresa(${e.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
        });
    } catch (error) {
        console.error("Erro ao carregar empresas:", error);
    }
}

document.querySelector("#formEmpresa").addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaEmpresa = {
        nome: document.querySelector("#nome").value.trim(),
        cnpj: document.querySelector("#cnpj").value.trim(),
        email: document.querySelector("#email").value.trim(),
        telefone: document.querySelector("#telefone").value.trim(),
        endereco: document.querySelector("#endereco").value.trim(),
    };

    try {
        const resp = await fetch(baseURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaEmpresa),
        });

        if (!resp.ok) throw new Error("Erro ao criar empresa");

        alert("✅ Empresa cadastrada com sucesso!");
        e.target.reset();
        carregarEmpresas();
    } catch (error) {
        alert("❌ Falha ao cadastrar empresa.");
        console.error(error);
    }
});

async function removerEmpresa(id) {
    if (!confirm("Tem certeza que deseja remover esta empresa?")) return;

    try {
        const resp = await fetch(`${baseURL}/${id}`, { method: "DELETE" });
        if (!resp.ok) throw new Error("Erro ao remover");

        alert("Empresa removida com sucesso!");
        carregarEmpresas();
    } catch (error) {
        alert("Erro ao remover empresa.");
        console.error(error);
    }
}
document.addEventListener("DOMContentLoaded", carregarEmpresas);
