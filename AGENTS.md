Status: CURRENT
Last updated: 2026-07-01

# Mnyra Codex Rules

## Current Truth

Use these files first when judging project state and priorities:

- `AGENTS.md`
- `docs/mnyra-launch-masterplan.md`
- `docs/mnyra-current-phase.md`
- `docs/codex/MNYRA_REFACTOR_MASTER_PLAN.md`

Older dated notes are archive context unless they are explicitly marked
`Status: CURRENT`.

## Repo Overview

- `apps/menyra-social`: main social web app, public profile/menu/QR, feed, travel,
  shopping, owner/editor and authenticated surfaces.
- `apps/mnyra-heart`: Heart/CRM/admin app.
- `apps/waiter`: waiter-facing app.
- `functions`: Firebase Functions and Heart server handlers.
- `shared`: shared config, vendor wrappers and cross-app utilities.
- `tests`: Node regression tests, Heart runner and prepared E2E/rules scaffolding.
- `seed`: local emulator-only seed data and seed scripts.

## Core Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Unit tests: `npm test` or `npm run test:unit`
- Rules tests: `npm run test:rules`
- Functions tests: `npm run test:functions`
- E2E scaffold: `npm run test:e2e`
- All non-browser baseline checks: `npm run test:all`
- Lint: `npm run lint`
- Format check: `npm run format:check`
- Architecture report/check: `npm run arch:report`, `npm run arch:check`
- Architecture graph/cycles: `npm run arch:graph`, `npm run arch:cycles`
- Bundle analysis: `npm run build:analyze`, `npm run bundle:report`
- Local emulators: `npm run emulators:start`
- Local seed: `npm run emulators:seed`
- Emulator export: `npm run emulators:export`

## Branch Rules

- This preparation branch is `mnyrasocial`, created from current `main`.
- Do not work directly on `main`.
- Do not merge this branch into `main` automatically.
- If another task explicitly returns to the previous mainline flow, follow the
  branch rule in `docs/mnyra-current-phase.md` for that task.

## Architecture Rules

- Website-first remains the direction, but visible UI stays stable unless the
  user explicitly approves a visual change.
- Public route truth, reserved routes, public visibility and read/write ownership
  must be clear before runtime extraction.
- Future runtimes must keep clear ownership:
  public profile, public menu/QR, social feed, business owner, waiter,
  Heart/CRM, travel, shopping and analytics.
- `shared` may not depend on app runtimes.
- `functions` may not import browser app code.
- New runtime work must start behind false feature flags.

## Safety Rules

- No production Firebase data for local tests or seeds.
- Emulator project ID is `mnyra-local`.
- No Firestore collection renames without explicit approval.
- No route changes, DOM ID removals, old logic deletion or large product
  refactors in prep work.
- Do not run production deploy commands from Codex.
- Do not run Playwright/smoke checks unless the user explicitly asks for that
  run; prepared skipped tests are allowed.

## Definition Of Done

- Scope is documented before implementation.
- Changes are small and reversible.
- No hidden UI/product/routing behavior changes are included.
- Relevant docs and generated reports are updated.
- Commands run and failures are documented.
- Commit hash, changed files, skipped checks and manual test list are reported.

## Review Checklist

- Does the change respect public/app boundaries?
- Does it avoid activating new runtime behavior by default?
- Does it avoid production config or real customer data?
- Are tests/checks scoped to prep infrastructure?
- Are risks and next safe refactor steps documented?
