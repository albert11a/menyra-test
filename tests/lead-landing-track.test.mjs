import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import handler from "../api/landing-track.js";

// Was hier ankommt, kommt aus dem Browser eines Fremden. Die Funktion schreibt
// mit den Rechten des Dienstkontos, also an den Firestore-Regeln vorbei -
// deshalb darf nur durch, was die Aufzeichnung wirklich braucht. Diese Tests
// halten fest, was sie annimmt und was sie wegwirft.

// Ein Schluessel nur fuer den Test. Er zeigt auf nichts: Weder das Holen des
// Zugangsworts noch Firestore werden hier wirklich aufgerufen.
const { privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" }
});

const TEST_ACCOUNT = JSON.stringify({
  client_email: "probe@example.iam.gserviceaccount.com",
  private_key: privateKey,
  token_uri: "https://oauth.test/token"
});

function fakeRes() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    end() { return this; }
  };
}

// Faengt alles ab, was nach draussen ginge, und merkt sich, was geschrieben
// werden sollte.
function fakeNetwork() {
  const writes = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const address = String(url);
    if (address.includes("oauth")) {
      return { ok: true, json: async () => ({ access_token: "test-token", expires_in: 3600 }) };
    }
    if (address.includes("publicRoutes")) {
      return { ok: true, json: async () => ({ fields: { restaurantId: { stringValue: "lokal-1" } } }) };
    }
    if (init && init.method === "PATCH") {
      writes.push({ url: address, body: JSON.parse(init.body) });
      return { ok: true, json: async () => ({}) };
    }
    // Das Lesen vor dem Schreiben: Die Sitzung gibt es noch nicht.
    return { ok: false, status: 404, json: async () => ({}) };
  };
  return {
    writes,
    restore() { globalThis.fetch = realFetch; }
  };
}

async function post(payload, { account = TEST_ACCOUNT } = {}) {
  const before = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (account === null) delete process.env.FIREBASE_SERVICE_ACCOUNT;
  else process.env.FIREBASE_SERVICE_ACCOUNT = account;

  const net = fakeNetwork();
  const res = fakeRes();
  try {
    await handler({ method: "POST", body: JSON.stringify(payload) }, res);
  } finally {
    net.restore();
    if (before === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT;
    else process.env.FIREBASE_SERVICE_ACCOUNT = before;
  }
  return { res, writes: net.writes };
}

function geschrieben(writes) {
  assert.equal(writes.length, 1, "es wurde nicht genau einmal geschrieben");
  return writes[0].body.fields;
}

test("eine vollstaendige Sitzung wird geschrieben", async () => {
  const { res, writes } = await post({
    sessionId: "abc-123",
    slug: "bro-pizza",
    steps: { hyrje: 1200, "profil-0": 800, "pamja-1": 640 },
    answers: { q1: "po", q2: "jo", q3: "po" },
    outcome: "yes",
    totalMs: 2640
  });

  assert.equal(res.statusCode, 200);
  const fields = geschrieben(writes);
  assert.deepEqual(Object.keys(fields.steps.mapValue.fields).sort(), ["hyrje", "pamja-1", "profil-0"]);
  assert.equal(fields.answers.mapValue.fields.q2.stringValue, "jo");
  assert.equal(fields.outcome.stringValue, "yes");
  assert.equal(fields.totalMs.integerValue, "2640");
  assert.equal(fields.stepCount.integerValue, "3");
});

test("nur bekannte Formen kommen durch", async () => {
  const { writes } = await post({
    sessionId: "abc-123",
    slug: "bro-pizza",
    steps: { gut: 100, GROSS: 1, "mit leer": 2, "ueml*ut": 3 },
    answers: { q1: "vielleicht", "q2!": "po", q3: "jo" },
    outcome: "hack",
    totalMs: -5
  });

  const fields = geschrieben(writes);
  assert.deepEqual(Object.keys(fields.steps.mapValue.fields), ["gut"], "ein Schluessel kam durch, der nicht durfte");
  assert.deepEqual(Object.keys(fields.answers.mapValue.fields), ["q3"], "eine Antwort kam durch, die nicht durfte");
  assert.equal(fields.outcome.stringValue, "", "ein unbekanntes Ergebnis wurde uebernommen");
  assert.equal(fields.totalMs.integerValue, "0", "eine negative Zeit wurde uebernommen");
});

test("eine unsinnig lange Zeit wird gedeckelt", async () => {
  const { writes } = await post({
    sessionId: "abc-123",
    slug: "bro-pizza",
    steps: { hyrje: 999999999 },
    totalMs: 999999999
  });
  const sechsStunden = 6 * 60 * 60 * 1000;
  const fields = geschrieben(writes);
  assert.equal(Number(fields.steps.mapValue.fields.hyrje.integerValue), sechsStunden);
  assert.equal(Number(fields.totalMs.integerValue), sechsStunden);
});

test("ohne saubere Sitzungskennung wird nichts geschrieben", async () => {
  for (const sessionId of ["", "../../andere", "mit leer", "a".repeat(80) + "!"]) {
    const { res, writes } = await post({ sessionId, slug: "bro-pizza", steps: {} });
    assert.equal(res.statusCode, 400, `"${sessionId}" wurde angenommen`);
    assert.equal(writes.length, 0);
  }
});

test("ohne Zugang wird nichts geschrieben, aber sauber geantwortet", async () => {
  const { res, writes } = await post({ sessionId: "abc-123", slug: "bro-pizza", steps: {} }, { account: null });
  assert.equal(res.statusCode, 503);
  assert.equal(writes.length, 0);
});

test("nur POST", async () => {
  const res = fakeRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 405);
});

test("beim ersten Mal wird der Startzeitpunkt gesetzt, spaeter nicht mehr", async () => {
  const { writes } = await post({ sessionId: "abc-123", slug: "bro-pizza", steps: { hyrje: 1 } });
  const fields = geschrieben(writes);
  assert.ok(fields.startedAt, "der Startzeitpunkt fehlt beim ersten Mal");

  // Jetzt gibt es die Sitzung schon - der Startzeitpunkt darf nicht neu
  // gesetzt werden, sonst saehe eine alte Sitzung aus wie eine von eben.
  const before = process.env.FIREBASE_SERVICE_ACCOUNT;
  process.env.FIREBASE_SERVICE_ACCOUNT = TEST_ACCOUNT;
  const realFetch = globalThis.fetch;
  const spaeter = [];
  globalThis.fetch = async (url, init) => {
    const address = String(url);
    if (address.includes("oauth")) return { ok: true, json: async () => ({ access_token: "t", expires_in: 3600 }) };
    if (address.includes("publicRoutes")) return { ok: true, json: async () => ({ fields: { restaurantId: { stringValue: "lokal-1" } } }) };
    if (init && init.method === "PATCH") { spaeter.push(JSON.parse(init.body)); return { ok: true, json: async () => ({}) }; }
    return { ok: true, json: async () => ({ fields: { startedAt: { stringValue: "2020-01-01T00:00:00.000Z" } } }) };
  };
  const res = fakeRes();
  try {
    await handler({ method: "POST", body: JSON.stringify({ sessionId: "abc-123", slug: "bro-pizza", steps: { hyrje: 2 } }) }, res);
  } finally {
    globalThis.fetch = realFetch;
    if (before === undefined) delete process.env.FIREBASE_SERVICE_ACCOUNT;
    else process.env.FIREBASE_SERVICE_ACCOUNT = before;
  }
  assert.equal(spaeter.length, 1);
  assert.ok(!spaeter[0].fields.startedAt, "der Startzeitpunkt wurde noch einmal gesetzt");
});
