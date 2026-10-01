import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { metaAbgleichAngaben, metaAbgleichEinrichten } from "../shared/lifeskin-meta-abgleich.js";
const capi = createRequire(import.meta.url)("../functions/lifeskin-capi-payload.js");
const consent = (phone = "044111222", allowed = true) => ({ version: "meta-phone-v1", allowed, phone });
const session = (c) => ({ code: "LS-0210-ABCDE", phone: "044111222", phoneConsent: true,
  timings: { metaMatching: c }, order: { orderId: "LS-0210-ABCDE", total: 39 },
  findings: ["acne"], name: "Arta Berisha", address: { strasse: "Rruga B" } });
const hash = createHash("sha256").update("38344111222").digest("hex");

test("Telefon normalisiert internationale und lokale Kosovo-Formate, raet keine Fremdnummer", () => {
  for (const phone of ["044111222", "44 111 222", "+383 (44) 111-222", "00383 44 111222", "38344111222"])
    assert.equal(capi.telefonNormalisieren(phone), "38344111222");
  assert.equal(capi.telefonNormalisieren("+43 660 1234567"), "436601234567");
  for (const phone of ["", "044", "invalid", "+383+44111222", "111222333", "00044111222", "044111222 ext 1"])
    assert.equal(capi.telefonNormalisieren(phone), "", phone);
});

test("Lead und Purchase: nur der bekannte SHA-256-Hash nach expliziter separater Zustimmung", () => {
  for (const build of [capi.baueLead, capi.baueKauf]) {
    const payload = build(session(consent()));
    assert.deepEqual(payload.user_data.ph, [hash]);
    const json = JSON.stringify(payload);
    for (const secret of ["044111222", "38344111222", "Arta", "Berisha", "Rruga", "acne", "meta-phone-v1"])
      assert.ok(!json.includes(secret), secret);
  }
});

test("Kontaktzustimmung, alter Fall, falsche Version, andere Nummer und Widerruf geben keinen Hash frei", () => {
  for (const c of [undefined, consent("044111222", false), { ...consent(), allowed: "true" },
    { ...consent(), version: "unknown" }, consent("044999888"), consent("invalid")]) {
    assert.equal(capi.baueLead(session(c)).user_data.ph, undefined);
    assert.equal(capi.baueKauf(session(c)).user_data.ph, undefined);
  }
  const s = session(consent());
  s.order.metaMatching = consent("044111222", false);
  assert.equal(capi.baueKauf(s).user_data.ph, undefined, "nein in der Kasse geht vor alter Zustimmung");
  s.phone = "044999888";
  assert.equal(capi.baueLead(s).user_data.ph, undefined, "neue Nummer erbt Zustimmung nicht");
});

test("Checkbox ist freiwillig, standardmaessig aus und schreibt eine nummerngebundene Zustimmung", () => {
  const elements = new Map();
  const anchor = { after: (label) => { for (const c of label.children) if (c.id) elements.set(c.id, c); } };
  elements.set("ls-telfeld", { closest: () => anchor });
  const doc = { documentElement: { lang: "sq" }, getElementById: id => elements.get(id),
    createElement: tag => ({ tag, style: {}, children: [], append(...c) { this.children.push(...c); } }) };
  metaAbgleichEinrichten(doc);
  const c = elements.get("ls-telfeld-meta-abgleich");
  assert.equal(c.type, "checkbox");
  assert.notEqual(c.checked, true);
  assert.notEqual(c.required, true);
  assert.deepEqual(metaAbgleichAngaben(doc, "ls-telfeld", "044111222"), consent("", false));
  c.checked = true;
  assert.deepEqual(metaAbgleichAngaben(doc, "ls-telfeld", "044111222"), consent());
  metaAbgleichEinrichten(doc);
  assert.equal(elements.get("ls-telfeld-meta-abgleich"), c, "kein doppelter Haken");
});

test("Trichter speichert Zustimmung vor Lead-Anstoss, ohne andere timings zu ersetzen", async () => {
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const calls = [];
  const s = new Sitzung({ speicher: null, fetchFn: async (url, o = {}) => {
    calls.push({ url: String(url), body: o.body ? JSON.parse(o.body) : null });
    return { ok: true, status: 200 };
  } });
  await s.ergaenze({ phone: "044111222", phoneConsent: true, timings: { metaMatching: consent() } });
  const write = calls.find(c => c.url.includes("timings.metaMatching"));
  assert.ok(write, "gezielte Maske fuer Zustimmung");
  assert.equal(write.body.fields.phone.stringValue, "044111222", "Nummer und Zustimmung atomar");
  assert.equal(write.body.fields.timings.mapValue.fields.metaMatching.mapValue.fields.allowed.booleanValue, true);
});

// Die neue Therapiekasse nutzt auf Wunsch die Nummer aus der Analyse.
test("Kasse mit gespeicherter Nummer: nur die frische Kaufzustimmung gibt den Hash frei", () => {
  const s = session(undefined);
  s.order.metaMatching = { ...consent(""), storedPhone: true };
  assert.deepEqual(capi.baueKauf(s).user_data.ph, [hash]);
  assert.equal(capi.baueLead(s).user_data.ph, undefined);
  s.order.metaMatching.allowed = false;
  assert.equal(capi.baueKauf(s).user_data.ph, undefined);
});
