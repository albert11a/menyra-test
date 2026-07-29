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
    setIssue("Shfletuesi nuk mbeshtet Notification API.");
    return false;
  }
  if (notify.permission === "granted") return true;
  if (notify.permission === "denied") {
    setIssue("Leja e shfletuesit per njoftime eshte 'denied'.");
    return false;
  }
  if (!interactive) {
    setIssue("Leja e shfletuesit ende nuk eshte dhene.");
    return false;
  }
  try {
    const permission = await notify.requestPermission();
    if (permission !== "granted") {
      setIssue(`Browser-Permission wurde nicht freigegeben (${permission}).`);
    }
    return permission === "granted";
  } catch (err) {
    setIssue("Leja e shfletuesit nuk mund te kerkohej.", err);
    return false;
  }
}
