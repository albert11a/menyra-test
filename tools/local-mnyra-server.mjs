import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const socialIndex = path.join(root, "apps", "menyra-social", "index.html");

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".mjs", "application/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".map", "application/json; charset=utf-8"]
]);

const SPA_PREFIXES = [
  "/feed",
  "/search",
  "/map",
  "/location",
  "/profile",
  "/menu",
  "/orders",
  "/notifications",
  "/settings",
  "/upload",
  "/leads",
  "/ceo",
  "/admin",
  "/owner",
  "/staff",
  "/kitchen",
  "/customers",
  "/business-accounts",
  "/businessaccounts",
  "/chat",
  "/login",
  "/register",
  "/user/",
  "/lp/"
];

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    ...headers
  });
  res.end(body);
}

function sendFile(res, filePath, status = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 404, "not found", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, status, data, {
      "Content-Type": MIME_TYPES.get(ext) || "application/octet-stream"
    });
  });
}

function resolveStaticFile(pathname = "") {
  const relative = pathname.replace(/^\/+/, "");
  const candidate = path.resolve(root, relative);
  if (!candidate.startsWith(root)) return "";
  if (!fs.existsSync(candidate)) return "";
  if (!fs.statSync(candidate).isFile()) return "";
  return candidate;
}

function isSpaRoute(pathname = "") {
  if (!pathname || pathname === "/") return true;
  if (SPA_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return true;
  return /^\/[^./]+(?:\/(?:menu|posts|post|profile|home|overview|qr))?$/i.test(pathname);
}

function buildLegacyRedirect(pathname = "", search = "") {
  const businessMatch = pathname.match(/^\/b\/([^/]+)(?:\/(menu|posts|post|profile|home|overview|qr))?\/?$/i);
  if (!businessMatch) return "";
  const slug = businessMatch[1];
  const surface = String(businessMatch[2] || "").toLowerCase();
  if (surface === "qr") {
    const params = new URLSearchParams(search || "");
    if (!params.get("src")) params.set("src", "qr");
    return `/${slug}/menu?${params.toString()}`;
  }
  if (surface === "menu") return `/${slug}/menu${search || ""}`;
  return `/${slug}${search || ""}`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname || "/");
  if (pathname === "/") {
    send(res, 302, "", { Location: "/feed" });
    return;
  }

  const legacyRedirect = buildLegacyRedirect(pathname, url.search);
  if (legacyRedirect) {
    send(res, 302, "", { Location: legacyRedirect });
    return;
  }

  const staticFile = resolveStaticFile(pathname);
  if (staticFile) {
    sendFile(res, staticFile);
    return;
  }

  if (isSpaRoute(pathname)) {
    sendFile(res, socialIndex);
    return;
  }

  send(res, 404, "not found", { "Content-Type": "text/plain; charset=utf-8" });
});

server.listen(port, host, () => {
  console.log(`Mnyra local web server running at http://${host}:${port}`);
  console.log(`Try: http://${host}:${port}/casarita/menu?src=qr&table=7`);
});
