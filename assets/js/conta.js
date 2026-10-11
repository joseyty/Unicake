(function () {
  const U = window.UniCake;
  const Auth = window.UniCakeAuth;
  if (!U || !Auth) return;

  const LOGIN_PAGE = "Entrar.html";

  // Chamados que o cliente abriu na página Suporte, com a resposta da equipe quando houver
  async function carregarChamados() {
    const lista = document.getElementById("meusChamados");
    const Chamados = window.UniCakeChamados;
    if (!lista || !Chamados) return;
    try {
      const response = await fetch(U.apiBase + "/api/clientes/me/chamados", {
        headers: { Authorization: "Bearer " + Auth.getToken() },
      });
      if (!response.ok) throw new Error();
      const chamados = await response.json();
      lista.innerHTML = "";
      if (!chamados.length) {
        const vazio = Chamados.el("p", "empty-state", "Você ainda não abriu nenhum chamado. ");
        const link = Chamados.el("a", "", "Falar com o suporte");
        link.href = "Suporte.html";
        vazio.appendChild(link);
        lista.appendChild(vazio);
        return;
      }
      chamados.forEach((chamado) => lista.appendChild(Chamados.card(chamado)));
    } catch (error) {
      lista.textContent = "Não foi possível carregar seus chamados agora.";
    }
  }

  // Página "Minha conta" do cliente (MinhaConta.html): dados do cadastro e exclusão da conta
  async function initConta() {
    const card = document.getElementById("contaCard");
    if (!card) return;

    const status = document.getElementById("contaStatus");

    if (!Auth.getUser()) {
      window.location.replace(LOGIN_PAGE);
      return;
    }

    // Os dados vêm do servidor, que também confirma se a sessão ainda vale
    let conta;
    try {
      conta = await Auth.fetchAccount();
    } catch (error) {
      if (error.status === 401) {
        Auth.clearSession();
        window.location.replace(LOGIN_PAGE);
        return;
      }
      status.textContent = error.message;
      return;
    }

    const valores = {
      nome: conta.nome,
      email: conta.email,
      login: conta.tem_senha ? "E-mail e senha" : "Google",
      data_cadastro: conta.data_cadastro ? new Date(conta.data_cadastro).toLocaleDateString("pt-BR") : "",
    };
    card.querySelectorAll("[data-conta]").forEach((item) => {
      item.textContent = valores[item.dataset.conta] || "Não informado";
    });
    status.hidden = true;
    document.getElementById("contaConteudo").hidden = false;
    carregarChamados();

    document.getElementById("contaSair").addEventListener("click", () => {
      Auth.logout();
      window.location.href = LOGIN_PAGE;
    });

    const form = document.getElementById("excluirContaForm");
    const excluirStatus = document.getElementById("excluirContaStatus");
    const senha = form.elements.senha;
    // Conta criada só com Google não tem senha para confirmar
    if (!conta.tem_senha) {
      senha.closest("label").hidden = true;
      senha.required = false;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!confirm("Excluir sua conta UniCake? Não dá para desfazer.")) return;
      const botao = form.querySelector('[type="submit"]');
      botao.disabled = true;
      excluirStatus.textContent = "Excluindo sua conta...";
      const result = await Auth.deleteAccount(senha.value);
      if (result.ok || result.expired) {
        window.location.href = LOGIN_PAGE;
        return;
      }
      excluirStatus.textContent = result.error;
      botao.disabled = false;
    });
  }

  U.ready(initConta);
})();
