// DAS LAGER DER AKTION - wie viele Sets noch da sind (08.10., Inhaber).
//
// Der Laden zeigt "Vetëm edhe 2 sete në stok". Damit die Zahl fuer jeden
// Besucher dieselbe und echt ist, zaehlt diese Funktion die echten
// Bestellungen aus dem Laden seit Beginn der Aktion (order.burimi =
// "lifeskinshop", ohne stille und Test-Bestellungen) und zieht sie vom
// Anfangsbestand ab. Zurueck geht NUR die Zahl - keine Namen, keine
// Nummern, keine Bestellungen.
//
// Bestellungen per WhatsApp oder Instagram sieht die Funktion nicht. Geht
// dort ein Set weg, muss LAGER_START unten angepasst werden.
//
// Schluessel wie api/lifeskin-meldung.js: MNYRA_FIREBASE_ADMIN_KEY in Vercel.
// Ohne ihn antwortet die Funktion 503, und der Laden zeigt keine Lagerzeile.

import crypto from "node:crypto";

// Anfangsbestand und Beginn der Aktion (Inhaber, 08.10.2026, 19:28 Kosovo).
export const LAGER_START = { sete: 2, ab: "2026-10-08T17:28:00.000Z" };

const PROJEKT = "menyra-c0e68";
const DOKUMENTE = `https://firestore.googleapis.com/v1/projects/${PROJEKT}/databases/(default)/documents`;
let zugang = { token: "", bis: 0 };

function schluessel() {
  try {
    const k = JSON.parse(String(process.env.MNYRA_FIREBASE_ADMIN_KEY || "").trim() || "null");
    return k?.client_email && k?.private_key ? k : null;
  } catch {
    return null;
  }
}

async function zugangHolen(k) {
  if (zugang.token && Date.now() < zugang.bis - 60000) return zugang.token;
  const b64 = (x) => Buffer.from(typeof x === "string" ? x : JSON.stringify(x)).toString("base64url");
  const jetzt = Math.floor(Date.now() / 1000);
  const kopf = b64({ alg: "RS256", typ: "JWT" });
  const last = b64({ iss: k.client_email, scope: "https://www.googleapis.com/auth/datastore", aud: "https://oauth2.googleapis.com/token", iat: jetzt, exp: jetzt + 3600 });
  const signatur = crypto.createSign("RSA-SHA256").update(`${kopf}.${last}`).sign(k.private_key, "base64url");
  const antwort = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${kopf}.${last}.${signatur}`,
    signal: AbortSignal.timeout(10000)
  });
  const daten = await antwort.json();
  if (!daten.access_token) throw new Error(`Kein Zugang: ${antwort.status}`);
  zugang = { token: daten.access_token, bis: Date.now() + (Number(daten.expires_in) || 3600) * 1000 };
  return zugang.token;
}

const text = (f) => (f && typeof f === "object" && "stringValue" in f ? f.stringValue : "");
const wahr = (f) => Boolean(f && typeof f === "object" && f.booleanValue === true);

// Zaehlt eine Sitzung als echte Bestellung aus dem Laden seit Beginn?
export function istLagerBestellung(felder, ab = LAGER_START.ab) {
  const order = felder?.order?.mapValue?.fields || {};
  if (text(order.burimi) !== "lifeskinshop") return false;
  if (wahr(order.still)) return false;
  const kampagne = text(felder?.source?.mapValue?.fields?.utmCampaign).trim().toLowerCase();
  if (kampagne === "test") return false;
  return text(order.createdAt) >= ab;
}

export function restSete(anzahl, start = LAGER_START.sete) {
  return Math.max(0, start - anzahl);
}

export default async function lifeskinLager(req, res) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  // Kurz zwischenspeichern: alle Besucher sehen dieselbe Zahl, hoechstens
  // ~20 s alt, und Firestore wird nicht bei jedem Besuch gefragt.
  res.setHeader("cache-control", "public, s-maxage=20, stale-while-revalidate=20");
  const k = schluessel();
  if (!k) {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  try {
    const token = await zugangHolen(k);
    const antwort = await fetch(`${DOKUMENTE}/lifeskin/lifeskin:runQuery`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: "sessions" }],
        where: { fieldFilter: { field: { fieldPath: "order.createdAt" }, op: "GREATER_THAN_OR_EQUAL", value: { stringValue: LAGER_START.ab } } },
        select: { fields: [{ fieldPath: "order.burimi" }, { fieldPath: "order.still" }, { fieldPath: "order.createdAt" }, { fieldPath: "source.utmCampaign" }] },
        limit: 300
      } }),
      signal: AbortSignal.timeout(10000)
    });
    if (!antwort.ok) throw new Error(`Lesen ${antwort.status}`);
    const zeilen = await antwort.json();
    const bestellt = zeilen.filter((z) => z.document && istLagerBestellung(z.document.fields)).length;
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, sete: restSete(bestellt) }));
  } catch {
    res.statusCode = 502;
    res.end(JSON.stringify({ ok: false }));
  }
}
