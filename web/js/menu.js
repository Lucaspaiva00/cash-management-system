document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("menuToggleMobile");

    const sidebar = document.querySelector(".sidebar");

    const overlay = document.querySelector(".mobile-overlay");

    if (!menuBtn || !sidebar || !overlay) {
        console.log("Elementos do menu não encontrados");
        return;
    }

    menuBtn.addEventListener("click", () => {

        console.log("clicou");

        sidebar.classList.toggle("active");

        overlay.classList.toggle("active");

        document.body.classList.toggle("menu-open");
    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

        document.body.classList.remove("menu-open");
    });

});