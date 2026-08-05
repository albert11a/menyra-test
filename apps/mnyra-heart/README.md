# mnyra heart

CEO-only internal MENYRA control center.

## Route
- Preferred public route: `/heart/`
- Direct app route: `/apps/mnyra-heart/`

## Architecture
- `index.html`: app shell entry
- `heart.css`: responsive premium shell styling
- `heart.js`: bootstrap and top-level orchestration only
- `heart-auth.js`: Firebase auth + CEO access guard
- `heart-state.js`: deterministic UI state store
- `heart-render.js`: auth gate + shell composition
- `heart-events.js`: delegated UI event wiring
- `heart-async-utils.js`: bounded-parallel map and list chunking
- `heart-single-flight.js`: single-flight, deadline and cache-then-fresh helpers
- `heart-start-core.js`: pure start-screen logic (hourly motivation line, news feed)
- `heart-start-render.js`: start view (motivation, profile, quick tiles, news)
- `heart-landing-render.js`: lead-landing evaluation view
- `heart-analytics-render.js`: business analytics view
- `heart-destinations-render.js`: destination templates view
- `heart-crm-admin-read-view.js`: CRM leads/customers/ads/staff views
- `heart-settings-render.js`: connections/settings view
- `heart-monitoring-adapter.js`: connections provider adapter
- `heart-test-report-normalizer.js`: normalized UI model mapping for connections and setup
- `sw.js` / `manifest.json`: standalone PWA shell

## Auth model
- Uses shared MENYRA Firebase auth from `/shared/firebase-config.js`
- Uses shared CEO access policy from `/shared/ceo-access.js`
- No client-only email bypass
- No protected dashboard render before auth decision completes
- Denied users see a denied screen and can sign out manually

## Backend model
Heart reads most of its data straight from Firestore with the signed-in CEO
session, and only connections and setup through the Heart API.

Flow for connections and setup:
1. Heart frontend calls `/api/heart/...`
2. Vercel rewrites to secure Firebase Functions
3. Functions verify Firebase bearer token and CEO access
4. Heart frontend reads the normalized connection/setup state from Functions

Everything else - landing sessions, leads, customers, ads, staff, destinations
and analytics - is read directly from Firestore under the same security rules
as the rest of MNYRA.

## Data loading
- Each view declares what it needs in the `VIEW_LOADERS` map in `heart.js`
- `ensureViewData(view)` is the only entry point, used both when a view is
  opened and when a reload restores a view from the address
- A view that is already loaded is not fetched again unless refresh is pressed
- Start reuses the landing sessions and the leads/customers it loads anyway,
  so the start screen costs no extra reads

### Cache first, then the server
Firestore already keeps a persistent local cache (`persistentLocalCache` in
`/shared/firebase-config.js`), but `getDocs` always asks the server first, so
that cache only ever helped offline. Landing, leads and customers now read the
device cache first with `getDocsFromCache`, paint it immediately, and replace
it with the server result as soon as that arrives.

`showCachedThenFresh` in `heart-single-flight.js` owns the ordering, and the
ordering is the whole point: a cache result that arrives *after* the server
result must never overwrite it. It is unit-tested for exactly that.

Rules that go with it:
- The cache pass is skipped when something is already on screen, and always
  skipped on an explicit refresh - pressing refresh must hit the server.
- A failed refresh never wipes data that is already on screen. Landing shows a
  note above the list, CRM shows a toast; an empty page with an error message
  is worse than yesterday's numbers with a hint next to them.
- `landing.loadedFrom` says whether what you see came from the cache or the
  server, and drives the "wird gerade abgeglichen" note.

The other half of the first-load cost was `readNames` in the landing adapter:
it fetched restaurant names in sequential batches of ten. With a hundred
venues that was ten round trips, one after another. They now run side by side
through `mapWithLimit` (`heart-async-utils.js`), bounded so a very large
account does not fire hundreds of queries at once.

## Current real integrations
- CEO auth guard: real
- Firebase-backed secure Heart API for connections and setup: real
- Firestore-backed CRM, landing and destination reads: real
- Relative frontend API base `/api/heart/`: real

## Current adapter / placeholder boundaries
- Sentry connection: placeholder adapter slot only
- Persona credentials outside CEO: setup-dependent
- Mutation-heavy flows: guarded by env/selector config, safe by default
- Any area without safe selectors/config is reported as `not configured`, `skipped`, or `guarded`, never fake-green

## Required backend env
Firebase Functions:
- `HEART_GITHUB_TOKEN`
- `HEART_GITHUB_OWNER`
- `HEART_GITHUB_REPO`
- `HEART_GITHUB_SMOKE_WORKFLOW`
- `HEART_GITHUB_SYNTHETIC_WORKFLOW`
- `HEART_GITHUB_REF` (optional)
- `HEART_WEBHOOK_SECRET`
- `HEART_BASE_URL` (optional)
- `HEART_SOCIAL_BASE_URL` (optional)

## Required GitHub secrets / vars
Secrets:
- `MNYRA_CEO_EMAIL`
- `MNYRA_CEO_PASSWORD`
- `MNYRA_BUSINESS_EMAIL`
- `MNYRA_BUSINESS_PASSWORD`
- `MNYRA_STAFF_EMAIL`
- `MNYRA_STAFF_PASSWORD`
- `MNYRA_USER_EMAIL`
- `MNYRA_USER_PASSWORD`
- `HEART_WEBHOOK_SECRET`
- `MNYRA_SYNTHETIC_ISOLATION_KEY` for full synthetic isolated mode

Variables as needed for deeper smoke/synthetic UI actions:
- `MNYRA_ALLOW_LIVE_MUTATIONS`
- `MNYRA_HEART_PACK_CONFIG_JSON`
- `MNYRA_HEART_RUNTIME_DIAGNOSTICS`
- `MNYRA_HEART_COLD_START_WARN_MS`
- `MNYRA_HEART_COLD_START_FAIL_MS`
- `MNYRA_HEART_FCP_WARN_MS`
- `MNYRA_HEART_FCP_FAIL_MS`
- `MNYRA_BUSINESS_BASE_URL`
- `MNYRA_STAFF_BASE_URL`
- `MNYRA_USER_BASE_URL`
- `MNYRA_GUEST_QR_URL`
- `MNYRA_SMOKE_BUSINESS_PROFILE_URL`
- `MNYRA_SMOKE_CHAT_TARGET_URL`
- `MNYRA_SMOKE_CHAT_COMPOSER_SELECTOR`
- `MNYRA_SMOKE_CHAT_SEND_SELECTOR`
- `MNYRA_SMOKE_CART_URL`
- `MNYRA_SMOKE_CART_TRIGGER_SELECTOR`
- `MNYRA_SMOKE_CART_REMOVAL_SELECTOR`
- `MNYRA_SMOKE_ORDER_TRIGGER_SELECTOR`
- `MNYRA_SMOKE_ORDER_SUCCESS_TEXT`

## Runner packs

> The Playwright runner below still exists as a standalone test harness under
> `tests/mnyra-heart-runner/`. It is no longer reachable from the Heart UI:
> the Laeufe, Meldungen and Bereiche views were removed, so runs are started
> and read through the runner and its Functions endpoints, not through Heart.

Location:
- `tests/mnyra-heart-runner/`

Packs:
- `npm run guard-pack`
- `npm run release-pack`
- `npm run health-pack`
- `npm run smoke`
- `npm run ceo-pack`
- `npm run business-pack`
- `npm run staff-pack`
- `npm run user-pack`
- `npm run guest-pack`
- `npm run mutation-pack`
- `npm run journey-pack`
- `npm run full-platform-pack`
- `npm run synthetic` -> alias for `full-platform-pack`

Heart run controls:
- `Start Change Guard`
- `Start Release Gate`
- `Start Daily Health`
- `Start Smoke`
- `Start CEO Test`
- `Start Business Test`
- `Start Staff Test`
- `Start User Test`
- `Start Guest Test`
- `Start Mutation Test`
- `Start Journey Test`
- `Start Full Platform Test`

Safety model:
- Live mutations are off by default
- Full synthetic requires `MNYRA_ALLOW_LIVE_MUTATIONS=true` and `MNYRA_SYNTHETIC_ISOLATION_KEY`
- Synthetic entities use clearly marked prefixes like `mnyra-heart-synth-*`
- Runtime diagnostics are enabled by default (JS errors, request/http failures, cold start, FCP)
- Runner reports explicitly differentiate:
  - `success`
  - `warning`
  - `failed`
  - `critical`
  - `skipped`
  - `not_configured`
  - `guarded`

## Persona model
- `CEO bot`: authenticated social control path
- `Business bot`: authenticated owner/business path
- `Staff bot`: waiter app path
- `User bot`: authenticated user journey path
- `Guest / QR bot`: guest route without privileged access

Personas are stable reusable accounts.
Run-created entities must use a run-specific prefix, for example:
- `TEST_RUN_<runId>_LEAD_1`
- `TEST_RUN_<runId>_PRODUCT_1`
- `TEST_RUN_<runId>_POST_1`
- `TEST_RUN_<runId>_COMMENT_1`

## Config contract
- Example config file: [heart-pack-config.example.json](c:\Users\poros\Documents\GitHub\menyra-test_recovered_20260311_014955\tests\mnyra-heart-runner\config\heart-pack-config.example.json)
- Preferred model:
  1. keep persona credentials in GitHub Secrets
  2. keep non-secret selectors/URLs in `MNYRA_HEART_PACK_CONFIG_JSON` or a local config file
  3. keep mutations disabled unless running on an isolated target

## Current coverage model
Already supported in the runner architecture:
- critical smoke reads
- persona-pack dispatch and reporting
- guarded mutation checks for social, business, commerce, chat and CRM
- guest/QR route verification
- waiter/staff surface verification
- journey checks
- full multi-role platform orchestration with isolated sessions

Still setup-dependent per environment:
- exact live selectors for likes/comments/posts/products/leads/orders/chat
- cleanup selectors for delete/reset flows
- safe guest QR target URL
- safe business/staff/user synthetic accounts

## Notes
- `shared/github-execution-state.js` is still the single source of truth for
  GitHub execution-state normalization on the Functions side. The Heart
  frontend no longer imports it.
- Heart Functions use a generated CJS mirror where Node module format requires it.
- Protected `*.vercel.app` previews intentionally skip manifest injection to avoid preview-auth `401` noise; the PWA manifest remains active on real routes/domains.
- One gutter for everything: `--heart-gutter` (8px on phones, 24px from
  tablet width) is shared by `.heart-topbar` and `.heart-main-content`, so the
  cards always line up with the menu button. Do not set a side padding on
  either of them directly.
- No frames around frames. `.heart-section`, `.heart-crm-social-view`,
  `.heart-crm-inline-editor`, `.heart-crm-modal-fieldset` and
  `.heart-sidebar__panel` are grouping containers only - no border, no
  background, no side padding. Things you tap or fill in (rows, cards, fields,
  buttons) keep their own border. Three nested boxes used to eat more than half
  the width on a phone.
- The drawer is `position: fixed` and sized with `100dvh`. With `inset: 0` it
  followed the layout viewport instead of the visible one, which pushed its
  footer behind the iOS toolbar - do not change it back.
- `heart-main-content` always keeps `safe-area-inset-bottom` of padding. A
  `padding-bottom: 0` there is what made the bottom of the app look cut off.
