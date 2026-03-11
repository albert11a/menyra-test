# MNYRA Social-App Reduction Master

Last updated: 2026-03-11 21:40:12 +01:00

## 1. Current real checkpoint summary
- Current committed checkpoint:
  - `8183197` - `refactor(social): extract auth profile resolution runtime`
  - Commit time: `2026-03-11 21:20:40 +01:00`
- Current branch state:
  - `main` tracking `origin/main`
  - local uncommitted runtime batch present: `Batch C - Menu / Focus Public Catalog Runtime Extraction`
  - nothing committed or pushed in this pass
- Current `apps/menyra-social/social-app.js` size:
  - `7,461` lines
  - `253,587` bytes
- Current reduction direction:
  - startup/auth/public-profile/restaurant-identity/public-bootstrap runtime has already been split out in recent checkpoints
  - self-profile/account/avatar runtime is extracted in committed checkpoint `69981fa` into `core/profile/self-profile-runtime-controller.js`
  - restaurant/auth/lead resolution and role-switch runtime is extracted in committed checkpoint `8183197` into `core/auth/auth-profile-resolution-runtime.js`
  - menu/focus/catalog/favorites runtime is now extracted locally into `core/menu/menu-public-runtime-controller.js` and `core/menu/focus-runtime-controller.js`
  - the next untouched meaningful runtime slice is now orders runtime + orders view

## 2. Current role of social-app.js
Today `social-app.js` is still carrying all of these roles at once:
- app entry and startup trigger
- app-wide state container and runtime singleton registry
- controller construction and bridge wiring
- feed/story identity and restaurant-meta runtime
- orders runtime and orders view rendering
- upload/post publishing/media ticket runtime
- CEO CRM ownership/count support runtime
- shell/drawer/auth/notifications DOM runtime
- a large wrapper layer around already-extracted feature controllers

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
- menu/public-catalog/focus/orders business logic
- story/feed reconciliation logic
- CRM count recomputation logic
- large HTML render strings for feature surfaces
- large banks of one-line wrappers whose only job is forwarding into controllers

## 4. Current remaining responsibility clusters inside social-app.js

Clusters B, C, and E are recorded below as completed extraction status. The next untouched remaining clusters start at Cluster F. Line spans below are approximate and should be remeasured when a cluster becomes active.

### Cluster A. Composition Root, State, and Startup Entry
- Lines:
  - `1-1157`
  - `6205-7186`
  - `9257-9318`
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
- Main dependencies:
  - almost every controller and runtime helper in the social app
- Extraction risk:
  - high if treated as a standalone reduction target now
  - easy to create init-order regressions without reducing real responsibility
- Prerequisite cleanup:
  - remove the heavier business/runtime clusters first
- Appropriate batch size:
  - not a standalone behavior batch now
  - late-stage medium builder cleanup only

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
- Lines:
  - `2868-3250`
  - `8499-8567`
- Classification:
  - safe to extract soon
- What it currently does:
  - business-location rebuilds
  - restaurant public-meta enrichment
  - feed logo reconciliation
  - story identity resolution and normalization
  - story loading and cache refresh
  - feed-post normalization
  - feed-derived story generation
- Why it is still here:
  - it still depends on `state.feedPosts`, `state.stories`, `state.restaurants`, cache writes, and direct DOM refresh paths
- Does it belong here long-term:
  - no
- Where it should move:
  - expand `core/common/restaurant-identity-runtime-controller.js`
  - add `core/stories/story-feed-runtime-controller.js`
  - keep feed row rendering in existing feed controllers
- Main dependencies:
  - `state.restaurants`, `state.feedPosts`, `state.stories`
  - `writeCache`, `readCache`
  - `storySystemController`
  - `updateFeedDom`, `render`
- Extraction risk:
  - medium to medium-high
  - recent startup/public bootstrap work still feeds this area
- Prerequisite cleanup:
  - do not combine this with more startup bootstrap reshuffling in the same batch
- Appropriate batch size:
  - larger but still safe

### Cluster E. Menu / Focus / Public Catalog / Favorites Runtime
- Current status:
  - completed locally in this workspace
  - extracted into `core/menu/menu-public-runtime-controller.js`
  - extracted into `core/menu/focus-runtime-controller.js`
  - not committed or pushed yet
- Local outcome:
  - `social-app.js` no longer owns favorite menu load/local-state synchronization
  - `social-app.js` no longer owns menu image normalization/fallback fill or public/legacy/collection menu load logic
  - `social-app.js` no longer owns public menu publication or menu cache synchronization
  - `social-app.js` no longer owns focus load/meta/publication runtime, focus carousel rotation state, or focus save/delete flows
- Review gate:
  - validate this local batch before starting Batch D / Cluster F

### Cluster F. Orders Runtime and Orders View
- Lines:
  - `7665-7727`
  - `8892-9037`
- Classification:
  - safe to extract now
- What it currently does:
  - order normalization glue
  - order listener lifecycle
  - guest/auth checkout write flow
  - orders tab rendering
- Why it is still here:
  - it still touches `state.orders`, `state.shopCart`, shop/cart helpers, and direct tab/render transitions
- Does it belong here long-term:
  - no
- Where it should move:
  - new `core/orders/orders-runtime-controller.js`
  - new `core/orders/orders-render-utils.js`
- Main dependencies:
  - `state.orders`, `state.shopCart`
  - `db`, `collection`, `doc`, `writeBatch`, `onSnapshot`
  - cart helper APIs and `render`
- Extraction risk:
  - medium-low to medium
  - flow is isolated compared with CRM and auth
- Prerequisite cleanup:
  - none
- Appropriate batch size:
  - medium

### Cluster G. Upload / Post Publishing / Media Ticket Runtime
- Lines:
  - `7728-8047`
  - `8182-8325`
- Classification:
  - safe to extract now
- What it currently does:
  - upload view rendering
  - image/video upload selection
  - media ticket issuance
  - avatar/post/story media upload requests
  - business/user post creation
  - upload state reset and tab handoff
- Why it is still here:
  - it still bridges UI state, media worker auth, story system calls, feed/user/business reloads, and account avatar uploads
- Does it belong here long-term:
  - no
- Where it should move:
  - new `core/media/media-upload-runtime-controller.js`
  - or split post/story publish logic into `core/feed/post-upload-runtime-controller.js`
- Main dependencies:
  - `state.upload`
  - `auth`, `fetch`, `BUNNY_EDGE_BASE`, `MEDIA_TICKET_ENDPOINT`
  - `storySystemController`
  - `loadFeedPosts`, `loadBusinessPosts`, `loadUserPosts`
- Extraction risk:
  - medium
  - media worker contract and upload-mode behavior must stay exact
- Prerequisite cleanup:
  - decide whether avatar upload stays with Cluster B or remains shared through a small media helper
- Appropriate batch size:
  - medium

### Cluster H. CEO CRM Ownership / Count Support Runtime
- Lines:
  - `3271-3947`
- Classification:
  - safe to extract soon
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
- Main dependencies:
  - `state.userProfile`, `state.staff`
  - `db`, `collection`, `query`, `where`, `getDocs`, `getDoc`, `setDoc`
  - CRM normalizers and access helpers
- Extraction risk:
  - medium to medium-high
  - count correctness matters and there is no emulator evidence in this repo state
- Prerequisite cleanup:
  - keep the extraction isolated from lead/customer save behavior
  - add a focused smoke checklist for CEO own/staff count updates
- Appropriate batch size:
  - medium or larger-but-safe

### Cluster I. Shell / Auth / Drawer / Notifications DOM Runtime
- Lines:
  - `5233-5667`
  - `7552-7581`
- Classification:
  - safe to extract soon
- What it currently does:
  - auth screen rendering
  - drawer rendering
  - shell DOM patching
  - notification badge DOM updates
  - notification delegation
  - notification list rendering handoff
- Why it is still here:
  - app shell rendering was extracted into a controller, but these higher-level HTML strings and direct DOM patches still sit at the root
- Does it belong here long-term:
  - no
- Where it should move:
  - expand `core/app-shell/app-shell-runtime-controller.js`
  - add `core/app-shell/shell-dom-runtime-controller.js`
  - keep notification list markup under `core/notifications`
- Main dependencies:
  - `state`
  - auth/session helpers
  - shell avatar helpers
  - notification helpers and DOM nodes
- Extraction risk:
  - medium-low
  - mostly UI regression risk, not data-model risk
- Prerequisite cleanup:
  - keep header/drawer DOM update hooks explicit to avoid hidden circular dependencies
- Appropriate batch size:
  - medium

### Cluster J. Thin Wrapper Bridge Layer
- Lines:
  - scattered across `7187-9256`
- Classification:
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
- Main dependencies:
  - almost every extracted controller
- Extraction risk:
  - high value is low if done alone
  - easy to spend a batch moving wrappers without reducing real responsibility
- Prerequisite cleanup:
  - remove the larger business/runtime clusters first
- Appropriate batch size:
  - do not make this a standalone batch

## 5. Best next 5-10 extraction candidates

Batch C is now locally completed. Treat the first untouched candidate below as the next implementation target after review.

| Rank | Candidate | Current cluster(s) | Size | Why it is ranked here | Suggested destination |
| --- | --- | --- | --- | --- | --- |
| 1 | Orders runtime + orders view | F | Medium | Next untouched commerce/runtime surface after Batch C, with isolated listener/write/render behavior and straightforward rollback | `core/orders/orders-runtime-controller.js` + `core/orders/orders-render-utils.js` |
| 2 | Upload/post publishing/media ticket runtime | G | Medium | High real responsibility, isolated around media worker + publish flows | `core/media/media-upload-runtime-controller.js` |
| 3 | Feed/story identity runtime | D | Larger but still safe | Big line reduction opportunity after recent commerce/runtime work settles | `core/stories/story-feed-runtime-controller.js` |
| 4 | Shell/auth/drawer/notifications DOM runtime | I | Medium | Useful size reduction, but lower business-value than the data/runtime slices above | `core/app-shell/shell-dom-runtime-controller.js` |
| 5 | CEO CRM count/support runtime | H | Medium to larger-but-safe | Valuable, but higher business risk and should stay isolated | `core/crm/ceo-crm-count-runtime-controller.js` |
| 6 | Late-stage controller dependency-map consolidation | A | Medium | Good final shrink step for composition-root readability after business logic is gone | `core/app-shell/controller-deps-factory.js` |
| 7 | Wrapper layer collapse | J | Small to medium, but low value if done alone | Useful only late, after real runtime extraction | direct controller wiring / bridge cleanup |

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
  - Do not combine auth/profile resolution, CRM counts, menu publication, and orders in one move.

## 7. Staged roadmap from current state to the target 800-1500-line state

### Stage 0. Current state
- `social-app.js` is now about `7.46k` lines locally after Batch C.
- Startup/auth/public bootstrap plus self-profile/account/avatar, restaurant/lead/auth resolution, and menu/focus/catalog extraction is already real progress, but the file still owns too many business/runtime clusters.

### Stage 1. First meaningful reduction wave
- Target outcome:
  - remove one more isolated commerce/runtime slice
- Expected file state:
  - roughly `6.7k-7.4k` lines
- Good batch choices:
  - Cluster F or G
- Current local status:
  - Cluster C is committed at `HEAD`
  - Cluster E is complete locally and under review

### Stage 2. Commerce + shell reduction wave
- Target outcome:
  - remove menu/focus public catalog runtime
  - remove orders runtime if not already done
  - remove upload/post publishing runtime
  - remove shell/drawer/notification DOM runtime
- Expected file state:
  - roughly `4.8k-6.2k` lines

### Stage 3. Feed/story + CRM support reduction wave
- Target outcome:
  - remove feed/story identity runtime
  - remove CEO CRM count/support runtime
  - collapse the remaining wrapper-heavy bridge surfaces
- Expected file state:
  - roughly `2.2k-3.5k` lines

### Stage 4. Final composition-root cleanup
- Target outcome:
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
  - any batch that changes auth/profile resolution, CEO CRM persistence, menu publication, and orders together
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
- Scope:
  - self-profile normalization
  - live snapshot application
  - account save flow
  - avatar ready/cache/update flow
  - user/business profile load flow
- Why it should be first:
  - high line count
  - real runtime responsibility
  - coherent validation surface
- Why it should stay separate:
  - profile writes/listeners/avatar DOM sync is its own rollback unit
- Size:
  - medium

### Batch B. Restaurant / Lead / Auth Resolution + Role Switch Extraction
- Status:
  - completed in committed checkpoint `8183197`
  - already at `HEAD` / `origin/main`
- Scope:
  - restaurant lookup
  - lead lookup
  - lead-to-restaurant materialization
  - owner restaurant resolution
  - role switch target resolution

### Batch C. Menu / Focus Public Catalog Runtime Extraction
- Status:
  - completed locally in current workspace
  - under review
  - not committed or pushed
- Scope:
  - favorite menu runtime helpers and local-state load flow
  - public/legacy/collection menu load
  - menu image fallback logic
  - public menu publish
  - focus offer load/save/publish
  - focus carousel runtime and focus save/delete integration
- Why it is the best larger-safe slice after A and B:
  - large meaningful reduction
  - commerce/profile domain is cohesive
  - does not require reopening startup plumbing
- Why it should stay separate from orders:
  - menu publication and order writes are different rollback surfaces
- Size:
  - larger but still safe

### Batch D. Orders Runtime + Orders View Extraction
- Scope:
  - order normalization glue
  - order listener lifecycle
  - guest/auth checkout write flow
  - orders tab rendering
- Why it is next:
  - Batch C is already the active local batch
  - orders is the next untouched isolated commerce surface after menu/focus
  - rollback remains cleanly separated from upload/media and CRM
- Size:
  - medium

### Important planning note
- The pre-blueprint "Batch 16 - startup bootstrap entry sequencing reduction" should not be resumed by default.
- If startup entry cleanup happens later, it should be a late-stage composition-root cleanup after the heavier runtime clusters above are gone.
