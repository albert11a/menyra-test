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

## Was oben und unten klebte

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
Karten, der Knopf im Produktabschnitt, der Knopf im Abschluss.

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

**Getrennt wird durch Flaeche, nicht durch Linien.** Hier lagen drei
`border-top`. Jede war ein Strich, der "neuer Abschnitt" sagte, obwohl
der Wechsel der Flaeche das schon sagt; zwei Signale fuer dieselbe
Sache lesen sich als Unsicherheit. Die Flaechen wechseln sich jetzt
luecklos ab - Grund, Sand, Grund, Sand - und damit ist jede Kante da,
ohne dass eine gezeichnet wird.

**Nicht alles ist eine Karte.** Karten tragen, was man antippen oder
vergleichen soll: die vier Menyra, die vier Faelle, die zwei Profile,
der Preis. Das Zitat der Aerztin und der Schutzsatz darunter standen
ebenfalls in Karten und stehen jetzt frei auf der Flaeche - eine Karte
um ein Zitat laesst den ruhigsten Abschnitt der Seite wie ein Angebot
aussehen.

## Der Preis beantwortet zwei Fragen

Er beantwortete nur eine: was es kostet. Und er nahm die Antwort im
selben Kasten wieder zurueck - unter "53 €" stand *"Çmimi i saktë ...
shfaqet në fund të analizës"*. Wer 53 EUR wirklich abwaegt, liest genau
diese Zeile und weiss danach weniger als vorher.

```
Kujdes i zgjedhur për lëkurën tuaj.            15 px
2 produkte LifeSkin, të zgjedhura sipas ...    13,5 px
53 € gjithsej                                  36 px
Pagesë një herë · pa abonim · dërgesa falas    13,5 px, Markenfarbe
Rreth 1,89 € në ditë, nëse e ndani shumën ...  13 px
──────────────────────────────────────────
Nëse analiza tregon se ju mjafton një produkt
i vetëm, rutina kushton 33 €. Paguani te dera.
```

**Was gilt** (`lifeskin-catalog.js`): `setPreis` 53 bei `setGroesse` 2,
einzeln 33, `versandKosten` 0, `zahlarten: ["nachnahme"]`, und nirgends
im Ablauf ein Abonnement. Der Satz von zwei Mitteln kostet also wirklich
53 EUR - und was passiert, wenn die Analyse nur eines ergibt, steht
daneben. Das ist eine Auskunft und keine Relativierung.

**1,89 EUR ist gerechnet und nicht geschrieben.** Es ist genau das, was
`tagespreis()` in `lifeskin-catalog.js` liefert - `setPreis` geteilt
durch `reichweiteTage`, auf zwei Stellen gerundet - und dieselbe Zahl,
die im Angebot am Ende der Analyse steht (`bericht-texte.js`,
`preisTag`: *"{tagespreis} € në ditë për 28 ditë"*). Sie darf nur
dastehen, weil `reichweiteTage` dokumentiert, dass 30 ml je Mittel die
28 Tage wirklich tragen. Traegt eine kuenftige Zusammenstellung sie
nicht mehr, faellt diese Zeile weg - nicht die Zahl wird angepasst.

**Sie ist kein Rabatt und keine Abbuchung.** Kein Rot, kein
durchgestrichener Anker, kein Sticker, kein "vetëm sot". Der Satz sagt,
was die Zahl ist - *"nëse e ndani shumën në 28 ditë"* - und behauptet
damit weder eine taegliche Zahlung noch eine belegte Reichweite noch ein
Ergebnis nach 28 Tagen. Sie stand einmal in 16,5 Punkten Markenfarbe und
war damit auffaelliger als die Summe darueber; jetzt steht sie
nachgeordnet in 13.

**Davor steht der Weg** (`.rrjedha`): Analiza juaj → 2 produkte të
zgjedhura → Rutina juaj. Drei Wegmarken in 12,5 Punkten und keine
Infografik. Ein Preis ist nur nachvollziehbar, wenn davor steht, wofuer
er ist.

**Danach steht der Weg zum Beweis** (`.cmimi__beweis`): ein Link auf
`#rezultatet`. Hier gehoerte eine echte Kundin hin - Bild, Vorname, ein
Satz von ihr. Es liegt keine vor, also steht hier der Weg zu den vier
echten Faellen statt einer erfundenen Person.

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
  `maximum-scale`.
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

## Was noch fehlt

* **Impressum, Datenschutz, AGB.** Es gibt sie in diesem Projekt nicht,
  und `LIFESKIN_ANBIETER` in `lifeskin-config.js` steht leer (Name,
  Anschrift, E-Mail). Der Fuss verlinkt deshalb nur, was es wirklich
  gibt. Ein Link auf eine Seite, die es nicht gibt, faellt genau dem
  auf, der nachsieht, weil er misstrauisch ist. Sobald die Angaben
  stehen, gehoeren sie in `.fuss__lidhjet`.
* **Ein Hero-Bild, ein Packshot, ein Instagram-Screenshot.** Siehe oben.
