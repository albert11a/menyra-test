Status: CURRENT
Last updated: 2026-05-02

# Schritt 26: Discovery Map Profile Data Isolation

## Ziel

Wenn ein Gast oder Nutzer ueber die Entdecker-Karte ein Business-Profil
oeffnet, muessen Profil, Menu und Fokus immer zum ausgewaehlten Business
gehoeren. Ein vorheriger Public-/Web-Direct-Kontext darf keine Restaurant-ID,
RoutePayload- oder Menu-Wahrheit in das neu geoeffnete Kartenprofil tragen.

Dieser Schritt wurde auf Nutzerwunsch auf Branch `fixmai` umgesetzt.

## Befund

Der Profilwechsel ueber die Karte konnte einen alten Web-Direct-Kontext
weiter als sichtbaren Zielkontext behalten. Besonders kritisch war, dass ein
neues Profil ohne eigenen `canonicalRestaurantId` den alten
`canonicalRestaurantId` aus dem bisherigen RoutePayload uebernehmen konnte.
Dadurch konnte z. B. ein Besuch von `moka-coffee` intern weiter auf den alten
Casarita-Zielkontext zeigen und fremde Menu-/Fokusdaten als passend behandeln.

## Umsetzung

- `showPublicProfile` nutzt den bisherigen RoutePayload nur noch dann als
  Canonical-Fallback, wenn das eingehende Profil wirklich dasselbe sichtbare
  Profil ist.
- Beim Wechsel auf ein anderes Business-Profil werden stale Public-Menu- und
  Public-Fokusdaten neutralisiert, wenn sie nicht zu den neuen sichtbaren
  Ziel-IDs passen.
- Ein alter `__webDirectEntry` wird deaktiviert, sobald ein neues Profil ohne
  gueltigen Web-Direct-Entry angezeigt wird.
- Inaktive `__webDirectEntry`-Werte werden nicht mehr als sichtbare Ziel-IDs
  fuer Menu-/Fokus-Ensure, Session-Loads, Bootstrap, Startup-Gates,
  Route-Sync oder Menu-Render-Fallbacks verwendet.
- Ein gezielter Node-Test deckt den Wechsel von einem alten Business-Kontext
  auf ein neues Kartenprofil ab.

## Bewusst Nicht Geaendert

- Keine sichtbaren UI-, Design-, Layout-, Farb-, Typografie- oder Spacing-
  Aenderungen.
- Keine Aenderung an Entdecker-Karten-Design, Pin-UI oder Profil-Layout.
- Keine Firestore-Rules-, Functions-, Datenmodell- oder Public-Visibility-
  Aenderung.
- Keine QR-, Table-, Cart- oder Order-Logik geaendert.
- Keine Playwright-, Smoke- oder Browser-Laeufe durch Codex.

## Validierung

- `node --check` fuer alle geaenderten JavaScript-Module.
- `node --test tests/public-profile-runtime-controller.test.mjs`.
- `node --test tests/public-menu-surface-state-utils.test.mjs`.
- `git diff --check`.

## Manuelle Testliste

- Entdecker-Karte oeffnen und `moka-coffee` besuchen: Profil muss Moka zeigen.
- Im geoeffneten Moka-Profil auf Menu wechseln: Menu darf keine Casarita-
  Artikel zeigen.
- Danach ein anderes Business ueber die Karte oeffnen und direkt Menu pruefen:
  es duerfen nur Daten dieses Business erscheinen.
- Zur Sicherheit einmal von `/:slug/menu` eines Business zur Entdecker-Karte
  zurueck und dann ein anderes Kartenprofil oeffnen.
- QR-Link mit `src=qr` und `table` fuer ein Business pruefen: Menu-/Table-
  Kontext muss weiterhin erhalten bleiben.

## Bekannte Rest-Risiken

- Die Ursache fuer diesen konkreten falschen Menu-Kontext ist technisch
  abgesichert, aber manuelle Geraetepruefung bleibt notwendig, weil der
  Kartenpfad von echten Daten, Slugs und vorhandenen Canonical-IDs abhaengt.
- Dieser Schritt verbessert Datenisolation und Launch-Sicherheit, ersetzt aber
  keine vollstaendige Public-Visibility-/SEO-/Performance-Launch-Haertung.

## Bewertung

`bestanden mit kleinem Rest-Risiko`: Der Karten-Profilwechsel ist gegen stale
Restaurant-Kontexte gehaertet. Das ist ein Launch-relevanter Korrektheitsfix,
aber Mnyra bleibt insgesamt noch nicht launch-ready, weil weitere Public-
Contract-, Performance-, SEO- und manuelle Smartphone-Regressionsthemen offen
sind.
