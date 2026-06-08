(function () {
  const U = window.UniCake;
  if (!U) return;

  function cartState() {
    try {
      return JSON.parse(localStorage.getItem(U.storageKeys.cart)) || [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(U.storageKeys.cart, JSON.stringify(cart));
  }

  function cartCount(cart) {
    return cart.reduce((total, item) => total + item.qty, 0);
  }

  function cartSubtotal(cart) {
    return cart.reduce((total, item) => {
      const product = U.productById(item.id);
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
          <button class="icon-button" type="button" data-cart-close title="Fechar carrinho">${U.icons.close}</button>
        </header>
        <div class="cart-body">
          <section>
            <h3>Complete seu pedido</h3>
            <div class="cart-suggestions">
              ${(U.data.products || [])
                .slice(0, 2)
                .map(
                  (product) => `
                    <button class="cart-suggestion" type="button" data-add-cart="${product.id}">
                      <span>${product.name}</span>
                      <strong>${U.money.format(product.price)}</strong>
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
              const product = U.productById(item.id);
              if (!product) return "";
              return `
                <article class="cart-item">
                  <div>
                    <strong>${product.name}</strong>
                    <span>${product.store}</span>
                    <small>${U.money.format(product.price)}</small>
                  </div>
                  <div class="qty-control">
                    <button type="button" data-cart-dec="${item.id}" title="Diminuir">${U.icons.minus}</button>
                    <span>${item.qty}</span>
                    <button type="button" data-cart-inc="${item.id}" title="Aumentar">${U.icons.plus}</button>
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
    if (subtotalEl) subtotalEl.textContent = U.money.format(subtotal);
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? "Grátis" : U.money.format(delivery);
    if (totalEl) totalEl.textContent = U.money.format(total);
    if (checkout) checkout.disabled = count === 0 || !document.querySelector(".pay-options .is-selected");
  }

  function addToCart(id) {
    const product = U.productById(id);
    if (!product) return;
    const cart = cartState();
    const item = cart.find((entry) => entry.id === id);
    if (item) item.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart(cart);
    syncCart();
    U.toast(`${product.name} foi adicionado ao carrinho.`);
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
        U.toast("Pedido confirmado. Seu número é #" + Math.floor(100000 + Math.random() * 899999));
      }
    });

    window.UniCakeCart = { add: addToCart, open: openCart, close: closeCart, sync: syncCart };
    syncCart();
  }

  U.ready(() => {
    renderCart();
    initCart();
  });
})();
