# Die Texte der Analyse-Seite — vollständig, in Seitenreihenfolge

Jede Zeile mit ihrem Schlüssel aus `apps/lifeskin-bericht/bericht-texte.js`.

- **BLEIBT** — unverändert, funktioniert
- **NEU** — ersetzen
- **+** — gibt es noch nicht, muss gebaut werden

Begründungen stehen im Audit, Teile 19–28.

---

## A · Warteschirm

| Schlüssel | Albanisch | |
|---|---|---|
| `laedt` | Po hapet analiza juaj… | BLEIBT |
| `titel` | Dr. Gashi po e shikon analizën tuaj, {name}. | BLEIBT |
| `titelOhneName` | Dr. Gashi po e shikon analizën tuaj. | BLEIBT |
| `warum` | Nuk është një makinë që ju përgjigjet. Çdo analizë e shikon vetë ajo. | BLEIBT |
| `dauerHeute` | Përgjigja sot | BLEIBT |
| `dauerMorgen` | Përgjigja nesër në mëngjes | BLEIBT |
| `akteMarke` | Numri i analizës | BLEIBT |
| `akteFotos` | {anzahl} foto | BLEIBT |
| `schrittScan` | Skanimi u krye | BLEIBT |
| `schrittFotos` | Fotot janë te Dr. Gashi | BLEIBT |
| `schrittAnalyse` | Tani: analiza nga Dr. Gashi | BLEIBT |
| `schrittFertig` | Rezultati juaj | BLEIBT |
| `benachrichtigen` | Dëshironi të njoftoheni kur të përfundojë? | BLEIBT |
| `waKnopf` | Njoftomë në WhatsApp | BLEIBT |
| `waUnter` | Mesazhi është shkruar tashmë. Ju vetëm e dërgoni. | BLEIBT |
| `waRueckFrage` | E dërguat mesazhin? | BLEIBT |
| `waRueckJa` | Po, e dërgova | BLEIBT |
| `waDanke` | Faleminderit. Do t'ju njoftojmë. | BLEIBT |
| `waWasPassiert` | Si funksionon? | BLEIBT |
| `waWasPassiertText` | WhatsApp hapet me mesazhin tuaj gati. Ju e dërgoni — dhe Dr. Gashi ju njofton sapo analiza të jetë gati. Pa pagesë. Ju mund të bllokoni bisedën në çdo moment. | BLEIBT |
| `kopieren` | Kopjo linkun | BLEIBT |
| `kopiert` | ✓ U kopjua | BLEIBT |
| `kopierenUnter` | Nuk keni WhatsApp? Ruani këtë link. Përgjigja e Dr. Gashit shfaqet pikërisht këtu. | BLEIBT |
| `blattZu` | E kuptova | BLEIBT |
| `wegTitel` | Kjo analizë nuk u gjet. | BLEIBT |
| `wegText` | Kontrolloni linkun. Nëse e keni marrë nga Dr. Gashi, shkruajini asaj. | BLEIBT |

---

## B · Befund — der Kopf

| Schlüssel | Albanisch | |
|---|---|---|
| `raportTitel` | Analiza dermatologjike | BLEIBT |
| **`anrede`** | **{name}, kjo është lëkura juaj sot.** | **+ größter Text des ersten Bildschirms** |
| **`anredeOhneName`** | **Kjo është lëkura juaj sot.** | **+** |
| **`vleresuarNga`** | **Vlerësuar nga Dr. Violeta Gashi, dermatologe · {datum}** | **+ ersetzt `raportFuer`** |
| `arztName` | Dr. Violeta Gashi | BLEIBT |
| `arztRolle` | Dermatologe | BLEIBT |
| `markeFoto` | foto | BLEIBT |
| `markeParametra` | parametra | BLEIBT |
| **`markeSaktesia`** | **saktësia e matjes** | **+ dritte Kachel statt Zonen** |

---

## C · Befund — die Analyse

| Schlüssel | Albanisch | |
|---|---|---|
| `gjetMarke` | **Çfarë sheh Dr. Gashi** | NEU — Text existiert als `befundMarke` |
| `messMarke` | **{geprueft} parametra · {mitBefund} me gjetje** | NEU — geprüft und auffällig nebeneinander |
| `frageEtikett` | Çfarë do të thotë kjo? | BLEIBT — wird nur nicht gezeichnet |
| `diagMarke` | Diagnoza | BLEIBT |
| `igaMarke` | Shkalla IGA | BLEIBT — wird nur nicht gezeichnet |
| `igaJetzt` | Ju sot: {stufe} | BLEIBT |
| `igaZiel` | Synimi pas 4 javësh: {stufe} | BLEIBT |
| `igaStufe0` | lëkurë e pastër | BLEIBT |
| `igaStufe1` | pothuajse e pastër | BLEIBT |
| `igaStufe2` | e lehtë | BLEIBT |
| `igaStufe3` | e moderuar | BLEIBT |
| `igaStufe4` | e rëndë | BLEIBT |
| `niveli0` | E qetë dhe e ekuilibruar — kërkon ruajtje | BLEIBT |
| `niveli1` | Kërkon kujdes parandalues | BLEIBT |
| `niveli2` | Kërkon kujdes aktiv | BLEIBT |
| `niveli3` | Kërkon kujdes të strukturuar | BLEIBT |
| `niveli4` | Kërkon vlerësim dhe ndjekje mjekësore | BLEIBT |
| `grenzenMarke` | Çfarë nuk mund të thotë një foto | BLEIBT |
| `grenzenText` | Nga një fotografi nuk vlerësohen dot thellësia e lezioneve, dhimbja, sekretimi i yndyrës, faktorët hormonalë apo vlerat laboratorike. Edhe drita dhe përpunimi i telefonit e ndryshojnë pamjen e skuqjes dhe të njollave. Prandaj kjo analizë është orientuese dhe nuk zëvendëson një ekzaminim te mjeku. | BLEIBT — nicht kürzen |
| `ohneNukZbehet` | Nuk zbehet vetë | BLEIBT |

---

## D · Der Aufklapper

| Schlüssel | Albanisch | |
|---|---|---|
| `detajetAuf` | Lexoni analizën e plotë | BLEIBT |
| **`detajetPunkte`** | **{n} parametra · {z} zona · shpjegimi · ecuria** | **NEU — Zählpunkte statt Fließtext** |
| **`metodaMarke`** | **Si u matën këto vlera** | **+** |
| **`metodaText`** | **Matja bëhet në pajisjen tuaj, me llogaritje mbi pikselët e fotos — jo me inteligjencë artificiale. E njëjta foto jep gjithmonë të njëjtat vlera. Në këtë rast, imazhi u lexua me {mm} mm për piksel; sa më e vogël kjo shifër, aq më imët është matja.** | **+ die Antwort auf „das ist doch nur KI"** |
| `ekzMarke` | Kërkesa & ekzaminimi i kryer | BLEIBT |
| `erklaerMarke` | Çfarë do të thotë për ju | BLEIBT |
| `zonatAuf` | Gjetjet sipas zonave | BLEIBT |
| `ohneVerlaufMarke` | Ecuria pa kujdes | BLEIBT |
| `ohneZbehet` | Zbehet vetë | BLEIBT |
| `ohnePas6` | Pas 6 muajsh | BLEIBT |
| `fotoTitel` | Pamjet e analizuara | BLEIBT |
| `fotoBallore` | Ballore | BLEIBT |
| `fotoDjathtas` | Djathtas | BLEIBT |
| `fotoMajtas` | Majtas | BLEIBT |
| `fotoUnter` | {anzahl} pamje u dërguan për vlerësim dhe janë te dosja juaj. Ato nuk shfaqen në këtë faqe dhe nuk udhëtojnë me linkun; i hap vetëm llogaria e praktikës. | BLEIBT |

---

## E · Übergang und Therapie

| Schlüssel | Albanisch | |
|---|---|---|
| ~~`kalimSatz`~~ | ~~Nga gjetjet e analizës te plani për lëkurën tuaj.~~ | **ENTFÄLLT** |
| **`prioritetetMarke`** | **Çfarë i duhet lëkurës suaj tani** | **+ der Puffer, produktfrei** |
| **`prioritetiA`** | **Të hapen poret që bllokohen në {zona}** | **+ aus `gjetja_kryesore`** |
| **`prioritetiB`** | **Të mbrohet shtresa mbrojtëse gjatë kësaj kohe** | **+ aus `gjetja_dyta`** |
| **`lidhesePrandaj`** | **PRANDAJ** | **+ auf der Linie vor der Diagnose** |
| **`lidhesePerKete`** | **PËR KËTË** | **+ auf der Linie vor der Therapie** |
| `therapieMarke` | Terapia juaj | BLEIBT |
| `pseEins` | Te ju, gjetja më e fortë është {a}. Kjo terapi është zgjedhur për të: | BLEIBT |
| `pseZwei` | Te ju, dy gjetjet më të forta janë {a} dhe {b}. Kjo terapi është zgjedhur për to: | BLEIBT |
| `pseOhne` | Kjo terapi është zgjedhur sipas vlerësimit të lëkurës suaj: | BLEIBT |
| **`gjetjaChip`** | **GJETJA {n} · {befund}** | **+ Kartenkopf, Kupfer, Kapitälchen** |
| **`gjetjaKerkon`** | **Kërkon {aufgabe}.** | **+ Auftragssatz unter dem Kartenkopf** |
| **`mbrojtjeChip`** | **MBROJTJE GJATË TRAJTIMIT** | **+ für ein Mittel ohne eigenen Befund** |
| **`mbrojtjeText`** | **Trajtimi kundër bllokimeve e ngarkon shtresën mbrojtëse. Kjo pjesë e mban atë në rregull.** | **+** |
| `synimiMarke` | Deri në ditën 28 | BLEIBT — gehört offen auf die Karte |
| `mehrMitStoffen` | {anzahl} përbërës · si përdoret | BLEIBT |
| `mehrOhneStoffe` | Si përdoret | BLEIBT |
| `perberesMarke` | Përbërësit aktivë | BLEIBT |
| `perdorimMarke` | Si përdoret | BLEIBT |
| `perdorimHapi` | hapi {hapi} | BLEIBT |
| `kohaMbremje` | mbrëmje | BLEIBT |
| `kohaMengjes` | mëngjes | BLEIBT |
| `kohaDyfish` | 2× në ditë | BLEIBT |

---

## F · Fall und Angebot

| Schlüssel | Albanisch | |
|---|---|---|
| `fallMarke` | Një rast i dokumentuar | BLEIBT |
| `fallTag` | Dita {tag} | BLEIBT |
| `fallHinweis` | Një rast i vetëm, i fotografuar në të njëjtën dritë dhe pa përpunim. Lëkura e secilit reagon ndryshe — ky nuk është premtim rezultati. | BLEIBT — **aber nur mit Bildern, die ihn halten** |
| `paketaMarke` | Paketa juaj për 28 ditë | BLEIBT |
| `perfshiMarke` | Çfarë përfshihet | BLEIBT |
| `perfshiPlan` | Plani personal i përdorimit për 28 ditë | BLEIBT |
| `perfshiNdjekje` | Ndjekja dhe përshtatja e planit gjatë 28 ditëve | BLEIBT |
| `perfshiKrahasim` | Krahasimi përfundimtar në ditën e 28-të | BLEIBT |
| `preisMarke` | Terapia 4-javore | BLEIBT |
| `preisEinzeln` | Veç e veç | BLEIBT |
| `preisGespart` | Kurseni {betrag} € | BLEIBT |
| `preisTag` | {tagespreis} € në ditë për 28 ditë | BLEIBT |
| `sicherNachnahme` | Paguani kur ta merrni në dorë | BLEIBT |
| `sicherGarantie` | {tage} ditë garanci — paratë mbrapsht | BLEIBT |
| `sicherLieferung` | Dërgesa {von}–{bis} ditë, falas | BLEIBT |
| `knopfStart` | **Fillo terapinë 4-javore — {preis} €** | NEU — Dauer benennen |
| **`knopfUnter`** | **Sot nuk jepni asnjë kartë. Paguani te dera.** | **NEU — ersetzt die Wiederholung** |

---

## G · Nach dem Angebot

| Schlüssel | Albanisch | |
|---|---|---|
| **`ruajMarke`** | **Ruani analizën tuaj** | **+ die Handlung für alle, die heute nicht kaufen** |
| **`ruajUnter`** | **Dërgoje te vetja në WhatsApp ose kopjo linkun. Analiza mbetet këtu.** | **+** |
| **`klientetMarke`** | **Nga Kosova** | **+ nur mit echten Kundinnen** |
| **`klientiRresht`** | **{emri}, {qyteti} — „{fjalia}"** | **+ Name, Stadt, ein Satz** |

---

## H · Plan, Garantie, Fragen, Fuß

| Schlüssel | Albanisch | |
|---|---|---|
| `planMarke` | Çfarë ndjekim gjatë 28 ditëve | BLEIBT |
| `planJava1` | Java 1 — Fillimi. Si e pranon lëkura terapinë; tharje e lehtë është e pritshme. | BLEIBT |
| `planJava2` | Java 2 — Ndjekim sa elemente të reja dalin. Ende pak për t'u parë — kjo është normale. | BLEIBT |
| `planJava3` | Java 3 — Kontrollohet njëtrajtshmëria e sipërfaqes dhe gjendja e njollave. | BLEIBT |
| `planJava4` | Java 4 — Foto e re. Dr. Gashi e krahason me ditën e parë dhe thotë çfarë vijon. | BLEIBT |
| `betreuungTitel` | Ndjekja gjatë 28 ditëve | BLEIBT |
| `betreuungText` | Kjo faqe mbetet e hapur nën të njëjtin link dhe raporti juaj qëndron këtu. Nëse gjatë terapisë diçka ndryshon ose keni një pyetje, i shkruani Dr. Gashit dhe ajo e përshtat planin — pa pagesë shtesë. | BLEIBT |
| `kontaktLink` | Shkruani Dr. Gashit në WhatsApp | BLEIBT |
| `raportVlen` | Ky raport vlen për gjendjen e lëkurës më {data}. | BLEIBT |
| `garanciMarke` | Rreziku është yni, jo juaji | BLEIBT |
| `garanciTitel` | {tage} ditë. Nëse nuk shihni ndryshim, paratë kthehen. | BLEIBT |
| `garanciText` | Pa formularë dhe pa pyetje: mjafton një mesazh te Dr. Gashi brenda {tage} ditëve nga marrja e pakos. Dhe paguani vetëm kur ta merrni në dorë — nuk jepni asnjë kartë sot. | BLEIBT |
| `pyetjeMarke` | Pyetje të shpeshta | BLEIBT |
| *sechs Fragen* | unverändert | BLEIBT |
| `notfallMarke` | Kur duhet mjek pa vonesë | BLEIBT — wird nur nicht gezeichnet |
| `haftung` | Vlerësimi është kozmetik dhe nuk zëvendëson një vizitë te mjeku. | BLEIBT |
| `anbieterMarke` | Ofruesi | BLEIBT — **Daten fehlen, Block erscheint nicht** |
| **`anbieterTelefon`** | **{telefon}** | **+ Feld existiert nicht** |

---

## I · Bestellschirm

| Schlüssel | Albanisch | |
|---|---|---|
| `bestellSchritt` | Hapi i fundit | BLEIBT |
| `bestellTitel` | Ku ta dërgojmë terapinë? | BLEIBT |
| `bestellName` | Emri dhe mbiemri | BLEIBT |
| `bestellTelefon` | Numri i telefonit | BLEIBT |
| `bestellAdresse` | Adresa | BLEIBT |
| `bestellOrt` | Qyteti | BLEIBT |
| `korbSumme` | Gjithsej | BLEIBT |
| `korbZahlung` | Paguhet te dera, kur ta merrni pakon. | BLEIBT |
| `bestellSenden` | Konfirmo porosinë — {preis} € | BLEIBT |
| `bestellUnter` | Paguani vetëm kur ta merrni në dorë. | BLEIBT |
| `bestellLaeuft` | Po dërgohet… | BLEIBT |
| `bestellFehler` | Nuk u dërgua. Provoni përsëri. | BLEIBT |
| `bestellPflicht` | Plotësoni të gjitha fushat. | BLEIBT |

---

## J · Nach der Bestellung

| Schlüssel | Albanisch | |
|---|---|---|
| `dankeTitel` | Porosia juaj është regjistruar. | BLEIBT |
| `dankeText` | Dr. Gashi e ka parë. Do t'ju njoftojmë sapo pakoja të niset. | BLEIBT |
| `versandMarke` | Porosia juaj | BLEIBT |
| `versandBestellt` | Porosia u pranua | BLEIBT |
| `versandVorbereitet` | Po përgatitet | BLEIBT |
| `versandUnterwegs` | Nisur | BLEIBT |
| `versandZugestellt` | Dorëzuar | BLEIBT |
| `versandErwartet` | Pritet {von}–{bis} | BLEIBT |
| `versandZahlung` | {preis} € te dera | BLEIBT |

---

---

## K · Die übrigen Texte

Der Vollständigkeit halber — die restlichen einundzwanzig Schlüssel.

### Noch in Gebrauch

| Schlüssel | Albanisch | |
|---|---|---|
| `ekzStandard` | Vlerësim morfologjik i lëkurës së fytyrës në {zonat} zona anatomike nga {fotot} pamje. U vlerësuan 10 parametra dermatologjikë, me numërim të lezioneve sipas lokalizimit dhe anës anatomike. | **NEU** — siehe unten |
| `messRest` | {anzahl} parametra të tjerë | BLEIBT |
| `detajetShpjegim` | shpjegimi i plotë | BLEIBT |
| `detajetEcuria` | ecuria pa kujdes | BLEIBT |
| `dorezimSatz` | Paguani në dorëzim · Dërgesa falas | BLEIBT — im Angebotsblock |
| `markeZona` | zona | BLEIBT — wandert in den Beweisabsatz |
| `pilleZona` | {anzahl} zona | BLEIBT |
| `markeDatum` | analiza | BLEIBT — Rückfall bei unter drei Zonen |
| `raportFuerOhne` | Analiza e përgatitur nga | BLEIBT — Rückfall ohne Namen |
| `pyetjet` | die sechs Fragen | BLEIBT — unverändert |

**`ekzStandard` muss geändert werden.** Der Satz behauptet
*„numërim të lezioneve"* — eine Zählung der Läsionen. Genau das tut die
Analyse nicht mehr, und das Schema verbietet es ausdrücklich. Ein
Untersuchungsabsatz, der eine Methode nennt, die nicht angewandt wurde,
ist die eine Stelle, an der die Seite sich selbst widerspricht:

> Vlerësim morfologjik i lëkurës së fytyrës në {zonat} zona anatomike nga
> {fotot} pamje. U vlerësuan 10 parametra dermatologjikë sipas llojit,
> shpërndarjes dhe shkallës, me krahasim mes zonave dhe mes anës së
> djathtë e të majtë.

*„sipas llojit, shpërndarjes dhe shkallës, me krahasim…"* — nach Art,
Verteilung und Ausprägung, mit Vergleich zwischen den Zonen und zwischen
rechts und links. Das ist, was wirklich geschieht, und es klingt
gründlicher als eine Zählung.

### Geschrieben und nie gezeichnet

| Schlüssel | Albanisch | |
|---|---|---|
| `befundMarke` | Çfarë sheh Dr. Gashi | **einsetzen** statt `gjetMarke` |
| `zonatAuf` / `zonatZu` | Gjetjet sipas zonave / Mbyll gjetjet | zeichnen |
| `gradLeicht` / `gradMittel` / `gradSchwer` | Shkallë e lehtë / e mesme / e rëndë | **löschen** — `niveli0-4` sagt dasselbe als Handlung statt als Adjektiv |
| `beweisFotos` / `beweisZonen` / `beweisDatum` | {anzahl} foto / 5 zona të fytyrës / Parë më {datum} | **löschen** — durch die drei Kacheln ersetzt |
| `fertigTitel` / `fertigOhneName` | {name}, analiza juaj është gati. | **löschen** — die neue `anrede` ersetzt sie |
| `kaufKnopf` | Merr terapinë — {preis} € | **löschen** — beide Knöpfe tragen `knopfStart` |
| `pseMarke` | Pse pikërisht kjo terapi | **löschen** — die Therapie hat eine Überschrift |
| `raportFuer` | Analiza e përgatitur për {name} nga | **löschen** — durch `anrede` + `vleresuarNga` ersetzt |
| `kalimSatz` | Nga gjetjet e analizës te plani… | **löschen** — durch den Prioritätenblock ersetzt |

Neun Schlüssel fallen weg, und das ist kein Aufräumen: Jeder von ihnen
ist eine zweite Formulierung für etwas, das schon woanders steht. Zwei
Fassungen derselben Aussage auf einer Seite lesen sich als Verkaufs-
schleife — dieselbe Regel, die dieser Seite schon den Abschlussgedanken
und die Skeptikerbox gekostet hat.

---

## Der Endstand

| | Anzahl |
|---|---|
| Texte im Code heute | 154 |
| Bleiben unverändert | 128 |
| Zu ersetzen | 5 |
| Zu löschen | 9 |
| Neu zu bauen | 22 |
| **Danach im Bestand** | **167** |

Fünf davon sind bereits geschrieben und müssen nur gezeichnet werden:
`befundMarke`, `frageEtikett`, `notfallMarke`, `zonatAuf`, der IGA-Block.
