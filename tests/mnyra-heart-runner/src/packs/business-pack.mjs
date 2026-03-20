import { runBusinessMutationChecks, runBusinessSurfaceChecks } from "../actions/business-actions.mjs";
import { runCrmChecks } from "../actions/crm-actions.mjs";
import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";

export async function runBusinessPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const business = personas.business;
  const auth = await ensurePersonaSession({ page, heart, persona: business, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Business pack could not start because business credentials are not configured.");
    return;
  }

  await emitStatus("Business / Surface checks", "running", "Running business-owner pack.");
  await runBusinessSurfaceChecks({ page, env, heart, persona: business });
  await runBusinessMutationChecks({ page, env, heart, persona: business });
  await runCrmChecks({ page, env, heart, persona: business });
  await runPwaChecks({ page, heart, persona: business });
  heart.setSummary("Business pack completed. Business surfaces ran and mutation checks were guarded or executed based on safe config.");
}
