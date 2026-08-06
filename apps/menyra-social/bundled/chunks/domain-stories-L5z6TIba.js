import{r as Oe,b as Ve}from"./domain-feed-social-eager-D4CES9yO.js";function Ae(t){try{if(t&&typeof t.toDate=="function")return t.toDate()}catch{}if(t instanceof Date)return t;if(typeof t=="number"){const I=new Date(t);return Number.isFinite(I.getTime())?I:null}if(typeof t=="string"){const I=new Date(t);return Number.isFinite(I.getTime())?I:null}return null}function je({buildUrlFn:t=()=>"",iconFn:I=()=>"",escapeHtmlFn:te=M=>String(M||""),isLocalBusinessProfileFn:ne=()=>!1,collectionFn:E=null,docFn:oe=null,setDocFn:ie=null,serverTimestampFn:ae=null,db:b=null}={}){function M(c="",{fallback:s="feed"}={}){const g=["feed","story","chooser"].includes(String(s||"").trim().toLowerCase())?String(s||"").trim().toLowerCase():"feed",m=String(c||"").trim().toLowerCase();return m==="story"?"story":m==="chooser"?"chooser":m==="feed"?"feed":g}function se(c="",s={}){const g=s&&typeof s=="object"?s:{},m=M(c,{fallback:"feed"});return m==="chooser"?{preview:"",caption:"",file:null,status:"",mode:"chooser"}:{preview:g.preview||"",caption:g.caption||"",file:g.file||null,status:"",mode:m}}function le(c="",{postId:s=""}={}){const g=String(c||"").trim();if(!g)return t("apps/menyra-social/story/index.html");const m={r:g},A=String(s||"").trim();return A&&(m.post=A),t("apps/menyra-social/story/index.html",m)}function Y(c=null){const s=c||{};return ne(s)?!!String(s.restaurantId||"").trim():!1}function ue({profile:c=null}={}){const s=Y(c);return`
      <div class="flex-1 flex flex-col justify-center gap-4">
        <button data-upload-mode="story" ${s?"":"disabled"} class="w-full p-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 ${s?"bg-indigo-600 text-white shadow-xl shadow-indigo-500/30":"bg-slate-200 text-slate-400 cursor-not-allowed"}">
          ${I("camera","w-5 h-5")} Story posten
        </button>
        <button data-upload-mode="feed" class="w-full p-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 bg-slate-900 text-white shadow-xl">
          ${I("plus-square","w-5 h-5")} Feed posten
        </button>
        <div class="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">${s?"Zgjidh llojin e postimit":"Stories vetem per llogari biznesi"}</div>
      </div>
    `}async function ce({restaurantId:c="",caption:s="",mediaUrl:g="",mediaType:m="image",createdByUid:A="",posterUrl:G="",menuItemId:Q="",menuItemName:C="",menuItemPrice:x="",menuItemImage:h=""}={}){if(!b||typeof E!="function"||typeof oe!="function"||typeof ie!="function"||typeof ae!="function")throw new Error("Story runtime nuk eshte gati.");const l=String(c||"").trim(),p=String(g||"").trim();if(!l||!p)throw new Error("Te dhenat e story-t jane te paplota.");const T=oe(E(b,"restaurants",l,"stories")),z=ae(),U=String(m||"image").trim().toLowerCase()==="video"?"video":"image";return await ie(T,{title:"",description:String(s||"").trim(),caption:String(s||"").trim(),mediaType:U,mediaUrl:p,imageUrl:U==="image"?p:String(G||"").trim(),videoUrl:U==="video"?p:"",status:"active",active:!0,isLive:!0,menuItemId:String(Q||"").trim(),menuItemName:String(C||"").trim(),menuItemPrice:x??"",menuItemImage:String(h||"").trim(),createdByUid:String(A||"").trim(),createdAt:z,updatedAt:z},{merge:!0}),T.id}function de(c={}){const s=String(c.status||"active").trim().toLowerCase();if(s&&s!=="active"&&s!=="live"||c.active===!1||c.isActive===!1)return!1;const g=Ae(c.expiresAt||c.expireAt||c.expiresOn);return!(g&&g.getTime()<Date.now())}function O(c,s={}){const g=String(s.restaurantId||s.rid||"").trim();if(g)return g;let m=c?.ref?.parent?.parent||null;for(;m;){if(String(m?.parent?.id||"").trim().toLowerCase()==="restaurants")return String(m.id||"").trim();m=m?.parent?.parent||null}return""}function Z(c=""){const s=String(c||"").trim();return s?s.toLowerCase()==="business"?"":s:""}function fe(c=""){const s=String(c||"").trim().toLowerCase();return s?!!(/\.m3u8($|\?)/.test(s)||/\.mpd($|\?)/.test(s)||/\.mp4($|\?)/.test(s)||/\.webm($|\?)/.test(s)||/\.mov($|\?)/.test(s)||/\.m4v($|\?)/.test(s)||/\.ogv($|\?)/.test(s)):!1}function ge({docSnaps:c=[],restaurants:s=[],canShowFeedRestaurantIdFn:g=()=>!0,maxItems:m=24,toDateSafeFn:A=Ae}={}){const G=Array.isArray(c)?c:[],Q=Array.isArray(s)?s:[],C=G.map(h=>({docSnap:h,data:h?.data?.()||{}})).sort((h,l)=>{const p=(A(l.data.createdAt)?.getTime()||0)-(A(h.data.createdAt)?.getTime()||0);if(p!==0)return p;const T=O(h.docSnap,h.data),z=O(l.docSnap,l.data);return String(T||"").localeCompare(String(z||""))}),x=new Map;return C.forEach(({docSnap:h,data:l})=>{if(!de(l))return;const p=O(h,l);if(!p||x.has(p)||!g(p))return;const T=String(l.mediaType||l.type||l.media?.[0]?.type||"").trim().toLowerCase(),z=String(l.imageUrl||l.thumbUrl||l.mediaImage||"").trim(),U=String(l.videoUrl||l.playbackUrl||"").trim(),J=String(l.embedUrl||"").trim(),P=String(l.mediaUrl||l.url||l.media?.[0]?.url||"").trim(),V=fe(P),X=T==="video"?"video":T==="image"?"image":U||V?"video":"image",B=U||(X==="video"?P:""),D=z||(X==="image"?P:"");if(!(!!J||!!B||!!D||!!l.libraryId&&!!l.videoId))return;const K=l.createdAt||l.updatedAt||null,pe=l.updatedAt||l.createdAt||null,v=Q.find(k=>String(k?.id||"").trim()===p)||{},L=!!v?.id,j=String(v.logoUrl||v.logo||v.logoURL||"").trim(),H=String(l.logoUrl||l.logo||"").trim(),y=Z(v.name||v.restaurantName||v.displayName||v.businessName||""),q=Z(l.businessName||l.restaurantName||""),$=L?j||"":H;x.set(p,{id:p,restaurantId:p,name:L?y||q||"":q||"",img:$,isLive:l.isLive!==void 0?!!l.isLive:!0,mediaType:X,imageUrl:D,videoUrl:B,embedUrl:J,mediaUrl:P||D||B||J,libraryId:String(l.libraryId||"").trim(),videoId:String(l.videoId||"").trim(),createdAt:K,updatedAt:pe})}),Array.from(x.values()).slice(0,Math.max(1,Number(m)||24))}return{normalizeUploadIntent:M,buildUploadStateForIntent:se,buildStoryViewerUrl:le,isBusinessStoryPostEligible:Y,renderUploadChooserView:ue,createBusinessStory:ce,mapStorySnapshotRowsToFeedStories:ge,escapeHtml:c=>te(c)}}function He({state:t=null,db:I=null,readCacheFn:te=()=>null,writeCacheFn:ne=()=>{},cacheKeys:E={},cacheTtlMs:oe={},fastMode:ie=!1,allowFeedDerivedStoryFallback:ae=!1,fastLimits:b={},collectionGroupFn:M=null,getDocsFn:se=null,queryFn:le=null,whereFn:Y=null,orderByFn:ue=null,limitFn:ce=null,mapStorySnapshotRowsToFeedStoriesFn:de=()=>[],canShowFeedRestaurantIdFn:O=()=>!0,queueStoryIdentityHydrationFn:Z=()=>{},queueMicrotaskFn:fe=null,updateFeedDomFn:ge=()=>!1,renderFn:c=()=>{},getLastRenderModeFn:s=()=>"",resolveRestaurantLogoFn:g=(C,x="")=>String(x||""),isPlaceholderUrlFn:m=()=>!1,escapeSelectorFn:A=C=>String(C||""),documentObj:G=null,toDateSafeFn:Q=C=>C}={}){const C=typeof te=="function"?te:(()=>null),x=typeof ne=="function"?ne:(()=>{}),h=typeof M=="function"?M:null,l=typeof se=="function"?se:null,p=typeof le=="function"?le:null,T=typeof Y=="function"?Y:null,z=typeof ue=="function"?ue:null,U=typeof ce=="function"?ce:null,J=typeof de=="function"?de:(()=>[]),P=typeof O=="function"?O:(()=>!0),V=typeof Z=="function"?Z:(()=>{}),X=typeof fe=="function"?fe:(e=>e?.()),B=typeof ge=="function"?ge:(()=>!1),D=typeof c=="function"?c:(()=>{}),me=typeof s=="function"?s:(()=>""),K=typeof g=="function"?g:((e,r="")=>String(r||"")),pe=typeof m=="function"?m:(()=>!1),v=typeof A=="function"?A:(e=>String(e||"")),L=G||(typeof document<"u"?document:null),j=typeof HTMLImageElement=="function"?HTMLImageElement:null,H=typeof HTMLElement=="function"?HTMLElement:null;let y="",q=!1,$=null;function k(e=[]){return Ve(e)}function he(e=""){return String(e||"").trim().toLowerCase()==="business"}function N(e=""){const r=String(e||"").trim();return r?he(r)?"":r:""}function Ue(e={}){return String(e?.truthSource||e?.storyTruthSource||e?.storyTruth||"").trim().toLowerCase()==="feed-fallback"?"feed-fallback":"canonical"}function ke(e=""){const r=String(e||"").trim().toLowerCase();return r?!!(/\.m3u8($|\?)/.test(r)||/\.mpd($|\?)/.test(r)||/\.mp4($|\?)/.test(r)||/\.webm($|\?)/.test(r)||/\.mov($|\?)/.test(r)||/\.m4v($|\?)/.test(r)||/\.ogv($|\?)/.test(r)):!1}function Re(e=""){const r=String(e||"").trim();if(!r)return{restaurantId:"",known:!1,hasCanonicalRestaurant:!1,name:"",avatar:"",ownStory:!1,restaurant:null};const n=String(t?.userProfile?.restaurantId||"").trim(),a=!!n&&n===r,i=(t?.restaurants||[]).find(_=>String(_?.id||"").trim()===r)||null,o=!!i?.id,u=a?N(t?.userProfile?.name||""):"",d=a?String(t?.userProfile?.avatar||"").trim():"",w=N(i?.name||i?.restaurantName||i?.displayName||i?.businessName||""),f=String(i?.logoUrl||i?.logo||i?.logoURL||"").trim();return{restaurantId:r,known:!!(o||a),hasCanonicalRestaurant:o,name:o?w:u,avatar:o?f:d,ownStory:a,restaurant:i}}function Ce(e=""){const r=String(e||"").trim();if(!r)return{name:"",logo:""};const n=(t?.feedPosts||[]).find(a=>String(a?.restaurantId||a?.ownerId||"").trim()===r)||null;return n?{name:N(n?.business||n?.restaurantName||n?.name||""),logo:String(n?.logo||"").trim()}:{name:"",logo:""}}function ee(e={}){const r=String(e?.restaurantId||e?.id||e?.rid||"").trim(),n=Ue(e),a=n==="feed-fallback";if(!r)return{storyRestaurantId:"",hasCanonicalRestaurant:!1,storyLabel:"",logoSource:"",borderClass:e?.isLive?"border-red-500 animate-pulse":a?"border-amber-300 border-dashed":"border-slate-200",truthSource:n};const i=Re(r),o=Ce(r),u=N(e?.name||e?.businessName||e?.restaurantName||e?.business||o.name||""),d=String(e?.img||e?.logo||e?.logoUrl||o.logo||"").trim(),w=N(i.name||""),f=String(i.avatar||"").trim(),R=i.hasCanonicalRestaurant?w||u||"Restaurant":N(i.name||u||"Restaurant"),S=i.hasCanonicalRestaurant?f||d||"":String(i.avatar||d||"").trim();return{storyRestaurantId:r,hasCanonicalRestaurant:!!i.hasCanonicalRestaurant,storyLabel:R,logoSource:S,borderClass:e?.isLive?"border-red-500 animate-pulse":a?"border-amber-300 border-dashed":"border-slate-200",truthSource:n}}function ye(e={}){const r=ee(e),n=r.storyRestaurantId;if(!n)return null;const a=String(e?.mediaType||e?.type||"").trim().toLowerCase(),i=String(e?.imageUrl||e?.thumbUrl||"").trim(),o=String(e?.videoUrl||e?.playbackUrl||"").trim(),u=String(e?.embedUrl||"").trim(),d=String(e?.mediaUrl||e?.url||"").trim(),w=ke(d),f=a==="video"?"video":a==="image"?"image":o||w?"video":"image",R=o||(f==="video"?d:""),S=i||(f==="image"?d:"");return{...e,id:n,restaurantId:n,name:N(r.storyLabel||""),img:String(r.logoSource||"").trim(),isLive:!!e?.isLive,truthSource:r.truthSource,mediaType:f,imageUrl:S,videoUrl:R,embedUrl:u,mediaUrl:d||S||R||u,libraryId:String(e?.libraryId||"").trim(),videoId:String(e?.videoId||"").trim(),createdAt:e?.createdAt||e?.updatedAt||null,updatedAt:e?.updatedAt||e?.createdAt||null}}function W(e=[]){return(Array.isArray(e)?e:[]).map(r=>ye(r)).filter(Boolean)}function Le(e=[],r=[]){const n=Array.isArray(r)?r:[];if(!n.length||!Array.isArray(e)||!e.length)return Array.isArray(e)?e:[];const a=new Map;n.forEach((o,u)=>{const d=String(o?.restaurantId||o?.id||"").trim();!d||a.has(d)||a.set(d,u)});const i=new Map;return e.forEach((o,u)=>{const d=String(o?.restaurantId||o?.id||"").trim();!d||i.has(d)||i.set(d,u)}),[...e].sort((o,u)=>{const d=String(o?.restaurantId||o?.id||"").trim(),w=String(u?.restaurantId||u?.id||"").trim(),f=a.get(d),R=a.get(w),S=Number.isInteger(f),_=Number.isInteger(R);return S&&_?f-R:S?-1:_?1:(i.get(d)??0)-(i.get(w)??0)})}function Ne(){if(Array.isArray(t?.stories)&&t.stories.length){const e=W(t.stories);t.stories=e,y=k(e),V(e,{max:b.storyIdentityHydration});return}y=""}function Te(){if(!Array.isArray(t?.stories)||!t.stories.length)return!1;const e=W(t.stories),r=k(t.stories),n=k(e);return r===n?!1:(t.stories=e,y=n,x(E.stories,e),!0)}function ze(){const e=Te();if(!Array.isArray(t?.feedPosts)||!t.feedPosts.length)return e;const r=new Map;(t?.restaurants||[]).forEach(o=>{o?.id&&r.set(o.id,o)});let n=!1;const a=[];t.feedPosts.forEach(o=>{const u=String(o?.restaurantId||o?.ownerId||"").trim();if(!u){a.push(o);return}const d=r.get(u)||{};if(d?.id&&!P(u)){n=!0;return}const w=d.logoUrl||d.logo||d.logoURL||o.logo||"",f=K(u,w,"avatar");if(pe(f)||f===o.logo){a.push(o);return}n=!0,a.push({...o,logo:f})});const i=a.length!==t.feedPosts.length;return!n&&!i&&!e?!1:((n||i)&&(t.feedPosts=a),n||i||e)}function Ee({posts:e=t?.feedPosts,force:r=!1}={}){if(Array.isArray(t?.stories)&&t.stories.length)return y||(y=k(t.stories)),!1;const n=Oe({posts:e,force:r,fastMode:ie,allowFeedFallback:!!ae,buildStoriesFromFeed:xe,currentSignature:y});if(!n.updated)return!1;const a=W(n.stories);return y=k(a),t.stories=a,x(E.stories,a),V(a,{max:b.storyIdentityHydration}),!0}async function Se({force:e=!1,refreshUi:r=!0}={}){const n=C(E.stories,oe.stories);if(n?.data?.length){const o=W(n.data);if(t.stories=o,y=k(t.stories),V(o,{max:b.storyIdentityHydration}),n.fresh&&!e)return q||(q=!0,X(()=>{Se({force:!0,refreshUi:t?.activeTab==="feed"}).finally(()=>{q=!1})})),!0}if(!I||!h||!l||!p||!U)return!1;if($)return $;const i=(async()=>{try{const o=h(I,"stories");let u=null;try{u=await l(p(o,T("status","==","active"),z("createdAt","desc"),U(b.storiesFallback)))}catch{try{u=await l(p(o,z("createdAt","desc"),U(b.storiesFallback)))}catch{u=await l(p(o,U(b.storiesFallback)))}}const d=[];u.forEach(F=>d.push(F));const w=Array.isArray(t?.stories)?t.stories:[];let f=W(J({docSnaps:d,restaurants:t?.restaurants,canShowFeedRestaurantIdFn:P,maxItems:b.stories,toDateSafeFn:Q}));f=Le(f,w);const R=String(t?.userProfile?.restaurantId||"").trim(),S=String(t?.__pendingOwnStoryRestaurantId||"").trim(),_=Number(t?.__pendingOwnStoryUntil||0);if(S){const F=!Number.isFinite(_)||_<=Date.now();if(!!R&&S!==R||F)t.__pendingOwnStoryRestaurantId="",t.__pendingOwnStoryUntil=0;else if(f.some(re=>String(re?.restaurantId||re?.id||"").trim()===S))t.__pendingOwnStoryRestaurantId="",t.__pendingOwnStoryUntil=0;else{const re=ye((t?.stories||[]).find(Ie=>String(Ie?.restaurantId||Ie?.id||"").trim()===S)||{});re&&(f=[re,...f].slice(0,b.stories))}}const ve=!!r||t?.activeTab==="feed";if(!f.length){if(!t?.stories?.length)return!1;if(t.stories=[],y="",x(E.stories,[]),ve){const F=me()==="main";!(t?.activeTab==="feed"&&F&&B())&&t?.activeTab==="feed"&&D()}return!0}const Fe=k(t?.stories),be=k(f);if(Fe===be)return y=be,!0;if(t.stories=f,y=be,x(E.stories,f),V(f,{max:b.storyIdentityHydration}),ve){const F=me()==="main";!(t?.activeTab==="feed"&&F&&B())&&t?.activeTab==="feed"&&D()}return!0}catch(o){return console.error(o),!1}})().finally(()=>{$===i&&($=null)});return $=i,i}function Pe(e){if(!L||!e?.id)return;const r=v(e.id),n=(t?.restaurants||[]).find(o=>o?.id===(e.restaurantId||e.ownerId))||{},a=n.logoUrl||n.logo||n.logoURL||e.logo||"",i=K(e.restaurantId||e.ownerId,a,"avatar");L.querySelectorAll(`[data-feed-logo="${r}"]`).forEach(o=>{j&&!(o instanceof j)||o.getAttribute("src")!==i&&o.setAttribute("src",i)})}function Me(e){if(!L)return;const r=ee(e);if(!r.storyRestaurantId)return;const n=v(r.storyRestaurantId),a=K(r.storyRestaurantId,r.logoSource||"","thumb",!1);L.querySelectorAll(`[data-story-logo="${n}"]`).forEach(i=>{j&&!(i instanceof j)||i.getAttribute("src")!==a&&i.setAttribute("src",a)})}function $e(e){if(!L)return;const r=ee(e);if(!r.storyRestaurantId)return;const n=v(r.storyRestaurantId),a=N(r.storyLabel||"")||"Restaurant",i=!!e?.isLive,o=String(r.truthSource||"").trim().toLowerCase()==="feed-fallback";L.querySelectorAll(`[data-story-border="${n}"]`).forEach(u=>{H&&!(u instanceof H)||(u.classList.toggle("border-red-500",i),u.classList.toggle("animate-pulse",i),u.classList.toggle("border-slate-200",!i&&!o),u.classList.toggle("border-amber-300",!i&&o),u.classList.toggle("border-dashed",!i&&o))}),L.querySelectorAll(`[data-story-name="${n}"]`).forEach(u=>{H&&!(u instanceof H)||u.textContent!==a&&(u.textContent=a)})}function xe(e){if(!Array.isArray(e))return[];const r=new Map;return e.forEach(n=>{const a=String(n?.restaurantId||n?.ownerId||"").trim();if(!a||r.has(a)||!P(a))return;const i=ee({restaurantId:a,name:n.business||n.restaurantName||"",img:n.logo||"",isLive:!1});r.set(a,{id:a,restaurantId:a,name:N(i.storyLabel||""),img:String(i.logoSource||"").trim(),isLive:!1,truthSource:"feed-fallback",mediaType:n?.isVideo?"video":"image",imageUrl:String(n?.image||"").trim(),videoUrl:String(n?.isVideo&&(n?.image||n?.url)||"").trim(),embedUrl:"",mediaUrl:String(n?.image||n?.url||"").trim(),libraryId:"",videoId:"",createdAt:n?.createdAt||n?.updatedAt||null,updatedAt:n?.updatedAt||n?.createdAt||null})}),Array.from(r.values()).slice(0,b.stories)}function _e(e){y=String(e||"")}return{buildStoriesSignature:k,isGenericStoryBusinessLabel:he,sanitizeStoryBusinessName:N,resolveStoryRenderIdentity:ee,normalizeStoryItemForDisplay:ye,normalizeStoryItemsForDisplay:W,syncPersistedStories:Ne,setFeedStoriesSignature:_e,syncFeedPostLogos:ze,refreshFeedStories:Ee,loadStoriesForFeed:Se,updateFeedLogoNodes:Pe,updateStoryLogoNodes:Me,updateStoryMetaNodes:$e,buildStoriesFromFeed:xe}}const qe="mnyra-story-surface",We=`
.mnyra-story-surface {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
  --txt: #ffffff;
  --muted: rgba(255,255,255,0.72);
}
.mnyra-story-surface {
  color: var(--txt);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
  overflow: hidden;
  background: #000;
}
.mnyra-story-surface * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.mnyra-story-surface .reel {
  position: relative;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  background: #000;
  overflow: hidden;
  isolation: isolate;
  cursor: pointer;
}
.mnyra-story-surface .reel iframe,
.mnyra-story-surface .reel video,
.mnyra-story-surface .reel img.reel-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  transform: translateZ(0);
  border: none;
  pointer-events: none;
}
.mnyra-story-surface .reel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: auto;
  z-index: 10;
}
.mnyra-story-surface .vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(120% 70% at 50% 10%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.8) 100%), linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.00) 45%);
  opacity: .9;
  z-index: 5;
}
.mnyra-story-surface .topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding-top: calc(var(--safe-top) + 10px);
  padding-left: calc(var(--safe-left) + 12px);
  padding-right: calc(var(--safe-right) + 12px);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  z-index: 20;
  pointer-events: none;
}
.mnyra-story-surface .topbarLeft {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .topbarRight {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .btnIcon {
  border: 0;
  background: rgba(0,0,0,0.45);
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(6px);
  font-size: 18px;
  font-weight: 800;
}
.mnyra-story-surface .btnIcon:active {
  transform: scale(0.98);
}
.mnyra-story-surface .btnIcon[data-story-sound-state="on"] {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.16);
}
.mnyra-story-surface .brandPill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.12);
  pointer-events: auto;
  min-width: 0;
}
.mnyra-story-surface .brandLogo {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  object-fit: contain;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.10);
  flex: 0 0 auto;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.mnyra-story-surface .brandName {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: .2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 56vw;
}
.mnyra-story-surface .rail {
  position: absolute;
  right: calc(var(--safe-right) + 12px);
  bottom: calc(var(--safe-bottom) + 110px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
}
.mnyra-story-surface .railBtn {
  border: 0;
  background: transparent;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.mnyra-story-surface .railIcon {
  width: 60px;
  height: 46px;
  border-radius: 18px;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(255,255,255,0.10);
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
  font-weight: 700;
  font-size: 13px;
}
.mnyra-story-surface .content {
  position: absolute;
  left: calc(var(--safe-left) + 12px);
  right: calc(var(--safe-right) + 78px);
  bottom: calc(var(--safe-bottom) + 28px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}
.mnyra-story-surface .contentTitle {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
}
.mnyra-story-surface .contentDesc {
  font-size: 14px;
  line-height: 1.45;
  color: rgba(255,255,255,0.88);
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  max-width: 92%;
  white-space: pre-wrap;
}
.mnyra-story-surface .productCard {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 420px;
  padding: 10px;
  border-radius: 20px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.16);
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease, background 0.2s ease;
}
.mnyra-story-surface .productCard:hover {
  background: rgba(0,0,0,0.65);
}
.mnyra-story-surface .productCard:active {
  transform: scale(0.98);
}
.mnyra-story-surface .productCardThumb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.12);
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  font-size: 22px;
  overflow: hidden;
}
.mnyra-story-surface .productCardThumbImg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mnyra-story-surface .productCardInfo {
  flex: 1;
  min-width: 0;
}
.mnyra-story-surface .productCardName {
  font-weight: 800;
  font-size: 14px;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 6px rgba(0,0,0,0.4);
}
.mnyra-story-surface .productCardPrice {
  margin-top: 2px;
  font-weight: 700;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
}
.mnyra-story-surface .productCardBtn {
  flex: 0 0 auto;
  padding: 9px 16px;
  border-radius: 14px;
  background: #fff;
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.mnyra-story-surface {
  position: relative;
  display: block;
  overflow: hidden;
}
.mnyra-story-surface .reel {
  height: 100%;
  cursor: default;
}
.mnyra-story-surface .reel::after {
  pointer-events: none;
}
.mnyra-story-surface .topbarLeft,
.mnyra-story-surface .topbarRight,
.mnyra-story-surface .rail,
.mnyra-story-surface .content {
  pointer-events: none;
}
`;export{We as S,He as a,qe as b,je as c};
