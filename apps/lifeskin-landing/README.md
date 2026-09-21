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

**Den festen Knopf gibt es nur noch dort, wo er hilft.** Er erscheint,
wenn *keine* Hauptaktion im Bild ist, und verschwindet, sobald eine
auftaucht. Beobachtet werden deshalb die Handlungen und nicht die
Abschnitte (`[data-ls-konkurrenz]`): der Knopf im ersten Blick, die vier
Karten, **der Preiskasten**, der Knopf im Produktabschnitt, der Knopf im
Abschluss.

> Der Preiskasten kam dazu, weil die Leiste ihn auf dem Telefon unten
> anschnitt - und das ist die eine Flaeche, auf der Preis, Zahlungsart
> und der Fall mit einem Mittel stehen. Geprueft ueber die ganze Seite
> auf 360x640, 360x780, 390x664, 390x844, 430x739 und 430x932 (die
> zweiten Werte je Breite sind Safari mit eingeklappter Adressleiste):
> Die Leiste verdeckt an keiner Scrollstellung den Preiskasten, die
> Karten, den Knopf im ersten Blick, den Abschluss, die Garantiezahl
> oder den Satz zur Begleitung.

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
| C | Çmimet (`#cmimet`) | **"Was kostet das?"** |
| — | Raste (`#rezultatet`) | "Bringt das etwas?" - die belegten Vorher-Nachher-Faelle |
| D | Menyrat (`#menyrat`) | "Wie fange ich an?" |
| E | Ekspertiza (`#mjekja`) | "Wer steht dahinter, und was passiert mit meinen Fotos?" |
| F | Komuniteti (`#komuniteti`) | "Gibt es die Marke wirklich?" |
| G | Garancia + Pyetjet (`#garancia`) | "Und wenn es nicht passt?" |
| H | Fundi (`#fund`) + Fuss | Der Anfang. |

**Preise stehen vor der Methodenwahl.** Wer natuerlich scrollt, weiss
was es kostet, bevor er sich fuer einen Weg entscheidet; wer schon
entschieden ist, springt mit dem Knopf im ersten Blick direkt auf die
Wahl.

**`#rezultatet` steht nicht in der Liste des Auftrags** und ist
trotzdem geblieben: Das sind die einzigen als Verlauf belegten
Aufnahmen, die es gibt, und sie mit einem Handgriff zu loeschen waere
ein Verlust, den kein Umbau rechtfertigt. Er steht direkt hinter den
Preisen, weil beide dasselbe beantworten. Wer ihn doch weghaben will,
loescht eine `<section>`.

## Die Sets: eine Karte ist der Eintrag

`#cmimet` traegt je Set eine `<article class="seti">`. Die Karte IST
der Eintrag - es gibt keine zweite Liste daneben, die nachgezogen
werden muesste.

| Merkmal | Bedeutung |
|---|---|
| `data-set` | feste Kennung, wird nie wiederverwendet |
| `data-produkte` | Anzahl der Mittel im Set |
| `data-cmim` | Gesamtpreis in EUR |
| `data-verifikuar` | `jo` = Beispiel, `po` = belegter Fall |

**Ein weiteres Set dazunehmen** heisst: den `<article>` kopieren,
`data-set` auf die naechste Kennung setzen, die zwei Dateien in
`fotot/` legen, die Angaben austauschen. Nichts anderes auf der Seite
aendert sich dadurch; auf dem Schreibtisch reiht sich die Karte von
selbst ein (`auto-fill`).

**Ein Paar ohne Partner kommt nicht auf die Seite.** Lieber zwei
Karten als drei, von denen eine ein fremdes Gesicht neben einem Set
zeigt. Unvollstaendige Eintraege bleiben ungeschrieben - es gibt keine
leeren Platzhalter.

**Was mit `data-verifikuar="po"` dazukommt** (und heute nirgends
steht, weil nichts belegt ist):

```
Albulena · emër i ndryshuar
Pas analizës SkinReact, porositi setin e rekomanduar me 2 produkte.
53 € · Dërgesa e përfshirë
```

Solange das nicht bestaetigt ist, stehen dort die neutralen Woerter:
`Shembull 1`, `Set me dy produkte LifeSkin.`, `53 €`. Kein Vorname,
kein "porositi", kein Zeitraum - und **kein "Para/Pas"**: Diese Paare
sind als Verlauf nicht belegt. Die Bildunterschriften beschreiben, was
auf der Aufnahme zu sehen ist (`Lëkura`, `Seti LifeSkin`), und der Satz
unter den Karten sagt es noch einmal in Worten.

`Para` und `Pas` stehen nur in `#rezultatet`, wo der Verlauf
dokumentiert ist.

## Die Preise

| Umfang | Preis | Quelle |
|---|---|---|
| 1 Mittel | 33 € | `lifeskin-catalog.js`, `einzelpreis` |
| 2 Mittel | 53 € | `lifeskin-catalog.js`, `setPreis` bei `setGroesse` 2 |
| 3 Mittel | 85 € | **nur aus dem Auftrag** |
| Versand | 0 € | `lifeskin-catalog.js`, `versandKosten` |
| Zahlung | bei Lieferung | `lifeskin-catalog.js`, `zahlarten: ["nachnahme"]` |

**85 EUR steht im Code nirgends.** `lifeskin-catalog.js` kennt genau
einen Setpreis (`setPreis`) fuer genau eine Setgroesse (`setGroesse`
2). Ein Set aus drei Mitteln zu 85 EUR rechnet das Angebot am Ende der
Analyse deshalb heute NICHT aus - es kaeme dort auf 53 EUR. Wer das
dritte Set live schaltet, muss vorher `lifeskin-catalog.js` und den
Preisblock in `astra.js` dafuer oeffnen; sonst steht auf der
Landingpage eine Zahl, die der Warenkorb nicht kennt.

Alle drei Zahlen stehen an EINER Stelle auf der Seite: in der ersten
Frage unter der Garantie. Vorher lagen drei Preiserklaerungen in einem
Kasten uebereinander.

## Was auf dieser Seite behauptet wird - und woher es kommt

Nichts steht hier, was nicht belegt ist. Drei Arten von Angaben:

**Aus dem Code, mit Quelle.** Wer die Quelle aendert, muss diese Seite
mitaendern - an jeder Stelle steht ein Kommentar dazu:

| Angabe | Quelle |
|---|---|
| `28 ditë` unter jedem Fall | `lifeskin-catalog.js`, `reichweiteTage` |
| `2 produkte` | `lifeskin-catalog.js`, `setGroesse` |
| `53 €` | `lifeskin-catalog.js`, `setPreis` |
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

## Was gemessen wird

Keine zweite Messtechnik. Gemeldet wird ueber `fbq` - denselben Kanal,
den `lifeskin-pixel.js` anlegt. Steht dort keine Kennung oder fehlt die
Zustimmung, gibt es kein `fbq`, und dann passiert nichts. Kein eigener
Endpunkt, keine eigene Kennung, und nichts, was einen Menschen
beschreibt: Hinaus geht ein Name und sonst nichts.

| Ereignis | Wann |
|---|---|
| `lifeskin_lp_view` | beim Laden |
| `lifeskin_method_section_view` | `#menyrat` zu 30 % im Bild |
| `lifeskin_results_view` | `#rezultatet` |
| `lifeskin_instagram_proof_view` | `#komuniteti` |
| `lifeskin_product_section_view` | `#produktet` |
| `lifeskin_guarantee_view` | `#garancia` |
| `lifeskin_hero_cta_click` … `lifeskin_sticky_cta_click` | je Knopf |

### Der Trichter dahinter - geprueft, nicht geaendert

Die fuenf Stufen, die eine Bestellung erklaeren, und wo sie wirklich
haengen:

| Stufe | Verdrahtet | Wo |
|---|---|---|
| Besuch | ja | `lifeskin_lp_view` hier, dazu `melde("opened")` → PageView |
| Weg gewaehlt | ja | `#wegMerken()` → `pixel.meldeWeg(typ)`, einmal je Typ |
| Abgabe fertig | ja | `meldeAbgabe(...)` / `meldeLead()`, nach dem Ja des Servers |
| **Angebot gesehen** | **nein** | - |
| Bestellung bestaetigt | ja | `melde("ordered")` in `astra.js` |

**Die Luecke: "Angebot gesehen" wird nirgends gemeldet.**
`lifeskin-session.js` fuehrt `"offer"` und `"address"` in `SCHRITTE`,
aber weder `astra.js` noch `lifeskin-app.js` rufen `schritt("offer")`
oder `melde("offer")` je auf. `PIXEL_EREIGNISSE.offer = "AddToCart"`
liegt damit tot da. Zwischen "Nummer abgegeben" und "bestellt" fehlt
also genau die Stufe, an der sich zeigt, ob der Preis oder das Angebot
bremst. **Hier nicht nachgezogen**: Es wuerde die Stufenzahlen in Heart
veraendern, und das ist eine Entscheidung ueber Geschaeftszahlen und
keine Feinarbeit an der Landingpage.

**Ein Klick ist keine Bestellung - und ist auch keine.** `melde("ordered")`
steht in `astra.js` HINTER dem Schreibvorgang: Schlaegt er fehl, kehrt
die Methode vorher zurueck. Gemeldet wird also nur, was wirklich
gespeichert ist. (`meldeLead()` haengt dagegen an zwei Stellen: an der
gespeicherten Nummer und am Tipp auf den WhatsApp-Knopf. Der zweite ist
ein Klick - das ist im Kommentar dort begruendet und bleibt, es ist
kein Kauf.)

**Doppelte Meldungen.** `Pixel.gemeldet` ist ein Set je Instanz, also
je Seitenaufruf genau einmal. Zwei Instanzen gibt es trotzdem - eine im
Trichter, eine auf `/analiza/<kennung>` -, und `melde("opened")` heisst
in beiden `lifeskin_landing_view`. Wer die Zahl liest, bekommt Besuche
der Landingpage und Aufrufe des Befunds in einem Topf. **Auch das hier
nicht geaendert**, aus demselben Grund.

**Was NICHT hinausgeht:** `meldeLead()` und `meldeAbgabe()` senden `{}`,
`pixelDaten()` nur `{currency, value}` und die Bestellnummer. Keine
Aufnahme, keine Antwort aus dem Fragebogen, keine Telefonnummer. Die
Ereignisse dieser Seite senden einen Namen und sonst nichts.

**Und heute laeuft gar nichts.** `LIFESKIN_PIXEL_ID` steht leer, und
`Pixel.aktiv` verlangt zusaetzlich `erlaube(true)` aus einer
Zustimmungsabfrage, die es noch nicht gibt. Alles oben ist am Aufbau
geprueft, nicht an gesendeten Ereignissen.

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
  stehen ohnehin gleichzeitig im Bild - der Aufdecker ist keine
  Bedienung.
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
