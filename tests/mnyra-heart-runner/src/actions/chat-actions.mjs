import {
  buildUrl,
  clickFirstVisible,
  ensureElementVisible,
  fillIfPresent,
  findVisibleSelector,
  openPageAndWait,
  waitForAnySelector
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured, replaceRunTokens } from "./common-actions.mjs";

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

function toList(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((entry) => asText(entry)).filter(Boolean);
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

function buildChatRouteUrl(baseUrl = "", targetUid = "") {
  const safeBaseUrl = asText(baseUrl);
  const safeTargetUid = asText(targetUid);
  if (!safeBaseUrl || !safeTargetUid) return "";
  try {
    const url = new URL(safeBaseUrl);
    url.searchParams.set("tab", "chat");
    url.searchParams.set("chat", safeTargetUid);
    return url.toString();
  } catch {
    return safeBaseUrl;
  }
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
    return asText(
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
  const baseQueries = uniqueList(...values);
  const expandedQueries = [];
  for (const query of baseQueries) {
    expandedQueries.push(query);
    if (!query.startsWith("@")) {
      expandedQueries.push(`@${query.replace(/^@+/, "")}`);
    }
  }
  return uniqueList(expandedQueries);
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

function resolveChatTargetContext(env = {}, persona = {}, sendConfig = {}) {
  const configPersonas = env.packConfig?.personas || {};
  const socialConfig = env.packConfig?.actions?.social || {};
  if (persona?.key === "business") {
    const userPersona = configPersonas.user || {};
    const targetUid = asText(sendConfig.userTargetUid, userPersona.uid, sendConfig.targetUid);
    const targetProfileUrl = asText(
      parseRestaurantIdFromUrl(sendConfig.userTargetProfileUrl) ? sendConfig.userTargetProfileUrl : "",
      parseRestaurantIdFromUrl(socialConfig.userTargetProfile?.url) ? socialConfig.userTargetProfile.url : ""
    );
    return {
      targetUid,
      targetProfileUrl,
      threadUrl: buildChatRouteUrl(sendConfig.url, targetUid),
      searchQueries: buildSearchQueries(
        userPersona.displayName,
        userPersona.handle,
        socialConfig.userTargetProfile?.query,
        parseHandleFromUrl(sendConfig.userTargetProfileUrl || socialConfig.userTargetProfile?.url || sendConfig.targetProfileUrl)
      )
    };
  }
  const businessPersona = configPersonas.business || {};
  const targetUid = asText(sendConfig.targetUid, businessPersona.uid);
  const targetProfileUrl = asText(
    parseRestaurantIdFromUrl(sendConfig.targetProfileUrl) ? sendConfig.targetProfileUrl : "",
    parseRestaurantIdFromUrl(socialConfig.businessProfile?.url) ? socialConfig.businessProfile.url : "",
    parseRestaurantIdFromUrl(socialConfig.userTargetProfile?.url) ? socialConfig.userTargetProfile.url : ""
  );
  return {
    targetUid,
    targetProfileUrl,
    threadUrl: buildChatRouteUrl(sendConfig.url, targetUid),
    searchQueries: buildSearchQueries(
      env.packConfig?.restaurantName,
      businessPersona.displayName,
      businessPersona.handle,
      parseHandleFromUrl(sendConfig.targetProfileUrl || socialConfig.businessProfile?.url || socialConfig.userTargetProfile?.url)
    )
  };
}

async function openChatTargetViaSearch(page, env, heart, persona, targetContext = {}, openTargetSelectors = []) {
  const searchConfig = env.packConfig?.actions?.discovery?.search || {};
  const searchUrl = asText(searchConfig.url, buildUrl(persona.baseUrl, { tab: "search" }));
  const searchInputSelector = asText(searchConfig.inputSelector, "#searchInput");
  const searchQueries = buildSearchQueries(targetContext.searchQueries);
  if (!searchQueries.length) return false;
  const resultSelectors = persona?.key === "business"
    ? ["[data-search-user]", "[data-search-business]"]
    : ["[data-search-business]", "[data-search-user]"];

  await openPageAndWait(page, searchUrl, searchInputSelector, heart, {
    title: `${persona.label} / Search chat target`,
    moduleKey: "chat",
    area: "chat",
    persona: persona.key
  });
  for (const searchQuery of searchQueries) {
    await fillIfPresent(page, searchInputSelector, searchQuery, 12000);
    await page.waitForTimeout(1200);
    const matchedSelector = await waitForAnySelector(page, resultSelectors, 10000)
      .then((selector) => selector)
      .catch(() => "");
    if (!matchedSelector) continue;
    const openedResult = await clickMatchingSearchResult(page, resultSelectors, [searchQuery, ...searchQueries]);
    if (!openedResult) continue;
    const openedTargetThread = await clickFirstVisible(page, openTargetSelectors, 15000);
    if (openedTargetThread) return true;
  }
  return false;
}

async function ensureChatComposerReady(page, env, sendConfig = {}, heart, persona) {
  const composerSelector = asText(sendConfig.composerSelector, "#chatMessageInput");
  const threadViewSelector = asText(sendConfig.threadViewSelector, "#chatThreadView");
  const messagesSelector = asText(sendConfig.messagesSelector, "#chatMessages");
  const targetContext = resolveChatTargetContext(env, persona, sendConfig);
  const threadTargetUid = asText(targetContext.targetUid);
  const threadTargetUrls = uniqueList(
    targetContext.threadUrl,
    persona?.key === "business" ? "" : sendConfig.threadUrl,
    buildChatRouteUrl(sendConfig.url, threadTargetUid)
  );
  const openThreadSelectors = uniqueList(
    sendConfig.openThreadSelector,
    "[data-chat-open-thread]"
  );
  const openTargetSelectors = uniqueList(
    sendConfig.openTargetSelector,
    "[data-open-chat]",
    "#profileChatBtn",
    "#chatBtn"
  );
  const threadReadySelectors = uniqueList(threadViewSelector, messagesSelector, composerSelector);

  const composerVisible = await findVisibleSelector(page, [composerSelector]);
  if (composerVisible) return composerSelector;

  const openedExistingThread = await clickFirstVisible(page, openThreadSelectors, 8000);
  if (openedExistingThread) {
    await ensureElementVisible(page, composerSelector, 15000);
    return composerSelector;
  }

  for (const threadTargetUrl of threadTargetUrls) {
    if (!asText(threadTargetUrl)) continue;
    await openPageAndWait(page, threadTargetUrl, "body", heart, {
      title: `${persona.label} / Open direct chat thread`,
      moduleKey: "chat",
      area: "chat",
      persona: persona.key
    });
    const directThreadReady = await Promise.race([
      page.locator(composerSelector).first().waitFor({ state: "visible", timeout: 20000 }).then(() => true).catch(() => false),
      page.locator(threadReadySelectors.join(", ")).first().waitFor({ state: "visible", timeout: 20000 }).then(() => true).catch(() => false)
    ]);
    if (!directThreadReady) continue;
    const openedThreadAfterRoute = await clickFirstVisible(page, openThreadSelectors, 4000);
    if (openedThreadAfterRoute) {
      await page.waitForTimeout(400).catch(() => undefined);
    }
    await ensureElementVisible(page, composerSelector, 15000);
    return composerSelector;
  }

  const targetUrls = persona?.key === "business"
    ? uniqueList(targetContext.targetProfileUrl, sendConfig.userTargetProfileUrl)
    : uniqueList(
      targetContext.targetProfileUrl,
      sendConfig.targetProfileUrl,
      env.packConfig?.actions?.social?.businessProfile?.url
    );

  for (const targetUrl of targetUrls) {
    if (!asText(targetUrl)) continue;
    await openPageAndWait(page, targetUrl, "body", heart, {
      title: `${persona.label} / Open chat profile target`,
      moduleKey: "chat",
      area: "chat",
      persona: persona.key
    });
    const openedTargetThread = await clickFirstVisible(page, openTargetSelectors, 15000);
    if (!openedTargetThread) continue;
    await Promise.race([
      page.locator(composerSelector).first().waitFor({ state: "visible", timeout: 15000 }),
      page.locator(threadReadySelectors.join(", ")).first().waitFor({ state: "visible", timeout: 15000 })
    ]);
    const openedThreadFromList = await clickFirstVisible(page, openThreadSelectors, 4000);
    if (openedThreadFromList) {
      await page.waitForTimeout(400).catch(() => undefined);
    }
    await ensureElementVisible(page, composerSelector, 15000);
    return composerSelector;
  }

  const openedViaSearch = await openChatTargetViaSearch(page, env, heart, persona, targetContext, openTargetSelectors);
  if (openedViaSearch) {
    await Promise.race([
      page.locator(composerSelector).first().waitFor({ state: "visible", timeout: 15000 }),
      page.locator(threadReadySelectors.join(", ")).first().waitFor({ state: "visible", timeout: 15000 })
    ]);
    const openedThreadFromSearch = await clickFirstVisible(page, openThreadSelectors, 4000);
    if (openedThreadFromSearch) {
      await page.waitForTimeout(400).catch(() => undefined);
    }
    await ensureElementVisible(page, composerSelector, 15000);
    return composerSelector;
  }

  throw new Error("Heart konnte auf keinem Zielprofil einen Chat-Startbutton finden.");
}

async function waitForChatDelivery(page, {
  messageText = "",
  composerSelector = "#chatMessageInput",
  messagesSelector = "#chatMessages",
  timeout = 15000
} = {}) {
  const safeMessageText = asText(messageText);
  if (!safeMessageText) {
    throw new Error("Heart konnte die Chat-Nachricht nicht pruefen, weil der Nachrichtentext leer war.");
  }
  await page.waitForFunction(
    ({
      expectedMessage,
      inputSelector,
      listSelector
    }) => {
      const composer = document.querySelector(inputSelector);
      const messageRoot = document.querySelector(listSelector) || document.body;
      const composerValue = typeof composer?.value === "string" ? composer.value.trim() : "";
      const visibleText = String(messageRoot?.innerText || document.body?.innerText || "");
      return visibleText.includes(expectedMessage) || composerValue.length === 0;
    },
    {
      expectedMessage: safeMessageText,
      inputSelector: composerSelector,
      listSelector: messagesSelector
    },
    { timeout }
  );
}

export async function runChatChecks({ page, env, heart, persona } = {}) {
  const sendConfig = env.packConfig?.actions?.chat?.send || {};
  if (!sendConfig.url) {
    heart.notConfiguredModule("chat", "Chat-Ziel-URL fehlt. Deshalb kann Heart nur den allgemeinen Chat-Bereich pruefen.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    markGuarded(heart, "chat", "Chat-Nachrichten sind im Moment geschuetzt. Aktiviere erst den isolierten Schreibmodus.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  if (!hasRequiredConfig(sendConfig, ["url", "composerSelector", "sendSelector"])) {
    markNotConfigured(heart, "chat", "Fuer Live-Chat fehlen noch Selektoren.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  try {
    await openPageAndWait(page, sendConfig.url, "body", heart, {
      title: `${persona.label} / Open chat target`,
      moduleKey: "chat",
      area: "chat",
      persona: persona.key
    });

    const composerSelector = await ensureChatComposerReady(page, env, sendConfig, heart, persona);
    const sendSelector = asText(sendConfig.sendSelector, "#chatSendBtn");
    const messagesSelector = asText(sendConfig.messagesSelector, "#chatMessages");
    const messageText = replaceRunTokens(sendConfig.messageTemplate || "TEST_RUN_<runId>_CHAT_1", env);

    const composerFilled = await fillIfPresent(page, composerSelector, messageText, 10000);
    if (!composerFilled) {
      throw new Error("Heart konnte das Chat-Eingabefeld nicht befuellen.");
    }

    const clickedSend = await clickFirstVisible(page, [sendSelector], 10000);
    if (!clickedSend) {
      throw new Error("Heart konnte den Button zum Senden der Chat-Nachricht nicht finden.");
    }

    await waitForChatDelivery(page, {
      messageText: replaceRunTokens(sendConfig.verifyText || messageText, env),
      composerSelector,
      messagesSelector,
      timeout: 15000
    });

    heart.passModule("chat", "Chat-Nachricht wurde erfolgreich gesendet.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
  } catch (error) {
    heart.failModule("chat", error, {
      action: "chat send",
      title: "Chat-Nachricht konnte nicht bestaetigt werden",
      persona: persona.key,
      area: "chat"
    });
  }
}
