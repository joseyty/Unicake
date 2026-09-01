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

    // Obter ou criar conversa
    let chat = Chat.getClienteChat(user.email);
    if (!chat) {
      chat = Chat.createChat(user);
    }

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
            ${
              chat.status === "fechado"
                ? '<p>Conversa encerrada. <button type="button" data-reabrir-chat>Reabrir</button></p>'
                : `<p>💬 Suporte disponível 24h</p>`
            }
          </div>
        </div>
      </div>
    `;

    chatContainer.innerHTML = chatHtml;

    // Inicializar eventos
    initChatEvents(chat);
  }

  function initChatEvents(chat) {
    const toggle = document.querySelector("[data-chat-toggle]");
    const chatWindow = document.getElementById("chatWindow");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const messagesDiv = document.getElementById("chatMessages");
    const reabrirBtn = document.querySelector("[data-reabrir-chat]");

    // Toggle da janela
    toggle?.addEventListener("click", () => {
      const hidden = chatWindow.hasAttribute("hidden");
      if (hidden) {
        chatWindow.removeAttribute("hidden");
        Chat.marcarComoLido(chat.id, "cliente");
        renderMessages(chat);
      } else {
        chatWindow.setAttribute("hidden", "");
      }
    });

    // Enviar mensagem
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = input.value.trim();

      if (texto && chat.status === "aberto") {
        Chat.enviarMensagem(chat.id, texto, "cliente");
        input.value = "";
        input.focus();
        renderMessages(chat);
      }
    });

    // Reabrir chat
    reabrirBtn?.addEventListener("click", () => {
      Chat.reabrirChat(chat.id);
      location.reload();
    });

    // Renderizar mensagens iniciais
    renderMessages(chat);

    // Atualizar em tempo real quando há novos dados
    window.addEventListener("unicake:chats-updated", (e) => {
      const chatAtualizado = e.detail.find((c) => c.id === chat.id);
      if (chatAtualizado) {
        chat = chatAtualizado;
        renderMessages(chat);
        updateUnreadIndicator();
      }
    });
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

  function updateUnreadIndicator() {
    const indicator = document.querySelector("[data-chat-unread]");
    if (indicator) {
      const user = window.UniCakeAuth?.getUser();
      const chat = Chat.getClienteChat(user.email);

      if (chat && chat.naoLidosPorCliente > 0) {
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
