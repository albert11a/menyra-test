Status: CURRENT
Last updated: 2026-06-25

# Schritt 123 - Business Profile Info Height Match

## Ziel

Die Info-Seite der neuen Business-Profil-Card soll beim Umschalten dieselbe
vertikale Hoehe behalten wie die normale Profil-Seite.

## Geaendert

- Die Info-Ansicht der Business-Profil-Card nutzt jetzt einen unsichtbaren
  Hoehen-Sizer.
- Dieser Sizer bildet die vertikale Struktur der sichtbaren Profil-Seite nach:
  Titelbildbereich, Profilbild-Zeile, Name/Bio/Meta-Bereich und untere
  Aktionszeile.
- Die sichtbare Info-Ansicht liegt auf derselben Grid-Flaeche und fuellt die
  durch den Sizer bestimmte Card-Hoehe.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step123-business-profile-info-height-match.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an sichtbaren Texten.
- Keine Aenderung an Schriftgroessen, Profilname-, Bio- oder Meta-Formaten.
- Keine Aenderung am Profilbild-Upload oder Profilbild-Ladeweg.
- Keine Aenderung am Titelbild-Ladeweg.
- Keine Aenderung an Routing, QR, Cart, Orders, Menu-Daten oder Firebase Rules.
- Keine Aenderung an normalen User-Profil-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `npm run build:menyra-social:bundle`
- `git diff --check`

## Manuelle Testliste

- Business-Profil oeffnen und die Hoehe der normalen Profil-Card merken.
- `Info` oeffnen: Die Card soll vertikal gleich hoch bleiben.
- Mehrmals zwischen Profil und Info wechseln; es soll kein sichtbarer
  Hoehensprung mehr entstehen.
- Profilname, Bio, Location/Meta, Profilbild und Titelbild kurz gegenpruefen;
  sie sollen unveraendert wirken.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die exakte visuelle Hoehe muss im lokalen Browser manuell
gegengeprueft werden.
