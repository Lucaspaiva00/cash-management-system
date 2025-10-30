const API = "https://cash-management-system.fly.dev/empresas";
const empresasLista = document.querySelector("#empresasLista");
const formEmpresa = document.querySelector("#formEmpresa");

// Criar empresa
formEmpresa.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        nome: formEmpresa.nome.value.trim(),
        cnpj: formEmpresa.cnpj.value.trim(),
        endereco: formEmpresa.endereco.value.trim(),
        telefone: formEmpresa.telefone.value.trim(),
    };

    try {
        const resp = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await resp.json();
        if (!resp.ok) {
            alert(result.error || "Erro ao cadastrar empresa.");
            return;
        }

        alert("✅ Empresa cadastrada com sucesso!");
        formEmpresa.reset();
        carregarEmpresas();
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar ao servidor.");
    }
});

// Listar empresas
async function carregarEmpresas() {
    try {
        const resp = await fetch(API);
        const lista = await resp.json();

        empresasLista.innerHTML = "";
        lista.forEach((e) => {
            empresasLista.innerHTML += `
        <tr>
          <td>${e.nome}</td>
          <td>${e.cnpj}</td>
          <td>${e.endereco || "-"}</td>
          <td>${e.telefone || "-"}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="excluirEmpresa(${e.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
        });
    } catch (err) {
        console.error(err);
    }
}

// Excluir empresa
async function excluirEmpresa(id) {
    if (!confirm("Deseja realmente excluir esta empresa?")) return;
    try {
        const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (resp.ok) {
            alert("🗑️ Empresa excluída com sucesso!");
            carregarEmpresas();
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", carregarEmpresas);
