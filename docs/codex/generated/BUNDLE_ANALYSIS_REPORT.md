# Bundle Analysis Report

Generated: 2026-08-06T21:04:10.037Z

Scope: current Vite output in `apps/menyra-social/bundled`.

## Largest bundle files

| File | Raw | Gzip |
| --- | ---: | ---: |
| `apps/menyra-social/bundled/chunks/vendor-firebase-D7Ks7H8l.js` | 453.9 kB | 136.2 kB |
| `apps/menyra-social/bundled/entry/social-app.js` | 492.2 kB | 131.5 kB |
| `apps/menyra-social/bundled/chunks/domain-feed-social-eager-CSzqAfRb.js` | 355.5 kB | 100.2 kB |
| `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-CPb0rbZU.js` | 193.0 kB | 49.1 kB |
| `apps/menyra-social/bundled/chunks/domain-menu-eager-BUdqOprI.js` | 81.2 kB | 23.6 kB |
| `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-CDOk1pWX.js` | 83.2 kB | 23.5 kB |
| `apps/menyra-social/bundled/chunks/domain-auth-Aq-4Vdvh.js` | 78.7 kB | 21.7 kB |
| `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-DA7NVGOC.js` | 90.3 kB | 21.4 kB |
| `apps/menyra-social/bundled/chunks/domain-app-events-hrSGrzeg.js` | 72.1 kB | 20.0 kB |
| `apps/menyra-social/bundled/chunks/domain-analytics-jv5B-kA2.js` | 48.2 kB | 15.1 kB |
| `apps/menyra-social/bundled/chunks/discovery-runtime-controller-BCDtflc4.js` | 42.9 kB | 13.7 kB |
| `apps/menyra-social/bundled/chunks/domain-crm-eager-B7nua6M4.js` | 40.2 kB | 12.1 kB |
| `apps/menyra-social/bundled/chunks/business-composer-controller-Cf-AFRjW.js` | 41.1 kB | 12.0 kB |
| `apps/menyra-social/bundled/chunks/menu-modal-render-utils-A41a92zY.js` | 48.4 kB | 11.5 kB |
| `apps/menyra-social/bundled/chunks/domain-dashboard-XgTL-wxD.js` | 30.8 kB | 9.6 kB |
| `apps/menyra-social/bundled/chunks/crm-lazy-renderers-DqbT42M1.js` | 47.8 kB | 8.9 kB |
| `apps/menyra-social/bundled/chunks/profile-open-flow-utils-B3YvHiY-.js` | 31.2 kB | 8.8 kB |
| `apps/menyra-social/bundled/chunks/chat-app-runtime-lazy-facade-DwsInXe4.js` | 26.1 kB | 7.7 kB |
| `apps/menyra-social/bundled/chunks/social-engagement-runtime-controller-DwfQRZpC.js` | 22.7 kB | 7.4 kB |
| `apps/menyra-social/bundled/chunks/travel-view-event-bindings-C5_zWOvT.js` | 19.9 kB | 5.8 kB |

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

