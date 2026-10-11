(function () {
  // Peças comuns às telas que mostram chamados de suporte: "Minha conta" e o painel da equipe
  const TIPOS = {
    PEDIDO: "Pedido",
    PRODUTO: "Produto",
    RECLAMACAO: "Reclamação",
    BUG: "Bug ou erro no site",
    FEEDBACK: "Sugestão ou elogio",
    EMPRESAS: "Empresas",
    OUTRO: "Outro",
  };

  const STATUS = {
    ABERTO: "Aguardando resposta",
    RESPONDIDO: "Respondido",
    RESOLVIDO: "Resolvido",
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function dataHora(valor) {
    if (!valor) return "";
    const data = new Date(valor);
    return `${data.toLocaleDateString("pt-BR")} às ${data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Monta o cartão de um chamado. Tudo entra como texto puro, porque foi digitado por visitantes.
  function card(chamado, options = {}) {
    const article = el("article", "chamado");
    article.dataset.chamadoId = chamado.id;

    const topo = el("div", "chamado-topo");
    topo.appendChild(el("span", "chamado-tipo", TIPOS[chamado.tipo] || chamado.tipo));
    topo.appendChild(el("span", `chamado-status is-${String(chamado.status).toLowerCase()}`, STATUS[chamado.status] || chamado.status));
    topo.appendChild(el("time", "chamado-data", dataHora(chamado.data_criacao)));
    article.appendChild(topo);

    if (options.showAuthor) {
      article.appendChild(el("p", "chamado-autor", `${chamado.nome} · ${chamado.email}`));
    }
    article.appendChild(el("p", "chamado-mensagem", chamado.mensagem));

    if (chamado.resposta) {
      const resposta = el("div", "chamado-resposta");
      resposta.appendChild(el("strong", "", `Resposta da equipe UniCake · ${dataHora(chamado.data_resposta)}`));
      resposta.appendChild(el("p", "", chamado.resposta));
      article.appendChild(resposta);
    }
    return article;
  }

  window.UniCakeChamados = { TIPOS, STATUS, el, card };
})();
