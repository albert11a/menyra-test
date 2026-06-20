Status: CURRENT
Last updated: 2026-06-20

# Schritt 101 - Hotel Details Oferta Editor Stability Fix

## Ziel

Nach Schritt 100 durfte die `Ofertat`-Sektion im Hotel-/Motel-Editor beim
Oeffnen von `Hotel Details` nicht mehr verzoegert erscheinen, verschwinden oder
erneut auftauchen.

## Geaendert

- Das `Hotel Details`-Formular bleibt im DOM und wird nur per `hidden`-Klasse
  ein- und ausgeblendet.
- Klick auf Plus oder Hotel-Zeile ruft keinen kompletten Editor-`render()` mehr
  aus.
- Schliessen von `Hotel Details` ruft ebenfalls keinen kompletten Editor-
  `render()` mehr aus.
- Die `Ofertat`-Liste bevorzugt vorhandene Eintraege vor dem Loading-State.
  Wenn Eintraege bereits im State sind, werden sie nicht mehr durch
  `Ofertat werden geladen...` verdraengt.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung an QR, Cart, Order, Checkout oder Routing.
- Keine Aenderung an Firebase Rules, Functions oder Collections.
- Keine Aenderung an Hotel-/Oferta-Datenvertrag, Speichern oder Loeschen.
- Keine Aenderung an Restaurant-/Cafe-Editor oder Restaurant-/Cafe-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `node --check apps\menyra-social\core\app-events\app-events-menu-focus-bind-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps\menyra-social\bundled\chunks\profile-menu-focus-render-controller-BvEwv2k8.js`
- `node --check apps\menyra-social\bundled\entry\social-app.js`

## Manuelle Testliste

- Als Hotel-/Motel-Owner Profil -> Editor oeffnen.
- Pruefen, dass `Ofertat` stabil sichtbar bleibt und nicht kurz verschwindet.
- Auf `Hotel Details` Plus oder Hotel-Zeile klicken.
- Pruefen, dass nur das Hotel-Details-Formular erscheint und `Ofertat` nicht
  neu laedt oder springt.
- `Hotel Details` wieder schliessen und erneut oeffnen.
- Eine Oferta oeffnen/bearbeiten und pruefen, dass das Modal normal erscheint.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Bedienung muss manuell im lokalen Dev-Setup
gegengeprueft werden.
