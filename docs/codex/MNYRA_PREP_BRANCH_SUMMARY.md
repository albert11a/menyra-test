# Mnyra Prep Branch Summary

Status: CURRENT
Last updated: 2026-07-01

## Branch

- Branch: `mnyrasocial`
- Base: current `main` after `git fetch --prune`
- `main` and `origin/main` were even before branching.
- No merge into `main` was performed.

## What Was Set Up

- Practical Codex rules in `AGENTS.md`.
- Refactor planning docs under `docs/codex/`.
- Dependency analysis with Dependency-Cruiser and Madge.
- Bundle analysis report generation and optional Rollup visualizer hook.
- ESLint and Prettier baseline checks.
- Local Firebase Emulator config in `firebase.json`.
- Local synthetic seed data and seed script under `seed/`.
- Firestore Rules tests and auth fixtures under `tests/rules`.
- Firebase Functions emulator validation under `tests/functions`.
- Playwright E2E scaffold under `tests/e2e`.
- False runtime feature flags in `shared/config/feature-flags.js`.
- CI preparation workflow in `.github/workflows/ci.yml`.

## Scripts Added

- `npm test`
- `npm run test:unit`
- `npm run test:rules`
- `npm run test:functions`
- `npm run test:e2e`
- `npm run test:all`
- `npm run lint`
- `npm run format:check`
- `npm run arch:report`
- `npm run arch:check`
- `npm run arch:graph`
- `npm run arch:cycles`
- `npm run build:analyze`
- `npm run bundle:report`
- `npm run emulators:start`
- `npm run emulators:seed`
- `npm run emulators:export`

Existing `npm run build` remains the normal Vite/Vercel static build.

## Generated Reports

- `docs/codex/generated/ARCHITECTURE_DEPENDENCY_REPORT.md`
- `docs/codex/generated/BUNDLE_ANALYSIS_REPORT.md`
- `docs/codex/generated/FIRESTORE_RULES_SECURITY_GAP_REPORT.md`
- `docs/codex/generated/dependency-cruiser-check.txt`
- `docs/codex/generated/madge-social-app-graph.json`
- `docs/codex/generated/madge-cycles.txt`

## Check Results

Green:

- `npm run test:unit`: 102 passed.
- `npm run test:functions`: 2 passed.
- `npm run arch:report`: report generated.
- `npm run arch:check`: passed, 330 modules and 489 dependencies cruised.
- `npm run arch:graph`: graph JSON generated.
- `npm run arch:cycles`: passed, no circular dependency found by Madge baseline.
- `npm run lint`: passed after vendor files were excluded and lint was scoped to errors.
- `npm run format:check`: passed.
- `npm run bundle:report`: report generated.
- `npm run build`: passed.
- `npm run emulators:seed`: seeded 48 Firestore documents and 4 Auth users.

Red:

- `npm run test:rules`: 5 passed, 2 failed, 0 skipped.
- Failed: `user cannot directly manipulate likes/comments/follower counters`.
- Failed: `private user data remains protected`.

Observed:

- `npm install` completed with npm audit summary: 16 vulnerabilities
  (1 low, 14 moderate, 1 high). No `npm audit fix` was run because that would
  broaden dependency changes.
- `npm install --save-dev firebase-admin@13.10.0` changed the audit summary to
  15 vulnerabilities (1 low, 13 moderate, 1 high). No `npm audit fix` was run.
- `npm run build` regenerated tracked bundled files during the check. Those
  generated product bundle diffs were restored so this prep branch does not
  activate bundle/product changes.
- `social-app.js` remains the largest bundle at about 299 kB gzip in the
  current tracked bundle output.
- `npm run emulators:start` started Auth, Firestore, Functions and UI locally.
  Firebase CLI emitted online project lookup warnings for `mnyra-local` and the
  Functions emulator reported a function-definition load timeout under host
  Node 24 vs requested Node 20. No Functions source was changed.
- Seed visibility was verified in the emulator: PIDHImadh, 24 Menu Items, Posts,
  Orders, Waiter User, Owner User, CEO/Heart User, Shop, Hotel and pending Ads.

Not run:

- `npm run test:e2e`: Playwright is prepared but not run per repo guardrail.
- `npm run build:analyze`: configured but not run to avoid committing analyzer
  HTML and repeated tracked bundle rewrites in this prep step.

## What Was Not Changed

- No product UI.
- No route behavior.
- No Firestore Rules logic.
- No Firestore collection names.
- No `social-app.js` runtime extraction.
- No QR/menu/cart/order behavior.
- No production Firebase configuration or deploy flow.
- No real customer data.

## Risks Found

- Existing app bundle remains too large for a true lightweight public entry.
- Playwright tests are still scaffolded and not real coverage yet.
- Rules auth fixtures are now wired for Guest, normal User, Restaurant Owner,
  Waiter and CEO/Heart.
- Security-sensitive order/staff/owner/Heart/public-read flows now have green
  allow/deny coverage.
- Confirmed security gap: signed-in users can directly update social counter
  fields such as `likesCount` and `commentsCount`.
- Confirmed security gap: signed-in users can read other root `users/{uid}`
  documents.
- Functions emulator hub is reachable, but function definition discovery timed
  out during local emulator startup.
- CI workflow is prepared but not yet proven in GitHub Actions.
- npm audit reports transitive vulnerabilities that need separate dependency
  review.

## Next Safe Refactor Order

1. Decide and implement a dedicated Firestore Rules hardening step for counters
   and private user documents.
2. Re-run `npm run test:rules` and require all 7 Rules tests to pass.
3. Investigate Functions emulator discovery timeout separately from product
   refactor work.
4. Convert public profile/menu Playwright TODOs into seeded local smoke tests.
5. Re-run architecture and bundle reports from a clean build.
6. Start first real runtime split behind false flags only after security tests
   are green.

## First Recommended Real Refactor

Start with Public Profile if the team wants the lowest write-risk surface. Start
with QR/Menu only if cart/order/table-context Rules tests are implemented first.

## Clear Warning

No new runtime has been activated. All new runtime flags remain `false`.
