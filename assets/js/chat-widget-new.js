(function () {
  const U = window.UniCake;
  const Chat = window.UniCakeChat;

  if (!Chat) return;

  function renderChatWidget() {
    // Verificar se usuário está logado
    const user = window.UniCakeAuth?.getUser();
    if (!user) return; // Não mostrar chat se não logado

    const chatContainer = document.getElementById("site-support");
    if (!chatContainer) return;

    // Procurar conversa existente
    let chat = Chat.getClienteChat(user.email);

    const chatHtml = `
      <div class="chat-widget" id="chatWidget">
        <button class="chat-toggle" type="button" aria-label="Abrir chat" data-chat-toggle>
          ${U.icons.chat}
          <span class="chat-indicator" data-chat-unread></span>
        </button>

        <div class="chat-window" id="chatWindow" hidden>
          <div class="chat-header">
            <h3>Suporte UniCake</h3>
            <button class="chat-close" type="button" aria-label="Fechar chat" data-chat-toggle>
              ${U.icons.close}
            </button>
          </div>

          <div class="chat-messages" id="chatMessages"></div>

          <div class="chat-input-area">
            <form id="chatForm">
              <input
                type="text"
                id="chatInput"
                placeholder="Escreva sua mensagem..."
                autocomplete="off"
                required
              />
              <button type="submit" aria-label="Enviar mensagem">${U.icons.send}</button>
            </form>
          </div>

          <div class="chat-status">
            <p>💬 Suporte disponível 24h</p>
          </div>
        </div>
      </div>
    `;

    chatContainer.innerHTML = chatHtml;

    // Inicializar eventos
    initChatEvents(chat);
  }

  function initChatEvents(chatParam) {
    const toggle = document.querySelector("[data-chat-toggle]");
    const chatWindow = document.getElementById("chatWindow");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    let chat = chatParam;
    let lastMessageCount = chat ? chat.mensagens.length : 0;

    // Toggle da janela
    toggle?.addEventListener("click", () => {
      const hidden = chatWindow.hasAttribute("hidden");
      
      if (hidden) {
        // Se ainda não existe conversa, cria agora
        if (!chat) {
          const user = window.UniCakeAuth?.getUser();
          if (!user) {
            alert("Você precisa estar logado para usar o suporte.");
            return;
          }
          chat = Chat.createChat(user, "outro");
          console.log("✅ Atendimento iniciado:", chat);
        }

        chatWindow.removeAttribute("hidden");
        Chat.marcarComoLido(chat.id, "cliente");
        
        // Pega versão atualizada após marcar como lida
        chat = Chat.getChat(chat.id);
        lastMessageCount = chat.mensagens.length;
        renderMessages(chat);
        input.focus();
      } else {
        chatWindow.setAttribute("hidden", "");
      }
    });

    // Enviar mensagem
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = input.value.trim();

      if (texto && chat && chat.status === "aberto") {
        Chat.enviarMensagem(chat.id, texto, "cliente");
        input.value = "";
        input.focus();
        
        // Atualiza a conversa após enviar
        chat = Chat.getChat(chat.id);
        lastMessageCount = chat.mensagens.length;
        renderMessages(chat);
      }
    });

    // Renderizar mensagens iniciais se chat já existe
    if (chat) {
      renderMessages(chat);
      updateUnreadIndicator(chat);
    }

    // ÚNICO event listener - sem duplicatas
    const handleChatUpdate = () => {
      if (!chat) return;

      const chatAtualizado = Chat.getChat(chat.id);
      if (!chatAtualizado) return;

      // Só renderiza se realmente mudou
      if (chatAtualizado.mensagens.length !== lastMessageCount) {
        lastMessageCount = chatAtualizado.mensagens.length;
        chat = chatAtualizado;
        renderMessages(chat);
        updateUnreadIndicator(chat);
      }
    };

    window.addEventListener("unicake:chats-updated", handleChatUpdate);
  }

  function renderMessages(chat) {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;

    const html = chat.mensagens
      .map(
        (msg) => `
          <div class="chat-message ${msg.remetente}">
            <div class="message-content">
              <p>${escapeHtml(msg.texto)}</p>
              <small>${new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</small>
            </div>
          </div>
        `
      )
      .join("");

    messagesDiv.innerHTML = html || '<p class="empty-chat">Inicie uma conversa com nosso suporte!</p>';

    // Scroll para última mensagem
    const lastMessage = messagesDiv.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: "smooth" });
    }
  }

  function updateUnreadIndicator(chat) {
    const indicator = document.querySelector("[data-chat-unread]");
    if (indicator && chat) {
      if (chat.naoLidosPorCliente > 0) {
        indicator.textContent = chat.naoLidosPorCliente;
        indicator.style.display = "flex";
      } else {
        indicator.style.display = "none";
      }
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Inicializar quando DOM estiver pronto
  const U_ref = window.UniCake;
  if (U_ref && U_ref.ready) {
    U_ref.ready(() => {
      renderChatWidget();
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      renderChatWidget();
    });
  }
})();
