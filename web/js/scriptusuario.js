// web/js/scriptusuario.js
const API = "https://cash-management-system.onrender.com";

// Cadastro combinado (Empresa + Admin)
document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nome: document.getElementById("nome").value.trim(),
    email: document.getElementById("email").value.trim(),
    senha: document.getElementById("senha").value.trim(),
    empresa: {
      nome: document.getElementById("empresaNome").value.trim(),
      cnpj: document.getElementById("empresaCnpj").value.trim() || null,
      email: document.getElementById("empresaEmail").value.trim() || null,
      telefone: document.getElementById("empresaTelefone").value.trim() || null,
      endereco: document.getElementById("empresaEndereco").value.trim() || null,
    },
  };

  if (
    !payload.nome ||
    !payload.email ||
    !payload.senha ||
    !payload.empresa.nome
  ) {
    alert("⚠️ Preencha pelo menos: Seu nome, e-mail, senha e nome da empresa.");
    return;
  }

  try {
    const resp = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      alert(data.error || "Erro ao criar conta.");
      return;
    }

    // Guarda usuário e empresa
    localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
    alert("✅ Conta criada com sucesso! Faça login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Erro:", err);
    alert("Falha ao criar conta.");
  }
});
