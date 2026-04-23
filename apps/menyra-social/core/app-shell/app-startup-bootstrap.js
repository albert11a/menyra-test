import { createPublicBootstrapRuntimeController } from "./public-bootstrap-runtime-controller.js";
import { preparePublicBootstrapStartup } from "./public-bootstrap-startup-utils.js";
import { createPostLoginRouteOpenCoordinator } from "../auth/auth-post-login-route-open-utils.js";
import { createAuthSessionStartupCoordinator } from "../auth/auth-session-startup-coordinator.js";

function shouldDeferInlineBootstrapApply(startupPrepDeps = {}) {
  const state = startupPrepDeps?.state || null;
  if (!state || typeof state !== "object") return false;
  const pendingRouteState = startupPrepDeps?.pendingRouteState || null;
  const pendingState = typeof pendingRouteState?.getPendingState === "function"
    ? pendingRouteState.getPendingState()
    : null;
  const pendingProfileRestaurantId = String(pendingState?.pendingProfileRestaurantId || "").trim();
  if (pendingProfileRestaurantId) return false;
  const webDirectEntry = state?.__webDirectEntry && typeof state.__webDirectEntry === "object"
    ? state.__webDirectEntry
    : null;
  if (webDirectEntry?.active === true && webDirectEntry?.webPriority === true) return false;
  const activeTab = String(state.activeTab || "").trim().toLowerCase();
  if (activeTab !== "profile") return false;
  const pendingTopTab = String(pendingState?.pendingProfileTopTab || "").trim().toLowerCase();
  const profileTopTab = pendingTopTab || String(state.profileTopTab || "").trim().toLowerCase() || "profile";
  return profileTopTab === "profile" || profileTopTab === "menu";
}

export function startAppStartupBootstrap({
  publicBootstrapDeps = {},
  startupPrepDeps = {},
  routeOpenDeps = {},
  authStartupDeps = {},
  startupTimelineMark = () => {}
} = {}) {
  const markStartupTimeline = typeof startupTimelineMark === "function"
    ? startupTimelineMark
    : (() => {});
  const {
    applyPublicBootstrapPayload,
    fetchPublicBootstrapPayload,
    bindPublicBootstrapPayloadListener
  } = createPublicBootstrapRuntimeController(publicBootstrapDeps);
  const fetchPublicBootstrapPayloadWithTimeline = async (...args) => {
    markStartupTimeline("public bootstrap start", { source: "fetch" });
    try {
      return await fetchPublicBootstrapPayload(...args);
    } finally {
      markStartupTimeline("public bootstrap end", { source: "fetch" });
    }
  };
  const deferInlineBootstrapApply = shouldDeferInlineBootstrapApply(startupPrepDeps);

  const {
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  } = preparePublicBootstrapStartup({
    ...startupPrepDeps,
    bindPublicBootstrapPayloadListener,
    applyPublicBootstrapPayload,
    deferInlinePayloadApply: deferInlineBootstrapApply,
    startupTimelineMark: markStartupTimeline
  });

  const postLoginRouteOpenCoordinator = createPostLoginRouteOpenCoordinator(routeOpenDeps);
  const authSessionStartupCoordinator = createAuthSessionStartupCoordinator({
    ...authStartupDeps,
    fetchPublicBootstrapPayload: fetchPublicBootstrapPayloadWithTimeline,
    markStartupTimeline,
    postLoginRouteOpenCoordinator
  });

  authSessionStartupCoordinator.start({
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  });

  return {
    authSessionStartupCoordinator
  };
}
