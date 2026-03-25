const lojas = [
  { nome: "Doce Sabor", descricao: "Especialistas em bolos de chocolate", imagem: "https://images.unsplash.com/photo-1605478371310-a9f1e96b4ff4", link: "#" },
  { nome: "Bolos da Vovó", descricao: "Receitas caseiras tradicionais", imagem: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", link: "#" },
  { nome: "Cake & Arte", descricao: "Bolos personalizados e gourmet", imagem: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3", link: "#" },
  { nome: "Delícias do Forno", descricao: "Bolos fresquinhos todos os dias", imagem: "https://images.unsplash.com/photo-1505253210343-dc3f4b3f8f9d", link: "#" },
  { nome: "Reino dos Bolos", descricao: "Variedade de sabores incríveis", imagem: "https://images.unsplash.com/photo-1551024601-bec78aea704b", link: "#" },
  { nome: "Bolo Mania", descricao: "Bolos criativos e diferentes", imagem: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84", link: "#" },
  { nome: "Casa do Bolo", descricao: "Clássicos que nunca saem de moda", imagem: "https://images.unsplash.com/photo-1603532648955-039310d9ed75", link: "#" },
  { nome: "Top Cakes", descricao: "Alta confeitaria", imagem: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c", link: "#" },
  { nome: "Doceria Encanto", descricao: "Sabores que conquistam", imagem: "https://images.unsplash.com/photo-1488477181946-6428a0291777", link: "#" }
];

const container = document.getElementById('lojasContainer');

function renderLojas(lista) {
  container.innerHTML = "";

  lista.forEach(loja => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${loja.imagem}" alt="${loja.nome}">
      <div class="card-content">
        <h3>${loja.nome}</h3>
        <p>${loja.descricao}</p>
        <a href="${loja.link}" class="btn">Ver loja</a>
      </div>
    `;

    container.appendChild(card);
  });
}

renderLojas(lojas);

// PESQUISA
document.getElementById("searchInput").addEventListener("keyup", function () {
  const filtro = this.value.toLowerCase();

  const filtradas = lojas.filter(loja =>
    loja.nome.toLowerCase().includes(filtro) ||
    loja.descricao.toLowerCase().includes(filtro)
  );

  renderLojas(filtradas);
});