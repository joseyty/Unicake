app.use(express.json());
const cors = require('cors');
app.use(cors());

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5550;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', JSON.stringify(req.body).substring(0, 100));
  }
  next();
});

// Configuração do MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unicake',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verificar conexão com banco
pool.getConnection().then(conn => {
  console.log('✅ Conectado ao MySQL com sucesso!');
  conn.release();
}).catch(err => {
  console.error('❌ Erro ao conectar com MySQL:', err.message);
  process.exit(1);
});

// ========================================
// ROTAS DE CHAT
// ========================================

// GET /api/chat/messages - Listar mensagens de chat
app.get('/api/chat/messages', async (req, res) => {
  try {
    const { usuario_id, loja_id } = req.query;
    const conn = await pool.getConnection();
    
    let query = 'SELECT * FROM chat_messages ORDER BY criado_em DESC LIMIT 50';
    let params = [];
    
    if (usuario_id) {
      query = 'SELECT * FROM chat_messages WHERE usuario_id = ? ORDER BY criado_em DESC LIMIT 50';
      params = [usuario_id];
    }
    
    if (loja_id) {
      query = 'SELECT * FROM chat_messages WHERE loja_id = ? ORDER BY criado_em DESC LIMIT 50';
      params = [loja_id];
    }
    
    const [rows] = await conn.query(query, params);
    conn.release();
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ erro: 'Erro ao buscar mensagens' });
  }
});

// GET /api/chat/conversations - Listar conversas
app.get('/api/chat/conversations', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(`
      SELECT DISTINCT 
        cm.usuario_id, 
        cm.loja_id,
        u.nome as usuario_nome,
        l.nome as loja_nome,
        MAX(cm.criado_em) as ultima_mensagem
      FROM chat_messages cm
      LEFT JOIN usuarios u ON cm.usuario_id = u.id
      LEFT JOIN lojas l ON cm.loja_id = l.id
      GROUP BY cm.usuario_id, cm.loja_id
      ORDER BY ultima_mensagem DESC
    `);
    
    conn.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar conversas:', error);
    res.status(500).json({ erro: 'Erro ao buscar conversas' });
  }
});

// POST /api/chat/send-message - Enviar mensagem
app.post('/api/chat/send-message', async (req, res) => {
  try {
    const { usuario_id, loja_id, mensagem, tipo = 'texto' } = req.body;
    
    if (!usuario_id || !mensagem) {
      return res.status(400).json({ erro: 'usuario_id e mensagem são obrigatórios' });
    }
    
    const conn = await pool.getConnection();
    
    const [result] = await conn.query(
      'INSERT INTO chat_messages (usuario_id, loja_id, mensagem, tipo) VALUES (?, ?, ?, ?)',
      [usuario_id, loja_id || null, mensagem, tipo]
    );
    
    conn.release();
    
    res.json({
      id: result.insertId,
      usuario_id,
      loja_id,
      mensagem,
      tipo,
      criado_em: new Date()
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ erro: 'Erro ao enviar mensagem' });
  }
});

// POST /api/chat/respond - Admin responder mensagem
app.post('/api/chat/respond', async (req, res) => {
  try {
    const { usuario_id, loja_id, resposta } = req.body;
    
    if (!usuario_id || !resposta) {
      return res.status(400).json({ erro: 'usuario_id e resposta são obrigatórios' });
    }
    
    const conn = await pool.getConnection();
    
    const [result] = await conn.query(
      'INSERT INTO chat_messages (usuario_id, loja_id, mensagem, tipo) VALUES (?, ?, ?, ?)',
      [usuario_id, loja_id || null, resposta, 'resposta']
    );
    
    conn.release();
    
    res.json({
      id: result.insertId,
      mensagem: resposta,
      tipo: 'resposta'
    });
  } catch (error) {
    console.error('Erro ao responder:', error);
    res.status(500).json({ erro: 'Erro ao responder mensagem' });
  }
});

// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================

// POST /api/auth/register - Registrar usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, password_hash, tipo_usuario = 'cliente', telefone } = req.body;
    
    if (!nome || !email || !password_hash) {
      return res.status(400).json({ erro: 'nome, email e password_hash são obrigatórios' });
    }

    if (nome.length < 3) {
      return res.status(400).json({ erro: 'Nome deve ter pelo menos 3 caracteres' });
    }

    if (password_hash.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ erro: 'Email inválido' });
    }
    
    const conn = await pool.getConnection();

    // Verificar se email já existe
    const [existingUser] = await conn.query(
      'SELECT id FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUser.length > 0) {
      conn.release();
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password_hash, 10);
    
    const [result] = await conn.query(
      'INSERT INTO usuarios (nome, email, password_hash, tipo_usuario, telefone) VALUES (?, ?, ?, ?, ?)',
      [nome, email, hashedPassword, tipo_usuario, telefone || null]
    );
    
    conn.release();
    
    res.json({
      id: result.insertId,
      nome,
      email,
      tipo_usuario,
      mensagem: 'Usuário cadastrado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao registrar:', error);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

// POST /api/auth/login - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password_hash } = req.body;
    
    if (!email || !password_hash) {
      return res.status(400).json({ erro: 'email e password_hash são obrigatórios' });
    }
    
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(
      'SELECT id, nome, email, tipo_usuario, password_hash, ativo FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );
    
    conn.release();
    
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }
    
    const usuario = rows[0];
    
    if (!usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário inativo' });
    }

    // Comparar senha
    const senhaValida = await bcrypt.compare(password_hash, usuario.password_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta' });
    }
    
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario,
      mensagem: 'Login realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

// ========================================
// ROTAS DE ADMIN
// ========================================

// GET /api/admin/users - Listar usuários
app.get('/api/admin/users', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(
      'SELECT id, nome, email, tipo_usuario, telefone, ativo, criado_em FROM usuarios'
    );
    
    conn.release();
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
});

// GET /api/admin/users/:id - Detalhes do usuário
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    
    conn.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});

// PUT /api/admin/users/:id - Atualizar usuário
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, tipo_usuario, telefone, ativo } = req.body;
    
    const conn = await pool.getConnection();
    
    await conn.query(
      'UPDATE usuarios SET nome = ?, email = ?, tipo_usuario = ?, telefone = ?, ativo = ? WHERE id = ?',
      [nome, email, tipo_usuario, telefone, ativo, id]
    );
    
    conn.release();
    
    res.json({ mensagem: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ erro: 'Erro ao atualizar usuário' });
  }
});

// POST /api/admin/verify-2fa - Verificar 2FA
app.post('/api/admin/verify-2fa', async (req, res) => {
  try {
    const { codigo } = req.body;
    
    if (!codigo) {
      return res.status(400).json({ erro: 'Código 2FA obrigatório' });
    }
    
    // Implementar lógica de 2FA aqui
    res.json({ sucesso: true, mensagem: '2FA verificado com sucesso' });
  } catch (error) {
    console.error('Erro ao verificar 2FA:', error);
    res.status(500).json({ erro: 'Erro ao verificar 2FA' });
  }
});

// ========================================
// ROTAS DE SAÚDE
// ========================================

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🎂 UNICAKE CHAT SERVER RODANDO 🎂  ║
╠════════════════════════════════════════╣
║ Porta: ${PORT}                            ║
║ URL: http://localhost:${PORT}           ║
║ Banco: ${process.env.DB_NAME || 'unicake'}                       ║
║ Host: ${process.env.DB_HOST || 'localhost'}                      ║
╚════════════════════════════════════════╝
  `);
});


