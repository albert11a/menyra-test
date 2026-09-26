/* global PerformanceObserver, addEventListener, scrollY, scrollTo */
// HEART, GEMESSEN - mit einigen tausend Faellen im lokalen Emulator.
//
// Gefragt am 25.09.: "Heart ist sehr langsam - Analyse anklicken dauert,
// dann springt es, wenn die Meldung kommt; Freigabe springt auch; die
// Zahlen aktualisieren sich nicht schnell." Dieses Skript misst genau das,
// auf einem Telefon-Fenster mit vierfach gebremster CPU (so rechnet ein
// Mittelklasse-Handy):
//
//   - wie lange der Reiter Lifeskin braucht, bis die Faelle dastehen,
//   - wie lange ein Fall zum Oeffnen braucht und ob dabei etwas springt
//     (Layout-Verschiebungen, Scrollstelle),
//   - wie oft Heart dabei alles neu aufbaut und wie lange es blockiert,
//   - wie schnell eine neue Sitzung in den Zahlen oben ankommt.
//
// Voraussetzung (alles lokal, nichts geht an die echte Datenbank):
//
//   node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --only firestore,auth --project mnyra-local
//   npm run emulators:seed
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/heart-emulator-seed.mjs
//   node scripts/local-dev-server.mjs
//   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node tests/lifeskin-trichter-pruefstand/lauf-heart.mjs

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const AUS = new URL("../../test-results/lifeskin-trichter/heart", import.meta.url).pathname;
const CPU = Number(process.env.CPU || 4);
mkdirSync(AUS, { recursive: true });
if (!/^(127\.0\.0\.1|localhost):\d+$/.test(process.env.FIRESTORE_EMULATOR_HOST || "")) {
  throw new Error("Nur gegen den lokalen Emulator: FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 setzen.");
}
if (!getApps().length) initializeApp({ projectId: "mnyra-local" });
const db = getFirestore();

const browser = await chromium.launch({ executablePath: process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium" });
const kontext = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  serviceWorkers: "block", locale: "de-DE"
});
// Sicherheitsnetz: Im Emulator-Modus gehen keine Anfragen an die echte
// Datenbank - falls doch, werden sie hier abgewiesen.
// (Nach dem Rechnernamen, nicht nach dem Pfad: Der Auth-Emulator traegt
// "identitytoolkit.googleapis.com" in seinem Pfad.)
await kontext.route((url) => /(^|\.)googleapis\.com$/.test(url.hostname), (r) => r.abort());
const seite = await kontext.newPage();
const fehler = [];
seite.on("pageerror", (e) => fehler.push(String(e.message).slice(0, 200)));
const cdp = await kontext.newCDPSession(seite);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU });

const ergebnis = { cpu: CPU, messungen: {} };
const mass = (name, wert) => { ergebnis.messungen[name] = wert; console.log(`  ${name}: ${typeof wert === "number" ? `${Math.round(wert)} ms` : JSON.stringify(wert)}`); };

// Messfuehler in der Seite: Neuaufbauten, DOM-Aenderungen, Verschiebungen,
// lange Aufgaben, Scrollstelle.
await kontext.addInitScript(() => {
  const m = { neuaufbau: 0, aenderungen: 0, verschiebung: 0, verschiebungen: [], lang: 0, langMs: 0, scroll: [] };
  globalThis.__mess = m;
  const start = () => {
    const wurzel = document.getElementById("heartApp");
    if (!wurzel) { requestAnimationFrame(start); return; }
    new MutationObserver((liste) => { m.neuaufbau += liste.length; }).observe(wurzel, { childList: true });
    new MutationObserver((liste) => { m.aenderungen += liste.length; }).observe(wurzel, { childList: true, subtree: true, attributes: true, characterData: true });
  };
  start();
  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        m.verschiebung += e.value;
        m.verschiebungen.push({ t: Math.round(e.startTime), wert: Number(e.value.toFixed(4)) });
      }
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) { m.lang += 1; m.langMs += Math.max(0, e.duration - 50); }
    }).observe({ type: "longtask", buffered: true });
  } catch { /* alter Browser */ }
  let zuletzt = 0;
  addEventListener("scroll", () => {
    const y = Math.round(scrollY);
    if (Math.abs(y - zuletzt) > 2) m.scroll.push({ t: Math.round(performance.now()), y });
    zuletzt = y;
  }, { passive: true });
});

// PROFIL=1: CPU-Profil je Schritt, die teuersten Funktionen (Eigenzeit).
const PROFIL = process.env.PROFIL === "1";
async function profilStart() { if (PROFIL) { await cdp.send("Profiler.enable"); await cdp.send("Profiler.start"); } }
async function profilEnde(name) {
  if (!PROFIL) return;
  const { profile } = await cdp.send("Profiler.stop");
  const zeit = new Map();
  const dauer = (profile.endTime - profile.startTime) / 1000;
  const proKnoten = new Map(profile.nodes.map((n) => [n.id, n]));
  const zaehler = new Map();
  for (const id of profile.samples) zaehler.set(id, (zaehler.get(id) || 0) + 1);
  const je = dauer / Math.max(1, profile.samples.length);
  for (const [id, n] of zaehler) {
    const k = proKnoten.get(id);
    const f = k.callFrame;
    const name = `${f.functionName || "(anonym)"} ${String(f.url).split("/").pop()}:${f.lineNumber + 1}`;
    zeit.set(name, (zeit.get(name) || 0) + n * je);
  }
  const top = [...zeit.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22);
  console.log(`  PROFIL ${name} (${Math.round(dauer)} ms):`);
  for (const [n, ms] of top) console.log(`     ${String(Math.round(ms)).padStart(6)} ms  ${n}`);
  writeFileSync(`${AUS}/profil-${name}.cpuprofile`, JSON.stringify(profile));
}

const messStand = () => seite.evaluate(() => JSON.parse(JSON.stringify(globalThis.__mess || {})));
const messNull = () => seite.evaluate(() => {
  const m = globalThis.__mess;
  Object.assign(m, { neuaufbau: 0, aenderungen: 0, verschiebung: 0, verschiebungen: [], lang: 0, langMs: 0, scroll: [] });
});
const bild = (name) => seite.screenshot({ path: `${AUS}/${name}.png` }).catch(() => {});

console.log(`\nHEART MIT ${CPU}x GEBREMSTER CPU · ${BASIS}`);

// 1) Anmelden und den Reiter Lifeskin oeffnen.
let ab = Date.now();
await seite.goto(`${BASIS}/heart?firebase-emulator=1#lifeskin`, { waitUntil: "domcontentloaded" });
await seite.waitForSelector("[data-heart-login] input[name=email]", { timeout: 60000 });
await seite.fill("[data-heart-login] input[name=email]", "heart.local@example.test");
await seite.fill("[data-heart-login] input[name=password]", "local-test-password");
ab = Date.now();
await profilStart();
await seite.click("[data-heart-login] button[type=submit], [data-heart-login] button");
await seite.waitForSelector('[data-action="lifeskin-sitzung"]', { timeout: 120000 });
mass("Anmelden → Faelle stehen da", Date.now() - ab);
await profilEnde("laden");
await seite.waitForTimeout(3000);
mass("Nach dem Laden: Stand", await messStand());
await bild("01_liste");

// 2) Ruhe: Was passiert in 10 Sekunden, in denen niemand etwas tut?
await messNull();
await seite.waitForTimeout(10000);
mass("10 s Ruhe (Neuaufbauten, Aenderungen, lange Aufgaben)", await messStand());

// 3) Einen Fall mit Fotos oeffnen.
const ziel = await seite.evaluate(() => {
  const zeilen = [...document.querySelectorAll('[data-action="lifeskin-sitzung"]')];
  // Ein Fall MIT Fotos: Die Zeile traegt ihre Anzahl auf dem Vorschaubild.
  const mitFoto = zeilen.find((z) => z.querySelector(".heart-lifeskin-fall__anzahl")) || zeilen[0];
  mitFoto?.scrollIntoView({ block: "center" });
  return mitFoto?.getAttribute("data-id") || "";
});
await seite.waitForTimeout(800);
await messNull();
await profilStart();
ab = Date.now();
await seite.tap(`[data-action="lifeskin-sitzung"][data-id="${ziel}"]`);
await seite.waitForSelector(".heart-lifeskin-detail", { timeout: 30000 });
mass("Tipp → Akte steht da", Date.now() - ab);
const fotosDa = await seite.waitForFunction(() => {
  const bilder = [...document.querySelectorAll(".heart-lifeskin-detail img.heart-lifeskin-foto")];
  return bilder.length && bilder.every((b) => b.complete && b.naturalWidth);
}, null, { timeout: 30000 }).then(() => Date.now() - ab).catch(() => null);
mass("Tipp → Fotos zu sehen", fotosDa);
await profilEnde("oeffnen");
await seite.waitForTimeout(4000);
mass("Oeffnen: Stand", await messStand());
await bild("02_akte");

// 4) Eine neue Sitzung kommt herein (jemand oeffnet gerade die Landing):
//    Wie schnell steht sie in den Zahlen?
await seite.tap('[data-action="lifeskin-sitzung-zu"]').catch(() => {});
await seite.waitForSelector('[data-action="lifeskin-sitzung"]', { timeout: 30000 });
await seite.evaluate(() => scrollTo(0, 0));
await seite.waitForTimeout(1500);
const zahlVorher = await seite.evaluate(() => (document.querySelector(".heart-kachel__wert, .heart-lifeskin-kachel__wert, [data-kachel] strong")?.textContent || "").trim());
await messNull();
// Ein eigener Zuhoerer in derselben Seite, auf derselben Datenbank: Er
// zeigt, wann Firestore die neue Sitzung WIRKLICH liefert - der Rest bis
// zur Kachel ist Heart.
await seite.evaluate(async () => {
  const { db } = await import("/shared/firebase-config.js");
  const fs = await import("/shared/vendor/firebase/11.0.0/firebase-firestore.js");
  globalThis.__geliefert = 0;
  fs.onSnapshot(fs.query(fs.collection(db, "lifeskin", "lifeskin", "sessions"),
    fs.where("updatedAt", ">=", new Date(Date.now() - 60000).toISOString())), (snap) => {
    if (snap.docs.some((d) => d.id.startsWith("live"))) globalThis.__geliefert ||= Date.now();
  });
});
await seite.waitForTimeout(1500);
await profilStart();
const neuId = `live${Date.now().toString(16)}`.padEnd(32, "0");
const jetzt = new Date().toISOString();
ab = Date.now();
await db.collection("lifeskin").doc("lifeskin").collection("sessions").doc(neuId).set({
  createdAt: jetzt, updatedAt: jetzt, step: "opened", code: "LS-LIVE1", device: { os: "android", app: "instagram", gesehen: true },
  source: { utmSource: "ig", utmCampaign: "akne-sep" }, timings: {}
});
const live = await seite.waitForFunction((vorher) => {
  const t = (document.querySelector(".heart-kachel__wert, .heart-lifeskin-kachel__wert, [data-kachel] strong")?.textContent || "").trim();
  return t && t !== vorher;
}, zahlVorher, { timeout: 30000 }).then(() => Date.now() - ab).catch(() => null);
mass(`Neue Sitzung → Kachel aendert sich (vorher "${zahlVorher}")`, live);
const geliefert = await seite.evaluate(() => globalThis.__geliefert || 0);
mass("Neue Sitzung → Firestore liefert sie aus (eigener Zuhoerer)", geliefert ? geliefert - ab : null);
await profilEnde("live");
await seite.waitForTimeout(2000);
mass("Live-Aenderung: Stand", await messStand());
await bild("03_live");

// 4b) DIE LIVE-REIHE RECHNET RICHTIG: Sechs Besucher an sechs Stellen,
//     einer von vor fuenf Minuten (zaehlt nicht mehr), ein eigener Test
//     (zaehlt nie). Danach geht einer - er muss aus der Reihe fallen.
const liveStand = () => seite.evaluate(() => {
  const lies = (id) => {
    const karte = document.getElementById(id);
    const text = (karte?.closest("details")?.querySelector(".heart-klapp__zahl")?.textContent || "").trim();
    const zahlen = {};
    for (const teil of text.split("·")) {
      const m = teil.trim().match(/^(\d+)\s+(.+)$/);
      if (m) zahlen[m[2].trim()] = Number(m[1]);
    }
    return zahlen;
  };
  return { analyse: lies("heart-live-analysen"), kauf: lies("heart-live-bestellungen") };
});
const vorher = await liveStand();
const sitzungen = db.collection("lifeskin").doc("lifeskin").collection("sessions");
const nun = Date.now();
const iso = (vor = 0) => new Date(nun - vor).toISOString();
const neu = {
  livea: { step: "opened" }, liveb: { step: "wahl" }, livec: { step: "camera" }, lived: { step: "numri" },
  livee: { step: "result" }, livef: { step: "opened", alt: 5 * 60 * 1000 },
  liveg: { step: "camera", test: true }, liveh: { step: "result", kasse: true }
};
for (const [id, d] of Object.entries(neu)) {
  await sitzungen.doc(`${id}${nun.toString(16)}`.padEnd(32, "0")).set({
    createdAt: iso(d.alt || 0), updatedAt: iso(d.alt || 0), step: d.step, code: `LS-${id}`, name: id,
    device: { os: "android", gesehen: true },
    source: { utmSource: "ig", utmCampaign: d.test ? "test" : "akne-sep" },
    ...(d.kasse ? { kasseGeoeffnet: true, timings: { live: "porosia" } } : { timings: {} })
  });
}
ab = Date.now();
const erwartet = { Landing: 1, "Mënyra": 1, Fotot: 1, Nummri: 1, Patient: 1 };
const angekommen = await seite.waitForFunction(({ vorher, erwartet }) => {
  const karte = document.getElementById("heart-live-analysen");
  const text = (karte?.closest("details")?.querySelector(".heart-klapp__zahl")?.textContent || "");
  const zahlen = {};
  for (const teil of text.split("·")) { const m = teil.trim().match(/^(\d+)\s+(.+)$/); if (m) zahlen[m[2].trim()] = Number(m[1]); }
  return Object.entries(erwartet).every(([k, v]) => (zahlen[k] || 0) >= (vorher[k] || 0) + v);
}, { vorher: vorher.analyse, erwartet }, { timeout: 30000 }).then(() => Date.now() - ab).catch(() => null);
mass("Live-Reihe: fuenf Besucher erscheinen an ihren Stellen", angekommen);
const kaufDa = await seite.waitForFunction((vorherKauf) => {
  const karte = document.getElementById("heart-live-bestellungen");
  const text = (karte?.closest("details")?.querySelector(".heart-klapp__zahl")?.textContent || "");
  const m = text.match(/(\d+)\s+N'shport/);
  return (m ? Number(m[1]) : 0) >= vorherKauf + 1;
}, vorher.kauf["N'shport"] || 0, { timeout: 30000 }).then(() => Date.now() - ab).catch(() => null);
mass("Live-Reihe: wer an der Kasse steht, erscheint im Kauf", kaufDa);
await seite.waitForTimeout(2500);
const danach = await liveStand();
const plus = (reihe, k) => (danach[reihe][k] || 0) - (vorher[reihe][k] || 0);
const pruefungen = [
  ["Landing +1 (der von vor 5 Min zaehlt nicht)", plus("analyse", "Landing") === 1],
  ["Mënyra +1", plus("analyse", "Mënyra") === 1],
  ["Fotot +1 (der eigene Test zaehlt nicht)", plus("analyse", "Fotot") === 1],
  ["Nummri +1", plus("analyse", "Nummri") === 1],
  ["Patient +1 (wer an der Kasse steht, steht nicht auch hier)", plus("analyse", "Patient") === 1],
  ["Kauf: N'shport +1", plus("kauf", "N'shport") === 1]
];
for (const [text, ok] of pruefungen) console.log(`  ${ok ? "✓" : "✗"} ${text}`);
ergebnis.live = { vorher, danach, pruefungen };
await bild("05_live_reihe");
// Einer geht: Seine letzte Aktivitaet liegt jetzt vier Minuten zurueck.
ab = Date.now();
await sitzungen.doc(`livea${nun.toString(16)}`.padEnd(32, "0")).update({ updatedAt: iso(4 * 60 * 1000) });
const weg = await seite.waitForFunction((vorherLanding) => {
  const karte = document.getElementById("heart-live-analysen");
  const text = (karte?.closest("details")?.querySelector(".heart-klapp__zahl")?.textContent || "");
  const m = text.match(/(\d+)\s+Landing/);
  return (m ? Number(m[1]) : 0) === vorherLanding;
}, vorher.analyse.Landing || 0, { timeout: 30000 }).then(() => Date.now() - ab).catch(() => null);
mass("Live-Reihe: wer geht, faellt heraus", weg);

// 5) Der zweite Start - so, wie Heart jeden Tag geoeffnet wird: Die Daten
//    liegen schon im Speicher des Geraets.
await messNull().catch(() => {});
ab = Date.now();
await seite.reload({ waitUntil: "domcontentloaded" });
await seite.waitForSelector('[data-action="lifeskin-sitzung"]', { timeout: 120000 }).catch(() => {});
mass("Zweiter Start → Faelle stehen da (aus dem Geraetespeicher)", Date.now() - ab);
await seite.waitForTimeout(3000);
await bild("04_zweiter_start");

ergebnis.fehler = fehler;
writeFileSync(`${AUS}/messung.json`, JSON.stringify(ergebnis, null, 2));
console.log(fehler.length ? `  JS-Fehler: ${fehler.join(" | ")}` : "  Keine JS-Fehler");
await browser.close();
process.exit(0);
