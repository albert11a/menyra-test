# Firestore Rules Security Gap Report

Generated: 2026-07-01

Scope: preparation baseline for local emulator tests. No Firestore Rules were
changed in this branch.

## Current status

- Rules file exists at `firestore.rules`.
- Emulator configuration exists in `firebase.json`.
- Rules tests exist at `tests/rules/firestore-security-flows.test.mjs`.
- Auth fixtures exist at `tests/rules/auth-fixtures.mjs`.
- Local seed data includes emulator Auth users and Firestore documents.
- `npm run test:rules` currently has 5 green tests and 2 red tests.

## Security flows to cover

- Guest cannot write a manipulated order outside the documented order contract.
- User cannot directly manipulate `likesCount`, `commentsCount`,
  `followersCount` or `followingCount`.
- Waiter can read and update only orders for an authorized restaurant.
- Owner can edit only the owned business.
- CEO/Heart can approve Ads through the intended admin path.
- Public can read only public profiles, menus, posts and public routes.
- Private user data and notifications remain protected.

## Confirmed red security tests

### Direct counter manipulation

Test: `user cannot directly manipulate likes/comments/follower counters`

Current result: red. A normal signed-in user can update social counter fields
directly. The first failing assertion is an update to
`socialFeed/post-demo-001` with only `likesCount` and `commentsCount`.

Risk: engagement and follower counts can be client-controlled unless all counter
updates are mediated by trusted code or stricter per-user write contracts.

No `firestore.rules` fix was applied in this step.

### Private user document reads

Test: `private user data remains protected`

Current result: red. A signed-in normal user can read another user's
`users/{uid}` document.

Risk: user profile/account fields in root user documents are broadly readable
by any authenticated user unless sensitive fields are separated or read rules
are narrowed.

No `firestore.rules` fix was applied in this step.

## Green security tests

- Guest order contract allows valid guest orders and denies forged buyer/wrong
  restaurant payloads.
- Waiter can read own restaurant orders and cannot read another restaurant.
- Owner can edit own restaurant and cannot edit an unowned restaurant.
- CEO/Heart can approve a seeded Ad; owner cannot approve the same Ad.
- Public guest can read public route/profile/menu/post surfaces but not user
  documents.

## Known review risks

- Social counter writes are intentionally allowed in some rule branches and now
  have a red emulator test.
- Guest order creation is allowed for restaurant order documents and needs
  negative payload tests.
- Owner/staff access depends on restaurant staff documents and user role fields.
- Heart/CEO access depends on multiple role and admin collections.

## Next action

Do not make broad Rules fixes in this validation step. The next dedicated
security task should decide whether counters move fully server-side, whether user
private data is split into private subdocuments, and which backwards-compatible
read paths must remain public/authenticated.
