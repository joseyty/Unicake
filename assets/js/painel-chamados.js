(function () {
  const U = window.UniCake;
  const Auth = window.UniCakeAuth;
  const Chamados = window.UniCakeChamados;
  if (!U || !Auth || !Chamados) return;

  const { el } = Chamados;

  // Chama a API com a sessão do cliente; o servidor confere se a conta é de administrador
  async function api(path, options = {}) {
    const headers = { Authorization: "Bearer " + Auth.getToken() };
    if (options.body) headers["Content-Type"] = "application/json";
    let response;
    try {
      response = await fetch(U.apiBase + path, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      throw new Error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.erro || "Não foi possível concluir. Tente novamente.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  // Painel de suporte (PainelSuporte.html): a equipe lê e responde os chamados enviados pelo site
  function initPainel() {
    const painel = document.getElementById("painelChamados");
    if (!painel) return;

    const status = document.getElementById("painelChamadosStatus");
    const lista = document.getElementById("chamadosLista");
    const filtroTipo = document.getElementById("filtroTipo");
    const filtroStatus = document.getElementById("filtroStatus");

    if (!Auth.getUser()) {
      window.location.replace("Entrar.html");
      return;
    }

    Object.entries(Chamados.TIPOS).forEach(([valor, rotulo]) => {
      const option = el("option", "", rotulo);
      option.value = valor;
      filtroTipo.appendChild(option);
    });
    Object.entries(Chamados.STATUS).forEach(([valor, rotulo]) => {
      const option = el("option", "", rotulo);
      option.value = valor;
      filtroStatus.appendChild(option);
    });

    function adminCard(chamado) {
      const card = Chamados.card(chamado, { showAuthor: true });

      const form = el("form", "chamado-form");
      const label = el("label", "", chamado.resposta ? "Editar resposta" : "Responder");
      const texto = el("textarea");
      texto.name = "resposta";
      texto.rows = 3;
      texto.maxLength = 2000;
      texto.required = true;
      texto.placeholder = "Escreva a resposta que o cliente vai ler";
      texto.value = chamado.resposta || "";
      label.appendChild(texto);
      form.appendChild(label);

      const acoes = el("div", "chamado-acoes");
      const enviar = el("button", "", chamado.resposta ? "Atualizar resposta" : "Enviar resposta");
      enviar.type = "submit";
      acoes.appendChild(enviar);

      const resolvido = chamado.status === "RESOLVIDO";
      const situacao = el("button", "chamado-secundario", resolvido ? "Reabrir" : "Marcar como resolvido");
      situacao.type = "button";
      situacao.addEventListener("click", () =>
        atualizar(card, situacao, () =>
          api(`/api/suporte/chamados/${chamado.id}/status`, { method: "POST", body: { status: resolvido ? "ABERTO" : "RESOLVIDO" } })
        )
      );
      acoes.appendChild(situacao);
      form.appendChild(acoes);

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        atualizar(card, enviar, () =>
          api(`/api/suporte/chamados/${chamado.id}/resposta`, { method: "POST", body: { resposta: texto.value } })
        );
      });

      card.appendChild(form);
      return card;
    }

    // Executa a ação e troca o cartão pela versão atualizada que o servidor devolve
    async function atualizar(card, botao, acao) {
      botao.disabled = true;
      try {
        const chamado = await acao();
        card.replaceWith(adminCard(chamado));
        U.toast("Chamado atualizado.");
      } catch (error) {
        U.toast(error.message);
        botao.disabled = false;
      }
    }

    async function carregar() {
      const params = new URLSearchParams();
      if (filtroTipo.value) params.set("tipo", filtroTipo.value);
      if (filtroStatus.value) params.set("status", filtroStatus.value);
      status.hidden = false;
      status.textContent = "Carregando chamados...";
      try {
        const chamados = await api("/api/suporte/chamados" + (params.size ? "?" + params : ""));
        lista.innerHTML = "";
        painel.hidden = false;
        status.textContent = chamados.length
          ? `${chamados.length} chamado${chamados.length > 1 ? "s" : ""}`
          : "Nenhum chamado com esses filtros.";
        chamados.forEach((chamado) => lista.appendChild(adminCard(chamado)));
      } catch (error) {
        if (error.status === 401) {
          Auth.clearSession();
          window.location.replace("Entrar.html");
        } else if (error.status === 403) {
          // Conta sem permissão: volta para a loja
          window.location.replace("index.html");
        } else {
          status.textContent = error.message;
        }
      }
    }

    filtroTipo.addEventListener("change", carregar);
    filtroStatus.addEventListener("change", carregar);
    carregar();
  }

  U.ready(initPainel);
})();
