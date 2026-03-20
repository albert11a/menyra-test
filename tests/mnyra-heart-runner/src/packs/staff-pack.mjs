import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runStaffChecks } from "../actions/staff-actions.mjs";
import { WAITER_SELECTORS } from "../utils/selectors.mjs";

export async function runStaffPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const staff = personas.staff;
  const auth = await ensurePersonaSession({ page, heart, persona: staff, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Staff pack could not start because staff credentials are not configured.");
    return;
  }

  await emitStatus("Staff / Waiter checks", "running", "Running waiter/staff surface checks.");
  await runStaffChecks({ page, env, heart, persona: staff });
  await runPwaChecks({ page, heart, persona: staff, manifestSelector: WAITER_SELECTORS.manifestLink });
  heart.setSummary("Staff pack completed. Waiter surface checks ran with safe guardrails on status mutations.");
}
