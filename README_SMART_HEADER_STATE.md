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

**Vier Grundsaetze tragen alles.**

**1. Die Zeile behaelt immer ihren Platz im Dokument.**

- Sie wird nie aus dem Layout genommen, ihre Hoehe aendert sich nie, es wird ihr auch keine gesetzt. Am oberen Seitenanfang steht damit unveraenderlich derselbe Abstand, und beim Ein- und Ausblenden kann sich darunter nichts verschieben.
- `tests/smart-header-tabs-layout-stability.test.mjs` haelt das am CSS fest: keine Regel auf `.smart-header-tabs--main` darf `height`, `margin-top/bottom`, `padding-top/bottom` oder `display: none` setzen.

**2. Die Laufzeit fasst die Scroll-Position nie an.**

- Kein Boot-Scroll, kein Ausgleich, keine eigene Fahrt. Wo die Seite steht, bestimmen allein der Nutzer und der Browser.
- Jedes Zerren daran hat sich frueher mit der Scroll-Wiederherstellung beim Neuladen und mit dem Render-Pfad gestritten - und genau so sah es aus: **die Seite sprang beim Refresh.**
- Ebenso raus ist die Mindesthoehe, die dem Hauptbereich frueher einen Scroll-Weg garantierte. Sie hing an `--viewport-height`, und das aendert sich auf iOS **waehrend des Scrollens**, weil die Adressleiste einfaehrt (`visualViewport`-`scroll`/`resize`). Das Dokument wuchs dann unter dem Finger - der zweite Grund fuer das Springen nach einem Neuladen.

**3. Was von ihr zu sehen ist, wird gemessen und nie gerechnet.**

- `measureMainHeaderTabsRow()` misst, wie weit die Zeile unter der Leiste hervorschaut (`zeile.bottom - leiste.bottom`), dazu wie weit sie ohne Kleben hervorschauen wuerde (`imFluss` = `hoehe - scrollY`; ihr Platz im Dokument beginnt genau an der Unterkante der Leiste).
- Vorher wurde `scrollY < gerundete Zeilenhoehe` gerechnet. Die Zeile ist aber krumm hoch (40.67px) und Scroll-Positionen sind auf dem Geraet gebrochen: blieb die Seite einen Bruchteil unter dem gerundeten Wert stehen, galt die laengst verschwundene Zeile weiter als sichtbar - und der Pfeil machte wieder zu, statt aufzumachen.

**4. Der Pfeil erscheint erst, wenn er etwas zu tun hat.**

- Oben steht die Zeile ohnehin da, wo sie hingehoert. Dort gibt es nichts zu holen und nichts wegzuraeumen - also ist der Pfeil dort auch nicht da. Er blendet sich ein, sobald ihr Platz weggescrollt ist (`html.smart-header-tabs-offscreen`, gesetzt aus derselben Messung), und wieder aus, sobald man oben ankommt. Geholt bleibt er stehen, sonst koennte man die Zeile nicht wieder wegraeumen.
- Er behaelt dabei seinen Platz in der Kopfzeile: `visibility` statt `display`, sonst rutschte die Icon-Reihe daneben bei jedem Scrollen hin und her. Und es ist `visibility`, nicht nur `opacity` - nur so ist er wirklich weg: nicht anfassbar, nicht anspringbar, nicht vorgelesen. Beim Ausblenden faehrt die Deckkraft zuerst und die Sichtbarkeit springt erst danach (`transition-delay`), beim Erscheinen umgekehrt.
- **Damit gibt es kein "zugemacht" mehr.** Ein Zustand, den der Nutzer oben herstellen, aber mangels Knopf nicht mehr aufloesen koennte, waere eine Falle - also ist er raus. Ein Tipp, der es doch bis in den Handler schafft (etwa waehrend die Seite gerade nach oben laeuft), tut oben nichts.

Damit bleibt genau eine Bewegung, eine reine `transform`-Fahrt:

- **GEHOLT / LOSGELASSEN** (`html.smart-header-tabs-stuck`, dazu `-tucked` fuer die Fahrt): weiter unten, wo ihr Platz laengst weggescrollt ist, klebt die Zeile per `position: sticky` unter der Leiste. Sticky belegt exakt denselben Layout-Platz wie relative - die Leseposition steht auf den Pixel.

Sonst macht der Browser die Arbeit allein: die Zeile sitzt im Fluss unter der Leiste und scrollt hinter sie weg. Kein Zustand, kein Timer, kein Ausgleich - der Scroll-Listener aendert nur dann etwas, wenn die Zeile klebt (Runterscrollen laesst sie los, ganz oben hoert das Kleben nahtlos auf).

Was beim Fahren wichtig ist:

- **Der Uebergang muss im berechneten Stil stehen, bevor der Wert wechselt.** `forceMainHeaderTabsReflow()` liest dafuer `getComputedStyle` und `getBoundingClientRect`. Das ist kein Feinschliff: WebKit (Safari, also jedes iPhone) verlangt den Uebergang schon im Zustand davor - werden Uebergang und Wert in derselben Aufgabe gesetzt, springt die Zeile ohne Fahrt an ihr Ziel. Chromium traegt ihn nachtraeglich ein und verdeckt den Fehler.
- **`calc()` bleibt flach.** `calc(-1 * (a + b))` hat WebKit nicht zuverlaessig aufgeloest, die Zeile stand dann still; `calc(-1 * a - b)` laeuft. Der Test haelt das fest.
- **Faehrt sie schon**, wird nur die Richtung umgedreht: der Uebergang bleibt liegen und rechnet von der Stelle weiter, an der sie steht. Ihn dort abzuschalten hat sie erst hart hinter die Leiste springen lassen und von dort neu anfahren.
- **Mitten in einer Fahrt** zaehlt ihr Ziel (`mainHeaderTabsIntent`) und nicht der Zwischenstand: ein Tipp soll die Bewegung umdrehen. Wuerde dort gemessen, laese der Tipp die halb hervorgefahrene Zeile als "zu sehen" und machte sie ein zweites Mal zu. Dasselbe Ziel dreht auch den Chevron sofort. Ob es den Pfeil ueberhaupt gibt, haengt dagegen nie am Ziel einer Fahrt, sondern allein an der Scroll-Position.
- Losgelassen wird erst `MAIN_HEADER_TABS_SLIDE_SETTLE_MS` nach der Fahrt: genau auf der Dauer koennte der Timer einen Frame zu frueh kommen, und die letzten Pixel saehe man springen.

Der Schatten wird nie geschaltet - das loest die Geometrie:

- Die Kante der Zeile (`.smart-header-tabs--main::after`) sitzt an ihr und faehrt mit demselben `transform` mit. Was gar nicht erst geschaltet wird, kann auch nicht nachziehen. Ein Deckkraft-Uebergang darauf lief auf WebKit dem `transform` sichtbar hinterher.
- Geklebt malt diese Kante, und `.smart-header-underline` tritt zurueck (`html.smart-header-tabs-stuck`). Sonst malt die Kante unter der Leiste, und die Zeile deckt sie ab, solange sie davor steht.
- Beide Kanten sind derselbe Verlauf aus derselben Hoehe (`--smart-header-edge-height`); der Test haelt das fest.

Chrome und Bindung:

- `html.smart-header-tabs-away` markiert, dass die Zeile nicht zu sehen ist. Die Klasse faerbt den Chevron weich indigo und dreht ihn nach oben.
- Der Pfeil haengt an `touchend`, nicht am `click` (`bindMainHeaderTabsToggleTap()`, dieselbe Bindung wie `bindPillTap` bei den Pills): nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen.
- Die Pills nutzen `data-nav`, haben aber eine eigene Bindung (`bindPillTap`): sie schalten auf `touchend` statt `click` und faerben sich sofort um. Ihr Farb-Uebergang ist deshalb auch kurz (140ms, wie beim Pfeil daneben): bei 220ms zog die Farbe dem Finger sichtbar hinterher.
- Chevron-Handler und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Der Scroll-Listener ist rAF-gedrosselt und misst einmal pro Bild.
- Die Zeilenhoehe wird bei `resize` und `visualViewport`-`resize` neu gemessen.
- `--feed-location-gate-header-height` deckt nur die obere Leiste ab, weil die Tab-Zeile weggescrollt ist, bevor im Gate etwas sticky wird.
- `Restaurants` ist deshalb kein Drawer-Eintrag mehr.

Nachgemessen wird auf beiden Engines: Playwright **WebKit** (iPhone 13, iPhone 14 Pro Max) und **Chromium** (Galaxy S9+, Galaxy Tab S4). WebKit ist dabei nicht optional - beide Fahrt-Fehler oben (Uebergang in derselben Aufgabe, verschachteltes `calc()`) waren auf Chromium unsichtbar.

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
