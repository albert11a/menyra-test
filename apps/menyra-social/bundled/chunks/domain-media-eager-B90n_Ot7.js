function h(e,r=50){const o=Number(e);return Number.isFinite(o)?Math.max(0,Math.min(100,Math.round(o))):r}function y(e){return{x:h(e?.cropX??e?.focusX??e?.imageFocusX??50,50),y:h(e?.cropY??e?.focusY??e?.imageFocusY??50,50)}}function j(e){const r=y(e);return`${r.x}% ${r.y}%`}function S(e){return{x:h(e?.cropX??e?.focusX??50,50),y:h(e?.cropY??e?.focusY??50,50)}}function I(e){const r=S(e);return`${r.x}% ${r.y}%`}function P({safeStorage:e,logoCacheKey:r,isPlaceholderUrl:o,restaurantLogoCache:n}={}){const s=e?.getItem?.(r);if(s)try{const t=JSON.parse(s);if(!t||typeof t!="object")return;Object.entries(t).forEach(([a,c])=>{a&&c&&!o(c)&&n?.set?.(a,c)})}catch{}}function M({windowObj:e,hasPendingTimer:r=!1,setPendingTimer:o,safeStorage:n,logoCacheKey:s,restaurantLogoCache:t,delayMs:a=400}={}){if(!e||r)return;const c=e.setTimeout(()=>{o?.(null);try{const i={};t?.forEach?.((l,u)=>{u&&l&&(i[u]=l)}),n?.setItem?.(s,JSON.stringify(i))}catch{}},a);o?.(c)}function L({uid:e,safeStorage:r,avatarKey:o}={}){if(!e)return"";const n=typeof o=="function"?o(e):"";if(!n)return"";const s=r?.getItem?.(n);if(!s)return"";const t=String(s||"").trim();return!t||t==="undefined"||t==="null"?"":t}function T({windowObj:e,url:r,uid:o,isPlaceholderUrl:n,hasPendingTimer:s=!1,setPendingTimer:t,safeStorage:a,avatarKey:c,onPersist:i,delayMs:l=300}={}){if(!e||!r||n?.(r)||!o||s)return;const u=typeof c=="function"?c(o):"";if(!u)return;const d=e.setTimeout(()=>{t?.(null),a?.setItem?.(u,r),i?.(o,r)},l);t?.(d)}function W({restaurantId:e,raw:r,size:o="avatar",allowCacheFallback:n=!0,getOptimizedImageUrl:s,isPlaceholderUrl:t,restaurantLogoCache:a,onCacheUpdated:c}={}){const i=s(r,o);if(e){if(!t(i))return a?.get?.(e)!==i&&(a?.set?.(e,i),c?.()),i;if(n!==!1){const l=a?.get?.(e);if(l)return l}}return i}function A({raw:e,userPhotoURL:r="",userAvatarCache:o="",getOptimizedImageUrl:n,isPlaceholderUrl:s}={}){const a=n(e||r||"","avatar");return s(a)?o&&!s(o)?{url:o,nextUserAvatarCache:o,shouldScheduleWrite:!1}:{url:n("","avatar"),nextUserAvatarCache:"",shouldScheduleWrite:!1}:{url:a,nextUserAvatarCache:a,shouldScheduleWrite:!0}}function N({profileAvatar:e="",userPhotoURL:r="",userAvatarCache:o="",lastShellAvatarUrl:n="",getOptimizedImageUrl:s,isPlaceholderUrl:t,placeholderImage:a}={}){const i=s(e||r||o||"","avatar");return t(i)?n&&!t(n)?{url:n,nextUserAvatarCache:o,nextLastShellAvatarUrl:n,shouldScheduleWrite:!1}:{url:a,nextUserAvatarCache:o,nextLastShellAvatarUrl:n,shouldScheduleWrite:!1}:{url:i,nextUserAvatarCache:i,nextLastShellAvatarUrl:i,shouldScheduleWrite:!0}}const k=/\.(mp4|m4v|mov|webm|ogg|ogv|3gp|3g2|avi|mkv|quicktime)(\?.*)?$/i;function E(e){if(!e)return!1;const r=String(e.type||"").trim().toLowerCase();return r.startsWith("video/")?!0:r.startsWith("image/")?!1:k.test(String(e.name||""))}function R(e){return!e||typeof e!="object"?!1:String(e.mediaType||"").trim().toLowerCase()==="video"?!0:!!String(e.videoUrl||"").trim()}async function V(e,{documentObj:r}={}){const o=r||(typeof document>"u"?null:document),n=o?.defaultView||(typeof window>"u"?null:window);if(!e||!o||!n||typeof URL>"u"||typeof URL.createObjectURL!="function")return null;const s=URL.createObjectURL(e),t=o.createElement("video");t.muted=!0,t.playsInline=!0,t.setAttribute("playsinline",""),t.preload="auto";try{await new Promise((d,f)=>{const p=n.setTimeout(()=>f(new Error("poster timeout")),5e3);t.onloadeddata=()=>{n.clearTimeout(p),d()},t.onerror=()=>{n.clearTimeout(p),f(new Error("poster load failed"))},t.src=s});try{await new Promise(d=>{const f=n.setTimeout(d,1200);t.onseeked=()=>{n.clearTimeout(f),d()},t.currentTime=Math.min(.1,Math.max(0,(Number(t.duration)||1)/10))})}catch{}const a=Number(t.videoWidth)||0,c=Number(t.videoHeight)||0;if(!a||!c)return null;const i=o.createElement("canvas");i.width=a,i.height=c;const l=i.getContext("2d");if(!l)return null;l.drawImage(t,0,0,a,c);const u=await new Promise(d=>i.toBlob(d,"image/jpeg",.8));return!u||!u.size?null:new File([u],"video-poster.jpg",{type:"image/jpeg"})}catch{return null}finally{try{t.removeAttribute("src"),t.load?.()}catch{}try{URL.revokeObjectURL(s)}catch{}}}function v(e){const r=String(e?.type||"").trim().toLowerCase();return r.startsWith("video/")?"video":r.startsWith("image/")?"image":""}function C({storyTag:e=null,selectedMenuItemId:r="",escapeHtmlFn:o=n=>String(n||"")}={}){if(!e||typeof e!="object")return"";const n=typeof o=="function"?o:(i=>String(i||"")),s=String(e.status||"").trim().toLowerCase(),t=Array.isArray(e.items)?e.items:[],a=String(r||"").trim();return s==="loading"&&!t.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Produkt markieren</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produkte werden geladen...</p>
      </div>
    `:s==="error"&&!t.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Produkt markieren</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produkte konnten nicht geladen werden. Story posten geht trotzdem.</p>
      </div>
    `:t.length?`
    <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
      <label for="uploadStoryMenuItemSelect" class="text-[10px] font-black uppercase tracking-widest text-slate-400">Produkt markieren (optional)</label>
      <select id="uploadStoryMenuItemSelect" class="w-full mt-2 bg-transparent text-sm font-medium outline-none">
        <option value="">Kein Produkt</option>
        ${t.map((i={})=>{const l=String(i.id||"").trim();if(!l)return"";const u=String(i.name||"").trim()||l,d=l===a?" selected":"";return`<option value="${n(l)}"${d}>${n(u)}</option>`}).join("")}
      </select>
    </div>
  `:""}function F({state:e=null,storySystemController:r=null,isLocalBusinessProfileFn:o=()=>!1,getOptimizedImageUrlFn:n=i=>String(i||"").trim(),escapeHtmlFn:s=i=>String(i||""),iconFn:t=()=>"",detectUploadMediaTypeFn:a=v,storyTag:c=null}={}){const i=e?.userProfile||{},l=r?.normalizeUploadIntent?.(e?.upload?.mode,{fallback:"feed"})||"feed",u=typeof o=="function"?o:(()=>!1),d=typeof n=="function"?n:(g=>String(g||"").trim()),f=typeof s=="function"?s:(g=>String(g||"")),p=typeof t=="function"?t:(()=>""),w=typeof a=="function"?a:v;if(l==="chooser")return`
      <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
        <header class="flex items-center justify-between mb-8">
          <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${p("arrow-left","w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase text-slate-900">Post waehlen</h2>
          <div class="w-10"></div>
        </header>
        ${r?.renderUploadChooserView?.({profile:i})||""}
      </div>
    `;const m=l==="story",b=w(e?.upload?.file)==="video",x=b?String(e?.upload?.preview||"").trim():d(e?.upload?.preview,"large");return`
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${p("arrow-left","w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">${m?"Neue Story":"Neuer Post"}</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="image/*,video/*" />
      ${e?.upload?.preview?`
        <div class="space-y-6">
          ${b?`<video src="${f(x)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg bg-black" autoplay muted loop playsinline preload="metadata"></video>`:`<img src="${f(x)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />`}
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="${m?"Story Text...":"Bildunterschrift..."}" class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${f(e?.upload?.caption)}</textarea>
          </div>
          ${m?C({storyTag:c,selectedMenuItemId:e?.upload?.menuItemId||"",escapeHtmlFn:f}):""}
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${e?.upload?.status||(m?"Story posten":"Posten")}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${f(e?.upload?.status)}</div>
        </div>
      `:`
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${p("upload","w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">${m?"Foto oder Video waehlen":"Foto waehlen"}</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${m?"Business (Story)":u(i)?"Business (Feed)":"User (Profil)"}</p>
        </div>
      `}
    </div>
  `}export{R as a,h as b,V as c,A as d,W as e,M as f,y as g,P as h,E as i,S as j,j as k,L as l,I as m,F as n,v as o,N as r,T as s};
