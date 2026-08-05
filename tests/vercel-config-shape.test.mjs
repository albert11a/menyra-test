import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

// vercel.json wird beim Ausliefern gegen ein festes Schema geprueft. Steht ein
// Feld darin, das Vercel nicht kennt, wird nicht etwa dieses Feld ignoriert -
// die ganze Auslieferung bricht ab ("should NOT have additional property").
//
// Genau das ist passiert: In einem Header-Eintrag stand ein "//" als
// Kommentar. JSON kennt keine Kommentare, und Vercel laesst auch keine zu.
// Hier faellt so etwas auf, bevor es die Auslieferung anhaelt.
//
// Erklaerungen zu einer Regel gehoeren deshalb in den Code oder in einen Test,
// nicht in die Konfiguration.

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

// Was Vercel an diesen Stellen kennt. Kommt eine Regel mit einem neuen, echten
// Feld dazu (etwa "has" bei einem Header), gehoert es hier ergaenzt - dann ist
// es eine bewusste Entscheidung und kein Tippfehler.
const ERLAUBT = {
  headers: new Set(["source", "headers", "has", "missing"]),
  "headers[].headers[]": new Set(["key", "value"]),
  rewrites: new Set(["source", "destination", "has", "missing"]),
  redirects: new Set(["source", "destination", "permanent", "statusCode", "has", "missing"])
};

function pruefe(name, eintraege, erlaubt) {
  const fremd = [];
  eintraege.forEach((eintrag, index) => {
    Object.keys(eintrag).forEach((schluessel) => {
      if (!erlaubt.has(schluessel)) fremd.push(`${name}[${index}].${schluessel}`);
    });
  });
  assert.deepEqual(
    fremd,
    [],
    `Vercel kennt diese Felder nicht und weist die ganze Datei ab: ${fremd.join(", ")}.`
    + " Kommentare gehoeren nicht in die Konfiguration."
  );
}

test("kein Header-Eintrag traegt ein Feld, das Vercel nicht kennt", () => {
  pruefe("headers", config.headers || [], ERLAUBT.headers);
});

test("kein einzelner Header traegt mehr als key und value", () => {
  const fremd = [];
  (config.headers || []).forEach((eintrag, index) => {
    (eintrag.headers || []).forEach((kopf, innen) => {
      Object.keys(kopf).forEach((schluessel) => {
        if (!ERLAUBT["headers[].headers[]"].has(schluessel)) {
          fremd.push(`headers[${index}].headers[${innen}].${schluessel}`);
        }
      });
    });
  });
  assert.deepEqual(fremd, []);
});

test("Umleitungen und Weiterleitungen tragen nur bekannte Felder", () => {
  pruefe("rewrites", config.rewrites || [], ERLAUBT.rewrites);
  pruefe("redirects", config.redirects || [], ERLAUBT.redirects);
});

test("jede Regel hat eine Quelle, und jeder Header hat einen Wert", () => {
  (config.headers || []).forEach((eintrag, index) => {
    assert.ok(eintrag.source, `headers[${index}] hat keine source`);
    assert.ok(Array.isArray(eintrag.headers) && eintrag.headers.length, `headers[${index}] setzt nichts`);
    eintrag.headers.forEach((kopf, innen) => {
      assert.ok(kopf.key, `headers[${index}].headers[${innen}] hat keinen key`);
      assert.equal(typeof kopf.value, "string", `headers[${index}].headers[${innen}] hat keinen Wert als Text`);
    });
  });
  (config.rewrites || []).forEach((eintrag, index) => {
    assert.ok(eintrag.source && eintrag.destination, `rewrites[${index}] ist unvollstaendig`);
  });
});
