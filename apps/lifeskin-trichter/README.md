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
3. **Gefuehrt wird ausserdem IM Bild, wie bei Face ID.** Kein Pfeil mehr:
   Der Ring selbst antwortet auf die Bewegung, waehrend sie passiert. Der
   Strich unter der aktuellen Kopfrichtung wird heller und laenger, je
   weiter gedreht ist - man dreht ein Stueck, sieht etwas aufleuchten,
   dreht weiter und hat in zwei Sekunden begriffen, was verlangt wird.
   Ein Pfeil sagt, wohin man soll, aber nicht, ob man es gerade richtig
   macht; genau diese Antwort fehlte. Der erste vorgeschlagene Strich
   liegt **rechts** statt oben (`SEKTOR_RECHTS`).
4. **Nach dem Scan kommen Name, Alter und die Nummer.** Keine vier
   Fragen. Alles andere fragt Dr. Gashi im Gespraech; was der Trichter an
   dieser Stelle NICHT bekommt, ist der Kontakt - und ohne den war der Scan
   umsonst. Von 32 fertigen Analysen haben 13 ihren Befund gesehen: genau
   die 13, die erreichbar waren.

   Der Kopf dieser Datei sagte einmal, die Nummer stehe auf der
   Warteseite neben WhatsApp. Sie stand dort als **Angebot**, und ein
   Angebot schlaegt man aus. Seit der Umstellung hat auch diese Fassung
   ihren eigenen Nummernbildschirm (`#ls-tel`) - auf jedem Weg,
   zwischen Name und Aufbereitung. Dass sie da ist, reist als
   Wahrheitswert `numri` im Bericht mit, damit die Warteseite nicht
   noch einmal danach fragt.

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

## Die Kamera: was gemessen und geaendert wurde

Der Kameraschirm gehoert BEIDEN Fassungen - diese Aenderungen wirken auch
auf `/lifeskin`.

**Der Strom kommt jetzt auf jedem Geraet.** Angefordert wurden
`width: 1440` UND `height: 1920`. Fast jede Telefonkamera liefert von sich
aus quer; wer Hochformat verlangt, zwingt den Browser zum Drehen und
Neuskalieren (Zeit beim Start, Arbeit bei jedem Bild), und ein Browser, der
damit nicht zurechtkommt, wirft `OverconstrainedError` - der Besucher sah
einen Kamerafehler, obwohl seine Kamera in Ordnung ist. Jetzt drei
Anlaeufe: fein (`width: 1440`), einfach (`facingMode`), nackt (`true`).
Eine ABLEHNUNG bricht sofort ab - eine zweite Systemfrage erscheint
ohnehin nicht.

**Das Bild steht schneller:** `loadedmetadata` statt nur alle 60 ms
nachzufragen. Im Pruefstand 152 ms vom Tipp bis zum sichtbaren Bild.

**Und es ist EIN Bildschirm statt drei.** Vorher sah man nacheinander:
einen nackten Kreis mit "Po hapet kamera…", dann ploetzlich Striche, dann
eine andere Anweisung. Jetzt:

| | wann | was |
|---|---|---|
| Ring | ab dem Tipp (81 ms) | Kreis mit Strichen - er IST die Anweisung |
| Bild + Satz | 165 ms | "Vendoseni fytyrën në rreth dhe qëndroni qetë." |
| Striche fuellen | sobald gedreht wird | derselbe Satz, dann "Kopf drehen" |

Dazu: Solange das Gesichtsnetz noch unterwegs ist, sagt der Weg ohne Netz
nicht mehr "nicht bewegen". Kam das Netz danach doch an, sprang die Zeile
auf "Kopf langsam im Kreis drehen" - zwei Anweisungen hintereinander, und
wer zwei bekommt, folgt keiner.

**Der Ring ist deutlich leichter geworden** - gemessen, nicht geraten
(`tests/lifeskin-ringlauf-probe.test.mjs`, sechzehn Arten Mensch und
Geraet, je zwanzig Laeufe):

| | vorher | jetzt |
|---|---|---|
| wer kaum dreht (9/7 Grad) | 0/20 | 20/20 |
| dasselbe, altes Telefon (8 fps) | 0/20 | 20/20 |
| eine schnelle Runde (3 s, 10/8) | 0/20 | 20/20 |
| langsamster Lauf ueberhaupt | 12,0 s | 8,8 s |

Geaendert: 9 statt 13 Grad seitlich, 6,5 statt 9 senkrecht, EIN Bild statt
zwei, 80 statt 160 ms halten, Lockerung nach 3 statt 6 Sekunden,
Einmessung notfalls nach 1,2 statt 4 Sekunden. **Die Gegenprobe haelt:**
geschwenktes Handy, Handy naeher/weiter, zwei Minuten Stillsitzen, Busfahrt
- keiner dieser Faelle schliesst einen einzigen Strich, genau wie vorher.
Achsprobe und Bildwanderung sind unveraendert.

**Weniger Arbeit je Bild:** Der Punktschleier ueber dem Gesicht (rund 240
Rechtecke je Bild auf einer bildschirmgrossen Leinwand) ist weg - der
Zeiger im Ring sagt dasselbe und kostet nichts.

**Weniger Leitung nach dem Scan:** sieben Bilder statt zehn (2/2/2/1). Jedes
liegt als Text in einem eigenen Firestore-Dokument, rund 350 KB; zehn waren
gut drei Megabyte, die das Telefon hochlaedt, waehrend der Besucher schon
wartet.

**Und das Gesichtsnetz wird auf 3g nicht mehr uebersprungen.** `effectiveType`
meldet die gemessene Geschwindigkeit - ein durchschnittliches Mobilfunknetz
in Kosovo meldet regelmaessig "3g", auch wo LTE anliegt. Fuer diese
Besucher gab es gar keinen Ring, nur "stillhalten" und drei gerade Bilder.
Uebersprungen wird jetzt nur noch bei echtem 2G und bei `saveData`.

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
Kreisrand und dreht sich mit der Richtung; nach dem Scan kommen Name und
Alter, danach die Nummer mit Zifferntastatur. Die alte Fassung laeuft
unveraendert: Einstieg → Vorbereitung → Kamera → vier Fragen, Name,
Nummer.

## Ein Fehler, der dabei aufgefallen ist

`hidden` wirkte an keinem `.ls-knopf`: `display: flex` aus dem Stilblatt
schlaegt das `display: none`, das der Browser einem Element mit `hidden`
gibt. Sichtbar war das auf **beiden** Adressen als "Vazhdo" unter jeder
Frage - auch unter denen, wo eine Antwort genuegt und es von selbst
weitergeht. Die Zeile `.ls-knopf[hidden] { display: none; }` in
`lifeskin-styles.css` behebt das; dieselbe Zeile gab es fuer `.ls-zurueck`
schon, aus demselben Grund.
