export async function bootstrapAuthenticatedSessionCore({
  user = null,
  loadAuthProfile,
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
  const runNonBlocking = (fn) => {
    try {
      const pending = fn();
      if (pending && typeof pending.then === "function") {
        pending.catch(() => {});
      }
    } catch {}
  };

  await loadProfile(user);
  if (!canContinue()) return false;
  const restaurantId = String(readRestaurantId(user) || "").trim();
  if (restaurantId) {
    await hydrateRestaurants([restaurantId], { max: 1 });
    if (!canContinue()) return false;
  }
  await resolveRoles(user);
  if (!canContinue()) return false;

  runNonBlocking(() => ensureFollowing());
  runNonBlocking(() => startLive(user));
  runNonBlocking(() => ensureTab(readActiveTab()));
  return true;
}
