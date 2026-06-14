Status: CURRENT
Last updated: 2026-06-14

# Schritt 54 - Sprachbutton wieder nur als Globe-Icon

## Ziel

Der Sprachbutton im Smart-Header soll wieder als Globe-Icon erscheinen. Beim Klick
soll weiterhin dieselbe Sprachleiste aus Schritt 53 mit `Shqip`, `Deutsch` und
`Srpski` aufklappen.

## Geaendert

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
  - Der sichtbare beziehungsweise sichtbar gewordene Text-Fallback im
    `data-language-toggle`-Button wurde entfernt.
  - Das bestehende Globe-Icon bleibt der alleinige sichtbare Ausloeser.
  - `aria-label` und `aria-expanded` bleiben erhalten.
- Social-Bundle wurde neu gebaut, damit der statische Auslieferungsstand denselben
  Sprachbutton-Fix enthaelt.

## Bewusst Nicht Geaendert

- Keine Aenderung an der Sprachwahl-Logik.
- Keine Aenderung an den drei Sprachoptionen oder i18n-Texten.
- Keine Route-, QR-, Cart-, Order-, Firebase-Rules- oder Functions-Aenderung.
- Kein Header-Redesign und keine weitere UI-Aenderung ausser dem freigegebenen
  Icon-Ausloeser.
- Keine Smoke-/Playwright-Laeufe durch Codex gemaess Repo-Regel.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Die Aenderung ist bewusst klein gehalten: Nur der Button-Inhalt wurde korrigiert,
waehrend die bestehende Klickbindung und das Sprachpanel unveraendert bleiben.
Rest-Risiko liegt nur in manueller Sichtpruefung auf echten Zielgeraeten.

## Verifikation

- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `npm run build`
- `npm run check:social-bundle`
- `git diff --check`

## Manuelle Testliste

- Auf `/:slug` oder `/:slug/menu` pruefen, dass oben wieder nur das Globe-Icon
  fuer Sprache sichtbar ist.
- Globe-Icon antippen und pruefen, dass die Sprachleiste mit `Shqip`, `Deutsch`
  und `Srpski` aufklappt.
- Eine Sprache waehlen und pruefen, dass sich die Sprache wie bisher umstellt und
  die Leiste wieder schliesst.
- Seite neu laden und pruefen, dass die gespeicherte Sprache erhalten bleibt.
