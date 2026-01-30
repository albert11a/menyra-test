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
      "access-control-allow-headers": "content-type,authorization"
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
        "access-control-allow-headers": "content-type,authorization"
      }
    : {};
}

function safeId(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40) || "general";
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
  const videoId = String(body.videoId || "").trim();
  if (!videoId) {
    return json({ error: "videoId required" }, 400, cors);
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

    const object = await env.MEDIA_BUCKET.get(key);
    if (object === null) {
        return new Response('Not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    let cacheControl = 'public, max-age=31536000, immutable'; // Default for images
    if (key.startsWith('stories/')) {
        const storyTtl = (env.STORY_TTL_HOURS || 24) * 3600;
        cacheControl = `public, max-age=${storyTtl}`;
    }
    
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
