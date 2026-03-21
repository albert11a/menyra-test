import {
  clickFirstVisible,
  ensureElementVisible,
  findVisibleSelector,
  waitForAnySelector,
  waitForUiOutcome
} from "../helpers/social-app.mjs";
import { runUiLayoutCheck } from "./ui-actions.mjs";

function mutationReady(env = {}) {
  return !!env.allowLiveMutations && !!env.syntheticIsolationKey;
}

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function toList(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => asText(item)).filter(Boolean);
    }
    const safeValue = asText(value);
    return safeValue ? [safeValue] : [];
  });
}

function uniqueList(...values) {
  const seen = new Set();
  return toList(...values).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function ensureGuestCartReady(page, guestConfig = {}) {
  const cartReadySelectors = uniqueList(
    guestConfig.cartVisibleSelector,
    "[data-cart-checkout]",
    "[data-cart-qty]"
  );
  const existingCartSelector = await findVisibleSelector(page, cartReadySelectors);
  const openedSelector = await clickFirstVisible(page, [
    guestConfig.productOpenSelector,
    guestConfig.openSelector,
    "[data-menu-open]"
  ], 8000);
  const addedSelector = await clickFirstVisible(page, [
    guestConfig.addToCartSelector,
    "#menuDetailAddToCartBtn"
  ], openedSelector ? 15000 : 5000);

  if (!addedSelector) {
    if (existingCartSelector) {
      return {
        usedExistingCart: true,
        existingCartSelector
      };
    }
    throw new Error("Heart konnte im Gast-/QR-Menue keinen Artikel fuer den Warenkorb vorbereiten.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors: cartReadySelectors,
    successTexts: uniqueList(
      guestConfig.cartVisibleText,
      "Checkout starten",
      "Bestellung absenden",
      "Tischbestellung absenden",
      "wurde zum Warenkorb hinzugefuegt"
    ),
    timeout: 15000
  }).catch(() => null);

  if (!outcome && existingCartSelector) {
    return {
      usedExistingCart: true,
      existingCartSelector
    };
  }
  if (!outcome) {
    throw new Error("Heart konnte nach dem Hinzufuegen keinen sichtbaren Gast-Warenkorb bestaetigen.");
  }
  return {
    usedExistingCart: false,
    outcome
  };
}

async function submitGuestOrder(page, guestConfig = {}) {
  const submitSelectors = uniqueList(
    guestConfig.orderTriggerSelector,
    "[data-cart-checkout='submit']"
  );
  const openSelectors = uniqueList(
    guestConfig.orderOpenSelector,
    "[data-cart-checkout='open']"
  );
  const outcomeTexts = uniqueList(
    guestConfig.orderSuccessTexts,
    guestConfig.orderSuccessText,
    "Bestellung gesendet",
    "Ihre Bestellung wird zubereitet und in Kuerze serviert."
  );
  const failureTexts = uniqueList(
    guestConfig.orderFailureTexts,
    guestConfig.orderFailureText,
    "Bestellung konnte nicht gesendet werden."
  );

  if (!await findVisibleSelector(page, submitSelectors)) {
    await clickFirstVisible(page, openSelectors, 8000);
  }

  const submittedSelector = await clickFirstVisible(page, submitSelectors, 15000);
  if (!submittedSelector) {
    throw new Error("Heart konnte im Gast-/QR-Flow keinen sichtbaren Bestellbutton finden.");
  }

  const outcome = await waitForUiOutcome(page, {
    successSelectors: uniqueList(guestConfig.orderVerifySelector),
    successTexts: outcomeTexts,
    failureSelectors: uniqueList(guestConfig.orderFailureSelector),
    failureTexts,
    timeout: 20000
  }).catch(() => null);

  if (!outcome) {
    throw new Error("Heart hat nach dem Gast-/QR-Bestellklick keinen Erfolgsnachweis gefunden.");
  }
  if (outcome.kind === "failure") {
    throw new Error(`Die Gast-Bestellung ist sichtbar fehlgeschlagen: ${outcome.match}.`);
  }
  return outcome;
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

  try {
    await waitForAnySelector(page, uniqueList(
      guestConfig.menuVisibleSelector,
      "[data-menu-open]",
      "[data-cart-checkout]",
      "#menuDetailAddToCartBtn"
    ), 20000);
    heart.passModule("menu", "Gast-Menue war sichtbar.", {
      action: "guest menu visible",
      persona: persona.key,
      area: "menu"
    });
  } catch (error) {
    heart.failModule("menu", error, {
      action: "guest menu visible",
      title: "Gast-Menue war nicht sichtbar",
      persona: persona.key,
      area: "menu"
    });
  }

  await runUiLayoutCheck(page, heart, {
    persona,
    viewLabel: "Gast- / QR-Menue",
    moduleKey: "ui",
    action: "ui guest layout",
    area: "ui"
  });

  try {
    const cartResult = await ensureGuestCartReady(page, guestConfig);
    heart.passModule("cart", cartResult.usedExistingCart
      ? "Gast-Warenkorb war bereits sichtbar."
      : "Gast-Warenkorb wurde ueber das QR-Menue erfolgreich erreicht.", {
      action: "guest cart visible",
      persona: persona.key,
      area: "cart"
    });
  } catch (error) {
    heart.failModule("cart", error, {
      action: "guest cart visible",
      title: "Gast-Warenkorb konnte nicht vorbereitet werden",
      persona: persona.key,
      area: "cart"
    });
  }

  if (!mutationReady(env)) {
    heart.guardModule("orders", "Gast-Bestellung ist vorbereitet, aber im Moment absichtlich gesperrt. Fuer echte Bestellungen braucht Heart den isolierten Schreibmodus.", {
      action: "guest order flow",
      persona: persona.key,
      area: "orders"
    });
  } else {
    try {
      await ensureGuestCartReady(page, guestConfig);
      const orderOutcome = await submitGuestOrder(page, guestConfig);
      heart.passModule("orders", "Gast-Bestellung wurde ueber den QR- / Menue-Link erfolgreich angestossen.", {
        action: "guest order flow",
        persona: persona.key,
        area: "orders",
        meta: {
          successSignal: asText(orderOutcome?.match)
        }
      });
    } catch (error) {
      heart.failModule("orders", error, {
        action: "guest order flow",
        title: "Gast-Bestellung konnte nicht bestaetigt werden",
        persona: persona.key,
        area: "orders"
      });
    }
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
