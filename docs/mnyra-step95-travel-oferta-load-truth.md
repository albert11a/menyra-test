Status: CURRENT
Last updated: 2026-06-20

# Schritt 95 - Travel Oferta Load Truth

## Ziel

Beim Refresh darf Travel `Ofertat` nicht kurz `Noch keine Angebote` zeigen,
wenn Offers innerhalb der naechsten Sekunde aus dem Restaurant-Load oder
`public/offers`-Meta-Reconcile nachkommen.

## Ursache

`dataLoaded.restaurants` wird im Tab-Load-Pfad frueh auf `true` gesetzt, damit
der Restaurant-Load nicht mehrfach gestartet wird. Dieses Flag bedeutet also
`Load wurde angestossen`, nicht `Restaurant- und Offer-Wahrheit ist fertig`.
Darum konnte der Oferta-Renderer trotz laufender Offer-Hydration schon den
Empty-State zeigen.

## Geaendert

- Der Tab-Load-Pfad markiert Restaurantdaten jetzt mit `state.__restaurantsLoading`.
- `loadRestaurants()` setzt den Load-Status aktiv und deaktiviert ihn erst nach
  Netzwerk-Load plus `enrichRestaurantsWithPublicMeta()` fuer `public/offers`.
- Die initiale Cache-/Meta-Hydration nutzt zusaetzlich
  `state.__restaurantsMetaHydrating`.
- Der `Ofertat`-Renderer zeigt waehrend dieser aktiven Lade-/Hydrationsphasen
  `Daten werden geladen ...` statt `Noch keine Angebote`, solange noch keine
  echten Offer-Records sichtbar sind.
- Der App-Build-Token wurde aktualisiert.
- Die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung an Offer-Datenstruktur, Editor, Save-Pfad oder Firebase.
- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Aenderung an QR, Cart, Order, Routing, Rules oder Functions.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/auth/tab-auth-load-utils.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-CBKWjXhe.js`
- `git diff --check`

## Manuelle Testliste

- App refreshen und direkt Travel `Ofertat` beobachten.
- Es darf nicht kurz `Noch keine Angebote` erscheinen, wenn Offers danach
  geladen werden.
- Waehrend laufender Daten-/Offer-Hydration soll `Daten werden geladen ...`
  sichtbar sein.
- Nach dem Laden sollen die Oferta-Cards normal erscheinen.
- Einen echten Zustand ohne Offers pruefen: `Noch keine Angebote` darf erst
  nach abgeschlossenem Load erscheinen.
- `Hotels`-Tab kurz pruefen, dass normale Hotel-Cards unveraendert bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Der sichtbare Refresh-Ablauf muss im lokalen Dev-Setup manuell
gegengeprueft werden.
