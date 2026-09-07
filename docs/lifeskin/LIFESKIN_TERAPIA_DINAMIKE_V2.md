Status: CURRENT
Last updated: 2026-09-07

# Lifeskin — dynamische Therapiebegruendung, Produktstamm und Verkaufsreife

Dieses Dokument ist die vollstaendige Arbeitsanweisung fuer den naechsten
Ausbauschritt der Befundseite. Es ist so geschrieben, dass es unveraendert an
Claude uebergeben werden kann. Jeder Abschnitt nennt Datei, Zeile und den
gewuenschten Endzustand.

Zwei Begleitdateien gehoeren dazu:

- `docs/lifeskin/PROMPT_ANALIZA_V2.json` — der neue ChatGPT-Prompt
- `docs/lifeskin/PRODUKTET_V2.json` — die fuenf Produkte als fertige Stammdaten

---

## 0. Was tatsaechlich im Code steht

Alle Punkte der externen Pruefung wurden im Code nachgesehen. Sie stimmen.
Hier die Fundstellen, damit niemand sie noch einmal suchen muss.

| Befund der Pruefung | Fundstelle | Was dort steht |
|---|---|---|
| „Pse pikerisht kjo terapi" ist unsichtbar | `apps/lifeskin-bericht/bericht.js:836` | `if (!zeilen.length \|\| !namen.length) { teil.classList.add("ls-verstecken"); return; }` — ohne `veprimi` am Produkt faellt der ganze Abschnitt weg |
| „7 weitere Parameter", tatsaechlich 2 | `apps/lifeskin-bericht/bericht.js:636` | `offen = PARAMETER_BEURTEILT - min(werte.length, MESSWERTE_OBEN)` = `10 - 3 = 7`, unabhaengig davon, wie viele wirklich da sind |
| Pille behauptet immer 10 Parameter | `apps/lifeskin-bericht/bericht.js:40, 547` | `const PARAMETER_BEURTEILT = 10` als feste Zahl |
| Es kommen nur 5 Parameter an | `shared/lifeskin-analyse.js:856` | `.slice(0, 5)` in `messwerte()` |
| Heart nimmt auch nur 5 entgegen | `heart-lifeskin-render.js:553`, `heart.js:1213`, `heart.js:1253` | `RAPORT_MESSWERTE = 5`, zweimal `slice(0, 5)` |
| Produktbild 64 px | `apps/lifeskin-bericht/bericht.css:850, 864` | `grid-template-columns: 64px 1fr` und `width: 64px; height: 64px` |
| Keine Wirkstoffe, keine Anwendung sichtbar | `bericht.js:890 #produkteZeichnen` | zeichnet nur Bild, Name, Inhalt, Satz — `beschreibung` wird nie benutzt |
| „Dr. Gashi e sheh cdo dite" | `bericht-texte.js:268` | Tagesversprechen ohne neue Fotos |
| Medizin vs. Kosmetik | `bericht-texte.js:206` und `:478` | zwei unterschiedliche Selbstbeschreibungen auf derselben Seite |
| CTA erscheint bei halber Bildschirmhoehe | `bericht.js:1013` | `oben < window.innerHeight * 0.5` |

Zwei Dinge, die die Pruefung **nicht** sehen konnte und die wichtig sind:

1. Die Schreibrechte sind kein Hindernis. `firestore.rules:965-968` erlaubt
   dem CEO-Konto beliebige Felder in `products/{id}` und `reports/{id}` — es
   gibt dort keine `hasOnly`-Liste. Neue Felder kosten also keine
   Regelaenderung. Nur `sessions` ist feldgenau begrenzt.
2. Der bestehende JSON-Leser (`shared/lifeskin-analyse.js:859 raportLesen`)
   ist tolerant und findet Schluessel auch verschachtelt. Der neue Prompt
   bleibt deshalb rueckwaertskompatibel; es fehlen nur die drei neuen
   Zaehlwerte, die Diagnosekennung und `synimi_28`, die nachgeruestet werden.

---

## 1. Das Grundprinzip — wer darf was behaupten

Die Frage „wie entsteht *Pse pikerisht ky produkt* automatisch?" hat drei
moegliche Antworten. Die Wahl ist nicht Geschmack, sie entscheidet ueber
Haftung und Tempo.

**Nicht gewaehlt: ChatGPT schreibt die Produktbegruendung mit.** Dann
erfindet das Modell frueher oder spaeter eine Wirkung, die im Tiegel nicht
drin ist. Bei einem Mittel mit Benzoylperoxid ist das kein Schoenheitsfehler,
sondern eine Heilaussage ohne Grundlage. Ausserdem kostet es eine zweite
ChatGPT-Runde je Patient — bei 50 bis 100 Analysen am Tag ist das der
Flaschenhals.

**Gewaehlt: drei Rollen, sauber getrennt.**

```
ChatGPT   diagnostiziert   → nur Haut. Nie Produkt, nie Wirkstoff.
Katalog   behauptet        → nur Produkt. Einmal je Produkt geschrieben,
                             von Dr. Gashi verantwortet.
Der Code  verbindet        → sucht die Regel, die auf DIESEN Befund passt,
                             setzt die echten Werte ein, sofort, kostenlos,
                             immer gleich.
```

Das Ergebnis ist trotzdem vollstaendig dynamisch: Bei einem Patienten steht
dort „Puçrrat aktive te ju janë të theksuara", beim naechsten „Poret te ju
janë të moderuara" — weil die Regel die echten Werte seiner Analyse einsetzt.
Aber die *Behauptung ueber das Produkt* stammt immer aus dem Katalog und nie
aus einem Sprachmodell.

Das ist zugleich der schnellste Weg: Dr. Gashi fuegt das JSON ein, hakt zwei
Produkte an, und die Begruendung steht fertig im Feld — aenderbar, aber
nicht mehr tippbeduerftig.

---

## 2. Der neue Analyse-Prompt

Datei: `docs/lifeskin/PROMPT_ANALIZA_V2.json`. Er ersetzt den bisherigen.
Fuenf Aenderungen gegenueber der Fassung, die heute benutzt wird:

**2.1 Ehrliche Zaehlwerte.** `raporti` traegt jetzt vier Zahlen statt zwei:

```json
"raporti": {
  "fotot": 3,
  "parametrat_e_vleresuar": 10,
  "parametrat_me_gjetje": 5,
  "zonat_e_kontrolluara": 11,
  "zonat_me_ndryshime": 5
}
```

Damit kann die Seite sagen: **„11 zona të kontrolluara · 5 me ndryshime"**.
Das ist nicht die schwaechere Aussage, sondern die staerkere. Eine runde 10
ohne Gegenzahl liest sich wie Marketing; 11 geprueft und 5 auffaellig liest
sich wie ein Befund, weil jemand offensichtlich auch das Unauffaellige
angesehen hat. Genau das war der Vorwurf „kuenstlich erzeugte Zahlen" — er
verschwindet nicht dadurch, dass die Zahl kleiner wird, sondern dadurch,
dass sie *ueberpruefbar* wird.

**2.2 Zehn Parameter statt fuenf.** `parametrat` enthaelt jetzt immer alle
zehn, absteigend sortiert. Grund: Die Seite behauptet an drei Stellen, dass
zehn beurteilt wurden. Solange nur fuenf geliefert werden, ist entweder die
Behauptung falsch oder die Liste unvollstaendig. Mit zehn stimmt beides, die
Aufklappliste enthaelt danach sieben echte Zeilen statt zwei, und das
Aufklappen belohnt statt zu enttaeuschen.

**2.3 Maschinenlesbare Diagnose.** Neu ist `diagnoza.id` mit fester Liste
(`akne_komedonale`, `akne_inflamatore`, `akne_e_perzier`, `akne_nodulare`,
`hiperpigmentim_pas_inflamacionit`, `melazma`, `rozacea`,
`dermatit_seborreik`, `barriere_e_demtuar`, `lekure_e_thate`,
`lekure_e_yndyrshme`, `tekstura_e_pabarabarte`, `shenja_atrofike`,
`lekure_e_qete`, `tjeter`). Das ist der Schluessel, an dem die
Produktbegruendung haengt. `diagnoza.emri` bleibt frei formuliert.

**2.4 Der Hauptbefund als Satzbaustein.** `gjetjet.gjetja_kryesore` und
`gjetja_dyta` sind kurze Nominalphrasen („poret e bllokuara në ballë"), die
sich unveraendert in einen Satz einsetzen lassen. Heute nimmt die Seite dafuer
den kleingeschriebenen Parameternamen — daraus wird „Te ju, dy gjetjet më të
forta janë poret dhe folikulet dhe tekstura", was nach Datenbank klingt und
nicht nach Arzt.

**2.5 Das 28-Tage-Ziel.** `synimi_28` sagt in ein bis zwei Saetzen, was in
vier Wochen realistisch anders ist **und was ausdruecklich nicht**. Der
zweite Teil ist der wichtigere: Eine Prognose, die auch eine Grenze nennt,
wird geglaubt. Eine, die nur verspricht, nicht.

---

## 3. Das Produktmodell

Datei: `docs/lifeskin/PRODUKTET_V2.json`. Jedes Objekt ist ein Dokument in
`lifeskin/lifeskin/products/{id}`. Neu gegenueber heute:

| Feld | Zweck |
|---|---|
| `nenName` | Untertitel („Terapi kundër aknes") |
| `lloji` | `gel` \| `krem` \| `serum` \| `pastrues` \| `tonik` — steuert das Icon |
| `roli` | `baze` \| `mbeshtetje` \| `pastrim` — die `baze` fuellt `{partner}` |
| `perberesit[]` | Wirkstoff, Menge, Aufgabe — die Chips unter dem Foto |
| `perdorimi` | `hapi`, `koha`, `sasia`, `si`, `kujdes` |
| `synimi` | Was bis Tag 28 anders ist |
| `lidhja[]` | Die Regeln, aus denen die dynamische Begruendung entsteht |

`veprimi`, `persoenlich`, `kurztext`, `beschreibung`, `einzelpreis`, `order`,
`availability`, `photoRef` bleiben, wie sie sind.

### Wie eine Regel aussieht

```json
{
  "kur": { "parametri": "lezionet", "nga": 2 },
  "teksti": {
    "sq": "Puçrrat aktive te ju janë {grada} ({vlera}). LF ACNE vepron pikërisht mbi to: ul bakterin që i ushqen dhe hap folikulin ku fillojnë."
  }
}
```

Bedingungen in `kur` sind UND-verknuepft:

- `diagnoza: [...]` — eine dieser Kennungen ist die Hauptdiagnose
- `parametri: "id", nga: n` — dieser Parameter hat mindestens Stufe n
- `niveli: n` — Gesamtstufe mindestens n
- `partner: true` — im selben Set ist ein Produkt mit `roli: "baze"` gewaehlt
- `{}` — trifft immer

**Die erste passende Regel gewinnt.** Reihenfolge = Prioritaet, und die
Prioritaet gehoert Dr. Gashi, nicht einem Punktesystem. Die letzte Regel
jedes Produkts hat ein leeres `kur` und trifft deshalb immer. **Damit kann
der Abschnitt nie wieder leer sein** — das ist die eigentliche Reparatur des
groessten Verkaufslochs.

### Platzhalter

`{emri}` Vorname · `{gjetja}` staerkster Befund · `{gjetja2}` zweitstaerkster ·
`{diagnoza}` Diagnosename klein · `{grada}` Grad des getroffenen Parameters ·
`{vlera}` dessen Wert · `{zona}` erste Zone mit Befund · `{partner}` Name des
Basisprodukts · `{mosha}` Altersgruppe.

Fehlt ein Wert, faellt der Platzhalter **samt umgebendem Klammerausdruck**
weg, nicht als leere Luecke. `({vlera})` ohne Wert ergibt nichts, nicht `()`.

### Wichtig zu den Wirkstoffen

Die `perberesit` in `PRODUKTET_V2.json` sind Vorschlaege auf Basis der
Produktnamen. Sie muessen vor dem Livegang gegen die echte INCI-Liste der
gelieferten Ware geprueft werden. Jede Zeile in `veprimi` und jede Regel in
`lidhja` darf nur behaupten, was der tatsaechliche Inhaltsstoff hergibt —
sonst faellt genau der Teil in sich zusammen, den wir gerade aufbauen. Wenn
ein Wirkstoff anders ist, wird der Satz geaendert, nicht die Liste
beschoenigt.

---

## 4. Das Verbindungsmodul

**Neue Datei: `shared/lifeskin-terapia.js`.** Reines Rechnen, kein DOM,
keine Firestore-Aufrufe. Es wird von Heart *und* von der Befundseite
importiert, damit es genau eine Wahrheit gibt.

```js
export function baueTerapi({ raport, produkte, patient = {}, sprache = "sq" })
```

**Eingang**

- `raport` — das Ergebnis von `raportLesen`, erweitert um `diagnozaId`,
  `gjetjaKryesore`, `gjetjaDyta`
- `produkte` — die gewaehlten Produktstammdaten (voll, mit `lidhja`)
- `patient` — `{ emri, mosha }`

**Ausgang**

```js
[{
  id, name, nenName, lloji, roli, ikona,
  arsyeja,        // der getroffene, ausgefuellte Satz — nie leer
  veprimi: [],    // bis zu drei Zeilen
  perberesit: [], // Chips
  perdorimi: {},  // Anwendung
  synimi: ""
}]
```

Sortiert nach `perdorimi.hapi`, dann `order`.

**Ablauf je Produkt**

1. `{partner}` bestimmen: Name des Produkts mit `roli === "baze"` in der
   Auswahl. Gibt es keines, ist `partner` leer und alle Regeln mit
   `partner: true` treffen nicht.
2. `lidhja` von oben nach unten durchgehen, erste Regel nehmen, deren
   Bedingungen alle erfuellt sind.
3. Platzhalter fuellen. `{grada}` und `{vlera}` kommen aus **dem Parameter,
   den die getroffene Regel genannt hat** — nicht aus dem staerksten. Genau
   das macht den Satz spezifisch.
4. Findet keine Regel (auch keine leere), Kette: `persoenlich` →
   `kurztext` → `beschreibung`, erster nicht leerer Wert.

**Zusaetzlich exportieren:**

```js
export const PRODUKT_IKONA = { gel, krem, serum, pastrues, tonik };
export function fuellePlatzhalter(text, werte);
```

Die fuenf Icons sind Inline-SVG, 24×24, `stroke="currentColor"`,
`stroke-width="1.8"` — derselbe Stil wie die vorhandenen Zeichen in
`bericht.js:52-62`. Sie werden an drei Stellen gebraucht: als
Bildersatz auf der Befundseite, als Typ-Marke neben dem Produktnamen und in
der Produktliste in Heart.

---

## 5. Was sich in Heart aendert

### 5.1 Der Leser nimmt die neuen Felder auf

`shared/lifeskin-analyse.js`, in `raportLesen` (ab Zeile 859):

- `raus.parametratVleresuar` aus `["parametrat_e_vleresuar"]`, Vorgabe 10
- `raus.parametratMeGjetje` aus `["parametrat_me_gjetje"]`, sonst gerechnet
  als Zahl der Parameter mit `shkalla > 0`
- `raus.zonatMeNdryshime` aus `["zonat_me_ndryshime"]`, sonst
  `zonaLista.length`
- `raus.diagnozaId` aus `["id"]` **innerhalb von `diagnoza`** — nicht mit
  `ersterWert` ueber das ganze Dokument suchen, sonst faengt es die
  Produkt-Id ein
- `raus.gjetjaKryesore`, `raus.gjetjaDyta` aus `gjetjet`
- `raus.synimi28` aus `["synimi_28", "synimi"]`

`messwerte()` Zeile 856: `.slice(0, 5)` → `.slice(0, 10)`.

Fehlt eines der neuen Felder (alte Analyse, handgetippt), bleibt es leer und
die Seite laesst den betreffenden Teil weg. Kein Bericht darf daran
scheitern, dass ein Feld fehlt.

### 5.2 Der Bogen fasst zehn Parameter

- `heart-lifeskin-render.js:553`: `RAPORT_MESSWERTE = 5` → `10`
- `heart.js:1213` und `heart.js:1253`: `slice(0, 5)` → `slice(0, 10)`
- In `messBogen()` (Zeile 611) die Gruppen 6 bis 10 in ein eigenes
  `<details>` legen: „Parametrat 6-10 — zakonisht vijnë nga JSON-i". Zehn mal
  vier Felder offen sind ein Formular, das niemand von Hand ausfuellt; per
  JSON gefuellt sind sie unsichtbar und stoeren nicht.
- Neue Felder im Bogen: `diagnozaId` (Auswahlliste mit den 15 Kennungen),
  `gjetjaKryesore`, `gjetjaDyta`, `synimi28`, sowie die vier Zaehlwerte.

### 5.3 Die Begruendung erscheint beim Anhaken

Das ist der Kern der Zeitersparnis. Heute steht neben jedem Produkt ein
leeres Feld `data-produkt-satz` (`heart-lifeskin-render.js:697`).

Neu:

1. Beim Anhaken einer Produktbox ruft Heart `baueTerapi` mit dem, was
   **gerade im Bogen steht** (`lifeskinBogenLesen()`), und schreibt
   `arsyeja` in das Feld — aber nur, wenn es leer ist oder noch den zuletzt
   automatisch erzeugten Text enthaelt. Was Dr. Gashi selbst getippt hat,
   wird nie ueberschrieben.
2. Beim Abhaken wird ein unveraenderter Automatiktext wieder entfernt.
3. Unter dem Feld eine kleine Zeile: „Automatik · Regel {n}" oder „Von Hand
   geaendert", damit auf einen Blick sichtbar ist, was passiert ist.
4. Ein Knopf „Alle neu erzeugen" oben in der Produktliste, fuer den Fall,
   dass das JSON nach dem Anhaken eingefuegt wurde.

Ereignis in `heart-events.js` neben den vorhandenen `lifeskin-*`-Aktionen
registrieren; die Handler kommen wie ueblich in `heart.js` unter
`operations`.

### 5.4 Preis nach Anzahl

Neues Dokument `lifeskin/lifeskin/config/preise`:

```json
{ "1": 33, "2": 53, "3": 69, "4": 85, "5": 99 }
```

`#lifeskin-preis` (`heart-lifeskin-render.js:786`) wird beim Anhaken auf den
Wert zur Anzahl gesetzt, solange niemand den Preis von Hand geaendert hat.
`heart-lifeskin-adapter.js:53` liest `konfig.setPreis` schon; die Tabelle
kommt daneben. Ein Produkt = 33 €, zwei = 53 €.

Wirkung auf den Anker: `einzelpreis` ist bei allen fuenf Produkten 33 €. Bei
zwei Produkten zeigt die Seite 66 € durchgestrichen und 53 € daneben — 13 €
oder 20 % gespart, glaubwuerdig. Bei einem Produkt sind Anker und Preis
gleich, und `bericht.js:929` blendet den Anker dann von selbst aus. Nichts
weiter zu tun.

### 5.5 Was in den Bericht geschrieben wird

`heart-lifeskin-adapter.js:150 gibBerichtFrei` — `produkte[]` bekommt
Felder dazu:

```js
produkte: (produkte || []).map((p) => ({
  id, satz,                    // wie bisher
  arsyeja: String(p.arsyeja || "").slice(0, 400),
  regulli: Number(p.regulli) || null   // welche Regel getroffen hat
}))
```

**Nur diese zwei Felder wandern mit.** Wirkstoffe, Anwendung, Icon und Ziel
bleiben in der Produktsammlung und werden von der Befundseite live geholt —
sie sind Produkteigenschaften und aendern sich nicht je Patient. `arsyeja`
dagegen ist die Aussage, die Dr. Gashi **fuer diesen Patienten freigegeben
hat**; sie muss in dem Wortlaut eingefroren bleiben, in dem sie freigegeben
wurde, auch wenn spaeter eine Regel im Katalog geaendert wird. Das ist keine
Feinheit, das ist die Nachvollziehbarkeit des Befunds.

Fotos gehen weiterhin nicht mit (Kommentar bei `heart-lifeskin-adapter.js:143`
gilt unveraendert).

---

## 6. Was sich auf der Befundseite aendert

### 6.1 Der Abschnitt „Pse pikerisht kjo terapi" faellt nie mehr weg

`bericht.js:836` — die Zeile, die alles versteckt, verschwindet. Neuer
Aufbau des Abschnitts:

```
PSE PIKËRISHT KJO TERAPI PËR JU?

Analiza juaj tregoi [gjetja_kryesore], [gjetja_dyta] dhe [diagnoza.emri].

┌─ LF ACNE ─────────────────────────────────┐
│ [Satz aus der getroffenen Regel]          │
│  ✓ [veprimi 1]                            │
│  ✓ [veprimi 2]                            │
│  ✓ [veprimi 3]                            │
└───────────────────────────────────────────┘

┌─ LF MOISTUR ──────────────────────────────┐
│ [Satz aus der getroffenen Regel]          │
│  ✓ …                                      │
└───────────────────────────────────────────┘
```

Also **je Produkt ein eigener Block** statt einer gemeinsamen Hakenliste.
Grund: Die heutige Liste vermischt die Wirkungen beider Produkte zu einer
Merkmalsliste; getrennt ist jeder Haken einem Mittel zugeordnet, und die
Kette „Befund → dieses Mittel → diese drei Wirkungen" ist sichtbar. Der
Satz zu LF MOISTUR nennt dabei ausdruecklich `{partner}` — damit steht auf
der Seite, warum das zweite Produkt nicht ein Aufpreis ist, sondern die
Bedingung dafuer, dass das erste ueberhaupt durchhaelt.

Drei Haken je Produkt bleiben das Maximum (`bericht.js:850`, unveraendert).

### 6.2 Die Therapiekarte wird eine Produktkarte

`bericht.js:890 #produkteZeichnen` und `bericht.css:848-894`.

Neuer Aufbau je Produkt:

```
┌─────────────────────────────────────┐
│                                     │
│        [ Foto, volle Breite ]       │   ← 16:10, object-fit: contain,
│                                     │      Hintergrund --sand-hell
├─────────────────────────────────────┤
│ [Icon] LF ACNE          30 ml       │
│ Terapi kundër aknes                 │
│                                     │
│ [Benzoyl Peroxide 4%] [Niacinamide] │   ← Chips
│ [Zinc PCA]                          │
│                                     │
│ ▸ Si përdoret                       │   ← aufklappbar
│   Mbrëmje · hapi 2 · sa një bizele  │
│   Në lëkurë të pastër dhe të thatë… │
│                                     │
│ 🎯 Deri në ditën 28: …              │   ← synimi
└─────────────────────────────────────┘
```

CSS konkret:

- `.lb-produkt` — `grid-template-columns: 64px 1fr` faellt weg, wird
  `display: flex; flex-direction: column`
- `.lb-produkt__bild` — `width/height: 64px` → `width: 100%; aspect-ratio:
  16 / 10; max-height: 220px`, `background: var(--sand-hell)`,
  `object-fit: contain` bleibt
- ohne Foto: das Icon aus `PRODUKT_IKONA[lloji]` statt der generischen
  Flasche, 48 px, mittig
- Chips: `.lb-perberes` — kleine Pillen, `border: 1px solid var(--linie)`,
  `border-radius: 999px`, `font-size: 12px`
- Anwendung in `<details>`, damit die Karte nicht zur Tapete wird

Alle Felder ausser Name und Inhalt sind optional. Fehlt `perberesit`, faellt
die Chipreihe weg; fehlt `perdorimi`, faellt das Aufklappen weg. Eine
kuerzere Karte ist besser als eine mit leeren Zeilen — dieselbe Regel wie
ueberall in diesem Projekt.

### 6.3 Die Zahlen stimmen

- `bericht.js:40` `PARAMETER_BEURTEILT = 10` bleibt als **Rueckfallwert**,
  gelesen wird `raport.parametratVleresuar ?? 10`
- `bericht.js:636`: `offen = rest.length` — die Zahl der wirklich in der
  Aufklappliste liegenden Werte, nichts Gerechnetes
- `bericht.js:547` Parameter-Pille: `„{a} parametra · {b} me gjetje"`
- `bericht.js:549` Zonen-Pille: `„{a} zona të kontrolluara · {b} me ndryshime"`,
  gespeist aus `zonat` und `zonatMeNdryshime`
- die Bedingung `zonen >= 3` bleibt: unter drei Zonen wird gar nichts
  behauptet, sondern das Datum gezeigt

Neue Texte in `bericht-texte.js` bei `pilleParametra` und `pilleZona`.

### 6.4 Der weiche CTA

Neu, direkt nach der Diagnosekarte: ein flacher Knopf **„Shiko planin tim
28-ditor"**, der zu `#lb-therapia` scrollt. Kein Preis, kein Kaufen.

Sichtbar nur, solange die feste Leiste in Stufe `aus` steht
(`bericht.js:1013`) — sobald der Kauf-CTA erscheint, verschwindet der weiche.
Zwei Aufforderungen gleichzeitig sind eine zu viel.

Der Grund ist eine Trichterfrage: Der schnelle Besucher, der nach der
Diagnose noch nicht kaufen will, hat heute nur zwei Moeglichkeiten — weiter
lesen oder weg. Ein Knopf, der nichts kostet, gibt ihm eine dritte, und sie
fuehrt genau dorthin, wo verkauft wird. Der Kauf-CTA bleibt, wo er ist.

### 6.5 Der ueberpruefbare Zeitpunkt

Der Bericht traegt bereits `freigabeAt` (`heart-lifeskin-adapter.js:214`).
Daraus wird eine Zeile unter der Diagnose:

> **Rishikuar personalisht nga Dr. Violeta Gashi**
> 07.09.2026, ora 14:32

Das ist echt, steht schon im System und kostet nichts. Es ist der einzige
Vertrauensbeweis in diesem Dokument, der ohne neue Zusage auskommt.

Was dazugehoert, sobald es vorliegt — und nur dann: Foto, Qualifikation,
Praxis, Lizenznummer, ein erreichbarer Kontakt. Ein Feld dafuer kommt in
`config/mjeku`; leere Felder erscheinen nicht. **Nichts davon darf erfunden
werden.** Eine Lizenznummer, die sich nicht nachschlagen laesst, ist genau
bei dem Skeptiker, den wir gewinnen wollen, das Ende.

### 6.6 Die zwei Widersprueche

**„Dr. Gashi e sheh çdo ditë"** (`bericht-texte.js:268`) → ersetzen durch
das, was tatsaechlich passiert:

```
sq: "Kjo faqe mbetet e hapur. Ditën e 14-të dhe të 28-të dërgoni një
     përditësim — Dr. Gashi e vlerëson dhe përshtat terapinë nëse duhet,
     pa pagesë shtesë. Mund të na shkruani edhe në çdo kohë tjetër."
```

Dasselbe Versprechen, nur ueberpruefbar. Und es ist staerker: Es sagt dem
Kunden, was **er** am Tag 14 tun soll — das ist eine Verabredung und kein
Serviceversprechen.

**Medizin gegen Kosmetik** (`bericht-texte.js:206` und `:478`) → eine
Sprache, konsequent durchgezogen. Empfehlung:

- oben: „Vlerësim dermatologjik vizual" statt „raport dermatologjik"
- die Diagnosekarte behaelt ihre Kraft, bekommt aber die Marke
  „Përshtypja kryesore" ueber dem Namen
- **ein** Hinweis, nicht zwei: der Absatz bei `:206` bleibt und sagt, was
  aus Aufnahmen nicht beurteilbar ist und dass dies eine Untersuchung beim
  Arzt nicht ersetzt. Der zweite bei `:478` faellt weg.

Damit steht nirgends mehr eine Aussage, die einer anderen auf derselben
Seite widerspricht. Die Autoritaet bleibt vollstaendig erhalten — was
wegfaellt, ist nur die Stelle, an der ein aufmerksamer Leser stutzt.

### 6.7 Kuerzen vor dem Angebot

Ziel: von rund 341 Woertern auf 220 bis 250 vor dem ersten Kauf-CTA.
Gestrichen wird dort, wo dieselbe Sache zweimal steht:

- `ekzaminimi` auf zwei Saetze — die Pillen darueber sagen die Zahlen schon
- `shpjegimi` bleibt bei zwei Absaetzen, aber je hoechstens 40 Woerter
  (Vorgabe im Prompt ergaenzen)
- `pa_kujdes.zbehet` und `nuk_zbehet` in **eine** Karte mit zwei Spalten
  statt zwei Bloecken untereinander
- die Zonenliste bleibt zugeklappt (ist sie schon)

Nicht gekuerzt wird die Diagnosekarte. Sie ist der staerkste Moment der
Seite.

---

## 7. Verkaufspsychologie — was wirklich zieht

Die Vorgabe war „dunkle Verkaufspsychologie". Bei einem 53-€-Kauf per
Nachnahme von einem kalten TikTok-Besucher, der Hautprobleme hat und schon
enttaeuscht wurde, ist die staerkste Hebelwirkung nicht das Aggressive —
es ist das **Ueberpruefbare**. Dieses Publikum ist misstrauisch geboren;
jeder Trick, den es erkennt, kostet den ganzen Rest der Seite.

Deshalb: maximale Schaerfe bei den Hebeln, die einer Pruefung standhalten.

**1. Besitz.** Name, Fallnummer, Datum, sein Befund — steht schon, wirkt
schon. Verstaerkung: `{emri}` in den Produktsaetzen (macht `persoenlich`
bereits moeglich, wird bisher kaum genutzt).

**2. Verlustaversion mit Datum.** `pa_kujdes.nuk_zbehet` ist der staerkste
Satz der Seite. Er gehoert direkt vor die Therapie, nicht ans Ende der
Analyse. Und `pas_6_muajsh` bekommt eine Jahreszahl: „deri në mars 2027" ist
ungleich konkreter als „pas 6 muajsh".

**3. Genauigkeit als Beweis.** „11 zona të kontrolluara · 5 me ndryshime"
schlaegt jede runde Zahl. Der Unterschied zwischen geprueft und auffaellig
ist das Signal, dass jemand hingesehen hat.

**4. Zugestaendnis.** Der Parameter mit `shkalla: 0` — „Barriera e lëkurës:
e ruajtur mirë ✓". Wer etwas Gutes sagt, wird beim Schlechten geglaubt. Das
Prinzip steht schon im Code (`bericht.js:606-612`) und wird durch zehn
statt fuenf Parameter nur staerker.

**5. Der Grund.** Jedes Produkt bekommt sein „sepse". Das ist genau das,
was dieses Dokument baut — und es ist der groesste einzelne Hebel, weil
heute an dieser Stelle nichts steht.

**6. Die Verpflichtungsleiter.** Foto → Analyse → „Shiko planin tim" →
Kauf. Jede Stufe ist klein und jede macht die naechste
wahrscheinlicher. Der weiche CTA aus 6.4 ist die fehlende Sprosse.

**7. Risiko wegnehmen — konkret.** Die Garantie ist gut. Was fehlt, ist der
Ablauf: „Na shkruani në WhatsApp. Pa formular, pa arsyetim. Paratë kthehen
brenda 5 ditësh." Ein Versprechen, dessen Ablauf man sich vorstellen kann,
wirkt; eines ohne Ablauf klingt wie eine Klausel.

**8. Der Preis in der richtigen Einheit.** 66 € durchgestrichen → 53 € →
1,89 € am Tag steht schon. Dazu: „Vetëm njërin: 33 €. Të dy bashkë: 53 €."
Die Einzelpreiszeile macht das Set zur offensichtlichen Wahl, ohne dass
irgendetwas erfunden werden muss.

**9. Der Einwand vor der Begruendung.** „Keni provuar produkte më parë?"
steht schon an der richtigen Stelle (`bericht-texte.js:335`) — aber der
Beweis danach fehlte. Mit Abschnitt 6.1 kommt er.

**10. Autoritaet mit Beleg.** Ein Datum, das stimmt, schlaegt zehn
Adjektive.

### Was wir nicht tun

Kein kuenstlicher Countdown, keine erfundene Knappheit („noch 3 Sets"),
keine ausgedachten Bewertungen, keine Vorher-Nachher-Bilder ohne echten
Fall, keine erfundene Lizenznummer, keine Zahlen, denen keine Messung
zugrunde liegt.

Der Grund ist nicht Zimperlichkeit. Es ist Rechnen: Der Kunde, den wir
gewinnen muessen, ist derjenige, der schon fuenf Sachen probiert hat. Er
erkennt einen Countdown auf einer medizinischen Befundseite sofort — und in
dem Moment liest er den ganzen Rest, den Befund eingeschlossen, als
Verkaufsmasche. Ein erfundenes Element kostet uns die neun echten.

**Erfahrungsberichte:** Der Platz dafuer ist vorgesehen (vor dem Preis),
aber er bleibt leer, bis ein echter Fall mit Einverstaendnis vorliegt. Dann
ist er stark. Vorher waere er das Risiko, das die ganze Seite kippt.

---

## 8. Der Ablauf im Alltag

So sieht es nach der Umsetzung aus, je Patient:

1. Fotos aus Heart in ChatGPT, zusammen mit `PROMPT_ANALIZA_V2.json` → JSON
2. JSON in Heart einfuegen, „Uebernehmen" → Bogen komplett gefuellt,
   zehn Parameter, Diagnose, Zonen, Prognose, Ziel
3. Zwei Produkte anhaken → Begruendungen erscheinen fertig, Preis springt
   auf 53 €
4. Ueberfliegen, gegebenenfalls einen Satz aendern
5. „Befund freigeben"

Geschaetzt unter zwei Minuten je Fall nach dem ChatGPT-Schritt. Bei 50 bis
100 Analysen taeglich ist das der Unterschied zwischen machbar und nicht.

---

## 9. Arbeitspakete

In dieser Reihenfolge, jedes einzeln lauffaehig und committebar.

**Paket 1 — Ehrliche Zahlen.** (klein, wirkt sofort)
`bericht.js:636`, `:547`, `:40`; `raportLesen` um die vier Zaehlwerte
erweitern; `messwerte()` auf 10; `RAPORT_MESSWERTE` auf 10; beide
`slice(0, 5)` in `heart.js`; Texte `pilleParametra`, `pilleZona`.
Test: `tests/lifeskin-zaehlung.test.mjs` erweitern.

**Paket 2 — Produktmodell und Stammdaten.**
Felder `nenName`, `lloji`, `roli`, `perberesit`, `perdorimi`, `synimi`,
`lidhja` in `produktAusFormular` (`heart.js:962`) und
`renderProduktEditor` (`heart-lifeskin-render.js:829`). `lidhja` im Editor
als JSON-Textfeld mit Pruefung beim Speichern — fuenf Regelsaetze von Hand
in Formularfelder zu klicken waere langsamer als sie zu tippen.
Dann `STANDARD_PRODUKTE` in `lifeskin-catalog.js` durch die fuenf aus
`PRODUKTET_V2.json` ersetzen (die beiden Platzhalter `serum-01`/`creme-01`
fallen weg; `tests/heart-lifeskin-produkte.test.mjs:29` haengt an
`serum-01` und muss mit).

**Paket 3 — `shared/lifeskin-terapia.js`.**
Das Modul aus Abschnitt 4 samt Icons. Reine Funktion, deshalb vollstaendig
testbar ohne Browser. Neuer Test `tests/lifeskin-terapia.test.mjs`.

**Paket 4 — Heart verdrahten.**
Automatik beim Anhaken, „Alle neu erzeugen", Preistabelle,
`gibBerichtFrei` um `arsyeja` und `regulli` erweitern.

**Paket 5 — Befundseite.**
Abschnitt 6.1 (Blockaufbau, nie versteckt), 6.2 (Produktkarte, CSS),
6.4 (weicher CTA), 6.5 (Pruefzeitpunkt).

**Paket 6 — Texte.**
6.6 (die zwei Widersprueche), 6.7 (Kuerzen), Abschnitt 7 Punkte 2, 7, 8.

**Paket 7 — Prompt scharf schalten.**
`docs/lifeskin-prompt.json` durch die V2 ersetzen oder als
`docs/lifeskin/PROMPT_ANALIZA_V2.json` daneben fuehren und im README
darauf zeigen.

---

## 10. Tests

Neu bzw. zu erweitern:

| Datei | Was sie festhaelt |
|---|---|
| `tests/lifeskin-terapia.test.mjs` (neu) | erste passende Regel gewinnt; `{partner}` nur bei vorhandener `baze`; Platzhalter mit Klammern fallen sauber weg; **die Rueckgabe ist nie leer** |
| `tests/lifeskin-zaehlung.test.mjs` | „X me gjetje" entspricht der Zahl der Werte mit `shkalla > 0`; die Zahl der Aufklappzeilen entspricht der genannten Zahl |
| `tests/lifeskin-ueberzeugung.test.mjs` | der Abschnitt „Pse" ist bei jedem Produkt und jeder Analyse sichtbar |
| `tests/heart-lifeskin-produkte.test.mjs` | die fuenf neuen Produkte, neue Formularfelder, `lidhja` wird gelesen und geschrieben |
| `tests/lifeskin-vorlage.test.mjs` | V2-JSON fuellt alle neuen Felder; ein V1-JSON ohne die neuen Felder faellt nicht durch |
| `tests/heart-lifeskin-detail.test.mjs` | `arsyeja` landet im Bericht; Preis folgt der Produktzahl |

Baseline vor dem Abschluss: `npm run test:all` und `npm run lint`. Weil die
Aenderungen im Browser sichtbar sind, gilt zusaetzlich die Regel aus
`AGENTS.md`: `npm run build` laufen lassen und geaenderte Bundle-Dateien
mitcommitten.

---

## 11. Offene Punkte fuer Albert

Diese drei kann nur der Auftraggeber entscheiden — alles andere ist im
Dokument festgelegt:

1. **Wirkstoffe bestaetigen.** Die `perberesit` in `PRODUKTET_V2.json`
   gegen die echten INCI-Listen pruefen. Jede Abweichung aendert die
   `veprimi`-Zeilen und die `lidhja`-Saetze mit.
2. **Angaben zu Dr. Gashi.** Foto, Qualifikation, Praxis, Lizenznummer,
   Kontakt — nur, was tatsaechlich stimmt und nachschlagbar ist. Ohne diese
   Angaben bleibt Abschnitt 6.5 auf den Pruefzeitpunkt beschraenkt, der
   ohnehin echt ist.
3. **Erster echter Erfahrungsbericht.** Mit schriftlichem Einverstaendnis.
   Bis dahin bleibt der Platz leer.
