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

## Current adapter / placeholder boundaries
- Sentry connection: placeholder adapter slot only
- Deep mutation-heavy synthetic flows: guarded by env/selector config, safe by default
- Some smoke/synthetic write steps require explicit target selectors and isolated environment configuration

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
- `HEART_WEBHOOK_SECRET`
- `MNYRA_SYNTHETIC_ISOLATION_KEY` for full synthetic isolated mode

Variables as needed for deeper smoke/synthetic UI actions:
- `MNYRA_ALLOW_LIVE_MUTATIONS`
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
- `npm run synthetic`

Safety model:
- Live mutations are off by default
- Full synthetic requires `MNYRA_ALLOW_LIVE_MUTATIONS=true` and `MNYRA_SYNTHETIC_ISOLATION_KEY`
- Synthetic entities use clearly marked prefixes like `mnyra-heart-synth-*`

## Notes
- `shared/github-execution-state.js` is the single source of truth for GitHub execution-state normalization.
- Heart frontend imports that module directly.
- Heart Functions load that same shared module asynchronously.
- Protected `*.vercel.app` previews intentionally skip manifest injection to avoid preview-auth `401` noise; the PWA manifest remains active on real routes/domains.
- GitHub `workflow_dispatch` must exist on the repository default branch for Heart to trigger runner workflows reliably.
