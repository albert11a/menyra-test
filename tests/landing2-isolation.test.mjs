import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  LANDING2_API_KEY,
  LANDING2_PROJECT_ID
} from "../apps/menyra-social/lead-landing-2/landing2-config.js";

const here = dirname(fileURLToPath(import.meta.url));
const landingDir = join(here, "..", "apps", "menyra-social", "lead-landing-2");
const legacyDir = join(here, "..", "apps", "menyra-social", "lead-landing");

// Landing 2 zeigt das echte Lokal - sie darf es nicht anfassen.
//
// Diese Tests halten drei Grenzen fest:
//   1. Kein Code aus der App, kein Firebase-SDK, kein geteilter Zustand.
//   2. Kein Schreibpfad in die Daten des Lokals.
//   3. Keine Zeile aus der Lead-Landing (Landing 1) - und umgekehrt.
//
// Die dritte ist die, an die man beim Bauen am wenigsten denkt: Ein Import
// aus dem Nachbarordner faellt nirgends auf, bis jemand Landing 1 aendert und
// Landing 2 mit kaputtgeht.

// Kommentare entfernen: Die Dateien erklaeren in Kommentaren bewusst, was sie
// NICHT importieren. Geprueft wird echter Code.
function stripComments(code = "") {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function sources(dir = landingDir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => ({
      name,
      code: stripComments(readFileSync(join(dir, name), "utf8"))
    }));
}

test("Landing 2 importiert nichts ausser eigenen Modulen", () => {
  for (const { name, code } of sources()) {
    const imports = [...code.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      assert.ok(
        specifier.startsWith("./"),
        `${name} importiert "${specifier}" - erlaubt sind nur landing2-eigene Module`
      );
    }
  }
});

test("Landing 2 laedt kein Firebase-SDK und keine geteilte Instanz", () => {
  for (const { name, code } of sources()) {
    assert.ok(
      !code.includes("/shared/vendor/firebase/"),
      `${name} zieht das Firebase-SDK - Landing 2 liest ueber REST`
    );
    assert.ok(
      !code.includes("/shared/firebase-config.js"),
      `${name} nutzt die geteilte Firebase-Instanz der App`
    );
  }
});

test("Landing 2 enthaelt keine Firestore-Schreibaufrufe", () => {
  const forbidden = ["setDoc", "updateDoc", "addDoc", "deleteDoc", "writeBatch", "runTransaction"];
  for (const { name, code } of sources()) {
    for (const token of forbidden) {
      assert.ok(
        !code.includes(token),
        `${name} enthaelt "${token}" - Landing 2 darf die Daten des Lokals nur lesen`
      );
    }
  }
});

test("der Datenlayer nutzt nur lesende Firestore-Aufrufe", () => {
  const code = readFileSync(join(landingDir, "landing2-data.js"), "utf8");
  const methods = [...code.matchAll(/method:\s*["']([A-Z]+)["']/g)].map((match) => match[1]);
  // Einzig erlaubter POST ist :runQuery - die Slug-Suche.
  for (const method of methods) {
    assert.equal(method, "POST", `Unerwartete HTTP-Methode ${method} im Datenlayer`);
  }
  const runQueryCount = (code.match(/:runQuery/g) || []).length;
  assert.ok(runQueryCount >= methods.length, "POST darf nur fuer :runQuery verwendet werden");
});

test("geschrieben wird ausschliesslich in die eigene Messsammlung", () => {
  // Die Messung ist der einzige Schreibpfad der ganzen Seite. Sie schreibt in
  // landing2Sessions - nicht in restaurants, nicht in orders, nicht in die
  // Zahlen des Lokals und nicht in landingSessions (das gehoert Landing 1).
  for (const { name, code } of sources()) {
    const writes = [...code.matchAll(/method:\s*["'](PATCH|PUT|DELETE)["']/g)];
    if (!writes.length) continue;
    assert.equal(name, "landing2-track.js", `${name} schreibt - das darf nur die Messung`);
    assert.ok(code.includes("landing2Sessions"), "die Messung schreibt woanders hin als erwartet");
    assert.ok(
      !code.includes("landingSessions/"),
      "Landing 2 schreibt in die Sammlung von Landing 1 - die Auswertungen wuerden sich vermischen"
    );
  }
});

test("Landing 2 und die Lead-Landing teilen keine Datei", () => {
  // In beide Richtungen: Weder darf Landing 2 aus dem Nachbarordner
  // importieren, noch Landing 1 aus diesem.
  for (const { name, code } of sources()) {
    assert.ok(
      !code.includes("lead-landing/"),
      `${name} greift auf die Lead-Landing zu`
    );
  }
  for (const { name, code } of sources(legacyDir)) {
    assert.ok(
      !code.includes("lead-landing-2"),
      `${name} (Landing 1) greift auf Landing 2 zu`
    );
  }
});

test("Landing 2 haengt sich nicht an die App-Oberflaeche", () => {
  // Ein Klick auf der Seite darf nichts in der App ausloesen. Die einzige
  // Kennung, die sie im Dokument sucht, ist ihre eigene Wurzel.
  const app = readFileSync(join(landingDir, "landing2-app.js"), "utf8");
  assert.ok(app.includes('getElementById("l2Root")'), "Landing 2 haengt nicht an ihrer eigenen Wurzel");
  for (const { name, code } of sources()) {
    assert.ok(!code.includes("#app"), `${name} greift nach der Wurzel der Social-App`);
    assert.ok(!code.includes("history.pushState"), `${name} greift in die Adresszeile ein`);
    assert.ok(!code.includes("localStorage.setItem(\"menyra"), `${name} schreibt in den Speicher der App`);
  }
});

test("Firebase-Konfiguration bleibt mit der App synchron", () => {
  const shared = readFileSync(join(here, "..", "shared", "firebase-config.js"), "utf8");
  assert.ok(
    shared.includes(`projectId: "${LANDING2_PROJECT_ID}"`),
    "projectId weicht von shared/firebase-config.js ab"
  );
  assert.ok(
    shared.includes(`apiKey: "${LANDING2_API_KEY}"`),
    "apiKey weicht von shared/firebase-config.js ab"
  );
});

test("die Messung schreibt nur bekannte Ereignisnamen", async () => {
  const { LANDING2_EVENTS, LANDING2_CLAIM_EVENT } = await import(
    "../apps/menyra-social/lead-landing-2/landing2-track.js"
  );
  const names = new Set([...Object.values(LANDING2_EVENTS), LANDING2_CLAIM_EVENT]);
  for (const name of names) {
    assert.match(name, /^landing2_[a-z_]+$/, `"${name}" folgt nicht dem Namensschema landing2_*`);
  }
  // Was in der Spezifikation steht, muss auch vorkommen.
  [
    "landing2_open",
    "landing2_profile_seen",
    "landing2_free_seen",
    "landing2_discovery_seen",
    "landing2_qr_seen",
    "landing2_order_seen",
    "landing2_go_seen",
    "landing2_save_seen",
    "landing2_business_seen",
    "landing2_vision_seen",
    "landing2_cta_seen",
    "landing2_claim_click"
  ].forEach((expected) => {
    assert.ok(names.has(expected), `Ereignis ${expected} fehlt`);
  });
});
