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
- `heart-dashboard-render.js`: overview view
- `heart-runs-render.js`: run history and report view
- `heart-incidents-render.js`: incidents view
- `heart-modules-render.js`: module health view
- `heart-settings-render.js`: connections/settings view
- `heart-monitoring-adapter.js`: dashboard/incidents/connections provider adapter
- `heart-test-runner-adapter.js`: run trigger/history/detail adapter
- `heart-test-report-normalizer.js`: normalized UI model mapping
- `sw.js` / `manifest.json`: standalone PWA shell

## Auth model
- Uses shared MENYRA Firebase auth from `/shared/firebase-config.js`
- Uses shared CEO access policy from `/shared/ceo-access.js`
- No client-only email bypass
- No protected dashboard render before auth decision completes
- Denied users see a denied screen and can sign out manually

## Backend model
Frontend never talks directly to GitHub Actions.

Flow:
1. Heart frontend calls `/api/heart/...`
2. Vercel rewrites to secure Firebase Functions
3. Functions verify Firebase bearer token and CEO access
4. Functions dispatch GitHub Actions with env-backed secret on server side only
5. GitHub Actions runner posts secure status/report/incident webhooks back to Functions
6. Heart frontend reads normalized runs/incidents/dashboard state from Functions

## Current real integrations
- CEO auth guard: real
- Firebase-backed secure Heart API: real
- Firestore-backed run history and incident storage: real
- GitHub Actions dispatch adapter: real if `HEART_GITHUB_*` env vars are configured in Functions
- Heart webhook ingest endpoints for workflow status/report/incident: real
- Relative frontend API base `/api/heart/`: real
- Multi-pack runner architecture: real
- Persona-aware Playwright runner foundation: real

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
Location:
- `tests/mnyra-heart-runner/`

Packs:
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
- `shared/github-execution-state.js` is the single source of truth for GitHub execution-state normalization.
- Heart frontend imports that module directly.
- Heart Functions use a generated CJS mirror where Node module format requires it.
- Protected `*.vercel.app` previews intentionally skip manifest injection to avoid preview-auth `401` noise; the PWA manifest remains active on real routes/domains.
- GitHub `workflow_dispatch` must exist on the repository default branch for Heart to trigger runner workflows reliably.
- Heart preview URLs can be protected by Vercel authentication; configure `HEART_SOCIAL_BASE_URL` to a public social deployment so GitHub-hosted runners do not hit the preview auth wall.
