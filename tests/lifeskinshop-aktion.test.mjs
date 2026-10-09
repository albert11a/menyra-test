// LIFESKIN SHOP - ZBRITJE (08.10., seit 09.10. aus Heart): echter Normalpreis
// 2 x 29 = 58 EUR, Aktionspreis, Ende und Lager in config/shopAktion.
// Voreinstellung (Inhaber 09.10.): 25 EUR bis 19:00, 6 Sets.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("Voreinstellung: 25 EUR bis 09.10. 19:00 Kosovo, 6 Sets; Normalpreis 58 EUR", async () => {
  const { AKTION_STANDARD, AKTION_DOK, aktionNormalisieren, aktionLaeuft, aktionNormalpreis } = await import("../shared/lifeskin-aktion.js");
  assert.equal(AKTION_DOK, "shopAktion");
  const a = aktionNormalisieren(AKTION_STANDARD);
  assert.deepEqual([a.aktiv, a.cmimi, a.sete], [true, 25, 6]);
  assert.equal(Date.parse(a.bis), Date.parse("2026-10-09T19:00:00+02:00"));
  assert.equal(aktionNormalpreis(), 58);
  assert.equal(aktionLaeuft(a, Date.parse("2026-10-09T18:59:59+02:00")), true);
  assert.equal(aktionLaeuft(a, Date.parse("2026-10-09T19:00:00+02:00")), false);
  assert.equal(aktionLaeuft({ ...a, aktiv: false }, Date.parse("2026-10-09T12:00:00+02:00")), false);
});

test("Normalisieren: Unsinn wird aus, leeres Lager = keine Lagerzeile", async () => {
  const { aktionNormalisieren } = await import("../shared/lifeskin-aktion.js");
  assert.deepEqual(aktionNormalisieren(null), { aktiv: false, cmimi: 0, bis: "", sete: null, ab: "" });
  const a = aktionNormalisieren({ aktiv: true, cmimi: "22", bis: "kaputt", sete: "", ab: "" });
  assert.deepEqual([a.cmimi, a.bis, a.sete], [22, "", null]);
  assert.equal(aktionNormalisieren({ aktiv: "ja", cmimi: 0, sete: -1 }).aktiv, false);
  assert.equal(aktionNormalisieren({ cmimi: 5000 }).cmimi, 0);
  assert.equal(aktionNormalisieren({ sete: "3" }).sete, 3);
});

test("Kosovo-Zeit: Feld <-> ISO, auch im Winter", async () => {
  const { kosovoFeld, kosovoZuIso } = await import("../shared/lifeskin-aktion.js");
  assert.equal(kosovoZuIso("2026-10-09T19:00"), "2026-10-09T17:00:00.000Z");
  assert.equal(kosovoZuIso("2026-12-01T19:00"), "2026-12-01T18:00:00.000Z");
  assert.equal(kosovoFeld("2026-10-09T17:00:00.000Z"), "2026-10-09T19:00");
  assert.equal(kosovoZuIso("19:00"), "");
});

test("Texte: sot / nesër / Datum, 23:59 heisst 24:00", async () => {
  const { aktionTexte } = await import("../shared/lifeskin-aktion.js");
  const jetzt = Date.parse("2026-10-09T10:00:00+02:00");
  const a = { aktiv: true, cmimi: 25, bis: "2026-10-09T17:00:00.000Z" };
  assert.deepEqual(aktionTexte(a, jetzt), { plakete: "VETËM SOT", ende: "Mbaron sot në ora 19:00", cmimi: 25, vecmas: 58, kursen: 33, normal: "Çmimi normal: 2 produkte × 29 € = 58 €" });
  assert.equal(aktionTexte({ ...a, bis: "2026-10-10T21:59:00.000Z" }, jetzt).ende, "Mbaron nesër në ora 24:00");
  const spaeter = aktionTexte({ ...a, bis: "2026-10-12T16:00:00.000Z" }, jetzt);
  assert.deepEqual([spaeter.plakete, spaeter.ende], ["OFERTË", "Mbaron më 12.10. në ora 18:00"]);
  assert.equal(aktionTexte({ ...a, cmimi: 60 }, jetzt).kursen, 0);
});

test("Restzeit und Lagertext", async () => {
  const { restzeit, lagerText } = await import("../apps/lifeskin-shop/aktion.js");
  assert.equal(restzeit(10_000_000, 0), "02:46:40");
  assert.equal(restzeit(0, 5), "00:00:00");
  assert.match(lagerText(6).html, /Vetëm edhe <b>6 sete<\/b> në stok/);
  assert.match(lagerText(1).html, /Vetëm edhe <b>1 set<\/b> në stok/);
  assert.deepEqual(lagerText(0), { leer: true, html: "Shitur – setet e radhës vijnë së shpejti" });
});

test("Lager zaehlt nur echte Laden-Bestellungen seit dem Speichern", async () => {
  const { istLagerBestellung, restSete, aktionAusFeldern } = await import("../api/lifeskin-lager.js");
  const s = (o) => ({ order: { mapValue: { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === "boolean" ? { booleanValue: v } : { stringValue: v }])) } } });
  const ab = "2026-10-09T08:00:00.000Z";
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-09T09:00:00.000Z" }), ab), true);
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-09T07:00:00.000Z" }), ab), false, "vor dem Speichern");
  assert.equal(istLagerBestellung(s({ burimi: "lifeskinshop", createdAt: "2026-10-09T09:00:00.000Z", still: true }), ab), false, "stiller Modus");
  assert.equal(istLagerBestellung(s({ burimi: "befund", createdAt: "2026-10-09T09:00:00.000Z" }), ab), false, "nicht aus dem Laden");
  const test = { ...s({ burimi: "lifeskinshop", createdAt: "2026-10-09T09:00:00.000Z" }), source: { mapValue: { fields: { utmCampaign: { stringValue: "test" } } } } };
  assert.equal(istLagerBestellung(test, ab), false, "Testbestellung");
  assert.deepEqual([restSete(0, 6), restSete(5, 6), restSete(6, 6), restSete(9, 6)], [6, 1, 0, 0]);
  const a = aktionAusFeldern({ aktiv: { booleanValue: true }, cmimi: { integerValue: "25" }, bis: { stringValue: "2026-10-09T17:00:00.000Z" }, sete: { integerValue: "6" }, ab: { stringValue: ab } });
  assert.deepEqual([a.aktiv, a.cmimi, a.sete, a.ab], [true, 25, 6, ab]);
  assert.equal(aktionAusFeldern({ sete: { nullValue: null } }).sete, null);
});

function fakeDok() {
  const els = {};
  const el = (id, extra = {}) => (els[id] = { id, hidden: false, textContent: "", innerHTML: "", dataset: {}, attrs: new Set(),
    toggleAttribute(n, an) { an ? this.attrs.add(n) : this.attrs.delete(n); }, ...extra });
  el("aktion", { dataset: { aktionBis: "2026-10-09T19:00:00+02:00" } });
  for (const id of ["aktion-plakete", "aktion-ende", "aktion-nga", "aktion-vecmas", "aktion-cmimi", "aktion-kursen", "aktion-normal", "aktion-mbetur", "aktion-stok-tekst"]) el(id);
  el("aktion-stok", { hidden: true });
  const knopf = { disabled: false, dataset: {} };
  return { els, knopf, getElementById: (id) => els[id], querySelectorAll: () => [knopf], addEventListener() {} };
}

const AKTION = { aktiv: true, cmimi: 22, bis: "2026-10-12T16:00:00.000Z", sete: 6, ab: "2026-10-09T08:00:00.000Z" };

test("Block zeigt Preis und Ende aus Heart; bei 0 Sets Shitur und gesperrt; am Ende weg", async () => {
  const { aktionStarten } = await import("../apps/lifeskin-shop/aktion.js");
  const dok = fakeDok();
  let jetzt = Date.parse("2026-10-12T15:00:00Z");
  let geendet = 0;
  const holen = async () => ({ ok: true, json: async () => ({ ok: true, sete: 0 }) });
  const a = aktionStarten({ dok, aktion: AKTION, jetzt: () => jetzt, holen, beiEnde: () => { geendet += 1; } });
  assert.equal(dok.els["aktion-plakete"].textContent, "VETËM SOT");
  assert.equal(dok.els["aktion-ende"].textContent, "Mbaron sot në ora 18:00");
  assert.equal(dok.els["aktion-cmimi"].textContent, "22 €");
  assert.equal(dok.els["aktion-vecmas"].textContent, "58 €");
  assert.equal(dok.els["aktion-kursen"].textContent, "−36 €");
  await a.lager();
  assert.equal(dok.els["aktion-mbetur"].textContent, "01:00:00");
  assert.equal(dok.els["aktion-stok"].hidden, false);
  assert.ok(dok.els["aktion-stok"].attrs.has("data-leer"));
  assert.equal(dok.knopf.disabled, true);
  jetzt = Date.parse("2026-10-12T16:00:00Z");
  a.ticken();
  assert.equal(dok.els.aktion.hidden, true);
  assert.equal(dok.knopf.disabled, false, "nach der Aktion wieder kaufbar");
  assert.equal(geendet, 1, "Laden zeigt wieder den Set-Preis");
  a.stopp();
});

test("ohne Lager keine Lagerzeile; aus oder abgelaufen gar kein Block", async () => {
  const { aktionStarten } = await import("../apps/lifeskin-shop/aktion.js");
  const dok = fakeDok();
  let gefragt = 0;
  const a = aktionStarten({ dok, aktion: { ...AKTION, sete: null }, jetzt: () => Date.parse("2026-10-12T10:00:00Z"), holen: async () => { gefragt += 1; return { ok: false }; } });
  await a.lager();
  assert.equal(gefragt, 0);
  assert.equal(dok.els["aktion-stok"].hidden, true);
  assert.equal(dok.knopf.disabled, false);
  a.stopp();
  const aus = fakeDok();
  assert.equal(aktionStarten({ dok: aus, aktion: { ...AKTION, aktiv: false }, jetzt: () => Date.parse("2026-10-12T10:00:00Z") }), null);
  assert.equal(aus.els.aktion.hidden, true);
  const spaet = fakeDok();
  assert.equal(aktionStarten({ dok: spaet, aktion: AKTION, jetzt: () => Date.parse("2026-10-13T08:00:00Z") }), null);
  assert.equal(spaet.els.aktion.hidden, true);
});

test("Laden: Aktionspreis nur solange die Zbritje laeuft", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { mitAktion } = await import("../apps/lifeskin-shop/shop.js");
  const sets = [{ id: "acne", produkte: ["lf-acne", "lf-moistur"], cmimi: 39 }];
  assert.equal(mitAktion(sets, AKTION, Date.parse("2026-10-12T10:00:00Z"))[0].cmimi, 22);
  assert.equal(mitAktion(sets, AKTION, Date.parse("2026-10-12T16:00:00Z"))[0].cmimi, 39);
  assert.equal(mitAktion(sets, { ...AKTION, aktiv: false }, Date.parse("2026-10-12T10:00:00Z"))[0].cmimi, 39);
  const js = lies("apps/lifeskin-shop/shop.js");
  assert.match(js, /holeDok\(AKTION_DOK, this\.holen\)/);
  assert.match(js, /beiEnde: \(\) => \{ void this\.#setetUebernehmen\(this\.angebotSetDok\); \}/);
});

test("Heart: Block 'Zbritje im Shop' mit an/aus, Preis, Ende, Lager", async () => {
  const { renderShopAktion } = await import("../apps/mnyra-heart/heart-lifeskin-shopsets.js");
  const html = renderShopAktion({ shopAktion: { ...AKTION, standard: false } }, Date.parse("2026-10-12T10:00:00Z"));
  assert.match(html, /Zbritje im Shop/);
  assert.match(html, /data-aktionfeld-an="aktiv" checked/);
  assert.match(html, /data-aktionfeld="cmimi"[^>]*value="22"/);
  assert.match(html, /data-aktionfeld="bisFeld" type="datetime-local" value="2026-10-12T18:00"/);
  assert.match(html, /data-aktionfeld="sete"[^>]*value="6"/);
  assert.match(html, /data-action="lifeskin-aktion-speichern"/);
  assert.match(html, /Läuft bis 12\.10\. 18:00/);
  const aus = renderShopAktion({ shopAktion: { ...AKTION, aktiv: false } }, Date.parse("2026-10-12T10:00:00Z"));
  assert.match(aus, /heart-klapp__zahl">aus</);
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /"lifeskin-aktion-speichern"/);
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /export async function speichereShopAktion\(aktion\)/);
  assert.match(adapter, /\.filter\(\(d\) => d\.id !== AKTION_DOK\)/, "nicht in die Konfiguration einruehren");
});

test("HTML: Voreinstellung bis 19:00, abgelaufen sofort weg, kein Pixel im Aktionscode", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  assert.match(html, /data-aktion-bis="2026-10-09T19:00:00\+02:00"/);
  assert.match(html, /<span id="aktion-ende">Mbaron sot në ora 19:00<\/span>/);
  assert.match(html, /Çmimi normal: 2 produkte × 29 € = 58 €/);
  assert.match(html, /<del id="aktion-vecmas">58 €<\/del>/);
  assert.match(html, /id="aktion-stok" hidden/);
  assert.match(html, /if\(!\(Date\.now\(\)<Date\.parse\(b\.getAttribute\("data-aktion-bis"\)\)\)\)b\.hidden=true/);
  for (const datei of ["apps/lifeskin-shop/aktion.js", "api/lifeskin-lager.js", "shared/lifeskin-aktion.js"]) {
    assert.doesNotMatch(lies(datei), /fbq\(|lifeskin-pixel|capi/i);
  }
});

test("Kasse: Zbritje mit Normalpreis und Ende, Acne Duo mit Set-Bild (Inhaber 09.10.)", () => {
  const js = lies("apps/lifeskin-shop/shop.js");
  assert.match(js, /const zbritje = n === 2 && !istChatKorb\(this\.korb\) && aktionLaeuft\(this\.aktion\) && aktionNormalpreis\(\) > summe\(this\.korb\);/);
  assert.match(js, /oferta\.textContent = zbritje \? `Oferta: \$\{aktionTexte\(this\.aktion\)\.ende\.replace\(\/\^M\/, "m"\)\}` : "";/);
  assert.match(js, /const titel = istChatKorb\(this\.korb\) \? "Oferta juaj nga chat-i" : duo \? "Acne Duo" :/);
  assert.match(js, /<img class="kasa-set__set" src="\$\{e\(setBild\)\}"/);
});
