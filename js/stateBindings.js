import { formatNumber } from "./helpers.js";

export function bindText(state){
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
