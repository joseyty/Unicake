# 💬 Sistema de Chat UniCake

Sistema completo de chat de suporte com atendimento automático e manual.

## 📋 Funcionalidades

- ✅ Chat flutuante na página inicial
- ✅ Respostas automáticas inteligentes
- ✅ Painel de administração para respostas manuais
- ✅ Salvamento de conversas no banco de dados
- ✅ Interface responsiva
- ✅ Notificações em tempo real

## 🚀 Como Usar

### 1. Configurar o Backend

```bash
# Instalar dependências
cd backend
npm install

# Criar arquivo .env
cp .env.example .env

# Editar .env com suas configurações do banco
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=unicake
PORT=3001
```

### 2. Configurar o Banco de Dados

Execute o script SQL para criar a tabela:

```sql
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
);
```

### 3. Iniciar o Servidor

```bash
# No diretório backend
node chat-server.js
```

O servidor ficará rodando em `http://localhost:3001`

### 4. Acessar o Painel de Administração

Abra `admin-chat.html` no navegador para gerenciar as mensagens.

## 📱 Como Responder aos Clientes

### Método 1: Respostas Automáticas (Já configurado)

O chat já responde automaticamente a mensagens comuns:
- Pedidos
- Produtos
- Reclamações
- Preços
- Entregas
- Pagamentos

### Método 2: Respostas Manuais via Painel

1. **Abra o painel**: `admin-chat.html`
2. **Veja mensagens pendentes** na aba "Pendentes"
3. **Clique em "Responder"** na mensagem desejada
4. **Digite sua resposta** no campo de texto
5. **Clique em "Enviar Resposta"**

### Método 3: Integração com Email/WhatsApp

Para notificações automáticas, configure:

```javascript
// No chat-server.js, adicione:

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'sua-senha-app'
  }
});

// Enviar email quando receber mensagem
await transporter.sendMail({
  from: 'seu-email@gmail.com',
  to: 'suporte@unicake.com',
  subject: `Nova mensagem de ${user_name}`,
  html: `<p>${message}</p><p><a href="admin-chat.html">Responder</a></p>`
});
```

## 📁 Estrutura dos Arquivos

```
unicake/
├── html/
│   ├── index.html          # Página inicial com chat integrado
│   └── FloatingChat.html   # Componente HTML do chat
├── css/
│   └── FloatingChat.css    # Estilos do chat
├── js/
│   └── FloatingChat.js     # Funcionalidade do chat
├── backend/
│   └── chat-server.js      # Servidor Node.js
├── admin-chat.html         # Painel de administração
└── test-chat.html          # Página de teste
```

## 🔧 Personalização

### Alterar Respostas Automáticas

Edite a função `getAutoResponse()` no arquivo `backend/chat-server.js`:

```javascript
function getAutoResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('horário')) {
    return 'Funcionamos das 8h às 18h, de segunda a sábado! 🕐';
  }

  // Adicione mais respostas...
}
```

### Alterar Aparência do Chat

Edite `css/FloatingChat.css` para personalizar cores, tamanhos, etc.

### Adicionar Mais Opções Rápidas

No `html/FloatingChat.html`, adicione mais botões:

```html
<button class="quick-option" onclick="sendMessage('Quero saber sobre entregas')">🚚 Entregas</button>
```

## 📊 Estatísticas

O painel mostra:
- Total de mensagens
- Mensagens pendentes
- Mensagens respondidas
- Mensagens de hoje

## 🔒 Segurança

- As mensagens são salvas no banco de dados
- O painel de admin deve ser protegido (adicione autenticação)
- Configure CORS adequadamente para produção

## 🚀 Produção

Para colocar em produção:

1. Configure um servidor Node.js (Heroku, Railway, etc.)
2. Use HTTPS
3. Configure variáveis de ambiente
4. Adicione autenticação ao painel admin
5. Configure notificações por email/WhatsApp

## 🆘 Suporte

Se tiver problemas:
1. Verifique se o servidor backend está rodando
2. Confirme a conexão com o banco de dados
3. Verifique o console do navegador (F12)
4. Teste com `test-chat.html`

---

**Desenvolvido para UniCake** 🍰✨