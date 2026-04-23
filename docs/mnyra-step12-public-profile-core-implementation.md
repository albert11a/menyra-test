Status: DOCUMENTED
Last updated: 2026-04-23

# Mnyra Schritt 12: Public Profile Core Implementation

## Schrittziel

Den oeffentlichen Profilkernbereich fuer `/:slug`, `/:slug/posts`, `/:slug/menu`
und QR -> dieselbe Profilwelt mit offenem Menu vollstaendig auf einen gemeinsamen,
kanonischen Zielkontext ziehen: `canonicalRestaurantId`.

## Umgesetzter Kern

### A. Einheitlicher Zielkontext

- `slug` wird im bestehenden Route-/Direct-Entry-Bootstrap-Pfad zur kanonischen `restaurantId` aufgeloest.
- Diese kanonische ID wird als `canonicalRestaurantId` in den sichtbaren Public-Profile-State getragen.
- `canonicalRestaurantId` bleibt ueber Seed -> Loading -> Resolved erhalten.

### B. Einheitliche Ensure-Pfade

- Posts-, Menu- und Fokus-Ensure nutzen zuerst `canonicalRestaurantId`.
- Nur wenn diese fehlt, greifen die bestehenden stabilen Fallbacks.
- Wenn kanonische ID bekannt ist, wird unnoetige zweite/dritte Slug-/Handle-/Doc-Aufloesung reduziert.

### C. Ruhiger Public-Gast-Pfad

- Der bestehende read-once Public-Gast-Pfad bleibt erhalten.
- Keine zusaetzlichen Realtime-Listener im Public-Guest-Kernpfad eingefuehrt.
- Kontextabgleiche im Runtime-Controller wurden auf canonical-first vereinheitlicht,
  um unnoetige Reentry-/Rebuild-Ketten bei gleicher Zielwelt zu reduzieren.

### D. Surface-Richtigkeit im selben Profilkern

- `/:slug` bleibt Profil/Posts-default.
- `/:slug/posts` bleibt Posts-first.
- `/:slug/menu` bleibt Menu-first.
- QR bleibt dieselbe Profilwelt mit offenem Menu (kein separater Produktpfad).

## Kernregeln nach diesem Schritt

1. Visible Public-Profile-State traegt `canonicalRestaurantId` als erstklassige Runtime-Wahrheit.
2. Route bestimmt den Surface, nicht die Datenwahrheit.
3. Ensure-Pfade behandeln `canonicalRestaurantId` als autoritative First-Choice.
4. Public-Guest-Pfad bleibt read-once-orientiert und vermeidet Listener-Sturm-Verhalten.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/public-profile-direct-entry-controller.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-surface-controller.js`
- `apps/menyra-social/core/profile/profile-menu-focus-utils.js`
- `apps/menyra-social/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step12-public-profile-core-implementation.md`

## Bewusst nicht Teil dieses Schritts

- Keine UI-/Design-Aenderung.
- Kein Root-Umbau von `/`.
- `/login` unveraendert.
- Keine sichtbare Tab-/Klick-UX-Aenderung.
- Keine Firebase-/Functions-/Rules-Aenderung.
- Kein Scope ausserhalb des oeffentlichen Profilkernbereichs.
- Kein Playwright, keine Smoke-Tests.

## Manuelle Testliste

1. Hard Reload auf `/:slug`.
2. Hard Reload auf `/:slug/posts`.
3. Hard Reload auf `/:slug/menu`.
4. Im Profil auf Menu klicken.
5. Im Profil auf Beitraege klicken.
6. Echten QR-Link oeffnen.
7. 30-60 Sekunden im Menu bleiben und Network beobachten.
8. Pruefen, dass kein Request-/Listener-Sturm wieder auftaucht.
9. Pruefen, dass Produkte im Menu nach Refresh zuverlaessig erscheinen.
10. Pruefen, dass Beitraege/Menu beim Cold Start weniger verspaetet nachziehen.

## Bewertung

`bestanden mit kleinem Rest-Risiko`
