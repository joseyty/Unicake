 const PLANS = {
      gratuito: {
        icon: '👨🏼‍💻',
        name: 'Gratuito',
        desc: 'Análise básica do expediente diário',
        price: 0,
        features: [
          'Análise crítica diária',
          'Lucro e perda do dia',
          'Resumo de transações'
        ]
      },
      profissional: {
        icon: '👑',
        name: 'Profissional',
        desc: 'Controle completo mensal com metas',
        price: 49.90,
        features: [
          'Análise crítica diária',
          'Lucro e perda do dia',
          'Resumo de transações',
          'Análise mensal',
          'Metas de vendas',
          'Promoções e cupons',
          'Suporte por e-mail'
        ]
      },
      premium: {
        icon: '💎',
        name: 'Premium',
        desc: 'Inteligência completa para maximizar lucros',
        price: 99.90,
        features: [
          'Análise crítica diária',
          'Lucro e perda do dia',
          'Resumo de transações',
          'Análise mensal',
          'Metas de vendas',
          'Promoções e cupons',
          'Análise por preços',
          'Consulta de valores futuros',
          'Dicas de lucro por produto',
          'Suporte prioritário 24h'
        ]
      }
    };

   
    function getPlanFromURL() {
      const params = new URLSearchParams(window.location.search);
      return params.get('plan') || localStorage.getItem('selectedPlan') || 'profissional';
    }

  
    function loadPlan() {
      const plan = getPlanFromURL();
      const planData = PLANS[plan];

      if (planData) {
        document.getElementById('planIcon').textContent = planData.icon;
        document.getElementById('planName').textContent = planData.name;
        document.getElementById('planDesc').textContent = planData.desc;

        const featuresList = document.getElementById('planFeatures');
        featuresList.innerHTML = planData.features.map(f => `<li>${f}</li>`).join('');

        updatePrices(planData.price);
      }
    }

   
    function updatePrices(basePrice) {
      const taxFee = basePrice > 0 ? basePrice * 0.029 : 0;
      const total = basePrice + taxFee;

      document.getElementById('subtotal').textContent = `R$ ${basePrice.toFixed(2).replace('.', ',')}`;
      document.getElementById('taxFee').textContent = `R$ ${taxFee.toFixed(2).replace('.', ',')}`;
      document.getElementById('totalPrice').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
      document.getElementById('buttonPrice').textContent = total.toFixed(2).replace('.', ',');
    }

    function toggleCardDetails() {
      const method = document.querySelector('input[name="paymentMethod"]:checked').value;
      const cardDetails = document.getElementById('cardDetails');

      if (method === 'card') {
        cardDetails.classList.add('active');
      } else {
        cardDetails.classList.remove('active');
      }
    }

    
    function updateCardPreview() {
      const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
      const cardHolder = document.getElementById('fullName').value.toUpperCase() || 'SEU NOME';
      const cardExpiry = document.getElementById('cardExpiry').value || 'MM/AA';

      
      const formatted = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').padEnd(19, '•');
      document.getElementById('cardDisplayNumber').textContent = formatted;

      document.getElementById('cardHolderDisplay').textContent = cardHolder;
      document.getElementById('cardExpiryDisplay').textContent = cardExpiry;

    
      const firstDigit = cardNumber[0];
      let logo = '💳';
      if (firstDigit === '4') logo = '🟦'; 
      if (firstDigit === '5') logo = '🔴'; 
      if (firstDigit === '3') logo = '🔷';

      document.getElementById('cardLogo').textContent = logo;
    }

    
    document.addEventListener('DOMContentLoaded', function() {
      loadPlan();

    
      document.getElementById('cardNumber').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
        updateCardPreview();
      });

      document.getElementById('cpf').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      });

      document.getElementById('phone').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      });

      document.getElementById('zipcode').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
      });

      document.getElementById('fullName').addEventListener('input', updateCardPreview);
    });

   
    function handleSubmit(event) {
      event.preventDefault();

     
      const method = document.querySelector('input[name="paymentMethod"]:checked').value;

      if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('cardExpiry').value;
        const cardCvc = document.getElementById('cardCvc').value;

        if (cardNumber.length < 13) {
          alert('❌ Número do cartão inválido');
          return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
          alert('❌ Validade inválida (use MM/AA)');
          return;
        }

        if (cardCvc.length < 3) {
          alert('❌ CVV/CVC inválido');
          return;
        }
      }

    
      const btn = event.target.querySelector('.btn-checkout');
      btn.disabled = true;
      btn.textContent = '⏳ Processando...';

      setTimeout(() => {
       
        document.getElementById('checkoutForm').style.display = 'none';
        document.getElementById('successMessage').classList.add('show');

       
        console.log('Pagamento processado com sucesso!');
      }, 2000);
    }