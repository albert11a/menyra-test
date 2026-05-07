Status: CURRENT
Last updated: 2026-05-07

# Schritt 33: Public-Bootstrap Menu/Fokus Seed und Loading-Fail-Safe

## Ziel

Menu und Fokus sollen auf Direct-Public-Menu-Starts so frueh wie moeglich
sichtbar sein und nie dauerhaft bei `Menu wird geladen` stehen bleiben.

## Befund

Der Header kann sehr frueh erscheinen, weil Route-/Bootstrap-Daten bereits
Identitaet liefern. Die Cloud Function liefert fuer Direct-Public-Routen auch
Menu- und Fokus-Snapshot-Daten im `businessSnapshot`.

Im Client wurden diese Menu-/Fokus-Items im Bootstrap-Normalizer aber wieder
verworfen:

- `menuItemsRaw = []`
- `focusItemsRaw = []`
- `menuState = "unknown"`
- `focusState = "unknown"`

Dadurch musste der sichtbare Public-Menu-Screen trotz vorhandener Bootstrap-
Wahrheit nochmal auf Live-Reads warten.

Zusaetzlich konnte ein fehlgeschlagener `prefetchOnly`-Menu-Read bei einem
gleichzeitig sichtbaren Commit als `truthState: "unknown"` ohne Error in den
State kommen. Das kann vom Surface-Resolver weiter als `loading` interpretiert
werden.

## Geaendert

- `businessSnapshot.menu.items` und `businessSnapshot.focus.items` werden im
  Client-Bootstrap-Normalizer jetzt gelesen und normalisiert.
- Menu-/Fokus-Truth-State und Count werden aus dem Bootstrap-Snapshot
  uebernommen, sofern die Items/Truth konsistent sind.
- Ein sichtbarer Commit aus einem fehlgeschlagenen Menu-Prefetch wird jetzt als
  Error-State gesetzt statt als `unknown` ohne Fehler.

## Warum das gegen Springen hilft

Wenn Bootstrap Menu und Fokus liefert, werden beide zusammen vor dem sichtbaren
Menu-Render in denselben Public-Surface-State gelegt. Dadurch muss Fokus nicht
erst nach dem Menu spaet ueber dem Menu eingeschoben werden.

Wenn Bootstrap nicht rechtzeitig kommt oder keine Items liefert, bleibt der
bestehende Live-Read-/Prefetch-Pfad aktiv. In diesem Fall kann der Header
technisch weiterhin frueher sein als Menu/Fokus, aber das Menu darf nicht mehr
endlos in `loading` bleiben.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/bundled/entry/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step33-public-bootstrap-menu-focus-seed.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderung.
- Keine Firebase Rules.
- Keine Functions-Aenderung.
- Keine Datenpfade.
- Keine QR-, Warenkorb-, Tisch- oder Produktlogik-Aenderung.
- Kein Smoke-Test, kein Playwright.

## Validierung

- `node --check apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `npm run build:menyra-social:bundle`
- `node --check apps/menyra-social/bundled/entry/social-app.js`
- `git diff --check`

## Manuell testen

- `/:slug/menu?sw-reset=1` einmal laden, danach normale URL erneut oeffnen.
- `/:slug/menu` kalt laden: Menu soll nicht dauerhaft bei `Menu wird geladen`
  bleiben.
- Wenn Focus-Items vorhanden sind: Fokus soll nicht spaet sichtbar die Menu-
  Liste nach unten schieben.
- QR-Link oeffnen: Menu bleibt offen, Tisch-/Warenkorb-Kontext bleibt korrekt.
- Entdecker-Karte zu anderem Business oeffnen: kein altes Menu/Focus aus dem
  vorherigen Profil.

## Bewertung

Bestanden mit kleinem Rest-Risiko.

Rest-Risiko bleibt, weil ein komplett gleicher First-Paint wie der Header nur
dann erreichbar ist, wenn Bootstrap oder Cache rechtzeitig Menu/Fokus liefert.
Ohne Bootstrap/Cache bleiben Menu und Fokus echte Public-Datenreads.
