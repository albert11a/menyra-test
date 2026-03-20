import {
  getHeartPack,
  getHeartPackCatalog
} from "../../../../shared/heart-pack-catalog.js";
import { runBusinessPack } from "./business-pack.mjs";
import { runCeoPack } from "./ceo-pack.mjs";
import { runFullPlatformPack } from "./full-platform-pack.mjs";
import { runGuestPack } from "./guest-pack.mjs";
import { runJourneyPack } from "./journey-pack.mjs";
import { runMutationPack } from "./mutation-pack.mjs";
import { runSmokePack } from "./smoke-pack.mjs";
import { runStaffPack } from "./staff-pack.mjs";
import { runUserPack } from "./user-pack.mjs";

const RUNNERS = Object.freeze({
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
