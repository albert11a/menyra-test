Status: CURRENT
Stand: 2026-09-18 (zweite Fassung)

# Der Trichter, kurze Fassung (/lifeskintrichter)

Zum Ausprobieren unter einer eigenen Adresse, waehrend `/lifeskin`
unveraendert weiterlaeuft. Beide Adressen laden **dieselben Module** aus
`apps/lifeskin/` - hier liegen nur die zwei Dateien, die anders sind:

| Datei | Was darin steht |
|---|---|
| `index.html` | Der lange Einstieg, kein Vorbereitungsbildschirm, der Pfeil im Kamerabild |
| `trichter-styles.css` | Nur das, was es in der alten Fassung nicht gibt |

## Die vier Unterschiede

1. **Bildschirm 1 ist eine Landingpage - lang, scrollbar, und der Knopf
   steht trotzdem immer da.** Gescrollt wird allein der Inhaltskasten (`.ls-inhalt`), nie die
   Seite; Kopfzeile und Knopf liegen ausserhalb davon und bekommen je einen
   Verlauf, damit der Text nicht hart an ihnen abbricht. Der Einstieg
   beantwortet die Fragen, an denen er verloren hat: wer das ist, wie es
   laeuft, **wer die Fotos sieht** (gleich nach "Si funksionon", wo die
   Frage entsteht), was dabei herauskommt, die Faelle, und die drei
   haeufigsten Fragen.
2. **Bildschirm 2 zaehlt keine Regeln mehr auf - er nimmt der Systemfrage
   die Ueberraschung.** Drei Karten zum Wischen, anderthalb nebeneinander:
   (1) die Kamera wird gleich gefragt, bitte "Lejo" tippen, (2) den Ring
   fuellen, (3) gruen heisst fertig. **Die Karten sind Zugabe, keine
   Bedingung:** Der Knopf darunter geht vom ersten Augenblick an, niemand
   muss wischen.

   Warum ueberhaupt ein Bildschirm dort, wo jeder Bildschirm Besucher
   kostet: weil genau eine Stelle dahinter unwiderruflich ist. Auf
   "moechte auf deine Kamera zugreifen" gibt es zwei Antworten, und die
   falsche beendet den Besuch endgueltig - auf iOS kommt die Frage kein
   zweites Mal, sie muesste in den Geraeteeinstellungen zurueckgenommen
   werden. Ein Hinweis IM Kamerabild kaeme dafuer zu spaet.
3. **Gefuehrt wird ausserdem IM Bild** - ein Pfeil am Kreisrand zeigt,
   wohin der Kopf soll, und bewegt sich dorthin (`#pfeilZeigen()`). Seine
   Richtung ist `stand.zielSektor`, also derselbe Strich, der am Ring
   pulst; er erfindet nichts. Der erste Vorschlag liegt **rechts** statt
   oben (`SEKTOR_RECHTS`): Nach oben schauen geht gegen den Hals, und
   dabei verliert man sein eigenes Bild aus den Augen.
4. **Nach dem Scan kommt nur noch die Nummer.** Keine vier Fragen, kein
   Name. Alles andere fragt Dr. Gashi im Gespraech; was der Trichter an
   dieser Stelle NICHT bekommt, ist der Kontakt - und ohne den war der Scan
   umsonst. Von 32 fertigen Analysen haben 13 ihren Befund gesehen: genau
   die 13, die erreichbar waren.

## Wie die Seite gesetzt ist

Die Masse stehen an EINER Stelle (`.ls-lang`): `--luft` zwischen den
Abschnitten, `--luft-innen` darin, `--rund`, `--kante`, `--hebung`. Zwei
Kanten, die um drei Punkte auseinanderliegen, sieht niemand bewusst - und
genau daran erkennt das Auge, ob eine Seite sorgfaeltig gesetzt ist.

- **Der erste Blick** (`.ls-held`) ist eine eigene Flaeche mit weichem
  Verlauf aus dem Markenton: Augenbraue, Ueberschrift, Satz, Aerztin und
  die drei Auskuenfte gehoeren zu einem Gedanken und stehen deshalb auf
  einer Karte statt lose untereinander. Der gestrichelte Ring darin ist
  dieselbe Form, die der Scan zeichnet.
- **Falas · Pa regjistrim · 60 sekonda** ist ein Streifen mit
  Trennstrichen, keine drei Schilder: Schilder brachen auf jedem Telefon
  in "zwei und eins" um. Die Schrift waechst mit der Breite (`clamp`), der
  Streifen bleibt vom 320er aufwaerts eine Zeile.
- **Si funksionon** sind nummerierte Kreise mit einer Linie dazwischen -
  ein Weg mit Anfang und Ende. Die Nummer steht im Kreis, nicht noch
  einmal im Text.
- **Çfarë merrni** liegt auf einer eigenen weissen Karte: Ein Versprechen
  auf einer Karte wiegt mehr als eines am Rand.
- **Pyetjet** trennt Haarlinien statt Abstand allein.
- Auf schmalen ODER niedrigen Bildschirmen (`max-width: 360px`,
  `max-height: 700px`) ist alles enger gesetzt, damit der Streifen und der
  Hinweis nach unten ins Bild passen - auch im Fenster von Instagram.

**Der Inhalt kommt beim Scrollen herein** - dieselbe Bewegung wie auf der
Befundseite (30 Punkte von unten, 0,44s), aber je STUECK statt je
Abschnitt: Ueberschrift, einzelner Schritt, Karte, Fragenpaar. Ein
Abschnitt, der als Block hereinfaehrt, bewegt vier Dinge auf einmal, und
dann liest man keines davon. Gerechnet wird, nicht beobachtet
(`#einblenden()` in `lifeskin-app.js`): Ein IntersectionObserver meldet nur
Wechsel, und wer schnell wischt, springt ueber ein Stueck hinweg - es
bliebe fuer immer unsichtbar. Ohne JavaScript und bei abbestellter Bewegung
steht die ganze Seite einfach da.

**Keine fremde Schrift.** Eine Seite, die in einer Sekunde stehen muss,
kann sich keine Schriftdatei leisten: Auf 3G kostet sie eine halbe Sekunde,
und bis dahin steht der Text entweder gar nicht da oder springt beim
Nachladen um.

**Zwei Fallen, die beim Bauen zugeschnappt sind** (beide haengen jetzt im
Test):

- Ein Flexkind mit `overflow: hidden` hat keine Mindestgroesse mehr. Der
  erste Blick war damit statt 360 Punkten noch 44 hoch - der Inhalt lag
  darin uebereinander. `.ls-lang > * { flex: none; }`.
- `.ls-held > *` schlaegt `.ls-held__ring` (gleiche Staerke, spaeter im
  Blatt): Der Ring stellte sich als 190 Punkte breiter Block in den Text.
  Deshalb `:not(.ls-held__ring)`.

## Die Faelle: eine Karte dazunehmen

Das Karussell unter "Pacientët që kanë bërë analizën…" scrollt der Browser
selbst (scroll-snap, kein JavaScript). Eine weitere Patientin dazunehmen
heisst:

1. Die zwei Aufnahmen nach `apps/lifeskin/` legen, benannt wie die erste:
   `fall-2-vorher.jpg` und `fall-2-nachher.jpg` (die naechste `fall-3-…`).
2. In `index.html` den `<figure class="ls-fall">`-Block kopieren und die
   zwei Adressen austauschen.

Der Hinweis zum Wischen erscheint von selbst, sobald es mehr als eine Karte
gibt; bei einer einzigen nimmt sie die volle Breite, bei mehreren schaut die
naechste absichtlich herein.

**Beide Aufnahmen einer Karte muessen aus derselben Quelle stammen**, gleich
ausgeleuchtet und gleich zugeschnitten sein (gleiche Gesichtshoehe, gleiche
Augenhoehe). Sonst vergleicht der Blick Abstand und Licht statt Haut - und
ein Vergleich, bei dem sich zwei Dinge gleichzeitig aendern, beweist keines
von beiden.

Die Zeile "Ein einzelner Fall … kein Ergebnisversprechen" steht hier auf
Wunsch nicht mehr. Sie steht weiterhin auf der Befundseite
(`bericht-texte.js`, `fallHinweis`) unter demselben Vorher-Nachher.

## Was die Zahlen sagen

Die Schrittfolge bleibt dieselbe (`opened` → `named` → `camera` → `captured`
→ …), damit sich beide Fassungen in Heart nebeneinander lesen lassen:

- `named` faellt beim Tipp auf "Fillo skanimin" - also beim Oeffnen der
  Anleitung.
- `camera` faellt beim Tipp auf "Hap kamerën", wenn die Kamera wirklich
  angefordert wird.

**Damit ist die Anleitung messbar:** Der Abstand zwischen `named` und
`camera` ist genau ihr Preis oder ihr Gewinn. Faellt die Quote gegenueber
dem Stand ohne sie, gehoert sie wieder weg - eine Zeile in
`#startTippen()`.
- `numri` faellt, wenn die Nummernfrage erscheint.

**Was in der kurzen Fassung NICHT mehr faellt:** `pyetja1` bis `pyetja4` und
`emri`. Im Trichter von Heart stehen diese Stufen fuer Besucher dieser
Adresse also auf null - das ist kein Fehler, sondern der Weg. Wer beide
Fassungen vergleicht, vergleicht `captured` gegen `numri`.

## Der Schalter

`<html data-ls-variante="kurz">` in dieser `index.html`, gelesen von
`varianteLesen()` in `apps/lifeskin/lifeskin-app.js`. Ohne ihn - also auf
`/lifeskin` - laeuft alles wie bisher. Er steht am Aufbau und nicht am
Pfad: Damit laesst sich dieselbe Fassung unter jeder Adresse ausprobieren.

## Wenn sie nach /lifeskin soll

Eine Zeile in `vercel.json`:

```json
{ "source": "/lifeskin", "destination": "/apps/lifeskin-trichter/index.html" }
```

Dann ausserdem:

1. In `tests/lifeskin-service-worker.test.mjs` steht das Ziel der Route
   `/lifeskin` als Erwartung - es mit umstellen.
2. `<meta name="robots" content="noindex,nofollow" />` und das `canonical`
   aus dieser `index.html` entfernen und die Vorschaubilder (og:/twitter:)
   aus `apps/lifeskin/index.html` uebernehmen; sonst hat die Hauptadresse
   beim Teilen keine Vorschau mehr.
3. Zurueck geht es genauso: die Zeile wieder auf
   `/apps/lifeskin/index.html` stellen. Am alten Trichter wurde nichts
   geloescht.

## Was dabei nicht kaputtgehen darf

`tests/lifeskin-trichter-variante.test.mjs` haelt beides fest: was die
kurze Fassung ausmacht und dass die alte davon nichts abbekommt. Der Text
steht fest im Aufbau UND als Schluessel in `lifeskin-content.js`; dass
beide dasselbe sagen, prueft derselbe Test.

Von Hand nachgesehen (Chromium, unechte Kamera) auf 320x568, 390x844,
412x915 und 820x1180: Der Einstieg scrollt, die Seite selbst nicht, der
Knopf steht ueberall an derselben Stelle, nichts laeuft seitlich aus dem
Bild, und die Karte von Dr. Gashi steht vollstaendig unter der Kopfzeile.
Der Tipp fuehrt ohne Zwischenschritt an die Kamera; der Pfeil sitzt auf dem
Kreisrand und dreht sich mit der Richtung; nach dem Scan steht genau eine
Frage da - die Nummer, mit Zifferntastatur, ohne Zaehler. Die alte Fassung
laeuft unveraendert: Einstieg → Vorbereitung → Kamera → vier Fragen, Name,
Nummer.

## Ein Fehler, der dabei aufgefallen ist

`hidden` wirkte an keinem `.ls-knopf`: `display: flex` aus dem Stilblatt
schlaegt das `display: none`, das der Browser einem Element mit `hidden`
gibt. Sichtbar war das auf **beiden** Adressen als "Vazhdo" unter jeder
Frage - auch unter denen, wo eine Antwort genuegt und es von selbst
weitergeht. Die Zeile `.ls-knopf[hidden] { display: none; }` in
`lifeskin-styles.css` behebt das; dieselbe Zeile gab es fuer `.ls-zurueck`
schon, aus demselben Grund.
