// DER GEBAUTE STAND, LOKAL - so, wie Vercel ihn ausliefert.
//
// Der Entwicklungsserver (scripts/local-dev-server.mjs) liefert die
// Quelldateien aus. Auf www.mnyra.com laeuft aber dist/: gebuendelt, ohne
// Kommentare, mit anderen Ladewegen. Ein Fehler, der nur im Buendel steckt,
// waere dort unsichtbar. Dieser Server liefert dist/ mit den Umleitungen
// aus vercel.json.
//
//   npm run build
//   node tests/lifeskin-trichter-pruefstand/dist-server.mjs   (Port 5174)
//   BASIS=http://127.0.0.1:5174 node tests/lifeskin-trichter-pruefstand/lauf-wege.mjs

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { readFileSync } from "node:fs";

const WURZEL = resolve(new URL("../../dist", import.meta.url).pathname);
const PORT = Number(process.env.PORT || 5174);
const vercel = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));

const ARTEN = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".mp4": "video/mp4"
};

// "/analiza/:kennung" -> /^\/analiza\/([^/]+)$/ ; ":path*" nimmt den Rest.
const regeln = (vercel.rewrites || [])
  .filter((r) => !/^https?:/.test(r.destination))
  .map((r) => {
    const namen = [];
    const muster = r.source.replace(/:(\w+)\*/g, (_, n) => { namen.push(n); return "(.*)"; })
      .replace(/:(\w+)/g, (_, n) => { namen.push(n); return "([^/]+)"; });
    return { re: new RegExp(`^${muster}$`), namen, ziel: r.destination };
  });

function umleiten(pfad) {
  for (const regel of regeln) {
    const treffer = pfad.match(regel.re);
    if (!treffer) continue;
    let ziel = regel.ziel;
    regel.namen.forEach((n, i) => { ziel = ziel.replace(`:${n}*`, treffer[i + 1]).replace(`:${n}`, treffer[i + 1]); });
    return ziel.split("?")[0];
  }
  return pfad;
}

async function datei(pfad) {
  const voll = resolve(join(WURZEL, decodeURIComponent(pfad)));
  if (voll !== WURZEL && !voll.startsWith(WURZEL + sep)) return null;
  try {
    const info = await stat(voll);
    if (info.isDirectory()) return datei(join(pfad, "index.html"));
    return { voll, inhalt: await readFile(voll) };
  } catch {
    return null;
  }
}

createServer(async (anfrage, antwort) => {
  const url = new URL(anfrage.url, "http://x");
  let gefunden = await datei(url.pathname);
  if (!gefunden) gefunden = await datei(umleiten(url.pathname));
  if (!gefunden) {
    antwort.writeHead(404, { "Content-Type": "text/plain" });
    antwort.end("404");
    return;
  }
  antwort.writeHead(200, {
    "Content-Type": ARTEN[extname(gefunden.voll).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  antwort.end(gefunden.inhalt);
}).listen(PORT, "0.0.0.0", () => console.log(`dist/ auf http://127.0.0.1:${PORT}`));
