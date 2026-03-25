  
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

    function setupToggle(inputId, btnId) {
      const input = document.getElementById(inputId);
      const btn   = document.getElementById(btnId);
      btn.innerHTML = ICON_EYE_OPEN;
      btn.addEventListener('click', () => {
        const hidden = input.type === 'password';
        input.type     = hidden ? 'text' : 'password';
        btn.innerHTML  = hidden ? ICON_EYE_CLOSED : ICON_EYE_OPEN;
        btn.setAttribute('aria-label', hidden ? 'Ocultar senha' : 'Mostrar senha');
      });
    }

    setupToggle('input-nova-senha',      'toggle-nova');
    setupToggle('input-confirmar-senha', 'toggle-confirmar');

  
    let currentStep = 1;

    function goToStep(step) {
     
      document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + step).classList.add('active');

  
      for (let i = 1; i <= 3; i++) {
        const dot = document.getElementById('dot-' + i);
        const lbl = document.getElementById('lbl-' + i);
        dot.classList.remove('active', 'done');
        lbl.classList.remove('active');

        if (i < step)       { dot.classList.add('done'); dot.innerHTML = '✓'; }
        else if (i === step){ dot.classList.add('active'); dot.innerHTML = i; lbl.classList.add('active'); }
        else                { dot.innerHTML = i; }
      }

      
      for (let i = 1; i <= 2; i++) {
        const line = document.getElementById('line-' + i);
        line.classList.toggle('done', i < step);
      }

    
      const subs = [
        'Sem problema! Vamos te ajudar<br>a recuperar seu acesso 😊',
        'Verifique seu e-mail e insira<br>o código de 6 dígitos 📬',
        'Escolha uma senha forte<br>e segura para sua conta 🔒'
      ];
      document.getElementById('card-subtitle').innerHTML = subs[step - 1];

      currentStep = step;
    }

  
    document.getElementById('btn-step1').addEventListener('click', () => {
      const email = document.getElementById('input-email').value.trim();
      if (!email || !email.includes('@')) {
        document.getElementById('input-email').focus();
        return;
      }
      goToStep(2);
      startTimer();
    });


    const otpInputs = document.querySelectorAll('.otp-input');

    otpInputs.forEach((inp, idx) => {
      inp.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[val.length - 1] : '';
        e.target.classList.toggle('filled', !!e.target.value);
        if (val && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && idx > 0) {
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].value = '';
          otpInputs[idx - 1].classList.remove('filled');
        }
      });

      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        paste.split('').slice(0, 6).forEach((ch, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = ch;
            otpInputs[i].classList.add('filled');
          }
        });
        otpInputs[Math.min(paste.length, 5)].focus();
      });
    });

    
    let timerInterval;

    function startTimer() {
      const btn    = document.getElementById('resend-btn');
      const timerEl = document.getElementById('timer');
      let seconds  = 30;

      btn.disabled  = true;
      timerEl.textContent = seconds;
      btn.textContent = '';
      btn.appendChild(document.createTextNode('Reenviar ('));
      btn.appendChild(timerEl);
      btn.appendChild(document.createTextNode('s)'));

      clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        seconds--;
        timerEl.textContent = seconds;
        if (seconds <= 0) {
          clearInterval(timerInterval);
          btn.disabled = false;
          btn.textContent = 'Reenviar código';
        }
      }, 1000);
    }

    document.getElementById('resend-btn').addEventListener('click', () => {
      otpInputs.forEach(i => { i.value = ''; i.classList.remove('filled'); });
      otpInputs[0].focus();
      startTimer();
    });

    
    document.getElementById('btn-step2').addEventListener('click', () => {
      const code = Array.from(otpInputs).map(i => i.value).join('');
      if (code.length < 6) {
        otpInputs[code.length] && otpInputs[code.length].focus();
        return;
      }
      goToStep(3);
    });

   
    document.getElementById('input-nova-senha').addEventListener('input', function () {
      const val = this.value;
      const segs = [document.getElementById('seg1'), document.getElementById('seg2'),
                    document.getElementById('seg3'), document.getElementById('seg4')];
      const label = document.getElementById('strength-label');

      let score = 0;
      if (val.length >= 8)              score++;
      if (/[A-Z]/.test(val))            score++;
      if (/[0-9]/.test(val))            score++;
      if (/[^A-Za-z0-9]/.test(val))    score++;

      const map  = ['', 'weak', 'medium', 'strong', 'strong'];
      const lbls = ['', 'Fraca 😬', 'Razoável 🙂', 'Boa 💪', 'Forte 🔐'];
      const cls  = map[score];

      segs.forEach((s, i) => {
        s.className = 'strength-bar__seg';
        if (i < score) s.classList.add(cls);
      });

      label.textContent = val.length ? lbls[score] : '';
    });

    document.getElementById('btn-step3').addEventListener('click', () => {
      const nova      = document.getElementById('input-nova-senha').value;
      const confirmar = document.getElementById('input-confirmar-senha').value;

      if (nova.length < 6 || nova !== confirmar) {
        document.getElementById('input-confirmar-senha').focus();
        return;
      }
      showSuccess();
    });

     function showSuccess() {
      const overlay = document.createElement('div');
      overlay.className = 'success-overlay';
      overlay.innerHTML = `
        <div class="success-box">
          <div class="success-icon">✓</div>
          <p class="success-title">Senha redefinida!</p>
          <p class="success-msg">Agora é só entrar e aproveitar 🍪</p>
        </div>`;

      document.querySelector('.card').appendChild(overlay);

      setTimeout(() => {
        overlay.classList.add('success-overlay--hide');
        overlay.addEventListener('transitionend', () => overlay.remove());
      }, 3000);
    }
