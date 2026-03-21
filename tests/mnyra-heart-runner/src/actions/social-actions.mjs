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
  return page.evaluate((followSelector) => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const nodes = Array.from(document.querySelectorAll(followSelector));
    const button = nodes.find((entry) => isVisibleNode(entry)) || nodes[0];
    const text = String(button?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return {
      text,
      following: text.includes("following"),
      requested: text.includes("request")
    };
  }, selector);
}

async function clickVisibleFollowButton(page, selector, timeout = 8000) {
  const deadline = Date.now() + Math.max(250, Number(timeout) || 0);
  while (Date.now() < deadline) {
    const clicked = await page.evaluate((followSelector) => {
      const isVisibleNode = (node) => {
        if (!(node instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
          return false;
        }
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const nodes = Array.from(document.querySelectorAll(followSelector));
      const button = nodes.find((entry) => isVisibleNode(entry));
      if (!(button instanceof HTMLElement)) return false;
      button.click();
      return true;
    }, selector);
    if (clicked) return true;
    await page.waitForTimeout(120).catch(() => undefined);
  }
  return false;
}

async function waitForFollowState(page, selector, expectedState, timeout = 15000) {
  await page.waitForFunction(
    ({ followSelector, nextState }) => {
      const isVisibleNode = (node) => {
        if (!(node instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
          return false;
        }
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const buttons = Array.from(document.querySelectorAll(followSelector));
      const visibleButtons = buttons.filter((entry) => isVisibleNode(entry));
      const effectiveButtons = visibleButtons.length ? visibleButtons : buttons;
      if (!effectiveButtons.length) return false;
      const states = effectiveButtons.map((button) => {
        const text = String(button.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
        return {
          following: text.includes("following"),
          requested: text.includes("request")
        };
      });
      if (nextState === "following") {
        return states.some((item) => item.following || item.requested);
      }
      if (nextState === "not_following") {
        return states.some((item) => !item.following && !item.requested);
      }
      return false;
    },
    { followSelector: selector, nextState: expectedState },
    { timeout }
  );
}

async function collectVisibleLikeCandidates(page, selector = "") {
  const safeSelector = asText(selector);
  if (!safeSelector) return [];
  return page.evaluate((likeSelector) => {
    const escapeSelectorValue = (value = "") => {
      const safeValue = String(value || "");
      if (globalThis.CSS?.escape) {
        return globalThis.CSS.escape(safeValue);
      }
      return safeValue.replace(/["\\]/g, "\\$&");
    };
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const nodes = Array.from(document.querySelectorAll(likeSelector));
    const seen = new Set();
    return nodes.flatMap((node) => {
      if (!(node instanceof HTMLElement) || !isVisibleNode(node)) return [];
      const postLikeKey = String(node.getAttribute("data-post-like-btn") || "").trim();
      const feedLikeKey = String(node.getAttribute("data-feed-post-like") || "").trim();
      const postKey = postLikeKey || feedLikeKey;
      const selectors = [
        postLikeKey ? `[data-post-like-btn="${escapeSelectorValue(postLikeKey)}"]` : "",
        feedLikeKey ? `[data-feed-post-like="${escapeSelectorValue(feedLikeKey)}"]` : ""
      ].filter(Boolean);
      if (!selectors.length) return [];
      const key = selectors.join("|");
      if (seen.has(key)) return [];
      seen.add(key);
      return [{
        key,
        postKey,
        selectors,
        pressed: node.getAttribute("aria-pressed") === "true"
          || node.classList.contains("text-rose-400")
      }];
    });
  }, safeSelector);
}

async function clickVisibleLikeCandidate(page, selectors = []) {
  return page.evaluate((selectorList) => {
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    for (const selector of Array.isArray(selectorList) ? selectorList : []) {
      const nodes = Array.from(document.querySelectorAll(selector));
      const button = nodes.find((entry) => isVisibleNode(entry));
      if (button instanceof HTMLElement) {
        button.click();
        return true;
      }
    }
    return false;
  }, selectors);
}

async function waitForLikeCandidateState(page, {
  selectors = [],
  targetState = "liked",
  countSelector = "",
  previousCount = null,
  timeout = 15000
} = {}) {
  await page.waitForFunction(
    ({
      likeSelectors,
      desiredState,
      likeCountSelector,
      previousValue
    }) => {
      const isVisibleNode = (node) => {
        if (!(node instanceof HTMLElement)) return false;
        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
          return false;
        }
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const buttons = [];
      for (const selector of Array.isArray(likeSelectors) ? likeSelectors : []) {
        document.querySelectorAll(selector).forEach((node) => {
          if (node instanceof HTMLElement) buttons.push(node);
        });
      }
      const visibleButtons = buttons.filter((node) => isVisibleNode(node));
      const effectiveButtons = visibleButtons.length ? visibleButtons : buttons;
      const pressedStates = effectiveButtons.map((button) => {
        return button.getAttribute("aria-pressed") === "true"
          || button.classList.contains("text-rose-400");
      });
      const anyPressed = pressedStates.some(Boolean);
      const anyUnpressed = pressedStates.some((value) => !value);
      const countNode = likeCountSelector
        ? Array.from(document.querySelectorAll(likeCountSelector)).find((node) => isVisibleNode(node)) || document.querySelector(likeCountSelector)
        : null;
      const countMatch = String(countNode?.textContent || "").match(/-?\d+/);
      const countChanged = countMatch ? Number(countMatch[0]) !== Number(previousValue) : false;
      if (desiredState === "liked") return anyPressed || countChanged;
      return anyUnpressed || countChanged;
    },
    {
      likeSelectors: selectors,
      desiredState: targetState,
      likeCountSelector: countSelector,
      previousValue: previousCount
    },
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
  const candidates = await collectVisibleLikeCandidates(page, safeSelector);
  if (!candidates.length) {
    throw new Error("Heart konnte keinen stabilen sichtbaren Like-Button finden.");
  }
  for (const candidate of candidates) {
    const countSelector = candidate.postKey ? `[data-post-like-count="${candidate.postKey}"]` : "";
    const beforeCount = countSelector ? await readCountValue(page, countSelector) : null;
    const clicked = await clickVisibleLikeCandidate(page, candidate.selectors);
    if (!clicked) continue;
    const didReachTargetState = await waitForLikeCandidateState(page, {
      selectors: candidate.selectors,
      targetState,
      countSelector,
      previousCount: beforeCount,
      timeout
    }).then(() => true).catch(() => false);
    if (didReachTargetState) {
      return;
    }
  }
  throw new Error(`Heart konnte keinen sichtbaren Like-Button stabil in den Zustand "${targetState}" bringen.`);
}

async function runLikeAction(page, selector = "") {
  const candidates = await collectVisibleLikeCandidates(page, selector);
  if (!candidates.length) {
    throw new Error("Heart konnte keinen sichtbaren Like-Button im Feed finden.");
  }
  for (const candidate of candidates) {
    if (candidate.pressed) {
      const countSelector = candidate.postKey ? `[data-post-like-count="${candidate.postKey}"]` : "";
      const beforeUnlikeCount = countSelector ? await readCountValue(page, countSelector) : null;
      const unliked = await clickVisibleLikeCandidate(page, candidate.selectors);
      if (!unliked) continue;
      const unlikeSucceeded = await waitForLikeCandidateState(page, {
        selectors: candidate.selectors,
        targetState: "unliked",
        countSelector,
        previousCount: beforeUnlikeCount,
        timeout: 15000
      }).then(() => true).catch(() => false);
      if (!unlikeSucceeded) continue;
    }
    await clickLikeButtonToState(page, {
      selector,
      targetState: "liked",
      timeout: 15000
    });
    return;
  }
  await clickLikeButtonToState(page, {
    selector,
    targetState: "liked",
    timeout: 15000
  });
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
        const cleared = await clickVisibleFollowButton(page, socialConfig.follow.triggerSelector, 8000);
        if (!cleared) {
          throw new Error("Heart konnte den sichtbaren Follow-Button nicht fuer den Reset klicken.");
        }
        await waitForFollowState(page, socialConfig.follow.triggerSelector, "not_following", 15000);
      }
      const clicked = await clickVisibleFollowButton(page, socialConfig.follow.triggerSelector, 8000);
      if (!clicked) {
        throw new Error("Heart konnte den sichtbaren Follow-Button nicht klicken.");
      }
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
      await runLikeAction(page, socialConfig.like.triggerSelector);
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
