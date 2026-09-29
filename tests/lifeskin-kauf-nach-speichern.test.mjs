// DIE KAUFWEGE NACH DER PRUEFUNG VOM 29.09.
//
// Pixel-Aenderung erlaubt von Albert am 29.09.2026:
//   1 Kauf erst nach dem Speichern melden
//   2 Schritt beim zweiten Versuch neu schreiben
//   3 User-Agent und Seite fuer die Conversions API vorbereiten
//   4 nach dem Kauf keine AddToCart/InitiateCheckout mehr
// Dazu, ohne Pixel: Der Laden schreibt seinen Live-Stand (Korb, Kasse,
// Anschrift), damit Heart ihn dort zeigt, wo er gerade ist.
//
// Gemessen im Pruefstand (docs/lifeskin-kaufwege-pruefung-2026-09-29.md):
// Mit einem Serverfehler beim Bestellen sah der Kunde "Porosia nuk u
// dërgua", Meta hatte trotzdem ein Purchase. Und der zweite, gelungene
// Versuch schrieb kein step "ordered" mehr - die Conversions API und die
// Meldung an Dr. Gashi blieben stumm.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { browserAngaben } from "../apps/lifeskin/lifeskin-pixel.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (pfad) => readFileSync(join(wurzel, pfad), "utf8");
const require = createRequire(import.meta.url);
const capi = require("../functions/lifeskin-capi-payload.js");

// Ein Netz, das jede Anfrage mitschreibt und nach `antworten` beantwortet.
function netz(antworten = () => ({ ok: true, status: 200 })) {
  const anfragen = [];
  const fetchFn = async (url, init = {}) => {
    const maske = [...String(url).matchAll(/updateMask\.fieldPaths=([^&]+)/g)].map((m) => decodeURIComponent(m[1]));
    const anfrage = { url: String(url), methode: init.method, maske, body: init.body ? JSON.parse(init.body) : null };
    anfragen.push(anfrage);
    return antworten(anfrage, anfragen.length);
  };
  return { anfragen, fetchFn };
}

function speicherNachbau() {
  const werte = new Map();
  return { getItem: (k) => (werte.has(k) ? werte.get(k) : null), setItem: (k, v) => werte.set(k, String(v)) };
}

const sitzungsAnfragen = (anfragen) => anfragen.filter((a) => a.url.includes("/sessions/"));

// ---------- 1. Der Kauf geht erst nach dem Speichern an Meta ----------

test("der Kauf geht erst an Meta, wenn Firestore die Bestellung angenommen hat", async () => {
  const reihe = [];
  let auf;
  const tor = new Promise((r) => { auf = r; });
  const s = new Sitzung({
    speicher: null,
    fetchFn: async () => {
      reihe.push("anfrage");
      await tor;
      reihe.push("antwort");
      return { ok: true, status: 200 };
    },
    beiSchritt: (name, zusatz) => reihe.push(`pixel:${name}:${zusatz?.order?.orderId}`)
  });
  const bestellt = s.schritt("ordered", { order: { total: 39, orderId: "LS-2909-ABCDE" } });
  await new Promise((r) => setImmediate(r));
  assert.ok(!reihe.some((e) => e.startsWith("pixel:")), "Purchase ging hinaus, bevor der Server geantwortet hat");
  auf();
  assert.equal((await bestellt)?.ok, true);
  assert.deepEqual(reihe, ["anfrage", "antwort", "pixel:ordered:LS-2909-ABCDE"]);
});

test("jeder andere Schritt meldet weiter vor dem Schreiben", () => {
  // Dort ist das richtig: Die Seite wechselt oft gleich danach (Warteseite),
  // und eine Meldung, die auf den Server wartet, ginge verloren.
  const gesehen = [];
  const s = new Sitzung({ speicher: null, fetchFn: async () => ({ ok: true, status: 200 }), beiSchritt: (n) => gesehen.push(n) });
  s.schritt("named");
  s.schritt("result");
  assert.deepEqual(gesehen, ["named", "result"]);
});

// ---------- 2. Der zweite Versuch nach einem Fehler ----------

test("scheitert das Speichern, meldet und schreibt der zweite Versuch wie der erste", async () => {
  globalThis.location = { protocol: "https:", origin: "https://mnyra.com" };
  try {
    let kaputt = true;
    const { anfragen, fetchFn } = netz((a) => (a.url.includes("/sessions/") && kaputt
      ? { ok: false, status: 503 } : { ok: true, status: 200 }));
    const pixel = [];
    const speicher = speicherNachbau();
    const s = new Sitzung({ speicher, fetchFn, beiSchritt: (n, z) => pixel.push([n, z?.order?.orderId]) });
    await s.starte({ dokument: null });
    const bestellung = { order: { total: 39, orderId: s.code } };

    const erster = await s.schritt("ordered", bestellung);
    assert.notEqual(erster?.ok, true);
    assert.deepEqual(pixel, [], "Purchase fuer eine Bestellung, die nicht gespeichert ist");
    assert.equal(s.stand.step, "opened", "Der Kauf gilt als erreicht, obwohl er nicht gespeichert ist");
    assert.equal(JSON.parse(speicher.getItem("lifeskin:sitzung")).step, "opened");

    kaputt = false;
    const zweiter = await s.schritt("ordered", bestellung);
    assert.equal(zweiter?.ok, true);
    const letzte = sitzungsAnfragen(anfragen).at(-1);
    assert.ok(letzte.maske.includes("step"), "Der zweite Versuch schreibt keinen Schritt - die Conversions API bleibt stumm");
    assert.equal(letzte.body.fields.step.stringValue, "ordered");
    assert.deepEqual(pixel, [["ordered", s.code]]);
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(anfragen.filter((a) => a.url.endsWith("/api/lifeskin-meldung")).length, 1,
      "Die Bestellung wurde Dr. Gashi nicht gemeldet");

    // Ist der Kauf gespeichert, meldet ein weiterer Aufruf nichts mehr.
    await s.schritt("ordered", bestellung);
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(pixel.length, 1);
    assert.equal(anfragen.filter((a) => a.url.endsWith("/api/lifeskin-meldung")).length, 1);
  } finally {
    delete globalThis.location;
  }
});

test("die Bestellung bekommt die Antwort auf ihr eigenes Teil, nicht die des Nachbarn", async () => {
  // Firestore weist das Gesammelte ab; einzeln kommt das Teil daneben
  // durch, die Bestellung nicht. Vorher bekamen alle die letzte gute
  // Antwort - "bestellt" auf dem Schirm und ein Purchase bei Meta.
  let auf;
  const tor = new Promise((r) => { auf = r; });
  const pixel = [];
  const { fetchFn } = netz(async (a, nr) => {
    if (nr === 1) await tor;
    const nein = a.maske.includes("neuesFeld") || a.maske.includes("order");
    return { ok: !nein, status: nein ? 403 : 200 };
  });
  const s = new Sitzung({ speicher: null, fetchFn, beiSchritt: (n) => pixel.push(n) });
  s.starte({ dokument: null });
  await new Promise((r) => setImmediate(r));
  s.ergaenze({ neuesFeld: true });
  const bestellt = s.schritt("ordered", { order: { total: 39, orderId: "LS-1" } });
  const nachbar = s.ergaenze({ phone: "+38344111222" });
  auf();
  assert.notEqual((await bestellt)?.ok, true, "Die Bestellung gilt als gespeichert, weil das Teil danach durchkam");
  assert.equal((await nachbar)?.ok, true);
  assert.deepEqual(pixel, []);
});

// ---------- 3. User-Agent und Seite fuer die Conversions API ----------

test("der Browser gibt User-Agent und Seite mit - die Seite ohne Fallkennung", () => {
  assert.deepEqual(
    browserAngaben({ nav: { userAgent: " Mozilla/5.0 (iPhone) " }, ort: { href: "https://www.mnyra.com/terapia/0a1b2c3d4e?weg=lifeskinshop" } }),
    { ua: "Mozilla/5.0 (iPhone)", seite: "https://www.mnyra.com/terapia" });
  assert.deepEqual(browserAngaben({ nav: {}, ort: { href: "https://www.mnyra.com/lifeskinshop#setet" } }),
    { seite: "https://www.mnyra.com/lifeskinshop" });
  assert.deepEqual(browserAngaben({ nav: {}, ort: { href: "https://www.mnyra.com/" } }), { seite: "https://www.mnyra.com" });
  assert.deepEqual(browserAngaben({ nav: null, ort: null }), {});
  assert.equal(browserAngaben({ nav: { userAgent: "x".repeat(900) }, ort: null }).ua.length, 400);
});

test("alle Bestellungen geben User-Agent und Seite mit", () => {
  const stellen = {
    "apps/lifeskin-shop/shop.js": 1,
    "apps/lifeskin-landing/shop.js": 1,
    "apps/lifeskin-verkauf/terapia.js": 2,
    "apps/lifeskin-astra/astra.js": 1
  };
  for (const [pfad, anzahl] of Object.entries(stellen)) {
    const treffer = lies(pfad).match(/\.\.\.pixelKennungen\(\),\s*\/\/[^\n]*\n\s*\.\.\.browserAngaben\(\)/g) || [];
    assert.equal(treffer.length, anzahl, pfad);
  }
});

test("die Conversions API sendet User-Agent und Seite - nur unsere eigene", () => {
  const sitzung = {
    step: "ordered",
    order: {
      total: 39, orderId: "LS-2909-ABCDE", createdAt: new Date().toISOString(), fbp: "fb.1.1.2",
      ua: "Mozilla/5.0 (iPhone)", seite: "https://www.mnyra.com/lifeskinshop"
    }
  };
  const nutzlast = capi.baueKauf(sitzung);
  assert.equal(nutzlast.user_data.client_user_agent, "Mozilla/5.0 (iPhone)");
  assert.equal(nutzlast.user_data.fbp, "fb.1.1.2");
  assert.equal(nutzlast.event_source_url, "https://www.mnyra.com/lifeskinshop");
  assert.equal(nutzlast.event_id, "LS-2909-ABCDE");
  // Jeder kann eine Sitzung schreiben: Eine fremde Seite, eine Seite mit
  // Fallkennung oder gar keine wird zur festen Adresse.
  for (const fremd of ["https://boese.example/lifeskin", "https://www.mnyra.com/terapia/0a1b2c", "javascript:alert(1)", "", 42]) {
    assert.equal(capi.baueKauf({ ...sitzung, order: { ...sitzung.order, seite: fremd } }).event_source_url,
      "https://mnyra.com/lifeskin", String(fremd));
  }
  // Ohne User-Agent (aeltere Bestellung) kein leeres Feld.
  const alt = capi.baueKauf({ step: "ordered", order: { total: 39, orderId: "X" } });
  assert.ok(!("client_user_agent" in alt.user_data));
  assert.equal(alt.event_source_url, "https://mnyra.com/lifeskin");
});

// ---------- 4. Nach dem Kauf keine AddToCart/InitiateCheckout mehr ----------

test("nach dem Kauf melden Ergebnis- und Warteseite kein AddToCart/InitiateCheckout mehr", () => {
  for (const pfad of ["apps/lifeskin-verkauf/terapia.js", "apps/lifeskin-astra/astra.js"]) {
    const quelle = lies(pfad);
    assert.match(quelle, /if \(feld === "sahPreis" && !this\.bestellt\) this\.pixel\.meldeKorb\(this\.preis\);/, pfad);
    assert.match(quelle, /else if \(feld === "kasseGeoeffnet" && !this\.bestellt\) this\.pixel\.meldeKasse\(this\.preis\);/, pfad);
  }
});

// ---------- Live: der Laden schreibt, wo der Besucher gerade ist ----------

test("der Live-Stand des Ladens: nur timings.live, und nur wenn er sich aendert", async () => {
  const { anfragen, fetchFn } = netz();
  const s = new Sitzung({ speicher: null, fetchFn });
  const liveWerte = () => anfragen.map((a) => a.body?.fields?.timings?.mapValue?.fields?.live?.stringValue).filter(Boolean);
  await s.liveMerken("offer");
  await s.liveMerken("offer");
  assert.deepEqual(liveWerte(), ["offer"]);
  assert.deepEqual(anfragen[0].maske, ["updatedAt", "timings.live"], "Die anderen Zeiten muessen stehen bleiben");
  assert.equal(anfragen[0].maske.includes("step"), false, "Der Laden zaehlt keinen Schritt");
  // Die Analyse angetippt, dann wieder in den Korb: wieder geschrieben.
  await s.schritt("wahl");
  await s.liveMerken("offer");
  await s.liveMerken("address");
  assert.deepEqual(liveWerte(), ["offer", "wahl", "offer", "address"]);
});

test("scheitert der Live-Stand, versucht es der naechste Aufruf wieder", async () => {
  let kaputt = true;
  const { anfragen, fetchFn } = netz(() => (kaputt ? { ok: false, status: 503 } : { ok: true, status: 200 }));
  const s = new Sitzung({ speicher: null, fetchFn });
  await s.liveMerken("offer");
  kaputt = false;
  await s.liveMerken("offer");
  assert.equal(anfragen.length, 2);
});

test("beide Laeden schreiben den Live-Stand bei Korb, Kasse und Anschrift - ohne Pixel", () => {
  for (const pfad of ["apps/lifeskin-shop/shop.js", "apps/lifeskin-landing/shop.js"]) {
    const quelle = lies(pfad);
    assert.match(quelle, /#live\(wert\) \{\s*try \{ this\.trichterFn\(\)\?\.sitzung\?\.liveMerken\?\.\(wert\); \}/, pfad);
    assert.match(quelle, /this\.#merke\(\{ imKorb: true \}, "imKorb"\);\s*this\.#live\("offer"\);/, `${pfad}: Korb`);
    assert.match(quelle, /"kasseGeoeffnet"\);\s*this\.#live\("offer"\);/, `${pfad}: Kasse`);
    assert.match(quelle, /this\.#merke\(\{ adresseBegonnen: true \}, "adresseBegonnen"\);\s*this\.#live\("address"\);/, `${pfad}: Anschrift`);
  }
});
