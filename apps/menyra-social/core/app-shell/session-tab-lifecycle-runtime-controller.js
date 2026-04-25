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
  let liveChatThreadsUid = "";
  let shellWarmUid = "";

  function reportPreloadWarning(scope = "tab-preload", err = null) {
    const safeScope = String(scope || "tab-preload").trim() || "tab-preload";
    if (err) {
      console.warn(`[mnyra][${safeScope}]`, err);
      return;
    }
    console.warn(`[mnyra][${safeScope}] operation failed`);
  }

  function runShellWarmTask(scope = "shell-warm", task = null) {
    try {
      const pending = typeof task === "function" ? task() : null;
      if (pending && typeof pending.then === "function") {
        pending.catch((err) => {
          reportPreloadWarning(scope, err);
        });
      }
    } catch (err) {
      reportPreloadWarning(scope, err);
    }
  }

  function ensureChatThreadsLive(user = state?.user) {
    const uid = String(user?.uid || "").trim();
    if (!uid) {
      liveChatThreadsUid = "";
      stopChatThreadsListenerFn();
      return;
    }
    if (liveChatThreadsUid === uid) return;
    liveChatThreadsUid = uid;
    startChatThreadsListenerFn(user);
  }

  function warmAuthenticatedShellData(user = state?.user) {
    const uid = String(user?.uid || "").trim();
    if (!uid || shellWarmUid === uid) return;
    shellWarmUid = uid;

    ensureChatThreadsLive(user);

    // Badges and role-specific surfaces must begin loading as soon as the
    // authenticated shell exists, not only after the user taps those tabs.
    runShellWarmTask("auth-shell.notifications.fetch", () => loadNotificationsFromFirebaseFn({ force: true }));

    if (isCeoUserFn()) {
      queueCrmLazyRenderersPrefetchFn();
      runShellWarmTask("auth-shell.leads.preload", () => loadLeadsFn({ scope: state?.leads?.scope }));
      runShellWarmTask("auth-shell.customers.preload", () => loadCustomersFn({ scope: state?.customers?.scope }));
      runShellWarmTask("auth-shell.staff.preload", () => loadCeoStaffFn());
    }

    if (isLocalBusinessProfileFn(state?.userProfile)) {
      const restaurantId = String(state?.userProfile?.restaurantId || "").trim();
      runShellWarmTask("auth-shell.business.posts.preload", () => loadBusinessPostsFn());
      runShellWarmTask("auth-shell.business.accounts.preload", () => loadBusinessAccountsFn());
      if (restaurantId) {
        runShellWarmTask("auth-shell.business.menu.preload", () => loadMenuForRestaurantFn(restaurantId, { source: "collection" }));
        runShellWarmTask("auth-shell.business.focus.preload", () => loadFocusForRestaurantFn(restaurantId));
      }
    } else {
      runShellWarmTask("auth-shell.user.posts.preload", () => loadUserPostsFn());
    }
  }

  async function preloadProfileData() {
    if (!state?.user) return;
    if (preloadProfilePromise) return preloadProfilePromise;
    preloadProfilePromise = (async () => {
      if (dataLoaded && typeof dataLoaded === "object") {
        dataLoaded.profile = true;
      }
      await loadAuthProfileFn(state.user);
      const hasBusinessProfile = isLocalBusinessProfileFn(state.userProfile);
      if (hasBusinessProfile) {
        await loadBusinessPostsFn();
        return;
      }
      await loadUserPostsFn();
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
    preloadMenuPromise = (async () => {
      await loadAuthProfileFn(state.user);
      const restaurantId = String(state.userProfile?.restaurantId || "").trim();
      if (!restaurantId) return;
      await Promise.all([
        loadMenuForRestaurantFn(restaurantId, { source: "collection" }),
        loadFocusForRestaurantFn(restaurantId)
      ]);
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
      startChatThreadsListener: (user) => ensureChatThreadsLive(user),
      stopChatThreadsListener: () => {
        if (state?.user) return;
        liveChatThreadsUid = "";
        stopChatThreadsListenerFn();
      },
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
    liveChatThreadsUid = "";
    shellWarmUid = "";
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
    ensureChatThreadsLive(user);
    startFollowingListenerFn(user);
    warmAuthenticatedShellData(user);
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
