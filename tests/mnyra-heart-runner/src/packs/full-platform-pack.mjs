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
  await emitStatus("Full platform / Smoke", "running", "Running smoke baseline inside isolated session.");
  await runScoped("smoke", createScopedPage, async (page) => {
    await runSmokePack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / CEO", "running", "Running CEO persona pack.");
  await runScoped("ceo", createScopedPage, async (page) => {
    await runCeoPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / Business", "running", "Running business persona pack.");
  await runScoped("business", createScopedPage, async (page) => {
    await runBusinessPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / Staff", "running", "Running staff persona pack.");
  await runScoped("staff", createScopedPage, async (page) => {
    await runStaffPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / User", "running", "Running user persona pack.");
  await runScoped("user", createScopedPage, async (page) => {
    await runUserPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / Guest", "running", "Running guest persona pack.");
  await runScoped("guest", createScopedPage, async (page) => {
    await runGuestPack({ page, env, heart, personas, emitStatus });
  });

  await emitStatus("Full platform / Journey", "running", "Running journey pack.");
  await runJourneyPack({ page: null, env, heart, personas, emitStatus, createScopedPage });

  await emitStatus("Full platform / Mutations", "running", "Running mutation pack.");
  await runMutationPack({ env, heart, personas, emitStatus, createScopedPage });

  heart.setSummary("Full platform pack completed. Multi-role checks ran with isolated sessions and truthful guarded/not-configured reporting.");
}
