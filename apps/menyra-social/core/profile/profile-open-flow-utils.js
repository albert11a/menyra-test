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
        row?.landingSlug || row?.handle || row?.name || row?.restaurantName || ""
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
    try {
      const safeName = String(typeof input === "string" ? input : input?.name || "").trim();
      const restaurantId = String(typeof input === "string" ? "" : (input?.id || "")).trim();
      const lookupText = String(
        typeof input === "string"
          ? input
          : (input?.landingSlug || input?.handle || input?.id || input?.name || "")
      ).trim();
      if (!safeName && !restaurantId && !lookupText) return;
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

      const rest = resolveRestaurantByLookup({ restaurantId, lookupText })
        || (restaurantId ? { id: restaurantId } : {});
      targetRestaurantLookupId = String(restaurantId || rest?.id || lookupText || "").trim();
      targetMenuRestaurantId = String(restaurantId || rest?.id || "").trim();
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
        const safeRestaurantId = String(
          safeProfile.restaurantId
          || targetMenuRestaurantId
          || targetRestaurantLookupId
          || ""
        ).trim();
        const menu = state?.menu || {};
        const menuCount = String(menu.restaurantId || "").trim() === safeRestaurantId && Array.isArray(menu.items)
          ? menu.items.length
          : 0;
        const directMeta = directEntry && typeof directEntry === "object"
          ? directEntry
          : buildDirectEntryMeta(phase);
        return {
          owner: "web-direct",
          routeFirst: isDirectWebEntryRequest,
          restaurantId: safeRestaurantId,
          surface: resolvedTopTab === "menu" ? "menu" : "profile",
          topTab: resolvedTopTab,
          contentTab: resolvedContentTab,
          phase: String(directMeta?.phase || phase || "loading").trim().toLowerCase() || "loading",
          menuAccessSource: safeMenuAccessSource,
          tableNumber: safeTableNumber,
          identity: {
            name: String(safeProfile.name || "").trim(),
            handle: String(safeProfile.handle || "").trim(),
            avatar: String(safeProfile.avatar || "").trim(),
            location: String(safeProfile.location || "").trim(),
            followers: safeProfile.followers ?? null,
            following: safeProfile.following ?? null
          },
          posts: {
            count: safePosts.length,
            seeded: safePosts.length > 0
          },
          menu: {
            count: menuCount,
            seeded: menuCount > 0
          },
          layout: {
            menuCardColor: String(state?.menuLayout?.cardColor || "").trim().toLowerCase() || "white"
          },
          ts: Date.now()
        };
      };
      const prioritizePostsSurface = resolvedTopTab === "profile" && resolvedContentTab === "posts";
      const earlyPostsRestaurantId = String(targetMenuRestaurantId || "").trim();
      const earlyPostsPromise = prioritizePostsSurface && earlyPostsRestaurantId
        ? Promise.resolve(loadBusinessPosts(earlyPostsRestaurantId, { skipProfileResolve: true }))
          .then((rows) => ({
            ok: true,
            posts: Array.isArray(rows) ? rows : []
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
      const stableBusinessProfile = isSameBusinessProfileTarget(liveProfile, {
        restaurantId: targetMenuRestaurantId,
        lookupId: targetRestaurantLookupId
      })
        ? liveProfile
        : null;
      const stableBusinessPosts = stableBusinessProfile && Array.isArray(liveView?.posts)
        ? liveView.posts
        : [];
      if (isMenuTopTab && targetMenuRestaurantId) {
        if (isWebRoutePriorityPath) {
          Promise.resolve().then(() => {
            ensureMenuData({ restaurantId: targetMenuRestaurantId });
            ensureFocusData({ restaurantId: targetMenuRestaurantId });
          });
        } else {
          ensureMenuData({ restaurantId: targetMenuRestaurantId });
          ensureFocusData({ restaurantId: targetMenuRestaurantId });
        }
      }

      const loadingDisplayName = resolveBusinessDisplayNameFallback({
        safeName,
        rest,
        lookupKey: targetRestaurantLookupId
      });

      const loadingProfile = {
        name: loadingDisplayName,
        handle: pickFirstText(stableBusinessProfile?.handle, rest?.handle),
        uid: pickFirstText(stableBusinessProfile?.uid),
        bio: pickFirstText(stableBusinessProfile?.bio, rest?.bio, rest?.description, "Profil wird geladen..."),
        avatar: pickFirstText(stableBusinessProfile?.avatar, rest?.logoUrl, rest?.logo, rest?.avatar),
        location: pickFirstText(stableBusinessProfile?.location, rest?.city, rest?.address),
        followers: stableBusinessProfile?.followers ?? null,
        following: stableBusinessProfile?.following ?? null,
        privateAccount: stableBusinessProfile?.privateAccount === true,
        role: "business",
        restaurantId: targetMenuRestaurantId || targetRestaurantLookupId,
        pendingFollowRequest: stableBusinessProfile?.pendingFollowRequest === true,
        posts: stableBusinessPosts,
      };
      const loadingProfileWithSurfaceTruth = applySurfaceTruthPatch(loadingProfile, {
        identityStatus: resolveLoadingIdentityTruthState(stableBusinessProfile),
        // Canonical business profile request has started.
        postsStatus: stableBusinessPosts.length > 0 ? "ready" : "loading"
      });
      const loadingDirectEntry = buildDirectEntryMeta("seeded");

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

      const profileSnapPromise = withTimeoutFallback(fetchBusinessProfile({
        restaurantId: targetRestaurantLookupId,
        restaurant: rest
      }), {
        timeoutMs: isWebRoutePriorityPath ? 1800 : 0,
        fallbackValue: null
      });
      let earlyPostsResult = null;
      if (isWebPostsFirstPath && earlyPostsPromise) {
        void earlyPostsPromise
          .then((result) => {
            earlyPostsResult = result;
            if (!result?.ok || !Array.isArray(result.posts) || !result.posts.length) return;
            const liveRestaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
            if (
              state.activeTab !== "profile"
              || (liveRestaurantId && liveRestaurantId !== targetRestaurantLookupId && liveRestaurantId !== targetMenuRestaurantId)
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

      const resolved = applySurfaceTruthPatch(normalizeBusinessProfile({
        profileDoc: profileSnap,
        restaurant: rest,
        fallbackName: resolvedDisplayName,
        posts: []
      }), {
        identityStatus: "ready",
        postsStatus: "loading"
      });

      if (state.activeTab !== "profile") return;
      const visibleRestaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
      if (targetRestaurantLookupId && visibleRestaurantId && visibleRestaurantId !== targetRestaurantLookupId && visibleRestaurantId !== targetMenuRestaurantId) return;
      const interimPosts = stableBusinessPosts.length
        ? stableBusinessPosts
        : [];
      const resolvedInterim = applySurfaceTruthPatch({
        ...resolved,
        posts: interimPosts,
      }, {
        identityStatus: "ready",
        postsStatus: interimPosts.length > 0 ? "ready" : "loading"
      });
      const resolvedInterimDirectEntry = buildDirectEntryMeta(
        isMenuTopTab || interimPosts.length > 0 ? "ready" : "loading"
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
        resolved?.restaurantId
        || targetMenuRestaurantId
        || targetRestaurantLookupId
        || ""
      ).trim();
      if (!resolvedRestaurantId) return;
      let posts = null;
      if (isMenuTopTab && isWebRoutePriorityPath) {
        posts = Array.isArray(resolvedInterim.posts) ? resolvedInterim.posts : [];
      } else if (earlyPostsResult?.ok && earlyPostsRestaurantId && earlyPostsRestaurantId === resolvedRestaurantId) {
        posts = earlyPostsResult.posts;
      } else if (earlyPostsPromise) {
        const earlyResult = earlyPostsResult || await earlyPostsPromise;
        if (earlyResult?.ok && earlyPostsRestaurantId && earlyPostsRestaurantId === resolvedRestaurantId) {
          posts = earlyResult.posts;
        }
      }
      if (!Array.isArray(posts)) {
        posts = await loadBusinessPosts(resolvedRestaurantId, { skipProfileResolve: true });
      }
      const latestRestaurantId = String(state?.profileView?.profile?.restaurantId || "").trim();
      if (state.activeTab !== "profile") return;
      if (
        latestRestaurantId
        && latestRestaurantId !== resolvedRestaurantId
        && latestRestaurantId !== targetRestaurantLookupId
        && latestRestaurantId !== targetMenuRestaurantId
      ) {
        return;
      }

      const resolvedWithPosts = applySurfaceTruthPatch({
        ...resolved,
        posts: Array.isArray(posts) ? posts : [],
      }, {
        identityStatus: "ready",
        postsStatus: Array.isArray(posts) && posts.length > 0 ? "ready" : "empty"
      });
      const resolvedReadyDirectEntry = buildDirectEntryMeta("ready");
      const safeLandingStep = Math.max(0, Number(state?.profileLandingStep || 0) || 0);
      if (isLandingTopTab && safeLandingStep < 2) {
        const liveView = state?.profileView;
        const liveProfile = liveView?.profile;
        const liveRestaurantId = String(liveProfile?.restaurantId || "").trim();
        if (liveView && liveProfile && (!liveRestaurantId || liveRestaurantId === resolvedRestaurantId)) {
          liveView.posts = resolvedWithPosts.posts;
          liveView.profile = applySurfaceTruthPatch({
            ...liveProfile,
            posts: resolvedWithPosts.posts
          }, {
            identityStatus: "ready",
            postsStatus: resolvedWithPosts.posts.length > 0 ? "ready" : "empty"
          });
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
    } catch (err) {
      console.error(err);
      const liveView = state?.profileView;
      const liveProfile = liveView?.profile;
      const liveRestaurantId = String(liveProfile?.restaurantId || "").trim();
      if (
        liveView
        && liveProfile
        && (
          !liveRestaurantId
          || liveRestaurantId === String(targetRestaurantLookupId || "").trim()
          || liveRestaurantId === String(targetMenuRestaurantId || "").trim()
        )
      ) {
        const livePosts = Array.isArray(liveView.posts) ? liveView.posts : [];
        const liveIdentityState = normalizeIdentityTruthState(
          liveProfile.identityTruthState,
          livePosts.length ? "ready" : "error"
        );
        const resolvedIdentityStatus = livePosts.length
          ? "ready"
          : (liveIdentityState === "ready" ? "ready" : "error");
        liveView.profile = applySurfaceTruthPatch({
          ...liveProfile,
          posts: livePosts
        }, {
          identityStatus: resolvedIdentityStatus,
          postsStatus: livePosts.length ? "ready" : "error"
        });
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

  const openProfileFromUser = async (input) => {
    if (!state?.user) {
      openGuestAuth("Bitte einloggen, um User-Profile zu sehen.");
      return;
    }
    let targetUid = "";
    let targetHandle = "";
    try {
      const uid = typeof input === "string" ? input : (input?.uid || "");
      const handle = String(typeof input === "string" ? "" : (input?.handle || input?.name || "")).replace(/^@/, "");
      targetUid = uid;
      targetHandle = handle;
      if (!uid && !handle) return;
      if (isOwnUserTarget({ uid, handle })) {
        openOwnUserProfile({ showBack: true });
        return;
      }

      const cacheKey = uid || handle;
      const cached = userProfileCacheMap.get(cacheKey);
      if (cached) {
        cached.pendingFollowRequest = await checkPendingFollowRequest(cached.uid || uid || "");
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
        showPublicProfileView(cached, cached.posts || []);
        return;
      }
      const liveView = state?.profileView;
      const liveProfile = liveView?.profile && typeof liveView.profile === "object"
        ? liveView.profile
        : null;
      const stableUserProfile = isSameUserProfileTarget(liveProfile, { uid, handle })
        ? liveProfile
        : null;
      const stableUserPosts = stableUserProfile && Array.isArray(liveView?.posts)
        ? liveView.posts
        : [];

      const fallbackProfile = normalizeExternalUserProfileFn({
        userDoc: null,
        fallback: stableUserProfile || input || {},
        posts: stableUserPosts
      });
      fallbackProfile.pendingFollowRequest = await checkPendingFollowRequest(fallbackProfile.uid || uid || "");
      const fallbackProfileWithSurfaceTruth = applySurfaceTruthPatch({
        ...fallbackProfile,
        posts: stableUserPosts
      }, {
        identityStatus: resolveLoadingIdentityTruthState(stableUserProfile),
        postsStatus: stableUserPosts.length > 0 ? "ready" : "loading"
      });
      showPublicProfileView(fallbackProfileWithSurfaceTruth, stableUserPosts);

      let userDoc = null;
      if (uid) {
        const snap = await fetchUserByUid(uid);
        if (snap?.exists?.()) userDoc = snap;
      } else if (handle) {
        const resolved = await resolveUserByHandleFn(handle);
        if (resolved?.id) userDoc = { id: resolved.id, data: resolved.data };
      }

      if (!userDoc) {
        if (state.activeTab === "profile") {
          const liveView = state?.profileView;
          const liveProfile = liveView?.profile;
          if (liveView && liveProfile && isSameUserProfileTarget(liveProfile, { uid, handle })) {
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
        fallback: input || {},
        posts
      });
      resolvedProfile.pendingFollowRequest = await checkPendingFollowRequest(resolvedProfile.uid || "");
      Object.assign(resolvedProfile, applySurfaceTruthPatch(resolvedProfile, {
        identityStatus: "ready",
        postsStatus: Array.isArray(posts) && posts.length > 0 ? "ready" : "empty"
      }));
      userProfileCacheMap.set(cacheKey, resolvedProfile);
      if (state.activeTab !== "profile") return;
      if (uid && state.profileView?.profile?.uid !== uid) return;
      showPublicProfileView(resolvedProfile, resolvedProfile.posts);
    } catch (err) {
      console.error(err);
      if (state.activeTab === "profile") {
        const liveView = state?.profileView;
        const liveProfile = liveView?.profile;
        if (liveView && liveProfile && isSameUserProfileTarget(liveProfile, { uid: targetUid, handle: targetHandle })) {
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
