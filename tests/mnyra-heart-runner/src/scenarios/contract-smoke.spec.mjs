import { runContractSmokePack } from "../packs/contract-smoke-pack.mjs";

export async function runContractSmokeScenario(context = {}) {
  return runContractSmokePack(context);
}
