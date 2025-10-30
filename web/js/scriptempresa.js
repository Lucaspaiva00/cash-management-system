const API = "https://cash-management-system.fly.dev/empresas"; // seu endpoint Render
const lista = document.querySelector("#empresasCadastradas");
const form = document.querySelector("#formEmpresa");

// 🔹 Carregar empresas
async function carregarEmpresas() {
    try {
        const resp = await fetch(API);
        const empresas = await resp.json();
        lista.innerHTML = "";

        if (empresas.length === 0) {
            lista.innerHTML = `<div class="text-center text-muted w-100">Nenhuma empresa cadastrada.</div>`;
            return;
        }

        empresas.forEach(e => {
            lista.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card card-empresa shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title text-primary"><i class="fas fa-building"></i> ${e.nome}</h5>
                <button class="btn btn-sm btn-danger" onclick="removerEmpresa(${e.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <p class="mb-1"><strong>CNPJ:</strong> ${e.cnpj || "-"}</p>
              <p class="mb-1"><strong>E-mail:</strong> ${e.email || "-"}</p>
              <p class="mb-1"><strong>Telefone:</strong> ${e.telefone || "-"}</p>
              <p class="mb-0"><strong>Endereço:</strong> ${e.endereco || "-"}</p>
            </div>
          </div>
        </div>
      `;
        });
    } catch (error) {
        console.error("Erro ao carregar empresas:", error);
        lista.innerHTML = `<div class="alert alert-danger w-100">Erro ao carregar lista de empresas.</div>`;
    }
}

// 🔹 Criar nova empresa
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const novaEmpresa = {
        nome: form.nome.value.trim(),
        cnpj: form.cnpj.value.trim(),
        email: form.email.value.trim(),
        telefone: form.telefone.value.trim(),
        endereco: form.endereco.value.trim(),
    };

    try {
        const resp = await fetch(API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novaEmpresa),
        });

        if (resp.ok) {
            alert("✅ Empresa cadastrada com sucesso!");
            form.reset();
            carregarEmpresas();
        } else {
            alert("❌ Falha ao cadastrar empresa.");
        }
    } catch (error) {
        console.error("Erro ao criar empresa:", error);
        alert("Erro de conexão com o servidor.");
    }
});

// 🔹 Remover empresa
async function removerEmpresa(id) {
    if (!confirm("Deseja realmente remover esta empresa?")) return;

    try {
        const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
        if (resp.status === 204) {
            alert("🗑️ Empresa removida com sucesso!");
            carregarEmpresas();
        } else {
            alert("❌ Falha ao remover empresa.");
        }
    } catch (error) {
        console.error("Erro ao remover empresa:", error);
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    lista.classList.add("row");
    carregarEmpresas();
});
