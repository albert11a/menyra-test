const r="rounded-[2rem]",u="aspect-[4/5]";function _(e=""){return String(e??"")}function w({colClass:e="",aspectClass:i=u,cardAttrs:n="",mediaHtml:a="",isVideo:o=!1,playIconHtml:d="",likeLabel:l="0",commentLabel:c="0",likeAttrs:p="",commentAttrs:f="",heartIconHtml:x="",commentIconHtml:b="",menuHtml:v="",escapeHtmlFn:t}={}){const s=typeof t=="function"?t:_;return`
    <div ${n} role="button" tabindex="0" class="${e} relative ${i} ${r} overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 ${r} overflow-hidden active:scale-[0.98] transition-transform">
        ${a}
        ${o?`<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${d}</div>`:""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${x}
                <span ${p} class="text-[10px] font-bold tracking-wide">${s(l)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${b}
                <span ${f} class="text-[10px] font-bold tracking-wide">${s(c)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${v}
    </div>
  `}export{w as r};
