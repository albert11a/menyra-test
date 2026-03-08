# MNYRA Social Refactor Workflow (Stabil, Skalierbar, Codex-friendly)

## Ziel
`apps/menyra-social/social-app.js` schrittweise von einem Monolithen in klare Module aufteilen, ohne Verhaltensverlust, ohne Performance-Regressions, mit sauberem Test-Gate pro Schritt.

## Harte Regeln (immer)
1. Kein Big-Bang-Refactor.
2. Jeder Commit ist deploybar.
3. Pro Schritt nur ein klarer Scope (max 1 Feature-Bereich).
4. Zuerst Verhalten stabil halten (Move/Extract), erst danach Optimierung.
5. Nach jedem Schritt: Syntax-Check + Smoke-Check + Push.

## Phasen

### Phase 0 - Baseline sichern
1. Aktuellen Stand als Referenz-Commit markieren.
2. Smoke-Matrix definieren (manuell):
   - Safari Reload: Header nicht unter Notch, kein Jump.
   - Auth: kein Login/Avatar-Flash.
   - Feed instant sichtbar.
   - Shop scroll/tap: kein Drawer beim Scroll.
   - Drawer, Profile, Map, Chat, Logout/Login.
3. Performance-Baseline notieren (subjektiv + DevTools):
   - First Paint
   - Time to interactive Gefühl
   - Scroll smoothness

### Phase 1 - Architektur-Skelett
1. Ordnerstruktur festziehen:
   - `apps/menyra-social/_shared/`
   - `apps/menyra-social/features/`
   - `apps/menyra-social/core/`
2. Erstes risikoarmes Extract:
   - Storage/Key-Utilities aus `social-app.js` in eigenes Modul.
3. Import-Pfade stabilisieren (keine Logikänderung).

### Phase 2 - Core isolieren
1. `core/state.js`: zentrale State-Initialisierung.
2. `core/bootstrap.js`: Startsequenz + Auth-Listener.
3. `core/render.js`: Render-Loop + Suspense/Queue-Mechanik.

### Phase 3 - Feature-Splits
Reihenfolge nach Risiko (niedrig -> hoch):
1. Header/Drawer
2. Auth/Profile-Grundfunktionen
3. Feed
4. Shop
5. Chat
6. Map
7. CRM/Staff/Leads/Customers

Regel pro Feature:
1. `feature/*.state.js`
2. `feature/*.render.js`
3. `feature/*.events.js`
4. `feature/*.service.js` (Firestore/API)

### Phase 4 - Stabilitätshärtung
1. Datenvalidierung an Firestore-Grenzen.
2. Zentraler Error-Reporter (warn/error + Feature-Kontext).
3. Guardrails für Race-Conditions (Auth/Render/Realtime).

### Phase 5 - Performance-Tuning (erst dann)
1. Tab-/Feature-Lazy-Loading.
2. Event-Delegation vereinheitlichen.
3. DOM-Updates minimieren (nur diffbare Bereiche).
4. Image/Avatar Cache-Strategie finalisieren.

## Test-Gate pro Commit
1. `node --check apps/menyra-social/social-app.js`
2. Falls neue Module: `node --check` für alle geänderten `.js` Dateien.
3. Smoke-Matrix kurz durchklicken.
4. Erst dann commit + push.

## Rollback-Strategie
1. Nach jedem abgeschlossenen Schritt committen.
2. Bei Regression: sofort `git revert <commit>` (kein Hard Reset).
3. Erst nach grünem Smoke-Check mit nächstem Schritt weitermachen.

## Codex-Effizienz-Regeln
1. Kleine Dateien (Ziel 200-500 Zeilen).
2. Klare Modulnamen und Verantwortlichkeiten.
3. Pro Prompt nur 1 Refactor-Schritt.
4. Immer Datei- und Funktionsreferenzen nennen.

## Definition of Done
1. Kein spürbarer Reload/Auth/UI-Glitch.
2. Kritische Flows aus Smoke-Matrix stabil.
3. `social-app.js` deutlich kleiner, Features isoliert.
4. Neue Features können ohne Monolith-Edit ergänzt werden.
