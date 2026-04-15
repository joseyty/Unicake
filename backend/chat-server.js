const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Usuários simulados
let mockUsers = [
  { id: 1, nome: 'João Silva', cpf: '123.456.789-00', email: 'joao@email.com', senha: 'senha123', tipo_usuario: 'cliente', status: 'Ativo' },
  { id: 2, nome: 'Maria Oliveira', cpf: '987.654.321-00', email: 'maria@email.com', senha: 'senha456', tipo_usuario: 'confeiteiro', status: 'Ativo' },
];

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unicake'
});

// Conectar ao banco
let dbConnected = false;
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    console.log('Continuando sem banco de dados (usando dados simulados)');
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
  dbConnected = true;

  // Criar tabela apenas se conectado
  db.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(255) DEFAULT NULL,
      user_name VARCHAR(255) DEFAULT 'Visitante',
      user_email VARCHAR(255) DEFAULT NULL,
      message TEXT NOT NULL,
      response TEXT NULL,
      status ENUM('pendente', 'respondido') DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      responded_at TIMESTAMP NULL
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela:', err);
  });
});

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // ou outro serviço
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rota de registro
app.post('/api/auth/register', async (req, res) => {
  const { nome, email, telefone, password, tipo_usuario = 'cliente' } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  // Simulação sem banco - adicionar à lista
  const newId = mockUsers.length ? Math.max(...mockUsers.map(u => u.id)) + 1 : 1;
  const newUser = {
    id: newId,
    nome,
    cpf: '000.000.000-00', // Placeholder
    email,
    senha: password, // Em produção, hash
    tipo_usuario,
    status: 'Ativo'
  };
  mockUsers.push(newUser);

  res.status(201).json({ message: 'Usuário registrado com sucesso', userId: newId });
});

// Rota de login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  // Buscar usuário na lista mockUsers
  const user = mockUsers.find(u => u.email === email && u.senha === password);

  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }

  const token = jwt.sign(
    { id: user.id, nome: user.nome, email: user.email, tipo_usuario: user.tipo_usuario },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login realizado com sucesso',
    token,
    user: { id: user.id, nome: user.nome, email: user.email, tipo_usuario: user.tipo_usuario }
  });
});

// Rota para verificar código 2FA (para admin)
app.post('/api/admin/verify-2fa', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email e código são obrigatórios' });
  }

  const pending = pending2FA.get(email);
  if (!pending) {
    return res.status(400).json({ error: 'Código expirado ou não solicitado' });
  }

  // Verificar se não expirou (5 minutos)
  if (Date.now() - pending.timestamp > 5 * 60 * 1000) {
    pending2FA.delete(email);
    return res.status(400).json({ error: 'Código expirado' });
  }

  if (pending.code !== code) {
    return res.status(401).json({ error: 'Código incorreto' });
  }

  // Limpar código
  pending2FA.delete(email);

  res.json({ message: 'Código verificado com sucesso' });
});

// Rota para obter usuários (para admin)
app.get('/api/admin/users', (req, res) => {
  res.json(mockUsers);
});

// Rota para excluir usuário (para admin)
app.delete('/api/admin/users/:id', (req, res) => {
  const { id } = req.params;
  const index = mockUsers.findIndex(u => u.id == id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
    res.json({ message: 'Usuário excluído com sucesso' });
  } else {
    res.status(404).json({ error: 'Usuário não encontrado' });
  }
});

// Rota para receber mensagens do chat
app.post('/api/chat/send-message', (req, res) => {
  const { message, user_name, user_email } = req.body;

  const query = `
    INSERT INTO chat_messages (user_name, user_email, message, status)
    VALUES (?, ?, ?, 'pendente')
  `;

  db.query(query, [user_name || 'Visitante', user_email || null, message], (err, result) => {
    if (err) {
      console.error('Erro ao salvar mensagem:', err);
      return res.status(500).json({ error: 'Erro ao salvar mensagem' });
    }

    // Resposta automática imediata
    const autoResponse = getAutoResponse(message);

    res.json({
      response: autoResponse,
      message_id: result.insertId
    });
  });
});

// Rota para buscar mensagens pendentes (para admin)
app.get('/api/chat/messages', (req, res) => {
  const query = `
    SELECT * FROM chat_messages
    WHERE status = 'pendente'
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar mensagens:', err);
      return res.status(500).json({ error: 'Erro ao buscar mensagens' });
    }
    res.json(results);
  });
});

// Rota para responder mensagem (admin)
app.post('/api/chat/respond', (req, res) => {
  const { message_id, response } = req.body;

  const query = `
    UPDATE chat_messages
    SET response = ?, status = 'respondido', responded_at = NOW()
    WHERE id = ?
  `;

  db.query(query, [response, message_id], (err) => {
    if (err) {
      console.error('Erro ao responder:', err);
      return res.status(500).json({ error: 'Erro ao responder' });
    }
    res.json({ success: true });
  });
});

// Rota para buscar todas as conversas (admin)
app.get('/api/chat/conversations', (req, res) => {
  const query = `
    SELECT * FROM chat_messages
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar conversas:', err);
      return res.status(500).json({ error: 'Erro ao buscar conversas' });
    }
    res.json(results);
  });
});

// Função de resposta automática
function getAutoResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('pedido') || lowerMessage.includes('meu pedido')) {
    return 'Para consultar seu pedido, acesse a seção "Meus Pedidos" em sua conta ou nos envie o número do pedido. Estamos prontos para ajudar! 📦';
  } else if (lowerMessage.includes('produto') || lowerMessage.includes('compra')) {
    return 'Temos uma grande variedade de produtos deliciosos! 🍰 Qual tipo de produto você está interessado? Doces, bolos, cupcakes?';
  } else if (lowerMessage.includes('reclamação') || lowerMessage.includes('problema')) {
    return 'Lamentamos se algo não saiu como esperado. 😔 Para melhor ajudá-lo, nos informe mais detalhes sobre o problema.';
  } else if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('caro')) {
    return 'Oferecemos os melhores preços do mercado! 💰 Você está vendo algum produto específico? Posso ajudar!';
  } else if (lowerMessage.includes('entrega') || lowerMessage.includes('frete')) {
    return 'A entrega é realizada dentro do prazo estipulado. 🚚 Qual cidade você pretende receber? Posso verificar os detalhes.';
  } else if (lowerMessage.includes('pagamento')) {
    return 'Oferecemos várias formas de pagamento: cartão de crédito, débito, Pix e boleto. 💳 Qual é sua preferência?';
  } else if (lowerMessage.includes('obrigado') || lowerMessage.includes('obg') || lowerMessage.includes('valeu')) {
    return 'Fico feliz em ajudar! 😊 Se precisar de algo mais, é só chamar!';
  } else if (lowerMessage.includes('oi') || lowerMessage.includes('olá') || lowerMessage.includes('opa')) {
    return 'Olá! 👋 Como posso ajudá-lo hoje?';
  } else {
    return 'Obrigado pela mensagem! 📨 Um agente de suporte analisará sua solicitação em breve e entrará em contato. Estamos disponíveis 24h!';
  }
}

const PORT = process.env.PORT || 5550;

// Servir arquivos estáticos da pasta html
app.use(express.static('../html'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor de chat rodando na porta ${PORT}`);
});