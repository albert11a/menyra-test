export async function bootstrapAuthenticatedSessionCore({
  user = null,
  loadAuthProfile,
  primeCriticalProfile,
  markBootstrapAuthProfileLoaded,
  getRestaurantId,
  hydrateRestaurantsByIds,
  resolveRoleSwitchTargets,
  ensureFollowingLoaded,
  startLiveListeners,
  ensureTabData,
  activeTab = "",
  shouldContinue = () => true
} = {}) {
  if (!user) return false;

  const loadProfile = typeof loadAuthProfile === "function"
    ? loadAuthProfile
    : (async () => {});
  const markBootstrapProfileLoaded = typeof markBootstrapAuthProfileLoaded === "function"
    ? markBootstrapAuthProfileLoaded
    : (() => {});
  const primeCritical = typeof primeCriticalProfile === "function"
    ? primeCriticalProfile
    : (() => {});
  const readRestaurantId = typeof getRestaurantId === "function"
    ? getRestaurantId
    : (() => "");
  const hydrateRestaurants = typeof hydrateRestaurantsByIds === "function"
    ? hydrateRestaurantsByIds
    : (async () => {});
  const resolveRoles = typeof resolveRoleSwitchTargets === "function"
    ? resolveRoleSwitchTargets
    : (async () => {});
  const ensureFollowing = typeof ensureFollowingLoaded === "function"
    ? ensureFollowingLoaded
    : (() => {});
  const startLive = typeof startLiveListeners === "function"
    ? startLiveListeners
    : (() => {});
  const ensureTab = typeof ensureTabData === "function"
    ? ensureTabData
    : (() => {});
  const readActiveTab = typeof activeTab === "function"
    ? activeTab
    : (() => activeTab);
  const canContinue = typeof shouldContinue === "function"
    ? shouldContinue
    : (() => true);
  const reportBootstrapNonBlockingFailure = (scope = "", err = null) => {
    const safeScope = String(scope || "auth-bootstrap").trim() || "auth-bootstrap";
    if (err) {
      console.warn(`[mnyra][${safeScope}]`, err);
      return;
    }
    console.warn(`[mnyra][${safeScope}] operation failed`);
  };
  const runNonBlocking = (scope, fn) => {
    try {
      const pending = fn();
      if (pending && typeof pending.then === "function") {
        pending.catch((err) => {
          reportBootstrapNonBlockingFailure(scope, err);
        });
      }
    } catch (err) {
      reportBootstrapNonBlockingFailure(scope, err);
    }
  };

  await loadProfile(user);
  if (!canContinue()) return false;

  // Account recognition must happen as soon as the canonical auth profile is known.
  // Slower secondary work must not delay the UI from knowing who logged in.
  const currentTab = readActiveTab();
  markBootstrapProfileLoaded(user, { activeTab: currentTab });
  runNonBlocking("auth-bootstrap.ensureTabData.fastAfterProfile", () => ensureTab(currentTab));

  // Also warm the self-profile content immediately after login even when the user
  // stays on feed/search/etc. This keeps profile tabs/posts ready before tapping Profile.
  if (String(currentTab || "").trim().toLowerCase() !== "profile") {
    runNonBlocking("auth-bootstrap.preloadSelfProfile", () => ensureTab("profile", { preloadOnly: true }));
  }

  runNonBlocking("auth-bootstrap.primeCriticalProfile", () => primeCritical(user));
  const restaurantId = String(readRestaurantId(user) || "").trim();
  const blockingTasks = [];
  if (restaurantId) {
    blockingTasks.push(hydrateRestaurants([restaurantId], { max: 1 }));
  }
  blockingTasks.push(resolveRoles(user));
  if (blockingTasks.length) {
    await Promise.all(blockingTasks);
  }
  if (!canContinue()) return false;

  runNonBlocking("auth-bootstrap.ensureFollowingLoaded", () => ensureFollowing());
  runNonBlocking("auth-bootstrap.startLiveListeners", () => startLive(user));
  return true;
}
