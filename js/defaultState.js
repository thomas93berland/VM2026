export const defaultState = {
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
