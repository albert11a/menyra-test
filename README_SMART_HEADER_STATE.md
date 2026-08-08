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

**Der Riss oben unter der Kopfzeile (08.08.)**

Auf dem Geraet stand in Chrome iOS ueber der Kopfzeile ein Band, in dem der Seiteninhalt durchschien - und zwar **immer nur am Ende des Feeds, nie in der Mitte**. Nachgemessen am Standbild: die Header-Zeile stand bei 23-87px, das Band davor war 23px hoch, und 23px war genau die Safe-Area-Polsterung der Kopfzeile. Im Dokument steht ueber ihr nichts (der Drawer ist `fixed`), und die Geometrie war in Chromium in jeder Lage korrekt - es war also kein Layout-Fehler, sondern ein Mal-Fehler.

Drei Dinge kamen zusammen; die ersten beiden loesten aus, das dritte machte es sichtbar:

1. **Am Seitenende schrieb jeder Render die Scroll-Position.** "Gekappt" wurde daran erkannt, dass die Seite am Ende dessen steht, was das Dokument hergibt - dort steht aber auch, wer einfach bis nach unten gewischt ist, und ein frisch gebautes DOM ist dort immer kurz zu kurz. Geschrieben wurde sofort und noch einmal im naechsten Frame; das erste Schreiben konnte gar nichts bewirken und riss nur den laufenden Scroll vom Compositor an den Hauptthread. Jetzt heisst gekappt: *das Dokument gibt die Stelle gerade nicht her*, und geschrieben wird erst, wenn sie ankommen kann und der Finger stehengeblieben ist.
2. **Die Kopfzeile verliess bei jedem Render den Renderbaum.** Die alten Knoten hinterher wieder einzuhaengen half nicht - der Knoten ging mit `innerHTML` trotzdem raus und kam per `replaceWith` wieder rein, also zwei Wechsel statt einem. Jetzt wird das frische Markup daneben aufgebaut und kindweise eingesetzt (`applyAppHtmlKeepingHeader`); die Header-Knoten bleiben stehen und werden an Ort und Stelle angeglichen. Passt die Form nicht, faellt es auf `innerHTML` zurueck.
3. **Die Kopfzeile hatte keinen eigenen Hintergrund** und **ihre Hoehe hing an `env(safe-area-inset-top)`**, das iOS mitten im Scrollen aendert. Beides ist weg: die Safe-Area wird einmal gemessen und festgeschrieben (`--smart-header-safe-top`), und das klebende Element malt selbst deckend.

Nachgemessen wird das in `tests/e2e/smart-header-stability.spec.ts` auf WebKit (iPhone 13, iPhone 14 Pro Max) und Chromium (Galaxy S9+, Galaxy Tab S4), dazu `tests/smart-header-rerender-scroll.test.mjs` und `tests/smart-header-safe-area-freeze.test.mjs`.

**Vier Grundsaetze tragen alles.**

**1. Die Zeile behaelt immer ihren Platz im Dokument.**

- Sie wird nie aus dem Layout genommen, ihre Hoehe aendert sich nie, es wird ihr auch keine gesetzt. Am oberen Seitenanfang steht damit unveraenderlich derselbe Abstand, und beim Ein- und Ausblenden kann sich darunter nichts verschieben.
- `tests/smart-header-tabs-layout-stability.test.mjs` haelt das am CSS fest: keine Regel auf `.smart-header-tabs--main` darf `height`, `margin-top/bottom`, `padding-top/bottom` oder `display: none` setzen.

**2. Die Laufzeit fasst die Scroll-Position nie an.**

- Kein Boot-Scroll, kein Ausgleich, keine eigene Fahrt. Wo die Seite steht, bestimmen allein der Nutzer und der Browser.
- Jedes Zerren daran hat sich frueher mit der Scroll-Wiederherstellung beim Neuladen und mit dem Render-Pfad gestritten - und genau so sah es aus: **die Seite sprang beim Refresh.**
- Ebenso raus ist die Mindesthoehe, die dem Hauptbereich frueher einen Scroll-Weg garantierte. Sie hing an `--viewport-height`, und das aendert sich auf iOS **waehrend des Scrollens**, weil die Adressleiste einfaehrt (`visualViewport`-`scroll`/`resize`). Das Dokument wuchs dann unter dem Finger - der zweite Grund fuer das Springen nach einem Neuladen. `tests/smart-header-tabs-layout-stability.test.mjs` haelt beides fest: weder die Zeile noch `.app-main-scroll` darf ihre Hoehe aus der Bildhoehe beziehen.

**3. Der erste Wisch nach einem Neuladen darf nichts kosten.**

- Was von der Zeile zu sehen ist, sagt `readMainHeaderTabsRow()` - abgeleitet aus Zustand und Scroll-Position, ohne das DOM anzufassen: im Fluss `hoehe - scrollY`, geheftet ganz da oder ganz dahinter, waehrend einer Fahrt zaehlt ohnehin ihr Ziel (`mainHeaderTabsIntent`).
- Gemessen (`measureMainHeaderTabsRowHeight()`) wird nur dann, wenn sich die Hoehe wirklich aendern kann: beim Aufbau der Kopfzeile, vor jeder Fahrt des Pfeils und bei `orientationchange`.
- **Ausdruecklich nicht** an `resize` und schon gar nicht an `visualViewport`. Beide melden sich auf iOS mitten im Scrollen, sobald die Adressleiste einfaehrt - also genau beim ersten Wisch nach einem Neuladen. Daran hingen einmal drei erzwungene Layouts und zwei Schreibvorgaenge am `<html>`; der Wisch blieb sichtbar haengen und sprang nach. Die Zeilenhoehe aendert sich dabei ohnehin nicht: die Adressleiste macht das Bild niedriger, nicht schmaler.
- Ebenso wenig misst der Scroll-Listener. Zwei `getBoundingClientRect()` pro Bild erzwingen jedes Mal ein Layout des ganzen Dokuments, und der Feed rechnet mit `content-visibility` ohnehin schon nach.
- `--smart-header-tabs-row-height` wird nur geschrieben, wenn sich der Wert aendert: `setProperty` schreibt das `style`-Attribut am `<html>` auch mit unveraendertem Wert neu, und daran haengt der MutationObserver aus `index.html`.
- Gerechnet wird mit der **krummen** Hoehe (40.67px). An der gerundeten ist es schon einmal danebengegangen: blieb die Seite einen Bruchteil unter dem gerundeten Wert stehen, galt die laengst verschwundene Zeile weiter als sichtbar - und der Pfeil machte zu, statt aufzumachen. Gerundet wird nur die Fahrstrecke, die endet ohnehin hinter der Leiste.
- Die vier Punkte haelt `tests/smart-header-tabs-toggle.test.mjs` fest (Abschnitt "Was das Scrollen kosten darf"): woran die Zeile haengt, dass Scrollen nicht misst, dass dieselbe Hoehe nie zweimal geschrieben wird, und dass die Entscheidung an der krummen Hoehe faellt.

**4. Der Pfeil erscheint erst, wenn er etwas zu tun hat.**

- Oben steht die Zeile ohnehin da, wo sie hingehoert. Dort gibt es nichts zu holen und nichts wegzuraeumen - also ist der Pfeil dort auch nicht zu sehen. Er blendet sich ein, sobald ihr Platz weggescrollt ist, und wieder aus, sobald man oben ankommt. Geholt bleibt er stehen, sonst koennte man die Zeile nicht wieder wegraeumen.
- Er nimmt dabei **keinen** Platz weg: die Icons daneben (Pin, Globus, Tasche) stehen buendig an der rechten Kante. Kommt er dazu, gleiten sie um seine Breite nach links; geht er wieder, gleiten sie zurueck.
- **Bewegt wird per `transform`, nicht per Breite.** Der Pfeil behaelt seinen Platz immer und wechselt nur die Deckkraft (`opacity`); die Icons daneben fahren per `translateX(Pfeilbreite + Luecke)`. Beides erledigt der Compositor - dieselbe Ebene, auf der iOS auch scrollt.
- Vorher fuhr die **Breite** des Pfeils samt negativem Aussenabstand. Das ist eine Layout-Fahrt: 200ms lang ein Neuvermessen der Icon-Reihe, der Header-Zeile und der klebenden Leiste in *jedem* Bild, auf dem Hauptthread - angestossen genau beim Ueberqueren der Scroll-Marke, also mitten im Wischen. Daher das Stocken. Mit ihr sind `min-width: 0`, die Null-Polsterung, die Null-Rahmen und `overflow: hidden` weg: die brauchte nur, wer eine Breite wirklich auf 0 bringen muss.
- `tests/smart-header-tabs-layout-stability.test.mjs` haelt das allgemein fest: **was das Scrollen anstoesst, darf keine Layout-Eigenschaft fahren.** Aufklappende Vorschlagslisten duerfen es weiter - die stossen Finger und Tastatur an.
- Die beiden Klassen des Pfeils sitzen an der **Icon-Reihe**, nicht am `<html>`: `smart-header-actions--collapse-ready` (gibt es ihn ueberhaupt) und `smart-header-actions--collapse-away` (wohin zeigt er). Eine Klasse am Wurzelelement entwertet den Stil des ganzen Dokuments, und sie wechselt genau beim Scrollen. Beim normalen Scrollen wechselt damit **keine** Klasse mehr am `<html>`.
- Ob es den Pfeil gibt, sagt der Render der Icon-Reihe mit (`smart-header-actions--with-collapse`) - frueher stand dort ein `:has()`, das bei jedem Stil-Neuaufbau mit ausgewertet wurde.
- **Pfeil und Icons kreuzen sich, ohne sich zu ueberschneiden.** Der Platz, den die Icons einnehmen, wenn es den Pfeil nicht gibt, ist genau seiner - waehrend der Fahrt laufen sie also zwangslaeufig ueber ihn hinweg. Deshalb blendet er erst auf, wenn die Fahrt durch ist (`transition-delay` = Fahrtdauer), und ist umgekehrt weg, bevor sie ankommt (120ms statt 200ms, ohne Warten). Beide Dauern lesen dieselbe Variable `--smart-header-collapse-glide`, damit sie nicht auseinanderlaufen koennen; ein Test haelt das Verhaeltnis fest.
- Wirklich weg ist er trotzdem: `visibility` springt am Ende der Blende auf `hidden` (Verzoegerung in Hoehe der Fahrtdauer) - nicht anfassbar, nicht anspringbar, nicht vorgelesen. Beim Erscheinen umgekehrt, sofort.
- Auf schmalen Geraeten setzt die Regel nur den **Wert** (`--smart-header-collapse-width`), nicht die Breite selbst - genau eine Stelle darf dem Pfeil eine Breite geben, und der Test haelt das fest.
- Die Icon-Breiten selbst bleiben unveraendert: es rutscht nur, es waechst nichts.
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
- Pfeil und Pills haengen an `touchend`, nicht am `click`: nach dem Scrollen laesst iOS den Klick warten oder schluckt ihn. Ein Wisch, der auf dem Knopf beginnt, schaltet nichts; der Klick danach wird 450ms lang uebersprungen. Beide teilen sich dieselbe Bindung (`core/common/tap-bind-utils.js`) - vorher stand sie zweimal fast wortgleich da.
- **Ein Tipp auf eine Pill faerbt sofort um.** `setState()` rendert synchron und baut die gesamte Oberflaeche neu; Umfaerben und Neuaufbau lagen damit in derselben Aufgabe, und der Browser zeichnet erst, wenn eine Aufgabe fertig ist. Man sah gar nichts, bis der Neuaufbau durch war - das fuehlte sich verzoegert an. Der Neuaufbau laeuft jetzt **zwei** Frames spaeter: rAF-Rueckrufe laufen am Anfang eines Bildes, noch vor dem Zeichnen, ein einzelner haette ihn also wieder vor die Farbe gezogen.
- Ihr Farb-Uebergang ist kurz (140ms, wie beim Pfeil daneben): bei 220ms zog die Farbe dem Finger sichtbar hinterher.
- Chevron-Handler und Scroll-Listener sitzen im App-Shell-Controller (nicht in den Event-Bind-Utils), damit sie sich denselben Runtime-State teilen. Der Scroll-Listener ist rAF-gedrosselt und misst einmal pro Bild.
- Die Zeilenhoehe wird bei `orientationchange` neu gemessen - nicht bei `resize`, siehe Grundsatz 3.
- `forceLightUiChrome()` in `index.html` schreibt seine Meta-Tags nur noch bei echter Aenderung. Es haengt am MutationObserver auf `<html>` (Klasse und Style), und den weckt jeder Zustandswechsel der Zeile. `theme-color` neu zu setzen laesst Safari seine eigene Leiste neu einfaerben - das sah nach einem Neuladen wie ein kurz verschwindender Header aus.
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

- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js` (darin `applyAppHtmlKeepingHeader`, `restoreViewportScrollTop`)
- `apps/menyra-social/core/app-shell/shell-dom-runtime-controller.js`
- `apps/menyra-social/core/app-events/app-events-main-bind-utils.js`
- `apps/menyra-social/core/app-events/app-events-shell-bind-utils.js`
- `apps/menyra-social/core/ui/main-shell-render-utils.js`
- `apps/menyra-social/index.html`

Hinweis fuer weitere Anpassungen:

- Optische Header-Anpassungen zuerst in `apps/menyra-social/index.html`.
- Event- oder Tab-Verhalten zuerst in `app-shell-runtime-controller.js` und `app-events-shell-bind-utils.js`.
- Wenn Badge oder Drawer-Position komisch wirkt, zuerst den Header-Badge-Anchor und `updateNotificationBadges()` pruefen.
