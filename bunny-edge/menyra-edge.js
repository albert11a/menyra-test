import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.11";
import process from "node:process";

// --- helpers ---
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function corsHeaders(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!allowed.length) {
    return {
      "access-control-allow-origin": origin || "*",
      "access-control-allow-methods": "POST,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
    };
  }

  const ok = allowed.includes("*") || allowed.includes(origin);
  return ok
    ? {
        "access-control-allow-origin": allowed.includes("*") ? "*" : origin,
        "access-control-allow-methods": "POST,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
      }
    : {};
}

async function readJson(request) {
  const text = await request.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function safeId(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 40) || "general";
}

function ensureHttps(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw.replace(/^\/+/, "")}`;
}

// SHA-256 hex helper (WebCrypto)
async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// --- Bunny Stream API calls ---
async function bunnyStreamCreateVideo(title = "MENYRA Story") {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const key = process.env.BUNNY_STREAM_ACCESS_KEY;

  const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      "AccessKey": key,
      "content-type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`CreateVideo failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data; // contains guid / videoId depending on API response
}

async function bunnyStreamDeleteVideo(videoId) {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const key = process.env.BUNNY_STREAM_ACCESS_KEY;

  const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    method: "DELETE",
    headers: { "AccessKey": key },
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`DeleteVideo failed: ${res.status} ${t}`);
  }
  return true;
}

// --- Bunny Storage upload ---
async function bunnyStorageUpload({ path, bytes, contentType }) {
  const zone = process.env.BUNNY_STORAGE_ZONE;
  const key = process.env.BUNNY_STORAGE_ACCESS_KEY || process.env.BUNNY_STORAGE_KEY;
  const host = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";

  if (!zone || !key) {
    throw new Error("Missing BUNNY_STORAGE_ZONE or BUNNY_STORAGE_KEY");
  }

  const url = `https://${host}/${zone}/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "AccessKey": key,
      "Content-Type": contentType || "application/octet-stream",
    },
    body: bytes,
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Storage upload failed: ${res.status} ${t}`);
  }

  const cdnHost = process.env.BUNNY_CDN_HOST;
  const rawBase = process.env.BUNNY_CDN_BASE || (cdnHost ? `https://${cdnHost}` : "https://menyra-xr1gb.b-cdn.net");
  const cdnBase = ensureHttps(rawBase).replace(/\/+$/, "");
  return `${cdnBase}/${path}`;
}

// --- main ---
BunnySDK.net.http.serve(async (request) => {
  const url = new URL(request.url);
  const origin = request.headers.get("origin") || "";
  const cors = corsHeaders(origin);

  // CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  // only allow POST
  if (request.method !== "POST") {
    return json({ error: "Use POST" }, 405, cors);
  }

  try {
    // ROUTE: /story/start
    if (url.pathname === "/story/start") {
      const body = await readJson(request);

      // optional: include restaurantId in title for debugging
      const rid = (body.restaurantId || "").toString().slice(0, 64);
      const created = await bunnyStreamCreateVideo(rid ? `MENYRA Story ${rid}` : "MENYRA Story");

      // Bunny stream API returns GUID in different fields depending on version.
      const videoId = created.guid || created.videoId || created.id || created.Guid || created.GuidId;
      if (!videoId) {
        return json({ error: "No videoId returned", created }, 500, cors);
      }

      const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
      const accessKey = process.env.BUNNY_STREAM_ACCESS_KEY;

      // TUS authorization (per Bunny docs: sha256(libraryId + accessKey + expire + videoId))
      const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
      const signature = await sha256Hex(`${libraryId}${accessKey}${expire}${videoId}`);

      return json({
        ok: true,
        libraryId,
        videoId,
        tusEndpoint: "https://video.bunnycdn.com/tusupload",
        uploadHeaders: {
          AuthorizationSignature: signature,
          AuthorizationExpire: expire,
          LibraryId: libraryId,
          VideoId: videoId,
        },
        limits: {
          maxStorySeconds: Number(process.env.MAX_STORY_SECONDS || "15"),
          maxStoryCount: Number(process.env.MAX_STORY_COUNT || "10"),
          ttlHours: Number(process.env.STORY_TTL_HOURS || "24"),
        },
      }, 200, cors);
    }

    // ROUTE: /story/delete
    if (url.pathname === "/story/delete") {
      const body = await readJson(request);
      const videoId = body.videoId;
      if (!videoId) return json({ error: "videoId required" }, 400, cors);

      await bunnyStreamDeleteVideo(videoId);
      return json({ ok: true }, 200, cors);
    }

    // ROUTE: /image/upload
    if (url.pathname === "/image/upload") {
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("multipart/form-data")) {
        return json({ error: "multipart/form-data required" }, 400, cors);
      }

      const form = await request.formData();
      const file = form.get("file");
      if (!file || typeof file.arrayBuffer !== "function") {
        return json({ error: "file required" }, 400, cors);
      }

      const maxBytes = Number(process.env.MAX_IMAGE_MB || "15") * 1024 * 1024;
      if (file.size > maxBytes) {
        return json({ error: "file too large" }, 400, cors);
      }

      const mime = String(file.type || "").toLowerCase();
      const extByType = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };
      const ext = extByType[mime] || "jpg";

      const rid = safeId(form.get("restaurantId"));
      const stamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `social/${rid}/${stamp}-${rand}.${ext}`;

      const bytes = await file.arrayBuffer();
      const urlOut = await bunnyStorageUpload({
        path,
        bytes,
        contentType: mime || "application/octet-stream",
      });

      return json({ ok: true, path, url: urlOut }, 200, cors);
    }

    return json({ error: "Not found" }, 404, cors);
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500, cors);
  }
});
