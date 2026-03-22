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

  async function ensureTabData(tab) {
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
