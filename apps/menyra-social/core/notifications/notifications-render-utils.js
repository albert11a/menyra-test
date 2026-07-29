export function renderNotificationsListCore({
  items = [],
  escapeHtml,
  resolveNotificationAvatar,
  icon
} = {}) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return "<div class='text-center py-20 text-slate-400 font-bold text-xs uppercase'>Nuk ka njoftime te reja</div>";
  }
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  const resolveAvatar = typeof resolveNotificationAvatar === "function"
    ? resolveNotificationAvatar
    : (() => "");
  const iconFn = typeof icon === "function" ? icon : (() => "");
  return list.map((n) => `
    <div data-notif-open="${esc(n.id)}" class="flex items-center gap-4 p-4 rounded-[2rem] border transition-all relative overflow-hidden group cursor-pointer ${n.read ? "bg-white border-slate-50" : "bg-indigo-50/50 border-indigo-100"}">
      <img src="${esc(resolveAvatar(n))}" data-img-key="notif:${esc(n.id)}" class="w-12 h-12 rounded-2xl object-cover shadow-sm" />
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium text-slate-800"><span class="font-black">${esc(n.user)}</span> ${esc(n.text)}</p>
        <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">${esc(n.time)}</p>
      </div>
      <div class="flex items-center gap-2">
        ${n.type === "follow_request" ? `<button data-follow-request-accept="${esc(n.id)}" class="px-3 py-2 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">Accept</button>` : ""}
        ${!n.read ? "<div class=\"w-2 h-2 bg-indigo-500 rounded-full\"></div>" : ""}
        <button data-notif-delete="${n.id}" class="p-2 text-slate-300 hover:text-rose-500">${iconFn("trash-2", "w-4 h-4")}</button>
      </div>
    </div>
  `).join("");
}

export function renderNotificationsViewCore({
  state,
  renderNotificationsListFn
} = {}) {
  const renderNotificationsList = typeof renderNotificationsListFn === "function"
    ? renderNotificationsListFn
    : (() => "");
  return `
    <div id="notificationsView" class="p-6 animate-in slide-in-from-right-10 duration-700 h-full">
      <div class="flex justify-between items-end mb-8 px-2">
        <h2 class="text-2xl font-black italic uppercase">Updates</h2>
        <button id="markAllRead" class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-500">Alle gelesen</button>
      </div>
      <div id="notificationsList" class="space-y-3">
        ${renderNotificationsList(state?.notifications || [])}
      </div>
    </div>
  `;
}
