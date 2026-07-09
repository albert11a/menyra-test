function Jo(s={}){const m=String(s?.id||"").trim();if(!m)return"";const C=String(s?.ownerType||(s?.restaurantId||s?.rid?"restaurant":"")||(s?.uid||s?.userId?"user":"")||"").trim(),A=String(s?.ownerId||s?.restaurantId||s?.rid||s?.uid||s?.userId||"").trim();return C&&A?`${C}:${A}:${m}`:`post:${m}`}function Tr(s=null){return s?(s.postEntityMap instanceof Map||(s.postEntityMap=new Map),s.postEntityMap):new Map}function cn(s=null){const m=Tr(s);return m.clear(),m}function Zo(s=null,m=[]){const C=Tr(s),A=new Set;return(Array.isArray(m)?m:[]).map(z=>{const P=Jo(z);if(!P||A.has(P))return null;A.add(P);const B=C.get(P);if(!B){const D={...z||{}};return C.set(P,D),D}return Object.assign(B,z||{}),B}).filter(Boolean)}function ln({state:s=null,toDateSafeFn:m=f=>f,getStoriesRowSignatureFn:C=()=>"",setStoriesRowSignatureFn:A=()=>{},FAST_MODE:z=!1,buildStoriesFromFeedFn:P=()=>[],updateStoryLogoNodesFn:B=()=>{},updateStoryMetaNodesFn:D=()=>{},updateFeedLogoNodesFn:ee=()=>{},updatePostCountNodesFn:le=()=>{},ensureFeedRestaurantMetaListenersFn:tt=()=>{},preloadFeedHeroImagesFn:rt=()=>{},buildStoriesRowSignatureFn:Bt=()=>"",documentObj:ot=null,windowObj:nt=null,isLocalBusinessProfileFn:Re=()=>!1,iconFn:F=()=>"",escapeHtmlFn:p=f=>String(f||""),buildUrlFn:te=()=>"",buildStoryViewerUrlFn:ve=(f="",b={})=>te("apps/menyra-social/index.html",{r:f,tab:"profile"}),resolveRestaurantLogoFn:de=()=>"",resolveStoryRenderIdentityFn:Ge=null,getOptimizedImageUrlFn:h=()=>"",getVerifiedMapLocationFn:_=()=>null,setVerifiedMapLocationFn:E=null,buildUploadStateForIntentFn:O=(f="",b={})=>b,setStateFn:U=()=>{},openGuestAuthPromptFn:Q=()=>!1,openOwnBusinessProfileFn:k=null,openProfileViewFromBusinessFn:re=()=>{},openPostModalFn:Ee=async()=>{},togglePostLikeFn:Ce=async()=>{},setTimeoutFn:V=(f,b)=>setTimeout(f,b)}={}){if(!s)return{renderHomeView:()=>"",renderFeedView:()=>"",renderStoryItem:()=>"",renderStoriesRow:()=>"",renderFeedItem:()=>"",renderFeedList:()=>"",patchFeedList:()=>!1,patchStoriesRow:()=>!1,updateFeedDom:()=>!1,bindFeedDelegation:()=>{}};const f=ot||(typeof document<"u"?document:null),b=nt||(typeof window<"u"?window:null),q=typeof HTMLVideoElement=="function"?HTMLVideoElement:null,Be="mnyra_story_viewer_hint_v1:",it=()=>!!String(s.userProfile?.uid||"").trim(),at=()=>!!String(s.userProfile?.restaurantId||"").trim(),Fe=()=>!!Re(s.userProfile)||at()&&(!!s.user||it()),st=(e="")=>{const t=String(e||"").trim();return t?t.toLowerCase()==="business"?"":t:""},Ft=(e={})=>String(e?.truthSource||e?.storyTruthSource||e?.storyTruth||"").trim().toLowerCase()==="feed-fallback"?"feed-fallback":"canonical",Ut=15,jr=6,Or=15,Nr=35,zr=Object.freeze(["city","locationCity","primaryCity","place","locationPlace","primaryPlace","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","neighbourhood","area","district","county","region","state","province"]),Pr=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","geo","coords","coordinates","geoPoint"]),Rr="flex:0 0 29%;width:29%;max-width:120px;",Gr="height:13rem;",Br="border-radius:1rem;",X=new WeakMap;let Ue=null,Dt=!1,Vt=!1;const De=({withMarginLeft:e=!1}={})=>`${Rr}${e?"margin-left:1.25rem;":""}`,Fr=()=>"margin-left:calc(var(--app-content-inline,1.5rem) * -1);margin-right:calc(var(--app-content-inline,1.5rem) * -1);scroll-padding-left:1.25rem;overscroll-behavior-x:contain;touch-action:pan-x;-webkit-overflow-scrolling:touch;",ct=(e="")=>`${Gr}${Br}position:relative;overflow:hidden;${e}`,w=(e=0)=>{const t=Number(e);return Number.isFinite(t)?t:0},Ur=(e={})=>Ae(e?.createdAt||e?.updatedAt||e?.timestamp||e?.ts||e?.publishedAt||null),Dr=(e="")=>{const t=String(e||"").trim();if(!t)return"";const r=Array.isArray(s?.feedPosts)?s.feedPosts:[];let o="",n=-1;return r.forEach(i=>{if(String(i?.restaurantId||i?.ownerId||"").trim()!==t)return;const l=String(i?.image||i?.url||i?.poster||"").trim();if(!l)return;const d=Ae(i?.createdAt||i?.updatedAt);d>=n&&(n=d,o=l)}),o},Vr=(e="")=>{const t=String(e||"").trim().toLowerCase();return t?!!(/\.m3u8($|\?)/.test(t)||/\.mpd($|\?)/.test(t)||/\.mp4($|\?)/.test(t)||/\.webm($|\?)/.test(t)||/\.mov($|\?)/.test(t)||/\.m4v($|\?)/.test(t)||/\.ogv($|\?)/.test(t)):!1},lt=(e={})=>{const t=String(e?.mediaType||e?.type||"").trim().toLowerCase(),r=String(e?.imageUrl||e?.thumbUrl||"").trim(),o=String(e?.videoUrl||e?.playbackUrl||"").trim(),n=String(e?.mediaUrl||e?.url||"").trim(),i=String(e?.embedUrl||"").trim(),a=String(e?.image||e?.thumbnail||e?.thumbnailUrl||e?.previewImage||e?.previewUrl||e?.coverImage||e?.poster||e?.posterUrl||e?.feedPreviewImage||"").trim(),l=Vr(n),d=o||(t==="video"||l?n:""),u=r||(t==="image"?n:"");return d?{kind:"video",src:d,poster:u||a,signature:`video:${d}|${u||a||""}`}:u?{kind:"image",src:u,poster:u,signature:`image:${u}`}:a?{kind:"image",src:a,poster:a,signature:`fallback:${a}`}:i?{kind:"embed",src:i,poster:"",signature:`embed:${i}`}:{kind:"none",src:"",poster:"",signature:"none"}},qt=(e={})=>{const t=Ft(e),r=lt(e);return[String(e?.restaurantId||e?.id||"").trim(),t,e?.isLive?"1":"0",r.signature].join("|")},Kt=(e={})=>[String(e?.id||"").trim(),String(e?.business||"").trim(),String(e?.location||"").trim(),String(e?.content||e?.caption||"").trim(),String(e?.image||e?.url||"").trim(),e?.isLive?"1":"0"].join("|"),qr=(e=[])=>(Array.isArray(e)?e:[]).slice(0,10).map(t=>[String(t?.id||"").trim(),String(t?.image||t?.url||"").trim()].join("|")).join(","),Ve=typeof Ge=="function"?(e={})=>Ge(e):(e={})=>{const t=String(e?.restaurantId||"").trim(),r=Ft(e),o=r==="feed-fallback";if(!t)return{storyRestaurantId:"",hasCanonicalRestaurant:!1,storyLabel:"",logoSource:"",borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r};const n=s.restaurants.find(x=>String(x?.id||"").trim()===t)||null,i=String(s.userProfile?.restaurantId||"").trim(),a=i&&i===t,l=!!n?.id,d=String(n?.logoUrl||n?.logo||n?.logoURL||"").trim(),u=st(n?.name||n?.restaurantName||n?.displayName||n?.businessName||""),g=st(e?.name||e?.businessName||e?.restaurantName||""),y=a?st(s.userProfile?.name||""):"",v=a?String(s.userProfile?.avatar||"").trim():"",L=l?u||g||y||"":y||g||u||"",S=l?d||String(e?.img||e?.logo||e?.logoUrl||"").trim():v||String(e?.img||e?.logo||e?.logoUrl||"").trim();return{storyRestaurantId:t,hasCanonicalRestaurant:l,storyLabel:L,logoSource:S,borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r}},Yt=(e={})=>!!Ve(e).storyRestaurantId,Ht=(e="")=>{const t=String(e||"").trim();return t&&(Array.isArray(s?.feedPosts)?s.feedPosts:[]).find(o=>String(o?.id||"").trim()===t)||null},Ae=(e=null)=>{const t=m(e),r=Number(t?.getTime?.()||0);return Number.isFinite(r)?r:0},dt=()=>{const e=new Map;return(Array.isArray(s?.restaurants)?s.restaurants:[]).forEach(r=>{const o=String(r?.id||r?.restaurantId||"").trim();!o||e.has(o)||e.set(o,r)}),e},Wt=(e={})=>String(e?.restaurantId||(String(e?.ownerType||"").trim().toLowerCase()==="restaurant"?e?.ownerId:"")||e?.rid||"").trim(),ut=(e=[],t="")=>{if(typeof t=="string"||typeof t=="number"){const r=String(t||"").trim();r&&e.push(r)}},ft=(e=[],t={})=>{!t||typeof t!="object"||(zr.forEach(r=>ut(e,t[r])),(typeof t.location=="string"||typeof t.location=="number")&&ut(e,t.location))},qe=(e="")=>R(e).replace(/-/g," ").replace(/\s+/g," ").trim(),Qt=()=>ht.map(e=>[e?.id,e?.label,e?.city,...Array.isArray(e?.aliases)?e.aliases:[]].map(qe).filter(Boolean)).filter(e=>e.length),Kr=(e="")=>{const t=qe(e);if(!t)return[];const r=new Set([t]);return Qt().forEach(o=>{o.includes(t)&&o.forEach(n=>r.add(n))}),Array.from(r)},Xt=(e=[],t=[])=>{const r=(Array.isArray(e)?e:[]).map(qe).filter(Boolean);if(!r.length||!t.length)return!1;const o=r.join(" ");return t.some(n=>{const i=n.split(" ").filter(Boolean);return r.some(a=>a===n||a.includes(n))||i.length>0&&i.every(a=>o.includes(a))})},Yr=(e=[])=>{const t=(Array.isArray(e)?e:[]).map(qe).filter(Boolean);if(!t.length)return!1;const r=t.join(" ");return Qt().some(o=>o.some(n=>{const i=n.split(" ").filter(Boolean);return t.some(a=>a===n||a.includes(n))||i.length>0&&i.every(a=>r.includes(a))}))},Hr=(e={})=>{const t=se(e);if(!t)return"";const r=ht.map(o=>{const n=G(o);return{label:String(o?.label||"").trim(),distanceKm:n?je(t,n):Number.POSITIVE_INFINITY}}).filter(o=>o.label&&Number.isFinite(o.distanceKm)).sort((o,n)=>o.distanceKm-n.distanceKm)[0];return r&&r.distanceKm<=Nr?r.label:""},Wr=(...e)=>{const t=[];return e.forEach(r=>{!r||typeof r!="object"||(ft(t,r),Pr.forEach(o=>ft(t,r[o])),Array.isArray(r.locations)&&r.locations.forEach(o=>ft(t,o)))}),t},Qr=(...e)=>{const t=[];return e.forEach(r=>ut(t,Hr(r))),t},Ke=({entry:e={},restaurant:t=null,viewerCity:r=""}={})=>{const o=Kr(r);if(!o.length)return!0;const n=Wr(t,e);return Xt(n,o)?!0:Yr(n)?!1:Xt(Qr(t,e),o)},Jt=({feedPosts:e=[],stories:t=[]}={})=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=J(Ie()),i=wt(n),a=xe(n),l=G(n),d=dt(),u=!!a,g=!!i,y=(S={},{type:x="post",fallbackIndex:I=0}={})=>{const T=Wt(S),N=T&&d.get(T)||null,H=xe({...N&&typeof N=="object"?N:{},...S&&typeof S=="object"?S:{}}),ne=x==="story"&&!!S?.isLive;if(u&&!ne&&(!H||H!==a)||g&&!ne&&!Ke({entry:S,restaurant:N,viewerCity:i}))return null;const W=se(N)||se(S),c=l&&W?je(l,W):Number.POSITIVE_INFINITY;return{entry:S,fallbackIndex:I,distanceKm:c,createdAtMs:x==="post"?Ae(S?.createdAt||S?.updatedAt):0}},v=r.map((S,x)=>y(S,{type:"post",fallbackIndex:x})).filter(Boolean).sort((S,x)=>{const I=Number.isFinite(S.distanceKm),T=Number.isFinite(x.distanceKm);return I&&T&&Math.abs(S.distanceKm-x.distanceKm)>.001?S.distanceKm-x.distanceKm:I!==T?I?-1:1:S.createdAtMs!==x.createdAtMs?x.createdAtMs-S.createdAtMs:S.fallbackIndex-x.fallbackIndex}).map(S=>S.entry),L=o.map((S,x)=>y(S,{type:"story",fallbackIndex:x})).filter(Boolean).sort((S,x)=>{const I=Number.isFinite(S.distanceKm),T=Number.isFinite(x.distanceKm);return I&&T&&Math.abs(S.distanceKm-x.distanceKm)>.001?S.distanceKm-x.distanceKm:I!==T?I?-1:1:S.fallbackIndex-x.fallbackIndex}).map(S=>S.entry);return{feedPosts:v,stories:L}},gt=(e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY)=>{const r=Number.isFinite(e),o=Number.isFinite(t);return r&&o&&Math.abs(e-t)>.001?e-t:r!==o?r?-1:1:0},mt=(e={},t={})=>{if(e.likes!==t.likes)return t.likes-e.likes;if(e.visitors!==t.visitors)return t.visitors-e.visitors;if(e.comments!==t.comments)return t.comments-e.comments;if(e.createdAtMs!==t.createdAtMs)return t.createdAtMs-e.createdAtMs;const r=gt(e.distanceKm,t.distanceKm);return r!==0?r:e.fallbackIndex-t.fallbackIndex},Xr=(e=null)=>{const t=new Set;return(e instanceof Set?Array.from(e):Array.isArray(e)?e:[]).forEach(o=>{const n=String(o||"").trim();n&&t.add(n)}),t},Zt=(...e)=>{const t=new Set;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{const n=Ve(o),i=String(o?.restaurantId||o?.storyId||n.storyRestaurantId||"").trim();i&&t.add(i)})}),t},er=(e=[],t=[],r=null)=>{const o=Array.isArray(e)?e:[],n=Array.isArray(t)?t:[],i=o.length?o:n,a=J(Ie()),l=wt(a),d=G(a),u=xe(a),g=dt(),y=Xr(r),v=new Map,L=(c=null)=>{if(!c||!c.spotId)return;const $=v.get(c.spotId);if(!$){v.set(c.spotId,c);return}mt(c,$)<0&&v.set(c.spotId,c)},S=(c={},$=0)=>{const M=Wt(c),K=String(c?.id||"").trim(),ye=M||(K?`post:${K}`:`idx:${$}`),j=M&&g.get(M)||null,be=xe({...j&&typeof j=="object"?j:{},...c&&typeof c=="object"?c:{}});if(u&&(!be||be!==u)||l&&!Ke({entry:c,restaurant:j,viewerCity:l}))return null;const Ze=se(j)||se(c),$t=d&&Ze?je(d,Ze):Number.POSITIVE_INFINITY,jt=Math.max(0,w(c?.likes),w(c?.likesCount)),Ot=Math.max(0,w(c?.comments),w(c?.commentsCount)),Nt=Math.max(0,w(c?.visitors),w(c?.visitorCount),w(c?.visitorsCount),w(c?.views),w(c?.viewCount),w(c?.viewsCount),w(c?.reach),w(c?.reachCount),w(c?.impressions),w(c?.impressionsCount)),zt=Math.max(0,w(c?.rating),w(c?.score),w(c?.stars),w(j?.rating),w(j?.score),w(j?.stars)),Pt=Ae(c?.createdAt||c?.updatedAt),Rt=String(c?.business||c?.restaurantName||j?.name||j?.restaurantName||"Best Spot").trim()||"Best Spot",et=String(j?.bestSpotLogoUrl||j?.spotLogoUrl||j?.bestSpotLogo||j?.spotLogo||j?.logoUrl||j?.logo||j?.logoURL||c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.logo||c?.image||c?.url||"").trim(),Qo=M?de(M,et,"avatar",!1):et,Xo=M?te("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"}):te("apps/menyra-social/index.html",{tab:"feed",post:K,source:"best-spot"});return{spotId:ye,postId:K,restaurantId:M,displayName:Rt,avatarUrl:Qo,profileUrl:Xo,likes:jt,comments:Ot,visitors:Nt,rating:zt,distanceKm:$t,createdAtMs:Pt,fallbackIndex:$}},x=(c={},$=0)=>{const M=String(c?.id||c?.restaurantId||"").trim();if(!M)return null;const K=String(c?.status||"").trim().toLowerCase();if(K==="archived"||K==="deleted"||K==="blocked"||K==="disabled")return null;const ye=xe(c);if(u&&(!ye||ye!==u)||l&&!Ke({entry:c,restaurant:c,viewerCity:l}))return null;const j=se(c),be=d&&j?je(d,j):Number.POSITIVE_INFINITY,Ze=Math.max(0,w(c?.likes),w(c?.likesCount),w(c?.likeCount),w(c?.socialLikes),w(c?.socialLikesCount),w(c?.followersCount),w(c?.followers)),$t=Math.max(0,w(c?.comments),w(c?.commentsCount),w(c?.reviewCount),w(c?.reviews),w(c?.reviewsCount),w(c?.ratingsCount)),jt=Math.max(0,w(c?.visitors),w(c?.visitorCount),w(c?.visitorsCount),w(c?.views),w(c?.viewCount),w(c?.viewsCount),w(c?.reach),w(c?.reachCount),w(c?.impressions),w(c?.impressionsCount),w(c?.ordersCount),w(c?.orders)),Ot=Math.max(0,w(c?.rating),w(c?.score),w(c?.stars)),Nt=Ae(c?.createdAt||c?.updatedAt||c?.truthUpdatedAt),zt=String(c?.name||c?.restaurantName||c?.displayName||c?.businessName||"Best Spot").trim()||"Best Spot",Pt=String(c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.bestSpotLogo||c?.spotLogo||c?.logoUrl||c?.logo||c?.logoURL||c?.image||c?.coverImage||"").trim(),Rt=de(M,Pt,"avatar",!1),et=te("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"});return{spotId:M,postId:"",restaurantId:M,displayName:zt,avatarUrl:Rt,profileUrl:et,likes:Ze,comments:$t,visitors:jt,rating:Ot,distanceKm:be,createdAtMs:Nt,fallbackIndex:$}};if(i.forEach((c,$)=>{L(S(c,$))}),!i.length||v.size<Ut){let c=i.length+1e3;Array.from(g.values()).forEach($=>{const M=x($,c);c+=1,M&&(v.has(M.spotId)||L(M))})}const I=Array.from(v.values()).filter(c=>{if(!y.size)return!0;const $=String(c?.restaurantId||"").trim();return!$||!y.has($)});if(!I.length)return[];const N=I.some(c=>Number.isFinite(c?.distanceKm))?I.filter(c=>Number.isFinite(c?.distanceKm)):I;if(!N.length)return[];const H=[...N].sort(mt).slice(0,jr),ne=new Set(H.map(c=>c.spotId)),W=N.filter(c=>!ne.has(c.spotId)).sort((c,$)=>{const M=gt(c.distanceKm,$.distanceKm);return M!==0?M:mt(c,$)});return[...H,...W].slice(0,Ut).map((c,$)=>({ratingDisplay:(()=>{const M=w(c?.rating);if(M>0)return Math.max(1,Math.min(5,M)).toFixed(1);const K=Math.max(1,w(c?.likes)*1.2+w(c?.visitors)*.05+w(c?.comments)*.6);return(4.2+Math.min(.75,Math.log10(1+K)/4.5)).toFixed(1)})(),...c,rank:$+1,renderSignature:[c.spotId,c.postId,c.displayName,c.avatarUrl,String($+1),String(c.rating||0),String(c.likes||0),String(c.visitors||0),Number(c.distanceKm).toFixed(3),String(c.createdAtMs||0)].join("|")}))},tr=(e={},t={})=>{const r=gt(e.distanceKm,t.distanceKm);if(r!==0)return r;const o=!!e.isLive,n=!!t.isLive;return o!==n?o?-1:1:e.createdAtMs!==t.createdAtMs?t.createdAtMs-e.createdAtMs:e.fallbackIndex-t.fallbackIndex},Jr=(e={},t={})=>{const r=!!e.isLive,o=!!t.isLive;return r!==o?r?-1:1:r&&o?e.createdAtMs!==t.createdAtMs?t.createdAtMs-e.createdAtMs:e.fallbackIndex-t.fallbackIndex:tr(e,t)},rr=(e=[],t=[])=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=r.length?r:o;if(!n.length)return[];const i=J(Ie()),a=wt(i),l=G(i),d=dt(),u=new Map;n.forEach((L,S)=>{const x=Ve(L),I=x.storyRestaurantId;if(!I)return;const T=d.get(I)||null;if(a&&!L?.isLive&&!Ke({entry:L,restaurant:T,viewerCity:a}))return;const N=se(T)||se(L),H=l&&N?je(l,N):Number.POSITIVE_INFINITY,ne=Ur(L),W=Dr(I),c=W?{...L,feedPreviewImage:W}:L,$=lt(c),M=String(x.storyLabel||"").trim()||"Story",K=ve(I),ye=de(I,String(x.logoSource||"").trim(),"thumb",!1),j={...L,storyId:I,restaurantId:I,storyLabel:M,storyUrl:K,profileImageUrl:ye,feedPreviewImage:W,preview:$,distanceKm:H,createdAtMs:ne,isLive:!!L?.isLive,fallbackIndex:S},be=u.get(I);if(!be){u.set(I,j);return}tr(j,be)<0&&u.set(I,j)});const g=Array.from(u.values());return(g.some(L=>Number.isFinite(L?.distanceKm)&&!L?.isLive)?g.filter(L=>!!L?.isLive||Number.isFinite(L?.distanceKm)):g).sort(Jr).slice(0,Or)},or=({spots:e=[],stories:t=[]}={})=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[];if(!r.length&&!o.length)return[];const n=o.filter(g=>!!g?.isLive),i=o.filter(g=>!g?.isLive),a=n.map(g=>({type:"story",story:g}));if(!r.length&&!i.length)return a;if(!i.length)return[...a,...r.map(g=>({type:"spot",spot:g}))];if(!r.length)return[...a,...i.map(g=>({type:"story",story:g}))];const l=[];let d=0,u=0;for(;d<r.length||u<i.length;)d<r.length&&(l.push({type:"spot",spot:r[d]}),d+=1),u<i.length&&(l.push({type:"story",story:i[u]}),u+=1);return[...a,...l]},Zr=({spots:e=[],stories:t=[]}={})=>or({spots:e,stories:t}).map(r=>{if(r.type==="spot"){const o=r?.spot||{};return["spot",String(o?.spotId||"").trim(),String(o?.postId||"").trim(),String(o?.displayName||"").trim(),String(o?.avatarUrl||"").trim(),String(o?.rank||"").trim()].join(":")}return`story:${qt(r?.story||{})}`}).join(","),nr=async(e="")=>{const t=String(e||"");if(!t)return!1;try{if(b?.navigator?.clipboard?.writeText)return await b.navigator.clipboard.writeText(t),!0}catch{}if(!f?.body)return!1;const r=f.createElement("textarea");r.value=t,r.setAttribute("readonly","readonly"),r.style.position="fixed",r.style.opacity="0",r.style.pointerEvents="none",f.body.appendChild(r),r.select();let o=!1;try{o=!!f.execCommand?.("copy")}catch{}return r.remove(),o},pt=(e,t="Link kopiert")=>{if(!(e instanceof HTMLElement))return;const r=e.querySelector("[data-feed-share-label]");if(!r)return;const o=e.dataset.shareDefaultLabel||r.textContent||"Share";e.dataset.shareDefaultLabel=o,r.textContent=t,e.classList.add("text-white"),e.classList.remove("text-white/70"),e._shareFeedbackTimer&&clearTimeout(e._shareFeedbackTimer),e._shareFeedbackTimer=V(()=>{r.textContent=o,e.classList.add("text-white/70"),e.classList.remove("text-white"),e._shareFeedbackTimer=null},1800)},eo=(e={})=>{const t={post:e?.id||""},r=String(e?.restaurantId||(String(e?.ownerType||"").trim()==="restaurant"?e?.ownerId:"")||"").trim();return r?(t.r=r,t.tab="profile"):t.tab="feed",te("apps/menyra-social/index.html",t)},to=(e="")=>{const t=String(e||"").trim();if(!t)return null;const r=s.restaurants.find(l=>String(l?.id||"").trim()===t)||null,o=String(s.userProfile?.restaurantId||"").trim(),n=o&&o===t,i=String(r?.name||r?.restaurantName||r?.displayName||r?.businessName||(n?s.userProfile?.name:"")||"").trim(),a=String(r?.logoUrl||r?.logo||r?.logoURL||(n?s.userProfile?.avatar:"")||"").trim();return{id:t,restaurantName:i,name:i,logoUrl:a,logo:a}},ro=(e="",t="")=>{const r=String(e||"").trim();if(!r||!b||!f)return;const o=to(r);if(o&&b.sessionStorage)try{b.sessionStorage.setItem(`${Be}${r}`,JSON.stringify({restaurantId:r,meta:o,savedAt:Date.now()}))}catch{}const n=String(t||ve(r)||"").trim();if(!n||!f.head||Array.from(f.head.querySelectorAll("link[data-story-prefetch]")).find(l=>String(l?.getAttribute?.("href")||"").trim()===n))return;const a=f.createElement("link");a.rel="prefetch",a.href=n,a.as="document",a.crossOrigin="anonymous",a.dataset.storyPrefetch="1",f.head.appendChild(a)},oo=()=>{V(()=>{const e=f?.getElementById("postCommentInput");if(e instanceof HTMLElement){try{e.focus({preventScroll:!1})}catch{try{e.focus()}catch{}}try{e.scrollIntoView({block:"nearest",behavior:"smooth"})}catch{}if(typeof e.setSelectionRange=="function"){const t=String(e.value||"").length;try{e.setSelectionRange(t,t)}catch{}}}},90)},Se="mnyra_social_feed_viewer_location_v1",no=14,ir=3,io=72,ao=620,so=4200,co=12e4,lo=new Set(["xk","al","rs"]),uo=new Set(["city","town","village","hamlet","municipality"]),fo=new Map([["xk","Kosove"],["kosove","Kosove"],["kosova","Kosove"],["kosovo","Kosove"],["al","Shqiperi"],["shqiperi","Shqiperi"],["shqiperia","Shqiperi"],["albania","Shqiperi"],["rs","Serbi"],["serbi","Serbi"],["serbia","Serbi"],["srbija","Serbi"]]),go=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),mo=["rruga","street","bulevard","boulevard","lagj","district","neighborhood","quarter","park","mall","plaza"],ht=Object.freeze([{id:"prishtina",label:"Prishtina",lat:42.6629,lng:21.1655,aliases:["prishtine","prishtin","pristina"]},{id:"prizren",label:"Prizren",lat:42.2139,lng:20.7397,aliases:["prizr","prizreni"]},{id:"peja",label:"Peja",lat:42.6591,lng:20.2883,aliases:["peje","pec"]},{id:"gjakova",label:"Gjakova",lat:42.3803,lng:20.4308,aliases:["gjakove","djakova"]},{id:"ferizaj",label:"Ferizaj",lat:42.3706,lng:21.1553,aliases:["feri","ferizaji","uroshevac"]},{id:"gjilan",label:"Gjilan",lat:42.4635,lng:21.4699,aliases:["gjilani"]},{id:"mitrovica",label:"Mitrovica",lat:42.8914,lng:20.866,aliases:["mitrovice","mitro"]},{id:"vushtrria",label:"Vushtrria",lat:42.8231,lng:20.9675,aliases:["vushtrri"]},{id:"podujeva",label:"Podujeva",lat:42.9106,lng:21.193,aliases:["podujeve","podu"]},{id:"tirana",label:"Tirana",lat:41.3275,lng:19.8187,aliases:["tirane"],country:"Shqiperi"},{id:"kukes",label:"Kukes",lat:42.0769,lng:20.4219,aliases:["kukes albania"],country:"Shqiperi"},{id:"smederevo",label:"Smederevo",lat:44.6644,lng:20.9276,aliases:["smederevo serbia"],country:"Serbi"}]),yt=Object.freeze({xk:Object.freeze({minLat:41.85,maxLat:43.35,minLng:20,maxLng:21.85}),al:Object.freeze({minLat:39.55,maxLat:42.75,minLng:19,maxLng:21.1}),rs:Object.freeze({minLat:42.2,maxLat:46.3,minLng:18.7,maxLng:23.1})}),po=Object.freeze({xk:Object.freeze(["prishtina","prishtine","prizren","peja","peje","gjakova","gjakove","ferizaj","gjilan","mitrovica","mitrovice","vushtrria","vushtrri","podujeva","podujeve"]),al:Object.freeze(["tirana","tirane","kukes","durres","vlore","shkoder","elbasan","fier","korce","sarande"]),rs:Object.freeze(["smederevo","beograd","belgrade","novi sad","nis","kragujevac","subotica","pancevo"])});let Te=null,Y=!1,ue="idle",Ye="",Me=null,ie=null,fe="",_e=null,bt=0,ge=!1,$e=null,He=!1,ar="",Le=!1,oe=null,vt=null,sr=!1,St=null;const ae=new Map,We=new Map,R=(e="")=>String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim(),Lt=(e="")=>{const t=R(e);return t==="current location"||t==="vendndodhja aktuale"||t==="trenutna lokacija"||t==="standort"||t==="aktueller standort"},wt=(e=null)=>{const t=String(e?.city||"").trim();if(t&&!Lt(t))return t;const r=String(e?.label||"").trim();return r&&!Lt(r)?r:""},we=(e="")=>{const t=R(e);return t&&go.get(t)||""},me=(e="")=>{const t=R(e);return t&&fo.get(t)||""},cr=(e=null)=>{const t=G(e);if(!t)return"";const r=Number(t.lat),o=Number(t.lng),n=(i=null)=>!!i&&r>=Number(i.minLat)&&r<=Number(i.maxLat)&&o>=Number(i.minLng)&&o<=Number(i.maxLng);return n(yt.xk)?"xk":n(yt.al)?"al":n(yt.rs)?"rs":""},ho=()=>{if(St instanceof Map)return St;const e=new Map,t=(r="",o="")=>{const n=R(r),i=we(o);!n||!i||e.set(n,i)};return Object.entries(po).forEach(([r,o])=>{(Array.isArray(o)?o:[]).forEach(n=>t(n,r))}),It().forEach(r=>{const o=we(r?.countryCode||r?.country);o&&(t(r?.label,o),t(r?.city,o),(Array.isArray(r?.searchTerms)?r.searchTerms:[]).forEach(n=>t(n,o)))}),St=e,e},yo=(...e)=>{const t=ho();for(const r of e){const o=we(r);if(o)return o;const n=R(r);if(!n)continue;const i=t.get(n);if(i)return i;const a=n.split(" ").filter(Boolean);for(const l of a){const d=t.get(l);if(d)return d}}return""},xe=(e=null)=>!e||typeof e!="object"?"":we(e?.countryCode||e?.country_code||e?.country||e?.geo?.countryCode||e?.geo?.country_code||e?.geo?.country||e?.coords?.countryCode||e?.coords?.country||e?.location?.countryCode||e?.location?.country||"")||yo(e?.country,e?.geo?.country,e?.coords?.country,e?.location?.country,e?.city,e?.geo?.city,e?.coords?.city,e?.location?.city,e?.label,e?.address,e?.location)||cr(e),se=(e=null)=>!e||typeof e!="object"?null:G(e)||G({lat:e?.latitude,lng:e?.longitude})||G({lat:e?.gpsLat,lng:e?.gpsLng})||G({lat:e?.geo?.lat,lng:e?.geo?.lng})||G({lat:e?.geo?.latitude,lng:e?.geo?.longitude})||G({lat:e?.coords?.lat,lng:e?.coords?.lng})||G({lat:e?.coords?.latitude,lng:e?.coords?.longitude})||G({lat:e?.location?.lat,lng:e?.location?.lng}),je=(e=null,t=null)=>{const r=G(e),o=G(t);if(!r||!o)return Number.POSITIVE_INFINITY;const n=6371,i=S=>S*Math.PI/180,a=i(Number(o.lat)-Number(r.lat)),l=i(Number(o.lng)-Number(r.lng)),d=i(Number(r.lat)),u=i(Number(o.lat)),g=Math.sin(a/2),y=Math.sin(l/2),v=g*g+Math.cos(d)*Math.cos(u)*y*y,L=2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));return n*L},G=(e=null)=>{const t=Number(e?.lat??e?.latitude??e?.y),r=Number(e?.lng??e?.lon??e?.longitude??e?.x);return!Number.isFinite(t)||!Number.isFinite(r)?null:{lat:t,lng:r}},J=(e=null)=>{const t=G(e);if(!t)return null;const r=String(e?.label||e?.city||"").trim(),n=String(e?.city||"").trim()||(Lt(r)?"":r),i=String(e?.source||"").trim().toLowerCase(),a=xe({...e&&typeof e=="object"?e:{},lat:t.lat,lng:t.lng,label:r,city:n}),l=me(e?.country||e?.countryCode||e?.country_code||a)||me(a)||"";return{lat:t.lat,lng:t.lng,label:r,city:n,country:l,countryCode:a,source:i||"manual",savedAt:Number(e?.savedAt||Date.now())||Date.now()}},bo=()=>{if(!b?.localStorage)return null;try{const e=b.localStorage.getItem(Se);if(!e)return null;const t=J(JSON.parse(e));if(t)return t;try{b.localStorage.removeItem(Se)}catch{}return null}catch{try{b.localStorage.removeItem(Se)}catch{}return null}},vo=()=>{if(!b?.localStorage)return null;try{return b.localStorage.getItem(Se)!==null}catch{return null}},lr=(e=null)=>{if(b?.localStorage){if(!e){try{b.localStorage.removeItem(Se)}catch{}return}try{b.localStorage.setItem(Se,JSON.stringify(e))}catch{}}},Ie=()=>{const e=J(Te),t=bo();if(t){if(Te=t,typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return t}const r=vo();if(e&&r!==!1)return e;if(r===!1&&(Te=null),typeof _!="function")return null;let o=null;try{o=_()}catch{}const n=J({...o&&typeof o=="object"?o:{},source:"gps-map"});return n?(Te=n,lr(n),n):null},So=(e=null)=>{const t=J(e);if(!t)return!1;if(Te=t,lr(t),typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return!0},dr=()=>{if(Me){try{clearTimeout(Me)}catch{}Me=null}},ur=()=>{if(dr(),ie)try{ie.abort()}catch{}_e=null,ie=null,fe=""},fr=(e="",t=[])=>{const r=R(e);if(!r)return;const o=Array.isArray(t)?t:[];for(ae.set(r,o);ae.size>io;){const n=ae.keys().next().value;if(!n)break;ae.delete(n)}We.size>ao&&We.clear(),o.forEach(n=>{We.set(String(n?.id||"").trim().toLowerCase(),n)})},xt=()=>{if($e){try{clearTimeout($e)}catch{}$e=null}},Qe=(e=!1)=>{const t=!!e,r=f?.documentElement||null,o=f?.body||null;r?.classList?.toggle?.("feed-location-gate-resolving",t),o?.classList?.toggle?.("feed-location-gate-resolving",t);try{const n=b?.__MENYRA_SOCIAL_SET_UI_CHROME_MODE__;t&&typeof n=="function"&&n("app");const i=b?.__MENYRA_SOCIAL_FORCE_UI_CHROME__;typeof i=="function"&&i()}catch{}},Oe=()=>{if(oe){if(typeof b?.cancelAnimationFrame=="function")try{b.cancelAnimationFrame(oe)}catch{}else try{clearTimeout(oe)}catch{}oe=null}},Lo=()=>{if(!b||!f)return null;const e=f.querySelector("main.app-main-scroll");if(!(e instanceof HTMLElement))return null;const t=b.getComputedStyle?.(e),r=String(t?.overflowY||t?.overflow||"").trim().toLowerCase(),o=r==="auto"||r==="scroll"||r==="overlay",n=Number(e.scrollHeight||0)-Number(e.clientHeight||0)>1;return!o||!n?null:e},wo=({behavior:e="smooth"}={})=>{if(!b||!f)return!1;const t=f.getElementById("feedLocationGate");if(!(t instanceof HTMLElement))return!1;const r=t.querySelector(".feed-bento-pin-outline");if(!(r instanceof HTMLElement))return!1;const o=Lo(),n=o instanceof HTMLElement,i=Math.max(0,Math.round(parseFloat(b.getComputedStyle?.(r)?.top||"0")||0)),a=n?Math.round(Number(o.getBoundingClientRect().top||0)):0,l=n?Math.max(0,Number(o.scrollTop||0)):Math.max(0,Number(b.scrollY||b.pageYOffset||f?.documentElement?.scrollTop||0)),d=Math.round(Number(r.getBoundingClientRect().top||0)),u=Math.max(0,l+(d-(a+i)));if(Math.abs(u-l)<2)return!0;if(n){try{o.scrollTo({top:u,behavior:e})}catch{o.scrollTop=u}return!0}try{b.scrollTo({top:u,behavior:e})}catch{b.scrollTo(0,u)}return!0},gr=()=>{if(!Le)return;Le=!1,Oe();let e=0;const t=4,r=4,o=()=>{if(e+=1,wo({behavior:e===1?"smooth":"auto"}),e>=t){Oe();return}oe=V(o,e===1?420:130)};if(typeof b?.requestAnimationFrame=="function"){let n=0;const i=()=>{oe=b.requestAnimationFrame(()=>{if(n+=1,n<r){i();return}oe=null,o()})};i();return}oe=V(()=>{oe=null,o()},80)},mr=()=>{if(Oe(),typeof vt=="function")try{vt()}catch{}vt=null},xo=(e=null)=>{mr()},pr=(e={})=>{const t=me(e?.countryCode||e?.country_code||"");if(t)return t;const r=me(e?.country||"");return r||(String(e?.source||"").trim().toLowerCase()==="local"?"Kosove":String(e?.country||"").trim())},hr=({id:e="",label:t="",lat:r=null,lng:o=null,aliases:n=[],source:i="local",country:a="",metaLabel:l="",importance:d=0}={})=>{const u=G({lat:r,lng:o}),g=String(t||"").trim();if(!u||!g)return null;const y=String(i||"local").trim().toLowerCase(),v=we(a),L=me(a)||me(v)||(y==="local"?"Kosove":""),S=Array.from(new Set([g,L,v,...Array.isArray(n)?n:[]].map(x=>R(x)).filter(Boolean)));return Object.freeze({id:String(e||g).trim().toLowerCase(),label:g,city:g,lat:u.lat,lng:u.lng,source:y,country:L,countryCode:v,metaLabel:String(l||"").trim(),importance:Number(d)||0,searchTerms:S})},It=()=>ht.map(e=>hr(e)).filter(Boolean),yr=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return null;const r=It().find(o=>o.id===t)||null;return r||We.get(t)||null},Io=(e="")=>{const t=R(e);if(!t||/[0-9]/.test(t))return!1;const r=t.split(" ").filter(Boolean);return!r.length||r.length>3?!1:!r.some(o=>mo.some(n=>o.startsWith(n)))},ko=(e={},t="")=>{if(!e||!t)return-1;const r=Array.isArray(e.searchTerms)?e.searchTerms:[];let o=-1;return r.forEach(n=>{if(!n)return;if(n===t){o=Math.max(o,420);return}if(n.startsWith(t)){o=Math.max(o,260-Math.max(0,n.length-t.length));return}const i=n.indexOf(t);i>=0&&(o=Math.max(o,170-i))}),o<0?-1:(String(e?.source||"").toLowerCase()==="remote"&&(o+=12+Math.round(Math.max(0,Number(e.importance||0)*10))),o)},Eo=(...e)=>{const t=new Map;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{if(!o||typeof o!="object")return;const n=`${R(o.label)}|${R(pr(o))}`;if(!n.trim())return;if(!t.has(n)){t.set(n,o);return}const i=t.get(n);String(i?.source||"").trim().toLowerCase()!=="local"&&t.set(n,o)})}),Array.from(t.values())},Co=(e=[])=>Array.isArray(e)?e.map((t,r)=>{const o=t?.properties&&typeof t.properties=="object"?t.properties:{},n=G({lat:t?.geometry?.coordinates?.[1],lng:t?.geometry?.coordinates?.[0]}),i=String(o.name||o.city||o.locality||"").trim();if(!n||!i||!Io(i))return null;const a=we(o.countrycode||o.country_code||o.country||"");if(!a||!lo.has(a))return null;const l=R(o.osm_value||o.type||"");if(!uo.has(l))return null;const d=me(a)||"",g=[String(o.state||o.county||"").trim(),d].filter(Boolean).join(" · ");return hr({id:`remote-${String(o.osm_id||`${i}-${a}-${r}`).trim().toLowerCase()}`,label:i,lat:n.lat,lng:n.lng,aliases:[o.city,o.state,o.county,d].filter(Boolean),source:"remote",country:a,metaLabel:g,importance:Number(o.importance||t?.importance||0)})}).filter(Boolean):[],Ao=async(e="")=>{const t=String(e||"").trim(),r=R(t);if(r.length<ir)return[];if(ae.has(r))return ae.get(r)||[];if(_e&&fe===r)return _e;if(Date.now()<bt)return[];const o=typeof b?.fetch=="function"?b.fetch.bind(b):null;if(!o)return[];if(ie&&fe&&fe!==r)try{ie.abort()}catch{}const n=typeof AbortController=="function"?new AbortController:null;let i=null;ie=n,fe=r,n&&(i=V(()=>{try{n.abort()}catch{}},so));const a=new URL("https://photon.komoot.io/api/");a.searchParams.set("limit",String(no)),a.searchParams.set("lang","en"),a.searchParams.set("osm_tag","place"),a.searchParams.set("q",t);const l=(async()=>{try{const d=await o(a.toString(),{method:"GET",signal:n?.signal,headers:{"Accept-Language":"sq,sr,de,en"}});if(!d?.ok)throw new Error(`photon_${Number(d?.status||0)}`);const u=await d.json(),g=Array.isArray(u?.features)?u.features:[],y=Co(g);return fr(r,y),bt=0,y}catch(d){return String(d?.name||"")!=="AbortError"&&(bt=Date.now()+co,fr(r,[])),[]}finally{if(i)try{clearTimeout(i)}catch{}ie===n&&fe===r&&(ie=null,fe="",_e=null)}})();return _e=l,l},kt=(e="",t=6)=>{const r=R(e);if(r.length<2)return[];const o=It(),n=ae.get(r)||[];return Eo(o,n).map(a=>{const l=ko(a,r);return l<0?null:{...a,score:l}}).filter(Boolean).sort((a,l)=>Number(l.score||0)-Number(a.score||0)||String(a.label||"").localeCompare(String(l.label||""),"de")).slice(0,Math.max(1,Number(t)||6))},To=(e=[])=>{const t=Array.isArray(e)?e:[];return t.length?t.map(r=>`
      <button
        type="button"
        role="option"
        aria-selected="false"
        data-feed-city-suggestion="${p(r.id)}"
        class="feed-location-suggestion"
      >
        <span class="feed-location-suggestion__label">${p(r.label)}</span>
        <span class="feed-location-suggestion__meta">${p(pr(r))}</span>
      </button>
    `).join(""):""},Z=({clearContent:e=!0}={})=>{const t=f?.getElementById("feedLocationCitySuggestions"),r=f?.getElementById("feedLocationCityInput");t instanceof HTMLElement&&(t.classList.remove("feed-location-suggestions--open"),t.setAttribute("aria-hidden","true"),e&&(t.innerHTML="")),r instanceof HTMLElement&&r.setAttribute("aria-expanded","false")},br=(e="")=>{if(dr(),Y)return;const t=R(e);t.length<ir||ae.has(t)||(Me=V(async()=>{Me=null;const r=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();if(R(r)!==t)return;await Ao(r);const o=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();R(o)===t&&Et(o,{skipRemoteFetch:!0})},260))},Et=(e="",{skipRemoteFetch:t=!1}={})=>{const r=f?.getElementById("feedLocationCitySuggestions"),o=f?.getElementById("feedLocationCityInput");if(!(r instanceof HTMLElement)||!(o instanceof HTMLElement))return;if(Y){Z();return}if(R(e).length<2){Z();return}const i=kt(e,6);if(!i.length){Z({clearContent:!1}),t||br(e);return}r.innerHTML=To(i),r.classList.add("feed-location-suggestions--open"),r.setAttribute("aria-hidden","false"),o.setAttribute("aria-expanded","true"),!t&&i.length<3&&br(e)},vr=Object.freeze({en:Object.freeze({locale:"en",htmlLang:"en",searchPlaceholder:"Enter your city...",useLocationAriaLabel:"Use location",currentLocationLabel:"Current location",statusRequesting:"Requesting location...",statusDenied:"Location access was denied.",statusTimeout:"Location did not load in time. Please try again.",statusUnsupported:"Location access is not supported on this device.",statusError:"Location could not be determined.",statusUnsupportedHttps:"Location access requires HTTPS.",heroRailAriaLabel:"MNYRA city highlights",topSliderItems:Object.freeze(["DISCOVER SPOTS.","FIND OFFERS.","OPEN MENUS."]),topCityLine:"IN YOUR CITY.",heroTitleLines:Object.freeze([Object.freeze({before:"Your ",accent:"City",after:""}),Object.freeze({before:"in your ",accent:"Pocket",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Discover","your city."])}),Object.freeze({lines:Object.freeze(["Best","restaurants","& cafes."])}),Object.freeze({lines:Object.freeze(["Grocery","stores","& healthy."])}),Object.freeze({lines:Object.freeze(["Best","hotels","& motels."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" now."}),Object.freeze({before:"Your ",accent:"Feed.",after:""})]),description:"Discover daily deals, follow stories from your favorite spots, and stay up to date.",cardTitle:"Stories & Feed",cardDescription:"Never miss exclusive deals. See what's happening in your city through stories and discover fresh offers right away.",cardImageAlt:"Feed and stories",storiesAriaLabel:"Feed stories",postBrand:"MOKI'S",postMeta:"2 hours ago • New offer",offerPill:"-20% off lunch",previewFallback:"Live feed preview is loading."})}),sq:Object.freeze({locale:"sq",htmlLang:"sq",searchPlaceholder:"Shkruaj qytetin...",useLocationAriaLabel:"Perdor vendndodhjen",currentLocationLabel:"Vendndodhja aktuale",statusRequesting:"Po kerkohet vendndodhja...",statusDenied:"Leja e vendndodhjes u refuzua.",statusTimeout:"Vendndodhja nuk u mor me kohe. Provo perseri.",statusUnsupported:"Vendndodhja nuk mbeshtetet ne kete pajisje.",statusError:"Vendndodhja nuk u gjet.",statusUnsupportedHttps:"Vendndodhja kerkon HTTPS.",heroRailAriaLabel:"MNYRA highlights e qytetit",topSliderItems:Object.freeze(["ZBULO SPOTET.","GJEJ OFERTA.","HAP MENYTE."]),topCityLine:"NE QYTETIN TEND.",heroTitleLines:Object.freeze([Object.freeze({before:"",accent:"Qyteti",after:" yt"}),Object.freeze({before:"ne ",accent:"xhepin",after:" tend."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Zbulo","qytetin tend."])}),Object.freeze({lines:Object.freeze(["Me te mirat","restorante","& kafe."])}),Object.freeze({lines:Object.freeze(["Dyqane","ushqimore","& bio."])}),Object.freeze({lines:Object.freeze(["Me te mirat","hotele","& motele."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" tani."}),Object.freeze({before:"",accent:"Feed-i",after:" yt."})]),description:"Zbulo ofertat e dites, ndiq story-t e spot-eve te preferuara dhe qendro gjithmone i perditesuar.",cardTitle:"Story & Feed",cardDescription:"Mos humb me ofertat ekskluzive. Shih menjehere ne story cfare po ndodh ne qytetin tend dhe zbulo ofertat e dites.",cardImageAlt:"Feed dhe story",storiesAriaLabel:"Story-t e feed-it",postBrand:"MOKI'S",postMeta:"Para 2 oresh • Oferte e re",offerPill:"-20% per dreke",previewFallback:"Parashikimi i feed-it po ngarkohet."})}),sr:Object.freeze({locale:"sr",htmlLang:"sr",searchPlaceholder:"Unesi svoj grad...",useLocationAriaLabel:"Koristi lokaciju",currentLocationLabel:"Trenutna lokacija",statusRequesting:"Trazi se lokacija...",statusDenied:"Pristup lokaciji je odbijen.",statusTimeout:"Lokacija nije ucitana na vreme. Pokusaj ponovo.",statusUnsupported:"Lokacija nije podrzana na ovom uredjaju.",statusError:"Lokacija nije mogla da se odredi.",statusUnsupportedHttps:"Pristup lokaciji zahteva HTTPS.",heroRailAriaLabel:"MNYRA gradski highlights",topSliderItems:Object.freeze(["OTKRIJ MESTA.","NADJI PONUDE.","OTVORI MENIJE."]),topCityLine:"U SVOM GRADU.",heroTitleLines:Object.freeze([Object.freeze({before:"Tvoj ",accent:"grad",after:""}),Object.freeze({before:"u tvom ",accent:"dzepu",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Otkrij","svoj grad."])}),Object.freeze({lines:Object.freeze(["Najbolji","restorani","& kafici."])}),Object.freeze({lines:Object.freeze(["Prodavnice","prehrane","& bio hrane."])}),Object.freeze({lines:Object.freeze(["Najbolji","hoteli","& moteli."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Uzivo",after:" sada."}),Object.freeze({before:"Tvoj ",accent:"feed.",after:""})]),description:"Otkrij dnevne ponude, prati storije svojih omiljenih mesta i ostani uvek u toku.",cardTitle:"Storiji & feed",cardDescription:"Ne propusti ekskluzivne ponude. Odmah vidi sta se desava u tvom gradu kroz storije i otkrij nove dnevne ponude.",cardImageAlt:"Feed i storiji",storiesAriaLabel:"Storiji u feed-u",postBrand:"MOKI'S",postMeta:"Pre 2 sata • Nova ponuda",offerPill:"-20% na rucak",previewFallback:"Prikaz feed-a se ucitava."})})}),Ct=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return"";const r=t.split(/[_-]/)[0];return["sq","al","alb"].includes(r)?"sq":["sr","rs","srb"].includes(r)?"sr":["en","gb","uk","us"].includes(r)?"en":""},Mo=()=>{const e=b?.location;if(!e)return"";const t=["lang","locale","hl"],r=(a="")=>{const l=new URLSearchParams(String(a||""));for(const d of t){const u=String(l.get(d)||"").trim();if(u)return u}return""},o=r(String(e.search||"").replace(/^\?/,""));if(o)return o;const n=String(e.hash||"");if(n){const a=n.indexOf("?"),l=a>=0?n.slice(a+1):n.replace(/^#\/?/,""),d=r(l);if(d)return d}const i=String(e.pathname||"").split("/").map(a=>String(a||"").trim().toLowerCase()).filter(Boolean);for(let a=i.length-1;a>=0;a-=1){const l=i[a];if(!(!l||l.includes("."))&&Ct(l))return l}return""},_o=()=>{const e=Ct(Mo());if(e)return e;const t=Array.isArray(b?.navigator?.languages)?b.navigator.languages:[];return Ct(String(t[0]||b?.navigator?.language||"").trim())||"en"},Ne=()=>vr[_o()]||vr.en,$o=()=>{const e=Ne();return Ye||(ue==="requesting"?e.statusRequesting:ue==="denied"?e.statusDenied:ue==="timeout"?e.statusTimeout:ue==="unsupported"?e.statusUnsupported:ue==="error"?e.statusError:"")},Sr=()=>"feed-gate",Lr=()=>!!f?.getElementById("feedLocationCityInput"),jo=()=>{const e=String(f?.getElementById("feedView")?.dataset?.locationScreenMode||"").trim().toLowerCase();return e||String(f?.getElementById("feedLocationGate")?.dataset?.locationScreenMode||"").trim().toLowerCase()||Sr()},Oo=()=>{const e=f?.querySelector?.("[data-feed-gate-hero]"),t=f?.querySelector?.("[data-feed-gate-hero-rail]");if(!(e instanceof HTMLElement)||!(t instanceof HTMLElement))return;const r=Array.from(t.querySelectorAll("[data-feed-gate-hero-card]")).filter(i=>i instanceof HTMLElement);if(!r.length)return;const o=(i=0)=>{const a=Math.max(0,Math.min(r.length-1,Number(i)||0)),l=r[a],d=String(l?.getAttribute("data-feed-gate-hero-header-accent")||"").trim()||"#3f46e5";e.style.setProperty("--feed-gate-hero-accent",d),e.dataset.feedGateHeroIndex=String(a),r.forEach((u,g)=>{u.setAttribute("data-active",g===a?"true":"false")})},n=()=>{const i=r[0],a=Number(i?.clientWidth||0);return!Number.isFinite(a)||a<=0?Number(e.dataset.feedGateHeroIndex||0)||0:Math.round(t.scrollLeft/(a+8))};if(t.dataset.feedGateHeroBound!=="1"){let i=0;const a=()=>{if(i)return;const l=()=>{i=0,o(n())};if(typeof b?.requestAnimationFrame=="function"){i=b.requestAnimationFrame(l);return}i=V(l,16)};t.addEventListener("scroll",a,{passive:!0}),t.dataset.feedGateHeroBound="1"}o(n())},wr=(e="crosshair",t="w-5 h-5 relative z-10")=>{const r=String(e||"").trim().toLowerCase(),o=r==="check"||r==="loader-circle"?r:"crosshair",n=String(t||"").trim()||"w-5 h-5 relative z-10";return F(o,n,{id:"locateIcon","data-feed-location-current-icon":o})||`<i id="locateIcon" data-lucide="${p(o)}" data-feed-location-current-icon="${p(o)}" class="${p(n)}"></i>`},ke=()=>{const e=f?.getElementById("btnLocateMe"),t=f?.getElementById("locateIcon"),r=f?.getElementById("locatePulse"),o=f?.getElementById("feedLocationCityInput"),n=f?.getElementById("feedLocationStatus"),i=Ie(),a=!!J(i),l=Y||ge;if(e instanceof HTMLButtonElement&&(e.disabled=l,e.classList.toggle("opacity-60",e.disabled),e.classList.toggle("cursor-not-allowed",e.disabled),e.classList.toggle("is-success",a&&!l),e.classList.toggle("is-loading",ge)),t instanceof HTMLElement){const d=ge?"loader-circle":a&&!Y?"check":"crosshair",u=String(t.getAttribute("class")||"w-5 h-5 relative z-10").replace(/\banimate-spin\b/g,"").replace(/\s+/g," ").trim()||"w-5 h-5 relative z-10";if(String(t.getAttribute("data-feed-location-current-icon")||"").trim()!==d&&f){const g=f.createElement("template");g.innerHTML=wr(d,u).trim();const y=g.content.firstElementChild;(y instanceof HTMLElement||typeof SVGElement=="function"&&y instanceof SVGElement)&&(y.classList.toggle("animate-spin",l),t.replaceWith(y))}else t.classList.toggle("animate-spin",l)}if(r instanceof HTMLElement&&(r.classList.toggle("opacity-100",Y),r.classList.toggle("opacity-0",!Y)),o instanceof HTMLInputElement){o.disabled=Y;const d=String(i?.label||i?.city||"").trim();d&&!o.value.trim()&&f?.activeElement!==o&&(o.value=d)}if(n instanceof HTMLElement){const d=$o();n.textContent=d,n.classList.toggle("hidden",!d)}Oo(),b?.lucide?.createIcons&&b.lucide.createIcons()},pe=(e="idle",t="")=>{ue=String(e||"idle").trim().toLowerCase(),Ye=String(t||"").trim(),ke()},ze=(e=null)=>{const t=J(e);if(!t)return!1;if(ge)return!0;if(Y=!1,ue="granted",Ye="",ur(),Z(),So(t),s.activeTab==="restaurants")return U({}),!0;const r=f?.getElementById("feedLocationGate"),n=jo()==="location",a=String(f?.getElementById("feedView")?.dataset?.feedViewMode||"").trim().toLowerCase()==="feed",l=!n&&!a;if(!n){const d=f?.activeElement;if(d&&typeof d.blur=="function")try{d.blur()}catch{}}if(n||!l?(He=!1,Le=!1,Oe(),ge=!1,r?.classList?.remove?.("feed-location-gate--resolving"),Qe(!1)):(He=!1,Le=!0,ge=!0,r?.classList?.add?.("feed-location-gate--resolving"),Qe(!0)),ke(),n)return xt(),!0;if(!l){xt(),Qe(!1);const d=String(s?.activeTab||"").trim().toLowerCase();return(!d||d==="feed"||d==="home")&&U({activeTab:"feed"}),!0}return xt(),$e=V(()=>{$e=null,ge=!1,r?.classList?.remove?.("feed-location-gate--resolving"),Qe(!1);const d=String(s?.activeTab||"").trim().toLowerCase();d&&d!=="feed"&&d!=="home"||(U({activeTab:"feed"}),Le=!0,gr())},360),!0},he=({fallbackCity:e=null,forceExact:t=!1}={})=>{const r=Ne(),o=e&&typeof e=="object"?e:yr(e);if(o&&!t){ze({lat:o.lat,lng:o.lng,label:o.label,city:o.city||o.label,country:o.country,countryCode:o.countryCode,source:"city-search"});return}const n=b?.navigator?.geolocation;if(b&&b.isSecureContext===!1){if(o){he({fallbackCity:o,forceExact:!1});return}pe("unsupported",r.statusUnsupportedHttps);return}if(!n||typeof n.getCurrentPosition!="function"){if(o){he({fallbackCity:o,forceExact:!1});return}pe("unsupported");return}if(Y)return;Y=!0,ur(),Z(),pe("requesting");const i=Date.now(),a=d=>{const u=Math.max(0,900-(Date.now()-i));u>0?V(d,u):d()},l=String(f?.getElementById("feedLocationCityInput")?.value||"").trim();n.getCurrentPosition(d=>{a(()=>{const u=G({lat:d?.coords?.latitude,lng:d?.coords?.longitude});if(!u){Y=!1,pe("error");return}ze({lat:u.lat,lng:u.lng,label:l||r.currentLocationLabel,city:l||"",countryCode:cr(u),source:"gps"})})},d=>{a(()=>{if(Y=!1,o){he({fallbackCity:o,forceExact:!1});return}const u=Number(d?.code);if(u===1){pe("denied");return}if(u===3){pe("timeout");return}pe("error")})},{enableHighAccuracy:!0,timeout:1e4,maximumAge:0})},No=({id:e="",background:t="#3f46e5",headerAccent:r="#3f46e5",cardAccent:o="#bfdbfe",variant:n="hero",lines:i=[],accentLineIndex:a=-1}={},l=0)=>`
    <article
      data-feed-gate-hero-card
      data-feed-gate-hero-index="${p(String(l))}"
      data-feed-gate-hero-header-accent="${p(r)}"
      data-active="${l===0?"true":"false"}"
      class="feed-gate-hero-card"
      style="--feed-gate-hero-card-bg:${p(t)};--feed-gate-hero-card-accent:${p(o)};"
      role="listitem"
      aria-label="${p(String(e||`hero-${l}`))}"
    >
      <div class="feed-gate-hero-card__inner">
        <h3 class="feed-gate-hero-card__headline feed-gate-hero-card__headline--${p(n)}">
          ${i.map((d,u)=>{const g=p(String(d||"").trim());return g?`<span class="feed-gate-hero-card__headline-line">${u===a?`<span class="feed-gate-hero-card__headline-accent">${g}</span>`:g}</span>`:""}).join("")}
        </h3>
      </div>
    </article>
  `,zo=(e=Ne())=>{const t=e?.socialBlock||{};return`
      <section class="feed-gate-social-shell" data-feed-gate-social-block>
        <div class="feed-gate-social-copy">
          <h3 class="feed-gate-social-title">
            ${(Array.isArray(t?.titleLines)?t.titleLines:[]).map((o,n)=>`
              <span class="feed-gate-social-title__line">
                ${p(String(o?.before||""))}${n===0?`<strong>${p(String(o?.accent||""))}</strong>`:`<span class="feed-gate-social-title__accent">${p(String(o?.accent||""))}</span>`}${p(String(o?.after||""))}
              </span>
            `).join("")}
          </h3>
        </div>
        <article class="feed-gate-social-card">
          <div class="feed-gate-social-card__content">
            <h4 class="feed-gate-social-card__title">${p(String(t?.cardTitle||""))}</h4>
            <p class="feed-gate-social-card__description">${p(String(t?.cardDescription||""))}</p>
          </div>
          <div class="feed-gate-social-card__media">
            <img
              src="https://i.postimg.cc/pXYTM3Hp/IMG-5082.jpg"
              alt="${p(String(t?.cardImageAlt||"Feed and stories"))}"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
              class="feed-gate-social-card__image"
            />
          </div>
        </article>
      </section>
    `},xr=(e=Ne())=>{const t=Array.isArray(e?.heroTitleLines)?e.heroTitleLines:[],r=Array.isArray(e?.heroCards)?e.heroCards:[],o=[{id:"h0",background:"#00cce5",headerAccent:"#00cce5",cardAccent:"#cffafe",variant:"hero",lines:r[0]?.lines||["Discover","your city."],accentLineIndex:1},{id:"h1",background:"#0f172a",headerAccent:"#1e293b",cardAccent:"#818cf8",variant:"category",lines:r[1]?.lines||["Best","restaurants","& cafes."],accentLineIndex:1},{id:"h2",background:"#065f46",headerAccent:"#047857",cardAccent:"#6ee7b7",variant:"category",lines:r[2]?.lines||["Grocery","stores","& healthy."],accentLineIndex:1},{id:"h3",background:"#7c2d12",headerAccent:"#c2410c",cardAccent:"#fdba74",variant:"category",lines:r[3]?.lines||["Best","hotels","& motels."],accentLineIndex:1}];return`
      <section
        class="feed-gate-hero-shell"
        data-feed-gate-hero
        data-feed-gate-hero-index="0"
        style="--feed-gate-hero-accent:${p(o[0].headerAccent)};"
      >
        <div class="feed-gate-hero-copy">
          <h2 class="feed-gate-hero-title">
            ${t.map(n=>`
              <span class="feed-gate-hero-title__line">
                ${p(String(n?.before||""))}<span class="feed-gate-hero-title__accent">${p(String(n?.accent||""))}</span>${p(String(n?.after||""))}
              </span>
            `).join("")}
          </h2>
        </div>

        <div
          class="feed-gate-hero-rail"
          data-feed-gate-hero-rail
          role="list"
          aria-label="${p(String(e?.heroRailAriaLabel||"MNYRA city highlights"))}"
        >
          ${o.map((n,i)=>No(n,i)).join("")}
          <div class="feed-gate-hero-rail__endcap" aria-hidden="true"></div>
        </div>
        ${zo(e)}
        <div class="feed-gate-hero-scroll-spacer" aria-hidden="true"></div>
      </section>
    `};function Po({mode:e=Sr(),bentoContentHtml:t="",showSearchControls:r=!0,showTopSection:o=!0}={}){const n=Ne(),i=Ie(),a=String(i?.label||i?.city||"").trim(),l=String(e||"feed-gate").trim().toLowerCase()||"feed-gate",d=r!==!1,u=o!==!1,g=String(t||xr(n)).trim();return`
      <div id="feedLocationGate" data-location-screen-mode="${p(l)}" data-feed-gate-locale="${p(String(n?.locale||"en"))}" lang="${p(String(n?.htmlLang||"en"))}">
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
                  ${(Array.isArray(n?.topSliderItems)?n.topSliderItems:[]).map(y=>`
                    <div class="text-slide-item">${p(String(y||""))}</div>
                  `).join("")}
                </div>
                <div>${p(String(n?.topCityLine||""))}</div>
              </div>
              ${d?`
                <div class="loc-search-wrap">
                  <div class="loc-input-row">
                    <span class="loc-pin">${F("map-pin","w-5 h-5")}</span>
                    <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${p(a)}" placeholder="${p(String(n?.searchPlaceholder||""))}" class="loc-input" />
                    <div class="loc-request-wrap">
                      <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="${p(String(n?.useLocationAriaLabel||""))}">
                        ${wr("crosshair","w-5 h-5 relative z-10")}
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
          <div class="loc-bento loc-bento--feed-content" data-location-screen-content="${p(l)}">
            <div class="feed-stage-bento-scroll">
              ${g}
            </div>
          </div>
        </div>
      </div>
    `}function Ro(){return Ar()}function Ir(){return Fe()?`
      <div data-feed-composer-wrap class="app-content-inline mb-6">
        <button data-nav="upload" data-upload-intent="feed" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${F("plus-square","w-4 h-4")} Neuer Feed Post
        </button>
      </div>
    `:""}function Go(){return`
      <div class="flex-none w-[29%] sm:w-[120px] snap-start ml-5" style="${De({withMarginLeft:!0})}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 flex flex-col justify-between border border-white/10" style="${ct("background:linear-gradient(145deg,#111827 0%,#1f2937 52%,#000000 100%);padding:0.75rem;display:flex;flex-direction:column;justify-content:space-between;")}">
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
    `}function Bo(e={},t=0){const r=String(e?.spotId||e?.postId||"").trim(),o=p(r),n=o?`data-best-spot-avatar="${o}"`:"",i=o?`data-img-key="best-spot-avatar:${o}"`:"",a=o?`data-best-spot-name="${o}"`:"",l=String(e?.profileUrl||te("apps/menyra-social/index.html",{tab:"feed",source:"best-spot"})).trim(),d=String(e?.restaurantId||"").trim(),u=String(e?.avatarUrl||"").trim(),g=String(e?.displayName||"Best Spot").trim()||"Best Spot",y=t<4,v=String(e?.ratingDisplay||"4.8").trim()||"4.8",L=y?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',S='<svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true" focusable="false" style="display:block;color:#fbbf24;fill:currentColor;stroke:currentColor;stroke-width:1.5;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',x=u?`<img src="${p(h(u,"small"))}" ${L} decoding="async" width="120" height="208" ${n} ${i} class="absolute inset-0 w-full h-full object-cover" />`:`<div class="absolute inset-0 flex items-center justify-center text-white/85" style="background:linear-gradient(145deg,#1f2937 0%,#0f172a 60%,#020617 100%);">${F("map-pin","w-6 h-6")}</div>`,I=d?`<button type="button" data-profile-business="${p(g)}" data-profile-id="${p(d)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer text-left" style="${De()}">`:`<a href="${p(l)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${De()}">`,T=d?"</button>":"</a>";return`
      ${I}
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${ct()}">
          ${x}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0) 100%);"></div>
          <div class="absolute top-2 left-2" style="position:absolute;top:0.5rem;left:0.5rem;z-index:12;">
            <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 px-1.5 py-0.5 rounded-md shadow-sm">
              ${S}
              <span class="text-[9px] font-bold text-white pt-[1px]">${p(v)}</span>
            </div>
          </div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="p-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-sm">
              ${F("arrow-right","w-3 h-3")}
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${a}>${p(g)}</h3>
          </div>
        </div>
      ${T}
    `}function Fo(e={},t=0,r=""){const o=lt(e),n=t<5;if(o.kind==="video"&&o.src){const i=n?'preload="auto" fetchpriority="high"':'preload="metadata" fetchpriority="low"',a=o.poster?`poster="${p(h(o.poster,"small"))}"`:"",l=r?`data-story-preview-id="${p(r)}"`:"";return`
        <video src="${p(o.src)}" ${a} ${i} data-story-preview-video ${l} autoplay muted loop playsinline draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>
      `}if(o.src){const i=n?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
        <img src="${p(h(o.src,"small"))}" ${i} decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />
      `}return`
      <div class="absolute inset-0 flex items-center justify-center text-white/80" style="background:linear-gradient(145deg,#334155 0%,#1e293b 52%,#020617 100%);">
        ${F("camera","w-7 h-7")}
      </div>
    `}function kr(e,t=0){const r=Ve(e),o=r.storyRestaurantId;if(!o)return"";const n=String(r.truthSource||"canonical").trim().toLowerCase(),a=n==="feed-fallback"?te("apps/menyra-social/index.html",{r:o,tab:"profile",source:"story-fallback"}):ve(o),l=String(r.storyLabel||"").trim()||"Restaurant",d=String(r.logoSource||"").trim(),u=de(o,d,"thumb",!1),g=o?p(o):"",y=g?`data-story-logo="${g}"`:"",v=g?`data-img-key="story-logo:${g}"`:"",L=g?`data-story-border="${g}"`:"",S=g?`data-story-name="${g}"`:"",x=g?`data-story-item="${g}"`:"",I=`data-story-truth="${p(n)}"`,T=`data-story-render-sig="${p(qt(e))}"`,N=t<6?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
      <a href="${a}" ${x} data-story-url="${p(a)}" ${I} ${T} class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${De()}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${ct()}">
          ${Fo(e,t,o)}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.2) 100%);"></div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm" ${L} style="padding:2px;background:linear-gradient(135deg,#f59e0b 0%,#db2777 100%);">
              <img src="${p(u)}" ${N} decoding="async" width="28" height="28" ${y} ${v} class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${S}>${p(l)}</h3>
          </div>
        </div>
      </a>
    `}function At(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=rr(e,o),i=er(t,r,Zt(n,e,o)),l=or({spots:i,stories:n}).map((d,u)=>d.type==="spot"?Bo(d.spot,u):kr(d.story,u)).join("");return`
      <div data-spot-story-track class="flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5" style="${Fr()}">
        ${Go()}
        ${l||'<div class="flex items-center text-slate-400 text-xs font-bold uppercase px-2">Keine Spots vorhanden</div>'}
        <div class="flex-none w-1" aria-hidden="true"></div>
      </div>
    `}function Xe(e,t){const r=e.id?String(e.id):"",o=r?`data-post-like-count="${p(r)}"`:"",n=r?`data-post-comment-count="${p(r)}"`:"",i=r?`data-feed-id="${p(r)}"`:'data-feed-id=""',a=r?`data-feed-logo="${p(r)}"`:"",l=r?`data-img-key="feed-logo:${p(r)}"`:"",d=r?`data-img-key="feed-hero:${p(r)}"`:"",u=`data-feed-render-sig="${p(Kt(e))}"`,g=t<2,y=g?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',v=g?'loading="eager"':'loading="lazy" fetchpriority="low"',L=s.restaurants.find($=>$.id===(e.restaurantId||e.ownerId))||{},S=L.logoUrl||L.logo||e.logo||"",x=de(e.restaurantId||e.ownerId,S,"avatar"),I=h(e.image,"medium",{stableKey:r?`feed-hero:${r}`:""}),T=p(`${h(e.image,"small")} 480w, ${I} 768w, ${h(e.image,"large")} 1280w`),N="(max-width: 640px) 100vw, 600px",H=e.poster?h(e.poster,"medium",{stableKey:r?`feed-hero-poster:${r}`:""}):I,ne=e.isVideo&&e.videoUrl?`<video src="${p(e.videoUrl)}" poster="${p(H)}" autoplay muted loop playsinline preload="none" ${d} class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${p(I)}" srcset="${T}" sizes="${N}" ${y} ${d} decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`,W=e.restaurantId?String(ve(e.restaurantId,e.isVideo&&e.videoUrl&&r?{postId:r}:{})||"").trim():"",c=W?`<a href="${p(W)}" data-feed-post-open="${p(e.restaurantId)}" data-story-url="${p(W)}" aria-label="Stories von ${p(e.business)} ansehen" class="block w-full h-full">${ne}</a>`:ne;return`
    <div class="group feed-card" ${i} ${u}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${p(e.business)}" data-profile-id="${p(e.restaurantId||"")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${p(x)}" ${v} ${a} ${l} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${p(e.business)} ${F("star","w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${p(e.location)}</p>
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
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${p(e.content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button type="button" data-feed-post-like="${p(r)}" data-post-like-btn="${p(r)}" class="flex items-center gap-2 text-white/80 hover:text-rose-400 transition-colors">
                  ${F("heart","w-5 h-5")} <span ${o} class="text-[10px] font-black">${p(e.likes)}</span>
                </button>
                <button type="button" data-feed-post-comment="${p(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  ${F("message-circle","w-5 h-5")} <span ${n} class="text-[10px] font-black">${p(e.comments)}</span>
                </button>
              </div>
              <button type="button" data-feed-post-share="${p(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                ${F("share-2","w-4 h-4")} <span data-feed-share-label class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Tt(e){return e.length?e.slice(0,10).map((t,r)=>Xe(t,r)).join(""):'<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>'}function Er(e){const t=f?.getElementById("feedList");if(!t)return!1;if(!e.length){const l=Tt(e);return t.innerHTML!==l?(t.innerHTML=l,!0):!1}const r=Array.from(t.querySelectorAll("[data-feed-id]")),o=r.map(l=>l.dataset.feedId||""),n=e.map(l=>String(l.id||""));if(o.join("|")===n.join("|")){let l=!1;return e.forEach((d,u)=>{const g=r[u];if(!g)return;const y=Kt(d);if(String(g.getAttribute("data-feed-render-sig")||"").trim()===y)return;const L=f.createElement("template");L.innerHTML=Xe(d,u);const S=L.content.firstElementChild;S&&(g.replaceWith(S),l=!0)}),e.forEach(le),e.forEach(ee),l}const i=new Map;r.forEach(l=>i.set(l.dataset.feedId||"",l));const a=f.createDocumentFragment();return e.forEach((l,d)=>{const u=String(l.id||""),g=u?i.get(u):null;if(g)i.delete(u),a.appendChild(g);else{const y=f.createElement("template");y.innerHTML=Xe(l,d);const v=y.content.firstElementChild;v&&a.appendChild(v)}}),t.replaceChildren(a),e.forEach(le),e.forEach(ee),!0}function Uo(e){if(!q||!(e instanceof q)||e.dataset.storyBoomerangBound==="1")return;e.dataset.storyBoomerangBound="1",e.defaultMuted=!0,e.muted=!0,e.setAttribute("muted",""),e.autoplay=!0,e.loop=!1,e.controls=!1,e.disablePictureInPicture=!0,e.preload="metadata",e.playsInline=!0,e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline","");const t=String(b?.navigator?.userAgent||"").toLowerCase(),r=!!b?.matchMedia?.("(pointer: coarse)")?.matches,o=/android|iphone|ipad|ipod|mobile/.test(t),n=!!b?.matchMedia?.("(display-mode: standalone)")?.matches||!!b?.navigator?.standalone,i=r||o||n;let a=1.35;const l=.05;X.set(e,{previewStart:l,previewEnd:a,active:!1,forceLightweightLoop:i});const d=(y=!1)=>{const v=X.get(e);v&&(v.active=!!y,v.previewEnd=a,e.dataset.storyPreviewActive=y?"1":"0")},u=()=>{const y=Number(e.duration||0);if(!Number.isFinite(y)||y<=.05){a=1.35;const L=X.get(e);L&&(L.previewEnd=a);return}a=Math.max(l+.45,Math.min(y,1.45));const v=X.get(e);v&&(v.previewEnd=a)},g=()=>{if(X.get(e)?.active){u();{e.currentTime>=a&&(e.currentTime=l+.01,e.paused&&e.play().catch(()=>{}));return}}};e.addEventListener("loadedmetadata",u),e.addEventListener("timeupdate",g),e.addEventListener("stalled",()=>{X.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("waiting",()=>{X.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("ended",()=>{X.get(e)?.active&&(e.currentTime=l,e.play().catch(()=>{}))});try{e.currentTime=l}catch{}d(!1)}function Je(e,{reset:t=!1}={}){if(!q||!(e instanceof q))return;const r=X.get(e);if(r){if(t||!Number.isFinite(e.currentTime)||e.currentTime>r.previewEnd+.05)try{e.currentTime=r.previewStart}catch{}r.active=!0,e.dataset.storyPreviewActive="1",e.play().catch(()=>{try{!e.dataset.storyPreviewFrameSeek&&Number(e.currentTime||0)<=.01&&(e.dataset.storyPreviewFrameSeek="1",e.currentTime=Math.max(.05,Number(r.previewStart||0)))}catch{}Do()})}}function Do(){if(Vt||!f)return;Vt=!0;const e=()=>{f.querySelectorAll("video[data-story-preview-video]").forEach(t=>{String(t.dataset.storyPreviewVisible||"0")==="1"&&Je(t)})};f.addEventListener("touchend",e,{once:!0,passive:!0}),f.addEventListener("pointerdown",e,{once:!0,passive:!0})}function Mt(e){if(!q||!(e instanceof q))return;const t=X.get(e);t&&(t.active=!1),e.dataset.storyPreviewActive="0";try{e.pause()}catch{}}function Vo(){return!b?.IntersectionObserver||!q?null:Ue||(Ue=new b.IntersectionObserver(e=>{e.forEach(t=>{const r=t.target;if(!(r instanceof q))return;const n=(t.isIntersecting?Number(t.intersectionRatio||0):0)>=.3;r.dataset.storyPreviewVisible=n?"1":"0",n?Je(r):Mt(r)})},{threshold:[0,.15,.3,.55,.85,1]}),Ue)}function qo(){!f||Dt||(Dt=!0,f.addEventListener("visibilitychange",()=>{const e=f.getElementById("storiesRow");if(!e)return;const t=Array.from(e.querySelectorAll("video[data-story-preview-video]"));if(f.hidden){t.forEach(r=>Mt(r));return}t.forEach(r=>{String(r.dataset.storyPreviewVisible||"0")==="1"&&Je(r)})}),b?.addEventListener?.("pagehide",()=>{const e=f.getElementById("storiesRow");e&&e.querySelectorAll("video[data-story-preview-video]")?.forEach?.(t=>Mt(t))}))}function Ko(e=null){if(!f)return;const r=(e&&typeof e.querySelector=="function"?e:f).querySelector?.("[data-spot-story-track]");if(!(r instanceof HTMLElement)||r.dataset.edgeSwipeGuardBound==="1")return;r.dataset.edgeSwipeGuardBound="1";let o=!1,n=0,i=0,a=0;const l=g=>{const y=g.touches?.[0];y&&(o=!0,n=y.clientX,i=y.clientY,a=Number(r.scrollLeft||0))},d=g=>{if(!o)return;const y=g.touches?.[0];if(!y)return;const v=y.clientX-n,L=y.clientY-i;if(Math.abs(v)<=Math.abs(L))return;const S=Math.max(0,Number(r.scrollWidth||0)-Number(r.clientWidth||0)),x=a<=.5||Number(r.scrollLeft||0)<=.5,I=Math.abs(S-Number(r.scrollLeft||0))<=.5,T=v>0&&x,N=v<0&&I;(T||N)&&g.preventDefault()},u=()=>{o=!1};r.addEventListener("touchstart",l,{passive:!0}),r.addEventListener("touchmove",d,{passive:!1}),r.addEventListener("touchend",u,{passive:!0}),r.addEventListener("touchcancel",u,{passive:!0})}function Pe(e=null){const t=e&&typeof e.querySelectorAll=="function"?e:f?.getElementById("storiesRow");if(!t)return;const r=Array.from(t.querySelectorAll?.("video[data-story-preview-video]")||[]),o=Vo();o&&o.disconnect(),r.forEach(n=>{Uo(n),o?o.observe(n):Je(n,{reset:!0})}),Ko(t),qo()}function Cr(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=f?.getElementById("storiesRow");return n?(n.innerHTML=At(e,t,{fallbackFeedPosts:r,fallbackStories:o}),Pe(n),!0):!1}function Yo(e){if(!f||!e)return!1;const t=f.getElementById("feedList");if(!t)return!1;const r=e.querySelector("[data-feed-composer-wrap]");if(!Fe())return r?(r.remove(),!0):!1;if(r)return!1;const n=f.createElement("template");n.innerHTML=Ir();const i=n.content.firstElementChild;return i?(t.parentNode?.insertBefore(i,t),!0):!1}function Ho(){const e=f?.getElementById("feedView");if(!e)return!1;if(String(e.dataset.feedViewMode||"feed").trim().toLowerCase()!=="feed")return _t(),ke(),b?.lucide?.createIcons&&b.lucide.createIcons(),!0;const o=(Array.isArray(s?.feedPosts)?s.feedPosts:[]).filter(I=>s.feedCategory==="all"||I.category===s.feedCategory).sort((I,T)=>(m(T.createdAt)?.getTime()||0)-(m(I.createdAt)?.getTime()||0)),n=(Array.isArray(s.stories)?s.stories:[]).filter(I=>Yt(I)),{feedPosts:i,stories:a}=Jt({feedPosts:o,stories:n}),l=a,d=rr(l,l),u=er(i,i,Zt(d,l)),g=f.getElementById("storiesRow"),y=Zr({spots:u,stories:d});let v=!1;if(g){const I=!!g.querySelector("[data-spot-story-track]");(C()!==y||!I)&&(Cr(l,i,{fallbackFeedPosts:i,fallbackStories:l}),A(y),v=!0),d.forEach(H=>{B(H),D(H)});const T=`motion:${y}|${d.length}`;(v||String(g.dataset.storyPreviewMotionSig||"")!==T)&&(Pe(g),g.dataset.storyPreviewMotionSig=T)}const L=Yo(e),S=Er(i);tt(i),_t();const x=qr(i);return x!==ar&&(ar=x,rt(i)),(v||L||S)&&b?.lucide?.createIcons&&b.lucide.createIcons(),!0}function Ar(){const e=!!J(Ie()),t=e?"feed":"feed-gate";let r=xr();if(e){const i=(Array.isArray(s?.feedPosts)?s.feedPosts:[]).filter(g=>s.feedCategory==="all"||g.category===s.feedCategory).sort((g,y)=>(m(y.createdAt)?.getTime()||0)-(m(g.createdAt)?.getTime()||0)),a=(Array.isArray(s.stories)?s.stories:[]).filter(g=>Yt(g)),{feedPosts:l,stories:d}=Jt({feedPosts:i,stories:a}),u=d;r=`
        <div id="storiesRow" class="app-content-inline pt-6">
          ${At(u,l,{fallbackFeedPosts:l,fallbackStories:u})}
        </div>
        ${Ir()}
        <div id="feedList" class="app-content-inline py-4 space-y-12">
          ${Tt(l)}
        </div>
      `}const o=!!He;return He=!1,`
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
      ${Po({mode:e?"feed-stage":"feed-gate",bentoContentHtml:r,showSearchControls:!e,showTopSection:!e})}
    </div>
  `}function Wo(){if(!f||sr)return;sr=!0;const e=()=>Lr();f.addEventListener("input",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&Et(o.value)}),f.addEventListener("pointerdown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&f?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}}),f.addEventListener("touchstart",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&f?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}},{passive:!1}),f.addEventListener("focusin",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&Et(o.value)}),f.addEventListener("focusout",t=>{if(!e())return;const r=t.target;!(r instanceof Element)||!r.closest("[data-feed-location-city-input]")||V(()=>{const n=f?.activeElement;n instanceof Element&&(n.closest("[data-feed-location-city-input]")||n.closest("[data-feed-city-suggestion]"))||Z()},120)}),f.addEventListener("change",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;const n=String(o.value||"").trim();if(!n)return;const i=kt(n,1)[0];if(!i||R(n)!==R(i.label))return;Z(),ze({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||he({fallbackCity:i})}),f.addEventListener("keydown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;if(t.key==="Escape"){Z();return}if(t.key!=="Enter")return;const n=kt(o.value,1)[0];if(!n)return;t.preventDefault(),o.value=n.label,Z(),ze({lat:n.lat,lng:n.lng,label:n.label,city:n.city||n.label,country:n.country,countryCode:n.countryCode,source:"city-search"})||he({fallbackCity:n})}),f.addEventListener("click",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-city-suggestion]");if(o){t.preventDefault(),t.stopPropagation();const i=yr(o.getAttribute("data-feed-city-suggestion")||"");if(i){const a=f?.getElementById("feedLocationCityInput");a instanceof HTMLInputElement&&(a.value=i.label),Z(),ze({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||he({fallbackCity:i})}return}r.closest("[data-feed-location-request]")&&(t.preventDefault(),t.stopPropagation(),he({forceExact:!0}))})}function _t(){Wo(),Lr()&&ke();const e=f?.getElementById("feedView");if(!e){mr();return}if(xo(e),String(e.dataset.feedViewMode||"").trim().toLowerCase()==="feed"?(gr(),Pe()):(Le=!1,Oe()),e.dataset.bound==="true"){Pe(),ke();return}const r=()=>String(e.dataset.feedViewMode||"").trim().toLowerCase()!=="feed",o=n=>{if(r()||!(n instanceof Element))return;const i=n.closest("[data-story-item]")||n.closest("[data-feed-post-open]");!(i instanceof Element)||String(i.getAttribute("data-story-truth")||"").trim().toLowerCase()==="feed-fallback"||ro(i.getAttribute("data-story-item")||i.getAttribute("data-feed-post-open")||"",i.getAttribute("data-story-url")||i.getAttribute("href")||"")};e.addEventListener("pointerdown",n=>{o(n.target)},{passive:!0}),e.addEventListener("touchstart",n=>{o(n.target)},{passive:!0}),e.addEventListener("click",n=>{const i=n.target;if(!(i instanceof Element))return;const a=i.closest("[data-story-item]");if(a){o(a);return}const l=i.closest("[data-feed-post-like]");if(l){const v=l.dataset.feedPostLike||"";v&&Ce(v);return}const d=i.closest("[data-feed-post-comment]");if(d){const v=d.dataset.feedPostComment||"",L=Ht(v);if(L){const x=d.closest("[data-feed-id]")?.querySelector?.(`[data-img-key="feed-hero:${v}"]`)||null,I=String(x?.currentSrc||x?.getAttribute?.("src")||"").trim();Promise.resolve(Ee(L,{previewImageEl:x,previewImageSrc:I})).then(()=>{oo()})}return}const u=i.closest("[data-feed-post-share]");if(u){const v=u.dataset.feedPostShare||"",L=Ht(v);if(!L)return;const S=eo(L),x=String(L.business||"Menyra").trim()||"Menyra",I=[x,String(L.content||L.caption||"").trim()].filter(Boolean).join(`
`);b?.navigator?.share?b.navigator.share({title:x,text:I,url:S}).then(()=>{pt(u,"Geteilt")}).catch(async T=>{if(String(T?.name||"").trim()==="AbortError")return;const N=await nr(S);pt(u,N?"Kopiert":"Link")}):nr(S).then(T=>{pt(u,T?"Kopiert":"Link")});return}const g=i.closest("[data-nav]");if(g){const v=g.dataset.nav;if(v){if(v==="favorites"&&!String(s.user?.uid||"").trim()){Q("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");return}const L=v==="upload"?{upload:O(g.dataset.uploadIntent||"",s.upload)}:{},S=v==="favorites"?"profile":v,x=v==="favorites"?"favorites":v==="profile"?"profile":s.profileTopTab;if(v==="profile"&&typeof k=="function"){s.chatSettingsOpen=!1,s.chatListScope="inbox",s.chatThreadMenuId="",s.settingsView="main",s.selectedBusiness=null,s.postModal={open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},s.likesModal={open:!1,postId:"",animate:!1},s.leadModal={open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},s.customerModal={open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},k({showBack:!1,topTab:"profile"});return}U({activeTab:S,profileTopTab:x,drawerOpen:!1,chatSettingsOpen:!1,chatListScope:"inbox",chatThreadMenuId:"",settingsView:"main",selectedBusiness:null,profileView:null,profileModal:{open:!1,profile:null},postModal:{open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},likesModal:{open:!1,postId:"",animate:!1},leadModal:{open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},customerModal:{open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},...L})}return}const y=i.closest("[data-profile-business]");y&&re({id:y.dataset.profileId||"",name:y.dataset.profileBusiness||""},{showBack:!0})}),Pe(),ke(),e.dataset.bound="true"}return{renderHomeView:Ro,renderFeedView:Ar,renderStoryItem:kr,renderStoriesRow:At,renderFeedItem:Xe,renderFeedList:Tt,patchFeedList:Er,patchStoriesRow:Cr,updateFeedDom:Ho,bindFeedDelegation:_t}}function Mr(s={}){return String(s.url||s.mediaUrl||s.media?.[0]?.url||s.media?.[0]?.thumbUrl||s.imageUrl||s.image||s.photoUrl||s.pictureUrl||"").trim()}function _r(s={}){const m=String(s.media?.[0]?.type||s.mediaType||s.type||"").trim().toLowerCase();return s.isVideo===!0||m==="video"||m.startsWith("video/")}function en(s,m={},C=""){return{id:s,url:Mr(m),type:m.type||"square",title:m.title||"",caption:m.caption||"",createdAt:m.createdAt,likes:m.likesCount??m.likes??0,comments:m.commentsCount??m.comments??0,isVideo:_r(m),ownerType:"user",ownerId:C||""}}function dn(s,m={},C=""){return{id:s,url:Mr(m),type:m.type||"square",title:m.title||"",caption:m.caption||"",createdAt:m.createdAt,likes:m.likesCount??m.likes??0,comments:m.commentsCount??m.comments??0,isVideo:_r(m),ownerType:"restaurant",ownerId:C||"",restaurantId:C||""}}function $r(s=[]){return(Array.isArray(s)?s:[]).map(m=>{const C=String(m?.restaurantId||m?.id||"").trim(),A=m?.isLive?"1":"0",z=String(m?.truthSource||m?.storyTruthSource||m?.storyTruth||"").trim().toLowerCase()||"canonical",P=String(m?.mediaType||m?.type||"").trim().toLowerCase(),B=String(m?.videoUrl||m?.imageUrl||m?.mediaUrl||m?.embedUrl||m?.url||"").trim(),D=m?.createdAt?.seconds!==void 0?`${m.createdAt.seconds}:${Number(m.createdAt?.nanoseconds)||0}`:String(m?.createdAt||m?.updatedAt||"").trim();return`${C}|${A}|${z}|${P}|${B}|${D}`}).join(",")}function un({posts:s=[],force:m=!1,fastMode:C=!1,allowFeedFallback:A=!1,buildStoriesFromFeed:z,currentSignature:P=""}={}){if(!C||!A)return{updated:!1,signature:P,stories:[]};if(!Array.isArray(s)||!s.length)return{updated:!1,signature:P,stories:[]};if(typeof z!="function")return{updated:!1,signature:P,stories:[]};const B=z(s);if(!B.length)return{updated:!1,signature:P,stories:[]};const D=$r(B);return!m&&P===D?{updated:!1,signature:P,stories:[]}:{updated:!0,signature:D,stories:B}}const tn=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),rn=Object.freeze({xk:"Kosove",al:"Shqiperi",rs:"Serbi"});function on(s=""){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}function nn(s=""){const m=on(s);return m&&tn.get(m)||""}function ce(s,m){const C=Number(s),A=Number(m);return!Number.isFinite(C)||!Number.isFinite(A)||Math.abs(C)<1e-6&&Math.abs(A)<1e-6?null:Math.abs(C)<=90&&Math.abs(A)<=180?{lat:C,lng:A}:Math.abs(C)<=180&&Math.abs(A)<=90?{lat:A,lng:C}:null}function Gt(s={}){return!s||typeof s!="object"?null:ce(s.lat,s.lng)||ce(s.latitude,s.longitude)||ce(s.gpsLat,s.gpsLng)||ce(s.geo?.lat,s.geo?.lng)||ce(s.geo?.latitude,s.geo?.longitude)||ce(s.coords?.lat,s.coords?.lng)||ce(s.coords?.latitude,s.coords?.longitude)||ce(s.location?.lat,s.location?.lng)}function fn({state:s=null,firebaseApi:m={},constants:C={},visibilityApi:A={},utilityApi:z={}}={}){const P=typeof m.collectionFn=="function"?m.collectionFn:null,B=typeof m.queryFn=="function"?m.queryFn:null,D=typeof m.orderByFn=="function"?m.orderByFn:null,ee=typeof m.limitFn=="function"?m.limitFn:null,le=typeof m.getDocsFn=="function"?m.getDocsFn:null,tt=typeof A.isForceHiddenUidFn=="function"?A.isForceHiddenUidFn:(()=>!1),rt=typeof A.isForceHiddenHandleFn=="function"?A.isForceHiddenHandleFn:(()=>!1),Bt=typeof A.isForceHiddenBusinessEntityFn=="function"?A.isForceHiddenBusinessEntityFn:(()=>!1),ot=typeof A.isPublicBusinessRecordFn=="function"?A.isPublicBusinessRecordFn:(()=>!0),nt=typeof z.formatRelativeFn=="function"?z.formatRelativeFn:(h=>String(h||"")),Re=typeof z.toDateSafeFn=="function"?z.toDateSafeFn:(h=>h);function F(h){const _=String(h||"").trim();if(!_)return!0;const E=String(s?.userProfile?.restaurantId||"").trim();if(E&&_===E)return!0;if(tt(_)||rt(_))return!1;const O=(s?.restaurants||[]).find(U=>String(U?.id||"")===_)||null;return O?ot(O):!0}function p(h){if(!h)return 0;try{return typeof h?.toDate=="function"?h.toDate()?.getTime?.()||0:typeof h=="number"?Number.isFinite(h)?h:0:h instanceof Date?h.getTime()||0:Re(h)?.getTime?.()||0}catch{return 0}}function te(h="",_=""){const E=String(h||"").trim();if(!E||!(s?.postEntityMap instanceof Map)||!s.postEntityMap.size)return null;const O=String(_||"").trim();let U=null,Q=-1;return s.postEntityMap.forEach(k=>{if(!k||String(k?.id||"").trim()!==E)return;const re=String(k?.restaurantId||(k?.ownerType==="restaurant"?k?.ownerId:"")||k?.rid||"").trim(),Ee=O&&re===O?1e6:0,Ce=[k?.caption,k?.content,k?.url,k?.image,k?.title].reduce((b,q)=>String(q||"").trim()?b+1:b,0),V=Math.max(p(k?.updatedAt),p(k?.updatedAtClient),p(k?.createdAtClient),p(k?.createdAt)),f=Ee+V+Ce*10;(!U||f>Q)&&(U=k,Q=f)}),U}function ve(h={}){const _=String(h?.rid||h?.restaurantId||"").trim();if(Bt({id:_,restaurantId:_,...h||{}})||!F(_))return null;const E=te(h?.id,_),O=(s?.restaurants||[]).find(Fe=>Fe?.id===_)||{},U=Gt(O)||Gt(h)||Gt(E),Q=nn(O?.countryCode||O?.country_code||O?.country||h?.countryCode||h?.country_code||h?.country||E?.countryCode||E?.country),k=Q?rn[Q]||"":String(O?.country||h?.country||E?.country||"").trim(),re=h?.thumbUrl||h?.mediaUrl||h?.media?.[0]?.thumbUrl||h?.media?.[0]?.url||"",Ee=h?.logoUrl||h?.logo||h?.logoURL||"",Ce=String(E?.content||E?.caption||h?.caption||h?.content||h?.captionShort||"").trim(),V=String(E?.image||E?.url||h?.imageUrl||re||"").trim(),f=String(h?.id||E?.id||"").trim(),b=String(E?.mediaType||h?.mediaType||h?.media?.[0]?.type||"").trim().toLowerCase(),q=String(E?.url||h?.mediaUrl||h?.media?.[0]?.url||"").trim(),Be=b==="video"||h?.isVideo===!0||/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(q),it=Be?q:"",at=String(h?.thumbUrl||h?.media?.[0]?.thumbUrl||E?.thumbUrl||"").trim();return{id:f,restaurantId:_,isVideo:Be,videoUrl:it,poster:at,business:h?.businessName||h?.restaurantName||O?.name||O?.restaurantName||"Business",logo:O?.logoUrl||O?.logo||Ee||"",location:h?.city||O?.city||"",country:k,countryCode:Q,lat:U?.lat??null,lng:U?.lng??null,content:Ce,image:V,likes:Number(h?.likesCount??h?.likes??E?.likes??0)||0,comments:Number(h?.commentsCount??h?.comments??E?.comments??0)||0,time:nt(Re(E?.createdAt||h?.createdAt)),createdAt:E?.createdAt||h?.createdAt,updatedAt:h?.updatedAt||E?.updatedAt||E?.updatedAtClient||h?.createdAt,category:h?.postType||"food",isLive:h?.isLive||!1,ownerType:"restaurant",ownerId:_,truthSource:"feed-projection",canonicalPath:String(h?.canonicalPath||(_&&f?`restaurants/${_}/socialPosts/${f}`:"")).trim()}}function de(h=[]){return $r(h||[])}async function Ge(h){const _=String(h||"").trim();if(!_||!m.db||!P||!le)return[];try{const E=P(m.db,"users",_,"posts");let O=null;try{const k=[D("createdAt","desc")];ee&&C.fastLimits?.userPosts&&k.push(ee(C.fastLimits.userPosts));const re=B?B(E,...k):E;O=await le(re)}catch{const re=Number(C.fastLimits?.userPosts)||24;O=B&&ee?await le(B(E,ee(re))):await le(E)}const U=[];O?.forEach?.(k=>U.push({id:k.id,...k.data()}));const Q=U.map(k=>en(k.id,{...k,url:k.url||k.mediaUrl||k.media?.[0]?.url||"",isVideo:k.isVideo??k.media?.[0]?.type==="video"},_)).filter(k=>k.url);return Zo(s,Q)}catch{return[]}}return{canShowFeedRestaurantId:F,normalizeFeedPost:ve,buildStoriesRowSignature:de,loadUserPostsForUser:Ge}}function an({posts:s=[],toDateSafe:m}={}){if(!Array.isArray(s)||typeof m!="function")return 0;let C=0;return s.forEach(A=>{const z=m(A?.createdAt)?.getTime?.()||0;z>C&&(C=z)}),C}function gn({posts:s=[],extraMeta:m={},toDateSafe:C,writeCache:A,feedCacheKey:z,feedFallbackLimit:P=0}={}){if(!Array.isArray(s)||typeof A!="function"||!z)return;const B=an({posts:s,toDateSafe:C}),D=Math.max(0,Number(P)||0),ee=D>0?s.slice(0,D):s.slice();A(z,ee,{latestTs:B,...m})}export{en as a,$r as b,ln as c,cn as d,fn as e,dn as n,Zo as p,un as r,gn as s};
