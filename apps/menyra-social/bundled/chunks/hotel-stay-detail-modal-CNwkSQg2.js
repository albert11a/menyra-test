import{h as k}from"./domain-app-events-u5R4nl1U.js";import"./domain-auth-B1kS5TG-.js";import"./domain-feed-social-eager-o5fWuqui.js";import"./domain-public-profile-mLQti0eH.js";import"./domain-media-eager-DAUyCk2O.js";import"./domain-menu-eager-BkEh_Ppt.js";import"./domain-dashboard-2K9Q-o0n.js";import"./domain-analytics-i6lAJYIg.js";import"./domain-business-accounts-D8NpUhi6.js";const U="hotel-stay-detail-modal.v1",p="hotelStayDetailOverlayRoot",f={room:new Map,offer:new Map,imageUrlFn:null},r={open:!1,item:null,kind:"room",index:0};let w=!1;function l(t=""){return t==null?"":String(t).trim()}function c(t=""){return l(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function h(t="",e="w-4 h-4"){return`<svg class="${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${t}</svg>`}const i=Object.freeze({x:'<path d="M18 6 6 18M6 6l12 12"/>',chevronLeft:'<path d="m15 18-6-6 6-6"/>',chevronRight:'<path d="m9 18 6-6-6-6"/>',check:'<path d="m20 6-11 11-5-5"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.2a4 4 0 0 1 0 7.6M22 21v-2a4 4 0 0 0-3-3.9"/><circle cx="9" cy="7" r="4"/>',bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',size:'<path d="M15 3h6v6M21 3l-7 7M3 21l7-7M9 21H3v-6"/>',nav:'<path d="m3 11 19-9-9 19-2-8z"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',waves:'<path d="M2 5q2.5 2 5 0t5 0 5 0 5 0M2 12q2.5 2 5 0t5 0 5 0 5 0M2 19q2.5 2 5 0t5 0 5 0 5 0"/>',moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9"/>'}),$=Object.freeze({users:i.users,bed:i.bed,size:i.size,nav:i.nav,clock:i.clock,waves:i.waves,moon:i.moon,check:i.check});function x(t="",e="large"){const a=l(t);if(!a)return"";if(typeof f.imageUrlFn!="function")return a;try{return l(f.imageUrlFn(a,e))||a}catch{return a}}function g(){return typeof document>"u"?null:document}function A(t){let e=t.getElementById(p);return e||(e=t.createElement("div"),e.id=p,(t.getElementById("overlayRoot")||t.body).appendChild(e),e)}function M(t,e){const a=Array.from(t.querySelectorAll("#overlayRoot .modal-overlay")).some(s=>!s.closest(`#${p}`)),o=e||a;t.documentElement.classList.toggle("modal-open",o),t.body.classList.toggle("modal-open",o)}function L(t=[]){const e=(Array.isArray(t)?t:[]).filter(a=>l(a?.label));return e.length?`
    <div class="flex flex-wrap gap-2">
      ${e.map(a=>`
        <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-black text-slate-600">
          ${h($[a.icon]||i.check,"w-3.5 h-3.5 text-slate-400")}
          ${c(a.label)}
        </span>
      `).join("")}
    </div>
  `:""}function S(t=[]){const e=(Array.isArray(t)?t:[]).map(l).filter(Boolean);return e.length?`
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-2">
      <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Përfshihet</p>
      ${e.slice(0,12).map(a=>`
        <p class="flex items-center gap-2 text-xs font-bold text-slate-700">
          ${h(i.check,"w-3.5 h-3.5 text-emerald-500 shrink-0")}
          <span>${c(a)}</span>
        </p>
      `).join("")}
    </div>
  `:""}function D(t,e=0){const a=k(t);if(!a.length)return`
      <div class="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-100 h-56 flex items-center justify-center">
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Pa foto</span>
      </div>
    `;const o=Math.max(0,Math.min(e,a.length-1)),s=x(a[o],"large");return`
    <div data-hotel-stay-gallery class="space-y-3">
      <div class="relative rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-100">
        <img data-hotel-stay-hero src="${c(s)}" alt="${c(t.title)}" class="w-full h-64 object-cover" decoding="async" />
        ${a.length>1?`
          <button type="button" data-hotel-stay-nav="prev" aria-label="Foto e mëparshme" class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-700 shadow flex items-center justify-center active:scale-95">
            ${h(i.chevronLeft)}
          </button>
          <button type="button" data-hotel-stay-nav="next" aria-label="Foto tjetër" class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-slate-700 shadow flex items-center justify-center active:scale-95">
            ${h(i.chevronRight)}
          </button>
          <span data-hotel-stay-counter class="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-[10px] font-black">${o+1} / ${a.length}</span>
        `:""}
      </div>
      ${a.length>1?`
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          ${a.map((n,d)=>`
            <button type="button" data-hotel-stay-thumb="${d}" aria-label="Foto ${d+1}" class="w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 ${d===o?"border-slate-900":"border-transparent opacity-70"}">
              <img src="${c(x(n,"thumb"))}" alt="" class="w-full h-full object-cover" loading="lazy" decoding="async" />
            </button>
          `).join("")}
        </div>
      `:""}
    </div>
  `}function O(t,e,a=0){const s=e==="offer"?"Oferta":"Dhoma",n=l(t.priceLabel),d=l(t.priceSuffix)||"/ natë",u=l(t.text||t.description);return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;">
      <div data-hotel-stay-modal-dismiss class="absolute inset-0 bg-black/60"></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
            <div class="min-w-0">
              <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${c(s)}</span>
              <h3 class="text-xl font-black italic tracking-tighter truncate">${c(t.title||s)}</h3>
              ${l(t.tag)?`<p class="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">${c(t.tag)}</p>`:""}
            </div>
            <button type="button" data-hotel-stay-modal-dismiss class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0" aria-label="Mbyll">
              ${h(i.x)}
            </button>
          </div>
          <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-4">
            ${D(t,a)}
            ${n?`
              <div class="flex items-end justify-between p-4 rounded-[1.6rem] bg-slate-900 text-white">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-300">Çmimi</span>
                <span class="text-right">
                  <strong class="text-2xl font-black tracking-tight">${c(n)}</strong>
                  <small class="block text-[10px] font-bold text-slate-300">${c(d)}</small>
                </span>
              </div>
            `:""}
            ${L(t.metaParts)}
            ${u?`<p class="text-sm font-medium text-slate-600 leading-relaxed">${c(u)}</p>`:""}
            ${S(t.features)}
          </div>
          <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
            <button type="button" data-hotel-stay-modal-dismiss class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
              Mbyll
            </button>
          </div>
        </div>
      </div>
    </div>
  `}function v(){const t=g();if(!t)return;r.open=!1,r.item=null,r.index=0;const e=t.getElementById(p);e&&(e.innerHTML=""),M(t,!1)}function j(t="room",e=""){const a=g();if(!a)return;const s=f[t==="offer"?"offer":"room"].get(l(e));if(!s)return;r.open=!0,r.item=s,r.kind=t==="offer"?"offer":"room",r.index=0;const n=A(a);n.innerHTML=O(s,r.kind,0),M(a,!0)}function b(t){const e=g();if(!e||!r.open||!r.item)return;const a=k(r.item);if(a.length<2)return;const o=a.length,s=(Number(t)%o+o)%o;r.index=s;const n=e.getElementById(p);if(!n)return;const d=n.querySelector("[data-hotel-stay-hero]");d&&d.setAttribute("src",x(a[s],"large"));const u=n.querySelector("[data-hotel-stay-counter]");u&&(u.textContent=`${s+1} / ${o}`),n.querySelectorAll("[data-hotel-stay-thumb]").forEach(m=>{const y=Number(m.getAttribute("data-hotel-stay-thumb"))===s;m.classList.toggle("border-slate-900",y),m.classList.toggle("border-transparent",!y),m.classList.toggle("opacity-70",!y)})}function E(t){const e=t.target;if(!e||typeof e.closest!="function")return;const a=e.closest("[data-hotel-stay-more]");if(a){t.preventDefault(),j(l(a.getAttribute("data-hotel-stay-kind"))||"room",l(a.getAttribute("data-hotel-stay-more")));return}if(!r.open)return;const o=e.closest("[data-hotel-stay-nav]");if(o){t.preventDefault();const d=l(o.getAttribute("data-hotel-stay-nav"))==="prev"?-1:1;b(r.index+d);return}const s=e.closest("[data-hotel-stay-thumb]");if(s){t.preventDefault(),b(Number(s.getAttribute("data-hotel-stay-thumb")));return}const n=e.closest("[data-hotel-stay-modal-dismiss]");n&&(n.tagName==="BUTTON"||n===e)&&(t.preventDefault(),v())}function I(t){r.open&&(t.key==="Escape"?(t.preventDefault(),v()):t.key==="ArrowLeft"?b(r.index-1):t.key==="ArrowRight"&&b(r.index+1))}function H(){const t=g();!t||w||(w=!0,t.addEventListener("click",E),t.addEventListener("keydown",I))}function P({rooms:t=[],offers:e=[],imageUrlFn:a=null}={}){if(f.room=new Map((Array.isArray(t)?t:[]).filter(o=>o&&l(o.id)).map(o=>[l(o.id),o])),f.offer=new Map((Array.isArray(e)?e:[]).filter(o=>o&&l(o.id)).map(o=>[l(o.id),o])),typeof a=="function"&&(f.imageUrlFn=a),r.open&&r.item){const s=f[r.kind].get(l(r.item.id));s?r.item=s:v()}H()}export{U as HOTEL_STAY_DETAIL_MODAL_VERSION,H as ensureHotelStayDetailModalBindings,P as registerHotelStayDetailItems};
