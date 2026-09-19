Status: CURRENT
Stand: 2026-09-19

# Die Landingpage als Vorlage (/landingpagetemplate)

Zum Ausprobieren unter einer eigenen Adresse, waehrend `/lifeskin`
unveraendert weiterlaeuft. **Sie laedt nichts aus `apps/lifeskin/`** -
drei eigene Dateien und acht eigene Aufnahmen, sonst nichts. Genau
deshalb ist sie eine Vorlage: Was hier veraendert wird, kann nichts
kaputt machen, was heute Besucher traegt.

| Datei | Was darin steht |
|---|---|
| `index.html` | Der ganze Text und alle neun Abschnitte |
| `landing.css` | Alle Masse, Farben und Bewegungen |
| `landing.js` | Nur Bewegung - kein Inhalt |
| `fotot/rasti-N-dita1.jpg` / `-dita28.jpg` | Die vier Faelle, je zwei Aufnahmen |

Der einzige Ausnahmefall ist das Bild von Dr. Gashi
(`/apps/lifeskin/dr-gashi.jpg`): Es gehoert der Marke und nicht dieser
Seite, und eine zweite Kopie waere ein zweiter Ort, an dem es spaeter
auseinanderlaufen kann.

## Was die Seite verspricht

Drei Saetze tragen alles, und jeder Abschnitt belegt genau einen davon:

1. **Bessere Haut in 28 Tagen** - belegt durch die Faelle (Dita 1 →
   Dita 28) und die Zahlen darueber.
2. **Produkte, die auf die eigene Haut abgestimmt sind** - belegt durch
   den Weg (`Si funksionon`) und `Analiza dhe terapia`.

   **Und zwar flach.** Hier stand einmal eine Liste ueber Wirkstoffe,
   Konzentrationen und Morgen-Abend-Routinen. Das ist das Gespraech
   NACH der Analyse und nicht der Grund, sie zu machen: Wer noch nicht
   gescannt hat, kann mit "Wirkstoff" nichts anfangen und liest
   darueber hinweg. Auf dieser Seite muessen zwei Woerter klar sein -
   Analiza und Terapia. Alles Weitere sagt Dr. Gashi im Befund.
Ein Abschnitt, der keinen dieser zwei belegt, gehoert geloescht und
nicht verschoben.

**Es waren einmal drei.** Das dritte war die Geld-zurueck-Garantie, und
sie stand an drei Stellen: als Zahl im Band (`100% garanci`), als eigene
Karte (`Garanci 100% - ose rezultat, ose paratë mbrapsht`) und als Frage
unten. Alle drei sind weg. Wer sie zurueckholt, holt sie an **einer**
Stelle zurueck - ein Versprechen, das eine Seite dreimal wiederholt,
wiegt nicht dreimal so viel.

Und wenn sie zurueckkommt, dann wieder als "ose paratë mbrapsht" - Geld
zurueck, nicht "Erfolg garantiert". Ein garantierter Heilerfolg ist ein
Versprechen, das eine Aerztin nicht geben kann und das in der Werbung
fuer Gesundheitsleistungen angreifbar ist; ein Rueckgaberecht ist
dasselbe Versprechen aus Sicht des Kunden und eines, das gehalten werden
kann. Die Frist gehoert dann in `Pyetjet` und ist der eine Satz, den die
Rechtsabteilung gegenlesen sollte.

## Die neun Abschnitte

| # | Abschnitt | Wofuer er da ist |
|---|---|---|
| 01 | `.held` | Ein Bildschirm, ein Gedanke: 28 Tage. Mit Knopf. |
| 02 | `.band` | Zwei Zahlen, in einer halben Sekunde erfasst |
| 03 | `#rezultatet` | Der einzige Abschnitt, der zeigt statt behauptet |
| 04 | `.gjendjet` | Der Besucher findet sein eigenes Problem |
| 05 | `#si` | Drei Schritte als Weg - wie lange dauert das |
| 06 | `#analiza-terapia` | Zwei Woerter, zwei Karten: Analiza, Terapia |
| 07 | `#mjekja` | Wer das verantwortet |
| 08 | `#pyetjet` | Die Fragen, die sonst zum Abbruch fuehren |
| 09 | `#fund` | Der letzte Griff, plus der feste Knopf unten |

Die Reihenfolge ist nicht beliebig: Die Faelle stehen **vor** allen
Erklaerungen. Wer die Bilder gesehen hat, liest den Rest mit einer
anderen Frage im Kopf - nicht mehr "ob", sondern "wie".

## Der Stil: clean clinical

Ein heller Grund, weisse Karten, Haarlinien, EIN Akzent. Kein Verlauf
als Flaeche, kein Leuchten, kein Muster - und **nichts, was sich im
Hintergrund bewegt**.

Der erste Blick trug einmal zwei treibende Lichtflecken, einen sich
drehenden Ring und ein Raster; der Knopf trug Verlauf, farbigen
Schlagschatten und einen Glanz, der alle viereinhalb Sekunden
darueberlief. Beides ist weg, und zwar aus demselben Grund: Was sich
dauernd bewegt, blendet das Auge nach drei Sekunden aus - und blendet
die Seite mit aus. Ein Knopf muss aussehen, als koenne man ihn
druecken; alles darueber hinaus zieht Aufmerksamkeit auf den Knopf
statt auf das, was dahinter passiert.

`--basis` (das tiefe Tuerkis) traegt alles, was gedrueckt werden kann.
`--kauf` (das Kupfer) ist streng rationiert: der Punkt vor jeder
Augenbraue, das Schild "Dita 28", das Siegel der Garantie. Mehr nicht.
Weil die Farbe fast nirgends vorkommt, sagt sie jedes Mal etwas.

**Es bewegt sich nur noch, was der Besucher ausloest** - Hereinkommen
beim Scrollen, die Zahlen, die Linie im Weg, der Aufdecker, die Fragen.
Keine Animation laeuft in einer Schleife; das laesst sich nachmessen:
`document.getAnimations()` liefert auf dieser Seite keine einzige mit
`iterations: Infinity`.

## Wie die Seite gesetzt ist

Die Masse stehen an EINER Stelle (`:root` in `landing.css`): `--rand`,
`--breit`, `--luft`, `--luft-innen`, `--rund-l/m/s`, `--kurve`,
`--dauer`. Zwei Kanten, die um drei Punkte auseinanderliegen, sieht
niemand bewusst - und genau daran erkennt das Auge, ob eine Seite
sorgfaeltig gesetzt ist.

- **Nur Handy.** Der Inhalt hoert bei 560 Punkten auf zu wachsen und
  steht darueber mittig. Es gibt keinen Schreibtisch-Aufbau, weil es
  keine Schreibtisch-Besucher gibt.
- **`100svh`, nicht `100vh`.** Im Browser von Instagram faehrt die
  Leiste beim Scrollen wieder heraus; mit `100vh` stuende der Knopf
  danach hinter ihr.
- **`env(safe-area-inset-*)` an jeder festen Kante** - Kopfzeile,
  fester Knopf, Fusszeile. Ohne das liegt der Knopf auf iPhones unter
  dem Strich, der die App schliesst.
- **Keine Schrift aus dem Netz.** Die Systemschrift ist da, bevor der
  erste Punkt gezeichnet wird - im 3G-Netz sind das Sekunden.
- **Jedes Bild mit `width`/`height`.** Sonst springt die Seite beim
  Nachladen, und zwar genau unter dem Daumen.
- **Enge und niedrige Bildschirme** (`max-width: 360px`,
  `max-height: 700px` und `620px`) sind eigens gesetzt: Im Browser von
  Instagram bleiben von einem 667 Punkte hohen Telefon keine 560 uebrig.

## Die Bewegung

`landing.js` traegt **keinen Inhalt**. Jeder Satz, jedes Bild und jeder
Knopf steht im Aufbau; kommt die Datei nie an, steht die Seite trotzdem
ganz und ist bedienbar. Die eine Zeile, die im `<head>` stehen muss, ist
`classList.add("js")` - ohne sie waere der Inhalt einen Augenblick
sichtbar und wuerde danach verschwinden, um wieder hereinzukommen.

Was sich bewegt: der Fortschrittsbalken, das Hereinkommen je Stueck
(gestaffelt, gezaehlt statt geschrieben), die Zahlen, die Linie im
Weg, der Aufdecker ueber der zweiten Aufnahme jedes Falls, der feste
Knopf unten, die Punkte unter den Faellen und das weiche Schliessen der
Fragen.

**Die Fallkarten kommen als Bahn herein, nicht einzeln.** Jede Karte
trug einmal ihr eigenes `data-anim` und damit einen Versatz von 20
Punkten nach unten. Beim Wischen fuhr die neue Karte von unten herein,
waehrend die vorige schon oben stand - zwei Karten nebeneinander auf
verschiedener Hoehe, und das sah aus wie eine Seite, die beim Wischen
wackelt. Jetzt steht `data-anim` an `#rastet`, und die einzelne Karte
bekommt von einem eigenen Beobachter nur noch `data-gesehen="ja"`, an
dem das Stilblatt den Zuschnitt aufzieht. Ein Zuschnitt (`clip-path`)
verschiebt nichts - deshalb kann er beim Wischen nicht wackeln.

**`prefers-reduced-motion` schaltet alles davon ab** und nichts geht
verloren: Keine Bewegung auf dieser Seite traegt eine Aussage, die nicht
auch im Text steht.

## Was sich haeufig aendern wird

- **Einen Fall dazunehmen:** den `<article class="rasti">`-Block
  kopieren, zwei Adressen und das Stichwort austauschen. Die Punkte
  darunter zaehlen sich selbst.
  Beide Aufnahmen eines Falls muessen aus derselben Quelle stammen,
  gleich ausgeleuchtet und gleich zugeschnitten sein (hier: 720 × 810) -
  sonst vergleicht der Blick Abstand und Kopfhaltung statt Haut.
- **Eine Hautgeschichte dazunehmen:** ein `<li>` in `.gjendjet`. Das
  Raster bricht von selbst um; unter 360 Punkten steht eine Kachel je
  Zeile.
- **Eine Frage dazunehmen:** ein `<details class="pyetje" data-anim>`.
- **Eine Farbe oder ein Mass aendern:** nur in `:root`.

## Adressen

`/landingpagetemplate` (in `vercel.json` und in
`scripts/local-dev-server.mjs` eingetragen). Die Seite traegt
`noindex,nofollow`: Zwei Seiten mit demselben Versprechen teilen sich
sonst ihre Auffindbarkeit, und ein geteilter Link zeigte auf die Probe
statt auf die Seite.

Der Knopf fuehrt auf `/lifeskin` - den laufenden Trichter. Diese Vorlage
ersetzt ihn nicht; sie steht daneben.
