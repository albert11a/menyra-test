import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
const seedPath = resolve(repoRoot, "seed/data/mnyra-local-seed.json");
const seed = JSON.parse(await readFile(seedPath, "utf8"));

const projectId =
  process.env.MNYRA_FIREBASE_PROJECT_ID || seed.projectId || "mnyra-local";
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const allowNonLocal = process.env.MNYRA_ALLOW_NONLOCAL_SEED === "1";

if (!allowNonLocal && !/^(mnyra-local|demo-|test-|local-)/.test(projectId)) {
  throw new Error(
    `Refusing to seed non-local project "${projectId}". Set MNYRA_ALLOW_NONLOCAL_SEED=1 only for deliberate local test projects.`,
  );
}

if (!emulatorHost || /googleapis\.com/i.test(emulatorHost)) {
  throw new Error("Refusing to seed without a local Firestore emulator host.");
}

function encodeValue(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value))
    return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "object")
    return { mapValue: { fields: encodeFields(value) } };
  throw new Error(`Unsupported seed value type: ${typeof value}`);
}

function encodeFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, encodeValue(value)]),
  );
}

function buildCommit(documents) {
  return {
    writes: documents.map((document) => ({
      update: {
        name: `projects/${projectId}/databases/(default)/documents/${document.path}`,
        fields: encodeFields(document.data || {}),
      },
    })),
  };
}

async function commitBatch(documents) {
  const url = `http://${emulatorHost}/v1/projects/${projectId}/databases/(default)/documents:commit`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(buildCommit(documents)),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Firestore emulator commit failed (${response.status}): ${body}`,
    );
  }
}

const documents = Array.isArray(seed.documents) ? seed.documents : [];
if (!documents.length) {
  throw new Error("Seed file contains no documents.");
}

const batchSize = 400;
for (let index = 0; index < documents.length; index += batchSize) {
  await commitBatch(documents.slice(index, index + batchSize));
}

console.log(
  `Seeded ${documents.length} document(s) into Firestore emulator project ${projectId} at ${emulatorHost}.`,
);
