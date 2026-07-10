// Deployt firestore.rules nach Firebase ueber die Admin-SDK-Rules-API.
// Bewusst NICHT `firebase deploy --only firestore:rules`: das CLI prueft vorab
// die Service-Usage-API, wofuer der Standard-Admin-SDK-Service-Account
// (firebase-adminsdk-...@) keine Berechtigung hat. Die Rules-API selbst
// funktioniert mit genau diesem Account.
//
// Erwartet den Service-Account-JSON-Inhalt in der Umgebungsvariable
// FIREBASE_SERVICE_ACCOUNT (im CI als Repo-Secret hinterlegt).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";

const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
if (!raw.trim()) {
  console.error("FIREBASE_SERVICE_ACCOUNT ist nicht gesetzt (Service-Account-JSON erwartet).");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(raw);
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT enthaelt kein gueltiges JSON.");
  process.exit(1);
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(repoRoot, "firestore.rules"), "utf8");

initializeApp({ credential: cert(serviceAccount) });
const rules = getSecurityRules();

const before = await rules.getFirestoreRuleset();
console.log(`Aktives Ruleset vorher: ${before.name} (erstellt ${before.createTime})`);

const ruleset = await rules.releaseFirestoreRulesetFromSource(source);
console.log(`Neues Ruleset released: ${ruleset.name} (erstellt ${ruleset.createTime})`);

const after = await rules.getFirestoreRuleset();
if (after.name !== ruleset.name) {
  console.error(`Release nicht aktiv: erwartet ${ruleset.name}, aktiv ist ${after.name}`);
  process.exit(1);
}
console.log("Firestore-Rules erfolgreich deployt.");
process.exit(0);
