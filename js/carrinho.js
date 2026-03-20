
    const CAKES = [
      
      { id: 1, name: "Bolo de Chocolate",  emoji: "🍫", img: null, price: 30, desc: "Recheio duplo de ganache" },
      { id: 2, name: "Bolo de Morango",    emoji: "🍓", img: null, price: 35, desc: "Com chantilly e morangos frescos" },
      { id: 3, name: "Bolo de Cenoura",    emoji: "🥕", img: null, price: 25, desc: "Cobertura de brigadeiro" },
      { id: 4, name: "Bolo Red Velvet",    emoji: "❤️", img: null, price: 45, desc: "Cream cheese e veludo vermelho" },
      { id: 5, name: "Bolo de Limão",      emoji: "🍋", img: null, price: 28, desc: "Recheio azedo e docinho" },
      { id: 6, name: "Bolo de Coco",       emoji: "🥥", img: null, price: 32, desc: "Com leite de coco e coco ralado" },
    ];

    const COUPONS = {
      'BOLO10':  { type: 'percent', value: 10,  label: '10% de desconto' },
      'BOLO20':  { type: 'percent', value: 20,  label: '20% de desconto' },
      'FRETE':   { type: 'shipping', value: 0,  label: 'Frete grátis' },
    };

    const PAYMENT_INFO = {
      pix:  '⚡ PIX aprovado na hora! Você receberá o QR Code após confirmar o pedido.',
      card: '💳 Aceitamos Visa, Mastercard e Elo — débito ou crédito em até 3x sem juros.',
      cash: '💵 Pague na entrega. Precisa de troco? Anote no campo de observações.',
    };

    const DELIVERY_FEE = 5;

    
    let cart       = [];
    let payment    = '';
    let appliedCoupon = null;

    function renderCakes() {
      const container = document.getElementById('cakes');
      container.innerHTML = CAKES.map(cake => {

       
        const media = cake.img
          ? `<img class="cake-card__img" src="${cake.img}" alt="${cake.name}" loading="lazy" />`
          : `<div class="cake-card__img-placeholder">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                 <rect x="3" y="3" width="18" height="18" rx="2"/>
                 <circle cx="8.5" cy="8.5" r="1.5"/>
                 <path d="m21 15-5-5L5 21"/>
               </svg>
               Adicione uma imagem
             </div>`;

        return `
          <div class="cake-card">
            ${media}
            <div class="cake-card__name">${cake.name}</div>
            <div class="cake-card__desc">${cake.desc}</div>
            <div class="cake-card__price">R$ ${cake.price.toFixed(2).replace('.', ',')}</div>
            <button class="btn-add" onclick="addToCart(${cake.id})">+ Adicionar</button>
          </div>`;
      }).join('');
    }

    
    function renderCart() {
      const container = document.getElementById('cart');

      if (cart.length === 0) {
        container.innerHTML = `
          <div class="cart-empty">
            <div class="cart-empty__icon">🛒</div>
            <p>Seu carrinho está vazio.<br>Adicione um bolinho!</p>
          </div>`;
      } else {
        container.innerHTML = cart.map(item => `
          <div class="cart-item">
            <span class="cart-item__emoji">${item.emoji}</span>
            <div class="cart-item__info">
              <div class="cart-item__name">${item.name}</div>
              <div class="cart-item__unit">R$ ${item.price.toFixed(2).replace('.', ',')} / un.</div>
            </div>
            <div class="controls">
              <button class="controls__btn" onclick="updateQuantity(${item.id}, -1)">−</button>
              <span class="controls__qty">${item.quantity}</span>
              <button class="controls__btn" onclick="updateQuantity(${item.id}, +1)">+</button>
            </div>
            <span class="cart-item__subtotal">
              R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
            </span>
          </div>
        `).join('');
      }

      renderSummary();
      updateFinishBtn();
    }

    
    function renderSummary() {
      const subtotal  = cart.reduce((acc, i) => acc + i.price * i.quantity, 0);
      let   discount  = 0;
      let   delivery  = DELIVERY_FEE;

      if (appliedCoupon) {
        if (appliedCoupon.type === 'percent') {
          discount = subtotal * (appliedCoupon.value / 100);
        } else if (appliedCoupon.type === 'shipping') {
          delivery = 0;
        }
      }

      const total = subtotal - discount + delivery;

  
      document.getElementById('subtotal').textContent =
        `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

      
      const discountRow = document.getElementById('discount-row');
      if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('discount-label').textContent =
          `Cupom (${appliedCoupon.label})`;
        document.getElementById('discount-value').textContent =
          `- R$ ${discount.toFixed(2).replace('.', ',')}`;
      } else if (appliedCoupon?.type === 'shipping') {
        discountRow.style.display = 'flex';
        document.getElementById('discount-label').textContent = 'Frete grátis 🎉';
        document.getElementById('discount-value').textContent = '- R$ 5,00';
      } else {
        discountRow.style.display = 'none';
      }

      
      document.getElementById('delivery-value').textContent =
        delivery === 0 ? 'Grátis 🎉' : `R$ ${delivery.toFixed(2).replace('.', ',')}`;

     
      document.getElementById('total').textContent =
        `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    
    function addToCart(id) {
      const existing = cart.find(i => i.id === id);

      if (existing) {
        existing.quantity++;
        showToast(`+1 ${existing.name} 🎂`);
      } else {
        const cake = CAKES.find(c => c.id === id);
        cart.push({ ...cake, quantity: 1 });
        showToast(`${cake.name} adicionado! 🎂`);
      }

      renderCart();
    }

    function updateQuantity(id, change) {
      cart = cart
        .map(i => i.id === id ? { ...i, quantity: i.quantity + change } : i)
        .filter(i => i.quantity > 0);

      renderCart();
    }

   
    function applyCoupon() {
      const code     = document.getElementById('coupon-input').value.trim().toUpperCase();
      const feedback = document.getElementById('coupon-feedback');

      if (!code) {
        feedback.textContent = '⚠️ Digite um cupom antes de aplicar.';
        feedback.className   = 'coupon-feedback coupon-feedback--error';
        return;
      }

      const coupon = COUPONS[code];

      if (coupon) {
        appliedCoupon = coupon;
        feedback.textContent = `✅ Cupom aplicado: ${coupon.label}!`;
        feedback.className   = 'coupon-feedback coupon-feedback--ok';
        showToast(`Cupom "${code}" aplicado! 🏷️`);
      } else {
        appliedCoupon = null;
        feedback.textContent = '❌ Cupom inválido ou expirado.';
        feedback.className   = 'coupon-feedback coupon-feedback--error';
      }

      renderSummary();
    }

   
    function setPayment(type) {
      payment = type;

      
      ['pix', 'card', 'cash'].forEach(t => {
        document.getElementById(`pay-${t}`).classList.remove('active');
      });

     
      document.getElementById(`pay-${type}`).classList.add('active');

      document.getElementById('payment-info').textContent = PAYMENT_INFO[type];

      updateFinishBtn();
    }

    

    function updateFinishBtn() {
      const btn = document.getElementById('btn-finish');
      btn.disabled = cart.length === 0 || payment === '';
    }

    function finishOrder() {
      if (cart.length === 0 || payment === '') return;

     
      const code = '#' + Math.random().toString(36).substr(2, 6).toUpperCase();
      document.getElementById('order-code').textContent = code;

  
      document.getElementById('order-overlay').classList.add('show');
    }

    function closeOverlay() {
      
      cart          = [];
      payment       = '';
      appliedCoupon = null;

      document.getElementById('order-overlay').classList.remove('show');
      document.getElementById('coupon-input').value      = '';
      document.getElementById('coupon-feedback').textContent = '';
      document.getElementById('payment-info').textContent =
        'Selecione uma forma de pagamento acima.';

      ['pix', 'card', 'cash'].forEach(t => {
        document.getElementById(`pay-${t}`).classList.remove('active');
      });

      renderCart();
    }

    

    let toastTimer = null;

    function showToast(msg) {
      const toast = document.getElementById('toast');
      toast.textContent = msg;
      toast.classList.add('show');

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
    }

    

    renderCakes();
    renderCart();