Status: CURRENT
Last updated: 2026-06-22

# Schritt 117 - Business Header Italic Clip Fix

## Ziel

Der vordere schwarze Business-Name im Header darf bei kurzen Namen wie
`IN VINO` links nicht durch die kursiv gesetzte Schrift angeschnitten werden.

## Befund

Der Business-Titel wird im Header kursiv gerendert und gleichzeitig fuer lange
Namen mit `overflow-hidden`/Ellipsis begrenzt. Kursive Glyphen koennen links
leicht aus ihrer Textbox herausragen; durch `overflow-hidden` wurde dieser
Ueberhang sichtbar abgeschnitten.

## Geaendert

- Der Business-Header-Button nutzt jetzt die volle verfuegbare Breite.
- Der schwarze Business-Titel hat einen kleinen negativen linken Margin plus
  gleich grossen linken Innenabstand. Dadurch bleibt die optische Position
  erhalten, aber die kursiven Glyphen haben links Clip-Reserve.
- Social-Bundle und App-Build-Token wurden nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step117-business-header-italic-clip-fix.md`

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

- Business-Profil `IN VINO` oder vergleichbar kurzen zweiteiligen Namen
  oeffnen.
- Im Header pruefen, dass der schwarze vordere Name links nicht mehr
  abgeschnitten wirkt.
- `Beitraege`/`Menue` wechseln und kurz pruefen, dass Icons, Name/Kategorien
  und Profil-Card stabil bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist eng auf den kursiven Header-Text begrenzt. Extrem lange Namen
werden weiterhin bewusst gekuerzt, aber der linke Glyphen-Ueberhang wird nicht
mehr abgeschnitten.
