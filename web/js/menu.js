const menuBtn = document.getElementById("menuToggleMobile");

const sidebar = document.querySelector(".sidebar");

const overlay = document.querySelector(".mobile-overlay");

function openMenu() {

    sidebar.classList.add("active");

    overlay.classList.add("active");

    document.body.classList.add("menu-open");
}

function closeMenu() {

    sidebar.classList.remove("active");

    overlay.classList.remove("active");

    document.body.classList.remove("menu-open");
}

menuBtn.addEventListener("click", () => {

    if (sidebar.classList.contains("active")) {
        closeMenu();
    } else {
        openMenu();
    }
});

overlay.addEventListener("click", closeMenu);

/* FECHAR AO CLICAR EM LINK */

document.querySelectorAll(".sidebar .nav-link")
    .forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });