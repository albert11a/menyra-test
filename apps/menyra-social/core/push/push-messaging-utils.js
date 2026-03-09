export function ensureFirebaseMessagingModuleCore({
  currentPromise = null,
  moduleUrl = "",
  importModule,
  setModulePromise
} = {}) {
  if (currentPromise) return currentPromise;
  const importFn = typeof importModule === "function"
    ? importModule
    : ((url) => import(url));
  const setPromise = typeof setModulePromise === "function"
    ? setModulePromise
    : (() => {});
  const nextPromise = importFn(moduleUrl).catch((err) => {
    setPromise(null);
    throw err;
  });
  setPromise(nextPromise);
  return nextPromise;
}

export async function ensureMessagingClientCore({
  currentClient = null,
  ensureFirebaseMessagingModule,
  setPushActivationIssue,
  app,
  setMessagingClient
} = {}) {
  if (currentClient) return currentClient;
  const ensureModule = typeof ensureFirebaseMessagingModule === "function"
    ? ensureFirebaseMessagingModule
    : (async () => null);
  const setIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});
  const setClient = typeof setMessagingClient === "function"
    ? setMessagingClient
    : (() => {});
  try {
    const messagingModule = await ensureModule();
    const supported = await messagingModule.isSupported();
    if (!supported) {
      setIssue("FCM wird in diesem Browser/Context nicht unterstuetzt.");
      return null;
    }
    const client = messagingModule.getMessaging(app);
    setClient(client);
    return client;
  } catch (err) {
    setIssue("FCM Messaging konnte nicht initialisiert werden.", err);
    return null;
  }
}
