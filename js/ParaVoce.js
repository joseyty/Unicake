
const SUGESTOES = {
  aniversario: {
    titulo: "🎂 Sugestões para Aniversário",
    itens: [
      { nome: "Bolo Confetti 2 Andares", desc: "Massa colorida com cobertura de chantilly e granulado.", preco: "R$ 129,90", emoji: "🎂" },
      { nome: "Kit Festa Completo", desc: "Bolo + 50 docinhos + 30 salgados. Serve até 30 pessoas.", preco: "R$ 249,90", emoji: "🎉" },
      { nome: "Cupcakes Personalizados x12", desc: "Decorados com tema à sua escolha. Sabores variados.", preco: "R$ 74,90", emoji: "🧁" },
    ]
  },
  casamento: {
    titulo: "💒 Sugestões para Casamento",
    itens: [
      { nome: "Bolo Clássico 3 Andares", desc: "Decoração elegante com flores de açúcar e acabamento perlado.", preco: "R$ 389,90", emoji: "🎩" },
      { nome: "Mesa de Doces Premium", desc: "Bem-casados, brigadeiros finos, trufas e mini tortas.", preco: "R$ 599,90", emoji: "💐" },
      { nome: "Naked Cake Rústico", desc: "Perfeito para casamentos ao ar livre. Decorado com flores naturais.", preco: "R$ 199,90", emoji: "🌸" },
    ]
  },
  cafe: {
    titulo: "☕ Sugestões para Café da Tarde",
    itens: [
      { nome: "Fatia de Bolo de Cenoura", desc: "Com cobertura generosa de brigadeiro gourmet.", preco: "R$ 12,90", emoji: "🥕" },
      { nome: "Combo Chá & Bolo", desc: "2 fatias + chá ou café artesanal. Perfeito para dois.", preco: "R$ 34,90", emoji: "☕" },
      { nome: "Brownie com Sorvete", desc: "Brownie quentinho com bola de sorvete de creme.", preco: "R$ 18,90", emoji: "🍫" },
    ]
  },
  infantil: {
    titulo: "🧸 Sugestões para Festa Infantil",
    itens: [
      { nome: "Bolo Temático Infantil", desc: "Personagens, super-heróis ou princesas. Escolha o tema!", preco: "R$ 159,90", emoji: "🦸" },
      { nome: "Kit Festa Kids", desc: "Bolo + algodão doce + pipoca gourmet + 40 docinhos.", preco: "R$ 199,90", emoji: "🎈" },
      { nome: "Cake Pops x20", desc: "Bolinhos no palito decorados. As crianças adoram!", preco: "R$ 49,90", emoji: "🍭" },
    ]
  },
  romantico: {
    titulo: "💕 Sugestões para Jantar Romântico",
    itens: [
      { nome: "Mini Bolo Coração", desc: "Red velvet em formato de coração com cobertura cream cheese.", preco: "R$ 59,90", emoji: "❤️" },
      { nome: "Fondue de Chocolate", desc: "Chocolate belga + frutas frescas + marshmallows.", preco: "R$ 69,90", emoji: "🫕" },
      { nome: "Torta de Frutas Vermelhas", desc: "Massa amanteigada com creme pâtissière e berries.", preco: "R$ 74,90", emoji: "🍓" },
    ]
  },
  presente: {
    titulo: "🎁 Sugestões para Presente",
    itens: [
      { nome: "Box Surpresa Premium", desc: "Caixa decorada com brownie, cookies, brigadeiros e bombons.", preco: "R$ 89,90", emoji: "🎁" },
      { nome: "Bolo na Caixa", desc: "Mini bolo individual em embalagem presenteável.", preco: "R$ 44,90", emoji: "📦" },
      { nome: "Kit Degustação", desc: "6 sabores diferentes de bolo em fatias individuais.", preco: "R$ 59,90", emoji: "🍰" },
    ]
  },
};


function selectOcasiao(el) {
  document.querySelectorAll('.ocasiao-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  const oc = el.dataset.oc;
  const data = SUGESTOES[oc];
  if (!data) return;

  document.getElementById('sugestoesTitulo').textContent = data.titulo;
  document.getElementById('sugestoesGrid').innerHTML = data.itens.map((item, i) => `
    <div class="sug-card" style="animation-delay:${i * .1}s">
      <div class="sug-card__img">${item.emoji}</div>
      <div class="sug-card__body">
        <h3>${item.nome}</h3>
        <p>${item.desc}</p>
        <div class="sug-card__price">${item.preco}</div>
      </div>
    </div>
  `).join('');

  const section = document.getElementById('sugestoesSection');
  section.style.display = '';
  section.style.animation = 'none';
  section.offsetHeight; // reflow
  section.style.animation = '';

  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast(`${data.itens.length} sugestões para ${el.querySelector('.ocasiao-card__label').textContent} 🎉`);
}

function copiarCupom() {
  const code = document.getElementById('cupomCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Cupom copiado! 🏷️ Use no checkout');
  }).catch(() => {
    showToast('Cupom: ' + code);
  });
}


let _pvt;
function showToast(msg) {
  const t = document.getElementById('pvToast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_pvt);
  _pvt = setTimeout(() => t.classList.remove('show'), 2800);
}


(function () {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const siblings = Array.from(el.parentElement.querySelectorAll('[data-reveal]'));
        const idx = siblings.indexOf(el);
        setTimeout(() => el.classList.add('visible'), idx * 150);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
  items.forEach(item => obs.observe(item));
})();