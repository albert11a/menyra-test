/* =========================================================
   MENYRA — Firebase Cloud Functions (Bunny Upload Bridge)

   Why functions?
   - Bunny Storage password + Bunny Stream API key MUST NOT be exposed in browser.
   - Client requests a short-lived signature for TUS, then uploads DIRECTLY to Bunny.
   - Images are proxied through this function (small) to keep keys secret.

   Required env/secrets:
   - BUNNY_STREAM_LIBRARY_ID=568747
   - BUNNY_STREAM_API_KEY=... (Video Library AccessKey)
   - BUNNY_STORAGE_ZONE=... (Storage Zone name)
   - BUNNY_STORAGE_ACCESS_KEY=... (Storage Zone password)
   - BUNNY_IMAGES_CDN_HOST=Menyra.b-cdn.net
   - BUNNY_STREAM_CDN_HOST=vz-e3ced87e-921.b-cdn.net
   ========================================================= */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Busboy = require("busboy");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const STREAM_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || "568747";
const STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY || "";
const STREAM_CDN_HOST = process.env.BUNNY_STREAM_CDN_HOST || "";

const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || "";
const STORAGE_ACCESS_KEY = process.env.BUNNY_STORAGE_ACCESS_KEY || "";
const STORAGE_HOST = process.env.BUNNY_STORAGE_HOST || "storage.bunnycdn.com";
const IMAGES_CDN_HOST = process.env.BUNNY_IMAGES_CDN_HOST || "";

function requireEnv(name, val) {
  if (!val) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      `Missing required env: ${name}`
    );
  }
}

function sha256Hex(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

async function createBunnyStreamVideo({ title }) {
  requireEnv("BUNNY_STREAM_API_KEY", STREAM_API_KEY);

  const url = `https://video.bunnycdn.com/library/${STREAM_LIBRARY_ID}/videos`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: STREAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: title || "Story Video" }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Bunny Stream create video failed (${res.status}): ${t}`);
  }

  const data = await res.json();
  // Bunny returns "guid" (video id)
  const guid = data?.guid || data?.Guid || data?.id;
  if (!guid) throw new Error("Bunny Stream returned no guid");
  return guid;
}

exports.getStreamUploadSignature = functions.https.onCall(async (data, context) => {
  // NOTE: For production, you should verify that the caller is allowed to upload
  // for the given restaurantId. (e.g., staff mapping / custom claims)

  const restaurantId = String(data?.restaurantId || "").trim();
  const title = String(data?.title || "").trim();

  if (!restaurantId) {
    throw new functions.https.HttpsError("invalid-argument", "restaurantId is required");
  }

  requireEnv("BUNNY_STREAM_API_KEY", STREAM_API_KEY);

  // 1) Create the video object in Bunny Stream
  const videoId = await createBunnyStreamVideo({ title: title || "Story Video" });

  // 2) Generate TUS signature (docs: sha256(library_id + api_key + expiration_time + video_id))
  const expiration = Math.floor(Date.now() / 1000) + 60 * 60; // +1h
  const signature = sha256Hex(`${STREAM_LIBRARY_ID}${STREAM_API_KEY}${expiration}${videoId}`);

  const tusEndpoint = "https://video.bunnycdn.com/tusupload";

  return {
    videoId,
    tusEndpoint,
    tusHeaders: {
      AuthorizationSignature: signature,
      AuthorizationExpire: String(expiration),
      LibraryId: String(STREAM_LIBRARY_ID),
      VideoId: String(videoId),
    },
    // Optional: helpers for playback URLs (client can also compute)
    streamCdnHost: STREAM_CDN_HOST || null,
  };
});

exports.uploadStoryImage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      requireEnv("BUNNY_STORAGE_ZONE", STORAGE_ZONE);
      requireEnv("BUNNY_STORAGE_ACCESS_KEY", STORAGE_ACCESS_KEY);
      requireEnv("BUNNY_IMAGES_CDN_HOST", IMAGES_CDN_HOST);

      if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
      }

      const bb = Busboy({ headers: req.headers, limits: { files: 1, fileSize: 12 * 1024 * 1024 } });

      let restaurantId = "";
      let fileBufs = [];
      let fileMime = "application/octet-stream";
      let fileName = "image";

      bb.on("field", (name, val) => {
        if (name === "restaurantId") restaurantId = String(val || "").trim();
      });

      bb.on("file", (_name, file, info) => {
        fileName = info?.filename || "image";
        fileMime = info?.mimeType || "application/octet-stream";

        file.on("data", (d) => fileBufs.push(d));
      });

      bb.on("finish", async () => {
        if (!restaurantId) {
          res.status(400).send("restaurantId required");
          return;
        }

        const ext = (fileName.split(".").pop() || "jpg").toLowerCase();
        const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) ? ext : "jpg";
        const stamp = Date.now();
        const path = `stories/${restaurantId}/${stamp}.${safeExt}`;

        const body = Buffer.concat(fileBufs);
        if (!body.length) {
          res.status(400).send("No file received");
          return;
        }

        const uploadUrl = `https://${STORAGE_HOST}/${STORAGE_ZONE}/${path}`;
        const up = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            AccessKey: STORAGE_ACCESS_KEY,
            "Content-Type": fileMime,
          },
          body,
        });

        if (!up.ok) {
          const t = await up.text().catch(() => "");
          res.status(502).send(`Bunny upload failed (${up.status}): ${t}`);
          return;
        }

        const publicUrl = `https://${IMAGES_CDN_HOST}/${path}`;
        res.status(200).json({ url: publicUrl, path });
      });

      bb.on("error", (err) => {
        res.status(400).send(String(err?.message || err));
      });

      req.pipe(bb);
    } catch (err) {
      console.error(err);
      res.status(500).send(String(err?.message || err));
    }
  });
});
