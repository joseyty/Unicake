// Dados de produtos
const PRODUTOS = [
  // Bolos
  { id: 1, nome: 'Bolo de Chocolate', categoria: 'bolos', preco: 45.00, avaliacao: 4.8, loja: 'Doce Encanto', emocao: '🍰' },
  { id: 2, nome: 'Bolo de Morango', categoria: 'bolos', preco: 48.00, avaliacao: 4.9, loja: 'Cake & Love', emocao: '🍰' },
  { id: 3, nome: 'Bolo de Cenoura', categoria: 'bolos', preco: 40.00, avaliacao: 4.7, loja: 'Confeitaria Bella', emocao: '🍰' },
  { id: 4, nome: 'Bolo Red Velvet', categoria: 'bolos', preco: 52.00, avaliacao: 5.0, loja: 'Sweet Dreams', emocao: '🍰' },
  { id: 5, nome: 'Bolo de Limão', categoria: 'bolos', preco: 42.00, avaliacao: 4.6, loja: 'Padaria Central', emocao: '🍰' },
  { id: 6, nome: 'Bolo de Coco', categoria: 'bolos', preco: 46.00, avaliacao: 4.8, loja: 'Ateliê do Bolo', emocao: '🍰' },
  
  // Cupcakes
  { id: 7, nome: 'Cupcake de Chocolate', categoria: 'cupcakes', preco: 8.00, avaliacao: 4.7, loja: 'Cake & Love', emocao: '🧁' },
  { id: 8, nome: 'Cupcake de Baunilha', categoria: 'cupcakes', preco: 7.50, avaliacao: 4.6, loja: 'Doce Encanto', emocao: '🧁' },
  { id: 9, nome: 'Cupcake de Morango', categoria: 'cupcakes', preco: 8.50, avaliacao: 4.9, loja: 'Sweet Dreams', emocao: '🧁' },
  { id: 10, nome: 'Cupcake Red Velvet', categoria: 'cupcakes', preco: 9.00, avaliacao: 5.0, loja: 'Confeitaria Bella', emocao: '🧁' },
  
  // Tortas
  { id: 11, nome: 'Torta de Maçã', categoria: 'tortas', preco: 55.00, avaliacao: 4.8, loja: 'Padaria Central', emocao: '🥧' },
  { id: 12, nome: 'Torta de Limão', categoria: 'tortas', preco: 50.00, avaliacao: 4.7, loja: 'Ateliê do Bolo', emocao: '🥧' },
  { id: 13, nome: 'Torta Chocolate e Banana', categoria: 'tortas', preco: 60.00, avaliacao: 4.9, loja: 'Doce Encanto', emocao: '🥧' },
  
  // Doces
  { id: 14, nome: 'Brigadeiro Gourmet', categoria: 'doces', preco: 3.50, avaliacao: 4.8, loja: 'Cake & Love', emocao: '🍫' },
  { id: 15, nome: 'Beijinho de Coco', categoria: 'doces', preco: 2.50, avaliacao: 4.6, loja: 'Confeitaria Bella', emocao: '🍬' },
  { id: 16, nome: 'Olho de Sogra', categoria: 'doces', preco: 4.00, avaliacao: 4.9, loja: 'Doce Encanto', emocao: '🍬' },
  { id: 17, nome: 'Trufa de Chocolate', categoria: 'doces', preco: 5.50, avaliacao: 5.0, loja: 'Sweet Dreams', emocao: '🍫' },
  
  // Cookies
  { id: 18, nome: 'Cookie de Chocolate', categoria: 'cookies', preco: 6.00, avaliacao: 4.7, loja: 'Cake & Love', emocao: '🍪' },
  { id: 19, nome: 'Brownie', categoria: 'cookies', preco: 7.50, avaliacao: 4.8, loja: 'Ateliê do Bolo', emocao: '🍫' },
  { id: 20, nome: 'Cookie de Aveia', categoria: 'cookies', preco: 5.50, avaliacao: 4.6, loja: 'Padaria Central', emocao: '🍪' },
  
  // Kits
  { id: 21, nome: 'Kit Festa (12 cupcakes)', categoria: 'kits', preco: 85.00, avaliacao: 4.9, loja: 'Sweet Dreams', emocao: '🎉' },
  { id: 22, nome: 'Kit Festa (20 cookies)', categoria: 'kits', preco: 95.00, avaliacao: 4.8, loja: 'Doce Encanto', emocao: '🎉' },
  { id: 23, nome: 'Kit Festa (Bolo + 12 cupcakes)', categoria: 'kits', preco: 120.00, avaliacao: 5.0, loja: 'Confeitaria Bella', emocao: '🎉' },
];

// Elementos DOM
const mainSearchInput = document.getElementById('mainSearchInput');
const resultsContainer = document.getElementById('resultsContainer');
const resultsTitle = document.getElementById('resultsTitle');
const categoryFilters = document.querySelectorAll('.category-filter');
const ratingFilters = document.querySelectorAll('.rating-filter');
const priceRange = document.getElementById('priceRange');
const priceDisplay = document.getElementById('priceDisplay');
const sortSelect = document.getElementById('sortSelect');
const resetFilters = document.getElementById('resetFilters');

// Estado dos filtros
let filtrosAtivos = {
  categorias: [],
  preco: 200,
  avaliacao: 0,
  busca: ''
};

// Event Listeners
mainSearchInput.addEventListener('input', () => {
  filtrosAtivos.busca = mainSearchInput.value.toLowerCase();
  aplicarFiltros();
});

categoryFilters.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    filtrosAtivos.categorias = Array.from(categoryFilters)
      .filter(c => c.checked)
      .map(c => c.value);
    aplicarFiltros();
  });
});

ratingFilters.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const selecionados = Array.from(ratingFilters)
      .filter(c => c.checked)
      .map(c => parseInt(c.value));
    filtrosAtivos.avaliacao = Math.min(...selecionados) || 0;
    aplicarFiltros();
  });
});

priceRange.addEventListener('input', () => {
  filtrosAtivos.preco = parseFloat(priceRange.value);
  priceDisplay.textContent = `até R$ ${filtrosAtivos.preco.toFixed(2)}`;
  aplicarFiltros();
});

sortSelect.addEventListener('change', () => {
  aplicarFiltros();
});

resetFilters.addEventListener('click', () => {
  mainSearchInput.value = '';
  categoryFilters.forEach(c => c.checked = false);
  ratingFilters.forEach(c => c.checked = false);
  priceRange.value = 200;
  priceDisplay.textContent = 'até R$ 200';
  filtrosAtivos = { categorias: [], preco: 200, avaliacao: 0, busca: '' };
  sortSelect.value = 'relevancia';
  aplicarFiltros();
});

// Funções
function aplicarFiltros() {
  let resultados = PRODUTOS.filter(produto => {
    // Filtro de busca
    const matchBusca = produto.nome.toLowerCase().includes(filtrosAtivos.busca) ||
                      produto.loja.toLowerCase().includes(filtrosAtivos.busca);
    if (filtrosAtivos.busca && !matchBusca) return false;

    // Filtro de categoria
    if (filtrosAtivos.categorias.length > 0 && !filtrosAtivos.categorias.includes(produto.categoria)) {
      return false;
    }

    // Filtro de preço
    if (produto.preco > filtrosAtivos.preco) return false;

    // Filtro de avaliação
    if (filtrosAtivos.avaliacao > 0 && produto.avaliacao < filtrosAtivos.avaliacao) {
      return false;
    }

    return true;
  });

  // Ordenação
  const ordem = sortSelect.value;
  if (ordem === 'maisbaixo') {
    resultados.sort((a, b) => a.preco - b.preco);
  } else if (ordem === 'maisalto') {
    resultados.sort((a, b) => b.preco - a.preco);
  } else if (ordem === 'avaliacao') {
    resultados.sort((a, b) => b.avaliacao - a.avaliacao);
  }

  renderizarResultados(resultados);
}

function renderizarResultados(produtos) {
  if (produtos.length === 0) {
    resultsContainer.innerHTML = '<div class="no-results">Nenhum produto encontrado 😕</div>';
    resultsTitle.textContent = 'Resultados da Busca (0)';
    return;
  }

  resultsTitle.textContent = `Resultados da Busca (${produtos.length})`;
  resultsContainer.innerHTML = produtos.map(produto => `
    <div class="product-card" onclick="irParaDetalheProduto(${produto.id})">
      <div class="product-image">${produto.emocao}</div>
      <div class="product-info">
        <h4>${produto.nome}</h4>
        <div class="product-meta">
          <span class="product-rating">★ ${produto.avaliacao.toFixed(1)}</span>
          <span class="product-loja">${produto.loja}</span>
        </div>
        <div class="product-price">R$ ${produto.preco.toFixed(2)}</div>
        <button class="product-btn">Ver Detalhes</button>
      </div>
    </div>
  `).join('');
}

function irParaDetalheProduto(idProduto) {
  window.location.href = `produto-detalhe.html?id=${idProduto}`;
}

// Renderizar inicial
aplicarFiltros();
