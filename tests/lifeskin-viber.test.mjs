// KEIN WHATSAPP? DANN VIBER (24.09.)
//
// Der Nummer-Schirm bleibt, wie er ist. Ein kleiner Link klappt ein Feld
// fuer Viber auf. Eine der beiden Nummern reicht; ohne WhatsApp steht die
// Viber-Nummer auch in "phone", und Heart schreibt dann ueber Viber.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lies = (p) => fs.readFileSync(p, "utf8");
const APP = lies("apps/lifeskin/lifeskin-app.js");
const REGELN = lies("firestore.rules");

test("beide Aufbauten tragen Link und zugeklapptes Feld", () => {
  for (const datei of ["apps/lifeskin-landing/index.html", "apps/lifeskin-trichter/index.html"]) {
    const html = lies(datei);
    assert.match(html, /id="ls-viberlink" data-text="viberLink"/, `${datei}: Link fehlt`);
    assert.match(html, /<div class="ls-viberbox" id="ls-viberbox" hidden>/, `${datei}: Feld nicht zugeklappt`);
    assert.ok(html.indexOf('id="ls-telfeld"') < html.indexOf('id="ls-viberlink"'), "Link steht nicht unter der Nummer");
  }
});

test("die Texte stehen auf Albanisch", async () => {
  const { OBERFLAECHE } = await import("../apps/lifeskin/lifeskin-content.js");
  assert.equal(OBERFLAECHE.viberLink.sq, "Nuk keni WhatsApp?");
  assert.equal(OBERFLAECHE.telKnopfViber.sq, "Merrni analizën në Viber");
  assert.ok(OBERFLAECHE.viberTitel.sq && OBERFLAECHE.viberInfo.sq && OBERFLAECHE.telInfoViber.sq);
});

test("die Viber-Nummer geht in einem eigenen Schreibvorgang - die Nummer davor bleibt", () => {
  const i = APP.indexOf("  #telWeiter() {");
  const weiter = APP.slice(i, APP.indexOf("\n  }\n", i));
  const phone = weiter.indexOf("this.sitzung.ergaenze({ phone: geprueft.nummer, phoneConsent: true });");
  const viber = weiter.indexOf("if (geprueft.viber) this.sitzung.ergaenze({ viber: geprueft.viber });");
  assert.ok(phone > 0 && viber > phone, "Viber steht nicht getrennt nach der Nummer");
});

test("die Regel kennt das Feld", () => {
  assert.match(REGELN, /"phone", "phoneConsent", "phoneConsentMarketing",[\s\S]{0,200}"viber",/);
  assert.match(REGELN, /\(!\("viber" in data\) \|\| \(data\.viber is string && data\.viber\.size\(\) <= 40\)\)/);
});

test("Heart: nur Viber -> Knoepfe kopieren und oeffnen Viber, sonst WhatsApp", async () => {
  const { renderSitzungDetail, nurViber } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const basis = { id: "v1", typ: "scan", photos: [], createdAt: new Date().toISOString(), name: "arta" };
  assert.equal(nurViber({ phone: "+38345987654", viber: "045 987 654" }), true);
  assert.equal(nurViber({ phone: "+38344123456", viber: "+38345987654" }), false);
  assert.equal(nurViber({ phone: "+38344123456" }), false);
  const vb = renderSitzungDetail({ ...basis, phone: "+38345987654", viber: "+38345987654" }, {}, "ready", [], { status: "wartet" });
  assert.equal((vb.match(/data-action="lifeskin-viber"/g) || []).length, 5);
  assert.match(vb, /data-nummer="38345987654"/);
  assert.doesNotMatch(vb, /wa\.me\//);
  assert.match(vb, /Telefon · Viber/);
  const wa = renderSitzungDetail({ ...basis, phone: "+38344123456" }, {}, "ready", [], { status: "wartet" });
  assert.match(wa, /wa\.me\/38344123456/);
  assert.doesNotMatch(wa, /lifeskin-viber/);
});
