window.onload = function () {

    const button = document.getElementById("menuToggleMobile");

    const sidebar = document.getElementById("accordionSidebar");

    const overlay = document.querySelector(".mobile-overlay");

    let aberto = false;

    button.onclick = function () {

        console.log("MENU CLICADO");

        if (!aberto) {

            sidebar.style.left = "0";

            overlay.classList.add("active");

            aberto = true;

        } else {

            sidebar.style.left = "-280px";

            overlay.classList.remove("active");

            aberto = false;
        }
    };

    overlay.onclick = function () {

        sidebar.style.left = "-280px";

        overlay.classList.remove("active");

        aberto = false;
    };

};