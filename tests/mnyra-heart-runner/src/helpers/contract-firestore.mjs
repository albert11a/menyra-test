import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const DEFAULT_FIXTURE_PATH = "../../../phase1-testworld/fixtures/phase1-testworld.fixture.cjs";
const DEFAULT_FIRESTORE_HOST = "127.0.0.1";
const DEFAULT_FIRESTORE_PORT = 8080;
const DEFAULT_FIREBASE_PROJECT_ALIAS = "local";

let cachedFirebaserc = null;
let cachedAdminRuntime = null;

function asText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function pickText(...values) {
  return values
    .map((value) => String(value || "").trim())
    .find(Boolean) || "";
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function encodeDocumentPath(documentPath = "") {
  return String(documentPath || "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function parseEmulatorHost(rawValue = "") {
  const safeValue = asText(rawValue);
  if (!safeValue) {
    return { host: DEFAULT_FIRESTORE_HOST, port: DEFAULT_FIRESTORE_PORT };
  }
  const [hostPart, portPart] = safeValue.split(":");
  const parsedPort = Number(portPart || DEFAULT_FIRESTORE_PORT);
  return {
    host: asText(hostPart, DEFAULT_FIRESTORE_HOST),
    port: Number.isFinite(parsedPort) ? parsedPort : DEFAULT_FIRESTORE_PORT
  };
}

async function readFirebaserc(rootDir = process.cwd()) {
  if (cachedFirebaserc) return cachedFirebaserc;
  const startDir = path.resolve(rootDir || process.cwd());
  let currentDir = startDir;
  while (true) {
    try {
      const raw = await fs.readFile(path.resolve(currentDir, ".firebaserc"), "utf8");
      cachedFirebaserc = JSON.parse(raw);
      return cachedFirebaserc;
    } catch {}
    const parentDir = path.dirname(currentDir);
    if (!parentDir || parentDir === currentDir) break;
    currentDir = parentDir;
  }
  cachedFirebaserc = {};
  return cachedFirebaserc;
}

function decodeFirestoreValue(value = {}) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue || "";
  if ("integerValue" in value) return Number(value.integerValue || 0);
  if ("doubleValue" in value) return Number(value.doubleValue || 0);
  if ("booleanValue" in value) return !!value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue || "";
  if ("referenceValue" in value) return value.referenceValue || "";
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue?.fields || {}).map(([key, entry]) => [key, decodeFirestoreValue(entry)])
    );
  }
  if ("arrayValue" in value) {
    return Array.isArray(value.arrayValue?.values)
      ? value.arrayValue.values.map((entry) => decodeFirestoreValue(entry))
      : [];
  }
  if ("geoPointValue" in value) {
    return {
      latitude: Number(value.geoPointValue?.latitude || 0),
      longitude: Number(value.geoPointValue?.longitude || 0)
    };
  }
  return clone(value);
}

function decodeFirestoreDocument(document = {}) {
  const name = asText(document?.name);
  const fields = Object.fromEntries(
    Object.entries(document?.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
  return {
    id: asText(name.split("/").pop()),
    name,
    path: name.includes("/documents/") ? name.split("/documents/")[1] : "",
    fields
  };
}

async function fetchFirestoreJson(runtime, documentOrCollectionPath = "", {
  kind = "document"
} = {}) {
  const encodedPath = encodeDocumentPath(documentOrCollectionPath);
  const url = new URL(`${runtime.baseUrl}/${encodedPath}`);
  if (kind === "collection") {
    url.searchParams.set("pageSize", "200");
  }
  let response;
  try {
    response = await fetch(url, { method: "GET" });
  } catch (error) {
    throw new Error(
      `Contract smoke konnte Firestore am Emulator ${runtime.host}:${runtime.port} nicht erreichen. ` +
      "Starte Firestore Emulator und Seed-Basis vor dem Contract-Lauf."
    );
  }
  if (response.status === 404) {
    return kind === "collection" ? { documents: [] } : null;
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Contract smoke konnte ${kind === "collection" ? "Collection" : "Dokument"} ${documentOrCollectionPath} ` +
      `nicht lesen (${response.status}). ${detail}`.trim()
    );
  }
  return response.json();
}

function loadFirebaseAdmin() {
  try {
    return require(path.resolve(__dirname, "../../../../functions/node_modules/firebase-admin"));
  } catch (error) {
    const detail = asText(error?.message);
    throw new Error(
      `Contract smoke braucht firebase-admin fuer technische Firestore-Lesungen.${detail ? ` ${detail}` : ""}`
    );
  }
}

function decodeAdminValue(value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map((entry) => decodeAdminValue(entry));
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, decodeAdminValue(entry)])
    );
  }
  return value;
}

function decodeAdminDocument(snapshot) {
  if (!snapshot?.exists) return null;
  return {
    id: asText(snapshot.id),
    name: asText(snapshot.ref?.path),
    path: asText(snapshot.ref?.path),
    fields: decodeAdminValue(snapshot.data() || {})
  };
}

export async function getContractFixture(env = {}) {
  const configuredPath = asText(env?.packConfig?.contract?.fixturePath);
  const resolvedPath = configuredPath
    ? path.resolve(env.rootDir || process.cwd(), configuredPath)
    : path.resolve(__dirname, DEFAULT_FIXTURE_PATH);
  return clone(require(resolvedPath));
}

export async function getContractFirestoreRuntime(env = {}) {
  if (!env?.useEmulators) {
    throw new Error(
      "Contract smoke ist derzeit nur fuer Firestore Emulator vorbereitet. " +
      "Setze useEmulators=true und starte die lokale Testwelt."
    );
  }
  const runtimeConfig = env?.packConfig?.contract?.firestore || {};
  const emulatorHost = parseEmulatorHost(
    process.env.FIRESTORE_EMULATOR_HOST
    || runtimeConfig.emulatorHost
    || `${asText(runtimeConfig.host, DEFAULT_FIRESTORE_HOST)}:${Number(runtimeConfig.port || DEFAULT_FIRESTORE_PORT)}`
  );
  const firebaserc = await readFirebaserc(env.rootDir || process.cwd());
  const alias = pickText(
    process.env.MNYRA_CONTRACT_FIRESTORE_PROJECT_ALIAS,
    runtimeConfig.projectAlias,
    env.firebaseProjectAlias,
    process.env.MNYRA_FIREBASE_PROJECT_ALIAS,
    DEFAULT_FIREBASE_PROJECT_ALIAS
  );
  const projectId = pickText(
    process.env.MNYRA_CONTRACT_FIRESTORE_PROJECT_ID,
    runtimeConfig.projectId,
    process.env.MNYRA_TESTWORLD_FIREBASE_PROJECT_ID,
    process.env.MNYRA_RULES_TEST_PROJECT_ID,
    firebaserc?.projects?.[alias],
    alias
  );
  return {
    alias,
    projectId,
    host: emulatorHost.host,
    port: emulatorHost.port,
    baseUrl: `http://${emulatorHost.host}:${emulatorHost.port}/v1/projects/${projectId}/databases/(default)/documents`
  };
}

async function getContractFirestoreAdminRuntime(env = {}) {
  const runtime = await getContractFirestoreRuntime(env);
  if (cachedAdminRuntime?.projectId === runtime.projectId) {
    return cachedAdminRuntime;
  }
  const admin = loadFirebaseAdmin();
  const appName = `contract-smoke-${runtime.projectId}`;
  const existingApp = admin.apps.find((app) => app?.name === appName);
  const app = existingApp || admin.initializeApp({ projectId: runtime.projectId }, appName);
  cachedAdminRuntime = {
    ...runtime,
    admin,
    app,
    db: app.firestore()
  };
  return cachedAdminRuntime;
}

export async function getDocumentByPath(env = {}, documentPath = "") {
  const runtime = await getContractFirestoreAdminRuntime(env);
  const snapshot = await runtime.db.doc(documentPath).get();
  return decodeAdminDocument(snapshot);
}

export async function listDocumentsByPath(env = {}, collectionPath = "") {
  const runtime = await getContractFirestoreAdminRuntime(env);
  const snapshot = await runtime.db.collection(collectionPath).get();
  return Array.isArray(snapshot?.docs)
    ? snapshot.docs.map((entry) => decodeAdminDocument(entry)).filter(Boolean)
    : [];
}

export async function waitForContractCondition(checkFn, {
  timeoutMs = 15000,
  intervalMs = 350,
  errorMessage = "Contract smoke Bedingung wurde nicht rechtzeitig erfuellt."
} = {}) {
  const deadline = Date.now() + Math.max(500, Number(timeoutMs) || 0);
  let lastValue = null;
  while (Date.now() < deadline) {
    lastValue = await checkFn();
    if (lastValue) {
      return lastValue;
    }
    await new Promise((resolve) => setTimeout(resolve, Math.max(100, Number(intervalMs) || 0)));
  }
  throw new Error(errorMessage);
}

export function diffDocumentIds(beforeDocuments = [], afterDocuments = []) {
  const beforeIds = new Set((Array.isArray(beforeDocuments) ? beforeDocuments : []).map((entry) => asText(entry?.id)).filter(Boolean));
  return (Array.isArray(afterDocuments) ? afterDocuments : []).filter((entry) => !beforeIds.has(asText(entry?.id)));
}

export async function assertContractSeedPaths(env = {}, paths = []) {
  const checks = await Promise.all(
    (Array.isArray(paths) ? paths : []).map(async (docPath) => ({
      path: docPath,
      doc: await getDocumentByPath(env, docPath)
    }))
  );
  const missing = checks.filter((entry) => !entry.doc).map((entry) => entry.path);
  if (missing.length) {
    throw new Error(
      "Contract smoke Testwelt ist nicht auf Baseline. Fehlende Seed-Dokumente: " +
      missing.join(", ")
    );
  }
  return checks.map((entry) => entry.doc);
}
