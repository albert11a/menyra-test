import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const capi = createRequire(import.meta.url)("../functions/lifeskin-capi-payload.js");
const hash = createHash("sha256").update("38344111222").digest("hex");

test("Telefon normalisiert internationale und lokale Kosovo-Formate, raet keine Fremdnummer", () => {
  for (const phone of ["044111222", "44 111 222", "+383 (44) 111-222", "00383 44 111222", "38344111222"])
    assert.equal(capi.telefonNormalisieren(phone), "38344111222");
  assert.equal(capi.telefonNormalisieren("+43 660 1234567"), "436601234567");
  // 09.10.: Schraegstriche, wie im Kosovo ueblich, und die Inlandsnull nach
  // der Laendervorwahl - vorher weg bzw. als "383044..." falsch gehasht.
  for (const phone of ["044/111/222", "044/111-222", "+383 (0)44 111 222", "383 044 111 222", "00383 044 111 222"])
    assert.equal(capi.telefonNormalisieren(phone), "38344111222", phone);
  assert.equal(capi.telefonNormalisieren("+49 (0)176 12345678"), "4917612345678");
  assert.equal(capi.telefonNormalisieren("+41 0 79 123 45 67"), "41791234567");
  // Auslaendische Nummern ohne Vorwahl bleiben draussen: das Land ist nicht zu erkennen.
  for (const phone of ["0176 12345678", "079 123 45 67", "069 123 4567", "044 111 222 / 049 111 222"])
    assert.equal(capi.telefonNormalisieren(phone), "", phone);
  for (const phone of ["", "044", "invalid", "+383+44111222", "111222333", "00044111222", "044111222 ext 1"])
    assert.equal(capi.telefonNormalisieren(phone), "", phone);
});

test("Lead und Purchase bekommen denselben bekannten Hash aus der gespeicherten Nummer, ohne UI-Marke", () => {
  const s = { code: "LS-0210-ABCDE", phone: "044111222", name: "Arta Berisha", findings: ["acne"],
    address: { strasse: "Rruga B" }, order: { orderId: "LS-0210-ABCDE", total: 39 } };
  for (const build of [capi.baueLead, capi.baueKauf]) {
    const payload = build(s);
    assert.deepEqual(payload.user_data.ph, [hash]);
    for (const secret of ["044111222", "38344111222", "Arta", "Berisha", "Rruga", "acne"])
      assert.ok(!JSON.stringify(payload).includes(secret), secret);
  }
});

test("Fehlende oder unbrauchbare Nummer: kein erfundener Hash, bestehende Browserdaten bleiben", () => {
  for (const phone of [undefined, "", "044", "ungültig", 38344111222]) {
    const s = { phone, order: { fbp: "fb.1.2.3", orderId: "LS-X" } };
    assert.deepEqual(capi.baueKauf(s).user_data, { fbp: "fb.1.2.3" });
    assert.equal(capi.baueLead(s).user_data.ph, undefined);
  }
  const phone = "+43 660 1234567";
  assert.deepEqual(capi.kundenDaten({ phone }), {
    ph: [createHash("sha256").update("436601234567").digest("hex")]
  });
});

test("Hash stammt aus serverseitiger Sitzung, nicht aus einem mitgegebenen ph-Wert", () => {
  assert.deepEqual(capi.kundenDaten({ phone: "044111222", ph: "attacker", order: { ph: "attacker" } }), { ph: [hash] });
  assert.equal(capi.baueKauf({ phone: "044111222", order: { orderId: "LS-X", total: 39 } }).event_id, "LS-X");
});
