(function () {
  const U = window.UniCake;
  if (!U) return;

  function renderAccessibility() {
    const target = document.getElementById("site-accessibility");
    if (!target) return;

    target.innerHTML = `
      <div class="access-widget">
        <button class="access-toggle" type="button" data-access-open aria-expanded="false" aria-controls="accessPanel" title="Abrir acessibilidade">
          ${U.icons.access}
        </button>
        <section class="access-panel" id="accessPanel" aria-label="Menu de acessibilidade">
          <header>
            <h2>Acessibilidade</h2>
            <button class="icon-button" type="button" data-access-close title="Fechar acessibilidade">${U.icons.close}</button>
          </header>
          <div class="access-actions">
            <button type="button" data-access-action="font-up">Aumentar texto</button>
            <button type="button" data-access-action="font-down">Diminuir texto</button>
            <button type="button" data-access-action="contrast">Alto contraste</button>
            <button type="button" data-access-action="links">Destacar links</button>
            <button type="button" data-access-action="line">Espaçamento</button>
            <button type="button" data-access-action="motion">Reduzir movimento</button>
            <button type="button" data-access-action="reset">Restaurar</button>
          </div>
        </section>
      </div>
    `;
  }

  function getAccessState() {
    try {
      return JSON.parse(localStorage.getItem(U.storageKeys.access)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveAccessState(state) {
    localStorage.setItem(U.storageKeys.access, JSON.stringify(state));
  }

  function applyAccessState(state) {
    const root = document.documentElement;
    root.classList.toggle("access-contrast", !!state.contrast);
    root.classList.toggle("access-links", !!state.links);
    root.classList.toggle("access-line", !!state.line);
    root.classList.toggle("access-motion", !!state.motion);
    root.dataset.fontScale = String(state.fontScale || 0);
  }

  function initAccessibility() {
    let state = getAccessState();
    applyAccessState(state);

    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-access-open]");
      const close = event.target.closest("[data-access-close]");
      const action = event.target.closest("[data-access-action]");

      if (open) {
        document.body.classList.add("access-open");
        open.setAttribute("aria-expanded", "true");
      }
      if (close) {
        document.body.classList.remove("access-open");
        document.querySelector("[data-access-open]")?.setAttribute("aria-expanded", "false");
      }
      if (!action) return;

      const type = action.dataset.accessAction;
      if (type === "font-up") state.fontScale = Math.min(2, (state.fontScale || 0) + 1);
      if (type === "font-down") state.fontScale = Math.max(-1, (state.fontScale || 0) - 1);
      if (type === "contrast") state.contrast = !state.contrast;
      if (type === "links") state.links = !state.links;
      if (type === "line") state.line = !state.line;
      if (type === "motion") state.motion = !state.motion;
      if (type === "reset") state = {};

      applyAccessState(state);
      saveAccessState(state);
    });
  }

  U.ready(() => {
    renderAccessibility();
    initAccessibility();
  });
})();
