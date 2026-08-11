function obterUsuarioLogadoMenu() {
    try {
        return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
    } catch (error) {
        console.warn("Não foi possível ler a sessão do usuário.", error);
        return null;
    }
}

function aplicarIdentidadeEmpresa(empresa) {
    const nomeEmpresa = String(empresa?.nome || "").trim();

    if (!nomeEmpresa) return;

    document.querySelectorAll(".sidebar-brand-text, [data-empresa-nome]")
        .forEach(elemento => {
            elemento.textContent = nomeEmpresa;
        });

    const tituloAtual = document.title || "Sistema";

    if (/paiva tech/i.test(tituloAtual)) {
        document.title = tituloAtual.replace(/paiva tech/gi, nomeEmpresa);
    } else if (!tituloAtual.toLowerCase().includes(nomeEmpresa.toLowerCase())) {
        document.title = `${tituloAtual} | ${nomeEmpresa}`;
    }

    window.empresaLogada = empresa;
}

async function carregarIdentidadeEmpresa() {
    const usuario = obterUsuarioLogadoMenu();

    if (!usuario?.empresaId || typeof API_BASE === "undefined") return;

    try {
        const resposta = await fetch(`${API_BASE}/empresa/${usuario.empresaId}`);

        if (!resposta.ok) return;

        const empresa = await resposta.json();
        aplicarIdentidadeEmpresa(empresa);
    } catch (error) {
        console.warn("Não foi possível carregar a identidade da empresa.", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    carregarIdentidadeEmpresa();

    const sidebar = document.getElementById("accordionSidebar");
    const overlay = document.querySelector(".mobile-overlay");
    const btnMenu = document.getElementById("menuToggleMobile");

    if (!sidebar || !overlay || !btnMenu) return;

    //---------------------------------------------------
    // ABRIR MENU
    //---------------------------------------------------

    function abrirMenu() {

        sidebar.classList.add("sidebar-open");

        overlay.classList.add("active");

        document.body.classList.add("menu-open");

    }

    //---------------------------------------------------
    // FECHAR MENU
    //---------------------------------------------------

    function fecharMenu() {

        sidebar.classList.remove("sidebar-open");

        overlay.classList.remove("active");

        document.body.classList.remove("menu-open");

    }

    //---------------------------------------------------
    // TOGGLE
    //---------------------------------------------------

    function toggleMenu() {

        if (sidebar.classList.contains("sidebar-open")) {

            fecharMenu();

        } else {

            abrirMenu();

        }

    }

    //---------------------------------------------------
    // EVENTOS
    //---------------------------------------------------

    btnMenu.addEventListener("click", toggleMenu);

    overlay.addEventListener("click", fecharMenu);

    //---------------------------------------------------
    // FECHAR COM ESC
    //---------------------------------------------------

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            fecharMenu();

        }

    });

    //---------------------------------------------------
    // FECHAR AO CLICAR EM UM LINK (MOBILE)
    //---------------------------------------------------

    sidebar.querySelectorAll(".nav-link").forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 768) {

                fecharMenu();

            }

        });

    });

    //---------------------------------------------------
    // FECHAR AO REDIMENSIONAR A TELA
    //---------------------------------------------------

    window.addEventListener("resize", () => {

        if (window.innerWidth > 768) {

            fecharMenu();

        }

    });

    //---------------------------------------------------
    // DESTACAR MENU ATIVO AUTOMATICAMENTE
    //---------------------------------------------------

    const paginaAtual = window.location.pathname
        .split("/")
        .pop()
        .toLowerCase();

    document.querySelectorAll("#accordionSidebar .nav-item")
        .forEach(item => {

            item.classList.remove("active");

        });

    document.querySelectorAll("#accordionSidebar .nav-link")
        .forEach(link => {

            const href = (link.getAttribute("href") || "")
                .toLowerCase();

            if (href === paginaAtual) {

                link.parentElement.classList.add("active");

            }

        });
    //---------------------------------------------------
    // IMPEDIR SCROLL COM MENU ABERTO
    //---------------------------------------------------

    function atualizarScroll() {

        if (

            window.innerWidth <= 768 &&

            sidebar.classList.contains("sidebar-open")

        ) {

            document.body.style.overflow = "hidden";

        }

        else {

            document.body.style.overflow = "";

        }

    }

    //---------------------------------------------------
    // OBSERVA ALTERAÇÃO DAS CLASSES
    //---------------------------------------------------

    const observer = new MutationObserver(() => {

        atualizarScroll();

    });

    observer.observe(sidebar, {

        attributes: true,

        attributeFilter: ["class"]

    });

    //---------------------------------------------------
    // GARANTE ESTADO INICIAL
    //---------------------------------------------------

    fecharMenu();

    atualizarScroll();

});

window.carregarIdentidadeEmpresa = carregarIdentidadeEmpresa;
