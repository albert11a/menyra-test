/* global Navigator, DOMException, innerHeight, innerWidth */
// ALLE WEGE VON A BIS Z - im Browser, nicht nur im Code.
//
// Gefragt am 25.09.: "jeden Weg nochmal pruefen, von A bis Z, und echt
// testen". Dieses Skript klickt jeden Weg, den ein Kunde auf /lifeskin
// nehmen kann, in einem Telefon-Fenster von vorn bis hinten durch - bis
// zur Warteseite und weiter bis zur Therapieseite - und schreibt auf, wo
// jemand haengen bliebe.
//
// WAS ES IST UND WAS NICHT:
//
//   - Chromium in Telefongroesse, mit Beruehrung, mit der Kennung des
//     jeweiligen Browsers (Chrome, Instagram, Facebook, Safari). Die
//     Engine bleibt Chromium: Was NUR WebKit auf dem iPhone tut, sieht
//     dieser Lauf nicht.
//   - Die Kamera ist eine Datei mit einem Gesicht (kamera-attrappe.mjs).
//     Das echte Gesichtsnetz laeuft darauf. Ein Standbild dreht den Kopf
//     nicht - der Ring schliesst sich damit nicht von selbst; gemessen
//     wird der Weg, den ein Mensch nimmt, der es nicht schafft.
//   - Firestore wird VOLLSTAENDIG abgefangen und hier im Speicher
//     nachgespielt: Was der Trichter schreibt, liest die Warteseite
//     wieder. Nichts erreicht die echte Datenbank - und falls doch eine
//     Anfrage am Abfangen vorbeiginge, zeigt der Name auf 127.0.0.1 und
//     scheitert.
//
// Starten:
//
//   node scripts/local-dev-server.mjs &
//   node tests/lifeskin-trichter-pruefstand/lauf-wege.mjs [Wort]
//
// Gegen den gebauten Stand (dist/, so wie Vercel ihn ausliefert):
//
//   npm run build && node tests/lifeskin-trichter-pruefstand/dist-server.mjs &
//   BASIS=http://127.0.0.1:5174 node tests/lifeskin-trichter-pruefstand/lauf-wege.mjs
//
// Ergebnis: test-results/lifeskin-trichter/wege/ (Bilder und befund.json).

import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { gesichtsVideo } from "./kamera-attrappe.mjs";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const FILTER = process.argv[2] || "";
const AUS = new URL("../../test-results/lifeskin-trichter/wege", import.meta.url).pathname;
const GESICHT = new URL("../../apps/lifeskin-landing/fotot/rasti-1-dita1.jpg", import.meta.url).pathname;
const CHROMIUM = process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium";
mkdirSync(AUS, { recursive: true });

// Hosts, die nie hinausgehen duerfen: Sie werden abgefangen - und zeigen
// zur Sicherheit auf den eigenen Rechner.
const GESPERRT = ["firestore.googleapis.com", "connect.facebook.net", "www.facebook.com", "graph.facebook.com"];
const PROXY = process.env.HTTPS_PROXY
  ? { server: process.env.HTTPS_PROXY, bypass: ["127.0.0.1", "localhost", ...GESPERRT].join(",") }
  : undefined;

const UA = {
  androidChrome: "Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  androidIG: "Mozilla/5.0 (Linux; Android 14; SM-A136B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 Instagram 350.0.0.34.108 Android (34/14; 280dpi; 720x1465; samsung; SM-A136B; a13x; s5e8535; sq_AL; 610397428)",
  androidFB: "Mozilla/5.0 (Linux; Android 14; SM-A536B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.135 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/460.0.0.39.86;]",
  iosSafari: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  iosIG: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 350.0.0.34.108 (iPhone15,3; iOS 18_5; sq_AL; sq-AL; scale=3.00; 1290x2796; 610397428)",
  iosFB: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 [FBAN/FBIOS;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/18.5;FBSS/3;FBID/phone;FBLC/sq_AL;FBOP/5]"
};

// ---------------------------------------------------------------------------
// Firestore im Speicher
// ---------------------------------------------------------------------------

function wertLesen(felder, teile) {
  let knoten = { mapValue: { fields: felder } };
  for (const teil of teile) {
    const f = knoten?.mapValue?.fields;
    if (!f || !(teil in f)) return undefined;
    knoten = f[teil];
  }
  return knoten;
}

function wertSetzen(felder, teile, wert) {
  let f = felder;
  for (const teil of teile.slice(0, -1)) {
    if (!f[teil]?.mapValue) f[teil] = { mapValue: { fields: {} } };
    f[teil].mapValue.fields ||= {};
    f = f[teil].mapValue.fields;
  }
  const letzter = teile[teile.length - 1];
  if (wert === undefined) delete f[letzter];
  else f[letzter] = wert;
}

export function klar(wert) {
  if (!wert || typeof wert !== "object") return wert;
  if ("stringValue" in wert) return wert.stringValue;
  if ("integerValue" in wert) return Number(wert.integerValue);
  if ("doubleValue" in wert) return Number(wert.doubleValue);
  if ("booleanValue" in wert) return wert.booleanValue;
  if ("timestampValue" in wert) return wert.timestampValue;
  if ("nullValue" in wert) return null;
  if ("arrayValue" in wert) return (wert.arrayValue.values || []).map(klar);
  if ("mapValue" in wert) {
    const raus = {};
    for (const [k, v] of Object.entries(wert.mapValue.fields || {})) raus[k] = klar(v);
    return raus;
  }
  return wert;
}

function alsFelder(objekt) {
  const wert = (v) => {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "string") return { stringValue: v };
    if (typeof v === "boolean") return { booleanValue: v };
    if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(wert) } };
    return { mapValue: { fields: alsFelder(v) } };
  };
  const raus = {};
  for (const [k, v] of Object.entries(objekt)) raus[k] = wert(v);
  return raus;
}

function neueDatenbank() {
  return {
    dokumente: new Map(),
    aufrufe: [],
    // Je Aufruf: Verzoegerung in ms / Fehlerstatus. Die Szenarien setzen sie.
    verzoegerung: () => 0,
    fehler: () => 0,
    doc(pfad) {
      const d = this.dokumente.get(pfad);
      return d ? klar({ mapValue: { fields: d.fields } }) : null;
    },
    setze(pfad, daten) {
      const zeit = new Date().toISOString();
      const alt = this.dokumente.get(pfad) || { name: `projects/x/databases/(default)/documents/${pfad}`, fields: {}, createTime: zeit };
      Object.assign(alt.fields, alsFelder(daten));
      alt.updateTime = zeit;
      this.dokumente.set(pfad, alt);
    },
    // Was eine Sammlung gerade enthaelt.
    sammlung(pfad) {
      const tiefe = pfad.split("/").length + 1;
      return [...this.dokumente.keys()].filter((p) => p.startsWith(`${pfad}/`) && p.split("/").length === tiefe);
    }
  };
}

function json(route, status, koerper) {
  return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(koerper) });
}

async function firestoreBeantworten(db, route) {
  const anfrage = route.request();
  const url = new URL(anfrage.url());
  const methode = anfrage.method();
  const roh = decodeURIComponent(url.pathname.split("/documents")[1] || "");
  const warte = db.verzoegerung(roh, methode);
  if (warte) await new Promise((fertig) => setTimeout(fertig, warte));
  const zeit = new Date().toISOString();
  db.aufrufe.push({ t: Date.now(), methode, pfad: roh, maske: url.searchParams.getAll("updateMask.fieldPaths") });
  if (/:(runQuery|runAggregationQuery|batchGet)$/.test(roh)) return json(route, 200, []);
  if (/:commit$/.test(roh)) return json(route, 200, { commitTime: zeit, writeResults: [] });
  const pfad = roh.replace(/^\//, "");
  const teile = pfad.split("/").filter(Boolean);
  if (methode === "GET") {
    if (teile.length % 2 === 0) {
      const doc = db.dokumente.get(pfad);
      return doc ? json(route, 200, doc) : json(route, 404, { error: { code: 404, status: "NOT_FOUND", message: "not found" } });
    }
    const liste = db.sammlung(pfad).map((p) => db.dokumente.get(p));
    return json(route, 200, liste.length ? { documents: liste } : {});
  }
  const fehler = db.fehler(roh, methode);
  if (fehler) return json(route, fehler, { error: { code: fehler, status: "UNAVAILABLE", message: "pruefstand" } });
  let koerper = {};
  try { koerper = anfrage.postDataJSON() || {}; } catch { koerper = {}; }
  if (methode === "POST") {
    const id = url.searchParams.get("documentId") || Math.random().toString(16).slice(2);
    const ziel = `${pfad}/${id}`;
    if (db.dokumente.has(ziel)) return json(route, 409, { error: { code: 409, status: "ALREADY_EXISTS" } });
    const doc = { name: `projects/x/databases/(default)/documents/${ziel}`, fields: koerper.fields || {}, createTime: zeit, updateTime: zeit };
    db.dokumente.set(ziel, doc);
    return json(route, 200, doc);
  }
  if (methode === "PATCH") {
    const alt = db.dokumente.get(pfad) || { name: `projects/x/databases/(default)/documents/${pfad}`, fields: {}, createTime: zeit };
    const maske = url.searchParams.getAll("updateMask.fieldPaths");
    if (maske.length) {
      for (const m of maske) {
        const segs = m.split(".").map((s) => s.replace(/^`|`$/g, ""));
        wertSetzen(alt.fields, segs, wertLesen(koerper.fields || {}, segs));
      }
    } else {
      alt.fields = koerper.fields || {};
    }
    alt.updateTime = zeit;
    db.dokumente.set(pfad, alt);
    return json(route, 200, alt);
  }
  if (methode === "DELETE") { db.dokumente.delete(pfad); return json(route, 200, {}); }
  return json(route, 200, {});
}

// ---------------------------------------------------------------------------
// Ein Lauf
// ---------------------------------------------------------------------------

let videoDatei = "";
let vorschauDatei = "";

async function kameraVorbereiten() {
  videoDatei = `${AUS}/gesicht.y4m`;
  vorschauDatei = `${AUS}/gesicht.png`;
  if (existsSync(videoDatei) && existsSync(vorschauDatei)) return;
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  try {
    // Der Ausschnitt um das Gesicht (Bild 720x810): das Gesicht fuellt
    // rund die Haelfte der Breite, wie mit ausgestrecktem Arm.
    await gesichtsVideo({
      browser, bild: GESICHT, ziel: videoDatei, vorschau: vorschauDatei,
      ausschnitt: { x: 50, y: 20, w: 560, h: 746.67 }
    });
  } finally {
    await browser.close();
  }
}

class Lauf {
  constructor(name) {
    this.name = name;
    this.befunde = [];
    this.messungen = [];
    this.technik = [];
    this.jsFehler = [];
    this.bildNr = 0;
    this.start = Date.now();
  }

  async oeffnen({ kamera = "gesicht", ua = UA.androidChrome, breite = 390, hoehe = 780, dpr = 3, vorher = null, db = null } = {}) {
    const args = [
      `--host-resolver-rules=${GESPERRT.map((h) => `MAP ${h} 127.0.0.1`).join(",")}`,
      "--autoplay-policy=no-user-gesture-required"
    ];
    if (kamera !== "gesperrt" && kamera !== "ohneApi") args.push("--use-fake-ui-for-media-stream");
    args.push("--use-fake-device-for-media-stream");
    if (kamera === "gesicht" || kamera === "langsamAbgelehnt") args.push(`--use-file-for-fake-video-capture=${videoDatei}`);
    this.browser = await chromium.launch({ executablePath: CHROMIUM, args, ...(PROXY ? { proxy: PROXY } : {}) });
    this.kontext = await this.browser.newContext({
      viewport: { width: breite, height: hoehe },
      deviceScaleFactor: dpr,
      isMobile: true,
      hasTouch: true,
      userAgent: ua,
      locale: "sq-AL",
      ignoreHTTPSErrors: true,
      permissions: kamera === "gesperrt" || kamera === "ohneApi" ? [] : ["camera"]
    });
    this.db = db || neueDatenbank();
    await this.kontext.route(/firestore\.googleapis\.com/, (route) => firestoreBeantworten(this.db, route));
    await this.kontext.route(/facebook\.(net|com)/, (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
    this.meldungen = [];
    await this.kontext.route(/\/api\/lifeskin-meldung/, (route) => {
      this.meldungen.push(Date.now());
      return json(route, 200, { ok: true });
    });
    if (kamera === "ohneApi") {
      await this.kontext.addInitScript(() => {
        Object.defineProperty(Navigator.prototype, "mediaDevices", { get: () => undefined, configurable: true });
      });
    }
    if (kamera === "langsamAbgelehnt") {
      // Wer die Systemfrage liest und "Blockieren" tippt: zweieinhalb
      // Sekunden, dann NotAllowedError.
      await this.kontext.addInitScript(() => {
        const md = navigator.mediaDevices;
        if (!md) return;
        md.getUserMedia = () => new Promise((_, nein) => {
          setTimeout(() => nein(new DOMException("Permission denied", "NotAllowedError")), 2500);
        });
      });
    }
    if (vorher) await vorher(this);
    this.seite = await this.kontext.newPage();
    this.seite.on("pageerror", (e) => this.jsFehler.push(String(e.message).slice(0, 240)));
    this.seite.on("console", (m) => {
      if (m.type() === "error") this.jsFehler.push(`console: ${m.text().slice(0, 200)}`);
    });
    return this;
  }

  async zu() {
    try { await this.browser?.close(); } catch { /* egal */ }
  }

  pruefe(bedingung, text, detail = "") {
    this.befunde.push({ ok: Boolean(bedingung), text, detail: String(detail || "") });
    const zeichen = bedingung ? "  ✓" : "  ✗";
    console.log(`${zeichen} ${text}${detail ? ` — ${detail}` : ""}`);
    return Boolean(bedingung);
  }

  mass(text, ms) {
    this.messungen.push({ text, ms });
    console.log(`  ⏱ ${text}: ${ms == null ? "—" : `${(ms / 1000).toFixed(2)} s`}`);
  }

  async bild(name) {
    this.bildNr += 1;
    const datei = `${AUS}/${this.name.replace(/\W+/g, "_")}_${String(this.bildNr).padStart(2, "0")}_${name}.png`;
    try { await this.seite.screenshot({ path: datei }); } catch { /* Seite im Wechsel */ }
    return datei;
  }

  aktiv() {
    return this.seite.evaluate(() => document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id || "-").catch(() => "?");
  }

  // Wartet, bis ein Bildschirm aktiv ist. Gibt die Wartezeit zurueck oder null.
  async schirm(id, frist = 12000) {
    const ab = Date.now();
    try {
      await this.seite.waitForFunction((k) => document.getElementById(k)?.dataset.aktiv === "ja", id, { timeout: frist, polling: 50 });
      return Date.now() - ab;
    } catch {
      return null;
    }
  }

  async warte(fn, arg, frist = 15000) {
    const ab = Date.now();
    try {
      await this.seite.waitForFunction(fn, arg, { timeout: frist, polling: 100 });
      return Date.now() - ab;
    } catch {
      return null;
    }
  }

  // Liegt der Knopf ohne Scrollen im Bild - und ist er nicht verdeckt?
  async imBild(sel) {
    return this.seite.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el || el.hidden || el.closest("[hidden]")) return { da: false };
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return { da: false };
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const oben = document.elementFromPoint(x, Math.min(y, innerHeight - 1));
      return {
        da: true,
        imBild: r.top >= 0 && r.bottom <= innerHeight + 1,
        frei: Boolean(oben && (oben === el || el.contains(oben))),
        unten: Math.round(innerHeight - r.bottom),
        text: (el.textContent || "").trim().slice(0, 60)
      };
    }, sel);
  }

  async knopfPruefen(sel, name) {
    const stand = await this.imBild(sel);
    this.pruefe(stand.da && stand.imBild && stand.frei, `${name} ohne Scrollen sichtbar und frei`,
      stand.da ? `"${stand.text}" · Abstand unten ${stand.unten}px${stand.frei ? "" : " · VERDECKT"}` : "fehlt");
    return stand;
  }

  async querScroll() {
    return this.seite.evaluate(() => document.scrollingElement.scrollWidth - innerWidth);
  }

  async tippe(sel) {
    await this.seite.tap(sel, { timeout: 8000 });
  }

  // Was der Trichter in die Sitzung geschrieben hat.
  sitzung() {
    const pfad = [...this.db.dokumente.keys()].find((p) => /^lifeskin\/lifeskin\/sessions\/[^/]+$/.test(p));
    return pfad ? { pfad, id: pfad.split("/").pop(), daten: this.db.doc(pfad) } : null;
  }

  technikZeilen() {
    const s = this.sitzung();
    const pfad = s?.daten?.timings?.pfad || {};
    return Object.values(pfad).filter((e) => e?.e === "technik").sort((a, b) => String(a.t).localeCompare(String(b.t))).map((e) => e.d);
  }
}

// ---------------------------------------------------------------------------
// Bausteine der Wege
// ---------------------------------------------------------------------------

async function landing(t, { suche = "utm_source=ig&utm_campaign=pruefstand" } = {}) {
  const ab = Date.now();
  await t.seite.goto(`${BASIS}/lifeskin?${suche}`, { waitUntil: "commit" });
  const knopf = await t.warte(() => {
    const k = document.getElementById("ls-start");
    const r = k?.getBoundingClientRect();
    return Boolean(k && r && r.width && r.bottom <= innerHeight);
  }, null, 20000);
  t.mass("Landing: Startknopf im Bild", knopf == null ? null : Date.now() - ab);
  const bereit = await t.warte(() => globalThis.__lifeskinBereit === true, null, 20000);
  t.mass("Landing: Trichter bereit (Skript geladen)", bereit == null ? null : Date.now() - ab);
  await t.bild("landing");
  t.pruefe(knopf != null, "Landing zeigt den Startknopf");
  t.pruefe((await t.querScroll()) <= 1, "Landing ohne seitliches Scrollen");
}

async function zurWahl(t) {
  await t.tippe("#ls-start");
  const ms = await t.schirm("ls-wahl");
  t.mass("Tipp auf Start → Wahl", ms);
  t.pruefe(ms != null, "Wahlbildschirm erscheint");
  await t.bild("wahl");
  for (const weg of ["skanim", "foto", "trup"]) await t.knopfPruefen(`[data-ls-weg="${weg}"]`, `Karte ${weg}`);
}

async function nameUndAlter(t, name = "Arta") {
  const ms = await t.schirm("ls-name", 15000);
  t.pruefe(ms != null, "Name und Alter erscheinen", `aktiv: ${await t.aktiv()}`);
  if (ms == null) return false;
  await t.bild("name");
  await t.seite.fill("#ls-namefeld", name);
  await t.seite.tap(".ls-alter__wahl >> nth=1");
  await t.seite.evaluate(() => document.activeElement?.blur?.());
  await t.knopfPruefen("#ls-nameweiter", "Knopf 'Vazhdo' (Name)");
  await t.tippe("#ls-nameweiter");
  return true;
}

async function nummer(t, nummerText = "044 123 456") {
  const ms = await t.schirm("ls-tel", 10000);
  t.pruefe(ms != null, "Nummernbildschirm erscheint", `aktiv: ${await t.aktiv()}`);
  if (ms == null) return false;
  await t.bild("nummer");
  await t.seite.fill("#ls-telfeld", nummerText);
  await t.seite.evaluate(() => document.activeElement?.blur?.());
  await t.knopfPruefen("#ls-telweiter", "Knopf WhatsApp-Nummer");
  await t.tippe("#ls-telweiter");
  return true;
}

// Bis zur Warteseite: Ladeseite, Uebergabe, Weiterleitung.
async function bisZurWarteseite(t, { frist = 45000, erwartetFotos = null } = {}) {
  const ab = Date.now();
  let sahLadeseite = false;
  let fehlerkasten = "";
  const ende = Date.now() + frist;
  while (Date.now() < ende) {
    const stand = await t.seite.evaluate(() => ({
      pfad: location.pathname,
      schirm: document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id || "-",
      fehler: document.getElementById("ls-fehler") && !document.getElementById("ls-fehler").classList.contains("ls-verstecken")
        ? (document.getElementById("ls-fehlertext")?.textContent || "").trim() : ""
    })).catch(() => ({ pfad: "", schirm: "wechsel", fehler: "" }));
    if (stand.schirm === "ls-analyse") sahLadeseite = true;
    if (stand.fehler) fehlerkasten = stand.fehler;
    if (/^\/analiza\//.test(stand.pfad)) break;
    await t.seite.waitForTimeout(250);
  }
  const pfad = await t.seite.evaluate(() => location.pathname).catch(() => "");
  const ms = /^\/analiza\//.test(pfad) ? Date.now() - ab : null;
  t.mass("Letzter Tipp → Warteseite /analiza", ms);
  t.pruefe(ms != null, "Weiterleitung auf die Warteseite", pfad);
  if (fehlerkasten) t.pruefe(false, "Unterwegs kein Fehlerkasten", fehlerkasten);
  const s = t.sitzung();
  const bericht = s ? t.db.doc(`lifeskin/lifeskin/reports/${s.id}`) : null;
  t.pruefe(Boolean(bericht), "Bericht in der Datenbank angelegt", bericht ? `status=${bericht.status} typ=${bericht.typ} photos=${bericht.photos} numri=${bericht.numri}` : "fehlt");
  if (erwartetFotos != null && bericht) {
    const fotos = t.db.sammlung(`lifeskin/lifeskin/sessions/${s.id}/photos`);
    t.pruefe(fotos.length >= erwartetFotos, `Fotos in der Sitzung (mind. ${erwartetFotos})`, `${fotos.length}: ${fotos.map((p) => p.split("/").pop()).join(", ")}`);
    t.pruefe(Number(bericht.photos) >= erwartetFotos, "Bericht zaehlt die Fotos", String(bericht.photos));
  }
  if (s) t.pruefe(s.daten.phone && s.daten.phoneConsent === true, "Nummer mit Einwilligung in der Sitzung", String(s.daten.phone || "—"));
  // Die Warteseite selbst.
  const geladen = await t.warte(() => {
    const t = document.body?.innerText || "";
    return t.length > 80 && !/nuk u gjet/i.test(t);
  }, null, 15000);
  await t.bild("warteseite");
  const text = await t.seite.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 160)).catch(() => "");
  t.pruefe(geladen != null, "Warteseite zeigt Inhalt (nicht 'nuk u gjet')", text);
  return { id: s?.id || "", sahLadeseite };
}

// Heart gibt frei: status "fertig" mit einem Mittel. Die Warteseite fragt
// alle 12 s nach und muss von selbst auf die Therapieseite wechseln.
async function freigabeUndTherapie(t, id) {
  t.db.setze("lifeskin/lifeskin/products/pore-control", {
    name: "Pore Control", einzelpreis: 29, lloji: "serum",
    kurztext: { sq: "Pastron poret dhe ul yndyrën." }, veprimi: { sq: ["Pastron poret"] }
  });
  t.db.setze(`lifeskin/lifeskin/reports/${id}`, {
    status: "fertig", freigabeAt: new Date().toISOString(),
    produkte: [{ id: "pore-control", satz: "Për poret në ballë." }]
  });
  const ms = await t.warte(() => /^\/terapia\//.test(location.pathname), null, 20000);
  t.mass("Freigabe → Therapieseite (ohne Neuladen)", ms);
  t.pruefe(ms != null, "Warteseite wechselt nach der Freigabe von selbst zur Therapie", await t.seite.evaluate(() => location.pathname).catch(() => ""));
  if (ms == null) return;
  const inhalt = await t.warte(() => (document.body?.innerText || "").includes("Pore Control"), null, 15000);
  await t.bild("therapie");
  t.pruefe(inhalt != null, "Therapieseite zeigt das freigegebene Mittel");
  t.pruefe((await t.querScroll()) <= 1, "Therapieseite ohne seitliches Scrollen");
}

async function fehlerkasten(t) {
  return t.seite.evaluate(() => {
    const box = document.getElementById("ls-fehler");
    const sichtbar = (el) => Boolean(el && !el.hidden && el.getClientRects().length);
    return {
      offen: Boolean(box && !box.classList.contains("ls-verstecken")),
      text: (document.getElementById("ls-fehlertext")?.textContent || "").trim(),
      nochmal: sichtbar(document.getElementById("ls-fehlernochmal")),
      foto: sichtbar(document.getElementById("ls-fehlerfoto")),
      chrome: sichtbar(document.getElementById("ls-fehlerchrome")),
      chromeHref: document.getElementById("ls-fehlerchrome")?.getAttribute("href") || ""
    };
  });
}

// Wartet, bis das Gesichtsnetz geladen ist - so, wie ein Mensch die
// Anleitung liest, waehrend es im Hintergrund kommt. Im Quellstand ist
// /apps/lifeskin/lifeskin-netz.js dieselbe Modulinstanz wie die des
// Trichters; im Buendel (dist) gibt es sie so nicht - dann zaehlt die Zeit.
async function aufNetzWarten(t, frist = 40000) {
  const ab = Date.now();
  while (Date.now() - ab < frist) {
    const stand = await t.seite.evaluate(async () => {
      try { return (await import("/apps/lifeskin/lifeskin-netz.js")).netzStand(); } catch { return "?"; }
    }).catch(() => "?");
    if (stand === "da" || stand === "gescheitert") return { stand, ms: Date.now() - ab };
    if (stand === "?" || stand === "aus") { await t.seite.waitForTimeout(12000); return { stand: "unbekannt", ms: Date.now() - ab }; }
    await t.seite.waitForTimeout(300);
  }
  return { stand: "zeit", ms: Date.now() - ab };
}

// Das Foto aus der Kamera des Telefons: der Knopf im Fehlerkasten oeffnet
// die Dateiauswahl - hier kommt das Gesicht als JPEG hinein.
async function systemFoto(t, sel = "#ls-fehlerfoto") {
  const [waehler] = await Promise.all([
    t.seite.waitForEvent("filechooser", { timeout: 8000 }),
    t.tippe(sel)
  ]);
  t.pruefe(waehler.isMultiple() === false, "Dateiauswahl fuer genau ein Foto");
  const accept = await waehler.element().getAttribute("accept");
  const capture = await waehler.element().getAttribute("capture");
  t.pruefe(/image/.test(accept || ""), "Dateiauswahl nimmt Bilder", `accept=${accept} capture=${capture}`);
  await waehler.setFiles(GESICHT);
}

// Wie das aufgenommene Bild zur Vorlage steht: seitengleich (wie im
// Spiegel) oder seitenverkehrt. Verglichen wird das Helligkeitsprofil der
// Spalten - das Gesichtsbild ist links hell (Wand), rechts dunkel (Haar).
async function spiegelVergleich(t, bildSel) {
  return t.seite.evaluate(async ({ sel, vorlage }) => {
    const bild = document.querySelector(sel);
    if (!bild?.src) return null;
    const laden = (src) => new Promise((ok, nein) => { const i = new Image(); i.onload = () => ok(i); i.onerror = nein; i.src = src; });
    const aufnahme = await laden(bild.src);
    const quelle = await laden(vorlage);
    const profil = (img, spiegeln) => {
      const n = 32;
      const c = document.createElement("canvas");
      c.width = n; c.height = n;
      const f = c.getContext("2d");
      // Mittiger Ausschnitt im Seitenverhaeltnis der Aufnahme.
      const zv = aufnahme.naturalWidth / aufnahme.naturalHeight;
      let w = img.naturalWidth, h = w / zv;
      if (h > img.naturalHeight) { h = img.naturalHeight; w = h * zv; }
      if (spiegeln) { f.translate(n, 0); f.scale(-1, 1); }
      f.drawImage(img, (img.naturalWidth - w) / 2, (img.naturalHeight - h) / 2, w, h, 0, 0, n, n);
      const d = f.getImageData(0, 0, n, n).data;
      const spalten = new Array(n).fill(0);
      for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) {
        const p = (y * n + x) * 4;
        spalten[x] += d[p] * 0.3 + d[p + 1] * 0.59 + d[p + 2] * 0.11;
      }
      return spalten;
    };
    const korrelation = (a, b) => {
      const m = (v) => v.reduce((s, x) => s + x, 0) / v.length;
      const ma = m(a), mb = m(b);
      let z = 0, na = 0, nb = 0;
      for (let i = 0; i < a.length; i += 1) { z += (a[i] - ma) * (b[i] - mb); na += (a[i] - ma) ** 2; nb += (b[i] - mb) ** 2; }
      return z / Math.sqrt(na * nb || 1);
    };
    const a = profil(aufnahme, false);
    return {
      gleich: korrelation(a, profil(quelle, false)),
      gespiegelt: korrelation(a, profil(quelle, true)),
      groesse: `${aufnahme.naturalWidth}x${aufnahme.naturalHeight}`
    };
  }, { sel: bildSel, vorlage: `data:image/png;base64,${(await import("node:fs")).readFileSync(vorschauDatei).toString("base64")}` });
}

// ---------------------------------------------------------------------------
// Die Wege
// ---------------------------------------------------------------------------

const SZENARIEN = [];
const szenario = (name, fn) => SZENARIEN.push({ name, fn });

// Der Scan, so wie ein Mensch ihn geht: Er liest die Wahl und die
// Anleitung (in dieser Zeit laedt das Gesichtsnetz vor), dreht den Kopf
// aber NICHT - ein Standbild kann das nicht. Gemessen wird, was er dann
// sieht und ob er trotzdem durchkommt.
async function scanWeg(t, { lesenMs = 4000, gesichtsnetz = true, netzAbwarten = false } = {}) {
  await landing(t);
  await zurWahl(t);
  await t.seite.waitForTimeout(1500);
  await t.tippe('[data-ls-weg="skanim"]');
  t.pruefe((await t.schirm("ls-vorbereitung")) != null, "Vorbereitung erscheint");
  await t.bild("vorbereitung");
  await t.knopfPruefen("#ls-kameraoeffnen", "Knopf 'Kamera oeffnen'");
  await t.seite.waitForTimeout(lesenMs);
  if (netzAbwarten) {
    const netz = await aufNetzWarten(t);
    t.mass(`Gesichtsnetz im Hintergrund geladen (${netz.stand}), ab Ende der Lesezeit`, netz.ms);
  }
  const ab = Date.now();
  await t.tippe("#ls-kameraoeffnen");
  t.pruefe((await t.schirm("ls-kamera")) != null, "Kamerabildschirm erscheint");
  const video = await t.warte(() => {
    const v = document.getElementById("ls-video");
    return Boolean(v && v.videoWidth && !v.paused && v.readyState >= 2);
  }, null, 20000);
  t.mass("Tipp → Kamerabild laeuft", video == null ? null : Date.now() - ab);
  t.pruefe(video != null, "Kamerabild laeuft");
  // Welcher Weg: Ring (Gesichtsnetz da) oder einfache Erkennung.
  await t.warte(() => {
    const k = globalThis.__lifeskinTrichter?.kamera;
    return ["ring", "aufnahme"].includes(k?.modus)
      || document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id !== "ls-kamera";
  }, null, 20000);
  const modus = await t.seite.evaluate(() => globalThis.__lifeskinTrichter?.kamera?.modus || "");
  t.mass(`Tipp → Scan fuehrt (${modus === "ring" ? "Ring" : "einfache Erkennung"})`, Date.now() - ab);
  if (gesichtsnetz) t.pruefe(modus === "ring", "Nach dem Lesen der Anleitung ist das Gesichtsnetz da (Ring)", modus);
  await t.bild("kamera");
  const hinweise = [];
  let blattVonSelbst = null;
  const bis = Date.now() + 40000;
  while (Date.now() < bis) {
    const s = await t.seite.evaluate(() => ({
      hinweis: (document.getElementById("ls-kamerahinweis")?.textContent || "").trim(),
      blatt: !document.getElementById("ls-blatt")?.classList.contains("ls-verstecken"),
      fotos: Object.keys(globalThis.__lifeskinTrichter?.kamera?.fotos || {}).length,
      schirm: document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id,
      fehler: !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken")
    })).catch(() => ({ schirm: "wechsel" }));
    const sek = Math.round((Date.now() - ab) / 1000);
    if (!hinweise.length || hinweise[hinweise.length - 1].hinweis !== s.hinweis) hinweise.push({ sek, hinweis: s.hinweis, fotos: s.fotos });
    if (s.fehler) break;
    if (s.blatt && blattVonSelbst == null) { blattVonSelbst = sek; break; }
    if (s.schirm !== "ls-kamera") break;
    await t.seite.waitForTimeout(400);
  }
  for (const h of hinweise) console.log(`     ${String(h.sek).padStart(3)} s · Fotos ${h.fotos} · "${h.hinweis}"`);
  const k = await fehlerkasten(t);
  t.pruefe(!k.offen, "Kein Fehler waehrend des Scans", k.text);
  const schirm = await t.aktiv();
  if (schirm === "ls-kamera") {
    t.pruefe(hinweise.some((h) => h.fotos > 0), "Das gerade Bild ist aufgenommen, auch ohne geschlossenen Ring");
    t.pruefe(blattVonSelbst != null, "Wer nicht herumkommt: die Hilfe mit dem Ausloeser geht von selbst auf",
      blattVonSelbst != null ? `nach ${blattVonSelbst} s` : "nicht innerhalb von 40 s");
    if (blattVonSelbst == null) { await t.tippe("#ls-hilfe"); await t.seite.waitForTimeout(400); }
    await t.bild("hilfe");
    await t.knopfPruefen("#ls-manuell", "Ausloeser im Hilfeblatt");
    await t.tippe("#ls-manuell");
  } else {
    t.mass("Scan von selbst fertig (einfache Erkennung)", Date.now() - ab);
  }
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  const { id, sahLadeseite } = await bisZurWarteseite(t, { erwartetFotos: 1 });
  t.pruefe(sahLadeseite, "Ladeseite (Analyse) wurde gezeigt");
  t.technik = t.technikZeilen();
  if (id) await freigabeUndTherapie(t, id);
}

szenario("A1 Skanim · Android Chrome · Kamera mit Gesicht", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await scanWeg(t, { lesenMs: 4000, netzAbwarten: true });
});

szenario("A1c Skanim · wer sofort tippt (Netz noch unterwegs)", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await scanWeg(t, { lesenMs: 500, gesichtsnetz: false });
});

szenario("A1b Skanim · Gesichtsnetz kommt nicht (altes Telefon, Modell blockiert)", async (t) => {
  await t.oeffnen({
    kamera: "gesicht", ua: UA.androidChrome, breite: 360, hoehe: 740, dpr: 2,
    vorher: (l) => l.kontext.route(/face_landmarker\.task/, (route) => route.abort())
  });
  await scanWeg(t, { lesenMs: 1000, gesichtsnetz: false });
});

szenario("A2 Me foto · iPhone Instagram (Kennung) · Frontkamera", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.iosIG, breite: 390, hoehe: 716, dpr: 3 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="foto"]');
  t.pruefe((await t.schirm("ls-fotopara")) != null, "Foto-Anleitung erscheint");
  await t.bild("fotopara");
  await t.knopfPruefen("#ls-fotoweiter", "Knopf zur Foto-Kamera");
  const ab = Date.now();
  await t.tippe("#ls-fotoweiter");
  t.pruefe((await t.schirm("ls-foto")) != null, "Foto-Kamera erscheint");
  const bereit = await t.warte(() => document.getElementById("ls-fotobuehne")?.dataset.bereit === "ja", null, 15000);
  t.mass("Tipp → Foto-Kamera bereit", bereit == null ? null : Date.now() - ab);
  await t.bild("fotokamera");
  const richtung = await t.seite.evaluate(() => document.getElementById("ls-fotobuehne")?.dataset.richtung);
  t.pruefe(richtung === "user", "Frontkamera", richtung);
  await t.knopfPruefen("#ls-fotoausloeser", "Ausloeser");
  await t.tippe("#ls-fotoausloeser");
  const vorschau = await t.warte(() => document.getElementById("ls-fotobuehne")?.dataset.stand === "vorschau", null, 5000);
  t.pruefe(vorschau != null, "Aufnahme steht als Vorschau");
  await t.bild("fotovorschau");
  const spiegel = await spiegelVergleich(t, "#ls-fotobild");
  t.pruefe(spiegel && spiegel.gespiegelt > spiegel.gleich, "Aufnahme ist wie im Spiegel (so wie die Vorschau) - nicht seitenverkehrt",
    spiegel ? `Korrelation gespiegelt ${spiegel.gespiegelt.toFixed(2)} / gleich ${spiegel.gleich.toFixed(2)} · ${spiegel.groesse}` : "kein Bild");
  // Und wie die Vorschau auf dem Bildschirm steht (CSS-Spiegel des Videos
  // vs. Bild): Die Aufnahme darf nach dem Ausloeser nicht umspringen.
  const cssSpiegel = await t.seite.evaluate(() => ({
    video: getComputedStyle(document.getElementById("ls-fotovideo")).transform,
    bild: getComputedStyle(document.getElementById("ls-fotobild")).transform
  }));
  t.pruefe(cssSpiegel.bild === "none" || !/matrix\(-1/.test(cssSpiegel.bild), "Das Vorschaubild wird nicht noch einmal per CSS gespiegelt", JSON.stringify(cssSpiegel));
  await t.knopfPruefen("#ls-fotonehmen", "Knopf 'Foto nehmen'");
  await t.tippe("#ls-fotonehmen");
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 1 });
});

szenario("A3 Me foto · Android Instagram · Kamera sofort gesperrt → Foto mit Telefonkamera", async (t) => {
  await t.oeffnen({ kamera: "gesperrt", ua: UA.androidIG, breite: 360, hoehe: 740, dpr: 2 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="foto"]');
  await t.schirm("ls-fotopara");
  await t.tippe("#ls-fotoweiter");
  const kasten = await t.warte(() => !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"), null, 8000);
  t.pruefe(kasten != null, "Hinweis erscheint sofort statt eines schwarzen Bildes");
  const k = await fehlerkasten(t);
  await t.bild("gesperrt");
  console.log(`     Text: "${k.text}"`);
  t.pruefe(/aplikacion/i.test(k.text), "Text erklaert: diese App oeffnet die Kamera nicht", k.text.slice(0, 80));
  t.pruefe(!k.nochmal, "Kein sinnloses 'Provo sërish'");
  t.pruefe(k.foto, "Knopf 'Bëj foto me kamerën e telefonit' sichtbar");
  t.pruefe(k.chrome && /^intent:\/\//.test(k.chromeHref) && /package=com\.android\.chrome/.test(k.chromeHref), "Knopf 'Hape në Chrome' mit Chrome-Adresse", k.chromeHref.slice(0, 90));
  const rueck = decodeURIComponent((k.chromeHref.match(/S\.browser_fallback_url=([^;]+)/) || [])[1] || "");
  t.pruefe(/ls_weg=foto/.test(k.chromeHref) && /\/lifeskin/.test(rueck), "Chrome oeffnet denselben Weg wieder (ls_weg=foto)", rueck);
  await t.knopfPruefen("#ls-fehlerfoto", "Knopf Telefonkamera");
  await systemFoto(t);
  const foto = await t.schirm("ls-foto", 8000);
  t.pruefe(foto != null, "Foto steht zur Kontrolle da");
  const stand = await t.seite.evaluate(() => document.getElementById("ls-fotobuehne")?.dataset.stand);
  t.pruefe(stand === "vorschau", "Vorschau des Fotos", stand);
  await t.bild("systemfoto");
  await t.tippe("#ls-fotonehmen");
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 1 });
});

szenario("A4 Skanim · Android Facebook · Kamera sofort gesperrt → Foto mit Telefonkamera", async (t) => {
  await t.oeffnen({ kamera: "gesperrt", ua: UA.androidFB, breite: 360, hoehe: 740, dpr: 2 });
  await landing(t, { suche: "utm_source=fb&utm_campaign=pruefstand" });
  await zurWahl(t);
  await t.tippe('[data-ls-weg="skanim"]');
  await t.schirm("ls-vorbereitung");
  await t.tippe("#ls-kameraoeffnen");
  const kasten = await t.warte(() => !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"), null, 8000);
  t.pruefe(kasten != null, "Hinweis erscheint sofort");
  const k = await fehlerkasten(t);
  await t.bild("gesperrt");
  t.pruefe(!k.nochmal && k.foto && k.chrome, "Ausweg: Telefonkamera + Chrome, kein 'Provo sërish'", JSON.stringify({ nochmal: k.nochmal, foto: k.foto, chrome: k.chrome }));
  t.pruefe(/ls_weg=skanim/.test(k.chromeHref), "Chrome oeffnet den Scan wieder (ls_weg=skanim)");
  await systemFoto(t);
  t.pruefe((await t.schirm("ls-foto", 8000)) != null, "Foto steht zur Kontrolle da");
  await t.tippe("#ls-fotonehmen");
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 1 });
  const s = t.sitzung();
  t.pruefe(s?.daten?.typ === "foto", "Fall steht in Heart als Foto-Fall (nicht als leerer Scan)", s?.daten?.typ);
  t.pruefe(s?.daten?.device?.app === "facebook" && s?.daten?.device?.os === "android", "Heart sieht 'Android · Facebook'", JSON.stringify(s?.daten?.device || {}));
});

szenario("A5 Trup/Pytje · Android Facebook · mit Foto aus der Galerie", async (t) => {
  await t.oeffnen({ kamera: "gesperrt", ua: UA.androidFB, breite: 360, hoehe: 740, dpr: 2 });
  await landing(t, { suche: "utm_source=fb" });
  await zurWahl(t);
  await t.tippe('[data-ls-weg="trup"]');
  if (!(await nameUndAlter(t, "Blerina"))) return;
  const ms = await t.schirm("ls-anliegen", 8000);
  t.pruefe(ms != null, "Anliegen erscheint");
  await t.bild("anliegen");
  await t.seite.fill("#ls-anliegenfeld", "Kam puçrra në shpinë prej dy muajsh.");
  const [waehler] = await Promise.all([t.seite.waitForEvent("filechooser", { timeout: 8000 }), t.tippe("#ls-anliegenfoto .ls-anhang__knopf")]);
  await waehler.setFiles(GESICHT);
  const bild = await t.warte(() => Boolean(document.getElementById("ls-anliegenbild")?.getAttribute("src")), null, 8000);
  t.pruefe(bild != null, "Angehaengtes Foto wird gezeigt");
  await t.seite.evaluate(() => document.activeElement?.blur?.());
  await t.bild("anliegen_foto");
  await t.knopfPruefen("#ls-anliegenweiter", "Knopf 'Vazhdo' (Anliegen)");
  await t.tippe("#ls-anliegenweiter");
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 1 });
  const s = t.sitzung();
  t.pruefe(s?.daten?.problemi?.length > 5, "Text des Anliegens in der Sitzung", s?.daten?.problemi);
});

szenario("A6 Trup/Pytje · iPhone SE (klein) · Safari · ohne Foto", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.iosSafari, breite: 320, hoehe: 568, dpr: 2 });
  await landing(t, { suche: "utm_source=ig" });
  await zurWahl(t);
  await t.tippe('[data-ls-weg="trup"]');
  if (!(await nameUndAlter(t, "Dua"))) return;
  await t.schirm("ls-anliegen", 8000);
  await t.seite.fill("#ls-anliegenfeld", "A mund të përdor kremin gjatë shtatzënisë?");
  await t.seite.evaluate(() => document.activeElement?.blur?.());
  await t.bild("anliegen");
  await t.knopfPruefen("#ls-anliegenweiter", "Knopf 'Vazhdo' (Anliegen, 320px)");
  await t.tippe("#ls-anliegenweiter");
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 0 });
});

szenario("A7 Skanim · Android Chrome · Mensch lehnt die Kamera selbst ab (nach 2,5 s)", async (t) => {
  await t.oeffnen({ kamera: "langsamAbgelehnt", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="skanim"]');
  await t.schirm("ls-vorbereitung");
  await t.tippe("#ls-kameraoeffnen");
  const kasten = await t.warte(() => !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"), null, 10000);
  t.pruefe(kasten != null, "Hinweis erscheint nach der Ablehnung");
  const k = await fehlerkasten(t);
  await t.bild("abgelehnt");
  console.log(`     Text: "${k.text}"`);
  t.pruefe(k.nochmal, "'Provo sërish' bleibt (die Erlaubnis kann man noch geben)");
  t.pruefe(k.foto, "Telefonkamera als zweiter Weg");
  t.pruefe(!k.chrome, "Kein Chrome-Knopf im Chrome selbst");
  await systemFoto(t);
  t.pruefe((await t.schirm("ls-foto", 8000)) != null, "Foto steht zur Kontrolle da");
  await t.tippe("#ls-fotonehmen");
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  await bisZurWarteseite(t, { erwartetFotos: 1 });
});

szenario("A8 Skanim · alter App-Browser ohne Kamera-Schnittstelle", async (t) => {
  await t.oeffnen({ kamera: "ohneApi", ua: UA.androidIG, breite: 360, hoehe: 740, dpr: 2 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="skanim"]');
  await t.schirm("ls-vorbereitung");
  await t.tippe("#ls-kameraoeffnen");
  const kasten = await t.warte(() => !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"), null, 8000);
  t.pruefe(kasten != null, "Hinweis erscheint");
  const k = await fehlerkasten(t);
  await t.bild("ohne_api");
  t.pruefe(!k.nochmal && k.foto && k.chrome, "Ausweg: Telefonkamera + Chrome", JSON.stringify(k).slice(0, 160));
  const netz = await t.seite.evaluate(() => performance.getEntriesByType("resource").filter((e) => /face_landmarker|vision_bundle/.test(e.name)).length);
  t.pruefe(netz === 0, "Ohne Kamera wird das Gesichtsnetz (6,9 MB) nicht geladen", `${netz} Anfragen`);
  await systemFoto(t);
  t.pruefe((await t.schirm("ls-foto", 8000)) != null, "Foto steht zur Kontrolle da");
});

szenario("A9 Skanim · Kamera ohne Gesicht (niemand im Bild)", async (t) => {
  await t.oeffnen({ kamera: "standard", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="skanim"]');
  await t.schirm("ls-vorbereitung");
  const netz = await aufNetzWarten(t);
  t.mass(`Gesichtsnetz geladen (${netz.stand})`, netz.ms);
  const ab = Date.now();
  await t.tippe("#ls-kameraoeffnen");
  await t.schirm("ls-kamera");
  const hinweise = [];
  let ende = null;
  let schirm = "ls-kamera";
  while (Date.now() - ab < 70000) {
    const s = await t.seite.evaluate(() => ({
      hinweis: (document.getElementById("ls-kamerahinweis")?.textContent || "").trim(),
      fehler: !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"),
      blatt: !document.getElementById("ls-blatt")?.classList.contains("ls-verstecken"),
      modus: globalThis.__lifeskinTrichter?.kamera?.modus,
      schirm: document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id
    })).catch(() => ({}));
    const sek = Math.round((Date.now() - ab) / 1000);
    if (!hinweise.length || hinweise[hinweise.length - 1].hinweis !== s.hinweis) hinweise.push({ sek, ...s });
    schirm = s.schirm || schirm;
    if (s.fehler || s.schirm !== "ls-kamera") { ende = sek; break; }
    await t.seite.waitForTimeout(1000);
  }
  for (const h of hinweise) console.log(`     ${String(h.sek).padStart(3)} s · ${h.modus} · "${h.hinweis}"`);
  const k = await fehlerkasten(t);
  await t.bild("ohne_gesicht");
  if (schirm !== "ls-kamera") {
    t.pruefe(true, "Ohne Gesichtsnetz: der einfache Weg nimmt trotzdem auf und geht weiter", `nach ${ende} s auf ${schirm}`);
    return;
  }
  t.pruefe(ende != null, "Nach dem Stillstand ein klarer Hinweis statt einer endlosen Kamera", ende != null ? `nach ${ende} s: "${k.text.slice(0, 80)}"` : "kein Hinweis in 70 s");
  t.pruefe(k.nochmal && k.foto, "Wege danach: noch einmal ODER Telefonkamera", JSON.stringify({ nochmal: k.nochmal, foto: k.foto }));
  if (k.foto) {
    await systemFoto(t);
    t.pruefe((await t.schirm("ls-foto", 8000)) != null, "Mit der Telefonkamera geht es weiter");
  }
});

szenario("A10 Uebergabe auf zaeher Leitung (Foto braucht 28 s)", async (t) => {
  await t.oeffnen({ kamera: "gesperrt", ua: UA.androidIG, breite: 360, hoehe: 740, dpr: 2 });
  t.db.verzoegerung = (pfad, methode) => (methode === "PATCH" && /\/photos\//.test(pfad) ? 28000 : 0);
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="foto"]');
  await t.schirm("ls-fotopara");
  await t.tippe("#ls-fotoweiter");
  await t.warte(() => !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken"), null, 8000);
  await systemFoto(t);
  await t.schirm("ls-foto", 8000);
  await t.tippe("#ls-fotonehmen");
  if (!(await nameUndAlter(t))) return;
  if (!(await nummer(t))) return;
  // Waehrend das Foto unterwegs ist: Was steht auf der Ladeseite?
  const zeilen = [];
  const ab = Date.now();
  while (Date.now() - ab < 45000) {
    const s = await t.seite.evaluate(() => ({
      pfad: location.pathname,
      letzte: (document.querySelector("#ls-analyseschritte .ls-schrittzeile:last-child")?.textContent || "").trim(),
      fehler: !document.getElementById("ls-fehler")?.classList.contains("ls-verstecken")
        ? (document.getElementById("ls-fehlertext")?.textContent || "").trim() : ""
    })).catch(() => ({ pfad: "wechsel" }));
    const sek = Math.round((Date.now() - ab) / 1000);
    const text = s.fehler ? `FEHLERKASTEN: ${s.fehler}` : s.letzte;
    if (!zeilen.length || zeilen[zeilen.length - 1].text !== text) zeilen.push({ sek, text });
    if (/^\/analiza\//.test(s.pfad || "")) { zeilen.push({ sek, text: "→ Warteseite" }); break; }
    await t.seite.waitForTimeout(500);
  }
  for (const z of zeilen) console.log(`     ${String(z.sek).padStart(3)} s · ${z.text}`);
  t.pruefe(zeilen.some((z) => /nga 1/.test(z.text)), "Ladeseite zeigt, dass das Foto noch unterwegs ist (0 nga 1)");
  const angekommen = zeilen.some((z) => /Warteseite/.test(z.text));
  t.pruefe(angekommen, "Kommt das Foto an, geht es von selbst weiter - ohne Tipp");
  if (angekommen) await bisZurWarteseite(t, { erwartetFotos: 1, frist: 2000 });
});

szenario("A11 Zurueck und Weg wechseln (Pfeil und Zurueck-Taste)", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await landing(t);
  await zurWahl(t);
  await t.tippe('[data-ls-weg="trup"]');
  await t.schirm("ls-name");
  await t.seite.fill("#ls-namefeld", "Arta");
  await t.seite.goBack();
  t.pruefe((await t.schirm("ls-wahl", 5000)) != null, "Zurueck-Taste vom Namen → Wahl", await t.aktiv());
  await t.tippe('[data-ls-weg="foto"]');
  t.pruefe((await t.schirm("ls-fotopara", 5000)) != null, "Danach Me foto → Anleitung", await t.aktiv());
  await t.tippe("#ls-fotopara [data-zurueck]").catch(async () => { await t.seite.goBack(); });
  t.pruefe((await t.schirm("ls-wahl", 5000)) != null, "Pfeil zurueck → Wahl", await t.aktiv());
  await t.tippe('[data-ls-weg="skanim"]');
  await t.schirm("ls-vorbereitung", 5000);
  await t.tippe("#ls-kameraoeffnen");
  await t.schirm("ls-kamera", 8000);
  await t.warte(() => document.getElementById("ls-video")?.videoWidth > 0, null, 15000);
  await t.seite.goBack();
  const zurueck = await t.warte(() => document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id !== "ls-kamera", null, 5000);
  t.pruefe(zurueck != null, "Zurueck-Taste aus der Kamera verlaesst die Kamera", await t.aktiv());
  const aus = await t.warte(() => {
    const v = document.getElementById("ls-video");
    return !v?.srcObject || v.srcObject.getVideoTracks().every((s) => s.readyState === "ended");
  }, null, 5000);
  t.pruefe(aus != null, "Kamera ist danach aus (Leuchte aus)");
  await t.bild("nach_zurueck");
  const weiter = await t.aktiv();
  t.pruefe(["ls-vorbereitung", "ls-wahl"].includes(weiter), "Kein leerer Bildschirm", weiter);
  const s = t.sitzung();
  t.pruefe(s?.daten?.typ === "scan", "Der zuletzt gewaehlte Weg zaehlt (typ=scan)", s?.daten?.typ);
});

szenario("A12 Direkt aus Chrome zurueck in den Weg (ls_weg=foto)", async (t) => {
  await t.oeffnen({ kamera: "gesicht", ua: UA.androidChrome, breite: 412, hoehe: 915, dpr: 2.625 });
  await t.seite.goto(`${BASIS}/lifeskin?utm_source=ig&ls_weg=foto`, { waitUntil: "commit" });
  const ms = await t.schirm("ls-fotopara", 15000);
  t.pruefe(ms != null, "Chrome oeffnet direkt die Foto-Anleitung (kein zweites Mal Landing + Wahl)", await t.aktiv());
  const url = await t.seite.evaluate(() => location.search);
  t.pruefe(!/ls_weg/.test(url), "ls_weg ist danach aus der Adresse entfernt", url);
  await t.bild("direkt");
  await t.tippe("#ls-fotoweiter");
  const bereit = await t.warte(() => document.getElementById("ls-fotobuehne")?.dataset.bereit === "ja", null, 15000);
  t.pruefe(bereit != null, "Foto-Kamera laeuft in Chrome");
});

szenario("A13 Warteseite im normalen Browser (Link aus WhatsApp) → Therapie", async (t) => {
  const db = neueDatenbank();
  const id = "a1b2c3d4e5f6a7b8";
  db.setze(`lifeskin/lifeskin/reports/${id}`, {
    createdAt: new Date().toISOString(), code: "LS-TEST", name: "Arta", sprache: "sq", typ: "foto", status: "wartet", photos: 1, numri: true
  });
  await t.oeffnen({ kamera: "gesicht", ua: UA.iosSafari, breite: 390, hoehe: 844, dpr: 3, db });
  const ab = Date.now();
  await t.seite.goto(`${BASIS}/analiza/${id}`, { waitUntil: "commit" });
  const inhalt = await t.warte(() => (document.body?.innerText || "").length > 80, null, 15000);
  t.mass("Warteseite: Inhalt steht", inhalt == null ? null : Date.now() - ab);
  await t.bild("warteseite_wartet");
  const text = await t.seite.evaluate(() => (document.body?.innerText || "").replace(/\s+/g, " ").slice(0, 200));
  t.pruefe(inhalt != null && !/nuk u gjet/i.test(text), "Warteseite zeigt den wartenden Fall", text);
  t.pruefe(!/numrin|numër/i.test(await t.seite.evaluate(() => [...document.querySelectorAll("input")].filter((i) => i.offsetParent).map((i) => i.placeholder).join(" "))), "Fragt nicht noch einmal nach der Nummer");
  await freigabeUndTherapie(t, id);
  t.pruefe((await t.querScroll()) <= 1, "Kein seitliches Scrollen");
});

// ---------------------------------------------------------------------------

await kameraVorbereiten();
const ergebnisse = [];
console.log(`\nALLE WEGE VON A BIS Z · ${BASIS}\n`);
for (const { name, fn } of SZENARIEN) {
  if (FILTER && !name.includes(FILTER)) continue;
  console.log(`\n━━ ${name}`);
  const t = new Lauf(name);
  try {
    await fn(t);
  } catch (fehler) {
    t.pruefe(false, "Lauf ohne Abbruch", String(fehler?.message || fehler).split("\n")[0]);
    await t.bild("abbruch");
  }
  if (!t.technik.length && t.db) t.technik = t.technikZeilen();
  if (t.technik.length) console.log(`  Technik: ${t.technik.join(" | ")}`);
  // MediaPipe schreibt seine eigenen Hinweise als console.error ("wasm
  // streaming compile failed ... falling back") - das ist die Bibliothek,
  // die sich selbst hilft, kein Fehler des Trichters.
  const echteFehler = t.jsFehler.filter((f) => !/favicon|ERR_NAME_NOT_RESOLVED|net::ERR_|404|wasm streaming compile|ArrayBuffer instantiation|TensorFlow Lite/.test(f));
  t.pruefe(!echteFehler.length, "Keine JavaScript-Fehler", echteFehler.slice(0, 3).join(" | "));
  const dauer = Math.round((Date.now() - t.start) / 1000);
  ergebnisse.push({ name, dauer, befunde: t.befunde, messungen: t.messungen, technik: t.technik, jsFehler: t.jsFehler });
  await t.zu();
}

const alle = ergebnisse.flatMap((e) => e.befunde);
const schlecht = ergebnisse.flatMap((e) => e.befunde.filter((b) => !b.ok).map((b) => `${e.name}: ${b.text}${b.detail ? ` (${b.detail})` : ""}`));
writeFileSync(`${AUS}/befund.json`, JSON.stringify({ basis: BASIS, zeit: new Date().toISOString(), ergebnisse }, null, 2));
console.log(`\n══ ${alle.length - schlecht.length} von ${alle.length} Pruefungen bestanden`);
for (const s of schlecht) console.log(`   ✗ ${s}`);
console.log(`Bilder und befund.json: ${AUS}`);
