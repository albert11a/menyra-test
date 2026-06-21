Status: CURRENT
Last updated: 2026-06-22

# Schritt 118 - Business Header Natural Spacing

## Ziel

Der Business-Name im Header soll normal wirken: kurze zweiteilige Namen wie
`IN VINO` duerfen keinen grossen kuenstlichen Abstand zwischen schwarzem und
blauem Teil bekommen. Lange vordere Namen sollen trotzdem sauber gekuerzt
werden, ohne links angeschnitten zu wirken.

## Befund

Der Nachfix aus Schritt 117 hat den Header-Button auf `w-full` und den
schwarzen Titelbereich auf `flex-1` gesetzt. Dadurch wurde der schwarze Teil
immer auf die volle Header-Mitte gestreckt. Bei kurzen Namen entstand dadurch
zu viel Abstand zwischen Titel und Subtitle.

## Geaendert

- `w-full` wurde vom Business-Header-Button entfernt.
- Der innere Name-Container ist wieder `inline-flex`.
- Der schwarze Titelbereich streckt sich nicht mehr mit `flex-1`, sondern
  schrumpft nur bei echter Platznot.
- Die kleine linke Clip-Reserve fuer kursive Schrift bleibt erhalten.
- Social-Bundle und App-Build-Token wurden nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step118-business-header-natural-spacing.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Routing, QR, Warenkorb, Orders, Menu-Logik oder Firebase.
- Keine Aenderung an Lead-Farbe, Profil-Card, Tabs oder Kategorie-Logik.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `git diff --check`

## Manuelle Testliste

- Business-Profil `IN VINO` oeffnen und pruefen, dass `IN` und `VINO` normal
  nah beieinander stehen.
- Einen Business-Namen mit langem vorderen Teil pruefen und kontrollieren,
  dass er nicht links abgeschnitten wird, sondern nur bei Platzmangel mit
  Ellipsis gekuerzt wird.
- `Beitraege`/`Menue` wechseln und kurz pruefen, dass Header-Icons,
  Name/Kategorien und Profil-Card stabil bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist eng auf die Breitenverteilung des Header-Namens begrenzt. Extrem
lange Namen koennen auf sehr schmalen Displays weiterhin gekuerzt werden.
