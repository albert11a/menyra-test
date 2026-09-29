Status: Pruefbericht 29.09.2026 (kein CURRENT-Dokument)

# Kaufwege: Warenkorb, Kasse, Anschrift, Kauf - Pixel, Conversions API, Heart

Auftrag Inhaber (29.09.): "Diese ganzen AddToCart, Kasse, Anschrift und Kauf
Prozesse hochgenau analysieren - ist alles richtig, wird perfekt optimiert,
bekommen wir die Heart-Stats wie es richtig ist?"

## Wie geprueft

- Code gelesen: `apps/lifeskin/lifeskin-pixel.js`, `lifeskin-session.js`,
  `apps/lifeskin-shop/shop.js`, `apps/lifeskin-landing/shop.js`,
  `apps/lifeskin-verkauf/terapia.js`, `functions/lifeskin-capi*.js`,
  `shared/lifeskin-still.js`, Heart (`heart-lifeskin-berechnung.js`,
  `-live.js`, `-weg.js`).
- Pruefstand (Headless-Chromium 390 px, gebaute Seiten, Firestore-Attrappe mit
  echter updateMask-Logik, nichts geht an Meta): jeder Weg Schritt fuer
  Schritt mit dem vollen fbq-Aufruf, den geschriebenen Feldern, der Nutzlast,
  die die Conversions API daraus baut, und dem, was Heart mit genau dieser
  Sitzung zeigt (echte Heart-Funktionen). Dazu ein eingespielter
  Serverfehler (503) beim Bestellen.

## Was stimmt (belegt)

| Weg | Warenkorb | Kasse | Anschrift | Kauf |
|---|---|---|---|---|
| /lifeskinshop, Direktkauf | Set gelegt: AddToCart 39 EUR, einmal je Besuch; Heart: Warenkoerbe 1 (39 €), Live N'shport, Chip Shport | InitiateCheckout 39 EUR; kasseGeoeffnet; Chip Arka | adresseBegonnen; Live Adresa | Purchase 39 EUR, eventID = Fallnummer = order.orderId; CAPI gleiche event_id; Heart: Bestellungen 1, Umsatz 39 €, Live Cash |
| /lifeskin, Laden der Landing | Shto: AddToCart 29 EUR | InitiateCheckout 29 EUR | adresseBegonnen | Purchase 29 EUR, eventID = orderId |
| Ergebnisseite (Laden und /lifeskin) | Preis im Bild: AddToCart 39 EUR (Meta), in Heart KEIN Warenkorb; Live Rezultati | Kaufknopf: InitiateCheckout 39 EUR, Heart-Warenkorb, Live N'shport, Chip Analyse Shport+Arka | Live Adresa, Chip Adresa | Purchase 39 EUR erst NACH dem Speichern, eventID = orderId |

- Neuladen nach dem Kauf und spaeteres Oeffnen der Ergebnisseite: kein
  zweites Purchase.
- Kaufquote zaehlt nur Kaeufe aus einer Analyse (Direktkaeufe nicht) - richtig.
- Stiller Modus: kein Pixel; Bestellungen gehen trotzdem durch (order.still).

## Behoben (nur Heart, kein Pixel)

- **Live · Kauf zeigte niemanden, der gerade seine Ergebnisseite liest.** Die
  Seite schreibt `timings.live = "fertig"` ("report"); dieser Schritt lag in
  keinem Live-Punkt. Neu: Punkt "Rezultati" vorne in der Kaufreihe
  (Rezultati · N'shport · Adresa · Cash), unter den Spalten Landing, Fotot,
  Pyetjet, Patient.

- **Live · Kauf im Laden nach einem Analyse-Schritt.** Wer im Laden erst die
  Analyse antippte (Menyra, Scan) und dann doch in den Korb legte, stand in
  Live weiter in der Analyse-Reihe: Die Marke `imKorb` zaehlt nur ohne
  Live-Stand, und der alte ("wahl") stand noch da. Jetzt schreiben beide
  Laeden ihren Stand (`Sitzung.liveMerken`: Korb und Kasse "offer" =
  N'shport, Anschrift "address" = Adresa) - die letzte Handlung zaehlt.
  Nur `timings.live`, kein Schritt, kein Pixel.

## Umgesetzt am 29.09. - Pixel-Aenderung erlaubt von Albert am 29.09.2026

Wortlaut der Erlaubnis: "1 Kauf erst nach dem Speichern melden, 2 Schritt
beim zweiten Versuch neu schreiben, 3 User-Agent und Seite fuer die
Conversions API vorbereiten, 4 nach dem Kauf keine
AddToCart/InitiateCheckout mehr." Tests:
`tests/lifeskin-kauf-nach-speichern.test.mjs`, Pixel-Sperre neu eingetragen.

1. **Laden (/lifeskinshop und /lifeskin): Purchase erst nach dem Speichern.**
   War: "erst melden, dann schreiben" - mit einem Serverfehler sah der Kunde
   "Porosia nuk u dërgua", Meta hatte trotzdem einen Kauf. Jetzt meldet
   `Sitzung.schritt("ordered")` den Pixel erst, wenn Firestore die
   Bestellung angenommen hat (`ERST_SPEICHERN`), wie die Ergebnisseite. Alle
   anderen Schritte melden weiter vor dem Schreiben. Dazu bekommt jeder
   Aufrufer die Antwort auf sein eigenes Teil eines gesammelten PATCH -
   vorher die letzte gute der Sammlung.
2. **Zweiter Versuch nach einem Fehler.** War: `step: "ordered"` wurde nicht
   mehr geschrieben, Conversions API und Meldung an Dr. Gashi blieben stumm.
   Jetzt geht der Tab bei einem Fehler auf den Stand davor zurueck; der
   zweite Versuch schreibt den Schritt, meldet Purchase (einmal) und stoesst
   die Meldung an. Pruefstand mit 503: Versuch 1 kein Purchase, Versuch 2
   genau eines, step "ordered", `istKauf` wahr.
3. **User-Agent und Seite fuer die Conversions API (vorbereitet).** Der
   Browser gibt `order.ua` (User-Agent) und `order.seite` (Adresse und erster
   Pfadteil, ohne Fallkennung) mit - in allen fuenf Bestellwegen
   (`browserAngaben`). Die Function sendet daraus `client_user_agent` und
   `event_source_url` (nur mnyra.com, sonst die feste Adresse). **Wirkt erst
   nach einem Functions-Deploy** (Inhaber); bis dahin stehen die Felder nur
   in der Bestellung.
4. **Nach dem Kauf keine AddToCart/InitiateCheckout mehr** (Ergebnisseite
   und Warteseite). Pruefstand: Wiederoeffnen nach dem Kauf mit dem Preis im
   Bild - nur PageView.

## Weiter offen

- **Ob die Conversions API ueberhaupt laeuft, ist von hier nicht zu sehen**
  (Secret `META_CAPI_TOKEN`, Deploy). Pruefen im Ereignismanager: Purchase
  mit Verbindung "Browser und Server" und Deduplizierung.
- Noch nicht deployt (Entscheidung Inhaber): Bestellungen aus dem stillen
  Modus nicht an die Conversions API, und Punkt 3 oben. Beides kommt mit dem
  naechsten Functions-Deploy.

## Bekannt, klein

- Zwei Bestellungen im selben Tab: dieselbe Fallnummer, das zweite `order`
  ueberschreibt das erste, kein zweites Purchase.
- AddToCart einmal je Besuch mit dem Wert beim ersten Legen.
- In der Bestellung stehen die Einzelpreise (29 + 29), die Summe ist der
  Setpreis (39) - Umsatz in Heart und Meta richtig.
