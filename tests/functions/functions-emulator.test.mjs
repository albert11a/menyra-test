import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("firebase emulator hub exposes the local Functions emulator", async () => {
  const response = await fetch("http://127.0.0.1:4400/emulators");
  assert.equal(response.ok, true);

  const emulators = await response.json();
  assert.equal(emulators.functions.host, "127.0.0.1");
  assert.equal(emulators.functions.port, 5001);
});

test("functions package stays local and is not a production deploy command", async () => {
  const pkg = JSON.parse(await readFile("functions/package.json", "utf8"));

  assert.equal(pkg.private, true);
  assert.equal(pkg.main, "index.js");
  assert.equal(pkg.engines.node, "20");
  assert.ok(
    !Object.values(pkg.scripts || {}).some((script) => /deploy/i.test(script)),
  );
});
