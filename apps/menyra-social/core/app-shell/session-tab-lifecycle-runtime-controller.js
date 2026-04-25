import { ensureTabDataCore } from "../auth/tab-auth-load-utils.js";

export function createSessionTabLifecycleRuntimeController({
  state = null,
  dataLoaded = null,
  FAST_MODE = false,
  sanitizeTabForSession = (tab) => tab,
  renderFn = () => {},
  stopRestaurantsListenerFn = () => {},
  startChatThreadsListenerFn = () => {},
  stopChatThreadsListenerFn = () => {},
  stopActiveChatMessagesListenerFn = () => {},
  startOrdersListenerFn = () => {},
  stopOrdersListenerFn = () => {},
  stopRestaurantMetaListenersFn = () => {},
  clearIntervalFn = () => {},
  isCeoUserFn = () => false,
  queueCrmLazyRenderersPrefetchFn = () => {},
  loadFeedPostsFn = async () => {},
  scheduleIdleFn = (fn) => fn?.(),
  loadRestaurantsFn = async () => {},
  isLocalBusinessProfileFn = () => false,
  loadUserPostsFn = async () => {},
  loadBusinessPostsFn = async () => {},
  loadAuthProfileFn = async () => {},
  loadMenuForRestaurantFn = async () => {},
  loadFocusForRestaurantFn = async () => {},
  getNotificationsUnsubFn = () => null,
  updateNotificationsDomFn = () => false,
  loadNotificationsFromFirebaseFn = async () => [],
  stopNotificationsListenerFn = () => {},
  syncNotificationsPushRuntimeFn = async () => false,
  startFollowingListenerFn = () => {},
  stopFollowingListenerFn = () => {},
  attachCurrentUserProfileListenerFn = () => {},
  stopCurrentUserProfileListenerFn = () => {},
  stopProfileViewListenerFn = () => {},
  normalizeLeadScopeKeyFn = (value) => value,
  loadLeadsFn = async () => {},
  normalizeCustomerScopeKeyFn = (value) => value,
  loadCustomersFn = async () => {},
  loadCeoStaffFn = async () => {},
  loadBusinessAccountsFn = async () => {},
  stopExtraLiveListenersFn = () => {}
} = {}) {
  let feedDeltaTimer = null;
  let feedUnsub = null;
  let storiesUnsub = null;
  let preloadProfilePromise = null;
  let preloadMenuPromise = null;

  function reportPreloadWarning(scope = "tab-preload", err = null) {
    const safeScope = String(scope || "tab-preload").trim() || "tab-preload";
    if (err) {
      console.warn(`[mnyra][${safeScope}]`, err);
      return;
    }
    console.warn(`[mnyra][${safeScope}] operation failed`);
  }

  function capturePreloadNavigation() {
    if (!state) return null;
    return {
      activeTab: String(state.activeTab || "").trim(),
      profileTopTab: String(state.profileTopTab || "").trim(),
      profileContentTab: String(state.profileContentTab || "").trim()
    };
  }

  function restorePreloadNavigation(snapshot = null) {
    if (!state || !snapshot) return;
    const beforeTab = String(snapshot.activeTab || "").trim();
    const currentTab = String(state.activeTab || "").trim();
    if (!beforeTab || beforeTab === "profile" || currentTab !== "profile") return;
    state.activeTab = beforeTab;
    if (snapshot.profileTopTab) {
      state.profileTopTab = snapshot.profileTopTab;
    }
    if (snapshot.profileContentTab) {
      state.profileContentTab = snapshot.profileContentTab;
    }
  }

  function renderAfterPreload(scope = "tab-preload", navigationSnapshot = null) {
    try {
      restorePreloadNavigation(navigationSnapshot);
      renderFn();
    } catch (err) {
      reportPreloadWarning(`${scope}.render`, err);
    }
  }

  async function preloadProfileData() {
    if (!state?.user) return;
    if (preloadProfilePromise) return preloadProfilePromise;
    const navigationSnapshot = capturePreloadNavigation();
    preloadProfilePromise = (async () => {
      if (dataLoaded && typeof dataLoaded === "object") {
        dataLoaded.profile = true;
      }
      await loadAuthProfileFn(state.user);
      restorePreloadNavigation(navigationSnapshot);
      const hasBusinessProfile = isLocalBusinessProfileFn(state.userProfile);
      if (hasBusinessProfile) {
        await loadBusinessPostsFn();
        renderAfterPreload("auth-tab.preloadProfile.business", navigationSnapshot);
        return;
      }
      await loadUserPostsFn();
      renderAfterPreload("auth-tab.preloadProfile.user", navigationSnapshot);
    })().catch((err) => {
      reportPreloadWarning("auth-tab.preloadProfile", err);
    }).finally(() => {
      preloadProfilePromise = null;
    });
    return preloadProfilePromise;
  }

  async function preloadMenuData() {
    if (!state?.user) return;
    if (preloadMenuPromise) return preloadMenuPromise;
    const navigationSnapshot = capturePreloadNavigation();
    preloadMenuPromise = (async () => {
      await loadAuthProfileFn(state.user);
      restorePreloadNavigation(navigationSnapshot);
      const restaurantId = String(state.userProfile?.restaurantId || "").trim();
      if (!restaurantId) return;
      await Promise.all([
        loadMenuForRestaurantFn(restaurantId, { source: "collection" }),
        loadFocusForRestaurantFn(restaurantId)
      ]);
      renderAfterPreload("auth-tab.preloadMenu", navigationSnapshot);
    })().catch((err) => {
      reportPreloadWarning("auth-tab.preloadMenu", err);
    }).finally(() => {
      preloadMenuPromise = null;
    });
    return preloadMenuPromise;
  }

  async function preloadTabData(tab) {
    const safeTab = String(tab || "").trim().toLowerCase();
    if (safeTab === "profile") {
      return preloadProfileData();
    }
    if (safeTab === "menu") {
      return preloadMenuData();
    }
    return undefined;
  }

  async function ensureTabData(tab, options = {}) {
    const safeOptions = options && typeof options === "object" ? options : {};
    if (safeOptions.preloadOnly === true) {
      return preloadTabData(tab);
    }
    return ensureTabDataCore({
      tab,
      state,
      dataLoaded,
      FAST_MODE,
      sanitizeTabForSession,
      render: renderFn,
      stopRestaurantsListener: stopRestaurantsListenerFn,
      startChatThreadsListener: startChatThreadsListenerFn,
      stopChatThreadsListener: stopChatThreadsListenerFn,
      startOrdersListener: startOrdersListenerFn,
      stopOrdersListener: stopOrdersListenerFn,
      stopRestaurantMetaListeners: stopRestaurantMetaListenersFn,
      getFeedUnsubFn: () => feedUnsub,
      setFeedUnsubFn: (next) => {
        feedUnsub = typeof next === "function" ? next : null;
      },
      getStoriesUnsubFn: () => storiesUnsub,
      setStoriesUnsubFn: (next) => {
        storiesUnsub = typeof next === "function" ? next : null;
      },
      getFeedDeltaTimerFn: () => feedDeltaTimer,
      setFeedDeltaTimerFn: (next) => {
        feedDeltaTimer = next || null;
      },
      clearIntervalFn,
      isCeoUser: isCeoUserFn,
      queueCrmLazyRenderersPrefetch: queueCrmLazyRenderersPrefetchFn,
      loadFeedPosts: loadFeedPostsFn,
      scheduleIdle: scheduleIdleFn,
      loadRestaurants: loadRestaurantsFn,
      isLocalBusinessProfile: isLocalBusinessProfileFn,
      loadUserPosts: loadUserPostsFn,
      loadBusinessPosts: loadBusinessPostsFn,
      loadAuthProfile: loadAuthProfileFn,
      loadMenuForRestaurant: loadMenuForRestaurantFn,
      loadFocusForRestaurant: loadFocusForRestaurantFn,
      getNotificationsUnsubFn,
      updateNotificationsDom: updateNotificationsDomFn,
      loadNotificationsFromFirebase: loadNotificationsFromFirebaseFn,
      normalizeLeadScopeKey: normalizeLeadScopeKeyFn,
      loadLeads: loadLeadsFn,
      normalizeCustomerScopeKey: normalizeCustomerScopeKeyFn,
      loadCustomers: loadCustomersFn,
      loadCeoStaff: loadCeoStaffFn,
      loadBusinessAccounts: loadBusinessAccountsFn
    });
  }

  function stopLiveListeners() {
    stopChatThreadsListenerFn();
    stopActiveChatMessagesListenerFn();
    stopOrdersListenerFn();
    if (feedDeltaTimer) {
      clearIntervalFn(feedDeltaTimer);
      feedDeltaTimer = null;
    }
    stopNotificationsListenerFn();
    stopFollowingListenerFn();
    stopCurrentUserProfileListenerFn();
    stopProfileViewListenerFn();
    if (typeof feedUnsub === "function") {
      try { feedUnsub(); } catch {}
      feedUnsub = null;
    }
    if (typeof storiesUnsub === "function") {
      try { storiesUnsub(); } catch {}
      storiesUnsub = null;
    }
    stopRestaurantsListenerFn();
    try {
      stopExtraLiveListenersFn();
    } catch {}
  }

  function startLiveListeners(user = state?.user) {
    stopLiveListeners();
    if (!user) return;
    attachCurrentUserProfileListenerFn();
    startFollowingListenerFn(user);
    void syncNotificationsPushRuntimeFn({
      user,
      interactive: false,
      enabled: state?.settings?.pushNotifs
    });
  }

  return {
    ensureTabData,
    stopLiveListeners,
    startLiveListeners
  };
}
