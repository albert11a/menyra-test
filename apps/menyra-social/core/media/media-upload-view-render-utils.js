export function detectUploadMediaTypeCore(file) {
  const mime = String(file?.type || "").trim().toLowerCase();
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  return "";
}

export function renderUploadViewCore({
  state = null,
  storySystemController = null,
  isLocalBusinessProfileFn = () => false,
  getOptimizedImageUrlFn = (value) => String(value || "").trim(),
  escapeHtmlFn = (value) => String(value || ""),
  iconFn = () => "",
  detectUploadMediaTypeFn = detectUploadMediaTypeCore
} = {}) {
  const profile = state?.userProfile || {};
  const uploadMode = storySystemController?.normalizeUploadIntent?.(state?.upload?.mode, { fallback: "feed" }) || "feed";
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
  const detectUploadMediaType = typeof detectUploadMediaTypeFn === "function"
    ? detectUploadMediaTypeFn
    : detectUploadMediaTypeCore;

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
  const uploadAccept = "image/*,video/*";
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
