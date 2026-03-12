# MNYRA Refactor Master

Last updated: 2026-03-12 03:02:22 +01:00

## Current committed safe checkpoint
- `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Latest committed code batch under that checkpoint:
  - `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Current branch at inspection: `main` tracking `origin/main`

## Current branch state
- The worktree was clean before this pass.
- This pass commits only Batch I runtime code plus its related tracking updates.
- No unrelated changes are included in this checkpoint.

## Current social-app reduction status
- `apps/menyra-social/social-app.js` is now `5,357` lines and `166,188` bytes.
- Recent committed social-app reduction checkpoints:
  - `69981fa` - self profile runtime extraction
  - `8183197` - auth profile resolution runtime extraction
  - `edf0cf4` - menu/focus public runtime extraction
  - `b9b54c7` - orders runtime + orders view extraction
  - `ccb962a` - media upload runtime extraction
  - `ba600be` - feed story runtime extraction
  - `6a61573` - shell/auth/drawer/notifications DOM runtime extraction
  - `844d435` - CEO CRM count/support runtime extraction
  - `current HEAD` - social engagement support runtime extraction
- Current extraction outcome:
  - `core/profile/social-engagement-support-runtime-controller.js` now owns the post/menu social support runtime, modal refresh helpers, comment/avatar support, and profile-post action flow that previously remained inline in `social-app.js`.

## Current reduction direction
- Startup/auth/public bootstrap, profile/account/avatar, restaurant/auth resolution, menu/focus/catalog, orders, media upload, feed/story identity, shell DOM, CEO CRM count/support, and social-engagement support runtime are committed at `HEAD`.
- The next untouched runtime candidates are:
  - push / notifications / follow runtime
  - feed / profile content support runtime
- Late-stage dependency-map consolidation and wrapper collapse remain deferred.
- Do not reopen composition-root cleanup as the default next step while larger domain/runtime blocks still remain.

## Current docs
- Master blueprint: `README_SOCIAL_APP_REDUCTION_MASTER.md`
- Log: `README_REFACTOR_LOG.md`
- Next: `README_REFACTOR_NEXT.md`
- Rollback: `README_REFACTOR_ROLLBACK.md`

## Current repo-wide carry-over risks
- Firestore Batch 3B validation evidence is still pending on emulator/staging.
- Client-driven social counters are still not server-authoritative.
- Legacy ownership/team metadata gaps can still block some business writes under strict rules.
