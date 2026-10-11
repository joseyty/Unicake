(function () {
  const U = window.UniCake;
  if (!U) return;

  const TOKEN_STORAGE_KEY = "unicake.confeiteiro.token";
  const API_BASE = (window.UniCakeConfig && window.UniCakeConfig.apiBase) || "http://127.0.0.1:5000";

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
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

  // Chama a API do backend (backend/api.py); o login e a senha são conferidos no servidor
  async function api(path, options = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const response = await fetch(API_BASE + path, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.erro || "Não foi possível concluir. Tente novamente.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function initConfeiteiro() {
    const authCard = document.getElementById("confeiteiroAuth");
    const painel = document.getElementById("confeiteiroPainel");
    const form = document.getElementById("confeiteiroForm");
    if (!authCard || !painel || !form) return;

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

    function showPainel(confeiteiro) {
      document.getElementById("painel-title").textContent = `Olá, ${confeiteiro.nome}!`;
      painel.querySelectorAll("[data-confeiteiro]").forEach((el) => {
        const field = el.dataset.confeiteiro;
        let value = confeiteiro[field];
        if (field === "data_cadastro" && value) value = new Date(value).toLocaleDateString("pt-BR");
        if (field === "cnpj" && value) value = formatCnpj(value);
        el.textContent = value || "Não informado";
      });
      authCard.hidden = true;
      painel.hidden = false;
    }

    function showAuth() {
      painel.hidden = true;
      authCard.hidden = false;
      form.reset();
      setRegisterMode(false);
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
        setToken(result.token);
        showPainel(result.confeiteiro);
        U.toast(isRegisterMode ? "Confeitaria cadastrada com sucesso." : `Bem-vindo, ${result.confeiteiro.nome}!`);
      } catch (error) {
        status.textContent = error.status
          ? error.message
          : "Não foi possível conectar ao servidor. Tente novamente em instantes.";
      } finally {
        submit.disabled = false;
      }
    });

    document.getElementById("confeiteiroSair").addEventListener("click", async () => {
      try {
        await api("/api/confeiteiros/logout", { method: "POST" });
      } catch (error) {
        console.error("Erro ao encerrar sessão do confeiteiro:", error);
      }
      setToken("");
      showAuth();
    });

    // Restaura a sessão se o token salvo ainda for válido no servidor
    if (getToken()) {
      api("/api/confeiteiros/me")
        .then(showPainel)
        .catch((error) => {
          if (error.status === 401) setToken("");
        });
    }
  }

  U.ready(initConfeiteiro);
})();
