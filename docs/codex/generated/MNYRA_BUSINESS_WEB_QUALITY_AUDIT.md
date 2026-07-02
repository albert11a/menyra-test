# MNYRA Business Web Quality Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Current Rollback Note

Commit `f3963b07` (`fix: stabilize heart leads interactions`) has been backed
out. The follow-up Heart Leads fix is no longer accepted as solved because real
usage still shows, and may worsen, profile-image flicker in the Leads list.

The affected symptoms remain open:

- Lead profile image appears and disappears in fast repeated states.
- Search input is hard to use while the image/card flicker is active.
- The user may need to click Search again after the flicker stops.
- Green desktop or DOM-marker tests are not sufficient evidence for closing the
  issue.

## Mobile-First Rule

Mnyra is mobile-first. Business-tool acceptance must prioritize real phone or
mobile-viewport behavior over desktop-only manual checks. Desktop manual testing
can support a decision, but it is not the launch criterion for image flicker,
input focus, loading stability or business-tool usability.

If desktop and mobile disagree, mobile wins until the mobile issue is diagnosed.
No desktop-only CSS change should be accepted as the main solution for a mobile
business problem.

## Business Tool Status

| Area                   | Status                          | Notes                                                                                                     | Next action                                                          |
| ---------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Public profile/menu/QR | Clean-Web fixes remain in place | Existing public image/menu retention work from `aaf902d0` remains the baseline.                           | Keep mobile real-device QR/menu checks before launch.                |
| Business context       | P0 fixed in current task        | Own profile/menu return now clears stale public direct-entry and wrong-business Menu/Focus state.         | Keep the new mobile owner-return Playwright case in the launch gate. |
| Owner menu             | P0 context bleed fixed          | Restaurant owner returning from `/shopdemo/menu` to `/menu` shows `pidhi-madh` Menu/Focus, not shop data. | Add shop/hotel owner return E2E when vertical mutation tests expand. |
| Waiter board           | Clean-Web baseline remains      | No new waiter fix was added in this rollback.                                                             | Keep tablet/mobile status-flow rehearsal in launch gate.             |
| Heart Leads            | Open                            | `f3963b07` was reverted; Lead image flicker and Search disruption remain unresolved.                      | Run a separate mobile-first diagnosis before any new fix.            |
| Shop products          | Manual/P2                       | Product mutation image/list stability is not yet durable launch evidence.                                 | Add vertical-specific mobile-first mutation coverage later.          |
| Hotel offers           | Manual/P2                       | Offer/details mutation image/list stability is not yet durable launch evidence.                           | Add vertical-specific mobile-first mutation coverage later.          |

## P0 Business Context Leak Fix 2026-07-02

Finding: a signed-in business owner could view a public business and then return
to the own profile/menu while stale public direct-entry, Menu or Focus state
from the previous business remained eligible for rendering. This was a P0 trust
issue because Mnyra must never show Header/Profile from Business A with
Menu/Focus from Business B.

Fix: `openOwnBusinessProfile()` now deactivates stale public direct-entry state,
clears the public route bootstrap and retargets wrong-business public Menu/Focus
payloads to the signed-in business before own data loads. App shell and feed
profile navigation now call the same own-profile opener instead of bypassing the
cleanup.

Mobile evidence: the new mobile Chrome regression logs in as
`owner.local@example.test`, opens `/shopdemo/menu`, returns to `/menu`, verifies
`PIDHImadh`, `Local Breakfast Plate` and `Lunch Combo`, and verifies
`Local Cotton Shirt` and `Shop Focus` are absent after return and refresh.

Final verification: Functions 4/4, Rules 17/17, Unit 124/124, lint, format
check, architecture check and build passed. Mobile Playwright passed Public
Profile/Menu/Owner 7/7 and QR Menu 1/1. The build updated the tracked social
bundle, manifest and hashed `profile-open-flow-utils` chunk.

Remaining risk: shop-owner and hotel-owner return flows use the same generic
fix path but should get dedicated mobile E2E coverage when those verticals move
from manual/P2 mutation status.

## Not Done In This Rollback

- No new Heart Leads fix was implemented.
- No Firestore Rules were loosened.
- No production data, accounts, leads, orders or ads were changed.
- No production deploy was run.
- No routes or collections were renamed.

## Required Follow-Up

Run the next Heart Leads block as mobile-first diagnosis only. It should observe
image `src` changes, card rebuilds, Lead reload frequency, avatar URL value/null
transitions, fallback/onerror behavior and background refresh overwrites before
choosing a fix.

## Rollback Verification

Rollback checks passed: Functions 4/4, Rules 17/17, Unit 123/123, lint, final
format check, architecture check and build.

The first format check flagged only `seed/data/mnyra-local-seed.json` and
`tests/e2e/heart.spec.ts` after the revert. Prettier was applied to those two
revert-affected files and the repeated format check passed.

Bundle status: `npm run build` did not change tracked files under
`apps/menyra-social/bundled`. Mobile Heart Leads diagnosis was not run in this
rollback and remains the next separate block.
