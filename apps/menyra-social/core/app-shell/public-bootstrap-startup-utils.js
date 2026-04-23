export function preparePublicBootstrapStartup({
  windowObj = null,
  bindPublicBootstrapPayloadListener = () => {},
  applyPublicBootstrapPayload = () => false,
  deferInlinePayloadApply = false,
  startupTimelineMark = () => {}
} = {}) {
  const bindPayloadListener = typeof bindPublicBootstrapPayloadListener === "function"
    ? bindPublicBootstrapPayloadListener
    : (() => {});
  const applyPayload = typeof applyPublicBootstrapPayload === "function"
    ? applyPublicBootstrapPayload
    : (() => false);
  const markStartupTimeline = typeof startupTimelineMark === "function"
    ? startupTimelineMark
    : (() => {});
  const shouldForceImmediateInlineApply = (payload = null) => {
    if (!payload || typeof payload !== "object") return false;
    const routePayload = payload?.publicRoute && typeof payload.publicRoute === "object"
      ? payload.publicRoute
      : payload;
    const routeSnapshot = routePayload?.businessSnapshot && typeof routePayload.businessSnapshot === "object"
      ? routePayload.businessSnapshot
      : null;
    const restaurantId = String(
      routePayload?.restaurantId
      || routePayload?.targetRestaurantId
      || routeSnapshot?.restaurantId
      || ""
    ).trim();
    if (!restaurantId) return false;
    const routeTopTab = String(
      routePayload?.topTab
      || routePayload?.surface
      || routePayload?.contentTab
      || ""
    ).trim().toLowerCase();
    return routeTopTab === "menu"
      || routeTopTab === "profile"
      || !routeTopTab;
  };
  const applyInlinePayloadWithTimeline = (payload, source = "inline") => {
    markStartupTimeline("public bootstrap start", { source });
    try {
      applyPayload(payload, { refreshUi: false });
    } finally {
      markStartupTimeline("public bootstrap end", { source });
    }
  };
  const scheduleDeferredInlinePayloadApply = (payload) => {
    const run = () => {
      applyInlinePayloadWithTimeline(payload, "inline-deferred");
    };
    if (windowObj && typeof windowObj.requestAnimationFrame === "function") {
      windowObj.requestAnimationFrame(() => {
        windowObj.requestAnimationFrame(run);
      });
      return;
    }
    if (windowObj && typeof windowObj.setTimeout === "function") {
      windowObj.setTimeout(run, 140);
      return;
    }
    run();
  };

  bindPayloadListener();

  let hasInlineBootstrapPayload = false;
  let hasWindowBootstrapPromise = false;
  if (!windowObj) {
    return {
      hasInlineBootstrapPayload,
      hasWindowBootstrapPromise
    };
  }

  const inlineBootstrap = windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PAYLOAD__;
  if (inlineBootstrap && typeof inlineBootstrap === "object") {
    hasInlineBootstrapPayload = true;
    const forceImmediateApply = shouldForceImmediateInlineApply(inlineBootstrap);
    if (deferInlinePayloadApply && !forceImmediateApply) {
      scheduleDeferredInlinePayloadApply(inlineBootstrap);
    } else {
      applyInlinePayloadWithTimeline(
        inlineBootstrap,
        forceImmediateApply ? "inline-route-critical" : "inline"
      );
    }
  }
  hasWindowBootstrapPromise = !!windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__
    && typeof windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__.then === "function";

  return {
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  };
}
