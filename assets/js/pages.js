(function () {
  const U = window.UniCake;
  if (!U) return;

  function productCard(product) {
    return `
      <article class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
        <div class="product-art ${product.image ? "has-image" : ""}" aria-hidden="true">
          ${product.image ? `<img src="${product.image}" alt="" loading="lazy" />` : `<span>${U.initials(product.name)}</span>`}
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${product.badge}</span>
            <span>${U.stars(product.rating)}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <small>${product.store}</small>
          <div class="product-footer">
            <strong>${U.money.format(product.price)}</strong>
            <button type="button" data-add-cart="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `;
  }

  function promoCard(product) {
    return `
      <article class="promo-card">
        <span class="promo-badge">Oferta</span>
        ${productCard(product)}
      </article>
    `;
  }

  function storeUrl(store) {
    return `Loja.html?id=${encodeURIComponent(store.id)}`;
  }

  // Foto da loja; sem foto cadastrada, mostra as iniciais
  function storeLogo(store, extraClass = "") {
    return store.image
      ? `<img class="store-logo ${extraClass}" src="${store.image}" alt="" loading="lazy" />`
      : `<div class="store-logo ${extraClass}" aria-hidden="true">${store.initials}</div>`;
  }

  function storeCard(store) {
    return `
      <a class="store-card" href="${storeUrl(store)}" aria-label="Ver destaques e promoções de ${store.name}">
        ${storeLogo(store)}
        <div>
          <h3>${store.name}</h3>
          <p>${store.specialty}</p>
          <span>${U.stars(store.rating)} · ${store.time}</span>
        </div>
      </a>
    `;
  }

  function renderHome() {
    const stores = document.getElementById("homeStores");
    const popular = document.getElementById("homePopular");
    const party = document.getElementById("homeParty");
    const testimonials = document.getElementById("testimonialsGrid");

    if (stores) stores.innerHTML = (U.data.stores || []).slice(0, 3).map(storeCard).join("");
    if (popular) popular.innerHTML = (U.data.products || []).filter((product) => product.popular).map(productCard).join("");
    if (party) party.innerHTML = (U.data.products || []).filter((product) => product.party).map(productCard).join("");
    if (testimonials) {
      testimonials.innerHTML = (U.data.testimonials || [])
        .map(
          (item) => `
            <article class="testimonial-card">
              <div class="testimonial-head">
                <div class="avatar" aria-hidden="true">${U.initials(item.name)}</div>
                <div>
                  <h3>${item.name}</h3>
                  ${item.detail ? `<small>${item.detail}</small>` : ""}
                </div>
              </div>
              <div class="stars" aria-label="Avaliação 5 de 5">★★★★★</div>
              <p>${item.text}</p>
            </article>
          `
        )
        .join("");
      const carousel = testimonials.closest(".carousel");
      if (carousel) initCarousel(carousel);
    }
  }

  // Carrossel horizontal: setas, bolinhas de página e avanço automático
  function initCarousel(root) {
    const track = root.querySelector(".carousel-track");
    const dots = root.querySelector("[data-carousel-dots]");
    const cards = [...track.children];
    if (!cards.length) return;

    const perView = () => Math.max(1, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width));
    const pageCount = () => Math.ceil(cards.length / perView());
    const currentPage = () => {
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 2) return pageCount() - 1;
      const step = cards[Math.min(perView(), cards.length - 1)].offsetLeft - cards[0].offsetLeft || track.clientWidth;
      return Math.round(track.scrollLeft / step);
    };
    const goTo = (page) => {
      const total = pageCount();
      const target = ((page % total) + total) % total;
      track.scrollTo({ left: cards[target * perView()].offsetLeft - cards[0].offsetLeft });
    };
    const syncDots = () => {
      const page = currentPage();
      dots.querySelectorAll("button").forEach((dot, index) => {
        dot.classList.toggle("is-active", index === page);
        dot.setAttribute("aria-current", index === page ? "true" : "false");
      });
    };
    const buildDots = () => {
      dots.innerHTML = Array.from(
        { length: pageCount() },
        (_, index) => `<button type="button" data-carousel-dot="${index}" aria-label="Ir para o grupo ${index + 1} de depoimentos"></button>`
      ).join("");
      syncDots();
    };

    root.querySelector("[data-carousel-prev]").addEventListener("click", () => goTo(currentPage() - 1));
    root.querySelector("[data-carousel-next]").addEventListener("click", () => goTo(currentPage() + 1));
    dots.addEventListener("click", (event) => {
      const dot = event.target.closest("[data-carousel-dot]");
      if (dot) goTo(Number(dot.dataset.carouselDot));
    });
    track.addEventListener("scroll", syncDots, { passive: true });
    window.addEventListener("resize", buildDots);
    buildDots();

    // Avança sozinho, mas pausa com o mouse ou o foco em cima e respeita "reduzir movimento"
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = null;
    const start = () => {
      if (!timer) timer = window.setInterval(() => goTo(currentPage() + 1), 5000);
    };
    const stop = () => {
      window.clearInterval(timer);
      timer = null;
    };
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    start();
  }

  function renderProductPage() {
    const grid = document.getElementById("productsGrid");
    const chips = document.getElementById("categoryChips");
    const search = document.getElementById("productSearch");
    const sort = document.getElementById("productSort");
    const params = new URLSearchParams(window.location.search);
    let activeCategory = params.get("cat") || "todos";
    let promoOnly = params.get("promo") === "1";

    if (!grid || !chips) return;

    chips.innerHTML = [
      '<button type="button" data-category-filter="todos">Todos</button>',
      ...(U.data.categories || []).map((category) => `<button type="button" data-category-filter="${category.id}">${category.label}</button>`),
      '<button type="button" data-promo-filter>Promoções</button>',
    ].join("");

    if (search && params.get("q")) search.value = params.get("q");
    if (sort && [...sort.options].some((option) => option.value === params.get("sort"))) sort.value = params.get("sort");

    function applyFilters() {
      const term = (search?.value || "").trim().toLowerCase();
      const sortValue = sort?.value || "relevancia";
      let products = [...(U.data.products || [])];

      if (activeCategory !== "todos") products = products.filter((product) => product.category === activeCategory);
      if (promoOnly) products = products.filter((product) => product.promo);
      if (term) {
        products = products.filter((product) =>
          [product.name, product.store, product.description, product.category].join(" ").toLowerCase().includes(term)
        );
      }
      if (sortValue === "menor") products.sort((a, b) => a.price - b.price);
      if (sortValue === "maior") products.sort((a, b) => b.price - a.price);
      if (sortValue === "avaliacao") products.sort((a, b) => b.rating - a.rating);

      grid.innerHTML = products.length ? products.map(productCard).join("") : '<p class="empty-state">Nenhum produto encontrado.</p>';
      chips.querySelectorAll("[data-category-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.categoryFilter === activeCategory));
      chips.querySelector("[data-promo-filter]").classList.toggle("is-active", promoOnly);
    }

    chips.addEventListener("click", (event) => {
      if (event.target.closest("[data-promo-filter]")) {
        promoOnly = !promoOnly;
        applyFilters();
        return;
      }
      const button = event.target.closest("[data-category-filter]");
      if (!button) return;
      activeCategory = button.dataset.categoryFilter;
      applyFilters();
    });
    search?.addEventListener("input", applyFilters);
    sort?.addEventListener("change", applyFilters);
    applyFilters();
  }

  function renderPromotions() {
    const grid = document.getElementById("promoGrid");
    if (!grid) return;
    grid.innerHTML = (U.data.products || [])
      .filter((product) => product.promo)
      .map(promoCard)
      .join("");
  }

  // Página de uma loja (Loja.html?id=...): destaques e promoções dos produtos dela
  function renderStorePage() {
    const hero = document.getElementById("storeHero");
    const featuredGrid = document.getElementById("storeFeatured");
    const promoGrid = document.getElementById("storePromos");
    if (!hero || !featuredGrid || !promoGrid) return;

    const storeId = new URLSearchParams(window.location.search).get("id");
    const store = (U.data.stores || []).find((item) => item.id === storeId);
    if (!store) {
      hero.innerHTML = `
        <div>
          <span class="eyebrow">Lojas cadastradas</span>
          <h1>Loja não encontrada.</h1>
          <p>Não encontramos esta loja. <a href="paginalojas.html">Ver todas as lojas</a></p>
        </div>
      `;
      document.getElementById("storeFeaturedSection").hidden = true;
      document.getElementById("storePromosSection").hidden = true;
      return;
    }

    const products = (U.data.products || []).filter((product) => product.store === store.name);
    // Destaques: os marcados como populares; se a loja não tiver nenhum, o mais bem avaliado
    let featured = products.filter((product) => product.popular);
    if (!featured.length) featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 1);
    const promos = products.filter((product) => product.promo);

    document.title = `UniCake | ${store.name}`;
    hero.innerHTML = `
      <div>
        <span class="eyebrow">${store.specialty}</span>
        <h1>${store.name}</h1>
        <p>${store.description}</p>
        <div class="store-tags">
          <span>${store.neighborhood}</span>
          <span>${store.time}</span>
          <span>${U.stars(store.rating)}</span>
        </div>
      </div>
      <aside class="hero-card">
        ${store.image ? `<img class="store-photo" src="${store.image}" alt="" />` : ""}
        <strong>${products.length}</strong>
        <p>${products.length === 1 ? "produto" : "produtos"} no catálogo, ${promos.length} em promoção.</p>
      </aside>
    `;
    document.getElementById("storeAllProducts").href = `ParaVoce.html?q=${encodeURIComponent(store.name)}`;

    featuredGrid.innerHTML = featured.length
      ? featured.map(productCard).join("")
      : '<p class="empty-state">Esta loja ainda não tem produtos cadastrados.</p>';
    promoGrid.innerHTML = promos.length
      ? promos.map(promoCard).join("")
      : '<p class="empty-state">Esta loja não tem promoções no momento.</p>';
  }

  function renderStores() {
    const grid = document.getElementById("storesGrid");
    const search = document.getElementById("storeSearch");
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) search.value = params.get("q");

    function apply() {
      const term = (search?.value || "").trim().toLowerCase();
      const stores = (U.data.stores || []).filter((store) =>
        [store.name, store.neighborhood, store.specialty, store.description].join(" ").toLowerCase().includes(term)
      );

      grid.innerHTML = stores
        .map(
          (store) => `
            <article class="store-detail">
              ${storeLogo(store, "store-logo-lg")}
              <div>
                <h2>${store.name}</h2>
                <p>${store.description}</p>
                <div class="store-tags">
                  <span>${store.specialty}</span>
                  <span>${store.neighborhood}</span>
                  <span>${store.time}</span>
                  <span>${U.stars(store.rating)}</span>
                </div>
                <a href="${storeUrl(store)}">Ver destaques e promoções</a>
              </div>
            </article>
          `
        )
        .join("");
    }

    search?.addEventListener("input", apply);
    apply();
  }

  function renderCompanies() {
    const plans = document.getElementById("plansGrid");
    if (!plans) return;
    const maintenanceDialog = document.getElementById("maintenanceDialog");
    plans.innerHTML = (U.data.plans || [])
      .map(
        (plan) => `
          <article class="plan-card ${plan.featured ? "is-featured" : ""}">
            ${plan.featured ? '<span class="plan-ribbon">Mais popular</span>' : ""}
            <div class="plan-icon">${U.icons.heart}</div>
            <h2>${plan.name}</h2>
            <p>${plan.tagline}</p>
            <div class="plan-price"><strong>${plan.price}</strong><span>${plan.period}</span></div>
            <ul>
              ${plan.features.map((feature) => `<li>${U.icons.check}<span>${feature}</span></li>`).join("")}
            </ul>
            <button type="button" data-plan="${plan.name}">Escolher plano</button>
          </article>
        `
      )
      .join("");

    plans.addEventListener("click", (event) => {
      const button = event.target.closest("[data-plan]");
      if (!button) return;
      maintenanceDialog?.showModal();
    });

    maintenanceDialog?.addEventListener("click", (event) => {
      if (event.target === maintenanceDialog) maintenanceDialog.close();
    });
  }

  function renderSupportPage() {
    const faq = document.getElementById("faqList");
    const form = document.getElementById("supportForm");
    if (faq) {
      faq.innerHTML = (U.data.faqs || [])
        .map(
          (item) => `
            <details>
              <summary>${item.question}</summary>
              <p>${item.answer}</p>
            </details>
          `
        )
        .join("");
    }

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("supportFormStatus");
      if (status) status.textContent = "Solicitação registrada. Nossa equipe retornará pelo e-mail informado.";
      form.reset();
    });
  }

  function renderLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    const googleButton = document.querySelector(".google-button");
    const Auth = window.UniCakeAuth;
    const nameField = form?.elements.namedItem("name");
    const identifierField = form?.elements.namedItem("email");
    const identifierLabel = document.getElementById("authIdentifierLabel");
    const toggleMode = document.getElementById("authModeToggle");
    let isRegisterMode = false;

    function setRegisterMode(enabled) {
      isRegisterMode = enabled;
      nameField.closest("label").hidden = !enabled;
      nameField.required = enabled;
      identifierField.type = enabled ? "email" : "text";
      identifierField.autocomplete = enabled ? "email" : "username";
      identifierField.placeholder = enabled ? "voce@email.com" : "Seu nome ou e-mail";
      identifierLabel.textContent = enabled ? "E-mail" : "Nome ou e-mail";
      form.elements.password.minLength = enabled ? 8 : 0;
      form.elements.password.autocomplete = enabled ? "new-password" : "current-password";
      form.querySelector('[type="submit"]').textContent = enabled ? "Criar conta" : "Entrar";
      document.getElementById("login-title").textContent = enabled ? "Criar conta" : "Entrar";
      toggleMode.textContent = enabled ? "Já tem conta? Entre" : "Ainda não tem conta? Cadastre-se";
    }

    toggleMode?.addEventListener("click", (event) => {
      event.preventDefault();
      setRegisterMode(!isRegisterMode);
      const status = document.getElementById("loginStatus");
      if (status) status.textContent = "";
    });

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.elements.email.value;
      const password = form.elements.password.value;
      const status = document.getElementById("loginStatus");

      let user;
      try {
        if (isRegisterMode) {
          const result = await Auth?.registerTraditionalUser(
            nameField.value,
            email,
            password
          );
          if (result?.error) {
            if (status) {
              status.textContent = result.error;
              status.style.color = "red";
            }
            return;
          }
          user = result?.user;
        } else {
          user = await Auth?.handleTraditionalLogin(email, password);
        }
      } catch (error) {
        console.error("Erro na autenticação tradicional:", error);
        if (status) {
          status.textContent = error.message || "Não foi possível concluir a autenticação.";
          status.style.color = "red";
        }
        return;
      }

      if (user) {
        if (status) {
          status.textContent = isRegisterMode
            ? `Conta criada. Bem-vindo, ${user.name}!`
            : `Bem-vindo, ${user.name}! Login realizado com sucesso.`;
          status.style.color = "green";
        }
        // Redirecionar após login bem-sucedido
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
      } else {
        if (status) {
          status.textContent = "Nome/e-mail ou senha incorretos.";
          status.style.color = "red";
        }
      }
    });

    setRegisterMode(false);

    // Handle Google Sign-In
    if (googleButton && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "621954972061-afec0snf9b2hukkudnrb8a4hkpsr6rpc.apps.googleusercontent.com",
        callback: (response) => {
          const user = Auth?.handleGoogleCallback(response);
          if (user) {
            const status = document.getElementById("loginStatus");
            if (status) {
              status.textContent = `Bem-vindo, ${user.name}! Você foi autenticado com Google.`;
              status.style.color = "green";
            }
            // Redirecionar após login bem-sucedido
            setTimeout(() => {
              window.location.href = "../index.html";
            }, 1500);
          }
        },
      });

      // Render Google Sign-In button
      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width: "100%",
      });
    }
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14 }
    );
    items.forEach((item) => observer.observe(item));
  }

  U.ready(() => {
    renderHome();
    renderProductPage();
    renderPromotions();
    renderStores();
    renderStorePage();
    renderCompanies();
    renderSupportPage();
    renderLogin();
    initReveal();
  });
})();
