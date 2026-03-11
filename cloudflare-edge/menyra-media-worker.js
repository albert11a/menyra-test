// =========================================================
// MENYRA - Cloudflare Worker (R2 Media)
// Endpoints:
//   POST /image/upload  (multipart/form-data: file, restaurantId)
//   POST /story/upload  (multipart/form-data: file, restaurantId)
//   POST /story/delete  (json: { videoId })
// Env:
//   MEDIA_BUCKET (R2 binding)
//   R2_PUBLIC_BASE (e.g. https://pub-xxxx.r2.dev)
//   ALLOWED_ORIGINS (comma-separated)
//   MEDIA_ACTION_TICKET_SECRET (shared with Firebase Functions)
//   MAX_IMAGE_MB (default 15)
//   MAX_STORY_MB (default 50)
//   STORY_TTL_HOURS (default 24)
// =========================================================

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...headers
    }
  });
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin, env) {
  const allowed = getAllowedOrigins(env);
  if (!allowed.length) {
    return {
      "access-control-allow-origin": origin || "*",
      "access-control-allow-methods": "POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization,x-mnyra-media-ticket"
    };
  }

  const matches = allowed.some((entry) => {
    if (!origin) return false;
    if (entry === "*") return true;
    const cleaned = entry.replace(/\/+$/, "");
    if (!cleaned) return false;

    if (cleaned.startsWith("*.") || cleaned.startsWith(".")) {
      const suffix = cleaned.replace(/^\*\./, ".").toLowerCase();
      try {
        return new URL(origin).hostname.toLowerCase().endsWith(suffix);
      } catch {
        return origin.toLowerCase().endsWith(suffix);
      }
    }

    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      return cleaned === origin;
    }

    try {
      const host = new URL(origin).hostname.toLowerCase();
      return cleaned.toLowerCase() === host;
    } catch {
      return false;
    }
  });

  return matches
    ? {
        "access-control-allow-origin": allowed.includes("*") ? "*" : origin,
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type,authorization,x-mnyra-media-ticket"
      }
    : {};
}

function safeId(input) {
  return String(input || "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 80) || "general";
}

function randomToken() {
  return Math.random().toString(36).slice(2, 10);
}

function extFromMime(mime, fallback) {
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/ogg": "ogv"
  };
  return map[String(mime || "").toLowerCase()] || fallback || "bin";
}

function clampMb(value, fallback) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return num;
}

function publicBase(env) {
  return String(env.R2_PUBLIC_BASE || "").replace(/\/+$/, "");
}

function parsePositiveInt(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < min || rounded > max) return null;
  return rounded;
}

function isImageKey(key = "") {
  return /\.(avif|webp|png|jpe?g|gif)$/i.test(String(key || ""));
}

function parseMediaTransformOptions(url) {
  if (!(url instanceof URL)) return null;
  const width = parsePositiveInt(url.searchParams.get("w"), 32, 2000);
  const height = parsePositiveInt(url.searchParams.get("h"), 32, 2000);
  const quality = parsePositiveInt(url.searchParams.get("q"), 30, 95);
  const fitRaw = String(url.searchParams.get("fit") || "").trim().toLowerCase();
  const formatRaw = String(url.searchParams.get("fm") || "").trim().toLowerCase();
  const fit = ["scale-down", "contain", "cover", "crop", "pad"].includes(fitRaw) ? fitRaw : "";
  const format = ["auto", "avif", "webp", "jpeg", "png"].includes(formatRaw) ? formatRaw : "auto";
  if (!width && !height && !quality && !fit) return null;
  const image = { format };
  if (width) image.width = width;
  if (height) image.height = height;
  if (quality) image.quality = quality;
  if (fit) image.fit = fit;
  return image;
}

function normalizeVideoId(value) {
  return String(value || "").trim().replace(/^\/+/, "");
}

function resolveOwnerIdFromVideoKey(videoId) {
  const safeVideoId = normalizeVideoId(videoId);
  if (!safeVideoId.startsWith("stories/")) return "";
  const parts = safeVideoId.split("/").filter(Boolean);
  if (parts.length < 3) return "";
  return safeId(parts[1]);
}

function base64UrlDecodeToString(value) {
  const safe = String(value || "").trim();
  if (!safe) return "";
  const normalized = safe.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding ? `${normalized}${"=".repeat(4 - padding)}` : normalized;
  try {
    return atob(padded);
  } catch {
    return "";
  }
}

function base64UrlEncodeBytes(bytes) {
  if (!(bytes instanceof Uint8Array)) return "";
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqual(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right || left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

async function signTicketPayload(payloadPart, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadPart));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

async function verifyMediaActionTicket({ request, env, action = "", ownerId = "", videoId = "" } = {}) {
  const secret = String(env.MEDIA_ACTION_TICKET_SECRET || "").trim();
  if (!secret) return { ok: false, status: 500, error: "ticket secret missing" };

  const token = String(request.headers.get("x-mnyra-media-ticket") || "").trim();
  if (!token) return { ok: false, status: 401, error: "media ticket required" };

  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return { ok: false, status: 401, error: "invalid media ticket" };
  }

  const payloadText = base64UrlDecodeToString(payloadPart);
  if (!payloadText) return { ok: false, status: 401, error: "invalid media ticket payload" };

  let payload = null;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    return { ok: false, status: 401, error: "invalid media ticket payload" };
  }

  const safeAction = String(action || "").trim().toLowerCase();
  const ticketAction = String(payload?.action || "").trim().toLowerCase();
  if (!safeAction || ticketAction !== safeAction) {
    return { ok: false, status: 403, error: "ticket action mismatch" };
  }
  if (Number(payload?.v) !== 1) {
    return { ok: false, status: 401, error: "unsupported ticket version" };
  }

  const now = Math.floor(Date.now() / 1000);
  const issuedAt = Number(payload?.iat || 0);
  const expiresAt = Number(payload?.exp || 0);
  if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) {
    return { ok: false, status: 401, error: "invalid ticket timestamps" };
  }
  if (expiresAt <= now || issuedAt > now + 60 || (expiresAt - issuedAt) > 600) {
    return { ok: false, status: 401, error: "expired media ticket" };
  }

  const expectedOwnerId = safeId(ownerId);
  const ticketOwnerId = safeId(payload?.ownerId || "");
  if (expectedOwnerId && ticketOwnerId !== expectedOwnerId) {
    return { ok: false, status: 403, error: "ticket owner mismatch" };
  }

  const expectedVideoId = normalizeVideoId(videoId);
  const ticketVideoId = normalizeVideoId(payload?.videoId || "");
  if (expectedVideoId && ticketVideoId !== expectedVideoId) {
    return { ok: false, status: 403, error: "ticket media mismatch" };
  }

  const expectedSignature = await signTicketPayload(payloadPart, secret);
  if (!timingSafeEqual(signaturePart, expectedSignature)) {
    return { ok: false, status: 401, error: "invalid media ticket signature" };
  }

  return { ok: true, payload };
}

async function handleImageUpload(request, env, cors) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return json({ error: "multipart/form-data required" }, 400, cors);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return json({ error: "file required" }, 400, cors);
  }

  const maxBytes = clampMb(env.MAX_IMAGE_MB, 15) * 1024 * 1024;
  if (file.size > maxBytes) {
    return json({ error: "file too large" }, 400, cors);
  }

  const mime = String(file.type || "").toLowerCase();
  if (!mime.startsWith("image/")) {
    return json({ error: "image required" }, 400, cors);
  }

  const rid = safeId(form.get("restaurantId"));
  const authz = await verifyMediaActionTicket({
    request,
    env,
    action: "image_upload",
    ownerId: rid
  });
  if (!authz.ok) {
    return json({ error: authz.error || "forbidden" }, authz.status || 403, cors);
  }
  const stamp = Date.now();
  const ext = extFromMime(mime, "jpg");
  const key = `social/${rid}/${stamp}-${randomToken()}.${ext}`;

  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: mime || "application/octet-stream",
      cacheControl: "public, max-age=31536000, immutable"
    }
  });

  const origin = new URL(request.url).origin;
  const cdnUrl = `${origin}/media/${key}`;

  return json({ ok: true, path: key, url: cdnUrl, cdnUrl }, 200, cors);
}

async function handleStoryUpload(request, env, cors) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return json({ error: "multipart/form-data required" }, 400, cors);
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") {
    return json({ error: "file required" }, 400, cors);
  }

  const maxBytes = clampMb(env.MAX_STORY_MB, 50) * 1024 * 1024;
  if (file.size > maxBytes) {
    return json({ error: "file too large" }, 400, cors);
  }

  const mime = String(file.type || "").toLowerCase();
  if (!mime.startsWith("video/")) {
    return json({ error: "video required" }, 400, cors);
  }

  const rid = safeId(form.get("restaurantId"));
  const authz = await verifyMediaActionTicket({
    request,
    env,
    action: "story_upload",
    ownerId: rid
  });
  if (!authz.ok) {
    return json({ error: authz.error || "forbidden" }, authz.status || 403, cors);
  }
  const stamp = Date.now();
  const ext = extFromMime(mime, "mp4");
  const key = `stories/${rid}/${stamp}-${randomToken()}.${ext}`;

  const ttlHours = clampMb(env.STORY_TTL_HOURS, 24);
  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: mime || "application/octet-stream",
      cacheControl: `public, max-age=${ttlHours * 3600}`
    }
  });

  const origin = new URL(request.url).origin;
  const cdnUrl = `${origin}/media/${key}`;
  return json({ ok: true, videoId: key, url: cdnUrl, cdnUrl, ttlHours }, 200, cors);
}

async function handleStoryDelete(request, env, cors) {
  let body = {};
  try {
    body = await request.json();
  } catch {}
  const videoId = normalizeVideoId(body.videoId || "");
  if (!videoId) {
    return json({ error: "videoId required" }, 400, cors);
  }
  if (!videoId.startsWith("stories/")) {
    return json({ error: "invalid videoId" }, 400, cors);
  }
  const ownerId = resolveOwnerIdFromVideoKey(videoId);
  if (!ownerId) {
    return json({ error: "invalid videoId" }, 400, cors);
  }

  const authz = await verifyMediaActionTicket({
    request,
    env,
    action: "story_delete",
    ownerId,
    videoId
  });
  if (!authz.ok) {
    return json({ error: authz.error || "forbidden" }, authz.status || 403, cors);
  }

  await env.MEDIA_BUCKET.delete(videoId);
  return json({ ok: true }, 200, cors);
}

async function handleMedia(request, env, ctx) {
    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/media\//, '');

    if (!key) {
        return new Response('Not found', { status: 404 });
    }

    const cache = caches.default;
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    let cacheControl = 'public, max-age=31536000, immutable'; // Default for images
    if (key.startsWith('stories/')) {
        const storyTtl = (env.STORY_TTL_HOURS || 24) * 3600;
        cacheControl = `public, max-age=${storyTtl}`;
    }

    const transform = isImageKey(key) ? parseMediaTransformOptions(url) : null;
    if (transform) {
        const r2Base = publicBase(env);
        if (r2Base) {
            try {
                const sourceUrl = `${r2Base}/${key.replace(/^\/+/, "")}`;
                const transformedResponse = await fetch(sourceUrl, {
                    cf: { image: transform }
                });
                if (transformedResponse && transformedResponse.ok) {
                    const transformedHeaders = new Headers(transformedResponse.headers);
                    transformedHeaders.set('cache-control', cacheControl);
                    transformedHeaders.set('access-control-allow-origin', '*');
                    const transformed = new Response(transformedResponse.body, {
                        status: transformedResponse.status,
                        headers: transformedHeaders
                    });
                    ctx.waitUntil(cache.put(request, transformed.clone()));
                    return transformed;
                }
            } catch {}
        }
    }

    const object = await env.MEDIA_BUCKET.get(key);
    if (object === null) {
        return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    headers.set('cache-control', cacheControl);
    headers.set('access-control-allow-origin', '*');


    const response = new Response(object.body, {
        headers,
    });

    ctx.waitUntil(cache.put(request, response.clone()));

    return response;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") || "";
    const cors = corsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === "GET" || request.method === "HEAD") {
        if (url.pathname.startsWith("/media/")) {
            return handleMedia(request, env, ctx);
        }
    }

    if (request.method !== "POST") {
      return json({ error: "Use POST" }, 405, cors);
    }

    try {
      if (url.pathname === "/image/upload") {
        return await handleImageUpload(request, env, cors);
      }
      if (url.pathname === "/story/upload") {
        return await handleStoryUpload(request, env, cors);
      }
      if (url.pathname === "/story/delete") {
        return await handleStoryDelete(request, env, cors);
      }
      return json({ error: "Not found" }, 404, cors);
    } catch (err) {
      return json({ error: String(err?.message || err) }, 500, cors);
    }
  }
};
