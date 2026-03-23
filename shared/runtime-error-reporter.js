function asText(value = "", fallback = "") {
  const text = String(value ?? "").trim();
  return text || String(fallback || "").trim();
}

function buildEntryId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function limitText(value = "", maxLength = 320) {
  const text = asText(value);
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function serializeError(error) {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: asText(error.name, "Error"),
      message: limitText(error.message || "Unknown runtime error"),
      stack: limitText(error.stack || "", 1200)
    };
  }
  if (typeof error === "object") {
    return {
      name: asText(error.name || "Error"),
      message: limitText(error.message || JSON.stringify(error)),
      stack: limitText(error.stack || "", 1200)
    };
  }
  return {
    name: "Error",
    message: limitText(error)
  };
}

function serializeConsoleArg(value) {
  if (value instanceof Error) return serializeError(value);
  if (typeof value === "string") return limitText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value === null || value === undefined) return value;
  try {
    return limitText(JSON.stringify(value));
  } catch {
    return limitText(String(value));
  }
}

function ensureStore(windowObj, maxItems) {
  if (!windowObj) {
    return {
      version: 1,
      entries: [],
      maxItems
    };
  }
  const key = "__MNYRA_RUNTIME_ERROR_STORE__";
  const existing = windowObj[key];
  if (!existing || typeof existing !== "object") {
    windowObj[key] = {
      version: 1,
      entries: [],
      maxItems
    };
  }
  if (!Array.isArray(windowObj[key].entries)) {
    windowObj[key].entries = [];
  }
  if (!Number.isFinite(Number(windowObj[key].maxItems)) || Number(windowObj[key].maxItems) <= 0) {
    windowObj[key].maxItems = maxItems;
  }
  return windowObj[key];
}

export function createRuntimeErrorReporter({
  appName = "app",
  windowObj = typeof window !== "undefined" ? window : null,
  consoleObj = typeof console !== "undefined" ? console : null,
  maxItems = 120
} = {}) {
  const safeAppName = asText(appName, "app");
  const safeMaxItems = Math.max(10, Number(maxItems) || 120);
  const store = ensureStore(windowObj, safeMaxItems);
  const originalConsole = {
    error: typeof consoleObj?.error === "function" ? consoleObj.error.bind(consoleObj) : null,
    warn: typeof consoleObj?.warn === "function" ? consoleObj.warn.bind(consoleObj) : null
  };
  let isConsoleEmissionActive = false;
  let globalHandlersBound = false;
  let consoleCaptureBound = false;

  function trimStore() {
    const maxEntries = Math.max(10, Number(store.maxItems) || safeMaxItems);
    if (store.entries.length > maxEntries) {
      store.entries.splice(0, store.entries.length - maxEntries);
    }
  }

  function record(scope = "", error = null, { level = "error", extra = null } = {}) {
    const entry = {
      id: buildEntryId(),
      app: safeAppName,
      scope: asText(scope, "runtime"),
      level: asText(level, "error"),
      timestamp: new Date().toISOString(),
      error: serializeError(error),
      extra: extra && typeof extra === "object" ? extra : null
    };
    store.entries.push(entry);
    trimStore();
    return entry;
  }

  function emitToConsole(entry) {
    if (!consoleObj || isConsoleEmissionActive) return;
    const consoleMethod = entry.level === "warn" ? originalConsole.warn : originalConsole.error;
    if (typeof consoleMethod !== "function") return;
    const label = `[mnyra][${entry.app}][${entry.scope}]`;
    const message = asText(entry.error?.message || "");
    isConsoleEmissionActive = true;
    try {
      if (message) {
        consoleMethod(`${label} ${message}`, entry);
      } else {
        consoleMethod(label, entry);
      }
    } finally {
      isConsoleEmissionActive = false;
    }
  }

  function report(scope = "", error = null, { level = "error", silent = false, extra = null } = {}) {
    const entry = record(scope, error, { level, extra });
    if (!silent) emitToConsole(entry);
    return entry;
  }

  function bindGlobalErrorHandlers() {
    if (!windowObj || globalHandlersBound) return;
    windowObj.addEventListener("error", (event) => {
      const message = asText(event?.message || "Unknown runtime error");
      const error = event?.error instanceof Error ? event.error : new Error(message);
      record("window.error", error, {
        level: "error",
        extra: {
          filename: asText(event?.filename),
          lineno: Number(event?.lineno || 0) || 0,
          colno: Number(event?.colno || 0) || 0
        }
      });
    });
    windowObj.addEventListener("unhandledrejection", (event) => {
      const reason = event?.reason;
      const error = reason instanceof Error
        ? reason
        : new Error(asText(reason, "Unhandled promise rejection"));
      record("window.unhandledrejection", error, { level: "error" });
    });
    globalHandlersBound = true;
  }

  function captureConsoleErrors({ captureWarn = false } = {}) {
    if (!consoleObj || consoleCaptureBound) return;
    const bindMethod = (methodName, level) => {
      const originalMethod = originalConsole[methodName];
      if (typeof originalMethod !== "function" || typeof consoleObj[methodName] !== "function") return;
      consoleObj[methodName] = (...args) => {
        if (!isConsoleEmissionActive) {
          const firstError = args.find((item) => item instanceof Error) || null;
          const fallbackMessage = args
            .map((item) => serializeConsoleArg(item))
            .filter((item) => item !== null && item !== undefined && item !== "")
            .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
            .join(" ");
          const error = firstError || new Error(limitText(fallbackMessage || `${methodName} called`));
          record(`console.${methodName}`, error, {
            level,
            extra: {
              args: args.map((item) => serializeConsoleArg(item))
            }
          });
        }
        return originalMethod(...args);
      };
    };
    bindMethod("error", "error");
    if (captureWarn) bindMethod("warn", "warn");
    consoleCaptureBound = true;
  }

  function getEntries() {
    return store.entries.filter((entry) => entry.app === safeAppName);
  }

  function clearEntries() {
    store.entries = store.entries.filter((entry) => entry.app !== safeAppName);
  }

  return {
    report,
    bindGlobalErrorHandlers,
    captureConsoleErrors,
    getEntries,
    clearEntries
  };
}
