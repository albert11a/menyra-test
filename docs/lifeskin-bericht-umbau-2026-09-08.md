Status: CURRENT
Stand: 2026-09-08

# Befundseite: Umbau von Analyse, Angebot und Vertrauenszeilen

Betrifft `mnyra.com/analiza/<kennung>` — `apps/lifeskin-bericht/`.

## Ausgangsstand und Rückweg

Der Stand vor dem Umbau ist der Commit

    1523277196c6da8375ee23b8630173464d1ebcdb  ("Therapiekarte: derselbe Abstand auf jedem Telefon")

Alles zurücknehmen (nur die Befundseite, ohne die übrige Arbeit anzufassen):

    git checkout 1523277 -- apps/lifeskin-bericht apps/lifeskin/lifeskin-content.js

Einzelne Teile lassen sich genauso zurückholen, weil jede Änderung in genau
einer Datei sitzt:

| Was | Datei |
|---|---|
| Beschriftungen, Sätze, FAQ | `apps/lifeskin-bericht/bericht-texte.js` |
| Aufbau der Seite | `apps/lifeskin-bericht/index.html` |
| Ableitungen aus den Daten, Kaufleiste | `apps/lifeskin-bericht/bericht.js` |
| Größen, Abstände, Angebotsblock, Lesespalte | `apps/lifeskin-bericht/bericht.css` |
| Einstiegssatz zu den Fotos | `apps/lifeskin/lifeskin-content.js` |

## Die Vorschau

Die Seite lädt ihren Fall sonst aus Firestore. Zum Ansehen und Vergleichen
gibt es deshalb:

    node scripts/lifeskin-bericht-vorschau.mjs --server
    # -> http://127.0.0.1:5199/analiza/aabbccdd11223344

    node scripts/lifeskin-bericht-vorschau.mjs --out .vorschau
    node scripts/lifeskin-bericht-vorschau.mjs --stress --out .vorschau-lang
    node scripts/lifeskin-bericht-vorschau.mjs --lang de --server

Der Beispielfall kommt aus `docs/lifeskin-raport-schema.md` — also aus
derselben Quelle, aus der auch der E2E-Test liest. `--stress` setzt drei
Mittel, einen sehr langen Produktnamen, sehr lange Sätze und einen anderen
Preis ein. Es wird nichts geschrieben und nichts bestellt: Jeder
Schreibversuch an Firestore wird abgefangen.

In Umgebungen mit vorinstalliertem Browser:
`PLAYWRIGHT_CHROMIUM=/opt/pw-browsers/chromium node scripts/…`

## Was sich geändert hat

0. **Der Kopf des Befunds** (bis zur Linie über „Gjetjet"). Offen auf dem
   warmen Grund, ohne Karte, Schatten oder Rahmen:
   * Kopfzeile: Dokumenttitel links, Fallnummer rechts — gleich gesetzt,
     einzeilig, auf einer Grundlinie. Die Nummer kommt weiter aus
     `#lb-fnummer`.
   * Die Ärztin mit echtem Porträt (`apps/lifeskin/dr-gashi.jpg`, 58 px
     rund, weißer Rand, kleines Häkchen), daneben „Analiza e përgatitur për
     {Name} nga" / „Dr. Violeta Gashi" / „Dermatologe".
   * Drei gleich breite Kacheln statt Pillen: Zeichen links, Zahl über
     Wort. Die Zahlen kommen unverändert aus der Analyse, die Aufnahmen
     bleiben ein Knopf und öffnen weiter das Blatt mit den Ansichten.
   * Eine 1-px-Linie schließt den Kopf ab.
   Weggefallen ist dabei die Nebenzahl in den Pillen („10 parametra · 8 me
   gjetje", „11 zona · 5 me ndryshime"): Der Entwurf sieht Zahl + Wort vor.
   Sie war als Glaubwürdigkeitssignal gedacht — wenn sie zurück soll, ist
   die Kachel dafür breit genug.

1. **Hauptbereich und ein Aufklapper.** Sichtbar bleiben Kopf, „Gjetjet",
   Diagnose und die drei Hauptparameter. Die ausführliche Erklärung
   („Çfarë do të thotë për ju"), das Verfahren, die Zonen, die übrigen
   Parameter und „Pa kujdes" liegen vollständig in **einem** Aufklapper
   („Lexoni analizën e plotë"). Keine Verschachtelung, keine doppelte
   Darstellung, kein gekürzter Text. Der Haftungshinweis auf die ärztliche
   Untersuchung bleibt außerhalb und sichtbar.
2. **Übergang.** Der eigenständige Abschlussgedanke („Analiza mbaroi …")
   und die hervorgehobene Skeptikerbox („nicht noch eine Creme") sind
   entfallen. An ihre Stelle tritt eine Zeile:
   „Nga gjetjet e analizës te plani për lëkurën tuaj."
3. **Angebotsblock.** Überschrift „Paketa juaj për 28 ditë", enthaltene
   Leistungen, Gesamtpreis, Lieferung und Zahlung, Kaufknopf, Garantie
   kurz — in einem Kasten. Die Vier-Wochen-Zeitleiste steht **danach**.
4. **Die Leistungsliste ist abgeleitet.** Die Mittel stehen mit ihren
   Mengen aus den Produktdaten darin, also bei drei Mitteln drei Zeilen.
   Die bereits erhaltene kostenlose Analyse wird nicht mehr als
   Paketbestandteil aufgezählt.
5. **Kaufleiste.** Sie erscheint, sobald der Angebotsblock ins Bild kommt,
   und bleibt danach. Oberhalb ist sie nicht da. Keine Lesedauer, kein
   Zeitschalter. Beschriftung und Betrag sind dieselben wie im Block.
6. **Einblendung beim Scrollen bleibt** — aber sie kann nichts mehr
   verschlucken. Vier Riegel (`#einblenden` in `bericht.js`):
   * Versteckt wird erst im Code; ohne `data-zeig` gilt in der Stildatei
     keine Regel. Fällt das Skript aus, steht der ganze Bericht da.
   * **Gerechnet statt beobachtet.** Ein `IntersectionObserver` meldet nur
     Wechsel — ein Sprung über einen Abschnitt hinweg ließ ihn dauerhaft
     unsichtbar. Jetzt wird bei jedem Scrollen nachgerechnet, wie bei der
     Kaufleiste.
   * Was beim Öffnen schon im Bild steht, bekommt gar kein Merkmal — der
     erste Bildschirm blendet sich nicht ein.
   * Im Aufklapper wird nichts versteckt (zugeklappt käme es nie ins Bild),
     und bei `prefers-reduced-motion` wird gar nicht erst versteckt.
   Der Preis wird nicht zusätzlich zum Angebotsblock versteckt: Zwei
   geschachtelte Verstecke können einander überdauern, und dann stünde der
   Kasten da und die Zahl darin fehlte.
7. **Vertrauenszeilen.** Siehe unten.

## Was der Betreiber bestätigen muss

Drei Angaben stehen auf der Seite, für die im Projekt kein freigegebener
Beleg liegt. Sie wurden **nicht erfunden und nicht erweitert**, aber sie
sind auch nicht geprüft:

1. **Begleitung über 28 Tage.** Der Satz „Dr. Gashi sieht diese Seite jeden
   Tag" ist entfernt — für einen täglichen Kontrolltakt gibt es keine
   Leistungsangabe, und `docs/lifeskin/LIFESKIN_KONZEPT.md` führt die
   Nachfassarbeit ausdrücklich als offenen Punkt („wer bearbeitet die
   Liste, in welcher Sprache, wie oft?"). Was jetzt dasteht: Die Seite
   bleibt offen, und es gibt einen Weg zu Dr. Gashi. Ob überhaupt eine
   Begleitung zugesagt wird und in welcher Form, muss der Betreiber
   festlegen — bis dahin bleiben „Ndjekja dhe përshtatja" und „Krahasimi
   përfundimtar" in der Leistungsliste unbestätigt.
2. **Geld-zurück über 30 Tage.** Kommt aus `STANDARD_KONFIG.rueckgabeTage`
   und wird von dort in jeden Satz eingesetzt. Das Konzept führt sie als
   offenen Punkt 8 („steht der Kosmetikkunde hinter ‚Geld zurück'").
3. **Lieferzeit und Versandkosten.** Kommen aus `lieferzeitTage` und
   `versandKosten`. Stehen dort andere Werte, ändern sich die Zeilen mit;
   ist der Versand nicht frei oder gibt es keine Nachnahme, fällt die Zeile
   „Paguani në dorëzim · Dërgesa falas" von selbst weg.

## Was zu den Fotos jetzt dasteht

Belegt ist: Die Aufnahmen werden übertragen (`lifeskin-session.js`,
`sessions/{id}/photos`), und lesen darf sie nach `firestore.rules` nur das
Praxiskonto (`allow read: if isCeoActor()`). Auf der Befundseite erscheinen
sie nicht, und sie hängen nicht am Link.

Der Einstiegssatz „Fotoja juaj mbetet në telefonin tuaj" widersprach dem und
ist ersetzt. Weiter offen bleibt die Entscheidung aus dem Konzept
(„Fotospeicherung: A, B oder C") samt Löschfrist — die Seite behauptet dazu
nichts.
