import { isChatEnabledForV1 } from "../chat/chat-v1-guard.js";

const GUEST_ALLOWED_TABS = new Set(["feed", "restaurants", "travel", "shopping", "search", "map", "orders", "profile"]);
const SOCIAL_REMOVED_TABS = new Set(["leads", "customers"]);

export function isGuestSessionCore(user = null) {
  return !user;
}

export function hasGuestScopeForSessionCore(guestScopeUid) {
  if (guestScopeUid === undefined) return true;
  return !!String(guestScopeUid || "").trim();
}

const DASHBOARD_START_DEFAULT_TABS = new Set(["", "feed", "home"]);

// Entscheidet, ob eine frisch angemeldete Business-Session auf dem
// Dashboard starten soll. "apply" = jetzt umschalten, "retry" = Profil noch
// nicht aufgeloest (spaeter erneut pruefen), "skip" = diese Session hat ein
// explizites Ziel (Deep-Link/Navigation) und darf nie mehr umgeleitet werden.
export function resolveBusinessDashboardStartTabCore({
  uid = "",
  appliedUid = "",
  userProfile = null,
  activeTab = "",
  hasProfileView = false,
  pendingInitialTab = "",
  pendingProfileRestaurantId = "",
  pendingUserRouteId = "",
  pendingPostId = "",
  pendingChatUid = "",
  pendingNotificationId = ""
} = {}) {
  const safeUid = String(uid || "").trim();
  if (!safeUid) return "retry";
  if (safeUid === String(appliedUid || "").trim()) return "skip";
  const safeActiveTab = String(activeTab || "").trim().toLowerCase();
  const safePendingTab = String(pendingInitialTab || "").trim().toLowerCase();
  const hasExplicitTarget = hasProfileView
    || !DASHBOARD_START_DEFAULT_TABS.has(safeActiveTab)
    || !DASHBOARD_START_DEFAULT_TABS.has(safePendingTab)
    || !!String(pendingProfileRestaurantId || "").trim()
    || !!String(pendingUserRouteId || "").trim()
    || !!String(pendingPostId || "").trim()
    || !!String(pendingChatUid || "").trim()
    || !!String(pendingNotificationId || "").trim();
  if (hasExplicitTarget) return "skip";
  const profile = userProfile && typeof userProfile === "object" ? userProfile : {};
  const socialAccessMode = String(profile.socialAccessMode || "").trim().toLowerCase();
  if (socialAccessMode === "waiteronly" || socialAccessMode === "blocked") return "skip";
  const restaurantId = String(profile.restaurantId || profile.staffRestaurantId || "").trim();
  if (!restaurantId) return "retry";
  return "apply";
}

export function sanitizeTabForSessionCore(tab, {
  user = null,
  hasProfileView = false,
  guestScopeUid = undefined
} = {}) {
  const requestedTab = String(tab || "").trim().toLowerCase();
  const next = requestedTab === "location"
    ? "feed"
    : (requestedTab || "feed");
  if (SOCIAL_REMOVED_TABS.has(next)) return "feed";
  if (!isChatEnabledForV1() && next === "chat") return "chat";
  if (!isGuestSessionCore(user)) return next;
  if (!hasGuestScopeForSessionCore(guestScopeUid)) return "feed";
  if (!GUEST_ALLOWED_TABS.has(next)) return "feed";
  if (next === "profile" && !hasProfileView) return "feed";
  return next;
}

export function applyPendingInitialRouteStateCore({
  activeTab = "feed",
  user = null,
  hasProfileView = false,
  guestScopeUid = undefined,
  profileTopTab = "",
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
  const safeProfileTopTab = String(profileTopTab || "").trim();

  if (nextPendingInitialTab) {
    const requestedTab = nextPendingInitialTab;
    const routeAlreadyOpen = hasProfileView
      && nextActiveTab === "profile"
      && (requestedTab === "profile" || safeProfileTopTab === requestedTab);
    if (routeAlreadyOpen) {
      nextPendingInitialTab = "";
    } else {
      const sanitizedRequestedTab = sanitizeTabForSessionCore(requestedTab, { user, hasProfileView, guestScopeUid });
      if (!isGuest || sanitizedRequestedTab === requestedTab) {
        nextActiveTab = sanitizedRequestedTab;
        nextPendingInitialTab = "";
      }
    }
  }
  if (!user && nextPendingAuthMode) {
    nextAuthMode = nextPendingAuthMode;
    nextAuthOpen = true;
    nextPendingAuthMode = "";
  }
  nextActiveTab = sanitizeTabForSessionCore(nextActiveTab, { user, hasProfileView, guestScopeUid });

  return {
    activeTab: nextActiveTab,
    pendingInitialTab: nextPendingInitialTab,
    pendingAuthMode: nextPendingAuthMode,
    authMode: nextAuthMode,
    authOpen: nextAuthOpen
  };
}
