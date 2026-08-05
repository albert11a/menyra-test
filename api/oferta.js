// Die Lead-Landing mit der Vorschau des jeweiligen Lokals.
//
// Warum es diese Funktion ueberhaupt gibt: WhatsApp, Facebook, Instagram und
// die uebrigen holen sich beim Teilen eines Links nur die Antwort des Servers
// und lesen daraus die Vorschau-Auszeichnung. JavaScript fuehren sie nicht
// aus. Die Landing baut ihren Inhalt aber erst im Browser, nachdem sie die
// Daten des Lokals geladen hat - im Augenblick des Teilens steht davon noch
// nichts in der Seite. Ein Logo, das erst der Browser setzt, sieht kein
// einziger dieser Dienste.
//
// Deshalb wird die Auszeichnung hier serverseitig eingesetzt, bevor die Seite
// das Haus verlaesst: Name, Beschreibung und das Logo des Lokals stehen dann
// schon in der ersten Antwort.
//
// Gelesen wird ausschliesslich - dieselben oeffentlichen Dokumente und ueber
// dieselbe REST-Schnittstelle wie in der Landing selbst. Kein Schreibpfad,
// kein Firebase-SDK, kein geteilter Zustand.

import fs from "node:fs";
import path from "node:path";

const PROJECT_ID = "menyra-c0e68";
const API_KEY = "AIzaSyAq5kzdGITDekgajC0uUBny63JjS1DIPEU";
const FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const SITE = "https://www.mnyra.com";
const FALLBACK_IMAGE = `${SITE}/apps/menyra-social/assets/icon-512.png`;
const SHELL_PATH = "apps/menyra-social/lead-landing/index.html";

// Kurz: Eine Vorschau, die spaet kommt, kommt gar nicht - die Dienste warten
// nicht lange. Lieber ohne Logo ausliefern als gar nicht.
const READ_TIMEOUT_MS = 2500;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(...values) {
  for (const value of values) {
    const found = text(value);
    if (found) return found;
  }
  return "";
}

function slugify(value) {
  let slug = text(value).toLowerCase();
  if (!slug) return "";
  try {
    slug = slug.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  } catch {}
  return slug.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
}

function esc(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function requestJson(url, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    try { controller.abort(); } catch {}
  }, READ_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...(init || {}), signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Firestore-REST liefert getypte Werte. Gebraucht wird hier nur, was in einer
// Vorschau vorkommen kann: Text und Listen von Text.
function decodeValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return !!value.booleanValue;
  if ("arrayValue" in value) {
    const list = Array.isArray(value.arrayValue && value.arrayValue.values)
      ? value.arrayValue.values
      : [];
    return list.map(decodeValue);
  }
  if ("mapValue" in value) return decodeFields(value.mapValue && value.mapValue.fields);
  return null;
}

function decodeFields(fields) {
  if (!fields || typeof fields !== "object") return {};
  const out = {};
  Object.keys(fields).forEach((key) => {
    out[key] = decodeValue(fields[key]);
  });
  return out;
}

async function readDoc(docPath) {
  const url = `${FIRESTORE_BASE}/${docPath}?key=${encodeURIComponent(API_KEY)}`;
  const json = await requestJson(url);
  if (!json || json.error) return null;
  return decodeFields(json.fields);
}

function docIdFromName(name) {
  const parts = String(name || "").split("/");
  return parts[parts.length - 1] || "";
}

// Derselbe Weg wie in der Landing: erst der Routen-Index, dann die Doc-ID
// direkt, zuletzt die Feldsuche.
async function resolveRestaurantId(rawKey) {
  const key = text(rawKey);
  if (!key) return "";
  const slug = slugify(key);

  if (slug) {
    const routeDoc = await readDoc(`publicRoutes/${encodeURIComponent(slug)}`);
    const routeId = firstText(routeDoc && routeDoc.restaurantId, routeDoc && routeDoc.canonicalRestaurantId);
    if (routeId) return routeId;
  }

  const direct = await readDoc(`restaurants/${encodeURIComponent(key)}`);
  if (direct) return key;
  if (!slug) return "";

  for (const field of ["publicSlug", "landingSlug"]) {
    const json = await requestJson(
      `${FIRESTORE_BASE}:runQuery?key=${encodeURIComponent(API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        })
      }
    );
    const row = Array.isArray(json) ? json.find((entry) => entry && entry.document) : null;
    const foundId = docIdFromName(row && row.document && row.document.name);
    if (foundId) return foundId;
  }
  return "";
}

function mergePublicMeta(restaurant, meta) {
  const merged = { ...(restaurant || {}) };
  const source = meta || {};
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (value === null || value === undefined) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && !value.length) return;
    merged[key] = value;
  });
  return merged;
}

function resolveTitleImage(source) {
  const raw = source || {};
  const list = Array.isArray(raw.coverImages)
    ? raw.coverImages
    : (Array.isArray(raw.titleImages) ? raw.titleImages : []);
  const fromList = list.map(text).find(Boolean) || "";
  return firstText(raw.titleImageUrl, raw.coverImageUrl, raw.coverUrl, raw.heroUrl, fromList);
}

// Nur was der Browser auch wirklich laden kann. Eine relative oder mit http
// angegebene Adresse wuerde in der Vorschau als leeres Feld enden.
function publicImage(url) {
  const found = text(url);
  return /^https:\/\//i.test(found) ? found : "";
}

async function readProfile(slug) {
  const restaurantId = await resolveRestaurantId(slug);
  if (!restaurantId) return null;

  const encoded = encodeURIComponent(restaurantId);
  const [restaurant, meta] = await Promise.all([
    readDoc(`restaurants/${encoded}`),
    readDoc(`restaurants/${encoded}/public/meta`)
  ]);
  if (!restaurant && !meta) return null;

  const merged = mergePublicMeta(restaurant, meta);
  return {
    restaurantId,
    name: firstText(merged.name, merged.restaurantName),
    city: firstText(merged.city),
    bio: firstText(merged.bio, merged.description),
    // Das Logo zuerst: Es ist quadratisch und bleibt auch als kleines Bildchen
    // neben einer Nachricht erkennbar. Das Titelbild ist breit und wuerde
    // dort auf einen Streifen zusammenfallen.
    image: publicImage(firstText(merged.logoUrl, merged.logo, merged.avatarUrl))
      || publicImage(resolveTitleImage(merged))
  };
}

function buildTags(profile, url) {
  const name = (profile && profile.name) || "Mnyra";
  const title = profile && profile.name ? `${profile.name} - Mnyra` : "Mnyra";
  const parts = [];
  if (profile && profile.bio) parts.push(profile.bio);
  else if (profile && profile.city) parts.push(`${name}, ${profile.city}`);
  parts.push("Profili dhe menuja juaj digjitale ne Mnyra.");
  const description = parts.join(" ").slice(0, 200);
  const image = (profile && profile.image) || FALLBACK_IMAGE;

  return [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Mnyra" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:alt" content="${esc(name)}" />`,
    // WhatsApp zeigt ein kleines Bildchen neben der Nachricht und braucht
    // dafuer keine Grossaufnahme; summary passt zum quadratischen Logo.
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`
  ].join("\n  ");
}

// Die Kennung des Lokals, die hier ohnehin schon ermittelt wurde, wandert mit
// in die Seite.
//
// Ohne sie faengt die Landing im Browser von vorne an: erst den Routen-Index
// fragen, wer dieses Lokal ist, und erst mit der Antwort die eigentlichen
// Daten holen. Das ist eine volle Rundreise, die nur dazu dient, etwas
// herauszufinden, was der Server in derselben Sekunde schon wusste - im
// schwachen Netz eine halbe Sekunde Warten vor einer leeren Seite.
//
// Steht die Zeile nicht da - weil das Lesen ausfiel oder die Datei ohne diesen
// Weg ausgeliefert wird -, sucht die Landing wie bisher selbst. Es ist eine
// Abkuerzung, kein Ersatz.
function buildRestaurantHint(profile) {
  const id = text(profile && profile.restaurantId);
  return id ? `<meta name="ll-restaurant" content="${esc(id)}" />` : "";
}

// Der Rahmen der Seite kommt aus derselben Datei, die auch sonst ausgeliefert
// wird - es gibt keine zweite Fassung, die auseinanderlaufen koennte. Laesst
// sie sich nicht lesen, steht hier ein Notrahmen, damit der Link trotzdem
// oeffnet.
function readShell() {
  try {
    return fs.readFileSync(path.join(process.cwd(), SHELL_PATH), "utf8");
  } catch {
    return null;
  }
}

const FALLBACK_SHELL = `<!doctype html>
<html lang="sq">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#f8f9fa" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Mnyra</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/apps/menyra-social/lead-landing/lead-landing-styles.css" />
</head>
<body>
  <main id="llRoot">
    <div class="ll-boot"><p class="ll-boot__text">Po ngarkohet...</p></div>
  </main>
  <script type="module" src="/apps/menyra-social/lead-landing/lead-landing-app.js"></script>
</body>
</html>`;

function injectTags(html, tags, title) {
  let out = html;
  if (title) out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  if (out.includes("</head>")) return out.replace("</head>", `  ${tags}\n</head>`);
  return `${tags}\n${out}`;
}

function readSlug(req) {
  const fromQuery = text(req && req.query && req.query.slug);
  if (fromQuery) return fromQuery;
  const url = String((req && req.url) || "");
  const match = url.match(/\/oferta\/([^/?#]+)/i);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default async function ofertaHandler(req, res) {
  const slug = readSlug(req);
  const url = `${SITE}/oferta/${encodeURIComponent(slug)}`;

  // Faellt das Lesen aus, wird trotzdem ausgeliefert - dann eben mit dem
  // Zeichen von Mnyra statt mit dem Logo des Lokals. Eine Seite, die wegen
  // einer Vorschau nicht oeffnet, waere der schlechtere Tausch.
  let profile = null;
  if (slug) {
    try {
      profile = await readProfile(slug);
    } catch {
      profile = null;
    }
  }

  const shell = readShell() || FALLBACK_SHELL;
  const title = profile && profile.name ? `${profile.name} - Mnyra` : "";
  const html = injectTags(shell, `${buildTags(profile, url)}\n  ${buildRestaurantHint(profile)}`, title);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Die Dienste merken sich eine Vorschau lange. Kurz zwischenspeichern
  // reicht, damit ein geaendertes Logo binnen Minuten ankommt, und nimmt
  // trotzdem die Last von wiederholten Aufrufen.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(html);
};
