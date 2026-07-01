# Business Tool Test Matrix

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This matrix turns the enterprise readiness audit and P0 browser rehearsal into
the current business tool test map. It focuses on contract, seed, automated and
local browser coverage. It does not activate new runtime behavior, touch
production data or approve production launch.

## Legend

- Automated green: covered by automated unit/rules/functions coverage.
- Browser smoke passed: locally browser-checked against emulator seed.
- Manual required: exact manual steps remain required before launch.
- Blocked: should not launch until the listed blocker is fixed.
- Security risk: launch would risk private data, permission or trust issues.
- Performance risk: not blocked by correctness, but not ready for scale.

## Matrix

| Area                            | Status               | Coverage now                                                                                                                                                                                | Remaining launch work                                                                              |
| ------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Owner login                     | Browser smoke passed | `/menu` preserves the protected route through login and opens the seeded owner context on desktop/mobile.                                                                                   | Keep local owner account bootstrap in the browser launch gate.                                     |
| Business ownership mapping      | Automated green      | Rules tests cover owner writes only for owned business.                                                                                                                                     | Add owner account bootstrap and lead conversion rollback tests.                                    |
| Public profile contract         | Automated green      | Pure route/profile/meta/offers/ads builders, seed parity and mixed restaurant/shop/hotel fixtures cover the field contract.                                                                 | Move public profile read-once hydration off mixed `restaurants/{id}` data before tightening rules. |
| Public/private profile boundary | Automated green      | Rules tests cover guest public reads/private denial; builders recursively reject private fields and return deterministic plain objects.                                                     | Prepare profile/meta runtime cutover; do not tighten root reads until the cutover is verified.     |
| Menu editor price contract      | Browser smoke passed | Unit tests plus Owner E2E prove string prices save and publish as numbers, never strings.                                                                                                   | Keep numeric/null projection assertions in the mutation smoke.                                     |
| Owner menu management           | Browser smoke passed | Own create/edit/delete/publish, foreign-business read-only UI and 12 seeded QR tables pass on desktop/mobile.                                                                               | Add owner order-dashboard mutation proof before pilot operations.                                  |
| Product/shop item management    | Manual required      | Shop public smoke passes and the shop owner reaches the seeded product editor on desktop/mobile.                                                                                            | Add shop owner product create/edit/delete browser proof.                                           |
| Hotel/travel offers             | Manual required      | Hotel public coverage passes; the pure offers builder normalizes numeric prices and strips booking/admin fields.                                                                            | Add hotel owner offer create/edit/delete browser proof.                                            |
| QR table menu context           | Browser smoke passed | Desktop/mobile QR route preserves query and creates callable table order.                                                                                                                   | Keep manual real-device QR scan rehearsal before pilot.                                            |
| Guest order creation            | Browser smoke passed | QR E2E creates callable order with server menu pricing and allowed payload fields.                                                                                                          | Add signed-in customer order variation later.                                                      |
| Waiter login                    | Browser smoke passed | Waiter logs in locally and sees own restaurant order.                                                                                                                                       | Add tablet/manual device proof before pilot.                                                       |
| Waiter order status update      | Browser smoke passed | Waiter changes status; direct writes to total/items and foreign order read are denied.                                                                                                      | Add owner-facing staff lifecycle UI tests.                                                         |
| Staff revocation                | Automated green      | Rules tests cover revoked waiter and stale hints denied.                                                                                                                                    | Add browser revocation session test after staff UI is stable.                                      |
| Heart non-CEO block             | Browser smoke passed | Owner account is blocked from Heart with CEO-required message.                                                                                                                              | Keep this in Heart smoke pack.                                                                     |
| Heart lead mutation             | Browser smoke passed | CEO local browser probe created, updated and deleted a throwaway lead.                                                                                                                      | Add durable E2E spec and audit-log expectations.                                                   |
| Heart local Functions safety    | Browser smoke passed | `/heart?firebase-emulator=1` now uses `127.0.0.1:5001`; production Functions calls are avoided in emulator mode.                                                                            | Keep raw URL assertion in future Heart E2E.                                                        |
| Lead to account conversion      | Manual required      | Existing code path reviewed in audit.                                                                                                                                                       | Needs mutation tests for restaurant, user and public route bootstrap.                              |
| Owner ad submission             | Security risk        | Rules tests document owner/Heart public ads doc boundary.                                                                                                                                   | Do not sell ads until per-ad records or stronger moderation rules exist.                           |
| Heart ad approval               | Blocked              | Heart Ads view loads locally but seed returns count 0/read-only; no approval controls rendered.                                                                                             | Add auditable approval history and approved-only public render contract.                           |
| Public approved-only ads        | Automated green      | The public discovery read uses the ads builder; tests remove pending/rejected/draft/inactive ads and moderation/private targeting fields.                                                   | Replace array ads before paid launch.                                                              |
| Analytics                       | Security risk        | No stable trusted event schema in this P0 block.                                                                                                                                            | Block paid analytics until event, aggregation and permission model exists.                         |
| Public route refresh matrix     | Browser smoke passed | Desktop/mobile direct and refresh checks passed for profile/menu/posts/QR routes.                                                                                                           | Keep route smoke in launch gate.                                                                   |
| Public startup console          | Browser smoke passed | The denied Feed story collection-group read is mapped and no longer scheduled on public startup.                                                                                            | Resolve the collection-group contract separately before Feed stories become a launch gate.         |
| Clean Web loading stability     | Automated green      | Unit coverage now proves public-menu transient unknown retention and Heart CRM list retention; E2E specs check avatar fallbacks, broken loaded images, QR query and Waiter button recovery. | Add real-device mobile/3G rehearsal and durable Heart authenticated E2E before broad launch.       |
| Bundle/performance              | Performance risk     | `npm run build` passed; the tracked `social-app.js` bundle includes the menu save and public-startup gates.                                                                                 | Public runtime extraction and bundle budgets remain later P3 work.                                 |

## Public Projection Builder Block 2026-07-01

Implemented pure builders:

- `buildPublicRouteProjection`
- `buildPublicProfileProjection`
- `buildPublicMetaProjection`
- `buildPublicOffersProjection`
- `buildPublicAdsProjection`

Targeted Node coverage passes for seed parity, restaurant/shop/hotel mixed
inputs, recursive private-field denial, numeric offer prices, approved-only ads
and deterministic serializable output. Public focus offer reads and public
restaurant discovery offers/ads now use the relevant builders.

This closes the missing-builder blocker but does not itself close broad public
root reads. Public read tightening may be prepared from these contracts; it may
not be activated until public profile/meta identity hydration no longer depends
on mixed `restaurants/{id}` rows. Runtime extraction remains behind false
feature flags. Ads remain blocked for paid launch because their mutable array
model is unchanged.

Verification for this block:

- Unit 120/120, Rules 17/17 and Functions 4/4 passed.
- Lint, format check, architecture check and production build passed.
- The current seed passed Public Profile, Public Menu/QR, Shop Owner, Hotel
  Owner and Owner Menu Playwright coverage on desktop/mobile. One desktop Owner
  Menu run observed the known immediate-read projection race after create; the
  same mobile path and the targeted desktop retry passed.
- The tracked `bundled/entry/social-app.js` was rebuilt and is part of this
  block. No runtime feature flag was enabled.

## Manual Browser Matrix To Run Before Launch

| Flow                 | Current state                                                                    | Remaining manual checks                                                                          |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Public restaurant    | Browser smoke passed on desktop/mobile.                                          | Real-device visual pass before pilot.                                                            |
| Public QR/menu/order | Browser smoke passed for QR query, callable order and waiter handoff.            | Real QR scan on phone/table before pilot.                                                        |
| Owner restaurant     | Browser smoke passed on desktop/mobile.                                          | Real-device owner pass plus owner order-dashboard operation before pilot.                        |
| Waiter               | Browser smoke passed for login/order/status; rules cover revoked/stale hints.    | Tablet/mobile device proof and revoked active-session browser proof.                             |
| Heart/CRM            | Browser smoke passed for CEO login, non-CEO block and lead create/update/delete. | Conversion preview/account mapping and durable E2E spec.                                         |
| Ads                  | Blocked/security risk.                                                           | Owner pending ad plus CEO approve/reject only after safer per-ad model or explicit test fixture. |
| Shop                 | Public smoke plus owner editor entry passed.                                     | Shop owner product create/edit/delete.                                                           |
| Hotel/travel         | Public smoke plus Hotel Details/Oferta entry passed.                             | Hotel owner offer create/edit/delete.                                                            |

## Clean Web Pass 2026-07-02

The Clean Web pass fixes visible loading stability without changing Rules,
routes, collections, production data or feature flags. Public Menu retains
existing visible items during transient `unknown` projection reads, Public
Profile avatars use stable last-good image keys while the header settles, Heart
CRM lists retain rows during refresh, and Public/Waiter E2E specs include
fallback, broken-image, empty-state and button recovery checks.

Still manual/P2: shop product mutation, hotel offer mutation, real phone/3G QR
scan, Waiter tablet feel and durable authenticated Heart E2E.

Final verification for this pass: Unit 123/123, Rules 17/17, Functions 4/4,
lint, format, architecture check, build and targeted Playwright 16/16 passed.
The build updated the tracked social bundle and hashed profile-render chunk.

## P0 Exit Criteria

P0 can move to controlled restaurant launch only when:

1. Unit, rules, functions, lint, format, architecture check and build pass.
2. Browser-visible changes have a fresh tracked bundle build.
3. Public projection tests cover allowed and prohibited fields.
4. Browser matrix is recorded for public/menu/QR/order/waiter/Heart.
5. Owner editor, ads and public startup denied-list blockers are closed or
   explicitly held out of P1 scope.
6. Ads and analytics remain disabled or explicitly blocked from paid launch.
