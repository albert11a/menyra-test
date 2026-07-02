# MNYRA UI Stability Loading Audit

Status: CURRENT
Generated: 2026-07-02
Branch: `mnyrasocial`

## Scope

This report records the Clean Web loading pass. It focuses on visible first
load, refresh, image fallback, list retention and action-button stability. It
does not approve production deploys, production data writes, Firestore Rules
loosening, route/collection changes, Public Read Tightening, runtime extraction
or a broad `social-app.js` refactor.

## Fixed In This Pass

| Surface             | Problem                                                                                         | Fix                                                                                                                                     | Coverage                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Public Menu/QR      | Visible menu items could be cleared while a transient public read returned `unknown`.           | Current visible public menu items are retained during `pendingCanonical` unknown refreshes; real `knownEmpty` still clears.             | `tests/session-data-menu-focus-no-hang.test.mjs` plus Public Menu/QR E2E.      |
| Public Profile      | Avatar/logo could fall back to icon during settling if the current snapshot lacked `avatar`.    | Public avatars now use the existing stable image key lookup and may render the last good image while the header is settling.            | Public Profile E2E checks avatar fallback attributes and broken loaded images. |
| Public/Self Avatars | Avatar images lacked explicit fallback attributes in key profile markup.                        | Avatar `<img>` output now includes `data-fallback-src`.                                                                                 | Public Profile E2E and existing image fallback binding.                        |
| Heart CRM           | Populated Leads/Customers/Ads/Staff lists were replaced by a loading block during refresh.      | `renderSectionList` keeps rows visible and appends a refresh notice only when rows already exist.                                       | `tests/heart-crm-read-view-stability.test.mjs`.                                |
| Heart Leads Search  | Search keypresses and unrelated background updates remounted the active Leads DOM.              | Active CRM search now filters existing rows without full render, and skips unrelated renders while the visible section stays unchanged. | `tests/e2e/heart.spec.ts` desktop/mobile focus and avatar DOM stability.       |
| Heart Leads Avatars | Lead/customer/ad/staff CRM cards lacked stable image keys and same-container fallback initials. | CRM avatars now carry stable image/source attributes and fallback initials for broken image URLs.                                       | `tests/heart-crm-read-view-stability.test.mjs`.                                |
| Heart Desktop Shell | Sidebar CSS order made the desktop drawer occupy the whole viewport.                            | A later desktop media override restores the 320px sidebar column and keeps the main content clickable.                                  | Heart E2E reproduced pointer interception before the fix and passed after.     |
| Waiter              | Status button recovery needed automated coverage.                                               | Waiter E2E now verifies the next status button is visible and enabled after status change.                                              | `tests/e2e/waiter.spec.ts`.                                                    |

## Still Open

| Surface               | Open item                                                                                       | Priority | Required follow-up                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| Shop Owner            | Product create/edit/delete image stability is not yet durable E2E coverage.                     | P2       | Add vertical-specific shop product mutation test before selling shop mode.    |
| Hotel Owner           | Offer/details create/edit/delete image stability is not yet durable E2E coverage.               | P2       | Add hotel offer/details mutation test before selling hotel/travel mode.       |
| Heart Lead Mutations  | Lead create/edit/delete remains previously manual/browser-probed, not a durable mutation spec.  | P1       | Add dedicated authenticated Heart mutation E2E with cleanup/audit assertions. |
| Feed/Discovery/Social | Authenticated social/travel/shopping surfaces can still reveal broader app-shell loading churn. | P2       | Keep out of P1 launch; test separately before those surfaces are promised.    |
| Real mobile/3G        | Browser emulation cannot prove real device image decode, tap targets or QR scan behavior.       | P2       | Manual phone/tablet and throttled-network launch rehearsal remains required.  |

## Manual Checks Required Before Launch

1. Real phone direct load and refresh for `/pidhimadh`, `/pidhimadh/menu` and
   `/pidhimadh/menu?src=qr&table=2`.
2. Real QR scan preserving `src=qr` and `table`.
3. Owner `/menu` edit/publish pass on a phone-sized viewport.
4. Waiter tablet board status update pass.
5. Heart Leads search, tab switch and create/edit/delete pass on a real browser
   session; the search/tab path now has desktop/mobile Playwright coverage, the
   mutation path still needs a durable cleanup spec.
6. Shop product and Hotel offer mutation image pass when those verticals enter
   launch scope.

## Verification

Final local verification for this pass:

- Unit: `npm run test:unit` passed, 124/124.
- Rules: `npm run test:rules` passed, 17/17, after starting the local
  emulators.
- Functions: `npm run test:functions` passed, 4/4, after the emulator was warm.
- Static checks: lint, format and architecture check passed.
- Build: `npm run build` passed. The Heart Leads follow-up build did not change
  tracked Social bundle files.
- Browser: targeted Playwright passed, 16/16, covering Public Profile/Menu/QR,
  Owner/Menu and Waiter on desktop and mobile. Heart follow-up E2E passed 4/4
  across Chromium and Mobile Chrome for non-CEO block, CEO Leads search,
  stable avatar DOM and tab navigation.
