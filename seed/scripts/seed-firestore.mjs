import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const repoRoot = dirname(
  fileURLToPath(new URL("../../package.json", import.meta.url)),
);
const seedPath = resolve(repoRoot, "seed/data/mnyra-local-seed.json");
const seed = JSON.parse(await readFile(seedPath, "utf8"));

const projectId =
  process.env.MNYRA_FIREBASE_PROJECT_ID || seed.projectId || "mnyra-local";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const allowNonLocal = process.env.MNYRA_ALLOW_NONLOCAL_SEED === "1";

if (!allowNonLocal && !/^(mnyra-local|demo-|test-|local-)/.test(projectId)) {
  throw new Error(
    `Refusing to seed non-local project "${projectId}". Set MNYRA_ALLOW_NONLOCAL_SEED=1 only for deliberate local test projects.`,
  );
}

if (!firestoreHost || /googleapis\.com/i.test(firestoreHost)) {
  throw new Error("Refusing to seed without a local Firestore emulator host.");
}

if (!authHost || /googleapis\.com/i.test(authHost)) {
  throw new Error("Refusing to seed without a local Auth emulator host.");
}

process.env.FIRESTORE_EMULATOR_HOST = firestoreHost;
process.env.FIREBASE_AUTH_EMULATOR_HOST = authHost;

if (!getApps().length) {
  initializeApp({ projectId });
}

const db = getFirestore();
const auth = getAuth();

async function seedAuthUsers(authUsers) {
  for (const user of authUsers) {
    const payload = {
      uid: user.uid,
      email: user.email,
      emailVerified: true,
      displayName: user.displayName,
      password: user.password || "local-test-password",
      disabled: false,
    };

    try {
      await auth.updateUser(user.uid, payload);
    } catch (error) {
      if (error && error.code === "auth/user-not-found") {
        await auth.createUser(payload);
        continue;
      }
      throw error;
    }
  }
}

async function seedDocuments(documents) {
  const batchSize = 400;
  for (let index = 0; index < documents.length; index += batchSize) {
    const batch = db.batch();
    for (const document of documents.slice(index, index + batchSize)) {
      batch.set(db.doc(document.path), document.data || {});
    }
    await batch.commit();
  }
}

const authUsers = Array.isArray(seed.authUsers) ? seed.authUsers : [];
const documents = Array.isArray(seed.documents) ? seed.documents : [];

if (!documents.length) {
  throw new Error("Seed file contains no documents.");
}

await seedAuthUsers(authUsers);
await seedDocuments(documents);

console.log(
  `Seeded ${documents.length} Firestore document(s) and ${authUsers.length} Auth user(s) into local emulators for project ${projectId}.`,
);
