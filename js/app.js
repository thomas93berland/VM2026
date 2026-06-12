const STORAGE_KEY = "vm-lounge-2026-rules-admin-v1";

const START_COINS = 5000;
const MAX_STAKE = 500;
const ADMIN_USERNAME = "Thomas";

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

const seed = {
  user: {
    name: "Thomas",
    coins: START_COINS,
    elo: 1032,
    placedBets: 0,
    wonBets: 0,
    completedBets: 0,
    hitRate: "0%",
    rank: "#1",
    netProfit: 0
  },
  leaderboard: [
    { name: "Thomas", coins: 5000, elo: 1032, wonBets: 0, completedBets: 0, bets: 0 },
    { name: "Elise", coins: 4700, elo: 1018, wonBets: 8, completedBets: 15, bets: 18 },
    { name: "Kjell", coins: 4200, elo: 980, wonBets: 6, completedBets: 14, bets: 17 },
    { name: "Heidi", coins: 3900, elo: 1045, wonBets: 7, completedBets: 13, bets: 16 },
    { name: "Marius", coins: 3100, elo: 1090, wonBets: 4, completedBets: 12, bets: 14 }
  ],
  selected: [],
  bets: [],
  matches: [
    { id: "m1", home: "Brasil", away: "Frankrike", flags: ["🇧🇷", "🇫🇷"], time: "2026-06-15T18:00", group: "Gruppe A", odds: { home: 1.82, draw: 3.60, away: 4.55 }, result: null },
    { id: "m2", home: "Argentina", away: "Tyskland", flags: ["🇦🇷", "🇩🇪"], time: "2026-06-15T21:00", group: "Gruppe B", odds: { home: 1.95, draw: 3.45, away: 3.95 }, result: null },
    { id: "m3", home: "Portugal", away: "Uruguay", flags: ["🇵🇹", "🇺🇾"], time: "2026-06-16T18:00", group: "Gruppe C", odds: { home: 2.10, draw: 3.30, away: 3.70 }, result: null }
  ],
  activity: [
    { icon: "cup", text: "Reglene er satt: 5 000 VM Coins i startsaldo", time: "Nå" },
    { icon: "ticket", text: "Maks innsats per kamp er 500 VM Coins", time: "Nå" },
    { icon: "medal", text: "Leaderboard sorteres etter VM Coins", time: "Nå" }
  ],
  forum: [
    { title: "Regler for VM Lounge", text: "Startsaldo er 5 000 VM Coins. Maks innsats per kamp er 500. Vinnprosent regnes som vunne spill delt på ferdige spill.", author: "Admin", likes: 8 },
    { title: "Hvem blir toppscorer i VM?", text: "Jeg tror Brasil kommer sterkt, men Frankrike ser farlige ut.", author: "Thomas", likes: 4 }
  ],
  chat: {
    public: [
      { from: "Admin", text: "Velkommen til VM Lounge! Startsaldo er 5 000 VM Coins." },
      { from: "Elise", text: "Jeg er klar for VM-konkurranse 😄" }
    ],
    Elise: [{ from: "Elise", text: "Husk å invitere meg til ligaen!" }],
    Kjell: [{ from: "Kjell", text: "Dette blir spennende." }],
    Heidi: [{ from: "Heidi", text: "Heia!" }]
  }
};

let state = loadState();
let currentRoom = "public";

function loadState(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seed);
  }catch{
    return structuredClone(seed);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.hidden = true, 2400);
}

function injectIcons(){
  document.querySelectorAll("[data-icon]").forEach(el => {
    const name = el.dataset.icon;
    if(ICONS[name]) el.innerHTML = ICONS[name];
  });
}

function isAdmin(){
  return String(state.user?.name || "").trim().toLowerCase() === ADMIN_USERNAME.toLowerCase();
}

function calculateWinPercent(won, completed){
  const w = Number(won || 0);
  const c = Number(completed || 0);
  return c > 0 ? Math.round((w / c) * 100) : 0;
}

function ensureUserDefaults(){
  state.user.coins = Number(state.user.coins ?? START_COINS);
  state.user.placedBets = Number(state.user.placedBets || 0);
  state.user.wonBets = Number(state.user.wonBets || 0);
  state.user.completedBets = Number(state.user.completedBets || 0);
  state.user.netProfit = Number(state.user.netProfit || 0);
  const percent = calculateWinPercent(state.user.wonBets, state.user.completedBets);
  state.user.hitRate = `${percent}%`;
}

function ensureLeaderboard(){
  ensureUserDefaults();

  if(!Array.isArray(state.leaderboard)){
    state.leaderboard = structuredClone(seed.leaderboard || []);
  }

  const userName = state.user.name || ADMIN_USERNAME;
  const current = state.leaderboard.find(player => player.name === userName);

  if(current){
    current.coins = Number(state.user.coins || 0);
    current.elo = state.user.elo;
    current.wonBets = Number(state.user.wonBets || 0);
    current.completedBets = Number(state.user.completedBets || 0);
    current.bets = Number(state.user.placedBets || 0);
  }else{
    state.leaderboard.push({
      name: userName,
      coins: Number(state.user.coins || 0),
      elo: state.user.elo,
      wonBets: Number(state.user.wonBets || 0),
      completedBets: Number(state.user.completedBets || 0),
      bets: Number(state.user.placedBets || 0)
    });
  }

  state.leaderboard.forEach((player) => {
    player.coins = Number(player.coins || 0);
    player.wonBets = Number(player.wonBets || 0);
    player.completedBets = Number(player.completedBets || 0);
    player.bets = Number(player.bets ?? player.placedBets ?? 0);
    player.winPercent = calculateWinPercent(player.wonBets, player.completedBets);
    player.hitRate = `${player.winPercent}%`;
    player.isMe = player.name === userName;
  });

  state.leaderboard.sort((a, b) => Number(b.coins || 0) - Number(a.coins || 0));
  const userIndex = state.leaderboard.findIndex(player => player.name === userName);
  if(userIndex >= 0){
    state.user.rank = `#${userIndex + 1}`;
  }
}

function renderLeaderboard(){
  ensureLeaderboard();

  const homeWrap = document.getElementById("homeLeaderboard");
  const pageWrap = document.getElementById("leaderboardPageList");

  function template(player, index){
    const rank = index + 1;
    const isMe = player.name === state.user.name;
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
          <b>${formatNumber(player.bets)}</b>
        </div>
      </div>
    `;
  }

  if(homeWrap){
    homeWrap.innerHTML = state.leaderboard.slice(0, 5).map(template).join("");
  }

  if(pageWrap){
    pageWrap.innerHTML = state.leaderboard.map(template).join("");
  }
}

function bindText(){
  ensureUserDefaults();
  const values = {
    name: state.user.name,
    coins: formatNumber(state.user.coins),
    elo: state.user.elo,
    placedBets: state.user.placedBets,
    wonBets: state.user.wonBets,
    hitRate: state.user.hitRate,
    rank: state.user.rank,
    netProfit: formatNumber(state.user.netProfit)
  };
  document.querySelectorAll("[data-bind]").forEach(el => {
    const key = el.dataset.bind;
    if(key in values) el.textContent = values[key];
  });
  const initial = (state.user.name || "T").trim().charAt(0).toUpperCase();
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
  wrap.innerHTML = state.activity.map(item => `
    <div class="activity">
      <span class="nav-icon gold" data-icon="${item.icon}"></span>
      <p>${escapeHtml(item.text)}</p>
      <time>${escapeHtml(item.time)}</time>
    </div>
  `).join("");
  injectIcons();
}

function renderMatches(){
  const wrap = document.getElementById("matchList");
  wrap.innerHTML = state.matches.map(match => {
    const selected = state.selected.find(item => item.matchId === match.id);
    const odds = [
      ["home", "1", match.odds.home],
      ["draw", "X", match.odds.draw],
      ["away", "2", match.odds.away]
    ];
    return `
      <article class="match-card search-item">
        <div class="match-top">
          <span>VM 2026 • ${escapeHtml(match.group)} ${match.result ? `<em class="match-result">${resultLabel(match.result)}</em>` : ""}</span>
          <span>${escapeHtml(formatTime(match.time))}</span>
        </div>
        <div class="match-body">
          <div class="team">
            <div class="flag">${match.flags[0]}</div>
            <strong>${escapeHtml(match.home)}</strong>
          </div>
          <div class="vs">VS</div>
          <div class="team away">
            <div class="flag">${match.flags[1]}</div>
            <strong>${escapeHtml(match.away)}</strong>
          </div>
        </div>
        <div class="odds-row">
          ${odds.map(([pick,label,value]) => `
            <button class="odd ${selected?.pick === pick ? "selected" : ""}" data-match="${match.id}" data-pick="${pick}" ${match.result ? "disabled" : ""}>
              <small>${label}</small>
              <b>${Number(value).toFixed(2)}</b>
            </button>
          `).join("")}
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".odd").forEach(btn => {
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
    odds: match.odds[pick]
  });

  saveState();
  renderMatches();
  renderSlip();
}

function renderSlip(){
  const count = document.getElementById("slipCount");
  const empty = document.getElementById("slipEmpty");
  const content = document.getElementById("slipContent");
  const items = document.getElementById("slipItems");

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

  document.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selected.splice(Number(btn.dataset.remove), 1);
      saveState();
      renderMatches();
      renderSlip();
    });
  });

  const totalOdds = state.selected.reduce((acc, item) => acc * Number(item.odds), 1);
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));
  document.getElementById("totalOdds").textContent = totalOdds.toFixed(2);
  document.getElementById("possibleWin").textContent = formatNumber(Math.round(stake * totalOdds));
  injectIcons();
}

function placeBet(){
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));
  if(!state.selected.length) return toast("Velg odds først.");
  const containsFinishedMatch = state.selected.some(selection => {
    const match = state.matches.find(item => item.id === selection.matchId);
    return match && match.result;
  });
  if(containsFinishedMatch) return toast("Du kan ikke plassere spill på en avgjort kamp.");
  if(stake < 10) return toast("Minimum innsats er 10 coins.");
  if(stake > MAX_STAKE) return toast(`Maks innsats per kamp er ${MAX_STAKE} VM Coins.`);
  if(stake > state.user.coins) return toast("Du har ikke nok VM Coins.");

  const totalOdds = state.selected.reduce((acc, item) => acc * Number(item.odds), 1);
  const possibleWin = Math.round(stake * totalOdds);

  state.user.coins -= stake;
  state.user.placedBets += 1;
  state.bets.unshift({
    selections: structuredClone(state.selected),
    stake,
    totalOdds,
    possibleWin,
    status: "Aktiv"
  });
  state.activity.unshift({
    icon: "ticket",
    text: `Du plasserte et spill på ${formatNumber(stake)} VM Coins`,
    time: "nå"
  });
  state.selected = [];

  ensureLeaderboard();
  saveState();
  renderAll();
  toast("Spill plassert!");
}

function renderForum(){
  const wrap = document.getElementById("posts");
  wrap.innerHTML = state.forum.map(post => `
    <article class="post-card search-item">
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.text)}</p>
      <footer>
        <span>Av ${escapeHtml(post.author)}</span>
        <span>♡ ${post.likes || 0}</span>
      </footer>
    </article>
  `).join("");
}

function renderChat(){
  const title = document.getElementById("roomTitle");
  const messages = document.getElementById("messages");
  title.textContent = currentRoom === "public" ? "Offentlig chat" : `Privat chat med ${currentRoom}`;

  messages.innerHTML = (state.chat[currentRoom] || []).map(msg => `
    <div class="message ${msg.from === state.user.name ? "me" : ""}">
      <small>${escapeHtml(msg.from)}</small>
      ${escapeHtml(msg.text)}
    </div>
  `).join("");
  messages.scrollTop = messages.scrollHeight;
}

function renderMyBets(){
  const wrap = document.getElementById("myBets");
  if(!state.bets.length){
    wrap.innerHTML = '<div class="empty">Du har ingen plasserte spill enda.</div>';
    return;
  }
  wrap.innerHTML = state.bets.map(bet => `
    <div class="bet-row">
      <span class="nav-icon gold" data-icon="ticket"></span>
      <div>
        <strong>${bet.selections.map(item => escapeHtml(item.label)).join(" + ")}</strong>
        <small>${bet.selections.map(item => escapeHtml(item.title)).join(", ")}</small>
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
  document.getElementById("miniBoard").innerHTML = pieces.map((piece, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return `<div class="${(row + col) % 2 ? "dark" : "light"}">${piece}</div>`;
  }).join("");
}

function addMatch(event){
  event.preventDefault();
  if(!isAdmin()) return toast("Kun Thomas kan legge inn kamper.");
  const form = new FormData(event.target);
  const id = `m${Date.now()}`;
  state.matches.unshift({
    id,
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
    }
  });
  state.activity.unshift({ icon: "ball", text: `Ny kamp lagt inn: ${form.get("home")} – ${form.get("away")}`, time: "nå" });
  event.target.reset();
  saveState();
  renderAll();
  toast("Kamp lagt til.");
}

function addPost(event){
  event.preventDefault();
  const title = document.getElementById("postTitle").value.trim();
  const text = document.getElementById("postText").value.trim();
  if(!title || !text) return;
  state.forum.unshift({ title, text, author: state.user.name, likes: 0 });
  state.activity.unshift({ icon: "chat", text: "Du publiserte et foruminnlegg", time: "nå" });
  event.target.reset();
  saveState();
  renderAll();
  toast("Innlegg publisert.");
}

function sendChat(event){
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;
  state.chat[currentRoom] ??= [];
  state.chat[currentRoom].push({ from: state.user.name, text });
  input.value = "";
  saveState();
  renderChat();
}

function editName(){
  const name = prompt("Nytt navn:", state.user.name);
  if(!name) return;

  const previousName = state.user.name;
  const nextName = name.trim();
  const leaderboardRow = Array.isArray(state.leaderboard)
    ? state.leaderboard.find(player => player.name === previousName)
    : null;

  if(leaderboardRow) leaderboardRow.name = nextName;
  state.user.name = nextName;

  ensureLeaderboard();
  saveState();
  renderAll();
  toast("Navn oppdatert.");
}

function filterSearch(value){
  const query = value.trim().toLowerCase();
  document.querySelectorAll(".search-item").forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(query) ? "" : "none";
  });
}


function renderAdminControls(){
  const adminPanel = document.getElementById("adminPanel");
  const adminLocked = document.getElementById("adminLocked");
  const select = document.getElementById("resultMatchSelect");

  if(adminPanel){
    adminPanel.hidden = !isAdmin();
  }

  if(adminLocked){
    adminLocked.hidden = isAdmin();
  }

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

function settleBetsAfterResult(){
  let settled = 0;
  let wins = 0;

  state.bets.forEach(bet => {
    if(bet.status !== "Aktiv") return;

    const allSelectionsHaveResults = bet.selections.every(selection => {
      const match = state.matches.find(item => item.id === selection.matchId);
      return match && match.result;
    });

    if(!allSelectionsHaveResults) return;

    const allCorrect = bet.selections.every(selection => {
      const match = state.matches.find(item => item.id === selection.matchId);
      return match && match.result === selection.pick;
    });

    bet.status = allCorrect ? "Vunnet" : "Tapt";
    state.user.completedBets += 1;
    settled += 1;

    if(allCorrect){
      state.user.wonBets += 1;
      state.user.coins += Number(bet.possibleWin || 0);
      state.user.netProfit += Number(bet.possibleWin || 0) - Number(bet.stake || 0);
      wins += 1;
    }else{
      state.user.netProfit -= Number(bet.stake || 0);
    }
  });

  if(settled > 0){
    state.activity.unshift({
      icon: wins > 0 ? "win" : "ticket",
      text: `${settled} spill ble avgjort. Vunne spill: ${wins}`,
      time: "nå"
    });
  }
}

function registerResult(event){
  event.preventDefault();

  if(!isAdmin()){
    toast("Kun Thomas kan legge inn resultater.");
    return;
  }

  const form = new FormData(event.target);
  const matchId = form.get("matchId");
  const result = form.get("result");
  const match = state.matches.find(item => item.id === matchId);

  if(!match || !result){
    toast("Velg kamp og resultat.");
    return;
  }

  match.result = result;
  state.selected = state.selected.filter(selection => selection.matchId !== matchId);
  state.activity.unshift({
    icon: "medal",
    text: `Resultat lagt inn: ${match.home} – ${match.away} (${resultLabel(result)})`,
    time: "nå"
  });

  settleBetsAfterResult();
  ensureLeaderboard();
  saveState();
  renderAll();
  toast("Resultat lagt inn.");
}

function renderAll(){
  ensureLeaderboard();
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
  const stakeInput = document.getElementById("stakeInput");
  if(stakeInput) stakeInput.max = MAX_STAKE;
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.go));
  });

  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("stakeInput")?.addEventListener("input", renderSlip);
  document.getElementById("placeBetBtn")?.addEventListener("click", placeBet);
  document.getElementById("clearSlipBtn")?.addEventListener("click", () => {
    state.selected = [];
    saveState();
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
      renderChat();
    });
  });
}

bindEvents();
renderAll();
