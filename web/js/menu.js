document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.getElementById("menuToggleMobile");

    const sidebar = document.getElementById("accordionSidebar");

    const overlay = document.querySelector(".mobile-overlay");

    menuBtn.addEventListener("click", () => {

        /* REMOVE CLASSES DO SB ADMIN */

        document.body.classList.remove("sidebar-toggled");

        sidebar.classList.remove("toggled");

        /* ABRE MENU */

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