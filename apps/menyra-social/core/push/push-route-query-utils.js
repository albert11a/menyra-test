export function clearQueryParamsFromCurrentUrlCore({
  windowObj,
  keys = []
} = {}) {
  const win = windowObj || null;
  if (!win || !win.history?.replaceState) return false;
  try {
    const url = new URL(win.location?.href || "");
    const uniqueKeys = Array.from(new Set((Array.isArray(keys) ? keys : []).map((key) => String(key || "").trim()).filter(Boolean)));
    let changed = false;
    uniqueKeys.forEach((key) => {
      if (!url.searchParams.has(key)) return;
      url.searchParams.delete(key);
      changed = true;
    });
    if (!changed) return false;
    const query = url.searchParams.toString();
    const next = `${url.pathname}${query ? `?${query}` : ""}${url.hash || ""}`;
    win.history.replaceState({}, "", next);
    return true;
  } catch {
    return false;
  }
}

export function resolveRouteStateFromTargetUrlCore({
  rawUrl = "",
  windowObj,
  resolveInitialRouteState,
  normalizeInitialTab,
  normalizeAuthMode
} = {}) {
  const safeRawUrl = String(rawUrl || "").trim();
  if (!safeRawUrl) return null;
  const win = windowObj || null;
  if (!win) return null;
  if (typeof resolveInitialRouteState !== "function") return null;
  try {
    const parsed = new URL(safeRawUrl, win.location?.origin || "");
    return resolveInitialRouteState({
      qs: (key) => String(parsed.searchParams.get(String(key || "")) || ""),
      pathname: String(parsed.pathname || ""),
      normalizeInitialTab,
      normalizeAuthMode
    });
  } catch {
    return null;
  }
}

export function applyPendingRouteStateCore({
  current = {},
  routeState = null
} = {}) {
  if (!routeState || typeof routeState !== "object") {
    return { changed: false, next: { ...(current || {}) } };
  }
  const next = { ...(current || {}) };
  let changed = false;

  if (routeState.pendingProfileRestaurantId) {
    next.pendingProfileRestaurantId = routeState.pendingProfileRestaurantId;
    next.pendingProfileTopTab = routeState.pendingProfileTopTab || "";
    next.pendingProfileAccessSource = routeState.pendingProfileAccessSource || "";
    next.pendingProfileTableNumber = Number(routeState.pendingProfileTableNumber || 0) || 0;
    next.pendingUserRouteId = "";
    next.pendingUserContentTab = "";
    next.pendingProfileHandled = false;
    changed = true;
  } else if (routeState.pendingUserRouteId) {
    next.pendingProfileRestaurantId = "";
    next.pendingProfileTopTab = "";
    next.pendingProfileAccessSource = "";
    next.pendingProfileTableNumber = 0;
    next.pendingUserRouteId = routeState.pendingUserRouteId;
    next.pendingUserContentTab = routeState.pendingUserContentTab || "";
    next.pendingProfileHandled = false;
    changed = true;
  } else if (
    next.pendingProfileRestaurantId
    || next.pendingProfileTopTab
    || next.pendingProfileAccessSource
    || next.pendingProfileTableNumber
    || next.pendingUserRouteId
    || next.pendingUserContentTab
    || next.pendingProfileHandled
  ) {
    next.pendingProfileRestaurantId = "";
    next.pendingProfileTopTab = "";
    next.pendingProfileAccessSource = "";
    next.pendingProfileTableNumber = 0;
    next.pendingUserRouteId = "";
    next.pendingUserContentTab = "";
    next.pendingProfileHandled = false;
    changed = true;
  }
  if (routeState.pendingNotificationId) {
    next.pendingNotificationId = routeState.pendingNotificationId;
    next.pendingNotificationHandled = false;
    changed = true;
  }
  if (routeState.pendingPostId) {
    next.pendingPostId = routeState.pendingPostId;
    next.pendingPostHandled = false;
    changed = true;
  }
  if (routeState.pendingChatUid) {
    next.pendingChatUid = routeState.pendingChatUid;
    next.pendingChatHandled = false;
    changed = true;
  }
  if (routeState.pendingInitialTab) {
    next.pendingInitialTab = routeState.pendingInitialTab;
    changed = true;
  }
  if (routeState.pendingAuthMode) {
    next.pendingAuthMode = routeState.pendingAuthMode;
    changed = true;
  }
  return { changed, next };
}
