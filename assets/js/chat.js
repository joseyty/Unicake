(function () {
  const CHATS_KEY = "unicake.chats";
  const ACTIVE_CHAT_KEY = "unicake.active_chat";
  const SUPPORT_KEY = "unicake.support_user";

  window.UniCakeChat = {
    // Obter todas as conversas
    getAllChats() {
      const stored = localStorage.getItem(CHATS_KEY);

      if (!stored) {
        return [];
      }

      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Erro ao carregar conversas:", error);
        return [];
      }
    },

    // Salvar todas as conversas
    saveAllChats(chats) {
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

      // Atualizar interfaces que estejam escutando o chat (mesma aba)
      window.dispatchEvent(
        new CustomEvent("unicake:chats-updated", {
          detail: chats,
        })
      );

      // Para sincronizar entre abas, dispara um evento de storage simulado
      // (storage event já é disparado automaticamente pelo localStorage)
    },

    // Criar nova conversa
    createChat(cliente, assunto = "outro") {
      const chats = this.getAllChats();

      // Verifica se o cliente já possui conversa ABERTA
      const existingChat = chats.find(
        (c) =>
          c.clienteEmail === cliente.email &&
          c.status === "aberto"
      );

      // Se já existir, continua nela
      if (existingChat) {
        return existingChat;
      }

      const agora = new Date().toISOString();

      // Mensagens automáticas do suporte
      const mensagensAutomaticas = {
        pedido:
          "Olá! 🍰 Vi que você precisa de ajuda com um pedido. Pode me informar o número do pedido?",

        pagamento:
          "Olá! 💳 Vi que você precisa de ajuda com pagamento. Me conte o que aconteceu.",

        entrega:
          "Olá! 🛵 Vi que você precisa de ajuda com uma entrega. Pode me informar o número do pedido?",

        outro:
          "Olá! 👋 Bem-vindo ao suporte da UniCake. Me conte com detalhes como posso te ajudar.",
      };

      const mensagemInicial =
        mensagensAutomaticas[assunto] ||
        mensagensAutomaticas.outro;

      const novaConversa = {
        id: "chat_" + Date.now(),

        clienteEmail: cliente.email,
        clienteNome: cliente.name,
        clienteFoto: cliente.picture || null,

        assunto: assunto,

        // Primeira mensagem automática enviada pelo suporte
        mensagens: [
          {
            id: "msg_" + Date.now(),
            texto: mensagemInicial,
            remetente: "suporte",
            timestamp: agora,
            lido: false,
          },
        ],

        criadoEm: agora,

        status: "aberto",

        ultimaMensagem: mensagemInicial,
        ultimaMensagemEm: agora,

        naoLidosPorSuporte: 0,
        naoLidosPorCliente: 1,
      };

      chats.push(novaConversa);

      this.saveAllChats(chats);

      // Define como chat ativo do cliente
      localStorage.setItem(
        ACTIVE_CHAT_KEY,
        novaConversa.id
      );

      return novaConversa;
    },

    // Obter conversa específica
    getChat(chatId) {
      const chats = this.getAllChats();

      return chats.find(
        (c) => c.id === chatId
      ) || null;
    },

    // Obter conversa do cliente
    getClienteChat(clienteEmail) {
      const chats = this.getAllChats();

      return (
        chats.find(
          (c) =>
            c.clienteEmail === clienteEmail &&
            c.status === "aberto"
        ) || null
      );
    },

    // Obter chat ativo
    getActiveChat() {
      const chatId = localStorage.getItem(
        ACTIVE_CHAT_KEY
      );

      if (!chatId) {
        return null;
      }

      return this.getChat(chatId);
    },

    // Definir chat ativo
    setActiveChat(chatId) {
      localStorage.setItem(
        ACTIVE_CHAT_KEY,
        chatId
      );
    },

    // Enviar mensagem
    enviarMensagem(chatId, mensagem, remetente) {
      // remetente: "cliente" ou "suporte"

      const texto = String(mensagem || "").trim();

      if (!texto) {
        return null;
      }

      if (
        remetente !== "cliente" &&
        remetente !== "suporte"
      ) {
        console.error(
          "Remetente inválido:",
          remetente
        );

        return null;
      }

      const chats = this.getAllChats();

      const chat = chats.find(
        (c) => c.id === chatId
      );

      if (!chat) {
        console.error(
          "Conversa não encontrada:",
          chatId
        );

        return null;
      }

      if (chat.status !== "aberto") {
        console.warn(
          "Não é possível enviar mensagem para uma conversa fechada."
        );

        return null;
      }

      const agora = new Date().toISOString();

      const novaMensagem = {
        id:
          "msg_" +
          Date.now() +
          "_" +
          Math.random()
            .toString(36)
            .substring(2, 8),

        texto: texto,

        remetente: remetente,

        timestamp: agora,

        lido: false,
      };

      chat.mensagens.push(novaMensagem);

      chat.ultimaMensagem = texto;
      chat.ultimaMensagemEm = agora;

      if (remetente === "cliente") {
        chat.naoLidosPorSuporte += 1;
      } else {
        chat.naoLidosPorCliente += 1;
      }

      this.saveAllChats(chats);

      return novaMensagem;
    },

    // Marcar conversa como lida
    marcarComoLido(chatId, quemLeu) {
      const chats = this.getAllChats();

      const chat = chats.find(
        (c) => c.id === chatId
      );

      if (!chat) {
        return;
      }

      chat.mensagens.forEach((msg) => {
        if (
          quemLeu === "suporte" &&
          msg.remetente === "cliente"
        ) {
          msg.lido = true;
        }

        if (
          quemLeu === "cliente" &&
          msg.remetente === "suporte"
        ) {
          msg.lido = true;
        }
      });

      if (quemLeu === "suporte") {
        chat.naoLidosPorSuporte = 0;
      }

      if (quemLeu === "cliente") {
        chat.naoLidosPorCliente = 0;
      }

      this.saveAllChats(chats);
    },

    // Fechar conversa
    fecharChat(chatId, motivo = "") {
      const chats = this.getAllChats();

      const chat = chats.find(
        (c) => c.id === chatId
      );

      if (!chat) {
        return;
      }

      chat.status = "fechado";
      chat.motivoFechamento = motivo;
      chat.fechadoEm =
        new Date().toISOString();

      this.saveAllChats(chats);

      const activeChat =
        localStorage.getItem(
          ACTIVE_CHAT_KEY
        );

      if (activeChat === chatId) {
        localStorage.removeItem(
          ACTIVE_CHAT_KEY
        );
      }
    },

    // Reabrir conversa
    reabrirChat(chatId) {
      const chats = this.getAllChats();

      const chat = chats.find(
        (c) => c.id === chatId
      );

      if (!chat) {
        return null;
      }

      chat.status = "aberto";

      delete chat.fechadoEm;
      delete chat.motivoFechamento;

      this.saveAllChats(chats);

      localStorage.setItem(
        ACTIVE_CHAT_KEY,
        chat.id
      );

      return chat;
    },

    // Obter quantidade de mensagens não lidas pelo suporte
    getNaoLidosCount() {
      const chats = this.getAllChats();

      return chats.reduce(
        (total, chat) =>
          total +
          (chat.naoLidosPorSuporte || 0),
        0
      );
    },

    // Buscar chats
    buscarChats(termo) {
      const chats = this.getAllChats();

      const termoLower = String(
        termo || ""
      )
        .trim()
        .toLowerCase();

      if (!termoLower) {
        return chats;
      }

      return chats.filter((chat) => {
        const nome = (
          chat.clienteNome || ""
        ).toLowerCase();

        const email = (
          chat.clienteEmail || ""
        ).toLowerCase();

        const assunto = (
          chat.assunto || ""
        ).toLowerCase();

        const mensagemEncontrada =
          chat.mensagens.some((msg) =>
            String(msg.texto || "")
              .toLowerCase()
              .includes(termoLower)
          );

        return (
          nome.includes(termoLower) ||
          email.includes(termoLower) ||
          assunto.includes(termoLower) ||
          mensagemEncontrada
        );
      });
    },

    // Estatísticas
    getEstatisticas() {
      const chats = this.getAllChats();

      return {
        total: chats.length,

        abertos: chats.filter(
          (c) => c.status === "aberto"
        ).length,

        fechados: chats.filter(
          (c) => c.status === "fechado"
        ).length,

        naoLidos:
          this.getNaoLidosCount(),

        totalMensagens: chats.reduce(
          (total, chat) =>
            total +
            (chat.mensagens?.length || 0),
          0
        ),
      };
    },

    // Apagar uma conversa
    excluirChat(chatId) {
      const chats = this.getAllChats();

      const novosChats = chats.filter(
        (c) => c.id !== chatId
      );

      this.saveAllChats(novosChats);

      const activeChat =
        localStorage.getItem(
          ACTIVE_CHAT_KEY
        );

      if (activeChat === chatId) {
        localStorage.removeItem(
          ACTIVE_CHAT_KEY
        );
      }
    },

    // Limpar todas as conversas
    limparChats() {
      localStorage.removeItem(CHATS_KEY);
      localStorage.removeItem(
        ACTIVE_CHAT_KEY
      );

      window.dispatchEvent(
        new CustomEvent(
          "unicake:chats-updated",
          {
            detail: [],
          }
        )
      );
    },
  };

  // Atualizar outras abas do navegador em tempo real
  window.addEventListener(
    "storage",
    (event) => {
      if (event.key === CHATS_KEY) {
        let novosDados = [];

        try {
          novosDados = JSON.parse(
            event.newValue || "[]"
          );
        } catch (error) {
          console.error(
            "Erro ao atualizar chats:",
            error
          );
        }

        window.dispatchEvent(
          new CustomEvent(
            "unicake:chats-updated",
            {
              detail: novosDados,
            }
          )
        );
      }
    }
  );
})();