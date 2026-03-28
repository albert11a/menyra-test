import {
  getHeartPack,
  getHeartPackCatalog
} from "../../../../shared/heart-pack-catalog.js";
import { runBusinessPack } from "./business-pack.mjs";
import { runCeoPack } from "./ceo-pack.mjs";
import { runContractSmokePack } from "./contract-smoke-pack.mjs";
import { runGuardPack } from "./guard-pack.mjs";
import { runHealthPack } from "./health-pack.mjs";
import { runFullPlatformPack } from "./full-platform-pack.mjs";
import { runGuestPack } from "./guest-pack.mjs";
import { runJourneyPack } from "./journey-pack.mjs";
import { runMutationPack } from "./mutation-pack.mjs";
import { runReleasePack } from "./release-pack.mjs";
import { runSmokePack } from "./smoke-pack.mjs";
import { runStaffPack } from "./staff-pack.mjs";
import { runUserPack } from "./user-pack.mjs";

const RUNNERS = Object.freeze({
  "guard-pack": runGuardPack,
  "release-pack": runReleasePack,
  "health-pack": runHealthPack,
  "contract-smoke-pack": runContractSmokePack,
  smoke: runSmokePack,
  "ceo-pack": runCeoPack,
  "business-pack": runBusinessPack,
  "staff-pack": runStaffPack,
  "user-pack": runUserPack,
  "guest-pack": runGuestPack,
  "mutation-pack": runMutationPack,
  "journey-pack": runJourneyPack,
  "full-platform-pack": runFullPlatformPack
});

export function resolvePackDefinition(input = "") {
  return getHeartPack(input);
}

export function listPackDefinitions() {
  return getHeartPackCatalog();
}

export function resolvePackRunner(input = "") {
  const pack = resolvePackDefinition(input);
  return {
    pack,
    runPack: RUNNERS[pack.key] || RUNNERS.smoke
  };
}
