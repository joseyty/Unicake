# 🚀 Guia Rápido - Novas Funcionalidades UniCake

## ⚡ Como Acessar as Novas Páginas

### 1️⃣ Página de Busca (com categorias)
```
URL: html/busca.html
Botão: 🔍 Buscar (no navbar da Home)
```
**O que você pode fazer:**
- 🔍 Buscar produtos por nome ou loja
- 📂 Filtrar por 6 categorias de doces
- 💰 Filtrar por preço (range slider)
- ⭐ Filtrar por avaliação (3-5 estrelas)
- 📊 Ordenar resultados
- Clicar em produto → vai para detalhe

---

### 2️⃣ Página de Promoções
```
URL: html/promocoes.html
Botão: 🎉 Promoções (no navbar da Home)
```
**O que você pode fazer:**
- 🎁 Ver 12+ ofertas ativas
- 📋 Filtrar: Todos / Só Produtos / Só Lojas
- 💸 Ver preço original e desconto
- Clicar em promoção → vai para produto ou loja

---

### 3️⃣ Página da Loja (com produtos)
```
URL: html/loja-detalhe.html?id={1a6}
Como acessar:
  a) Clique em "Ver cardápio" (em Lojas Cadastradas)
  b) Clique em promoção de loja
```
**O que você vê:**
- 🏪 Nome, avaliação (⭐), endereço, tempo de entrega
- 📞 Botão de contato, horário, taxa de entrega
- 📦 Produtos da loja com filtro por categoria
- Clique em produto → vai para detalhe

---

### 4️⃣ Página de Detalhe do Produto (✨ PRINCIPAL)
```
URL: html/produto-detalhe.html?id={id}&loja={id}
Como acessar:
  a) Busca → Clique em produto
  b) Promoções → Clique em produto
  c) Loja → Clique em produto
```

#### **🎯 Funcionalidades Principais:**

**A. Seleção de Opções**
```
Cada produto pode ter até 3 grupos:
  • RÁDIO (1 opção): Sabor, Recheio, Cobertura, Tamanho
  • CHECKBOX (múltiplos): Extras, Decorações
```

**Exemplos de Opções:**
- Bolo de Chocolate:
  - Sabor: Ao Leite / Amargo / Branco ✅ 
  - Recheio: Brigadeiro / Geleia / Doce de Leite ✅
  - Cobertura: Granulado / Confete / Frutas ✅

**B. Cálculo de Preço Dinâmico**
```
Preço base     R$ 45.00
+ Recheio      R$ 3.00
+ Cobertura    R$ 1.50
__________________________
Subtotal (×qty) R$ 49.50
+ Taxa entrega  R$ 5.00
= TOTAL         R$ 54.50
```

**C. Controles**
- ➕ ➖ Aumenta/diminui quantidade
- 🛒 Adicionar ao Carrinho (com confirmação)
- 💳 Comprar Agora (vai para pagamento)

**D. Informações**
- ⭐ Avaliação do produto
- ⏱️ Tempo médio de entrega
- 🏪 Loja vendedora (com link para ir até ela)

---

## 📊 Dados Disponíveis

### Lojas (6 no total)
```
id  Nome                    Avaliação  Entrega
1   Doce Encanto           ⭐⭐⭐⭐⭐ 4.8   30-45min
2   Cake & Love            ⭐⭐⭐⭐⭐ 4.9   25-40min
3   Confeitaria Bella      ⭐⭐⭐⭐☆ 4.7   35-50min
4   Sweet Dreams           ⭐⭐⭐⭐⭐ 5.0   40-55min
5   Padaria Central        ⭐⭐⭐⭐☆ 4.5   20-30min
6   Ateliê do Bolo         ⭐⭐⭐⭐⭐ 4.9   45-60min
```

### Categorias de Produtos
- 🍰 **Bolos** (6 tipos): Chocolate, Morango, Cenoura, Red Velvet, Limão, Coco
- 🧁 **Cupcakes** (4 tipos): Chocolate, Baunilha, Morango, Red Velvet
- 🥧 **Tortas** (3 tipos): Maçã, Limão, Chocolate & Banana
- 🍫 **Doces** (4 tipos): Brigadeiro, Beijinho, Olho de Sogra, Trufa
- 🍪 **Cookies** (3 tipos): Chocolate, Brownie, Aveia
- 🎉 **Kits Festa** (3 tipos): Cupcakes, Cookies, Bolo + Cupcakes

### Preços (aproximadamente)
```
Bolos:      R$ 40-52
Cupcakes:   R$ 7-9 (unitário)
Tortas:     R$ 50-55
Doces:      R$ 2-5
Cookies:    R$ 5-7
Kits:       R$ 85-120
```

---

## 🎨 Padrão Visual

### Cores Mantidas
```
Fundo:       #f5ede3 (creme claro)
Marrom:      #7a5c44 (principal)
Marrom Esc:  #5c3d2e (títulos)
Destaque:    #e07b9a (preços, links)
```

### Tipografia
- **Títulos**: Baloo 2 (bold)
- **Corpo**: Poppins (regular)
- **Logo**: Playfair Display (italicized)

---

## ✅ Checklist de Funcionalidades

- [x] Página de busca com filtros
  - [x] Busca por texto
  - [x] Filtro por categoria (6 opções)
  - [x] Filtro por preço
  - [x] Filtro por avaliação
  - [x] Ordenação (por preço e avaliação)

- [x] Página de promoções
  - [x] 12+ promoções cadastradas
  - [x] Filtro por tipo (Produtos/Lojas)
  - [x] Badge com % de desconto
  - [x] Links para detalhe

- [x] Página de loja
  - [x] Informações completas da loja
  - [x] Avaliação em ⭐ (máx 5)
  - [x] Tempo de entrega
  - [x] Endereço
  - [x] Horário de funcionamento
  - [x] Taxa de entrega
  - [x] Produtos filtráveis

- [x] Página de produto (COMPLETA)
  - [x] Imagem (emoji atualmente)
  - [x] Nome, avaliação, preço
  - [x] Descrição
  - [x] **Opções customizáveis** (recheios, sabores, coberturas)
  - [x] Cálculo de preço dinâmico
  - [x] Controle de quantidade
  - [x] Carrinho e pagamento
  - [x] Informações de entrega
  - [x] Loja vendedora

---

## 🔗 URLs Rápidas

| Página | URL |
|--------|-----|
| Busca | `/html/busca.html` |
| Promoções | `/html/promocoes.html` |
| Loja #1 | `/html/loja-detalhe.html?id=1` |
| Loja #2 | `/html/loja-detalhe.html?id=2` |
| Loja #3 | `/html/loja-detalhe.html?id=3` |
| Loja #4 | `/html/loja-detalhe.html?id=4` |
| Loja #5 | `/html/loja-detalhe.html?id=5` |
| Loja #6 | `/html/loja-detalhe.html?id=6` |
| Produto #1 | `/html/produto-detalhe.html?id=1` |
| Produto #2 | `/html/produto-detalhe.html?id=2` |

---

## 💡 Dicas

### Para Testar Opções de Produto
1. Vá para qualquer produto na busca ou promoções
2. Veja as opções disponíveis aparecerem
3. Mude seleções → O preço atualiza em tempo real ✨
4. Aumente quantidade → Subtotal muda
5. Veja o total com taxa de entrega

### Para Testar Filtros
1. **Busca**: Use o slider de preço, marque categorias
2. **Promoções**: Clique em "Produtos" ou "Lojas"
3. **Loja**: Filtre por categoria de produto

### Para Testar Links
- Cada página volta para Home no logo
- Cada produto leva para detalhe
- Cada loja tem seus produtos
- Tudo é interconectado

---

## 📞 Suporte

Se notar algo que não funciona:
1. Abra o console (`F12`)
2. Verifique se há erros
3. Tem as imagens carregando? (atualmente usando emoji)
4. URLs estão corretas?

---

**Desenvolvido com ❤️ para UniCake**  
**Versão:** 1.0  
**Última atualização:** 6 de Abril de 2025
