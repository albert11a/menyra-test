# social-app.js Phase 1 Audit (Aussortieren vor Split)

## Snapshot
- Datei: `apps/menyra-social/social-app.js`
- Zeilen: 19463
- Top-Level Funktionen: 725
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

Keine offenen Kandidaten.

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

## Batch D erledigt
Entfernt (statisch unreferenziert):
1. `applyRestaurantMetaUpdate`
2. `formatPagedScopeCount`
3. `startFeedListener`
4. `startFeedFallbackListener`
5. `startStoriesListener`
6. `areProfilePostsEquivalent`
7. `areProfilePostsStructureEquivalent`
8. `patchProfilePostCounts`
9. `startUserPostsListener`
10. `startBusinessPostsListener`
11. `updateRestaurantSelection`
12. `startRestaurantsListener`
13. `loadFeedDelta`
14. `ensureSocialBusinessProfile`
15. `ensureCeoStaffIndexLoaded`
16. `fetchCeoScopedRows`
17. `loadStories`

Hinweis: `buildStoriesSignature` wurde nach Batch D wiederhergestellt, da es weiterhin von `refreshFeedStories` verwendet wird.

## Batch E erledigt
Entfernt (statisch unreferenziert):
1. `reconcileKnownLegacyOwnership`
2. `hasMatchingOwnerMeta`
3. `ceoOwnershipReconcilePromise` (State-Flag)
4. `ceoOwnershipReconciled` (State-Flag)
5. `LEGACY_CEO_DELETE_UIDS` (Konstante)

## Legacy-Bloecke (nicht sofort loeschen)
- Chat Legacy-Migration (`rebuildLegacyChatThreadIndexFromStorage`, `loadLegacyChatThreadMessages`)
- Notifications/Following Legacy-Migration (`legacyNotifs`, `legacyFollowing`)
- Legacy Menu-Fallback (`loadLegacyMenuItems`)
- CEO Legacy Ownership Mapping (`HIDDEN_LEGACY_CEO_EMAILS`)

Diese Bloecke bleiben vorerst drin, bis wir Migrations-Fenster und Datenlage final entscheiden.

## Konkreter Ablauf ab jetzt
1. Phase 1 Aussortieren ist abgeschlossen.
2. Danach Core-Split starten (`core/state.js`, `core/bootstrap.js`, `core/render.js`).

## Phase 2 Start
1. `core/state-factories.js` erstellt.
2. `createEmptyShopCart`, `createEmptyOrdersState`, `createEmptyFavoriteMenuItemsState`, `createEmptyMenuDetailState` aus `social-app.js` ausgelagert.
3. `core/route-auth-utils.js` erstellt.
4. `normalizeInitialTab` und `normalizeAuthMode` aus `social-app.js` ausgelagert.

## Gate pro Batch
1. `node --check apps/menyra-social/social-app.js`
2. Smoke: Safari Reload, Auth-Avatar, Feed, Shop Scroll/Tap.
3. Gruen -> Commit + Push.
