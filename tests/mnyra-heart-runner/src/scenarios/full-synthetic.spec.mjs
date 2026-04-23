import { runFullPlatformPack } from "../packs/full-platform-pack.mjs";

export async function runSyntheticScenario(context = {}) {
  return runFullPlatformPack(context);
}
