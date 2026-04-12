function comprarItem(){

    let estoque= 10;
if(estoque>0){


 let comprado= "Item comprado";
 document.getElementById("comprar").textContent = comprado;
comprado.style.color = "green";   
} else if (estoque <= 0){

    let semEstoque= "Sem estoque";
    document.getElementById("comprar").textContent = semEstoque;
    semEstoque.style.color = "red";


}

}

const CAKES = [
    { id:1, name:'Bolo de Chocolate', img:'', price:30 },
    { id:2, name:'Bolo de Morango',   img:'', price:35 },
    { id:3, name:'Bolo de Cenoura',   img:'', price:25 },
    { id:4, name:'Bolo Red Velvet',   img:'', price:45 },
    { id:5, name:'Bolo de Limão',     img:'', price:28 },
    { id:6, name:'Bolo de Coco',      img:'', price:32 },
    { id:7, name:'Surpresa de Uva',  img:'', price:2 },
    { id:8, name:'Bolo de Abacaxi',   img:'', price:27 },
    { id:9, name:'Olho de sogra',     img:'', price:3 },
    { id:10,name:'Beijinho',  img:'', price:2.5 },
    { id:11,name:'Brigadeiro',     img:'', price: 2 },
    
];
    const COUPONS = {
        BOLO10:{ type:'percent',  value:10, label:'10% de desconto' },
        BOLO20:{ type:'percent',  value:20, label:'20% de desconto' },
        FRETE: { type:'shipping', value:0,  label:'Frete grátis' },
    };
    const PAY_INFO = {
        pix:  '⚡ PIX aprovado na hora! Você receberá o QR Code após confirmar o pedido.',
        card: '💳 Aceitamos Visa, Mastercard e Elo — débito ou crédito em até 3x sem juros.',
        cash: '💵 Pague na entrega. Precisa de troco? Anote no campo de observações.',
    };
    const DELIVERY = 5;
    let cart = [], pay = '', coupon = null;
 
    
    
    document.getElementById('cartBtn').addEventListener('click', cOpen);
    function cOpen()  { document.getElementById('cDrawer').classList.add('open'); document.getElementById('cOverlay').classList.add('open'); document.body.style.overflow='hidden'; }
    function cClose() { document.getElementById('cDrawer').classList.remove('open'); document.getElementById('cOverlay').classList.remove('open'); document.body.style.overflow=''; }
    document.addEventListener('keydown', e => { if(e.key==='Escape') cClose(); });
 
    
    
    function cRenderCakes() {
        document.getElementById('cCakes').innerHTML = CAKES.map(c => `
            <div class="c-cake">
                <div class="c-cake__thumb">
                    <img src="${c.img}" alt="${c.name}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;" onerror="this.src='img/bolo-default.jpg'">
                </div>
                <div class="c-cake__name">${c.name}</div>
                <div class="c-cake__price">R$ ${c.price.toFixed(2).replace('.',',')}</div>
                <button class="c-cake__btn" onclick="cAdd(${c.id})">+ Adicionar</button>
            </div>`).join('');
    }
 

    
    function cRenderCart() {
        const el = document.getElementById('cItems');
        el.innerHTML = cart.length === 0
            ? `<div class="c-empty"><div class="c-empty__icon">🛒</div><p>Seu carrinho está vazio.<br>Adicione um bolinho!</p></div>`
            : cart.map(i => `
                <div class="c-item">
                    <span class="c-item__emoji">
                        <img src="${i.img}" alt="${i.name}" style="width:38px;height:38px;object-fit:cover;border-radius:8px;" onerror="this.src='img/bolo-default.jpg'">
                    </span>
                    <div class="c-item__info">
                        <div class="c-item__name">${i.name}</div>
                        <div class="c-item__unit">R$ ${i.price.toFixed(2).replace('.',',')} / un.</div>
                    </div>
                    <div class="c-ctrl">
                        <button class="c-ctrl__btn" onclick="cQty(${i.id},-1)">−</button>
                        <span class="c-ctrl__qty">${i.quantity}</span>
                        <button class="c-ctrl__btn" onclick="cQty(${i.id},+1)">+</button>
                    </div>
                    <span class="c-item__total">R$ ${(i.price*i.quantity).toFixed(2).replace('.',',')}</span>
                </div>`).join('');
        cRenderSummary();
        cUpdateBtn();
        document.getElementById('cartCount').textContent = cart.reduce((a,i)=>a+i.quantity,0);
    }
 
    
    
    function cRenderSummary() {
        const sub = cart.reduce((a,i)=>a+i.price*i.quantity, 0);
        let disc = 0, del = DELIVERY;
        if(coupon) { if(coupon.type==='percent') disc=sub*(coupon.value/100); else del=0; }
        document.getElementById('cSubtotal').textContent = fmt(sub);
        const dr = document.getElementById('cDiscRow');
        if(disc>0){ dr.style.display='flex'; document.getElementById('cDiscLabel').textContent=`Cupom (${coupon.label})`; document.getElementById('cDiscVal').textContent=`- ${fmt(disc)}`; }
        else if(coupon?.type==='shipping'){ dr.style.display='flex'; document.getElementById('cDiscLabel').textContent='Frete grátis 🎉'; document.getElementById('cDiscVal').textContent='- R$ 5,00'; }
        else dr.style.display='none';
        document.getElementById('cDelivery').textContent = del===0?'Grátis 🎉':fmt(del);
        document.getElementById('cTotal').textContent = fmt(sub-disc+del);
    }
    const fmt = v => `R$ ${v.toFixed(2).replace('.',',')}`;
 
    
    
    function cAdd(id) {
        const ex = cart.find(i=>i.id===id);
        if(ex){ ex.quantity++; cToast(`+1 ${ex.name} 🎂`); }
        else { const c=CAKES.find(c=>c.id===id); cart.push({...c,quantity:1}); cToast(`${c.name} adicionado! 🎂`); }
        cRenderCart();
    }
    function cQty(id,d) { cart=cart.map(i=>i.id===id?{...i,quantity:i.quantity+d}:i).filter(i=>i.quantity>0); cRenderCart(); }
 
    function cApplyCoupon() {
        const code=document.getElementById('cCouponIn').value.trim().toUpperCase();
        const fb=document.getElementById('cFeedback');
        if(!code){ fb.textContent='⚠️ Digite um cupom antes de aplicar.'; fb.className='c-feedback c-feedback--err'; return; }
        const c=COUPONS[code];
        if(c){ coupon=c; fb.textContent=`✅ Cupom aplicado: ${c.label}!`; fb.className='c-feedback c-feedback--ok'; cToast(`Cupom "${code}" aplicado! 🏷️`); }
        else  { coupon=null; fb.textContent='❌ Cupom inválido ou expirado.'; fb.className='c-feedback c-feedback--err'; }
        cRenderSummary();
    }
 
    function cSetPay(type) {
        pay=type;
        ['pix','card','cash'].forEach(t=>document.getElementById(`pay-${t}`).classList.remove('active'));
        document.getElementById(`pay-${type}`).classList.add('active');
        document.getElementById('cPayInfo').textContent=PAY_INFO[type];
        cUpdateBtn();
    }
    function cUpdateBtn() { document.getElementById('cFinish').disabled = cart.length===0||pay===''; }
 
    function cFinishOrder() {
        if(!cart.length||!pay) return;
        document.getElementById('cCode').textContent='#'+Math.random().toString(36).substr(2,6).toUpperCase();
        cClose();
        document.getElementById('cConfirm').classList.add('show');
    }
    function cCloseConfirm() {
        cart=[];pay='';coupon=null;
        document.getElementById('cConfirm').classList.remove('show');
        document.getElementById('cCouponIn').value='';
        document.getElementById('cFeedback').textContent='';
        document.getElementById('cPayInfo').textContent='Selecione uma forma de pagamento acima.';
        ['pix','card','cash'].forEach(t=>document.getElementById(`pay-${t}`).classList.remove('active'));
        cRenderCart();
    }
 
    let _tt;
    function cToast(msg){ const t=document.getElementById('cToast'); t.textContent=msg; t.classList.add('show'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('show'),2500); }
 
    
    cRenderCakes();
    cRenderCart();

/* ═══ PRODUTOS (catálogo completo para busca) ═══ */
const PRODUTOS = [
  { id:101, nome:'Bolo de Chocolate',          cat:'bolos',    preco:45, av:4.8, loja:'Doce Encanto',       emoji:'🍰' },
  { id:102, nome:'Bolo de Morango',             cat:'bolos',    preco:48, av:4.9, loja:'Cake & Love',        emoji:'🍰' },
  { id:103, nome:'Bolo de Cenoura',             cat:'bolos',    preco:40, av:4.7, loja:'Confeitaria Bella',  emoji:'🍰' },
  { id:104, nome:'Bolo Red Velvet',             cat:'bolos',    preco:52, av:5.0, loja:'Sweet Dreams',       emoji:'🍰' },
  { id:105, nome:'Bolo de Limão',               cat:'bolos',    preco:42, av:4.6, loja:'Padaria Central',    emoji:'🍰' },
  { id:106, nome:'Bolo de Coco',                cat:'bolos',    preco:46, av:4.8, loja:'Ateliê do Bolo',     emoji:'🍰' },
  { id:107, nome:'Bolo Floresta Negra',         cat:'bolos',    preco:55, av:4.9, loja:'Confeitaria da Maria',emoji:'🍰' },
  { id:108, nome:'Bolo de Abacaxi',             cat:'bolos',    preco:38, av:4.5, loja:'Padaria Central',    emoji:'🍰' },
  { id:109, nome:'Cheesecake de Frutas',        cat:'tortas',   preco:60, av:5.0, loja:'Sweet Bakery',       emoji:'🥧' },
  { id:110, nome:'Cupcake de Chocolate',        cat:'cupcakes', preco:8,  av:4.7, loja:'Cake & Love',        emoji:'🧁' },
  { id:111, nome:'Cupcake de Baunilha',         cat:'cupcakes', preco:7.5,av:4.6, loja:'Doce Encanto',       emoji:'🧁' },
  { id:112, nome:'Cupcake de Morango',          cat:'cupcakes', preco:8.5,av:4.9, loja:'Sweet Dreams',       emoji:'🧁' },
  { id:113, nome:'Cupcake Red Velvet',          cat:'cupcakes', preco:9,  av:5.0, loja:'Confeitaria Bella',  emoji:'🧁' },
  { id:114, nome:'Torta de Maçã',              cat:'tortas',   preco:55, av:4.8, loja:'Padaria Central',    emoji:'🥧' },
  { id:115, nome:'Torta de Limão',             cat:'tortas',   preco:50, av:4.7, loja:'Ateliê do Bolo',     emoji:'🥧' },
  { id:116, nome:'Torta Chocolate e Banana',   cat:'tortas',   preco:60, av:4.9, loja:'Doce Encanto',       emoji:'🥧' },
  { id:117, nome:'Brigadeiro Gourmet',          cat:'doces',    preco:3.5,av:4.8, loja:'Confeitaria da Maria',emoji:'🍫' },
  { id:118, nome:'Beijinho de Coco',            cat:'doces',    preco:2.5,av:4.6, loja:'Confeitaria Bella',  emoji:'🍬' },
  { id:119, nome:'Olho de Sogra',               cat:'doces',    preco:4,  av:4.9, loja:'Doce Encanto',       emoji:'🍬' },
  { id:120, nome:'Trufa de Chocolate',          cat:'doces',    preco:5.5,av:5.0, loja:'Sweet Dreams',       emoji:'🍫' },
  { id:121, nome:'Surpresa de Uva',             cat:'doces',    preco:3,  av:4.5, loja:'Confeitaria da Maria',emoji:'🍇' },
  { id:122, nome:'Cookie de Chocolate',         cat:'cookies',  preco:6,  av:4.7, loja:'Cake & Love',        emoji:'🍪' },
  { id:123, nome:'Brownie',                     cat:'cookies',  preco:7.5,av:4.8, loja:'Ateliê do Bolo',     emoji:'🍫' },
  { id:124, nome:'Cookie de Aveia',             cat:'cookies',  preco:5.5,av:4.6, loja:'Padaria Central',    emoji:'🍪' },
  { id:125, nome:'Cookies Amanteigados',        cat:'cookies',  preco:25, av:4.9, loja:'Casa dos Cookies',   emoji:'🍪' },
  { id:126, nome:'Kit Festa Infantil',          cat:'kits',     preco:85, av:4.9, loja:'Sweet Dreams',       emoji:'🎉' },
  { id:127, nome:'Kit Festa (20 cookies)',      cat:'kits',     preco:95, av:4.8, loja:'Doce Encanto',       emoji:'🎉' },
  { id:128, nome:'Kit Festa Completo',          cat:'kits',     preco:120,av:5.0, loja:'Confeitaria Bella',  emoji:'🎉' },
  { id:129, nome:'Kit Casamento',               cat:'kits',     preco:199,av:5.0, loja:'Ateliê do Bolo',     emoji:'💒' },
  { id:130, nome:'Macarons Coloridos',          cat:'doces',    preco:28, av:5.0, loja:'Doce Atelier',       emoji:'🍬' },
  { id:131, nome:'Pão de Mel Recheado',         cat:'doces',    preco:18, av:4.7, loja:'Delícias da Vó',     emoji:'🍯' },
];

/* ═══ BARRA DE BUSCA COM SUGESTÕES ═══ */
const searchInput = document.getElementById('searchInput');
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

        /* Filtrar produtos */
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

        /* Aplicar filtros ativos */
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

        let html = '';

        /* Resultados do catálogo */
        if (shown.length > 0) {
            html += '<div class="suggestion-header">Produtos</div>';
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
        }

        if (allFiltered.length > 8) {
            html += `
                <div class="suggestion-footer" onclick="searchInput.focus()">
                    📋 Mostrando 8 de ${allFiltered.length} resultados
                </div>`;
        }

        searchSuggestions.innerHTML = html;
        searchSuggestions.classList.add('show');
    });

    /* Fechar ao clicar fora */
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchContainer')) {
            searchSuggestions.classList.remove('show');
        }
    });

    /* Fechar com Escape */
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchSuggestions.classList.remove('show');
            this.blur();
        }
        /* Enter = ir para busca */
        if (e.key === 'Enter' && this.value.trim()) {
            this.dispatchEvent(new Event('input'));
        }
    });

    /* Focus mostra sugestões se já tem texto */
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            this.dispatchEvent(new Event('input'));
        }
    });
}

/* Highlight do texto que bate */
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
}

/* Adicionar produto do catálogo ao carrinho */
function addFromSearch(prodId) {
    const prod = PRODUTOS.find(p => p.id === prodId);
    if (!prod) return;

    /* Procurar se já existe nos CAKES pelo nome */
    const cakeMatch = CAKES.find(c => c.name.toLowerCase() === prod.nome.toLowerCase());

    if (cakeMatch) {
        cAdd(cakeMatch.id);
    } else {
        /* Adicionar dinamicamente ao CAKES */
        const newId = CAKES.length > 0 ? Math.max(...CAKES.map(c => c.id)) + 1 : 1;
        CAKES.push({ id: newId, name: prod.nome, img: '', price: prod.preco });
        cAdd(newId);
        cRenderCakes();
    }

    searchInput.value = '';
    searchSuggestions.classList.remove('show');
    cOpen();
}

/* ═══ FILTER PANEL ═══ */
const filterToggle = document.getElementById('filterToggle');
const filterPanel = document.getElementById('filterPanel');
const filterBadge = document.getElementById('filterBadge');
const filterPrice = document.getElementById('filterPrice');
const filterPriceVal = document.getElementById('filterPriceVal');
const filterClear = document.getElementById('filterClear');

let activeFilters = { cats: [], priceMax: 200, starMin: 0, sort: 'relevancia' };

if (filterToggle) {
    filterToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        searchSuggestions.classList.remove('show');
        filterPanel.classList.toggle('show');
        filterToggle.classList.toggle('active', filterPanel.classList.contains('show'));
    });

    /* Fechar painel ao clicar fora */
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#searchContainer')) {
            filterPanel.classList.remove('show');
            filterToggle.classList.remove('active');
        }
    });

    /* Chips de categoria */
    document.querySelectorAll('.filter-chip[data-cat]').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            activeFilters.cats = Array.from(document.querySelectorAll('.filter-chip[data-cat].active')).map(c => c.dataset.cat);
            updateFilterBadge();
            triggerSearch();
        });
    });

    /* Chips de avaliação */
    document.querySelectorAll('.filter-chip--star').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            const wasActive = this.classList.contains('active');
            document.querySelectorAll('.filter-chip--star').forEach(c => c.classList.remove('active'));
            if (!wasActive) { this.classList.add('active'); activeFilters.starMin = parseFloat(this.dataset.star); }
            else { activeFilters.starMin = 0; }
            updateFilterBadge();
            triggerSearch();
        });
    });

    /* Chips de ordenação */
    document.querySelectorAll('.filter-chip--sort').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.stopPropagation();
            document.querySelectorAll('.filter-chip--sort').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            activeFilters.sort = this.dataset.sort;
            triggerSearch();
        });
    });

    /* Range de preço */
    filterPrice.addEventListener('input', function() {
        activeFilters.priceMax = parseInt(this.value);
        filterPriceVal.textContent = `R$ ${this.value}`;
        updateFilterBadge();
        triggerSearch();
    });

    /* Limpar filtros */
    filterClear.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.filter-chip.active').forEach(c => c.classList.remove('active'));
        document.querySelector('.filter-chip--sort[data-sort="relevancia"]').classList.add('active');
        filterPrice.value = 200;
        filterPriceVal.textContent = 'R$ 200';
        activeFilters = { cats: [], priceMax: 200, starMin: 0, sort: 'relevancia' };
        updateFilterBadge();
        triggerSearch();
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

function triggerSearch() {
    searchInput.dispatchEvent(new Event('input'));
}

/* Aplicar filtros nos resultados da busca */
function applyFilters(results) {
    let filtered = results;

    if (activeFilters.cats.length > 0) {
        filtered = filtered.filter(p => activeFilters.cats.includes(p.cat));
    }
    if (activeFilters.priceMax < 200) {
        filtered = filtered.filter(p => p.preco <= activeFilters.priceMax);
    }
    if (activeFilters.starMin > 0) {
        filtered = filtered.filter(p => p.av >= activeFilters.starMin);
    }

    /* Ordenação */
    if (activeFilters.sort === 'menor') filtered.sort((a, b) => a.preco - b.preco);
    else if (activeFilters.sort === 'maior') filtered.sort((a, b) => b.preco - a.preco);
    else if (activeFilters.sort === 'avaliacao') filtered.sort((a, b) => b.av - a.av);

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