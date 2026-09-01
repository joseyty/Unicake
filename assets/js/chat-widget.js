(function () {
  const U = window.UniCake;
  const Chat = window.UniCakeChat;

  if (!Chat) return;

  // Variáveis globais do widget
  let chatGlobal = null;

  function renderChatWidget() {
    // Verificar se usuário está logado
    const user = window.UniCakeAuth?.getUser();
    if (!user) return;

    const chatContainer = document.getElementById("site-support");
    if (!chatContainer) return;

    // Procurar conversa existente
    chatGlobal = Chat.getClienteChat(user.email);

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
    initChatEvents();
  }

  function initChatEvents() {
    const toggle = document.querySelector("[data-chat-toggle]");
    const chatWindow = document.getElementById("chatWindow");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");

    // Toggle da janela
    toggle?.addEventListener("click", () => {
      const hidden = chatWindow.hasAttribute("hidden");

      if (hidden) {
        // Se ainda não existe conversa, cria agora
        if (!chatGlobal) {
          const user = window.UniCakeAuth?.getUser();
          if (!user) {
            alert("Você precisa estar logado para usar o suporte.");
            return;
          }
          chatGlobal = Chat.createChat(user, "outro");
        }

        chatWindow.removeAttribute("hidden");
        Chat.marcarComoLido(chatGlobal.id, "cliente");

        // Pega versão atualizada após marcar como lida
        chatGlobal = Chat.getChat(chatGlobal.id);
        renderMessages();
        updateUnreadIndicator();
        input.focus();
      } else {
        chatWindow.setAttribute("hidden", "");
      }
    });

    // Enviar mensagem
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = input.value.trim();

      if (texto && chatGlobal && chatGlobal.status === "aberto") {
        Chat.enviarMensagem(chatGlobal.id, texto, "cliente");
        input.value = "";
        input.focus();

        // Atualiza a conversa após enviar
        chatGlobal = Chat.getChat(chatGlobal.id);
        renderMessages();
        updateUnreadIndicator();
      }
    });

    // Renderizar mensagens iniciais se chat já existe
    if (chatGlobal) {
      renderMessages();
      updateUnreadIndicator();
    }
  }

  function renderMessages() {
    const messagesDiv = document.getElementById("chatMessages");
    if (!messagesDiv) return;
    if (!chatGlobal) return;

    const html = chatGlobal.mensagens
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

    messagesDiv.innerHTML =
      html || '<p class="empty-chat">Inicie uma conversa com nosso suporte!</p>';

    // Scroll para última mensagem
    const lastMessage = messagesDiv.lastElementChild;
    if (lastMessage) {
      lastMessage.scrollIntoView({ behavior: "smooth" });
    }
  }

  function updateUnreadIndicator() {
    const indicator = document.querySelector("[data-chat-unread]");
    if (!indicator || !chatGlobal) return;

    if (chatGlobal.naoLidosPorCliente > 0) {
      indicator.textContent = chatGlobal.naoLidosPorCliente;
      indicator.style.display = "flex";
    } else {
      indicator.style.display = "none";
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== LISTENER GLOBAL DE SINCRONIZAÇÃO =====
  // Escuta quando QUALQUER chat é atualizado (cliente ou suporte enviando mensagem)
  
  // Event listener para mudanças no localStorage (funciona entre abas!)
  window.addEventListener("storage", (event) => {
    if (event.key === "unicake.chats") {
      if (!chatGlobal) return;

      // Pega a versão mais recente do chat
      const chatAtualizado = Chat.getChat(chatGlobal.id);
      if (!chatAtualizado) return;

      // Atualiza a referência global
      chatGlobal = chatAtualizado;

      // Re-renderiza interface
      renderMessages();
      updateUnreadIndicator();
    }
  });

  // Event listener para custom events (mesma aba)
  window.addEventListener("unicake:chats-updated", () => {
    if (!chatGlobal) return;

    // Pega a versão mais recente do chat
    const chatAtualizado = Chat.getChat(chatGlobal.id);
    if (!chatAtualizado) return;

    // Atualiza a referência global
    chatGlobal = chatAtualizado;

    // Re-renderiza interface
    renderMessages();
    updateUnreadIndicator();
  });

  // Fallback: verificar atualizações a cada 1 segundo (garante sincronização em qualquer cenário)
  setInterval(() => {
    if (!chatGlobal) return;

    const chatAtualizado = Chat.getChat(chatGlobal.id);
    if (!chatAtualizado) return;

    // Se a quantidade de mensagens mudou, atualiza
    if (chatAtualizado.mensagens.length !== chatGlobal.mensagens.length) {
      chatGlobal = chatAtualizado;
      renderMessages();
      updateUnreadIndicator();
    }
  }, 1000);

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
