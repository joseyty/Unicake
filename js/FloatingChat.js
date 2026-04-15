// Chat Flutuante de Suporte - Funcionalidade

document.addEventListener('DOMContentLoaded', function() {
  // Elementos
  const chatWidget = document.getElementById('chatWidget');
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatCloseBtn = document.getElementById('chatCloseBtn');
  const chatModal = document.getElementById('chatModal');
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatMessages = document.getElementById('chatMessages');

  // Abrir/Fechar Chat ao clicar no botão flutuante
  chatToggleBtn.addEventListener('click', function() {
    if (chatModal.classList.contains('active')) {
      closeChat();
    } else {
      openChat();
    }
  });

  // Fechar Chat ao clicar no X
  chatCloseBtn.addEventListener('click', function() {
    closeChat();
  });

  // Enviar mensagem ao clicar no botão
  chatSendBtn.addEventListener('click', function() {
    sendMessageFromInput();
  });

  // Enviar mensagem ao pressionar Enter
  chatInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      sendMessageFromInput();
    }
  });

  // Posição inicial
  loadChatState();
});

// Função para abrir o chat
function openChat() {
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatModal = document.getElementById('chatModal');
  const chatMessages = document.getElementById('chatMessages');
  
  chatModal.classList.add('active');
  chatToggleBtn.classList.add('hidden');
  
  // Salvar estado
  localStorage.setItem('chatOpen', 'true');
  
  // Scroll para o final das mensagens
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    document.getElementById('chatInput').focus();
  }, 300);
  
  // Adicionar mensagem de disponibilidade se for primeira visita
  if (!localStorage.getItem('chatVisited')) {
    setTimeout(() => {
      addBotMessage('💡 Dica: Use as opções rápidas abaixo para agilizar seu atendimento!');
      localStorage.setItem('chatVisited', 'true');
    }, 1500);
  }
}

// Função para fechar o chat
function closeChat() {
  const chatToggleBtn = document.getElementById('chatToggleBtn');
  const chatModal = document.getElementById('chatModal');
  
  chatModal.classList.remove('active');
  chatToggleBtn.classList.remove('hidden');
  
  // Salvar estado
  localStorage.setItem('chatOpen', 'false');
}

// Enviar mensagem do input
function sendMessageFromInput() {
  const chatInput = document.getElementById('chatInput');
  const message = chatInput.value.trim();
  
  if (message !== '') {
    sendMessage(message);
    chatInput.value = '';
    chatInput.focus();
  }
}

// Função para enviar mensagem
function sendMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  
  // Adicionar mensagem do usuário
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'chat-message user-message';
  userMessageDiv.innerHTML = `
    <p>${escapeHtml(message)}</p>
    <span class="message-time">${getCurrentTime()}</span>
  `;
  chatMessages.appendChild(userMessageDiv);
  
  // Scroll para a última mensagem
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Tentar enviar para o backend
  sendToBackend(message).then(response => {
    // Resposta do backend
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'chat-message bot-message';
    botMessageDiv.innerHTML = `
      <p>${response}</p>
      <span class="message-time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(botMessageDiv);
    
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }).catch(error => {
    console.error('Erro ao enviar para backend:', error);
    
    // Fallback para resposta automática local
    const botResponse = getBotResponse(message);
    const botMessageDiv = document.createElement('div');
    botMessageDiv.className = 'chat-message bot-message';
    botMessageDiv.innerHTML = `
      <p>${botResponse}</p>
      <span class="message-time">${getCurrentTime()}</span>
    `;
    chatMessages.appendChild(botMessageDiv);
    
    // Scroll para a última mensagem
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Enviar mensagem para o backend
async function sendToBackend(message) {
  try {
    const response = await fetch('http://localhost:5550/api/chat/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        user_name: getUserName(),
        user_email: getUserEmail()
      })
    });

    if (!response.ok) {
      throw new Error('Erro na resposta do servidor');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    throw error;
  }
}

// Funções utilitárias

// Obter resposta do bot baseado na mensagem
function getBotResponse(message) {
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
    return 'Obrigado pela mensagem! 😊 Um agente de suporte analisará sua solicitação em breve e entrará em contato. Estamos disponíveis 24h!';
  }
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Obter hora atual formatada
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

// Carregar estado do chat do localStorage
function loadChatState() {
  const chatWasOpen = localStorage.getItem('chatOpen') === 'true';
  // Não abre automaticamente, usuário que controla
  localStorage.setItem('chatOpen', 'false');
}

// Adicionar mensagem do bot
function addBotMessage(message) {
  const chatMessages = document.getElementById('chatMessages');
  const botMessageDiv = document.createElement('div');
  botMessageDiv.className = 'chat-message bot-message';
  botMessageDiv.innerHTML = `
    <p>${message}</p>
    <span class="message-time">${getCurrentTime()}</span>
  `;
  chatMessages.appendChild(botMessageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fechar chat ao pressionar ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const chatModal = document.getElementById('chatModal');
    if (chatModal && chatModal.classList.contains('active')) {
      closeChat();
    }
  }
});
