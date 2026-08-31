(function () {
  const AUTH_STORAGE_KEY = "unicake.auth";
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";

  // Expose auth functions to window
  window.UniCakeAuth = {
    isLoggedIn() {
      return !!this.getUser();
    },

    getUser() {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    },

    setUser(user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    },

    logout() {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },

    handleGoogleCallback(response) {
      if (response.clientId === GOOGLE_CLIENT_ID || response.credential) {
        // Decode JWT token
        const base64Url = response.credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
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
        return user;
      }
    },

    handleTraditionalLogin(email, password) {
      // Simulação de login tradicional (integrar com backend real aqui)
      if (email && password) {
        const user = {
          id: "local_" + Date.now(),
          name: email.split("@")[0],
          email: email,
          picture: null,
          provider: "traditional",
          loginTime: new Date().toISOString(),
        };

        this.setUser(user);
        return user;
      }
      return null;
    },

    initGoogleSignIn() {
      if (window.google && window.google.accounts) {
        const googleButton = document.querySelector(".google-button");
        if (googleButton) {
          // Handle click on custom Google button
          googleButton.addEventListener("click", () => {
            // Trigger Google Sign-In
            if (window.google.accounts.id) {
              window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => {
                  const user = this.handleGoogleCallback(response);
                  if (user) {
                    const status = document.getElementById("loginStatus");
                    if (status) {
                      status.textContent = `Bem-vindo, ${user.name}! Você foi autenticado com Google.`;
                      status.style.color = "green";
                    }
                    // Redirecionar após login bem-sucedido
                    setTimeout(() => {
                      window.location.href = "../index.html";
                    }, 1500);
                  }
                },
              });

              // Render the Google Sign-In button
              window.google.accounts.id.renderButton(
                document.querySelector(".google-button"),
                {
                  theme: "outline",
                  size: "large",
                  width: "100%",
                }
              );
            }
          });
        }
      }
    },
  };

  // Initialize when DOM is ready
  const U = window.UniCake;
  if (U && U.ready) {
    U.ready(() => {
      window.UniCakeAuth.initGoogleSignIn();
    });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      window.UniCakeAuth.initGoogleSignIn();
    });
  }
})();
