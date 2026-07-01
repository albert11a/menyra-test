# MNYRA Leads, Ads And Analytics Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit covers how leads arise, how they connect to CRM/Heart, how accounts
and public route data are provisioned, how ads are created and approved, and
what analytics are missing before enterprise launch.

## Leads Current State

Leads are stored under `leads/{leadId}` and are CEO-scoped by Firestore rules.
CRM lead save/conversion code can also update or create linked restaurant and
user/account state.

Important implementation evidence:

- `apps/menyra-social/core/leads/lead-save-utils.js`
- `apps/menyra-social/core/crm/crm-admin-read-loader-core.js`
- `apps/mnyra-heart/heart-crm-admin-read-loaders.js`
- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
- `functions/heart/*`
- `firestore.rules`

## Lead Flow

| Step                     | Current state                                                          | Risk                                                         |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| Lead create/edit         | CEO/Heart-scoped lead writes exist.                                    | Needs mutation tests and required-field schema.              |
| Restaurant/customer link | CRM loaders derive customers from restaurants and leads.               | Needs deterministic source of truth for converted customers. |
| Account provisioning     | Lead save/conversion can create auth/user/business owner state.        | Needs rollback/audit path if partial provisioning fails.     |
| Public route metadata    | Lead flow can set public slug/path and restaurant public metadata.     | Needs route uniqueness and public/private field tests.       |
| Pricing fields           | Lead/customer price and monthly/yearly pricing are stored in CRM data. | Needs billing/payment boundary before selling subscriptions. |
| Owner bootstrap          | Conversion can write owner user doc and restaurant ownership fields.   | Needs staff/owner revocation and duplicate owner tests.      |

## Lead Readiness Verdict

Leads are usable as an internal CRM baseline, but not enterprise-hardened. The
main missing pieces are conversion audit trail, rollback behavior, duplicate
identity handling, billing boundary, and end-to-end tests for every write path.

## Ads Current State

Owner-facing ads are stored under
`restaurants/{restaurantId}/public/ads` as an `items[]` array. Owner changes
reset status to pending. Heart/CEO can approve or reject by mutating matching
array items.

Important implementation evidence:

- `apps/menyra-social/core/menu/ads-runtime-controller.js`
- `apps/mnyra-heart/heart-crm-admin-read-loaders.js`
- `apps/mnyra-heart/heart-crm-admin-write-adapter.js`
- `firestore.rules`

## Ads Flow

| Step              | Current state                                                               | Risk                                                       |
| ----------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Owner create/edit | Owner can create/edit pending ad items in public ads doc.                   | Array write conflicts and missing per-ad document history. |
| Public read       | Public ads doc is readable with other public docs.                          | Must ensure only approved ads render publicly.             |
| Heart review      | Heart approves/rejects by setting item status fields and reviewer metadata. | Needs immutable moderation audit trail.                    |
| Owner feedback    | Pending/rejected state exists in item data.                                 | Needs UI and notification tests.                           |
| Ad targeting      | No mature targeting contract found.                                         | Not ready for paid ad inventory.                           |
| Ad analytics      | No stable impression/click analytics contract found.                        | Not ready for paid ad reporting.                           |

## Ads Readiness Verdict

Ads are not ready as a paid product. The current implementation is acceptable
for internal/local prep, but enterprise ad workflows need per-ad records,
moderation history, conflict-safe updates, public approved-only rendering tests
and analytics for impressions, clicks and conversions.

## Analytics Current State

No finished analytics platform primitive was found. There are counters and
derived state in some social/order areas, but there is no complete analytics
event schema, write rule contract, aggregation model, owner dashboard contract
or full test matrix for analytics.

## Required Analytics Metrics

| Metric                         | Current readiness | Notes                                                               |
| ------------------------------ | ----------------- | ------------------------------------------------------------------- |
| Profile views                  | Red               | Needs event schema, guest/session dedupe and owner dashboard read.  |
| Menu views                     | Red               | Needs route/context dimensions such as source and table.            |
| QR scans                       | Red               | Needs QR source tracking without exposing personal data.            |
| Product views                  | Red               | Needs product/menu item id, business type and visibility filters.   |
| Wolt clicks                    | Red               | Needs outbound click event and bot filtering.                       |
| WhatsApp/contact clicks        | Red               | Needs privacy-safe contact click event.                             |
| Orders                         | Yellow            | Order docs exist, but analytics aggregation contract is missing.    |
| Waiter calls/status times      | Red/Yellow        | Waiter status data exists, but SLA/dashboard analytics are missing. |
| Leads                          | Yellow            | CRM lead data exists, but lead funnel analytics are not formalized. |
| Ad impressions                 | Red               | Missing paid ad measurement primitive.                              |
| Ad clicks                      | Red               | Missing paid ad measurement primitive.                              |
| Cross-selling interactions     | Red               | Focus/menu/shop cross-sell needs explicit events.                   |
| Owner dashboard metrics        | Red               | No stable read model for owner analytics.                           |
| Hotel/travel offer conversions | Red               | Booking/contact event semantics are undefined.                      |
| Shop conversion metrics        | Red               | Product view/cart/order/stock analytics are undefined.              |

## Analytics Security Requirements

Before analytics are enabled for real customers:

1. Define event names, required fields, optional fields and forbidden personal
   data.
2. Add Firestore rules or server-only ingest so clients cannot spoof owner
   revenue or ad metrics.
3. Add dedupe strategy for views/scans/clicks.
4. Add aggregation and retention policy.
5. Add owner/Heart read permissions by business ownership.
6. Add tests for guest, signed-in user, owner, waiter and CEO/Heart access.
7. Add manual dashboard QA for mobile and desktop.

## Recommended Lead/Ad/Analytics Roadmap

1. Keep leads internal and CEO/Heart-only until conversion tests and audit logs
   are complete.
2. Move ads to a safer per-ad record model or add immutable item history before
   selling ads.
3. Implement minimal analytics events for profile view, menu view, QR scan,
   order created, ad impression and ad click.
4. Build owner analytics read models from trusted server aggregation, not direct
   client-written counters.
5. Add Heart dashboards only after owner-facing metrics are consistent and
   permission tested.
