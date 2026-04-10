const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unicake'
});

// Conectar ao banco
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Criar tabela de chat se não existir
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de chat rodando na porta ${PORT}`);
});