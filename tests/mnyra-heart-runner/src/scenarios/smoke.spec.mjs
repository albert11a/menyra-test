import { runSmokePack } from "../packs/smoke-pack.mjs";

export async function runSmokeScenario(context = {}) {
  return runSmokePack(context);
}
