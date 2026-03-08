# social-app.js Phase 1 Audit (Aussortieren vor Split)

## Snapshot
- Datei: `apps/menyra-social/social-app.js`
- Zeilen: 19971
- Top-Level Funktionen: 744
- Aktueller Status: erster Shared-Storage Split bereits gemacht (`social-storage.js`)

## Strukturkarte (grob)
- App-State und Basiskonstanten: ca. Zeile 1-1400
- Shared Domain-Utilities: ca. 1400-6200
- Map/Leaflet Bereich: ca. 6220-6716 und Renderteile 9547/9588
- Feed/Post/Stories Bereich: ca. 7250-9196 plus Loader 18175-18416
- Profile/Menu/Shop UI Bereich: ca. 9625-14229 plus Menu/Order Loader 18474-19032
- Main Render + Event-Bindings: ab 15340
- Data/Firestore/CRM/Auth-Lader: ab 17656 bis Ende

## Echte Remove-Kandidaten (statische Pruefung)
Kriterium: Funktionsname kommt genau 1x vor (nur Deklaration), keine Referenz in anderen Dateien.

1. `applyRestaurantMetaUpdate` (Zeile 4407)
2. `formatPagedScopeCount` (Zeile 4937)
3. `startFeedListener` (Zeile 8991)
4. `areProfilePostsEquivalent` (Zeile 9143)
5. `startUserPostsListener` (Zeile 9201)
6. `startBusinessPostsListener` (Zeile 9252)
7. `updateRestaurantSelection` (Zeile 17196)
8. `startRestaurantsListener` (Zeile 17528)
9. `loadFeedDelta` (Zeile 17861)
10. `ensureSocialBusinessProfile` (Zeile 18845)
11. `ensureCeoStaffIndexLoaded` (Zeile 19415)
12. `fetchCeoScopedRows` (Zeile 19425)
13. `loadStories` (Zeile 21271)

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

## Batch B erledigt
Entfernt (statisch unreferenziert):
1. `isThreadMuted`
2. `muteActiveChatFor24Hours`
3. `toggleActiveChatBlocked`
4. `deleteActiveChatThread`
5. `renderProfilePosts`
6. `openProfileFromBusiness`
7. `getImageKey`

## Batch C erledigt
Entfernt (statisch unreferenziert):
1. `getAlbertCeoGpsOverride`
2. `updateActiveChatThreadPrefs`
3. `savePostMeta`
4. `resolvePagedScopeCount`
5. `mapRestaurantToCard`
6. `businessIcon`
7. `renderProfileGridItem`
8. `loadFollowingFromFirebase`
9. `isLeadInlineSettingsView`

## Legacy-Bloecke (nicht sofort loeschen)
- Chat Legacy-Migration (`rebuildLegacyChatThreadIndexFromStorage`, `loadLegacyChatThreadMessages`)
- Notifications/Following Legacy-Migration (`legacyNotifs`, `legacyFollowing`)
- Legacy Menu-Fallback (`loadLegacyMenuItems`)
- CEO Legacy Ownership Mapping (`HIDDEN_LEGACY_CEO_EMAILS`, `LEGACY_CEO_DELETE_UIDS`)

Diese Bloecke bleiben vorerst drin, bis wir Migrations-Fenster und Datenlage final entscheiden.

## Konkreter Ablauf ab jetzt
1. Batch D: 6-8 Low-Risk Remove-Kandidaten entfernen, Check + Smoke + Commit.
2. Batch E: naechste 6-8 Remove-Kandidaten, Check + Smoke + Commit.
3. Batch F: Rest Remove-Kandidaten, Check + Smoke + Commit.
4. Danach Core-Split starten (`core/state.js`, `core/bootstrap.js`, `core/render.js`).

## Gate pro Batch
1. `node --check apps/menyra-social/social-app.js`
2. Smoke: Safari Reload, Auth-Avatar, Feed, Shop Scroll/Tap.
3. Gruen -> Commit + Push.
