// Dados de lojas
const lojas = [
  {
    id: 1,
    nome: "Doce Encanto",
    desc: "Bolos artesanais e doces finos para festas e eventos.",
    endereco: "Rua das Flores, 123 — Centro",
    avaliacao: 4.8,
    entrega: "30-45min",
    img: ""
  },
  {
    id: 2,
    nome: "Cake & Love",
    desc: "Cupcakes, brownies e bolos decorados sob encomenda.",
    endereco: "Av. Brasil, 456 — Boa Vista",
    avaliacao: 4.9,
    entrega: "25-40min",
    img: ""
  },
  {
    id: 3,
    nome: "Confeitaria Bella",
    desc: "Tradição em bolos caseiros há mais de 15 anos.",
    endereco: "Rua do Comércio, 78 — Centro",
    avaliacao: 4.7,
    entrega: "35-50min",
    img: ""
  },
  {
    id: 4,
    nome: "Sweet Dreams",
    desc: "Especialista em bolos temáticos e personalizados.",
    endereco: "Rua Nova, 210 — Jardim América",
    avaliacao: 5.0,
    entrega: "40-55min",
    img: ""
  },
  {
    id: 5,
    nome: "Padaria Central",
    desc: "Pães, bolos e salgados fresquinhos todo dia.",
    endereco: "Praça da Matriz, 15 — Centro",
    avaliacao: 4.5,
    entrega: "20-30min",
    img: ""
  },
  {
    id: 6,
    nome: "Ateliê do Bolo",
    desc: "Bolos esculpidos e cake design para ocasiões especiais.",
    endereco: "Rua São José, 332 — Alto da Sé",
    avaliacao: 4.9,
    entrega: "45-60min",
    img: ""
  }
];

// Produtos por loja
const produtosPorLoja = {
  1: [ // Doce Encanto
    { id: 1, nome: 'Bolo de Chocolate', categoria: 'bolos', preco: 45.00, emoji: '🍰' },
    { id: 2, nome: 'Bolo de Morango', categoria: 'bolos', preco: 48.00, emoji: '🍰' },
    { id: 14, nome: 'Brigadeiro Gourmet', categoria: 'doces', preco: 3.50, emoji: '🍫' },
    { id: 22, nome: 'Kit Festa (20 cookies)', categoria: 'kits', preco: 95.00, emoji: '🎉' }
  ],
  2: [ // Cake & Love
    { id: 7, nome: 'Cupcake de Chocolate', categoria: 'cupcakes', preco: 8.00, emoji: '🧁' },
    { id: 8, nome: 'Cupcake de Baunilha', categoria: 'cupcakes', preco: 7.50, emoji: '🧁' },
    { id: 9, nome: 'Cupcake de Morango', categoria: 'cupcakes', preco: 8.50, emoji: '🧁' },
    { id: 18, nome: 'Cookie de Chocolate', categoria: 'cookies', preco: 6.00, emoji: '🍪' }
  ],
  3: [ // Confeitaria Bella
    { id: 3, nome: 'Bolo de Cenoura', categoria: 'bolos', preco: 40.00, emoji: '🍰' },
    { id: 10, nome: 'Cupcake Red Velvet', categoria: 'cupcakes', preco: 9.00, emoji: '🧁' },
    { id: 15, nome: 'Beijinho de Coco', categoria: 'doces', preco: 2.50, emoji: '🍬' },
    { id: 23, nome: 'Kit Festa (Bolo + 12 cupcakes)', categoria: 'kits', preco: 120.00, emoji: '🎉' }
  ],
  4: [ // Sweet Dreams
    { id: 4, nome: 'Bolo Red Velvet', categoria: 'bolos', preco: 52.00, emoji: '🍰' },
    { id: 9, nome: 'Cupcake de Morango', categoria: 'cupcakes', preco: 8.50, emoji: '🧁' },
    { id: 17, nome: 'Trufa de Chocolate', categoria: 'doces', preco: 5.50, emoji: '🍫' },
    { id: 21, nome: 'Kit Festa (12 cupcakes)', categoria: 'kits', preco: 85.00, emoji: '🎉' }
  ],
  5: [ // Padaria Central
    { id: 5, nome: 'Bolo de Limão', categoria: 'bolos', preco: 42.00, emoji: '🍰' },
    { id: 11, nome: 'Torta de Maçã', categoria: 'tortas', preco: 55.00, emoji: '🥧' },
    { id: 20, nome: 'Cookie de Aveia', categoria: 'cookies', preco: 5.50, emoji: '🍪' }
  ],
  6: [ // Ateliê do Bolo
    { id: 6, nome: 'Bolo de Coco', categoria: 'bolos', preco: 46.00, emoji: '🍰' },
    { id: 12, nome: 'Torta de Limão', categoria: 'tortas', preco: 50.00, emoji: '🥧' },
    { id: 19, nome: 'Brownie', categoria: 'cookies', preco: 7.50, emoji: '🍫' }
  ]
};

// Get URL params
const params = new URLSearchParams(window.location.search);
const lojaId = parseInt(params.get('id')) || 1;

// Find loja
const lojaAtual = lojas.find(l => l.id === lojaId) || lojas[0];
let produtosAtivos = produtosPorLoja[lojaId] || [];
let filtroCategoria = 'todos';

// Update header
document.getElementById('lojaTitle').textContent = lojaAtual.nome;
document.getElementById('lojaScore').textContent = lojaAtual.avaliacao.toFixed(1);
document.getElementById('lojaEntrega').textContent = lojaAtual.entrega;
document.getElementById('lojaDesc').textContent = lojaAtual.desc;
document.getElementById('lojaEndereco').textContent = lojaAtual.endereco;

// Create rating stars
const ratingStars = '★'.repeat(Math.round(lojaAtual.avaliacao)) + '☆'.repeat(5 - Math.round(lojaAtual.avaliacao));
document.getElementById('lojaRating').textContent = ratingStars;

// Filtro de categorias
document.querySelectorAll('.cat-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroCategoria = btn.dataset.filter;
    renderizarProdutos();
  });
});

function renderizarProdutos() {
  let produtos = produtosAtivos;

  if (filtroCategoria !== 'todos') {
    produtos = produtos.filter(p => p.categoria === filtroCategoria);
  }

  const container = document.getElementById('produtosContainer');
  container.innerHTML = produtos.map(p => `
    <div class="produto-card" onclick="irParaDetalhe(${p.id})">
      <div class="produto-img">${p.emoji}</div>
      <div class="produto-info">
        <h4>${p.nome}</h4>
        <div class="produto-preco">R$ ${p.preco.toFixed(2)}</div>
        <button class="produto-btn">Ver Detalhes</button>
      </div>
    </div>
  `).join('');
}

function irParaDetalhe(id) {
  window.location.href = `produto-detalhe.html?id=${id}&loja=${lojaId}`;
}

// Render inicial
renderizarProdutos();
