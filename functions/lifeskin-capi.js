"use strict";

// Pixel-Aenderung erlaubt von Albert am 02.10.2026: Warteseite zusaetzlich
// vom Server; fehlgeschlagene Kaufmeldungen dauerhaft und begrenzt erneut.
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { buildEventLogContext, logFunctionInfo, logFunctionError } = require("./logging");
const { text, baueKauf, istKauf, baueWarten, istWarten, baueLead } = require("./lifeskin-capi-payload");
const { versenden, darfWiederholen } = require("./lifeskin-capi-versand");
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

async function melden(tenantId, sessionId, nutzlast, logContext) {
  const suffix = nutzlast.event_name === "lifeskin_waiting_reached" ? "_waiting" : "";
  const marke = db.collection("lifeskin").doc(tenantId).collection("capiEvents").doc(`${sessionId}${suffix}`);
  const ergebnis = await versenden({ db, marke, sessionId, nutzlast,
    token: text(process.env.META_CAPI_TOKEN), testCode: text(process.env.META_CAPI_TEST_CODE) });
  logFunctionInfo("lifeskin.capi", { ...logContext, ...ergebnis, eventName: nutzlast.event_name });
}

function ausloeser(pruefen, bauen) {
  return functions.region("us-central1").runWith({ secrets: ["META_CAPI_TOKEN"], failurePolicy: true })
    .firestore.document("lifeskin/{tenantId}/sessions/{sessionId}")
    .onWrite(async (change, context) => {
      const tenantId = text(context.params?.tenantId);
      const sessionId = text(context.params?.sessionId);
      const logContext = buildEventLogContext(context, { tenantId, sessionId });
      if (!sessionId || !change?.after?.exists) return;
      const davor = change.before?.exists ? change.before.data() || {} : {};
      const danach = change.after.data() || {};
      if (!pruefen(davor, danach)) return;
      try { await melden(tenantId, sessionId, bauen(danach), logContext); }
      catch (fehler) {
        // Firestore-Ausfall: Event-Auslieferung erneut versuchen.
        // Existierende laeuft/unklar/gesendet-Marken verhindern erneutes Senden.
        logFunctionError("lifeskin.capi", fehler, logContext);
        throw fehler;
      }
    });
}

exports.lifeskinCapiPurchase = ausloeser(istKauf, baueKauf);
exports.lifeskinCapiWaiting = ausloeser(istWarten, baueWarten);

// Auch Vercel-Fehler ueberleben das Schliessen des Kunden-Browsers.
// Eine einfache Feldabfrage braucht keinen neuen zusammengesetzten Index.
exports.lifeskinCapiRetry = functions.region("us-central1")
  .runWith({ secrets: ["META_CAPI_TOKEN"], timeoutSeconds: 120 })
  .pubsub.schedule("every 5 minutes").onRun(async () => {
    if (!text(process.env.META_CAPI_TOKEN)) return;
    const sammlung = db.collection("lifeskin").doc("lifeskin").collection("capiEvents");
    const fehler = await sammlung.where("status", "==", "fehler").limit(50).get();
    // Begrenzt parallel: maximal 50 * 15s / 10 = 75s Netzwerkzeit.
    for (let ab = 0; ab < fehler.docs.length; ab += 10) {
      await Promise.all(fehler.docs.slice(ab, ab + 10).map(async (dok) => {
        try {
          const stand = dok.data();
          if (!darfWiederholen(stand)) {
            await db.runTransaction(async (tx) => {
              const aktuell = await tx.get(dok.ref);
              if (aktuell.data()?.status === "fehler" && !darfWiederholen(aktuell.data())) {
                tx.update(dok.ref, { status: "aufgegeben" });
              }
            });
            return;
          }
          const sessionId = text(stand.sessionId);
          if (!sessionId) return; // historische Marken ohne Wiederholungsdaten
          const sitzung = await db.collection("lifeskin").doc("lifeskin").collection("sessions").doc(sessionId).get();
          if (!sitzung.exists) return;
          const daten = sitzung.data();
          const bau = { Purchase: baueKauf, Lead: baueLead, lifeskin_waiting_reached: baueWarten }[stand.eventName];
          if (!bau || daten.order?.still === true) return;
          const nutzlast = bau(daten, { browser: stand.browser || null });
          if (nutzlast.event_id !== stand.eventId) return;
          if (stand.eventName === "Purchase" && Number.isFinite(stand.value)) nutzlast.custom_data.value = stand.value;
          nutzlast.event_time = stand.eventTime; // Originalzeit bleibt bei jeder Wiederholung erhalten.
          const ergebnis = await versenden({ db, marke: dok.ref, sessionId, nutzlast,
            token: text(process.env.META_CAPI_TOKEN), testCode: text(process.env.META_CAPI_TEST_CODE) });
          logFunctionInfo("lifeskin.capi.retry", { ...ergebnis, eventName: stand.eventName });
        } catch (error) { logFunctionError("lifeskin.capi.retry", error, {}); }
      }));
    }
  });
