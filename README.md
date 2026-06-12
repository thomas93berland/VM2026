# VM Lounge 2026 – fixed buttons

Denne versjonen bruker vanlig JavaScript uten ES module-importer.
Det gjør at knappene fungerer både på GitHub Pages og når du åpner `index.html` direkte for testing.

## Struktur

```text
index.html
css/
  style.css
js/
  app.js
README.md
```

## Bruk

Last opp `index.html`, `css/` og `js/` direkte i root på GitHub-repoet.
Ikke legg filene inni en ekstra mappe.


## Nytt i denne versjonen

- Leaderboard på Home page
- Leaderboard oppdaterer rangering etter VM Coins
- Din bruker markeres i topplisten


## Endringer i denne versjonen

- Øverste Home-kort er kortere.
- Hero-kortet viser kun:
  - VM 2026
  - Betting med venner
  - Se kamper
  - Leaderboard
- Leaderboard på Home page med:
  - plassering/rank
  - brukernavn
  - VM Coins
  - vinn prosent
  - antall spill
  - markering av deg
  - sortering etter VM Coins
  - knapp for Se hele leaderboardet


## Leaderboard-side

Denne versjonen har en egen Leaderboard-side.

- Hero-knappen "Leaderboard" går til Leaderboard-siden.
- Knappen "Se hele leaderboardet" går til Leaderboard-siden.
- Menyen har egen Leaderboard-knapp.
- Leaderboard viser rank, brukernavn, VM Coins, vinn prosent, antall spill og markerer deg.
- Listen sorteres etter VM Coins.
