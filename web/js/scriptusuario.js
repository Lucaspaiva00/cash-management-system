const API = "https://cash-management-system.fly.dev";


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

// ======== inicialização ========
document.addEventListener("DOMContentLoaded", carregarUsuarios);
