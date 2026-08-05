// Aufzeichnung der Lead-Landing: welche Wische gesehen wurden, wie lange, und
// wie die drei Fragen beantwortet wurden.
//
// Warum das hier liegt und nicht als Cloud Function: Zum Deployen einer Cloud
// Function braucht das Dienstkonto die Rolle "Dienstkontonutzer" auf dem
// App-Engine-Konto - die hat es nicht, und es darf sie sich auch nicht selbst
// geben. Schreiben in Firestore darf es dagegen sehr wohl. Also schreibt es
// direkt, ueber dieselbe REST-Schnittstelle, die die Landing zum Lesen nutzt.
// Eine Stelle weniger, die deployt werden muss, und sie liegt neben der
// Funktion, die schon die Vorschau der Landing ausliefert.
//
// Warum ueberhaupt ueber einen Server: Die Landing liest ausschliesslich und
// hat kein Schreibrecht - genau das trennt sie von der echten App. Die
// Firestore-Regeln erlauben Schreiben auf restaurants/** nur Inhabern und CEO.
// Haette man dafuer eine Regel geoeffnet, koennte jeder Sitzungen erfinden.
// Hier schreibt der Server mit dem Dienstkonto, die Seite bleibt ohne.

import crypto from "node:crypto";

const PROJECT_ID = "menyra-c0e68";
const FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const STEP_LIMIT = 40;
const SESSION_MAX_MS = 6 * 60 * 60 * 1000;

function text(value, max = 120) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function millis(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(Math.round(number), SESSION_MAX_MS);
}

function slugify(value) {
  let slug = text(value, 96).toLowerCase();
  if (!slug) return "";
  try {
    slug = slug.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {}
  return slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
}

/* -------------------------------------------------- Zugang zum Dienstkonto */

// Der Schluessel steht in der Umgebung, nicht im Repository - dort waere er
// oeffentlich. Erlaubt sind das rohe JSON oder dasselbe in base64, damit man
// beim Einfuegen in die Oberfläche nicht ueber Zeilenumbrueche stolpert.
function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
  if (!raw) return null;
  const source = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");
  try {
    const parsed = JSON.parse(source);
    return parsed && parsed.client_email && parsed.private_key ? parsed : null;
  } catch {
    return null;
  }
}

// Ein Zugangswort gilt eine Stunde. Zwischen zwei Aufrufen bleibt die Funktion
// oft warm - dann wird es wiederverwendet, statt fuer jede Sitzung ein neues
// zu holen.
let cachedToken = { value: "", expires: 0 };

async function accessToken() {
  if (cachedToken.value && Date.now() < cachedToken.expires) return cachedToken.value;

  const key = readServiceAccount();
  if (!key) return "";

  const now = Math.floor(Date.now() / 1000);
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const head = b64({ alg: "RS256", typ: "JWT" });
  const claim = b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: key.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  });
  const signature = crypto.createSign("RSA-SHA256")
    .update(`${head}.${claim}`)
    .sign(key.private_key, "base64url");

  const response = await fetch(key.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${head}.${claim}.${signature}`
    })
  });
  if (!response.ok) return "";
  const json = await response.json();
  if (!json.access_token) return "";

  // Eine Minute vor Ablauf gilt es als abgelaufen - sonst faellt ein Aufruf
  // genau in die Luecke.
  cachedToken = { value: json.access_token, expires: Date.now() + ((json.expires_in || 3600) - 60) * 1000 };
  return cachedToken.value;
}

/* ------------------------------------------------ Firestore ueber REST */

function toValue(value) {
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") return { integerValue: String(Math.round(value)) };
  if (typeof value === "boolean") return { booleanValue: value };
  if (value && typeof value === "object") {
    const fields = {};
    Object.keys(value).forEach((key) => { fields[key] = toValue(value[key]); });
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

function fromValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("timestampValue" in value) return value.timestampValue;
  return null;
}

async function firestore(path, init) {
  const token = await accessToken();
  if (!token) return { ok: false, status: 500, json: null };
  const response = await fetch(`${FIRESTORE_BASE}/${path}`, {
    ...(init || {}),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...((init && init.headers) || {})
    }
  });
  let json = null;
  try {
    json = await response.json();
  } catch {}
  return { ok: response.ok, status: response.status, json };
}

async function runQuery(body) {
  const token = await accessToken();
  if (!token) return [];
  const response = await fetch(`${FIRESTORE_BASE}:runQuery`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) return [];
  try {
    return await response.json();
  } catch {
    return [];
  }
}

// Derselbe Weg wie in der Landing und in der Vorschau: erst der Routen-Index,
// dann die Doc-ID direkt, zuletzt die Feldsuche.
async function resolveRestaurantId(rawKey) {
  const key = text(rawKey, 96);
  if (!key) return "";
  const slug = slugify(key);

  if (slug) {
    const route = await firestore(`publicRoutes/${encodeURIComponent(slug)}`);
    if (route.ok && route.json && route.json.fields) {
      const found = fromValue(route.json.fields.restaurantId)
        || fromValue(route.json.fields.canonicalRestaurantId);
      if (text(found)) return text(found);
    }
  }

  const direct = await firestore(`restaurants/${encodeURIComponent(key)}`);
  if (direct.ok) return key;
  if (!slug) return "";

  for (const field of ["publicSlug", "landingSlug"]) {
    const rows = await runQuery({
      structuredQuery: {
        from: [{ collectionId: "restaurants" }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: "EQUAL",
            value: { stringValue: slug }
          }
        },
        limit: 1
      }
    });
    const row = Array.isArray(rows) ? rows.find((entry) => entry && entry.document) : null;
    const name = row && row.document && row.document.name;
    if (name) return String(name).split("/").pop();
  }
  return "";
}

/* --------------------------------------------------------- Was ankommt */

// Nur bekannte Formen kommen durch: Schluessel kurz und schlicht, Werte
// Zahlen, Antworten "po" oder "jo". Ohne das koennte jemand beliebige Felder
// in das Dokument schreiben.
function cleanSteps(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const out = {};
  Object.keys(source).slice(0, STEP_LIMIT).forEach((key) => {
    const name = text(key, 48);
    if (!name || !/^[a-z0-9-]+$/.test(name)) return;
    out[name] = millis(source[key]);
  });
  return out;
}

function cleanAnswers(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const out = {};
  Object.keys(source).slice(0, 12).forEach((key) => {
    const name = text(key, 24);
    const value = text(source[key], 24);
    if (!name || !/^[a-z0-9]+$/.test(name)) return;
    if (value !== "po" && value !== "jo") return;
    out[name] = value;
  });
  return out;
}

function readBody(req) {
  let body = req && req.body;
  // sendBeacon schickt beim Schliessen der Seite - dabei kommt der Koerper je
  // nach Browser als Text und nicht als geparstes JSON an.
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body && typeof body === "object" ? body : null;
}

export default async function landingTrackHandler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const body = readBody(req);
  if (!body) {
    res.status(400).json({ ok: false, error: "Bad payload" });
    return;
  }

  // Bewusst ungekuerzt geprueft. Wuerde erst gekuerzt und dann geprueft,
  // fiele ein ungueltiges Zeichen am Ende einfach weg und der Rest kaeme
  // durch - und zwei verschiedene lange Kennungen landeten auf derselben
  // Sitzung.
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId || sessionId.length > 64 || !/^[A-Za-z0-9_-]+$/.test(sessionId)) {
    res.status(400).json({ ok: false, error: "Bad session" });
    return;
  }

  if (!readServiceAccount()) {
    // Ohne Zugang wird nichts geschrieben - aber die Seite soll davon nichts
    // merken. Sie kann es ohnehin nicht aendern.
    res.status(503).json({ ok: false, error: "Not configured" });
    return;
  }

  try {
    const restaurantId = await resolveRestaurantId(body.slug);
    if (!restaurantId) {
      res.status(404).json({ ok: false, error: "Unknown restaurant" });
      return;
    }

    const steps = cleanSteps(body.steps);
    const answers = cleanAnswers(body.answers);
    const outcomeRaw = text(body.outcome, 8);
    const outcome = outcomeRaw === "yes" || outcomeRaw === "no" ? outcomeRaw : "";
    const nowIso = new Date().toISOString();

    const docPath = `restaurants/${encodeURIComponent(restaurantId)}/landingSessions/${encodeURIComponent(sessionId)}`;
    const existing = await firestore(docPath);

    const fields = {
      slug: toValue(text(body.slug, 72)),
      steps: toValue(steps),
      stepCount: toValue(Object.keys(steps).length),
      answers: toValue(answers),
      answerCount: toValue(Object.keys(answers).length),
      outcome: toValue(outcome),
      totalMs: toValue(millis(body.totalMs)),
      updatedAt: toValue(nowIso)
    };

    // Der erste Zeitpunkt bleibt der erste. Wuerde er bei jeder Sendung neu
    // gesetzt, waere "wann war das" immer der Moment, in dem die Seite
    // geschlossen wurde - und eine Sitzung von gestern saehe aus wie eine von
    // eben.
    if (!existing.ok) fields.startedAt = toValue(nowIso);

    // Die Feldliste im updateMask macht daraus ein Zusammenfuehren: Was nicht
    // genannt ist, bleibt stehen. steps und answers stehen drin und werden
    // deshalb ganz ersetzt - die Seite schickt ohnehin immer den ganzen Stand.
    const mask = Object.keys(fields).map((key) => `updateMask.fieldPaths=${key}`).join("&");
    const written = await firestore(`${docPath}?${mask}`, {
      method: "PATCH",
      body: JSON.stringify({ fields })
    });

    if (!written.ok) {
      res.status(502).json({ ok: false, error: "Write failed" });
      return;
    }
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Failed" });
  }
}
