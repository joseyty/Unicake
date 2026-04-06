const lojas = [
  {
    nome: "Doce Encanto",
    desc: "Bolos artesanais e doces finos para festas e eventos.",
    endereco: "Rua das Flores, 123 — Centro",
    avaliacao: 4.8,
    entrega: "30-45min",
    img: ""
  },
  {
    nome: "Cake & Love",
    desc: "Cupcakes, brownies e bolos decorados sob encomenda.",
    endereco: "Av. Brasil, 456 — Boa Vista",
    avaliacao: 4.9,
    entrega: "25-40min",
    img: ""
  },
  {
    nome: "Confeitaria Bella",
    desc: "Tradição em bolos caseiros há mais de 15 anos.",
    endereco: "Rua do Comércio, 78 — Centro",
    avaliacao: 4.7,
    entrega: "35-50min",
    img: ""
  },
  {
    nome: "Sweet Dreams",
    desc: "Especialista em bolos temáticos e personalizados.",
    endereco: "Rua Nova, 210 — Jardim América",
    avaliacao: 5.0,
    entrega: "40-55min",
    img: ""
  },
  {
    nome: "Padaria Central",
    desc: "Pães, bolos e salgados fresquinhos todo dia.",
    endereco: "Praça da Matriz, 15 — Centro",
    avaliacao: 4.5,
    entrega: "20-30min",
    img: ""
  },
  {
    nome: "Ateliê do Bolo",
    desc: "Bolos esculpidos e cake design para ocasiões especiais.",
    endereco: "Rua São José, 332 — Alto da Sé",
    avaliacao: 4.9,
    entrega: "45-60min",
    img: ""
  },
];


const container = document.getElementById("lojasContainer");

function renderLojas(lista) {
  container.innerHTML = lista.length === 0
    ? '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#9e7a62;font-family:Baloo 2,cursive;font-size:1.1rem;">Nenhuma loja encontrada 😕</div>'
    : lista.map((l, i) => `
      <div class="card" style="animation-delay:${i * .07}s">
        <div style="width:100%;height:160px;background:linear-gradient(135deg,#f4d1dc,#e8d5c0);display:flex;align-items:center;justify-content:center;font-size:3rem;">🍰</div>
        <div class="card-content">
          <h3>${l.nome}</h3>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:.78rem;color:#f5b731;">★ ${l.avaliacao.toFixed(1)}</span>
            <span style="font-size:.72rem;color:#9e7a62;background:rgba(196,168,130,.2);padding:2px 8px;border-radius:20px;">${l.entrega}</span>
          </div>
          <p>${l.desc}</p>
          <p style="font-size:.75rem;color:#9e7a62;margin:0 0 12px;">📍 ${l.endereco}</p>
          <a href="loja-detalhe.html?id=${i+1}" class="btn">Ver cardápio</a>
        </div>
      </div>`).join('');
}

renderLojas(lojas);


document.getElementById("searchInput").addEventListener("input", function () {
  const q = this.value.toLowerCase().trim();
  if (!q) {
    renderLojas(lojas);
    return;
  }
  const filtradas = lojas.filter(l =>
    l.nome.toLowerCase().includes(q) ||
    l.desc.toLowerCase().includes(q) ||
    l.endereco.toLowerCase().includes(q)
  );
  
  renderLojas(filtradas);
});