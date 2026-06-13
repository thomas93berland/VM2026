/* VM Lounge 2026 - Firebase live app with visible debug logger */
const VM_APP_VERSION = "debug-2026-06-13-2";
const START_COINS = window.VM_RULES?.START_COINS ?? 5000;
const MAX_STAKE = window.VM_RULES?.MAX_STAKE ?? 500;

let auth = null;
let db = null;
let currentUser = null;
let currentRoom = "public";
let unsubscribers = [];

const state = {
  user: null,
  users: [],
  matches: [],
  bets: [],
  selected: [],
  posts: [],
  messages: []
};

const $ = (id) => document.getElementById(id);
const fmt = (value) => Number(value || 0).toLocaleString("nb-NO");
const html = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[m]));

function makeDebugPanel() {
  if ($("vmDebugPanel")) return;
  const panel = document.createElement("section");
  panel.id = "vmDebugPanel";
  panel.style.cssText = `
    position:fixed;left:10px;right:10px;bottom:10px;z-index:99999;
    max-height:34vh;overflow:auto;background:rgba(4,10,18,.96);color:#dcecff;
    border:1px solid rgba(228,184,78,.55);border-radius:16px;padding:10px 12px;
    font:12px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:0 18px 60px rgba(0,0,0,.5);
  `;
  panel.innerHTML = `
    <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:6px">
      <strong style="color:#e4b84e">VM DEBUG</strong>
      <button id="vmDebugClear" type="button" style="background:#203553;color:#fff;border:0;border-radius:10px;padding:4px 8px">Tøm</button>
    </div>
    <div id="vmDebugLog"></div>
  `;
  document.body.appendChild(panel);
  $("vmDebugClear")?.addEventListener("click", () => $("vmDebugLog").innerHTML = "");
}

function debug(message, error = null) {
  makeDebugPanel();
  const line = `[${new Date().toLocaleTimeString("nb-NO")}] ${message}`;
  console.log("VM DEBUG:", message, error || "");
  const el = $("vmDebugLog");
  if (el) {
    const row = document.createElement("div");
    row.style.color = error ? "#ff9b9b" : "#b9f6c8";
    row.textContent = error ? `${line} → ${error.code || ""} ${error.message || error}` : line;
    el.appendChild(row);
    el.scrollTop = el.scrollHeight;
  }
}

function toast(message) {
  const el = $("toast");
  if (!el) return alert(message);
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.hidden = true, 4500);
}

function handleError(error, context = "Feil") {
  debug(`${context}`, error);
  toast(`${context}: ${error?.code || ""} ${error?.message || error}`);
}

function showAuth(show) {
  const authScreen = $("authScreen");
  if (authScreen) authScreen.hidden = !show;
  document.body.classList.toggle("is-auth", show);
}

function winPercent(won, completed) {
  const w = Number(won || 0);
  const c = Number(completed || 0);
  return c > 0 ? Math.round((w / c) * 100) : 0;
}

function normalizeUser(data = {}, id = "") {
  const completed = Number(data.completedBets || 0);
  const won = Number(data.wonBets || 0);
  return {
    uid: data.uid || id || currentUser?.uid || "",
    name: data.name || data.username || currentUser?.displayName || currentUser?.email?.split("@")[0] || "Spiller",
    email: data.email || currentUser?.email || "",
    coins: Number(data.coins ?? START_COINS),
    elo: Number(data.elo ?? data.chessElo ?? 1000),
    placedBets: Number(data.placedBets || 0),
    wonBets: won,
    completedBets: completed,
    hitRate: `${winPercent(won, completed)}%`,
    netProfit: Number(data.netProfit || 0),
    isAdmin: data.isAdmin === true
  };
}

function isAdmin() {
  return state.user?.isAdmin === true;
}

async function initFirebase() {
  debug(`app.js startet: ${VM_APP_VERSION}`);
  if (!window.firebase) throw new Error("Firebase SDK mangler. CDN-script ble ikke lastet.");
  if (!window.VM_FIREBASE_CONFIG) throw new Error("VM_FIREBASE_CONFIG mangler. Sjekk js/firebase-config.js.");
  if (!firebase.apps.length) firebase.initializeApp(window.VM_FIREBASE_CONFIG);
  auth = firebase.auth();
  db = firebase.firestore();
  debug(`Firebase OK: ${window.VM_FIREBASE_CONFIG.projectId}`);
  debug(`Domene: ${location.hostname}`);
}

async function ensureUserDocument(user, chosenName = "") {
  const ref = db.collection("users").doc(user.uid);
  debug(`Firestore: leser users/${user.uid}`);
  const snap = await ref.get();
  if (snap.exists) {
    debug("Firestore: bruker finnes");
    return;
  }
  debug("Firestore: lager ny bruker med 5000 VM Coins");
  await ref.set({
    uid: user.uid,
    name: chosenName || user.displayName || user.email?.split("@")[0] || "Spiller",
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
  debug("Firestore: bruker opprettet");
}

function detachListeners() {
  unsubscribers.forEach((fn) => { try { fn(); } catch {} });
  unsubscribers = [];
}

function attachListeners() {
  detachListeners();
  if (!currentUser) return;
  debug("Starter Firestore listeners");

  unsubscribers.push(db.collection("users").doc(currentUser.uid).onSnapshot((snap) => {
    if (snap.exists) {
      state.user = normalizeUser(snap.data(), snap.id);
      debug(`Min bruker lest: ${state.user.name} / ${state.user.coins} coins / admin=${state.user.isAdmin}`);
      renderAll();
    }
  }, (error) => handleError(error, "Listener users/{me}")));

  unsubscribers.push(db.collection("users").onSnapshot((snap) => {
    state.users = snap.docs.map((doc) => normalizeUser(doc.data(), doc.id))
      .sort((a, b) => Number(b.coins || 0) - Number(a.coins || 0));
    renderLeaderboard();
    renderProfile();
  }, (error) => handleError(error, "Listener users")));

  unsubscribers.push(db.collection("matches").onSnapshot((snap) => {
    state.matches = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(a.time || "").localeCompare(String(b.time || "")));
    debug(`Kamper lest: ${state.matches.length}`);
    renderMatches();
    renderAdmin();
  }, (error) => handleError(error, "Listener matches")));

  unsubscribers.push(db.collection("bets").where("userId", "==", currentUser.uid).onSnapshot((snap) => {
    state.bets = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
    renderMyBets();
  }, (error) => handleError(error, "Listener bets")));

  unsubscribers.push(db.collection("forumPosts").onSnapshot((snap) => {
    state.posts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
    renderForum();
  }, (error) => handleError(error, "Listener forumPosts")));

  unsubscribers.push(db.collection("chatMessages").where("room", "==", currentRoom).onSnapshot((snap) => {
    state.messages = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => Number(a.createdAtMs || 0) - Number(b.createdAtMs || 0));
    renderChat();
  }, (error) => handleError(error, "Listener chatMessages")));
}

function setPage(page) {
  document.querySelectorAll(".page").forEach((el) => el.classList.toggle("active", el.id === `page-${page}`));
  document.querySelectorAll("[data-page]").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
  document.body.classList.remove("menu-open");
}

function renderProfile() {
  const user = state.user || normalizeUser();
  const rank = state.users.findIndex((row) => row.uid === user.uid) + 1;
  const values = {
    ...user,
    coins: fmt(user.coins),
    netProfit: fmt(user.netProfit),
    rank: rank > 0 ? `#${rank}` : "-"
  };
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const key = el.dataset.bind;
    if (key in values) el.textContent = values[key];
  });
  const initial = (user.name || "S").charAt(0).toUpperCase();
  if ($("homeAvatar")) $("homeAvatar").textContent = initial;
  if ($("profileAvatar")) $("profileAvatar").textContent = initial;
}

function renderLeaderboard() {
  const rows = state.users.map((row, index) => `
    <div class="leaderboard-row ${row.uid === currentUser?.uid ? "me" : ""}">
      <b>#${index + 1}</b>
      <div class="avatar small">${html((row.name || "S").charAt(0).toUpperCase())}</div>
      <div><b>${html(row.name)}</b><small>${html(row.hitRate)} treff · ${html(row.placedBets)} spill</small></div>
      <b>${fmt(row.coins)}</b>
    </div>
  `).join("") || `<div class="empty">Ingen spillere ennå.</div>`;
  if ($("homeLeaderboard")) $("homeLeaderboard").innerHTML = rows;
  if ($("leaderboardPageList")) $("leaderboardPageList").innerHTML = rows;
}

function formatTime(value) {
  if (!value) return "Ikke satt";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("nb-NO", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function matchTitle(match) {
  return `${match.home || "Hjemme"} – ${match.away || "Borte"}`;
}

function pickLabel(match, pick) {
  if (pick === "home") return match.home || "Hjemmeseier";
  if (pick === "away") return match.away || "Borteseier";
  return "Uavgjort";
}

function pickOdds(match, pick) {
  return Number(match.odds?.[pick] || 1);
}

function renderMatches() {
  const box = $("matchList");
  if (!box) return;
  if (!state.matches.length) {
    box.innerHTML = `<article class="card empty">Ingen kamper ennå. Thomas/admin må legge inn kamper.</article>`;
    return;
  }
  box.innerHTML = state.matches.map((match) => `
    <article class="card match-card search-item">
      <div class="match-top"><small>${html(match.group || "VM 2026")}</small><small>${html(formatTime(match.time))}</small></div>
      <div class="teams"><strong>${html(match.home)}</strong><span>vs</span><strong>${html(match.away)}</strong></div>
      ${match.result ? `<div class="summary-line"><span>Resultat</span><b>${html(pickLabel(match, match.result))}</b></div>` : ""}
      <div class="odds-row">
        ${["home", "draw", "away"].map((pick) => `
          <button class="odd-button ${state.selected.some((item) => item.matchId === match.id && item.pick === pick) ? "selected" : ""}" data-match-id="${match.id}" data-pick="${pick}" ${match.result ? "disabled" : ""}>
            <small>${html(pickLabel(match, pick))}</small><b>${pickOdds(match, pick).toFixed(2)}</b>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");
  box.querySelectorAll("[data-match-id]").forEach((button) => {
    button.addEventListener("click", () => selectOdd(button.dataset.matchId, button.dataset.pick));
  });
}

function selectOdd(matchId, pick) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match || match.result) return;
  state.selected = state.selected.filter((item) => item.matchId !== matchId);
  state.selected.push({ matchId, pick, title: matchTitle(match), label: pickLabel(match, pick), odds: pickOdds(match, pick) });
  renderMatches();
  renderSlip();
}

function renderSlip() {
  const hasItems = state.selected.length > 0;
  if ($("slipCount")) $("slipCount").textContent = state.selected.length;
  if ($("slipEmpty")) $("slipEmpty").hidden = hasItems;
  if ($("slipContent")) $("slipContent").hidden = !hasItems;
  if ($("slipItems")) $("slipItems").innerHTML = state.selected.map((item) => `
    <div class="slip-item"><div><b>${html(item.label)}</b><small>${html(item.title)}</small></div><b>${Number(item.odds).toFixed(2)}</b></div>
  `).join("");
  const stake = Math.min(Number($("stakeInput")?.value || 0), MAX_STAKE);
  const totalOdds = state.selected.reduce((sum, item) => sum * Number(item.odds || 1), 1);
  if ($("totalOdds")) $("totalOdds").textContent = totalOdds.toFixed(2);
  if ($("possibleWin")) $("possibleWin").textContent = fmt(Math.floor(stake * totalOdds));
}

async function placeBet() {
  try {
    if (!state.user) return toast("Du må logge inn først.");
    if (!state.selected.length) return toast("Velg odds først.");
    const stake = Number($("stakeInput")?.value || 0);
    if (stake < 10 || stake > MAX_STAKE) return toast(`Innsats må være mellom 10 og ${MAX_STAKE}.`);
    if (stake > state.user.coins) return toast("Du har ikke nok VM Coins.");
    const totalOdds = state.selected.reduce((sum, item) => sum * Number(item.odds || 1), 1);
    const possibleWin = Math.floor(stake * totalOdds);
    const batch = db.batch();
    const betRef = db.collection("bets").doc();
    batch.set(betRef, {
      userId: currentUser.uid,
      userName: state.user.name,
      selections: state.selected,
      stake,
      totalOdds: Number(totalOdds.toFixed(2)),
      possibleWin,
      status: "Aktiv",
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.update(db.collection("users").doc(currentUser.uid), {
      coins: firebase.firestore.FieldValue.increment(-stake),
      placedBets: firebase.firestore.FieldValue.increment(1),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    state.selected = [];
    renderAll();
    toast("Spill plassert.");
  } catch (error) {
    handleError(error, "Plasser spill");
  }
}

function renderMyBets() {
  const box = $("myBets");
  if (!box) return;
  box.innerHTML = state.bets.length ? state.bets.map((bet) => `
    <div class="my-bet"><div><b>${html((bet.selections || []).map((s) => s.label).join(" + "))}</b><small>${html((bet.selections || []).map((s) => s.title).join(", "))}</small></div><div><b>${fmt(bet.possibleWin)}</b><small>${html(bet.status)}</small></div></div>
  `).join("") : `<div class="empty">Ingen spill ennå.</div>`;
}

function renderAdmin() {
  const admin = isAdmin();
  if ($("adminPanel")) $("adminPanel").hidden = !admin;
  if ($("adminLocked")) $("adminLocked").hidden = admin;
  const select = $("resultMatchSelect");
  if (select) {
    const openMatches = state.matches.filter((match) => !match.result);
    select.innerHTML = openMatches.length
      ? `<option value="">Velg kamp</option>${openMatches.map((match) => `<option value="${match.id}">${html(matchTitle(match))}</option>`).join("")}`
      : `<option value="">Ingen åpne kamper</option>`;
  }
}

async function addMatch(event) {
  event.preventDefault();
  if (!isAdmin()) return toast("Kun admin kan legge inn kamper.");
  const form = new FormData(event.target);
  try {
    await db.collection("matches").add({
      home: String(form.get("home") || "").trim(),
      away: String(form.get("away") || "").trim(),
      time: form.get("time"),
      group: "VM 2026",
      result: null,
      odds: {
        home: Number(form.get("homeOdds")),
        draw: Number(form.get("drawOdds")),
        away: Number(form.get("awayOdds"))
      },
      createdBy: currentUser.uid,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    event.target.reset();
    toast("Kamp lagt til.");
  } catch (error) {
    handleError(error, "Legg til kamp");
  }
}

async function addResult(event) {
  event.preventDefault();
  if (!isAdmin()) return toast("Kun admin kan legge inn resultat.");
  const form = new FormData(event.target);
  const matchId = form.get("matchId");
  const result = form.get("result");
  if (!matchId || !result) return toast("Velg kamp og resultat.");
  try {
    await db.collection("matches").doc(matchId).update({ result, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    toast("Resultat lagt inn.");
  } catch (error) {
    handleError(error, "Legg inn resultat");
  }
}

function renderForum() {
  const box = $("posts");
  if (!box) return;
  box.innerHTML = state.posts.length ? state.posts.map((post) => `
    <article class="card post search-item"><h3>${html(post.title)}</h3><p>${html(post.text)}</p><small>Av ${html(post.author || "Spiller")}</small></article>
  `).join("") : `<article class="card empty">Ingen innlegg ennå.</article>`;
}

async function addPost(event) {
  event.preventDefault();
  const title = $("postTitle")?.value.trim();
  const text = $("postText")?.value.trim();
  if (!title || !text) return;
  try {
    await db.collection("forumPosts").add({
      title,
      text,
      author: state.user?.name || currentUser.email,
      userId: currentUser.uid,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    event.target.reset();
  } catch (error) {
    handleError(error, "Publiser innlegg");
  }
}

function renderChat() {
  const box = $("messages");
  if (!box) return;
  if ($("roomTitle")) $("roomTitle").textContent = currentRoom === "public" ? "Offentlig chat" : `Privat chat med ${currentRoom}`;
  box.innerHTML = state.messages.map((msg) => `
    <div class="message"><b>${html(msg.name || msg.userName || "Spiller")}</b><p>${html(msg.text)}</p></div>
  `).join("") || `<div class="empty">Ingen meldinger ennå.</div>`;
  box.scrollTop = box.scrollHeight;
}

async function sendChat(event) {
  event.preventDefault();
  const input = $("chatInput");
  const text = input?.value.trim();
  if (!text) return;
  try {
    await db.collection("chatMessages").add({
      room: currentRoom,
      text,
      userId: currentUser.uid,
      name: state.user?.name || currentUser.email,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = "";
  } catch (error) {
    handleError(error, "Send chat");
  }
}

function renderAll() {
  renderProfile();
  renderLeaderboard();
  renderMatches();
  renderSlip();
  renderMyBets();
  renderAdmin();
  renderForum();
  renderChat();
}

function bindUi() {
  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.authTab;
      document.querySelectorAll("[data-auth-tab]").forEach((item) => item.classList.toggle("active", item === button));
      if ($("loginForm")) $("loginForm").hidden = tab !== "login";
      if ($("registerForm")) $("registerForm").hidden = tab !== "register";
    });
  });

  $("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const email = $("loginEmail").value.trim();
      const password = $("loginPassword").value;
      debug(`Login prøves: ${email}`);
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      handleError(error, "Login");
    }
  });

  $("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const name = $("registerName").value.trim() || "Spiller";
      const email = $("registerEmail").value.trim();
      const password = $("registerPassword").value;
      debug(`Registrering prøves: ${email}`);
      const credential = await auth.createUserWithEmailAndPassword(email, password);
      await credential.user.updateProfile({ displayName: name });
      await ensureUserDocument(credential.user, name);
      toast("Bruker opprettet.");
    } catch (error) {
      handleError(error, "Registrering");
    }
  });

  document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.page)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setPage(button.dataset.go)));
  $("menuToggle")?.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $("clearSlipBtn")?.addEventListener("click", () => { state.selected = []; renderAll(); });
  $("stakeInput")?.addEventListener("input", renderSlip);
  $("placeBetBtn")?.addEventListener("click", placeBet);
  $("matchForm")?.addEventListener("submit", addMatch);
  $("resultForm")?.addEventListener("submit", addResult);
  $("postForm")?.addEventListener("submit", addPost);
  $("chatForm")?.addEventListener("submit", sendChat);
  $("editNameBtn")?.addEventListener("click", async () => {
    const name = prompt("Nytt navn:", state.user?.name || "");
    if (!name) return;
    try { await db.collection("users").doc(currentUser.uid).update({ name: name.trim(), updatedAt: firebase.firestore.FieldValue.serverTimestamp() }); }
    catch (error) { handleError(error, "Endre navn"); }
  });
  document.querySelectorAll(".room").forEach((button) => button.addEventListener("click", () => {
    currentRoom = button.dataset.room || "public";
    document.querySelectorAll(".room").forEach((item) => item.classList.toggle("active", item === button));
    attachListeners();
  }));
  $("searchInput")?.addEventListener("input", (event) => {
    const q = event.target.value.toLowerCase();
    document.querySelectorAll(".search-item").forEach((item) => item.style.display = item.textContent.toLowerCase().includes(q) ? "" : "none");
  });
}

(async function start() {
  try {
    makeDebugPanel();
    await initFirebase();
    bindUi();
    showAuth(true);
    auth.onAuthStateChanged(async (firebaseUser) => {
      currentUser = firebaseUser;
      debug(firebaseUser ? `Auth state: innlogget ${firebaseUser.email}` : "Auth state: ikke innlogget");
      if (!firebaseUser) {
        detachListeners();
        state.user = null;
        showAuth(true);
        return;
      }
      try {
        await ensureUserDocument(firebaseUser);
        state.user = normalizeUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] });
        showAuth(false);
        renderAll();
        attachListeners();
      } catch (error) {
        state.user = normalizeUser({ uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] });
        showAuth(false);
        renderAll();
        handleError(error, "Etter login: Firestore brukeroppretting/lesing");
      }
    });
  } catch (error) {
    handleError(error, "Oppstart");
  }
})();
