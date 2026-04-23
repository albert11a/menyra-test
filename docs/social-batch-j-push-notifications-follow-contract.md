# Batch J Contract - Push / Notifications / Follow Runtime Extraction

Last updated: 2026-03-22
Status: local Batch J in progress, no commit/push yet

## 1. Verified starting point

- Current root file:
  - `apps/menyra-social/social-app.js`
  - `5,063` lines in the current local worktree on `2026-03-22`
- Current next runtime target remains Batch J:
  - Push / Notifications / Follow runtime extraction
- Current local Batch J progress:
  - follow runtime ownership is extracted locally into `core/follow/follow-runtime-controller.js`
  - notification persistence / write support is extracted locally into `core/notifications/notification-support-runtime-controller.js`
  - push registration runtime is still pending in `social-app.js`
- No commit/push is part of this step.

## 2. Exact Batch J goal

Batch J is successful only if `social-app.js` loses real ownership for the remaining push / notifications / follow runtime.

This batch is not about line-count optics alone.

After Batch J, `social-app.js` must no longer directly own:

- native push activation and permission orchestration
- FCM module/client bootstrap and token sync
- push service worker registration / ready handling
- push activation issue lifecycle state
- following persistence and following listener lifecycle
- notification write helpers used by chat and social engagement flows

`social-app.js` may still keep central app `state`, but it should stop implementing the runtime behavior inline.

## 3. Verified current root ownership

### 3.1 Root-owned runtime state and refs

The following runtime refs are still owned directly by `social-app.js`:

- `pushOpenMessageBound`
- `notificationsUnsub`
- `followingUnsub`
- `pushMessagingClient`
- `firebaseMessagingModulePromise`
- `pushActivationIssue`

The following persisted app state is still mutated from root-owned helpers:

- `state.notifications`
- `state.followingHandles`
- `state.followingTargetIds`
- `state.pendingFollowRequests`

### 3.2 Root-owned constants and storage contracts touched by this batch

- `NOTIFICATIONS_LIVE_LIMIT`
- `PUSH_SEEN_NOTIFICATIONS_LIMIT`
- `PUSH_TOKEN_SYNC_INTERVAL_MS`
- `FCM_WEB_PUSH_VAPID_KEY`
- `PUSH_SW_URL`
- `PUSH_SW_SCOPE`
- `PUSH_SW_READY_TIMEOUT_MS`
- `notificationsKey`
- `followingKey`
- `pushSeenKey`
- `pushTokenMetaKey`
- `pushDeviceIdKey`

### 3.3 Root-owned inline functions in scope for Batch J

Push / notifications runtime:

- `saveNotifications`
- `readPushSeenIds`
- `writePushSeenIds`
- `canUseNativeNotifications`
- `clearPushActivationIssue`
- `setPushActivationIssue`
- `getPushActivationIssueMessage`
- `mapPushActivationError`
- `canEmitNativePushAlerts`
- `ensureNotificationPermission`
- `resolveNativePushActor`
- `resolveNativePushBody`
- `showNativePushAlert`
- `getOrCreatePushDeviceId`
- `readPushTokenMeta`
- `writePushTokenMeta`
- `ensureFirebaseMessagingModule`
- `ensureMessagingClient`
- `ensurePushServiceWorkerRegistration`
- `waitForPushServiceWorkerReady`
- `syncPushDeviceRegistration`
- `disablePushDeviceRegistration`

Follow runtime:

- `saveFollowing`
- `getFollowDocId`
- `applyFollowingHandles`
- `startFollowingListener`

Notification writer runtime:

- `pushUserNotification`
- `pushUserNotificationWithId`

### 3.4 Root-owned startup / lifecycle hooks in scope

- `startLiveListeners`
  - currently calls `startFollowingListener(user)`
  - currently calls `syncNotificationsPushRuntime(...)`
- `stopLiveListeners`
  - currently tears down `notificationsUnsub`
  - currently tears down `followingUnsub`
- auth startup binding:
  - `authSessionStartupCoordinator` receives `bindPushOpenTargetMessageHandler`

## 4. Verified cross-owner dependencies

### 4.1 Dependencies that already consume this runtime from outside

`createBridgeShellBootstrapBundle(...)` currently depends on root-owned push / notifications runtime pieces, including:

- `pushActivationIssue`
- `getPushOpenMessageBound`
- `markPushOpenMessageBound`
- `getNotificationsUnsub`
- `setNotificationsUnsub`
- `saveNotifications`
- `openNotificationTarget`
- `readPushSeenIds`
- `writePushSeenIds`
- `canEmitNativePushAlerts`
- `showNativePushAlert`
- `setPushActivationIssue`
- `clearPushActivationIssue`
- `ensureNotificationPermission`
- `syncPushDeviceRegistration`
- `disablePushDeviceRegistration`
- `getPushActivationIssueMessage`

`createChatRuntimeController(...)` currently depends on root-owned follow / notification writer pieces:

- `applyFollowingHandles`
- `getFollowDocId`
- `saveFollowing`
- `pushUserNotification`
- `pushUserNotificationWithId`

`createSocialEngagementRuntimeController(...)` currently depends on:

- `pushUserNotification`

`createShellDomRuntimeController(...)` currently depends on notification actions that must stay behaviorally identical after the extraction:

- `saveNotifications`
- `markAllNotificationsRead`
- `acceptFollowRequest`
- `openNotificationTarget`

### 4.2 Dependencies that must remain outside Batch J

The following behavior already lives outside root and must not be merged back into Batch J:

- notification listener / query orchestration exposed through `notificationsApi`
- notification route/deeplink open behavior exposed through `deeplinkApi`
- notification rendering in `shell-dom-runtime-controller`
- follow request / accept / mark read / open target / toggle follow business flow inside `chat-runtime-controller`
- notifications/following persisted bootstrap in `session-data-runtime-controller`

## 5. Verified non-scope for Batch J

These items are explicitly out of scope and must not be pulled into Batch J:

- `sendFollowRequest`
- `acceptFollowRequest`
- `markNotificationRead`
- `markAllNotificationsRead`
- `openNotificationTarget`
- `toggleFollow`
- notification list rendering markup
- notification query composition already owned by the bridge layer
- post / feed / profile notification fetch behavior
- feed / profile content loading
- CRM, business accounts, menu, focus, orders, auth, shell DOM, or media upload
- the intentionally deferred hardcoded default password topic

If one of these areas needs changes during Batch J, stop and open a new batch instead of widening scope.

## 6. Target ownership after Batch J

Batch J should end with three focused owners, not one replacement monolith:

### 6.1 `core/push/*`

Owns:

- permission and native push gating
- service worker registration / ready flow
- Firebase messaging module/client lifecycle
- token sync and device registration / disable flow
- push activation issue state handling
- push-open message binding state if it is still needed globally

### 6.2 `core/follow/*`

Owns:

- follow persistence to local storage
- follow doc id helper if still needed as runtime support
- follow state normalization into root state
- following listener lifecycle and teardown

### 6.3 `core/notifications/*`

Owns:

- notification local persistence helper
- notification write helpers used by chat and social engagement flows
- push-seen / token-meta storage helpers wiring that still sits in root

## 7. Ordered execution plan inside Batch J

Batch J stays one rollback unit, but implementation inside the batch should happen in this order:

1. Extract follow runtime first.
   - move `saveFollowing`, `getFollowDocId`, `applyFollowingHandles`, `startFollowingListener`
   - keep behavior identical
   - keep `state.followingHandles`, `state.followingTargetIds`, `state.pendingFollowRequests` in central state

2. Extract notification write / persistence support second.
   - move `saveNotifications`
   - move `pushUserNotification`
   - move `pushUserNotificationWithId`
   - keep shell DOM and chat runtime consumers unchanged except for dependency wiring

3. Extract push registration runtime third.
   - move native push permission / issue handling
   - move service worker + FCM bootstrap
   - move token sync / disable flow
   - move push seen + token meta storage wiring if it still lives in root

4. Rewire bridge and controller consumers.
   - `createBridgeShellBootstrapBundle(...)`
   - `createChatRuntimeController(...)`
   - `createSocialEngagementRuntimeController(...)`
   - `createShellDomRuntimeController(...)` only where dependency wiring changes are required

5. Rewire startup / teardown.
   - `startLiveListeners`
   - `stopLiveListeners`
   - auth startup binding for push-open message handling

6. Delete inline root ownership.
   - remove duplicated inline helpers from `social-app.js`
   - verify the remaining root code only wires controllers together

## 8. Mandatory pre-change analysis checklist

Before editing Batch J runtime code, verify all of the following again:

- every direct call site of the in-scope functions is enumerated
- every mutated `state` field is listed
- every storage key touched by the batch is listed
- every Firestore path touched by the batch is listed
- every runtime ref / unsub / timer involved in the batch is listed
- startup integration points are listed
- teardown integration points are listed
- Heart packs covering follow and notifications are identified

If a new hidden dependency appears, update this contract before continuing.

## 9. Mandatory post-change analysis checklist

Batch J is not complete until all of the following are true:

- `social-app.js` no longer implements push registration logic inline
- `social-app.js` no longer implements following listener / persistence logic inline
- `social-app.js` no longer implements notification write helpers inline
- no duplicate old and new code paths exist at the same time
- `startLiveListeners` and `stopLiveListeners` are symmetrical again
- user-switch / logout still clears follow and notification state correctly
- bridge deeplinks still open notifications, posts, chats, and profiles correctly
- no new giant dependency file was created as a replacement monolith

If inline fallback code must remain temporarily, Batch J is not done yet.

## 10. Verified test gate for Batch J

Minimum required gate before the batch is considered safe:

1. Syntax check for every changed JS file via `node --check`
2. `npm run smoke` in `tests/mnyra-heart-runner`
3. `npm run user-pack` in `tests/mnyra-heart-runner`
4. `npm run business-pack` in `tests/mnyra-heart-runner`

The reason for `user-pack` and `business-pack` being mandatory is verified:

- both packs already exercise follow interactions
- both packs already exercise follow-request acceptance through notifications
- smoke alone is not enough for this batch

## 11. Behavior that must remain unchanged

The following outcomes are hard invariants for Batch J:

- public profile follow buttons still transition to `Following` or `Requested`
- private-account follow requests still create request state instead of direct follow
- notification acceptance flow still works from the notifications tab
- notification badges and notification list updates still happen without requiring full reload
- chat and social engagement flows can still write notifications
- push settings and push activation messaging still behave the same from the user point of view
- auth startup still binds push-open handling
- login, logout, and user switching still produce the same scoped notification / following state restoration

## 12. Do-not-do rules for Batch J

- do not absorb `chat-runtime-controller` follow business logic into this batch
- do not fold everything into `controller-deps-factory.js`
- do not create a single replacement `push-notifications-follow-mega-controller.js`
- do not change selectors, tabs, or URL/deeplink shapes in this batch
- do not touch feed/profile support work here
- do not touch the intentionally deferred password topic here
- do not commit or push this planning step without explicit confirmation
