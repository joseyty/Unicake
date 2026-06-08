(function () {
  const data = window.UniCakeData || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const storageKeys = {
    cart: "unicake.cart",
    access: "unicake.accessibility",
  };

  const icons = {
    search: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    filter: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="8" y1="12" x2="20" y2="12"></line><line x1="12" y1="18" x2="20" y2="18"></line><circle cx="6" cy="12" r="2"></circle><circle cx="10" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle></svg>',
    user: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    cart: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    plus: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    minus: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    send: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    check: '<svg aria-hidden="true" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    chat: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    access: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"></circle><path d="M4 9h16"></path><path d="M12 9v12"></path><path d="M8 21l4-8 4 8"></path></svg>',
  };

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function pageName() {
    return document.body.dataset.page || "home";
  }

  function starText(rating) {
    const count = Math.round(Number(rating) || 0);
    return "★★★★★".slice(0, Math.max(0, Math.min(5, count)));
  }

  function productById(id) {
    return (data.products || []).find((product) => product.id === id);
  }

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(el.timer);
    el.timer = window.setTimeout(() => el.classList.remove("is-visible"), 2800);
  }

  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;

    const active = pageName();
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
            ${icons.menu}
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
              ${icons.search}
              <input id="siteSearch" type="search" autocomplete="off" placeholder="Busque por item ou loja" aria-label="Buscar por item ou loja" />
              <button class="icon-button search-filter" type="button" title="Buscar promoções" data-search-promo>
                ${icons.filter}
              </button>
              <div class="search-results" id="siteSearchResults"></div>
            </div>
            <a class="login-link" href="Entrar.html" aria-label="Entrar">
              ${icons.user}
              <span>Entrar</span>
            </a>
            <button class="cart-button" type="button" data-cart-open aria-label="Abrir carrinho">
              ${icons.cart}
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
            ${(data.categories || []).map((category) => `<a href="ParaVoce.html?cat=${category.id}">${category.label}</a>`).join("")}
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

  function renderSupportWidget() {
    const target = document.getElementById("site-support");
    if (!target) return;

    target.innerHTML = `
      <div class="support-widget" aria-live="polite">
        <button class="support-toggle" type="button" data-support-open aria-expanded="false" aria-controls="supportPanel" title="Abrir suporte">
          ${icons.chat}
        </button>
        <section class="support-panel" id="supportPanel" aria-label="Chat de suporte UniCake">
          <header class="support-header">
            <div>
              <h2>Suporte UniCake</h2>
              <p>Atendimento online para pedidos, produtos e empresas.</p>
            </div>
            <button class="icon-button" type="button" data-support-close title="Fechar suporte">${icons.close}</button>
          </header>
          <div class="support-messages" data-support-messages>
            <div class="message message-bot">
              <p>Olá! Como posso ajudar hoje?</p>
              <span>Agora</span>
            </div>
          </div>
          <div class="support-options">
            <button type="button" data-support-message="pedido">Meu pedido</button>
            <button type="button" data-support-message="produto">Produtos</button>
            <button type="button" data-support-message="reclamacao">Reclamação</button>
            <button type="button" data-support-message="outro">Outro assunto</button>
          </div>
          <form class="support-form" data-support-form>
            <input type="text" name="message" placeholder="Digite sua mensagem" aria-label="Mensagem para o suporte" required />
            <button type="submit" title="Enviar mensagem">${icons.send}</button>
          </form>
        </section>
      </div>
    `;
  }

  function renderAccessibility() {
    const target = document.getElementById("site-accessibility");
    if (!target) return;

    target.innerHTML = `
      <div class="access-widget">
        <button class="access-toggle" type="button" data-access-open aria-expanded="false" aria-controls="accessPanel" title="Abrir acessibilidade">
          ${icons.access}
        </button>
        <section class="access-panel" id="accessPanel" aria-label="Menu de acessibilidade">
          <header>
            <h2>Acessibilidade</h2>
            <button class="icon-button" type="button" data-access-close title="Fechar acessibilidade">${icons.close}</button>
          </header>
          <div class="access-actions">
            <button type="button" data-access-action="font-up">Aumentar texto</button>
            <button type="button" data-access-action="font-down">Diminuir texto</button>
            <button type="button" data-access-action="contrast">Alto contraste</button>
            <button type="button" data-access-action="links">Destacar links</button>
            <button type="button" data-access-action="line">Espaçamento</button>
            <button type="button" data-access-action="motion">Reduzir movimento</button>
            <button type="button" data-access-action="reset">Restaurar</button>
          </div>
        </section>
      </div>
    `;
  }

  function cartState() {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.cart)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  }

  function cartCount(cart) {
    return cart.reduce((total, item) => total + item.qty, 0);
  }

  function cartSubtotal(cart) {
    return cart.reduce((total, item) => {
      const product = productById(item.id);
      return total + (product ? product.price * item.qty : 0);
    }, 0);
  }

  function renderCart() {
    const target = document.getElementById("site-cart");
    if (!target) return;

    target.innerHTML = `
      <div class="cart-overlay" data-cart-close></div>
      <aside class="cart-drawer" aria-label="Carrinho de compras">
        <header class="cart-head">
          <h2>Meu carrinho</h2>
          <button class="icon-button" type="button" data-cart-close title="Fechar carrinho">${icons.close}</button>
        </header>
        <div class="cart-body">
          <section>
            <h3>Complete seu pedido</h3>
            <div class="cart-suggestions">
              ${(data.products || [])
                .slice(0, 2)
                .map(
                  (product) => `
                    <button class="cart-suggestion" type="button" data-add-cart="${product.id}">
                      <span>${product.name}</span>
                      <strong>${money.format(product.price)}</strong>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>
          <section>
            <h3>Itens</h3>
            <div class="cart-items" data-cart-items></div>
          </section>
          <section class="coupon-box">
            <label for="couponInput">Cupom</label>
            <div>
              <input id="couponInput" type="text" placeholder="Digite UNICAKE10" />
              <button type="button" data-coupon-apply>Aplicar</button>
            </div>
            <p data-coupon-feedback></p>
          </section>
        </div>
        <footer class="cart-foot">
          <div class="summary-row"><span>Subtotal</span><strong data-cart-subtotal>R$ 0,00</strong></div>
          <div class="summary-row"><span>Entrega</span><strong data-cart-delivery>R$ 5,00</strong></div>
          <div class="summary-row summary-total"><span>Total</span><strong data-cart-total>R$ 5,00</strong></div>
          <div class="pay-options" role="group" aria-label="Forma de pagamento">
            <button type="button" data-pay="Pix">Pix</button>
            <button type="button" data-pay="Cartão">Cartão</button>
            <button type="button" data-pay="Dinheiro">Dinheiro</button>
          </div>
          <button class="checkout-button" type="button" data-checkout disabled>Finalizar pedido</button>
        </footer>
      </aside>
    `;
  }

  function syncCart() {
    const cart = cartState();
    const count = cartCount(cart);
    const subtotal = cartSubtotal(cart);
    const delivery = subtotal > 120 || subtotal === 0 ? 0 : 5;
    const discount = document.documentElement.dataset.coupon === "UNICAKE10" ? subtotal * 0.1 : 0;
    const total = Math.max(0, subtotal - discount + delivery);

    document.querySelectorAll("[data-cart-count]").forEach((el) => {
      el.textContent = String(count);
    });

    const items = document.querySelector("[data-cart-items]");
    if (items) {
      items.innerHTML = cart.length
        ? cart
            .map((item) => {
              const product = productById(item.id);
              if (!product) return "";
              return `
                <article class="cart-item">
                  <div>
                    <strong>${product.name}</strong>
                    <span>${product.store}</span>
                    <small>${money.format(product.price)}</small>
                  </div>
                  <div class="qty-control">
                    <button type="button" data-cart-dec="${item.id}" title="Diminuir">${icons.minus}</button>
                    <span>${item.qty}</span>
                    <button type="button" data-cart-inc="${item.id}" title="Aumentar">${icons.plus}</button>
                  </div>
                  <button class="remove-item" type="button" data-cart-remove="${item.id}">Remover</button>
                </article>
              `;
            })
            .join("")
        : '<p class="empty-state">Seu carrinho está vazio.</p>';
    }

    const subtotalEl = document.querySelector("[data-cart-subtotal]");
    const deliveryEl = document.querySelector("[data-cart-delivery]");
    const totalEl = document.querySelector("[data-cart-total]");
    const checkout = document.querySelector("[data-checkout]");
    if (subtotalEl) subtotalEl.textContent = money.format(subtotal);
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? "Grátis" : money.format(delivery);
    if (totalEl) totalEl.textContent = money.format(total);
    if (checkout) checkout.disabled = count === 0 || !document.querySelector(".pay-options .is-selected");
  }

  function addToCart(id) {
    const product = productById(id);
    if (!product) return;
    const cart = cartState();
    const item = cart.find((entry) => entry.id === id);
    if (item) item.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart(cart);
    syncCart();
    toast(`${product.name} foi adicionado ao carrinho.`);
  }

  function updateQuantity(id, delta) {
    const cart = cartState()
      .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
      .filter((item) => item.qty > 0);
    saveCart(cart);
    syncCart();
  }

  function openCart() {
    document.body.classList.add("cart-open");
    syncCart();
  }

  function closeCart() {
    document.body.classList.remove("cart-open");
  }

  function initHeader() {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(open));
      });
    }

    const input = document.getElementById("siteSearch");
    const results = document.getElementById("siteSearchResults");
    if (input && results) {
      const showResults = () => {
        const term = input.value.trim().toLowerCase();
        if (!term) {
          results.classList.remove("is-open");
          results.innerHTML = "";
          return;
        }

        const products = (data.products || []).filter((product) =>
          [product.name, product.store, product.category].join(" ").toLowerCase().includes(term)
        );
        const stores = (data.stores || []).filter((store) => store.name.toLowerCase().includes(term));
        const productHtml = products
          .slice(0, 5)
          .map(
            (product) => `
              <a href="ParaVoce.html?q=${encodeURIComponent(term)}">
                <span>${product.name}</span>
                <strong>${money.format(product.price)}</strong>
              </a>
            `
          )
          .join("");
        const storeHtml = stores
          .slice(0, 3)
          .map((store) => `<a href="paginalojas.html?q=${encodeURIComponent(store.name)}"><span>${store.name}</span><strong>${store.time}</strong></a>`)
          .join("");

        results.innerHTML = productHtml || storeHtml ? productHtml + storeHtml : '<p>Nenhum resultado encontrado.</p>';
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

    document.querySelector("[data-search-promo]")?.addEventListener("click", () => {
      window.location.href = "promocoes.html";
    });
  }

  function initCart() {
    document.addEventListener("click", (event) => {
      const add = event.target.closest("[data-add-cart]");
      const open = event.target.closest("[data-cart-open]");
      const close = event.target.closest("[data-cart-close]");
      const inc = event.target.closest("[data-cart-inc]");
      const dec = event.target.closest("[data-cart-dec]");
      const remove = event.target.closest("[data-cart-remove]");
      const pay = event.target.closest("[data-pay]");
      const coupon = event.target.closest("[data-coupon-apply]");
      const checkout = event.target.closest("[data-checkout]");

      if (add) addToCart(add.dataset.addCart);
      if (open) openCart();
      if (close) closeCart();
      if (inc) updateQuantity(inc.dataset.cartInc, 1);
      if (dec) updateQuantity(dec.dataset.cartDec, -1);
      if (remove) updateQuantity(remove.dataset.cartRemove, -999);
      if (pay) {
        document.querySelectorAll("[data-pay]").forEach((button) => button.classList.remove("is-selected"));
        pay.classList.add("is-selected");
        syncCart();
      }
      if (coupon) {
        const input = document.getElementById("couponInput");
        const feedback = document.querySelector("[data-coupon-feedback]");
        const value = (input?.value || "").trim().toUpperCase();
        if (value === "UNICAKE10") {
          document.documentElement.dataset.coupon = value;
          if (feedback) feedback.textContent = "Cupom aplicado: 10% de desconto.";
        } else if (feedback) {
          feedback.textContent = "Cupom inválido. Tente UNICAKE10.";
        }
        syncCart();
      }
      if (checkout) {
        saveCart([]);
        syncCart();
        closeCart();
        toast("Pedido confirmado. Seu número é #" + Math.floor(100000 + Math.random() * 899999));
      }
    });

    window.UniCakeCart = { add: addToCart, open: openCart, close: closeCart, sync: syncCart };
    syncCart();
  }

  function appendSupportMessage(text, type) {
    const messages = document.querySelector("[data-support-messages]");
    if (!messages) return;
    const div = document.createElement("div");
    div.className = `message ${type === "user" ? "message-user" : "message-bot"}`;
    div.innerHTML = `<p>${text}</p><span>Agora</span>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function initSupport() {
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-support-open]");
      const close = event.target.closest("[data-support-close]");
      const quick = event.target.closest("[data-support-message]");
      if (open) {
        document.body.classList.add("support-open");
        open.setAttribute("aria-expanded", "true");
      }
      if (close) {
        document.body.classList.remove("support-open");
        document.querySelector("[data-support-open]")?.setAttribute("aria-expanded", "false");
      }
      if (quick) {
        const key = quick.dataset.supportMessage;
        appendSupportMessage(quick.textContent.trim(), "user");
        appendSupportMessage((data.supportReplies || {})[key] || "Certo, me conte um pouco mais.", "bot");
      }
    });

    document.querySelector("[data-support-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.elements.message;
      const text = input.value.trim();
      if (!text) return;
      appendSupportMessage(text, "user");
      appendSupportMessage("Recebemos sua mensagem. Um atendente continuará o suporte por aqui.", "bot");
      input.value = "";
    });
  }

  function getAccessState() {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.access)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveAccessState(state) {
    localStorage.setItem(storageKeys.access, JSON.stringify(state));
  }

  function applyAccessState(state) {
    const root = document.documentElement;
    root.classList.toggle("access-contrast", !!state.contrast);
    root.classList.toggle("access-links", !!state.links);
    root.classList.toggle("access-line", !!state.line);
    root.classList.toggle("access-motion", !!state.motion);
    root.dataset.fontScale = String(state.fontScale || 0);
  }

  function initAccessibility() {
    let state = getAccessState();
    applyAccessState(state);

    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-access-open]");
      const close = event.target.closest("[data-access-close]");
      const action = event.target.closest("[data-access-action]");

      if (open) {
        document.body.classList.add("access-open");
        open.setAttribute("aria-expanded", "true");
      }
      if (close) {
        document.body.classList.remove("access-open");
        document.querySelector("[data-access-open]")?.setAttribute("aria-expanded", "false");
      }
      if (!action) return;

      const type = action.dataset.accessAction;
      if (type === "font-up") state.fontScale = Math.min(2, (state.fontScale || 0) + 1);
      if (type === "font-down") state.fontScale = Math.max(-1, (state.fontScale || 0) - 1);
      if (type === "contrast") state.contrast = !state.contrast;
      if (type === "links") state.links = !state.links;
      if (type === "line") state.line = !state.line;
      if (type === "motion") state.motion = !state.motion;
      if (type === "reset") state = {};

      applyAccessState(state);
      saveAccessState(state);
    });
  }

  ready(() => {
    renderHeader();
    renderFooter();
    renderSupportWidget();
    renderAccessibility();
    renderCart();
    initHeader();
    initCart();
    initSupport();
    initAccessibility();
  });
})();
