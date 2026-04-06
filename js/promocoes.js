// Dados de promoções
const PROMOCOES = [
  // Promoções de Produtos
  { id: 1, tipo: 'produto', titulo: 'Bolo de Chocolate Premium', descricao: 'Desconto especial para bolos', priceOriginal: 45.00, pricePromo: 32.00, desconto: 29, emoji: '🍰', avaliacao: 4.8, loja: 'Doce Encanto' },
  { id: 2, tipo: 'produto', titulo: 'Kit Festa (12 Cupcakes)', descricao: 'Aproveita a promoção do kit', priceOriginal: 85.00, pricePromo: 59.90, desconto: 30, emoji: '🎉', avaliacao: 4.9, loja: 'Sweet Dreams' },
  { id: 3, tipo: 'produto', titulo: 'Brownies Artesanais', descricao: 'Promoção por tempo limitado', priceOriginal: 24.00, pricePromo: 16.99, desconto: 29, emoji: '🍫', avaliacao: 4.7, loja: 'Ateliê do Bolo' },
  { id: 4, tipo: 'produto', titulo: 'Bolo Red Velvet', descricao: 'Uma delícia especial', priceOriginal: 52.00, pricePromo: 41.60, desconto: 20, emoji: '🍰', avaliacao: 5.0, loja: 'Sweet Dreams' },
  { id: 5, tipo: 'produto', titulo: 'Cupcakes Variados', descricao: 'Seleção especial com desconto', priceOriginal: 42.00, pricePromo: 29.40, desconto: 30, emoji: '🧁', avaliacao: 4.8, loja: 'Cake & Love' },
  
  // Promoções de Lojas
  { id: 6, tipo: 'loja', titulo: 'Doce Encanto', descricao: '20% de desconto em toda a loja', priceOriginal: null, pricePromo: null, desconto: 20, emoji: '🏪', avaliacao: 4.8, loja: 'Doce Encanto' },
  { id: 7, tipo: 'loja', titulo: 'Cake & Love', descricao: '3ª fatia 50% off', priceOriginal: null, pricePromo: null, desconto: 50, emoji: '❤️', avaliacao: 4.9, loja: 'Cake & Love' },
  { id: 8, tipo: 'loja', titulo: 'Confeitaria Bella', descricao: 'Compre 2 bolos e ganhe um cupcake', priceOriginal: null, pricePromo: null, desconto: 15, emoji: '🎁', avaliacao: 4.7, loja: 'Confeitaria Bella' },
  { id: 9, tipo: 'loja', titulo: 'Sweet Dreams', descricao: 'Frete grátis em compras acima de R$ 100', priceOriginal: null, pricePromo: null, desconto: 0, emoji: '🚚', avaliacao: 5.0, loja: 'Sweet Dreams' },
  { id: 10, tipo: 'loja', titulo: 'Padaria Central', descricao: '15% off em compra acima de R$ 50', priceOriginal: null, pricePromo: null, desconto: 15, emoji: '🥐', avaliacao: 4.5, loja: 'Padaria Central' },
  { id: 11, tipo: 'produto', titulo: 'Torta de Maçã Caseira', descricao: 'Receita tradicional com toque especial', priceOriginal: 55.00, pricePromo: 43.99, desconto: 20, emoji: '🥧', avaliacao: 4.8, loja: 'Padaria Central' },
  { id: 12, tipo: 'produto', titulo: 'Trufas Gourmet', descricao: 'Promoção imperdível', priceOriginal: 18.00, pricePromo: 12.90, desconto: 28, emoji: '🍫', avaliacao: 5.0, loja: 'Sweet Dreams' },
];

// State
let filtroAtual = 'todos';

// DOM Elements
const promoContainer = document.getElementById('promoContainer');
const tabButtons = document.querySelectorAll('.tab-btn');

// Event Listeners
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtual = btn.dataset.filter;
    renderizarPromocoes();
  });
});

// Funções
function renderizarPromocoes() {
  let promocoes = PROMOCOES;

  if (filtroAtual !== 'todos') {
    promocoes = PROMOCOES.filter(p => p.tipo === filtroAtual);
  }

  if (promocoes.length === 0) {
    promoContainer.innerHTML = '<div class="no-promos">Nenhuma promoção disponível 😕</div>';
    return;
  }

  promoContainer.innerHTML = promocoes.map((promo, index) => `
    <div class="promo-card" style="animation-delay: ${index * 0.05}s">
      <div class="promo-banner">
        ${promo.emoji}
        <div class="discount-badge">-${promo.desconto}%</div>
      </div>
      <div class="promo-content">
        <h3 class="promo-title">${promo.titulo}</h3>
        <p class="promo-subtitle">${promo.descricao}</p>
        <div class="promo-meta">
          <span class="promo-rating">★ ${promo.avaliacao.toFixed(1)}</span>
          <span class="promo-type">${promo.tipo === 'produto' ? 'Produto' : 'Loja'}</span>
        </div>
        ${promo.priceOriginal ? `
          <div class="promo-prices">
            <span class="price-original">R$ ${promo.priceOriginal.toFixed(2)}</span>
            <span class="price-promo">R$ ${promo.pricePromo.toFixed(2)}</span>
          </div>
        ` : ''}
        <button class="promo-btn" onclick="irParaDetalhes(${promo.id}, '${promo.tipo}')">
          ${promo.tipo === 'produto' ? 'Ver Produto' : 'Ir para Loja'}
        </button>
      </div>
    </div>
  `).join('');
}

function irParaDetalhes(id, tipo) {
  if (tipo === 'produto') {
    window.location.href = `produto-detalhe.html?id=${id}`;
  } else {
    window.location.href = `loja-detalhe.html?id=${id}`;
  }
}

// Renderizar inicial
renderizarPromocoes();
