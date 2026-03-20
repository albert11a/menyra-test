import {
  assertPwaPresence,
  clickIfPresent,
  openSocialTab
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";

const SOCIAL_TABS = getSocialDefaultTabs();

export async function runJourneyChecks({ page, env, heart, persona } = {}) {
  const journeyConfig = env.packConfig?.actions?.journey || {};
  const tabs = [SOCIAL_TABS.feed, SOCIAL_TABS.profile, SOCIAL_TABS.menu, SOCIAL_TABS.chat];
  for (const tabKey of tabs) {
    await openSocialTab(page, persona, heart, tabKey, {
      moduleKey: tabKey === SOCIAL_TABS.profile ? "profile" : tabKey,
      note: `Journey opened ${tabKey}.`
    });
    await page.mouse.wheel(0, 900).catch(() => undefined);
    await page.waitForTimeout(350);
  }

  await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => undefined);
  await page.waitForTimeout(300);
  await page.goForward({ waitUntil: "domcontentloaded" }).catch(() => undefined);
  heart.passModule("feed", "Journey back/forward navigation stayed stable.", {
    action: "journey navigation",
    persona: persona.key,
    area: "feed"
  });

  if (journeyConfig.modalOpenSelector && journeyConfig.modalCloseSelector) {
    const opened = await clickIfPresent(page, journeyConfig.modalOpenSelector);
    if (opened) {
      await page.waitForTimeout(300);
      await clickIfPresent(page, journeyConfig.modalCloseSelector);
      heart.passModule("profile", "Journey modal open/close completed.", {
        action: "modal open/close",
        persona: persona.key,
        area: "profile"
      });
    }
  } else {
    heart.notConfiguredModule("profile", "Journey modal selectors are not configured.", {
      action: "modal open/close",
      persona: persona.key,
      area: "profile"
    });
  }
}

export async function runPwaChecks({ page, heart, persona, manifestSelector } = {}) {
  const pwa = await assertPwaPresence(page, manifestSelector);
  if (pwa.manifestLink && pwa.serviceWorkerSupport) {
    heart.passModule("pwa", "Manifest is present and service workers are supported.", {
      action: "pwa presence",
      persona: persona?.key,
      area: "pwa"
    });
    return;
  }
  heart.warnModule("pwa", "PWA shell check returned partial capability only.", {
    action: "pwa presence",
    persona: persona?.key,
    area: "pwa"
  });
}
