import {
  clickIfPresent,
  fillIfPresent,
  openPageAndWait,
  waitForText
} from "../helpers/social-app.mjs";
import { hasRequiredConfig, markGuarded, markNotConfigured, replaceRunTokens } from "./common-actions.mjs";

export async function runChatChecks({ page, env, heart, persona } = {}) {
  const sendConfig = env.packConfig?.actions?.chat?.send || {};
  if (!sendConfig.url) {
    heart.notConfiguredModule("chat", "Chat target URL is not configured. Only generic chat tab checks can run.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  if (!env.allowLiveMutations || !env.syntheticIsolationKey) {
    markGuarded(heart, "chat", "Chat send is guarded until isolated mutation mode is enabled.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  if (!hasRequiredConfig(sendConfig, ["url", "composerSelector", "sendSelector"])) {
    markNotConfigured(heart, "chat", "Chat send selectors need setup before live chat tests can run.", {
      action: "chat send",
      persona: persona.key,
      area: "chat"
    });
    return;
  }

  await openPageAndWait(page, sendConfig.url, "body", heart, {
    title: `${persona.label} / Open chat target`,
    moduleKey: "chat",
    area: "chat",
    persona: persona.key
  });
  const messageText = replaceRunTokens(sendConfig.messageTemplate || "TEST_RUN_<runId>_CHAT_1", env);
  await fillIfPresent(page, sendConfig.composerSelector, messageText);
  await clickIfPresent(page, sendConfig.sendSelector);
  if (sendConfig.verifyText) {
    await waitForText(page, replaceRunTokens(sendConfig.verifyText, env));
  }
  heart.passModule("chat", "Chat send action completed.", {
    action: "chat send",
    persona: persona.key,
    area: "chat"
  });
}
