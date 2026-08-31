# Configuração do Login com Google - UniCake

## Passo 1: Criar um Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** > **Credentials**

## Passo 2: Criar Credenciais OAuth 2.0

1. Clique em **"+ Create Credentials"** > **OAuth client ID**
2. Selecione **Web application**
3. No campo **Name**, digite algo como "UniCake Web App"
4. Em **Authorized JavaScript origins**, adicione:
   - `http://localhost:3000` (para desenvolvimento)
   - `http://localhost:8000`
   - `http://localhost` 
   - Seu domínio de produção quando disponível

5. Em **Authorized redirect URIs**, adicione:
   - `http://localhost:3000` (para desenvolvimento)
   - Seu URL de produção quando disponível

6. Clique em **Create**

## Passo 3: Obter o Client ID

1. Copie o **Client ID** gerado (algo como: `123456789-abcdefg.apps.googleusercontent.com`)

## Passo 4: Configurar no Código

### Opção A: No arquivo `auth.js` (Recomendado)

Abra `/assets/js/auth.js` e substitua:

```javascript
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
```

Por:

```javascript
const GOOGLE_CLIENT_ID = "SEU_CLIENT_ID_AQUI";
```

### Opção B: No arquivo `pages.js`

Abra `/assets/js/pages.js` e encontre a linha:

```javascript
client_id: "YOUR_GOOGLE_CLIENT_ID_HERE",
```

E substitua por:

```javascript
client_id: "SEU_CLIENT_ID_AQUI",
```

## Passo 5: Testar

1. Abra a página de login: `html/Entrar.html`
2. Clique no botão "Entrar com Google"
3. Selecione sua conta Google
4. Você deve ser redirecionado para a página inicial após autenticação bem-sucedida

## ⚠️ Importante para Produção

- **Nunca** coloque seu Client Secret no código frontend (apenas no backend)
- Use apenas o Client ID (que é público e seguro de expor)
- Implemente validação de token no backend (quando tiver um)
- Armazene tokens com segurança (usamos localStorage neste exemplo simples)

## Funcionalidades Implementadas

✅ Login com Email/Senha (simulado - conecte com seu backend)
✅ Login com Google
✅ Armazenamento seguro de dados do usuário
✅ Redirecionamento automático após login
✅ Mensagens de status

## Estrutura de Dados do Usuário

Quando um usuário faz login, seus dados são armazenados em localStorage:

```json
{
  "id": "google_unique_id",
  "name": "Nome do Usuário",
  "email": "usuario@email.com",
  "picture": "https://...",
  "provider": "google",
  "loginTime": "2024-01-01T12:00:00.000Z"
}
```

## APIs Disponíveis

Use `window.UniCakeAuth` para acessar:

```javascript
// Verificar se está logado
if (UniCakeAuth.isLoggedIn()) {
  // Usuário está logado
}

// Obter dados do usuário
const user = UniCakeAuth.getUser();
console.log(user.name, user.email);

// Fazer logout
UniCakeAuth.logout();
```

## Próximos Passos

1. Integre o backend com seu API de autenticação
2. Implemente persistência de sessão no servidor
3. Valide tokens JWT no backend
4. Configure CORS para permitir requisições do frontend
5. Implemente refresh tokens para segurança
