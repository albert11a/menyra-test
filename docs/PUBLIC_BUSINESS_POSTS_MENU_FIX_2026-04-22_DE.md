# Public Business Surface Fix (Posts/Menu) - 2026-04-22

## Ziel
Dieser Stand fixt die oeffentliche Business-Ansicht fuer genau zwei sichtbare Surfaces:
- `/:slug/posts`
- `/:slug/menu`

Die Loesung ist auf Launch-Kritikalitaet optimiert: kleine, gezielte Ownership-Bereinigung ohne breite System-Refactors.

## User-Probleme (vorher)
- Nach Refresh/Cold-Start auf `/:slug/menu` blieb Beitraege haeufig auf "wird geladen" oder "keine Inhalte gefunden".
- Header war sichtbar, aber Body konnte leer bleiben.
- Warmes Tab-Switching wirkte teilweise korrekt, waehrend Refresh/Cold-Entry instabil blieb.
- Alte Web-Direct/Route-Seeds konnten den aktuell sichtbaren Surface-Zustand ueberschreiben (Snap-back/Wrong-tab bleed).

## Root Cause (technisch)
- Surface-Ownership war zwischen mehreren Pfaden verteilt (Route-Seed, Open-Flow, Renderer-Safeties, Runtime-Ensurer).
- In menu-first Web-Direct-Pfaden wurde `postsStatus` teils zu frueh als `empty` finalisiert, obwohl kein autoritativer Posts-Load abgeschlossen war.
- Dadurch wurde die spaetere `ensurePosts`-Kette beim Wechsel auf Beitraege nicht mehr zuverlaessig getriggert.

## Finales Ownership-Modell (implementiert)
1. Canonical URL entscheidet den sichtbaren Surface (`posts` vs `menu`).
2. Ein autoritativer Open/Runtime-Pfad bestimmt den sichtbaren Surface-Zustand.
3. Sichtbarer Surface mappt deterministisch auf einen Ensure-Pfad:
- visible posts -> `ensurePostsDataForProfile`
- visible menu -> `ensureMenuDataForProfile` (plus Focus fuer Menu-Surface)
4. Cold-Load, Refresh und Tab-Switch laufen durch dieselbe Ensure-Logik.
5. Renderer bleibt nur Safety-Net und ist nicht primaerer Loader.
6. Header/Restaurant-Identity bleibt getrennt von surface-spezifischen Daten (Posts/Menu).

## Was konkret geaendert wurde
- Route-/Snapshot-Truth fuer Posts/Menu wurde normalisiert, damit `seeded` nur bei echten Items gilt.
- Falsche "seeded ohne Items"-Interpretationen wurden entfernt, um kein fake-ready/fake-empty zu erzeugen.
- Web-Direct Tab-Prioritaet wurde bereinigt, damit die Canonical Route nicht von stale Seeds ueberschrieben wird.
- Posts-Ensure wurde fuer Business-Profile gehaertet:
- candidate IDs (restaurantId/canonical/publicSlug/landingSlug/handle) werden robust aufgeloest.
- sichtbarer Profile-Kontext wird vor Live-Refresh strikt geprueft (kein wrong-target update).
- Kritischer menu-first Fix:
- Bei `/:slug/menu` Web-Direct wird Posts nicht mehr blind auf `empty` finalisiert.
- Wenn kein autoritatives `knownEmpty` vorliegt, bleibt Posts auf `loading`.
- Beim Wechsel auf Beitraege greift dadurch zuverlaessig `ensurePostsDataForProfile`.

## Enthaltene Commits (in main uebernommen)
1. `2ff928c` fix(profile): enforce deterministic menu/posts hydration
2. `becce15` fix(profile): continue canonical public hydration
3. `e3f4b8d` fix(profile): preserve canonical public posts routes
4. `3bf930b` fix(profile): ensure posts after menu refresh
5. `cdb5e08` Fix public posts/menu route truth and ensure continuity
6. `30610ba` Fix stale web-direct tab override on public surface switch
7. `01c2f15` Restore web-direct route truth while keeping explicit tab precedence
8. `e578b68` Harden public posts ensure resolution after menu-route start
9. `c8af422` Fix menu-route posts status to avoid false empty on tab switch

## Betroffene Dateien (Code)
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/bridge-shell-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`
- `apps/menyra-social/core/router/deeplink-flow-utils.js`
- `apps/menyra-social/index.html`
- `apps/menyra-social/social-app.js`

## Ergebnis
- `/:slug/posts` zeigt deterministisch Posts.
- `/:slug/menu` zeigt deterministisch Menu.
- Nach Refresh/Cold-Start auf `/:slug/menu` kann anschliessender Wechsel auf Beitraege nicht mehr in false-empty oder endlos-loading haengen, solange Posts vorhanden sind.
- Keine stale Route-Seed-Rueckueberschreibung auf den aktuell sichtbaren Surface.
