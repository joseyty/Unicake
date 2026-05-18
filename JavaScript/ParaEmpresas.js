document.addEventListener('DOMContentLoaded', () => {


  const planBtns = document.querySelectorAll('.btn-plan');
  planBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.plan-card');
      const planName = card.querySelector('.plan-name').textContent.trim();

      document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('plan-card--selected'));
      card.classList.add('plan-card--selected');

     
      const ctaBar = document.querySelector('.cta-bar');
      if (ctaBar) {
        ctaBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      showToast(`Plano "${planName}" selecionado! Solicite seu orçamento abaixo.`);
    });
  });

 
  const btnOrcamento = document.querySelector('.btn-orcamento');
  if (btnOrcamento) {
    btnOrcamento.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Em breve nossa equipe entrará em contato! 🍰');
    });
  }

  
  function showToast(msg) {
    let toast = document.getElementById('pe-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pe-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: '#5c3220',
        color: '#fff',
        padding: '0.75rem 1.4rem',
        borderRadius: '12px',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '0.85rem',
        fontWeight: '500',
        boxShadow: '0 6px 24px rgba(92,50,32,.25)',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity .3s, transform .3s',
        maxWidth: '90vw',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      });
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3200);
  }

});