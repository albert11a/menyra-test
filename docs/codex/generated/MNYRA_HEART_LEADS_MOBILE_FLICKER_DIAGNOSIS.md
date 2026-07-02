# MNYRA Heart Leads Mobile Flicker Diagnosis

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This report covers the post-rollback Heart Leads diagnosis work. It does not
claim a product fix for the reported Lead image flicker or Search disruption.
It adds measurement points and a mobile-first regression path so the next fix
can be based on observed cause, not another broad render or CSS guess.

No production deploy, production data write, Firestore Rules loosening, route
rename, collection rename, UI redesign or broad `social-app.js` refactor was
performed.

## Background

Commit `f3963b07` (`fix: stabilize heart leads interactions`) was reverted
because real usage still showed fast Lead profile-image flicker and Search
input disruption. The reverted approach used DOM-local CRM search filtering,
active-search render skips and avatar fallback changes that did not provide
accepted mobile-first evidence.

The current pass intentionally avoids those product fixes. It adds a durable
diagnostic surface to answer these questions:

- Is the Lead card being removed and re-added?
- Is the avatar `src` changing while the card stays mounted?
- Does the Leads list transition from non-empty to empty during refresh?
- Does Search lose focus while the user types?
- Are emulator-mode Heart runs calling production Firebase/Mnyra endpoints?

## Implemented Diagnostic Hooks

| Area                | Hook                                                                             | Purpose                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Lead card           | `data-heart-lead-card`, `data-crm-domain`, `data-crm-card-id`                    | Count card additions/removals and target one diagnostic lead.                                             |
| Lead avatar wrapper | `data-heart-crm-avatar`, `data-heart-crm-avatar-id`, `data-heart-crm-avatar-src` | Distinguish Lead avatar identity and intended image source.                                               |
| Lead avatar image   | `data-heart-crm-avatar-image`, `data-heart-crm-avatar-src`                       | Count `src` mutations and assert image visibility/source.                                                 |
| Mobile E2E observer | `MutationObserver` plus focus sampling                                           | Record card rebuilds, avatar `src` changes, empty-list transitions and Search focus loss.                 |
| Request guard       | external Firebase/Mnyra host matcher                                             | Fail if `firebase-emulator=1` leaks to production hosts while allowing `localhost`/`127.0.0.1` emulators. |

## Local Mobile Evidence

Commands run in the final local pass:

- `node --test tests/auth-shell-chrome-sync.test.mjs tests/heart-crm-read-view-stability.test.mjs`
  passed, 8/8.
- `npx playwright test tests/e2e/heart.spec.ts --config tests/e2e/playwright.config.ts --project=mobile-chrome`
  passed, 1/1.
- Relevant mobile matrix passed, 10/10:
  Public Profile/Menu/QR, Owner/Menu, Waiter and Heart.
- Supporting desktop matrix passed, 9/9:
  Public Profile/Menu/QR, Owner/Menu and Waiter. Heart diagnostic is skipped on
  desktop by design.
- Required baseline passed: Functions 4/4, Rules 17/17, Unit 127/127, lint,
  format check, architecture check and build.
- Bundle status: `npm run build` changed only
  `apps/menyra-social/bundled/entry/social-app.js`; no tracked bundle manifest
  or hashed chunk changed.

The first Heart diagnostic run failed because local Auth emulator requests to
`127.0.0.1:9099` were incorrectly counted as production. The guard was fixed to
exclude `localhost` and `127.0.0.1` while still rejecting external Firebase and
Mnyra production hosts.

## Current Findings

| Finding                                                                         | Status                 | Evidence                                                                                               |
| ------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| Heart Leads now has stable diagnostic DOM markers.                              | Fixed for diagnostics  | `tests/heart-crm-read-view-stability.test.mjs` asserts marker output.                                  |
| Emulator-mode mobile Heart diagnostic can create/read/delete a local test lead. | Verified locally       | `tests/e2e/heart.spec.ts` creates `leads/heart-diagnostic-*` only in local emulators.                  |
| Search value and active focus stayed stable in the local mobile diagnostic run. | Verified locally       | Mobile Heart E2E asserts `Diagnostic` remains in `#leadsSearchInput` and it stays active after typing. |
| Lead card stayed visible after Heart tab navigation and refresh.                | Verified locally       | Mobile Heart E2E waits for the diagnostic card after tab navigation and reload.                        |
| External production Firebase/Mnyra calls in emulator mode.                      | Not reproduced locally | Mobile Heart E2E production request list was empty after the local-emulator guard fix.                 |
| Real phone/3G Lead image flicker.                                               | Open                   | Local Playwright did not reproduce enough to close the user-reported issue.                            |

## Suspected Cause To Validate

Inference from code, not yet proven on a real device: Heart renders from a
broad app render path and can recreate CRM card/image DOM when state changes.
If real mobile flicker reproduces, the diagnostic counters should show whether
the cause is card removal/re-addition, avatar `src` churn, empty-list refresh or
focus loss during a full view re-render.

The next safe product fix should be selected only after those counters identify
the dominant cause. Do not reintroduce DOM-local filtering, broad active-search
render skips or desktop-only CSS as the main fix.

## Required Next Manual Check

Run Heart Leads on a real phone or throttled mobile session against local
emulators:

1. Open `/apps/mnyra-heart/index.html?firebase-emulator=1&view=crmLeads&sw-reset=1`.
2. Log in as `heart.local@example.test`.
3. Search while a Lead with an image is visible.
4. Switch Leads -> Customers -> Leads.
5. Refresh.
6. Record whether images disappear/reappear, whether Search loses focus and
   whether list cards go empty.

If the flicker reproduces, use the E2E observer counters as the acceptance
shape for the next small fix.
