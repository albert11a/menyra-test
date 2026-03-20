import {
  assertPwaPresence,
  captureArtifact,
  loginAsCeo,
  openTab
} from "../helpers/social-app.mjs";
import {
  SOCIAL_TABS
} from "../utils/selectors.mjs";

async function guardedMutationCheck({
  page,
  env,
  heart,
  moduleKey,
  routeUrl,
  triggerSelector,
  followupSelector = "",
  note,
  warningMessage,
  createdEntity = null
} = {}) {
  if (!env.allowLiveMutations) {
    heart.warnModule(moduleKey, warningMessage || "Live mutation disabled by default. Set MNYRA_ALLOW_LIVE_MUTATIONS=true only for isolated test environments.");
    return;
  }
  if (!triggerSelector) {
    heart.warnModule(moduleKey, `No selector configured for ${moduleKey}.`);
    return;
  }
  await openTab(page, env, moduleKey === "orders" ? SOCIAL_TABS.orders : SOCIAL_TABS.menu, heart, {
    moduleKey,
    note,
    absolute: routeUrl || ""
  });
  await page.locator(triggerSelector).first().click({ timeout: 8000 });
  if (followupSelector) {
    await page.locator(followupSelector).first().click({ timeout: 8000 });
  }
  if (createdEntity) {
    heart.addCreatedEntity(createdEntity);
  }
  heart.passModule(moduleKey, note || `${moduleKey} mutation executed.`);
}

export async function runSmokeScenario({ page, env, heart, emitStatus = async () => {} }) {
  await loginAsCeo(page, env, heart);
  await emitStatus("Auth verified", "running", "CEO login completed for smoke pack.");

  await openTab(page, env, SOCIAL_TABS.feed, heart, {
    moduleKey: "feed",
    note: "Feed tab opened and authenticated shell stayed stable."
  });
  await emitStatus("Feed verified", "running", "Feed surface loaded.");

  await openTab(page, env, SOCIAL_TABS.profile, heart, {
    moduleKey: "profile",
    note: "Profile surface opened."
  });
  await emitStatus("Profile verified", "running", "Profile surface loaded.");

  if (env.businessProfileUrl) {
    await openTab(page, env, SOCIAL_TABS.profile, heart, {
      moduleKey: "business",
      note: "Business profile opened through configured smoke URL.",
      absolute: env.businessProfileUrl
    });
    await emitStatus("Business profile verified", "running", "Business profile surface loaded.");
  } else {
    heart.warnModule("business", "MNYRA_SMOKE_BUSINESS_PROFILE_URL is not configured.");
    await emitStatus("Business profile skipped", "warning", "Business profile smoke URL not configured.");
  }

  await openTab(page, env, SOCIAL_TABS.menu, heart, {
    moduleKey: "menu",
    note: "Menu tab opened."
  });
  await emitStatus("Menu verified", "running", "Menu surface loaded.");

  await guardedMutationCheck({
    page,
    env,
    heart,
    moduleKey: "cart",
    routeUrl: env.cartOpenUrl,
    triggerSelector: env.cartTriggerSelector,
    followupSelector: env.cartRemovalSelector,
    note: "Cart add/remove smoke action executed.",
    warningMessage: "Cart mutation skipped. Configure MNYRA_SMOKE_CART_URL and selectors on an isolated environment."
  });
  await emitStatus("Cart check completed", "running", "Cart smoke check finished.");

  await guardedMutationCheck({
    page,
    env,
    heart,
    moduleKey: "orders",
    routeUrl: env.cartOpenUrl,
    triggerSelector: env.orderTriggerSelector,
    note: "Order submission trigger executed.",
    warningMessage: "Order send skipped. Configure order trigger selectors only on a safe isolated target."
  });
  await emitStatus("Order check completed", "running", "Order smoke check finished.");

  if (env.chatTargetUrl && env.chatComposerSelector && env.chatSendSelector) {
    if (!env.allowLiveMutations) {
      heart.warnModule("chat", "Chat send skipped because live mutations are disabled by default.");
    } else {
      await openTab(page, env, SOCIAL_TABS.chat, heart, {
        moduleKey: "chat",
        note: "Chat surface opened through configured target URL.",
        absolute: env.chatTargetUrl
      });
      await page.locator(env.chatComposerSelector).first().fill(env.chatMessageTemplate);
      await page.locator(env.chatSendSelector).first().click({ timeout: 8000 });
      heart.passModule("chat", "Chat send trigger executed.");
      await emitStatus("Chat verified", "running", "Chat send trigger executed.");
    }
  } else {
    await openTab(page, env, SOCIAL_TABS.chat, heart, {
      note: "Chat surface opened."
    });
    heart.warnModule("chat", "Chat send selectors are not configured. Only chat surface load was verified.");
    await emitStatus("Chat partially verified", "warning", "Chat surface loaded without send selectors.");
  }

  await openTab(page, env, SOCIAL_TABS.leads, heart, {
    moduleKey: "crm",
    note: "CRM leads tab opened."
  });
  await emitStatus("CRM verified", "running", "CRM leads surface loaded.");

  const pwa = await assertPwaPresence(page);
  if (pwa.manifestLink && pwa.serviceWorkerSupport) {
    heart.passModule("pwa", "Manifest tag is present and the browser supports service workers.");
    await emitStatus("PWA verified", "running", "Manifest and service worker capability confirmed.");
  } else {
    heart.warnModule("pwa", "PWA shell check returned partial capability only.");
    await emitStatus("PWA warning", "warning", "PWA shell check returned partial capability.");
  }

  const screenshotPath = await captureArtifact(page, env, "smoke-final-state");
  heart.addArtifact({ label: "Smoke final screenshot", kind: "screenshot", path: screenshotPath });
  heart.setSummary("Smoke pack completed. Critical-path reads were verified, mutations only if explicitly enabled and configured.");
}
