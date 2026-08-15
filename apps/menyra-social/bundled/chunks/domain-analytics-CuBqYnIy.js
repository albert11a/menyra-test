const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/firebase-config-BOk6-WYE.js","chunks/vendor-firebase-D7Ks7H8l.js"])))=>i.map(i=>d[i]);
import{_ as se}from"./domain-auth-Aq-4Vdvh.js";const xe=Object.freeze(["business_profile_view","profile_contact_click","post_impression","post_click","post_like","post_share","menu_open","category_open","product_view","product_like","qr_scan","call_waiter_click","order_started","order_completed","feed_impression","feed_click"]),$e=new Set(xe),Ie=Object.freeze(["feed","restaurants","search","map","qr","external","direct","other"]),Ae=new Set(Ie),Te=Object.freeze(["phone","address","map","hours","social"]),Ce=new Set(Te),me=Object.freeze(["business_profile_view","menu_open","qr_scan"]);function De(e=""){return $e.has(String(e||"").trim())}function J(e=""){const t=String(e||"").trim().toLowerCase();return t?Ae.has(t)?t:t==="home"?"feed":t==="restaurant"||t==="marketplace"?"restaurants":t==="table"||t==="table-qr"||t==="qr-code"?"qr":t==="link"||t==="share"||t==="referrer"?"external":"other":"direct"}function fe(e=""){const t=String(e||"").trim().toLowerCase();return Ce.has(t)?t:""}function z(e="",{prefix:t=""}={}){const r=String(e??"").trim();if(!r)return"";const n=r.replace(/[.~*/[\]#$]/g,"_").replace(/\s+/g,"_").slice(0,120);return n?t?`${t}${n}`:n:""}function ye(e="",t=0){const r=Math.max(0,Math.trunc(Number(t)||0)),n=z(e);return n?n.startsWith("t")?n:`t${n}`:r>0?`t${r}`:""}function N(e=new Date){const t=e instanceof Date?e:new Date(e);if(Number.isNaN(t.getTime()))return"";const r=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${r}-${n}-${a}`}function Ee(e=new Date){const t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?"0":String(t.getHours())}function C(e="",t=200){return String(e??"").trim().slice(0,t)}function V(e,t=0){const r=Number(e);return Number.isFinite(r)?r:t}function Ne(e="",t={},{now:r=new Date,sessionId:n="",userId:a=""}={}){const s=String(e||"").trim();if(!De(s))return null;const o=C(t.businessId,180);if(!o)return null;const i={name:s,businessId:o,sessionId:C(n,120),day:N(r),hour:Math.max(0,Math.min(23,Math.trunc(V(Ee(r),0))))},c={userId:C(a||t.userId,180),source:J(t.source),postId:C(t.postId,180),productId:C(t.productId,180),productName:C(t.productName,160),menuId:C(t.menuId,180),categoryId:C(t.categoryId,120),categoryName:C(t.categoryName,120),contactKind:fe(t.contactKind),tableId:ye(t.tableId,t.tableNumber),orderId:C(t.orderId,180)};Object.entries(c).forEach(([u,d])=>{d&&(i[u]=d)});const m=V(t.value,0);m>0&&(i.value=Math.round(m*100)/100);const _=Math.max(0,Math.trunc(V(t.quantity,0)));if(_>0&&(i.quantity=_),t.isUnique===!0&&(i.isUnique=!0),Array.isArray(t.items)){const u=t.items.map(d=>({productId:C(d?.productId||d?.itemId||d?.id,180),name:C(d?.name,160),quantity:Math.max(1,Math.trunc(V(d?.quantity,1))),revenue:Math.max(0,Math.round(V(d?.revenue,0)*100)/100)})).filter(d=>d.productId).slice(0,60);u.length&&(i.items=u)}return i}function Me(e=null){if(!e||!e.name||!e.businessId)return[];const t=[],r=(o,i=1)=>t.push({path:o,n:i}),n=(o,i)=>t.push({path:o,set:i});r(["counters",e.name],1),e.isUnique&&me.includes(e.name)&&r(["uniques",e.name],1);const a=String(Math.max(0,Math.min(23,Math.trunc(Number(e.hour)||0)))),s=ye(e.tableId,e.tableNumber);switch(e.name){case"business_profile_view":{r(["profileSources",J(e.source)],1);break}case"profile_contact_click":{const o=fe(e.contactKind);o&&r(["contacts",o],1);break}case"post_impression":case"post_click":case"post_like":case"post_share":{const o=z(e.postId);if(o){const i=e.name==="post_impression"?"impressions":e.name==="post_click"?"clicks":e.name==="post_like"?"likes":"shares";r(["posts",o,i],1)}break}case"category_open":{const o=z(e.categoryId);o&&(r(["categories",o,"opens"],1),e.categoryName&&n(["categories",o,"name"],e.categoryName));break}case"product_view":case"product_like":{const o=z(e.productId);o&&(r(["products",o,e.name==="product_view"?"views":"likes"],1),e.productName&&n(["products",o,"name"],e.productName));break}case"qr_scan":{r(["hourly",a,"qrScans"],1),s&&r(["tables",s,"qrScans"],1);break}case"call_waiter_click":{r(["hourly",a,"waiterCalls"],1),s&&r(["tables",s,"waiterCalls"],1);break}case"order_started":{r(["orders","started"],1);break}case"order_completed":{r(["orders","completed"],1),r(["hourly",a,"ordersCompleted"],1),r(["orders",J(e.source)==="qr"?"qr":"external"],1);const o=Math.max(0,Number(e.value)||0);o>0&&r(["orders","revenue"],Math.round(o*100)/100);const i=Math.max(0,Math.trunc(Number(e.quantity)||0));i>0&&r(["orders","itemCount"],i),s&&r(["tables",s,"ordersCompleted"],1),(Array.isArray(e.items)?e.items:[]).forEach(c=>{const m=z(c.productId);if(!m)return;r(["products",m,"orders"],1),r(["products",m,"quantity"],Math.max(1,Math.trunc(Number(c.quantity)||1)));const _=Math.max(0,Number(c.revenue)||0);_>0&&r(["products",m,"revenue"],Math.round(_*100)/100),c.name&&n(["products",m,"name"],c.name)});break}}return t}function Oe(e={},t=[],r=n=>n){return(Array.isArray(t)?t:[]).forEach(n=>{const a=Array.isArray(n?.path)?n.path.map(c=>String(c||"").trim()).filter(Boolean):[];if(!a.length)return;let s=e;for(let c=0;c<a.length-1;c+=1){const m=a[c];(!s[m]||typeof s[m]!="object")&&(s[m]={}),s=s[m]}const o=a[a.length-1];if(Object.prototype.hasOwnProperty.call(n,"set")){s[o]=n.set;return}const i=Number(n?.n);!Number.isFinite(i)||i===0||(s[o]=r(i))}),e}const ie="mnyra_analytics_session_v1",he="mnyra_analytics_dedupe_v1",qe=2500,be=300,X=600,l={initialized:!1,state:null,windowObj:null,documentObj:null,queue:[],flushTimer:null,flushing:!1,sessionId:"",dedupe:{day:"",keys:[]},dedupeSet:new Set,observerSnapshot:null,intersectionObserver:null,firebasePromise:null,disabled:!1};function ne(e){try{return e?.sessionStorage||null}catch{return null}}function je(){try{if(typeof crypto<"u"&&crypto.randomUUID)return crypto.randomUUID()}catch{}return`s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}function _e(){if(l.sessionId)return l.sessionId;const e=ne(l.windowObj);let t="";try{t=String(e?.getItem(ie)||"").trim()}catch{}if(!t){t=je();try{e?.setItem(ie,t)}catch{}}return l.sessionId=t,t}function Pe(){const e=ne(l.windowObj),t=N(new Date);let r=null;try{r=JSON.parse(e?.getItem(he)||"null")}catch{}(!r||r.day!==t||!Array.isArray(r.keys))&&(r={day:t,keys:[]}),l.dedupe=r,l.dedupeSet=new Set(r.keys)}function Le(){const e=ne(l.windowObj);try{e?.setItem(he,JSON.stringify({day:l.dedupe.day,keys:l.dedupe.keys.slice(-X)}))}catch{}}function oe(e=""){const t=String(e||"").trim();if(!t)return!1;const r=N(new Date);return l.dedupe.day!==r&&(l.dedupe={day:r,keys:[]},l.dedupeSet=new Set),l.dedupeSet.has(t)?!1:(l.dedupeSet.add(t),l.dedupe.keys.push(t),l.dedupe.keys.length>X&&(l.dedupe.keys=l.dedupe.keys.slice(-X),l.dedupeSet=new Set(l.dedupe.keys)),Le(),!0)}function M(){return l.state||{}}function Fe(){const e=M().userProfile||{};return String(e.restaurantId||e.staffRestaurantId||"").trim()}function Ke(){const e=M().userProfile||{};return String(e.role||"").trim().toLowerCase()==="ceo"?!0:(Array.isArray(e.roles)?e.roles:[]).some(n=>String(n||"").trim().toLowerCase()==="ceo")}function Re(e=""){const t=String(e||"").trim();return!(!t||t===Fe()||Ke())}function Ve(){return String(M().user?.uid||"").trim()}async function ze(){return l.firebasePromise||(l.firebasePromise=Promise.all([se(()=>import("./firebase-config-BOk6-WYE.js"),__vite__mapDeps([0,1])),se(()=>import("./vendor-firebase-D7Ks7H8l.js").then(e=>e.U),[])]).then(([e,t])=>{if(!e?.db)throw new Error("analytics-firebase-db-unavailable");return{db:e.db,firestore:t}}).catch(e=>{throw l.firebasePromise=null,e})),l.firebasePromise}function ge(){if(l.flushTimer||!l.queue.length)return;const e=l.windowObj;typeof e?.setTimeout=="function"&&(l.flushTimer=e.setTimeout(()=>{l.flushTimer=null,G()},qe))}async function G(){if(l.flushing||!l.queue.length||l.disabled)return;l.flushing=!0;const e=l.queue.splice(0,l.queue.length);try{const{db:t,firestore:r}=await ze(),{collection:n,doc:a,writeBatch:s,serverTimestamp:o,increment:i}=r,c=new Map,m=s(t);let _=0;e.forEach(u=>{if(_>=400)return;const d=a(n(t,"restaurants",u.businessId,"analyticsEvents")),{__retried:k,...w}=u;m.set(d,{...w,createdAt:o()}),_+=1;const S=`${u.businessId}::${u.day}`;c.has(S)||c.set(S,{businessId:u.businessId,day:u.day,patch:{date:u.day}}),Oe(c.get(S).patch,Me(u),A=>i(A))}),c.forEach(({businessId:u,day:d,patch:k})=>{_>=480||(k.updatedAt=o(),m.set(a(t,"restaurants",u,"analyticsDaily",d),k,{merge:!0}),_+=1)}),_>0&&await m.commit()}catch(t){try{const r=e.filter(n=>n.__retried!==!0).map(n=>({...n,__retried:!0}));l.queue.unshift(...r.slice(0,be))}catch{}console.warn("[mnyra][analytics] flush failed",t)}finally{l.flushing=!1,l.queue.length&&ge()}}function I(e="",t={}){try{if(l.disabled)return!1;const r=String(t?.businessId||"").trim();if(!Re(r)||t?.onceKey&&!oe(`${t.onceKey}`))return!1;const n=me.includes(String(e||"").trim())?oe(`u:${e}:${r}`):!1,a=Ne(e,{...t,isUnique:n},{now:new Date,sessionId:_e(),userId:Ve()});return a?(l.queue.length>=be&&l.queue.shift(),l.queue.push(a),ge(),!0):!1}catch(r){return console.warn("[mnyra][analytics] track failed",r),!1}}function P(e=M()){return String(e?.profileView?.profile?.restaurantId||"").trim()}function U(e=M()){const t=e?.profileView||{},r=t.routePayload&&typeof t.routePayload=="object"?t.routePayload:{},n=String(t.menuAccessSource||r.menuAccessSource||e?.profileAccessSource||"").trim().toLowerCase(),a=Math.max(0,Math.trunc(Number(t.tableNumber??r.tableNumber??e?.profileTableNumber??0)||0));return{menuAccessSource:n,tableNumber:a}}function Be(e="",t=M()){const{menuAccessSource:r,tableNumber:n}=U(t);if(r==="qr"||n>0)return"qr";const a=String(e||"").trim().toLowerCase();if(a==="feed"||a==="home")return"feed";if(a==="restaurants"||a==="travel"||a==="shopping")return"restaurants";if(a==="search")return"search";if(a==="map")return"map";if(!a){try{const s=String(l.documentObj?.referrer||"").trim(),o=String(l.windowObj?.location?.host||"").trim();if(s&&o&&!s.includes(o))return"external"}catch{}return"direct"}return"other"}function Ue(e=M()){const t=P(e);return{activeTab:String(e?.activeTab||"").trim().toLowerCase(),profileBusinessId:t,profileTopTab:String(e?.profileTopTab||"").trim().toLowerCase(),menuDetailKey:e?.menuDetail?.open?`${String(e.menuDetail.item?.id||e.menuDetail.itemId||"").trim()}`:"",checkoutOpen:!!e?.shopCart?.checkoutOpen,confirmationAt:Number(e?.shopCart?.confirmation?.createdAt||0)}}function Ye(e,t,r){if(!t.profileBusinessId||t.profileBusinessId===e.profileBusinessId)return;const n=Be(e.activeTab==="profile"?"":e.activeTab,r),{tableNumber:a}=U(r);I("business_profile_view",{businessId:t.profileBusinessId,source:n,tableNumber:a}),n==="qr"&&I("qr_scan",{businessId:t.profileBusinessId,source:"qr",tableNumber:a,onceKey:`qr:${t.profileBusinessId}:${a}`}),n==="feed"&&I("feed_click",{businessId:t.profileBusinessId,source:"feed"})}function Qe(e,t,r){if(!t.profileBusinessId)return;const n=new Set(["menu","cart","favorites"]),a=e.profileBusinessId===t.profileBusinessId&&n.has(e.profileTopTab);if(!(t.profileTopTab==="menu")||a)return;const{menuAccessSource:o,tableNumber:i}=U(r);I("menu_open",{businessId:t.profileBusinessId,source:o==="qr"||i>0?"qr":"direct",tableNumber:i})}function He(e,t,r){if(!t.menuDetailKey||t.menuDetailKey===e.menuDetailKey)return;const n=r?.menuDetail||{},a=n.item&&typeof n.item=="object"?n.item:{},s=String(n.restaurantId||a.restaurantId||P(r)||"").trim();if(!s)return;const{menuAccessSource:o,tableNumber:i}=U(r);I("product_view",{businessId:s,productId:a.id||n.itemId||t.menuDetailKey,productName:a.name||a.title||"",source:o==="qr"||i>0?"qr":"direct"})}function We(e,t,r){if(!t.checkoutOpen||e.checkoutOpen)return;const n=r?.shopCart||{},a=String(n.restaurantId||"").trim();if(!a)return;const s=Math.max(0,Math.trunc(Number(n.tableNumber||0)||0));I("order_started",{businessId:a,source:s>0||String(n.serviceMode||"").toLowerCase()==="table"?"qr":"direct",tableNumber:s})}function Je(){if(l.intersectionObserver)return l.intersectionObserver;const e=l.windowObj;return!e||typeof e.IntersectionObserver!="function"?null:(l.intersectionObserver=new e.IntersectionObserver(t=>{t.forEach(r=>{if(!r.isIntersecting||r.intersectionRatio<.5)return;const n=r.target;l.intersectionObserver?.unobserve(n);try{Xe(n)}catch{}})},{threshold:[.5]}),l.intersectionObserver)}function Xe(e){const t=M(),r=String(e.getAttribute("data-feed-post-open")||"").trim();if(r){I("feed_impression",{businessId:r,source:"feed",onceKey:`fi:${r}`});return}const n=String(e.getAttribute("data-feed-post-like")||"").trim();if(n){const s=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(i=>String(i?.id||"").trim()===n),o=String(s?.restaurantId||"").trim();o&&(I("post_impression",{businessId:o,postId:n,source:"feed",onceKey:`pi:${n}`}),I("feed_impression",{businessId:o,source:"feed",onceKey:`fi:${o}`}));return}const a=String(e.getAttribute("data-open-post")||"").trim();if(a){const s=P(t);s&&I("post_impression",{businessId:s,postId:a,source:"direct",onceKey:`pi:${a}`})}}function Ge(){const e=l.documentObj,t=Je();if(!e||!t)return;e.querySelectorAll("[data-feed-post-open], [data-feed-post-like], [data-open-post]").forEach(n=>{n.__mnyraAnalyticsObserved||(n.__mnyraAnalyticsObserved=!0,t.observe(n))})}function Ze(e){const t=String(e?.getAttribute?.("href")||"").toLowerCase();return t?t.startsWith("tel:")?"phone":t.includes("maps.google")||t.includes("google.com/maps")||t.startsWith("geo:")?"map":t.includes("instagram.com")||t.includes("facebook.com")||t.includes("tiktok.com")||t.includes("wa.me")||t.includes("whatsapp.com")?"social":"":""}function et(e){const t=M(),r=u=>e?.closest?.(u)||null,n=r("[data-feed-post-open]");if(n){const u=String(n.getAttribute("data-feed-post-open")||"").trim();u&&(I("feed_click",{businessId:u,source:"feed"}),I("post_click",{businessId:u,source:"feed"}));return}const a=r("[data-feed-post-like]");if(a){const u=String(a.getAttribute("data-feed-post-like")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(w=>String(w?.id||"").trim()===u),k=String(d?.restaurantId||"").trim();k&&u&&I("post_like",{businessId:k,postId:u,source:"feed"});return}const s=r("[data-feed-post-share]");if(s){const u=String(s.getAttribute("data-feed-post-share")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(w=>String(w?.id||"").trim()===u),k=String(d?.restaurantId||"").trim();k&&u&&I("post_share",{businessId:k,postId:u,source:"feed"});return}const o=r("[data-open-post]");if(o){const u=P(t),d=String(o.getAttribute("data-open-post")||"").trim();u&&d&&I("post_click",{businessId:u,postId:d,source:"direct"});return}const i=r("[data-menu-card-like]");if(i){const u=P(t),d=String(i.getAttribute("data-menu-card-like")||"").trim();u&&d&&I("product_like",{businessId:u,productId:d,source:"direct"});return}const c=r("[data-business-menu-category]");if(c){const u=P(t),d=String(c.getAttribute("data-business-menu-category")||"").trim();u&&d&&I("category_open",{businessId:u,categoryId:d,categoryName:String(c.textContent||"").trim().slice(0,80)});return}if(r('[data-action="kellner"]')){const u=P(t),{tableNumber:d}=U(t);u&&I("call_waiter_click",{businessId:u,tableNumber:d,source:d>0?"qr":"direct"});return}const _=r("a[href]");if(_){const u=P(t);if(!u)return;const d=Ze(_);d&&I("profile_contact_click",{businessId:u,contactKind:d})}}function At(){try{if(!l.initialized||l.disabled)return;const e=M(),t=Ue(e),r=l.observerSnapshot||{activeTab:"",profileBusinessId:"",profileTopTab:"",menuDetailKey:"",checkoutOpen:!1,confirmationAt:0};l.observerSnapshot=t,Ye(r,t,e),Qe(r,t,e),He(r,t,e),We(r,t,e),Ge()}catch(e){console.warn("[mnyra][analytics] observe failed",e)}}function Tt({state:e,windowObj:t,documentObj:r}={}){try{if(l.initialized)return;if(l.state=e||null,l.windowObj=t||(typeof window>"u"?null:window),l.documentObj=r||l.windowObj?.document||(typeof document>"u"?null:document),!l.state||!l.windowObj||!l.documentObj){l.disabled=!0;return}l.initialized=!0,_e(),Pe(),l.documentObj.addEventListener("click",n=>{try{et(n.target)}catch{}},{capture:!0,passive:!0}),l.documentObj.addEventListener("visibilitychange",()=>{l.documentObj.visibilityState==="hidden"&&G()}),l.windowObj.addEventListener("pagehide",()=>{G()})}catch(n){l.disabled=!0,console.warn("[mnyra][analytics] init failed",n)}}const Z=Object.freeze([{key:"today",label:"Sot",days:1},{key:"7d",label:"7 dite",days:7},{key:"30d",label:"30 dite",days:30},{key:"90d",label:"90 dite",days:90},{key:"custom",label:"Periudha ime",days:0}]),K=1440*60*1e3,ee=366;function ve(e){const t=new Date(e);return t.setHours(0,0,0,0),t}function Q(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||"").trim());if(!t)return null;const r=new Date(Number(t[1]),Number(t[2])-1,Number(t[3]));return Number.isNaN(r.getTime())?null:ve(r)}function tt({rangeKey:e="7d",customFrom:t="",customTo:r="",now:n=new Date}={}){const a=ve(n),s=Z.find(u=>u.key===e)||Z[1];let o=a,i=a;if(s.key==="custom"){const u=Q(t),d=Q(r);if(!u||!d||u.getTime()>d.getTime())return null;o=u,i=d.getTime()>a.getTime()?a:d,Math.round((i.getTime()-o.getTime())/K)+1>ee&&(o=new Date(i.getTime()-(ee-1)*K))}else o=new Date(a.getTime()-(s.days-1)*K);const c=Math.round((i.getTime()-o.getTime())/K)+1,m=new Date(o.getTime()-K),_=new Date(m.getTime()-(c-1)*K);return{rangeKey:s.key,label:s.key==="custom"?`${N(o)} – ${N(i)}`:s.label,fromDay:N(o),toDay:N(i),prevFromDay:N(_),prevToDay:N(m),lengthDays:c}}function nt(e="",t=""){const r=Q(e),n=Q(t);if(!r||!n||r.getTime()>n.getTime())return[];const a=[];for(let s=r.getTime();s<=n.getTime()&&(a.push(N(new Date(s))),!(a.length>ee+2));s+=K);return a}function p(e){const t=Number(e);return Number.isFinite(t)?t:0}function E(e={},t={}){return Object.entries(t&&typeof t=="object"?t:{}).forEach(([r,n])=>{if(n&&typeof n=="object"){e[r]=E(e[r]&&typeof e[r]=="object"?e[r]:{},n);return}if(typeof n=="string"){e[r]=n;return}e[r]=p(e[r])+p(n)}),e}function ce(e=[]){const t={counters:{},uniques:{},profileSources:{},contacts:{},hourly:{},posts:{},products:{},categories:{},tables:{},orders:{}},r=new Map;(Array.isArray(e)?e:[]).forEach(c=>{if(!c||typeof c!="object")return;const m=String(c.date||c.id||"").trim();m&&r.set(m,c),E(t.counters,c.counters),E(t.uniques,c.uniques),E(t.profileSources,c.profileSources),E(t.contacts,c.contacts),E(t.hourly,c.hourly),E(t.posts,c.posts),E(t.products,c.products),E(t.categories,c.categories),E(t.tables,c.tables),E(t.orders,c.orders)});const n=t.counters,a=t.orders,s=p(a.completed),o=Math.round(p(a.revenue)*100)/100,i={profileViews:p(n.business_profile_view),uniqueVisitors:p(t.uniques.business_profile_view),contactClicks:p(n.profile_contact_click),postImpressions:p(n.post_impression),postClicks:p(n.post_click),postLikes:p(n.post_like),postShares:p(n.post_share),menuOpens:p(n.menu_open),categoryOpens:p(n.category_open),productViews:p(n.product_view),qrScans:p(n.qr_scan),waiterCalls:p(n.call_waiter_click),ordersStarted:p(n.order_started),ordersCompleted:s,revenue:o,avgOrderValue:s>0?Math.round(o/s*100)/100:0,ordersQr:p(a.qr),ordersExternal:p(a.external),feedImpressions:p(n.feed_impression),feedClicks:p(n.feed_click)};return i.feedCtr=i.feedImpressions>0?Math.round(i.feedClicks/i.feedImpressions*1e3)/10:0,i.orderConversion=i.menuOpens>0?Math.round(i.ordersCompleted/i.menuOpens*1e3)/10:0,{summary:i,merged:t,byDay:r}}function rt(e=0,t=0){const r=p(e),n=p(t);return n<=0?r>0?null:0:Math.round((r-n)/n*1e3)/10}function at(e){if(e===null)return"neu";const t=p(e);return t===0?"±0 %":`${t>0?"+":"−"}${Math.abs(t).toLocaleString("de-DE")} %`}function B(e=0){const t=p(e),r=Math.abs(t);return r>=1e6?`${(t/1e6).toLocaleString("de-DE",{maximumFractionDigits:1})} Mio.`:r>=1e4?`${(t/1e3).toLocaleString("de-DE",{maximumFractionDigits:1})}k`:t.toLocaleString("de-DE",{maximumFractionDigits:r<100?2:0})}function le({fromDay:e="",toDay:t="",byDay:r=new Map,resolveValue:n=()=>0}={}){return nt(e,t).map(a=>{const s=r.get(a)||null;return{day:a,value:p(n(s))}})}function st(e={},t=8){return Object.entries(e.products||{}).map(([r,n])=>({productId:r,name:String(n?.name||"").trim()||r,views:p(n?.views),likes:p(n?.likes),orders:p(n?.orders),quantity:p(n?.quantity),revenue:Math.round(p(n?.revenue)*100)/100})).sort((r,n)=>n.views+n.orders*3-(r.views+r.orders*3)).slice(0,t)}function it(e={},t=5){return Object.entries(e.products||{}).map(([n,a])=>({productId:n,name:String(a?.name||"").trim()||n,views:p(a?.views),orders:p(a?.orders)})).sort((n,a)=>n.views+n.orders*3-(a.views+a.orders*3)).slice(0,t)}function ot(e={},t=8){return Object.entries(e.posts||{}).map(([r,n])=>{const a=p(n?.impressions),s=p(n?.clicks);return{postId:r,impressions:a,clicks:s,likes:p(n?.likes),shares:p(n?.shares),ctr:a>0?Math.round(s/a*1e3)/10:0}}).sort((r,n)=>n.impressions+n.clicks*2-(r.impressions+r.clicks*2)).slice(0,t)}const ct=Object.freeze({feed:"Feed",restaurants:"Restaurant-Tab",search:"Kerkimi",map:"Harta",qr:"QR-Code",external:"Externe Links",direct:"Direkt",other:"Sonstige"});function lt(e={}){const t=Object.entries(e.profileSources||{}).map(([n,a])=>({key:n,label:ct[n]||n,count:p(a)})).filter(n=>n.count>0).sort((n,a)=>a.count-n.count),r=t.reduce((n,a)=>n+a.count,0);return t.map(n=>({...n,share:r>0?Math.round(n.count/r*1e3)/10:0}))}function H(e={},t="qrScans"){const r=e.hourly&&typeof e.hourly=="object"?e.hourly:{};return Array.from({length:24},(n,a)=>({hour:a,value:p(r[String(a)]?.[t])}))}function ut(e={},t=12){return Object.entries(e.tables||{}).map(([r,n])=>({tableKey:r,label:/^t\d+$/.test(r)?`Tavolina ${r.slice(1)}`:r,qrScans:p(n?.qrScans),waiterCalls:p(n?.waiterCalls),ordersCompleted:p(n?.ordersCompleted)})).sort((r,n)=>n.qrScans+n.ordersCompleted-(r.qrScans+r.ordersCompleted)).slice(0,t)}function dt(e={},t=10){return Object.entries(e.categories||{}).map(([r,n])=>({categoryId:r,name:String(n?.name||"").trim()||r,opens:p(n?.opens)})).sort((r,n)=>n.opens-r.opens).slice(0,t)}function pt(e={}){const t=[{key:"menuOpens",label:"Menuja u hap",value:p(e.menuOpens)},{key:"productViews",label:"Produkt angesehen",value:p(e.productViews)},{key:"ordersStarted",label:"Porosia filloi",value:p(e.ordersStarted)},{key:"ordersCompleted",label:"Porosia perfundoi",value:p(e.ordersCompleted)}],r=t[0].value;return t.map((n,a)=>{const s=a===0?n.value:t[a-1].value;return{...n,shareOfFirst:r>0?Math.round(n.value/r*1e3)/10:0,dropFromPrev:a===0||s<=0?0:Math.max(0,Math.round((s-n.value)/s*1e3)/10)}})}function mt({range:e=null,currentDays:t=[],previousDays:r=[]}={}){if(!e)return null;const n=ce(t),a=ce(r),s=["profileViews","uniqueVisitors","menuOpens","productViews","postImpressions","qrScans","waiterCalls","ordersCompleted","revenue","feedImpressions"],o={};s.forEach(c=>{o[c]=rt(n.summary[c],a.summary[c])});const i=Object.values(n.summary).some(c=>p(c)>0);return{range:e,summary:n.summary,previousSummary:a.summary,deltas:o,hasAnyData:i,trend:{profileViews:le({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:c=>c?.counters?.business_profile_view}),menuOpens:le({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:c=>c?.counters?.menu_open})},funnel:pt(n.summary),topProducts:st(n.merged),lowProducts:it(n.merged),topPosts:ot(n.merged),sources:lt(n.merged),categories:dt(n.merged),tables:ut(n.merged),hourlyQr:H(n.merged,"qrScans"),hourlyWaiter:H(n.merged,"waiterCalls"),hourlyOrders:H(n.merged,"ordersCompleted"),contacts:{phone:p(n.merged.contacts?.phone),address:p(n.merged.contacts?.address),map:p(n.merged.contacts?.map),hours:p(n.merged.contacts?.hours),social:p(n.merged.contacts?.social)}}}async function ue({db:e,collectionFn:t,queryFn:r,whereFn:n,documentIdFn:a,getDocsFn:s,restaurantId:o="",fromDay:i="",toDay:c=""}={}){const m=String(o||"").trim(),_=String(i||"").trim(),u=String(c||"").trim();if(!e||typeof t!="function"||typeof r!="function"||typeof n!="function"||typeof a!="function"||typeof s!="function"||!m||!_||!u)return[];const d=t(e,"restaurants",m,"analyticsDaily");return(await s(r(d,n(a(),">=",_),n(a(),"<=",u)))).docs.map(w=>({id:w.id,...w.data()||{}}))}const de="mnyraAnalyticsStyles",ft=`
.mnyra-an {
  --an-surface: #ffffff;
  --an-plane: #f8fafc;
  --an-ink: #0f172a;
  --an-ink-2: #475569;
  --an-muted: #94a3b8;
  --an-grid: #e2e8f0;
  --an-border: rgba(15, 23, 42, 0.08);
  --an-series-1: #4f46e5;
  --an-series-2: #0d9488;
  --an-up: #047857;
  --an-down: #b91c1c;
  --an-chip-bg: #f1f5f9;
  --an-chip-active: #0f172a;
  --an-chip-active-ink: #ffffff;
  color: var(--an-ink);
  font-family: inherit;
}
.mnyra-an--dark {
  --an-surface: #16161a;
  --an-plane: #101014;
  --an-ink: #f4f4f5;
  --an-ink-2: #b8b8c0;
  --an-muted: #7d7d88;
  --an-grid: #2c2c31;
  --an-border: rgba(255, 255, 255, 0.10);
  --an-series-1: #6366f1;
  --an-series-2: #0f9d8c;
  --an-up: #34d399;
  --an-down: #f87171;
  --an-chip-bg: #232329;
  --an-chip-active: #f4f4f5;
  --an-chip-active-ink: #101014;
}
.mnyra-an * { box-sizing: border-box; }
.mnyra-an__filters { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 14px; }
.mnyra-an__chip {
  border: 1px solid var(--an-border);
  background: var(--an-chip-bg);
  color: var(--an-ink-2);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 9px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.mnyra-an__chip--active { background: var(--an-chip-active); color: var(--an-chip-active-ink); border-color: transparent; }
.mnyra-an__custom { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.mnyra-an__custom input {
  border: 1px solid var(--an-border);
  background: var(--an-surface);
  color: var(--an-ink);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
}
.mnyra-an__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
@media (min-width: 720px) { .mnyra-an__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.mnyra-an__card {
  background: var(--an-surface);
  border: 1px solid var(--an-border);
  border-radius: 20px;
  padding: 14px;
  min-width: 0;
}
.mnyra-an__section { margin-top: 14px; }
.mnyra-an__section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: var(--an-ink-2); margin: 0 0 10px; }
.mnyra-an__kpi-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--an-muted); margin: 0; }
.mnyra-an__kpi-value { font-size: 22px; font-weight: 700; margin: 4px 0 2px; color: var(--an-ink); }
.mnyra-an__kpi-delta { font-size: 11px; font-weight: 700; margin: 0; color: var(--an-ink-2); }
.mnyra-an__kpi-delta--up { color: var(--an-up); }
.mnyra-an__kpi-delta--down { color: var(--an-down); }
.mnyra-an__legend { display: flex; gap: 14px; align-items: center; margin: 0 0 8px; flex-wrap: wrap; }
.mnyra-an__legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--an-ink-2); }
.mnyra-an__legend-swatch { width: 14px; height: 3px; border-radius: 2px; display: inline-block; }
.mnyra-an__chart-wrap { position: relative; }
.mnyra-an__tooltip {
  position: absolute;
  pointer-events: none;
  background: var(--an-ink);
  color: var(--an-surface);
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 11px;
  line-height: 1.5;
  transform: translate(-50%, calc(-100% - 10px));
  white-space: nowrap;
  opacity: 0;
  transition: opacity 120ms ease;
  z-index: 5;
}
.mnyra-an__tooltip--visible { opacity: 1; }
.mnyra-an__tooltip-value { font-weight: 800; }
.mnyra-an__tooltip-key { display: inline-block; width: 10px; height: 2px; border-radius: 1px; vertical-align: middle; margin-right: 5px; }
.mnyra-an__table { width: 100%; border-collapse: collapse; font-size: 12px; }
.mnyra-an__table th {
  text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 0.07em; color: var(--an-muted); padding: 6px 8px; border-bottom: 1px solid var(--an-grid);
}
.mnyra-an__table td { padding: 8px; border-bottom: 1px solid var(--an-grid); color: var(--an-ink-2); font-variant-numeric: tabular-nums; }
.mnyra-an__table td:first-child { color: var(--an-ink); font-weight: 600; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-an__table tr:last-child td { border-bottom: none; }
.mnyra-an__table-scroll { overflow-x: auto; }
.mnyra-an__bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.mnyra-an__bar-label { flex: 0 0 128px; font-size: 11px; font-weight: 700; color: var(--an-ink-2); }
.mnyra-an__bar-track { flex: 1; height: 16px; background: var(--an-plane); border-radius: 6px; overflow: hidden; }
.mnyra-an__bar-fill { height: 100%; border-radius: 4px; background: var(--an-series-1); min-width: 2px; }
.mnyra-an__bar-value { flex: 0 0 auto; font-size: 11px; font-weight: 700; color: var(--an-ink); font-variant-numeric: tabular-nums; }
.mnyra-an__state { padding: 34px 18px; text-align: center; }
.mnyra-an__state-title { font-size: 14px; font-weight: 800; color: var(--an-ink); margin: 0 0 6px; }
.mnyra-an__state-body { font-size: 12px; color: var(--an-ink-2); margin: 0; line-height: 1.6; }
.mnyra-an__retry {
  margin-top: 14px; border: none; background: var(--an-chip-active); color: var(--an-chip-active-ink);
  font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em;
  padding: 10px 18px; border-radius: 999px; cursor: pointer;
}
.mnyra-an__skeleton { border-radius: 20px; background: var(--an-plane); animation: mnyraAnPulse 1.4s ease-in-out infinite; }
@keyframes mnyraAnPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
.mnyra-an__empty-note { font-size: 11px; color: var(--an-muted); margin: 6px 0 0; }
`;function yt(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(de)))try{const t=e.createElement("style");t.id=de,t.textContent=ft,e.head?.appendChild(t)}catch{}}function g(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ke(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||""));return t?`${t[3]}.${t[2]}.`:e}function ht({rangeKey:e="7d",customFrom:t="",customTo:r=""}={}){const n=Z.map(s=>`
    <button
      type="button"
      class="mnyra-an__chip ${s.key===e?"mnyra-an__chip--active":""}"
      data-analytics-range="${g(s.key)}"
    >${g(s.label)}</button>
  `).join(""),a=e==="custom"?`
      <div class="mnyra-an__custom">
        <input type="date" data-analytics-custom-from value="${g(t)}" aria-label="Nga" />
        <span style="color:var(--an-muted); font-size:11px; font-weight:700;">deri</span>
        <input type="date" data-analytics-custom-to value="${g(r)}" aria-label="Deri" />
        <button type="button" class="mnyra-an__chip mnyra-an__chip--active" data-analytics-custom-apply>Anwenden</button>
      </div>
    `:"";return`<div class="mnyra-an__filters" role="group" aria-label="Periudha">${n}</div>${a}`}function bt(e,{moreIsGood:t=!0}={}){if(e===void 0)return"";const r=at(e);let n="";if(e!==null&&e!==0){const a=e>0;n=(t?a:!a)?"mnyra-an__kpi-delta--up":"mnyra-an__kpi-delta--down"}return`<p class="mnyra-an__kpi-delta ${n}">${g(r)} <span style="color:var(--an-muted); font-weight:600;">vs. Vorperiode</span></p>`}function D({label:e="",value:t=0,delta:r,suffix:n="",moreIsGood:a=!0}={}){return`
    <div class="mnyra-an__card">
      <p class="mnyra-an__kpi-label">${g(e)}</p>
      <p class="mnyra-an__kpi-value">${g(B(t))}${n?` <span style="font-size:12px; color:var(--an-muted); font-weight:700;">${g(n)}</span>`:""}</p>
      ${bt(r,{moreIsGood:a})}
    </div>
  `}function _t({series:e=[],chartId:t="trend",height:r=150}={}){const n=(Array.isArray(e)?e:[]).filter(h=>Array.isArray(h?.points)&&h.points.length);if(!n.length)return"";const a=640,s={top:12,right:12,bottom:24,left:34},o=a-s.left-s.right,i=r-s.top-s.bottom,c=n[0].points.map(h=>h.day),m=c.length,_=Math.max(1,...n.flatMap(h=>h.points.map($=>Number($.value)||0))),u=Math.max(1,Math.ceil(_/4)*4),d=h=>s.left+(m<=1?o/2:h/(m-1)*o),k=h=>s.top+i-Math.max(0,Number(h)||0)/u*i,w=h=>String(h)==="2"?"var(--an-series-2)":"var(--an-series-1)",S=[0,.25,.5,.75,1].map(h=>{const $=s.top+i-h*i,q=Math.round(u*h);return`
      <line x1="${s.left}" y1="${$}" x2="${a-s.right}" y2="${$}" stroke="var(--an-grid)" stroke-width="1" />
      <text x="${s.left-6}" y="${$+3}" text-anchor="end" font-size="9" fill="var(--an-muted)" style="font-variant-numeric: tabular-nums;">${q.toLocaleString("de-DE")}</text>
    `}).join(""),A=Math.max(1,Math.ceil(m/6)),O=c.map((h,$)=>$%A!==0&&$!==m-1?"":`<text x="${d($)}" y="${r-6}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${g(ke(h))}</text>`).join(""),x=n.map(h=>{const $=h.points.map((v,b)=>`${b===0?"M":"L"}${d(b).toFixed(1)},${k(v.value).toFixed(1)}`).join(" "),q=`${$} L${d(m-1).toFixed(1)},${(s.top+i).toFixed(1)} L${d(0).toFixed(1)},${(s.top+i).toFixed(1)} Z`,y=m-1,f=`<circle cx="${d(y).toFixed(1)}" cy="${k(h.points[y].value).toFixed(1)}" r="4" fill="${w(h.color)}" stroke="var(--an-surface)" stroke-width="2" />`;return`
      <path d="${q}" fill="${w(h.color)}" opacity="0.10" />
      <path d="${$}" fill="none" stroke="${w(h.color)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${f}
    `}).join(""),T=n.length>1?`
      <div class="mnyra-an__legend">
        ${n.map(h=>`
          <span class="mnyra-an__legend-item">
            <span class="mnyra-an__legend-swatch" style="background:${w(h.color)};"></span>${g(h.label)}
          </span>
        `).join("")}
      </div>
    `:"",L=g(JSON.stringify({days:c,pad:s,width:a,height:r,series:n.map(h=>({label:h.label,color:String(h.color)==="2"?"2":"1",values:h.points.map($=>Number($.value)||0)}))}));return`
    ${T}
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${g(t)}" data-analytics-chart-payload="${L}">
      <svg viewBox="0 0 ${a} ${r}" width="100%" height="auto" role="img" aria-label="Trend">
        ${S}
        <line data-analytics-crosshair x1="0" y1="${s.top}" x2="0" y2="${s.top+i}" stroke="var(--an-muted)" stroke-width="1" opacity="0" />
        ${x}
        ${O}
      </svg>
      <div class="mnyra-an__tooltip" data-analytics-tooltip></div>
    </div>
  `}function pe({rows:e=[],label:t="",chartId:r="hourly"}={}){const n=Array.isArray(e)?e:[];if(n.reduce((S,A)=>S+(Number(A?.value)||0),0)<=0)return`<p class="mnyra-an__empty-note">Ende nuk ka te dhena per „${g(t)}“ ne kete periudhe.</p>`;const s=640,o=120,i={top:8,right:8,bottom:20,left:8},c=s-i.left-i.right,m=o-i.top-i.bottom,_=Math.max(1,...n.map(S=>Number(S?.value)||0)),u=c/24,d=Math.min(20,Math.max(6,u-2)),k=n.map(S=>{const A=Number(S?.value)||0,O=A<=0?0:Math.max(2,A/_*m),x=i.left+S.hour*u+(u-d)/2,T=i.top+m-O;return A<=0?"":`<path d="M${x.toFixed(1)},${(i.top+m).toFixed(1)} L${x.toFixed(1)},${(T+4).toFixed(1)} Q${x.toFixed(1)},${T.toFixed(1)} ${(x+4).toFixed(1)},${T.toFixed(1)} L${(x+d-4).toFixed(1)},${T.toFixed(1)} Q${(x+d).toFixed(1)},${T.toFixed(1)} ${(x+d).toFixed(1)},${(T+4).toFixed(1)} L${(x+d).toFixed(1)},${(i.top+m).toFixed(1)} Z"
          fill="var(--an-series-1)"><title>${g(`${S.hour}:00 Uhr – ${A.toLocaleString("de-DE")}`)}</title></path>`}).join(""),w=[0,6,12,18,23].map(S=>`
    <text x="${(i.left+S*u+u/2).toFixed(1)}" y="${o-5}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${S} Uhr</text>
  `).join("");return`
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${g(r)}">
      <svg viewBox="0 0 ${s} ${o}" width="100%" height="auto" role="img" aria-label="${g(t)}">
        <line x1="${i.left}" y1="${i.top+m}" x2="${s-i.right}" y2="${i.top+m}" stroke="var(--an-grid)" stroke-width="1" />
        ${k}
        ${w}
      </svg>
    </div>
  `}function gt(e=[]){const t=Array.isArray(e)?e:[];if(!t.length)return"";const r=Math.max(1,...t.map(n=>Number(n?.value)||0));return t.map((n,a)=>{const s=Number(n?.value)||0,o=Math.max(2,Math.round(s/r*100)),i=a>0&&n.dropFromPrev>0?` <span style="color:var(--an-down);">(−${n.dropFromPrev.toLocaleString("de-DE")} %)</span>`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${g(n.label)}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${o}%; opacity:${1-a*.15};"></div></div>
        <span class="mnyra-an__bar-value">${g(B(s))}${i}</span>
      </div>
    `}).join("")}function W(e=[],{labelKey:t="label",valueKey:r="count",suffix:n=""}={}){const a=Array.isArray(e)?e:[];if(!a.length)return'<p class="mnyra-an__empty-note">Ende nuk ka te dhena ne kete periudhe.</p>';const s=Math.max(1,...a.map(o=>Number(o?.[r])||0));return a.map(o=>{const i=Number(o?.[r])||0,c=Math.max(2,Math.round(i/s*100)),m=n==="%"&&Number.isFinite(Number(o?.share))?` · ${Number(o.share).toLocaleString("de-DE")} %`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${g(String(o?.[t]||""))}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${c}%;"></div></div>
        <span class="mnyra-an__bar-value">${g(B(i))}${g(m)}</span>
      </div>
    `}).join("")}function Y({columns:e=[],rows:t=[],emptyLabel:r="Ende nuk ka te dhena."}={}){return t.length?`
    <div class="mnyra-an__table-scroll">
      <table class="mnyra-an__table">
        <thead><tr>${e.map(n=>`<th>${g(n.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${t.map(n=>`
            <tr>${e.map(a=>`<td>${g(String(a.render?a.render(n):n[a.key]??""))}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:`<p class="mnyra-an__empty-note">${g(r)}</p>`}function vt(){return`
    <div class="mnyra-an__grid" aria-hidden="true">
      ${Array.from({length:4},()=>'<div class="mnyra-an__skeleton" style="height:88px;"></div>').join("")}
    </div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:180px;"></div></div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:140px;"></div></div>
  `}function te({title:e="Ende nuk ka te dhena analitike",body:t=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">${g(e)}</p>
      <p class="mnyra-an__state-body">${g(t||"Sapo vizitoret te shikojne profilin, menune ose postimet e tua, statistikat e tua shfaqen ketu.")}</p>
    </div>
  `}function kt({message:e=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">Analitika nuk mund te ngarkohej</p>
      <p class="mnyra-an__state-body">${g(e||"Ju lutem kontrolloni lidhjen dhe provoni perseri.")}</p>
      <button type="button" class="mnyra-an__retry" data-analytics-retry>Provo perseri</button>
    </div>
  `}function wt(e=null,{currency:t="€"}={}){if(!e)return te({});const{summary:r,deltas:n}=e;if(!e.hasAnyData)return te({body:`Ne periudhen „${e.range.label}“ ende nuk ka te dhena. Ndaj profilin tend, QR kodet e tua ose posto ne feed per te rritur shtrirjen.`});const a=[D({label:"Vizitore te profilit",value:r.profileViews,delta:n.profileViews}),D({label:"Vizitore unike",value:r.uniqueVisitors,delta:n.uniqueVisitors}),D({label:"Shikime te menuse",value:r.menuOpens,delta:n.menuOpens}),D({label:"Produkt-Ansichten",value:r.productViews,delta:n.productViews}),D({label:"Beitrags-Impressionen",value:r.postImpressions,delta:n.postImpressions}),D({label:"QR-Scans",value:r.qrScans,delta:n.qrScans}),D({label:"Thirrje kamarieri",value:r.waiterCalls,delta:n.waiterCalls}),D({label:"Porosite",value:r.ordersCompleted,delta:n.ordersCompleted}),D({label:"Umsatz",value:r.revenue,delta:n.revenue,suffix:t}),D({label:"Ø Bestellwert",value:r.avgOrderValue,suffix:t}),D({label:"Shtrirja ne feed",value:r.feedImpressions,delta:n.feedImpressions}),D({label:"Feed-Klickrate",value:r.feedCtr,suffix:"%"})].join(""),s=_t({chartId:"profileTrend",series:[{key:"profileViews",label:"Vizitore te profilit",color:"1",points:e.trend.profileViews},{key:"menuOpens",label:"Shikime te menuse",color:"2",points:e.trend.menuOpens}]}),o=Y({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Porosite"},{key:"revenue",label:`Umsatz (${t})`,render:d=>d.revenue>0?d.revenue.toLocaleString("de-DE"):"–"}],rows:e.topProducts,emptyLabel:"Ende nuk ka te dhena produktesh ne kete periudhe."}),i=e.lowProducts.length&&e.topProducts.length>e.lowProducts.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Wenig Aufmerksamkeit</h3>
        <div class="mnyra-an__card">
          ${Y({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Porosite"}],rows:e.lowProducts})}
          <p class="mnyra-an__empty-note">Keshille: Keto produkte marrin pak vemendje – foto me te mira, pozicioni ne menu ose nje oferte mund te ndihmojne.</p>
        </div>
      </div>
    `:"",c=Y({columns:[{key:"postId",label:"Beitrag"},{key:"impressions",label:"Impressionen"},{key:"clicks",label:"Klicks"},{key:"likes",label:"Likes"},{key:"ctr",label:"CTR %",render:d=>d.ctr.toLocaleString("de-DE")}],rows:e.topPosts,emptyLabel:"Ende nuk ka te dhena postimesh ne kete periudhe."}),m=e.tables.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Tavolinat</h3>
        <div class="mnyra-an__card">
          ${Y({columns:[{key:"label",label:"Tavolina"},{key:"qrScans",label:"QR-Scans"},{key:"waiterCalls",label:"Thirrje kamarieri"},{key:"ordersCompleted",label:"Porosite"}],rows:e.tables})}
        </div>
      </div>
    `:"",_=e.categories.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kategorien</h3>
        <div class="mnyra-an__card">
          ${W(e.categories,{labelKey:"name",valueKey:"opens"})}
        </div>
      </div>
    `:"",u=[{label:"Telefon",count:e.contacts.phone},{label:"Adresa",count:e.contacts.address},{label:"Harta",count:e.contacts.map},{label:"Orari i punes",count:e.contacts.hours},{label:"Social Links",count:e.contacts.social}].filter(d=>d.count>0);return`
    <div class="mnyra-an__grid">${a}</div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Trend</h3>
      <div class="mnyra-an__card">${s||'<p class="mnyra-an__empty-note">Nuk ka trend per kete periudhe.</p>'}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Conversion-Funnel</h3>
      <div class="mnyra-an__card">
        ${gt(e.funnel)}
        <p class="mnyra-an__empty-note">Konvertimi menu → porosi: ${g(String(r.orderConversion.toLocaleString("de-DE")))} % · Porosi me QR: ${g(B(r.ordersQr))} · Te jashtme: ${g(B(r.ordersExternal))}</p>
      </div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Klickquellen</h3>
      <div class="mnyra-an__card">${W(e.sources,{suffix:"%"})}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Produkte</h3>
      <div class="mnyra-an__card">${o}</div>
    </div>
    ${i}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Beiträge</h3>
      <div class="mnyra-an__card">${c}</div>
    </div>

    ${_}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">QR-skanime sipas ores</h3>
      <div class="mnyra-an__card">${pe({rows:e.hourlyQr,label:"QR-Scans",chartId:"hourlyQr"})}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Thirrjet e kamarierit sipas ores</h3>
      <div class="mnyra-an__card">${pe({rows:e.hourlyWaiter,label:"Thirrje kamarieri",chartId:"hourlyWaiter"})}</div>
    </div>

    ${u.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kontakt-Klicks</h3>
        <div class="mnyra-an__card">${W(u)}</div>
      </div>
    `:""}

    ${m}
  `}function St(e=typeof document>"u"?null:document){e?.querySelectorAll&&e.querySelectorAll("[data-analytics-chart-payload]").forEach(t=>{if(t.__mnyraAnalyticsChartBound)return;t.__mnyraAnalyticsChartBound=!0;let r=null;try{r=JSON.parse(t.getAttribute("data-analytics-chart-payload")||"null")}catch{}if(!r||!Array.isArray(r.days)||!r.days.length)return;const n=t.querySelector("svg"),a=t.querySelector("[data-analytics-crosshair]"),s=t.querySelector("[data-analytics-tooltip]");if(!n||!a||!s)return;const{pad:o,width:i}=r,c=i-o.left-o.right,m=r.days.length,_=()=>{a.setAttribute("opacity","0"),s.classList.remove("mnyra-an__tooltip--visible")},u=d=>{const k=n.getBoundingClientRect();if(!k.width)return;const w=i/k.width,S=(d.clientX-k.left)*w,A=Math.min(1,Math.max(0,(S-o.left)/Math.max(1,c))),O=Math.round(A*(m-1)),x=o.left+(m<=1?c/2:O/(m-1)*c);a.setAttribute("x1",String(x)),a.setAttribute("x2",String(x)),a.setAttribute("opacity","0.6"),s.textContent="";const T=e.createElement?e.createElement("div"):document.createElement("div");T.textContent=ke(r.days[O]),T.style.fontWeight="800",s.appendChild(T),r.series.forEach(L=>{const h=document.createElement("div"),$=document.createElement("span");$.className="mnyra-an__tooltip-key",$.style.background=L.color==="2"?"var(--an-series-2)":"var(--an-series-1)";const q=document.createElement("span");q.className="mnyra-an__tooltip-value",q.textContent=Number(L.values[O]||0).toLocaleString("de-DE");const y=document.createElement("span");y.textContent=` ${L.label}`,h.appendChild($),h.appendChild(q),h.appendChild(y),s.appendChild(h)}),s.style.left=`${x/i*100}%`,s.style.top="0px",s.classList.add("mnyra-an__tooltip--visible")};n.addEventListener("pointermove",u),n.addEventListener("pointerdown",u),n.addEventListener("pointerleave",_)})}const xt="menyra_social_analytics_cache_v1::",$t=3;function Ct({state:e,renderFn:t,documentObj:r,storageObj:n,firestoreApi:a={}}={}){const s=r||(typeof document>"u"?null:document),o=typeof t=="function"?t:()=>{},i=n||(typeof localStorage>"u"?null:localStorage);let c=0,m=!1;function _(y=""){return`${xt}${y}`}function u(y=""){if(!i||!y)return[];try{const f=JSON.parse(i.getItem(_(y))||"null");return(Array.isArray(f?.entries)?f.entries:[]).filter(b=>b&&typeof b=="object"&&String(b.signature||"").trim()&&b.model&&typeof b.model=="object")}catch{return[]}}function d(y="",f=""){if(!f)return null;const v=u(y).find(b=>String(b.signature)===f);return v?v.model:null}function k(y="",f="",v=null){if(!i||!y||!f||!v)return;const b=[{signature:f,model:v},...u(y).filter(j=>String(j.signature)!==f)].slice(0,$t);try{i.setItem(_(y),JSON.stringify({entries:b}))}catch{try{i.setItem(_(y),JSON.stringify({entries:[{signature:f,model:v}]}))}catch{}}}function w(){return(!e.analyticsView||typeof e.analyticsView!="object")&&(e.analyticsView={status:"idle",error:"",rangeKey:"7d",customFrom:"",customTo:"",loadedRangeSignature:"",restaurantId:"",model:null}),e.analyticsView}function S(y=""){const f=w(),v=String(y||"").trim();return String(f.restaurantId||"")===v||(f.restaurantId=v,f.model=null,f.status="idle",f.error="",f.loadedRangeSignature="",c+=1),f}function A(){const y=e?.userProfile||{};return String(y.restaurantId||y.staffRestaurantId||"").trim()}function O(y,f){return`${f}::${y.fromDay}::${y.toDay}`}async function x({force:y=!1,silent:f=!1}={}){const v=A(),b=S(v);if(!v){b.status="empty-business";return}const j=tt({rangeKey:b.rangeKey,customFrom:b.customFrom,customTo:b.customTo});if(!j){b.status="error",b.error="Ju lutem zgjidhni nje periudhe te vlefshme (data e fillimit para dates se mbarimit).",f||o();return}const R=O(j,v);if(!y&&b.loadedRangeSignature===R&&b.status==="ready")return;if(b.loadedRangeSignature!==R){const F=d(v,R);F&&(b.model=F,b.loadedRangeSignature=R,b.status="ready",f||o())}c+=1;const re=c,ae=!!b.model;ae||(b.status="loading",b.error="",f||o());try{const F={db:a.db,collectionFn:a.collectionFn,queryFn:a.queryFn,whereFn:a.whereFn,documentIdFn:a.documentIdFn,getDocsFn:a.getDocsFn,restaurantId:v},[we,Se]=await Promise.all([ue({...F,fromDay:j.fromDay,toDay:j.toDay}),ue({...F,fromDay:j.prevFromDay,toDay:j.prevToDay})]);if(re!==c)return;b.model=mt({range:j,currentDays:we,previousDays:Se}),b.loadedRangeSignature=R,b.status="ready",k(v,R,b.model)}catch(F){if(re!==c)return;console.error("[mnyra][analytics] dashboard load failed",F),ae||(b.status="error",b.error="Analitika nuk mund te ngarkohej.")}o()}function T(y="7d"){const f=w();f.rangeKey=String(y||"7d").trim()||"7d",f.rangeKey!=="custom"&&x({force:!1}),o()}function L(){const y=w(),f=s?.querySelector?.("[data-analytics-custom-from]"),v=s?.querySelector?.("[data-analytics-custom-to]");y.customFrom=String(f?.value||y.customFrom||"").trim(),y.customTo=String(v?.value||y.customTo||"").trim(),x({force:!0})}function h(){m||!s||(m=!0,s.addEventListener("click",y=>{try{if(!y.target?.closest?.("[data-analytics-root]"))return;const f=y.target?.closest?.("[data-analytics-range]");if(f){T(f.getAttribute("data-analytics-range"));return}if(y.target?.closest?.("[data-analytics-custom-apply]")){L();return}y.target?.closest?.("[data-analytics-retry]")&&x({force:!0})}catch{}}))}function $(){if(!s)return;((s.defaultView||(typeof window>"u"?null:window))?.requestAnimationFrame||(v=>setTimeout(v,0)))(()=>{try{St(s)}catch{}})}function q(){yt(s),h();const y=A(),f=S(y);let v="";if(!y)v=te({title:"Nuk ka profil biznesi te lidhur",body:"Analitika eshte e disponueshme vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant ose dyqan, statistikat e tua shfaqen ketu."});else if(f.status==="idle"||f.status==="loading"&&!f.model)f.status==="idle"&&(queueMicrotask(()=>{x({force:!1})}),f.status="loading"),v=vt();else if(f.status==="error")v=kt({message:f.error});else{const b=wt(f.model);v=f.status==="loading"?`<div style="opacity:0.55; pointer-events:none;">${b}</div>`:b}return $(),`
      <section class="p-4 pb-28 mnyra-an" data-analytics-root>
        <div class="mb-4">
          <h2 class="text-lg font-black tracking-tight text-slate-900" style="color:var(--an-ink);">Analytics</h2>
          <p class="text-xs" style="color:var(--an-muted); margin-top:2px;">Shtrirja jote, performanca e menuse dhe porosite me nje shikim.</p>
        </div>
        ${ht({rangeKey:f.rangeKey,customFrom:f.customFrom,customTo:f.customTo})}
        ${v}
      </section>
    `}return Object.freeze({renderAnalyticsView:q,loadAnalytics:x,setRange:T})}export{Ct as c,B as f,Tt as i,ue as l,At as o,tt as r,ce as s,I as t};
