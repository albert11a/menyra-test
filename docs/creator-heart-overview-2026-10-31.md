# Content Creator: Heart overview and order flow

Scope approved by owner: LifeSkin-style period statistics, visitor/cart/cash live stages, business status chips and bulk ready/archive, header refresh/date/back, compact package editor, orders and follow-up, title images and detailed visitor journeys; commit and push to main.

Implementation stays within Creator. Existing LifeSkin, Meta Pixel/CAPI, customer routes and purchased-original access remain unchanged. Existing collections retain names. Visit telemetry uses the existing server API so new client rules do not require a production rules deploy. Still previews never write visits, carts or orders.

Confirmed risks: push delivery is awaited after committing orders; a client timeout can hide a successful order. One failed Creator listener stops all other listeners. Existing visits have no heartbeat, checkout stages or photo journey. Legacy visits cannot retroactively supply those details.

Validation and final result will be recorded below after implementation.

## Implemented

- Four period metrics (live, unique visitors, orders, order value), Vienna-local dates and 90-second presence expiry; page / Shportë / Cash live stages. Legacy visits remain readable; detailed photo journeys begin with new telemetry.
- Business chips Working / Ready / Seen / Kunde / Archiv; bulk Ready/archive under Settings; creation plus beside Settings. Header date/refresh and round back control in details.
- Business/package card with horizontal photo strips and expandable editors; separate orders, title images, follow-up, public/still links and visitor/photo journeys. Removed duplicate shop caption gallery. Long lists use More.
- Server-side activity and checkout-draft persistence using the existing API and collections. Still mode makes no visit, cart or order writes. Follow-up state is CEO-only page metadata; no messages are sent automatically.
- Orders are acknowledged independently of FCM via Vercel waitUntil. Pending push delivery is durable, with existing LifeSkin sender/deduplication and independent recipients. Heart retries recent pending deliveries; active FCM leases prevent duplicates. Existing device registration is reused.
- Lost order responses recover the receipt; pending order IDs survive reloads; idempotent retries repair cart conversion and stale writes cannot reopen ordered carts. Independent snapshot failures no longer stop all Creator data feeds.
- Package drafts, file input nodes, expanded sections and photo positions survive Heart live rendering.

## Validation

- 136 targeted Node tests passed (Creator server/public/shop/editor, new analytics/activity/recovery/bulk tests, Heart morph/state/error boundary and LifeSkin Meta-Pixel guard).
- npm run build passed after final browser-source changes. Existing large Social chunk warning remains. No tracked bundles changed, so no generated bundle files needed a commit.
- git diff --check passed.
- Read-only Vercel lookup confirmed www.mnyra.com uses project prj_MiYIDtnemjoIdWW3nOrLTHkIpnr6. No matching Creator runtime logs/errors were returned for the queried last 24h; this does not establish the production root cause.
- No production customer data writes, Rules/Functions deploys, test purchases or customer messages. No mobile browser/real iPhone push delivery check. Browser automation was not run, in accordance with AGENTS.md. Manual acceptance remains: real phone layout/swipes, one authorized real checkout and receipt, Heart order visibility and actual registered-device push.
