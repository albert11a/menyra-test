import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const syncScript = require("../functions/scripts/sync-go-shared.cjs");

// ===========================================================================
// Eine Regel, zwei Laufzeiten - aber nur eine Quelle.
//
// Die GO-Domaene liegt in shared/go als ESM und wird fuer die Functions nach
// CommonJS uebersetzt. Der Sinn der Uebung faellt in dem Augenblick, in dem
// jemand die Quelle aendert und das Uebersetzen vergisst: Dann rechnet die
// Suche im Browser anders als der Server beim Buchen, und niemand sieht es,
// bis ein Gast vor einer Tuer steht.
//
// Dieser Test faellt stattdessen. Was zu tun ist, steht in der Meldung.
// ===========================================================================

test("the generated server copy matches shared/go", () => {
  const generated = syncScript.generate();
  generated.forEach((file) => {
    const filePath = path.join(syncScript.outputDir, file.fileName);
    let onDisk = "";
    try {
      onDisk = readFileSync(filePath, "utf8");
    } catch {
      onDisk = "";
    }
    assert.equal(
      onDisk,
      file.contents,
      `functions/go/generated/${file.fileName} is out of date. Run: node functions/scripts/sync-go-shared.cjs`
    );
  });
});

test("every domain module of shared/go is carried over", () => {
  // Ein neues Modul in shared/go, das hier nicht steht, wuerde auf dem Server
  // fehlen - und zwar erst beim Laden in der Cloud auffallen.
  const listed = new Set(syncScript.SOURCE_FILES);
  const sourceDir = new URL("../shared/go/", import.meta.url);
  const files = readFileSync(new URL("../functions/scripts/sync-go-shared.cjs", import.meta.url), "utf8");
  assert.ok(files.includes("SOURCE_FILES"));
  const actual = require("node:fs").readdirSync(sourceDir).filter((name) => name.endsWith(".js"));
  actual.forEach((name) => {
    assert.equal(listed.has(name), true, `shared/go/${name} is missing in SOURCE_FILES`);
  });
});

test("the translated module really loads and answers like the source", async () => {
  const generatedMatching = require("../functions/go/generated/go-matching-core.cjs");
  const sourceMatching = await import("../shared/go/go-matching-core.js");
  const nowMs = Date.parse("2026-08-13T14:00:00.000Z");
  const request = { city: "Prishtina", partySize: 4, category: "food", requestedAt: nowMs };
  assert.deepEqual(
    generatedMatching.normalizeGoSearchRequest(request, { nowMs }),
    sourceMatching.normalizeGoSearchRequest(request, { nowMs })
  );
});
