// assets/js/painel-suporte.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");
const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const ticketsList = document.getElementById("ticketsList");
const emptyChat = document.getElementById("emptyChat");
const chatArea = document.getElementById("chatArea");
const clientName = document.getElementById("clientName");
const clientEmail = document.getElementById("clientEmail");
const messages = document.getElementById("messages");
const replyForm = document.getElementById("replyForm");
const replyInput = document.getElementById("replyInput");
const closeTicketBtn = document.getElementById("closeTicketBtn");
const logoutBtn = document.getElementById("logoutBtn");

let activeTicket = null;
let stopTickets = null;
let stopMessages = null;

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("supportEmail").value.trim();
  const password = document.getElementById("supportPassword").value;

  loginStatus.textContent = "Entrando...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginStatus.textContent = "";
  } catch (error) {
    console.error(error);
    loginStatus.textContent = "Login inválido ou sem permissão.";
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    loginBox.hidden = false;
    panel.hidden = true;
    cleanupListeners();
    return;
  }

  loginBox.hidden = true;
  panel.hidden = false;
  startTicketsListener();
});

function cleanupListeners() {
  if (stopTickets) stopTickets();
  if (stopMessages) stopMessages();
  stopTickets = null;
  stopMessages = null;
  activeTicket = null;
}

function startTicketsListener() {
  if (stopTickets) stopTickets();

  const q = query(
    collection(db, "tickets"),
    orderBy("updatedAt", "desc")
  );

  stopTickets = onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    renderTickets(tickets);
  }, (error) => {
    console.error("Erro ao listar tickets:", error);
    ticketsList.innerHTML =
      '<p class="muted">Sem permissão. Confira supportUsers e as regras do Firestore.</p>';
  });
}

function renderTickets(tickets) {
  if (!tickets.length) {
    ticketsList.innerHTML = '<p class="muted">Nenhum ticket ainda.</p>';
    return;
  }

  ticketsList.innerHTML = tickets.map((ticket) => `
    <button class="ticket ${activeTicket?.id === ticket.id ? "active" : ""}"
            data-ticket-id="${ticket.id}">
      <strong>${escapeHtml(ticket.clientName || "Cliente")}</strong>
      <small>${escapeHtml(ticket.lastMessage || "Sem mensagens")}</small>
      <span>${ticket.status === "closed" ? "Fechado" : "Aberto"}${ticket.unreadSupport ? ` • ${ticket.unreadSupport} nova(s)` : ""}</span>
    </button>
  `).join("");

  ticketsList.querySelectorAll("[data-ticket-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const ticket = tickets.find((t) => t.id === button.dataset.ticketId);
      openTicket(ticket);
    });
  });
}

async function openTicket(ticket) {
  activeTicket = ticket;

  emptyChat.hidden = true;
  chatArea.hidden = false;

  clientName.textContent = ticket.clientName || "Cliente";
  clientEmail.textContent = ticket.clientEmail || "";

  await updateDoc(doc(db, "tickets", ticket.id), {
    unreadSupport: 0
  });

  if (stopMessages) stopMessages();

  const q = query(
    collection(db, "tickets", ticket.id, "messages"),
    orderBy("createdAt", "asc")
  );

  stopMessages = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    renderMessages(data);
  });
}

function renderMessages(data) {
  messages.innerHTML = data.map((msg) => {
    const side =
      msg.sender === "support" ? "support" :
      msg.sender === "client" ? "client" : "system";

    return `
      <div class="message ${side}">
        <div>${escapeHtml(msg.text)}</div>
      </div>
    `;
  }).join("");

  messages.scrollTop = messages.scrollHeight;
}

replyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!activeTicket || activeTicket.status === "closed") return;

  const text = replyInput.value.trim();
  if (!text) return;

  replyInput.value = "";

  await addDoc(
    collection(db, "tickets", activeTicket.id, "messages"),
    {
      sender: "support",
      text,
      createdAt: serverTimestamp()
    }
  );

  await updateDoc(doc(db, "tickets", activeTicket.id), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    unreadClient: (activeTicket.unreadClient || 0) + 1
  });
});

closeTicketBtn.addEventListener("click", async () => {
  if (!activeTicket) return;

  await updateDoc(doc(db, "tickets", activeTicket.id), {
    status: "closed",
    updatedAt: serverTimestamp()
  });

  activeTicket = { ...activeTicket, status: "closed" };
});
