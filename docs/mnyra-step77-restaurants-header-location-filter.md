Status: CURRENT
Last updated: 2026-06-17

# Schritt 77 - Restaurants Header Location Filter

## Ziel

Wenn im Feed oder Restaurant-Gate eine Location gesetzt wurde, soll im Tab
`Restaurants` oben im Smart-Header dasselbe Location-Eingabefeld wie im Feed
sichtbar sein. Aendert der Nutzer dort die Location, soll der Restaurant-Tab
direkt neu rendern und Restaurant-/Cafe-Cards passend zu dieser Location zeigen.

## Geaendert

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - Das bestehende Feed-Header-Location-Feld wird jetzt auch im aktiven Tab
    `restaurants` angezeigt, wenn eine gespeicherte Feed-Location existiert.
  - Markup, IDs, Klassen, Button und Vorschlagscontainer bleiben identisch zum
    Feed-Header-Feld.
- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - Die bestehende Feed-Location-Delegation wird auch dann gebunden, wenn kein
    `feedView`, aber ein Feed-Location-Headerfeld vorhanden ist.
  - Location-Aenderungen im Restaurant-Tab speichern weiter dieselbe
    `mnyra_social_feed_viewer_location_v1`-Wahrheit und rendern den aktiven
    Restaurant-Tab danach direkt neu.
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Restaurants/Cafes werden bei gesetzter Location nach Stadt-/Adressfeldern,
    bekannten Schreibvarianten und vorhandenen Koordinaten gefiltert.
  - Beispiel: `Prishtina` matched auch Varianten wie `Prishtine` und zeigt nur
    dazu passende Restaurant-/Cafe-Profile.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung an QR, Cart, Order, Travel, Firebase Rules oder Functions.
- Keine Aenderung an den Restaurant-Cards selbst.
- Keine neue Restaurant-Suche neben dem bestehenden Feed-Location-Feld.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.
- Auf ausdruecklichen Nutzerwunsch wurde dieser Schritt direkt auf Branch
  `main` umgesetzt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt bleibt auf Header-Location-Paritaet und Location-Filterung im
Restaurants-Tab begrenzt. Rest-Risiko liegt in der manuellen Sichtpruefung mit
echten Restaurantdaten und echten GPS-Standorten.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,986 Bytes raw / 284,995 Bytes gzip.

## Manuelle Testliste

- Feed-Location auf `Prishtina` setzen und danach `Restaurants` oeffnen.
- Pruefen, dass im Smart-Header dasselbe Location-Eingabefeld wie im Feed
  sichtbar ist und `Prishtina` zeigt.
- Im Restaurant-Headerfeld eine andere Stadt waehlen und pruefen, dass der
  Restaurant-Tab ohne Gate neu rendert.
- Pruefen, dass bei `Prishtina` nur passende Restaurant-/Cafe-Cards fuer
  Prishtina oder nahe Koordinaten erscheinen.
- Ohne gespeicherte Location pruefen, dass weiterhin das bestehende
  Restaurant-Gate erscheint.
- Kurz pruefen, dass Feed-Location-Eingabe im Feed weiterhin funktioniert.
