// Todos os produtos com suas opções de recheios
const TODOS_PRODUTOS = [
  {
    id: 1,
    nome: 'Bolo de Chocolate',
    preco: 45.00,
    avaliacao: 4.8,
    loja: 'Doce Encanto',
    desc: 'Bolo de chocolate clássico, moist e delicioso. Feito com ingredientes de qualidade.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Sabor',
        tipo: 'radio',
        opcoes: [
          { label: 'Chocolate Ao Leite', preco: 0 },
          { label: 'Chocolate Amargo', preco: 0 },
          { label: 'Chocolate Branco', preco: 5.00 }
        ]
      },
      {
        nome: 'Recheio',
        tipo: 'radio',
        opcoes: [
          { label: 'Brigadeiro Cremoso', preco: 0 },
          { label: 'Geleia de Morango', preco: 3.00 },
          { label: 'Calda de Chocolate', preco: 0 },
          { label: 'Doce de Leite', preco: 2.50 }
        ]
      },
      {
        nome: 'Cobertura',
        tipo: 'checkbox',
        opcoes: [
          { label: 'Granulado Chocolate', preco: 1.50 },
          { label: 'Confete Colorido', preco: 1.50 },
          { label: 'Frutas Frescas', preco: 3.00 }
        ]
      }
    ]
  },
  {
    id: 2,
    nome: 'Bolo de Morango',
    preco: 48.00,
    avaliacao: 4.9,
    loja: 'Cake & Love',
    desc: 'Bolo fofinho de morango, perfeito para quem gosta de sabor refrescante.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Sabor',
        tipo: 'radio',
        opcoes: [
          { label: 'Morango Natural', preco: 0 },
          { label: 'Morango com White Chocolate', preco: 4.00 }
        ]
      },
      {
        nome: 'Recheio',
        tipo: 'radio',
        opcoes: [
          { label: 'Geleia de Morango', preco: 0 },
          { label: 'Creme Chantilly', preco: 3.50 },
          { label: 'Mousse de Morango', preco: 4.00 }
        ]
      },
      {
        nome: 'Extras',
        tipo: 'checkbox',
        opcoes: [
          { label: 'Morangos Frescos', preco: 5.00 },
          { label: 'Calda de Morango', preco: 2.00 },
          { label: 'Açúcar de Ouro', preco: 2.50 }
        ]
      }
    ]
  },
  {
    id: 3,
    nome: 'Bolo de Cenoura',
    preco: 40.00,
    avaliacao: 4.7,
    loja: 'Confeitaria Bella',
    desc: 'Tradicional bolo de cenoura com cobertura de chocolate. Um clássico que nunca sai de moda.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Cobertura',
        tipo: 'radio',
        opcoes: [
          { label: 'Açúcar e Chocolate', preco: 0 },
          { label: 'Chocolate Derretido', preco: 0 },
          { label: 'Ganache de Chocolate', preco: 3.00 }
        ]
      },
      {
        nome: 'Tamanho',
        tipo: 'radio',
        opcoes: [
          { label: 'Pequeno (400g)', preco: -10.00 },
          { label: 'Médio (700g) - Padrão', preco: 0 },
          { label: 'Grande (1kg)', preco: 15.00 }
        ]
      }
    ]
  },
  {
    id: 4,
    nome: 'Bolo Red Velvet',
    preco: 52.00,
    avaliacao: 5.0,
    loja: 'Sweet Dreams',
    desc: 'O requintado Red Velvet com seu sabor único e cor vermelho intenso. Sofisticação em cada fatia.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Recheio',
        tipo: 'radio',
        opcoes: [
          { label: 'Cream Cheese Tradicional', preco: 0 },
          { label: 'Cream Cheese com Morango', preco: 3.00 },
          { label: 'Mousse Cream Cheese', preco: 4.00 }
        ]
      },
      {
        nome: 'Decoração',
        tipo: 'checkbox',
        opcoes: [
          { label: 'Pétalas Comestíveis', preco: 5.00 },
          { label: 'Calda Vermelha', preco: 2.00 },
          { label: 'Furro de Ouro', preco: 3.00 }
        ]
      }
    ]
  },
  {
    id: 5,
    nome: 'Bolo de Limão',
    preco: 42.00,
    avaliacao: 4.6,
    loja: 'Padaria Central',
    desc: 'Refrescante bolo de limão com aroma cítrico delicioso. Perfeito para o verão.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Sabor',
        tipo: 'radio',
        opcoes: [
          { label: 'Limão Siciliano', preco: 0 },
          { label: 'Limão Tahiti', preco: 2.00 }
        ]
      },
      {
        nome: 'Recheio',
        tipo: 'radio',
        opcoes: [
          { label: 'Calda de Limão', preco: 0 },
          { label: 'Crème Fraîche', preco: 3.50 },
          { label: 'Merengue Italiano', preco: 4.00 }
        ]
      }
    ]
  },
  {
    id: 6,
    nome: 'Bolo de Coco',
    preco: 46.00,
    avaliacao: 4.8,
    loja: 'Ateliê do Bolo',
    desc: 'Bolo moist de coco com cobertura cremosa. Sabor tropical que encanta.',
    emoji: '🍰',
    opcoes: [
      {
        nome: 'Tipo de Coco',
        tipo: 'radio',
        opcoes: [
          { label: 'Coco Ralado', preco: 0 },
          { label: 'Leite de Coco', preco: 2.00 }
        ]
      },
      {
        nome: 'Recheio',
        tipo: 'radio',
        opcoes: [
          { label: 'Creme de Coco', preco: 0 },
          { label: 'Doce de Coco Queimadi', preco: 3.00 }
        ]
      }
    ]
  },
  {
    id: 7,
    nome: 'Cupcake de Chocolate',
    preco: 8.00,
    avaliacao: 4.7,
    loja: 'Cake & Love',
    desc: 'Cupcake mofador de chocolate com cobertura premium.',
    emoji: '🧁',
    opcoes: [
      {
        nome: 'Cobertura',
        tipo: 'radio',
        opcoes: [
          { label: 'Buttercream Chocolate', preco: 0 },
          { label: 'Ganache Chocolate', preco: 1.00 },
          { label: 'Cream Cheese', preco: 1.50 }
        ]
      }
    ]
  },
  {
    id: 8,
    nome: 'Cupcake de Baunilha',
    preco: 7.50,
    avaliacao: 4.6,
    loja: 'Doce Encanto',
    desc: 'Clássico cupcake de baunilha delicado.',
    emoji: '🧁',
    opcoes: [
      {
        nome: 'Sabor da Cobertura',
        tipo: 'radio',
        opcoes: [
          { label: 'Baunilha', preco: 0 },
          { label: 'Morango', preco: 1.00 },
          { label: 'Limão', preco: 1.00 }
        ]
      }
    ]
  },
  {
    id: 11,
    nome: 'Torta de Maçã',
    preco: 55.00,
    avaliacao: 4.8,
    loja: 'Padaria Central',
    desc: 'Torta caseira de maçã com massa crocante e recheio de maçã fresca.',
    emoji: '🥧',
    opcoes: [
      {
        nome: 'Tamanho',
        tipo: 'radio',
        opcoes: [
          { label: 'Pequena (6 fatias)', preco: -10.00 },
          { label: 'Média (8 fatias) - Padrão', preco: 0 },
          { label: 'Grande (12 fatias)', preco: 20.00 }
        ]
      }
    ]
  },
  {
    id: 14,
    nome: 'Brigadeiro Gourmet',
    preco: 3.50,
    avaliacao: 4.8,
    loja: 'Cake & Love',
    desc: 'Brigadeiro feito com chocolate belga premium.',
    emoji: '🍫',
    opcoes: [
      {
        nome: 'Tipo de Chocolate',
        tipo: 'radio',
        opcoes: [
          { label: 'Chocolate Ao Leite', preco: 0 },
          { label: 'Chocolate Amargo', preco: 0.50 },
          { label: 'Chocolate Branco', preco: 1.00 }
        ]
      },
      {
        nome: 'Cobertura',
        tipo: 'radio',
        opcoes: [
          { label: 'Granulado Chocolate', preco: 0 },
          { label: 'Confete Colorido', preco: 0.50 },
          { label: 'Açúcar de Ouro', preco: 1.00 }
        ]
      }
    ]
  }
];

// Get product ID
const params = new URLSearchParams(window.location.search);
const produtoId = parseInt(params.get('id')) || 1;
const lojaId = parseInt(params.get('loja')) || null;

// Find product
const produto = TODOS_PRODUTOS.find(p => p.id === produtoId) || TODOS_PRODUTOS[0];

// State
let opcoesEscolhidas = {};
let precoAdicional = 0;

// Update page
document.getElementById('produtoNome').textContent = produto.nome;
document.getElementById('produtoScore').textContent = `(${produto.avaliacao})`;
document.getElementById('produtoDesc').textContent = produto.desc;
document.getElementById('produtoImgGrande').textContent = produto.emoji;
document.getElementById('vendidoPor').textContent = produto.loja;
document.getElementById('tempoEntrega').textContent = '30-45min';

// Create rating stars
const stars = '★'.repeat(Math.round(produto.avaliacao)) + '☆'.repeat(5 - Math.round(produto.avaliacao));
document.getElementById('produtoRating').textContent = stars;

// Build options
const opcoesContainer = document.getElementById('opcoesContainer');
produto.opcoes.forEach((grupo, idx) => {
  const div = document.createElement('div');
  div.className = 'opcao-group';
  
  let html = `<label>${grupo.nome}</label><div class="opcao-group-options">`;
  
  grupo.opcoes.forEach((opcao, index) => {
    const inputType = grupo.tipo;
    const inputName = `opcao-${idx}`;
    const inputId = `${inputName}-${index}`;
    const precoText = opcao.preco > 0 ? `+R$ ${opcao.preco.toFixed(2)}` : (opcao.preco < 0 ? `-R$ ${Math.abs(opcao.preco).toFixed(2)}` : '');
    
    html += `
      <div class="opcao-item">
        <input type="${inputType}" name="${inputName}" id="${inputId}" value="${opcao.label}" data-preco="${opcao.preco}" ${index === 0 && inputType === 'radio' ? 'checked' : ''}>
        <label for="${inputId}">${opcao.label}</label>
        ${precoText ? `<span class="opcao-preco">${precoText}</span>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  div.innerHTML = html;
  opcoesContainer.appendChild(div);
});

// Event listeners
document.querySelectorAll('[type="radio"], [type="checkbox"]').forEach(input => {
  input.addEventListener('change', atualizarPreco);
});

document.getElementById('incremento').addEventListener('click', () => {
  const qty = document.getElementById('quantidade');
  qty.value = parseInt(qty.value) + 1;
  atualizarPreco();
});

document.getElementById('decremento').addEventListener('click', () => {
  const qty = document.getElementById('quantidade');
  if (parseInt(qty.value) > 1) {
    qty.value = parseInt(qty.value) - 1;
  }
  atualizarPreco();
});

document.getElementById('quantidade').addEventListener('change', atualizarPreco);

// Update navbar link
if (lojaId) {
  document.getElementById('lojaLink').href = `loja-detalhe.html?id=${lojaId}`;
  document.getElementById('lojaLink').textContent = produto.loja;
} else {
  document.getElementById('lojaLink').textContent = produto.loja;
}

function atualizarPreco() {
  precoAdicional = 0;
  
  document.querySelectorAll('[type="radio"]:checked, [type="checkbox"]:checked').forEach(input => {
    precoAdicional += parseFloat(input.dataset.preco) || 0;
  });
  
  const precoUnitario = produto.preco + precoAdicional;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const subtotal = precoUnitario * quantidade;
  const taxa = 5.00;
  const total = subtotal + taxa;
  
  document.getElementById('precoAtual').textContent = `R$ ${precoUnitario.toFixed(2)}`;
  document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
  document.getElementById('taxaEntrega').textContent = `R$ ${taxa.toFixed(2)}`;
  document.getElementById('totalPrice').textContent = `R$ ${total.toFixed(2)}`;
}

document.getElementById('addCartBtn').addEventListener('click', () => {
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const precoUnitario = produto.preco + precoAdicional;
  
  // Simulate add to cart
  alert(`✅ ${quantidade} x "${produto.nome}" adicionado ao carrinho!\nTotal: R$ ${(precoUnitario * quantidade + 5).toFixed(2)}`);
  document.getElementById('cartCount').textContent = parseInt(document.getElementById('cartCount').textContent) + quantidade;
});

document.querySelector('.btn-buy-now').addEventListener('click', () => {
  const precoUnitario = produto.preco + precoAdicional;
  const quantidade = parseInt(document.getElementById('quantidade').value);
  const total = precoUnitario * quantidade + 5;
  
  alert(`💳 Ir para Pagamento\nTotal: R$ ${total.toFixed(2)}`);
});

// Initial price update
atualizarPreco();
