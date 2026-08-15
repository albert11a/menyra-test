const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/marketplace-view-render-utils-Cz00vuM6.js","chunks/domain-auth-t0x0ToSL.js"])))=>i.map(i=>d[i]);
import{_ as v}from"./domain-auth-t0x0ToSL.js";const m="background:#f1f5f9;";function n({height:r="0.75rem",width:e="100%",marginTop:i="0"}={}){return`<div aria-hidden="true" class="animate-pulse" style="${m}height:${r};width:${e};margin-top:${i};border-radius:9999px;"></div>`}function h({height:r="1rem",radius:e="0"}={}){return`<div aria-hidden="true" class="animate-pulse" style="${m}height:${r};width:100%;border-radius:${e};"></div>`}function w(){return`
    <div class="bg-white border border-slate-100 shadow-sm" style="flex:0 0 auto;width:11rem;border-radius:2rem;overflow:hidden;">
      ${h({height:"7rem"})}
      <div style="padding:1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;">
          ${n({height:"0.625rem",width:"4rem"})}
          ${n({height:"0.625rem",width:"2rem"})}
        </div>
        ${n({height:"1rem",width:"80%"})}
        ${n({height:"0.625rem",width:"60%",marginTop:"0.5rem"})}
      </div>
    </div>
  `}function y(){return`
    <article class="bg-white border border-slate-100 shadow-sm" style="border-radius:2rem;overflow:hidden;">
      ${h({height:"12rem"})}
      <div style="padding:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;">
          <div style="flex:1 1 auto;min-width:0;">
            ${n({height:"0.625rem",width:"5rem"})}
            ${n({height:"1.25rem",width:"60%",marginTop:"0.5rem"})}
          </div>
          <div aria-hidden="true" class="animate-pulse" style="${m}flex:0 0 auto;height:1.5rem;width:3rem;border-radius:0.75rem;"></div>
        </div>
        ${n({height:"0.75rem",width:"100%",marginTop:"0.75rem"})}
        ${n({height:"0.75rem",width:"80%",marginTop:"0.5rem"})}
        ${n({height:"0.75rem",width:"40%",marginTop:"1rem"})}
        ${n({height:"0.75rem",width:"33%",marginTop:"0.5rem"})}
      </div>
    </article>
  `}function $({bestCount:r=3,listCount:e=3}={}){const i=Math.max(0,Math.trunc(Number(r)||0)),t=Math.max(0,Math.trunc(Number(e)||0));return`
    <div data-marketplace-skeleton="1" aria-hidden="true">
      ${i?`
        <div style="margin-bottom:2rem;">
          <div style="display:flex;gap:0.75rem;overflow:hidden;">
            ${Array.from({length:i},w).join("")}
          </div>
        </div>
      `:""}
      <div style="display:flex;flex-direction:column;gap:1rem;">
        ${Array.from({length:t},y).join("")}
      </div>
    </div>
  `}function b(r={}){return`
    <section class="pb-24" style="padding:1.5rem;padding-bottom:6rem;">
      ${$(r)}
    </section>
  `}const F=()=>"";function R(r,e=F){return typeof r=="function"?r:e}function k(r=""){const e=String(r||"").trim().toLowerCase();return e==="restaurant"?"restaurants":e==="hotel"||e==="hotels"||e==="motel"||e==="motels"?"travel":e==="shop"||e==="ecommerce"||e==="e-commerce"?"shopping":e}function M({state:r=null,dataLoaded:e=null,renderFn:i=()=>{},helperApi:t={},profileApi:l={}}={}){const g=R(i,()=>{});let a=null,d=null;function u(){return a?Promise.resolve(a):d||(d=v(()=>import("./marketplace-view-render-utils-Cz00vuM6.js"),__vite__mapDeps([0,1])).then(o=>(a=o,g(),o)).catch(o=>{throw d=null,o}),d)}function c(){u().catch(()=>null)}function f(){return b()}function s(o=""){const p=k(o);return a?.renderMarketplaceViewCore?a.renderMarketplaceViewCore({state:r,dataLoaded:e,sectionKey:p,escapeHtmlFn:t.escapeHtmlFn,iconFn:t.iconFn,getOptimizedImageUrlFn:t.getOptimizedImageUrlFn,isPlaceholderUrlFn:t.isPlaceholderUrlFn,isImageReadyFn:t.isImageReadyFn,placeholderImage:t.placeholderImage,formatCountFn:t.formatCountFn,renderMapViewFn:t.renderMapViewFn,normalizeRestaurantTypeFn:l.normalizeRestaurantTypeFn,normalizeLeadTypeKeyFn:l.normalizeLeadTypeKeyFn,resolveRestaurantLogoFn:l.resolveRestaurantLogoFn}):(c(),f())}return Object.freeze({ensureRenderUtils:u,warmRenderUtils:c,isRenderUtilsReady:()=>!!a?.renderMarketplaceViewCore,renderMarketplaceView:s,renderRestaurantsView:()=>s("restaurants"),renderTravelView:()=>s("travel"),renderShoppingView:()=>s("shopping")})}export{M as c,$ as r};
