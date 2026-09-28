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
   /lifeskin: Wahl (Scan/Foto/Trup-Pytje), Aufnahme, Fragen, Name, Nummer
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
- Foto: Anleitung, Kamera, Ausloeser, Foto uebernehmen, die vier Fragen mit
  Tipps, Name/Alter, Nummer (Lead), Uebergabe, Warteseite im Kleid des
  Ladens mit WhatsApp-Text "kontrollin e përputhjes"; zurueck in den Laden
  im selben Tab -> wieder die Warteseite.
- Trup: Name/Alter, Anliegen, Nummer (Lead), Warteseite wie oben.
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
