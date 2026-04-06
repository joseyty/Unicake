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

     
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            
            if (query.length === 0) {
                searchSuggestions.classList.remove('show');
                searchSuggestions.innerHTML = '';
                return;
            }
            
            
            const results = CAKES.filter(cake => 
                cake.name.toLowerCase().includes(query)
            ).slice(0, 8); 
            
            if (results.length === 0) {
                searchSuggestions.innerHTML = `
                    <div class="suggestion-item" style="cursor: default; color: #a0785a;">
                        <span class="suggestion-icon">🔍</span>
                        <span class="suggestion-text">Nenhum produto encontrado</span>
                    </div>`;
                searchSuggestions.classList.add('show');
                return;
            }
            
            searchSuggestions.innerHTML = results.map(cake => {
                const nameUpper = cake.name.toUpperCase();
                const queryUpper = query.toUpperCase();
                const parts = nameUpper.split(new RegExp(`(${queryUpper})`, 'g'));
                
                const highlightedName = parts.map(part => 
                    part.toUpperCase() === queryUpper 
                        ? `<span class="suggestion-highlight">${part}</span>`
                        : part
                ).join('');
                
                return `
                    <div class="suggestion-item" onclick="selectSuggestion('${cake.name}', ${cake.id})">
                        <span class="suggestion-icon">${cake.icon}</span>
                        <span class="suggestion-text">${highlightedName}</span>
                        <span style="font-size: 0.8rem; color: #c9a882; margin-left: auto;">R$ ${cake.price.toFixed(2).replace('.', ',')}</span>
                    </div>`;
            }).join('');
            
            searchSuggestions.classList.add('show');
        });
        
        
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#searchContainer')) {
                searchSuggestions.classList.remove('show');
            }
        });
    }
    
    function selectSuggestion(name, id) {
        searchInput.value = name;
        searchSuggestions.classList.remove('show');
        cAdd(id);
        cToast(`${name} adicionado ao carrinho! 🎂`);
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