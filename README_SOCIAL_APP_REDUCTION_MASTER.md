# MNYRA Social-App Reduction Master

Last updated: 2026-03-12 01:48:48 +01:00

## 1. Current real checkpoint summary
- Current committed checkpoint:
  - `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
  - Commit time: `2026-03-12 01:19:42 +01:00`
  - latest committed code batch under that checkpoint: `current HEAD` - `Batch G - Shell / Auth / Drawer / Notifications DOM Runtime Extraction`
- Current branch state:
  - `main` tracking `origin/main`
  - the worktree was clean before this pass
  - Batch H is now the active local uncommitted runtime batch under review
- Current `apps/menyra-social/social-app.js` size:
  - `5,769` lines
  - `179,441` bytes
- Current reduction direction:
  - startup/auth/public-profile/restaurant-identity/public-bootstrap runtime is already split out in committed history
  - self-profile/account/avatar runtime is committed at `69981fa` into `core/profile/self-profile-runtime-controller.js`
  - restaurant/auth/lead resolution and role-switch runtime is committed at `8183197` into `core/auth/auth-profile-resolution-runtime.js`
  - menu/focus/catalog/favorites runtime is committed at `edf0cf4` into `core/menu/menu-public-runtime-controller.js` and `core/menu/focus-runtime-controller.js`
  - orders runtime and orders view are committed at `b9b54c7` into `core/orders/orders-runtime-controller.js` and `core/orders/orders-render-utils.js`
  - upload/post publishing/media ticket runtime is committed at `ccb962a` into `core/media/media-upload-runtime-controller.js`
  - feed / story identity runtime is committed at `ba600be` into `core/stories/story-feed-runtime-controller.js`
  - restaurant meta / business-location rebuild runtime is committed at `ba600be` into `core/common/restaurant-identity-runtime-controller.js`
  - shell / auth / drawer / notifications DOM runtime is now committed in `core/app-shell/shell-dom-runtime-controller.js`
  - CEO CRM count / support runtime is now extracted locally into `core/crm/ceo-crm-count-runtime-controller.js`
  - reusable CRM count helpers are now expanded in `core/crm/ceo-staff-sync-utils.js`
  - the next untouched meaningful runtime slice after Batch H review is now late-stage controller dependency-map consolidation

## 2. Current role of social-app.js
Today `social-app.js` is still carrying all of these roles at once:
- app entry and startup trigger
- app-wide state container and runtime singleton registry
- controller construction and bridge wiring
- a wrapper layer around extracted feature controllers, including the shared upload bridge used by avatar/menu/focus flows

## 3. Final healthy target role of social-app.js
Long-term, `social-app.js` should only do this:
- import app-level config and feature controllers
- create the central `state`
- own a small number of top-level runtime refs/unsub handles that truly must stay global
- wire feature controllers together
- start persisted-state restore and auth startup
- own minimal cross-feature lifecycle glue

Long-term, `social-app.js` should not still contain:
- Firestore query/search logic
- account save or avatar upload flows
- role resolution or lead-to-restaurant migration logic
- menu/public-catalog/focus/orders/upload business logic
- story/feed reconciliation logic
- CRM count recomputation logic
- large HTML render strings for feature surfaces
- large banks of one-line wrappers whose only job is forwarding into controllers

## 4. Current remaining responsibility clusters inside social-app.js

Clusters B, C, D, E, F, G, and I are committed at `HEAD`. Cluster H is now extracted as the active local Batch H under review, with Cluster A/J cleanup still deferred for late-stage passes.

### Cluster A. Composition Root, State, and Startup Entry
- Approx lines after committed Batch G:
  - `1-1500`
  - lower wrapper/bootstrapping bands near the bottom of the file
- Classification:
  - must stay in `social-app.js` long-term, but in a much smaller form
  - parts of it should remain centralized long-term
- What it currently does:
  - imports feature modules
  - defines app config/constants
  - owns `state`
  - owns runtime refs/unsub holders
  - builds controllers and bridge bundles
  - restores persisted state
  - starts auth/session startup
- Why it is still here:
  - this is the real assembly point and startup order still matters
- Does it belong here long-term:
  - yes, but only as lean composition-root glue
- Where the removable parts should move:
  - repetitive dependency-map assembly into `core/app-shell/controller-deps-factory.js`
  - any residual startup helper logic into focused `core/app-shell` or `core/auth` modules
- Extraction risk:
  - high if treated as a standalone reduction target now
  - easy to create init-order regressions without reducing real responsibility
- Prerequisite cleanup:
  - remove the heavier business/runtime clusters first

### Cluster B. Self Profile / Account / Avatar Runtime
- Current status:
  - completed in committed checkpoint `69981fa`
  - extracted into `core/profile/self-profile-runtime-controller.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns avatar/logo/comment-avatar cache orchestration
  - `social-app.js` no longer owns live self-profile snapshot application or current-user profile listener selection
  - `social-app.js` no longer owns avatar upload, account settings save, or auth user/business profile load flows
- Review gate:
  - no open gate in this pass; this cluster is already committed at `69981fa`

### Cluster C. Restaurant / Lead / Auth Resolution and Role Switching
- Current status:
  - completed in committed checkpoint `8183197`
  - extracted into `core/auth/auth-profile-resolution-runtime.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns restaurant lookup by uid/email or lead lookup by uid/email
  - `social-app.js` no longer owns lead-to-restaurant materialization or auth owner-restaurant resolution
  - `social-app.js` no longer owns role-switch target resolution and its shell/feed rerender handoff
- Review gate:
  - no open gate in this pass; this cluster is already committed at `8183197`

### Cluster D. Feed / Story Identity and Restaurant Meta Runtime
- Current status:
  - completed in committed checkpoint `ba600be`
  - extracted into `core/stories/story-feed-runtime-controller.js`
  - paired restaurant-meta/business-location rebuild runtime moved into `core/common/restaurant-identity-runtime-controller.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns story identity resolution, normalization, or cache-signature bookkeeping
  - `social-app.js` no longer owns story loading/reconcile refresh or fallback feed-derived story generation
  - `social-app.js` no longer owns feed/story logo reconciliation or story-meta DOM patch helpers
  - `social-app.js` no longer owns restaurant public-meta enrichment, business-location rebuilds, or restaurant-meta listener lifecycle
- Review gate:
  - no open gate in this pass; this cluster is already committed at `ba600be`

### Cluster E. Menu / Focus / Public Catalog / Favorites Runtime
- Current status:
  - completed in committed checkpoint `edf0cf4`
  - extracted into `core/menu/menu-public-runtime-controller.js`
  - extracted into `core/menu/focus-runtime-controller.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns favorite menu load/local-state synchronization
  - `social-app.js` no longer owns menu image normalization/fallback fill or public/legacy/collection menu load logic
  - `social-app.js` no longer owns public menu publication or menu cache synchronization
  - `social-app.js` no longer owns focus load/meta/publication runtime, focus carousel rotation state, or focus save/delete flows
- Review gate:
  - no open gate in this pass; this cluster is already committed at `edf0cf4`

### Cluster F. Orders Runtime and Orders View
- Current status:
  - completed in committed checkpoint `b9b54c7`
  - extracted into `core/orders/orders-runtime-controller.js`
  - extracted into `core/orders/orders-render-utils.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns order normalization glue or order listener lifecycle
  - `social-app.js` no longer owns guest/auth checkout write flow
  - `social-app.js` no longer owns orders tab rendering markup
- Review gate:
  - no open gate in this pass; this cluster is already committed at `b9b54c7`

### Cluster G. Upload / Post Publishing / Media Ticket Runtime
- Current status:
  - completed in committed checkpoint `ccb962a`
  - extracted into `core/media/media-upload-runtime-controller.js`
  - already at `HEAD` / `origin/main`
- Local outcome:
  - `social-app.js` no longer owns upload view rendering or upload-mode selection runtime
  - `social-app.js` no longer owns media ticket issuance or direct image/story upload requests
  - `social-app.js` no longer owns business/user post creation, story publish handoff, or upload state reset/tab handoff
  - shared `uploadCompressedImage(...)` still remains available through a root wrapper for avatar/menu/focus flows
- Review gate:
  - no open gate in this pass; this cluster is already committed at `ccb962a`

### Cluster H. CEO CRM Ownership / Count Support Runtime
- Current status:
  - extracted in the current local Batch H under review
  - moved into `core/crm/ceo-crm-count-runtime-controller.js`
  - reusable count helpers expanded in `core/crm/ceo-staff-sync-utils.js`
- What it currently does:
  - CEO meta normalization
  - staff hydration from user profiles
  - ownership resolution
  - scope tab rendering
  - CRM contribution counting
  - CRM count recomputation and persistence to `users` and `superadmins`
- Why it is still here:
  - earlier CRM work extracted the main controller first, but these support calculations still sit beside global state and Firestore helpers
- Does it belong here long-term:
  - no
- Where it should move:
  - expand `core/crm/ceo-staff-sync-utils.js`
  - add `core/crm/ceo-crm-count-runtime-controller.js`
- Extraction risk:
  - medium to medium-high
  - count correctness matters and there is no emulator evidence in this repo state
- Prerequisite cleanup:
  - keep the extraction isolated from lead/customer save behavior
- Local outcome:
  - `social-app.js` no longer owns CEO staff hydration/profile-overlay sync logic
  - `social-app.js` no longer owns CEO ownership visibility/meta resolution or CRM count delta/recount persistence logic
  - `social-app.js` no longer owns CEO scope-tab and ownership-pill rendering helpers
- Review gate:
  - local-only until Batch H is smoke-tested and committed as its own rollback unit

### Cluster I. Shell / Auth / Drawer / Notifications DOM Runtime
- Current status:
  - completed in committed checkpoint `current HEAD`
  - extracted into `core/app-shell/shell-dom-runtime-controller.js`
  - already at `HEAD`
- Local outcome:
  - `social-app.js` no longer owns auth screen rendering
  - `social-app.js` no longer owns drawer rendering or role-switch link HTML assembly
  - `social-app.js` no longer owns shell DOM patching for header/drawer/menu badge state
  - `social-app.js` no longer owns notification badge DOM updates or notifications-view delegation/update flow
- Review gate:
  - no open gate in this pass; this cluster is now committed at `HEAD`

### Cluster J. Thin Wrapper Bridge Layer
- Current status:
  - still in `social-app.js`
  - should wait until prerequisite extractions are done
- What it currently does:
  - forwards calls from `social-app.js` into already-extracted controllers and core helpers
- Why it is still here:
  - other modules still expect root-level functions, so the wrappers keep contracts stable
- Does it belong here long-term:
  - only a very small portion
  - most of it should disappear later
- Where it should move:
  - either deleted entirely after direct controller wiring
  - or collapsed into much smaller bridge objects/factories
- Extraction risk:
  - high value is low if done alone
  - easy to spend a batch moving wrappers without reducing real responsibility
- Prerequisite cleanup:
  - remove the larger business/runtime clusters first

## 5. Best next extraction candidates

Batch H is now the active local batch. Treat the first untouched candidate below as the next implementation target after Batch H review.

| Rank | Candidate | Current cluster(s) | Size | Why it is ranked here | Suggested destination |
| --- | --- | --- | --- | --- | --- |
| 1 | Late-stage controller dependency-map consolidation | A | Medium | Biggest remaining non-wrapper reduction after local CRM support extraction | `core/app-shell/controller-deps-factory.js` |
| 2 | Wrapper layer collapse | J | Small to medium, but low value if done alone | More valuable only after Batch I removes composition-root assembly noise | direct controller wiring / bridge cleanup |

## 6. Which clusters are unsafe to extract yet
- Composition-root/controller construction as a standalone batch:
  - Too much of the current weight there is still real cross-feature wiring.
  - Moving it now would mostly relocate complexity, not remove it.
- Thin wrapper bridge cleanup as a standalone batch:
  - It is the definition of low-value micro-refactor churn unless paired with a real feature extraction.
- Another startup-sequencing-only slice:
  - Current bottom-of-file startup entry is already relatively lean.
  - The heavier load-bearing areas are now elsewhere.
- Mixed cross-domain mega-batch:
  - Do not combine feed/story identity, shell DOM, CRM counts, and composition-root cleanup in one move.

## 7. Staged roadmap from current state to the target 800-1500-line state

### Stage 0. Current state
- `social-app.js` is now about `5.77k` lines locally after the local Batch H extraction.
- Startup/auth/public bootstrap plus self-profile/account/avatar, restaurant/lead/auth resolution, menu/focus/catalog, orders, and media upload extraction are committed at `HEAD`.
- Feed/story identity plus restaurant-meta/business-location runtime is committed at `HEAD`.
- Shell/auth/drawer/notifications DOM runtime is committed at `HEAD`.
- CEO CRM ownership/count support runtime is now extracted locally for review.

### Stage 1. Next meaningful reduction wave
- Target outcome:
  - validate the local CEO CRM count/support extraction
  - preserve CRM count correctness and CEO ownership visibility behavior
- Expected file state:
  - roughly `5.6k-5.9k` lines
- Good batch choices:
  - Batch H review only

### Stage 2. Runtime + shell reduction wave
- Target outcome:
  - remove late-stage dependency-map assembly noise
  - keep the CRM support runtime extraction isolated from composition-root cleanup
- Expected file state:
  - roughly `3.0k-4.8k` lines

### Stage 3. Final composition-root cleanup
- Target outcome:
  - collapse the remaining wrapper-heavy bridge surfaces
  - keep only config import, state bootstrap, controller wiring, startup entry, and minimal lifecycle glue
- Expected file state:
  - `800-1500` lines

## 8. Batch sizing guidance
- Too small:
  - moving one render function
  - moving one helper constant bank
  - moving one wrapper that still leaves the same responsibility in place
  - "cleanup" batches that only rename or rehome thin forwarding functions
- Too big:
  - any batch that changes feed/story identity, shell DOM, CRM persistence, and composition-root wiring together
  - any batch that rewrites controller interfaces and feature behavior at the same time
- Ideal meaningful safe batch for this repo:
  - one cohesive runtime surface
  - usually `250-700+` lines of real responsibility moved out of `social-app.js`
  - limited to one domain plus its immediate bridge wiring
  - rollback-friendly in one commit

## 9. Explicit do-not-do rules for future chats
- Do not do cosmetic micro-moves that leave the same load-bearing behavior in `social-app.js`.
- Do not do giant rewrites across multiple feature domains.
- Do not reopen already-proven startup/public bootstrap areas just because they are familiar.
- Do not continue using stale checkpoint labels if `git` and current code show a newer reality.
- Do not move code unless the move reduces real responsibility, not just line count optics.
- Do not treat wrapper deletion as a meaningful batch unless a real runtime cluster moved with it.
- Do not let README tracking drift away from actual `HEAD`.

## 10. Suggested next execution plan

### Batch A. Self Profile / Account / Avatar Runtime Extraction
- Status:
  - completed in committed checkpoint `69981fa`
  - already in `main` history before `HEAD`

### Batch B. Restaurant / Lead / Auth Resolution + Role Switch Extraction
- Status:
  - completed in committed checkpoint `8183197`
  - already at `HEAD` / `origin/main`

### Batch C. Menu / Focus Public Catalog Runtime Extraction
- Status:
  - completed in committed checkpoint `edf0cf4`
  - already at `HEAD` / `origin/main`

### Batch D. Orders Runtime + Orders View Extraction
- Status:
  - completed in committed checkpoint `b9b54c7`
  - already at `HEAD` / `origin/main`

### Batch E. Upload / Post Publishing / Media Ticket Runtime Extraction
- Status:
  - completed in committed checkpoint `ccb962a`
  - already at `HEAD` / `origin/main`
- Scope:
  - upload view rendering
  - image/video upload selection and worker ticket issuance
  - avatar/post/story media upload requests
  - business/user post creation
  - upload state reset and tab handoff
- Why it was the batch:
  - Batch D was already committed at `b9b54c7`
  - upload/media was the next untouched isolated runtime surface after orders
  - rollback stayed cleanly separated from feed/story identity, shell DOM, and CRM

### Batch F. Feed / Story Identity Runtime Extraction
- Status:
  - completed in committed checkpoint `ba600be`
  - already at `HEAD` / `origin/main`
- Scope:
  - business-location rebuilds
  - restaurant public-meta enrichment
  - feed logo reconciliation
  - story normalization/loading/cache refresh
  - feed-derived story generation
- Why it was the batch:
  - Batch E was already committed at `ccb962a`
  - feed/story identity was the next untouched large-safe runtime surface after upload/media
  - rollback stayed separate from shell DOM and CRM support

### Batch G. Shell / Auth / Drawer / Notifications DOM Runtime Extraction
- Status:
  - completed in committed checkpoint `current HEAD`
  - already at `HEAD`
- Scope:
  - auth screen rendering
  - drawer rendering
  - shell DOM patching
  - notification badge DOM updates and delegation
- Why it was the batch:
  - Batch F is already committed at `ba600be`
  - shell/auth/drawer/notifications DOM runtime was the next untouched large-safe runtime surface after story/feed
  - rollback remains separate from CEO CRM count/support runtime and late-stage wrapper cleanup

### Batch H. CEO CRM Count / Support Runtime Extraction
- Status:
  - current local Batch H under review
  - not yet committed
- Scope:
  - CEO meta normalization and ownership resolution support
  - staff hydration/count support glue that still sits beside root state
  - CRM contribution count recomputation and persistence to `users` / `superadmins`
  - residual CEO CRM scope support that still lives outside the CRM controller
- Why it is next:
  - Batch G is the committed checkpoint preserved beneath this local pass
  - CEO CRM count/support runtime was the next untouched meaningful domain after shell/auth/drawer/notifications DOM runtime
  - rollback remains separate from late-stage dependency-map cleanup and wrapper collapse
- Local implementation outcome:
  - added `core/crm/ceo-crm-count-runtime-controller.js` for CEO ownership/meta visibility support, CRM count delta/recount persistence, and directory-profile patch sync
  - expanded `core/crm/ceo-staff-sync-utils.js` with reusable CRM count helper utilities
  - reduced `social-app.js` to stable forwards for the extracted CRM support surface

### Batch I. Late-Stage Controller Dependency-Map Consolidation
- Scope:
  - repetitive controller dependency-map assembly in `social-app.js`
  - remaining composition-root wiring noise that still obscures the startup entry
- Why it is next:
  - Batch H is now the active local batch under review
  - after CRM support extraction, dependency-map assembly is the largest remaining non-wrapper reduction target
  - wrapper collapse still remains lower-value until Batch I removes the composition-root noise first

### Important planning note
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" should not be resumed by default.
- If startup entry cleanup happens later, it should be a late-stage composition-root cleanup after the heavier runtime clusters above are gone.
