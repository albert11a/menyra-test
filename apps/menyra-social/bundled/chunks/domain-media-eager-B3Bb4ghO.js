function h(e,o=50){const r=Number(e);return Number.isFinite(r)?Math.max(0,Math.min(100,Math.round(r))):o}function y(e){return{x:h(e?.cropX??e?.focusX??e?.imageFocusX??50,50),y:h(e?.cropY??e?.focusY??e?.imageFocusY??50,50)}}function U(e){const o=y(e);return`${o.x}% ${o.y}%`}function S(e){return{x:h(e?.cropX??e?.focusX??50,50),y:h(e?.cropY??e?.focusY??50,50)}}function I(e){const o=S(e);return`${o.x}% ${o.y}%`}function M({safeStorage:e,logoCacheKey:o,isPlaceholderUrl:r,restaurantLogoCache:n}={}){const s=e?.getItem?.(o);if(s)try{const t=JSON.parse(s);if(!t||typeof t!="object")return;Object.entries(t).forEach(([a,c])=>{a&&c&&!r(c)&&n?.set?.(a,c)})}catch{}}function P({windowObj:e,hasPendingTimer:o=!1,setPendingTimer:r,safeStorage:n,logoCacheKey:s,restaurantLogoCache:t,delayMs:a=400}={}){if(!e||o)return;const c=e.setTimeout(()=>{r?.(null);try{const i={};t?.forEach?.((l,u)=>{u&&l&&(i[u]=l)}),n?.setItem?.(s,JSON.stringify(i))}catch{}},a);r?.(c)}function L({uid:e,safeStorage:o,avatarKey:r}={}){if(!e)return"";const n=typeof r=="function"?r(e):"";if(!n)return"";const s=o?.getItem?.(n);if(!s)return"";const t=String(s||"").trim();return!t||t==="undefined"||t==="null"?"":t}function T({windowObj:e,url:o,uid:r,isPlaceholderUrl:n,hasPendingTimer:s=!1,setPendingTimer:t,safeStorage:a,avatarKey:c,onPersist:i,delayMs:l=300}={}){if(!e||!o||n?.(o)||!r||s)return;const u=typeof c=="function"?c(r):"";if(!u)return;const d=e.setTimeout(()=>{t?.(null),a?.setItem?.(u,o),i?.(r,o)},l);t?.(d)}function W({restaurantId:e,raw:o,size:r="avatar",allowCacheFallback:n=!0,getOptimizedImageUrl:s,isPlaceholderUrl:t,restaurantLogoCache:a,onCacheUpdated:c}={}){const i=s(o,r);if(e){if(!t(i))return a?.get?.(e)!==i&&(a?.set?.(e,i),c?.()),i;if(n!==!1){const l=a?.get?.(e);if(l)return l}}return i}function A({raw:e,userPhotoURL:o="",userAvatarCache:r="",getOptimizedImageUrl:n,isPlaceholderUrl:s}={}){const a=n(e||o||"","avatar");return s(a)?r&&!s(r)?{url:r,nextUserAvatarCache:r,shouldScheduleWrite:!1}:{url:n("","avatar"),nextUserAvatarCache:"",shouldScheduleWrite:!1}:{url:a,nextUserAvatarCache:a,shouldScheduleWrite:!0}}function N({profileAvatar:e="",userPhotoURL:o="",userAvatarCache:r="",lastShellAvatarUrl:n="",getOptimizedImageUrl:s,isPlaceholderUrl:t,placeholderImage:a}={}){const i=s(e||o||r||"","avatar");return t(i)?n&&!t(n)?{url:n,nextUserAvatarCache:r,nextLastShellAvatarUrl:n,shouldScheduleWrite:!1}:{url:a,nextUserAvatarCache:r,nextLastShellAvatarUrl:n,shouldScheduleWrite:!1}:{url:i,nextUserAvatarCache:i,nextLastShellAvatarUrl:i,shouldScheduleWrite:!0}}const k=/\.(mp4|m4v|mov|webm|ogg|ogv|3gp|3g2|avi|mkv|quicktime)(\?.*)?$/i;function E(e){if(!e)return!1;const o=String(e.type||"").trim().toLowerCase();return o.startsWith("video/")?!0:o.startsWith("image/")?!1:k.test(String(e.name||""))}function R(e){return!e||typeof e!="object"?!1:String(e.mediaType||"").trim().toLowerCase()==="video"?!0:!!String(e.videoUrl||"").trim()}async function O(e,{documentObj:o}={}){const r=o||(typeof document>"u"?null:document),n=r?.defaultView||(typeof window>"u"?null:window);if(!e||!r||!n||typeof URL>"u"||typeof URL.createObjectURL!="function")return null;const s=URL.createObjectURL(e),t=r.createElement("video");t.muted=!0,t.playsInline=!0,t.setAttribute("playsinline",""),t.preload="auto";try{await new Promise((d,f)=>{const p=n.setTimeout(()=>f(new Error("poster timeout")),5e3);t.onloadeddata=()=>{n.clearTimeout(p),d()},t.onerror=()=>{n.clearTimeout(p),f(new Error("poster load failed"))},t.src=s});try{await new Promise(d=>{const f=n.setTimeout(d,1200);t.onseeked=()=>{n.clearTimeout(f),d()},t.currentTime=Math.min(.1,Math.max(0,(Number(t.duration)||1)/10))})}catch{}const a=Number(t.videoWidth)||0,c=Number(t.videoHeight)||0;if(!a||!c)return null;const i=r.createElement("canvas");i.width=a,i.height=c;const l=i.getContext("2d");if(!l)return null;l.drawImage(t,0,0,a,c);const u=await new Promise(d=>i.toBlob(d,"image/jpeg",.8));return!u||!u.size?null:new File([u],"video-poster.jpg",{type:"image/jpeg"})}catch{return null}finally{try{t.removeAttribute("src"),t.load?.()}catch{}try{URL.revokeObjectURL(s)}catch{}}}function x(e){const o=String(e?.type||"").trim().toLowerCase();return o.startsWith("video/")?"video":o.startsWith("image/")?"image":""}function C({storyTag:e=null,selectedMenuItemId:o="",escapeHtmlFn:r=n=>String(n||"")}={}){if(!e||typeof e!="object")return"";const n=typeof r=="function"?r:(i=>String(i||"")),s=String(e.status||"").trim().toLowerCase(),t=Array.isArray(e.items)?e.items:[],a=String(o||"").trim();return s==="loading"&&!t.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produktet po ngarkohen...</p>
      </div>
    `:s==="error"&&!t.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produktet nuk mund te ngarkoheshin. Posto story funksionon gjithsesi.</p>
      </div>
    `:t.length?`
    <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
      <label for="uploadStoryMenuItemSelect" class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin (opsionale)</label>
      <select id="uploadStoryMenuItemSelect" class="w-full mt-2 bg-transparent text-sm font-medium outline-none">
        <option value="">Pa produkt</option>
        ${t.map((i={})=>{const l=String(i.id||"").trim();if(!l)return"";const u=String(i.name||"").trim()||l,d=l===a?" selected":"";return`<option value="${n(l)}"${d}>${n(u)}</option>`}).join("")}
      </select>
    </div>
  `:""}function V({state:e=null,storySystemController:o=null,isLocalBusinessProfileFn:r=()=>!1,getOptimizedImageUrlFn:n=i=>String(i||"").trim(),escapeHtmlFn:s=i=>String(i||""),iconFn:t=()=>"",detectUploadMediaTypeFn:a=x,storyTag:c=null}={}){const i=e?.userProfile||{},l=o?.normalizeUploadIntent?.(e?.upload?.mode,{fallback:"feed"})||"feed",u=typeof r=="function"?r:(()=>!1),d=typeof n=="function"?n:(g=>String(g||"").trim()),f=typeof s=="function"?s:(g=>String(g||"")),p=typeof t=="function"?t:(()=>""),w=typeof a=="function"?a:x;if(l==="chooser")return`
      <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
        <header class="flex items-center justify-between mb-8">
          <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${p("arrow-left","w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase text-slate-900">Zgjidh postimin</h2>
          <div class="w-10"></div>
        </header>
        ${o?.renderUploadChooserView?.({profile:i})||""}
      </div>
    `;const m=l==="story",b=w(e?.upload?.file)==="video",v=b?String(e?.upload?.preview||"").trim():d(e?.upload?.preview,"large");return`
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${p("arrow-left","w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">${m?"Neue Story":"Neuer Post"}</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="image/*,video/*" />
      ${e?.upload?.preview?`
        <div class="space-y-6">
          ${b?`<video src="${f(v)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg bg-black" autoplay muted loop playsinline preload="metadata"></video>`:`<img src="${f(v)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />`}
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="${m?"Story Text...":"Bildunterschrift..."}" class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${f(e?.upload?.caption)}</textarea>
          </div>
          ${m?C({storyTag:c,selectedMenuItemId:e?.upload?.menuItemId||"",escapeHtmlFn:f}):""}
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${e?.upload?.status||(m?"Posto story":"Posto")}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${f(e?.upload?.status)}</div>
        </div>
      `:`
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${p("upload","w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">${m?"Zgjidh foto ose video":"Zgjidh foto"}</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${m?"Business (Story)":u(i)?"Business (Feed)":"User (Profil)"}</p>
        </div>
      `}
    </div>
  `}export{R as a,h as b,O as c,A as d,W as e,P as f,y as g,M as h,E as i,S as j,U as k,L as l,I as m,V as n,x as o,N as r,T as s};
