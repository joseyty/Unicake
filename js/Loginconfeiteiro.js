/* ══════════════════════════════════
   CONFEITEIRO – Login
   script.js
══════════════════════════════════ */

// ── Credenciais simuladas (substituir por API real) ────────
const MOCK_EMAIL = 'confeiteiro@email.com';
const MOCK_SENHA = '123456';

// ── Referências ao DOM ─────────────────────────────────────
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const fieldEmail = document.getElementById('field-email');
const fieldSenha = document.getElementById('field-senha');
const btnEntrar  = document.getElementById('btnEntrar');
const togglePw   = document.getElementById('togglePw');
const iconEye    = document.getElementById('icon-eye');
const iconEyeOff = document.getElementById('icon-eye-off');
const toast      = document.getElementById('toast');
const remember   = document.getElementById('remember');
const forgotLink = document.getElementById('forgotLink');

// ── Mostrar / ocultar senha ────────────────────────────────
togglePw.addEventListener('click', () => {
  const show = senhaInput.type === 'password';
  senhaInput.type          = show ? 'text'  : 'password';
  iconEye.style.display    = show ? 'none'  : 'block';
  iconEyeOff.style.display = show ? 'block' : 'none';
  senhaInput.focus();
});

// ── Checkbox customizado ───────────────────────────────────
remember.addEventListener('change', () => {
  const check = remember.closest('.checkbox-wrap').querySelector('.custom-check');
  check.style.background = remember.checked ? '' : 'rgba(138,92,48,.3)';
  check.querySelector('svg').style.opacity = remember.checked ? '1' : '0';
});

// ── Funções de validação ───────────────────────────────────
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const validSenha = v => v.length >= 6;

function setField(field, ok) {
  field.classList.toggle('error', !ok);
}

// Limpa erro enquanto o usuário digita
emailInput.addEventListener('input', () => {
  if (fieldEmail.classList.contains('error'))
    setField(fieldEmail, validEmail(emailInput.value));
});

senhaInput.addEventListener('input', () => {
  if (fieldSenha.classList.contains('error'))
    setField(fieldSenha, validSenha(senhaInput.value));
});

// ── Toast de notificação ───────────────────────────────────
let toastTimer;
function showToast(msg, type = 'error') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast ${type}`;
  void toast.offsetWidth; // força reflow para reiniciar animação CSS
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}

// ── Esqueceu a senha ───────────────────────────────────────
forgotLink.addEventListener('click', () => {
  showToast('📧 Link de recuperação enviado para o seu e-mail.', 'success');
});

// ── Submit / Login ─────────────────────────────────────────
btnEntrar.addEventListener('click', async () => {
  const ev = emailInput.value;
  const sv = senhaInput.value;

  const eo = validEmail(ev);
  const so = validSenha(sv);

  setField(fieldEmail, eo);
  setField(fieldSenha, so);

  if (!eo || !so) {
    showToast('⚠️ Corrija os campos destacados.', 'error');
    return;
  }

  // Animação de loading no botão
  btnEntrar.classList.add('loading');

  try {
    const response = await fetch('http://:5550/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ev, password: sv })
    });

    const data = await response.json();
    btnEntrar.classList.remove('loading');

    if (response.ok && data.user.tipo_usuario === 'confeiteiro') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      showToast('✓ Login realizado com sucesso!', 'success');
      emailInput.value = '';
      senhaInput.value = '';
      setTimeout(() => {
        window.location.href = 'PainelVendedor.html';
      }, 900);
    } else {
      showToast('✗ E-mail ou senha incorretos.', 'error');
      setField(fieldEmail, false);
      setField(fieldSenha, false);
    }
  } catch (error) {
    btnEntrar.classList.remove('loading');
    console.error('Erro:', error);
    showToast('Erro de conexão', 'error');
  }
});

// ── Tecla Enter nos campos ─────────────────────────────────
[emailInput, senhaInput].forEach(el =>
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') btnEntrar.click();
  })
);