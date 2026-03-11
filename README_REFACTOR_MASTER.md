# MNYRA Refactor Master

Last updated: 2026-03-11 03:43:03 +01:00

## Current overall status
- Batch 1: Completed (client auth shortcut backdoor removed).
- Batch 2: Completed (media worker action-ticket authz enforced).
- Batch 3: Completed (Firestore rules/index baseline captured into repo).
- Batch 3B: Completed in code, not deployed yet (deny-by-default Firestore rules with explicit path allowlist and ownership checks).
- Superadmin Staff Build-Status Batch: Completed and pushed (runtime metadata endpoint + staff-view status card).
- Startup First-Click Navigation Stability Fix: Completed and pushed (remove stale bootstrap tab override race).
- Manual smoke validation status: passed for guest flow, normal user flow, business owner flow, lead creation, and parts of older lead/staff/CEO flow.

## Architecture risks (current)
- Critical (reduced): global-open Firestore rule removed in source; deployment validation still pending.
- Critical (open): no local Firestore emulator validation possible on this machine yet (`java` missing), so runtime proof is pending staging/emulator run.
- High (open): follower/comment counters still rely on client-driven writes and can be manipulated by repeated valid requests.
- High (open): some legacy docs may lack owner/team metadata; those docs may be non-manageable under strict ownership rules until data is corrected.

## Batch 3B Firestore path audit (code-grounded)

### Public-read paths used by app flows
- `socialFeed/{postId}`
  - Read in startup/feed and post-open flows.
  - Evidence: `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`, `apps/menyra-social/core/chat/chat-runtime-controller.js`.
- `restaurants/{restaurantId}`
  - Read for search/map/profile/bootstrap hydration.
  - Evidence: `apps/menyra-social/social-app.js`, `apps/menyra-social/core/discovery/discovery-runtime-controller.js`.
- `restaurants/{restaurantId}/public/{meta|menu|offers}`
  - Read for public profile/menu/offers.
  - Evidence: `apps/menyra-social/social-app.js`.
- `restaurants/{restaurantId}/socialPosts/{postId}` (+ likes/comments)
  - Read for public business profile feed and modal engagement.
  - Evidence: `apps/menyra-social/social-app.js`, `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`.
- `restaurants/{restaurantId}/stories/{storyId}` and `collectionGroup("stories")`
  - Read for story rails/viewer.
  - Evidence: `apps/menyra-social/social-app.js`, `apps/menyra-social/core/stories/story-viewer-runtime-controller.js`.
- `restaurants/{restaurantId}/menuItems/{itemId}` and `restaurants/{restaurantId}/menuSocial/{itemId}` (+ likes/comments)
  - Read for public menu/shop detail and social interactions.
  - Evidence: `apps/menyra-social/social-app.js`, `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`.

### Auth-only/self paths
- `users/{uid}` profile and user search/listing (signed-in only).
- `users/{uid}/devices`
- `users/{uid}/notifications`
- `users/{uid}/followRequests`
- `users/{uid}/following`
- `users/{uid}/chatThreads/{threadId}` and `messages`
- `users/{uid}/orders`
- `users/{uid}/menuFavorites`
- `users/{uid}/posts/{postId}` (+ likes/comments)
- Evidence: `apps/menyra-social/social-app.js`, `apps/menyra-social/core/chat/chat-runtime-controller.js`, `apps/menyra-social/core/discovery/discovery-runtime-controller.js`, `apps/menyra-social/core/notifications/notification-query-utils.js`.

### Business-owner/team write paths
- `restaurants/{restaurantId}`
- `restaurants/{restaurantId}/public/*`
- `restaurants/{restaurantId}/menuItems/*`
- `restaurants/{restaurantId}/menuSocial/*`
- `restaurants/{restaurantId}/socialPosts/*`
- `restaurants/{restaurantId}/stories/*`
- `restaurants/{restaurantId}/orders/*`
- `restaurants/{restaurantId}/staff/*`
- `socialFeed/{postId}` for business feed writes

### Admin/CRM-sensitive paths
- `leads/{leadId}`
- `superadmins/{uid}`
- `staffAdmins/{uid}`
- `staffIndex/{uid}`
- CEO-managed writes to selected `users/{uid}` documents (crm/team metadata)
- Evidence: `apps/menyra-social/core/crm/crm-runtime-controller.js`, `apps/menyra-social/core/crm/staff-save-utils.js`, `apps/menyra-social/core/leads/*.js`.

## Rules added/hardened in Batch 3B
- Replaced open access with explicit path allowlist and terminal deny (`match /{document=**} { allow read, write: if false; }`).
- Added centralized auth/ownership helpers:
  - signed-in identity helpers
  - CEO scope checks
  - restaurant ownership/team checks
- Added explicit rules for:
  - user profile/subcollections (self + constrained cross-user social/chat actions)
  - restaurant docs/subcollections (public read; owner/team/CEO write)
  - social feed write control based on restaurant ownership
  - CEO/CRM collections (`leads`, `superadmins`, `staffAdmins`, `staffIndex`)
- Added business-staff based authorization (`restaurants/{rid}/staff/{uid}` existence check) for restaurant management decisions.
- Removed dangerous implicit restaurant-manage path tied only to `users/{uid}.restaurantId`.
- Added counter-create allowance for menu social documents so first interaction write can create count docs safely when only counter fields are present.

## Superadmin staff build-status feature batch (small scoped)
- Scope:
  - Superadmin staff UI only (`state.activeTab === "staff"`).
  - No redesign, no flow rewrites, no unrelated module split.
- Added:
  - Runtime metadata endpoint: `GET /api/build-info` (`api/build-info.js`) returning:
    - `commitShort`
    - `commitSha`
    - `buildTimestamp`
    - `branch`
    - `environment`
  - CRM runtime fetch path in `apps/menyra-social/core/crm/crm-runtime-controller.js`:
    - loads build metadata when Superadmin staff view is opened
    - caches result in `state.staff.buildStatus`
    - exposes loading/error state for non-blocking UI
  - Staff UI card in `apps/menyra-social/_shared/crm-lazy-renderers.js`:
    - displays commit, build timestamp, branch, environment
    - shows small loading/error line without blocking settings controls
  - Dependency wiring in `apps/menyra-social/social-app.js`:
    - `BUILD_INFO_ENDPOINT_URL = "/api/build-info"`
    - passed into CRM runtime controller deps
  - Cache-bust version bump in app entry/lazy module URLs so clients pull latest build-status fix assets.

## Startup first-click navigation stability fix batch
- Scope:
  - Startup/auth bootstrap tab handoff only.
- Added:
  - Runtime bootstrap now resolves `activeTab` lazily at execution time instead of using stale snapshot from bootstrap start.
  - Prevents post-refresh first click from being overridden back to feed by delayed startup non-blocking tab ensure.

## What remains uncertain (explicit)
- Emulator validation is blocked locally by missing Java runtime, so syntax/runtime compatibility is not fully proven on this machine.
- Non-root CEO list queries over `superadmins`/`leads` may require precise query predicates in all call-sites; code indicates compatible filters but this must be validated on emulator/staging.
- Legacy restaurant records missing owner/team metadata may become non-editable after hardening.
- Cross-user counter updates are still client-driven and can be inflated by repeated valid calls; this is a known model risk not fully removed in Batch 3B.
- Build timestamp availability depends on deploy/runtime env variables (`VERCEL_GIT_COMMIT_TIMESTAMP` / `VERCEL_DEPLOYMENT_CREATED_AT` / `BUILD_TIMESTAMP_UTC`); if missing, timestamp is surfaced as unknown.

## Must-test checklist before deploy (mandatory)
1. Auth bootstrap
- Signed-in user can read own `users/{uid}` profile.
- Guest cannot read `users/*` data.

2. Public surfaces
- Guest can load feed (`socialFeed`), restaurant cards, stories, menu/public docs.
- Story rail works from `collectionGroup("stories")`.

3. Profile/social actions
- Signed-in user can create user post, like/comment, and read own notifications.
- Follow request send/accept works end-to-end:
  - write target followRequest
  - write target notification
  - write requester following record
  - counter updates on both users

4. Chat
- Chat thread list and messages load for owner.
- Sending message writes sender + recipient thread/message docs.
- Read-state sync does not fail on message patch writes.

5. Business operations
- Owner/team can edit restaurant profile/public meta/menu/offers.
- Owner/team can create/edit/delete social posts and stories.
- Menu social like/comment works on first interaction (doc create path) and subsequent updates.

6. Orders
- Guest checkout can create `restaurants/{rid}/orders` with empty `buyerUid`.
- Auth user checkout writes both restaurant order and `users/{uid}/orders`.
- Business owner/team can list restaurant orders.
- Buyer can read own order document via buyer ownership path.

7. CRM/CEO
- CEO can load leads/customers/staff scopes used by current queries.
- Non-CEO cannot read/write `leads`, `superadmins`, `staffAdmins`, `staffIndex`.

8. Negative tests
- Non-owner cannot edit arbitrary restaurant by setting `users/{uid}.restaurantId`.
- Unauthorized delete/write attempts fail for protected paths.

## Priority queue
- Immediate: Run full emulator/staging Firestore rule validation (still part of Batch 3B completion gate).
- Next (after Batch 3B validation sign-off): Batch 4 startup dedup/perf hardening.

## Forgotten/missing items register (tracked)
- Critical missing item: validated Firestore-rule execution evidence in emulator/staging for this hardened ruleset.
  - Why it matters: source hardening without runtime validation can still break critical app flows or leave hidden gaps.
  - Risk: deploy-time outage/regression risk across auth/feed/chat/CRM paths.
  - Fix timing: now (pre-deploy gate).
  - Blocks 10/10 quality: yes.
- High-value missing item: server-authoritative counter integrity model for follower/like counters.
  - Why it matters: client-driven counter writes can be inflated by repeated valid calls.
  - Risk: metric integrity drift and abuse.
  - Fix timing: soon (after Batch 3B sign-off).
  - Blocks 10/10 quality: yes.
- Medium missing item: ownership/team metadata backfill for legacy restaurant docs.
  - Why it matters: strict ownership rules can reject legitimate writes when legacy records miss owner/team fields.
  - Risk: selective business edit failures after deployment.
  - Fix timing: soon (data audit + backfill script).
  - Blocks 10/10 quality: partially.
- Medium missing item: deterministic build timestamp pipeline for non-Vercel environments.
  - Why it matters: commit and env are runtime-derived, but build timestamp may be unknown if deploy platform does not expose timestamp env vars.
  - Risk: reduced confidence when comparing deployed build age.
  - Fix timing: soon (standardize `BUILD_TIMESTAMP_UTC` injection in deploy workflow).
  - Blocks 10/10 quality: partially.

## Completed fix groups
- Batch 1: Critical Security Lock + Tracking Scaffolding.
- Batch 2: Media Upload/Delete Authorization Hardening.
- Batch 3: Firestore Governance Baseline Capture.
- Batch 3B: Firestore deny-by-default hardening + explicit path/ownership rules.
- Superadmin Staff Build-Status Batch: runtime deploy metadata endpoint + compact staff-view status card.
- Startup First-Click Navigation Stability Fix: stale startup tab snapshot replaced with live tab resolver.

## Pending fix groups
- Batch 3B validation gate execution (emulator/staging and query-path smoke checks).
- Batch 4 to Batch 9 from checkpoint plan (not started in this pass).

## Rollback notes
- Batch 3B rollback unit:
  - `firestore.rules`
  - `README_REFACTOR_MASTER.md`
  - `README_REFACTOR_LOG.md`
  - `README_REFACTOR_NEXT.md`
  - `README_REFACTOR_ROLLBACK.md`
- If rule regressions appear, revert Batch 3B as one unit and re-run previous baseline smoke checks.
- Superadmin staff build-status rollback unit:
  - `api/build-info.js`
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/crm/crm-runtime-controller.js`
  - `apps/menyra-social/_shared/crm-lazy-renderers.js`
  - `README_REFACTOR_MASTER.md`
  - `README_REFACTOR_LOG.md`
  - `README_REFACTOR_NEXT.md`
  - `README_REFACTOR_ROLLBACK.md`
- Startup first-click navigation stability rollback unit:
  - `apps/menyra-social/core/auth/auth-user-bootstrap-utils.js`
  - `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
  - `README_REFACTOR_MASTER.md`
  - `README_REFACTOR_LOG.md`
  - `README_REFACTOR_NEXT.md`
  - `README_REFACTOR_ROLLBACK.md`

## Current recommended next step
- Execute Batch 3B Firestore validation gate in emulator/staging and collect evidence, while verifying deployed Superadmin staff build-status visibility and startup first-click navigation stability on real host(s).
