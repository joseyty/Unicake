const PRICES = {
    monthly: {
      pro:  { int:'49', period:'/mês · cobrado mensalmente', old:'' },
      prem: { int:'99', period:'/mês · cobrado mensalmente', old:'' },
    },
    annual: {
      pro:  { int:'39', period:'/mês · cobrado anualmente',  old:'De R$ 49,90/mês' },
      prem: { int:'79', period:'/mês · cobrado anualmente',  old:'De R$ 99,90/mês' },
    },
  };

  let billing = 'monthly';
  let selectedPlanKey = ''; // Armazenar qual plano foi selecionado


  function setBilling(type) {
    billing = type;
    const p = PRICES[type];

    document.getElementById('toggle-monthly').classList.toggle('active', type === 'monthly');
    document.getElementById('toggle-annual').classList.toggle('active',  type === 'annual');

    document.getElementById('pro-int').textContent    = p.pro.int;
    document.getElementById('pro-period').textContent = p.pro.period;
    document.getElementById('pro-old').textContent    = p.pro.old;

    document.getElementById('prem-int').textContent    = p.prem.int;
    document.getElementById('prem-period').textContent = p.prem.period;
    document.getElementById('prem-old').textContent    = p.prem.old;

    showToast(type === 'annual' ? '🎉 Plano anual selecionado! Você economiza 20%' : 'Plano mensal selecionado');
  }

  

  const PLANS = {
    gratuito: {
      icon:'🆓', title:'Plano Gratuito!', tag:'Gratuito',
      msg:'Acesso liberado imediatamente. Sem cartão necessário.',
      getPrice: () => 'R$ 0,00/mês',
      features: ['Análise crítica diária', 'Lucro e perda do dia', 'Resumo de transações'],
    },
    profissional: {
      icon:'👑', title:'Plano Profissional!', tag:'Profissional',
      msg:'Ótima escolha! Acesso completo a metas, relatórios mensais e muito mais.',
      getPrice: () => billing === 'monthly' ? 'R$ 49,90/mês' : 'R$ 39,90/mês (anual)',
      features: ['Análise mensal', 'Metas de vendas', 'Promoções e cupons', 'Até 3 colaboradores'],
    },
    premium: {
      icon:'💎', title:'Plano Premium!', tag:'Premium',
      msg:'Acesso total. Inteligência completa para maximizar seus lucros.',
      getPrice: () => billing === 'monthly' ? 'R$ 99,90/mês' : 'R$ 79,90/mês (anual)',
      features: ['Tudo do Profissional', 'Análise por preços', 'Consulta de valores futuros', 'Dicas de lucro por produto', 'Suporte prioritário 24h'],
    },
  };

  

  function selectPlan(planKey) {
    selectedPlanKey = planKey; // Armazenar o plano selecionado
    const plan = PLANS[planKey];

    document.getElementById('ov-icon').textContent  = plan.icon;
    document.getElementById('ov-title').textContent = plan.title;
    document.getElementById('ov-tag').textContent   = plan.tag;
    document.getElementById('ov-msg').textContent   = plan.msg;

    
    const summary = document.getElementById('ov-summary');
    summary.innerHTML = `
      <div class="overlay-summary-row" style="flex-direction:column; align-items:flex-start; gap:4px;">
        ${plan.features.map(f => `<span style="font-size:.82rem;">✓ ${f}</span>`).join('')}
      </div>
      <div class="overlay-summary-row overlay-summary-row--total">
        <span>Valor</span>
        <span>${plan.getPrice()}</span>
      </div>`;

    document.getElementById('overlay').classList.add('show');
  }

  function closeOverlay() {
    const overlay = document.getElementById('overlay');
    
    
    if (selectedPlanKey && selectedPlanKey !== 'gratuito') {
      overlay.classList.remove('show');
      
      localStorage.setItem('selectedPlan', selectedPlanKey);
      window.location.href = '../html/Pagamento.html?plan=' + selectedPlanKey;
    } else if (selectedPlanKey === 'gratuito') {
      
      alert('🎉 Bem-vindo ao UniCake! Sua conta será criada sem necessidade de pagamento.');
      overlay.classList.remove('show');
      selectedPlanKey = '';
    } else {
      
      overlay.classList.remove('show');
    }
  }

  
  function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  }


  let toastTimer;

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
