Status: CURRENT
Last updated: 2026-09-27

# LifeSkin: vier Fragen nach der Aufnahme, die den Kauf vorbereiten

Auftrag (27.09.): Seit Tagen kaum Bestellungen. Zu viele kommen nur wegen
der kostenlosen Analyse. Gewuenscht: fuer beide Wege (Scan und Foto)
dieselben kurzen Fragen - etwas Anamnese, was schon benutzt wurde, und ob
Interesse an einer Therapie besteht (ohne "kein Interesse"). Klug aufgebaut,
sodass auf der fertigen Analyseseite gekauft wird. Nur so viele Fragen,
dass niemand abbricht. Prompt, Produkte und Analyse muessen zusammenpassen.

Branch: `claude/routine-therapy-sales-funnel-p69dc0` (nicht main).

## 1. Befund: warum niemand kauft

- Die Landingpage (kurze Fassung, `data-ls-variante="kurz"`) fragt nach der
  Aufnahme **nur Name, Alter, Nummer**. Die vier Anamnesefragen gibt es seit
  dem Wechsel auf "kurz" nicht mehr.
- Folge 1: Der Prompt bekommt keine Anamnese - `shqetesimi` ("Ju na thatë
  …") bleibt fast immer leer. Die Seite kann nichts aus seinem Mund
  zurueckgeben.
- Folge 2: Bis zur Therapieseite hat der Besucher **nie an eine Therapie
  gedacht**. Die Landingpage verspricht "Analiza falas"; dann steht oben
  ploetzlich ein Paket mit Preis. Das fuehlt sich wie eine Falle an.
- Folge 3: Sein stiller Einwand ("hab ich alles schon probiert") wird nie
  ausgesprochen und nie beantwortet.
- Folge 4: Das Team sieht nicht, wer bereit ist und wem es auf WhatsApp
  nachgehen soll.

## 2. Szenarien (durchgespielt)

| Wer | Heute | Mit den Fragen |
|---|---|---|
| Arta, 19, Akne, aus Instagram-Anzeige, will "nur schauen" | Scan, Nummer, sieht Preis, geht | tippt "Puçrrat", "Mbi një vit", "Produkte nga Instagrami", "Po, kur ta shoh çka më duhet". Seite: "Ju shqetëson: Puçrrat · Që kur: Prej mbi një viti · Keni provuar: …" + "Produktet nga rrjetet zgjidhen sipas reklamës. Këto i zgjodhi Dr. Gashi sipas fotove tuaja." + am Knopf ihr eigenes "Po". |
| Besa, 27, Flecken, hat viel Geld in Apothekencremes versenkt | skeptisch, "noch eine Creme" | Einwand ausgesprochen ("Kremë nga barnatorja"), Seite antwortet: fuer sie gewaehlt, Plan fuer 4 Wochen, Garantie |
| Driton, 23, entschlossen | kauft vielleicht, vergisst es in WhatsApp | "Po, dua ta filloj sa më shpejt" → Heart sieht es in "Seine Antworten", WhatsApp-Text: "kann heute beginnen", Seite: "Ju na thatë se doni të filloni sa më shpejt … porosia zgjat një minutë." |
| Neugierige/r ohne Kaufabsicht | wie heute | "Së pari dua vetëm analizën" - ehrlich; Seite drueckt nicht ("Analiza juaj e plotë është më poshtë …"), Heart weiss, dass hier nachgefasst werden muss |
| Ungeduldige/r nach 30 s Kopfdrehen | – | Einleitung: "Skanimi mbaroi ✓ … 4 pyetje të shkurtra, vetëm me prekje." Nur Antippen, zwei Fragen gehen mit einem Tipp weiter, Fotos laden waehrenddessen hoch |

Warum diese vier und nicht mehr: jede weitere Frage kostet Abschluesse, und
die Regeln kennen genau vier Frage-Stufen (`pyetja1`-`pyetja4`). Die
Schwangerschaftsfrage bleibt draussen (wie schon bisher in der kurzen
Fassung - offener Punkt fuer Dr. Gashi, siehe 7.);
"Roaccutane" steckt in "Çka keni provuar" und gilt im Prompt als
Sicherheitsangabe.

## 3. Was gebaut ist

### Trichter (Scan und Foto gleich)

Aufnahme → **4 Fragen** → Name + Alter → Nummer → Uebergabe (wie bisher).

1. "Çka ju shqetëson më së shumti?" (bis zu 2, wie bisher)
2. "Prej sa kohe e keni?" (ein Tipp)
3. **neu** "Çka keni provuar deri tash për lëkurën?" (bis zu 2) - Barnatore,
   Instagram/TikTok, nur Seife, viele Produkte ohne Ergebnis, Arzt/Roaccutane,
   noch nichts. Darunter: "që të mos merrni diçka që s'ju ka ndihmuar".
4. **neu** "A doni që Dr. Gashi t'ju përgatisë edhe terapinë 4-javore?"
   (ein Tipp) - "Po, dua ta filloj sa më shpejt" / "Po, kur ta shoh çka më
   duhet" / "Së pari dua vetëm analizën". Darunter: "Analiza mbetet falas,
   pa detyrim." Kein "Nein".

Dateien: `lifeskin-content.js` (`perdorimi`, `gatishmeria`,
`FRAGEN_NACH_AUFNAHME`, Einleitungssaetze), `lifeskin-app.js`
(`#aufnahmeFragen`, Balken 70 %, Zurueck vom Namen zur letzten Frage).
Trup/Pytje bleibt unveraendert. Keine neuen Firestore-Felder in der
Sitzung: alles in `anamnese` (Karte, Regel `is map`) und den vorhandenen
Stufen - **keine Regel-Aenderung, kein Regel-Deploy**.

### Heart

- "Seine Antworten" zeigt die neuen Antworten von selbst (liest `FRAGEN`).
- Der Prompt bekommt sie von selbst (`anamneseFuerPrompt`).
- Beim Freigeben (auch "Nur für uns"/"Bereit") legt Heart eine gepruefte
  Abschrift in den Bericht: `bericht.antworten` - nur Kennungen aus
  `shared/lifeskin-antworten.js`, **keine** Gesundheitsangabe (Schwangerschaft,
  Isotretinoin, "mjek"), kein Name, keine Nummer. Der Bericht ist
  oeffentlich lesbar; die Sitzung bleibt es nicht.

### Therapieseite `/terapia/<id>`

- Karte **"Çfarë na thatë"** unter dem Einstieg: Ju shqetëson · Që kur ·
  Keni provuar - in seinen Worten - und ein fester Satz, warum diese
  Therapie anders ist als das Probierte (ohne neue Wirkversprechen).
- Ueber dem ersten Kaufknopf sein eigenes Wort (gruen), je Bereitschaft.
- Nur, wenn ein Angebot da ist und Antworten im Bericht stehen. Aeltere
  Befunde: Seite wie bisher.

### Prompt v9.1 (mit und ohne Foto)

Neuer Abschnitt "DIE ANTWORTEN VOR DEM KAUF": `shqetesimi` verbindet
Anliegen + Dauer + Befund (wiederholt die Karte nicht), `pse_tani` nutzt die
Dauer, `whatsapp` richtet sich nach der Bereitschaft, "Terapi te mjeku ose
Roaccutane" ist Sicherheitsangabe. Schema und Platzhalter unveraendert.
Verlauf: `docs/lifeskin-prompt-verlauf.md`.

## 4. Pruefung

- `npm test`: 2786 bestanden, 0 fehlgeschlagen. Neu:
  `tests/lifeskin-kaufbereit.test.mjs` (7 Tests: Strecke, kein Nein,
  Scan/Foto-Weg, Prompt, oeffentliche Abschrift ohne Gesundheitsdaten,
  Spiegel-Saetze ohne verbotene Woerter, Heart→Bericht→Seite). Angepasst:
  `lifeskin-fragen`, `lifeskin-menyra`, `lifeskin-trichter-variante`,
  `lifeskin-bericht-schreibweg`.
- `npm run build`: erfolgreich, keine getrackten Bundle-Dateien geaendert.
- `npm run arch:check`: keine Verstoesse (Bericht aktualisiert).
- ESLint auf den geaenderten Dateien: sauber (eine alte Warnung in heart.js).
- **Nicht geprueft:** kein echtes Telefon, kein Playwright/Smoke (AGENTS.md).
  Mobil muss auf der Vercel-Vorschau geprueft werden.

## 5. Vorschau

`vercel.json` erlaubt Vorschau-Builds fuer diesen Branch
(`git.deploymentEnabled`). Die Vorschau spricht mit derselben Datenbank wie
die Seite - Testfaelle in Heart danach loeschen.

Ablauf zum Ausprobieren:
1. `<vorschau>/lifeskin` → Fillo → Me skanim oder Me foto → die 4 Fragen →
   Name → Nummer.
2. `<vorschau>/heart` → Fall oeffnen → "Seine Antworten" zeigt die neuen
   Antworten → Prompt kopieren (enthaelt sie) → JSON einfuegen → "Nur für
   uns".
3. `<vorschau>/terapia/<id>?vorschau=1` → Karte "Çfarë na thatë" und der
   gruene Satz ueber dem Kaufknopf.

## 6. Rueckweg

Ein Commit, einzeln per `git revert` ruecknehmbar. Keine Routen-, Regel-,
Sammlungs- oder DOM-ID-Entfernungen. Heart schreibt ein zusaetzliches Feld
`antworten` in den Bericht (CEO-Schreibrecht, keine Regel betroffen).

## 7. Naechste Schritte (nicht umgesetzt)

- Schwangerschaft/Stillzeit wird im Trichter nicht gefragt (wie vorher in
  der kurzen Fassung). Entscheiden, ob Dr. Gashi es vor dem Versand auf
  WhatsApp klaert oder ob es eine optionale Zeile auf dem Namensschirm wird.

- In Heart eine Stufe "pyetja1-4" im Trichter ueber eine Woche lesen: kostet
  eine der vier Fragen spuerbar Besucher, die teuerste zuerst kuerzen.
- "Po, dua ta filloj sa më shpejt"-Faelle in Heart als eigenes Fach/Chip, um
  sie zuerst auf WhatsApp anzuschreiben.
- Bei "Së pari dua vetëm analizën" die Seitenreihenfolge testen (Analyse vor
  Preis).
