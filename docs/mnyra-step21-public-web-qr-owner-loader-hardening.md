Status: CURRENT
Last updated: 2026-04-24

# Mnyra Schritt 21: Public Web/QR Owner- und Loader-Hardening

## Ziel

Die noch offenen Blocker aus der Public-/QR-/Profile-/Menu-/Posts-Analyse mit
kleinem bis mittlerem Blast Radius direkt im Client-Orchestrierungs-Pfad
beheben:

- spaete Bootstrap-Rewrites auf bereits stabilen Public-Surfaces stoppen,
- QR nicht mehr als schwacheren Ensure-/Canonical-Pfad behandeln,
- Public-Menu-Fresh-Path auf Cold/Refresh frueher mit verwertbaren Seeds/Caches
  versorgen,
- Guest-Startup fuer QR/Web-Direct nicht mehr kuenstlich Loader unterdruecken.

## Behobene Root Causes

### 1) Late Bootstrap darf settled Web-Direct-Surface nicht mehr ueberschreiben

Datei:
`apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`

- `applyWebDirectRouteSeedFromBootstrap(...)` beendet sich jetzt, wenn die
  sichtbare Web-Direct-Surface fuer dieselbe `restaurantId` bereits komplett
  settled ist (`identity`, `posts`, `menu`, `focus`, `directEntry.phase=ready`).
- QR-/Table-Kontext wird beim verbleibenden Route-Payload-Update aus dem
  sichtbaren View konserviert, statt still auf leere Bootstrap-Werte zu kippen.

Effekt:
- spaete Bootstrap-Responses erzeugen keine zweite konkurrierende Wahrheit mehr
  fuer eine bereits aufgebaute Public-Surface.

### 2) QR nutzt denselben Canonical-/Ensure-Dedupe-Pfad wie Web-Direct

Dateien:
- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js`

- Sichtbare Target-ID-Mengen enthalten jetzt auch `landingSlug`-Alias-Kontext.
- QR-Menu-First wird in den Visible-Ensure-/Canonical-Hint-Pfaden nicht mehr
  kuenstlich von Web-Direct getrennt.
- Restaurant-Truth-Priming laeuft jetzt auch fuer QR-Guest-Profile.

Effekt:
- QR verliert nicht mehr die Alias-/Target-Dedupe-Vorteile des normalen
  Public-Web-Pfads.

### 3) Public Guest Startup unterdrueckt QR-/Web-Direct-Nachladungen nicht mehr

Datei:
`apps/menyra-social/core/auth/auth-session-startup-coordinator.js`

- Der Guest-Ensure-Fallback wird fuer sichtbare Web-Direct-Public-Surfaces
  nicht mehr komplett geskippt, sondern nur spaeter und kontrolliert
  ausgefuehrt.
- Public-Bootstrap-Fetch wird im Guest-Startup nicht mehr fuer QR-Menu-Launches
  blockiert.

Effekt:
- QR und normaler Web-Direct-Cold-Open haben wieder einen Sicherheitsanker,
  falls Open-Flow/Bootstrap/Ensures nicht perfekt gleichzeitig eintreffen.

### 4) Menu-Fresh-Path darf verwertbare Cache-/Persisted-Seeds wieder nutzen

Dateien:
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/index.html`

- Direct Public Web darf wieder Bootstrap-Cache verwenden, jetzt route-keyed
  statt global unscharf.
- `loadMenuForRestaurant(...)` blockiert Cache-/Persisted-Seeds nicht mehr
  pauschal auf dem frischen sichtbaren Public-Menu-Pfad, solange keine
  bereits bestehende sichtbare Truth geschuetzt werden muss.
- Background-Reconcile laeuft jetzt auch auf QR-Cache-/Persisted-Treffern.

Effekt:
- `/:slug/menu` und QR-Menu koennen auf Refresh/Cold-Open frueher verwertbaren
  Menu-Content zeigen, ohne wieder in falsche globale Bootstrap-Caches zu
  laufen.

### 5) Posts werden im Menu-First-Pfad frueher aufgewarmt

Dateien:
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`

- Menu-First-Web-Direct waermt Public-Posts jetzt schon im Open-Flow an, statt
  erst beim spaeten sichtbaren Posts-Surface.
- Public-Posts-Empty-TTL wurde von `60s` auf `15s` reduziert.
- Read-once-Guest-Refresh blockiert denselben Public-Profile-Key nicht mehr
  ueber die ganze SPA-Session hinweg.

Effekt:
- Wechsel `menu -> posts`, QR `menu -> posts` und erneutes Oeffnen desselben
  Public-Profils werden weniger fragil.

## Geaenderte Dateien

- `apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/menyra-social/core/auth/auth-session-startup-coordinator.js`
- `apps/menyra-social/core/auth/tab-auth-load-utils.js`
- `apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `apps/menyra-social/index.html`
- `docs/mnyra-current-phase.md`
- `docs/mnyra-step21-public-web-qr-owner-loader-hardening.md`

## Bewusst nicht geaendert

- Keine UI-/Design-Aenderungen.
- Keine Firebase Rules/Functions.
- Keine grossen Architektur-Refactors ausserhalb des bestehenden Public-Client-
  Pfads.
- Kein Eingriff in QR-Link-Format, Cart-/Table-Kontext oder Menu-Editor-Flow.

## Checks

- `node --check apps/menyra-social/core/profile/public-profile-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/profile-business-menu-runtime-cluster.js`
- `node --check apps/menyra-social/core/auth/tab-auth-load-utils.js`
- `node --check apps/menyra-social/core/auth/auth-session-startup-coordinator.js`
- `node --check apps/menyra-social/core/profile/profile-open-flow-utils.js`
- `node --check apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `node --check apps/menyra-social/core/app-shell/public-bootstrap-runtime-controller.js`
- `git diff --check`

## Manuelle Testliste

1. Cold open `/:slug`.
2. Cold open `/:slug/menu`.
3. `/:slug/posts` oeffnen und pruefen, dass auf `/:slug` normalisiert wird.
4. QR-Link aus dem Menu-Editor oeffnen:
   `index.html?r=<slug|id>&tab=menu&source=qr&table=7`
5. QR: `menu -> posts -> menu`.
6. QR: `menu -> posts -> refresh`.
7. Normal Public: `menu -> posts -> menu -> refresh`.
8. Browser Back/Forward zwischen `/:slug` und `/:slug/menu`, jeweils mit und
   ohne `src=qr&table`.

## Bewertung

`bestanden mit Rest-Risiko`

Rest-Risiko:
- Der Public-Profilpfad hat weiterhin mehrere historische Schichten
  (`directEntry`, `routePayload`, Store-State). Dieser Schritt reduziert die
  konkurrierenden Writer deutlich, ersetzt aber noch keinen kompletten
  Architektur-Neubau.
