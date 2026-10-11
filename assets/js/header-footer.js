(function () {
  const U = window.UniCake;
  if (!U) return;

  const MODE_STORAGE_KEY = "unicake.modo";
  const BAKER_TOKEN_KEY = "unicake.confeiteiro.token";
  const BAKER_PROFILE_KEY = "unicake.confeiteiro.perfil";

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  // Quem está logado (cliente e/ou confeiteiro) e com qual dos dois perfis a pessoa está navegando
  function activeSession() {
    // Cliente só conta como logado se tiver a sessão aberta no servidor
    const client = localStorage.getItem("unicake.cliente.token") ? readJson("unicake.auth") : null;
    const baker = localStorage.getItem(BAKER_TOKEN_KEY) ? readJson(BAKER_PROFILE_KEY) : null;
    let mode = localStorage.getItem(MODE_STORAGE_KEY);
    if ((mode === "confeiteiro" && !baker) || (mode === "cliente" && !client)) mode = null;
    if (!mode) mode = client ? "cliente" : baker ? "confeiteiro" : null;
    return { mode, client, baker };
  }

  function renderUserSection() {
    const { mode, client, baker } = activeSession();
    const e = U.escapeHtml;

    if (mode === "cliente") {
      return `
        <div class="user-menu">
          <button class="user-button" type="button" aria-label="Abrir informações da conta" aria-expanded="false" data-user-menu-toggle>
            ${client.picture ? `<img src="${e(client.picture)}" alt="Foto de ${e(client.name)}" class="user-avatar">` : `<div class="user-avatar-initials" aria-hidden="true">${e(U.initials(client.name || "?"))}</div>`}
          </button>
          <div class="user-dropdown" data-user-dropdown hidden>
            <strong>${e(client.name)}</strong>
            <span>${e(client.email)}</span>
            <small>Acessando como cliente · Conta ${client.provider === "google" ? "Google" : "UniCake"}</small>
            <a class="user-switch" href="MinhaConta.html">Minha conta</a>
            <a class="user-switch" href="${baker ? "MinhaLoja.html" : "Confeiteiro.html"}" data-switch-mode="confeiteiro">Acessar como confeiteiro</a>
            <button class="logout-button" type="button" data-logout aria-label="Sair">Sair</button>
          </div>
        </div>
      `;
    }

    if (mode === "confeiteiro") {
      return `
        <div class="user-menu">
          <button class="user-button" type="button" aria-label="Abrir informações da conta" aria-expanded="false" data-user-menu-toggle>
            <div class="user-avatar-initials is-baker" aria-hidden="true">${e(U.initials(baker.nome_loja || baker.nome || "?"))}</div>
          </button>
          <div class="user-dropdown" data-user-dropdown hidden>
            <strong>${e(baker.nome)}</strong>
            <span>${e(baker.email)}</span>
            <small>Acessando como confeiteiro · ${e(baker.nome_loja)}</small>
            <a class="user-switch" href="MinhaLoja.html">Minha loja (produtos)</a>
            <a class="user-switch" href="${client ? "index.html" : "Entrar.html"}" data-switch-mode="cliente">Acessar como cliente</a>
            <button class="logout-button" type="button" data-logout aria-label="Sair">Sair</button>
          </div>
        </div>
      `;
    }

    return `
      <a class="login-link" href="Entrar.html" aria-label="Entrar">
        ${U.icons.user}
        <span>Entrar</span>
      </a>
    `;
  }

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
            <span class="brand-mark" aria-hidden="true"><img src="../assets/img/logo-bolo.png" alt="" /></span>
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
              <button class="icon-button search-filter" type="button" title="Filtrar busca" aria-label="Filtrar busca" aria-expanded="false" aria-controls="siteSearchFilters" data-search-filter>
                ${U.icons.filter}
              </button>
              <div class="search-results" id="siteSearchResults"></div>
              <form class="search-filters" id="siteSearchFilters" aria-label="Filtros da busca" hidden>
                <label>
                  Categoria
                  <select name="cat">
                    <option value="">Todas</option>
                    ${(U.data.categories || []).map((category) => `<option value="${category.id}">${category.label}</option>`).join("")}
                  </select>
                </label>
                <label>
                  Ordenar por
                  <select name="sort">
                    <option value="">Relevância</option>
                    <option value="menor">Menor preço</option>
                    <option value="maior">Maior preço</option>
                    <option value="avaliacao">Melhor avaliação</option>
                  </select>
                </label>
                <label class="search-filters-check">
                  <input type="checkbox" name="promo" value="1" />
                  Somente promoções
                </label>
                <div class="search-filters-actions">
                  <button type="button" data-filter-clear>Limpar</button>
                  <button type="submit">Aplicar</button>
                </div>
              </form>
            </div>
            <div class="user-section">
              ${renderUserSection()}
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
            <a href="Confeiteiro.html">Área do confeiteiro</a>
            <a href="ParaEmpresas.html">Planos para empresas</a>
          </nav>
        </div>
        <div class="footer-bottom">
          <span>&copy; 2026 UniCake. Todos os direitos reservados.</span>
          <a href="Creditos.html">Créditos das imagens</a>
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
    const filters = document.getElementById("siteSearchFilters");
    const filterToggle = document.querySelector("[data-search-filter]");

    const filterState = () => ({
      cat: filters?.elements.cat.value || "",
      sort: filters?.elements.sort.value || "",
      promo: Boolean(filters?.elements.promo.checked),
    });
    const hasFilters = () => {
      const state = filterState();
      return Boolean(state.cat || state.sort || state.promo);
    };
    // Monta o link da página de produtos com o termo e os filtros escolhidos
    const searchUrl = (term) => {
      const state = filterState();
      const query = new URLSearchParams();
      if (term) query.set("q", term);
      if (state.cat) query.set("cat", state.cat);
      if (state.sort) query.set("sort", state.sort);
      if (state.promo) query.set("promo", "1");
      const text = query.toString();
      return "ParaVoce.html" + (text ? "?" + text : "");
    };
    const closeFilters = () => {
      if (!filters) return;
      filters.hidden = true;
      filterToggle?.setAttribute("aria-expanded", "false");
    };

    if (input && results) {
      const showResults = () => {
        const term = input.value.trim().toLowerCase();
        const state = filterState();
        if (!term) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }

        let products = (U.data.products || []).filter((product) =>
          [product.name, product.store, product.category].join(" ").toLowerCase().includes(term)
        );
        if (state.cat) products = products.filter((product) => product.category === state.cat);
        if (state.promo) products = products.filter((product) => product.promo);
        if (state.sort === "menor") products.sort((a, b) => a.price - b.price);
        if (state.sort === "maior") products.sort((a, b) => b.price - a.price);
        if (state.sort === "avaliacao") products.sort((a, b) => b.rating - a.rating);

        // Categoria e promoção são filtros de produto, então as lojas só aparecem sem eles
        const stores = state.cat || state.promo ? [] : (U.data.stores || []).filter((store) => store.name.toLowerCase().includes(term));
        const productHtml = products
          .slice(0, 5)
          .map(
            (product) => `
              <a href="${searchUrl(term)}">
                <span>${U.escapeHtml(product.name)}</span>
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

      input.addEventListener("input", () => {
        closeFilters();
        showResults();
      });
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && (input.value.trim() || hasFilters())) {
          window.location.href = searchUrl(input.value.trim());
        }
      });
      document.addEventListener("click", (event) => {
        if (!event.target.closest(".search-box")) {
          results.classList.remove("is-open");
          closeFilters();
        }
      });

      if (filters && filterToggle) {
        const syncFilterToggle = () => filterToggle.classList.toggle("has-filters", hasFilters());

        // Mantém os filtros da URL ao navegar (ex.: ParaVoce.html?cat=bolos&promo=1)
        const pageParams = new URLSearchParams(window.location.search);
        ["cat", "sort"].forEach((name) => {
          const value = pageParams.get(name) || "";
          const select = filters.elements[name];
          if ([...select.options].some((option) => option.value === value)) select.value = value;
        });
        filters.elements.promo.checked = pageParams.get("promo") === "1";
        if (pageParams.get("q")) input.value = pageParams.get("q");
        syncFilterToggle();

        filterToggle.addEventListener("click", () => {
          const open = filters.hidden;
          filters.hidden = !open;
          filterToggle.setAttribute("aria-expanded", String(open));
          if (open) results.classList.remove("is-open");
        });
        filters.addEventListener("change", syncFilterToggle);
        filters.addEventListener("submit", (event) => {
          event.preventDefault();
          window.location.href = searchUrl(input.value.trim());
        });
        filters.querySelector("[data-filter-clear]").addEventListener("click", () => {
          filters.reset();
          syncFilterToggle();
        });
      }
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        nav?.classList.remove("is-open");
        menuToggle?.setAttribute("aria-expanded", "false");
        results?.classList.remove("is-open");
        closeFilters();
        const userToggle = document.querySelector("[data-user-menu-toggle]");
        const userDropdown = document.querySelector("[data-user-dropdown]");
        userDropdown?.setAttribute("hidden", "");
        userToggle?.setAttribute("aria-expanded", "false");
      }
    });

    const userToggle = document.querySelector("[data-user-menu-toggle]");
    const userDropdown = document.querySelector("[data-user-dropdown]");
    userToggle?.addEventListener("click", (event) => {
      event.stopPropagation();
      const isHidden = userDropdown?.hasAttribute("hidden");
      userDropdown?.toggleAttribute("hidden", !isHidden);
      userToggle.setAttribute("aria-expanded", String(Boolean(isHidden)));
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".user-menu")) {
        userDropdown?.setAttribute("hidden", "");
        userToggle?.setAttribute("aria-expanded", "false");
      }
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
        if (!confirm("Tem certeza que deseja sair?")) return;

        // Sai apenas do perfil em uso; o outro (se houver) continua logado
        if (activeSession().mode === "confeiteiro") {
          const token = localStorage.getItem(BAKER_TOKEN_KEY);
          fetch(U.apiBase + "/api/confeiteiros/logout", {
            method: "POST",
            headers: { Authorization: "Bearer " + token },
            keepalive: true,
          }).catch(() => {});
          localStorage.removeItem(BAKER_TOKEN_KEY);
          localStorage.removeItem(BAKER_PROFILE_KEY);
          localStorage.removeItem(MODE_STORAGE_KEY);
          window.location.href = "Confeiteiro.html";
          return;
        }

        window.UniCakeAuth?.logout();
        localStorage.removeItem(MODE_STORAGE_KEY);
        window.location.href = "Entrar.html";
      });
    }

    // "Acessar como cliente / como confeiteiro": guarda o perfil escolhido antes de seguir o link
    document.querySelectorAll("[data-switch-mode]").forEach((link) => {
      link.addEventListener("click", () => {
        localStorage.setItem(MODE_STORAGE_KEY, link.dataset.switchMode);
      });
    });

    // Adicionar event listener para restauração de sessão
    document.addEventListener("unicake:session-restored", (event) => {
      const user = event.detail;
      console.log("✅ Sessão do usuário restaurada:", user.name);
    });
  });
})();
