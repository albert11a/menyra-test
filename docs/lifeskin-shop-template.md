Status: CURRENT
Last updated: 2026-09-28

# LifeSkin mobile storefront

Scope: premium mobile storefront at /lifeskinshop, now extended with existing
brand evidence, clearer set details, contact paths and an explicit same-tab
handoff to the existing shop. User authorized work on main.

## Evidence and content

- Reuses the configured LIFESKIN_VORHER_NACHHER case from
  apps/lifeskin/lifeskin-config.js (day 1 / day 28, displayed as four weeks).
  No new patient identity, review quote, star rating, sales count, product
  attribution or guaranteed outcome is invented. Images are unchanged.
- Existing Instagram profiles: lifeskin.ks and lifeskin.al. They are shown as
  brand profiles, not independent customer reviews.
- Existing configured WhatsApp number links to a user-initiated conversation.
  No message is sent automatically.
- Product photos remain the existing placeholder/lifestyle assets requested.
  Set details show both included products.

## Purchase path

shop.js uses the shared preisFuer pricing function. The new checkout-handoff
module validates selected IDs and writes the existing lifeskin.shporta session
storage format. It reads back the value before same-tab navigation to
/lifeskin2#produktet. still/test mode is preserved. Storage failure keeps the
customer on the current page with an actionable error.

The basket explains that the customer must open the cart in the existing shop
and enter their address there. No order is submitted on /lifeskinshop. This is
not a newly integrated checkout. No analytics/pixel code, event calls, Firebase
rules, existing checkout files, or service worker are modified. No production
orders were submitted during verification. Set selection replaces the local
routine; the continue button explicitly transfers that selection to the shop.

## Validation and remaining work

npm run build passed. Tracked bundles unchanged. Syntax and diff checks passed.
Handoff tests and pixel lock tests: 6/6 passed. Handoff tests cover cart format,
replacement of old selection, duplicate/invalid IDs, still/test modes, empty
selection, blocked storage and silent write failure.

No physical iPhone, Instagram/Facebook in-app test or automated browser smoke
run. No end-to-end order was placed. Before advertising, validate on target
phones including the handoff, checkout and accepted order in Heart. Customer
review quotes need approved originals; none were fabricated. Provider identity
fields in the existing configuration are empty and remain an owner input.

Existing /lifeskin and /lifeskin2 source and pixel behavior remain unchanged.
