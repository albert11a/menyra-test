# Public Startup Denied List Audit

Status: CURRENT
Generated: 2026-07-01
Branch: `mnyrasocial`

## Scope

This audit maps the denied Firestore `list` observed during the local P0 public
browser rehearsal. It uses only the `mnyra-local` emulators and synthetic seed
data. No Firestore Rules, routes, collections, production data or deploy state
were changed.

## Finding

The denied request was the global Feed story query:

- Firestore target: `collectionGroup("stories")`
- Primary shape: `status == "active"`, ordered by `createdAt desc`, limit 30
- Fallbacks: ordered `stories` collection-group query, then a bare limited
  collection-group query
- Browser error: `false for 'list' @ L952`
- Rules result: the request reached the final deny fallback at
  `firestore.rules:952`

The query is owned by
`apps/menyra-social/core/stories/story-feed-runtime-controller.js` in
`loadStoriesForFeed()`. It was scheduled by
`apps/menyra-social/core/app-shell/session-data-runtime-controller.js` after
`loadRestaurants()` even while the active route was a public profile. The read
therefore came from the legacy Social/Feed startup path, not Public Profile,
Public Menu, Discovery, Auth or Owner runtime ownership.

## Decision And Fix

Global story loading is Feed-owned work and is not required to render
`/:slug`, `/:slug/menu` or QR entry. `scheduleStoriesRefresh()` now returns
unless the active tab is `feed`. Navigating to Feed can still request story
data through the existing Feed path; public startup no longer preloads it.

No Firestore Rule was loosened. The collection-group query itself remains a
separate Feed contract concern and was not redesigned in this narrow P1
unblock.

## Verification

- Unit regression: public-profile restaurant loading does not call the Feed
  story loader.
- Playwright regression: `/pidhimadh` waits through the former idle-read window
  and records no denied Firestore `list` console error.
- Direct browser request capture before the fix identified the exact
  `collectionGroup("stories")` target.
- `npm run build` rebuilt the tracked Social bundle containing the gate.

## Result

The P0 public-startup denied-list blocker is resolved for public profile/menu/QR
startup. Feed collection-group authorization/index behavior remains outside
this public-route fix and must be handled in a dedicated Feed contract task if
Feed story loading is promoted into a launch gate.
