import { formatNumber, escapeHtml, formatTime, toast } from "./helpers.js";
import { injectIcons } from "../icons.js";

export function renderBetting(state, saveState, renderAll){
  renderMatches(state, saveState, renderAll);
  renderSlip(state, saveState, renderAll);
}

function renderMatches(state, saveState, renderAll){
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

  wrap.querySelectorAll(".odd").forEach(btn => {
    btn.addEventListener("click", () => {
      selectOdd(state, btn.dataset.match, btn.dataset.pick);
      saveState();
      renderAll();
    });
  });
}

function selectOdd(state, matchId, pick){
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
}

function renderSlip(state, saveState, renderAll){
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

  items.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selected.splice(Number(btn.dataset.remove), 1);
      saveState();
      renderAll();
    });
  });

  updateSlipNumbers(state);
  injectIcons(items);
}

export function updateSlipNumbers(state){
  if(!state.selected.length) return;

  const totalOdds = state.selected.reduce((acc, item) => acc * Number(item.odds), 1);
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));
  document.getElementById("totalOdds").textContent = totalOdds.toFixed(2);
  document.getElementById("possibleWin").textContent = formatNumber(Math.round(stake * totalOdds));
}

export function placeBet(state){
  const stake = Math.max(0, Number(document.getElementById("stakeInput").value || 0));

  if(!state.selected.length){
    toast("Velg odds først.");
    return false;
  }

  if(stake < 10){
    toast("Minimum innsats er 10 coins.");
    return false;
  }

  if(stake > state.user.coins){
    toast("Du har ikke nok VM Coins.");
    return false;
  }

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
  toast("Spill plassert!");
  return true;
}

export function addMatch(state, event){
  event.preventDefault();
  const form = new FormData(event.target);

  state.matches.unshift({
    id: `m${Date.now()}`,
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

  state.activity.unshift({
    icon: "ball",
    text: `Ny kamp lagt inn: ${form.get("home")} – ${form.get("away")}`,
    time: "nå"
  });

  event.target.reset();
  toast("Kamp lagt til.");
}
