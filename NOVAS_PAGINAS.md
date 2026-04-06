# 🎉 Novas Páginas - UniCake

## Resumo das Implementações

Foram criadas **4 novas páginas** com sistema completo de busca, promoções, detalhes de loja e detalhe de produto.

---

## 📋 Páginas Criadas

### 1. **Página de Busca Avançada** 🔍
**Arquivo:** `html/busca.html`

#### Características:
- ✅ Barra de busca principal integrada no navbar
- ✅ Filtro por categorias (Bolos, Cupcakes, Tortas, Doces, Cookies, Kits)
- ✅ Filtro por preço (range slider)
- ✅ Filtro por avaliação (3-5 estrelas)
- ✅ Ordenação (Relevância, Menor Preço, Maior Preço, Avaliação)
- ✅ Grid de produtos responsivo
- ✅ Indicador de quantidade de resultados

**Busca por:** Produtos, lojas, categorias

---

### 2. **Página de Promoções** 🎉
**Arquivo:** `html/promocoes.html`

#### Características:
- ✅ Card de promoções com badge de desconto
- ✅ Filtro por tipo (Produtos / Lojas)
- ✅ Exibe preço original e preço promocional
- ✅ Avaliação de loja/produto
- ✅ Animação ao carregar cards
- ✅ 12+ promoções cadastradas

**Dados inclusos:**
- Promoções de produtos com descontos de 20-30%
- Promoções de lojas com ofertas especiais

---

### 3. **Página de Detalhe da Loja** 🏪
**Arquivo:** `html/loja-detalhe.html`

#### Características:
- ✅ Header com banner e informações principais da loja
- ✅ Avaliação em estrelas (máximo 5 ⭐)
- ✅ Tempo médio de entrega
- ✅ Endereço completo
- ✅ Descrição detalhada da loja
- ✅ Sidebar com informações:
  - Botão de contato
  - Horário de funcionamento
  - Taxa de entrega
- ✅ Grid de produtos filtráveis por categoria
- ✅ Links para detalhe de cada produto

**URLs dinâmicas:** `loja-detalhe.html?id={lojaId}`

---

### 4. **Página de Detalhe do Produto** 📦
**Arquivo:** `html/produto-detalhe.html`

#### Características Principais:
- ✅ Galeria de imagens (emoji como placeholder)
- ✅ Informações completas do produto:
  - Nome, avaliação, preço base
  - Descrição detalhada
  - Loja vendedora
  - Tempo de entrega médio

#### **Sistema de Opções Customizáveis** 🎯
Cada produto pode ter até 3 grupos de opções:

**Tipos de Opções:**
1. **RÁDIO (Seleção única):**
   - Sabor (p.ex: Chocolate ao leite, Amargo, Branco)
   - Recheio (p.ex: Brigadeiro, Geleia, Doce de Leite)
   - Cobertura (p.ex: Chocolate, Ganache)
   - Tamanho (Pequeno, Médio, Grande)

2. **CHECKBOX (Seleção múltipla):**
   - Extras (p.ex: Granulado, Frutas Frescas)
   - Decorações (p.ex: Pétalas, Calda, Furro)

#### **Cálculo de Preços Dinâmico:**
```
- Preço base: R$ X.XX
  + Opções selecionadas: R$ Y.YY
  × Quantidade: 1+
  __________________________
  Subtotal: R$ Z.ZZ
  + Taxa Entrega: R$ 5.00
  = TOTAL: R$ FINAL
```

#### **Controles:**
- ✅ Seletor de quantidade (+/−)
- ✅ Resumo de pedido em tempo real
- ✅ Botão "Adicionar ao Carrinho"
- ✅ Botão "Comprar Agora"
- ✅ Card com informação da loja vendedora

**URLs dinâmicas:** `produto-detalhe.html?id={produtoId}&loja={lojaId}`

---

## 🎨 Design e Cores

Todas as páginas seguem o padrão de cores da home:

```css
--cream: #f5ede3       /* Fundo claro */
--brown: #7a5c44       /* Marrom principal */
--brown-dark: #5c3d2e  /* Marrom escuro */
--pink: #e07b9a        /* Destaque (preços, links) */
--sand: #c9a882        /* Tons neutros */
```

---

## 📁 Arquivos Criados

### HTML (4 arquivos)
```
html/
├── busca.html          (Página de busca avançada)
├── promocoes.html      (Página de promoções)
├── loja-detalhe.html   (Detalhe da loja)
└── produto-detalhe.html (Detalhe do produto)
```

### CSS (4 arquivos)
```
css/
├── busca.css           (Estilos da busca)
├── promocoes.css       (Estilos das promoções)
├── loja-detalhe.css    (Estilos da loja)
└── produto-detalhe.css (Estilos do produto)
```

### JavaScript (4 arquivos)
```
js/
├── busca.js            (Lógica de filtros e busca)
├── promocoes.js        (Gerenciamento de promoções)
├── loja-detalhe.js     (Carregamento de produtos da loja)
└── produto-detalhe.js  (Sistema de opções e cálculo de preço)
```

---

## 🔗 Navegação Integrada

### Navbar Atualizado (index.html)
Adicionados dois botões na navegação principal:
- 🔍 **Buscar** → `/html/busca.html`
- 🎉 **Promoções** → `/html/promocoes.html`

### Fluxo de Navegação:
```
Home
 ├─→ Buscar (busca.html)
 │    └─→ Produto (produto-detalhe.html)
 │
 ├─→ Promoções (promocoes.html)
 │    ├─→ Produto (produto-detalhe.html)
 │    └─→ Loja (loja-detalhe.html)
 │
 └─→ Lojas Cadastradas (paginalojas.html)
      └─→ Loja (loja-detalhe.html)
           └─→ Produto (produto-detalhe.html)
```

---

## 💾 Base de Dados (Estrutura JS)

### Produtos (busca.js)
- 23 produtos cadastrados
- Informações: nome, categoria, preço, avaliação, loja
- Integração com emoji de representação

### Promoções (promocoes.js)
- 12 promoções ativas
- Tipo: produto ou loja
- Descontos de 15-50%

### Lojas (loja-detalhe.js)
- 6 lojas cadastradas
- 3-4 produtos por loja
- Informações: nome, endereço, avaliação, tempo de entrega

### Opções de Produtos (produto-detalhe.js)
- Configuração completa para 10 produtos
- Cada produto pode ter até 3 grupos de opções
- Suporte a preços adicionais por opção

---

## ✨ Recursos Especiais

### 🎯 Busca Inteligente
- Busca em tempo real
- Filtra por nome, loja e categoria
- Múltiplos critérios simultâneos

### ⭐ Sistema de Avaliação
- Display em estrelas (★)
- Escala de 0 a 5
- Integrado em todas as páginas

### 💰 Cálculo de Preços
- Dinâmico baseado em opções selecionadas
- Suporta desconto e acréscimo
- Exibe valores parciais em tempo real

### 📱 Responsivo
- Adaptado para desktop e mobile
- Grid fluente
- Navbar compilável

### 🎨 Animações
- Cards com delay sequencial
- Transições suaves
- Efeitos hover elegantes

---

## 🚀 Como Usar

### Acessar Busca:
1. Clique em "🔍 Buscar" no navbar
2. Use os filtros para refinar busca
3. Clique em "Ver Detalhes" para abrir produto

### Acessar Promoções:
1. Clique em "🎉 Promoções" no navbar
2. Filtre por tipo (Produtos/Lojas)
3. Clique em "Ver Produto" ou "Ir para Loja"

### Acessar Detalhe de Loja:
1. Navegue via "Lojas Cadastradas"
2. Clique em "Ver cardápio"
3. Selecione um produto

### Detalhe de Produto:
1. Acesse via busca, promoções ou loja
2. Selecione opções personalizadas (se houver)
3. Ajuste quantidade
4. Clique em "Adicionar ao Carrinho"

---

## 📝 Notas Importantes

- ✅ Nenhuma página existente foi alterada
- ✅ Padrões de cores mantidos
- ✅ Design consistente com rest do site
- ✅ Navegação intuitiva
- ✅ Suporte a múltiplas opções por produto
- ✅ Cálculos de preço em tempo real
- ✅ Sistema de dados em JavaScript (facilita futura integração com backend)

---

## 🎁 Dados de Exemplo

### Categorias:
Bolos, Cupcakes, Tortas, Doces Gourmet, Cookies & Brownies, Kits Festa

### Lojas:
1. Doce Encanto
2. Cake & Love
3. Confeitaria Bella
4. Sweet Dreams
5. Padaria Central
6. Ateliê do Bolo

### Tempo de Entrega Médio:
20-60 minutos dependendo da loja

### Taxa de Entrega:
R$ 5,00 (Grátis acima de R$ 100)

---

**Criado em:** 2025  
**Versão:** 1.0  
**Status:** ✅ Pronto para Uso
