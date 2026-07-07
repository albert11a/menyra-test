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

  function buildStoryViewerUrl(restaurantId = "", { postId = "" } = {}) {
    const rid = String(restaurantId || "").trim();
    if (!rid) return buildUrlFn("apps/menyra-social/story/index.html");
    const params = { r: rid };
    // Video-Beitraege springen im Reels-Viewer direkt zu ihrem Video.
    const safePostId = String(postId || "").trim();
    if (safePostId) params.post = safePostId;
    return buildUrlFn("apps/menyra-social/story/index.html", params);
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
    createdByUid = "",
    posterUrl = "",
    menuItemId = "",
    menuItemName = "",
    menuItemPrice = "",
    menuItemImage = ""
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
      // Video-Stories bekommen ein echtes Poster (erstes Frame), damit die
      // Feed-Kachel auch ohne Autoplay ein Bild zeigt (iOS-Stromsparmodus).
      imageUrl: kind === "image" ? media : String(posterUrl || "").trim(),
      videoUrl: kind === "video" ? media : "",
      status: "active",
      active: true,
      isLive: true,
      // Markiertes Produkt/Gericht: Der Story-Viewer rendert daraus die
      // Produkt-Card (Foto, Name, Preis) mit Deep-Link /menu?r=...&item=...
      // Name/Preis/Bild als Snapshot, damit der Viewer keinen Zweit-Read braucht.
      menuItemId: String(menuItemId || "").trim(),
      menuItemName: String(menuItemName || "").trim(),
      menuItemPrice: menuItemPrice ?? "",
      menuItemImage: String(menuItemImage || "").trim(),
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

  function isLikelyVideoMediaUrl(value = "") {
    const url = String(value || "").trim().toLowerCase();
    if (!url) return false;
    if (/\.m3u8($|\?)/.test(url)) return true;
    if (/\.mpd($|\?)/.test(url)) return true;
    if (/\.mp4($|\?)/.test(url)) return true;
    if (/\.webm($|\?)/.test(url)) return true;
    if (/\.mov($|\?)/.test(url)) return true;
    if (/\.m4v($|\?)/.test(url)) return true;
    if (/\.ogv($|\?)/.test(url)) return true;
    return false;
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
      const rawMediaType = String(data.mediaType || data.type || data.media?.[0]?.type || "").trim().toLowerCase();
      const imageUrl = String(data.imageUrl || data.thumbUrl || data.mediaImage || "").trim();
      const videoUrl = String(data.videoUrl || data.playbackUrl || "").trim();
      const embedUrl = String(data.embedUrl || "").trim();
      const mediaUrl = String(data.mediaUrl || data.url || data.media?.[0]?.url || "").trim();
      const inferredVideo = isLikelyVideoMediaUrl(mediaUrl);
      const resolvedMediaType = rawMediaType === "video"
        ? "video"
        : (rawMediaType === "image"
          ? "image"
          : (videoUrl || inferredVideo ? "video" : "image"));
      const resolvedVideoUrl = videoUrl || (resolvedMediaType === "video" ? mediaUrl : "");
      const resolvedImageUrl = imageUrl || (resolvedMediaType === "image" ? mediaUrl : "");
      const hasMedia = !!embedUrl || !!resolvedVideoUrl || !!resolvedImageUrl || (!!data.libraryId && !!data.videoId);
      if (!hasMedia) return;
      const createdAt = data.createdAt || data.updatedAt || null;
      const updatedAt = data.updatedAt || data.createdAt || null;

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
        : sourceLogo;
      storyMap.set(restaurantId, {
        id: restaurantId,
        restaurantId,
        name: hasKnownRestaurantIdentity
          ? (canonicalName || sourceName || "")
          : (sourceName || ""),
        img: logoSource,
        isLive: data.isLive !== undefined ? !!data.isLive : true,
        mediaType: resolvedMediaType,
        imageUrl: resolvedImageUrl,
        videoUrl: resolvedVideoUrl,
        embedUrl,
        mediaUrl: mediaUrl || resolvedImageUrl || resolvedVideoUrl || embedUrl,
        libraryId: String(data.libraryId || "").trim(),
        videoId: String(data.videoId || "").trim(),
        createdAt,
        updatedAt
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
