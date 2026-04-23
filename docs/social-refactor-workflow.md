# MNYRA Social Refactor Workflow (Stabilitaet zuerst, UI spaeter)

## Reihenfolge ist fix
1. Erst Stabilitaet, Geschwindigkeit, Aussortieren, Struktur.
2. UI-Verbesserungen und neue Ideen kommen erst ganz am Ende.

## Ziel
`apps/menyra-social/social-app.js` kontrolliert in Module zerlegen, Altlasten entfernen und Start/Reload stabilisieren, ohne Verhaltensverlust.

## Harte Regeln
1. Kein Big-Bang-Refactor.
2. Jeder Commit ist deploybar und reversibel.
3. Pro Commit ein Scope.
4. Zuerst Move/Extract/Cleanup, dann Optimierung.
5. Nach jedem Schritt: Check -> Smoke -> Commit -> Push.

## Phase 0 - Baseline einfrieren
1. Referenz-Commit sichern.
2. Smoke-Matrix fixieren:
   - Safari Reload: kein Header unter Notch, kein Jump.
   - Auth: kein Login/Avatar-Flash.
   - Feed instant.
   - Shop: Scroll oeffnet keinen Drawer.
   - Drawer/Profile/Map/Chat/Login/Logout.
3. Performance-Baseline notieren:
   - First Paint
   - TTI-Gefuehl
   - Scroll-Stabilitaet

## Phase 1 - Aussortieren (vor grossem Split)
1. Inventur von `social-app.js`: Utilities, Core, Feature-Bloecke markieren.
2. Unnoetigen/alten Code identifizieren (unused Funktionen, Legacy-Pfade, doppelte Helper).
3. Entfernen in kleinen Commits mit null Verhaltensaenderung pro Schritt.

## Phase 2 - Architektur-Skelett
1. Struktur festziehen:
   - `apps/menyra-social/_shared/`
   - `apps/menyra-social/core/`
   - `apps/menyra-social/features/`
2. Shared-Utilities zentralisieren (Storage gestartet).
3. Import-Pfade stabil halten.

## Phase 3 - Core splitten
1. `core/state.js`
2. `core/bootstrap.js`
3. `core/render.js`
4. `core/events.js`

## Phase 4 - Feature splitten (niedrig -> hoch Risiko)
1. Header/Drawer
2. Auth/Profile
3. Feed
4. Shop
5. Chat
6. Map
7. CRM (Leads/Staff/Customers/Orders)

## Phase 5 - Stabilitaetshaertung
1. Firestore Input/Output Validierung.
2. Race-Condition Guards (Auth/Render/Realtime).
3. Listener-Lifecycle sauber (subscribe/unsubscribe).
4. Zentrales Error-Logging pro Feature.

## Phase 6 - Performance
1. Lazy-Loading fuer schwere Bereiche.
2. Render-Batching und gezielte DOM-Updates.
3. Event-Delegation vereinheitlichen.
4. Cache-Strategien finalisieren (Avatar/Logo/Feed-Snapshots).

## Phase 7 - Erst jetzt UI und neue Ideen
1. Safe-Area/Spacing/Visual Consistency feinjustieren.
2. Neue Produktideen implementieren.
3. UX-Polish erst auf stabiler Basis.

## Test-Gate pro Commit
1. `node --check` fuer alle geaenderten `.js`.
2. Smoke-Matrix kurz testen (iOS Safari + Samsung Browser/Chrome).
3. Bei Fehlern sofort Fix oder `git revert <commit>`.
4. Nur gruene Schritte werden gepusht.

## Codex-Effizienz Regeln
1. Zielgroesse pro Datei 200-500 Zeilen (Ausnahmen dokumentieren).
2. Pro Prompt nur ein Refactor-Schritt.
3. Immer Datei+Funktion benennen.
4. Keine langen Monolith-Diffs mehr.

## Definition of Done
1. Kein Start/Reload/Auth/UI-Glitch.
2. Kritische Flows stabil auf iOS Safari und Samsung Android.
3. `social-app.js` deutlich kleiner, klar modular.
4. Neue Features lassen sich ohne Monolith-Eingriff erweitern.
