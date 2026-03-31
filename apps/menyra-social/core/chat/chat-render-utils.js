export function renderChatMessagesPanelCore({
  messages = [],
  blockedByOwner = false,
  mutedActive = false,
  muteUntilLabel = "",
  partnerName = "User",
  escapeHtml,
  icon,
  formatRelative,
  toDateSafe,
  nowMs = Date.now()
} = {}) {
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const formatRel = typeof formatRelative === "function" ? formatRelative : ((value) => String(value || ""));
  const toDate = typeof toDateSafe === "function" ? toDateSafe : (() => null);
  const list = Array.isArray(messages) ? messages : [];
  const nowDate = new Date(Number(nowMs || Date.now()) || Date.now());
  const normalizeDeliveryStatus = (value, fallback = "sent") => {
    const fallbackStatus = String(fallback || "").trim().toLowerCase();
    const safeFallback = fallbackStatus === "failed" || fallbackStatus === "pending"
      ? fallbackStatus
      : "sent";
    const normalized = String(value || "").trim().toLowerCase();
    if (normalized === "pending" || normalized === "failed" || normalized === "sent") {
      return normalized;
    }
    return safeFallback;
  };
  const resolveDeliveryMeta = (message = {}) => {
    if (String(message?.from || "") !== "self") {
      return { status: "", label: "", textClass: "", retry: false };
    }
    const status = normalizeDeliveryStatus(message?.deliveryStatus, "sent");
    if (status === "pending") {
      return {
        status,
        label: "Sende...",
        textClass: "text-amber-500",
        retry: false
      };
    }
    if (status === "failed") {
      return {
        status,
        label: "Fehlgeschlagen",
        textClass: "text-rose-500",
        retry: true
      };
    }
    return {
      status,
      label: "Gesendet",
      textClass: "text-emerald-500",
      retry: false
    };
  };

  return `
    ${blockedByOwner ? `
      <div class="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest">
        Chat blockiert
      </div>
    ` : ""}
    ${mutedActive ? `
      <div class="p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest">
        Ruhemodus bis ${esc(muteUntilLabel)}
      </div>
    ` : ""}
    ${list.length ? list.map((message) => {
      const delivery = resolveDeliveryMeta(message);
      return `
      <div class="flex ${message.from === "self" ? "justify-end" : "justify-start"}">
        <div class="max-w-[84%]">
          <div class="rounded-[1.6rem] px-4 py-3 ${message.from === "self" ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-100"}">
            ${(Array.isArray(message.attachments) && message.attachments.length) ? `
              <div class="space-y-2 ${message.text ? "mb-3" : ""}">
                ${message.attachments.map((attachment) => `
                  ${attachment.kind === "image" && attachment.dataUrl ? `
                    <img src="${esc(attachment.dataUrl)}" class="w-full max-h-56 rounded-2xl object-cover border ${message.from === "self" ? "border-slate-700" : "border-slate-100"}" />
                  ` : `
                    ${attachment.dataUrl ? `
                      <a href="${esc(attachment.dataUrl)}" download="${esc(attachment.name || "datei")}" class="flex items-center gap-3 p-3 rounded-2xl ${message.from === "self" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-700"}">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center ${message.from === "self" ? "bg-slate-700" : "bg-white border border-slate-200"}">${iconFn("paperclip", "w-4 h-4")}</div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-black truncate">${esc(attachment.name || "Datei")}</div>
                          <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">Datei</div>
                        </div>
                      </a>
                    ` : `
                      <div class="flex items-center gap-3 p-3 rounded-2xl ${message.from === "self" ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-700"}">
                        <div class="w-9 h-9 rounded-xl flex items-center justify-center ${message.from === "self" ? "bg-slate-700" : "bg-white border border-slate-200"}">${iconFn("file", "w-4 h-4")}</div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-black truncate">${esc(attachment.name || "Datei")}</div>
                          <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${attachment.oversize ? "Zu gross fuer Vorschau" : "Datei"}</div>
                        </div>
                      </div>
                    `}
                  `}
                `).join("")}
              </div>
            ` : ""}
            ${message.text ? `<div class="text-sm font-medium leading-relaxed whitespace-pre-wrap">${esc(message.text || "")}</div>` : ""}
          </div>
          <div class="flex items-center ${message.from === "self" ? "justify-end" : "justify-start"} gap-2 mt-2 px-1">
            <button data-chat-save="${esc(message.id)}" class="w-7 h-7 rounded-full flex items-center justify-center ${message.saved ? "bg-emerald-100 text-emerald-600" : "bg-white text-slate-400 border border-slate-200"}">
              ${iconFn(message.saved ? "check" : "plus", "w-3.5 h-3.5")}
            </button>
            <button data-chat-like="${esc(message.id)}" class="w-7 h-7 rounded-full flex items-center justify-center ${message.liked ? "bg-rose-100 text-rose-500" : "bg-white text-slate-400 border border-slate-200"}">
              ${iconFn("heart", `w-3.5 h-3.5 ${message.liked ? "fill-rose-500 text-rose-500" : ""}`)}
            </button>
            <div class="text-[9px] font-bold uppercase tracking-widest ${message.from === "self" ? "text-slate-400" : "text-slate-300"}">
              ${message.saved ? "Gespeichert" : "24h"}
            </div>
            ${delivery.label ? `
              <div class="text-[9px] font-black uppercase tracking-widest ${delivery.textClass}">
                ${esc(delivery.label)}
              </div>
            ` : ""}
            ${delivery.retry ? `
              <button data-chat-retry="${esc(message.id)}" class="h-7 px-2 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest">
                Retry
              </button>
            ` : ""}
          </div>
          <div class="text-[9px] font-bold uppercase tracking-widest mt-2 ${message.from === "self" ? "text-slate-300" : "text-slate-400"}">${esc(formatRel(toDate(message.createdAt) || nowDate))}</div>
        </div>
      </div>
    `;
    }).join("") : `
      <div class="h-full min-h-[40vh] flex items-center justify-center text-center">
        <div>
          <div class="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            ${iconFn("message-circle", "w-6 h-6")}
          </div>
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Schreib ${esc(partnerName || "User")} zuerst</p>
        </div>
      </div>
    `}
  `;
}

export function renderChatPendingAttachmentsCore({
  pendingAttachments = [],
  escapeHtml,
  icon
} = {}) {
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const list = Array.isArray(pendingAttachments) ? pendingAttachments : [];
  if (!list.length) return "";
  return `
    <div class="flex gap-2 overflow-x-auto no-scrollbar pb-3">
      ${list.map((attachment) => `
        <div class="shrink-0 min-w-[84px] max-w-[120px] rounded-2xl border border-slate-100 bg-slate-50 p-2 relative">
          <button data-chat-remove-attachment="${esc(attachment.id)}" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
            ${iconFn("x", "w-3 h-3")}
          </button>
          ${attachment.kind === "image" && attachment.dataUrl ? `
            <img src="${esc(attachment.dataUrl)}" class="w-full h-16 rounded-xl object-cover mb-2" />
          ` : `
            <div class="w-full h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
              ${iconFn(attachment.kind === "image" ? "image" : "file", "w-5 h-5")}
            </div>
          `}
          <div class="text-[10px] font-black text-slate-600 truncate pr-4">${esc(attachment.name || "Datei")}</div>
        </div>
      `).join("")}
    </div>
  `;
}
