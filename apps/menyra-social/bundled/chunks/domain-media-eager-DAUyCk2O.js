function m(e,t=50){const n=Number(e);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):t}function S(e){return{x:m(e?.cropX??e?.focusX??e?.imageFocusX??50,50),y:m(e?.cropY??e?.focusY??e?.imageFocusY??50,50)}}function T(e){const t=S(e);return`${t.x}% ${t.y}%`}function k(e){return{x:m(e?.cropX??e?.focusX??50,50),y:m(e?.cropY??e?.focusY??50,50)}}function F(e){const t=k(e);return`${t.x}% ${t.y}%`}function V({safeStorage:e,logoCacheKey:t,isPlaceholderUrl:n,restaurantLogoCache:o}={}){const a=e?.getItem?.(t);if(a)try{const r=JSON.parse(a);if(!r||typeof r!="object")return;Object.entries(r).forEach(([s,c])=>{s&&c&&!n(c)&&o?.set?.(s,c)})}catch{}}function O({windowObj:e,hasPendingTimer:t=!1,setPendingTimer:n,safeStorage:o,logoCacheKey:a,restaurantLogoCache:r,delayMs:s=400}={}){if(!e||t)return;const c=e.setTimeout(()=>{n?.(null);try{const i={};r?.forEach?.((u,l)=>{l&&u&&(i[l]=u)}),o?.setItem?.(a,JSON.stringify(i))}catch{}},s);n?.(c)}function W({uid:e,safeStorage:t,avatarKey:n}={}){if(!e)return"";const o=typeof n=="function"?n(e):"";if(!o)return"";const a=t?.getItem?.(o);if(!a)return"";const r=String(a||"").trim();return!r||r==="undefined"||r==="null"?"":r}function N({windowObj:e,url:t,uid:n,isPlaceholderUrl:o,hasPendingTimer:a=!1,setPendingTimer:r,safeStorage:s,avatarKey:c,onPersist:i,delayMs:u=300}={}){if(!e||!t||o?.(t)||!n||a)return;const l=typeof c=="function"?c(n):"";if(!l)return;const d=e.setTimeout(()=>{r?.(null),s?.setItem?.(l,t),i?.(n,t)},u);r?.(d)}function R({restaurantId:e,raw:t,size:n="avatar",allowCacheFallback:o=!0,getOptimizedImageUrl:a,isPlaceholderUrl:r,restaurantLogoCache:s,onCacheUpdated:c}={}){const i=a(t,n);if(e){if(!r(i))return s?.get?.(e)!==i&&(s?.set?.(e,i),c?.()),i;if(o!==!1){const u=s?.get?.(e);if(u)return u}}return i}function _({raw:e,userPhotoURL:t="",userAvatarCache:n="",getOptimizedImageUrl:o,isPlaceholderUrl:a}={}){const s=o(e||t||"","avatar");return a(s)?n&&!a(n)?{url:n,nextUserAvatarCache:n,shouldScheduleWrite:!1}:{url:o("","avatar"),nextUserAvatarCache:"",shouldScheduleWrite:!1}:{url:s,nextUserAvatarCache:s,shouldScheduleWrite:!0}}function X({profileAvatar:e="",userPhotoURL:t="",userAvatarCache:n="",lastShellAvatarUrl:o="",getOptimizedImageUrl:a,isPlaceholderUrl:r,placeholderImage:s}={}){const i=a(e||t||n||"","avatar");return r(i)?o&&!r(o)?{url:o,nextUserAvatarCache:n,nextLastShellAvatarUrl:o,shouldScheduleWrite:!1}:{url:s,nextUserAvatarCache:n,nextLastShellAvatarUrl:o,shouldScheduleWrite:!1}:{url:i,nextUserAvatarCache:i,nextLastShellAvatarUrl:i,shouldScheduleWrite:!0}}const C=/\.(mp4|m4v|mov|webm|ogg|ogv|3gp|3g2|avi|mkv|quicktime)(\?.*)?$/i;function q(e){if(!e)return!1;const t=String(e.type||"").trim().toLowerCase();return t.startsWith("video/")?!0:t.startsWith("image/")?!1:C.test(String(e.name||""))}function Y(e){return!e||typeof e!="object"?!1:String(e.mediaType||"").trim().toLowerCase()==="video"?!0:!!String(e.videoUrl||"").trim()}const E=1080,M=.82,$=3500;function j(e,t){e.style.cssText="position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;",e.setAttribute("aria-hidden","true");try{return(t.body||t.documentElement)?.appendChild?.(e),!0}catch{return!1}}function L(e){try{e.pause?.()}catch{}try{e.removeAttribute("src"),e.load?.()}catch{}try{e.remove?.()}catch{}}function P(e,t,n){return new Promise((o,a)=>{let r=!1;const s=l=>{r||(r=!0,t.clearTimeout(u),e.removeEventListener("loadeddata",c),e.removeEventListener("seeked",c),e.removeEventListener("error",i),l?a(l):o())},c=()=>{if(typeof e.requestVideoFrameCallback!="function"){if(typeof t.requestAnimationFrame=="function"){t.requestAnimationFrame(()=>s());return}s()}},i=()=>s(new Error("poster load failed")),u=t.setTimeout(()=>s(new Error("poster timeout")),n);if(e.addEventListener("loadeddata",c),e.addEventListener("seeked",c),e.addEventListener("error",i),typeof e.requestVideoFrameCallback=="function")try{e.requestVideoFrameCallback(()=>s())}catch{}try{e.load?.()}catch{}try{const l=e.play?.();l&&typeof l.catch=="function"&&l.catch(()=>{})}catch{}})}async function b(e,t,n=E){const o=Number(e?.videoWidth)||0,a=Number(e?.videoHeight)||0;if(!o||!a)return null;const r=Math.min(1,n/Math.max(o,a)),s=Math.max(1,Math.round(o*r)),c=Math.max(1,Math.round(a*r)),i=t.createElement("canvas");i.width=s,i.height=c;const u=i.getContext?.("2d");if(!u)return null;u.drawImage(e,0,0,s,c);const l=await new Promise(d=>{try{i.toBlob(d,"image/jpeg",M)}catch{d(null)}});return!l||!l.size?null:new File([l],"video-poster.jpg",{type:"image/jpeg"})}async function B(e,{documentObj:t}={}){const n=t||e?.ownerDocument||(typeof document>"u"?null:document);if(!e||!n||Number(e.readyState)<2)return null;try{return await b(e,n)}catch{return null}}async function D(e,{documentObj:t}={}){const n=t||(typeof document>"u"?null:document),o=n?.defaultView||(typeof window>"u"?null:window);if(!e||!n||!o||typeof URL>"u"||typeof URL.createObjectURL!="function")return null;const a=URL.createObjectURL(e),r=n.createElement("video");r.muted=!0,r.defaultMuted=!0,r.setAttribute("muted",""),r.playsInline=!0,r.setAttribute("playsinline",""),r.setAttribute("webkit-playsinline",""),r.preload="auto",j(r,n);try{return r.src=a,await P(r,o,$),await b(r,n)}catch{try{if(Number(r.readyState)>=2)return await b(r,n)}catch{}return null}finally{L(r);try{URL.revokeObjectURL(a)}catch{}}}function w(e){const t=String(e?.type||"").trim().toLowerCase();return t.startsWith("video/")?"video":t.startsWith("image/")?"image":""}function U({storyTag:e=null,selectedMenuItemId:t="",escapeHtmlFn:n=o=>String(o||"")}={}){if(!e||typeof e!="object")return"";const o=typeof n=="function"?n:(i=>String(i||"")),a=String(e.status||"").trim().toLowerCase(),r=Array.isArray(e.items)?e.items:[],s=String(t||"").trim();return a==="loading"&&!r.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produktet po ngarkohen...</p>
      </div>
    `:a==="error"&&!r.length?`
      <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin</p>
        <p class="text-xs font-medium text-slate-400 mt-2">Produktet nuk mund te ngarkoheshin. Posto story funksionon gjithsesi.</p>
      </div>
    `:r.length?`
    <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
      <label for="uploadStoryMenuItemSelect" class="text-[10px] font-black uppercase tracking-widest text-slate-400">Sheno produktin (opsionale)</label>
      <select id="uploadStoryMenuItemSelect" class="w-full mt-2 bg-transparent text-sm font-medium outline-none">
        <option value="">Pa produkt</option>
        ${r.map((i={})=>{const u=String(i.id||"").trim();if(!u)return"";const l=String(i.name||"").trim()||u,d=u===s?" selected":"";return`<option value="${o(u)}"${d}>${o(l)}</option>`}).join("")}
      </select>
    </div>
  `:""}function H({state:e=null,storySystemController:t=null,isLocalBusinessProfileFn:n=()=>!1,getOptimizedImageUrlFn:o=i=>String(i||"").trim(),escapeHtmlFn:a=i=>String(i||""),iconFn:r=()=>"",detectUploadMediaTypeFn:s=w,storyTag:c=null}={}){const i=e?.userProfile||{},u=t?.normalizeUploadIntent?.(e?.upload?.mode,{fallback:"feed"})||"feed",l=typeof n=="function"?n:(()=>!1),d=typeof o=="function"?o:(g=>String(g||"").trim()),p=typeof a=="function"?a:(g=>String(g||"")),h=typeof r=="function"?r:(()=>""),v=typeof s=="function"?s:w;if(u==="chooser")return`
      <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
        <header class="flex items-center justify-between mb-8">
          <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${h("arrow-left","w-4 h-4")}</button>
          <h2 class="text-xl font-black italic uppercase text-slate-900">Zgjidh postimin</h2>
          <div class="w-10"></div>
        </header>
        ${t?.renderUploadChooserView?.({profile:i})||""}
      </div>
    `;const f=u==="story",y=v(e?.upload?.file)==="video",x=y?String(e?.upload?.preview||"").trim():d(e?.upload?.preview,"large");return`
    <div class="p-6 animate-in slide-in-from-bottom-10 duration-700 min-h-[70vh] flex flex-col">
      <header class="flex items-center justify-between mb-8">
        <button data-nav="feed" class="p-3 rounded-2xl bg-slate-100 text-slate-500">${h("arrow-left","w-4 h-4")}</button>
        <h2 class="text-xl font-black italic uppercase text-slate-900">${f?"Neue Story":"Neuer Post"}</h2>
        <div class="w-10"></div>
      </header>
      <input type="file" id="uploadFileInput" class="hidden" accept="image/*,video/*" />
      ${e?.upload?.preview?`
        <div class="space-y-6">
          ${y?`<video src="${p(x)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg bg-black" autoplay muted loop playsinline preload="metadata"></video>`:`<img src="${p(x)}" class="w-full h-64 object-cover rounded-[2.5rem] shadow-lg" />`}
          <div class="p-5 rounded-[2rem] border bg-white border-slate-100">
            <textarea id="uploadCaption" placeholder="${f?"Story Text...":"Bildunterschrift..."}" class="w-full bg-transparent text-sm font-medium outline-none resize-none" rows="2">${p(e?.upload?.caption)}</textarea>
          </div>
          ${f?U({storyTag:c,selectedMenuItemId:e?.upload?.menuItemId||"",escapeHtmlFn:p}):""}
          <button id="uploadPostBtn" class="w-full bg-indigo-600 text-white py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/30">${e?.upload?.status||(f?"Posto story":"Posto")}</button>
          <div class="text-center text-[10px] font-bold text-slate-400">${p(e?.upload?.status)}</div>
        </div>
      `:`
        <div id="uploadFileTrigger" class="flex-1 flex flex-col items-center justify-center rounded-[3rem] border-4 border-dashed p-8 text-center cursor-pointer transition-all border-slate-200 bg-white">
          <div class="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mb-6">${h("upload","w-8 h-8")}</div>
          <h3 class="text-lg font-black mb-2 italic text-slate-900">${f?"Zgjidh foto ose video":"Zgjidh foto"}</h3>
          <p class="text-sm font-medium text-slate-500">Posten als ${f?"Business (Story)":l(i)?"Business (Feed)":"User (Profil)"}</p>
        </div>
      `}
    </div>
  `}export{Y as a,m as b,D as c,_ as d,R as e,O as f,S as g,V as h,q as i,k as j,T as k,W as l,F as m,H as n,w as o,B as p,X as r,N as s};
