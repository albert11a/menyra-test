# Smart Header State

Stand dieses Commits:

- Der alte App-Header wurde auf einen globalen Smart Header umgestellt.
- Der Header ist als eigener Shell-Layer ueber dem Content eingebaut.
- Die obere Leiste bleibt sichtbar.
- Die untere Tab-Leiste im Business-Profil (`Profil`, `Menue`, `Call Waiter`) faehrt beim Scrollen hinter die obere Leiste.
- Drawer, Login/Profile und Cart nutzen weiter die vorhandenen App-Flows.

Haupt-Tabs im Header (`feed` / `restaurants`):

- Unter der oberen Leiste (Location, Sprache, Login, Warenkorb) liegt eine Zeile mit den Pill-Buttons `Feed` und `Restaurants`.
- Die Zeile erscheint erst, wenn eine Stadt gesetzt ist: `isMainHeaderTabsScope()` verlangt einen Location-Record und die Tabs `feed`, `home` oder `restaurants`. Im Location-Gate gibt es weder Tabs noch Collapse-Pfeil.
- Gerendert wird sie von `renderMainHeaderTabs()` unter der Element-Id `smart-tabs`, Buttons mit `.smart-header-pill`.
- Keine Linie im Header, sobald die Tabs existieren: `.smart-header-top` und die Tab-Zeile verlieren Border und Inset-Shadow, die Abgrenzung zum Content macht der weiche Schatten von `.smart-header-shell::after`.
- Auf- und Zuklappen laeuft ueber `grid-template-rows: 1fr -> 0fr` mit einem `.smart-header-tabs-clip`-Wrapper. Das animiert die echte Inhaltshoehe; die frueher genutzte `max-height`-Schaetzung sprang, weil der Grossteil der Strecke auf leeren Raum entfiel.
- Diese Transition ist bewusst nicht im `fast-mode` deaktiviert, sonst klappt sie auf schwaecheren Geraeten hart um.
- Die Tabs nutzen `data-nav`, haben aber eine eigene Bindung (`bindPillTap`): sie schalten auf `touchend` statt `click` und faerben sich sofort um, damit der Wechsel nicht erst nach dem Re-Render sichtbar wird. Ein Scroll-Gesture, das auf einem Pill startet, loest keinen Wechsel aus.
- Die Tab-Zeile steht bewusst **ausserhalb** von `.smart-header-shell` (Geschwister-Element, `.smart-header-shell--split` markiert diesen Fall). Sticky ist nur der Shell mit der oberen Leiste; die Tabs scrollen normal mit dem Content weg und laufen dabei hinter die Leiste (`z-index` 90 gegen 100).
- Damit aendert Scrollen keine Layout-Hoehe mehr. Ein frueherer Scroll-Auto-Collapse hat den Header in-flow zusammengezogen und dadurch den Content unter dem Finger verschoben - das ist raus.
- Der Scroll-Listener in `initMainHeaderTabsRuntime()` schaltet nur noch die Klasse `smart-header-tabs-scrolled` am `<html>`. Sie verschiebt den weichen Header-Schatten von der Tab-Zeile an den Shell und blendet den Collapse-Pfeil aus, solange die Tabs weggescrollt sind - ein Tap koennte dort sonst den Content springen lassen. Kein Layout-Effekt.
- Ganz rechts in der oberen Leiste (neben dem Warenkorb) minimiert ein Chevron-Button die Tab-Zeile. Die Praeferenz liegt in `state.headerTabsCollapsed`, wird unter `STORAGE_KEYS.headerTabs` persistiert und der Shell traegt sie zusaetzlich als `smart-header-shell--tabs-collapsed`, weil er die Tab-Zeile nicht mehr per `:has()` sieht.
- Chevron-Klick und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Umgeschaltet wird direkt am DOM, damit die Hoehen-Transition laeuft.
- `--feed-location-gate-header-height` deckt nur die obere Leiste ab (`safe-area + 4.5rem`), weil die Tab-Zeile weggescrollt ist, bevor im Gate etwas sticky wird.
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
