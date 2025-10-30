const API = "https://cash-management-system.fly.dev";

document.querySelector("#formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value.trim();

    if (!email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const resp = await fetch(`${API}/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
        });

        const data = await resp.json();

        if (resp.ok) {
            // salva o usuário logado para consultas futuras (opcional)
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            alert("✅ Login realizado com sucesso!");
            window.location.href = "index.html"; // redireciona pro painel
        } else {
            alert(data.error || "E-mail ou senha incorretos.");
        }
    } catch (err) {
        console.error(err);
        alert("Erro ao conectar com o servidor.");
    }
});
