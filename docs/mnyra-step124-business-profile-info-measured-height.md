Status: CURRENT
Last updated: 2026-06-25

# Schritt 124 - Business Profile Info Measured Height

## Ziel

Beim Klick auf `Info` darf die neue Business-Profil-Card ihre vertikale Hoehe
nicht sichtbar veraendern.

## Geaendert

- Der `Info`-Klick misst vor dem Re-Render die echte aktuelle Hoehe der
  sichtbaren Business-Profil-Card mit `getBoundingClientRect()`.
- Die gemessene Hoehe wird pro Business-Card-Key im UI-State gespeichert.
- Die Info-Ansicht nutzt diese gemessene Pixelhoehe als feste Hoehe, solange
  sie offen ist.
- Die Business-Profil-Card bekommt dafuer ein internes
  `data-business-profile-card`-Attribut als Messanker.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-events/app-events-settings-profile-bind-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step124-business-profile-info-measured-height.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an sichtbaren Texten.
- Keine Aenderung an Schriftgroessen, Profilname-, Bio- oder Meta-Formaten.
- Keine Aenderung am Profilbild-Upload oder Profilbild-Ladeweg.
- Keine Aenderung am Titelbild-Ladeweg.
- Keine Aenderung an Routing, QR, Cart, Orders, Menu-Daten oder Firebase Rules.
- Keine Aenderung an normalen User-Profil-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/app-events/app-events-settings-profile-bind-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/social-app.js`
- `npm run build:menyra-social:bundle`
- `git diff --check`

## Manuelle Testliste

- Business-Profil oeffnen und sofort auf `Info` klicken.
- Die Info-Card soll exakt dieselbe vertikale Hoehe wie die Profil-Card im
  Moment des Klicks behalten.
- Zurueck zum Profil wechseln und mehrfach wiederholen.
- Kurze und lange Bio gegenpruefen; es soll kein sichtbares Kleiner- oder
  Groesserwerden der Card beim Umschalten entstehen.
- Profilbild, Titelbild, Texte und Schriftgroessen kurz unveraendert
  gegenpruefen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die exakte visuelle Card-Hoehe muss im lokalen Browser manuell
geprueft werden.
