# Smart Header State

Stand dieses Commits:

- Der alte App-Header wurde auf einen globalen Smart Header umgestellt.
- Der Header ist als eigener Shell-Layer ueber dem Content eingebaut.
- Die obere Leiste bleibt sichtbar.
- Die untere Tab-Leiste im Business-Profil (`Profil`, `Menue`, `Call Waiter`) faehrt beim Scrollen hinter die obere Leiste.
- Drawer, Login/Profile und Cart nutzen weiter die vorhandenen App-Flows.

Haupt-Tabs im Header (`Zbulo` / `Lokalet` / `Ofertat`):

- Unter der oberen Leiste (Location, Sprache, Login, Warenkorb) liegt eine Zeile mit den Pill-Buttons `Zbulo`, `Lokalet` und `Ofertat`.
- Die Zeile erscheint erst, wenn eine Stadt gesetzt ist: `isMainHeaderTabsScope()` verlangt einen Location-Record und die Tabs `feed`, `home` oder `restaurants`. Im Location-Gate gibt es weder Tabs noch Collapse-Pfeil.
- Gerendert wird sie von `renderMainHeaderTabs()` unter der Element-Id `smart-tabs`, Buttons mit `.smart-header-pill`.
- Sie steht bewusst **ausserhalb** von `.smart-header-shell` (Geschwister-Element, `.smart-header-shell--split` markiert diesen Fall). Sticky ist nur der Shell mit der oberen Leiste; die Zeile scrollt normal mit dem Content weg und laeuft dabei hinter die Leiste (`z-index` 90 gegen 100).
- Innerhalb des Headers weder Linie noch Schatten: `.smart-header-shell--split` schaltet Border und Inset-Shadow ab. Ein Schatten zwischen oberer Leiste und Tab-Zeile wurde als Farbunterschied gelesen und liess die Tabs abgetrennt wirken.
- Der gewohnte Header-Schatten sitzt immer an der untersten Header-Kante: bei sichtbarer Zeile an ihr (`.smart-header-tabs--main::after`), danach an der oberen Leiste (`.smart-header-underline`, im Stapel unter der Zeile - rein per CSS, kann also beim schnellen Scrollen nie nachhinken).
- Solange die Zeile klebt, malt **nur ihre eigene** Kante; `html.smart-header-tabs-stuck .smart-header-underline` tritt zurueck, weil beide sonst uebereinander laegen und der Schatten doppelt so dunkel waere. Die Kante der Zeile wird dabei nie ein- oder ausgeblendet: sie sitzt an der Zeile und faehrt mit demselben `transform` mit - sie *kann* gar nicht nachziehen, sie ist Teil derselben Bewegung. Ein frueherer Uebergang auf ihre Deckkraft, den ein Timer am Ende der Fahrt wieder einschaltete, sprang sichtbar hinterher.
- Der Wechsel zwischen beiden Kanten ist unsichtbar, weil es dieselbe Kante an derselben Stelle ist: ganz eingesteckt sitzt die Schattenkante der Zeile Pixel fuer Pixel dort, wo `.smart-header-underline` sitzt - gleicher Verlauf, gleiche Hoehe. `tests/smart-header-tabs-layout-stability.test.mjs` haelt beides fest.

**Zwei Grundsaetze tragen alles.**

**1. Die Zeile behaelt immer ihren Platz im Dokument.**

- Sie wird nie aus dem Layout genommen, ihre Hoehe aendert sich nie, es wird ihr auch keine gesetzt. Am oberen Seitenanfang steht damit unveraenderlich derselbe Abstand, und beim Ein- und Ausblenden kann sich darunter nichts verschieben.
- Daraus folgt der Rest von selbst: **zu sehen ist die Zeile genau dann, wenn die Seite weit genug oben steht.** Sie sitzt im Fluss unter der Leiste und scrollt hinter sie weg - das macht der Browser allein, ohne Zustand, ohne Timer, ohne Ausgleich. Ganz oben sind die Pills deshalb immer da, egal was vorher war.
- `tests/smart-header-tabs-layout-stability.test.mjs` haelt den Grundsatz am CSS fest: keine Regel auf `.smart-header-tabs--main` darf `height`, `margin-top/bottom`, `padding-top/bottom` oder `display: none` setzen.

**2. Was von ihr zu sehen ist, wird gemessen und nie gerechnet.**

- `measureMainHeaderTabsRow()` misst, wie weit die Zeile unter der Leiste hervorschaut (`zeile.bottom - leiste.bottom`), dazu wie weit sie ohne Kleben hervorschauen wuerde (`hoehe - scrollY` - ihr Platz im Dokument beginnt genau an der Unterkante der Leiste).
- Vorher wurde `scrollY < gerundete Zeilenhoehe` gerechnet. Die Zeile ist aber krumm hoch (40.67px) und Scroll-Positionen sind auf dem Geraet gebrochen: blieb die Seite einen Bruchteil unter dem gerundeten Ziel stehen, galt die laengst verschwundene Zeile weiter als sichtbar - **und der Pfeil machte oben wieder zu, statt aufzumachen.** Genau die Beschwerde. `tests/smart-header-tabs-toggle.test.mjs` haelt den Fall mit einer krummen Zeilenhoehe fest.
- Die gerundete Hoehe gibt es weiter, aber nur noch als Strecke, um die die geheftete Zeile hinter die Leiste faehrt (`--smart-header-tabs-row-height`). Dort ist Aufrunden harmlos, die Fahrt endet ohnehin hinter der Leiste. Entscheidungen faellt sie keine mehr.

Der Pfeil (`toggleMainHeaderTabs()` in `app-shell-runtime-controller.js`) stellt zwei Fragen, beide gemessen: ist die Zeile zu sehen, und liegt ihr Platz noch am Seitenanfang?

- **Zumachen**: geheftet faehrt sie hinter die Leiste. Schaut ausserdem ihr Platz im Fluss noch hervor, faehrt die Seite um **genau diesen gemessenen Teil** weiter - danach steht die Zeile wieder ganz normal im Fluss, nur eben hinter der Leiste. Es bleibt kein Zustand stehen, den ein spaeteres Hochscrollen erst wieder aufloesen muesste. Genau daran ist eine fruehere Loesung zerbrochen: sie nahm die Zeile aus dem Layout (`height: 0`), also brauchte jeder Weg zurueck einen Scroll-Ausgleich - und der hat beim Hochscrollen sichtbar gerissen und geschnappt.
- **Aufmachen**: liegt ihr Platz noch am Seitenanfang (`scrollY <= hoehe + MAIN_HEADER_TABS_TOP_REACH_PX`), faehrt die Seite an den Anfang - dort steht sie ohnehin. Weiter unten wird sie stattdessen unter die Leiste geheftet (`html.smart-header-tabs-stuck` -> `position: sticky`). Sticky belegt exakt denselben Layout-Platz wie relative, das Umschalten aendert also nichts an der Seite: die Leseposition steht auf den Pixel.
- **Mitten in einer Fahrt** zaehlt ihr Ziel (`mainHeaderTabsIntent`) und nicht der Zwischenstand: ein Tipp soll die Bewegung umdrehen. Wuerde dort gemessen, laese der Tipp die halb hervorgefahrene Zeile als "zu sehen" und machte sie ein zweites Mal zu - sichtbar taete er nichts. Dasselbe Ziel dreht auch den Chevron sofort, statt erst nach der Fahrt.
- Herein und hinaus faehrt die geheftete Zeile allein per `transform` (`html.smart-header-tabs-tucked`, Uebergang nur waehrend `html.smart-header-tabs-sliding`), `MAIN_HEADER_TABS_SLIDE_MS` lang. Das `transform` haengt bewusst an **beiden** Klassen - die Zeile im normalen Fluss darf nie verschoben werden, sonst laeuft sie dem Scroll davon.
- Beim Einfahren **von aussen** wird sie erst still hinter die Leiste gestellt, dann erzwingt `forceMainHeaderTabsReflow()` den Startpunkt und erst danach faehrt sie mit Uebergang hervor - sonst faengt die Fahrt beim Ziel an und ist nicht zu sehen. **Faehrt sie schon**, wird nur die Richtung umgedreht: der Uebergang bleibt liegen und rechnet von der Stelle weiter, an der sie steht. Ihn dort abzuschalten hat sie erst hart hinter die Leiste springen lassen und von dort neu anfahren.
- Losgelassen wird erst `MAIN_HEADER_TABS_SLIDE_SETTLE_MS` nach der Fahrt: genau auf der Dauer koennte der Timer einen Frame zu frueh kommen, und die letzten Pixel saehe man springen.

Die Fahrt der Seite macht der Browser selbst (`animateMainHeaderTabsScrollTo()` -> `scrollTo({ behavior: "smooth" })`):

- Das ist dieselbe Mechanik wie ein Wisch, laeuft ausserhalb des Hauptfadens - was der Pfeil oben macht, sieht deshalb aus wie Scrollen und fuehlt sich auch so an. Eine selbstgebaute Fahrt, die jeden Frame `scrollTop` schreibt, kann das nicht: ueber die kurze Strecke einer Zeilenhoehe bewegen sich die letzten Frames um Bruchteile eines Pixels, der Browser rundet auf ganze - und die Bewegung stockt sichtbar.
- Die Laufzeit schaut nur zu und schreibt im Normalfall gar nichts; jeder eigene Schreibvorgang wuerde die Fahrt abwuergen. Eingegriffen wird nur dort, wo der Browser allein nicht durchkommt: der Render-Pfad setzt die Scroll-Position bei jedem Re-Render auf den gemerkten Wert zurueck (`setViewportScrollTop()` / `scheduleViewportScrollTop()`). Laeuft die Strecke zum Ziel wieder auseinander (`MAIN_HEADER_TABS_SCROLL_REGRESSION_PX`) oder steht sie still, ohne angekommen zu sein (`MAIN_HEADER_TABS_SCROLL_STALL_MS`), wird die Fahrt neu angesetzt; nach der Ankunft wird das Ziel noch `MAIN_HEADER_TABS_SCROLL_HOLD_MS` lang gehalten.
- Ein `pointerdown`/`touchstart`/`wheel`/`keydown` bricht sofort alles ab - die Hand des Nutzers hat Vorrang.
- Der Scroll-Weg dafuer ist per CSS garantiert: `.app-shell:has(.smart-header-tabs--main) > main.app-main-scroll` bekommt mindestens eine Bildschirmhoehe minus obere Leiste. Auf einer kurzen Seite (leere Liste) gaebe es ihn sonst nicht und der Pfeil taete nichts.

Sonst fasst die Zeile die Scroll-Position **nirgends** an:

- Der Scroll-Listener aendert keinen Zustand, solange nichts geheftet ist - er schreibt nur die Pfeilrichtung. Geheftet gilt: Runterscrollen (> `MAIN_HEADER_TABS_DOWN_DELTA_PX`) laesst die Zeile hinausfahren, und ganz oben (`scrollY <= MAIN_HEADER_TABS_TOP_EPS_PX`) hoert das Kleben still auf - dort deckt sich der geheftete Platz mit dem normalen (die Zeile klebt 1px hoeher, damit an der Naht nichts durchblitzt). Auf dem Weg nach oben bleibt eine geholte Zeile also stehen und geht erst am Seitenanfang nahtlos in ihren normalen Platz ueber.
- **Beim Start holt niemand mehr die Scroll-Position an den Anfang zurueck.** Der fruehere Boot-Lock hat die vom Browser wiederhergestellte Position bis zu viermal zurueckgezerrt und sich dabei mit dem Render-Pfad gestritten - **beim Neuladen sah man die Seite dadurch springen.** Frisch geladen steht die Seite ohnehin am Anfang, dort sind die Pills zu sehen; nach einem Neuladen bleibt die Position des Nutzers stehen, und die Pills richten sich danach wie immer.
- Der Feed-Stage-Einstiegsscroll (`queueFeedStageAutoPinScroll()` in `feed-view-orchestration-controller.js`) wird weiter uebersprungen, solange `#smart-tabs` existiert.
- Die Zeilenhoehe wird bei `resize` und `visualViewport`-`resize` neu gemessen.

Chrome und Bindung:

- `html.smart-header-tabs-away` markiert, dass die Zeile nicht zu sehen ist. Die Klasse faerbt den Chevron weich indigo und dreht ihn nach oben.
- Der Pfeil haengt an `touchend`, nicht am `click` (`bindMainHeaderTabsToggleTap()`, dieselbe Bindung wie `bindPillTap` bei den Pills): nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen, damit ein Tipp nur einmal zaehlt.
- Die Pills nutzen `data-nav`, haben aber eine eigene Bindung (`bindPillTap`): sie schalten auf `touchend` statt `click` und faerben sich sofort um, damit der Wechsel nicht erst nach dem Re-Render sichtbar wird. Ihr Farb-Uebergang ist deshalb auch kurz (140ms, wie beim Pfeil daneben): bei 220ms zog die Farbe dem Finger sichtbar hinterher, und der Tipp wirkte trotz der sofortigen Umfaerbung verzoegert.
- Chevron-Handler und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Der Scroll-Listener ist rAF-gedrosselt.
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
