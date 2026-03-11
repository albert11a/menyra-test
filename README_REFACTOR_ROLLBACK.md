# MNYRA Refactor Rollback Guide

Last updated: 2026-03-11 04:30:35 +01:00

## Rollback principle
- Roll back by completed batch boundaries.
- Never partially revert coupled files inside a batch.
- Prefer narrow revert scope to preserve unrelated progress.

## Safe rollback points
1. Pre-Batch 1 baseline (before hardening changes)
2. Post-Batch 1 checkpoint
3. Post-Batch 2 checkpoint
4. Post-Batch 3 baseline-capture checkpoint
5. Post-Batch 3B Firestore hardening checkpoint
6. Post-Superadmin build-status batch checkpoint
7. Post-startup first-click navigation stability batch checkpoint
8. Post-upload CORS compatibility fix checkpoint (`99b3df9`)
9. Post-tracking continuity sync + ticket-secret fallback checkpoint (`38d6a2b`) — current safe checkpoint

## Completed changes and rollback coupling
### Batch 1 — Critical Security Lock + Tracking Scaffolding
Status: Completed

Isolated technical changes:
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-shell/app-shell-runtime-controller.js`
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Yes. Batch 1 can be reverted without touching infra/data because it introduced no schema or data migrations.

Must be reverted together if something breaks:
- The three JS files above should be reverted together because they form one auth wiring unit.
- The four README files should be reverted/updated together to keep continuity accurate.

Blast radius:
- Functional blast radius limited to authentication submit flow and dependency wiring.
- Security blast radius of rollback is high because reverting reintroduces hidden privileged shortcut behavior.

### Batch 2 — Media Upload/Delete Authorization Hardening
Status: Completed

Coupled technical changes:
- `functions/index.js`
- `cloudflare-edge/menyra-media-worker.js`
- `apps/menyra-social/social-app.js`
- `shared/bunny-edge.js`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Not safely as single-file reverts. Batch 2 should be reverted as one coupled unit because function/worker/frontend contracts changed together.

Must be reverted together if something breaks:
- `functions/index.js` + `cloudflare-edge/menyra-media-worker.js` + `apps/menyra-social/social-app.js` + `shared/bunny-edge.js`

Blast radius:
- Media upload paths (avatar/feed/story uploads).
- Worker write endpoint authorization behavior.
- Function endpoint dependency (`issueMediaActionTicket`) and shared secret env configuration.

### Batch 3 — Firestore Governance Baseline Capture
Status: Completed

Coupled technical changes:
- `.gitignore`
- `firestore.rules`
- `firestore.indexes.json`
- `firebase.json`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Yes, as one coupled baseline-capture unit.

Must be reverted together if something breaks:
- `.gitignore` + `firestore.rules` + `firestore.indexes.json` + `firebase.json`

Blast radius:
- Runtime blast radius is low until deployment.
- Deployment blast radius is high if open baseline rules are deployed without hardening.

### Batch 3B — Firestore Rule Hardening
Status: Completed in code/commits; deployment validation evidence pending

Coupled technical changes:
- `firestore.rules`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Yes, as one coupled rule-hardening unit.

Must be reverted together if something breaks:
- `firestore.rules` + all four tracking README files.

Blast radius:
- All client Firestore reads/writes at runtime after rules deployment.
- Highest-risk areas: auth/session bootstrap data reads, social interactions (follow/chat/notifications), business owner writes, CRM queries.
- Critical missing item note: no completed emulator/staging validation evidence yet; rollback should be immediate if first deployment shows rule rejections on required paths.

### Superadmin Staff Build-Status Card (Small Scoped Batch)
Status: Completed and pushed (`7aecd7d`)

Coupled technical changes:
- `api/build-info.js`
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/crm/crm-runtime-controller.js`
- `apps/menyra-social/_shared/crm-lazy-renderers.js`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Yes, as one coupled feature unit. No schema/data migration is included.

Must be reverted together if something breaks:
- All four code files above should be reverted together (endpoint + dependency wiring + runtime loader + UI surface).

Blast radius:
- Superadmin `staff` view only.
- Final scope is real `mnyra-social` Superadmin/staff area (not CEO lead settings).
- Added read-only metadata endpoint (`/api/build-info`) with no auth side effects.
- No intended impact to Firestore rules, media auth, or non-staff tabs.

### Startup First-Click Navigation Stability Fix
Status: Completed and pushed (`c9fcd36`)

Coupled technical changes:
- `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js`
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`

Documentation changes:
- `README_REFACTOR_MASTER.md`
- `README_REFACTOR_LOG.md`
- `README_REFACTOR_NEXT.md`
- `README_REFACTOR_ROLLBACK.md`

Can be reverted independently:
- Yes, as one coupled startup/auth-runtime unit.

Must be reverted together if something breaks:
- Both startup runtime files above should be reverted together (bootstrap tab handoff contract).

Blast radius:
- Initial page load / auth bootstrap tab stability.
- Primary risk if rolled back: first manual navigation after refresh can be overridden back to feed.

## Rollback procedures
### Batch 1 rollback
1. Revert the three Batch 1 JS files as one set.
2. Re-run syntax checks on those files.
3. Append rollback record to `README_REFACTOR_LOG.md`.
4. Update master/next docs.

### Batch 2 rollback
1. Revert all four coupled Batch 2 code files together.
2. Re-run syntax checks:
   - `node --check functions/index.js`
   - `node --check apps/menyra-social/social-app.js`
   - `node --check shared/bunny-edge.js`
   - `Get-Content cloudflare-edge/menyra-media-worker.js -Raw | node --check --input-type=module`
3. Confirm uploads no longer expect ticket header in frontend.
4. Append rollback record to log and update master/next docs.

### Batch 3 rollback
1. Revert `.gitignore`, `firestore.rules`, `firestore.indexes.json`, and `firebase.json` together.
2. Confirm `firebase.json` no longer references Firestore config files.
3. Append rollback record to log and update master/next docs.

### Batch 3B rollback
1. Revert `firestore.rules` and the four README tracking files together.
2. Re-run Firestore access smoke checks against the previous known-good rules baseline.
3. Append rollback record to log and update master/next docs.
4. Keep Batch 3 baseline files (`firestore.indexes.json`, `firebase.json`) intact unless baseline-capture rollback is also required.

### Superadmin build-status batch rollback
1. Revert:
   - `api/build-info.js`
   - `apps/menyra-social/social-app.js`
   - `apps/menyra-social/core/crm/crm-runtime-controller.js`
   - `apps/menyra-social/_shared/crm-lazy-renderers.js`
2. Confirm Superadmin `staff` view opens without build card and existing staff list behavior still works.
3. Append rollback record to log and update master/next docs.

### Startup first-click navigation stability rollback
1. Revert:
   - `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js`
   - `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
2. Validate startup/auth bootstrap and first navigation click behavior after refresh.
3. Append rollback record to log and update master/next docs.

## Planned future rollback boundaries
- Batch 4 (startup dedup/perf) will be one coupled unit across startup HTML/app runtime/PWA files.
