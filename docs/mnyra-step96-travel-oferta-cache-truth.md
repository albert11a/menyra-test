Status: CURRENT
Last updated: 2026-06-20

# Schritt 96 - Travel Oferta Cache Truth

## Ziel

Travel `Ofertat` soll beim Refresh genauso stabil wirken wie Restaurants:
letzte bekannte Offers sollen direkt aus dem Restaurant-Cache verfuegbar sein,
statt kurz durch rohe Restaurantdaten ohne `public/offers` ersetzt zu werden.

## Ursache

Restaurants erscheinen sofort, weil ihre Kern-Daten direkt in
`cacheKeys.restaurants` liegen. Oferta-Daten kommen aber aus
`restaurants/{id}/public/offers` und werden erst ueber
`enrichRestaurantsWithPublicMeta()` in Restaurantdatensaetze gemerged. Der
Cache-Pfad konnte rohe Restaurantdaten ohne bekannte Offer-Wahrheit als
vollstaendig betrachten oder kurz in den Cache schreiben.

## Geaendert

- Travel-Businesses ohne bekannte Offer-Wahrheit gelten jetzt als
  cache-unvollstaendig.
- Bekannte Offer-Wahrheit bedeutet: `offersTruthState`, `publicOffers`,
  `travelOffers`, Offer-Count oder `hasTravelOffers` ist vorhanden.
- Der Netzwerk-Load schreibt rohe Restaurantdaten nicht mehr direkt in den
  Restaurant-Cache, bevor `public/offers` gemerged wurde.
- Der Restaurant-Cache wird nach `enrichRestaurantsWithPublicMeta()` mit der
  angereicherten Wahrheit inklusive Offer-Status geschrieben.
- Der App-Build-Token wurde aktualisiert.
- Die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung an Offer-Datenstruktur, Editor, Save-Pfad oder Firebase.
- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Rules oder Functions.
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
- Die letzte bekannte Oferta soll direkt sichtbar bleiben oder kurz
  `Daten werden geladen ...` zeigen, aber nicht `Noch keine Angebote`.
- Nach erfolgreicher Offer-Hydration sollen die Oferta-Cards unveraendert
  sichtbar sein.
- Einen echten Zustand ohne Offers pruefen: `Noch keine Angebote` darf erst
  nach abgeschlossener Offer-Wahrheit erscheinen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Der sichtbare Refresh-Ablauf muss im lokalen Dev-Setup manuell
gegengeprueft werden.
