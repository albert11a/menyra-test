# Mnyra Refactor Master Plan

Status: CURRENT
Last updated: 2026-07-01

## Purpose

Prepare Mnyra for a safe, staged enterprise refactor without changing product
behavior in this branch.

This branch does not extract `social-app.js`, does not change routes, does not
redesign UI and does not rename Firestore collections. It creates the tools,
docs, local data, checks and guardrails needed before the real refactor starts.

## Current Runtime Shape

- `apps/menyra-social/social-app.js` is still the main social app entry.
- `apps/menyra-social/social-public-entry.js` is the public startup boundary,
  but it still imports the existing app path later.
- Public business routes use `/:slug`, `/:slug/menu` and the compatibility
  alias `/:slug/posts`.
- QR/menu flows live in the same app tree as public profile, cart/order and
  business profile surfaces.
- Heart/CRM is separated under `apps/mnyra-heart`, with server handlers in
  `functions/heart`.
- Waiter is separated under `apps/waiter`.

## Safe Refactor Order

1. Freeze contracts: routes, public visibility, read/write ownership and
   reserved route truth.
2. Build local emulator seeds and security tests for guest, user, owner, waiter
   and Heart flows.
3. Baseline dependency graph, cycles and bundle size.
4. Extract pure helpers only when covered by tests and when DOM/Firebase
   ownership is unchanged.
5. Add false feature flags for new runtime entries.
6. Split public profile read-only runtime.
7. Split public menu/QR runtime after cart/order and QR table flows are covered.
8. Split waiter runtime after staff authorization and restaurant order visibility
   tests are stable.
9. Split owner/editor runtime after direct client writes are inventoried.
10. Split Heart/CRM admin runtime after CRM facades are locked.
11. Split feed, travel and shopping route runtimes.
12. Harden performance only after truth and ownership are stable.

## Non-goals In This Branch

- No new public renderer is activated.
- No route shape changes are activated.
- No Firestore rules fixes are included unless separately approved.
- No feature is removed.
- No UI spacing, color, typography or layout changes are included.

## Required Baselines Before Real Refactor

- `npm run test:unit`
- `npm run test:rules`
- `npm run test:functions`
- `npm run arch:report`
- `npm run arch:check`
- `npm run arch:cycles`
- `npm run build`
- `npm run bundle:report`
- Playwright only after local URLs and seeds are ready.

## First Recommended Real Refactor

Start with Public Profile or QR/Menu only after the public route/menu parity
checks from the current phase have been manually verified. QR/Menu is the best
first candidate if cart/order and table context tests are ready; otherwise start
with read-only Public Profile.
