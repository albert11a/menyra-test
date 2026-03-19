export function createPendingRouteStartupState() {
  const pendingState = {
    pendingProfileRestaurantId: "",
    pendingProfileTopTab: "",
    pendingProfileAccessSource: "",
    pendingProfileTableNumber: 0,
    pendingProfileHandled: false,
    pendingNotificationId: "",
    pendingNotificationHandled: false,
    pendingPostId: "",
    pendingPostHandled: false,
    pendingChatUid: "",
    pendingChatHandled: false,
    pendingInitialTab: "",
    pendingAuthMode: ""
  };

  function getPendingState() {
    return {
      ...pendingState
    };
  }

  function patchPendingState(patch = {}) {
    if (!patch || typeof patch !== "object") return;
    if ("pendingProfileRestaurantId" in patch) pendingState.pendingProfileRestaurantId = patch.pendingProfileRestaurantId;
    if ("pendingProfileTopTab" in patch) pendingState.pendingProfileTopTab = patch.pendingProfileTopTab;
    if ("pendingProfileAccessSource" in patch) pendingState.pendingProfileAccessSource = patch.pendingProfileAccessSource;
    if ("pendingProfileTableNumber" in patch) pendingState.pendingProfileTableNumber = Number(patch.pendingProfileTableNumber || 0) || 0;
    if ("pendingProfileHandled" in patch) pendingState.pendingProfileHandled = !!patch.pendingProfileHandled;
    if ("pendingNotificationId" in patch) pendingState.pendingNotificationId = patch.pendingNotificationId;
    if ("pendingNotificationHandled" in patch) pendingState.pendingNotificationHandled = !!patch.pendingNotificationHandled;
    if ("pendingPostId" in patch) pendingState.pendingPostId = patch.pendingPostId;
    if ("pendingPostHandled" in patch) pendingState.pendingPostHandled = !!patch.pendingPostHandled;
    if ("pendingChatUid" in patch) pendingState.pendingChatUid = patch.pendingChatUid;
    if ("pendingChatHandled" in patch) pendingState.pendingChatHandled = !!patch.pendingChatHandled;
    if ("pendingInitialTab" in patch) pendingState.pendingInitialTab = patch.pendingInitialTab;
    if ("pendingAuthMode" in patch) pendingState.pendingAuthMode = patch.pendingAuthMode;
  }

  function applyInitialRouteState(initialRouteState = {}) {
    patchPendingState({
      pendingProfileRestaurantId: initialRouteState.pendingProfileRestaurantId || "",
      pendingProfileTopTab: initialRouteState.pendingProfileTopTab || "",
      pendingProfileAccessSource: initialRouteState.pendingProfileAccessSource || "",
      pendingProfileTableNumber: initialRouteState.pendingProfileTableNumber || 0,
      pendingNotificationId: initialRouteState.pendingNotificationId || "",
      pendingPostId: initialRouteState.pendingPostId || "",
      pendingChatUid: initialRouteState.pendingChatUid || "",
      pendingInitialTab: initialRouteState.pendingInitialTab || "",
      pendingAuthMode: initialRouteState.pendingAuthMode || ""
    });
  }

  function getPendingInitialTab() {
    return pendingState.pendingInitialTab;
  }

  function setPendingInitialTab(next) {
    pendingState.pendingInitialTab = next;
  }

  function getPendingAuthMode() {
    return pendingState.pendingAuthMode;
  }

  function setPendingAuthMode(next) {
    pendingState.pendingAuthMode = next;
  }

  function getPendingNotificationId() {
    return pendingState.pendingNotificationId;
  }

  function getPendingPostId() {
    return pendingState.pendingPostId;
  }

  function getPendingChatUid() {
    return pendingState.pendingChatUid;
  }

  return {
    getPendingState,
    patchPendingState,
    applyInitialRouteState,
    getPendingInitialTab,
    setPendingInitialTab,
    getPendingAuthMode,
    setPendingAuthMode,
    getPendingNotificationId,
    getPendingPostId,
    getPendingChatUid
  };
}
