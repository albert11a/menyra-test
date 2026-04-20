import { startAppStartupBootstrap } from "./app-startup-bootstrap.js";

function resolveStartupProfileTopTab(startupDeps = {}) {
  const pendingRouteState = startupDeps?.routeOpenDeps?.pendingRouteState || null;
  const pendingState = typeof pendingRouteState?.getPendingState === "function"
    ? pendingRouteState.getPendingState()
    : null;
  const pendingTopTab = String(pendingState?.pendingProfileTopTab || "").trim().toLowerCase();
  if (pendingTopTab) return pendingTopTab;
  return String(startupDeps?.authStartupDeps?.state?.profileTopTab || "").trim().toLowerCase();
}

function shouldDeferPersistedLoad(startupDeps = {}) {
  const state = startupDeps?.authStartupDeps?.state || null;
  if (!state || typeof state !== "object") return false;
  const activeTab = String(state.activeTab || "").trim().toLowerCase();
  if (activeTab !== "profile") return false;
  const profileTopTab = resolveStartupProfileTopTab(startupDeps) || "profile";
  return profileTopTab === "profile" || profileTopTab === "menu";
}

function schedulePostFirstPaintTask(windowObj = null, task = null) {
  if (typeof task !== "function") return;
  if (windowObj && typeof windowObj.requestAnimationFrame === "function") {
    windowObj.requestAnimationFrame(() => {
      windowObj.requestAnimationFrame(() => {
        task();
      });
    });
    return;
  }
  if (windowObj && typeof windowObj.setTimeout === "function") {
    windowObj.setTimeout(task, 120);
    return;
  }
  if (typeof setTimeout === "function") {
    setTimeout(task, 120);
    return;
  }
  task();
}

export function startAppStartupRuntimeCluster({
  loadPersistedFn = null,
  startupDeps = {},
  browserApi = {},
  suspendRenderFn = null,
  resumeRenderFn = null
} = {}) {
  const suspendRender = typeof suspendRenderFn === "function" ? suspendRenderFn : null;
  const resumeRender = typeof resumeRenderFn === "function" ? resumeRenderFn : null;
  const markStartupTimeline = typeof startupDeps?.startupTimelineMark === "function"
    ? startupDeps.startupTimelineMark
    : (() => {});
  const windowObj = browserApi.windowObj || (typeof window === "undefined" ? null : window);
  const deferPersistedLoad = typeof loadPersistedFn === "function" && shouldDeferPersistedLoad(startupDeps);
  if (suspendRender) suspendRender();
  let startupRuntime = null;
  markStartupTimeline("startup cluster start");
  try {
    if (typeof loadPersistedFn === "function") {
      if (deferPersistedLoad) {
        markStartupTimeline("persisted load critical start", { mode: "critical" });
        loadPersistedFn({ phase: "critical" });
        markStartupTimeline("persisted load critical end", { mode: "critical" });
      } else {
        markStartupTimeline("persisted load full start", { mode: "full" });
        loadPersistedFn();
        markStartupTimeline("persisted load full end", { mode: "full" });
      }
    }
    startupRuntime = startAppStartupBootstrap(startupDeps);
  } finally {
    markStartupTimeline("startup cluster end");
    if (resumeRender) resumeRender();
  }
  if (deferPersistedLoad) {
    markStartupTimeline("persisted load deferred scheduled", { mode: "deferred" });
    schedulePostFirstPaintTask(windowObj, () => {
      markStartupTimeline("persisted load deferred start", { mode: "deferred" });
      try {
        loadPersistedFn({ phase: "deferred" });
      } catch (err) {
        console.warn("[mnyra][startup.persisted.deferred]", err);
      } finally {
        markStartupTimeline("persisted load deferred end", { mode: "deferred" });
      }
    });
  }

  if (windowObj?.addEventListener) {
    windowObj.addEventListener("load", () => {
      if (windowObj.lucide?.createIcons) {
        windowObj.lucide.createIcons();
      }
    });
  }

  return startupRuntime;
}
