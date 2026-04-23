Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 16: Public Route Contract Hardening

## Schrittziel

Den oeffentlichen Business-Web-Profilpfad vertraglich haerten, damit genau ein
stabiler Public-Pfad mit klaren Surface-URLs laeuft:

- `/:slug` (Profil/Posts-default)
- `/:slug/posts`
- `/:slug/menu`

mit kompatiblen Legacy-Einstiegen, aber ohne konkurrierende aktive Laufpfade.

## Scope

Geaendert wurden nur:

- `apps/menyra-social/core/router/public-business-route-utils.js`
- `apps/menyra-social/core/auth/initial-route-state.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/index.html`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step16-public-route-contract-hardening.md`

## Hauptursachen in diesem Schritt

1. Route-Truth konnte bei Business-Pfaden durch alte Query-Parameter
   (`r`, `top`, Alias-Keys) konkurrieren.
2. Initial-Route-Aufbau priorisierte Query-`restaurantId` vor eindeutigem
   Business-Path.
3. Beim Wechsel `/:slug/menu` -> Posts blieb URL nicht immer explizit auf
   `/:slug/posts`, obwohl genau diese Surface aktiv war.

## Umsetzung

### A. Startup-Route normalisiert Business-Pfade auf kanonischen Vertrag

Datei: `index.html`

- Fuer `pathRoute.kind === "business"` wird der URL-Kontext vor Bootstrap-
  Verwendung normalisiert:
  - Path auf `pathRoute.canonicalPath`
  - konkurrierende Query-IDs/-Surface-Parameter entfernt
  - kanonische Query-Keys genutzt (`src`, `table`)
  - QR-Kontext bleibt ueber `src=qr` erhalten
- Die Normalisierung erfolgt per `history.replaceState` (kein Reload).

### B. Initial-Route-Truth priorisiert Business-Path vor Query-ID

Datei: `core/auth/initial-route-state.js`

- `pendingProfileRestaurantId` wird fuer Business-Routen zuerst aus dem Path
  genommen, erst danach aus Query.
- `pendingProfileTopTab` priorisiert bei Business-Routen den Path-TopTab.
- Dadurch weniger widerspruechliche Route-Interpretation bei Refresh/Cold-Start.

### C. Expliziter Posts-Surface bei Menu -> Posts Wechsel

Dateien:

- `core/router/public-business-route-utils.js`
- `social-app.js`

- `buildCanonicalPublicBusinessPathCore(...)` erhielt `forcePostsPath`.
- Route-Sync setzt `forcePostsPath` gezielt beim Wechsel von Business-Menu-
  Surface auf Posts-Surface.
- Ergebnis: konsistente URL-Schreibung auf `/:slug/posts` in diesem Wechselpfad.

## Warum es jetzt robuster ist

- Weniger konkurrierende Route-Wahrheiten zwischen Path und Query.
- Klarerer Surface-Vertrag fuer Refresh (`menu` bleibt `/:slug/menu`,
  Posts koennen explizit als `/:slug/posts` geschrieben werden).
- Legacy-Einstiege bleiben kompatibel, aber die laufende Runtime wird frueh auf
  den kanonischen Vertrag zurueckgefuehrt.

## QR-Invariante

Unveraendert:

- QR-URLs bleiben kompatibel.
- QR-Logik bleibt unveraendert.
- Tisch-/Bestellkontext bleibt unveraendert.
- QR -> Profil mit offenem Menu bleibt erhalten.

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Keine Aenderung an `/login`.
- Keine Aenderung an Root `/`.
- Keine Firebase Functions.
- Keine Firestore Rules.
- Keine anderen Produktbereiche ausserhalb Public-Web-Profilpfad.
- Kein Smoke-Test, kein Playwright.

## Technische Selbstpruefung

- `node --check apps/menyra-social/core/router/public-business-route-utils.js`
- `node --check apps/menyra-social/core/auth/initial-route-state.js`
- `node --check apps/menyra-social/social-app.js`

## Manuelle Testliste

1. `/:slug/menu` aufrufen, Refresh: Menu bleibt offen und Produkte erscheinen.
2. Auf Menu-Surface auf Posts wechseln, URL wird auf `/:slug/posts` geschrieben;
   danach Refresh: Posts bleiben offen.
3. `/:slug` direkt aufrufen, Refresh: Profil/Posts-default bleibt stabil.
4. Legacy-URL (z. B. altes Business-Pattern) aufrufen:
   URL wird auf kanonischen Business-Path normalisiert, Profil bleibt erreichbar.
5. QR-Link aufrufen: Profil mit offenem Menu bleibt unveraendert inkl. Tischkontext.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
