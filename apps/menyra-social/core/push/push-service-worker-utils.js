function normalizeServiceWorkerScriptKey(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw, "https://mnyra.local");
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return raw;
  }
}

function readRegistrationScriptKey(registration = null) {
  const scriptUrl = String(
    registration?.active?.scriptURL
    || registration?.waiting?.scriptURL
    || registration?.installing?.scriptURL
    || ""
  ).trim();
  return normalizeServiceWorkerScriptKey(scriptUrl);
}

export async function ensurePushServiceWorkerRegistrationCore({
  navigatorObj,
  serviceWorkerScope = "",
  serviceWorkerUrl = "",
  setPushActivationIssue
} = {}) {
  const nav = navigatorObj || null;
  const setIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});
  if (!nav || !("serviceWorker" in nav)) return null;
  const safeServiceWorkerUrl = String(serviceWorkerUrl || "").trim();
  const desiredScriptKey = normalizeServiceWorkerScriptKey(safeServiceWorkerUrl);
  try {
    const existing = await nav.serviceWorker.getRegistration(serviceWorkerScope);
    if (existing) {
      const existingScriptKey = readRegistrationScriptKey(existing);
      if (!safeServiceWorkerUrl || !desiredScriptKey || existingScriptKey === desiredScriptKey) {
        try {
          await existing.update?.();
        } catch {}
        return existing;
      }
      try {
        return await nav.serviceWorker.register(safeServiceWorkerUrl, {
          scope: serviceWorkerScope,
          updateViaCache: "none"
        });
      } catch (err) {
        setIssue("Service Worker Aktualisierung fehlgeschlagen.", err);
        return existing;
      }
    }
  } catch {}
  if (!safeServiceWorkerUrl) return null;
  try {
    return await nav.serviceWorker.register(safeServiceWorkerUrl, {
      scope: serviceWorkerScope,
      updateViaCache: "none"
    });
  } catch (err) {
    setIssue("Service Worker Registrierung fehlgeschlagen.", err);
    return null;
  }
}

export async function waitForPushServiceWorkerReadyCore({
  navigatorObj,
  timeoutMs = 5000,
  setPushActivationIssue
} = {}) {
  const nav = navigatorObj || null;
  const setIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});
  if (!nav || !("serviceWorker" in nav)) return null;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("service-worker-ready-timeout")), timeoutMs);
    });
    return await Promise.race([nav.serviceWorker.ready, timeoutPromise]);
  } catch (err) {
    setIssue("Service Worker ist nicht ready.", err);
    return null;
  }
}
