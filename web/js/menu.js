window.onload = function () {

    const button = document.querySelector("#menuToggleMobile");

    const sidebar = document.querySelector("#accordionSidebar");

    const overlay = document.querySelector(".mobile-overlay");

    if (!button) {
        console.log("BOTÃO NÃO ENCONTRADO");
        return;
    }

    if (!sidebar) {
        console.log("SIDEBAR NÃO ENCONTRADA");
        return;
    }

    button.onclick = function () {

        console.log("MENU CLICADO");

        sidebar.classList.toggle("active");

        overlay.classList.toggle("active");
    };

    overlay.onclick = function () {

        sidebar.classList.remove("active");

        overlay.classList.remove("active");
    };

};