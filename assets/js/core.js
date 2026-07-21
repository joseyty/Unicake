(function () {
  const data = window.UniCakeData || {};

  const icons = {
    search: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    filter: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="8" y1="12" x2="20" y2="12"></line><line x1="12" y1="18" x2="20" y2="18"></line><circle cx="6" cy="12" r="2"></circle><circle cx="10" cy="18" r="2"></circle><circle cx="18" cy="6" r="2"></circle></svg>',
    user: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    cart: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    menu: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg>',
    close: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    plus: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    minus: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    send: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    check: '<svg aria-hidden="true" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    chat: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    access: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"></circle><path d="M4 9h16"></path><path d="M12 9v12"></path><path d="M8 21l4-8 4 8"></path></svg>',
    heart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
    arrow: '<svg aria-hidden="true" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
  };

  const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const storageKeys = {
    cart: "unicake.cart",
    access: "unicake.accessibility",
  };

  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function pageName() {
    return document.body.dataset.page || "home";
  }

  function productById(id) {
    return (data.products || []).find((product) => product.id === id);
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  function stars(rating) {
    return `<span class="stars" aria-label="Avaliação ${rating} de 5">★★★★★</span><span>${Number(rating).toFixed(1)}</span>`;
  }

  function toast(message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("is-visible");
    window.clearTimeout(el.timer);
    el.timer = window.setTimeout(() => el.classList.remove("is-visible"), 2800);
  }

  function initGlobalUX() {
    if (!document.body) return;

    let progressBar = document.querySelector(".progress-bar");
    if (!progressBar) {
      progressBar = document.createElement("div");
      progressBar.className = "progress-bar";
      progressBar.setAttribute("aria-hidden", "true");
      document.body.prepend(progressBar);
    }

    let backToTop = document.querySelector(".back-to-top");
    if (!backToTop) {
      backToTop = document.createElement("button");
      backToTop.className = "back-to-top";
      backToTop.type = "button";
      backToTop.setAttribute("aria-label", "Voltar ao topo");
      backToTop.innerHTML = `${icons.arrow} <span>Topo</span>`;
      document.body.appendChild(backToTop);
    }

    const updateScrollUI = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollTop / max)) : 0;

      progressBar.style.transform = `scaleX(${progress})`;
      backToTop.classList.toggle("is-visible", scrollTop > 480);
    };

    updateScrollUI();
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    window.addEventListener("resize", updateScrollUI);
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      backToTop.blur();
    });
  }

  window.UniCake = {
    data,
    icons,
    money,
    storageKeys,
    ready,
    pageName,
    productById,
    initials,
    stars,
    toast,
  };

  window.UniCake.ready(() => {
    initGlobalUX();
  });
})();
