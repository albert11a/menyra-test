import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesPath = path.resolve(__dirname, "../../../../firestore.rules");

const defaultHost = "127.0.0.1";
const defaultPort = 8080;
const defaultProjectId = "demo-mnyra-phase1";

let testEnvPromise = null;

function parseEmulatorHost(rawValue = "") {
  const text = String(rawValue || "").trim();
  if (!text) {
    return { host: defaultHost, port: defaultPort };
  }
  const [hostPart, portPart] = text.split(":");
  const parsedPort = Number(portPart || defaultPort);
  return {
    host: hostPart || defaultHost,
    port: Number.isFinite(parsedPort) ? parsedPort : defaultPort
  };
}

export function getRulesRuntimeConfig() {
  const emulatorHost = parseEmulatorHost(process.env.FIRESTORE_EMULATOR_HOST);
  return {
    projectId: String(process.env.MNYRA_RULES_TEST_PROJECT_ID || defaultProjectId).trim() || defaultProjectId,
    host: emulatorHost.host,
    port: emulatorHost.port
  };
}

export async function getRulesTestEnvironment() {
  if (!testEnvPromise) {
    testEnvPromise = (async () => {
      const runtime = getRulesRuntimeConfig();
      const rules = await readFile(rulesPath, "utf8");
      try {
        return await initializeTestEnvironment({
          projectId: runtime.projectId,
          firestore: {
            rules,
            host: runtime.host,
            port: runtime.port
          }
        });
      } catch (error) {
        const detail = error && error.message ? error.message : String(error || "");
        throw new Error(
          `Firestore emulator not reachable at ${runtime.host}:${runtime.port}. Start the emulator before running rules tests. ${detail}`
        );
      }
    })();
  }
  return testEnvPromise;
}

export async function cleanupRulesTestEnvironment() {
  if (!testEnvPromise) return;
  const env = await testEnvPromise;
  await env.cleanup();
  testEnvPromise = null;
}

export async function clearRulesTestData() {
  const env = await getRulesTestEnvironment();
  await env.clearFirestore();
}

export function authedFirestore(env, { uid, email = "" } = {}) {
  return env.authenticatedContext(String(uid || "").trim(), email ? { email } : {}).firestore();
}

export function guestFirestore(env) {
  return env.unauthenticatedContext().firestore();
}

export async function seedWithDisabledRules(seedFn) {
  const env = await getRulesTestEnvironment();
  await env.withSecurityRulesDisabled(async (context) => {
    await seedFn(context.firestore());
  });
}

export function docRefByPath(db, docPath) {
  return doc(db, ...String(docPath || "").split("/").filter(Boolean));
}

export function collectionRefByPath(db, collectionPath) {
  return collection(db, ...String(collectionPath || "").split("/").filter(Boolean));
}

export async function setDocByPath(db, docPath, data) {
  await setDoc(docRefByPath(db, docPath), data);
}

export async function updateDocByPath(db, docPath, data) {
  await updateDoc(docRefByPath(db, docPath), data);
}

export async function getDocByPath(db, docPath) {
  return await getDoc(docRefByPath(db, docPath));
}

export async function deleteDocByPath(db, docPath) {
  await deleteDoc(docRefByPath(db, docPath));
}

export async function getCollectionByPath(db, collectionPath) {
  return await getDocs(collectionRefByPath(db, collectionPath));
}

export {
  assertFails,
  assertSucceeds
};
