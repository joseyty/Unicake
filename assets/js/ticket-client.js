// assets/js/ticket-client.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ACTIVE_TICKET_KEY = "unicake.active_support_ticket";

function getUniCakeUser() {
  try {
    return JSON.parse(localStorage.getItem("unicake.auth") || "null");
  } catch {
    return null;
  }
}

async function ensureAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;

  return await new Promise((resolve, reject) => {
    const stop = onAuthStateChanged(auth, async (user) => {
      if (user) {
        stop();
        resolve(user);
        return;
      }

      try {
        const result = await signInAnonymously(auth);
        stop();
        resolve(result.user);
      } catch (error) {
        stop();
        reject(error);
      }
    });
  });
}

async function getActiveTicket() {
  const id = localStorage.getItem(ACTIVE_TICKET_KEY);
  if (!id) return null;

  const snap = await getDoc(doc(db, "tickets", id));

  if (!snap.exists()) {
    localStorage.removeItem(ACTIVE_TICKET_KEY);
    return null;
  }

  return { id: snap.id, ...snap.data() };
}

export async function abrirTicketHumano() {
  const firebaseUser = await ensureAnonymousUser();
  const profile = getUniCakeUser();

  const existing = await getActiveTicket();

  if (existing && existing.status !== "closed") {
    return existing;
  }

  const ticketRef = await addDoc(collection(db, "tickets"), {
    clientUid: firebaseUser.uid,
    clientName: profile?.name || "Cliente",
    clientEmail: profile?.email || "",
    clientPicture: profile?.picture || "",
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: "Solicitou atendimento humano",
    unreadSupport: 1,
    unreadClient: 0
  });

  localStorage.setItem(ACTIVE_TICKET_KEY, ticketRef.id);

  await addDoc(collection(db, "tickets", ticketRef.id, "messages"), {
    sender: "system",
    text: "Ticket criado. Um atendente poderá continuar esta conversa pelo painel de suporte.",
    createdAt: serverTimestamp()
  });

  return { id: ticketRef.id, status: "open" };
}

export async function enviarMensagemCliente(texto) {
  const clean = String(texto || "").trim();
  if (!clean) return;

  const firebaseUser = await ensureAnonymousUser();
  const ticket = await getActiveTicket();

  if (!ticket || ticket.status === "closed") {
    throw new Error("Nenhum ticket humano aberto.");
  }

  if (ticket.clientUid !== firebaseUser.uid) {
    throw new Error("Este ticket não pertence ao usuário atual.");
  }

  await addDoc(collection(db, "tickets", ticket.id, "messages"), {
    sender: "client",
    text: clean,
    createdAt: serverTimestamp()
  });

  await updateDoc(doc(db, "tickets", ticket.id), {
    lastMessage: clean,
    updatedAt: serverTimestamp(),
    unreadSupport: (ticket.unreadSupport || 0) + 1
  });
}

export async function ouvirMensagensCliente(callback) {
  await ensureAnonymousUser();

  const ticket = await getActiveTicket();
  if (!ticket) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, "tickets", ticket.id, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const mensagens = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    callback(mensagens);
  });
}

export async function fecharTicketCliente() {
  const ticket = await getActiveTicket();
  if (!ticket) return;

  await updateDoc(doc(db, "tickets", ticket.id), {
    status: "closed",
    updatedAt: serverTimestamp()
  });

  localStorage.removeItem(ACTIVE_TICKET_KEY);
}
