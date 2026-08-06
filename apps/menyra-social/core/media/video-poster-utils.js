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

// Standbild-Groesse: genau die Kante, auf die der Upload jedes Bild ohnehin
// herunterrechnet (uploadCompressedImage, maxSize 1080). Ein Handy-Video kommt
// in 4K herein; es in voller Groesse zu zeichnen und zu packen kostet auf
// schwachen Geraeten Sekunden - und war am Ende dasselbe Bild.
// Sichtbar aendert sich dadurch nichts.
const POSTER_MAX_EDGE_PX = 1080;
// Etwas hoeher als der Upload (0.78), weil dieses Bild noch einmal durch die
// Kompression geht - so bleibt am Ende dieselbe Qualitaet stehen.
const POSTER_JPEG_QUALITY = 0.82;
// Kommt in dieser Zeit kein Bild, wird ohne Poster weitergemacht. Der Aufrufer
// wartet nicht darauf, deshalb faellt kurz lieber aus als lange zu haengen.
const POSTER_FRAME_TIMEOUT_MS = 3500;

function attachOffscreenVideo(video, docObj) {
  // iOS-Safari dekodiert zuverlaessig nur, was im Dokument haengt. 1x1 Pixel,
  // unsichtbar und aus dem Layout heraus - sichtbar wird davon nichts.
  video.style.cssText = "position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  video.setAttribute("aria-hidden", "true");
  try {
    (docObj.body || docObj.documentElement)?.appendChild?.(video);
    return true;
  } catch {
    return false;
  }
}

function detachOffscreenVideo(video) {
  try {
    video.pause?.();
  } catch {}
  try {
    video.removeAttribute("src");
    video.load?.();
  } catch {}
  try {
    video.remove?.();
  } catch {}
}

// Wartet auf ein wirklich gezeichnetes Bild. requestVideoFrameCallback meldet
// genau das; wo es fehlt, ist "loadeddata" plus ein Frame die beste Naeherung.
// Abgespielt wird dabei bewusst: ein stummes Inline-Video darf das ohne Geste,
// und nur das Abspielen zwingt iOS, ueberhaupt zu dekodieren.
function waitForVideoFrame(video, win, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      win.clearTimeout(timer);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("seeked", onLoadedData);
      video.removeEventListener("error", onError);
      if (err) reject(err);
      else resolve();
    };
    const onLoadedData = () => {
      if (typeof video.requestVideoFrameCallback === "function") return;
      // Ohne rVFC: ein Frame Bedenkzeit, dann steht das Bild im Element.
      if (typeof win.requestAnimationFrame === "function") {
        win.requestAnimationFrame(() => finish());
        return;
      }
      finish();
    };
    const onError = () => finish(new Error("poster load failed"));
    const timer = win.setTimeout(() => finish(new Error("poster timeout")), timeoutMs);

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("seeked", onLoadedData);
    video.addEventListener("error", onError);
    if (typeof video.requestVideoFrameCallback === "function") {
      try {
        video.requestVideoFrameCallback(() => finish());
      } catch {}
    }
    try {
      video.load?.();
    } catch {}
    try {
      const attempt = video.play?.();
      if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
    } catch {}
  });
}

// Zeichnet den aktuellen Stand eines <video> als JPEG-File. Verkleinert dabei
// auf Kachelgroesse - das ist auf schwachen Geraeten der Unterschied zwischen
// Sekunden und Sekundenbruchteilen.
async function drawVideoFrameToPosterFile(video, docObj, maxEdge = POSTER_MAX_EDGE_PX) {
  const width = Number(video?.videoWidth) || 0;
  const height = Number(video?.videoHeight) || 0;
  if (!width || !height) return null;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = docObj.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext?.("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
  const blob = await new Promise((resolve) => {
    try {
      canvas.toBlob(resolve, "image/jpeg", POSTER_JPEG_QUALITY);
    } catch {
      resolve(null);
    }
  });
  if (!blob || !blob.size) return null;
  return new File([blob], "video-poster.jpg", { type: "image/jpeg" });
}

// Standbild aus einem Video, das ohnehin schon laeuft (die Vorschau im
// Composer). Kostet kein zweites Dekodieren und ist damit der schnellste Weg -
// gibt null zurueck, solange das Element noch kein Bild gezeichnet hat.
export async function captureVideoPosterFromElementCore(video, { documentObj } = {}) {
  const docObj = documentObj
    || video?.ownerDocument
    || (typeof document === "undefined" ? null : document);
  if (!video || !docObj) return null;
  // readyState 2 = HAVE_CURRENT_DATA: fuer den aktuellen Zeitpunkt liegt ein
  // Bild vor. Alles darunter wuerde eine leere Flaeche zeichnen.
  if (Number(video.readyState) < 2) return null;
  try {
    return await drawVideoFrameToPosterFile(video, docObj);
  } catch {
    return null;
  }
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
  video.defaultMuted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";
  attachOffscreenVideo(video, docObj);
  try {
    video.src = objectUrl;
    await waitForVideoFrame(video, win, POSTER_FRAME_TIMEOUT_MS);
    return await drawVideoFrameToPosterFile(video, docObj);
  } catch {
    // Zeitueberschreitung heisst nicht zwingend "kein Bild": liegt eines vor,
    // wird es genommen, statt ohne Standbild dazustehen.
    try {
      if (Number(video.readyState) >= 2) return await drawVideoFrameToPosterFile(video, docObj);
    } catch {}
    return null;
  } finally {
    detachOffscreenVideo(video);
    try {
      URL.revokeObjectURL(objectUrl);
    } catch {}
  }
}
