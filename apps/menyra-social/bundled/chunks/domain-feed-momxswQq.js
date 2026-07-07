function Ho(s={}){const g=String(s?.id||"").trim();if(!g)return"";const C=String(s?.ownerType||(s?.restaurantId||s?.rid?"restaurant":"")||(s?.uid||s?.userId?"user":"")||"").trim(),A=String(s?.ownerId||s?.restaurantId||s?.rid||s?.uid||s?.userId||"").trim();return C&&A?`${C}:${A}:${g}`:`post:${g}`}function Ar(s=null){return s?(s.postEntityMap instanceof Map||(s.postEntityMap=new Map),s.postEntityMap):new Map}function on(s=null){const g=Ar(s);return g.clear(),g}function Wo(s=null,g=[]){const C=Ar(s),A=new Set;return(Array.isArray(g)?g:[]).map(N=>{const z=Ho(N);if(!z||A.has(z))return null;A.add(z);const B=C.get(z);if(!B){const V={...N||{}};return C.set(z,V),V}return Object.assign(B,N||{}),B}).filter(Boolean)}function nn({state:s=null,toDateSafeFn:g=f=>f,getStoriesRowSignatureFn:C=()=>"",setStoriesRowSignatureFn:A=()=>{},FAST_MODE:N=!1,buildStoriesFromFeedFn:z=()=>[],updateStoryLogoNodesFn:B=()=>{},updateStoryMetaNodesFn:V=()=>{},updateFeedLogoNodesFn:Z=()=>{},updatePostCountNodesFn:de=()=>{},ensureFeedRestaurantMetaListenersFn:et=()=>{},preloadFeedHeroImagesFn:tt=()=>{},buildStoriesRowSignatureFn:Bt=()=>"",documentObj:rt=null,windowObj:ot=null,isLocalBusinessProfileFn:ze=()=>!1,iconFn:F=()=>"",escapeHtmlFn:m=f=>String(f||""),buildUrlFn:ee=()=>"",buildStoryViewerUrlFn:ye=(f="")=>ee("apps/menyra-social/index.html",{r:f,tab:"profile"}),resolveRestaurantLogoFn:ue=()=>"",resolveStoryRenderIdentityFn:Pe=null,getOptimizedImageUrlFn:h=()=>"",getVerifiedMapLocationFn:_=()=>null,setVerifiedMapLocationFn:E=null,buildUploadStateForIntentFn:j=(f="",y={})=>y,setStateFn:U=()=>{},openGuestAuthPromptFn:W=()=>!1,openOwnBusinessProfileFn:k=null,openProfileViewFromBusinessFn:te=()=>{},openPostModalFn:ke=async()=>{},togglePostLikeFn:Ee=async()=>{},setTimeoutFn:q=(f,y)=>setTimeout(f,y)}={}){if(!s)return{renderHomeView:()=>"",renderFeedView:()=>"",renderStoryItem:()=>"",renderStoriesRow:()=>"",renderFeedItem:()=>"",renderFeedList:()=>"",patchFeedList:()=>!1,patchStoriesRow:()=>!1,updateFeedDom:()=>!1,bindFeedDelegation:()=>{}};const f=rt||(typeof document<"u"?document:null),y=ot||(typeof window<"u"?window:null),K=typeof HTMLVideoElement=="function"?HTMLVideoElement:null,Re="mnyra_story_viewer_hint_v1:",nt=()=>!!String(s.userProfile?.uid||"").trim(),it=()=>!!String(s.userProfile?.restaurantId||"").trim(),Ge=()=>!!ze(s.userProfile)||it()&&(!!s.user||nt()),at=(e="")=>{const t=String(e||"").trim();return t?t.toLowerCase()==="business"?"":t:""},Ft=(e={})=>String(e?.truthSource||e?.storyTruthSource||e?.storyTruth||"").trim().toLowerCase()==="feed-fallback"?"feed-fallback":"canonical",Ut=15,$r=6,jr=15,Or=35,Nr=Object.freeze(["city","locationCity","primaryCity","place","locationPlace","primaryPlace","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","neighbourhood","area","district","county","region","state","province"]),zr=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","geo","coords","coordinates","geoPoint"]),Pr="flex:0 0 29%;width:29%;max-width:120px;",Rr="height:13rem;",Gr="border-radius:1rem;",Q=new WeakMap;let Be=null,Dt=!1;const Fe=({withMarginLeft:e=!1}={})=>`${Pr}${e?"margin-left:1.25rem;":""}`,Br=()=>"margin-left:calc(var(--app-content-inline,1.5rem) * -1);margin-right:calc(var(--app-content-inline,1.5rem) * -1);scroll-padding-left:1.25rem;overscroll-behavior-x:contain;touch-action:pan-x;-webkit-overflow-scrolling:touch;",st=(e="")=>`${Rr}${Gr}position:relative;overflow:hidden;${e}`,L=(e=0)=>{const t=Number(e);return Number.isFinite(t)?t:0},Fr=(e={})=>De(e?.createdAt||e?.updatedAt||e?.timestamp||e?.ts||e?.publishedAt||null),Ur=(e="")=>{const t=String(e||"").trim().toLowerCase();return t?!!(/\.m3u8($|\?)/.test(t)||/\.mpd($|\?)/.test(t)||/\.mp4($|\?)/.test(t)||/\.webm($|\?)/.test(t)||/\.mov($|\?)/.test(t)||/\.m4v($|\?)/.test(t)||/\.ogv($|\?)/.test(t)):!1},ct=(e={})=>{const t=String(e?.mediaType||e?.type||"").trim().toLowerCase(),r=String(e?.imageUrl||e?.thumbUrl||"").trim(),o=String(e?.videoUrl||e?.playbackUrl||"").trim(),n=String(e?.mediaUrl||e?.url||"").trim(),i=String(e?.embedUrl||"").trim(),a=String(e?.img||e?.image||e?.thumbnail||e?.thumbnailUrl||e?.previewImage||e?.previewUrl||e?.coverImage||e?.poster||e?.posterUrl||"").trim(),l=Ur(n),d=o||(t==="video"||l?n:""),u=r||(t==="image"?n:"");return d?{kind:"video",src:d,poster:u||a,signature:`video:${d}|${u||a||""}`}:u?{kind:"image",src:u,poster:u,signature:`image:${u}`}:a?{kind:"image",src:a,poster:a,signature:`fallback:${a}`}:i?{kind:"embed",src:i,poster:"",signature:`embed:${i}`}:{kind:"none",src:"",poster:"",signature:"none"}},Vt=(e={})=>{const t=Ft(e),r=ct(e);return[String(e?.restaurantId||e?.id||"").trim(),t,e?.isLive?"1":"0",r.signature].join("|")},qt=(e={})=>[String(e?.id||"").trim(),String(e?.business||"").trim(),String(e?.location||"").trim(),String(e?.content||e?.caption||"").trim(),String(e?.image||e?.url||"").trim(),e?.isLive?"1":"0"].join("|"),Dr=(e=[])=>(Array.isArray(e)?e:[]).slice(0,10).map(t=>[String(t?.id||"").trim(),String(t?.image||t?.url||"").trim()].join("|")).join(","),Ue=typeof Pe=="function"?(e={})=>Pe(e):(e={})=>{const t=String(e?.restaurantId||"").trim(),r=Ft(e),o=r==="feed-fallback";if(!t)return{storyRestaurantId:"",hasCanonicalRestaurant:!1,storyLabel:"",logoSource:"",borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r};const n=s.restaurants.find(x=>String(x?.id||"").trim()===t)||null,i=String(s.userProfile?.restaurantId||"").trim(),a=i&&i===t,l=!!n?.id,d=String(n?.logoUrl||n?.logo||n?.logoURL||"").trim(),u=at(n?.name||n?.restaurantName||n?.displayName||n?.businessName||""),p=at(e?.name||e?.businessName||e?.restaurantName||""),b=a?at(s.userProfile?.name||""):"",v=a?String(s.userProfile?.avatar||"").trim():"",w=l?u||p||b||"":b||p||u||"",S=l?d||String(e?.img||e?.logo||e?.logoUrl||"").trim():v||String(e?.img||e?.logo||e?.logoUrl||"").trim();return{storyRestaurantId:t,hasCanonicalRestaurant:l,storyLabel:w,logoSource:S,borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r}},Kt=(e={})=>!!Ue(e).storyRestaurantId,Yt=(e="")=>{const t=String(e||"").trim();return t&&(Array.isArray(s?.feedPosts)?s.feedPosts:[]).find(o=>String(o?.id||"").trim()===t)||null},De=(e=null)=>{const t=g(e),r=Number(t?.getTime?.()||0);return Number.isFinite(r)?r:0},lt=()=>{const e=new Map;return(Array.isArray(s?.restaurants)?s.restaurants:[]).forEach(r=>{const o=String(r?.id||r?.restaurantId||"").trim();!o||e.has(o)||e.set(o,r)}),e},Ht=(e={})=>String(e?.restaurantId||(String(e?.ownerType||"").trim().toLowerCase()==="restaurant"?e?.ownerId:"")||e?.rid||"").trim(),dt=(e=[],t="")=>{if(typeof t=="string"||typeof t=="number"){const r=String(t||"").trim();r&&e.push(r)}},ut=(e=[],t={})=>{!t||typeof t!="object"||(Nr.forEach(r=>dt(e,t[r])),(typeof t.location=="string"||typeof t.location=="number")&&dt(e,t.location))},Ve=(e="")=>P(e).replace(/-/g," ").replace(/\s+/g," ").trim(),Wt=()=>pt.map(e=>[e?.id,e?.label,e?.city,...Array.isArray(e?.aliases)?e.aliases:[]].map(Ve).filter(Boolean)).filter(e=>e.length),Vr=(e="")=>{const t=Ve(e);if(!t)return[];const r=new Set([t]);return Wt().forEach(o=>{o.includes(t)&&o.forEach(n=>r.add(n))}),Array.from(r)},Qt=(e=[],t=[])=>{const r=(Array.isArray(e)?e:[]).map(Ve).filter(Boolean);if(!r.length||!t.length)return!1;const o=r.join(" ");return t.some(n=>{const i=n.split(" ").filter(Boolean);return r.some(a=>a===n||a.includes(n))||i.length>0&&i.every(a=>o.includes(a))})},qr=(e=[])=>{const t=(Array.isArray(e)?e:[]).map(Ve).filter(Boolean);if(!t.length)return!1;const r=t.join(" ");return Wt().some(o=>o.some(n=>{const i=n.split(" ").filter(Boolean);return t.some(a=>a===n||a.includes(n))||i.length>0&&i.every(a=>r.includes(a))}))},Kr=(e={})=>{const t=se(e);if(!t)return"";const r=pt.map(o=>{const n=G(o);return{label:String(o?.label||"").trim(),distanceKm:n?_e(t,n):Number.POSITIVE_INFINITY}}).filter(o=>o.label&&Number.isFinite(o.distanceKm)).sort((o,n)=>o.distanceKm-n.distanceKm)[0];return r&&r.distanceKm<=Or?r.label:""},Yr=(...e)=>{const t=[];return e.forEach(r=>{!r||typeof r!="object"||(ut(t,r),zr.forEach(o=>ut(t,r[o])),Array.isArray(r.locations)&&r.locations.forEach(o=>ut(t,o)))}),t},Hr=(...e)=>{const t=[];return e.forEach(r=>dt(t,Kr(r))),t},qe=({entry:e={},restaurant:t=null,viewerCity:r=""}={})=>{const o=Vr(r);if(!o.length)return!0;const n=Yr(t,e);return Qt(n,o)?!0:qr(n)?!1:Qt(Hr(t,e),o)},Xt=({feedPosts:e=[],stories:t=[]}={})=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=X(xe()),i=Lt(n),a=we(n),l=G(n),d=lt(),u=!!a,p=!!i,b=(S={},{type:x="post",fallbackIndex:I=0}={})=>{const T=Ht(S),O=T&&d.get(T)||null,H=we({...O&&typeof O=="object"?O:{},...S&&typeof S=="object"?S:{}});if(u&&(!H||H!==a)||p&&!qe({entry:S,restaurant:O,viewerCity:i}))return null;const oe=se(O)||se(S),ne=l&&oe?_e(l,oe):Number.POSITIVE_INFINITY;return{entry:S,fallbackIndex:I,distanceKm:ne,createdAtMs:x==="post"?De(S?.createdAt||S?.updatedAt):0}},v=r.map((S,x)=>b(S,{type:"post",fallbackIndex:x})).filter(Boolean).sort((S,x)=>{const I=Number.isFinite(S.distanceKm),T=Number.isFinite(x.distanceKm);return I&&T&&Math.abs(S.distanceKm-x.distanceKm)>.001?S.distanceKm-x.distanceKm:I!==T?I?-1:1:S.createdAtMs!==x.createdAtMs?x.createdAtMs-S.createdAtMs:S.fallbackIndex-x.fallbackIndex}).map(S=>S.entry),w=o.map((S,x)=>b(S,{type:"story",fallbackIndex:x})).filter(Boolean).sort((S,x)=>{const I=Number.isFinite(S.distanceKm),T=Number.isFinite(x.distanceKm);return I&&T&&Math.abs(S.distanceKm-x.distanceKm)>.001?S.distanceKm-x.distanceKm:I!==T?I?-1:1:S.fallbackIndex-x.fallbackIndex}).map(S=>S.entry);return{feedPosts:v,stories:w}},ft=(e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY)=>{const r=Number.isFinite(e),o=Number.isFinite(t);return r&&o&&Math.abs(e-t)>.001?e-t:r!==o?r?-1:1:0},gt=(e={},t={})=>{if(e.likes!==t.likes)return t.likes-e.likes;if(e.visitors!==t.visitors)return t.visitors-e.visitors;if(e.comments!==t.comments)return t.comments-e.comments;if(e.createdAtMs!==t.createdAtMs)return t.createdAtMs-e.createdAtMs;const r=ft(e.distanceKm,t.distanceKm);return r!==0?r:e.fallbackIndex-t.fallbackIndex},Wr=(e=null)=>{const t=new Set;return(e instanceof Set?Array.from(e):Array.isArray(e)?e:[]).forEach(o=>{const n=String(o||"").trim();n&&t.add(n)}),t},Jt=(...e)=>{const t=new Set;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{const n=Ue(o),i=String(o?.restaurantId||o?.storyId||n.storyRestaurantId||"").trim();i&&t.add(i)})}),t},Zt=(e=[],t=[],r=null)=>{const o=Array.isArray(e)?e:[],n=Array.isArray(t)?t:[],i=o.length?o:n,a=X(xe()),l=Lt(a),d=G(a),u=we(a),p=lt(),b=Wr(r),v=new Map,w=(c=null)=>{if(!c||!c.spotId)return;const $=v.get(c.spotId);if(!$){v.set(c.spotId,c);return}gt(c,$)<0&&v.set(c.spotId,c)},S=(c={},$=0)=>{const M=Ht(c),D=String(c?.id||"").trim(),ce=M||(D?`post:${D}`:`idx:${$}`),R=M&&p.get(M)||null,Xe=we({...R&&typeof R=="object"?R:{},...c&&typeof c=="object"?c:{}});if(u&&(!Xe||Xe!==u)||l&&!qe({entry:c,restaurant:R,viewerCity:l}))return null;const Je=se(R)||se(c),$t=d&&Je?_e(d,Je):Number.POSITIVE_INFINITY,jt=Math.max(0,L(c?.likes),L(c?.likesCount)),Ot=Math.max(0,L(c?.comments),L(c?.commentsCount)),Nt=Math.max(0,L(c?.visitors),L(c?.visitorCount),L(c?.visitorsCount),L(c?.views),L(c?.viewCount),L(c?.viewsCount),L(c?.reach),L(c?.reachCount),L(c?.impressions),L(c?.impressionsCount)),zt=Math.max(0,L(c?.rating),L(c?.score),L(c?.stars),L(R?.rating),L(R?.score),L(R?.stars)),Pt=De(c?.createdAt||c?.updatedAt),Rt=String(c?.business||c?.restaurantName||R?.name||R?.restaurantName||"Best Spot").trim()||"Best Spot",Ze=String(R?.bestSpotLogoUrl||R?.spotLogoUrl||R?.bestSpotLogo||R?.spotLogo||R?.logoUrl||R?.logo||R?.logoURL||c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.logo||c?.image||c?.url||"").trim(),Ko=M?ue(M,Ze,"avatar",!1):Ze,Yo=M?ee("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"}):ee("apps/menyra-social/index.html",{tab:"feed",post:D,source:"best-spot"});return{spotId:ce,postId:D,restaurantId:M,displayName:Rt,avatarUrl:Ko,profileUrl:Yo,likes:jt,comments:Ot,visitors:Nt,rating:zt,distanceKm:$t,createdAtMs:Pt,fallbackIndex:$}},x=(c={},$=0)=>{const M=String(c?.id||c?.restaurantId||"").trim();if(!M)return null;const D=String(c?.status||"").trim().toLowerCase();if(D==="archived"||D==="deleted"||D==="blocked"||D==="disabled")return null;const ce=we(c);if(u&&(!ce||ce!==u)||l&&!qe({entry:c,restaurant:c,viewerCity:l}))return null;const R=se(c),Xe=d&&R?_e(d,R):Number.POSITIVE_INFINITY,Je=Math.max(0,L(c?.likes),L(c?.likesCount),L(c?.likeCount),L(c?.socialLikes),L(c?.socialLikesCount),L(c?.followersCount),L(c?.followers)),$t=Math.max(0,L(c?.comments),L(c?.commentsCount),L(c?.reviewCount),L(c?.reviews),L(c?.reviewsCount),L(c?.ratingsCount)),jt=Math.max(0,L(c?.visitors),L(c?.visitorCount),L(c?.visitorsCount),L(c?.views),L(c?.viewCount),L(c?.viewsCount),L(c?.reach),L(c?.reachCount),L(c?.impressions),L(c?.impressionsCount),L(c?.ordersCount),L(c?.orders)),Ot=Math.max(0,L(c?.rating),L(c?.score),L(c?.stars)),Nt=De(c?.createdAt||c?.updatedAt||c?.truthUpdatedAt),zt=String(c?.name||c?.restaurantName||c?.displayName||c?.businessName||"Best Spot").trim()||"Best Spot",Pt=String(c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.bestSpotLogo||c?.spotLogo||c?.logoUrl||c?.logo||c?.logoURL||c?.image||c?.coverImage||"").trim(),Rt=ue(M,Pt,"avatar",!1),Ze=ee("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"});return{spotId:M,postId:"",restaurantId:M,displayName:zt,avatarUrl:Rt,profileUrl:Ze,likes:Je,comments:$t,visitors:jt,rating:Ot,distanceKm:Xe,createdAtMs:Nt,fallbackIndex:$}};if(i.forEach((c,$)=>{w(S(c,$))}),!i.length||v.size<Ut){let c=i.length+1e3;Array.from(p.values()).forEach($=>{const M=x($,c);c+=1,M&&(v.has(M.spotId)||w(M))})}const I=Array.from(v.values()).filter(c=>{if(!b.size)return!0;const $=String(c?.restaurantId||"").trim();return!$||!b.has($)});if(!I.length)return[];const O=I.some(c=>Number.isFinite(c?.distanceKm))?I.filter(c=>Number.isFinite(c?.distanceKm)):I;if(!O.length)return[];const H=[...O].sort(gt).slice(0,$r),oe=new Set(H.map(c=>c.spotId)),ne=O.filter(c=>!oe.has(c.spotId)).sort((c,$)=>{const M=ft(c.distanceKm,$.distanceKm);return M!==0?M:gt(c,$)});return[...H,...ne].slice(0,Ut).map((c,$)=>({ratingDisplay:(()=>{const M=L(c?.rating);if(M>0)return Math.max(1,Math.min(5,M)).toFixed(1);const D=Math.max(1,L(c?.likes)*1.2+L(c?.visitors)*.05+L(c?.comments)*.6);return(4.2+Math.min(.75,Math.log10(1+D)/4.5)).toFixed(1)})(),...c,rank:$+1,renderSignature:[c.spotId,c.postId,c.displayName,c.avatarUrl,String($+1),String(c.rating||0),String(c.likes||0),String(c.visitors||0),Number(c.distanceKm).toFixed(3),String(c.createdAtMs||0)].join("|")}))},er=(e={},t={})=>{const r=ft(e.distanceKm,t.distanceKm);if(r!==0)return r;const o=!!e.isLive,n=!!t.isLive;return o!==n?o?-1:1:e.createdAtMs!==t.createdAtMs?t.createdAtMs-e.createdAtMs:e.fallbackIndex-t.fallbackIndex},tr=(e=[],t=[])=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=r.length?r:o;if(!n.length)return[];const i=X(xe()),a=Lt(i),l=G(i),d=lt(),u=new Map;n.forEach((w,S)=>{const x=Ue(w),I=x.storyRestaurantId;if(!I)return;const T=d.get(I)||null;if(a&&!qe({entry:w,restaurant:T,viewerCity:a}))return;const O=se(T)||se(w),H=l&&O?_e(l,O):Number.POSITIVE_INFINITY,oe=Fr(w),ne=ct(w),c=String(x.storyLabel||"").trim()||"Story",$=ye(I),M=ue(I,String(x.logoSource||"").trim(),"thumb",!1),D={...w,storyId:I,restaurantId:I,storyLabel:c,storyUrl:$,profileImageUrl:M,preview:ne,distanceKm:H,createdAtMs:oe,isLive:!!w?.isLive,fallbackIndex:S},ce=u.get(I);if(!ce){u.set(I,D);return}er(D,ce)<0&&u.set(I,D)});const p=Array.from(u.values());return(p.some(w=>Number.isFinite(w?.distanceKm))?p.filter(w=>Number.isFinite(w?.distanceKm)):p).sort(er).slice(0,jr)},rr=({spots:e=[],stories:t=[]}={})=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[];if(!r.length&&!o.length)return[];if(!o.length)return r.map(l=>({type:"spot",spot:l}));if(!r.length)return o.map(l=>({type:"story",story:l}));const n=[];let i=0,a=0;for(;i<r.length||a<o.length;)i<r.length&&(n.push({type:"spot",spot:r[i]}),i+=1),a<o.length&&(n.push({type:"story",story:o[a]}),a+=1);return n},Qr=({spots:e=[],stories:t=[]}={})=>rr({spots:e,stories:t}).map(r=>{if(r.type==="spot"){const o=r?.spot||{};return["spot",String(o?.spotId||"").trim(),String(o?.postId||"").trim(),String(o?.displayName||"").trim(),String(o?.avatarUrl||"").trim(),String(o?.rank||"").trim()].join(":")}return`story:${Vt(r?.story||{})}`}).join(","),or=async(e="")=>{const t=String(e||"");if(!t)return!1;try{if(y?.navigator?.clipboard?.writeText)return await y.navigator.clipboard.writeText(t),!0}catch{}if(!f?.body)return!1;const r=f.createElement("textarea");r.value=t,r.setAttribute("readonly","readonly"),r.style.position="fixed",r.style.opacity="0",r.style.pointerEvents="none",f.body.appendChild(r),r.select();let o=!1;try{o=!!f.execCommand?.("copy")}catch{}return r.remove(),o},mt=(e,t="Link kopiert")=>{if(!(e instanceof HTMLElement))return;const r=e.querySelector("[data-feed-share-label]");if(!r)return;const o=e.dataset.shareDefaultLabel||r.textContent||"Share";e.dataset.shareDefaultLabel=o,r.textContent=t,e.classList.add("text-white"),e.classList.remove("text-white/70"),e._shareFeedbackTimer&&clearTimeout(e._shareFeedbackTimer),e._shareFeedbackTimer=q(()=>{r.textContent=o,e.classList.add("text-white/70"),e.classList.remove("text-white"),e._shareFeedbackTimer=null},1800)},Xr=(e={})=>{const t={post:e?.id||""},r=String(e?.restaurantId||(String(e?.ownerType||"").trim()==="restaurant"?e?.ownerId:"")||"").trim();return r?(t.r=r,t.tab="profile"):t.tab="feed",ee("apps/menyra-social/index.html",t)},Jr=(e="")=>{const t=String(e||"").trim();if(!t)return null;const r=s.restaurants.find(l=>String(l?.id||"").trim()===t)||null,o=String(s.userProfile?.restaurantId||"").trim(),n=o&&o===t,i=String(r?.name||r?.restaurantName||r?.displayName||r?.businessName||(n?s.userProfile?.name:"")||"").trim(),a=String(r?.logoUrl||r?.logo||r?.logoURL||(n?s.userProfile?.avatar:"")||"").trim();return{id:t,restaurantName:i,name:i,logoUrl:a,logo:a}},Zr=(e="",t="")=>{const r=String(e||"").trim();if(!r||!y||!f)return;const o=Jr(r);if(o&&y.sessionStorage)try{y.sessionStorage.setItem(`${Re}${r}`,JSON.stringify({restaurantId:r,meta:o,savedAt:Date.now()}))}catch{}const n=String(t||ye(r)||"").trim();if(!n||!f.head||Array.from(f.head.querySelectorAll("link[data-story-prefetch]")).find(l=>String(l?.getAttribute?.("href")||"").trim()===n))return;const a=f.createElement("link");a.rel="prefetch",a.href=n,a.as="document",a.crossOrigin="anonymous",a.dataset.storyPrefetch="1",f.head.appendChild(a)},eo=()=>{q(()=>{const e=f?.getElementById("postCommentInput");if(e instanceof HTMLElement){try{e.focus({preventScroll:!1})}catch{try{e.focus()}catch{}}try{e.scrollIntoView({block:"nearest",behavior:"smooth"})}catch{}if(typeof e.setSelectionRange=="function"){const t=String(e.value||"").length;try{e.setSelectionRange(t,t)}catch{}}}},90)},ve="mnyra_social_feed_viewer_location_v1",to=14,nr=3,ro=72,oo=620,no=4200,io=12e4,ao=new Set(["xk","al","rs"]),so=new Set(["city","town","village","hamlet","municipality"]),co=new Map([["xk","Kosove"],["kosove","Kosove"],["kosova","Kosove"],["kosovo","Kosove"],["al","Shqiperi"],["shqiperi","Shqiperi"],["shqiperia","Shqiperi"],["albania","Shqiperi"],["rs","Serbi"],["serbi","Serbi"],["serbia","Serbi"],["srbija","Serbi"]]),lo=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),uo=["rruga","street","bulevard","boulevard","lagj","district","neighborhood","quarter","park","mall","plaza"],pt=Object.freeze([{id:"prishtina",label:"Prishtina",lat:42.6629,lng:21.1655,aliases:["prishtine","prishtin","pristina"]},{id:"prizren",label:"Prizren",lat:42.2139,lng:20.7397,aliases:["prizr","prizreni"]},{id:"peja",label:"Peja",lat:42.6591,lng:20.2883,aliases:["peje","pec"]},{id:"gjakova",label:"Gjakova",lat:42.3803,lng:20.4308,aliases:["gjakove","djakova"]},{id:"ferizaj",label:"Ferizaj",lat:42.3706,lng:21.1553,aliases:["feri","ferizaji","uroshevac"]},{id:"gjilan",label:"Gjilan",lat:42.4635,lng:21.4699,aliases:["gjilani"]},{id:"mitrovica",label:"Mitrovica",lat:42.8914,lng:20.866,aliases:["mitrovice","mitro"]},{id:"vushtrria",label:"Vushtrria",lat:42.8231,lng:20.9675,aliases:["vushtrri"]},{id:"podujeva",label:"Podujeva",lat:42.9106,lng:21.193,aliases:["podujeve","podu"]},{id:"tirana",label:"Tirana",lat:41.3275,lng:19.8187,aliases:["tirane"],country:"Shqiperi"},{id:"kukes",label:"Kukes",lat:42.0769,lng:20.4219,aliases:["kukes albania"],country:"Shqiperi"},{id:"smederevo",label:"Smederevo",lat:44.6644,lng:20.9276,aliases:["smederevo serbia"],country:"Serbi"}]),ht=Object.freeze({xk:Object.freeze({minLat:41.85,maxLat:43.35,minLng:20,maxLng:21.85}),al:Object.freeze({minLat:39.55,maxLat:42.75,minLng:19,maxLng:21.1}),rs:Object.freeze({minLat:42.2,maxLat:46.3,minLng:18.7,maxLng:23.1})}),fo=Object.freeze({xk:Object.freeze(["prishtina","prishtine","prizren","peja","peje","gjakova","gjakove","ferizaj","gjilan","mitrovica","mitrovice","vushtrria","vushtrri","podujeva","podujeve"]),al:Object.freeze(["tirana","tirane","kukes","durres","vlore","shkoder","elbasan","fier","korce","sarande"]),rs:Object.freeze(["smederevo","beograd","belgrade","novi sad","nis","kragujevac","subotica","pancevo"])});let Ce=null,Y=!1,fe="idle",Ke="",Ae=null,ie=null,ge="",Te=null,bt=0,me=!1,Me=null,Ye=!1,ir="",Se=!1,re=null,yt=null,ar=!1,vt=null;const ae=new Map,He=new Map,P=(e="")=>String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim(),St=(e="")=>{const t=P(e);return t==="current location"||t==="vendndodhja aktuale"||t==="trenutna lokacija"||t==="standort"||t==="aktueller standort"},Lt=(e=null)=>{const t=String(e?.city||"").trim();if(t&&!St(t))return t;const r=String(e?.label||"").trim();return r&&!St(r)?r:""},Le=(e="")=>{const t=P(e);return t&&lo.get(t)||""},pe=(e="")=>{const t=P(e);return t&&co.get(t)||""},sr=(e=null)=>{const t=G(e);if(!t)return"";const r=Number(t.lat),o=Number(t.lng),n=(i=null)=>!!i&&r>=Number(i.minLat)&&r<=Number(i.maxLat)&&o>=Number(i.minLng)&&o<=Number(i.maxLng);return n(ht.xk)?"xk":n(ht.al)?"al":n(ht.rs)?"rs":""},go=()=>{if(vt instanceof Map)return vt;const e=new Map,t=(r="",o="")=>{const n=P(r),i=Le(o);!n||!i||e.set(n,i)};return Object.entries(fo).forEach(([r,o])=>{(Array.isArray(o)?o:[]).forEach(n=>t(n,r))}),xt().forEach(r=>{const o=Le(r?.countryCode||r?.country);o&&(t(r?.label,o),t(r?.city,o),(Array.isArray(r?.searchTerms)?r.searchTerms:[]).forEach(n=>t(n,o)))}),vt=e,e},mo=(...e)=>{const t=go();for(const r of e){const o=Le(r);if(o)return o;const n=P(r);if(!n)continue;const i=t.get(n);if(i)return i;const a=n.split(" ").filter(Boolean);for(const l of a){const d=t.get(l);if(d)return d}}return""},we=(e=null)=>!e||typeof e!="object"?"":Le(e?.countryCode||e?.country_code||e?.country||e?.geo?.countryCode||e?.geo?.country_code||e?.geo?.country||e?.coords?.countryCode||e?.coords?.country||e?.location?.countryCode||e?.location?.country||"")||mo(e?.country,e?.geo?.country,e?.coords?.country,e?.location?.country,e?.city,e?.geo?.city,e?.coords?.city,e?.location?.city,e?.label,e?.address,e?.location)||sr(e),se=(e=null)=>!e||typeof e!="object"?null:G(e)||G({lat:e?.latitude,lng:e?.longitude})||G({lat:e?.gpsLat,lng:e?.gpsLng})||G({lat:e?.geo?.lat,lng:e?.geo?.lng})||G({lat:e?.geo?.latitude,lng:e?.geo?.longitude})||G({lat:e?.coords?.lat,lng:e?.coords?.lng})||G({lat:e?.coords?.latitude,lng:e?.coords?.longitude})||G({lat:e?.location?.lat,lng:e?.location?.lng}),_e=(e=null,t=null)=>{const r=G(e),o=G(t);if(!r||!o)return Number.POSITIVE_INFINITY;const n=6371,i=S=>S*Math.PI/180,a=i(Number(o.lat)-Number(r.lat)),l=i(Number(o.lng)-Number(r.lng)),d=i(Number(r.lat)),u=i(Number(o.lat)),p=Math.sin(a/2),b=Math.sin(l/2),v=p*p+Math.cos(d)*Math.cos(u)*b*b,w=2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));return n*w},G=(e=null)=>{const t=Number(e?.lat??e?.latitude??e?.y),r=Number(e?.lng??e?.lon??e?.longitude??e?.x);return!Number.isFinite(t)||!Number.isFinite(r)?null:{lat:t,lng:r}},X=(e=null)=>{const t=G(e);if(!t)return null;const r=String(e?.label||e?.city||"").trim(),n=String(e?.city||"").trim()||(St(r)?"":r),i=String(e?.source||"").trim().toLowerCase(),a=we({...e&&typeof e=="object"?e:{},lat:t.lat,lng:t.lng,label:r,city:n}),l=pe(e?.country||e?.countryCode||e?.country_code||a)||pe(a)||"";return{lat:t.lat,lng:t.lng,label:r,city:n,country:l,countryCode:a,source:i||"manual",savedAt:Number(e?.savedAt||Date.now())||Date.now()}},po=()=>{if(!y?.localStorage)return null;try{const e=y.localStorage.getItem(ve);if(!e)return null;const t=X(JSON.parse(e));if(t)return t;try{y.localStorage.removeItem(ve)}catch{}return null}catch{try{y.localStorage.removeItem(ve)}catch{}return null}},ho=()=>{if(!y?.localStorage)return null;try{return y.localStorage.getItem(ve)!==null}catch{return null}},cr=(e=null)=>{if(y?.localStorage){if(!e){try{y.localStorage.removeItem(ve)}catch{}return}try{y.localStorage.setItem(ve,JSON.stringify(e))}catch{}}},xe=()=>{const e=X(Ce),t=po();if(t){if(Ce=t,typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return t}const r=ho();if(e&&r!==!1)return e;if(r===!1&&(Ce=null),typeof _!="function")return null;let o=null;try{o=_()}catch{}const n=X({...o&&typeof o=="object"?o:{},source:"gps-map"});return n?(Ce=n,cr(n),n):null},bo=(e=null)=>{const t=X(e);if(!t)return!1;if(Ce=t,cr(t),typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return!0},lr=()=>{if(Ae){try{clearTimeout(Ae)}catch{}Ae=null}},dr=()=>{if(lr(),ie)try{ie.abort()}catch{}Te=null,ie=null,ge=""},ur=(e="",t=[])=>{const r=P(e);if(!r)return;const o=Array.isArray(t)?t:[];for(ae.set(r,o);ae.size>ro;){const n=ae.keys().next().value;if(!n)break;ae.delete(n)}He.size>oo&&He.clear(),o.forEach(n=>{He.set(String(n?.id||"").trim().toLowerCase(),n)})},wt=()=>{if(Me){try{clearTimeout(Me)}catch{}Me=null}},We=(e=!1)=>{const t=!!e,r=f?.documentElement||null,o=f?.body||null;r?.classList?.toggle?.("feed-location-gate-resolving",t),o?.classList?.toggle?.("feed-location-gate-resolving",t);try{const n=y?.__MENYRA_SOCIAL_SET_UI_CHROME_MODE__;t&&typeof n=="function"&&n("app");const i=y?.__MENYRA_SOCIAL_FORCE_UI_CHROME__;typeof i=="function"&&i()}catch{}},$e=()=>{if(re){if(typeof y?.cancelAnimationFrame=="function")try{y.cancelAnimationFrame(re)}catch{}else try{clearTimeout(re)}catch{}re=null}},yo=()=>{if(!y||!f)return null;const e=f.querySelector("main.app-main-scroll");if(!(e instanceof HTMLElement))return null;const t=y.getComputedStyle?.(e),r=String(t?.overflowY||t?.overflow||"").trim().toLowerCase(),o=r==="auto"||r==="scroll"||r==="overlay",n=Number(e.scrollHeight||0)-Number(e.clientHeight||0)>1;return!o||!n?null:e},vo=({behavior:e="smooth"}={})=>{if(!y||!f)return!1;const t=f.getElementById("feedLocationGate");if(!(t instanceof HTMLElement))return!1;const r=t.querySelector(".feed-bento-pin-outline");if(!(r instanceof HTMLElement))return!1;const o=yo(),n=o instanceof HTMLElement,i=Math.max(0,Math.round(parseFloat(y.getComputedStyle?.(r)?.top||"0")||0)),a=n?Math.round(Number(o.getBoundingClientRect().top||0)):0,l=n?Math.max(0,Number(o.scrollTop||0)):Math.max(0,Number(y.scrollY||y.pageYOffset||f?.documentElement?.scrollTop||0)),d=Math.round(Number(r.getBoundingClientRect().top||0)),u=Math.max(0,l+(d-(a+i)));if(Math.abs(u-l)<2)return!0;if(n){try{o.scrollTo({top:u,behavior:e})}catch{o.scrollTop=u}return!0}try{y.scrollTo({top:u,behavior:e})}catch{y.scrollTo(0,u)}return!0},fr=()=>{if(!Se)return;Se=!1,$e();let e=0;const t=4,r=4,o=()=>{if(e+=1,vo({behavior:e===1?"smooth":"auto"}),e>=t){$e();return}re=q(o,e===1?420:130)};if(typeof y?.requestAnimationFrame=="function"){let n=0;const i=()=>{re=y.requestAnimationFrame(()=>{if(n+=1,n<r){i();return}re=null,o()})};i();return}re=q(()=>{re=null,o()},80)},gr=()=>{if($e(),typeof yt=="function")try{yt()}catch{}yt=null},So=(e=null)=>{gr()},mr=(e={})=>{const t=pe(e?.countryCode||e?.country_code||"");if(t)return t;const r=pe(e?.country||"");return r||(String(e?.source||"").trim().toLowerCase()==="local"?"Kosove":String(e?.country||"").trim())},pr=({id:e="",label:t="",lat:r=null,lng:o=null,aliases:n=[],source:i="local",country:a="",metaLabel:l="",importance:d=0}={})=>{const u=G({lat:r,lng:o}),p=String(t||"").trim();if(!u||!p)return null;const b=String(i||"local").trim().toLowerCase(),v=Le(a),w=pe(a)||pe(v)||(b==="local"?"Kosove":""),S=Array.from(new Set([p,w,v,...Array.isArray(n)?n:[]].map(x=>P(x)).filter(Boolean)));return Object.freeze({id:String(e||p).trim().toLowerCase(),label:p,city:p,lat:u.lat,lng:u.lng,source:b,country:w,countryCode:v,metaLabel:String(l||"").trim(),importance:Number(d)||0,searchTerms:S})},xt=()=>pt.map(e=>pr(e)).filter(Boolean),hr=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return null;const r=xt().find(o=>o.id===t)||null;return r||He.get(t)||null},Lo=(e="")=>{const t=P(e);if(!t||/[0-9]/.test(t))return!1;const r=t.split(" ").filter(Boolean);return!r.length||r.length>3?!1:!r.some(o=>uo.some(n=>o.startsWith(n)))},wo=(e={},t="")=>{if(!e||!t)return-1;const r=Array.isArray(e.searchTerms)?e.searchTerms:[];let o=-1;return r.forEach(n=>{if(!n)return;if(n===t){o=Math.max(o,420);return}if(n.startsWith(t)){o=Math.max(o,260-Math.max(0,n.length-t.length));return}const i=n.indexOf(t);i>=0&&(o=Math.max(o,170-i))}),o<0?-1:(String(e?.source||"").toLowerCase()==="remote"&&(o+=12+Math.round(Math.max(0,Number(e.importance||0)*10))),o)},xo=(...e)=>{const t=new Map;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{if(!o||typeof o!="object")return;const n=`${P(o.label)}|${P(mr(o))}`;if(!n.trim())return;if(!t.has(n)){t.set(n,o);return}const i=t.get(n);String(i?.source||"").trim().toLowerCase()!=="local"&&t.set(n,o)})}),Array.from(t.values())},Io=(e=[])=>Array.isArray(e)?e.map((t,r)=>{const o=t?.properties&&typeof t.properties=="object"?t.properties:{},n=G({lat:t?.geometry?.coordinates?.[1],lng:t?.geometry?.coordinates?.[0]}),i=String(o.name||o.city||o.locality||"").trim();if(!n||!i||!Lo(i))return null;const a=Le(o.countrycode||o.country_code||o.country||"");if(!a||!ao.has(a))return null;const l=P(o.osm_value||o.type||"");if(!so.has(l))return null;const d=pe(a)||"",p=[String(o.state||o.county||"").trim(),d].filter(Boolean).join(" · ");return pr({id:`remote-${String(o.osm_id||`${i}-${a}-${r}`).trim().toLowerCase()}`,label:i,lat:n.lat,lng:n.lng,aliases:[o.city,o.state,o.county,d].filter(Boolean),source:"remote",country:a,metaLabel:p,importance:Number(o.importance||t?.importance||0)})}).filter(Boolean):[],ko=async(e="")=>{const t=String(e||"").trim(),r=P(t);if(r.length<nr)return[];if(ae.has(r))return ae.get(r)||[];if(Te&&ge===r)return Te;if(Date.now()<bt)return[];const o=typeof y?.fetch=="function"?y.fetch.bind(y):null;if(!o)return[];if(ie&&ge&&ge!==r)try{ie.abort()}catch{}const n=typeof AbortController=="function"?new AbortController:null;let i=null;ie=n,ge=r,n&&(i=q(()=>{try{n.abort()}catch{}},no));const a=new URL("https://photon.komoot.io/api/");a.searchParams.set("limit",String(to)),a.searchParams.set("lang","en"),a.searchParams.set("osm_tag","place"),a.searchParams.set("q",t);const l=(async()=>{try{const d=await o(a.toString(),{method:"GET",signal:n?.signal,headers:{"Accept-Language":"sq,sr,de,en"}});if(!d?.ok)throw new Error(`photon_${Number(d?.status||0)}`);const u=await d.json(),p=Array.isArray(u?.features)?u.features:[],b=Io(p);return ur(r,b),bt=0,b}catch(d){return String(d?.name||"")!=="AbortError"&&(bt=Date.now()+io,ur(r,[])),[]}finally{if(i)try{clearTimeout(i)}catch{}ie===n&&ge===r&&(ie=null,ge="",Te=null)}})();return Te=l,l},It=(e="",t=6)=>{const r=P(e);if(r.length<2)return[];const o=xt(),n=ae.get(r)||[];return xo(o,n).map(a=>{const l=wo(a,r);return l<0?null:{...a,score:l}}).filter(Boolean).sort((a,l)=>Number(l.score||0)-Number(a.score||0)||String(a.label||"").localeCompare(String(l.label||""),"de")).slice(0,Math.max(1,Number(t)||6))},Eo=(e=[])=>{const t=Array.isArray(e)?e:[];return t.length?t.map(r=>`
      <button
        type="button"
        role="option"
        aria-selected="false"
        data-feed-city-suggestion="${m(r.id)}"
        class="feed-location-suggestion"
      >
        <span class="feed-location-suggestion__label">${m(r.label)}</span>
        <span class="feed-location-suggestion__meta">${m(mr(r))}</span>
      </button>
    `).join(""):""},J=({clearContent:e=!0}={})=>{const t=f?.getElementById("feedLocationCitySuggestions"),r=f?.getElementById("feedLocationCityInput");t instanceof HTMLElement&&(t.classList.remove("feed-location-suggestions--open"),t.setAttribute("aria-hidden","true"),e&&(t.innerHTML="")),r instanceof HTMLElement&&r.setAttribute("aria-expanded","false")},br=(e="")=>{if(lr(),Y)return;const t=P(e);t.length<nr||ae.has(t)||(Ae=q(async()=>{Ae=null;const r=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();if(P(r)!==t)return;await ko(r);const o=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();P(o)===t&&kt(o,{skipRemoteFetch:!0})},260))},kt=(e="",{skipRemoteFetch:t=!1}={})=>{const r=f?.getElementById("feedLocationCitySuggestions"),o=f?.getElementById("feedLocationCityInput");if(!(r instanceof HTMLElement)||!(o instanceof HTMLElement))return;if(Y){J();return}if(P(e).length<2){J();return}const i=It(e,6);if(!i.length){J({clearContent:!1}),t||br(e);return}r.innerHTML=Eo(i),r.classList.add("feed-location-suggestions--open"),r.setAttribute("aria-hidden","false"),o.setAttribute("aria-expanded","true"),!t&&i.length<3&&br(e)},yr=Object.freeze({en:Object.freeze({locale:"en",htmlLang:"en",searchPlaceholder:"Enter your city...",useLocationAriaLabel:"Use location",currentLocationLabel:"Current location",statusRequesting:"Requesting location...",statusDenied:"Location access was denied.",statusTimeout:"Location did not load in time. Please try again.",statusUnsupported:"Location access is not supported on this device.",statusError:"Location could not be determined.",statusUnsupportedHttps:"Location access requires HTTPS.",heroRailAriaLabel:"MNYRA city highlights",topSliderItems:Object.freeze(["DISCOVER SPOTS.","FIND OFFERS.","OPEN MENUS."]),topCityLine:"IN YOUR CITY.",heroTitleLines:Object.freeze([Object.freeze({before:"Your ",accent:"City",after:""}),Object.freeze({before:"in your ",accent:"Pocket",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Discover","your city."])}),Object.freeze({lines:Object.freeze(["Best","restaurants","& cafes."])}),Object.freeze({lines:Object.freeze(["Grocery","stores","& healthy."])}),Object.freeze({lines:Object.freeze(["Best","hotels","& motels."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" now."}),Object.freeze({before:"Your ",accent:"Feed.",after:""})]),description:"Discover daily deals, follow stories from your favorite spots, and stay up to date.",cardTitle:"Stories & Feed",cardDescription:"Never miss exclusive deals. See what's happening in your city through stories and discover fresh offers right away.",cardImageAlt:"Feed and stories",storiesAriaLabel:"Feed stories",postBrand:"MOKI'S",postMeta:"2 hours ago • New offer",offerPill:"-20% off lunch",previewFallback:"Live feed preview is loading."})}),sq:Object.freeze({locale:"sq",htmlLang:"sq",searchPlaceholder:"Shkruaj qytetin...",useLocationAriaLabel:"Perdor vendndodhjen",currentLocationLabel:"Vendndodhja aktuale",statusRequesting:"Po kerkohet vendndodhja...",statusDenied:"Leja e vendndodhjes u refuzua.",statusTimeout:"Vendndodhja nuk u mor me kohe. Provo perseri.",statusUnsupported:"Vendndodhja nuk mbeshtetet ne kete pajisje.",statusError:"Vendndodhja nuk u gjet.",statusUnsupportedHttps:"Vendndodhja kerkon HTTPS.",heroRailAriaLabel:"MNYRA highlights e qytetit",topSliderItems:Object.freeze(["ZBULO SPOTET.","GJEJ OFERTA.","HAP MENYTE."]),topCityLine:"NE QYTETIN TEND.",heroTitleLines:Object.freeze([Object.freeze({before:"",accent:"Qyteti",after:" yt"}),Object.freeze({before:"ne ",accent:"xhepin",after:" tend."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Zbulo","qytetin tend."])}),Object.freeze({lines:Object.freeze(["Me te mirat","restorante","& kafe."])}),Object.freeze({lines:Object.freeze(["Dyqane","ushqimore","& bio."])}),Object.freeze({lines:Object.freeze(["Me te mirat","hotele","& motele."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" tani."}),Object.freeze({before:"",accent:"Feed-i",after:" yt."})]),description:"Zbulo ofertat e dites, ndiq story-t e spot-eve te preferuara dhe qendro gjithmone i perditesuar.",cardTitle:"Story & Feed",cardDescription:"Mos humb me ofertat ekskluzive. Shih menjehere ne story cfare po ndodh ne qytetin tend dhe zbulo ofertat e dites.",cardImageAlt:"Feed dhe story",storiesAriaLabel:"Story-t e feed-it",postBrand:"MOKI'S",postMeta:"Para 2 oresh • Oferte e re",offerPill:"-20% per dreke",previewFallback:"Parashikimi i feed-it po ngarkohet."})}),sr:Object.freeze({locale:"sr",htmlLang:"sr",searchPlaceholder:"Unesi svoj grad...",useLocationAriaLabel:"Koristi lokaciju",currentLocationLabel:"Trenutna lokacija",statusRequesting:"Trazi se lokacija...",statusDenied:"Pristup lokaciji je odbijen.",statusTimeout:"Lokacija nije ucitana na vreme. Pokusaj ponovo.",statusUnsupported:"Lokacija nije podrzana na ovom uredjaju.",statusError:"Lokacija nije mogla da se odredi.",statusUnsupportedHttps:"Pristup lokaciji zahteva HTTPS.",heroRailAriaLabel:"MNYRA gradski highlights",topSliderItems:Object.freeze(["OTKRIJ MESTA.","NADJI PONUDE.","OTVORI MENIJE."]),topCityLine:"U SVOM GRADU.",heroTitleLines:Object.freeze([Object.freeze({before:"Tvoj ",accent:"grad",after:""}),Object.freeze({before:"u tvom ",accent:"dzepu",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Otkrij","svoj grad."])}),Object.freeze({lines:Object.freeze(["Najbolji","restorani","& kafici."])}),Object.freeze({lines:Object.freeze(["Prodavnice","prehrane","& bio hrane."])}),Object.freeze({lines:Object.freeze(["Najbolji","hoteli","& moteli."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Uzivo",after:" sada."}),Object.freeze({before:"Tvoj ",accent:"feed.",after:""})]),description:"Otkrij dnevne ponude, prati storije svojih omiljenih mesta i ostani uvek u toku.",cardTitle:"Storiji & feed",cardDescription:"Ne propusti ekskluzivne ponude. Odmah vidi sta se desava u tvom gradu kroz storije i otkrij nove dnevne ponude.",cardImageAlt:"Feed i storiji",storiesAriaLabel:"Storiji u feed-u",postBrand:"MOKI'S",postMeta:"Pre 2 sata • Nova ponuda",offerPill:"-20% na rucak",previewFallback:"Prikaz feed-a se ucitava."})})}),Et=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return"";const r=t.split(/[_-]/)[0];return["sq","al","alb"].includes(r)?"sq":["sr","rs","srb"].includes(r)?"sr":["en","gb","uk","us"].includes(r)?"en":""},Co=()=>{const e=y?.location;if(!e)return"";const t=["lang","locale","hl"],r=(a="")=>{const l=new URLSearchParams(String(a||""));for(const d of t){const u=String(l.get(d)||"").trim();if(u)return u}return""},o=r(String(e.search||"").replace(/^\?/,""));if(o)return o;const n=String(e.hash||"");if(n){const a=n.indexOf("?"),l=a>=0?n.slice(a+1):n.replace(/^#\/?/,""),d=r(l);if(d)return d}const i=String(e.pathname||"").split("/").map(a=>String(a||"").trim().toLowerCase()).filter(Boolean);for(let a=i.length-1;a>=0;a-=1){const l=i[a];if(!(!l||l.includes("."))&&Et(l))return l}return""},Ao=()=>{const e=Et(Co());if(e)return e;const t=Array.isArray(y?.navigator?.languages)?y.navigator.languages:[];return Et(String(t[0]||y?.navigator?.language||"").trim())||"en"},je=()=>yr[Ao()]||yr.en,To=()=>{const e=je();return Ke||(fe==="requesting"?e.statusRequesting:fe==="denied"?e.statusDenied:fe==="timeout"?e.statusTimeout:fe==="unsupported"?e.statusUnsupported:fe==="error"?e.statusError:"")},vr=()=>"feed-gate",Sr=()=>!!f?.getElementById("feedLocationCityInput"),Mo=()=>{const e=String(f?.getElementById("feedView")?.dataset?.locationScreenMode||"").trim().toLowerCase();return e||String(f?.getElementById("feedLocationGate")?.dataset?.locationScreenMode||"").trim().toLowerCase()||vr()},_o=()=>{const e=f?.querySelector?.("[data-feed-gate-hero]"),t=f?.querySelector?.("[data-feed-gate-hero-rail]");if(!(e instanceof HTMLElement)||!(t instanceof HTMLElement))return;const r=Array.from(t.querySelectorAll("[data-feed-gate-hero-card]")).filter(i=>i instanceof HTMLElement);if(!r.length)return;const o=(i=0)=>{const a=Math.max(0,Math.min(r.length-1,Number(i)||0)),l=r[a],d=String(l?.getAttribute("data-feed-gate-hero-header-accent")||"").trim()||"#3f46e5";e.style.setProperty("--feed-gate-hero-accent",d),e.dataset.feedGateHeroIndex=String(a),r.forEach((u,p)=>{u.setAttribute("data-active",p===a?"true":"false")})},n=()=>{const i=r[0],a=Number(i?.clientWidth||0);return!Number.isFinite(a)||a<=0?Number(e.dataset.feedGateHeroIndex||0)||0:Math.round(t.scrollLeft/(a+8))};if(t.dataset.feedGateHeroBound!=="1"){let i=0;const a=()=>{if(i)return;const l=()=>{i=0,o(n())};if(typeof y?.requestAnimationFrame=="function"){i=y.requestAnimationFrame(l);return}i=q(l,16)};t.addEventListener("scroll",a,{passive:!0}),t.dataset.feedGateHeroBound="1"}o(n())},Lr=(e="crosshair",t="w-5 h-5 relative z-10")=>{const r=String(e||"").trim().toLowerCase(),o=r==="check"||r==="loader-circle"?r:"crosshair",n=String(t||"").trim()||"w-5 h-5 relative z-10";return F(o,n,{id:"locateIcon","data-feed-location-current-icon":o})||`<i id="locateIcon" data-lucide="${m(o)}" data-feed-location-current-icon="${m(o)}" class="${m(n)}"></i>`},Ie=()=>{const e=f?.getElementById("btnLocateMe"),t=f?.getElementById("locateIcon"),r=f?.getElementById("locatePulse"),o=f?.getElementById("feedLocationCityInput"),n=f?.getElementById("feedLocationStatus"),i=xe(),a=!!X(i),l=Y||me;if(e instanceof HTMLButtonElement&&(e.disabled=l,e.classList.toggle("opacity-60",e.disabled),e.classList.toggle("cursor-not-allowed",e.disabled),e.classList.toggle("is-success",a&&!l),e.classList.toggle("is-loading",me)),t instanceof HTMLElement){const d=me?"loader-circle":a&&!Y?"check":"crosshair",u=String(t.getAttribute("class")||"w-5 h-5 relative z-10").replace(/\banimate-spin\b/g,"").replace(/\s+/g," ").trim()||"w-5 h-5 relative z-10";if(String(t.getAttribute("data-feed-location-current-icon")||"").trim()!==d&&f){const p=f.createElement("template");p.innerHTML=Lr(d,u).trim();const b=p.content.firstElementChild;(b instanceof HTMLElement||typeof SVGElement=="function"&&b instanceof SVGElement)&&(b.classList.toggle("animate-spin",l),t.replaceWith(b))}else t.classList.toggle("animate-spin",l)}if(r instanceof HTMLElement&&(r.classList.toggle("opacity-100",Y),r.classList.toggle("opacity-0",!Y)),o instanceof HTMLInputElement){o.disabled=Y;const d=String(i?.label||i?.city||"").trim();d&&!o.value.trim()&&f?.activeElement!==o&&(o.value=d)}if(n instanceof HTMLElement){const d=To();n.textContent=d,n.classList.toggle("hidden",!d)}_o(),y?.lucide?.createIcons&&y.lucide.createIcons()},he=(e="idle",t="")=>{fe=String(e||"idle").trim().toLowerCase(),Ke=String(t||"").trim(),Ie()},Oe=(e=null)=>{const t=X(e);if(!t)return!1;if(me)return!0;if(Y=!1,fe="granted",Ke="",dr(),J(),bo(t),s.activeTab==="restaurants")return U({}),!0;const r=f?.getElementById("feedLocationGate"),n=Mo()==="location",a=String(f?.getElementById("feedView")?.dataset?.feedViewMode||"").trim().toLowerCase()==="feed",l=!n&&!a;if(!n){const d=f?.activeElement;if(d&&typeof d.blur=="function")try{d.blur()}catch{}}if(n||!l?(Ye=!1,Se=!1,$e(),me=!1,r?.classList?.remove?.("feed-location-gate--resolving"),We(!1)):(Ye=!1,Se=!0,me=!0,r?.classList?.add?.("feed-location-gate--resolving"),We(!0)),Ie(),n)return wt(),!0;if(!l){wt(),We(!1);const d=String(s?.activeTab||"").trim().toLowerCase();return(!d||d==="feed"||d==="home")&&U({activeTab:"feed"}),!0}return wt(),Me=q(()=>{Me=null,me=!1,r?.classList?.remove?.("feed-location-gate--resolving"),We(!1);const d=String(s?.activeTab||"").trim().toLowerCase();d&&d!=="feed"&&d!=="home"||(U({activeTab:"feed"}),Se=!0,fr())},360),!0},be=({fallbackCity:e=null,forceExact:t=!1}={})=>{const r=je(),o=e&&typeof e=="object"?e:hr(e);if(o&&!t){Oe({lat:o.lat,lng:o.lng,label:o.label,city:o.city||o.label,country:o.country,countryCode:o.countryCode,source:"city-search"});return}const n=y?.navigator?.geolocation;if(y&&y.isSecureContext===!1){if(o){be({fallbackCity:o,forceExact:!1});return}he("unsupported",r.statusUnsupportedHttps);return}if(!n||typeof n.getCurrentPosition!="function"){if(o){be({fallbackCity:o,forceExact:!1});return}he("unsupported");return}if(Y)return;Y=!0,dr(),J(),he("requesting");const i=Date.now(),a=d=>{const u=Math.max(0,900-(Date.now()-i));u>0?q(d,u):d()},l=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();n.getCurrentPosition(d=>{a(()=>{const u=G({lat:d?.coords?.latitude,lng:d?.coords?.longitude});if(!u){Y=!1,he("error");return}Oe({lat:u.lat,lng:u.lng,label:l||r.currentLocationLabel,city:l||"",countryCode:sr(u),source:"gps"})})},d=>{a(()=>{if(Y=!1,o){be({fallbackCity:o,forceExact:!1});return}const u=Number(d?.code);if(u===1){he("denied");return}if(u===3){he("timeout");return}he("error")})},{enableHighAccuracy:!0,timeout:1e4,maximumAge:0})},$o=({id:e="",background:t="#3f46e5",headerAccent:r="#3f46e5",cardAccent:o="#bfdbfe",variant:n="hero",lines:i=[],accentLineIndex:a=-1}={},l=0)=>`
    <article
      data-feed-gate-hero-card
      data-feed-gate-hero-index="${m(String(l))}"
      data-feed-gate-hero-header-accent="${m(r)}"
      data-active="${l===0?"true":"false"}"
      class="feed-gate-hero-card"
      style="--feed-gate-hero-card-bg:${m(t)};--feed-gate-hero-card-accent:${m(o)};"
      role="listitem"
      aria-label="${m(String(e||`hero-${l}`))}"
    >
      <div class="feed-gate-hero-card__inner">
        <h3 class="feed-gate-hero-card__headline feed-gate-hero-card__headline--${m(n)}">
          ${i.map((d,u)=>{const p=m(String(d||"").trim());return p?`<span class="feed-gate-hero-card__headline-line">${u===a?`<span class="feed-gate-hero-card__headline-accent">${p}</span>`:p}</span>`:""}).join("")}
        </h3>
      </div>
    </article>
  `,jo=(e=je())=>{const t=e?.socialBlock||{};return`
      <section class="feed-gate-social-shell" data-feed-gate-social-block>
        <div class="feed-gate-social-copy">
          <h3 class="feed-gate-social-title">
            ${(Array.isArray(t?.titleLines)?t.titleLines:[]).map((o,n)=>`
              <span class="feed-gate-social-title__line">
                ${m(String(o?.before||""))}${n===0?`<strong>${m(String(o?.accent||""))}</strong>`:`<span class="feed-gate-social-title__accent">${m(String(o?.accent||""))}</span>`}${m(String(o?.after||""))}
              </span>
            `).join("")}
          </h3>
        </div>
        <article class="feed-gate-social-card">
          <div class="feed-gate-social-card__content">
            <h4 class="feed-gate-social-card__title">${m(String(t?.cardTitle||""))}</h4>
            <p class="feed-gate-social-card__description">${m(String(t?.cardDescription||""))}</p>
          </div>
          <div class="feed-gate-social-card__media">
            <img
              src="https://i.postimg.cc/pXYTM3Hp/IMG-5082.jpg"
              alt="${m(String(t?.cardImageAlt||"Feed and stories"))}"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
              class="feed-gate-social-card__image"
            />
          </div>
        </article>
      </section>
    `},wr=(e=je())=>{const t=Array.isArray(e?.heroTitleLines)?e.heroTitleLines:[],r=Array.isArray(e?.heroCards)?e.heroCards:[],o=[{id:"h0",background:"#00cce5",headerAccent:"#00cce5",cardAccent:"#cffafe",variant:"hero",lines:r[0]?.lines||["Discover","your city."],accentLineIndex:1},{id:"h1",background:"#0f172a",headerAccent:"#1e293b",cardAccent:"#818cf8",variant:"category",lines:r[1]?.lines||["Best","restaurants","& cafes."],accentLineIndex:1},{id:"h2",background:"#065f46",headerAccent:"#047857",cardAccent:"#6ee7b7",variant:"category",lines:r[2]?.lines||["Grocery","stores","& healthy."],accentLineIndex:1},{id:"h3",background:"#7c2d12",headerAccent:"#c2410c",cardAccent:"#fdba74",variant:"category",lines:r[3]?.lines||["Best","hotels","& motels."],accentLineIndex:1}];return`
      <section
        class="feed-gate-hero-shell"
        data-feed-gate-hero
        data-feed-gate-hero-index="0"
        style="--feed-gate-hero-accent:${m(o[0].headerAccent)};"
      >
        <div class="feed-gate-hero-copy">
          <h2 class="feed-gate-hero-title">
            ${t.map(n=>`
              <span class="feed-gate-hero-title__line">
                ${m(String(n?.before||""))}<span class="feed-gate-hero-title__accent">${m(String(n?.accent||""))}</span>${m(String(n?.after||""))}
              </span>
            `).join("")}
          </h2>
        </div>

        <div
          class="feed-gate-hero-rail"
          data-feed-gate-hero-rail
          role="list"
          aria-label="${m(String(e?.heroRailAriaLabel||"MNYRA city highlights"))}"
        >
          ${o.map((n,i)=>$o(n,i)).join("")}
          <div class="feed-gate-hero-rail__endcap" aria-hidden="true"></div>
        </div>
        ${jo(e)}
        <div class="feed-gate-hero-scroll-spacer" aria-hidden="true"></div>
      </section>
    `};function Oo({mode:e=vr(),bentoContentHtml:t="",showSearchControls:r=!0,showTopSection:o=!0}={}){const n=je(),i=xe(),a=String(i?.label||i?.city||"").trim(),l=String(e||"feed-gate").trim().toLowerCase()||"feed-gate",d=r!==!1,u=o!==!1,p=String(t||wr(n)).trim();return`
      <div id="feedLocationGate" data-location-screen-mode="${m(l)}" data-feed-gate-locale="${m(String(n?.locale||"en"))}" lang="${m(String(n?.htmlLang||"en"))}">
        <style>
          #feedLocationGate {
            --feed-bento-surface: #f8fafc;
            --feed-location-gate-bento-radius: 2.5rem;
            min-height: 100svh;
            background: #f8fafc;
            color: #0f172a;
          }
          html.is-standalone #feedLocationGate {
            min-height: 100dvh;
          }
          #feedLocationGate .loc-shell {
            position: relative;
            min-height: 100%;
            display: flex;
            flex-direction: column;
            background: #f8fafc;
          }
          #feedLocationGate .loc-top { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 5rem 1.5rem 5.25rem; background: #f8fafc; }
          #feedLocationGate .loc-top.loc-top--searchless { padding-bottom: 3.35rem; }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-top {
            background: var(--feed-gate-chrome-color, #00cce5);
            padding-top: 8rem;
            padding-bottom: 10.75rem;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-top.loc-top--searchless {
            padding-bottom: 8.85rem;
          }
          #feedLocationGate .loc-title { width: 100%; max-width: 22rem; margin: 0 auto 2.15rem; color: #0f172a; font-size: clamp(1.65rem, 6.6vw, 2.2rem); font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; line-height: 1.08; }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-title {
            color: #fff;
          }
          #feedLocationGate .text-slider-wrapper { position: relative; height: 1.25em; width: 100%; overflow: hidden; margin-bottom: 0.2rem; }
          #feedLocationGate .text-slide-item { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; white-space: nowrap; opacity: 0; animation: feedLocationTextFadeSlide 9s ease-in-out infinite; will-change: transform, opacity; }
          #feedLocationGate .text-slide-item:nth-child(1) { animation-delay: 0s; }
          #feedLocationGate .text-slide-item:nth-child(2) { animation-delay: 3s; }
          #feedLocationGate .text-slide-item:nth-child(3) { animation-delay: 6s; }
          @keyframes feedLocationTextFadeSlide {
            0% { opacity: 0; transform: translateY(100%); }
            5%, 28% { opacity: 1; transform: translateY(0); }
            33%, 100% { opacity: 0; transform: translateY(-100%); }
          }
          #feedLocationGate .loc-search-wrap { width: 100%; max-width: 22rem; margin: 0 auto; }
          #feedLocationGate .loc-input-row { position: relative; }
          #feedLocationGate .loc-pin { position: absolute; left: 1.2rem; top: 50%; transform: translateY(-50%); color: rgb(148 163 184); pointer-events: none; }
          #feedLocationGate .loc-input { width: 100%; border: 0; outline: none; color: #0f172a; background: #fff; border-radius: 9999px; padding: 1rem 4.2rem 1rem 3rem; font-size: 16px; line-height: 1.2; font-weight: 600; box-shadow: 0 8px 30px rgb(0 0 0 / 0.12); }
          #feedLocationGate .loc-input::placeholder { color: rgb(148 163 184); opacity: 1; }
          #feedLocationGate .loc-input:focus { box-shadow: 0 0 0 4px rgb(255 255 255 / 0.42), 0 8px 30px rgb(0 0 0 / 0.12); }
          #feedLocationGate .loc-request-wrap { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); }
          #feedLocationGate .loc-request-btn { position: relative; width: 2.5rem; height: 2.5rem; border: 0; border-radius: 9999px; background: #eafbfe; color: #00cce5; display: inline-flex; align-items: center; justify-content: center; transition: transform 160ms ease, background-color 160ms ease, color 160ms ease; }
          #feedLocationGate .loc-request-btn:active { transform: scale(0.95); }
          #feedLocationGate .loc-request-btn.is-success { background: rgb(236 253 245); color: rgb(16 185 129); }
          #feedLocationGate .loc-request-btn.is-loading { background: rgb(255 255 255); color: rgb(14 165 233); box-shadow: 0 0 0 3px rgb(255 255 255 / 0.42); }
          #feedLocationGate .loc-request-pulse { position: absolute; inset: 0; border-radius: 9999px; background: rgb(0 204 229 / 0.2); opacity: 0; animation: ping 1.05s cubic-bezier(0, 0, 0.2, 1) infinite; }
          #feedLocationGate .feed-location-suggestions { position: relative; z-index: 30; margin-top: 0; max-height: 0; opacity: 0; padding: 0; overflow: hidden; pointer-events: none; transform: translateY(-4px); border-radius: 1.4rem; background: rgb(255 255 255 / 0.98); border: 1px solid rgb(226 232 240 / 0.95); box-shadow: 0 18px 44px rgb(15 23 42 / 0.16); backdrop-filter: blur(18px); transition: max-height 220ms ease, opacity 180ms ease, margin-top 220ms ease, padding 220ms ease, transform 220ms ease; }
          #feedLocationGate .feed-location-suggestions--open { margin-top: 0.75rem; max-height: 18rem; opacity: 1; padding: 0.5rem; pointer-events: auto; transform: translateY(0); }
          #feedLocationGate .feed-location-suggestion { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; border: 0; background: transparent; border-radius: 1rem; padding: 0.85rem 0.95rem; text-align: left; color: rgb(15 23 42); font-weight: 700; }
          #feedLocationGate .feed-location-suggestion:hover, #feedLocationGate .feed-location-suggestion:focus-visible { background: rgb(241 245 249); outline: none; }
          #feedLocationGate .feed-location-suggestion__label { display: block; font-size: 0.92rem; line-height: 1.1rem; }
          #feedLocationGate .feed-location-suggestion__meta { min-width: 3.7rem; text-align: center; padding: 0.3rem 0.6rem; border-radius: 9999px; background: rgb(236 254 255); color: rgb(8 145 178); font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; }
          #feedLocationGate .loc-status { margin-top: 0.7rem; font-size: 0.74rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.11em; color: rgb(100 116 139); }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-status {
            color: rgb(255 255 255 / 0.9);
          }
          #feedLocationGate .loc-status.hidden { display: none; }
          #feedLocationGate .loc-bento { position: relative; z-index: 3; background: #f8fafc; border-top-left-radius: var(--feed-location-gate-bento-radius); border-top-right-radius: var(--feed-location-gate-bento-radius); padding: 2.35rem 1.25rem 2rem; }
          #feedLocationGate .loc-bento.loc-bento--feed-content {
            background: var(--feed-bento-surface);
            border-top-left-radius: var(--feed-location-gate-bento-radius);
            border-top-right-radius: var(--feed-location-gate-bento-radius);
            padding: 0;
            overflow: visible;
            width: 100%;
            box-sizing: border-box;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .loc-bento.loc-bento--feed-content {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            min-height: 0;
            margin-top: calc(var(--feed-location-gate-bento-radius) * -1);
            padding: 2.35rem 1.25rem 2rem;
            overflow: hidden;
            box-shadow: 0 -18px 34px -18px rgb(15 23 42 / 0.2);
          }
          #feedLocationGate .feed-bento-pin-backdrop {
            position: -webkit-sticky;
            position: sticky;
            top: var(--feed-location-gate-header-height);
            height: 1px;
            margin-bottom: -1px;
            background: transparent;
            pointer-events: none;
            z-index: 6;
            width: 100%;
          }
          #feedLocationGate .feed-bento-pin-outline {
            position: -webkit-sticky;
            position: sticky;
            top: var(--feed-location-gate-header-height);
            height: 1px;
            margin-bottom: -1px;
            background: transparent;
            box-sizing: border-box;
            pointer-events: none;
            z-index: 7;
            width: 100%;
          }
          #feedLocationGate .feed-stage-bento-scroll {
            min-height: 0;
            height: auto;
            overflow: visible;
            margin-top: 0;
            padding-top: 0;
            position: relative;
            z-index: 3;
            background: var(--feed-bento-surface);
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border: 0;
            box-sizing: border-box;
          }
          #feedLocationGate:not([data-location-screen-mode="feed-stage"]) .feed-stage-bento-scroll {
            flex: 1 1 auto;
          }
          #feedLocationGate .feed-gate-hero-shell {
            --feed-gate-hero-accent: #3f46e5;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            margin: -2.35rem -1.25rem 0;
            padding: 4.6rem 0 2.1rem;
            background: #fff;
            overflow: hidden;
          }
          #feedLocationGate .feed-gate-hero-copy {
            width: 100%;
            padding: 0 1.5rem;
          }
          #feedLocationGate .feed-gate-hero-title {
            margin: 0;
            font-size: 1.42rem;
            line-height: 1.05;
            letter-spacing: -0.035em;
            font-weight: 500;
            text-align: left;
            color: rgb(17 24 39);
          }
          #feedLocationGate .feed-gate-hero-title__line {
            display: block;
          }
          #feedLocationGate .feed-gate-hero-title__line + .feed-gate-hero-title__line {
            margin-top: 0.32rem;
          }
          #feedLocationGate .feed-gate-hero-title__accent {
            font-weight: 700;
            color: var(--feed-gate-hero-accent);
            transition: color 500ms ease;
          }
          #feedLocationGate .feed-gate-hero-rail {
            display: flex;
            overflow-x: auto;
            gap: 0.5rem;
            padding: 1.25rem 27% 3.35rem 1.5rem;
            margin-top: -1.25rem;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 1.5rem;
            scrollbar-width: none;
            -ms-overflow-style: none;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
            touch-action: manipulation;
          }
          #feedLocationGate .feed-gate-hero-rail::-webkit-scrollbar { display: none; }
          #feedLocationGate .feed-gate-hero-card {
            position: relative;
            flex: 0 0 72%;
            width: 72%;
            aspect-ratio: 9 / 13;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.06);
            transition: opacity 500ms ease, transform 500ms ease;
            transform: translateZ(0);
            scroll-snap-align: start;
            opacity: 0.5;
          }
          #feedLocationGate .feed-gate-hero-card[data-active="true"] { opacity: 1; }
          #feedLocationGate .feed-gate-hero-card__inner {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 1.35rem;
            background: var(--feed-gate-hero-card-bg);
          }
          #feedLocationGate .feed-gate-hero-card__headline {
            margin: 0;
            color: #fff;
            opacity: 0;
            animation: feedGateFadeScaleIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          #feedLocationGate .feed-gate-hero-card__headline--hero {
            font-size: 1.72rem;
            line-height: 1.1;
            font-weight: 500;
            letter-spacing: -0.03em;
          }
          #feedLocationGate .feed-gate-hero-card__headline--category {
            font-size: 1.4rem;
            line-height: 1.22;
            font-weight: 700;
            letter-spacing: -0.03em;
          }
          #feedLocationGate .feed-gate-hero-card__headline-line {
            display: block;
          }
          #feedLocationGate .feed-gate-hero-card__headline-accent {
            color: var(--feed-gate-hero-card-accent);
            font-weight: 700;
          }
          #feedLocationGate .feed-gate-hero-rail__endcap {
            flex: 0 0 1px;
            width: 1px;
          }
          #feedLocationGate .feed-gate-social-shell {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
            margin-top: 3.25rem;
            padding: 0 1.5rem;
          }
          #feedLocationGate .feed-gate-social-copy {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            width: 100%;
            margin-left: auto;
          }
          #feedLocationGate .feed-gate-social-title {
            margin: 0;
            font-size: 1.42rem;
            line-height: 1.05;
            letter-spacing: -0.035em;
            font-weight: 500;
            color: rgb(17 24 39);
          }
          #feedLocationGate .feed-gate-social-title__line {
            display: block;
          }
          #feedLocationGate .feed-gate-social-title__line + .feed-gate-social-title__line {
            margin-top: 0.32rem;
          }
          #feedLocationGate .feed-gate-social-title strong {
            font-weight: 700;
          }
          #feedLocationGate .feed-gate-social-title__accent {
            font-weight: 700;
            color: rgb(236 72 153);
          }
          #feedLocationGate .feed-gate-social-card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 1.5rem;
            width: 100%;
            min-height: 320px;
            padding: 1.75rem;
            background: #fff;
            border: 1px solid rgb(243 244 246);
            border-radius: 2rem;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            box-sizing: border-box;
          }
          #feedLocationGate .feed-gate-social-card__content {
            position: relative;
            z-index: 1;
            display: flex;
            flex: 1 1 auto;
            min-width: 0;
            flex-direction: column;
            justify-content: center;
            max-width: 15.5rem;
          }
          #feedLocationGate .feed-gate-social-card__title {
            margin: 0 0 0.75rem;
            color: rgb(17 24 39);
            font-size: 1.25rem;
            line-height: 1.2;
            font-weight: 700;
          }
          #feedLocationGate .feed-gate-social-card__description {
            margin: 0;
            color: rgb(75 85 99);
            font-size: 0.875rem;
            line-height: 1.7;
            font-weight: 500;
          }
          #feedLocationGate .feed-gate-social-card__media {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 8.125rem;
            width: 8.125rem;
            max-width: 8.125rem;
          }
          #feedLocationGate .feed-gate-social-card__image {
            display: block;
            width: 100%;
            height: auto;
            border-radius: 1.25rem;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
            mix-blend-mode: darken;
          }
          @media (max-width: 380px) {
            #feedLocationGate .feed-gate-social-shell {
              gap: 2rem;
            }
            #feedLocationGate .feed-gate-social-card {
              gap: 1rem;
              padding: 1.35rem;
            }
            #feedLocationGate .feed-gate-social-card__media {
              flex-basis: 6.75rem;
              width: 6.75rem;
              max-width: 6.75rem;
            }
          }
          #feedLocationGate .feed-gate-hero-scroll-spacer {
            width: 100%;
            height: clamp(18rem, 44svh, 30rem);
            flex: 0 0 auto;
          }
          @keyframes feedGateFadeScaleIn {
            0% { opacity: 0; transform: scale(0.92) translateY(8px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          #feedLocationGate .fade-in-up { opacity: 0; transform: translateY(30px); animation: feedLocationFadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes feedLocationFadeUp { to { opacity: 1; transform: translateY(0); } }
          #feedLocationGate.feed-location-gate--resolving { pointer-events: none; animation: feedLocationGateResolveOut 360ms cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @keyframes feedLocationGateResolveOut {
            0% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-42px); }
          }
          @media (prefers-reduced-motion: reduce) {
            #feedLocationGate .feed-gate-hero-title__accent,
            #feedLocationGate .feed-gate-hero-card,
            #feedLocationGate .feed-gate-hero-card__headline {
              transition: none;
              animation: none;
            }
            #feedLocationGate .feed-gate-hero-card__headline {
              opacity: 1;
            }
          }
        </style>

        <div class="loc-shell">
          ${u?`
            <div class="loc-top${d?"":" loc-top--searchless"}">
              <div class="loc-title">
                <div class="text-slider-wrapper">
                  ${(Array.isArray(n?.topSliderItems)?n.topSliderItems:[]).map(b=>`
                    <div class="text-slide-item">${m(String(b||""))}</div>
                  `).join("")}
                </div>
                <div>${m(String(n?.topCityLine||""))}</div>
              </div>
              ${d?`
                <div class="loc-search-wrap">
                  <div class="loc-input-row">
                    <span class="loc-pin">${F("map-pin","w-5 h-5")}</span>
                    <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${m(a)}" placeholder="${m(String(n?.searchPlaceholder||""))}" class="loc-input" />
                    <div class="loc-request-wrap">
                      <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="${m(String(n?.useLocationAriaLabel||""))}">
                        ${Lr("crosshair","w-5 h-5 relative z-10")}
                        <span id="locatePulse" class="loc-request-pulse opacity-0"></span>
                      </button>
                    </div>
                  </div>
                  <div id="feedLocationCitySuggestions" data-feed-location-city-suggestions role="listbox" aria-hidden="true" class="feed-location-suggestions"></div>
                  <p id="feedLocationStatus" class="loc-status hidden"></p>
                </div>
              `:""}
            </div>
          `:""}

          <div class="feed-bento-pin-backdrop" aria-hidden="true"></div>
          <div class="feed-bento-pin-outline" aria-hidden="true"></div>
          <div class="loc-bento loc-bento--feed-content" data-location-screen-content="${m(l)}">
            <div class="feed-stage-bento-scroll">
              ${p}
            </div>
          </div>
        </div>
      </div>
    `}function No(){return Cr()}function xr(){return Ge()?`
      <div data-feed-composer-wrap class="app-content-inline mb-6">
        <button data-nav="upload" data-upload-intent="feed" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${F("plus-square","w-4 h-4")} Neuer Feed Post
        </button>
      </div>
    `:""}function zo(){return`
      <div class="flex-none w-[29%] sm:w-[120px] snap-start ml-5" style="${Fe({withMarginLeft:!0})}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 flex flex-col justify-between border border-white/10" style="${st("background:linear-gradient(145deg,#111827 0%,#1f2937 52%,#000000 100%);padding:0.75rem;display:flex;flex-direction:column;justify-content:space-between;")}">
          <div class="relative z-10" style="position:relative;z-index:10;">
            <div class="absolute top-[26px] left-[13px] h-6 border-l-2 border-dashed border-white/80" style="position:absolute;top:26px;left:13px;height:1.5rem;border-left:2px dashed rgba(255,255,255,0.8);"></div>
            <div class="absolute top-[49px] left-[10px] w-2 h-2 rounded-full border border-white/70 bg-white/20 flex items-center justify-center shadow-sm" style="position:absolute;top:49px;left:10px;width:0.5rem;height:0.5rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
              <div style="width:0.25rem;height:0.25rem;border-radius:9999px;background:#fff;"></div>
            </div>
            <div class="bg-gradient-to-b from-white/20 to-white/5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 relative z-10 shadow-sm" style="position:relative;z-index:10;background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.06) 100%);">
              ${F("map-pin","w-3.5 h-3.5 text-white")}
            </div>
          </div>
          <div class="mt-auto relative z-10" style="margin-top:auto;position:relative;z-index:20;">
            <h2 class="text-[22px] font-black text-white uppercase leading-[1.05] tracking-tight w-full mb-1.5 opacity-95" style="font-size:clamp(14px,4.2vw,18px);line-height:1.05;opacity:0.95;">
              <span style="display:block;white-space:nowrap;">Spots &amp;</span>
              <span style="display:block;white-space:nowrap;">Stories</span>
            </h2>
            <p class="text-[9px] text-gray-400 leading-tight mb-2" style="position:relative;z-index:20;font-size:9px;line-height:1.15;color:rgb(156 163 175);">Die besten Orte erleben.</p>
            <div class="flex items-center gap-1 text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1" style="position:relative;z-index:20;color:rgb(251 191 36);">
              <span>Swipe</span>
              ${F("arrow-right","w-2.5 h-2.5")}
            </div>
          </div>
          <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" style="position:absolute;right:-1rem;bottom:-1rem;width:6rem;height:6rem;border-radius:9999px;background:rgba(255,255,255,0.05);filter:blur(24px);pointer-events:none;z-index:0;"></div>
        </div>
      </div>
    `}function Po(e={},t=0){const r=String(e?.spotId||e?.postId||"").trim(),o=m(r),n=o?`data-best-spot-avatar="${o}"`:"",i=o?`data-img-key="best-spot-avatar:${o}"`:"",a=o?`data-best-spot-name="${o}"`:"",l=String(e?.profileUrl||ee("apps/menyra-social/index.html",{tab:"feed",source:"best-spot"})).trim(),d=String(e?.restaurantId||"").trim(),u=String(e?.avatarUrl||"").trim(),p=String(e?.displayName||"Best Spot").trim()||"Best Spot",b=t<4,v=String(e?.ratingDisplay||"4.8").trim()||"4.8",w=b?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',S='<svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true" focusable="false" style="display:block;color:#fbbf24;fill:currentColor;stroke:currentColor;stroke-width:1.5;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',x=u?`<img src="${m(h(u,"small"))}" ${w} decoding="async" width="120" height="208" ${n} ${i} class="absolute inset-0 w-full h-full object-cover" />`:`<div class="absolute inset-0 flex items-center justify-center text-white/85" style="background:linear-gradient(145deg,#1f2937 0%,#0f172a 60%,#020617 100%);">${F("map-pin","w-6 h-6")}</div>`,I=d?`<button type="button" data-profile-business="${m(p)}" data-profile-id="${m(d)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer text-left" style="${Fe()}">`:`<a href="${m(l)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${Fe()}">`,T=d?"</button>":"</a>";return`
      ${I}
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${st()}">
          ${x}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0) 100%);"></div>
          <div class="absolute top-2 left-2" style="position:absolute;top:0.5rem;left:0.5rem;z-index:12;">
            <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 px-1.5 py-0.5 rounded-md shadow-sm">
              ${S}
              <span class="text-[9px] font-bold text-white pt-[1px]">${m(v)}</span>
            </div>
          </div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="p-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-sm">
              ${F("arrow-right","w-3 h-3")}
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${a}>${m(p)}</h3>
          </div>
        </div>
      ${T}
    `}function Ro(e={},t=0,r=""){const o=ct(e),n=t<5;if(o.kind==="video"&&o.src){const i=n?'preload="auto" fetchpriority="high"':'preload="metadata" fetchpriority="low"',a=o.poster?`poster="${m(h(o.poster,"small"))}"`:"",l=r?`data-story-preview-id="${m(r)}"`:"";return`
        <video src="${m(o.src)}" ${a} ${i} data-story-preview-video ${l} autoplay muted loop playsinline draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>
      `}if(o.src){const i=n?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
        <img src="${m(h(o.src,"small"))}" ${i} decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />
      `}return`
      <div class="absolute inset-0 flex items-center justify-center text-white/80" style="background:linear-gradient(145deg,#334155 0%,#1e293b 52%,#020617 100%);">
        ${F("camera","w-7 h-7")}
      </div>
    `}function Ir(e,t=0){const r=Ue(e),o=r.storyRestaurantId;if(!o)return"";const n=String(r.truthSource||"canonical").trim().toLowerCase(),a=n==="feed-fallback"?ee("apps/menyra-social/index.html",{r:o,tab:"profile",source:"story-fallback"}):ye(o),l=String(r.storyLabel||"").trim()||"Restaurant",d=String(r.logoSource||"").trim(),u=ue(o,d,"thumb",!1),p=o?m(o):"",b=p?`data-story-logo="${p}"`:"",v=p?`data-img-key="story-logo:${p}"`:"",w=p?`data-story-border="${p}"`:"",S=p?`data-story-name="${p}"`:"",x=p?`data-story-item="${p}"`:"",I=`data-story-truth="${m(n)}"`,T=`data-story-render-sig="${m(Vt(e))}"`,O=t<6?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
      <a href="${a}" ${x} data-story-url="${m(a)}" ${I} ${T} class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${Fe()}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${st()}">
          ${Ro(e,t,o)}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.2) 100%);"></div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm" ${w} style="padding:2px;background:linear-gradient(135deg,#f59e0b 0%,#db2777 100%);">
              <img src="${m(u)}" ${O} decoding="async" width="28" height="28" ${b} ${v} class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${S}>${m(l)}</h3>
          </div>
        </div>
      </a>
    `}function Ct(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=tr(e,o),i=Zt(t,r,Jt(n,e,o)),l=rr({spots:i,stories:n}).map((d,u)=>d.type==="spot"?Po(d.spot,u):Ir(d.story,u)).join("");return`
      <div data-spot-story-track class="flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5" style="${Br()}">
        ${zo()}
        ${l||'<div class="flex items-center text-slate-400 text-xs font-bold uppercase px-2">Keine Spots vorhanden</div>'}
        <div class="flex-none w-1" aria-hidden="true"></div>
      </div>
    `}function Qe(e,t){const r=e.id?String(e.id):"",o=r?`data-post-like-count="${m(r)}"`:"",n=r?`data-post-comment-count="${m(r)}"`:"",i=r?`data-feed-id="${m(r)}"`:'data-feed-id=""',a=r?`data-feed-logo="${m(r)}"`:"",l=r?`data-img-key="feed-logo:${m(r)}"`:"",d=r?`data-img-key="feed-hero:${m(r)}"`:"",u=`data-feed-render-sig="${m(qt(e))}"`,p=t<2,b=p?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',v=p?'loading="eager"':'loading="lazy" fetchpriority="low"',w=s.restaurants.find($=>$.id===(e.restaurantId||e.ownerId))||{},S=w.logoUrl||w.logo||e.logo||"",x=ue(e.restaurantId||e.ownerId,S,"avatar"),I=h(e.image,"medium",{stableKey:r?`feed-hero:${r}`:""}),T=m(`${h(e.image,"small")} 480w, ${I} 768w, ${h(e.image,"large")} 1280w`),O="(max-width: 640px) 100vw, 600px",H=e.poster?h(e.poster,"medium",{stableKey:r?`feed-hero-poster:${r}`:""}):I,oe=e.isVideo&&e.videoUrl?`<video src="${m(e.videoUrl)}" poster="${m(H)}" autoplay muted loop playsinline preload="none" ${d} class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${m(I)}" srcset="${T}" sizes="${O}" ${b} ${d} decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`,ne=e.restaurantId?String(ye(e.restaurantId)||"").trim():"",c=ne?`<a href="${m(ne)}" data-feed-post-open="${m(e.restaurantId)}" data-story-url="${m(ne)}" aria-label="Stories von ${m(e.business)} ansehen" class="block w-full h-full">${oe}</a>`:oe;return`
    <div class="group feed-card" ${i} ${u}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${m(e.business)}" data-profile-id="${m(e.restaurantId||"")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${m(x)}" ${v} ${a} ${l} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${m(e.business)} ${F("star","w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${m(e.location)}</p>
          </div>
        </button>
        ${F("more-horizontal","w-5 h-5 text-slate-400")}
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden bg-slate-200" style="aspect-ratio:4/5">
          ${c}
          ${e.isLive?`
            <div class="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> LIVE
            </div>
          `:""}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${m(e.content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button type="button" data-feed-post-like="${m(r)}" data-post-like-btn="${m(r)}" class="flex items-center gap-2 text-white/80 hover:text-rose-400 transition-colors">
                  ${F("heart","w-5 h-5")} <span ${o} class="text-[10px] font-black">${m(e.likes)}</span>
                </button>
                <button type="button" data-feed-post-comment="${m(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  ${F("message-circle","w-5 h-5")} <span ${n} class="text-[10px] font-black">${m(e.comments)}</span>
                </button>
              </div>
              <button type="button" data-feed-post-share="${m(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                ${F("share-2","w-4 h-4")} <span data-feed-share-label class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function At(e){return e.length?e.slice(0,10).map((t,r)=>Qe(t,r)).join(""):'<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>'}function kr(e){const t=f?.getElementById("feedList");if(!t)return!1;if(!e.length){const l=At(e);return t.innerHTML!==l?(t.innerHTML=l,!0):!1}const r=Array.from(t.querySelectorAll("[data-feed-id]")),o=r.map(l=>l.dataset.feedId||""),n=e.map(l=>String(l.id||""));if(o.join("|")===n.join("|")){let l=!1;return e.forEach((d,u)=>{const p=r[u];if(!p)return;const b=qt(d);if(String(p.getAttribute("data-feed-render-sig")||"").trim()===b)return;const w=f.createElement("template");w.innerHTML=Qe(d,u);const S=w.content.firstElementChild;S&&(p.replaceWith(S),l=!0)}),e.forEach(de),e.forEach(Z),l}const i=new Map;r.forEach(l=>i.set(l.dataset.feedId||"",l));const a=f.createDocumentFragment();return e.forEach((l,d)=>{const u=String(l.id||""),p=u?i.get(u):null;if(p)i.delete(u),a.appendChild(p);else{const b=f.createElement("template");b.innerHTML=Qe(l,d);const v=b.content.firstElementChild;v&&a.appendChild(v)}}),t.replaceChildren(a),e.forEach(de),e.forEach(Z),!0}function Go(e){if(!K||!(e instanceof K)||e.dataset.storyBoomerangBound==="1")return;e.dataset.storyBoomerangBound="1",e.defaultMuted=!0,e.muted=!0,e.setAttribute("muted",""),e.autoplay=!0,e.loop=!1,e.controls=!1,e.disablePictureInPicture=!0,e.preload="metadata",e.playsInline=!0,e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline","");const t=String(y?.navigator?.userAgent||"").toLowerCase(),r=!!y?.matchMedia?.("(pointer: coarse)")?.matches,o=/android|iphone|ipad|ipod|mobile/.test(t),n=!!y?.matchMedia?.("(display-mode: standalone)")?.matches||!!y?.navigator?.standalone,i=r||o||n;let a=1.35;const l=.05;Q.set(e,{previewStart:l,previewEnd:a,active:!1,forceLightweightLoop:i});const d=(b=!1)=>{const v=Q.get(e);v&&(v.active=!!b,v.previewEnd=a,e.dataset.storyPreviewActive=b?"1":"0")},u=()=>{const b=Number(e.duration||0);if(!Number.isFinite(b)||b<=.05){a=1.35;const w=Q.get(e);w&&(w.previewEnd=a);return}a=Math.max(l+.45,Math.min(b,1.45));const v=Q.get(e);v&&(v.previewEnd=a)},p=()=>{if(Q.get(e)?.active){u();{e.currentTime>=a&&(e.currentTime=l+.01,e.paused&&e.play().catch(()=>{}));return}}};e.addEventListener("loadedmetadata",u),e.addEventListener("timeupdate",p),e.addEventListener("stalled",()=>{Q.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("waiting",()=>{Q.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("ended",()=>{Q.get(e)?.active&&(e.currentTime=l,e.play().catch(()=>{}))});try{e.currentTime=l}catch{}d(!1)}function Tt(e,{reset:t=!1}={}){if(!K||!(e instanceof K))return;const r=Q.get(e);if(r){if(t||!Number.isFinite(e.currentTime)||e.currentTime>r.previewEnd+.05)try{e.currentTime=r.previewStart}catch{}r.active=!0,e.dataset.storyPreviewActive="1",e.play().catch(()=>{})}}function Mt(e){if(!K||!(e instanceof K))return;const t=Q.get(e);t&&(t.active=!1),e.dataset.storyPreviewActive="0";try{e.pause()}catch{}}function Bo(){return!y?.IntersectionObserver||!K?null:Be||(Be=new y.IntersectionObserver(e=>{e.forEach(t=>{const r=t.target;if(!(r instanceof K))return;const n=(t.isIntersecting?Number(t.intersectionRatio||0):0)>=.3;r.dataset.storyPreviewVisible=n?"1":"0",n?Tt(r):Mt(r)})},{threshold:[0,.15,.3,.55,.85,1]}),Be)}function Fo(){!f||Dt||(Dt=!0,f.addEventListener("visibilitychange",()=>{const e=f.getElementById("storiesRow");if(!e)return;const t=Array.from(e.querySelectorAll("video[data-story-preview-video]"));if(f.hidden){t.forEach(r=>Mt(r));return}t.forEach(r=>{String(r.dataset.storyPreviewVisible||"0")==="1"&&Tt(r)})}),y?.addEventListener?.("pagehide",()=>{const e=f.getElementById("storiesRow");e&&e.querySelectorAll("video[data-story-preview-video]")?.forEach?.(t=>Mt(t))}))}function Uo(e=null){if(!f)return;const r=(e&&typeof e.querySelector=="function"?e:f).querySelector?.("[data-spot-story-track]");if(!(r instanceof HTMLElement)||r.dataset.edgeSwipeGuardBound==="1")return;r.dataset.edgeSwipeGuardBound="1";let o=!1,n=0,i=0,a=0;const l=p=>{const b=p.touches?.[0];b&&(o=!0,n=b.clientX,i=b.clientY,a=Number(r.scrollLeft||0))},d=p=>{if(!o)return;const b=p.touches?.[0];if(!b)return;const v=b.clientX-n,w=b.clientY-i;if(Math.abs(v)<=Math.abs(w))return;const S=Math.max(0,Number(r.scrollWidth||0)-Number(r.clientWidth||0)),x=a<=.5||Number(r.scrollLeft||0)<=.5,I=Math.abs(S-Number(r.scrollLeft||0))<=.5,T=v>0&&x,O=v<0&&I;(T||O)&&p.preventDefault()},u=()=>{o=!1};r.addEventListener("touchstart",l,{passive:!0}),r.addEventListener("touchmove",d,{passive:!1}),r.addEventListener("touchend",u,{passive:!0}),r.addEventListener("touchcancel",u,{passive:!0})}function Ne(e=null){const t=e&&typeof e.querySelectorAll=="function"?e:f?.getElementById("storiesRow");if(!t)return;const r=Array.from(t.querySelectorAll?.("video[data-story-preview-video]")||[]),o=Bo();o&&o.disconnect(),r.forEach(n=>{Go(n),o?o.observe(n):Tt(n,{reset:!0})}),Uo(t),Fo()}function Er(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=f?.getElementById("storiesRow");return n?(n.innerHTML=Ct(e,t,{fallbackFeedPosts:r,fallbackStories:o}),Ne(n),!0):!1}function Do(e){if(!f||!e)return!1;const t=f.getElementById("feedList");if(!t)return!1;const r=e.querySelector("[data-feed-composer-wrap]");if(!Ge())return r?(r.remove(),!0):!1;if(r)return!1;const n=f.createElement("template");n.innerHTML=xr();const i=n.content.firstElementChild;return i?(t.parentNode?.insertBefore(i,t),!0):!1}function Vo(){const e=f?.getElementById("feedView");if(!e)return!1;if(String(e.dataset.feedViewMode||"feed").trim().toLowerCase()!=="feed")return _t(),Ie(),y?.lucide?.createIcons&&y.lucide.createIcons(),!0;const o=(Array.isArray(s?.feedPosts)?s.feedPosts:[]).filter(I=>s.feedCategory==="all"||I.category===s.feedCategory).sort((I,T)=>(g(T.createdAt)?.getTime()||0)-(g(I.createdAt)?.getTime()||0)),n=(Array.isArray(s.stories)?s.stories:[]).filter(I=>Kt(I)),{feedPosts:i,stories:a}=Xt({feedPosts:o,stories:n}),l=a,d=tr(l,l),u=Zt(i,i,Jt(d,l)),p=f.getElementById("storiesRow"),b=Qr({spots:u,stories:d});let v=!1;if(p){const I=!!p.querySelector("[data-spot-story-track]");(C()!==b||!I)&&(Er(l,i,{fallbackFeedPosts:i,fallbackStories:l}),A(b),v=!0),d.forEach(H=>{B(H),V(H)});const T=`motion:${b}|${d.length}`;(v||String(p.dataset.storyPreviewMotionSig||"")!==T)&&(Ne(p),p.dataset.storyPreviewMotionSig=T)}const w=Do(e),S=kr(i);et(i),_t();const x=Dr(i);return x!==ir&&(ir=x,tt(i)),(v||w||S)&&y?.lucide?.createIcons&&y.lucide.createIcons(),!0}function Cr(){const e=!!X(xe()),t=e?"feed":"feed-gate";let r=wr();if(e){const i=(Array.isArray(s?.feedPosts)?s.feedPosts:[]).filter(p=>s.feedCategory==="all"||p.category===s.feedCategory).sort((p,b)=>(g(b.createdAt)?.getTime()||0)-(g(p.createdAt)?.getTime()||0)),a=(Array.isArray(s.stories)?s.stories:[]).filter(p=>Kt(p)),{feedPosts:l,stories:d}=Xt({feedPosts:i,stories:a}),u=d;r=`
        <div id="storiesRow" class="app-content-inline pt-6">
          ${Ct(u,l,{fallbackFeedPosts:l,fallbackStories:u})}
        </div>
        ${xr()}
        <div id="feedList" class="app-content-inline py-4 space-y-12">
          ${At(l)}
        </div>
      `}const o=!!Ye;return Ye=!1,`
    ${o?`
      <style>
        #feedView.feed-view-slide-enter {
          animation: feedViewSlideIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }
        @keyframes feedViewSlideIn {
          0% { opacity: 0; transform: translateY(44px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      </style>
    `:""}
    <div id="feedView" data-feed-view-mode="${t}" class="${o?"feed-view-slide-enter":""}">
      ${Oo({mode:e?"feed-stage":"feed-gate",bentoContentHtml:r,showSearchControls:!e,showTopSection:!e})}
    </div>
  `}function qo(){if(!f||ar)return;ar=!0;const e=()=>Sr();f.addEventListener("input",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&kt(o.value)}),f.addEventListener("pointerdown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&f?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}}),f.addEventListener("touchstart",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&f?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}},{passive:!1}),f.addEventListener("focusin",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&kt(o.value)}),f.addEventListener("focusout",t=>{if(!e())return;const r=t.target;!(r instanceof Element)||!r.closest("[data-feed-location-city-input]")||q(()=>{const n=f?.activeElement;n instanceof Element&&(n.closest("[data-feed-location-city-input]")||n.closest("[data-feed-city-suggestion]"))||J()},120)}),f.addEventListener("change",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;const n=String(o.value||"").trim();if(!n)return;const i=It(n,1)[0];if(!i||P(n)!==P(i.label))return;J(),Oe({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||be({fallbackCity:i})}),f.addEventListener("keydown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;if(t.key==="Escape"){J();return}if(t.key!=="Enter")return;const n=It(o.value,1)[0];if(!n)return;t.preventDefault(),o.value=n.label,J(),Oe({lat:n.lat,lng:n.lng,label:n.label,city:n.city||n.label,country:n.country,countryCode:n.countryCode,source:"city-search"})||be({fallbackCity:n})}),f.addEventListener("click",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-city-suggestion]");if(o){t.preventDefault(),t.stopPropagation();const i=hr(o.getAttribute("data-feed-city-suggestion")||"");if(i){const a=f?.getElementById("feedLocationCityInput");a instanceof HTMLInputElement&&(a.value=i.label),J(),Oe({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||be({fallbackCity:i})}return}r.closest("[data-feed-location-request]")&&(t.preventDefault(),t.stopPropagation(),be({forceExact:!0}))})}function _t(){qo(),Sr()&&Ie();const e=f?.getElementById("feedView");if(!e){gr();return}if(So(e),String(e.dataset.feedViewMode||"").trim().toLowerCase()==="feed"?(fr(),Ne()):(Se=!1,$e()),e.dataset.bound==="true"){Ne(),Ie();return}const r=()=>String(e.dataset.feedViewMode||"").trim().toLowerCase()!=="feed",o=n=>{if(r()||!(n instanceof Element))return;const i=n.closest("[data-story-item]")||n.closest("[data-feed-post-open]");!(i instanceof Element)||String(i.getAttribute("data-story-truth")||"").trim().toLowerCase()==="feed-fallback"||Zr(i.getAttribute("data-story-item")||i.getAttribute("data-feed-post-open")||"",i.getAttribute("data-story-url")||i.getAttribute("href")||"")};e.addEventListener("pointerdown",n=>{o(n.target)},{passive:!0}),e.addEventListener("touchstart",n=>{o(n.target)},{passive:!0}),e.addEventListener("click",n=>{const i=n.target;if(!(i instanceof Element))return;const a=i.closest("[data-story-item]");if(a){o(a);return}const l=i.closest("[data-feed-post-like]");if(l){const v=l.dataset.feedPostLike||"";v&&Ee(v);return}const d=i.closest("[data-feed-post-comment]");if(d){const v=d.dataset.feedPostComment||"",w=Yt(v);if(w){const x=d.closest("[data-feed-id]")?.querySelector?.(`[data-img-key="feed-hero:${v}"]`)||null,I=String(x?.currentSrc||x?.getAttribute?.("src")||"").trim();Promise.resolve(ke(w,{previewImageEl:x,previewImageSrc:I})).then(()=>{eo()})}return}const u=i.closest("[data-feed-post-share]");if(u){const v=u.dataset.feedPostShare||"",w=Yt(v);if(!w)return;const S=Xr(w),x=String(w.business||"Menyra").trim()||"Menyra",I=[x,String(w.content||w.caption||"").trim()].filter(Boolean).join(`
`);y?.navigator?.share?y.navigator.share({title:x,text:I,url:S}).then(()=>{mt(u,"Geteilt")}).catch(async T=>{if(String(T?.name||"").trim()==="AbortError")return;const O=await or(S);mt(u,O?"Kopiert":"Link")}):or(S).then(T=>{mt(u,T?"Kopiert":"Link")});return}const p=i.closest("[data-nav]");if(p){const v=p.dataset.nav;if(v){if(v==="favorites"&&!String(s.user?.uid||"").trim()){W("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");return}const w=v==="upload"?{upload:j(p.dataset.uploadIntent||"",s.upload)}:{},S=v==="favorites"?"profile":v,x=v==="favorites"?"favorites":v==="profile"?"profile":s.profileTopTab;if(v==="profile"&&typeof k=="function"){s.chatSettingsOpen=!1,s.chatListScope="inbox",s.chatThreadMenuId="",s.settingsView="main",s.selectedBusiness=null,s.postModal={open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},s.likesModal={open:!1,postId:"",animate:!1},s.leadModal={open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},s.customerModal={open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},k({showBack:!1,topTab:"profile"});return}U({activeTab:S,profileTopTab:x,drawerOpen:!1,chatSettingsOpen:!1,chatListScope:"inbox",chatThreadMenuId:"",settingsView:"main",selectedBusiness:null,profileView:null,profileModal:{open:!1,profile:null},postModal:{open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},likesModal:{open:!1,postId:"",animate:!1},leadModal:{open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},customerModal:{open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},...w})}return}const b=i.closest("[data-profile-business]");b&&te({id:b.dataset.profileId||"",name:b.dataset.profileBusiness||""},{showBack:!0})}),Ne(),Ie(),e.dataset.bound="true"}return{renderHomeView:No,renderFeedView:Cr,renderStoryItem:Ir,renderStoriesRow:Ct,renderFeedItem:Qe,renderFeedList:At,patchFeedList:kr,patchStoriesRow:Er,updateFeedDom:Vo,bindFeedDelegation:_t}}function Tr(s={}){return String(s.url||s.mediaUrl||s.media?.[0]?.url||s.media?.[0]?.thumbUrl||s.imageUrl||s.image||s.photoUrl||s.pictureUrl||"").trim()}function Mr(s={}){const g=String(s.media?.[0]?.type||s.mediaType||s.type||"").trim().toLowerCase();return s.isVideo===!0||g==="video"||g.startsWith("video/")}function Qo(s,g={},C=""){return{id:s,url:Tr(g),type:g.type||"square",title:g.title||"",caption:g.caption||"",createdAt:g.createdAt,likes:g.likesCount??g.likes??0,comments:g.commentsCount??g.comments??0,isVideo:Mr(g),ownerType:"user",ownerId:C||""}}function an(s,g={},C=""){return{id:s,url:Tr(g),type:g.type||"square",title:g.title||"",caption:g.caption||"",createdAt:g.createdAt,likes:g.likesCount??g.likes??0,comments:g.commentsCount??g.comments??0,isVideo:Mr(g),ownerType:"restaurant",ownerId:C||"",restaurantId:C||""}}function _r(s=[]){return(Array.isArray(s)?s:[]).map(g=>{const C=String(g?.restaurantId||g?.id||"").trim(),A=g?.isLive?"1":"0",N=String(g?.truthSource||g?.storyTruthSource||g?.storyTruth||"").trim().toLowerCase()||"canonical",z=String(g?.mediaType||g?.type||"").trim().toLowerCase(),B=String(g?.videoUrl||g?.imageUrl||g?.mediaUrl||g?.embedUrl||g?.url||"").trim(),V=g?.createdAt?.seconds!==void 0?`${g.createdAt.seconds}:${Number(g.createdAt?.nanoseconds)||0}`:String(g?.createdAt||g?.updatedAt||"").trim();return`${C}|${A}|${N}|${z}|${B}|${V}`}).join(",")}function sn({posts:s=[],force:g=!1,fastMode:C=!1,allowFeedFallback:A=!1,buildStoriesFromFeed:N,currentSignature:z=""}={}){if(!C||!A)return{updated:!1,signature:z,stories:[]};if(!Array.isArray(s)||!s.length)return{updated:!1,signature:z,stories:[]};if(typeof N!="function")return{updated:!1,signature:z,stories:[]};const B=N(s);if(!B.length)return{updated:!1,signature:z,stories:[]};const V=_r(B);return!g&&z===V?{updated:!1,signature:z,stories:[]}:{updated:!0,signature:V,stories:B}}const Xo=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),Jo=Object.freeze({xk:"Kosove",al:"Shqiperi",rs:"Serbi"});function Zo(s=""){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}function en(s=""){const g=Zo(s);return g&&Xo.get(g)||""}function le(s,g){const C=Number(s),A=Number(g);return!Number.isFinite(C)||!Number.isFinite(A)||Math.abs(C)<1e-6&&Math.abs(A)<1e-6?null:Math.abs(C)<=90&&Math.abs(A)<=180?{lat:C,lng:A}:Math.abs(C)<=180&&Math.abs(A)<=90?{lat:A,lng:C}:null}function Gt(s={}){return!s||typeof s!="object"?null:le(s.lat,s.lng)||le(s.latitude,s.longitude)||le(s.gpsLat,s.gpsLng)||le(s.geo?.lat,s.geo?.lng)||le(s.geo?.latitude,s.geo?.longitude)||le(s.coords?.lat,s.coords?.lng)||le(s.coords?.latitude,s.coords?.longitude)||le(s.location?.lat,s.location?.lng)}function cn({state:s=null,firebaseApi:g={},constants:C={},visibilityApi:A={},utilityApi:N={}}={}){const z=typeof g.collectionFn=="function"?g.collectionFn:null,B=typeof g.queryFn=="function"?g.queryFn:null,V=typeof g.orderByFn=="function"?g.orderByFn:null,Z=typeof g.limitFn=="function"?g.limitFn:null,de=typeof g.getDocsFn=="function"?g.getDocsFn:null,et=typeof A.isForceHiddenUidFn=="function"?A.isForceHiddenUidFn:(()=>!1),tt=typeof A.isForceHiddenHandleFn=="function"?A.isForceHiddenHandleFn:(()=>!1),Bt=typeof A.isForceHiddenBusinessEntityFn=="function"?A.isForceHiddenBusinessEntityFn:(()=>!1),rt=typeof A.isPublicBusinessRecordFn=="function"?A.isPublicBusinessRecordFn:(()=>!0),ot=typeof N.formatRelativeFn=="function"?N.formatRelativeFn:(h=>String(h||"")),ze=typeof N.toDateSafeFn=="function"?N.toDateSafeFn:(h=>h);function F(h){const _=String(h||"").trim();if(!_)return!0;const E=String(s?.userProfile?.restaurantId||"").trim();if(E&&_===E)return!0;if(et(_)||tt(_))return!1;const j=(s?.restaurants||[]).find(U=>String(U?.id||"")===_)||null;return j?rt(j):!0}function m(h){if(!h)return 0;try{return typeof h?.toDate=="function"?h.toDate()?.getTime?.()||0:typeof h=="number"?Number.isFinite(h)?h:0:h instanceof Date?h.getTime()||0:ze(h)?.getTime?.()||0}catch{return 0}}function ee(h="",_=""){const E=String(h||"").trim();if(!E||!(s?.postEntityMap instanceof Map)||!s.postEntityMap.size)return null;const j=String(_||"").trim();let U=null,W=-1;return s.postEntityMap.forEach(k=>{if(!k||String(k?.id||"").trim()!==E)return;const te=String(k?.restaurantId||(k?.ownerType==="restaurant"?k?.ownerId:"")||k?.rid||"").trim(),ke=j&&te===j?1e6:0,Ee=[k?.caption,k?.content,k?.url,k?.image,k?.title].reduce((y,K)=>String(K||"").trim()?y+1:y,0),q=Math.max(m(k?.updatedAt),m(k?.updatedAtClient),m(k?.createdAtClient),m(k?.createdAt)),f=ke+q+Ee*10;(!U||f>W)&&(U=k,W=f)}),U}function ye(h={}){const _=String(h?.rid||h?.restaurantId||"").trim();if(Bt({id:_,restaurantId:_,...h||{}})||!F(_))return null;const E=ee(h?.id,_),j=(s?.restaurants||[]).find(Ge=>Ge?.id===_)||{},U=Gt(j)||Gt(h)||Gt(E),W=en(j?.countryCode||j?.country_code||j?.country||h?.countryCode||h?.country_code||h?.country||E?.countryCode||E?.country),k=W?Jo[W]||"":String(j?.country||h?.country||E?.country||"").trim(),te=h?.thumbUrl||h?.mediaUrl||h?.media?.[0]?.thumbUrl||h?.media?.[0]?.url||"",ke=h?.logoUrl||h?.logo||h?.logoURL||"",Ee=String(E?.content||E?.caption||h?.caption||h?.content||h?.captionShort||"").trim(),q=String(E?.image||E?.url||h?.imageUrl||te||"").trim(),f=String(h?.id||E?.id||"").trim(),y=String(E?.mediaType||h?.mediaType||h?.media?.[0]?.type||"").trim().toLowerCase(),K=String(E?.url||h?.mediaUrl||h?.media?.[0]?.url||"").trim(),Re=y==="video"||h?.isVideo===!0||/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(K),nt=Re?K:"",it=String(h?.thumbUrl||h?.media?.[0]?.thumbUrl||E?.thumbUrl||"").trim();return{id:f,restaurantId:_,isVideo:Re,videoUrl:nt,poster:it,business:h?.businessName||h?.restaurantName||j?.name||j?.restaurantName||"Business",logo:j?.logoUrl||j?.logo||ke||"",location:h?.city||j?.city||"",country:k,countryCode:W,lat:U?.lat??null,lng:U?.lng??null,content:Ee,image:q,likes:Number(h?.likesCount??h?.likes??E?.likes??0)||0,comments:Number(h?.commentsCount??h?.comments??E?.comments??0)||0,time:ot(ze(E?.createdAt||h?.createdAt)),createdAt:E?.createdAt||h?.createdAt,updatedAt:h?.updatedAt||E?.updatedAt||E?.updatedAtClient||h?.createdAt,category:h?.postType||"food",isLive:h?.isLive||!1,ownerType:"restaurant",ownerId:_,truthSource:"feed-projection",canonicalPath:String(h?.canonicalPath||(_&&f?`restaurants/${_}/socialPosts/${f}`:"")).trim()}}function ue(h=[]){return _r(h||[])}async function Pe(h){const _=String(h||"").trim();if(!_||!g.db||!z||!de)return[];try{const E=z(g.db,"users",_,"posts");let j=null;try{const k=[V("createdAt","desc")];Z&&C.fastLimits?.userPosts&&k.push(Z(C.fastLimits.userPosts));const te=B?B(E,...k):E;j=await de(te)}catch{const te=Number(C.fastLimits?.userPosts)||24;j=B&&Z?await de(B(E,Z(te))):await de(E)}const U=[];j?.forEach?.(k=>U.push({id:k.id,...k.data()}));const W=U.map(k=>Qo(k.id,{...k,url:k.url||k.mediaUrl||k.media?.[0]?.url||"",isVideo:k.isVideo??k.media?.[0]?.type==="video"},_)).filter(k=>k.url);return Wo(s,W)}catch{return[]}}return{canShowFeedRestaurantId:F,normalizeFeedPost:ye,buildStoriesRowSignature:ue,loadUserPostsForUser:Pe}}function tn({posts:s=[],toDateSafe:g}={}){if(!Array.isArray(s)||typeof g!="function")return 0;let C=0;return s.forEach(A=>{const N=g(A?.createdAt)?.getTime?.()||0;N>C&&(C=N)}),C}function ln({posts:s=[],extraMeta:g={},toDateSafe:C,writeCache:A,feedCacheKey:N,feedFallbackLimit:z=0}={}){if(!Array.isArray(s)||typeof A!="function"||!N)return;const B=tn({posts:s,toDateSafe:C}),V=Math.max(0,Number(z)||0),Z=V>0?s.slice(0,V):s.slice();A(N,Z,{latestTs:B,...g})}export{Qo as a,_r as b,nn as c,on as d,cn as e,an as n,Wo as p,sn as r,ln as s};
