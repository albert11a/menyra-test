Status: CURRENT
Last updated: 2026-05-07

# Schritt 34: Social-App Cache-Version nach Menu/Fokus-Fix

## Ziel

Der Fix aus Schritt 33 soll auch in normalen Desktop-Browsern sichtbar werden,
nicht nur in Handy-Inkognito oder komplett frischen Sessions.

## Befund

Handy-Inkognito funktioniert, Desktop normal aber nicht. Das spricht gegen einen
reinen Daten-/Firebase-Fehler und fuer alten Browserzustand.

Der Social-App-Build-Token stand noch auf:

- `2026-05-06-vite-prod-bundle-01`

Dieser Token wird fuer mehrere Dinge verwendet:

- Versionierte App-/PWA-Imports.
- Service-Worker-Registrierung und Cache-Name.
- Startup-Snapshot-Gueltigkeit.
- Debug-Build-Anzeige.

Nach Schritt 33 wurde das Bundle aktualisiert, aber der Versionstoken blieb
gleich. Dadurch konnte ein normaler Desktop-Browser alte SW-/Startup-Daten noch
als aktuell behandeln.

## Geaendert

- Social-App-Build-Token in `apps/menyra-social/index.html` auf
  `2026-05-07-public-menu-focus-cache-01` gesetzt.
- Public-Entry-Build-Token in Source und gebuendeltem Entry ebenfalls auf
  `2026-05-07-public-menu-focus-cache-01` gesetzt.

## Warum das sauber ist

Der Schritt aendert keine Menu-/Fokus-Produktlogik. Er sorgt nur dafuer, dass
normale Browser den neuen Stand als neue App-Version behandeln:

- Der PWA-Import bekommt eine neue `v`.
- Der Service Worker wird mit neuer `v` registriert.
- Der SW-Cache-Name wechselt.
- Alte Startup-Snapshots mit alter App-Version werden nicht mehr wiederhergestellt.

## Geaenderte Dateien

- `apps/menyra-social/index.html`
- `apps/menyra-social/social-public-entry.js`
- `apps/menyra-social/social-public-bundled-entry.js`
- `apps/menyra-social/bundled/entry/social-public-entry.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step34-social-app-cache-version-bump.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Menu-/Fokus-Logik.
- Keine Firebase Rules.
- Keine Functions.
- Keine QR-, Warenkorb-, Tisch- oder Produktlogik.
- Kein Smoke-Test, kein Playwright.

## Validierung

- Alter Build-Token kommt in `apps/menyra-social/index.html` nicht mehr vor.
- Alter Build-Token kommt in `apps/menyra-social` und `docs` nicht mehr vor.
- Neuer Build-Token kommt in `apps/menyra-social/index.html` und im Public-
  Entry vor.
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/social-public-entry.js`
- `node --check apps/menyra-social/social-public-bundled-entry.js`
- `node --check apps/menyra-social/bundled/entry/social-public-entry.js`
- `git diff --check`

## Manuell testen

- Desktop normal `/:slug/menu` laden.
- Falls noch ein alter SW aktiv ist: einmal `/:slug/menu?sw-reset=1` laden,
  danach normale URL erneut laden.
- Optional `?debug-build=1` anhaengen und pruefen, ob
  `2026-05-07-public-menu-focus-cache-01` angezeigt wird.
- Handy-Inkognito gegenpruefen: Verhalten soll gleich bleiben.

## Bewertung

Bestanden.
