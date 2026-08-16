# Mnyra GO - die Bilder der Geschichte im Bento

Vier Fotos, in dieser Reihenfolge. Die Reihenfolge ist nicht Geschmack: Sie
ist die der Sache selbst - erst der Hunger, dann die Frage wohin, dann die
Offerte, dann der Abend. Ein Bild an der falschen Stelle erzaehlt sie falsch
herum.

| Datei | Was zu sehen ist | Frage steht | Motiv sitzt |
| --- | --- | --- | --- |
| `story-1-uritur.webp` | Sie sitzt am Tisch, hungrig | rechts | links |
| `story-2-kerkim.webp` | Sie sucht am Telefon | links | rechts |
| `story-3-oferta.webp` | Sie freut sich ueber die Offerte | rechts | links |
| `story-4-tavolina.webp` | Zwei Freundinnen am Tisch im Lokal | (ohne Frage) | mittig |

Beide Angaben stehen in `GO_STORY_SLIDES` als `side` (wo die Frage steht) und
`focus` (wo das Motiv sitzt). Sie sind bei jedem Foto mit einer Frage
gegensaetzlich - stuenden sie auf derselben Seite, schnitte der Zuschnitt
genau die Flaeche weg, auf der die Frage liegt.

## Der Text steht NICHT im Bild

Er lag frueher darin. Jetzt sind die Fotos leer und die Frage liegt als
echter Text darauf (`GO_STORY_SLIDES` in
`core/go/go-page-render-utils.js`). Drei Gruende, die alle drei zaehlen:

- Sie laesst sich lesen, vergroessern, uebersetzen und vorlesen.
- Sie laesst sich aendern, ohne dass jemand vier Bilder neu setzt.
- Sie bleibt scharf, auf jedem Bildschirm und in jeder Groesse.

Deshalb bitte **keine Schrift in neue Fotos setzen**. Wer ein Foto tauscht,
achtet auf zweierlei: dass eine Seite frei bleibt (nach `side`) und wo das
Motiv sitzt (nach `focus`). Die Frage steht auf halber Hoehe und nimmt
hoechstens 46 % der Breite; die andere Haelfte gehoert dem Foto.

## Format

- **Die Datei ist 16:9, gezeigt wird 4:3.** Das Bildfenster im Bento ist
  4:3 hoch; der Browser beschneidet die Seiten und behaelt die, die in `focus`
  steht. Die Datei bleibt bewusst breiter: So laesst sich das Verhaeltnis
  spaeter aendern, ohne alle Fotos neu zu exportieren.
  Warum ueberhaupt 4:3: Ein 16:9-Streifen fuellt auf einem Telefon nur ein
  knappes Viertel der Hoehe - es passen immer zwei Kapitel ins Fenster, und
  der Blick findet nichts. Apple loest das nicht mit Abstand (ihre Abstaende
  sind 56 bis 160px, wie unsere), sondern mit hochkanten Bildern: 260 breit,
  480 hoch, 57 % der Schirmhoehe. 4:3 ist bei diesem Material die Grenze - bei
  1:1 laeuft die Frage in Schulter und Telefon, bei 4:5 liegt sie auf der
  Person. Wer echte 4:5 will, braucht hochkant gesetzte Zuschnitte.
- **1600 x 900 px.** Das ist die Breite des Bentos auf einem grossen Telefon
  mal zwei. Mehr laedt nur laenger.
- **WebP, Qualitaet ~82.** Vier grosse Bilder auf einer Seite; als PNG waeren
  sie zusammen ueber 7 MB, so sind es 258 kB. Umrechnen z. B. mit
  `cwebp -q 82 -resize 1600 900 story-1-uritur.png -o story-1-uritur.webp`.

Die Vorlagen kamen als PNG in 1672 x 941 (Verhaeltnis 1,7768). Auf 1600 x 900
(1,7778) liegt der Unterschied unter einem Promille - es wurde nichts
beschnitten.

## Ein Bild austauschen

`vercel.json` gibt allem unter `/apps/menyra-social/assets/` ein Jahr
`immutable` mit. Wer eine Datei unter demselben Namen ersetzt, sieht die
Aenderung selbst nach einem Neuladen nicht - der Browser fragt gar nicht erst
nach. Ein ausgetauschtes Bild bekommt deshalb einen neuen Namen, und der Name
wird in `GO_STORY_SLIDES` mitgezogen. (Genau deshalb heissen diese vier
anders als die erste Runde mit der eingebrannten Schrift.)

## Fehlt eine Datei

Dann nimmt der Browser das Bild heraus und es bleibt die graue Flaeche in
ihrem Seitenverhaeltnis stehen - kein zerbrochenes Symbol, kein Sprung im
Aufbau. Die Frage darauf bleibt lesbar, sie ist ja Text.
