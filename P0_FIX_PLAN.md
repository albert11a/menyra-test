Status: CURRENT
Branch: main
Stand: 2026-06-29

# P0 Fix Plan

## Entscheidung

MNYRA ist weiterhin nicht grosslaunchbereit. Die Order-Integritaet ist code-seitig gehaertet und auf Production deployed, aber noch nicht per Testdaten-E2E fuer QR/Mirror/Waiter verifiziert. Counter-Integritaet bleibt als offener P0 bestehen.

## P0-1 Order-Erstellung absichern

Status: Code-Fix und Production-Deploy umgesetzt am 2026-06-29, Testdaten-E2E-Gate offen.

Ziel: Client darf keine Preise, Totals, Status, Ownership oder Restaurant-Zuordnung vertrauenswuerdig setzen.

1. Contract definieren:
   - Input: `restaurantId`, `tableNumber/tableLabel`, `items: [{ itemId, quantity, selectedSize, selectedColor, comment }]`, Kontaktfelder.
   - Verboten im Client-Input: `price`, `total`, `itemCount`, `status`, `businessName`, `businessAvatar`, `createdAt`, `updatedAt`, `buyerAvatar`, beliebige `buyerUid`.

2. Cloud Function gebaut:
   - Callable `createRestaurantOrder`.
   - Restaurant und Menu-Items werden serverseitig gelesen.
   - Preise, Item-Namen und Total werden serverseitig berechnet.
   - Guest Lookup Token wird serverseitig erzeugt.
   - Status initial fix auf `Neu`.
   - Order wird in `restaurants/{restaurantId}/orders` geschrieben.

3. Firestore Rules gehaertet:
   - Guest/User direkte `create` auf `restaurants/{restaurantId}/orders` gesperrt.
   - Offen: Order `update` nur Waiter/Owner/Staff/CEO mit explizit erlaubten Status-Transitions modellieren.
   - Offen: `delete` noch restriktiver pruefen oder clientseitig komplett sperren.

4. Tests:
   - Unit-Test: Client sendet keine Preise/Totals/Status/Bilder/Namen.
   - Unit-Test: Function-Helper berechnet Total aus Menu-Daten.
   - Unit-Test: versteckte/nicht verfuegbare Items werden abgelehnt.
   - Unit-Test: spoofed `buyerUid` wird abgelehnt.
   - Offen: Emulator-Test, dass direkte Firestore-Creates geblockt werden.
   - Offen: Staging-Test fuer QR-Checkout, Order-Mirror und Waiter-Sichtbarkeit.
   - Production-Preflight: `createRestaurantOrder` antwortet fuer Production- und lokalen LAN-Origin mit CORS `204`; kein Order-Schreibtest auf Production ausgefuehrt.

## P0-2 Counter-Manipulation schliessen

Ziel: Likes, Comments, Followers, Following Counts sind abgeleitete Werte, nicht freie Client-Writes.

1. Direkte `socialCounterUpdateAllowed()` und `followerCounterUpdateAllowed()` entfernen oder auf serverseitige Rolle beschraenken.
2. Likes/Comments/Follows nur ueber Dokumente erlauben:
   - Like Doc ID muss `auth.uid` sein.
   - Comment `uid == auth.uid`.
   - Follow request/following docs strikt auf Actor/Target validieren.
3. Aggregation:
   - Cloud Functions `onCreate/onDelete` fuer likes/comments/follows.
   - Alternativ serverseitige Transaction/Callable.
4. Emulator-Tests:
   - User kann `likesCount=999999` nicht direkt setzen.
   - User kann `followersCount` fremder Restaurants nicht setzen.
   - Like Doc erzeugt genau +1 ueber Function.

## P0-3 Staging/Emulator als Gate

1. `firebase.json` Emulator-Sektion ergaenzen.
2. Seed-Daten fuer Guest, User A/B, Business, Staff, Waiter, Owner, CEO/Admin, Restaurant, Menu, Orders.
3. CI/Local Script:
   - Rules Tests.
   - Function Order Tests.
   - Guest QR/Menu/Cart read-only.
   - Mutating Order Tests nur gegen Emulator/Staging.

## Reihenfolge

1. Order Contract festlegen. Status: erledigt.
2. Direct Client Order Write migrieren. Status: erledigt.
3. Order Function implementieren. Status: erledigt.
4. Direkte Order-Creates in Rules sperren. Status: erledigt.
5. Emulator/Staging-Testdaten anlegen. Status: offen.
6. Order Function und Rules Tests im Emulator implementieren. Status: offen.
7. Counter Rules/Functions migrieren. Status: offen.
8. QR/Menu/Waiter End-to-End gegen Staging laufen lassen. Status: offen.
