# Bundle Analysis Report

Generated: 2026-10-12T10:20:12.840Z

Scope: current Vite output in `apps/menyra-social/bundled`.

## Largest bundle files

| File | Raw | Gzip |
| --- | ---: | ---: |
| `apps/menyra-social/bundled/entry/social-app.js` | 511.8 kB | 137.3 kB |
| `apps/menyra-social/bundled/chunks/vendor-firebase-D7Ks7H8l.js` | 453.9 kB | 136.2 kB |
| `apps/menyra-social/bundled/chunks/domain-feed-social-eager-Cm4N_JU6.js` | 375.4 kB | 108.6 kB |
| `apps/menyra-social/bundled/chunks/domain-dashboard-B852JR7I.js` | 188.3 kB | 58.1 kB |
| `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-Bnjvi--2.js` | 193.3 kB | 49.2 kB |
| `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-Y5peCSqd.js` | 83.9 kB | 23.7 kB |
| `apps/menyra-social/bundled/chunks/domain-menu-eager-DziUQlMt.js` | 81.2 kB | 23.6 kB |
| `apps/menyra-social/bundled/chunks/domain-auth-Bp-V_YK4.js` | 79.0 kB | 21.8 kB |
| `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-DeKbyA4W.js` | 90.1 kB | 21.4 kB |
| `apps/menyra-social/bundled/chunks/domain-app-events-Co9MgHzU.js` | 72.7 kB | 20.2 kB |
| `apps/menyra-social/bundled/chunks/go-page-render-utils-DtxLeEQe.js` | 62.1 kB | 18.1 kB |
| `apps/menyra-social/bundled/chunks/domain-analytics-Bhqgy4J1.js` | 49.7 kB | 15.6 kB |
| `apps/menyra-social/bundled/chunks/discovery-runtime-controller-2VYy1WSl.js` | 42.0 kB | 13.6 kB |
| `apps/menyra-social/bundled/chunks/business-composer-controller-Cv8CnPsM.js` | 44.7 kB | 13.1 kB |
| `apps/menyra-social/bundled/chunks/domain-crm-eager-BCumtZ71.js` | 40.2 kB | 12.1 kB |
| `apps/menyra-social/bundled/chunks/menu-modal-render-utils-BIGoTnAD.js` | 48.4 kB | 11.5 kB |
| `apps/menyra-social/bundled/chunks/crm-lazy-renderers-Dvrz233W.js` | 51.2 kB | 9.8 kB |
| `apps/menyra-social/bundled/chunks/profile-open-flow-utils-DG7VpGzS.js` | 31.2 kB | 8.8 kB |
| `apps/menyra-social/bundled/chunks/chat-app-runtime-lazy-facade-DwsInXe4.js` | 26.1 kB | 7.7 kB |
| `apps/menyra-social/bundled/chunks/social-engagement-runtime-controller-1l9jZwaO.js` | 22.7 kB | 7.4 kB |

## Current loading risk

- `social-app.js` is still the authenticated mega-entry and remains coupled to profile, feed, shopping, travel, order, chat, notification and owner surfaces.
- Public profile and public menu still depend on chunks that are produced from the same source tree as authenticated social runtime.
- QR/menu should not receive owner/editor, CRM/Heart, feed-search-map, upload/media or notification runtime in a future entry split.
- Public profile should avoid loading chat, push, owner/editor, checkout/order mutation and full marketplace runtimes unless the user enters those flows.

## Lazy import candidates for later refactor

- `apps/menyra-social/core/media/*` for upload-only flows.
- `apps/menyra-social/core/orders/*` for cart/order-only flows.
- `apps/menyra-social/core/chat/*` for authenticated chat-only flows.
- `apps/menyra-social/core/crm/*` for Heart/owner/admin-only flows.
- Marketplace event bindings for Feed/Travel/Shopping as separate route runtimes.

## Target entry structure

- `public-home-entry`
- `public-profile-entry`
- `public-menu-entry`
- `restaurant-qr-entry`
- `authenticated-social-entry`
- `business-owner-entry`
- `waiter-entry`
- `heart-entry`

## Notes

- Run `npm run build:analyze` to generate `docs/codex/generated/bundle-stats.html`.
- This report is a baseline only. No entry split is activated in this prep branch.

