import {
  assertPwaPresence,
  clickFirstVisible,
  clickIfPresent,
  openSocialTab
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";

const SOCIAL_TABS = getSocialDefaultTabs();

export async function runJourneyChecks({ page, env, heart, persona } = {}) {
  const journeyConfig = env.packConfig?.actions?.journey || {};
  const tabs = [SOCIAL_TABS.feed, SOCIAL_TABS.profile, SOCIAL_TABS.menu, SOCIAL_TABS.chat];
  async function runStep(moduleKey, action, runner, title) {
    try {
      await runner();
    } catch (error) {
      heart.failModule(moduleKey, error, {
        action,
        title,
        persona: persona.key,
        area: moduleKey
      });
    }
  }
  for (const tabKey of tabs) {
    const moduleKey = tabKey === SOCIAL_TABS.profile ? "profile" : tabKey;
    await runStep(moduleKey, `journey open ${tabKey}`, async () => {
      await openSocialTab(page, persona, heart, tabKey, {
        moduleKey,
        note: `Journey hat ${tabKey} geoeffnet.`
      });
      await page.mouse.wheel(0, 900).catch(() => undefined);
      await page.waitForTimeout(350);
    }, `${tabKey} konnte in der Journey nicht geoeffnet werden`);
  }

  await runStep("feed", "journey navigation", async () => {
    await page.goBack({ waitUntil: "domcontentloaded" }).catch(() => undefined);
    await page.waitForTimeout(300);
    await page.goForward({ waitUntil: "domcontentloaded" }).catch(() => undefined);
    heart.passModule("feed", "Vor und zurueck blieb stabil.", {
      action: "journey navigation",
      persona: persona.key,
      area: "feed"
    });
  }, "Vor- und Zurueck-Navigation war nicht stabil");

  if (journeyConfig.modalOpenSelector && journeyConfig.modalCloseSelector) {
    await runStep("profile", "modal open/close", async () => {
      await openSocialTab(page, persona, heart, SOCIAL_TABS.feed, {
        moduleKey: "profile",
        note: "Journey bereitet ein pruefbares Modal auf dem Feed vor."
      });
      const opened = await clickFirstVisible(page, String(journeyConfig.modalOpenSelector || "").split(","));
      if (!opened) {
        throw new Error("Heart konnte fuer die Journey kein oeffenbares Modal finden.");
      }
      await page.waitForTimeout(300);
      const closed = await clickFirstVisible(page, String(journeyConfig.modalCloseSelector || "").split(","));
      if (!closed) {
        throw new Error("Heart konnte das geoeffnete Journey-Modal nicht wieder schliessen.");
      }
      heart.passModule("profile", "Modal wurde sauber geoeffnet und geschlossen.", {
        action: "modal open/close",
        persona: persona.key,
        area: "profile"
      });
    }, "Journey-Modal konnte nicht sauber geoeffnet oder geschlossen werden");
  } else {
    heart.notConfiguredModule("profile", "Fuer das Journey-Modal fehlen noch Selektoren.", {
      action: "modal open/close",
      persona: persona.key,
      area: "profile"
    });
  }
}

export async function runPwaChecks({ page, heart, persona, manifestSelector } = {}) {
  try {
    const pwa = await assertPwaPresence(page, manifestSelector);
    if (pwa.manifestLink && pwa.serviceWorkerSupport) {
      heart.passModule("pwa", "Manifest ist vorhanden und Service Worker werden unterstuetzt.", {
        action: "pwa presence",
        persona: persona?.key,
        area: "pwa"
      });
      return;
    }
    heart.warnModule("pwa", "PWA-Pruefung war nur teilweise erfolgreich.", {
      action: "pwa presence",
      persona: persona?.key,
      area: "pwa"
    });
  } catch (error) {
    heart.failModule("pwa", error, {
      action: "pwa presence",
      title: "PWA-Pruefung konnte nicht abgeschlossen werden",
      persona: persona?.key,
      area: "pwa"
    });
  }
}
