(function () {
  const U = window.UniCake;
  if (!U) return;

  const TOKEN_STORAGE_KEY = "unicake.confeiteiro.token";
  const PROFILE_STORAGE_KEY = "unicake.confeiteiro.perfil";
  const MODE_STORAGE_KEY = "unicake.modo";
  const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
  const LOYALTY_LIMIT = 10;
  const LOGIN_PAGE = "Confeiteiro.html";
  const PAINEL_PAGE = "MinhaLoja.html";
  const API_BASE = (window.UniCakeConfig && window.UniCakeConfig.apiBase) || "http://127.0.0.1:5000";

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  // Guarda a sessão e um resumo do perfil, que o cabeçalho usa para mostrar o menu do confeiteiro
  function saveSession(token, confeiteiro) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    saveProfile(confeiteiro);
    localStorage.setItem(MODE_STORAGE_KEY, "confeiteiro");
  }

  function saveProfile(confeiteiro) {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ nome: confeiteiro.nome, nome_loja: confeiteiro.nome_loja, email: confeiteiro.email })
    );
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    if (localStorage.getItem(MODE_STORAGE_KEY) === "confeiteiro") localStorage.removeItem(MODE_STORAGE_KEY);
  }

  // 00.000.000/0000-00; mantém letras porque o CNPJ alfanumérico também é aceito
  function formatCnpj(value) {
    const chars = String(value || "")
      .toUpperCase()
      .replace(/[^0-9A-Z]/g, "")
      .slice(0, 14);
    return [
      chars.slice(0, 2),
      chars.length > 2 ? "." + chars.slice(2, 5) : "",
      chars.length > 5 ? "." + chars.slice(5, 8) : "",
      chars.length > 8 ? "/" + chars.slice(8, 12) : "",
      chars.length > 12 ? "-" + chars.slice(12, 14) : "",
    ].join("");
  }

  // Chama a API do backend (backend/api.py); o login e a senha são conferidos no servidor.
  // body pode ser um objeto (enviado como JSON) ou um FormData (usado no envio da foto).
  async function api(path, options = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    let body;
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const response = await fetch(API_BASE + path, { method: options.method || "GET", headers, body });
    const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.erro || "Não foi possível concluir. Tente novamente.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function errorMessage(error) {
    return error.status ? error.message : "Não foi possível conectar ao servidor. Tente novamente em instantes.";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Tela de login e cadastro (Confeiteiro.html)
  function initAuth() {
    const form = document.getElementById("confeiteiroForm");
    if (!form) return;

    // Quem já está logado vai direto para a página da loja
    if (getToken()) {
      localStorage.setItem(MODE_STORAGE_KEY, "confeiteiro");
      window.location.replace(PAINEL_PAGE);
      return;
    }

    const status = document.getElementById("confeiteiroStatus");
    const toggleMode = document.getElementById("confeiteiroModeToggle");
    const submit = form.querySelector('[type="submit"]');
    const registerFields = ["nome", "nome_loja", "cnpj", "telefone"].map((name) => form.elements.namedItem(name));
    let isRegisterMode = false;

    // Aplica a máscara enquanto o confeiteiro digita; a validação de verdade é feita no servidor
    form.elements.cnpj.addEventListener("input", (event) => {
      event.target.value = formatCnpj(event.target.value);
    });

    function setRegisterMode(enabled) {
      isRegisterMode = enabled;
      registerFields.forEach((field) => {
        field.closest("label").hidden = !enabled;
        field.required = enabled && field.name !== "telefone";
      });
      form.elements.senha.minLength = enabled ? 8 : 0;
      form.elements.senha.autocomplete = enabled ? "new-password" : "current-password";
      form.elements.senha.placeholder = enabled ? "Mínimo de 8 caracteres" : "Digite sua senha";
      submit.textContent = enabled ? "Cadastrar confeitaria" : "Entrar";
      document.getElementById("confeiteiro-title").textContent = enabled ? "Cadastrar confeitaria" : "Entrar";
      document.getElementById("confeiteiroIntro").textContent = enabled
        ? "Crie sua conta de confeiteiro para vender seus doces na UniCake."
        : "Acesse sua conta de confeiteiro para gerenciar sua loja na UniCake.";
      toggleMode.textContent = enabled ? "Já é parceiro? Entre" : "Ainda não é parceiro? Cadastre sua confeitaria";
      status.textContent = "";
    }

    toggleMode.addEventListener("click", (event) => {
      event.preventDefault();
      setRegisterMode(!isRegisterMode);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const body = { email: form.elements.email.value, senha: form.elements.senha.value };
      if (isRegisterMode) {
        registerFields.forEach((field) => {
          body[field.name] = field.value;
        });
      }

      submit.disabled = true;
      status.textContent = isRegisterMode ? "Criando sua conta..." : "Entrando...";
      try {
        const result = await api(isRegisterMode ? "/api/confeiteiros" : "/api/confeiteiros/login", {
          method: "POST",
          body,
        });
        saveSession(result.token, result.confeiteiro);
        // Já entra como confeiteiro e segue para a página da loja, onde cadastra os produtos
        window.location.href = PAINEL_PAGE + (isRegisterMode ? "?novo=1" : "");
      } catch (error) {
        status.textContent = errorMessage(error);
        submit.disabled = false;
      }
    });
  }

  // Página da loja do confeiteiro (MinhaLoja.html): dados da conta e produtos
  function initPainel() {
    const painel = document.getElementById("confeiteiroPainel");
    if (!painel) return;

    const status = document.getElementById("painelStatus");

    // Sem sessão de confeiteiro não há o que mostrar aqui
    if (!getToken()) {
      window.location.replace(LOGIN_PAGE);
      return;
    }

    function showPainel(confeiteiro) {
      saveProfile(confeiteiro);
      const recemCadastrado = new URLSearchParams(window.location.search).has("novo");
      document.getElementById("painel-title").textContent = recemCadastrado
        ? `Bem-vindo(a), ${confeiteiro.nome}!`
        : `Olá, ${confeiteiro.nome}!`;
      if (recemCadastrado) {
        document.getElementById("painelIntro").textContent =
          "Sua confeitaria foi cadastrada. Agora adicione seus produtos com foto, valor e descrição.";
        // Tira o "?novo=1" do endereço para a mensagem não voltar ao recarregar a página
        window.history.replaceState(null, "", PAINEL_PAGE);
      }
      painel.querySelectorAll("[data-confeiteiro]").forEach((item) => {
        const field = item.dataset.confeiteiro;
        let value = confeiteiro[field];
        if (field === "data_cadastro" && value) value = new Date(value).toLocaleDateString("pt-BR");
        if (field === "cnpj" && value) value = formatCnpj(value);
        item.textContent = value || "Não informado";
      });
      status.hidden = true;
      painel.hidden = false;
      initProdutos();
      if (recemCadastrado) document.getElementById("produtoForm").elements.nome.focus();
    }

    document.getElementById("confeiteiroSair").addEventListener("click", async () => {
      try {
        await api("/api/confeiteiros/logout", { method: "POST" });
      } catch (error) {
        console.error("Erro ao encerrar sessão do confeiteiro:", error);
      }
      clearSession();
      window.location.href = LOGIN_PAGE;
    });

    // "Acessar como cliente": vai para a loja se já houver login de cliente; senão, para a tela de login
    const comoCliente = document.getElementById("confeiteiroComoCliente");
    comoCliente.href = localStorage.getItem("unicake.auth") ? "index.html" : "Entrar.html";
    comoCliente.addEventListener("click", () => {
      localStorage.setItem(MODE_STORAGE_KEY, "cliente");
    });

    // Só mostra a página se o token salvo ainda for válido no servidor
    api("/api/confeiteiros/me")
      .then(showPainel)
      .catch((error) => {
        if (error.status === 401) {
          clearSession();
          window.location.replace(LOGIN_PAGE);
        } else {
          status.textContent = errorMessage(error);
        }
      });
  }

  // Cadastro e lista dos produtos do confeiteiro logado
  let produtosIniciados = false;
  function initProdutos() {
    if (produtosIniciados) return;
    produtosIniciados = true;

    const form = document.getElementById("produtoForm");
    const status = document.getElementById("produtoStatus");
    const list = document.getElementById("meusProdutos");
    const preview = document.getElementById("produtoPreview");
    const submit = form.querySelector('[type="submit"]');
    const photo = form.elements.foto;
    const photoName = document.getElementById("produtoFotoNome");
    const loyaltyCount = document.getElementById("fidelidadeContagem");
    let previewUrl = null;

    function clearPreview() {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      preview.hidden = true;
      preview.removeAttribute("src");
      photoName.textContent = "Nenhuma foto escolhida";
    }

    photo.addEventListener("change", () => {
      clearPreview();
      const file = photo.files[0];
      if (!file) return;
      if (file.size > MAX_PHOTO_BYTES) {
        status.textContent = "A foto deve ter no máximo 4 MB.";
        photo.value = "";
        return;
      }
      status.textContent = "";
      previewUrl = URL.createObjectURL(file);
      preview.src = previewUrl;
      preview.hidden = false;
      photoName.textContent = file.name;
    });

    function productCard(produto) {
      const card = el("article", "meu-produto");
      card.dataset.produtoId = produto.id;
      if (produto.imagem_url) {
        const image = el("img");
        image.src = produto.imagem_url;
        image.alt = "";
        image.loading = "lazy";
        card.appendChild(image);
      }
      const info = el("div", "meu-produto-info");
      info.appendChild(el("strong", "", produto.nome));
      info.appendChild(el("span", "meu-produto-preco", U.money.format(Number(produto.preco))));
      info.appendChild(el("p", "", produto.descricao || ""));
      const ativo = produto.status === "ATIVO";
      info.appendChild(
        el("small", ativo ? "" : "is-inativo", ativo ? `No ar · estoque: ${produto.estoque}` : "Desativado (não aparece no site)")
      );
      card.appendChild(info);

      const actions = el("div", "meu-produto-acoes");
      const loyalty = el("label", "fidelidade-toggle");
      const check = el("input");
      check.type = "checkbox";
      check.checked = Boolean(produto.fidelidade);
      check.disabled = !ativo;
      check.dataset.fidelidade = "";
      check.addEventListener("change", () => toggleLoyalty(produto, check));
      loyalty.appendChild(check);
      loyalty.appendChild(el("span", "", "Cartão fidelidade"));
      actions.appendChild(loyalty);
      const remove = el("button", "", "Remover");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remover ${produto.nome}`);
      remove.addEventListener("click", () => removeProduct(produto, card));
      actions.appendChild(remove);
      card.appendChild(actions);
      return card;
    }

    // Mostra quantos produtos estão no cartão fidelidade e trava as caixas livres ao chegar no limite
    function updateLoyaltyCount() {
      const checks = [...list.querySelectorAll("[data-fidelidade]")];
      const total = checks.filter((check) => check.checked).length;
      loyaltyCount.textContent = `${total} de ${LOYALTY_LIMIT} produtos escolhidos`;
      checks.forEach((check) => {
        const inativo = check.closest(".meu-produto").querySelector("small.is-inativo");
        check.disabled = Boolean(inativo) || (!check.checked && total >= LOYALTY_LIMIT);
      });
    }

    async function toggleLoyalty(produto, check) {
      const ativo = check.checked;
      check.disabled = true;
      try {
        await api(`/api/confeiteiros/me/produtos/${produto.id}/fidelidade`, { method: "PUT", body: { ativo } });
        U.toast(ativo ? `${produto.nome} entrou no cartão fidelidade.` : `${produto.nome} saiu do cartão fidelidade.`);
      } catch (error) {
        check.checked = !ativo;
        U.toast(errorMessage(error));
      }
      updateLoyaltyCount();
    }

    function renderList(produtos) {
      list.innerHTML = "";
      if (!produtos.length) {
        list.appendChild(el("p", "empty-state", "Você ainda não cadastrou produtos."));
        updateLoyaltyCount();
        return;
      }
      produtos.forEach((produto) => list.appendChild(productCard(produto)));
      updateLoyaltyCount();
    }

    async function removeProduct(produto, card) {
      if (!confirm(`Remover "${produto.nome}" da sua loja?`)) return;
      try {
        const result = await api(`/api/confeiteiros/me/produtos/${produto.id}`, { method: "DELETE" });
        if (result.resultado === "desativado") {
          U.toast("Este produto já tem pedidos, então foi desativado em vez de apagado.");
          loadProducts();
        } else {
          card.remove();
          if (!list.children.length) renderList([]);
          updateLoyaltyCount();
          U.toast("Produto removido.");
        }
      } catch (error) {
        U.toast(errorMessage(error));
      }
    }

    async function loadProducts() {
      try {
        renderList(await api("/api/confeiteiros/me/produtos"));
      } catch (error) {
        list.innerHTML = "";
        list.appendChild(el("p", "empty-state", errorMessage(error)));
      }
    }

    async function loadCategories() {
      const select = form.elements.categoria_id;
      try {
        const categorias = await api("/api/categorias");
        select.innerHTML = "";
        const placeholder = el("option", "", "Escolha uma categoria");
        placeholder.value = "";
        select.appendChild(placeholder);
        categorias.forEach((categoria) => {
          const option = el("option", "", categoria.nome);
          option.value = categoria.id;
          select.appendChild(option);
        });
      } catch (error) {
        status.textContent = errorMessage(error);
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submit.disabled = true;
      status.textContent = "Enviando produto...";
      try {
        const produto = await api("/api/confeiteiros/me/produtos", { method: "POST", body: new FormData(form) });
        list.querySelector(".empty-state")?.remove();
        list.prepend(productCard(produto));
        updateLoyaltyCount();
        form.reset();
        clearPreview();
        status.textContent = "";
        U.toast(`${produto.nome} foi adicionado à sua loja.`);
      } catch (error) {
        status.textContent = errorMessage(error);
      } finally {
        submit.disabled = false;
      }
    });

    loadCategories();
    loadProducts();
  }

  U.ready(() => {
    initAuth();
    initPainel();
  });
})();
