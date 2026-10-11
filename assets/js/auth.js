(function () {
  const AUTH_STORAGE_KEY = "unicake.auth";
  const TOKEN_STORAGE_KEY = "unicake.cliente.token";
  // Antes as contas ficavam só no navegador; a chave antiga é apagada para não deixar senhas guardadas ali
  const LEGACY_USERS_KEY = "unicake.users";

  const GOOGLE_CLIENT_ID =
    "621954972061-afec0snf9b2hukkudnrb8a4hkpsr6rpc.apps.googleusercontent.com";

  function apiBase() {
    return (
      window.UniCake?.apiBase ||
      (window.UniCakeConfig && window.UniCakeConfig.apiBase) ||
      "http://127.0.0.1:5000"
    );
  }

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    } catch (error) {
      return "";
    }
  }

  // Chama a API do backend (backend/api.py): o cadastro, a senha e a sessão ficam no servidor
  async function api(path, options = {}) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    if (options.body) headers["Content-Type"] = "application/json";

    let response;
    try {
      response = await fetch(apiBase() + path, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      throw new Error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
    }

    const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.erro || "Não foi possível concluir. Tente novamente.");
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    if (localStorage.getItem("unicake.modo") === "cliente") localStorage.removeItem("unicake.modo");
  }

  // Guarda o token da sessão e um resumo do perfil, que o cabeçalho e o carrinho usam
  function saveSession(session, provider, picture) {
    const user = {
      id: session.cliente.id,
      name: session.cliente.nome,
      email: session.cliente.email,
      picture: picture || null,
      provider,
      hasPassword: Boolean(session.cliente.tem_senha),
      isAdmin: Boolean(session.cliente.administrador),
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    window.UniCakeAuth.setUser(user);
    return user;
  }

  function decodeGooglePicture(credential) {
    try {
      const base64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json).picture || null;
    } catch (error) {
      return null;
    }
  }

  function showStatus(message, ok) {
    const status = document.getElementById("loginStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = ok ? "green" : "red";
  }

  window.UniCakeAuth = {
    isLoggedIn() {
      return !!this.getUser();
    },

    getUser() {
      // Sem o token da sessão não há login válido (o servidor recusaria o pedido)
      if (!getToken()) return null;

      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        return null;
      }
    },

    getToken,

    setUser(user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      // Quem acabou de entrar como cliente passa a navegar com o perfil de cliente
      localStorage.setItem("unicake.modo", "cliente");
    },

    logout() {
      if (getToken()) {
        fetch(apiBase() + "/api/clientes/logout", {
          method: "POST",
          headers: { Authorization: "Bearer " + getToken() },
          keepalive: true,
        }).catch(() => {});
      }
      clearSession();
    },

    // Chamado quando o servidor avisa que a sessão não vale mais
    clearSession,

    async handleGoogleCallback(response) {
      if (!response || !response.credential) {
        console.error("Google não retornou uma credencial válida.");
        return null;
      }

      try {
        // O servidor confere a credencial com o Google antes de abrir a sessão
        const session = await api("/api/clientes/google", {
          method: "POST",
          body: { credential: response.credential },
        });
        const user = saveSession(session, "google", decodeGooglePicture(response.credential));
        showStatus(`Bem-vindo, ${user.name}! Você foi autenticado com Google.`, true);
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);
        return user;
      } catch (error) {
        console.error("Erro ao processar login do Google:", error);
        showStatus(error.message, false);
        return null;
      }
    },

    async registerTraditionalUser(name, email, password) {
      try {
        const session = await api("/api/clientes", {
          method: "POST",
          body: { nome: name, email, senha: password },
        });
        return { user: saveSession(session, "traditional") };
      } catch (error) {
        return { error: error.message };
      }
    },

    // Devolve o usuário, ou null se o e-mail ou a senha estiverem errados
    async handleTraditionalLogin(email, password) {
      if (!email || !password) {
        return null;
      }

      try {
        const session = await api("/api/clientes/login", {
          method: "POST",
          body: { email, senha: password },
        });
        return saveSession(session, "traditional");
      } catch (error) {
        if (error.status === 401) return null;
        throw error;
      }
    },

    // Confere no servidor se a sessão ainda vale e devolve os dados atuais da conta
    async fetchAccount() {
      return api("/api/clientes/me");
    },

    async deleteAccount(password) {
      try {
        await api("/api/clientes/me", { method: "DELETE", body: { senha: password || "" } });
        clearSession();
        return { ok: true };
      } catch (error) {
        if (error.status === 401) clearSession();
        return { error: error.message, expired: error.status === 401 };
      }
    },

    initGoogleSignIn() {
      const googleButton = document.querySelector(".google-button");
      // Só a tela de login tem o botão do Google
      if (!googleButton) return;

      const wrapper = googleButton.closest(".google-login");
      if (wrapper && !wrapper.dataset.bound) {
        wrapper.dataset.bound = "true";
        // O Google só desenha o botão dele se o script carregou e se o endereço do site está autorizado
        // no Google Cloud; sem isso, o clique avisa em vez de não fazer nada
        wrapper.addEventListener("click", () => {
          const oficial = googleButton.querySelector("iframe");
          if (!oficial || !oficial.offsetWidth) {
            showStatus("O login com Google não está disponível neste endereço. Entre com e-mail e senha.", false);
          }
        });
      }

      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        // O script do Google pode demorar; tenta mais algumas vezes
        this._googleTries = (this._googleTries || 0) + 1;
        if (this._googleTries < 10) setTimeout(() => this.initGoogleSignIn(), 500);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: (response) => {
          window.UniCakeAuth.handleGoogleCallback(response);
        },
      });

      // Limpa o conteúdo atual antes de renderizar
      googleButton.innerHTML = "";

      // O botão oficial fica invisível por cima do visual da UniCake e ocupa a mesma largura (o Google aceita de 200 a 400 px)
      const width = Math.max(200, Math.min(400, Math.round(wrapper ? wrapper.clientWidth : 300)));
      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width,
        text: "signin_with",
        shape: "rectangular",
      });
    },
  };

  function checkAndRestoreSession() {
    try {
      localStorage.removeItem(LEGACY_USERS_KEY);
      // Login antigo, de antes das contas irem para o servidor: precisa entrar de novo
      if (localStorage.getItem(AUTH_STORAGE_KEY) && !getToken()) clearSession();
    } catch (error) {
      console.error("Erro ao limpar dados antigos de login:", error);
    }

    const user = window.UniCakeAuth.getUser();

    if (user) {
      // Confere no servidor se a sessão ainda vale e se a conta virou (ou deixou de ser) administradora,
      // já que isso é ligado direto no banco; se algo mudou, recarrega para o menu acompanhar
      api("/api/clientes/me")
        .then((conta) => {
          const isAdmin = Boolean(conta.administrador);
          if (Boolean(user.isAdmin) === isAdmin && user.name === conta.nome) return;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...user, name: conta.nome, isAdmin }));
          window.location.reload();
        })
        .catch((error) => {
          if (error.status === 401) {
            clearSession();
            window.location.reload();
          }
        });

      document.dispatchEvent(
        new CustomEvent("unicake:session-restored", {
          detail: user,
        })
      );
    }
  }

  function initializeAuth() {
    checkAndRestoreSession();

    // Pequeno tempo para garantir que o script do Google carregou
    if (window.google && window.google.accounts) {
      window.UniCakeAuth.initGoogleSignIn();
    } else {
      setTimeout(() => {
        window.UniCakeAuth.initGoogleSignIn();
      }, 500);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAuth);
  } else {
    initializeAuth();
  }
})();
