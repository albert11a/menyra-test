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
| Ergebnisseite (Laden und /lifeskin) | Preis im Bild: AddToCart 39 EUR (Meta), in Heart KEIN Warenkorb | Kaufknopf: InitiateCheckout 39 EUR, Heart-Warenkorb, Live N'shport, Chip Analyse Shport+Arka | Live Adresa, Chip Adresa | Purchase 39 EUR erst NACH dem Speichern, eventID = orderId |

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

## Offen - betrifft Pixel/Conversions API, nur mit Erlaubnis (AGENTS.md)

1. **Laden (/lifeskinshop und /lifeskin): Purchase geht an Meta, BEVOR die
   Bestellung gespeichert ist** (`Sitzung.schritt`: "erst melden, dann
   schreiben"). Scheitert das Speichern, sieht der Kunde "Porosia nuk u
   dërgua", Meta hat aber schon einen Kauf. Die Ergebnisseite macht es
   richtig (erst speichern, dann melden). Vorschlag: im Laden genauso.
2. **Wiederholter Versuch nach einem Fehler: `step: "ordered"` wird nicht
   mehr geschrieben** (der Schritt galt im Browser schon als erreicht).
   Heart zaehlt die Bestellung (an order.orderId) - aber die Conversions API
   (`istKauf` braucht den Schritt) und die Meldung der Bestellung
   (`meldungAnstossen`) feuern nicht. Vorschlag: den Schritt erneut
   schreiben, solange er nicht bestaetigt ist.
3. **Conversions API ohne Browser-Kennung:** `user_data` traegt nur fbp/fbc,
   kein `client_user_agent`; `event_source_url` ist immer
   `https://mnyra.com/lifeskin`. Meta verlangt fuer Website-Ereignisse vom
   Server den User-Agent. Vorschlag: `navigator.userAgent` in `order`
   mitgeben und senden, dazu die echte Seite. Braucht einen Functions-Deploy.
4. **Ob die Conversions API ueberhaupt laeuft, ist von hier nicht zu sehen**
   (Secret `META_CAPI_TOKEN`, Deploy). Pruefen im Ereignismanager: Purchase
   mit Verbindung "Browser und Server" und Deduplizierung.
5. Ergebnisseite: AddToCart/InitiateCheckout kommen auch nach dem Kauf noch
   einmal, wenn der Kunde die Seite wieder oeffnet und den Preis sieht
   (Rauschen). Vorschlag: nach dem Kauf nicht mehr melden.
6. Noch nicht deployt (Entscheidung Inhaber): Bestellungen aus dem stillen
   Modus nicht an die Conversions API.

## Bekannt, klein

- Zwei Bestellungen im selben Tab: dieselbe Fallnummer, das zweite `order`
  ueberschreibt das erste, kein zweites Purchase.
- AddToCart einmal je Besuch mit dem Wert beim ersten Legen.
- In der Bestellung stehen die Einzelpreise (29 + 29), die Summe ist der
  Setpreis (39) - Umsatz in Heart und Meta richtig.
