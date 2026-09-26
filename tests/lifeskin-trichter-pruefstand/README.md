# Pruefstand fuer den Lifeskin-Trichter

Warum es diesen Ordner gibt: Der Trichter verliert zwischen dem ersten und
dem zweiten Bildschirm rund vier von fuenf Besuchern. Die Frage war, ob
daran ein Geraet, ein Browser oder eine Bildschirmgroesse schuld ist. Diese
Skripte beantworten sie mit Messungen statt mit Vermutungen.

Sie gehoeren NICHT in `npm test`: Sie starten Browser, laufen Minuten und
reden mit dem Netz. Sie werden von Hand gestartet, wenn jemand fragt.

## Was jedes Skript misst

| Skript | Frage |
|---|---|
| `lauf.mjs` | Steht auf jedem Geraet und in jeder Engine der Knopf da, wo der Daumen hinkommt - und geht es weiter? |
| `lauf-netz.mjs` | Wie lange steht der Bildschirm leer, wenn die Leitung schmal ist? Was passiert ohne Kamera, ohne Zaehlung, ohne JavaScript? |
| `lauf-zaehlung.mjs` | Wer landet ueberhaupt in der Stufe "Fillo skanimin"? Zaehlt eine Seite mit, die nie jemand gesehen hat? |
| `lauf-kompat.mjs` | Ab welchem Browser laeuft der Trichter - und ab welchem bleibt der Bildschirm leer? (statisch, ohne Browser) |
| `lauf-e2e.mjs` | Kommt jemand vom Scan bis zur ersten Frage? |
| `lauf-bytes.mjs` | Was laedt der erste Bildschirm herunter, bevor jemand getippt hat? |
| `lauf-wege.mjs` | ALLE Wege von A bis Z (25.09.): Scan, Foto, Trup/Pytje, gesperrte Kamera in Instagram/Facebook, Telefonkamera, zaehe Leitung, Zurueck-Taste, Warteseite → Therapie. Mit Kamera-Attrappe (echtes Gesicht) und Firestore im Speicher. |
| `lauf-heart.mjs` | Heart mit einigen tausend Faellen, Telefon-Tempo: Laden, Akte oeffnen (Springen?), Live-Zahl, Live-Reihe richtig?, zweiter Start. Braucht den lokalen Emulator (siehe unten). |
| `lauf-morph.mjs` | Das Abgleichen von Heart (heart-morph.js) liefert dasselbe wie innerHTML - im Browser geprueft. |

Hilfsdateien: `kamera-attrappe.mjs` (Gesichtsvideo fuer die erfundene Kamera),
`dist-server.mjs` (liefert den gebauten Stand `dist/` wie Vercel aus),
`heart-emulator-seed.mjs` (legt Lifeskin-Faelle im lokalen Emulator an).

### Heart gegen den lokalen Emulator

Nichts davon beruehrt die echte Datenbank: Heart laeuft mit
`?firebase-emulator=1` gegen den Emulator (Projekt `mnyra-local`), und die
Skripte weigern sich, ohne `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` zu laufen.

    node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --only firestore,auth --project mnyra-local
    npm run emulators:seed
    FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/heart-emulator-seed.mjs 4000
    node scripts/local-dev-server.mjs
    FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/lauf-heart.mjs

`CPU=4` (Standard) bremst die CPU vierfach, so rechnet ein Mittelklasse-Handy;
`PROFIL=1` schreibt je Schritt die teuersten Funktionen dazu.

Die Geraeteliste steht in `geraete.mjs` - eine Zeile je Geraet, Engine und
App-Fenster.

## Starten

Gegen den lokalen Server:

    node scripts/local-dev-server.mjs &
    node tests/lifeskin-trichter-pruefstand/lauf.mjs

Gegen die echte Seite:

    BASIS=https://www.mnyra.com LS_PFAD=/lifeskin LS_MARKE=live \
      node tests/lifeskin-trichter-pruefstand/lauf.mjs

Ein Wort als letztes Argument beschraenkt den Lauf auf die Geraete, deren
Name es enthaelt: `node tests/lifeskin-trichter-pruefstand/lauf.mjs Instagram`.

Ergebnisse (Befunde als JSON, Aufnahmen als PNG) landen unter
`test-results/lifeskin-trichter/` - der Ordner ist in `.gitignore`.

## Firestore wird abgefangen

Jeder Lauf faengt `firestore.googleapis.com` ab und beantwortet die Anfragen
selbst. KEIN Prueflauf schreibt in die echte Zaehlung - sonst haette der
Trichter danach Stufen, die niemand gegangen ist. Wer das aendert, verfaelscht
genau die Zahl, die hier untersucht werden soll.

## Browser

Chromium liegt in dieser Umgebung unter `/opt/pw-browsers/chromium`;
`MNYRA_E2E_CHROMIUM` stellt den Pfad um. WebKit und Firefox kommen aus
`npx playwright install webkit firefox`.

WebKit ist nicht optional: Auf jedem iPhone rendert diese Engine - auch in
Chrome, auch im Fenster von Facebook und Instagram.
