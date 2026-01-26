const SW_URL = "/sw.js";
const SW_SCOPE = "/apps/menyra-social/";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE }).catch((err) => {
      console.warn("MENYRA Social PWA SW register failed:", err);
    });
  });
}
