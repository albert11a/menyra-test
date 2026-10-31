# Creator storefront: approved introduction and FAQ

Scope approved 2026-10-31: implement the reviewed HTML introduction card, FAQ cards,
and shorter interest prompt in the existing Content Creator shop. Keep actual
products, prices, image delivery/protection, tracking, cart and download ownership.
No preview scaffolding, sample data, embedded photos, new packages or requests.

Payment copy must consistently describe immediate original downloads and cash
collection by the courier 2–3 days after the order. New orders use the matching
courier schedule. Existing monthly orders keep their recorded schedule/date.

Implementation and validation results are recorded below before commit.

## Implementation

- Reviewed layout and Albanian copy are rendered by the existing shared view,
  including server-rendered HTML. No client-only content dependency is added.
- The existing stylesheet styles only the reviewed introduction/FAQ/interest
  cards. No new focus outlines, assets, image overlays or dependencies.
- Checkout and new courier receipts show the same cash terms. Monthly historical
  receipts remain readable with their original date. New paid orders retain
  immediate download release; free and approved order paths stay intact.
- Preserve explicitly closed/open FAQ panels across the existing cart rerender.

## Validation

- 104 existing Creator/Pixel regression tests passed; after the last behavior
  changes, all 49 focused shop/server/DOM tests passed, including two added
  regressions for legacy monthly retries and FAQ state retention.
- `npm run build` passed after the final source changes. Tracked Social bundles
  did not change; the build-generated Creator entry is in ignored `dist`.
- Same esbuild settings, old/current entry: 16,136 / 16,051 gzip bytes. Styles:
  4,835 / 5,843 gzip bytes. No additional requests or dependencies. This is a
  payload comparison, not an actual-device network timing guarantee.
- Manual visual inspection of the actual shared render and styles at a 390 px
  iframe viewport: introduction and open FAQ wrap correctly. No real iPhone,
  production checkout, Playwright or smoke run. Existing automated DOM tests
  exercise cart, checkout, original downloads and paid preview protection.
- `git diff --check` passed. Pixel/CAPI, Firestore rules, original image paths,
  watermark generation, tracking and production customer data were untouched.

Prepared on local `refactorapp` from current main. Publish under an isolated
`codex/creator-shop-approved-ui` review branch to preserve the independently
advanced remote `refactorapp`. No automatic main merge or production deploy.
