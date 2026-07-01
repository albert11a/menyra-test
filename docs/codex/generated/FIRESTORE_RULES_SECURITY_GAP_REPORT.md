# Firestore Rules Security Gap Report

Generated: 2026-07-01

Scope: dedicated Firestore Rules hardening for social counters and private root
user document reads. Product UI, routes, `social-app.js`, Functions source and
seed collections were not changed.

## Current status

- Rules file exists at `firestore.rules`.
- Emulator configuration exists in `firebase.json`.
- Rules tests exist at `tests/rules/firestore-security-flows.test.mjs`.
- Auth fixtures exist at `tests/rules/auth-fixtures.mjs`.
- Local seed data includes emulator Auth users and Firestore documents.
- `npm run test:rules` is green with 7 passed tests, 0 failed, 0 skipped.

## Security flows to cover

- Guest cannot write a manipulated order outside the documented order contract.
- User cannot directly manipulate `likesCount`, `commentsCount`,
  `followersCount` or `followingCount`.
- Waiter can read and update only orders for an authorized restaurant.
- Owner can edit only the owned business.
- CEO/Heart can approve Ads through the intended admin path.
- Public can read only public profiles, menus, posts and public routes.
- Private user data and notifications remain protected.

## Closed security gaps

### Direct counter manipulation

Test: `user cannot directly manipulate likes/comments/follower counters`

Previous result: red. A normal signed-in user could update social counter fields
directly. The first failing assertion was an update to
`socialFeed/post-demo-001` with only `likesCount` and `commentsCount`.

Current result: green. Normal signed-in users can no longer directly set or
change `likesCount`, `commentsCount`, `followersCount` or `followingCount` on
the covered social/user/restaurant surfaces. Counter fields may be present on
new client-created social/comment documents only when initialized to `0`.

Rules changed:

- Added zero-on-create and unchanged-on-update guards for social counters,
  comment counters and follower counters.
- Disabled the direct counter-only client write helpers.
- Kept real like/comment/follow document writes on their existing paths.
- Preserved owner/CEO management flows when those flows do not mutate protected
  social counters.

### Private user document reads

Test: `private user data remains protected`

Previous result: red. A signed-in normal user could read another user's
`users/{uid}` document.

Current result: green. A normal signed-in user can read their own root user
document and cannot read another user's root `users/{uid}` document.

Rules changed:

- Narrowed `users/{uid}` root reads from any signed-in user to self, CEO/Heart
  actor, or an existing owner-managed staff user read.
- Added a targeted owner-managed staff read allowance so the existing restaurant
  owner/staff flow remains covered without reopening all root user documents.

Potential app-flow impact:

- Any client code that still reads arbitrary foreign `users/{uid}` root
  documents as a normal signed-in user must move to public profile surfaces or a
  narrower explicit read contract.
- Client code that attempted to update denormalized social counters directly
  must rely on real like/comment/follow documents or server-side/admin updates.

## Current green security tests

- Guest order contract allows valid guest orders and denies forged buyer/wrong
  restaurant payloads.
- User cannot directly manipulate `likesCount`, `commentsCount`,
  `followersCount` or `followingCount`, while real like/comment documents still
  remain writable through the existing document contracts.
- Waiter can read own restaurant orders and cannot read another restaurant.
- Owner can edit own restaurant and cannot edit an unowned restaurant.
- CEO/Heart can approve a seeded Ad; owner cannot approve the same Ad.
- Public guest can read public route/profile/menu/post surfaces but not user
  documents.
- Root user data is protected: self reads pass, normal foreign reads fail, and
  owner/CEO staff/admin reads covered by existing contracts pass.

## New gaps visible in this step

No new confirmed security gaps were exposed by the emulator test run. Remaining
review risks are unchanged from the prep baseline:

- Guest order creation is allowed for restaurant order documents and should keep
  negative payload coverage.
- Owner/staff access depends on restaurant staff documents and user role fields.
- Heart/CEO access depends on multiple role and admin collections.

## Checks

- `npm run test:rules`: 7 passed, 0 failed, 0 skipped.
- `npm run test:functions`: 2 passed, 0 failed.
- `npm run test:unit`: 102 passed, 0 failed.
- `npm run lint`: passed.
- `npm run format:check`: passed.
- `npm run arch:check`: passed, 330 modules and 489 dependencies cruised.
