import {
  loginSocialPersona,
  loginWaiterPersona,
  openPageAndWait
} from "../helpers/social-app.mjs";

export async function ensurePersonaSession({ page, heart, persona, moduleKey = "auth" } = {}) {
  if (!persona?.configured) {
    heart.notConfiguredModule(moduleKey, persona?.reason || `${persona?.label || "Persona"} is not configured.`, {
      action: `${moduleKey} login`,
      persona: persona?.key,
      area: moduleKey
    });
    return { ok: false, reason: "not_configured" };
  }

  if (persona.app === "waiter") {
    await loginWaiterPersona(page, persona, heart, { moduleKey });
    return { ok: true };
  }

  await loginSocialPersona(page, persona, heart, { moduleKey });
  return { ok: true };
}

export async function openGuestRoute({ page, heart, persona, moduleKey = "menu" } = {}) {
  if (!persona?.configured || !persona?.guestRouteUrl) {
    heart.notConfiguredModule(moduleKey, "Guest route URL is not configured.", {
      action: "guest route open",
      persona: persona?.key,
      area: moduleKey
    });
    return { ok: false, reason: "not_configured" };
  }

  await openPageAndWait(page, persona.guestRouteUrl, "body", heart, {
    title: "Guest / Open route",
    moduleKey,
    area: moduleKey,
    persona: persona.key,
    note: `Opening guest route ${persona.guestRouteUrl}`
  });
  heart.passModule(moduleKey, "Guest route loaded.", {
    action: "guest route open",
    persona: persona.key,
    area: moduleKey
  });
  return { ok: true };
}
