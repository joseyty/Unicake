# 🔐 IMPLEMENTAÇÃO DE SEGURANÇA - CHECKLIST

## Arquivos Criados para Referência

1. ✅ `backend/security-best-practices.js` - Implementação completa de segurança
2. ✅ `SEGURANCA_BANCO_DADOS.md` - Documentação detalhada
3. ✅ `backend/.env.example` - Template seguro de variáveis

## ⚠️ PROBLEMAS DE SEGURANÇA ATUAIS

### 1. Dados de Admin em Código (CRÍTICO)
**Onde:** `js/AdminLogin.js`, `js/AdminPainel.js`
**Problema:** Email e senha de admin expostos em JavaScript
**Solução:** Mover para `.env` e usar JWT

### 2. Senhas em localStorage (ALTO RISCO)
**Onde:** `js/AdminLogin.js`, `js/Loginconfeiteiro.js`
**Problema:** Dados sensíveis salvos em localStorage
**Solução:** Usar JWT com httpOnly cookies

### 3. SQL Injection Possível (ALTO RISCO)
**Onde:** Todas as queries do banco
**Problema:** Queries concatenadas ao invés de prepared statements
**Solução:** Usar prepared statements em todas as queries

### 4. Sem Hash de Senha (CRÍTICO)
**Onde:** Banco de dados `usuarios.password_hash`
**Problema:** Senhas podem estar em texto plano
**Solução:** Implementar bcrypt com 12+ rounds

### 5. Sem Rate Limiting (MÉDIO)
**Onde:** APIs abertas ao público
**Problema:** Vulnerável a brute force
**Solução:** express-rate-limit

### 6. CORS Aberto (MÉDIO)
**Onde:** `backend/chat-server.js`
**Problema:** `cors()` sem restrições
**Solução:** Restringir a apenas FRONTEND_URL

## 📋 PASSOS PARA IMPLEMENTAR

### Passo 1: Instalar Dependências
```bash
cd backend
npm install
# Isso vai instalar as novas dependências do package.json atualizado
```

### Passo 2: Criar .env Seguro
```bash
cd backend
cp .env.example .env
# Editar .env com valores seguros
```

### Passo 3: Gerar JWT_SECRET
```bash
# Linux/Mac:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
```
Copiar saída e colar no JWT_SECRET do .env

### Passo 4: Remigrar Senhas com Bcrypt
```sql
-- Executar no MySQL para recriar senhas com bcrypt
-- Primeiro, criar usuário admin com senha hashed
DELETE FROM usuarios WHERE tipo_usuario = 'admin';

INSERT INTO usuarios (nome, email, password_hash, tipo_usuario, ativo)
VALUES (
  'Admin UniCake',
  'Adversedeminione#@gmail.com',
  '$2b$12$...bcrypt_hash_gerado...', -- usar bcrypt para gerar
  'admin',
  1
);
```

### Passo 5: Atualizar chat-server.js
Substituir conteúdo do `backend/chat-server.js` pelos padrões de `security-best-practices.js`:
- Adicionar autenticação JWT
- Usar prepared statements
- Adicionar validação de entrada
- Rate limiting
- CORS restritivo

### Passo 6: Remover Dados Sensíveis do Frontend
- ❌ `js/AdminLogin.js`: Remover email/senha hardcodeado
- ❌ `js/AdminPainel.js`: Remover dados admin do código
- ✅ Usar apenas tokens JWT

### Passo 7: Adicionar .gitignore
```
.env
.env.local
node_modules/
dist/
logs/
.DS_Store
```

### Passo 8: Usar Variáveis de Ambiente no Frontend
```javascript
// ❌ ERRADO:
const ADMIN_EMAIL = 'Adversedeminione#@gmail.com';
const ADMIN_PASSWORD = 'UF#!@NSU';

// ✅ CORRETO:
// Usar API de login que valida contra banco de dados seguro
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const { token } = await response.json();
  localStorage.setItem('token', token); // Token JWT, não senha
}
```

## 🔒 MUDANÇAS POR ARQUIVO

### backend/chat-server.js
```javascript
// ANTES:
db.query(query, [user_name, user_email, message], ...);

// DEPOIS:
const connection = await pool.getConnection();
const [result] = await connection.query(
  'INSERT INTO chat_messages (user_name, user_email, message) VALUES (?, ?, ?)',
  [sanitizedName, sanitizedEmail, sanitizedMessage]
);
connection.release();
```

### backend/package.json
```json
// Adicionar dependências:
"bcrypt": "^5.1.1",
"jsonwebtoken": "^9.1.2",
"helmet": "^7.1.0",
"express-rate-limit": "^7.1.5",
"validator": "^13.11.0"
```

### .env (NOVO)
```
DB_PASSWORD=SenhaForte123!@#
JWT_SECRET=chave_aleatoria_gerada_com_openssl
```

## ⚡ IMPACTO DE SEGURANÇA

### ANTES (Inseguro)
- ❌ Admin pode ter senha descoberta por força bruta
- ❌ SQL injection possível
- ❌ Qualquer um pode fazer 1000 requisições/segundo
- ❌ Senhas em texto plano no banco
- ❌ localStorage expõe credenciais

### DEPOIS (Seguro)
- ✅ JWT com expiração automática
- ✅ Prepared statements previnem SQL injection
- ✅ Rate limiting > máx 100 req/15min
- ✅ Bcrypt com 12 rounds (forte)
- ✅ Dados sensíveis em .env, nunca localStorage
- ✅ Helmet adiciona 15+ headers de segurança
- ✅ CORS restritivo

## 📞 SUPORTE

Se precisar de help:
1. Revisar `SEGURANCA_BANCO_DADOS.md`
2. Revisar `security-best-practices.js`
3. Criar issue no GitHub descrevendo o erro

---

**Prioridade:** 🔴 CRÍTICO - Implementar ASAP
**Tempo Estimado:** 2-4 horas
**Risco se não fizer:** Muito alto ⚠️
