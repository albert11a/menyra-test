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
- Der gewohnte Header-Schatten sitzt immer an der untersten Header-Kante: bei sichtbarer Zeile an ihr, danach an der oberen Leiste (`.smart-header-underline`, im Stapel unter der Zeile - rein per CSS, kann also beim schnellen Scrollen nie nachhinken).

**Der eine Grundsatz: die Zeile behaelt immer ihren Platz im Dokument.**

- Sie wird nie aus dem Layout genommen, ihre Hoehe aendert sich nie, es wird ihr auch keine Hoehe gesetzt. Am oberen Seitenanfang steht damit unveraenderlich derselbe Abstand, und beim Ein- und Ausblenden kann sich darunter nichts verschieben.
- Daraus folgt alles Weitere von selbst: **zu sehen ist die Zeile genau dann, wenn die Seite weit genug oben steht.** Sie sitzt im Fluss unter der Leiste und scrollt hinter sie weg - das macht der Browser allein, ohne Zustand, ohne Timer, ohne Ausgleich. Ganz oben sind die Pills deshalb immer da, egal was vorher war.
- `tests/smart-header-tabs-layout-stability.test.mjs` haelt den Grundsatz am CSS fest: keine Regel auf `.smart-header-tabs--main` darf `height`, `margin-top/bottom`, `padding-top/bottom` oder `display: none` setzen.

Der Pfeil tut nichts anderes, er tut es nur von selbst (`app-shell-runtime-controller.js`):

- **Oben**, wo der Platz der Zeile noch im Bild liegt (`scrollY <= rowHeight`), faehrt er die **Seite** um eine Zeilenhoehe: zu heisst auf `rowHeight` scrollen, auf heisst auf `0` scrollen. Danach ist die Zeile weggescrollt wie nach jedem Wisch - und Hochscrollen holt sie genauso zurueck. Es bleibt kein Zustand stehen, den das Hochscrollen erst wieder aufloesen muesste.
- Genau daran ist die vorige Loesung zerbrochen: sie nahm die Zeile aus dem Layout (`height: 0`), also brauchte jeder Weg zurueck einen Scroll-Ausgleich um ihre Hoehe - und der hat beim Hochscrollen sichtbar gerissen und geschnappt.
- **Weiter unten**, wo ihr Platz laengst ausser Sicht ist, heftet er sie unter die Leiste (`html.smart-header-tabs-stuck` -> `position: sticky`) und laesst sie wieder los. Sticky belegt exakt denselben Layout-Platz wie relative, das Umschalten aendert also nichts an der Seite: die Leseposition steht auf den Pixel.
- Herein und hinaus faehrt sie dabei allein per `transform` (`html.smart-header-tabs-tucked`, Uebergang nur waehrend `html.smart-header-tabs-sliding`): hinter der Leiste hervor und wieder dahinter zurueck, `MAIN_HEADER_TABS_SLIDE_MS` lang. Das `transform` haengt bewusst an **beiden** Klassen - die Zeile im normalen Fluss darf nie verschoben werden, sonst laeuft sie dem Scroll davon.
- Beim Einfahren erzwingt `forceMainHeaderTabsReflow()` einen Reflow zwischen Startpunkt und Uebergang, sonst faengt die Fahrt beim Ziel an und ist nicht zu sehen.
- Die eigene Fahrt der Seite (`animateMainHeaderTabsScrollTo()`) laeuft von Hand ueber `requestAnimationFrame` statt ueber `behavior: "smooth"`: der Render-Pfad setzt die Scroll-Position bei jedem Re-Render auf den gemerkten Wert zurueck (`setViewportScrollTop()` / `scheduleViewportScrollTop()`), und wer jeden Frame schreibt, gewinnt. Danach haelt sie `MAIN_HEADER_TABS_SCROLL_HOLD_MS` lang dagegen. Ein `pointerdown`/`touchstart`/`wheel`/`keydown` bricht sofort ab - die Hand des Nutzers hat Vorrang.
- Solange die eigene Fahrt laeuft, zaehlt ihre Bewegung nicht als Geste, und `isMainHeaderTabsRowVisible()` antwortet mit dem **Ziel** der Fahrt: der Pfeil dreht sich damit sofort und nicht erst nach 260ms.
- Der Scroll-Weg dafuer ist per CSS garantiert: `.app-shell:has(.smart-header-tabs--main) > main.app-main-scroll` bekommt mindestens eine Bildschirmhoehe minus obere Leiste. Auf einer kurzen Seite (leere Liste) gaebe es ihn sonst nicht und der Pfeil taete nichts.
- Der Scroll-Listener selbst aendert **keinen** Zustand mehr, solange nichts geheftet ist - er schreibt nur die Pfeilrichtung. Geheftet gilt: Runterscrollen (> `MAIN_HEADER_TABS_DOWN_DELTA_PX`) laesst die Zeile hinausfahren, und ganz oben (`scrollY <= MAIN_HEADER_TABS_TOP_EPS_PX`) hoert das Kleben still auf - dort deckt sich der geheftete Platz mit dem normalen (die Zeile klebt 1px hoeher, damit an der Naht nichts durchblitzt).
- Auf dem Weg nach oben bleibt eine geholte Zeile also stehen und geht erst am Seitenanfang nahtlos in ihren normalen Platz ueber.
- Beim App-Start stehen die Tabs offen und bleiben es, bis der Nutzer die Seite selbst anfasst. Der Boot-Lock (`mainHeaderTabsBootLockActive`) holt eine Scroll-Position, die niemand ausgeloest hat, an den Anfang zurueck - begrenzt auf `MAIN_HEADER_TABS_BOOT_MAX_CORRECTIONS`, damit er sich nicht mit einem legitimen Auto-Scroll hochschaukelt. Freigegeben wird er beim ersten `pointerdown`/`touchstart`/`wheel`/`keydown` und vom Pfeil-Handler selbst.
- Der Feed-Stage-Einstiegsscroll (`queueFeedStageAutoPinScroll()` in `feed-view-orchestration-controller.js`) wird uebersprungen, solange `#smart-tabs` existiert. Mit der Tab-Zeile bestand er praktisch nur noch daraus, genau diese Zeile wegzuschieben.
- Die Zeilenhoehe wird zur Laufzeit gemessen (`measureMainHeaderTabsRowHeight()`), auf ganze Pixel **aufgerundet** und als `--smart-header-tabs-row-height` gesetzt: sie ist der Massstab fuer beide Bewegungen, und ein Rest von 0.67px bliebe sonst als Streifen unter der Leiste stehen. Nachgemessen wird bei `resize` und `visualViewport`-`resize`.
- `html.smart-header-tabs-away` markiert, dass die Zeile nicht zu sehen ist. Die Klasse faerbt den Chevron weich indigo und dreht ihn nach oben: der Hinweis, dass man die Tabs dort wieder aufmachen kann.
- Der Pfeil haengt an `touchend`, nicht am `click` (`bindMainHeaderTabsToggleTap()`, dieselbe Bindung wie `bindPillTap` bei den Pills): nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen, damit ein Tipp nur einmal zaehlt.
- Die Pills nutzen `data-nav`, haben aber eine eigene Bindung (`bindPillTap`): sie schalten auf `touchend` statt `click` und faerben sich sofort um, damit der Wechsel nicht erst nach dem Re-Render sichtbar wird.
- Chevron-Handler und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Der Scroll-Listener ist rAF-gedrosselt.
- Festgehalten wird das Verhalten in `tests/smart-header-tabs-toggle.test.mjs`, inklusive des direkten Vergleichs "mit Pfeil" gegen "ohne Pfeil" auf dem Weg nach oben: Bild fuer Bild dieselbe Position, dasselbe Bild, derselbe Abstand.
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
