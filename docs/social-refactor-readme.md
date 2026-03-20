# Menyra Social Refactor README

## Status

- Basisstand: `origin/main` / `873f0dd`
- Diese Datei beschreibt den echten gepushten Zustand.
- Ab jetzt muss diese Datei bei jedem echten Refactor-Schritt im selben Turn aktualisiert werden.
- Vollstaendige Stabilitaets-/Produktionsanalyse: `docs/social-stability-performance-audit.md`

## Ziel

`social-app.js` soll ein echter App-Kernel werden:

- Root-Config laden
- Root-State erzeugen
- Runtime-Registry erzeugen
- Startup orchestrieren
- Shell erzeugen und mounten
- Domain-Gateways verdrahten

Nicht mehr im Kernel:

- Domain-Komposition
- Domain-Facades
- per-Domain Listener-Details
- per-Domain Render-Wrapper
- breite Dependency-Bags
- Nicht-Core-Startup

Zielgröße:

- `social-app.js`: 700-1200 Zeilen

## Aktueller Ist-Zustand

### `social-app.js`

- Pfad: `apps/menyra-social/social-app.js`
- Zeilen: `5582`
- Imports: `155`
- Funktionen: `349`
- top-level `let`: `55`
- `render*`-Funktionen: `60`
- `load*`-Funktionen: `6`

### Weitere Monolith-Dateien

- `apps/menyra-social/core/app-shell/controller-deps-factory.js`: `2083` Zeilen
- `apps/menyra-social/core/app-shell/app-controller-bridge.js`: `571` Zeilen

## Hauptprobleme

### 1. Root ist nicht Kernel, sondern Systemzentrum

`social-app.js` ist gleichzeitig:

- Composition root
- Service-Locator
- Domain-Facade
- Lazy-Loader
- Render-Orchestrator
- Event-Binder
- Listener-Lifecycle-Hub
- State-Mutations-Hub

### 2. Domain-Komposition lebt direkt im Root

Direkt in `social-app.js` erstellt:

- public profile runtime
- restaurant identity runtime
- story feed runtime
- auth profile resolution runtime
- self profile runtime
- social engagement support runtime
- shell DOM runtime
- menu runtime
- focus runtime
- table QR runtime
- orders runtime
- session data runtime
- social engagement runtime
- bridge bootstrap bundle
- public bootstrap runtime
- media upload runtime
- chat runtime
- CRM runtime

### 3. Profile/Menu/Focus hängt weiter am Root

Aktuell hängen im Root oder direkt daran:

- `createPublicProfileRuntimeController`
- `createSelfProfileRuntimeController`
- `createMenuPublicRuntimeController`
- `createFocusRuntimeController`
- `createTableQrRuntimeController`
- `profileMenuFocusRenderController`-Render-Fassade
- `ensureMenuDataForProfile`
- `ensureFocusDataForProfile`
- `getMenuRestaurantForProfile`
- `renderPublicProfileView`
- `renderMenuAdminView`
- `renderProfileView`

Das ist keine extrahierte Domain.

### 4. Chat ist noch immer im Strict-Startup

`chatRuntimeController` wird direkt beim Start gebaut. Das verletzt das Ziel:

- Strict core startup = `Auth + Feed`

Chat muss hinter Registry/Gateway und nur on-demand oder post-first-render preload laufen.

### 5. `socialEngagementSupportRuntimeController` ist architektonisch zu breit

Er mischt:

- Feed/Post-Engagement-Support
- Menu-Item-Social-Meta
- Profile-Post-UI-Support
- Kommentar-/Modal-Render-Helfer

Das muss später getrennt werden in:

- `feed-post-engagement-support`
- `profile-content-support`
- `menu-item-social-support`

### 6. Bridge-Bundle ist zu breit

`createBridgeShellBootstrapBundle(...)` bekommt eine riesige Querschnittsmenge aus:

- overlay orchestration
- deep link
- profile open flow
- discovery
- notifications
- search/map
- shop/cart
- feed rendering

Das ist ein Mixed-Bridge-System, kein senior-level Coordinator-Modell.

### 7. `controller-deps-factory.js` ist ein zweiter App-Root

Oversized Builder:

- `buildAppControllerBridgeDeps`
- `buildSessionDataRuntimeControllerDeps`
- `buildAppShellRuntimeControllerDeps`

Diese Datei besitzt aktuell zu viel cross-domain Wissen.

## Senior-Level Zielarchitektur

### Kernel

Datei:

- `apps/menyra-social/social-app.js`

Darf nur:

- state root erzeugen
- registry erzeugen
- startup coordinators starten
- shell/controller wiring
- top-level render/start/dispose

### Domains

#### Feed core

- feed data/runtime
- story feed
- feed render
- feed post engagement core

Teil des strict startup path.

#### Profile domain

- public profile runtime
- self profile runtime
- profile open flow
- menu/focus/table-QR
- profile content support
- narrow profile gateway

#### Chat domain

- thread/message runtime
- unread/listeners
- follow + notification target open
- narrow chat gateway

#### Commerce domain

- upload
- orders
- checkout
- shop/cart gateway

#### CRM / Business / Discovery

- vollständig sekundär
- nur lazy oder post-first-render preload

### Bridges

Statt Mixed-Bridge:

- profile flow bridge
- deeplink bridge
- notifications bridge
- feed bridge
- discovery bridge
- overlay bridge
- shop bridge

### Dependency builders

Statt Mega-Datei:

- `build-shell-runtime-deps.js`
- `build-session-runtime-deps.js`
- `build-bridge-deps.js`
- `build-feature-deps.js`

## Harte Regeln

1. Eine Domain hat genau einen Owner.
2. Ein Listener hat genau einen Owner.
3. Keine Parallel-Facades.
4. Keine Domain-spezifischen Dependency-Bags im Kernel.
5. Keine Nicht-Core-Features im Strict-Startup.
6. Kein Refactor-Schritt ohne Smoke-Prüfung.
7. Keine großen Big-Bang-Umbauten.

## Refactor-Reihenfolge

### Phase A: Sicherheitsbasis

Zuerst:

- Smoke-Matrix für Kernflows festziehen
- jeder Refactor-Schritt muss gegen diese Matrix geprüft werden

Minimum:

- cold load
- login
- feed open
- public profile
- own profile
- chat open
- upload open
- orders open
- search/map open
- leads edit

### Phase B: Root-Demotionsschnitt 1

Aus `social-app.js` raus:

- direkte Domain-Komposition für Profile/Menu/Focus/Table-QR
- Render-Facade `profileMenuFocusRenderController`
- profile/menu/focus prep helpers

Ziel:

- `social-app.js` konsumiert nur noch `profileDomainGateway`

### Phase C: Root-Demotionsschnitt 2

Aus `social-app.js` raus:

- `socialEngagementSupportRuntimeController`-Facade
- profile-content-support
- menu-item-social-support

Ziel:

- Feed-Core bleibt klein
- Profile/Menu-Support wird domain-owned

### Phase D: Chat aus dem Strict-Startup

Aus `social-app.js` raus:

- direkte `createChatRuntimeController(...)`-Erzeugung im Core-Start

Ziel:

- Chat nur via registry/gateway

### Phase E: `controller-deps-factory.js` splitten

Ziel:

- keine zweite App-Root-Datei mehr

### Phase F: `app-controller-bridge.js` splitten

Ziel:

- keine Mixed-Bridge mehr

### Phase G: State/Lifecycle härten

Ziel:

- domänenlokale Listener
- explizite state actions
- kontrollierte render invalidation

## Was als Nächstes wirklich geschnitten werden muss

Der erste senior-taugliche Schnitt ist nicht Chat oder Commerce, sondern:

- komplette Profile/Menu/Focus-Komposition aus `social-app.js`
- inklusive Support-Ownership
- ohne Parallelpfad

Das ist der erste Punkt, an dem `social-app.js` strukturell weniger zentral wird.

## Was noch nicht passiert ist

- keine echte Domain-Runtime-Bundle-Extraktion
- kein Chat-Startup-Cut
- kein Bridge-Split
- kein Deps-Split
- kein State-Actions-Split

## Definition von Erfolg

Der Refactor ist erst dann wirklich erfolgreich, wenn:

- `social-app.js` nur noch Kernel ist
- `controller-deps-factory.js` kein App-Root mehr ist
- `app-controller-bridge.js` keine Mixed-Bridge mehr ist
- Chat nicht mehr im Strict-Startup hängt
- Profile/Menu/Focus komplett domain-owned ist
- sekundäre Features wirklich deferred sind
- die Smoke-Matrix stabil grün bleibt
