Status: CURRENT
Last updated: 2026-06-25

# Schritt 121 - Business Profile Card UI

## Ziel

Das Business-Profil soll eine neue Profil-Card bekommen, ohne Routing,
Produktlogik oder bestehende Upload-Wege umzubauen.

Das Titelbild soll ueber denselben zentralen Bild-Resolver laufen wie andere
Profilbilder. Der bestehende Profilbild-Ladeweg selbst bleibt unveraendert.

## Geaendert

- Business-Profile nutzen im eigenen Profil und im Public-Profil eine neue
  Card mit Titelbildbereich, Profilbild-Ueberlappung, Quick-Links und
  `Fans` + `Info`.
- `Folgt` wird in der neuen Business-Card nicht mehr angezeigt.
- Die bestehenden Schrift-/Textformate fuer Profilname, Bio und Location/Meta
  bleiben auf den bisherigen Mnyra-Klassen. Die Beispiel-Card-Typografie wurde
  dafuer nicht uebernommen.
- Die Profilbild-URL bleibt beim bestehenden Avatar-Pfad:
  `getOptimizedImageUrl(profile.avatar, "avatar")`.
- Das Titelbild wird separat aus vorhandenen Feldern wie `titleImageUrl`,
  `coverImageUrl`, `coverUrl`, `heroUrl` oder `coverImages[0]` gelesen und
  ueber `getOptimizedImageUrl(..., "medium")` gerendert.
- Public- und Self-Profile geben Titelbild-, Kontakt- und Social-Felder durch,
  ohne neue Firestore-Pfade oder Writes einzufuehren.
- Der Info-Zugang klappt innerhalb der Card zwischen Profil- und Info-Seite um.
  Follow, Chat, Status und Settings bleiben auf den bestehenden Actions.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-events/app-events-settings-profile-bind-utils.js`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-*.js`
- weitere durch Vite neu gehashte `apps/menyra-social/bundled/chunks/*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step121-business-profile-card-ui.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Profilbild-Upload, Profilbild-Speicherpfad oder
  Profilbild-Resolver.
- Keine Aenderung an Routing, QR, Cart, Orders, Menu-Daten oder Firebase Rules.
- Keine Aenderung an Functions, Collections oder Produktlogik.
- Keine Aenderung an User-Profil-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.
- Keine Uebernahme der Beispiel-Card-Schriften fuer bestehende Profiltexte.

## Verifikation

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/app-events/app-events-settings-profile-bind-utils.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `node --check apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `node --check apps/menyra-social/social-app.js`
- `npm run build:menyra-social:bundle`
- `git diff --check`

## Manuelle Testliste

- Eigenes Business-Profil oeffnen und pruefen, dass die neue Card mit
  Titelbildbereich, Profilbild, `Fans` und `Info` sichtbar ist.
- Pruefen, dass `Folgt` in der Business-Card nicht mehr sichtbar ist.
- Pruefen, dass Profilname, Bio und Location/Meta in Schriftgroesse und
  Format wie bisher wirken.
- Profilbild anklicken und pruefen, dass der bestehende Profilbild-Upload
  weiter funktioniert.
- Ein Business mit Titelbild oeffnen und pruefen, dass das Titelbild in der
  Card laedt; ein Business ohne Titelbild muss den neutralen Fallback zeigen.
- `Info` oeffnen und zurueck zum Profil wechseln.
- Public-Business-Profil oeffnen und Follow/Chat kurz pruefen.
- Eigenes Business-Profil pruefen: Status-Button und Settings-Button muessen
  weiter funktionieren.
- Ein normales User-Profil oeffnen und gegenpruefen, dass dessen Card
  unveraendert bleibt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die sichtbare Card, Titelbildanzeige und Info-Umschaltung muessen
manuell im lokalen Dev-Setup gegengeprueft werden.
