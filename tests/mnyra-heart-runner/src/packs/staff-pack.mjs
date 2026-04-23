import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runStaffChecks } from "../actions/staff-actions.mjs";
import { WAITER_SELECTORS } from "../utils/selectors.mjs";

export async function runStaffPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const staff = personas.staff;
  const auth = await ensurePersonaSession({ page, heart, persona: staff, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Service-Test konnte nicht starten, weil die Service-Zugangsdaten fehlen.");
    return;
  }

  await emitStatus("Service / Waiter", "running", "Heart prueft die Waiter-Oberflaeche.");
  await runStaffChecks({ page, env, heart, persona: staff });
  await runPwaChecks({ page, heart, persona: staff, manifestSelector: WAITER_SELECTORS.manifestLink });
  heart.setSummary("Service-Test beendet. Die Waiter-Oberflaeche wurde geprueft, und Status-Aenderungen blieben sauber geschuetzt.");
}
