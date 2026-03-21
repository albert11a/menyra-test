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

export async function runHealthPack({
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage
} = {}) {
  await emitStatus("Tageslauf / Business", "running", "Heart prueft die Business-Rolle.");
  await runScoped("health-business", createScopedPage, async (page) => {
    await runBusinessPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Tageslauf / User", "running", "Heart prueft die Nutzer-Rolle.");
  await runScoped("health-user", createScopedPage, async (page) => {
    await runUserPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Tageslauf / Gast", "running", "Heart prueft den Gast- und QR-Weg.");
  await runScoped("health-guest", createScopedPage, async (page) => {
    await runGuestPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Tageslauf / CEO", "running", "Heart schliesst mit der CEO-Kontrolle ab.");
  await runScoped("health-ceo", createScopedPage, async (page) => {
    await runSmokePack({ page, env, heart, personas, emitStatus });
  });

  heart.setSummary("Tageslauf beendet. CEO, Business, User und Gast wurden als regelmaessiger Gesundheitscheck in getrennten Sitzungen geprueft.");
}
