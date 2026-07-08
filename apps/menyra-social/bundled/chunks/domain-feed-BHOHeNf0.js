function an(a={}){const u=String(a?.id||"").trim();if(!u)return"";const I=String(a?.ownerType||(a?.restaurantId||a?.rid?"restaurant":"")||(a?.uid||a?.userId?"user":"")||"").trim(),k=String(a?.ownerId||a?.restaurantId||a?.rid||a?.uid||a?.userId||"").trim();return I&&k?`${I}:${k}:${u}`:`post:${u}`}function Ur(a=null){return a?(a.postEntityMap instanceof Map||(a.postEntityMap=new Map),a.postEntityMap):new Map}function hn(a=null){const u=Ur(a);return u.clear(),u}function sn(a=null,u=[]){const I=Ur(a),k=new Set;return(Array.isArray(u)?u:[]).map(_=>{const N=an(_);if(!N||k.has(N))return null;k.add(N);const P=I.get(N);if(!P){const U={..._||{}};return I.set(N,U),U}return Object.assign(P,_||{}),P}).filter(Boolean)}const qt="near",ot="unknown",Kt="foreign";function rt({hasViewerCity:a=!1,cityMatchesViewer:u=!1,businessHasKnownForeignCity:I=!1}={}){return!a||u?qt:I?Kt:ot}function Gr(a=ot){return a!==Kt}function Br(a=ot){return a===qt?0:a===ot?1:2}function Fr(a={},u={}){const I=Br(a.scope)-Br(u.scope);if(I!==0)return I;const k=Number(a.distanceKm),_=Number(u.distanceKm),N=Number.isFinite(k),P=Number.isFinite(_);if(N&&P&&Math.abs(k-_)>.001)return k-_;if(N!==P)return N?-1:1;const U=a.isLive?1:0,Y=u.isLive?1:0;if(U!==Y)return Y-U;const J=Number(a.createdAtMs)||0,ye=Number(u.createdAtMs)||0;return J!==ye?ye-J:(Number(a.fallbackIndex)||0)-(Number(u.fallbackIndex)||0)}function cn({stories:a=[],spots:u=[]}={}){const I=Array.isArray(a)?a:[],k=Array.isArray(u)?u:[];return[...I.map(_=>({type:"story",story:_})),...k.map(_=>({type:"spot",spot:_}))]}function bn({state:a=null,toDateSafeFn:u=g=>g,getStoriesRowSignatureFn:I=()=>"",setStoriesRowSignatureFn:k=()=>{},FAST_MODE:_=!1,buildStoriesFromFeedFn:N=()=>[],updateStoryLogoNodesFn:P=()=>{},updateStoryMetaNodesFn:U=()=>{},updateFeedLogoNodesFn:Y=()=>{},updatePostCountNodesFn:J=()=>{},ensureFeedRestaurantMetaListenersFn:ye=()=>{},preloadFeedHeroImagesFn:nt=()=>{},buildStoriesRowSignatureFn:Yt=()=>"",documentObj:it=null,windowObj:at=null,isLocalBusinessProfileFn:Pe=()=>!1,iconFn:V=()=>"",escapeHtmlFn:p=g=>String(g||""),buildUrlFn:ne=()=>"",buildStoryViewerUrlFn:ve=(g="",y={})=>ne("apps/menyra-social/index.html",{r:g,tab:"profile"}),resolveRestaurantLogoFn:de=()=>"",resolveStoryRenderIdentityFn:Re=null,getOptimizedImageUrlFn:h=()=>"",getVerifiedMapLocationFn:O=()=>null,setVerifiedMapLocationFn:E=null,buildUploadStateForIntentFn:z=(g="",y={})=>y,setStateFn:D=()=>{},openGuestAuthPromptFn:Z=()=>!1,openOwnBusinessProfileFn:C=null,openProfileViewFromBusinessFn:ie=()=>{},openPostModalFn:Ce=async()=>{},togglePostLikeFn:Ee=async()=>{},setTimeoutFn:q=(g,y)=>setTimeout(g,y)}={}){if(!a)return{renderHomeView:()=>"",renderFeedView:()=>"",renderStoryItem:()=>"",renderStoriesRow:()=>"",renderFeedItem:()=>"",renderFeedList:()=>"",patchFeedList:()=>!1,patchStoriesRow:()=>!1,updateFeedDom:()=>!1,bindFeedDelegation:()=>{}};const g=it||(typeof document<"u"?document:null),y=at||(typeof window<"u"?window:null),K=typeof HTMLVideoElement=="function"?HTMLVideoElement:null,Ge="mnyra_story_viewer_hint_v1:",st=()=>!!String(a.userProfile?.uid||"").trim(),ct=()=>!!String(a.userProfile?.restaurantId||"").trim(),Be=()=>!!Pe(a.userProfile)||ct()&&(!!a.user||st()),lt=(e="")=>{const t=String(e||"").trim();return t?t.toLowerCase()==="business"?"":t:""},dt=(e={})=>String(e?.truthSource||e?.storyTruthSource||e?.storyTruth||"").trim().toLowerCase()==="feed-fallback"?"feed-fallback":"canonical",Ht=15,Kr=6,Yr=15,Hr=35,Wr=Object.freeze(["city","locationCity","primaryCity","place","locationPlace","primaryPlace","postalCity","address","primaryAddress","formattedAddress","fullAddress","addressText","streetAddress","street","locationLabel","displayLocation","locality","town","municipality","village","neighborhood","neighbourhood","area","district","county","region","state","province"]),Qr=Object.freeze(["location","primaryLocation","businessLocation","venueLocation","addressInfo","geo","coords","coordinates","geoPoint"]),Xr="flex:0 0 29%;width:29%;max-width:120px;",Jr="height:13rem;",Zr="border-radius:1rem;",ee=new WeakMap;let Fe=null,Wt=!1,Qt=!1;const Ue=({withMarginLeft:e=!1}={})=>`${Xr}${e?"margin-left:1.25rem;":""}`,eo=()=>"margin-left:calc(var(--app-content-inline,1.5rem) * -1);margin-right:calc(var(--app-content-inline,1.5rem) * -1);scroll-padding-left:1.25rem;overscroll-behavior-x:contain;touch-action:pan-x;-webkit-overflow-scrolling:touch;",ut=(e="")=>`${Jr}${Zr}position:relative;overflow:hidden;${e}`,L=(e=0)=>{const t=Number(e);return Number.isFinite(t)?t:0},Xt=(e={})=>De(e?.createdAt||e?.updatedAt||e?.timestamp||e?.ts||e?.publishedAt||null),to=(e="")=>{const t=String(e||"").trim().toLowerCase();return t?!!(/\.m3u8($|\?)/.test(t)||/\.mpd($|\?)/.test(t)||/\.mp4($|\?)/.test(t)||/\.webm($|\?)/.test(t)||/\.mov($|\?)/.test(t)||/\.m4v($|\?)/.test(t)||/\.ogv($|\?)/.test(t)):!1},ft=(e={})=>{const t=String(e?.mediaType||e?.type||"").trim().toLowerCase(),r=String(e?.imageUrl||e?.thumbUrl||"").trim(),o=String(e?.videoUrl||e?.playbackUrl||"").trim(),n=String(e?.mediaUrl||e?.url||"").trim(),i=String(e?.embedUrl||"").trim(),s=String(e?.thumbUrl||e?.thumbnail||e?.thumbnailUrl||e?.previewImage||e?.previewUrl||e?.poster||e?.posterUrl||"").trim(),l=to(n),d=o||(t==="video"||l?n:""),f=r||(t==="image"?n:"");return d?{kind:"video",src:d,poster:f||s,signature:`video:${d}|${f||s||""}`}:f?{kind:"image",src:f,poster:f,signature:`image:${f}`}:s?{kind:"image",src:s,poster:s,signature:`fallback:${s}`}:i?{kind:"embed",src:i,poster:"",signature:`embed:${i}`}:{kind:"none",src:"",poster:"",signature:"none"}},Jt=(e={})=>{const t=dt(e),r=ft(e);return[String(e?.restaurantId||e?.id||"").trim(),t,e?.isLive?"1":"0",r.signature].join("|")},Zt=(e={})=>[String(e?.id||"").trim(),String(e?.business||"").trim(),String(e?.location||"").trim(),String(e?.content||e?.caption||"").trim(),String(e?.image||e?.url||"").trim(),e?.isLive?"1":"0"].join("|"),ro=(e=[])=>(Array.isArray(e)?e:[]).slice(0,10).map(t=>[String(t?.id||"").trim(),String(t?.image||t?.url||"").trim()].join("|")).join(","),Ve=typeof Re=="function"?(e={})=>Re(e):(e={})=>{const t=String(e?.restaurantId||"").trim(),r=dt(e),o=r==="feed-fallback";if(!t)return{storyRestaurantId:"",hasCanonicalRestaurant:!1,storyLabel:"",logoSource:"",borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r};const n=a.restaurants.find(v=>String(v?.id||"").trim()===t)||null,i=String(a.userProfile?.restaurantId||"").trim(),s=i&&i===t,l=!!n?.id,d=String(n?.logoUrl||n?.logo||n?.logoURL||"").trim(),f=lt(n?.name||n?.restaurantName||n?.displayName||n?.businessName||""),m=lt(e?.name||e?.businessName||e?.restaurantName||""),b=s?lt(a.userProfile?.name||""):"",S=s?String(a.userProfile?.avatar||"").trim():"",w=l?f||m||b||"":b||m||f||"",A=l?d||String(e?.img||e?.logo||e?.logoUrl||"").trim():S||String(e?.img||e?.logo||e?.logoUrl||"").trim();return{storyRestaurantId:t,hasCanonicalRestaurant:l,storyLabel:w,logoSource:A,borderClass:e?.isLive?"border-red-500 animate-pulse":o?"border-amber-300 border-dashed":"border-slate-200",truthSource:r}},er=(e={})=>!!Ve(e).storyRestaurantId,tr=(e="")=>{const t=String(e||"").trim();return t&&(Array.isArray(a?.feedPosts)?a.feedPosts:[]).find(o=>String(o?.id||"").trim()===t)||null},De=(e=null)=>{const t=u(e),r=Number(t?.getTime?.()||0);return Number.isFinite(r)?r:0},gt=()=>{const e=new Map;return(Array.isArray(a?.restaurants)?a.restaurants:[]).forEach(r=>{const o=String(r?.id||r?.restaurantId||"").trim();!o||e.has(o)||e.set(o,r)}),e},mt=(e={})=>String(e?.restaurantId||(String(e?.ownerType||"").trim().toLowerCase()==="restaurant"?e?.ownerId:"")||e?.rid||"").trim(),pt=(e=[],t="")=>{if(typeof t=="string"||typeof t=="number"){const r=String(t||"").trim();r&&e.push(r)}},ht=(e=[],t={})=>{!t||typeof t!="object"||(Wr.forEach(r=>pt(e,t[r])),(typeof t.location=="string"||typeof t.location=="number")&&pt(e,t.location))},qe=(e="")=>R(e).replace(/-/g," ").replace(/\s+/g," ").trim(),rr=()=>Lt.map(e=>[e?.id,e?.label,e?.city,...Array.isArray(e?.aliases)?e.aliases:[]].map(qe).filter(Boolean)).filter(e=>e.length),or=(e="")=>{const t=qe(e);if(!t)return[];const r=new Set([t]);return rr().forEach(o=>{o.includes(t)&&o.forEach(n=>r.add(n))}),Array.from(r)},Ke=(e=[],t=[])=>{const r=(Array.isArray(e)?e:[]).map(qe).filter(Boolean);if(!r.length||!t.length)return!1;const o=r.join(" ");return t.some(n=>{const i=n.split(" ").filter(Boolean);return r.some(s=>s===n||s.includes(n))||i.length>0&&i.every(s=>o.includes(s))})},nr=(e=[])=>{const t=(Array.isArray(e)?e:[]).map(qe).filter(Boolean);if(!t.length)return!1;const r=t.join(" ");return rr().some(o=>o.some(n=>{const i=n.split(" ").filter(Boolean);return t.some(s=>s===n||s.includes(n))||i.length>0&&i.every(s=>r.includes(s))}))},oo=(e={})=>{const t=te(e);if(!t)return"";const r=Lt.map(o=>{const n=B(o);return{label:String(o?.label||"").trim(),distanceKm:n?xe(t,n):Number.POSITIVE_INFINITY}}).filter(o=>o.label&&Number.isFinite(o.distanceKm)).sort((o,n)=>o.distanceKm-n.distanceKm)[0];return r&&r.distanceKm<=Hr?r.label:""},ir=(...e)=>{const t=[];return e.forEach(r=>{!r||typeof r!="object"||(ht(t,r),Qr.forEach(o=>ht(t,r[o])),Array.isArray(r.locations)&&r.locations.forEach(o=>ht(t,o)))}),t},ar=(...e)=>{const t=[];return e.forEach(r=>pt(t,oo(r))),t},bt=({entry:e={},restaurant:t=null,viewerCity:r=""}={})=>{const o=or(r);if(!o.length)return!0;const n=ir(t,e);return Ke(n,o)?!0:nr(n)?!1:Ke(ar(t,e),o)},sr=({entry:e={},restaurant:t=null,viewerCity:r=""}={})=>{const o=or(r);if(!o.length)return rt({hasViewerCity:!1});const n=ir(t,e),i=Ke(n,o)||Ke(ar(t,e),o),s=!i&&nr(n);return rt({hasViewerCity:!0,cityMatchesViewer:i,businessHasKnownForeignCity:s})},cr=({feedPosts:e=[],stories:t=[]}={})=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=re(Ie()),i=Et(n),s=pe(n),l=B(n),d=gt(),f=!!s,m=!!i,b=(v={},{type:x="post",fallbackIndex:j=0}={})=>{const $=mt(v),F=$&&d.get($)||null,Q=pe({...F&&typeof F=="object"?F:{},...v&&typeof v=="object"?v:{}});if(f&&(!Q||Q!==s)||m&&!bt({entry:v,restaurant:F,viewerCity:i}))return null;const W=te(F)||te(v),c=l&&W?xe(l,W):Number.POSITIVE_INFINITY;return{entry:v,fallbackIndex:j,distanceKm:c,createdAtMs:x==="post"?De(v?.createdAt||v?.updatedAt):0}},S=r.map((v,x)=>b(v,{type:"post",fallbackIndex:x})).filter(Boolean).sort((v,x)=>{const j=Number.isFinite(v.distanceKm),$=Number.isFinite(x.distanceKm);return j&&$&&Math.abs(v.distanceKm-x.distanceKm)>.001?v.distanceKm-x.distanceKm:j!==$?j?-1:1:v.createdAtMs!==x.createdAtMs?x.createdAtMs-v.createdAtMs:v.fallbackIndex-x.fallbackIndex}).map(v=>v.entry),w=(v={},x=0)=>{const j=mt(v),$=j&&d.get(j)||null,F=pe({...$&&typeof $=="object"?$:{},...v&&typeof v=="object"?v:{}}),Q=f&&!!F&&F!==s,W=m?sr({entry:v,restaurant:$,viewerCity:i}):rt({hasViewerCity:!1}),c=Q?Kt:W,T=te($)||te(v),M=l&&T?xe(l,T):Number.POSITIVE_INFINITY;return{entry:v,fallbackIndex:x,scope:c,distanceKm:M,isLive:!!v?.isLive,createdAtMs:Xt(v)}},A=o.map((v,x)=>w(v,x)).filter(v=>Gr(v.scope)).sort(Fr).map(v=>v.entry);return{feedPosts:S,stories:A}},yt=(e=Number.POSITIVE_INFINITY,t=Number.POSITIVE_INFINITY)=>{const r=Number.isFinite(e),o=Number.isFinite(t);return r&&o&&Math.abs(e-t)>.001?e-t:r!==o?r?-1:1:0},vt=(e={},t={})=>{if(e.likes!==t.likes)return t.likes-e.likes;if(e.visitors!==t.visitors)return t.visitors-e.visitors;if(e.comments!==t.comments)return t.comments-e.comments;if(e.createdAtMs!==t.createdAtMs)return t.createdAtMs-e.createdAtMs;const r=yt(e.distanceKm,t.distanceKm);return r!==0?r:e.fallbackIndex-t.fallbackIndex},no=(e=null)=>{const t=new Set;return(e instanceof Set?Array.from(e):Array.isArray(e)?e:[]).forEach(o=>{const n=String(o||"").trim();n&&t.add(n)}),t},lr=(...e)=>{const t=new Set;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{const n=Ve(o),i=String(o?.restaurantId||o?.storyId||n.storyRestaurantId||"").trim();i&&t.add(i)})}),t},dr=(e=[],t=[],r=null)=>{const o=Array.isArray(e)?e:[],n=Array.isArray(t)?t:[],i=o.length?o:n,s=re(Ie()),l=Et(s),d=B(s),f=pe(s),m=gt(),b=no(r),S=new Map,w=(c=null)=>{if(!c||!c.spotId)return;const T=S.get(c.spotId);if(!T){S.set(c.spotId,c);return}vt(c,T)<0&&S.set(c.spotId,c)},A=(c={},T=0)=>{const M=mt(c),X=String(c?.id||"").trim(),ze=M||(X?`post:${X}`:`idx:${T}`),G=M&&m.get(M)||null,Ze=pe({...G&&typeof G=="object"?G:{},...c&&typeof c=="object"?c:{}});if(f&&(!Ze||Ze!==f)||l&&!bt({entry:c,restaurant:G,viewerCity:l}))return null;const et=te(G)||te(c),Pt=d&&et?xe(d,et):Number.POSITIVE_INFINITY,Rt=Math.max(0,L(c?.likes),L(c?.likesCount)),Gt=Math.max(0,L(c?.comments),L(c?.commentsCount)),Bt=Math.max(0,L(c?.visitors),L(c?.visitorCount),L(c?.visitorsCount),L(c?.views),L(c?.viewCount),L(c?.viewsCount),L(c?.reach),L(c?.reachCount),L(c?.impressions),L(c?.impressionsCount)),Ft=Math.max(0,L(c?.rating),L(c?.score),L(c?.stars),L(G?.rating),L(G?.score),L(G?.stars)),Ut=De(c?.createdAt||c?.updatedAt),Vt=String(c?.business||c?.restaurantName||G?.name||G?.restaurantName||"Best Spot").trim()||"Best Spot",tt=String(G?.bestSpotLogoUrl||G?.spotLogoUrl||G?.bestSpotLogo||G?.spotLogo||G?.logoUrl||G?.logo||G?.logoURL||c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.logo||c?.image||c?.url||"").trim(),on=M?de(M,tt,"avatar",!1):tt,nn=M?ne("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"}):ne("apps/menyra-social/index.html",{tab:"feed",post:X,source:"best-spot"});return{spotId:ze,postId:X,restaurantId:M,displayName:Vt,avatarUrl:on,profileUrl:nn,likes:Rt,comments:Gt,visitors:Bt,rating:Ft,distanceKm:Pt,createdAtMs:Ut,fallbackIndex:T}},v=(c={},T=0)=>{const M=String(c?.id||c?.restaurantId||"").trim();if(!M)return null;const X=String(c?.status||"").trim().toLowerCase();if(X==="archived"||X==="deleted"||X==="blocked"||X==="disabled")return null;const ze=pe(c);if(f&&(!ze||ze!==f)||l&&!bt({entry:c,restaurant:c,viewerCity:l}))return null;const G=te(c),Ze=d&&G?xe(d,G):Number.POSITIVE_INFINITY,et=Math.max(0,L(c?.likes),L(c?.likesCount),L(c?.likeCount),L(c?.socialLikes),L(c?.socialLikesCount),L(c?.followersCount),L(c?.followers)),Pt=Math.max(0,L(c?.comments),L(c?.commentsCount),L(c?.reviewCount),L(c?.reviews),L(c?.reviewsCount),L(c?.ratingsCount)),Rt=Math.max(0,L(c?.visitors),L(c?.visitorCount),L(c?.visitorsCount),L(c?.views),L(c?.viewCount),L(c?.viewsCount),L(c?.reach),L(c?.reachCount),L(c?.impressions),L(c?.impressionsCount),L(c?.ordersCount),L(c?.orders)),Gt=Math.max(0,L(c?.rating),L(c?.score),L(c?.stars)),Bt=De(c?.createdAt||c?.updatedAt||c?.truthUpdatedAt),Ft=String(c?.name||c?.restaurantName||c?.displayName||c?.businessName||"Best Spot").trim()||"Best Spot",Ut=String(c?.bestSpotLogoUrl||c?.spotLogoUrl||c?.bestSpotLogo||c?.spotLogo||c?.logoUrl||c?.logo||c?.logoURL||c?.image||c?.coverImage||"").trim(),Vt=de(M,Ut,"avatar",!1),tt=ne("apps/menyra-social/index.html",{r:M,tab:"profile",source:"best-spot"});return{spotId:M,postId:"",restaurantId:M,displayName:Ft,avatarUrl:Vt,profileUrl:tt,likes:et,comments:Pt,visitors:Rt,rating:Gt,distanceKm:Ze,createdAtMs:Bt,fallbackIndex:T}};if(i.forEach((c,T)=>{w(A(c,T))}),!i.length||S.size<Ht){let c=i.length+1e3;Array.from(m.values()).forEach(T=>{const M=v(T,c);c+=1,M&&(S.has(M.spotId)||w(M))})}const x=Array.from(S.values()).filter(c=>{if(!b.size)return!0;const T=String(c?.restaurantId||"").trim();return!T||!b.has(T)});if(!x.length)return[];const $=x.some(c=>Number.isFinite(c?.distanceKm))?x.filter(c=>Number.isFinite(c?.distanceKm)):x;if(!$.length)return[];const F=[...$].sort(vt).slice(0,Kr),Q=new Set(F.map(c=>c.spotId)),W=$.filter(c=>!Q.has(c.spotId)).sort((c,T)=>{const M=yt(c.distanceKm,T.distanceKm);return M!==0?M:vt(c,T)});return[...F,...W].slice(0,Ht).map((c,T)=>({ratingDisplay:(()=>{const M=L(c?.rating);if(M>0)return Math.max(1,Math.min(5,M)).toFixed(1);const X=Math.max(1,L(c?.likes)*1.2+L(c?.visitors)*.05+L(c?.comments)*.6);return(4.2+Math.min(.75,Math.log10(1+X)/4.5)).toFixed(1)})(),...c,rank:T+1,renderSignature:[c.spotId,c.postId,c.displayName,c.avatarUrl,String(T+1),String(c.rating||0),String(c.likes||0),String(c.visitors||0),Number(c.distanceKm).toFixed(3),String(c.createdAtMs||0)].join("|")}))},ur=(e={})=>dt(e)==="feed-fallback"?1:0,io=(e={},t={})=>{const r=yt(e.distanceKm,t.distanceKm);if(r!==0)return r;const o=ur(e)-ur(t);if(o!==0)return o;const n=!!e.isLive,i=!!t.isLive;return n!==i?n?-1:1:e.createdAtMs!==t.createdAtMs?t.createdAtMs-e.createdAtMs:e.fallbackIndex-t.fallbackIndex},fr=(e=[],t=[])=>{const r=Array.isArray(e)?e:[],o=Array.isArray(t)?t:[],n=r.length?r:o;if(!n.length)return[];const i=re(Ie()),s=Et(i),l=B(i),d=gt(),f=new Map;return n.forEach((m,b)=>{const S=Ve(m),w=S.storyRestaurantId;if(!w)return;const A=d.get(w)||null,v=s?sr({entry:m,restaurant:A,viewerCity:s}):rt({hasViewerCity:!1});if(!Gr(v))return;const x=te(A)||te(m),j=l&&x?xe(l,x):Number.POSITIVE_INFINITY,$=Xt(m),F=ft(m),Q=String(S.storyLabel||"").trim()||"Story",W=ve(w),c=de(w,String(S.logoSource||"").trim(),"thumb",!1),T={...m,storyId:w,restaurantId:w,storyLabel:Q,storyUrl:W,profileImageUrl:c,preview:F,scope:v,distanceKm:j,createdAtMs:$,isLive:!!m?.isLive,fallbackIndex:b},M=f.get(w);if(!M){f.set(w,T);return}io(T,M)<0&&f.set(w,T)}),Array.from(f.values()).sort(Fr).slice(0,Yr)},gr=({spots:e=[],stories:t=[]}={})=>cn({stories:t,spots:e}),ao=({spots:e=[],stories:t=[]}={})=>gr({spots:e,stories:t}).map(r=>{if(r.type==="spot"){const o=r?.spot||{};return["spot",String(o?.spotId||"").trim(),String(o?.postId||"").trim(),String(o?.displayName||"").trim(),String(o?.avatarUrl||"").trim(),String(o?.rank||"").trim()].join(":")}return`story:${Jt(r?.story||{})}`}).join(","),mr=async(e="")=>{const t=String(e||"");if(!t)return!1;try{if(y?.navigator?.clipboard?.writeText)return await y.navigator.clipboard.writeText(t),!0}catch{}if(!g?.body)return!1;const r=g.createElement("textarea");r.value=t,r.setAttribute("readonly","readonly"),r.style.position="fixed",r.style.opacity="0",r.style.pointerEvents="none",g.body.appendChild(r),r.select();let o=!1;try{o=!!g.execCommand?.("copy")}catch{}return r.remove(),o},St=(e,t="Link kopiert")=>{if(!(e instanceof HTMLElement))return;const r=e.querySelector("[data-feed-share-label]");if(!r)return;const o=e.dataset.shareDefaultLabel||r.textContent||"Share";e.dataset.shareDefaultLabel=o,r.textContent=t,e.classList.add("text-white"),e.classList.remove("text-white/70"),e._shareFeedbackTimer&&clearTimeout(e._shareFeedbackTimer),e._shareFeedbackTimer=q(()=>{r.textContent=o,e.classList.add("text-white/70"),e.classList.remove("text-white"),e._shareFeedbackTimer=null},1800)},so=(e={})=>{const t={post:e?.id||""},r=String(e?.restaurantId||(String(e?.ownerType||"").trim()==="restaurant"?e?.ownerId:"")||"").trim();return r?(t.r=r,t.tab="profile"):t.tab="feed",ne("apps/menyra-social/index.html",t)},co=(e="")=>{const t=String(e||"").trim();if(!t)return null;const r=a.restaurants.find(l=>String(l?.id||"").trim()===t)||null,o=String(a.userProfile?.restaurantId||"").trim(),n=o&&o===t,i=String(r?.name||r?.restaurantName||r?.displayName||r?.businessName||(n?a.userProfile?.name:"")||"").trim(),s=String(r?.logoUrl||r?.logo||r?.logoURL||(n?a.userProfile?.avatar:"")||"").trim();return{id:t,restaurantName:i,name:i,logoUrl:s,logo:s}},lo=(e="",t="")=>{const r=String(e||"").trim();if(!r||!y||!g)return;const o=co(r);if(o&&y.sessionStorage)try{y.sessionStorage.setItem(`${Ge}${r}`,JSON.stringify({restaurantId:r,meta:o,savedAt:Date.now()}))}catch{}const n=String(t||ve(r)||"").trim();if(!n||!g.head||Array.from(g.head.querySelectorAll("link[data-story-prefetch]")).find(l=>String(l?.getAttribute?.("href")||"").trim()===n))return;const s=g.createElement("link");s.rel="prefetch",s.href=n,s.as="document",s.crossOrigin="anonymous",s.dataset.storyPrefetch="1",g.head.appendChild(s)},uo=()=>{q(()=>{const e=g?.getElementById("postCommentInput");if(e instanceof HTMLElement){try{e.focus({preventScroll:!1})}catch{try{e.focus()}catch{}}try{e.scrollIntoView({block:"nearest",behavior:"smooth"})}catch{}if(typeof e.setSelectionRange=="function"){const t=String(e.value||"").length;try{e.setSelectionRange(t,t)}catch{}}}},90)},Se="mnyra_social_feed_viewer_location_v1",fo=14,pr=3,go=72,mo=620,po=4200,ho=12e4,bo=new Set(["xk","al","rs"]),yo=new Set(["city","town","village","hamlet","municipality"]),vo=new Map([["xk","Kosove"],["kosove","Kosove"],["kosova","Kosove"],["kosovo","Kosove"],["al","Shqiperi"],["shqiperi","Shqiperi"],["shqiperia","Shqiperi"],["albania","Shqiperi"],["rs","Serbi"],["serbi","Serbi"],["serbia","Serbi"],["srbija","Serbi"]]),So=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),Lo=["rruga","street","bulevard","boulevard","lagj","district","neighborhood","quarter","park","mall","plaza"],Lt=Object.freeze([{id:"prishtina",label:"Prishtina",lat:42.6629,lng:21.1655,aliases:["prishtine","prishtin","pristina"]},{id:"prizren",label:"Prizren",lat:42.2139,lng:20.7397,aliases:["prizr","prizreni"]},{id:"peja",label:"Peja",lat:42.6591,lng:20.2883,aliases:["peje","pec"]},{id:"gjakova",label:"Gjakova",lat:42.3803,lng:20.4308,aliases:["gjakove","djakova"]},{id:"ferizaj",label:"Ferizaj",lat:42.3706,lng:21.1553,aliases:["feri","ferizaji","uroshevac"]},{id:"gjilan",label:"Gjilan",lat:42.4635,lng:21.4699,aliases:["gjilani"]},{id:"mitrovica",label:"Mitrovica",lat:42.8914,lng:20.866,aliases:["mitrovice","mitro"]},{id:"vushtrria",label:"Vushtrria",lat:42.8231,lng:20.9675,aliases:["vushtrri"]},{id:"podujeva",label:"Podujeva",lat:42.9106,lng:21.193,aliases:["podujeve","podu"]},{id:"tirana",label:"Tirana",lat:41.3275,lng:19.8187,aliases:["tirane"],country:"Shqiperi"},{id:"kukes",label:"Kukes",lat:42.0769,lng:20.4219,aliases:["kukes albania"],country:"Shqiperi"},{id:"smederevo",label:"Smederevo",lat:44.6644,lng:20.9276,aliases:["smederevo serbia"],country:"Serbi"}]),wt=Object.freeze({xk:Object.freeze({minLat:41.85,maxLat:43.35,minLng:20,maxLng:21.85}),al:Object.freeze({minLat:39.55,maxLat:42.75,minLng:19,maxLng:21.1}),rs:Object.freeze({minLat:42.2,maxLat:46.3,minLng:18.7,maxLng:23.1})}),wo=Object.freeze({xk:Object.freeze(["prishtina","prishtine","prizren","peja","peje","gjakova","gjakove","ferizaj","gjilan","mitrovica","mitrovice","vushtrria","vushtrri","podujeva","podujeve"]),al:Object.freeze(["tirana","tirane","kukes","durres","vlore","shkoder","elbasan","fier","korce","sarande"]),rs:Object.freeze(["smederevo","beograd","belgrade","novi sad","nis","kragujevac","subotica","pancevo"])});let Ae=null,H=!1,ue="idle",Ye="",Te=null,se=null,fe="",Me=null,xt=0,ge=!1,_e=null,He=!1,hr="",Le=!1,ae=null,It=null,br=!1,kt=null;const ce=new Map,We=new Map,R=(e="")=>String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim(),Ct=(e="")=>{const t=R(e);return t==="current location"||t==="vendndodhja aktuale"||t==="trenutna lokacija"||t==="standort"||t==="aktueller standort"},Et=(e=null)=>{const t=String(e?.city||"").trim();if(t&&!Ct(t))return t;const r=String(e?.label||"").trim();return r&&!Ct(r)?r:""},we=(e="")=>{const t=R(e);return t&&So.get(t)||""},me=(e="")=>{const t=R(e);return t&&vo.get(t)||""},yr=(e=null)=>{const t=B(e);if(!t)return"";const r=Number(t.lat),o=Number(t.lng),n=(i=null)=>!!i&&r>=Number(i.minLat)&&r<=Number(i.maxLat)&&o>=Number(i.minLng)&&o<=Number(i.maxLng);return n(wt.xk)?"xk":n(wt.al)?"al":n(wt.rs)?"rs":""},xo=()=>{if(kt instanceof Map)return kt;const e=new Map,t=(r="",o="")=>{const n=R(r),i=we(o);!n||!i||e.set(n,i)};return Object.entries(wo).forEach(([r,o])=>{(Array.isArray(o)?o:[]).forEach(n=>t(n,r))}),Tt().forEach(r=>{const o=we(r?.countryCode||r?.country);o&&(t(r?.label,o),t(r?.city,o),(Array.isArray(r?.searchTerms)?r.searchTerms:[]).forEach(n=>t(n,o)))}),kt=e,e},Io=(...e)=>{const t=xo();for(const r of e){const o=we(r);if(o)return o;const n=R(r);if(!n)continue;const i=t.get(n);if(i)return i;const s=n.split(" ").filter(Boolean);for(const l of s){const d=t.get(l);if(d)return d}}return""},pe=(e=null)=>!e||typeof e!="object"?"":we(e?.countryCode||e?.country_code||e?.country||e?.geo?.countryCode||e?.geo?.country_code||e?.geo?.country||e?.coords?.countryCode||e?.coords?.country||e?.location?.countryCode||e?.location?.country||"")||Io(e?.country,e?.geo?.country,e?.coords?.country,e?.location?.country,e?.city,e?.geo?.city,e?.coords?.city,e?.location?.city,e?.label,e?.address,e?.location)||yr(e),te=(e=null)=>!e||typeof e!="object"?null:B(e)||B({lat:e?.latitude,lng:e?.longitude})||B({lat:e?.gpsLat,lng:e?.gpsLng})||B({lat:e?.geo?.lat,lng:e?.geo?.lng})||B({lat:e?.geo?.latitude,lng:e?.geo?.longitude})||B({lat:e?.coords?.lat,lng:e?.coords?.lng})||B({lat:e?.coords?.latitude,lng:e?.coords?.longitude})||B({lat:e?.location?.lat,lng:e?.location?.lng}),xe=(e=null,t=null)=>{const r=B(e),o=B(t);if(!r||!o)return Number.POSITIVE_INFINITY;const n=6371,i=A=>A*Math.PI/180,s=i(Number(o.lat)-Number(r.lat)),l=i(Number(o.lng)-Number(r.lng)),d=i(Number(r.lat)),f=i(Number(o.lat)),m=Math.sin(s/2),b=Math.sin(l/2),S=m*m+Math.cos(d)*Math.cos(f)*b*b,w=2*Math.atan2(Math.sqrt(S),Math.sqrt(1-S));return n*w},B=(e=null)=>{const t=Number(e?.lat??e?.latitude??e?.y),r=Number(e?.lng??e?.lon??e?.longitude??e?.x);return!Number.isFinite(t)||!Number.isFinite(r)?null:{lat:t,lng:r}},re=(e=null)=>{const t=B(e);if(!t)return null;const r=String(e?.label||e?.city||"").trim(),n=String(e?.city||"").trim()||(Ct(r)?"":r),i=String(e?.source||"").trim().toLowerCase(),s=pe({...e&&typeof e=="object"?e:{},lat:t.lat,lng:t.lng,label:r,city:n}),l=me(e?.country||e?.countryCode||e?.country_code||s)||me(s)||"";return{lat:t.lat,lng:t.lng,label:r,city:n,country:l,countryCode:s,source:i||"manual",savedAt:Number(e?.savedAt||Date.now())||Date.now()}},ko=()=>{if(!y?.localStorage)return null;try{const e=y.localStorage.getItem(Se);if(!e)return null;const t=re(JSON.parse(e));if(t)return t;try{y.localStorage.removeItem(Se)}catch{}return null}catch{try{y.localStorage.removeItem(Se)}catch{}return null}},Co=()=>{if(!y?.localStorage)return null;try{return y.localStorage.getItem(Se)!==null}catch{return null}},vr=(e=null)=>{if(y?.localStorage){if(!e){try{y.localStorage.removeItem(Se)}catch{}return}try{y.localStorage.setItem(Se,JSON.stringify(e))}catch{}}},Ie=()=>{const e=re(Ae),t=ko();if(t){if(Ae=t,typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return t}const r=Co();if(e&&r!==!1)return e;if(r===!1&&(Ae=null),typeof O!="function")return null;let o=null;try{o=O()}catch{}const n=re({...o&&typeof o=="object"?o:{},source:"gps-map"});return n?(Ae=n,vr(n),n):null},Eo=(e=null)=>{const t=re(e);if(!t)return!1;if(Ae=t,vr(t),typeof E=="function")try{E({lat:t.lat,lng:t.lng,label:t.label,city:t.city,source:t.source,savedAt:t.savedAt})}catch{}return!0},Sr=()=>{if(Te){try{clearTimeout(Te)}catch{}Te=null}},Lr=()=>{if(Sr(),se)try{se.abort()}catch{}Me=null,se=null,fe=""},wr=(e="",t=[])=>{const r=R(e);if(!r)return;const o=Array.isArray(t)?t:[];for(ce.set(r,o);ce.size>go;){const n=ce.keys().next().value;if(!n)break;ce.delete(n)}We.size>mo&&We.clear(),o.forEach(n=>{We.set(String(n?.id||"").trim().toLowerCase(),n)})},At=()=>{if(_e){try{clearTimeout(_e)}catch{}_e=null}},Qe=(e=!1)=>{const t=!!e,r=g?.documentElement||null,o=g?.body||null;r?.classList?.toggle?.("feed-location-gate-resolving",t),o?.classList?.toggle?.("feed-location-gate-resolving",t);try{const n=y?.__MENYRA_SOCIAL_SET_UI_CHROME_MODE__;t&&typeof n=="function"&&n("app");const i=y?.__MENYRA_SOCIAL_FORCE_UI_CHROME__;typeof i=="function"&&i()}catch{}},je=()=>{if(ae){if(typeof y?.cancelAnimationFrame=="function")try{y.cancelAnimationFrame(ae)}catch{}else try{clearTimeout(ae)}catch{}ae=null}},Ao=()=>{if(!y||!g)return null;const e=g.querySelector("main.app-main-scroll");if(!(e instanceof HTMLElement))return null;const t=y.getComputedStyle?.(e),r=String(t?.overflowY||t?.overflow||"").trim().toLowerCase(),o=r==="auto"||r==="scroll"||r==="overlay",n=Number(e.scrollHeight||0)-Number(e.clientHeight||0)>1;return!o||!n?null:e},To=({behavior:e="smooth"}={})=>{if(!y||!g)return!1;const t=g.getElementById("feedLocationGate");if(!(t instanceof HTMLElement))return!1;const r=t.querySelector(".feed-bento-pin-outline");if(!(r instanceof HTMLElement))return!1;const o=Ao(),n=o instanceof HTMLElement,i=Math.max(0,Math.round(parseFloat(y.getComputedStyle?.(r)?.top||"0")||0)),s=n?Math.round(Number(o.getBoundingClientRect().top||0)):0,l=n?Math.max(0,Number(o.scrollTop||0)):Math.max(0,Number(y.scrollY||y.pageYOffset||g?.documentElement?.scrollTop||0)),d=Math.round(Number(r.getBoundingClientRect().top||0)),f=Math.max(0,l+(d-(s+i)));if(Math.abs(f-l)<2)return!0;if(n){try{o.scrollTo({top:f,behavior:e})}catch{o.scrollTop=f}return!0}try{y.scrollTo({top:f,behavior:e})}catch{y.scrollTo(0,f)}return!0},xr=()=>{if(!Le)return;Le=!1,je();let e=0;const t=4,r=4,o=()=>{if(e+=1,To({behavior:e===1?"smooth":"auto"}),e>=t){je();return}ae=q(o,e===1?420:130)};if(typeof y?.requestAnimationFrame=="function"){let n=0;const i=()=>{ae=y.requestAnimationFrame(()=>{if(n+=1,n<r){i();return}ae=null,o()})};i();return}ae=q(()=>{ae=null,o()},80)},Ir=()=>{if(je(),typeof It=="function")try{It()}catch{}It=null},Mo=(e=null)=>{Ir()},kr=(e={})=>{const t=me(e?.countryCode||e?.country_code||"");if(t)return t;const r=me(e?.country||"");return r||(String(e?.source||"").trim().toLowerCase()==="local"?"Kosove":String(e?.country||"").trim())},Cr=({id:e="",label:t="",lat:r=null,lng:o=null,aliases:n=[],source:i="local",country:s="",metaLabel:l="",importance:d=0}={})=>{const f=B({lat:r,lng:o}),m=String(t||"").trim();if(!f||!m)return null;const b=String(i||"local").trim().toLowerCase(),S=we(s),w=me(s)||me(S)||(b==="local"?"Kosove":""),A=Array.from(new Set([m,w,S,...Array.isArray(n)?n:[]].map(v=>R(v)).filter(Boolean)));return Object.freeze({id:String(e||m).trim().toLowerCase(),label:m,city:m,lat:f.lat,lng:f.lng,source:b,country:w,countryCode:S,metaLabel:String(l||"").trim(),importance:Number(d)||0,searchTerms:A})},Tt=()=>Lt.map(e=>Cr(e)).filter(Boolean),Er=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return null;const r=Tt().find(o=>o.id===t)||null;return r||We.get(t)||null},_o=(e="")=>{const t=R(e);if(!t||/[0-9]/.test(t))return!1;const r=t.split(" ").filter(Boolean);return!r.length||r.length>3?!1:!r.some(o=>Lo.some(n=>o.startsWith(n)))},jo=(e={},t="")=>{if(!e||!t)return-1;const r=Array.isArray(e.searchTerms)?e.searchTerms:[];let o=-1;return r.forEach(n=>{if(!n)return;if(n===t){o=Math.max(o,420);return}if(n.startsWith(t)){o=Math.max(o,260-Math.max(0,n.length-t.length));return}const i=n.indexOf(t);i>=0&&(o=Math.max(o,170-i))}),o<0?-1:(String(e?.source||"").toLowerCase()==="remote"&&(o+=12+Math.round(Math.max(0,Number(e.importance||0)*10))),o)},$o=(...e)=>{const t=new Map;return e.forEach(r=>{(Array.isArray(r)?r:[]).forEach(o=>{if(!o||typeof o!="object")return;const n=`${R(o.label)}|${R(kr(o))}`;if(!n.trim())return;if(!t.has(n)){t.set(n,o);return}const i=t.get(n);String(i?.source||"").trim().toLowerCase()!=="local"&&t.set(n,o)})}),Array.from(t.values())},Oo=(e=[])=>Array.isArray(e)?e.map((t,r)=>{const o=t?.properties&&typeof t.properties=="object"?t.properties:{},n=B({lat:t?.geometry?.coordinates?.[1],lng:t?.geometry?.coordinates?.[0]}),i=String(o.name||o.city||o.locality||"").trim();if(!n||!i||!_o(i))return null;const s=we(o.countrycode||o.country_code||o.country||"");if(!s||!bo.has(s))return null;const l=R(o.osm_value||o.type||"");if(!yo.has(l))return null;const d=me(s)||"",m=[String(o.state||o.county||"").trim(),d].filter(Boolean).join(" · ");return Cr({id:`remote-${String(o.osm_id||`${i}-${s}-${r}`).trim().toLowerCase()}`,label:i,lat:n.lat,lng:n.lng,aliases:[o.city,o.state,o.county,d].filter(Boolean),source:"remote",country:s,metaLabel:m,importance:Number(o.importance||t?.importance||0)})}).filter(Boolean):[],No=async(e="")=>{const t=String(e||"").trim(),r=R(t);if(r.length<pr)return[];if(ce.has(r))return ce.get(r)||[];if(Me&&fe===r)return Me;if(Date.now()<xt)return[];const o=typeof y?.fetch=="function"?y.fetch.bind(y):null;if(!o)return[];if(se&&fe&&fe!==r)try{se.abort()}catch{}const n=typeof AbortController=="function"?new AbortController:null;let i=null;se=n,fe=r,n&&(i=q(()=>{try{n.abort()}catch{}},po));const s=new URL("https://photon.komoot.io/api/");s.searchParams.set("limit",String(fo)),s.searchParams.set("lang","en"),s.searchParams.set("osm_tag","place"),s.searchParams.set("q",t);const l=(async()=>{try{const d=await o(s.toString(),{method:"GET",signal:n?.signal,headers:{"Accept-Language":"sq,sr,de,en"}});if(!d?.ok)throw new Error(`photon_${Number(d?.status||0)}`);const f=await d.json(),m=Array.isArray(f?.features)?f.features:[],b=Oo(m);return wr(r,b),xt=0,b}catch(d){return String(d?.name||"")!=="AbortError"&&(xt=Date.now()+ho,wr(r,[])),[]}finally{if(i)try{clearTimeout(i)}catch{}se===n&&fe===r&&(se=null,fe="",Me=null)}})();return Me=l,l},Mt=(e="",t=6)=>{const r=R(e);if(r.length<2)return[];const o=Tt(),n=ce.get(r)||[];return $o(o,n).map(s=>{const l=jo(s,r);return l<0?null:{...s,score:l}}).filter(Boolean).sort((s,l)=>Number(l.score||0)-Number(s.score||0)||String(s.label||"").localeCompare(String(l.label||""),"de")).slice(0,Math.max(1,Number(t)||6))},zo=(e=[])=>{const t=Array.isArray(e)?e:[];return t.length?t.map(r=>`
      <button
        type="button"
        role="option"
        aria-selected="false"
        data-feed-city-suggestion="${p(r.id)}"
        class="feed-location-suggestion"
      >
        <span class="feed-location-suggestion__label">${p(r.label)}</span>
        <span class="feed-location-suggestion__meta">${p(kr(r))}</span>
      </button>
    `).join(""):""},oe=({clearContent:e=!0}={})=>{const t=g?.getElementById("feedLocationCitySuggestions"),r=g?.getElementById("feedLocationCityInput");t instanceof HTMLElement&&(t.classList.remove("feed-location-suggestions--open"),t.setAttribute("aria-hidden","true"),e&&(t.innerHTML="")),r instanceof HTMLElement&&r.setAttribute("aria-expanded","false")},Ar=(e="")=>{if(Sr(),H)return;const t=R(e);t.length<pr||ce.has(t)||(Te=q(async()=>{Te=null;const r=String(g?.getElementById("feedLocationCityInput")?.value||"").trim();if(R(r)!==t)return;await No(r);const o=String(g?.getElementById("feedLocationCityInput")?.value||"").trim();R(o)===t&&_t(o,{skipRemoteFetch:!0})},260))},_t=(e="",{skipRemoteFetch:t=!1}={})=>{const r=g?.getElementById("feedLocationCitySuggestions"),o=g?.getElementById("feedLocationCityInput");if(!(r instanceof HTMLElement)||!(o instanceof HTMLElement))return;if(H){oe();return}if(R(e).length<2){oe();return}const i=Mt(e,6);if(!i.length){oe({clearContent:!1}),t||Ar(e);return}r.innerHTML=zo(i),r.classList.add("feed-location-suggestions--open"),r.setAttribute("aria-hidden","false"),o.setAttribute("aria-expanded","true"),!t&&i.length<3&&Ar(e)},Tr=Object.freeze({en:Object.freeze({locale:"en",htmlLang:"en",searchPlaceholder:"Enter your city...",useLocationAriaLabel:"Use location",currentLocationLabel:"Current location",statusRequesting:"Requesting location...",statusDenied:"Location access was denied.",statusTimeout:"Location did not load in time. Please try again.",statusUnsupported:"Location access is not supported on this device.",statusError:"Location could not be determined.",statusUnsupportedHttps:"Location access requires HTTPS.",heroRailAriaLabel:"MNYRA city highlights",topSliderItems:Object.freeze(["DISCOVER SPOTS.","FIND OFFERS.","OPEN MENUS."]),topCityLine:"IN YOUR CITY.",heroTitleLines:Object.freeze([Object.freeze({before:"Your ",accent:"City",after:""}),Object.freeze({before:"in your ",accent:"Pocket",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Discover","your city."])}),Object.freeze({lines:Object.freeze(["Best","restaurants","& cafes."])}),Object.freeze({lines:Object.freeze(["Grocery","stores","& healthy."])}),Object.freeze({lines:Object.freeze(["Best","hotels","& motels."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" now."}),Object.freeze({before:"Your ",accent:"Feed.",after:""})]),description:"Discover daily deals, follow stories from your favorite spots, and stay up to date.",cardTitle:"Stories & Feed",cardDescription:"Never miss exclusive deals. See what's happening in your city through stories and discover fresh offers right away.",cardImageAlt:"Feed and stories",storiesAriaLabel:"Feed stories",postBrand:"MOKI'S",postMeta:"2 hours ago • New offer",offerPill:"-20% off lunch",previewFallback:"Live feed preview is loading."})}),sq:Object.freeze({locale:"sq",htmlLang:"sq",searchPlaceholder:"Shkruaj qytetin...",useLocationAriaLabel:"Perdor vendndodhjen",currentLocationLabel:"Vendndodhja aktuale",statusRequesting:"Po kerkohet vendndodhja...",statusDenied:"Leja e vendndodhjes u refuzua.",statusTimeout:"Vendndodhja nuk u mor me kohe. Provo perseri.",statusUnsupported:"Vendndodhja nuk mbeshtetet ne kete pajisje.",statusError:"Vendndodhja nuk u gjet.",statusUnsupportedHttps:"Vendndodhja kerkon HTTPS.",heroRailAriaLabel:"MNYRA highlights e qytetit",topSliderItems:Object.freeze(["ZBULO SPOTET.","GJEJ OFERTA.","HAP MENYTE."]),topCityLine:"NE QYTETIN TEND.",heroTitleLines:Object.freeze([Object.freeze({before:"",accent:"Qyteti",after:" yt"}),Object.freeze({before:"ne ",accent:"xhepin",after:" tend."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Zbulo","qytetin tend."])}),Object.freeze({lines:Object.freeze(["Me te mirat","restorante","& kafe."])}),Object.freeze({lines:Object.freeze(["Dyqane","ushqimore","& bio."])}),Object.freeze({lines:Object.freeze(["Me te mirat","hotele","& motele."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Live",after:" tani."}),Object.freeze({before:"",accent:"Feed-i",after:" yt."})]),description:"Zbulo ofertat e dites, ndiq story-t e spot-eve te preferuara dhe qendro gjithmone i perditesuar.",cardTitle:"Story & Feed",cardDescription:"Mos humb me ofertat ekskluzive. Shih menjehere ne story cfare po ndodh ne qytetin tend dhe zbulo ofertat e dites.",cardImageAlt:"Feed dhe story",storiesAriaLabel:"Story-t e feed-it",postBrand:"MOKI'S",postMeta:"Para 2 oresh • Oferte e re",offerPill:"-20% per dreke",previewFallback:"Parashikimi i feed-it po ngarkohet."})}),sr:Object.freeze({locale:"sr",htmlLang:"sr",searchPlaceholder:"Unesi svoj grad...",useLocationAriaLabel:"Koristi lokaciju",currentLocationLabel:"Trenutna lokacija",statusRequesting:"Trazi se lokacija...",statusDenied:"Pristup lokaciji je odbijen.",statusTimeout:"Lokacija nije ucitana na vreme. Pokusaj ponovo.",statusUnsupported:"Lokacija nije podrzana na ovom uredjaju.",statusError:"Lokacija nije mogla da se odredi.",statusUnsupportedHttps:"Pristup lokaciji zahteva HTTPS.",heroRailAriaLabel:"MNYRA gradski highlights",topSliderItems:Object.freeze(["OTKRIJ MESTA.","NADJI PONUDE.","OTVORI MENIJE."]),topCityLine:"U SVOM GRADU.",heroTitleLines:Object.freeze([Object.freeze({before:"Tvoj ",accent:"grad",after:""}),Object.freeze({before:"u tvom ",accent:"dzepu",after:"."})]),heroCards:Object.freeze([Object.freeze({lines:Object.freeze(["Otkrij","svoj grad."])}),Object.freeze({lines:Object.freeze(["Najbolji","restorani","& kafici."])}),Object.freeze({lines:Object.freeze(["Prodavnice","prehrane","& bio hrane."])}),Object.freeze({lines:Object.freeze(["Najbolji","hoteli","& moteli."])})]),socialBlock:Object.freeze({titleLines:Object.freeze([Object.freeze({before:"",accent:"Uzivo",after:" sada."}),Object.freeze({before:"Tvoj ",accent:"feed.",after:""})]),description:"Otkrij dnevne ponude, prati storije svojih omiljenih mesta i ostani uvek u toku.",cardTitle:"Storiji & feed",cardDescription:"Ne propusti ekskluzivne ponude. Odmah vidi sta se desava u tvom gradu kroz storije i otkrij nove dnevne ponude.",cardImageAlt:"Feed i storiji",storiesAriaLabel:"Storiji u feed-u",postBrand:"MOKI'S",postMeta:"Pre 2 sata • Nova ponuda",offerPill:"-20% na rucak",previewFallback:"Prikaz feed-a se ucitava."})})}),jt=(e="")=>{const t=String(e||"").trim().toLowerCase();if(!t)return"";const r=t.split(/[_-]/)[0];return["sq","al","alb"].includes(r)?"sq":["sr","rs","srb"].includes(r)?"sr":["en","gb","uk","us"].includes(r)?"en":""},Po=()=>{const e=y?.location;if(!e)return"";const t=["lang","locale","hl"],r=(s="")=>{const l=new URLSearchParams(String(s||""));for(const d of t){const f=String(l.get(d)||"").trim();if(f)return f}return""},o=r(String(e.search||"").replace(/^\?/,""));if(o)return o;const n=String(e.hash||"");if(n){const s=n.indexOf("?"),l=s>=0?n.slice(s+1):n.replace(/^#\/?/,""),d=r(l);if(d)return d}const i=String(e.pathname||"").split("/").map(s=>String(s||"").trim().toLowerCase()).filter(Boolean);for(let s=i.length-1;s>=0;s-=1){const l=i[s];if(!(!l||l.includes("."))&&jt(l))return l}return""},Ro=()=>{const e=jt(Po());if(e)return e;const t=Array.isArray(y?.navigator?.languages)?y.navigator.languages:[];return jt(String(t[0]||y?.navigator?.language||"").trim())||"en"},$e=()=>Tr[Ro()]||Tr.en,Go=()=>{const e=$e();return Ye||(ue==="requesting"?e.statusRequesting:ue==="denied"?e.statusDenied:ue==="timeout"?e.statusTimeout:ue==="unsupported"?e.statusUnsupported:ue==="error"?e.statusError:"")},Mr=()=>"feed-gate",_r=()=>!!g?.getElementById("feedLocationCityInput"),Bo=()=>{const e=String(g?.getElementById("feedView")?.dataset?.locationScreenMode||"").trim().toLowerCase();return e||String(g?.getElementById("feedLocationGate")?.dataset?.locationScreenMode||"").trim().toLowerCase()||Mr()},Fo=()=>{const e=g?.querySelector?.("[data-feed-gate-hero]"),t=g?.querySelector?.("[data-feed-gate-hero-rail]");if(!(e instanceof HTMLElement)||!(t instanceof HTMLElement))return;const r=Array.from(t.querySelectorAll("[data-feed-gate-hero-card]")).filter(i=>i instanceof HTMLElement);if(!r.length)return;const o=(i=0)=>{const s=Math.max(0,Math.min(r.length-1,Number(i)||0)),l=r[s],d=String(l?.getAttribute("data-feed-gate-hero-header-accent")||"").trim()||"#3f46e5";e.style.setProperty("--feed-gate-hero-accent",d),e.dataset.feedGateHeroIndex=String(s),r.forEach((f,m)=>{f.setAttribute("data-active",m===s?"true":"false")})},n=()=>{const i=r[0],s=Number(i?.clientWidth||0);return!Number.isFinite(s)||s<=0?Number(e.dataset.feedGateHeroIndex||0)||0:Math.round(t.scrollLeft/(s+8))};if(t.dataset.feedGateHeroBound!=="1"){let i=0;const s=()=>{if(i)return;const l=()=>{i=0,o(n())};if(typeof y?.requestAnimationFrame=="function"){i=y.requestAnimationFrame(l);return}i=q(l,16)};t.addEventListener("scroll",s,{passive:!0}),t.dataset.feedGateHeroBound="1"}o(n())},jr=(e="crosshair",t="w-5 h-5 relative z-10")=>{const r=String(e||"").trim().toLowerCase(),o=r==="check"||r==="loader-circle"?r:"crosshair",n=String(t||"").trim()||"w-5 h-5 relative z-10";return V(o,n,{id:"locateIcon","data-feed-location-current-icon":o})||`<i id="locateIcon" data-lucide="${p(o)}" data-feed-location-current-icon="${p(o)}" class="${p(n)}"></i>`},ke=()=>{const e=g?.getElementById("btnLocateMe"),t=g?.getElementById("locateIcon"),r=g?.getElementById("locatePulse"),o=g?.getElementById("feedLocationCityInput"),n=g?.getElementById("feedLocationStatus"),i=Ie(),s=!!re(i),l=H||ge;if(e instanceof HTMLButtonElement&&(e.disabled=l,e.classList.toggle("opacity-60",e.disabled),e.classList.toggle("cursor-not-allowed",e.disabled),e.classList.toggle("is-success",s&&!l),e.classList.toggle("is-loading",ge)),t instanceof HTMLElement){const d=ge?"loader-circle":s&&!H?"check":"crosshair",f=String(t.getAttribute("class")||"w-5 h-5 relative z-10").replace(/\banimate-spin\b/g,"").replace(/\s+/g," ").trim()||"w-5 h-5 relative z-10";if(String(t.getAttribute("data-feed-location-current-icon")||"").trim()!==d&&g){const m=g.createElement("template");m.innerHTML=jr(d,f).trim();const b=m.content.firstElementChild;(b instanceof HTMLElement||typeof SVGElement=="function"&&b instanceof SVGElement)&&(b.classList.toggle("animate-spin",l),t.replaceWith(b))}else t.classList.toggle("animate-spin",l)}if(r instanceof HTMLElement&&(r.classList.toggle("opacity-100",H),r.classList.toggle("opacity-0",!H)),o instanceof HTMLInputElement){o.disabled=H;const d=String(i?.label||i?.city||"").trim();d&&!o.value.trim()&&g?.activeElement!==o&&(o.value=d)}if(n instanceof HTMLElement){const d=Go();n.textContent=d,n.classList.toggle("hidden",!d)}Fo(),y?.lucide?.createIcons&&y.lucide.createIcons()},he=(e="idle",t="")=>{ue=String(e||"idle").trim().toLowerCase(),Ye=String(t||"").trim(),ke()},Oe=(e=null)=>{const t=re(e);if(!t)return!1;if(ge)return!0;if(H=!1,ue="granted",Ye="",Lr(),oe(),Eo(t),a.activeTab==="restaurants")return D({}),!0;const r=g?.getElementById("feedLocationGate"),n=Bo()==="location",s=String(g?.getElementById("feedView")?.dataset?.feedViewMode||"").trim().toLowerCase()==="feed",l=!n&&!s;if(!n){const d=g?.activeElement;if(d&&typeof d.blur=="function")try{d.blur()}catch{}}if(n||!l?(He=!1,Le=!1,je(),ge=!1,r?.classList?.remove?.("feed-location-gate--resolving"),Qe(!1)):(He=!1,Le=!0,ge=!0,r?.classList?.add?.("feed-location-gate--resolving"),Qe(!0)),ke(),n)return At(),!0;if(!l){At(),Qe(!1);const d=String(a?.activeTab||"").trim().toLowerCase();return(!d||d==="feed"||d==="home")&&D({activeTab:"feed"}),!0}return At(),_e=q(()=>{_e=null,ge=!1,r?.classList?.remove?.("feed-location-gate--resolving"),Qe(!1);const d=String(a?.activeTab||"").trim().toLowerCase();d&&d!=="feed"&&d!=="home"||(D({activeTab:"feed"}),Le=!0,xr())},360),!0},be=({fallbackCity:e=null,forceExact:t=!1}={})=>{const r=$e(),o=e&&typeof e=="object"?e:Er(e);if(o&&!t){Oe({lat:o.lat,lng:o.lng,label:o.label,city:o.city||o.label,country:o.country,countryCode:o.countryCode,source:"city-search"});return}const n=y?.navigator?.geolocation;if(y&&y.isSecureContext===!1){if(o){be({fallbackCity:o,forceExact:!1});return}he("unsupported",r.statusUnsupportedHttps);return}if(!n||typeof n.getCurrentPosition!="function"){if(o){be({fallbackCity:o,forceExact:!1});return}he("unsupported");return}if(H)return;H=!0,Lr(),oe(),he("requesting");const i=Date.now(),s=d=>{const f=Math.max(0,900-(Date.now()-i));f>0?q(d,f):d()},l=String(g?.getElementById("feedLocationCityInput")?.value||"").trim();n.getCurrentPosition(d=>{s(()=>{const f=B({lat:d?.coords?.latitude,lng:d?.coords?.longitude});if(!f){H=!1,he("error");return}Oe({lat:f.lat,lng:f.lng,label:l||r.currentLocationLabel,city:l||"",countryCode:yr(f),source:"gps"})})},d=>{s(()=>{if(H=!1,o){be({fallbackCity:o,forceExact:!1});return}const f=Number(d?.code);if(f===1){he("denied");return}if(f===3){he("timeout");return}he("error")})},{enableHighAccuracy:!0,timeout:1e4,maximumAge:0})},Uo=({id:e="",background:t="#3f46e5",headerAccent:r="#3f46e5",cardAccent:o="#bfdbfe",variant:n="hero",lines:i=[],accentLineIndex:s=-1}={},l=0)=>`
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
          ${i.map((d,f)=>{const m=p(String(d||"").trim());return m?`<span class="feed-gate-hero-card__headline-line">${f===s?`<span class="feed-gate-hero-card__headline-accent">${m}</span>`:m}</span>`:""}).join("")}
        </h3>
      </div>
    </article>
  `,Vo=(e=$e())=>{const t=e?.socialBlock||{};return`
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
    `},$r=(e=$e())=>{const t=Array.isArray(e?.heroTitleLines)?e.heroTitleLines:[],r=Array.isArray(e?.heroCards)?e.heroCards:[],o=[{id:"h0",background:"#00cce5",headerAccent:"#00cce5",cardAccent:"#cffafe",variant:"hero",lines:r[0]?.lines||["Discover","your city."],accentLineIndex:1},{id:"h1",background:"#0f172a",headerAccent:"#1e293b",cardAccent:"#818cf8",variant:"category",lines:r[1]?.lines||["Best","restaurants","& cafes."],accentLineIndex:1},{id:"h2",background:"#065f46",headerAccent:"#047857",cardAccent:"#6ee7b7",variant:"category",lines:r[2]?.lines||["Grocery","stores","& healthy."],accentLineIndex:1},{id:"h3",background:"#7c2d12",headerAccent:"#c2410c",cardAccent:"#fdba74",variant:"category",lines:r[3]?.lines||["Best","hotels","& motels."],accentLineIndex:1}];return`
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
          ${o.map((n,i)=>Uo(n,i)).join("")}
          <div class="feed-gate-hero-rail__endcap" aria-hidden="true"></div>
        </div>
        ${Vo(e)}
        <div class="feed-gate-hero-scroll-spacer" aria-hidden="true"></div>
      </section>
    `};function Do({mode:e=Mr(),bentoContentHtml:t="",showSearchControls:r=!0,showTopSection:o=!0}={}){const n=$e(),i=Ie(),s=String(i?.label||i?.city||"").trim(),l=String(e||"feed-gate").trim().toLowerCase()||"feed-gate",d=r!==!1,f=o!==!1,m=String(t||$r(n)).trim();return`
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
          ${f?`
            <div class="loc-top${d?"":" loc-top--searchless"}">
              <div class="loc-title">
                <div class="text-slider-wrapper">
                  ${(Array.isArray(n?.topSliderItems)?n.topSliderItems:[]).map(b=>`
                    <div class="text-slide-item">${p(String(b||""))}</div>
                  `).join("")}
                </div>
                <div>${p(String(n?.topCityLine||""))}</div>
              </div>
              ${d?`
                <div class="loc-search-wrap">
                  <div class="loc-input-row">
                    <span class="loc-pin">${V("map-pin","w-5 h-5")}</span>
                    <input id="feedLocationCityInput" type="text" inputmode="search" autocomplete="off" autocapitalize="words" spellcheck="false" data-feed-location-city-input aria-autocomplete="list" aria-controls="feedLocationCitySuggestions" aria-expanded="false" value="${p(s)}" placeholder="${p(String(n?.searchPlaceholder||""))}" class="loc-input" />
                    <div class="loc-request-wrap">
                      <button id="btnLocateMe" type="button" data-feed-location-request class="loc-request-btn" aria-label="${p(String(n?.useLocationAriaLabel||""))}">
                        ${jr("crosshair","w-5 h-5 relative z-10")}
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
              ${m}
            </div>
          </div>
        </div>
      </div>
    `}function qo(){return Rr()}function Or(){return Be()?`
      <div data-feed-composer-wrap class="app-content-inline mb-6">
        <button data-nav="upload" data-upload-intent="feed" class="w-full p-4 rounded-[2rem] bg-slate-900 text-white text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
          ${V("plus-square","w-4 h-4")} Neuer Feed Post
        </button>
      </div>
    `:""}function Ko(){return`
      <div class="flex-none w-[29%] sm:w-[120px] snap-start ml-5" style="${Ue({withMarginLeft:!0})}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black p-3 flex flex-col justify-between border border-white/10" style="${ut("background:linear-gradient(145deg,#111827 0%,#1f2937 52%,#000000 100%);padding:0.75rem;display:flex;flex-direction:column;justify-content:space-between;")}">
          <div class="relative z-10" style="position:relative;z-index:10;">
            <div class="absolute top-[26px] left-[13px] h-6 border-l-2 border-dashed border-white/80" style="position:absolute;top:26px;left:13px;height:1.5rem;border-left:2px dashed rgba(255,255,255,0.8);"></div>
            <div class="absolute top-[49px] left-[10px] w-2 h-2 rounded-full border border-white/70 bg-white/20 flex items-center justify-center shadow-sm" style="position:absolute;top:49px;left:10px;width:0.5rem;height:0.5rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
              <div style="width:0.25rem;height:0.25rem;border-radius:9999px;background:#fff;"></div>
            </div>
            <div class="bg-gradient-to-b from-white/20 to-white/5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 relative z-10 shadow-sm" style="position:relative;z-index:10;background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.06) 100%);">
              ${V("map-pin","w-3.5 h-3.5 text-white")}
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
              ${V("arrow-right","w-2.5 h-2.5")}
            </div>
          </div>
          <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" style="position:absolute;right:-1rem;bottom:-1rem;width:6rem;height:6rem;border-radius:9999px;background:rgba(255,255,255,0.05);filter:blur(24px);pointer-events:none;z-index:0;"></div>
        </div>
      </div>
    `}function Yo(e={},t=0){const r=String(e?.spotId||e?.postId||"").trim(),o=p(r),n=o?`data-best-spot-avatar="${o}"`:"",i=o?`data-img-key="best-spot-avatar:${o}"`:"",s=o?`data-best-spot-name="${o}"`:"",l=String(e?.profileUrl||ne("apps/menyra-social/index.html",{tab:"feed",source:"best-spot"})).trim(),d=String(e?.restaurantId||"").trim(),f=String(e?.avatarUrl||"").trim(),m=String(e?.displayName||"Best Spot").trim()||"Best Spot",b=t<4,S=String(e?.ratingDisplay||"4.8").trim()||"4.8",w=b?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',A='<svg viewBox="0 0 24 24" width="8" height="8" aria-hidden="true" focusable="false" style="display:block;color:#fbbf24;fill:currentColor;stroke:currentColor;stroke-width:1.5;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',v=f?`<img src="${p(h(f,"small"))}" ${w} decoding="async" width="120" height="208" ${n} ${i} class="absolute inset-0 w-full h-full object-cover" />`:`<div class="absolute inset-0 flex items-center justify-center text-white/85" style="background:linear-gradient(145deg,#1f2937 0%,#0f172a 60%,#020617 100%);">${V("map-pin","w-6 h-6")}</div>`,x=d?`<button type="button" data-profile-business="${p(m)}" data-profile-id="${p(d)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer text-left" style="${Ue()}">`:`<a href="${p(l)}" data-best-spot-item="${o}" class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${Ue()}">`,j=d?"</button>":"</a>";return`
      ${x}
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${ut()}">
          ${v}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0) 100%);"></div>
          <div class="absolute top-2 left-2" style="position:absolute;top:0.5rem;left:0.5rem;z-index:12;">
            <div class="flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/30 px-1.5 py-0.5 rounded-md shadow-sm">
              ${A}
              <span class="text-[9px] font-bold text-white pt-[1px]">${p(S)}</span>
            </div>
          </div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="p-1 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-sm">
              ${V("arrow-right","w-3 h-3")}
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${s}>${p(m)}</h3>
          </div>
        </div>
      ${j}
    `}function Ho(e={},t=0,r=""){const o=ft(e),n=t<5;if(o.kind==="video"&&o.src){const i=n?'preload="auto" fetchpriority="high"':'preload="metadata" fetchpriority="low"',s=o.poster?`poster="${p(h(o.poster,"small"))}"`:"",l=r?`data-story-preview-id="${p(r)}"`:"";return`
        <video src="${p(o.src)}" ${s} ${i} data-story-preview-video ${l} autoplay muted loop playsinline draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;"></video>
      `}if(o.src){const i=n?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
        <img src="${p(h(o.src,"small"))}" ${i} decoding="async" draggable="false" class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="pointer-events:none;" />
      `}return`
      <div class="absolute inset-0 flex items-center justify-center text-white/80" style="background:linear-gradient(145deg,#334155 0%,#1e293b 52%,#020617 100%);">
        ${V("camera","w-7 h-7")}
      </div>
    `}function Nr(e,t=0){const r=Ve(e),o=r.storyRestaurantId;if(!o)return"";const n=String(r.truthSource||"canonical").trim().toLowerCase(),s=n==="feed-fallback"?ne("apps/menyra-social/index.html",{r:o,tab:"profile",source:"story-fallback"}):ve(o),l=String(r.storyLabel||"").trim()||"Restaurant",d=String(r.logoSource||"").trim(),f=de(o,d,"thumb",!1),m=o?p(o):"",b=m?`data-story-logo="${m}"`:"",S=m?`data-img-key="story-logo:${m}"`:"",w=m?`data-story-border="${m}"`:"",A=m?`data-story-name="${m}"`:"",v=m?`data-story-item="${m}"`:"",x=`data-story-truth="${p(n)}"`,j=`data-story-render-sig="${p(Jt(e))}"`,$=t<6?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';return`
      <a href="${s}" ${v} data-story-url="${p(s)}" ${x} ${j} class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${Ue()}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${ut()}">
          ${Ho(e,t,o)}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.2) 100%);"></div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm" ${w} style="padding:2px;background:linear-gradient(135deg,#f59e0b 0%,#db2777 100%);">
              <img src="${p(f)}" ${$} decoding="async" width="28" height="28" ${b} ${S} class="w-full h-full rounded-full border-[1.5px] border-black/60 object-cover bg-white" style="border:1.5px solid rgba(0,0,0,0.6);" />
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${A}>${p(l)}</h3>
          </div>
        </div>
      </a>
    `}function $t(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=fr(e,o),i=dr(t,r,lr(n,e,o)),l=gr({spots:i,stories:n}).map((d,f)=>d.type==="spot"?Yo(d.spot,f):Nr(d.story,f)).join("");return`
      <div data-spot-story-track class="flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5" style="${eo()}">
        ${Ko()}
        ${l||'<div class="flex items-center text-slate-400 text-xs font-bold uppercase px-2">Keine Spots vorhanden</div>'}
        <div class="flex-none w-1" aria-hidden="true"></div>
      </div>
    `}function Xe(e,t){const r=e.id?String(e.id):"",o=r?`data-post-like-count="${p(r)}"`:"",n=r?`data-post-comment-count="${p(r)}"`:"",i=r?`data-feed-id="${p(r)}"`:'data-feed-id=""',s=r?`data-feed-logo="${p(r)}"`:"",l=r?`data-img-key="feed-logo:${p(r)}"`:"",d=r?`data-img-key="feed-hero:${p(r)}"`:"",f=`data-feed-render-sig="${p(Zt(e))}"`,m=t<2,b=m?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"',S=m?'loading="eager"':'loading="lazy" fetchpriority="low"',w=a.restaurants.find(T=>T.id===(e.restaurantId||e.ownerId))||{},A=w.logoUrl||w.logo||e.logo||"",v=de(e.restaurantId||e.ownerId,A,"avatar"),x=h(e.image,"medium",{stableKey:r?`feed-hero:${r}`:""}),j=p(`${h(e.image,"small")} 480w, ${x} 768w, ${h(e.image,"large")} 1280w`),$="(max-width: 640px) 100vw, 600px",F=e.poster?h(e.poster,"medium",{stableKey:r?`feed-hero-poster:${r}`:""}):x,Q=e.isVideo&&e.videoUrl?`<video src="${p(e.videoUrl)}" poster="${p(F)}" autoplay muted loop playsinline preload="none" ${d} class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000"></video>`:`<img src="${p(x)}" srcset="${j}" sizes="${$}" ${b} ${d} decoding="async" class="w-full h-full block object-cover group-hover:scale-105 transition-transform duration-1000" />`,W=e.restaurantId?String(ve(e.restaurantId,e.isVideo&&e.videoUrl&&r?{postId:r}:{})||"").trim():"",c=W?`<a href="${p(W)}" data-feed-post-open="${p(e.restaurantId)}" data-story-url="${p(W)}" aria-label="Stories von ${p(e.business)} ansehen" class="block w-full h-full">${Q}</a>`:Q;return`
    <div class="group feed-card" ${i} ${f}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button data-profile-business="${p(e.business)}" data-profile-id="${p(e.restaurantId||"")}" class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            <img src="${p(v)}" ${S} ${s} ${l} decoding="async" width="48" height="48" class="w-full h-full object-contain bg-white" />
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${p(e.business)} ${V("star","w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${p(e.location)}</p>
          </div>
        </button>
        ${V("more-horizontal","w-5 h-5 text-slate-400")}
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
                  ${V("heart","w-5 h-5")} <span ${o} class="text-[10px] font-black">${p(e.likes)}</span>
                </button>
                <button type="button" data-feed-post-comment="${p(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  ${V("message-circle","w-5 h-5")} <span ${n} class="text-[10px] font-black">${p(e.comments)}</span>
                </button>
              </div>
              <button type="button" data-feed-post-share="${p(r)}" class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                ${V("share-2","w-4 h-4")} <span data-feed-share-label class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Ot(e){return e.length?e.slice(0,10).map((t,r)=>Xe(t,r)).join(""):'<div class="text-center py-20 text-slate-400 font-bold text-xs uppercase">Keine Posts vorhanden</div>'}function zr(e){const t=g?.getElementById("feedList");if(!t)return!1;if(!e.length){const l=Ot(e);return t.innerHTML!==l?(t.innerHTML=l,!0):!1}const r=Array.from(t.querySelectorAll("[data-feed-id]")),o=r.map(l=>l.dataset.feedId||""),n=e.map(l=>String(l.id||""));if(o.join("|")===n.join("|")){let l=!1;return e.forEach((d,f)=>{const m=r[f];if(!m)return;const b=Zt(d);if(String(m.getAttribute("data-feed-render-sig")||"").trim()===b)return;const w=g.createElement("template");w.innerHTML=Xe(d,f);const A=w.content.firstElementChild;A&&(m.replaceWith(A),l=!0)}),e.forEach(J),e.forEach(Y),l}const i=new Map;r.forEach(l=>i.set(l.dataset.feedId||"",l));const s=g.createDocumentFragment();return e.forEach((l,d)=>{const f=String(l.id||""),m=f?i.get(f):null;if(m)i.delete(f),s.appendChild(m);else{const b=g.createElement("template");b.innerHTML=Xe(l,d);const S=b.content.firstElementChild;S&&s.appendChild(S)}}),t.replaceChildren(s),e.forEach(J),e.forEach(Y),!0}function Wo(e){if(!K||!(e instanceof K)||e.dataset.storyBoomerangBound==="1")return;e.dataset.storyBoomerangBound="1",e.defaultMuted=!0,e.muted=!0,e.setAttribute("muted",""),e.autoplay=!0,e.loop=!1,e.controls=!1,e.disablePictureInPicture=!0,e.preload="metadata",e.playsInline=!0,e.setAttribute("playsinline",""),e.setAttribute("webkit-playsinline","");const t=String(y?.navigator?.userAgent||"").toLowerCase(),r=!!y?.matchMedia?.("(pointer: coarse)")?.matches,o=/android|iphone|ipad|ipod|mobile/.test(t),n=!!y?.matchMedia?.("(display-mode: standalone)")?.matches||!!y?.navigator?.standalone,i=r||o||n;let s=1.35;const l=.05;ee.set(e,{previewStart:l,previewEnd:s,active:!1,forceLightweightLoop:i});const d=(b=!1)=>{const S=ee.get(e);S&&(S.active=!!b,S.previewEnd=s,e.dataset.storyPreviewActive=b?"1":"0")},f=()=>{const b=Number(e.duration||0);if(!Number.isFinite(b)||b<=.05){s=1.35;const w=ee.get(e);w&&(w.previewEnd=s);return}s=Math.max(l+.45,Math.min(b,1.45));const S=ee.get(e);S&&(S.previewEnd=s)},m=()=>{if(ee.get(e)?.active){f();{e.currentTime>=s&&(e.currentTime=l+.01,e.paused&&e.play().catch(()=>{}));return}}};e.addEventListener("loadedmetadata",f),e.addEventListener("timeupdate",m),e.addEventListener("stalled",()=>{ee.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("waiting",()=>{ee.get(e)?.active&&e.play().catch(()=>{})}),e.addEventListener("ended",()=>{ee.get(e)?.active&&(e.currentTime=l,e.play().catch(()=>{}))});try{e.currentTime=l}catch{}d(!1)}function Je(e,{reset:t=!1}={}){if(!K||!(e instanceof K))return;const r=ee.get(e);if(r){if(t||!Number.isFinite(e.currentTime)||e.currentTime>r.previewEnd+.05)try{e.currentTime=r.previewStart}catch{}r.active=!0,e.dataset.storyPreviewActive="1",e.play().catch(()=>{try{!e.dataset.storyPreviewFrameSeek&&Number(e.currentTime||0)<=.01&&(e.dataset.storyPreviewFrameSeek="1",e.currentTime=Math.max(.05,Number(r.previewStart||0)))}catch{}Qo()})}}function Qo(){if(Qt||!g)return;Qt=!0;const e=()=>{g.querySelectorAll("video[data-story-preview-video]").forEach(t=>{String(t.dataset.storyPreviewVisible||"0")==="1"&&Je(t)})};g.addEventListener("touchend",e,{once:!0,passive:!0}),g.addEventListener("pointerdown",e,{once:!0,passive:!0})}function Nt(e){if(!K||!(e instanceof K))return;const t=ee.get(e);t&&(t.active=!1),e.dataset.storyPreviewActive="0";try{e.pause()}catch{}}function Xo(){return!y?.IntersectionObserver||!K?null:Fe||(Fe=new y.IntersectionObserver(e=>{e.forEach(t=>{const r=t.target;if(!(r instanceof K))return;const n=(t.isIntersecting?Number(t.intersectionRatio||0):0)>=.3;r.dataset.storyPreviewVisible=n?"1":"0",n?Je(r):Nt(r)})},{threshold:[0,.15,.3,.55,.85,1]}),Fe)}function Jo(){!g||Wt||(Wt=!0,g.addEventListener("visibilitychange",()=>{const e=g.getElementById("storiesRow");if(!e)return;const t=Array.from(e.querySelectorAll("video[data-story-preview-video]"));if(g.hidden){t.forEach(r=>Nt(r));return}t.forEach(r=>{String(r.dataset.storyPreviewVisible||"0")==="1"&&Je(r)})}),y?.addEventListener?.("pagehide",()=>{const e=g.getElementById("storiesRow");e&&e.querySelectorAll("video[data-story-preview-video]")?.forEach?.(t=>Nt(t))}))}function Zo(e=null){if(!g)return;const r=(e&&typeof e.querySelector=="function"?e:g).querySelector?.("[data-spot-story-track]");if(!(r instanceof HTMLElement)||r.dataset.edgeSwipeGuardBound==="1")return;r.dataset.edgeSwipeGuardBound="1";let o=!1,n=0,i=0,s=0;const l=m=>{const b=m.touches?.[0];b&&(o=!0,n=b.clientX,i=b.clientY,s=Number(r.scrollLeft||0))},d=m=>{if(!o)return;const b=m.touches?.[0];if(!b)return;const S=b.clientX-n,w=b.clientY-i;if(Math.abs(S)<=Math.abs(w))return;const A=Math.max(0,Number(r.scrollWidth||0)-Number(r.clientWidth||0)),v=s<=.5||Number(r.scrollLeft||0)<=.5,x=Math.abs(A-Number(r.scrollLeft||0))<=.5,j=S>0&&v,$=S<0&&x;(j||$)&&m.preventDefault()},f=()=>{o=!1};r.addEventListener("touchstart",l,{passive:!0}),r.addEventListener("touchmove",d,{passive:!1}),r.addEventListener("touchend",f,{passive:!0}),r.addEventListener("touchcancel",f,{passive:!0})}function Ne(e=null){const t=e&&typeof e.querySelectorAll=="function"?e:g?.getElementById("storiesRow");if(!t)return;const r=Array.from(t.querySelectorAll?.("video[data-story-preview-video]")||[]),o=Xo();o&&o.disconnect(),r.forEach(n=>{Wo(n),o?o.observe(n):Je(n,{reset:!0})}),Zo(t),Jo()}function Pr(e,t=[],{fallbackFeedPosts:r=[],fallbackStories:o=[]}={}){const n=g?.getElementById("storiesRow");return n?(n.innerHTML=$t(e,t,{fallbackFeedPosts:r,fallbackStories:o}),Ne(n),!0):!1}function en(e){if(!g||!e)return!1;const t=g.getElementById("feedList");if(!t)return!1;const r=e.querySelector("[data-feed-composer-wrap]");if(!Be())return r?(r.remove(),!0):!1;if(r)return!1;const n=g.createElement("template");n.innerHTML=Or();const i=n.content.firstElementChild;return i?(t.parentNode?.insertBefore(i,t),!0):!1}function tn(){const e=g?.getElementById("feedView");if(!e)return!1;if(String(e.dataset.feedViewMode||"feed").trim().toLowerCase()!=="feed")return zt(),ke(),y?.lucide?.createIcons&&y.lucide.createIcons(),!0;const o=(Array.isArray(a?.feedPosts)?a.feedPosts:[]).filter(x=>a.feedCategory==="all"||x.category===a.feedCategory).sort((x,j)=>(u(j.createdAt)?.getTime()||0)-(u(x.createdAt)?.getTime()||0)),n=(Array.isArray(a.stories)?a.stories:[]).filter(x=>er(x)),{feedPosts:i,stories:s}=cr({feedPosts:o,stories:n}),l=s,d=fr(l,l),f=dr(i,i,lr(d,l)),m=g.getElementById("storiesRow"),b=ao({spots:f,stories:d});let S=!1;if(m){const x=!!m.querySelector("[data-spot-story-track]");(I()!==b||!x)&&(Pr(l,i,{fallbackFeedPosts:i,fallbackStories:l}),k(b),S=!0),d.forEach(F=>{P(F),U(F)});const j=`motion:${b}|${d.length}`;(S||String(m.dataset.storyPreviewMotionSig||"")!==j)&&(Ne(m),m.dataset.storyPreviewMotionSig=j)}const w=en(e),A=zr(i);ye(i),zt();const v=ro(i);return v!==hr&&(hr=v,nt(i)),(S||w||A)&&y?.lucide?.createIcons&&y.lucide.createIcons(),!0}function Rr(){const e=!!re(Ie()),t=e?"feed":"feed-gate";let r=$r();if(e){const i=(Array.isArray(a?.feedPosts)?a.feedPosts:[]).filter(m=>a.feedCategory==="all"||m.category===a.feedCategory).sort((m,b)=>(u(b.createdAt)?.getTime()||0)-(u(m.createdAt)?.getTime()||0)),s=(Array.isArray(a.stories)?a.stories:[]).filter(m=>er(m)),{feedPosts:l,stories:d}=cr({feedPosts:i,stories:s}),f=d;r=`
        <div id="storiesRow" class="app-content-inline pt-6">
          ${$t(f,l,{fallbackFeedPosts:l,fallbackStories:f})}
        </div>
        ${Or()}
        <div id="feedList" class="app-content-inline py-4 space-y-12">
          ${Ot(l)}
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
      ${Do({mode:e?"feed-stage":"feed-gate",bentoContentHtml:r,showSearchControls:!e,showTopSection:!e})}
    </div>
  `}function rn(){if(!g||br)return;br=!0;const e=()=>_r();g.addEventListener("input",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&_t(o.value)}),g.addEventListener("pointerdown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&g?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}}),g.addEventListener("touchstart",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(o instanceof HTMLInputElement&&g?.activeElement!==o){t.preventDefault();try{o.focus({preventScroll:!0})}catch{o.focus()}}},{passive:!1}),g.addEventListener("focusin",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");o instanceof HTMLInputElement&&_t(o.value)}),g.addEventListener("focusout",t=>{if(!e())return;const r=t.target;!(r instanceof Element)||!r.closest("[data-feed-location-city-input]")||q(()=>{const n=g?.activeElement;n instanceof Element&&(n.closest("[data-feed-location-city-input]")||n.closest("[data-feed-city-suggestion]"))||oe()},120)}),g.addEventListener("change",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;const n=String(o.value||"").trim();if(!n)return;const i=Mt(n,1)[0];if(!i||R(n)!==R(i.label))return;oe(),Oe({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||be({fallbackCity:i})}),g.addEventListener("keydown",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-location-city-input]");if(!(o instanceof HTMLInputElement))return;if(t.key==="Escape"){oe();return}if(t.key!=="Enter")return;const n=Mt(o.value,1)[0];if(!n)return;t.preventDefault(),o.value=n.label,oe(),Oe({lat:n.lat,lng:n.lng,label:n.label,city:n.city||n.label,country:n.country,countryCode:n.countryCode,source:"city-search"})||be({fallbackCity:n})}),g.addEventListener("click",t=>{if(!e())return;const r=t.target;if(!(r instanceof Element))return;const o=r.closest("[data-feed-city-suggestion]");if(o){t.preventDefault(),t.stopPropagation();const i=Er(o.getAttribute("data-feed-city-suggestion")||"");if(i){const s=g?.getElementById("feedLocationCityInput");s instanceof HTMLInputElement&&(s.value=i.label),oe(),Oe({lat:i.lat,lng:i.lng,label:i.label,city:i.city||i.label,country:i.country,countryCode:i.countryCode,source:"city-search"})||be({fallbackCity:i})}return}r.closest("[data-feed-location-request]")&&(t.preventDefault(),t.stopPropagation(),be({forceExact:!0}))})}function zt(){rn(),_r()&&ke();const e=g?.getElementById("feedView");if(!e){Ir();return}if(Mo(e),String(e.dataset.feedViewMode||"").trim().toLowerCase()==="feed"?(xr(),Ne()):(Le=!1,je()),e.dataset.bound==="true"){Ne(),ke();return}const r=()=>String(e.dataset.feedViewMode||"").trim().toLowerCase()!=="feed",o=n=>{if(r()||!(n instanceof Element))return;const i=n.closest("[data-story-item]")||n.closest("[data-feed-post-open]");!(i instanceof Element)||String(i.getAttribute("data-story-truth")||"").trim().toLowerCase()==="feed-fallback"||lo(i.getAttribute("data-story-item")||i.getAttribute("data-feed-post-open")||"",i.getAttribute("data-story-url")||i.getAttribute("href")||"")};e.addEventListener("pointerdown",n=>{o(n.target)},{passive:!0}),e.addEventListener("touchstart",n=>{o(n.target)},{passive:!0}),e.addEventListener("click",n=>{const i=n.target;if(!(i instanceof Element))return;const s=i.closest("[data-story-item]");if(s){o(s);return}const l=i.closest("[data-feed-post-like]");if(l){const S=l.dataset.feedPostLike||"";S&&Ee(S);return}const d=i.closest("[data-feed-post-comment]");if(d){const S=d.dataset.feedPostComment||"",w=tr(S);if(w){const v=d.closest("[data-feed-id]")?.querySelector?.(`[data-img-key="feed-hero:${S}"]`)||null,x=String(v?.currentSrc||v?.getAttribute?.("src")||"").trim();Promise.resolve(Ce(w,{previewImageEl:v,previewImageSrc:x})).then(()=>{uo()})}return}const f=i.closest("[data-feed-post-share]");if(f){const S=f.dataset.feedPostShare||"",w=tr(S);if(!w)return;const A=so(w),v=String(w.business||"Menyra").trim()||"Menyra",x=[v,String(w.content||w.caption||"").trim()].filter(Boolean).join(`
`);y?.navigator?.share?y.navigator.share({title:v,text:x,url:A}).then(()=>{St(f,"Geteilt")}).catch(async j=>{if(String(j?.name||"").trim()==="AbortError")return;const $=await mr(A);St(f,$?"Kopiert":"Link")}):mr(A).then(j=>{St(f,j?"Kopiert":"Link")});return}const m=i.closest("[data-nav]");if(m){const S=m.dataset.nav;if(S){if(S==="favorites"&&!String(a.user?.uid||"").trim()){Z("Bitte registrieren oder einloggen, um Favoriten zu nutzen.");return}const w=S==="upload"?{upload:z(m.dataset.uploadIntent||"",a.upload)}:{},A=S==="favorites"?"profile":S,v=S==="favorites"?"favorites":S==="profile"?"profile":a.profileTopTab;if(S==="profile"&&typeof C=="function"){a.chatSettingsOpen=!1,a.chatListScope="inbox",a.chatThreadMenuId="",a.settingsView="main",a.selectedBusiness=null,a.postModal={open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},a.likesModal={open:!1,postId:"",animate:!1},a.leadModal={open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},a.customerModal={open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},C({showBack:!1,topTab:"profile"});return}D({activeTab:A,profileTopTab:v,drawerOpen:!1,chatSettingsOpen:!1,chatListScope:"inbox",chatThreadMenuId:"",settingsView:"main",selectedBusiness:null,profileView:null,profileModal:{open:!1,profile:null},postModal:{open:!1,post:null,commentText:"",replyTo:null,loading:!1,animate:!1,sending:!1},likesModal:{open:!1,postId:"",animate:!1},leadModal:{open:!1,mode:"create",lead:null,status:"",loading:!1,deleting:!1,actionsOpen:!1,logoFile:null,logoPreview:"",bestSpotLogoFile:null,bestSpotLogoPreview:"",coords:null,locations:[]},customerModal:{open:!1,mode:"edit",customer:null,status:"",loading:!1,logoFile:null,logoPreview:""},...w})}return}const b=i.closest("[data-profile-business]");b&&ie({id:b.dataset.profileId||"",name:b.dataset.profileBusiness||""},{showBack:!0})}),Ne(),ke(),e.dataset.bound="true"}return{renderHomeView:qo,renderFeedView:Rr,renderStoryItem:Nr,renderStoriesRow:$t,renderFeedItem:Xe,renderFeedList:Ot,patchFeedList:zr,patchStoriesRow:Pr,updateFeedDom:tn,bindFeedDelegation:zt}}function Vr(a={}){return String(a.url||a.mediaUrl||a.media?.[0]?.url||a.media?.[0]?.thumbUrl||a.imageUrl||a.image||a.photoUrl||a.pictureUrl||"").trim()}function Dr(a={}){const u=String(a.media?.[0]?.type||a.mediaType||a.type||"").trim().toLowerCase();return a.isVideo===!0||u==="video"||u.startsWith("video/")}function ln(a,u={},I=""){return{id:a,url:Vr(u),type:u.type||"square",title:u.title||"",caption:u.caption||"",createdAt:u.createdAt,likes:u.likesCount??u.likes??0,comments:u.commentsCount??u.comments??0,isVideo:Dr(u),ownerType:"user",ownerId:I||""}}function yn(a,u={},I=""){return{id:a,url:Vr(u),type:u.type||"square",title:u.title||"",caption:u.caption||"",createdAt:u.createdAt,likes:u.likesCount??u.likes??0,comments:u.commentsCount??u.comments??0,isVideo:Dr(u),ownerType:"restaurant",ownerId:I||"",restaurantId:I||""}}function qr(a=[]){return(Array.isArray(a)?a:[]).map(u=>{const I=String(u?.restaurantId||u?.id||"").trim(),k=u?.isLive?"1":"0",_=String(u?.truthSource||u?.storyTruthSource||u?.storyTruth||"").trim().toLowerCase()||"canonical",N=String(u?.mediaType||u?.type||"").trim().toLowerCase(),P=String(u?.videoUrl||u?.imageUrl||u?.mediaUrl||u?.embedUrl||u?.url||"").trim(),U=u?.createdAt?.seconds!==void 0?`${u.createdAt.seconds}:${Number(u.createdAt?.nanoseconds)||0}`:String(u?.createdAt||u?.updatedAt||"").trim();return`${I}|${k}|${_}|${N}|${P}|${U}`}).join(",")}function vn({posts:a=[],force:u=!1,fastMode:I=!1,allowFeedFallback:k=!1,buildStoriesFromFeed:_,currentSignature:N=""}={}){if(!I||!k)return{updated:!1,signature:N,stories:[]};if(!Array.isArray(a)||!a.length)return{updated:!1,signature:N,stories:[]};if(typeof _!="function")return{updated:!1,signature:N,stories:[]};const P=_(a);if(!P.length)return{updated:!1,signature:N,stories:[]};const U=qr(P);return!u&&N===U?{updated:!1,signature:N,stories:[]}:{updated:!0,signature:U,stories:P}}const dn=new Map([["xk","xk"],["kosove","xk"],["kosova","xk"],["kosovo","xk"],["al","al"],["shqiperi","al"],["shqiperia","al"],["albania","al"],["rs","rs"],["serbi","rs"],["serbia","rs"],["srbija","rs"]]),un=Object.freeze({xk:"Kosove",al:"Shqiperi",rs:"Serbi"});function fn(a=""){return String(a||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s-]/g," ").replace(/\s+/g," ").trim()}function gn(a=""){const u=fn(a);return u&&dn.get(u)||""}function le(a,u){const I=Number(a),k=Number(u);return!Number.isFinite(I)||!Number.isFinite(k)||Math.abs(I)<1e-6&&Math.abs(k)<1e-6?null:Math.abs(I)<=90&&Math.abs(k)<=180?{lat:I,lng:k}:Math.abs(I)<=180&&Math.abs(k)<=90?{lat:k,lng:I}:null}function Dt(a={}){return!a||typeof a!="object"?null:le(a.lat,a.lng)||le(a.latitude,a.longitude)||le(a.gpsLat,a.gpsLng)||le(a.geo?.lat,a.geo?.lng)||le(a.geo?.latitude,a.geo?.longitude)||le(a.coords?.lat,a.coords?.lng)||le(a.coords?.latitude,a.coords?.longitude)||le(a.location?.lat,a.location?.lng)}function Sn({state:a=null,firebaseApi:u={},constants:I={},visibilityApi:k={},utilityApi:_={}}={}){const N=typeof u.collectionFn=="function"?u.collectionFn:null,P=typeof u.queryFn=="function"?u.queryFn:null,U=typeof u.orderByFn=="function"?u.orderByFn:null,Y=typeof u.limitFn=="function"?u.limitFn:null,J=typeof u.getDocsFn=="function"?u.getDocsFn:null,ye=typeof k.isForceHiddenUidFn=="function"?k.isForceHiddenUidFn:(()=>!1),nt=typeof k.isForceHiddenHandleFn=="function"?k.isForceHiddenHandleFn:(()=>!1),Yt=typeof k.isForceHiddenBusinessEntityFn=="function"?k.isForceHiddenBusinessEntityFn:(()=>!1),it=typeof k.isPublicBusinessRecordFn=="function"?k.isPublicBusinessRecordFn:(()=>!0),at=typeof _.formatRelativeFn=="function"?_.formatRelativeFn:(h=>String(h||"")),Pe=typeof _.toDateSafeFn=="function"?_.toDateSafeFn:(h=>h);function V(h){const O=String(h||"").trim();if(!O)return!0;const E=String(a?.userProfile?.restaurantId||"").trim();if(E&&O===E)return!0;if(ye(O)||nt(O))return!1;const z=(a?.restaurants||[]).find(D=>String(D?.id||"")===O)||null;return z?it(z):!0}function p(h){if(!h)return 0;try{return typeof h?.toDate=="function"?h.toDate()?.getTime?.()||0:typeof h=="number"?Number.isFinite(h)?h:0:h instanceof Date?h.getTime()||0:Pe(h)?.getTime?.()||0}catch{return 0}}function ne(h="",O=""){const E=String(h||"").trim();if(!E||!(a?.postEntityMap instanceof Map)||!a.postEntityMap.size)return null;const z=String(O||"").trim();let D=null,Z=-1;return a.postEntityMap.forEach(C=>{if(!C||String(C?.id||"").trim()!==E)return;const ie=String(C?.restaurantId||(C?.ownerType==="restaurant"?C?.ownerId:"")||C?.rid||"").trim(),Ce=z&&ie===z?1e6:0,Ee=[C?.caption,C?.content,C?.url,C?.image,C?.title].reduce((y,K)=>String(K||"").trim()?y+1:y,0),q=Math.max(p(C?.updatedAt),p(C?.updatedAtClient),p(C?.createdAtClient),p(C?.createdAt)),g=Ce+q+Ee*10;(!D||g>Z)&&(D=C,Z=g)}),D}function ve(h={}){const O=String(h?.rid||h?.restaurantId||"").trim();if(Yt({id:O,restaurantId:O,...h||{}})||!V(O))return null;const E=ne(h?.id,O),z=(a?.restaurants||[]).find(Be=>Be?.id===O)||{},D=Dt(z)||Dt(h)||Dt(E),Z=gn(z?.countryCode||z?.country_code||z?.country||h?.countryCode||h?.country_code||h?.country||E?.countryCode||E?.country),C=Z?un[Z]||"":String(z?.country||h?.country||E?.country||"").trim(),ie=h?.thumbUrl||h?.mediaUrl||h?.media?.[0]?.thumbUrl||h?.media?.[0]?.url||"",Ce=h?.logoUrl||h?.logo||h?.logoURL||"",Ee=String(E?.content||E?.caption||h?.caption||h?.content||h?.captionShort||"").trim(),q=String(E?.image||E?.url||h?.imageUrl||ie||"").trim(),g=String(h?.id||E?.id||"").trim(),y=String(E?.mediaType||h?.mediaType||h?.media?.[0]?.type||"").trim().toLowerCase(),K=String(E?.url||h?.mediaUrl||h?.media?.[0]?.url||"").trim(),Ge=y==="video"||h?.isVideo===!0||/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(K),st=Ge?K:"",ct=String(h?.thumbUrl||h?.media?.[0]?.thumbUrl||E?.thumbUrl||"").trim();return{id:g,restaurantId:O,isVideo:Ge,videoUrl:st,poster:ct,business:h?.businessName||h?.restaurantName||z?.name||z?.restaurantName||"Business",logo:z?.logoUrl||z?.logo||Ce||"",location:h?.city||z?.city||"",country:C,countryCode:Z,lat:D?.lat??null,lng:D?.lng??null,content:Ee,image:q,likes:Number(h?.likesCount??h?.likes??E?.likes??0)||0,comments:Number(h?.commentsCount??h?.comments??E?.comments??0)||0,time:at(Pe(E?.createdAt||h?.createdAt)),createdAt:E?.createdAt||h?.createdAt,updatedAt:h?.updatedAt||E?.updatedAt||E?.updatedAtClient||h?.createdAt,category:h?.postType||"food",isLive:h?.isLive||!1,ownerType:"restaurant",ownerId:O,truthSource:"feed-projection",canonicalPath:String(h?.canonicalPath||(O&&g?`restaurants/${O}/socialPosts/${g}`:"")).trim()}}function de(h=[]){return qr(h||[])}async function Re(h){const O=String(h||"").trim();if(!O||!u.db||!N||!J)return[];try{const E=N(u.db,"users",O,"posts");let z=null;try{const C=[U("createdAt","desc")];Y&&I.fastLimits?.userPosts&&C.push(Y(I.fastLimits.userPosts));const ie=P?P(E,...C):E;z=await J(ie)}catch{const ie=Number(I.fastLimits?.userPosts)||24;z=P&&Y?await J(P(E,Y(ie))):await J(E)}const D=[];z?.forEach?.(C=>D.push({id:C.id,...C.data()}));const Z=D.map(C=>ln(C.id,{...C,url:C.url||C.mediaUrl||C.media?.[0]?.url||"",isVideo:C.isVideo??C.media?.[0]?.type==="video"},O)).filter(C=>C.url);return sn(a,Z)}catch{return[]}}return{canShowFeedRestaurantId:V,normalizeFeedPost:ve,buildStoriesRowSignature:de,loadUserPostsForUser:Re}}function mn({posts:a=[],toDateSafe:u}={}){if(!Array.isArray(a)||typeof u!="function")return 0;let I=0;return a.forEach(k=>{const _=u(k?.createdAt)?.getTime?.()||0;_>I&&(I=_)}),I}function Ln({posts:a=[],extraMeta:u={},toDateSafe:I,writeCache:k,feedCacheKey:_,feedFallbackLimit:N=0}={}){if(!Array.isArray(a)||typeof k!="function"||!_)return;const P=mn({posts:a,toDateSafe:I}),U=Math.max(0,Number(N)||0),Y=U>0?a.slice(0,U):a.slice();k(_,Y,{latestTs:P,...u})}export{ln as a,qr as b,bn as c,hn as d,Sn as e,yn as n,sn as p,vn as r,Ln as s};
