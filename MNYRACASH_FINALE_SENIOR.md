# MNYRACASH_FINALE_SENIOR.md
Version: 2
Status: Active
Purpose: Senior-level execution plan for stabilizing MNYRA for speed, reliability, and operational safety before broader scale-up.

---

## 0. HOW THIS DOCUMENT MUST BE USED

This document is the active source of truth for stabilization work.

It is not a brainstorming note.  
It is not a feature wishlist.  
It is not a broad refactor invitation.

It is an execution spec.

### Work mode
- Only one numbered step at a time.
- No scope expansion without explicit approval.
- No “while I’m here” improvements.
- No UI redesign unless a step explicitly requires a visible behavior change for error clarity or loading clarity.
- Preserve existing user-facing behavior unless the step explicitly says otherwise.
- Optimize under the hood first.

### Required output after each step
After completing any step, the engineer must provide:
1. What changed
2. Why it fixes the target problem
3. Exact files changed
4. Regression risk
5. Manual tests executed
6. Remaining open risks

### Required validation after each step
- Syntax check for changed JS files
- No unrelated formatting sweep
- No import churn unless required
- No unrelated dead-code cleanup
- No bundle-wide refactor
- No silent changes to Safe Area / Sticky / Modal visual behavior unless explicitly required

---

## 1. PRIMARY GOALS

### Goal A — Speed
The app must feel fast in normal use:
- feed opens fast
- menu opens fast
- product detail opens fast
- no repeated visible flashing
- no unnecessary repeated data fetches
- no slow-feeling clicks

### Goal B — Reliability
A user must be able to click through the app without dead buttons, ambiguous saves, or broken target navigation.

### Goal C — Stability
Flows must survive:
- repeated open/close
- fast switching
- bad network
- weak devices
- refresh
- guest/user/business scope changes

### Goal D — Future changeability
The app must become easier to change later without breaking unrelated areas.
This plan is not only a bug plan. It is a stabilization plan that reduces hidden coupling.

---

## 2. GLOBAL NON-NEGOTIABLES

These rules apply to every step.

### Do not break:
- current Safari/PWA visual layout that is already acceptable
- current modal close/open behavior unless the bug fix explicitly requires a behavior correction
- current menu/product display unless the fix explicitly corrects wrong data or broken state
- existing checkout payload shape unless the step explicitly changes it
- existing Story / Post feature availability unless the step explicitly adds validation
- existing CRM permissions unless the step explicitly hardens scope logic

### Always think about:
- poor network
- low-end Android devices
- repeated tapping
- refresh/re-entry
- guest vs authenticated user
- business context vs personal user context

---

## 3. STEP TEMPLATE (MANDATORY FORMAT)

Every step below is written in a senior-to-senior format.

Each step includes:
- Intent
- Why now
- Scope
- Non-goals
- Current risk
- Execution instructions
- Regression guardrails
- Manual test script
- Done definition

No step may be considered finished without the manual test script being executed.

---

# STEP 1 — REDUCE POST AND MENUDETAIL META READ PRESSURE

## Intent
Reduce unnecessary Firestore work in Post and MenuDetail meta flows without breaking visible behavior.

## Why now
This is currently one of the highest-impact areas for:
- cost
- speed
- UI reactivity
- repeated open/close instability

## Scope
Primary files:
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
Secondary only if strictly needed:
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`

## Non-goals
- no new social features
- no visual redesign
- no large modal rewrite
- no feed layout work
- no chat/order/upload changes

## Current risk
Post and MenuDetail currently mix one-shot reads with listener-based updates.
That creates risk of:
- unnecessary reads on reopen
- repeated meta hydration
- count rework from multiple sources
- slow-feeling detail open on weak devices

## Execution instructions
1. Trace exactly when Post meta loads are triggered.
2. Trace exactly when MenuDetail meta loads are triggered.
3. Separate three cases:
   - first-ever open for a target
   - reopen of the same target
   - open of a different target
4. Prevent repeated first-load behavior for same target when state already holds enough data.
5. Keep listeners only where live updates are actually required.
6. Avoid re-running the same initial meta load for identical active context.
7. Document the resulting source-of-truth behavior:
   - what is initial
   - what is live
   - what is cached in local state

## Regression guardrails
- Post open must not become empty
- MenuDetail must not lose like/comment state
- Counts must not disappear
- existing active-post and active-menu detail behavior must remain correct

## Manual test script
1. Open Post A, close it, open Post A again.
2. Open Post A, then Post B, then Post A again.
3. Open MenuDetail A three times in a row.
4. Open MenuDetail A then B then A rapidly.
5. Throttle network and repeat tests 1–4.
6. Repeat on a lower-end device or CPU-throttled browser session.

## Done definition
Reads are measurably reduced in repeated open/reopen flows, while visible behavior remains correct.

---

# STEP 2 — REMOVE UNNECESSARY LIKES-MODAL / COMMENT-LIST REFETCHING

## Intent
Make Likes modal and comment list behavior rely on existing state where appropriate instead of re-fetching blindly.

## Why now
After Step 1, the next obvious read hotspot is user-triggered likes/comment views.
These are high-frequency click surfaces.

## Scope
Primary file:
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`

## Non-goals
- no new sorting
- no new comments UX
- no new modal design
- no feed redesign

## Current risk
User repeatedly opening likes/comments may cause redundant reads and jittery UI refresh behavior.

## Execution instructions
1. Map which parts of likes/comments data are already present at open time.
2. Distinguish between:
   - enough data to render immediately
   - enough data to render partially then hydrate
   - data that truly requires a fresh fetch
3. Use existing state when safe.
4. Avoid refetching identical likes/comment data for the same target if freshness rules do not require it.
5. Clarify whether comments are one-shot or live for each UI context and enforce that consistently.

## Regression guardrails
- Likes modal must still show correct users/items
- comments must not disappear
- no stale wrong target data may bleed between posts/menu items

## Manual test script
1. Open likes modal twice for the same post.
2. Open likes modal immediately after liking a post.
3. Open comments for a post, close, reopen.
4. Switch between two posts and open likes/comments in both.
5. Repeat under slow network.
6. Repeat with fast repeated taps.

## Done definition
Likes and comment surfaces no longer perform obviously redundant reads and feel more responsive.

---

# STEP 3 — ELIMINATE THE PRIMARY IMAGE FLASH PATH

## Intent
Remove the most visible gray-placeholder flash path.

## Why now
This is one of the highest-visibility quality problems for real visitors.

## Scope
Primary file:
- `apps/menyra-social/_shared/image-resolver.js`
Secondary rendering call sites if required:
- `apps/menyra-social/social-app.js`
- relevant feed/menu/story render helpers

## Non-goals
- no global CSS redesign
- no media pipeline rewrite
- no image quality overhaul

## Current risk
Temporary invalid or missing image values resolve to a visible gray placeholder, causing gray → real image flash.

## Execution instructions
1. Preserve the current fallback mechanism for truly missing or broken images.
2. Detect paths where a previously valid image source is known.
3. Prevent fallback regression to placeholder during transient re-render if the last good source is still valid.
4. Audit render paths that unnecessarily replace a valid `src` with placeholder.
5. Apply the minimal stateful or render-level guard needed to keep the last good image until the new good image exists.

## Regression guardrails
- broken URLs must still fail safely
- missing images must still display a valid fallback
- no persistent stale image where the target image genuinely changed

## Manual test script
1. Rapidly open/close posts with images.
2. Rapidly switch product/gallery images.
3. Open profile, feed, story, and menu images in sequence.
4. Hard refresh and repeat.
5. Repeat under slow network.
6. Repeat on CPU-throttled browser.

## Done definition
Gray placeholder flashing is significantly reduced in normal navigation and fast switching.

---

# STEP 4 — REDUCE UNNECESSARY IMAGE RELOADS CAUSED BY VARIANT CHURN

## Intent
Stop the same visual image from being requested in too many near-identical variants across adjacent contexts.

## Why now
After fixing placeholder fallback, variant churn is the next most visible media issue.

## Scope
Primary file:
- `apps/menyra-social/_shared/image-resolver.js`
Secondary call sites:
- feed, profile, story, menu render paths

## Non-goals
- no “one-size-fits-all” image downgrade
- no global asset architecture rewrite

## Current risk
The same media asset may be loaded as thumb, medium, large, avatar in fast succession, which increases visible reload behavior.

## Execution instructions
1. Define canonical image size usage per context.
2. Identify adjacent contexts where size switching is unnecessary.
3. Reduce context churn where the same visual surface can safely reuse a stable variant.
4. Preserve higher quality only where it matters: modal/detail/hero contexts.
5. Keep avatar-sized contexts lightweight.

## Regression guardrails
- no visible loss of quality in detail/modal views
- no blurry avatars caused by wrong fallback size choice

## Manual test script
1. Feed card → post modal → back.
2. Menu card → detail → back.
3. Story preview → story viewer → back.
4. Profile header → product/menu surfaces.
5. Repeat under slow network.
6. Observe image requests and visible reload behavior.

## Done definition
Adjacent view transitions feel calmer and cause fewer visible image reloads.

---

# STEP 5 — CLOSE REMAINING GLOBAL MODAL / CONTEXT CONFLICTS

## Intent
Eliminate stale global context contamination between modal flows, especially around MenuDetail and card-level interactions.

## Why now
The app already showed real evidence of global modal/context coupling.
This is a correctness and stability issue, not just polish.

## Scope
Primary files:
- `apps/menyra-social/social-app.js`
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
Secondary only if required:
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`

## Non-goals
- no modal redesign
- no feed redesign
- no new interaction model

## Current risk
Shared global modal state and listener lifecycle can allow one context to affect another during fast switching or card interactions.

## Execution instructions
1. Remove any fake modal-context mutation used purely to reuse action logic.
2. Require explicit context input for actions that currently depend on ambient modal state.
3. Ensure cleanup belongs to real active context only.
4. Verify close/open paths do not leave stale flags that affect the next modal.

## Regression guardrails
- menu detail open/close gestures
- post modal behavior
- escape/close handling
- existing comments/likes behavior

## Manual test script
1. Open MenuDetail and like from a separate card surface.
2. Open Post A then B quickly.
3. Open MenuDetail A then B then A quickly.
4. Close and reopen modals repeatedly.
5. Repeat on slow CPU and slow network.
6. Check for wrong draft/reset/state bleed.

## Done definition
No real action depends on forged global modal state, and fast context switching stays correct.

---

# STEP 6 — MAKE COUNTS, LIKES, COMMENTS, AND REPLIES CONSISTENT ACROSS ALL SURFACES

## Intent
A social action must lead to the same state everywhere it appears.

## Why now
After read reduction and modal-state hardening, consistency becomes the next visible trust issue.

## Scope
Primary:
- `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
Secondary:
- relevant feed and overlay update paths in `social-app.js` and bridge bindings

## Non-goals
- no new social features
- no new sorting/ranking behavior

## Current risk
Optimistic state and remote reconciliation can temporarily diverge across feed, modal, and detail surfaces.

## Execution instructions
1. Define one reconciliation strategy for likes/comments/counts.
2. Explicitly state which source is leading immediately after user action.
3. Ensure feed, modal, and detail derive from the same updated state model.
4. Prevent separate local patches from drifting independently.

## Regression guardrails
- instant feedback must remain fast
- likes/comments cannot feel delayed or broken

## Manual test script
1. Like in feed, inspect modal.
2. Like in modal, inspect feed.
3. Comment in modal, inspect feed.
4. Reply, close, reopen.
5. Menu item like/comment vs card counts.
6. Repeat under slow network.

## Done definition
Counts and social states remain aligned across all relevant UI surfaces.

---

# STEP 7 — HARDEN MENU / PRODUCT DETAIL / FAVORITES / CART ENTRY FLOW

## Intent
Ensure restaurant browsing and product interaction remain stable and reactive.

## Why now
This is a core revenue path.
Menu reliability matters more than lower-priority internal modules.

## Scope
Primary:
- `apps/menyra-social/core/menu/menu-public-runtime-controller.js`
Secondary:
- shop/menu-related flows in `social-app.js`
- relevant bridge/shop bindings in `controller-deps-factory.js`

## Non-goals
- no menu redesign
- no commerce feature expansion

## Current risk
Hybrid menu loading and image fallback enrichment can create delay, inconsistency, or wrong-looking product behavior.

## Execution instructions
1. Make menu source priority explicit and deterministic.
2. Reduce unnecessary fallback chaining on repeated visits.
3. Normalize product identity so card/detail/favorites/cart refer to the same object identity model.
4. Ensure favorites and cart operations do not depend on unstable transient menu load state.

## Regression guardrails
- menu must still render when public/collection/legacy conditions vary
- product detail must still open reliably

## Manual test script
1. Open restaurant profile and menu.
2. Open product detail multiple times.
3. Add/remove favorites.
4. Add to cart from multiple products.
5. Switch restaurants.
6. Repeat under slow network and on a weak device.

## Done definition
Menu browsing and product interaction feel stable and consistent in repeated use.

---

# STEP 8 — MAKE CHECKOUT AND ORDER SUBMISSION IDEMPOTENT AND UNAMBIGUOUS

## Intent
Prevent double submission, ambiguous order state, and wrong-context order creation.

## Why now
This is the most business-critical user action.

## Scope
Primary:
- `apps/menyra-social/core/orders/orders-runtime-controller.js`
Secondary:
- checkout/cart integration points in `social-app.js` and shell bridge

## Non-goals
- no payment feature expansion
- no visual redesign except minimal status clarity

## Current risk
Checkout currently appears functionally solid, but double-taps, slow networks, and partial failures are high-risk.

## Execution instructions
1. Enforce one active submit lifecycle per checkout attempt.
2. Prevent repeated submit while pending.
3. Make success/failure/pending states explicit and recoverable.
4. Verify restaurant order write and user order write stay consistent.
5. Validate cart context before write, not after.

## Regression guardrails
- guest checkout must still work
- restaurant/service mode behavior must stay correct

## Manual test script
1. Submit one normal order.
2. Double-click submit.
3. Submit on slow network.
4. Simulate failure then retry.
5. Guest checkout vs logged-in checkout.
6. Different restaurant contexts and service modes.

## Done definition
Order creation is clear, resistant to double submits, and operationally trustworthy.

---

# STEP 9 — HARDEN STORY / FEED POST / MEDIA UPLOAD FLOWS

## Intent
Ensure upload flows are clear, single-run, correctly scoped, and failure-safe.

## Why now
Upload is a dense multi-stage flow and easy to destabilize under real usage.

## Scope
Primary:
- `apps/menyra-social/core/media/media-upload-runtime-controller.js`
- `apps/menyra-social/core/stories/story-system-controller.js`
Secondary if needed:
- `functions/index.js`

## Non-goals
- no new upload feature
- no video-processing redesign

## Current risk
Upload currently combines mode selection, business context, ticketing, upload, document write, and UI refresh in one tight path.

## Execution instructions
1. Define a strict upload state machine.
2. Validate business/story eligibility before upload begins.
3. Prevent any parallel upload trigger in the same UI flow.
4. Make failure recoverable without leaving the screen in a broken state.
5. Align optimistic story/post insertion with final server refresh to prevent visible duplicates or jumps.

## Regression guardrails
- story image/video must still work
- feed post creation must still work
- business post path must remain available

## Manual test script
1. Upload story image.
2. Upload story video.
3. Upload feed image.
4. Upload business post.
5. Double-tap upload.
6. Slow network upload.
7. Upload error then retry.
8. Navigate away and return after upload.

## Done definition
Uploads are reliable, visibly clear, and not vulnerable to repeated taps or context confusion.

---

# STEP 10 — NORMALIZE TARGET PATHS ACROSS FEED, PROFILE, MENU, STORY, NOTIFICATION

## Intent
The same content must resolve to the same logical destination no matter where the user clicked from.

## Why now
Many app surfaces share target resolution and deep-link logic.
This is a major hidden source of user confusion.

## Scope
Primary:
- `apps/menyra-social/core/app-shell/controller-deps-factory.js`
- `apps/menyra-social/core/chat/chat-runtime-controller.js`
- `apps/menyra-social/sw.js`
- `apps/menyra-social/social-app.js`

## Non-goals
- no routing system rewrite
- no big URL schema rewrite

## Current risk
The same post/restaurant/story/profile/chat may be opened through multiple paths that are not fully normalized.

## Execution instructions
1. Define canonical open rules for:
   - post
   - restaurant
   - story
   - chat
   - profile
2. Ensure notification, feed, story, and profile entry points all converge on the same canonical handling.
3. Make already-open target handling explicit.
4. Prevent duplicated modal/open actions for the same target.

## Regression guardrails
- existing working deep links
- push notification target handling
- story viewer behavior

## Manual test script
1. Open a post from feed.
2. Open the same post from notification.
3. Open a restaurant from feed, profile, and menu.
4. Open a story from both preview and deep-link path.
5. Open chat from notification.
6. Re-open already open targets.
7. Refresh with query params.

## Done definition
Target resolution is consistent and predictable across all entry points.

---

# STEP 11 — STABILIZE SEARCH / DISCOVER / SECONDARY CLICK PATHS

## Intent
Make secondary navigable surfaces reliable so the app never feels “half working.”

## Why now
Users do not distinguish between main and secondary paths.
A dead or inconsistent search/discovery path damages trust immediately.

## Scope
Primary:
- search/discovery logic exposed through bridge/shell runtime
- related portions of `social-app.js`
- session/search refresh paths where required

## Non-goals
- no discover redesign
- no map feature expansion

## Current risk
Search/discovery shares state and target resolution with other surfaces and may become unstable under quick tab switching or weak devices.

## Execution instructions
1. Make search result identity and target mapping deterministic.
2. Avoid unnecessary full refreshes on minor search updates.
3. Ensure search results use the same target rules as Step 10.
4. Prevent stale result-click behavior during ongoing state refresh.

## Regression guardrails
- search must still return valid results
- map/discovery helper behavior must remain available

## Manual test script
1. Type in search and open results.
2. Result → profile → back.
3. Result → menu → detail.
4. Fast tab switching during search.
5. Slow network search.
6. Weak device search and repeated input.

## Done definition
Search/discover remains reactive and reliable under normal and degraded conditions.

---

# STEP 12 — HARDEN SESSION, CACHE, RELOAD, AND SCOPE RESTORATION

## Intent
Ensure refresh, login/logout, guest/user/business switching, and re-entry do not leave stale or mixed state.

## Why now
The app carries a large session/cache surface.
This is essential for real-world reliability.

## Scope
Primary:
- `apps/menyra-social/core/app-shell/session-data-runtime-controller.js`
Secondary:
- related app-shell/bridge integration only if needed

## Non-goals
- no major persistence redesign
- no cross-cutting cache architecture rewrite

## Current risk
Many slices of state are restored or reset together, which creates risk of mixed-scope residue and re-entry weirdness.

## Execution instructions
1. Re-verify all scope-specific persisted state:
   - guest
   - user
   - business
   - CEO/staff
2. Make reset behavior deterministic.
3. Ensure reload restores essential state calmly rather than causing chaotic back-to-back refreshes.
4. Keep caches beneficial but not dominant over correctness.

## Regression guardrails
- legitimate persisted cart/profile/session behavior must remain
- login/logout must still function

## Manual test script
1. Reload on feed.
2. Reload on menu.
3. Reload on product/post context.
4. Guest → login.
5. Login → logout → login.
6. Business user session reload.
7. Slow network after reload.

## Done definition
Reload and scope changes no longer produce mixed or stale state behavior.

---

# STEP 13 — TRIM CHAT FOR OPERATIONAL RELIABILITY

## Intent
Make chat dependable under normal usage without expanding its feature surface.

## Why now
Chat is complex and can become a hidden instability source, but it is not the first growth bottleneck.
This step aims for dependable behavior, not feature ambition.

## Scope
Primary:
- `apps/menyra-social/core/chat/chat-runtime-controller.js`
- `apps/menyra-social/core/chat/chat-runtime-cluster.js`
Secondary:
- overlay/bridge integration if needed

## Non-goals
- no new chat feature
- no major storage model rewrite

## Current risk
Thread opening, message listeners, read state, archive/delete, and attachment flows can collide in timing-sensitive ways.

## Execution instructions
1. Make active-thread listener lifecycle explicit and context-bound.
2. Simplify thread open/close assumptions.
3. Ensure send/attachment/archive/delete are all single-path actions with clear pending states.
4. Avoid background stale updates touching inactive thread UI.

## Regression guardrails
- existing message history
- read state behavior
- normal send flow

## Manual test script
1. Open thread, send message, close, reopen.
2. Switch threads quickly.
3. Send under slow network.
4. Add and remove attachments.
5. Archive and reopen thread.
6. Notification → chat open.

## Done definition
Chat behaves predictably and does not leave stale active-thread state behind.

---

# STEP 14 — HARDEN CRM / ROLES / SCOPES / DESTRUCTIVE ACTIONS

## Intent
Ensure internal business flows do not expose the wrong data or allow the wrong action in the wrong scope.

## Why now
This is less urgent for public visitors but critical for operational trust.

## Scope
Primary:
- `apps/menyra-social/core/crm/crm-runtime-controller.js`
- `apps/menyra-social/core/crm/crm-runtime-cluster.js`

## Non-goals
- no CRM feature expansion
- no role-system redesign

## Current risk
CRM combines scope rules, ownership, create/edit/delete/convert flows, and restaurant-linked effects in one powerful area.

## Execution instructions
1. Re-verify scope rules for CEO/staff/customer/lead visibility.
2. Review destructive flows:
   - delete lead
   - convert lead to customer
   - create/edit/delete staff
3. Ensure destructive actions cannot silently affect unrelated business data.
4. Make save/delete states explicit and repeat-safe.

## Regression guardrails
- legitimate CRM records must remain accessible
- existing ownership rules must not be accidentally broadened

## Manual test script
1. CEO loads leads/customers/staff.
2. Change scopes and verify visibility.
3. Create lead.
4. Convert lead to customer.
5. Create/edit/delete staff.
6. Repeat under slow network.
7. Repeat with double-click pressure on save/delete.

## Done definition
CRM behavior is safe, scoped, and operationally trustworthy.

---

# STEP 15 — RUN POOR NETWORK AND LOW-END DEVICE HARDENING PASSES

## Intent
Verify that critical flows remain understandable and usable under degraded conditions.

## Why now
This is mandatory for real-world reliability and must not be deferred.

## Scope
All critical user-facing flows from Steps 1–14.

## Non-goals
- no synthetic benchmark obsession
- no premature micro-optimizations with no user-facing benefit

## Current risk
Weak devices and bad networks amplify every timing, rendering, and state-management weakness.

## Execution instructions
For every critical flow, verify:
- click gives immediate feedback
- pending state is visible
- user understands whether to wait or retry
- double execution is prevented
- failure path is recoverable
- final state is correct after retry or refresh

## Manual test script
Run each critical path under:
1. normal network
2. slow network
3. interrupted network
4. CPU throttling
5. rapid repeated tap behavior
6. refresh/re-entry where relevant

## Done definition
No critical flow feels dead, stuck, or ambiguous under degraded conditions.

---

# STEP 16 — COMPLETE THE FINAL LAUNCH TEST MATRIX

## Intent
Turn all previous steps into a real sign-off process.

## Why now
Without a real matrix, “it seems better” is not enough.

## Scope
All public and internal critical flows.

## Required test roles
- guest
- normal user
- business/restaurant
- CEO
- staff

## Required surfaces
- feed
- stories
- post modal
- menu
- product detail
- favorites
- cart
- checkout
- upload/post/story
- profile/follow
- notifications
- search/discover
- chat
- CRM

## Execution instructions
Build and complete a matrix with:
- Test ID
- Role
- Device/browser
- Network condition
- Preconditions
- Click path
- Expected result
- Actual result
- Pass/fail
- Notes

## Done definition
All business-critical and click-critical flows are green in real manual testing.

---

# 4. OPTIONAL POST-LAUNCH STEP (NOT REQUIRED BEFORE INITIAL STABILIZATION)

## STEP 17 — PRODUCTION HARDENING FOR SCALE

This is not required before initial stabilization, but it becomes required before making strong claims about very large scale.

### Intent
Add proof-oriented production hardening for real growth.

### Includes
- error tracking
- structured logging
- Firestore usage monitoring
- function latency monitoring
- media/upload monitoring
- load and concurrency testing
- peak-traffic simulation
- cost watchpoints
- retry/timeout metrics

### Hard truth
Without Step 17, no one can honestly claim that MNYRA is proven stable for extremely large traffic numbers.

---

# 5. FINAL WORKING RULE

This plan should be executed as:
- Step 1
- test
- Step 2
- test
- Step 3
- test
- ...

No skipped testing.  
No batching unrelated steps together.  
No new features before stability work is completed.

This document is intended to be detailed enough that a senior engineer can take one step at a time and execute it safely.

---

## 6. EXECUTION STATUS

### Schritt 1
- Status: DONE
- Umsetzung: Meta-Read-Druck für Post/MenuDetail reduziert; Initial-Ladevorgänge vs. Reopen sauberer getrennt.
- Betroffene Dateien:
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- Manuell geprüft: Post A/B Reopen-Sequenzen, MenuDetail A/B Reopen-Sequenzen, schnelle Wechsel unter langsamem Netz.

### Schritt 2
- Status: DONE
- Umsetzung: Unnötige Likes-/Comment-Refetches reduziert; vorhandener State wird gezielter genutzt.
- Betroffene Dateien:
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- Manuell geprüft: Likes-Modal mehrfach öffnen, Kommentarlisten reopen, Target-Wechsel A/B inkl. langsamem Netz.

### Schritt 3
- Status: DONE
- Umsetzung: Primärer Bild-Flash-Pfad reduziert; transienter Placeholder-Rückfall bei bekannten gültigen Quellen entschärft.
- Betroffene Dateien:
  - `apps/menyra-social/_shared/image-resolver.js`
  - `apps/menyra-social/core/feed/feed-view-orchestration-controller.js`
  - `apps/menyra-social/core/overlays/overlay-basic-render-utils.js`
  - `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
- Manuell geprüft: Feed -> Post -> zurück, Profil-/Story-/Menü-Bildpfade, Wiederholungen unter langsamem Netz.

### Schritt 4
- Status: DONE
- Umsetzung: Sekundäre Bild-Neuladevorgänge/Variant-Churn im Menü-/Profil-Kontext stabilisiert; Rückwechselpfad nach MenuDetail-Close beruhigt.
- Betroffene Dateien:
  - `apps/menyra-social/_shared/image-resolver.js`
  - `apps/menyra-social/core/menu/menu-modal-render-utils.js`
  - `apps/menyra-social/core/profile/profile-menu-focus-render-controller.js`
  - `apps/menyra-social/core/overlays/overlay-orchestration-controller.js`
- Manuell geprüft: Menükarte -> Detail -> zurück (mehrfach), A/B Produktwechsel, Kontrolltests Feed/Post.

### Schritt 5
- Status: DONE
- Umsetzung: Verbleibende globale Modal-/Context-Konflikte reduziert; Card-Aktionen von implizitem Global-State auf expliziten Zielkontext umgestellt.
- Betroffene Dateien:
  - `apps/menyra-social/social-app.js`
  - `apps/menyra-social/core/profile/social-engagement-runtime-controller.js`
- Manuell geprüft: schnelle Target-Wechsel A -> B -> A, Card-Likes während Kontextwechsel, Open/Close-Serien inkl. Likes-Modal-Wechsel.

### Open observations for later planned steps
- Im Menü wirkt es gelegentlich so, als würden Kartenbilder kurz ohne Nutzeraktion neu gerendert / leicht grau erscheinen.
- Diese Beobachtung ist kein neuer Schritt.
- Sie bleibt für spätere Prüfung in Schritt 7 und/oder Schritt 12 vorgemerkt.
