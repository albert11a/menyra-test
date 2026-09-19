# Die Landingpage unter /lifeskin

Das ist die Seite, die ein Besucher aus einer Anzeige sieht. Sie ist
**Bildschirm 1 des Trichters** und keine eigene Seite: Der ganze Text
liegt in `<section id="ls-einstieg">`, die vier Bildschirme danach
stehen unveraendert darunter, und der Tipp auf *Fillo SkinScreen falas*
fordert unmittelbar die Kamera an.

**Warum nicht zwei Seiten.** Eine Landingpage, die auf den Trichter
verlinkt, ist ein zweiter Ladevorgang zwischen Anzeige und Nutzen - im
Browser von Instagram auf Mobilfunk sind das Sekunden, in denen nichts
passiert. Jeder Bildschirm und jeder Ladevorgang dazwischen kostet
Besucher, und zwar mehr, als jede Gestaltung zurueckholt.

## Der Weg teilt sich auf Bildschirm 2

```
  1  Landingpage   (#ls-einstieg)
        |  "Fillo SkinScreen falas"
  2  Zgjedhja      (#ls-wahl)  -- zwei Karten --+
        |  Skanim me kamere                     |  Pa skanim
  3  Si funksionon (#ls-vorbereitung)           |
        |                                       |
  4  Kamera        (#ls-kamera)                 |
        |                                       |
  5  Emri + mosha  (#ls-name)  <----------------+
        |                        (ohne Scan unmittelbar hierher)
  6  Aufbereitung  (#ls-analyse)  nur mit Scan - ohne Aufnahmen
        |                         gibt es nichts aufzubereiten
     Warteseite /analiza/<kennung>
```

**Warum es den Wahlbildschirm gibt.** Gemessen im Anzeigenkonto: 222 auf
der Landingpage, 38 beim Scan - **184 gingen bei "Skanimi" weg**, mehr
als vier von fuenf. Ein Teil davon will die Kamera nicht freigeben, und
fuer den gab es genau einen Ausgang: die Seite schliessen. Jetzt gibt es
einen zweiten, und er endet bei derselben Aerztin.

**Zwei Karten, aber nicht zwei gleiche.** Die erste traegt ein Schild
(`Rekomandojmë`), einen Rahmen in der Markenfarbe und das Zeichen des
Scans - dasselbe, das die Anleitung danach zeigt. Die zweite ist ruhig.
Zwei gleich aussehende Karten waeren eine Frage ohne Rat, und eine Frage
ohne Rat kostet genau die Leute, die unsicher sind.

**Der Weg ohne Scan laesst zwei Bildschirme aus und nicht drei.** Name
und Altersgruppe bleiben: Ohne sie heisst der Fall bei Dr. Gashi
"Fall 47". Die Aufbereitung faellt weg - sie zaehlt sieben Sekunden lang
Aufnahmen durch, die es auf diesem Weg nicht gibt, und jede davon ist
eine Gelegenheit wegzugehen.

**Was der Fall danach traegt.** `paSkanim: true` in der Sitzung und
`photos: 0` im Berichtsdokument. Daran haengt dreierlei: die Marke
"pa skanim" in der Analysenliste von Heart, die Verzweigung unter dem
Trichter (`baueWege`) und die Warteseite, auf der dann weder "3 foto"
noch "Skanimi u krye" steht.

**Die zwei Fassungen davor bekommen ihn nicht.** `apps/lifeskin-trichter/`
und `apps/lifeskin/` haben keinen `#ls-wahl`, und die Anwendung
entscheidet das am Aufbau (`if ($("#ls-wahl"))` in `#startTippen`) und
nicht an einem Pfad. Dort fuehrt der Tipp weiter unmittelbar an die
Kamera.

| Datei | Was drin steht |
|---|---|
| `index.html` | Der ganze Text, die neun Abschnitte und die Bildschirme 2 bis 6 |
| `landing.css` | Bildschirm 1 (alles an `#ls-einstieg`, nichts an `:root`) und die zwei Karten der Wahl |
| `landing.js` | Nur Bewegung. Kein Inhalt, kein Modul, keine Abhaengigkeit |
| `fotot/` | Acht Aufnahmen, vier Faelle: Dita 1 und Dita 28 |

Die Anwendung selbst liegt weiter unter `/apps/lifeskin/` und wird von
hier geladen, nicht kopiert.

## Woher sie kommt und wohin geaendert wird

`apps/lifeskin-landing-template/` (Adresse `/landingpagetemplate`) ist
die **Vorlage zum Ausprobieren** und bleibt es. Was sich dort bewaehrt,
wird hierher uebernommen.

Diese Seite laedt **nichts** aus dem Vorlagenordner - auch keine Bilder.
Das ist der ganze Sinn der Trennung: Ein Handgriff an der Vorlage darf
niemals etwas an der Seite aendern, die heute Besucher traegt. Der Preis
sind acht doppelte Bilddateien, und er ist billiger als ein Versehen.

## Was sie verspricht

1. **Bessere Haut in 28 Tagen** - belegt durch die Faelle (Dita 1 →
   Dita 28) und die Zahlen darueber.
2. **Produkte, die auf die eigene Haut abgestimmt sind** - belegt durch
   den Weg (`Si funksionon`) und `Analiza dhe terapia`.

Ein Abschnitt, der keinen dieser zwei belegt, gehoert geloescht und
nicht verschoben.

**Eine Geld-zurueck-Garantie steht hier nicht.** Auf der Vorlage stand
sie einmal an drei Stellen - als Zahl im Band, als eigene Karte und als
Frage unten - und ist dort ebenso weg. Wer sie zurueckholt, holt sie an
**einer** Stelle zurueck.

## Die drei Unterschiede zur Vorlage

Alles andere ist wortgleich. Diese drei Punkte sind der Preis dafuer,
dass die Seite in einem Bildschirm des Trichters liegt:

1. **Alle Masse und Farben haengen an `#ls-einstieg`, nicht an `:root`.**
   Diese Seite laedt `lifeskin-styles.css` mit, und das Blatt vergibt
   dieselben Namen (`--grund`, `--kauf`, `--text-3`, `--linie` ...) mit
   anderen Werten fuer die Bildschirme 2 bis 5. Stuenden sie hier noch
   einmal an `:root`, bekaemen Kamera, Name und Aufbereitung die Farben
   der Landingpage mit - und weil die Werte nah beieinander liegen,
   faellt das niemandem auf. An einer Kennung gewinnen sie **innerhalb**
   des Einstiegs und nirgends sonst.
2. **Kein eigener Fortschrittsbalken.** Der Trichter hat seinen eigenen
   (`.ls-fortschritt`); er sagt, im wievielten Schritt man ist. Zwei
   Balken uebereinander sagen weniger als einer.
3. **Gescrollt wird ein Kasten, nicht die Seite.** `lifeskin-styles.css`
   setzt `html` und `body` auf `overflow: hidden` - ein Bildschirm *ist*
   die Fensterhoehe. Der lange Text liegt deshalb in `.lp` und scrollt
   darin, genau wie `.ls-inhalt` es in den anderen Bildschirmen tut.
   `landing.js` misst deshalb `#lp` und nicht das Fenster; am Fenster
   haette es kein einziges Mal ausgeloest.

## Drei Knoepfe, eine Kennung

Es gibt drei Knoepfe mit demselben Wort: oben im ersten Blick, unten im
letzten Griff und den festen am Rand. Einer traegt `id="ls-start"` -
die Kennung, die `lifeskin-app.js` anspricht, und eine Kennung darf es
nur einmal geben. Die anderen beiden tragen `data-ls-start` und reichen
ihren Tipp an ihn weiter (`landing.js`, Abschnitt 8).

Derselbe Weg gilt fuer den Tipp, der **vor** dem JavaScript kommt: Das
kurze Skript im `<head>` merkt ihn sich ueber `data-ls-start`, damit
ein Knopf, dessen Module noch unterwegs sind, nicht wie eine kaputte
Seite aussieht.

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

## Was beim Aendern schiefgehen kann

* **Ein `data-text` an einem Text dieser Seite.** `#texteSetzen()` in
  `lifeskin-app.js` schreibt jeden solchen Knoten neu - beim Knopf
  wischte das den Pfeil neben seinem Wort weg. Die Texte stehen hier
  bewusst fest im Aufbau: Die Seite ist vollstaendig lesbar, sobald die
  erste Antwort des Servers da ist, und nicht erst nach elf Modulen.
* **Eine zweite Kennung `ls-start`.** Dann erwischt die Anwendung immer
  nur die erste.
* **Eine dritte Zahl im Band.** Das Raster steht auf `repeat(2, 1fr)`;
  ohne die `3` stuende sie auf halber Breite.
* **Eine Stufe "Skanimi" im Trichter von Heart.** Ein Trichter zaehlt
  kumulativ - sie wuerde jeden mitzaehlen, der ohne Scan weitergegangen
  ist, und damit genau das Gegenteil dessen sagen, wofuer der
  Wahlbildschirm gebaut wurde. Der Scan steht in seinem eigenen Kasten
  daneben (`baueWege`), wo jeder Weg fuer sich zaehlt.
* **Ein Bild mit anderem Zuschnitt.** Der Zuschnitt der Faelle steht im
  Stilblatt (`.gjysma img`, `scale(1.385)`) und nicht in den Dateien -
  so bekommen beide Aufnahmen einer Karte zwangslaeufig denselben. Wer
  ihn je Datei macht, hat acht Gelegenheiten, zwei Bilder verschieden
  zu beschneiden; der Blick vergliche danach Abstand und Kopfhaltung
  statt Haut.
