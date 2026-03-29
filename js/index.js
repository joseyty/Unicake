 let cart = [], discount = 0, payMethod = '';
  const DELIVERY = 5;
  const fmt = v => 'R$ ' + v.toFixed(2).replace('.', ',');
 
  function cOpen()  { document.getElementById('cDrawer').classList.add('open'); document.getElementById('cOverlay').classList.add('open'); cRender(); }
  function cClose() { document.getElementById('cDrawer').classList.remove('open'); document.getElementById('cOverlay').classList.remove('open'); }
 
  function cAddItem(name, price) {
    const ex = cart.find(i => i.name === name);
    if (ex) ex.qty++; else cart.push({ name, price, qty: 1 });
    document.getElementById('cartCount').textContent = cart.reduce((a,i) => a + i.qty, 0);
    cToast('🛒 ' + name + ' adicionado!');
    cRender();
  }
 
  function cRender() {
    const itemsEl = document.getElementById('cItems');
    itemsEl.innerHTML = cart.length === 0
      ? '<p style="font-size:.8rem;color:#aaa;padding:8px 0">Seu carrinho está vazio.</p>'
      : cart.map((item, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f0e8df">
            <div><div style="font-size:.85rem;font-weight:600">${item.name}</div><div style="font-size:.75rem;color:var(--brown-mid)">${fmt(item.price)}</div></div>
            <div style="display:flex;align-items:center;gap:8px">
              <button onclick="cQty(${idx},-1)" style="width:26px;height:26px;border-radius:50%;border:1.5px solid #ddd;background:#fff;cursor:pointer;font-size:1rem;line-height:1">−</button>
              <span style="font-weight:600;min-width:18px;text-align:center">${item.qty}</span>
              <button onclick="cQty(${idx},1)"  style="width:26px;height:26px;border-radius:50%;border:1.5px solid #ddd;background:#fff;cursor:pointer;font-size:1rem;line-height:1">+</button>
            </div>
          </div>`).join('');
 
    const sub = cart.reduce((a,i) => a + i.price * i.qty, 0);
    const disc = sub * discount;
    const total = sub > 0 ? sub - disc + DELIVERY : 0;
    document.getElementById('cSubtotal').textContent = fmt(sub);
    document.getElementById('cDelivery').textContent = sub > 0 ? fmt(DELIVERY) : 'R$ 0,00';
    document.getElementById('cTotal').textContent = fmt(total);
    const dr = document.getElementById('cDiscRow');
    if (discount > 0 && sub > 0) { dr.style.display='flex'; document.getElementById('cDiscVal').textContent = '- ' + fmt(disc); } else { dr.style.display='none'; }
    document.getElementById('cFinish').disabled = cart.length === 0 || !payMethod;
  }
 
  function cQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    document.getElementById('cartCount').textContent = cart.reduce((a,i) => a + i.qty, 0);
    cRender();
  }
 
  const COUPONS = { 'UNICAKE10': .10, 'FESTA20': .20 };
  function cApplyCoupon() {
    const code = document.getElementById('cCouponIn').value.trim().toUpperCase();
    const fb = document.getElementById('cFeedback');
    if (COUPONS[code]) { discount = COUPONS[code]; fb.textContent = '✅ Cupom aplicado! ' + (discount*100) + '% de desconto.'; fb.style.color='#27ae60'; }
    else { discount = 0; fb.textContent = '❌ Cupom inválido.'; fb.style.color='#e74c3c'; }
    cRender();
  }
 
  function cSetPay(m) {
    payMethod = m;
    ['pix','card','cash'].forEach(x => document.getElementById('pay-'+x).classList.remove('active'));
    document.getElementById('pay-'+m).classList.add('active');
    const L = { pix:'Pagamento via PIX — você receberá a chave após confirmar.', card:'Pagamento no cartão — débito ou crédito.', cash:'Pagamento em dinheiro — tenha o troco pronto.' };
    document.getElementById('cPayInfo').textContent = L[m];
    cRender();
  }
 
  function cFinishOrder() {
    const code = '#' + Math.floor(100000 + Math.random() * 900000);
    document.getElementById('cCode').textContent = code;
    document.getElementById('cConfirm').classList.add('open');
    cClose();
  }
 
  function cCloseConfirm() {
    document.getElementById('cConfirm').classList.remove('open');
    cart = []; discount = 0; payMethod = '';
    document.getElementById('cartCount').textContent = '0';
    document.getElementById('cCouponIn').value = '';
    document.getElementById('cFeedback').textContent = '';
    document.getElementById('cPayInfo').textContent = 'Selecione uma forma de pagamento acima.';
    ['pix','card','cash'].forEach(x => document.getElementById('pay-'+x).classList.remove('active'));
    cRender();
  }
 
  function cToast(msg) {
    const t = document.getElementById('cToast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2400);
  }