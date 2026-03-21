import path from "node:path";
import {
  buildUrl,
  clickIfPresent,
  ensureElementVisible,
  fillIfPresent,
  openSocialTab,
  openPageAndWait,
  readCountValue,
  setInputFilesIfPresent,
  waitForAnySelector,
  waitForSelectorToDisappear,
  waitForText
} from "../helpers/social-app.mjs";
import { getSocialDefaultTabs } from "../helpers/social-app.mjs";
import { runUiLayoutCheck } from "./ui-actions.mjs";
import {
  hasRequiredConfig,
  markGuarded,
  markNotConfigured,
  replaceRunTokens
} from "./common-actions.mjs";

const SOCIAL_TABS = getSocialDefaultTabs();
const PUBLIC_PROFILE_READY_SELECTORS = [
  "[data-public-profile-follow]",
  "[data-open-chat=\"profile\"]",
  "[data-business-top-tab]",
  "[data-profile-top-tab]"
];
const PUBLIC_PROFILE_RESULT_SELECTORS = Object.freeze({
  business: "[data-search-user]",
  default: "[data-search-business]"
});

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function uniqueSelectors(...values) {
  const seen = new Set();
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((entry) => asText(entry)).filter(Boolean);
    }
    const safeValue = asText(value);
    return safeValue ? [safeValue] : [];
  }).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function chooseFirstText(...values) {
  for (const value of values) {
    const safeValue = asText(value);
    if (safeValue) return safeValue;
  }
  return "";
}

function resolveSocialTargetProfileUrl(env = {}, persona = {}, preferredUrl = "") {
  const socialConfig = env.packConfig?.actions?.social || {};
  if (persona?.key === "business") {
    const preferredTargetUrl = chooseFirstText(
      socialConfig.userTargetProfile?.url,
      parseHandleFromUrl(preferredUrl) ? preferredUrl : ""
    );
    return preferredTargetUrl;
  }
  return chooseFirstText(
    socialConfig.businessProfile?.url,
    preferredUrl,
    socialConfig.userTargetProfile?.url
  );
}

function parseHandleFromUrl(url = "") {
  const safeUrl = asText(url);
  if (!safeUrl) return "";
  try {
    return asText(new URL(safeUrl).searchParams.get("handle"));
  } catch {
    return "";
  }
}

function resolveSocialTargetProfileContext(env = {}, persona = {}, preferredUrl = "") {
  const configPersonas = env.packConfig?.personas || {};
  const socialConfig = env.packConfig?.actions?.social || {};
  const directUrl = resolveSocialTargetProfileUrl(env, persona, preferredUrl);
  if (persona?.key === "business") {
    const userPersona = configPersonas.user || {};
    return {
      url: directUrl,
      query: asText(userPersona.displayName, userPersona.handle, parseHandleFromUrl(directUrl)),
      resultSelectors: uniqueSelectors(
        socialConfig.userTargetProfile?.resultSelector,
        PUBLIC_PROFILE_RESULT_SELECTORS.business
      )
    };
  }

  const businessPersona = configPersonas.business || {};
  return {
    url: directUrl,
    query: asText(
      env.packConfig?.restaurantName,
      businessPersona.displayName,
      businessPersona.handle,
      parseHandleFromUrl(directUrl)
    ),
    resultSelectors: uniqueSelectors(
      socialConfig.businessProfile?.resultSelector,
      PUBLIC_PROFILE_RESULT_SELECTORS.default
    )
  };
}

async function waitForPublicProfileReady(page, timeout = 20000) {
  await waitForAnySelector(page, PUBLIC_PROFILE_READY_SELECTORS, timeout);
}

async function openSocialTargetProfile(page, env, heart, persona, {
  moduleKey = "profile",
  area = "profile",
  title = "",
  preferredUrl = ""
} = {}) {
  const targetContext = resolveSocialTargetProfileContext(env, persona, preferredUrl);
  const directUrl = asText(targetContext.url);
  const allowDirectUrl = !!directUrl && (
    persona?.key !== "business"
      || !!parseHandleFromUrl(directUrl)
  );
  if (allowDirectUrl) {
    await openPageAndWait(page, directUrl, "body", heart, {
      title: title || `${persona.label} / Open profile target`,
      moduleKey,
      area,
      persona: persona.key
    });
    try {
      await ensureElementVisible(page, "[data-public-profile-follow]", 7000);
      return targetContext;
    } catch {
      // fall through to discovery search
    }
  }

  const searchConfig = env.packConfig?.actions?.discovery?.search || {};
  const searchUrl = asText(searchConfig.url, buildUrl(persona.baseUrl, { tab: "search" }));
  const searchInputSelector = asText(searchConfig.inputSelector, "#searchInput");
  const queryText = asText(
    targetContext.query,
    env.packConfig?.restaurantName,
    env.packConfig?.personas?.business?.displayName,
    env.packConfig?.personas?.business?.handle
  );
  if (!queryText) {
    throw new Error("Heart konnte kein stabiles Zielprofil fuer diese Pruefung finden.");
  }

  await openPageAndWait(page, searchUrl, searchInputSelector, heart, {
    title: title || `${persona.label} / Search profile target`,
    moduleKey,
    area,
    persona: persona.key
  });
  await fillIfPresent(page, searchInputSelector, queryText, 12000);
  await page.waitForTimeout(900);

  const resultSelectors = uniqueSelectors(
    targetContext.resultSelectors,
    PUBLIC_PROFILE_RESULT_SELECTORS.business,
    PUBLIC_PROFILE_RESULT_SELECTORS.default
  );
  await waitForAnySelector(page, resultSelectors, 20000);
  const clicked = await page.evaluate((selectors) => {
    const list = Array.isArray(selectors) ? selectors : [];
    for (const selector of list) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const node = nodes.find((entry) => {
        if (!(entry instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(entry);
        const rect = entry.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity || "1") > 0
          && rect.width > 0
          && rect.height > 0;
      });
      if (node instanceof HTMLElement) {
        node.click();
        return true;
      }
    }
    return false;
  }, resultSelectors);
  if (!clicked) {
    throw new Error("Heart konnte das Zielprofil in der Suche nicht oeffnen.");
  }

  await ensureElementVisible(page, "[data-public-profile-follow]", 20000);
  return targetContext;
}

async function readFollowState(page, selector) {
  return page.locator(selector).first().evaluate((button) => {
    const text = String(button?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return {
      text,
      following: text.includes("following"),
      requested: text.includes("request")
    };
  });
}

async function waitForFollowState(page, selector, expectedState, timeout = 15000) {
  await page.waitForFunction(
    ({ followSelector, nextState }) => {
      const button = document.querySelector(followSelector);
      if (!button) return false;
      const text = String(button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      const isFollowing = text.includes("following");
      const isRequested = text.includes("request");
      if (nextState === "following") return isFollowing || isRequested;
      if (nextState === "not_following") return !isFollowing && !isRequested;
      return false;
    },
    { followSelector: selector, nextState: expectedState },
    { timeout }
  );
}

async function clickLikeButtonToState(page, {
  selector = "",
  targetState = "liked",
  timeout = 15000
} = {}) {
  const safeSelector = asText(selector);
  if (!safeSelector) throw new Error("Heart konnte keinen Like-Button auswaehlen.");
  const firstVisibleLike = await page.evaluate((selector) => {
    const nodes = Array.from(document.querySelectorAll(selector));
    const node = nodes.find((entry) => {
      if (!(entry instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(entry);
      const rect = entry.getBoundingClientRect();
      return style.display !== "none"
        && style.visibility !== "hidden"
        && Number(style.opacity || "1") > 0
        && rect.width > 0
        && rect.height > 0;
    });
    if (!(node instanceof HTMLElement)) return null;
    return {
      postKey: node.getAttribute("data-post-like-btn") || node.getAttribute("data-feed-post-like") || "",
      selectors: [
        node.getAttribute("data-post-like-btn") ? `[data-post-like-btn="${node.getAttribute("data-post-like-btn")}"]` : "",
        node.getAttribute("data-feed-post-like") ? `[data-feed-post-like="${node.getAttribute("data-feed-post-like")}"]` : ""
      ].filter(Boolean)
    };
  }, safeSelector);
  if (!firstVisibleLike?.selectors?.length) {
    throw new Error("Heart konnte keinen stabilen sichtbaren Like-Button finden.");
  }
  const countSelector = firstVisibleLike.postKey ? `[data-post-like-count="${firstVisibleLike.postKey}"]` : "";
  const beforeCount = countSelector ? await readCountValue(page, countSelector) : null;
  const clicked = await page.evaluate((selectors) => {
    for (const selector of selectors || []) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const node = nodes.find((entry) => {
        if (!(entry instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(entry);
        const rect = entry.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity || "1") > 0
          && rect.width > 0
          && rect.height > 0;
      });
      if (node instanceof HTMLElement) {
        node.click();
        return true;
      }
    }
    return false;
  }, firstVisibleLike.selectors);
  if (!clicked) {
    throw new Error("Heart konnte den gewaehlten Like-Button nicht klicken.");
  }
  await page.waitForFunction(
    ({ likeSelectors, desiredState, likeCountSelector, previousCount }) => {
      const buttonNode = (Array.isArray(likeSelectors) ? likeSelectors : [])
        .map((selector) => document.querySelector(selector))
        .find(Boolean);
      if (!buttonNode) return false;
      const pressed = buttonNode.getAttribute("aria-pressed") === "true"
        || buttonNode.classList.contains("text-rose-400");
      const countNode = likeCountSelector ? document.querySelector(likeCountSelector) : null;
      const countMatch = String(countNode?.textContent || "").match(/-?\d+/);
      const countChanged = countMatch ? Number(countMatch[0]) !== Number(previousCount) : false;
      if (desiredState === "liked") return pressed || countChanged;
      return !pressed || countChanged;
    },
    {
      likeSelectors: firstVisibleLike.selectors,
      desiredState: targetState,
      likeCountSelector: countSelector,
      previousCount: beforeCount
    },
    { timeout }
  );
}

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
    await runUiLayoutCheck(page, heart, {
      persona,
      viewLabel: "Feed",
      action: "ui feed layout"
    });
  }, "Feed konnte nicht geoeffnet werden");

  await runSurface("profile", "profile open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.profile, {
      moduleKey: "profile",
      note: "Profil wurde geoeffnet."
    });
    await runUiLayoutCheck(page, heart, {
      persona,
      viewLabel: "Profil",
      action: "ui profile layout"
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
      await runUiLayoutCheck(page, heart, {
        persona,
        viewLabel: "Business-Profil",
        action: "ui business profile layout"
      });
    }, "Business-Profil konnte nicht geoeffnet werden");
  }

  await runSurface("menu", "menu open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.menu, {
      moduleKey: "menu",
      note: "Menue wurde geoeffnet."
    });
    await runUiLayoutCheck(page, heart, {
      persona,
      viewLabel: "Menue",
      action: "ui menu layout"
    });
  }, "Menue konnte nicht geoeffnet werden");

  await runSurface("chat", "chat open", async () => {
    await openSocialTab(page, persona, heart, SOCIAL_TABS.chat, {
      moduleKey: "chat",
      note: "Chat wurde geoeffnet."
    });
    await runUiLayoutCheck(page, heart, {
      persona,
      viewLabel: "Chat",
      action: "ui chat layout"
    });
  }, "Chat konnte nicht geoeffnet werden");
}

export async function runSocialInteractionChecks({ page, env, heart, persona, includePostCreate = false } = {}) {
  const socialConfig = env.packConfig?.actions?.social || {};
  const followTargetUrl = resolveSocialTargetProfileUrl(env, persona, socialConfig.follow?.url);

  await runConfiguredSocialMutation({
    page,
    env,
    heart,
    persona,
    moduleKey: "profile",
    actionLabel: "Follow action",
    config: {
      ...socialConfig.follow,
      url: followTargetUrl
    },
    requiredKeys: ["triggerSelector"],
    perform: async () => {
      await openSocialTargetProfile(page, env, heart, persona, {
        moduleKey: "profile",
        area: "profile",
        title: `${persona.label} / Open follow target`,
        preferredUrl: followTargetUrl
      });
      await ensureElementVisible(page, socialConfig.follow.triggerSelector, 15000);
      const beforeState = await readFollowState(page, socialConfig.follow.triggerSelector);
      if (beforeState.following || beforeState.requested) {
        await page.locator(socialConfig.follow.triggerSelector).first().click({ timeout: 8000 });
        await waitForFollowState(page, socialConfig.follow.triggerSelector, "not_following", 15000);
      }
      await page.locator(socialConfig.follow.triggerSelector).first().click({ timeout: 8000 });
      await waitForFollowState(page, socialConfig.follow.triggerSelector, "following", 15000);
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
        title: `${persona.label} / Open like target`,
        moduleKey: "feed",
        area: "feed",
        persona: persona.key
      });
      await ensureElementVisible(page, socialConfig.like.triggerSelector, 15000);
      const alreadyLiked = await page.waitForFunction(
        (selector) => {
          const nodes = Array.from(document.querySelectorAll(selector));
          const button = nodes.find((entry) => {
            if (!(entry instanceof HTMLElement)) return false;
            const style = window.getComputedStyle(entry);
            const rect = entry.getBoundingClientRect();
            return style.display !== "none"
              && style.visibility !== "hidden"
              && Number(style.opacity || "1") > 0
              && rect.width > 0
              && rect.height > 0;
          });
          if (!(button instanceof HTMLElement)) return false;
          return button.getAttribute("aria-pressed") === "true"
            || button.classList.contains("text-rose-400");
        },
        socialConfig.like.triggerSelector,
        { timeout: 600 }
      ).then(() => true).catch(() => false);
      if (alreadyLiked) {
        await clickLikeButtonToState(page, {
          selector: socialConfig.like.triggerSelector,
          targetState: "unliked",
          timeout: 15000
        });
      }
      await clickLikeButtonToState(page, {
        selector: socialConfig.like.triggerSelector,
        targetState: "liked",
        timeout: 15000
      });
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
        const opened = await clickIfPresent(page, socialConfig.commentCreate.openComposerSelector);
        if (!opened) {
          throw new Error("Heart konnte keinen Kommentar-Trigger auf dem Feed finden.");
        }
      }
      const commentText = replaceRunTokens(
        socialConfig.commentCreate.messageTemplate || "TEST_RUN_<runId>_COMMENT_1",
        env
      );
      await fillIfPresent(page, socialConfig.commentCreate.inputSelector, commentText);
      await clickIfPresent(page, socialConfig.commentCreate.submitSelector);
      if (socialConfig.commentCreate.verifySelector) {
        await ensureElementVisible(page, socialConfig.commentCreate.verifySelector, 15000);
      }
      if (socialConfig.commentCreate.verifyText) {
        await waitForText(page, replaceRunTokens(socialConfig.commentCreate.verifyText, env), 20000);
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

  if (includePostCreate) {
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
        const filePath = path.isAbsolute(String(socialConfig.postCreate.filePath || "").trim())
          ? String(socialConfig.postCreate.filePath || "").trim()
          : path.resolve(env.rootDir, String(socialConfig.postCreate.filePath || "apps/mnyra-heart/assets/icon-192.png").trim());
        const fileSelected = await setInputFilesIfPresent(
          page,
          socialConfig.postCreate.fileInputSelector || "#uploadFileInput",
          filePath
        );
        if (!fileSelected) {
          throw new Error("Heart konnte kein Upload-Feld fuer den Feed-Post finden.");
        }
        await fillIfPresent(page, socialConfig.postCreate.inputSelector, postText);
        await clickIfPresent(page, socialConfig.postCreate.submitSelector);
        await waitForSelectorToDisappear(page, socialConfig.postCreate.inputSelector, 30000).catch(() => undefined);
        if (socialConfig.postCreate.verifyText) {
          await waitForText(page, replaceRunTokens(socialConfig.postCreate.verifyText, env), 30000);
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
  }
}

export async function runUserSocialMutationChecks({ page, env, heart, persona } = {}) {
  await runSocialInteractionChecks({
    page,
    env,
    heart,
    persona,
    includePostCreate: true
  });
}
