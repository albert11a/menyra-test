# social-app.js Phase 1 Audit (Aussortieren vor Split)

## Snapshot
- Datei: `apps/menyra-social/social-app.js`
- Zeilen: 20221
- Top-Level Funktionen: 753
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
2. `updateActiveChatThreadPrefs` (Zeile 3199)
3. `savePostMeta` (Zeile 3917)
4. `applyRestaurantMetaUpdate` (Zeile 4431)
5. `resolvePagedScopeCount` (Zeile 4966)
6. `mapRestaurantToCard` (Zeile 6101)
7. `businessIcon` (Zeile 6116)
8. `startFeedListener` (Zeile 9046)
9. `areProfilePostsEquivalent` (Zeile 9198)
10. `startUserPostsListener` (Zeile 9256)
11. `startBusinessPostsListener` (Zeile 9307)
12. `renderProfileGridItem` (Zeile 9533)
13. `loadFollowingFromFirebase` (Zeile 11315)
14. `isLeadInlineSettingsView` (Zeile 13703)
15. `updateRestaurantSelection` (Zeile 17302)
16. `startRestaurantsListener` (Zeile 17634)
17. `loadFeedDelta` (Zeile 17967)
18. `ensureSocialBusinessProfile` (Zeile 18951)
19. `ensureCeoStaffIndexLoaded` (Zeile 19521)
20. `fetchCeoScopedRows` (Zeile 19531)
21. `loadStories` (Zeile 21377)

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

## Legacy-Bloecke (nicht sofort loeschen)
- Chat Legacy-Migration (`rebuildLegacyChatThreadIndexFromStorage`, `loadLegacyChatThreadMessages`)
- Notifications/Following Legacy-Migration (`legacyNotifs`, `legacyFollowing`)
- Legacy Menu-Fallback (`loadLegacyMenuItems`)
- CEO Legacy Ownership Mapping (`HIDDEN_LEGACY_CEO_EMAILS`, `LEGACY_CEO_DELETE_UIDS`)

Diese Bloecke bleiben vorerst drin, bis wir Migrations-Fenster und Datenlage final entscheiden.

## Konkreter Ablauf ab jetzt
1. Batch C: 6-8 Low-Risk Remove-Kandidaten entfernen, Check + Smoke + Commit.
2. Batch D: naechste 6-8 Remove-Kandidaten, Check + Smoke + Commit.
3. Batch E: Rest Remove-Kandidaten, Check + Smoke + Commit.
4. Danach Core-Split starten (`core/state.js`, `core/bootstrap.js`, `core/render.js`).

## Gate pro Batch
1. `node --check apps/menyra-social/social-app.js`
2. Smoke: Safari Reload, Auth-Avatar, Feed, Shop Scroll/Tap.
3. Gruen -> Commit + Push.
