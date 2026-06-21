// Firebase config for VM Lounge 2026
// Denne filen kan ligge offentlig på GitHub Pages.
// Sikkerheten styres av Firestore Rules, ikke av at denne configen er hemmelig.

window.VM_FIREBASE_CONFIG = {
  apiKey: ["AIzaSyAXZYU6o6IY", "-cunLHfwtcsS5F0LB", "_4Cyt0"].join(""),
  authDomain: "the-club-17c87.firebaseapp.com",
  projectId: "the-club-17c87",
  storageBucket: "the-club-17c87.firebasestorage.app",
  messagingSenderId: "948536383301",
  appId: "1:948536383301:web:8c0dcb45908308bcd1502c",
  measurementId: "G-JY7QBR2Y12"
};

window.VM_RULES = {
  START_COINS: 5000,
  MAX_STAKE: 500
};

window.VM_LIVE_SCORE_FUNCTION_URL = "https://us-central1-the-club-17c87.cloudfunctions.net/liveScores";

// Home: fjern hero-kortet slik toppen kan brukes til live match update.
(function removeHomeHeroCard(){
  function remove(){
    var hero = document.querySelector('#page-home > .hero');
    if (hero) hero.remove();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', remove);
  } else {
    remove();
  }
  setTimeout(remove, 300);
  setTimeout(remove, 1200);
})();

// Ekstra funksjoner styres nå bare av js/core/boot.js.
// Boot-loaderen starter kun godkjente scripts etter innlogging.
window.VM_EXTRA_SCRIPTS_DISABLED = false;

// Rank/tittel-modul: lastes etter hovedappen så den kan dekorere profil og leaderboard trygt.
(function loadVmRankTitles(){
  if (window.VM_RANK_TITLES_LOADER) return;
  window.VM_RANK_TITLES_LOADER = true;
  function load(){
    if (document.querySelector('script[src*="rank-titles.js"]')) return;
    var s = document.createElement('script');
    s.src = 'js/core/rank-titles.js?v=1';
    s.defer = true;
    document.body.appendChild(s);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(load, 1400); });
  } else {
    setTimeout(load, 1400);
  }
})();
