(function () {
  const STORAGE_KEY = "unicake.support24h.history";
  const quickReplies = ["Falar com atendente", "Acompanhar atendimento", "Nova dúvida", "Encerrar conversa"];
  const responses = [
    { keys: ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "hey"], reply: "Olá! 👋 Sou o chatbot da UniCake. Envie sua dúvida e eu farei a triagem para o suporte." },
    { keys: ["humano", "atendente", "pessoa", "equipe", "falar com", "suporte"], reply: "👩‍💻 Sua solicitação foi sinalizada para a equipe de suporte. Um atendente acompanhará esta conversa assim que possível." },
    { keys: ["status", "acompanhar", "andamento", "retorno"], reply: "🔎 Sua conversa está aberta para acompanhamento. Envie mais detalhes nesta janela para a equipe analisar." },
    { keys: ["encerrar", "finalizar", "fechar"], reply: "Tudo bem. A conversa permanece salva para consulta. Quando precisar, envie uma nova mensagem." },
    { keys: ["obrigado", "obrigada", "valeu"], reply: "Por nada! 😊 Continuo à disposição para registrar sua dúvida." }
  ];
  const fallback = "Recebi sua mensagem. Pode explicar sua dúvida com mais detalhes? O chatbot fará a triagem e a equipe de suporte acompanhará o atendimento.";

  function normalize(value) {
    return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
  }

  function time() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function init() {
    if (document.querySelector(".uc-chat")) return;
    const user = window.UniCakeAuth?.getUser();
    const widget = document.createElement("aside");
    widget.className = "uc-chat";
    widget.innerHTML = `
      <button class="uc-chat-toggle" type="button" aria-label="Abrir atendimento UniCake" aria-expanded="false">💬</button>
      <section class="uc-chat-window" hidden aria-label="Atendimento UniCake">
        <header class="uc-chat-header">
          <div><h2>Suporte UniCake</h2><div class="uc-chat-status">● Chatbot online • equipe acompanha</div></div>
          <button class="uc-chat-close" type="button" aria-label="Fechar atendimento">×</button>
        </header>
        <div class="uc-chat-messages" aria-live="polite"></div>
        <div class="uc-chat-quick"></div>
        <form class="uc-chat-form">
          <input type="text" placeholder="Digite sua mensagem..." autocomplete="off" aria-label="Mensagem" required />
          <button type="submit" aria-label="Enviar mensagem">➤</button>
        </form>
        <div class="uc-chat-note">Chatbot 24h • suporte acompanha as conversas</div>
      </section>
    `;
    document.body.appendChild(widget);

    const toggle = widget.querySelector(".uc-chat-toggle");
    const windowEl = widget.querySelector(".uc-chat-window");
    const messages = widget.querySelector(".uc-chat-messages");
    const quick = widget.querySelector(".uc-chat-quick");
    const input = widget.querySelector("input");
    let history = [];
    try {
      const storedHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(storedHistory)) history = storedHistory;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
    }

    function save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...messages.children].map((item) => ({
        type: item.classList.contains("user") ? "user" : "bot",
        text: item.querySelector(".uc-chat-text").textContent,
        time: item.querySelector(".uc-chat-time").textContent
      }))));
    }

    function addMessage(text, isUser, shouldSave = true, messageTime = time()) {
      const item = document.createElement("div");
      item.className = `uc-chat-message ${isUser ? "user" : "bot"}`;
      item.innerHTML = `<div class="uc-chat-text">${escapeHtml(text)}</div><span class="uc-chat-time">${messageTime}</span>`;
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
      if (shouldSave) save();
    }

    function showQuickReplies() {
      quick.innerHTML = "";
      quickReplies.forEach((label) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = label;
        button.addEventListener("click", () => send(label));
        quick.appendChild(button);
      });
    }

    function answer(text) {
      const normalized = normalize(text);
      const match = responses.find((item) => item.keys.some((key) => normalized.includes(normalize(key))));
      return match ? match.reply : fallback;
    }

    function send(value) {
      const text = String(value || "").trim();
      if (!text) return;
      if (!window.UniCakeAuth?.isLoggedIn()) {
        addMessage("Para iniciar o atendimento, entre na sua conta Google pela opção Entrar.", false);
        return;
      }
      addMessage(text, true);
      input.value = "";
      window.setTimeout(() => addMessage(answer(text), false), 450);
    }

    history.forEach((item) => addMessage(item.text, item.type === "user", false, item.time));
    if (!history.length) {
      const greeting = user?.name ? `Olá, ${user.name.split(" ")[0]}! 👋 Envie sua dúvida para o suporte.` : "Olá! 👋 Envie sua dúvida para o suporte UniCake.";
      addMessage(greeting, false);
    }
    showQuickReplies();
    toggle.addEventListener("click", () => {
      const isHidden = windowEl.hasAttribute("hidden");
      windowEl.toggleAttribute("hidden", !isHidden);
      toggle.setAttribute("aria-expanded", String(isHidden));
      if (isHidden) input.focus();
    });
    widget.querySelector(".uc-chat-close").addEventListener("click", () => {
      windowEl.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
    });
    widget.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      send(input.value);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();