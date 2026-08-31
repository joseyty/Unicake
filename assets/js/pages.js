(function () {
  const U = window.UniCake;
  if (!U) return;

  function productCard(product) {
    return `
      <article class="product-card" data-category="${product.category}" data-name="${product.name.toLowerCase()}">
        <div class="product-art" aria-hidden="true">
          <span>${U.initials(product.name)}</span>
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

  function storeCard(store) {
    return `
      <article class="store-card">
        <div class="store-logo" aria-hidden="true">${store.initials}</div>
        <div>
          <h3>${store.name}</h3>
          <p>${store.specialty}</p>
          <span>${U.stars(store.rating)} · ${store.time}</span>
        </div>
      </article>
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
            <article class="testimonial-card reveal">
              <div class="avatar" aria-hidden="true">${U.initials(item.name)}</div>
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
      ...(U.data.categories || []).map((category) => `<button type="button" data-category-filter="${category.id}">${category.label}</button>`),
    ].join("");

    if (search && params.get("q")) search.value = params.get("q");

    function applyFilters() {
      const term = (search?.value || "").trim().toLowerCase();
      const sortValue = sort?.value || "relevancia";
      let products = [...(U.data.products || [])];

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
    grid.innerHTML = (U.data.products || [])
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
      const stores = (U.data.stores || []).filter((store) =>
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
                  <span>${U.stars(store.rating)}</span>
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
      localStorage.setItem("unicake.selectedPlan", button.dataset.plan);
      document.body.classList.add("support-open");
      document.querySelector("[data-support-open]")?.setAttribute("aria-expanded", "true");
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
    const googleButton = document.querySelector(".google-button");
    const Auth = window.UniCakeAuth;

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      const status = document.getElementById("loginStatus");

      const user = Auth?.handleTraditionalLogin(email, password);
      if (user) {
        if (status) {
          status.textContent = `Bem-vindo, ${user.name}! Login realizado com sucesso.`;
          status.style.color = "green";
        }
        // Redirecionar após login bem-sucedido
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
      } else {
        if (status) {
          status.textContent = "Erro ao fazer login. Verifique as credenciais.";
          status.style.color = "red";
        }
      }
    });

    // Handle Google Sign-In
    if (googleButton && window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: "621954972061-afec0snf9b2hukkudnrb8a4hkpsr6rpc.apps.googleusercontent.com";
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
    renderCompanies();
    renderSupportPage();
    renderLogin();
    initReveal();
  });
})();
