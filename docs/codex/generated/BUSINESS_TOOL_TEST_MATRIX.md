# Business Tool Test Matrix

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This matrix turns the enterprise readiness audit into the first P0 business
tool test map. It focuses on contract, seed and automated coverage. It does not
activate new runtime behavior, run browser smoke tests, touch production data or
approve production launch.

## Legend

- Green: covered by current automated tests or a stable local baseline.
- Yellow: partially covered; needs manual browser proof or deeper tests.
- Red: unsafe or incomplete for paid launch.
- Manual: must be checked in browser/device flow before launch.
- Blocked: should not be sold or launched before contract/rules work.

## Matrix

| Area                            | Status | Automated coverage in this P0 block                                          | Remaining launch work                                                                 |
| ------------------------------- | ------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Owner login                     | Yellow | Seed actors exist for restaurant, shop and hotel owners.                     | Manual browser login/session check required.                                          |
| Business ownership mapping      | Yellow | Rules tests cover owner writes only for owned business.                      | Add owner account bootstrap/lead conversion rollback tests.                           |
| Public profile contract         | Yellow | Contract doc and seed projection docs added.                                 | Move runtime reads off mixed `restaurants/{id}` public data before tightening rules.  |
| Public/private profile boundary | Yellow | Rules tests cover guest public reads and private/internal denial.            | Add projection builder tests for every public field.                                  |
| Menu editor price contract      | Green  | Unit tests cover editor string price saved/published as numeric price.       | Run manual menu editor smoke before launch.                                           |
| Owner menu management           | Yellow | Rules tests cover own menu/public menu write and cross-business denial.      | Manual create/edit/delete/publish browser matrix required.                            |
| Product/shop item management    | Yellow | Shop owner seed and public menu projection exist.                            | Add product visibility, stock and owner UI tests.                                     |
| Hotel/travel offers             | Yellow | Hotel owner seed and public offers projection exist.                         | Add offer edit/contact/booking semantics tests.                                       |
| QR table menu context           | Yellow | Seed includes table QR metadata and order lookup fixture.                    | Manual QR open/order flow on mobile required.                                         |
| Guest order creation            | Green  | Existing function/rules tests deny direct Firestore writes and trust prices. | Manual callable QR order rehearsal required before launch.                            |
| Waiter login                    | Yellow | Waiter seed actor and staff docs exist.                                      | Manual waiter app login/session check required.                                       |
| Waiter order status update      | Green  | Rules tests cover constrained order status updates.                          | Manual tablet/mobile order board proof required.                                      |
| Staff revocation                | Yellow | Rules tests cover revoked waiter and stale hints denied.                     | Add owner-facing staff lifecycle UI tests.                                            |
| Heart lead mutation             | Yellow | Rules tests cover CEO create/update/delete and non-CEO denial.               | Add Heart handler audit log and conversion tests.                                     |
| Lead to account conversion      | Yellow | Existing code path reviewed in audit.                                        | Needs mutation tests for restaurant, user and public route bootstrap.                 |
| Owner ad submission             | Red    | Rules tests document owner/Heart public ads doc boundary.                    | Do not sell ads until per-ad records or stronger moderation rules exist.              |
| Heart ad approval               | Red    | Rules tests cover CEO write, but public array model is too coarse.           | Add auditable approval history and approved-only public render contract.              |
| Analytics                       | Red    | No stable trusted event schema in this P0 block.                             | Block paid analytics until event, aggregation and permission model exists.            |
| Public route refresh matrix     | Manual | Routes documented; no browser smoke requested.                               | Direct refresh/mobile checks for `/:slug`, `/:slug/menu`, `/:slug/posts`, QR context. |
| Bundle/performance              | Red    | Build remains required after browser-visible source changes.                 | Public runtime extraction and bundle budgets remain later P3 work.                    |

## Manual Browser Matrix To Run Before Launch

| Flow                 | Required checks                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| Public restaurant    | Direct open, refresh, menu open, posts alias, private data absent, mobile layout.                       |
| Public QR/menu/order | QR query preserved, table shown where expected, callable order succeeds, direct Firestore create fails. |
| Owner restaurant     | Login, profile edit, menu create/edit/delete, publish public menu, QR table config.                     |
| Waiter               | Login, order list, status update, revoke staff, verify stale session loses access.                      |
| Heart/CRM            | Login, lead create/update/delete, conversion preview, owner account mapping, ad moderation.             |
| Shop                 | Shop owner login, public profile, product create/edit/delete, public product menu projection.           |
| Hotel/travel         | Hotel owner login, public profile, offer create/edit/delete, public offers projection.                  |

## P0 Exit Criteria

P0 can move to controlled restaurant launch only when:

1. Unit, rules, functions, lint, format, architecture check and build pass.
2. Browser-visible changes have a fresh tracked bundle build.
3. Public projection tests cover allowed and prohibited fields.
4. Manual browser matrix is recorded for restaurant public/menu/QR/order/waiter.
5. Ads and analytics remain disabled or explicitly blocked from paid launch.
