export function renderCrmLazyLoadingViewCore({
  label = "CRM laden...",
  icon,
  escapeHtml
} = {}) {
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  return `
    <div class="p-6 text-center">
      <div class="w-20 h-20 rounded-[2.5rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
        ${iconFn("loader-circle", "w-8 h-8")}
      </div>
      <p class="text-[11px] font-black uppercase tracking-widest text-slate-400">${esc(label)}</p>
    </div>
  `;
}

export function renderCeoGuardCore({
  title = "CRM",
  icon,
  escapeHtml
} = {}) {
  const iconFn = typeof icon === "function" ? icon : (() => "");
  const esc = typeof escapeHtml === "function"
    ? escapeHtml
    : ((value) => String(value ?? ""));
  return `
    <div class="p-6 text-center">
      <div class="w-20 h-20 rounded-[2.5rem] bg-slate-100 mx-auto flex items-center justify-center text-slate-300 mb-6">
        ${iconFn("lock", "w-8 h-8")}
      </div>
      <h2 class="text-lg font-black tracking-tight text-slate-900">${esc(title)}</h2>
      <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nur CEO Zugriff</p>
    </div>
  `;
}
