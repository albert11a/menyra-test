# MNYRA Refactor Master

Last updated: 2026-03-11 21:40:12 +01:00

## Current committed safe checkpoint
- `8183197` - `refactor(social): extract auth profile resolution runtime`
- Commit time: `2026-03-11 21:20:40 +01:00`
- Current branch at inspection: `main` tracking `origin/main`

## Current branch state
- Local runtime batch in progress: `Batch C - Menu / Focus Public Catalog Runtime Extraction`.
- Runtime and documentation changes are local only on top of clean committed checkpoint `8183197`.
- Nothing has been committed or pushed in this pass.

## Current social-app reduction status
- `apps/menyra-social/social-app.js` is now `7,461` lines and `253,587` bytes locally.
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
- Durable source of truth for the next reduction phase:
  - `README_SOCIAL_APP_REDUCTION_MASTER.md`
- Current extraction status:
  - `core/profile/self-profile-runtime-controller.js` owns the self-profile/account/avatar runtime cluster in committed checkpoint `69981fa`.
  - `core/auth/auth-profile-resolution-runtime.js` owns the restaurant/lead/auth resolution + role-switch target runtime in committed checkpoint `8183197`.
  - `core/menu/menu-public-runtime-controller.js` now owns the menu/public catalog/favorites runtime locally.
  - `core/menu/focus-runtime-controller.js` now owns the focus load/publication/carousel runtime locally.
  - The exact next untouched roadmap slice after review is Batch D: orders runtime + orders view extraction.

## Current reduction direction
- Recent work already removed a meaningful amount of startup/auth/public bootstrap responsibility from `social-app.js`.
- Batch A has already removed the self-profile/account/avatar runtime in committed checkpoint `69981fa`.
- Batch B already removed the restaurant/auth/lead resolution and role-switch runtime in committed checkpoint `8183197`.
- Batch C now removes the menu/focus/catalog/favorites runtime locally.
- The next reductions should target the still-live runtime clusters that remain inside the file:
  - orders runtime
  - upload/post publishing runtime
  - feed/story identity runtime
  - CEO CRM count/support runtime
- The older pre-blueprint note of "Batch 16 - startup bootstrap entry sequencing reduction" is no longer the default next step. That would be another narrow startup-only slice while larger load-bearing clusters still remain in the file.

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
