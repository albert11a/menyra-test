import { runPwaChecks } from "../actions/journey-actions.mjs";
import { runGuestChecks } from "../actions/guest-actions.mjs";

export async function runGuestPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const guest = personas.guest;
  await emitStatus("Gast / QR", "running", "Heart prueft Gast- und QR-Wege.");
  await runGuestChecks({ page, env, heart, persona: guest });
  await runPwaChecks({ page, heart, persona: guest });
  heart.setSummary("Gast- / QR-Test beendet. Gast- und QR-Wege wurden ohne geschuetzte Business-Rechte geprueft.");
}
