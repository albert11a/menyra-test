Status: CURRENT
Branch: launchready2027
Stand: 2026-06-29

# P0 Fix Plan

## Entscheidung

MNYRA ist nicht grosslaunchbereit, solange Order-Integritaet und Counter-Integritaet clientseitig manipulierbar bleiben. Diese Punkte muessen vor jedem echten Restaurant-/QR-Launch geschlossen werden.

## P0-1 Order-Erstellung absichern

Ziel: Client darf keine Preise, Totals, Status, Ownership oder Restaurant-Zuordnung vertrauenswuerdig setzen.

1. Contract definieren:
   - Input: `restaurantId`, `tableNumber/tableLabel`, `items: [{ itemId, quantity, selectedSize, selectedColor, comment }]`, Kontaktfelder.
   - Verboten im Client-Input: `price`, `total`, `itemCount`, `status`, `businessName`, `businessAvatar`, `createdAt`, `updatedAt`, `buyerAvatar`, beliebige `buyerUid`.

2. Cloud Function bauen:
   - Callable/HTTPS `createOrder`.
   - Restaurant und Menu-Items serverseitig lesen.
   - Preise, Currency, Item-Namen und Total serverseitig berechnen.
   - Guest Session/Lookup Token serverseitig erzeugen oder validieren.
   - Status initial fix auf `Neu`.
   - Order in `restaurants/{restaurantId}/orders` schreiben.

3. Firestore Rules hart machen:
   - Guest/User direkte `create` auf `restaurants/{restaurantId}/orders` sperren oder nur Function/Admin erlauben.
   - Order `update` nur Waiter/Owner/Staff/CEO mit erlaubten Status-Transitions.
   - `delete` nur sehr restriktiv oder gar nicht clientseitig.

4. Tests:
   - Emulator-Test: Guest kann manipulierten Preis nicht schreiben.
   - Emulator-Test: User kann `total=0` nicht schreiben.
   - Emulator-Test: User kann fremden `buyerUid` nicht setzen.
   - Emulator-Test: Waiter darf Status erlaubte Transition, Guest nicht.
   - Function-Test: Total wird aus Menu-Daten berechnet.

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

1. Order Contract festlegen.
2. Emulator/Staging-Testdaten anlegen.
3. Order Function und Rules Tests implementieren.
4. Direct Client Order Write migrieren.
5. Counter Rules/Functions migrieren.
6. QR/Menu/Waiter End-to-End gegen Staging laufen lassen.

