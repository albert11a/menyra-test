"use strict";

// Die Conversions API von Meta - die Bestellung ein zweites Mal, vom Server.
// ══════════════════════════════════════════════════════════════════════
//
// WARUM ZWEIMAL. Der Pixel im Browser verliert 20 bis 40 Prozent der
// Bestellungen: iOS, Werbeblocker, Tracking-Schutz, ein Browser, der
// geschlossen wird, bevor die Meldung raus ist. Was Meta nicht sieht,
// kann es nicht zuordnen - und was es nicht zuordnet, lernt keine
// Anzeigengruppe. Bei Instagram-Verkehr aus der Region liegt der Verlust
// eher am oberen Rand.
//
// Der Server verliert nichts davon. Er meldet dieselbe Bestellung noch
// einmal, und Meta legt die zwei zusammen - wenn sie dieselbe eventID
// tragen. Genau die haengt seit jeher am Kauf im Browser
// (order.orderId), also passt sie ohne Umbau.
//
// KEINE TELEFONNUMMER, KEIN NAME, AUCH NICHT GEHASHT. Meta verlangt
// mindestens eine Angabe darueber, wer das war, sonst verwirft es das
// Ereignis. Was hier mitgeht, sind zwei Cookies, die Metas eigenes
// Skript im Browser gesetzt hat (_fbp, _fbc) - sie beschreiben den
// Browser, stammen von Meta und gehen an Meta zurueck. Das ist der
// Unterschied zu Advanced Matching, das auf dieser Seite nicht
// stattfindet.
//
// SIE HAELT NIE EINEN VERKAUF AUF. Sie laeuft NACH dem Schreiben, in
// einem eigenen Ausloeser; faellt sie aus, steht die Bestellung
// trotzdem. Jeder Fehler wird notiert und sonst nichts.
//
// ══ WAS VOR DEM ERSTEN LAUF PASSIEREN MUSS ══
//
//   firebase functions:secrets:set META_CAPI_TOKEN
//
// Das Token kommt aus dem Ereignismanager: Datensatz LF WEB →
// Einstellungen → Conversions API → Zugriffstoken generieren. Ohne
// Secret passiert hier nichts - dieselbe Regel wie beim Pixel im
// Browser: Keine Kennung, keine Meldung.

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {
  buildEventLogContext,
  logFunctionInfo,
  logFunctionWarn,
  logFunctionError
} = require("./logging");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Was gesendet wird, steht nebenan - in einer Datei ohne Netz und ohne
// firebase-functions, damit sich ohne Emulator pruefen laesst, WAS das
// Haus verlaesst.
const {
  PIXEL_ID,
  API_VERSION,
  text,
  baueKauf,
  istKauf
} = require("./lifeskin-capi-payload");

async function sendeAnMeta(nutzlast, token, testCode) {
  const koerper = { data: [nutzlast] };
  if (testCode) koerper.test_event_code = testCode;

  const antwort = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(koerper)
    }
  );
  const gelesen = await antwort.json().catch(() => ({}));
  if (!antwort.ok) {
    const fehler = new Error(
      `Meta ${antwort.status}: ${gelesen?.error?.message || "ohne Begruendung"}`
    );
    fehler.metaCode = gelesen?.error?.code;
    throw fehler;
  }
  return gelesen;
}

// ══ DER AUSLOESER ═══════════════════════════════════════════════════
//
// onWrite auf derselben Sammlung wie die Meldung an Dr. Gashi, aber eine
// EIGENE Funktion: Eine ausgefallene Messung darf die Benachrichtigung
// nicht mitreissen, und andersherum genauso.
//
// GEGEN DOPPELTES SENDEN gibt es zwei Netze. Das erste ist der Vergleich
// mit dem Stand davor (istKauf) - der Trichter schreibt auch nach der
// Bestellung weiter. Das zweite ist eine Marke in einer eigenen
// Sammlung, geschrieben mit create(): Zwei gleichzeitige Ausloeser
// koennen denselben Schritt sehen, aber nur einer legt das Dokument an.
//
// DIE MARKE LIEGT NICHT IN DER SITZUNG, und das ist wichtig:
// firestore.rules prueft die Sitzung mit hasOnly gegen eine feste
// Feldliste. Ein Feld, das der Server dazuschreibt, stuende beim
// naechsten Schreibvorgang des Browsers mit im Dokument - und die Regel
// wiese ihn ab. Der Trichter waere ab da stumm, und niemand wuesste,
// warum.
exports.lifeskinCapiPurchase = functions
  .region("us-central1")
  .runWith({ secrets: ["META_CAPI_TOKEN"] })
  .firestore.document("lifeskin/{tenantId}/sessions/{sessionId}")
  .onWrite(async (change, context) => {
    const tenantId = text(context.params?.tenantId);
    const sessionId = text(context.params?.sessionId);
    const logContext = buildEventLogContext(context, { tenantId, sessionId });

    try {
      if (!sessionId || !change?.after?.exists) return;

      const davor = change.before?.exists ? (change.before.data() || {}) : {};
      const danach = change.after.data() || {};
      if (!istKauf(davor, danach)) return;

      const token = text(process.env.META_CAPI_TOKEN);
      if (!token) {
        // Kein Secret, keine Meldung - dieselbe Regel wie beim Pixel im
        // Browser. Eine Warnung und kein Fehler: Solange das Token nicht
        // gesetzt ist, ist das der gewollte Zustand.
        logFunctionWarn("lifeskin.capi.purchase", {
          ...logContext,
          status: "skipped",
          reason: "no_token"
        });
        return;
      }

      const nutzlast = baueKauf(danach);
      if (!nutzlast.event_id) {
        logFunctionWarn("lifeskin.capi.purchase", {
          ...logContext,
          status: "skipped",
          reason: "no_event_id"
        });
        return;
      }

      // Das zweite Netz. create() wirft, wenn es das Dokument schon gibt -
      // und genau das ist die Sperre.
      const marke = db
        .collection("lifeskin").doc(tenantId)
        .collection("capiEvents").doc(sessionId);
      try {
        await marke.create({
          eventId: nutzlast.event_id,
          eventTime: nutzlast.event_time,
          value: nutzlast.custom_data.value,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (_schonDa) {
        logFunctionInfo("lifeskin.capi.purchase", {
          ...logContext,
          status: "duplicate",
          eventId: nutzlast.event_id
        });
        return;
      }

      const antwort = await sendeAnMeta(
        nutzlast,
        token,
        text(process.env.META_CAPI_TEST_CODE)
      );

      logFunctionInfo("lifeskin.capi.purchase", {
        ...logContext,
        status: "sent",
        eventId: nutzlast.event_id,
        value: nutzlast.custom_data.value,
        // Metas eigene Zaehlung dessen, was es angenommen hat.
        received: antwort?.events_received,
        mitFbp: Boolean(nutzlast.user_data.fbp),
        mitFbc: Boolean(nutzlast.user_data.fbc)
      });
    } catch (error) {
      // Die Marke bleibt stehen, auch wenn das Senden schiefging.
      //
      // Das ist eine Entscheidung und kein Versehen: Ein zweiter Versuch
      // koennte ein Purchase doppelt melden, wenn der erste zwar
      // ankam, aber die Antwort verloren ging - und ein doppelter Kauf
      // in der Messung ist schlimmer als ein fehlender. Was hier
      // ausfaellt, steht im Protokoll und faellt nur dort auf.
      logFunctionError("lifeskin.capi.purchase", error, {
        ...logContext,
        status: "failed",
        metaCode: error?.metaCode
      });
    }
  });

