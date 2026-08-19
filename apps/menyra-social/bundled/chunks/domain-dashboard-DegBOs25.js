const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-C_XEO2Iu.js","chunks/domain-feed-social-eager-slXGAphf.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-OuotVj3Q.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as pt}from"./domain-auth-B1kS5TG-.js";import{f as W,r as ut,l as mt,s as _e}from"./domain-analytics-i6lAJYIg.js";import{b as gt}from"./domain-business-accounts-D8NpUhi6.js";import{n as le,G as ke,a as we,v as ft,c as Ee,d as Fe,e as Me,f as je,g as bt,h as yt,i as Ce,j as Oe,k as Te,l as _t,m as kt,o as ve,p as wt,q as vt,s as xt,u as $t}from"./domain-feed-social-eager-slXGAphf.js";const St=20,zt=8;function C(e=""){return e==null?"":String(e).trim()}function oe(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function Pt(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function Dt(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],C(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(i=>{const o=C(i);o&&!n.includes(o)&&n.push(o)}),n.slice(0,zt)}function At(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=oe(a.persons??a.guests??a.capacity),i=oe(a.size??a.sizeSqm??a.area),o=Dt(a);return{id:C(a.id)||Pt(Date.now()+t),title:C(a.title??a.name),description:C(a.description??a.text).slice(0,400),imageUrl:o[0]||"",images:o,price:oe(a.price??a.pricePerNight),currency:C(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:C(a.beds??a.bedsLabel).slice(0,60),size:i==null?null:Math.min(500,Math.round(i)),tag:C(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Rt(e=[]){return(Array.isArray(e)?e:[]).slice(0,St).map((t,a)=>At(t,{index:a}))}function Kt(e={}){return Rt((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function Fa(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),C(e?.beds)&&t.push({icon:"bed",label:C(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ma(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=C(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const Ge=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),Bt=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function xe(e={}){return Object.entries(e).map(([t,a])=>` ${t}="${a}"`).join("")}Object.freeze(Object.keys(Ge));function ee(e="",t=""){const a=Ge[String(e||"").trim()];if(!a)return"";const n=a.map(([o,p])=>`<${o}${xe(p)}></${o}>`).join(""),i=String(t||"").trim();return`<svg${xe(Bt)}${i?` class="${i}"`:""}>${n}</svg>`}const $e=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),Ne="clean",ce="hero",he="compact",Et=[Ne,ce,he];function Ft({imageUrl:e="",variant:t=""}={}){if(!String(e||"").trim())return Ne;const a=String(t||"").trim().toLowerCase();return Et.includes(a)?a:ce}const Le=`
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
`;function K(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Ie({businessName:e="",logoUrl:t="",imageUrl:a="",variant:n="",benefitLabel:i="",benefitView:o=null,sponsored:p=!1,meta:c=[],ctaLabel:b="",ctaIcon:y="check-check",ctaDisabled:_=!1,cardAttrs:g="",ctaAttrs:u="",texts:v=$e}={}){const z={...$e,...v||{}},B=(Array.isArray(c)?c:[]).filter(I=>I&&I.label),j=String(b||z.accept),x=o&&typeof o=="object"?o:{},E=String(x.headline||i||""),S=String(x.priceGo||""),m=String(x.priceRegular||""),P=String(a||"").trim(),O=Ft({imageUrl:P,variant:n}),Z=O===he,T=P?`<img class="mnyra-go-page__card-photo" src="${K(P)}" alt="" loading="lazy" decoding="async" />`:"",N=`
    <div class="mnyra-go-page__card-head">
      ${t?`<img class="mnyra-go-page__card-logo" src="${K(t)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${ee("store")}</div>`}
      <div class="mnyra-go-page__card-names">
        <p class="mnyra-go-page__card-who">${K(e)} <span>${K(z.offering)}</span></p>
        ${p?`<p class="mnyra-go-page__card-sponsored">${K(z.sponsored)}</p>`:""}
      </div>
    </div>

    ${x.eyebrow?`<p class="mnyra-go-page__card-eyebrow">${K(x.eyebrow)}</p>`:""}
    <p class="mnyra-go-page__card-benefit${S?" mnyra-go-page__card-benefit--title":""}">${K(E)}</p>
    ${x.note?`<p class="mnyra-go-page__card-note">${K(x.note)}</p>`:""}
    ${S?`
      <div class="mnyra-go-page__card-prices">
        ${m?`<span class="mnyra-go-page__card-price-was">${K(m)}</span>`:""}
        <span class="mnyra-go-page__card-price-go">${K(S)}</span>
      </div>
    `:""}
    ${x.savingLabel?`<p class="mnyra-go-page__card-saving">${K(x.savingLabel)}</p>`:""}
    ${Z?"":`<p class="mnyra-go-page__card-for">${K(z.forGroup)}</p>`}
  `,L=`
    <div class="mnyra-go-page__card-meta">
      ${B.map(I=>`<span>${ee(I.icon||"")}${K(I.label)}</span>`).join("")}
    </div>

    <p class="mnyra-go-page__card-only">${ee("ticket-percent")}${K(z.onlyGo)}</p>

    <button
      type="button"
      class="mnyra-go-page__cta"
      ${u}
      ${_?"disabled":""}
    >${y?ee(y):""}${K(j)}</button>
  `;return Z?`
      <article class="mnyra-go-page__card mnyra-go-page__card--compact"${g?` ${g}`:""}>
        <div class="mnyra-go-page__card-top">
          ${T}
          <div>${N}</div>
        </div>
        ${L}
      </article>
    `:O===ce?`
      <article class="mnyra-go-page__card mnyra-go-page__card--hero"${g?` ${g}`:""}>
        ${T}
        <div class="mnyra-go-page__card-body">
          ${N}
          ${L}
        </div>
      </article>
    `:`
    <article class="mnyra-go-page__card"${g?` ${g}`:""}>
      ${N}
      ${L}
    </article>
  `}function Ue(e=0){const t=Math.max(0,Math.trunc(Number(e)||0)),a=Math.trunc(t/100),n=String(t%100).padStart(2,"0");return`${a},${n} €`}const Se="mnyraWorkSurfaceStyles",He=`
/* Die Wurzel beider Arbeitsseiten. Sie traegt die Marken und das
   Seitenpolster - alles andere rechnet daraus.

   Das Seitenpolster ist --app-content-inline (1.5rem), das Mass, mit dem in
   dieser App ueberall Inhalt vom Rand absteht. Es steht hier als eigene Marke
   und nicht direkt als var(--app-content-inline), damit die beiden Seiten an
   EINER Stelle verschoben werden koennen, ohne die halbe App mitzunehmen. */
.mnyra-work {
  --work-inline: 1.5rem;
  /* Der Rhythmus von oben nach unten. Er ist bewusst luftiger als vorher:
     die Seiten standen zu eng unter der Kopfzeile und die Karten klebten an
     der Ueberschrift.
       --work-head-top    globale Kopfzeile -> Titelzeile
       --work-head-gap    Titel/Unterzeile  -> Karten-Reihe
       --work-cards-gap   Ende der Karten   -> Anfang des Benkos
     Dazu kommt oben noch das Polster von <main> (--smart-header-content-gap,
     1.2rem), das beide Seiten gleichermassen bekommen. */
  --work-head-top: 32px;
  --work-head-gap: 36px;
  --work-head-min-height: 44px;
  --work-cards-gap: 80px;
  /* Das Benko: oben gerundet, bis an beide Seitenraender, nach unten laeuft
     es mit der Seite weiter. Der Auslauf ist sein eigenes unteres Polster -
     den Abschluss der Seite macht der Fuss der App dahinter. */
  --work-bento-radius: 40px;
  --work-bento-pad-top: 22px;
  --work-bento-tail: 112px;
  /* Die Pillen-Leiste waehlt aus, was unter ihr steht - sie ist nicht selbst
     Teil davon. Deshalb haelt das erste Stueck darunter deutlich mehr Abstand
     als zwei Karten untereinander. */
  --work-bento-lead: 44px;
  /* Die Pille. Eine Fingerhoehe, ganz rund, weisse Flaeche mit ruhigem Rand -
     gewaehlt traegt sie das Violett der Marke. */
  --work-pill-gap: 8px;
  --work-pill-height: 44px;
  --work-pill-inline: 10px;
  --work-pill-icon-gap: 6px;
  --work-pill-icon: 14px;
  --work-pill-font: 11px;
  --work-pill-surface: #ffffff;
  --work-pill-border: #e2e8f0;
  --work-pill-ink: #0f172a;
  --work-pill-active: #4f46e5;
  --work-pill-active-ink: #ffffff;
  padding: var(--work-head-top) var(--work-inline) 0;
}
.mnyra-work * { box-sizing: border-box; }
/* Die Titelzeile. Links der Name, rechts - wenn die Seite einen hat - ihr
   Handgriff. Beide Seiten setzen dieselbe Mindesthoehe und denselben Abstand
   nach unten, damit die Karten darunter auf derselben Linie anfangen. */
.mnyra-work__head {
  min-height: var(--work-head-min-height);
  margin: 0 0 var(--work-head-gap);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Eine Titelzeile MIT Handgriff rechts ist eine Reihe und kein Stapel: der
   Knopf nimmt seine Hoehe aus dem Textblock daneben (align-items: stretch),
   seine Breite folgt der Hoehe. */
.mnyra-work__head--row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 12px;
}
/* Die Karten-Reihe. Sie laeuft bis an beide Bildschirmraender, faengt links
   aber genau dort an, wo auch alles andere auf der Seite anfaengt: die
   negative Marge ist das Seitenpolster, das Polster darin schiebt die erste
   Karte wieder in die Flucht. */
.mnyra-work__cards {
  margin: 0 calc(-1 * var(--work-inline)) 0;
  padding: 0 var(--work-inline);
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-padding-left: var(--work-inline);
  overscroll-behavior-x: contain;
  /* Wie in der Spots-Reihe im Feed: der Browser entscheidet an der ersten
     Fingerbewegung, ob die Reihe waagerecht laeuft oder die Seite senkrecht
     scrollt. "pan-x" wuerde das senkrechte Scrollen auf der Reihe
     verschlucken. */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mnyra-work__cards::-webkit-scrollbar { display: none; }
/* Das Benko unter der Reihe. */
.mnyra-work__bento {
  margin: var(--work-cards-gap) calc(-1 * var(--work-inline)) 0;
  padding: var(--work-bento-pad-top) var(--work-inline) var(--work-bento-tail);
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  border-radius: var(--work-bento-radius) var(--work-bento-radius) 0 0;
  /* Dieselbe weiche Kante wie unter dem Header, nur nach oben gedreht. */
  box-shadow: 0 -16px 32px -20px rgb(15 23 42 / 0.16);
}
/* Die Pillen-Reihe: drei gleich breite Pillen, sonst nichts - kein Grund,
   kein Rahmen, kein Polster um sie herum. Ein Kasten darum schoebe sie um
   seine Polsterbreite nach innen und damit aus der Flucht der Karten. */
.mnyra-work__pills {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--work-pill-gap);
  min-width: 0;
}
/* Symbol und Wort stehen in EINER Zeile und auf EINER Grundlinie: beide sind
   Flex-Kinder mit gleicher Ausrichtung, das Symbol in fester Groesse.
   Die Fingerhoehe steht als Mindestmass und nicht als Polsterung - damit sind
   alle Pillen gleich hoch, auch die, deren Wort kuerzer ist. */
.mnyra-work__pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--work-pill-icon-gap);
  min-width: 0;
  min-height: var(--work-pill-height);
  padding: 0 var(--work-pill-inline);
  border: 1px solid var(--work-pill-border);
  border-radius: 999px;
  background: var(--work-pill-surface);
  font: inherit;
  font-size: var(--work-pill-font);
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--work-pill-ink);
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier.
   "block" nimmt ihnen die Grundlinien-Luecke, die ein Inline-Element unter
   sich laesst - sonst saesse das Wort daneben minimal zu hoch. */
.mnyra-work__pill svg,
.mnyra-work__pill i {
  width: var(--work-pill-icon);
  height: var(--work-pill-icon);
  flex: 0 0 auto;
  display: block;
}
.mnyra-work__pill-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die gewaehlte Pille traegt das Violett der Marke. Nur die Farbe: sie wird
   nicht groesser und nicht fetter, sonst rueckten die zwei daneben bei jedem
   Antippen. */
.mnyra-work__pill[aria-selected="true"] {
  background: var(--work-pill-active);
  border-color: var(--work-pill-active);
  color: var(--work-pill-active-ink);
  box-shadow: 0 1px 2px 0 rgb(79 70 229 / 0.24);
}
.mnyra-work__pill:active { transform: scale(0.98); }
/* Ein Knopf, der in derselben Reihe steht, aber nichts auswaehlt (der Pfeil
   in GO): dieselbe Form, dieselbe Fingerhoehe, dieselbe Kapsel - nur das
   Zeichen darin traegt das Violett. */
.mnyra-work__pill-turn {
  aspect-ratio: 1 / 1;
  min-height: var(--work-pill-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--work-pill-border);
  border-radius: 999px;
  background: var(--work-pill-surface);
  color: var(--work-pill-active);
  padding: 0;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.mnyra-work__pill-turn:active { transform: scale(0.95); }
.mnyra-work__pill-turn svg,
.mnyra-work__pill-turn i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* Auf einem schmaleren Telefon rueckt alles etwas enger zusammen, damit auch
   das laengste Wort ganz dasteht. Gemessen: "Statistikat" braucht 54 Punkte,
   und ab hier bekaeme es nur noch 49 - eine Pille weniger Polsterung und ein
   Punkt weniger Schrift geben genau die fehlenden. */
@media (max-width: 413px) {
  .mnyra-work {
    --work-pill-gap: 6px;
    --work-pill-inline: 6px;
    --work-pill-icon-gap: 4px;
    --work-pill-font: 10px;
  }
}
/* Und auf den schmalsten bleibt nur das Symbol.

   Bei 320 Punkten ist eine Pille 68 breit; nach Symbol, Polster und Rand
   blieben 38 fuer ein Wort, das 49 braucht. Ein gekuerztes "Statisti..." sagt
   weniger als das Zeichen daneben - und die Pille traegt ihren Namen ohnehin
   im aria-label und im title, also geht dem, der ihn braucht, nichts
   verloren. Umgebrochen wird nie, und alle drei bleiben gleich breit. */
@media (max-width: 359px) {
  .mnyra-work {
    --work-pill-inline: 0px;
    --work-pill-icon-gap: 0px;
  }
  .mnyra-work__pill-label { display: none; }
}
`;function Mt(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(Se)))try{const t=e.createElement("style");t.id=Se,t.textContent=He,e.head?.appendChild(t)}catch{}}const r=Object.freeze({brand:"Mnyra GO",mark:"⚡",brandMnyra:"MNYRA",brandGo:"GO",createOfferAction:"Krijo ofertë",groupNext:"Menaxhimi",groupBack:"Puna e ditës",soonStats:"Këtu do të shohësh se si ecën GO për ty me kalimin e kohës.",soonPayments:"Këtu do të shohësh faturat dhe pagesat e tua për MNYRA GO.",soonHint:"Së shpejti",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{pending:"Në pritje",active:"Aktivizo",finalized:"Finalizuar",stats:"Statistikat",payments:"Pagesat",offers:"Ofertat",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",editorHint:"Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen.",today:"Sot",current:"Aktuale",kpiViewsTitle:"Shikime të ofertave",kpiViewsNote:"Sa persona i kanë parë ofertat e tua.",kpiChosenTitle:"Oferta të zgjedhura",kpiChosenNote:"Sa herë klientët kanë zgjedhur ofertën tënde.",kpiVisitsTitle:"Vizita të realizuara",kpiVisitsNote:"Oferta të përdorura dhe verifikuara në lokal.",kpiGuestsTitle:"Klientë të sjellë",kpiGuestsNote:"Sa persona kanë ardhur përmes MNYRA GO.",kpiDueTitle:"Për pagesë",kpiDueNote:"Shuma aktuale për MNYRA GO.",kpiDueClear:"Asgjë për pagesë.",kpiPending:"Po ngarkohet",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",finalizeTitle:"Finalizo ofertën",benefitQuestion:"Çka po ofron?",benefitHint:"Zgjidh çfarë dëshiron t'i ofrosh klientit.",benefitPercent:"Zbritje %",benefitBundle:"Paketë GO",benefitFree:"Falas",benefitSpecial:"Çmim special",benefitLegacy:"Zgjidh llojin e ofertës.",discountQuestion:"Sa zbritje po ofron?",discountOther:"Tjetër",discountPlaceholder:"Shkruaj zbritjen",scopeQuestion:"Ku vlen zbritja?",scopeAll:"Krejt fatura",scopeFood:"Ushqim",scopeDrinks:"Pije",bundleQuestion:"Çka përfshin paketa?",bundlePlaceholder:"p.sh. 2 Burger + 2 Pije",freeQuestion:"Çka merr falas?",freePlaceholder:"p.sh. 1 Pije",conditionQuestion:"Kur e merr falas?",conditionFood:"Me ushqim",conditionDrink:"Me pije",conditionAny:"Me çdo porosi",conditionCustom:"Tjetër",customConditionQuestion:"Shkruaj kushtin",customConditionPlaceholder:"p.sh. kur porosit 2 pizza",productQuestion:"Cili produkt?",productPlaceholder:"p.sh. Pizza Margherita",priceRegular:"Çmimi normal",priceGo:"Çmimi GO",pricePlaceholder:"0,00",saving:"Kursen",photoQuestion:"Foto e ofertës",photoHint:"Shto një foto që klienti ta shohë ofertën menjëherë.",photoOptional:"Opsionale",photoAdd:"Shto një foto",photoSource:"Nga telefoni ose kamera",photoChange:"Ndrysho",photoRemove:"Hiq",photoUploading:"Po ngarkohet...",photoError:"Fotoja nuk u ngarkua. Provo prapë.",partyQuestion:"Për sa persona vlen?",partyHint:"Zgjidh për çfarë madhësie të grupit vlen oferta.",partyAll:"Të gjithë",categoryQuestion:"Kur të shfaqet oferta?",categoryHint:"Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit.",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet kafe / pije",scheduleQuestion:"Kur vlen oferta?",scheduleHint:"Zgjidh kur klientët mund ta përdorin ofertën.",always:"Gjithmonë",specificHours:"Orar specifik",daysQuestion:"Ditët",hoursQuestion:"Orari",hoursFrom:"Nga",hoursTo:"Deri",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",around:"Rreth",finalize:"Finalizo",needsActivation:"Klienti duhet ta aktivizojë ofertën.",search:"Kërko",searching:"Po kërkoj...",codePlaceholder:"Kodi i klientit",codeNotFound:"Ky kod nuk u gjet.",partyAtTable:"Sa persona janë",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function s(e,t=""){return typeof e=="function"?e(t):String(t??"")}function M(e,t="",a="w-4 h-4"){return typeof e=="function"?e(t,a):""}function Ze(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function jt({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,iconFn:i=null,texts:o={}}={}){if(!e)return"";const p={...r,...o||{}},c=Math.max(0,Math.trunc(Number(t)||0)),b=a>0||n>0,y=b?`${a} oferta aktive · ${n} rezervime sot`:p.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${c>0?`<span class="mnyra-dash__composer-badge" aria-label="${c} ${p.statNew}">${c}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${y}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${M(i,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${b?p.cardManage:p.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${M(i,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const Ct=`
/* Die Karten-Reihe unter der Kopfzeile: vier Zahlen des Tages und daneben die
   Rechnung.

   Ihre Machart - waagerecht bis an beide Bildschirmraender, die erste Karte in
   der Flucht der Seite - steht als .mnyra-work__cards in der gemeinsamen
   Geometrie der Arbeitsseiten; die Reihe traegt beide Klassen und ist damit
   dieselbe Reihe wie im Paneli. Fuenf Karten passen auf keinem Telefon
   nebeneinander, ohne dass jede zur Briefmarke wird; sie werden deshalb
   gewischt statt gequetscht. */
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+ das Seitenpolster), abzueglich der
   beiden Luecken zwischen den drei angeschnittenen Karten. Eine Karte, die
   halb angeschnitten am Rand steht, ist der einzige Hinweis, dass die Reihe
   weitergeht. */
.go-kpi__card {
  flex: 0 0 calc((100% + var(--work-inline) - 20px) / 2.5);
  display: flex;
  flex-direction: column;
  min-width: 0;
  /* Feste Hoehe, damit alle Karten auf einer Linie stehen: Der Titel ist
     zweizeilig, die Beschreibung vierzeilig - eine Karte, die sich nach ihrem
     Text richtet, macht aus der Reihe eine Treppe.

     Das Mass ist der laengste Satz auf dem schmalsten Telefon: "Oferta te
     perdorura dhe verifikuara ne lokal." braucht auf 320px vier Zeilen. Eine
     Karte, die auf 390px passt und auf 320px den letzten Satz abschneidet,
     passt nicht. */
  height: 210px;
  padding: 14px;
  border: 1px solid transparent;
  /* Dasselbe Mass wie an den Karten davor. */
  border-radius: 20px;
  background: #4f46e5;
  text-align: left;
  scroll-snap-align: start;
  overflow: hidden;
}
/* Oben: das Wort fuer den Zeitraum links, das Symbol rechts. Beide klein -
   die Karte gehoert der Zahl, nicht ihrem Rahmen. Das Symbol steht ohne
   Flaeche darunter: Ein Kreis oder Kasten um ein 16px-Symbol nimmt mehr Platz
   als das Symbol selbst und sagt nichts dazu. */
.go-kpi__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.go-kpi__period {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  color: rgb(255 255 255 / 0.62);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.go-kpi__icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}
/* Die Symbole kommen ohne den Tailwind-Build aus: ihre Groesse steht hier -
   wie in der Tab-Leiste. */
.go-kpi__icon svg,
.go-kpi__icon i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* Die Zahl. Sie steht mit Abstand nach oben und traegt die Karte. */
.go-kpi__value {
  margin: 14px 0 0;
  /* Eine Zeile hoch, ob darin eine Zahl steht oder der Balken, der auf sie
     wartet. Ohne dieses Mass ergaebe die Summe aus Balkenhoehe und Raendern
     nur FAST eine Zeile (27,98 statt 28,00 Punkte gemessen) - und die
     Karte darunter ruckte um diesen Bruchteil. */
  min-height: 1em;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Das Skelett steht GENAU dort, wo gleich die Zahl steht - und genau so hoch.
   Es ist ein Block im selben Absatz: Der Absatz misst damit seine
   Zeilenhoehe (1em) mit dem Balken genauso wie spaeter mit der Zahl, und
   beim Wechsel rueckt nichts. Eine Hoehe in Pixeln stuende hier falsch,
   sobald die Zahl auf einem breiten Bildschirm groesser wird.

   Nur die Zahl fehlt. "Sot", das Symbol, der Titel, die Beschreibung und die
   Farbe der Karte stehen von der ersten Zeichnung an da - ein Skelett der
   ganzen Karte verspraeche, dass gleich etwas ANDERES kommt, und es kommt
   nur eine Zahl. */
.go-kpi__skeleton {
  display: block;
  /* Etwas niedriger als die Zeile, mittig darin: Ein Balken auf voller
     Zeilenhoehe ist ein Kasten, ein Balken auf zwei Dritteln ist ein Strich,
     der auf eine Zahl wartet. Die fehlende Hoehe steht als Rand darum, damit
     der Absatz trotzdem genau so hoch bleibt wie mit der Zahl. */
  height: 0.62em;
  margin: 0.19em 0;
  /* Etwa so breit wie zwei Ziffern. Die Einheit ch ist die Breite der Null in
     genau dieser Schrift - der Balken waechst also mit der Zahl mit, statt
     neben ihr zu raten. */
  width: 2.4ch;
  /* Ganz rund, wie die Reiter darunter: Ein Rechteck mit weichen Ecken ist
     eine Flaeche, die etwas verdeckt; eine Kapsel ist ein Platzhalter. */
  border-radius: 999px;
  background: currentColor;
  opacity: 0.22;
  /* Langsam und mit kleinem Hub. Ein Puls, der auffaellt, laesst die Karte
     unfertig aussehen; einer, den man erst beim Hinsehen bemerkt, sagt nur:
     hier kommt gleich etwas. */
  animation: go-kpi-pulse 2s ease-in-out infinite;
}
/* Die Rechnung traegt keine Ziffernfolge, sondern einen Betrag: "4,50 €" ist
   gut doppelt so breit wie "42". */
.go-kpi__skeleton--wide { width: 5.2ch; }
@keyframes go-kpi-pulse {
  0%, 100% { opacity: 0.22; }
  50% { opacity: 0.1; }
}
/* Wer Bewegung abbestellt hat, bekommt den Balken ruhig - sichtbar bleibt er,
   sonst waere an der Stelle wieder nichts. */
@media (prefers-reduced-motion: reduce) {
  .go-kpi__skeleton { animation: none; }
}
.go-kpi__title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: #ffffff;
  overflow: hidden;
}
/* Die Beschreibung sitzt unten an der Karte, egal wie kurz der Titel darueber
   ist: "margin-top: auto" schiebt sie an den Fuss, und damit stehen die
   Beschreibungen aller Karten auf derselben Hoehe. */
.go-kpi__note {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin: 8px 0 0;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.35;
  color: rgb(255 255 255 / 0.72);
  overflow: hidden;
}
/* Die fuenfte Karte ist keine Kennzahl, sondern eine Rechnung. Sie steht
   deshalb abgesetzt: helle Flaeche statt voller Farbe, ein Rand im Violett der
   Marke, und eine Luecke davor, die groesser ist als die zwischen den vier
   davor.

   Sie war einmal creme mit Bernstein. Das las sich wie eine Warnung aus einem
   anderen Programm - und ein offener Betrag ist keine Warnung: Er entsteht,
   weil GO funktioniert hat und Gaeste gekommen sind. Jetzt traegt sie
   dasselbe Violett wie die vier davor, nur andersherum: dort die Farbe als
   Flaeche und weisse Schrift, hier die Farbe als Rand und Akzent auf hellem
   Lavendel. Verwandt und trotzdem auf den ersten Blick eine andere Art von
   Karte. Rot bleibt draussen, Orange auch. */
.go-kpi__card--due {
  margin-left: 8px;
  background: #f5f3ff;
  border-color: #c7d2fe;
}
.go-kpi__card--due .go-kpi__period { color: #4f46e5; }
.go-kpi__card--due .go-kpi__icon { color: #4f46e5; }
/* Der Betrag im tiefsten Ton der Marke - dieselbe Farbe, die auf den vier
   Karten davor die Zahl traegt, nur hier auf hellem Grund. */
.go-kpi__card--due .go-kpi__value { color: #1e1b4b; }
.go-kpi__card--due .go-kpi__title { color: #312e81; }
.go-kpi__card--due .go-kpi__note { color: #64748b; }
/* Und ist nichts offen, ist das eine gute Nachricht und sieht auch so aus. */
.go-kpi__card--clear {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.go-kpi__card--clear .go-kpi__period { color: #15803d; }
.go-kpi__card--clear .go-kpi__icon { color: #16a34a; }
.go-kpi__card--clear .go-kpi__value { color: #14532d; }
.go-kpi__card--clear .go-kpi__title { color: #166534; }
.go-kpi__card--clear .go-kpi__note { color: rgb(20 83 45 / 0.72); }
/* Der Auslauf hinter der letzten Karte, damit sie beim Scrollen nicht am
   Bildschirmrand klebt. */
.go-kpi__tail { flex: 0 0 18px; }
/* Hier stand ein Raster fuer breite Bildschirme: ab 768px wurden aus der
   Wischreihe fuenf Spalten. Es ist weg, und zwar aus zwei Gruenden.

   Erstens misst die Regel die BREITE DES FENSTERS, nicht die des Inhalts: Die
   Huelle der App ist ueberall hoechstens 28rem breit (max-w-md), also
   quetschte das Raster auf einem Schreibtisch-Bildschirm fuenf Karten in
   dieselben 448 Punkte, in denen auf dem Telefon zweieinhalb stehen.

   Zweitens macht das Paneli es nicht: dort bleibt die Reihe auf jeder Breite
   eine Reihe. Genau solche Einzelfaelle liessen die beiden Seiten beim
   Wechsel auseinanderlaufen - und an der Schwelle sprang das Layout. Mobil
   und Desktop bekommen jetzt auf beiden Seiten dieselbe Reihe. */
/* Das Bento traegt alles unter der Karten-Reihe: die Pillen-Leiste und
   darunter die Liste, die sie gewaehlt hat. Es ist WOERTLICH dieselbe Flaeche
   wie im Paneli: Abstand nach oben, Seitenpolster, Rundung, Auslauf und Kante
   stehen als .mnyra-work__bento in der gemeinsamen Geometrie, das Bento traegt
   beide Klassen. Hier steht nur noch, wie die Stuecke DARIN zueinander
   stehen. */
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Es ist dieselbe Zahl, die auch im Paneli unter der Leiste steht
   (--work-bento-lead). */
.go-bento > .go-tabs { margin-top: 0; }
.go-bento > .go-tabs + * { margin-top: var(--work-bento-lead); }
/* Drei Reiter und ein Pfeil, sonst nichts - kein Grund, kein Rahmen, kein
   Polster um sie herum. Ein Kasten darum schoebe sie um seine Polsterbreite
   nach innen und damit aus der Flucht der Karten darueber.

   Die drei teilen sich den Platz gleichmaessig, der Pfeil nimmt nur seine
   eigene Breite: So bleibt jede Pille gleich gross, egal wie lang ihr Wort
   ist, und "Aktivizo" wird nicht breiter, nur weil es gerade offen ist. */
.go-tabs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: var(--work-pill-gap);
  /* Senkrecht scrollt der Browser wie ueberall sonst; waagerecht gehoert die
     Geste uns. Das ist die halbe Antwort auf "die Seite darf beim Wischen
     nicht mitgehen" - die andere Haelfte steht in bindSwipe: Sobald die Geste
     eindeutig waagerecht ist, wird das Scrollen abgesagt. */
  touch-action: pan-y;
}
/* Das Fenster, durch das immer genau eine Gruppe zu sehen ist.

   Oben und unten etwas Luft, damit der Schatten der offenen Pille nicht am
   Rand abgeschnitten wird - die negative Marge nimmt sie dem Layout wieder
   ab, sonst waere die Leiste acht Punkte hoeher als sie aussieht. */
.go-tabs__viewport {
  min-width: 0;
  overflow: hidden;
  padding: 4px 0;
  margin: -4px 0;
}
/* Das Band traegt beide Gruppen nebeneinander und wird verschoben. EINE
   Eigenschaft an EINEM Element - deshalb ruehrt ein Gruppenwechsel keinen
   anderen Knoten der Seite an.

   transform und nicht scrollLeft: Ein Band, das man scrollt, kann man auch
   halb scrollen und mit dem Finger anhalten. Verlangt war ein Wechsel wie
   zwischen zwei Reitern, kein Scrollen. */
.go-tabs__track {
  display: flex;
  transition: transform 210ms ease-out;
}
.go-tabs[data-go-tab-group="1"] .go-tabs__track { transform: translateX(-100%); }
/* Eine Gruppe ist genau die Pillen-Reihe des Panelis (.mnyra-work__pills) -
   drei gleich breite Pillen. Hier steht nur, dass sie das ganze Fenster
   fuellt. */
.go-tabs__pane { flex: 0 0 100%; }
/* Wer Bewegung abbestellt hat, bekommt den Wechsel ohne sie - die Gruppe
   steht dann sofort da. */
@media (prefers-reduced-motion: reduce) {
  .go-tabs__track { transition: none; }
}
/* Die Pille selbst steht nicht mehr hier: Hoehe, Rundung, Rand, Schrift,
   Symbolgroesse, Innenabstaende und der gewaehlte Zustand stehen EINMAL in der
   gemeinsamen Geometrie (.mnyra-work__pill). Das Paneli nimmt dieselbe Regel -
   zwei aehnliche Pillen zu pflegen war genau das Problem. */
/* Der Pfeil blaettert die Gruppe. Er ist kein Reiter, aber er gehoert in
   dieselbe Reihe - also traegt er dieselbe Form: dieselbe Fingerhoehe,
   derselbe Rand, dieselbe runde Kapsel wie eine Pille, die nicht offen ist.

   Er stand hier einmal als voller Lavendel-Kreis. Das machte ihn zum
   auffaelligsten Ding der Leiste - auffaelliger als der Reiter, der gerade
   offen ist, und der ist die Hauptsache. Jetzt ist er so ruhig wie eine
   geschlossene Pille, und nur das Zeichen darin traegt das Violett der
   Marke: sichtbar, aber nicht laut. */
/* Seine Form steht als .mnyra-work__pill-turn in der gemeinsamen Geometrie:
   dieselbe Fingerhoehe, derselbe Rand, dieselbe runde Kapsel wie eine Pille,
   die nicht offen ist. */
/* Beide Zeichen stehen im Knopf, sichtbar ist immer nur eines. So bleibt der
   Pfeil beim Wechsel derselbe Knoten - und der Wechsel bleibt ein Attribut. */
.go-tabs__turn-icon { display: none; }
.go-tabs[data-go-tab-group="0"] .go-tabs__turn-icon--next { display: block; }
.go-tabs[data-go-tab-group="1"] .go-tabs__turn-icon--back { display: block; }
/* Wie sich die Pillen auf schmalen Telefonen zusammenruecken (413px: engeres
   Polster, kleinere Schrift; 359px: nur noch das Symbol), steht in der
   gemeinsamen Geometrie - und gilt damit im Paneli genauso. */
/* Zwei Masse, die vorher an Klassen hingen, die es im statischen
   Tailwind-Blatt nicht gibt (mt-0.5, min-h-[44px]): der Abstand der Unterzeile
   und die Fingerhoehe der Pausenknoepfe. Eine Fingerhoehe, die von einer
   Klasse ohne Regel abhaengt, ist keine Fingerhoehe.
   Die Ueberschrift wird auf einem breiten Bildschirm NICHT mehr groesser: im
   Paneli tut sie das auch nicht, und die Huelle der App ist ohnehin ueberall
   gleich breit. */
.go-title-sub { margin-top: 2px; }
/* Die Kopfzeile der Seite: der Name mit dem Lokal darunter.

   Ihre Geometrie - Mindesthoehe und Abstand zur Karten-Reihe - steht als
   .mnyra-work__head in der gemeinsamen Geometrie; die Kopfzeile traegt beide
   Klassen und steht damit auf derselben Achse und in derselben Hoehe wie die
   Begruessung im Paneli.

   Rechts stand hier ein runder violetter Knopf, der die Einstellungen
   oeffnete. Er ist weg: die Einstellungen stehen jetzt in der globalen
   Kopfzeile, links neben der Sprache - auf dieser Seite genau wie im Paneli.
   Ein zweiter Einstellungs-Knopf mitten im Inhalt waere ein zweiter Weg zu
   derselben Stelle, und er stand nur hier. */
/* Der Block darf schrumpfen: ein langer Lokalname soll die Zeile nicht
   auseinanderziehen. min-width:0 ist das, was dem Textblock ueberhaupt
   erlaubt, schmaler als sein Inhalt zu werden - ohne das greift die Ellipse
   unten nicht. */
.go-head__brand { min-width: 0; }
/* Der Name des Lokals steht in EINER Zeile. Ein Umbruch hier verschoebe die
   ganze Kopfzeile in der Hoehe, sobald ein Lokal einen langen Namen hat. */
.go-head__brand .go-title,
.go-head__brand .go-title-sub {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Und genau die Zeilenhoehen der Begruessung im Paneli (1.1 fuer den Namen,
   1.2 fuer die Zeile darunter). Ohne sie brachte text-xl seine eigene
   Zeilenhoehe von 1.75rem mit, der Textblock wurde 46,5 statt 44 Punkte hoch -
   und damit stand auf dieser Seite alles darunter zweieinhalb Punkte tiefer
   als im Paneli. Gemessen, nicht geschaetzt. */
.go-head__brand .go-title { line-height: 1.1; }
.go-head__brand .go-title-sub { line-height: 1.2; }
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
`;function Ot(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="go-kpi__card${e.modifier?` ${e.modifier}`:""}" data-go-kpi="${s(a,e.key)}">
      <div class="go-kpi__top">
        <span class="go-kpi__period">${s(a,e.period)}</span>
        <span class="go-kpi__icon">${M(n,e.icon,"w-4 h-4")}</span>
      </div>
      ${e.pending?`<p class="go-kpi__value" role="status" aria-label="${s(a,`${e.title}: ${r.kpiPending}`)}"><span class="go-kpi__skeleton${e.wide?" go-kpi__skeleton--wide":""}"></span></p>`:`<p class="go-kpi__value">${s(a,e.value)}</p>`}
      <p class="go-kpi__title">${s(a,e.title)}</p>
      <p class="go-kpi__note">${s(a,e.note)}</p>
    </div>
  `}function Tt({overview:e={},deps:t={}}={}){const a=c=>Number.isFinite(Number(c))&&c!==null&&c!=="",n=c=>a(c)?String(Math.max(0,Math.trunc(Number(c)))):"",i=a(e?.openCents)?Math.max(0,Math.trunc(Number(e.openCents))):null,o=i===0;return`
    <div class="mnyra-work__cards" data-go-kpis>
      ${[{key:"views",period:r.today,icon:"eye",value:n(e?.uniqueViewers),pending:!a(e?.uniqueViewers),title:r.kpiViewsTitle,note:r.kpiViewsNote},{key:"chosen",period:r.today,icon:"ticket",value:n(e?.accepted),pending:!a(e?.accepted),title:r.kpiChosenTitle,note:r.kpiChosenNote},{key:"visits",period:r.today,icon:"badge-check",value:n(e?.visits),pending:!a(e?.visits),title:r.kpiVisitsTitle,note:r.kpiVisitsNote},{key:"guests",period:r.today,icon:"users",value:n(e?.visitors),pending:!a(e?.visitors),title:r.kpiGuestsTitle,note:r.kpiGuestsNote},{key:"due",period:r.current,icon:"wallet",value:i===null?"":Ue(i),pending:i===null,wide:!0,title:r.kpiDueTitle,note:o?r.kpiDueClear:r.kpiDueNote,modifier:o?"go-kpi__card--due go-kpi__card--clear":"go-kpi__card--due"}].map(c=>Ot(c,t)).join("")}
      <span class="go-kpi__tail" aria-hidden="true"></span>
    </div>
  `}const ne=Object.freeze([Object.freeze({key:"shift",tabs:Object.freeze(["pending","active","finalized"])}),Object.freeze({key:"manage",tabs:Object.freeze(["stats","payments","offers"])})]),Gt=Object.freeze({pending:"clock-3",active:"zap",finalized:"circle-check",stats:"bar-chart-3",payments:"wallet",offers:"tag",options:"settings"});function ja(e=""){return ne.findIndex(t=>t.tabs.includes(String(e||"")))}function Nt({tab:e="active",group:t=0,deps:a={}}={}){const n=a.escapeHtml,i=a.icon,o=Math.min(Math.max(Math.trunc(Number(t)||0),0),ne.length-1),p=o<ne.length-1?r.groupNext:r.groupBack;return`
    <div class="go-tabs" data-go-tabs data-go-tab-group="${o}">
      <div class="go-tabs__viewport">
        <div class="go-tabs__track">
          ${ne.map((c,b)=>`
            <div class="mnyra-work__pills go-tabs__pane" role="tablist" data-go-tab-pane="${b}"${b===o?"":' aria-hidden="true" inert'}>
              ${c.tabs.map(y=>`
                <button type="button" role="tab" aria-selected="${e===y?"true":"false"}" data-go-business-tab="${s(n,y)}"
                  aria-label="${s(n,r.tabs[y])}" title="${s(n,r.tabs[y])}"
                  class="mnyra-work__pill">${M(i,Gt[y],"w-4 h-4")}<span class="mnyra-work__pill-label">${s(n,r.tabs[y])}</span></button>
              `).join("")}
            </div>
          `).join("")}
        </div>
      </div>
      <!--
        Der Pfeil wechselt die GRUPPE und nicht den Reiter. Er traegt deshalb
        kein role="tab" und kein aria-selected: Er waehlt nichts aus, er
        blaettert. Was geoeffnet ist, bleibt geoeffnet, bis jemand einen
        Reiter antippt.

        Beide Zeichen stehen darin, sichtbar ist immer nur eines - welches,
        entscheidet das Stylesheet an der Gruppe. So bleibt auch der Pfeil
        beim Wechsel derselbe Knoten.
      -->
      <button type="button" class="mnyra-work__pill-turn" data-go-tab-group-turn
        aria-label="${s(n,p)}" title="${s(n,p)}">
        <span class="go-tabs__turn-icon go-tabs__turn-icon--next">${M(i,"chevron-right","w-4 h-4")}</span>
        <span class="go-tabs__turn-icon go-tabs__turn-icon--back">${M(i,"chevron-left","w-4 h-4")}</span>
      </button>
    </div>
  `}function te(e={},t={},{found:a=!1}={}){const n=t.escapeHtml,i=e.benefitLabel||e.snapshot?.benefitLabel||"",o=!e.businessSeenAt,p=e.partySizeVerified||e.partySizeRequested||e.partySize||1,c=le(e.status),b=Ze(e.acceptedAt),y=b?`${r.around} ${b}`:r.guestName;return`
    <div class="p-4 rounded-[1.6rem] border ${a?"go-booking--found bg-white":o?"bg-indigo-50/50 border-indigo-100":"bg-slate-50 border-slate-100"}"
      data-go-booking="${s(n,e.id)}">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-black text-slate-900 truncate min-w-0">${s(n,y)}</p>
        <span class="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">
          ${s(n,_t(e))}
        </span>
      </div>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(n,r.guestName)}</p>
      <div class="go-booking-meta mt-3 flex flex-wrap items-center text-xs font-bold text-slate-600">
        <span>👥 ${s(n,`${p} ${r.guests}`)}</span>
        ${i?`<span>🎁 ${s(n,i)}</span>`:""}
      </div>
      ${a&&c==="activated"?`
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
              value="${s(n,p)}"
              class="w-16 text-center py-2 rounded-xl border border-slate-200 text-sm font-black text-slate-900" />
          </label>
          <button type="button" data-go-booking-finalize data-go-booking-id="${s(n,e.id)}"
            class="w-full py-3.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-white active:scale-[0.98] transition-transform">
            ${s(n,r.finalize)}
          </button>
        </div>
      `:""}
      ${a&&c==="accepted"?`
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
          ${s(n,r.commission)} · ${s(n,Ue(e.commission.amountCents))}
        </p>
      `:""}
    </div>
  `}function Lt({code:e="",status:t="",busy:a=!1,deps:n={}}={}){const i=n.escapeHtml,o=n.icon;return`
    <div class="mb-4" data-go-code-search>
      <div class="go-code-box flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white">
        <span class="pl-2 text-slate-400">${M(o,"search","w-4 h-4")}</span>
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
  `}function q({eyebrow:e="",title:t="",sub:a="",action:n="",body:i="",deps:o={}}={}){const p=o.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${s(p,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${s(p,t)}</h3>
          ${a?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${s(p,a)}</p>`:""}
        </div>
        ${n}
      </div>
      ${i}
    </div>
  `}function ze({title:e="",note:t="",iconName:a="",deps:n={}}={}){const i=n.escapeHtml,o=n.icon;return q({eyebrow:r.brand,title:e,sub:r.soonHint,body:`
      <div class="text-center py-10">
        <div class="w-14 h-14 rounded-[1.6rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          ${M(o,a,"w-5 h-5")}
        </div>
        <p class="text-sm font-semibold text-slate-500">${s(i,t)}</p>
      </div>
    `,deps:n})}function It(e={},t={}){const a=t.escapeHtml,n=e.status==="paused"?r.paused:e.status==="archived"?r.archived:"";return`
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${s(a,e.id)}">
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Der Knopf des Gastes ("Prano
        ofertën") gehoert nicht in die Liste des Wirts, und was darin steht,
        hoert auf nichts.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Ie({businessName:"",imageUrl:e.imageUrl||"",variant:he,benefitLabel:e.benefitLabel||"",benefitView:Te(e.benefit||{}),meta:[{icon:"users",label:Ce(e)},{icon:"clock",label:Oe(e)}]})}
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
  `}function Ut({offer:e={},businessName:t="",previewImageUrl:a="",deps:n={}}={}){const i=n.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${s(i,r.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Ie({businessName:t,imageUrl:a||e.imageUrl||"",benefitLabel:e.benefitLabel||"",benefitView:Te(e.benefit||{}),meta:[{icon:"users",label:Ce(e)},{icon:"clock",label:Oe(e)}]})}
      </div>
    </div>
  `}function G(e,t="",a=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${a?` for="${s(e,a)}"`:""}>${s(e,t)}</label>`}function ae(e,{active:t=!1,attr:a="",value:n="",escapeHtml:i=null}={}){return`
    <button type="button" ${a?`${a}="${s(i,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${s(i,e)}
    </button>
  `}const Ht=`
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
`;function de({attr:e="",unit:t="€",value:a="",placeholder:n="",mode:i="decimal",inputClass:o="",escapeHtml:p=null}={}){return`
    <div class="go-offer-price">
      <input type="text" ${e} inputmode="${s(p,i)}" autocomplete="off"
        placeholder="${s(p,n)}" value="${s(p,a)}" class="${o}" />
      <span class="go-offer-price__unit">${s(p,t)}</span>
    </div>
  `}function Q(e,{active:t=!1,attr:a="",value:n="",escapeHtml:i=null}={}){return`
    <button type="button" ${a?`${a}="${s(i,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${s(i,e)}
    </button>
  `}const Pe=Object.freeze([10,15,20,25]);function Zt({benefit:e={},percentCustom:t=!1,errorFor:a=()=>"",inputClass:n="",inputBase:i="",escapeHtml:o=null}={}){const p=u=>G(o,u),c=u=>{const v=a(u);return v?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="${s(o,u)}">${s(o,v)}</p>`:""};if(!kt.includes(e.kind))return`
      <p class="go-offer-saving font-bold text-slate-400">${s(o,r.benefitLegacy)}</p>
      ${c("benefit")}
    `;const b=Number(e.percent)||0,y=t||b>0&&!Pe.includes(b),_=()=>{const u=wt(e.savingCents);if(!u)return"";const v=Math.round(Number(e.savingPercent)||0);return`
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${s(o,r.saving)} ${s(o,u)}${v>0?` &middot; -${v}%`:""}
      </p>
    `},g=()=>`
    <div class="mt-3">
      ${p(r.priceRegular)}
      ${de({attr:"data-go-benefit-regular",value:ve(e.regularPriceCents),placeholder:r.pricePlaceholder,inputClass:i,escapeHtml:o})}
      ${c("regularPrice")}
    </div>
    <div class="mt-3">
      ${p(r.priceGo)}
      ${de({attr:"data-go-benefit-go",value:ve(e.goPriceCents),placeholder:r.pricePlaceholder,inputClass:i,escapeHtml:o})}
      ${c("goPrice")}
    </div>
    ${_()}
  `;if(e.kind===Ee)return`
      ${p(r.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${Pe.map(u=>Q(`${u}%`,{active:!y&&b===u,attr:"data-go-discount",value:String(u),escapeHtml:o})).join("")}
        ${Q(r.discountOther,{active:y,attr:"data-go-discount",value:"other",escapeHtml:o})}
      </div>
      ${y?`
        <div class="mt-3">
          ${de({attr:"data-go-benefit-percent",unit:"%",mode:"numeric",value:b>0?String(b):"",placeholder:r.discountPlaceholder,inputClass:i,escapeHtml:o})}
        </div>
      `:""}
      ${c("benefitPercent")}

      <div class="mt-4">
        ${p(r.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[["all",r.scopeAll],["food",r.scopeFood],["drinks",r.scopeDrinks]].map(([u,v])=>Q(v,{active:(e.scope||"all")===u,attr:"data-go-discount-scope",value:u,escapeHtml:o})).join("")}
        </div>
        ${c("benefitScope")}
      </div>
    `;if(e.kind===Fe)return`
      ${p(r.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.bundlePlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${c("benefitItem")}
      ${g()}
    `;if(e.kind===Me){const u=String(e.conditionType||"");return`
      ${p(r.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.freePlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${c("benefitItem")}

      <div class="mt-4">
        ${p(r.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[["food",r.conditionFood],["drink",r.conditionDrink],["any_order",r.conditionAny],["custom",r.conditionCustom]].map(([v,z])=>Q(z,{active:u===v,attr:"data-go-benefit-condition",value:v,escapeHtml:o})).join("")}
        </div>
        ${u==="custom"?`
          <div class="mt-3">
            ${p(r.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${s(o,r.customConditionPlaceholder)}"
              value="${s(o,e.customCondition||"")}" class="${n}" />
          </div>
        `:""}
        ${c("benefitCondition")}
      </div>
    `}return e.kind===je?`
      ${p(r.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${s(o,r.productPlaceholder)}"
        value="${s(o,e.itemName||"")}" class="${n}" />
      ${c("benefitItem")}
      ${g()}
    `:""}function Vt({imageUrl:e="",photo:t={},escapeHtml:a=null,icon:n=null}={}){const i=String(t.status||""),o=i==="uploading",p=String(t.previewUrl||e||""),c=i==="error"?String(t.error||r.photoError):"",b=p?`
      <div class="go-offer-photo__frame${o?" go-offer-photo__frame--busy":""}">
        <img class="go-offer-photo__img" src="${s(a,p)}" alt="" decoding="async" />
        ${o?`<span class="go-offer-photo__busy">${s(a,r.photoUploading)}</span>`:""}
      </div>
      <div class="go-offer-photo__actions">
        <button type="button" class="go-offer-photo__action" data-go-offer-photo-pick>${s(a,r.photoChange)}</button>
        <button type="button" class="go-offer-photo__action go-offer-photo__action--remove" data-go-offer-photo-remove>${s(a,r.photoRemove)}</button>
      </div>
    `:`
      <button type="button" class="go-offer-photo" data-go-offer-photo-pick>
        <span class="go-offer-photo__plus">${M(n,"plus","w-5 h-5")}</span>
        <span class="go-offer-photo__title">${s(a,r.photoAdd)}</span>
        <span class="go-offer-photo__sub">${s(a,r.photoSource)}</span>
      </button>
    `;return`
    <div data-go-section="photo">
      ${G(a,r.photoQuestion)}
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
      ${c?`<p class="mt-2 text-[11px] font-bold text-rose-500">${s(a,c)}</p>`:""}
    </div>
  `}function Wt(e=""){const t=String(e||"all").trim().toLowerCase();return t==="food"?["food"]:t==="coffee"||t==="drinks"||t==="dessert"?["drinks"]:["food","drinks"]}function Ca(e=[]){const t=Array.isArray(e)?e:[],a=t.includes("food"),n=t.includes("drinks");return a&&n?"all":a?"food":n?"drinks":""}function Oa({editor:e=null,businessName:t="",deps:a={}}={}){if(!e)return"";const n=a.escapeHtml,i=a.icon,o=e.draft||{},p=Array.isArray(e.errors)?e.errors:[],c=m=>p.find(P=>P.field===m)?.message||"",b=Array.isArray(o.partyRanges)?o.partyRanges:[],y=o.schedule?.mode==="windows"?"windows":"always",_=Array.isArray(o.schedule?.days)&&o.schedule.days.length?o.schedule.days:ke.slice(),g=we.every(m=>b.includes(m.key)),u=Array.isArray(e.intents)?e.intents:Wt(o.category),v=o.benefit||{},z=e.mode==="edit",B="w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",j=`mt-2 ${B}`,x='<div class="h-px bg-slate-100"></div>',E=m=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${s(n,m)}</p>`,S=ft(o).ok&&u.length>0;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${s(n,z?r.editOffer:r.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${Le}${Ht}</style>
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
            ${M(i,"x","w-4 h-4")}
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
            ${G(n,r.benefitQuestion)}
            ${E(r.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[[Ee,r.benefitPercent],[Fe,r.benefitBundle],[Me,r.benefitFree],[je,r.benefitSpecial]].map(([m,P])=>`
                <button type="button" data-go-benefit-kind="${s(n,m)}"
                  aria-pressed="${v.kind===m?"true":"false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${v.kind===m?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${s(n,P)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5" data-go-benefit-form>
              ${Zt({benefit:v,percentCustom:e.percentCustom===!0,errorFor:c,inputClass:j,inputBase:B,escapeHtml:n})}
            </div>
          </div>

          ${x}

          <!--
            Das Foto steht direkt hinter den Angaben zum Angebot und nicht am
            Ende des Formulars (Punkt 9): Es gehoert zum Angebot. Wer es unten
            sucht, hat vorher dreimal gelesen, dass es freiwillig ist.
          -->
          ${Vt({imageUrl:o.imageUrl||"",photo:e.photo||{},escapeHtml:n,icon:i})}

          ${x}

          <div data-go-section="partyRanges">
            ${G(n,r.partyQuestion)}
            ${E(r.partyHint)}
            <!--
              "Të gjithë" zuerst und allein in seiner Zeile: Es ist die Antwort
              der meisten Lokale, und es ist keine fuenfte Gruppengroesse,
              sondern die Abkuerzung fuer alle vier darunter (Punkt 15).
            -->
            <div class="mt-3">
              ${ae(r.partyAll,{active:g,attr:"data-go-offer-party",value:"all",escapeHtml:n})}
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              ${we.map(m=>ae(m.label,{active:b.includes(m.key),attr:"data-go-offer-party",value:m.key,escapeHtml:n})).join("")}
            </div>
            ${c("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="partyRanges">${s(n,c("partyRanges"))}</p>`:""}
          </div>

          ${x}

          <div data-go-section="category">
            ${G(n,r.categoryQuestion)}
            ${E(r.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:r.ifFood},{key:"drinks",label:r.ifDrinks}].map(m=>{const P=u.includes(m.key),O=bt.find(Z=>Z.key===m.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${s(n,m.key)}" aria-pressed="${P?"true":"false"}"
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${P?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${s(n,m.label)}</span>
                    <span class="block text-[11px] font-semibold go-offer-answer__hint">${s(n,O)}</span>
                  </button>
                `}).join("")}
            </div>
            ${c("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="category">${s(n,c("category"))}</p>`:""}
          </div>

          ${x}

          <div data-go-section="schedule">
            ${G(n,r.scheduleQuestion)}
            ${E(r.scheduleHint)}
            <div class="mt-3 flex flex-wrap gap-2">
              ${ae(r.always,{active:y==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${ae(r.specificHours,{active:y==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
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
                ${G(n,r.daysQuestion)}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${ke.map(m=>Q(yt(m),{active:_.includes(m),attr:"data-go-offer-day",value:m,escapeHtml:n})).join("")}
                </div>
              </div>
              <div class="mt-4">
                ${G(n,r.hoursQuestion)}
                <div class="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    ${G(n,r.hoursFrom,"goOfferFrom")}
                    <input id="goOfferFrom" type="time" data-go-offer-from value="${s(n,e.windowFrom||"14:00")}" class="${j}" />
                  </div>
                  <div>
                    ${G(n,r.hoursTo,"goOfferTo")}
                    <input id="goOfferTo" type="time" data-go-offer-to value="${s(n,e.windowTo||"18:00")}" class="${j}" />
                  </div>
                </div>
              </div>
            `:""}
            ${c("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="schedule">${s(n,c("schedule"))}</p>`:""}
          </div>

          ${x}

          ${Ut({offer:o,businessName:t,previewImageUrl:e.photo?.previewUrl||"",deps:a})}
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
            aria-disabled="${S?"false":"true"}"
            class="w-full py-4 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all go-offer-save${S?" go-offer-save--ready":""}">
            ${s(n,e.saving?r.saving:z?r.save:r.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${s(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function Ta({restaurantName:e="",tab:t="active",group:a=0,overview:n={},search:i={},bookings:o=[],offers:p=[],settings:c={},paused:b=!1,loading:y=!1,error:_="",deps:g={}}={}){const u=g.escapeHtml,v=g.icon,z=m=>["accepted","activated"].includes(le(m.status)),B=o.filter(z),j=B.filter(m=>le(m.status)==="accepted"),x=o.filter(m=>!z(m)),E=p.filter(m=>m.status!=="archived");let S="";if(t==="offers")S=q({eyebrow:r.brand,title:r.tabs.offers,sub:`${E.length} ${E.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${M(v,"plus","w-4 h-4")}
        </button>
      `,body:E.length?`<div class="space-y-3">${E.map(m=>It(m,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.emptyTitle)}</div>`,deps:g});else if(t==="finalized")S=q({eyebrow:r.brand,title:r.tabs.finalized,sub:`${x.length}`,body:x.length?`<div class="space-y-3">${x.map(m=>te(m,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.noHistory)}</div>`,deps:g});else if(t==="pending")S=q({eyebrow:r.brand,title:r.tabs.pending,sub:`${j.length}`,body:y?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u,r.loading)}</div>`:j.length?`<div class="space-y-3">${j.map(m=>te(m,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.noBookings)}</div>`,deps:g});else if(t==="stats")S=ze({title:r.tabs.stats,note:r.soonStats,iconName:"bar-chart-3",deps:g});else if(t==="payments")S=ze({title:r.tabs.payments,note:r.soonPayments,iconName:"wallet",deps:g});else if(t==="options"){const m=Ze(c?.pausedUntil);S=q({eyebrow:r.brand,title:r.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${s(u,r.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${s(u,b?`${r.pausedUntil} ${m}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${b?"text-amber-600":"text-emerald-600"}">
            ${s(u,b?r.paused:r.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${b?`<button type="button" data-go-pause="0" class="go-pause px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${s(u,r.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(P=>`
              <button type="button" data-go-pause="${P.value}"
                class="go-pause px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${s(u,P.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${s(u,r.keepsRunning)}</p>
      `,deps:g})}else S=q({eyebrow:r.brand,title:r.tabs.active,sub:`${B.length}`,body:`
        ${Lt({code:i.code,status:i.status,busy:i.busy,deps:g})}
        ${i.booking?`
          <div class="mb-4">${te(i.booking,g,{found:!0})}</div>
        `:""}
        ${y?`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">${s(u,r.loading)}</div>`:B.length?`<div class="space-y-3">${B.filter(m=>m.id!==i.booking?.id).map(m=>te(m,g)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${s(u,r.noBookings)}</div>`}
      `,deps:g});return`
    <div class="mnyra-work animate-in slide-in-from-right-10 duration-500" data-go-admin>
      <!--
        Das Stylesheet steht in der Seite und nicht im Kopf des Dokuments: Die
        Reihe braucht Regeln, die sich mit Tailwind-Klassen nicht schreiben
        lassen (Zeilenbegrenzung, versteckte Bildlaufleiste, Rasterpunkte).
        Es wird mit der Seite ersetzt, also gibt es es immer genau einmal.
      -->
      <!--
        Drei Stylesheets. WORK_SURFACE_CSS zuerst: darin steht die Geometrie,
        die diese Seite mit dem Paneli teilt - Seitenpolster, Rhythmus, Benko
        und Pillen. Ohne sie stuenden die Marken hier leer, aus denen das Blatt
        darunter rechnet.

        GO_OFFER_CARD_CSS stand lange nur im Modal - und damit sah die Karte in
        der Vorschau richtig aus und in der Liste des Wirts nach gar nichts.
        Ein Stylesheet, das nur an einem von zwei Orten liegt, an denen
        dieselbe Karte gezeichnet wird, ist kein Stylesheet, sondern eine halbe
        Zusage.
      -->
      <style>${He}${Le}${Ct}</style>
      <!--
        Dieselbe Ueberschrift wie im Qyteti: oben der Name in einer Zeile,
        darunter ein Satz in klein und grau. Vorher standen hier drei Zeilen
        - eine Marke, eine Ueberschrift, ein Name - und das Lokal las von oben
        nach unten dreimal, wo es ist, bevor es einmal las, was es hier tun
        kann. Zwei Zeilen sagen dasselbe.

        Das GO steht im Blau der Marke und direkt am Wort: "MNYRAGO" ist ein
        Name, kein Wort mit einer Beschriftung daneben. Darunter steht nur noch
        das Lokal selbst.

        Rechts stand hier ein runder violetter Knopf zu den Einstellungen. Die
        Einstellungen stehen jetzt in der globalen Kopfzeile - auf dieser Seite
        genau wie im Paneli, links neben der Sprache. Die Zeile ist damit das
        Gegenstueck zur Begruessung im Paneli: gleiche Achse, gleiche Hoehe,
        gleicher Abstand zu den Karten darunter.

        Angelegt wird eine Oferte weiterhin im Reiter Ofertat - der Knopf
        dafuer steht ueber der Liste, zu der sie gehoert. Es gibt ihn also
        weiter genau einmal.
      -->
      <div class="mnyra-work__head">
        <div class="go-head__brand">
          <h1 class="go-title text-xl font-black tracking-tight text-slate-900">${s(u,r.brandMnyra)}<span class="text-indigo-600">${s(u,r.brandGo)}</span></h1>
          ${e?`<p class="go-title-sub text-[11px] text-slate-400 font-semibold">${s(u,e)}</p>`:""}
        </div>
      </div>

      ${Tt({overview:n,deps:g})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        woertlich dieselbe Flaeche wie im Paneli (.mnyra-work__bento). Die
        Reihe darueber bleibt frei: sie gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="mnyra-work__bento go-bento" data-go-bento>
        ${Nt({tab:t,group:a,deps:g})}
        <div>
          ${S}
          ${_?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${s(u,_)}</p>`:""}
        </div>
      </div>
    </div>
  `}function Ga({deps:e={},resolving:t=!1}={}){const a=e.icon,n=e.escapeHtml;return t?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${s(n,r.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${M(a,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${s(n,r.brand)}</h2>
        <p class="text-sm text-slate-500">${s(n,r.onlyBusiness)}</p>
      </div>
    </div>
  `}const Na=r,De="mnyraDashboardStyles",qt=`
.mnyra-dash {
  /* Seitenpolster, Rhythmus und Pillen kommen aus der gemeinsamen Geometrie
     der Arbeitsseiten (core/ui/work-surface-render-utils.js): Das Panel traegt
     dafuer die Klasse mnyra-work an seiner Wurzel. Mnyra GO nimmt dieselben Marken -
     nur so stehen Titel, Karten und Benko auf beiden Seiten auf derselben
     Achse und in demselben Abstand.
     Kein unteres Polster und keine Mindesthoehe: den Abschluss der Seite macht
     der Fuss der App (core/ui/app-footer-render-utils.js), der im Fluss hinter
     dem Panel steht. */
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
  /* Rundung, Auslauf und Kante des Bentos stehen in der gemeinsamen Geometrie
     (--work-bento-radius, --work-bento-tail): dieselben Zahlen tragen das
     Bento in Mnyra GO. Hier bleibt nur die Rundung der Faecher DARIN - sie
     sind etwas kleiner gerundet als die Karten darueber, damit sie als Inhalt
     der Flaeche lesen und nicht als Karten darauf. */
  --dash-bento-cell-radius: 20px;
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
/* Die Kennzahl-Reihe unter der Begruessung. Ihre Machart - waagerecht, bis an
   beide Bildschirmraender, aber links in der Flucht der Seite - steht als
   .mnyra-work__cards in der gemeinsamen Geometrie; die Reihe traegt beide
   Klassen. Den Abstand nach oben gibt die Titelzeile (--work-head-gap), damit
   er in GO derselbe ist. */
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+ das Seitenpolster), abzueglich der
   beiden Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-dash__hl-card {
  flex: 0 0 calc((100% + var(--work-inline) - 20px) / 2.5);
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
/* Das Bento - die weisse Flaeche, die alles unter der Kennzahl-Reihe traegt.
   Ihre Geometrie (Abstand nach oben, Seitenpolster, Rundung, Auslauf, Kante)
   steht als .mnyra-work__bento in der gemeinsamen Geometrie der
   Arbeitsseiten; das Bento traegt beide Klassen, GO nimmt dieselbe.
   Hier steht nur noch, wie die Stuecke DARIN zueinander stehen. */
/* Alles im Bento haelt denselben Abstand zum Stueck darueber. Das erste
   Stueck - die Pillen-Leiste - braucht keinen: dort ist das Polster des Bentos
   schon sein Abstand. */
.mnyra-dash__bento > .mnyra-dash__section,
.mnyra-dash__bento > .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__composer { margin-top: 22px; }
.mnyra-dash__bento > .mnyra-dash__tabs { margin-top: 0; }
/* Die Leiste braucht Luft nach unten, deutlich mehr als der Abstand zwischen
   zwei Karten: sie waehlt aus, was darunter steht - sie ist nicht selbst Teil
   davon. Es ist dieselbe Zahl, die auch in GO unter der Leiste steht
   (--work-bento-lead). */
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__composer,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__embed,
.mnyra-dash__bento > .mnyra-dash__tabs + .mnyra-dash__section { margin-top: var(--work-bento-lead); }
/* Die Pillen-Leiste oben im Bento - Funksionet, Analitika, Opsionet - traegt
   .mnyra-work__pills und .mnyra-work__pill: dieselbe Reihe und dieselben
   Pillen wie in Mnyra GO. Hoehe, Rundung, Rand, Schrift, Symbolgroesse,
   Innenabstaende, Luecken und der gewaehlte Zustand stehen dort EINMAL.
   Hier steht dazu nichts mehr - zwei aehnliche Pillen zu pflegen war genau
   das Problem. */
/* Analitika und Opsionet bringen ihre eigene Ansicht mit - samt eigenem
   Seitenpolster. Das Bento hat seines schon; beide zusammen waeren doppelt.
   Der Rahmen nimmt deshalb das Polster des Bentos zurueck und laesst der
   Ansicht darin ihr eigenes. */
.mnyra-dash__embed {
  margin-left: calc(-1 * var(--work-inline));
  margin-right: calc(-1 * var(--work-inline));
}
/* Bis an den unteren Rand des Bentos laeuft die eingesetzte Ansicht nur, wenn
   NICHTS mehr hinter ihr kommt. In der Analitika stehen darunter noch die
   letzten Beitraege - dort zoege der negative Rand sie unter die Ansicht. */
.mnyra-dash__embed:last-child { margin-bottom: calc(-1 * var(--work-bento-tail)); }
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
`;function Qt(e=typeof document>"u"?null:document){if(Mt(e),!(!e||e.getElementById(De)))try{const t=e.createElement("style");t.id=De,t.textContent=qt,e.head?.appendChild(t)}catch{}}function k(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function A(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const Yt=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function Jt({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return Yt.includes(a)?"hotel":"restaurant"}function Xt(e=new Date().getHours()){const t=Number.isFinite(Number(e))?(Math.trunc(Number(e))%24+24)%24:12;return t>=5&&t<=10?{dayPart:"mengjes",text:"Ju urojmë një mëngjes të mbarë!"}:t>=11&&t<=17?{dayPart:"dite",text:"Ju urojmë një ditë të mbarë!"}:t>=18&&t<=21?{dayPart:"mbremje",text:"Ju urojmë një mbrëmje të mbarë!"}:{dayPart:"nate",text:"Ju urojmë një natë të mbarë!"}}function ea({name:e="",logoUrl:t="",hour:a=new Date().getHours(),iconFn:n}={}){const i=Xt(a),o=k(e||"Business");return`
    <div class="mnyra-work__head mnyra-dash__greet">
      <p class="mnyra-dash__greet-title">
        <span class="mnyra-dash__greet-hello">Përshëndetje,</span>
        <span class="mnyra-dash__greet-logo">
          ${t?`<img src="${k(t)}" alt="${o}" title="${o}" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:`<span class="mnyra-dash__greet-logo-fallback" title="${o}">${A(n,"store","w-4 h-4")}</span>`}
        </span>
      </p>
      <p class="mnyra-dash__greet-sub">${k(i.text)}</p>
    </div>
  `}function ta({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function aa({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function na({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const Ae=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function ra(e="restaurant"){const t=String(e||"").trim().toLowerCase();return Ae[t]||Ae.restaurant}function ia({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=ra(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${k(n.accent)}</span> ${k(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${k(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${k(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const sa="/waiter?from=panel";function oa({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${sa}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${A(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${A(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function da({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(i=>i&&i.key);if(!a.length)return"";const n=a.map((i,o)=>{const p=k(i.label||"");if(i.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const c=o<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let b="";i.imageUrl?b=`<img class="mnyra-dash__hl-media" src="${k(i.imageUrl)}" alt="" ${c} decoding="async" onerror="this.style.display='none'" />`:i.videoUrl&&(b=`<video class="mnyra-dash__hl-media" src="${k(i.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const y=`
      <span class="mnyra-dash__hl-plate">${A(t,i.iconName||"image","w-6 h-6")}</span>
      ${b}
    `,_=i.withEye?`<span class="mnyra-dash__hl-eye">${A(t,"eye","w-4 h-4")}</span>`:"";let g;i.locked?g=`<span class="mnyra-dash__hl-lock">${A(t,"lock","w-3 h-3")}Me pagesë</span>`:i.loading?g='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':i.emptyText?g=`<span class="mnyra-dash__hl-empty">${k(i.emptyText)}</span>`:g=`<span class="mnyra-dash__hl-value">${_}${k(i.value||"0")}</span>`;let u;i.locked?u=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${k(i.key)}"`:i.composer?u=`class="mnyra-dash__hl-card" data-dashboard-composer="${k(i.composer)}"`:u=`class="mnyra-dash__hl-card"${i.panelTab?` data-dashboard-panel-tab="${k(i.panelTab)}"`:""}`;const v=i.locked?`${p} – me pagesë`:`${p} ${i.emptyText||i.value||""}`.trim();return`
      <button type="button" ${u} data-dashboard-metric="${k(i.key)}" aria-label="${k(v)}">
        ${y}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${p}</span>
          ${g}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-work__cards" data-dashboard-metrics="${k(la(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function la(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const Ve=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function re(e=""){const t=String(e||"").trim().toLowerCase();return Ve.some(a=>a.id===t)?t:"funksionet"}function ca({activeTab:e="funksionet",iconFn:t}={}){const a=re(e);return`<div class="mnyra-work__pills mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${Ve.map(i=>{const o=i.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${k(i.id)}"
        aria-selected="${o?"true":"false"}"
        aria-label="${k(i.label)}"
        title="${k(i.label)}"
        class="mnyra-work__pill"
      >${A(t,i.iconName,"w-4 h-4")}<span class="mnyra-work__pill-label">${k(i.label)}</span></button>
    `}).join("")}</div>`}function We(e=""){return`
    <div class="mnyra-work__bento mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function ha({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(i=>{const o=[i.dateLabel,`${W(i.likesCount||0)} Likes`,`${W(i.commentsCount||0)} Kommentare`];return Number(i.impressions||0)>0&&o.push(`${W(i.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${i.thumbUrl?`<img src="${k(i.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:A(t,i.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${k(i.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${k(o.filter(Boolean).join(" · "))}</p>
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
  `}function pa(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function ua({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${k(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function ma(){return'<div class="mnyra-work__head"><div class="mnyra-dash__skeleton" style="min-height:var(--work-head-min-height); border-radius:14px;"></div></div>'}function ga(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    ${ma()}
    <div class="mnyra-work__cards" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${We(`
      <div class="mnyra-work__pills mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:var(--work-pill-height); border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function fa({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${k(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ba(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const ya="menyra_social_dashboard_cache_v1::",Re="menyra_social_composer_products_v1::",Ke=2500,Be=1200,_a=6,ka=3,wa=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),va=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function F(e){const t=Number(e);return Number.isFinite(t)?t:0}function xa(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function $a(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",i=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),o=n==="video"?String(a.url||t.mediaUrl||"").trim():"",p=xa(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:i,videoUrl:o,likesCount:F(t.likesCount),commentsCount:F(t.commentsCount),impressions:0,dateLabel:p?p.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:p?p.getTime():0}}function Sa({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],i=_e(n),o=n.find(_=>String(_?.date||_?.id||"").trim()===String(t||"").trim()),p=_e(o?[o]:[]),c=i.merged?.posts&&typeof i.merged.posts=="object"?i.merged.posts:{},b=(Array.isArray(a)?a:[]).map(_=>$a(_?.id,_?.data||{})).filter(_=>_.id).map(_=>({..._,impressions:F(c[_.id]?.impressions)})),y=b.slice().sort((_,g)=>g.createdAtMs-_.createdAtMs).slice(0,ka);return{day:String(t||"").trim(),week:i.summary,today:p.summary,posts:y,latestPost:za(b)}}function za(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>F(n.createdAtMs)-F(a.createdAtMs)||F(n.impressions)-F(a.impressions)||F(n.likesCount)-F(a.likesCount))[0]:null}function Pa({profile:e={},restaurant:t={}}={}){return gt({profile:e,restaurant:t,feature:"qr"})}function Da(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function Aa({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const i=e?.today||{},o=!e,p=e?.latestPost||null,c=[];if(o)c.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!p)c.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const b=String(p.thumbUrl||"").trim();c.push({key:"latestPost",label:"Postimi fundit",value:W(F(p.impressions)),withEye:!0,imageUrl:b,videoUrl:b?"":String(p.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return c.push({key:"profileViews",label:"Vizitor n'profil",value:W(F(i.profileViews)),withEye:!0,loading:o,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),c.push({key:"menuOpens",label:"Vizitor n'meny",value:W(F(i.menuOpens)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),c.push({key:"qrScans",label:"Skanime n'tavolina",value:W(F(i.qrScans)),withEye:!0,loading:o&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),c}function La({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:i={},composerApi:o={},viewApi:p={},iconFn:c,storageObj:b}={}){const y=a||(typeof document>"u"?null:document),_=y?.defaultView||(typeof window>"u"?null:window),g=typeof t=="function"?t:()=>{},u=b||(typeof localStorage>"u"?null:localStorage),v=typeof i.getBusinessProfileTypeFn=="function"?i.getBusinessProfileTypeFn:(()=>""),z=typeof i.isShopCatalogProfileFn=="function"?i.isShopCatalogProfileFn:(()=>!1),B=typeof i.getRestaurantMetaByIdFn=="function"?i.getRestaurantMetaByIdFn:(()=>null),j=typeof i.resolveRestaurantLogoFn=="function"?i.resolveRestaurantLogoFn:(()=>""),x=typeof i.resolveOwnAvatarUrlFn=="function"?i.resolveOwnAvatarUrlFn:(()=>""),E=typeof p.renderAnalyticsViewFn=="function"?p.renderAnalyticsViewFn:(()=>""),S=typeof p.renderSettingsViewFn=="function"?p.renderSettingsViewFn:(()=>""),m=typeof p.warmAnalyticsFn=="function"?p.warmAnalyticsFn:(()=>{});let P=!1,O=0,Z=!1,T=null,N=null,L="",I=!1,pe=()=>null;const qe=300;function ie(){const d=e?.userProfile||{};return Jt({businessType:v(d),isShopCatalog:z(d)})}function Qe(d=""){const l=B(d)||{};return Kt(l).map(h=>({id:h.id,name:h.title,price:h.price??"",category:h.beds||h.tag||"",type:"room",imageUrl:h.imageUrl||""}))}function Ye(d=""){if(!u)return null;try{const l=u.getItem(`${Re}${d}`);if(!l)return null;const h=JSON.parse(l),f=Array.isArray(h?.items)?h.items:null;return f&&f.length?f:null}catch{return null}}function Je(d="",l=[]){if(u)try{u.setItem(`${Re}${d}`,JSON.stringify({savedAt:Date.now(),items:l}))}catch{}}async function Xe(d=""){const{db:l,collectionFn:h,queryFn:f,limitFn:w,getDocsFn:$}=n;if(!l||typeof h!="function"||typeof $!="function")throw new Error("Produktet nuk u ngarkuan.");const U=h(l,"restaurants",d,"menuItems"),R=typeof f=="function"&&typeof w=="function"?f(U,w(qe)):U,H=await $(R),D=[];return H.forEach(V=>{const X=pe(V?.id,V?.data?.()||{});X&&D.push(X)}),D.sort((V,X)=>V.name.localeCompare(X.name,"sq")),D}async function et(d="",l){const h=String(d||"").trim();if(!h)throw new Error("Produktet nuk u ngarkuan.");if(ie()==="hotel")return Qe(h);const f=Xe(h).then($=>(Je(h,$),$)),w=Ye(h);return w?(typeof l=="function"?f.then($=>l($)).catch(()=>{}):f.catch(()=>{}),w):f}function ue(){return T?Promise.resolve(T):(N||(N=pt(()=>import("./business-composer-controller-C_XEO2Iu.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(d=>(pe=typeof d?.normalizeComposerProductCore=="function"?d.normalizeComposerProductCore:(()=>null),T=d.createBusinessComposerController({documentObj:y,windowObj:y?.defaultView||null,api:{getRestaurantIdFn:()=>Y(),getBusinessMetaFn:()=>{const l=Y();if(!l)return{name:"",logoUrl:"",city:""};const h=ye(l),f=B(l)||{};return{name:h.name,logoUrl:h.logoUrl,city:String(f.city||"").trim()}},loadProductsFn:(l,h)=>et(l,h),getBusinessKindFn:()=>ie(),uploadImageFn:o.uploadImageFn,uploadVideoFn:o.uploadVideoFn,captureVideoPosterFn:o.captureVideoPosterFn,createPostFn:o.createPostFn,createStoryFn:o.createStoryFn,formatPriceFn:o.formatPriceFn,getOptimizedImageUrlFn:o.getOptimizedImageUrlFn,escapeHtmlFn:o.escapeHtmlFn,iconFn:typeof c=="function"?c:void 0,afterPublishFn:async l=>{try{await J({force:!0})}catch{}typeof o.afterPublishFn=="function"&&await o.afterPublishFn(l)}}}),T)).catch(d=>{throw N=null,console.error("[mnyra][dashboard] composer load failed",d),d})),N)}function me(){const d=_?.navigator?.connection;return!d||typeof d!="object"?!1:d.saveData===!0?!0:/(^|-)2g$/.test(String(d.effectiveType||"").trim().toLowerCase())}function tt(){if(I||T||!_||me())return;I=!0;const d=()=>{if(ue().catch(()=>{}),typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}};if(typeof _.requestIdleCallback=="function"){_.requestIdleCallback(d,{timeout:Ke});return}_.setTimeout?.(d,Be)}function at(){if(P||!_||me())return;P=!0;const d=()=>{try{m()}catch{}};if(typeof _.requestIdleCallback=="function"){_.requestIdleCallback(d,{timeout:Ke});return}_.setTimeout?.(d,Be)}function nt(d="post"){const l=String(d||"").trim().toLowerCase(),h=l==="story"||l==="profile"?l:"post";if(typeof o.prewarmFn=="function")try{o.prewarmFn()}catch{}if(T){T.open(h);return}L=h,ue().then(f=>{const w=L||h;L="",f?.open?.(w)}).catch(()=>{L=""})}function se(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function ge(d=""){const l=se(),h=String(d||"").trim();return String(l.restaurantId||"")===h||(l.restaurantId=h,l.model=null,l.status="idle",l.error="",l.loadedSignature="",l.paywall="",O+=1),l}function Y(){const d=e?.userProfile||{};return String(d.restaurantId||d.staffRestaurantId||"").trim()}let fe="";function rt(){const d=String(e?.user?.uid||"").trim();!d||fe===d||typeof i.ensureBusinessProfileFn=="function"&&(fe=d,Promise.resolve().then(()=>i.ensureBusinessProfileFn()).catch(l=>{console.warn("[mnyra][panel] business profile could not be resolved",l)}).finally(()=>{String(e?.user?.uid||"").trim()===d&&g()}))}function it(){const d=String(e?.user?.uid||"").trim();if(!d)return!1;const l=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||l===d}function be(d=""){return`${ya}${d}`}function st(d="",l=""){if(!u||!d)return null;try{const h=u.getItem(be(d));if(!h)return null;const f=JSON.parse(h);return!f||typeof f!="object"||String(f.day||"").trim()!==String(l||"").trim()||!f.model||typeof f.model!="object"?null:f.model}catch{return null}}function ot(d="",l=null){if(!(!u||!d||!l))try{u.setItem(be(d),JSON.stringify({day:l.day,model:l}))}catch{}}async function dt(d=""){const{db:l,collectionFn:h,queryFn:f,orderByFn:w,limitFn:$,getDocsFn:U}=n;if(!l||typeof h!="function"||typeof f!="function"||typeof w!="function"||typeof $!="function"||typeof U!="function")return[];const R=h(l,"restaurants",d,"socialPosts");return(await U(f(R,w("createdAt","desc"),$(_a)))).docs.map(D=>({id:D.id,data:D.data()||{}})).filter(D=>{const V=String(D.data.status||"active").trim().toLowerCase();return V!=="deleted"&&V!=="hidden"})}async function J({force:d=!1}={}){const l=Y(),h=ge(l);if(!l)return;const f=ut({rangeKey:"7d"});if(!f)return;const w=`${l}::${f.toDay}`;if(!d&&h.loadedSignature===w&&h.status==="ready")return;if(!h.model){const R=st(l,f.toDay);R&&(h.model=R,h.status="ready",g())}O+=1;const $=O;h.model||(h.status="loading",h.error="",g());try{const R={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:l},[H,D]=await Promise.allSettled([mt({...R,fromDay:f.fromDay,toDay:f.toDay}),dt(l)]);if($!==O)return;if(H.status==="rejected")throw H.reason;D.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",D.reason),h.model=Sa({days:H.value,todayKey:f.toDay,rawPosts:D.status==="fulfilled"?D.value:[]}),h.status="ready",h.error="",h.loadedSignature=w,ot(l,h.model)}catch(R){if($!==O)return;console.error("[mnyra][dashboard] load failed",R),h.model||(h.status="error",h.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}g()}function lt(){Z||!y||(Z=!0,y.addEventListener("click",d=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(d.target?.closest?.("[data-dashboard-retry]")){J({force:!0});return}if(d.target?.closest?.("[data-dashboard-paywall-close]")){d.preventDefault(),se().paywall="",g();return}const l=d.target?.closest?.("[data-dashboard-metric-locked]");if(l){d.preventDefault(),se().paywall=String(l.getAttribute("data-dashboard-metric-locked")||"").trim(),g();return}const h=d.target?.closest?.("[data-dashboard-composer]");if(h){d.preventDefault(),nt(h.getAttribute("data-dashboard-composer"));return}const f=d.target?.closest?.("[data-dashboard-panel-tab]");if(f){d.preventDefault();const w=re(f.getAttribute("data-dashboard-panel-tab"));if(w===re(e?.dashboardPanelTab))return;e.dashboardPanelTab=w,g()}}catch{}}))}function ye(d=""){const l=e?.userProfile||{},h=d?B(d)||{}:{},f=String(h.name||h.restaurantName||l.name||"").trim()||"Business";let w="";try{w=String(x()||"").trim()}catch{}if(!w)try{w=String(j(h)||"").trim()}catch{}return{name:f,logoUrl:w,kind:ie(),coverUrl:Da(h),subscribed:Pa({profile:l,restaurant:h})}}function ct(d=""){try{if(!vt()||!d)return"";xt({restaurantId:d,onBadgeFn:()=>g()});const l=$t();return jt({enabled:!0,unseenCount:l.unseen,activeOffers:l.activeOffers||0,todayBookings:l.today,iconFn:c})}catch{return""}}function ht(){Qt(y),lt();const d=Y(),l=ge(d);let h="";if(!d)rt(),h=it()?ga():ba();else{tt(),at();const f=ye(d),w=re(e?.dashboardPanelTab);l.status==="idle"&&(l.status="loading",queueMicrotask(()=>{J({force:!1})}));let $="";l.model?$=ha({posts:l.model.posts,iconFn:c}):l.status==="error"?$=fa({message:l.error}):$=pa();const U=`
        ${ct(d)}
        ${ta({iconFn:c})}
        ${oa({iconFn:c,showEditor:!!d})}
        ${aa({iconFn:c,showEditor:!!d})}
        ${na({iconFn:c,showEditor:!!d})}
        ${ia({iconFn:c,kind:f.kind,showEditor:!!d})}
      `;let R;w==="analitika"?R=`
          <div class="mnyra-dash__embed">${E()}</div>
          ${$}
        `:w==="opsionet"?R=`<div class="mnyra-dash__embed">${S()}</div>`:R=U;const H=Aa({model:l.model,coverUrl:f.coverUrl,subscribed:f.subscribed,assets:wa}),D=String(l.paywall||"").trim();h=`
        ${ea({name:f.name,logoUrl:f.logoUrl,iconFn:c})}
        ${da({cards:H,iconFn:c})}
        ${We(`
          ${ca({activeTab:w,iconFn:c})}
          ${R}
        `)}
        ${D?ua({title:va[D]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-work mnyra-dash" data-dashboard-root>
        ${h}
      </section>
    `}return Object.freeze({renderDashboardView:ht,loadDashboard:J})}export{Na as B,ne as G,zt as M,La as a,Ta as b,Pt as c,ja as d,Ca as e,Oa as f,Wt as g,Ut as h,Le as i,ee as j,he as k,ce as l,Ie as m,Rt as n,Kt as o,Fa as p,Ma as q,Ga as r};
