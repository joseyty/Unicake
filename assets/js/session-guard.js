(function () {
  // Páginas que requerem autenticação
  const protectedPages = ["checkout", "pedidos", "meu-perfil", "pagamento"];

  function getCurrentPage() {
    return document.body.dataset.page || "";
  }

  function isPageProtected() {
    const page = getCurrentPage();
    return protectedPages.includes(page);
  }

  function checkAuthAndRedirect() {
    if (!isPageProtected()) return;

    const user = window.UniCakeAuth?.getUser();

    if (!user) {
      console.log("🔒 Acesso negado: usuário não autenticado");
      // Salvar página desejada para redirecionar após login
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "../html/Entrar.html";
      return false;
    }

    return true;
  }

  // Executar verificação quando o DOM estiver pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAuthAndRedirect);
  } else {
    checkAuthAndRedirect();
  }

  // Listener para restauração de sessão
  document.addEventListener("unicake:session-restored", (event) => {
    const user = event.detail;
    console.log("✅ Sessão de usuário restaurada. Acesso permitido:", user.name);
  });

  // Expose função para redirecionar para página desejada após login
  window.UniCakeAuth = window.UniCakeAuth || {};
  window.UniCakeAuth.handlePostLoginRedirect = function () {
    const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectUrl;
    }
  };
})();
