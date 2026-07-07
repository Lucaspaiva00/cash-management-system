const API = API_BASE;

document.querySelector("#formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector("#email").value.trim();
  const senha = document.querySelector("#senha").value.trim();

  if (!email || !senha) {
    alert("⚠️ Preencha todos os campos!");
    return;
  }

  try {
    const resp = await fetch(`${API}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      alert(data.error || "E-mail ou senha incorretos.");
      return;
    }

    // 🔐 Salva usuário logado no navegador
    localStorage.setItem(
      "usuarioLogado",
      JSON.stringify({
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        empresaId: data.usuario.empresaId,
      })
    );

    
    window.location.href = "index.html";
  } catch (err) {
    console.error("Erro:", err);
    alert("Erro ao conectar com o servidor.");
  }
});
