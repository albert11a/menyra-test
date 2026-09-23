// DIE MELDUNG SOFORT - neue Analyse, neue Bestellung, aufs Telefon.
//
// Warum es das hier gibt: Die Cloud Function notifyCeoOnLifeskinSessionWrite
// ist nie deployt worden, und der Waechter in GitHub Actions laeuft statt
// alle 15 Minuten oft nur alle paar Stunden. Eine Bestellung um 21:17 kam
// so nie als Meldung an.
//
// Die Seite des Patienten stoesst diese Funktion an, sobald der Schritt
// "result" (Analyse abgeschickt) oder "ordered" (Bestellung) GESCHRIEBEN
// ist (shared/lifeskin-melden.js). Hier wird nichts aus der Anfrage
// geglaubt ausser der Kennung: Welcher Schritt, welcher Name, ob ueberhaupt
// gemeldet wird - das liest die Funktion selbst aus Firestore, mit
// denselben Regeln wie der Waechter (scripts/meldungs-waechter/
// meldungs-regeln.mjs):
//
//   - nur Sitzungen, die wirklich bei "result"/"ordered" stehen,
//   - nur innerhalb von 45 Minuten nach der letzten Aenderung,
//   - jede Meldung genau einmal: Das Meldungsdokument wird ANGELEGT, und
//     steht es schon da (Waechter, Cloud Function oder ein zweiter Aufruf),
//     wird nichts geschickt.
//
// Wer die Adresse kennt, kann also hoechstens eine echte, frische Meldung
// frueher ausloesen - nie eine erfundene und nie eine doppelte.
//
// EINRICHTUNG, EINMAL: In Vercel unter Settings -> Environment Variables
// die Variable MNYRA_FIREBASE_ADMIN_KEY anlegen, Inhalt: der ganze
// JSON-Schluessel des Firebase-Admin-SDK. Ohne sie antwortet die Funktion
// 503 und tut nichts - die Seite des Patienten merkt davon nichts.
//
// Ohne firebase-admin: nur REST und node:crypto. Vercel installiert mit
// --omit=dev, und das Admin-SDK steht nur in den devDependencies.

import crypto from "node:crypto";
import {
  baueMeldung,
  faelligeMeldungen,
  meldungsKennung
} from "../scripts/meldungs-waechter/meldungs-regeln.mjs";

const PROJEKT = "menyra-c0e68";
const CEO_UID = "aklBkkIuZ7Nrpx266TJn63rrxX62";
const TENANT = "lifeskin";
const DOKUMENTE = `https://firestore.googleapis.com/v1/projects/${PROJEKT}/databases/(default)/documents`;
const FCM = `https://fcm.googleapis.com/v1/projects/${PROJEKT}/messages:send`;
const START = "https://mnyra.com";
const ICON = "/apps/mnyra-heart/assets/icon-192.png?v=2026-03-20-heart-icon-normal-2";
const KENNUNG = /^[A-Za-z0-9_-]{6,80}$/;

// ── Schluessel und Zugang ───────────────────────────────────────────────
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
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: jetzt,
    exp: jetzt + 3600
  });
  const signatur = crypto.createSign("RSA-SHA256").update(`${kopf}.${last}`).sign(k.private_key, "base64url");
  const antwort = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${kopf}.${last}.${signatur}`
  });
  const daten = await antwort.json();
  if (!daten.access_token) throw new Error(`Kein Zugang: ${antwort.status}`);
  zugang = { token: daten.access_token, bis: Date.now() + (Number(daten.expires_in) || 3600) * 1000 };
  return zugang.token;
}

// ── Firestore-REST in beide Richtungen ──────────────────────────────────
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
  return { stringValue: String(v ?? "") };
}

async function lies(pfad, token) {
  const antwort = await fetch(`${DOKUMENTE}/${pfad}`, { headers: { authorization: `Bearer ${token}` } });
  if (antwort.status === 404) return null;
  if (!antwort.ok) throw new Error(`Lesen ${antwort.status}`);
  return antwort.json();
}

async function empfaenger(token) {
  const uids = new Set([CEO_UID]);
  try {
    const liste = await lies("superadmins?pageSize=20", token);
    for (const d of liste?.documents || []) uids.add(d.name.split("/").pop());
  } catch { /* der feste Empfaenger reicht */ }
  return [...uids];
}

// Anlegen, nicht schreiben: 409 heisst "schon gemeldet".
async function meldungAnlegen(uid, kennung, nutzlast, token) {
  const felder = Object.fromEntries(Object.entries(nutzlast).map(([k, v]) => [k, feld(v)]));
  const jetzt = new Date().toISOString();
  felder.createdAt = { timestampValue: jetzt };
  felder.updatedAt = { timestampValue: jetzt };
  const antwort = await fetch(`${DOKUMENTE}/users/${uid}/notifications?documentId=${encodeURIComponent(kennung)}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ fields: felder })
  });
  if (antwort.status === 409) return false;
  if (!antwort.ok) throw new Error(`Meldung anlegen ${antwort.status}`);
  return true;
}

async function geraete(uid, token) {
  const antwort = await fetch(`${DOKUMENTE}/users/${uid}:runQuery`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ structuredQuery: {
      from: [{ collectionId: "devices" }],
      where: { fieldFilter: { field: { fieldPath: "enabled" }, op: "EQUAL", value: { booleanValue: true } } },
      limit: 30
    } })
  });
  if (!antwort.ok) return [];
  const zeilen = await antwort.json();
  const raus = new Map();
  for (const z of zeilen || []) {
    const t = String(wert(z.document?.fields?.token) || "").trim();
    if (t && !raus.has(t)) raus.set(t, z.document.name);
  }
  return [...raus].map(([t, name]) => ({ token: t, name }));
}

async function schicken(uid, kennung, nutzlast, token) {
  let gesendet = 0;
  for (const g of await geraete(uid, token)) {
    const antwort = await fetch(FCM, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ message: {
        token: g.token,
        notification: { title: "LifeSkin", body: nutzlast.text },
        data: { notificationId: kennung, userId: uid, type: nutzlast.type, link: nutzlast.link },
        webpush: {
          fcm_options: { link: `${START}${nutzlast.link}` },
          notification: {
            title: "LifeSkin", body: nutzlast.text, icon: ICON, badge: ICON,
            renotify: true, vibrate: [180, 90, 180],
            // Dieselbe Marke wie Waechter und Cloud Function: kommt es
            // doch zweimal, legt das Telefon die Meldungen uebereinander.
            tag: `menyra_notif_${kennung}`
          }
        }
      } })
    });
    if (antwort.ok) { gesendet += 1; continue; }
    // Tote Geraete stilllegen, wie der Waechter.
    if (antwort.status === 404 || antwort.status === 400) {
      const pfad = g.name.split("/documents/")[1];
      await fetch(`${DOKUMENTE}/${pfad}?updateMask.fieldPaths=enabled&updateMask.fieldPaths=token&updateMask.fieldPaths=lastErrorCode`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ fields: { enabled: { booleanValue: false }, token: { stringValue: "" }, lastErrorCode: { stringValue: `fcm-${antwort.status}` } } })
      }).catch(() => {});
    }
  }
  return gesendet;
}

// ── Die Entscheidung, rein und pruefbar ─────────────────────────────────
// Was fuer diese Sitzung jetzt gemeldet wird. Eine Bestellung aus dem
// stillen Modus (order.still) ist ein Test und weckt kein Telefon.
export function meldungenFuer(sitzung, jetzt = Date.now()) {
  const faellig = faelligeMeldungen(sitzung, { jetzt });
  return sitzung?.order?.still === true ? faellig.filter((v) => v.type !== "lifeskin_porosia") : faellig;
}

export default async function lifeskinMeldung(req, res) {
  res.setHeader("cache-control", "no-store");
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
  if (!KENNUNG.test(id)) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, grund: "kennung" }));
    return;
  }
  const k = schluessel();
  if (!k) {
    res.statusCode = 503;
    res.end(JSON.stringify({ ok: false, grund: "kein-schluessel" }));
    return;
  }
  try {
    const token = await zugangHolen(k);
    const dok = await lies(`lifeskin/${TENANT}/sessions/${id}`, token);
    const sitzung = dok ? Object.fromEntries(Object.entries(dok.fields || {}).map(([f, v]) => [f, wert(v)])) : null;
    const faellig = sitzung ? meldungenFuer(sitzung) : [];
    let gemeldet = 0;
    if (faellig.length) {
      const ziele = await empfaenger(token);
      for (const vorlage of faellig) {
        const kennung = meldungsKennung(vorlage.type, id);
        for (const uid of ziele) {
          const nutzlast = { ...baueMeldung({ vorlage, sessionId: id, sitzung, uid }), source: "sofort" };
          if (!(await meldungAnlegen(uid, kennung, nutzlast, token))) continue;
          await schicken(uid, kennung, nutzlast, token);
          gemeldet += 1;
        }
      }
    }
    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, gemeldet }));
  } catch (fehler) {
    console.error("[lifeskin-meldung]", fehler?.message || fehler);
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false }));
  }
}
