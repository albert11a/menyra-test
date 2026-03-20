import { runBusinessPack } from "./business-pack.mjs";
import { runCeoPack } from "./ceo-pack.mjs";
import { runGuestPack } from "./guest-pack.mjs";
import { runJourneyPack } from "./journey-pack.mjs";
import { runMutationPack } from "./mutation-pack.mjs";
import { runSmokePack } from "./smoke-pack.mjs";
import { runStaffPack } from "./staff-pack.mjs";
import { runUserPack } from "./user-pack.mjs";

async function runScoped(label, createScopedPage, runner) {
  const scope = await createScopedPage(label);
  try {
    await runner(scope.page);
  } finally {
    await scope.dispose();
  }
}

export async function runFullPlatformPack({
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage
} = {}) {
  await emitStatus("Kompletttest / Schnelltest", "running", "Heart startet den Schnelltest in einer isolierten Sitzung.");
  await runScoped("smoke", createScopedPage, async (page) => {
    await runSmokePack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / CEO", "running", "Heart prueft die CEO-Rolle.");
  await runScoped("ceo", createScopedPage, async (page) => {
    await runCeoPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Business", "running", "Heart prueft die Business-Rolle.");
  await runScoped("business", createScopedPage, async (page) => {
    await runBusinessPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Service", "running", "Heart prueft die Service-Rolle.");
  await runScoped("staff", createScopedPage, async (page) => {
    await runStaffPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Nutzer", "running", "Heart prueft die Nutzer-Rolle.");
  await runScoped("user", createScopedPage, async (page) => {
    await runUserPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Gast", "running", "Heart prueft die Gast- und QR-Rolle.");
  await runScoped("guest", createScopedPage, async (page) => {
    await runGuestPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Journey", "running", "Heart prueft Navigation und Journeys.");
  await runJourneyPack({ page: null, env, heart, personas, emitStatus, createScopedPage });

  await emitStatus("Kompletttest / Schreiben", "running", "Heart prueft die Schreibpfade.");
  await runMutationPack({ env, heart, personas, emitStatus, createScopedPage });

  heart.setSummary("Kompletttest beendet. Alle Rollen wurden in getrennten Sitzungen geprueft, und Heart hat ehrlich zwischen Erfolg, Einrichtung fehlt und geschuetzt unterschieden.");
}
