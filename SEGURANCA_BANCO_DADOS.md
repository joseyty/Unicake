# 🔒 Melhorias de Segurança - Banco de Dados e APIs

## 1. Instalação de Dependências de Segurança

```bash
cd backend
npm install bcrypt helmet express-rate-limit validator jsonwebtoken
```

## 2. Arquivo .env (NUNCA fazer commit)

```env
# Banco de dados
DB_HOST=localhost
DB_USER=unicake_app
DB_PASSWORD=SenhaForteMuito@123
DB_NAME=unicake

# Segurança
JWT_SECRET=sua_chave_secreta_super_longa_e_aleatoria_aqui
NODE_ENV=production

# Frontend
FRONTEND_URL=http://localhost:3000

# Porta
PORT=3001
```

## 3. Principais Melhorias Implementadas

### ✅ Autenticação com JWT
- Tokens JWT ao invés de localStorage
- Verificação de autenticação em rotas protegidas
- Expiração automática de token em 24h

### ✅ Hash de Senhas com Bcrypt
- Bcrypt com 12 rounds (forte)
- Verificação segura comparando hashes
- Nunca armazenar senha em texto plano

### ✅ Validação e Sanitização
- Email validado com `validator` library
- Força de senha verificada (8+ chars, maiúsculas, números, símbolos)
- Input sanitizado com escape

### ✅ Rate Limiting
- Máximo 100 requisições por 15 min (geral)
- Máximo 5 tentativas de login por 15 min
- Proteção contra brute force

### ✅ CORS Restritivo
- Apenas origem autorizada pode acessar API
- Credenciais controladas

### ✅ SQL Injection Prevention
- Prepared statements em TODAS as queries
- Nunca concatenar strings em SQL

### ✅ Headers de Segurança
- Helmet.js adiciona headers de proteção
- Previne clickjacking, XSS, etc.

### ✅ Dados Sensíveis Ocultos
- Password nunca é retornado nas APIs
- Apenas dados públicos são enviados ao cliente

### ✅ Logs de Auditoria
- Registra tentativas de login falhadas
- Importante para detectar ataques

## 4. Como Atualizar o Chat-Server

Substitua `backend/chat-server.js` pelos principios em `security-best-practices.js`

## 5. Estrutura Melhorada do Banco

```sql
-- Já você tem isso, mas confirme:
-- Password_hash deve ser TEXT (para bcrypt)
-- Índices em email, tipo_usuario
-- Foreign keys com CASCADE DELETE
-- Timestamps para auditoria
```

## 6. Dados de Admin NÃO Devem Estar em Código

### ❌ ERRADO (atual):
```javascript
const expectedHash = await hashPassword('UF#!@NSU');
```

### ✅ CORRETO:
```env
# No .env
ADMIN_EMAIL=Adversedeminione#@gmail.com
ADMIN_PASSWORD_HASH=$2b$12$xxxxx... (pre-hashed com bcrypt)
```

## 7. Remoção de Dados Sensíveis das Respostas

### ❌ ERRADO:
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "password_hash": "bcrypt_hash_aqui",
    "token_secreto": "xyz"
  }
}
```

### ✅ CORRETO:
```json
{
  "success": true,
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "nome": "Admin",
    "tipo_usuario": "admin"
  }
}
```

## 8. Variáveis de Ambiente Obrigatórias

Crie `.env` com:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` (gerado aleatoriamente, min 32 caracteres)
- `FRONTEND_URL` (sua URL do frontend)
- `NODE_ENV=production`

## 9. Proteção de Rotas Sensíveis

```javascript
// Público (qualquer um)
POST /api/auth/login
POST /api/auth/register
POST /api/chat/send-message

// Protegido (apenas logado)
@verifyToken
GET /api/user/profile
GET /api/user/pedidos
etc.

// Super Protegido (apenas admin)
@verifyToken
@verifyAdmin
GET /api/admin/usuarios
POST /api/admin/deletar-usuario
etc.
```

## 10. Checklist de Segurança

- [ ] .env criado com todas as variáveis
- [ ] Bcrypt instalado e configurado
- [ ] JWT implementado
- [ ] Rate limiting ativo
- [ ] CORS restritivo
- [ ] Prepared statements em todas as queries
- [ ] Dados sensíveis nunca em localStorage
- [ ] Logs de auditoria configurados
- [ ] HTTPS em produção
- [ ] Backups regulares do banco

## 11. Deploy em Produção

```bash
# Usar variáveis de ambiente seguros
export JWT_SECRET=$(openssl rand -base64 32)
export DB_PASSWORD=sua_senha_forte

# Usar HTTPS sempre
# Adicionar firewall
# Rate limiting mais restritivo
# Monitoramento ativo
```

---

**Importante:** Revise essa implementação com seu time de segurança antes de colocar em produção!
