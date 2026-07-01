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

| Area                            | Status               | Coverage now                                                                                                     | Remaining launch work                                                                      |
| ------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Owner login                     | Browser smoke passed | `/menu` preserves the protected route through login and opens the seeded owner context on desktop/mobile.        | Keep local owner account bootstrap in the browser launch gate.                             |
| Business ownership mapping      | Automated green      | Rules tests cover owner writes only for owned business.                                                          | Add owner account bootstrap and lead conversion rollback tests.                            |
| Public profile contract         | Browser smoke passed | Contract docs, seed projection tests and public route browser smoke cover restaurant/shop/hotel.                 | Move runtime reads off mixed `restaurants/{id}` data before tightening rules.              |
| Public/private profile boundary | Automated green      | Rules tests cover guest public reads/private denial; projection tests reject forbidden fields.                   | Add pure builders for profile/meta/offers/ads before runtime extraction.                   |
| Menu editor price contract      | Browser smoke passed | Unit tests plus Owner E2E prove string prices save and publish as numbers, never strings.                        | Keep numeric/null projection assertions in the mutation smoke.                             |
| Owner menu management           | Browser smoke passed | Own create/edit/delete/publish, foreign-business read-only UI and 12 seeded QR tables pass on desktop/mobile.    | Add owner order-dashboard mutation proof before pilot operations.                          |
| Product/shop item management    | Manual required      | Shop public smoke passes and the shop owner reaches the seeded product editor on desktop/mobile.                 | Add shop owner product create/edit/delete browser proof.                                   |
| Hotel/travel offers             | Manual required      | Hotel public coverage passes and the hotel owner reaches Hotel Details/Oferta controls on desktop/mobile.        | Add hotel owner offer create/edit/delete browser proof.                                    |
| QR table menu context           | Browser smoke passed | Desktop/mobile QR route preserves query and creates callable table order.                                        | Keep manual real-device QR scan rehearsal before pilot.                                    |
| Guest order creation            | Browser smoke passed | QR E2E creates callable order with server menu pricing and allowed payload fields.                               | Add signed-in customer order variation later.                                              |
| Waiter login                    | Browser smoke passed | Waiter logs in locally and sees own restaurant order.                                                            | Add tablet/manual device proof before pilot.                                               |
| Waiter order status update      | Browser smoke passed | Waiter changes status; direct writes to total/items and foreign order read are denied.                           | Add owner-facing staff lifecycle UI tests.                                                 |
| Staff revocation                | Automated green      | Rules tests cover revoked waiter and stale hints denied.                                                         | Add browser revocation session test after staff UI is stable.                              |
| Heart non-CEO block             | Browser smoke passed | Owner account is blocked from Heart with CEO-required message.                                                   | Keep this in Heart smoke pack.                                                             |
| Heart lead mutation             | Browser smoke passed | CEO local browser probe created, updated and deleted a throwaway lead.                                           | Add durable E2E spec and audit-log expectations.                                           |
| Heart local Functions safety    | Browser smoke passed | `/heart?firebase-emulator=1` now uses `127.0.0.1:5001`; production Functions calls are avoided in emulator mode. | Keep raw URL assertion in future Heart E2E.                                                |
| Lead to account conversion      | Manual required      | Existing code path reviewed in audit.                                                                            | Needs mutation tests for restaurant, user and public route bootstrap.                      |
| Owner ad submission             | Security risk        | Rules tests document owner/Heart public ads doc boundary.                                                        | Do not sell ads until per-ad records or stronger moderation rules exist.                   |
| Heart ad approval               | Blocked              | Heart Ads view loads locally but seed returns count 0/read-only; no approval controls rendered.                  | Add auditable approval history and approved-only public render contract.                   |
| Public approved-only ads        | Automated green      | Projection tests require approved-only, display-safe public ads and no moderation UIDs.                          | Replace array ads before paid launch.                                                      |
| Analytics                       | Security risk        | No stable trusted event schema in this P0 block.                                                                 | Block paid analytics until event, aggregation and permission model exists.                 |
| Public route refresh matrix     | Browser smoke passed | Desktop/mobile direct and refresh checks passed for profile/menu/posts/QR routes.                                | Keep route smoke in launch gate.                                                           |
| Public startup console          | Browser smoke passed | The denied Feed story collection-group read is mapped and no longer scheduled on public startup.                 | Resolve the collection-group contract separately before Feed stories become a launch gate. |
| Bundle/performance              | Performance risk     | `npm run build` passed; the tracked `social-app.js` bundle includes the menu save and public-startup gates.      | Public runtime extraction and bundle budgets remain later P3 work.                         |

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

## P0 Exit Criteria

P0 can move to controlled restaurant launch only when:

1. Unit, rules, functions, lint, format, architecture check and build pass.
2. Browser-visible changes have a fresh tracked bundle build.
3. Public projection tests cover allowed and prohibited fields.
4. Browser matrix is recorded for public/menu/QR/order/waiter/Heart.
5. Owner editor, ads and public startup denied-list blockers are closed or
   explicitly held out of P1 scope.
6. Ads and analytics remain disabled or explicitly blocked from paid launch.
