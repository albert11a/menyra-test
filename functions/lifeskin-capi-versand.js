"use strict";

// Pixel-Aenderung erlaubt von Albert am 02.10.2026:
// gemeinsame Sperre fuer Firebase/Vercel, dauerhafte Wiederholung nach
// ausdruecklicher Ablehnung. Unklare Antworten werden nie blind wiederholt.
const { API_VERSION, PIXEL_ID } = require("./lifeskin-capi-payload");
const HOECHSTENS_VERSUCHE = 3;
const FENSTER_MS = 24 * 60 * 60 * 1000;

function darfWiederholen(marke, jetzt = Date.now()) {
  return marke?.status === "fehler"
    && Number(marke.versuche || 0) < HOECHSTENS_VERSUCHE
    && Number(marke.eventTime) * 1000 > jetzt - FENSTER_MS;
}

async function senden(nutzlast, token, { fetchFn = globalThis.fetch, testCode = "" } = {}) {
  let antwort;
  try {
    antwort = await fetchFn(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [nutzlast], ...(testCode ? { test_event_code: testCode } : {}) }),
        signal: AbortSignal.timeout(15000) }
    );
  } catch (fehler) {
    return { status: "unklar", fehler: String(fehler.message || fehler).slice(0, 160) };
  }
  const daten = await antwort.json().catch(() => ({}));
  if (antwort.ok && Number(daten.events_received) >= 1) {
    return { status: "gesendet", angenommen: Number(daten.events_received) };
  }
  if (antwort.ok) return { status: "unklar", fehler: "ohne events_received" };
  return { status: "fehler", fehler: `Meta ${antwort.status}: ${String(daten.error?.message || "").slice(0, 120)}` };
}

async function versenden({ db, marke, sessionId, nutzlast, token, jetzt = Date.now(), fetchFn, testCode = "" }) {
  if (!token || !nutzlast.event_id) return { status: "skipped" };
  // Firestore wiederholt nur die Transaktion, niemals den Meta-Aufruf.
  const versuche = await db.runTransaction(async (tx) => {
    const dok = await tx.get(marke);
    if (dok.exists) {
      const alt = dok.data();
      if (alt.eventId !== nutzlast.event_id || !darfWiederholen(alt, jetzt)) return 0;
      tx.update(marke, { status: "laeuft", versuche: Number(alt.versuche || 0) + 1,
        sender: "firebase", leaseUntil: jetzt + 30000 });
      return Number(alt.versuche || 0) + 1;
    }
    tx.create(marke, { status: "laeuft", versuche: 1, sender: "firebase", sessionId,
      eventId: nutzlast.event_id, eventName: nutzlast.event_name, eventTime: nutzlast.event_time,
      ...(nutzlast.custom_data ? { value: nutzlast.custom_data.value } : {}),
      createdAt: new Date(jetzt), leaseUntil: jetzt + 30000 });
    return 1;
  });
  if (!versuche) return { status: "duplicate" };
  const ergebnis = await senden(nutzlast, token, { fetchFn, testCode });
  await marke.update({ ...ergebnis, zeit: new Date(jetzt).toISOString(), leaseUntil: 0,
    mitPh: Boolean(nutzlast.user_data.ph?.length), mitFbp: Boolean(nutzlast.user_data.fbp),
    mitFbc: Boolean(nutzlast.user_data.fbc), mitUa: Boolean(nutzlast.user_data.client_user_agent),
    mitIp: Boolean(nutzlast.user_data.client_ip_address) });
  return { ...ergebnis, versuche };
}

module.exports = { darfWiederholen, senden, versenden };
