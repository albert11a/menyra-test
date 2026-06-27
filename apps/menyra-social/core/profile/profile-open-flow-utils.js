import {
  buildCanonicalPublicBusinessPathCore,
  normalizePublicBusinessSlugCore
} from "../router/public-business-route-utils.js";
import { markMnyraLoadingEventCore as markLoadingEvent } from "../common/loading-diagnostics-utils.js";

function pickBusinessProfileText(...values) {
  for (const value of values) {
    const text = String(value || "").trim();
    if (text) return text;
  }
  return "";
}

function pickBusinessTitleImageText(...records) {
  for (const record of records) {
    if (!record || typeof record !== "object") continue;
    const images = Array.isArray(record.coverImages)
      ? record.coverImages
      : (Array.isArray(record.titleImages) ? record.titleImages : []);
    const firstImage = images.map((item) => String(item || "").trim()).find(Boolean) || "";
    const text = pickBusinessProfileText(
      record.titleImageUrl,
      record.coverImageUrl,
      record.coverUrl,
      record.heroUrl,
      firstImage
    );
    if (text) return text;
  }
  return "";
}

export function normalizeBusinessProfileTarget(input, { source = "" } = {}) {
  const inputIsObject = input && typeof input === "object";
  const safeInput = inputIsObject ? input : {};
  const initialSnapshot = (
    safeInput.initialSnapshot
    || safeInput.snapshot
    || safeInput.restaurant
    || safeInput.raw
    || null
  );
  const safeSnapshot = initialSnapshot && typeof initialSnapshot === "object"
    ? initialSnapshot
    : {};
  const documentId = pickBusinessProfileText(
    safeInput.documentId,
    safeInput.docId,
    safeInput.restaurantDocumentId,
    safeSnapshot.documentId,
    safeSnapshot.docId,
    safeSnapshot.id
  );
  const explicitCanonicalRestaurantId = pickBusinessProfileText(
    safeInput.canonicalRestaurantId,
    safeInput.canonicalId,
    safeInput.restaurantCanonicalId,
    safeSnapshot.canonicalRestaurantId
  );
  const restaurantId = pickBusinessProfileText(
    safeInput.restaurantId,
    safeInput.id,
    safeSnapshot.restaurantId,
    safeSnapshot.id,
    documentId
  );
  const publicSlug = pickBusinessProfileText(
    safeInput.publicSlug,
    safeInput.slug,
    safeSnapshot.publicSlug,
    safeSnapshot.slug
  );
  const landingSlug = pickBusinessProfileText(
    safeInput.landingSlug,
    safeSnapshot.landingSlug
  );
  const handle = pickBusinessProfileText(
    safeInput.handle,
    safeSnapshot.handle
  );
  const canonicalRestaurantId = pickBusinessProfileText(
    explicitCanonicalRestaurantId,
    safeInput.restaurantId,
    safeSnapshot.restaurantId,
    documentId
  );
  const stringInput = typeof input === "string" ? String(input || "").trim() : "";
  const lookupText = pickBusinessProfileText(
    safeInput.lookupText,
    publicSlug,
    landingSlug,
    handle,
    stringInput,
    safeInput.id,
    safeInput.name,
    safeSnapshot.name,
    safeSnapshot.restaurantName
  );
  const name = pickBusinessProfileText(
    stringInput,
    safeInput.name,
    safeInput.restaurantName,
    safeInput.businessName,
    safeSnapshot.name,
    safeSnapshot.restaurantName,
    safeSnapshot.businessName
  );
  const id = pickBusinessProfileText(
    canonicalRestaurantId,
    restaurantId,
    publicSlug,
    landingSlug,
    handle,
    stringInput
  );
  return {
    id,
    restaurantId,
    canonicalRestaurantId,
    documentId,
    publicSlug,
    landingSlug,
    handle,
    slug: publicSlug || landingSlug || handle,
    lookupText,
    name,
    source: pickBusinessProfileText(safeInput.source, source, "profile-open"),
    routeContext: safeInput.routeContext && typeof safeInput.routeContext === "object"
      ? safeInput.routeContext
      : null,
    initialSnapshot: initialSnapshot && typeof initialSnapshot === "object" ? initialSnapshot : null
  };
}

export function createProfileOpenFlowControllerCore({
  state,
  isLocalBusinessProfile,
  getRestaurantMetaById,
  normalizeSearchKey,
  render,
  ensureMenuDataForProfile,
  ensureFocusDataForProfile,
  hydrateRestaurantsByIds,
  normalizeExternalProfile,
  showPublicProfile,
  fetchBusinessProfileDoc,
  loadBusinessPostsForRestaurant,
  normalizeExternalUserProfile,
  openGuestAuthPrompt,
  userProfileCache,
  hasPendingFollowRequest,
  fetchUserDocByUid,
  resolveUserByHandle,
  loadUserPostsForUser
} = {}) {
  const isLocalBusiness = typeof isLocalBusinessProfile === "function"
    ? isLocalBusinessProfile
    : (() => false);
  const getRestaurantMeta = typeof getRestaurantMetaById === "function"
    ? getRestaurantMetaById
    : (() => null);
  const normalizeSearch = typeof normalizeSearchKey === "function"
    ? normalizeSearchKey
    : ((value) => String(value || "").trim().toLowerCase());
  const renderApp = typeof render === "function"
    ? render
    : (() => {});
  const ensureMenuData = typeof ensureMenuDataForProfile === "function"
    ? ensureMenuDataForProfile
    : (() => {});
  const ensureFocusData = typeof ensureFocusDataForProfile === "function"
    ? ensureFocusDataForProfile
    : (() => {});
  const hydrateRestaurants = typeof hydrateRestaurantsByIds === "function"
    ? hydrateRestaurantsByIds
    : (() => Promise.resolve(null));
  const normalizeBusinessProfile = typeof normalizeExternalProfile === "function"
    ? normalizeExternalProfile
    : ((value) => value || {});
  const showPublicProfileView = typeof showPublicProfile === "function"
    ? showPublicProfile
    : (() => {});
  const fetchBusinessProfile = typeof fetchBusinessProfileDoc === "function"
    ? fetchBusinessProfileDoc
    : (() => Promise.resolve(null));
  const loadBusinessPosts = typeof loadBusinessPostsForRestaurant === "function"
    ? loadBusinessPostsForRestaurant
    : (() => Promise.resolve([]));
  const normalizeExternalUserProfileFn = typeof normalizeExternalUserProfile === "function"
    ? normalizeExternalUserProfile
    : ((value) => value || {});
  const openGuestAuth = typeof openGuestAuthPrompt === "function"
    ? openGuestAuthPrompt
    : (() => false);
  const userProfileCacheMap = userProfileCache instanceof Map
    ? userProfileCache
    : new Map();
  const checkPendingFollowRequest = typeof hasPendingFollowRequest === "function"
    ? hasPendingFollowRequest
    : (() => Promise.resolve(false));
  const fetchUserByUid = typeof fetchUserDocByUid === "function"
    ? fetchUserDocByUid
    : (() => Promise.resolve(null));
  const resolveUserByHandleFn = typeof resolveUserByHandle === "function"
    ? resolveUserByHandle
    : (() => Promise.resolve(null));
  const loadUserPosts = typeof loadUserPostsForUser === "function"
    ? loadUserPostsForUser
    : (() => Promise.resolve([]));
  const pickFirstText = (...values) => {
    for (const value of values) {
      const text = String(value || "").trim();
      if (text) return text;
    }
    return "";
  };
  const withTimeoutFallback = (promiseLike, {
    timeoutMs = 0,
    fallbackValue = null
  } = {}) => {
    const safePromise = Promise.resolve(promiseLike).catch(() => fallbackValue);
    const safeTimeoutMs = Math.max(0, Number(timeoutMs) || 0);
    if (!safeTimeoutMs) return safePromise;
    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timerId);
        resolve(value);
      };
      const timerId = setTimeout(() => {
        finish(fallbackValue);
      }, safeTimeoutMs);
      safePromise.then((value) => {
        finish(value);
      }).catch(() => {
        finish(fallbackValue);
      });
    });
  };
  const normalizeIdentityTruthState = (value = "", fallback = "ready") => {
    const safeValue = String(value || "").trim().toLowerCase();
    if (safeValue === "pending") return "pending";
    if (safeValue === "loading") return "loading";
    if (safeValue === "ready") return "ready";
    if (safeValue === "error") return "error";
    return String(fallback || "ready").trim().toLowerCase() || "ready";
  };
  const resolveLoadingIdentityTruthState = (profile = null) => {
    const next = normalizeIdentityTruthState(profile?.identityTruthState || "", "loading");
    if (next === "ready") return "ready";
    if (next === "error") return "loading";
    return next;
  };
  const normalizeTruthState = (value = "", fallback = "unknown") => {
    const safeValue = String(value || "").trim().toLowerCase();
    if (safeValue === "seeded") return "seeded";
    if (safeValue === "knownempty" || safeValue === "known-empty") return "knownEmpty";
    if (safeValue === "unknown") return "unknown";
    const safeFallback = String(fallback || "").trim().toLowerCase();
    if (safeFallback === "seeded") return "seeded";
    if (safeFallback === "knownempty" || safeFallback === "known-empty") return "knownEmpty";
    return "unknown";
  };
  const applySurfaceTruthPatch = (
    profile = {},
    {
      identityStatus = "ready",
      postsStatus = "ready"
    } = {}
  ) => {
    const normalizedIdentityStatus = normalizeIdentityTruthState(identityStatus, "ready");
    const safePostsStatus = String(postsStatus || "").trim().toLowerCase();
    let normalizedTruthState = "loading";
    let postsLoaded = false;
    if (safePostsStatus === "ready" || safePostsStatus === "stable") {
      normalizedTruthState = "stable";
      postsLoaded = true;
    } else if (safePostsStatus === "empty") {
      normalizedTruthState = "empty";
      postsLoaded = true;
    } else if (safePostsStatus === "error") {
      normalizedTruthState = "error";
      postsLoaded = true;
    } else if (safePostsStatus === "pending") {
      normalizedTruthState = "route-pending-loading";
      postsLoaded = false;
    }
    return {
      ...(profile || {}),
      identityTruthState: normalizedIdentityStatus,
      truthState: normalizedTruthState,
      postsLoaded
    };
  };
  const normalizeHandleValue = (value = "") => String(value || "").replace(/^@/, "").trim().toLowerCase();
  const isSameBusinessProfileTarget = (profile = null, {
    restaurantId = "",
    lookupId = ""
  } = {}) => {
    if (!profile || typeof profile !== "object") return false;
    const currentRestaurantId = String(profile.restaurantId || "").trim();
    if (!currentRestaurantId) return false;
    const directId = String(restaurantId || "").trim();
    const fallbackId = String(lookupId || "").trim();
    if (directId && currentRestaurantId === directId) return true;
    if (fallbackId && currentRestaurantId === fallbackId) return true;
    return false;
  };
  const isSameUserProfileTarget = (profile = null, { uid = "", handle = "" } = {}) => {
    if (!profile || typeof profile !== "object") return false;
    const targetUid = String(uid || "").trim();
    const profileUid = String(profile.uid || "").trim();
    if (targetUid && profileUid && targetUid === profileUid) return true;
    const targetHandle = normalizeHandleValue(handle);
    const profileHandle = normalizeHandleValue(profile.handle || profile.name || "");
    return !!targetHandle && !!profileHandle && targetHandle === profileHandle;
  };
  const queueProfileHistoryPush = ({ showBack = true, previousTab = "", sameTarget = false } = {}) => {
    if (!showBack || !state || typeof state !== "object") return;
    if (String(state.__nextRouteHistoryMode || "").trim().toLowerCase() === "push") return;
    const previousTabKey = String(previousTab || state.activeTab || "").trim().toLowerCase();
    if (previousTabKey !== "profile" || !sameTarget) {
      state.__nextRouteHistoryMode = "push";
    }
  };

  const isOwnBusinessTarget = ({ restaurantId = "", name = "" } = {}) => {
    if (!isLocalBusiness(state?.userProfile)) return false;
    const ownRestaurantId = String(state?.userProfile?.restaurantId || "").trim();
    const targetRestaurantId = String(restaurantId || "").trim();
    if (ownRestaurantId && targetRestaurantId && ownRestaurantId === targetRestaurantId) return true;

    const ownRest = ownRestaurantId ? getRestaurantMeta(ownRestaurantId) : null;
    const ownNames = [
      state?.userProfile?.name,
      ownRest?.name,
      ownRest?.restaurantName
    ].map((item) => normalizeSearch(item)).filter(Boolean);
    const targetName = normalizeSearch(name);
    if (!targetName) return false;
    return ownNames.includes(targetName);
  };

  const openOwnBusinessProfile = ({ showBack = true, topTab } = {}) => {
    const prevTab = state?.activeTab || "feed";
    const nextTopTab = topTab === "menu" ? "menu" : "profile";
    queueProfileHistoryPush({
      showBack,
      previousTab: prevTab,
      sameTarget: !state.profileView
    });
    state.profileView = null;
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = "posts";
    state.profileTopTab = nextTopTab;
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.activeTab = "profile";
    state.profileBackTab = showBack ? prevTab : "";
    renderApp();
    if (nextTopTab === "menu") {
      ensureMenuData();
      ensureFocusData();
    }
  };

  const normalizeBusinessLookupKey = (value = "") => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return raw
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const humanizeBusinessLookupLabel = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const slug = normalizeBusinessLookupKey(raw);
    if (!slug) return raw;
    const parts = slug.split("-").filter(Boolean);
    if (!parts.length) return raw;
    return parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };
  const isLikelyOpaqueBusinessId = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw) return false;
    if (/\s|\./.test(raw)) return false;
    const compact = raw.replace(/[-_]/g, "");
    if (!compact) return false;
    if (/^[a-f0-9]{16,}$/i.test(compact)) return true;
    if (/^[a-z0-9]{20,}$/i.test(compact)) return true;
    const digits = (compact.match(/\d/g) || []).length;
    return compact.length >= 16 && digits >= 4;
  };
  const normalizeCanonicalBusinessSlug = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw || isLikelyOpaqueBusinessId(raw)) return "";
    const slug = normalizePublicBusinessSlugCore(raw);
    if (!slug || isLikelyOpaqueBusinessId(slug)) return "";
    return slug;
  };
  const resolveCanonicalBusinessRouteFields = (...candidates) => {
    for (const candidate of candidates) {
      const slug = normalizeCanonicalBusinessSlug(candidate);
      if (!slug) continue;
      return {
        publicSlug: slug,
        landingSlug: slug,
        canonicalPublicPath: buildCanonicalPublicBusinessPathCore({ slug })
      };
    }
    return {};
  };
  const resolveCanonicalRestaurantIdCandidate = (...candidates) => {
    for (const candidate of candidates) {
      const value = String(candidate || "").trim();
      if (value) return value;
    }
    return "";
  };
  const withCanonicalRestaurantId = (profile = {}, canonicalRestaurantId = "") => {
    const safeProfile = profile && typeof profile === "object" ? profile : {};
    const resolvedCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
      canonicalRestaurantId,
      safeProfile.canonicalRestaurantId
    );
    if (!resolvedCanonicalRestaurantId) return safeProfile;
    return {
      ...safeProfile,
      canonicalRestaurantId: resolvedCanonicalRestaurantId,
      restaurantId: String(safeProfile.restaurantId || resolvedCanonicalRestaurantId).trim() || resolvedCanonicalRestaurantId
    };
  };

  const resolveRestaurantByLookup = ({ restaurantId = "", lookupText = "" } = {}) => {
    const targetId = String(restaurantId || "").trim();
    const targetLookup = normalizeBusinessLookupKey(lookupText);
    const list = Array.isArray(state?.restaurants) ? state.restaurants : [];
    if (targetId) {
      const direct = list.find((row) => String(row?.id || "").trim() === targetId);
      if (direct) return direct;
    }
    if (!targetLookup) return null;
    return list.find((row) => {
      const rowLookup = normalizeBusinessLookupKey(
        row?.publicSlug || row?.landingSlug || row?.handle || row?.name || row?.restaurantName || ""
      );
      return !!rowLookup && rowLookup === targetLookup;
    }) || null;
  };

  const resolveBusinessDisplayNameFallback = ({ safeName = "", rest = null, lookupKey = "" } = {}) => {
    const preferred = String(
      safeName
      || rest?.name
      || rest?.restaurantName
      || rest?.landingSlug
      || rest?.handle
      || ""
    ).trim();
    if (preferred) {
      return humanizeBusinessLookupLabel(preferred) || preferred;
    }
    const fallbackLookup = String(lookupKey || "").trim();
    if (!fallbackLookup || isLikelyOpaqueBusinessId(fallbackLookup)) return "Lokal";
    return humanizeBusinessLookupLabel(fallbackLookup) || "Lokal";
  };

  const openProfileViewFromBusiness = async (input, { showBack = true, topTab, menuAccessSource = "", tableNumber = 0 } = {}) => {
    let targetRestaurantLookupId = "";
    let targetMenuRestaurantId = "";
    let targetCanonicalRestaurantId = "";
    try {
      const businessTarget = normalizeBusinessProfileTarget(input);
      const safeName = String(businessTarget.name || "").trim();
      const restaurantId = String(businessTarget.restaurantId || "").trim();
      const lookupText = String(businessTarget.lookupText || businessTarget.id || "").trim();
      const safeTargetSource = String(businessTarget.source || "").trim().toLowerCase();
      targetCanonicalRestaurantId = String(businessTarget.canonicalRestaurantId || "").trim();
      if (!safeName && !restaurantId && !lookupText) return;
      markLoadingEvent("profile open source", {
        source: safeTargetSource || "profile-open",
        restaurantId: restaurantId || targetCanonicalRestaurantId || "",
        targetId: targetCanonicalRestaurantId || businessTarget.id || ""
      });
      const safeMenuAccessSource = String(menuAccessSource || "").trim().toLowerCase();
      const safeTableNumber = Math.max(0, Number(tableNumber || 0) || 0);
      const requestedTopTab = String(topTab || "").trim().toLowerCase();
      const isMenuTopTab = requestedTopTab === "menu";
      const isLandingTopTab = requestedTopTab === "landing";
      const isDirectWebEntryRequest = showBack === false;
      const resolvedTopTab = isLandingTopTab
        ? "landing"
        : (isMenuTopTab ? "menu" : "profile");
      const resolvedContentTab = resolvedTopTab === "menu" ? "menu" : "posts";
      const isWebRoutePriorityPath = isDirectWebEntryRequest && (resolvedTopTab === "menu" || resolvedTopTab === "profile");
      const isWebPostsFirstPath = isWebRoutePriorityPath && resolvedTopTab === "profile" && resolvedContentTab === "posts";
      const isQrMenuOpen = isMenuTopTab && safeMenuAccessSource === "qr";
      // For deeplinks like ?r=...&tab=menu we always want the public profile menu view,
      // never the owner editor tab, even when the target is the own business account.
      const isDeeplinkMenuOpen = isMenuTopTab && !showBack;

      if (
        !isDirectWebEntryRequest
        && !isDeeplinkMenuOpen
        && !isQrMenuOpen
        && !isLandingTopTab
        && isOwnBusinessTarget({ restaurantId, name: safeName })
      ) {
        openOwnBusinessProfile({ showBack, topTab });
        return;
      }

      if (restaurantId) {
        void hydrateRestaurants([restaurantId], { max: 1 });
      }

      const snapshotRest = businessTarget.initialSnapshot && typeof businessTarget.initialSnapshot === "object"
        ? {
          ...businessTarget.initialSnapshot,
          ...(businessTarget.documentId && !String(businessTarget.initialSnapshot.id || "").trim()
            ? { id: businessTarget.documentId }
            : {})
        }
        : null;
      const rest = snapshotRest
        || resolveRestaurantByLookup({ restaurantId, lookupText })
        || (restaurantId ? { id: restaurantId } : {});
      targetRestaurantLookupId = String(restaurantId || businessTarget.id || rest?.id || lookupText || "").trim();
      targetMenuRestaurantId = String(targetCanonicalRestaurantId || restaurantId || rest?.id || "").trim();
      markLoadingEvent("profile restaurant resolved", {
        source: safeTargetSource || "profile-open",
        requestedId: targetRestaurantLookupId,
        restaurantId: targetMenuRestaurantId,
        targetId: targetCanonicalRestaurantId || targetMenuRestaurantId
      });
      queueProfileHistoryPush({
        showBack,
        previousTab: state?.activeTab || "feed",
        sameTarget: isSameBusinessProfileTarget(state?.profileView?.profile, {
          restaurantId: targetMenuRestaurantId,
          lookupId: targetRestaurantLookupId
        })
      });
      const resolveDirectRouteBootstrapSeed = () => {
        const candidate = state?.__publicRouteBootstrap && typeof state.__publicRouteBootstrap === "object"
          ? state.__publicRouteBootstrap
          : null;
        if (!candidate) return null;
        const candidateRestaurantId = String(candidate?.restaurantId || "").trim();
        const lookupKey = normalizeBusinessLookupKey(targetRestaurantLookupId || lookupText || "");
        if (targetMenuRestaurantId && candidateRestaurantId && targetMenuRestaurantId === candidateRestaurantId) {
          return candidate;
        }
        const candidateLookupKey = normalizeBusinessLookupKey(candidateRestaurantId);
        if (lookupKey && candidateLookupKey && lookupKey === candidateLookupKey) {
          return candidate;
        }
        const candidateHandleKey = normalizeBusinessLookupKey(
          candidate?.businessSnapshot?.identity?.handle
          || candidate?.identity?.handle
          || ""
        );
        if (lookupKey && candidateHandleKey && lookupKey === candidateHandleKey) {
          return candidate;
        }
        if (!targetMenuRestaurantId && !lookupKey && candidateRestaurantId) {
          return candidate;
        }
        if (!targetMenuRestaurantId && candidateRestaurantId) {
          return candidate;
        }
        return null;
      };
      const routeBootstrapSeed = isDirectWebEntryRequest
        ? resolveDirectRouteBootstrapSeed()
        : null;
      const routeSnapshotSeed = routeBootstrapSeed?.businessSnapshot && typeof routeBootstrapSeed.businessSnapshot === "object"
        ? routeBootstrapSeed.businessSnapshot
        : null;
      const routeTruthSeed = routeSnapshotSeed?.truth && typeof routeSnapshotSeed.truth === "object"
        ? routeSnapshotSeed.truth
        : (routeBootstrapSeed?.truth && typeof routeBootstrapSeed.truth === "object" ? routeBootstrapSeed.truth : {});
      const routeIdentitySeed = routeSnapshotSeed?.identity && typeof routeSnapshotSeed.identity === "object"
        ? routeSnapshotSeed.identity
        : (routeBootstrapSeed?.identity && typeof routeBootstrapSeed.identity === "object" ? routeBootstrapSeed.identity : {});
      const routePostsSeed = Array.isArray(routeSnapshotSeed?.posts?.items)
        ? routeSnapshotSeed.posts.items
        : (Array.isArray(routeBootstrapSeed?.posts?.items) ? routeBootstrapSeed.posts.items : []);
      const routeMenuSeed = [];
      const routeFocusSeed = [];
      const routePostsState = normalizeTruthState(
        routeSnapshotSeed?.posts?.state
        || routeBootstrapSeed?.posts?.state
        || routeTruthSeed?.posts
        || "",
        routePostsSeed.length ? "seeded" : "unknown"
      );
      const routeMenuState = "unknown";
      const routeFocusState = "unknown";
      let effectiveRoutePostsState = routePostsState;
      let effectiveRouteMenuState = routeMenuState;
      let effectiveRouteFocusState = routeFocusState;
      const routeIdentityState = normalizeTruthState(
        routeTruthSeed?.identity || "",
        (
          String(routeIdentitySeed?.name || "").trim()
          || String(routeIdentitySeed?.handle || "").trim()
          || String(routeIdentitySeed?.avatar || "").trim()
        ) ? "seeded" : "unknown"
      );
      const routeSnapshotRestaurantId = String(
        routeSnapshotSeed?.restaurantId
        || routeBootstrapSeed?.restaurantId
        || ""
      ).trim();
      targetCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
        routeSnapshotRestaurantId,
        routeBootstrapSeed?.canonicalRestaurantId,
        targetCanonicalRestaurantId
      );
      if (targetCanonicalRestaurantId) {
        targetMenuRestaurantId = targetCanonicalRestaurantId;
      }
      const buildDirectEntryMeta = (phase = "loading") => ({
        active: true,
        source: "route",
        owner: isDirectWebEntryRequest ? "web-direct" : "route",
        routeFirst: isDirectWebEntryRequest,
        webPriority: isWebRoutePriorityPath,
        menuFirst: resolvedTopTab === "menu",
        postsFirst: resolvedTopTab === "profile" && resolvedContentTab === "posts",
        phase,
        topTab: resolvedTopTab,
        contentTab: resolvedContentTab,
        explicitLanding: isLandingTopTab
      });
      const buildRoutePayloadMeta = (phase = "loading", {
        profile = null,
        posts = [],
        directEntry = null
      } = {}) => {
        if (!isDirectWebEntryRequest) return null;
        const safeProfile = profile && typeof profile === "object" ? profile : {};
        const safePosts = Array.isArray(posts) ? posts : [];
        const safeCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
          safeProfile.canonicalRestaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId,
          routeBootstrapSeed?.canonicalRestaurantId
        );
        const safeRestaurantId = resolveCanonicalRestaurantIdCandidate(
          safeCanonicalRestaurantId,
          safeProfile.restaurantId,
          targetMenuRestaurantId,
          targetRestaurantLookupId
        );
        const menu = state?.menu || {};
        const focus = state?.focus || {};
        const sameRestaurantMenu = String(menu.restaurantId || "").trim() === safeRestaurantId
          && String(menu.source || "").trim().toLowerCase() === "public";
        const publicMenuHasItems = sameRestaurantMenu
          && String(menu.truthState || "").trim().toLowerCase() === "seeded"
          && Array.isArray(menu.items)
          && menu.items.length > 0;
        const sameRestaurantFocus = publicMenuHasItems
          && String(focus.restaurantId || "").trim() === safeRestaurantId
          && String(focus.truthSource || "").trim().toLowerCase() === "public-menu";
        const menuItems = sameRestaurantMenu && Array.isArray(menu.items)
          ? menu.items
          : [];
        const focusItems = sameRestaurantFocus && Array.isArray(focus.items)
          ? focus.items
          : [];
        const postsTruthState = normalizeTruthState(
          routeSnapshotSeed?.posts?.state
          || routeBootstrapSeed?.posts?.state
          || routeTruthSeed?.posts
          || "",
          safePosts.length > 0 ? "seeded" : (safeProfile.postsLoaded === true ? "knownEmpty" : "unknown")
        );
        const menuTruthState = normalizeTruthState(
          sameRestaurantMenu ? (menu.truthState || "") : "",
          sameRestaurantMenu
            ? (menuItems.length > 0 ? "seeded" : (menu.loading ? "unknown" : "knownEmpty"))
            : "unknown"
        );
        const focusTruthState = normalizeTruthState(
          sameRestaurantFocus ? (focus.truthState || "") : "",
          sameRestaurantFocus
            ? (focusItems.length > 0 ? "seeded" : (focus.loading ? "unknown" : "knownEmpty"))
            : "unknown"
        );
        const identityTruthState = normalizeTruthState(
          routeTruthSeed?.identity || "",
          (
            String(safeProfile.name || routeIdentitySeed?.name || "").trim()
            || String(safeProfile.handle || routeIdentitySeed?.handle || "").trim()
            || String(safeProfile.avatar || routeIdentitySeed?.avatar || "").trim()
          ) ? "seeded" : "unknown"
        );
        const identityBio = String(safeProfile.bio || routeIdentitySeed?.bio || "").trim();
        const identityTitleImage = pickBusinessTitleImageText(safeProfile, routeIdentitySeed);
        const resolvedMenuItems = menuTruthState === "seeded"
          ? menuItems
          : [];
        const resolvedFocusItems = focusTruthState === "seeded"
          ? focusItems
          : [];
        const menuCount = menuTruthState === "seeded"
          ? resolvedMenuItems.length
          : (menuTruthState === "knownEmpty"
            ? 0
            : 0);
        const focusCount = focusTruthState === "seeded"
          ? resolvedFocusItems.length
          : (focusTruthState === "knownEmpty"
            ? 0
            : 0);
        const postsCount = postsTruthState === "seeded"
          ? safePosts.length
          : (postsTruthState === "knownEmpty"
            ? 0
            : Math.max(0, Number(routeSnapshotSeed?.posts?.count || routeBootstrapSeed?.posts?.count || 0) || 0));
        const snapshotVersion = String(
          routeSnapshotSeed?.snapshotVersion
          || routeBootstrapSeed?.snapshotVersion
          || "business-page-v1"
        ).trim() || "business-page-v1";
        const hasCountSeed = (
          safeProfile.followers !== null
          && safeProfile.followers !== undefined
          && Number.isFinite(Number(safeProfile.followers))
        ) || (
          safeProfile.following !== null
          && safeProfile.following !== undefined
          && Number.isFinite(Number(safeProfile.following))
        );
        const snapshotUpdatedAt = Math.max(
          0,
          Number(routeSnapshotSeed?.updatedAt || routeBootstrapSeed?.snapshotUpdatedAt || 0) || 0
        ) || Date.now();
        const snapshotVersionKey = String(
          routeSnapshotSeed?.version
          || routeBootstrapSeed?.snapshotVersionKey
          || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`
        ).trim() || `${safeRestaurantId}:${snapshotUpdatedAt}:${snapshotVersion}`;
        const nextSnapshot = {
          snapshotVersion,
          version: snapshotVersionKey,
          updatedAt: snapshotUpdatedAt,
          restaurantId: safeRestaurantId,
          identity: {
            name: String(safeProfile.name || routeIdentitySeed?.name || "").trim(),
            handle: String(safeProfile.handle || routeIdentitySeed?.handle || "").trim(),
            avatar: String(safeProfile.avatar || routeIdentitySeed?.avatar || "").trim(),
            titleImageUrl: identityTitleImage,
            coverImageUrl: identityTitleImage,
            coverUrl: identityTitleImage,
            heroUrl: identityTitleImage,
            location: String(safeProfile.location || routeIdentitySeed?.location || "").trim(),
            bio: identityBio,
            followers: safeProfile.followers ?? null,
            following: safeProfile.following ?? null,
            type: String(safeProfile.type || safeProfile.customerType || routeIdentitySeed?.type || routeIdentitySeed?.customerType || "").trim(),
            customerType: String(safeProfile.customerType || safeProfile.type || routeIdentitySeed?.customerType || routeIdentitySeed?.type || "").trim()
          },
          posts: {
            state: postsTruthState,
            seeded: postsTruthState === "seeded",
            knownEmpty: postsTruthState === "knownEmpty",
            unknown: postsTruthState === "unknown",
            count: postsCount,
            items: safePosts
          },
          menu: {
            state: menuTruthState,
            seeded: menuTruthState === "seeded",
            knownEmpty: menuTruthState === "knownEmpty",
            unknown: menuTruthState === "unknown",
            count: menuCount,
            items: resolvedMenuItems,
            statusBadgeVisible: menu.statusBadgeVisible !== false
          },
          focus: {
            state: focusTruthState,
            seeded: focusTruthState === "seeded",
            knownEmpty: focusTruthState === "knownEmpty",
            unknown: focusTruthState === "unknown",
            count: focusCount,
            items: resolvedFocusItems,
            enabled: focus.enabled !== false
          },
          layout: {
            menuCardColor: String(state?.menuLayout?.cardColor || routeSnapshotSeed?.layout?.menuCardColor || "").trim().toLowerCase() || "white"
          },
          truth: {
            identity: identityTruthState,
            bio: normalizeTruthState(routeTruthSeed?.bio || "", identityBio ? "seeded" : "knownEmpty"),
            avatar: normalizeTruthState(routeTruthSeed?.avatar || "", String(safeProfile.avatar || routeIdentitySeed?.avatar || "").trim() ? "seeded" : "knownEmpty"),
            counts: normalizeTruthState(routeTruthSeed?.counts || "", hasCountSeed ? "seeded" : "unknown"),
            posts: postsTruthState,
            menu: menuTruthState,
            focus: focusTruthState,
            layout: "seeded"
          }
        };
        const directMeta = directEntry && typeof directEntry === "object"
          ? directEntry
          : buildDirectEntryMeta(phase);
        return {
          ...(routeBootstrapSeed || {}),
          owner: "web-direct",
          routeFirst: isDirectWebEntryRequest,
          restaurantId: safeRestaurantId,
          canonicalRestaurantId: safeCanonicalRestaurantId,
          surface: resolvedTopTab === "menu" ? "menu" : "profile",
          topTab: resolvedTopTab,
          contentTab: resolvedContentTab,
          phase: String(directMeta?.phase || phase || "loading").trim().toLowerCase() || "loading",
          menuAccessSource: safeMenuAccessSource,
          tableNumber: safeTableNumber,
          identity: {
            name: nextSnapshot.identity.name,
            handle: nextSnapshot.identity.handle,
            avatar: nextSnapshot.identity.avatar,
            titleImageUrl: nextSnapshot.identity.titleImageUrl,
            coverImageUrl: nextSnapshot.identity.coverImageUrl,
            coverUrl: nextSnapshot.identity.coverUrl,
            heroUrl: nextSnapshot.identity.heroUrl,
            location: nextSnapshot.identity.location,
            bio: nextSnapshot.identity.bio,
            followers: nextSnapshot.identity.followers,
            following: nextSnapshot.identity.following,
            type: nextSnapshot.identity.type,
            customerType: nextSnapshot.identity.customerType
          },
          posts: {
            state: nextSnapshot.posts.state,
            count: nextSnapshot.posts.count,
            seeded: nextSnapshot.posts.seeded,
            knownEmpty: nextSnapshot.posts.knownEmpty,
            unknown: nextSnapshot.posts.unknown,
            items: safePosts
          },
          menu: {
            state: nextSnapshot.menu.state,
            count: nextSnapshot.menu.count,
            seeded: nextSnapshot.menu.seeded,
            knownEmpty: nextSnapshot.menu.knownEmpty,
            unknown: nextSnapshot.menu.unknown,
            items: nextSnapshot.menu.items,
            statusBadgeVisible: nextSnapshot.menu.statusBadgeVisible
          },
          focus: {
            state: nextSnapshot.focus.state,
            count: nextSnapshot.focus.count,
            seeded: nextSnapshot.focus.seeded,
            knownEmpty: nextSnapshot.focus.knownEmpty,
            unknown: nextSnapshot.focus.unknown,
            items: nextSnapshot.focus.items,
            enabled: nextSnapshot.focus.enabled
          },
          layout: {
            menuCardColor: nextSnapshot.layout.menuCardColor
          },
          truth: {
            identity: nextSnapshot.truth.identity,
            bio: nextSnapshot.truth.bio,
            avatar: nextSnapshot.truth.avatar,
            counts: nextSnapshot.truth.counts,
            posts: nextSnapshot.truth.posts,
            menu: nextSnapshot.truth.menu,
            focus: nextSnapshot.truth.focus,
            layout: nextSnapshot.truth.layout
          },
          snapshotVersion: nextSnapshot.snapshotVersion,
          snapshotUpdatedAt: nextSnapshot.updatedAt,
          snapshotVersionKey: nextSnapshot.version,
          businessSnapshot: nextSnapshot,
          ts: Date.now()
        };
      };
      const prioritizePostsSurface = resolvedTopTab === "profile" && resolvedContentTab === "posts";
      const earlyPostsRestaurantId = resolveCanonicalRestaurantIdCandidate(
        targetCanonicalRestaurantId,
        routeSnapshotRestaurantId,
        targetMenuRestaurantId
      );
      const earlyPostsSkipProfileResolve = !!resolveCanonicalRestaurantIdCandidate(
        targetCanonicalRestaurantId,
        routeSnapshotRestaurantId
      );
      const shouldWarmPostsForSurface = !!earlyPostsRestaurantId
        && (
          isWebRoutePriorityPath
          || safeTargetSource === "map"
          || safeTargetSource === "discovery"
          || safeTargetSource === "search"
          || safeTargetSource === "feed"
          || safeTargetSource === "profile-open"
        );
      const shouldUseInitialPostsPage = prioritizePostsSurface || isWebRoutePriorityPath;
      const earlyPostsPromise = shouldWarmPostsForSurface && earlyPostsRestaurantId
        ? Promise.resolve(loadBusinessPosts(earlyPostsRestaurantId, {
          skipProfileResolve: earlyPostsSkipProfileResolve,
          initialPage: shouldUseInitialPostsPage
        }))
          .then((rows) => ({
            ok: true,
            posts: Array.isArray(rows) ? rows : [],
            initialPage: shouldUseInitialPostsPage
          }))
          .catch((err) => {
            console.error(err);
            return {
              ok: false,
              posts: []
            };
          })
        : null;
      const liveView = state?.profileView;
      const liveProfile = liveView?.profile && typeof liveView.profile === "object"
        ? liveView.profile
        : null;
      const liveBusinessProfile = isSameBusinessProfileTarget(liveProfile, {
        restaurantId: targetMenuRestaurantId,
        lookupId: targetRestaurantLookupId
      })
        ? liveProfile
        : null;
      const liveBusinessPosts = liveBusinessProfile && Array.isArray(liveView?.posts)
        ? liveView.posts
        : [];
      const routeSeedPosts = routePostsState === "seeded"
        ? routePostsSeed
        : [];
      const routeSeedCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
        targetCanonicalRestaurantId,
        routeSnapshotRestaurantId
      );
      const routeSeedProfile = routeSnapshotSeed
        ? applySurfaceTruthPatch({
          name: String(routeIdentitySeed?.name || "").trim() || resolveBusinessDisplayNameFallback({
            safeName,
            rest,
            lookupKey: targetRestaurantLookupId
          }),
          handle: pickFirstText(routeIdentitySeed?.handle, rest?.handle, liveBusinessProfile?.handle),
          uid: pickFirstText(liveBusinessProfile?.uid),
          bio: String(routeIdentitySeed?.bio || "").trim() || pickFirstText(liveBusinessProfile?.bio, rest?.bio, rest?.description),
          avatar: pickFirstText(routeIdentitySeed?.avatar, liveBusinessProfile?.avatar, rest?.logoUrl, rest?.logo, rest?.avatar),
          titleImageUrl: pickBusinessTitleImageText(routeIdentitySeed, liveBusinessProfile, rest),
          coverImageUrl: pickBusinessTitleImageText(routeIdentitySeed, liveBusinessProfile, rest),
          coverUrl: pickBusinessTitleImageText(routeIdentitySeed, liveBusinessProfile, rest),
          heroUrl: pickBusinessTitleImageText(routeIdentitySeed, liveBusinessProfile, rest),
          coverImages: Array.isArray(routeIdentitySeed?.coverImages)
            ? routeIdentitySeed.coverImages
            : (Array.isArray(liveBusinessProfile?.coverImages)
              ? liveBusinessProfile.coverImages
              : (Array.isArray(rest?.coverImages) ? rest.coverImages : [])),
          location: pickFirstText(routeIdentitySeed?.location, liveBusinessProfile?.location, rest?.city, rest?.address),
          followers: routeIdentitySeed?.followers ?? liveBusinessProfile?.followers ?? null,
          following: routeIdentitySeed?.following ?? liveBusinessProfile?.following ?? null,
          privateAccount: false,
          role: "business",
          restaurantId: routeSeedCanonicalRestaurantId || targetMenuRestaurantId || targetRestaurantLookupId || routeSnapshotRestaurantId,
          canonicalRestaurantId: routeSeedCanonicalRestaurantId,
          ...resolveCanonicalBusinessRouteFields(
            routeIdentitySeed?.publicSlug,
            routeIdentitySeed?.landingSlug,
            rest?.publicSlug,
            rest?.landingSlug,
            rest?.handle,
            targetRestaurantLookupId
          ),
          pendingFollowRequest: liveBusinessProfile?.pendingFollowRequest === true,
          posts: routeSeedPosts
        }, {
          identityStatus: routeIdentityState === "seeded" ? "ready" : "loading",
          postsStatus: (routePostsState === "seeded" && routeSeedPosts.length > 0)
            ? "ready"
            : (routePostsState === "knownEmpty" ? "empty" : "loading")
        })
        : null;
      const stableBusinessProfile = liveBusinessProfile || routeSeedProfile;
      const stableBusinessPosts = liveBusinessProfile
        ? liveBusinessPosts
        : routeSeedPosts;
      if (routeSnapshotSeed && targetMenuRestaurantId) {
        if (effectiveRouteMenuState === "seeded") {
          state.menu = {
            ...state.menu,
            restaurantId: targetMenuRestaurantId,
            items: routeMenuSeed,
            loading: false,
            error: "",
            source: "public",
            statusBadgeVisible: routeSnapshotSeed?.menu?.statusBadgeVisible !== false,
            routeSeed: true,
            truthState: "seeded"
          };
        } else if (effectiveRouteMenuState === "knownEmpty") {
          state.menu = {
            ...state.menu,
            restaurantId: targetMenuRestaurantId,
            items: [],
            loading: false,
            error: "",
            source: "public",
            statusBadgeVisible: routeSnapshotSeed?.menu?.statusBadgeVisible !== false,
            routeSeed: false,
            truthState: "knownEmpty"
          };
        } else {
          const existingMenuTruth = String(state.menu?.truthState || "").trim().toLowerCase();
          const hasKnownMenuTruth = String(state.menu?.restaurantId || "").trim() === targetMenuRestaurantId
            && String(state.menu?.source || "").trim().toLowerCase() === "public"
            && (existingMenuTruth === "seeded" || existingMenuTruth === "knownempty" || existingMenuTruth === "known-empty");
          if (hasKnownMenuTruth) {
            effectiveRouteMenuState = existingMenuTruth === "seeded" ? "seeded" : "knownEmpty";
          }
          state.menu = {
            ...state.menu,
            restaurantId: targetMenuRestaurantId,
            items: Array.isArray(state.menu?.items)
              && String(state.menu?.restaurantId || "").trim() === targetMenuRestaurantId
              && String(state.menu?.source || "").trim().toLowerCase() === "public"
              ? state.menu.items
              : [],
            loading: hasKnownMenuTruth ? false : true,
            error: "",
            source: "public",
            routeSeed: hasKnownMenuTruth ? state.menu.routeSeed === true : false,
            truthState: hasKnownMenuTruth
              ? (existingMenuTruth === "seeded" ? "seeded" : "knownEmpty")
              : "unknown"
          };
        }
        if (effectiveRouteFocusState === "seeded") {
          state.focus = {
            ...state.focus,
            restaurantId: targetMenuRestaurantId,
            items: routeFocusSeed,
            enabled: routeSnapshotSeed?.focus?.enabled !== false,
            loading: false,
            error: "",
            index: 0,
            truthState: "seeded"
          };
        } else if (effectiveRouteFocusState === "knownEmpty") {
          state.focus = {
            ...state.focus,
            restaurantId: targetMenuRestaurantId,
            items: [],
            enabled: routeSnapshotSeed?.focus?.enabled !== false,
            loading: false,
            error: "",
            index: 0,
            truthState: "knownEmpty"
          };
        } else {
          const existingFocusTruth = String(state.focus?.truthState || "").trim().toLowerCase();
          const publicMenuHasItemsForFocus = String(state.menu?.restaurantId || "").trim() === targetMenuRestaurantId
            && String(state.menu?.source || "").trim().toLowerCase() === "public"
            && String(state.menu?.truthState || "").trim().toLowerCase() === "seeded"
            && Array.isArray(state.menu?.items)
            && state.menu.items.length > 0;
          const hasKnownFocusTruth = String(state.focus?.restaurantId || "").trim() === targetMenuRestaurantId
            && publicMenuHasItemsForFocus
            && String(state.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
            && (existingFocusTruth === "seeded" || existingFocusTruth === "knownempty" || existingFocusTruth === "known-empty");
          if (hasKnownFocusTruth) {
            effectiveRouteFocusState = existingFocusTruth === "seeded" ? "seeded" : "knownEmpty";
          }
          state.focus = {
            ...state.focus,
            restaurantId: targetMenuRestaurantId,
            items: Array.isArray(state.focus?.items)
              && String(state.focus?.restaurantId || "").trim() === targetMenuRestaurantId
              && publicMenuHasItemsForFocus
              && String(state.focus?.truthSource || "").trim().toLowerCase() === "public-menu"
              ? state.focus.items
              : [],
            enabled: routeSnapshotSeed?.focus?.enabled !== false,
            loading: hasKnownFocusTruth ? false : true,
            error: "",
            truthState: hasKnownFocusTruth
              ? (existingFocusTruth === "seeded" ? "seeded" : "knownEmpty")
              : "unknown"
          };
        }
        const routeLayoutColor = String(routeSnapshotSeed?.layout?.menuCardColor || "").trim().toLowerCase();
        if (routeLayoutColor && String(state?.menuLayout?.cardColor || "").trim().toLowerCase() !== routeLayoutColor) {
          state.menuLayout = {
            ...(state?.menuLayout || {}),
            cardColor: routeLayoutColor
          };
        }
      }
      if (isMenuTopTab && targetMenuRestaurantId) {
        const skipFirstVisibleMenuEnsure = false;
        const skipFirstVisibleFocusEnsure = false;
        if (isWebRoutePriorityPath) {
          Promise.resolve().then(() => {
            const ensureCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
              targetCanonicalRestaurantId,
              routeSeedCanonicalRestaurantId,
              routeSnapshotRestaurantId
            );
            if (!skipFirstVisibleMenuEnsure) {
              ensureMenuData({
                restaurantId: targetMenuRestaurantId,
                canonicalRestaurantId: ensureCanonicalRestaurantId
              });
            }
            if (!skipFirstVisibleFocusEnsure) {
              ensureFocusData({
                restaurantId: targetMenuRestaurantId,
                canonicalRestaurantId: ensureCanonicalRestaurantId
              });
            }
          });
        } else {
          const ensureCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
            targetCanonicalRestaurantId,
            routeSeedCanonicalRestaurantId,
            routeSnapshotRestaurantId
          );
          if (!skipFirstVisibleMenuEnsure) {
            ensureMenuData({
              restaurantId: targetMenuRestaurantId,
              canonicalRestaurantId: ensureCanonicalRestaurantId
            });
          }
          if (!skipFirstVisibleFocusEnsure) {
            ensureFocusData({
              restaurantId: targetMenuRestaurantId,
              canonicalRestaurantId: ensureCanonicalRestaurantId
            });
          }
        }
      }

      const loadingDisplayName = pickFirstText(
        stableBusinessProfile?.name,
        routeIdentitySeed?.name,
        resolveBusinessDisplayNameFallback({
          safeName,
          rest,
          lookupKey: targetRestaurantLookupId
        })
      );
      const loadingCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
        targetCanonicalRestaurantId,
        routeSeedCanonicalRestaurantId,
        routeSnapshotRestaurantId
      );

      const loadingProfile = {
        name: loadingDisplayName,
        handle: pickFirstText(stableBusinessProfile?.handle, rest?.handle),
        uid: pickFirstText(stableBusinessProfile?.uid),
        bio: pickFirstText(stableBusinessProfile?.bio, rest?.bio, rest?.description, "Profil wird geladen..."),
        avatar: pickFirstText(stableBusinessProfile?.avatar, rest?.logoUrl, rest?.logo, rest?.avatar),
        titleImageUrl: pickBusinessTitleImageText(stableBusinessProfile, routeIdentitySeed, rest),
        coverImageUrl: pickBusinessTitleImageText(stableBusinessProfile, routeIdentitySeed, rest),
        coverUrl: pickBusinessTitleImageText(stableBusinessProfile, routeIdentitySeed, rest),
        heroUrl: pickBusinessTitleImageText(stableBusinessProfile, routeIdentitySeed, rest),
        coverImages: Array.isArray(stableBusinessProfile?.coverImages)
          ? stableBusinessProfile.coverImages
          : (Array.isArray(routeIdentitySeed?.coverImages)
            ? routeIdentitySeed.coverImages
            : (Array.isArray(rest?.coverImages) ? rest.coverImages : [])),
        location: pickFirstText(stableBusinessProfile?.location, rest?.city, rest?.address),
        followers: stableBusinessProfile?.followers ?? null,
        following: stableBusinessProfile?.following ?? null,
        privateAccount: stableBusinessProfile?.privateAccount === true,
        role: "business",
        restaurantId: loadingCanonicalRestaurantId || targetMenuRestaurantId || targetRestaurantLookupId,
        canonicalRestaurantId: loadingCanonicalRestaurantId,
        ...resolveCanonicalBusinessRouteFields(
          stableBusinessProfile?.publicSlug,
          stableBusinessProfile?.landingSlug,
          routeIdentitySeed?.publicSlug,
          routeIdentitySeed?.landingSlug,
          rest?.publicSlug,
          rest?.landingSlug,
          rest?.handle,
          targetRestaurantLookupId
        ),
        pendingFollowRequest: stableBusinessProfile?.pendingFollowRequest === true,
        posts: stableBusinessPosts,
      };
      const loadingProfileWithSurfaceTruth = applySurfaceTruthPatch(loadingProfile, {
        identityStatus: routeIdentityState === "seeded"
          ? "ready"
          : resolveLoadingIdentityTruthState(stableBusinessProfile),
        postsStatus: stableBusinessPosts.length > 0
          ? "ready"
          : (effectiveRoutePostsState === "knownEmpty" ? "empty" : "loading")
      });
      const routeSnapshotPhaseReady = routeIdentityState === "seeded"
        && effectiveRoutePostsState !== "unknown"
        && effectiveRouteMenuState !== "unknown"
        && effectiveRouteFocusState !== "unknown";
      const loadingDirectEntry = buildDirectEntryMeta(
        routeSnapshotSeed
          ? (routeSnapshotPhaseReady ? "ready" : "loading")
          : "seeded"
      );

      showPublicProfileView(loadingProfileWithSurfaceTruth, loadingProfileWithSurfaceTruth.posts, {
        showBack,
        topTab: resolvedTopTab,
        contentTab: resolvedContentTab,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber,
        directEntry: loadingDirectEntry,
        routePayload: buildRoutePayloadMeta("seeded", {
          profile: loadingProfileWithSurfaceTruth,
          posts: loadingProfileWithSurfaceTruth.posts,
          directEntry: loadingDirectEntry
        })
      });

      const shouldWarmPublicMenuBundle = !!(loadingCanonicalRestaurantId || targetMenuRestaurantId)
        && !isLandingTopTab
        && safeMenuAccessSource !== "qr";
      if (shouldWarmPublicMenuBundle) {
        Promise.resolve().then(() => {
          const warmCanonicalRestaurantId = resolveCanonicalRestaurantIdCandidate(
            loadingCanonicalRestaurantId,
            targetCanonicalRestaurantId,
            targetMenuRestaurantId
          );
          const warmRestaurantId = warmCanonicalRestaurantId || targetMenuRestaurantId;
          if (!warmRestaurantId) return;
          ensureMenuData({
            ...loadingProfileWithSurfaceTruth,
            restaurantId: warmRestaurantId,
            canonicalRestaurantId: warmCanonicalRestaurantId || warmRestaurantId
          });
        });
      }

      const canShortCircuitNormalWebDirectMenuPath = isWebRoutePriorityPath
        && isMenuTopTab
        && safeMenuAccessSource !== "qr"
        && !!routeSnapshotSeed
        && routeIdentityState === "seeded"
        && !!loadingCanonicalRestaurantId;
      if (canShortCircuitNormalWebDirectMenuPath) {
        return;
      }

      const profileLookupRestaurantId = resolveCanonicalRestaurantIdCandidate(
        targetCanonicalRestaurantId,
        targetMenuRestaurantId,
        targetRestaurantLookupId
      );
      const profileSnapPromise = withTimeoutFallback(fetchBusinessProfile({
        restaurantId: profileLookupRestaurantId,
        restaurant: rest
      }), {
        timeoutMs: isWebRoutePriorityPath ? 1800 : 0,
        fallbackValue: null
      });
      let earlyPostsResult = null;
      const earlyPostsAcceptedRestaurantIds = new Set(
        [
          targetRestaurantLookupId,
          targetMenuRestaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      );
      if (isWebPostsFirstPath && earlyPostsPromise) {
        void earlyPostsPromise
          .then((result) => {
            earlyPostsResult = result;
            if (!result?.ok || !Array.isArray(result.posts) || !result.posts.length) return;
            const liveRestaurantId = String(
              state?.profileView?.profile?.canonicalRestaurantId
              || state?.profileView?.profile?.restaurantId
              || ""
            ).trim();
            if (
              state.activeTab !== "profile"
              || (liveRestaurantId && !earlyPostsAcceptedRestaurantIds.has(liveRestaurantId))
            ) {
              return;
            }
            const earlyPostsProfile = applySurfaceTruthPatch({
              ...loadingProfileWithSurfaceTruth,
              posts: result.posts
            }, {
              identityStatus: resolveLoadingIdentityTruthState(stableBusinessProfile),
              postsStatus: "ready"
            });
            const earlyPostsDirectEntry = buildDirectEntryMeta("ready");
            showPublicProfileView(earlyPostsProfile, result.posts, {
              showBack,
              topTab: resolvedTopTab,
              contentTab: resolvedContentTab,
              menuAccessSource: safeMenuAccessSource,
              tableNumber: safeTableNumber,
              directEntry: earlyPostsDirectEntry,
              routePayload: buildRoutePayloadMeta("ready", {
                profile: earlyPostsProfile,
                posts: result.posts,
                directEntry: earlyPostsDirectEntry
              })
            });
          })
          .catch(() => null);
      }
      const profileSnap = await profileSnapPromise;

      const resolvedDisplayName = resolveBusinessDisplayNameFallback({
        safeName,
        rest,
        lookupKey: targetRestaurantLookupId
      });

      const normalizedResolvedProfile = normalizeBusinessProfile({
        profileDoc: profileSnap,
        restaurant: rest,
        fallbackName: resolvedDisplayName,
        posts: []
      });
      const resolved = withCanonicalRestaurantId(applySurfaceTruthPatch({
        ...normalizedResolvedProfile,
        canonicalRestaurantId: resolveCanonicalRestaurantIdCandidate(
          normalizedResolvedProfile?.canonicalRestaurantId,
          normalizedResolvedProfile?.restaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId
        ),
        ...resolveCanonicalBusinessRouteFields(
          profileSnap?.data?.publicSlug,
          profileSnap?.data?.landingSlug,
          rest?.publicSlug,
          rest?.landingSlug,
          rest?.handle,
          targetRestaurantLookupId
        )
      }, {
        identityStatus: "ready",
        postsStatus: "loading"
      }));
      const resolvedProfileRestaurantId = String(
        resolved?.canonicalRestaurantId
        || resolved?.restaurantId
        || ""
      ).trim();
      const acceptedRestaurantIds = new Set(
        [
          targetRestaurantLookupId,
          targetMenuRestaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId,
          resolvedProfileRestaurantId
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      );
      const restaurantMatchesRouteTarget = (restaurantId = "") => {
        const safeRestaurantId = String(restaurantId || "").trim();
        if (!safeRestaurantId) return true;
        return acceptedRestaurantIds.has(safeRestaurantId);
      };

      if (state.activeTab !== "profile") return;
      const visibleRestaurantId = String(
        state?.profileView?.profile?.canonicalRestaurantId
        || state?.profileView?.profile?.restaurantId
        || ""
      ).trim();
      if (!restaurantMatchesRouteTarget(visibleRestaurantId)) return;
      const interimPosts = stableBusinessPosts.length
        ? stableBusinessPosts
        : [];
      const resolvedInterim = withCanonicalRestaurantId(applySurfaceTruthPatch({
        ...resolved,
        posts: interimPosts,
      }, {
        identityStatus: "ready",
        postsStatus: interimPosts.length > 0
          ? "ready"
          : (routePostsState === "knownEmpty" ? "empty" : "loading")
      }), resolvedProfileRestaurantId);
      const resolvedInterimDirectEntry = buildDirectEntryMeta(
        (isMenuTopTab || interimPosts.length > 0 || routePostsState === "knownEmpty") ? "ready" : "loading"
      );

      showPublicProfileView(resolvedInterim, interimPosts, {
        showBack,
        topTab: resolvedTopTab,
        contentTab: resolvedContentTab,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber,
        directEntry: resolvedInterimDirectEntry,
        routePayload: buildRoutePayloadMeta(resolvedInterimDirectEntry.phase, {
          profile: resolvedInterim,
          posts: interimPosts,
          directEntry: resolvedInterimDirectEntry
        })
      });

      const resolvedRestaurantId = String(
        resolvedProfileRestaurantId
        || targetCanonicalRestaurantId
        || targetMenuRestaurantId
        || targetRestaurantLookupId
        || ""
      ).trim();
      if (!resolvedRestaurantId) return;
      acceptedRestaurantIds.add(resolvedRestaurantId);
      let posts = null;
      let reusedInitialPostsForFinalProfile = false;
      const skipProfileResolveForPosts = !!resolveCanonicalRestaurantIdCandidate(
        resolvedProfileRestaurantId,
        targetCanonicalRestaurantId,
        routeSnapshotRestaurantId
      );
      const buildPostsSignature = (items = []) => (Array.isArray(items) ? items : [])
        .map((post) => [
          post?.id,
          post?.url,
          post?.caption,
          post?.createdAt?.seconds || post?.createdAt || ""
        ].map((value) => String(value || "").trim()).join(":"))
        .join("|");
      const canReuseEarlyPostsResult = (earlyResult = null) => {
        if (!earlyResult?.ok || !Array.isArray(earlyResult.posts)) return false;
        if (!earlyResult.posts.length) return earlyResult.initialPage !== true;
        const earlyRestaurantId = String(earlyPostsRestaurantId || "").trim();
        if (earlyRestaurantId && !restaurantMatchesRouteTarget(earlyRestaurantId)) return false;
        const firstPostRestaurantId = String(
          earlyResult.posts[0]?.restaurantId
          || earlyResult.posts[0]?.ownerId
          || earlyRestaurantId
          || ""
        ).trim();
        return !firstPostRestaurantId || restaurantMatchesRouteTarget(firstPostRestaurantId);
      };
      const deferPostsResolutionToVisiblePostsSurface = isMenuTopTab
        && isWebRoutePriorityPath
        && safeMenuAccessSource !== "qr";
      if (deferPostsResolutionToVisiblePostsSurface) {
        posts = Array.isArray(resolvedInterim.posts) ? resolvedInterim.posts : [];
      } else if (canReuseEarlyPostsResult(earlyPostsResult)) {
        posts = earlyPostsResult.posts;
        reusedInitialPostsForFinalProfile = earlyPostsResult.initialPage === true && earlyPostsResult.posts.length > 0;
      } else if (earlyPostsPromise) {
        const earlyResult = earlyPostsResult || await earlyPostsPromise;
        if (canReuseEarlyPostsResult(earlyResult)) {
          posts = earlyResult.posts;
          reusedInitialPostsForFinalProfile = earlyResult.initialPage === true && earlyResult.posts.length > 0;
        }
      }
      if (!Array.isArray(posts)) {
        posts = await loadBusinessPosts(resolvedRestaurantId, {
          skipProfileResolve: skipProfileResolveForPosts
        });
      }
      const latestRestaurantId = String(
        state?.profileView?.profile?.canonicalRestaurantId
        || state?.profileView?.profile?.restaurantId
        || ""
      ).trim();
      if (state.activeTab !== "profile") return;
      if (!restaurantMatchesRouteTarget(latestRestaurantId)) return;

      const resolvedPosts = Array.isArray(posts) ? posts : [];
      const resolvedPostsStatus = resolvedPosts.length > 0
        ? "ready"
        : (
          deferPostsResolutionToVisiblePostsSurface
            ? (routePostsState === "knownEmpty" ? "empty" : "loading")
            : "empty"
        );
      const resolvedWithPosts = withCanonicalRestaurantId(applySurfaceTruthPatch({
        ...resolved,
        posts: resolvedPosts,
      }, {
        identityStatus: "ready",
        postsStatus: resolvedPostsStatus
      }), resolvedRestaurantId);
      const resolvedReadyDirectEntry = buildDirectEntryMeta("ready");
      const safeLandingStep = Math.max(0, Number(state?.profileLandingStep || 0) || 0);
      if (isLandingTopTab && safeLandingStep < 2) {
        const liveView = state?.profileView;
        const liveProfile = liveView?.profile;
        const liveRestaurantId = String(
          liveProfile?.canonicalRestaurantId
          || liveProfile?.restaurantId
          || ""
        ).trim();
        if (liveView && liveProfile && (!liveRestaurantId || liveRestaurantId === resolvedRestaurantId)) {
          liveView.posts = resolvedWithPosts.posts;
          liveView.profile = withCanonicalRestaurantId(applySurfaceTruthPatch({
            ...liveProfile,
            posts: resolvedWithPosts.posts
          }, {
            identityStatus: "ready",
            postsStatus: resolvedPostsStatus
          }), resolvedRestaurantId);
        }
        return;
      }
      showPublicProfileView(resolvedWithPosts, resolvedWithPosts.posts, {
        showBack,
        topTab: resolvedTopTab,
        contentTab: resolvedContentTab,
        menuAccessSource: safeMenuAccessSource,
        tableNumber: safeTableNumber,
        directEntry: resolvedReadyDirectEntry,
        routePayload: buildRoutePayloadMeta("ready", {
          profile: resolvedWithPosts,
          posts: resolvedWithPosts.posts,
          directEntry: resolvedReadyDirectEntry
        })
      });
      if (reusedInitialPostsForFinalProfile && typeof setTimeout === "function") {
        setTimeout(() => {
          const liveView = state?.profileView;
          const liveProfile = liveView?.profile;
          const liveRestaurantId = String(
            liveProfile?.canonicalRestaurantId
            || liveProfile?.restaurantId
            || ""
          ).trim();
          if (state.activeTab !== "profile" || !liveRestaurantId || !restaurantMatchesRouteTarget(liveRestaurantId)) return;
          Promise.resolve(loadBusinessPosts(resolvedRestaurantId, {
            skipProfileResolve: skipProfileResolveForPosts
          }))
            .then((freshPosts) => {
              const nextPosts = Array.isArray(freshPosts) ? freshPosts : [];
              const currentView = state?.profileView;
              const currentProfile = currentView?.profile;
              const currentRestaurantId = String(
                currentProfile?.canonicalRestaurantId
                || currentProfile?.restaurantId
                || ""
              ).trim();
              if (state.activeTab !== "profile" || !currentRestaurantId || !restaurantMatchesRouteTarget(currentRestaurantId)) return;
              const currentPosts = Array.isArray(currentView?.posts) ? currentView.posts : [];
              if (buildPostsSignature(currentPosts) === buildPostsSignature(nextPosts)) return;
              const nextStatus = nextPosts.length ? "ready" : "empty";
              const nextProfile = withCanonicalRestaurantId(applySurfaceTruthPatch({
                ...(currentProfile || resolvedWithPosts),
                posts: nextPosts
              }, {
                identityStatus: "ready",
                postsStatus: nextStatus
              }), resolvedRestaurantId);
              const nextDirectEntry = currentView?.directEntry && typeof currentView.directEntry === "object"
                ? currentView.directEntry
                : resolvedReadyDirectEntry;
              showPublicProfileView(nextProfile, nextPosts, {
                showBack,
                topTab: state?.profileTopTab || resolvedTopTab,
                contentTab: state?.profileContentTab || resolvedContentTab,
                menuAccessSource: currentView?.menuAccessSource || safeMenuAccessSource,
                tableNumber: currentView?.tableNumber ?? safeTableNumber,
                directEntry: nextDirectEntry,
                routePayload: buildRoutePayloadMeta("ready", {
                  profile: nextProfile,
                  posts: nextPosts,
                  directEntry: nextDirectEntry
                })
              });
            })
            .catch(() => null);
        }, 1800);
      }
    } catch (err) {
      console.error(err);
      const liveView = state?.profileView;
      const liveProfile = liveView?.profile;
      const liveRestaurantId = String(liveProfile?.restaurantId || "").trim();
      const liveCanonicalRestaurantId = String(liveProfile?.canonicalRestaurantId || "").trim();
      const acceptedTargetRestaurantIds = new Set(
        [
          targetRestaurantLookupId,
          targetMenuRestaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId
        ]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      );
      const liveRestaurantMatchesTarget = (
        !liveRestaurantId && !liveCanonicalRestaurantId
      ) || (
        !!liveRestaurantId && acceptedTargetRestaurantIds.has(liveRestaurantId)
      ) || (
        !!liveCanonicalRestaurantId && acceptedTargetRestaurantIds.has(liveCanonicalRestaurantId)
      );
      if (
        liveView
        && liveProfile
        && liveRestaurantMatchesTarget
      ) {
        const livePosts = Array.isArray(liveView.posts) ? liveView.posts : [];
        const liveIdentityState = normalizeIdentityTruthState(
          liveProfile.identityTruthState,
          livePosts.length ? "ready" : "error"
        );
        const resolvedIdentityStatus = livePosts.length
          ? "ready"
          : (liveIdentityState === "ready" ? "ready" : "error");
        liveView.profile = withCanonicalRestaurantId(applySurfaceTruthPatch({
          ...liveProfile,
          posts: livePosts
        }, {
          identityStatus: resolvedIdentityStatus,
          postsStatus: livePosts.length ? "ready" : "error"
        }), resolveCanonicalRestaurantIdCandidate(
          liveCanonicalRestaurantId,
          targetCanonicalRestaurantId,
          routeSnapshotRestaurantId
        ));
        renderApp();
      }
    }
  };

  const isOwnUserTarget = ({ uid = "", handle = "" } = {}) => {
    const targetUid = String(uid || "").trim();
    const selfUid = String(state?.user?.uid || state?.userProfile?.uid || "").trim();
    if (targetUid && selfUid && targetUid === selfUid) return true;
    const normalizeHandleValue = (value = "") => String(value || "").replace(/^@/, "").trim().toLowerCase();
    const targetHandle = normalizeHandleValue(handle);
    if (!targetHandle) return false;
    const selfHandle = normalizeHandleValue(state?.userProfile?.handle || state?.userProfile?.name || "");
    return !!selfHandle && selfHandle === targetHandle;
  };

  const openOwnUserProfile = ({ showBack = true } = {}) => {
    const prevTab = state?.activeTab || "feed";
    queueProfileHistoryPush({
      showBack,
      previousTab: prevTab,
      sameTarget: !state.profileView
    });
    state.profileView = null;
    state.profileModal = { open: false, profile: null };
    state.profileContentTab = "posts";
    state.profileTopTab = "profile";
    state.profileViewMode = "grid";
    state.profilePostMenuId = null;
    state.drawerOpen = false;
    state.activeTab = "profile";
    state.profileBackTab = showBack ? prevTab : "";
    renderApp();
  };

  const normalizeRouteUserContentTab = (value = "") => {
    const key = String(value || "").trim().toLowerCase();
    return key === "media" ? "media" : "posts";
  };

  const isLikelyOpaqueUserUid = (value = "") => {
    const raw = String(value || "").trim();
    if (!raw || /\s|\./.test(raw)) return false;
    const compact = raw.replace(/[-_]/g, "");
    if (!compact) return false;
    if (/^[A-Za-z0-9]{20,}$/i.test(raw)) return true;
    if (/^[a-f0-9]{16,}$/i.test(compact)) return true;
    const digits = (compact.match(/\d/g) || []).length;
    return compact.length >= 16 && digits >= 4;
  };

  const openProfileFromUser = async (input, {
    showBack = true,
    contentTab = "",
    directEntry = null
  } = {}) => {
    let targetUid = "";
    let targetHandle = "";
    let targetRouteId = "";
    try {
      const safeInput = input && typeof input === "object" ? input : {};
      const routeId = String(
        typeof input === "string"
          ? input
          : (
            safeInput.routeId
            || safeInput.id
            || safeInput.uid
            || safeInput.handle
            || safeInput.name
            || ""
          )
      ).replace(/^@/, "").trim();
      const explicitUid = String(typeof input === "string" ? "" : (safeInput.uid || "")).trim();
      const explicitHandle = String(typeof input === "string" ? "" : (safeInput.handle || safeInput.name || "")).replace(/^@/, "").trim();
      const safeContentTab = normalizeRouteUserContentTab(contentTab);
      const explicitDirectEntry = directEntry && typeof directEntry === "object" ? directEntry : null;
      const isDirectRouteRequest = showBack === false || !!explicitDirectEntry;
      const buildUserDirectEntry = (phase = "loading") => {
        if (!isDirectRouteRequest) return null;
        return {
          ...(explicitDirectEntry || {}),
          active: true,
          source: "route",
          owner: String(explicitDirectEntry?.owner || "web-direct").trim().toLowerCase() || "web-direct",
          routeFirst: explicitDirectEntry?.routeFirst === true || showBack === false,
          webPriority: explicitDirectEntry?.webPriority === true || showBack === false,
          menuFirst: false,
          postsFirst: safeContentTab !== "media",
          phase,
          topTab: "profile",
          contentTab: safeContentTab,
          explicitLanding: false
        };
      };

      targetUid = explicitUid;
      targetHandle = explicitHandle;
      targetRouteId = routeId;
      if (!explicitUid && !explicitHandle && !routeId) return;
      if (!isDirectRouteRequest && isOwnUserTarget({ uid: explicitUid || routeId, handle: explicitHandle || routeId })) {
        openOwnUserProfile({ showBack });
        return;
      }
      queueProfileHistoryPush({
        showBack,
        previousTab: state?.activeTab || "feed",
        sameTarget: isSameUserProfileTarget(state?.profileView?.profile, {
          uid: explicitUid || routeId,
          handle: explicitHandle || routeId
        })
      });

      const cacheKey = explicitUid || explicitHandle || routeId;
      const cached = userProfileCacheMap.get(cacheKey);
      if (cached) {
        cached.pendingFollowRequest = await checkPendingFollowRequest(cached.uid || explicitUid || "");
        const cachedPosts = Array.isArray(cached.posts) ? cached.posts : [];
        const cachedTruthState = String(cached.truthState || "").trim().toLowerCase();
        const cachedPostsStatus = cachedPosts.length
          ? "ready"
          : (cached.postsLoaded === true ? (cachedTruthState === "error" ? "error" : "empty") : "loading");
        Object.assign(cached, applySurfaceTruthPatch({
          ...cached,
          posts: cachedPosts
        }, {
          identityStatus: normalizeIdentityTruthState(cached.identityTruthState, "ready"),
          postsStatus: cachedPostsStatus
        }));
        showPublicProfileView(cached, cached.posts || [], {
          showBack,
          topTab: "profile",
          contentTab: safeContentTab,
          directEntry: buildUserDirectEntry(cachedPosts.length ? "ready" : "loading")
        });
        return;
      }
      const liveView = state?.profileView;
      const liveProfile = liveView?.profile && typeof liveView.profile === "object"
        ? liveView.profile
        : null;
      const stableUserProfile = isSameUserProfileTarget(liveProfile, {
        uid: explicitUid || routeId,
        handle: explicitHandle || routeId
      })
        ? liveProfile
        : null;
      const stableUserPosts = stableUserProfile && Array.isArray(liveView?.posts)
        ? liveView.posts
        : [];

      const fallbackProfile = normalizeExternalUserProfileFn({
        userDoc: null,
        fallback: stableUserProfile || safeInput || { uid: explicitUid, handle: explicitHandle || routeId, routeId },
        posts: stableUserPosts
      });
      fallbackProfile.pendingFollowRequest = await checkPendingFollowRequest(fallbackProfile.uid || explicitUid || "");
      const fallbackProfileWithSurfaceTruth = applySurfaceTruthPatch({
        ...fallbackProfile,
        posts: stableUserPosts
      }, {
        identityStatus: resolveLoadingIdentityTruthState(stableUserProfile),
        postsStatus: stableUserPosts.length > 0 ? "ready" : "loading"
      });
      showPublicProfileView(fallbackProfileWithSurfaceTruth, stableUserPosts, {
        showBack,
        topTab: "profile",
        contentTab: safeContentTab,
        directEntry: buildUserDirectEntry(stableUserPosts.length ? "ready" : "loading")
      });

      let userDoc = null;
      const tryResolveByUid = async (uidValue = "") => {
        const safeUid = String(uidValue || "").trim();
        if (!safeUid) return null;
        const snap = await fetchUserByUid(safeUid);
        if (snap?.exists?.()) userDoc = snap;
        return userDoc;
      };
      const tryResolveByHandle = async (handleValue = "") => {
        const safeHandle = String(handleValue || "").replace(/^@/, "").trim();
        if (!safeHandle) return null;
        const resolved = await resolveUserByHandleFn(safeHandle);
        if (resolved?.id) userDoc = { id: resolved.id, data: resolved.data };
        return userDoc;
      };

      if (explicitUid) {
        await tryResolveByUid(explicitUid);
      }
      if (!userDoc && explicitHandle) {
        await tryResolveByHandle(explicitHandle);
      }
      if (!userDoc && routeId) {
        if (isLikelyOpaqueUserUid(routeId)) {
          await tryResolveByUid(routeId);
          if (!userDoc) await tryResolveByHandle(routeId);
        } else {
          await tryResolveByHandle(routeId);
          if (!userDoc) await tryResolveByUid(routeId);
        }
      }

      if (!userDoc) {
        if (state.activeTab === "profile") {
          const liveView = state?.profileView;
          const liveProfile = liveView?.profile;
          if (liveView && liveProfile && isSameUserProfileTarget(liveProfile, {
            uid: explicitUid || routeId,
            handle: explicitHandle || routeId
          })) {
            liveView.profile = applySurfaceTruthPatch({
              ...liveProfile,
              posts: []
            }, {
              identityStatus: normalizeIdentityTruthState(liveProfile.identityTruthState, "error"),
              postsStatus: "error"
            });
            liveView.posts = [];
            renderApp();
          }
        }
        return;
      }
      const posts = await loadUserPosts(userDoc.id);
      const resolvedProfile = normalizeExternalUserProfileFn({
        userDoc,
        fallback: safeInput || { uid: explicitUid, handle: explicitHandle || routeId, routeId },
        posts
      });
      resolvedProfile.pendingFollowRequest = await checkPendingFollowRequest(resolvedProfile.uid || "");
      Object.assign(resolvedProfile, applySurfaceTruthPatch(resolvedProfile, {
        identityStatus: "ready",
        postsStatus: Array.isArray(posts) && posts.length > 0 ? "ready" : "empty"
      }));
      userProfileCacheMap.set(cacheKey, resolvedProfile);
      if (state.activeTab !== "profile") return;
      if (explicitUid && state.profileView?.profile?.uid !== explicitUid) return;
      showPublicProfileView(resolvedProfile, resolvedProfile.posts, {
        showBack,
        topTab: "profile",
        contentTab: safeContentTab,
        directEntry: buildUserDirectEntry("ready")
      });
    } catch (err) {
      console.error(err);
      if (state.activeTab === "profile") {
        const liveView = state?.profileView;
        const liveProfile = liveView?.profile;
        if (liveView && liveProfile && isSameUserProfileTarget(liveProfile, {
          uid: targetUid || targetRouteId,
          handle: targetHandle || targetRouteId
        })) {
          const livePosts = Array.isArray(liveView.posts) ? liveView.posts : [];
          liveView.profile = applySurfaceTruthPatch({
            ...liveProfile,
            posts: livePosts
          }, {
            identityStatus: normalizeIdentityTruthState(liveProfile.identityTruthState, livePosts.length ? "ready" : "error"),
            postsStatus: livePosts.length ? "ready" : "error"
          });
          renderApp();
        }
      }
    }
  };

  return {
    isOwnBusinessTarget,
    openOwnBusinessProfile,
    openProfileViewFromBusiness,
    openProfileFromUser
  };
}
