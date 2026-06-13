const START_COINS = window.VM_RULES?.START_COINS ?? 5000;
const MAX_STAKE = window.VM_RULES?.MAX_STAKE ?? 500;

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3.8 10.7 12 4l8.2 6.7"/><path d="M6.5 9.6v9.1h4.1v-5.2h2.8v5.2h4.1V9.6"/></svg>',
  ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><path d="m7.8 8.4 4.2-2 4.2 2 1 4.5-2.9 3.5H9.7l-2.9-3.5 1-4.5Z"/><path d="M12 6.4v4.1M8.8 16.2 6 18.3M15.2 16.2l2.8 2.1M6.8 12.9l[...]"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0"/><circle cx="17" cy="9.2" r="2.4"/><path d="M15.2 14.4A4.6 4.6 0 0 1 20.6 19"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 3v-3.2A2 2 0 0 1 3 15.5v-8a2 2 0 0 1 2-2Z"/><path d="M7.5 10h9M7.5 13h6"/></svg>',
  profile: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M5.2 20a6.8 6.8 0 0 1 13.6 0"/></svg>',
  knight: '<svg viewBox="0 0 24 24"><path d="M7 20h11M8.3 17h8.4l-.6-5.1c-.3-2.6-2.2-4.9-4.7-5.7L10 5.8 8.8 8l2.5 1.2-1.4 1.9-3 1.2L8.3 17Z"/><path d="M13 6.9V4l2 1.4"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6.5 10.5a5.5 5.5 0 0 1 11 0v3.7l1.8 2.8H4.7l1.8-2.8v-3.7Z"/><path d="M10 20h4"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.3"/><path d="m16 16 4 4"/></svg>',
  invite: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.8 19a5.2 5.2 0 0 1 10.4 0"/><path d="M18 8v6M15 11h6"/></svg>',
  stats: '<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 3 5-7"/><path d="M18 7h1v1"/></svg>',
  cup: '<svg viewBox="0 0 24 24"><path d="M8 5h8v4.5a4 4 0 0 1-8 0V5Z"/><path d="M8 7H5.5a2 2 0 0 0 0 4H8M16 7h2.5a2 2 0 0 1 0 4H16M12 13.5V18M8.5 20h7"/></svg>',
  win: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.3 4.8-5"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="M4 17h16"/><path d="m6 14 4-4 3 3 5-6"/><path d="M17 7h2v2"/></svg>',
  medal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4"/><path d="m9.8 13-1.1 7 3.3-2 3.3 2-1.1-7"/><path d="m10.6 9 1 1 2-2"/></svg>',
  coins: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="6" rx="6.5" ry="3"/><path d="M5.5 6v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3V6"/><path d="M5.5 11v5c0 1.7 2.9 3 6.5 3s6.5-1.3 6.5-3v-5"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/></svg>',
  ticket: '<svg viewBox="0 0 24 24"><path d="M4 7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2.3 2.3 0 0 0 0 4.6v2.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2.3 2.3 0 0 0 0-4.6V7.5Z"/><path d="M9 8.5h6M9 12h[...]"/></svg>'
};

const seedActivity = [
  { icon: "cup", text: "Startsaldo er 5 000 VM Coins", time: "Info" },
  { icon: "ticket", text: "Maks innsats per kamp er 500 VM Coins", time: "Info" },
  { icon: "medal", text: "Leaderboard sorteres etter VM Coins", time: "Info" }
];

let app;
let auth;
let db;
let currentUser = null;
let currentRoom = "public";
let unsubscribers = [];

const state = {
  user: null,
  leaderboard: [],
  selected: [],
  bets: [],
  matches: [],
  forum: [],
  chat: [],
  activity: [...seedActivity]
};

function initFirebase(){
  if(!window.firebase || !window.VM_FIREBASE_CONFIG){
    throw new Error("Firebase mangler. Sjekk at firebase-config.js lastes inn.");
  }

  app = firebase.initializeApp(window.VM_FIREBASE_CONFIG);

  try{
    if(window.VM_FIREBASE_CONFIG.measurementId && firebase.analytics){
      firebase.analytics();
    }
  }catch(error){
    console.warn("Analytics ble ikke startet:", error);
  }

  auth = firebase.auth();
  db = firebase.firestore();
}

function formatNumber(value){
  return Number(value || 0).toLocaleString("nb-NO");
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function formatTime(value){
  if(!value) return "-";
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("nb-NO", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function resultLabel(result){
  if(result === "home") return "H";
  if(result === "draw") return "U";
  if(result === "away") return "B";
  return "";
}

function toast(message){
  const el = document.getElementById("toast");
  if(!el) return alert(message);
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.hidden = true, 3000);
}

function injectIcons(){
  document.querySelectorAll("[data-icon]").forEach(el => {
    const name = el.dataset.icon;
    if(ICONS[name]) el.innerHTML = ICONS[name];
  });
}

function calculateWinPercent(won, completed){
  const w = Number(won || 0);
  const c = Number(completed || 0);
  return c > 0 ? Math.round((w / c) * 100) : 0;
}

function userWithDefaults(data = {}){
  const completed = Number(data.completedBets || 0);
  const won = Number(data.wonBets || 0);
  return {
    uid: data.uid || currentUser?.uid || "",
    name: data.name || data.username || currentUser?.displayName || "Spiller",
    email: data.email || currentUser?.email || "",
    coins: Number(data.coins ?? START_COINS),
    elo: Number(data.elo ?? data.chessElo ?? 1000),
    placedBets: Number(data.placedBets || 0),
    wonBets: won,
    completedBets: completed,
    hitRate: `${calculateWinPercent(won, completed)}%`,
    rank: data.rank || "-",
    netProfit: Number(data.netProfit || 0),
    isAdmin: data.isAdmin === true
  };
}

function isAdmin(){
  return state.user?.isAdmin === true;
}

function detachListeners(){
  unsubscribers.forEach(fn => {
    try{ fn(); }catch{}
  });
  unsubscribers = [];
}

async function ensureUserDocument(user, chosenName = ""){
  const ref = db.collection("users").doc(user.uid);
  const snap = await ref.get();

  if(!snap.exists){
    const safeName = chosenName || user.displayName || user.email.split("@")[0] || "Spiller";
    await ref.set({
      uid: user.uid,
      name: safeName,
      email: user.email || "",
      coins: START_COINS,
      elo: 1000,
      placedBets: 0,
      wonBets: 0,
      completedBets: 0,
      netProfit: 0,
      isAdmin: false,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }
}

function attachListeners(){
  detachListeners();

  const uid = currentUser.uid;

  unsubscribers.push(
    db.collection("users").doc(uid).onSnapshot(snapshot => {
      if(snapshot.exists){
        state.user = userWithDefaults(snapshot.data());
        renderAll();
      }
    }, handleFirebaseError)
  );

  unsubscribers.push(
    db.collection("users").onSnapshot(snapshot => {
      state.leaderboard = snapshot.docs.map(doc => {
        const data = userWithDefaults({ uid: doc.id, ...doc.data() });
        data.isMe = currentUser && doc.id === currentUser.uid;
        data.winPercent = calculateWinPercent(data.wonBets, data.completedBets);
        data.hitRate = `${data.winPercent}%`;
        return data;
      }).sort((a,b) => Number(b.coins || 0) - Number(a.coins || 0));

