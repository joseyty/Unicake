(function () {
  const CHATS_KEY = "unicake.chats"; // Todas as conversas
  const ACTIVE_CHAT_KEY = "unicake.active_chat"; // Chat ativo do cliente
  const SUPPORT_KEY = "unicake.support_user"; // Usuário suporte logado

  window.UniCakeChat = {
    // Obter todas as conversas
    getAllChats() {
      const stored = localStorage.getItem(CHATS_KEY);
      return stored ? JSON.parse(stored) : [];
    },

    // Salvar todas as conversas
    saveAllChats(chats) {
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
      // Disparar evento para atualizar em tempo real
      window.dispatchEvent(new CustomEvent("unicake:chats-updated", { detail: chats }));
    },

    // Criar nova conversa
    createChat(cliente) {
      const chats = this.getAllChats();
      const existingChat = chats.find((c) => c.clienteEmail === cliente.email);

      if (existingChat) {
        return existingChat;
      }

      const novaConversa = {
        id: "chat_" + Date.now(),
        clienteEmail: cliente.email,
        clienteNome: cliente.name,
        clienteFoto: cliente.picture || null,
        mensagens: [],
        criadoEm: new Date().toISOString(),
        status: "aberto", // aberto, fechado, resolvido
        ultimaMensagem: null,
        ultimaMensagemEm: null,
        naoLidosPorSuporte: 0,
        naoLidosPorCliente: 0,
      };

      chats.push(novaConversa);
      this.saveAllChats(chats);
      return novaConversa;
    },

    // Obter conversa específica
    getChat(chatId) {
      const chats = this.getAllChats();
      return chats.find((c) => c.id === chatId);
    },

    // Obter conversa do cliente logado
    getClienteChat(clienteEmail) {
      const chats = this.getAllChats();
      return chats.find((c) => c.clienteEmail === clienteEmail);
    },

    // Enviar mensagem
    enviarMensagem(chatId, mensagem, remetente) {
      // remetente: 'cliente' ou 'suporte'
      const chats = this.getAllChats();
      const chat = chats.find((c) => c.id === chatId);

      if (!chat) return null;

      const novaMensagem = {
        id: "msg_" + Date.now(),
        texto: mensagem,
        remetente: remetente,
        timestamp: new Date().toISOString(),
        lido: false,
      };

      chat.mensagens.push(novaMensagem);
      chat.ultimaMensagem = mensagem;
      chat.ultimaMensagemEm = novaMensagem.timestamp;

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
      // quemLeu: 'cliente' ou 'suporte'
      const chats = this.getAllChats();
      const chat = chats.find((c) => c.id === chatId);

      if (!chat) return;

      chat.mensagens.forEach((msg) => {
        if (quemLeu === "suporte" && msg.remetente === "cliente") {
          msg.lido = true;
        } else if (quemLeu === "cliente" && msg.remetente === "suporte") {
          msg.lido = true;
        }
      });

      if (quemLeu === "suporte") {
        chat.naoLidosPorSuporte = 0;
      } else {
        chat.naoLidosPorCliente = 0;
      }

      this.saveAllChats(chats);
    },

    // Fechar conversa
    fecharChat(chatId, motivo = "") {
      const chats = this.getAllChats();
      const chat = chats.find((c) => c.id === chatId);

      if (chat) {
        chat.status = "fechado";
        chat.motivoFechamento = motivo;
        chat.fechadoEm = new Date().toISOString();
        this.saveAllChats(chats);
      }
    },

    // Reabrir conversa
    reabrirChat(chatId) {
      const chats = this.getAllChats();
      const chat = chats.find((c) => c.id === chatId);

      if (chat) {
        chat.status = "aberto";
        this.saveAllChats(chats);
      }
    },

    // Obter quantidade de chats não lidos
    getNaoLidosCount() {
      const chats = this.getAllChats();
      return chats.reduce((total, chat) => total + chat.naoLidosPorSuporte, 0);
    },

    // Buscar chats por termo
    buscarChats(termo) {
      const chats = this.getAllChats();
      const termoLower = termo.toLowerCase();

      return chats.filter(
        (chat) =>
          chat.clienteNome.toLowerCase().includes(termoLower) ||
          chat.clienteEmail.toLowerCase().includes(termoLower) ||
          chat.mensagens.some((msg) => msg.texto.toLowerCase().includes(termoLower))
      );
    },

    // Obter estatísticas
    getEstatisticas() {
      const chats = this.getAllChats();
      return {
        total: chats.length,
        abertos: chats.filter((c) => c.status === "aberto").length,
        fechados: chats.filter((c) => c.status === "fechado").length,
        naoLidos: this.getNaoLidosCount(),
        totalMensagens: chats.reduce((total, chat) => total + chat.mensagens.length, 0),
      };
    },
  };

  // Inicializar listener de chat para atualizar UI em tempo real
  window.addEventListener("storage", (event) => {
    if (event.key === CHATS_KEY) {
      const novosDados = JSON.parse(event.newValue || "[]");
      window.dispatchEvent(new CustomEvent("unicake:chats-updated", { detail: novosDados }));
    }
  });
})();
