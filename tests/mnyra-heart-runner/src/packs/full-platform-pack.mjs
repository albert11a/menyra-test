import { runBusinessPack } from "./business-pack.mjs";
import { runGuestPack } from "./guest-pack.mjs";
import { runSmokePack } from "./smoke-pack.mjs";
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

  await emitStatus("Kompletttest / Business", "running", "Heart prueft die Business-Rolle.");
  await runScoped("business", createScopedPage, async (page) => {
    await runBusinessPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Nutzer", "running", "Heart prueft die Nutzer-Rolle.");
  await runScoped("user", createScopedPage, async (page) => {
    await runUserPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Kompletttest / Gast", "running", "Heart prueft die Gast- und QR-Rolle.");
  await runScoped("guest", createScopedPage, async (page) => {
    await runGuestPack({ page, env, heart, personas, emitStatus });
  });
  heart.setSummary("Kompletttest beendet. CEO-Kontrolle, Business, User und Gast wurden in getrennten Sitzungen geprueft.");
}
