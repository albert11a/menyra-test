# MNYRA Social-App Reduction Master

Last updated: 2026-03-12 03:02:22 +01:00

## 1. Current real checkpoint summary
- Current committed checkpoint:
  - `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
  - Latest committed code batch under that checkpoint: `current HEAD` - `Batch I - Social Engagement Support Runtime Extraction`
- Current branch state:
  - `main` tracking `origin/main`
  - the worktree was clean before this pass
  - there is no active local uncommitted runtime batch after this checkpoint
- Current `apps/menyra-social/social-app.js` size:
  - `5,357` lines
  - `166,188` bytes
- Current reduction direction:
  - startup/auth/public-profile/restaurant-identity/public-bootstrap runtime is already split out in committed history
  - self-profile/account/avatar runtime is committed at `69981fa`
  - restaurant/auth/lead resolution and role-switch runtime is committed at `8183197`
  - menu/focus/catalog/favorites runtime is committed at `edf0cf4`
  - orders runtime and orders view are committed at `b9b54c7`
  - upload/post publishing/media ticket runtime is committed at `ccb962a`
  - feed/story identity plus restaurant-meta/business-location runtime is committed at `ba600be`
  - shell/auth/drawer/notifications DOM runtime is committed at `6a61573`
  - CEO CRM count/support runtime is committed at `844d435`
  - social-engagement support runtime is now committed at `current HEAD` in `core/profile/social-engagement-support-runtime-controller.js`
  - the next untouched meaningful runtime slice is now push / notifications / follow runtime

## 2. Current role of social-app.js
Today `social-app.js` is still carrying all of these roles at once:
- app entry and startup trigger
- app-wide state container and runtime singleton registry
- controller construction and bridge wiring
- residual runtime glue for push/follow and feed/profile support paths
- a wrapper layer around extracted controllers and support modules

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
- post/menu social state mutation and modal refresh logic
- large banks of one-line wrappers whose only job is forwarding into controllers

## 4. Current remaining responsibility clusters inside social-app.js

### Cluster A. Composition Root, State, and Startup Entry
- Status:
  - still in `social-app.js`
  - must stay centralized long-term, but in a much smaller form
- Why it is deferred:
  - this is the real assembly point and startup order still matters
  - moving it too early mostly relocates complexity instead of removing responsibility

### Cluster B. Self Profile / Account / Avatar Runtime
- Status:
  - completed in committed checkpoint `69981fa`

### Cluster C. Restaurant / Lead / Auth Resolution and Role Switching
- Status:
  - completed in committed checkpoint `8183197`

### Cluster D. Feed / Story Identity and Restaurant Meta Runtime
- Status:
  - completed in committed checkpoint `ba600be`

### Cluster E. Menu / Focus / Public Catalog / Favorites Runtime
- Status:
  - completed in committed checkpoint `edf0cf4`

### Cluster F. Orders Runtime and Orders View
- Status:
  - completed in committed checkpoint `b9b54c7`

### Cluster G. Upload / Post Publishing / Media Ticket Runtime
- Status:
  - completed in committed checkpoint `ccb962a`

### Cluster H. CEO CRM Ownership / Count Support Runtime
- Status:
  - completed in committed checkpoint `844d435`

### Cluster I. Social Engagement Support Runtime
- Status:
  - completed in committed checkpoint `current HEAD`
  - extracted into `core/profile/social-engagement-support-runtime-controller.js`
- Outcome:
  - `social-app.js` no longer owns the post/menu social support block inline
  - `social-app.js` no longer owns modal count/comment refresh helpers inline
  - `social-app.js` no longer owns profile-post widen/delete/menu actions inline

### Cluster J. Push / Notifications / Follow Runtime
- Status:
  - still in `social-app.js`
- What it currently does:
  - permission and native-push gating
  - FCM/service-worker/token registration orchestration
  - follow-state persistence and following listener lifecycle
  - notification write helpers used by chat/social engagement flows
- Why it is the next target:
  - it is the next untouched cohesive runtime boundary
  - it removes real side-effect-heavy responsibility instead of assembly noise

### Cluster K. Feed / Profile Content Support Runtime
- Status:
  - still in `social-app.js`
- What it currently does:
  - feed-visibility gating and post normalization
  - user-post loading for public profile/runtime flows
  - feed hero preload support
  - one small private-account persistence path

### Cluster L. Thin Wrapper Bridge Layer
- Status:
  - still in `social-app.js`
  - should wait until the heavier runtime clusters are gone
- Why it is deferred:
  - deleting wrappers alone is low-value churn unless paired with a real runtime extraction

## 5. Best next extraction candidates

Treat the first untouched candidate below as the next implementation target.

| Rank | Candidate | Size | Why it is ranked here | Suggested destination |
| --- | --- | --- | --- | --- |
| 1 | Push / Notifications / Follow Runtime | Medium | Next untouched runtime block with clear side effects, clear smoke-test boundary, and visible remaining weight in `social-app.js` | `core/push` + `core/notifications` runtime controller |
| 2 | Feed / Profile Content Support Runtime | Small to medium | Still real runtime responsibility, but smaller and less central than push/follow | focused `core/feed` / `core/profile` support controller |
| 3 | Late-stage controller dependency-map consolidation | Medium | Valuable later, but lower priority than remaining domain/runtime blocks | `core/app-shell/controller-deps-factory.js` |

## 6. Which clusters are unsafe to extract yet
- Composition-root/controller construction as a standalone batch:
  - too much of the remaining weight there is still real cross-feature wiring
  - moving it now would mostly relocate complexity, not remove it
- Thin wrapper bridge cleanup as a standalone batch:
  - it is low-value churn unless paired with a real runtime extraction
- Mixed cross-domain mega-batch:
  - do not combine push/follow, feed/profile support, and composition-root cleanup in one move

## 7. Staged roadmap from current state to the target 800-1500-line state

### Stage 0. Current state
- `social-app.js` is now about `5.36k` lines after committed Batch I.
- Startup/auth/public bootstrap, self-profile/account/avatar, restaurant/auth resolution, menu/focus/catalog, orders, media upload, feed/story identity, shell DOM, CEO CRM count/support, and social-engagement support runtime are committed at `HEAD`.

### Stage 1. Next meaningful reduction wave
- Target outcome:
  - remove push/follow runtime
  - preserve notification registration and following behavior
- Expected file state:
  - roughly `4.7k-5.0k` lines

### Stage 2. Remaining runtime-domain reduction wave
- Target outcome:
  - remove feed/profile content support runtime
- Expected file state:
  - roughly `4.0k-4.6k` lines

### Stage 3. Final composition-root cleanup
- Target outcome:
  - collapse the remaining dependency-map noise and wrapper-heavy bridge surfaces
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
  - any batch that changes push/follow, feed/profile support, and composition-root wiring together
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

### Batch A-H
- Status:
  - completed in committed checkpoints already recorded above

### Batch I. Social Engagement Support Runtime Extraction
- Status:
  - completed in committed checkpoint `current HEAD`
- Scope:
  - post/menu social state helpers
  - modal refresh helpers
  - comment render/avatar support
  - profile-post action runtime

### Batch J. Push / Notifications / Follow Runtime Extraction
- Scope:
  - permission and native-push gating
  - FCM/service-worker/token registration
  - follow-state persistence and following listener lifecycle
  - notification write helpers

### Batch K. Feed / Profile Content Support Runtime Extraction
- Scope:
  - feed-visibility gating and post normalization
  - user-post loading support
  - feed hero preload support
  - small residual profile-content persistence helpers

### Batch L. Late-Stage Composition Root and Wrapper Cleanup
- Scope:
  - dependency-map consolidation
  - wrapper collapse
