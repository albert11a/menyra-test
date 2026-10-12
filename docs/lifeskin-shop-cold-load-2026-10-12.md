# LifeSkin mobile cold visit — 12 October 2026

Authorized by Albert: repair first-visit price/image changes and improve mobile
loading. Audit reproduced 25 EUR changing to 18 EUR and the promotion inserting
above the buy button. Scope: server-render the public offer and first hero URL,
reuse that snapshot at browser startup, and safely handle unavailable config.
Keep existing checkout, personal routines, customer media and Pixel/CAPI calls.
No production data writes or Firebase deployment. Work on a repair branch.

Implementation:
- /lifeskinshop and its trailing slash render the same template through a public,
  read-only Vercel handler. Three independent config reads run concurrently.
- HTML and browser startup share one offer snapshot: no intermediate 25 EUR.
- The first hero is a high-priority cacheable binary image; the 7:5 mobile frame
  is retained. Local stale pictures cannot overwrite the server-selected URL.
- A failed config read exposes a retry instead of a guessed purchasable price.
- Early buy taps are retained until shop listeners are ready; existing order and
  tracking calls are unchanged. Stock has a reserved row above the buy button.
- Public HTML uses a 15-second CDN lifetime capped at promotion expiry, with no
  stale-while-revalidate. Hero responses cache for 60 seconds; failures do not.

Validation: 119 focused Node tests pass, including first HTML, hydration,
checkout, personal routines, unavailable/malformed data, image delivery and
unchanged Pixel/CAPI lock. npm run build passed after final edits. One rebuild encountered a transient
ENOTEMPTY while replacing generated dist; its retry passed. No tracked social
bundles changed, so no bundle changes were committed.

Verification limits: cloud browser cannot reach the local server. Public
Firestore reads from the execution environment time out; this does not establish
production latency. Mobile browser and throttled-network measurements remain
outstanding. No test orders or production data writes were made.

## CI follow-up

GitHub run 38234836481 failed on one outdated markup assertion in
lifeskinshop-menu-kopf.test.mjs: it expected a buy button without the new
price-pending safeguards. The assertion now explicitly requires those guards;
the first-render tests separately require enabled buttons for confirmed offers.
No checks were disabled. Full local CI validation passed: lint (0 errors,
305 existing warnings), all 3200 unit tests, architecture report/check, build,
bundle budget and bundle report. Tracked application bundles remain unchanged.

Both Vercel deployments for 6fd1d893 succeeded. Live HTML contains the current
18 EUR offer and versioned hero URL before JavaScript; the desktop browser
shows that offer and the expected hero. Two detailed HTTP samples had about
4.7 seconds of environment TLS/proxy setup, followed by 0.74 and 0.19 seconds
to first response byte. These are not mobile or throttled-network benchmarks.
Physical mobile verification remains outstanding.
