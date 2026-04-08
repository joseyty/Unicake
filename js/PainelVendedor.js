const AUTH_KEY = 'unicakeSellerAuth';
const PRODUCTS_KEY = 'unicakeSellerProducts';

const logoutBtn = document.getElementById('logoutBtn');
const productGrid = document.getElementById('productGrid');
const productCount = document.getElementById('productCount');
const productForm = document.getElementById('productForm');
const toast = document.getElementById('toast');

const starterProducts = [
  {
    id: 1,
    nome: 'Bolo de Chocolate Belga',
    categoria: 'Bolos',
    preco: 145.9,
    descricao: 'Bolo recheado com ganache e toques de caramelo.'
  },
  {
    id: 2,
    nome: 'Cupcake de Baunilha',
    categoria: 'Cupcakes',
    preco: 18.5,
    descricao: 'Pequeno e delicioso, com cobertura cremosa de baunilha.'
  },
  {
    id: 3,
    nome: 'Brownie com Nozes',
    categoria: 'Doces',
    preco: 12.0,
    descricao: 'Sabor intenso e textura macia, perfeito para encomendas.'
  }
];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function redirectToLogin() {
  window.location.href = 'Loginconfeiteiro.html';
}

function isAuthenticated() {
  try {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth && JSON.parse(auth).logged === true;
  } catch {
    return false;
  }
}

function getProducts() {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(starterProducts));
  return starterProducts;
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderProducts(products) {
  productCount.textContent = products.length;
  if (products.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">Nenhum produto cadastrado ainda.</p>';
    return;
  }

  productGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <strong>${product.nome}</strong>
      <div class="meta">
        <span>${product.categoria}</span>
        <span>${formatPrice(product.preco)}</span>
      </div>
      <p>${product.descricao}</p>
    </article>
  `).join('');
}

function handleSubmit(event) {
  event.preventDefault();

  const nome = document.getElementById('nomeProduto').value.trim();
  const categoria = document.getElementById('categoriaProduto').value;
  const preco = Number(document.getElementById('precoProduto').value);
  const descricao = document.getElementById('descricaoProduto').value.trim();

  if (!nome || !categoria || !preco || preco <= 0 || !descricao) {
    showToast('Preencha todos os campos corretamente.');
    return;
  }

  const products = getProducts();
  const novoProduto = {
    id: products.length ? Math.max(...products.map(p => p.id)) + 1 : 1,
    nome,
    categoria,
    preco,
    descricao
  };

  products.unshift(novoProduto);
  saveProducts(products);
  renderProducts(products);
  productForm.reset();
  showToast('Produto cadastrado com sucesso!');
}

function init() {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  renderProducts(getProducts());
  productForm.addEventListener('submit', handleSubmit);
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem(AUTH_KEY);
    redirectToLogin();
  });
}

init();
