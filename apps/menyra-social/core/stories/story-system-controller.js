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
  const allowedUploadPhases = new Set([
    "idle",
    "ready",
    "validating",
    "uploading",
    "persisting",
    "reconciling",
    "failed",
    "done"
  ]);

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

  function normalizeUploadPhase(value = "", { fallback = "idle" } = {}) {
    const normalizedFallback = allowedUploadPhases.has(String(fallback || "").trim().toLowerCase())
      ? String(fallback || "").trim().toLowerCase()
      : "idle";
    const normalizedValue = String(value || "").trim().toLowerCase();
    return allowedUploadPhases.has(normalizedValue) ? normalizedValue : normalizedFallback;
  }

  function buildUploadState(currentUpload = {}, { fallbackMode = "feed" } = {}) {
    const base = currentUpload && typeof currentUpload === "object" ? currentUpload : {};
    const normalizedMode = normalizeUploadIntent(base.mode, { fallback: fallbackMode });
    const file = base.file || null;
    const preview = String(base.preview || "").trim();
    const caption = String(base.caption || "");
    const hasSelectedFile = !!file;
    let phase = String(base.phase || "").trim().toLowerCase();
    if (!phase) {
      phase = hasSelectedFile ? "ready" : "idle";
    }
    phase = normalizeUploadPhase(phase, { fallback: hasSelectedFile ? "ready" : "idle" });
    if (!hasSelectedFile && phase !== "idle") {
      phase = "idle";
    }
    return {
      preview,
      caption,
      file,
      status: String(base.status || ""),
      mode: normalizedMode,
      phase,
      activeAttemptId: String(base.activeAttemptId || "").trim(),
      activeAttemptFingerprint: String(base.activeAttemptFingerprint || "").trim()
    };
  }

  function buildUploadStateForIntent(intent = "", currentUpload = {}) {
    const base = buildUploadState(currentUpload, { fallbackMode: intent || "feed" });
    const normalizedIntent = normalizeUploadIntent(intent, { fallback: "feed" });
    if (normalizedIntent === "chooser") {
      return {
        preview: "",
        caption: "",
        file: null,
        status: "",
        mode: "chooser",
        phase: "idle",
        activeAttemptId: "",
        activeAttemptFingerprint: ""
      };
    }
    return {
      preview: base.preview || "",
      caption: base.caption || "",
      file: base.file || null,
      status: "",
      mode: normalizedIntent,
      phase: base.file ? "ready" : "idle",
      activeAttemptId: "",
      activeAttemptFingerprint: ""
    };
  }

  function validateUploadContext({
    profile = null,
    user = null,
    uploadMode = "",
    restaurantId = ""
  } = {}) {
    const normalizedMode = normalizeUploadIntent(uploadMode, { fallback: "feed" });
    const safeRestaurantId = String(restaurantId || profile?.restaurantId || "").trim();
    const isBusiness = isLocalBusinessProfileFn(profile || {});
    const isStoryMode = normalizedMode === "story";
    if (!user || !String(user.uid || "").trim()) {
      return {
        ok: false,
        error: "Bitte zuerst anmelden.",
        uploadMode: normalizedMode,
        isBusiness,
        isStoryMode,
        restaurantId: safeRestaurantId,
        ownerId: ""
      };
    }
    if (normalizedMode === "chooser") {
      return {
        ok: false,
        error: "Bitte zuerst Story oder Feed waehlen.",
        uploadMode: normalizedMode,
        isBusiness,
        isStoryMode,
        restaurantId: safeRestaurantId,
        ownerId: ""
      };
    }
    if (isBusiness && !safeRestaurantId) {
      return {
        ok: false,
        error: "Bitte Business im Account waehlen.",
        uploadMode: normalizedMode,
        isBusiness,
        isStoryMode,
        restaurantId: safeRestaurantId,
        ownerId: ""
      };
    }
    if (isStoryMode && (!isBusiness || !safeRestaurantId)) {
      return {
        ok: false,
        error: "Story Upload nur mit Business Profil moeglich.",
        uploadMode: normalizedMode,
        isBusiness,
        isStoryMode,
        restaurantId: safeRestaurantId,
        ownerId: ""
      };
    }
    return {
      ok: true,
      error: "",
      uploadMode: normalizedMode,
      isBusiness,
      isStoryMode,
      restaurantId: safeRestaurantId,
      ownerId: isBusiness ? safeRestaurantId : String(user.uid || "").trim()
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
    createdByUid = "",
    storyId = ""
  } = {}) {
    if (!db || typeof collectionFn !== "function" || typeof docFn !== "function" || typeof setDocFn !== "function" || typeof serverTimestampFn !== "function") {
      throw new Error("Story Runtime nicht bereit.");
    }
    const rid = String(restaurantId || "").trim();
    const media = String(mediaUrl || "").trim();
    if (!rid || !media) throw new Error("Story Daten unvollstaendig.");
    const explicitStoryId = String(storyId || "").trim();
    const postRef = explicitStoryId
      ? docFn(collectionFn(db, "restaurants", rid, "stories"), explicitStoryId)
      : docFn(collectionFn(db, "restaurants", rid, "stories"));
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
        : (sourceLogo || "");
      storyMap.set(restaurantId, {
        id: restaurantId,
        restaurantId,
        name: hasKnownRestaurantIdentity
          ? (canonicalName || sourceName || "")
          : (sourceName || ""),
        img: logoSource,
        isLive: data.isLive !== undefined ? !!data.isLive : true
      });
    });

    return Array.from(storyMap.values()).slice(0, Math.max(1, Number(maxItems) || 24));
  }

  return {
    normalizeUploadIntent,
    normalizeUploadPhase,
    buildUploadState,
    buildUploadStateForIntent,
    validateUploadContext,
    buildStoryViewerUrl,
    isBusinessStoryPostEligible,
    renderUploadChooserView,
    createBusinessStory,
    mapStorySnapshotRowsToFeedStories,
    escapeHtml: (value) => escapeHtmlFn(value)
  };
}
