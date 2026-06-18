Status: CURRENT
Last updated: 2026-06-17

# Schritt 79 - Restaurants Location Complete Filter

## Ziel

Der Restaurant-Tab soll bei gesetzter Feed-/Header-Location alle passenden
Restaurants und Cafes dieser Location anzeigen. Beispiel: `Prishtina` zeigt
Prishtina-Restaurants/-Cafes, `Ferizaj` zeigt Ferizaj-Restaurants/-Cafes.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Restaurant-/Cafe-Location-Matching nutzt jetzt zusaetzliche echte
    Standortfelder wie `postalCity`, `formattedAddress`, `fullAddress`,
    `streetAddress`, `locationLabel`, `municipality`, `locality`, `area`,
    `state`, `province` sowie verschachtelte Location-Objekte.
  - Location-Aliase fuer Kosovo-Staedte wurden fuer Restaurant-/Cafe-Filter
    ergaenzt, unter anderem `Prishtina/Prishtine` und `Ferizaj`.
  - Koordinaten werden aus mehr Feldformen gelesen, damit Eintraege ohne
    Stadttext, aber mit Standortkoordinaten, in der passenden Stadt erscheinen.
  - Cafe-Typen wie `coffee_shop`, `coffeeshop` und `caffe` werden als Cafe
    erkannt.
  - Bei aktiver Location wird die Restaurant-/Cafe-Liste nicht mehr auf 24
    Eintraege begrenzt. Ohne Location bleibt das alte Limit bestehen.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen.

## Bewusst Nicht Geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Aenderung am Header-Location-Feld selbst.
- Keine Aenderung an Feed-Location-Storage oder Feed-Filterlogik.
- Keine Aenderung an QR, Cart, Order, Travel, Firebase Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist auf Restaurant-/Cafe-Location-Filterung begrenzt. Rest-Risiko
bleibt bei echten Daten, deren Standort weder als Textfeld noch als verwertbare
Koordinate gepflegt ist.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Kleiner Node-Import-Test:
  - `Prishtina` zeigt auch Treffer ueber der alten 24er-Grenze.
  - Prishtina-Koordinaten-Treffer werden angezeigt.
  - `Peja Cafe` wird bei Prishtina ausgefiltert.
  - `Prishtina Name Only` mit `city: Peja` wird ausgefiltert.
  - `Ferizaj` findet ein Cafe mit verschachteltem `location.city`.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,997 Bytes raw / 284,999 Bytes gzip.

## Manuelle Testliste

- Feed-/Header-Location auf `Prishtina` setzen und Restaurant-Tab oeffnen.
- Pruefen, dass nur Prishtina-Restaurants/-Cafes erscheinen und nicht Peja/
  Ferizaj.
- Location auf `Ferizaj` aendern und pruefen, dass die Liste auf Ferizaj-
  Restaurants/-Cafes wechselt.
- Eine weitere Stadt wie `Peja` oder `Gjilan` testen.
- Kurz pruefen, dass der Haken im Header-Location-Feld weiterhin sichtbar ist.
