export function preparePublicBootstrapStartup({
  windowObj = null,
  bindPublicBootstrapPayloadListener = () => {},
  applyPublicBootstrapPayload = () => false
} = {}) {
  const bindPayloadListener = typeof bindPublicBootstrapPayloadListener === "function"
    ? bindPublicBootstrapPayloadListener
    : (() => {});
  const applyPayload = typeof applyPublicBootstrapPayload === "function"
    ? applyPublicBootstrapPayload
    : (() => false);

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
    applyPayload(inlineBootstrap, { refreshUi: false });
  }
  hasWindowBootstrapPromise = !!windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__
    && typeof windowObj.__MENYRA_SOCIAL_BOOTSTRAP_PROMISE__.then === "function";

  return {
    hasInlineBootstrapPayload,
    hasWindowBootstrapPromise
  };
}
