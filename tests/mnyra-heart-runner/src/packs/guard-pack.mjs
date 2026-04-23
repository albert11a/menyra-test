import { runBusinessSurfaceChecks } from "../actions/business-actions.mjs";
import { runDiscoveryChecks } from "../actions/discovery-actions.mjs";
import { runPwaChecks } from "../actions/journey-actions.mjs";
import { ensurePersonaSession } from "../actions/persona-actions.mjs";
import { runGuestChecks } from "../actions/guest-actions.mjs";
import { runSocialSurfaceChecks } from "../actions/social-actions.mjs";

async function runScoped(label, createScopedPage, runner) {
  const scope = await createScopedPage(label);
  try {
    await runner(scope.page);
  } finally {
    await scope.dispose();
  }
}

async function runReadOnlySocialShell({ page, env, heart, persona, summary = "" } = {}) {
  const auth = await ensurePersonaSession({ page, heart, persona, moduleKey: "auth" });
  if (!auth.ok) return false;
  await runSocialSurfaceChecks({ page, env, heart, persona });
  await runDiscoveryChecks({ page, env, heart, persona });
  await runPwaChecks({ page, heart, persona });
  if (summary) {
    heart.setSummary(summary);
  }
  return true;
}

export async function runGuardPack({
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage
} = {}) {
  const guardEnv = {
    ...env,
    allowLiveMutations: false
  };
  await emitStatus("Aenderungs-Guard / CEO", "running", "Heart prueft den schnellen CEO-Lesepfad.");
  await runScoped("guard-ceo", createScopedPage, async (page) => {
    await runReadOnlySocialShell({
      page,
      env: guardEnv,
      heart,
      persona: personas.ceo
    });
  });

  await emitStatus("Aenderungs-Guard / Business", "running", "Heart prueft die Business-Oberflaeche ohne tiefe Schreibpfade.");
  await runScoped("guard-business", createScopedPage, async (page) => {
    const auth = await ensurePersonaSession({ page, heart, persona: personas.business, moduleKey: "auth" });
    if (!auth.ok) return;
    await runSocialSurfaceChecks({ page, env: guardEnv, heart, persona: personas.business });
    await runBusinessSurfaceChecks({ page, env: guardEnv, heart, persona: personas.business });
    await runDiscoveryChecks({ page, env: guardEnv, heart, persona: personas.business });
    await runPwaChecks({ page, heart, persona: personas.business });
  });

  await emitStatus("Aenderungs-Guard / User", "running", "Heart prueft den schnellen User-Lesepfad.");
  await runScoped("guard-user", createScopedPage, async (page) => {
    await runReadOnlySocialShell({
      page,
      env: guardEnv,
      heart,
      persona: personas.user
    });
  });

  await emitStatus("Aenderungs-Guard / Gast", "running", "Heart prueft den oeffentlichen Gast- und QR-Weg.");
  await runScoped("guard-guest", createScopedPage, async (page) => {
    await runDiscoveryChecks({ page, env: guardEnv, heart, persona: personas.guest });
    await runGuestChecks({ page, env: guardEnv, heart, persona: personas.guest });
    await runPwaChecks({ page, heart, persona: personas.guest });
  });

  heart.setSummary("Aenderungs-Guard beendet. CEO, Business, User und Gast wurden schnell auf Kernpfade, Discovery und mobiles Layout geprueft.");
}
