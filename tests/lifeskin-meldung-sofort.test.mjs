// NEUE ANALYSE, NEUE BESTELLUNG - SOFORT AUFS TELEFON.
//
// api/lifeskin-meldung.js gegen einen nachgebauten Google-Server: Zugang,
// Firestore, FCM. Geprueft wird, dass eine echte, frische Bestellung genau
// EINMAL gemeldet wird, eine alte oder ein Test nie, und dass die Seiten
// die Meldung erst NACH dem Schreiben anstossen.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";

import handler, { meldungenFuer } from "../api/lifeskin-meldung.js";
import { meldungAnstossen } from "../shared/lifeskin-melden.js";

const { privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
process.env.MNYRA_FIREBASE_ADMIN_KEY = JSON.stringify({
  client_email: "test@menyra-c0e68.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" })
});

const str = (v) => ({ stringValue: v });

function googleNachbau({ sitzung }) {
  const angelegt = new Set();
  const gesendet = [];
  globalThis.fetch = async (url, optionen = {}) => {
    const u = String(url);
    const json = (daten, status = 200) => ({ ok: status < 300, status, json: async () => daten });
    if (u.startsWith("https://oauth2.googleapis.com/token")) return json({ access_token: "tok", expires_in: 3600 });
    if (u.includes("/sessions/")) return sitzung ? json({ fields: sitzung }) : json({}, 404);
    if (u.includes("/superadmins")) return json({ documents: [] });
    if (u.includes(":runQuery")) return json([{ document: { name: "projects/p/databases/(default)/documents/users/u/devices/d1", fields: { token: str("geraet-1"), enabled: { booleanValue: true } } } }]);
    if (u.includes("/notifications?documentId=")) {
      const id = decodeURIComponent(u.split("documentId=")[1]);
      if (angelegt.has(id)) return json({}, 409);
      angelegt.add(id);
      return json({});
    }
    if (u.startsWith("https://fcm.googleapis.com/")) { gesendet.push(JSON.parse(optionen.body).message); return json({}); }
    throw new Error(`unerwartet: ${u}`);
  };
  return { angelegt, gesendet };
}

async function aufrufen(koerper, methode = "POST") {
  const res = { statusCode: 0, kopf: {}, text: "", setHeader(k, v) { this.kopf[k] = v; }, end(t) { this.text = t; } };
  await handler({ method: methode, body: koerper }, res);
  return { status: res.statusCode, daten: JSON.parse(res.text || "{}") };
}

const frisch = () => new Date(Date.now() - 60000).toISOString();

test("eine frische Bestellung wird gemeldet - genau einmal", async () => {
  const g = googleNachbau({ sitzung: { step: str("ordered"), name: str("Arta"), updatedAt: str(frisch()) } });
  const erst = await aufrufen({ id: "sitzung123" });
  assert.equal(erst.status, 200);
  // Analyse und Bestellung - beide stehen noch aus.
  assert.equal(erst.daten.gemeldet, 2);
  assert.deepEqual(g.gesendet.map((m) => m.notification.body).sort(), ["Neue Bestellung, Arta", "Sie haben eine neue Analyse, Arta"]);
  assert.equal(g.gesendet[0].token, "geraet-1");
  // Zweiter Aufruf (Doppelklick, Waechter danach): nichts mehr.
  const zweit = await aufrufen({ id: "sitzung123" });
  assert.equal(zweit.daten.gemeldet, 0);
  assert.equal(g.gesendet.length, 2);
});

test("eine alte Sitzung, eine ohne Abschluss und eine unbekannte melden nichts", async () => {
  let g = googleNachbau({ sitzung: { step: str("ordered"), updatedAt: str(new Date(Date.now() - 3 * 3600000).toISOString()) } });
  assert.equal((await aufrufen({ id: "altealte1" })).daten.gemeldet, 0);
  g = googleNachbau({ sitzung: { step: str("fotogati"), updatedAt: str(frisch()) } });
  assert.equal((await aufrufen({ id: "mitten12" })).daten.gemeldet, 0);
  g = googleNachbau({ sitzung: null });
  assert.equal((await aufrufen({ id: "gibtsnicht" })).daten.gemeldet, 0);
  assert.equal(g.gesendet.length, 0);
});

test("eine Test-Bestellung (stiller Modus) weckt kein Telefon", () => {
  const faellig = meldungenFuer({ step: "ordered", updatedAt: frisch(), order: { still: true } });
  assert.deepEqual(faellig.map((v) => v.type), ["lifeskin_analyse"]);
});

test("Unfug wird abgewiesen, ohne Schluessel passiert nichts", async () => {
  googleNachbau({ sitzung: null });
  assert.equal((await aufrufen({ id: "../users/x" })).status, 400);
  assert.equal((await aufrufen({ id: "sitzung123" }, "GET")).status, 405);
  const k = process.env.MNYRA_FIREBASE_ADMIN_KEY;
  delete process.env.MNYRA_FIREBASE_ADMIN_KEY;
  assert.equal((await aufrufen({ id: "sitzung123" })).status, 503);
  process.env.MNYRA_FIREBASE_ADMIN_KEY = k;
});

test("die Seite stoesst an: gleiche Herkunft, keepalive, nur die Kennung; im stillen Modus nichts", () => {
  const aufrufe = [];
  const fetchFn = (url, o) => { aufrufe.push({ url, o }); return Promise.resolve({ ok: true }); };
  globalThis.location = { protocol: "https:", origin: "https://mnyra.com" };
  meldungAnstossen("abc123", fetchFn);
  assert.equal(aufrufe[0].url, "https://mnyra.com/api/lifeskin-meldung");
  assert.equal(aufrufe[0].o.keepalive, true);
  assert.deepEqual(JSON.parse(aufrufe[0].o.body), { id: "abc123" });
  globalThis.__mnyraStill = true;
  meldungAnstossen("abc123", fetchFn);
  assert.equal(aufrufe.length, 1);
  delete globalThis.__mnyraStill;
  delete globalThis.location;
  // Ohne Browser (Tests, Server) passiert gar nichts.
  meldungAnstossen("abc123", fetchFn);
  assert.equal(aufrufe.length, 1);
});

test("jede Seite, die 'result' oder 'ordered' schreibt, stoesst die Meldung erst danach an", () => {
  const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
  assert.match(lies("apps/lifeskin/lifeskin-session.js"), /MELDE_SCHRITTE = new Set\("result ordered"\.split\(" "\)\)/);
  assert.match(lies("apps/lifeskin/lifeskin-session.js"), /geschrieben\.then\(\(antwort\) => \{ if \(antwort\?\.ok\) meldungAnstossen/);
  assert.match(lies("apps/lifeskin-astra/astra-daten.js"), /daten\?\.step === "ordered"[\s\S]{0,200}if \(ok\) meldungAnstossen/);
  assert.match(lies("apps/lifeskin-bericht/bericht.js"), /if \(gespeichert\?\.ok\) meldungAnstossen/);
});
