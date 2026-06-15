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

// Midlertidig trygg modus:
// Ekstra patch-/feature-script er slått av for å stabilisere innlogging først.
// Når login er bekreftet stabil, flytter vi scripts inn igjen ett og ett via en trygg loader.
window.VM_EXTRA_SCRIPTS_DISABLED = true;
