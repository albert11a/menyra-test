// Gemeinsame Video-Helfer fuer Feed-Posts, Speisen und Fokus.
// Ziel: Videos wie Fotos hochladen und aus dem ersten Frame ein Poster
// erzeugen, damit die Kachel sofort ein echtes Bild zeigt (auch wenn
// Autoplay blockiert ist) und das Video "startet nahtlos aus dem Vorschaubild".

const VIDEO_EXTENSION_PATTERN = /\.(mp4|m4v|mov|webm|ogg|ogv|3gp|3g2|avi|mkv|quicktime)(\?.*)?$/i;
const IMAGE_EXTENSION_PATTERN = /\.(avif|webp|png|jpe?g|gif|bmp|svg|heic|heif|tiff?)(\?.*)?$/i;

export function isVideoFileCore(file) {
  if (!file) return false;
  const type = String(file.type || "").trim().toLowerCase();
  if (type.startsWith("video/")) return true;
  if (type.startsWith("image/")) return false;
  return VIDEO_EXTENSION_PATTERN.test(String(file.name || ""));
}

export function isImageFileCore(file) {
  if (!file) return false;
  const type = String(file.type || "").trim().toLowerCase();
  if (type.startsWith("image/")) return true;
  if (type.startsWith("video/")) return false;
  return IMAGE_EXTENSION_PATTERN.test(String(file.name || ""));
}

// Entscheidet, ob ein gespeicherter Datensatz (Speise/Fokus/Post) als
// Video behandelt wird. Bewusst streng: nur mediaType=="video" oder eine
// videoUrl zaehlen, damit Menue-Typen wie type=="food" nicht faelschlich
// als Video gelten.
export function isVideoMediaItemCore(item) {
  if (!item || typeof item !== "object") return false;
  const mediaType = String(item.mediaType || "").trim().toLowerCase();
  if (mediaType === "video") return true;
  return !!String(item.videoUrl || "").trim();
}

// Erstes Frame eines Videos als JPEG-File einfangen. Laeuft komplett im
// Browser (kein Upload noetig) und gibt bei jedem Fehler null zurueck, damit
// der Aufrufer sauber ohne Poster weitermachen kann.
export async function captureVideoPosterFileCore(file, { documentObj } = {}) {
  const docObj = documentObj || (typeof document === "undefined" ? null : document);
  const win = docObj?.defaultView || (typeof window === "undefined" ? null : window);
  if (!file || !docObj || !win || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
    return null;
  }
  const objectUrl = URL.createObjectURL(file);
  const video = docObj.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.preload = "auto";
  try {
    await new Promise((resolve, reject) => {
      const timer = win.setTimeout(() => reject(new Error("poster timeout")), 5000);
      video.onloadeddata = () => {
        win.clearTimeout(timer);
        resolve();
      };
      video.onerror = () => {
        win.clearTimeout(timer);
        reject(new Error("poster load failed"));
      };
      video.src = objectUrl;
    });
    try {
      await new Promise((resolve) => {
        const timer = win.setTimeout(resolve, 1200);
        video.onseeked = () => {
          win.clearTimeout(timer);
          resolve();
        };
        video.currentTime = Math.min(0.1, Math.max(0, (Number(video.duration) || 1) / 10));
      });
    } catch {}
    const width = Number(video.videoWidth) || 0;
    const height = Number(video.videoHeight) || 0;
    if (!width || !height) return null;
    const canvas = docObj.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    if (!blob || !blob.size) return null;
    return new File([blob], "video-poster.jpg", { type: "image/jpeg" });
  } catch {
    return null;
  } finally {
    try {
      video.removeAttribute("src");
      video.load?.();
    } catch {}
    try {
      URL.revokeObjectURL(objectUrl);
    } catch {}
  }
}
