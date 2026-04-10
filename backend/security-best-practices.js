// ============================================
// SEGURANÇA - Melhorar banco de dados e APIs
// ============================================

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
require('dotenv').config();

const app = express();

// ============================================
// 1. MIDDLEWARE DE SEGURANÇA
// ============================================

// Helmet - Proteção de headers
app.use(helmet());

// CORS - Controle de origem
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate Limiting - Proteção contra brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máx 100 requisições por windowMs
  message: 'Muitas requisições. Tente novamente mais tarde.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máx 5 tentativas de login
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

// Body parser com limite de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

// ============================================
// 2. POOL DE CONEXÃO COM PREPARED STATEMENTS
// ============================================

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unicake',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0
});

// ============================================
// 3. VALIDAÇÃO E SANITIZAÇÃO
// ============================================

// Validar email
function isValidEmail(email) {
  return validator.isEmail(email);
}

// Sanitizar input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return validator.trim(validator.escape(input));
}

// Validar senha força
function isStrongPassword(password) {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
}

// ============================================
// 4. FUNÇÕES DE HASH SEGURO (BCRYPT)
// ============================================

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12); // 12 rounds
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ============================================
// 5. MIDDLEWARE DE AUTENTICAÇÃO JWT
// ============================================

const jwt = require('jsonwebtoken');

function generateToken(userId, userType) {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET || 'seu_segredo_super_seguro',
    { expiresIn: '24h' }
  );
}

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'seu_segredo_super_seguro'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

// ============================================
// 6. ROTA DE AUTENTICAÇÃO SEGURA
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const connection = await pool.getConnection();

    try {
      // Query com prepared statement
      const [users] = await connection.query(
        'SELECT id, password_hash, tipo_usuario, nome FROM usuarios WHERE email = ? AND ativo = 1',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = users[0];

      // Comparar senha com bcrypt
      const passwordMatch = await verifyPassword(password, user.password_hash);

      if (!passwordMatch) {
        // Log tentativa falhada (importante para auditoria)
        console.warn(`Tentativa de login falhada: ${email}`);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token JWT
      const token = generateToken(user.id, user.tipo_usuario);

      // Retornar dados sem sensibilidades
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          nome: user.nome,
          tipo_usuario: user.tipo_usuario
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// 7. ROTA PARA REGISTRAR USUÁRIO
// ============================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, password, telefone } = req.body;

    // Validação
    if (!sanitizeInput(nome) || nome.length < 3) {
      return res.status(400).json({ error: 'Nome inválido' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Senha fraca. Mínimo 8 caracteres, maiúsculas, números e símbolos' 
      });
    }

    const hashedPassword = await hashPassword(password);

    const connection = await pool.getConnection();

    try {
      // Verificar se email já existe
      const [existing] = await connection.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ error: 'Este email já está registrado' });
      }

      // Inserir novo usuário com prepared statement
      const [result] = await connection.query(
        'INSERT INTO usuarios (nome, email, password_hash, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
        [sanitizeInput(nome), email, hashedPassword, sanitizeInput(telefone), 'cliente']
      );

      const token = generateToken(result.insertId, 'cliente');

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: result.insertId,
          nome: sanitizeInput(nome),
          tipo_usuario: 'cliente'
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// 8. ROTA PROTEGIDA - EXEMPLO
// ============================================

app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Buscar apenas dados não sensíveis
      const [users] = await connection.query(
        'SELECT id, nome, email, tipo_usuario, telefone FROM usuarios WHERE id = ?',
        [req.user.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json({ user: users[0] });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ============================================
// 9. ROTA PROTEGIDA - CHAT (SEGURO)
// ============================================

app.post('/api/chat/send-message', async (req, res) => {
  try {
    const { message, user_name, user_email } = req.body;

    // Validar entrada
    if (!message || message.length > 2000) {
      return res.status(400).json({ error: 'Mensagem inválida ou muito longa' });
    }

    const sanitizedMessage = sanitizeInput(message);
    const sanitizedName = sanitizeInput(user_name) || 'Visitante';
    const sanitizedEmail = user_email ? sanitizeInput(user_email) : null;

    const connection = await pool.getConnection();

    try {
      // Usar prepared statement
      const [result] = await connection.query(
        `INSERT INTO chat_messages (user_name, user_email, message, status)
         VALUES (?, ?, ?, 'pendente')`,
        [sanitizedName, sanitizedEmail, sanitizedMessage]
      );

      return res.json({
        success: true,
        message_id: result.insertId,
        response: 'Mensagem recebida. Agradecemos seu contato!'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    return res.status(500).json({ error: 'Erro ao salvar mensagem' });
  }
});

// ============================================
// 10. TRATAMENTO DE ERROS GLOBAL
// ============================================

app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  
  // Não expor detalhes do erro
  res.status(500).json({ 
    error: 'Erro interno do servidor. Tente novamente mais tarde.' 
  });
});

// ============================================
// 11. INICIAR SERVIDOR
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🔒 Servidor seguro rodando na porta ${PORT}`);
});

module.exports = { pool, verifyToken };
