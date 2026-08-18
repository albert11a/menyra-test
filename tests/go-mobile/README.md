Status: CURRENT
Last updated: 2026-08-18

# Mnyra GO auf dem Telefon - Testsuite

Diese Suite geht den Weg eines Gastes und den Weg eines Wirts auf
Telefonbildschirmen ab und prueft dabei nicht nur, was auf dem Schirm steht,
sondern auch, was in Firestore entsteht: eine Buchung, nicht zwei; ein Posten
im Hauptbuch, nicht keiner.

Der zugehoerige Bericht liegt in
`docs/go/GO_MOBILE_TESTBERICHT_2026-08-18.md`.

## Voraussetzungen

Alles laeuft lokal. Keine Produktionsdaten, kein Deploy.

```bash
npm install
npm run emulators:start                 # Auth, Firestore, Functions (mnyra-local)
npm run emulators:seed                  # Grunddaten
node tests/go-mobile/seed-go-fixture.mjs  # GO-Testlokal, Oferten, Wirtskonto
npm run dev                             # http://127.0.0.1:5173
```

`seed-go-fixture.mjs` legt an:

- Lokal `bro-pizza` ("Bro Pizza", Prishtina) mit drei aktiven GO-Oferten,
- ein zweites Lokal `bro-pizza-prizren` in Prizren - es beantwortet die
  Frage, ob ein Gast Angebote aus einer fremden Stadt bekommt,
- das Konto des Wirts `bropizza@mnyra.com`.

**Achtung:** `npm run test:rules` raeumt denselben Firestore-Emulator leer
(`@firebase/rules-unit-testing` ruft `clearFirestore()`). Waehrend die
Mobil-Suite laeuft, darf das nicht daneben laufen - sonst verschwinden Lokal
und Oferten mitten im Durchgang. Nach einem Rules-Lauf einfach neu saeen:

```bash
npm run emulators:seed && node tests/go-mobile/seed-go-fixture.mjs
```

## Laufen lassen

```bash
MNYRA_E2E_BASE_URL=http://127.0.0.1:5173 \
  npx playwright test --config tests/go-mobile/playwright.config.ts

# nur ein Geraet
  ... --project=iphone-13
# nur ein Fall
  ... --grep "Doppeltipp"
```

Geraete: `iphone-13`, `iphone-se`, `iphone-17-pro-max`, `galaxy-s24`
(mit Samsung-Internet-Kennung), `galaxy-s9-plus`.

**Wichtig:** Es laeuft alles auf Chromium. Die iPhone-Projekte bilden
Bildschirm, Touch und Kennung nach - **nicht** WebKit. Was an der Engine
haengt (Wisch-Geste, Tastatur, sichere Bereiche, Sieben-Tage-Speicher),
gehoert auf ein echtes Geraet; die Liste steht im Bericht, Abschnitt 7.

## Was die Faelle pruefen

Gast (`go-mobile.spec.ts`):

- der ganze Weg vom Suchen bis zum Code,
- die Stadt vom Eingang, die gewaehlte Gruppengroesse, die Entfernung,
- Doppeltipp, Netzabbruch, ausverkauftes Angebot,
- privater Modus ohne `localStorage`,
- Fingerziele, Schriftgroessen, waagrechtes Rutschen,
- Zurueck-Taste, Lage der Wisch-Bahn, Erreichbarkeit des Streifens.

Lokal (`go-business-mobile.spec.ts`):

- Code eintippen, bestaetigen, Gebuehr im Hauptbuch,
- derselbe Code ein zweites Mal,
- die Zahlen auf der Panel-Karte,
- dieselben Zahlen auf einem Telefon mit anderer Zeitzone.

Faelle, die einen offenen Befund nachweisen, schlagen absichtlich fehl,
solange der Befund offen ist - die Fehlermeldung nennt ihn im Klartext.
