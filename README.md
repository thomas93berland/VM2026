# VM Lounge 2026 – regler oppdatert

Denne versjonen har reglene du spesifiserte:

- Startsaldo: **5 000 VM Coins**
- Maks innsats per kamp: **500 VM Coins**
- Vinnprosent: **vunne spill / ferdige spill**
- Leaderboard sorteres etter: **VM Coins**
- Admin: **kun Thomas kan legge inn resultater**

## Struktur

```text
index.html
css/
  style.css
js/
  app.js
README.md
```

## Viktig

Dette er fortsatt en lokal/demo-versjon som bruker `localStorage`.

For at alle venner skal se samme:
- leaderboard
- saldo
- bets
- chat
- forum
- resultater

må neste steg være Firebase Authentication + Firestore.


## Gjennomgang

Denne versjonen er gjennomgått og fikset for admin/resultat-panelet, maks innsats, leaderboard og knapper.
