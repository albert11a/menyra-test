const SW_URL = "/sw.js";
const SW_SCOPE = "/apps/menyra-social/";

// Service Worker registration is opt-in to avoid PWA-specific caching
// slowing down asset loads. To enable SW for testing, set localStorage
// `menyra_pwa_enable_sw = '1'` in the app (or in DevTools Console), then reload.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    try {
      const enabled = String(window.localStorage.getItem("menyra_pwa_enable_sw") || "0");
      if (enabled !== "1") {
        console.log("MENYRA Social: Service Worker registration skipped (disabled by default).");
        return;
      }
    } catch (err) {
      // ignore localStorage issues and proceed with registration
    }

    navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).then((reg) => {
      console.log("MENYRA Social: Service Worker registered.", reg.scope);
    }).catch((err) => {
      console.warn("MENYRA Social PWA SW register failed:", err);
    });
  });
}
