// /lifeskinshop in zwei fertigen Fassungen + middleware.js (Inhaber 07.10.):
// Heart stellt das Akne-Set auf 2 oder 3 Produkte, Vercel liefert sofort die
// passende Seite aus - ohne Umspringen beim ersten Laden.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { shopHtmlFuerFassung, fassungAusSetet, fassungPreise } from "../shared/lifeskin-shop-fassung.js";
import middleware, { anzahlAusAntwort, config, _zuruecksetzen } from "../middleware.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");
const rest = (lista) => ({ fields: { lista: { arrayValue: { values: lista.map((s) => ({ mapValue: { fields: {
  id: { stringValue: s.id ?? "acne" }, titulli: { stringValue: s.titulli ?? "Seti kundër akneve" }, aktiv: { booleanValue: s.aktiv !== false }, cmimi: { integerValue: String(s.cmimi || 0) },
  produkte: { arrayValue: { values: s.produkte.map((p) => ({ stringValue: p })) } } } } })) } } } });
const antwort = (daten, status = 200) => ({ status, ok: status === 200, json: async () => daten });
const DREI = ["lf-clean", "lf-acne", "lf-moistur"], ZWEI = ["lf-acne", "lf-moistur"];

test("die 2er-Seite: Merkmal und alle Preise, sonst Zeichen fuer Zeichen gleich", () => {
  const zwei = shopHtmlFuerFassung(HTML, 2);
  assert.match(zwei, /<html [^>]*data-set-produkte="2">/);
  assert.deepEqual([...zwei.matchAll(/data-preis="cmimi">([^<]+)/g)].map((m) => m[1]).filter((p) => p !== "19 €"), []);
  assert.deepEqual([...zwei.matchAll(/data-preis="vecmas"[^>]*>([^<]+)/g)].map((m) => m[1]).filter((p) => p !== "58 €"), []);
  assert.match(zwei, /data-preis="zbritje" data-preis-zbritje>−67%/);
  // Die CSS-Regeln im Kopf bleiben unberuehrt.
  assert.match(zwei, /html\[data-set-produkte="3"\] ls-zwei\{display:none!important\}/);
  const ohnePreise = (h) => h.replace(/data-set-produkte="[23]">/, "").replace(/(data-preis="[a-z-]+"[^>]*>)[^<]*/g, "$1");
  assert.equal(ohnePreise(zwei), ohnePreise(HTML));
  assert.equal(shopHtmlFuerFassung(HTML, 3), HTML, "3 ist die Quelle selbst");
  assert.deepEqual(fassungPreise(3), { cmimi: 39, vecmas: 87, zbritje: 55 });
  assert.deepEqual(fassungPreise(2), { cmimi: 19, vecmas: 58, zbritje: 67 });
});

test("Middleware und Laden lesen dieselbe Fassung aus Heart", () => {
  const faelle = [
    [[{ produkte: DREI }], 3], [[{ produkte: ZWEI }], 2],
    [[{ id: "a", produkte: ZWEI, aktiv: false }, { id: "b", produkte: DREI }], 3],
    [[{ id: "p", produkte: ["lf-pore", "lf-moistur"] }, { id: "a", produkte: ZWEI }], 2],
    [[{ id: "", produkte: ZWEI }, { id: "b", produkte: DREI }], 3],
    [[{ id: "a", titulli: "", produkte: ZWEI }, { id: "b", produkte: DREI }], 3],
    [[{ id: "a", produkte: DREI }, { id: "a", produkte: ZWEI }], 3],
    [[], 3]
  ];
  for (const [lista, erwartet] of faelle) {
    assert.equal(anzahlAusAntwort(rest(lista)), erwartet, JSON.stringify(lista));
    const lista2 = lista.map((s) => ({ id: s.id ?? "acne", titulli: s.titulli ?? "Seti kundër akneve", aktiv: s.aktiv !== false, produkte: s.produkte }));
    assert.equal(fassungAusSetet({ lista: lista2 })?.anzahl ?? 3, erwartet, JSON.stringify(lista));
  }
  assert.deepEqual(config.matcher, ["/lifeskinshop", "/lifeskinshop/"], "nur der Laden, nichts sonst");
});

test("Middleware: 2 Produkte -> index-2.html, 3 -> normale Seite; Fehler und Zeitueberschreitung -> normale Seite", async () => {
  const anfrage = { url: "https://www.mnyra.com/lifeskinshop?fbclid=abc" };
  const fall = async (holen) => { _zuruecksetzen(); return middleware(anfrage, {}, holen); };
  assert.equal((await fall(async () => antwort(rest([{ produkte: ZWEI }])))).headers.get("x-middleware-rewrite"),
    "https://www.mnyra.com/apps/lifeskin-shop/index-2.html");
  for (const holen of [async () => antwort(rest([{ produkte: DREI }])), async () => antwort({}, 404),
    async () => antwort({}, 500), async () => { throw new Error("netz"); }, async () => antwort(null)]) {
    const r = await fall(holen);
    assert.equal(r.headers.get("x-middleware-rewrite"), null);
    assert.equal(r.headers.get("x-middleware-next"), "1");
  }
  // Haengt Firestore, wartet die Middleware hoechstens 0,7 s.
  const start = Date.now();
  const r = await fall((_, { signal }) => new Promise((_, nein) => signal.addEventListener("abort", () => nein(new Error("abort")))));
  assert.ok(Date.now() - start < 1500);
  assert.equal(r.headers.get("x-middleware-next"), "1");
});

test("Middleware merkt sich den Stand kurz - nicht jeder Werbeklick fragt Firestore", async () => {
  _zuruecksetzen();
  let n = 0;
  const holen = async () => { n += 1; return antwort(rest([{ produkte: ZWEI }])); };
  for (const id of ["a", "b", "c"]) await middleware({ url: `https://www.mnyra.com/lifeskinshop?fbclid=${id}` }, {}, holen);
  assert.equal(n, 1);
});

test("Build erzeugt index-2.html, Laden startet mit der Fassung des HTML", () => {
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /apps\/lifeskin-shop\/index-2\.html/);
  assert.match(lies("apps/lifeskin-shop/shop.js"), /shopStartSetet\(this\.dok\.documentElement\?\.getAttribute\?\.\("data-set-produkte"\) === "2" \? 2 : 3\)/);
  assert.doesNotMatch(lies("middleware.js"), /^import /m, "keine Importe in der Middleware");
});
