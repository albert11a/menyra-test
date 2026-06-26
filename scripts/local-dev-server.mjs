import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");
const PORT = Number(process.env.PORT || process.argv.find((arg) => /^--port=/.test(arg))?.split("=")?.[1] || 5173);
const HOST = process.env.HOST || "0.0.0.0";
const SOCIAL_INDEX = "/apps/menyra-social/index.html";
const HEART_INDEX = "/apps/mnyra-heart/index.html";
const WAITER_INDEX = "/apps/waiter/index.html";

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".map", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"]
]);

const SOCIAL_ROUTES = new Set([
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
  "/ceo",
  "/admin",
  "/owner",
  "/staff",
  "/kitchen",
  "/business-accounts",
  "/businessaccounts",
  "/chat",
  "/login",
  "/register"
]);

function isHeartPrettyRoutePath(pathname = "") {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  return path === "/leads"
    || path === "/customers"
    || path === "/admin/staff"
    || path.startsWith("/admin/staff/");
}

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  res.end(body);
}

function hasExtension(pathname = "") {
  return !!extname(pathname.split("/").pop() || "");
}

function safeResolve(publicPath = "") {
  const rawPath = decodeURIComponent(String(publicPath || "/"));
  const cleaned = normalize(rawPath).replace(/^([.][.][/\\])+/, "");
  const absolute = resolve(ROOT, cleaned.replace(/^[/\\]+/, ""));
  const rootWithSep = ROOT.endsWith(sep) ? ROOT : `${ROOT}${sep}`;
  if (absolute !== ROOT && !absolute.startsWith(rootWithSep)) return "";
  return absolute;
}

function fileExists(publicPath = "") {
  const absolute = safeResolve(publicPath);
  if (!absolute) return false;
  try {
    return existsSync(absolute) && statSync(absolute).isFile();
  } catch {
    return false;
  }
}

function resolveFilePath(publicPath = "") {
  const absolute = safeResolve(publicPath);
  if (!absolute) return "";
  try {
    if (existsSync(absolute) && statSync(absolute).isFile()) return absolute;
    if (existsSync(absolute) && statSync(absolute).isDirectory()) {
      const indexFile = join(absolute, "index.html");
      if (existsSync(indexFile) && statSync(indexFile).isFile()) return indexFile;
    }
  } catch {}
  return "";
}

function rewritePath(pathname = "/") {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return SOCIAL_INDEX;
  if (path === "/discover") return "/search";
  if (path === "/social") return "/feed";
  if (path === "/hub") return "/hub/index.html";
  if (path === "/heart") return HEART_INDEX;
  if (path.startsWith("/heart/")) {
    const mapped = `/apps/mnyra-heart/${path.slice("/heart/".length)}`;
    return fileExists(mapped) ? mapped : HEART_INDEX;
  }
  if (path === "/waiter") return WAITER_INDEX;
  if (path === "/waiter/sw.js") return "/apps/waiter/sw.js";
  if (path === "/waiter/manifest.webmanifest") return "/apps/waiter/manifest.webmanifest";
  if (path.startsWith("/waiter/")) return WAITER_INDEX;
  if (path.startsWith("/apps/menyra-ceo/")) return SOCIAL_INDEX;
  if (path.startsWith("/apps/menyra-owner/")) return SOCIAL_INDEX;
  if (path.startsWith("/apps/menyra-staff/")) return SOCIAL_INDEX;
  if (path.startsWith("/apps/menyra-restaurants/")) return SOCIAL_INDEX;
  if (path.startsWith("/menyra-restaurants/")) return SOCIAL_INDEX;
  if (path.startsWith("/social/")) return `/apps/menyra-social/${path.slice("/social/".length)}`;

  if (isHeartPrettyRoutePath(path)) return HEART_INDEX;
  if (SOCIAL_ROUTES.has(path)) return SOCIAL_INDEX;
  if (/^\/(ceo|admin|owner|staff|kitchen)\//.test(path)) return SOCIAL_INDEX;
  if (/^\/lp\/[^/]+$/.test(path)) return SOCIAL_INDEX;
  if (/^\/user\/[^/]+(\/[^/]+)?$/.test(path)) return SOCIAL_INDEX;

  // Public business/profile routes like /moka-coffee or /moka-coffee/menu.
  // Only rewrite extensionless routes. Real files with extensions should 404 if missing.
  if (!hasExtension(path) && path.split("/").filter(Boolean).length <= 2) {
    return SOCIAL_INDEX;
  }

  return pathname;
}

function serveFile(req, res, filePath = "") {
  if (!filePath) {
    send(res, 404, "Not found");
    return;
  }
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES.get(ext) || "application/octet-stream";
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store"
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(filePath).on("error", () => {
    if (!res.headersSent) send(res, 500, "Read error");
    else res.destroy();
  }).pipe(res);
}

const server = createServer((req, res) => {
  if (!["GET", "HEAD"].includes(req.method || "")) {
    send(res, 405, "Method not allowed");
    return;
  }

  let url;
  try {
    url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  } catch {
    send(res, 400, "Bad request");
    return;
  }

  const pathname = decodeURIComponent(url.pathname || "/");
  const directFile = resolveFilePath(pathname);
  if (directFile) {
    serveFile(req, res, directFile);
    return;
  }

  const rewritten = rewritePath(pathname);
  const rewrittenFile = resolveFilePath(rewritten);
  if (rewrittenFile) {
    serveFile(req, res, rewrittenFile);
    return;
  }

  send(res, 404, `Cannot GET ${pathname}`);
});

server.listen(PORT, HOST, () => {
  console.log(`Mnyra local web server running on http://localhost:${PORT}`);
  console.log("Routes like /feed, /profile, /moka/menu, /waiter, /heart, /leads, /customers and /admin/staff work locally.");
});
