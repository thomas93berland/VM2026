const START_COINS = window.VM_RULES?.START_COINS ?? 5000;
const MAX_STAKE = window.VM_RULES?.MAX_STAKE ?? 500;

const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M3.8 10.7 12 4l8.2 6.7"/><path d="M6.5 9.6v9.1h4.1v-5.2h2.8v5.2h4.1V9.6"/></svg>',
  ball: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.2"/><path d="m7.8 8.4 4.2-2 4.2 2 1 4.5-2.9 3.5H9.7l-2.9-3.5 1-4.5Z"/><path d="M12 6.4v4.1M8.8 16.2 6 18.3M15.2 16.2l2.8 2.1M6.8 12.9l-3-.8M17.2 12.9l3-.8"/></svg>',
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
  ticket: '<svg viewBox="0 0 24 24"><path d="M4 7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.2a2.3 2.3 0 0 0 0 4.6v2.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.2a2.3 2.3 0 0 0 0-4.6V7.5Z"/><path d="M9 8.5h6M9 12h6M9 15.5h4"/></svg>'
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

      const ownIndex = state.leaderboard.findIndex(player => player.uid === currentUser?.uid);
      if(state.user && ownIndex >= 0) state.user.rank = `#${ownIndex + 1}`;

      renderAll();
    }, handleFirebaseError)
  );

  unsubscribers.push(
    db.collection("matches").onSnapshot(snapshot => {
      state.matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a,b) => String(a.time || "").localeCompare(String(b.time || "")));
      renderAll();
    }, handleFirebaseError)
  );

  unsubscribers.push(
    db.collection("bets").where("userId","==",uid).onSnapshot(snapshot => {
      state.bets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a,b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
      renderAll();
    }, handleFirebaseError)
  );

  unsubscribers.push(
    db.collection("forumPosts").onSnapshot(snapshot => {
      state.forum = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a,b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
        .slice(0, 40);
      renderForum();
    }, handleFirebaseError)
  );

  listenToRoom(currentRoom);
}

let unsubscribeRoom = null;

function listenToRoom(room){
  if(unsubscribeRoom){
    try{ unsubscribeRoom(); }catch{}
    unsubscribeRoom = null;
  }

  unsubscribeRoom = db.collection("chatMessages")
    .where("room","==",room)
    .onSnapshot(snapshot => {
      state.chat = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a,b) => Number(a.createdAtMs || 0) - Number(b.createdAtMs || 0))
        .slice(-80);
      renderChat();
    }, handleFirebaseError);

  unsubscribers.push(unsubscribeRoom);
}

function handleFirebaseError(error){
  console.error(error);
  toast(error.message || "Firebase-feil.");
}

function showAuth(show){
  const authScreen = document.getElementById("authScreen");
  if(authScreen) authScreen.hidden = !show;
}

function bindAuth(){
  document.querySelectorAll("[data-auth-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.authTab;
      document.querySelectorAll("[data-auth-tab]").forEach(item => item.classList.toggle("active", item === btn));
      document.getElementById("loginForm").hidden = tab !== "login";
      document.getElementById("registerForm").hidden = tab !== "register";
    });
  });

  document.getElementById("loginForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    try{
      await auth.signInWithEmailAndPassword(email, password);
    }catch(error){
      handleFirebaseError(error);
    }
  });

  document.getElementById("registerForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    try{
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: name });
      await ensureUserDocument(result.user, name);
      toast("Bruker opprettet.");
    }catch(error){
      handleFirebaseError(error);
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => auth.signOut());
}

function bindText(){
  const user = state.user || userWithDefaults();

  const values = {
    name: user.name,
    coins: formatNumber(user.coins),
    elo: user.elo,
    placedBets: user.placedBets,
    wonBets: user.wonBets,
    hitRate: user.hitRate,
    rank: user.rank,
    netProfit: formatNumber(user.netProfit)
  };

  document.querySelectorAll("[data-bind]").forEach(el => {
    const key = el.dataset.bind;
    if(key in values) el.textContent = values[key];
  });

  const initial = (user.name || "T").trim().charAt(0).toUpperCase();
  document.getElementById("homeAvatar").textContent = initial;
  document.getElementById("profileAvatar").textContent = initial;
}

function setPage(page){
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.getElementById(`page-${page}`)?.classList.add("active");

  document.querySelectorAll("[data-page]").forEach(btn => {
    const active = btn.dataset.page === page;
    btn.classList.toggle("active", active);
    if(active) btn.setAttribute("aria-current","page");
    else btn.removeAttribute("aria-current");
  });

  document.body.classList.remove("menu-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHomeActivity(){
  const wrap = document.getElementById("homeActivity");
  if(!wrap) return;

  const dynamic = [];
  if(state.bets[0]){
    dynamic.push({
      icon: "ticket",
      text: `Siste spill: ${state.bets[0].selections.map(item => item.label).join(" + ")}`,
      time: state.bets[0].status || "Aktiv"
    });
  }

  const items = [...dynamic, ...seedActivity].slice(0, 5);

  wrap.innerHTML = items.map(item => `
    <div class="activity">
      <span class="nav-icon gold" data-icon="${item.icon}"></span>
      <p>${escapeHtml(item.text)}</p>
      <time>${escapeHtml(item.time)}</time>
    </div>
  `).join("");
  injectIcons();
}

function renderLeaderboard(){
  const sorted = [...state.leaderboard].sort((a,b) => Number(b.coins || 0) - Number(a.coins || 0));
  const homeWrap = document.getElementById("homeLeaderboard");
  const pageWrap = document.getElementById("leaderboardPageList");

  function template(player, index){
    const rank = index + 1;
    const isMe = currentUser && player.uid === currentUser.uid;
    const you = isMe ? '<span class="you-badge">deg</span>' : '';

    return `
      <div class="leaderboard-row ${isMe ? "me" : ""}">
        <div class="leaderboard-rank">#${rank}</div>
        <div class="leaderboard-user">
          <strong>${escapeHtml(player.name)} ${you}</strong>
          <small>Sjakk ELO ${escapeHtml(player.elo || "-")}</small>
        </div>
        <div class="leaderboard-stat coins">
          <span>VM Coins</span>
          <b>${formatNumber(player.coins)}</b>
        </div>
        <div class="leaderboard-stat win">
          <span>Vinn %</span>
          <b>${escapeHtml(player.hitRate || "0%")}</b>
        </div>
        <div class="leaderboard-stat bets">
          <span>Spill</span>
          <b>${formatNumber(player.placedBets || 0)}</b>
        </div>
      </div>
    `;
  }

  const empty = '<div class="empty">Ingen brukere enda.</div>';
  if(homeWrap) homeWrap.innerHTML = sorted.length ? sorted.slice(0, 5).map(template).join("") : empty;
  if(pageWrap) pageWrap.innerHTML = sorted.length ? sorted.map(template).join("") : empty;
}

function renderMatches(){
  const wrap = document.getElementById("matchList");
  if(!wrap) return;

  if(!state.matches.length){
    wrap.innerHTML = '<div class="empty">Ingen kamper lagt inn enda. Admin kan legge inn kamper nederst på siden.</div>';
    return;
  }

  wrap.innerHTML = state.matches.map(match => {
    const selected = state.selected.find(item => item.matchId === match.id);
    const odds = [
      ["home", "1", match.odds?.home],
      ["draw", "X", match.odds?.draw],
      ["away", "2", match.odds?.away]
    ];

    return `
      <article class="match-card search-item">
        <div class="match-top">
          <span>VM 2026 • ${escapeHtml(match.group || "Kamp")} ${match.result ? `<em class="match-result">${resultLabel(match.result)}</em>` : ""}</span>
          <span>${escapeHtml(formatTime(match.time))}</span>
        </div>
        <div class="match-body">
          <div class="team">
            <div class="flag">${escapeHtml(match.flags?.[0] || "⚽")}</div>
            <strong>${escapeHtml(match.home)}</strong>
          </div>
          <div class="vs">VS</div>
          <div class="team away">
            <div class="flag">${escapeHtml(match.flags?.[1] || "⚽")}</div>
            <strong>${escapeHtml(match.away)}</strong>
          </div>
        </div>
        <div class="odds-row">
          ${odds.map(([pick,label,value]) => `
            <button class="odd ${selected?.pick === pick ? "selected" : ""}" data-match="${match.id}" data-pick="${pick}" ${match.result ? "disabled" : ""}>
              <small>${label}</small>
              <b>${Number(value || 0).toFixed(2)}</b>
            </button>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");

  wrap.querySelectorAll(".odd").forEach(btn => {
    btn.addEventListener("click", () => selectOdd(btn.dataset.match, btn.dataset.pick));
  });
}

function selectOdd(matchId, pick){
  const match = state.matches.find(item => item.id === matchId);
  if(!match) return;
  if(match.result) return toast("Kampen er allerede avgjort.");

  state.selected = state.selected.filter(item => item.matchId !== matchId);

  const label = pick === "home" ? match.home : pick === "away" ? match.away : "Uavgjort";
  state.selected.push({
    matchId,
    pick,
    label,
    title: `${match.home} – ${match.away}`,
    odds: Number(match.odds[pick])
  });

  renderMatches();
  renderSlip();
}

function renderSlip(){
  const count = document.getElementById("slipCount");
  const empty = document.getElementById("slipEmpty");
  const content = document.getElementById("slipContent");
  const items = document.getElementById("slipItems");
  if(!count || !empty || !content || !items) return;

  count.textContent = state.selected.length;
  const has = state.selected.length > 0;
  empty.hidden = has;
  content.hidden = !has;

  if(!has) return;

  items.innerHTML = state.selected.map((item, index) => `
    <div class="slip-item">
      <span class="nav-icon" data-icon="ball"></span>
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <small>1X2 – ${escapeHtml(item.label)}</small>
      </div>
      <b>${Number(item.odds).toFixed(2)}</b>
      <button class="remove" data-remove="${index}" aria-label="Fjern">×</button>
    </div>
  `).join("");

  items.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selected.splice(Number(btn.dataset.remove), 1);
      renderMatches();
      renderSlip();
    });
  });

  updateSlipNumbers();
  injectIcons();
}

function updateSlipNumbers(){
  if(!state.selected.length) return;
  const totalOdds = state.selected.reduce((acc, item) => acc * Number(item.odds), 1);
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));
  document.getElementById("totalOdds").textContent = totalOdds.toFixed(2);
  document.getElementById("possibleWin").textContent = formatNumber(Math.round(stake * totalOdds));
}

async function placeBet(){
  if(!currentUser || !state.user) return toast("Du må være logget inn.");
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));

  if(!state.selected.length) return toast("Velg odds først.");
  const containsFinishedMatch = state.selected.some(selection => {
    const match = state.matches.find(item => item.id === selection.matchId);
    return match && match.result;
  });
  if(containsFinishedMatch) return toast("Du kan ikke plassere spill på en avgjort kamp.");
  if(stake < 10) return toast("Minimum innsats er 10 coins.");
  if(stake > MAX_STAKE) return toast(`Maks innsats per kamp er ${MAX_STAKE} VM Coins.`);
  if(stake > Number(state.user.coins || 0)) return toast("Du har ikke nok VM Coins.");

  const totalOdds = state.selected.reduce((acc, item) => acc * Number(item.odds), 1);
  const possibleWin = Math.round(stake * totalOdds);
  const userRef = db.collection("users").doc(currentUser.uid);
  const betRef = db.collection("bets").doc();

  try{
    await db.runTransaction(async tx => {
      const userSnap = await tx.get(userRef);
      if(!userSnap.exists) throw new Error("Fant ikke brukerprofil.");
      const coins = Number(userSnap.data().coins || 0);
      if(coins < stake) throw new Error("Du har ikke nok VM Coins.");

      tx.update(userRef, {
        coins: coins - stake,
        placedBets: firebase.firestore.FieldValue.increment(1),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      tx.set(betRef, {
        userId: currentUser.uid,
        userName: state.user.name,
        selections: structuredClone(state.selected),
        stake,
        totalOdds,
        possibleWin,
        status: "Aktiv",
        createdAtMs: Date.now(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });

    state.selected = [];
    renderMatches();
    renderSlip();
    toast("Spill plassert!");
  }catch(error){
    handleFirebaseError(error);
  }
}

function renderForum(){
  const wrap = document.getElementById("posts");
  if(!wrap) return;

  if(!state.forum.length){
    wrap.innerHTML = '<div class="empty">Ingen foruminnlegg enda.</div>';
    return;
  }

  wrap.innerHTML = state.forum.map(post => `
    <article class="post-card search-item">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.text)}</p>
      <footer>
        <span>Av ${escapeHtml(post.author || "Ukjent")}</span>
        <span>♡ ${post.likes || 0}</span>
      </footer>
    </article>
  `).join("");
}

function renderChat(){
  const title = document.getElementById("roomTitle");
  const messages = document.getElementById("messages");
  if(!title || !messages) return;

  title.textContent = currentRoom === "public" ? "Offentlig chat" : `Privat chat med ${currentRoom}`;

  if(!state.chat.length){
    messages.innerHTML = '<div class="empty">Ingen meldinger enda.</div>';
    return;
  }

  messages.innerHTML = state.chat.map(msg => `
    <div class="message ${msg.userId === currentUser?.uid ? "me" : ""}">
      <small>${escapeHtml(msg.from || "Ukjent")}</small>
      ${escapeHtml(msg.text)}
    </div>
  `).join("");
  messages.scrollTop = messages.scrollHeight;
}

function renderMyBets(){
  const wrap = document.getElementById("myBets");
  if(!wrap) return;

  if(!state.bets.length){
    wrap.innerHTML = '<div class="empty">Du har ingen plasserte spill enda.</div>';
    return;
  }

  wrap.innerHTML = state.bets.map(bet => `
    <div class="bet-row">
      <span class="nav-icon gold" data-icon="ticket"></span>
      <div>
        <strong>${(bet.selections || []).map(item => escapeHtml(item.label)).join(" + ")}</strong>
        <small>${(bet.selections || []).map(item => escapeHtml(item.title)).join(", ")}</small>
      </div>
      <div style="text-align:right">
        <strong>${formatNumber(bet.possibleWin)}</strong>
        <small>${escapeHtml(bet.status)}</small>
      </div>
    </div>
  `).join("");
  injectIcons();
}

function renderBoard(){
  const board = document.getElementById("miniBoard");
  if(!board) return;

  const pieces = [
    "♜","♞","♝","♛","♚","♝","♞","♜",
    "♟","♟","♟","♟","♟","♟","♟","♟",
    "","","","","","","","",
    "","","","♙","","","","",
    "","","","","♙","","","",
    "","","♘","","","♘","","",
    "♙","♙","♙","","","♙","♙","♙",
    "♖","","♗","♕","♔","♗","","♖"
  ];

  board.innerHTML = pieces.map((piece, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return `<div class="${(row + col) % 2 ? "dark" : "light"}">${piece}</div>`;
  }).join("");
}

async function addMatch(event){
  event.preventDefault();
  if(!isAdmin()) return toast("Kun Thomas/admin kan legge inn kamper.");

  const form = new FormData(event.target);

  try{
    await db.collection("matches").add({
      home: form.get("home").trim(),
      away: form.get("away").trim(),
      flags: ["⚽", "⚽"],
      time: form.get("time"),
      group: "Ny kamp",
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
  }catch(error){
    handleFirebaseError(error);
  }
}

async function addPost(event){
  event.preventDefault();
  if(!state.user) return toast("Du må være logget inn.");

  const title = document.getElementById("postTitle").value.trim();
  const text = document.getElementById("postText").value.trim();
  if(!title || !text) return;

  try{
    await db.collection("forumPosts").add({
      title,
      text,
      author: state.user.name,
      userId: currentUser.uid,
      likes: 0,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    event.target.reset();
    toast("Innlegg publisert.");
  }catch(error){
    handleFirebaseError(error);
  }
}

async function sendChat(event){
  event.preventDefault();
  if(!state.user) return toast("Du må være logget inn.");

  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;

  try{
    await db.collection("chatMessages").add({
      room: currentRoom,
      text,
      from: state.user.name,
      userId: currentUser.uid,
      createdAtMs: Date.now(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = "";
  }catch(error){
    handleFirebaseError(error);
  }
}

async function editName(){
  if(!currentUser) return;
  const name = prompt("Nytt navn:", state.user?.name || "");
  if(!name) return;

  try{
    const clean = name.trim();
    await currentUser.updateProfile({ displayName: clean });
    await db.collection("users").doc(currentUser.uid).update({
      name: clean,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    toast("Navn oppdatert.");
  }catch(error){
    handleFirebaseError(error);
  }
}

function renderAdminControls(){
  const adminPanel = document.getElementById("adminPanel");
  const adminLocked = document.getElementById("adminLocked");
  const select = document.getElementById("resultMatchSelect");

  if(adminPanel) adminPanel.hidden = !isAdmin();
  if(adminLocked) adminLocked.hidden = isAdmin();

  if(select){
    const openMatches = state.matches.filter(match => !match.result);
    if(!openMatches.length){
      select.innerHTML = '<option value="">Ingen åpne kamper</option>';
    }else{
      select.innerHTML = '<option value="">Velg kamp</option>' + openMatches.map(match => `
        <option value="${match.id}">${escapeHtml(match.home)} – ${escapeHtml(match.away)}</option>
      `).join("");
    }
  }
}

async function registerResult(event){
  event.preventDefault();
  if(!isAdmin()) return toast("Kun admin kan legge inn resultater.");

  const form = new FormData(event.target);
  const matchId = form.get("matchId");
  const result = form.get("result");
  const match = state.matches.find(item => item.id === matchId);

  if(!match || !result) return toast("Velg kamp og resultat.");

  try{
    await db.collection("matches").doc(matchId).update({
      result,
      resultBy: currentUser.uid,
      resultAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    const updatedMatches = state.matches.map(item => item.id === matchId ? { ...item, result } : item);
    await settleBetsAfterResult(updatedMatches);

    state.selected = state.selected.filter(selection => selection.matchId !== matchId);
    event.target.reset();
    toast("Resultat lagt inn.");
  }catch(error){
    handleFirebaseError(error);
  }
}

async function settleBetsAfterResult(matchesSnapshot){
  const matchesById = Object.fromEntries(matchesSnapshot.map(match => [match.id, match]));
  const activeBets = await db.collection("bets").where("status","==","Aktiv").get();

  const batch = db.batch();
  let updates = 0;

  activeBets.forEach(doc => {
    const bet = doc.data();
    const selections = bet.selections || [];

    const allSelectionsHaveResults = selections.every(selection => {
      const match = matchesById[selection.matchId];
      return match && match.result;
    });

    if(!allSelectionsHaveResults) return;

    const allCorrect = selections.every(selection => {
      const match = matchesById[selection.matchId];
      return match && match.result === selection.pick;
    });

    const status = allCorrect ? "Vunnet" : "Tapt";
    const payout = allCorrect ? Number(bet.possibleWin || 0) : 0;
    const stake = Number(bet.stake || 0);
    const profit = allCorrect ? payout - stake : -stake;

    batch.update(doc.ref, {
      status,
      payout,
      settledAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    batch.update(db.collection("users").doc(bet.userId), {
      completedBets: firebase.firestore.FieldValue.increment(1),
      wonBets: firebase.firestore.FieldValue.increment(allCorrect ? 1 : 0),
      coins: firebase.firestore.FieldValue.increment(payout),
      netProfit: firebase.firestore.FieldValue.increment(profit),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    updates += 1;
  });

  if(updates > 0) await batch.commit();
}

function filterSearch(value){
  const query = value.trim().toLowerCase();
  document.querySelectorAll(".search-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
  });
}

function renderAll(){
  injectIcons();
  bindText();
  renderHomeActivity();
  renderLeaderboard();
  renderMatches();
  renderSlip();
  renderForum();
  renderChat();
  renderMyBets();
  renderBoard();
  renderAdminControls();
}

function bindEvents(){
  bindAuth();

  const stakeInput = document.getElementById("stakeInput");
  if(stakeInput){
    stakeInput.max = MAX_STAKE;
    if(Number(stakeInput.value || 0) > MAX_STAKE) stakeInput.value = "100";
  }

  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.go));
  });

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("stakeInput")?.addEventListener("input", updateSlipNumbers);
  document.getElementById("placeBetBtn")?.addEventListener("click", placeBet);
  document.getElementById("clearSlipBtn")?.addEventListener("click", () => {
    state.selected = [];
    renderMatches();
    renderSlip();
  });

  document.getElementById("matchForm")?.addEventListener("submit", addMatch);
  document.getElementById("resultForm")?.addEventListener("submit", registerResult);
  document.getElementById("postForm")?.addEventListener("submit", addPost);
  document.getElementById("chatForm")?.addEventListener("submit", sendChat);
  document.getElementById("editNameBtn")?.addEventListener("click", editName);
  document.getElementById("searchInput")?.addEventListener("input", event => filterSearch(event.target.value));

  document.querySelectorAll(".room").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".room").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      currentRoom = btn.dataset.room;
      listenToRoom(currentRoom);
      renderChat();
    });
  });
}

function boot(){
  try{
    initFirebase();
    bindEvents();
    injectIcons();
    renderBoard();
    showAuth(true);

    auth.onAuthStateChanged(async user => {
      currentUser = user;

      if(!user){
        detachListeners();
        if(unsubscribeRoom){
          try{ unsubscribeRoom(); }catch{}
          unsubscribeRoom = null;
        }
        state.user = null;
        state.leaderboard = [];
        state.bets = [];
        state.matches = [];
        state.forum = [];
        state.chat = [];
        showAuth(true);
        return;
      }

      try{
        await ensureUserDocument(user);
        showAuth(false);
        attachListeners();
        toast("Logget inn.");
      }catch(error){
        handleFirebaseError(error);
      }
    });
  }catch(error){
    console.error(error);
    toast(error.message || "Kunne ikke starte appen.");
  }
}

boot();
