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

    if (!sidebar) return;

    // Uma única fonte para o menu: evita páginas novas com menu reduzido.
    // As páginas antigas já possuem os mesmos links; aqui só completa o que faltar.
    const itensPadrao = [
        ["index.html", "fas fa-fw fa-chart-pie", "Dashboard"],
        ["movimentacoes.html", "fa fa-university", "Caixa"],
        ["fechamento-caixa.html", "fas fa-cash-register", "Fechamento de Caixa"],
        ["categorias-financeiras.html", "fas fa-tags", "Categorias Financeiras"],
        ["centros-custo.html", "fas fa-sitemap", "Centros de Custo"],
        ["contas-receber.html", "fas fa-hand-holding-usd", "Contas a Receber"],
        ["pdvvenda.html", "fas fa-cash-register", "PDV"],
        ["agenda.html", "fas fa-calendar-alt", "Agenda"],
        ["relatorios.html", "fas fa-file-alt", "Relatórios Financeiros"],
        ["vendas.html", "fas fa-chart-line", "Relatório de Vendas"],
        ["criarCliente.html", "fas fa-users", "Clientes"],
        ["produtos.html", "fas fa-boxes", "Produtos"],
        ["propostas.html", "fas fa-file-invoice-dollar", "Propostas"],
        ["empresa.html", "fas fa-building", "Minha Empresa"]
    ];

    if (window.location.pathname.endsWith("fechamento-caixa.html")) {
        sidebar.innerHTML = `
          <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html"><div class="sidebar-brand-icon"><i class="fas fa-layer-group"></i></div><div class="sidebar-brand-text mx-3">Paiva Tech</div></a>
          <hr class="sidebar-divider my-0"><li class="nav-item"><a class="nav-link" href="index.html"><i class="fas fa-fw fa-chart-pie"></i><span>Dashboard</span></a></li><hr class="sidebar-divider"><div class="sidebar-heading">Gestão</div>
          ${itensPadrao.slice(1).map(([href, icone, texto]) => `<li class="nav-item"><a class="nav-link" href="${href}"><i class="${icone}"></i><span>${texto}</span></a></li>`).join("")}
          <hr class="sidebar-divider d-none d-md-block"><li class="nav-item"><a class="nav-link" href="login.html"><i class="fas fa-sign-out-alt"></i><span>Sair</span></a></li>`;
    }

    const ancoraGestao = sidebar.querySelector(".sidebar-heading");
    itensPadrao.forEach(([href, icone, texto]) => {
        if (sidebar.querySelector(`a[href="${href}"]`)) return;
        const item = document.createElement("li");
        item.className = "nav-item";
        item.innerHTML = `<a class="nav-link" href="${href}"><i class="${icone}"></i><span>${texto}</span></a>`;
        if (ancoraGestao) ancoraGestao.insertAdjacentElement("afterend", item);
        else sidebar.appendChild(item);
    });

    // Item único de navegação financeira, inserido em todas as páginas que
    // usam o menu compartilhado.
    if (!sidebar.querySelector('a[href="contas-receber.html"]')) {

        const referencia = sidebar.querySelector('a[href="centros-custo.html"]');
        const item = document.createElement("li");

        item.className = "nav-item";
        item.innerHTML = `
            <a class="nav-link" href="contas-receber.html">
                <i class="fas fa-hand-holding-usd"></i>
                <span>Contas a Receber</span>
            </a>
        `;

        if (referencia?.parentElement) {
            referencia.parentElement.insertAdjacentElement("afterend", item);
        } else {
            sidebar.appendChild(item);
        }
    }

    if (!sidebar.querySelector('a[href="fechamento-caixa.html"]')) {
        const referencia = sidebar.querySelector('a[href="movimentacoes.html"]');
        const item = document.createElement("li");
        item.className = "nav-item";
        item.innerHTML = `<a class="nav-link" href="fechamento-caixa.html"><i class="fas fa-cash-register"></i><span>Fechamento de Caixa</span></a>`;
        if (referencia?.parentElement) referencia.parentElement.insertAdjacentElement("afterend", item);
        else sidebar.appendChild(item);
    }

    if (!overlay || !btnMenu) return;

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
