Status: CURRENT
Last updated: 2026-06-19

# Schritt 88 - Travel Oferta Hotel Cards

## Ziel

Der Travel-Tab `Ofertat` soll die gleiche Card-Darstellung wie der Travel-
Hotels-Tab nutzen. Hotel-/Motel-Owner sollen im bestehenden Menu-/Card-Editor
zusaetzlich Oferta-Eintraege hinzufuegen, bearbeiten, loeschen und aktivieren
koennen.

## Geaendert

- `Ofertat` im Travel-Tab rendert Hotel-/Motel-Profile jetzt mit derselben
  Travel-Hotel-Card wie der `Hotels`-Tab.
- Der Hotel-/Motel-Editor zeigt unter dem Hotel-Card-Editor die bestehende
  Angebotsverwaltung auf Basis von `restaurants/{restaurantId}/public/offers`.
- Hotel-/Motel-Owner koennen dort Oferta-Eintraege hinzufuegen, bearbeiten,
  loeschen und per Aktiv-Schalter steuern.
- Das bestehende Fokus-/Angebotsmodal zeigt fuer Hotel-/Motel-Kontext
  `Oferta`-Labels, ohne den Restaurant-/Cafe-Fokus-Editor umzubenennen.
- Der App-Build-Token wurde angehoben und die Social-Bundles wurden neu gebaut.

## Bewusst Nicht Geaendert

- Keine neue Firebase-Collection und keine Aenderung an Firebase Rules oder
  Functions.
- Keine Aenderung an QR, Cart, Order oder Routing.
- Keine Aenderung am Hotel-Card-Layout selbst.
- Keine Aenderung an Restaurant-/Cafe-Menueditor-Labels.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`
- `git diff --check`
- Konfliktmarker-/Build-Token-Pruefung per `rg`

## Manuelle Testliste

- Travel oeffnen und im Tab `Ofertat` pruefen, dass Hotel-/Motel-Cards wie im
  `Hotels`-Tab erscheinen.
- Bei einer Oferta-Card Bildslider, Dots, Like/Share und `Mehr` kurz pruefen.
- Als Hotel-/Motel-Owner den Menu-/Card-Editor oeffnen und unter dem Hotel-
  Card-Bereich die `Ofertat`-/`Oferta`-Sektion pruefen.
- Eine Oferta hinzufuegen, speichern, bearbeiten, deaktivieren/aktivieren und
  loeschen.
- Danach Travel und Profil erneut oeffnen und pruefen, dass Hotel-Card-Daten
  und Oferta-Editor weiter sauber laden.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Anzeige und Bedienung muss manuell im lokalen Dev-Setup
gegengeprueft werden.
