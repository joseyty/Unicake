# 🎉 Login com Google + Carrinho de Compras (COMPLETO)

## ✅ O que foi implementado

### Sessão Persistente
- ✅ Login salvo em localStorage
- ✅ Usuário permanece logado ao abrir outras páginas
- ✅ Sessão restaurada automaticamente
- ✅ Nome + foto do usuário no header
- ✅ Botão "Sair" funcional

### Proteção de Páginas
- ✅ Páginas de checkout/pedidos protegidas
- ✅ Redireciona para login se não autenticado
- ✅ Redirecionamento de volta após login

## 🚀 Como Funciona (Resumido)

### 1️⃣ Usuário acessa o site
```
❌ Sem login → Vê "Entrar" no header
✅ Com login → Vê seu nome + foto
```

### 2️⃣ Usuário faz compras
```
Clica em "Comprar"
  ↓
Verifica se está logado
  ↓
✅ Sim? Abre carrinho
❌ Não? Redireciona para login
```

### 3️⃣ Usuário faz logout
```
Clica em "Sair"
  ↓
Apaga sessão
  ↓
Redireciona para login
```

## 📝 Como Usar em Páginas de Compra

### No seu arquivo HTML de checkout:
```html
<body data-page="checkout">
  <!-- Seu conteúdo -->
  
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/session-guard.js"></script>
</body>
```

### No seu JavaScript:
```javascript
// Obter dados do usuário
const user = window.UniCakeAuth.getUser();
console.log(user.name, user.email);

// Enviar para backend
fetch("/api/compras", {
  method: "POST",
  headers: { "Authorization": `Bearer ${user.id}` },
  body: JSON.stringify({ 
    itens: [...],
    usuario_email: user.email
  })
});
```

## 📊 Exemplo Completo: Página de Checkout

```html
<!DOCTYPE html>
<html>
<head>
  <title>Checkout - UniCake</title>
</head>
<body data-page="checkout">
  <div id="site-header"></div>

  <main>
    <h1>Checkout</h1>
    <div id="userInfo"></div>
    <div id="cartItems"></div>
    <button id="confirmOrder">Confirmar Compra</button>
  </main>

  <div id="site-footer"></div>

  <script src="../assets/js/core.js"></script>
  <script src="../assets/js/data.js"></script>
  <script src="../assets/js/header-footer.js"></script>
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/session-guard.js"></script>

  <script>
    // Quando a página carregar
    window.addEventListener("load", () => {
      const user = window.UniCakeAuth.getUser();
      
      // Mostrar dados do usuário
      document.getElementById("userInfo").innerHTML = `
        <h2>Comprador: ${user.name}</h2>
        <p>Email: ${user.email}</p>
      `;
    });

    // Ao confirmar compra
    document.getElementById("confirmOrder").addEventListener("click", async () => {
      const user = window.UniCakeAuth.getUser();
      
      const response = await fetch("/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario_id: user.id,
          usuario_email: user.email,
          usuario_nome: user.name,
          itens: [], // seu carrinho aqui
          data: new Date().toISOString()
        })
      });

      const resultado = await response.json();
      alert("Compra realizada com sucesso!");
      window.location.href = "index.html";
    });
  </script>
</body>
</html>
```

## 💾 Dados Salvos

Quando usuário faz login, esses dados são salvos:

```javascript
{
  id: "unique_google_id",
  name: "João Silva",
  email: "joao@example.com", // 👈 Use para salvar compra
  picture: "https://...",
  provider: "google",
  loginTime: "2024-01-15..."
}
```

## 🔧 Configuração (Uma Única Vez)

Os Client IDs já estão configurados em:
- ✅ `assets/js/auth.js` (linha 4)
- ✅ `assets/js/pages.js` (linha ~225)

Se quiser mudar, atualize ambos os arquivos com seu Client ID do Google.

## 🎯 Fluxo de Compra Completo

```
1. Usuário abre site
   ↓
2. auth.js → verifica localStorage
   ↓
3. Se logado → mostra nome no header
   Se não → mostra "Entrar"
   ↓
4. Usuário clica "Comprar"
   ↓
5. JavaScript verifica: window.UniCakeAuth.isLoggedIn()
   ↓
6. ❌ Não logado? → Redireciona para Entrar.html
   ✅ Logado? → Abre carrinho
   ↓
7. Usuário confirma compra
   ↓
8. Envia dados para backend:
   - usuario_email (do user object)
   - usuario_nome
   - lista_itens
   ↓
9. Backend salva compra associada ao email
```

## 🧪 Teste Rápido

1. Abra site
2. Clique em "Entrar" → Faça login com Google
3. Seu nome aparece no header ✅
4. Abra outra página → Sessão mantida ✅
5. Atualize a página → Ainda logado ✅
6. Clique "Sair" → Volta pra login ✅

## 📞 Resumo de APIs

```javascript
// Usar em qualquer página do site:

// 1. Verificar se está logado
if (window.UniCakeAuth.isLoggedIn()) {
  console.log("Usuário logado");
}

// 2. Obter dados
const user = window.UniCakeAuth.getUser();
// { id, name, email, picture, provider, loginTime }

// 3. Fazer logout
window.UniCakeAuth.logout();
```

## 🎉 Pronto para Usar!

Seu sistema de login + carrinho agora está completo e pronto para integrar com backend! 🚀

---

**Próximo passo:** Integrar com sua API backend para processar compras reais.
