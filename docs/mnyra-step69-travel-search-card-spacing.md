Status: CURRENT
Last updated: 2026-06-15

# Schritt 69 - Travel Search Card Spacing

## Ziel

Die Travel-Eingabecard fuer das Reiseziel soll im blauen Bereich stimmiger
stehen:

- Der Abstand der Card nach oben zum Smart-Header soll dem sichtbaren Abstand
  nach unten zum `travelBenko`-Bereich entsprechen.
- Die Headline `Schreibe dein Reiseziel` soll kleiner werden.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Das Top-Padding der blauen Travel-Suchflaeche wurde von `2.65rem` auf
    `4.6rem` erhoeht.
  - Die Headline `Schreibe dein Reiseziel` wurde von `text-xl` auf `text-lg`
    reduziert.
- Social-Bundle wurde neu gebaut, damit der aktualisierte Marketplace-Lazy-Chunk
  ausgeliefert wird.

## Bewusst Nicht Geaendert

- Keine Aenderung an Travel-Suche, Vorschlaegen, Filterlogik oder Map-Logik.
- Keine Aenderung an Card-Inhalten, Datenquellen, Sortierung oder Profil-Oeffnung.
- Keine Aenderung an `social-app.js`.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules oder Functions.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist ein reiner sichtbarer Travel-Feinschliff im bestehenden
Marketplace-Lazy-Renderer. Rest-Risiko liegt nur in der manuellen
Sichtpruefung, ob die neue vertikale Position auf echten Viewports passt.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- Direkter Node-Render-Check:
  `padding:4.6rem 1.5rem 6.35rem` und `text-lg` fuer
  `Schreibe dein Reiseziel` sind vorhanden; die alten Werte sind nicht mehr
  gerendert.
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- `Travel` oeffnen.
- Pruefen, dass die Reiseziel-Card oben zum Header und unten zum Benko-Bereich
  gleichmaessiger wirkt.
- Pruefen, dass `Schreibe dein Reiseziel` kleiner wirkt.
- Reiseziel eintippen und sicherstellen, dass Vorschlaege und Suche weiter
  funktionieren.
