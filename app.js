const STORAGE_KEY = "vm-lounge-2026-state-v2";

function uid(){
  if(window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seed = {
  user: { name: "Thomas", coins: 10000, elo: 1032 },
  selected: [],
  bets: [],
  activity: [
    { text: "Velkommen til VM Lounge 2026.", time: "nå" },
    { text: "Demo-kamper er lagt inn.", time: "nå" }
  ],
  matches: [
    { id: uid(), home: "Mexico", away: "Sør-Afrika", flags: ["🇲🇽", "🇿🇦"], time: "2026-06-11T21:00", status: "Åpningskamp", odds: { home: 1.95, draw: 3.40, away: 4.10 } },
    { id: uid(), home: "Canada", away: "Qatar", flags: ["🇨🇦", "🇶🇦"], time: "2026-06-12T02:00", status: "Gruppekamp", odds: { home: 2.20, draw: 3.15, away: 3.30 } },
    { id: uid(), home: "USA", away: "Japan", flags: ["🇺🇸", "🇯🇵"], time: "2026-06-12T20:00", status: "Anbefalt", odds: { home: 2.05, draw: 3.35, away: 3.60 } },
    { id: uid(), home: "Argentina", away: "Frankrike", flags: ["🇦🇷", "🇫🇷"], time: "2026-06-14T21:00", status: "Toppkamp", odds: { home: 2.45, draw: 3.20, away: 2.75 } },
    { id: uid(), home: "Brasil", away: "Tyskland", flags: ["🇧🇷", "🇩🇪"], time: "2026-06-15T18:00", status: "Klassiker", odds: { home: 2.25, draw: 3.30, away: 3.05 } }
  ],
  forum: [
    { id: uid(), title: "Hvem blir toppscorer i VM?", text: "Jeg tror Mbappé eller kanskje Haaland hvis Norge kommer langt. Hva tror dere?", author: "Thomas", likes: 4 },
    { id: uid(), title: "Regler for vennekonkurransen", text: "Forslag: 10 000 coins i startsaldo, maks 2 000 coins per kamp og toppliste etter finalen.", author: "Admin", likes: 7 }
  ],
  chat: {
    public: [
      { from: "Admin", text: "Velkommen til offentlig VM-chat!", time: "nå" },
      { from: "Elise", text: "Dette blir gøy 😄", time: "nå" }
    ],
    Elise: [{ from: "Elise", text: "Klar for VM?", time: "nå" }],
    Kjell: [{ from: "Kjell", text: "Jeg følger leaderboardet!", time: "nå" }],
    Heidi: [{ from: "Heidi", text: "Heia Norge!", time: "nå" }]
  },
  leaderboard: [
    { name: "Thomas", coins: 10000, elo: 1032 },
    { name: "Elise", coins: 9700, elo: 1018 },
    { name: "Heidi", coins: 9500, elo: 1045 },
    { name: "Kjell", coins: 9300, elo: 980 }
  ]
};

let state = loadState();
let currentRoom = "public";

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(seed);
    const saved = JSON.parse(raw);
    if(saved.user && !('elo' in saved.user)) saved.user.elo = 1000;
    if(Array.isArray(saved.leaderboard)) saved.leaderboard = saved.leaderboard.map(row => ({ elo: 1000, ...row }));
    return saved;
  }catch{
    return structuredClone(seed);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCoins(value){
  return Number(value || 0).toLocaleString("nb-NO");
}

function formatTime(value){
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("nb-NO", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.hidden = true, 2400);
}

function ensureCurrentUser(){
  if(!state.user.elo) state.user.elo = 1000;
  const row = state.leaderboard.find(item => item.name === state.user.name);
  if(row){
    row.coins = state.user.coins;
    row.elo = state.user.elo;
  }else{
    state.leaderboard.push({ name: state.user.name, coins: state.user.coins, elo: state.user.elo });
  }
}

function setPage(page){
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.getElementById(page)?.classList.add("active");

  document.querySelectorAll("[data-page]").forEach(button => {
    const active = button.dataset.page === page;
    button.classList.toggle("active", active);
    if(active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  document.body.classList.remove("menu-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function syncProfile(){
  ensureCurrentUser();
  const initial = (state.user.name || "T").charAt(0).toUpperCase();
  document.getElementById("coinsRail").textContent = formatCoins(state.user.coins);
  document.getElementById("coinsProfile").textContent = formatCoins(state.user.coins);
  document.getElementById("profileName").textContent = state.user.name;
  document.getElementById("avatarInitial").textContent = initial;
  document.getElementById("profileElo").textContent = state.user.elo;
  document.getElementById("profileEloBadge").textContent = state.user.elo;
  document.getElementById("homeElo").textContent = state.user.elo;
  document.getElementById("chessElo").textContent = state.user.elo;

  const percent = Math.max(4, Math.min(100, (state.user.coins / 10000) * 100));
  document.getElementById("walletBar").style.width = `${percent}%`;
}

function matchCard(match){
  const selected = state.selected.find(item => item.matchId === match.id);
  const options = [
    ["home", "1", match.home, match.odds.home],
    ["draw", "X", "Uavgjort", match.odds.draw],
    ["away", "2", match.away, match.odds.away]
  ];

  return `
    <article class="match-card search-item">
      <div class="match-top">
        <span>VM 2026</span>
        <span>${escapeHtml(match.status)} • ${escapeHtml(formatTime(match.time))}</span>
      </div>
      <div class="match-teams">
        <div class="team-box">
          <div class="flag">${match.flags?.[0] || "⚽"}</div>
          <strong>${escapeHtml(match.home)}</strong>
        </div>
        <div class="vs-badge">VS</div>
        <div class="team-box away">
          <div class="flag">${match.flags?.[1] || "⚽"}</div>
          <strong>${escapeHtml(match.away)}</strong>
        </div>
      </div>
      <div class="odds-row">
        ${options.map(([pick, label, name, odds]) => `
          <button class="odd-button ${selected?.pick === pick ? "selected" : ""}" data-match="${match.id}" data-pick="${pick}">
            <small>${label}</small>
            <b>${Number(odds).toFixed(2)}</b>
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function renderMatches(){
  document.getElementById("homeMatches").innerHTML = state.matches.slice(0, 3).map(matchCard).join("");
  document.getElementById("matchList").innerHTML = state.matches.map(matchCard).join("");

  document.querySelectorAll(".odd-button").forEach(button => {
    button.addEventListener("click", () => selectOdd(button.dataset.match, button.dataset.pick));
  });
}

function selectOdd(matchId, pick){
  const match = state.matches.find(item => item.id === matchId);
  if(!match) return;

  state.selected = state.selected.filter(item => item.matchId !== matchId);

  const label = pick === "home" ? match.home : pick === "away" ? match.away : "Uavgjort";
  state.selected.push({
    matchId,
    pick,
    label,
    title: `${match.home} - ${match.away}`,
    odds: match.odds[pick]
  });

  saveState();
  renderMatches();
  renderSlip();
}

function renderSlip(){
  const empty = document.getElementById("emptySlip");
  const body = document.getElementById("slipBody");
  const items = document.getElementById("slipItems");
  const homeWin = document.getElementById("homeWin");

  const hasItems = state.selected.length > 0;
  empty.hidden = hasItems;
  body.hidden = !hasItems;

  if(!hasItems){
    homeWin.textContent = "0";
    return;
  }

  items.innerHTML = state.selected.map(item => `
    <div class="selection">
      <b>${escapeHtml(item.label)}</b>
      <small>${escapeHtml(item.title)} • odds ${Number(item.odds).toFixed(2)}</small>
    </div>
  `).join("");

  const totalOdds = state.selected.reduce((sum, item) => sum * Number(item.odds), 1);
  const stake = Math.max(0, Number(document.getElementById("stake")?.value || 100));
  const possibleWin = Math.round(totalOdds * stake);

  document.getElementById("totalOdds").textContent = totalOdds.toFixed(2);
  document.getElementById("possibleWin").textContent = formatCoins(possibleWin);
  homeWin.textContent = formatCoins(possibleWin);
}

function placeBet(){
  const stake = Math.max(0, Number(document.getElementById("stake")?.value || 0));
  if(!state.selected.length) return toast("Velg odds først.");
  if(stake < 10) return toast("Minimum innsats er 10 coins.");
  if(stake > state.user.coins) return toast("Du har ikke nok coins.");

  const totalOdds = state.selected.reduce((sum, item) => sum * Number(item.odds), 1);
  state.user.coins -= stake;
  state.bets.unshift({
    id: uid(),
    selections: structuredClone(state.selected),
    stake,
    odds: totalOdds,
    possibleWin: Math.round(stake * totalOdds),
    status: "Aktiv"
  });
  state.activity.unshift({ text: `${state.user.name} plasserte et bet på ${formatCoins(stake)} coins.`, time: "nå" });
  state.selected = [];

  saveState();
  renderAll();
  toast("Bet plassert!");
}

function renderLeaderboard(){
  ensureCurrentUser();
  const sorted = [...state.leaderboard].sort((a, b) => b.coins - a.coins);

  document.getElementById("leaderboard").innerHTML = sorted.map((row, index) => `
    <div class="row">
      <div class="badge">${index + 1}</div>
      <div>
        <b>${escapeHtml(row.name)}</b>
        <small>VM-tipster</small>
        <span class="elo-tag">Sjakk ELO ${row.elo}</span>
      </div>
      <b>${formatCoins(row.coins)}</b>
    </div>
  `).join("");

  const rank = sorted.findIndex(row => row.name === state.user.name) + 1;
  document.getElementById("rankNo").textContent = rank || "-";
}

function renderActivity(){
  document.getElementById("activity").innerHTML = state.activity.slice(0, 8).map(item => `
    <div class="row">
      <div class="badge">•</div>
      <div>
        <b>${escapeHtml(item.text)}</b>
        <small>${escapeHtml(item.time || "nå")}</small>
      </div>
      <small>VM</small>
    </div>
  `).join("");
}

function renderForum(){
  document.getElementById("posts").innerHTML = state.forum.map(post => `
    <article class="post search-item">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.text)}</p>
      <div class="meta">
        <span>Av ${escapeHtml(post.author)}</span>
        <span>♡ ${post.likes || 0}</span>
      </div>
    </article>
  `).join("");

  document.getElementById("postCount").textContent = state.forum.filter(post => post.author === state.user.name).length;
}

function renderChat(){
  const roomTitle = document.getElementById("roomTitle");
  const messages = document.getElementById("messages");

  roomTitle.textContent = currentRoom === "public" ? "Offentlig chat" : `Privat chat med ${currentRoom}`;

  messages.innerHTML = (state.chat[currentRoom] || []).map(message => `
    <div class="msg ${message.from === state.user.name ? "me" : ""}">
      <small>${escapeHtml(message.from)}${message.time ? ` • ${escapeHtml(message.time)}` : ""}</small>
      ${escapeHtml(message.text)}
    </div>
  `).join("");

  messages.scrollTop = messages.scrollHeight;
}

function renderProfile(){
  document.getElementById("activeBets").textContent = state.bets.filter(bet => bet.status === "Aktiv").length;

  const myBets = document.getElementById("myBets");
  if(!state.bets.length){
    myBets.innerHTML = '<div class="empty-box">Du har ingen bets enda.</div>';
    return;
  }

  myBets.innerHTML = state.bets.map(bet => `
    <div class="bet-row">
      <div class="badge">◉</div>
      <div>
        <b>${bet.selections.map(selection => escapeHtml(selection.label)).join(" + ")}</b>
        <small>${bet.selections.map(selection => escapeHtml(selection.title)).join(", ")}</small>
      </div>
      <div style="text-align:right">
        <b>${formatCoins(bet.possibleWin)}</b>
        <small>${escapeHtml(bet.status)}</small>
      </div>
    </div>
  `).join("");
}

function renderBoard(){
  const pieces = [
    "♜","♞","♝","♛","♚","♝","♞","♜",
    "♟","♟","♟","♟","♟","♟","♟","♟",
    "","","","","","","", "",
    "","","","♙","","","", "",
    "","","","","♙","","", "",
    "","","♘","","","♘","", "",
    "♙","♙","♙","","","♙","♙","♙",
    "♖","","♗","♕","♔","♗","","♖"
  ];

  document.getElementById("board").innerHTML = pieces.map((piece, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const dark = (row + col) % 2 === 1;
    return `<div class="sq ${dark ? "dark" : "light"}">${piece}</div>`;
  }).join("");
}

function addMatch(event){
  event.preventDefault();
  const form = new FormData(event.target);
  state.matches.unshift({
    id: uid(),
    home: form.get("home").trim(),
    away: form.get("away").trim(),
    flags: ["⚽", "⚽"],
    time: form.get("time"),
    status: "Ny kamp",
    odds: {
      home: Number(form.get("oh")),
      draw: Number(form.get("ox")),
      away: Number(form.get("oa"))
    }
  });

  state.activity.unshift({ text: `Ny kamp lagt inn: ${form.get("home")} - ${form.get("away")}`, time: "nå" });
  event.target.reset();
  saveState();
  renderAll();
  toast("Kamp lagt til.");
}

function addForumPost(event){
  event.preventDefault();
  const title = document.getElementById("postTitle").value.trim();
  const text = document.getElementById("postText").value.trim();
  if(!title || !text) return;

  state.forum.unshift({ id: uid(), title, text, author: state.user.name, likes: 0 });
  state.activity.unshift({ text: `${state.user.name} publiserte i forumet.`, time: "nå" });
  event.target.reset();
  saveState();
  renderAll();
  toast("Innlegg publisert.");
}

function sendMessage(event){
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;

  state.chat[currentRoom] ??= [];
  state.chat[currentRoom].push({ from: state.user.name, text, time: "nå" });
  input.value = "";
  saveState();
  renderChat();
}

function loginUser(){
  const nextName = prompt("Skriv brukernavn:", state.user.name);
  if(!nextName) return;
  const trimmed = nextName.trim();
  const known = state.leaderboard.find(row => row.name === trimmed);
  state.user.name = trimmed;
  state.user.elo = known?.elo ?? state.user.elo ?? 1000;
  state.user.coins = known?.coins ?? state.user.coins;
  saveState();
  renderAll();
  toast(`Logget inn som ${state.user.name}`);
}

function registerUser(){
  const nextName = prompt("Velg brukernavn:");
  if(!nextName) return;
  state.user = { name: nextName.trim(), coins: 10000, elo: 1000 };
  ensureCurrentUser();
  saveState();
  renderAll();
  toast("Ny demo-bruker opprettet.");
}

function editName(){
  const previous = state.user.name;
  const nextName = prompt("Nytt navn:", previous);
  if(!nextName) return;
  const trimmed = nextName.trim();
  if(!trimmed) return;

  const existing = state.leaderboard.find(row => row.name === previous);
  if(existing) existing.name = trimmed;
  state.user.name = trimmed;

  state.forum = state.forum.map(post => post.author === previous ? { ...post, author: trimmed } : post);
  Object.keys(state.chat).forEach(key => {
    state.chat[key] = state.chat[key].map(msg => msg.from === previous ? { ...msg, from: trimmed } : msg);
  });

  saveState();
  renderAll();
  toast("Profilnavn oppdatert.");
}

function resetDemo(){
  if(!confirm("Nullstille demo-data på denne enheten?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(seed);
  saveState();
  renderAll();
  toast("Demo nullstilt.");
}

function filterSearch(query){
  const lower = query.trim().toLowerCase();
  document.querySelectorAll(".search-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(lower) ? "" : "none";
  });
}

function renderAll(){
  syncProfile();
  renderMatches();
  renderSlip();
  renderLeaderboard();
  renderActivity();
  renderForum();
  renderChat();
  renderProfile();
  renderBoard();
}

function bindEvents(){
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => setPage(button.dataset.page));
  });

  document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => setPage(button.dataset.go));
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("stake").addEventListener("input", renderSlip);
  document.getElementById("clearSlip").addEventListener("click", () => {
    state.selected = [];
    saveState();
    renderMatches();
    renderSlip();
  });

  document.getElementById("placeBet").addEventListener("click", placeBet);
  document.getElementById("matchForm").addEventListener("submit", addMatch);
  document.getElementById("postForm").addEventListener("submit", addForumPost);
  document.getElementById("chatForm").addEventListener("submit", sendMessage);

  document.querySelectorAll(".room").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".room").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      currentRoom = button.dataset.room;
      renderChat();
    });
  });

  document.getElementById("loginBtn").addEventListener("click", loginUser);
  document.getElementById("registerBtn").addEventListener("click", registerUser);
  document.getElementById("editName").addEventListener("click", editName);
  document.getElementById("resetBtn").addEventListener("click", resetDemo);
  document.getElementById("search").addEventListener("input", e => filterSearch(e.target.value));
}

bindEvents();
renderAll();
