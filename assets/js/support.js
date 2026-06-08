(function () {
  const U = window.UniCake;
  if (!U) return;

  function renderSupportWidget() {
    const target = document.getElementById("site-support");
    if (!target) return;

    target.innerHTML = `
      <div class="support-widget" aria-live="polite">
        <button class="support-toggle" type="button" data-support-open aria-expanded="false" aria-controls="supportPanel" title="Abrir suporte">
          ${U.icons.chat}
        </button>
        <section class="support-panel" id="supportPanel" aria-label="Chat de suporte UniCake">
          <header class="support-header">
            <div>
              <h2>Suporte UniCake</h2>
              <p>Atendimento online para pedidos, produtos e empresas.</p>
            </div>
            <button class="icon-button" type="button" data-support-close title="Fechar suporte">${U.icons.close}</button>
          </header>
          <div class="support-messages" data-support-messages>
            <div class="message message-bot">
              <p>Olá! Como posso ajudar hoje?</p>
              <span>Agora</span>
            </div>
          </div>
          <div class="support-options">
            <button type="button" data-support-message="pedido">Meu pedido</button>
            <button type="button" data-support-message="produto">Produtos</button>
            <button type="button" data-support-message="reclamacao">Reclamação</button>
            <button type="button" data-support-message="outro">Outro assunto</button>
          </div>
          <form class="support-form" data-support-form>
            <input type="text" name="message" placeholder="Digite sua mensagem" aria-label="Mensagem para o suporte" required />
            <button type="submit" title="Enviar mensagem">${U.icons.send}</button>
          </form>
        </section>
      </div>
    `;
  }

  function appendSupportMessage(text, type) {
    const messages = document.querySelector("[data-support-messages]");
    if (!messages) return;
    const div = document.createElement("div");
    div.className = `message ${type === "user" ? "message-user" : "message-bot"}`;
    div.innerHTML = `<p>${text}</p><span>Agora</span>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function initSupport() {
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-support-open]");
      const close = event.target.closest("[data-support-close]");
      const quick = event.target.closest("[data-support-message]");
      if (open) {
        document.body.classList.add("support-open");
        open.setAttribute("aria-expanded", "true");
      }
      if (close) {
        document.body.classList.remove("support-open");
        document.querySelector("[data-support-open]")?.setAttribute("aria-expanded", "false");
      }
      if (quick) {
        const key = quick.dataset.supportMessage;
        appendSupportMessage(quick.textContent.trim(), "user");
        appendSupportMessage((U.data.supportReplies || {})[key] || "Certo, me conte um pouco mais.", "bot");
      }
    });

    document.querySelector("[data-support-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.currentTarget.elements.message;
      const text = input.value.trim();
      if (!text) return;
      appendSupportMessage(text, "user");
      appendSupportMessage("Recebemos sua mensagem. Um atendente continuará o suporte por aqui.", "bot");
      input.value = "";
    });
  }

  U.ready(() => {
    renderSupportWidget();
    initSupport();
  });
})();
