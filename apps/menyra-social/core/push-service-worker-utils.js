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
  try {
    const existing = await nav.serviceWorker.getRegistration(serviceWorkerScope);
    if (existing) return existing;
  } catch {}
  try {
    return await nav.serviceWorker.register(serviceWorkerUrl, { scope: serviceWorkerScope });
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
