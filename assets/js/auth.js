(function () {
  const AUTH_STORAGE_KEY = "unicake.auth";
  const USERS_STORAGE_KEY = "unicake.users";
  const PASSWORD_ITERATIONS = 120000;

  const GOOGLE_CLIENT_ID =
    "621954972061-afec0snf9b2hukkudnrb8a4hkpsr6rpc.apps.googleusercontent.com";

  function getRegisteredUsers() {
    try {
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
      return Array.isArray(users) ? users : [];
    } catch (error) {
      console.error("Erro ao recuperar contas cadastradas:", error);
      return [];
    }
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function hashPassword(password, salt) {
    if (!window.crypto?.subtle) {
      throw new Error("O cadastro e o login exigem uma conexão segura (HTTPS ou localhost).");
    }

    const key = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const hash = await window.crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256",
      },
      key,
      256
    );

    return bytesToHex(new Uint8Array(hash));
  }

  window.UniCakeAuth = {
    isLoggedIn() {
      return !!this.getUser();
    },

    getUser() {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);

      if (!stored) {
        return null;
      }

      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        return null;
      }
    },

    setUser(user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    },

    logout() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },

    handleGoogleCallback(response) {
      if (!response || !response.credential) {
        console.error("Google não retornou uma credencial válida.");
        return null;
      }

      try {
        const base64Url = response.credential.split(".")[1];

        const base64 = base64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );

        const decoded = JSON.parse(jsonPayload);

        const user = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
          provider: "google",
          loginTime: new Date().toISOString(),
        };

        this.setUser(user);

        console.log("✅ Login Google realizado:", user);

        const status = document.getElementById("loginStatus");

        if (status) {
          status.textContent =
            `Bem-vindo, ${user.name}! Você foi autenticado com Google.`;

          status.style.color = "green";
        }

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 1500);

        return user;
      } catch (error) {
        console.error("Erro ao processar login do Google:", error);
        return null;
      }
    },

    async registerTraditionalUser(name, email, password) {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();

      if (!normalizedName || !normalizedEmail || password.length < 8) {
        return { error: "Informe seu nome, um e-mail válido e uma senha com pelo menos 8 caracteres." };
      }

      const users = getRegisteredUsers();
      if (users.some((user) => user.email === normalizedEmail)) {
        return { error: "Já existe uma conta cadastrada com este e-mail." };
      }

      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const account = {
        id: "local_" + window.crypto.randomUUID(),
        name: normalizedName,
        email: normalizedEmail,
        salt: bytesToHex(salt),
        passwordHash: await hashPassword(password, salt),
      };

      users.push(account);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        picture: null,
        provider: "traditional",
        loginTime: new Date().toISOString(),
      };
      this.setUser(user);

      return { user };
    },

    async handleTraditionalLogin(email, password) {
      if (!email || !password) {
        return null;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const account = getRegisteredUsers().find(
        (registeredUser) => registeredUser.email === normalizedEmail
      );

      if (!account) {
        return null;
      }

      const salt = Uint8Array.from(
        account.salt.match(/.{2}/g) || [],
        (byte) => parseInt(byte, 16)
      );
      if ((await hashPassword(password, salt)) !== account.passwordHash) {
        return null;
      }

      const user = {
        id: account.id,
        name: account.name,
        email: account.email,
        picture: null,
        provider: "traditional",
        loginTime: new Date().toISOString(),
      };

      this.setUser(user);

      return user;
    },

    initGoogleSignIn() {
      if (
        !window.google ||
        !window.google.accounts ||
        !window.google.accounts.id
      ) {
        console.error("❌ Google Identity Services não carregou.");
        return;
      }

      console.log("✅ Inicializando Google Login...");

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: (response) => {
          window.UniCakeAuth.handleGoogleCallback(response);
        },
      });

      const googleButton = document.querySelector(".google-button");

      if (!googleButton) {
        console.error("❌ Elemento .google-button não encontrado.");
        return;
      }

      // Limpa o conteúdo atual antes de renderizar
      googleButton.innerHTML = "";

      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with",
        shape: "rectangular",
      });

      console.log("✅ Botão Google carregado.");
    },
  };

  function checkAndRestoreSession() {
    const user = window.UniCakeAuth.getUser();

    if (user) {
      console.log("✅ Sessão restaurada:", user.name);

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