Status: CURRENT
Last updated: 2026-06-20

# Schritt 94 - Travel Oferta Loading Guard

## Ziel

Der Travel-Tab `Ofertat` soll beim ersten Oeffnen nicht kurz `Noch keine
Angebote` zeigen, wenn die vollstaendigen Restaurant-/Travel-Daten noch laden
und Offers erst danach verfuegbar werden.

## Ursache

Die Travel-View durfte Content bereits anzeigen, wenn Bootstrap-/Cache-Preview-
Hotels vorhanden waren. Diese Preview-Daten koennen Hotel-/Motel-Daten liefern,
aber noch keine vollstaendigen `travelOffers`/`publicOffers`. Dadurch war
`Ofertat` kurz leer und nach dem async Restaurant-Load erschienen die Offers.

## Geaendert

- Der `Ofertat`-Tab prueft jetzt vor dem Empty-State, ob die vollstaendigen
  Restaurantdaten geladen sind.
- Wenn noch nicht geladen ist und in den sichtbaren Preview-Daten keine echten
  Offer-Records vorhanden sind, wird `Daten werden geladen ...` angezeigt.
- Erst nach `dataLoaded.restaurants === true` wird `Noch keine Angebote`
  angezeigt, wenn wirklich keine Offers existieren.
- Der App-Build-Token wurde aktualisiert.
- Die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung an Offer-Datenstruktur, Editor, Save-Pfad oder Firebase.
- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-BiOXvBwN.js`
- `git diff --check`

## Manuelle Testliste

- App frisch laden und Travel `Ofertat` direkt oeffnen.
- Pruefen, dass waehrend des Ladens `Daten werden geladen ...` statt `Noch keine
  Angebote` erscheint.
- Pruefen, dass die Oferta-Card nach dem Laden normal erscheint.
- Einen Zustand ohne Offers pruefen: erst nach abgeschlossenem Laden darf `Noch
  keine Angebote` sichtbar sein.
- `Hotels`-Tab kurz pruefen, dass normale Hotel-Cards unveraendert bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Der sichtbare Ladewechsel muss im lokalen Dev-Setup manuell
gegengeprueft werden.
