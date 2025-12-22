// =========================================================
// MENYRA Owner Admin — Story Upload
// - Select photo/video
// - Select a product (menuItem)
// - Upload:
//     video -> Bunny Stream (TUS, via signature from Cloud Function)
//     image -> Bunny Storage (via Cloud Function proxy)
// - Create Firestore story doc:
//     restaurants/{restaurantId}/stories/{storyId}
// =========================================================

import { db, functions, getQueryParam } from "../../shared/firebase-config.js";
import { streamUrls } from "../../shared/bunny-public.js";

import {
  collection,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  limit,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-functions.js";

const restaurantId = getQueryParam("r") || "";
const tableId = getQueryParam("t") || "";

const el = (id) => document.getElementById(id);

const ownerRestaurantIdEl = el("ownerRestaurantId");
const storyOpenPublicBtn = el("storyOpenPublicBtn");
const storyFileInput = el("storyFileInput");
const storyProductSelect = el("storyProductSelect");
const storyCaptionInput = el("storyCaptionInput");
const storyUploadBtn = el("storyUploadBtn");
const storyResetBtn = el("storyResetBtn");
const storyUploadStatus = el("storyUploadStatus");

function setStatus(msg) {
  storyUploadStatus.textContent = `Status: ${msg}`;
}

function publicStoryUrl() {
  const params = new URLSearchParams();
  if (restaurantId) params.set("r", restaurantId);
  if (tableId) params.set("t", tableId);
  return `../social/story.html?${params.toString()}`;
}

function resetForm() {
  storyFileInput.value = "";
  storyProductSelect.value = "";
  storyCaptionInput.value = "";
  setStatus("bereit");
}

async function loadProducts() {
  if (!restaurantId) return;
  const ref = collection(db, "restaurants", restaurantId, "menuItems");
  const q = query(ref, orderBy("name", "asc"), limit(250));
  const snap = await getDocs(q);

  const items = [];
  snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

  // Populate select
  const optEmpty = storyProductSelect.querySelector('option[value=""]');
  storyProductSelect.innerHTML = "";
  storyProductSelect.appendChild(optEmpty);

  items.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.name ? p.name : p.id;
    o.dataset.price = String(p.price ?? "");
    o.dataset.image = p.imageUrl || p.image || "";
    storyProductSelect.appendChild(o);
  });
}

async function uploadImageViaFunction(file) {
  // Cloud Function: uploadStoryImage
  // Returns: { url }
  const form = new FormData();
  form.append("file", file, file.name || "image");
  form.append("restaurantId", restaurantId);

  const res = await fetch(
    // default region: us-central1
    `https://us-central1-menyra-c0e68.cloudfunctions.net/uploadStoryImage`,
    {
      method: "POST",
      body: form,
    }
  );

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Image upload failed (${res.status}): ${t}`);
  }
  return res.json();
}

async function ensureTus() {
  // ESM build from jsDelivr
  return import("https://cdn.jsdelivr.net/npm/tus-js-client@4.1.0/dist/tus.esm.js");
}

async function uploadVideoTus(file, tusInfo) {
  // tusInfo: { endpoint, headers }
  const tus = await ensureTus();

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: tusInfo.endpoint,
      headers: tusInfo.headers,
      metadata: {
        filename: file.name || "video",
        filetype: file.type || "video/mp4",
      },
      retryDelays: [0, 1000, 3000, 5000],
      chunkSize: 8 * 1024 * 1024,
      onError: (error) => reject(error),
      onProgress: (bytesUploaded, bytesTotal) => {
        const pct = bytesTotal ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
        setStatus(`Video Upload ${pct}%`);
      },
      onSuccess: () => resolve(true),
    });
    upload.start();
  });
}

async function createStoryDoc({ mediaType, mediaUrl, videoId, imageUrl, caption, product }) {
  const ref = collection(db, "restaurants", restaurantId, "stories");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const payload = {
    mediaType,
    mediaUrl,
    imageUrl: imageUrl || null,
    videoId: videoId || null,
    caption: caption || "",
    product: product || null,
    createdAt: serverTimestamp(),
    expiresAt,
  };

  const docRef = await addDoc(ref, payload);
  return docRef.id;
}

async function handleUpload() {
  if (!restaurantId) {
    alert("Fehlende Restaurant-ID. Öffne Owner Admin mit ?r=restaurantId");
    return;
  }

  const file = storyFileInput.files?.[0];
  if (!file) {
    alert("Bitte Foto oder Video auswählen.");
    return;
  }

  const caption = (storyCaptionInput.value || "").trim();

  // product snapshot
  let product = null;
  const productId = storyProductSelect.value;
  if (productId) {
    const opt = storyProductSelect.selectedOptions?.[0];
    product = {
      id: productId,
      name: opt?.textContent || "",
      price: opt?.dataset?.price ? Number(opt.dataset.price) : null,
      imageUrl: opt?.dataset?.image || null,
    };
  }

  storyUploadBtn.disabled = true;
  storyResetBtn.disabled = true;

  try {
    if (file.type.startsWith("video/")) {
      setStatus("Video vorbereiten…");

      const getSig = httpsCallable(functions, "getStreamUploadSignature");
      const sigRes = await getSig({
        restaurantId,
        title: caption || file.name || "Story Video",
        fileType: file.type,
      });

      const { videoId, tusEndpoint, tusHeaders } = sigRes.data || {};
      if (!videoId || !tusEndpoint || !tusHeaders) throw new Error("Missing tus info");

      await uploadVideoTus(file, { endpoint: tusEndpoint, headers: tusHeaders });
      setStatus("Video hochgeladen – Story speichern…");

      const url = streamUrls.videoSources(videoId);
      await createStoryDoc({
        mediaType: "video",
        mediaUrl: url.mp4_720 || url.hls,
        videoId,
        caption,
        product,
      });

      setStatus("Fertig ✅");
      alert("Story gepostet!");
      resetForm();
      return;
    }

    if (file.type.startsWith("image/")) {
      setStatus("Foto upload…");
      const up = await uploadImageViaFunction(file);
      if (!up?.url) throw new Error("No image url returned");
      setStatus("Story speichern…");
      await createStoryDoc({
        mediaType: "image",
        mediaUrl: up.url,
        imageUrl: up.url,
        caption,
        product,
      });
      setStatus("Fertig ✅");
      alert("Story gepostet!");
      resetForm();
      return;
    }

    alert("Unbekannter Dateityp. Bitte Video oder Bild.");
  } catch (err) {
    console.error(err);
    alert(String(err?.message || err));
    setStatus("Fehler ❌");
  } finally {
    storyUploadBtn.disabled = false;
    storyResetBtn.disabled = false;
  }
}

function init() {
  ownerRestaurantIdEl.textContent = restaurantId || "(fehlend)";

  storyOpenPublicBtn.addEventListener("click", () => {
    window.open(publicStoryUrl(), "_blank");
  });

  storyResetBtn.addEventListener("click", resetForm);
  storyUploadBtn.addEventListener("click", handleUpload);

  if (restaurantId) {
    loadProducts().catch((e) => {
      console.error(e);
      setStatus("Produkte konnten nicht geladen werden.");
    });
  } else {
    setStatus("Restaurant-ID fehlt (öffne mit ?r=...)");
  }
}

init();
