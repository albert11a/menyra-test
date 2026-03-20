import { runChatChecks } from "../actions/chat-actions.mjs";
import { runCartAndOrderChecks } from "../actions/commerce-actions.mjs";
import { runCrmChecks } from "../actions/crm-actions.mjs";
import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks } from "../actions/social-actions.mjs";

export async function runSmokePack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const ceo = personas.ceo;
  const auth = await ensurePersonaSession({ page, heart, persona: ceo, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Smoke pack could not start because CEO credentials are not configured.");
    return;
  }

  await emitStatus("Smoke / Read surfaces", "running", "Running critical-path smoke surfaces.");
  await runSocialSurfaceChecks({ page, env, heart, persona: ceo });
  await runCartAndOrderChecks({ page, env, heart, persona: ceo });
  await runChatChecks({ page, env, heart, persona: ceo });
  await runCrmChecks({ page, env, heart, persona: ceo });
  await runPwaChecks({ page, heart, persona: ceo });
  heart.setSummary("Smoke pack completed. Critical-path reads ran, and guarded writes were reported truthfully.");
}
