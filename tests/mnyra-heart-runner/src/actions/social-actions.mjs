import {
  clickIfPresent,
  ensureElementVisible,
  fillIfPresent,
  openSocialTab,
  openPageAndWait,
  readCountValue,
  waitForCountChange,
  waitForText
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";
import {
  hasRequiredConfig,
  markGuarded,
  markNotConfigured,
  replaceRunTokens
} from "./common-actions.mjs";

const SOCIAL_TABS = getSocialDefaultTabs();

async function runConfiguredSocialMutation({
  page,
  env,
  heart,
  persona,
  moduleKey,
  actionLabel,
  config = {},
  requiredKeys = [],
  perform
} = {}) {
  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    markGuarded(
      heart,
      moduleKey,
      `${actionLabel} ist im Moment geschuetzt. Aktiviere erst den isolierten Schreibmodus.`,
      { action: actionLabel, persona: persona?.key, area: moduleKey }
    );
    return { ok: false, reason: "guarded" };
  }
  if (!hasRequiredConfig(config, requiredKeys)) {
    markNotConfigured(
      heart,
      moduleKey,
      `${actionLabel} braucht erst eine saubere Einrichtung.`,
      { action: actionLabel, persona: persona?.key, area: moduleKey }
    );
    return { ok: false, reason: "not_configured" };
  }
  try {
    await perform();
    return { ok: true };
  } catch (error) {
    heart.failModule(moduleKey, error, {
      action: actionLabel,
      title: `${actionLabel} ist fehlgeschlagen`,
      persona: persona?.key,
      area: moduleKey
    });
    return { ok: false, reason: "failed" };
  }
}

export async function runSocialSurfaceChecks({ page, env, heart, persona } = {}) {
  async function runSurface(moduleKey, action, runner, title) {
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

  await runSurface("feed", "feed open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.feed, {
      moduleKey: "feed",
      note: "Feed wurde geoeffnet."
    });
  }, "Feed konnte nicht geoeffnet werden");

  await runSurface("profile", "profile open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.profile, {
      moduleKey: "profile",
      note: "Profil wurde geoeffnet."
    });
  }, "Profil konnte nicht geoeffnet werden");

  const businessProfileUrl = env.packConfig?.actions?.social?.businessProfile?.url;
  if (businessProfileUrl) {
    await runSurface("business", "business profile open", async () => {
      await openSocialTab(page, persona, heart, SOCIAL_TABS.profile, {
        moduleKey: "business",
        note: "Business-Profil wurde ueber die konfigurierte URL geoeffnet.",
        absolute: businessProfileUrl
      });
    }, "Business-Profil konnte nicht geoeffnet werden");
  } else {
    heart.notConfiguredModule("business", "Business-Profil-URL fehlt.", {
      action: "business profile open",
      persona: persona.key,
      area: "business"
    });
  }

  await runSurface("menu", "menu open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
      moduleKey: "menu",
      note: "Menue wurde geoeffnet."
    });
  }, "Menue konnte nicht geoeffnet werden");

  await runSurface("chat", "chat open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.chat, {
      moduleKey: "chat",
      note: "Chat wurde geoeffnet."
    });
  }, "Chat konnte nicht geoeffnet werden");
}

export async function runUserSocialMutationChecks({ page, env, heart, persona } = {}) {
  const socialConfig = env.packConfig?.actions?.social || {};

  await runConfiguredSocialMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "profile",
    actionLabel: "Follow action",
    config: socialConfig.follow,
    requiredKeys: ["url", "triggerSelector"],
    perform: async () => {
      await openPageAndWait(page, socialConfig.follow.url, "body", heart, {
        title: "User / Open follow target",
        moduleKey: "profile",
        area: "profile",
        persona: persona.key
      });
      await page.locator(socialConfig.follow.triggerSelector).first().click({ timeout: 8000 });
      if (socialConfig.follow.verifySelector) {
        await ensureElementVisible(page, socialConfig.follow.verifySelector);
      } else if (socialConfig.follow.verifyText) {
        await waitForText(page, socialConfig.follow.verifyText);
      }
      heart.passModule("profile", "Follow wurde erfolgreich ausgefuehrt.", {
        action: "follow",
        persona: persona.key,
        area: "profile"
      });
    }
  });

  await runConfiguredSocialMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "feed",
    actionLabel: "Like action",
    config: socialConfig.like,
    requiredKeys: ["url", "triggerSelector"],
    perform: async () => {
      await openPageAndWait(page, socialConfig.like.url, "body", heart, {
        title: "User / Open like target",
        moduleKey: "feed",
        area: "feed",
        persona: persona.key
      });
      const before = socialConfig.like.countSelector
        ? await readCountValue(page, socialConfig.like.countSelector)
        : null;
      await page.locator(socialConfig.like.triggerSelector).first().click({ timeout: 8000 });
      if (socialConfig.like.countSelector && before !== null) {
        await waitForCountChange(page, socialConfig.like.countSelector, before);
      }
      heart.passModule("feed", "Like wurde erfolgreich ausgefuehrt.", {
        action: "like",
        persona: persona.key,
        area: "feed"
      });
    }
  });

  await runConfiguredSocialMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "profile",
    actionLabel: "Comment create",
    config: socialConfig.commentCreate,
    requiredKeys: ["url", "inputSelector", "submitSelector"],
    perform: async () => {
      await openPageAndWait(page, socialConfig.commentCreate.url, "body", heart, {
        title: "User / Open comment target",
        moduleKey: "profile",
        area: "profile",
        persona: persona.key
      });
      if (socialConfig.commentCreate.openComposerSelector) {
        await clickIfPresent(page, socialConfig.commentCreate.openComposerSelector);
      }
      const commentText = replaceRunTokens(
        socialConfig.commentCreate.messageTemplate || "TEST_RUN_<runId>_COMMENT_1",
        env
      );
      await fillIfPresent(page, socialConfig.commentCreate.inputSelector, commentText);
      await clickIfPresent(page, socialConfig.commentCreate.submitSelector);
      if (socialConfig.commentCreate.verifyText) {
        await waitForText(page, replaceRunTokens(socialConfig.commentCreate.verifyText, env));
      }
      heart.addCreatedEntity({
        id: commentText,
        type: "comment",
        label: commentText,
        status: "success",
        summary: "Test-Kommentar wurde erstellt.",
        cleanupStatus: "pending",
        module: "profile",
        persona: persona.key
      });
      heart.passModule("profile", "Kommentar wurde erstellt.", {
        action: "comment create",
        persona: persona.key,
        area: "profile"
      });
    }
  });

  await runConfiguredSocialMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "feed",
    actionLabel: "Post create",
    config: socialConfig.postCreate,
    requiredKeys: ["url", "inputSelector", "submitSelector"],
    perform: async () => {
      await openPageAndWait(page, socialConfig.postCreate.url, "body", heart, {
        title: "User / Open post composer target",
        moduleKey: "feed",
        area: "feed",
        persona: persona.key
      });
      if (socialConfig.postCreate.openSelector) {
        await clickIfPresent(page, socialConfig.postCreate.openSelector);
      }
      const postText = replaceRunTokens(
        socialConfig.postCreate.messageTemplate || "TEST_RUN_<runId>_POST_1",
        env
      );
      await fillIfPresent(page, socialConfig.postCreate.inputSelector, postText);
      await clickIfPresent(page, socialConfig.postCreate.submitSelector);
      if (socialConfig.postCreate.verifyText) {
        await waitForText(page, replaceRunTokens(socialConfig.postCreate.verifyText, env));
      }
      heart.addCreatedEntity({
        id: postText,
        type: "post",
        label: postText,
        status: "success",
        summary: "Test-Beitrag wurde erstellt.",
        cleanupStatus: "pending",
        module: "feed",
        persona: persona.key
      });
      heart.passModule("feed", "Beitrag wurde erstellt.", {
        action: "post create",
        persona: persona.key,
        area: "feed"
      });
    }
  });

  heart.notConfiguredModule("profile", "Unfollow braucht noch eigene Selektoren und einen Erfolgsnachweis.", {
    action: "unfollow",
    persona: persona.key,
    area: "profile"
  });
  heart.notConfiguredModule("feed", "Unlike braucht noch eigene Selektoren und eine saubere Zaehler-Pruefung.", {
    action: "unlike",
    persona: persona.key,
    area: "feed"
  });
  heart.notConfiguredModule("profile", "Kommentar-Loeschung braucht noch sichere Loeschregeln.", {
    action: "comment delete",
    persona: persona.key,
    area: "profile"
  });
  heart.notConfiguredModule("feed", "Beitrags-Loeschung braucht noch sichere Loeschregeln.", {
    action: "post delete",
    persona: persona.key,
    area: "feed"
  });
}
