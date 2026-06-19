Status: CURRENT
Last updated: 2026-06-19

# Schritt 89 - Travel Oferta Filter und Felder

## Ziel

Der Travel-Tab `Ofertat` soll nur Hotel-/Motel-Cards zeigen, wenn fuer das
Hotel/Motel mindestens ein aktiver Oferta-Eintrag existiert. Gleichzeitig soll
der Hotel-/Motel-Oferta-Editor die fuer die Travel-Hotel-Card relevanten Felder
pflegen koennen.

## Geaendert

- Travel `Ofertat` baut seine Cards jetzt aus aktiven Eintraegen in
  `restaurants/{restaurantId}/public/offers`.
- Hotels/Motels ohne aktive Oferta erscheinen im `Ofertat`-Tab nicht mehr.
- Travel-Hotels werden beim Laden mit ihren `public/offers` angereichert, damit
  der Travel-Renderer echte Oferta-Daten verwenden kann.
- Oferta-Cards koennen auf der Hotel-Card zusaetzlich links oben eine frei
  editierbare Badge und daneben eine `Nete / dite`-Badge anzeigen.
- Der Hotel-/Motel-Oferta-Editor speichert jetzt zusaetzlich:
  Entfernung Zentrum, Entfernung Strand/See, Preis, Preis-Typ `p.P` oder
  `Totali`, Badge links, Badge rechts und mehrere Feature-Zeilen.
- Die Oferta-Zusatzfelder bleiben beim Laden, Bearbeiten, Speichern und
  erneuten Rendern erhalten.
- Der lokale Restaurant-State wird nach Oferta-Speichern/-Loeschen aktualisiert,
  damit Travel ohne Neustart den neuen Oferta-Stand nutzen kann.
- Der App-Build-Token wurde angehoben und die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine neue Firebase-Collection und keine Aenderung an Firebase Rules oder
  Functions.
- Keine Aenderung an QR, Cart, Order oder Routing.
- Keine Aenderung an Restaurant-/Cafe-Fokusfeldern ausserhalb des bestehenden
  gemeinsamen Speichers.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `node --check apps/menyra-social/core/common/restaurant-identity-runtime-controller.js`
- `node --check apps/menyra-social/core/menu/focus-runtime-controller.js`
- `node --check apps/menyra-social/core/menu/customer-focus-modal-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-lDhblkGK.js`
- `git diff --check`

## Manuelle Testliste

- Travel `Ofertat` oeffnen und pruefen, dass Hotels/Motels ohne aktive Oferta
  nicht mehr erscheinen.
- Fuer ein Hotel/Motel eine Oferta erstellen und pruefen, dass sie im
  `Ofertat`-Tab als Hotel-Card erscheint.
- Im Oferta-Editor Badge links, `Nete / dite`, Zentrum, Strand/See, Preis,
  `p.P`/`Totali` und mehrere Features speichern und wieder bearbeiten.
- Eine Oferta deaktivieren und pruefen, dass sie aus `Ofertat` verschwindet.
- Eine Oferta loeschen und pruefen, dass das Hotel/Motel bei keiner weiteren
  aktiven Oferta nicht mehr im `Ofertat`-Tab angezeigt wird.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Anzeige, Firebase-Ladefolge und Bedienung muss manuell im
lokalen Dev-Setup gegengeprueft werden.
