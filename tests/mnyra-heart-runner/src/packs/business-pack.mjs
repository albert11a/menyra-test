import { runBusinessMutationChecks, runBusinessSurfaceChecks } from "../actions/business-actions.mjs";
import { runCrmChecks } from "../actions/crm-actions.mjs";
import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";

export async function runBusinessPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const business = personas.business;
  const auth = await ensurePersonaSession({ page, heart, persona: business, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("Business-Test konnte nicht starten, weil die Business-Zugangsdaten fehlen.");
    return;
  }

  await emitStatus("Business / Oberflaechen", "running", "Heart prueft die Business-Oberflaechen.");
  await runBusinessSurfaceChecks({ page, env, heart, persona: business });
  await runBusinessMutationChecks({ page, env, heart, persona: business });
  await runCrmChecks({ page, env, heart, persona: business });
  await runPwaChecks({ page, heart, persona: business });
  heart.setSummary("Business-Test beendet. Business-Oberflaechen wurden geprueft, und Schreibpfade wurden je nach Einrichtung ausgefuehrt oder geschuetzt markiert.");
}
