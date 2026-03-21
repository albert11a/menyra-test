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

export async function runReleasePack({
  env,
  heart,
  personas,
  emitStatus = async () => {},
  createScopedPage
} = {}) {
  await emitStatus("Release-Gate / CEO", "running", "Heart prueft zuerst die CEO-Kontrolle.");
  await runScoped("release-ceo", createScopedPage, async (page) => {
    await runSmokePack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Release-Gate / Business", "running", "Heart prueft die Business-Rolle mit Social, Menue und Discovery.");
  await runScoped("release-business", createScopedPage, async (page) => {
    await runBusinessPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Release-Gate / User", "running", "Heart prueft die Nutzer-Rolle mit Social und Bestellung.");
  await runScoped("release-user", createScopedPage, async (page) => {
    await runUserPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Release-Gate / Gast", "running", "Heart prueft den Gast- und QR-Bestellweg.");
  await runScoped("release-guest", createScopedPage, async (page) => {
    await runGuestPack({ page, env, heart, personas, emitStatus });
  });

  heart.setSummary("Release-Gate beendet. CEO, Business, User und Gast wurden in getrennten Sitzungen auf die wichtigsten Kern- und Schreibpfade geprueft.");
}
