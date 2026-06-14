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

(function loadExtraScripts(){
  function load(id, src) {
    if (document.getElementById(id)) return;
    var s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.defer = true;
    document.head.appendChild(s);
  }
  load('homeImageAdminScript', 'js/home-image.js?v=2');
  load('adminUsersScript', 'js/admin-users.js?v=1');
  load('chatFixScript', 'js/chat-fix.js?v=1');
  load('leaderboardCleanScript', 'js/leaderboard-clean.js?v=1');
  load('bottomNavCleanScript', 'js/bottom-nav-clean.js?v=1');
  load('gamblingRatingRenameScript', 'js/rename-gambling-rating.js?v=1');
  load('bettingGuardScript', 'js/betting-guard.js?v=1');
  load('bottomNavIconsScript', 'js/bottom-nav-icons.js?v=2');
  load('vmMatchCardsScript', 'js/vm-match-cards.js?v=3');
  load('activeBetsCouponScript', 'js/active-bets-coupon.js?v=2');
  load('publicProfilesScript', 'js/public-profiles.js?v=1');
  load('profilePhotosScript', 'js/profile-photos.js?v=1');
  load('chessRoomImageScript', 'js/chess-room-image.js?v=1');
  load('chessRoomImageFixScript', 'js/chess-room-image-fix.js?v=1');
  load('homeLiveMatchScript', 'js/home-live-match.js?v=3');
  load('homeHeroMessageScript', 'js/home-hero-message.js?v=1');
  load('chessRoomPolishScript', 'js/chess-room-polish.js?v=1');
  load('homeScoreResultOverrideScript', 'js/home-score-result-override.js?v=1');
  load('friendsScript', 'js/friends.js?v=2');
  load('oddsButtonSizeScript', 'js/odds-button-size.js?v=1');
  load('compactMatchCardsScript', 'js/compact-match-cards.js?v=1');
  load('biggerFlagsScript', 'js/bigger-flags.js?v=3');
  load('moveClearSlipScript', 'js/move-clear-slip.js?v=1');
  load('gamblingEloSettlementScript', 'js/gambling-elo-settlement.js?v=2');
  load('profileRankInlineScript', 'js/profile-rank-inline.js?v=1');
  load('homeLiveScoreFixScript', 'js/home-live-score-fix.js?v=1');
  load('liveScoreApiScript', 'js/live-score-api.js?v=1');
  load('homeLiveCleanNamesScript', 'js/home-live-clean-names.js?v=1');
})();
