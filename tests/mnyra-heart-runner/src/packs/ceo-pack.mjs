import { runCrmChecks } from "../actions/crm-actions.mjs";
import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks } from "../actions/social-actions.mjs";

export async function runCeoPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const ceo = personas.ceo;
  const auth = await ensurePersonaSession({ page, heart, persona: ceo, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("CEO pack could not start because CEO credentials are not configured.");
    return;
  }

  await emitStatus("CEO / Surface checks", "running", "Running CEO pack surfaces.");
  await runSocialSurfaceChecks({ page, env, heart, persona: ceo });
  await runCrmChecks({ page, env, heart, persona: ceo });
  await runJourneyChecks({ page, env, heart, persona: ceo });
  await runPwaChecks({ page, heart, persona: ceo });
  heart.setSummary("CEO pack completed. Control surfaces, CRM and navigation journeys were exercised.");
}
