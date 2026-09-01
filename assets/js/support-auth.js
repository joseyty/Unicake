(function () {
  const SUPPORT_AUTH_KEY = "unicake.support_auth";
  const SUPPORT_SESSION_KEY = "unicake.support_session";
  
  // Credenciais padrão (você pode mudar após o primeiro login)
  const DEFAULT_CREDENTIALS = {
    email: "suporte@unicake.com",
    senha: "Unicake2024"
  };

  window.UniCakeSupportAuth = {
    // Fazer login de suporte
    login(email, senha) {
      if (email === DEFAULT_CREDENTIALS.email && senha === DEFAULT_CREDENTIALS.senha) {
        const sessionToken = "token_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        const session = {
          token: sessionToken,
          email: email,
          loginTime: new Date().toISOString(),
          expiresIn: 8 * 60 * 60 * 1000, // 8 horas
        };
        localStorage.setItem(SUPPORT_SESSION_KEY, JSON.stringify(session));
        return true;
      }
      return false;
    },

    // Fazer logout de suporte
    logout() {
      localStorage.removeItem(SUPPORT_SESSION_KEY);
    },

    // Verificar se está logado
    isLoggedIn() {
      const session = localStorage.getItem(SUPPORT_SESSION_KEY);
      if (!session) return false;

      try {
        const parsed = JSON.parse(session);
        const loginTime = new Date(parsed.loginTime).getTime();
        const now = new Date().getTime();
        const elapsed = now - loginTime;

        // Verificar se sessão não expirou
        if (elapsed > parsed.expiresIn) {
          this.logout();
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },

    // Obter informações da sessão
    getSession() {
      const session = localStorage.getItem(SUPPORT_SESSION_KEY);
      return session ? JSON.parse(session) : null;
    },

    // Armazenar novas credenciais (para futuro)
    updateCredentials(email, senhaAntiga, senhaNova) {
      const session = this.getSession();
      if (!session) return false;

      // Validar senha antiga
      if (senhaAntiga !== DEFAULT_CREDENTIALS.senha) {
        return false;
      }

      // Aqui você implementaria a lógica de atualizar credenciais
      // Por enquanto, retorna true como exemplo
      return true;
    },
  };

  // Auto verificar sessão ao carregar página
  window.addEventListener("DOMContentLoaded", () => {
    if (!window.UniCakeSupportAuth.isLoggedIn()) {
      const currentPage = window.location.pathname;
      if (currentPage.includes("painel-suporte")) {
        window.location.href = "login-suporte.html";
      }
    }
  });
})();
