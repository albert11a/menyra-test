Status: CURRENT
Last updated: 2026-05-02

# Schritt 25: Public Website Startup-Diaet

## Ziel

Der oeffentliche Smartphone-Web-Start fuer `/:slug`, `/:slug/menu` und
oeffentliche User-/Landing-Pfade soll weniger Nebenarbeit ausloesen, ohne die
sichtbare Produktoberflaeche, QR-URLs, Warenkorb-/Tischlogik oder Routing-
Wahrheit zu veraendern.

Dieser Schritt wurde auf Nutzerwunsch bewusst auf Branch `fixmai` umgesetzt.

## Umsetzung

- Der Social-App-Build-Token wurde auf
  `2026-05-02-public-startup-diet-01` angehoben, damit die geaenderten
  Startpfad-Module nicht unter dem alten Cache-Key weiterlaufen.
- `index.html` markiert oeffentliche Website-Starts frueh ueber
  `window.__MENYRA_SOCIAL_PUBLIC_WEBSITE_STARTUP__`.
- Firestore nutzt fuer diesen oeffentlichen Website-Start
  `memoryLocalCache()` statt `persistentLocalCache()` mit Multi-Tab-Manager.
  App- und nicht-oeffentliche Starts behalten den persistenten Multi-Tab-Cache.
- Der Body-`MutationObserver` fuer UI-Chrome beobachtet nicht mehr
  `childList: true, subtree: true`, sondern nur noch Body-Klassen. Updates
  werden auf einen Frame zusammengefasst.
- Die Lucide-Fallback-Library wird auf Public-Website-Starts deutlich spaeter
  geladen. Der zusaetzliche DOM-Observer fuer Lucide-Ziele startet erst, wenn
  Lucide wirklich geladen wurde.
- Alle bisher fehlenden literal verwendeten Inline-Icons wurden in die lokale
  Inline-Icon-Liste aufgenommen, damit der normale Public-Render nicht wegen
  einzelner Icons die volle `lucide.min.js`-Library laden muss.
- PWA-Service-Worker-Registration wird fuer Public-Website-Starts weiter nach
  hinten geschoben. Die automatische Service-Worker-Updatepruefung laeuft nicht
  mehr alle 3 Minuten, sondern alle 30 Minuten.
- Runtime-Diagnostics inklusive Media-Edge-Probe laufen im Public-Website-Start
  spaeter im Idle-/Timeout-Fenster statt direkt nach dem ersten Render-Frame.

## Bewusst Nicht Geaendert

- Keine sichtbaren Layout-, Farb-, Typografie-, Spacing- oder UX-Aenderungen.
- Kein neuer Public-Entry und keine breite Code-Splitting-Umstellung.
- Keine Aenderung an QR-/Table-/Cart-/Order-Verhalten.
- Keine Functions-, Firestore-Rules-, Datenmodell- oder Public-Visibility-
  Aenderung.
- Kein Menu-Bootstrap-Limit und keine Render-Chunking-Umstellung in diesem
  Schritt.
- Keine Playwright-, Smoke- oder Browser-Laeufe durch Codex.

## Validierung

- `node --check` fuer geaenderte JavaScript-Module.
- Statische Pruefung, dass im Social-Pfad keine alten
  `firebase-config.js?v=2026-03-10-startup-1`-Imports mehr stehen.
- Statische Pruefung, dass alle literal verwendeten Icons im Social-App-Code
  jetzt inline abgedeckt sind.
- `git diff --check`.

## Manuelle Testliste

- Auf einem schwachen Smartphone `/:slug` kalt oeffnen: Header, Profilinhalt
  und Posts muessen wie vorher sichtbar werden.
- `/:slug/menu` kalt oeffnen: Menu muss wie vorher erscheinen; kein zusaetzlich
  sichtbarer Designwechsel.
- Echten QR-Link mit `src=qr` und `table` scannen: Profilseite muss wie vorher
  mit offenem Menu starten, Warenkorb/Tisch muss erhalten bleiben.
- Nach Login normale App-Pfade wie `/feed`, `/profile`, `/notifications` kurz
  pruefen, weil diese weiterhin persistenten Firestore-Cache und PWA/Push
  brauchen.
- Seite mindestens 30 Sekunden offen lassen und einmal wieder aktivieren:
  keine sichtbare Reload-Schleife oder UI-Spruenge.

## Bekannte Rest-Risiken

- Der grosse statische `social-app.js`-Startpfad bleibt in diesem Schritt
  grundsaetzlich bestehen. Ein echter leichter Public-Web-Entry ist weiterhin
  der groesste naechste Performance-Hebel.
- Firestore nutzt im Public-Website-Start keinen persistenten Public-Cache mehr.
  Das ist fuer leichte Gaststarts gewollt, sollte aber auf echten Geraeten mit
  Login-/Rueckkehr-Szenarien manuell gegengeprueft werden.
- PWA/Push wird auf Public-Website-Starts spaeter initialisiert. Das soll
  normale Besucher entlasten; Push-Aktivierung muss nach Login/App-Nutzung
  manuell gegengeprueft werden.

## Bewertung

`bestanden mit Rest-Risiko`: Der Schritt reduziert mehrere bekannte
Startup-Nebenlasten mit niedrigem Blast Radius und ohne sichtbare UI-Aenderung.
Launch-ready ist Mnyra dadurch noch nicht, weil der schwere Public-JS-Entry,
Menu-Bootstrap-Groesse, Render-Chunking, SEO-/Meta-Basis und echte Mobile-
Regression weiterhin separate Schritte brauchen.
