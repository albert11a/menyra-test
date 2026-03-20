import { runChatChecks } from "../actions/chat-actions.mjs";
import { runCartAndOrderChecks } from "../actions/commerce-actions.mjs";
import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks, runUserSocialMutationChecks } from "../actions/social-actions.mjs";

export async function runUserPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const user = personas.user;
  const auth = await ensurePersonaSession({ page, heart, persona: user, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("User pack could not start because user credentials are not configured.");
    return;
  }

  await emitStatus("User / Surface checks", "running", "Running normal-user pack.");
  await runSocialSurfaceChecks({ page, env, heart, persona: user });
  await runUserSocialMutationChecks({ page, env, heart, persona: user });
  await runCartAndOrderChecks({ page, env, heart, persona: user });
  await runChatChecks({ page, env, heart, persona: user });
  await runJourneyChecks({ page, env, heart, persona: user });
  await runPwaChecks({ page, heart, persona: user });
  heart.setSummary("User pack completed. User journeys ran, with social and commerce mutations executed only when safely configured.");
}
