Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 15: Public Web Profile Speed & Reliability Overhaul

## Schrittziel

Den oeffentlichen Web-Profilpfad fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
als zusammenhaengenden Kernpfad vereinfachen, damit Content frueher und ruhiger
erscheint, ohne QR-Flow zu veraendern.

## Scope

Geaendert wurden nur diese Dateien:

- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step15-public-web-profile-speed-reliability-overhaul.md`

## Phase 1: Vollanalyse (A bis Z)

### Route-Kontext, Slug-Aufloesung, kanonische `restaurantId`

Normaler Kern:

- Route wird frueh geparst (`/:slug`, `/:slug/posts`, `/:slug/menu` inkl. Source).
- Web-Direct-Entry seedet Profilsicht und Route-Payload.
- Kanonische `restaurantId` wird im Kernpfad bereits als Ziel genutzt.

Unnoetig schwer:

- Slug-/Lookup-/kanonische IDs wurden in mehreren Schichten teils strikt getrennt
  verglichen (Open-Flow, Ensure-Cluster, Menu-/Focus-Surface).
- Derselbe sichtbare Screen konnte dadurch als neuer Zielkontext gewertet werden.

### Bootstrap, Direct-Entry, Open-Flow

Normal:

- Route-first Loading-State wird frueh gesetzt (Header/Profil sichtbar).
- Danach folgen Posts/Menu/Fokus-Ensures.

Unnoetig schwer / blockierend:

- Im normalen Web-Direct-Menu-First-Pfad lief nach seeded Route-Snapshot oft
  trotzdem noch ein zusaetzlicher schwerer Live-Resolve-Abschnitt, obwohl
  fuer den ersten stabilen Screen bereits genug Wahrheit vorhanden war.

### Sichtbarer Public-Profile-/Header-/Posts-/Menu-/Fokus-State

Normal:

- Header darf frueh sichtbar sein.
- Menu/Fokus/Post-Truth werden separat aufgebaut.

Blockierend:

- Dedupe und Truth-Matching waren an mehreren Stellen zu streng auf exakt eine
  ID gebunden.
- Beim Slug->kanonisch Uebergang konnten Ensures/Loader erneut anspringen und
  zweite sichtbare Ladephasen ausloesen.

### Ensure-Pfade, Loader, Fallbacks, Reentry, Listener

Normal:

- Public-Gast bleibt read-once-orientiert.
- Realtime-Menu-Meta-Listener fuer Public-Gast bleibt grundsaetzlich aus.

Blockierend:

- Menu- und Fokus-Truth-Matching sowie Menu-Fallback-Entscheidungen konnten den
  aktiven Surface bei ID-Wechsel als "nicht passend" einstufen.
- Dadurch entstanden Reentry-Loads und sichtbares Pendeln im selben Screen.

Symptome (nicht Hauptursache):

- zweite `Menu wird geladen`-Phase,
- sichtbares Wechseln zwischen Fokus-/Menu-Ladezustaenden,
- schwerer Refresh/Cold-Start-Eindruck.

## Priorisierung der Ursachen

1. Wichtigste Ursache:
   Striktes ID-Matching ueber mehrere Ebenen (Ensure/Loader/Render) statt
   einheitlichem Surface-Zielkontext fuer denselben sichtbaren Public-Screen.
2. Zweitwichtigste Ursache:
   Zu schwerer Open-Flow im Web-Direct-Menu-First-Fall trotz seeded Route-Wahrheit.
3. Drittwichtigste Ursache:
   Unvollstaendige Dedupe-Strategie bei Posts/Fokus/Menu-Ensures im Slug->Canonical-Handoff.
4. Weitere relevante Ursachen:
   konservativer Canonical-Resolver (zusaetzlicher Profil-Doc-Resolve trotz
   bereits vertrauenswuerdiger Route-Hints) und inkonsistente Fallback-Entscheidungen.

## Phase 2: Umsetzung (saubere Vereinfachung)

### A. Open-Flow im normalen Web-Direct-Menu-Pfad gekuerzt

Datei: `profile-open-flow-utils.js`

- Nach seeded Loading-Render wird im normalen Web-Direct-Menu-First-Pfad
  (nicht QR) kurzgeschlossen, wenn Route-Snapshot + Identity-Seed + kanonische
  ID bereits vorliegen.
- Das entfernt unnoetige weitere schwere Resolve-Schritte im First-Pass.

### B. Kanonische ID-Hinweise frueher vertrauen

Datei: `profile-business-menu-runtime-cluster.js`

- Resolver nutzt jetzt Route-/Snapshot-/WebDirect-Hints fuer
  `canonicalRestaurantId` als zusaetzliche Vertrauensbasis.
- Dadurch werden unnoetige zweite Profil-Doc-Resolves im sichtbaren Pfad reduziert.

### C. Posts-Ensure auf sichtbaren Surface-Kontext dedupliziert

Datei: `profile-business-menu-runtime-cluster.js`

- Fuer Posts wurde dieselbe Surface-Dedupe-Idee wie bei Menu/Fokus umgesetzt.
- Ein laufender Ensure fuer denselben sichtbaren Screen wird nicht erneut
  gestartet, nur weil der Eingangsschluessel von Slug auf kanonische ID wechselt.

### D. Menu-/Fokus-Render auf gemeinsame Surface-Target-Ids gehoben

Datei: `profile-menu-focus-render-controller.js`

- Menu-Truth/Fokus-Truth nutzen jetzt Surface-Target-Matching statt nur
  `state.*.restaurantId === restaurantId`.
- Fokus-Auto-Ensure laeuft nur, wenn Fokus wirklich nicht zur aktuellen
  sichtbaren Surface gehoert.
- Ziel: weniger sichtbares Pendeln, ruhigere erste stabile Darstellung.

### E. Menu-Loader/Fallbacks erkennen denselben sichtbaren Screen robuster

Datei: `session-data-runtime-controller.js`

- Menu-Load-Entscheidungen (`hasVisibleMenuSeed`, `keepCurrentItems`,
  Error-Fallback) nutzen jetzt Surface-Matching gegen sichtbare Target-Ids.
- Dadurch weniger unnoetiges Leeren/Neuaufbauen bei Slug->Canonical-Uebergang.

## Warum der Pfad jetzt leichter und zuverlaessiger ist

- Ein oeffentlicher Surface-Kontext wird durchgaengiger gleich bewertet.
- Weniger doppelte Resolve-/Ensure-Pfade fuer denselben sichtbaren Screen.
- Weniger sichtbare zweite/dritte Ladephase im selben Refresh.
- Public-Gast bleibt read-once-orientiert, ohne Request-/Listener-Sturm.

## QR-Invariante

Bewusst unveraendert:

- QR-URLs
- QR-Logik
- Tisch-/Bestellkontext
- QR -> Profil mit offenem Menu

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- `/login` unveraendert.
- Root `/` unveraendert.
- Keine Firebase Functions.
- Keine Firestore Rules.
- Keine anderen Produktbereiche ausserhalb Public-Web-Profilpfad.
- Kein Smoke-Test, kein Playwright.

## Technische Selbstpruefung

- `node --check apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`

## Manuelle Testliste

1. `/:slug` hard refresh: Header + Posts erscheinen ruhig und ohne sichtbare Reentry-Spruenge.
2. `/:slug/posts` hard refresh: Posts erscheinen zuverlaessig, Tab bleibt klickbar.
3. `/:slug/menu` hard refresh: Produkte erscheinen (wenn vorhanden) ohne doppelte sichtbare Menu-Loading-Phase.
4. Zwischen `/:slug`, `/:slug/posts`, `/:slug/menu` wechseln: keine Lade-Schleifen, Menu-/Posts-Tab bleiben klickbar.
5. QR-Link oeffnen: landet weiter im Profil mit offenem Menu, Tisch-/Bestellkontext bleibt korrekt.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
