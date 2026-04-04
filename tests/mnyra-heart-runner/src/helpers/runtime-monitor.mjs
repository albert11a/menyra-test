function asText(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function nowIso() {
  return new Date().toISOString();
}

function toRoundedNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric);
}

function trimText(value, max = 220) {
  const text = asText(value);
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 3))}...`;
}

function compactList(items = [], max = 6) {
  return (Array.isArray(items) ? items : []).slice(0, Math.max(1, Number(max) || 1));
}

function toProtocol(url = "") {
  const safeUrl = asText(url);
  if (!safeUrl) return "";
  try {
    return new URL(safeUrl).protocol.replace(":", "").toLowerCase();
  } catch {
    return "";
  }
}

function isNetworkUrl(url = "") {
  const protocol = toProtocol(url);
  return protocol === "http" || protocol === "https";
}

async function collectNavigationMetrics(page) {
  try {
    return await page.evaluate(() => {
      const navEntries = performance.getEntriesByType("navigation");
      const nav = Array.isArray(navEntries) ? navEntries[navEntries.length - 1] : null;
      const paintEntries = performance.getEntriesByType("paint");
      const fp = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-paint");
      const fcp = (Array.isArray(paintEntries) ? paintEntries : []).find((entry) => entry?.name === "first-contentful-paint");
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      const lcp = Array.isArray(lcpEntries) && lcpEntries.length ? lcpEntries[lcpEntries.length - 1] : null;
      const layoutShiftEntries = performance.getEntriesByType("layout-shift");
      const cls = (Array.isArray(layoutShiftEntries) ? layoutShiftEntries : []).reduce((sum, entry) => {
        if (!entry || entry.hadRecentInput) return sum;
        return sum + Number(entry.value || 0);
      }, 0);
      return {
        navType: nav?.type || "",
        domContentLoadedMs: Number.isFinite(nav?.domContentLoadedEventEnd) ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadMs: Number.isFinite(nav?.loadEventEnd) ? Math.round(nav.loadEventEnd) : null,
        responseStartMs: Number.isFinite(nav?.responseStart) ? Math.round(nav.responseStart) : null,
        transferSize: Number.isFinite(nav?.transferSize) ? Math.round(nav.transferSize) : null,
        decodedBodySize: Number.isFinite(nav?.decodedBodySize) ? Math.round(nav.decodedBodySize) : null,
        firstPaintMs: Number.isFinite(fp?.startTime) ? Math.round(fp.startTime) : null,
        fcpMs: Number.isFinite(fcp?.startTime) ? Math.round(fcp.startTime) : null,
        lcpMs: Number.isFinite(lcp?.startTime) ? Math.round(lcp.startTime) : null,
        cls: Number.isFinite(cls) ? Math.round(cls * 1000) / 1000 : null
      };
    });
  } catch {
    return {};
  }
}

function resolveRuntimeOptions(env = {}) {
  const runtimeQuality = env?.runtimeQuality || {};
  const coldStartWarnMs = Math.max(500, asNumber(runtimeQuality.coldStartWarnMs, 5000));
  const coldStartFailMs = Math.max(coldStartWarnMs, asNumber(runtimeQuality.coldStartFailMs, 12000));
  const fcpWarnMs = Math.max(250, asNumber(runtimeQuality.fcpWarnMs, 3000));
  const fcpFailMs = Math.max(fcpWarnMs, asNumber(runtimeQuality.fcpFailMs, 7000));
  return {
    enabled: runtimeQuality.enabled !== false,
    failOnPageErrors: runtimeQuality.failOnPageErrors !== false,
    failOnConsoleErrors: runtimeQuality.failOnConsoleErrors === true,
    failOnRequestFailures: runtimeQuality.failOnRequestFailures === true,
    failOnHttpErrors: runtimeQuality.failOnHttpErrors === true,
    maxSamples: Math.max(1, Math.round(asNumber(runtimeQuality.maxSamples, 6))),
    coldStartWarnMs,
    coldStartFailMs,
    fcpWarnMs,
    fcpFailMs
  };
}

function dedupeByKey(items = [], keyBuilder) {
  const seen = new Set();
  return items.filter((item) => {
    const key = asText(keyBuilder(item));
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createRuntimeMonitor({
  page,
  heart,
  env,
  scopeLabel = "main"
} = {}) {
  const options = resolveRuntimeOptions(env);
  if (!options.enabled || !page || !heart) {
    return {
      async flush() {
        return null;
      }
    };
  }

  const state = {
    scopeLabel: asText(scopeLabel, "main"),
    startedAt: nowIso(),
    navigations: [],
    pageErrors: [],
    consoleErrors: [],
    consoleWarnings: [],
    requestFailures: [],
    httpErrors: [],
    gotoFailures: []
  };

  const originalGoto = typeof page.goto === "function" ? page.goto.bind(page) : null;
  let patchedGoto = false;
  let flushed = false;

  const onPageError = (error) => {
    state.pageErrors.push({
      at: nowIso(),
      message: trimText(error?.message || error),
      name: trimText(error?.name)
    });
  };

  const onConsole = (message) => {
    const type = asText(message?.type?.());
    if (!type) return;
    const entry = {
      at: nowIso(),
      type,
      text: trimText(message?.text?.(), 260),
      url: trimText(message?.location?.()?.url)
    };
    if (type === "error") {
      state.consoleErrors.push(entry);
      return;
    }
    if (type === "warning") {
      state.consoleWarnings.push(entry);
    }
  };

  const onRequestFailed = (request) => {
    const url = asText(request?.url?.());
    if (!isNetworkUrl(url)) return;
    const failureText = asText(request?.failure?.()?.errorText);
    if (failureText.toLowerCase().includes("err_aborted")) return;
    state.requestFailures.push({
      at: nowIso(),
      method: asText(request?.method?.()),
      url: trimText(url, 280),
      failure: trimText(failureText, 180)
    });
  };

  const onResponse = (response) => {
    const status = Number(response?.status?.());
    if (!Number.isFinite(status) || status < 400) return;
    const url = asText(response?.url?.());
    if (!isNetworkUrl(url)) return;
    state.httpErrors.push({
      at: nowIso(),
      status,
      method: asText(response?.request?.()?.method?.()),
      url: trimText(url, 280)
    });
  };

  page.on("pageerror", onPageError);
  page.on("console", onConsole);
  page.on("requestfailed", onRequestFailed);
  page.on("response", onResponse);

  if (originalGoto) {
    try {
      page.goto = async (...args) => {
        const requestedUrl = asText(args?.[0]);
        const startedAtMs = Date.now();
        let response = null;
        try {
          response = await originalGoto(...args);
          return response;
        } catch (error) {
          state.gotoFailures.push({
            at: nowIso(),
            url: trimText(requestedUrl || page.url(), 280),
            durationMs: Date.now() - startedAtMs,
            message: trimText(error?.message || error, 200)
          });
          throw error;
        } finally {
          const metrics = await collectNavigationMetrics(page);
          state.navigations.push({
            at: nowIso(),
            requestedUrl: trimText(requestedUrl, 280),
            finalUrl: trimText(page.url?.() || requestedUrl, 280),
            durationMs: Date.now() - startedAtMs,
            status: Number(response?.status?.()) || null,
            ...metrics
          });
        }
      };
      patchedGoto = true;
    } catch {
      patchedGoto = false;
    }
  }

  function removeListeners() {
    page.off("pageerror", onPageError);
    page.off("console", onConsole);
    page.off("requestfailed", onRequestFailed);
    page.off("response", onResponse);
  }

  function buildRuntimeSummary() {
    const pageErrors = dedupeByKey(state.pageErrors, (item) => `${item.name}|${item.message}`);
    const consoleErrors = dedupeByKey(state.consoleErrors, (item) => `${item.type}|${item.text}`);
    const requestFailures = dedupeByKey(state.requestFailures, (item) => `${item.method}|${item.url}|${item.failure}`);
    const httpErrors = dedupeByKey(state.httpErrors, (item) => `${item.status}|${item.method}|${item.url}`);
    return {
      pageErrors,
      consoleErrors,
      requestFailures,
      httpErrors
    };
  }

  function recordRuntimeStatus(summary = {}) {
    const problemParts = [];
    const warningParts = [];
    if ((summary.pageErrors || []).length) {
      const part = `${summary.pageErrors.length} page errors`;
      if (options.failOnPageErrors) {
        problemParts.push(part);
      } else {
        warningParts.push(part);
      }
    }
    if ((summary.consoleErrors || []).length) {
      const part = `${summary.consoleErrors.length} console errors`;
      if (options.failOnConsoleErrors) {
        problemParts.push(part);
      } else {
        warningParts.push(part);
      }
    }
    if ((summary.requestFailures || []).length) {
      const part = `${summary.requestFailures.length} failed requests`;
      if (options.failOnRequestFailures) {
        problemParts.push(part);
      } else {
        warningParts.push(part);
      }
    }
    if ((summary.httpErrors || []).length) {
      const part = `${summary.httpErrors.length} http >=400 responses`;
      if (options.failOnHttpErrors) {
        problemParts.push(part);
      } else {
        warningParts.push(part);
      }
    }

    if (problemParts.length) {
      heart.failModule("runtime", new Error(`${state.scopeLabel}: ${problemParts.join(", ")}.`), {
        action: `${state.scopeLabel} runtime diagnostics`,
        title: `${state.scopeLabel} runtime diagnostics reported blocking issues`,
        area: "runtime",
        severity: options.failOnPageErrors ? "critical" : "failed"
      });
      return;
    }
    if (warningParts.length) {
      heart.warnModule("runtime", `${state.scopeLabel}: ${warningParts.join(", ")}.`, {
        action: `${state.scopeLabel} runtime diagnostics`,
        area: "runtime"
      });
      return;
    }
    heart.passModule("runtime", `${state.scopeLabel}: no runtime errors detected.`, {
      action: `${state.scopeLabel} runtime diagnostics`,
      area: "runtime"
    });
  }

  function recordPerformanceStatus() {
    const firstNavigation = state.navigations.find((item) => Number(item?.durationMs) > 0) || null;
    if (!firstNavigation) {
      heart.skipModule("performance", `${state.scopeLabel}: no navigation timings captured.`, {
        action: `${state.scopeLabel} cold start`,
        area: "performance"
      });
      return;
    }

    const coldStartMs = Number(firstNavigation.durationMs) || 0;
    if (coldStartMs >= options.coldStartFailMs) {
      heart.failModule("performance", new Error(`${state.scopeLabel}: cold start ${coldStartMs}ms (threshold ${options.coldStartFailMs}ms).`), {
        action: `${state.scopeLabel} cold start`,
        title: `${state.scopeLabel} cold start exceeded fail threshold`,
        area: "performance",
        severity: "failed"
      });
    } else if (coldStartMs >= options.coldStartWarnMs) {
      heart.warnModule("performance", `${state.scopeLabel}: cold start ${coldStartMs}ms (warn >= ${options.coldStartWarnMs}ms).`, {
        action: `${state.scopeLabel} cold start`,
        area: "performance"
      });
    } else {
      heart.passModule("performance", `${state.scopeLabel}: cold start ${coldStartMs}ms.`, {
        action: `${state.scopeLabel} cold start`,
        area: "performance"
      });
    }

    if (Number.isFinite(firstNavigation.fcpMs)) {
      const fcpMs = Number(firstNavigation.fcpMs);
      if (fcpMs >= options.fcpFailMs) {
        heart.failModule("performance", new Error(`${state.scopeLabel}: FCP ${fcpMs}ms (threshold ${options.fcpFailMs}ms).`), {
          action: `${state.scopeLabel} first contentful paint`,
          title: `${state.scopeLabel} FCP exceeded fail threshold`,
          area: "performance",
          severity: "failed"
        });
      } else if (fcpMs >= options.fcpWarnMs) {
        heart.warnModule("performance", `${state.scopeLabel}: FCP ${fcpMs}ms (warn >= ${options.fcpWarnMs}ms).`, {
          action: `${state.scopeLabel} first contentful paint`,
          area: "performance"
        });
      } else {
        heart.passModule("performance", `${state.scopeLabel}: FCP ${fcpMs}ms.`, {
          action: `${state.scopeLabel} first contentful paint`,
          area: "performance"
        });
      }
    } else {
      heart.skipModule("performance", `${state.scopeLabel}: FCP metric not available on this page.`, {
        action: `${state.scopeLabel} first contentful paint`,
        area: "performance"
      });
    }
  }

  return {
    async flush() {
      if (flushed) return null;
      flushed = true;
      removeListeners();
      if (patchedGoto && originalGoto) {
        try {
          page.goto = originalGoto;
        } catch {}
      }

      const runtimeSummary = buildRuntimeSummary();
      recordRuntimeStatus(runtimeSummary);
      recordPerformanceStatus();

      return {
        scopeLabel: state.scopeLabel,
        startedAt: state.startedAt,
        endedAt: nowIso(),
        checks: {
          navigationCount: state.navigations.length,
          pageErrorCount: runtimeSummary.pageErrors.length,
          consoleErrorCount: runtimeSummary.consoleErrors.length,
          consoleWarningCount: dedupeByKey(state.consoleWarnings, (item) => `${item.type}|${item.text}`).length,
          requestFailureCount: runtimeSummary.requestFailures.length,
          httpErrorCount: runtimeSummary.httpErrors.length,
          gotoFailureCount: state.gotoFailures.length
        },
        thresholds: {
          coldStartWarnMs: options.coldStartWarnMs,
          coldStartFailMs: options.coldStartFailMs,
          fcpWarnMs: options.fcpWarnMs,
          fcpFailMs: options.fcpFailMs
        },
        coldStart: state.navigations.length ? {
          durationMs: toRoundedNumber(state.navigations[0].durationMs),
          status: state.navigations[0].status,
          finalUrl: state.navigations[0].finalUrl,
          navType: asText(state.navigations[0].navType),
          domContentLoadedMs: toRoundedNumber(state.navigations[0].domContentLoadedMs),
          loadMs: toRoundedNumber(state.navigations[0].loadMs),
          fcpMs: toRoundedNumber(state.navigations[0].fcpMs),
          lcpMs: toRoundedNumber(state.navigations[0].lcpMs),
          cls: state.navigations[0].cls
        } : null,
        samples: {
          navigations: compactList(state.navigations, options.maxSamples),
          pageErrors: compactList(runtimeSummary.pageErrors, options.maxSamples),
          consoleErrors: compactList(runtimeSummary.consoleErrors, options.maxSamples),
          requestFailures: compactList(runtimeSummary.requestFailures, options.maxSamples),
          httpErrors: compactList(runtimeSummary.httpErrors, options.maxSamples),
          gotoFailures: compactList(state.gotoFailures, options.maxSamples)
        }
      };
    }
  };
}
