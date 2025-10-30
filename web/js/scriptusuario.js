const API = "https://cash-management-system.fly.dev";

// ======== sair (opcional) ========
const btnSair = document.getElementById("sair");
if (btnSair) {
  btnSair.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
  });
}

// ======== listar usuários ========
async function carregarUsuarios() {
  try {
    const resp = await fetch(`${API}/usuarios`);
    const usuarios = await resp.json();

    const tbody = document.querySelector("#tabelaUsuarios tbody");
    tbody.innerHTML = "";

    usuarios.forEach((u) => {
      tbody.innerHTML += `
        <tr>
          <td>${u.id}</td>
          <td>${u.nome}</td>
          <td>${u.email}</td>
          <td>${u.empresa ? u.empresa.nome : "-"}</td>
          <td>
            <button class="btn btn-danger btn-sm" onclick="removerUsuario(${u.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error("Erro ao listar usuários:", err);
    alert("Falha ao listar usuários.");
  }
}

// ======== criar usuário ========
document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    senha: document.getElementById("senha").value.trim(),
    empresaId: parseInt(document.getElementById("empresaId").value, 10),
  };

  try {
    const resp = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      alert(data.error || "Erro ao cadastrar usuário.");
      return;
    }

    alert("Usuário cadastrado com sucesso!");
    e.target.reset();
    carregarUsuarios();
  } catch (err) {
    console.error("Erro ao cadastrar usuário:", err);
    alert("Falha ao cadastrar usuário.");
  }
});

// ======== remover usuário ========
async function removerUsuario(id) {
  if (!confirm("Tem certeza que deseja remover este usuário?")) return;

  try {
    const resp = await fetch(`${API}/usuarios/${id}`, { method: "DELETE" });
    const data = await resp.json();

    if (!resp.ok) {
      alert(data.error || "Erro ao remover usuário.");
      return;
    }

    alert("Usuário removido com sucesso!");
    carregarUsuarios();
  } catch (err) {
    console.error("Erro ao remover usuário:", err);
    alert("Falha ao remover usuário.");
  }
}

// ======== inicialização ========
document.addEventListener("DOMContentLoaded", carregarUsuarios);
