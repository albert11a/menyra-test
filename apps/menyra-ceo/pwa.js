if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/apps/menyra-ceo/" });
      try { await reg.update(); } catch (e) {}
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload when new SW takes control
        window.location.reload();
      });

      navigator.serviceWorker.addEventListener('message', (ev) => {
        try {
          if (ev.data && ev.data.type === 'NEW_SW_ACTIVATED') window.location.reload();
        } catch (e) {}
      });
    } catch (e) {}
  });
}
