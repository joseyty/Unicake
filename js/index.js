
function comprarItem() {
    const btn = document.getElementById('comprar');
    if (!btn) return;
    const estoque = 10;
    if (estoque > 0) {
        btn.textContent = 'Item comprado';
        btn.style.color = 'green';
    } else {
        btn.textContent = 'Sem estoque';
        btn.style.color = 'red';
    }
}


const CAKES = [
    { id:1,  name:'Bolo de Chocolate', img:'', price:30   },
    { id:2,  name:'Bolo de Morango',   img:'', price:35   },
    { id:3,  name:'Bolo de Cenoura',   img:'', price:25   },
    { id:4,  name:'Bolo Red Velvet',   img:'', price:45   },
    { id:5,  name:'Bolo de Limão',     img:'', price:28   },
    { id:6,  name:'Bolo de Coco',      img:'', price:32   },
    { id:7,  name:'Surpresa de Uva',   img:'', price:2    },
    { id:8,  name:'Bolo de Abacaxi',   img:'', price:27   },
    { id:9,  name:'Olho de sogra',     img:'', price:3    },
    { id:10, name:'Beijinho',          img:'', price:2.5  },
    { id:11, name:'Brigadeiro',        img:'', price:2    },
];

const COUPONS = {
    BOLO10: { type:'percent',  value:10, label:'10% de desconto' },
    BOLO20: { type:'percent',  value:20, label:'20% de desconto' },
    FRETE:  { type:'shipping', value:0,  label:'Frete grátis'    },
};

const PAY_INFO = {
    pix:  '⚡ PIX aprovado na hora! Você receberá o QR Code após confirmar o pedido.',
    card: '💳 Aceitamos Visa, Mastercard e Elo — débito ou crédito.',
    cash: '💵 Pague na entrega. Informe abaixo se precisar de troco.',
};

const DELIVERY        = 5;
const FREE_SHIP_ABOVE = 80;   // frete grátis acima de R$ 80
const MAX_QTY         = 99;


let cart   = [];
let pay    = '';
let coupon = null;
let changeNeeded = 0; 


function cartSave()  { try { localStorage.setItem('unicake_cart', JSON.stringify({ cart, coupon })); } catch(e){} }
function cartLoad()  {
    try {
        const raw = localStorage.getItem('unicake_cart');
        if (!raw) return;
        const data = JSON.parse(raw);
        cart   = data.cart   || [];
        coupon = data.coupon || null;
        if (coupon && document.getElementById('cCouponIn')) {
            const fb = document.getElementById('cFeedback');
            document.getElementById('cCouponIn').value = '';
            fb.textContent  = `✅ Cupom ativo: ${coupon.label}`;
            fb.className    = 'c-feedback c-feedback--ok';
            renderCouponTag();
        }
    } catch(e) {}
}


document.getElementById('cartBtn').addEventListener('click', cOpen);
function cOpen()  {
    document.getElementById('cDrawer').classList.add('open');
    document.getElementById('cOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}
function cClose() {
    document.getElementById('cDrawer').classList.remove('open');
    document.getElementById('cOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') cClose(); });

function cThumb(img, size) {
    size = size || 60;
    if (img) {
        return '<img src="' + img + '" alt="" ' +
            'style="width:' + size + 'px;height:' + size + 'px;object-fit:cover;border-radius:8px;" ' +
            'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
            '<span class="c-img-fallback" style="display:none;width:' + size + 'px;height:' + size + 'px">🍰</span>';
    }
    return '<span class="c-img-fallback" style="width:' + size + 'px;height:' + size + 'px">🍰</span>';
}


function cRenderCakes() {
    document.getElementById('cCakes').innerHTML = CAKES.map(c => `
        <div class="c-cake">
            <div class="c-cake__thumb">${cThumb(c.img, 60)}</div>
            <div class="c-cake__name">${c.name}</div>
            <div class="c-cake__price">R$ ${c.price.toFixed(2).replace('.',',')}</div>
            <button class="c-cake__btn" onclick="cAdd(${c.id})">+ Adicionar</button>
        </div>`).join('');
}


function cRenderCart() {
    const el = document.getElementById('cItems');

    if (cart.length === 0) {
        el.innerHTML = `
            <div class="c-empty">
                <div class="c-empty__icon">🛒</div>
                <p>Seu carrinho está vazio.<br>Adicione um bolinho!</p>
            </div>`;
    } else {
        el.innerHTML = `
            <div class="c-clear-row">
                <span class="c-items-count">${cart.reduce((a,i)=>a+i.quantity,0)} ${cart.reduce((a,i)=>a+i.quantity,0)===1?'item':'itens'}</span>
                <button class="c-clear-btn" onclick="cClearCart()">🗑️ Limpar tudo</button>
            </div>
            ${cart.map(i => `
            <div class="c-item" id="c-item-${i.id}">
                <span class="c-item__emoji">${cThumb(i.img, 38)}</span>
                <div class="c-item__info">
                    <div class="c-item__name">${i.name}</div>
                    <div class="c-item__unit">R$ ${i.price.toFixed(2).replace('.',',')} / un.</div>
                </div>
                <div class="c-ctrl">
                    <button class="c-ctrl__btn" onclick="cQty(${i.id},-1)" aria-label="Diminuir">−</button>
                    <span class="c-ctrl__qty">${i.quantity}</span>
                    <button class="c-ctrl__btn" onclick="cQty(${i.id},+1)" aria-label="Aumentar" ${i.quantity>=MAX_QTY?'disabled':''}>+</button>
                </div>
                <span class="c-item__total">R$ ${(i.price*i.quantity).toFixed(2).replace('.',',')}</span>
                <button class="c-item__remove" onclick="cRemoveItem(${i.id})" aria-label="Remover ${i.name}" title="Remover item">✕</button>
            </div>`).join('')}`;
    }

    cRenderSummary();
    cUpdateBtn();

    const count = cart.reduce((a,i) => a+i.quantity, 0);
    const badge = document.getElementById('cartCount');
    badge.textContent = count;
    badge.classList.remove('c-badge-pop');
    void badge.offsetWidth; 
    if (count > 0) badge.classList.add('c-badge-pop');

    cartSave();
}

function cRenderSummary() {
    const sub = cart.reduce((a,i) => a+i.price*i.quantity, 0);
    let disc = 0;

  
    let del = (coupon?.type === 'shipping' || sub >= FREE_SHIP_ABOVE) ? 0 : DELIVERY;

    if (coupon?.type === 'percent') disc = sub * (coupon.value / 100);

    document.getElementById('cSubtotal').textContent = fmt(sub);

  
    const dr = document.getElementById('cDiscRow');
    if (disc > 0) {
        dr.style.display = 'flex';
        document.getElementById('cDiscLabel').textContent = `Cupom (${coupon.label})`;
        document.getElementById('cDiscVal').textContent   = `- ${fmt(disc)}`;
    } else if (coupon?.type === 'shipping') {
        dr.style.display = 'flex';
        document.getElementById('cDiscLabel').textContent = 'Frete grátis 🎉';
        document.getElementById('cDiscVal').textContent   = '- R$ 5,00';
    } else {
        dr.style.display = 'none';
    }

 
    const deliveryEl = document.getElementById('cDelivery');
    if (del === 0 && !coupon) {
        deliveryEl.innerHTML = 'Grátis 🎉 <small style="font-size:.65rem;color:var(--c-green)">(acima de R$80)</small>';
    } else {
        deliveryEl.textContent = del === 0 ? 'Grátis 🎉' : fmt(del);
    }

    document.getElementById('cTotal').textContent = fmt(sub - disc + del);

    
    renderFreeShipBar(sub);
}


function renderFreeShipBar(sub) {
    const existing = document.getElementById('cFreeShipBar');
    if (coupon?.type === 'shipping' || sub >= FREE_SHIP_ABOVE) {
        if (existing) existing.remove();
        return;
    }
    const remaining = FREE_SHIP_ABOVE - sub;
    const pct = Math.min((sub / FREE_SHIP_ABOVE) * 100, 100);
    const html = `
        <div id="cFreeShipBar" class="c-freeship">
            <div class="c-freeship__msg">
                🚚 Faltam <strong>R$ ${remaining.toFixed(2).replace('.',',')}</strong> para frete grátis!
            </div>
            <div class="c-freeship__track">
                <div class="c-freeship__fill" style="width:${pct}%"></div>
            </div>
        </div>`;
    if (existing) {
        existing.outerHTML = html;
    } else {
        document.getElementById('cItems').insertAdjacentHTML('afterend', html);
    }
}

const fmt = v => `R$ ${v.toFixed(2).replace('.',',')}`;


function cAdd(id) {
    const ex = cart.find(i => i.id === id);
    if (ex) {
        if (ex.quantity >= MAX_QTY) { cToast(`Limite máximo de ${MAX_QTY} unidades ⚠️`); return; }
        ex.quantity++;
        cToast(`+1 ${ex.name} 🎂`);
    } else {
        const c = CAKES.find(c => c.id === id);
        cart.push({ ...c, quantity: 1 });
        cToast(`${c.name} adicionado! 🎂`);
    }
    cRenderCart();
}

function cQty(id, d) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    if (d > 0 && item.quantity >= MAX_QTY) { cToast(`Limite máximo de ${MAX_QTY} unidades ⚠️`); return; }
    const newQty = item.quantity + d;
    if (newQty <= 0) {
        cRemoveItem(id);
    } else {
        item.quantity = newQty;
        cRenderCart();
    }
}

function cRemoveItem(id) {
    const item = cart.find(i => i.id === id);
    const name = item ? item.name : '';
    
    const el = document.getElementById(`c-item-${id}`);
    if (el) {
        el.classList.add('c-item--removing');
        setTimeout(() => {
            cart = cart.filter(i => i.id !== id);
            cRenderCart();
            if (name) cToast(`${name} removido 🗑️`);
        }, 280);
    } else {
        cart = cart.filter(i => i.id !== id);
        cRenderCart();
    }
}

function cClearCart() {
    if (!cart.length) return;
    if (!confirm('Deseja remover todos os itens do carrinho?')) return;
    cart = [];
    coupon = null;
    const fb = document.getElementById('cFeedback');
    fb.textContent = '';
    document.getElementById('cCouponIn').value = '';
    const tag = document.getElementById('cCouponTag');
    if (tag) tag.remove();
    cRenderCart();
    cToast('Carrinho limpo 🗑️');
}


function cApplyCoupon() {
    const code = document.getElementById('cCouponIn').value.trim().toUpperCase();
    const fb   = document.getElementById('cFeedback');
    if (!code) {
        fb.textContent = '⚠️ Digite um cupom antes de aplicar.';
        fb.className   = 'c-feedback c-feedback--err';
        return;
    }
    const c = COUPONS[code];
    if (c) {
        coupon = { ...c, code };
        fb.textContent = `✅ Cupom aplicado: ${c.label}!`;
        fb.className   = 'c-feedback c-feedback--ok';
        cToast(`Cupom "${code}" aplicado! 🏷️`);
        renderCouponTag();
    } else {
        coupon = null;
        fb.textContent = '❌ Cupom inválido ou expirado.';
        fb.className   = 'c-feedback c-feedback--err';
        const tag = document.getElementById('cCouponTag');
        if (tag) tag.remove();
    }
    cRenderCart();
}


function renderCouponTag() {
    const existing = document.getElementById('cCouponTag');
    if (existing) existing.remove();
    if (!coupon) return;
    const fb = document.getElementById('cFeedback');
    fb.insertAdjacentHTML('afterend', `
        <div id="cCouponTag" class="c-coupon-tag">
            <span>🏷️ ${coupon.code} — ${coupon.label}</span>
            <button class="c-coupon-tag__rm" onclick="cRemoveCoupon()" title="Remover cupom">✕</button>
        </div>`);
}

function cRemoveCoupon() {
    coupon = null;
    document.getElementById('cCouponIn').value = '';
    const fb = document.getElementById('cFeedback');
    fb.textContent = '';
    const tag = document.getElementById('cCouponTag');
    if (tag) tag.remove();
    cToast('Cupom removido 🏷️');
    cRenderCart();
}


function cSetPay(type) {
    pay = type;
    ['pix','card','cash'].forEach(t => document.getElementById(`pay-${t}`).classList.remove('active'));
    document.getElementById(`pay-${type}`).classList.add('active');
    document.getElementById('cPayInfo').textContent = PAY_INFO[type];

    
    const extras = document.getElementById('cPayExtras');
    if (extras) extras.remove();

    const infoEl = document.getElementById('cPayInfo');

    if (type === 'cash') {
       
        infoEl.insertAdjacentHTML('afterend', `
            <div id="cPayExtras" class="c-pay-extras">
                <label class="c-pay-extras__label">💰 Precisa de troco para quanto?</label>
                <div class="c-coupon-row" style="margin-top:6px">
                    <input id="cChangeInput" class="c-coupon-in" type="number" min="0" step="0.01"
                        placeholder="Ex: 50,00 (deixe vazio se não precisar)"
                        oninput="cUpdateChange(this.value)" />
                </div>
                <p id="cChangeMsg" class="c-feedback" style="margin-top:4px"></p>
            </div>`);
    }

    if (type === 'card') {
        
        infoEl.insertAdjacentHTML('afterend', `
            <div id="cPayExtras" class="c-pay-extras">
                <label class="c-pay-extras__label">💳 Número de parcelas</label>
                <select id="cInstallments" class="c-installments" onchange="cUpdateInstallments(this.value)">
                    <option value="1">À vista (débito ou crédito)</option>
                    <option value="2">2x sem juros</option>
                    <option value="3">3x sem juros</option>
                </select>
            </div>`);
    }

    cUpdateBtn();
}

function cUpdateChange(val) {
    const msg = document.getElementById('cChangeMsg');
    const total = parseFloat(document.getElementById('cTotal').textContent.replace('R$ ','').replace(',','.'));
    if (!val || parseFloat(val) === 0) {
        msg.textContent = '';
        return;
    }
    const troco = parseFloat(val) - total;
    if (parseFloat(val) < total) {
        msg.textContent = `⚠️ Valor insuficiente. O total é ${fmt(total)}.`;
        msg.className = 'c-feedback c-feedback--err';
    } else {
        msg.textContent = `✅ Troco: ${fmt(troco)}`;
        msg.className = 'c-feedback c-feedback--ok';
    }
}

function cUpdateInstallments(val) {
    const total = parseFloat(document.getElementById('cTotal').textContent.replace('R$ ','').replace(',','.'));
    const parcela = total / parseInt(val);
    const msg = document.getElementById('cInstallments');
    const info = document.getElementById('cPayInfo');
    if (val === '1') {
        info.textContent = PAY_INFO.card;
    } else {
        info.textContent = `💳 ${val}x de ${fmt(parcela)} sem juros.`;
    }
}

function cUpdateBtn() {
    document.getElementById('cFinish').disabled = cart.length === 0 || pay === '';
}

function cFinishOrder() {
    if (!cart.length || !pay) return;

    
    if (pay === 'cash') {
        const changeInput = document.getElementById('cChangeInput');
        if (changeInput && changeInput.value) {
            const total    = parseFloat(document.getElementById('cTotal').textContent.replace('R$ ','').replace(',','.'));
            const provided = parseFloat(changeInput.value);
            if (provided < total) {
                cToast('⚠️ Valor para troco insuficiente!');
                return;
            }
        }
    }

    const code = '#' + Math.random().toString(36).substr(2,6).toUpperCase();
    document.getElementById('cCode').textContent = code;
    cClose();
    document.getElementById('cConfirm').classList.add('show');

    
    try { localStorage.removeItem('unicake_cart'); } catch(e) {}
}

function cCloseConfirm() {
    cart = []; pay = ''; coupon = null;
    document.getElementById('cConfirm').classList.remove('show');
    document.getElementById('cCouponIn').value = '';
    document.getElementById('cFeedback').textContent = '';
    document.getElementById('cPayInfo').textContent = 'Selecione uma forma de pagamento acima.';
    ['pix','card','cash'].forEach(t => document.getElementById(`pay-${t}`).classList.remove('active'));
    const tag    = document.getElementById('cCouponTag');
    const extras = document.getElementById('cPayExtras');
    const bar    = document.getElementById('cFreeShipBar');
    if (tag)    tag.remove();
    if (extras) extras.remove();
    if (bar)    bar.remove();
    cRenderCart();
}


let _tt;
function cToast(msg) {
    const t = document.getElementById('cToast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(_tt);
    _tt = setTimeout(() => t.classList.remove('show'), 2500);
}


cartLoad();
cRenderCakes();
cRenderCart();


const PRODUTOS = [
  { id:101, nome:'Bolo de Chocolate',          cat:'bolos',    preco:45,  av:4.8, loja:'Doce Encanto',        emoji:'🍰' },
  { id:102, nome:'Bolo de Morango',             cat:'bolos',    preco:48,  av:4.9, loja:'Cake & Love',         emoji:'🍰' },
  { id:103, nome:'Bolo de Cenoura',             cat:'bolos',    preco:40,  av:4.7, loja:'Confeitaria Bella',   emoji:'🍰' },
  { id:104, nome:'Bolo Red Velvet',             cat:'bolos',    preco:52,  av:5.0, loja:'Sweet Dreams',        emoji:'🍰' },
  { id:105, nome:'Bolo de Limão',               cat:'bolos',    preco:42,  av:4.6, loja:'Padaria Central',     emoji:'🍰' },
  { id:106, nome:'Bolo de Coco',                cat:'bolos',    preco:46,  av:4.8, loja:'Ateliê do Bolo',      emoji:'🍰' },
  { id:107, nome:'Bolo Floresta Negra',         cat:'bolos',    preco:55,  av:4.9, loja:'Confeitaria da Maria', emoji:'🍰' },
  { id:108, nome:'Bolo de Abacaxi',             cat:'bolos',    preco:38,  av:4.5, loja:'Padaria Central',     emoji:'🍰' },
  { id:109, nome:'Cheesecake de Frutas',        cat:'tortas',   preco:60,  av:5.0, loja:'Sweet Bakery',        emoji:'🥧' },
  { id:110, nome:'Cupcake de Chocolate',        cat:'cupcakes', preco:8,   av:4.7, loja:'Cake & Love',         emoji:'🧁' },
  { id:111, nome:'Cupcake de Baunilha',         cat:'cupcakes', preco:7.5, av:4.6, loja:'Doce Encanto',        emoji:'🧁' },
  { id:112, nome:'Cupcake de Morango',          cat:'cupcakes', preco:8.5, av:4.9, loja:'Sweet Dreams',        emoji:'🧁' },
  { id:113, nome:'Cupcake Red Velvet',          cat:'cupcakes', preco:9,   av:5.0, loja:'Confeitaria Bella',   emoji:'🧁' },
  { id:114, nome:'Torta de Maçã',               cat:'tortas',   preco:55,  av:4.8, loja:'Padaria Central',     emoji:'🥧' },
  { id:115, nome:'Torta de Limão',              cat:'tortas',   preco:50,  av:4.7, loja:'Ateliê do Bolo',      emoji:'🥧' },
  { id:116, nome:'Torta Chocolate e Banana',    cat:'tortas',   preco:60,  av:4.9, loja:'Doce Encanto',        emoji:'🥧' },
  { id:117, nome:'Brigadeiro Gourmet',          cat:'doces',    preco:3.5, av:4.8, loja:'Confeitaria da Maria', emoji:'🍫' },
  { id:118, nome:'Beijinho de Coco',            cat:'doces',    preco:2.5, av:4.6, loja:'Confeitaria Bella',   emoji:'🍬' },
  { id:119, nome:'Olho de Sogra',               cat:'doces',    preco:4,   av:4.9, loja:'Doce Encanto',        emoji:'🍬' },
  { id:120, nome:'Trufa de Chocolate',          cat:'doces',    preco:5.5, av:5.0, loja:'Sweet Dreams',        emoji:'🍫' },
  { id:121, nome:'Surpresa de Uva',             cat:'doces',    preco:3,   av:4.5, loja:'Confeitaria da Maria', emoji:'🍇' },
  { id:122, nome:'Cookie de Chocolate',         cat:'cookies',  preco:6,   av:4.7, loja:'Cake & Love',         emoji:'🍪' },
  { id:123, nome:'Brownie',                     cat:'cookies',  preco:7.5, av:4.8, loja:'Ateliê do Bolo',      emoji:'🍫' },
  { id:124, nome:'Cookie de Aveia',             cat:'cookies',  preco:5.5, av:4.6, loja:'Padaria Central',     emoji:'🍪' },
  { id:125, nome:'Cookies Amanteigados',        cat:'cookies',  preco:25,  av:4.9, loja:'Casa dos Cookies',    emoji:'🍪' },
  { id:126, nome:'Kit Festa Infantil',          cat:'kits',     preco:85,  av:4.9, loja:'Sweet Dreams',        emoji:'🎉' },
  { id:127, nome:'Kit Festa (20 cookies)',      cat:'kits',     preco:95,  av:4.8, loja:'Doce Encanto',        emoji:'🎉' },
  { id:128, nome:'Kit Festa Completo',          cat:'kits',     preco:120, av:5.0, loja:'Confeitaria Bella',   emoji:'🎉' },
  { id:129, nome:'Kit Casamento',               cat:'kits',     preco:199, av:5.0, loja:'Ateliê do Bolo',      emoji:'💒' },
  { id:130, nome:'Macarons Coloridos',          cat:'doces',    preco:28,  av:5.0, loja:'Doce Atelier',        emoji:'🍬' },
  { id:131, nome:'Pão de Mel Recheado',         cat:'doces',    preco:18,  av:4.7, loja:'Delícias da Vó',      emoji:'🍯' },
];


const searchInput       = document.getElementById('searchInput');
const searchSuggestions = document.getElementById('searchSuggestions');

if (searchInput && searchSuggestions) {

    searchInput.addEventListener('input', function() {
        const q = this.value.trim().toLowerCase();
        filterPanel.classList.remove('show');
        filterToggle.classList.remove('active');

        const hasFilters = activeFilters.cats.length > 0 || activeFilters.starMin > 0 || activeFilters.priceMax < 200;

        if (q.length === 0 && !hasFilters) {
            searchSuggestions.classList.remove('show');
            searchSuggestions.innerHTML = '';
            return;
        }

        let results;
        if (q.length === 0) {
            results = [...PRODUTOS];
        } else {
            results = PRODUTOS.filter(p =>
                p.nome.toLowerCase().includes(q) ||
                p.loja.toLowerCase().includes(q) ||
                p.cat.toLowerCase().includes(q)
            );
        }

        const allFiltered = applyFilters([...results]);
        const shown = allFiltered.slice(0, 8);

        if (shown.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="suggestion-item suggestion-item--empty">
                    <span class="suggestion-emoji">🔍</span>
                    <span class="suggestion-info"><span class="suggestion-name">Nenhum produto encontrado</span></span>
                </div>`;
            searchSuggestions.classList.add('show');
            return;
        }

        let html = '<div class="suggestion-header">Produtos</div>';
        html += shown.map(p => {
            const highlighted = q.length > 0 ? highlightMatch(p.nome, q) : p.nome;
            return `
            <div class="suggestion-item" onclick="addFromSearch(${p.id})">
                <span class="suggestion-emoji">${p.emoji}</span>
                <div class="suggestion-info">
                    <span class="suggestion-name">${highlighted}</span>
                    <span class="suggestion-loja">${p.loja} · ★ ${p.av.toFixed(1)}</span>
                </div>
                <span class="suggestion-price">R$ ${p.preco.toFixed(2).replace('.',',')}</span>
            </div>`;
        }).join('');

        if (allFiltered.length > 8) {
            html += `<div class="suggestion-footer">📋 Mostrando 8 de ${allFiltered.length} resultados</div>`;
        }

        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('show');
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchContainer')) {
            searchSuggestions.classList.remove('show');
        }
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { searchSuggestions.classList.remove('show'); this.blur(); }
        if (e.key === 'Enter' && this.value.trim()) this.dispatchEvent(new Event('input'));
    });

    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) this.dispatchEvent(new Event('input'));
    });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
}


function addFromSearch(prodId) {
    const prod = PRODUTOS.find(p => p.id === prodId);
    if (!prod) return;

    const cakeMatch = CAKES.find(c => c.name.toLowerCase() === prod.nome.toLowerCase());
    if (cakeMatch) {
        cAdd(cakeMatch.id);
    } else {
        const newId = CAKES.length > 0 ? Math.max(...CAKES.map(c => c.id)) + 1 : 1;
        CAKES.push({ id: newId, name: prod.nome, img: '', price: prod.preco });
        cAdd(newId);
        cRenderCakes();
    }

    searchInput.value = '';
    searchSuggestions.classList.remove('show');
    cOpen();
}

// Verificar se usuário está logado e atualizar UI
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    const btnStack = document.querySelector('.btn-stack');
    if (!btnStack) return;

    if (token && user) {
        try {
            const userData = JSON.parse(user);
            btnStack.innerHTML = `
                <span>Olá, ${userData.nome || 'Usuário'}</span>
                <button onclick="logout()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 0.9em;">Sair</button>
            `;
        } catch (e) {
            console.error('Erro ao parsear dados do usuário:', e);
        }
    } else {
        btnStack.innerHTML = '<a href="Entrar.html">Entrar</a>';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkLoginStatus();
}

// Chamar ao carregar a página
checkLoginStatus();


const filterToggle   = document.getElementById('filterToggle');
const filterPanel    = document.getElementById('filterPanel');
const filterBadge    = document.getElementById('filterBadge');
const filterPrice    = document.getElementById('filterPrice');
const filterPriceVal = document.getElementById('filterPriceVal');
const filterClear    = document.getElementById('filterClear');

let activeFilters = { cats: [], priceMax: 200, starMin: 0, sort: 'relevancia' };

if (filterToggle) {
    filterToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        searchSuggestions.classList.remove('show');
        filterPanel.classList.toggle('show');
        filterToggle.classList.toggle('active', filterPanel.classList.contains('show'));
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchContainer')) {
            filterPanel.classList.remove('show');
            filterToggle.classList.remove('active');
        }
    });

    document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            activeFilters.cats = Array.from(document.querySelectorAll('.filter-chip[data-cat].active')).map(c => c.dataset.cat);
            updateFilterBadge(); triggerSearch();
        });
    });

    document.querySelectorAll('.filter-chip--star').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            const wasActive = this.classList.contains('active');
            document.querySelectorAll('.filter-chip--star').forEach(c => c.classList.remove('active'));
            if (!wasActive) { this.classList.add('active'); activeFilters.starMin = parseFloat(this.dataset.star); }
            else { activeFilters.starMin = 0; }
            updateFilterBadge(); triggerSearch();
        });
    });

    document.querySelectorAll('.filter-chip--sort').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.filter-chip--sort').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            activeFilters.sort = this.dataset.sort;
            triggerSearch();
        });
    });

    filterPrice.addEventListener('input', function() {
        activeFilters.priceMax = parseInt(this.value);
        filterPriceVal.textContent = `R$ ${this.value}`;
        updateFilterBadge(); triggerSearch();
    });

    filterClear.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.filter-chip.active').forEach(c => c.classList.remove('active'));
        document.querySelector('.filter-chip--sort[data-sort="relevancia"]').classList.add('active');
        filterPrice.value = 200;
        filterPriceVal.textContent = 'R$ 200';
        activeFilters = { cats: [], priceMax: 200, starMin: 0, sort: 'relevancia' };
        updateFilterBadge(); triggerSearch();
        cToast('Filtros limpos ✨');
    });
}

function updateFilterBadge() {
    let count = activeFilters.cats.length;
    if (activeFilters.starMin > 0) count++;
    if (activeFilters.priceMax < 200) count++;
    if (count > 0) {
        filterBadge.textContent = count;
        filterBadge.style.display = 'flex';
    } else {
        filterBadge.style.display = 'none';
    }
}

function triggerSearch() { searchInput.dispatchEvent(new Event('input')); }

function applyFilters(results) {
    let filtered = results;
    if (activeFilters.cats.length > 0)  filtered = filtered.filter(p => activeFilters.cats.includes(p.cat));
    if (activeFilters.priceMax < 200)   filtered = filtered.filter(p => p.preco <= activeFilters.priceMax);
    if (activeFilters.starMin > 0)      filtered = filtered.filter(p => p.av >= activeFilters.starMin);
    if (activeFilters.sort === 'menor')     filtered.sort((a,b) => a.preco - b.preco);
    else if (activeFilters.sort === 'maior')    filtered.sort((a,b) => b.preco - a.preco);
    else if (activeFilters.sort === 'avaliacao') filtered.sort((a,b) => b.av - a.av);
    return filtered;
}


(function(){
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const siblings = Array.from(el.parentElement.querySelectorAll('[data-reveal]'));
                const idx = siblings.indexOf(el);
                setTimeout(() => el.classList.add('visible'), idx * 180);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    items.forEach(item => obs.observe(item));
})();