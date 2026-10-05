// DERGESAT (/dergesat, Versand ueber Posta Beki - Auftrag 05.10.).
// Rechnung, erlaubte Schritte, Heart-Chips und die Seite selbst. Die
// Regeln gegen den Emulator: tests/rules/lifeskin-dergesat.test.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DERGESA, STATUS_CHIPS, KALIMET_RIBA, dergesaLesen, llogarit, ndryshimi, statusiNeHeart, hyrja,
  renditPerChip, numeroPerChip, mundTeKthehet, euroSq
} from "../shared/lifeskin-dergesat.js";
import { abgleichSchritte, produkteTePorosise, renderPostaBeki, renderDergesaChip, statusVonSitzung } from "../apps/mnyra-heart/heart-lifeskin-dergesat-render.js";
import { renderBestellungen } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderListe, renderKartat, renderChips } from "../apps/lifeskin-dergesat/dergesat-pamja.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const T = "2026-10-05T10:00:00.000Z";
const d = (kennung, felder = {}) => dergesaLesen({ postaBeki: `PB-${kennung}`, cmimi: 39, statusi: "porosi", createdAt: T, ...felder }, kennung);

test("die vier Chips in der gewuenschten Reihenfolge", () => {
  assert.deepEqual(STATUS_CHIPS.map((c) => c.label), ["Porosiat", "Dërguar", "Pranuar", "Anuluar"]);
});

test("Rechnung: Pritje barazim = Preis - 2,50 € je Dërguar/Pranuar bis Barazuar, Riba 2 €", () => {
  const liste = [
    d("a", { statusi: "derguar", derguarAt: T }),
    d("b", { statusi: "derguar", derguarAt: T }),
    d("c", { statusi: "pranuar", derguarAt: T, pranuarAt: T }),
    d("x", { statusi: "anuluar", derguarAt: T, anuluarAt: T }),
    d("p", { statusi: "porosi" })
  ];
  const ll = llogarit(liste);
  // 3 × (39 - 2,50) = 109,50 - Anuluar und Porosi zaehlen nicht.
  assert.equal(ll.pritjeBarazim.shuma, 109.5);
  assert.equal(ll.pritjeBarazim.numri, 3);
  assert.deepEqual(ll.pritjeBarazim.neRruge, { numri: 2, shuma: 73 });
  assert.equal(ll.pritjeBarazim.gati.shuma, 36.5);
  assert.deepEqual(ll.pritjeBarazim.gati.kennungen, ["c"]);
  // Pritje për Riben: nur Dërguar. € për Riben: Pranuar, noch nicht bezahlt.
  assert.deepEqual(ll.pritjeRiba, { numri: 2, shuma: 4 });
  assert.equal(ll.perRiba.shuma, 2);
  assert.equal(ll.barazuar.shuma, 0);
  assert.equal(ll.paguarRiba.shuma, 0);
});

test("Barazuar und Riba ausbezahlt wandern in ihre Karte, je Abrechnung gruppiert", () => {
  const z1 = "2026-10-06T08:00:00.000Z";
  const z2 = "2026-10-07T08:00:00.000Z";
  const liste = [
    d("a", { statusi: "pranuar", pranuarAt: T, barazuarAt: z1, ribaPaguarAt: z2 }),
    d("b", { statusi: "pranuar", pranuarAt: T, barazuarAt: z1 }),
    d("c", { statusi: "pranuar", pranuarAt: T, cmimi: 50.5, barazuarAt: z2 }),
    d("e", { statusi: "pranuar", pranuarAt: T })
  ];
  const ll = llogarit(liste);
  assert.equal(ll.pritjeBarazim.shuma, 36.5);
  assert.equal(ll.barazuar.shuma, 36.5 + 36.5 + 48);
  assert.deepEqual(ll.barazuar.grupet, [{ at: z2, numri: 1, shuma: 48 }, { at: z1, numri: 2, shuma: 73 }]);
  assert.deepEqual(ll.perRiba, { numri: 3, shuma: 6, kennungen: ["b", "c", "e"] });
  assert.deepEqual(ll.paguarRiba.grupet, [{ at: z2, numri: 1, shuma: 2 }]);
});

test("Riba geht nur vorwaerts: Te Beki, dann Pranuar oder Anuluar - mit genau den erlaubten Feldern", () => {
  assert.deepEqual(KALIMET_RIBA, { porosi: ["derguar"], derguar: ["pranuar", "anuluar"], pranuar: [], anuluar: [] });
  const f = ndryshimi(d("a"), "derguar", { roli: "riba", jetzt: T });
  assert.deepEqual(f, { statusi: "derguar", updatedAt: T, nga: "riba", derguarAt: T });
  assert.deepEqual(Object.keys(ndryshimi(d("a", { statusi: "derguar", derguarAt: T }), "pranuar", { roli: "riba", jetzt: T })).sort(),
    ["nga", "pranuarAt", "statusi", "updatedAt"]);
  assert.deepEqual(Object.keys(ndryshimi(d("a", { statusi: "derguar" }), "pranuar", { roli: "riba", jetzt: T })).sort(),
    ["nga", "pranuarAt", "statusi", "updatedAt"], "Riba schreibt nie derguarAt nach");
  assert.equal(ndryshimi(d("a"), "pranuar", { roli: "riba" }), null);
  assert.equal(ndryshimi(d("a"), "anuluar", { roli: "riba" }), null);
  assert.equal(ndryshimi(d("a", { statusi: "pranuar" }), "derguar", { roli: "riba" }), null);
  assert.equal(ndryshimi(d("a", { statusi: "anuluar" }), "derguar", { roli: "heart" }), null, "Anuluar bleibt Anuluar");
});

test("Heart darf zuruecknehmen - aber nicht, was schon abgerechnet ist", () => {
  const derguar = d("a", { statusi: "derguar", derguarAt: T });
  assert.deepEqual(ndryshimi(derguar, "porosi", { roli: "heart", jetzt: T }), { statusi: "porosi", updatedAt: T, nga: "heart", derguarAt: "" });
  const bezahlt = d("a", { statusi: "pranuar", pranuarAt: T, ribaPaguarAt: T });
  assert.equal(mundTeKthehet(bezahlt), false);
  assert.equal(ndryshimi(bezahlt, "derguar", { roli: "heart" }), null);
  assert.equal(ndryshimi(d("a", { statusi: "pranuar", barazuarAt: T }), "anuluar", { roli: "heart" }), null);
  assert.equal(ndryshimi(d("a"), "porosi", { roli: "heart" }), null);
});

test("Porosiat: die aelteste zuerst; sonst die juengste zuerst", () => {
  const liste = [d("neu", { createdAt: "2026-10-05T12:00:00.000Z" }), d("alt", { createdAt: "2026-10-04T12:00:00.000Z" }),
    d("x", { statusi: "derguar", derguarAt: "2026-10-01T00:00:00.000Z" }), d("y", { statusi: "derguar", derguarAt: "2026-10-03T00:00:00.000Z" })];
  assert.deepEqual(renditPerChip(liste, "porosi").map((x) => x.kennung), ["alt", "neu"]);
  assert.deepEqual(renditPerChip(liste, "derguar").map((x) => x.kennung), ["y", "x"]);
  assert.deepEqual(numeroPerChip(liste), { porosi: 2, derguar: 2, pranuar: 0, anuluar: 0 });
});

test("Login: kadrija ist Riba (mit festem Vorsatz), eine E-Mail ist der Heart-Zugang", () => {
  assert.deepEqual(hyrja(" Kadrija ", "1234"), { email: DERGESA.ribaEmail, password: "dergesat-1234", roli: "riba" });
  assert.equal(hyrja("albert@example.com", "x").email, "albert@example.com");
  assert.equal(hyrja("jemand", "x"), null);
  assert.ok(hyrja("kadrija", "1234").password.length >= 6, "Firebase verlangt sechs Zeichen");
  const quellen = lies("apps/lifeskin-dergesat/dergesat.js") + lies("shared/lifeskin-dergesat.js") + lies("apps/lifeskin-dergesat/dergesat-pamja.js");
  assert.doesNotMatch(quellen, /["'`]1234["'`]/, "Das Passwort steht nirgends im Code");
});

test("Heart: der Stand einer Bestellung", () => {
  assert.equal(statusiNeHeart({ order: { status: "neu" } }), "porosi");
  assert.equal(statusiNeHeart({ order: { status: "neu" }, bericht: { status: "versandt" } }), "derguar");
  assert.equal(statusiNeHeart({ order: { status: "neu" }, bericht: { status: "zugestellt" } }), "pranuar");
  assert.equal(statusiNeHeart({ order: { status: "storniert" }, dergesa: { statusi: "pranuar" } }), "anuluar");
  assert.equal(statusiNeHeart({ order: { status: "neu" }, bericht: { status: "versandt" }, dergesa: { statusi: "pranuar" } }), "pranuar",
    "/dergesat ist die Wahrheit, sobald es dort steht");
});

test("Heart zieht nach: Therapieseite, Begleitung, Storno - und ein zweiter Lauf findet nichts", () => {
  const sitzungen = [
    { id: "a", order: { orderId: "A", status: "bestaetigt" } },
    { id: "b", order: { orderId: "B", status: "neu" } },
    { id: "c", order: { orderId: "C", status: "neu" } },
    { id: "s", order: { orderId: "S", status: "neu" } }
  ];
  const berichte = { a: { status: "bestellt" }, b: { status: "versandt", versandtAt: T }, c: { status: "zugestellt" }, s: { status: "bestellt" } };
  const dergesat = {
    a: d("a", { statusi: "derguar", derguarAt: T }),
    b: d("b", { statusi: "pranuar", derguarAt: T, pranuarAt: "2026-10-06T09:00:00.000Z" }),
    c: d("c", { statusi: "pranuar", pranuarAt: T }),
    s: d("s", { statusi: "anuluar", anuluarAt: T })
  };
  const schritte = abgleichSchritte({ dergesat, sitzungen, berichte });
  assert.deepEqual(schritte.map((s) => [s.kennung, s.art, s.felder?.status, s.ndjekja]), [
    ["a", "bericht", "versandt", "derguar"],
    ["b", "bericht", "zugestellt", "dorezuar"],
    ["s", "storno", undefined, undefined]
  ]);
  assert.equal(schritte[0].felder.versandtAt, T);
  assert.match(schritte[0].felder.lieferVon, /^\d\d\.\d\d\.$/);
  assert.equal(schritte[1].felder.zugestelltAt, "2026-10-06T09:00:00.000Z");
  assert.equal(schritte[1].felder.versandtAt, undefined, "der fruehere Versandzeitpunkt bleibt");

  const danach = abgleichSchritte({
    dergesat,
    sitzungen: sitzungen.map((s) => (s.id === "s" ? { ...s, order: { ...s.order, status: "storniert" } } : s)),
    berichte: { ...berichte, a: { status: "versandt" }, b: { status: "zugestellt" } }
  });
  assert.deepEqual(danach, []);
  // Zurueckgenommen auf Porosi: wieder "bestellt".
  const zurueck = abgleichSchritte({ dergesat: { a: d("a") }, sitzungen, berichte: { a: { status: "versandt" } } });
  assert.deepEqual(zurueck.map((s) => s.felder.status), ["bestellt"]);
});

test("Produkte: Ladenzeilen, sonst der Befund, sonst das Set", () => {
  const produkte = [{ id: "p1", name: "Acne Gel" }, { id: "p2", name: "Krem" }];
  assert.deepEqual(produkteTePorosise({ order: { items: [{ id: "p1", name: "Acne Gel", sasia: 1 }, { id: "p2", sasia: 2 }] } }, null, produkte), ["Acne Gel", "2× Krem"]);
  assert.deepEqual(produkteTePorosise({ order: {} }, { produkte: [{ id: "p2" }, "p1"] }, produkte), ["Krem", "Acne Gel"]);
  assert.deepEqual(produkteTePorosise({ order: { set: { titulli: "Acne Duo" } } }, null, produkte), ["Acne Duo"]);
});

test("Akte: Feld Posta Beki mit Chip, ueberlebt das Neuzeichnen, gesperrt wenn storniert", () => {
  const sitzung = { id: "a", order: { orderId: "A", status: "neu" } };
  const html = renderPostaBeki(sitzung, { dergesat: { a: d("a", { statusi: "derguar" }) } });
  assert.match(html, /name="posta-beki" value="PB-a"/);
  assert.match(html, /data-bewahren="dg-pb:a:PB-a"/);
  assert.match(html, /data-action="dergesa" data-was="posta-beki"\s+data-id="a"/);
  assert.match(html, /heart-dergesa-chip--derguar">Dërguar · Beki PB-a/);
  assert.equal(renderPostaBeki({ id: "x", order: null }, {}), "");
  assert.match(renderPostaBeki({ id: "s", order: { orderId: "S", status: "storniert" } }, {}), /disabled/);
  assert.match(renderDergesaChip("porosi", null), />Porosi</);
});

test("Heart, Karte Bestellungen: vier Stand-Chips mit Zahl, jede Bestellung in genau einem, Chip unter der Bestellung", () => {
  const jetzt = new Date().toISOString();
  const bestellung = (id, status = "neu") => normalisiere(id, {
    createdAt: jetzt, updatedAt: jetzt, code: id.toUpperCase(), name: id, bestelltAt: jetzt,
    order: { orderId: id.toUpperCase(), total: 39, status, createdAt: jetzt }
  });
  const sitzungen = [bestellung("a"), bestellung("b"), bestellung("c"), bestellung("s", "storniert")];
  const zustand = {
    berichte: { c: { status: "zugestellt" } },
    dergesat: { b: d("b", { statusi: "derguar" }) }
  };
  assert.equal(statusVonSitzung(sitzungen[3], zustand), "anuluar");
  const porosi = renderBestellungen(sitzungen, "max", { ...zustand, bestellStatus: "porosi" });
  assert.match(porosi, /data-action="lifeskin-bestellstatus" data-wert="porosi"[\s\S]*?Porosiat <span>1<\/span>/);
  assert.match(porosi, /Dërguar <span>1<\/span>/);
  assert.match(porosi, /Pranuar <span>1<\/span>/);
  assert.match(porosi, /Anuluar <span>1<\/span>/);
  assert.match(porosi, /data-id="a"/);
  assert.doesNotMatch(porosi, /data-id="b"|data-id="c"|data-id="s"/);
  const derguar = renderBestellungen(sitzungen, "max", { ...zustand, bestellStatus: "derguar" });
  assert.match(derguar, /data-id="b"[\s\S]*heart-dergesa-chip--derguar">Dërguar · Beki PB-b/);
  const anuluar = renderBestellungen(sitzungen, "max", { ...zustand, bestellStatus: "anuluar" });
  assert.match(anuluar, /data-id="s"[\s\S]*storniert/);
});

test("Storniert zaehlt in keinem Umsatz mehr", async () => {
  const { baueKennzahlen } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const jetzt = new Date().toISOString();
  const s = (id, status) => normalisiere(id, { createdAt: jetzt, updatedAt: jetzt, bestelltAt: jetzt, order: { orderId: id, total: 40, status, createdAt: jetzt } });
  assert.equal(s("x", "storniert").storniert, true);
  const b = baueKennzahlen([s("a", "neu"), s("b", "storniert")], { zeitraum: "heute" });
  assert.equal(b.umsatzHeute, 40);
  assert.equal(b.bestellungenHeute, 1);
});

test("/dergesat: Riba sieht Te Beki und Pranuar/Anuluar, nie Barazuar oder Kthe", () => {
  const liste = [d("a"), d("b", { statusi: "derguar", derguarAt: T }), d("c", { statusi: "pranuar", pranuarAt: T })];
  const porosi = renderListe(liste, "porosi", "riba");
  assert.match(porosi, /<b>PB-a<\/b>/);
  assert.match(porosi, /data-veprim="derguar" data-kennung="a"[^>]*>Te Beki</);
  const derguar = renderListe(liste, "derguar", "riba");
  assert.match(derguar, /data-veprim="pranuar"/);
  assert.match(derguar, /data-veprim="anuluar"/);
  assert.doesNotMatch(derguar + renderListe(liste, "pranuar", "riba") + renderKartat(liste, "riba"), /data-veprim="(kthe|barazo|barazo-te-gjitha|paguaj-riben)"/);
  const heart = renderListe(liste, "pranuar", "heart") + renderKartat(liste, "heart");
  assert.match(heart, /data-veprim="barazo" data-kennung="c"/);
  assert.match(heart, /data-veprim="kthe" data-kennung="c"/);
  assert.match(heart, /data-veprim="barazo-te-gjitha"/);
  assert.match(heart, /data-veprim="paguaj-riben"/);
  assert.match(renderChips(liste, "derguar"), /dg-chip dg-chip--aktiv" data-veprim="chip" data-chip="derguar"/);
  // Die fuenf Karten mit ihren Betraegen.
  const kartat = renderKartat(liste, "riba");
  for (const titel of ["Pritje barazim", "Barazuar", "Pritje për Riben", "€ për Riben", "Paguar Ribës"]) assert.ok(kartat.includes(titel), titel);
  assert.ok(kartat.includes(euroSq(73)), "2 × (39 − 2,50)");
});

test("/dergesat wird ausgeliefert - im Betrieb, lokal, ohne Social-Shell, ohne Pixel, ohne Kommentare", () => {
  assert.match(lies("vercel.json"), /"source": "\/dergesat",\s*"destination": "\/apps\/lifeskin-dergesat\/index\.html"/);
  assert.match(lies("scripts/local-dev-server.mjs"), /path === "\/dergesat"\) return "\/apps\/lifeskin-dergesat\/index\.html"/);
  assert.match(lies("sw.js"), /'\/dergesat',/);
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /"apps\/lifeskin-dergesat",/);
  const seite = lies("apps/lifeskin-dergesat/index.html") + lies("apps/lifeskin-dergesat/dergesat.js") + lies("apps/lifeskin-dergesat/dergesat-pamja.js");
  assert.doesNotMatch(seite, /lifeskin-pixel|fbq\(|lifeskin-capi/i);
  assert.match(lies("apps/lifeskin-dergesat/index.html"), /noindex, nofollow/);
  // Jede Kennung, die die Seite anspricht, gibt es im HTML.
  const html = lies("apps/lifeskin-dergesat/index.html");
  for (const [, id] of lies("apps/lifeskin-dergesat/dergesat.js").matchAll(/\$\("([a-z-]+)"\)/g)) assert.match(html, new RegExp(`id="${id}"`), id);
});

test("Heart: jeder neue Knopf hat einen Behandler", () => {
  const events = lies("apps/mnyra-heart/heart-events.js");
  assert.match(events, /action === "dergesa"/);
  assert.match(events, /action === "lifeskin-bestellstatus"/);
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /dergesa\(was, knopf\) \{ return dergesatOps\.aktion\(was, knopf\); \}/);
  assert.match(heart, /setLifeskinBestellStatus\(id\)/);
  assert.match(heart, /dergesatOps\.nachVersand\(id, stand\)/);
});

test("/dergesat zeigt die Kurznamen: LF ACNE = BPO, LF MOISTUR = DAILY, mit Menge", async () => {
  const { produkteNeDergesa, emriShkurt } = await import("../shared/lifeskin-dergesat.js");
  assert.equal(emriShkurt("LF ACNE"), "BPO");
  assert.equal(emriShkurt("LF Moisture"), "DAILY");
  assert.equal(emriShkurt("LF PORE"), "LF PORE");
  assert.deepEqual(produkteNeDergesa(["LF ACNE", "LF MOISTUR", "2× LF ACNE"]), [{ sasia: 3, emri: "BPO" }, { sasia: 1, emri: "DAILY" }]);
  assert.deepEqual(produkteNeDergesa(["Acne Duo"]), [{ sasia: 1, emri: "BPO" }, { sasia: 1, emri: "DAILY" }]);
  const html = renderListe([d("a", { kodi: "LS-1", produkte: ["LF ACNE", "LF MOISTUR"] })], "porosi", "riba");
  assert.match(html, /<li><b>1<\/b> BPO<\/li>/);
  assert.match(html, /<li><b>1<\/b> DAILY<\/li>/);
  assert.match(html, /class="dg-kodi">#LS-1</);
  assert.doesNotMatch(html, /LF ACNE/);
});
