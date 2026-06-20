Status: CURRENT
Last updated: 2026-06-20

# Schritt 93 - Travel Oferta City Icon

## Ziel

Auf der Travel-Oferta-Card soll die separate Adresszeile mit `MapPin` nicht
mehr sichtbar sein. Das `MapPin`-Icon soll stattdessen direkt neben der
orangefarbenen Stadt-/Destination-Zeile oben stehen.

## Geaendert

- Die Adresszeile im Info-Bereich der Premium-Oferta-Card wurde entfernt.
- Die orange Stadt-/Destination-Zeile zeigt jetzt links ein `MapPin`-Icon.
- Der App-Build-Token wurde aktualisiert.
- Die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine Aenderung am `Hotels`-Tab oder an normalen Hotel-Cards.
- Keine Aenderung an Distanzen, Features, Preis, Badge oder Detailoverlay.
- Keine Firebase-, Routing-, QR-, Cart- oder Order-Aenderung.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/marketplace/marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `node --check apps/menyra-social/bundled/chunks/marketplace-view-render-utils-Bs3ppdn_.js`
- `git diff --check`

## Manuelle Testliste

- Travel `Ofertat` oeffnen.
- Pruefen, dass die orange Stadt-/Destination-Zeile oben ein `MapPin`-Icon hat.
- Pruefen, dass die alte separate Adresszeile mit Icon nicht mehr sichtbar ist.
- Pruefen, dass Zentrum- und Strand/See-Distanz weiterhin sichtbar bleiben.
- `Hotels`-Tab kurz pruefen, normale Hotel-Card bleibt unveraendert.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die sichtbare Platzierung muss im lokalen Dev-Setup manuell
gegengeprueft werden.
