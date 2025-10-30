const API = "https://cash-management-system.fly.dev";

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const empresaId = parseInt(document.getElementById("empresaId").value, 10);

  if (!nome || !email || !senha || !empresaId) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  try {
    const resp = await fetch(`${API}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, empresaId }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.error || "Erro ao cadastrar usuário.");
      return;
    }

    alert("✅ Usuário cadastrado com sucesso!");
    localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
    window.location.href = "login.html";
  } catch (err) {
    console.error("Erro:", err);
    alert("Falha ao cadastrar usuário.");
  }
});
