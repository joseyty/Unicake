(function () {
  const data = window.UniCakeData || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function icon(name) {
    const icons = {
      heart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
      store: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 9l2-5h14l2 5"></path><path d="M5 9v11h14V9"></path><path d="M9 20v-6h6v6"></path></svg>',
      truck: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 7h11v10H3z"></path><path d="M14 10h4l3 3v4h-7z"></path><circle cx="7" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle></svg>',
      check: '<svg aria-hidden="true" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
    };
    return icons[name] || "";
  }

  function stars(rating) {
    return `<span class="stars" aria-label="Avaliação ${rating} de 5">★★★★★</span><span>${Number(rating).toFixed(1)}</span>`;
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function productCard(product) {
    return `
      <article class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
        <div class="product-art" aria-hidden="true">
          <span>${initials(product.name)}</span>
        </div>
        <div class="product-body">
          <div class="product-meta">
            <span>${product.badge}</span>
            <span>${stars(product.rating)}</span>
          </div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <small>${product.store}</small>
          <div class="product-footer">
            <strong>${money.format(product.price)}</strong>
            <button type="button" data-add-cart="${product.id}">Adicionar</button>
          </div>
        </div>
      </article>
    `;
  }

  function storeCard(store) {
    return `
      <article class="store-card">
        <div class="store-logo" aria-hidden="true">${store.initials}</div>
        <div>
          <h3>${store.name}</h3>
          <p>${store.specialty}</p>
          <span>${stars(store.rating)} · ${store.time}</span>
        </div>
      </article>
    `;
  }

  function renderHome() {
    const stores = document.getElementById("homeStores");
    const popular = document.getElementById("homePopular");
    const party = document.getElementById("homeParty");
    const testimonials = document.getElementById("testimonialsGrid");

    if (stores) stores.innerHTML = (data.stores || []).slice(0, 3).map(storeCard).join("");
    if (popular) popular.innerHTML = (data.products || []).filter((product) => product.popular).map(productCard).join("");
    if (party) party.innerHTML = (data.products || []).filter((product) => product.party).map(productCard).join("");
    if (testimonials) {
      testimonials.innerHTML = (data.testimonials || [])
        .map(
          (item) => `
            <article class="testimonial-card reveal">
              <div class="avatar" aria-hidden="true">${initials(item.name)}</div>
              <h3>${item.name}</h3>
              <div class="stars">★★★★★</div>
              <p>${item.text}</p>
            </article>
          `
        )
        .join("");
    }
  }

  function renderProductPage() {
    const grid = document.getElementById("productsGrid");
    const chips = document.getElementById("categoryChips");
    const search = document.getElementById("productSearch");
    const sort = document.getElementById("productSort");
    const params = new URLSearchParams(window.location.search);
    let activeCategory = params.get("cat") || "todos";

    if (!grid || !chips) return;

    chips.innerHTML = [
      '<button type="button" data-category-filter="todos">Todos</button>',
      ...(data.categories || []).map((category) => `<button type="button" data-category-filter="${category.id}">${category.label}</button>`),
    ].join("");

    if (search && params.get("q")) search.value = params.get("q");

    function applyFilters() {
      const term = (search?.value || "").trim().toLowerCase();
      const sortValue = sort?.value || "relevancia";
      let products = [...(data.products || [])];

      if (activeCategory !== "todos") products = products.filter((product) => product.category === activeCategory);
      if (term) {
        products = products.filter((product) =>
          [product.name, product.store, product.description, product.category].join(" ").toLowerCase().includes(term)
        );
      }
      if (sortValue === "menor") products.sort((a, b) => a.price - b.price);
      if (sortValue === "maior") products.sort((a, b) => b.price - a.price);
      if (sortValue === "avaliacao") products.sort((a, b) => b.rating - a.rating);

      grid.innerHTML = products.length ? products.map(productCard).join("") : '<p class="empty-state">Nenhum produto encontrado.</p>';
      chips.querySelectorAll("button").forEach((button) => button.classList.toggle("is-active", button.dataset.categoryFilter === activeCategory));
    }

    chips.addEventListener("click", (event) => {
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
    grid.innerHTML = (data.products || [])
      .filter((product) => product.promo)
      .map(
        (product) => `
          <article class="promo-card">
            <span class="promo-badge">Oferta</span>
            ${productCard(product)}
          </article>
        `
      )
      .join("");
  }

  function renderStores() {
    const grid = document.getElementById("storesGrid");
    const search = document.getElementById("storeSearch");
    if (!grid) return;
    const params = new URLSearchParams(window.location.search);
    if (search && params.get("q")) search.value = params.get("q");

    function apply() {
      const term = (search?.value || "").trim().toLowerCase();
      const stores = (data.stores || []).filter((store) =>
        [store.name, store.neighborhood, store.specialty, store.description].join(" ").toLowerCase().includes(term)
      );

      grid.innerHTML = stores
        .map(
          (store) => `
            <article class="store-detail">
              <div class="store-logo store-logo-lg" aria-hidden="true">${store.initials}</div>
              <div>
                <h2>${store.name}</h2>
                <p>${store.description}</p>
                <div class="store-tags">
                  <span>${store.specialty}</span>
                  <span>${store.neighborhood}</span>
                  <span>${store.time}</span>
                  <span>${stars(store.rating)}</span>
                </div>
                <a href="ParaVoce.html?q=${encodeURIComponent(store.name)}">Ver produtos</a>
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
    plans.innerHTML = (data.plans || [])
      .map(
        (plan) => `
          <article class="plan-card ${plan.featured ? "is-featured" : ""}">
            ${plan.featured ? '<span class="plan-ribbon">Mais popular</span>' : ""}
            <div class="plan-icon">${icon("heart")}</div>
            <h2>${plan.name}</h2>
            <p>${plan.tagline}</p>
            <div class="plan-price"><strong>${plan.price}</strong><span>${plan.period}</span></div>
            <ul>
              ${plan.features.map((feature) => `<li>${icon("check")}<span>${feature}</span></li>`).join("")}
            </ul>
            <button type="button" data-plan="${plan.name}">Escolher plano</button>
          </article>
        `
      )
      .join("");

    plans.addEventListener("click", (event) => {
      const button = event.target.closest("[data-plan]");
      if (!button) return;
      localStorage.setItem("unicake.selectedPlan", button.dataset.plan);
      document.body.classList.add("support-open");
      document.querySelector("[data-support-open]")?.setAttribute("aria-expanded", "true");
    });
  }

  function renderSupportPage() {
    const faq = document.getElementById("faqList");
    const form = document.getElementById("supportForm");
    if (faq) {
      faq.innerHTML = (data.faqs || [])
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
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = document.getElementById("loginStatus");
      if (status) status.textContent = "Login simulado com sucesso. Integre aqui sua API de autenticação.";
    });
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

  ready(() => {
    renderHome();
    renderProductPage();
    renderPromotions();
    renderStores();
    renderCompanies();
    renderSupportPage();
    renderLogin();
    initReveal();
  });
})();
