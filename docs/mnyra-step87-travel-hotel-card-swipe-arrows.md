Status: CURRENT
Last updated: 2026-06-18

# Schritt 87 - Travel Hotel Card Swipe And Arrow Fix

## Ziel

Die Hotel-/Motel-Card im Travel-Hotels-Tab soll ihren Titelbild-Slider normal
bedienbar zeigen: ein Pfeil links, ein Pfeil rechts, und Finger-Swipe soll auf
dem Handy leichter ausloesen.

## Geaendert

- Die Slider-Pfeile der Travel-Hotel-Card haben jetzt lokale Inline-Anker fuer
  linke und rechte Position, vertikale Zentrierung und z-Index.
- Die Hotel-Galerie setzt `touch-action: pan-y` lokal inline, damit horizontale
  Swipe-Gesten klarer beim Slider ankommen.
- Die Touch-Swipe-Erkennung ist toleranter: kuerzere horizontale Wischwege
  reichen aus, und das Finger-Ende wird direkt aus `changedTouches` gelesen.
- Vertikale Scroll-Gesten werden weiter geschuetzt, damit normales Scrollen
  nicht versehentlich das Hotelbild wechselt.
- Der App-Build-Token wurde angehoben, damit Browser und Service Worker den
  neuen Card-Stand nicht als alten Build behandeln.
- Auf ausdruecklichen Nutzerwunsch wurde dieser Schritt trotz Dauerregel auf
  Branch `main` umgesetzt.

## Bewusst Nicht Geaendert

- Keine Aenderung am Hotel-Editor oder an Hotel-Datenfeldern.
- Keine Aenderung an Profil-Open-Flow: `Mehr` oeffnet weiter direkt das Profil.
- Keine Aenderung an Restaurant-/Cafe-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Firebase Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `node --check apps\menyra-social\core\marketplace\travel-view-event-bindings.js`
- `npm run build`

## Manuelle Testliste

- Travel oeffnen und im Hotels-Tab eine Hotel-/Motel-Card mit mehreren
  Titelbildern anzeigen.
- Pruefen, dass der vorherige Bildpfeil links und der naechste Bildpfeil rechts
  mittig auf dem Titelbild sitzt.
- Links/rechts per Pfeil klicken und pruefen, dass Bild und Dots wechseln.
- Auf dem Handy das Titelbild leicht nach links/rechts wischen und pruefen,
  dass der Slider zuverlaessig wechselt.
- Vertikal ueber die Card scrollen und pruefen, dass der Slider nicht bei
  normalem Scrollen versehentlich wechselt.
- `Mehr` kurz gegenpruefen: Profil oeffnet weiter direkt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Die finale Swipe-Haptik muss auf einem echten Touch-Geraet manuell
gegengeprueft werden, weil Codex gemaess Projektregel keine Browser-/Smoke-
Tests ausfuehrt.
