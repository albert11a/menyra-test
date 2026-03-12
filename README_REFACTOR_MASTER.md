# MNYRA Refactor Master

Last updated: 2026-03-12 01:48:48 +01:00

## Current committed safe checkpoint
- `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Commit time: `2026-03-12 01:19:42 +01:00`
- Latest committed code batch under that checkpoint:
  - `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Current branch at inspection: `main` tracking `origin/main`

## Current branch state
- The worktree was clean at inspection before this pass.
- Batch H is now the active local uncommitted runtime batch under review.
- This pass preserves committed Batch G as the rollback-safe checkpoint while applying local Batch H extraction and tracking updates.
- No commit or push was performed in this pass.

## Current social-app reduction status
- `apps/menyra-social/social-app.js` is now `5,769` lines and `179,441` bytes locally.
- Recent committed social-app reduction checkpoints:
  - `090eff5` - auth-startup state helper extraction
  - `2c6daba` - auth session startup coordinator extraction
  - `815e8fa` - startup bootstrap wiring reduction
  - `e79c85e` - pending route startup state extraction
  - `be44f5a` - post-login route coordination reduction
  - `2e0e715` - public profile runtime extraction
  - `4aaf0fc` - restaurant identity runtime extraction
  - `4ebadb2` - public bootstrap runtime extraction
  - `69981fa` - self profile runtime extraction
  - `8183197` - auth profile resolution runtime extraction
  - `edf0cf4` - menu/focus public runtime extraction
  - `b9b54c7` - orders runtime + orders view extraction
  - `ccb962a` - media upload runtime extraction
  - `ba600be` - feed story runtime extraction
  - `current HEAD` - shell/auth/drawer/notifications DOM runtime extraction
- Durable source of truth for the reduction sequence:
  - `README_SOCIAL_APP_REDUCTION_MASTER.md`
- Current extraction status:
  - `core/profile/self-profile-runtime-controller.js` owns the self-profile/account/avatar runtime cluster in committed checkpoint `69981fa`.
  - `core/auth/auth-profile-resolution-runtime.js` owns the restaurant/lead/auth resolution + role-switch target runtime in committed checkpoint `8183197`.
  - `core/menu/menu-public-runtime-controller.js` and `core/menu/focus-runtime-controller.js` own the menu/focus/catalog runtime cluster in committed checkpoint `edf0cf4`.
  - `core/orders/orders-runtime-controller.js` and `core/orders/orders-render-utils.js` own the orders runtime/view cluster in committed checkpoint `b9b54c7`.
  - `core/media/media-upload-runtime-controller.js` owns the upload/post publishing/media ticket runtime in committed checkpoint `ccb962a`.
  - `core/stories/story-feed-runtime-controller.js` and `core/common/restaurant-identity-runtime-controller.js` own the feed/story identity + restaurant-meta runtime in committed checkpoint `ba600be`.
  - `core/app-shell/shell-dom-runtime-controller.js` now owns the shell/auth/drawer/notifications DOM runtime in the current committed checkpoint.
  - `core/crm/ceo-crm-count-runtime-controller.js` now owns the CEO CRM ownership/count support runtime in the current local Batch H under review.
  - `core/crm/ceo-staff-sync-utils.js` now also owns the reusable CRM count helper set used by that local Batch H extraction.
  - The exact next untouched roadmap slice after review is Batch I: late-stage controller dependency-map consolidation.

## Current reduction direction
- Recent work already removed a meaningful amount of startup/auth/public bootstrap, profile, commerce, and media responsibility from `social-app.js`.
- Batch F is already committed at `HEAD`.
- Batch G is now the current committed checkpoint.
- Batch H is the current local-only extraction under review.
- The next reductions should target the still-live runtime clusters that remain inside the file:
  - late-stage composition-root dependency-map cleanup
  - wrapper-layer collapse only after the heavier runtime clusters are gone
- The older pre-blueprint note of "Batch 16 - startup bootstrap entry sequencing reduction" is still superseded. That is not the default next step while larger load-bearing clusters remain.

## Current docs
- Master blueprint: `README_SOCIAL_APP_REDUCTION_MASTER.md`
- Log: `README_REFACTOR_LOG.md`
- Next: `README_REFACTOR_NEXT.md`
- Rollback: `README_REFACTOR_ROLLBACK.md`

## Current repo-wide carry-over risks
- Firestore Batch 3B validation evidence is still pending on emulator/staging.
- Client-driven social counters are still not server-authoritative.
- Legacy ownership/team metadata gaps can still block some business writes under strict rules.

## Working rule from this point
- Review the blueprint first.
- Pick the next approved runtime batch from that blueprint.
- Do not resume from stale checkpoint labels if the actual codebase now points to a better larger-safe slice.
