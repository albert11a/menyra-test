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
- Der Pfeil macht die Pill-Zeile **zu und auf** - und fasst dabei nur an, was wirklich im Bild ist. Sein Zustand sind zwei Klassen am `<html>`: `smart-header-tabs-collapsed` (aus dem Layout) und `smart-header-tabs-stuck` (unter die Leiste geheftet). An einer Scroll-Position haengt nichts davon.
- **Weiter unten in der Seite** ist die Zeile ohnehin weggescrollt. Dort heftet der Pfeil sie unter die Leiste und laesst sie wieder los, mehr nicht: kein Layout-Wechsel, kein Ausgleich, kein Scroll. Das Dokument bleibt Zeile fuer Zeile, wie es ohne Pfeil waere - deshalb faehrt die Zeile beim spaeteren Hochscrollen exakt so herein wie sonst. Vorher nahm der Pfeil sie auch dort aus dem Layout und verschob die Scroll-Position um ihre Hoehe; danach war alles versetzt und das Hereinfahren sah anders aus.
- **Oben**, wo ihr Platz im Bild liegt (`scrollY < rowHeight`), geht die Zeile wirklich aus dem Layout - dort ist genau das das Zumachen. Die Scroll-Position bleibt auch dabei unangetastet: alles darunter wandert um die Zeilenhoehe hoch, beim Aufmachen wieder runter.
- Und zwar **fahrend**, nicht springend: `html.smart-header-tabs-animating` legt fuer `MAIN_HEADER_TABS_COLLAPSE_ANIM_MS` einen Uebergang auf die Hoehe (dazu `overflow: hidden`, und die eigene Schattenkante tritt solange hinter `.smart-header-underline` zurueck). Ohne Pfeil bewegt sich die Zeile immer mit dem Finger; ein Sprung um ihre ganze Hoehe in einem Bild sah daneben hart aus. Die Klasse liegt nur waehrend der Fahrt: der stille Layout-Wechsel weiter unten muss sofort sitzen, weil dort der Scroll-Ausgleich im selben Bild dagegenhaelt.
- Zugemacht bleibt zugemacht, solange ihr Platz im Bild liegt. Kommt die Seite weiter unten zur Ruhe, holt sich die Zeile ihren Platz im Layout still zurueck (`scheduleMainHeaderTabsLayoutRestore()`, `MAIN_HEADER_TABS_LAYOUT_RESTORE_REST_MS`): der Ausgleich haelt den Inhalt dabei exakt still, sichtbar aendert sich nichts, und danach ist das Dokument wieder wie ohne Pfeil. Im Stillstand laeuft kein Schwung mehr, den ein Scroll-Ausgleich abwuergen koennte.
- Kommt die Seite hoch in den obersten Streifen (`scrollY <= rowHeight && scrollY < previous`), macht sich eine noch zugemachte Zeile auf - als haette man den Pfeil nie gedrueckt. Die Scroll-Position wird dabei **nicht** angefasst: sie an den Anfang zu ziehen hat unter dem Finger gerissen. Was von der Zeile zu sehen ist, sagt allein die Scroll-Position.
- Der Ausgleich (nur noch fuer die stillen Layout-Wechsel) misst die **tatsaechliche** Verschiebung des Hauptbereichs, statt mit der Zeilenhoehe zu rechnen, und die Zeile bekommt zur Laufzeit eine **ganze Pixelhoehe** (`measureMainHeaderTabsRowHeight()`, dazu `box-sizing: border-box`). Von sich aus ist sie 40.67px hoch; Scroll-Positionen rundet der Browser auf ganze Pixel, der Rest blieb als 0.33px Versatz stehen und die Seite zuckte sichtbar.
- Damit der Ausgleich nicht vom Render-Pfad ueberschrieben wird (`setViewportScrollTop()` / `scheduleViewportScrollTop()` setzen bei jedem Re-Render die alte Position zurueck), setzt `scrollMainHeaderTabsTo()` sein Ziel ueber `MAIN_HEADER_TABS_SCROLL_ASSERT_DELAYS_MS` hinweg nach. Ein `pointerdown`/`touchstart`/`wheel`/`keydown` bricht das sofort ab: die Hand des Nutzers hat Vorrang. Solange ein Ausgleich laeuft, zaehlt seine Bewegung nicht als Geste - sonst nahm sie die gerade geholte Zeile sofort wieder weg.
- Der Pfeil haengt an `touchend`, nicht am `click` (`bindMainHeaderTabsToggleTap()`, dieselbe Bindung wie `bindPillTap` bei den Pills): nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn - und weiter unten in der Seite hat man eben gescrollt. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen, damit ein Tipp nur einmal zaehlt.
- Festgehalten wird das in `tests/smart-header-tabs-toggle.test.mjs`, inklusive des direkten Vergleichs "mit Pfeil" gegen "ohne Pfeil" auf dem Weg nach oben. Nachgemessen wird auf der echten Safari-Engine (Playwright WebKit, iPhone-Profil), weil die Seite nur mobil benutzt wird.
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
