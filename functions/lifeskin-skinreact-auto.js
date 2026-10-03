"use strict";

// SKINREACT AUTO-FREIGABE AUF DEM SERVER (03.10., Entscheidung Inhaber).
//
// "Der Timer funktioniert nur, wenn Heart offen ist - der soll normal
// funktionieren, so als waere Heart offen." Derselbe Ablauf wie in Heart
// (apps/mnyra-heart/heart-skinreact-auto.js), nur ohne offenes Geraet:
//
//   1. Ein SkinReact-Scan ist fertig - sein Bericht wird angelegt.
//   2. Steht der Schalter Përputhja auf Auto (config/perputhja) und kam der
//      Scan nach dem Einschalten, wartet diese Funktion WARTEN_MS.
//   3. Dann, in einer Transaktion: Ist der Fall inzwischen gestoppt
//      (skinreactAuto.gestoppt, der Stopp-Knopf in Heart) oder schon
//      freigegeben (Dërgo oder ein offenes Heart), passiert nichts. Sonst
//      steht 95-100 % im Bericht - genau das Feld, das "Dërgo" schreibt.
//
// Ist Heart offen, laeuft dort weiter der Countdown mit Stopp; die
// Transaktion sorgt dafuer, dass nichts doppelt geschrieben wird.

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { buildEventLogContext, logFunctionInfo, logFunctionError } = require("./logging");

if (!admin.apps.length) admin.initializeApp();

const { autoFaellig, frei, freigabe, WARTEN_MS, BEREICH } = require("./lifeskin-skinreact-auto-regeln");

const warte = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

const skinreactAutoFreigabe = functions
  .region("us-central1")
  .runWith({ timeoutSeconds: 60 })
  .firestore.document("lifeskin/{tenantId}/reports/{reportId}")
  .onCreate(async (snapshot, context) => {
    const tenantId = String(context.params?.tenantId || "");
    const reportId = String(context.params?.reportId || "");
    const logContext = buildEventLogContext(context, { tenantId, reportId });
    try {
      const db = admin.firestore();
      const basis = db.collection("lifeskin").doc(tenantId);
      const [einstellungDoc, sitzungDoc] = await Promise.all([
        basis.collection("config").doc("perputhja").get(),
        basis.collection("sessions").doc(reportId).get()
      ]);
      const einstellung = einstellungDoc.exists ? einstellungDoc.data() : null;
      const sitzung = sitzungDoc.exists ? sitzungDoc.data() : null;
      if (!autoFaellig({ einstellung, sitzung, bericht: snapshot.data() || {} })) return;

      // Das Stopp-Fenster - wie der Countdown in Heart.
      await warte(WARTEN_MS);

      const ref = basis.collection("reports").doc(reportId);
      const ergebnis = await db.runTransaction(async (t) => {
        const aktuell = await t.get(ref);
        if (!aktuell.exists || !frei(aktuell.data() || {})) return "uebersprungen";
        // Der Schalter kann in den fuenf Sekunden auf Manuell gegangen sein.
        const jetzt = await t.get(basis.collection("config").doc("perputhja"));
        if (jetzt.data()?.modus !== "auto") return "manuell";
        t.set(ref, freigabe(), { merge: true });
        return "frei";
      });
      logFunctionInfo("lifeskin.skinreact.auto", { ...logContext, status: ergebnis });
    } catch (error) {
      logFunctionError("lifeskin.skinreact.auto", error, { ...logContext, status: "failed" });
      throw error;
    }
  });

module.exports = { skinreactAutoFreigabe, autoFaellig, frei, freigabe, WARTEN_MS, BEREICH };
