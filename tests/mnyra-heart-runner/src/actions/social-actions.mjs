import path from "node:path";
import {
  buildUrl,
  clickIfPresent,
  ensureElementVisible,
  fillIfPresent,
  findVisibleSelector,
  openSocialTab,
  openPageAndWait,
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

function asText(value, fallback = "", ...restFallbacks) {
  const text = String(value || "").trim();
  if (text) return text;
  if (restFallbacks.length) {
    return [fallback, ...restFallbacks]
      .map((entry) => String(entry || "").trim())
      .find(Boolean) || "";
  }
  return String(fallback || "").trim();
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

function parseHandleFromUrl(url = "") {
  const safeUrl = asText(url);
  if (!safeUrl) return "";
  try {
    return asText(new URL(safeUrl).searchParams.get("handle"));
  } catch {
    return "";
  }
}

function parseRestaurantIdFromUrl(url = "") {
  const safeUrl = asText(url);
  if (!safeUrl) return "";
  try {
    const searchParams = new URL(safeUrl).searchParams;
    return chooseFirstText(
      searchParams.get("r"),
      searchParams.get("restaurant"),
      searchParams.get("restaurantId"),
      searchParams.get("rid"),
      searchParams.get("businessId")
    );
  } catch {
    return "";
  }
}

function buildSearchQueries(...values) {
  const baseQueries = uniqueSelectors(...values);
  const expandedQueries = [];
  for (const query of baseQueries) {
    expandedQueries.push(query);
    if (!query.startsWith("@")) {
      expandedQueries.push(`@${query.replace(/^@+/, "")}`);
    }
  }
  return uniqueSelectors(expandedQueries);
}

async function clickMatchingSearchResult(page, selectors = [], queries = []) {
  return page.evaluate(({ selectorList, queryList }) => {
    const normalize = (value) => String(value || "").trim().toLowerCase();
    const isVisibleNode = (node) => {
      if (!(node instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") === 0) {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const queriesNorm = Array.isArray(queryList)
      ? queryList.map((entry) => normalize(entry)).filter(Boolean)
      : [];
    const candidates = [];
    for (const selector of Array.isArray(selectorList) ? selectorList : []) {
      document.querySelectorAll(selector).forEach((node) => {
        if (!(node instanceof HTMLElement) || !isVisibleNode(node)) return;
        candidates.push(node);
      });
    }
    if (!candidates.length) return false;

    const scoreCandidate = (node) => {
      const text = normalize(node.innerText || node.textContent || "");
      const handle = normalize(node.dataset.searchHandle || "");
      const name = normalize(node.dataset.searchName || "");
      let score = 0;
      for (const query of queriesNorm) {
        const bareQuery = query.replace(/^@+/, "");
        if (handle && bareQuery && handle === bareQuery) score = Math.max(score, 100);
        if (name && query && name.includes(query)) score = Math.max(score, 80);
        if (text && query && text.includes(query)) score = Math.max(score, 60);
        if (text && bareQuery && text.includes(bareQuery)) score = Math.max(score, 50);
      }
      return score;
    };

    let chosen = candidates[0];
    let bestScore = -1;
    for (const candidate of candidates) {
      const score = scoreCandidate(candidate);
      if (score > bestScore) {
        bestScore = score;
        chosen = candidate;
      }
    }
    if (!(chosen instanceof HTMLElement)) return false;
    chosen.click();
    return true;
  }, {
    selectorList: selectors,
    queryList: queries
  });
}

function resolveSocialTargetProfileUrl(env = {}, persona = {}, preferredUrl = "") {
  const socialConfig = env.packConfig?.actions?.social || {};
  if (persona?.key === "business") {
    return "";
  }
  return chooseFirstText(
    parseRestaurantIdFromUrl(preferredUrl) ? preferredUrl : "",
    parseRestaurantIdFromUrl(socialConfig.businessProfile?.url) ? socialConfig.businessProfile.url : "",
    parseRestaurantIdFromUrl(socialConfig.userTargetProfile?.url) ? socialConfig.userTargetProfile.url : ""
  );
}

function resolveSocialTargetProfileContext(env = {}, persona = {}, preferredUrl = "") {
  const configPersonas = env.packConfig?.personas || {};
  const socialConfig = env.packConfig?.actions?.social || {};
  const directUrl = resolveSocialTargetProfileUrl(env, persona, preferredUrl);
  if (persona?.key === "business") {
    const userPersona = configPersonas.user || {};
    return {
      url: directUrl,
      queries: buildSearchQueries(
        userPersona.displayName,
        userPersona.handle,
        socialConfig.userTargetProfile?.query,
        parseHandleFromUrl(directUrl)
      ),
      resultSelectors: uniqueSelectors(
        socialConfig.userTargetProfile?.resultSelector,
        PUBLIC_PROFILE_RESULT_SELECTORS.business
      )
    };
  }

  const businessPersona = configPersonas.business || {};
  return {
    url: directUrl,
    queries: buildSearchQueries(
      env.packConfig?.restaurantName,
      businessPersona.displayName,
      businessPersona.handle,
      socialConfig.businessProfile?.query,
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
  const allowDirectUrl = !!parseRestaurantIdFromUrl(directUrl);
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
  const searchQueries = buildSearchQueries(
    targetContext.queries,
    env.packConfig?.restaurantName,
    env.packConfig?.personas?.business?.displayName,
    env.packConfig?.personas?.business?.handle
  );
  if (!searchQueries.length) {
    throw new Error("Heart konnte kein stabiles Zielprofil fuer diese Pruefung finden.");
  }

  await openPageAndWait(page, searchUrl, searchInputSelector, heart, {
    title: title || `${persona.label} / Search profile target`,
    moduleKey,
    area,
    persona: persona.key
  });

  const resultSelectors = uniqueSelectors(
    targetContext.resultSelectors,
    PUBLIC_PROFILE_RESULT_SELECTORS.business,
    PUBLIC_PROFILE_RESULT_SELECTORS.default
  );
  let clicked = false;
  for (const queryText of searchQueries) {
    await fillIfPresent(page, searchInputSelector, queryText, 12000);
    await page.waitForTimeout(1200);
    const matchedSelector = await waitForAnySelector(page, resultSelectors, 10000)
      .then((selector) => selector)
      .catch(() => "");
    if (!matchedSelector) {
      continue;
    }
    clicked = await clickMatchingSearchResult(page, resultSelectors, [queryText, ...searchQueries]);
    if (clicked) {
      break;
    }
  }
  if (!clicked) {
    throw new Error("Heart konnte das Zielprofil in der Suche nicht oeffnen.");
  }

  await waitForPublicProfileReady(page, 20000);
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

async function ensureFollowActive(page, selector, timeout = 15000) {
  const initial = await readFollowState(page, selector);
  if (initial.following || initial.requested) {
    return initial;
  }
  let lastState = initial;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const clicked = await clickVisibleFollowButton(page, selector, 8000);
    if (!clicked) {
      throw new Error("Heart konnte den sichtbaren Follow-Button nicht klicken.");
    }
    const reachedTarget = await waitForFollowState(page, selector, "following", timeout)
      .then(() => true)
      .catch(() => false);
    lastState = await readFollowState(page, selector);
    if (reachedTarget || lastState.following || lastState.requested) {
      return lastState;
    }
    await page.waitForTimeout(600).catch(() => undefined);
  }
  throw new Error("Heart konnte den Follow-Zustand nicht stabil auf Following/Requested bringen.");
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

async function readLikeCandidateSnapshot(page, {
  selectors = [],
  countSelector = "",
} = {}) {
  return page.evaluate(
    ({
      likeSelectors,
      likeCountSelector
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
      const button = effectiveButtons[0] || null;
      const countNode = likeCountSelector
        ? Array.from(document.querySelectorAll(likeCountSelector)).find((node) => isVisibleNode(node)) || document.querySelector(likeCountSelector)
        : null;
      return {
        countValue: String(countNode?.textContent || "").replace(/\s+/g, " ").trim(),
        buttonText: String(button?.textContent || "").replace(/\s+/g, " ").trim(),
        buttonClass: String(button?.getAttribute("class") || "").trim(),
        pressed: button?.getAttribute("aria-pressed") === "true"
      };
    },
    {
      likeSelectors: selectors,
      likeCountSelector: countSelector
    }
  );
}

async function waitForLikeInteraction(page, {
  selectors = [],
  countSelector = "",
  previousSnapshot = {},
  timeout = 15000
} = {}) {
  await page.waitForFunction(
    ({
      likeSelectors,
      likeCountSelector,
      previous
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
      const button = effectiveButtons[0] || null;
      const countNode = likeCountSelector
        ? Array.from(document.querySelectorAll(likeCountSelector)).find((node) => isVisibleNode(node)) || document.querySelector(likeCountSelector)
        : null;
      const currentCount = String(countNode?.textContent || "").replace(/\s+/g, " ").trim();
      const currentText = String(button?.textContent || "").replace(/\s+/g, " ").trim();
      const currentClass = String(button?.getAttribute("class") || "").trim();
      const currentPressed = button?.getAttribute("aria-pressed") === "true";
      return currentCount !== String(previous?.countValue || "")
        || currentText !== String(previous?.buttonText || "")
        || currentClass !== String(previous?.buttonClass || "")
        || currentPressed !== !!previous?.pressed;
    },
    {
      likeSelectors: selectors,
      likeCountSelector: countSelector,
      previous: previousSnapshot
    },
    { timeout }
  );
}

async function runLikeAction(page, selector = "") {
  const candidates = await collectVisibleLikeCandidates(page, selector);
  if (!candidates.length) {
    throw new Error("Heart konnte keinen sichtbaren Like-Button im Feed finden.");
  }
  const pendingCandidates = candidates.filter((candidate) => !candidate.pressed);
  if (!pendingCandidates.length && candidates.some((candidate) => candidate.pressed)) {
    return;
  }
  for (const candidate of pendingCandidates.length ? pendingCandidates : candidates) {
    const countSelector = candidate.postKey ? `[data-post-like-count="${candidate.postKey}"]` : "";
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const previousSnapshot = await readLikeCandidateSnapshot(page, {
        selectors: candidate.selectors,
        countSelector
      });
      if (previousSnapshot?.pressed) {
        return;
      }
      const clicked = await clickVisibleLikeCandidate(page, candidate.selectors);
      if (!clicked) continue;
      const didInteract = await waitForLikeInteraction(page, {
        selectors: candidate.selectors,
        countSelector,
        previousSnapshot,
        timeout: 20000
      }).then(() => true).catch(() => false);
      if (didInteract) {
        const nextSnapshot = await readLikeCandidateSnapshot(page, {
          selectors: candidate.selectors,
          countSelector
        });
        if (nextSnapshot?.pressed) {
          return;
        }
        continue;
      }
      await page.waitForTimeout(700).catch(() => undefined);
    }
  }
  throw new Error("Heart konnte keinen sichtbaren Like-Button stabil in den Zustand \"liked\" bringen.");
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
      await ensureFollowActive(page, socialConfig.follow.triggerSelector, 15000);
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
        await waitForAnySelector(page, [
          socialConfig.postCreate.fileInputSelector || "#uploadFileInput",
          "#uploadFileTrigger",
          socialConfig.postCreate.inputSelector || "#uploadCaption"
        ], 20000);
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
          const composerVisible = await findVisibleSelector(page, [
            socialConfig.postCreate.fileInputSelector || "#uploadFileInput",
            "#uploadFileTrigger"
          ]);
          if (!composerVisible) {
            throw new Error("Heart konnte den Feed-Post-Composer nicht sichtbar oeffnen.");
          }
          throw new Error("Heart konnte kein Upload-Feld fuer den Feed-Post finden.");
        }
        await waitForAnySelector(page, [
          socialConfig.postCreate.inputSelector || "#uploadCaption",
          socialConfig.postCreate.submitSelector || "#uploadPostBtn"
        ], 20000);
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
