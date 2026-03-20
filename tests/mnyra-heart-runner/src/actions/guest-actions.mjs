import { ensureElementVisible } from "../helpers/social-app.mjs";

export async function runGuestChecks({ page, env, heart, persona } = {}) {
  const guestConfig = env.packConfig?.actions?.guest?.qrMenu || {};
  if (!persona?.guestRouteUrl) {
    heart.notConfiguredModule("menu", "Guest route URL is not configured.", {
      action: "guest route open",
      persona: persona?.key,
      area: "menu"
    });
    return;
  }

  await page.goto(persona.guestRouteUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { timeout: 30000 });
  heart.passModule("menu", "Guest route loaded.", {
    action: "guest route open",
    persona: persona.key,
    area: "menu"
  });

  if (guestConfig.menuVisibleSelector) {
    await ensureElementVisible(page, guestConfig.menuVisibleSelector);
    heart.passModule("menu", "Guest menu was visible.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu"
    });
  } else {
    heart.notConfiguredModule("menu", "Guest menu visibility selector is not configured.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu"
    });
  }

  if (guestConfig.cartVisibleSelector) {
    await ensureElementVisible(page, guestConfig.cartVisibleSelector);
    heart.passModule("cart", "Guest cart was visible.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart"
    });
  } else {
    heart.notConfiguredModule("cart", "Guest cart visibility selector is not configured.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart"
    });
  }

  if (guestConfig.orderTriggerSelector) {
    heart.guardModule("orders", "Guest order flow is configured but guarded until isolated mutation mode is enabled.", {
      action: "guest order flow",
      persona: persona.key,
      area: "orders"
    });
  } else {
    heart.notConfiguredModule("orders", "Guest order flow selectors are not configured.", {
      action: "guest order flow",
      persona: persona.key,
      area: "orders"
    });
  }

  if (Array.isArray(guestConfig.privilegedSelectors) && guestConfig.privilegedSelectors.length) {
    let privilegedVisible = false;
    for (const selector of guestConfig.privilegedSelectors) {
      if (await page.locator(selector).count()) {
        privilegedVisible = true;
        break;
      }
    }
    if (privilegedVisible) {
      heart.failModule("business", "Privileged controls were visible for guest route.", {
        action: "guest privilege check",
        title: "Guest route exposed privileged controls",
        severity: "critical",
        persona: persona.key,
        area: "business"
      });
    } else {
      heart.passModule("business", "Guest route kept privileged controls hidden.", {
        action: "guest privilege check",
        persona: persona.key,
        area: "business"
      });
    }
  } else {
    heart.notConfiguredModule("business", "Guest privileged-control selectors are not configured.", {
      action: "guest privilege check",
      persona: persona.key,
      area: "business"
    });
  }
}
