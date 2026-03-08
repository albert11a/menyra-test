const GUEST_ALLOWED_TABS = new Set(["feed", "search", "map", "orders", "profile"]);

export function isGuestSessionCore(user = null) {
  return !user;
}

export function sanitizeTabForSessionCore(tab, {
  user = null,
  hasProfileView = false
} = {}) {
  const next = String(tab || "").trim() || "feed";
  if (!isGuestSessionCore(user)) return next;
  if (!GUEST_ALLOWED_TABS.has(next)) return "feed";
  if (next === "profile" && !hasProfileView) return "feed";
  return next;
}

export function applyPendingInitialRouteStateCore({
  activeTab = "feed",
  user = null,
  hasProfileView = false,
  pendingInitialTab = "",
  pendingAuthMode = "",
  authMode = "",
  authOpen = false
} = {}) {
  let nextActiveTab = activeTab;
  let nextPendingInitialTab = String(pendingInitialTab || "");
  let nextPendingAuthMode = String(pendingAuthMode || "");
  let nextAuthMode = String(authMode || "");
  let nextAuthOpen = !!authOpen;
  const isGuest = isGuestSessionCore(user);

  if (nextPendingInitialTab) {
    const requestedTab = nextPendingInitialTab;
    const sanitizedRequestedTab = sanitizeTabForSessionCore(requestedTab, { user, hasProfileView });
    if (!isGuest || sanitizedRequestedTab === requestedTab) {
      nextActiveTab = sanitizedRequestedTab;
      nextPendingInitialTab = "";
    }
  }
  if (!user && nextPendingAuthMode) {
    nextAuthMode = nextPendingAuthMode;
    nextAuthOpen = true;
    nextPendingAuthMode = "";
  }
  nextActiveTab = sanitizeTabForSessionCore(nextActiveTab, { user, hasProfileView });

  return {
    activeTab: nextActiveTab,
    pendingInitialTab: nextPendingInitialTab,
    pendingAuthMode: nextPendingAuthMode,
    authMode: nextAuthMode,
    authOpen: nextAuthOpen
  };
}
