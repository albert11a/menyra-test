import {
  buildUrl,
  openPageAndWait
} from "../helpers/social-app.mjs";
import { ensurePersonaSession } from "./persona-actions.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

async function clickFirstFollowAccept(page) {
  const button = page.locator("[data-follow-request-accept]").first();
  if (!await button.count()) return false;
  try {
    await button.click({ timeout: 5000 });
    return true;
  } catch {
    return button.evaluate((node) => {
      if (!(node instanceof HTMLElement)) return false;
      node.click();
      return true;
    }).catch(() => false);
  }
}

async function acceptVisibleFollowRequests(page, timeout = 20000) {
  const deadline = Date.now() + Math.max(250, Number(timeout) || 0);
  let accepted = 0;
  while (Date.now() < deadline) {
    const acceptedNow = await clickFirstFollowAccept(page);
    if (acceptedNow) {
      accepted += 1;
      await page.waitForTimeout(700).catch(() => undefined);
      continue;
    }
    if (accepted > 0) {
      break;
    }
    await page.waitForTimeout(500).catch(() => undefined);
  }
  return accepted;
}

export async function acceptPendingFollowRequestsInScopedSession({
  createScopedPage,
  heart,
  approverPersona,
  requesterPersona,
  timeout = 25000
} = {}) {
  if (typeof createScopedPage !== "function" || !approverPersona?.configured) {
    return { ok: false, reason: "unavailable", accepted: 0 };
  }

  const scope = await createScopedPage(`follow-accept-${asText(approverPersona.key, "user")}`);
  try {
    await ensurePersonaSession({
      page: scope.page,
      heart,
      persona: approverPersona,
      moduleKey: "auth"
    });
    await openPageAndWait(
      scope.page,
      buildUrl(approverPersona.baseUrl, { tab: "notifications" }),
      "body",
      heart,
      {
        title: `${approverPersona.label} / Open notifications`,
        moduleKey: "profile",
        area: "profile",
        persona: approverPersona.key
      }
    );
    await scope.page.waitForTimeout(2000).catch(() => undefined);
    const accepted = await acceptVisibleFollowRequests(scope.page, timeout);
    if (accepted > 0) {
      heart.addTimeline(
        `${approverPersona.label} / Follow-Anfragen bestaetigt`,
        "success",
        `${accepted} Follow-Anfragen wurden fuer ${approverPersona.label} angenommen${asText(requesterPersona?.label) ? ` (angefragt von ${requesterPersona.label})` : ""}.`,
        {
          module: "profile",
          area: "profile",
          persona: approverPersona.key
        }
      );
    }
    return { ok: true, accepted };
  } catch (error) {
    heart.addTimeline(
      `${approverPersona.label} / Follow-Anfragen`,
      "warning",
      asText(error?.message, "Follow-Anfragen konnten nicht automatisch bearbeitet werden."),
      {
        module: "profile",
        area: "profile",
        persona: approverPersona?.key
      }
    );
    return { ok: false, reason: "failed", accepted: 0 };
  } finally {
    await scope.dispose();
  }
}
