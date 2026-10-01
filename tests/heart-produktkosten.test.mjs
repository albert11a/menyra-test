// PRODUKTKOSTEN (01.10., Inhaber): nur in Heart, nur fuer das CEO-Konto,
// nirgends im Code oder auf einer oeffentlichen Seite.
// Ein Produkt = 1 Shishe + 1 Stiker + 30 ml Krem (Krem: Preis / Menge).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { kostenNormalisieren, produktRechnung, setRechnung, preisJeMl, renderProduktkosten, KOSTEN_DOK } from "../apps/mnyra-heart/heart-lifeskin-kosten.js";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const KOSTEN = {
  shishePreis: "400", shisheStueck: "1000", stikerPreis: 50, stikerStueck: "500", mbushja: "",
  kreme: [
    { id: "a", name: "BPO 5 %", preis: "60", menge: "1", einheit: "l", produkt: "lf-acne" },
    { id: "m", name: "Ceramide", preis: 12, menge: 500, einheit: "ml", produkt: "lf-moistur" }
  ],
  versand: "3", verpackung: 0.5
};

test("Krem: Preis je ml aus Menge in ml oder Liter", () => {
  assert.equal(preisJeMl({ preis: 60, menge: 1, einheit: "l" }), 0.06);
  assert.equal(preisJeMl({ preis: 12, menge: 500, einheit: "ml" }), 0.024);
  assert.equal(preisJeMl({ preis: 12, menge: 0, einheit: "ml" }), 0);
});

test("ein Produkt = 1 Shishe + 1 Stiker + 30 ml Krem", () => {
  const acne = produktRechnung("lf-acne", KOSTEN);
  // 0,40 + 0,10 + 30 x 0,06 = 2,30
  assert.equal(acne.mbushja, 30);
  assert.equal(acne.kremKosten, 1.8);
  assert.equal(acne.summe, 2.3);
  // 0,40 + 0,10 + 30 x 0,024 = 1,22
  assert.equal(produktRechnung("lf-moistur", KOSTEN).summe, 1.22);
  const ohne = produktRechnung("lf-x", KOSTEN);
  assert.equal(ohne.ohneKrem, true);
  assert.equal(ohne.summe, 0.5);
  // Andere Fuellmenge.
  assert.equal(produktRechnung("lf-acne", { ...KOSTEN, mbushja: "50" }).summe, 3.5);
});

test("ein Set = seine Produkte + je Bestellung; was bleibt", () => {
  const r = setRechnung({ id: "acne", produkte: ["lf-acne", "lf-moistur"], cmimi: 29 }, KOSTEN);
  // 2,30 + 1,22 + 3 + 0,5 = 7,02
  assert.equal(r.kosten, 7.02);
  assert.equal(r.bleibt, 21.98);
  assert.equal(r.marge, 76);
  assert.deepEqual(r.fehlt, []);
  // Unsinn wird 0; leere Kremet fallen weg.
  const n = kostenNormalisieren({ shishePreis: "-1", kreme: [{}, { name: "x" }] });
  assert.equal(n.shishePreis, 0);
  // Shishe/Stiker je Stueck = Gesamt / Stueck; ohne Stueck 0.
  assert.equal(produktRechnung("lf-x", { shishePreis: 456, stikerPreis: 845 }).summe, 0);
  assert.equal(produktRechnung("lf-x", { shishePreis: 456, shisheStueck: 1200, stikerPreis: 845, stikerStueck: 5000 }).summe, 0.55);
  // Alter Stand (ein Feld): als Gesamtpreis uebernommen.
  assert.equal(kostenNormalisieren({ shishe: 456 }).shishePreis, 456);
  assert.equal(n.kreme.length, 1);
});

test("die Karte: Shishe, Stiker, Mbushja, Kremet mit Produkt, + Krem, Ergebnis", () => {
  const html = renderProduktkosten({ produkte: [{ id: "lf-acne", name: "LF ACNE" }, { id: "lf-moistur", name: "LF MOISTUR" }], produktkosten: KOSTEN },
    [{ id: "acne", titulli: "Acne Duo", produkte: ["lf-acne", "lf-moistur"], cmimi: 29 }]);
  assert.match(html, /data-kosten="shishePreis" value="400"/);
  assert.match(html, /data-kosten="shisheStueck" value="1000"/);
  assert.match(html, /data-kosten="stikerPreis" value="50"/);
  assert.match(html, /= 0,40 € je copë/);
  assert.match(html, /= 0,10 € je copë/);
  assert.match(html, /data-kosten="mbushja" value="30"/);
  assert.match(html, /data-krem="a"/);
  assert.match(html, /<option value="l" selected>l<\/option>/);
  assert.match(html, /<option value="lf-acne" selected>LF ACNE<\/option>/);
  assert.match(html, /data-action="lifeskin-krem-neu"/);
  assert.match(html, /data-krem-vorlage/);
  assert.match(html, /2,30 € je Produkt/);
  assert.match(html, /bleibt 21,98 €/);
  assert.match(renderProduktkosten({}), /Wird geladen/);
});

test("die Zahlen liegen nur dort, wo allein das CEO-Konto liest", () => {
  assert.equal(KOSTEN_DOK, "lifeskin__produktkosten");
  assert.match(lies("apps/mnyra-heart/heart-lifeskin-adapter.js"), /doc\(db, "landingArchive", KOSTEN_DOK\)/);
  assert.match(lies("firestore.rules"), /match \/landingArchive\/\{documentId\} \{\s*allow read, write: if isCeoActor\(\);\s*\}/);
  // Die Landing-Ablage nimmt nur Eintraege mit archived/next/wait/reset - die Kosten nicht.
  const ablage = lies("apps/mnyra-heart/heart-landing-adapter.js");
  assert.match(ablage, /if \(data\.archived === true\) archived\.push\(eintrag\.id\);/);
  for (const p of ["next__", "wait__"]) assert.ok(!KOSTEN_DOK.startsWith(p));
  const oeffentlich = ["apps/lifeskin", "apps/lifeskin-shop", "apps/lifeskin-verkauf", "apps/lifeskin-astra", "apps/lifeskin-landing", "apps/lifeskin-bericht", "shared"];
  const dateien = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? dateien(p) : [p]; });
  for (const dir of oeffentlich) {
    for (const datei of dateien(dir).filter((f) => /\.(js|mjs|html)$/.test(f))) {
      const text = readFileSync(datei, "utf8");
      assert.ok(!/produktkosten/i.test(text), `${datei} erwaehnt die Produktkosten`);
      assert.ok(!/["'`]landingArchive["'`]/.test(text), `${datei} greift auf landingArchive zu`);
    }
  }
});
