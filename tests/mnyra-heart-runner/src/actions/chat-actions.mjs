import {
  clickFirstVisible,
  ensureElementVisible,
  fillIfPresent,
  findVisibleSelector,
  openPageAndWait
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured, replaceRunTokens } from "./common-actions.mjs";

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
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

function resolveChatTargetContext(env = {}, persona = {}, sendConfig = {}) {
  const configPersonas = env.packConfig?.personas || {};
  const socialConfig = env.packConfig?.actions?.social || {};
  if (persona?.key === "business") {
    const userPersona = configPersonas.user || {};
    return {
      targetUid: asText(sendConfig.userTargetUid, userPersona.uid, sendConfig.targetUid),
      targetProfileUrl: asText(sendConfig.userTargetProfileUrl, socialConfig.userTargetProfile?.url, sendConfig.targetProfileUrl)
    };
  }
  const businessPersona = configPersonas.business || {};
  return {
    targetUid: asText(sendConfig.targetUid, businessPersona.uid),
    targetProfileUrl: asText(sendConfig.targetProfileUrl, socialConfig.businessProfile?.url, socialConfig.userTargetProfile?.url)
  };
}

async function ensureChatComposerReady(page, env, sendConfig = {}, heart, persona) {
  const composerSelector = asText(sendConfig.composerSelector, "#chatMessageInput");
  const threadViewSelector = asText(sendConfig.threadViewSelector, "#chatThreadView");
  const messagesSelector = asText(sendConfig.messagesSelector, "#chatMessages");
  const targetContext = resolveChatTargetContext(env, persona, sendConfig);
  const threadTargetUid = asText(targetContext.targetUid);
  const threadTargetUrls = uniqueList(
    sendConfig.threadUrl,
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
    await ensureElementVisible(page, composerSelector, 15000);
    return composerSelector;
  }

  const targetUrls = uniqueList(
    targetContext.targetProfileUrl,
    sendConfig.targetProfileUrl,
    env.packConfig?.actions?.social?.userTargetProfile?.url,
    env.packConfig?.actions?.social?.businessProfile?.url
  );
  if (!targetUrls.length) {
    throw new Error("Heart konnte keinen Chat-Thread oeffnen. Weder eine bestehende Unterhaltung noch eine Zielprofil-URL sind eingerichtet.");
  }

  for (const targetUrl of targetUrls) {
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
