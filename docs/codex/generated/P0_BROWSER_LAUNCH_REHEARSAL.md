# P0 Browser Launch Rehearsal

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This rehearsal covered local-only public projection tests and browser smoke
checks for the launch-critical public profile/menu/QR/order/waiter/Heart paths.
It did not deploy, touch production data, rename collections, change routes,
loosen Firestore Rules, redesign UI or start runtime extraction.

## Environment

- Web servers:
  - Existing local social server: `http://127.0.0.1:5173`
  - Fresh Heart re-check server after HTML change: `http://127.0.0.1:5174`
- Firebase emulator project: `mnyra-local`
- Emulator ports:
  - Auth: `127.0.0.1:9099`
  - Firestore: `127.0.0.1:8080`
  - Functions: `127.0.0.1:5001`
- Local seed command: `npm run emulators:seed`
- Seed result: 62 Firestore documents and 6 Auth users seeded locally.
- Browser runner: Playwright, projects `chromium` and `mobile-chrome`.

## Seed Actors

| Actor            | Email                            | Scope                              |
| ---------------- | -------------------------------- | ---------------------------------- |
| Restaurant owner | `owner.local@example.test`       | `pidhi-madh` owner fixture.        |
| Shop owner       | `shop-owner.local@example.test`  | `shop-demo` owner fixture.         |
| Hotel owner      | `hotel-owner.local@example.test` | `hotel-demo` owner fixture.        |
| Waiter           | `waiter.local@example.test`      | `pidhi-madh` waiter fixture.       |
| Heart CEO        | `heart.local@example.test`       | Local CEO/Heart fixture.           |
| Guest            | Anonymous/browser guest          | Public profile/menu/QR order path. |

All actor use was against local emulators only.

## Routes And Viewports

| Route/context                             | Desktop                     | Mobile  |
| ----------------------------------------- | --------------------------- | ------- |
| `/pidhimadh` direct + refresh             | Passed                      | Passed  |
| `/pidhimadh/posts` alias                  | Passed                      | Passed  |
| `/shopdemo` direct + refresh              | Passed                      | Passed  |
| `/shopdemo/posts` alias                   | Passed                      | Passed  |
| `/hoteldemo` direct + refresh             | Passed                      | Passed  |
| `/hoteldemo/posts` alias                  | Passed                      | Passed  |
| `/pidhimadh/menu` direct + refresh        | Passed                      | Passed  |
| `/pidhimadh/menu?src=qr&table=2`          | Passed                      | Passed  |
| `/shopdemo/menu` direct + refresh         | Passed                      | Passed  |
| `/hoteldemo/menu` direct + refresh        | Passed                      | Passed  |
| QR callable order -> waiter board         | Passed                      | Passed  |
| Waiter seeded order/status flow           | Passed                      | Passed  |
| Heart non-CEO block                       | Passed in interactive probe | Not run |
| Heart CEO login/dashboard/local Functions | Passed in interactive probe | Not run |
| Heart lead create/update/delete           | Passed in interactive probe | Not run |

## Automated Commands

- `node --test tests/public-projection-contract.test.mjs tests/menu-price-contract.test.mjs`
  - Passed during implementation.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/qr-menu.spec.ts`
  - Passed, 2 tests.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/public-profile.spec.ts tests/e2e/public-menu.spec.ts tests/e2e/qr-menu.spec.ts tests/e2e/waiter.spec.ts`
  - Passed, 8 tests.

The first QR desktop run failed because the test waited only the default 5s for
`Bestellung gesendet` while the UI was still sending. The assertion was changed
to a 20s timeout and the full four-spec rehearsal passed after that.

## Flow Results

| Flow                            | Result                  | Notes                                                                                                                                                                             |
| ------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public projection contract      | Passed                  | Seed projection docs are whitelisted and recursively reject private fields.                                                                                                       |
| Public profile/menu DOM privacy | Passed                  | Public E2E checks reject owner emails, owner UIDs, billing notes, staff hints and private markers in DOM text.                                                                    |
| Public menu price contract      | Passed                  | Public menu seed prices are numbers or `null`; editor string input saves/publishes numeric prices.                                                                                |
| QR table context                | Passed                  | `src=qr` and `table=2` are preserved and callable order uses server menu pricing.                                                                                                 |
| Waiter status flow              | Passed                  | Waiter login sees own restaurant order, changes status and cannot mutate total/items or read a foreign order.                                                                     |
| Waiter revoked/stale hints      | Automated rules covered | Browser spec covers active waiter; revoked/stale-hint denial remains rules-level in this block.                                                                                   |
| Owner/menu browser mutation     | Blocked/manual required | The public auth prompt is reachable, but owner login did not expose the owner editor/menu surface from a stable local route. `/apps/menyra-social/` rewrites to a public profile. |
| Heart non-CEO block             | Passed                  | Owner session showed `CEO-Zugang erforderlich` in Heart.                                                                                                                          |
| Heart CEO local Functions       | Passed after fix        | `/heart?firebase-emulator=1` now uses `127.0.0.1:5001`, not production Cloud Functions.                                                                                           |
| Heart lead create/update/delete | Passed                  | A throwaway lead was created, renamed and deleted through the browser; the final list was empty.                                                                                  |
| Heart ads                       | Blocked                 | Ads view loads read-only with count 0 in the seed; no pending ad approval controls rendered. Array ads remain a paid-launch blocker.                                              |

## Private Field Leak Check

No public DOM private marker was visible in the passing public profile/menu E2E
run. The new projection contract test also caught a real dirty edit-state risk:
editing an existing menu item could merge old private fields back into the
saved/published item. The save path now replaces the item with the normalized
public-safe item instead of spreading the previous dirty state into it.

## Screenshots And Traces

- Final Playwright run: no retained failure trace.
- `playwright-report/index.html` was generated locally.
- `test-results/.last-run.json` records the final green run.
- The initial QR failure trace was removed by the final passing run.

## Known Browser/Runtime Issues

- Public interactive probe still logged one denied Firestore `list` during
  public startup. It did not break the public DOM smoke, but it should be
  mapped before P1 launch.
- Local seed image URLs use `https://images.example.local`. The E2E fixture now
  fulfills those fake URLs with a local SVG placeholder so browser tests are not
  noisy or network-dependent.
- Owner editor route automation is not stable enough yet for create/edit/delete
  browser coverage.

## Bundle Status

Browser-visible files changed in this block:

- `apps/menyra-social/core/menu/menu-save-utils.js`
- `apps/mnyra-heart/index.html`
- `heart/index.html`
- E2E fixture/spec files

`npm run build` passed on 2026-07-01. The build changed one tracked bundle file:

- `apps/menyra-social/bundled/entry/social-app.js`

That bundle change belongs to the menu save-path normalization fix and is part
of this block.

## P1 Controlled Restaurant Launch Decision

P1 controlled restaurant launch is still blocked.

Blocking items:

- Owner/menu editor browser mutation flow needs a stable local owner entrypoint
  and create/edit/delete/publish/QR settings proof.
- Public profile/meta/offers/ads need dedicated projection builders before
  public reads can be tightened or runtime extraction can activate.
- Heart ads are not launch-safe: the current array model lacks auditable per-ad
  moderation records and the local Ads view had no pending approval controls.
- The public startup denied `list` console error must be mapped or removed.

Allowed next step:

- Continue contract/test preparation and public runtime extraction planning
  behind false flags only. Do not activate extraction or launch paid ads yet.
