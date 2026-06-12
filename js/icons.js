export const ICONS = {
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

export function injectIcons(scope = document){
  scope.querySelectorAll("[data-icon]").forEach(el => {
    const name = el.dataset.icon;
    if(ICONS[name]) el.innerHTML = ICONS[name];
  });
}
