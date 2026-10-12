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

## Hero speed follow-up

Albert reported a slow hero after the CI fix. The live image endpoint returned
a 299042-byte 1400x1000 JPEG on a CDN miss with only 60 seconds of cache life.
The handler now delivers a 1050px WebP (no crop or upscaling, bounded decoded
pixels) and reads only the photo plus revision fields. The same current photo
encodes to 62632 bytes: 79% less transfer. Its preload is emitted first in head,
ahead of blocking scripts. Matching Heart revisions receive immutable caching;
unversioned or mismatched requests retain only 60 seconds, and failures remain
uncached. Heart photo writes were checked to update the revision timestamp.
Sharp is a pinned-through-lockfile production dependency for future uploads as
well. Tests verify output dimensions/format, cache invalidation and preload
order. These transfer-size gains do not establish a mobile LCP measurement.
Validation: all 3200 unit tests, lint (no errors), production build and bundle
budget passed. Tracked application bundles are unchanged. Pixel/CAPI unchanged.

## First-paint follow-up

Live PageSpeed mobile cold-load test (Moto G Power, slow 4G, 12:33 Vienna):
normal shop 91/100, FCP 2.0s, LCP 3.2s (hero), TBT 0ms, CLS 0.002.
Report: https://pagespeed.web.dev/analysis/https-www-mnyra-com-lifeskinshop/74d20gthlt?form_factor=mobile
The report identified ten blocking stylesheets and the still-mode script,
with estimated 600ms savings. Scope: build-only inline those exact assets in
the shop HTML; retain all rules and cascade order and run the still-mode code
before startup. Other pages and source scripts stay untouched. The build fails
if future stylesheet-relative assets require rewriting, rather than breaking
their URLs. Re-measure the live mobile page after publication. No physical
iPhone or real-user percentile is implied by the lab test.

After inline assets, the mobile report at 12:39 showed FCP 1.5s, speed index
2.5s, score 93, TBT 0ms and CLS 0.002; the render-blocking audit disappeared.
LCP remained 3.2s with only 20ms rendering delay and image transfer dominating.
Next scoped correction: responsive 720px/1050px hero URLs, with identical
srcset/sizes on the preload and image. The viewport declaration precedes the
preload so mobile chooses the correct width. The current 720px image is 37588
bytes. Image transforms accept only bounded preset widths; version caching
remains unchanged. Re-test live after this correction.
