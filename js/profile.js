import { escapeHtml, formatNumber, toast } from "./helpers.js";
import { injectIcons } from "../icons.js";

export function renderProfile(state){
  renderProfileStats(state);
  renderMyBets(state);
}

function renderProfileStats(state){
  const stats = [
    { icon: "knight", label: "Sjakk ELO", value: state.user.elo },
    { icon: "coins", label: "VM Coins", value: formatNumber(state.user.coins) },
    { icon: "trend", label: "Treffprosent", value: state.user.hitRate },
    { icon: "medal", label: "Rangering", value: state.user.rank }
  ];

  const wrap = document.getElementById("profileStats");
  wrap.innerHTML = stats.map(stat => `
    <div class="stat">
      <span class="nav-icon gold" data-icon="${stat.icon}"></span>
      <small>${escapeHtml(stat.label)}</small>
      <strong>${escapeHtml(stat.value)}</strong>
    </div>
  `).join("");

  injectIcons(wrap);
}

function renderMyBets(state){
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

  injectIcons(wrap);
}

export function editName(state){
  const name = prompt("Nytt navn:", state.user.name);
  if(!name) return false;

  state.user.name = name.trim();
  toast("Navn oppdatert.");
  return true;
}
