Status: CURRENT
Last updated: 2026-09-29

# /lifeskinshop - Conversion-Analyse (kalter Traffic FB/IG, Kosovo + Albanien)

Nur Analyse, keine Code-Aenderung. Pixel/CAPI nicht angefasst.

## Wie geprueft

- Live-Seite `https://www.mnyra.com/lifeskinshop?still=1` (stiller Modus:
  keine Zaehlung, kein Pixel, Meta-Domains zusaetzlich blockiert, keine
  Schreibzugriffe).
- Headless Chromium mit Telefon-Emulation: 390 x 844 px (iPhone 13/14),
  Touch, iPhone-UA mit Facebook-In-App-Kennung; zweiter Lauf mit
  Android-FB-In-App-UA. KEIN echtes Geraet - echtes iPhone/Android im
  FB-Browser bleibt als Gegenprobe offen.
- Klickweg: Hero-Knopf -> Korb-Blatt -> Kasse -> leeres Absenden. Keine
  Bestellung abgeschickt.
- Keine Produktionsdaten gelesen (Heart-Zahlen muss der Inhaber ablesen).

## Gemessene Fakten

| Messung | Wert |
|---|---|
| Seitenhoehe | 4589 px = 5,4 Bildschirme |
| Woerter im Laden | 446 |
| Erstes Vorkommen von "akne" | y = 547 px, 10 px Schrift ("SETI KUNDËR AKNEVE") |
| Hero-Knopf "Porosit setin — 39 €" | y = 625 px (im ersten Bildschirm, gut) |
| Garantie "45 ditë garanci" | nur in der Kasse, nirgends im Laden |
| Kasse: Knopf "Porositni" | unterhalb des ersten Bildschirms (ohne Tastatur) |
| Daten beim Besuch (15 s, ohne Tipp auf Analyse) | 19,5 MB, davon 11,5 MB MediaPipe-WASM + 3,7 MB Gesichtsmodell + 0,5 MB JS |
| Vorher/Nachher-Faelle | 8 (8 Punkte), Ueberschrift sagt "Në një rast konkret" |
| Kundenstimmen | 5; 3 davon englisch; eine mit Produkt "LF ACNE + LF M687" |
| Schriftgroessen Vertrauenszeilen | 10-11 px (Lieferung/Zahlung, "SETI KUNDËR AKNEVE", Notiz unter Dr. Gashi) |

## Recherche (Quellen)

- Baymard, Kaufabbrueche (50 Studien, 70,22 %): Zusatzkosten 40 %,
  Lieferung zu langsam 20 %, kein Vertrauen 19 %, Checkout zu lang 17 %,
  Rueckgabe unklar 13 %, Gesamtpreis nicht sichtbar 12 %.
  https://baymard.com/lists/cart-abandonment-rate
- NN/g: Nutzer lesen hoechstens 28 % der Woerter, eher 20 % (F-Muster).
  Bei 446 Woertern: ca. 90-125 Woerter werden gelesen -> Ueberschriften,
  Hero und Knopftexte entscheiden.
  https://www.nngroup.com/articles/how-little-do-users-read/
- Spiegel Research Center: 5 Bewertungen -> +270 % Kaufwahrscheinlichkeit
  gegenueber 0; danach abnehmender Nutzen; Optimum bei 4,0-4,7 Sternen.
  https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/
- Baymard DTC/Beauty: fehlende Inhaltsstoffe -> Produkt wird verworfen.
  https://baymard.com/blog/product-descriptions
- Google/SOASTA: Ladezeit 1 s -> 3 s = +32 % Absprung, 1 s -> 5 s = +90 %.
- Albanien: Nachnahme ca. 78 % der Online-Bestellungen; Kosovo ca. 75 %
  aller Transaktionen bar (Weltbank). Nachnahme ist also Pflicht - und
  gehoert ganz nach oben (steht schon da, gut).
- Kaufkraft: Kosovo Netto-Durchschnitt 636 €/Monat (2025), Albanien ca.
  735 € netto. 39 € = ca. 5-6 % eines Monatslohns -> Kauf wird ueberlegt,
  Risiko-Umkehr (Garantie + Nachnahme) zaehlt mehr als in DE.
- AAD zu Benzoylperoxid: erste Besserung ca. ab Woche 3, volle Wirkung
  8-12 Wochen -> passt genau zu "45 ditë garanci" und zu "Pas 4 javësh".

## Massnahmen, nach Wirkung sortiert

Kennzeichnung: [Pixel-frei] = beruehrt keinen Pixel-Aufruf.
[PIXEL - Erlaubnis noetig] = aendert Zeitpunkt/Ereignis, nur nach
ausdruecklicher Erlaubnis (AGENTS.md, Meta-Pixel-Sperre).

### 1. Kasse: Bestellknopf in den ersten Bildschirm [Pixel-frei]
Gemessen: Warenkorb-Zusammenfassung (2 Zeilen a ca. 110 px + Sparbox)
schiebt Formular und Knopf nach unten; "Porositni" ist ohne Scrollen nicht
sichtbar, mit offener Tastatur noch weiter weg. Vorschlag: Zusammenfassung
auf eine kompakte Zeile (ein Bild, "LF ACNE + LF MOISTUR · 39 €"), dann die
4 Felder, dann Knopf; Vertrauenszeile (Falas · Te dera · 45 ditë garanci)
direkt UEBER den Knopf. Die 4 Felder unbedingt behalten (Baymard-Mittel:
ca. 11 Felder - 4 ist hervorragend).

### 2. Garantie im Laden zeigen [Pixel-frei]
Heute nur in der Kasse. Einbauen: Leiste oben "Paguani kur merrni pakon ·
45 ditë garanci", Zeile unter Hero-Knopf, eine FAQ-Frage mit dem Text aus
`shared/lifeskin-garancia.js` (permbledhje). Adressiert Baymard 19 % + 13 %.

### 3. Hero: Problem nennen, Animation weg [Pixel-frei]
"Lëkura juaj. Rutina juaj." sagt kalten Besuchern nicht, wofuer. Die
Wechselanimation zeigt mitten im Wechsel beide Woerter uebereinander
(Screenshot). Vorschlag (statisch):
- Eyebrow: "SETI KUNDËR AKNEVE · DR. VIOLETA GASHI"
- H1: "Më pak puçrra. Lëkurë më e qetë."
- Unterzeile: "LF ACNE pastron poret. LF MOISTUR e mban lëkurën të hidratuar."
- Trust-Zeile 13 px statt 11 px: "Dërgesa falas · Paguani te dera · 45 ditë garanci"
- Preis: "~~58 €~~ 39 €" (durchgestrichen statt "Veçmas 58 €")

### 4. Produkttext: echte Antworten statt Platzhalter [Pixel-frei]
Heute: "Ndiqni udhëzimet e produktit" = keine Antwort. Auf den Flaschen
steht Benzoyl Peroxide 5 % bzw. Hyaluronic acid & Ceramides - im Text
nicht. Pro Produkt 3 Zeilen, aufgeklappt oder als Liste statt `<details>`:
Wirkstoff, Anwendung (morgens/abends, wie viel), Hinweis "anfangs kann die
Haut trocken sein - dafuer ist LF MOISTUR". Dazu: Wie lange reichen 30 ml?
Wann sieht man etwas (ab ca. Woche 3-4)? -> Angaben muss der Inhaber
liefern, nichts erfinden.

### 5. Vorher/Nachher ehrlich groesser machen [Pixel-frei]
8 Faelle, Text sagt "ein Fall". Neu: "8 raste reale. Para dhe pas 4
javësh." und Intro "Fotografi nga klientët tanë, pa filtra." Der Abschnitt
steht richtig (zweiter Bildschirm).

### 6. Kundenstimmen fuer KS/AL glaubwuerdig [Pixel-frei, in Heart]
3 von 5 Texten englisch, ein Tippfehler ("LF ACNE + LF M687"), "LF
MOISTURE" neben "LF MOISTUR", keine Namen/Orte. Fuer albanische Kaeufer
wirkt Englisch importiert. In Heart: albanische Zitate, Vorname + Stadt
("Arta, Prishtinë"), Tippfehler korrigieren. Ueberschrift "LifeSkin në
përditshmëri" -> "Çfarë thonë klientët". Nur echte Stimmen.

### 7. Ausgaenge schliessen [Pixel-frei]
- Instagram-Block (2 grosse Karten mitten auf der Seite) fuehrt kalte
  Besucher weg; steht im Footer ohnehin. Block entfernen oder in den Footer.
- Korb-Blatt: "Vazhdo blerjet" - es gibt nichts anderes zu kaufen. Knopf
  weg, stattdessen Garantiezeile.

### 8. 15 MB Kamera-Vorladen auf dem Laden abschalten [Pixel-frei]
`lifeskin-app.js #netzAufDerLanding` laedt nach dem Laden MediaPipe +
Modell fuer JEDEN Besucher, auch wenn er nur kaufen will. Auf mobilem
Datenvolumen (KS/AL, FB-In-App) konkurriert das mit den Bildern und kostet
den Nutzer Daten. Fuer `data-ls-landing="lifeskinshop"` nur nach Tipp auf
"Zbuloni" laden (`#netzVormerken` existiert schon). Mittelfristig: Bilder
nicht als base64 in Firestore-JSON (1 MB-Dokument, je ca. 300 KB,
nicht CDN-cachebar).

### 9. FAQ um die echten Kauffragen [Pixel-frei]
Fehlt: "Sa shpejt vjen pakoja?" (Lieferzeit - Baymard 20 %),
"Po nëse nuk më ndihmon?" (Garantie), "A është për lëkurë të ndjeshme?",
"Sa zgjat një set?", "Kush qëndron pas LifeSkin?" (Dr. Gashi). Antworten
kurz, mit Zahlen. Lieferzeit auch als Zeile unter den Hero-Knopf.

### 10. Kasse: Eingabehilfen [Pixel-frei]
Telefon: Platzhalter "p.sh. 044 123 456" / "069 123 4567"; Adresse:
"Rruga, numri ose një pikë orientimi". Fehlermeldung zusaetzlich direkt
unter dem ersten leeren Feld.

### 11. Schrift und Reihenfolge [Pixel-frei]
- Vertrauenszeilen von 10-11 px auf mind. 13 px.
- Reihenfolge fuer kalten Traffic: Hero -> Vorher/Nachher -> Set mit
  Wirkstoffen -> Kundenstimmen -> Dr. Gashi (kleiner, Autoritaet statt
  zweitem Ziel) -> FAQ -> Abschluss. Instagram raus.
- Dr. Gashi als Autoritaet zusaetzlich klein im Hero nennen.

### 12. Korb-Blatt ueberspringen, direkt zur Kasse [PIXEL - Erlaubnis noetig]
Ein Produkt, ein Knopf - das Blatt ist ein Klick mehr. Direkt zur Kasse
wuerde aber InitiateCheckout vom zweiten auf den ersten Klick verschieben
(AddToCart bliebe gleich). Nur mit Vermerk "Pixel-Aenderung erlaubt von
<Name> am <Datum>".

## Psychologie - was wirkt, was schadet

Nutzen (alles ehrlich): Risiko-Umkehr (Nachnahme + 45 Tage), Autoritaet
(Dermatologin, Name + Foto), Sozialer Beweis (8 Faelle, echte Stimmen mit
Namen, echte Zahl Kunden aus Heart), Anker (58 € durchgestrichen),
Konkretheit (Wirkstoff 5 %, "4 Wochen"), ein Ziel pro Bildschirm.

Nicht nutzen: falsche Countdowns, "nur noch 3 auf Lager", erfundene
Bewertungen. Kleiner Markt, Mundpropaganda, Meta-Richtlinien - ein
entdeckter Trick kostet mehr als er bringt. Echte Dringlichkeit nur, wenn
wahr (z. B. "Porositni sot - dërgohet nesër").

## Zur Kampagne (keine Pixel-Aenderung)

AddToCart feuert beim ersten Tipp auf "Porosit setin" (`#nachLegen`). "Ein
paar Warenkoerbe" = ein paar Tipps. Wo es danach reisst, zeigt Heart pro
Sitzung: `imKorb` -> `kasseGeoeffnet` -> `adresseBegonnen` -> `ordered`.
Diese vier Zahlen fuer den Tab "Lifeskin Shop" zuerst ablesen - sie sagen,
ob Massnahme 1 (Kasse) oder 3/4 (Ueberzeugung vor dem Klick) zuerst kommt.

## Offen / nicht geprueft

- Echtes iPhone Safari + FB/IG-In-App-Browser (nur Emulation).
- Echte Trichterzahlen aus Heart (kein Zugriff auf Produktionsdaten).
- Lieferzeit, Anwendung, Reichweite 30 ml: Angaben des Inhabers noetig.
