// Admin Panel Script with Security Features
const ADMIN_AUTH_KEY = 'unicakeAdminAuth';
const USERS_KEY = 'unicakeUsers';
const PRODUCTS_KEY = 'unicakeProducts';
const SALES_KEY = 'unicakeSales';

// Security: Simple hash simulation (in production, use bcrypt or similar)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'unicakeSalt2026'); // Add salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  const hashed = await hashPassword(password);
  return hashed === hash;
}

// Mock admin credentials (hashed)
const ADMIN_CREDENTIALS = {
  email: 'Adsensemir4#@autonance.com',
  passwordHash: 'hashed_password_here' // Will be set on init
};

const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');
const formFields = document.getElementById('formFields');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const toast = document.getElementById('toast');

let currentSection = 'users';
let currentEditId = null;
let currentEditType = null;

// Initialize admin password hash
async function initAdminHash() {
  ADMIN_CREDENTIALS.passwordHash = await hashPassword('#!@nsugettademo4'); // Admin password
}

// Check authentication with session timeout
function isAdminAuthenticated() {
  try {
    const auth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!auth) return false;

    const authData = JSON.parse(auth);
    const now = Date.now();
    const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours

    if (authData.logged && (now - authData.loginTime) < sessionDuration) {
      return true;
    } else {
      // Session expired
      localStorage.removeItem(ADMIN_AUTH_KEY);
      return false;
    }
  } catch {
    return false;
  }
}

// Redirect if not authenticated
function redirectToLogin() {
  window.location.href = 'AdminLogin.html'; // Or create admin login page
}

// Show toast notification
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Data management functions
function getData(key, defaultData = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultData;
  } catch {
    return defaultData;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// CRUD operations
async function getUsers() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/users');
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro ao buscar usuários');
      return [];
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    return [];
  }
}

function getProducts() {
  return getData(PRODUCTS_KEY, [
    { id: 1, nome: 'Bolo de Chocolate', categoria: 'Bolos', preco: 45.90, vendedor: 'Maria Confeitaria' },
    { id: 2, nome: 'Cupcake Baunilha', categoria: 'Cupcakes', preco: 8.50, vendedor: 'Maria Confeitaria' }
  ]);
}

function getSales() {
  return getData(SALES_KEY, [
    { id: 1, cliente: 'João Silva', produto: 'Bolo de Chocolate', valor: 45.90, data: '2026-04-08', status: 'concluida' }
  ]);
}

// Update stats (for reference, not displayed)
function updateStats() {
  // Stats are no longer displayed but kept for potential future use
  const users = getUsers();
  const products = getProducts();
  const sales = getSales();
  console.log('Stats:', { users: users.length, products: products.length, sales: sales.length });
}

// Render tables
async function renderUsers() {
  const users = await getUsers();
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.cpf}</td>
      <td>${user.email}</td>
      <td>${user.senha}</td>
      <td>${user.tipo_usuario}</td>
      <td>${user.status}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editUser(${user.id})">Editar</button>
        <button class="action-btn btn-delete" onclick="deleteUser(${user.id})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function renderProducts() {
  const products = getProducts();
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>${product.nome}</td>
      <td>${product.categoria}</td>
      <td>R$ ${product.preco.toFixed(2).replace('.', ',')}</td>
      <td>${product.vendedor}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editProduct(${product.id})">Editar</button>
        <button class="action-btn btn-delete" onclick="deleteProduct(${product.id})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function renderSales() {
  const sales = getSales();
  const tbody = document.getElementById('salesTableBody');
  tbody.innerHTML = sales.map(sale => `
    <tr>
      <td>${sale.id}</td>
      <td>${sale.cliente}</td>
      <td>${sale.produto}</td>
      <td>R$ ${sale.valor.toFixed(2).replace('.', ',')}</td>
      <td>${sale.data}</td>
      <td>${sale.status}</td>
      <td>
        <button class="action-btn btn-edit" onclick="editSale(${sale.id})">Editar</button>
        <button class="action-btn btn-delete" onclick="deleteSale(${sale.id})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

// Modal functions
function openModal(type, id = null) {
  currentEditType = type;
  currentEditId = id;
  modalTitle.textContent = id ? `Editar ${type}` : `Adicionar ${type}`;

  let fields = '';
  switch (type) {
    case 'Usuário':
      fields = `
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" required>
        </div>
        <div class="form-group">
          <label for="tipo">Tipo</label>
          <select id="tipo" required>
            <option value="cliente">Cliente</option>
            <option value="confeiteiro">Confeiteiro</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" required>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      `;
      break;
    case 'Produto':
      fields = `
        <div class="form-group">
          <label for="nome">Nome</label>
          <input type="text" id="nome" required>
        </div>
        <div class="form-group">
          <label for="categoria">Categoria</label>
          <select id="categoria" required>
            <option value="Bolos">Bolos</option>
            <option value="Cupcakes">Cupcakes</option>
            <option value="Doces">Doces</option>
            <option value="Salgados">Salgados</option>
            <option value="Bebidas">Bebidas</option>
          </select>
        </div>
        <div class="form-group">
          <label for="preco">Preço</label>
          <input type="number" id="preco" step="0.01" required>
        </div>
        <div class="form-group">
          <label for="vendedor">Vendedor</label>
          <input type="text" id="vendedor" required>
        </div>
      `;
      break;
    case 'Venda':
      fields = `
        <div class="form-group">
          <label for="cliente">Cliente</label>
          <input type="text" id="cliente" required>
        </div>
        <div class="form-group">
          <label for="produto">Produto</label>
          <input type="text" id="produto" required>
        </div>
        <div class="form-group">
          <label for="valor">Valor</label>
          <input type="number" id="valor" step="0.01" required>
        </div>
        <div class="form-group">
          <label for="data">Data</label>
          <input type="date" id="data" required>
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" required>
            <option value="pendente">Pendente</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      `;
      break;
  }

  formFields.innerHTML = fields;
  modal.classList.add('show');

  // Populate fields if editing
  if (id) {
    populateForm(type, id);
  }
}

function closeModalFunc() {
  modal.classList.remove('show');
  modalForm.reset();
  currentEditId = null;
  currentEditType = null;
}

function populateForm(type, id) {
  let data;
  switch (type) {
    case 'Usuário':
      data = getUsers().find(u => u.id === id);
      break;
    case 'Produto':
      data = getProducts().find(p => p.id === id);
      break;
    case 'Venda':
      data = getSales().find(s => s.id === id);
      break;
  }

  if (data) {
    Object.keys(data).forEach(key => {
      const input = document.getElementById(key);
      if (input) input.value = data[key];
    });
  }
}

// Form submission
async function handleFormSubmit(e) {
  e.preventDefault();

  const formData = new FormData(modalForm);
  const data = Object.fromEntries(formData);

  let collection, key;
  switch (currentEditType) {
    case 'Usuário':
      collection = getUsers();
      key = USERS_KEY;
      break;
    case 'Produto':
      collection = getProducts();
      key = PRODUCTS_KEY;
      data.preco = parseFloat(data.preco);
      break;
    case 'Venda':
      collection = getSales();
      key = SALES_KEY;
      data.valor = parseFloat(data.valor);
      break;
  }

  if (currentEditId) {
    // Update
    const index = collection.findIndex(item => item.id === currentEditId);
    if (index !== -1) {
      collection[index] = { ...collection[index], ...data };
    }
  } else {
    // Create
    const newId = collection.length ? Math.max(...collection.map(item => item.id)) + 1 : 1;
    collection.push({ id: newId, ...data });
  }

  saveData(key, collection);
  updateStats();
  await renderUsers();
  renderProducts();
  renderSales();
  closeModalFunc();
  showToast(`${currentEditType} ${currentEditId ? 'atualizado' : 'adicionado'} com sucesso!`);
}

// Delete functions
function deleteUser(id) {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    const users = getUsers().filter(u => u.id !== id);
    saveData(USERS_KEY, users);
    renderUsers();
    updateStats();
    showToast('Usuário excluído com sucesso!');
  }
}

function deleteProduct(id) {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    const products = getProducts().filter(p => p.id !== id);
    saveData(PRODUCTS_KEY, products);
    renderProducts();
    updateStats();
    showToast('Produto excluído com sucesso!');
  }
}

function deleteSale(id) {
  if (confirm('Tem certeza que deseja excluir esta venda?')) {
    const sales = getSales().filter(s => s.id !== id);
    saveData(SALES_KEY, sales);
    renderSales();
    updateStats();
    showToast('Venda excluída com sucesso!');
  }
}

// Edit functions
function editUser(id) { openModal('Usuário', id); }
function editProduct(id) { openModal('Produto', id); }
function editSale(id) { openModal('Venda', id); }

// Navigation
function switchSection(sectionName) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(sectionName).classList.add('active');
  document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

  document.getElementById('sectionTitle').textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
  currentSection = sectionName;
}

// Event listeners
document.addEventListener('DOMContentLoaded', async () => {
  if (!isAdminAuthenticated()) {
    redirectToLogin();
    return;
  }

  await initAdminHash();

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });

  // Modal
  closeModal.addEventListener('click', closeModalFunc);
  cancelBtn.addEventListener('click', closeModalFunc);
  modalForm.addEventListener('submit', handleFormSubmit);

  // Add buttons
  document.getElementById('addUserBtn').addEventListener('click', () => openModal('Usuário'));
  document.getElementById('addProductBtn').addEventListener('click', () => openModal('Produto'));
  document.getElementById('addSaleBtn').addEventListener('click', () => openModal('Venda'));

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    redirectToLogin();
  });

  // Initial render
  updateStats();
  await renderUsers();
  renderProducts();
  renderSales();
});

// Close modal on outside click
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModalFunc();
});