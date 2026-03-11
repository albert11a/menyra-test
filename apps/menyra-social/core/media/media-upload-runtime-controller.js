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
    const mime = String(file?.type || "").trim().toLowerCase();
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("image/")) return "image";
    return "";
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
    if (!safeAction) throw new Error("Media Aktion fehlt.");
    if (!fetchMedia) throw new Error("Media Netzwerk fehlt.");
    const user = auth?.currentUser || state?.user || null;
    if (!user || typeof user.getIdToken !== "function") {
      throw new Error("Bitte zuerst anmelden.");
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
      throw new Error(data?.error || "Media Autorisierung fehlgeschlagen.");
    }
    return String(data.ticket);
  }

  async function uploadCompressedImage(file, ownerId, { maxSize, quality, mimeType }) {
    if (!fetchMedia) throw new Error("Media Netzwerk fehlt.");
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) throw new Error("Max 15MB pro Bild.");
    if (!String(file.type || "").startsWith("image/")) throw new Error("Nur Bilder erlaubt.");

    const compressedFile = await compressImage(file, maxSize, quality, mimeType);
    const ticket = await requestMediaActionTicket("image_upload", { restaurantId: ownerId });
    const form = new FormData();
    form.append("file", compressedFile, compressedFile.name || "image.jpg");
    form.append("restaurantId", ownerId || "");

    const res = await fetchMedia(`${mediaBaseUrl}/image/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ticket}`
      },
      body: form
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
    return {
      url: String(data.url || "").trim(),
      cdnUrl: String(data.cdnUrl || data.url || "").trim()
    };
  }

  async function uploadRawMediaFile(file, ownerId, { maxBytes = 50 * 1024 * 1024 } = {}) {
    if (!fetchMedia) throw new Error("Media Netzwerk fehlt.");
    if (!file) throw new Error("Datei fehlt.");
    if (file.size > maxBytes) throw new Error("Max 50MB pro Story Video.");
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
    if (!res.ok || !data?.url) throw new Error(data?.error || "Upload fehlgeschlagen.");
    return {
      url: String(data.url || "").trim(),
      cdnUrl: String(data.cdnUrl || data.url || "").trim(),
      videoId: String(data.videoId || "").trim()
    };
  }

  function renderUploadView() {
    const profile = state?.userProfile || {};
    const uploadMode = resolveUploadMode();
    if (uploadMode === "chooser") {
      return `
        <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
          <header class="flex items-center justify-between mb-8">
            <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
            <h2 class="text-xl font-black italic uppercase text-slate-900">Post waehlen</h2>
            <div class="w-10"></div>
          </header>
          ${storySystemController?.renderUploadChooserView?.({ profile }) || ""}
        </div>
      `;
    }

    const isStoryMode = uploadMode === "story";
    const selectedUploadMediaType = detectUploadMediaType(state?.upload?.file);
    const isVideoPreview = selectedUploadMediaType === "video";
    const previewUrl = isVideoPreview
      ? String(state?.upload?.preview || "").trim()
      : getOptimizedImageUrl(state?.upload?.preview, "large");
    const uploadAccept = isStoryMode ? "image/*,video/*" : "image/*";
    return `
      <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
        <header class="flex items-center justify-between mb-8">
          <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${icon("arrow-left", "w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase text-slate-900">${isStoryMode ? "Neue Story" : "Neuer Post"}</h2>
          <div class="w-10"></div>
        </header>
        <input type="file" id="uploadFileInput" class="hidden" accept="${uploadAccept}" />
        ${state?.upload?.preview ? `
          <div class="space-y-6">
            ${isVideoPreview
              ? `<video src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg bg-black" autoplay muted loop playsinline preload="metadata"></video>`
              : `<img src="${escapeHtml(previewUrl)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />`
            }
            <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
              <textarea id="uploadCaption" placeholder="${isStoryMode ? "Story Text..." : "Bildunterschrift..."}" class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${escapeHtml(state?.upload?.caption)}</textarea>
            </div>
            <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${state?.upload?.status || (isStoryMode ? "Story posten" : "Posten")}</button>
            <div class="text-center text-[10px] font-bold text-slate-400">${escapeHtml(state?.upload?.status)}</div>
          </div>
        ` : `
          <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
            <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${icon("upload", "w-8 h-8")}</div>
            <h3 class="text-lg font-black mb-2 italic text-slate-900">${isStoryMode ? "Foto oder Video waehlen" : "Foto waehlen"}</h3>
            <p class="text-sm font-medium text-slate-500">Posten als ${isStoryMode ? "Business (Story)" : (isLocalBusinessProfile(profile) ? "Business (Feed)" : "User (Profil)")}</p>
          </div>
        `}
      </div>
    `;
  }

  async function createBusinessPost({ restaurantId, caption, mediaUrl, mediaType }) {
    if (!collection || !makeDocRef || !db) return;
    const base = (state?.restaurants || []).find((row) => String(row?.id || "") === String(restaurantId)) || {};
    const postRef = makeDocRef(collection(db, "restaurants", restaurantId, "socialPosts"));
    const postId = postRef.id;
    const payload = {
      postType: "food",
      caption,
      media: [{
        url: mediaUrl,
        type: mediaType,
        thumbUrl: mediaType === "image" ? mediaUrl : ""
      }],
      city: base.city || "Prishtina",
      createdAt: serverTimestamp(),
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
      captionShort: String(caption || "").slice(0, 90),
      thumbUrl: mediaType === "image" ? mediaUrl : "",
      mediaType,
      likesCount: 0,
      commentsCount: 0,
      status: "active",
      businessName: base.name || base.restaurantName || ""
    };
    await setDoc(postRef, payload);
    await setDoc(makeDocRef(db, "socialFeed", postId), feedPayload, { merge: true });
  }

  async function createUserPost({ uid, caption, url }) {
    if (!collection || !makeDocRef || !db) return;
    const postRef = makeDocRef(collection(db, "users", uid, "posts"));
    await setDoc(postRef, {
      url,
      caption,
      type: "square",
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
      state.upload.status = "Bitte zuerst Story oder Feed waehlen.";
      render();
      return;
    }
    const isStoryMode = uploadMode === "story";
    const isBusiness = isLocalBusinessProfile(state.userProfile);
    const restaurantId = state.userProfile?.restaurantId || docObj?.getElementById("uploadRestaurantSelect")?.value || "";

    if (isBusiness && !restaurantId) {
      state.upload.status = "Bitte Business im Account waehlen.";
      render();
      return;
    }
    if (isStoryMode && (!isBusiness || !restaurantId)) {
      state.upload.status = "Story Upload nur mit Business Profil moeglich.";
      render();
      return;
    }

    try {
      state.upload.status = "Upload startet.";
      render();

      const ownerId = isBusiness ? restaurantId : state.user.uid;
      const mediaType = detectUploadMediaType(state.upload.file);
      if (!mediaType) {
        state.upload.status = "Nur Bild oder Video moeglich.";
        render();
        return;
      }
      if (!isStoryMode && mediaType !== "image") {
        state.upload.status = "Feed Upload nur mit Bild moeglich.";
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
      if (!cdnUrl) throw new Error("Upload fehlgeschlagen.");

      if (isStoryMode) {
        await storySystemController?.createBusinessStory?.({
          restaurantId,
          caption,
          mediaUrl: cdnUrl,
          mediaType,
          createdByUid: state.user.uid
        });
        const ownRestaurant = (state.restaurants || []).find((row) => String(row?.id || "").trim() === restaurantId) || {};
        const optimisticStory = normalizeStoryItemForDisplay({
          id: restaurantId,
          restaurantId,
          name: ownRestaurant?.name || ownRestaurant?.restaurantName || state.userProfile?.name || "",
          img: ownRestaurant?.logoUrl || ownRestaurant?.logo || state.userProfile?.avatar || "",
          isLive: true
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
        await loadStoriesForFeed({ force: true, refreshUi: true });
      } else if (isBusiness) {
        await createBusinessPost({
          restaurantId,
          caption,
          mediaUrl: cdnUrl,
          mediaType: "image"
        });
        await loadFeedPosts({ force: true });
        await loadBusinessPosts({ force: true });
      } else {
        await createUserPost({
          uid: state.user.uid,
          caption,
          url: cdnUrl
        });
        await loadUserPosts({ force: true });
      }

      releaseUploadPreviewUrl(state.upload.preview);
      state.upload = { preview: "", caption: "", file: null, status: "", mode: "feed" };
      setState({ activeTab: isBusiness ? "feed" : "profile" });
    } catch (err) {
      console.error(err);
      state.upload.status = err?.message || "Upload fehlgeschlagen.";
      render();
    }
  }

  return {
    detectUploadMediaType,
    releaseUploadPreviewUrl,
    requestMediaActionTicket,
    uploadCompressedImage,
    uploadRawMediaFile,
    renderUploadView,
    createBusinessPost,
    createUserPost,
    handleUploadPost
  };
}
