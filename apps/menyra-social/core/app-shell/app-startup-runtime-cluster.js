import { startAppStartupBootstrap } from "./app-startup-bootstrap.js";

export function startAppStartupRuntimeCluster({
  loadPersistedFn = null,
  startupDeps = {},
  browserApi = {}
} = {}) {
  if (typeof loadPersistedFn === "function") {
    loadPersistedFn();
  }

  const startupRuntime = startAppStartupBootstrap(startupDeps);
  const windowObj = browserApi.windowObj || (typeof window === "undefined" ? null : window);

  if (windowObj?.addEventListener) {
    windowObj.addEventListener("load", () => {
      if (windowObj.lucide?.createIcons) {
        windowObj.lucide.createIcons();
      }
    });
  }

  return startupRuntime;
}
