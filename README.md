# VM Lounge 2026 – Firebase live-versjon

Denne versjonen er koblet til Firebase-prosjektet ditt:

- Prosjekt: `the-club-17c87`
- Innlogging: Firebase Authentication
- Database: Firestore
- Felles leaderboard
- Felles kamper
- Felles betting
- Felles forum
- Felles chat
- Adminpanel for kamp/resultat

## Regler i appen

- Startsaldo: **5 000 VM Coins**
- Maks innsats per kamp: **500 VM Coins**
- Vinnprosent: **vunne spill / ferdige spill**
- Leaderboard sorteres etter: **VM Coins**
- Kun admin kan legge inn kamper og resultater

## Filstruktur

```text
index.html
css/
  style.css
js/
  firebase-config.js
  app.js
firestore.rules
README.md
```

## Før du laster opp

I Firebase Console må du gjøre dette:

### 1. Aktiver innlogging

Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

### 2. Opprett Firestore

Firebase Console → Firestore Database → Create database.

Start gjerne i test mode først mens du setter opp, men bytt til reglene under når appen fungerer.

### 3. Publiser Firestore Rules

Kopier innholdet fra `firestore.rules` inn i Firebase Console → Firestore Database → Rules.

### 4. Gjør Thomas til admin

1. Last opp siden til GitHub Pages.
2. Registrer brukeren din på siden.
3. Gå til Firebase Console → Firestore Database → `users`.
4. Åpne dokumentet som ble laget for brukeren din.
5. Endre feltet:

```text
isAdmin: true
```

Da får du tilgang til adminpanelet for å legge inn kamper og resultater.

## GitHub Pages

Last opp disse filene rett i root på repoet:

```text
index.html
css/
js/
firestore.rules
README.md
```

Viktig: `index.html` må ligge rett i root, ikke inni en ekstra mappe.

## Viktig om sikkerhet

Dette er en god Firebase-versjon for vennekonkurranse, men fordi appen kjører i nettleseren kan svært tekniske brukere forsøke å manipulere data hvis reglene åpner for det. For helt låst anti-cheat bør neste steg være Cloud Functions, slik at betting og resultatberegning skjer på serveren.
