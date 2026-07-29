import {
  detectUploadMediaTypeCore,
  renderUploadViewCore
} from "./media-upload-view-render-utils.js";
import { captureVideoPosterFileCore } from "./video-poster-utils.js";
import { compressImageThumb } from "../../_shared/image-compressor.js";

export function createMediaUploadRuntimeController({
  state = null,
  auth = null,
  db = null,
  documentObj = null,
  mediaBaseUrl = "",
  mediaTicketEndpoint = "",
  fetchFn = null,
  compressImageFn = async (file) => file,
  collectionFn = null,
  docFn = null,
  setDocFn = async () => {},
  getDocsFn = null,
  queryFn = null,
  limitFn = null,
  serverTimestampFn = () => null,
  storySystemController = null,
  isLocalBusinessProfileFn = () => false,
  getOptimizedImageUrlFn = (value) => String(value || "").trim(),
  escapeHtmlFn = (value) => String(value || ""),
  iconFn = () => "",
  normalizeStoryItemForDisplayFn = (value) => value,
  buildStoriesSignatureFn = () => "",
  writeCacheFn = () => {},
  loadStoriesForFeedFn = async () => {},
  loadFeedPostsFn = async () => {},
  loadBusinessPostsFn = async () => {},
  loadUserPostsFn = async () => {},
  renderFn = () => {},
  updateFeedDomFn = () => false,
  getLastRenderModeFn = () => "",
  setStateFn = () => {},
  setFeedStoriesSignatureFn = () => {},
  cacheKeys = {},
  fastLimits = {}
} = {}) {
  const docObj = documentObj || (typeof document === "undefined" ? null : document);
  const collection = typeof collectionFn === "function" ? collectionFn : null;
  const makeDocRef = typeof docFn === "function" ? docFn : null;
  const setDoc = typeof setDocFn === "function" ? setDocFn : (async () => {});
  const getDocs = typeof getDocsFn === "function" ? getDocsFn : null;
  const makeQuery = typeof queryFn === "function" ? queryFn : null;
  const makeLimit = typeof limitFn === "function" ? limitFn : null;
  const serverTimestamp = typeof serverTimestampFn === "function" ? serverTimestampFn : (() => null);
  const fetchMedia = typeof fetchFn === "function"
    ? fetchFn
    : (typeof fetch === "function" ? fetch.bind(globalThis) : null);
  const compressImage = typeof compressImageFn === "function"
    ? compressImageFn
    : (async (file) => file);
  const isLocalBusinessProfile = typeof isLocalBusinessProfileFn === "function"
    ? isLocalBusinessProfileFn
    : (() => false);
  const getOptimizedImageUrl = typeof getOptimizedImageUrlFn === "function"
    ? getOptimizedImageUrlFn
    : ((value) => String(value || "").trim());
  const escapeHtml = typeof escapeHtmlFn === "function"
    ? escapeHtmlFn
    : ((value) => String(value || ""));
  const icon = typeof iconFn === "function" ? iconFn : (() => "");
  const normalizeStoryItemForDisplay = typeof normalizeStoryItemForDisplayFn === "function"
    ? normalizeStoryItemForDisplayFn
    : ((value) => value);
  const buildStoriesSignature = typeof buildStoriesSignatureFn === "function"
    ? buildStoriesSignatureFn
    : (() => "");
  const writeCache = typeof writeCacheFn === "function" ? writeCacheFn : (() => {});
  const loadStoriesForFeed = typeof loadStoriesForFeedFn === "function"
    ? loadStoriesForFeedFn
    : (async () => {});
  const loadFeedPosts = typeof loadFeedPostsFn === "function" ? loadFeedPostsFn : (async () => {});
  const loadBusinessPosts = typeof loadBusinessPostsFn === "function"
    ? loadBusinessPostsFn
    : (async () => {});
  const loadUserPosts = typeof loadUserPostsFn === "function" ? loadUserPostsFn : (async () => {});
  const render = typeof renderFn === "function" ? renderFn : (() => {});
  const updateFeedDom = typeof updateFeedDomFn === "function" ? updateFeedDomFn : (() => false);
  const getLastRenderMode = typeof getLastRenderModeFn === "function"
    ? getLastRenderModeFn
    : (() => "");
  const setState = typeof setStateFn === "function"
    ? setStateFn
    : ((patch = {}) => {
      if (state && patch && typeof patch === "object") Object.assign(state, patch);
    });
  const setFeedStoriesSignature = typeof setFeedStoriesSignatureFn === "function"
    ? setFeedStoriesSignatureFn
    : (() => {});
  const cacheStoriesKey = String(cacheKeys?.stories || "").trim();
  const storyLimit = Number.isFinite(Number(fastLimits?.stories))
    ? Math.max(1, Number(fastLimits.stories))
    : Number.MAX_SAFE_INTEGER;

  function detectUploadMediaType(file) {
    return detectUploadMediaTypeCore(file);
  }

  function resolveUploadMode() {
    return storySystemController?.normalizeUploadIntent?.(state?.upload?.mode, { fallback: "feed" }) || "feed";
  }

  function releaseUploadPreviewUrl(previewUrl = "") {
    const url = String(previewUrl || "").trim();
    if (!url || !url.startsWith("blob:")) return;
    if (typeof URL === "undefined" || typeof URL.revokeObjectURL !== "function") return;
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }

  async function requestMediaActionTicket(action, { restaurantId = "", videoId = "" } = {}) {
    const safeAction = String(action || "").trim();
    if (!safeAction) throw new Error("Mungon veprimi i medias.");
    if (!fetchMedia) throw new Error("Mungon rrjeti i medias.");
    const user = auth?.currentUser || state?.user || null;
    if (!user || typeof user.getIdToken !== "function") {
      throw new Error("Ju lutem hyni fillimisht.");
    }
    const idToken = await user.getIdToken();
    const payload = { action: safeAction };
    const safeRestaurantId = String(restaurantId || "").trim();
    if (safeRestaurantId) payload.restaurantId = safeRestaurantId;
    const safeVideoId = String(videoId || "").trim();
    if (safeVideoId) payload.videoId = safeVideoId;

    const res = await fetchMedia(mediaTicketEndpoint, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ticket) {
      throw new Error(data?.error || "Autorizimi i medias deshtoi.");
    }
    return String(data.ticket);
  }

  async function uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType }) {
    if (!fetchMedia) throw new Error("Mungon rrjeti i medias.");
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) throw new Error("Maksimumi 15MB per foto.");
    if (!String(file.type || "").startsWith("image/")) throw new Error("Nur Bilder erlaubt.");

    const compressedFile = await compressImage(file, maxSize, quality, mimeType);
    // Kleine Thumb-Variante (480px WebP/JPEG) fuer Grid-/Avatar-Anfragen
    // mitschicken: der Media-Worker liefert sie bei ?w<=480 statt des
    // Originals aus. Ein Fehler hier darf den Upload nie blockieren.
    let thumbFile = null;
    try {
      thumbFile = await compressImageThumb(file, 480, 0.7);
    } catch {
      thumbFile = null;
    }
    const ticket = await requestMediaActionTicket("image_upload", { restaurantId: ownerId });
    const form = new FormData();
    form.append("file", compressedFile, compressedFile.name || "image.jpg");
    form.append("restaurantId", ownerId || "");
    if (thumbFile) {
      form.append("thumb", thumbFile, thumbFile.name || "thumb.webp");
    }

    const res = await fetchMedia(`${mediaBaseUrl}/image/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ticket}`
      },
      body: form
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) throw new Error(data?.error || "Ngarkimi deshtoi.");
    return {
      url: String(data.url || "").trim(),
      cdnUrl: String(data.cdnUrl || data.url || "").trim()
    };
  }

  async function uploadRawMediaFile(file, ownerId, { maxBytes = 50 * 1024 * 1024 } = {}) {
    if (!fetchMedia) throw new Error("Mungon rrjeti i medias.");
    if (!file) throw new Error("Mungon skedari.");
    if (file.size > maxBytes) throw new Error("Maksimumi 50MB per video story.");
    const ticket = await requestMediaActionTicket("story_upload", { restaurantId: ownerId });
    const form = new FormData();
    form.append("file", file, file.name || "media");
    form.append("restaurantId", ownerId || "");
    const res = await fetchMedia(`${mediaBaseUrl}/story/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ticket}`
      },
      body: form
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) throw new Error(data?.error || "Ngarkimi deshtoi.");
    return {
      url: String(data.url || "").trim(),
      cdnUrl: String(data.cdnUrl || data.url || "").trim(),
      videoId: String(data.videoId || "").trim()
    };
  }

  // Produkt-Tag-Auswahl fuer Stories: Menue-Items pro Restaurant einmalig
  // laden und im Speicher halten, damit der Upload-Screen sofort rendert.
  const storyTagItemsCache = new Map();
  const STORY_TAG_ITEMS_LIMIT = 200;

  function ensureStoryTagItemsLoaded(restaurantId = "") {
    const rid = String(restaurantId || "").trim();
    if (!rid || storyTagItemsCache.has(rid)) return;
    if (!db || !collection || !getDocs || !makeQuery) return;
    storyTagItemsCache.set(rid, { status: "loading", items: [] });
    void (async () => {
      try {
        const itemsRef = collection(db, "restaurants", rid, "menuItems");
        const snap = await getDocs(
          makeLimit ? makeQuery(itemsRef, makeLimit(STORY_TAG_ITEMS_LIMIT)) : makeQuery(itemsRef)
        );
        const items = [];
        snap.forEach((docSnap) => {
          const row = docSnap?.data?.() || {};
          const id = String(docSnap?.id || "").trim();
          if (!id) return;
          items.push({
            id,
            name: String(row.name || row.title || "").trim() || id,
            // Preis + Bild als Snapshot fuer die Produkt-Card im Story-Viewer.
            price: row.price ?? "",
            imageUrl: String(
              row.imageUrl
              || row.image
              || (Array.isArray(row.images) ? row.images[0] : "")
              || ""
            ).trim()
          });
        });
        items.sort((a, b) => a.name.localeCompare(b.name));
        storyTagItemsCache.set(rid, { status: "ready", items });
      } catch {
        storyTagItemsCache.set(rid, { status: "error", items: [] });
      }
      render();
    })();
  }

  function resolveStoryTagStateForUpload() {
    if (resolveUploadMode() !== "story") return null;
    if (!isLocalBusinessProfile(state?.userProfile)) return null;
    const rid = String(state?.userProfile?.restaurantId || "").trim();
    if (!rid) return null;
    ensureStoryTagItemsLoaded(rid);
    return storyTagItemsCache.get(rid) || null;
  }

  // Poster fuer Video-Stories: erstes Frame als JPEG einfangen, damit die
  // Feed-Kachel und der Reels-Viewer sofort ein echtes Bild zeigen - auch
  // wenn Video-Autoplay blockiert ist (z.B. iOS-Stromsparmodus).
  async function captureVideoPosterFile(file) {
    return captureVideoPosterFileCore(file, { documentObj: docObj });
  }

  function renderUploadView() {
    return renderUploadViewCore({
      state,
      storySystemController,
      isLocalBusinessProfileFn: isLocalBusinessProfile,
      getOptimizedImageUrlFn: getOptimizedImageUrl,
      escapeHtmlFn: escapeHtml,
      iconFn: icon,
      detectUploadMediaTypeFn: detectUploadMediaType,
      storyTag: resolveStoryTagStateForUpload()
    });
  }

  async function createBusinessPost({ restaurantId, caption, mediaUrl, mediaType, posterUrl = "" }) {
    if (!collection || !makeDocRef || !db) return;
    const base = (state?.restaurants || []).find((row) => String(row?.id || "") === String(restaurantId)) || {};
    const postRef = makeDocRef(collection(db, "restaurants", restaurantId, "socialPosts"));
    const postId = postRef.id;
    const nowIso = new Date().toISOString();
    // thumbUrl speist im Feed post.poster: Bilder nutzen sich selbst,
    // Videos das beim Upload eingefangene Poster-Standbild.
    const safePosterUrl = String(posterUrl || "").trim();
    const payload = {
      postType: "food",
      caption,
      media: [{
        url: mediaUrl,
        type: mediaType,
        thumbUrl: mediaType === "image" ? mediaUrl : safePosterUrl
      }],
      city: base.city || "Prishtina",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtClient: nowIso,
      updatedAtClient: nowIso,
      createdByUid: state?.user?.uid || "",
      likesCount: 0,
      commentsCount: 0,
      status: "active"
    };
    const feedPayload = {
      rid: restaurantId,
      postType: payload.postType,
      city: payload.city,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdAtClient: nowIso,
      updatedAtClient: nowIso,
      caption: String(caption || ""),
      content: String(caption || ""),
      captionShort: String(caption || "").slice(0, 90),
      mediaUrl: mediaUrl,
      thumbUrl: mediaType === "image" ? mediaUrl : safePosterUrl,
      mediaType,
      likesCount: 0,
      commentsCount: 0,
      status: "active",
      businessName: base.name || base.restaurantName || "",
      canonicalPath: `restaurants/${restaurantId}/socialPosts/${postId}`
    };
    await setDoc(postRef, payload);
    await setDoc(makeDocRef(db, "socialFeed", postId), feedPayload, { merge: true });
  }

  async function createUserPost({ uid, caption, url, mediaType, posterUrl = "" }) {
    if (!collection || !makeDocRef || !db) return;
    const isVideo = mediaType === "video";
    const postRef = makeDocRef(collection(db, "users", uid, "posts"));
    await setDoc(postRef, {
      url,
      caption,
      type: isVideo ? "video" : "square",
      mediaType: isVideo ? "video" : "image",
      isVideo,
      // Standbild fuer Video-Posts (leer bei Bildern): Renderer nutzen es
      // als poster, damit auf 3G sofort etwas sichtbar ist.
      thumbUrl: isVideo ? String(posterUrl || "").trim() : "",
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp()
    });
  }

  async function handleUploadPost() {
    if (!state?.user || !state?.upload?.file) return;

    const caption = docObj?.getElementById("uploadCaption")?.value?.trim() || "";
    const uploadMode = resolveUploadMode();
    if (uploadMode === "chooser") {
      state.upload.status = "Ju lutem zgjidhni fillimisht Story ose Feed.";
      render();
      return;
    }
    const isStoryMode = uploadMode === "story";
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    const restaurantId = state.userProfile?.restaurantId || docObj?.getElementById("uploadRestaurantSelect")?.value || "";

    if (isBusiness && !restaurantId) {
      state.upload.status = "Ju lutem zgjidhni biznesin ne llogari.";
      render();
      return;
    }
    if (isStoryMode && (!isBusiness || !restaurantId)) {
      state.upload.status = "Ngarkimi i story-t eshte i mundur vetem me profil biznesi.";
      render();
      return;
    }

    try {
      state.upload.status = "Upload startet.";
      render();

      const ownerId = isBusiness ? restaurantId : state.user.uid;
      const mediaType = detectUploadMediaType(state.upload.file);
      if (!mediaType) {
        state.upload.status = "Vetem foto ose video jane te mundura.";
        render();
        return;
      }
      const uploadResult = mediaType === "video"
        ? await uploadRawMediaFile(state.upload.file, ownerId)
        : await uploadCompressedImage(state.upload.file, ownerId, {
          maxSize: 1080,
          quality: 0.78,
          mimeType: "image/jpeg"
        });
      const cdnUrl = String(uploadResult?.cdnUrl || uploadResult?.url || "").trim();
      if (!cdnUrl) throw new Error("Ngarkimi deshtoi.");

      // Poster fuer ALLE Video-Uploads (Story, Feed, User-Post): erstes Frame
      // als JPEG. Die Kachel zeigt damit sofort ein Standbild (wichtig auf
      // 3G und wenn Autoplay blockiert ist). Fehler blockieren nichts.
      let videoPosterUrl = "";
      if (mediaType === "video") {
        try {
          const posterFile = await captureVideoPosterFile(state.upload.file);
          if (posterFile) {
            const posterUpload = await uploadCompressedImage(posterFile, ownerId, {
              maxSize: 720,
              quality: 0.72,
              mimeType: "image/jpeg"
            });
            videoPosterUrl = String(posterUpload?.cdnUrl || posterUpload?.url || "").trim();
          }
        } catch {}
      }

      if (isStoryMode) {
        const storyMenuItemId = String(
          state.upload?.menuItemId
          || docObj?.getElementById("uploadStoryMenuItemSelect")?.value
          || ""
        ).trim();
        const taggedItem = storyMenuItemId
          ? (storyTagItemsCache.get(restaurantId)?.items || []).find((item) => String(item?.id || "") === storyMenuItemId) || null
          : null;
        const storyPosterUrl = videoPosterUrl;
        await storySystemController?.createBusinessStory?.({
          restaurantId,
          caption,
          mediaUrl: cdnUrl,
          mediaType,
          createdByUid: state.user.uid,
          posterUrl: storyPosterUrl,
          menuItemId: storyMenuItemId,
          menuItemName: taggedItem?.name || "",
          menuItemPrice: taggedItem?.price ?? "",
          menuItemImage: taggedItem?.imageUrl || ""
        });
        const ownRestaurant = (state.restaurants || []).find((row) => String(row?.id || "").trim() === restaurantId) || {};
        const ownName = ownRestaurant?.name || ownRestaurant?.restaurantName || state.userProfile?.name || "";
        const ownLogo = ownRestaurant?.logoUrl || ownRestaurant?.logo || state.userProfile?.avatar || "";
        // Medien-Felder mitgeben, damit die Feed-Kachel sofort das frische
        // Foto/Video zeigt (nicht das Business-Logo als Fallback).
        const optimisticStory = normalizeStoryItemForDisplay({
          id: restaurantId,
          restaurantId,
          name: ownName,
          img: ownLogo,
          isLive: true,
          mediaType,
          mediaUrl: cdnUrl,
          videoUrl: mediaType === "video" ? cdnUrl : "",
          imageUrl: mediaType === "image" ? cdnUrl : storyPosterUrl,
          createdAt: Date.now()
        });
        if (optimisticStory) {
          const deduped = [optimisticStory, ...((state.stories || []).filter((item) => String(item?.restaurantId || "") !== restaurantId))];
          state.stories = deduped.slice(0, storyLimit);
          state.__pendingOwnStoryRestaurantId = restaurantId;
          state.__pendingOwnStoryUntil = Date.now() + (2 * 60 * 1000);
          if (typeof buildStoriesSignature === "function") {
            setFeedStoriesSignature(buildStoriesSignature(state.stories));
          }
          if (typeof writeCache === "function" && cacheStoriesKey) {
            writeCache(cacheStoriesKey, state.stories);
          }
          if (state.activeTab === "feed" && getLastRenderMode() === "main") {
            updateFeedDom();
          }
        }
        // Nach dem Posten direkt zur eigenen Story (Reels-Ansicht) statt Feed.
        const viewerUrl = String(storySystemController?.buildStoryViewerUrl?.(restaurantId) || "").trim();
        const win = docObj?.defaultView || null;
        if (viewerUrl && win?.location) {
          if (win.sessionStorage) {
            try {
              win.sessionStorage.setItem(`mnyra_story_viewer_hint_v1:${restaurantId}`, JSON.stringify({
                restaurantId,
                meta: { name: ownName, restaurantName: ownName, logoUrl: ownLogo },
                savedAt: Date.now()
              }));
              // Alten Viewer-Cache verwerfen, damit die frisch gepostete
              // Story sofort ganz oben erscheint statt eines alten Stands.
              win.sessionStorage.removeItem(`mnyra_story_viewer_cache_v2:${restaurantId}`);
            } catch {}
          }
          releaseUploadPreviewUrl(state.upload.preview);
          state.upload = { preview: "", caption: "", file: null, status: "", mode: "feed" };
          win.location.assign(viewerUrl);
          return;
        }
        await loadStoriesForFeed({ force: true, refreshUi: true });
      } else if (isBusiness) {
        await createBusinessPost({
          restaurantId,
          caption,
          mediaUrl: cdnUrl,
          mediaType,
          posterUrl: videoPosterUrl
        });
        await loadFeedPosts({ force: true });
        await loadBusinessPosts({ force: true });
      } else {
        await createUserPost({
          uid: state.user.uid,
          caption,
          url: cdnUrl,
          mediaType,
          posterUrl: videoPosterUrl
        });
        await loadUserPosts({ force: true });
      }

      releaseUploadPreviewUrl(state.upload.preview);
      state.upload = { preview: "", caption: "", file: null, status: "", mode: "feed" };
      setState({ activeTab: isBusiness ? "feed" : "profile" });
    } catch (err) {
      console.error(err);
      state.upload.status = err?.message || "Ngarkimi deshtoi.";
      render();
    }
  }

  return {
    detectUploadMediaType,
    releaseUploadPreviewUrl,
    requestMediaActionTicket,
    uploadCompressedImage,
    uploadRawMediaFile,
    captureVideoPosterFile,
    renderUploadView,
    createBusinessPost,
    createUserPost,
    handleUploadPost
  };
}
