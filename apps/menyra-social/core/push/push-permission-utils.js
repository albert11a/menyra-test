export async function ensureNotificationPermissionCore({
  interactive = false,
  canUseNativeNotifications = false,
  notificationApi = null,
  setPushActivationIssue
} = {}) {
  const canUse = typeof canUseNativeNotifications === "function"
    ? !!canUseNativeNotifications()
    : !!canUseNativeNotifications;
  const notify = notificationApi || (typeof Notification !== "undefined" ? Notification : null);
  const setIssue = typeof setPushActivationIssue === "function"
    ? setPushActivationIssue
    : (() => {});

  if (!canUse || !notify) {
    setIssue("Browser unterstuetzt Notification API nicht.");
    return false;
  }
  if (notify.permission === "granted") return true;
  if (notify.permission === "denied") {
    setIssue("Browser-Permission fuer Benachrichtigungen ist auf 'denied'.");
    return false;
  }
  if (!interactive) {
    setIssue("Browser-Permission noch nicht erteilt.");
    return false;
  }
  try {
    const permission = await notify.requestPermission();
    if (permission !== "granted") {
      setIssue(`Browser-Permission wurde nicht freigegeben (${permission}).`);
    }
    return permission === "granted";
  } catch (err) {
    setIssue("Browser-Permission konnte nicht angefragt werden.", err);
    return false;
  }
}
