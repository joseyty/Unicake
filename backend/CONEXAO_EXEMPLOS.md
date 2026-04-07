# 💻 Exemplos de Conexão - Banco de Dados UniCake

## Node.js + Express

### 1. Instalação

```bash
npm install mysql2 dotenv express
```

### 2. Arquivo `.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=unicake
```

### 3. Arquivo `backend/db.js`

```javascript
const mysql = require('mysql2');
require('dotenv').config();

// Pool de conexões (recomendado)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '+00:00',
  multipleStatements: false
});

// Teste de conexão
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ER_AUTHENTICATION_PLUGIN_ERROR') {
      console.error('Database authentication failed.');
    }
  }
  if (connection) connection.release();
  return;
});

module.exports = pool;
```

### 4. Exemplo: Rota de Lojas

```javascript
const express = require('express');
const pool = require('./db');
const router = express.Router();

// GET todas as lojas
router.get('/lojas', (req, res) => {
  const query = 'SELECT * FROM lojas WHERE ativo = TRUE';

  pool.query(query, (err, results) => {
    if (err) {
      console.error('Erro na query:', err);
      return res.status(500).json({ error: 'Erro ao buscar lojas' });
    }
    res.json(results);
  });
});

// GET uma loja específica
router.get('/lojas/:id', (req, res) => {
  const query = 'SELECT * FROM lojas WHERE id = ?';

  pool.query(query, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    res.json(results[0]);
  });
});

// GET produtos de uma loja
router.get('/lojas/:id/produtos', (req, res) => {
  const query = `
    SELECT p.id, p.nome, p.preco, p.estoque, c.nome as categoria
    FROM produtos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.loja_id = ? AND p.ativo = TRUE
  `;

  pool.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(results);
  });
});

// POST criar pedido
router.post('/pedidos', (req, res) => {
  const { usuario_id, loja_id, itens, endereco_entrega } = req.body;

  // Calcular total
  let total = 0;
  const values = [];

  // INSERT pedido (simplificado)
  const queryPedido = `
    INSERT INTO pedidos (usuario_id, loja_id, total, endereco_entrega, status)
    VALUES (?, ?, ?, ?, 'pendente')
  `;

  pool.query(queryPedido, [usuario_id, loja_id, total, endereco_entrega], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar pedido' });
    }

    const pedidoId = result.insertId;
    res.json({ id: pedidoId, status: 'Pedido criado com sucesso' });
  });
});

module.exports = router;
```

### 5. Exemplo: Middleware para Autenticação

```javascript
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
```

---

## Python + Flask

### 1. Instalação

```bash
pip install flask mysql-connector-python python-dotenv
```

### 2. Arquivo `backend/db.py`

```python
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseConnection:
    def __init__(self):
        self.connection = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=os.getenv('DB_HOST'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASSWORD'),
                database=os.getenv('DB_NAME'),
                charset='utf8mb4',
                use_unicode=True
            )
            print("✅ Conectado ao banco de dados")
            return self.connection
        except Error as e:
            print(f"❌ Erro ao conectar: {e}")
            return None

    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("Desconectado")

    def query(self, sql, params=None):
        """Executa SELECT"""
        cursor = self.connection.cursor(dictionary=True)
        try:
            if params:
                cursor.execute(sql, params)
            else:
                cursor.execute(sql)
            return cursor.fetchall()
        except Error as e:
            print(f"Erro na query: {e}")
            return None
        finally:
            cursor.close()

    def insert(self, sql, params):
        """Executa INSERT"""
        cursor = self.connection.cursor()
        try:
            cursor.execute(sql, params)
            self.connection.commit()
            return cursor.lastrowid
        except Error as e:
            self.connection.rollback()
            print(f"Erro no insert: {e}")
            return None
        finally:
            cursor.close()

    def update(self, sql, params):
        """Executa UPDATE"""
        cursor = self.connection.cursor()
        try:
            cursor.execute(sql, params)
            self.connection.commit()
            return cursor.rowcount
        except Error as e:
            self.connection.rollback()
            print(f"Erro no update: {e}")
            return 0
        finally:
            cursor.close()

# Singleton
db = DatabaseConnection()
```

### 3. Exemplo: Rotas Flask

```python
from flask import Flask, jsonify, request
from db import db

app = Flask(__name__)
db.connect()

@app.route('/api/lojas', methods=['GET'])
def get_lojas():
    query = "SELECT * FROM lojas WHERE ativo = TRUE"
    resultado = db.query(query)
    return jsonify(resultado)

@app.route('/api/lojas/<int:loja_id>', methods=['GET'])
def get_loja(loja_id):
    query = "SELECT * FROM lojas WHERE id = %s"
    resultado = db.query(query, (loja_id,))
    
    if not resultado:
        return jsonify({'error': 'Loja não encontrada'}), 404
    
    return jsonify(resultado[0])

@app.route('/api/lojas/<int:loja_id>/produtos', methods=['GET'])
def get_produtos_loja(loja_id):
    query = """
        SELECT p.id, p.nome, p.preco, p.estoque, c.nome as categoria
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.loja_id = %s AND p.ativo = TRUE
    """
    resultado = db.query(query, (loja_id,))
    return jsonify(resultado)

@app.route('/api/produtos/<int:produto_id>/opcoes', methods=['GET'])
def get_opcoes_produto(produto_id):
    query = """
        SELECT tipo_opcao, nome, preco_adicional, obrigatoria
        FROM opcoes_produto
        WHERE produto_id = %s
        ORDER BY tipo_opcao, nome
    """
    resultado = db.query(query, (produto_id,))
    return jsonify(resultado)

@app.route('/api/pedidos', methods=['POST'])
def criar_pedido():
    dados = request.json
    
    query = """
        INSERT INTO pedidos (usuario_id, loja_id, total, endereco_entrega, status)
        VALUES (%s, %s, %s, %s, 'pendente')
    """
    
    pedido_id = db.insert(query, (
        dados['usuario_id'],
        dados['loja_id'],
        dados['total'],
        dados['endereco_entrega']
    ))
    
    if pedido_id:
        return jsonify({'id': pedido_id, 'status': 'Pedido criado'}), 201
    else:
        return jsonify({'error': 'Erro ao criar pedido'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

---

## PHP + MySQL

### 1. Conexão com PDO

```php
<?php
// backend/config/Database.php

class Database {
    private $host = 'localhost';
    private $db_name = 'unicake';
    private $user = 'root';
    private $password = '';
    private $pdo;

    public function connect() {
        $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4';
        
        try {
            $this->pdo = new PDO($dsn, $this->user, $this->password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->pdo;
        } catch (PDOException $e) {
            echo 'Erro de conexão: ' . $e->getMessage();
            return null;
        }
    }

    public function query($sql) {
        return $this->pdo->prepare($sql);
    }
}
?>
```

### 2. Classe Loja

```php
<?php
// backend/models/Loja.php

class Loja {
    private $pdo;
    private $table = 'lojas';

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE ativo = TRUE");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getProdutos($loja_id) {
        $sql = "
            SELECT p.id, p.nome, p.preco, p.estoque, c.nome as categoria
            FROM produtos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.loja_id = ? AND p.ativo = TRUE
        ";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$loja_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function criar($data) {
        $sql = "
            INSERT INTO {$this->table} (nome, dono_id, descricao, endereco, telefone)
            VALUES (?, ?, ?, ?, ?)
        ";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            $data['nome'],
            $data['dono_id'],
            $data['descricao'],
            $data['endereco'],
            $data['telefone']
        ]);
    }
}
?>
```

### 3. Exemplo de API

```php
<?php
// backend/api/lojas.php

header('Content-Type: application/json; charset=utf-8');

require_once '../config/Database.php';
require_once '../models/Loja.php';

$database = new Database();
$pdo = $database->connect();
$loja = new Loja($pdo);

$method = $_SERVER['REQUEST_METHOD'];
$uri = explode('/', trim($_SERVER['PATH_INFO'], '/'));

try {
    if ($method === 'GET') {
        if (count($uri) === 1) {
            // GET /api/lojas
            $resultado = $loja->getAll();
        } else if (count($uri) === 2) {
            // GET /api/lojas/{id}
            $resultado = $loja->getById($uri[1]);
        } else if (count($uri) === 3 && $uri[2] === 'produtos') {
            // GET /api/lojas/{id}/produtos
            $resultado = $loja->getProdutos($uri[1]);
        }
        echo json_encode($resultado);
    } else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $resultado = $loja->criar($data);
        echo json_encode(['sucesso' => $resultado]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => $e->getMessage()]);
}
?>
```

---

## SQL / Queries Comuns

### Buscar lojas by avaliação

```sql
SELECT 
    id, nome, avaliacao_media, total_avaliacoes, 
    tempo_entrega_minutos, taxa_entrega
FROM lojas
WHERE ativo = TRUE
ORDER BY avaliacao_media DESC
LIMIT 10;
```

### Listar pedidos com detalhes

```sql
SELECT 
    p.id as pedido_id,
    u.nome as cliente,
    l.nome as loja,
    p.total,
    p.status,
    p.data_entrega_prevista,
    COUNT(ip.id) as total_itens,
    p.criado_em
FROM pedidos p
JOIN usuarios u ON p.usuario_id = u.id
JOIN lojas l ON p.loja_id = l.id
LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
WHERE p.status != 'cancelado'
GROUP BY p.id
ORDER BY p.criado_em DESC;
```

### Atualizar status de pedido

```sql
UPDATE pedidos
SET status = 'preparando',
    atualizado_em = NOW()
WHERE id = 1;

-- Registrar no histórico
INSERT INTO historico_pedido (pedido_id, status_anterior, status_novo, observacoes)
VALUES (1, 'confirmado', 'preparando', 'Começou o preparo');
```

---

## ✅ Checklist de Integração

- [ ] Arquivo `.env` configurado
- [ ] Banco de dados criado (`database.sql`)
- [ ] Dados iniciais carregados (`setup.sql`)
- [ ] Conexão testada (conectar e fazer select simples)
- [ ] Prepared statements usados (contra SQL injection)
- [ ] Tratamento de erros implementado
- [ ] Logs configurados
- [ ] Autenticação implementada (JWT ou sessão)
- [ ] Rate limiting configurado
- [ ] Backups automatizados

---

## 📚 Documentação Completa

Veja os outros arquivos para mais informações:
- [DATABASE.md](./DATABASE.md) - Descrição completa das tabelas
- [DIAGRAMA_ER.md](./DIAGRAMA_ER.md) - Diagrama entidade-relacionamento
- [SETUP_RAPIDO.md](./SETUP_RAPIDO.md) - Como começar rápido
