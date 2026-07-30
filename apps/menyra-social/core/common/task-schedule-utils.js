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

const BACKGROUND_PRELOAD_SLOW_EFFECTIVE_TYPES = ["slow-2g", "2g"];

// Vorwaermer (lazy Chunk, Vendor-Skript) duerfen auf Save-Data- und 2G-Geraeten
// kein Datenvolumen ungefragt verbrauchen. Der Nutzer-Pfad laedt weiterhin
// immer nach, nur eben erst beim Oeffnen.
export function isBackgroundPreloadDiscouragedCore({ navigatorObj = null } = {}) {
  const nav = navigatorObj && typeof navigatorObj === "object" ? navigatorObj : null;
  if (!nav) return false;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
  if (!connection || typeof connection !== "object") return false;
  if (connection.saveData === true) return true;
  const effectiveType = String(connection.effectiveType || "").trim().toLowerCase();
  return BACKGROUND_PRELOAD_SLOW_EFFECTIVE_TYPES.includes(effectiveType);
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
