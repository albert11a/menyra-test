Status: CURRENT
Last updated: 2026-10-01

# Meta-Pixel und Conversions API - Pruefung vom 01.10.

Nur geprueft, nichts am Pixel oder an der Conversions API geaendert
(Pixel-Sperre gruen).

## Browser (Pixel) - in Ordnung

Pruefstand `tests/lifeskin-trichter-pruefstand/lauf-wege.mjs`, Laeufe A15
(Anzeige -> Analyse -> Therapieseite -> Kauf) und A16 (Laden /lifeskinshop),
390 px, Instagram-Browser, jeder Aufruf von `fbq` aufgezeichnet: 81/81.

| Seite | Standard-Ereignisse an Meta |
|---|---|
| /lifeskin | PageView, Lead (einmal, bei der Nummer) |
| /analiza | PageView |
| /terapia | PageView, AddToCart 49 EUR (Warenkorb), InitiateCheckout 49 EUR (Kasse), Purchase 49 EUR mit eventID = Bestellnummer |
| /lifeskinshop | PageView, AddToCart 39 EUR, InitiateCheckout 39 EUR, Purchase 39 EUR mit eventID = Bestellnummer |

- Pixel-Kennung auf jeder Seite richtig, jedes Ereignis einmal je Besuch,
  Reihenfolge Warenkorb -> Kasse -> Kauf, Purchase erst nach dem Speichern.
- Standardnamen ueber `track`, eigene ueber `trackCustom`.
- Kein Name, keine Nummer, keine Anschrift an Meta.
- Die Nutzlast der Conversions API (aus der fertigen Sitzung gebaut):
  dieselbe eventID wie im Browser (Deduplizierung), richtiger Betrag,
  User-Agent, Klick-Kennung `fbc` aus dem Anzeigenklick.

## Server (Conversions API) - nicht gesichert

1. **Ob die aktuelle Fassung laeuft, ist nicht belegt.** Alle vier Laeufe
   von `mnyra-deploy-functions` (16.09.-24.09.) sind gescheitert: das
   GitHub-Geheimnis `FIREBASE_SERVICE_ACCOUNT` fehlt. Laut
   `docs/lifeskin-shop.md` (28.09.) laeuft in Firebase eine alte Fassung von
   `lifeskinCapiPurchase`. Damit sind nicht live: User-Agent
   (`client_user_agent`, von Meta fuer Website-Ereignisse verlangt), Seite
   aus der Bestellung, kein Senden von Testbestellungen aus dem stillen
   Modus - und moeglicherweise die Klick-Kennung aus dem ersten Besuch
   (27.09.).
2. **API-Version v21.0** (`functions/lifeskin-capi-payload.js`). Bei Meta
   seit 09.09.2025 abgelaufen; aktuell ist v26.0 (29.07.2026), v24.0 laeuft
   am 06.10.2026 ab. Meta hebt Aufrufe an unveraenderte Endpunkte
   automatisch an - eine Zusage fuer `/events` gibt es nicht.
3. **Kein zweiter Versuch.** Scheitert das Senden, bleibt die Marke in
   `capiEvents` stehen (Absicht: lieber ein fehlender als ein doppelter
   Kauf). Ein Fehler steht nur im Firebase-Protokoll.

## Kleiner, ohne Eile

- Nur Purchase geht auch vom Server. Lead, AddToCart, InitiateCheckout
  gehen nur aus dem Browser (iOS/Blocker verlieren einen Teil).
- ViewContent kommt nur auf dem Scan-Weg (Schritt "captured").
- Warteseite und Therapieseite melden beide `lifeskin_report_view`.
- Server-Abgleich nur ueber fbp/fbc/User-Agent (Entscheidung Inhaber:
  keine Kundendaten) - niedrigere Abgleichqualitaet, Deduplizierung geht.

## Selbst nachsehen

- Meta Ereignismanager -> LF WEB -> Purchase: Verbindung "Browser und
  Server", Deduplizierung; Reiter Diagnose.
- Firebase -> Functions: `lifeskinCapiPurchase`, Datum des Deploys; Logs
  `lifeskin.capi.purchase` (sent / failed / skipped no_token).
- Firestore `lifeskin/lifeskin/capiEvents`: ein Eintrag je gemeldetem Kauf.
