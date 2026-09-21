# Die Landingpage unter /lifeskin

Das ist die Seite, die ein Besucher aus einer Anzeige sieht. Sie ist
**Bildschirm 1 des Trichters** und keine eigene Seite: Der ganze Text
liegt in `<section id="ls-einstieg">`, die Bildschirme danach stehen
unveraendert darunter, und jeder Knopf dieser Seite schaltet denselben
Wahlbildschirm auf.

**Warum nicht zwei Seiten.** Eine Landingpage, die auf den Trichter
verlinkt, ist ein zweiter Ladevorgang zwischen Anzeige und Nutzen - im
Browser von Instagram auf Mobilfunk sind das Sekunden, in denen nichts
passiert. Jeder Bildschirm und jeder Ladevorgang dazwischen kostet
Besucher, und zwar mehr, als jede Gestaltung zurueckholt.

## Eine Entscheidung, nicht zwei

Die vier Karten auf der Landingpage fuehren **unmittelbar in ihren
eigenen Weg**. Vorher fuehrten alle vier auf `#ls-wahl` - und dort
standen dieselben vier noch einmal: Wer "Me foto" tippte, musste "Me
foto" gleich darauf noch einmal tippen. Eine getroffene Entscheidung
noch einmal abzufragen ist der sicherste Weg, sie rueckgaengig zu
machen.

**Wie, ohne den Trichter anzufassen.** Die Karte traegt
`data-ls-metoda`, und `landing.js` loest die zwei Griffe aus, die der
Besucher sonst von Hand gemacht haette:

```
  #ls-start          -> sitzung.schritt("wahl") + zeige("wahl")
  #ls-wahl [data-ls-weg="foto"] -> #wegWaehlen("foto")
```

Beides in **einem** JavaScript-Durchlauf, also ohne dass der Browser
dazwischen zeichnet - der Wahlbildschirm blitzt nicht auf. In
`lifeskin-app.js` ist dafuer keine Zeile geaendert: Die Stufe "wahl"
zaehlt weiter, `#wegMerken()` schreibt `typ` und `paSkanim` wie immer,
der Pixel meldet den Weg, und der Zurueck-Pfeil fuehrt dorthin, wo
`vorherigerSchirm()` ihn ohnehin hinfuehrt - auf die Wahl, wo sich der
Weg wechseln laesst.

**Kein `data-ls-weg` an den Landingkarten.** `lifeskin-app.js` bindet
jedes `[data-ls-weg]` im Dokument unmittelbar an `#wegWaehlen()`; dann
faende die Stufe "wahl" nie statt, und in Heart fehlte sie fuer jeden,
der ueber die Landingpage kam.

Geprueft, alle vier: `Me skanim -> ls-vorbereitung`,
`Me foto -> ls-fotopara`, `Për trupin -> ls-anliegen`,
`Vetëm pyetje -> ls-anliegen`; zurueck jedes Mal auf `ls-wahl`.

## Der Weg teilt sich auf Bildschirm 2

```
  1  Landingpage   (#ls-einstieg)
        |  vier Karten, jede in ihren Weg - oder der Knopf auf die Wahl
  2  Menyra        (#ls-wahl)  -- vier Karten --+---------+---------+
        |  Skanim          |  Foto             |  Trup   |  Pytje
  3  Si funksionon         |  Para fotografisë |         |
        |                  |                   |         |
  4  Kamera                |  Aufnahme         |         |
        |                  |                   |         |
  5  Emri + mosha  <-------+                   |         |
        |                      Anliegen + Nummer <-------+
  6  Aufbereitung (#ls-analyse)  nur mit Scan
        |
     Warteseite /analiza/<kennung>
```

## Die Reihenfolge ist der Entwurf

Jeder Abschnitt hat genau EINE Aufgabe, und er hat sie in der
Reihenfolge, in der der Besucher seine Fragen stellt.

| # | Abschnitt | Was er beantwortet |
|---|---|---|
| 1 | Hero (`#held`) | "Die verstehen mein Problem." |
| 2 | Vier Menyra (`#menyrat`) | "Ich muss nicht mein Gesicht scannen." |
| 3 | Pse LifeSkin (`#pse`) | "Hier wird nicht einfach ein Produkt verkauft." |
| 4 | Rezultate (`#rezultatet`) | "Das fuehrt wirklich irgendwohin." |
| 5 | Komuniteti (`#komuniteti`) | "Das ist keine unbekannte neue Marke." |
| 6 | Ekspertiza (`#mjekja`) | "Dahinter steht jemand vom Fach." |
| 7 | Produktet (`#produktet`) | "Was bekomme ich eigentlich?" |
| 8 | Garancia (`#garancia`) | "Wenn es nicht passt, stehe ich nicht allein da." |
| 9 | Fundi (`#fund`) | Der Anfang. |

**Die vier Menyra stehen als zweites, und das ist die teuerste
Aenderung der Seite.** Gemessen im Anzeigenkonto: 222 auf der
Landingpage, 38 beim Scan - **184 gingen bei "Skanimi" weg**, mehr als
vier von fuenf. Ein Teil davon will die Kamera nicht freigeben. Solange
die Seite erst ganz unten sagt, dass es drei andere Wege gibt, erfaehrt
dieser Teil es nie: Die Frage "muss ich mein Gesicht scannen?" entsteht
im Augenblick des ersten Knopfes.

**Die Karten der Landingpage waehlen nichts vor.** Sie tragen
`data-ls-start` und NICHT `data-ls-weg`: `lifeskin-app.js` bindet jedes
`[data-ls-weg]` im Dokument an einen Weg, und eine Karte hier wuerde
damit den Wahlbildschirm ueberspringen. Die Landingpage erklaert die
Wahl, sie trifft sie nicht.

**Oben wird nichts verkauft.** Kein Produkt, kein Preis, keine
Therapie, bevor die Faelle gesehen sind. Der Preis faellt zum ersten Mal
im siebten Abschnitt.

## Die Seite scrollt wieder selbst

`lifeskin-styles.css` stellt `html` und `body` auf `overflow: hidden`
und jeden Bildschirm auf `height: 100dvh` - ein Bildschirm IST das
Fenster, gescrollt wird in einem Kasten darin. Fuer Kamera, Fragen und
Aufbereitung ist das richtig. **Fuer eine Seite, die man liest, ist es
der Fehler:** Ein Dokument mit fester Hoehe und abgeschaltetem
Ueberlauf kann nicht mitwachsen, wenn der Browser seine Leiste
einklappt, und der Streifen, der dabei frei wird, gehoert niemandem -
kein Element reicht hinein, also bleibt dort stehen, was der Browser
selbst darunter zeichnet.

Jetzt ist `#ls-einstieg` so hoch wie sein Inhalt und das Dokument
scrollt. `:has(#ls-einstieg[data-aktiv="ja"])` bindet das an dasselbe
Merkmal, mit dem `lifeskin-app.js` umschaltet - sobald die Wahl, die
Kamera oder die Aufbereitung dran ist, gilt wieder Punkt fuer Punkt
das, was der Trichter vorgibt. **Am Trichter ist dafuer keine Zeile
geaendert.** Geprueft: auf der Landingpage `overflow: visible`, nach
einem Tipp auf eine Karte wieder `hidden`, `scrollY` zurueck auf 0.

Dazu bekommt `html` ausdruecklich den hellen Grund: Was der Browser
ueber die Dokumenthoehe hinaus zeichnet, nimmt die Farbe der Wurzel,
und die Voreinstellung ist in manchen In-App-Browsern schwarz.

**Und die Seite war 123 Punkte hoeher als ihr Inhalt.** Der feste
Knopf unten war EIN Kasten, der im ausgeblendeten Zustand um 130 %
seiner Hoehe nach unten geschoben wurde - unter den Dokumentrand, und
ein fester Kasten, der dorthin reicht, verlaengert das Dokument
(gemessen: `scrollHeight` 6473 gegen `offsetHeight` 6350). Am Ende der
Seite stand ein leerer Streifen. Jetzt bleibt der aeussere Kasten im
Bild und schneidet ab (`overflow: hidden`), geschoben wird der innere
(`.dock__leib`). Gemessen: Differenz 0.

**Was CSS nicht kann:** die eigene Bedienleiste von Instagram
wegnehmen. Schwarz, das dort und nicht im Dokument liegt, bleibt - das
ist erst auf einem echten Geraet zu unterscheiden, und ein solches
stand hier nicht zur Verfuegung.

## Was oben und unten klebte

**Ein Wortzeichen statt zweier Zeilen Marke.** Im Kopf stand
`LIFESKIN`, zwei Zeilen darunter die Augenbraue
`ANALIZË FALAS E LËKURËS` - zwei Anlaeufe, die Marke zu nennen, bevor
ein Satz gesagt war. Jetzt steht sie einmal und so, wie sie im Studio
hinter den Patientinnen an der Wand steht: LIFESKIN fett, SKINREACT
leicht, dieselbe Groesse, dieselbe Grundlinie, kein oranger Punkt
davor. Nachgebaut und nicht ausgeschnitten - in diesem Verzeichnis
liegt keine Logodatei, und aus einer Aufnahme geschnitten waere das
Zeichen unscharf und traege den Hintergrund mit.

**Die Kopfzeile klebt nicht mehr.** Sie stand auf `position: sticky`,
waehrend unten der feste Knopf klebte - zusammen nahmen die zwei dem
Inhalt von beiden Seiten Platz weg, auf einem 936 Punkte hohen Fenster
rund 150. Dafuer trug sie nichts als das Wortzeichen: keine Navigation,
keinen Griff. Sie liegt jetzt im Fluss und scrollt weg; mit ihr sind die
Flaeche beim Scrollen, die Haarlinie und der Messer in `landing.js`
verschwunden.

**Der feste Knopf weicht zwei Stellen aus - und nur zweien.** Er
verschwindet ueber dem Knopf im ersten Blick und ueber dem im
Abschluss; dazwischen liegt er durchgehend. Beobachtet werden die
Handlungen und nicht die Abschnitte (`[data-ls-konkurrenz]`, Schwelle
0: ein Abschnitt, der hoeher ist als das Fenster, erreicht einen
Anteil erst in seiner Mitte, und der Knopf flackerte).

> **Das Raster der vier Menyra trug diese Kennung auch** und tut es
> nicht mehr. Gedacht war es richtig - zwei gleich aussehende
> Hauptaktionen nebeneinander sind eine zu viel -, in der Benutzung war
> es zu viel Ruecksicht: Das Raster ist hoch, man haelt sich lange
> darin auf, und in der ganzen Zeit lag unten kein Griff mehr. Ueber
> den vier Karten ist die Leiste keine zweite Aktion; sie fuehrt an
> dieselbe Stelle wie jede von ihnen.

**Und er hing ueberhaupt nicht mehr am Fenster.** Gemessen auf
390x844: Seine Kiste lag bei 5756 Punkten - fuenftausend Punkte unter
dem Bild, sichtbar nur ganz unten auf der Seite. Die Ursache ist eine
Falle, die man nicht sieht:

> `lifeskin-styles.css` gibt jedem aktiven Bildschirm eine Animation
> mit `fill-mode: both`. Deren Endbild setzt `transform: none` - der
> BERECHNETE Wert ist dann aber nicht `none`, sondern die
> Einheitsmatrix, und eine Matrix macht aus dem Element den Bezug fuer
> alles Feste darin. `position: fixed` heisst damit nicht mehr "am
> Fenster", sondern "an diesem Abschnitt". Fuer die
> Trichterbildschirme faellt das nicht auf; die sind genau ein Fenster
> hoch. Der Einstieg ist seit der Umstellung auf das scrollende
> Dokument so hoch wie die ganze Seite.

`#ls-einstieg[data-aktiv="ja"]` bekommt deshalb seinen eigenen
Wechsel - dieselbe Dauer, nur ohne Weg (`@keyframes ls-einstieg-auf`,
reines Aufblenden). Kein Trichterbildschirm ist beruehrt; die Regel
nennt eine einzige Kennung. Ein Test haelt es fest: *"der feste Knopf
haengt am Fenster und nicht am Einstiegsabschnitt"*.

Geprueft ueber die ganze Seite auf 320x568, 360x640, 375x553, 390x844
und 430x932: Die Leiste steht an jeder Scrollstellung 94 Punkte ueber
dem unteren Fensterrand, verdeckt den Knopf im ersten Blick und den im
Abschluss nicht und verlaengert das Dokument nicht
(`scrollHeight === offsetHeight` auf jeder Breite).

> GEMESSEN, NICHT GESCHAETZT: Zuerst standen dort die vier Abschnitte
> mit `threshold: 0.2`. Ein Abschnitt, der hoeher ist als das Fenster,
> erreicht diesen Anteil erst weit in seiner Mitte und faellt am Rand
> wieder darunter - der Knopf flackerte dreimal, waehrend man durch den
> Produktabschnitt scrollte.

Ausserdem: auf dem Schreibtisch (ab 720 Punkten) gar nicht, auf einem
Fenster unter 560 Punkten Hoehe gar nicht, und im Trichter von selbst
nicht - er liegt in `#ls-einstieg`, und die schaltet `lifeskin-app.js`
weg. Wo es ihn nicht gibt, haelt der Fuss auch keine 112 Punkte Luft
mehr frei.

## Zwei Namen, einer nach dem anderen

Im ersten Blick standen `LIFESKIN` und zwei Zeilen darunter
`SKINREACT · ANALIZË FALAS`. Das waren zwei Eigennamen in den ersten
zwei Zeilen der Seite, und keiner von beiden war zu diesem Zeitpunkt
erklaert. Jetzt sagt die Augenbraue die **Sache**
(`ANALIZË FALAS E LËKURËS`), und der Name des Verfahrens faellt einmal,
im zweiten Abschnitt, mit seiner Erklaerung im selben Satz:
*"SkinReact është analiza e lëkurës nga LifeSkin."*

## Der Abschnitt "SI FUNKSIONON" verkauft die Begleitung

Hier stand *"Na tregoni çfarë ju shqetëson"* mit den Schritten
**Analizojmë / Përshtatim / Kujdesemi** - drei Woerter, die jeder
Versandhaendler schreiben koennte, und der erste stimmte nicht einmal:
Man erzaehlt an dieser Stelle nichts, man WAEHLT einen Weg.

Jetzt heisst der Abschnitt **"Një terapi e ndjekur, jo vetëm një pako."**
und sagt, was die Marke von einem Regal unterscheidet:

| # | Schritt | Was er sagt |
|---|---|---|
| 01 | `Zgjidhni mënyrën` | Skan, Foto, Koerper oder nur eine Frage - der Besucher entscheidet, und die vier Namen sind dieselben wie im Abschnitt `#menyrat` |
| 02 | `Dr. Gashi e shqyrton vetë` | Jeder Fall geht durch ihre Hand, BEVOR das Set feststeht |
| 03 | `Ju përcjellim 28 ditë` | Waehrend der Therapie ist jemand erreichbar |

### Zwei Saetze aus dem Auftrag, die so nicht auf die Seite durften

**"brenda 28 ditëve do të keni arritje si në rastet e dokumentuara"** -
eine Zusage auf einen Heilungsverlauf. Die gibt diese Seite nicht, und
eine Seite ueber Haut darf sie nicht geben. Was stehen darf, ist der
Ablauf: wie lange es dauert und wer sich in dieser Zeit meldet. Die
belegten Faelle stehen einen Abschnitt weiter und sprechen fuer sich.

**"Për vetëm 53 € terapi gëzon sot lëkurë të pastër"** - dasselbe in
kurz. Uebernommen ist der RICHTIGE Teil des Gedankens: dass 53 EUR eine
Therapie kauft und nicht zwei Flaschen. Das steht jetzt als
`TERAPIA 28-DITORE` ueber der Zahl.

### Was zu halten ist

`Gjatë saj jeni në kontakt me Dr. Gashin` ist ein Versprechen ueber den
**Betrieb**, nicht ueber die Haut - es darf dastehen, muss aber
eingehalten werden. **Im Trichter gibt es dafuer keine Mechanik:** kein
Termin, keine Erinnerung, kein Verlauf, nichts in `lifeskin-catalog.js`
oder in den Berichtstexten. Es passiert also von Hand oder gar nicht.

`Dr. Gashi e shqyrton vetë` deckt sich mit dem, was an anderer Stelle
schon steht (`Analizën e shqyrton dhe e miraton Dr. Violeta Gashi para
se t'ju dërgohet`). Es sagt: Sie SIEHT jeden Fall an und gibt ihn frei.
Es sagt NICHT, dass kein System an der Aufbereitung beteiligt ist - das
waere falsch, siehe `docs/lifeskin-prompt.json`.

## Der erste Blick ist genau ein Bildschirm

`#held` bekommt `min-height: calc(100svh - var(--kopf-h) - env(safe-area-inset-top))`
und `justify-content: center`. Der Kopf liegt IM FLUSS darueber, also
ergeben Kopf und erster Blick zusammen genau eine Bildschirmhoehe - der
naechste Abschnitt faengt eine Haarbreite unter der Kante an.

**Warum `svh` und nicht `vh` oder `dvh`:** `svh` ist die kleinste
Hoehe, die das Fenster annehmen kann - die mit ausgefahrener
Browserleiste, und genau so wird eine Seite geoeffnet. Mit `vh` (der
groessten) waere der Abschnitt beim Oeffnen hoeher als das Bild und der
Knopf darunter; mit `dvh` aenderte sich die Hoehe waehrend des
Scrollens, und dann springt der Inhalt unter dem Daumen. `vh` bleibt
als Rueckweg fuer Browser ohne `svh`.

Gemessen auf 320x568, 360x640, 375x553 (Instagram auf einem kleinen
Telefon), 390x844 und 430x932: `#pse` beginnt auf jeder davon exakt auf
Fensterhoehe - `"SI FUNKSIONON / Nga analiza te rutina juaj"` ist auf
Bildschirm 1 auf keiner Groesse zu sehen. Auf einem niedrigen Fenster
waechst der Inhalt ueber die Mindesthoehe hinaus; dann ist die Mitte
unwirksam und nichts wird abgeschnitten.

**Hier stand einmal gar keine Mindesthoehe** - der Abschnitt war so
hoch wie sein Inhalt. Das war richtig, solange darunter ein Band in
anderer Farbe anfing; seit die ganze Seite einen Grund hat, fuellte den
Rest einfach der naechste Abschnitt, und im ersten Bild standen zwei
Ueberschriften.

### Drei Zeichen statt einer Jahresangabe

Zwischen dem Wortzeichen und der Ueberschrift steht eine Reihe:
**Analiza · Produktet · Rezultati**, je mit einem Zeichen. Drei
Hauptwoerter ohne Beiwort behaupten nichts - sie sagen, was in welcher
Reihenfolge passiert. Auf 320 Punkten passt die Reihe in eine Zeile;
darunter bricht sie um (`flex-wrap`), statt zu stauchen.

An dieser Stelle stand `Mbi 10 vite përvojë online.` Die Angabe kam aus
dem Auftrag, steht in keinem Verzeichnis dieses Projekts und war damit
nicht zu belegen. Sie ist entfernt und **nicht durch eine andere Zahl
ersetzt**.

## Die Lautstaerke ist gesetzt, nicht gewachsen

Die Seite war einmal richtig aufgebaut und zu laut: Hero auf 40 Punkten,
neun Abschnittsueberschriften auf 31, acht halbfette Stichwoerter, drei
Kartenraster und ueberall derselbe Abstand. Wo alles gleich wichtig
aussieht, ist nichts wichtig - und eine Marke, die jede Zeile betont,
wirkt nicht teuer, sondern beduerftig.

**Der Massstab auf 390 Punkten Breite** (alles darunter und darueber
waechst mit, siehe die `clamp()` in `landing.css`):

| | Punkte |
|---|---|
| Hero-Ueberschrift | 35 |
| Abschnittsueberschrift | 26 |
| Abschluss-Ueberschrift | 31 |
| Zwischenueberschrift (Schritt, Preis) | 17,5–18 |
| Fliesstext | 16 |
| Nebentext | 13,5–15 |
| Meta, Bildunterschrift | 12,5–13 |
| Augenbraue | 11,5 |
| Preis | 36 |
| Tagespreis | 16,5 |
| Followerzahl | 27 |
| Garantiezahl | 31 |
| Knopf | 54 hoch, 16 Schrift |

**Der Rhythmus steht in drei Abstaenden**, nicht in einem:
`--luft` (74) fuer die Regel, `--luft-stark` (86) fuer Faelle, Preis und
Abschluss, `--luft-ruhig` (66) fuer die Fragen. Ein Abschnitt, der
weiter atmet, ist wichtiger - das sagt man mit Luft und nicht mit
Schriftgroesse.

**Ein Grund, keine Baender.** Die Flaechen wechselten sich ab - Grund,
Sand, Grund, Sand. Das trennte zuverlaessig und hatte einen Preis:
Unter dem ersten Blick lief immer ein Streifen der anderen Farbe an,
sobald das Fenster ein paar Punkte hoeher war als gerechnet. Ein
angeschnittenes Band sieht nicht nach Gestaltung aus, sondern nach
einem Fehler - und es auf jeder Geraetehoehe zum Verschwinden zu
bringen ist ein Rennen, das man nicht gewinnt.

Jetzt traegt die ganze Seite denselben Grund. Getrennt wird durch Luft
(56-88 Punkte zwischen Abschnitten) und durch die Ueberschrift;
abgehoben wird da, wo es einen Gegenstand gibt - Karten sind weiss, und
eine Karte hat einen Rand, ein Band hat nur Farbe. Der erste Blick hat
aus demselben Grund keine Mindesthoehe mehr: Sie war nur dafuer da,
diese Kante irgendwo Sinnvolles liegen zu lassen, und liess 250 Punkte
Leere unter der letzten Zeile.

**Nicht alles ist eine Karte.** Karten tragen, was man antippen oder
vergleichen soll: die vier Menyra, die vier Faelle, die zwei Profile,
der Preis. Das Zitat der Aerztin und der Schutzsatz darunter standen
ebenfalls in Karten und stehen jetzt frei auf der Flaeche - eine Karte
um ein Zitat laesst den ruhigsten Abschnitt der Seite wie ein Angebot
aussehen.

## Die Reihenfolge

| # | Abschnitt | Was er beantwortet |
|---|---|---|
| A | Hero (`#held`) | "Ich habe schon viel probiert - was braucht meine Haut?" |
| B | Si funksionon (`#pse`) | "Wie haengen Analyse und Produkte zusammen?" |
| C | Raste dhe çmimet (`#rezultatet`) | "Bringt das etwas?" **und "Was kostet das?"** - die belegten Vorher-Nachher-Faelle, jeder mit seinen Mitteln und seinem Preis |
| C2 | Produktet (`#produktet`) | "Was sind das fuer Flaschen?" - die Mittel selbst, zwei in einer Reihe, einzeln zu kaufen |
| D | Menyrat (`#menyrat`) | "Wie fange ich an?" |
| E | Ekspertiza (`#mjekja`) | "Wer steht dahinter, und was passiert mit meinen Fotos?" |
| F | Komuniteti (`#komuniteti`) | "Gibt es die Marke wirklich?" |
| G | Garancia + Pyetjet (`#garancia`) | "Und wenn es nicht passt?" |
| H | Fundi (`#fund`) + Fuss | Der Anfang. |

**Preise stehen vor der Methodenwahl.** Wer natuerlich scrollt, weiss
was es kostet, bevor er sich fuer einen Weg entscheidet; wer schon
entschieden ist, springt mit dem Knopf im ersten Blick direkt auf die
Wahl.

**`#cmimet` gibt es nicht mehr.** Der Abschnitt stand unmittelbar
ueber `#rezultatet` und trug zwei Set-Karten: zwei Aufnahmen
nebeneinander, eine Karte, ein paar Zeilen darunter - also genau die
Form des Abschnitts darunter, und in beiden Frauengesichter, die
einander aehneln. Auf dem Telefon las sich das als dieselbe Sache
zweimal.

Der Preis steht jetzt an jedem belegten Fall, und das ist mehr als eine
Zusammenlegung: Vorher stand die Zahl an einem fremden Beispiel und der
Beweis daneben ohne Zahl - wer wissen wollte, was DIESER Fall gekostet
hat, musste zwei Abschnitte zusammenrechnen, und wer nur scrollte, hat
die Zahl nie gesehen.

**`#rezultatet` steht nicht in der Liste des Auftrags** und ist
trotzdem geblieben: Das sind die einzigen als Verlauf belegten
Aufnahmen, die es gibt. Wer ihn doch weghaben will, loescht eine
`<section>` - und nimmt damit auch den Preis von der Seite.

## Die Faelle: eine Karte ist der Eintrag

`#rezultatet` traegt je Fall eine `<article class="rasti">`. Die Karte
IST der Eintrag - es gibt keine zweite Liste daneben, die nachgezogen
werden muesste.

| Merkmal | Bedeutung |
|---|---|
| `data-rasti` | feste Kennung, wird nie wiederverwendet |
| `data-produkte` | Anzahl der Mittel der Rutine |
| `data-cmim` | Gesamtpreis in EUR |
| `data-verifikuar` | `po` = Zuordnung ausdruecklich genannt, `jo` = aus der Diagnose abgeleitet |

Vier Zeilen stehen in jeder Karte, in der Reihenfolge der Fragen:

```
Pacienti 1 · 26 vjeç
Akne inflamatore
Produktet: LF ACNE + LF MOISTUR
TERAPIA 28-DITORE
53 €  Me 2 produkte · dërgesa e përfshirë
```

**Das Wort ueber der Zahl ist die ganze Arbeit an dieser Stelle.** Hier
stand `53 €  2 produkte` - eine Zahl und daneben, was man dafuer
bekommt: zwei Flaschen. Wer zwei Flaschen fuer 53 EUR sieht, rechnet
gegen das Regal in der Apotheke, und dort liegen zwei Flaschen
billiger. `TERAPIA 28-DITORE` stellt die Zahl in den Zusammenhang, der
sie traegt: 28 Tage, fuer die jemand die Haut angesehen und die Mittel
ausgesucht hat. Die Flaschen sind das Werkzeug, nicht das Angebot.

**Ohne Versprechen.** Der Auftrag schlug
*"Për vetëm 53 € terapi gëzon sot lëkurë të pastër"* vor. Das ist eine
Zusage auf ein Ergebnis; die gibt diese Seite nirgends. Das Label sagt,
WAS gekauft wird, nicht was dabei herauskommt.

Die Dauer steht deshalb am Preis und nicht mehr am Befund - zweimal
dieselbe Zahl in einer Karte war eine zu viel.

Ein Test haelt das fest (`tests/lifeskin-trichter-variante.test.mjs`,
*"jeder belegte Fall traegt Mittel und Preis"*): vier Karten, jede mit
Nummer, Alter, Befund, Dauer, Mitteln, dem Label `TERAPIA 28-DITORE`
und dem Preis - und `data-cmim` muss dieselbe Zahl sagen wie der Text.

**Unter den Karten steht keine Fussnote mehr.** Dort wiederholte eine
die beiden Preise und die Zahlung an der Tuer; jede Karte sagt das
schon, und die Fussnote machte aus dem Abschnitt wieder eine
Preisliste. Vollstaendig stehen die Zahlen weiter in der ersten Frage
unter der Garantie.

**Was heute dransteht:**

| Fall | Alter | Befund | Mittel | Preis | `data-verifikuar` |
|---|---|---|---|---|---|
| 1 | 26 | Akne inflamatore | LF ACNE + LF MOISTUR | 53 € | `jo` |
| 2 | 24 | Akne hormonale | LF ACNE + LF MOISTUR | 53 € | `jo` |
| 3 | 22 | Akne & pore të mëdha | LF ACNE + LF MOISTUR + LF PORE | 85 € | `po` |
| 4 | 29 | Njolla & hiperpigmentim | LF PIGMENT + LF MOISTUR | 53 € | `po` |

**Fall 1 und 2 sind noch zu bestaetigen.** Ausdruecklich genannt wurden
nur die zwei Sonderfaelle: der Pigmentfall (LF PIGMENT + LF MOISTUR,
53 €) und der Fall mit zusaetzlichen Poren (drei Mittel, 85 €). Fall 1
und 2 sind beide Akne ohne Zusatzbefund und tragen deshalb das
Akne-Set; belegt ist das nicht, und darum steht an ihnen `jo`.

**Kein Vorname, kein Zitat, kein "porositi".** Dafuer liegt keine
Einwilligung vor. `Pacienti 1..4` ist eine Nummer und kein Mensch, den
es nicht gibt. Was mit einer Einwilligung dazukaeme, steht als TODO in
der ersten Karte.

**`Para` und `Pas` duerfen nur diese vier Paare tragen:** Sie sind als
Verlauf dokumentiert.

### Die Set-Aufnahmen sind weg

In `fotot/` lagen vier weitere Dateien (`set-1-a/b`, `set-2-a/b`). Sie
gehoerten zu `#cmimet` und sind mit ihm geloescht. Der Grund fuer die
zwei Setaufnahmen (`-b`) steht getrennt, weil sie noch einen Schritt
laenger blieben: Auf ihnen HAELT jemand die Schachteln, und auf einer
davon ist es dieselbe Person wie auf der Karte "PAS" darueber - zwei
gleiche Gesichter untereinander sind genau die Verdopplung, die dieser
Umbau wegnehmen soll.

**Eine Aufnahme der Schachteln OHNE Person waere hier richtig.** Es
liegt keine im Verzeichnis. Solange keine da ist, nennen die Karten
ihre Mittel als Wort.

## Der Laden

Er steht **unmittelbar hinter den belegten Faellen**, und das ist der
ganze Grund fuer die Stelle: Darueber hat jemand gesehen, dass es wirkt,
und gelesen, welche Mittel es waren (*"Produktet: LF ACNE + LF MOISTUR"*).
Genau hier will er wissen, was das fuer Flaschen sind.

**Zwei in einer Reihe**, gerechnet: Auf einem 360er Telefon bleiben nach
den Raendern 324 Punkte, also 156 je Karte - darin ist eine Flasche
erkennbar und ein Preis lesbar. Bei drei waeren es 100, und 100 Punkte
sind eine Briefmarke. Gemessen: 138 Punkte auf 320, 168 auf 390, 187 auf
430.

| Teil | Wo |
|---|---|
| Raster, Korb, Kasse | `apps/lifeskin-landing/shop.js` |
| Aufbau | `#produktet`, `#shporta`, `#korbknopf` in `index.html` |
| Verwaltung der Bilder | Heart → Lifeskin → Produkte → ein Produkt → ganz unten |
| Preis je Mittel | `lifeskin-catalog.js`, `einzelpreis` (33 €) - im Betrieb aus Firestore |

### Die Bilder kommen aus Heart

Je Mittel liegt ein Dokument unter
`lifeskin/{tenant}/config/landingFotot-{produktId}` mit einer Liste von
Bildern (Datenzeilen, hoechstens sechs, je auf 1000 Bildpunkte
verkleinert).

**Warum `config` und keine eigene Sammlung:** `firestore.rules` erlaubt
unter `match /config/{documentId}` bereits genau das, was gebraucht wird -
lesen darf jeder, schreiben nur das CEO-Konto. Eine neue Sammlung haette
eine neue Regel gebraucht, und **eine Regel, die nicht ausgespielt ist,
ist eine Seite, die nicht funktioniert.** Es ist also keine Bequemlichkeit,
sondern die Stelle mit dem kleinsten Risiko.

**Warum je Mittel ein Dokument:** Ein Firestore-Dokument darf 1 MiB. Sechs
Bilder zu je rund 180 KB passen je Mittel bequem; alle Mittel zusammen in
einem Dokument waeren es nicht. Das Produktdokument selbst kam auch nicht
in Frage - dort liegt schon `photoRef` mit bis zu 700 KB.

**Ohne Bild erscheint ein Mittel nicht.** Das ist zugleich der Schalter:
Wer ein Mittel zeigen will, legt in Heart ein Bild dazu; wer es wegnehmen
will, nimmt die Bilder weg. Niemand muss dafuer Code anfassen, und es
steht als Satz im Bereich.

`LF CLEAN` hat heute kein Bild und erscheint deshalb nicht. Fuer die
anderen vier lagen Aufnahmen vor.

**Geladen wird erst, wenn der Abschnitt naeherkommt** - beobachtet wird
`#rezultatet`, der Abschnitt davor. *Nicht* `#produktet` selbst: Der
traegt `hidden`, solange nichts darin steht, und ein Element mit
`display: none` meldet einem IntersectionObserver **niemals** "im Bild".
So gebaut wartete der Laden auf ein Ereignis, das erst eintreten koennte,
nachdem er geladen haette. Gemessen und behoben.

### Die Karte zeigt vier Dinge

Aufnahme, Name, Zahl, Knopf. Hier standen ausserdem der Untertitel
(*"Terapi kundër aknes"*) und die Fuellmenge neben dem Preis
(*"30 ml"*) - an einer Kachel von 160 Punkten zwei Zeilen zwischen der
Aufnahme und dem Knopf. Was ein Mittel tut, sagt die Analyse an dem
Befund, zu dem es gehoert.

**Die Aufnahme fuellt die Karte randlos** (`object-fit: cover`, 4:5).
Hier stand `contain` in einem Quadrat - gebaut fuer freigestellte
Flaschen auf Weiss, die alle dasselbe Verhaeltnis haben. Die wirklichen
Aufnahmen sind Produktbilder mit Umgebung, hochkant und quer
durcheinander; in einem Quadrat mit `contain` blieb links und rechts
heller Rand stehen, an jeder Karte ein anderer. Gemessen danach: Bild
166 Punkte in einer Karte von 168, also nur der Rahmen.

**Die Punkte stehen unter dem Bild, nicht darauf.** Auf dem Bild waren
sie einen Versuch wert und sind gescheitert: Produktaufnahmen sind
ueberwiegend weiss, weisse Punkte darauf sieht niemand - und dunkle
Punkte verschwinden auf der naechsten Aufnahme, die dunkel ist. Eine
Farbe, die auf jeder Aufnahme trifft, gibt es nicht.

**Und sie laufen mit dem Finger.** Hier stand ein Zeitschloss von 60 ms
*nach* dem letzten Scroll-Ereignis; beim Wischen feuert `scroll`
ununterbrochen, also sprangen die Punkte erst um, wenn die Bahn
stillstand - mit Schwung eine halbe Sekunde spaeter. Jetzt wird
hoechstens einmal je Bild gerechnet, aber im **selben** Bild wie die
Bewegung (`requestAnimationFrame`). Gemessen: 40 ms nach dem Sprung
steht der Punkt am Ziel.

### Der Warenkorb

Oben rechts in der Kopfzeile, **und er ist leer unsichtbar** - ein Korb
mit einer Null daneben stellt auf einer Seite, auf der noch nichts zu
kaufen war, eine Frage ohne Anlass.

Liegt etwas darin, wechselt zusaetzlich **die feste Leiste unten**: Statt
*"Zbuloni rutinën tuaj"* steht dort *"Shporta · 2 produkte · 66 €"*. Wer
ein Mittel ausgesucht hat, dessen naechste Handlung ist nicht mehr die
Analyse - und der Weg zur Kasse darf nicht oben in der Ecke liegen. Die
Analyse bleibt im ersten Blick, bei den vier Wegen und am Schluss
erreichbar. Die Zeile UNTER dem Knopf wechselt mit: *"Analiza falas · pa
detyrim për blerje"* unter einem Knopf zur Kasse waere eine Zusage ueber
etwas anderes.

**Die Kopfzeile klebt, sobald etwas im Korb liegt** - und nur dann.
Ohne Korb traegt sie nichts, was man unterwegs braucht (der Grund steht
weiter oben); mit Korb traegt sie den Weg zur Kasse, und der darf nicht
drei Bildschirmlaengen weiter oben liegen. Gesetzt wird ein Merkmal an
der Kopfzeile selbst (`data-korb`), keine Regel an `html` oder `body`:
Das Dokument gehoert dem Trichter.

**Das Zeichen ist eine Tasche und kein Eimer.** Hier stand ein Pfad, der
sich nach unten verjuengte und oben einen Buegel trug - auf einem
Telefon las sich das als Muelleimer, und ein Muelleimer neben einem
Markennamen ist das Gegenteil dessen, was der Knopf sagen soll.

Der Korb liegt im **`sessionStorage`**, nicht im `localStorage`: Ein Korb,
der eine Woche spaeter noch dasteht, ist keine Erinnerung, sondern eine
Ueberraschung - und die Preise koennen sich bis dahin geaendert haben.
Gespeichert werden nur Kennung und Anzahl; Name und Preis kommen bei jedem
Zeichnen frisch.

`#shporta`, `#produktet` und `#korbknopf` liegen **in `#ls-einstieg`**.
Damit nimmt `lifeskin-app.js` sie beim Eintritt in den Trichter von selbst
weg - kein Schritt des Trichters muss etwas davon wissen. Gemessen: nach
einem Tipp auf *"Zbuloni rutinën tuaj"* ist von Korb, Blatt, Leiste und
Raster nichts mehr im Dokument sichtbar. Ein Test haelt es fest.

### Die Kasse ist dieselbe wie auf der Befundseite

Nicht nur in den Feldern, sondern **im Aufbau**: ein ganzer Bildschirm
in drei Teilen, nach `astra.css` / `.order-screen` gebaut -

| Teil | Was darin steht |
|---|---|
| `.shporta__koke` | runder Zurueck-Knopf (42 Punkte), Augenbraue `SHPORTA`, Titel |
| `.shporta__mes` | der einzige Teil, der scrollt: Korb und die vier Felder |
| `.shporta__leiste` | klebt unten: die drei Zusagen, der Knopf mit der Summe, die Zeile darunter |

Hier war ein **Blatt von unten**. Es war sauber gebaut und an dieser
Stelle falsch: Wer hier bestellt, soll denselben Vorgang sehen wie
jemand, der aus der Analyse kommt. Zweimal dieselbe Marke, zweimal
dieselbe Kasse - und der Unterschied faellt genau dem auf, der zum
zweiten Mal kauft.

`100svh` und nicht `100vh`: Das ist die Hoehe mit ausgefahrener
Browserleiste, also die kleinste, die das Fenster annehmen kann. Mit
`vh` stuende die Leiste mit dem Knopf unter dem unteren Rand -
ausgerechnet der Knopf, um den es geht. Der Knopf selbst steht
*ausserhalb* des Formulars und traegt `form="shportaforme"`, wie in
astra; nur so kann er unten kleben und das Formular trotzdem
abschicken.

Dieselben vier Felder (Name, Nummer, Strasse, Ort), dieselbe Zahlung an
der Tuer, dieselbe Sammlung. Geschrieben wird mit
`Sitzung#schritt("ordered", …)` - **in dieselbe Sitzung, die dieser Besuch
ohnehin angelegt hat.**

Ein Besucher ist eine Zeile in Heart. Wer herkommt und ohne Analyse kauft,
ist derselbe Besucher, nicht zwei; ein eigenes Dokument je Kauf haette
jeden Direktkaeufer doppelt gezaehlt - einmal als Besuch, einmal als
Bestellung -, und der Trichter haette mehr Bestellungen als Besucher
ausgewiesen.

`schritt()` tut drei Dinge auf einmal: Es setzt den Schritt auf `ordered`
(und nur vorwaerts), haelt die Zeit bis hierher fest und meldet den Schritt
an den Meta-Pixel - ueber dieselbe Stelle wie alle anderen Schritte, also
**genau einmal**. Und es sagt, ob es geklappt hat: Die Schreibkette in
`lifeskin-session.js` reicht auf Erfolg die Antwort durch und liefert im
Fehlerfall `undefined`. Genau diese Unterscheidung braucht eine
Bestellung - eine Bestaetigung ohne Antwort des Servers waere eine
Behauptung.

**Keine neue Firestore-Regel.** `lifeskinSessionShapeOk()` laesst nur eine
feste Liste von Feldern zu (`hasOnly`); ein unbekanntes Feld weist das
GANZE Dokument ab, und die Bestellung waere still verloren. Die
Direktbestellung legt deshalb alles, was sie ausmacht, in die Karte
`order`, die dort ohne weitere Pruefung erlaubt ist:

```
order.kind   "shop" — daran erkennt Heart die Direktbestellung
order.items  je Zeile id, name, cmimi, sasia
order.total  die Summe
```

`typ` bleibt absichtlich weg: Die Regel laesst dort nur die vier Wege des
Trichters zu (`scan`, `foto`, `trup`, `pytje`), und ein Kauf ist keiner
davon. Ein Test liest die Feldliste aus `firestore.rules` und prueft jedes
Feld, das die Bestellung schreibt.

**Gemessen** (Chromium, 390x844, Firestore abgefangen): geschrieben werden
`address, name, order, phone, step, timings, updatedAt` — alle in der
Liste; `step: "ordered"`, `order.kind: "shop"`, `order.total: 99`,
`order.items: [lf-acne x2, lf-pore x1]`.

### Noch offen an diesem Laden

* **Kein Lagerbestand.** Nichts weiss, ob ein Mittel da ist. Wer es
  braucht, baut es in Heart als Feld am Produkt und hier als Sperre am
  Knopf.
* **Keine Rechnung, keine Bestaetigungs-SMS.** Die Bestaetigung steht auf
  der Seite und die Bestellung in Heart; alles Weitere passiert von Hand.
* **Keine Versandkostenschwelle.** `versandKosten` steht im Katalog auf 0,
  und die Seite sagt das auch. Wer das aendert, muss drei Saetze auf dieser
  Seite mitaendern.
* **Der Zuschnitt der Aufnahmen ist ein Kompromiss.** `cover` fuellt die
  Karte randlos und schneidet dafuer an: Bei einer freigestellten Flasche
  auf Weiss faellt oben der Deckelrand weg. Wer beides will, braucht
  Aufnahmen in EINEM Verhaeltnis - dann stimmt jede Karte von selbst.

### Zweimal derselbe Fehler an derselben Leiste

Die feste Leiste besteht aus zwei Kaesten: Der aeussere liegt fest im
Bild und schneidet ab, der innere wird nach unten geschoben, solange
nichts zu sehen sein soll. Faellt der aeussere weg, reicht der innere
unter den Dokumentrand und **verlaengert das Dokument** - am Ende der
Seite steht dann ein leerer Streifen, im Browser von Instagram eine
dunkle Flaeche.

Das ist zweimal passiert: beim ersten Mal 123 Punkte (ein Kasten statt
zweier), beim zweiten Mal 94 - da fiel die oeffnende Zeile des
aeusseren einem Ersetzen zum Opfer. Beide Male gefunden, weil
`scrollHeight` gegen `offsetHeight` gemessen wird und nicht, weil es
jemandem auffiel. Ein Test haelt den Aufbau jetzt fest; die Messung
gehoert in jeden Durchgang.

## Die Preise

| Umfang | Preis | Quelle |
|---|---|---|
| 1 Mittel | 33 € | `lifeskin-catalog.js`, `einzelpreis` |
| 2 Mittel | 53 € | `lifeskin-catalog.js`, `setPreis` bei `setGroesse` 2 |
| 3 Mittel | 85 € | **nur aus dem Auftrag** |
| Versand | 0 € | `lifeskin-catalog.js`, `versandKosten` |
| Zahlung | bei Lieferung | `lifeskin-catalog.js`, `zahlarten: ["nachnahme"]` |

**85 EUR steht im Code nirgends - und das ist jetzt dringend.**
`lifeskin-catalog.js` kennt genau einen Setpreis (`setPreis`) fuer
genau eine Setgroesse (`setGroesse` 2). Ein Set aus drei Mitteln zu
85 EUR rechnet das Angebot am Ende der Analyse deshalb heute NICHT aus
- es kaeme dort auf 53 EUR.

Bis zum Umbau war das eine Warnung auf Vorrat. Jetzt steht die Zahl an
Fall 3 (`data-cmim="85"`), also an einem Fall, den der Besucher liest,
bevor er anfaengt: **Wer mit drei Mitteln aus der Analyse kommt, sieht
auf der Landingpage 85 EUR und im Angebot 53 EUR.** Vor dem Livegang
muessen `lifeskin-catalog.js` und der Preisblock in `astra.js` dafuer
geoeffnet werden - oder Fall 3 nennt keinen Preis.

Die Zahlen stehen ausserdem in der ersten Frage unter der Garantie und
in der Fussnote unter den Faellen. Beide Stellen sagen dasselbe; wer
eine aendert, aendert die andere mit.

## Was auf dieser Seite behauptet wird - und woher es kommt

Nichts steht hier, was nicht belegt ist. Drei Arten von Angaben:

**Aus dem Code, mit Quelle.** Wer die Quelle aendert, muss diese Seite
mitaendern - an jeder Stelle steht ein Kommentar dazu:

| Angabe | Quelle |
|---|---|
| `28 ditë` unter jedem Fall | `lifeskin-catalog.js`, `reichweiteTage` |
| `2 produkte` | `lifeskin-catalog.js`, `setGroesse` |
| `53 €` | `lifeskin-catalog.js`, `setPreis` |
| `85 €` an Fall 3 | **nur aus dem Auftrag** - steht im Code nirgends, siehe oben |
| `LF ...`-Mittel an Fall 3 und 4 | ausdruecklich genannt; an Fall 1 und 2 abgeleitet (`data-verifikuar="jo"`) |
| `≈ 1,89 € në ditë` | `lifeskin-catalog.js`, `tagespreis()` |
| `45 ditë garanci` | `lifeskin-catalog.js`, `rueckgabeTage` |
| Ablauf der Garantie | `bericht-texte.js`, `garanciText` - erst anpassen, dann erstatten |

Der Preis traegt deshalb die Zeile *"Çmimi i saktë i rutinës suaj
shfaqet në fund të analizës"*: Der CEO-Bereich kann `setPreis` aus
Firestore ueberschreiben, und ein Festpreis ohne diese Zeile waere ein
Versprechen, das eine Konfigurationsaenderung bricht.

**Aus dem Auftrag, noch ohne Beleg im Verzeichnis.** Sie sind im Aufbau
als *"vor dem Livegang zu bestaetigen"* ausgewiesen und stehen an
genau zwei Stellen (erster Blick und `#komuniteti`):

* `10+ vite online`
* `109K @lifeskin.al`
* `73.9K @lifeskin.ks`

Die zwei Zahlen werden **nicht addiert**. Follower sind Follower und
keine Kunden; ein Teil folgt beiden Konten. Wer daraus "183K Kunden"
macht, hat genau die Angabe erfunden, die am leichtesten nachzupruefen
ist - und sie wird nachgeprueft, denn dafuer sind die Konten verlinkt.

**Kein Name und kein Zitat unter den Faellen.** Die Karte ist auf den
Menschen umgestellt - oberste Zeile das Alter, darunter was er getan
hat, darunter womit er angefangen hat:

```
26 vjeç
28 ditë · rutinë e personalizuar LifeSkin
Akne inflamatore
```

Dort gehoert ein Vorname hin und darunter ein Satz dieser Person. Beides
fehlt im Verzeichnis, also steht beides nicht da; im Aufbau stehen an
jeder der vier Karten `TODO: verified_customer_name`,
`TODO: verified_customer_quote` und `TODO: verified_routine` (letzteres
fuer die Zeile *"Rutina e saj: LF ... + LF ..."*, die erst gilt, wenn
fuer den Fall wirklich dokumentiert ist, welche zwei Mittel benutzt
wurden). Ein ausgedachter Name waere genau die Art Beweis, die beim
ersten Nachfragen zerfaellt - und diese vier Faelle sind das Staerkste,
was die Seite hat. Liegt eine Einwilligung nur fuer die Initiale vor,
ist `A., 26` besser als nichts und immer noch besser als erfunden.

Aus demselben Grund heissen die Alternativtexte nicht mehr
"Pacientja 1": Wer sie vorgelesen bekommt, hoert sonst eine Nummer
statt einer Beschreibung.

**Was es nicht gibt, ist nicht erfunden.** In diesem Verzeichnis liegt
kein Hero-Bild, kein Packshot und kein Instagram-Screenshot. Es steht
deshalb keines auf der Seite. An jeder dieser drei Stellen sagt ein
Kommentar im Aufbau, wohin ein freigegebenes Bild gehoert und was es
mitbringen muss (`width`/`height`, damit beim Nachladen nichts springt).

Ebenso wenig steht bei Dr. Gashi etwas, was der Trichter nicht ohnehin
sagt: keine Jahre der Zusammenarbeit, keine Partnerschaft, keine
Kooperation. Dafuer liegt hier kein Beleg.

## Die Sprache ist "ju" und nicht "ti"

Die Seite spricht den Besucher in der Hoeflichkeitsform an, weil der
Trichter dahinter es tut: `lifeskin-content.js` sagt *"Zgjidhni një
mënyrë"*, *"Analizoni lëkurën"*, *"Na tregoni problemin"*. Eine
Landingpage in "ti", die auf einen Bildschirm in "ju" fuehrt, wechselt
mitten im Weg die Anrede - und das merkt jeder, auch wer es nicht
benennen kann.

Wer auf "ti" umstellen will, stellt **beides** um: diese Seite UND
`lifeskin-content.js` samt Befund. Eine Haelfte allein ist schlechter
als jede der beiden Fassungen.

## Verhaelt sich die Seite wie eine normale Seite?

Geprueft auf 390x844 im Chromium der Playwright-Installation, jede
Zeile gemessen und nicht vermutet:

| Was eine normale Seite tut | Hier | |
|---|---|---|
| Rad/Wischen bewegt das Dokument | `scrollY` folgt 1:1 | ✓ |
| `Bild-ab` blaettert einen Bildschirm | 724 von 844 Punkten (Ueberlappung) | ✓ |
| `Ende` haelt am Dokumentende | 4785 = `scrollHeight - innerHeight` | ✓ |
| Unten steht Inhalt, kein leerer Streifen | Fussunterkante = Fensterunterkante, 0 Punkte Rest | ✓ |
| `scrollHeight === offsetHeight` | 5629 = 5629 | ✓ |
| Ankersprung landet unter dem Rand | `#garancia` 16 Punkte unter der Kante (`scroll-padding-top`) | ✓ |
| Neuladen behaelt die Stelle | **war kaputt, ist repariert** - siehe unten | ✓ |
| Browser-Zurueck fuehrt heraus | aus dem Trichter zurueck auf die Seite, an dieselbe Stelle | ✓ |
| Text ist markierbar | `user-select: auto` | ✓ |
| Vergroessern erlaubt | `width=device-width, initial-scale=1` - kein `user-scalable=no`, kein `maximum-scale` | ✓ |
| Eine `h1`, danach `h2` | 1x h1, 9x h2, keine Stufe uebersprungen | ✓ |
| `main`, `header`, `footer`, `lang` | je einmal, `lang="sq"` | ✓ |
| Jedes Bild mit `alt` und Massen | 9 von 9 | ✓ |
| Tabulator erreicht jeden Griff | 23 Stationen, jede sichtbar, jede mit Fokusring | ✓ |
| Ohne JavaScript lesbar | erster Blick 786 Punkte hoch, Text vollstaendig | ✓ |

### Neuladen warf einen an den Seitenanfang

`zeige()` in `lifeskin-app.js` ruft bei jedem Bildschirmwechsel
`window.scrollTo(0, 0)`. Fuer die Bildschirme des Trichters ist das
richtig - jeder ist eine eigene Seite. Beim **allerersten** Aufruf beim
Laden nahm die Zeile dem Browser aber seine eigene Wiederherstellung
weg: Wer die Seite bei den Fragen neu lud, stand wieder ganz oben
(gemessen: `scrollY` 2000 -> Neuladen -> 0, bei
`history.scrollRestoration === "auto"`).

Im Browser von Instagram passiert genau das oft: Die App laedt den Tab
neu, sobald man aus ihm heraus und wieder hinein wechselt.

Die Zeile laeuft jetzt nur noch, wenn es einen vorherigen Bildschirm
gab (`if (vorher) window.scrollTo(0, 0)`). Der erste Aufruf gilt immer
dem Bildschirm, der ohnehin dasteht - gescrollt wuerde also auf eine
Stelle, an der noch niemand etwas getan hat. Gemessen danach: Neuladen
-> 2010, Eintritt in den Trichter aus 2500 Punkten Hoehe -> `scrollY` 0,
Browser-Zurueck aus dem Trichter -> 1800, also die Stelle von vorher.

### Offen: 6,7 MB laden, waehrend jemand die Ueberschrift liest

`starte()` ruft `netzVorladen()`, und das holt das Gesichtsnetz von
MediaPipe (`vision_bundle.mjs`, WASM und `face_landmarker.task`, nach
dem Kommentar im Code rund 6,7 MB). Der Kommentar dort begruendet es
richtig - **fuer die Zeit, als die App am Trichter anfing.** Seit die
Landingpage Bildschirm 1 IST, laeuft der Abzug, waehrend jemand den
ersten Satz liest:

* auf Mobilfunk in Kosovo, im Browser von Instagram,
* im Wettbewerb mit den acht Fallaufnahmen um dieselbe Leitung,
* und **fuer drei von vier Wegen umsonst** - nur `skanim` braucht das
  Netz.

Zu aendern waere eine Zeile: `netzVorladen()` erst beim Eintritt in den
Trichter (oder erst bei der Wahl `skanim`). Das ist eine Aenderung am
Verhalten des Trichters und steht deshalb hier als Befund und nicht als
Tat. Gemessen ist hier nur, DASS die Anfrage beim Laden der
Landingpage rausgeht; die Groesse stammt aus dem Kommentar im Code, die
Leitung dieses Containers laesst den Abzug nicht zu.

## Was gemessen wird

Keine zweite Messtechnik. Gemeldet wird ueber `fbq` - denselben Kanal,
den `lifeskin-pixel.js` anlegt. Steht dort keine Kennung oder fehlt die
Zustimmung, gibt es kein `fbq`, und dann passiert nichts. Kein eigener
Endpunkt, keine eigene Kennung, und nichts, was einen Menschen
beschreibt: Hinaus geht ein Name und sonst nichts.

| Ereignis | Wann |
|---|---|
| `lifeskin_landing_view` | beim Laden, aus `lifeskin-pixel.js` (PIXEL_SEITEN) |
| `lifeskin_method_section_view` | `#menyrat` zu 30 % im Bild |
| `lifeskin_results_view` | `#rezultatet` |
| `lifeskin_instagram_proof_view` | `#komuniteti` |
| `lifeskin_product_section_view` | `#produktet` |
| `lifeskin_guarantee_view` | `#garancia` |
| `lifeskin_hero_cta_click` … `lifeskin_sticky_cta_click` | je Knopf |

### Der Trichter dahinter - geprueft, nicht geaendert

Die fuenf Stufen, die eine Bestellung erklaeren, und wo sie wirklich
haengen:

| Stufe | Standardname | Wo |
|---|---|---|
| Besuch | `PageView` | jede Seite, aus `lifeskin-pixel.js` |
| Befund steht | `ViewContent` | Schritt `captured` |
| Preis vor Augen | `AddToCart` | Marke `sahPreis` in `astra.js` · Korb im Laden |
| Kasse offen | `InitiateCheckout` | Marke `kasseGeoeffnet` in `astra.js` · Kasse im Laden |
| Nummer abgegeben | `Lead` | `meldeLead()`, nach dem Ja des Servers |
| Bestellung | `Purchase` | `melde("ordered")` in `astra.js` und im Laden |

**Die Luecke "Angebot gesehen" ist zu.** `AddToCart` und
`InitiateCheckout` standen seit jeher in `PIXEL_EREIGNISSE` - an den
Schritten `"offer"` und `"address"`, und die ruft im ganzen Trichter
niemand auf. Zwei von Metas fuenf Standardereignissen lagen damit tot
da, und zwischen "Nummer abgegeben" und "bestellt" fehlte genau die
Stufe, an der sich zeigt, ob der Preis bremst.

Sie haengen jetzt an den zwei Lesemarken, die `astra.js` ohnehin
schreibt (`#markeSetzen`), und im Laden am Korb und an der Kasse. **Die
Stufenzahlen in Heart aendern sich dadurch nicht** - dort werden die
Firestore-Marken gezaehlt, nicht die Pixel-Ereignisse; hier kommt nur
dazu, dass dieselbe Marke auch an Meta geht.

**Ein Klick ist keine Bestellung - und ist auch keine.** `melde("ordered")`
steht in `astra.js` HINTER dem Schreibvorgang: Schlaegt er fehl, kehrt
die Methode vorher zurueck. Gemeldet wird also nur, was wirklich
gespeichert ist. (`meldeLead()` haengt dagegen an zwei Stellen: an der
gespeicherten Nummer und am Tipp auf den WhatsApp-Knopf. Der zweite ist
ein Klick - das ist im Kommentar dort begruendet und bleibt, es ist
kein Kauf.)

**Doppelte Meldungen.** `Pixel.gemeldet` ist ein Set je Instanz, also
je Seitenaufruf genau einmal.

Zwei Zaehlfehler waren trotzdem drin und sind behoben:

* **Drei Seiten, ein Name.** Trichter, Warteseite und Befundseite riefen
  alle `melde("opened")` und meldeten damit alle `lifeskin_landing_view`.
  Wer aus WhatsApp auf seinen Befund zurueckkam, wurde darin als neuer
  Besucher der Landingpage gezaehlt. Jetzt entscheidet `PIXEL_SEITEN`
  ueber den eigenen Namen (`lifeskin_landing_view`,
  `lifeskin_waiting_view`, `lifeskin_report_view`); `PageView` geht
  weiter von jeder Seite hinaus, denn eine Seite ist eine Seite.
* **Ein Hero-Klick, den niemand gemacht hat.** `metodeGehen()` in
  `landing.js` drueckt `#ls-start` von Hand, um in den Trichter zu
  kommen - und der Horcher meldete daraufhin `lifeskin_hero_cta_click`.
  Je Tipp auf eine Menyra-Karte stand danach ein Klick auf den Knopf im
  ersten Blick in der Zahl. Die Sperre `leitetWeiter` gab es fuer
  genau diesen Fall schon; dieser Weg lief daran vorbei. Gemessen
  danach: Kartentipp meldet `methods`, Hero-Tipp meldet weiter `hero`.
* **`lifeskin_lp_view` ist weg.** `landing.js` meldete es beim Laden,
  und `lifeskin-pixel.js` meldete im selben Augenblick
  `lifeskin_landing_view` - zwei Namen fuer einen Besuch.

**Was NICHT hinausgeht:** `meldeLead()` und `meldeAbgabe()` senden `{}`,
`pixelDaten()` nur `{currency, value}` und die Bestellnummer. Keine
Aufnahme, keine Antwort aus dem Fragebogen, keine Telefonnummer. Die
Ereignisse dieser Seite senden einen Namen und sonst nichts.

**Und heute laeuft er.** `LIFESKIN_PIXEL_ID` traegt die Nummer des
Datensatzes *LF WEB* (`1347571994123884`), und
`LIFESKIN_PIXEL_EINWILLIGUNG_NOETIG` steht auf `false` - der Pixel
laedt also beim ersten Aufruf, ohne Abfrage. Diese Entscheidung ist
eine Rechtsfrage und keine technische; die Sperre bleibt vollstaendig
im Code, und eine Abfrage waere eine Zeile in der Konfiguration plus
`pixel.erlaube(true)`.

**Der kopierte Basiscode gehoert NICHT in den `<head>`.**
`lifeskin-pixel.js` baut Metas Ladeschnipsel selbst - dieselbe
Warteschlange, dasselbe `fbevents.js`, nur hinter dem Schalter und mit
den Ereignissen des Trichters daran. Wer den Schnipsel aus dem
Ereignismanager zusaetzlich einsetzt, bekommt zwei `init` und zwei
`PageView` je Besucher. Ein Test prueft alle vier Seiten darauf.

**Gemessen**, nicht am Aufbau abgelesen: Mit abgefangenem `fbq` im
Chromium geht auf der Landingpage hinaus -

```
init 1347571994123884
trackCustom lifeskin_landing_view
track       PageView
trackCustom lifeskin_results_view
trackCustom lifeskin_product_section_view
track       AddToCart        {currency:"EUR", value:33}
track       InitiateCheckout {currency:"EUR", value:33}
track       Purchase         {currency:"EUR", value:33}  eventID: LS-…
```

Im selben Durchgang wurde gegengeprueft, dass Name, Telefonnummer,
Strasse und Ort in **keiner** Meldung vorkommen.

### Was als Naechstes kaeme

**Die Conversions API.** Der Browser-Pixel verliert 20 bis 40 Prozent -
iOS, Werbeblocker, Tracking-Schutz. Eine Function, die Bestellungen
serverseitig an Meta meldet, faengt das ab; die `eventID` dafuer steht
an `Purchase` schon dran (`order.orderId`), Meta legt beide Meldungen
also von selbst zusammen. Es braucht ein Meta-Access-Token als Secret
und einen Functions-Deploy.

**Advanced Matching** waere der zweite Hebel - und ist hier
ausgeschlossen: Es hiesse, gehashte Telefonnummern an Meta zu schicken,
und fuer diese Seite gilt, dass weder Aufnahmen noch Antworten noch
Nummern in die Messtechnik gehen.

Dazu die **Quelle des Einstiegs**: Welcher Knopf getippt wurde, steht
danach in `window.__lifeskinCtaQuelle` und in `sessionStorage` unter
`lifeskin_cta_quelle` (`hero`, `methods`, `products`, `final`,
`sticky`). Das ist die Frage, die spaeter entscheidet, welcher
Abschnitt wirklich verkauft. **Es aendert nichts am Weg** - jeder Knopf
fuehrt auf denselben Wahlbildschirm.

## Die drei Unterschiede zur Vorlage

`apps/lifeskin-landing-template/` (Adresse `/landingpagetemplate`) ist
die **Vorlage zum Ausprobieren** und bleibt es. Diese Seite laedt
**nichts** aus dem Vorlagenordner - auch keine Bilder. Das ist der ganze
Sinn der Trennung: Ein Handgriff an der Vorlage darf niemals etwas an
der Seite aendern, die heute Besucher traegt.

1. **Alle Masse und Farben haengen an `#ls-einstieg`, nicht an `:root`.**
   Diese Seite laedt `lifeskin-styles.css` mit, und das Blatt vergibt
   dieselben Namen (`--grund`, `--kauf`, `--linie` ...) mit anderen
   Werten fuer die Bildschirme dahinter. Stuenden sie hier noch einmal
   an `:root`, bekaemen Wahl, Kamera, Name und Aufbereitung die Farben
   der Landingpage mit - und weil die Werte nah beieinander liegen,
   faellt das niemandem auf.
2. **Kein eigener Fortschrittsbalken.** Der Trichter hat seinen eigenen
   (`.ls-fortschritt`).
3. **Gescrollt wird ein Kasten, nicht die Seite.** `lifeskin-styles.css`
   setzt `html` und `body` auf `overflow: hidden` - ein Bildschirm *ist*
   die Fensterhoehe. Der lange Text liegt deshalb in `.lp` und scrollt
   darin. `landing.js` misst deshalb `#lp` und nicht das Fenster.

| Datei | Was drin steht |
|---|---|
| `index.html` | Der ganze Text, die neun Abschnitte und die Bildschirme 2 bis 6 |
| `landing.css` | Bildschirm 1 (alles an `#ls-einstieg`, nichts an `:root`) und die vier Karten der Wahl |
| `landing.js` | Bewegung und Zaehlung. Kein Inhalt, kein Modul, keine Abhaengigkeit |
| `fotot/` | Acht Aufnahmen, vier Faelle: para und pas |

Die Anwendung selbst liegt weiter unter `/apps/lifeskin/` und wird von
hier geladen, nicht kopiert.

## Neun Knoepfe, eine Kennung

Es gibt neun Knoepfe, die den Einstieg ausloesen: im ersten Blick, die
vier Menyra-Karten, unter den Menyra, unter den Produkten, im letzten
Griff und der feste am Rand. Einer traegt `id="ls-start"` - die Kennung,
die `lifeskin-app.js` anspricht, und eine Kennung darf es nur einmal
geben. Die anderen tragen `data-ls-start` und reichen ihren Tipp an ihn
weiter (`landing.js`, Abschnitt 7).

Derselbe Weg gilt fuer den Tipp, der **vor** dem JavaScript kommt: Das
kurze Skript im `<head>` merkt ihn sich ueber `data-ls-start`, damit
ein Knopf, dessen Module noch unterwegs sind, nicht wie eine kaputte
Seite aussieht - und merkt sich dabei auch, welcher Knopf es war.

## Nur Handy, und darin Instagram und Facebook

Geprueft auf 320, 360, 375, 390, 393, 414 und 430 Punkten Breite, dazu
Tablet und Schreibtisch. Auf keiner davon scrollt die Seite waagerecht
(`#lp.scrollWidth === clientWidth`), und auf keiner faellt der Knopf aus
dem ersten Blick.

* **Kein Hover traegt eine Funktion.** Die Ruecknahme beim Tippen ist
  die einzige Antwort, die auf einem Telefon ankommt; was es nur beim
  Ueberfahren gibt, steht in `@media (hover: hover)`.
* **Nichts haengt am Ziehen.** Die Fallbahn wischt, laesst sich aber
  auch mit den Pfeiltasten bewegen (`tabindex`), und beide Aufnahmen
  stehen vom ersten Moment an nebeneinander. **Den Aufdecker gibt es
  nicht mehr:** Die zweite Aufnahme wischte per `clip-path` herein,
  sobald die Karte zu 55 % im Bild war - in der Bahn lief das oft ab,
  waehrend die Karte noch halb am Rand stand, also ohne dass jemand
  hinsah. Ein Vergleich lebt davon, dass beide Bilder gleichzeitig
  dastehen; eine Haelfte, die erst erscheint, macht daraus eine
  Vorfuehrung.
* **`prefers-reduced-motion: reduce`** nimmt jede Bewegung weg; der
  Inhalt ist vollstaendig da.
* **Jedes Tippziel ist groesser als 24 x 24 Punkte**, die meisten 44
  oder mehr. Der Fokus ist sichtbar (2 Punkte in der Markenfarbe).
* **Jeder Aufklapper ist 54 Punkte hoch** - gemessen 56 (Fragen) und
  54 (Garantiebedingungen), also so gross wie jeder Knopf.
* **Kein Tippziel unter 44 x 44 Punkten** - gemessen ueber jeden Knopf,
  Link und Aufklapper des Einstiegs.
* **Keine feste Hoehe.** Der erste Blick hat eine MINDESThoehe (80svh
  minus Kopf) und waechst mit dem Inhalt; auf einem Fenster unter 560
  Punkten und im Querformat faellt auch die weg. Zwei Drittel mehr
  Schrift auf einem 320er laufen ohne waagerechten Ueberlauf durch.
* **Der Zoom ist nicht gesperrt**: kein `user-scalable=no`, kein
  `maximum-scale`. Mit 24 bis 32 Punkten Grundschrift (rund 150-200 %)
  auf 360, 390 und 430 laeuft nichts aus dem Bild, und keine
  Menyra-Karte schneidet ihren Text ab.
* **Der Fortschrittsbalken des Trichters ist auf der Landingpage weg.**
  Er stand dort bei 20 % - ein Fuenftel eines Wegs, den niemand
  angefangen hat. Gemessen: auf der Landingpage `visibility: hidden`,
  im Trichter wieder sichtbar (auf dem Anliegenschirm 55 %).
* **Antworten bleiben beim Zurueckgehen stehen.** Geprueft auf dem Weg
  "Vetëm pyetje": Name und Text eingetippt, zurueck auf die Wahl,
  wieder hinein - beides steht noch da.
* **Gemessen: CLS 0,000** ueber die ganze Seite, LCP ist die
  Ueberschrift des ersten Blicks - sie steht im Aufbau und wartet auf
  keine Datei. Deshalb laedt der erste Blick auch kein Bild mehr: Das
  `preload` auf das Gesicht der Aerztin ist weg, sie steht jetzt in
  ihrem eigenen Abschnitt und wird nachgeladen.

## Was beim Aendern schiefgehen kann

* **Ein `data-text` an einem Text dieser Seite.** `#texteSetzen()` in
  `lifeskin-app.js` schreibt jeden solchen Knoten neu - beim Knopf
  wischte das den Pfeil neben seinem Wort weg. Die Texte stehen hier
  bewusst fest im Aufbau: Die Seite ist vollstaendig lesbar, sobald die
  erste Antwort des Servers da ist, und nicht erst nach elf Modulen.
* **Eine zweite Kennung `ls-start`.** Dann erwischt die Anwendung immer
  nur die erste.
* **`data-ls-weg` an einer Karte der Landingpage.** Dann fuehrt sie
  unmittelbar in einen Weg und ueberspringt den Wahlbildschirm - und
  die Zahlen dahinter zaehlen etwas anderes als vorher.
* **`data-ls-start>` ohne das Attribut am Ende.** `landing.js` findet
  den Knopf ueber `closest("[data-ls-start]")` und ist davon
  unabhaengig; `tests/lifeskin-trichter-variante.test.mjs` sucht aber
  die Zeichenfolge `data-ls-start>`. Deshalb steht `data-ls-quelle`
  davor und `data-ls-start` zuletzt.
* **Ein Bild mit anderem Zuschnitt.** Der Zuschnitt der Faelle steht im
  Stilblatt (`.gjysma img`, `scale(1.385)`, `aspect-ratio: 8/9`) und
  nicht in den Dateien - so bekommen beide Aufnahmen einer Karte
  zwangslaeufig denselben. Der Faktor ist fuer 8/9 ausgerechnet; ein
  anderes Verhaeltnis verschiebt den Ausschnitt.
* **Eine Stufe "Skanimi" im Trichter von Heart.** Ein Trichter zaehlt
  kumulativ - sie wuerde jeden mitzaehlen, der ohne Scan weitergegangen
  ist.

## Der Weg zurueck

Ein Handgriff, kein Wiederherstellen:

* `vercel.json` - die zwei Regeln `/lifeskin` und `/lifeskin/` wieder
  auf `/apps/lifeskin-trichter/index.html`,
* `scripts/local-dev-server.mjs` - `LANDING_INDEX` gegen
  `TRICHTER_INDEX` tauschen.

`apps/lifeskin-trichter/` (kurzer Einstieg) und `apps/lifeskin/` (lange
Fassung) stehen unveraendert daneben. Genau dafuer sind sie liegen
geblieben. `tests/lifeskin-trichter-variante.test.mjs` prueft beides:
dass die drei Stellen dasselbe Ziel nennen und dass der Weg zurueck
noch daliegt.

## Ein Satz, der mehr versprach, als der Ablauf haelt

Unter der Aerztin stand *"Fotot i sheh vetëm Dr. Gashi"* - nur sie sieht
die Aufnahmen. **Das stimmt so nicht.** Im Ablauf liegt der Fall in
Heart, und von dort geht der Prompt zusammen mit den Aufnahmen an einen
externen Dienst: der Knopf *"Prompt v5 für diesen Fall kopieren"* in
`heart-lifeskin-render.js`, und `docs/lifeskin-prompt.json` sagt es
ausdruecklich - *"zusammen mit 1-3 Gesichtsaufnahmen senden"*. Danach
prueft Dr. Gashi das Ergebnis und gibt es frei; sie ist aber nicht die
Einzige, die die Aufnahmen sieht.

Was bleibt, ist das, was wirklich gilt:

> **Fotot tuaja mbeten private**
> Nuk publikohen dhe nuk u shiten palëve të treta. Analizën e shqyrton
> dhe e miraton Dr. Violeta Gashi para se t'ju dërgohet.

Davor stand *"asgjë nuk shitet"*. Gemeint waren die Daten - die deutsche
Fassung im Trichter sagt es richtig ("nichts weitergegeben") -, aber auf
einer Seite, die sechs Abschnitte weiter oben Produkte verkauft, liest
sich der Satz wie ein Widerspruch zu allem anderen.

**Offen und nicht hier zu loesen:** ob und wie die externe Verarbeitung
genannt werden muss. Das gehoert in eine Datenschutzerklaerung, und die
gibt es noch nicht. **Und dieselbe zu starke Zeile steht weiter an drei
Stellen des Trichters**, die hier nicht angefasst wurden:
`lifeskin-content.js` (`langSchutzTitel`, `langSchutzText`),
`apps/lifeskin-trichter/index.html` und
`apps/lifeskin-landing-template/index.html`.

## Die Garantie sagt, was passiert

*"Zbatohet garancia sipas kushteve"* erklaerte nichts. Wer 53 EUR
abwaegt, will drei Dinge wissen: wen schreibe ich an, was passiert dann,
und wann kommt das Geld zurueck. Alle drei Antworten stehen im Betrieb
(`bericht-texte.js`, `garanciText` und die Frage *"Po nëse nuk
funksionon te unë?"*); jetzt stehen sie auch auf der Seite:

> Na shkruani te Dr. Gashi brenda 45 ditëve nga marrja e pakos. Së pari
> shohim si ka reaguar lëkura dhe e përshtatim rutinën pa pagesë. Nëse
> edhe pas kësaj nuk shihni ndryshim, paratë kthehen.

Die vollstaendigen Bedingungen stehen darunter im Aufklapper, nicht
hinter einem Link auf eine Seite, die es nicht gibt.

## Was ausdruecklich nicht geprueft ist

Alles oben ist in Chromium gemessen (Playwright, das im Projekt
vorhandene `chromium-1194`), mobil mit Touch und doppelter Punktdichte.
**Firefox und WebKit sind in dieser Umgebung nicht installiert** und
wurden nicht ausgefuehrt. Ein WebKit-Lauf waere ohnehin kein Ersatz fuer
ein echtes iPhone; die folgenden Punkte bleiben offen:

* echtes iOS Safari und Android Chrome,
* die In-App-Browser von Instagram und Facebook,
* `env(safe-area-inset-*)` auf einem Geraet mit Kerbe,
* der Fokuszoom in den Eingabefeldern des Trichters auf iOS,
* Ladeverhalten auf einer wirklich langsamen Verbindung. Die genannten
  Zahlen (CLS, LCP) sind Laborwerte aus dieser Umgebung und keine
  Felddaten.

## Der Fotoweg nimmt auf, er laedt nicht hoch

Das ist ein Unterschied, den die Seite jetzt benennt:

* **"Me foto"** oeffnet die Kamera (`#fotoStarten` in
  `lifeskin-app.js`). Es gibt dort **keine** Auswahl aus der Galerie.
* **"Për trupin"** und **"Vetëm pyetje"** haben ein Dateifeld
  (`#ls-anliegendatei`, `accept="image/*"`): Dort laesst sich eine
  Aufnahme anhaengen, die schon auf dem Telefon liegt - und das
  Anhaengen ist freiwillig.

Deshalb heisst die Karte jetzt *"Fotografoni zonën që ju shqetëson"*
und nicht mehr *"Dërgoni një foto"* - das klang nach Hochladen. Und
unter den Karten steht, was der Ausweg ist, wenn die Kamera nicht
aufgeht: *"Nëse kamera nuk hapet, te «Për trupin» dhe «Vetëm pyetje»
mund të bashkëngjitni një foto që e keni tashmë në telefon."* Der
Besucher erfaehrt das jetzt vor der Entscheidung und nicht erst aus
einer Fehlermeldung.

**Nicht geaendert:** die Fehlerbehandlung der Kamera selbst. Sie
verweist auf Safari/Chrome, wenn der In-App-Browser blockt
(`fehlerKameraInApp` in `lifeskin-content.js`) - richtig, aber sie
bietet keinen Weg ohne Kamera an. Eine Galerieauswahl im Fotoweg waere
eine Aenderung am Trichter und gehoert nicht in diesen Feinschliff.

## Was noch fehlt

* **Impressum, Datenschutz, AGB.** Es gibt sie in diesem Projekt nicht,
  und `LIFESKIN_ANBIETER` in `lifeskin-config.js` steht leer (Name,
  Anschrift, E-Mail). Der Fuss verlinkt deshalb nur, was es wirklich
  gibt. Ein Link auf eine Seite, die es nicht gibt, faellt genau dem
  auf, der nachsieht, weil er misstrauisch ist. Sobald die Angaben
  stehen, gehoeren sie in `.fuss__lidhjet`.
* **Ein Hero-Bild, ein Packshot, ein Instagram-Screenshot.** Siehe oben.
