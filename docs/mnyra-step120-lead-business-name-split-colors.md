Status: CURRENT
Last updated: 2026-06-22

# Schritt 120 - Lead Business Name Split Colors

## Ziel

Im Lead-Formular soll der Business-Name fuer die Landing getrennt steuerbare
Farben bekommen:

- `Farbe Teil 1`
- `Farbe Teil 2`

Die Werte werden als Hex-Farben wie `#111827` oder `#4f46e5` eingegeben.

## Befund

- Bisher gab es nur `businessNameColor`.
- Dadurch konnte der Landing-Business-Name nur insgesamt eingefaerbt werden.
- Die UI stand ausserdem im Lead-Daten-Block, nicht als eigener Bereich direkt
  vor den Kundendaten.

## Geaendert

- Das Lead-Formular rendert einen eigenen Bereich `Business Name Farben`
  direkt zwischen Lead-Daten und `Kunden Daten`.
- Der Bereich enthaelt zwei Hex-Felder:
  `leadBusinessNameColorPart1` und `leadBusinessNameColorPart2`.
- Beim Speichern werden die Farben in Lead, Restaurant, Business-User-Bootstrap
  und Public-Meta geschrieben.
- Bei Lead-zu-Kunde-Umwandlung werden die Farben uebernommen.
- App-interne Landing und separate Lead-Landing rendern den Business-Namen in
  zwei farbigen Teilen.
- Bestehendes `businessNameColor` bleibt als Rueckwaerts-Fallback erhalten.
- Social-Bundle und App-Build-Token wurden nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/_shared/crm-lazy-renderers.js`
- `apps/menyra-social/core/crm/crm-runtime-controller.js`
- `apps/menyra-social/core/leads/lead-save-utils.js`
- `apps/menyra-social/core/leads/lead-convert-utils.js`
- `apps/menyra-social/core/leads/lead-modal-render-utils.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/lead-landing/index.html`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-*.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-*.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step120-lead-business-name-split-colors.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Routing, QR, Cart, Orders, Menu-Daten oder Firebase Rules.
- Keine Aenderung am Business-Header-Layout ausserhalb der bereits bestehenden
  Landing-Farbweitergabe.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/_shared/crm-lazy-renderers.js`
- `node --check apps/menyra-social/core/crm/crm-runtime-controller.js`
- `node --check apps/menyra-social/core/leads/lead-save-utils.js`
- `node --check apps/menyra-social/core/leads/lead-convert-utils.js`
- `node --check apps/menyra-social/core/leads/lead-modal-render-utils.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `git diff --check`

## Manuelle Testliste

- Lead erstellen oder bearbeiten und pruefen, dass `Business Name Farben`
  direkt vor `Kunden Daten` angezeigt wird.
- `Farbe Teil 1` z.B. auf `#111827` und `Farbe Teil 2` z.B. auf `#4f46e5`
  setzen, speichern und Lead-Landing oeffnen.
- Mehrteiligen Namen pruefen, z.B. `70s pastry and bakery`: vorderer Teil und
  letzter Namensteil sollen unterschiedliche Farben haben.
- Einteiligen Namen pruefen, z.B. `kosovamanswear`: nur Teil 1 soll sichtbar
  sein; Teil 2 darf nichts zusaetzlich anzeigen.
- Lead als Kunde aktivieren und pruefen, dass die Farben im Kundenprofil /
  Landing erhalten bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Die Aenderung ist auf Lead-Farbsteuerung, Datenweitergabe und Landing-Rendern
begrenzt. Ungueltige Hex-Werte fallen auf sichere Defaults zurueck.
