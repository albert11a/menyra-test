const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/firebase-config-BOk6-WYE.js","chunks/vendor-firebase-D7Ks7H8l.js"])))=>i.map(i=>d[i]);
import{_ as ee}from"./domain-auth-Aq-4Vdvh.js";const be=Object.freeze(["business_profile_view","profile_contact_click","post_impression","post_click","post_like","post_share","menu_open","category_open","product_view","product_like","qr_scan","call_waiter_click","order_started","order_completed","feed_impression","feed_click"]),_e=new Set(be),ge=Object.freeze(["feed","restaurants","search","map","qr","external","direct","other"]),ve=new Set(ge),ke=Object.freeze(["phone","address","map","hours","social"]),we=new Set(ke),ce=Object.freeze(["business_profile_view","menu_open","qr_scan"]);function Se(e=""){return _e.has(String(e||"").trim())}function Q(e=""){const t=String(e||"").trim().toLowerCase();return t?ve.has(t)?t:t==="home"?"feed":t==="restaurant"||t==="marketplace"?"restaurants":t==="table"||t==="table-qr"||t==="qr-code"?"qr":t==="link"||t==="share"||t==="referrer"?"external":"other":"direct"}function le(e=""){const t=String(e||"").trim().toLowerCase();return we.has(t)?t:""}function P(e="",{prefix:t=""}={}){const r=String(e??"").trim();if(!r)return"";const n=r.replace(/[.~*/[\]#$]/g,"_").replace(/\s+/g,"_").slice(0,120);return n?t?`${t}${n}`:n:""}function ue(e="",t=0){const r=Math.max(0,Math.trunc(Number(t)||0)),n=P(e);return n?n.startsWith("t")?n:`t${n}`:r>0?`t${r}`:""}function E(e=new Date){const t=e instanceof Date?e:new Date(e);if(Number.isNaN(t.getTime()))return"";const r=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${r}-${n}-${a}`}function xe(e=new Date){const t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?"0":String(t.getHours())}function I(e="",t=200){return String(e??"").trim().slice(0,t)}function j(e,t=0){const r=Number(e);return Number.isFinite(r)?r:t}function $e(e="",t={},{now:r=new Date,sessionId:n="",userId:a=""}={}){const s=String(e||"").trim();if(!Se(s))return null;const i=I(t.businessId,180);if(!i)return null;const o={name:s,businessId:i,sessionId:I(n,120),day:E(r),hour:Math.max(0,Math.min(23,Math.trunc(j(xe(r),0))))},l={userId:I(a||t.userId,180),source:Q(t.source),postId:I(t.postId,180),productId:I(t.productId,180),productName:I(t.productName,160),menuId:I(t.menuId,180),categoryId:I(t.categoryId,120),categoryName:I(t.categoryName,120),contactKind:le(t.contactKind),tableId:ue(t.tableId,t.tableNumber),orderId:I(t.orderId,180)};Object.entries(l).forEach(([u,d])=>{d&&(o[u]=d)});const m=j(t.value,0);m>0&&(o.value=Math.round(m*100)/100);const _=Math.max(0,Math.trunc(j(t.quantity,0)));if(_>0&&(o.quantity=_),t.isUnique===!0&&(o.isUnique=!0),Array.isArray(t.items)){const u=t.items.map(d=>({productId:I(d?.productId||d?.itemId||d?.id,180),name:I(d?.name,160),quantity:Math.max(1,Math.trunc(j(d?.quantity,1))),revenue:Math.max(0,Math.round(j(d?.revenue,0)*100)/100)})).filter(d=>d.productId).slice(0,60);u.length&&(o.items=u)}return o}function Ie(e=null){if(!e||!e.name||!e.businessId)return[];const t=[],r=(i,o=1)=>t.push({path:i,n:o}),n=(i,o)=>t.push({path:i,set:o});r(["counters",e.name],1),e.isUnique&&ce.includes(e.name)&&r(["uniques",e.name],1);const a=String(Math.max(0,Math.min(23,Math.trunc(Number(e.hour)||0)))),s=ue(e.tableId,e.tableNumber);switch(e.name){case"business_profile_view":{r(["profileSources",Q(e.source)],1);break}case"profile_contact_click":{const i=le(e.contactKind);i&&r(["contacts",i],1);break}case"post_impression":case"post_click":case"post_like":case"post_share":{const i=P(e.postId);if(i){const o=e.name==="post_impression"?"impressions":e.name==="post_click"?"clicks":e.name==="post_like"?"likes":"shares";r(["posts",i,o],1)}break}case"category_open":{const i=P(e.categoryId);i&&(r(["categories",i,"opens"],1),e.categoryName&&n(["categories",i,"name"],e.categoryName));break}case"product_view":case"product_like":{const i=P(e.productId);i&&(r(["products",i,e.name==="product_view"?"views":"likes"],1),e.productName&&n(["products",i,"name"],e.productName));break}case"qr_scan":{r(["hourly",a,"qrScans"],1),s&&r(["tables",s,"qrScans"],1);break}case"call_waiter_click":{r(["hourly",a,"waiterCalls"],1),s&&r(["tables",s,"waiterCalls"],1);break}case"order_started":{r(["orders","started"],1);break}case"order_completed":{r(["orders","completed"],1),r(["hourly",a,"ordersCompleted"],1),r(["orders",Q(e.source)==="qr"?"qr":"external"],1);const i=Math.max(0,Number(e.value)||0);i>0&&r(["orders","revenue"],Math.round(i*100)/100);const o=Math.max(0,Math.trunc(Number(e.quantity)||0));o>0&&r(["orders","itemCount"],o),s&&r(["tables",s,"ordersCompleted"],1),(Array.isArray(e.items)?e.items:[]).forEach(l=>{const m=P(l.productId);if(!m)return;r(["products",m,"orders"],1),r(["products",m,"quantity"],Math.max(1,Math.trunc(Number(l.quantity)||1)));const _=Math.max(0,Number(l.revenue)||0);_>0&&r(["products",m,"revenue"],Math.round(_*100)/100),l.name&&n(["products",m,"name"],l.name)});break}}return t}function Ae(e={},t=[],r=n=>n){return(Array.isArray(t)?t:[]).forEach(n=>{const a=Array.isArray(n?.path)?n.path.map(l=>String(l||"").trim()).filter(Boolean):[];if(!a.length)return;let s=e;for(let l=0;l<a.length-1;l+=1){const m=a[l];(!s[m]||typeof s[m]!="object")&&(s[m]={}),s=s[m]}const i=a[a.length-1];if(Object.prototype.hasOwnProperty.call(n,"set")){s[i]=n.set;return}const o=Number(n?.n);!Number.isFinite(o)||o===0||(s[i]=r(o))}),e}const te="mnyra_analytics_session_v1",de="mnyra_analytics_dedupe_v1",Te=2500,pe=300,Y=600,c={initialized:!1,state:null,windowObj:null,documentObj:null,queue:[],flushTimer:null,flushing:!1,sessionId:"",dedupe:{day:"",keys:[]},dedupeSet:new Set,observerSnapshot:null,intersectionObserver:null,firebasePromise:null,disabled:!1};function G(e){try{return e?.sessionStorage||null}catch{return null}}function De(){try{if(typeof crypto<"u"&&crypto.randomUUID)return crypto.randomUUID()}catch{}return`s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}function me(){if(c.sessionId)return c.sessionId;const e=G(c.windowObj);let t="";try{t=String(e?.getItem(te)||"").trim()}catch{}if(!t){t=De();try{e?.setItem(te,t)}catch{}}return c.sessionId=t,t}function Ce(){const e=G(c.windowObj),t=E(new Date);let r=null;try{r=JSON.parse(e?.getItem(de)||"null")}catch{}(!r||r.day!==t||!Array.isArray(r.keys))&&(r={day:t,keys:[]}),c.dedupe=r,c.dedupeSet=new Set(r.keys)}function Ee(){const e=G(c.windowObj);try{e?.setItem(de,JSON.stringify({day:c.dedupe.day,keys:c.dedupe.keys.slice(-Y)}))}catch{}}function ne(e=""){const t=String(e||"").trim();if(!t)return!1;const r=E(new Date);return c.dedupe.day!==r&&(c.dedupe={day:r,keys:[]},c.dedupeSet=new Set),c.dedupeSet.has(t)?!1:(c.dedupeSet.add(t),c.dedupe.keys.push(t),c.dedupe.keys.length>Y&&(c.dedupe.keys=c.dedupe.keys.slice(-Y),c.dedupeSet=new Set(c.dedupe.keys)),Ee(),!0)}function N(){return c.state||{}}function Ne(){const e=N().userProfile||{};return String(e.restaurantId||e.staffRestaurantId||"").trim()}function Me(){const e=N().userProfile||{};return String(e.role||"").trim().toLowerCase()==="ceo"?!0:(Array.isArray(e.roles)?e.roles:[]).some(n=>String(n||"").trim().toLowerCase()==="ceo")}function qe(e=""){const t=String(e||"").trim();return!(!t||t===Ne()||Me())}function Oe(){return String(N().user?.uid||"").trim()}async function je(){return c.firebasePromise||(c.firebasePromise=Promise.all([ee(()=>import("./firebase-config-BOk6-WYE.js"),__vite__mapDeps([0,1])),ee(()=>import("./vendor-firebase-D7Ks7H8l.js").then(e=>e.U),[])]).then(([e,t])=>{if(!e?.db)throw new Error("analytics-firebase-db-unavailable");return{db:e.db,firestore:t}}).catch(e=>{throw c.firebasePromise=null,e})),c.firebasePromise}function fe(){if(c.flushTimer||!c.queue.length)return;const e=c.windowObj;typeof e?.setTimeout=="function"&&(c.flushTimer=e.setTimeout(()=>{c.flushTimer=null,H()},Te))}async function H(){if(c.flushing||!c.queue.length||c.disabled)return;c.flushing=!0;const e=c.queue.splice(0,c.queue.length);try{const{db:t,firestore:r}=await je(),{collection:n,doc:a,writeBatch:s,serverTimestamp:i,increment:o}=r,l=new Map,m=s(t);let _=0;e.forEach(u=>{if(_>=400)return;const d=a(n(t,"restaurants",u.businessId,"analyticsEvents")),{__retried:v,...S}=u;m.set(d,{...S,createdAt:i()}),_+=1;const w=`${u.businessId}::${u.day}`;l.has(w)||l.set(w,{businessId:u.businessId,day:u.day,patch:{date:u.day}}),Ae(l.get(w).patch,Ie(u),$=>o($))}),l.forEach(({businessId:u,day:d,patch:v})=>{_>=480||(v.updatedAt=i(),m.set(a(t,"restaurants",u,"analyticsDaily",d),v,{merge:!0}),_+=1)}),_>0&&await m.commit()}catch(t){try{const r=e.filter(n=>n.__retried!==!0).map(n=>({...n,__retried:!0}));c.queue.unshift(...r.slice(0,pe))}catch{}console.warn("[mnyra][analytics] flush failed",t)}finally{c.flushing=!1,c.queue.length&&fe()}}function x(e="",t={}){try{if(c.disabled)return!1;const r=String(t?.businessId||"").trim();if(!qe(r)||t?.onceKey&&!ne(`${t.onceKey}`))return!1;const n=ce.includes(String(e||"").trim())?ne(`u:${e}:${r}`):!1,a=$e(e,{...t,isUnique:n},{now:new Date,sessionId:me(),userId:Oe()});return a?(c.queue.length>=pe&&c.queue.shift(),c.queue.push(a),fe(),!0):!1}catch(r){return console.warn("[mnyra][analytics] track failed",r),!1}}function q(e=N()){return String(e?.profileView?.profile?.restaurantId||"").trim()}function F(e=N()){const t=e?.profileView||{},r=t.routePayload&&typeof t.routePayload=="object"?t.routePayload:{},n=String(t.menuAccessSource||r.menuAccessSource||e?.profileAccessSource||"").trim().toLowerCase(),a=Math.max(0,Math.trunc(Number(t.tableNumber??r.tableNumber??e?.profileTableNumber??0)||0));return{menuAccessSource:n,tableNumber:a}}function Pe(e="",t=N()){const{menuAccessSource:r,tableNumber:n}=F(t);if(r==="qr"||n>0)return"qr";const a=String(e||"").trim().toLowerCase();if(a==="feed"||a==="home")return"feed";if(a==="restaurants"||a==="travel"||a==="shopping")return"restaurants";if(a==="search")return"search";if(a==="map")return"map";if(!a){try{const s=String(c.documentObj?.referrer||"").trim(),i=String(c.windowObj?.location?.host||"").trim();if(s&&i&&!s.includes(i))return"external"}catch{}return"direct"}return"other"}function Le(e=N()){const t=q(e);return{activeTab:String(e?.activeTab||"").trim().toLowerCase(),profileBusinessId:t,profileTopTab:String(e?.profileTopTab||"").trim().toLowerCase(),menuDetailKey:e?.menuDetail?.open?`${String(e.menuDetail.item?.id||e.menuDetail.itemId||"").trim()}`:"",checkoutOpen:!!e?.shopCart?.checkoutOpen,confirmationAt:Number(e?.shopCart?.confirmation?.createdAt||0)}}function Fe(e,t,r){if(!t.profileBusinessId||t.profileBusinessId===e.profileBusinessId)return;const n=Pe(e.activeTab==="profile"?"":e.activeTab,r),{tableNumber:a}=F(r);x("business_profile_view",{businessId:t.profileBusinessId,source:n,tableNumber:a}),n==="qr"&&x("qr_scan",{businessId:t.profileBusinessId,source:"qr",tableNumber:a,onceKey:`qr:${t.profileBusinessId}:${a}`}),n==="feed"&&x("feed_click",{businessId:t.profileBusinessId,source:"feed"})}function Ke(e,t,r){if(!t.profileBusinessId)return;const n=new Set(["menu","cart","favorites"]),a=e.profileBusinessId===t.profileBusinessId&&n.has(e.profileTopTab);if(!(t.profileTopTab==="menu")||a)return;const{menuAccessSource:i,tableNumber:o}=F(r);x("menu_open",{businessId:t.profileBusinessId,source:i==="qr"||o>0?"qr":"direct",tableNumber:o})}function Re(e,t,r){if(!t.menuDetailKey||t.menuDetailKey===e.menuDetailKey)return;const n=r?.menuDetail||{},a=n.item&&typeof n.item=="object"?n.item:{},s=String(n.restaurantId||a.restaurantId||q(r)||"").trim();if(!s)return;const{menuAccessSource:i,tableNumber:o}=F(r);x("product_view",{businessId:s,productId:a.id||n.itemId||t.menuDetailKey,productName:a.name||a.title||"",source:i==="qr"||o>0?"qr":"direct"})}function Ve(e,t,r){if(!t.checkoutOpen||e.checkoutOpen)return;const n=r?.shopCart||{},a=String(n.restaurantId||"").trim();if(!a)return;const s=Math.max(0,Math.trunc(Number(n.tableNumber||0)||0));x("order_started",{businessId:a,source:s>0||String(n.serviceMode||"").toLowerCase()==="table"?"qr":"direct",tableNumber:s})}function ze(){if(c.intersectionObserver)return c.intersectionObserver;const e=c.windowObj;return!e||typeof e.IntersectionObserver!="function"?null:(c.intersectionObserver=new e.IntersectionObserver(t=>{t.forEach(r=>{if(!r.isIntersecting||r.intersectionRatio<.5)return;const n=r.target;c.intersectionObserver?.unobserve(n);try{Be(n)}catch{}})},{threshold:[.5]}),c.intersectionObserver)}function Be(e){const t=N(),r=String(e.getAttribute("data-feed-post-open")||"").trim();if(r){x("feed_impression",{businessId:r,source:"feed",onceKey:`fi:${r}`});return}const n=String(e.getAttribute("data-feed-post-like")||"").trim();if(n){const s=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(o=>String(o?.id||"").trim()===n),i=String(s?.restaurantId||"").trim();i&&(x("post_impression",{businessId:i,postId:n,source:"feed",onceKey:`pi:${n}`}),x("feed_impression",{businessId:i,source:"feed",onceKey:`fi:${i}`}));return}const a=String(e.getAttribute("data-open-post")||"").trim();if(a){const s=q(t);s&&x("post_impression",{businessId:s,postId:a,source:"direct",onceKey:`pi:${a}`})}}function Ue(){const e=c.documentObj,t=ze();if(!e||!t)return;e.querySelectorAll("[data-feed-post-open], [data-feed-post-like], [data-open-post]").forEach(n=>{n.__mnyraAnalyticsObserved||(n.__mnyraAnalyticsObserved=!0,t.observe(n))})}function Qe(e){const t=String(e?.getAttribute?.("href")||"").toLowerCase();return t?t.startsWith("tel:")?"phone":t.includes("maps.google")||t.includes("google.com/maps")||t.startsWith("geo:")?"map":t.includes("instagram.com")||t.includes("facebook.com")||t.includes("tiktok.com")||t.includes("wa.me")||t.includes("whatsapp.com")?"social":"":""}function Ye(e){const t=N(),r=u=>e?.closest?.(u)||null,n=r("[data-feed-post-open]");if(n){const u=String(n.getAttribute("data-feed-post-open")||"").trim();u&&(x("feed_click",{businessId:u,source:"feed"}),x("post_click",{businessId:u,source:"feed"}));return}const a=r("[data-feed-post-like]");if(a){const u=String(a.getAttribute("data-feed-post-like")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(S=>String(S?.id||"").trim()===u),v=String(d?.restaurantId||"").trim();v&&u&&x("post_like",{businessId:v,postId:u,source:"feed"});return}const s=r("[data-feed-post-share]");if(s){const u=String(s.getAttribute("data-feed-post-share")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(S=>String(S?.id||"").trim()===u),v=String(d?.restaurantId||"").trim();v&&u&&x("post_share",{businessId:v,postId:u,source:"feed"});return}const i=r("[data-open-post]");if(i){const u=q(t),d=String(i.getAttribute("data-open-post")||"").trim();u&&d&&x("post_click",{businessId:u,postId:d,source:"direct"});return}const o=r("[data-menu-card-like]");if(o){const u=q(t),d=String(o.getAttribute("data-menu-card-like")||"").trim();u&&d&&x("product_like",{businessId:u,productId:d,source:"direct"});return}const l=r("[data-business-menu-category]");if(l){const u=q(t),d=String(l.getAttribute("data-business-menu-category")||"").trim();u&&d&&x("category_open",{businessId:u,categoryId:d,categoryName:String(l.textContent||"").trim().slice(0,80)});return}if(r('[data-action="kellner"]')){const u=q(t),{tableNumber:d}=F(t);u&&x("call_waiter_click",{businessId:u,tableNumber:d,source:d>0?"qr":"direct"});return}const _=r("a[href]");if(_){const u=q(t);if(!u)return;const d=Qe(_);d&&x("profile_contact_click",{businessId:u,contactKind:d})}}function _t(){try{if(!c.initialized||c.disabled)return;const e=N(),t=Le(e),r=c.observerSnapshot||{activeTab:"",profileBusinessId:"",profileTopTab:"",menuDetailKey:"",checkoutOpen:!1,confirmationAt:0};c.observerSnapshot=t,Fe(r,t,e),Ke(r,t,e),Re(r,t,e),Ve(r,t,e),Ue()}catch(e){console.warn("[mnyra][analytics] observe failed",e)}}function gt({state:e,windowObj:t,documentObj:r}={}){try{if(c.initialized)return;if(c.state=e||null,c.windowObj=t||(typeof window>"u"?null:window),c.documentObj=r||c.windowObj?.document||(typeof document>"u"?null:document),!c.state||!c.windowObj||!c.documentObj){c.disabled=!0;return}c.initialized=!0,me(),Ce(),c.documentObj.addEventListener("click",n=>{try{Ye(n.target)}catch{}},{capture:!0,passive:!0}),c.documentObj.addEventListener("visibilitychange",()=>{c.documentObj.visibilityState==="hidden"&&H()}),c.windowObj.addEventListener("pagehide",()=>{H()})}catch(n){c.disabled=!0,console.warn("[mnyra][analytics] init failed",n)}}const W=Object.freeze([{key:"today",label:"Sot",days:1},{key:"7d",label:"7 dite",days:7},{key:"30d",label:"30 dite",days:30},{key:"90d",label:"90 dite",days:90},{key:"custom",label:"Periudha ime",days:0}]),O=1440*60*1e3,J=366;function ye(e){const t=new Date(e);return t.setHours(0,0,0,0),t}function R(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||"").trim());if(!t)return null;const r=new Date(Number(t[1]),Number(t[2])-1,Number(t[3]));return Number.isNaN(r.getTime())?null:ye(r)}function He({rangeKey:e="7d",customFrom:t="",customTo:r="",now:n=new Date}={}){const a=ye(n),s=W.find(u=>u.key===e)||W[1];let i=a,o=a;if(s.key==="custom"){const u=R(t),d=R(r);if(!u||!d||u.getTime()>d.getTime())return null;i=u,o=d.getTime()>a.getTime()?a:d,Math.round((o.getTime()-i.getTime())/O)+1>J&&(i=new Date(o.getTime()-(J-1)*O))}else i=new Date(a.getTime()-(s.days-1)*O);const l=Math.round((o.getTime()-i.getTime())/O)+1,m=new Date(i.getTime()-O),_=new Date(m.getTime()-(l-1)*O);return{rangeKey:s.key,label:s.key==="custom"?`${E(i)} – ${E(o)}`:s.label,fromDay:E(i),toDay:E(o),prevFromDay:E(_),prevToDay:E(m),lengthDays:l}}function We(e="",t=""){const r=R(e),n=R(t);if(!r||!n||r.getTime()>n.getTime())return[];const a=[];for(let s=r.getTime();s<=n.getTime()&&(a.push(E(new Date(s))),!(a.length>J+2));s+=O);return a}function p(e){const t=Number(e);return Number.isFinite(t)?t:0}function T(e={},t={}){return Object.entries(t&&typeof t=="object"?t:{}).forEach(([r,n])=>{if(n&&typeof n=="object"){e[r]=T(e[r]&&typeof e[r]=="object"?e[r]:{},n);return}if(typeof n=="string"){e[r]=n;return}e[r]=p(e[r])+p(n)}),e}function re(e=[]){const t={counters:{},uniques:{},profileSources:{},contacts:{},hourly:{},posts:{},products:{},categories:{},tables:{},orders:{}},r=new Map;(Array.isArray(e)?e:[]).forEach(l=>{if(!l||typeof l!="object")return;const m=String(l.date||l.id||"").trim();m&&r.set(m,l),T(t.counters,l.counters),T(t.uniques,l.uniques),T(t.profileSources,l.profileSources),T(t.contacts,l.contacts),T(t.hourly,l.hourly),T(t.posts,l.posts),T(t.products,l.products),T(t.categories,l.categories),T(t.tables,l.tables),T(t.orders,l.orders)});const n=t.counters,a=t.orders,s=p(a.completed),i=Math.round(p(a.revenue)*100)/100,o={profileViews:p(n.business_profile_view),uniqueVisitors:p(t.uniques.business_profile_view),contactClicks:p(n.profile_contact_click),postImpressions:p(n.post_impression),postClicks:p(n.post_click),postLikes:p(n.post_like),postShares:p(n.post_share),menuOpens:p(n.menu_open),categoryOpens:p(n.category_open),productViews:p(n.product_view),qrScans:p(n.qr_scan),waiterCalls:p(n.call_waiter_click),ordersStarted:p(n.order_started),ordersCompleted:s,revenue:i,avgOrderValue:s>0?Math.round(i/s*100)/100:0,ordersQr:p(a.qr),ordersExternal:p(a.external),feedImpressions:p(n.feed_impression),feedClicks:p(n.feed_click)};return o.feedCtr=o.feedImpressions>0?Math.round(o.feedClicks/o.feedImpressions*1e3)/10:0,o.orderConversion=o.menuOpens>0?Math.round(o.ordersCompleted/o.menuOpens*1e3)/10:0,{summary:o,merged:t,byDay:r}}function Je(e=0,t=0){const r=p(e),n=p(t);return n<=0?r>0?null:0:Math.round((r-n)/n*1e3)/10}function Xe(e){if(e===null)return"neu";const t=p(e);return t===0?"±0 %":`${t>0?"+":"−"}${Math.abs(t).toLocaleString("de-DE")} %`}function L(e=0){const t=p(e),r=Math.abs(t);return r>=1e6?`${(t/1e6).toLocaleString("de-DE",{maximumFractionDigits:1})} Mio.`:r>=1e4?`${(t/1e3).toLocaleString("de-DE",{maximumFractionDigits:1})}k`:t.toLocaleString("de-DE",{maximumFractionDigits:r<100?2:0})}function ae({fromDay:e="",toDay:t="",byDay:r=new Map,resolveValue:n=()=>0}={}){return We(e,t).map(a=>{const s=r.get(a)||null;return{day:a,value:p(n(s))}})}function Ge(e={},t=8){return Object.entries(e.products||{}).map(([r,n])=>({productId:r,name:String(n?.name||"").trim()||r,views:p(n?.views),likes:p(n?.likes),orders:p(n?.orders),quantity:p(n?.quantity),revenue:Math.round(p(n?.revenue)*100)/100})).sort((r,n)=>n.views+n.orders*3-(r.views+r.orders*3)).slice(0,t)}function Ze(e={},t=5){return Object.entries(e.products||{}).map(([n,a])=>({productId:n,name:String(a?.name||"").trim()||n,views:p(a?.views),orders:p(a?.orders)})).sort((n,a)=>n.views+n.orders*3-(a.views+a.orders*3)).slice(0,t)}function et(e={},t=8){return Object.entries(e.posts||{}).map(([r,n])=>{const a=p(n?.impressions),s=p(n?.clicks);return{postId:r,impressions:a,clicks:s,likes:p(n?.likes),shares:p(n?.shares),ctr:a>0?Math.round(s/a*1e3)/10:0}}).sort((r,n)=>n.impressions+n.clicks*2-(r.impressions+r.clicks*2)).slice(0,t)}const tt=Object.freeze({feed:"Feed",restaurants:"Restaurant-Tab",search:"Kerkimi",map:"Harta",qr:"QR-Code",external:"Externe Links",direct:"Direkt",other:"Sonstige"});function nt(e={}){const t=Object.entries(e.profileSources||{}).map(([n,a])=>({key:n,label:tt[n]||n,count:p(a)})).filter(n=>n.count>0).sort((n,a)=>a.count-n.count),r=t.reduce((n,a)=>n+a.count,0);return t.map(n=>({...n,share:r>0?Math.round(n.count/r*1e3)/10:0}))}function B(e={},t="qrScans"){const r=e.hourly&&typeof e.hourly=="object"?e.hourly:{};return Array.from({length:24},(n,a)=>({hour:a,value:p(r[String(a)]?.[t])}))}function rt(e={},t=12){return Object.entries(e.tables||{}).map(([r,n])=>({tableKey:r,label:/^t\d+$/.test(r)?`Tavolina ${r.slice(1)}`:r,qrScans:p(n?.qrScans),waiterCalls:p(n?.waiterCalls),ordersCompleted:p(n?.ordersCompleted)})).sort((r,n)=>n.qrScans+n.ordersCompleted-(r.qrScans+r.ordersCompleted)).slice(0,t)}function at(e={},t=10){return Object.entries(e.categories||{}).map(([r,n])=>({categoryId:r,name:String(n?.name||"").trim()||r,opens:p(n?.opens)})).sort((r,n)=>n.opens-r.opens).slice(0,t)}function st(e={}){const t=[{key:"menuOpens",label:"Menuja u hap",value:p(e.menuOpens)},{key:"productViews",label:"Produkt angesehen",value:p(e.productViews)},{key:"ordersStarted",label:"Porosia filloi",value:p(e.ordersStarted)},{key:"ordersCompleted",label:"Porosia perfundoi",value:p(e.ordersCompleted)}],r=t[0].value;return t.map((n,a)=>{const s=a===0?n.value:t[a-1].value;return{...n,shareOfFirst:r>0?Math.round(n.value/r*1e3)/10:0,dropFromPrev:a===0||s<=0?0:Math.max(0,Math.round((s-n.value)/s*1e3)/10)}})}function it({range:e=null,currentDays:t=[],previousDays:r=[]}={}){if(!e)return null;const n=re(t),a=re(r),s=["profileViews","uniqueVisitors","menuOpens","productViews","postImpressions","qrScans","waiterCalls","ordersCompleted","revenue","feedImpressions"],i={};s.forEach(l=>{i[l]=Je(n.summary[l],a.summary[l])});const o=Object.values(n.summary).some(l=>p(l)>0);return{range:e,summary:n.summary,previousSummary:a.summary,deltas:i,hasAnyData:o,trend:{profileViews:ae({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:l=>l?.counters?.business_profile_view}),menuOpens:ae({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:l=>l?.counters?.menu_open})},funnel:st(n.summary),topProducts:Ge(n.merged),lowProducts:Ze(n.merged),topPosts:et(n.merged),sources:nt(n.merged),categories:at(n.merged),tables:rt(n.merged),hourlyQr:B(n.merged,"qrScans"),hourlyWaiter:B(n.merged,"waiterCalls"),hourlyOrders:B(n.merged,"ordersCompleted"),contacts:{phone:p(n.merged.contacts?.phone),address:p(n.merged.contacts?.address),map:p(n.merged.contacts?.map),hours:p(n.merged.contacts?.hours),social:p(n.merged.contacts?.social)}}}async function se({db:e,collectionFn:t,queryFn:r,whereFn:n,documentIdFn:a,getDocsFn:s,restaurantId:i="",fromDay:o="",toDay:l=""}={}){const m=String(i||"").trim(),_=String(o||"").trim(),u=String(l||"").trim();if(!e||typeof t!="function"||typeof r!="function"||typeof n!="function"||typeof a!="function"||typeof s!="function"||!m||!_||!u)return[];const d=t(e,"restaurants",m,"analyticsDaily");return(await s(r(d,n(a(),">=",_),n(a(),"<=",u)))).docs.map(S=>({id:S.id,...S.data()||{}}))}const ie="mnyraAnalyticsStyles",ot=`
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
`;function ct(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(ie)))try{const t=e.createElement("style");t.id=ie,t.textContent=ot,e.head?.appendChild(t)}catch{}}function g(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function he(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||""));return t?`${t[3]}.${t[2]}.`:e}function lt({rangeKey:e="7d",customFrom:t="",customTo:r=""}={}){const n=W.map(s=>`
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
    `:"";return`<div class="mnyra-an__filters" role="group" aria-label="Periudha">${n}</div>${a}`}function ut(e,{moreIsGood:t=!0}={}){if(e===void 0)return"";const r=Xe(e);let n="";if(e!==null&&e!==0){const a=e>0;n=(t?a:!a)?"mnyra-an__kpi-delta--up":"mnyra-an__kpi-delta--down"}return`<p class="mnyra-an__kpi-delta ${n}">${g(r)} <span style="color:var(--an-muted); font-weight:600;">vs. Vorperiode</span></p>`}function A({label:e="",value:t=0,delta:r,suffix:n="",moreIsGood:a=!0}={}){return`
    <div class="mnyra-an__card">
      <p class="mnyra-an__kpi-label">${g(e)}</p>
      <p class="mnyra-an__kpi-value">${g(L(t))}${n?` <span style="font-size:12px; color:var(--an-muted); font-weight:700;">${g(n)}</span>`:""}</p>
      ${ut(r,{moreIsGood:a})}
    </div>
  `}function dt({series:e=[],chartId:t="trend",height:r=150}={}){const n=(Array.isArray(e)?e:[]).filter(y=>Array.isArray(y?.points)&&y.points.length);if(!n.length)return"";const a=640,s={top:12,right:12,bottom:24,left:34},i=a-s.left-s.right,o=r-s.top-s.bottom,l=n[0].points.map(y=>y.day),m=l.length,_=Math.max(1,...n.flatMap(y=>y.points.map(k=>Number(k.value)||0))),u=Math.max(1,Math.ceil(_/4)*4),d=y=>s.left+(m<=1?i/2:y/(m-1)*i),v=y=>s.top+o-Math.max(0,Number(y)||0)/u*o,S=y=>String(y)==="2"?"var(--an-series-2)":"var(--an-series-1)",w=[0,.25,.5,.75,1].map(y=>{const k=s.top+o-y*o,D=Math.round(u*y);return`
      <line x1="${s.left}" y1="${k}" x2="${a-s.right}" y2="${k}" stroke="var(--an-grid)" stroke-width="1" />
      <text x="${s.left-6}" y="${k+3}" text-anchor="end" font-size="9" fill="var(--an-muted)" style="font-variant-numeric: tabular-nums;">${D.toLocaleString("de-DE")}</text>
    `}).join(""),$=Math.max(1,Math.ceil(m/6)),M=l.map((y,k)=>k%$!==0&&k!==m-1?"":`<text x="${d(k)}" y="${r-6}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${g(he(y))}</text>`).join(""),h=n.map(y=>{const k=y.points.map((z,Z)=>`${Z===0?"M":"L"}${d(Z).toFixed(1)},${v(z.value).toFixed(1)}`).join(" "),D=`${k} L${d(m-1).toFixed(1)},${(s.top+o).toFixed(1)} L${d(0).toFixed(1)},${(s.top+o).toFixed(1)} Z`,C=m-1,V=`<circle cx="${d(C).toFixed(1)}" cy="${v(y.points[C].value).toFixed(1)}" r="4" fill="${S(y.color)}" stroke="var(--an-surface)" stroke-width="2" />`;return`
      <path d="${D}" fill="${S(y.color)}" opacity="0.10" />
      <path d="${k}" fill="none" stroke="${S(y.color)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${V}
    `}).join(""),f=n.length>1?`
      <div class="mnyra-an__legend">
        ${n.map(y=>`
          <span class="mnyra-an__legend-item">
            <span class="mnyra-an__legend-swatch" style="background:${S(y.color)};"></span>${g(y.label)}
          </span>
        `).join("")}
      </div>
    `:"",b=g(JSON.stringify({days:l,pad:s,width:a,height:r,series:n.map(y=>({label:y.label,color:String(y.color)==="2"?"2":"1",values:y.points.map(k=>Number(k.value)||0)}))}));return`
    ${f}
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${g(t)}" data-analytics-chart-payload="${b}">
      <svg viewBox="0 0 ${a} ${r}" width="100%" height="auto" role="img" aria-label="Trend">
        ${w}
        <line data-analytics-crosshair x1="0" y1="${s.top}" x2="0" y2="${s.top+o}" stroke="var(--an-muted)" stroke-width="1" opacity="0" />
        ${h}
        ${M}
      </svg>
      <div class="mnyra-an__tooltip" data-analytics-tooltip></div>
    </div>
  `}function oe({rows:e=[],label:t="",chartId:r="hourly"}={}){const n=Array.isArray(e)?e:[];if(n.reduce((w,$)=>w+(Number($?.value)||0),0)<=0)return`<p class="mnyra-an__empty-note">Ende nuk ka te dhena per „${g(t)}“ ne kete periudhe.</p>`;const s=640,i=120,o={top:8,right:8,bottom:20,left:8},l=s-o.left-o.right,m=i-o.top-o.bottom,_=Math.max(1,...n.map(w=>Number(w?.value)||0)),u=l/24,d=Math.min(20,Math.max(6,u-2)),v=n.map(w=>{const $=Number(w?.value)||0,M=$<=0?0:Math.max(2,$/_*m),h=o.left+w.hour*u+(u-d)/2,f=o.top+m-M;return $<=0?"":`<path d="M${h.toFixed(1)},${(o.top+m).toFixed(1)} L${h.toFixed(1)},${(f+4).toFixed(1)} Q${h.toFixed(1)},${f.toFixed(1)} ${(h+4).toFixed(1)},${f.toFixed(1)} L${(h+d-4).toFixed(1)},${f.toFixed(1)} Q${(h+d).toFixed(1)},${f.toFixed(1)} ${(h+d).toFixed(1)},${(f+4).toFixed(1)} L${(h+d).toFixed(1)},${(o.top+m).toFixed(1)} Z"
          fill="var(--an-series-1)"><title>${g(`${w.hour}:00 Uhr – ${$.toLocaleString("de-DE")}`)}</title></path>`}).join(""),S=[0,6,12,18,23].map(w=>`
    <text x="${(o.left+w*u+u/2).toFixed(1)}" y="${i-5}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${w} Uhr</text>
  `).join("");return`
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${g(r)}">
      <svg viewBox="0 0 ${s} ${i}" width="100%" height="auto" role="img" aria-label="${g(t)}">
        <line x1="${o.left}" y1="${o.top+m}" x2="${s-o.right}" y2="${o.top+m}" stroke="var(--an-grid)" stroke-width="1" />
        ${v}
        ${S}
      </svg>
    </div>
  `}function pt(e=[]){const t=Array.isArray(e)?e:[];if(!t.length)return"";const r=Math.max(1,...t.map(n=>Number(n?.value)||0));return t.map((n,a)=>{const s=Number(n?.value)||0,i=Math.max(2,Math.round(s/r*100)),o=a>0&&n.dropFromPrev>0?` <span style="color:var(--an-down);">(−${n.dropFromPrev.toLocaleString("de-DE")} %)</span>`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${g(n.label)}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${i}%; opacity:${1-a*.15};"></div></div>
        <span class="mnyra-an__bar-value">${g(L(s))}${o}</span>
      </div>
    `}).join("")}function U(e=[],{labelKey:t="label",valueKey:r="count",suffix:n=""}={}){const a=Array.isArray(e)?e:[];if(!a.length)return'<p class="mnyra-an__empty-note">Ende nuk ka te dhena ne kete periudhe.</p>';const s=Math.max(1,...a.map(i=>Number(i?.[r])||0));return a.map(i=>{const o=Number(i?.[r])||0,l=Math.max(2,Math.round(o/s*100)),m=n==="%"&&Number.isFinite(Number(i?.share))?` · ${Number(i.share).toLocaleString("de-DE")} %`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${g(String(i?.[t]||""))}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${l}%;"></div></div>
        <span class="mnyra-an__bar-value">${g(L(o))}${g(m)}</span>
      </div>
    `}).join("")}function K({columns:e=[],rows:t=[],emptyLabel:r="Ende nuk ka te dhena."}={}){return t.length?`
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
  `:`<p class="mnyra-an__empty-note">${g(r)}</p>`}function mt(){return`
    <div class="mnyra-an__grid" aria-hidden="true">
      ${Array.from({length:4},()=>'<div class="mnyra-an__skeleton" style="height:88px;"></div>').join("")}
    </div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:180px;"></div></div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:140px;"></div></div>
  `}function X({title:e="Ende nuk ka te dhena analitike",body:t=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">${g(e)}</p>
      <p class="mnyra-an__state-body">${g(t||"Sapo vizitoret te shikojne profilin, menune ose postimet e tua, statistikat e tua shfaqen ketu.")}</p>
    </div>
  `}function ft({message:e=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">Analitika nuk mund te ngarkohej</p>
      <p class="mnyra-an__state-body">${g(e||"Ju lutem kontrolloni lidhjen dhe provoni perseri.")}</p>
      <button type="button" class="mnyra-an__retry" data-analytics-retry>Provo perseri</button>
    </div>
  `}function yt(e=null,{currency:t="€"}={}){if(!e)return X({});const{summary:r,deltas:n}=e;if(!e.hasAnyData)return X({body:`Ne periudhen „${e.range.label}“ ende nuk ka te dhena. Ndaj profilin tend, QR kodet e tua ose posto ne feed per te rritur shtrirjen.`});const a=[A({label:"Vizitore te profilit",value:r.profileViews,delta:n.profileViews}),A({label:"Vizitore unike",value:r.uniqueVisitors,delta:n.uniqueVisitors}),A({label:"Shikime te menuse",value:r.menuOpens,delta:n.menuOpens}),A({label:"Produkt-Ansichten",value:r.productViews,delta:n.productViews}),A({label:"Beitrags-Impressionen",value:r.postImpressions,delta:n.postImpressions}),A({label:"QR-Scans",value:r.qrScans,delta:n.qrScans}),A({label:"Thirrje kamarieri",value:r.waiterCalls,delta:n.waiterCalls}),A({label:"Porosite",value:r.ordersCompleted,delta:n.ordersCompleted}),A({label:"Umsatz",value:r.revenue,delta:n.revenue,suffix:t}),A({label:"Ø Bestellwert",value:r.avgOrderValue,suffix:t}),A({label:"Shtrirja ne feed",value:r.feedImpressions,delta:n.feedImpressions}),A({label:"Feed-Klickrate",value:r.feedCtr,suffix:"%"})].join(""),s=dt({chartId:"profileTrend",series:[{key:"profileViews",label:"Vizitore te profilit",color:"1",points:e.trend.profileViews},{key:"menuOpens",label:"Shikime te menuse",color:"2",points:e.trend.menuOpens}]}),i=K({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Porosite"},{key:"revenue",label:`Umsatz (${t})`,render:d=>d.revenue>0?d.revenue.toLocaleString("de-DE"):"–"}],rows:e.topProducts,emptyLabel:"Ende nuk ka te dhena produktesh ne kete periudhe."}),o=e.lowProducts.length&&e.topProducts.length>e.lowProducts.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Wenig Aufmerksamkeit</h3>
        <div class="mnyra-an__card">
          ${K({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Porosite"}],rows:e.lowProducts})}
          <p class="mnyra-an__empty-note">Keshille: Keto produkte marrin pak vemendje – foto me te mira, pozicioni ne menu ose nje oferte mund te ndihmojne.</p>
        </div>
      </div>
    `:"",l=K({columns:[{key:"postId",label:"Beitrag"},{key:"impressions",label:"Impressionen"},{key:"clicks",label:"Klicks"},{key:"likes",label:"Likes"},{key:"ctr",label:"CTR %",render:d=>d.ctr.toLocaleString("de-DE")}],rows:e.topPosts,emptyLabel:"Ende nuk ka te dhena postimesh ne kete periudhe."}),m=e.tables.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Tavolinat</h3>
        <div class="mnyra-an__card">
          ${K({columns:[{key:"label",label:"Tavolina"},{key:"qrScans",label:"QR-Scans"},{key:"waiterCalls",label:"Thirrje kamarieri"},{key:"ordersCompleted",label:"Porosite"}],rows:e.tables})}
        </div>
      </div>
    `:"",_=e.categories.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kategorien</h3>
        <div class="mnyra-an__card">
          ${U(e.categories,{labelKey:"name",valueKey:"opens"})}
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
        ${pt(e.funnel)}
        <p class="mnyra-an__empty-note">Konvertimi menu → porosi: ${g(String(r.orderConversion.toLocaleString("de-DE")))} % · Porosi me QR: ${g(L(r.ordersQr))} · Te jashtme: ${g(L(r.ordersExternal))}</p>
      </div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Klickquellen</h3>
      <div class="mnyra-an__card">${U(e.sources,{suffix:"%"})}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Produkte</h3>
      <div class="mnyra-an__card">${i}</div>
    </div>
    ${o}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Top Beiträge</h3>
      <div class="mnyra-an__card">${l}</div>
    </div>

    ${_}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">QR-skanime sipas ores</h3>
      <div class="mnyra-an__card">${oe({rows:e.hourlyQr,label:"QR-Scans",chartId:"hourlyQr"})}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Thirrjet e kamarierit sipas ores</h3>
      <div class="mnyra-an__card">${oe({rows:e.hourlyWaiter,label:"Thirrje kamarieri",chartId:"hourlyWaiter"})}</div>
    </div>

    ${u.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kontakt-Klicks</h3>
        <div class="mnyra-an__card">${U(u)}</div>
      </div>
    `:""}

    ${m}
  `}function ht(e=typeof document>"u"?null:document){e?.querySelectorAll&&e.querySelectorAll("[data-analytics-chart-payload]").forEach(t=>{if(t.__mnyraAnalyticsChartBound)return;t.__mnyraAnalyticsChartBound=!0;let r=null;try{r=JSON.parse(t.getAttribute("data-analytics-chart-payload")||"null")}catch{}if(!r||!Array.isArray(r.days)||!r.days.length)return;const n=t.querySelector("svg"),a=t.querySelector("[data-analytics-crosshair]"),s=t.querySelector("[data-analytics-tooltip]");if(!n||!a||!s)return;const{pad:i,width:o}=r,l=o-i.left-i.right,m=r.days.length,_=()=>{a.setAttribute("opacity","0"),s.classList.remove("mnyra-an__tooltip--visible")},u=d=>{const v=n.getBoundingClientRect();if(!v.width)return;const S=o/v.width,w=(d.clientX-v.left)*S,$=Math.min(1,Math.max(0,(w-i.left)/Math.max(1,l))),M=Math.round($*(m-1)),h=i.left+(m<=1?l/2:M/(m-1)*l);a.setAttribute("x1",String(h)),a.setAttribute("x2",String(h)),a.setAttribute("opacity","0.6"),s.textContent="";const f=e.createElement?e.createElement("div"):document.createElement("div");f.textContent=he(r.days[M]),f.style.fontWeight="800",s.appendChild(f),r.series.forEach(b=>{const y=document.createElement("div"),k=document.createElement("span");k.className="mnyra-an__tooltip-key",k.style.background=b.color==="2"?"var(--an-series-2)":"var(--an-series-1)";const D=document.createElement("span");D.className="mnyra-an__tooltip-value",D.textContent=Number(b.values[M]||0).toLocaleString("de-DE");const C=document.createElement("span");C.textContent=` ${b.label}`,y.appendChild(k),y.appendChild(D),y.appendChild(C),s.appendChild(y)}),s.style.left=`${h/o*100}%`,s.style.top="0px",s.classList.add("mnyra-an__tooltip--visible")};n.addEventListener("pointermove",u),n.addEventListener("pointerdown",u),n.addEventListener("pointerleave",_)})}function vt({state:e,renderFn:t,documentObj:r,firestoreApi:n={}}={}){const a=r||(typeof document>"u"?null:document),s=typeof t=="function"?t:()=>{};let i=0,o=!1;function l(){return(!e.analyticsView||typeof e.analyticsView!="object")&&(e.analyticsView={status:"idle",error:"",rangeKey:"7d",customFrom:"",customTo:"",loadedRangeSignature:"",restaurantId:"",model:null}),e.analyticsView}function m(h=""){const f=l(),b=String(h||"").trim();return String(f.restaurantId||"")===b||(f.restaurantId=b,f.model=null,f.status="idle",f.error="",f.loadedRangeSignature="",i+=1),f}function _(){const h=e?.userProfile||{};return String(h.restaurantId||h.staffRestaurantId||"").trim()}function u(h,f){return`${f}::${h.fromDay}::${h.toDay}`}async function d({force:h=!1}={}){const f=_(),b=m(f);if(!f){b.status="empty-business";return}const y=He({rangeKey:b.rangeKey,customFrom:b.customFrom,customTo:b.customTo});if(!y){b.status="error",b.error="Ju lutem zgjidhni nje periudhe te vlefshme (data e fillimit para dates se mbarimit).",s();return}const k=u(y,f);if(!h&&b.loadedRangeSignature===k&&b.status==="ready")return;i+=1;const D=i;b.status="loading",b.error="",s();try{const C={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:f},[V,z]=await Promise.all([se({...C,fromDay:y.fromDay,toDay:y.toDay}),se({...C,fromDay:y.prevFromDay,toDay:y.prevToDay})]);if(D!==i)return;b.model=it({range:y,currentDays:V,previousDays:z}),b.loadedRangeSignature=k,b.status="ready"}catch(C){if(D!==i)return;console.error("[mnyra][analytics] dashboard load failed",C),b.status="error",b.error="Analitika nuk mund te ngarkohej."}s()}function v(h="7d"){const f=l();f.rangeKey=String(h||"7d").trim()||"7d",f.rangeKey!=="custom"&&d({force:!1}),s()}function S(){const h=l(),f=a?.querySelector?.("[data-analytics-custom-from]"),b=a?.querySelector?.("[data-analytics-custom-to]");h.customFrom=String(f?.value||h.customFrom||"").trim(),h.customTo=String(b?.value||h.customTo||"").trim(),d({force:!0})}function w(){o||!a||(o=!0,a.addEventListener("click",h=>{try{if(!h.target?.closest?.("[data-analytics-root]"))return;const f=h.target?.closest?.("[data-analytics-range]");if(f){v(f.getAttribute("data-analytics-range"));return}if(h.target?.closest?.("[data-analytics-custom-apply]")){S();return}h.target?.closest?.("[data-analytics-retry]")&&d({force:!0})}catch{}}))}function $(){if(!a)return;((a.defaultView||(typeof window>"u"?null:window))?.requestAnimationFrame||(b=>setTimeout(b,0)))(()=>{try{ht(a)}catch{}})}function M(){ct(a),w();const h=_(),f=m(h);let b="";if(!h)b=X({title:"Nuk ka profil biznesi te lidhur",body:"Analitika eshte e disponueshme vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant ose dyqan, statistikat e tua shfaqen ketu."});else if(f.status==="idle"||f.status==="loading"&&!f.model)f.status==="idle"&&(queueMicrotask(()=>{d({force:!1})}),f.status="loading"),b=mt();else if(f.status==="error")b=ft({message:f.error});else{const y=yt(f.model);b=f.status==="loading"?`<div style="opacity:0.55; pointer-events:none;">${y}</div>`:y}return $(),`
      <section class="p-4 pb-28 mnyra-an" data-analytics-root>
        <div class="mb-4">
          <h2 class="text-lg font-black tracking-tight text-slate-900" style="color:var(--an-ink);">Analytics</h2>
          <p class="text-xs" style="color:var(--an-muted); margin-top:2px;">Shtrirja jote, performanca e menuse dhe porosite me nje shikim.</p>
        </div>
        ${lt({rangeKey:f.rangeKey,customFrom:f.customFrom,customTo:f.customTo})}
        ${b}
      </section>
    `}return Object.freeze({renderAnalyticsView:M,loadAnalytics:d,setRange:v})}export{vt as c,L as f,gt as i,se as l,_t as o,He as r,re as s,x as t};
