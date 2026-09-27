"use strict";

// AUTO-MODUS: DIE ANALYSE OHNE WARTEN (docs/lifeskin-auto.md).
// ══════════════════════════════════════════════════════════════════════
//
// Von Hand: Heart kopiert den Prompt, er geht mit den Fotos an ChatGPT, die
// Antwort wird eingefuegt und freigegeben. Im Auto-Modus macht das diese
// Function, sobald der Trichter einen Bericht anlegt (status "wartet"):
//
//   1. Schalter in Heart an? (config/ablauf.autoAn) Sonst: nichts tun.
//   2. Sperre je Fall (ablaeufe/<id>, create) und Tageslimit.
//   3. Sitzung, Fotos und Produkte lesen, den Prompt einsetzen - derselbe
//      Prompt und dieselben Fragen wie in Heart (Abschriften in
//      lifeskin-auto/generated/, sync-lifeskin-auto.cjs).
//   4. OpenAI (Responses API), Antwort als JSON.
//   5. shared/lifeskin-auto-befund.js baut daraus den Bericht - oder sagt,
//      warum nicht. Dann bleibt der Fall wartend und landet wie immer in
//      Heart (vorbereitung.stand = "manuell").
//
// Die Warteseite liest vorbereitung.stand und zeigt waehrenddessen die
// Zeitangabe; ist der Bericht "fertig", springt sie auf die Therapieseite.
//
// DER PIXEL WIRD HIER NICHT BERUEHRT (AGENTS.md, Meta-Pixel-Sperre).
//
// ══ VOR DEM ERSTEN LAUF ══
//
//   firebase functions:secrets:set OPENAI_API_KEY
//
// Ohne Secret laesst sich die Function nicht deployen; mit Secret, aber
// ausgeschaltetem Schalter, tut sie nichts.

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const {
  buildEventLogContext,
  logFunctionInfo,
  logFunctionWarn,
  logFunctionError
} = require("./logging");
const {
  einstellungen, fotosWaehlen, baueAnfrage, antwortText, tagVon, kostenUsd, text
} = require("./lifeskin-auto-anfrage");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const GENERIERT = path.join(__dirname, "lifeskin-auto", "generated");
const OPENAI_ZEIT_MS = 240000;
// Die Fotos gehen waehrend der Uebergabe hoch - der Bericht kann vor dem
// letzten Foto dastehen. So lange wird darauf gewartet.
const FOTOS_WARTEN_MS = 60000;

let geladen = null;
async function laden() {
  if (!geladen) {
    const imp = (name) => import(pathToFileURL(path.join(GENERIERT, name)).href);
    geladen = Promise.all([imp("lifeskin-auto-befund.mjs"), imp("lifeskin-prompt.mjs")]).then(([befund, prompt]) => ({
      autoBefund: befund.autoBefund,
      autoArt: befund.autoArt,
      promptV8Fuellen: prompt.promptV8Fuellen,
      fragen: JSON.parse(fs.readFileSync(path.join(GENERIERT, "fragen.json"), "utf8")),
      vorlagen: {
        foto: fs.readFileSync(path.join(GENERIERT, "prompt-foto.txt"), "utf8"),
        "pa-foto": fs.readFileSync(path.join(GENERIERT, "prompt-pa-foto.txt"), "utf8")
      }
    }));
  }
  return geladen;
}

const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

async function fotosLesen(sitzungRef, erwartet) {
  const ende = Date.now() + FOTOS_WARTEN_MS;
  let fotos = [];
  for (;;) {
    const schnitt = await sitzungRef.collection("photos").get();
    fotos = schnitt.docs.map((d) => ({ blick: d.id, ...(d.data() || {}) }));
    if (fotos.length >= erwartet || Date.now() >= ende) return fotos;
    await warte(4000);
  }
}

async function frageOpenAi(anfrage, schluessel) {
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), OPENAI_ZEIT_MS);
  try {
    const antwort = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${schluessel}` },
      body: JSON.stringify(anfrage),
      signal: abbruch.signal
    });
    const daten = await antwort.json().catch(() => ({}));
    if (!antwort.ok) throw new Error(`OpenAI ${antwort.status}: ${daten?.error?.message || "ohne Begruendung"}`);
    return daten;
  } finally {
    clearTimeout(uhr);
  }
}

// Den Stand fuer Warteseite und Heart vermerken - nur, solange der Fall
// noch wartet. Hat jemand in Heart schon von Hand freigegeben, bleibt
// dessen Bericht unangetastet.
async function standSetzen(berichtRef, stand, code = "") {
  return db.runTransaction(async (tx) => {
    const jetzt = await tx.get(berichtRef);
    if (!jetzt.exists || jetzt.data()?.status !== "wartet") return false;
    tx.set(berichtRef, { vorbereitung: { stand, at: new Date().toISOString(), ...(code ? { code } : {}) } }, { merge: true });
    return true;
  });
}

exports.lifeskinAutoAnalyse = functions
  .region("us-central1")
  .runWith({ secrets: ["OPENAI_API_KEY"], timeoutSeconds: 300, memory: "1GB" })
  .firestore.document("lifeskin/{tenantId}/reports/{reportId}")
  .onCreate(async (snapshot, context) => {
    const tenantId = text(context.params?.tenantId);
    const reportId = text(context.params?.reportId);
    const logContext = buildEventLogContext(context, { tenantId, reportId });
    const tenant = db.collection("lifeskin").doc(tenantId);
    const berichtRef = snapshot.ref;
    const ab = Date.now();

    try {
      const bericht = snapshot.data() || {};
      if (bericht.status !== "wartet") return;

      const ablauf = einstellungen((await tenant.collection("config").doc("ablauf").get()).data() || {});
      if (!ablauf.autoAn) return;

      const schluessel = text(process.env.OPENAI_API_KEY);
      if (!schluessel) {
        logFunctionWarn("lifeskin.auto", { ...logContext, status: "skipped", reason: "no_key" });
        return;
      }

      // Die Sperre je Fall - zwei Ausloeser fuer denselben Bericht legen
      // das Dokument nicht zweimal an.
      const tag = tagVon();
      const lauf = tenant.collection("ablaeufe").doc(reportId);
      try {
        await lauf.create({ tag, stand: "laeuft", createdAt: admin.firestore.FieldValue.serverTimestamp() });
      } catch (_schonDa) {
        return;
      }
      const heute = await tenant.collection("ablaeufe").where("tag", "==", tag).count().get();
      if (heute.data().count > ablauf.autoTagesLimit) {
        await lauf.set({ stand: "limit" }, { merge: true });
        await standSetzen(berichtRef, "manuell", "limit");
        logFunctionWarn("lifeskin.auto", { ...logContext, status: "manual", reason: "daily_limit", limit: ablauf.autoTagesLimit });
        return;
      }

      if (!(await standSetzen(berichtRef, "laeuft"))) return;

      const { autoBefund, autoArt, promptV8Fuellen, fragen, vorlagen } = await laden();
      const sitzungRef = tenant.collection("sessions").doc(reportId);
      const sitzung = (await sitzungRef.get()).data() || {};
      const art = autoArt(sitzung);
      const erwartet = Math.max(0, Math.min(Number(bericht.photos) || 0, ablauf.autoMaxFotos));
      const fotos = fotosWaehlen(art === "foto" ? await fotosLesen(sitzungRef, erwartet) : [], ablauf.autoMaxFotos);
      if (art === "foto" && !fotos.length) throw Object.assign(new Error("Keine Fotos."), { code: "fotos" });

      const katalog = (await tenant.collection("products").get()).docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      const prompt = promptV8Fuellen(vorlagen[art], sitzung, katalog, [], fragen);
      const antwort = await frageOpenAi(baueAnfrage({ modell: ablauf.autoModell, prompt, fotos }), schluessel);
      const ergebnis = autoBefund({ antwort: antwortText(antwort), sitzung, katalog });

      const protokoll = {
        ...logContext,
        modell: ablauf.autoModell,
        fotos: fotos.length,
        dauerMs: Date.now() - ab,
        tokensRein: antwort?.usage?.input_tokens,
        tokensRaus: antwort?.usage?.output_tokens,
        kostenUsd: kostenUsd(ablauf.autoModell, antwort?.usage)
      };

      if (!ergebnis.ok) {
        await lauf.set({ stand: "manuell", grund: ergebnis.grund, ...protokoll }, { merge: true });
        await standSetzen(berichtRef, "manuell", "pruefung");
        logFunctionWarn("lifeskin.auto", { ...protokoll, status: "manual", reason: ergebnis.grund });
        return;
      }

      const geschrieben = await db.runTransaction(async (tx) => {
        const jetzt = await tx.get(berichtRef);
        if (!jetzt.exists || jetzt.data()?.status !== "wartet") return false;
        tx.set(berichtRef, {
          ...ergebnis.bericht,
          vorbereitung: { stand: "fertig", at: new Date().toISOString() }
        }, { merge: true });
        return true;
      });
      await lauf.set({ stand: geschrieben ? "fertig" : "uebersprungen", ...protokoll }, { merge: true });
      logFunctionInfo("lifeskin.auto", { ...protokoll, status: geschrieben ? "released" : "skipped_manual_first" });
    } catch (error) {
      logFunctionError("lifeskin.auto", error, { ...logContext, status: "failed", dauerMs: Date.now() - ab });
      try {
        await tenant.collection("ablaeufe").doc(reportId).set({ stand: "fehler", grund: String(error?.message || error).slice(0, 300) }, { merge: true });
        await standSetzen(berichtRef, "manuell", String(error?.code || "fehler"));
      } catch (_egal) {
        // Der Fall steht ohnehin wartend in Heart.
      }
    }
  });
