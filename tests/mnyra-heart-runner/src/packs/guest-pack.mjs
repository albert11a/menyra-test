import { runPwaChecks } from "../actions/journey-actions.mjs";
import { runGuestChecks } from "../actions/guest-actions.mjs";

export async function runGuestPack({ page, env, heart, personas, emitStatus = async () => {} } = {}) {
  const guest = personas.guest;
  await emitStatus("Guest / QR checks", "running", "Running guest and QR route checks.");
  await runGuestChecks({ page, env, heart, persona: guest });
  await runPwaChecks({ page, heart, persona: guest });
  heart.setSummary("Guest pack completed. Guest and QR flows were checked without privileged access.");
}
