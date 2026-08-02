import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  LEAD_LANDING_API_KEY,
  LEAD_LANDING_PROJECT_ID
} from "../apps/menyra-social/lead-landing/lead-landing-config.js";

const here = dirname(fileURLToPath(import.meta.url));
const landingDir = join(here, "..", "apps", "menyra-social", "lead-landing");

// Kommentare entfernen: die Landing-Dateien erklaeren in Kommentaren
// bewusst, was sie NICHT importieren. Geprueft wird echter Code.
function stripComments(code = "") {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function landingSources() {
  return readdirSync(landingDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => ({
      name,
      code: stripComments(readFileSync(join(landingDir, name), "utf8"))
    }));
}

// Die Lead-Landing lief frueher im Shell der Social-App und konnte dadurch
// das echte Profil beeintraechtigen. Diese Tests halten die Isolation fest.

test("Lead-Landing importiert nichts aus der Social-App", () => {
  for (const { name, code } of landingSources()) {
    const imports = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      assert.ok(
        specifier.startsWith("./"),
        `${name} importiert "${specifier}" - erlaubt sind nur landing-eigene Module`
      );
    }
  }
});

test("Lead-Landing laedt kein Firebase-SDK", () => {
  for (const { name, code } of landingSources()) {
    assert.ok(
      !code.includes("/shared/vendor/firebase/"),
      `${name} zieht das Firebase-SDK - die Landing liest ueber REST`
    );
    assert.ok(
      !code.includes("/shared/firebase-config.js"),
      `${name} nutzt die geteilte Firebase-Instanz der App`
    );
  }
});

test("Lead-Landing enthaelt keine Firestore-Schreibaufrufe", () => {
  const forbidden = ["setDoc", "updateDoc", "addDoc", "deleteDoc", "writeBatch", "runTransaction"];
  for (const { name, code } of landingSources()) {
    for (const token of forbidden) {
      assert.ok(
        !code.includes(token),
        `${name} enthaelt "${token}" - die Landing darf ausschliesslich lesen`
      );
    }
  }
});

test("REST-Datenlayer nutzt nur lesende Firestore-Aufrufe", () => {
  const code = readFileSync(join(landingDir, "lead-landing-data.js"), "utf8");
  const methods = [...code.matchAll(/method:\s*["']([A-Z]+)["']/g)].map((match) => match[1]);
  // Einzig erlaubter POST ist :runQuery - die Slug-Suche.
  for (const method of methods) {
    assert.equal(method, "POST", `Unerwartete HTTP-Methode ${method}`);
  }
  const postCount = methods.length;
  const runQueryCount = (code.match(/:runQuery/g) || []).length;
  assert.ok(runQueryCount >= postCount, "POST darf nur fuer :runQuery verwendet werden");
});

test("Landing-Firebase-Konfiguration bleibt mit der App synchron", () => {
  const shared = readFileSync(join(here, "..", "shared", "firebase-config.js"), "utf8");
  assert.ok(
    shared.includes(`projectId: "${LEAD_LANDING_PROJECT_ID}"`),
    "projectId weicht von shared/firebase-config.js ab"
  );
  assert.ok(
    shared.includes(`apiKey: "${LEAD_LANDING_API_KEY}"`),
    "apiKey weicht von shared/firebase-config.js ab"
  );
});
