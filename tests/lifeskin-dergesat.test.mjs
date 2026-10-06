// DERGESAT (/dergesat, Versand ueber Posta Beki - Auftrag 05.10.).
// Rechnung, erlaubte Schritte, Heart-Chips und die Seite selbst. Die
// Regeln gegen den Emulator: tests/rules/lifeskin-dergesat.test.mjs.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DERGESA, STATUS_CHIPS, KALIMET_RIBA, dergesaLesen, llogarit, ndryshimi, statusiNeHeart, hyrja,
  renditPerChip, numeroPerChip, mundTeKthehet, euroSq, llogaritDepon, kthimNeDepo, prituriKthim
} from "../shared/lifeskin-dergesat.js";
import { abgleichSchritte, produkteTePorosise, renderPostaBeki, renderDergesaChip, statusVonSitzung } from "../apps/mnyra-heart/heart-lifeskin-dergesat-render.js";
import { renderBestellungen } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderListe, renderKartat, renderChips, renderDetajet, KARTAT_ID } from "../apps/lifeskin-dergesat/dergesat-pamja.js";

const lies = (pfad) => readFileSync(new URL(`../${pfad}`, import.meta.url), "utf8");
const T = "2026-10-05T10:00:00.000Z";
const d = (kennung, felder = {}) => dergesaLesen({ postaBeki: `PB-${kennung}`, cmimi: 39, statusi: "porosi", createdAt: T, ...felder }, kennung);

test("die fuenf Chips in der gewuenschten Reihenfolge", () => {
  assert.deepEqual(STATUS_CHIPS.map((c) => c.label), ["Porosiat", "Gati", "Dërguar", "Pranuar", "Anuluar"]);
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
  assert.deepEqual(ll.pritjeBarazim.lista.map((x) => x.kennung).sort(), ["a", "b", "c"]);
  assert.equal(ll.pritjeBarazim.gati.shuma, 36.5);
  assert.deepEqual(ll.pritjeBarazim.gati.kennungen, ["c"]);
  // Pritje për Riben: nur Dërguar. € për Riben: Pranuar, noch nicht bezahlt.
  assert.deepEqual({ numri: ll.pritjeRiba.numri, shuma: ll.pritjeRiba.shuma }, { numri: 2, shuma: 4 });
  assert.deepEqual(ll.pritjeRiba.lista.map((x) => x.kennung), ["a", "b"]);
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
  assert.deepEqual({ ...ll.perRiba, lista: undefined }, { numri: 3, shuma: 6, kennungen: ["b", "c", "e"], lista: undefined });
  assert.deepEqual(ll.barazuar.lista.map((x) => x.kennung), ["c", "a", "b"], "die juengste Abrechnung zuerst");
  assert.deepEqual(ll.paguarRiba.grupet, [{ at: z2, numri: 1, shuma: 2 }]);
});

test("Riba geht nur vorwaerts: Gati, Te Beki, dann Pranuar oder Anuluar - mit genau den erlaubten Feldern", () => {
  assert.deepEqual(KALIMET_RIBA, { porosi: ["gati"], gati: ["derguar"], derguar: ["pranuar", "anuluar"], pranuar: [], anuluar: [] });
  assert.deepEqual(ndryshimi(d("a"), "gati", { roli: "riba", jetzt: T }), { statusi: "gati", updatedAt: T, nga: "riba", gatiAt: T });
  assert.equal(ndryshimi(d("a"), "derguar", { roli: "riba", jetzt: T }), null, "ohne Gati nicht zur Beki");
  const f = ndryshimi(d("a", { statusi: "gati", gatiAt: T }), "derguar", { roli: "riba", jetzt: T });
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
  assert.deepEqual(ndryshimi(derguar, "gati", { roli: "heart", jetzt: T }), { statusi: "gati", updatedAt: T, nga: "heart", derguarAt: "" });
  assert.deepEqual(ndryshimi(d("a", { statusi: "gati", gatiAt: T }), "porosi", { roli: "heart", jetzt: T }), { statusi: "porosi", updatedAt: T, nga: "heart", gatiAt: "" });
  // "Als versendet melden" in Heart: von Porosi oder Gati direkt auf Dërguar.
  assert.equal(ndryshimi(d("a"), "derguar", { roli: "heart", jetzt: T }).derguarAt, T);
  assert.equal(ndryshimi(d("a", { statusi: "gati" }), "pranuar", { roli: "heart", jetzt: T }).statusi, "pranuar");
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
  assert.deepEqual(numeroPerChip(liste), { porosi: 2, gati: 0, derguar: 2, pranuar: 0, anuluar: 0 });
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

test("Heart, Karte Bestellungen: fuenf Stand-Chips mit Zahl, jede Bestellung in genau einem, Chip unter der Bestellung", () => {
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
  assert.match(porosi, /Gati <span>0<\/span>/);
  assert.match(porosi, /heart-shopchip-pages--fuenf/, "alle fuenf auf einer Seite");
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

test("/dergesat: Riba sieht Gati, Te Beki und Pranuar/Anuluar, nie Barazuar oder Kthe", () => {
  const liste = [d("a"), d("g", { statusi: "gati", gatiAt: T }), d("b", { statusi: "derguar", derguarAt: T }), d("c", { statusi: "pranuar", pranuarAt: T })];
  const porosi = renderListe(liste, "porosi", "riba");
  assert.match(porosi, /<b>PB-a<\/b>/);
  assert.match(porosi, /data-veprim="gati" data-kennung="a"[^>]*>Gati</);
  assert.doesNotMatch(porosi, /Te Beki/);
  const gati = renderListe(liste, "gati", "riba");
  assert.match(gati, /data-veprim="derguar" data-kennung="g"[^>]*>Te Beki</);
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
  // Die sechs Karten mit ihren Betraegen - jede laesst sich antippen.
  const kartat = renderKartat(liste, "riba");
  for (const id of KARTAT_ID) assert.match(kartat, new RegExp(`data-veprim="hap-karten" data-karta="${id}"`), id);
  for (const titel of ["Ndepo", "Pritje barazim", "Barazuar", "Pritje për Riben", "€ për Riben", "Paguar Ribës"]) assert.ok(kartat.includes(titel), titel);
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
  assert.match(html, /<li><i>1×<\/i> BPO<\/li>/);
  assert.match(html, /<li><i>1×<\/i> DAILY<\/li>/);
  assert.match(html, /class="dg-kodi">#LS-1</);
  assert.doesNotMatch(html, /LF ACNE/);
});

test("Anuluar, die unterwegs war: Pritje për kthim, bis 'E kthyem në depo' - dann Të gatshme", () => {
  const unterwegs = d("x", { statusi: "anuluar", derguarAt: T, anuluarAt: T, produkte: ["LF ACNE", "LF MOISTUR"] });
  const nieRaus = d("y", { statusi: "anuluar", anuluarAt: T, produkte: ["LF ACNE"] });
  assert.equal(prituriKthim(unterwegs), true);
  assert.equal(prituriKthim(nieRaus), false, "ohne Versand muss nichts zurueck");
  assert.deepEqual(kthimNeDepo(unterwegs, { roli: "riba", jetzt: T }), { kthyerAt: T, updatedAt: T, nga: "riba" });
  assert.equal(kthimNeDepo(nieRaus), null);
  assert.equal(kthimNeDepo({ ...unterwegs, kthyerAt: T }), null, "nur einmal");

  const html = renderListe([unterwegs, nieRaus], "anuluar", "riba");
  assert.match(html, /data-veprim="kthe-depo" data-kennung="x"[^>]*>E kthyem në depo</);
  assert.doesNotMatch(html, /data-veprim="kthe-depo" data-kennung="y"/);
  assert.match(html, /Pritje për kthim/);
  assert.match(renderListe([{ ...unterwegs, kthyerAt: T }], "anuluar", "riba"), /Në depo ✓/);

  const vorher = llogaritDepon([unterwegs, nieRaus]);
  assert.deepEqual(vorher.pritjeKthim.produkte, [{ emri: "BPO", sasia: 1 }, { emri: "DAILY", sasia: 1 }]);
  assert.equal(vorher.gatshme.numri, 0);
  const nachher = llogaritDepon([{ ...unterwegs, kthyerAt: T }, nieRaus]);
  assert.equal(nachher.pritjeKthim.numri, 0);
  assert.deepEqual(nachher.gatshme.produkte, [{ emri: "BPO", sasia: 1 }, { emri: "DAILY", sasia: 1 }]);
});

test("Ndepo: Shishet, Stikerat und Krem aus den Produktkosten minus was abgegangen ist", () => {
  const lenda = {
    shisheStueck: 100, stikerStueck: 90, mbushja: 30,
    kreme: [{ name: "Acne", menge: 1.5, einheit: "l", produkt: "lf-acne" }, { name: "Daily", menge: 900, einheit: "ml", produkt: "lf-moistur" }]
  };
  const liste = [
    d("p", { produkte: ["LF ACNE", "LF MOISTUR"] }),                         // Porosi: noch nichts gepackt
    d("g", { statusi: "gati", produkte: ["Acne Duo"] }),                     // 1 BPO + 1 DAILY
    d("s", { statusi: "derguar", derguarAt: T, produkte: ["2× LF ACNE"] }),  // 2 BPO
    d("k", { statusi: "anuluar", derguarAt: T, anuluarAt: T, produkte: ["LF MOISTUR"] }), // unterwegs zurueck: 1 DAILY
    d("r", { statusi: "anuluar", derguarAt: T, anuluarAt: T, kthyerAt: T, produkte: ["LF ACNE"] }) // zurueck: fertig
  ];
  const depo = llogaritDepon(liste, lenda);
  assert.deepEqual(depo.lenda.shishe, { blere: 100, dalur: 5, mbetur: 95 });
  assert.deepEqual(depo.lenda.stiker, { blere: 90, dalur: 5, mbetur: 85 });
  const bpo = depo.lenda.produkte.find((x) => x.emri === "BPO");
  const daily = depo.lenda.produkte.find((x) => x.emri === "DAILY");
  // 1500 ml / 30 = 50 Fuellungen, 3 BPO abgegangen.
  assert.deepEqual([bpo.mbushje, bpo.dalur, bpo.kremPer, bpo.mundTeBehen], [50, 3, 47, 47]);
  // 900 ml / 30 = 30, 2 DAILY abgegangen (Gati + Anuluar unterwegs).
  assert.deepEqual([daily.mbushje, daily.dalur, daily.kremPer, daily.mundTeBehen], [30, 2, 28, 28]);
  // Oben auf der Karte: was gemacht werden kann + was fertig zurueck ist.
  assert.deepEqual(depo.permbledhje.map((x) => [x.emri, x.sasia]), [["BPO", 48], ["DAILY", 28]]);
  // Ohne Produktkosten (Riba): nur was aus /dergesat kommt.
  assert.equal(llogaritDepon(liste, null).lenda, null);
});

test("Antippen einer Karte: Liste mit Datum und Uhrzeit, fuer Riba ohne Lagerzahlen", () => {
  const lenda = { shisheStueck: 10, stikerStueck: 10, kreme: [{ menge: 300, einheit: "ml", produkt: "lf-acne" }] };
  const liste = [
    d("a", { statusi: "derguar", gatiAt: T, derguarAt: "2026-10-05T14:22:00.000Z", produkte: ["LF ACNE"], kodi: "LS-1" }),
    d("b", { statusi: "pranuar", derguarAt: T, pranuarAt: T, barazuarAt: "2026-10-06T18:00:00.000Z" }),
    d("x", { statusi: "anuluar", derguarAt: T, anuluarAt: T, produkte: ["LF ACNE"] })
  ];
  const pritje = renderDetajet("pritje-riba", liste, "riba");
  assert.match(pritje, /role="dialog"/);
  assert.match(pritje, /<b>PB-a<\/b>/);
  assert.match(pritje, /#LS-1/);
  assert.match(pritje, /<span>Dërguar<\/span><time datetime="2026-10-05T14:22:00.000Z">\d\d\.10\.2026 · \d\d:22<\/time>/);
  assert.match(pritje, /<span>Gati<\/span><time/);
  assert.match(renderDetajet("barazuar", liste, "riba"), /class="dg-grup"[\s\S]*PB-b/);
  const depoRiba = renderDetajet("ndepo", liste, "riba", "", lenda);
  assert.doesNotMatch(depoRiba, /Shishet|Stikerat/, "Riba sieht keine Produktkosten");
  assert.match(depoRiba, /data-veprim="kthe-depo" data-kennung="x"/);
  const depoHeart = renderDetajet("ndepo", liste, "heart", "", lenda);
  assert.match(depoHeart, /<th scope="row">Shishet<\/th><td>10<\/td><td>2<\/td><td>8<\/td>/);
  assert.equal(renderDetajet("gibts-nicht", liste, "heart"), "");
});

test("Regeln: Riba geht Porosi -> Gati -> Dërguar und bringt eine Anuluar zurueck in die Depo", () => {
  const rules = lies("firestore.rules");
  assert.match(rules, /alt\.statusi == "porosi" && neu\.statusi == "gati"/);
  assert.match(rules, /alt\.statusi == "gati" && neu\.statusi == "derguar"/);
  assert.doesNotMatch(rules, /alt\.statusi == "porosi" && neu\.statusi == "derguar"/);
  assert.match(rules, /keys\.hasOnly\(\["kthyerAt", "updatedAt", "nga"\]\)/);
});
