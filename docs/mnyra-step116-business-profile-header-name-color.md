Status: CURRENT
Last updated: 2026-06-22

# Schritt 116 - Business Profile Header Name Color

## Ziel

Business-Profil-Header und Profil-Card sollen beim Wechsel zwischen
`Beitraege` und `Menue` stabil bleiben. Lange Business-Namen duerfen im Header
nicht mehr durch die bisherige Zwei-Wort-Aufteilung sichtbar verloren gehen.
Zusaetzlich soll bei Leads die Farbe des Business-Namens fuer die Lead-Landing
gesetzt werden koennen.

## Befund

- Der Business-Header zerlegte den Namen in zwei feste Teile:
  erstes Wort als Titel, zweites Wort als Subtitle. Weitere Woerter wurden
  nicht dargestellt; der Subtitle hatte zusaetzlich eine enge Maximalbreite.
- Im Menue-Tab wurde der Header-Mittelbereich nicht als `flex-1 min-w-0`
  reserviert. Dadurch rueckten Name/Kategorien und rechte Header-Icons enger
  zusammen.
- Die Business-Profil-Card nutzte fuer `profile` und `menu` unterschiedliche
  obere Padding-Klassen (`pt-2` vs. `pt-4`).
- Lead-Landing-Daten hatten bisher kein Feld fuer die Business-Name-Farbe.

## Geaendert

- Business-Header:
  - nutzt weiter die bestehende zweiteilige Optik, zeigt aber den ganzen
    Namen ueber `alle Woerter ausser letztes Wort` plus `letztes Wort`.
  - reserviert im Menue-Header wieder einen stabilen Mittelbereich, damit die
    rechten Icons nicht an Name/Kategorien heranrutschen.
- Business-Profil-Card:
  - nutzt fuer Business-Profil und Business-Menue denselben oberen Abstand.
- Leads:
  - Lead-Formular hat ein kleines Farbfeld `Business Name Farbe`.
  - Farbe wird als Hex-Wert in Lead, Restaurant, User-Bootstrap und Public-Meta
    mitgenommen.
  - Lead-Landing und app-interne Landing lesen `businessNameColor`.
- Social-Bundle und App-Build-Token wurden nachgezogen.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/leads/lead-modal-render-utils.js`
- `apps/menyra-social/_shared/crm-lazy-renderers.js`
- `apps/menyra-social/core/leads/lead-save-utils.js`
- `apps/menyra-social/core/leads/lead-convert-utils.js`
- `apps/menyra-social/core/crm/crm-runtime-controller.js`
- `apps/menyra-social/lead-landing/index.html`
- `apps/menyra-social/index.html`
- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-rtfumjRt.js`
- `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-DFkpV8bs.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step116-business-profile-header-name-color.md`

## Bewusst Nicht Geaendert

- Keine Aenderung an Routing, QR, Warenkorb, Orders, Menu-Logik oder Firebase
  Rules/Functions.
- Keine neue Profil- oder Header-Komponente.
- Keine Aenderung an Farben ausser dem explizit angefragten Lead-
  Business-Name-Feld.
- Keine Smoke-Tests oder Playwright-Laeufe durch Codex.

## Verifikation

- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/crm/crm-runtime-controller.js`
- `node --check apps/menyra-social/core/leads/lead-save-utils.js`
- `node --check apps/menyra-social/core/leads/lead-convert-utils.js`
- `node --check apps/menyra-social/core/leads/lead-modal-render-utils.js`
- `node --check apps/menyra-social/_shared/crm-lazy-renderers.js`

## Manuelle Testliste

- Business-Profil mit langem Namen oeffnen und Header bei `Beitraege` pruefen.
- Von `Beitraege` auf `Menue` wechseln und pruefen, dass Header-Icons,
  Name/Kategorien und Profil-Card nicht sichtbar springen.
- Langen Business-Namen mit drei oder mehr Woertern pruefen.
- Lead bearbeiten/neu anlegen, `Business Name Farbe` setzen, speichern und
  Lead-Landing oeffnen; Business-Name soll in der gewaehlten Farbe erscheinen.
- QR/Menu/Cart kurz gegenpruefen, dass die bestehenden Flows unveraendert
  bleiben.

## Bewertung

`bestanden mit kleinem Rest-Risiko`

Der Schritt ist auf Header-Layout, Profil-Card-Abstand und Lead-Landing-Farbe
begrenzt. Rest-Risiko liegt bei extrem langen Ein-Wort-Business-Namen; diese
koennen auf sehr schmalen Displays weiterhin nur gekuerzt werden, verlieren
aber nicht mehr still weitere Namensbestandteile.
