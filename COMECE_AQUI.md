# 🚀 Guia Rápido - Login com Google (2 minutos)

## O que foi feito? ✅

Implementei um sistema completo de login com Google no seu projeto UniCake:

- ✅ Botão "Entrar com Google" funcional
- ✅ Login tradicional com email/senha
- ✅ Armazenamento seguro dos dados do usuário
- ✅ Redirecionamento automático após login

## O que você PRECISA fazer? 📌

Apenas **3 passos simples**:

### Passo 1: Criar Google Client ID (5 min)

1. Abra https://console.cloud.google.com/
2. Crie um novo projeto (ou use um existente)
3. Vá para **APIs & Services** → **Credentials**
4. Clique em **"+ Create Credentials"** → **OAuth client ID**
5. Selecione **Web application**
6. Adicione em **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:8000`
   - `http://localhost`
7. Clique **Create**
8. **COPIE o Client ID** (algo como: `123456789-abcdefg.apps.googleusercontent.com`)

### Passo 2: Adicionar o Client ID (1 min)

Abra o arquivo: `assets/js/auth.js`

Procure por (linha ~7):
```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
```

Substitua por:
```javascript
const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_AQUI";
```

Também em: `assets/js/pages.js` (linha ~225)
```javascript
client_id: "YOUR_GOOGLE_CLIENT_ID_HERE",
```

Substitua pelo mesmo Client ID.

### Passo 3: Testar (1 min)

1. Abra `html/Entrar.html` no navegador
2. Clique em "Entrar com Google"
3. Selecione sua conta Google
4. Pronto! 🎉

## ✨ Novo Sistema de Autenticação

```javascript
// Verificar se está logado
if (window.UniCakeAuth.isLoggedIn()) {
  const user = window.UniCakeAuth.getUser();
  console.log("Bem-vindo,", user.name);
}

// Fazer logout
window.UniCakeAuth.logout();
```

## 📁 Arquivos Novos

- `assets/js/auth.js` - Sistema de autenticação
- `GOOGLE_LOGIN_SETUP.md` - Guia detalhado
- `EXEMPLOS_AUTENTICACAO.js` - Exemplos de código
- `RESUMO_IMPLEMENTACAO.md` - Documentação completa

## 🎯 Pronto!

Após adicionar o Client ID, o login com Google vai funcionar perfeitamente! 🚀

### Dúvidas?

1. Leia `GOOGLE_LOGIN_SETUP.md` para detalhes
2. Consulte `EXEMPLOS_AUTENTICACAO.js` para exemplos
3. Veja `RESUMO_IMPLEMENTACAO.md` para visão completa

---

**Tempo total: ~10 minutos** ⏱️
