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
- Innerhalb des Headers weder Linie noch Schatten: `.smart-header-shell--split` schaltet Border und Inset-Shadow ab. Ein Schatten zwischen oberer Leiste und Tab-Zeile wurde als Farbunterschied gelesen und liess die Tabs abgetrennt wirken.
- Der gewohnte Header-Schatten (`box-shadow` plus `::after`-Verlauf von `.smart-header-shell`) bleibt erhalten, sitzt aber immer an der untersten Header-Kante: bei offenen Tabs an der Tab-Zeile, danach an der oberen Leiste. Beide Schatten blenden ueber denselben `--smart-header-tabs-fade` um, deshalb gibt es keinen Sprung.
- Der Feed-Stage-Einstiegsscroll (`queueFeedStageAutoPinScroll()` in `feed-view-orchestration-controller.js`) wird uebersprungen, solange `#smart-tabs` existiert. Mit der Tab-Zeile bestand er praktisch nur noch daraus, genau diese Zeile wegzuschieben - man landete nach der Stadteingabe auf dem Feed und die Tabs blendeten sich sofort wieder aus. Der Bento pinnt ohnehin per Sticky, sobald der Nutzer selbst scrollt.
- Beim App-Start stehen die Tabs offen und bleiben es, bis der Nutzer die Seite selbst anfasst. Der Boot-Lock (`mainHeaderTabsBootLockActive`) holt eine Scroll-Position, die niemand ausgeloest hat, an den Anfang zurueck - begrenzt auf `MAIN_HEADER_TABS_BOOT_MAX_CORRECTIONS`, damit er sich nicht mit einem legitimen Auto-Scroll hochschaukelt. Freigegeben wird er beim ersten `pointerdown`/`touchstart`/`wheel`/`keydown` und vom Chevron-Handler selbst.
- Die Tab-Zeile behaelt immer dieselbe Layout-Hoehe. Beim Scrollen laeuft sie hinter die obere Leiste und blendet sich dabei aus - gesteuert ueber `--smart-header-tabs-fade`. Nur Opacity, kein Layout.
- `syncMainHeaderTabsScrollProgress()` misst dafuer **Geometrie statt `scrollY`**: wie weit die Tab-Zeile tatsaechlich hinter der oberen Leiste liegt (Faktor 1.8, damit nie halb abgeschnittene Buttons sichtbar sind). Steht die Zeile sichtbar unter der Leiste, ist sie offen - egal was der Scroll-Wert behauptet.
- Die Tabs nutzen `data-nav`, haben aber eine eigene Bindung (`bindPillTap`): sie schalten auf `touchend` statt `click` und faerben sich sofort um, damit der Wechsel nicht erst nach dem Re-Render sichtbar wird. Ein Scroll-Gesture, das auf einem Pill startet, loest keinen Wechsel aus.
- Die Tab-Zeile steht bewusst **ausserhalb** von `.smart-header-shell` (Geschwister-Element, `.smart-header-shell--split` markiert diesen Fall). Sticky ist nur der Shell mit der oberen Leiste; die Tabs scrollen normal mit dem Content weg und laufen dabei hinter die Leiste (`z-index` 90 gegen 100).
- Damit aendert Scrollen keine Layout-Hoehe mehr, der Content behaelt seinen Abstand nach oben. Ein frueherer Scroll-Auto-Collapse hat den Header in-flow zusammengezogen und dadurch den Content unter dem Finger verschoben - das ist raus, ebenso der persistierte Collapse-State.
- Der Pfeil schaltet die Zeile nicht weg, er **scrollt** sie weg: sichtbar getippt faehrt die Seite knapp an ihr vorbei (`scrollTo({ top: rowHeight, behavior: "smooth" })`), die Zeile laeuft dabei hinter die Leiste. Genau dasselbe Bild wie beim Wegscrollen mit dem Finger.
- Die Zeile verlaesst dadurch **nie** das Layout. Es gibt keinen Ausgeblendet-Zustand, kein `display:none`, keine Scroll-Korrektur und nichts, was beim Zurueckkommen springen koennte. Wo die Zeile steht, sagt allein die Scroll-Position.
- Deshalb ist das Hochscrollen nach dem Pfeil derselbe Weg wie ohne Pfeil: die Zeile taucht wieder auf, als haette niemand den Pfeil angefasst. Das war vorher nicht so - ausgeblendet war sie per `display:none` aus dem Layout, der Content stand also um ihre Hoehe weiter oben, und das Zurueckholen am Seitenanfang war ein Ruck.
- Weg getippt steht die Seite bei `rowHeight`. Von dort holt der Pfeil die Zeile ueber denselben Weg zurueck: Seite an den Anfang, Zeile kommt von selbst mit. Das gilt bis `rowHeight * MAIN_HEADER_TABS_NEAR_TOP_ROWS`.
- Tiefer in der Seite waere ein Sprung an den Anfang der falsche Preis fuer die Tabs: dort heftet sich die Zeile unter die Leiste (`smart-header-tabs-stuck`), die Leseposition bleibt stehen. Nochmal getippt oder weitergescrollt laesst sie wieder los.
- Ein Scroll ist aber nur eine **Bitte** an den Browser: der Render-Pfad setzt bei jedem Re-Render im selben Tab die Scroll-Position wieder auf ihren alten Wert (`setViewportScrollTop()` / `scheduleViewportScrollTop()`), und das kappt einen laufenden Smooth-Scroll. Faellt das mit dem Pfeil zusammen, kam die Zeile nie zurueck - und jeder weitere Tipp schickte dieselbe wirkungslose Bitte hinterher, der Pfeil war tot.
- Deshalb sieht `verifyMainHeaderTabsReveal()` nach `MAIN_HEADER_TABS_REVEAL_VERIFY_MS` nach: steht die Zeile immer noch nicht da, heftet sie sich unter die Leiste. Das braucht keinen Scroll und kann deshalb nicht ausbleiben. Ist die Seite inzwischen weiter nach unten gegangen, war das der Finger des Nutzers - dann haelt sich die Nachschau heraus.
- Weggenommen wird auch dann in einem Tipp, wenn die Zeile geklebt hat und die Seite nahe am Anfang steht: Loslassen allein liesse sie dort stehen, ihr normaler Platz liegt ja noch im Blick. Der Pfeil loest also das Kleben **und** faehrt an ihr vorbei.
- Damit der Pfeil ueberhaupt Scroll-Weg hat, bekommt der Hauptbereich neben der Pill-Zeile eine Mindesthoehe (`.smart-header-tabs--main ~ .app-main-scroll`). Die alte Regel haing an `.app-main-scroll--with-smart-header-tabs` - die Klasse sitzt aber am Business-Profil, nicht an den Seiten mit den Pills.
- Festgehalten wird das in `tests/smart-header-tabs-toggle.test.mjs` - inklusive des direkten Vergleichs "mit Pfeil" gegen "ohne Pfeil" und des Falls, in dem der Browser den Scroll verweigert.
- `html.smart-header-tabs-away` markiert, dass die Tabs weggescrollt sind. Die Klasse faerbt den Chevron weich indigo und dreht ihn nach oben: der Hinweis, dass man die Tabs dort wieder aufmachen kann.
- Chevron-Klick und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Der Scroll-Listener ist rAF-gedrosselt und schreibt nur eine CSS-Variable plus eine Klasse.
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
