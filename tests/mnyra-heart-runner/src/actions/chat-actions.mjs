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
  heart.passModule("chat", "Chat-Nachricht wurde erfolgreich gesendet.", {
    action: "chat send",
    persona: persona.key,
    area: "chat"
  });
}
