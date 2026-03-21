import { runChatChecks } from "../actions/chat-actions.mjs";
import { runDiscoveryChecks } from "../actions/discovery-actions.mjs";
import { runJourneyChecks, runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runSocialSurfaceChecks } from "../actions/social-actions.mjs";

export async function runSmokePack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const ceo = personas.ceo;
  const auth = await ensurePersonaSession({ page, heart, persona: ceo, moduleKey: "auth" });
  if (!auth.ok) {
    heart.setSummary("CEO-Kontrolllauf konnte nicht starten, weil die CEO-Zugangsdaten fehlen.");
    return;
  }

  await emitStatus("CEO / Kontrolle", "running", "Heart prueft die CEO-Steuerflaechen.");
  await runSocialSurfaceChecks({ page, env, heart, persona: ceo });
  await runChatChecks({ page, env, heart, persona: ceo });
  await runDiscoveryChecks({ page, env, heart, persona: ceo });
  await runJourneyChecks({ page, env, heart, persona: ceo });
  await runPwaChecks({ page, heart, persona: ceo });
  heart.setSummary("CEO-Kontrolllauf beendet. CEO-Oberflaechen, Navigation, Karte, Suche, Chat und PWA wurden geprueft.");
}
