import { formatNumber, escapeHtml } from "./helpers.js";
import { injectIcons } from "../icons.js";

export function renderHome(state){
  renderStats(state);
  renderActivity(state);
}

function renderStats(state){
  const stats = [
    { icon: "cup", label: "Plasserte spill", value: state.user.placedBets },
    { icon: "win", label: "Vunnede spill", value: state.user.wonBets },
    { icon: "trend", label: "Treffprosent", value: state.user.hitRate },
    { icon: "medal", label: "Rangering", value: state.user.rank },
    { icon: "coins", label: "Netto gevinst", value: formatNumber(state.user.netProfit), className: "profit" }
  ];

  document.getElementById("homeStats").innerHTML = stats.map(stat => `
    <div class="stat ${stat.className || ""}">
      <span class="nav-icon gold" data-icon="${stat.icon}"></span>
      <small>${escapeHtml(stat.label)}</small>
      <strong>${escapeHtml(stat.value)}</strong>
    </div>
  `).join("");

  injectIcons(document.getElementById("homeStats"));
}

function renderActivity(state){
  document.getElementById("homeActivity").innerHTML = state.activity.slice(0, 3).map(item => `
    <div class="activity">
      <span class="nav-icon gold" data-icon="${item.icon}"></span>
      <p>${escapeHtml(item.text)}</p>
      <time>${escapeHtml(item.time)}</time>
    </div>
  `).join("");

  injectIcons(document.getElementById("homeActivity"));
}
