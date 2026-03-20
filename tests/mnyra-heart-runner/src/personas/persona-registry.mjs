function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function buildPersona(key, label, config = {}, defaults = {}) {
  const app = asText(config.app, defaults.app || "social");
  const baseUrl = asText(config.baseUrl, defaults.baseUrl || "");
  const email = asText(config.email);
  const password = asText(config.password);
  const guestRouteUrl = asText(config.guestRouteUrl);
  const configured = key === "guest"
    ? !!(guestRouteUrl || baseUrl)
    : !!(email && password && baseUrl);
  return {
    key,
    label,
    app,
    baseUrl,
    email,
    password,
    guestRouteUrl,
    configured,
    reason: configured
      ? ""
      : key === "guest"
        ? "Guest route URL is not configured."
        : `${label} credentials or base URL are not configured.`
  };
}

export function createPersonaRegistry(env) {
  const config = env?.packConfig?.personas || {};
  const registry = {
    ceo: buildPersona("ceo", "CEO bot", config.ceo, {
      app: "social",
      baseUrl: env.socialBaseUrl
    }),
    business: buildPersona("business", "Business bot", config.business, {
      app: "social",
      baseUrl: env.socialBaseUrl
    }),
    staff: buildPersona("staff", "Staff bot", config.staff, {
      app: "waiter",
      baseUrl: env.waiterBaseUrl
    }),
    user: buildPersona("user", "User bot", config.user, {
      app: "social",
      baseUrl: env.socialBaseUrl
    }),
    guest: buildPersona("guest", "Guest / QR bot", config.guest, {
      app: "social",
      baseUrl: env.socialBaseUrl
    })
  };
  return registry;
}
