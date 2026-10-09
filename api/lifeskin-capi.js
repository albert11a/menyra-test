// DIE CONVERSIONS API VOM SERVER - Kauf und Lead, sofort, ohne Functions-Deploy.
//
// Warum es das hier gibt (01.10.): Die Cloud Function lifeskinCapiPurchase
// haengt an einem Deploy, der seit dem 16.09. nie durchlief (das Geheimnis
// FIREBASE_SERVICE_ACCOUNT fehlt). Was in ihr seitdem dazukam - User-Agent,
// Klick-Kennung aus dem ersten Besuch, kein Senden von Testbestellungen -
// stand nie in der Produktion. Dieser Weg geht mit jedem Push auf main
// live, wie die Seite selbst (Vercel). Pixel-Aenderung erlaubt von Albert am
// 01.10.2026: CAPI v26.0, Lead zusaetzlich vom Server.
//
// WIE: Die Seite stoesst an, sobald Bestellung oder Nummer in Firestore
// stehen (shared/lifeskin-capi-anstossen.js). Hier wird nichts aus der
// Anfrage geglaubt, was ein Ereignis ausmacht: OB gemeldet wird, welcher
// Betrag, welche Kennung - das steht in der Sitzung, die diese Funktion
// selbst liest. Aus der Anfrage kommen nur die Angaben des Browsers, die
// auch der Pixel an Meta schickt (fbp, fbc, User-Agent, Adresse, Seite).
//
// NIE DOPPELT. Meta legt zwei gleiche Ereignisse VOM SERVER nicht zusammen
// (nur Browser + Server). Deshalb eine Marke je Ereignis in
// lifeskin/{tenant}/capiEvents - dieselbe, die die Cloud Function schreibt:
// Wer sie zuerst ANLEGT, sendet. Ein zweiter Versuch nur, wenn Meta
// ausdruecklich abgelehnt hat (dann kam nichts an); bei einer verlorenen
// Antwort nicht - ein doppelter Kauf in der Messung ist schlimmer als ein
// fehlender.
//
// NIE EIN FEHLER FUER DEN KUNDEN: Die Seite wartet nicht auf diese Antwort.
//
// EINRICHTUNG, EINMAL: In Vercel unter Settings -> Environment Variables
// META_CAPI_TOKEN (Ereignismanager -> LF WEB -> Einstellungen ->
// Conversions API -> Zugriffstoken). MNYRA_FIREBASE_ADMIN_KEY steht dort
// schon (api/lifeskin-meldung.js). Ob alles da ist und das Token gilt,
// zeigt GET /api/lifeskin-capi.

import crypto from "node:crypto";
// STATISCH importiert, nicht ueber createRequire: Nur so findet Vercel die
// Datei beim Buendeln (@vercel/nft) - mit createRequire fehlte sie im Paket,
// und die Funktion brach beim Laden ab (FUNCTION_INVOCATION_FAILED, 01.10.).
import capi from "../functions/lifeskin-capi-payload.js";

const PROJEKT = "menyra-c0e68";
const TENANT = "lifeskin";
const DOKUMENTE = `https://firestore.googleapis.com/v1/projects/${PROJEKT}/databases/(default)/documents`;
const KENNUNG = /^[A-Za-z0-9_-]{6,80}$/;
// Ein Kauf wird hoechstens so lange nach dem Speichern noch gemeldet (die
// Seite versucht es dreimal binnen gut einer Minute) - ein Lead nur, solange
// die Sitzung frisch ist. Aeltere Faelle (vor diesem Weg) bleiben still.
const KAUF_FENSTER_MS = 24 * 3600 * 1000;
const LEAD_FENSTER_MS = 30 * 60 * 1000;
const HOECHSTENS_VERSUCHE = 3;
const LEASE_MS = 30000;

function googleFetch(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
}

// ── Schluessel und Zugang (wie api/lifeskin-meldung.js) ─────────────────
let zugang = { token: "", bis: 0 };

function schluessel() {
  const roh = String(process.env.MNYRA_FIREBASE_ADMIN_KEY || "").trim();
  if (!roh) return null;
  try {
    const k = JSON.parse(roh);
    return k.client_email && k.private_key ? k : null;
  } catch {
    return null;
  }
}

async function zugangHolen(k) {
  if (zugang.token && Date.now() < zugang.bis - 60000) return zugang.token;
  const b64 = (x) => Buffer.from(typeof x === "string" ? x : JSON.stringify(x)).toString("base64url");
  const jetzt = Math.floor(Date.now() / 1000);
  const kopf = b64({ alg: "RS256", typ: "JWT" });
  const last = b64({
    iss: k.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    iat: jetzt,
    exp: jetzt + 3600
  });
  const signatur = crypto.createSign("RSA-SHA256").update(`${kopf}.${last}`).sign(k.private_key, "base64url");
  const antwort = await googleFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${kopf}.${last}.${signatur}`
  });
  const daten = await antwort.json();
  if (!daten.access_token) throw new Error(`Kein Zugang: ${antwort.status}`);
  zugang = { token: daten.access_token, bis: Date.now() + (Number(daten.expires_in) || 3600) * 1000 };
  return zugang.token;
}

// ── Firestore-REST ──────────────────────────────────────────────────────
function wert(f) {
  if (!f || typeof f !== "object") return null;
  if ("stringValue" in f) return f.stringValue;
  if ("integerValue" in f) return Number(f.integerValue);
  if ("doubleValue" in f) return f.doubleValue;
  if ("booleanValue" in f) return f.booleanValue;
  if ("timestampValue" in f) return f.timestampValue;
  if ("mapValue" in f) {
    const o = {};
    for (const [k, v] of Object.entries(f.mapValue.fields || {})) o[k] = wert(v);
    return o;
  }
  if ("arrayValue" in f) return (f.arrayValue.values || []).map(wert);
  return null;
}

function feld(v) {
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  // Die Angaben des Browsers in der Marke (fbp, fbc, ua, ip, seite) als
  // Karte. Bis zum 09.10. wurden sie zu Text ("[object Object]"), und jede
  // Wiederholung (lifeskinCapiRetry) ging ohne IP und Kennungen an Meta.
  // Pixel-Aenderung erlaubt von Albert am 09.10.2026.
  if (v && typeof v === "object" && !Array.isArray(v)) return { mapValue: { fields: felder(v) } };
  return { stringValue: String(v ?? "") };
}

const felder = (daten) => Object.fromEntries(Object.entries(daten).map(([k, v]) => [k, feld(v)]));

async function lies(pfad, token) {
  const antwort = await googleFetch(`${DOKUMENTE}/${pfad}`, { headers: { authorization: `Bearer ${token}` } });
  if (antwort.status === 404) return null;
  if (!antwort.ok) throw new Error(`Lesen ${antwort.status}`);
  return antwort.json();
}

async function aendern(pfad, daten, token, updateTime = "") {
  const maske = Object.keys(daten).map((k) => `updateMask.fieldPaths=${k}`).join("&");
  const bedingung = updateTime ? `&currentDocument.updateTime=${encodeURIComponent(updateTime)}` : "";
  const antwort = await googleFetch(`${DOKUMENTE}/${pfad}?${maske}${bedingung}`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ fields: felder(daten) })
  });
  if (antwort.status === 409 || antwort.status === 412) return false;
  if (!antwort.ok) throw new Error(`Marke speichern ${antwort.status}`);
  return true;
}

// ── Die Entscheidungen, rein und pruefbar ───────────────────────────────

// Was fuer diese Sitzung auf diesen Anstoss hin faellig ist.
export function ereignisseFuer(sitzung, art, { jetzt = Date.now() } = {}) {
  if (!sitzung || typeof sitzung !== "object") return [];
  // Pixel-Aenderung erlaubt von Albert am 07.10.2026: nur nach "Pranoj"
  // im Cookie-Fenster (device.zustimmung).
  if (!capi.metaErlaubt(sitzung)) return [];
  if (art === "kauf") {
    const order = sitzung.order || {};
    const gespeichert = Date.parse(String(order.createdAt || ""));
    if (sitzung.step !== capi.SCHRITT_KAUF || !order.orderId) return [];
    // Eigene Probelaeufe aus dem stillen Modus gehen nie an Meta.
    if (order.still === true) return [];
    if (!Number.isFinite(gespeichert) || jetzt - gespeichert > KAUF_FENSTER_MS) return [];
    return ["kauf"];
  }
  if (art === "warten") {
    const geaendert = Date.parse(String(sitzung.updatedAt || ""));
    if (!["result", "offer", "address", "ordered"].includes(sitzung.step)
      || sitzung.order?.still === true || !capi.warteKennung(sitzung.code)) return [];
    if (!Number.isFinite(geaendert) || jetzt - geaendert > LEAD_FENSTER_MS) return [];
    return ["warten"];
  }
  if (art === "lead") {
    const geaendert = Date.parse(String(sitzung.updatedAt || ""));
    const angelegt = Date.parse(String(sitzung.createdAt || ""));
    if (!capi.istLead(sitzung) || !capi.leadKennung(sitzung.code)) return [];
    if (!Number.isFinite(geaendert) || jetzt - geaendert > LEAD_FENSTER_MS) return [];
    // Meta nimmt nichts, was aelter als sieben Tage ist.
    if (!Number.isFinite(angelegt) || jetzt - angelegt > 7 * 24 * 3600 * 1000) return [];
    return ["lead"];
  }
  return [];
}

// Darf DIESER Aufruf eine vorhandene Marke uebernehmen? Nur, wenn Meta
// ausdruecklich abgelehnt hat und noch Versuche frei sind. Eine Marke ohne
// Stand legte die Cloud Function an - sie gehoert ihr.
export function markeUebernehmen(marke) {
  return marke?.status === "fehler" && Number(marke?.versuche || 0) < HOECHSTENS_VERSUCHE;
}

export function markenKennung(art, sessionId) {
  return art === "lead" ? `${sessionId}_lead` : art === "warten" ? `${sessionId}_waiting` : sessionId;
}

// ── Meta ────────────────────────────────────────────────────────────────
async function anMeta(nutzlast, metaToken) {
  const koerper = { data: [nutzlast] };
  const testCode = String(process.env.META_CAPI_TEST_CODE || "").trim();
  if (testCode) koerper.test_event_code = testCode;
  let antwort;
  try {
    antwort = await googleFetch(
      `https://graph.facebook.com/${capi.API_VERSION}/${capi.PIXEL_ID}/events?access_token=${encodeURIComponent(metaToken)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(koerper) }
    );
  } catch (fehler) {
    // Keine Antwort: Ob Meta es hat, weiss niemand. Kein zweiter Versuch.
    return { stand: "unklar", fehler: String(fehler?.message || fehler).slice(0, 200) };
  }
  const gelesen = await antwort.json().catch(() => ({}));
  if (antwort.ok && Number(gelesen?.events_received) >= 1) return { stand: "gesendet", angenommen: Number(gelesen.events_received) };
  if (antwort.ok) return { stand: "unklar", fehler: "ohne events_received" };
  return { stand: "fehler", fehler: `Meta ${antwort.status}: ${String(gelesen?.error?.message || "").slice(0, 160)}` };
}

// Eine Marke anlegen oder (nach einer Ablehnung) uebernehmen. Gibt die
// Versuchszahl zurueck oder 0, wenn ein anderer schon sendet oder gesendet hat.
async function markeNehmen(pfad, docId, nutzlast, token, browser) {
  const jetzt = new Date().toISOString();
  const anlegen = await googleFetch(`${DOKUMENTE}/${pfad}?documentId=${encodeURIComponent(docId)}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ fields: {
      ...felder({ status: "laeuft", versuche: 1, leaseUntil: Date.now() + LEASE_MS, eventId: nutzlast.event_id,
        browser, ...(nutzlast.custom_data ? { value: nutzlast.custom_data.value } : {}), eventName: nutzlast.event_name, eventTime: nutzlast.event_time, sessionId: docId.replace(/_(lead|waiting)$/, ""), sender: "vercel" }),
      createdAt: { timestampValue: jetzt }
    } })
  });
  if (anlegen.ok) return 1;
  if (anlegen.status !== 409) throw new Error(`Marke anlegen ${anlegen.status}`);
  const vorhanden = await lies(`${pfad}/${docId}`, token);
  const marke = Object.fromEntries(Object.entries(vorhanden?.fields || {}).map(([k, v]) => [k, wert(v)]));
  if (!markeUebernehmen(marke) || !vorhanden?.updateTime
    || marke.eventId !== nutzlast.event_id) return 0;
  if (Number.isFinite(Number(marke.eventTime))) nutzlast.event_time = Number(marke.eventTime);
  if (nutzlast.custom_data && Number.isFinite(Number(marke.value))) nutzlast.custom_data.value = Number(marke.value);
  const versuche = Number(marke.versuche || 0) + 1;
  return (await aendern(`${pfad}/${docId}`, { status: "laeuft", versuche, leaseUntil: Date.now() + LEASE_MS }, token, vorhanden.updateTime))
    ? versuche : 0;
}

// ── Diagnose: GET zeigt, ob alles eingerichtet ist - ohne ein Geheimnis ──
//
// WAS ZAEHLT, IST DAS SENDEN. Bis zum 01.10. fragte die Diagnose, ob der
// Token den Pixel LESEN darf (Name, letzte Aktivitaet). Ein Token aus dem
// Ereignismanager darf oft nur senden - "(#100) Missing Permission" hiess
// dann "kaputt", obwohl jedes Ereignis ankam. Jetzt:
//   - tokenGilt: Meta kennt den Token (GET /me) - nicht abgelaufen, nicht falsch
//   - letzte: was Meta bei den letzten echten Ereignissen geantwortet hat
//     (Stand je Marke in capiEvents: gesendet / fehler mit Grund / unklar).
//     Ohne Fallnummer, ohne Kennung, ohne Person.
// Testereignisse werden NICHT gesendet: Auch mit test_event_code zaehlt Meta
// sie als echte Daten.
let metaBlick = { bis: 0, daten: null };
let markenBlick = { bis: 0, daten: null };
// Fuer Tests: den Zwischenspeicher der Diagnose leeren.
export function diagnoseVergessen() {
  metaBlick = { bis: 0, daten: null };
  markenBlick = { bis: 0, daten: null };
}

async function letzteMarken() {
  if (Date.now() < markenBlick.bis) return markenBlick.daten;
  const k = schluessel();
  if (!k) return null;
  try {
    const token = await zugangHolen(k);
    const antwort = await googleFetch(`${DOKUMENTE}/lifeskin/${TENANT}:runQuery`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: "capiEvents" }],
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 10
      } })
    });
    if (!antwort.ok) throw new Error(`Lesen ${antwort.status}`);
    const zeilen = await antwort.json();
    const daten = (zeilen || []).filter((z) => z.document).map((z) => {
      const f = Object.fromEntries(Object.entries(z.document.fields || {}).map(([n, v]) => [n, wert(v)]));
      return {
        ereignis: f.eventName || "Purchase",
        // Ohne Stand legte die Marke die Cloud Function an.
        sender: f.sender || "cloud-function",
        stand: f.status || "von-cloud-function",
        zeit: f.zeit || f.createdAt || "",
        ...(f.fehler ? { fehler: String(f.fehler).slice(0, 160) } : {}),
        ...(f.status === "gesendet" ? { mitPh: f.mitPh === true, mitFbc: f.mitFbc === true, mitUa: f.mitUa === true, mitIp: f.mitIp === true } : {})
      };
    });
    markenBlick = { bis: Date.now() + 30000, daten };
    return daten;
  } catch (fehler) {
    markenBlick = { bis: Date.now() + 15000, daten: { fehler: String(fehler?.message || fehler).slice(0, 120) } };
    return markenBlick.daten;
  }
}

async function diagnose() {
  const metaToken = String(process.env.META_CAPI_TOKEN || "").trim();
  const raus = {
    ok: true,
    version: capi.API_VERSION,
    pixel: capi.PIXEL_ID,
    firebaseSchluessel: Boolean(schluessel()),
    metaToken: Boolean(metaToken),
    testModus: Boolean(String(process.env.META_CAPI_TEST_CODE || "").trim())
  };
  if (!metaToken) return { ...raus, ok: false, letzte: await letzteMarken() };
  if (Date.now() > metaBlick.bis) {
    try {
      const antwort = await googleFetch(`https://graph.facebook.com/${capi.API_VERSION}/me?fields=id&access_token=${encodeURIComponent(metaToken)}`);
      const gelesen = await antwort.json().catch(() => ({}));
      metaBlick = {
        bis: Date.now() + 60000,
        daten: antwort.ok
          ? { tokenGilt: true }
          : { tokenGilt: false, fehler: String(gelesen?.error?.message || antwort.status).slice(0, 160) }
      };
    } catch (fehler) {
      metaBlick = { bis: Date.now() + 15000, daten: { tokenGilt: null, fehler: String(fehler?.message || fehler).slice(0, 120) } };
    }
  }
  const letzte = await letzteMarken();
  const abgelehnt = Array.isArray(letzte) && letzte.length > 0 && letzte.every((m) => m.stand === "fehler");
  return { ...raus, meta: metaBlick.daten, letzte, ok: metaBlick.daten?.tokenGilt !== false && !abgelehnt };
}

export default async function lifeskinCapi(req, res) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("content-type", "application/json");
  if (req.method === "GET") {
    res.statusCode = 200;
    res.end(JSON.stringify(await diagnose()));
    return;
  }
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  let koerper = req.body;
  if (typeof koerper === "string") {
    try { koerper = JSON.parse(koerper); } catch { koerper = {}; }
  }
  const id = String(koerper?.id || "").trim();
  const art = String(koerper?.art || "").trim();
  if (!KENNUNG.test(id) || !["kauf", "lead", "warten"].includes(art)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, grund: "anfrage" }));
    return;
  }
  const k = schluessel();
  const metaToken = String(process.env.META_CAPI_TOKEN || "").trim();
  // Nicht eingerichtet ist kein Fehler, den ein zweiter Versuch behebt (4xx).
  if (!k || !metaToken) {
    res.statusCode = 424;
    res.end(JSON.stringify({ ok: false, grund: !k ? "kein-firebase-schluessel" : "kein-meta-token" }));
    return;
  }
  try {
    const token = await zugangHolen(k);
    const dok = await lies(`lifeskin/${TENANT}/sessions/${id}`, token);
    const sitzung = dok ? Object.fromEntries(Object.entries(dok.fields || {}).map(([f, v]) => [f, wert(v)])) : null;
    const browser = capi.browserAusAnfrage({
      fbp: koerper?.fbp, fbc: koerper?.fbc, seite: koerper?.seite,
      ua: req.headers?.["user-agent"], ip: req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"]
    });
    const ergebnisse = [];
    for (const ereignis of ereignisseFuer(sitzung, art)) {
      const nutzlast = ereignis === "kauf" ? capi.baueKauf(sitzung, { browser }) : ereignis === "warten" ? capi.baueWarten(sitzung, { browser }) : capi.baueLead(sitzung, { browser });
      if (!nutzlast.event_id) continue;
      const pfad = `lifeskin/${TENANT}/capiEvents`;
      const docId = markenKennung(ereignis, id);
      const versuch = await markeNehmen(pfad, docId, nutzlast, token, browser);
      if (!versuch) { ergebnisse.push({ ereignis, stand: "schon" }); continue; }
      const ergebnis = await anMeta(nutzlast, metaToken);
      await aendern(`${pfad}/${docId}`, {
        status: ergebnis.stand, leaseUntil: 0, zeit: new Date().toISOString(),
        ...(ergebnis.angenommen ? { angenommen: ergebnis.angenommen } : {}),
        ...(ergebnis.fehler ? { fehler: ergebnis.fehler } : {}),
        mitPh: Boolean(nutzlast.user_data.ph?.length),
        mitFbp: Boolean(nutzlast.user_data.fbp), mitFbc: Boolean(nutzlast.user_data.fbc),
        mitUa: Boolean(nutzlast.user_data.client_user_agent), mitIp: Boolean(nutzlast.user_data.client_ip_address)
      }, token).catch(() => {});
      ergebnisse.push({ ereignis, stand: ergebnis.stand, versuch });
    }
    // Meta hat abgelehnt: 503, damit die Seite es noch einmal versucht.
    const abgelehnt = ergebnisse.some((e) => e.stand === "fehler");
    res.statusCode = abgelehnt ? 503 : 200;
    res.end(JSON.stringify({ ok: !abgelehnt, ergebnisse }));
  } catch (fehler) {
    console.error("[lifeskin-capi]", fehler?.message || fehler);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false }));
  }
}
