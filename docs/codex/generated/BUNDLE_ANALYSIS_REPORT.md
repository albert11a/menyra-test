# Bundle Analysis Report

Generated: 2026-07-01T06:34:39.079Z

Scope: current Vite output in `apps/menyra-social/bundled`.

## Largest bundle files

| File                                                                                  |       Raw |     Gzip |
| ------------------------------------------------------------------------------------- | --------: | -------: |
| `apps/menyra-social/bundled/entry/social-app.js`                                      | 1103.8 kB | 299.0 kB |
| `apps/menyra-social/bundled/chunks/vendor-firebase-V03pMX6J.js`                       |  431.6 kB | 129.5 kB |
| `apps/menyra-social/bundled/chunks/profile-menu-focus-render-controller-CnfuiC7v.js`  |  157.9 kB |  36.5 kB |
| `apps/menyra-social/bundled/chunks/crm-domain-runtime-cluster-CYS4P8zM.js`            |   83.9 kB |  23.7 kB |
| `apps/menyra-social/bundled/chunks/marketplace-view-render-utils-DX9kocQg.js`         |   87.8 kB |  20.5 kB |
| `apps/menyra-social/bundled/chunks/discovery-runtime-controller-Dplzg-0K.js`          |   41.7 kB |  13.2 kB |
| `apps/menyra-social/bundled/chunks/menu-modal-render-utils-CpMZWnNX.js`               |   45.7 kB |  10.5 kB |
| `apps/menyra-social/bundled/chunks/profile-open-flow-utils-CPmoXsC5.js`               |   29.4 kB |   8.4 kB |
| `apps/menyra-social/bundled/chunks/chat-app-runtime-lazy-facade-CNA8_AY7.js`          |   26.1 kB |   7.7 kB |
| `apps/menyra-social/bundled/chunks/travel-view-event-bindings-DuivYS2p.js`            |   26.8 kB |   7.6 kB |
| `apps/menyra-social/bundled/chunks/social-engagement-runtime-controller-BW0Yt8C3.js`  |   22.7 kB |   7.4 kB |
| `apps/menyra-social/bundled/chunks/startup-route-runtime-context-6Co7bthZ.js`         |   14.1 kB |   4.7 kB |
| `apps/menyra-social/bundled/chunks/orders-runtime-controller-Dr3JCkbT.js`             |   12.6 kB |   4.5 kB |
| `apps/menyra-social/bundled/chunks/overlay-basic-render-utils-BNCY8avu.js`            |   14.1 kB |   3.5 kB |
| `apps/menyra-social/bundled/chunks/media-upload-runtime-cluster-BwYAXxuF.js`          |    8.8 kB |   3.2 kB |
| `apps/menyra-social/bundled/chunks/shopping-landing-card-editor-bindings-DLYnROwM.js` |   10.7 kB |   3.2 kB |
| `apps/menyra-social/bundled/chunks/sq-Ba9dksVU.js`                                    |    6.6 kB |   2.3 kB |
| `apps/menyra-social/bundled/chunks/sr-Cghmj5kq.js`                                    |    6.5 kB |   2.3 kB |
| `apps/menyra-social/bundled/chunks/public-route-cache-early-preload-DQa9EeC_.js`      |    4.6 kB |   1.9 kB |
| `apps/menyra-social/bundled/manifest.json`                                            |    8.6 kB |   1.1 kB |

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
