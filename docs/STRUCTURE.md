# VM2026 strukturplan

Denne filen er første trygge steg i oppryddingen. Den endrer ikke nettsiden og skal brukes som sjekkliste før vi flytter eller sletter noe.

## Viktigste regel

Ikke flytt eller slett runtime-filer før login er bekreftet stabil. Alt som lastes på forsiden må testes ekstra nøye, fordi ett feil script kan låse innloggingssiden på mobil.

## Nåværende hovedstruktur

```text
/
├── index.html                  # Hovedappen / GitHub Pages entry
├── play.html                   # Sjakkrom
├── auth-test.html              # Testside for innlogging
├── css/
│   ├── style.css               # Hoveddesign
│   └── auth-emergency-fix.css  # Login-fiks
├── js/
│   ├── app.js                  # Hovedlogikk: auth, sider, bets, forum, admin
│   ├── firebase-config.js      # Firebase config + ekstra script-loader
│   ├── *                       # Mange små patch-/feature-script
├── functions/                  # Firebase Cloud Functions
├── assets/                     # Bilder/ressurser
├── firestore.rules             # Firestore-regler
├── firebase.json               # Firebase deploy-konfig
└── .firebaserc                 # Firebase prosjekt-alias
```

## Problem vi skal rydde opp i

1. For mange små patch-script lastes direkte fra `firebase-config.js`.
2. Noen scripts kjører på alle sider, selv om de bare trengs på Home, Profil eller Betting.
3. Det gjør siden sårbar: feil i ett tillegg kan fryse login eller hele appen.
4. Flere design-fikser og funksjons-fikser ligger blandet sammen.
5. Navnene forteller ikke alltid om scriptet er kritisk, midlertidig eller trygt å fjerne.

## Foreslått ryddestruktur

Dette er målet etter opprydding:

```text
js/
├── core/
│   ├── app.js                  # Hovedapp
│   ├── firebase-config.js      # Kun config, ikke masse feature-loading
│   └── boot.js                 # Trygg loader etter innlogging
├── features/
│   ├── home/
│   │   ├── live-match.js
│   │   ├── hero-message.js
│   │   └── recent-bets.js
│   ├── betting/
│   │   ├── betting-guard.js
│   │   └── active-bets-coupon.js
│   ├── profile/
│   │   ├── profile-photos.js
│   │   ├── profile-rank.js
│   │   └── public-profiles.js
│   ├── admin/
│   │   ├── admin-users.js
│   │   └── gambling-elo-settlement.js
│   └── chess/
│       ├── chess-room-polish.js
│       └── chess-room-image.js
├── ui/
│   ├── bottom-nav-icons.js
│   ├── compact-match-cards.js
│   └── bigger-flags.js
└── disabled/
    └── gamle/ustabile scripts
```

## Trygg rekkefølge

### Steg 1: Dokumenter struktur
Status: gjort med denne filen.

### Steg 2: Stabiliser login
Ingen nye scripts skal starte før Firebase Auth og login er verifisert.

### Steg 3: Lag trygg script-loader
En ny loader skal sjekke hvilken side brukeren er på før den starter feature-script.

### Steg 4: Flytt Home-script
Flytte kun Home-relaterte scripts først, uten å endre funksjon.

### Steg 5: Test Home
Sjekk: innlogging, meny, live-match, toppliste, nylig aktivitet.

### Steg 6: Flytt Profil-script
Flytte profilbilde/rank/offentlige profiler. Ikke aktivere ny premium layout før vanlig profil virker.

### Steg 7: Test Profil
Sjekk: profil åpnes, bilde kan lastes opp, navn kan endres, leaderboard-profil åpnes.

### Steg 8: Flytt Betting-script
Sjekk: oddsvalg, bet slip, tøm slip, plasser spill, mine spill.

### Steg 9: Rydd vekk døde scripts
Kun etter at alt fungerer og vi vet hvilke filer som ikke lenger lastes.

## Scripts som må behandles forsiktig

Disse har tidligere påvirket login eller global sidevisning:

```text
admin-mode-toggle.js
premium-profile-layout.js
home-live-admin-result.js
```

De skal ikke lastes globalt igjen før de er skrevet om tryggere.

## Sjekkliste før hver commit

- Login-siden må kunne trykkes på.
- Register-skjema må kunne bytte fra login-tab.
- Ingen script skal kjøre evig med tunge MutationObservers på hele siden uten grunn.
- Ingen ny fil skal lastes globalt hvis den bare trengs på én side.
- Cache-versjon må bumpes når en runtime-fil endres.
- Én endring om gangen.

## Neste anbefalte endring

Neste trygge steg er å lage en ny `js/core/boot.js` som kun starter feature-script etter at appen er lastet, og som ikke påvirker login-skjermen.
