Status: CURRENT
Last updated: 2026-06-21

# Schritt 108 - Hotel Editor State Scope

## Ziel

Der Hotel-/Motel-Editor darf beim Login oder Wechsel zwischen Hotel-Accounts
keine Titelbilder aus einem vorherigen Hotel-Editor-State anzeigen oder beim
Speichern in das aktuell eingeloggte Hotel uebernehmen.

## Geaendert

- `state.hotelCardEditor` wird jetzt mit der aktuellen `restaurantId`
  gescoped.
- Der Hotel-Editor-Renderpfad nutzt gespeicherte Editor-Bilder nur noch, wenn
  der Editor-State zur aktuell gerenderten Hotel-ID passt.
- Upload-, URL-, Entfernen- und Speichern-Aktionen schreiben die aktuelle
  Hotel-ID in den Editor-State.
- Beim nutzerspezifischen Session-Reset wird `state.hotelCardEditor`
  zurueckgesetzt.
- Der lokale Hotel-Card-Save-Patch sammelt keine alten `profileView`-IDs mehr
  als Ziel-IDs. Dadurch kann ein altes fremdes Profil nicht lokal mit den
  aktuellen Hotel-Details ueberschrieben werden.
- Der Social-App-Bundle-Build wurde neu erzeugt, damit der Fix auch im
  ausgelieferten gebundelten Entry enthalten ist.

## Geaenderte Dateien

- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-DlB8kvuI.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-Bi9HySiV.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step108-hotel-editor-state-scope.md`

## Bewusst Nicht Geaendert

- Keine sichtbare UI-, Layout-, Farb-, Typografie- oder Spacing-Aenderung.
- Keine Aenderung an Travel-Hotel-Cards, Oferta-Cards, Search, Map oder
  Marketplace-Sortierung.
- Keine Aenderung an Routing, QR, Cart, Order, Firebase Rules, Functions oder
  Collections.
- Keine Aenderung an Restaurant-/Cafe-Menueditor-Logik.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.
- Keine direkte Arbeit auf `main`; gemaess Mnyra-Regel wurde auf
  `refactorapp` gearbeitet.

## Verifikation

- `node --check apps/menyra-social/core/app-events/app-events-menu-focus-bind-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/social-app.js`
- `npm run build:menyra-social:bundle`

Hinweis: Der Build meldet weiterhin die bestehende Vite-Warnung zu grossen
Chunks nach Minifizierung. Das ist kein neuer Fehler dieses Schritts.

## Manuelle Testliste

- Mit Hotel A einloggen, Profil -> Editor -> Hotel Details oeffnen und die
  Titelbilder merken.
- Abmelden oder Account wechseln, mit Hotel B einloggen und Profil -> Editor ->
  Hotel Details oeffnen.
- Pruefen, dass im Editor keine Titelbilder von Hotel A sichtbar sind.
- Ein Bild bei Hotel B entfernen oder hinzufuegen und speichern.
- Travel `Hotels` fuer Hotel B pruefen, dass nur die Bilder von Hotel B
  erscheinen.
- Danach Hotel A erneut oeffnen und pruefen, dass seine Titelbilder nicht durch
  Hotel B ersetzt wurden.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die finale Gegenpruefung muss manuell mit zwei Hotel-Accounts im
Browser erfolgen.
