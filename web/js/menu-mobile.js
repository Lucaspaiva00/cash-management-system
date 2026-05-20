window.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("menuToggleMobile");

    const sidebar = document.getElementById("accordionSidebar");

    const overlay = document.querySelector(".mobile-overlay");

    if (!button || !sidebar || !overlay) {

        console.log("MENU MOBILE NÃO ENCONTRADO");

        return;
    }

    button.addEventListener("click", () => {

        console.log("MENU MOBILE ABRINDO");

        sidebar.classList.toggle("menu-opened");

        overlay.classList.toggle("active");

        document.body.classList.toggle("menu-open");
    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("menu-opened");

        overlay.classList.remove("active");

        document.body.classList.remove("menu-open");
    });

});