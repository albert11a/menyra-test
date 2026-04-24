Status: CURRENT
Last updated: 2026-04-24

# Mnyra Step 19 - Public QR Cold-Open Reliability Hardening

## Ziel

Restinstabilitaeten im Public-/QR-Profilpfad nach Schritt 18 mit kleinem Blast
Radius beheben, speziell fuer Cold-Open nach QR-Scan.

## Ausgeloester Fehler (gegen `main` verglichen)

- Bei QR-Cold-Open konnte Menu/Fokus im ersten Pass mit einer nicht-kanonischen
  Restaurant-ID (`slug` statt canonical `restaurantId`) als `knownEmpty`
  eingestuft werden.
- Diese Alias-Wahrheit wurde als bereits "settled" akzeptiert und blockierte
  danach weitere Ensures fuer den effektiven Surface-Context.
- Ergebnis: sichtbarer Zustand "Content oeffnet nicht" oder bleibt leer, obwohl
  spaeter eine bessere ID-Aufloesung verfuegbar war.

## Root Cause

1. Menu/Fokus-Surface-Matching war zu tolerant:
- Alias-IDs (webDirect/route/profile) wurden fuer "settled truth" akzeptiert.
- Dadurch konnte ein alter/staler ID-Kontext den echten Zielkontext ueberdecken.

2. QR-Session-Erkennung im Menu-Loader war nicht canonical-aware:
- Bei canonical-verschobener ID konnte der QR-spezifische leichte Pfad
  ausfallen.

3. Kleine Restlast:
- Persisted-Menu-Reconcile hatte keinen QR-Guard.
- Empty-Posts wurden nicht als kurzzeitige bekannte Leere gecacht.
- Popstate-Replay konnte in kurzer Folge redundante Re-Applys ausloesen.

## Umsetzung

### 1) Strikte "settled truth" fuer Menu/Fokus

Datei:
`apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`

- "Settled truth" fuer Menu/Fokus gilt jetzt nur noch bei striktem
  Restaurant-ID-Match (`state.*.restaurantId === surfaceRestaurantId`).
- Alias-Matches duerfen Uebergang sein, blockieren aber keine neuen Ensures.
- Auto-Ensure fuer Fokus wurde ebenfalls auf strikten Match gehaertet.

Effekt:
- Ein fruehes `knownEmpty` auf Alias-ID kann den spaeteren korrekten
  Restaurant-Kontext nicht mehr dauerhaft blockieren.

### 2) QR-Session-Erkennung canonical-aware

Datei:
`apps/menyra-social/core/app-shell/session-data-runtime-controller.js`

- `isQrGuestMenuSessionForRestaurant` nutzt jetzt sichtbare Ziel-ID-Menge
  (inkl. canonical IDs) statt nur einzelner `restaurantId`.

Effekt:
- QR-spezifische Loader-Pfade greifen stabiler auch nach ID-Handoff.

### 3) Last-/Stabilitaetshaertung aus Audit

Dateien:
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/social-app.js`

Massnahmen:
- Persisted-Menu-Reconcile mit gleichem QR-Guard wie Memory-Reconcile.
- Empty-Posts-TTL-Cache (60s), damit Public-Businesses ohne Posts nicht bei
  jedem Entry/Refresh neue Reads triggern.
- Popstate-Replay-Dedupe-Fenster, um doppelte kurzzeitige Replays zu vermeiden.

## Geaenderte Dateien

- `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/social-app.js`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step19-public-qr-cold-open-reliability-hardening.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Keine Firebase Rules/Functions.
- Keine grossen Architektur-Refactors.
- Keine Aenderung am QR-Link-Format oder QR-Erzeugungs-Flow.

## Checks

- `node --check apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/social-app.js`

## Manuelle Testliste

1. QR alt:
   `index.html?r=<slug|id>&tab=menu&source=qr&table=7` als Cold-Open.
2. Nach QR-Cold-Open:
   Menu muss laden, Fokus muss erscheinen, kein haengender Leerzustand.
3. QR Menu -> Posts -> Menu:
   beide Surfaces laden, kein dauerhafter leerer Zustand.
4. QR Menu -> Posts -> Refresh:
   QR-Kontext (`src=qr`, `table`) bleibt erhalten, Posts laden.
5. Direkt `/:slug/menu` Cold-Open:
   Menu/Fokus laden auch ohne vorab warmen Cache.
6. Browser Back/Forward zwischen `/:slug` und `/:slug/menu` mit QR-Query.

## Bewertung

`bestanden mit Rest-Risiko`

Rest-Risiko:
- Der Public-Open-Flow bleibt weiterhin vielstufig; ein groesserer
  Single-Owner-Umbau wurde bewusst nicht in diesem Schritt gemacht.
