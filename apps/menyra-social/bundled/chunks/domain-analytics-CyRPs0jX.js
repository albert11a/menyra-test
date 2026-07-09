const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/firebase-config-BOk6-WYE.js","chunks/vendor-firebase-D7Ks7H8l.js"])))=>i.map(i=>d[i]);
import{_ as J}from"./domain-auth-BL21ERPm.js";const he=Object.freeze(["business_profile_view","profile_contact_click","post_impression","post_click","post_like","post_share","menu_open","category_open","product_view","product_like","qr_scan","call_waiter_click","order_started","order_completed","feed_impression","feed_click"]),ge=new Set(he),_e=Object.freeze(["feed","restaurants","search","map","qr","external","direct","other"]),ve=new Set(_e),we=Object.freeze(["phone","address","map","hours","social"]),ke=new Set(we),oe=Object.freeze(["business_profile_view","menu_open","qr_scan"]);function Se(e=""){return ge.has(String(e||"").trim())}function U(e=""){const t=String(e||"").trim().toLowerCase();return t?ve.has(t)?t:t==="home"?"feed":t==="restaurant"||t==="marketplace"?"restaurants":t==="table"||t==="table-qr"||t==="qr-code"?"qr":t==="link"||t==="share"||t==="referrer"?"external":"other":"direct"}function ce(e=""){const t=String(e||"").trim().toLowerCase();return ke.has(t)?t:""}function L(e="",{prefix:t=""}={}){const r=String(e??"").trim();if(!r)return"";const n=r.replace(/[.~*/[\]#$]/g,"_").replace(/\s+/g,"_").slice(0,120);return n?t?`${t}${n}`:n:""}function le(e="",t=0){const r=Math.max(0,Math.trunc(Number(t)||0)),n=L(e);return n?n.startsWith("t")?n:`t${n}`:r>0?`t${r}`:""}function N(e=new Date){const t=e instanceof Date?e:new Date(e);if(Number.isNaN(t.getTime()))return"";const r=t.getFullYear(),n=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${r}-${n}-${a}`}function xe(e=new Date){const t=e instanceof Date?e:new Date(e);return Number.isNaN(t.getTime())?"0":String(t.getHours())}function T(e="",t=200){return String(e??"").trim().slice(0,t)}function P(e,t=0){const r=Number(e);return Number.isFinite(r)?r:t}function $e(e="",t={},{now:r=new Date,sessionId:n="",userId:a=""}={}){const s=String(e||"").trim();if(!Se(s))return null;const i=T(t.businessId,180);if(!i)return null;const o={name:s,businessId:i,sessionId:T(n,120),day:N(r),hour:Math.max(0,Math.min(23,Math.trunc(P(xe(r),0))))},l={userId:T(a||t.userId,180),source:U(t.source),postId:T(t.postId,180),productId:T(t.productId,180),productName:T(t.productName,160),menuId:T(t.menuId,180),categoryId:T(t.categoryId,120),categoryName:T(t.categoryName,120),contactKind:ce(t.contactKind),tableId:le(t.tableId,t.tableNumber),orderId:T(t.orderId,180)};Object.entries(l).forEach(([c,d])=>{d&&(o[c]=d)});const m=P(t.value,0);m>0&&(o.value=Math.round(m*100)/100);const g=Math.max(0,Math.trunc(P(t.quantity,0)));if(g>0&&(o.quantity=g),t.isUnique===!0&&(o.isUnique=!0),Array.isArray(t.items)){const c=t.items.map(d=>({productId:T(d?.productId||d?.itemId||d?.id,180),name:T(d?.name,160),quantity:Math.max(1,Math.trunc(P(d?.quantity,1))),revenue:Math.max(0,Math.round(P(d?.revenue,0)*100)/100)})).filter(d=>d.productId).slice(0,60);c.length&&(o.items=c)}return o}function Ie(e=null){if(!e||!e.name||!e.businessId)return[];const t=[],r=(i,o=1)=>t.push({path:i,n:o}),n=(i,o)=>t.push({path:i,set:o});r(["counters",e.name],1),e.isUnique&&oe.includes(e.name)&&r(["uniques",e.name],1);const a=String(Math.max(0,Math.min(23,Math.trunc(Number(e.hour)||0)))),s=le(e.tableId,e.tableNumber);switch(e.name){case"business_profile_view":{r(["profileSources",U(e.source)],1);break}case"profile_contact_click":{const i=ce(e.contactKind);i&&r(["contacts",i],1);break}case"post_impression":case"post_click":case"post_like":case"post_share":{const i=L(e.postId);if(i){const o=e.name==="post_impression"?"impressions":e.name==="post_click"?"clicks":e.name==="post_like"?"likes":"shares";r(["posts",i,o],1)}break}case"category_open":{const i=L(e.categoryId);i&&(r(["categories",i,"opens"],1),e.categoryName&&n(["categories",i,"name"],e.categoryName));break}case"product_view":case"product_like":{const i=L(e.productId);i&&(r(["products",i,e.name==="product_view"?"views":"likes"],1),e.productName&&n(["products",i,"name"],e.productName));break}case"qr_scan":{r(["hourly",a,"qrScans"],1),s&&r(["tables",s,"qrScans"],1);break}case"call_waiter_click":{r(["hourly",a,"waiterCalls"],1),s&&r(["tables",s,"waiterCalls"],1);break}case"order_started":{r(["orders","started"],1);break}case"order_completed":{r(["orders","completed"],1),r(["hourly",a,"ordersCompleted"],1),r(["orders",U(e.source)==="qr"?"qr":"external"],1);const i=Math.max(0,Number(e.value)||0);i>0&&r(["orders","revenue"],Math.round(i*100)/100);const o=Math.max(0,Math.trunc(Number(e.quantity)||0));o>0&&r(["orders","itemCount"],o),s&&r(["tables",s,"ordersCompleted"],1),(Array.isArray(e.items)?e.items:[]).forEach(l=>{const m=L(l.productId);if(!m)return;r(["products",m,"orders"],1),r(["products",m,"quantity"],Math.max(1,Math.trunc(Number(l.quantity)||1)));const g=Math.max(0,Number(l.revenue)||0);g>0&&r(["products",m,"revenue"],Math.round(g*100)/100),l.name&&n(["products",m,"name"],l.name)});break}}return t}function Ae(e={},t=[],r=n=>n){return(Array.isArray(t)?t:[]).forEach(n=>{const a=Array.isArray(n?.path)?n.path.map(l=>String(l||"").trim()).filter(Boolean):[];if(!a.length)return;let s=e;for(let l=0;l<a.length-1;l+=1){const m=a[l];(!s[m]||typeof s[m]!="object")&&(s[m]={}),s=s[m]}const i=a[a.length-1];if(Object.prototype.hasOwnProperty.call(n,"set")){s[i]=n.set;return}const o=Number(n?.n);!Number.isFinite(o)||o===0||(s[i]=r(o))}),e}const ee="mnyra_analytics_session_v1",ue="mnyra_analytics_dedupe_v1",Te=2500,de=300,Q=600,u={initialized:!1,state:null,windowObj:null,documentObj:null,queue:[],flushTimer:null,flushing:!1,sessionId:"",dedupe:{day:"",keys:[]},dedupeSet:new Set,observerSnapshot:null,intersectionObserver:null,firebasePromise:null,disabled:!1};function G(e){try{return e?.sessionStorage||null}catch{return null}}function De(){try{if(typeof crypto<"u"&&crypto.randomUUID)return crypto.randomUUID()}catch{}return`s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`}function pe(){if(u.sessionId)return u.sessionId;const e=G(u.windowObj);let t="";try{t=String(e?.getItem(ee)||"").trim()}catch{}if(!t){t=De();try{e?.setItem(ee,t)}catch{}}return u.sessionId=t,t}function Ce(){const e=G(u.windowObj),t=N(new Date);let r=null;try{r=JSON.parse(e?.getItem(ue)||"null")}catch{}(!r||r.day!==t||!Array.isArray(r.keys))&&(r={day:t,keys:[]}),u.dedupe=r,u.dedupeSet=new Set(r.keys)}function Ne(){const e=G(u.windowObj);try{e?.setItem(ue,JSON.stringify({day:u.dedupe.day,keys:u.dedupe.keys.slice(-Q)}))}catch{}}function te(e=""){const t=String(e||"").trim();if(!t)return!1;const r=N(new Date);return u.dedupe.day!==r&&(u.dedupe={day:r,keys:[]},u.dedupeSet=new Set),u.dedupeSet.has(t)?!1:(u.dedupeSet.add(t),u.dedupe.keys.push(t),u.dedupe.keys.length>Q&&(u.dedupe.keys=u.dedupe.keys.slice(-Q),u.dedupeSet=new Set(u.dedupe.keys)),Ne(),!0)}function M(){return u.state||{}}function Me(){const e=M().userProfile||{};return String(e.restaurantId||e.staffRestaurantId||"").trim()}function Ee(){const e=M().userProfile||{};return String(e.role||"").trim().toLowerCase()==="ceo"?!0:(Array.isArray(e.roles)?e.roles:[]).some(n=>String(n||"").trim().toLowerCase()==="ceo")}function Oe(e=""){const t=String(e||"").trim();return!(!t||t===Me()||Ee())}function qe(){return String(M().user?.uid||"").trim()}async function Pe(){return u.firebasePromise||(u.firebasePromise=Promise.all([J(()=>import("./firebase-config-BOk6-WYE.js"),__vite__mapDeps([0,1])),J(()=>import("./vendor-firebase-D7Ks7H8l.js").then(e=>e.U),[])]).then(([e,t])=>{if(!e?.db)throw new Error("analytics-firebase-db-unavailable");return{db:e.db,firestore:t}}).catch(e=>{throw u.firebasePromise=null,e})),u.firebasePromise}function me(){if(u.flushTimer||!u.queue.length)return;const e=u.windowObj;typeof e?.setTimeout=="function"&&(u.flushTimer=e.setTimeout(()=>{u.flushTimer=null,Y()},Te))}async function Y(){if(u.flushing||!u.queue.length||u.disabled)return;u.flushing=!0;const e=u.queue.splice(0,u.queue.length);try{const{db:t,firestore:r}=await Pe(),{collection:n,doc:a,writeBatch:s,serverTimestamp:i,increment:o}=r,l=new Map,m=s(t);let g=0;e.forEach(c=>{if(g>=400)return;const d=a(n(t,"restaurants",c.businessId,"analyticsEvents")),{__retried:v,...S}=c;m.set(d,{...S,createdAt:i()}),g+=1;const k=`${c.businessId}::${c.day}`;l.has(k)||l.set(k,{businessId:c.businessId,day:c.day,patch:{date:c.day}}),Ae(l.get(k).patch,Ie(c),I=>o(I))}),l.forEach(({businessId:c,day:d,patch:v})=>{g>=480||(v.updatedAt=i(),m.set(a(t,"restaurants",c,"analyticsDaily",d),v,{merge:!0}),g+=1)}),g>0&&await m.commit()}catch(t){try{const r=e.filter(n=>n.__retried!==!0).map(n=>({...n,__retried:!0}));u.queue.unshift(...r.slice(0,de))}catch{}console.warn("[mnyra][analytics] flush failed",t)}finally{u.flushing=!1,u.queue.length&&me()}}function x(e="",t={}){try{if(u.disabled)return!1;const r=String(t?.businessId||"").trim();if(!Oe(r)||t?.onceKey&&!te(`${t.onceKey}`))return!1;const n=oe.includes(String(e||"").trim())?te(`u:${e}:${r}`):!1,a=$e(e,{...t,isUnique:n},{now:new Date,sessionId:pe(),userId:qe()});return a?(u.queue.length>=de&&u.queue.shift(),u.queue.push(a),me(),!0):!1}catch(r){return console.warn("[mnyra][analytics] track failed",r),!1}}function E(e=M()){return String(e?.profileView?.profile?.restaurantId||"").trim()}function K(e=M()){const t=e?.profileView||{},r=t.routePayload&&typeof t.routePayload=="object"?t.routePayload:{},n=String(t.menuAccessSource||r.menuAccessSource||e?.profileAccessSource||"").trim().toLowerCase(),a=Math.max(0,Math.trunc(Number(t.tableNumber??r.tableNumber??e?.profileTableNumber??0)||0));return{menuAccessSource:n,tableNumber:a}}function Le(e="",t=M()){const{menuAccessSource:r,tableNumber:n}=K(t);if(r==="qr"||n>0)return"qr";const a=String(e||"").trim().toLowerCase();if(a==="feed"||a==="home")return"feed";if(a==="restaurants"||a==="travel"||a==="shopping")return"restaurants";if(a==="search")return"search";if(a==="map")return"map";if(!a){try{const s=String(u.documentObj?.referrer||"").trim(),i=String(u.windowObj?.location?.host||"").trim();if(s&&i&&!s.includes(i))return"external"}catch{}return"direct"}return"other"}function Fe(e=M()){const t=E(e);return{activeTab:String(e?.activeTab||"").trim().toLowerCase(),profileBusinessId:t,profileTopTab:String(e?.profileTopTab||"").trim().toLowerCase(),menuDetailKey:e?.menuDetail?.open?`${String(e.menuDetail.item?.id||e.menuDetail.itemId||"").trim()}`:"",checkoutOpen:!!e?.shopCart?.checkoutOpen,confirmationAt:Number(e?.shopCart?.confirmation?.createdAt||0)}}function Ke(e,t,r){if(!t.profileBusinessId||t.profileBusinessId===e.profileBusinessId)return;const n=Le(e.activeTab==="profile"?"":e.activeTab,r),{tableNumber:a}=K(r);x("business_profile_view",{businessId:t.profileBusinessId,source:n,tableNumber:a}),n==="qr"&&x("qr_scan",{businessId:t.profileBusinessId,source:"qr",tableNumber:a,onceKey:`qr:${t.profileBusinessId}:${a}`}),n==="feed"&&x("feed_click",{businessId:t.profileBusinessId,source:"feed"})}function je(e,t,r){if(!t.profileBusinessId)return;const n=new Set(["menu","cart","favorites"]),a=e.profileBusinessId===t.profileBusinessId&&n.has(e.profileTopTab);if(!(t.profileTopTab==="menu")||a)return;const{menuAccessSource:i,tableNumber:o}=K(r);x("menu_open",{businessId:t.profileBusinessId,source:i==="qr"||o>0?"qr":"direct",tableNumber:o})}function Be(e,t,r){if(!t.menuDetailKey||t.menuDetailKey===e.menuDetailKey)return;const n=r?.menuDetail||{},a=n.item&&typeof n.item=="object"?n.item:{},s=String(n.restaurantId||a.restaurantId||E(r)||"").trim();if(!s)return;const{menuAccessSource:i,tableNumber:o}=K(r);x("product_view",{businessId:s,productId:a.id||n.itemId||t.menuDetailKey,productName:a.name||a.title||"",source:i==="qr"||o>0?"qr":"direct"})}function Re(e,t,r){if(!t.checkoutOpen||e.checkoutOpen)return;const n=r?.shopCart||{},a=String(n.restaurantId||"").trim();if(!a)return;const s=Math.max(0,Math.trunc(Number(n.tableNumber||0)||0));x("order_started",{businessId:a,source:s>0||String(n.serviceMode||"").toLowerCase()==="table"?"qr":"direct",tableNumber:s})}function Ve(){if(u.intersectionObserver)return u.intersectionObserver;const e=u.windowObj;return!e||typeof e.IntersectionObserver!="function"?null:(u.intersectionObserver=new e.IntersectionObserver(t=>{t.forEach(r=>{if(!r.isIntersecting||r.intersectionRatio<.5)return;const n=r.target;u.intersectionObserver?.unobserve(n);try{ze(n)}catch{}})},{threshold:[.5]}),u.intersectionObserver)}function ze(e){const t=M(),r=String(e.getAttribute("data-feed-post-open")||"").trim();if(r){x("feed_impression",{businessId:r,source:"feed",onceKey:`fi:${r}`});return}const n=String(e.getAttribute("data-feed-post-like")||"").trim();if(n){const s=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(o=>String(o?.id||"").trim()===n),i=String(s?.restaurantId||"").trim();i&&(x("post_impression",{businessId:i,postId:n,source:"feed",onceKey:`pi:${n}`}),x("feed_impression",{businessId:i,source:"feed",onceKey:`fi:${i}`}));return}const a=String(e.getAttribute("data-open-post")||"").trim();if(a){const s=E(t);s&&x("post_impression",{businessId:s,postId:a,source:"direct",onceKey:`pi:${a}`})}}function Ue(){const e=u.documentObj,t=Ve();if(!e||!t)return;e.querySelectorAll("[data-feed-post-open], [data-feed-post-like], [data-open-post]").forEach(n=>{n.__mnyraAnalyticsObserved||(n.__mnyraAnalyticsObserved=!0,t.observe(n))})}function Qe(e){const t=String(e?.getAttribute?.("href")||"").toLowerCase();return t?t.startsWith("tel:")?"phone":t.includes("maps.google")||t.includes("google.com/maps")||t.startsWith("geo:")?"map":t.includes("instagram.com")||t.includes("facebook.com")||t.includes("tiktok.com")||t.includes("wa.me")||t.includes("whatsapp.com")?"social":"":""}function Ye(e){const t=M(),r=c=>e?.closest?.(c)||null,n=r("[data-feed-post-open]");if(n){const c=String(n.getAttribute("data-feed-post-open")||"").trim();c&&(x("feed_click",{businessId:c,source:"feed"}),x("post_click",{businessId:c,source:"feed"}));return}const a=r("[data-feed-post-like]");if(a){const c=String(a.getAttribute("data-feed-post-like")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(S=>String(S?.id||"").trim()===c),v=String(d?.restaurantId||"").trim();v&&c&&x("post_like",{businessId:v,postId:c,source:"feed"});return}const s=r("[data-feed-post-share]");if(s){const c=String(s.getAttribute("data-feed-post-share")||"").trim(),d=(Array.isArray(t?.feedPosts)?t.feedPosts:[]).find(S=>String(S?.id||"").trim()===c),v=String(d?.restaurantId||"").trim();v&&c&&x("post_share",{businessId:v,postId:c,source:"feed"});return}const i=r("[data-open-post]");if(i){const c=E(t),d=String(i.getAttribute("data-open-post")||"").trim();c&&d&&x("post_click",{businessId:c,postId:d,source:"direct"});return}const o=r("[data-menu-card-like]");if(o){const c=E(t),d=String(o.getAttribute("data-menu-card-like")||"").trim();c&&d&&x("product_like",{businessId:c,productId:d,source:"direct"});return}const l=r("[data-business-menu-category]");if(l){const c=E(t),d=String(l.getAttribute("data-business-menu-category")||"").trim();c&&d&&x("category_open",{businessId:c,categoryId:d,categoryName:String(l.textContent||"").trim().slice(0,80)});return}if(r('[data-action="kellner"]')){const c=E(t),{tableNumber:d}=K(t);c&&x("call_waiter_click",{businessId:c,tableNumber:d,source:d>0?"qr":"direct"});return}const g=r("a[href]");if(g){const c=E(t);if(!c)return;const d=Qe(g);d&&x("profile_contact_click",{businessId:c,contactKind:d})}}function gt(){try{if(!u.initialized||u.disabled)return;const e=M(),t=Fe(e),r=u.observerSnapshot||{activeTab:"",profileBusinessId:"",profileTopTab:"",menuDetailKey:"",checkoutOpen:!1,confirmationAt:0};u.observerSnapshot=t,Ke(r,t,e),je(r,t,e),Be(r,t,e),Re(r,t,e),Ue()}catch(e){console.warn("[mnyra][analytics] observe failed",e)}}function _t({state:e,windowObj:t,documentObj:r}={}){try{if(u.initialized)return;if(u.state=e||null,u.windowObj=t||(typeof window>"u"?null:window),u.documentObj=r||u.windowObj?.document||(typeof document>"u"?null:document),!u.state||!u.windowObj||!u.documentObj){u.disabled=!0;return}u.initialized=!0,pe(),Ce(),u.documentObj.addEventListener("click",n=>{try{Ye(n.target)}catch{}},{capture:!0,passive:!0}),u.documentObj.addEventListener("visibilitychange",()=>{u.documentObj.visibilityState==="hidden"&&Y()}),u.windowObj.addEventListener("pagehide",()=>{Y()})}catch(n){u.disabled=!0,console.warn("[mnyra][analytics] init failed",n)}}const W=Object.freeze([{key:"today",label:"Heute",days:1},{key:"7d",label:"7 Tage",days:7},{key:"30d",label:"30 Tage",days:30},{key:"90d",label:"90 Tage",days:90},{key:"custom",label:"Eigene",days:0}]),q=1440*60*1e3,H=366;function fe(e){const t=new Date(e);return t.setHours(0,0,0,0),t}function B(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||"").trim());if(!t)return null;const r=new Date(Number(t[1]),Number(t[2])-1,Number(t[3]));return Number.isNaN(r.getTime())?null:fe(r)}function We({rangeKey:e="7d",customFrom:t="",customTo:r="",now:n=new Date}={}){const a=fe(n),s=W.find(c=>c.key===e)||W[1];let i=a,o=a;if(s.key==="custom"){const c=B(t),d=B(r);if(!c||!d||c.getTime()>d.getTime())return null;i=c,o=d.getTime()>a.getTime()?a:d,Math.round((o.getTime()-i.getTime())/q)+1>H&&(i=new Date(o.getTime()-(H-1)*q))}else i=new Date(a.getTime()-(s.days-1)*q);const l=Math.round((o.getTime()-i.getTime())/q)+1,m=new Date(i.getTime()-q),g=new Date(m.getTime()-(l-1)*q);return{rangeKey:s.key,label:s.key==="custom"?`${N(i)} – ${N(o)}`:s.label,fromDay:N(i),toDay:N(o),prevFromDay:N(g),prevToDay:N(m),lengthDays:l}}function He(e="",t=""){const r=B(e),n=B(t);if(!r||!n||r.getTime()>n.getTime())return[];const a=[];for(let s=r.getTime();s<=n.getTime()&&(a.push(N(new Date(s))),!(a.length>H+2));s+=q);return a}function p(e){const t=Number(e);return Number.isFinite(t)?t:0}function C(e={},t={}){return Object.entries(t&&typeof t=="object"?t:{}).forEach(([r,n])=>{if(n&&typeof n=="object"){e[r]=C(e[r]&&typeof e[r]=="object"?e[r]:{},n);return}if(typeof n=="string"){e[r]=n;return}e[r]=p(e[r])+p(n)}),e}function ne(e=[]){const t={counters:{},uniques:{},profileSources:{},contacts:{},hourly:{},posts:{},products:{},categories:{},tables:{},orders:{}},r=new Map;(Array.isArray(e)?e:[]).forEach(l=>{if(!l||typeof l!="object")return;const m=String(l.date||l.id||"").trim();m&&r.set(m,l),C(t.counters,l.counters),C(t.uniques,l.uniques),C(t.profileSources,l.profileSources),C(t.contacts,l.contacts),C(t.hourly,l.hourly),C(t.posts,l.posts),C(t.products,l.products),C(t.categories,l.categories),C(t.tables,l.tables),C(t.orders,l.orders)});const n=t.counters,a=t.orders,s=p(a.completed),i=Math.round(p(a.revenue)*100)/100,o={profileViews:p(n.business_profile_view),uniqueVisitors:p(t.uniques.business_profile_view),contactClicks:p(n.profile_contact_click),postImpressions:p(n.post_impression),postClicks:p(n.post_click),postLikes:p(n.post_like),postShares:p(n.post_share),menuOpens:p(n.menu_open),categoryOpens:p(n.category_open),productViews:p(n.product_view),qrScans:p(n.qr_scan),waiterCalls:p(n.call_waiter_click),ordersStarted:p(n.order_started),ordersCompleted:s,revenue:i,avgOrderValue:s>0?Math.round(i/s*100)/100:0,ordersQr:p(a.qr),ordersExternal:p(a.external),feedImpressions:p(n.feed_impression),feedClicks:p(n.feed_click)};return o.feedCtr=o.feedImpressions>0?Math.round(o.feedClicks/o.feedImpressions*1e3)/10:0,o.orderConversion=o.menuOpens>0?Math.round(o.ordersCompleted/o.menuOpens*1e3)/10:0,{summary:o,merged:t,byDay:r}}function Ze(e=0,t=0){const r=p(e),n=p(t);return n<=0?r>0?null:0:Math.round((r-n)/n*1e3)/10}function Ge(e){if(e===null)return"neu";const t=p(e);return t===0?"±0 %":`${t>0?"+":"−"}${Math.abs(t).toLocaleString("de-DE")} %`}function F(e=0){const t=p(e),r=Math.abs(t);return r>=1e6?`${(t/1e6).toLocaleString("de-DE",{maximumFractionDigits:1})} Mio.`:r>=1e4?`${(t/1e3).toLocaleString("de-DE",{maximumFractionDigits:1})}k`:t.toLocaleString("de-DE",{maximumFractionDigits:r<100?2:0})}function re({fromDay:e="",toDay:t="",byDay:r=new Map,resolveValue:n=()=>0}={}){return He(e,t).map(a=>{const s=r.get(a)||null;return{day:a,value:p(n(s))}})}function Xe(e={},t=8){return Object.entries(e.products||{}).map(([r,n])=>({productId:r,name:String(n?.name||"").trim()||r,views:p(n?.views),likes:p(n?.likes),orders:p(n?.orders),quantity:p(n?.quantity),revenue:Math.round(p(n?.revenue)*100)/100})).sort((r,n)=>n.views+n.orders*3-(r.views+r.orders*3)).slice(0,t)}function Je(e={},t=5){return Object.entries(e.products||{}).map(([n,a])=>({productId:n,name:String(a?.name||"").trim()||n,views:p(a?.views),orders:p(a?.orders)})).sort((n,a)=>n.views+n.orders*3-(a.views+a.orders*3)).slice(0,t)}function et(e={},t=8){return Object.entries(e.posts||{}).map(([r,n])=>{const a=p(n?.impressions),s=p(n?.clicks);return{postId:r,impressions:a,clicks:s,likes:p(n?.likes),shares:p(n?.shares),ctr:a>0?Math.round(s/a*1e3)/10:0}}).sort((r,n)=>n.impressions+n.clicks*2-(r.impressions+r.clicks*2)).slice(0,t)}const tt=Object.freeze({feed:"Feed",restaurants:"Restaurant-Tab",search:"Suche",map:"Karte",qr:"QR-Code",external:"Externe Links",direct:"Direkt",other:"Sonstige"});function nt(e={}){const t=Object.entries(e.profileSources||{}).map(([n,a])=>({key:n,label:tt[n]||n,count:p(a)})).filter(n=>n.count>0).sort((n,a)=>a.count-n.count),r=t.reduce((n,a)=>n+a.count,0);return t.map(n=>({...n,share:r>0?Math.round(n.count/r*1e3)/10:0}))}function V(e={},t="qrScans"){const r=e.hourly&&typeof e.hourly=="object"?e.hourly:{};return Array.from({length:24},(n,a)=>({hour:a,value:p(r[String(a)]?.[t])}))}function rt(e={},t=12){return Object.entries(e.tables||{}).map(([r,n])=>({tableKey:r,label:/^t\d+$/.test(r)?`Tisch ${r.slice(1)}`:r,qrScans:p(n?.qrScans),waiterCalls:p(n?.waiterCalls),ordersCompleted:p(n?.ordersCompleted)})).sort((r,n)=>n.qrScans+n.ordersCompleted-(r.qrScans+r.ordersCompleted)).slice(0,t)}function at(e={},t=10){return Object.entries(e.categories||{}).map(([r,n])=>({categoryId:r,name:String(n?.name||"").trim()||r,opens:p(n?.opens)})).sort((r,n)=>n.opens-r.opens).slice(0,t)}function st(e={}){const t=[{key:"menuOpens",label:"Menü geöffnet",value:p(e.menuOpens)},{key:"productViews",label:"Produkt angesehen",value:p(e.productViews)},{key:"ordersStarted",label:"Bestellung gestartet",value:p(e.ordersStarted)},{key:"ordersCompleted",label:"Bestellung abgeschlossen",value:p(e.ordersCompleted)}],r=t[0].value;return t.map((n,a)=>{const s=a===0?n.value:t[a-1].value;return{...n,shareOfFirst:r>0?Math.round(n.value/r*1e3)/10:0,dropFromPrev:a===0||s<=0?0:Math.max(0,Math.round((s-n.value)/s*1e3)/10)}})}function it({range:e=null,currentDays:t=[],previousDays:r=[]}={}){if(!e)return null;const n=ne(t),a=ne(r),s=["profileViews","uniqueVisitors","menuOpens","productViews","postImpressions","qrScans","waiterCalls","ordersCompleted","revenue","feedImpressions"],i={};s.forEach(l=>{i[l]=Ze(n.summary[l],a.summary[l])});const o=Object.values(n.summary).some(l=>p(l)>0);return{range:e,summary:n.summary,previousSummary:a.summary,deltas:i,hasAnyData:o,trend:{profileViews:re({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:l=>l?.counters?.business_profile_view}),menuOpens:re({fromDay:e.fromDay,toDay:e.toDay,byDay:n.byDay,resolveValue:l=>l?.counters?.menu_open})},funnel:st(n.summary),topProducts:Xe(n.merged),lowProducts:Je(n.merged),topPosts:et(n.merged),sources:nt(n.merged),categories:at(n.merged),tables:rt(n.merged),hourlyQr:V(n.merged,"qrScans"),hourlyWaiter:V(n.merged,"waiterCalls"),hourlyOrders:V(n.merged,"ordersCompleted"),contacts:{phone:p(n.merged.contacts?.phone),address:p(n.merged.contacts?.address),map:p(n.merged.contacts?.map),hours:p(n.merged.contacts?.hours),social:p(n.merged.contacts?.social)}}}async function ae({db:e,collectionFn:t,queryFn:r,whereFn:n,documentIdFn:a,getDocsFn:s,restaurantId:i="",fromDay:o="",toDay:l=""}={}){const m=String(i||"").trim(),g=String(o||"").trim(),c=String(l||"").trim();if(!e||typeof t!="function"||typeof r!="function"||typeof n!="function"||typeof a!="function"||typeof s!="function"||!m||!g||!c)return[];const d=t(e,"restaurants",m,"analyticsDaily");return(await s(r(d,n(a(),">=",g),n(a(),"<=",c)))).docs.map(S=>({id:S.id,...S.data()||{}}))}const se="mnyraAnalyticsStyles",ot=`
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
`;function ct(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(se)))try{const t=e.createElement("style");t.id=se,t.textContent=ot,e.head?.appendChild(t)}catch{}}function h(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ye(e=""){const t=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(e||""));return t?`${t[3]}.${t[2]}.`:e}function lt({rangeKey:e="7d",customFrom:t="",customTo:r=""}={}){const n=W.map(s=>`
    <button
      type="button"
      class="mnyra-an__chip ${s.key===e?"mnyra-an__chip--active":""}"
      data-analytics-range="${h(s.key)}"
    >${h(s.label)}</button>
  `).join(""),a=e==="custom"?`
      <div class="mnyra-an__custom">
        <input type="date" data-analytics-custom-from value="${h(t)}" aria-label="Von" />
        <span style="color:var(--an-muted); font-size:11px; font-weight:700;">bis</span>
        <input type="date" data-analytics-custom-to value="${h(r)}" aria-label="Bis" />
        <button type="button" class="mnyra-an__chip mnyra-an__chip--active" data-analytics-custom-apply>Anwenden</button>
      </div>
    `:"";return`<div class="mnyra-an__filters" role="group" aria-label="Zeitraum">${n}</div>${a}`}function ut(e,{moreIsGood:t=!0}={}){if(e===void 0)return"";const r=Ge(e);let n="";if(e!==null&&e!==0){const a=e>0;n=(t?a:!a)?"mnyra-an__kpi-delta--up":"mnyra-an__kpi-delta--down"}return`<p class="mnyra-an__kpi-delta ${n}">${h(r)} <span style="color:var(--an-muted); font-weight:600;">vs. Vorperiode</span></p>`}function D({label:e="",value:t=0,delta:r,suffix:n="",moreIsGood:a=!0}={}){return`
    <div class="mnyra-an__card">
      <p class="mnyra-an__kpi-label">${h(e)}</p>
      <p class="mnyra-an__kpi-value">${h(F(t))}${n?` <span style="font-size:12px; color:var(--an-muted); font-weight:700;">${h(n)}</span>`:""}</p>
      ${ut(r,{moreIsGood:a})}
    </div>
  `}function dt({series:e=[],chartId:t="trend",height:r=150}={}){const n=(Array.isArray(e)?e:[]).filter(b=>Array.isArray(b?.points)&&b.points.length);if(!n.length)return"";const a=640,s={top:12,right:12,bottom:24,left:34},i=a-s.left-s.right,o=r-s.top-s.bottom,l=n[0].points.map(b=>b.day),m=l.length,g=Math.max(1,...n.flatMap(b=>b.points.map(w=>Number(w.value)||0))),c=Math.max(1,Math.ceil(g/4)*4),d=b=>s.left+(m<=1?i/2:b/(m-1)*i),v=b=>s.top+o-Math.max(0,Number(b)||0)/c*o,S=b=>String(b)==="2"?"var(--an-series-2)":"var(--an-series-1)",k=[0,.25,.5,.75,1].map(b=>{const w=s.top+o-b*o,A=Math.round(c*b);return`
      <line x1="${s.left}" y1="${w}" x2="${a-s.right}" y2="${w}" stroke="var(--an-grid)" stroke-width="1" />
      <text x="${s.left-6}" y="${w+3}" text-anchor="end" font-size="9" fill="var(--an-muted)" style="font-variant-numeric: tabular-nums;">${A.toLocaleString("de-DE")}</text>
    `}).join(""),I=Math.max(1,Math.ceil(m/6)),y=l.map((b,w)=>w%I!==0&&w!==m-1?"":`<text x="${d(w)}" y="${r-6}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${h(ye(b))}</text>`).join(""),f=n.map(b=>{const w=b.points.map((be,X)=>`${X===0?"M":"L"}${d(X).toFixed(1)},${v(be.value).toFixed(1)}`).join(" "),A=`${w} L${d(m-1).toFixed(1)},${(s.top+o).toFixed(1)} L${d(0).toFixed(1)},${(s.top+o).toFixed(1)} Z`,O=m-1,R=`<circle cx="${d(O).toFixed(1)}" cy="${v(b.points[O].value).toFixed(1)}" r="4" fill="${S(b.color)}" stroke="var(--an-surface)" stroke-width="2" />`;return`
      <path d="${A}" fill="${S(b.color)}" opacity="0.10" />
      <path d="${w}" fill="none" stroke="${S(b.color)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      ${R}
    `}).join(""),_=n.length>1?`
      <div class="mnyra-an__legend">
        ${n.map(b=>`
          <span class="mnyra-an__legend-item">
            <span class="mnyra-an__legend-swatch" style="background:${S(b.color)};"></span>${h(b.label)}
          </span>
        `).join("")}
      </div>
    `:"",$=h(JSON.stringify({days:l,pad:s,width:a,height:r,series:n.map(b=>({label:b.label,color:String(b.color)==="2"?"2":"1",values:b.points.map(w=>Number(w.value)||0)}))}));return`
    ${_}
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${h(t)}" data-analytics-chart-payload="${$}">
      <svg viewBox="0 0 ${a} ${r}" width="100%" height="auto" role="img" aria-label="Trend">
        ${k}
        <line data-analytics-crosshair x1="0" y1="${s.top}" x2="0" y2="${s.top+o}" stroke="var(--an-muted)" stroke-width="1" opacity="0" />
        ${f}
        ${y}
      </svg>
      <div class="mnyra-an__tooltip" data-analytics-tooltip></div>
    </div>
  `}function ie({rows:e=[],label:t="",chartId:r="hourly"}={}){const n=Array.isArray(e)?e:[];if(n.reduce((k,I)=>k+(Number(I?.value)||0),0)<=0)return`<p class="mnyra-an__empty-note">Noch keine Daten für „${h(t)}“ in diesem Zeitraum.</p>`;const s=640,i=120,o={top:8,right:8,bottom:20,left:8},l=s-o.left-o.right,m=i-o.top-o.bottom,g=Math.max(1,...n.map(k=>Number(k?.value)||0)),c=l/24,d=Math.min(20,Math.max(6,c-2)),v=n.map(k=>{const I=Number(k?.value)||0,y=I<=0?0:Math.max(2,I/g*m),f=o.left+k.hour*c+(c-d)/2,_=o.top+m-y;return I<=0?"":`<path d="M${f.toFixed(1)},${(o.top+m).toFixed(1)} L${f.toFixed(1)},${(_+4).toFixed(1)} Q${f.toFixed(1)},${_.toFixed(1)} ${(f+4).toFixed(1)},${_.toFixed(1)} L${(f+d-4).toFixed(1)},${_.toFixed(1)} Q${(f+d).toFixed(1)},${_.toFixed(1)} ${(f+d).toFixed(1)},${(_+4).toFixed(1)} L${(f+d).toFixed(1)},${(o.top+m).toFixed(1)} Z"
          fill="var(--an-series-1)"><title>${h(`${k.hour}:00 Uhr – ${I.toLocaleString("de-DE")}`)}</title></path>`}).join(""),S=[0,6,12,18,23].map(k=>`
    <text x="${(o.left+k*c+c/2).toFixed(1)}" y="${i-5}" text-anchor="middle" font-size="9" fill="var(--an-muted)">${k} Uhr</text>
  `).join("");return`
    <div class="mnyra-an__chart-wrap" data-analytics-chart="${h(r)}">
      <svg viewBox="0 0 ${s} ${i}" width="100%" height="auto" role="img" aria-label="${h(t)}">
        <line x1="${o.left}" y1="${o.top+m}" x2="${s-o.right}" y2="${o.top+m}" stroke="var(--an-grid)" stroke-width="1" />
        ${v}
        ${S}
      </svg>
    </div>
  `}function pt(e=[]){const t=Array.isArray(e)?e:[];if(!t.length)return"";const r=Math.max(1,...t.map(n=>Number(n?.value)||0));return t.map((n,a)=>{const s=Number(n?.value)||0,i=Math.max(2,Math.round(s/r*100)),o=a>0&&n.dropFromPrev>0?` <span style="color:var(--an-down);">(−${n.dropFromPrev.toLocaleString("de-DE")} %)</span>`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${h(n.label)}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${i}%; opacity:${1-a*.15};"></div></div>
        <span class="mnyra-an__bar-value">${h(F(s))}${o}</span>
      </div>
    `}).join("")}function z(e=[],{labelKey:t="label",valueKey:r="count",suffix:n=""}={}){const a=Array.isArray(e)?e:[];if(!a.length)return'<p class="mnyra-an__empty-note">Noch keine Daten in diesem Zeitraum.</p>';const s=Math.max(1,...a.map(i=>Number(i?.[r])||0));return a.map(i=>{const o=Number(i?.[r])||0,l=Math.max(2,Math.round(o/s*100)),m=n==="%"&&Number.isFinite(Number(i?.share))?` · ${Number(i.share).toLocaleString("de-DE")} %`:"";return`
      <div class="mnyra-an__bar-row">
        <span class="mnyra-an__bar-label">${h(String(i?.[t]||""))}</span>
        <div class="mnyra-an__bar-track"><div class="mnyra-an__bar-fill" style="width:${l}%;"></div></div>
        <span class="mnyra-an__bar-value">${h(F(o))}${h(m)}</span>
      </div>
    `}).join("")}function j({columns:e=[],rows:t=[],emptyLabel:r="Noch keine Daten."}={}){return t.length?`
    <div class="mnyra-an__table-scroll">
      <table class="mnyra-an__table">
        <thead><tr>${e.map(n=>`<th>${h(n.label)}</th>`).join("")}</tr></thead>
        <tbody>
          ${t.map(n=>`
            <tr>${e.map(a=>`<td>${h(String(a.render?a.render(n):n[a.key]??""))}</td>`).join("")}</tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `:`<p class="mnyra-an__empty-note">${h(r)}</p>`}function mt(){return`
    <div class="mnyra-an__grid" aria-hidden="true">
      ${Array.from({length:4},()=>'<div class="mnyra-an__skeleton" style="height:88px;"></div>').join("")}
    </div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:180px;"></div></div>
    <div class="mnyra-an__section"><div class="mnyra-an__skeleton" style="height:140px;"></div></div>
  `}function Z({title:e="Noch keine Analytics-Daten",body:t=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">${h(e)}</p>
      <p class="mnyra-an__state-body">${h(t||"Sobald Gäste dein Profil, Menü oder deine Beiträge ansehen, erscheinen hier deine Statistiken.")}</p>
    </div>
  `}function ft({message:e=""}={}){return`
    <div class="mnyra-an__card mnyra-an__state">
      <p class="mnyra-an__state-title">Analytics konnten nicht geladen werden</p>
      <p class="mnyra-an__state-body">${h(e||"Bitte Verbindung prüfen und erneut versuchen.")}</p>
      <button type="button" class="mnyra-an__retry" data-analytics-retry>Erneut versuchen</button>
    </div>
  `}function yt(e=null,{currency:t="€"}={}){if(!e)return Z({});const{summary:r,deltas:n}=e;if(!e.hasAnyData)return Z({body:`Im Zeitraum „${e.range.label}“ liegen noch keine Daten vor. Teile dein Profil, deine QR-Codes oder poste im Feed, um Reichweite aufzubauen.`});const a=[D({label:"Profilbesucher",value:r.profileViews,delta:n.profileViews}),D({label:"Unique Besucher",value:r.uniqueVisitors,delta:n.uniqueVisitors}),D({label:"Menü-Aufrufe",value:r.menuOpens,delta:n.menuOpens}),D({label:"Produkt-Ansichten",value:r.productViews,delta:n.productViews}),D({label:"Beitrags-Impressionen",value:r.postImpressions,delta:n.postImpressions}),D({label:"QR-Scans",value:r.qrScans,delta:n.qrScans}),D({label:"Kellner-Rufe",value:r.waiterCalls,delta:n.waiterCalls}),D({label:"Bestellungen",value:r.ordersCompleted,delta:n.ordersCompleted}),D({label:"Umsatz",value:r.revenue,delta:n.revenue,suffix:t}),D({label:"Ø Bestellwert",value:r.avgOrderValue,suffix:t}),D({label:"Feed-Reichweite",value:r.feedImpressions,delta:n.feedImpressions}),D({label:"Feed-Klickrate",value:r.feedCtr,suffix:"%"})].join(""),s=dt({chartId:"profileTrend",series:[{key:"profileViews",label:"Profilbesucher",color:"1",points:e.trend.profileViews},{key:"menuOpens",label:"Menü-Aufrufe",color:"2",points:e.trend.menuOpens}]}),i=j({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Bestellungen"},{key:"revenue",label:`Umsatz (${t})`,render:d=>d.revenue>0?d.revenue.toLocaleString("de-DE"):"–"}],rows:e.topProducts,emptyLabel:"Noch keine Produkt-Daten in diesem Zeitraum."}),o=e.lowProducts.length&&e.topProducts.length>e.lowProducts.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Wenig Aufmerksamkeit</h3>
        <div class="mnyra-an__card">
          ${j({columns:[{key:"name",label:"Produkt"},{key:"views",label:"Ansichten"},{key:"orders",label:"Bestellungen"}],rows:e.lowProducts})}
          <p class="mnyra-an__empty-note">Tipp: Diese Produkte bekommen wenig Aufmerksamkeit – bessere Fotos, Position im Menü oder ein Angebot können helfen.</p>
        </div>
      </div>
    `:"",l=j({columns:[{key:"postId",label:"Beitrag"},{key:"impressions",label:"Impressionen"},{key:"clicks",label:"Klicks"},{key:"likes",label:"Likes"},{key:"ctr",label:"CTR %",render:d=>d.ctr.toLocaleString("de-DE")}],rows:e.topPosts,emptyLabel:"Noch keine Beitrags-Daten in diesem Zeitraum."}),m=e.tables.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Tische</h3>
        <div class="mnyra-an__card">
          ${j({columns:[{key:"label",label:"Tisch"},{key:"qrScans",label:"QR-Scans"},{key:"waiterCalls",label:"Kellner-Rufe"},{key:"ordersCompleted",label:"Bestellungen"}],rows:e.tables})}
        </div>
      </div>
    `:"",g=e.categories.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kategorien</h3>
        <div class="mnyra-an__card">
          ${z(e.categories,{labelKey:"name",valueKey:"opens"})}
        </div>
      </div>
    `:"",c=[{label:"Telefon",count:e.contacts.phone},{label:"Adresse",count:e.contacts.address},{label:"Karte",count:e.contacts.map},{label:"Öffnungszeiten",count:e.contacts.hours},{label:"Social Links",count:e.contacts.social}].filter(d=>d.count>0);return`
    <div class="mnyra-an__grid">${a}</div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Trend</h3>
      <div class="mnyra-an__card">${s||'<p class="mnyra-an__empty-note">Kein Trend für diesen Zeitraum.</p>'}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Conversion-Funnel</h3>
      <div class="mnyra-an__card">
        ${pt(e.funnel)}
        <p class="mnyra-an__empty-note">Conversion Menü → Bestellung: ${h(String(r.orderConversion.toLocaleString("de-DE")))} % · QR-Bestellungen: ${h(F(r.ordersQr))} · Externe: ${h(F(r.ordersExternal))}</p>
      </div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Klickquellen</h3>
      <div class="mnyra-an__card">${z(e.sources,{suffix:"%"})}</div>
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

    ${g}

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">QR-Scans nach Uhrzeit</h3>
      <div class="mnyra-an__card">${ie({rows:e.hourlyQr,label:"QR-Scans",chartId:"hourlyQr"})}</div>
    </div>

    <div class="mnyra-an__section">
      <h3 class="mnyra-an__section-title">Kellner-Rufe nach Uhrzeit</h3>
      <div class="mnyra-an__card">${ie({rows:e.hourlyWaiter,label:"Kellner-Rufe",chartId:"hourlyWaiter"})}</div>
    </div>

    ${c.length?`
      <div class="mnyra-an__section">
        <h3 class="mnyra-an__section-title">Kontakt-Klicks</h3>
        <div class="mnyra-an__card">${z(c)}</div>
      </div>
    `:""}

    ${m}
  `}function bt(e=typeof document>"u"?null:document){e?.querySelectorAll&&e.querySelectorAll("[data-analytics-chart-payload]").forEach(t=>{if(t.__mnyraAnalyticsChartBound)return;t.__mnyraAnalyticsChartBound=!0;let r=null;try{r=JSON.parse(t.getAttribute("data-analytics-chart-payload")||"null")}catch{}if(!r||!Array.isArray(r.days)||!r.days.length)return;const n=t.querySelector("svg"),a=t.querySelector("[data-analytics-crosshair]"),s=t.querySelector("[data-analytics-tooltip]");if(!n||!a||!s)return;const{pad:i,width:o}=r,l=o-i.left-i.right,m=r.days.length,g=()=>{a.setAttribute("opacity","0"),s.classList.remove("mnyra-an__tooltip--visible")},c=d=>{const v=n.getBoundingClientRect();if(!v.width)return;const S=o/v.width,k=(d.clientX-v.left)*S,I=Math.min(1,Math.max(0,(k-i.left)/Math.max(1,l))),y=Math.round(I*(m-1)),f=i.left+(m<=1?l/2:y/(m-1)*l);a.setAttribute("x1",String(f)),a.setAttribute("x2",String(f)),a.setAttribute("opacity","0.6"),s.textContent="";const _=e.createElement?e.createElement("div"):document.createElement("div");_.textContent=ye(r.days[y]),_.style.fontWeight="800",s.appendChild(_),r.series.forEach($=>{const b=document.createElement("div"),w=document.createElement("span");w.className="mnyra-an__tooltip-key",w.style.background=$.color==="2"?"var(--an-series-2)":"var(--an-series-1)";const A=document.createElement("span");A.className="mnyra-an__tooltip-value",A.textContent=Number($.values[y]||0).toLocaleString("de-DE");const O=document.createElement("span");O.textContent=` ${$.label}`,b.appendChild(w),b.appendChild(A),b.appendChild(O),s.appendChild(b)}),s.style.left=`${f/o*100}%`,s.style.top="0px",s.classList.add("mnyra-an__tooltip--visible")};n.addEventListener("pointermove",c),n.addEventListener("pointerdown",c),n.addEventListener("pointerleave",g)})}function vt({state:e,renderFn:t,documentObj:r,firestoreApi:n={}}={}){const a=r||(typeof document>"u"?null:document),s=typeof t=="function"?t:()=>{};let i=0,o=!1;function l(){return(!e.analyticsView||typeof e.analyticsView!="object")&&(e.analyticsView={status:"idle",error:"",rangeKey:"7d",customFrom:"",customTo:"",loadedRangeSignature:"",model:null}),e.analyticsView}function m(){const y=e?.userProfile||{};return String(y.restaurantId||y.staffRestaurantId||"").trim()}function g(y,f){return`${f}::${y.fromDay}::${y.toDay}`}async function c({force:y=!1}={}){const f=l(),_=m();if(!_){f.status="empty-business";return}const $=We({rangeKey:f.rangeKey,customFrom:f.customFrom,customTo:f.customTo});if(!$){f.status="error",f.error="Bitte einen gültigen Zeitraum wählen (Von-Datum vor Bis-Datum).",s();return}const b=g($,_);if(!y&&f.loadedRangeSignature===b&&f.status==="ready")return;i+=1;const w=i;f.status="loading",f.error="",s();try{const A={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:_},[O,R]=await Promise.all([ae({...A,fromDay:$.fromDay,toDay:$.toDay}),ae({...A,fromDay:$.prevFromDay,toDay:$.prevToDay})]);if(w!==i)return;f.model=it({range:$,currentDays:O,previousDays:R}),f.loadedRangeSignature=b,f.status="ready"}catch(A){if(w!==i)return;console.error("[mnyra][analytics] dashboard load failed",A),f.status="error",f.error="Analytics konnten nicht geladen werden."}s()}function d(y="7d"){const f=l();f.rangeKey=String(y||"7d").trim()||"7d",f.rangeKey!=="custom"&&c({force:!1}),s()}function v(){const y=l(),f=a?.querySelector?.("[data-analytics-custom-from]"),_=a?.querySelector?.("[data-analytics-custom-to]");y.customFrom=String(f?.value||y.customFrom||"").trim(),y.customTo=String(_?.value||y.customTo||"").trim(),c({force:!0})}function S(){o||!a||(o=!0,a.addEventListener("click",y=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="analytics")return;const f=y.target?.closest?.("[data-analytics-range]");if(f){d(f.getAttribute("data-analytics-range"));return}if(y.target?.closest?.("[data-analytics-custom-apply]")){v();return}y.target?.closest?.("[data-analytics-retry]")&&c({force:!0})}catch{}}))}function k(){if(!a)return;((a.defaultView||(typeof window>"u"?null:window))?.requestAnimationFrame||(_=>setTimeout(_,0)))(()=>{try{bt(a)}catch{}})}function I(){ct(a),S();const y=l(),f=m();let _="";if(!f)_=Z({title:"Kein Business-Profil verbunden",body:"Analytics sind nur für Business-Konten verfügbar. Sobald dein Konto mit einem Restaurant oder Shop verbunden ist, erscheinen hier deine Statistiken."});else if(y.status==="idle"||y.status==="loading"&&!y.model)y.status==="idle"&&(queueMicrotask(()=>{c({force:!1})}),y.status="loading"),_=mt();else if(y.status==="error")_=ft({message:y.error});else{const $=yt(y.model);_=y.status==="loading"?`<div style="opacity:0.55; pointer-events:none;">${$}</div>`:$}return k(),`
      <section class="p-4 pb-28 mnyra-an" data-analytics-root>
        <div class="mb-4">
          <h2 class="text-lg font-black tracking-tight text-slate-900" style="color:var(--an-ink);">Analytics</h2>
          <p class="text-xs" style="color:var(--an-muted); margin-top:2px;">Deine Reichweite, Menü-Performance und Bestellungen auf einen Blick.</p>
        </div>
        ${lt({rangeKey:y.rangeKey,customFrom:y.customFrom,customTo:y.customTo})}
        ${_}
      </section>
    `}return Object.freeze({renderAnalyticsView:I,loadAnalytics:c,setRange:d})}export{vt as c,_t as i,gt as o,x as t};
