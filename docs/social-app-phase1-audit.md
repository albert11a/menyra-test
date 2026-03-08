# social-app.js Phase 1 Audit (Aussortieren vor Split)

## Snapshot
- Datei: `apps/menyra-social/social-app.js`
- Zeilen: 20357
- Top-Level Funktionen: 760
- Aktueller Status: erster Shared-Storage Split bereits gemacht (`social-storage.js`)

## Strukturkarte (grob)
- App-State und Basiskonstanten: ca. Zeile 1-1400
- Shared Domain-Utilities: ca. 1400-6200
- Map/Leaflet Bereich: ca. 6220-6716 und Renderteile 9547/9588
- Feed/Post/Stories Bereich: ca. 7250-9196 plus Loader 18175-18416
- Profile/Menu/Shop UI Bereich: ca. 9625-14229 plus Menu/Order Loader 18474-19032
- Main Render + Event-Bindings: ab 15340
- Data/Firestore/CRM/Auth-Lader: ab 17656 bis Ende

## Echte Remove-Kandidaten (statische Prüfung)
Kriterium: Funktionsname kommt genau 1x vor (nur Deklaration), keine Referenz in anderen Dateien.

1. `getAlbertCeoGpsOverride` (Zeile 1425)
2. `isThreadMuted` (Zeile 3194)
3. `muteActiveChatFor24Hours` (Zeile 3218)
4. `toggleActiveChatBlocked` (Zeile 3225)
5. `deleteActiveChatThread` (Zeile 3237)
6. `savePostMeta` (Zeile 3976)
7. `applyRestaurantMetaUpdate` (Zeile 4490)
8. `resolvePagedScopeCount` (Zeile 5025)
9. `mapRestaurantToCard` (Zeile 6160)
10. `businessIcon` (Zeile 6175)
11. `startFeedListener` (Zeile 9105)
12. `areProfilePostsEquivalent` (Zeile 9257)
13. `startUserPostsListener` (Zeile 9315)
14. `startBusinessPostsListener` (Zeile 9366)
15. `renderProfilePosts` (Zeile 9592)
16. `openProfileFromBusiness` (Zeile 11082)
17. `loadFollowingFromFirebase` (Zeile 11460)
18. `isLeadInlineSettingsView` (Zeile 13848)
19. `getImageKey` (Zeile 15173)
20. `updateRestaurantSelection` (Zeile 17470)
21. `startRestaurantsListener` (Zeile 17802)
22. `loadFeedDelta` (Zeile 18135)
23. `ensureSocialBusinessProfile` (Zeile 19119)
24. `ensureCeoStaffIndexLoaded` (Zeile 19689)
25. `fetchCeoScopedRows` (Zeile 19699)
26. `loadStories` (Zeile 21545)

## Batch A erledigt
Entfernt (statisch unreferenziert, no-op/legacy-helper):
1. `captureShellAvatarFromDom`
2. `getLiveAvatarFromDom`
3. `resolveSearchUserAvatar`
4. `slugify`
5. `cacheCurrentImages`
6. `syncImageAttributes`
7. `queueImageSwap`
8. `rehydrateImages`

## Legacy-Bloecke (nicht sofort loeschen)
- Chat Legacy-Migration (`rebuildLegacyChatThreadIndexFromStorage`, `loadLegacyChatThreadMessages`)
- Notifications/Following Legacy-Migration (`legacyNotifs`, `legacyFollowing`)
- Legacy Menu-Fallback (`loadLegacyMenuItems`)
- CEO Legacy Ownership Mapping (`HIDDEN_LEGACY_CEO_EMAILS`, `LEGACY_CEO_DELETE_UIDS`)

Diese Bloecke bleiben vorerst drin, bis wir Migrations-Fenster und Datenlage final entscheiden.

## Konkreter Ablauf ab jetzt
1. Batch B: 6-8 Low-Risk Remove-Kandidaten entfernen, Check + Smoke + Commit.
2. Batch C: naechste 6-8 Remove-Kandidaten, Check + Smoke + Commit.
3. Batch D: Rest Remove-Kandidaten, Check + Smoke + Commit.
4. Danach Core-Split starten (`core/state.js`, `core/bootstrap.js`, `core/render.js`).

## Gate pro Batch
1. `node --check apps/menyra-social/social-app.js`
2. Smoke: Safari Reload, Auth-Avatar, Feed, Shop Scroll/Tap.
3. Gruen -> Commit + Push.
