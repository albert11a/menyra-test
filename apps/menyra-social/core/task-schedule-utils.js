export function scheduleIdleCore({
  fn,
  windowObj,
  timeout = 800,
  fallbackDelayMs = 0
} = {}) {
  if (typeof fn !== "function") return false;
  const win = windowObj && typeof windowObj === "object" ? windowObj : null;
  if (!win) return false;
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(fn, { timeout });
    return true;
  }
  if (typeof win.setTimeout === "function") {
    win.setTimeout(fn, fallbackDelayMs);
    return true;
  }
  return false;
}

export function enqueueMicrotaskCore({
  fn,
  queueMicrotaskFn,
  setTimeoutFn
} = {}) {
  if (typeof fn !== "function") return false;
  if (typeof queueMicrotaskFn === "function") {
    queueMicrotaskFn(fn);
    return true;
  }
  if (typeof setTimeoutFn === "function") {
    setTimeoutFn(fn, 0);
    return true;
  }
  return false;
}
