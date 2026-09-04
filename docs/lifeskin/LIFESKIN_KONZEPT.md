Status: CURRENT
Stand: 2026-09-04 (rev. 2: Zielwerte auf reale Anzeigendaten korrigiert)

# Lifeskin: Hautanalyse-Trichter mit eigener Domain

Eigenstaendige Analyse- und Verkaufsstrecke fuer einen Kosmetikkunden.
Der Besucher gibt Name und Alter an, nimmt ueber die Handykamera ein Foto auf,
bekommt einen Befund und eine personalisierte Produktempfehlung und bestellt ein
Set aus zwei Produkten fuer 43 EUR. Auswertung ohne KI, vollstaendig im Browser.

Herkunft der Besucher: kalte Anzeigen auf Facebook, Instagram und TikTok mit dem
Versprechen einer kostenlosen Hautanalyse.

Das Verkaufs- und Gestaltungskonzept (Trichter, Preispsychologie, Farbsystem,
Dashboard-Layout) liegt als Konzeptseite vor. Dieses Dokument haelt die
technische Seite fest: Architektur, Datenmodell, Regeln, Kennzahlen, Grenzen.

## Warum ohne KI

Die Messung ist Bildverarbeitung, keine Spracharbeit. Ein Sprachmodell wuerde
nur den Befundtext formulieren - und genau dort das Problem erzeugen, das der
Kunde als Qualitaetsmangel wahrnimmt: bei einem zweiten Test kaeme ein anderes
Ergebnis heraus.

Drei Konsequenzen:

- **Reproduzierbarkeit ist Mathematik, kein Versprechen.** Gleiches Bild ergibt
  exakt gleiche Werte.
- **Keine laufenden Kosten.** Null pro Analyse, egal bei welcher Menge.
- **Das Foto verlaesst das Geraet nicht** (Ausnahme: bewusste Speicherung, siehe
  "Fotospeicherung"). Damit entfaellt der groesste Teil des Themas
  "biometrienahe Daten" - und es wird zum Verkaufsargument auf Bildschirm 01.

## Messverfahren

### Zonen

Gesichtserkennung ueber MediaPipe Face Mesh (Apache-2.0, WASM, laeuft lokal).
Aus den Landmarks werden feste Zonen abgeleitet:

    stirn, nase, wange_links, wange_rechts, kinn, augenpartie

### Messwerte je Zone

Reine Pixelrechnung ueber Canvas `getImageData`, kein Modell:

| Wert      | Verfahren                                  |
|-----------|--------------------------------------------|
| roetung   | a*-Kanal im Lab-Farbraum, Mittel der Zone  |
| hautton   | ITA-Grad aus L* und b*                     |
| textur    | lokale Varianz ueber gleitendes Fenster    |
| poren     | Blob-Erkennung, Dichte je Flaeche          |
| glanz     | Anteil spekularer Spitzlichter             |
| linien    | Kantenantwort (Sobel), richtungsgewichtet  |
| pigment   | Kontrastcluster gegen Zonenmittel          |

### Der entscheidende Kunstgriff: Verhaeltnisse statt Absolutwerte

Absolute Helligkeitswerte haengen am Licht und sind damit nicht wiederholbar.
Verhaeltnisse zwischen Zonen desselben Fotos sind es, weil beide Zonen dasselbe
Licht hatten:

    glanz(nase+stirn) / glanz(wange_links+wange_rechts)  -> Hauttyp
    roetung(wange) / roetung(stirn)                      -> Empfindlichkeit
    textur(wange) / textur(stirn)                        -> Pflegebedarf

Hauttyp-Ableitung:

| Bedingung                              | Hauttyp                     |
|----------------------------------------|-----------------------------|
| T-Zone deutlich glaenzender als Wangen | Mischhaut                   |
| beide hoch                             | fettige Haut                |
| beide niedrig, Textur rau              | trockene Haut               |
| Wangenroetung hoch, Rest normal        | empfindlich / Couperose-Neigung |

Nur die wenigen Werte, die absolut sein muessen, laufen gegen Normbereiche nach
Altersgruppe. Das Alter kommt aus Bildschirm 02.

### Aufnahmegate

Der Ausloeser ist gesperrt, bis alle vier Pruefungen gleichzeitig gruen sind:

- Gesicht erkannt (Landmarks vollstaendig)
- Abstand (Gesichtsbreite im Zielfenster)
- Licht (mittlere Helligkeit und Dynamikumfang im Zielfenster)
- Ruhe (Bewegung zwischen zwei Bildern unter Schwelle)

Danach Auto-Ausloesung nach 3 Sekunden Gruen, drei Aufnahmen in 1,5 s.
Aus den drei Aufnahmen wird je Messwert der Median genommen.

### Wiederholungstest

Ein zweiter Test derselben Person wird **nicht** als unabhaengiges neues Urteil
dargestellt, sondern als Verlauf gegen die gespeicherten Messwerte. Das ist
ehrlicher und traegt zusaetzlich den Nachkauf.

### Befundtext

Regelwerk, kein Sprachmodell:

- 8 Messwerte x 4 Stufen = 32 Grundbausteine
- rund 20 Kombinationsregeln fuer zusammentreffende Befunde
- Name, Alter und Hauttyp werden eingesetzt

Feste Reihenfolge im Befund: **zuerst ein zutreffender positiver Punkt, danach
die Problembereiche.** Eine reine Maengelliste loest Abwehr aus und kostet
Glaubwuerdigkeit - und damit Umsatz.

## Architektur

### Eigene App, eigene Domain

    apps/lifeskin/
      index.html              eigener Kopf, eigenes CSS, kein Mnyra-Header
      lifeskin-app.js         Trichtersteuerung
      lifeskin-capture.js     Kamera, Gate, Aufnahme
      lifeskin-metrics.js     Messverfahren (rein, ohne DOM - testbar)
      lifeskin-rules.js       Hauttyp, Befundbausteine, Produktausloeser
      lifeskin-order.js       Anschrift, Bestellung
      lifeskin-styles.css
    api/lifeskin.js           Serverseitige Auslieferung + Share-Vorschau

`vercel.json` nutzt bereits host-basiertes Routing (`has: [{ type: "host" }]`)
an ueber einem Dutzend Stellen. Die neue Domain kommt als weitere Regel dazu,
das Muster existiert.

Beim Domainanschluss zusaetzlich: Domain in Vercel eintragen, Firebase Auth
"Authorized Domains" ergaenzen, eigenes Impressum und eigene
Datenschutzerklaerung, eigenes Favicon/Manifest/robots.txt.

**Nicht in `apps/menyra-social`.** MediaPipe bringt mehrere MB WASM mit; der
Social-Bundle hat mit `npm run check:social-bundle` ein Budget, das damit
reissen wuerde.

### Ladereihenfolge (Tempobudget)

| Groesse                    | Budget    |
|----------------------------|-----------|
| Erster Bildschirm sichtbar | < 1,0 s auf 4G |
| Rechenzeit der Analyse     | < 400 ms auf Mittelklasse-Android |
| Erkennungsbibliothek       | ~3 MB, laedt waehrend Bildschirm 02-03 |

Die Erkennungsbibliothek darf den ersten Bildschirm nie blockieren. Sie laedt,
waehrend der Besucher Name und Alter eingibt und die Vorbereitung liest. Das ist
die eine Entscheidung, die ueber "geht sofort" und "haengt" entscheidet.

Kein Framework, Systemschriften, kritisches CSS inline - passend zum
bestehenden Stil im Repo.

## Datenmodell (Firestore)

    lifeskin/{tenantId}/
      config/settings          Preise, Set-Zusammenstellung, Texte
      products/{productId}     Produkte samt Ausloeser-Regeln
      sessions/{sessionId}     Jede Analyse

`tenantId` ist von Beginn an drin. Er kostet jetzt fast nichts und erlaubt
spaeter einen zweiten Kosmetikkunden; nachtraeglich ist er teuer.

### sessions/{sessionId}

    createdAt, updatedAt
    step         opened | named | camera | captured | result
                 | offer | address | ordered
    name, ageBand
    device       { os, browser, screen, pixelRatio }
    metrics      { zone: { roetung, textur, poren, glanz, ... } }
    ratios       { tzoneGlanz, wangenRoetung, ... }
    skinType, findings[]
    recommended  [productId]
    photoConsent, photoRefs[]
    address      { street, city, zip, phone }
    order        { orderId, total, status, placedAt }
    timings      { perStepMs }

`timings` ist kein Beiwerk. Ohne die Verweildauer je Schritt laesst sich spaeter
nicht rekonstruieren, warum ein Schritt verliert.

### products/{productId}

    name, shortText, description, ingredients, usage
    photoRef
    singlePrice          Anker fuer die Set-Rechnung, muss stimmen
    setShare
    availability         visible | soldout | hidden
    routine              morning | evening | both
    triggers[]           z.B. { metric: "roetung", min: 3 }
                              { skinType: "empfindlich" }

Die Ausloeser sind die gesamte Empfehlungslogik. Sie gehoeren dem CEO-Konto,
nicht dem Code - das Sortiment aendert sich oefter als die Software.

### Firestore-Regeln

Muster wie bei `landingSessions` (firestore.rules, ab Zeile 990), das dort
seit Langem laeuft:

- `create`/`update` auf `sessions`: ohne Anmeldung erlaubt, aber eng auf die
  bekannten Felder und Wertebereiche begrenzt
- `read`: nur CEO-Konto (`isCeoActor()`)
- `delete`: `if false`
- `products` und `config`: schreiben nur CEO-Konto, lesen oeffentlich
- `collectionGroup`-Regel fuer die Dashboard-Abfrage ueber alle Mandanten

### Preisprueffung serverseitig

Wie bei den bestehenden Bestellungen (`functions/order-security.js`): Der
Browser nennt den Preis, entschieden wird er auf dem Server gegen
`config/settings`. Ohne das bestellt jemand das Set fuer 1 EUR.

## Heart: Reiter "Lifeskin"

### Einhaengepunkte

| Datei                                   | Aenderung                                  |
|-----------------------------------------|--------------------------------------------|
| `apps/mnyra-heart/heart-state.js`       | `HEART_NAV_ITEMS` + `{ key: "lifeskin", label: "Lifeskin" }`, Zustandsscheibe `lifeskin` |
| `apps/mnyra-heart/heart-render.js`      | `NAV_HINTS`, `NAV_ICONS`, Ansichtsweiche   |
| `apps/mnyra-heart/heart-lifeskin-adapter.js` | Lesen, Aggregieren (neu)              |
| `apps/mnyra-heart/heart-lifeskin-render.js`  | Kacheln, Bloecke, Detail (neu)        |

Der Adapter folgt `heart-landing-adapter.js`: erst aus dem Geraetespeicher
lesen und sofort anzeigen, danach den Serverstand nachholen. Aggregiert wird
im Client, damit keine zusammengesetzten Indizes noetig sind.

### Aufbau

Kacheln oben, Bloecke darunter - Muster wie `heart-landing-kpis`.

Kacheln: Analysen heute (mit Vergleich gestern), Analysen 7 Tage,
Abschlussquote, Kaufquote, Umsatz, Abbrueche mit Anschrift.

Bloecke: Trichter, Zeitverlauf, Bestellungen, Abbrecher mit Anschrift,
Analysen-Liste, Verteilung, Produktverwaltung.

Analyse-Detail: Fotos (soweit gespeichert), Name, Alter, Geraet, alle
Messwerte, Hauttyp, empfohlene Produkte, Bestellstatus.

Bestell-Detail: Uhrzeit, vollstaendige Anschrift, Telefon, Set, Betrag,
Zahlart, Status (Neu / Im Versand / Geliefert / Storniert).

### Kennzahlen-Definitionen

Ohne feste Definitionen zeigt das Dashboard huebsche Zahlen ohne Bedeutung.

| Kennzahl                | Definition                                          |
|-------------------------|-----------------------------------------------------|
| Analyse                 | Sitzung hat `captured` erreicht                     |
| Abgeschlossen           | Sitzung hat `result` erreicht                       |
| Abschlussquote          | Abgeschlossen / Sitzungen gesamt                    |
| Kaufquote               | Bestellungen / Abgeschlossen                        |
| Abbruch mit Anschrift   | Adressfelder gefuellt, kein Abschluss, aelter 30 min |
| Entdopplung             | Ein Geraet zaehlt je 30 min als eine Sitzung        |

### Zielwerte (aus realen Vorlaeuferdaten)

Ausgangslage ohne professionellen Trichter: rund 75 Analysen taeglich,
1-2 Bestellungen, Produktpreis 10 EUR. Das sind **2 % Kaufquote**, etwa
450 EUR Umsatz im Monat.

Die Aufgabe ist daher nicht "30 % erreichen", sondern: **den Preis
vervierfachen, ohne dass die Quote einbricht** - und sie danach heben.

| Kaufquote | Best./Tag | Umsatz/Monat | Einordnung                        |
|-----------|-----------|--------------|-----------------------------------|
| 2 %       | 1,5       | 1.900 EUR    | Heutige Quote, nur neuer Preis    |
| 3 %       | 2,2       | 2.900 EUR    | Allein durch Nachnahme erreichbar |
| 5 %       | 3,8       | 4.800 EUR    | **Zielwert Jahr eins**            |
| 8 %       | 6,0       | 7.700 EUR    | Oberes Ende fuer kaltes Publikum  |
| 12 %      | 9,0       | 11.600 EUR   | Nur mit Nachfassen                |

Trichter-Zielwerte auf 1.000 Anzeigenklicks: geoeffnet 1.000, Name 620,
Kamera 480, Foto 400, Befund 390, Empfehlung 300, Anschrift 45, bestellt 27.
Das sind 6,9 % auf abgeschlossene Analysen - das Dreifache von heute.

Wichtig fuer die Erwartung: Die Anzeige verspricht eine *kostenlose Analyse*
und selektiert damit Besucher, die genau das wollen. Der Trichter arbeitet
gegen die Absicht, mit der die Leute kommen. 4-10 % sind bei kaltem Publikum
die realistische Spanne; 30-40 % gibt es dort in keiner Branche.

## Nachfassweg: die Besucher ohne Kauf

Bei 75 Analysen taeglich sehen rund 30 Menschen ihren Befund, etwa 4 bestellen.
26 gehen - taeglich, also rund 780 im Monat. Fuer sie wurde Werbung bezahlt.

**Griff:** direkt nach dem Befund, *vor* dem Angebot, ein zweiter Knopf neben
"Weiter": "Befund per WhatsApp erhalten". Nur die Nummer, kein Formular. Der
Besucher bekommt, was er ohnehin will; das System bekommt einen Kontakt mit
vollem Zusammenhang (Name, Alter, Hauttyp, empfohlene Produkte).

| Annahme                   | Kontakte/Monat | Spaeter Kunde | Zusatzumsatz   |
|---------------------------|----------------|---------------|----------------|
| 25 % geben die Nummer     | 190            | 3 %           | 250 EUR/Monat  |
| 25 % geben die Nummer     | 190            | 5 %           | 410 EUR/Monat  |
| 35 % geben die Nummer     | 270            | 5 %           | 580 EUR/Monat  |

Ohne zusaetzliches Werbebudget, und die Liste waechst monatlich weiter.

Datenmodell: `phone`, `phoneConsent`, `phoneConsentMarketing` (getrennt!) und
`contactedAt` in der Sitzung. Die Nummer wird fuer den Befund erfragt und darf
ohne die zweite, eigens formulierte Einwilligung nicht fuer Werbung verwendet
werden - WhatsApp sperrt Nummern dafuer schnell und dauerhaft.

Zwei weitere Wege aus demselben Publikum:

- **Rueckfall beim Ablehnen.** Wer das Set ablehnt, bekommt beim Weggehen *ein*
  Produkt zum Einzelpreis angeboten - nicht als Auswahl auf dem
  Angebotsbildschirm, das laehmt nur.
- **Teilbarer Befund.** Ein "Ergebnis teilen"-Knopf erzeugt ein sauberes Bild
  mit den Werten. Auf TikTok und Instagram ist ein persoenliches Ergebnis
  Inhalt, den Leute freiwillig zeigen - kostenlose Reichweite.

## Fotospeicherung: offene Entscheidung

Das Dashboard soll Fotos zeigen. Das Verkaufsversprechen auf Bildschirm 01
lautet "Ihr Foto bleibt auf Ihrem Handy". Beides zugleich geht nicht.

- **A** Kein Upload. Dashboard zeigt Messwerte und Zonengrafik, kein Gesicht.
- **B** Einwilligung per nicht vorangekreuztem Haken.
- **C** *(empfohlen)* Foto nur bei Bestellung speichern - dann Teil der
  Auftragsabwicklung und gut begruendet. Fuer alle uebrigen bleibt es auf dem
  Geraet.

In allen Faellen: Fotos nach 90 Tagen automatisch loeschen, Messwerte bleiben
(sie werden fuer den Verlaufsvergleich gebraucht).

## Rechtlicher Rahmen

Kosovo und Albanien sind nicht in der EU, die MDR gilt dort nicht direkt.

Aber: Bei einer `.de`- oder `.at`-Domain mit deutschsprachiger Ansprache greift
EU-Recht ueber die Marktausrichtung. Medizinische Diagnosen wuerden die Seite
dann zum Medizinprodukt machen. Fuer Kosovo und Albanien daher `.com`.

Unabhaengig davon gilt: **nie Entwarnung geben.** Auffaelliges Muttermal fuehrt
zu "bitte aerztlich abklaeren lassen", nie zu "alles in Ordnung".

Wenn der Befund wirklich medizinisch sein soll, ist der saubere Weg ein
eingebundener Arzt, der auffaellige Faelle prueft - echte Telemedizin statt
Formulierungstricks.

## Geraetegrenzen

- iOS: `playsinline` am Videoelement Pflicht, sonst Vollbild und Trichterabbruch.
  Kamerastart nur nach Nutzerberuehrung.
- Aeltere iPhones: Safari faellt teils auf WebGL 1.0 zurueck. Laeuft, aber
  langsamer - die Erkennung muss auch bei 15 fps sauber greifen.
- Android-Mittelklasse (Samsung A-Reihe) ist der Testmassstab, nicht das
  Spitzenmodell.
- Rueckfallweg: Faellt die Erkennung ganz aus, erscheint das Oval ohne
  Live-Pruefung und der Besucher loest selbst aus. Der Trichter darf an keiner
  Stelle in einer Sackgasse enden.

## Bauphasen

1. **Geldweg** - Trichter 01-10, Messmodul, Befund, Empfehlung, Angebot,
   Bestellung mit Nachnahme, Danke-Seite, serverseitige Preisprueffung.
   **Der WhatsApp-Griff gehoert in diese Phase**, nicht spaeter: jeder Tag
   ohne ihn sind rund 26 verlorene Kontakte.
2. **Dashboard** - Lifeskin-Reiter in Heart.
3. **Produktverwaltung** - Produkte, Fotos, Texte, Preise, Ausloeser.
4. **Nachschaerfen** - erst mit echten Trichterdaten Ueberschrift,
   Angebotsbildschirm und Analysedauer gegeneinander testen.

## Offene Punkte vor Baubeginn

1. Fotospeicherung: A, B oder C
2. Domain: `.com` oder `.de`/`.at` (bestimmt die Formulierung des Befunds)
3. Die zwei Produkte und ihre Einzelpreise - zusammen 54-57 EUR, damit die
   Set-Ersparnis bei 20-25 % liegt. Die Einzelpreise muessen echt sein.
4. Sprache: Albanisch, Deutsch oder zweisprachig (bestimmt die Textarchitektur)
5. Bezahlung und Versand: Nachnahme ist bei kaltem Publikum vermutlich der
   groesste Einzelhebel. Karte zusaetzlich?
6. WhatsApp-Nachfassen: wer bearbeitet die Liste, in welcher Sprache, wie oft?
   Ohne benannten Verantwortlichen wird der Griff nicht eingebaut.
7. Anzeigentext: zweite Variante gegenlaufen lassen, die das Ergebnis
   verspricht statt der Analyse - gleiches Budget, vier Wochen.
8. Rueckgaberecht: steht der Kosmetikkunde hinter "Geld zurueck"

## Naechster Schritt

Mess- und Textbaustein-Schema ausschreiben: Zonen, Verhaeltnisse, Stufen,
Schwellenwerte und die Zuordnung Kombination -> Befundtext. Das ist die
Vorlage, aus der `lifeskin-metrics.js` und `lifeskin-rules.js` gebaut werden.
