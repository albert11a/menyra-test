## Business Tabs + Modal State

Dieser Stand beschreibt genau die Änderungen, die jetzt committed und gepusht werden.

### Zweck

- Business-Top-Tabs im Profil bleiben `sticky`.
- Wenn die Tabs wirklich angepinnt sind, bekommt nur dieselbe Sticky-Leiste oben eine zusätzliche Safe-Area-Fläche über `::before`.
- Modal- und Drawer-Safe-Area bleibt auf dem funktionierenden Stand.
- Es gibt in diesem Stand **keine** zweite `fixed`-Tab-Leiste.

### Geänderte Dateien

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `apps/menyra-social/core/menu/menu-modal-render-utils.js`
- `apps/menyra-social/core/overlays/overlay-orchestration-controller.js`
- `apps/menyra-social/core/overlays/overlay-root-ui-utils.js`
- `apps/menyra-social/core/ui/main-shell-render-utils.js`
- `apps/menyra-social/index.html`

### Was davon wichtig ist

#### Sticky Business Tabs

- `app-shell-runtime-controller.js`
  - rendert die Business-Tabs als normalen Sticky-Block
  - blendet die Tabs aus, sobald Overlays/Modals/Drawer offen sind
  - setzt per kleinem Scroll-/Resize-Sync die Klasse `business-top-tabs-sticky--pinned`

- `index.html`
  - definiert `.business-top-tabs-sticky`
  - definiert `.business-top-tabs-sticky--pinned::before`
  - diese Pseudo-Fläche füllt nur im angepinnten Zustand die obere Safe-Area mit `var(--app-bg)`

#### Modal / Drawer Safe-Area

- `menu-modal-render-utils.js`
  - Menü-Detail-Modal nutzt eigenen weißen Frame/Header

- `overlay-orchestration-controller.js`
  - Menü-Detail rendert Shell + Overlay sauber zusammen, damit kein leerer/kaputter Zustand entsteht

- `overlay-root-ui-utils.js`
  - synchronisiert `theme-color`
  - `modalUnderlay` liegt höher, damit Overlay/Modal sauber über der App steht

- `shell-dom-runtime-controller.js`
  - synchronisiert `drawer-open` und `theme-color`

- `index.html`
  - enthält die zugehörigen Modal-/Drawer-/Safe-Area-CSS-Regeln

### Wenn man diesen Stand später löschen will

Rollback-Ziel:

- Business-Tabs wieder ohne `business-top-tabs-sticky--pinned`
- kein zusätzlicher Scroll-/Resize-Sync für Tabs
- Modal-/Drawer-Safe-Area nur dann anfassen, wenn man bewusst auch diese Fixes entfernen will

Praktisch:

1. `app-shell-runtime-controller.js`
   - `businessTopTabsPinSyncCleanup`
   - `setBusinessTopTabsPinned`
   - `stopBusinessTopTabsPinSync`
   - `bindBusinessTopTabsPinSync`
   - Aufruf von `bindBusinessTopTabsPinSync()`
   entfernen

2. `index.html`
   - `.business-top-tabs-sticky--pinned`
   - `.business-top-tabs-sticky--pinned::before`
   entfernen

3. Falls auch die Modal-/Drawer-Fixes weg sollen:
   - Änderungen in `menu-modal-render-utils.js`
   - `overlay-orchestration-controller.js`
   - `overlay-root-ui-utils.js`
   - `shell-dom-runtime-controller.js`
   separat zurücknehmen

### Hinweise

- Dieser Stand ist bewusst der einfache Sticky-Ansatz ohne zusätzliche `fixed`-Leiste.
- Asset-Cache-Buster in `index.html` gehört zu diesem Stand und wurde für mobiles Hard-Reload erhöht.
