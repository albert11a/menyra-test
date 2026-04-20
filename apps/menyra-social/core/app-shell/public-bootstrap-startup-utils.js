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
    if (deferInlinePayloadApply) {
      scheduleDeferredInlinePayloadApply(inlineBootstrap);
    } else {
      applyInlinePayloadWithTimeline(inlineBootstrap, "inline");
    }
  }
  hasWindowBootstrapPromise = !!windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__
    && typeof windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__.then === "function";

  return {
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  };
}
