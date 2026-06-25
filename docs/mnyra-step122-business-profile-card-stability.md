Status: CURRENT
Last updated: 2026-06-25

# Schritt 122 - Business Profile Card Stability

## Ziel

Die neue Business-Profil-Card aus Schritt 121 soll stabiler wirken:

- Quick-Link-Icons oben rechts duerfen nicht leer verschwinden.
- Die Info-Seite soll dieselbe vertikale Mindesthoehe wie die Profil-Card haben.
- Das Titelbild soll bei Refresh/Cold-Start weniger sichtbar verschwinden oder
  flackern, ohne den Profilbild-Ladeweg zu veraendern.

## Geaendert

- Fehlende Quick-Link-Icons (`instagram`, `music-2`) sowie begleitende Card-
  Icons werden jetzt als Inline-Lucide-Markup gerendert und haengen nicht mehr
  an spaeterer Lucide-Hydration.
- Profilseite und Info-Seite der Business-Card nutzen dieselbe Mindesthoehe
  (`440px`) ueber denselben Card-Wrapper.
- Das Titelbild wird im sichtbaren Profilkopf `eager` mit hoher Prioritaet
  geladen.
- Das Titelbild nutzt nicht mehr den generischen `data-fallback-src`-
  Reveal-Pfad, der bei Re-Renders kurz Opacity auf `0` setzen konnte.
- Business-Titelbilder bekommen einen kleinen lokalen Last-Good-Cache pro
  Business-Key. Dieser Cache wird nur als temporaerer Fallback genutzt, wenn
  der aktuelle Public-Profilkopf noch in einem settling/loading Zustand ist.
- Der Public-Web-Direct-Open-Flow traegt vorhandene Titelbildfelder bereits in
  `routeSeedProfile`, `loadingProfile` und Route-Payload weiter.
- Self-Business-Snapshots behalten vorhandene Titelbildfelder im Seed, damit
  Live-Updates sie nicht kurzfristig auf leer ziehen.
- Der gebuendelte Mnyra-Social-Output wurde nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-*.js`
- `apps/menyra-social/bundled/chunks/profile-open-flow-utils-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step122-business-profile-card-stability.md`

## Bewusst Nicht Geaendert

- Keine Aenderung am Profilbild-Upload oder Profilbild-Ladeweg.
- Keine Aenderung an Routing, QR, Cart, Orders, Menu-Daten oder Firebase Rules.
- Keine Aenderung an Functions, Collections oder Produktlogik.
- Keine Aenderung an normalen User-Profil-Cards.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `node --check apps/menyra-social/core/profile/self-profile-runtime-controller.js`
- `node --check apps/menyra-social/social-app.js`
- `npm run build:menyra-social:bundle`
- `git diff --check`

## Manuelle Testliste

- Business-Profil oeffnen und mehrmals zwischen Profil und Info wechseln:
  Die Card soll nicht sichtbar in der Hoehe springen.
- Oben rechts Map, TikTok und Instagram pruefen: runde Buttons sollen nicht
  leer ohne Icon stehen.
- Business-Profil mit Titelbild hart refreshen und pruefen, dass das Titelbild
  nicht kurz auf neutralen Fallback springt.
- Dasselbe nach einmaligem Laden erneut refreshen, damit der lokale Last-Good-
  Cache geprueft wird.
- Business-Profil ohne Titelbild oeffnen: neutraler Fallback soll weiter
  erscheinen.
- Profilbild-Upload kurz gegenpruefen; der bestehende Avatar-Ladeweg muss
  unveraendert funktionieren.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Rest-Risiko: Codex hat gemaess Projektregel keinen Browser-/Smoke-Test
ausgefuehrt. Die visuelle Refresh-Stabilitaet muss im lokalen Browser manuell
geprueft werden, besonders beim ersten Cold-Start ohne bereits lokalen
Titelbild-Cache.
