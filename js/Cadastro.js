// ─────────────────────────────────────────
//  !!!!!!!!!!!!!!!!!!!!!!FAZER A SEGURANÇA POR UM MEIO SEGURO MAIS!!!!!!!!!!!!!!!!!!!!!!!!!
// ─────────────────────────────────────────


const ICON_EYE_OPEN = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;


const ICON_EYE_CLOSED = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
             a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8
             a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`;

/**
 
 * @param {HTMLInputElement} input   
 * @param {HTMLButtonElement} button 
 */
function togglePasswordVisibility(input, button) {
  const isHidden = input.type === 'password';

  input.type        = isHidden ? 'text' : 'password';
  button.innerHTML  = isHidden ? ICON_EYE_CLOSED : ICON_EYE_OPEN;
  button.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
}


document.querySelectorAll('.field__input[type="password"]').forEach((input) => {

  
  const toggleBtn = document.createElement('button');
  toggleBtn.type        = 'button';
  toggleBtn.className   = 'field__toggle-btn';
  toggleBtn.innerHTML   = ICON_EYE_OPEN;
  toggleBtn.setAttribute('aria-label', 'Mostrar senha');

 
  toggleBtn.addEventListener('click', () => {
    togglePasswordVisibility(input, toggleBtn);
  });

 
  const wrapper = document.createElement('div');
  wrapper.className = 'field__input-wrapper';
  input.classList.add('field__input--has-toggle');

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  wrapper.appendChild(toggleBtn);
});



function showSuccessFeedback() {
  
  const overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  overlay.innerHTML = `
    <div class="success-box">
      <div class="success-icon">✓</div>
      <p class="success-title">Cadastro realizado!</p>
      <p class="success-msg">Bem-vindo(a) à nossa comunidade 🎉</p>
    </div>`;

  
  document.querySelector('.card').appendChild(overlay);

 
  setTimeout(() => {
    overlay.classList.add('success-overlay--hide');
    overlay.addEventListener('transitionend', () => overlay.remove());
    // Redirect to login page after success
    setTimeout(() => window.location.href = 'Entrar.html', 400);
  }, 3000);
}


document.querySelector('.btn-primary').addEventListener('click', async () => {
  const nome = document.getElementById('input-nome').value.trim();
  const email = document.getElementById('input-email').value.trim();
  const senha = document.getElementById('input-senha').value;
  const confirmar = document.getElementById('input-confirmar').value;

  // Validação básica
  if (!nome || !email || !senha || !confirmar) {
    alert('Preencha todos os campos');
    return;
  }
  if (senha !== confirmar) {
    alert('As senhas não coincidem');
    return;
  }
  if (senha.length < 6) {
    alert('A senha deve ter pelo menos 6 caracteres');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password: senha, tipo_usuario: 'cliente' })
    });

    const data = await response.json();
    if (response.ok) {
      showSuccessFeedback();
    } else {
      alert(data.error || 'Erro ao cadastrar');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro de conexão');
  }
});




const style = document.createElement('style');
style.textContent = `

  /* Wrapper do input com botão de olho */
  .field__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .field__input--has-toggle {
    padding-right: 40px;
  }

  /* Botão mostrar/ocultar senha */
  .field__toggle-btn {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--color-icon, #8b5a35);
    display: flex;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .field__toggle-btn:hover { opacity: 1; }
  .field__toggle-btn svg   { width: 18px; height: 18px; }

  /* Overlay de sucesso */
  .success-overlay {
    position: absolute;
    inset: 0;
    background: rgba(80, 40, 10, 0.55);
    backdrop-filter: blur(4px);
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    animation: fade-in 0.3s ease both;
    transition: opacity 0.4s ease;
  }

  .success-overlay--hide { opacity: 0; }

  @keyframes fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Caixa central de sucesso */
  .success-box {
    background: linear-gradient(160deg, #d4a070, #c08050);
    border-radius: 20px;
    padding: 36px 32px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(80, 40, 10, 0.4);
    animation: pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  @keyframes pop-in {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  /* Ícone de check */
  .success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #4caf50;
    color: #fff;
    font-size: 2rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
  }

  .success-title {
    font-family: 'Baloo 2', cursive;
    font-size: 1.4rem;
    font-weight: 800;
    color: #4a2e1a;
    margin-bottom: 6px;
  }

  .success-msg {
    font-size: 0.88rem;
    font-weight: 600;
    color: #5c3820;
  }
`;

document.head.appendChild(style);