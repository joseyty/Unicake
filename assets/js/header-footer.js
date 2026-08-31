(function () {
  const U = window.UniCake;
  if (!U) return;

  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;

    const active = U.pageName();
    const links = [
      ["home", "Início", "index.html"],
      ["para-voce", "Para você", "ParaVoce.html"],
      ["promocoes", "Promoções", "promocoes.html"],
      ["lojas", "Lojas", "paginalojas.html"],
      ["sobre", "Sobre", "Sobre.html"],
      ["empresas", "Para empresas", "ParaEmpresas.html"],
      ["suporte", "Suporte", "Suporte.html"],
    ];

    target.innerHTML = `
      <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" href="index.html" aria-label="Página inicial da UniCake">
            <span class="brand-mark" aria-hidden="true">U</span>
            <span class="brand-name">UniCake</span>
          </a>
          <button class="icon-button menu-toggle" type="button" aria-expanded="false" aria-controls="primaryMenu" title="Abrir menu">
            ${U.icons.menu}
          </button>
          <nav class="site-nav" id="primaryMenu" aria-label="Menu principal">
            ${links
              .map(
                ([id, label, href]) =>
                  `<a href="${href}" class="${active === id ? "is-active" : ""} ${id === "empresas" ? "nav-highlight" : ""}">${label}</a>`
              )
              .join("")}
          </nav>
          <div class="header-tools">
            <div class="search-box" role="search">
              ${U.icons.search}
              <input id="siteSearch" type="search" autocomplete="off" placeholder="Busque por item ou loja" aria-label="Buscar por item ou loja" />
              <button class="icon-button search-filter" type="button" title="Buscar promoções" data-search-promo>
                ${U.icons.filter}
              </button>
              <div class="search-results" id="siteSearchResults"></div>
            </div>
            <div class="user-section">
              ${
                window.UniCakeAuth?.isLoggedIn()
                  ? (() => {
                      const user = window.UniCakeAuth.getUser();
                      return `
                        <div class="user-menu">
                          <button class="user-button" type="button" aria-label="Menu do usuário">
                            ${user.picture ? `<img src="${user.picture}" alt="${user.name}" class="user-avatar">` : `<div class="user-avatar-initials">${U.initials(user.name)}</div>`}
                            <span>${user.name.split(" ")[0]}</span>
                          </button>
                          <button class="logout-button" type="button" data-logout aria-label="Sair">Sair</button>
                        </div>
                      `;
                    })()
                  : `<a class="login-link" href="Entrar.html" aria-label="Entrar">
                      ${U.icons.user}
                      <span>Entrar</span>
                    </a>`
              }
            </div>
            <button class="cart-button" type="button" data-cart-open aria-label="Abrir carrinho">
              ${U.icons.cart}
              <span class="cart-total" data-cart-count>0</span>
            </button>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;

    target.innerHTML = `
      <footer class="site-footer">
        <div class="footer-scallop" aria-hidden="true"></div>
        <div class="footer-inner">
          <section class="footer-brand">
            <a class="footer-logo" href="index.html">UniCake</a>
            <p>Confeitarias locais, pedidos especiais e suporte em um fluxo simples.</p>
            <div class="footer-social" aria-label="Canais de contato">
              <a href="Suporte.html">Atendimento</a>
              <a href="ParaEmpresas.html">Empresas</a>
            </div>
          </section>
          <nav class="footer-col" aria-label="Navegação do rodapé">
            <h2>Mapa do site</h2>
            <a href="ParaVoce.html">Para você</a>
            <a href="promocoes.html">Promoções</a>
            <a href="paginalojas.html">Lojas cadastradas</a>
            <a href="Sobre.html">Sobre</a>
          </nav>
          <nav class="footer-col" aria-label="Categorias">
            <h2>Categorias</h2>
            ${(U.data.categories || []).map((category) => `<a href="ParaVoce.html?cat=${category.id}">${category.label}</a>`).join("")}
          </nav>
          <nav class="footer-col" aria-label="Atendimento">
            <h2>Atendimento</h2>
            <a href="Suporte.html">Suporte</a>
            <a href="Suporte.html#faq">Central de ajuda</a>
            <a href="Entrar.html">Entrar na conta</a>
            <a href="ParaEmpresas.html">Planos para empresas</a>
          </nav>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 UniCake. Todos os direitos reservados.</span>
        </div>
      </footer>
    `;
  }

  function initHeader() {
    let menuToggle = document.querySelector(".menu-toggle");
    let nav = document.querySelector(".site-nav");
    let results = null;
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(open));
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    const input = document.getElementById("siteSearch");
    results = document.getElementById("siteSearchResults");
    if (input && results) {
      const showResults = () => {
        const term = input.value.trim().toLowerCase();
        if (!term) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }

        const products = (U.data.products || []).filter((product) =>
          [product.name, product.store, product.category].join(" ").toLowerCase().includes(term)
        );
        const stores = (U.data.stores || []).filter((store) => store.name.toLowerCase().includes(term));
        const productHtml = products
          .slice(0, 5)
          .map(
            (product) => `
              <a href="ParaVoce.html?q=${encodeURIComponent(term)}">
                <span>${product.name}</span>
                <strong>${U.money.format(product.price)}</strong>
              </a>
            `
          )
          .join("");
        const storeHtml = stores
          .slice(0, 3)
          .map((store) => `<a href="paginalojas.html?q=${encodeURIComponent(store.name)}"><span>${store.name}</span><strong>${store.time}</strong></a>`)
          .join("");

        results.innerHTML = productHtml || storeHtml ? productHtml + storeHtml : "<p>Nenhum resultado encontrado.</p>";
        results.classList.add("is-open");
      };

      input.addEventListener("input", showResults);
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && input.value.trim()) {
          window.location.href = `ParaVoce.html?q=${encodeURIComponent(input.value.trim())}`;
        }
      });
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".search-box")) results.classList.remove("is-open");
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        nav?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        results?.classList.remove("is-open");
      }
    });

    document.querySelector("[data-search-promo]")?.addEventListener("click", () => {
      window.location.href = "promocoes.html";
    });
  }

  U.ready(() => {
    renderHeader();
    renderFooter();
    initHeader();

    // Adicionar event listener para logout
    const logoutButton = document.querySelector("[data-logout]");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        if (confirm("Tem certeza que deseja sair?")) {
          window.UniCakeAuth?.logout();
          window.location.href = "Entrar.html";
        }
      });
    }

    // Adicionar event listener para restauração de sessão
    document.addEventListener("unicake:session-restored", (event) => {
      const user = event.detail;
      console.log("✅ Sessão do usuário restaurada:", user.name);
    });
  });
})();
