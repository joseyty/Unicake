(function () {
  const STORAGE_KEY = "unicake.chat.history";
  const LEGACY_STORAGE_KEY = "unicake.support24h.history";
  const MAX_HISTORY = 60;
  const DELIVERY_FEE = 5;
  const FREE_DELIVERY_ABOVE = 120;
  const defaultChips = ["Promoções", "Mais pedidos", "Entrega e frete", "Formas de pagamento", "Lojas", "Falar com o suporte"];

  const ICONS = {
    chat: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    send: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    trash: '<svg aria-hidden="true" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
  };

  const data = window.UniCakeData || {};
  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  // Palavras que não ajudam a identificar um produto ou assunto
  const STOP_WORDS = new Set(
    ("a o as os um uma uns umas de da do das dos e ou em no na nos nas com sem para pra por que qual quais quanto quanta como " +
      "tem ter voce voces vc vcs eu me meu minha quero queria gostaria preciso procuro busco ver mostrar mostra mostre algum alguma " +
      "sobre favor por favor tipo ai la aqui isso esse essa este esta custa custam preco valor fazem faz vende vendem tem").split(" ")
  );

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  // Divide em palavras sem acento e no singular simples ("bolos" -> "bolo")
  function tokenize(value) {
    return normalize(value)
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word));
  }

  function time() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  const products = () => data.products || [];
  const stores = () => data.stores || [];
  const categoryLabel = (id) => (data.categories || []).find((category) => category.id === id)?.label || id;

  // Produtos que combinam com as palavras da pergunta, do mais parecido para o menos.
  // O nome do produto pesa mais que a categoria, e a categoria mais que o nome da loja.
  function searchProducts(words) {
    const terms = words.filter((word) => !STOP_WORDS.has(word));
    if (!terms.length) return [];
    const scored = products()
      .map((product) => {
        const name = new Set(tokenize(product.name));
        const category = new Set(tokenize(product.category + " " + categoryLabel(product.category)));
        const store = new Set(tokenize(product.store));
        const score = terms.reduce(
          (total, term) => total + (name.has(term) ? 3 : 0) + (category.has(term) ? 2 : 0) + (store.has(term) ? 1 : 0),
          0
        );
        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
    // Descarta resultados fracos quando existe um bem melhor (ex.: só o nome da loja combinou)
    const best = scored.length ? scored[0].score : 0;
    return scored.filter((item) => item.score >= best / 2).map((item) => item.product);
  }

  function findStore(text) {
    const normalized = normalize(text);
    return stores().find((store) => normalized.includes(normalize(store.name)));
  }

  function cartSummary() {
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem("unicake.cart")) || [];
    } catch (error) {
      cart = [];
    }
    const items = cart
      .map((item) => ({ product: products().find((product) => product.id === item.id), qty: item.qty }))
      .filter((item) => item.product);
    const subtotal = items.reduce((total, item) => total + item.product.price * item.qty, 0);
    return { items, subtotal };
  }

  // Cada resposta: { text, products?: [ids], links?: [{ label, href }], chips?: [rótulos], action? }
  function answer(text, user) {
    const normalized = normalize(text);
    const words = tokenize(text);
    const wordSet = new Set(words);
    const has = (...keys) => keys.some((key) => (key.includes(" ") ? normalized.includes(key) : wordSet.has(key)));
    const ids = (list, limit = 4) => list.slice(0, limit).map((product) => product.id);
    const matches = searchProducts(words);

    if (words.length <= 3 && !matches.length && has("oi", "ola", "bom dia", "boa tarde", "boa noite", "hey", "eai", "opa")) {
      const name = user?.name ? `, ${user.name.split(" ")[0]}` : "";
      return {
        text: `Olá${name}! 👋 Sou a assistente virtual da UniCake. Posso sugerir doces, mostrar promoções e tirar dúvidas sobre entrega, pagamento e pedidos. O que você procura?`,
      };
    }

    if (has("obrigado", "obrigada", "valeu", "agradeco", "brigado", "brigada")) {
      return { text: "Por nada! 😊 Se precisar de mais alguma coisa, é só chamar." };
    }

    if (words.length <= 4 && has("tchau", "ate logo", "ate mais", "encerrar", "finalizar conversa")) {
      return { text: "Até logo! 🍰 Sua conversa fica salva aqui caso queira continuar depois." };
    }

    if (has("atendente", "humano", "reclamacao", "reclamar", "problema", "erro", "errado", "estragado", "reembolso", "devolucao", "falar com", "suporte")) {
      return {
        text: "Para falar com a nossa equipe, registre uma solicitação na página de Suporte informando o número do pedido e o que aconteceu. Eu sou uma assistente automática e não consigo abrir chamados por aqui.",
        links: [{ label: "Abrir página de Suporte", href: "Suporte.html" }],
        chips: ["Acompanhar pedido", "Entrega e frete", "Promoções"],
      };
    }

    if (has("carrinho", "sacola", "cesta")) {
      const { items, subtotal } = cartSummary();
      if (!items.length) {
        return { text: "Seu carrinho está vazio no momento. Quer ver os produtos mais pedidos?", chips: ["Mais pedidos", "Promoções", "Categorias"] };
      }
      const delivery = subtotal > FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
      const lines = items.map((item) => `• ${item.qty}× ${item.product.name} — ${money.format(item.product.price * item.qty)}`);
      return {
        text: `No seu carrinho:\n${lines.join("\n")}\n\nSubtotal: ${money.format(subtotal)}\nEntrega: ${delivery ? money.format(delivery) : "grátis"}`,
        action: "open-cart",
        chips: ["Formas de pagamento", "Tenho um cupom", "Entrega e frete"],
      };
    }

    if (has("acompanhar", "rastrear", "rastreio", "andamento", "status", "atrasado", "atraso", "onde esta", "meu pedido", "cade")) {
      return {
        text: "Ao finalizar a compra, o site mostra o número do seu pedido: guarde esse número. O acompanhamento em tempo real ainda não está disponível no site; para saber do andamento, fale com a equipe pela página de Suporte informando o número.",
        links: [{ label: "Abrir página de Suporte", href: "Suporte.html" }],
      };
    }

    if (has("pagamento", "pagar", "pago", "pix", "cartao", "credito", "debito", "dinheiro", "boleto", "parcelar", "parcela")) {
      return {
        text: "Aceitamos Pix, cartão e dinheiro. Você escolhe a forma de pagamento no carrinho, antes de finalizar o pedido. Boleto e parcelamento não estão disponíveis.",
        chips: ["Meu carrinho", "Tenho um cupom", "Entrega e frete"],
      };
    }

    if (has("entrega", "entregam", "entregar", "frete", "taxa", "prazo", "demora", "chega", "chegar", "delivery", "retirar", "retirada")) {
      const times = stores().map((store) => `• ${store.name}: ${store.time}`);
      return {
        text: `A entrega custa ${money.format(DELIVERY_FEE)} e é grátis em pedidos acima de ${money.format(FREE_DELIVERY_ABOVE)} ou com cupom de assinante.\n\nTempo médio por loja:\n${times.join("\n")}`,
        chips: ["Lojas", "Tenho um cupom", "Promoções"],
      };
    }

    if (has("cupom", "cupon", "codigo", "desconto", "voucher")) {
      return {
        text: "Use o cupom UNICAKE10 para ganhar 10% de desconto em qualquer pedido. Assinantes dos planos têm cupons próprios, com desconto maior e frete grátis. O cupom é aplicado no carrinho, no campo \"Cupom\".",
        action: has("aplicar", "usar") ? "open-cart" : undefined,
        links: [{ label: "Ver planos", href: "ParaEmpresas.html" }],
        chips: ["Meu carrinho", "Promoções"],
      };
    }

    if (has("promocao", "promocoe", "oferta", "liquidacao")) {
      const promos = products().filter((product) => product.promo);
      const filtered = matches.filter((product) => product.promo);
      const list = filtered.length ? filtered : promos;
      return {
        text: filtered.length ? "Encontrei estas ofertas para o que você procura:" : "Estas são as promoções de hoje:",
        products: ids(list),
        links: [{ label: "Ver todas as promoções", href: "promocoes.html" }],
      };
    }

    if (has("plano", "assinatura", "assinar", "empresa", "corporativo")) {
      const plans = (data.plans || []).map((plan) => `• ${plan.name}: ${plan.price} ${plan.period}`);
      return {
        text: `Temos planos mensais para empresas e equipes:\n${plans.join("\n")}\n\nCada plano dá direito a um cupom com desconto e frete grátis.`,
        links: [{ label: "Conhecer os planos", href: "ParaEmpresas.html" }],
      };
    }

    if (has("vender", "confeiteiro", "confeiteira", "parceiro", "parceria", "cadastrar minha loja", "minha confeitaria", "cnpj")) {
      return {
        text: "Que bom! Confeiteiros podem se cadastrar na Área do confeiteiro informando nome, nome da loja, CNPJ, e-mail e senha.",
        links: [{ label: "Área do confeiteiro", href: "Confeiteiro.html" }],
      };
    }

    if (!has("em conta") && has("login", "logar", "entrar", "conta", "criar", "crio", "cadastro", "cadastrar", "senha", "registrar")) {
      return {
        text: "Você pode criar sua conta ou entrar com e-mail e senha, ou com o Google. É preciso estar logado para finalizar um pedido.",
        links: [{ label: "Entrar ou criar conta", href: "Entrar.html" }],
      };
    }

    if (has("personalizado", "personalizada", "personalizar", "encomenda", "encomendar", "tema", "sob medida", "foto")) {
      const custom = products().filter((product) => product.category === "personalizados");
      return {
        text: "Fazemos bolos personalizados! 🎂 Escolha um produto da categoria Personalizados e combine data, tema, tamanho e sabor com a loja pelo Suporte. O ideal é pedir com alguns dias de antecedência.",
        products: ids(custom),
        links: [{ label: "Ver personalizados", href: "ParaVoce.html?cat=personalizados" }],
      };
    }

    const store = findStore(text);
    if (store) {
      const fromStore = products().filter((product) => product.store === store.name);
      return {
        text: `${store.name} — ${store.specialty}\n${store.description}\n\n📍 ${store.neighborhood} · ⏱ ${store.time} · ⭐ ${Number(store.rating).toFixed(1)}`,
        products: ids(fromStore),
        links: [{ label: `Abrir a loja ${store.name}`, href: `Loja.html?id=${encodeURIComponent(store.id)}` }],
      };
    }

    if (has("loja", "confeitaria", "doceria", "bairro", "perto")) {
      const lines = stores().map((item) => `• ${item.name} (${item.neighborhood}) — ${item.specialty}`);
      return {
        text: `Estas são as confeitarias parceiras:\n${lines.join("\n")}\n\nDiga o nome de uma loja para ver os produtos dela.`,
        links: [{ label: "Ver todas as lojas", href: "paginalojas.html" }],
        chips: stores().slice(0, 4).map((item) => item.name),
      };
    }

    if (has("horario", "hora", "aberto", "abre", "abrem", "fecha", "fecham", "funciona", "funcionam", "funcionamento")) {
      return {
        text: "Você pode fazer pedidos pelo site a qualquer hora. O tempo de entrega depende da loja escolhida e aparece em cada confeitaria.",
        chips: ["Lojas", "Entrega e frete"],
      };
    }

    if (has("barato", "economico", "menor preco", "em conta")) {
      const list = (matches.length ? matches : products()).slice().sort((a, b) => a.price - b.price);
      return { text: "Estas são as opções com menor preço:", products: ids(list, 3) };
    }

    if (matches.length) {
      return {
        text: matches.length === 1 ? "Encontrei este produto:" : "Encontrei estas opções para você:",
        products: ids(matches),
        links: matches.length > 4 ? [{ label: "Ver todos os resultados", href: `ParaVoce.html?q=${encodeURIComponent(text)}` }] : undefined,
      };
    }

    if (has("categoria", "cardapio", "menu", "produto", "opcoe", "opcao", "doce", "sabor", "sabore")) {
      return {
        text: "Trabalhamos com estas categorias. Escolha uma para ver os produtos:",
        chips: (data.categories || []).map((category) => category.label),
        links: [{ label: "Ver todos os produtos", href: "ParaVoce.html" }],
      };
    }

    if (has("mais pedido", "mais pedidos", "popular", "populare", "recomenda", "recomendacao", "sugestao", "sugere", "indica", "melhor", "melhore", "favorito")) {
      const popular = products().filter((product) => product.popular);
      return { text: "Estes são os mais pedidos pelos nossos clientes:", products: ids(popular) };
    }

    if (has("festa", "aniversario", "comemoracao")) {
      const party = products().filter((product) => product.party);
      return { text: "Para festas, estas são as opções mais procuradas:", products: ids(party) };
    }

    if (has("ajuda", "ajudar", "duvida", "o que voce faz", "como funciona")) {
      return {
        text: "Posso ajudar com:\n• sugestões de doces e busca de produtos\n• promoções e cupons\n• entrega, frete e formas de pagamento\n• informações das lojas\n• dúvidas sobre pedidos e sua conta",
      };
    }

    return {
      text: "Não entendi muito bem. 🤔 Tente perguntar por um doce (ex.: \"bolo de chocolate\"), uma loja ou escolha um dos assuntos abaixo. Se preferir, a equipe atende pela página de Suporte.",
      links: [{ label: "Abrir página de Suporte", href: "Suporte.html" }],
    };
  }

  function init() {
    if (document.querySelector(".uc-chat")) return;
    const getUser = () => window.UniCakeAuth?.getUser?.() || null;
    const widget = document.createElement("aside");
    widget.className = "uc-chat";
    widget.innerHTML = `
      <button class="uc-chat-toggle" type="button" aria-label="Abrir assistente UniCake" aria-expanded="false">
        <span class="uc-chat-toggle-open">${ICONS.chat}</span>
        <span class="uc-chat-toggle-close">${ICONS.close}</span>
      </button>
      <section class="uc-chat-window" hidden aria-label="Assistente UniCake">
        <header class="uc-chat-header">
          <div class="uc-chat-identity">
            <img class="uc-chat-avatar" src="../assets/img/logo-bolo.png" alt="" />
            <div><h2>Assistente UniCake</h2><div class="uc-chat-status"><span class="uc-chat-dot"></span>Online • responde na hora</div></div>
          </div>
          <div class="uc-chat-actions">
            <button class="uc-chat-clear" type="button" aria-label="Limpar conversa" title="Limpar conversa">${ICONS.trash}</button>
            <button class="uc-chat-close" type="button" aria-label="Fechar assistente" title="Fechar">${ICONS.close}</button>
          </div>
        </header>
        <div class="uc-chat-messages" aria-live="polite"></div>
        <div class="uc-chat-quick"></div>
        <form class="uc-chat-form">
          <input type="text" placeholder="Pergunte sobre doces, entrega, pagamento..." autocomplete="off" aria-label="Mensagem" maxlength="300" required />
          <button type="submit" aria-label="Enviar mensagem">${ICONS.send}</button>
        </form>
        <div class="uc-chat-note">Assistente automática • para casos específicos, use a página Suporte</div>
      </section>
    `;
    document.body.appendChild(widget);

    const toggle = widget.querySelector(".uc-chat-toggle");
    const windowEl = widget.querySelector(".uc-chat-window");
    const messages = widget.querySelector(".uc-chat-messages");
    const quick = widget.querySelector(".uc-chat-quick");
    const input = widget.querySelector("input");
    let history = [];
    let typing = null;

    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(stored)) history = stored.filter((item) => item && typeof item.text === "string");
    } catch (error) {
      history = [];
    }

    function save() {
      history = history.slice(-MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error("Não foi possível salvar a conversa:", error);
      }
    }

    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function productCard(product) {
      const card = el("div", "uc-chat-product");
      if (product.image) {
        const image = el("img");
        image.src = product.image;
        image.alt = "";
        image.loading = "lazy";
        card.appendChild(image);
      }
      const info = el("div", "uc-chat-product-info");
      info.appendChild(el("strong", "", product.name));
      info.appendChild(el("small", "", product.store));
      info.appendChild(el("span", "", money.format(product.price)));
      card.appendChild(info);
      const add = el("button", "", "Adicionar");
      add.type = "button";
      add.setAttribute("aria-label", `Adicionar ${product.name} ao carrinho`);
      add.addEventListener("click", () => {
        if (window.UniCakeCart) window.UniCakeCart.add(product.id);
        else window.location.href = `ParaVoce.html?q=${encodeURIComponent(product.name)}`;
      });
      card.appendChild(add);
      return card;
    }

    function renderMessage(message) {
      const item = el("div", `uc-chat-message ${message.from === "user" ? "user" : "bot"}`);
      item.appendChild(el("div", "uc-chat-text", message.text));

      const list = (message.products || []).map((id) => products().find((product) => product.id === id)).filter(Boolean);
      if (list.length) {
        const wrap = el("div", "uc-chat-products");
        list.forEach((product) => wrap.appendChild(productCard(product)));
        item.appendChild(wrap);
      }

      if (message.links?.length) {
        const wrap = el("div", "uc-chat-links");
        message.links.forEach((link) => {
          const anchor = el("a", "", link.label);
          anchor.href = link.href;
          wrap.appendChild(anchor);
        });
        item.appendChild(wrap);
      }

      item.appendChild(el("span", "uc-chat-time", message.time));
      messages.appendChild(item);
      messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(message) {
      const full = { time: time(), ...message };
      history.push(full);
      save();
      renderMessage(full);
    }

    function showChips(labels) {
      quick.innerHTML = "";
      (labels?.length ? labels : defaultChips).forEach((label) => {
        const button = el("button", "", label);
        button.type = "button";
        button.addEventListener("click", () => send(label));
        quick.appendChild(button);
      });
    }

    function showTyping() {
      typing = el("div", "uc-chat-message bot uc-chat-typing");
      typing.setAttribute("aria-label", "Assistente digitando");
      typing.append(el("span"), el("span"), el("span"));
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;
    }

    function send(value) {
      const text = String(value || "").trim();
      if (!text || typing) return;
      addMessage({ from: "user", text });
      input.value = "";
      showTyping();
      window.setTimeout(() => {
        typing.remove();
        typing = null;
        const reply = answer(text, getUser());
        addMessage({ from: "bot", text: reply.text, products: reply.products, links: reply.links });
        showChips(reply.chips);
        if (reply.action === "open-cart") window.UniCakeCart?.open();
      }, 550);
    }

    function greet() {
      const user = getUser();
      const name = user?.name ? `, ${user.name.split(" ")[0]}` : "";
      addMessage({
        from: "bot",
        text: `Olá${name}! 👋 Sou a assistente virtual da UniCake. Pergunte por um doce, uma loja, promoções, entrega ou pagamento.`,
      });
    }

    function setOpen(open) {
      windowEl.toggleAttribute("hidden", !open);
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        messages.scrollTop = messages.scrollHeight;
        input.focus();
      }
    }

    history.forEach(renderMessage);
    if (!history.length) greet();
    showChips();

    toggle.addEventListener("click", () => setOpen(windowEl.hasAttribute("hidden")));
    widget.querySelector(".uc-chat-close").addEventListener("click", () => setOpen(false));
    widget.querySelector(".uc-chat-clear").addEventListener("click", () => {
      history = [];
      messages.innerHTML = "";
      greet();
      showChips();
      input.focus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !windowEl.hasAttribute("hidden")) {
        const focusInside = widget.contains(document.activeElement);
        setOpen(false);
        if (focusInside) toggle.focus();
      }
    });
    widget.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      send(input.value);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
