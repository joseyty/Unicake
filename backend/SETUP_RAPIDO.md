# 🚀 Guia Rápido - Banco de Dados UniCake

## ⚡ Começar em 5 minutos

### 1️⃣ Verificar se tem MySQL instalado

```bash
# Windows
mysql --version

# Mac/Linux
mysql --version
```

Se não tiver: [baixe aqui](https://dev.mysql.com/downloads/mysql/)

---

### 2️⃣ Iniciar o MySQL

#### Windows (se instalou via MSI):
```powershell
# Verificar se está rodando
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# Se não estiver, iniciar:
Start-Service MySQL80  # ou MySQL57, MySQL56, dependendo da versão
```

#### Mac (com Homebrew):
```bash
brew services start mysql
```

#### Linux (Ubuntu/Debian):
```bash
sudo systemctl start mysql
```

---

### 3️⃣ Acessar MySQL

```bash
mysql -u root -p
# Digitar a senha (padrão é 'password' se usar a instalação padrão)
```

Se conseguir, verá `mysql>`. Ótimo! ✅

---

### 4️⃣ Criar o banco de dados

```bash
# Na pasta raiz do projeto
mysql -u root -p < backend/database.sql

# Ou se preferir passo a passo:
mysql -u root -p -e "SOURCE backend/database.sql"
```

Se vir mensagens sem `ERROR`, funcionou! ✅

---

### 5️⃣ Carregar dados de exemplo (opcional)

```bash
mysql -u root -p unicake < backend/setup.sql
```

Agora tem lojas, produtos e usuários para testar!

---

## 📋 Verificação Rápida

```bash
# Entrar no MySQL
mysql -u root -p

# Escolher banco
USE unicake;

# Ver quantos usuários tem
SELECT COUNT(*) as total_usuarios FROM usuarios;

# Ver lojas cadastradas
SELECT id, nome, avaliacao_media FROM lojas;

# Sair
exit
```

---

## 🐛 Se der erro...

### ❌ "Access denied for user 'root'@'localhost'"

```bash
# Tente com -p (sem digitar senha)
mysql -u root -p
# Deixe a senha em branco (pressione ENTER)

# Ou use:
mysql -u root --password= < backend/database.sql
```

### ❌ "Can't connect to local MySQL server"

```bash
# Verificar se está rodando
# Mac:
brew services list

# Windows:
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# Linux:
sudo systemctl status mysql

# Se não estiver, iniciar (ver seção 2)
```

### ❌ "GRANT statement has a syntax error"

A versão do MySQL pode ser antiga. Tente remover as linhas de privilégios do `setup.sql`

---

## 🔐 Criar usuário específico (recomendado)

```bash
mysql -u root -p
```

```sql
-- Criar usuário
CREATE USER 'unicake_app'@'localhost' IDENTIFIED BY 'senha_forte_123';

-- Dar permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON unicake.* TO 'unicake_app'@'localhost';

-- Aplicar
FLUSH PRIVILEGES;

-- Verificar
SHOW GRANTS FOR 'unicake_app'@'localhost';

-- Sair
exit
```

Agora use este em seu `.env`:
```env
DB_USER=unicake_app
DB_PASSWORD=senha_forte_123
```

---

## 📱 Conectar Application ao Banco

### Node.js + Express

```bash
npm install mysql2
```

arquivo `backend/db.js`:
```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'unicake',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### PHP

```php
<?php
$mysqli = new mysqli(
  $_ENV['DB_HOST'] ?? 'localhost',
  $_ENV['DB_USER'] ?? 'root',
  $_ENV['DB_PASSWORD'],
  $_ENV['DB_NAME'] ?? 'unicake'
);

if ($mysqli->connect_error) {
  die('Erro: ' . $mysqli->connect_error);
}

// Definir charset
$mysqli->set_charset('utf8mb4');
?>
```

---

## 🎯 Próximos Passos

- [ ] Copiar `.env-example` para `.env`
- [ ] Preencher as configurações
- [ ] Testar conexão
- [ ] Criar API endpoints
- [ ] Conectar ao frontend

---

## 📚 Documentação Completa

Veja [DATABASE.md](./DATABASE.md) para:
- Descrição de todas as tabelas
- Exemplo de queries
- Melhores práticas de segurança
- Troubleshooting avançado

---

## 💬 Precisa de ajuda?

Rodar este comando para confirmar que tudo está ok:

```bash
mysql -u root -p -e "
USE unicake;
SELECT 'Usuários:' as info, COUNT(*) FROM usuarios
UNION
SELECT 'Lojas:', COUNT(*) FROM lojas
UNION  
SELECT 'Produtos:', COUNT(*) FROM produtos
UNION
SELECT 'Pedidos:', COUNT(*) FROM pedidos;
"
```

Se sair bem, seu banco está 🎉 pronto!
