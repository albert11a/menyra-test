import { runCrmChecks } from "../actions/crm-actions.mjs";
import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks } from "../actions/social-actions.mjs";

export async function runCeoPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const ceo = personas.ceo;
  const auth = await ensurePersonaSession({ page, heart, persona: ceo, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("CEO-Test konnte nicht starten, weil die CEO-Zugangsdaten fehlen.");
    return;
  }

  await emitStatus("CEO / Oberflaechen", "running", "Heart prueft die CEO-Oberflaechen.");
  await runSocialSurfaceChecks({ page, env, heart, persona: ceo });
  await runCrmChecks({ page, env, heart, persona: ceo });
  await runJourneyChecks({ page, env, heart, persona: ceo });
  await runPwaChecks({ page, heart, persona: ceo });
  heart.setSummary("CEO-Test beendet. Steuerflaechen, CRM und Navigation wurden geprueft.");
}
