import { startAppStartupBootstrap } from "./app-startup-bootstrap.js";

export function startAppStartupRuntimeCluster({
  loadPersistedFn = null,
  startupDeps = {},
  browserApi = {},
  suspendRenderFn = null,
  resumeRenderFn = null
} = {}) {
  const suspendRender = typeof suspendRenderFn === "function" ? suspendRenderFn : null;
  const resumeRender = typeof resumeRenderFn === "function" ? resumeRenderFn : null;
  if (suspendRender) suspendRender();
  let startupRuntime = null;
  try {
    if (typeof loadPersistedFn === "function") {
      loadPersistedFn();
    }
    startupRuntime = startAppStartupBootstrap(startupDeps);
  } finally {
    if (resumeRender) resumeRender();
  }
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
