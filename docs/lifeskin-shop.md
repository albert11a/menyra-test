Status: CURRENT
Last updated: 2026-09-28

# LifeSkin Shop - /lifeskinshop

Auftrag (28.09.): Der Shop wird komplett - eigene Kasse statt Weiterleitung
auf /lifeskin2, "Gjeni setin për lëkurën tuaj" mit Lead wie auf den anderen
Wegen (getrennt gezaehlt, gleiche Funktionen), Pixel fuer alles Relevante,
Sets/Einzelmittel/Vorher-Nachher aus Heart pflegbar, eigenes Dashboard in
Heart.

## Feinschliff und Kundenmedien (28.09.)

Auftrag: Einleitung und aufgeklappte Produktdetails linksbuendig, gleiche
20-px-Seitenraender fuer die Beratungskarte, knapper Eignungstext vor Kauf.
Entwicklungshinweis Deutschland gemaess Inhaber, keine Herstellungsangabe.
Darunter Kundenfotos/-videos aus derselben Heart-Verwaltung wie Therapie:
aktiv, Reihenfolge, Produkt und Text werden uebernommen; Videos mit nativen
Controls, playsinline und preload none. Keine neuen Pixel-Ereignisse.

## Aktuelle Kampagne: nur Acne Duo (28.09., nachmittags)

Der Shop verkauft vorerst ausschliesslich das vollstaendige Set aus LF ACNE
und LF MOISTUR. Der markierte Auswahlblock wurde durch eine kompakte
Nutzen-/Wert-Erklaerung ersetzt: zwei aufklappbare Produktrollen, Inhalt und
Anwendungshinweis, 29 EUR Einzelpreis als Vergleich, 10 EUR Aufpreis fuer
das zweite Produkt im 39-EUR-Set und 19 EUR Gesamtersparnis. Keine neue
Wirkgarantie oder behauptete Conversion-Steigerung.

Heart bleibt fuer Hero-Bild und Set-Konfiguration zustaendig. Der Shop filtert
zusaetzlich auf genau diese zwei Produkt-IDs; andere Sets bleiben in Heart
bestehen. Einzelkauf ist hier nicht mehr sichtbar oder ausloesbar. Alte
Teil-/Fremdkoerbe werden geleert, vollstaendige Duo-Koerbe bleiben erhalten.
Entfernen eines Bestandteils entfernt das Set statt einen Einzelkauf zu erlauben.
Der doppelte grosse Produktblock und die Einzelprodukt-Karten entfallen.
Checkout, Analyse und Pixel-Aufrufzeilen bleiben unveraendert.

Pruefung: Shop-/Pixel-Sperrtests und npm run build; Bundle-Dateien unveraendert.
Kein echter mobiler In-App-Test und keine Produktionsbestellung.

Die folgende Ablaufbeschreibung dokumentiert auch den allgemeinen,
fuer spaetere Sortimentserweiterung erhaltenen Unterbau.

## Ablauf fuer den Kunden

1. **Laden** `/lifeskinshop`: Hero-Set, Vorher/Nachher (aus Heart, Ort
   "Shop"), Sets mit Filter nach Bedarf, Einzelmittel mit Fotos, FAQ.
2. **Direkt kaufen**: "Zgjidh këtë set" ersetzt den Korb durch das Set
   (eine Routine auf einmal), "29 € +" legt ein Einzelmittel dazu. Das
   Blatt von unten zeigt die Auswahl (ohne Felder) → "Vazhdo me porosinë".
3. **Kasse** = eigene Ansicht an der Stelle des Ladens (kein festes Fenster,
   keine Scroll-Sperre - sonst verrutscht die Seite auf dem iPhone nach der
   Tastatur): Zeilen, Summe nach Staffel, Name/Telefon/Adresse/Stadt,
   "Porositni" → Bestaetigung mit Bestellnummer. Bezahlt an der Tuer.
4. **"Zbuloni nëse seti ju përshtatet"** (`#ls-start`) → dieselbe Strecke wie
   /lifeskin, aber nur Scan und Foto (Trup/Pytje seit 29.09. weg), drei
   Fragen (die vierte seit 29.09. weg): Wahl, Aufnahme, Fragen, Name, Nummer
   (Lead), Warteseite `/analiza/<id>?weg=lifeskinshop` - im Kleid des
   Ladens, mit Tipps und der Përputhja von Dr. Gashi auf der Therapieseite
   (`docs/lifeskin-shop-perputhja.md`).

## Technik

- **Weg** `lifeskinshop` in `shared/lifeskin-weg.js`; die Seite traegt
  `<html data-ls-landing="lifeskinshop">`, die Sitzung `source.weg`.
  Keine Regel-Aenderung, kein Regel-Deploy. Seit dem 28.09. (abends)
  sprechen Trichter, Warteseite und Therapieseite fuer diesen Weg in
  eigenen Worten und im Kleid des Ladens, und die Therapieseite zeigt die
  Përputhja, die Dr. Gashi in Heart setzt - siehe
  `docs/lifeskin-shop-perputhja.md`.
- **Seite** `apps/lifeskin-shop/index.html`: der Laden als `#ls-einstieg`,
  darunter die Bildschirme der Analyse (kopiert aus
  `apps/lifeskin-landing/index.html`), `lifeskin-app.js` + `shop.js`.
  Stilblaetter: `lifeskin-styles.css`, `landing.css` (Analyse-Bildschirme),
  `shop.css` (auf `#ls-einstieg` begrenzt), `shop-rahmen.css` (Rahmen,
  Kasse, Faelle zum Wischen, Leiste unten oben verankert per 100dvh).
- **Laden** `apps/lifeskin-shop/shop.js` (Klasse `Dyqan`): Mittel und Fotos
  ueber `mittelBauen`/`holeSammlung` aus `apps/lifeskin-landing/shop.js`
  (dessen Selbststart haengt jetzt an `#rrjeta`), Sets aus
  `config/shopSetet` (+ `config/shopSetFoto-{id}`), Faelle ueber
  `shared/lifeskin-raste.js` mit Ort `shop` (ohne Angabe = wie Landing).
  Rueckweg ohne Firestore: die drei Sets und vier Mittel der Seite.
- **Bestellung** in dieselbe Sitzung wie der Besuch:
  `sitzung.schritt("ordered", { name, phone, address, order: { kind: "shop",
  burimi: "lifeskinshop", total, payment: "nachnahme", items, set, fbc/fbp } })`.
- **Service Worker**: `/lifeskinshop` und `/apps/lifeskin-shop` stehen in der
  Ausnahmeliste (sonst Social-Shell bei Netz-Aussetzern). Build entfernt
  Kommentare auch unter `apps/lifeskin-shop`.

## Pixel (Meta) und Conversions API

Pixel-Aenderung erlaubt von Albert (albert11a, Inhaber) am 28.09.2026:
"/lifeskinshop meldet AddToCart, InitiateCheckout, Purchase (Browser + CAPI)
und Lead wie die anderen Wege". `tests/lifeskin-pixel-sperre.test.mjs`
schliesst `apps/lifeskin-shop/shop.js` und `index.html` jetzt mit ein.

| Moment | Ereignis | Woher |
|---|---|---|
| Seite oeffnet | `PageView` (+ `lifeskin_landing_view`) | Trichter, wie /lifeskin |
| Set/Mittel in den Korb | `AddToCart` mit Betrag | `pixel.meldeKorb` |
| Kasse oeffnet mit Inhalt | `InitiateCheckout` mit Betrag | `pixel.meldeKasse` |
| Anschrift begonnen | Heart-Marke `adresseBegonnen` (kein eigenes Meta-Ereignis) | |
| Bestellung vom Server bestaetigt | `Purchase` (Browser) + CAPI-Purchase (Server) | `schritt("ordered")`, `functions/lifeskin-capi.js` |
| Nummer in der Analyse | `Lead` | Trichter, wie /lifeskin |

Im stillen Modus (`?still=1`) wird nichts gemeldet und nichts gezaehlt.

## Heart

- **Tab "Lifeskin Shop"** (`#lifeskinshop`): die Lifeskin-Ansicht mit den
  Faellen dieses Wegs - Kacheln, Live, alle Trichter (inkl. Kauftrichter
  Landing → Produkte → Warenkorb → Anschrift → Kauf), Faelle, Bestellungen,
  Links ohne Stats, eigene Tests. Oben neu: **"Shop · vom Besuch bis zum
  Kauf"** (Shop → angesehen → AddToCart → InitiateCheckout → Anschrift →
  Purchase), Umsatz, Ø Bestellung, Ø Warenkorb, Kauf je Besuch, was gekauft
  wurde (je Set / Einzelmittel), und die Analyse "Gjeni setin" → Lead →
  abgegeben. Die anderen Tabs zeigen Shop-Faelle nicht.
- **Shop-Sets** (Mehr anzeigen): anlegen, bearbeiten, Foto, Produkte,
  Bedarf (Filter), Schild, Texte, im Shop an/aus, Reihenfolge, loeschen.
- **Einzelmittel**: Karte "Produkte" (Name, Preis, Sichtbarkeit, Bilder der
  Landingpage) - dieselben Mittel wie im Laden auf /lifeskin.
- **Vorher/Nachher**: Karte "Ergebnisse", neuer Ort **Shop**.

## Pruefung

- `npm test`: alle gruen, neu `tests/lifeskin-shop.test.mjs`.
- Browser (Chromium, iPhone-13-Groesse, Firestore/Meta abgefangen, keine
  echte Bestellung): Set → AddToCart, Kasse → InitiateCheckout, Anschrift,
  Porositni → Purchase; Sitzung mit `source.weg = lifeskinshop`, allen
  Marken und `order`; "Gjeni setin" → Wahl, zurueck → Laden.
- Nicht geprueft: echtes iPhone/Instagram, echte Bestellung in Firestore,
  Heart im Browser (Anmeldung). Vor dem Schalten der Anzeige am Telefon
  pruefen: eine Bestellung im stillen Modus, in Heart ansehen, loeschen.

## Rueckweg

`git revert` der Commits. Keine Regel-, Sammlungs- oder Routen-Entfernung.

## Titelbild (Heart, zuschneidbar)

Heart -> Lifeskin Shop -> Mehr anzeigen -> "Shop-Titelbild": Bild wählen,
im Rahmen 7:5 verschieben und zoomen, speichern. Ablage:
`lifeskin/{tenant}/config/shopHero { foto: "data:image/jpeg..." }` (1400 px
breit, höchstens ~450 KB). Der Shop (`Dyqan.titelbild()`) tauscht das Bild
nach dem Dekodieren und gibt dem Rahmen `data-eigen` (aspect-ratio 7/5).
"Standardbild" löscht das Dokument, dann gilt wieder `lf-acne-2.jpg`.
Zuschneiden: `apps/mnyra-heart/heart-lifeskin-schnitt.js`.

## Ladezeit und Pruefung aller Wege (28.09. spaet)

Auftrag: alle Wege von /lifeskinshop pruefen (keine Fehler) und so schnell
wie /lifeskin.

**Ladereihenfolge (`Dyqan.laden()`).** Vorher liefen Produkte (~0,9 MB) und
Landing-Fotos (~1 MB) gleichzeitig mit allem anderen; Set-Foto und
Vorher/Nachher direkt unter dem Titelbild kamen auf 1,6 Mbit/s erst nach
ueber 13 s. Jetzt: Kundenmedien sofort, dann Set-Dokument und Faelle
(klein), dann das Titelbild (hoechstens 6 s gewartet), dann Set-Fotos und
Fallbilder, zuletzt Produkte und Landing-Fotos. Die Sets werden zweimal
gezeichnet (erst mit dem Katalog, dann mit den Mitteln aus Heart); kaufen
laesst sich von Anfang an.

**Titelbild.** Beim zweiten Besuch steht das gemerkte Bild schon beim ersten
Zeichnen da (Einzeiler im Rahmen `.hero-photo`, `localStorage`
"lifeskin:shopHero"). Nachgefragt wird nur der Stempel
`config/shopHero?mask.fieldPaths=updatedAt` (ein paar Bytes statt ~400 KB),
und das schon im Kopf der Seite (`window.__lsTitelbild`, gleiche Adresse wie
`HERO_ADRESSE + HERO_NUR_STAND`, geprueft in
`tests/lifeskin-shop-weg.test.mjs`). Neuer Stempel -> ganzes Bild, tauschen,
merken; 404 -> Standardbild. Den Stempel setzt Heart beim Speichern
(`speichereShopHero`); ein Bild ohne Stempel wird wie bisher ganz geholt.
Beim ersten Besuch fragt der Kopf nichts: Das ganze Bild so frueh nahm dem
Trichter die Leitung.

**Gemessen** (Pruefstand: gebauter Stand wie auf Vercel, Firestore-Attrappe
mit echt grossen Bildern, Headless-Chromium 390x844, 150 ms / 1,6 Mbit/s /
CPU 4x gedrosselt, ohne Cache, Median aus 3):

| | /lifeskin | /lifeskinshop |
|---|---|---|
| Erstes Bild (FCP) | 1,95 s | 0,71 s |
| Groesstes Bild (LCP) | 2,49 s | 1,90 s |
| Trichter bereit | 1,95 s | 2,00 s |
| Start -> Wahl | 66 ms | 54 ms |
| Titelbild aus Heart | - | 4,2 s (vorher 7,9 s) |
| Layout-Sprung (CLS) | 0 | 0 |
| Zweiter Besuch FCP / LCP | 1,9 s / 2,45 s | 0,64 s / 0,67 s (Heart-Bild sofort) |

**Durchgespielt** (gleicher Pruefstand, Pixel nur in `fbq.queue`, nichts an
Meta; Kamera ist das Testbild von Chromium):

- Direktkauf: PageView + lifeskin_landing_view, Set -> AddToCart(39), Kasse
  -> InitiateCheckout(39), Porositni -> Purchase(39) und `order` in der
  Sitzung; Danke-Text.
- Foto: Anleitung, Kamera, Ausloeser, Foto uebernehmen, die vier Fragen (seit
  29.09. drei) mit Tipps, Name/Alter, Nummer (Lead), Uebergabe, Warteseite im Kleid des
  Ladens mit WhatsApp-Text "kontrollin e përputhjes"; zurueck in den Laden
  im selben Tab -> wieder die Warteseite.
- Trup: Name/Alter, Anliegen, Nummer (Lead), Warteseite wie oben (seit
  29.09. nicht mehr im Laden).
- Scan: bis zur Kamera (braucht ein echtes Gesicht und MediaPipe von
  jsdelivr, im Pruefstand gesperrt).
- Freigabe nachgespielt (Bericht `fertig`, `perputhja` 92): Die Warteseite
  springt selbst auf die Therapieseite, Block mit 92 %, AddToCart bei Sicht
  des Preises, InitiateCheckout, Purchase.
- Zurueck-Taste des Handys und Zurueck-Knopf im Trichter: Wahl -> Einstieg,
  Foto-Anleitung -> Wahl, Name -> Wahl, Einstieg -> verlaesst die Seite.
- Alle stillen Links aus Heart (Tab Lifeskin Shop, 19 Stueck): richtiger
  Bildschirm, kein Schreibvorgang, kein Pixel, kein Beacon; `?still=0`
  schaltet aus.
- Dasselbe auf /lifeskin zum Vergleich: gleiche Ablaeufe, keine Fehler.
- Keine JS-Fehler. Kein Playwright-Testlauf; nicht geprueft: echtes
  iPhone/Android, Instagram-Fenster, echte Bestellung in Firestore.

**Neuladen nach einem Kauf im Laden** (auch auf /lifeskin): Der Laden setzt
"ordered", ohne dass es einen Bericht gibt. Wer danach im selben Tab neu
lud, zurueckging oder aus Instagram zurueckkam, sprang auf `/analiza/<id>`
und sah "Ky rast nuk u gjet". Jetzt fuehrt nach einer Bestellung nur ein
angelegter Bericht dorthin (`Sitzung.fortsetzbar()`, Marke `bericht` im
sessionStorage-Eintrag, gesetzt von `berichtAnlegen()`); der Kunde sieht
wieder den Laden. Pixel: keine Zeile geaendert, Sperrtest gruen - aber wer
nach dem Kauf neu laedt, meldet jetzt wie jeder Landing-Besuch PageView +
lifeskin_landing_view (die kaputte Warteseite meldete gar nichts).
Erlaubt vom Inhaber (Albert) am 28.09.2026 - erst danach auf main.

**Entscheidungen des Inhabers (28.09. spaet):**

- Kein Deploy von `lifeskinCapiPurchase`: Die Aenderung aus 985e6d4
  (Bestellungen aus dem stillen Modus nicht an Meta) steht im Code, laeuft
  in Firebase aber noch in der alten Fassung. Eine Testbestellung im
  stillen Modus ginge dort weiter als Kauf an Meta.
- Kein automatischer erweiterter Abgleich im Events Manager und keine
  Kundendaten (Telefon, Name, Stadt) in der Conversions API.

**Offen (nicht geaendert):**

- Mehrere Bestellungen im selben Tab stehen in EINER Sitzung: Jede weitere
  ueberschreibt `order` der vorigen (auch auf /lifeskin), und Purchase/CAPI
  und die Meldung kommen nur fuer die erste. Loesung waere eine eigene
  Sitzung je Bestellung - das aendert Purchase/CAPI und braucht die
  Erlaubnis des Inhabers (Meta-Pixel-Sperre).
- Zurueck-Taste mit offenem Set-Blatt oder offener Kasse verlaesst die
  Seite, statt nur zu schliessen - auf /lifeskin (Produktblatt, Korb)
  genauso.
- Die WhatsApp-Vorschau (`og:title`) von /analiza und /terapia heisst fuer
  alle Wege "Analiza juaj e lëkurës · LifeSkin"; der Seitentitel selbst ist
  neutral ("Rasti juaj", "Terapia juaj"). Eine Aenderung traefe auch
  /lifeskin.

## Karte "Shop" in Heart: neu geordnet (04.10.)

Wunsch Inhaber: acht Abschnitte in der Reihenfolge der Seite. "Dërgesa" und
"Fundi" fallen weg, "Mesazhe" und "Garancioni" stehen fuer sich.

| Nr | Name | Abschnitt auf der Seite | Feld in `timings.shop` |
|---|---|---|---|
| 1 | Puçrrat | Titelbild "Largo puçrrat." | `pucrrat` |
| 2 | Para - Pas | `#rezultate` | `paraPas` |
| 3 | Mesazhe | `#klientet` "Mesazhe origjinale" | `mesazhe` |
| 4 | Dy produkte | `#setet` | `produkte` |
| 5 | SkinReact | `#zgjedhja` | `skinreact` |
| 6 | Garancioni | `#garancia` (45 ditë garanci) | `garancia` |
| 7 | Instagram | `.social-presence` | `instagram` |
| 8 | F.A.Q | `.faq` | `faq` |

Unter **5 SkinReact** steht eine Unterzeile **"Fillo skanim"**: wie viele
den Knopf "Fillo skanimin" gedrueckt haben (`source.scanWorkflow =
"skinreact"`). Sie ist keine eigene Stufe der Reihe "bis hierher".

Danach unveraendert der Kauf, jetzt **9 Shport, 10 Arka, 11 Adresa,
12 Gotat Nalt**.

**Version 2:** gespeichert wird unter der Kennung (Tabelle), nicht mehr
unter `sN`. Alte Felder (Version 1, `s1`-`s9`) liest `shopTiefe()` in die
neuen Nummern um: s1→1, s2→2, s3→4, s4→5, s5→3, s6→6, s7→7, s8→8, s9→8.

Der Rest dieses Abschnitts beschreibt die Fassung vom 29.09.

## Karte "Shop" in Heart: Abschnitt fuer Abschnitt (29.09.)

Wunsch Inhaber: klare Schritte von oben bis ganz unten auf der Seite, kurze
Namen, je Zeile ein kleiner Kreis mit der Nummer, der Name, ein Balken und
die Zahl. Alle Balken beginnen an derselben Stelle und messen an den
Shop-Besuchern (1). Der Hinweis "Gezaehlt ab ..." ist weg (gezaehlt wird
weiter ab dem Zaehlbeginn).

**Seite (1-9)**, gezaehlt "bis hierher" - wer bis 5 kam, zaehlt auch bei 1-4:

| Nr | Name | Abschnitt auf der Seite |
|---|---|---|
| 1 | Acne duo | Titelbild (jeder sichtbare Besuch) |
| 2 | Para - Pas | `#rezultate` "Shihni ndryshimin" |
| 3 | Informata | `#setet` "Kujdes për aknet" |
| 4 | SkinReact | `#zgjedhja` "A është ky set për ju?" |
| 5 | Postimet | `#klientet` "LifeSkin në përditshmëri" |
| 6 | Dërgesa | `#rutina` "Nga zgjedhja te dera juaj" |
| 7 | Instagram | `.social-presence` "Njihuni me ne" |
| 8 | F.A.Q | `.faq` "Qartë, që në fillim" |
| 9 | Fundi | `.closing` "Një fillim më i qartë" |

**Kauf (10-13)**, eigene Reihe unter einem Strich: 10 Shport (in den Korb),
11 Arka (Kasse offen), 12 Adresa (Anschrift begonnen), 13 Gotat Nalt
(bestellt). Getrennt gezaehlt, weil wer oben auf "Porosit setin" tippt und
kauft, nie bei "Fundi" war.

**Messung:** Der Laden (`Dyqan.#beobachten`) schreibt je gesehenen Abschnitt
`timings.shop.sN = true` (+ `v`) in die Sitzung - gesehen heisst wie auf
/lifeskin: mindestens 40 % des Fensters oder die Haelfte des Abschnitts im
Bild (`schirmGesehen`). Erst wenn der Trichter die Sitzung angelegt hat;
im stillen Modus nichts. `timings` ist in firestore.rules eine offene
Karte: keine neue Regel. Kein Pixel. Heart liest die Tiefe aus den Feldern
(`shopTiefe`, `shared/lifeskin-shopsicht.js`); Besuche von vor der Messung
zaehlen mit `produkteGesehen` bis 3, sonst bei 1.

Namen wie vom Inhaber, drei Schreibweisen angeglichen: "Skinract" ->
"SkinReact", "Dergesa" -> "Dërgesa", "instagram" -> "Instagram".

**Noch offen:** 14-16 (Kontrolle gestartet, Nummer, abgegeben) bekommen
eine eigene Karte; bis dahin steht dort der bisherige Block
"„Gjeni setin“ · Analyse".

## Chips der Karte "Shop": Shop, Scan, Foto, Analyse (29.09.)

Wunsch Inhaber: vier Chips, je Chip ein Weg Bildschirm fuer Bildschirm im
selben Aufbau (Kreis mit Nummer, Name, Balken, Zahl - der Kreis 18 px, nur
die Ziffern darin klein und schmal; die Namensspalte fuer alle Chips gleich
breit). Am Chip die Zahl bei Punkt 1. Gezaehlt "bis hierher"; Balken am
Punkt 1 des Chips.

Die Chips stehen IN der Karte, ganz oben; einen Titel hat die Karte nicht
mehr (er steht nur noch als `aria-label` fuer Vorleseprogramme). Die Chips:
eine Reihe, 32 px hoch, Ecken 6 px; der gewaehlte ruhig - etwas heller als
die Karte, weisse Schrift, deutlicherer Rand, nicht das Gruen der Kreise.
Wird eine Zahl lang, rollt die Reihe.

Zuklappen per Doppeltipp wie bei den Kacheln (`heart-doppeltipp`,
heart-events.js): Zu bleibt eine schmale Zeile "Shop 19 · Scan 4 · Foto 0 ·
Analyse 0" mit dem Pfeil; ein Tipp darauf klappt auf. Ein Doppeltipp auf
einen Chip klappt nicht zu. Gemerkt wird es wie jede Karte (`shopweg`).

Alle vier Chips gleich hoch: Die vier Ansichten liegen uebereinander in
derselben Zelle (`.heart-shopansichten`), sichtbar nur die gewaehlte. Die
Karte ist so hoch wie die laengste (Shop mit Umsatz-Zeilen); unter Scan
und Foto bleibt dafuer unten etwas frei.

**Scan** (nur wer Scan gewaehlt hat, ohne Laden-Kaeufe - deren Schritt steht
auf "ordered"): 1 Anleitung (named) · 2 Scan akzeptiert (kameraOk) ·
3 Scan gestartet (`timings.weg.bildDa`: das Kamerabild ist da) · 4 Scan
fertig (captured) · 5-7 Frage 1-3 (pyetja1-3) · 8 Name + (emri) · 9 Nummer
(numri) · 10 Nummer Feld (`timings.weg.nummerGetippt`: erste Ziffer im Feld;
aeltere Besuche: Nummer vorhanden) · 11 Loading (aufbereitung) · 12 Loading
fertig (result - erst, wenn der Bericht steht) · 13 Patient (Warteseite).
3 und 4 zeigen Fehler: akzeptiert, aber kein Bild; Bild, aber nicht fertig.

**Foto**: gleich, ausser 1 Anleitung (fotopara), 2 Foto akzeptiert, 3 Foto
gestartet, 4 Foto fertig (fotogati). "Foto akzeptiert" faellt jetzt schon,
wenn die Kamera freigegeben ist (`beiStrom`, lifeskin-foto.js) - wie beim
Scan; vorher erst mit dem Bild, dann waeren 2 und 3 immer gleich gewesen.

**Analyse** (wer die Analyseseite geoeffnet hat): 1 Përputhja (#terapia) ·
2 Gjetjet (#pse) · 3 Pakoja (#merrni) · 4 Ndjekja (#ndjekja oder #ditet) ·
5 Para - Pas (#rezultate) · 6 Oferta (#vendimi) · 7 F.A.Q (#pyetjet) ·
8 Detajet (#analiza) · 9 Fundi (#ndaje oder #instagram); dann 10 Shport
(ein Kaufknopf der Analyseseite gedrueckt, `timings.kauf.knopf` - oder die
Kasse war offen) · 11 Arka · 12 Adresa · 13 Gotat Nalt - nur,
was auf der Analyseseite geschah (`timings.kauf`, sonst alte Marken ohne
Laden-Korb). Gemessen von der Analyseseite im Kleid des Ladens
(`timings.terapia.sN`, gesehen wie im Laden, nie in der Vorschau);
aeltere Besuche: berichtGeoeffnet 1, sahSchnitt 2, sahTherapie 3.

Nur den Preis gesehen ist KEIN Warenkorb (Rueckfrage Inhaber 29.09.) - und
seit dem 29.09. abends auch fuer Meta nicht mehr (Pixel-Aenderung erlaubt von
Albert am 29.09.2026). Die Analyseseite hat jetzt einen WARENKORB WIE DER
LADEN: Jeder Kaufknopf oeffnet das Blatt "U shtua në shportë" (nur "Vazhdo
me porosinë", kein "Vazhdo blerjet"), erst dieser Knopf die Kasse.
Meta: AddToCart beim Knopf, InitiateCheckout bei der Kasse, Purchase nach
dem Speichern. Heart: der Knopf (`timings.kauf.knopf`, auch in der
klassischen Fassung) zaehlt in der Kachel "Warenkoerbe" (Setpreis), als
Punkt 10 "Shport" und in Live bei N'shport; Arka erst mit der Kasse.

**Live im Tab Lifeskin Shop: drei Reihen** (29.09., Wunsch Inhaber - "so
haben wir kein Mismatch"). Die anderen Tabs behalten Live · Analyse und
Live · Kauf.

- **Live · Shop:** Landing · N'shport (Korb im Laden) · Adresa (Kasse des
  Ladens, offen oder beim Tippen) · Gotat (im Laden bestellt).
- **Live · Trichter:** Mënyra · Fotot · Pyetjet · Nummri · Patient.
- **Live · Analyse:** Analyse (liest die Ergebnisseite) · N'shport
  (Warenkorb der Ergebnisseite) · Adresa (Kasse dort) · Gotat (dort bestellt).

Jede Seite schreibt ihren eigenen Live-Stand (`timings.live`), daran steht
jeder in genau einem Punkt: Laden `offer` / `kasa` / `ordered` mit
`order.kind "shop"`; Trichter seine Schritte; Ergebnisseite `fertig` /
`shporta` / `porosia` / `address` / `ordered`. Ohne Stand: Landing, oder bei
Besuchen von vorher die Marken des Ladens. Rechnung:
`heart-lifeskin-live.js` (`liveOrtShop`, `baueLiveShop`). Der Rand blinkt,
sobald jemand bei N'shport, Adresa oder Gotat steht.
Bis 29.09. mittags stand Punkt 10 kurz auf "Preis gesehen" (erst "Shport",
dann "Çmimi"). Pruefbericht: docs/lifeskin-kaufwege-pruefung-2026-09-29.md.

Die neuen Marken stehen unter `timings` (offene Karte in firestore.rules):
keine neue Regel, keine neue Stufe, kein Pixel. Im stillen Modus nichts.

**Unten im Tab Lifeskin Shop** nur noch die Trichter Kauf und Bericht:
Main, Skanim, Foto, Trup/Pytje und Landing stehen jetzt in den Chips; Gati
hing an Frage 4, die es im Laden nicht mehr gibt. Die anderen Tabs
unveraendert.

**Pixel:** keine Zeile geaendert, Sperrtest gruen. Mit dem Weg Trup/Pytje
fallen im Laden dessen eigene Ereignisse weg (lifeskin_method_body,
lifeskin_body_problem_completed, lifeskin_question_completed) - vom
Inhaber so gewuenscht. Frage 4 hatte kein eigenes Ereignis.

## Trichter kuerzer, Nummer-Seite neu, Antwortzeit aus Heart (29.09. mittags)

Wunsch Inhaber, mit Handybildern des Ladens.

**Nur im Laden (/lifeskinshop):**

- Kein Schild "Pa detyrim" oben rechts - im ganzen Trichter nicht (es
  stand nur auf der Wahl).
- Foto-Anleitung mit drei Regeln: Dritë e mirë, Foto e qartë, Fotografoni
  afër problemit. Weg: "Pa makeup ...", "Mos përdorni filter" und die Karte
  "KËSHILLË PËR FOTON".
- Keine Karte "Fotoja u ruajt ✓ 3 pyetje ..." ueber der ersten Frage (die
  Seite hat kein `#ls-frageneinleitung` mehr; der Trichter laesst den Satz
  dann weg).
- Frage 1 ohne "Shkëlqimi" und ohne "Nuk e di" (`wege.lifeskinshop.ohne`,
  frageFuerWeg). Die Kennungen bleiben im Vorrat - Heart und Prompt lesen
  alte Antworten wie immer.
- Frage 3 heisst "Çka keni provuar deri tani?".

**/lifeskin und Laden:**

- Namensschirm: "Faleminderit! Pothuajse keni mbaruar." statt "Edhe dy
  gjëra dhe keni mbaruar." - danach kommt noch die Nummer, das muss er
  nicht wissen. Gilt auch fuer die Saetze nach Scan und Foto ohne Fragen
  und auf den Seiten, die denselben Text teilen (/lifeskin2,
  /lifeskintrichter).
- Nummer-Seite (nur /lifeskin und Laden; /lifeskin2 und /lifeskintrichter
  behalten ihre Fassung): HAPI I FUNDIT · "Arta, merrni rezultatin tuaj
  nga Dr. Violeta Gashi" · Karte mit Foto und Aerztin: "Fotoja dhe
  përgjigjet tuaja janë ruajtur." (Scan: "Fotot ...", ohne Bild: "Të
  dhënat tuaja ...") und "Dr. Violeta Gashi do t’i shqyrtojë personalisht
  dhe do t’jua dërgojë analizën në WhatsApp." · die Antwortzeit · "Numri
  juaj i WhatsApp-it" · Feld · drei Haken (Pa telefonata / Vetëm për
  analizën tuaj / Numri juaj mbetet privat) · Knopf "Përfundo →" (ohne
  WhatsApp-Zeichen, auch bei Viber). Im Laden ohne "Analyse": "... do t’jua
  dërgojë përqindjen e përputhjes në WhatsApp." und "Vetëm për rezultatin
  tuaj".

**Antwortzeit (shared/lifeskin-antwortzeit.js):** In Heart ein runder
Uhr-Knopf links neben dem Datum (Lifeskin-Uebersicht), angetippt eine
Chipreihe wie beim Datum: Auto, 10 Min, 20 Min, 30 Min, 1 Std, Heute,
Heute Abend, Morgen früh, Morgen. Gespeichert in
`lifeskin/lifeskin/config/antwortzeit { wahl, gesetztAm }` (config: lesen
jeder, schreiben nur CEO - keine neue Regel). Nummer-Seite und Warteseite
zeigen dieselbe Zeile: "Përgjigja brenda 20 minutave", "Përgjigja sot",
"Përgjigja sot në mbrëmje", "Përgjigja nesër në mëngjes", "Përgjigja nesër".
Auto oder nie gesetzt: die alte Regel der Warteseite (vor 18 Uhr "sot",
danach "nesër në mëngjes"). Heute/Heute Abend/Morgen früh/Morgen gelten nur
am Tag, an dem sie gesetzt wurden (Uhrzeit Kosovo) - am naechsten Tag
waere "nesër" falsch, dann wieder Auto. Minuten und Stunde gelten, bis sie
geaendert werden. Geholt wird die Einstellung, sobald die Fragen beginnen
(hoechstens 4 s, auf der Warteseite 3 s); kommt nichts, gilt Auto.

**Pixel:** keine Zeile geaendert, Sperrtest gruen; der Foto-Weg meldet auf
beiden Seiten dieselben Ereignisse wie vorher (Pruefstand).

**Geprueft:** npm test, Build, Pruefstand (Headless-Chromium 390 px, Foto-Weg
auf /lifeskinshop mit "20 Min" und auf /lifeskin mit "Morgen früh" bis zur
Warteseite), Heart-Kopf als Bild (zu und mit offener Uhr-Reihe). Kein
echtes Handy, Heart nicht angemeldet geoeffnet.
