Status: CURRENT
Last updated: 2026-06-17

# Schritt 75 - Restaurants Card UI Parity

## Ziel

Die normale Restaurant-/Cafe-List-Card im Tab `Restaurants` soll visuell enger
an die vom Nutzer gelieferte Card-Vorlage angepasst werden. Die oberen
Swipe-/Best-Cards bleiben ausserhalb dieses Schritts.

## Geaendert

- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
  - Restaurant-List-Card auf `max-w-[340px]` zentriert.
  - Quick-Action-Buttons fuer Favorit/Teilen oben rechts im Titelbild ergaenzt.
  - Preis-Tag unten rechts im Titelbild wie in der Vorlage sichtbar gemacht.
  - Bewertungszeile, Sternfarben, Headline-Tag und Gastgarten-Default enger an
    die Nutzer-Vorlage angepasst.
  - Fehlende statische Tailwind-Utilities aus der Nutzer-Vorlage fuer diese
    Card mit lokalen Inline-Werten abgesichert. Das betrifft insbesondere
    Card-Breite, 28px-Radius, Profilbildposition, 76px-Logo, 3.5er
    Positionswerte und den Bild-zu-Weiss-Gradienten.
  - Button-Klassen fuer `Profil` und `Menu` an die Vorlage angeglichen.
- `apps/menyra-social/bundled/**`
  - Social-Bundle nachgezogen, inklusive neuem Marketplace-Chunk-Hash.

## Bewusst Nicht Geaendert

- Keine Aenderung an den oberen Swipe-/Best-Cards im Restaurants-Tab.
- Keine Aenderung an Lead-Speicherung, Lead-Feldern oder Heart-Editor.
- Keine Aenderung an Profil/Menu-Open-Flow.
- Keine Aenderung an Routing, QR, Cart, Order, Travel, Firebase Rules oder
  Functions.
- Kein Smoke-/Playwright-Lauf durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist eine gezielte visuelle Korrektur der normalen Restaurant-
List-Card. Rest-Risiko liegt in der manuellen Sichtpruefung echter Daten auf
mobilen Breiten.

Wichtigster Befund: Die App laedt `tailwind.generated.css` statisch. Mehrere
Klassen aus der gelieferten React-Vorlage existierten dort nicht, unter anderem
`max-w-[340px]`, `rounded-[28px]`, `w-[76px]`, `h-[76px]`, `top-3.5`,
`right-3.5`, `bottom-3.5`, `pt-12`, `-top-10`, `left-5`, `from-white`,
`via-white/20`, `to-black/20` und `bg-slate-900/90`. Dadurch konnte die UI
vorher trotz passender HTML-Struktur nicht exakt wie die Vorlage aussehen.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
  - Ergebnis: `social-app.js` 1,049,995 Bytes raw / 284,998 Bytes gzip.

## Manuelle Testliste

- Tab `Restaurants` oeffnen und eine normale Restaurant-/Cafe-Card pruefen.
- Pruefen, dass die Card auf ca. 340px Breite zentriert ist.
- Pruefen, dass Quick-Actions oben rechts und Preis-Tag unten rechts im
  Titelbild sichtbar sind.
- Pruefen, dass `Profil` weiterhin das Profil oeffnet.
- Pruefen, dass `Menu` weiterhin direkt den Menu-Tab oeffnet.
- Pruefen, dass die oberen Swipe-/Best-Cards unveraendert aussehen.
