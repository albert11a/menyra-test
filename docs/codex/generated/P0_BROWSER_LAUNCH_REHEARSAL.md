# P0 Browser Launch Rehearsal

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This rehearsal covered local-only public projection tests and browser smoke
checks for the launch-critical public profile/menu/QR/order/waiter/owner/Heart
paths. The follow-up also mapped and removed the public-startup denied `list`.
It did not deploy, touch production data, rename collections, change routes,
loosen Firestore Rules, redesign UI or start runtime extraction.

## Rollback Update 2026-07-02

Commit `f3963b07` (`fix: stabilize heart leads interactions`) has been backed
out. The Heart Leads interaction/image stabilization from that commit is not
accepted as solved because real usage still shows fast Lead profile-image
flicker and Search input disruption.

Mnyra is mobile-first. Desktop manual checks are supporting evidence only and
must not be used to close image flicker, Search/input focus, loading stability or
business-tool issues when mobile remains unverified or contradictory. The next
Heart Leads block must be mobile-first diagnosis only.

Rollback verification passed Functions 4/4, Rules 17/17, Unit 123/123, lint,
final format check, architecture check and build. The rollback build did not
change tracked files under `apps/menyra-social/bundled`. Mobile Heart Leads
diagnosis was not run in this rollback.

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

| Route/context                               | Desktop                        | Mobile                                        |
| ------------------------------------------- | ------------------------------ | --------------------------------------------- |
| `/pidhimadh` direct + refresh               | Passed                         | Passed                                        |
| `/pidhimadh/posts` alias                    | Passed                         | Passed                                        |
| `/shopdemo` direct + refresh                | Passed                         | Passed                                        |
| `/shopdemo/posts` alias                     | Passed                         | Passed                                        |
| `/hoteldemo` direct + refresh               | Passed                         | Passed                                        |
| `/hoteldemo/posts` alias                    | Passed                         | Passed                                        |
| `/pidhimadh/menu` direct + refresh          | Passed                         | Passed                                        |
| `/pidhimadh/menu?src=qr&table=2`            | Passed                         | Passed                                        |
| `/shopdemo/menu` direct + refresh           | Passed                         | Passed                                        |
| `/hoteldemo/menu` direct + refresh          | Passed                         | Passed                                        |
| QR callable order -> waiter board           | Passed                         | Passed                                        |
| Waiter seeded order/status flow             | Passed                         | Passed                                        |
| `/menu` owner login/editor/mutation         | Passed                         | Passed                                        |
| `/menu` owner return after `/shopdemo/menu` | Not rerun in desktop project   | Passed                                        |
| `/menu` shop owner editor entry             | Passed                         | Passed                                        |
| `/menu` hotel details/offer entry           | Passed                         | Passed                                        |
| Heart non-CEO block                         | Passed in interactive probe    | Not run                                       |
| Heart CEO login/dashboard/local Functions   | Passed in interactive probe    | Not run                                       |
| Heart lead create/update/delete             | Historical probe only          | Not accepted as mobile visual stability proof |
| Heart Leads image/Search stability          | Open after `f3963b07` rollback | Mobile-first diagnosis required               |

## Automated Commands

- `node --test tests/public-projection-contract.test.mjs tests/menu-price-contract.test.mjs`
  - Passed during implementation.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/qr-menu.spec.ts`
  - Passed, 2 tests.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/public-profile.spec.ts tests/e2e/public-menu.spec.ts tests/e2e/qr-menu.spec.ts tests/e2e/waiter.spec.ts`
  - Passed, 8 tests.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/owner-tool.spec.ts`
  - Passed, 6 tests across desktop and mobile projects.
- `npx playwright test --config tests/e2e/playwright.config.ts tests/e2e/owner-tool.spec.ts tests/e2e/public-profile.spec.ts tests/e2e/public-menu.spec.ts tests/e2e/qr-menu.spec.ts tests/e2e/waiter.spec.ts`
  - Final follow-up matrix passed, 16 tests across desktop and mobile projects.
- `npx playwright test tests/e2e/public-profile.spec.ts tests/e2e/public-menu.spec.ts tests/e2e/owner-tool.spec.ts --config tests/e2e/playwright.config.ts --project=mobile-chrome`
  - P0 context-leak follow-up passed, 7/7 mobile tests.
- `npx playwright test tests/e2e/qr-menu.spec.ts --config tests/e2e/playwright.config.ts --project=mobile-chrome`
  - P0 context-leak follow-up passed, 1/1 mobile QR test.
- Final baseline: Functions 4/4, Rules 17/17 and Unit 111/111 passed;
  lint, format check, architecture check and build also passed.

The first QR desktop run failed because the test waited only the default 5s for
`Bestellung gesendet` while the UI was still sending. The assertion was changed
to a 20s timeout and the full four-spec rehearsal passed after that.

## Owner Entry Point Analysis

- The existing internal Owner/Menu entry is `/menu`; emulator runs add
  `?firebase-emulator=1&sw-reset=1`.
- Route parsing treats `/menu` as a reserved system route with
  `activeTab = "menu"`. It is not normalized as a Public Business Profile.
- For a guest, the pending protected route remains URL truth while the existing
  login prompt opens. After successful Auth, the app-shell profile bootstrap
  keeps the Menu tab and the route registry renders `renderMenuAdminView()`.
- `users/owner-demo` has `role: "business"`, `roles: ["business"]` and
  `restaurantId: "pidhi-madh"`. The restaurant has matching `ownerUid` and
  `ownerEmail`; no local Owner role or Business assignment was missing.
- No feature flag hides the existing Menu/QR owner surface. Restaurant type
  selects Menu plus Table QR; Shop selects Product editor; Hotel selects Hotel
  Details plus Oferta.
- `/apps/menyra-social/` is an app-shell file path, not an Owner entry route.
  Using it in the first rehearsal caused the false conclusion that the Owner
  surface had no stable local entry.

## Flow Results

| Flow                            | Result                  | Notes                                                                                                                                                                                                                  |
| ------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public projection contract      | Passed                  | Seed projection docs are whitelisted and recursively reject private fields.                                                                                                                                            |
| Public profile/menu DOM privacy | Passed                  | Public E2E checks reject owner emails, owner UIDs, billing notes, staff hints and private markers in DOM text.                                                                                                         |
| Public menu price contract      | Passed                  | Public menu seed prices are numbers or `null`; editor string input saves/publishes numeric prices.                                                                                                                     |
| QR table context                | Passed                  | `src=qr` and `table=2` are preserved and callable order uses server menu pricing.                                                                                                                                      |
| Waiter status flow              | Passed                  | Waiter login sees own restaurant order, changes status and cannot mutate total/items or read a foreign order.                                                                                                          |
| Waiter revoked/stale hints      | Automated rules covered | Browser spec covers active waiter; revoked/stale-hint denial remains rules-level in this block.                                                                                                                        |
| Owner/menu browser mutation     | Passed                  | `/menu` is the existing protected owner entry. Owner login opens `pidhi-madh`; create/edit/delete/publish, string-to-number price, foreign-business read-only behavior and 12 seeded QR tables pass on desktop/mobile. |
| Business context isolation      | Passed on mobile        | Restaurant owner opens `/shopdemo/menu`, returns to `/menu`, sees `PIDHImadh`, `Local Breakfast Plate` and `Lunch Combo`, and does not see `Local Cotton Shirt` or `Shop Focus` after return/refresh.                  |
| Shop owner entry                | Passed/light proof      | `shop-owner.local@example.test` opens the `shop-demo` product editor on desktop/mobile; product mutation remains a later vertical-specific test.                                                                       |
| Hotel owner entry               | Passed/light proof      | `hotel-owner.local@example.test` opens Hotel Details and Oferta controls on desktop/mobile; offer mutation remains a later vertical-specific test.                                                                     |
| Public startup denied `list`    | Resolved                | The legacy Feed `collectionGroup("stories")` read was scheduled after restaurant loading on public routes. Global story loading is now deferred to the Feed tab without a Rules change.                                |
| Heart non-CEO block             | Passed                  | Owner session showed `CEO-Zugang erforderlich` in Heart.                                                                                                                                                               |
| Heart CEO local Functions       | Passed after fix        | `/heart?firebase-emulator=1` now uses `127.0.0.1:5001`, not production Cloud Functions.                                                                                                                                |
| Heart lead create/update/delete | Historical probe only   | A throwaway lead was previously created, renamed and deleted through the browser; this does not close the mobile-first Lead image flicker/Search disruption now open after `f3963b07` rollback.                        |
| Heart ads                       | Blocked                 | Ads view loads read-only with count 0 in the seed; no pending ad approval controls rendered. Array ads remain a paid-launch blocker.                                                                                   |

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

## Resolved Browser/Runtime Findings And Known Issues

- Clean Web follow-up on 2026-07-02 addressed the visible loading issues found
  after the public projection builder block: public menu keeps existing visible
  items during transient `unknown` reads, profile avatars/logos use stable
  last-good image keys during settling, profile avatar images have explicit
  fallbacks and Heart CRM lists keep populated rows visible during refresh.
- The later Heart Leads follow-up `f3963b07` was reverted after real usage
  showed profile-image flicker and Search disruption remained or worsened. This
  issue is open and requires mobile-first diagnosis before any new fix.
- The Clean Web targeted browser matrix passed after rebuilding tracked bundles:
  Public Profile/Menu/QR, Owner/Menu and Waiter passed 16/16 across desktop and
  mobile.
- The P0 business context regression passed on mobile Chrome: restaurant owner
  return from `/shopdemo/menu` to `/menu` does not show shop Menu/Focus data.
- The public-startup denied `list` is mapped in
  `docs/codex/generated/PUBLIC_STARTUP_DENIED_LIST_AUDIT.md` and no longer
  occurs in the targeted public startup smoke.
- `/menu`, not `/apps/menyra-social/`, is the existing protected Owner/Menu
  entry point. The app shell preserves it through the login prompt and switches
  to the authenticated owner context after profile bootstrap.

## Current Clean Web Follow-Up 2026-07-02

This follow-up ran against local emulators and the existing local server on
`http://127.0.0.1:5173`. It seeded only `mnyra-local` data and made no
production writes or deploys.

New browser evidence:

- Mobile Chrome targeted Playwright passed 10/10 for Public Profile/Menu/QR,
  Owner/Menu, Waiter and Heart Leads diagnostics.
- Desktop Chromium targeted Playwright passed 9/9 for the same public, owner
  and waiter flows; Heart diagnostic was skipped by design outside
  `mobile-chrome`.
- Heart Leads diagnostic E2E now asserts no external production Firebase/Mnyra
  requests in emulator mode, no permission-denied console errors, stable Search
  value/focus during typed Search, visible lead cards after tab navigation and
  visible lead cards/images after refresh.

New fixed browser-visible gap:

- Shell header/restoring-session/drawer avatars now expose fallback sources for
  the existing app-shell image fallback binder.

Open browser launch blockers:

- Heart Leads image flicker/Search disruption is still open as a P1
  mobile-first product issue if it reproduces on real phone/3G. The current
  work adds diagnostics and guardrails; it does not claim product closure.
- Shop product mutation and Hotel offer mutation media/list stability remain
  P2 manual/vertical-specific coverage gaps.

Final required baseline for this follow-up passed: Functions 4/4, Rules 17/17,
Unit 127/127, lint, format check, architecture check and build. The build
changed only `apps/menyra-social/bundled/entry/social-app.js`; no tracked
bundle manifest or hashed chunk changed. The existing large `social-app.js`
chunk warning remains a P3 performance/runtime-extraction risk.

- Local seed image URLs use `https://images.example.local`. The E2E fixture now
  fulfills those fake URLs with a local SVG placeholder so browser tests are not
  noisy or network-dependent.
- Shop product mutation and hotel offer mutation are still manual follow-ups;
  this block proves only their owner-context entry surfaces.
- Real-device mobile/3G checks remain required for QR/menu image decode,
  tap-target feel and tablet Waiter operation.
- Desktop-only Heart evidence is not an acceptance criterion for the open Lead
  image/Search flicker issue.

## Bundle Status

Browser-visible files changed in this block:

- `apps/menyra-social/core/menu/menu-save-utils.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
- `apps/mnyra-heart/index.html`
- `heart/index.html`
- E2E fixture/spec files

`npm run build` passed on 2026-07-01. The build changed one tracked bundle file:

- `apps/menyra-social/bundled/entry/social-app.js`

The current follow-up rebuild keeps that tracked bundle current and adds the
public-route Feed-story scheduling gate. The bundle change is part of this
block and is included in the final commit. The build retained the existing
large-chunk warning (`social-app.js` 1,129.72 kB, 306.53 kB gzip); this remains
the documented P3 bundle/performance risk and did not fail the build.

Clean Web rebuild on 2026-07-02 updated the tracked social bundle again:

- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- deleted old hashed profile render chunk
  `profile-menu-focus-render-controller-ClqNBCUU.js`
- added new hashed profile render chunk
  `profile-menu-focus-render-controller-lbWlArsR.js`

P0 context-leak rebuild on 2026-07-02 updated tracked browser bundle output:

- `apps/menyra-social/bundled/entry/social-app.js`
- `apps/menyra-social/bundled/manifest.json`
- deleted old hashed profile open-flow chunk
  `profile-open-flow-utils-nDcq3JLz.js`
- added new hashed profile open-flow chunk
  `profile-open-flow-utils-DRWhfuTW.js`

## P1 Controlled Restaurant Launch Decision

The Owner/Menu mutation and public-startup denied-list blockers are closed.
P1 controlled restaurant launch is still not approved by this report.

Blocking items:

- Public profile/meta/offers/ads need dedicated projection builders before
  public reads can be tightened or runtime extraction can activate.
- Heart ads are not launch-safe: the current array model lacks auditable per-ad
  moderation records and the local Ads view had no pending approval controls.
  Ads must remain explicitly outside the controlled restaurant launch scope.
- Owner order-dashboard management and real-device QR/table operation remain
  manual pilot checks; this task covered Owner/Menu/QR settings, not owner order
  operations.

Allowed next step:

- Run a separate mobile-first Heart Leads flicker diagnosis and keep
  Ads/analytics disabled. Public Read Cutover and runtime extraction must not
  start from this report without a new explicit task.

## Restaurant Pilot Readiness Extension 2026-07-02

The separate Restaurant Pilot audit now maps data loading, loading states, empty
states, error states and slow/race states for the guest -> QR -> order -> waiter
-> owner flow.

New mobile-first automated evidence:

- Public Menu seeded routes, QR refresh, empty-menu fixture, missing menu
  projection fixture and invalid table sanitizing passed on mobile Chrome.
- QR order double-submit produced exactly one order in local Firestore.
- Waiter status change plus refresh kept the order visible under the next
  status tab.
- Unit coverage proves Public Menu error state requires real error truth and
  order submit loading releases after real submit errors.

Still not a P1 launch approval:

- Owner order-dashboard loading/empty/error handling is not yet durable browser
  evidence.
- Disabled/deleted menu item in cart still needs focused server/error
  simulation.
- Real phone/3G QR/table operation and image-decode behavior are still manual.
- Heart Leads image/Search flicker remains a separate P1 support-console issue.

Final verification for this extension passed: Functions 4/4, Rules 17/17, Unit
130/130, lint, format check, architecture check, build and relevant Playwright
25/25 with one intentional desktop Heart skip. The build changed no tracked
bundle files.

## Restaurant Pilot Gap Review 2026-07-02

The follow-up hard review is recorded in
`docs/codex/generated/MNYRA_RESTAURANT_PILOT_GAP_REVIEW.md`.

This is not a launch approval. It confirms:

- Public Profile/Menu/QR, guest order submit, Waiter status refresh and Owner
  menu editing have meaningful automated local evidence.
- Owner Order Dashboard still lacks browser proof for owner list, empty,
  loading, error and foreign-order non-visibility states.
- Signed-in customer order, disabled/deleted cart item handling, forced
  owner/waiter order load errors and active-session staff revocation are not
  proven.
- Real phone/3G QR scan, image decode and waiter tablet behavior are still
  manual P1 rehearsal items.

## Owner Orders Follow-Up 2026-07-02

The Owner Orders rehearsal gap is narrowed but not fully closed:

- New mobile browser evidence opens `/orders` as the restaurant owner, keeps the
  seeded order visible after refresh and confirms a foreign shop order is not
  shown.
- New mobile browser evidence opens `/orders` as a shop owner with no shop
  orders and confirms the clean `Noch keine Bestellungen` state without
  cross-filled restaurant data.
- Renderer unit coverage now keeps existing order cards visible during refresh
  loading/error states.

Remaining P1 rehearsal items: forced owner/waiter load errors,
disabled/deleted cart item UX, active-session staff revocation and real
phone/3G QR/tablet checks.

Verification update: the Owner Orders follow-up passed Functions 4/4 after a
full emulator restart and reseed, Rules 17/17, Unit 133/133, lint, format,
architecture check, build and relevant Playwright 29/29 with one intentional
desktop Heart skip. Mobile Chrome Playwright was included; real phone/3G is
still manual. Build changed `apps/menyra-social/bundled/entry/social-app.js`.

## Mobile Manual Stability Sweep 2026-07-02

The sweep used fresh Pixel 5 contexts for Cold, isolated/private-equivalent,
Warm/Refresh, Fast 3G, Slow 3G and Offline/Recover states. It covered the full
restaurant/shop/hotel public matrix, Owner Menu/Orders, Waiter, Heart,
Feed/Restaurants/Travel/Shopping/Map and cross-business navigation.

Normal-network and cross-business paths did not expose wrong business/order
data. QR query/history stayed stable. The launch rehearsal still fails overall:

- public routes are blank for about 11.1 s Fast 3G / 41.8 s Slow 3G;
- Heart mobile Search focus was lost in the diagnostic trace;
- Feed logs a denied story list;
- a safe physical-phone LAN emulator path and real-device media/QR proof are
  absent.

`agent-browser` was unavailable; Playwright/manual browser emulation was used.
No real device was tested and no launch-go is issued.

## Public Startup Shell Product Review Removal 2026-07-02

The Public Startup Shell from `16be1d0d` was removed after product review. It
was a cosmetic mitigation only; Mnyra should not hide the measured 3G startup
problem behind a generic shell, skeleton, dummy content or hidden business data.
This cleanup does not change routes, Firestore Rules, collections, production
data, Ads, Analytics, Heart, Feed, Shop/Hotel mutations or runtime extraction.

Updated launch interpretation:

- Public startup can again show an empty `#app` root under constrained startup
  before the public bundle/runtime arrives. This is an expected open P1 visible
  defect, not a regression to hide.
- The structural cause remains P3 public runtime/bundle work: split Public
  Profile and Public Menu/QR runtime, avoid unneeded Firebase/Auth/Firestore
  before public first content, make route-specific public entry points and set
  bundle budgets.
- Public/QR production-isolation and the broken menu-image request-loop fix
  remain required retained fixes.
- Feed story permission, forced Owner/Waiter listener errors, disabled/deleted
  cart item UX and real phone/3G QR/media/tablet checks remain open.

There is no launch-go.

Cleanup verification after shell removal:

- Shell-specific source/output markers were absent after build.
- Mobile Public route probe passed cold isolated, refresh and warm states for
  `/pidhimadh`, `/pidhimadh/menu`, `/pidhimadh/menu?src=qr&table=2`,
  `/pidhimadh/posts`, `/shopdemo` and `/hoteldemo`.
- Back/Forward preserved QR source/table state.
- Production Firebase/Functions request count was `0` in emulator mode.
- Broken responsive image request loop remained bounded: `8` failed fake image
  requests, `0` visible broken images.
- Slow 3G on `/pidhimadh/menu` had an empty body after 12s and real menu
  content after about `44.5 s`; this remains a P1 launch blocker.
- Non-Heart Playwright passed `32/32`. Full matrix with existing Heart
  diagnostic ended `32 passed`, `1 failed`, `1 skipped` because the known mobile
  Heart Search diagnostic still fails.
- Functions `4/4`, Rules `17/17`, Unit `134/134`, lint, format check,
  architecture check and build passed. The build kept the known large
  `social-app.js` warning and changed no tracked bundled browser files.
- Local `127.0.0.1:5173` returned HTTP 200; the old configured
  `192.168.1.168:5173` LAN URL timed out on this network; current WLAN
  `172.20.10.3:5173` returned HTTP 200.
