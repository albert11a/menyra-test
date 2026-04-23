import { createPublicProfileRuntimeController } from "../profile/public-profile-runtime-controller.js";
import { createSelfProfileRuntimeController } from "../profile/self-profile-runtime-controller.js";
import { createRestaurantIdentityRuntimeController } from "../common/restaurant-identity-runtime-controller.js";
import { createStoryFeedRuntimeController } from "../stories/story-feed-runtime-controller.js";
import { createAuthProfileResolutionRuntimeController } from "../auth/auth-profile-resolution-runtime.js";
import { loadAuthProfileCore } from "../auth/tab-auth-load-utils.js";
import {
  loadLogoCacheCore,
  scheduleLogoCacheWriteCore,
  loadAvatarCacheCore,
  scheduleAvatarCacheWriteCore,
  resolveRestaurantLogoCore,
  resolveUserAvatarCore,
  resolveShellAvatarUrlCore
} from "../media/avatar-logo-cache.js";

export function createProfileIdentityRuntimeCluster({
  state = null,
  firebaseApi = {},
  browserApi = {},
  storageApi = {},
  constants = {},
  renderApi = {},
  profileApi = {},
  storyApi = {}
} = {}) {
  const renderFn = typeof renderApi.renderFn === "function" ? renderApi.renderFn : (() => {});
  const updateShellDomFn = typeof renderApi.updateShellDomFn === "function" ? renderApi.updateShellDomFn : (() => {});
  const updateFeedDomFn = typeof renderApi.updateFeedDomFn === "function" ? renderApi.updateFeedDomFn : (() => false);
  const refreshSearchViewFn = typeof renderApi.refreshSearchViewFn === "function" ? renderApi.refreshSearchViewFn : (() => false);
  const getLastRenderModeFn = typeof renderApi.getLastRenderModeFn === "function" ? renderApi.getLastRenderModeFn : (() => "");
  const buildRestaurantLocationsFn = typeof renderApi.buildRestaurantLocationsFn === "function" ? renderApi.buildRestaurantLocationsFn : (() => []);
  const getStorySystemController = typeof storyApi.getStorySystemController === "function" ? storyApi.getStorySystemController : (() => null);
  const saveSettingsFn = typeof profileApi.saveSettingsFn === "function" ? profileApi.saveSettingsFn : (() => {});

  let selfProfileRuntimeController = null;
  let restaurantIdentityRuntimeController = null;
  let storyFeedRuntimeController = null;
  let authProfileResolutionRuntimeController = null;

  function syncPrivateSettingFromProfile(value) {
    const nextValue = !!value;
    if ((state?.settings?.privateAccount || false) === nextValue) return;
    state.settings = { ...(state?.settings || {}), privateAccount: nextValue };
    saveSettingsFn(state.settings);
  }

  async function persistPrivateAccountSetting(value) {
    if (!state?.user?.uid || !firebaseApi.db || typeof firebaseApi.setDocFn !== "function" || typeof firebaseApi.docFn !== "function") return;
    try {
      await firebaseApi.setDocFn(firebaseApi.docFn(firebaseApi.db, "users", state.user.uid), {
        privateAccount: !!value,
        updatedAt: typeof firebaseApi.serverTimestampFn === "function" ? firebaseApi.serverTimestampFn() : null
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  }

  const publicProfileRuntimeController = createPublicProfileRuntimeController({
    state,
    db: firebaseApi.db || null,
    docFn: firebaseApi.docFn || null,
    collectionFn: firebaseApi.collectionFn || null,
    queryFn: firebaseApi.queryFn || null,
    whereFn: firebaseApi.whereFn || null,
    orderByFn: firebaseApi.orderByFn || null,
    limitFn: firebaseApi.limitFn || null,
    getDocFn: firebaseApi.getDocFn || null,
    getDocsFn: firebaseApi.getDocsFn || null,
    onSnapshotFn: firebaseApi.onSnapshotFn || null,
    render: renderFn,
    brandUi: constants.brandUi || null,
    fastLimits: constants.fastLimits || {},
    resolvePreferredHandle: profileApi.resolvePreferredHandleFn || (() => ""),
    pickCountValue: profileApi.pickCountValueFn || (() => 0),
    normalizeRestaurantType: profileApi.normalizeRestaurantTypeFn || ((value) => value),
    normalizeHandle: profileApi.normalizeHandleFn || ((value = "") => String(value || "").trim().toLowerCase()),
    sanitizeDisplayName: profileApi.sanitizeDisplayNameFn || ((value = "", fallback = "") => String(value || fallback || "").trim()),
    isPublicBusinessRecord: profileApi.isPublicBusinessRecordFn || (() => true)
  });

  restaurantIdentityRuntimeController = createRestaurantIdentityRuntimeController({
    state,
    db: firebaseApi.db || null,
    docFn: firebaseApi.docFn || null,
    getDocFn: firebaseApi.getDocFn || null,
    normalizeRestaurantType: profileApi.normalizeRestaurantTypeFn || ((value) => value),
    isGenericStoryBusinessLabel: (...args) => storyFeedRuntimeController?.isGenericStoryBusinessLabel?.(...args) || false,
    queueMicrotaskFn: browserApi.queueMicrotaskFn || null,
    buildRestaurantLocationsFn: (...args) => buildRestaurantLocationsFn(...args),
    resolveRestaurantLogoFn: (...args) => selfProfileRuntimeController?.resolveRestaurantLogo?.(...args) || String(args?.[1] || ""),
    isPublicBusinessRecordFn: profileApi.isPublicBusinessRecordFn || (() => true),
    syncFeedPostLogos: (...args) => storyFeedRuntimeController?.syncFeedPostLogos?.(...args) || false,
    refreshFeedStories: (...args) => storyFeedRuntimeController?.refreshFeedStories?.(...args) || false,
    render: renderFn,
    updateFeedDom: (...args) => updateFeedDomFn(...args),
    getLastRenderMode: () => getLastRenderModeFn()
  });

  authProfileResolutionRuntimeController = createAuthProfileResolutionRuntimeController({
    state,
    db: firebaseApi.db || null,
    collectionFn: firebaseApi.collectionFn || null,
    queryFn: firebaseApi.queryFn || null,
    whereFn: firebaseApi.whereFn || null,
    limitFn: firebaseApi.limitFn || null,
    docFn: firebaseApi.docFn || null,
    getDocFn: firebaseApi.getDocFn || null,
    getDocsFn: firebaseApi.getDocsFn || null,
    setDocFn: firebaseApi.setDocFn || null,
    serverTimestampFn: firebaseApi.serverTimestampFn || null,
    mergeRestaurants: (...args) => restaurantIdentityRuntimeController?.mergeRestaurants?.(...args) || (Array.isArray(args?.[0]) ? args[0] : []),
    matchesRestaurantIdentity: profileApi.matchesRestaurantIdentityFn || (() => false),
    normalizeEmailValue: profileApi.normalizeEmailValueFn || ((value = "") => String(value || "").trim().toLowerCase()),
    normalizeRoleList: profileApi.normalizeRoleListFn || (() => []),
    normalizeLeadLocations: profileApi.normalizeLeadLocationsFn || ((value = []) => (Array.isArray(value) ? value : [])),
    getPrimaryLeadLocation: profileApi.getPrimaryLeadLocationFn || (() => ({})),
    hasLeadLocationCoords: profileApi.hasLeadLocationCoordsFn || (() => false),
    resolveCustomerType: profileApi.resolveCustomerTypeFn || ((value = "") => String(value || "").trim()),
    resolveRestaurantStatusFromLead: profileApi.resolveRestaurantStatusFromLeadFn || ((leadStatus = "", currentStatus = "") => String(leadStatus || currentStatus || "").trim()),
    ensureRestaurantPublicMeta: profileApi.ensureRestaurantPublicMetaFn || (async () => {}),
    isRestaurantMarkedDeleted: profileApi.isRestaurantMarkedDeletedFn || (() => false),
    roleSwitchOrder: constants.roleSwitchOrder || [],
    render: renderFn,
    updateShellDom: (...args) => updateShellDomFn(...args),
    updateFeedDom: (...args) => updateFeedDomFn(...args),
    refreshSearchView: (...args) => refreshSearchViewFn(...args),
    getLastRenderMode: () => getLastRenderModeFn()
  });

  selfProfileRuntimeController = createSelfProfileRuntimeController({
    state,
    db: firebaseApi.db || null,
    documentObj: browserApi.documentObj || null,
    windowObj: browserApi.windowObj || null,
    safeStorage: storageApi.safeStorageObj || null,
    logoCacheKey: storageApi.logoCacheKey || "",
    avatarKey: storageApi.avatarKey || "",
    commentAvatarRemoteFetchEnabled: !!constants.commentAvatarRemoteFetchEnabled,
    placeholderImage: constants.placeholderImage || "",
    getOptimizedImageUrl: profileApi.getOptimizedImageUrlFn || ((value) => String(value || "").trim()),
    isPlaceholderUrl: profileApi.isPlaceholderUrlFn || (() => false),
    loadLogoCacheCoreFn: loadLogoCacheCore,
    scheduleLogoCacheWriteCoreFn: scheduleLogoCacheWriteCore,
    loadAvatarCacheCoreFn: loadAvatarCacheCore,
    scheduleAvatarCacheWriteCoreFn: scheduleAvatarCacheWriteCore,
    resolveRestaurantLogoCoreFn: resolveRestaurantLogoCore,
    resolveUserAvatarCoreFn: resolveUserAvatarCore,
    resolveShellAvatarUrlCoreFn: resolveShellAvatarUrlCore,
    collectionFn: firebaseApi.collectionFn || null,
    queryFn: firebaseApi.queryFn || null,
    whereFn: firebaseApi.whereFn || null,
    limitFn: firebaseApi.limitFn || null,
    docFn: firebaseApi.docFn || null,
    getDocFn: firebaseApi.getDocFn || null,
    getDocFromServerFn: firebaseApi.getDocFromServerFn || null,
    getDocsFn: firebaseApi.getDocsFn || null,
    onSnapshotFn: firebaseApi.onSnapshotFn || null,
    setDocFn: firebaseApi.setDocFn || null,
    serverTimestampFn: firebaseApi.serverTimestampFn || null,
    updateProfileFn: firebaseApi.updateProfileFn || null,
    uploadCompressedImageFn: profileApi.uploadCompressedImageFn || (async () => ({})),
    ensureUserProfileFn: profileApi.ensureUserProfileFn || (async () => ({})),
    ensurePostMetaFn: profileApi.ensurePostMetaFn || (() => ({ comments: [] })),
    resolveUserByHandleFn: profileApi.resolveUserByHandleFn || (async () => null),
    ensureRestaurantPublicMetaFn: profileApi.ensureRestaurantPublicMetaFn || (async () => {}),
    syncCeoDirectoryProfilePatchFn: profileApi.syncCeoDirectoryProfilePatchFn || (async () => {}),
    resolveRestaurantForAuthUserFn: (...args) => authProfileResolutionRuntimeController?.resolveRestaurantForAuthUser?.(...args) || null,
    saveUserProfileToStorage: profileApi.saveUserProfileToStorageFn || (() => {}),
    writeAuthBootstrapSnapshot: profileApi.writeAuthBootstrapSnapshotFn || (() => {}),
    syncPrivateSettingFromProfile,
    mergeRestaurants: (...args) => restaurantIdentityRuntimeController?.mergeRestaurants?.(...args) || (Array.isArray(args?.[0]) ? args[0] : []),
    rebuildBusinessLocations: (...args) => restaurantIdentityRuntimeController?.rebuildBusinessLocations?.(...args),
    render: renderFn,
    updateShellDom: (...args) => updateShellDomFn(...args),
    updateFeedDom: (...args) => updateFeedDomFn(...args),
    refreshSearchView: (...args) => refreshSearchViewFn(...args),
    getLastRenderMode: () => getLastRenderModeFn(),
    normalizeHandle: profileApi.normalizeHandleFn || ((value = "") => String(value || "").trim().toLowerCase()),
    normalizeRoleList: profileApi.normalizeRoleListFn || (() => []),
    resolvePreferredHandle: profileApi.resolvePreferredHandleFn || (() => ""),
    normalizeRestaurantType: profileApi.normalizeRestaurantTypeFn || ((value = "") => String(value || "").trim()),
    normalizeLeadSettings: profileApi.normalizeLeadSettingsFn || ((value = null) => value),
    normalizeCeoCountry: profileApi.normalizeCeoCountryFn || ((value = "") => String(value || "").trim()),
    normalizeCeoPath: profileApi.normalizeCeoPathFn || ((value = []) => (Array.isArray(value) ? value : [])),
    hasStoredCeoCrmCounts: profileApi.hasStoredCeoCrmCountsFn || (() => false),
    sanitizeCeoCrmCounts: profileApi.sanitizeCeoCrmCountsFn || ((value = null) => value),
    pickCountValue: profileApi.pickCountValueFn || (() => 0),
    sanitizeDisplayName: profileApi.sanitizeDisplayNameFn || ((value = "", fallback = "") => String(value || fallback || "").trim()),
    isLocalBusinessProfile: profileApi.isLocalBusinessProfileFn || (() => false),
    isCeoUser: profileApi.isCeoUserFn || (() => false),
    getVerifiedMapLocation: profileApi.getVerifiedMapLocationFn || (() => null),
    getCeoGpsOverride: profileApi.getCeoGpsOverrideFn || (() => null),
    isRestaurantMarkedDeleted: profileApi.isRestaurantMarkedDeletedFn || (() => false)
  });

  storyFeedRuntimeController = createStoryFeedRuntimeController({
    state,
    db: firebaseApi.db || null,
    readCacheFn: storageApi.readCacheFn || (() => null),
    writeCacheFn: storageApi.writeCacheFn || (() => {}),
    cacheKeys: storageApi.cacheKeys || {},
    cacheTtlMs: storageApi.cacheTtlMs || {},
    fastMode: !!constants.fastMode,
    allowFeedDerivedStoryFallback: false,
    fastLimits: constants.fastLimits || {},
    collectionGroupFn: firebaseApi.collectionGroupFn || null,
    getDocsFn: firebaseApi.getDocsFn || null,
    queryFn: firebaseApi.queryFn || null,
    whereFn: firebaseApi.whereFn || null,
    orderByFn: firebaseApi.orderByFn || null,
    limitFn: firebaseApi.limitFn || null,
    mapStorySnapshotRowsToFeedStoriesFn: (...args) => getStorySystemController()?.mapStorySnapshotRowsToFeedStories?.(...args) || [],
    canShowFeedRestaurantIdFn: profileApi.canShowFeedRestaurantIdFn || (() => true),
    queueStoryIdentityHydrationFn: (...args) => restaurantIdentityRuntimeController?.queueStoryIdentityHydration?.(...args),
    queueMicrotaskFn: browserApi.queueMicrotaskFn || null,
    updateFeedDomFn: (...args) => updateFeedDomFn(...args),
    renderFn: renderFn,
    getLastRenderModeFn: () => getLastRenderModeFn(),
    resolveRestaurantLogoFn: (...args) => selfProfileRuntimeController?.resolveRestaurantLogo?.(...args) || String(args?.[1] || ""),
    isPlaceholderUrlFn: profileApi.isPlaceholderUrlFn || (() => false),
    escapeSelectorFn: profileApi.escapeSelectorFn || ((value) => String(value || "")),
    documentObj: browserApi.documentObj || null,
    toDateSafeFn: profileApi.toDateSafeFn || ((value) => value)
  });

  async function loadAuthProfile(user, { force = false } = {}) {
    return loadAuthProfileCore({
      user,
      force,
      state,
      normalizeRoleList: profileApi.normalizeRoleListFn || (() => []),
      isRestaurantMarkedDeleted: profileApi.isRestaurantMarkedDeletedFn || (() => false),
      resolveRestaurantForAuthUser: (...args) => authProfileResolutionRuntimeController?.resolveRestaurantForAuthUser?.(...args),
      resolveLeadByUid: (...args) => authProfileResolutionRuntimeController?.resolveLeadByUid?.(...args),
      findRestaurantByLeadId: (...args) => authProfileResolutionRuntimeController?.findRestaurantByLeadId?.(...args),
      ensureRestaurantForLead: (...args) => authProfileResolutionRuntimeController?.ensureRestaurantForLead?.(...args),
      resolveLeadByEmail: (...args) => authProfileResolutionRuntimeController?.resolveLeadByEmail?.(...args),
      getDoc: firebaseApi.getDocFn || (async () => null),
      doc: firebaseApi.docFn || null,
      db: firebaseApi.db || null,
      serverTimestamp: firebaseApi.serverTimestampFn || (() => null),
      setDoc: firebaseApi.setDocFn || (async () => {}),
      loadBusinessProfile: (...args) => selfProfileRuntimeController?.loadBusinessProfile?.(...args),
      loadBusinessStaffProfile: (...args) => selfProfileRuntimeController?.loadBusinessStaffProfile?.(...args),
      loadUserProfile: (...args) => selfProfileRuntimeController?.loadUserProfile?.(...args)
    });
  }

  return {
    selfProfileRuntimeController,
    ...publicProfileRuntimeController,
    ...restaurantIdentityRuntimeController,
    ...storyFeedRuntimeController,
    ...authProfileResolutionRuntimeController,
    ...selfProfileRuntimeController,
    persistPrivateAccountSetting,
    loadAuthProfile
  };
}
