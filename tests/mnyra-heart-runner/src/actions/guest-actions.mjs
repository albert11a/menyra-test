import { clickIfPresent, ensureElementVisible, waitForText } from "../helpers/social-app.mjs";

function mutationReady(env = {}) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

export async function runGuestChecks({ page, env, heart, persona } = {}) {
  const guestConfig = env.packConfig?.actions?.guest?.qrMenu || {};
  if (!persona?.guestRouteUrl) {
    heart.notConfiguredModule("menu", "Gast- / QR-Link ist nicht eingerichtet.", {
      action: "guest route open",
      persona: persona?.key,
      area: "menu"
    });
    return;
  }

  await page.goto(persona.guestRouteUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("body", { timeout: 30000 });
  heart.passModule("menu", "Gast- / QR-Link wurde geladen.", {
    action: "guest route open",
    persona: persona.key,
    area: "menu"
  });

  if (guestConfig.menuVisibleSelector) {
    await ensureElementVisible(page, guestConfig.menuVisibleSelector);
    heart.passModule("menu", "Gast-Menue war sichtbar.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu"
    });
  } else {
    heart.notConfiguredModule("menu", "Selector fuer sichtbares Gast-Menue fehlt.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu"
    });
  }

  if (guestConfig.cartVisibleSelector) {
    await ensureElementVisible(page, guestConfig.cartVisibleSelector);
    heart.passModule("cart", "Gast-Warenkorb war sichtbar.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart"
    });
  } else {
    heart.notConfiguredModule("cart", "Selector fuer sichtbaren Gast-Warenkorb fehlt.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart"
    });
  }

  if (guestConfig.orderTriggerSelector) {
    if (!mutationReady(env)) {
      heart.guardModule("orders", "Gast-Bestellung ist vorbereitet, aber im Moment absichtlich gesperrt. Fuer echte Bestellungen braucht Heart den isolierten Schreibmodus.", {
        action: "guest order flow",
        persona: persona.key,
        area: "orders"
      });
    } else if (!guestConfig.orderVerifySelector && !guestConfig.orderSuccessText) {
      heart.notConfiguredModule("orders", "Gast-Bestellung braucht noch einen klaren Erfolgsnachweis. Hinterlege dafuer einen Selector oder einen Erfolgstext.", {
        action: "guest order flow",
        persona: persona.key,
        area: "orders"
      });
    } else {
      await clickIfPresent(page, guestConfig.orderTriggerSelector);
      if (guestConfig.orderVerifySelector) {
        await ensureElementVisible(page, guestConfig.orderVerifySelector);
      } else {
        await waitForText(page, guestConfig.orderSuccessText);
      }
      heart.passModule("orders", "Gast-Bestellung wurde ueber den QR- / Menue-Link erfolgreich angestossen.", {
        action: "guest order flow",
        persona: persona.key,
        area: "orders"
      });
    }
  } else {
    heart.notConfiguredModule("orders", "Selector fuer Gast-Bestellung fehlt.", {
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
      heart.failModule("business", "Auf dem Gast- / QR-Link waren geschuetzte Business-Bedienelemente sichtbar.", {
        action: "guest privilege check",
        title: "Gast-Link zeigt geschuetzte Bedienelemente",
        severity: "critical",
        persona: persona.key,
        area: "business"
      });
    } else {
      heart.passModule("business", "Gast- / QR-Link hat geschuetzte Bedienelemente sauber verborgen.", {
        action: "guest privilege check",
        persona: persona.key,
        area: "business"
      });
    }
  } else {
    heart.notConfiguredModule("business", "Selectoren fuer geschuetzte Gast-Bedienelemente fehlen.", {
      action: "guest privilege check",
      persona: persona.key,
      area: "business"
    });
  }
}
