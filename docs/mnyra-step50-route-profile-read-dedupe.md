Status: umgesetzt
Branch: `refactorapp`

# Mnyra Schritt 50 - Route/Profile Read-Dedupe

## Ziel

Public Website Starts sollen bereits aufgeloeste Public-Route-Wahrheit im
Profilpfad wiederverwenden, statt denselben Slug im Profil-Loader erneut ueber
Firebase aufzuloesen.

Dieser Schritt setzt den naechsten kleinen Teil aus Schritt 47 um.

## Umsetzung

`public-profile-runtime-controller.js` nutzt beim Business-Profil-Read jetzt
den vorhandenen globalen Route-Cache `__MENYRA_PUBLIC_ROUTE_RESOLUTIONS__`.

Wenn fuer einen Slug bereits eine kanonische `restaurantId` bekannt ist, liest
der Profilpfad direkt:

- `restaurants/{canonicalRestaurantId}`

Statt vorher im Slug-Fall zuerst erfolglos oder doppelt gegen den Slug zu
lesen und danach erneut ueber:

- `publicRoutes/{slug}`
- `restaurants/{restaurantId}`

zu gehen.

Die Restaurant-Daten selbst werden weiterhin aus Firestore verifiziert und
weiterhin durch `isPublicBusinessRecord` geprueft. Der Route-Cache ersetzt also
nicht die Profil-Wahrheit, sondern nur die erneute Slug-Aufloesung.

## Warum so

Nach Schritt 49 war der naechste sichere Kandidat laut aktueller Phase:
`Route/Profile Read-Dedupe fuer Public Starts`.

Der kleine Eingriff senkt doppelte Firebase-Reads im bestehenden Public-
Profilpfad, ohne sichtbare Oberflaeche, QR, Cart, Orders, Firebase Rules,
Functions oder Datenformate zu aendern.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `tests/public-profile-runtime-controller.test.mjs`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-step50-route-profile-read-dedupe.md`
- `docs/mnyra-current-phase.md`

## Bewusst nicht geaendert

- Keine sichtbare UI-/Design-Aenderung.
- Keine Route-Aenderung.
- Keine QR-Aenderung.
- Keine Cart-/Order-Aenderung.
- Keine Firebase Rules.
- Keine Cloud Functions.
- Keine Datenpfade oder Payload-Formate.
- Kein Storefront-/Renderer-Umbau.
- Kein Dev Server.
- Kein Playwright-/Smoke-Test.
- Keine Loeschung vermeintlich unbenutzter Dateien, weil mehrere Runtime-Dateien
  absichtlich per absolutem Dynamic Import, HTML oder Service-Worker geladen
  werden.

## Checks

- `node --test tests/public-profile-runtime-controller.test.mjs tests/initial-route-state-public-route-cache.test.mjs tests/public-route-doc-reader.test.mjs tests/public-business-route-resolver.test.mjs`
- `npm run build:menyra-social:bundle`
- `npm run check:social-bundle`
- `git diff --check`

Bundle-Stand nach Build:

- `apps/menyra-social/bundled/entry/social-app.js`: 1,051,362 Bytes raw /
  284,947 Bytes gzip
- Budget: 1,052,000 Bytes raw / 285,000 Bytes gzip

## Manuelle Testliste

- `/:slug` kalt oeffnen und pruefen, ob Profil/Header/Posts normal erscheinen.
- `/:slug/menu` kalt oeffnen und pruefen, ob Menu weiter erscheint.
- QR-Link scannen und pruefen, ob Menu direkt offen bleibt.
- Warenkorb oeffnen, Produkt hinzufuegen und Bestellung absenden.
- Waiter-App pruefen: neue Bestellung muss in der Liste/Toast erscheinen.
- Seite aktualisieren und pruefen, ob keine dauerhafte Ladephase entsteht.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Der bestehende Public-Profilpfad ist weiterhin schwer und nutzt
weiterhin die bestehende Social-App-Runtime. Dieser Schritt reduziert nur eine
doppelte Route/Profile-Aufloesung. Ein echter leichter Public-Renderer bleibt
ein separater groesserer Vertragsschritt.
