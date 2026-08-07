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
- Der Pfeil macht die Zeile **zu und auf** - an derselben Stelle, egal wo man steht. Sein ganzer Zustand ist `mainHeaderTabsCollapsed` plus die Klasse `html.smart-header-tabs-collapsed`, die die Zeile per `display: none` aus dem Layout nimmt. Er scrollt die Seite nicht mehr dorthin, wo die Zeile gerade zufaellig waere.
- Genau das war vorher der Fehler: Wegnehmen hiess "die Seite um eine Zeilenhoehe nach unten scrollen". Am Seitenanfang rutschte damit bei jedem Tipp die ganze Seite, und ob ueberhaupt etwas passierte, hing daran, ob der Browser den Scroll ausfuehrt - der Render-Pfad setzt die Scroll-Position bei jedem Re-Render im selben Tab wieder auf ihren alten Wert (`setViewportScrollTop()` / `scheduleViewportScrollTop()`) und kappt dabei laufende Smooth-Scrolls. Fiel das zusammen, tat der Pfeil oben schlicht nichts. Der Zustand haengt jetzt an einer Klasse und kann von keiner Scroll-Position mehr kaputtgemacht werden.
- Wieder hochgescrollt macht die Zeile sich auf, als haette man den Pfeil nie gedrueckt: dort ist ihr Platz, und niemand sucht am Seitenanfang einen Pfeil, um etwas zurueckzuholen, das dorthin gehoert. Ausgeloest wird das beim **Hochkommen** in den obersten Streifen (`scrollY <= mainHeaderTabsRowHeight && scrollY < previous`), nicht erst auf den letzten zwei Pixeln - ein Wisch bleibt oft knapp darueber stehen, und dann kam die Zeile nie zurueck. Die Scroll-Position wird dabei **nicht** angefasst: sie an den Anfang zu ziehen hat unter dem Finger gerissen. Die Zeile nimmt einfach ihren Platz wieder ein, und was von ihr zu sehen ist, sagt allein die Scroll-Position - bei 30px sieht man ihre unteren 11px, genau wie ohne Pfeil. Am Seitenanfang zugemacht bleibt zugemacht: dort gibt es kein Hochkommen mehr.
- Die Zeile bekommt zur Laufzeit eine **ganze Pixelhoehe** (`measureMainHeaderTabsRowHeight()` setzt sie, `box-sizing: border-box` im CSS). Von sich aus ist sie 40.67px hoch, und Scroll-Positionen rundet der Browser auf ganze Pixel: der Rest blieb als 0.33px Versatz stehen und die Seite zuckte bei jedem Tipp sichtbar. Gemessen wird weiter, damit groessere Schrift oder ein anderes Geraet passen.
- Gescrollt wird nur noch zum **Ausgleich**: ohne die Zeile wandert alles darunter um ihre Hoehe hoch. Am Seitenanfang ist genau das das Zumachen (nichts wird ausgeglichen, die Seite bleibt bei 0). Weiter unten wuerde es den Text unter dem Finger verschieben, deshalb geht die Scroll-Position mit - und zwar um die **gemessene** Verschiebung des Hauptbereichs, nicht um eine gerechnete Hoehe. Misslingt dieser Ausgleich, steht die Zeile trotzdem richtig; es waere nur der Inhalt um eine Zeilenhoehe versetzt.
- Damit der Ausgleich nicht selbst zum Opfer des Re-Renders wird, setzt `scrollMainHeaderTabsTo()` sein Ziel ueber `MAIN_HEADER_TABS_SCROLL_ASSERT_DELAYS_MS` hinweg nach. Ein `pointerdown`/`touchstart`/`wheel`/`keydown` bricht das sofort ab: die Hand des Nutzers hat Vorrang.
- Aufgemacht weiter unten in der Seite laege die Zeile ausserhalb des Blicks. Dort heftet sie sich unter die Leiste (`smart-header-tabs-stuck`), damit man sie sieht, ohne dass die Leseposition wandert. Weiterscrollen oder der naechste Tipp laesst wieder los; am Seitenanfang klebt nie etwas.
- Zugemacht bleibt zugemacht, auch ueber Scrollen und Re-Render hinweg - nur der Pfeil macht wieder auf. Der Zustand lebt im Modul, nicht im HTML, und wird nach jedem Re-Render neu angesagt.
- Der eigene Ausgleich zaehlt nicht als Geste: solange `mainHeaderTabsScrollAssertTarget` gesetzt ist, greift die Regel "Runterscrollen laesst die geholte Zeile los" nicht. Vorher las sie den Ausgleich beim Aufmachen (Position geht um eine Zeilenhoehe nach unten) als Wisch und nahm die gerade geholte Zeile sofort wieder weg - weiter unten in der Seite tat deshalb jeder zweite Tipp nichts. Ein Finger auf dem Glas beendet den Ausgleich ohnehin sofort.
- Der Pfeil haengt an `touchend`, nicht am `click` (`bindMainHeaderTabsToggleTap()`, dieselbe Bindung wie `bindPillTap` bei den Pills): nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn - und weiter unten in der Seite hat man eben gescrollt. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen, damit ein Tipp nur einmal zaehlt. Gemessen auf WebKit: 3ms vom Loslassen bis zur Reaktion am Seitenanfang, unter 100ms weiter unten.
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
