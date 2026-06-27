Status: CURRENT
Last updated: 2026-06-27

# Schritt 131 - Shopping Card Produktbilder

## Ziel

Der Shop-Editor soll fuer Produkte in der Shopping-Tab-Card ein eigenes Card-Bild festlegen koennen.

## Umsetzung

- Im Shopping-Landing-Card-Editor wird pro ausgewaehltem Produkt eine Card-Bild-Auswahl angezeigt.
- Der Nutzer kann ein vorhandenes Produktbild als Card-Bild waehlen.
- Der Nutzer kann alternativ ein eigenes Bild hochladen, das nur als Card-Bild verwendet wird.
- Die Auswahl wird als `shoppingLandingCard.productImageOverrides` und
  `shoppingLandingProductImageOverrides` gespeichert.
- Die gespeicherten `shoppingLandingProducts` behalten ihr normales Produktbild in `imageUrl`
  und tragen das Card-only-Bild separat in `cardImageUrl`.
- Der Shopping-Tab rendert Produktkacheln bevorzugt mit `cardImageUrl`, waehrend
  Produktdetail-/Menu-Pfade weiter das normale Produktbild nutzen.
- Die Card-Bild-Auswahl zeigt das Default-Bild nicht nochmal als Kandidat 1 und
  speichert Default-Bilder nicht als separaten Override.
- Der App-Build-Token wurde auf `2026-06-27-shopping-landing-cards-04` aktualisiert.
- Das Social-Bundle wurde neu gebaut.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/shopping-landing-card-editor-bindings.js`
- `apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/manifest.json`
- gehashte Dateien unter `apps/menyra-social/bundled/chunks/`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step131-shopping-card-product-images.md`

## Bewusst nicht geaendert

- Keine Aenderung am eigentlichen Produkt-/Menu-Item-Bild.
- Keine Aenderung an Warenkorb, Checkout oder Produktdetail-Logik.
- Keine Routing- oder Public-/App-Grenzen-Aenderung.
- Keine Firebase Rules oder Functions.

## Manuelle Testliste

1. Als Ecommerce-Shop das eigene Profil im Menu-/Shop-Editor oeffnen.
2. In der Shopping Card ein Produkt auswaehlen.
3. Bei diesem Produkt ein vorhandenes Bild als Card-Bild auswaehlen und speichern.
4. Shopping-Tab oeffnen und pruefen, dass die Produktkachel dieses Bild zeigt.
5. Dasselbe Produkt antippen und pruefen, dass das Produktdetail weiter das normale Produktbild nutzt.
6. Danach ein eigenes Card-Bild fuer das Produkt hochladen, speichern und erneut im Shopping-Tab pruefen.
7. Mit `Standard` zuruecksetzen, speichern und pruefen, dass wieder das normale Produktbild in der Card erscheint.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko: Die Funktion wurde per Bundle-Build verifiziert, aber gemaess aktueller Codex-Regel nicht per Smoke-/Playwright-Test ausgefuehrt. Der Nutzer testet den Editorfluss manuell.
