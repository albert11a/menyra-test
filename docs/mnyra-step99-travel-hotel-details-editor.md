Status: CURRENT
Last updated: 2026-06-20

# Schritt 99 - Travel Hotel Details Editor

## Ziel

Der Hotel-/Motel-Card-Editor soll fuer Hotel-Details einfacher und
einheitlicher werden. Zentrum- und Stranddistanz sollen nicht mehr als freier
Text gepflegt werden muessen, die sichtbare Titelbild-URL soll verschwinden,
und Hotel-/Oferta-Features sollen fuer Essen, Shezlong und Parking klare
albanische Presets bekommen.

## Geaendert

- Der Hotel-/Motel-Editor zeigt den bisherigen Distanz-/Preis-/Feature-Bereich
  jetzt als `Hotel Details`-Sektion im Stil der bestehenden Angebotsverwaltung.
- Das sichtbare Feld `Titelbild URL` wurde aus dem Hotel-Card-Editor entfernt;
  der bestehende interne URL-Fallback bleibt unsichtbar kompatibel.
- Zentrum- und Stranddistanz werden im Hotel-Editor und im Oferta-Modal ueber
  Zahl plus Einheit `m`/`km` gepflegt.
- Fuer Zentrum und Strand gibt es je einen Direkt-Haken:
  `Direkt im Zentrum` und `Direkt am Strand`.
- Die ersten drei Hotel-/Oferta-Features sind jetzt Presets mit Icons:
  `Ushqimi`, `Shezlongët`, `Parking`.
- Die Presets speichern albanische Werte wie `Mëngjes i përfshirë`,
  `Gjysmë pension`, `Shezlongë të përfshirë`, `Parking falas` usw.
- Weitere freie Features bleiben als mehrzeiliges Textfeld moeglich und werden
  im bestehenden `features`-Array gespeichert.
- Travel-Hotel- und Travel-Oferta-Cards erkennen Essen-/Shezlong-/Parking-
  Featuretexte und zeigen dafuer kleine lokale Icons in den Feature-Chips.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Bewusst Nicht Geaendert

- Keine Aenderung an QR, Cart, Order, Checkout oder Routing.
- Keine Aenderung an Firebase Rules, Functions oder Collections.
- Keine neue Hotel-Zimmer-/Buchungslogik.
- Keine Aenderung am Restaurant-/Cafe-Editor und keine Aenderung an
  Restaurant-/Cafe-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps\menyra-social\core\profile\profile-menu-focus-render-controller.js`
- `node --check apps\menyra-social\core\app-events\app-events-menu-focus-bind-utils.js`
- `node --check apps\menyra-social\core\menu\customer-focus-modal-render-utils.js`
- `node --check apps\menyra-social\core\menu\focus-runtime-controller.js`
- `node --check apps\menyra-social\core\marketplace\marketplace-view-render-utils.js`
- `npm run build:menyra-social:bundle`
- `node --check` fuer die neu erzeugten gebuendelten Hotel-/Marketplace-Chunks
- `git diff --check`
- Konfliktmarker-Pruefung per `rg`

## Manuelle Testliste

- Als Hotel-/Motel-Owner Profil -> Editor oeffnen und pruefen, dass die Sektion
  `Hotel Details` sichtbar ist.
- Pruefen, dass `Titelbild URL` nicht mehr sichtbar ist und Titelbilder weiter
  ueber Upload/Galerie funktionieren.
- Zentrum und Strand einmal mit Zahl plus `m` speichern, danach mit `km`
  speichern und wieder bearbeiten.
- `Direkt im Zentrum` und `Direkt am Strand` aktivieren, speichern und in der
  Hotel-Card sowie im Editor erneut kontrollieren.
- Essen-, Shezlong- und Parking-Presets auswaehlen, freie Zusatzfeatures
  eintragen, speichern und erneut bearbeiten.
- Eine Oferta oeffnen/bearbeiten und dieselben Distanz- und Feature-Controls
  pruefen.
- Travel `Hotels` und `Ofertat` pruefen: Feature-Chips sollen fuer Essen,
  Shezlong und Parking mit Icon erscheinen.
- Mit einem Restaurant-/Cafe-Account kurz gegenpruefen, dass der normale
  Menu-/Fokus-Editor und Restaurant-/Cafe-Cards unveraendert bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die echte Anzeige, Speichern-/Reload-Runde und Hotel-/Oferta-
Card-Darstellung muss manuell im lokalen Dev-Setup gegengeprueft werden.
