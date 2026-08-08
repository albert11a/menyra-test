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

**Die Kopfzeile kommt dem Scrollen nicht mehr hinterher-hinken (Stand 08.08., zweiter Anlauf)**

Der Header bleibt `position: sticky` - der feste Header samt Platzhalter aus dem ersten Anlauf ist zurueckgenommen und kommt nicht wieder. Was der Anlauf an belastbaren Befunden gebracht hat, ist gezielt wieder drin; dazu kommen drei neue Griffe:

1. **Die Kopfzeile verlaesst den Renderbaum nicht mehr.** Ein Render ersetzte das gesamte DOM (`appEl.innerHTML`); WebKit baute die Compositing-Ebene der klebenden Kopfzeile dabei jedes Mal neu, und fuer einen Frame war dort nichts. Jetzt wird das frische Markup daneben aufgebaut und kindweise eingesetzt (`applyAppHtmlKeepingHeader`): die Header-Knoten bleiben stehen, alles andere wird ausgetauscht. Passt die Form nicht (Moduswechsel, Karte, Chat), faellt es auf `innerHTML` zurueck, und `reuseSmartHeaderNodes` haengt die alten Knoten wieder ein.
2. **Verglichen wird Markup mit Markup - nie der lebende DOM-Stand.** Nach dem Binden traegt der lebende Header die Spuren der Laufzeit (`data-fast-tap-bound`, aria-Werte, von lucide ersetzte Icons). Ein Vergleich mit dem lebenden Stand fiel bei JEDEM Render ungleich aus, und der Header-INHALT wurde jedes Mal neu gebaut, obwohl der aeussere Knoten stehen blieb - der latente Fehler des 07.08.-Stands. Gemerkt wird deshalb, was der letzte Aufbau GERENDERT hat (`lastSmartHeaderMarkup`), und nur dagegen wird verglichen.
3. **Die Leseposition wird nur zurueckgeholt, wenn der Neuaufbau sie wirklich gekappt hat** (`restoreViewportScrollTop` / `scheduleViewportScrollRestore`): das Dokument gibt die Stelle gerade nicht her, die Seite steht im naechsten Frame noch dort, wo der Render sie abgesetzt hat, und das Ziel ist wieder erreichbar. Ein blindes Zurueckschreiben - sofort, im naechsten Frame und per Timer - riss die Seite auf iOS mitten im Wischen zurueck; genau das sah man als Springen der Inhalte am Header.
4. **Das klebende Element malt selbst deckend und faehrt auf einer eigenen Ebene.** Die Shell hatte keinen Hintergrund; der Compositor musste sie gegen den Inhalt dahinter blenden, und wo dabei etwas fehlte, schien der Inhalt durch. Jetzt malt sie deckend (`--smart-header-surface`), und `translateZ(0)` + `will-change: transform` geben ihr die Ebene, die der Scrolling-Thread selbst haelt - dieselbe, auf der iOS auch scrollt. Waehrend Chrome iOS seine Adressleiste ein- und ausfaehrt, hinkt so nichts mehr am Hauptthread hinterher. Auf der Karte (im Fluss des eigenen Wrappers) ausdruecklich `transform: none`.
5. **Die feste Blende** (`.smart-header-backdrop`) gegen das Nachhinken am Seitenende - siehe eigener Abschnitt unten.
6. **Ausdruecklich NICHT wieder drin:** die eingefrorene Safe-Area. Das Messgeraet auf dem Geraet (`?debug-build=1`, Stand des ersten Anlaufs) hat gezeigt: `env(safe-area-inset-top)` aendert sich waehrend des Scrollens nie ("safe live 0 (0..0)"). Die Polsterung haengt wieder direkt an `--safe-area-top`.

Drei Griffe gegen das Blitzen der Kacheln:

- **`.feed-card` merkt sich ihre echte Hoehe** (`contain-intrinsic-size: auto 620px`): eine einmal gerechnete Karte rechnet beim naechsten Vorbeiscrollen mit ihrer wirklichen Hoehe statt mit der Schaetzung. Vorher sprang die Seite beim Hochscrollen um die Differenz jeder Karte, und das Nachrechnen sah man als Blitzen.
- **Das offene Location-Feld schliesst nur ein TIPP, keine Scroll-Geste.** Vorher schloss schon das `pointerdown`: wer bei offenem Feld den Feed scrollte, bekam mitten in der Geste den Klassenwechsel am `<html>`, das geleerte Dropdown und das blur samt einfahrender Tastatur - die ganze Seite rechnete um. Jetzt entscheidet das `pointerup`: unbewegt heisst Tipp und macht zu, gezogen heisst Scrollen und laesst das Feld in Ruhe (`tests/smart-header-location-pin.test.mjs`).
- **Der Pin-Sync der Business-Tabs misst einmal pro Bild.** Vorher las er in jedem Scroll-Event `getComputedStyle` UND `getBoundingClientRect` - zwei erzwungene Layouts pro Event, zusaetzlich auch an `visualViewport`-"scroll" gebunden, das waehrend Adressleiste und Tastatur feuert. Jetzt rAF-gedrosselt, der sticky-Abstand wird einmal gelesen und nur nach `resize` neu.

Nachgemessen wird das in `tests/e2e/smart-header-stability.spec.ts` (WebKit iPhone 13 / iPhone 14 Pro Max, Chromium Galaxy S9+ / Galaxy Tab S4; in Umgebungen mit vorinstalliertem Chromium zeigt `MNYRA_E2E_CHROMIUM` auf die Binary) und in `tests/smart-header-rerender-scroll.test.mjs`.

**Die feste Blende - der Spalt am Seitenende**

Der letzte Rest des Fehlers zeigte sich **nur am Seitenende**: ganz unten stehen und hochscrollen, oder ein Stueck hochscrollen und wieder ganz runter. In Chrome (und anderen Nicht-Safari-Browsern auf iOS) deutlich, in Safari kaum. Dort erschien fuer ein paar Bilder Seiteninhalt an der Stelle, an der die Kopfzeile stehen sollte.

Genau dort faehrt Chrome iOS seine Adressleiste ein und aus. `position: sticky` wird aus dem Scroll-Offset gerechnet, und fuer diese Bilder ist der Offset veraltet - die Kopfzeile wird versetzt gezeichnet, waehrend der Inhalt schon an der neuen Stelle steht.

**Was NICHT geht - und warum es nichts zu holen gibt.** Die Kopfzeile laesst sich waehrend der Fahrt der Adressleiste nicht an sie koppeln. Chrome auf iOS benutzt die WebView des Betriebssystems; wechselt die Adressleiste ihren Zustand, muss Chrome die WebView neu vermessen, und die WebView gibt dafuer keine feingranulare Kontrolle her ([Chromium-Entwickler dazu](https://generatepress.com/forums/topic/sticky-navigation-gap-on-scroll-chrome-ios/)). Kein CSS und kein JavaScript einer Seite kann ein Element waehrend dieser Fahrt Bild fuer Bild an die Leiste heften - die Messung zeigt es: die Kopfzeile steht sofort an ihrer Endstelle, die Leiste zieht 14 Bilder nach. Der Spalt laesst sich deshalb nur **fuellen**, nicht verhindern. Das erledigen der Ueberstand nach oben und `#smartHeaderGuard`.

**Erzwungene Compositing-Ebenen gehoeren NICHT an die Kopfzeile.** `transform: translateZ(0)` + `will-change: transform` + `backface-visibility: hidden` standen einmal an `.smart-header-shell` und an der gehefteten Pill-Zeile. Genau diese Kombination laesst WebKit auf iOS die **Kinder** eines Elements beim Scrollen nicht mehr malen: die Flaeche bleibt stehen, Logo und Icons verschwinden, bis das Scrollen aufhoert. Am Geraet sah das aus wie "Kopfzeile weg, nur noch ihre Flaeche"; die Bildschirmaufnahme zeigte sieben Bilder ohne Kopfzeile. Es ist ein bekannter WebKit-Fehler, kein Feinschliff - beides ist raus und darf nicht zurueckkommen. Die beiden **leeren** Schutz-Divs (`.smart-header-backdrop`, `#smartHeaderGuard`) duerfen ihre Ebene behalten: ohne Kinder kann der Fehler dort nicht greifen.

**Der eigentliche Hergang - ausgemessen, nicht vermutet.** Eine Bildschirmaufnahme vom Geraet (60 fps, 149 Bilder) wurde Zeile fuer Zeile ausgewertet: pro Bild die Unterkante der Browserleiste und die Oberkante des Hamburger-Icons.

```
Bild 43-57   Browserleiste endet bei 246   Hamburger bei 345   Abstand 33px
Bild 58      Browserleiste endet bei 251   Hamburger bei 435   Abstand 61px
Bild 59-71   Leiste wandert 256 -> 330     Hamburger bleibt 435
Bild 72+     Browserleiste endet bei 336   Hamburger bei 435   Abstand 33px
```

**Die Kopfzeile bewegt sich nicht.** Sie steht ueber die ganze Stoerung hinweg still (435, konstant). Was faehrt, ist die **Adressleiste von Chrome**, ueber 14 Bilder. Die Seite steht sofort an ihrer Endstelle, die Leiste zieht langsam nach - und dazwischen wird ein Streifen frei, der sonst dauerhaft **hinter** der Adressleiste liegt. Dort steht Seiteninhalt, weil die Kopfzeile in Ruhe genau buendig an dessen Unterkante anfaengt.

Damit sind zwei fruehere Griffe als untauglich belegt: ein Element mit `position: fixed` haengt am **selben** Viewport-Ursprung wie die Kopfzeile und liegt damit genau dort, wo sie ohnehin ist - nie in dem Streifen darueber. Und ein Ueberstand an einem Pseudo-Element traegt dieselbe Unsicherheit.

**Was traegt, ist echte Box-Geometrie.** `.smart-header-shell` reicht um `--smart-header-overscan` (64px) weiter nach oben und malt dort ihre eigene Flaeche: negativer Aussenabstand zieht die Box hoch, gleich grosse Polsterung schiebt ihren Inhalt zurueck an seinen Platz, und `top` wandert um denselben Betrag ins Negative, damit die sichtbare Kante weiter bei 0 klebt. Unterkante und alles darunter bleiben auf den Pixel - nachgemessen: dieselbe Dokumenthoehe, sichtbare Kante weiter bei 0, Box bei -64. Auf der Karte ist der Ueberstand abgeschaltet.

**Was die Bildschirmaufnahme zeigt.** Eine Aufnahme vom Geraet (60 fps), Bild fuer Bild ausgewertet, hat den Fall entschieden. Ueber rund sieben aufeinanderfolgende Bilder steht zwischen der Adressleiste des Browsers und der Kopfzeile ein Streifen Seiteninhalt - erst der Rand des Avatars mit `FANS`/`INFO`, dann die Ueberschrift, dann `PRISHTINA / BUSINESS`, dann der `NDIQ`-Knopf. Der Inhalt steht dabei jeweils **unveraendert** da, wo er auch im Bild davor stand; die **Kopfzeile** ist rund 25px nach unten versetzt und gibt den Streifen frei, den sie sonst verdeckt. Es ist also kein Sprung des Inhalts, sondern ein Versatz der Kopfzeile gegen ihn.

**Zwei Griffe, zwei verschiedene Faelle.** Ein Versatz kann in beide Richtungen gehen, und kein einzelner Griff deckt beide ab:

| | Kopfzeile zu **tief** (Fall der Aufnahme) | Kopfzeile zu **hoch** |
|---|---|---|
| `.smart-header-shell::before` (Ueberstand) | deckt | deckt **nicht** |
| `.smart-header-backdrop` (feste Blende) | deckt | deckt |

- **Der Ueberstand** laesst die Kopfzeile ueber ihre Oberkante hinaus weitermalen (320px). Er haengt an *ihrer* Ebene, faehrt also mit ihr mit - genau deshalb faengt er einen Versatz nach unten auf, egal ob nur sie oder die ganze Seite versetzt gezeichnet wird.
- **Die feste Blende** haengt am Bild statt am Scroll (`position: fixed`, eigene Ebene) und liegt immer auf der **Soll**flaeche der oberen Leiste - sie faengt den Fall auf, in dem nur die klebende Kopfzeile aus einem veralteten Scroll-Offset gerechnet wird, der Inhalt aber richtig steht.

Der Ueberstand war zwischenzeitlich entfernt worden, weil er den Fall "zu hoch" nicht deckt. Die Aufnahme zeigt aber genau den anderen Fall - deshalb stehen jetzt **beide** nebeneinander. Nachgemessen wird das am Bildpunkt: der Versatz wird in beide Richtungen simuliert und jeder Griff einzeln abgeschaltet; die Tabelle oben ist genau dieses Messergebnis.

Vier Eigenschaften tragen sie, alle vier in `tests/e2e/smart-header-stability.spec.ts` festgehalten:

- **Sie steht ausserhalb von `.smart-header-shell`.** Deren `transform` waere sonst ihr Bezugsrahmen, und `fixed` haette wieder am Scroll gehangen statt am Bild. Gerendert wird sie als Geschwister davor.
- **Sie hat keinen Platz im Dokument, sie malt nur.** Ein Platzhalter im Fluss hat frueher beim Aufklappen der Location die ganze Seite darunter verschoben, und die Kacheln blitzten (Fehler vom 08.08., cc4977d).
- **Sie liegt im Stapel zwischen Seiteninhalt und Kopfzeile** (`z-index: 88` gegen 100): hoch genug, um Inhalt zu decken, niedrig genug, dass Logo, Icons und Pill-Zeile (90) vorn bleiben. `pointer-events: none`, sie faengt also keinen Tipp ab.
- **Ihre Hoehe kommt aus `--smart-header-top-height`**, dem gemessenen Wert der oberen Leiste; der Ausweichwert rechnet dasselbe. Sie endet damit genau dort, wo die Pill-Zeile anfaengt.

Zu sehen ist sie nie: steht die Kopfzeile sauber, liegt sie vollstaendig hinter ihr - und ihre Farbe ist ohnehin die des Seitengrunds (`#f8fafc`). Auf der Karte ist sie abgeschaltet, dort steht die Kopfzeile im Fluss ihres eigenen Wrappers und scrollt gar nicht.

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
