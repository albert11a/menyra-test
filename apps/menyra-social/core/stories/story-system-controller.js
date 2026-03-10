function toDateSafeValue(value) {
  try {
    if (value && typeof value.toDate === "function") return value.toDate();
  } catch {}
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) ? parsed : null;
  }
  return null;
}

export function createStorySystemController({
  buildUrlFn = () => "",
  iconFn = () => "",
  escapeHtmlFn = (value) => String(value || ""),
  isLocalBusinessProfileFn = () => false,
  collectionFn = null,
  docFn = null,
  setDocFn = null,
  serverTimestampFn = null,
  db = null
} = {}) {
  function normalizeUploadIntent(value = "", { fallback = "feed" } = {}) {
    const normalizedFallback = ["feed", "story", "chooser"].includes(String(fallback || "").trim().toLowerCase())
      ? String(fallback || "").trim().toLowerCase()
      : "feed";
    const normalizedValue = String(value || "").trim().toLowerCase();
    if (normalizedValue === "story") return "story";
    if (normalizedValue === "chooser") return "chooser";
    if (normalizedValue === "feed") return "feed";
    return normalizedFallback;
  }

  function buildUploadStateForIntent(intent = "", currentUpload = {}) {
    const base = currentUpload && typeof currentUpload === "object" ? currentUpload : {};
    const normalizedIntent = normalizeUploadIntent(intent, { fallback: "feed" });
    if (normalizedIntent === "chooser") {
      return {
        preview: "",
        caption: "",
        file: null,
        status: "",
        mode: "chooser"
      };
    }
    return {
      preview: base.preview || "",
      caption: base.caption || "",
      file: base.file || null,
      status: "",
      mode: normalizedIntent
    };
  }

  function buildStoryViewerUrl(restaurantId = "") {
    const rid = String(restaurantId || "").trim();
    if (!rid) return buildUrlFn("apps/menyra-social/story/index.html");
    return buildUrlFn("apps/menyra-social/story/index.html", { r: rid });
  }

  function isBusinessStoryPostEligible(profile = null) {
    const viewProfile = profile || {};
    if (!isLocalBusinessProfileFn(viewProfile)) return false;
    return !!String(viewProfile.restaurantId || "").trim();
  }

  function renderUploadChooserView({ profile = null } = {}) {
    const canPostStory = isBusinessStoryPostEligible(profile);
    const storyBtnClass = canPostStory
      ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30"
      : "bg-slate-200 text-slate-400 cursor-not-allowed";
    return `
      <div class="flex-1 flex flex-col justify-center gap-4">
        <button data-upload-mode="story" ${canPostStory ? "" : "disabled"} class="w-full p-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${storyBtnClass}">
          ${iconFn("camera", "w-5 h-5")} Story posten
        </button>
        <button data-upload-mode="feed" class="w-full p-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 bg-slate-900 text-white shadow-xl">
          ${iconFn("plus-square", "w-5 h-5")} Feed posten
        </button>
        <div class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">${canPostStory ? "Waehl deinen Posting Typ" : "Stories nur fuer Business Accounts"}</div>
      </div>
    `;
  }

  async function createBusinessStory({
    restaurantId = "",
    caption = "",
    mediaUrl = "",
    mediaType = "image",
    createdByUid = ""
  } = {}) {
    if (!db || typeof collectionFn !== "function" || typeof docFn !== "function" || typeof setDocFn !== "function" || typeof serverTimestampFn !== "function") {
      throw new Error("Story Runtime nicht bereit.");
    }
    const rid = String(restaurantId || "").trim();
    const media = String(mediaUrl || "").trim();
    if (!rid || !media) throw new Error("Story Daten unvollstaendig.");
    const postRef = docFn(collectionFn(db, "restaurants", rid, "stories"));
    const nowTs = serverTimestampFn();
    const kind = String(mediaType || "image").trim().toLowerCase() === "video" ? "video" : "image";
    await setDocFn(postRef, {
      title: "",
      description: String(caption || "").trim(),
      caption: String(caption || "").trim(),
      mediaType: kind,
      mediaUrl: media,
      imageUrl: kind === "image" ? media : "",
      videoUrl: kind === "video" ? media : "",
      status: "active",
      active: true,
      isLive: true,
      createdByUid: String(createdByUid || "").trim(),
      createdAt: nowTs,
      updatedAt: nowTs
    }, { merge: true });
    return postRef.id;
  }

  function isStoryDocActive(row = {}) {
    const status = String(row.status || "active").trim().toLowerCase();
    if (status && status !== "active" && status !== "live") return false;
    if (row.active === false || row.isActive === false) return false;
    const expiresAt = toDateSafeValue(row.expiresAt || row.expireAt || row.expiresOn);
    if (expiresAt && expiresAt.getTime() < Date.now()) return false;
    return true;
  }

  function extractStoryRestaurantIdFromDoc(docSnap, row = {}) {
    const direct = String(row.restaurantId || row.rid || "").trim();
    if (direct) return direct;
    let currentDocRef = docSnap?.ref?.parent?.parent || null;
    while (currentDocRef) {
      const parentCollectionId = String(currentDocRef?.parent?.id || "").trim().toLowerCase();
      if (parentCollectionId === "restaurants") {
        return String(currentDocRef.id || "").trim();
      }
      currentDocRef = currentDocRef?.parent?.parent || null;
    }
    return "";
  }

  function sanitizeStoryBusinessName(value = "") {
    const label = String(value || "").trim();
    if (!label) return "";
    return label.toLowerCase() === "business" ? "" : label;
  }

  function mapStorySnapshotRowsToFeedStories({
    docSnaps = [],
    restaurants = [],
    canShowFeedRestaurantIdFn = () => true,
    maxItems = 24,
    toDateSafeFn = toDateSafeValue
  } = {}) {
    const safeRows = Array.isArray(docSnaps) ? docSnaps : [];
    const restList = Array.isArray(restaurants) ? restaurants : [];
    const sortedRows = safeRows
      .map((docSnap) => ({ docSnap, data: docSnap?.data?.() || {} }))
      .sort((a, b) => {
        const timeDiff = (toDateSafeFn(b.data.createdAt)?.getTime() || 0) - (toDateSafeFn(a.data.createdAt)?.getTime() || 0);
        if (timeDiff !== 0) return timeDiff;
        const aRestaurantId = extractStoryRestaurantIdFromDoc(a.docSnap, a.data);
        const bRestaurantId = extractStoryRestaurantIdFromDoc(b.docSnap, b.data);
        return String(aRestaurantId || "").localeCompare(String(bRestaurantId || ""));
      });

    const storyMap = new Map();
    sortedRows.forEach(({ docSnap, data }) => {
      if (!isStoryDocActive(data)) return;
      const restaurantId = extractStoryRestaurantIdFromDoc(docSnap, data);
      if (!restaurantId || storyMap.has(restaurantId)) return;
      if (!canShowFeedRestaurantIdFn(restaurantId)) return;
      const media = String(
        data.imageUrl
        || data.mediaUrl
        || data.videoUrl
        || data.embedUrl
        || data.url
        || data.media?.[0]?.url
        || ""
      ).trim();
      if (!media && !(data.libraryId && data.videoId)) return;

      const restaurant = restList.find((row) => String(row?.id || "").trim() === restaurantId) || {};
      const hasKnownRestaurantIdentity = !!restaurant?.id;
      const canonicalLogo = String(
        restaurant.logoUrl
        || restaurant.logo
        || restaurant.logoURL
        || ""
      ).trim();
      const sourceLogo = String(data.logoUrl || data.logo || "").trim();
      const canonicalName = sanitizeStoryBusinessName(
        restaurant.name
        || restaurant.restaurantName
        || restaurant.displayName
        || restaurant.businessName
        || ""
      );
      const sourceName = sanitizeStoryBusinessName(
        data.businessName
        || data.restaurantName
        || ""
      );
      const logoSource = hasKnownRestaurantIdentity
        ? (canonicalLogo || "")
        : (sourceLogo || media);
      storyMap.set(restaurantId, {
        id: restaurantId,
        restaurantId,
        name: hasKnownRestaurantIdentity
          ? (canonicalName || "")
          : (sourceName || ""),
        img: logoSource,
        isLive: data.isLive !== undefined ? !!data.isLive : true
      });
    });

    return Array.from(storyMap.values()).slice(0, Math.max(1, Number(maxItems) || 24));
  }

  return {
    normalizeUploadIntent,
    buildUploadStateForIntent,
    buildStoryViewerUrl,
    isBusinessStoryPostEligible,
    renderUploadChooserView,
    createBusinessStory,
    mapStorySnapshotRowsToFeedStories,
    escapeHtml: (value) => escapeHtmlFn(value)
  };
}
