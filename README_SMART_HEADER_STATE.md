# Smart Header State

Stand dieses Commits:

- Der alte App-Header wurde auf einen globalen Smart Header umgestellt.
- Der Header ist als eigener Shell-Layer ueber dem Content eingebaut.
- Die obere Leiste bleibt sichtbar.
- Die untere Tab-Leiste im Business-Profil (`Profil`, `Menue`, `Call Waiter`) faehrt beim Scrollen hinter die obere Leiste.
- Drawer, Login/Profile und Cart nutzen weiter die vorhandenen App-Flows.

Haupt-Tabs im Header (`feed` / `restaurants`):

- Unter der oberen Leiste (Location, Sprache, Login, Warenkorb) liegt eine Tab-Zeile mit `Feed` und `Restaurants`.
- Die Tab-Zeile wird nur in den Tabs `feed`, `home` und `restaurants` gerendert (`renderMainHeaderTabs()`), Element-Id `smart-tabs`.
- Die Tabs nutzen `data-nav`, laufen also ueber denselben Tab-Wechsel wie der Drawer.
- Ganz rechts in der oberen Leiste (neben dem Warenkorb) minimiert ein Chevron-Button den Header auf die eine obere Zeile.
- Der Collapse-State liegt in `state.headerTabsCollapsed` und wird unter `STORAGE_KEYS.headerTabs` persistiert.
- Beim Umschalten wird die Klasse direkt am DOM getoggelt, damit die Hoehen-Transition laeuft; `--smart-header-tabs-height` wird dabei mitgesetzt.
- `--feed-location-gate-header-height` rechnet `--smart-header-tabs-height` mit ein, damit die Sticky-Offsets im Feed-Location-Gate stimmen.
- `Restaurants` ist deshalb kein Drawer-Eintrag mehr.

Wichtige Eigenschaften:

- Safe-Area und obere Leiste werden als zusammenhaengende Header-Flaeche behandelt.
- Header-Abstaende zum Content laufen ueber `--smart-header-content-gap`.
- Header-Hoehen werden zur Laufzeit aus dem DOM gemessen und als CSS-Variablen gesetzt.
- Safari `theme-color` wird auf den Header-Surface abgestimmt.
- Header-Badge fuer Notifications ist an einem expliziten Badge-Anchor gebunden.

Relevante Dateien:

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `apps/menyra-social/core/app-events/app-events-main-bind-utils.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/ui/main-shell-render-utils.js`
- `apps/menyra-social/index.html`

Hinweis fuer weitere Anpassungen:

- Optische Header-Anpassungen zuerst in `apps/menyra-social/index.html`.
- Event- oder Tab-Verhalten zuerst in `app-shell-runtime-controller.js` und `app-events-shell-bind-utils.js`.
- Wenn Badge oder Drawer-Position komisch wirkt, zuerst den Header-Badge-Anchor und `updateNotificationBadges()` pruefen.
