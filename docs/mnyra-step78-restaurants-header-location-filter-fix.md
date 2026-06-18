Status: CURRENT
Last updated: 2026-06-17

# Schritt 78 - Restaurants Header Location Filter Fix

## Ziel

Der nach Schritt 77 sichtbare Restaurant-Header-Location-Einstieg soll wirklich
wie im Feed den gesetzten Standort anzeigen: rechts mit Haken statt neutralem
Crosshair. Gleichzeitig soll der Restaurant-/Cafe-Filter nicht mehr ueber Namen
oder Beschreibung matchen, sondern nur ueber echte Standortdaten.

## Geaendert

- `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - Der bestehende Feed-Location-DOM-Sync laeuft jetzt auch fuer das identische
    Header-Location-Feld, wenn es ausserhalb des Feed-Views im DOM steht.
  - Dadurch wechselt das rechte Location-Icon im Restaurant-Header auf den
    vorhandenen Feed-Haken/Success-Zustand.
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Restaurant-/Cafe-Location-Matching nutzt jetzt nur noch echte Standortfelder
    wie `city`, `address`, `location`, `locations[]`, `region`, `district` und
    Koordinaten.
  - Name, Restaurantname, Businessname, Description, Bio und About werden fuer
    Restaurant-Location-Filter bewusst nicht mehr als Trefferquelle verwendet.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung am sichtbaren Layout des Header-Location-Felds.
- Keine Aenderung an Feed-Location-Wahrheit oder Storage-Key.
- Keine Aenderung an Restaurant-Cards, Gate, QR, Cart, Order, Travel, Firebase
  Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist auf die zwei gemeldeten Fehler begrenzt: Header-Haken und zu breite
Restaurant-Filterung. Rest-Risiko liegt in echten Daten, bei denen Standortdaten
fehlen oder falsch gepflegt sind.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,997 Bytes raw / 285,000 Bytes gzip.
- Kleiner Node-Import-Test:
  `Prishtina Cafe` mit `city: Prishtina` bleibt sichtbar,
  `Peja Cafe` mit `city: Peja` wird ausgefiltert,
  `Prishtina Name Only` mit `city: Peja` wird ausgefiltert.

## Manuelle Testliste

- Feed-Location auf `Prishtina` setzen und `Restaurants` oeffnen.
- Pruefen, dass rechts im Header-Location-Feld der Haken erscheint.
- `Prishtina` im Header bestaetigen und pruefen, dass nur passende
  Prishtina-Restaurants/-Cafes erscheinen.
- Eine andere Stadt waehlen und pruefen, dass die Liste sichtbar anders
  gefiltert wird.
- Kurz pruefen, dass das Feed-Location-Feld im Feed weiterhin normal arbeitet.
