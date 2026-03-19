 const cakes = [
    { id: 1, name: "Bolo de Chocolate", price: 30 },
    { id: 2, name: "Bolo de Morango", price: 35 },
    { id: 3, name: "Bolo de Cenoura", price: 25 }
  ];

  let cart = [];
  let payment = "";

  function renderCakes() {
    const container = document.getElementById('cakes');
    container.innerHTML = '';

    cakes.forEach(cake => {
      container.innerHTML += `
        <div class="cake-card">
          <div>
            <h3>${cake.name}</h3>
            <p>R$ ${cake.price}</p>
          </div>
          <button onclick="addToCart(${cake.id})">Adicionar</button>
        </div>
      `;
    });
  }

  function addToCart(id) {
    const item = cart.find(i => i.id === id);

    if (item) {
      item.quantity++;
    } else {
      const cake = cakes.find(c => c.id === id);
      cart.push({ ...cake, quantity: 1 });
    }

    renderCart();
  }

  function updateQuantity(id, change) {
    cart = cart
      .map(item => item.id === id ? { ...item, quantity: item.quantity + change } : item)
      .filter(item => item.quantity > 0);

    renderCart();
  }

  function renderCart() {
    const container = document.getElementById('cart');
    container.innerHTML = '';

    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;

      container.innerHTML += `
        <div class="cart-item">
          <div>
            <p>${item.name}</p>
            <span>R$ ${item.price}</span>
          </div>

          <div class="controls">
            <button onclick="updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
      `;
    });

    document.getElementById('total').innerText = `R$ ${total}`;
  }

  function setPayment(type) {
    payment = type;
    document.getElementById('selected').innerText = 'Forma selecionada: ' + type;
  }

  renderCakes();