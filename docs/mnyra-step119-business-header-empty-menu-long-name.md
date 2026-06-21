Status: CURRENT
Last updated: 2026-06-22

# Schritt 119 - Business Header Empty Menu Long Name

## Ziel

Der Business-Header soll in zwei kleinen Randfaellen stabil und natuerlich
wirken:

- Wenn ein Business-Profil im Menue keine Produkte/Kategorien hat, soll der
  fallbackende Business-Name nicht leicht anders positioniert sein.
- Wenn ein einteiliger Business-Name sehr lang ist, z.B. `kosovamanswear`,
  soll der Zusatz `Social` ausgeblendet werden, damit der Name mehr Platz hat.
- Wenn ein mehrteiliger Business-Name lang ist, z.B.
  `70s pastry and bakery`, soll der Header-Name etwas kompakter dargestellt
  werden, damit beide Namensteile besser in die verfuegbare Breite passen.

## Befund

- Der Header unterschied bisher nur zwischen `menu aktiv` und `menu nicht
  aktiv`. Auch wenn im Menue keine Kategorie-Chips gerendert werden konnten,
  wurde weiterhin das spezielle Menu-Mittelbereich-Layout benutzt.
- Ein einteiliger Name bekam immer den Fallback-Subtitle `Social`. Bei langen
  Ein-Wort-Namen nahm dieser Zusatz Platz weg und verstaerkte das Abschneiden
  des eigentlichen Business-Namens.
- Lange mehrteilige Namen nutzten dieselbe grosse Titelklasse wie sehr kurze
  Namen. Dadurch konnten sie im Header schneller knapp wirken.

## Geaendert

- Das spezielle Menu-Mittelbereich-Layout wird nur noch genutzt, wenn echte
  Menu-Kategorien vorhanden sind.
- Menu ohne Produkte/Kategorien rendert den Namen wieder in derselben
  Header-Position wie die normale Profilansicht.
- Der Fallback-Subtitle `Social` wird bei einteiligen Namen ab mehr als zehn
  Zeichen ausgeblendet.
- Lange Business-Namen nutzen im Header eine etwas kleinere Titelklasse und
  einen minimal engeren Abstand zwischen den Namensteilen.
- Social-Bundle und App-Build-Token wurden nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step119-business-header-empty-menu-long-name.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Menu-Daten, Produktlogik, QR, Warenkorb, Orders, Routing
  oder Firebase.
- Keine Aenderung an Lead-Farbe, Profil-Card oder Tabs.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `git diff --check`

## Manuelle Testliste

- Business-Profil ohne Menu-Produkte oeffnen und in `Menue` wechseln; der Name
  soll gleich positioniert wirken wie bei `Beitraege`.
- Ein einteiliges langes Business wie `kosovamanswear` pruefen; `Social` soll
  im Header nicht angezeigt werden.
- Einen langen mehrteiligen Namen wie `70s pastry and bakery` pruefen; der Name
  soll kompakter wirken und besser in den Header passen.
- Einen normalen zweiteiligen Namen wie `IN VINO` gegenpruefen; der blaue
  zweite Teil soll weiter sichtbar bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Fix ist auf Header-Fallback-Layout und Subtitle-Sichtbarkeit begrenzt.
Lange Namen koennen auf sehr schmalen Displays weiterhin rechts gekuerzt
werden, nutzen aber mehr verfuegbare Breite als vorher.
