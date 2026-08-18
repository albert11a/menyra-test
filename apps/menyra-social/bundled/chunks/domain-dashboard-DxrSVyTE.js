const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-k1E-Nt79.js","chunks/domain-feed-social-eager-SwDYD6kZ.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-CJSh0tbN.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as ot}from"./domain-auth-B1kS5TG-.js";import{f as W,r as dt,l as lt,s as be}from"./domain-analytics-i6lAJYIg.js";import{b as ct}from"./domain-business-accounts-D8NpUhi6.js";import{G as ye,a as _e,v as ht,c as Fe,d as Ae,e as Be,f as je,g as pt,h as ut,n as Ke,i as Me,j as Re,k as Ce,l as mt,m as gt,o as xe,p as ft,q as bt,s as yt,u as _t}from"./domain-feed-social-eager-SwDYD6kZ.js";const xt=20,vt=8;function C(e=""){return e==null?"":String(e).trim()}function ie(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function wt(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function kt(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],C(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(i=>{const o=C(i);o&&!n.includes(o)&&n.push(o)}),n.slice(0,vt)}function $t(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=ie(a.persons??a.guests??a.capacity),i=ie(a.size??a.sizeSqm??a.area),o=kt(a);return{id:C(a.id)||wt(Date.now()+t),title:C(a.title??a.name),description:C(a.description??a.text).slice(0,400),imageUrl:o[0]||"",images:o,price:ie(a.price??a.pricePerNight),currency:C(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:C(a.beds??a.bedsLabel).slice(0,60),size:i==null?null:Math.min(500,Math.round(i)),tag:C(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function St(e=[]){return(Array.isArray(e)?e:[]).slice(0,xt).map((t,a)=>$t(t,{index:a}))}function zt(e={}){return St((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Pa(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),C(e?.beds)&&t.push({icon:"bed",label:C(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Fa(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=C(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const Ee=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),Dt=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function ve(e={}){return Object.entries(e).map(([t,a])=>` ${t}="${a}"`).join("")}Object.freeze(Object.keys(Ee));function X(e="",t=""){const a=Ee[String(e||"").trim()];if(!a)return"";const n=a.map(([o,h])=>`<${o}${ve(h)}></${o}>`).join(""),i=String(t||"").trim();return`<svg${ve(Dt)}${i?` class="${i}"`:""}>${n}</svg>`}const we=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),Oe="clean",de="hero",le="compact",Pt=[Oe,de,le];function Ft({imageUrl:e="",variant:t=""}={}){if(!String(e||"").trim())return Oe;const a=String(t||"").trim().toLowerCase();return Pt.includes(a)?a:de}const Te=`
/* Die Ergebniskarte. Sie darf nicht aussehen wie eine gewoehnliche Oferta:
   oben steht, WER anbietet, darunter, was DIESER Gruppe angeboten wird.
   Auf dem weissen Bento traegt sie die Flaeche der App, wie die
   Erklaerkarten - sonst waere sie ein Rahmen ohne Karte darin. */
.mnyra-go-page__card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid var(--go-outline, #e2e8f0);
  border-radius: 26px;
  background: var(--go-plane, #f8fafc);
  color: var(--go-ink, #0f172a);
  text-align: left;
  /* Nach "Shiko ofertat" faehrt die Seite zum ersten Angebot. Ohne diesen
     Rand endete die Fahrt mit der Oberkante der Karte genau unter der
     Kopfzeile der App - halb verdeckt, und der Blick sucht wieder. */
  scroll-margin-top: 88px;
}
/* Mit Foto oben traegt nicht mehr die Karte das Polster, sondern ihr Koerper:
   Das Bild soll an die Kanten laufen, nicht in einem Rahmen sitzen. */
.mnyra-go-page__card--hero { padding: 0; overflow: hidden; }
.mnyra-go-page__card--hero .mnyra-go-page__card-body { padding: 16px; }
/* 16:9, wie es die Kamera eines Telefons liefert. Die Hoehe steht nicht als
   Zahl da: Auf einem breiten Bildschirm waere ein 200px-Streifen ein Balken,
   auf einem schmalen ein Briefkasten. */
.mnyra-go-page__card-photo {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  background: var(--go-plane, #f8fafc);
}
/* Die gedraengte Fassung: Bild links, Angebot rechts, der Knopf darunter ueber
   die ganze Breite - er gehoert der Karte und nicht der rechten Spalte. */
.mnyra-go-page__card--compact .mnyra-go-page__card-top {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.mnyra-go-page__card--compact .mnyra-go-page__card-photo {
  aspect-ratio: 1 / 1;
  border-radius: 18px;
}
/* In der gedraengten Fassung steht das Logo nicht noch einmal daneben: Das
   Foto ist schon das Bild der Karte, und zwei Bilder in einer Zeile sind
   keine Hierarchie mehr. */
.mnyra-go-page__card--compact .mnyra-go-page__card-logo { display: none; }
.mnyra-go-page__card--compact .mnyra-go-page__card-head { margin: 0; }
.mnyra-go-page__card--compact .mnyra-go-page__card-eyebrow,
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit { margin-top: 6px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit { font-size: 22px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-benefit--title { font-size: 17px; }
.mnyra-go-page__card--compact .mnyra-go-page__card-price-go { font-size: 22px; }
.mnyra-go-page__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go-page__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane, #f8fafc); flex: 0 0 auto; }
.mnyra-go-page__card-logo--empty { color: var(--go-muted, #94a3b8); display: flex; align-items: center; justify-content: center; }
.mnyra-go-page__card-logo--empty svg { width: 18px; height: 18px; }
.mnyra-go-page__card-names { min-width: 0; }
.mnyra-go-page__card-who { margin: 0; min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go-page__card-who span { color: var(--go-muted, #94a3b8); font-weight: 700; }
.mnyra-go-page__card-sponsored { margin: 2px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted, #94a3b8); }
/* Der kleine Hinweis ueber der grossen Zeile: "PAKETË GO", "ÇMIM SPECIAL GO".
   Er sagt, welche Art von Angebot hier steht - bei einer Zbritje und bei einem
   Falas steht dort nichts, weil die grosse Zeile es schon sagt. */
.mnyra-go-page__card-eyebrow {
  margin: 12px 0 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--go-accent, #4f46e5);
}
.mnyra-go-page__card-eyebrow + .mnyra-go-page__card-benefit { margin-top: 4px; }
.mnyra-go-page__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
/* Steht darunter ein Preis, ist der Preis das Grosse - der Name des Produkts
   oder der Paketa wird dann zur Zeile darueber (Punkt 5.5, 7.6). */
.mnyra-go-page__card-benefit--title { font-size: 19px; letter-spacing: -0.02em; }
.mnyra-go-page__card-note { margin: 2px 0 0; font-size: 15px; font-weight: 800; color: var(--go-ink, #0f172a); }
/* Der alte Preis klein und durchgestrichen, der GO-Preis gross daneben. */
.mnyra-go-page__card-prices { margin: 8px 0 0; display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; }
.mnyra-go-page__card-price-was {
  font-size: 14px;
  font-weight: 700;
  color: var(--go-muted, #94a3b8);
  text-decoration: line-through;
}
.mnyra-go-page__card-price-go { font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
.mnyra-go-page__card-saving { margin: 4px 0 0; font-size: 12px; font-weight: 800; color: var(--go-good, #059669); }
.mnyra-go-page__card-for { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--go-ink-2, #475569); }
.mnyra-go-page__card-meta { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; font-weight: 700; color: var(--go-ink-2, #475569); }
.mnyra-go-page__card-meta span { display: inline-flex; align-items: center; gap: 5px; }
.mnyra-go-page__card-meta svg { width: 14px; height: 14px; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-only { margin: 12px 0 0; display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-only svg { width: 12px; height: 12px; }
.mnyra-go-page__cta {
  width: 100%;
  min-height: 50px;
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: none;
  border-radius: 18px;
  background: var(--go-ink, #0f172a);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 900;
  letter-spacing: -0.01em;
  font-family: inherit;
  cursor: pointer;
}
.mnyra-go-page__cta svg { width: 17px; height: 17px; }
.mnyra-go-page__cta:disabled { opacity: 0.6; cursor: not-allowed; }
.mnyra-go-page__cta:not(:disabled):active { transform: scale(0.99); }
`;function A(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ge({businessName:e="",logoUrl:t="",imageUrl:a="",variant:n="",benefitLabel:i="",benefitView:o=null,sponsored:h=!1,meta:p=[],ctaLabel:b="",ctaIcon:y="check-check",ctaDisabled:m=!1,cardAttrs:u="",ctaAttrs:f="",texts:k=we}={}){const z={...we,...k||{}},K=(Array.isArray(p)?p:[]).filter(I=>I&&I.label),M=String(b||z.accept),$=o&&typeof o=="object"?o:{},w=String($.headline||i||""),R=String($.priceGo||""),_=String($.priceRegular||""),B=String(a||"").trim(),E=Ft({imageUrl:B,variant:n}),Z=E===le,O=B?`<img class="mnyra-go-page__card-photo" src="${A(B)}" alt="" loading="lazy" decoding="async" />`:"",L=`
    <div class="mnyra-go-page__card-head">
      ${t?`<img class="mnyra-go-page__card-logo" src="${A(t)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${X("store")}</div>`}
      <div class="mnyra-go-page__card-names">
        <p class="mnyra-go-page__card-who">${A(e)} <span>${A(z.offering)}</span></p>
        ${h?`<p class="mnyra-go-page__card-sponsored">${A(z.sponsored)}</p>`:""}
      </div>
    </div>

    ${$.eyebrow?`<p class="mnyra-go-page__card-eyebrow">${A($.eyebrow)}</p>`:""}
    <p class="mnyra-go-page__card-benefit${R?" mnyra-go-page__card-benefit--title":""}">${A(w)}</p>
    ${$.note?`<p class="mnyra-go-page__card-note">${A($.note)}</p>`:""}
    ${R?`
      <div class="mnyra-go-page__card-prices">
        ${_?`<span class="mnyra-go-page__card-price-was">${A(_)}</span>`:""}
        <span class="mnyra-go-page__card-price-go">${A(R)}</span>
      </div>
    `:""}
    ${$.savingLabel?`<p class="mnyra-go-page__card-saving">${A($.savingLabel)}</p>`:""}
    ${Z?"":`<p class="mnyra-go-page__card-for">${A(z.forGroup)}</p>`}
  `,N=`
    <div class="mnyra-go-page__card-meta">
      ${K.map(I=>`<span>${X(I.icon||"")}${A(I.label)}</span>`).join("")}
    </div>

    <p class="mnyra-go-page__card-only">${X("ticket-percent")}${A(z.onlyGo)}</p>

    <button
      type="button"
      class="mnyra-go-page__cta"
      ${f}
      ${m?"disabled":""}
    >${y?X(y):""}${A(M)}</button>
  `;return Z?`
      <article class="mnyra-go-page__card mnyra-go-page__card--compact"${u?` ${u}`:""}>
        <div class="mnyra-go-page__card-top">
          ${O}
          <div>${L}</div>
        </div>
        ${N}
      </article>
    `:E===de?`
      <article class="mnyra-go-page__card mnyra-go-page__card--hero"${u?` ${u}`:""}>
        ${O}
        <div class="mnyra-go-page__card-body">
          ${L}
          ${N}
        </div>
      </article>
    `:`
    <article class="mnyra-go-page__card"${u?` ${u}`:""}>
      ${L}
      ${N}
    </article>
  `}function At(e=0){const t=Math.max(0,Math.trunc(Number(e)||0)),a=Math.trunc(t/100),n=String(t%100).padStart(2,"0");return`${a},${n} €`}const r=Object.freeze({brand:"Mnyra GO",mark:"⚡",brandMnyra:"MNYRA",brandGo:"GO",createOfferAction:"Krijo ofertë",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{active:"Aktiv",offers:"Ofertat",archive:"Arkiv",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",editorHint:"Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen.",scanOffer:"Skano ofertën",seenToday:"Ofertën e kanë parë sot",acceptedToday:"E kanë pranuar sot",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",finalizeTitle:"Finalizo ofertën",benefitQuestion:"Çka po ofron?",benefitHint:"Zgjidh çfarë dëshiron t'i ofrosh klientit.",benefitPercent:"Zbritje %",benefitBundle:"Paketë GO",benefitFree:"Falas",benefitSpecial:"Çmim special",benefitLegacy:"Zgjidh llojin e ofertës.",discountQuestion:"Sa zbritje po ofron?",discountOther:"Tjetër",discountPlaceholder:"Shkruaj zbritjen",scopeQuestion:"Ku vlen zbritja?",scopeAll:"Krejt fatura",scopeFood:"Ushqim",scopeDrinks:"Pije",bundleQuestion:"Çka përfshin paketa?",bundlePlaceholder:"p.sh. 2 Burger + 2 Pije",freeQuestion:"Çka merr falas?",freePlaceholder:"p.sh. 1 Pije",conditionQuestion:"Kur e merr falas?",conditionFood:"Me ushqim",conditionDrink:"Me pije",conditionAny:"Me çdo porosi",conditionCustom:"Tjetër",customConditionQuestion:"Shkruaj kushtin",customConditionPlaceholder:"p.sh. kur porosit 2 pizza",productQuestion:"Cili produkt?",productPlaceholder:"p.sh. Pizza Margherita",priceRegular:"Çmimi normal",priceGo:"Çmimi GO",pricePlaceholder:"0,00",saving:"Kursen",photoQuestion:"Foto e ofertës",photoHint:"Shto një foto që klienti ta shohë ofertën menjëherë.",photoOptional:"Opsionale",photoAdd:"Shto një foto",photoSource:"Nga telefoni ose kamera",photoChange:"Ndrysho",photoRemove:"Hiq",photoUploading:"Po ngarkohet...",photoError:"Fotoja nuk u ngarkua. Provo prapë.",partyQuestion:"Për sa persona vlen?",partyHint:"Zgjidh për çfarë madhësie të grupit vlen oferta.",partyAll:"Të gjithë",categoryQuestion:"Kur të shfaqet oferta?",categoryHint:"Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit.",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet kafe / pije",scheduleQuestion:"Kur vlen oferta?",scheduleHint:"Zgjidh kur klientët mund ta përdorin ofertën.",always:"Gjithmonë",specificHours:"Orar specifik",daysQuestion:"Ditët",hoursQuestion:"Orari",hoursFrom:"Nga",hoursTo:"Deri",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",around:"Rreth",finalize:"Finalizo",needsActivation:"Klienti duhet ta aktivizojë ofertën.",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function s(e,t=""){return typeof e=="function"?e(t):String(t??"")}function G(e,t="",a="w-4 h-4"){return typeof e=="function"?e(t,a):""}function Le(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Bt({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,iconFn:i=null,texts:o={}}={}){if(!e)return"";const h={...r,...o||{}},p=Math.max(0,Math.trunc(Number(t)||0)),b=a>0||n>0,y=b?`${a} oferta aktive · ${n} rezervime sot`:h.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${p>0?`<span class="mnyra-dash__composer-badge" aria-label="${p} ${h.statNew}">${p}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${y}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${G(i,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${b?h.cardManage:h.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${G(i,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const jt=`
.go-hl {
  margin: 0 -1.5rem 1.5rem;
  padding: 0 1.5rem;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 1.5rem;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe
     verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.go-hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+24px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.go-hl__card {
  flex: 0 0 calc((100% + 24px - 20px) / 2.5);
  /* Bildfenster (140px) + Abstand + Textblock + Polster unten. */
  height: 228px;
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  background: #ffffff;
  padding: 0;
  scroll-snap-align: start;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.go-hl__card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.go-hl__tail { flex: 0 0 18px; }
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. */
.go-hl__media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 140px;
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, solange kein Bild da ist
   - dann steht hier statt eines Lochs eine ruhige Flaeche mit Symbol. */
.go-hl__plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 140px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.go-hl__body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 154px;
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht. So stehen
   die Zahlen aller Karten auf derselben Hoehe. */
.go-hl__label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: #94a3b8;
  overflow: hidden;
}
.go-hl__value {
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
/* Auf einer Handgriff-Karte steht kein Wert, sondern der Satz selbst. Er
   nimmt die Hoehe von Beschriftung und Zahl zusammen ein, damit die Reihe
   eine Linie behaelt. */
.go-hl__action {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
  overflow: hidden;
}
/* Das Bento traegt alles unter der Karten-Reihe: die Tab-Leiste und darunter
   die Liste, die sie gewaehlt hat. Dieselbe Flaeche wie im Paneli - oben
   gerundet, bis an beide Seitenraender, und sie laeuft nach unten weiter.
   Deshalb sind nur die oberen Ecken gerundet.

   Die negative Marge ist genau das Seitenpolster der Seite (1.5rem): so
   reicht die Flaeche bis an die Raender, waehrend ihr Inhalt in der Flucht
   der Karten darueber bleibt. Der Abstand nach oben ist bewusst gross - die
   Reihe soll als eigenes Stueck lesen und nicht an der Flaeche kleben. */
.go-bento {
  margin: 72px -1.5rem 0;
  padding: 22px 1.5rem 112px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-radius: 40px 40px 0 0;
  box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
}
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Mit 44px liest sie als Kopf der Flaeche und nicht als erste Karte. */
.go-bento > .go-tabs { margin-top: 0; }
.go-bento > .go-tabs + * { margin-top: 44px; }
/* Vier Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Ein Kasten darum schoebe sie um seine Polsterbreite nach innen und
   damit aus der Flucht der Karten darunter. */
.go-tabs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. */
.go-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid #f1f5f9;
  /* Ganz rund, wie im Paneli: beide sagen dasselbe - "waehle eines von
     mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: #f8fafc;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: #475569;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.go-tab svg,
.go-tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.go-tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dasselbe Schwarz wie im Paneli. */
.go-tab[aria-selected="true"] {
  background: #0f172a;
  border-color: #0f172a;
  color: #ffffff;
}
.go-tab:active { transform: scale(0.98); }
/* Drei Masse, die vorher an Klassen hingen, die es im statischen Tailwind-Blatt
   nicht gibt (md:text-2xl, mt-0.5, min-h-[44px]): die Ueberschrift auf einem
   breiten Bildschirm, der Abstand ihrer Unterzeile, und die Fingerhoehe der
   Pausenknoepfe. Eine Fingerhoehe, die von einer Klasse ohne Regel abhaengt,
   ist keine Fingerhoehe. */
.go-title-sub { margin-top: 2px; }
@media (min-width: 768px) {
  .go-title { font-size: 1.5rem; line-height: 2rem; }
}
/* Die Kopfzeile der Seite: links der Name mit dem Lokal darunter, rechts der
   eine Handgriff, der von hier aus etwas Neues entstehen laesst.

   Sie steht als eigene Reihe und nicht als zwei Bloecke untereinander, weil
   das Lokal oben zwei Dinge sucht: wo es ist, und wie es eine Oferte anlegt.
   Beides in einer Zeile heisst: ein Blick statt zweier. */
.go-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
/* Der Block darf schrumpfen, der Handgriff nicht: ein langer Lokalname
   schiebt sonst den Knopf aus dem Bild. min-width:0 ist das, was dem
   Textblock ueberhaupt erlaubt, schmaler als sein Inhalt zu werden - ohne
   das greift die Ellipse unten nicht. */
.go-head__brand { min-width: 0; flex: 1 1 auto; }
/* Der Name des Lokals steht in EINER Zeile. Ein Umbruch hier verschoebe die
   ganze Kopfzeile in der Hoehe, sobald ein Lokal einen langen Namen hat. */
.go-head__brand .go-title,
.go-head__brand .go-title-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der Handgriff bleibt auf jeder Breite ganz: Wort und Knopf zusammen messen
   etwa 105px, der Name daneben etwa 101px - selbst auf einem 300px breiten
   Telefon bleiben davon noch ueber 30px uebrig. Deshalb wird hier auf keiner
   Breite etwas ausgeblendet. */
.go-head__action {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
/* Die Beschriftung neben dem Knopf. Sie bricht nie um - sie ist kein Satz,
   sondern der Name des Handgriffs. */
.go-head__action-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  color: #0f172a;
  white-space: nowrap;
}
/* Rund, im Blau der Marke - dieselbe Farbe und dieselbe Groesse wie der
   "+"-Knopf ueber der Ofertat-Liste. Es ist derselbe Handgriff, also sieht er
   gleich aus; nur die Form ist hier ein Kreis, weil er allein neben einem
   Wort steht und nicht ueber einer Liste. */
.go-head__plus {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #4f46e5;
  color: #ffffff;
  padding: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 1px 2px 0 rgb(15 23 42 / 0.12);
  transition: transform 0.15s ease, background 0.15s ease;
}
.go-head__plus:active { transform: scale(0.95); }
/* Wie in der Tab-Leiste: die Groesse des Symbols steht hier und nicht an
   einer Tailwind-Klasse, die das statische Blatt kennen muesste. */
.go-head__plus svg,
.go-head__plus i {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: block;
}
@media (min-width: 768px) {
  .go-head { gap: 16px; }
  .go-head__action-label { font-size: 12px; }
}
.go-pause { min-height: 44px; }
/* Das Suchfeld faerbt seinen Rahmen, wenn der Kellner darin tippt. */
.go-code-box { transition: border-color 0.15s ease; }
.go-code-box:focus-within { border-color: #818cf8; }
/* Die Zeile mit Personen, Ankunft und Vorteil an einer Buchung. Sie hing an
   gap-x-3/gap-y-1 - zwei Klassen, die das statische Blatt nicht kennt, also
   klebten die Angaben aneinander. */
.go-booking-meta { gap: 4px 12px; }
/* Und die Buchung, die der Code gefunden hat: Sie ist hervorgehoben, weil an
   ihr der Knopf haengt, der Geld entstehen laesst. border-indigo-300 und
   ring-indigo-100 gab es im Blatt nicht - die gefundene Buchung sah aus wie
   jede andere. */
.go-booking--found { border-color: #a5b4fc; box-shadow: 0 0 0 2px #e0e7ff; }
`;function Kt(e={},t={}){const a=t.escapeHtml,n=t.icon,i=e.imageUrl?`<img class="go-hl__media" src="${s(a,e.imageUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:"",o=e.action?`<span class="go-hl__action">${s(a,e.action)}</span>`:`
      <span class="go-hl__label">${s(a,e.label)}</span>
      <span class="go-hl__value">${s(a,e.value)}</span>
    `,h=e.action||`${e.label} ${e.value}`;return`
    <button type="button" class="go-hl__card" ${e.attr||""} data-go-highlight="${s(a,e.key)}"
      aria-label="${s(a,h)}">
      <span class="go-hl__plate ${s(a,e.tone||"text-slate-400")}">${G(n,e.icon,"w-6 h-6")}</span>
      ${i}
      <span class="go-hl__body">${o}</span>
    </button>
  `}function Mt({stats:e={},deps:t={}}={}){return`
    <div class="go-hl" data-go-highlights>
      ${[{key:"scan",action:r.scanOffer,icon:"camera",tone:"text-indigo-600",attr:"data-go-scan"},{key:"seen",label:r.seenToday,value:Number(e.impressions)||0,icon:"eye",tone:"text-indigo-600"},{key:"accepted",label:r.acceptedToday,value:Number(e.accepted)||0,icon:"check-check",tone:"text-emerald-600"}].map(n=>Kt(n,t)).join("")}
      <span class="go-hl__tail" aria-hidden="true"></span>
    </div>
  `}function Rt({tab:e="active",deps:t={}}={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="go-tabs" role="tablist" data-go-tabs>
      ${[["active",r.tabs.active,"zap"],["offers",r.tabs.offers,"tag"],["archive",r.tabs.archive,"archive"],["options",r.tabs.options,"settings"]].map(([o,h,p])=>`
        <button type="button" role="tab" aria-selected="${e===o?"true":"false"}" data-go-business-tab="${o}"
          class="go-tab">${G(n,p,"w-4 h-4")}<span class="go-tab-label">${s(a,h)}</span></button>
      `).join("")}
    </div>
  `}function se(e={},t={},{found:a=!1}={}){const n=t.escapeHtml,i=e.benefitLabel||e.snapshot?.benefitLabel||"",o=!e.businessSeenAt,h=e.partySizeVerified||e.partySizeRequested||e.partySize||1,p=Ke(e.status),b=Le(e.acceptedAt),y=b?`${r.around} ${b}`:r.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${a?"go-booking--found bg-white":o?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${s(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${s(n,y)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${s(n,mt(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(n,r.guestName)}</p>
      <div class="go-booking-meta mt-3 flex flex-wrap items-center text-xs font-bold text-slate-600">
        <span>👥 ${s(n,`${h} ${r.guests}`)}</span>
        ${i?`<span>🎁 ${s(n,i)}</span>`:""}
      </div>
      ${a&&p==="activated"?`
        <div class="mt-4">
          <!--
            Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er steht
            vor der Gruppe und sieht, wieviele es wirklich sind. Was er hier
            stehen laesst oder aendert, ist die Zahl, die abgerechnet wird
            (Punkt 12).
          -->
          <label class="flex items-center justify-between gap-3 mb-3">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${s(n,r.partyAtTable)}</span>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              value="${s(n,h)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-finalize data-go-booking-id="${s(n,e.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${s(n,r.finalize)}
          </button>
        </div>
      `:""}
      ${a&&p==="accepted"?`
        <!--
          Der Gast steht daneben und hat noch nicht gewischt. Ein "nicht
          gefunden" schickte den Kellner auf Fehlersuche bei sich selbst.
        -->
        <p class="mt-4 text-[11px] font-black uppercase tracking-widest text-amber-600">
          ${s(n,r.needsActivation)}
        </p>
      `:""}
      ${e.commission?`
        <!--
          Was diese Bestaetigung kostet, steht offen da. Eine Provision, die
          das Lokal erst auf der Rechnung sieht, waere eine Ueberraschung -
          und Ueberraschungen bei Geld kosten Vertrauen.
        -->
        <p class="mt-3 pt-3 border-t border-slate-200/70 text-[10px] font-black uppercase tracking-widest text-slate-400">
          ${s(n,r.commission)} · ${s(n,At(e.commission.amountCents))}
        </p>
      `:""}
    </div>
  `}function Ct({code:e="",status:t="",busy:a=!1,deps:n={}}={}){const i=n.escapeHtml,o=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="go-code-box flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white">
        <span class="pl-2 text-slate-400">${G(o,"search","w-4 h-4")}</span>
        <input type="text" data-go-code-input value="${s(i,e)}"
          placeholder="${s(i,r.codePlaceholder)}"
          autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
          class="flex-1 min-w-0 bg-transparent py-2 text-sm font-black uppercase tracking-[0.2em] text-slate-900 outline-none" />
        <button type="button" data-go-code-submit ${a?"disabled":""}
          class="shrink-0 px-4 py-2 rounded-xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-white ${a?"opacity-60":""}">
          ${s(i,a?r.searching:r.search)}
        </button>
      </div>
      ${t?`<p class="mt-2 text-[10px] font-bold text-rose-500">${s(i,t)}</p>`:""}
    </div>
  `}function ee({eyebrow:e="",title:t="",sub:a="",action:n="",body:i="",deps:o={}}={}){const h=o.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(h,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(h,t)}</h3>
          ${a?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(h,a)}</p>`:""}
        </div>
        ${n}
      </div>
      ${i}
    </div>
  `}function Et(e={},t={}){const a=t.escapeHtml,n=e.status==="paused"?r.paused:e.status==="archived"?r.archived:"";return`
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${s(a,e.id)}">
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Der Knopf des Gastes ("Prano
        ofertën") gehoert nicht in die Liste des Wirts, und was darin steht,
        hoert auf nichts.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Ge({businessName:"",imageUrl:e.imageUrl||"",variant:le,benefitLabel:e.benefitLabel||"",benefitView:Ce(e.benefit||{}),meta:[{icon:"users",label:Me(e)},{icon:"clock",label:Re(e)}]})}
      </div>
      <p class="text-[9px] font-black uppercase tracking-widest mt-3 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
        ${s(a,n||r.statActive)}
      </p>
      <div class="flex gap-2 mt-3">
        <button type="button" data-go-offer-edit="${s(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${s(a,r.edit)}</button>
        <button type="button" data-go-offer-toggle="${s(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${s(a,e.status==="active"?r.paused:r.activate)}</button>
        <button type="button" data-go-offer-archive="${s(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${s(a,r.archive)}</button>
      </div>
    </div>
  `}function Ot({offer:e={},businessName:t="",previewImageUrl:a="",deps:n={}}={}){const i=n.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${s(i,r.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Ge({businessName:t,imageUrl:a||e.imageUrl||"",benefitLabel:e.benefitLabel||"",benefitView:Ce(e.benefit||{}),meta:[{icon:"users",label:Me(e)},{icon:"clock",label:Re(e)}]})}
      </div>
    </div>
  `}function T(e,t="",a=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${a?` for="${s(e,a)}"`:""}>${s(e,t)}</label>`}function te(e,{active:t=!1,attr:a="",value:n="",escapeHtml:i=null}={}){return`
    <button type="button" ${a?`${a}="${s(i,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${s(i,e)}
    </button>
  `}const Tt=`
.go-offer-form--enter { animation: goOfferFormIn 180ms ease-out both; }
@keyframes goOfferFormIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
/* Der Abstand zur naechsten Section des Modals (Punkt 18: 28 bis 32 px, die
   restlichen 20 kommen aus dem space-y-5 des Modalkoerpers). */
.go-offer-section { padding-bottom: 8px; }
/* Ein Knopf der Angebotsart: gleiche Hoehe, gleiche Breite, gleiche Rundung -
   vier gleich grosse Flaechen fuer vier gleichrangige Antworten. */
.go-offer-kind { min-height: 52px; }
/* Die Antworten der anderen Fragen im Modal: die Gruppengroessen und der
   Zeitplan als Pille (44 px), Ushqim und Pije als ganze Zeile (56 px). */
.go-offer-chip { min-height: 44px; }
.go-offer-answer { min-height: 56px; }
/* Die Pillen darunter beantworten eine Nebenfrage und sind deshalb kleiner. */
.go-offer-pill { min-height: 40px; padding-left: 14px; padding-right: 14px; font-size: 12px; }
.go-offer-input { min-height: 56px; padding-top: 14px; padding-bottom: 14px; }
.go-offer-saving { font-size: 12px; }
.go-offer-price { position: relative; margin-top: 8px; }
.go-offer-price__unit {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  font-weight: 900;
  color: #94a3b8;
  pointer-events: none;
}
.go-offer-price input { padding-right: 40px; }
.go-offer-price input::-webkit-outer-spin-button,
.go-offer-price input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.go-offer-price input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
/* Die Flaeche fuer das Foto (Punkt 10). Sie traegt denselben hellen Grund und
   denselben dünnen Rahmen wie die Eingabefelder daneben - kein gestrichelter
   Rahmen: Der ist die Handschrift eines Web-Uploads von damals und sieht auf
   einem Telefon aus wie ein Fehler.

   Die Hoehe kommt aus dem Seitenverhaeltnis, in dem das Bild spaeter auf der
   Karte des Gastes steht. So ist die leere Flaeche schon der Platz, den das
   Foto einnehmen wird, und nach dem Antippen springt nichts. */
.go-offer-photo {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
  color: #64748b;
  font: inherit;
  text-align: center;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}
.go-offer-photo:active { transform: scale(0.99); }
.go-offer-photo__plus {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #4f46e5;
}
.go-offer-photo__title { font-size: 13px; font-weight: 900; color: #0f172a; }
.go-offer-photo__sub { font-size: 11px; font-weight: 700; color: #94a3b8; }
/* Nach dem Hochladen nimmt das Bild denselben Platz ein - dieselbe Rundung,
   dasselbe Verhaeltnis, derselbe Zuschnitt wie auf der Karte des Gastes. */
.go-offer-photo__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  background: #f8fafc;
}
.go-offer-photo__img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
/* Waehrend das Bild zum Server geht, liegt es schon da - nur blasser, damit
   der Wirt sieht, dass noch etwas laeuft. */
.go-offer-photo__frame--busy .go-offer-photo__img { opacity: 0.55; }
/* Eine Pille in der Mitte unter dem Bild - keine Leiste ueber die ganze
   Breite: Die saehe aus wie ein Knopf, und dieser Hinweis ist keiner. */
.go-offer-photo__busy {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 12px;
  background: rgb(15 23 42 / 0.72);
  color: #ffffff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}
.go-offer-photo__actions { margin-top: 10px; display: flex; gap: 8px; }
.go-offer-photo__action {
  min-height: 40px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #f8fafc;
  color: #475569;
  font: inherit;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}
.go-offer-photo__action--remove { color: #e11d48; }
/* Der AKTIVIZO-Knopf, in seinen zwei Zustaenden (Punkt 42).

   Die Farben stehen HIER und nicht in Klassen - und das ist keine Vorliebe,
   sondern die Lehre aus einem unsichtbaren Knopf: Das Tailwind-Blatt der App
   wird statisch erzeugt und enthaelt nur die Klassen, die schon jemand benutzt
   hat. Die Klasse bg-indigo-300 war nicht darunter. Der Knopf stand da, mit
   weisser Schrift, auf weissem Grund - ein Knopf, den man nicht sieht, fehlt. */
.go-offer-save { background: #a5b4fc; box-shadow: none; }
.go-offer-save--ready {
  background: #4f46e5;
  box-shadow: 0 20px 25px -5px rgb(99 102 241 / 0.2), 0 8px 10px -6px rgb(99 102 241 / 0.2);
}
/* Die Zeile unter "Nëse kërkohet ushqim". Zwei Klassen mit eigenen Werten
   (mt-0.5, text-white/60) trugen sie vorher - beide stehen im statischen Blatt
   nicht, also stand die Zeile zu hoch und auf der gewaehlten Karte in Weiss
   auf Schwarz statt gedaempft. */
.go-offer-answer__hint { margin-top: 2px; color: #94a3b8; }
[aria-pressed="true"] > .go-offer-answer__hint { color: rgb(255 255 255 / 0.6); }
`;function oe({attr:e="",unit:t="€",value:a="",placeholder:n="",mode:i="decimal",inputClass:o="",escapeHtml:h=null}={}){return`
    <div class="go-offer-price">
      <input type="text" ${e} inputmode="${s(h,i)}" autocomplete="off"
        placeholder="${s(h,n)}" value="${s(h,a)}" class="${o}" />
      <span class="go-offer-price__unit">${s(h,t)}</span>
    </div>
  `}function q(e,{active:t=!1,attr:a="",value:n="",escapeHtml:i=null}={}){return`
    <button type="button" ${a?`${a}="${s(i,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${s(i,e)}
    </button>
  `}const ke=Object.freeze([10,15,20,25]);function Gt({benefit:e={},percentCustom:t=!1,errorFor:a=()=>"",inputClass:n="",inputBase:i="",escapeHtml:o=null}={}){const h=f=>T(o,f),p=f=>{const k=a(f);return k?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="${s(o,f)}">${s(o,k)}</p>`:""};if(!gt.includes(e.kind))return`
      <p class="go-offer-saving font-bold text-slate-400">${s(o,r.benefitLegacy)}</p>
      ${p("benefit")}
    `;const b=Number(e.percent)||0,y=t||b>0&&!ke.includes(b),m=()=>{const f=ft(e.savingCents);if(!f)return"";const k=Math.round(Number(e.savingPercent)||0);return`
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${s(o,r.saving)} ${s(o,f)}${k>0?` &middot; -${k}%`:""}
      </p>
    `},u=()=>`
    <div class="mt-3">
      ${h(r.priceRegular)}
      ${oe({attr:"data-go-benefit-regular",value:xe(e.regularPriceCents),placeholder:r.pricePlaceholder,inputClass:i,escapeHtml:o})}
      ${p("regularPrice")}
    </div>
    <div class="mt-3">
      ${h(r.priceGo)}
      ${oe({attr:"data-go-benefit-go",value:xe(e.goPriceCents),placeholder:r.pricePlaceholder,inputClass:i,escapeHtml:o})}
      ${p("goPrice")}
    </div>
    ${m()}
  `;if(e.kind===Fe)return`
      ${h(r.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${ke.map(f=>q(`${f}%`,{active:!y&&b===f,attr:"data-go-discount",value:String(f),escapeHtml:o})).join("")}
        ${q(r.discountOther,{active:y,attr:"data-go-discount",value:"other",escapeHtml:o})}
      </div>
      ${y?`
        <div class="mt-3">
          ${oe({attr:"data-go-benefit-percent",unit:"%",mode:"numeric",value:b>0?String(b):"",placeholder:r.discountPlaceholder,inputClass:i,escapeHtml:o})}
        </div>
      `:""}
      ${p("benefitPercent")}

      <div class="mt-4">
        ${h(r.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[["all",r.scopeAll],["food",r.scopeFood],["drinks",r.scopeDrinks]].map(([f,k])=>q(k,{active:(e.scope||"all")===f,attr:"data-go-discount-scope",value:f,escapeHtml:o})).join("")}
        </div>
        ${p("benefitScope")}
      </div>
    `;if(e.kind===Ae)return`
      ${h(r.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.bundlePlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${p("benefitItem")}
      ${u()}
    `;if(e.kind===Be){const f=String(e.conditionType||"");return`
      ${h(r.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.freePlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${p("benefitItem")}

      <div class="mt-4">
        ${h(r.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[["food",r.conditionFood],["drink",r.conditionDrink],["any_order",r.conditionAny],["custom",r.conditionCustom]].map(([k,z])=>q(z,{active:f===k,attr:"data-go-benefit-condition",value:k,escapeHtml:o})).join("")}
        </div>
        ${f==="custom"?`
          <div class="mt-3">
            ${h(r.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${s(o,r.customConditionPlaceholder)}"
              value="${s(o,e.customCondition||"")}" class="${n}" />
          </div>
        `:""}
        ${p("benefitCondition")}
      </div>
    `}return e.kind===je?`
      ${h(r.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.productPlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${p("benefitItem")}
      ${u()}
    `:""}function Lt({imageUrl:e="",photo:t={},escapeHtml:a=null,icon:n=null}={}){const i=String(t.status||""),o=i==="uploading",h=String(t.previewUrl||e||""),p=i==="error"?String(t.error||r.photoError):"",b=h?`
      <div class="go-offer-photo__frame${o?" go-offer-photo__frame--busy":""}">
        <img class="go-offer-photo__img" src="${s(a,h)}" alt="" decoding="async" />
        ${o?`<span class="go-offer-photo__busy">${s(a,r.photoUploading)}</span>`:""}
      </div>
      <div class="go-offer-photo__actions">
        <button type="button" class="go-offer-photo__action" data-go-offer-photo-pick>${s(a,r.photoChange)}</button>
        <button type="button" class="go-offer-photo__action go-offer-photo__action--remove" data-go-offer-photo-remove>${s(a,r.photoRemove)}</button>
      </div>
    `:`
      <button type="button" class="go-offer-photo" data-go-offer-photo-pick>
        <span class="go-offer-photo__plus">${G(n,"plus","w-5 h-5")}</span>
        <span class="go-offer-photo__title">${s(a,r.photoAdd)}</span>
        <span class="go-offer-photo__sub">${s(a,r.photoSource)}</span>
      </button>
    `;return`
    <div data-go-section="photo">
      ${T(a,r.photoQuestion)}
      <p class="mt-1 text-[11px] font-semibold text-slate-400">
        ${s(a,r.photoHint)}
        <span class="text-slate-300">&middot; ${s(a,r.photoOptional)}</span>
      </p>
      <!--
        Das Feld nimmt, was ein Telefon anbietet: aufnehmen, aus der Mediathek,
        aus den Dateien. Ohne "capture" - das erzwingt die Kamera und nimmt dem
        Wirt die drei Fotos, die er letzte Woche schon gemacht hat.
      -->
      <input type="file" accept="image/*" class="hidden" data-go-offer-photo-input />
      <div class="mt-3">${b}</div>
      ${p?`<p class="mt-2 text-[11px] font-bold text-rose-500">${s(a,p)}</p>`:""}
    </div>
  `}function Nt(e=""){const t=String(e||"all").trim().toLowerCase();return t==="food"?["food"]:t==="coffee"||t==="drinks"||t==="dessert"?["drinks"]:["food","drinks"]}function Aa(e=[]){const t=Array.isArray(e)?e:[],a=t.includes("food"),n=t.includes("drinks");return a&&n?"all":a?"food":n?"drinks":""}function Ba({editor:e=null,businessName:t="",deps:a={}}={}){if(!e)return"";const n=a.escapeHtml,i=a.icon,o=e.draft||{},h=Array.isArray(e.errors)?e.errors:[],p=_=>h.find(B=>B.field===_)?.message||"",b=Array.isArray(o.partyRanges)?o.partyRanges:[],y=o.schedule?.mode==="windows"?"windows":"always",m=Array.isArray(o.schedule?.days)&&o.schedule.days.length?o.schedule.days:ye.slice(),u=_e.every(_=>b.includes(_.key)),f=Array.isArray(e.intents)?e.intents:Nt(o.category),k=o.benefit||{},z=e.mode==="edit",K="w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",M=`mt-2 ${K}`,$='<div class="h-px bg-slate-100"></div>',w=_=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${s(n,_)}</p>`,R=ht(o).ok&&f.length>0;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${s(n,z?r.editOffer:r.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${Te}${Tt}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(n,r.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${s(n,z?r.editOffer:r.createOffer)}</h3>
            <!--
              Der eine Satz, der einem Wirt erklaert, warum er hier steht
              (Punkt 2). Er steht im Kopf und nicht im Bildlauf: Er gilt fuer
              das ganze Formular, nicht fuer die erste Frage.
            -->
            <p class="mt-1 text-[11px] font-semibold text-slate-400">${s(n,r.editorHint)}</p>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${s(n,r.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${G(i,"x","w-4 h-4")}
          </button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar modal-scroll px-6 py-5 space-y-5" data-go-editor-scroll>
          <!--
            ÇKA PO OFRON? - der erste und wichtigste Schritt.

            Vier Arten in einem 2x2-Raster: In einer Reihe zu vier waeren die
            Woerter auf dem Telefon abgeschnitten, und "Çmim special" ist kein
            Wort, das man erraten soll. Darunter genau die Felder, die die
            gewaehlte Art braucht - und sonst keines.
          -->
          <div class="go-offer-section" data-go-section="benefit">
            ${T(n,r.benefitQuestion)}
            ${w(r.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[[Fe,r.benefitPercent],[Ae,r.benefitBundle],[Be,r.benefitFree],[je,r.benefitSpecial]].map(([_,B])=>`
                <button type="button" data-go-benefit-kind="${s(n,_)}"
                  aria-pressed="${k.kind===_?"true":"false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${k.kind===_?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${s(n,B)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5" data-go-benefit-form>
              ${Gt({benefit:k,percentCustom:e.percentCustom===!0,errorFor:p,inputClass:M,inputBase:K,escapeHtml:n})}
            </div>
          </div>

          ${$}

          <!--
            Das Foto steht direkt hinter den Angaben zum Angebot und nicht am
            Ende des Formulars (Punkt 9): Es gehoert zum Angebot. Wer es unten
            sucht, hat vorher dreimal gelesen, dass es freiwillig ist.
          -->
          ${Lt({imageUrl:o.imageUrl||"",photo:e.photo||{},escapeHtml:n,icon:i})}

          ${$}

          <div data-go-section="partyRanges">
            ${T(n,r.partyQuestion)}
            ${w(r.partyHint)}
            <!--
              "Të gjithë" zuerst und allein in seiner Zeile: Es ist die Antwort
              der meisten Lokale, und es ist keine fuenfte Gruppengroesse,
              sondern die Abkuerzung fuer alle vier darunter (Punkt 15).
            -->
            <div class="mt-3">
              ${te(r.partyAll,{active:u,attr:"data-go-offer-party",value:"all",escapeHtml:n})}
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              ${_e.map(_=>te(_.label,{active:b.includes(_.key),attr:"data-go-offer-party",value:_.key,escapeHtml:n})).join("")}
            </div>
            ${p("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="partyRanges">${s(n,p("partyRanges"))}</p>`:""}
          </div>

          ${$}

          <div data-go-section="category">
            ${T(n,r.categoryQuestion)}
            ${w(r.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:r.ifFood},{key:"drinks",label:r.ifDrinks}].map(_=>{const B=f.includes(_.key),E=pt.find(Z=>Z.key===_.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${s(n,_.key)}" aria-pressed="${B?"true":"false"}"
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${B?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${s(n,_.label)}</span>
                    <span class="block text-[11px] font-semibold go-offer-answer__hint">${s(n,E)}</span>
                  </button>
                `}).join("")}
            </div>
            ${p("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="category">${s(n,p("category"))}</p>`:""}
          </div>

          ${$}

          <div data-go-section="schedule">
            ${T(n,r.scheduleQuestion)}
            ${w(r.scheduleHint)}
            <div class="mt-3 flex flex-wrap gap-2">
              ${te(r.always,{active:y==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${te(r.specificHours,{active:y==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
            </div>
            ${y==="windows"?`
              <!--
                Die Tage stehen jetzt im Formular (Punkt 23). Vorher galt ein
                Orar specifik stillschweigend fuer jeden Tag - ein Cafe, dessen
                Morgenangebot nur werktags gilt, hatte dafuer keinen Ort im
                Modal. Vorausgewaehlt sind trotzdem alle sieben: Wer nichts
                anfassen will, muss nichts anfassen.
              -->
              <div class="mt-4">
                ${T(n,r.daysQuestion)}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${ye.map(_=>q(ut(_),{active:m.includes(_),attr:"data-go-offer-day",value:_,escapeHtml:n})).join("")}
                </div>
              </div>
              <div class="mt-4">
                ${T(n,r.hoursQuestion)}
                <div class="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    ${T(n,r.hoursFrom,"goOfferFrom")}
                    <input id="goOfferFrom" type="time" data-go-offer-from value="${s(n,e.windowFrom||"14:00")}" class="${M}" />
                  </div>
                  <div>
                    ${T(n,r.hoursTo,"goOfferTo")}
                    <input id="goOfferTo" type="time" data-go-offer-to value="${s(n,e.windowTo||"18:00")}" class="${M}" />
                  </div>
                </div>
              </div>
            `:""}
            ${p("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="schedule">${s(n,p("schedule"))}</p>`:""}
          </div>

          ${$}

          ${Ot({offer:o,businessName:t,previewImageUrl:e.photo?.previewUrl||"",deps:a})}
        </div>

        <div class="px-6 pb-6 pt-4 border-t border-slate-100 bg-white modal-footer-safe">
          <!--
            Fertig oder nicht (Punkt 42): Solange etwas fehlt, traegt der Knopf
            das blasse Lila und keinen Schatten - er sieht aus, als koenne er
            noch nicht. Antippen kann man ihn trotzdem, und dann steht dort,
            WAS fehlt: Ein Knopf, der stumm nicht reagiert, laesst das Lokal
            suchen (Punkt 43).
          -->
          <button type="button" data-go-offer-save ${e.saving?"disabled":""}
            aria-disabled="${R?"false":"true"}"
            class="w-full py-4 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all go-offer-save${R?" go-offer-save--ready":""}">
            ${s(n,e.saving?r.saving:z?r.save:r.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${s(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function ja({restaurantName:e="",tab:t="active",stats:a={},search:n={},bookings:i=[],offers:o=[],settings:h={},paused:p=!1,loading:b=!1,error:y="",deps:m={}}={}){const u=m.escapeHtml,f=m.icon,k=w=>["accepted","activated"].includes(Ke(w.status)),z=i.filter(k),K=i.filter(w=>!k(w)),M=o.filter(w=>w.status!=="archived");let $="";if(t==="offers")$=ee({eyebrow:r.brand,title:r.tabs.offers,sub:`${M.length} ${M.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${G(f,"plus","w-4 h-4")}
        </button>
      `,body:M.length?`<div class="space-y-3">${M.map(w=>Et(w,m)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.emptyTitle)}</div>`,deps:m});else if(t==="archive")$=ee({eyebrow:r.brand,title:r.tabs.archive,sub:`${K.length}`,body:K.length?`<div class="space-y-3">${K.map(w=>se(w,m)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.noHistory)}</div>`,deps:m});else if(t==="options"){const w=Le(h?.pausedUntil);$=ee({eyebrow:r.brand,title:r.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${s(u,r.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${s(u,p?`${r.pausedUntil} ${w}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${p?"text-amber-600":"text-emerald-600"}">
            ${s(u,p?r.paused:r.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${p?`<button type="button" data-go-pause="0" class="go-pause px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${s(u,r.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(R=>`
              <button type="button" data-go-pause="${R.value}"
                class="go-pause px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${s(u,R.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${s(u,r.keepsRunning)}</p>
      `,deps:m})}else $=ee({eyebrow:r.brand,title:r.tabs.active,sub:`${z.length}`,body:`
        ${Ct({code:n.code,status:n.status,busy:n.busy,deps:m})}
        ${n.booking?`
          <div class="mb-4">${se(n.booking,m,{found:!0})}</div>
        `:""}
        ${b?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u,r.loading)}</div>`:z.length?`<div class="space-y-3">${z.filter(w=>w.id!==n.booking?.id).map(w=>se(w,m)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.noBookings)}</div>`}
      `,deps:m});return`
    <div class="p-6 app-main-content-safe animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <!--
        Beide Stylesheets. GO_OFFER_CARD_CSS stand lange nur im Modal - und
        damit sah die Karte in der Vorschau richtig aus und in der Liste des
        Wirts nach gar nichts. Ein Stylesheet, das nur an einem von zwei Orten
        liegt, an denen dieselbe Karte gezeichnet wird, ist kein Stylesheet,
        sondern eine halbe Zusage.
      -->
      <style>${Te}${jt}</style>
      <!--
        Dieselbe Ueberschrift wie im Qyteti: oben der Name in einer Zeile,
        darunter ein Satz in klein und grau. Vorher standen hier drei Zeilen
        - eine Marke, eine Ueberschrift, ein Name - und das Lokal las von oben
        nach unten dreimal, wo es ist, bevor es einmal las, was es hier tun
        kann. Zwei Zeilen sagen dasselbe.

        Das GO steht im Blau der Marke und direkt am Wort: "MNYRAGO" ist ein
        Name, kein Wort mit einer Beschriftung daneben. Darunter steht nur noch
        das Lokal selbst. Davor stand das Wort fuer den Editor - es sagte dem
        Wirt, in welchem Werkzeug er ist, und das weiss er, weil er es
        geoeffnet hat.

        Rechts steht der eine Handgriff der Seite: das Wort und das runde Plus
        daneben.
      -->
      <div class="go-head mb-6">
        <div class="go-head__brand">
          <h1 class="go-title text-xl font-black tracking-tight text-slate-900">${s(u,r.brandMnyra)}<span class="text-indigo-600">${s(u,r.brandGo)}</span></h1>
          ${e?`<p class="go-title-sub text-[11px] text-slate-400 font-semibold">${s(u,e)}</p>`:""}
        </div>
        <!--
          Der Knopf traegt dasselbe Merkmal wie der ueber der Ofertat-Liste.
          Damit oeffnet er GENAU dasselbe Modal ueber denselben Weg - der Klick
          faellt in dieselbe Stelle im Ablauf der Seite. Ein zweiter Ausloeser
          fuer denselben Editor waere ein zweiter Ort, an dem er kaputtgehen
          kann.
        -->
        <div class="go-head__action">
          <span class="go-head__action-label" aria-hidden="true">${s(u,r.createOfferAction)}</span>
          <button type="button" data-go-offer-new class="go-head__plus"
            aria-label="${s(u,r.createOfferAction)}" title="${s(u,r.createOfferAction)}">
            ${G(f,"plus","w-4 h-4")}
          </button>
        </div>
      </div>

      ${Mt({stats:a,deps:m})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        dieselbe Flaeche wie im Paneli. Die Reihe darueber bleibt frei: sie
        gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="go-bento" data-go-bento>
        ${Rt({tab:t,deps:m})}
        <div>
          ${$}
          ${y?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u,y)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Ka({deps:e={},resolving:t=!1}={}){const a=e.icon,n=e.escapeHtml;return t?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${s(n,r.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${G(a,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${s(n,r.brand)}</h2>
        <p class="text-sm text-slate-500">${s(n,r.onlyBusiness)}</p>
      </div>
    </div>
  `}const $e="mnyraDashboardStyles",It=`
.mnyra-dash {
  /* Horizontale Flucht auf die SICHTBAREN Header-Icons (nicht die
     unsichtbaren Touch-Kreise): Menue-Striche beginnen bei 28px,
     Warenkorb-Symbol endet bei 30px vom rechten Rand - 28px beidseitig
     trifft beide optisch (rechts 2px Toleranz, im Browser vermessen). */
  padding: 16px 28px 0;
  /* Kein unteres Polster und keine Mindesthoehe mehr: den Abschluss der Seite
     macht jetzt der Fuss der App (core/ui/app-footer-render-utils.js), der im
     Fluss hinter dem Panel steht. Beides hier waere doppelt - die Mindesthoehe
     schoebe den Fuss ausserdem bei kurzem Inhalt unter den Bildschirmrand. */
  --dash-surface: #ffffff;
  --dash-plane: #f8fafc;
  --dash-ink: #0f172a;
  --dash-ink-2: #475569;
  --dash-muted: #94a3b8;
  --dash-border: rgba(15, 23, 42, 0.08);
  /* Genau die Linie, die auch die Profil-Karten tragen (border-slate-100). */
  --dash-hairline: #f1f5f9;
  /* Die Umrandung der hellen Karten - eine Stufe dunkler (slate-200). Die
     Haarlinie waere hier zu leise: die Karten stehen auf ihrer eigenen
     hellen Flaeche im Weiss des Bentos, und ohne sichtbare Kante schwimmen
     sie darin. */
  --dash-card-outline: #e2e8f0;
  --dash-accent: #4f46e5;
  --dash-accent-soft: #eef2ff;
  /* Eine Rundung fuer alle Karten des Panels - gemessen an der Vorlage
     (25px). Kein Schatten, und als Rand dieselbe Haarlinie wie im Profil. */
  --dash-card-radius: 25px;
  /* Die schwarze Posting-Karte. Eigene Marken statt roher Farbwerte, damit
     Flaeche und Schrift darauf an einer Stelle stimmen - auf Schwarz traegt
     weder das Panel-Indigo noch das Panel-Grau genug Kontrast. */
  --dash-black: #0f172a;
  --dash-black-ink: #ffffff;
  --dash-black-muted: #94a3b8;
  --dash-black-accent: #a5b4fc;
  --dash-black-hairline: rgba(255, 255, 255, 0.14);
  --dash-black-ring: rgba(255, 255, 255, 0.2);
  /* Mnyra Waiter hat seine eigenen Farben - schwarze Flaeche, weisses "MNYRA",
     rotes "WAITER". Genau das Rot, das die Waiter-App traegt (rose-500), damit
     die Karte hier und die App dahinter als dasselbe lesen. */
  --dash-waiter: #f43f5e;
  --dash-waiter-soft: rgba(244, 63, 94, 0.16);
  --dash-waiter-ring: rgba(244, 63, 94, 0.35);
  /* Und ihre Flaeche ist wirklich schwarz, nicht das dunkle Blau der
     Posting-Karte (--dash-black: #0f172a). Die beiden stehen uebereinander -
     mit derselben Farbe waeren es zwei Haelften einer Flaeche statt zwei
     Karten. Der Schriftzug steht dabei wie auf den anderen Karten: "Mnyra
     Waiter", nicht in Grossbuchstaben. */
  --dash-waiter-plane: #000000;
  /* Das Bento unter der Karte: nur oben gerundet, weil es bis an die
     Panel-Raender und bis ans Seitenende laeuft. Dieselbe Rundung wie das
     Bento des Feed-Gates (--feed-location-gate-bento-radius: 2.5rem), damit
     beide Flaechen in der App gleich anfangen. Der Auslauf ist genau das
     untere Polster von .mnyra-dash: so endet die Flaeche mit der Seite.
     Die Faecher darin sind etwas kleiner gerundet als die Karte darueber,
     damit sie als Inhalt der Flaeche lesen und nicht als Karten darauf. */
  --dash-bento-radius: 40px;
  --dash-bento-tail: 112px;
  --dash-bento-cell-radius: 20px;
  /* Die obere Kante des Bentos traegt denselben weichen Schatten wie der
     Header - nach oben gedreht, weil die Flaeche hier von unten kommt. */
  --dash-bento-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
  /* Das Bildfenster der Kennzahl-Karten. Eine Zahl fuer alle vier, damit die
     Reihe eine Linie haelt - und die Zahl, auf die die beiden festen Fotos
     zugeschnitten sind. */
  --dash-hl-media: 140px;
  color: var(--dash-ink);
  font-family: inherit;
}
/* Als installierte App gibt es keine Adressleiste, die den Viewport kleiner
   machen koennte - dort ist der dynamische Viewport der ehrlichere Wert.
   Dieselbe Ausnahme macht das Feed-Gate. */
.mnyra-dash * { box-sizing: border-box; }
/* Die Begruessung steht wie die Stadt-Ueberschrift im Feed: eine fette Zeile,
   darunter dicht die graue Unterzeile. Deshalb ein Stapel, keine Zeile mit
   Bild links - das Logo sitzt jetzt IN der ersten Zeile. */
.mnyra-dash__greet {
  min-height: 44px;
  margin: 4px 0 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Das Logo steht so gross wie das Wort daneben - flach in der Seite, nur mit
   abgerundeten Ecken. Kein Indigo-Lila-Ring mehr, kein Schatten: mit Rahmen
   stand das Bild vor der Seite statt darin. Die Haarlinie bleibt, damit ein
   weisses Logo nicht randlos in die weisse Seite laeuft. */
.mnyra-dash__greet-logo {
  width: 22px;
  height: 22px;
  flex: 0 0 auto;
}
.mnyra-dash__greet-logo img,
.mnyra-dash__greet-logo-fallback {
  width: 100%;
  height: 100%;
  border-radius: 7px;
  border: 1px solid var(--dash-hairline);
  background: #ffffff;
  object-fit: cover;
  display: block;
}
.mnyra-dash__greet-logo-fallback {
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__greet-logo-fallback svg,
.mnyra-dash__greet-logo-fallback i {
  width: 13px;
  height: 13px;
  display: block;
}
/* Genau die Ueberschrift der Stadt im Feed: text-xl, font-black,
   tracking-tight, slate-900. */
.mnyra-dash__greet-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin: 0;
  color: var(--dash-ink);
}
/* Dieselbe Farbe wie die Ueberschrift, in der sie steht. */
.mnyra-dash__greet-hello { color: var(--dash-ink); }
/* Und die Unterzeile genau wie unter der Stadt: 11px, halbfett, slate-400,
   dicht an der Zeile darueber. */
.mnyra-dash__greet-sub {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  margin: 2px 0 0;
  color: var(--dash-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die Kennzahl-Reihe unter der Begruessung - dieselbe Machart wie die
   Highlight-Karten der Lokale-Seite: eine waagerechte Reihe, die bis an beide
   Bildschirmraender laeuft, aber links dort anfaengt, wo auch alles andere im
   Panel anfaengt.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash, das Polster
   darin schiebt die erste Karte wieder in die Flucht. So laeuft die Reihe unter
   den Rand hinaus, ohne dass die erste Karte springt.
   Die 34px Abstand zur Begruessung sind dieselben, die vorher die schwarze
   Karte hier hatte (16px Aussenmarge der Begruessung + 18px). */
.mnyra-dash__hl {
  margin: 28px -28px 0;
  padding: 0 28px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 28px;
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-dash__hl::-webkit-scrollbar { display: none; }
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+28px Polster), abzueglich der beiden
   Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-dash__hl-card {
  flex: 0 0 calc((100% + 28px - 20px) / 2.5);
  /* Bildfenster + Abstand + Textblock + Polster unten. Die Karte gibt dem Text
     unter dem Bild Luft, statt ihn an die Kante zu setzen. Der Textblock traegt
     zwei Zeilen Beschriftung (25px) und darunter die Zahl - deshalb 88px und
     nicht mehr 74px. */
  height: calc(var(--dash-hl-media) + 88px);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-surface);
  padding: 0;
  scroll-snap-align: start;
  cursor: pointer;
  text-align: left;
  font: inherit;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__hl-card:active { transform: scale(0.98); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.mnyra-dash__hl-tail { flex: 0 0 18px; }
/* Alle Bilder stehen im selben Fenster oben in der Karte - gleiche Hoehe auf
   jeder Karte, egal welches Format das Bild mitbringt. Vorher richtete sich
   die Hoehe nach dem Bild, und die Reihe sah dadurch ungleich aus.
   Das Fenster ist etwas breiter als hoch (--dash-hl-media). Ein hochformatiges
   Bild wird darin oben und unten beschnitten und behaelt seine volle Breite;
   nur ein Bild, das noch flacher liegt als das Fenster, verliert etwas an den
   Seiten. Die beiden festen Fotos sind auf genau dieses Verhaeltnis
   zugeschnitten und werden deshalb gar nicht beschnitten.
   Die Maske loest die Unterkante auf, damit das Bild nicht mit einer harten
   Linie endet, sondern in das Weiss darunter uebergeht. */
.mnyra-dash__hl-media {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--dash-hl-media);
  object-fit: cover;
  object-position: center;
  display: block;
}
/* Die Flaeche unter dem Bild: sie traegt die Karte, wenn ein Bild fehlt oder
   nicht laedt - dann steht hier statt eines Lochs eine ruhige Flaeche mit
   Symbol, dieselbe wie in den Faechern des Bentos. Das Symbol sitzt oben, wo
   sonst das Bild steht, nicht in der Mitte der ganzen Karte. */
.mnyra-dash__hl-plate {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dash-hl-media);
  background: var(--dash-plane);
  color: var(--dash-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}
.mnyra-dash__hl-plate svg,
.mnyra-dash__hl-plate i { width: 26px; height: 26px; display: block; }
/* Ueber dem Bildfenster lag frueher ein weisser Verlauf, der seine Unterkante
   ausblendete. Er ist weg: das Bild steht jetzt ganz und scharf im Fenster und
   endet an dessen Kante. Beschriftung und Zahl standen ohnehin schon unter dem
   Fenster im Weissen - fuer sie aendert sich dadurch nichts. */
/* Beschriftung und Zahl stehen unter dem Bildfenster, mit Abstand dazu. Die
   14px sind dieser Abstand - er faengt dort an, wo das Fenster endet. */
.mnyra-dash__hl-body {
  position: absolute;
  left: 12px;
  right: 12px;
  top: calc(var(--dash-hl-media) + 14px);
  z-index: 2;
}
/* Zwei Zeilen, immer - auch wenn die Beschriftung nur eine braucht.
   "Skanime n'tavolina" passt auf dieser Kartenbreite nicht in eine Zeile;
   abgeschnitten waere sie unlesbar. Der Platz fuer die zweite Zeile ist
   deshalb auf JEDER Karte reserviert (min-height), nicht nur wo er gebraucht
   wird: so stehen die Zahlen aller vier Karten auf derselben Hoehe. Eine
   dritte Zeile gibt es nicht - danach endet die Beschriftung mit Punkten. */
.mnyra-dash__hl-label {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  min-height: 25px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.25;
  color: var(--dash-muted);
  overflow: hidden;
}
.mnyra-dash__hl-value {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.05;
  color: var(--dash-ink);
  font-variant-numeric: tabular-nums;
}
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl - und
   nimmt genau ihre Hoehe ein: zwei Zeilen zu 11px sind so hoch wie eine Zahl
   zu 22px. Die Karte bleibt dadurch so hoch wie ihre Nachbarn. */
/* Steht noch kein Beitrag da, tritt dieser Satz an die Stelle der Zahl. Er
   nimmt genau ihre Hoehe ein, damit die Karte so hoch bleibt wie ihre
   Nachbarn - und er ist kurz genug fuer eine Zeile. */
.mnyra-dash__hl-empty {
  display: flex;
  align-items: center;
  min-height: 23px;
  margin: 5px 0 0;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--dash-ink-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Das Auge vor der Zahl des Beitrags: es sagt "gesehen", ohne dass ein Wort
   dafuer in der Beschriftung stehen muss. */
.mnyra-dash__hl-eye {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-muted);
}
.mnyra-dash__hl-eye svg,
.mnyra-dash__hl-eye i { width: 16px; height: 16px; display: block; }
/* Der Platzhalter steht genau dort und genau so hoch wie die Zahl, die gleich
   kommt: zwischen Laden und Zahl springt nichts. */
.mnyra-dash__hl-value--pending {
  width: 54px;
  height: 23px;
  margin-top: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.28);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
}
/* Verschlossene Karte: das Bild bleibt scharf und ganz zu sehen - verschlossen
   ist die ZAHL, nicht das Motiv. An ihrer Stelle steht das Schild. */
/* Das Schild auf der hellen Karte: dunkel gefuellt, damit es sich vom Weiss
   abhebt - auf Weiss waere ein weisses Schild nicht zu sehen. */
.mnyra-dash__hl-lock {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin: 5px 0 0;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--dash-black);
  border: 1px solid var(--dash-black);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.03em;
  color: var(--dash-black-ink);
}
.mnyra-dash__hl-lock svg,
.mnyra-dash__hl-lock i { width: 11px; height: 11px; display: block; }
/* Die Karte, die auf ihr Bild wartet (der beste Beitrag): dieselbe Flaeche und
   Rundung wie die fertige Karte, damit beim Eintreffen nichts springt. */
.mnyra-dash__hl-card--pending {
  background: var(--dash-plane);
  border-color: var(--dash-hairline);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  cursor: default;
}
/* "Posto n'Zbulo": erste Karte im Bento. Ueberschrift, Untertitel, darunter
   die Aktionszeile mit dem Plus. */
.mnyra-dash__composer {
  background: var(--dash-black);
  /* Rand in der Flaechenfarbe - ausdruecklich gesetzt, weil die Karte ein
     <button> ist und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-black);
  border-radius: var(--dash-card-radius);
  padding: 18px;
}
/* Die ganze Karte ist der Knopf. Sie sieht aus wie vorher - nur nimmt jetzt
   jede Stelle den Tipp an, nicht nur ein Streifen darin. */
.mnyra-dash__composer--tap {
  display: block;
  width: 100%;
  text-align: left;
  font: inherit;
  /* Die Waiter-Karte ist ein <a>, weil sie aus der App hinausfuehrt - ohne das
     hier zoege der Browser eine Linie unter jedes Wort darin. */
  text-decoration: none;
  color: var(--dash-black-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
}
.mnyra-dash__composer--tap:active { transform: scale(0.99); }
/* Groesse und Gewicht der Ueberschrift bleiben unveraendert, nur die Farbe
   traegt jetzt die schwarze Flaeche. Als Kind eines <button> steht sie in
   einem <span> - der braucht die Blockform ausdruecklich. */
.mnyra-dash__composer-title {
  display: block;
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: var(--dash-black-ink);
}
.mnyra-dash__composer-accent { color: var(--dash-black-accent); }
/* Untertitel: dasselbe Grau wie im Panel, auf Schwarz noch gut lesbar. */
.mnyra-dash__composer-sub {
  display: block;
  margin: 5px 0 0;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--dash-black-muted);
}
/* Die Aktionszeile der grossen Karte: eine Haarlinie trennt sie vom Text,
   darunter das Plus im Kreis, die Beschriftung und rechtsbuendig der Pfeil.
   Kein zweiter Knopf - die Karte selbst nimmt den Tipp an. */
.mnyra-dash__composer-cta {
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--dash-black-hairline);
  display: flex;
  align-items: center;
  gap: 10px;
}
.mnyra-dash__composer-cta-icon {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--dash-black-ring);
  background: transparent;
  /* Plus und Beschriftung stehen weiss auf der schwarzen Karte - das Indigo
     der Ueberschrift traegt hier unten zu wenig. */
  color: var(--dash-black-ink);
  display: flex;
  align-items: center;
  justify-content: center;
}
/* Die Karte kommt ohne den Tailwind-Build aus: Symbolgroessen stehen hier. */
.mnyra-dash__composer-cta-icon svg,
.mnyra-dash__composer-cta-icon i {
  width: 15px;
  height: 15px;
  display: block;
}
.mnyra-dash__composer-cta-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  color: var(--dash-black-ink);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__composer-cta-chevron {
  margin-left: auto;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  color: var(--dash-black-muted);
}
.mnyra-dash__composer-cta-chevron svg,
.mnyra-dash__composer-cta-chevron i {
  width: 16px;
  height: 16px;
  display: block;
}
/* Dieselbe Karte in hell: Form, Masse und Abstaende bleiben, nur die Farben
   kommen aus dem Panel statt von der schwarzen Flaeche. Damit steht die
   Offerten-Karte in derselben Farbwelt wie "Ndrysho menune" und
   "Oferta & Reklama" darunter - ruhige Flaeche, Haarlinie, das Indigo im
   Symbol. Zwei schwarze Karten uebereinander waeren zu schwer gewesen. */
.mnyra-dash__composer--plane {
  background: var(--dash-plane);
  /* Eine sichtbare Umrandung, nicht die Haarlinie der Faecher: die stand auf
     der eigenen Flaeche der Karte (#f8fafc) praktisch im Nichts, und die Karte
     schwamm damit im Weiss des Bentos. Eine Stufe dunkler (slate-200) zieht
     die Kante sauber nach, ohne dass sie als Rahmen auffaellt. Die Linie IN
     der Karte - ueber der Aktionszeile - bleibt die leisere: sie trennt
     innen, die Umrandung grenzt nach aussen ab. */
  border-color: var(--dash-card-outline);
  color: var(--dash-ink);
}
/* Das Abzeichen auf einer Karte: die Zahl der Vorgaenge, die das Lokal noch
   nicht gesehen hat. Es sitzt in der Ueberschrift, damit es die Karte nicht
   breiter macht - und traegt sein eigenes aria-label, weil eine rote Blase
   allein fuer Screenreader nichts sagt. */
.mnyra-dash__composer-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  margin-left: 8px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--dash-waiter);
  color: #ffffff;
  font-size: 11px;
  font-weight: 900;
  line-height: 1;
  vertical-align: middle;
}
.mnyra-dash__composer--plane .mnyra-dash__composer-title { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-accent { color: var(--dash-accent); }
.mnyra-dash__composer--plane .mnyra-dash__composer-sub { color: var(--dash-muted); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta { border-top-color: var(--dash-hairline); }
/* Das Symbol traegt dieselbe weiche Indigo-Flaeche wie die Kacheln - auf hell
   ist der Ring der schwarzen Karte kaum zu sehen. */
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-icon {
  border-color: transparent;
  background: var(--dash-accent-soft);
  color: var(--dash-accent);
}
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-label { color: var(--dash-ink); }
.mnyra-dash__composer--plane .mnyra-dash__composer-cta-chevron { color: var(--dash-muted); }
/* Und dieselbe Karte in den Farben von Mnyra Waiter. Sie behaelt die schwarze
   Grundform - nur der Akzent wechselt von Indigo auf das Rot der Waiter-App.
   Der Schriftzug steht in Grossbuchstaben: er ist eine Marke, kein Satz.
   Als einzige Karte des Panels fuehrt sie aus der App hinaus; das Rot ist das,
   woran man Waiter drueben wiedererkennt. */
.mnyra-dash__composer--waiter {
  background: var(--dash-waiter-plane);
  border-color: var(--dash-waiter-plane);
}
.mnyra-dash__composer--waiter .mnyra-dash__composer-accent { color: var(--dash-waiter); }
/* Der Satz darunter steht hier weiss, nicht im Grau der anderen Karten: auf
   wirklich Schwarz traegt das Grau zu wenig. */
.mnyra-dash__composer--waiter .mnyra-dash__composer-sub { color: var(--dash-black-ink); }
.mnyra-dash__composer--waiter .mnyra-dash__composer-cta-icon {
  border-color: var(--dash-waiter-ring);
  background: var(--dash-waiter-soft);
  color: var(--dash-waiter);
}
.mnyra-dash__section { margin-top: 14px; }
.mnyra-dash__section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 10px;
}
.mnyra-dash__section-title {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--dash-ink-2);
  margin: 0;
}
.mnyra-dash__section-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 11px;
  font-weight: 800;
  color: var(--dash-accent);
  cursor: pointer;
}
/* Das Bento: eine helle Flaeche unter der schwarzen Karte. Sie traegt alles,
   was unter der Karte kommt - Schnellzugriffe, Kennzahlen, letzte Beitraege -
   und laeuft dabei bis ans Ende der Seite.
   Die negative Marge ist genau das Seitenpolster von .mnyra-dash: so reicht
   die Flaeche bis an die Panel-Raender, waehrend ihr Inhalt in der Flucht der
   Karte darueber bleibt. Weil sie an den Raendern endet und unten weiterlaeuft,
   sind nur die oberen Ecken gerundet - in derselben Rundung wie das Bento des
   Feed-Gates. */
.mnyra-dash__bento {
  /* Der Abstand nach oben ist die Luft zwischen der Kennzahl-Reihe und der
     Flaeche. Er ist bewusst gross: die Reihe soll als eigenes Stueck lesen und
     nicht an der Flaeche kleben, die gleich darunter anfaengt. */
  /* Nach unten polstert das Bento nur noch sich selbst. Frueher zog eine
     negative Marge denselben Betrag wieder ab, damit seine Flaeche bis ans
     Seitenende reichte - mit dem Fuss dahinter waere genau das ein Fehler: die
     Marge zoege ihn um diesen Betrag nach oben, mitten in die Flaeche hinein. */
  margin: 72px -28px 0;
  padding: 22px 28px var(--dash-bento-tail);
  background: var(--dash-surface);
  border-top: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-radius) var(--dash-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht: die
     Flaeche beginnt sichtbar, statt an der Haarlinie einfach umzuschlagen.
     Es ist der Schatten, den auch das Bento der Lokale-Seite traegt. */
  box-shadow: var(--dash-bento-shadow);
}
/* Alles im Bento haelt denselben Abstand zum Stueck darueber. Das erste
   Stueck - die Tab-Leiste - braucht keinen: dort ist das Polster des Bentos
   schon sein Abstand. */
.mnyra-dash__bento > .mnyra-dash__section,
.mnyra-dash__bento > .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }
.mnyra-dash__bento > .mnyra-dash__tabs { margin-top: 0; }
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Mit 44px liest sie als Kopf der Flaeche und nicht als erste Karte in
   einer Reihe von Karten. */
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__composer,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__section { margin-top: 44px; }
/* Die Tab-Leiste oben im Bento: Funksionet, Analitika, Opsionet.
   Drei Knoepfe, sonst nichts - kein Grund, kein Rahmen, kein Polster um sie
   herum. Frueher lagen sie in einem eigenen Kasten; der schob sie um seine
   Polsterbreite nach innen und brachte sie damit aus der Flucht der Karten
   darunter. Ohne ihn stehen sie genau dort, wo auch "Posto n'Mnyra" anfaengt
   und aufhoert - links wie rechts. */
.mnyra-dash__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse. Genau
   daran gehen solche Leisten sonst schief - ein Symbol, das seine Hoehe aus
   der Zeile zieht, sitzt auf jeder Zeile anders. */
.mnyra-dash__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  padding: 11px 8px;
  border: 1px solid var(--dash-hairline);
  /* Ganz rund, wie die Zeitraum-Knoepfe der Analitika. Beide sagen dasselbe -
     "waehle eines von mehreren" - und sollen deshalb gleich aussehen. */
  border-radius: 999px;
  background: var(--dash-plane);
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--dash-ink-2);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.mnyra-dash__tab svg,
.mnyra-dash__tab i {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: block;
}
.mnyra-dash__tab-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Der gewaehlte Knopf traegt dieselbe Flaeche wie die Posting-Karte darunter:
   dasselbe Schwarz, dieselbe weisse Schrift. Beides ist das Gewichtigste auf
   seiner Hoehe, und beides gehoert zusammen. */
.mnyra-dash__tab[aria-selected="true"] {
  background: var(--dash-black);
  border-color: var(--dash-black);
  color: var(--dash-black-ink);
}
.mnyra-dash__tab:active { transform: scale(0.98); }
/* Analitika und Opsionet bringen ihre eigene Ansicht mit - samt eigenem
   Seitenpolster. Das Bento hat seines schon; beide zusammen waeren doppelt.
   Der Rahmen nimmt deshalb das Polster des Bentos zurueck und laesst der
   Ansicht darin ihr eigenes. */
.mnyra-dash__embed {
  margin-left: -28px;
  margin-right: -28px;
}
/* Bis an den unteren Rand des Bentos laeuft die eingesetzte Ansicht nur, wenn
   NICHTS mehr hinter ihr kommt. In der Analitika stehen darunter noch die
   letzten Beitraege - dort zoege der negative Rand sie unter die Ansicht. */
.mnyra-dash__embed:last-child { margin-bottom: calc(-1 * var(--dash-bento-tail)); }
/* Die Faecher der Kennzahlen-Reihe (.mnyra-dash__kpi*) standen hier. Mit der
   Reihe selbst sind auch sie weg - die Analitika bringt ihre eigene Form mit. */
/* Auch die Beitragsliste ist ein Fach des Bentos. */
.mnyra-dash__posts {
  background: var(--dash-plane);
  /* Rand ausdruecklich gesetzt, weil die Kacheln <button> sind und der
     Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-bento-cell-radius);
  padding: 6px;
}
.mnyra-dash__post {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  min-height: 64px;
  /* Auf der ruhigen Flaeche des Fachs trennt die Haarlinie, nicht die
     Flaeche selbst - die haette dort keinen Kontrast mehr. */
  border-bottom: 1px solid var(--dash-hairline);
}
.mnyra-dash__post:last-child { border-bottom: none; }
.mnyra-dash__post-thumb {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--dash-plane);
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dash-muted);
}
.mnyra-dash__post-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.mnyra-dash__post-main { min-width: 0; flex: 1; }
.mnyra-dash__post-caption {
  font-size: 12px;
  font-weight: 700;
  color: var(--dash-ink);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mnyra-dash__post-meta {
  font-size: 10px;
  font-weight: 700;
  color: var(--dash-muted);
  margin: 4px 0 0;
  font-variant-numeric: tabular-nums;
}
.mnyra-dash__state {
  background: var(--dash-surface);
  /* Haarlinie wie im Profil - ausdruecklich gesetzt, weil die Kacheln
     <button> sind und der Browser sonst seinen eigenen Rahmen zeichnet. */
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 28px 18px;
  text-align: center;
}
.mnyra-dash__state-title { font-size: 14px; font-weight: 800; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__state-body { font-size: 12px; color: var(--dash-ink-2); margin: 0; line-height: 1.6; }
.mnyra-dash__retry {
  margin-top: 14px;
  border: none;
  background: var(--dash-ink);
  color: var(--dash-surface);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
}
/* Der Hinweis hinter den verschlossenen Karten. Bewusst schlicht gehalten -
   die Gestaltung kommt spaeter; was hier steht, ist nur der Weg dorthin. */
.mnyra-dash__paywall {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.55);
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}
.mnyra-dash__paywall-card {
  width: 100%;
  max-width: 320px;
  background: var(--dash-surface);
  border: 1px solid var(--dash-hairline);
  border-radius: var(--dash-card-radius);
  padding: 22px;
  text-align: center;
}
.mnyra-dash__paywall-title { font-size: 15px; font-weight: 900; color: var(--dash-ink); margin: 0 0 6px; }
.mnyra-dash__paywall-body { font-size: 12px; font-weight: 600; line-height: 1.6; color: var(--dash-ink-2); margin: 0 0 16px; }
/* Der Platzhalter beim Laden steht dort, wo gleich eine Karte steht - gleiche
   Rundung, damit beim Erscheinen nichts springt. */
.mnyra-dash__skeleton {
  border-radius: var(--dash-bento-cell-radius);
  background: var(--dash-plane);
  animation: mnyraDashPulse 1.4s ease-in-out infinite;
  border: 1px solid transparent;
}
@keyframes mnyraDashPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
`;function Ut(e=typeof document>"u"?null:document){if(!(!e||e.getElementById($e)))try{const t=e.createElement("style");t.id=$e,t.textContent=It,e.head?.appendChild(t)}catch{}}function v(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function P(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Ht=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Zt({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Ht.includes(a)?"hotel":"restaurant"}function Vt(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function Wt({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const i=Vt(a),o=v(e||"Business");return`
    <div class="mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${t?`<img src="${v(t)}" alt="${o}" title="${o}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${o}">${P(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${v(i.text)}</p>
    </div>
  `}function qt({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function Qt({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function Yt({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const Se=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function Jt(e="restaurant"){const t=String(e||"").trim().toLowerCase();return Se[t]||Se.restaurant}function Xt({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=Jt(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${v(n.accent)}</span> ${v(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${v(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${v(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const ea="/waiter?from=panel";function ta({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${ea}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${P(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${P(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function aa({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(i=>i&&i.key);if(!a.length)return"";const n=a.map((i,o)=>{const h=v(i.label||"");if(i.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const p=o<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let b="";i.imageUrl?b=`<img class="mnyra-dash__hl-media" src="${v(i.imageUrl)}" alt="" ${p} decoding="async" onerror="this.style.display='none'" />`:i.videoUrl&&(b=`<video class="mnyra-dash__hl-media" src="${v(i.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const y=`
      <span class="mnyra-dash__hl-plate">${P(t,i.iconName||"image","w-6 h-6")}</span>
      ${b}
    `,m=i.withEye?`<span class="mnyra-dash__hl-eye">${P(t,"eye","w-4 h-4")}</span>`:"";let u;i.locked?u=`<span class="mnyra-dash__hl-lock">${P(t,"lock","w-3 h-3")}Me pagesë</span>`:i.loading?u='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':i.emptyText?u=`<span class="mnyra-dash__hl-empty">${v(i.emptyText)}</span>`:u=`<span class="mnyra-dash__hl-value">${m}${v(i.value||"0")}</span>`;let f;i.locked?f=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${v(i.key)}"`:i.composer?f=`class="mnyra-dash__hl-card" data-dashboard-composer="${v(i.composer)}"`:f=`class="mnyra-dash__hl-card"${i.panelTab?` data-dashboard-panel-tab="${v(i.panelTab)}"`:""}`;const k=i.locked?`${h} – me pagesë`:`${h} ${i.emptyText||i.value||""}`.trim();return`
      <button type="button" ${f} data-dashboard-metric="${v(i.key)}" aria-label="${v(k)}">
        ${y}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${h}</span>
          ${u}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-dash__hl" data-dashboard-metrics="${v(na(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function na(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const Ne=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function ae(e=""){const t=String(e||"").trim().toLowerCase();return Ne.some(a=>a.id===t)?t:"funksionet"}function ra({activeTab:e="funksionet",iconFn:t}={}){const a=ae(e);return`<div class="mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${Ne.map(i=>{const o=i.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${v(i.id)}"
        aria-selected="${o?"true":"false"}"
        class="mnyra-dash__tab"
      >${P(t,i.iconName,"w-4 h-4")}<span class="mnyra-dash__tab-label">${v(i.label)}</span></button>
    `}).join("")}</div>`}function Ie(e=""){return`
    <div class="mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function ia({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(i=>{const o=[i.dateLabel,`${W(i.likesCount||0)} Likes`,`${W(i.commentsCount||0)} Kommentare`];return Number(i.impressions||0)>0&&o.push(`${W(i.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${i.thumbUrl?`<img src="${v(i.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:P(t,i.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${v(i.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${v(o.filter(Boolean).join(" · "))}</p>
          </div>
        </div>
      `}).join(""),n=`<div class="mnyra-dash__posts">${n}</div>`):n=`
      <div class="mnyra-dash__state" style="border:none;">
        <p class="mnyra-dash__state-title">Ende nuk ka postime</p>
        <p class="mnyra-dash__state-body">Posto foton ose videon tende te pare qe vizitoret te te zbulojne ne feed.</p>
        <button type="button" class="mnyra-dash__retry" data-nav="upload" data-upload-intent="chooser">Neuer Beitrag</button>
      </div>
    `,`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
        <button type="button" class="mnyra-dash__section-link" data-nav="profile">Profil öffnen</button>
      </div>
      ${n}
    </div>
  `}function sa(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function oa({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${v(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function da(){return'<div class="mnyra-dash__skeleton" style="min-height:44px; border-radius:14px; margin: 4px 0 16px;"></div>'}function la(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${da()}
    <div class="mnyra-dash__hl" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${Ie(`
      <div class="mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:38px; border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function ca({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${v(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ha(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const pa="menyra_social_dashboard_cache_v1::",ze="menyra_social_composer_products_v1::",De=2500,Pe=1200,ua=6,ma=3,ga=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),fa=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function j(e){const t=Number(e);return Number.isFinite(t)?t:0}function ba(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function ya(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",i=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),o=n==="video"?String(a.url||t.mediaUrl||"").trim():"",h=ba(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:i,videoUrl:o,likesCount:j(t.likesCount),commentsCount:j(t.commentsCount),impressions:0,dateLabel:h?h.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:h?h.getTime():0}}function _a({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],i=be(n),o=n.find(m=>String(m?.date||m?.id||"").trim()===String(t||"").trim()),h=be(o?[o]:[]),p=i.merged?.posts&&typeof i.merged.posts=="object"?i.merged.posts:{},b=(Array.isArray(a)?a:[]).map(m=>ya(m?.id,m?.data||{})).filter(m=>m.id).map(m=>({...m,impressions:j(p[m.id]?.impressions)})),y=b.slice().sort((m,u)=>u.createdAtMs-m.createdAtMs).slice(0,ma);return{day:String(t||"").trim(),week:i.summary,today:h.summary,posts:y,latestPost:xa(b)}}function xa(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>j(n.createdAtMs)-j(a.createdAtMs)||j(n.impressions)-j(a.impressions)||j(n.likesCount)-j(a.likesCount))[0]:null}function va({profile:e={},restaurant:t={}}={}){return ct({profile:e,restaurant:t,feature:"qr"})}function wa(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function ka({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const i=e?.today||{},o=!e,h=e?.latestPost||null,p=[];if(o)p.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!h)p.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const b=String(h.thumbUrl||"").trim();p.push({key:"latestPost",label:"Postimi fundit",value:W(j(h.impressions)),withEye:!0,imageUrl:b,videoUrl:b?"":String(h.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return p.push({key:"profileViews",label:"Vizitor n'profil",value:W(j(i.profileViews)),withEye:!0,loading:o,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),p.push({key:"menuOpens",label:"Vizitor n'meny",value:W(j(i.menuOpens)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),p.push({key:"qrScans",label:"Skanime n'tavolina",value:W(j(i.qrScans)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),p}function Ma({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:i={},composerApi:o={},viewApi:h={},iconFn:p,storageObj:b}={}){const y=a||(typeof document>"u"?null:document),m=y?.defaultView||(typeof window>"u"?null:window),u=typeof t=="function"?t:()=>{},f=b||(typeof localStorage>"u"?null:localStorage),k=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),z=typeof i.isShopCatalogProfileFn=="function"?i.isShopCatalogProfileFn:(()=>!1),K=typeof i.getRestaurantMetaByIdFn=="function"?i.getRestaurantMetaByIdFn:(()=>null),M=typeof i.resolveRestaurantLogoFn=="function"?i.resolveRestaurantLogoFn:(()=>""),$=typeof i.resolveOwnAvatarUrlFn=="function"?i.resolveOwnAvatarUrlFn:(()=>""),w=typeof h.renderAnalyticsViewFn=="function"?h.renderAnalyticsViewFn:(()=>""),R=typeof h.renderSettingsViewFn=="function"?h.renderSettingsViewFn:(()=>""),_=typeof h.warmAnalyticsFn=="function"?h.warmAnalyticsFn:(()=>{});let B=!1,E=0,Z=!1,O=null,L=null,N="",I=!1,ce=()=>null;const Ue=300;function ne(){const d=e?.userProfile||{};return Zt({businessType:k(d),isShopCatalog:z(d)})}function He(d=""){const l=K(d)||{};return zt(l).map(c=>({id:c.id,name:c.title,price:c.price??"",category:c.beds||c.tag||"",type:"room",imageUrl:c.imageUrl||""}))}function Ze(d=""){if(!f)return null;try{const l=f.getItem(`${ze}${d}`);if(!l)return null;const c=JSON.parse(l),g=Array.isArray(c?.items)?c.items:null;return g&&g.length?g:null}catch{return null}}function Ve(d="",l=[]){if(f)try{f.setItem(`${ze}${d}`,JSON.stringify({savedAt:Date.now(),items:l}))}catch{}}async function We(d=""){const{db:l,collectionFn:c,queryFn:g,limitFn:x,getDocsFn:S}=n;if(!l||typeof c!="function"||typeof S!="function")throw new Error("Produktet nuk u ngarkuan.");const U=c(l,"restaurants",d,"menuItems"),F=typeof g=="function"&&typeof x=="function"?g(U,x(Ue)):U,H=await S(F),D=[];return H.forEach(V=>{const J=ce(V?.id,V?.data?.()||{});J&&D.push(J)}),D.sort((V,J)=>V.name.localeCompare(J.name,"sq")),D}async function qe(d="",l){const c=String(d||"").trim();if(!c)throw new Error("Produktet nuk u ngarkuan.");if(ne()==="hotel")return He(c);const g=We(c).then(S=>(Ve(c,S),S)),x=Ze(c);return x?(typeof l=="function"?g.then(S=>l(S)).catch(()=>{}):g.catch(()=>{}),x):g}function he(){return O?Promise.resolve(O):(L||(L=ot(()=>import("./business-composer-controller-k1E-Nt79.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(d=>(ce=typeof d?.normalizeComposerProductCore=="function"?d.normalizeComposerProductCore:(()=>null),O=d.createBusinessComposerController({documentObj:y,windowObj:y?.defaultView||null,api:{getRestaurantIdFn:()=>Q(),getBusinessMetaFn:()=>{const l=Q();if(!l)return{name:"",logoUrl:"",city:""};const c=fe(l),g=K(l)||{};return{name:c.name,logoUrl:c.logoUrl,city:String(g.city||"").trim()}},loadProductsFn:(l,c)=>qe(l,c),getBusinessKindFn:()=>ne(),uploadImageFn:o.uploadImageFn,uploadVideoFn:o.uploadVideoFn,captureVideoPosterFn:o.captureVideoPosterFn,createPostFn:o.createPostFn,createStoryFn:o.createStoryFn,formatPriceFn:o.formatPriceFn,getOptimizedImageUrlFn:o.getOptimizedImageUrlFn,escapeHtmlFn:o.escapeHtmlFn,iconFn:typeof p=="function"?p:void 0,afterPublishFn:async l=>{try{await Y({force:!0})}catch{}typeof o.afterPublishFn=="function"&&await o.afterPublishFn(l)}}}),O)).catch(d=>{throw L=null,console.error("[mnyra][dashboard] composer load failed",d),d})),L)}function pe(){const d=m?.navigator?.connection;return!d||typeof d!="object"?!1:d.saveData===!0?!0:/(^|-)2g$/.test(String(d.effectiveType||"").trim().toLowerCase())}function Qe(){if(I||O||!m||pe())return;I=!0;const d=()=>{if(he().catch(()=>{}),typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}};if(typeof m.requestIdleCallback=="function"){m.requestIdleCallback(d,{timeout:De});return}m.setTimeout?.(d,Pe)}function Ye(){if(B||!m||pe())return;B=!0;const d=()=>{try{_()}catch{}};if(typeof m.requestIdleCallback=="function"){m.requestIdleCallback(d,{timeout:De});return}m.setTimeout?.(d,Pe)}function Je(d="post"){const l=String(d||"").trim().toLowerCase(),c=l==="story"||l==="profile"?l:"post";if(typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}if(O){O.open(c);return}N=c,he().then(g=>{const x=N||c;N="",g?.open?.(x)}).catch(()=>{N=""})}function re(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function ue(d=""){const l=re(),c=String(d||"").trim();return String(l.restaurantId||"")===c||(l.restaurantId=c,l.model=null,l.status="idle",l.error="",l.loadedSignature="",l.paywall="",E+=1),l}function Q(){const d=e?.userProfile||{};return String(d.restaurantId||d.staffRestaurantId||"").trim()}let me="";function Xe(){const d=String(e?.user?.uid||"").trim();!d||me===d||typeof i.ensureBusinessProfileFn=="function"&&(me=d,Promise.resolve().then(()=>i.ensureBusinessProfileFn()).catch(l=>{console.warn("[mnyra][panel] business profile could not be resolved",l)}).finally(()=>{String(e?.user?.uid||"").trim()===d&&u()}))}function et(){const d=String(e?.user?.uid||"").trim();if(!d)return!1;const l=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||l===d}function ge(d=""){return`${pa}${d}`}function tt(d="",l=""){if(!f||!d)return null;try{const c=f.getItem(ge(d));if(!c)return null;const g=JSON.parse(c);return!g||typeof g!="object"||String(g.day||"").trim()!==String(l||"").trim()||!g.model||typeof g.model!="object"?null:g.model}catch{return null}}function at(d="",l=null){if(!(!f||!d||!l))try{f.setItem(ge(d),JSON.stringify({day:l.day,model:l}))}catch{}}async function nt(d=""){const{db:l,collectionFn:c,queryFn:g,orderByFn:x,limitFn:S,getDocsFn:U}=n;if(!l||typeof c!="function"||typeof g!="function"||typeof x!="function"||typeof S!="function"||typeof U!="function")return[];const F=c(l,"restaurants",d,"socialPosts");return(await U(g(F,x("createdAt","desc"),S(ua)))).docs.map(D=>({id:D.id,data:D.data()||{}})).filter(D=>{const V=String(D.data.status||"active").trim().toLowerCase();return V!=="deleted"&&V!=="hidden"})}async function Y({force:d=!1}={}){const l=Q(),c=ue(l);if(!l)return;const g=dt({rangeKey:"7d"});if(!g)return;const x=`${l}::${g.toDay}`;if(!d&&c.loadedSignature===x&&c.status==="ready")return;if(!c.model){const F=tt(l,g.toDay);F&&(c.model=F,c.status="ready",u())}E+=1;const S=E;c.model||(c.status="loading",c.error="",u());try{const F={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:l},[H,D]=await Promise.allSettled([lt({...F,fromDay:g.fromDay,toDay:g.toDay}),nt(l)]);if(S!==E)return;if(H.status==="rejected")throw H.reason;D.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",D.reason),c.model=_a({days:H.value,todayKey:g.toDay,rawPosts:D.status==="fulfilled"?D.value:[]}),c.status="ready",c.error="",c.loadedSignature=x,at(l,c.model)}catch(F){if(S!==E)return;console.error("[mnyra][dashboard] load failed",F),c.model||(c.status="error",c.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}u()}function rt(){Z||!y||(Z=!0,y.addEventListener("click",d=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(d.target?.closest?.("[data-dashboard-retry]")){Y({force:!0});return}if(d.target?.closest?.("[data-dashboard-paywall-close]")){d.preventDefault(),re().paywall="",u();return}const l=d.target?.closest?.("[data-dashboard-metric-locked]");if(l){d.preventDefault(),re().paywall=String(l.getAttribute("data-dashboard-metric-locked")||"").trim(),u();return}const c=d.target?.closest?.("[data-dashboard-composer]");if(c){d.preventDefault(),Je(c.getAttribute("data-dashboard-composer"));return}const g=d.target?.closest?.("[data-dashboard-panel-tab]");if(g){d.preventDefault();const x=ae(g.getAttribute("data-dashboard-panel-tab"));if(x===ae(e?.dashboardPanelTab))return;e.dashboardPanelTab=x,u()}}catch{}}))}function fe(d=""){const l=e?.userProfile||{},c=d?K(d)||{}:{},g=String(c.name||c.restaurantName||l.name||"").trim()||"Business";let x="";try{x=String($()||"").trim()}catch{}if(!x)try{x=String(M(c)||"").trim()}catch{}return{name:g,logoUrl:x,kind:ne(),coverUrl:wa(c),subscribed:va({profile:l,restaurant:c})}}function it(d=""){try{if(!bt()||!d)return"";yt({restaurantId:d,onBadgeFn:()=>u()});const l=_t();return Bt({enabled:!0,unseenCount:l.unseen,activeOffers:l.activeOffers||0,todayBookings:l.today,iconFn:p})}catch{return""}}function st(){Ut(y),rt();const d=Q(),l=ue(d);let c="";if(!d)Xe(),c=et()?la():ha();else{Qe(),Ye();const g=fe(d),x=ae(e?.dashboardPanelTab);l.status==="idle"&&(l.status="loading",queueMicrotask(()=>{Y({force:!1})}));let S="";l.model?S=ia({posts:l.model.posts,iconFn:p}):l.status==="error"?S=ca({message:l.error}):S=sa();const U=`
        ${it(d)}
        ${qt({iconFn:p})}
        ${ta({iconFn:p,showEditor:!!d})}
        ${Qt({iconFn:p,showEditor:!!d})}
        ${Yt({iconFn:p,showEditor:!!d})}
        ${Xt({iconFn:p,kind:g.kind,showEditor:!!d})}
      `;let F;x==="analitika"?F=`
          <div class="mnyra-dash__embed">${w()}</div>
          ${S}
        `:x==="opsionet"?F=`<div class="mnyra-dash__embed">${R()}</div>`:F=U;const H=ka({model:l.model,coverUrl:g.coverUrl,subscribed:g.subscribed,assets:ga}),D=String(l.paywall||"").trim();c=`
        ${Wt({name:g.name,logoUrl:g.logoUrl,iconFn:p})}
        ${aa({cards:H,iconFn:p})}
        ${Ie(`
          ${ra({activeTab:x,iconFn:p})}
          ${F}
        `)}
        ${D?oa({title:fa[D]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-dash" data-dashboard-root>
        ${c}
      </section>
    `}return Object.freeze({renderDashboardView:st,loadDashboard:Y})}export{Te as G,vt as M,Ma as a,ja as b,wt as c,Aa as d,Ba as e,Ot as f,Nt as g,X as h,le as i,de as j,Ge as k,zt as l,Pa as m,St as n,Fa as o,Ka as r};
