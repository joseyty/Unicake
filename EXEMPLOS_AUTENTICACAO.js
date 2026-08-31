// EXEMPLO: Como usar a autenticação em outras páginas

// 1. Verificar se o usuário está logado
if (window.UniCakeAuth && window.UniCakeAuth.isLoggedIn()) {
  // Usuário está logado, você pode acessar seus dados
  const user = window.UniCakeAuth.getUser();
  console.log("Usuário logado:", user);
  console.log("Nome:", user.name);
  console.log("Email:", user.email);
  console.log("Foto:", user.picture);
} else {
  // Usuário não está logado
  console.log("Usuário não logado");
}

// 2. Usar dados do usuário na página
const user = window.UniCakeAuth?.getUser();
if (user) {
  // Atualizar elemento para mostrar o nome do usuário
  const userElement = document.getElementById("userName");
  if (userElement) {
    userElement.textContent = user.name;
  }

  // Mostrar a foto do usuário
  const avatarElement = document.getElementById("userAvatar");
  if (avatarElement && user.picture) {
    avatarElement.src = user.picture;
  }
}

// 3. Implementar botão de logout
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    window.UniCakeAuth.logout();
    // Redirecionar para página de login
    window.location.href = "html/Entrar.html";
  });
}

// 4. Proteger conteúdo da página
function protectPage() {
  if (!window.UniCakeAuth?.isLoggedIn()) {
    // Redirecionar para login se não estiver autenticado
    window.location.href = "html/Entrar.html";
    return;
  }

  // Página está protegida, continue normalmente
  console.log("Página protegida - Usuário autenticado");
}

// Chamar ao inicializar a página
document.addEventListener("DOMContentLoaded", () => {
  protectPage();
  
  const user = window.UniCakeAuth?.getUser();
  if (user) {
    console.log(`Bem-vindo, ${user.name}!`);
  }
});

// 5. Fazer requisição para backend com autenticação
async function fetchWithAuth(url, options = {}) {
  const user = window.UniCakeAuth?.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${user.id}`, // Ou use JWT token quando implementar
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Exemplo de uso:
// fetchWithAuth("/api/user/profile")
//   .then(data => console.log("Perfil:", data))
//   .catch(error => console.error("Erro:", error));

// 6. Estrutura de dados do usuário armazenado
/*
LocalStorage key: "unicake.auth"

Exemplo de dados:
{
  "id": "110169015274509..." (Google) ou "local_1234567890" (Email/Senha),
  "name": "João Silva",
  "email": "joao@example.com",
  "picture": "https://lh3.googleusercontent.com/...", (null se login tradicional)
  "provider": "google" ou "traditional",
  "loginTime": "2024-01-15T10:30:00.000Z"
}
*/

// 7. Monitorar mudanças de autenticação
function onAuthChange(callback) {
  // Listen to storage changes (when user logs in from another tab)
  window.addEventListener("storage", (event) => {
    if (event.key === "unicake.auth") {
      const user = window.UniCakeAuth?.getUser();
      callback(user);
    }
  });
}

// Exemplo:
// onAuthChange((user) => {
//   if (user) {
//     console.log("Usuário fez login:", user.name);
//   } else {
//     console.log("Usuário fez logout");
//   }
// });

export { protectPage, fetchWithAuth, onAuthChange };
