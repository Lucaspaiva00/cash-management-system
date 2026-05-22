document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menu =
            document.getElementById(
                "accordionSidebar"
            );

        const button =
            document.getElementById(
                "menuToggleMobile"
            );

        const overlay =
            document.querySelector(
                ".mobile-overlay"
            );

        if (
            !menu ||
            !button ||
            !overlay
        ) return;

        function abrir() {

            menu.classList.add(
                "open"
            );

            overlay.classList.add(
                "active"
            );

            document.body.classList.add(
                "menu-open"
            );
        }

        function fechar() {

            menu.classList.remove(
                "open"
            );

            overlay.classList.remove(
                "active"
            );

            document.body.classList.remove(
                "menu-open"
            );
        }

        button.addEventListener(
            "click",
            () => {

                menu.classList.contains(
                    "open"
                )
                    ? fechar()
                    : abrir();

            }
        );

        overlay.addEventListener(
            "click",
            fechar
        );

    }
);