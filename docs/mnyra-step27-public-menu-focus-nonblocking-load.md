Status: CURRENT
Last updated: 2026-05-02

# Schritt 27: Public Menu Focus Nonblocking Load

## Ziel

Nach einem Profilwechsel ueber die Entdecker-Karte soll `Menu wird geladen`
nicht weiter sichtbar bleiben, wenn die eigentlichen Menu-Items bereits geladen
sind und nur noch Public-Fokus-/Angebotsdaten ausstehen.

Dieser Schritt wurde auf Nutzerwunsch auf Branch `fixmai` umgesetzt.

## Befund

Der falsche Restaurant-Kontext aus Schritt 26 war abgesichert, aber der
Menu-Screen konnte weiterhin zu lange im Loading-Zustand bleiben. Der Grund:
Bei Cafe-/Food-Profilen behandelte der Renderer Public-Fokus/Angebote als
koordinierte Voraussetzung fuer das sichtbare Menu. Wenn Focus langsam war,
leer lief oder neu abgefragt wurde, blieb das gesamte Menu sichtbar bei
`Menu wird geladen`, obwohl Menu-Items bereits bereitstehen konnten.

## Umsetzung

- Public-Fokus/Angebote blockieren die sichtbare Menu-Ausgabe nicht mehr.
- Das Menu rendert, sobald `menuSurfaceState.menu` bereit ist.
- Fokus/Angebote werden danach weiter optional geladen und koennen spaeter
  erscheinen, ohne den Menu-Screen als Ganzes im Loading-Zustand zu halten.
- Der Public-Menu-Ensure-Pfad wartet nicht mehr auf eine bestehende oder neue
  Fokus-Anfrage, bevor er den Menu-Load als erledigt behandelt.
- Fokus wird erst nach erfolgreichem Menu-Load nachgelagert gestartet, sofern
  Menu-Items vorhanden sind.

## Bewusst Nicht Geaendert

- Keine Layout-, Farb-, Typografie-, Spacing- oder Design-Aenderungen.
- Keine Aenderung an Menu-Item-Daten, Fokus-Datenmodell oder Firestore-Rules.
- Keine QR-, Table-, Cart- oder Order-Logik geaendert.
- Keine Playwright-, Smoke- oder Browser-Laeufe durch Codex.

## Validierung

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`.
- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`.
- `node --test tests/public-menu-surface-state-utils.test.mjs`.
- `node --test tests/public-profile-runtime-controller.test.mjs`.
- `git diff --check`.

## Manuelle Testliste

- Ueber die Entdecker-Karte `moka-coffee` oeffnen und auf Menu wechseln:
  Menu-Items sollen erscheinen, sobald das Menu geladen ist.
- Pruefen, dass keine fremden Menu-Items erscheinen.
- Kurz warten: Fokus/Angebote duerfen spaeter erscheinen, sollen das Menu aber
  nicht blockieren.
- Ein Business ohne Fokus/Angebote pruefen: Menu darf nicht dauerhaft laden.
- QR-Link mit `src=qr` und `table` pruefen: Menu und Tischkontext muessen
  weiter funktionieren.

## Bekannte Rest-Risiken

- Wenn das eigentliche Public-Menu oder die Canonical-ID-Aufloesung selbst
  langsam ist, bleibt `Menu wird geladen` weiterhin sichtbar. Dieser Schritt
  entfernt nur die unnoetige Blockade durch nachgelagerte Fokusdaten.
- Das spaetere Erscheinen von Fokus/Angeboten kann einen kleinen Inhaltszuwachs
  ausloesen. Das ist bewusst akzeptiert, damit das eigentliche Menu frueher
  nutzbar wird.

## Bewertung

`bestanden mit kleinem Rest-Risiko`: Der haeufige Fall "Menu ist bereit, aber
Fokus haelt den Screen im Loading" ist entfernt. Das verbessert die gefuehlte
Menu-Geschwindigkeit nach Kartenprofilwechseln, ohne sichtbares Design oder
Produktlogik umzubauen.
