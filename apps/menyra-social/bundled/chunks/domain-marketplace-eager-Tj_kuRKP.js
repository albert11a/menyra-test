const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/marketplace-view-render-utils-CBmN8QZX.js","chunks/domain-auth-Aq-4Vdvh.js"])))=>i.map(i=>d[i]);
import{_ as w}from"./domain-auth-Aq-4Vdvh.js";function r(n=""){return`<div aria-hidden="true" class="${n} bg-slate-100 animate-pulse"></div>`}function v(){return`
    <div class="shrink-0 w-44 rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm">
      ${r("h-28 w-full")}
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          ${r("h-2.5 w-16 rounded-full")}
          ${r("h-2.5 w-8 rounded-full")}
        </div>
        ${r("h-4 w-4/5 rounded-full")}
        ${r("mt-2 h-2.5 w-3/5 rounded-full")}
      </div>
    </div>
  `}function g(){return`
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      ${r("h-48 w-full")}
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            ${r("h-2.5 w-20 rounded-full")}
            ${r("mt-2 h-5 w-3/5 rounded-full")}
          </div>
          ${r("h-6 w-12 rounded-xl shrink-0")}
        </div>
        ${r("mt-3 h-3 w-full rounded-full")}
        ${r("mt-2 h-3 w-4/5 rounded-full")}
        <div class="mt-4 grid grid-cols-1 gap-2">
          ${r("h-3 w-2/5 rounded-full")}
          ${r("h-3 w-1/3 rounded-full")}
        </div>
      </div>
    </article>
  `}function p({bestCount:n=3,listCount:e=3}={}){const i=Math.max(0,Math.trunc(Number(n)||0)),t=Math.max(0,Math.trunc(Number(e)||0));return`
    <div data-marketplace-skeleton="1" aria-hidden="true">
      ${i?`
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-hidden">
            ${Array.from({length:i},v).join("")}
          </div>
        </div>
      `:""}
      <div class="space-y-4">
        ${Array.from({length:t},g).join("")}
      </div>
    </div>
  `}function F(n={}){return`
    <section class="p-6 pb-24">
      ${p(n)}
    </section>
  `}const y=()=>"";function k(n,e=y){return typeof n=="function"?n:e}function $(n=""){const e=String(n||"").trim().toLowerCase();return e==="restaurant"?"restaurants":e==="hotel"||e==="hotels"||e==="motel"||e==="motels"?"travel":e==="shop"||e==="ecommerce"||e==="e-commerce"?"shopping":e}function b({state:n=null,dataLoaded:e=null,renderFn:i=()=>{},helperApi:t={},profileApi:s={}}={}){const m=k(i,()=>{});let a=null,l=null;function u(){return a?Promise.resolve(a):l||(l=w(()=>import("./marketplace-view-render-utils-CBmN8QZX.js"),__vite__mapDeps([0,1])).then(o=>(a=o,m(),o)).catch(o=>{throw l=null,o}),l)}function c(){u().catch(()=>null)}function f(){return F()}function d(o=""){const h=$(o);return a?.renderMarketplaceViewCore?a.renderMarketplaceViewCore({state:n,dataLoaded:e,sectionKey:h,escapeHtmlFn:t.escapeHtmlFn,iconFn:t.iconFn,getOptimizedImageUrlFn:t.getOptimizedImageUrlFn,isPlaceholderUrlFn:t.isPlaceholderUrlFn,isImageReadyFn:t.isImageReadyFn,placeholderImage:t.placeholderImage,formatCountFn:t.formatCountFn,renderMapViewFn:t.renderMapViewFn,normalizeRestaurantTypeFn:s.normalizeRestaurantTypeFn,normalizeLeadTypeKeyFn:s.normalizeLeadTypeKeyFn,resolveRestaurantLogoFn:s.resolveRestaurantLogoFn}):(c(),f())}return Object.freeze({ensureRenderUtils:u,warmRenderUtils:c,isRenderUtilsReady:()=>!!a?.renderMarketplaceViewCore,renderMarketplaceView:d,renderRestaurantsView:()=>d("restaurants"),renderTravelView:()=>d("travel"),renderShoppingView:()=>d("shopping")})}export{b as c,p as r};
