# Mnyra Menu Price Contract

Status: CURRENT

Last updated: 2026-07-01

## Canonical Contract

`restaurants/{restaurantId}/menuItems/{itemId}.price` should be a non-negative
Firestore number.

The `createRestaurantOrder` Function is the pricing trust boundary. It reads
the menu item, converts the trusted price to integer cents and writes:

- `items[].price`: number;
- `items[].priceCents`: integer;
- `total`: number;
- `totalCents`: integer.

The browser never supplies a trusted final price or total.

## Transitional String Support

Production data currently includes decimal strings such as `"4.00"` and
`"3,40"`. The Function accepts those values as migration protection and still
writes numeric order values. This does not make string prices the long-term
schema.

## Migration

Before removing string parsing:

1. inventory all Production `menuItems.price` values;
2. dry-run conversion and report invalid/ambiguous values;
3. convert valid prices to numbers with an approved Production migration;
4. verify editor writes and public menu publishing preserve numeric values;
5. retain cents-based order tests and then remove transitional parsing in a
   separate change.

No Production migration was executed in this task.
