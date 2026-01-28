if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/apps/menyra-ceo/" }).catch(() => {});
  });
}
