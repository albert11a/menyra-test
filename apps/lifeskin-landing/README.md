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

## Der Weg teilt sich auf Bildschirm 2

```
  1  Landingpage   (#ls-einstieg)
        |  "Zbuloni rutinën tuaj" - neun Knoepfe, ein Ziel
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

## Was auf dieser Seite behauptet wird - und woher es kommt

Nichts steht hier, was nicht belegt ist. Drei Arten von Angaben:

**Aus dem Code, mit Quelle.** Wer die Quelle aendert, muss diese Seite
mitaendern - an jeder Stelle steht ein Kommentar dazu:

| Angabe | Quelle |
|---|---|
| `28 ditë` unter jedem Fall | `lifeskin-catalog.js`, `reichweiteTage` |
| `2 produkte` | `lifeskin-catalog.js`, `setGroesse` |
| `53 €` | `lifeskin-catalog.js`, `setPreis` |
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

## Was noch fehlt

* **Impressum, Datenschutz, AGB.** Es gibt sie in diesem Projekt nicht,
  und `LIFESKIN_ANBIETER` in `lifeskin-config.js` steht leer (Name,
  Anschrift, E-Mail). Der Fuss verlinkt deshalb nur, was es wirklich
  gibt. Ein Link auf eine Seite, die es nicht gibt, faellt genau dem
  auf, der nachsieht, weil er misstrauisch ist. Sobald die Angaben
  stehen, gehoeren sie in `.fuss__lidhjet`.
* **Ein Hero-Bild, ein Packshot, ein Instagram-Screenshot.** Siehe oben.
