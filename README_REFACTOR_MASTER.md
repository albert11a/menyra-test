# MNYRA Refactor Master

Last updated: 2026-03-11 22:18:32 +01:00

## Current committed safe checkpoint
- `edf0cf4` - `refactor(social): extract menu focus public runtime`
- Commit time: `2026-03-11 21:52:38 +01:00`
- Current branch at inspection: `main` tracking `origin/main`

## Current branch state
- Local runtime batch in progress: `Batch D - Orders Runtime + Orders View Extraction`.
- Runtime and documentation changes are local only on top of clean committed checkpoint `edf0cf4`.
- Nothing has been committed or pushed in this pass.

## Current social-app reduction status
- `apps/menyra-social/social-app.js` is now `6,785` lines and `244,713` bytes locally.
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
- Durable source of truth for the next reduction phase:
  - `README_SOCIAL_APP_REDUCTION_MASTER.md`
- Current extraction status:
  - `core/profile/self-profile-runtime-controller.js` owns the self-profile/account/avatar runtime cluster in committed checkpoint `69981fa`.
  - `core/auth/auth-profile-resolution-runtime.js` owns the restaurant/lead/auth resolution + role-switch target runtime in committed checkpoint `8183197`.
  - `core/menu/menu-public-runtime-controller.js` and `core/menu/focus-runtime-controller.js` own the menu/focus/catalog runtime cluster in committed checkpoint `edf0cf4`.
  - `core/orders/orders-runtime-controller.js` now owns the orders listener and checkout runtime locally.
  - `core/orders/orders-render-utils.js` now owns the orders tab rendering locally.
  - The exact next untouched roadmap slice after review is Batch E: upload / post publishing / media ticket runtime extraction.

## Current reduction direction
- Recent work already removed a meaningful amount of startup/auth/public bootstrap responsibility from `social-app.js`.
- Batch C is already committed at `edf0cf4`.
- Batch D now removes the orders runtime + orders view locally.
- The next reductions should target the still-live runtime clusters that remain inside the file:
  - upload/post publishing runtime
  - feed/story identity runtime
  - shell/auth/drawer/notifications DOM runtime
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
