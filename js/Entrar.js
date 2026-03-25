
// ─────────────────────────────────────────
//  !!!!!!!!!!!!!!!!!!!!!!FAZER A SEGURANÇA POR UM MEIO SEGURO MAIS!!!!!!!!!!!!!!!!!!!!!!!!!
// ─

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

    const senhaInput  = document.getElementById('input-senha');
    const toggleBtn   = document.getElementById('toggle-senha');

    
    toggleBtn.innerHTML = ICON_EYE_OPEN;

    toggleBtn.addEventListener('click', () => {
      const isHidden = senhaInput.type === 'password';

      senhaInput.type      = isHidden ? 'text' : 'password';
      toggleBtn.innerHTML  = isHidden ? ICON_EYE_CLOSED : ICON_EYE_OPEN;
      toggleBtn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
    });



    function showSuccessFeedback() {
      const overlay = document.createElement('div');
      overlay.className = 'success-overlay';
      overlay.innerHTML = `
        <div class="success-box">
          <div class="success-icon">✓</div>
          <p class="success-title">Login realizado!</p>
          <p class="success-msg">Que bom te ver por aqui 🍪</p>
        </div>`;

      document.querySelector('.card').appendChild(overlay);

    
      setTimeout(() => {
        overlay.classList.add('success-overlay--hide');
        overlay.addEventListener('transitionend', () => overlay.remove());
      }, 3000);
    }

    document.getElementById('btn-entrar').addEventListener('click', showSuccessFeedback);