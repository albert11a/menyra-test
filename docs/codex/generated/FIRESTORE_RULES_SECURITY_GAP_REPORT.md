# Firestore Rules Security Gap Report

Generated: 2026-07-01

Scope: preparation baseline for local emulator tests. No Firestore Rules were
changed in this branch.

## Current status

- Rules file exists at `firestore.rules`.
- Emulator configuration exists in `firebase.json`.
- Rules test scaffold exists at `tests/rules/firestore-security-flows.test.mjs`.
- Tests are skipped TODOs until emulator seed/auth fixtures are wired.

## Security flows to cover

- Guest cannot write a manipulated order outside the documented order contract.
- User cannot directly manipulate `likesCount`, `commentsCount`,
  `followersCount` or `followingCount`.
- Waiter can read and update only orders for an authorized restaurant.
- Owner can edit only the owned business.
- CEO/Heart can approve Ads through the intended admin path.
- Public can read only public profiles, menus, posts and public routes.
- Private user data and notifications remain protected.

## Known review risks

- Social counter writes are intentionally allowed in some rule branches and need
  emulator tests before any engagement refactor.
- Guest order creation is allowed for restaurant order documents and needs
  negative payload tests.
- Owner/staff access depends on restaurant staff documents and user role fields.
- Heart/CEO access depends on multiple role and admin collections.

## Next action

Convert each skipped Rules test into an emulator-backed allow/deny test after
auth fixtures are added. Do not make broad Rules fixes in the prep branch unless
the user explicitly approves that scope.
