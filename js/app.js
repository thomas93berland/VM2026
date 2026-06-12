const STORAGE_KEY = "vm-lounge-2026-upload-ready-v1";

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
    coins: 250000,
    elo: 1032,
    placedBets: 124,
    wonBets: 68,
    hitRate: "54%",
    rank: "#5",
    netProfit: 35500
  },
  selected: [
    { matchId: "m1", pick: "home", label: "Brasil", title: "Brasil – Frankrike", odds: 1.82 },
    { matchId: "m2", pick: "away", label: "Tyskland", title: "Argentina – Tyskland", odds: 1.95 }
  ],
  bets: [],
  matches: [
    { id: "m1", home: "Brasil", away: "Frankrike", flags: ["🇧🇷", "🇫🇷"], time: "2026-06-15T18:00", group: "Gruppe A", odds: { home: 1.82, draw: 3.60, away: 4.55 } },
    { id: "m2", home: "Argentina", away: "Tyskland", flags: ["🇦🇷", "🇩🇪"], time: "2026-06-15T21:00", group: "Gruppe B", odds: { home: 1.95, draw: 3.45, away: 3.95 } },
    { id: "m3", home: "Portugal", away: "Uruguay", flags: ["🇵🇹", "🇺🇾"], time: "2026-06-16T18:00", group: "Gruppe C", odds: { home: 2.10, draw: 3.30, away: 3.70 } }
  ],
  activity: [
    { icon: "cup", text: "Du klatret til #5 på topplisten", time: "I dag" },
    { icon: "trend", text: "Vant 2 spill og tjente 3 550 VM Coins", time: "I går" },
    { icon: "win", text: "Treffprosenten din er nå 54%", time: "2 dager siden" }
  ],
  forum: [
    { title: "Hvem blir toppscorer i VM?", text: "Jeg tror Brasil kommer sterkt, men Frankrike ser farlige ut.", author: "Thomas", likes: 4 },
    { title: "Forslag til regler", text: "Maks innsats per kamp, og egen premie til best treffprosent.", author: "Admin", likes: 8 }
  ],
  chat: {
    public: [
      { from: "Admin", text: "Velkommen til VM Lounge!" },
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

function bindText(){
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
          <span>VM 2026 • ${escapeHtml(match.group)}</span>
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
            <button class="odd ${selected?.pick === pick ? "selected" : ""}" data-match="${match.id}" data-pick="${pick}">
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
  if(stake < 10) return toast("Minimum innsats er 10 coins.");
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
  const form = new FormData(event.target);
  const id = `m${Date.now()}`;
  state.matches.unshift({
    id,
    home: form.get("home").trim(),
    away: form.get("away").trim(),
    flags: ["⚽", "⚽"],
    time: form.get("time"),
    group: "Ny kamp",
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
  state.user.name = name.trim();
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

function renderAll(){
  injectIcons();
  bindText();
  renderHomeActivity();
  renderMatches();
  renderSlip();
  renderForum();
  renderChat();
  renderMyBets();
  renderBoard();
}

function bindEvents(){
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.page));
  });
  document.querySelectorAll("[data-go]").forEach(btn => {
    btn.addEventListener("click", () => setPage(btn.dataset.go));
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.body.classList.toggle("menu-open");
  });

  document.getElementById("stakeInput").addEventListener("input", renderSlip);
  document.getElementById("placeBetBtn").addEventListener("click", placeBet);
  document.getElementById("clearSlipBtn").addEventListener("click", () => {
    state.selected = [];
    saveState();
    renderMatches();
    renderSlip();
  });

  document.getElementById("matchForm").addEventListener("submit", addMatch);
  document.getElementById("postForm").addEventListener("submit", addPost);
  document.getElementById("chatForm").addEventListener("submit", sendChat);
  document.getElementById("editNameBtn").addEventListener("click", editName);
  document.getElementById("searchInput").addEventListener("input", event => filterSearch(event.target.value));

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
