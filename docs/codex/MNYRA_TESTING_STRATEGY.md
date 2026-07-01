# Mnyra Testing Strategy

Status: CURRENT
Last updated: 2026-07-01

## Test Layers

- Unit tests: existing Node tests in `tests/*.test.mjs`.
- Firestore Rules tests: scaffold in `tests/rules`.
- Firebase Functions tests: scaffold in `tests/functions`.
- Playwright E2E tests: scaffold in `tests/e2e`.
- Heart runner packs: existing `tests/mnyra-heart-runner`.
- Visual/cold-load/manual checks: documented in current phase files and run by
  the user unless explicitly requested otherwise.

## Commands

- `npm test`
- `npm run test:unit`
- `npm run test:rules`
- `npm run test:functions`
- `npm run test:e2e`
- `npm run test:all`

`test:all` is intentionally non-browser. Playwright remains explicit because it
needs local URLs, seeded data and browser installation.

## Required Refactor Gates

Before any runtime extraction:

- Unit tests pass.
- Rules tests for the touched security surface exist.
- Emulator seed for the touched flow exists.
- Architecture report is regenerated.
- Bundle report is regenerated after build.
- Manual flow list is written for the exact surface.

## E2E Smoke Targets

- Public profile direct load and refresh.
- Public menu direct load and refresh.
- QR menu with table context and cart.
- Waiter order visibility.
- Owner tool product/menu edit.
- Heart CRM/Ads approval.

Initial E2E files are skipped TODOs until the emulator seed and local URLs are
stable enough to avoid false confidence.

## Regression Targets

- Public route `/:slug`
- Public menu `/:slug/menu`
- Compatibility alias `/:slug/posts`
- QR URL with `src=qr` and `table`
- Business owner menu editor
- Shopping product modal/cart
- Travel search
- Feed city visibility
- Heart Ads approval
- Waiter order status change

## Slow 3G / Cold Load

Do these manually or in a future explicit Playwright run:

- Hard refresh `/:slug/menu`.
- Verify skeleton state, no false `Keine Produkte`, no stuck profile loading.
- Verify focus does not push menu content after products are visible.
- Verify QR opens menu first and preserves cart/order behavior.
