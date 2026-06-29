Status: CURRENT
Branch: main
Stand: 2026-06-29

# Security Firestore Report

## Scope

Geprueft wurden `firestore.rules`, relevante Client-Order-Flows und Cloud Functions Mirror-Logik. Es wurden keine Production-Daten veraendert und keine destruktiven Live-Tests ausgefuehrt.

## P0: Order-Manipulation

### Befund vor Fix

`validOrderCreateForRestaurant(restaurantId)` prueft nur:

- `request.resource.data.restaurantId == restaurantId`
- Guest ohne `buyerUid` oder mit leerem `buyerUid`
- signed-in User mit `buyerUid == auth.uid`

Nicht geprueft werden:

- erlaubte Keys
- Typen und Wertebereiche
- `items[].itemId`
- `items[].price`
- `total`
- `itemCount`
- `status`
- `tableNumber`
- `guestLookupToken`
- `businessName/businessAvatar`
- `createdAt/updatedAt`

### Auswirkung vor Fix

Ein Client kann einen Order-Payload mit `total: 0`, falschen Preisen, fremden Artikeln oder beliebigem Status schreiben. Die Cloud Function `buildCanonicalOrderProjection()` spiegelt diese Werte weiter.

### Umgesetzter Fix

- `functions/order-security.js` definiert einen serverseitigen Order-Contract.
- Callable `createRestaurantOrder` liest Restaurant und Menu-Items serverseitig.
- Client-Checkout sendet nur noch Order Intent, keine Preise/Totals/Status/Buyer-Meta.
- `total` und `totalCents` werden aus serverseitigen Menu-Preisen berechnet.
- Initialstatus ist serverseitig `Neu` / `bestellung`.
- Guest Lookup Token wird serverseitig erzeugt.
- `firestore.rules` blockiert direkte Creates auf `restaurants/{restaurantId}/orders`.
- Regressionstest: `tests/orders-secure-checkout.test.mjs`.

### Bewertung nach Fix

Code-seitig deutlich verbessert und am 2026-06-29 auf Production deployed. Vor Grosslaunch ist der Bereich trotzdem noch nicht voll geschlossen, weil QR-Bestellung, Order-Mirror und Waiter-Ansicht nur mit Testdaten/E2E sicher verifiziert werden koennen. Es wurde kein produktiver Order-Schreibtest ausgefuehrt.

### Offene Sicherheitsarbeit

- Firestore Emulator-Test: direkter Client-Create mit `total=0` wird geblockt.
- Testdaten-E2E: Callable schreibt korrekte Order und Mirrors.
- Status-Updates nur fuer Waiter/Staff/Owner/CEO mit erlaubten Transitionen explizit testen/haerten.
- Delete-Regel fuer Orders restriktiv pruefen.

## P0: Counter-Manipulation

### Befund

`socialCounterUpdateAllowed()` erlaubt signed-in counter-only Updates fuer `likesCount` und `commentsCount`. `followerCounterUpdateAllowed()` erlaubt signed-in Updates fuer `followersCount` und `followingCount`.

### Auswirkung

Likes, Comments und Followerzahlen koennen manipuliert werden, ohne dass ein entsprechendes Like-/Comment-/Follow-Dokument existiert.

### Bewertung

P0 fuer Datenintegritaet und Trust.

### Fix-Richtung

- Direkte Counter-Writes sperren.
- Counter serverseitig ueber Functions/Transactions pflegen.
- Like/Comment/Follow-Dokumente streng validieren.
- Emulator-Tests fuer direkte Counter-Angriffe.

## P1: Staging/Rules-Testluecke

- `.firebaserc` zeigt nur Default `menyra-c0e68`.
- `firebase.json` hat jetzt Emulator-Konfiguration; Seed-/Rules-Testharness fehlt noch.
- Keine Firestore Rules Unit Tests gefunden.

Bewertung: P1, weil Security-Fixes ohne Emulator/Staging schwer sicher zu validieren sind.

## P1: Role/Staff/Waiter Coverage nicht end-to-end verifiziert

Rules enthalten Staff/Owner/CEO/Waiter-Pruefungen, aber echte Role-Flows wurden nicht mit Testaccounts ausgefuehrt.

Bewertung: Nicht bestanden, sondern nicht testbar ohne Staging-Credentials.

## Muss-vor-Launch Security Gates

1. Firestore Emulator Rules Tests.
2. Callable Order Function mit Staging-/Emulator-Testdaten testen.
3. Keine direkten Client-Order-Prices/Totals. Code-Fix umgesetzt, Staging-Gate offen.
4. Keine direkten Client-Counter-Writes.
5. Staging-Rollenlauf fuer Guest, User, Business, Waiter, Staff, Owner, CEO.
6. Negative Tests fuer fremde Restaurant IDs, fremde Buyer UIDs, Status-Manipulation, Counter-Manipulation.
