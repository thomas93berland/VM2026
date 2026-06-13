// Firebase config for VM Lounge 2026
// Denne filen kan ligge offentlig på GitHub Pages.
// Sikkerheten styres av Firestore Rules, ikke av at denne configen er hemmelig.

window.VM_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAXZYU6o6IY-cunLHfwtcsS5F0LB_4Cyt0",
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

(function loadHomeImageAdminScript(){
  if (document.getElementById('homeImageAdminScript')) return;
  var s = document.createElement('script');
  s.id = 'homeImageAdminScript';
  s.src = 'js/home-image.js?v=1';
  s.defer = true;
  document.head.appendChild(s);
})();
