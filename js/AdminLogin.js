// Admin Login with 2FA
const ADMIN_AUTH_KEY = 'unicakeAdminAuth';
const TWO_FA_SECRET = 'unicake2faSecret2026'; // In production, this would be per user

const loginForm = document.getElementById('loginForm');
const twoFactorForm = document.getElementById('twoFactorForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const twoFactorCodeInput = document.getElementById('twoFactorCode');
const loginBtn = document.getElementById('loginBtn');
const verifyBtn = document.getElementById('verifyBtn');
const backBtn = document.getElementById('backBtn');
const toast = document.getElementById('toast');

// Security: Hash password
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'unicakeSalt2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple TOTP simulation (in production, use proper TOTP library)
function generateTOTP(secret, timeStep = 30) {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + time.toString());
  return crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const code = hashArray.slice(0, 4).reduce((acc, byte) => acc + byte, 0) % 1000000;
    return code.toString().padStart(6, '0');
  });
}

function verifyTOTP(code, secret) {
  return generateTOTP(secret).then(expectedCode => code === expectedCode);
}

// Show toast
function showToast(message, type = 'error') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Check if already authenticated
function isAuthenticated() {
  try {
    const auth = localStorage.getItem(ADMIN_AUTH_KEY);
    return auth && JSON.parse(auth).logged === true;
  } catch {
    return false;
  }
}

// Redirect to admin panel
function redirectToPanel() {
  window.location.href = 'AdminPainel.html';
}

// Handle login form
async function handleLogin(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showToast('Preencha todos os campos.');
    return;
  }

  // Simulate loading
  loginBtn.disabled = true;
  loginBtn.textContent = 'Verificando...';

  try {
    // Hash password and check
    const hashedPassword = await hashPassword(password);
    const expectedHash = await hashPassword('UF#!@NSU'); // Default admin password

    if ((email === 'Adsensemir4#@autonance.com' || email === 'umescritorsolo@gmail.com') && hashedPassword === expectedHash) {
      // Set authentication directly
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({
        logged: true,
        email: email,
        loginTime: Date.now()
      }));

      showToast('Login realizado com sucesso!', 'success');
      setTimeout(redirectToPanel, 1000);
    } else {
      showToast('Email ou senha incorretos.');
    }
  } catch (error) {
    showToast('Erro ao fazer login. Tente novamente.');
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Entrar';
  }
}

// Handle 2FA verification
async function handleTwoFactor(e) {
  e.preventDefault();

  const code = twoFactorCodeInput.value.trim();
  const email = emailInput.value;

  if (!code || code.length !== 6) {
    showToast('Digite um código válido de 6 dígitos.');
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.textContent = 'Verificando...';

  try {
    const response = await fetch('http://localhost:5550/api/admin/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await response.json();

    if (response.ok) {
      // Set authentication
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({
        logged: true,
        email: email,
        loginTime: Date.now()
      }));

      showToast('Login realizado com sucesso!', 'success');
      setTimeout(redirectToPanel, 1000);
    } else {
      showToast(data.error || 'Código inválido');
    }
  } catch (error) {
    showToast('Erro de conexão');
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = 'Verificar';
  }
}

// Handle back button
function handleBack() {
  twoFactorForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  twoFactorCodeInput.value = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    redirectToPanel();
    return;
  }

  loginForm.addEventListener('submit', handleLogin);
  twoFactorForm.addEventListener('submit', handleTwoFactor);
  backBtn.addEventListener('click', handleBack);
});