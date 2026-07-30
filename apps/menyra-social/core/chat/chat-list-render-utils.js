export function renderChatListPanelCore({
  scope = "inbox",
  inboxThreads = [],
  archivedThreads = [],
  visibleThreads = [],
  chatThreadMenuId = "",
  escapeHtml,
  icon,
  formatRelative,
  getOptimizedImageUrl,
  nowMs = Date.now()
} = {}) {
  const esc = typeof escapeHtml === "function" ? escapeHtml : ((value) => String(value || ""));
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const formatRel = typeof formatRelative === "function" ? formatRelative : ((value) => String(value || ""));
  const getAvatar = typeof getOptimizedImageUrl === "function"
    ? getOptimizedImageUrl
    : ((value) => String(value || ""));
  const isArchivedScope = String(scope || "") === "archived";
  const now = Number(nowMs || Date.now()) || Date.now();
  const inbox = Array.isArray(inboxThreads) ? inboxThreads : [];
  const archived = Array.isArray(archivedThreads) ? archivedThreads : [];
  const visible = Array.isArray(visibleThreads) ? visibleThreads : [];

  return `
    <div id="chatListView" class="p-6">
      <div class="mb-4">
        <div class="bg-white/70 p-1.5 rounded-[1.6rem] border border-white/80 shadow-sm flex items-center gap-1">
          <button type="button" data-chat-list-tab="inbox" class="flex-1 h-10 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all ${!isArchivedScope ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}">
            Postfach (${inbox.length})
          </button>
          <button type="button" data-chat-list-tab="archived" class="flex-1 h-10 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all ${isArchivedScope ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}">
            Archived (${archived.length})
          </button>
        </div>
      </div>
      ${visible.length ? `
        <div class="space-y-3">
          ${visible.map((thread) => {
            const avatarUrl = getAvatar(thread?.avatar, "avatar");
            const unreadCount = Math.max(0, Number(thread?.unreadCount || 0));
            const isMuted = Number(thread?.muteUntilMs || 0) > now;
            const visibleUnreadCount = isMuted ? 0 : unreadCount;
            const isBlocked = !!thread?.blockedByOwner;
            const menuOpen = String(chatThreadMenuId || "") === String(thread?.id || "");
            return `
              <div class="relative p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                <button
                  data-chat-open-thread="true"
                  data-chat-thread-id="${esc(thread?.id || "")}"
                  data-chat-uid="${esc(thread?.uid || "")}"
                  data-chat-handle="${esc(thread?.handle || "")}"
                  data-chat-name="${esc(thread?.name || "User")}"
                  data-chat-avatar="${esc(thread?.avatar || "")}"
                  class="w-full text-left flex items-center gap-4 active:scale-[0.99] transition-all"
                >
                  <img src="${esc(avatarUrl)}" class="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                  <div class="flex-1 min-w-0 pr-10">
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0 flex-1 flex items-center gap-2">
                        <p class="text-sm font-black text-slate-900 truncate">${esc(thread?.name || "User")}</p>
                        ${visibleUnreadCount ? `<span class="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">${visibleUnreadCount > 9 ? "9+" : visibleUnreadCount}</span>` : ""}
                      </div>
                      <span class="text-[9px] font-bold uppercase tracking-widest text-slate-300">${esc(formatRel(new Date(Number(thread?.updatedAt || now))))}</span>
                    </div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate mt-1">@${esc(String(thread?.handle || "user").replace(/^@/, ""))}</p>
                    <p class="text-sm ${visibleUnreadCount ? "text-slate-800 font-semibold" : "text-slate-500"} truncate mt-2">${esc(thread?.lastMessage || "Hap chat-in")}</p>
                    ${isMuted ? `<p class="text-[9px] font-black uppercase tracking-widest text-amber-500 mt-1">Ruhemodus aktiv</p>` : ""}
                    ${isBlocked ? `<p class="text-[9px] font-black uppercase tracking-widest text-rose-500 mt-1">Blockiert</p>` : ""}
                  </div>
                </button>
                <button data-chat-thread-menu-toggle="${esc(thread?.id || "")}" class="absolute right-4 top-4 w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                  ${iconFn("ellipsis-vertical", "w-4 h-4")}
                </button>
                ${menuOpen ? `
                  <div class="absolute right-4 top-14 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                    <button data-chat-thread-action="delete" data-chat-thread-id="${esc(thread?.id || "")}" class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-black">
                      ${iconFn("trash-2", "w-3.5 h-3.5")}
                      Fshi
                    </button>
                    <button data-chat-thread-action="${isArchivedScope ? "unarchive" : "archive"}" data-chat-thread-id="${esc(thread?.id || "")}" class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 text-xs font-black">
                      ${iconFn(isArchivedScope ? "inbox" : "archive", "w-3.5 h-3.5")}
                      ${isArchivedScope ? "Ins Postfach" : "Archivieren"}
                    </button>
                  </div>
                ` : ""}
                ${menuOpen ? `<button data-chat-thread-menu-close="true" class="fixed inset-0 z-10"></button>` : ""}
              </div>
            `;
          }).join("")}
        </div>
      ` : `
        <div class="min-h-[60vh] flex items-center justify-center text-center">
          <div>
            <div class="w-16 h-16 rounded-[1.8rem] bg-white border border-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-5 shadow-sm">
              ${iconFn("messages-square", "w-7 h-7")}
            </div>
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">${isArchivedScope ? "Nuk ka chat-e te arkivuara" : "Ende nuk ka chat-e"}</p>
            <p class="text-sm font-medium text-slate-500 mt-3">${isArchivedScope ? "Archivierte Chats erscheinen hier." : "Hap nje profil dhe prek ikonen e chat-it."}</p>
          </div>
        </div>
      `}
    </div>
  `;
}
