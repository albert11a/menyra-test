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
      `${actionLabel} is guarded. Enable isolated mutation mode first.`,
      { action: actionLabel, persona: persona?.key, area: moduleKey }
    );
    return { ok: false, reason: "guarded" };
  }
  if (!hasRequiredConfig(config, requiredKeys)) {
    markNotConfigured(
      heart,
      moduleKey,
      `${actionLabel} needs setup before it can run safely.`,
      { action: actionLabel, persona: persona?.key, area: moduleKey }
    );
    return { ok: false, reason: "not_configured" };
  }
  await perform();
  return { ok: true };
}

export async function runSocialSurfaceChecks({ page, env, heart, persona } = {}) {
  await openSocialTab(page, persona, heart, SOCIAL_TABS.feed, {
    moduleKey: "feed",
    note: "Feed surface opened."
  });
  await openSocialTab(page, persona, heart, SOCIAL_TABS.profile, {
    moduleKey: "profile",
    note: "Profile surface opened."
  });

  const businessProfileUrl = env.packConfig?.actions?.social?.businessProfile?.url;
  if (businessProfileUrl) {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.profile, {
      moduleKey: "business",
      note: "Business profile opened through configured URL.",
      absolute: businessProfileUrl
    });
  } else {
    heart.notConfiguredModule("business", "Business profile URL is not configured.", {
      action: "business profile open",
      persona: persona.key,
      area: "business"
    });
  }

  await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
    moduleKey: "menu",
    note: "Menu surface opened."
  });

  await openSocialTab(page, persona, heart, SOCIAL_TABS.chat, {
    moduleKey: "chat",
    note: "Chat surface opened."
  });
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
      heart.passModule("profile", "Follow action completed.", {
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
      heart.passModule("feed", "Like action completed.", {
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
        summary: "Synthetic comment created.",
        cleanupStatus: "pending",
        module: "profile",
        persona: persona.key
      });
      heart.passModule("profile", "Comment create action completed.", {
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
        summary: "Synthetic post created.",
        cleanupStatus: "pending",
        module: "feed",
        persona: persona.key
      });
      heart.passModule("feed", "Post create action completed.", {
        action: "post create",
        persona: persona.key,
        area: "feed"
      });
    }
  });

  heart.notConfiguredModule("profile", "Unfollow automation still needs explicit selectors and verification rules.", {
    action: "unfollow",
    persona: persona.key,
    area: "profile"
  });
  heart.notConfiguredModule("feed", "Unlike automation still needs explicit selectors and count verification rules.", {
    action: "unlike",
    persona: persona.key,
    area: "feed"
  });
  heart.notConfiguredModule("profile", "Comment delete automation still needs explicit selectors and cleanup rules.", {
    action: "comment delete",
    persona: persona.key,
    area: "profile"
  });
  heart.notConfiguredModule("feed", "Post delete automation still needs explicit selectors and cleanup rules.", {
    action: "post delete",
    persona: persona.key,
    area: "feed"
  });
}
