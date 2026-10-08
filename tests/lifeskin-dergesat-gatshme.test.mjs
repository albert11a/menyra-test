// /dergesat - FERTIGE PRODUKTE WIEDER VERWENDEN (08.10., Inhaber): Eine
// Bestellung wird mit dem fertigen Produkt einer Anuluar gepackt. Danach
// steht das Produkt nicht mehr unter "Produkte të gatshme", und fuer die
// Bestellung gehen keine neuen Shishe, Stiker und keine Creme ab.
import test from "node:test";
import assert from "node:assert/strict";
import { dergesaLesen, llogaritDepon, arsyejaPaGatshme, lidhGatshme, hiqGatshme, eGatshmeNeDepo } from "../shared/lifeskin-dergesat.js";
import { renderListe, gatshmePer } from "../apps/lifeskin-dergesat/dergesat-pamja.js";

const T = "2026-10-08T10:00:00.000Z";
const J = "2026-10-08T18:00:00.000Z";
const d = (kennung, extra = {}) => dergesaLesen({ statusi: "porosi", createdAt: T, postaBeki: `PB-${kennung}`, cmimi: 25, ...extra }, kennung);
const lenda = { shisheStueck: 10, stikerStueck: 10, mbushja: 30, kreme: [{ menge: 300, einheit: "ml", produkt: "lf-acne" }, { menge: 300, einheit: "ml", produkt: "lf-moistur" }] };

test("Bestellung mit fertigem Produkt: weg aus 'të gatshme', kein neues Material", () => {
  // Gepackt, nie verschickt, storniert: fertiges Duo im Lager.
  const g = d("g", { statusi: "anuluar", gatiAt: T, anuluarAt: T, produkte: ["LF ACNE", "LF MOISTUR"] });
  // Neue Bestellung, heute gepackt.
  const n = d("n", { statusi: "gati", gatiAt: J, produkte: ["Acne Duo"] });
  const vorher = llogaritDepon([g, n], lenda);
  assert.equal(vorher.gatshme.numri, 1);
  assert.deepEqual(vorher.lenda.shishe, { blere: 10, dalur: 4, mbetur: 6 }, "ohne Verknuepfung doppelt gezaehlt");

  assert.equal(arsyejaPaGatshme(n, g), null);
  const f = lidhGatshme(n, g, { jetzt: J });
  assert.deepEqual(f.porosia, { ngaGatshme: "g", updatedAt: J, nga: "heart" });
  assert.deepEqual(f.gatshme, { perdorurAt: J, perdorurPer: "n", updatedAt: J, nga: "heart" });

  const n2 = dergesaLesen({ ...n, ...f.porosia }, "n");
  const g2 = dergesaLesen({ ...g, ...f.gatshme }, "g");
  assert.equal(eGatshmeNeDepo(g2), false);
  const nachher = llogaritDepon([g2, n2], lenda);
  assert.equal(nachher.gatshme.numri, 0, "nicht mehr unter Produkte të gatshme");
  assert.deepEqual(nachher.lenda.shishe, { blere: 10, dalur: 2, mbetur: 8 }, "die 2 Flaschen bleiben im Lager");
  assert.deepEqual(nachher.lenda.stiker, { blere: 10, dalur: 2, mbetur: 8 });
  assert.deepEqual(nachher.lenda.kremet.map((k) => [k.emri, k.dalur]), [["BPO", 30], ["DAILY", 30]]);

  // Zuruecknehmen: alles wie vorher.
  const h = hiqGatshme(n2, { jetzt: J });
  const n3 = dergesaLesen({ ...n2, ...h.porosia }, "n");
  const g3 = dergesaLesen({ ...g2, ...h.gatshme }, "g");
  assert.deepEqual(llogaritDepon([g3, n3], lenda).lenda.shishe, vorher.lenda.shishe);
  assert.equal(llogaritDepon([g3, n3], lenda).gatshme.numri, 1);
});

test("nur passende fertige Produkte, nie doppelt", () => {
  const g = d("g", { statusi: "anuluar", gatiAt: T, anuluarAt: T, produkte: ["LF ACNE", "LF MOISTUR"] });
  assert.match(arsyejaPaGatshme(d("a", { produkte: ["LF ACNE"] }), g), /nuk i ka të gjitha: 1× DAILY/, "sonst ginge ein Produkt verloren");
  assert.equal(arsyejaPaGatshme(d("b", { produkte: ["2× LF ACNE", "LF MOISTUR"] }), g), null, "Rest wird neu gepackt");
  const teil = llogaritDepon([g, d("b", { statusi: "gati", gatiAt: J, produkte: ["2× LF ACNE", "LF MOISTUR"], ngaGatshme: "g" })], lenda);
  assert.equal(teil.lenda.shishe.dalur, 3, "2 vom Anuluar + 1 neues BPO");
  assert.ok(arsyejaPaGatshme(d("c", { statusi: "anuluar", produkte: ["Acne Duo"] }), g));
  assert.ok(arsyejaPaGatshme(d("e", { produkte: ["Acne Duo"], ngaGatshme: "x" }), g));
  assert.ok(arsyejaPaGatshme(d("f", { produkte: ["Acne Duo"] }), { ...g, perdorurAt: J }), "schon verwendet");
  assert.ok(arsyejaPaGatshme(d("f", { produkte: ["Acne Duo"] }), d("u", { statusi: "anuluar", derguarAt: T, anuluarAt: T, produkte: ["Acne Duo"] })),
    "unterwegs und noch nicht zurueck: nicht im Lager");
  assert.equal(hiqGatshme(d("x")), null);
});

test("Knoepfe nur fuer den Inhaber", () => {
  const g = d("g", { statusi: "anuluar", gatiAt: T, anuluarAt: T, produkte: ["Acne Duo"] });
  const n = d("n", { produkte: ["Acne Duo"] });
  assert.deepEqual(gatshmePer(n, [g, n]).map((x) => x.kennung), ["g"]);
  assert.match(renderListe([g, n], "porosi", "heart"), /data-veprim="nga-gatshme" data-kennung="n"[^>]*>Të gatshme</);
  assert.doesNotMatch(renderListe([g, n], "porosi", "riba"), /nga-gatshme/);
  assert.doesNotMatch(renderListe([n], "porosi", "heart"), /nga-gatshme/, "ohne fertige Produkte kein Knopf");
  const verbunden = d("n", { produkte: ["Acne Duo"], ngaGatshme: "g" });
  const html = renderListe([verbunden], "porosi", "heart");
  assert.match(html, /Me produkte të gatshme ✓/);
  assert.match(html, /data-veprim="hiq-gatshme"/);
  assert.doesNotMatch(html, /data-veprim="nga-gatshme"/);
});
