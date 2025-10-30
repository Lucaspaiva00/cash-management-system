const API = "https://cash-management-system.fly.dev/proposta";
const lista = document.querySelector("#propostasCadastrados");
const form = document.querySelector("#caixaForms");
const totalEl = document.querySelector("#totalprop");

// 🔹 Carregar propostas
async function carregarPropostas() {
  try {
    const resp = await fetch(API);
    const propostas = await resp.json();

    lista.innerHTML = "";
    let total = 0;

    if (propostas.length === 0) {
      lista.innerHTML = `<div class="text-center text-muted w-100">Nenhuma proposta cadastrada.</div>`;
      totalEl.textContent = "R$ 0,00";
      return;
    }

    propostas.forEach(p => {
      total += Number(p.valor);

      const statusClass = p.status?.toLowerCase() === "fechado" ? "card-status-fechado" : "card-status-aberto";
      const statusColor = p.status?.toLowerCase() === "fechado" ? "text-success" : "text-primary";

      lista.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card card-proposta ${statusClass} shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="card-title mb-0 text-dark"><i class="fas fa-file-invoice-dollar"></i> ${p.numero}</h5>
                <span class="${statusColor} font-weight-bold">${p.status || "Indefinido"}</span>
              </div>
              <p class="mb-1"><strong>Data:</strong> ${p.data || "-"}</p>
              <p class="mb-1"><strong>Descrição:</strong> ${p.descricao || "-"}</p>
              <p class="mb-2"><strong>Valor:</strong> R$ ${Number(p.valor).toFixed(2)}</p>
              <div class="text-right">
                <button class="btn btn-sm btn-warning" onclick="editarProposta(${p.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="excluirProposta(${p.id})"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    totalEl.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  } catch (err) {
    console.error("Erro ao carregar propostas:", err);
    lista.innerHTML = `<div class="alert alert-danger w-100">Falha ao carregar propostas.</div>`;
  }
}

// 🔹 Adicionar proposta
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    numero: Number(form.numero.value),
    data: form.data.value,
    descricao: form.descricao.value,
    status: form.status.value,
    valor: Number(form.valor.value),
  };

  try {
    const resp = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (resp.status === 201) {
      alert("✅ Proposta cadastrada com sucesso!");
      form.reset();
      carregarPropostas();
    } else {
      alert("❌ Erro ao cadastrar proposta.");
    }
  } catch (err) {
    console.error("Erro ao salvar proposta:", err);
    alert("Erro ao conectar com o servidor.");
  }
});

// 🔹 Excluir proposta
async function excluirProposta(id) {
  if (!confirm("Deseja realmente excluir esta proposta?")) return;

  try {
    const resp = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (resp.status === 204) {
      alert("🗑️ Proposta excluída com sucesso!");
      carregarPropostas();
    } else {
      alert("❌ Erro ao excluir proposta.");
    }
  } catch (err) {
    console.error("Erro ao excluir proposta:", err);
  }
}

// 🔹 Editar (futuro modal)
function editarProposta(id) {
  alert(`✏️ Edição em desenvolvimento. ID da proposta: ${id}`);
}

// 🔹 Inicialização
document.addEventListener("DOMContentLoaded", () => {
  lista.classList.add("row");
  carregarPropostas();
});
