Status: CURRENT
Last updated: 2026-09-26

# LifeSkin A–Z echt getestet, Heart schneller und ruhiger, Menue mit drei Eintraegen, Tag/Nacht

Auftrag (25.09., abends): jeden Weg von A bis Z pruefen und **echt testen, nicht
nur Code** — es darf fuer niemanden etwas im Weg stehen. Genauso wichtig: die
Live-Statistik in Heart muss stimmen, und Heart ist langsam ("Analyse fuer uns
klicken dauert, dann springt es, wenn die Meldung kommt; Freigabe springt auch;
die Zahlen aktualisieren sich nicht schnell"). Dazu: im Menue nur drei Eintraege
(Lifeskin, alles andere unter "Mnyra"), Tag- und Nachtfarbe, der
Aktualisieren-Knopf soll sich sofort drehen.

Vorher: `893af1f`. Vorige Runde: `docs/lifeskin-wege-abbrueche-2026-09-25.md`.

## 1. Wie getestet wurde

Kein Code-Lesen allein, sondern der Browser, auf Telefongroesse:

- **Trichter:** `tests/lifeskin-trichter-pruefstand/lauf-wege.mjs` klickt jeden
  Weg in Chromium mit Beruehrung und der Kennung des jeweiligen Browsers
  (Chrome, Instagram, Facebook, Safari) durch — bis zur Warteseite und weiter
  bis zur Therapieseite. Die Kamera ist eine Datei mit einem echten Gesicht
  (`kamera-attrappe.mjs`), das echte Gesichtsnetz laeuft darauf. Firestore
  wird vollstaendig abgefangen und im Speicher nachgespielt: Was der Trichter
  schreibt, liest die Warteseite wieder. Keine Anfrage erreicht die echte
  Datenbank (zusaetzlich zeigen deren Namen im Testbrowser auf 127.0.0.1).
- **Heart:** Firestore- und Auth-Emulator lokal (Projekt `mnyra-local`),
  4000 erfundene Sitzungen ueber 30 Tage mit Klickpfad, 837 Berichte, Fotos
  (`heart-emulator-seed.mjs`). `lauf-heart.mjs` misst auf einem Telefonfenster
  mit **vierfach gebremster CPU** (so rechnet ein Mittelklasse-Handy), mit
  Layout-Verschiebungen, langen Aufgaben, Scrollstelle und CPU-Profil.
- **Grenzen:** Die Engine ist Chromium. Was nur WebKit auf dem iPhone tut, sieht
  dieser Lauf nicht (WebKit ist hier nicht installierbar). Ein Standbild dreht
  den Kopf nicht — der Ring schliesst sich damit nicht; gemessen ist der Weg
  eines Menschen, der es nicht schafft. Ob die Android-Apps von Instagram und
  Facebook die Live-Kamera freigeben, laesst sich nur am echten Geraet klaeren
  (Anleitung in der vorigen Doku, Abschnitt 8).

## 2. Ergebnis Trichter: alle Wege von A bis Z

| # | Weg | Ergebnis |
|---|---|---|
| A1 | Skanim, Android Chrome, Kamera mit Gesicht | ✓ Ring, gerades Foto, Hilfe mit Ausloeser nach 23 s (vorher 34 s), bis Therapieseite |
| A1b | Skanim, Gesichtsnetz blockiert (altes Telefon) | ✓ einfache Erkennung, bis Warteseite |
| A1c | Skanim, sofort getippt (Netz noch unterwegs) | ✓ bis Warteseite |
| A2 | Me foto, iPhone-Instagram-Kennung, Frontkamera | ✓, Aufnahme seitengleich wie die Vorschau (Korrelation 1,00 gespiegelt / 0,77 roh) |
| A3 | Me foto, Android Instagram, Kamera sofort gesperrt | ✓ Hinweis sofort, kein sinnloses "Provo sërish", Telefonkamera + "Hape në Chrome" (mit `ls_weg=foto`), bis Warteseite |
| A4 | Skanim, Android Facebook, Kamera gesperrt | ✓ wie A3, Fall steht in Heart als Foto-Fall "Android · Facebook" |
| A5 | Trup/Pytje, Android Facebook, Foto aus der Galerie | ✓ Text + Foto in der Sitzung |
| A6 | Trup/Pytje, iPhone SE (320 px), ohne Foto | ✓ alle Knoepfe ohne Scrollen im Bild |
| A7 | Skanim, Mensch lehnt die Kamera selbst ab | ✓ "Provo sërish" bleibt, Telefonkamera als zweiter Weg |
| A8 | Alter App-Browser ohne Kamera-Schnittstelle | ✓ Ausweg sofort, Gesichtsnetz (6,9 MB) wird gar nicht geladen |
| A9 | Skanim, niemand im Bild | ✓ Ausweg (noch einmal oder Telefonkamera), jetzt nach 35 s statt 50 s |
| A10 | Uebergabe auf zaeher Leitung (Foto 28 s unterwegs) | ✓ "0 nga 1" sichtbar, geht ohne Tipp weiter, sobald es ankommt |
| A11 | Zurueck-Taste und Wegwechsel | ✓ nie ein leerer Bildschirm, Kamera danach aus |
| A12 | Aus Chrome zurueck in den Weg (`ls_weg=foto`) | ✓ direkt die Foto-Anleitung |
| A13 | Warteseite aus WhatsApp → Freigabe → Therapie | ✓ wechselt nach der Freigabe von selbst (≤ 12 s) |

Gefunden und behoben:

- **Wer den Kopf nicht drehen kann, wartete zu lange.** Das Blatt mit dem
  Ausloeser ging erst nach 34 s von selbst auf, ohne erkanntes Gesicht kam der
  Ausweg erst nach 50 s. Jetzt 15 s ohne Fortschritt bis zur Hilfe und 30 s bis
  zum Ausweg (`STILLSTAND_HILFE_MS`, `STILLSTAND_ABBRUCH_MS`). Nachgemessen:
  Hilfe nach 23 s ab dem Tippen auf "Hap kamerën" (vorher 34 s), Ausweg ohne
  Gesicht nach 35 s (vorher 50 s).
- **Ein einziger Aussetzer beim Laden des Gesichtsnetzes galt fuer den ganzen
  Besuch.** Im Pruefstand einmal gesehen: gescheitert nach 4 s an der Leitung,
  danach kein Ring mehr. Jetzt ein zweiter Versuch beim naechsten Anlass
  (meist "Hap kamerën"), danach nicht mehr (`lifeskin-netz.js`).

## 3. Ergebnis Heart: gemessen, Ursache, Korrektur

Gemessen mit 4000 Sitzungen, CPU vierfach gebremst:

| Messung | vorher | nachher |
|---|---|---|
| Akte oeffnen, bis sie dasteht | 1,1–1,9 s | 0,5–2,1 s (schwankt mit der Test-Datenbank, meist Laden der Fotos) |
| Akte oeffnen: Scrollstelle | blieb an der Stelle der Liste (Fotos oben abgeschnitten) | oben |
| Akte oeffnen: ganze Seite neu aufgebaut | 3× | 0× |
| Zurueck zur Liste | wieder ganz oben | an der Stelle, wo man war |
| Neue Sitzung → Zahl oben (Heart-Anteil) | ~5 s Rechnen und Zeichnen | < 0,2 s |
| Neue Sitzung → Zahl oben (gesamt, Emulator) | 7–9 s | 3,9–11,4 s = Lieferzeit von Firestore selbst (unabhaengiger Zuhoerer: gleich) |
| "Nur für uns" / Freigabe danach | alles neu laden (Sekunden), dann Sprung | ein Bericht nachgelesen, kein Sprung |
| Aktualisieren-Knopf | alles neu laden | nur Aenderungen seit dem letzten Laden |

Ursachen (aus dem CPU-Profil):

1. **Heart schrieb bei jeder Aenderung die ganze Seite neu** (`innerHTML`) — bei
   jeder Live-Zahl, jeder Meldung, jedem Foto. Mit 332 offenen Faellen sind das
   6700 Elemente, die weggeworfen und neu aufgebaut wurden; Bilder wurden neu
   dekodiert, Listen verloren ihre Stelle. **Jetzt:** `heart-morph.js` gleicht
   das neue Markup mit dem ab, was dasteht — was gleich bleibt, bleibt derselbe
   Knoten. Jede Fallzeile und die ganze Fallkarte tragen einen Fingerabdruck;
   unveraenderte Zeilen werden gar nicht erst durchsucht. Notschalter:
   `localStorage["heart.morph"] = "aus"` schaltet auf das alte Verfahren.
   Im Browser geprueft: `lauf-morph.mjs`, 19/19 (gleiches Ergebnis wie
   innerHTML; Feld mit Fokus, bewahrte Formulare, Bilder, Auswahlfelder).
2. **Datum und Uhrzeit** bauten je Zeile zwei neue Formatierer (ueber 1 s je
   Zeichnen). Jetzt ein Formatierer je Art, Ergebnisse gemerkt.
3. **Bereinigen des Zustands** lief bei jeder Aenderung durch alle Sitzungen.
   Jetzt wird jedes bereinigte Objekt gemerkt — mit gleicher Identitaet, an der
   die Fallliste unveraenderte Zeilen erkennt. Der Live-Zuhoerer gibt
   unveraenderte Sitzungen als dasselbe Objekt weiter.
4. **Nach Freigabe, "Nur für uns", "Bereit", Markieren, Versand und Loeschen
   lud Heart ALLES neu.** Jetzt wird nur der eine Bericht nachgelesen bzw. der
   geloeschte Fall entfernt. Die Knoepfe zeigen "Wird gespeichert …" und
   "✓ Gespeichert" aus dem Zustand (vorher ging das beim naechsten Zeichnen
   verloren, und man tippte mehrmals).
5. **Die Akte oeffnete an der Scrollstelle der Liste** — das "komische
   Springen". Jetzt oben; zurueck steht die Liste wieder dort, wo man war.
6. **Textfelder des Befunds** wurden nach jedem Zeichnen einzeln vermessen
   (halbe Sekunde, und die Seite konnte dabei kurz springen). Jetzt nur
   geaenderte Felder, in einem Durchgang, Scrollstelle bleibt.
7. **Aktualisieren** holt nur noch Sitzungen, deren `updatedAt` seit dem letzten
   Laden neu ist (dazu alle Berichte, sie sind klein). Mehr als 3000
   Aenderungen, ein Fehler oder Aenderungen an Produkten/Einstellungen: dann
   wie bisher alles.

Die verbleibende Wartezeit fuer eine neue Sitzung ist die Lieferzeit von
Firestore (im Emulator 4–11 s, je voller er wird; im Betrieb meist unter
einer Sekunde). Ein unabhaengiger Zuhoerer in derselben Seite bekommt sie zur
selben Zeit - Heart selbst braucht danach unter 0,2 s. Das Oeffnen einer Akte
ist nicht wesentlich schneller geworden (die Fotos kommen aus der
Datenbank), aber es baut nichts mehr neu auf, springt nicht und steht oben.

### Live-Statistik: rechnet sie richtig?

Im Emulator angelegt: je ein Besucher auf Landing, Mënyra, Kamera, Nummer,
Warteseite, einer an der Kasse, einer von vor 5 Minuten und ein eigener Test.

- ✓ Landing +1, Mënyra +1, Fotot +1, Nummri +1, Patient +1
- ✓ der von vor 5 Minuten zaehlt nicht, der eigene Test zaehlt nicht
- ✓ wer an der Kasse steht, steht nicht zusaetzlich bei "Patient"
- ✓ Kauf: N'shport +1
- ✓ wer geht (letzte Aktivitaet 4 Minuten her), faellt nach 1,4 s heraus

Behoben: Die Reihe verglich nur Anzahlen. Ging einer und kam im selben
Augenblick ein anderer, blieb der Name darunter stehen. Jetzt zaehlt auch, WER.

## 4. Menue, Tag/Nacht, Knoepfe

- **Drei Eintraege:** Lifeskin · Mnyra (klappt auf: Start, Landing, Leads,
  Kunden, Ads, Staff, Orte, Mnyra GO, Analytics) · Einrichtung. In einem
  Mnyra-Bereich ist die Gruppe offen und nennt ihn ("Jetzt: Leads"). Die
  Bereiche und ihre Adressen (`#crmLeads` …) sind unveraendert.
- **Tag / Nacht:** Schalter in der Schublade, gemerkt auf dem Geraet
  (`localStorage["heart.theme"]`), gesetzt vor dem ersten Bild (kein
  Aufblitzen). Nacht ist der bisherige Stand. Der helle Farbsatz ist aus dem
  dunklen erzeugt (`scripts/heart-tag-farben.mjs`): Er gibt jede Regel mit einer
  Farbe in derselben Reihenfolge und Gewichtung noch einmal aus, feste dunkle
  Farben gespiegelt — so bleibt z. B. der gruene Hauptknopf gruen. Nach
  Farbaenderungen in `heart.css` neu laufen lassen.
- **Aktualisieren** dreht sich ab dem Tippen, bis geladen ist (mindestens
  0,65 s). Alle Knoepfe geben beim Druecken sichtbar nach
  (`touch-action: manipulation`, kein grauer Tippschatten).
- Service Worker: Cache `mnyra-heart-shell-v11`, `heart-morph.js` im Vorrat.

## 5. Pruefung

- `npm test`: alle gruen (neu: `tests/heart-schublade-tag-nacht.test.mjs`,
  Erweiterungen in `lifeskin-wege-robust`, `lifeskin-netz`).
- `lauf-wege.mjs`, `lauf-heart.mjs`, `lauf-morph.mjs`: siehe oben.
- `npm run build`, `npm run arch:check`, ESLint: siehe Abschlussbericht.
- Nicht geprueft: echte Geraete (iPhone/WebKit, Android-Apps von Instagram und
  Facebook), echte Firestore-Latenz, Heart mit den echten Daten.

## 6. Rueckweg

- Heart-Abgleich aus: `localStorage.setItem("heart.morph", "aus")` im Browser.
- Sonst: die Commits dieser Runde zuruecknehmen (`git revert`).

## 7. Naechste sinnvolle Schritte

- Am echten Android-Telefon in Instagram und Facebook den Scan oeffnen und in
  Heart die Zeile "Technik" lesen (siehe vorige Doku, Abschnitt 8).
- Heart laedt beim ersten Oeffnen weiter ALLE Sitzungen (mit 4000 Sitzungen
  auf gebremster CPU ~20 s, danach aus dem Geraetespeicher ~8–16 s). Auf Dauer
  gehoeren die Tageszahlen auf den Server (vorgerechnet), nicht in den Browser.
- Beim Nachladen per "Aktualisieren" verschwinden Faelle, die ein anderes Geraet
  geloescht hat, erst beim naechsten vollen Laden.
