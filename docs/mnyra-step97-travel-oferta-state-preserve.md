Status: CURRENT
Last updated: 2026-06-20

# Schritt 97 - Travel Oferta State Preserve

## Ziel

Travel `Ofertat` soll beim Refresh nicht mehr kurz von sichtbaren Oferta-Cards
auf `Daten werden geladen ...` springen, wenn bereits gecachte Offers im State
bekannt sind.

## Ursache

Nach Schritt 96 wurde der Cache korrekt geschuetzt, aber der Live-State wurde
weiterhin beim Netzwerk-Reload kurz mit rohen `restaurants`-Dokumenten ersetzt.
Diese Rohdaten enthalten fuer Hotels/Motels oft noch keine `publicOffers`,
`travelOffers` oder `offerItems`. Dadurch verschwanden die sichtbaren Oferta-
Records kurz aus `state.restaurants`, bis `public/offers` erneut gemerged war.

## Geaendert

- Beim Anwenden neuer Restaurantdaten wird pro Restaurant die vorherige
  bekannte Offer-Payload aus `state.restaurants` gemerkt.
- Wenn ein Travel-Business im eingehenden Datensatz keine Offer-Liste hat,
  werden die vorherigen `publicOffers`, `travelOffers`, `offerItems`,
  Offer-Counts, `hasTravelOffers` und `offersTruthState` im Live-State
  beibehalten.
- Eingehende echte Offer-Listen gewinnen weiterhin. Das gilt auch fuer leere
  Listen aus `public/offers`, damit geloeschte Offers nach der Hydration korrekt
  verschwinden.
- Der App-Build-Token wurde aktualisiert.

## Bewusst Nicht Geaendert

- Keine UI-/Design-Aenderung an der Oferta-Card.
- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Aenderung am Editor, Save-Pfad, Firebase, QR, Cart, Order, Routing,
  Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CBKWjXhe.js`
- `git diff --check`

## Manuelle Testliste

- App einmal laden, bis Oferta-Cards sichtbar sind.
- Danach refreshen und Travel `Ofertat` beobachten.
- Wenn gecachte Oferta-Cards bereits sichtbar sind, sollen sie sichtbar bleiben
  und nicht kurz durch `Daten werden geladen ...` ersetzt werden.
- `Daten werden geladen ...` ist nur okay, bevor ueberhaupt bekannte Offers aus
  Cache oder Hydration sichtbar sind.
- Eine Oferta deaktivieren oder loeschen und nach abgeschlossener Hydration
  pruefen, dass sie korrekt verschwindet.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Der sichtbare Refresh-Ablauf muss im lokalen Dev-Setup manuell
gegengeprueft werden.
