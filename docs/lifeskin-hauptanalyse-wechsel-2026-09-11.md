Status: CURRENT
Stand: 2026-09-11

# Die Hauptanalyse wechselt auf Astra

## Was getauscht wurde

Zwei Adressen haben ihre Anwendung getauscht.

| Adresse | Vorher | Jetzt |
|---|---|---|
| `mnyra.com/analiza/<kennung>` | `apps/lifeskin-bericht/` | `apps/lifeskin-astra/` |
| `mnyra.com/analysetemplateastra` | `apps/lifeskin-astra/` | `apps/lifeskin-bericht/` |
| `mnyra.com/lifeskinlifeskintesttest` | `apps/lifeskin-bericht/` | unverändert |

Die Astra-Gestaltung ist damit die Hauptanalyse und zeigt echte Befunde. Die frühere Gestaltung ist vollständig erhalten und unter `/analysetemplateastra` zu sehen — mit demselben erfundenen Fall wie bisher unter der Testadresse.

## Warum nicht nur die Routen getauscht wurden

Astra war eine Gestaltungsvorlage: ein fest eingebauter Musterfall, keine Firestore-Verbindung, ein Bestellformular, das Eingaben absichtlich verwarf. Ein reiner Routentausch hätte jedem echten Patienten den Musterfall „Arta" gezeigt und seine Bestellung verworfen.

Die Vorlage wurde deshalb an die Daten angeschlossen. Der Datenvertrag aus `docs/lifeskin-astra-audit.md` („Datenvertrag für den späteren Liveanschluss") ist damit erfüllt.

## Der Aufbau der neuen Hauptanalyse

| Was | Wo |
|---|---|
| Aufbau der Seite, Plätze für die Daten | `apps/lifeskin-astra/index.html` |
| Firestore lesen und schreiben | `apps/lifeskin-astra/astra-daten.js` |
| Zustände, Ableitungen aus den Daten, Kaufweg | `apps/lifeskin-astra/astra.js` |
| Beschriftungen, Sätze, FAQ (sq + de) | `apps/lifeskin-astra/astra-texte.js` |
| Größen, Abstände, Angebotsblock | `apps/lifeskin-astra/astra.css` |
| Der Entwurf mit seiner Begründung | `apps/lifeskin-astra/audit.html` |

Die Datenschicht liegt bewusst getrennt: Wer an der Gestaltung etwas verschiebt, muss `astra-daten.js` nicht lesen, und wer an den Daten etwas ändert, nicht die Seite.

### Die vier Zustände

| Zustand | Wann |
|---|---|
| `laedt` | solange der Befund unterwegs ist |
| `weg` | die Kennung gehört zu keinem Fall |
| `prit` | Dr. Gashi hat den Fall noch nicht angesehen — der Bildschirm, den fast jeder zuerst sieht |
| `fertig` | Befund, Plan, Mittel, Kauf |

Der Zustand wird alle zwölf Sekunden nachgefragt, aber nur, solange die Seite wirklich zu sehen ist.

## Die Regeln, die beim Umbau nicht verhandelt wurden

- **Die Anschrift geht in die Sitzung, nie in den Bericht.** Der Bericht ist öffentlich lesbar, damit der Patient seinen Link weitergeben kann. Eine Anschrift darin wäre in dem Moment offen, in dem er das tut. `tests/lifeskin-astra-live.test.mjs` und der e2e-Fall halten das fest.
- **Die Grenze der Methode steht wortgleich in beiden Fassungen.** Sie wirkt nur, weil sie freiwillig nennt, was die Methode nicht hergibt. Ein Zugeständnis, das an zwei Stellen anders formuliert ist, ist keins. Ein Test hält `astra-texte.js` und `bericht-texte.js` an dieser Stelle gleich.
- **Ohne freigegebene Mittel gibt es keinen Kaufweg.** Welche Mittel das sind, entscheidet Dr. Gashi in Heart — nicht die Modellantwort. Verlangt die Analyse eine Abklärung, steht dieser Satz weiter auf der Seite; er sperrt nur nichts mehr (siehe unten).
- **Ohne bestätigte ärztliche Prüfung wird keine behauptet.** Dann steht dort kein Arztname und kein Porträt, sondern „Vlerësim me ndihmën e AI".
- **Alle Parameter stehen in der Vollansicht**, auch die ohne Befund: Zehn angesehen und acht in Ordnung ist eine andere Aussage als eine Mangelliste.
- **Die Zuordnung der Mittel läuft über stabile Kennungen**, nie über die Listenposition.
- **Was im Befund steht, schlägt den Katalog.** Sonst schreibt eine spätere Änderung am Produkt einen Befund um, der längst beim Patienten liegt.
- **Keine Entwurfsnotizen mehr in der Patientenansicht.** Die deutsche Auditansicht ist aus der Live-Seite entfernt; `audit.html` bleibt als Dokument.

## Zeichen, Farbe und Bewegung

Drei Nachträge, alle drei aus der früheren Fassung übernommen.

**Die Zeichen sind echte Lucide-Icons, inline.** Sie stehen in `apps/lifeskin-astra/astra-ikona.js`, und ihre Pfade stammen unverändert aus `apps/menyra-social/vendor/lucide.min.js`; `tests/lifeskin-astra-ikonen.test.mjs` vergleicht jeden einzelnen damit. Das Paket selbst wird **nicht** geladen: 352 KB vor dem ersten Wort auf einer Seite, die ein Patient im Mobilfunk öffnet — und ein Zeichen, das an einem extern geladenen Script hängt, ist leer, wenn das Script nicht kommt (genau das ist im Ofertat-Tab passiert). Welches Zeichen wofür steht, entscheidet die Tabelle `ZEICHEN` in `astra.js`; ein Name gehört dorthin und nirgends sonst.

**Eine Farbe bis in die Leiste des Browsers.** Die Kaufleiste trug Weiß mit `backdrop-filter`, die Seite Papierweiß — unten stand deshalb eine sichtbare Naht zwischen Leiste, Seite und Browserleiste. Jetzt trägt die Kaufleiste `var(--paper)`, und `grundSetzen()` schreibt denselben Wert an `html` **und** an `theme-color`: die Marke für iOS 15–18 und Android, die Fläche von `html` für alles ab iOS 26, wo `theme-color` fallengelassen wurde. Nur `html` trägt eine Fläche — hat der Browser zwei Quellen, nimmt er die falsche.

**Der Briefkopf nennt die Analyse, nicht die Marke.** Wo `LIFESKIN / SKINREACT` stand, steht jetzt `ANALIZA JUAJ` und darunter die Fallnummer — die glaubwürdigste Einzelangabe der Seite, eine Kennung, die es nur einmal gibt. Der Absender bleibt im Fuß und im Arztkärtchen. Der Titel steht dort kleiner und enger gesperrt als die Marke im Fuß: „LIFESKIN" waren acht Buchstaben als Schriftzug, „ANALIZA JUAJ" sind zwölf als Beschriftung — in derselben Größe füllen sie den halben Briefkopf und stehen lauter da als die Anrede darunter. Die Nummer trägt ihn erst recht nicht: Als Kennung wäre sie damit auf einem 360er Telefon breiter als der Platz neben dem Knopf. Ohne Fallnummer im Befund bleibt die Zeile leer, statt etwas zu behaupten — und der Titel steht sofort, auch auf der Nicht-gefunden-Seite, die nie durch `#kopfZeichnen` läuft.

Dieselbe Zeile stand vorher noch einmal im Befundkopf, direkt darunter; die ist damit weg. Zusammen mit der kleineren Höhe (116 / 94 / 87 px → 64 / 58 / 54 px) beginnt die Anrede auf dem Telefon rund 80 px früher. Sonst bleibt der Kopf, wie er war: grün auf dem Papiergrund, feine Linie darunter. Ein dunkles Band in der Farbe der Instagram-Leiste war kurz da und wurde auf Wunsch wieder zurückgenommen.

**Die Bewegung.** Abschnitte blenden beim Herunterkommen ein (44 px, 0,5 s), jede Zeile darin gestaffelt (30 px, 0,44 s, 62 ms Versatz, gedeckelt bei sechs), die Kaufleiste fährt hinter dem Angebot ein und oben wieder aus.

Die Auslöseschwelle ist dabei das Entscheidende, und sie stand zuerst falsch: bei `innerHeight * 1.02`, also knapp **unterhalb** des Bildrands. Ein Abschnitt blendete damit ein, während er noch gar nicht zu sehen war; bis er hochgescrollt kam, war die Bewegung längst vorbei und er stand einfach da. Die Animation lief korrekt, und niemand hat sie je gesehen. Jetzt liegt sie bei `0.90` — der Abschnitt kommt, wenn sein oberer Rand wirklich im Bild ist, und die Bewegung läuft vor den Augen ab.

Bewegt wird **alles**: der Kopf der Analyse, jeder Abschnittskopf, jede Befundzeile, jedes Mittel, das Angebot Zeile für Zeile bis zum Preis, die Begleitung, die Aufklapper und der Fuß. Die Auswahl in `ZEILEN` muss dabei **flach** bleiben — kein Treffer darf einen anderen enthalten. Zwei geschachtelte Verstecke können einander überdauern, und dann steht der Angebotskasten da und der Preis darin fehlt; deshalb steht dort `.price-area` und nicht `.offer-card`. Ein e2e-Fall prüft, dass kein markierter Knoten einen anderen markierten enthält.

**Der Fuß wartet nicht als Ganzes** — und das ist keine Geschmacksfrage. Eine Verschiebung nach unten ändert das Layout nicht, aber sie **erzeugt Überlauf**, und Überlauf verlängert den Rollbereich. Der Fuß ist das letzte Element der Seite; wartend um 44 px nach unten geschoben, war die Seite 44 px länger. Beim Einblenden schrumpfte sie wieder, der Browser rückte die Rollposition zurecht — und wer gerade ganz unten stand, dem sprang die ganze Seite weg. Seine Zeilen bewegen sich weiter; sie liegen über den 125 px Polster, das ohnehin für die Kaufleiste da ist. Ein e2e-Fall schreibt die Seitenhöhe bei jedem Bild mit und verlangt, dass sie sich während des Scrollens um **null** Punkte ändert.

**Die Kaufleiste fährt schneller als ein Abschnitt** (0,26 s statt 0,5 s) und hat eine eigene Zeichenebene. Ein Abschnitt soll man kommen sehen, die Kaufleiste soll da sein: Mit 0,42 s kam sie beim schnellen Wischen spürbar hinterher. Gemessen wird beides getrennt — die Entscheidung („ist das Angebot vorbei?") fällt in 1 ms, die Fahrt dauert 154 ms.

Gemessen wird höchstens einmal je Bild (`requestAnimationFrame`), und was gekommen ist, fällt aus der Liste: `getBoundingClientRect` zwingt den Browser zum Neurechnen des Layouts, und siebzig Knoten bei jedem Scrollereignis sind auf den langsamen Telefonen genau der Ruckler.

Dazu dieselben drei Riegel wie in der früheren Fassung, die das überhaupt vertretbar machen:

1. **Alles beginnt sichtbar.** Ohne `data-zeig` gilt im Stil keine einzige Regel dazu; gesetzt wird das Merkmal erst, wenn der Weg zum Wiedereinblenden steht. Fällt das Skript aus, steht die ganze Analyse da.
2. **Gerechnet, nicht beobachtet.** Ein `IntersectionObserver` meldet nur Wechsel — springt die Seite beim Wischen über einen Abschnitt hinweg, bliebe er für immer versteckt.
3. **Was schon im Bild steht, wird nie versteckt**, und was im Aufklapper liegt, bleibt ganz draußen: zugeklappt käme es nie ins Bild.

Wer Bewegung abgeschaltet hat, bekommt keine — einmal im Ablauf (es wird gar nichts erst versteckt) und einmal im Stil, falls die Einstellung erst nach dem Zeichnen umgelegt wird.

## Der Prompt: v4

Der Prompt liegt wie bisher in `docs/lifeskin-prompt.json` und wird in Heart über „Prompt v4 für diesen Fall kopieren" ausgegeben.

**v4 ist die Prompt-Version, nicht die Schemaversion.** Das Antwortschema bleibt `schema_version: 3`; wer daran dreht, bricht `shared/lifeskin-raport-v3.js` und jeden Bericht, der schon beim Patienten liegt. Neu ist der Abschnitt `pamja_e_faqes`: eine Karte, wohin jedes Feld auf der Astra-Seite fällt. Die Gewichtung eines Satzes hängt an seinem Platz — was in der grünen Ergebnisfläche steht, liest jeder; was in einem Aufklapper steht, liest der, der nachsieht.

Drei Dinge, die beim Bau der Karte durch Nachsehen im Code herauskamen und vorher nirgends standen:

- **`gjetja_kryesore` muss kleingeschrieben beginnen.** Sie ist jetzt die Überschrift der Ergebnisfläche — dort macht die Seite den ersten Buchstaben selbst groß (`grossAnfang`) — und sie steht gleichzeitig als `{gjetja}` mitten in den Satzvorlagen der Mittel (`apps/lifeskin/lifeskin-catalog.js`). Ein großer Anfangsbuchstabe stünde dort falsch.
- **`nevojat[].teksti` sieht wie eine Notiz an Dr. Gashi aus und ist keine.** Heart übernimmt den Text in das Satzfeld des angehakten Mittels (`heart.js`), und von dort steht er auf der Produktkarte unter „Pse në këtë plan" — die persönlichste Stelle der Seite. Er gehört an den Patienten gerichtet.
- **`gjetja_dyta` erreicht den Patienten nicht mehr.** Der Platzhalter `{gjetja2}` existiert, aber keine Satzvorlage benutzt ihn, und die drei sichtbaren Beobachtungen kommen aus `parametrat`. Der Vertrag verlangt das Feld weiter — es darf nur keine Aussage mehr allein dort stehen.

Dazu: `parametrat[].thjeshte` bleibt leer, solange `emri` schon alltagssprachlich ist (die Seite zeigt `thjeshte || emri`, und zwei fast gleiche Namen untereinander lesen sich wie ein Fehler); `synimi_28` ist die sichtbare Zielfläche über den Mitteln; und **alle zehn** `parametrat[].vlera` stehen jetzt im Aufklapper — auch die unauffälligen liest der Patient dort.

`tests/lifeskin-astra-prompt.test.mjs` hält Karte und Seite in beide Richtungen zusammen: Jedes Feld, das der Ablauf liest, muss in der Karte stehen — und kein Feld, das die Karte als unsichtbar führt, darf doch gelesen werden.

### Warum die Produkte nicht ankamen

Der Weg Prompt → Heart → Freigabe → Seite war an **drei** Stellen unterbrochen. Alle drei sind behoben.

**1. Der Prompt kannte die Produktkennungen nicht.** `hyrja.produkte_te_verifikuara` war eine leere Liste, und es gab kein Gegenstück zu `diagnoza_id_e_lejuar`. Das Modell schrieb deshalb `produkt_id: ""` — auch das mitgelieferte Beispiel. Heart überspringt aber jeden Bedarf ohne Kennung (`if (!n.produkt_id) continue`), also wurde **nie ein Mittel angehakt**.

Jetzt steht der Katalog im Prompt: `produkt_id_e_lejuar` mit den fünf Kennungen und `hyrja.produkte_te_verifikuara` mit Rolle, Art und dokumentierter Aufgabe je Mittel. Das Beispiel ordnet zwei echte Mittel zu (`lf-pore` als `kryesor`, `lf-moistur` als `mbrojtes`).

**2. Heart verwarf angehakte Mittel still.** Griff die Angebotssperre, setzte `heart.js` die Produktliste auf Null — und sagte bei `schema_version: 3` kein Wort dazu.

**3. Und die Sperre selbst war eine Falle.** Sie verlangte dreierlei: bestätigte ärztliche Prüfung, einen erlaubten Beurteilungsstatus und mindestens einen `nevojat`-Eintrag. **Zwei davon kamen aus der Modellantwort — und keine der drei ließ sich im Befundbogen bearbeiten.** Wer zwei Mittel anhakte, verlor sie an eine Bedingung, an die er nicht herankam.

Die Sperre ist auf Entscheidung des Betreibers entfallen. Es gilt jetzt derselbe Grundsatz, der im Freigabeweg schon stand:

> Was freigegeben wird, ist was in den Feldern **steht** — nicht, was die Automatik erzeugt hätte. Sie füllt vor, sie entscheidet nicht.

`reportAllowsOffer()`, `offerBlockers()` und `OFFER_BLOCKERS` sind gestrichen. Heart gibt frei, was angehakt ist; Astra zeigt, was freigegeben ist (`mitAngebot` = `produkte.length > 0`); die aufbewahrte Vorlage ebenso.

**Was dabei nicht verschwindet:** Sagt die Analyse, dass sie nicht beurteilbar ist oder eine ärztliche Abklärung verlangt (`i_pavleresueshem`, `kontroll_mjekesor`), steht dieser Satz weiter unter dem Ergebnis — `brauchtAbklaerung()` in `shared/lifeskin-raport-v3.js`, Text `abklaerungNote`. Eine Aussage wegzunehmen und eine Sperre wegzunehmen sind zwei verschiedene Dinge; hier fällt nur die Sperre.

## Prüfen

    npm run test:unit                   # u.a. tests/lifeskin-astra-live.test.mjs
    npm run test:e2e                    # u.a. tests/e2e/lifeskin-analiza-astra.spec.ts

Lokal ansehen:

    npm run dev
    # Hauptanalyse (braucht einen echten Fall in Firestore):
    #   http://127.0.0.1:5173/analiza/<kennung>
    # Die aufbewahrte frühere Gestaltung, mit erfundenem Fall:
    #   http://127.0.0.1:5173/analysetemplateastra

## Zurückdrehen

Ein Tausch der beiden `destination`-Zeilen in `vercel.json` und der beiden Zeilen in `scripts/local-dev-server.mjs` stellt den vorherigen Zustand her. Beide Anwendungen liegen vollständig im Baum; es wurde keine gelöscht.

## Was weiterhin fehlt

Unverändert gegenüber `docs/lifeskin-astra-audit.md`: geprüfte Rezepturen und Produktpassung, einheitliche echte Packshots, vollständige Anbieterangaben (`LIFESKIN_ANBIETER` ist leer, deshalb erscheint der Block nicht), verbindliche Garantiebedingungen und eine serverseitige Bestellung. Der Preis kommt weiter aus dem Katalog im Client; er gehört vor dem Livebetrieb serverseitig bestätigt.
