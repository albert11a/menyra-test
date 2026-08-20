const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunks/business-composer-controller-DEJwtfke.js","chunks/domain-feed-social-eager-DebIzp3k.js","chunks/domain-auth-B1kS5TG-.js","chunks/domain-public-profile-mLQti0eH.js","chunks/domain-media-eager-DAUyCk2O.js","chunks/domain-menu-eager-B4B_F-_w.js","chunks/profile-post-card-markup-utils-HwqIiXgP.js"])))=>i.map(i=>d[i]);
import{_ as gt}from"./domain-auth-B1kS5TG-.js";import{f as V,r as mt,l as ft,s as be}from"./domain-analytics-i6lAJYIg.js";import{b as bt}from"./domain-business-accounts-D8NpUhi6.js";import{G as we,a as _e,v as wt,c as Re,d as Fe,e as Be,f as Me,g as _t,h as kt,i as vt,j as Ce,k as je,l as Ge,m as yt,n as xt,o as Ne,p as ke,q as zt,s as St,u as $t,w as Kt}from"./domain-feed-social-eager-DebIzp3k.js";const Dt=20,Pt=8;function j(e=""){return e==null?"":String(e).trim()}function re(e){if(e==null||e==="")return null;const t=Number(String(e).replace(",","."));return Number.isFinite(t)&&t>0?t:null}function At(e=Date.now(),t=Math.random()){const a=Math.max(0,Number(e)||0).toString(36),n=Math.floor(Math.max(0,Math.min(.999999,Number(t)||0))*36**6).toString(36).padStart(6,"0");return`room_${a}_${n}`}function Et(e={}){const t=e&&typeof e=="object"?e:{},a=[...Array.isArray(t.images)?t.images:[],j(t.imageUrl??t.image??t.photoUrl)],n=[];return a.forEach(r=>{const s=j(r);s&&!n.includes(s)&&n.push(s)}),n.slice(0,Pt)}function Rt(e={},{index:t=0}={}){const a=e&&typeof e=="object"?e:{},n=re(a.persons??a.guests??a.capacity),r=re(a.size??a.sizeSqm??a.area),s=Et(a);return{id:j(a.id)||At(Date.now()+t),title:j(a.title??a.name),description:j(a.description??a.text).slice(0,400),imageUrl:s[0]||"",images:s,price:re(a.price??a.pricePerNight),currency:j(a.currency??a.currencyCode).toUpperCase()||"EUR",persons:n==null?null:Math.min(20,Math.round(n)),beds:j(a.beds??a.bedsLabel).slice(0,60),size:r==null?null:Math.min(500,Math.round(r)),tag:j(a.tag??a.badge).slice(0,40),active:a.active!==!1}}function Ft(e=[]){return(Array.isArray(e)?e:[]).slice(0,Dt).map((t,a)=>Rt(t,{index:a}))}function Bt(e={}){return Ft((e&&typeof e=="object"?e:{}).hotelRooms).filter(a=>a.title)}function ja(e={}){const t=[];return Number.isFinite(e?.persons)&&e.persons>0&&t.push({icon:"users",label:`${e.persons} persona`}),j(e?.beds)&&t.push({icon:"bed",label:j(e.beds)}),Number.isFinite(e?.size)&&e.size>0&&t.push({icon:"size",label:`${e.size} m²`}),t}function Ga(e={}){const t=Number(e?.price);if(!Number.isFinite(t)||t<=0)return"";const a=j(e?.currency).toUpperCase()||"EUR",n=Number.isInteger(t)?String(t):t.toFixed(2);return a==="EUR"?`€${n}`:`${n} ${a}`}const Oe=Object.freeze({x:[["path",{d:"M18 6 6 18"}],["path",{d:"m6 6 12 12"}]],users:[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{cx:"9",cy:"7",r:"4"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75"}]],sparkles:[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"}],["path",{d:"M20 3v4"}],["path",{d:"M22 5h-4"}],["path",{d:"M4 17v2"}],["path",{d:"M5 18H3"}]],coffee:[["path",{d:"M10 2v2"}],["path",{d:"M14 2v2"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"}],["path",{d:"M6 2v2"}]],"cup-soda":[["path",{d:"m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"}],["path",{d:"M5 8h14"}],["path",{d:"M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"}],["path",{d:"m12 8 1-6h2"}]],utensils:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"}],["path",{d:"M7 2v20"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"}]],"cake-slice":[["circle",{cx:"9",cy:"7",r:"2"}],["path",{d:"M7.2 7.9 3 11v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1v-9c0-2-3-6-7-8l-3.6 2.6"}],["path",{d:"M16 13H3"}],["path",{d:"M16 17H3"}]],zap:[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"}]],timer:[["line",{x1:"10",x2:"14",y1:"2",y2:"2"}],["line",{x1:"12",x2:"15",y1:"14",y2:"11"}],["circle",{cx:"12",cy:"14",r:"8"}]],clock:[["circle",{cx:"12",cy:"12",r:"10"}],["polyline",{points:"12 6 12 12 16 14"}]],"calendar-clock":[["path",{d:"M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"}],["path",{d:"M16 2v4"}],["path",{d:"M8 2v4"}],["path",{d:"M3 10h5"}],["path",{d:"M17.5 17.5 16 16.3V14"}],["circle",{cx:"16",cy:"16",r:"6"}]],"map-pin":[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"}],["circle",{cx:"12",cy:"10",r:"3"}]],search:[["circle",{cx:"11",cy:"11",r:"8"}],["path",{d:"m21 21-4.3-4.3"}]],"badge-percent":[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"}],["path",{d:"m15 9-6 6"}],["path",{d:"M9 9h.01"}],["path",{d:"M15 15h.01"}]],"check-check":[["path",{d:"M18 6 7 17l-5-5"}],["path",{d:"m22 10-7.5 7.5L13 16"}]],"party-popper":[["path",{d:"M5.8 11.3 2 22l10.7-3.79"}],["path",{d:"M4 3h.01"}],["path",{d:"M22 8h.01"}],["path",{d:"M15 2h.01"}],["path",{d:"M22 20h.01"}],["path",{d:"m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"}],["path",{d:"m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"}],["path",{d:"m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"}],["path",{d:"M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"}]],gift:[["rect",{x:"3",y:"8",width:"18",height:"4",rx:"1"}],["path",{d:"M12 8v13"}],["path",{d:"M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"}],["path",{d:"M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"}]],"shield-check":[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{d:"m9 12 2 2 4-4"}]],"ticket-percent":[["path",{d:"M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"}],["path",{d:"M9 9h.01"}],["path",{d:"m15 9-6 6"}],["path",{d:"M15 15h.01"}]],store:[["path",{d:"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"}],["path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}],["path",{d:"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"}],["path",{d:"M2 7h20"}],["path",{d:"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"}]],pencil:[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{d:"m15 5 4 4"}]],armchair:[["path",{d:"M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"}],["path",{d:"M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z"}],["path",{d:"M5 18v2"}],["path",{d:"M19 18v2"}]],"circle-check-big":[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335"}],["path",{d:"m9 11 3 3L22 4"}]],"book-open":[["path",{d:"M12 7v14"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],navigation:[["polygon",{points:"3 11 22 2 13 21 11 13 3 11"}]],"log-in":[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"}],["polyline",{points:"10 17 15 12 10 7"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12"}]],"rotate-ccw":[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{d:"M3 3v5h5"}]],"arrow-left":[["path",{d:"m12 19-7-7 7-7"}],["path",{d:"M19 12H5"}]],"chevron-right":[["path",{d:"m9 18 6-6-6-6"}]],"triangle-alert":[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{d:"M12 9v4"}],["path",{d:"M12 17h.01"}]],link:[["path",{d:"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"}],["path",{d:"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"}]],copy:[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],check:[["path",{d:"M20 6 9 17l-5-5"}]],hash:[["line",{x1:"4",x2:"20",y1:"9",y2:"9"}],["line",{x1:"4",x2:"20",y1:"15",y2:"15"}],["line",{x1:"10",x2:"8",y1:"3",y2:"21"}],["line",{x1:"16",x2:"14",y1:"3",y2:"21"}]],ban:[["circle",{cx:"12",cy:"12",r:"10"}],["path",{d:"m4.9 4.9 14.2 14.2"}]]}),Mt=Object.freeze({xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round","aria-hidden":"true",focusable:"false"});function ve(e={}){return Object.entries(e).map(([t,a])=>` ${t}="${a}"`).join("")}Object.freeze(Object.keys(Oe));function X(e="",t=""){const a=Oe[String(e||"").trim()];if(!a)return"";const n=a.map(([s,h])=>`<${s}${ve(h)}></${s}>`).join(""),r=String(t||"").trim();return`<svg${ve(Mt)}${r?` class="${r}"`:""}>${n}</svg>`}const ye=Object.freeze({offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",sponsored:"Sponsored",onlyGo:"Vetëm me Mnyra GO",tableIncluded:"Tavolinë",peopleSuffix:"persona"}),Te="clean",de="hero",le="compact",Ct=[Te,de,le];function jt({imageUrl:e="",variant:t=""}={}){if(!String(e||"").trim())return Te;const a=String(t||"").trim().toLowerCase();return Ct.includes(a)?a:de}const Ze=`
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
`;function E(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function Le({businessName:e="",logoUrl:t="",imageUrl:a="",variant:n="",benefitLabel:r="",benefitView:s=null,sponsored:h=!1,meta:l=[],ctaLabel:p="",ctaIcon:_="check-check",ctaDisabled:m=!1,cardAttrs:f="",ctaAttrs:g="",texts:w=ye}={}){const v={...ye,...w||{}},G=(Array.isArray(l)?l:[]).filter(I=>I&&I.label),N=String(p||v.accept),S=s&&typeof s=="object"?s:{},O=String(S.headline||r||""),C=String(S.priceGo||""),k=String(S.priceRegular||""),K=String(a||"").trim(),$=jt({imageUrl:K,variant:n}),x=$===le,B=K?`<img class="mnyra-go-page__card-photo" src="${E(K)}" alt="" loading="lazy" decoding="async" />`:"",Z=`
    <div class="mnyra-go-page__card-head">
      ${t?`<img class="mnyra-go-page__card-logo" src="${E(t)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`:`<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${X("store")}</div>`}
      <div class="mnyra-go-page__card-names">
        <p class="mnyra-go-page__card-who">${E(e)} <span>${E(v.offering)}</span></p>
        ${h?`<p class="mnyra-go-page__card-sponsored">${E(v.sponsored)}</p>`:""}
      </div>
    </div>

    ${S.eyebrow?`<p class="mnyra-go-page__card-eyebrow">${E(S.eyebrow)}</p>`:""}
    <p class="mnyra-go-page__card-benefit${C?" mnyra-go-page__card-benefit--title":""}">${E(O)}</p>
    ${S.note?`<p class="mnyra-go-page__card-note">${E(S.note)}</p>`:""}
    ${C?`
      <div class="mnyra-go-page__card-prices">
        ${k?`<span class="mnyra-go-page__card-price-was">${E(k)}</span>`:""}
        <span class="mnyra-go-page__card-price-go">${E(C)}</span>
      </div>
    `:""}
    ${S.savingLabel?`<p class="mnyra-go-page__card-saving">${E(S.savingLabel)}</p>`:""}
    ${x?"":`<p class="mnyra-go-page__card-for">${E(v.forGroup)}</p>`}
  `,L=`
    <div class="mnyra-go-page__card-meta">
      ${G.map(I=>`<span>${X(I.icon||"")}${E(I.label)}</span>`).join("")}
    </div>

    <p class="mnyra-go-page__card-only">${X("ticket-percent")}${E(v.onlyGo)}</p>

    <button
      type="button"
      class="mnyra-go-page__cta"
      ${g}
      ${m?"disabled":""}
    >${_?X(_):""}${E(N)}</button>
  `;return x?`
      <article class="mnyra-go-page__card mnyra-go-page__card--compact"${f?` ${f}`:""}>
        <div class="mnyra-go-page__card-top">
          ${B}
          <div>${Z}</div>
        </div>
        ${L}
      </article>
    `:$===de?`
      <article class="mnyra-go-page__card mnyra-go-page__card--hero"${f?` ${f}`:""}>
        ${B}
        <div class="mnyra-go-page__card-body">
          ${Z}
          ${L}
        </div>
      </article>
    `:`
    <article class="mnyra-go-page__card"${f?` ${f}`:""}>
      ${Z}
      ${L}
    </article>
  `}function Ie(e=0){const t=Math.max(0,Math.trunc(Number(e)||0)),a=Math.trunc(t/100),n=String(t%100).padStart(2,"0");return`${a},${n} €`}const xe="mnyraWorkSurfaceStyles",He=`
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
       --work-head-top    globale Kopfzeile -> Karten-Reihe
       --work-cards-gap   Ende der Karten   -> Anfang des Benkos
     Dazu kommt oben noch das Polster von <main> (--smart-header-content-gap,
     1.2rem), das beide Seiten gleichermassen bekommen.

     --work-head-top ist der EINE Abstand unter dem Kopf, und beide Seiten
     nehmen ihn aus derselben Marke: Wer zwischen Biznesi und GO wechselt,
     soll den Inhalt auf derselben Hoehe wiederfinden. Zwischen ihm und der
     ersten Karte steht seit dem Wegfall der Titelzeile nichts mehr. */
  --work-head-top: 24px;
  --work-cards-gap: 80px;
  /* Die Hoehe EINER Karte in der Reihe - und damit die Hoehe der ganzen Reihe.
     Sie steht hier und nicht auf den Seiten, weil an ihr der Anfang des Benkos
     haengt: Sind die Karten verschieden hoch, faengt das Benko auf der einen
     Seite hoeher an als auf der anderen, egal wie gleich der Abstand darueber
     und darunter ist. Genau das war der Fall - 228 Punkte im Paneli, 210 in
     GO, also 18 Punkte Versatz im Benko.
     Das Mass ist das groessere der beiden: Im Paneli sitzt darin ein
     Bildfenster von 140 Punkten und darunter ein Textblock von 88; in GO
     bekommt die vierzeilige Beschreibung auf einem 320er Telefon damit mehr
     Luft, statt sie zu verlieren. */
  --work-card-height: 228px;
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
/* Die Titelzeile stand hier - der Name der Seite, im Paneli als Begruessung,
   in GO als Wortlogo mit dem Lokal darunter (.mnyra-work__head). Sie ist auf
   beiden Seiten weg, weil sie doppelt war: Die Identitaet der Seite steht im
   globalen Kopf - dort das Bild des Lokals neben "Biznesi", hier "MNYRAGO".

   Zusammen mit ihrem Abstand nach unten standen damit 80 Punkte zwischen dem
   Kopf und der ersten Karte. Uebrig bleibt --work-head-top: ein bewusster
   Abstand, aber keine leere Flaeche. Ihr Blatt geht mit - eine Regel ohne
   Knoten ist kein Blatt, sondern eine Fussnote. */
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
`;function Gt(e=typeof document>"u"?null:document){if(!(!e||e.getElementById(xe)))try{const t=e.createElement("style");t.id=xe,t.textContent=He,e.head?.appendChild(t)}catch{}}const Nt=Object.freeze(["accepted","activated"]),i=Object.freeze({brand:"Mnyra GO",mark:"⚡",brandMnyra:"MNYRA",brandGo:"GO",createOfferAction:"Krijo ofertë",groupNext:"Menaxhimi",groupBack:"Puna e ditës",soonStats:"Këtu do të shohësh se si ecën GO për ty me kalimin e kohës.",soonPayments:"Këtu do të shohësh faturat dhe pagesat e tua për MNYRA GO.",soonHint:"Së shpejti",emptyTitle:"Merr klientë kur ata janë gati të dalin.",emptyAction:"Aktivizo ofertën e parë",cardIdle:"Krijo oferta për klientët që kërkojnë tani.",cardManage:"Menaxho GO",tabs:{pending:"Në pritje",active:"Aktivizo",finalized:"Finalizuar",stats:"Statistikat",payments:"Pagesat",offers:"Ofertat",options:"Opsionet"},statNew:"Të reja",statActive:"Aktive",statToday:"Sot",guests:"Mysafirë",goOn:"GO Aktiv",pause:"Pauzo GO",resume:"Aktivizo GO",pausedUntil:"Pauzuar deri",createOffer:"Ofertë e re GO",editorHint:"Krijoje ofertën një herë. Mnyra ua shfaq automatikisht klientëve që përputhen.",today:"Sot",current:"Aktuale",kpiViewsTitle:"Shikime të ofertave",kpiViewsNote:"Sa persona i kanë parë ofertat e tua.",kpiChosenTitle:"Oferta të zgjedhura",kpiChosenNote:"Sa herë klientët kanë zgjedhur ofertën tënde.",kpiVisitsTitle:"Vizita të realizuara",kpiVisitsNote:"Oferta të përdorura dhe verifikuara në lokal.",kpiGuestsTitle:"Klientë të sjellë",kpiGuestsNote:"Sa persona kanë ardhur përmes MNYRA GO.",kpiDueTitle:"Për pagesë",kpiDueNote:"Shuma aktuale për MNYRA GO.",kpiDueClear:"Asgjë për pagesë.",kpiPending:"Po ngarkohet",editOffer:"Ndrysho ofertën",preview:"Kështu e sheh klienti",activate:"Aktivizo",save:"Ruaj ofertën",saving:"Po ruhet...",close:"Mbyll",edit:"Edit",offering:"po ju ofron",forGroup:"për grupin tuaj",accept:"Prano ofertën",finalizeTitle:"Finalizo ofertën",benefitQuestion:"Çka po ofron?",benefitHint:"Zgjidh çfarë dëshiron t'i ofrosh klientit.",benefitPercent:"Zbritje %",benefitBundle:"Paketë GO",benefitFree:"Falas",benefitSpecial:"Çmim special",benefitLegacy:"Zgjidh llojin e ofertës.",discountQuestion:"Sa zbritje po ofron?",discountOther:"Tjetër",discountPlaceholder:"Shkruaj zbritjen",scopeQuestion:"Ku vlen zbritja?",scopeAll:"Krejt fatura",scopeFood:"Ushqim",scopeDrinks:"Pije",bundleQuestion:"Çka përfshin paketa?",bundlePlaceholder:"p.sh. 2 Burger + 2 Pije",freeQuestion:"Çka merr falas?",freePlaceholder:"p.sh. 1 Pije",conditionQuestion:"Kur e merr falas?",conditionFood:"Me ushqim",conditionDrink:"Me pije",conditionAny:"Me çdo porosi",conditionCustom:"Tjetër",customConditionQuestion:"Shkruaj kushtin",customConditionPlaceholder:"p.sh. kur porosit 2 pizza",productQuestion:"Cili produkt?",productPlaceholder:"p.sh. Pizza Margherita",priceRegular:"Çmimi normal",priceGo:"Çmimi GO",pricePlaceholder:"0,00",saving:"Kursen",photoQuestion:"Foto e ofertës",photoHint:"Shto një foto që klienti ta shohë ofertën menjëherë.",photoOptional:"Opsionale",photoAdd:"Shto një foto",photoSource:"Nga telefoni ose kamera",photoChange:"Ndrysho",photoRemove:"Hiq",photoUploading:"Po ngarkohet...",photoError:"Fotoja nuk u ngarkua. Provo prapë.",partyQuestion:"Për sa persona vlen?",partyHint:"Zgjidh për çfarë madhësie të grupit vlen oferta.",partyAll:"Të gjithë",categoryQuestion:"Kur të shfaqet oferta?",categoryHint:"Zgjidh kur kjo ofertë i përshtatet kërkimit të klientit.",ifFood:"Nëse kërkohet ushqim",ifDrinks:"Nëse kërkohet kafe / pije",scheduleQuestion:"Kur vlen oferta?",scheduleHint:"Zgjidh kur klientët mund ta përdorin ofertën.",always:"Gjithmonë",specificHours:"Orar specifik",daysQuestion:"Ditët",hoursQuestion:"Orari",hoursFrom:"Nga",hoursTo:"Deri",limitsTitle:"Kufijtë",slotGroups:"Grupe për 30 min",slotGuests:"Mysafirë për 30 min",dailyGroups:"Grupe në ditë",totalRedemptions:"Sa herë gjithsej",noLimit:"0 = pa kufi",paused:"Pauzuar",archived:"Arkivuar",archive:"Arkivo",noBookings:"Ende asnjë klient sot.",noHistory:"Ende asnjë histori.",loading:"Po ngarkohet...",guestName:"Mnyra Guest",around:"Rreth",finalize:"Finalizo",needsActivation:"Klienti duhet ta aktivizojë ofertën.",search:"Kërko",codePlaceholder:"Kodi i klientit",codeNotFound:"Kodi nuk u gjet.",codeRetry:"Provo përsëri.",activateTitle:"Aktivizo ofertën",activateHint:"Shkruaj kodin ose skano QR-në.",scanQr:"Skano QR-në",cameraClose:"Mbyll kamerën",cameraDenied:"Lejo kamerën për të skanuar QR-në.",cameraFailed:"Kamera nuk mund të hapej. Përdor kodin.",finalizeFailed:"Finalizimi dështoi. Provo përsëri.",partyAtTable:"Sa persona?",partyLess:"Një person më pak",partyMore:"Një person më shumë",dealCode:"Oferta",personOne:"person",personMany:"persona",commission:"Provizioni",keepsRunning:"Rezervimet ekzistuese mbeten. Vetëm të rejat ndalen.",onlyBusiness:"Ky funksion eshte vetem per profile biznesi.",loadingBusiness:"Biznesi po ngarkohet..."});function We({className:e="",label:t="",attrs:a="",deps:n={}}={}){const r=n.escapeHtml;return`
    <button type="button" ${a} class="${e}" data-go-phase="idle">
      <span class="go-sign__label">${o(r,t)}</span>
      <span class="go-sign go-sign--ring" aria-hidden="true"><span class="go-sign__ring"></span></span>
      <span class="go-sign go-sign--check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg>
      </span>
      <span class="go-sign go-sign--cross" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </span>
    </button>
  `}function o(e,t=""){return typeof e=="function"?e(t):String(t??"")}function R(e,t="",a="w-4 h-4"){return typeof e=="function"?e(t,a):""}function Ue(e=""){const t=Date.parse(String(e||""));if(!Number.isFinite(t))return"";const a=new Date(t);return`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Ot({enabled:e=!1,unseenCount:t=0,activeOffers:a=0,todayBookings:n=0,iconFn:r=null,texts:s={}}={}){if(!e)return"";const h={...i,...s||{}},l=Math.max(0,Math.trunc(Number(t)||0)),p=a>0||n>0,_=p?`${a} oferta aktive · ${n} rezervime sot`:h.cardIdle;return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-go-business-card data-nav="gobiznes">
      <span class="mnyra-dash__composer-title">
        <span class="mnyra-dash__composer-accent">Mnyra</span> GO
        ${l>0?`<span class="mnyra-dash__composer-badge" aria-label="${l} ${h.statNew}">${l}</span>`:""}
      </span>
      <span class="mnyra-dash__composer-sub">${_}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${R(r,"zap","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${p?h.cardManage:h.emptyAction}</span>
        <span class="mnyra-dash__composer-cta-chevron">${R(r,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const Tt=`
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

     Und es ist dieselbe Hoehe wie im Paneli, weil an der Hoehe dieser Reihe
     der Anfang des Benkos haengt: Mit 210 hier und 228 dort fing das Benko in
     GO 18 Punkte hoeher an, obwohl der Abstand darueber auf beiden Seiten
     stimmte.

     Der Inhalt steht darin unveraendert von oben nach unten - Zeitraum und
     Symbol, die Zahl, der Titel, die Beschreibung. Die 18 Punkte mehr sind
     Luft am Fuss der Karte: Der laengste Satz auf dem schmalsten Telefon
     ("Oferta te perdorura dhe verifikuara ne lokal.") braucht auf 320px vier
     Zeilen und stoesst damit nicht mehr an die Kante. */
  height: var(--work-card-height);
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
/* Die Ueberschrift der Seite stand hier - der Name mit dem Lokal darunter,
   .go-title/.go-title-sub im .go-head__brand. Sie ist weg, weil sie doppelt
   war: Das Wortlogo steht jetzt im globalen Kopf. Ihr Blatt geht mit; eine
   Regel ohne Knoten ist kein Blatt, sondern eine Fussnote. */
.go-pause { min-height: 44px; }
/* Aktivizo - die Arbeitskarte des Kellners.

   Eine sehr helle Flaeche, kein dunkles Navy mehr. Das Navy machte die Karte
   zum lautesten Ding der Seite - unter einer weissen Pillen-Leiste, auf einem
   weissen Benko, neben weissen Listen stand ein schwarzer Block. Jetzt traegt
   die Karte ihr Gewicht ueber die Groesse und nicht ueber die Farbe: eine
   Flaeche einen Hauch violett-weiss (#f7f7ff) auf dem weissen Benko, dazu eine
   Haarlinie (#e4e4f4) und sonst nichts. Kein Schlagschatten - er machte auf
   einer so hellen Flaeche nur Schmutz.

   Die Haarlinie liegt als INNERER Schatten und nicht als Rand: Ein Rand
   umschlosse auch das Kamerabild, und dann laege ein Bild IN einem Rahmen
   statt dass die Karte das Bild waere. Ein innerer Schatten wird unter den
   Kindern gezeichnet - die Kamera deckt ihn zu, das Codefeld laesst ihn
   stehen. Und weil er nichts am Kastenmodell aendert, sind beide Zustaende
   weiter auf den Punkt gleich gross.

   EINE Hoehe fuer beide Zustaende, und das ist der ganze Trick an der
   Verwandlung: Codefeld und Kamera stehen im selben Rahmen, an derselben
   Stelle, mit derselben Rundung. Es wird nichts groesser und nichts kleiner -
   deshalb springt beim Wechsel auch nichts, weder in der Karte noch darunter.
   Vorher wanderte die Hoehe (139 auf 256 Punkte) und musste von Hand
   animiert werden; das ist mit dieser einen Zahl erledigt.

   "overflow: hidden" schneidet das Kamerabild auf genau diese Rundung - das
   Bild braucht deshalb keinen eigenen Rahmen und keinen eigenen Radius. */
/* ------------------------------------------------------------------------
   Die Form der GO-Arbeitskarten - EINMAL, fuer alle.

   Zwei Reiter zeigen Karten: Aktivizo die Arbeitskarte des Kellners,
   "Në pritje" die wartenden Ofertat. Beide standen mit eigenen Zahlen da -
   28 Punkte Rundung hier, 1.6rem dort; 20 Punkte Polster hier, 18 dort. Beim
   Wechsel zwischen den beiden Reitern sah man das: zwei Karten, die
   offensichtlich nicht aus derselben Werkstatt kamen.

   Jetzt steht die GEOMETRIE an EINER Stelle, und beide Karten lesen daraus.
   Wer die Formsprache von MNYRA GO aendert, aendert sie hier - und beide
   Reiter gehen mit, ohne dass jemand daran denken muss.

     --go-card-height   die Grundhoehe. Es ist die Hoehe der kompakten
                        Aktivizo-Karte (ihr "face"-Zustand): Aktivizo SETZT
                        sie, "Në pritje" nimmt sie als Mindestmass.
     --go-card-radius   die Rundung. Sie steht zwischen den Karten der Reihe
                        (20) und dem Benko darunter (40) und gehoert damit in
                        dieselbe Familie.
     --go-card-pad      das Polster. Auf dem schmalsten Telefon ruecken die
                        Seiten enger zusammen - die Marke geht den Weg mit,
                        also beide Karten.
     --go-card-gap      der Abstand ZWISCHEN zwei Karten. Er steht hier und
                        nicht an der Liste, damit "Në pritje" und "Finalizuar"
                        ihn nicht getrennt pflegen.

   Die FARBEN stehen hier bewusst NICHT.

   Aktivizo ist eine Arbeitskarte: eine, an der etwas passiert, und sie traegt
   deshalb den Hauch Violett der Marke (#f7f7ff). "Në pritje" ist eine Liste,
   die man liest - sie steht im kuehlen Off-White des uebrigen Interfaces
   (#f8fafc). Es ist derselbe Rahmen, aber nicht dieselbe Aufgabe, und genau
   das darf man sehen. Jede der beiden Karten haelt ihre zwei Farben deshalb
   selbst.

   Die Haarlinie liegt an BEIDEN als innerer Schatten und nicht als Rand - das
   ist wieder Geometrie und keine Farbe. In Aktivizo, weil ein Rand auch das
   Kamerabild umschloesse (siehe unten), und in "Në pritje", damit die Kante
   auf den Punkt dieselbe ist: Ein Rand nimmt dem Polster innen seinen Punkt,
   ein innerer Schatten nicht. Zwei Karten, deren Inhalt um einen Punkt
   verschoben steht, sehen nicht wie eine Familie aus.
   ------------------------------------------------------------------------ */
.mnyra-work {
  --go-card-height: 184px;
  --go-card-radius: 28px;
  --go-card-pad: 20px;
  /* Deutlich mehr als ein Rand und deutlich weniger als ein Absatz: Jede
     Oferta ist ein eigener Vorgang und soll auch als einer gelesen werden -
     eine Liste, deren Karten sich beruehren, liest sich als EINE geteilte
     Flaeche. */
  --go-card-gap: 16px;
}
/* Der Anlauf unter der Pillen-Leiste.

   Die gemeinsame Geometrie gibt 44 Punkte vor (--work-bento-lead), und das ist
   im Paneli richtig: Dort steht darunter eine Ueberschrift, kein Inhalt. In GO
   faengt sofort die Arbeit an - die Karte des Kellners oder die Liste der
   Vorgaenge -, und 44 Punkte rissen sie von der Leiste ab, die sie ausgewaehlt
   hat.

   Der Wert steht an EINER Stelle und gilt fuer ALLE Reiter: Wer zwischen
   "Në pritje", "Aktivizo" und "Finalizuar" wechselt, soll den Inhalt auf
   derselben Hoehe wiederfinden. Ein Reiter, der seinen Anfang selbst
   bestimmt, laesst die Seite bei jedem Wechsel springen. Das Paneli behaelt
   dabei seine 44 - ueberschrieben wird nur hier. */
.go-bento { --work-bento-lead: 20px; }
/* Auf dem schmalsten Telefon ist die Karte 272 Punkte breit, und jeder Punkt
   Seitenpolster fehlt drinnen dem Inhalt. Dieselbe Schwelle wie bei den
   Pillen, damit die Seite an EINER Stelle schmal wird und nicht an dreien. */
@media (max-width: 359px) {
  .mnyra-work { --go-card-pad: 18px 16px; }
}
.go-activate {
  /* DREI Hoehen, eine je Zustand - und die Karte faehrt zwischen ihnen.

     Vorher stand hier eine einzige Zahl fuer alle drei Schichten. Das machte
     den Wechsel sprungfrei, kostete aber genau das, was eine Karte mit einem
     Codefeld darin nicht braucht: 160 Punkte Leere unter dem Feld, damit
     spaeter vielleicht eine Buchung hineinpasst. Die Karte war immer so
     gross wie ihr groesster Zustand.

     Jetzt ist sie so gross wie ihr JETZIGER Zustand und faehrt die Aenderung
     mit. Das ist kein Sprung, sondern die Bewegung selbst: Es ist dieselbe
     Karte, die aufgeht und wieder zugeht.

       face  Ueberschrift, Satz, Codefeld - und nichts darunter.
       cam   das Kamerabild, so gross, dass ein QR bequem hineinpasst.
       done  Kopf, Angebot, Linie, Personenwahl, Knopf.

     Die Zahlen sind ausgerechnet und nicht gemessen: Jede ist die Summe der
     Stuecke ihrer Schicht plus dem Polster. Gemessen wuerde heissen, nach dem
     Zeichnen noch einmal ranzugehen - und das sieht man, weil die Karte dann
     zweimal aussieht. */
  /* Die kompakte Hoehe ist die gemeinsame Grundhoehe der GO-Karten - dieselbe
     Zahl, auf der auch eine wartende Oferta steht. Sie steht deshalb nicht
     mehr hier, sondern oben an --go-card-height. */
  --go-activate-h-face: var(--go-card-height);
  --go-activate-h-cam: 288px;
  --go-activate-h-done: 364px;
  --go-activate-height: var(--go-activate-h-face);
  /* Die Bewegung: ruhig heraus, nichts federt zurueck. */
  --go-activate-ease: cubic-bezier(.2, .8, .2, 1);
  /* Die Farben der Karte stehen an EINER Stelle - die Flaeche, die Linie, die
     Schrift, der ruhige Ton darunter und das Violett der Marke, in dem hier
     genau die Sachen stehen, die etwas tun. */
  --go-activate-surface: #f7f7ff;
  --go-activate-line: #e4e4f4;
  --go-activate-ink: #0f172a;
  --go-activate-ink-soft: #64748b;
  --go-activate-accent: #4f46e5;
  --go-activate-accent-soft: #eef2ff;
  position: relative;
  overflow: hidden;
  height: var(--go-activate-height);
  /* Die Hoehe faehrt eine Spur laenger als der Inhalt darin (280ms): So ist
     die Karte das Letzte, was zur Ruhe kommt - es sieht aus, als haette der
     Inhalt sie aufgeschoben, und nicht, als waere er in ein fertiges Loch
     gefallen.

     Zwischen zwei festen Zahlen und nicht nach "auto": "auto" hat keinen
     Wert, auf den ein Uebergang zielen koennte - Safari springt dann hart.
     Deshalb stehen die drei Zahlen oben. */
  transition: height 300ms var(--go-activate-ease);
  padding: 0;
  border-radius: var(--go-card-radius);
  background: var(--go-activate-surface);
  box-shadow: inset 0 0 0 1px var(--go-activate-line);
}
/* Welcher Zustand welche Hoehe nimmt. Die drei Regeln schliessen einander
   aus - eine offene Kamera bleibt eine offene Kamera, egal was der Zustand
   sonst noch weiss, und die Buchung zieht nur, wenn die Kamera zu ist.

   Genau daran haengt der Weg vom erkannten QR zur Buchung: Wer beide
   Attribute im selben Zug setzt (Kamera zu, Buchung da), faehrt von der
   Kamerahoehe direkt auf die der Buchung - ohne den Umweg ueber die kleine
   Karte dazwischen.

   Steht in der Eingabemaske eine Zeile unter dem Feld (ein Code, der nichts
   fand; eine Kamera, die nicht aufging), waechst die Karte um genau diese
   Zeile. Sie schiebt damit, was unter ihr steht - aber sie quetscht nichts,
   und sie haelt keine leere Zeile fuer den Fall bereit, dass mal etwas
   schiefgeht. */
.go-activate[data-go-camera="0"][data-go-found="0"][data-go-note="1"] {
  --go-activate-height: calc(var(--go-activate-h-face) + 26px);
}
.go-activate[data-go-camera="1"] { --go-activate-height: var(--go-activate-h-cam); }
.go-activate[data-go-camera="0"][data-go-found="1"] { --go-activate-height: var(--go-activate-h-done); }
/* Die zwei Schichten liegen deckungsgleich im selben Rahmen. Sichtbar ist
   immer genau eine; die andere ist weg - unsichtbar, unantastbar und auch fuer
   die Sprachausgabe nicht da (visibility, nicht nur opacity). */
.go-activate__face,
.go-activate__cam,
.go-activate__done {
  position: absolute;
  inset: 0;
}
/* Aufmachen: der Inhalt geht in 120ms und sinkt dabei eine Spur weg
   (scale 0.985), die Kamera kommt direkt danach und setzt sich aus einer
   Spur zu gross auf (1.015 -> 1). Zusammen 240ms.

   Die Zeiten stehen an den Zielzustaenden, nicht an den Schichten: Eine
   Regel gilt genau dann, wenn IHR Zustand erreicht wird - so laeuft das
   Schliessen von selbst rueckwaerts, mit seinen eigenen Zeiten. */
.go-activate[data-go-camera="1"] .go-activate__face {
  opacity: 0;
  transform: scale(0.985);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 120ms var(--go-activate-ease) 0s,
    transform 120ms var(--go-activate-ease) 0s,
    visibility 0s linear 240ms;
}
.go-activate[data-go-camera="1"] .go-activate__cam {
  opacity: 1;
  transform: scale(1);
  visibility: visible;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Zumachen: dieselbe Bewegung rueckwaerts. Die Kamera geht in 120ms und
   waechst dabei die Spur zurueck, die sie beim Kommen verloren hat; der
   Inhalt kommt direkt danach. Zusammen 220ms.
   Genau diese Bewegung nimmt spaeter auch ein erkannter Code: Er setzt
   dasselbe Attribut, und der Rest steht hier. */
.go-activate[data-go-camera="0"] .go-activate__cam {
  opacity: 0;
  transform: scale(1.015);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 120ms var(--go-activate-ease) 0s,
    transform 120ms var(--go-activate-ease) 0s,
    visibility 0s linear 220ms;
}
.go-activate[data-go-camera="0"] .go-activate__face {
  opacity: 1;
  transform: scale(1);
  visibility: visible;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Wer Bewegung abbestellt hat, bekommt den Wechsel ohne sie: die Kamera steht
   dann sofort da. */
@media (prefers-reduced-motion: reduce) {
  .go-activate,
  .go-activate__face,
  .go-activate__cam,
  .go-activate__done { transition: none !important; }
}
/* Ueberschrift und Satz stehen oben links, das Feld darunter in der Mitte -
   und was danach noch frei ist, bleibt frei.

   Die Karte liest damit von oben nach unten: erst wer sie ist, dann was zu
   tun ist. Vorher stand alles zusammen in der Mitte, mit gleich viel Luft
   darueber wie darunter - das war ruhig, aber es hatte keinen Anfang. Die
   Flaeche unter dem Feld ist Absicht und kein Rest: Sie gibt der Karte den
   Atem, den eine Flaeche braucht, auf der gleich ein Kamerabild steht, und
   sie ist genau der Platz, in dem die Zeile unter dem Feld erscheint, wenn
   ein Code nichts fand. */
.go-activate__face {
  display: flex;
  flex-direction: column;
  padding: var(--go-card-pad);
}
.go-activate__title {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.2;
  color: var(--go-activate-ink);
}
.go-activate__hint {
  margin: 5px 0 0;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--go-activate-ink-soft);
}
/* Das Codefeld - EIN Bedienteil und nicht drei nebeneinander.

   Es ist eine breite weisse Leiste, in der links der Code steht und rechts
   die beiden Knoepfe sitzen: 78 Punkte hoch, weich gerundet, mit Polster an
   beiden Enden. Vorher war es eine gut 50 Punkte hohe Kapsel, in der drei
   Sachen aneinanderklebten; die Hoehe ist der ganze Unterschied zwischen "da
   ist ein Eingabefeld" und "hier wird gearbeitet".

   Die Knoepfe stehen IM Feld und nicht daneben. Der Kellner sieht eine
   Handlung: Code herein - und zwei Wege, ihn hereinzubekommen. */
.go-activate__row {
  /* Der Abstand zur Ueberschrift steht hier und nicht als Luecke am Block:
     Eine Luecke traefe auch die zwei Zeilen darueber und risse Titel und Satz
     auseinander, die zusammengehoeren.

     Es ist wieder eine feste Zahl, und das ist der Punkt an der kompakten
     Karte: Unter dem Feld kommt nichts mehr, also endet die Schicht dort.
     Was die Karte frueher an Leere darunter trug, traegt sie jetzt gar
     nicht - sie waechst erst, wenn wirklich etwas hineinkommt. */
  margin-top: 20px;
  /* Die Leiste behaelt ihre Hoehe, egal was in der Karte sonst noch steht.
     Ohne das schruempfte sie als Flex-Kind, sobald die Zeile unter ihr zwei
     Zeilen lang wird - und genau dann waere sie gequetscht. */
  flex: 0 0 auto;
  height: 78px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid var(--go-activate-line);
  /* Weich gerundet, nicht ganz rund: Eine Kapsel von 78 Punkten Hoehe waere
     an den Enden ein Halbkreis von 39 Punkten und liesse die Knoepfe darin
     schief sitzen. 24 traegt die Rundung der Karte (28) nach innen weiter. */
  border-radius: 24px;
  background: #ffffff;
}
/* Das Feld faerbt seinen Rand, wenn der Kellner darin tippt. */
.go-code-box:focus-within { border-color: #818cf8; }
.go-activate__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 54px;
  /* Zusammen mit dem Polster der Leiste (10) stehen 24 Punkte zwischen der
     Kante der Leiste und der Schrift darin. */
  padding: 0 4px 0 14px;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: 900;
  /* Ein Code liest sich in Bloecken - aber nur der Code. Die Laufweite gilt
     deshalb dem Getippten und nicht dem Platzhalter, der sonst breiter waere
     als das Feld auf einem 320er Telefon. */
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--go-activate-ink);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}
.go-activate__input::placeholder {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  color: #94a3b8;
}
.go-activate__go,
.go-activate__qr {
  flex: 0 0 auto;
  /* Beide gleich hoch, beide fingergross: Sie stehen nebeneinander in einer
     Leiste, und zwei verschiedene Hoehen darin saehen aus wie ein Fehler.
     54 Punkte lassen oben und unten je 11 Punkte Luft in der Leiste - die
     Knoepfe sitzen darin und stossen nicht an. */
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  /* Weniger rund als die Leiste (24), und deutlich runder als eckig: Ein
     Knopf, der genauso rund waere wie sein Behaelter, sieht darin verkantet
     aus, und ein eckiger sieht hineingelegt aus. */
  border-radius: 17px;
  font: inherit;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.15s ease;
}
/* Der Handgriff der Karte im Navy der Marke. Er steht als Wort da und nicht
   in Grossbuchstaben: "Aktivizo" ist der Name der Handlung, kein Schild.

   Dasselbe Navy traegt der Abschluss unten in der dritten Schicht: Es sind
   die beiden Handgriffe des Kellners, und beide sollen sich gleich anfuehlen.
   Das Violett bleibt dem QR-Knopf und dem Zaehler - den Sachen, die
   danebenstehen. */
.go-activate__go {
  padding: 0 16px;
  background: var(--go-activate-ink);
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}
/* Waehrend gesucht wird, aendert sich am Knopf KEINE Zahl. Frueher stand hier
   ein laengeres Wort, solange gesucht wurde, und ein engeres Polster, das
   Differenz auffing - der Knopf wurde beim Druecken schmaler und das Feld
   daneben breiter. Jetzt bleibt das Wort stehen und wird nur unsichtbar; was
   arbeitet, liegt darueber. Also bleibt auch das Polster. */
.go-activate__go[disabled] { cursor: default; }
/* Und der QR-Knopf daneben ruhig: hell, mit dem Violett nur im Zeichen. Zwei
   volle Farbflaechen nebeneinander haetten beide gleich laut gemacht. Er ist
   auch schmaler als der Handgriff - der zweite Weg soll als der zweite
   lesen. */
.go-activate__qr {
  /* Breiter als hoch waere zu viel, quadratisch war zu wenig: Bei 58 Punkten
     steht das Zeichen in einer Flaeche, die man als Knopf liest, und der
     Handgriff daneben bleibt trotzdem der breitere von beiden - der zweite
     Weg soll als der zweite lesen. */
  width: 58px;
  background: #eef2ff;
  color: #4f46e5;
}
.go-activate__go:active,
.go-activate__qr:active { transform: scale(0.96); }
.go-activate__qr svg,
.go-activate__qr i {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  display: block;
}
/* Die eine Zeile unter dem Feld - der Code, der nichts fand, oder die Kamera,
   die nicht aufging. Sie steht in der freien Flaeche unter dem Feld und
   schiebt nichts: Auf der hellen Karte traegt sie ein Rot, das lesbar ist
   (#e11d48); das Rosa von vorher war fuer das dunkle Navy gewaehlt und
   verschwaende hier fast. */
/* Die Zeile unter dem Feld. Sie steht immer im Aufbau und ist nur dann zu
   sehen, wenn die Karte sagt, dass es etwas zu sagen gibt - dieselbe Marke,
   an der auch die Hoehe der Karte haengt. So kostet eine Fehlermeldung kein
   Neuzeichnen: Der Satz kommt in den Knoten, das Attribut kommt an die Karte,
   und der getippte Code bleibt unangetastet im Feld stehen. */
.go-activate__status {
  margin: 0 4px;
  height: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.35;
  color: #e11d48;
  transition: opacity 140ms var(--go-activate-ease);
}
.go-activate[data-go-note="1"] .go-activate__status {
  margin-top: 12px;
  height: auto;
  opacity: 1;
}
/* Der Kamera-Zustand. Das Bild IST die Karte: es fuellt sie ganz aus, ohne
   Polster und ohne eigenen Rahmen - die Rundung schneidet die Karte selbst.
   Ein Navy-Rand darum haette ausgesehen, als laege ein Bild AUF der Karte
   statt dass die Karte das Bild waere. */
/* Das Bild ist unsichtbar, bis Masse da sind und play() durch ist. Die
   Flaeche darunter steht die ganze Zeit in ihrer Endgroesse - es wartet also
   nichts auf das Bild, es wird nur ausgefuellt. Ohne das saehe man erst ein
   leeres Feld und dann kurz ein hochkantes Video, das sich zurechtrueckt. */
.go-activate[data-go-cam-ready="1"] .go-activate__cam-view { opacity: 1; }
.go-activate__cam-view {
  opacity: 0;
  transition: opacity 140ms var(--go-activate-ease);
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background: #000000;
  object-fit: cover;
}
.go-activate__cam-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgb(15 23 42 / 0.55);
  color: #ffffff;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.15s ease;
}
.go-activate__cam-close:active { transform: scale(0.95); }
.go-activate__cam-close svg,
.go-activate__cam-close i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
/* ==========================================================================
   Die gefundene Buchung - die dritte Schicht derselben Karte.

   Sie steht an derselben Stelle, in denselben Aussenmassen und mit derselben
   Rundung wie die Eingabemaske: Der Kellner tippt einen Code, und die Karte
   VERWANDELT sich, statt eine zweite Karte unter sich aufzumachen. Deshalb
   gibt es hier auch keinen eigenen Rahmen, keinen eigenen Grund und keinen
   eigenen Schatten - eine Karte in einer Karte waere genau das, was hier
   verschwinden sollte.
   ========================================================================== */
/* Ruhe heisst: weg. Diese Regel ist zugleich die Bewegung nach draussen -
   sie gilt in dem Augenblick, in dem data-go-found wieder auf "0" steht.
   Der Weg ist kurz (8 Punkte nach unten) und nur ein Hauch; es soll aussehen
   wie eine Seite, die weiterblaettert, nicht wie ein Fenster, das zufaellt. */
.go-activate__done {
  display: flex;
  flex-direction: column;
  /* Oben und unten mehr als an den Seiten - wie in der Eingabemaske. An den
     Seiten zaehlt jeder Punkt: Was das Polster nimmt, fehlt drinnen dem
     Knopf, der Frage und dem Zaehler, und auf einem 360er Telefon
     entscheidet das darueber, ob Frage und Zaehler nebeneinander passen. */
  padding: 24px 18px;
  opacity: 0;
  transform: translateY(8px);
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 110ms var(--go-activate-ease) 0s,
    transform 110ms var(--go-activate-ease) 0s,
    visibility 0s linear 220ms;
}
/* Und da: Die Buchung kommt herein, nachdem die Eingabemaske gegangen ist
   (90ms Verzug, 150ms) - zusammen 240ms. Dieselbe Kurve wie bei der Kamera,
   damit die Karte nur EINE Art hat, sich zu verwandeln.

   "data-go-camera=0" steht mit im Wahlspruch, damit diese Regel eine offene
   Kamera nicht ueberstimmt: Das Bild bleibt das Bild, egal was der Zustand
   sonst noch weiss. */
.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__done {
  opacity: 1;
  transform: translateY(0);
  visibility: visible;
  pointer-events: auto;
  transition:
    opacity 160ms var(--go-activate-ease) 120ms,
    transform 160ms var(--go-activate-ease) 120ms,
    visibility 0s linear 0s;
}
/* Die Eingabemaske geht dafuer weg - nur weg, ohne sich zu bewegen. Die
   Bewegung gehoert der Schicht, die kommt; zwei Schichten, die gleichzeitig
   wandern, sehen aus wie ein Ruck. Zurueck kommt sie ueber die Regel, die
   schon fuer die Kamera dasteht (120ms mit 100ms Verzug). */
.go-activate[data-go-camera="0"][data-go-found="1"] .go-activate__face {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 110ms var(--go-activate-ease) 0s,
    visibility 0s linear 240ms;
}
/* Der Kopf: links die Beschriftung mit dem Code darunter, rechts die Gruppe.
   Er sitzt oben und haelt seine Hoehe fest - was darunter atmet, ist das
   Angebot. */
.go-activate__done-head {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
/* Die linke Haelfte: zwei Zeilen, die zusammengehoeren. "min-width: 0" ist
   der Grund, warum ein langer Code die Pille daneben nicht aus der Karte
   schiebt - ohne das waere die Spalte so breit wie ihr laengstes Wort. */
.go-activate__done-id {
  min-width: 0;
}
/* "OFERTA" - ein Schild und kein Wert: klein, in Grossbuchstaben, mit Luft
   zwischen den Buchstaben und im ruhigen Ton. */
.go-activate__done-label {
  margin: 0;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.2;
  color: var(--go-activate-ink-soft);
  white-space: nowrap;
}
/* Der Code, wie ihn der Kellner gerade eingetippt hat. Er steht gross und
   ohne Kasten da: Ein Rahmen um einen Code sagt "Feld", und hier ist nichts
   mehr einzugeben. Die Laufweite ist die des Codefeldes darueber - derselbe
   Code soll sich in beiden Schichten gleich lesen. */
.go-activate__done-code {
  margin: 3px 0 0;
  /* Kleiner als das Angebot in der Mitte, und das mit Absicht: Der Code ist
     die Quittung dafuer, dass die richtige Buchung gefunden wurde - was der
     Gast bekommt, steht darunter. Waeren beide gleich gross, laesen sie sich
     als zwei gleich wichtige Sachen. */
  font-size: 19px;
  font-weight: 900;
  letter-spacing: 0.05em;
  line-height: 1.15;
  color: var(--go-activate-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* Die Gruppe, mit der der Gast gekommen ist - eine kleine weisse Pille, die
   auf der hellen Karte liegt. Sie ist eine Auskunft und kein Knopf: keine
   Farbe, kein Schatten, nur eine Haarlinie. */
.go-activate__done-party {
  flex: 0 0 auto;
  margin: 0;
  padding: 8px 15px;
  border: 1px solid var(--go-activate-line);
  border-radius: 999px;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  white-space: nowrap;
  color: var(--go-activate-ink);
}
/* Das Angebot. Es ist der groesste Bereich der Karte: Es nimmt den ganzen
   Platz, den Kopf, Linie, Gruppe und Knopf uebrig lassen - rund 100 Punkte -
   und mindestens 72. Damit steht ein kurzes "-10%" und ein langes Paket
   gleich weit von der Kante des Kopfes und von der Linie entfernt, und die
   Zeilen darunter wandern nicht, wenn das naechste Angebot eine Zeile
   kuerzer ist.

   Der Abstand nach oben steht hier: Der Kopf ist eine Beschriftung, das
   Angebot ist der Inhalt - sie sollen nicht aneinanderkleben. Nach unten
   macht die Linie ihren eigenen Abstand.

   "margin: auto 0" am Text statt "justify-content: center" am Bereich: Beim
   Zentrieren ueber die Ausrichtung schneidet ein ueberlanger Text oben ab und
   ist dann nicht mehr erreichbar; automatische Aussenabstaende geben in dem
   Fall von selbst nach. Was dann noch laenger ist als der Platz, bleibt
   erreichbar - abgeschnitten wird nichts. */
.go-activate__deal {
  flex: 1 1 auto;
  min-height: 72px;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
}
/* Der Mittelpunkt der Karte: mittig, gross, ohne Kasten und ohne Rahmen. Die
   Groesse kommt als Stufe von aussen (goDealTextSize) - "xl" ist die kurze
   Zusage, "sm" der lange Satz. Hier steht die groesste; die drei anderen
   nehmen sie zurueck. */
.go-activate__deal-text {
  margin: auto 0;
  text-align: center;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--go-activate-ink);
  /* Ein Produktname ohne Leerzeichen soll umbrechen und nicht seitwaerts aus
     der Karte laufen. */
  overflow-wrap: anywhere;
}
.go-activate__deal[data-go-deal="lg"] .go-activate__deal-text {
  font-size: 24px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.go-activate__deal[data-go-deal="md"] .go-activate__deal-text {
  font-size: 19px;
  letter-spacing: -0.01em;
  line-height: 1.3;
}
.go-activate__deal[data-go-deal="sm"] .go-activate__deal-text {
  font-size: 16px;
  letter-spacing: -0.005em;
  line-height: 1.35;
}
/* Steht eine Meldung ueber dem Knopf, nimmt sie ihren Platz aus dem
   Angebotsbereich: Der bleibt dann eben kuerzer als seine Mindesthoehe, statt
   dass der Knopf unten aus der Karte geschoben wird. Der Text ist weiter
   ganz da - der Bereich rollt. */
.go-activate[data-go-note="1"] .go-activate__deal { min-height: 0; }
/* Die Trennlinie zwischen dem Angebot und dem, was damit zu tun ist. Eine
   Haarlinie im Ton der Karte, ueber fast die ganze Breite - dunkler waere sie
   ein Strich, und ein Strich teilte die Karte in zwei Karten. */
.go-activate__rule {
  flex: 0 0 auto;
  height: 1px;
  margin: 22px 2px;
  background: var(--go-activate-line);
}
/* Die Frage und der Zaehler. Sie stehen nebeneinander, solange sie
   nebeneinander passen - und sobald nicht, bricht die Zeile um und der
   Zaehler steht rechts darunter ("margin-left: auto" haelt ihn dort). Die
   Frage wird dabei weder kleiner noch abgeschnitten: Sie ist die Frage, die
   der Kellner beantwortet. */
.go-activate__party {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 12px;
}
.go-activate__party-label {
  /* 145 Punkte sind die Schwelle, an der die Zeile umbricht: Darunter passt
     der Zaehler (142) mit seiner Luecke (12) nicht mehr daneben, und dann
     gehoert er unter die Frage statt in eine zu enge Zeile. */
  flex: 1 1 145px;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--go-activate-ink-soft);
  overflow-wrap: anywhere;
}
/* Der Zaehler: eine weisse Kapsel mit einer Haarlinie, darin zwei Griffe und
   die Zahl. Vorher stand dort ein nacktes Zahlenfeld - der Kellner musste
   hineintippen, und auf einem Telefon heisst das: Tastatur auf, Zahl weg,
   Karte halb verdeckt. */
.go-activate__stepper {
  flex: 0 0 auto;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 2px;
  height: 52px;
  /* Polster an den Enden, damit Minus und Plus nicht an der Kante der Kapsel
     kleben - sonst trifft ein Daumen am Rand daneben. */
  padding: 0 6px;
  border: 1px solid var(--go-activate-line);
  border-radius: 999px;
  background: #ffffff;
}
/* Minus und Plus sind fingergross (40 Punkte, also ueber der Schwelle, ab
   der ein Ziel auf dem Telefon sicher zu treffen ist) und tragen das Violett
   der Marke - sie sind das Einzige an dieser Zeile, das etwas tut. */
.go-activate__step {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--go-activate-accent);
  font: inherit;
  font-size: 21px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s ease, transform 0.15s ease;
}
.go-activate__step:active {
  background: var(--go-activate-accent-soft);
  transform: scale(0.92);
}
/* Die Zahl in der Mitte. Es ist unveraendert DASSELBE Feld wie vorher -
   dieselbe Marke, derselbe Typ, dieselben Grenzen; es hat nur seinen Rahmen
   an die Kapsel abgegeben. Die Pfeilchen, die ein Zahlenfeld von sich aus
   mitbringt, sind weg: Neben einem Minus und einem Plus waeren sie ein
   zweiter Zaehler im ersten. */
.go-activate__party-input {
  flex: 0 0 auto;
  width: 44px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 19px;
  font-weight: 900;
  line-height: 1;
  text-align: center;
  color: var(--go-activate-ink);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  -moz-appearance: textfield;
}
.go-activate__party-input::-webkit-outer-spin-button,
.go-activate__party-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
/* Der Knopf, an dem Geld entsteht: ueber die ganze Breite und im Violett der
   Marke - dasselbe, das auch "Aktivizo" in der Schicht davor traegt. Beide
   sind Handgriffe, und Handgriffe haben hier eine Farbe.

   Er steht als Wort da und nicht in Grossbuchstaben. Ein Schild in Versalien
   las sich lauter als das Angebot darueber, und das Angebot ist das, worum es
   geht. */
.go-activate__finalize {
  flex: 0 0 auto;
  margin-top: 20px;
  width: 100%;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  /* Eine Spur runder als vorher (18), damit die Rundung mit der Hoehe
     mitwaechst und der Knopf nicht kantiger wirkt, nur weil er groesser ist.
     Er bleibt damit zwischen dem Zaehler (rund) und der Karte (28). */
  border-radius: 20px;
  background: var(--go-activate-ink);
  color: #ffffff;
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.01em;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.go-activate__finalize:active { transform: scale(0.98); }
.go-activate__finalize[disabled] { cursor: default; }
/* ==========================================================================
   Ein Handgriff, der arbeitet, waehrend man ihn ansieht.

   Vier Zustaende an EINEM Attribut (data-go-phase), und in allen vieren ist
   der Knopf auf den Punkt gleich gross: Das Wort bleibt im Fluss und wird nur
   unsichtbar, die Zeichen liegen darueber und nehmen keinen Platz.
   ========================================================================== */
.go-activate__go,
.go-activate__finalize { position: relative; }
/* Das Wort geht nach oben weg - 4 Punkte, mehr nicht. Es soll aussehen, als
   traete es zur Seite, nicht als floege es davon. */
.go-sign__label {
  display: block;
  transition:
    opacity 120ms var(--go-activate-ease),
    transform 120ms var(--go-activate-ease);
}
[data-go-phase="busy"] > .go-sign__label,
[data-go-phase="done"] > .go-sign__label,
[data-go-phase="fail"] > .go-sign__label {
  opacity: 0;
  transform: translateY(-4px);
}
/* Die drei Zeichen liegen deckungsgleich ueber dem Wort. */
.go-sign {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms var(--go-activate-ease);
}
.go-sign svg {
  width: 18px;
  height: 18px;
  display: block;
}
/* Der Bogen: ein Ring, dem ein Stueck fehlt, und er dreht sich gleichmaessig.
   Kein grosser Spinner - er sitzt in einem Knopf und nicht auf einer Seite. */
.go-sign__ring {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-top-color: #ffffff;
  animation: go-sign-spin 720ms linear infinite;
}
@keyframes go-sign-spin { to { transform: rotate(360deg); } }
/* Die Zeichen kommen erst, nachdem das Wort weg ist (120ms Verzug). */
[data-go-phase="busy"] > .go-sign--ring,
[data-go-phase="done"] > .go-sign--check,
[data-go-phase="fail"] > .go-sign--cross {
  opacity: 1;
  transition: opacity 120ms var(--go-activate-ease) 120ms;
}
/* Und der Knopf faerbt sich kurz, wenn es schiefging - nur er, nicht die
   Karte darum. Der Kellner soll den Fehler dort sehen, wo er gedrueckt hat. */
[data-go-phase="fail"] { background: #e11d48 !important; }
/* Wer Bewegung abbestellt hat, bekommt die Zustaende ohne Fahrt: Das Zeichen
   steht sofort da, und der Bogen dreht sich nicht. */
@media (prefers-reduced-motion: reduce) {
  .go-sign,
  .go-sign__label { transition: none !important; }
  .go-sign__ring { animation-duration: 2400ms; }
}
/* Wenn der Abschluss nicht durchging. Die Zeile steht ueber dem Knopf, an dem
   es passiert ist, und nimmt ihren Platz aus dem Angebotsbereich darueber -
   der Knopf bleibt, wo er ist. */
/* Dieselbe Zeile im Abschluss, mit derselben Regel dahinter. */
.go-activate__done-status {
  flex: 0 0 auto;
  margin: 0 2px;
  height: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 10.5px;
  font-weight: 700;
  line-height: 1.35;
  color: #e11d48;
  transition: opacity 140ms var(--go-activate-ease);
}
.go-activate[data-go-note="1"] .go-activate__done-status {
  margin-top: 14px;
  height: auto;
  opacity: 1;
}
/* Und der Gast, der noch nicht gewischt hat: kein Knopf, ein Satz. Er steht
   unter der Linie, wo sonst die Frage und der Knopf stehen. */
.go-activate__wait {
  flex: 0 0 auto;
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.35;
  color: #b45309;
}
/* Auf den schmalsten Telefonen ruecken Karte, Leiste und Knoepfe enger
   zusammen. Bei 320 Punkten ist die Karte 272 breit, und was die Knoepfe an
   Breite nehmen, fehlt dem Platzhalter: "Kodi i klientit" stand dort sonst
   abgeschnitten da. Die Leiste bleibt dabei ueber 76 Punkte hoch - eng wird
   sie in der Breite, nicht in der Hoehe.
   Dieselbe Schwelle wie bei den Pillen, damit die Seite an EINER Stelle
   schmal wird und nicht an dreien. */
@media (max-width: 359px) {
  .go-activate__row { margin-top: 16px; height: 76px; gap: 5px; padding: 0 8px; border-radius: 22px; }
  .go-activate__input { height: 52px; padding-left: 12px; font-size: 13px; }
  .go-activate__input::placeholder { font-size: 11px; }
  .go-activate__go,
  .go-activate__qr { height: 52px; border-radius: 16px; }
  .go-activate__go { padding: 0 13px; font-size: 12px; }
  .go-activate__qr { width: 50px; }
  /* Und dieselbe Karte in ihrer dritten Schicht. Hier stehen Frage und
     Zaehler untereinander - 272 Punkte Kartenbreite reichen nicht fuer beide
     nebeneinander -, und diese zweite Zeile muss irgendwoher kommen: aus den
     Abstaenden, nicht aus der Hoehe. Die Karte ist hier genauso hoch wie
     ueberall, und das muss sie auch sein - es ist EINE Hoehe fuer alle drei
     Schichten, und daran haengt, dass beim Wechsel nichts springt.

     Enger wird sie an den Seiten und in den Abstaenden; das Angebot behaelt
     seine Groessen - es ist das, worum es geht. */
  .go-activate__done { padding: 20px 15px; }
  .go-activate__done-code { font-size: 18px; }
  .go-activate__done-party { padding: 7px 13px; font-size: 12px; }
  /* Hier stehen Frage und Zaehler untereinander, und diese zweite Zeile muss
     irgendwoher kommen: aus den Abstaenden, nicht aus der Hoehe. Die Karte
     ist hier genauso hoch wie ueberall, und das muss sie auch sein - es ist
     EINE Hoehe fuer alle drei Schichten. Das Angebot behaelt dabei seinen
     Platz; es ist das, worum es geht. */
  .go-activate__deal { margin-top: 14px; }
  .go-activate__rule { margin: 17px 2px; }
  .go-activate[data-go-note="1"] .go-activate__done-status { margin-top: 11px; }
  .go-activate__finalize { margin-top: 16px; height: 54px; }
}
/* ------------------------------------------------------------------------
   Die Buchungskarten: "Ne pritje" und "Finalizuar", direkt auf der Flaeche.

   In beiden Reitern stand eine Karte in einer Karte: aussen ein weisser
   Abschnitt mit Marke, Ueberschrift und Anzahl, darin die einzelnen
   Vorgaenge. Der Abschnitt sagte dreimal, wo man ist - die Pille darueber
   sagt es einmal. Also ist er weg, und unter den Pillen stehen die Vorgaenge
   selbst.

   Es ist EINE Karte fuer beide Reiter, und das ist keine Sparsamkeit: Es sind
   dieselben Buchungen, einmal bevor der Gast da war und einmal danach. Sie
   sollen deshalb auch gleich aussehen - gleiche Hoehe, gleiche Rundung,
   gleiches Polster, gleicher Aufbau. Was sie unterscheidet, ist zwei Farben,
   und die stehen unten als Abwandlung.

   Der Abstand nach oben kommt weiter von --work-bento-lead, dem Mass, mit dem
   im Paneli wie in GO alles unter der Leiste beginnt.
   ------------------------------------------------------------------------ */
/* Die Liste - EINE Regel fuer "Në pritje" und "Finalizuar".

   Sie stand hier schon, hat aber nie gewirkt: Direkt darueber im Blatt stand
   eine schliessende Klammer zu viel, und ein CSS-Parser verschluckt an so
   einer Stelle die naechste Regel ganz. Die Karten klebten deshalb
   aneinander - gemessen 0 Punkte Abstand -, obwohl hier ein Abstand stand.
   Vor dem Umbau traf es an derselben Stelle .go-booking-meta, deren Kommentar
   bis heute erklaert, warum die Angaben "aneinanderklebten". Es war immer
   dieselbe Klammer.

   Kein Trennstrich, keine negativen Margen, kein Ueberlappen: nur ein
   Abstand, der groesser ist als jeder Abstand INNERHALB einer Karte. */
.go-cards {
  display: grid;
  gap: var(--go-card-gap);
  min-width: 0;
}
/* EINE ruhige Flaeche je Vorgang - und derselbe Rahmen wie in Aktivizo.

   Grundhoehe, Rundung und Polster stehen als --go-card-* oben, dort, wo die
   Arbeitskarte des Kellners sie auch herholt. Hier steht keine einzige eigene
   Zahl dafuer: Wer zwischen den Reitern wechselt, soll dieselbe Karte sehen,
   und das geht nur, wenn es dieselben Zahlen sind.

   Die zwei Farben stehen als Marken an der Karte selbst, damit die Abwandlung
   darunter genau ZWEI Zeilen lang ist und nicht die halbe Karte noch einmal
   aufschreibt. Voreingestellt ist das Wartende - der haeufigere Fall.

   MINDESThoehe, keine feste: Eine normale Oferta steht genau so hoch wie die
   kompakte Aktivizo-Karte. Eine ungewoehnlich lange darf darueber
   hinauswachsen - lieber eine Karte, die aus der Reihe faellt, als ein
   Angebot, das der Kellner nicht zu Ende lesen kann. Deshalb steht hier
   min-height und nicht height. */
.go-bcard {
  /* "Në pritje": das kuehle Off-White des uebrigen Interfaces - nicht der
     violette Hauch der Arbeitskarte, und erst recht kein Violett. MNYRA GO
     traegt sein Violett in den Kennzahlen und in der gewaehlten Pille; eine
     Liste in derselben Farbe daruntergesetzt macht aus einem Akzent eine
     Wand. */
  --go-bcard-surface: #f8fafc;
  --go-bcard-line: #e7ebf4;
  display: flex;
  flex-direction: column;
  min-height: var(--go-card-height);
  padding: var(--go-card-pad);
  border-radius: var(--go-card-radius);
  background: var(--go-bcard-surface);
  /* Die Haarlinie liegt als innerer Schatten und nicht als Rand - genau wie
     an der Aktivizo-Karte. Ein Rand naehme dem Polster innen seinen Punkt und
     die zwei Karten stuenden um diesen Punkt verschoben. Kein Schlagschatten:
     Er machte auf einer so hellen Flaeche nur Schmutz. */
  box-shadow: inset 0 0 0 1px var(--go-bcard-line);
  min-width: 0;
}
/* "Finalizuar": derselbe Vorgang, nachdem der Gast da war.

   Die Karte ist bis auf die Farbe dieselbe - gleiche Hoehe, gleiche Rundung,
   gleiches Polster, gleiche Zeilen an denselben Stellen. Nur die Flaeche sagt,
   dass das hier vorbei ist: dasselbe Gruen, in dem GO schon "nichts offen"
   sagt (die Karte "Per pagese", wenn sie leer ist). Es ist also keine neue
   Farbe, sondern die, die in GO ohnehin fuer "erledigt" steht.

   Nur die Linie ist eine Spur heller als dort (#dcfce7 statt #bbf7d0, ein
   Schritt in derselben Familie): Auf EINER Karte ist die kraeftige Linie ein
   Akzent, unter einer ganzen Liste wird sie ein Muster. Der Abstand zwischen
   Flaeche und Linie ist damit derselbe wie an der wartenden Karte. */
.go-bcard--done {
  --go-bcard-surface: #f0fdf4;
  --go-bcard-line: #dcfce7;
}
/* Oben links die Zeit, oben rechts der Zustand. Beide auf einer Grundlinie -
   und der Zustand nach rechts, auch wenn links nichts steht. */
.go-bcard__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}
/* Die Zeit ordnet die Liste: Sie ist das Einzige, wonach ein Lokal sie lesen
   kann. Dunkel und klar, aber nicht so stark wie das Angebot darunter. */
.go-bcard__time {
  margin: 0;
  min-width: 0;
  font-size: 14.5px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  color: #0f172a;
  overflow-wrap: anywhere;
}
/* Der Zustand steht klein, in Versalien und ruhigem Blaugrau am Rand. Ein
   farbiges Abzeichen waere das Auffaelligste der Karte - und es ist die
   Auskunft, die am wenigsten sagt: In dieser Liste steht ohnehin nur, wer
   angenommen hat. */
.go-bcard__status {
  margin-left: auto;
  flex: 0 0 auto;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
  color: #64748b;
  white-space: nowrap;
}
/* Der Rumpf nimmt, was der Kopf uebriglaesst, und stellt seine zwei Zeilen
   mittig hinein.

   Damit steht der Inhalt nicht oben zusammengedrueckt mit einer leeren
   Flaeche darunter - die Hoehe der Karte wird benutzt, statt nur eingehalten
   zu werden. Waechst die Karte bei einer langen Oferta ueber ihre Grundhoehe
   hinaus, bleibt derselbe Aufbau: Der Rumpf ist dann so hoch wie sein Inhalt,
   und "mittig" ist schlicht "ganz". */
.go-bcard__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  /* Ein Mindestabstand zum Kopf, damit die zwei Zeilen bei einer gewachsenen
     Karte nicht an ihm kleben. */
  padding-top: 14px;
  min-width: 0;
}
/* Symbol links, Text rechts - und der Text bricht um, so oft er will. */
.go-bcard__line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  min-width: 0;
}
/* Die Groessen sagen die Reihenfolge, in der gelesen werden soll: Das
   Angebot ist das Groesste und Staerkste - es ist das, was der Kellner an den
   Tisch bringt. Die Zeit ordnet die Liste und steht knapp darunter, die
   Personenzahl gehoert dazu, der Zustand steht klein am Rand. Alle vier
   gleich stark waeren vier Zeilen, die man einzeln lesen muss. */
.go-bcard__line--party { font-size: 13px; }
.go-bcard__line--deal { font-size: 15px; }
/* Das Symbol steht in der Hoehe der ERSTEN Zeile, nicht in der Mitte des
   ganzen Blocks: Bei einem Angebot ueber drei Zeilen rutschte es sonst nach
   unten und zeigte auf nichts. Sein Kasten ist genau eine Zeile hoch (die
   Zeilenhoehe daneben), das Zeichen sitzt darin mittig - damit wandert es
   mit der Schriftgroesse mit, ohne dass irgendwo eine Zahl nachgezogen
   werden muss.

   Nur das Zeichen traegt Violett. Keine Flaeche darunter, kein Kreis, keine
   eigene kleine Karte. */
.go-bcard__icon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 1.45em;
  color: #4f46e5;
}
.go-bcard__icon svg,
.go-bcard__icon i {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  display: block;
}
.go-bcard__text {
  min-width: 0;
  line-height: 1.45;
  /* Umbrechen statt kuerzen: Ein "..." mitten im Angebot nimmt dem Kellner
     genau die Auskunft, wegen der er hinsieht. "anywhere" faengt auch das
     eine lange Wort ohne Leerzeichen ab, das sonst die Karte breiter machen
     und die Seite waagerecht scrollen liesse. */
  overflow-wrap: anywhere;
  word-break: break-word;
}
.go-bcard__line--party .go-bcard__text {
  font-weight: 600;
  color: #475569;
}
.go-bcard__line--deal .go-bcard__text {
  font-weight: 800;
  color: #0f172a;
}
/* Die letzte, leiseste Zeile: was die Buchung das Lokal gekostet hat. Kein
   Trennstrich darueber - die Flaeche bleibt eine, getrennt wird ueber Groesse
   und Ton. Sie steht nach dem Rumpf und damit am Fuss der Karte, egal wie
   hoch die gerade ist. */
.go-bcard__fee {
  margin: 12px 0 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.2;
  color: #94a3b8;
  overflow-wrap: anywhere;
}
/* Ist die Liste leer, bleibt der Bereich still: ein Satz in der Farbe,
   in der auch die anderen leeren Listen sprechen - keine Karte, kein Kasten,
   kein Bild. Ein leerer Kasten, der "nichts da" sagt, ist mehr Flaeche als
   die Auskunft wert ist. */
.go-cards__note {
  margin: 0;
  padding: 4px 2px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #cbd5e1;
}
.go-cards__note--loading { color: #94a3b8; }
/* Die Zahl in der Ne-pritje-Pille. Sie steht GENAU dort, wo die anderen
   Pillen ihr Symbol tragen: dieselbe Breite, dieselbe Mitte, dieselbe
   Grundlinie - die Pille wird dadurch weder hoeher noch runder noch anders.

   Sie erbt die Farbe der Pille. Ist der Reiter gewaehlt, ist sie weiss wie
   das Wort daneben; sonst ist sie das Navy der Marke. Kein Abzeichen, keine
   Blase, keine zweite Farbe. */
.go-tabs__count {
  flex: 0 0 auto;
  min-width: var(--work-pill-icon);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: inherit;
}
/* Auf schmalen Telefonen ruecken die Pillen zusammen (siehe die gemeinsame
   Geometrie) - die Zahl geht denselben Weg wie das Symbol, an dessen Stelle
   sie steht. */
@media (max-width: 413px) {
  .go-tabs__count { font-size: 11px; }
}
@media (max-width: 359px) {
  .go-bcard__line { gap: 9px; }
}
`;function Zt(e={},t={}){const a=t.escapeHtml,n=t.icon;return`
    <div class="go-kpi__card${e.modifier?` ${e.modifier}`:""}" data-go-kpi="${o(a,e.key)}">
      <div class="go-kpi__top">
        <span class="go-kpi__period">${o(a,e.period)}</span>
        <span class="go-kpi__icon">${R(n,e.icon,"w-4 h-4")}</span>
      </div>
      ${e.pending?`<p class="go-kpi__value" role="status" aria-label="${o(a,`${e.title}: ${i.kpiPending}`)}"><span class="go-kpi__skeleton${e.wide?" go-kpi__skeleton--wide":""}"></span></p>`:`<p class="go-kpi__value">${o(a,e.value)}</p>`}
      <p class="go-kpi__title">${o(a,e.title)}</p>
      <p class="go-kpi__note">${o(a,e.note)}</p>
    </div>
  `}function Lt({overview:e={},deps:t={}}={}){const a=l=>Number.isFinite(Number(l))&&l!==null&&l!=="",n=l=>a(l)?String(Math.max(0,Math.trunc(Number(l)))):"",r=a(e?.openCents)?Math.max(0,Math.trunc(Number(e.openCents))):null,s=r===0;return`
    <div class="mnyra-work__cards" data-go-kpis>
      ${[{key:"views",period:i.today,icon:"eye",value:n(e?.uniqueViewers),pending:!a(e?.uniqueViewers),title:i.kpiViewsTitle,note:i.kpiViewsNote},{key:"chosen",period:i.today,icon:"ticket",value:n(e?.accepted),pending:!a(e?.accepted),title:i.kpiChosenTitle,note:i.kpiChosenNote},{key:"visits",period:i.today,icon:"badge-check",value:n(e?.visits),pending:!a(e?.visits),title:i.kpiVisitsTitle,note:i.kpiVisitsNote},{key:"guests",period:i.today,icon:"users",value:n(e?.visitors),pending:!a(e?.visitors),title:i.kpiGuestsTitle,note:i.kpiGuestsNote},{key:"due",period:i.current,icon:"wallet",value:r===null?"":Ie(r),pending:r===null,wide:!0,title:i.kpiDueTitle,note:s?i.kpiDueClear:i.kpiDueNote,modifier:s?"go-kpi__card--due go-kpi__card--clear":"go-kpi__card--due"}].map(l=>Zt(l,t)).join("")}
      <span class="go-kpi__tail" aria-hidden="true"></span>
    </div>
  `}const te=Object.freeze([Object.freeze({key:"shift",tabs:Object.freeze(["pending","active","finalized"])}),Object.freeze({key:"manage",tabs:Object.freeze(["stats","payments","offers"])})]),It=Object.freeze({active:"zap",finalized:"circle-check",stats:"bar-chart-3",payments:"wallet",offers:"tag",options:"settings"});function Na(e=""){return te.findIndex(t=>t.tabs.includes(String(e||"")))}function Ht({tab:e="active",group:t=0,pendingCount:a=0,deps:n={}}={}){const r=n.escapeHtml,s=n.icon,h=Math.min(Math.max(Math.trunc(Number(t)||0),0),te.length-1),l=h<te.length-1?i.groupNext:i.groupBack,p=Math.max(0,Math.trunc(Number(a)||0));return`
    <div class="go-tabs" data-go-tabs data-go-tab-group="${h}">
      <div class="go-tabs__viewport">
        <div class="go-tabs__track">
          ${te.map((_,m)=>`
            <div class="mnyra-work__pills go-tabs__pane" role="tablist" data-go-tab-pane="${m}"${m===h?"":' aria-hidden="true" inert'}>
              ${_.tabs.map(f=>{const g=f==="pending",w=g?`<span class="go-tabs__count" aria-hidden="true">${o(r,String(p))}</span>`:R(s,It[f],"w-4 h-4"),v=g?`${p} ${i.tabs[f]}`:i.tabs[f];return`
                <button type="button" role="tab" aria-selected="${e===f?"true":"false"}" data-go-business-tab="${o(r,f)}"
                  aria-label="${o(r,v)}" title="${o(r,v)}"
                  class="mnyra-work__pill">${w}<span class="mnyra-work__pill-label">${o(r,i.tabs[f])}</span></button>
              `}).join("")}
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
        aria-label="${o(r,l)}" title="${o(r,l)}">
        <span class="go-tabs__turn-icon go-tabs__turn-icon--next">${R(s,"chevron-right","w-4 h-4")}</span>
        <span class="go-tabs__turn-icon go-tabs__turn-icon--back">${R(s,"chevron-left","w-4 h-4")}</span>
      </button>
    </div>
  `}function Ve(e={}){return e.partySizeVerified||e.partySizeRequested||e.partySize||1}function Wt(e=""){const t=String(e||"").trim().length;return t<=8?"xl":t<=18?"lg":t<=36?"md":"sm"}function ze(e={},{done:t=!1,deps:a={}}={}){const n=a.escapeHtml,r=a.icon,s=e.benefitLabel||e.snapshot?.benefitLabel||"",h=Ve(e),l=Ue(e.acceptedAt),p=t&&e.commission?e.commission:null;return`
    <article class="go-bcard${t?" go-bcard--done":""}" data-go-booking="${o(n,e.id)}">
      <div class="go-bcard__head">
        ${l?`<p class="go-bcard__time">${o(n,`${i.around} ${l}`)}</p>`:""}
        <span class="go-bcard__status">${o(n,yt(e))}</span>
      </div>
      <!--
        Der Rumpf ist KEINE zweite Karte - er hat keine Flaeche, keinen Rand
        und kein eigenes Polster. Er ist nur der Griff, an dem die zwei Zeilen
        die Hoehe fuellen, die der Kopf uebriglaesst.
      -->
      <div class="go-bcard__body">
        <p class="go-bcard__line go-bcard__line--party">
          <span class="go-bcard__icon">${R(r,"users","w-4 h-4")}</span>
          <span class="go-bcard__text">${o(n,`${h} ${i.guests}`)}</span>
        </p>
        ${s?`
          <p class="go-bcard__line go-bcard__line--deal">
            <span class="go-bcard__icon">${R(r,"gift","w-4 h-4")}</span>
            <span class="go-bcard__text">${o(n,s)}</span>
          </p>
        `:""}
      </div>
      ${p?`
        <p class="go-bcard__fee">${o(n,i.commission)} · ${o(n,Ie(p.amountCents))}</p>
      `:""}
    </article>
  `}function Ut({code:e="",status:t="",busy:a=!1,cameraOpen:n=!1,cameraError:r="",booking:s=null,bookingEntering:h=!1,deps:l={}}={}){const p=l.escapeHtml,_=l.icon,m=s&&typeof s=="object"?s:null,f=!!m&&!h,g=String(t||"").trim()||String(r||"").trim();return`
    <div class="go-activate" data-go-activate data-go-camera="${n?"1":"0"}"
      data-go-found="${f?"1":"0"}" data-go-note="${g?"1":"0"}"
      data-go-cam-ready="0" data-go-code-search>
      <div class="go-activate__face" data-go-activate-face>
        <p class="go-activate__title">${o(p,i.activateTitle)}</p>
        <p class="go-activate__hint">${o(p,i.activateHint)}</p>
        <div class="go-activate__row go-code-box">
          <input type="text" data-go-code-input value="${o(p,e)}"
            placeholder="${o(p,i.codePlaceholder)}"
            autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
            class="go-activate__input" />
          ${We({className:"go-activate__go",label:i.activate,attrs:`data-go-code-submit${a?" disabled":""}`,deps:l})}
          <button type="button" data-go-camera-open class="go-activate__qr"
            aria-label="${o(p,i.scanQr)}" title="${o(p,i.scanQr)}">
            ${R(_,"scan-qr-code","w-5 h-5")}
          </button>
        </div>
        <!--
          Die Zeile unter dem Feld steht IMMER im Aufbau, auch wenn nichts
          darin steht. Das ist der Grund, warum ein fehlgeschlagener Code die
          Karte nicht neu zeichnen muss: Der Controller schreibt den Satz in
          diesen Knoten und legt ein Attribut an der Karte um - der getippte
          Code bleibt dabei unangetastet im Feld, und der Knopf behaelt seine
          laufende Bewegung.

          Waere die Zeile nur dann da, wenn es etwas zu sagen gibt, muesste
          fuer jede Fehlermeldung die halbe Seite neu gebaut werden.
        -->
        <p class="go-activate__status" role="status" data-go-code-status>${o(p,m?"":g)}</p>
      </div>
      <!--
        Der Kamera-Zustand: das Bild und das X. Kein Titel, kein Satz, kein
        Feld, kein zweiter Knopf - wer die Kamera aufmacht, haelt sie schon auf
        etwas gerichtet.

        "playsinline" und "muted" sind auf dem iPhone keine Feinheiten: Ohne
        sie reisst Safari das Bild in den Vollbildspieler, und genau das soll
        hier nicht passieren - die Kamera bleibt in der Karte.
      -->
      <div class="go-activate__cam" data-go-activate-cam>
        <!--
          Das Bild ist unsichtbar, bis der Strom wirklich laeuft: Ein <video>
          ohne Masse ist erst gar nichts und dann kurz hochkant, und beides
          sieht man, wenn man es zeigt. Der Controller setzt data-go-cam-ready
          erst, wenn Masse da sind UND play() durch ist - dann blendet das
          Bild in 140ms auf.

          Die Flaeche darunter steht die ganze Zeit in ihrer Endgroesse. Es
          wartet also nichts auf das Bild; es wird nur ausgefuellt.
        -->
        <video class="go-activate__cam-view" data-go-camera-video
          playsinline webkit-playsinline muted autoplay disablepictureinpicture></video>
        <button type="button" data-go-camera-close class="go-activate__cam-close"
          aria-label="${o(p,i.cameraClose)}" title="${o(p,i.cameraClose)}">
          ${R(_,"x","w-4 h-4")}
        </button>
      </div>
      ${m?Vt({booking:m,code:e,busy:a,note:g,deps:l}):""}
    </div>
  `}function Vt({booking:e={},code:t="",busy:a=!1,note:n="",deps:r={}}={}){const s=r.escapeHtml,h=Ve(e),l=e.benefitLabel||e.snapshot?.benefitLabel||"",p=Ne(e.status),_=String(t||"").trim().toUpperCase();return`
    <div class="go-activate__done" data-go-activate-done
      data-go-booking="${o(s,e.id)}">
      <!--
        Der Kopf: links das Wort "Oferta" und darunter der Code, rechts die
        Gruppe, mit der der Gast gekommen ist.

        "Oferta" ist eine Beschriftung und steht deshalb klein und leise da;
        der Code ist das, was der Kellner mit dem Zettel in der Hand
        vergleicht, und steht gross darunter. Vorher standen beide in einer
        Zeile und in derselben Groesse, mit einem Doppelpunkt dazwischen -
        dann liest man das Schild genauso laut wie den Wert.
      -->
      <div class="go-activate__done-head">
        <div class="go-activate__done-id">
          <p class="go-activate__done-label">${o(s,i.dealCode)}</p>
          ${_?`<p class="go-activate__done-code">${o(s,_)}</p>`:""}
        </div>
        <p class="go-activate__done-party">${o(s,`${h} ${h===1?i.personOne:i.personMany}`)}</p>
      </div>
      <!--
        Das Angebot als Text und nicht als Karte in der Karte. Der Bereich
        haelt eine Hoehe frei, damit ein kurzes "-10%" und ein langes
        "1 Croissant + 1 Kafe FALAS me porosi ushqimi" die Zeilen darunter an
        derselben Stelle stehen lassen. Was laenger ist als der Platz, bricht
        um und bleibt erreichbar - abgeschnitten wird nichts.

        Er ist der Mittelpunkt der Karte: gross, mittig und ohne alles
        drumherum. Wie gross, entscheidet die Laenge - "-10%" traegt eine
        andere Schriftgroesse als ein Paket aus zwei Zeilen, und die Stufe
        dafuer wird hier ausgerechnet und nicht im Blatt geraten.
      -->
      <div class="go-activate__deal" data-go-deal="${Wt(l)}">
        <p class="go-activate__deal-text">${o(s,l)}</p>
      </div>
      <!--
        Die Linie trennt, worum es geht, von dem, was zu tun ist. Sie ist eine
        Haarlinie im Ton der Karte und kein Strich: Was darueber steht, soll
        weiter das Lauteste auf der Karte sein.
      -->
      <div class="go-activate__rule" aria-hidden="true"></div>
      ${p==="activated"?`
        <!--
          Die Gruppengroesse gehoert dem Kellner, nicht dem Gast: Er steht vor
          der Gruppe und sieht, wieviele es wirklich sind. Was er hier stehen
          laesst oder aendert, ist die Zahl, die abgerechnet wird (Punkt 12).

          Die Frage und der Zaehler stehen nebeneinander, solange sie
          nebeneinander passen, und untereinander, sobald nicht - deshalb ist
          es kein <label> mehr um beide, sondern eine Zeile, die umbrechen
          darf. Die Beschriftung des Feldes haengt jetzt am Feld selbst.

          Das Feld ist dasselbe wie vorher: dieselbe Marke, derselbe Typ,
          dieselben Grenzen (1 bis 10), derselbe Wert. Nur stehen links und
          rechts davon zwei Griffe, die es um eins bewegen - der Kellner muss
          keine Zahl mehr tippen.
        -->
        <div class="go-activate__party">
          <span class="go-activate__party-label">${o(s,i.partyAtTable)}</span>
          <div class="go-activate__stepper">
            <button type="button" class="go-activate__step" data-go-party-step="-1"
              aria-label="${o(s,i.partyLess)}" title="${o(s,i.partyLess)}">&minus;</button>
            <input type="number" inputmode="numeric" min="1" max="10" data-go-confirm-party
              aria-label="${o(s,i.partyAtTable)}"
              value="${o(s,h)}" class="go-activate__party-input" />
            <button type="button" class="go-activate__step" data-go-party-step="1"
              aria-label="${o(s,i.partyMore)}" title="${o(s,i.partyMore)}">+</button>
          </div>
        </div>
        <!--
          Auch hier steht die Zeile immer da. Ein Abschluss, der nicht
          durchging, darf die Karte nicht neu bauen: Die Oferta, der Code und
          die eingestellte Personenzahl stehen im Knoten und nirgends sonst -
          ein Neuaufbau verloere die Zahl, die der Kellner gerade eingestellt
          hat, und er muesste von vorne anfangen.
        -->
        <p class="go-activate__done-status" role="status" data-go-done-status>${o(s,n)}</p>
        ${We({className:"go-activate__finalize",label:i.finalize,attrs:`data-go-booking-finalize data-go-booking-id="${o(s,e.id)}"${a?" disabled":""}`,deps:r})}
      `:`
        <!--
          Der Gast steht daneben und hat noch nicht gewischt. Ein "nicht
          gefunden" schickte den Kellner auf Fehlersuche bei sich selbst.
        -->
        <p class="go-activate__wait">${o(s,i.needsActivation)}</p>
      `}
    </div>
  `}function oe({eyebrow:e="",title:t="",sub:a="",action:n="",body:r="",deps:s={}}={}){const h=s.escapeHtml;return`
    <div class="mb-6 bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(h,e)}</span>
          <h3 class="text-xl font-black italic tracking-tighter">${o(h,t)}</h3>
          ${a?`<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${o(h,a)}</p>`:""}
        </div>
        ${n}
      </div>
      ${r}
    </div>
  `}function Se({title:e="",note:t="",iconName:a="",deps:n={}}={}){const r=n.escapeHtml,s=n.icon;return oe({eyebrow:i.brand,title:e,sub:i.soonHint,body:`
      <div class="text-center py-10">
        <div class="w-14 h-14 rounded-[1.6rem] bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          ${R(s,a,"w-5 h-5")}
        </div>
        <p class="text-sm font-semibold text-slate-500">${o(r,t)}</p>
      </div>
    `,deps:n})}function qt(e={},t={}){const a=t.escapeHtml,n=e.status==="paused"?i.paused:e.status==="archived"?i.archived:"";return`
    <div class="p-4 rounded-[1.6rem] bg-slate-50 border border-slate-100" data-go-offer="${o(a,e.id)}">
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Der Knopf des Gastes ("Prano
        ofertën") gehoert nicht in die Liste des Wirts, und was darin steht,
        hoert auf nichts.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Le({businessName:"",imageUrl:e.imageUrl||"",variant:le,benefitLabel:e.benefitLabel||"",benefitView:Ge(e.benefit||{}),meta:[{icon:"users",label:Ce(e)},{icon:"clock",label:je(e)}]})}
      </div>
      <p class="text-[9px] font-black uppercase tracking-widest mt-3 ${e.status==="active"?"text-emerald-600":"text-slate-400"}">
        ${o(a,n||i.statActive)}
      </p>
      <div class="flex gap-2 mt-3">
        <button type="button" data-go-offer-edit="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,i.edit)}</button>
        <button type="button" data-go-offer-toggle="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200">${o(a,e.status==="active"?i.paused:i.activate)}</button>
        <button type="button" data-go-offer-archive="${o(a,e.id)}"
          class="px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">${o(a,i.archive)}</button>
      </div>
    </div>
  `}function Qt({offer:e={},businessName:t="",previewImageUrl:a="",deps:n={}}={}){const r=n.escapeHtml;return`
    <div data-go-offer-preview>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-300">${o(r,i.preview)}</p>
      <!--
        Die Karte ist ein Bild, kein Bedienteil: Ein Knopf, der aussieht wie
        der des Gastes und auf nichts hoert, waere ein kaputter Knopf.
      -->
      <div style="pointer-events:none;" aria-hidden="true">
        ${Le({businessName:t,imageUrl:a||e.imageUrl||"",benefitLabel:e.benefitLabel||"",benefitView:Ge(e.benefit||{}),meta:[{icon:"users",label:Ce(e)},{icon:"clock",label:je(e)}]})}
      </div>
    </div>
  `}function T(e,t="",a=""){return`<label class="text-[10px] font-black uppercase tracking-widest text-slate-400"${a?` for="${o(e,a)}"`:""}>${o(e,t)}</label>`}function ee(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-chip px-4 rounded-2xl text-xs font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const Yt=`
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
`;function se({attr:e="",unit:t="€",value:a="",placeholder:n="",mode:r="decimal",inputClass:s="",escapeHtml:h=null}={}){return`
    <div class="go-offer-price">
      <input type="text" ${e} inputmode="${o(h,r)}" autocomplete="off"
        placeholder="${o(h,n)}" value="${o(h,a)}" class="${s}" />
      <span class="go-offer-price__unit">${o(h,t)}</span>
    </div>
  `}function q(e,{active:t=!1,attr:a="",value:n="",escapeHtml:r=null}={}){return`
    <button type="button" ${a?`${a}="${o(r,n)}"`:""} aria-pressed="${t?"true":"false"}"
      class="go-offer-pill rounded-xl font-black transition-colors ${t?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
      ${o(r,e)}
    </button>
  `}const $e=Object.freeze([10,15,20,25]);function Jt({benefit:e={},percentCustom:t=!1,errorFor:a=()=>"",inputClass:n="",inputBase:r="",escapeHtml:s=null}={}){const h=g=>T(s,g),l=g=>{const w=a(g);return w?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="${o(s,g)}">${o(s,w)}</p>`:""};if(!xt.includes(e.kind))return`
      <p class="go-offer-saving font-bold text-slate-400">${o(s,i.benefitLegacy)}</p>
      ${l("benefit")}
    `;const p=Number(e.percent)||0,_=t||p>0&&!$e.includes(p),m=()=>{const g=zt(e.savingCents);if(!g)return"";const w=Math.round(Number(e.savingPercent)||0);return`
      <p class="mt-3 go-offer-saving font-black text-emerald-600" data-go-benefit-saving>
        ${o(s,i.saving)} ${o(s,g)}${w>0?` &middot; -${w}%`:""}
      </p>
    `},f=()=>`
    <div class="mt-3">
      ${h(i.priceRegular)}
      ${se({attr:"data-go-benefit-regular",value:ke(e.regularPriceCents),placeholder:i.pricePlaceholder,inputClass:r,escapeHtml:s})}
      ${l("regularPrice")}
    </div>
    <div class="mt-3">
      ${h(i.priceGo)}
      ${se({attr:"data-go-benefit-go",value:ke(e.goPriceCents),placeholder:i.pricePlaceholder,inputClass:r,escapeHtml:s})}
      ${l("goPrice")}
    </div>
    ${m()}
  `;if(e.kind===Re)return`
      ${h(i.discountQuestion)}
      <div class="mt-2 flex flex-wrap gap-2">
        ${$e.map(g=>q(`${g}%`,{active:!_&&p===g,attr:"data-go-discount",value:String(g),escapeHtml:s})).join("")}
        ${q(i.discountOther,{active:_,attr:"data-go-discount",value:"other",escapeHtml:s})}
      </div>
      ${_?`
        <div class="mt-3">
          ${se({attr:"data-go-benefit-percent",unit:"%",mode:"numeric",value:p>0?String(p):"",placeholder:i.discountPlaceholder,inputClass:r,escapeHtml:s})}
        </div>
      `:""}
      ${l("benefitPercent")}

      <div class="mt-4">
        ${h(i.scopeQuestion)}
        <div class="mt-2 flex flex-wrap gap-2">
          ${[["all",i.scopeAll],["food",i.scopeFood],["drinks",i.scopeDrinks]].map(([g,w])=>q(w,{active:(e.scope||"all")===g,attr:"data-go-discount-scope",value:g,escapeHtml:s})).join("")}
        </div>
        ${l("benefitScope")}
      </div>
    `;if(e.kind===Fe)return`
      ${h(i.bundleQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.bundlePlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${l("benefitItem")}
      ${f()}
    `;if(e.kind===Be){const g=String(e.conditionType||"");return`
      ${h(i.freeQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.freePlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${l("benefitItem")}

      <div class="mt-4">
        ${h(i.conditionQuestion)}
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${[["food",i.conditionFood],["drink",i.conditionDrink],["any_order",i.conditionAny],["custom",i.conditionCustom]].map(([w,v])=>q(v,{active:g===w,attr:"data-go-benefit-condition",value:w,escapeHtml:s})).join("")}
        </div>
        ${g==="custom"?`
          <div class="mt-3">
            ${h(i.customConditionQuestion)}
            <input type="text" data-go-benefit-condition-text autocomplete="off"
              placeholder="${o(s,i.customConditionPlaceholder)}"
              value="${o(s,e.customCondition||"")}" class="${n}" />
          </div>
        `:""}
        ${l("benefitCondition")}
      </div>
    `}return e.kind===Me?`
      ${h(i.productQuestion)}
      <input type="text" data-go-benefit-item autocomplete="off"
        placeholder="${o(s,i.productPlaceholder)}"
        value="${o(s,e.itemName||"")}" class="${n}" />
      ${l("benefitItem")}
      ${f()}
    `:""}function Xt({imageUrl:e="",photo:t={},escapeHtml:a=null,icon:n=null}={}){const r=String(t.status||""),s=r==="uploading",h=String(t.previewUrl||e||""),l=r==="error"?String(t.error||i.photoError):"",p=h?`
      <div class="go-offer-photo__frame${s?" go-offer-photo__frame--busy":""}">
        <img class="go-offer-photo__img" src="${o(a,h)}" alt="" decoding="async" />
        ${s?`<span class="go-offer-photo__busy">${o(a,i.photoUploading)}</span>`:""}
      </div>
      <div class="go-offer-photo__actions">
        <button type="button" class="go-offer-photo__action" data-go-offer-photo-pick>${o(a,i.photoChange)}</button>
        <button type="button" class="go-offer-photo__action go-offer-photo__action--remove" data-go-offer-photo-remove>${o(a,i.photoRemove)}</button>
      </div>
    `:`
      <button type="button" class="go-offer-photo" data-go-offer-photo-pick>
        <span class="go-offer-photo__plus">${R(n,"plus","w-5 h-5")}</span>
        <span class="go-offer-photo__title">${o(a,i.photoAdd)}</span>
        <span class="go-offer-photo__sub">${o(a,i.photoSource)}</span>
      </button>
    `;return`
    <div data-go-section="photo">
      ${T(a,i.photoQuestion)}
      <p class="mt-1 text-[11px] font-semibold text-slate-400">
        ${o(a,i.photoHint)}
        <span class="text-slate-300">&middot; ${o(a,i.photoOptional)}</span>
      </p>
      <!--
        Das Feld nimmt, was ein Telefon anbietet: aufnehmen, aus der Mediathek,
        aus den Dateien. Ohne "capture" - das erzwingt die Kamera und nimmt dem
        Wirt die drei Fotos, die er letzte Woche schon gemacht hat.
      -->
      <input type="file" accept="image/*" class="hidden" data-go-offer-photo-input />
      <div class="mt-3">${p}</div>
      ${l?`<p class="mt-2 text-[11px] font-bold text-rose-500">${o(a,l)}</p>`:""}
    </div>
  `}function ea(e=""){const t=String(e||"all").trim().toLowerCase();return t==="food"?["food"]:t==="coffee"||t==="drinks"||t==="dessert"?["drinks"]:["food","drinks"]}function Oa(e=[]){const t=Array.isArray(e)?e:[],a=t.includes("food"),n=t.includes("drinks");return a&&n?"all":a?"food":n?"drinks":""}function Ta({editor:e=null,businessName:t="",deps:a={}}={}){if(!e)return"";const n=a.escapeHtml,r=a.icon,s=e.draft||{},h=Array.isArray(e.errors)?e.errors:[],l=k=>h.find(K=>K.field===k)?.message||"",p=Array.isArray(s.partyRanges)?s.partyRanges:[],_=s.schedule?.mode==="windows"?"windows":"always",m=Array.isArray(s.schedule?.days)&&s.schedule.days.length?s.schedule.days:we.slice(),f=_e.every(k=>p.includes(k.key)),g=Array.isArray(e.intents)?e.intents:ea(s.category),w=s.benefit||{},v=e.mode==="edit",G="w-full go-offer-input bg-slate-50 border border-slate-100 rounded-2xl px-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-400",N=`mt-2 ${G}`,S='<div class="h-px bg-slate-100"></div>',O=k=>`<p class="mt-1 text-[11px] font-semibold text-slate-400">${o(n,k)}</p>`,C=wt(s).ok&&g.length>0;return`
    <div class="fixed inset-0 z-[75] modal-overlay" data-modal-surface="#ffffff" style="--modal-surface:#ffffff;"
      data-go-offer-editor role="dialog" aria-modal="true"
      aria-label="${o(n,v?i.editOffer:i.createOffer)}">
      <!--
        Die Karte der Vorschau bringt ihr Stylesheet mit: Sie ist dieselbe wie
        im Qyteti, und deren Regeln haengen am Kopf des Dokuments erst, wenn
        jemand die Gaeste-Seite geoeffnet hat.
      -->
      <style>${Ze}${Yt}</style>
      <div class="absolute inset-0 bg-black/60" data-go-offer-cancel></div>
      <div class="modal-frame">
        <div class="bg-white rounded-t-[3rem] shadow-2xl border border-slate-100 flex flex-col modal-sheet-85 overflow-hidden modal-sheet">
        <div class="flex items-start justify-between gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
          <div class="min-w-0">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">${o(n,i.brand)}</span>
            <h3 class="text-xl font-black italic tracking-tighter truncate">${o(n,v?i.editOffer:i.createOffer)}</h3>
            <!--
              Der eine Satz, der einem Wirt erklaert, warum er hier steht
              (Punkt 2). Er steht im Kopf und nicht im Bildlauf: Er gilt fuer
              das ganze Formular, nicht fuer die erste Frage.
            -->
            <p class="mt-1 text-[11px] font-semibold text-slate-400">${o(n,i.editorHint)}</p>
          </div>
          <button type="button" data-go-offer-cancel aria-label="${o(n,i.close)}"
            class="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500">
            ${R(r,"x","w-4 h-4")}
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
            ${T(n,i.benefitQuestion)}
            ${O(i.benefitHint)}
            <div class="mt-4 grid grid-cols-2 gap-2">
              ${[[Re,i.benefitPercent],[Fe,i.benefitBundle],[Be,i.benefitFree],[Me,i.benefitSpecial]].map(([k,K])=>`
                <button type="button" data-go-benefit-kind="${o(n,k)}"
                  aria-pressed="${w.kind===k?"true":"false"}"
                  class="go-offer-kind px-3 rounded-2xl text-xs font-black transition-colors ${w.kind===k?"bg-slate-900 text-white":"bg-slate-50 text-slate-600 border border-slate-100"}">
                  ${o(n,K)}
                </button>
              `).join("")}
            </div>
            <div class="mt-5" data-go-benefit-form>
              ${Jt({benefit:w,percentCustom:e.percentCustom===!0,errorFor:l,inputClass:N,inputBase:G,escapeHtml:n})}
            </div>
          </div>

          ${S}

          <!--
            Das Foto steht direkt hinter den Angaben zum Angebot und nicht am
            Ende des Formulars (Punkt 9): Es gehoert zum Angebot. Wer es unten
            sucht, hat vorher dreimal gelesen, dass es freiwillig ist.
          -->
          ${Xt({imageUrl:s.imageUrl||"",photo:e.photo||{},escapeHtml:n,icon:r})}

          ${S}

          <div data-go-section="partyRanges">
            ${T(n,i.partyQuestion)}
            ${O(i.partyHint)}
            <!--
              "Të gjithë" zuerst und allein in seiner Zeile: Es ist die Antwort
              der meisten Lokale, und es ist keine fuenfte Gruppengroesse,
              sondern die Abkuerzung fuer alle vier darunter (Punkt 15).
            -->
            <div class="mt-3">
              ${ee(i.partyAll,{active:f,attr:"data-go-offer-party",value:"all",escapeHtml:n})}
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              ${_e.map(k=>ee(k.label,{active:p.includes(k.key),attr:"data-go-offer-party",value:k.key,escapeHtml:n})).join("")}
            </div>
            ${l("partyRanges")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="partyRanges">${o(n,l("partyRanges"))}</p>`:""}
          </div>

          ${S}

          <div data-go-section="category">
            ${T(n,i.categoryQuestion)}
            ${O(i.categoryHint)}
            <div class="mt-3 space-y-2">
              ${[{key:"food",label:i.ifFood},{key:"drinks",label:i.ifDrinks}].map(k=>{const K=g.includes(k.key),$=_t.find(x=>x.key===k.key)?.hint||"";return`
                  <button type="button" data-go-offer-intent="${o(n,k.key)}" aria-pressed="${K?"true":"false"}"
                    class="w-full text-left go-offer-answer px-4 py-3 rounded-2xl border transition-colors ${K?"bg-slate-900 border-slate-900 text-white":"bg-slate-50 border-slate-100 text-slate-600"}">
                    <span class="block text-xs font-black">${o(n,k.label)}</span>
                    <span class="block text-[11px] font-semibold go-offer-answer__hint">${o(n,$)}</span>
                  </button>
                `}).join("")}
            </div>
            ${l("category")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="category">${o(n,l("category"))}</p>`:""}
          </div>

          ${S}

          <div data-go-section="schedule">
            ${T(n,i.scheduleQuestion)}
            ${O(i.scheduleHint)}
            <div class="mt-3 flex flex-wrap gap-2">
              ${ee(i.always,{active:_==="always",attr:"data-go-offer-schedule",value:"always",escapeHtml:n})}
              ${ee(i.specificHours,{active:_==="windows",attr:"data-go-offer-schedule",value:"windows",escapeHtml:n})}
            </div>
            ${_==="windows"?`
              <!--
                Die Tage stehen jetzt im Formular (Punkt 23). Vorher galt ein
                Orar specifik stillschweigend fuer jeden Tag - ein Cafe, dessen
                Morgenangebot nur werktags gilt, hatte dafuer keinen Ort im
                Modal. Vorausgewaehlt sind trotzdem alle sieben: Wer nichts
                anfassen will, muss nichts anfassen.
              -->
              <div class="mt-4">
                ${T(n,i.daysQuestion)}
                <div class="mt-2 flex flex-wrap gap-2">
                  ${we.map(k=>q(kt(k),{active:m.includes(k),attr:"data-go-offer-day",value:k,escapeHtml:n})).join("")}
                </div>
              </div>
              <div class="mt-4">
                ${T(n,i.hoursQuestion)}
                <div class="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    ${T(n,i.hoursFrom,"goOfferFrom")}
                    <input id="goOfferFrom" type="time" data-go-offer-from value="${o(n,e.windowFrom||"14:00")}" class="${N}" />
                  </div>
                  <div>
                    ${T(n,i.hoursTo,"goOfferTo")}
                    <input id="goOfferTo" type="time" data-go-offer-to value="${o(n,e.windowTo||"18:00")}" class="${N}" />
                  </div>
                </div>
              </div>
            `:""}
            ${l("schedule")?`<p class="mt-2 text-[11px] font-bold text-rose-500" data-go-error="schedule">${o(n,l("schedule"))}</p>`:""}
          </div>

          ${S}

          ${Qt({offer:s,businessName:t,previewImageUrl:e.photo?.previewUrl||"",deps:a})}
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
            aria-disabled="${C?"false":"true"}"
            class="w-full py-4 rounded-[1.8rem] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all go-offer-save${C?" go-offer-save--ready":""}">
            ${o(n,e.saving?i.saving:v?i.save:i.activate)}
          </button>
          <div class="text-center text-[10px] font-bold ${e.status?"text-rose-500":"text-slate-400"} mt-3">${o(n,e.status)}</div>
        </div>
        </div>
      </div>
    </div>
  `}function Za({tab:e="active",group:t=0,overview:a={},search:n={},camera:r={},bookingEntering:s=!1,bookings:h=[],nowMs:l=Date.now(),offers:p=[],settings:_={},paused:m=!1,loading:f=!1,error:g="",deps:w={}}={}){const v=w.escapeHtml,G=w.icon,N=x=>Ne(x.status),S=x=>Nt.includes(N(x))&&vt(x,l),O=x=>N(x)==="finalized",C=h.filter(S),k=h.filter(O),K=p.filter(x=>x.status!=="archived");let $="";if(e==="offers")$=oe({eyebrow:i.brand,title:i.tabs.offers,sub:`${K.length} ${K.length===1?"oferte":"oferta"}`,action:`
        <button type="button" data-go-offer-new class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow active:scale-95">
          ${R(G,"plus","w-4 h-4")}
        </button>
      `,body:K.length?`<div class="space-y-3">${K.map(x=>qt(x,w)).join("")}</div>`:`<div class="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-slate-300">${o(v,i.emptyTitle)}</div>`,deps:w});else if(e==="finalized")$=k.length?`<div class="go-cards">${k.map(x=>ze(x,{done:!0,deps:w})).join("")}</div>`:`<p class="go-cards__note">${o(v,i.noHistory)}</p>`;else if(e==="pending")$=f?`<p class="go-cards__note go-cards__note--loading" role="status">${o(v,i.loading)}</p>`:C.length?`<div class="go-cards">${C.map(x=>ze(x,{deps:w})).join("")}</div>`:`<p class="go-cards__note">${o(v,i.noBookings)}</p>`;else if(e==="stats")$=Se({title:i.tabs.stats,note:i.soonStats,iconName:"bar-chart-3",deps:w});else if(e==="payments")$=Se({title:i.tabs.payments,note:i.soonPayments,iconName:"wallet",deps:w});else if(e==="options"){const x=Ue(_?.pausedUntil);$=oe({eyebrow:i.brand,title:i.tabs.options,body:`
        <div class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p class="text-xs font-black text-slate-800">${o(v,i.goOn)}</p>
            <p class="text-[10px] font-bold text-slate-400">${o(v,m?`${i.pausedUntil} ${x}`:"ON")}</p>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest ${m?"text-amber-600":"text-emerald-600"}">
            ${o(v,m?i.paused:i.statActive)}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          ${m?`<button type="button" data-go-pause="0" class="go-pause px-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">${o(v,i.resume)}</button>`:[{value:"30",label:"30 min"},{value:"60",label:"1 orë"},{value:"tomorrow",label:"Deri nesër"},{value:"-1",label:"Pa afat"}].map(B=>`
              <button type="button" data-go-pause="${B.value}"
                class="go-pause px-4 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-600">${o(v,B.label)}</button>
            `).join("")}
        </div>
        <p class="mt-4 text-[10px] font-bold text-slate-400">${o(v,i.keepsRunning)}</p>
      `,deps:w})}else $=Ut({code:n.code,status:n.status,busy:n.busy,cameraOpen:r.open===!0,cameraError:r.error,booking:n.booking,bookingEntering:s===!0,deps:w});return`
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
      <style>${He}${Ze}${Tt}</style>
      <!--
        Hier stand die Ueberschrift der Seite: "MNYRAGO" und darunter der Name
        des Lokals. Sie ist weg, und zwar weil sie doppelt war.

        Das Wortlogo steht jetzt im globalen Kopf, links neben dem Hamburger -
        derselbe Schriftzug, dieselben zwei Farben, nur eine Zeile hoeher. Wer
        es hier noch einmal las, las es zum zweiten Mal; und der Name des
        Lokals daneben sagte einem Wirt, der in seinem eigenen Panel sitzt,
        nichts, was er nicht wusste.

        Was die zwei Zeilen kosteten, war nicht ihre Hoehe allein: Zusammen mit
        dem Abstand darunter standen 80 Punkte zwischen dem Kopf und der ersten
        Kennzahl. Die Reihe faengt jetzt direkt unter dem Seitenpolster an
        (--work-head-top) - ein bewusster Abstand, aber keine leere Flaeche,
        und derselbe wie auf der Biznesi-Seite.
      -->
      ${Lt({overview:a,deps:w})}

      <!--
        Das Bento traegt die Leiste und die Liste, die sie gewaehlt hat -
        woertlich dieselbe Flaeche wie im Paneli (.mnyra-work__bento). Die
        Reihe darueber bleibt frei: sie gehoert zur Seite, nicht zur Auswahl.
      -->
      <div class="mnyra-work__bento go-bento" data-go-bento>
        ${Ht({tab:e,group:t,pendingCount:C.length,deps:w})}
        <div>
          ${$}
          ${g?`<p class="text-center text-[10px] font-bold uppercase tracking-widest text-rose-500">${o(v,g)}</p>`:""}
        </div>
      </div>
    </div>
  `}function La({deps:e={},resolving:t=!1}={}){const a=e.icon,n=e.escapeHtml;return t?`
      <div class="p-6 app-main-content-safe">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 text-center">
          <p class="text-sm font-bold text-slate-500">${o(n,i.loadingBusiness)}</p>
        </div>
      </div>
    `:`
    <div class="p-6 app-main-content-safe">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 text-center">
        <div class="w-16 h-16 rounded-[1.8rem] bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          ${R(a,"lock","w-6 h-6")}
        </div>
        <h2 class="text-lg font-black italic text-slate-900 mb-2">${o(n,i.brand)}</h2>
        <p class="text-sm text-slate-500">${o(n,i.onlyBusiness)}</p>
      </div>
    </div>
  `}const Ia=i,Ke="mnyraDashboardStyles",ta=`
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
/* Die Begruessung stand hier - "Përshëndetje," mit dem Logo daneben und dem
   Tageszeit-Gruss darunter (.mnyra-dash__greet*). Sie ist weg: Das Bild des
   Lokals und der Name des Bereichs stehen jetzt im globalen Kopf, und der
   Gruss war das, was ein Wirt beim zweiten Oeffnen ueberliest. Ihr Blatt geht
   mit - eine Regel ohne Knoten ist kein Blatt, sondern eine Fussnote. */
/* Die Kennzahl-Reihe. Sie ist jetzt das Erste auf der Seite. Ihre Machart -
   waagerecht, bis an beide Bildschirmraender, aber links in der Flucht der
   Seite - steht als .mnyra-work__cards in der gemeinsamen Geometrie; die Reihe
   traegt beide Klassen. Den Abstand nach oben gibt das Seitenpolster
   (--work-head-top), damit er in GO derselbe ist. */
/* Zweieinhalb Karten stehen im Bild: die Reihe reicht von der Flucht (100%)
   bis an den rechten Bildschirmrand (+ das Seitenpolster), abzueglich der
   beiden Luecken zwischen den drei angeschnittenen Karten. */
.mnyra-dash__hl-card {
  flex: 0 0 calc((100% + var(--work-inline) - 20px) / 2.5);
  /* Bildfenster + Abstand + Textblock + Polster unten. Die Karte gibt dem Text
     unter dem Bild Luft, statt ihn an die Kante zu setzen: Bildfenster 140,
     Textblock 88 - zwei Zeilen Beschriftung (25px) und darunter die Zahl.
     Die Summe steht als gemeinsame Marke, weil an der Hoehe dieser Reihe der
     Anfang des Benkos haengt - in Mnyra GO genau wie hier. */
  height: var(--work-card-height);
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
`;function aa(e=typeof document>"u"?null:document){if(Gt(e),!(!e||e.getElementById(Ke)))try{const t=e.createElement("style");t.id=Ke,t.textContent=ta,e.head?.appendChild(t)}catch{}}function z(e=""){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function F(e,t,a=""){if(typeof e!="function")return"";try{return e(t,a)||""}catch{return""}}const na=Object.freeze(["hotel","motel","hostel","resort","accommodation","travel"]);function ia({businessType:e="",isShopCatalog:t=!1}={}){if(t)return"shop";const a=String(e||"").trim().toLowerCase();return na.includes(a)?"hotel":"restaurant"}function ra({iconFn:e}={}){return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap" data-dashboard-composer-card data-dashboard-composer="post">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Posto</span> n'Mnyra</span>
      <span class="mnyra-dash__composer-sub">Ndaj një postim ose një story me klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Posto</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}function sa({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-offer-card data-nav="ofertatbiznes">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> ofertë</span>
      <span class="mnyra-dash__composer-sub">Krijo një zbritje ose një kupon për klientët e tu.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Ofertë</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}function oa({iconFn:e,showEditor:t=!0}={}){return t?`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-ads-card data-nav="reklama">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">Lësho</span> Rreklam</span>
      <span class="mnyra-dash__composer-sub">Rreklamo biznesin tënd n'qytetin tënd.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Rreklam</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `:""}const De=Object.freeze({restaurant:{accent:"Ndrysho",rest:"menunë",sub:"Shto produkte, kategori dhe çmime.",cta:"Menu"},shop:{accent:"Ndrysho",rest:"dyqanin",sub:"Shto produkte, kategori dhe stok.",cta:"Dyqani"},hotel:{accent:"Ndrysho",rest:"hotelin",sub:"Detajet, dhomat dhe çmimet e tua.",cta:"Hoteli"}});function da(e="restaurant"){const t=String(e||"").trim().toLowerCase();return De[t]||De.restaurant}function la({iconFn:e,kind:t="restaurant",showEditor:a=!0}={}){if(!a)return"";const n=da(t);return`
    <button type="button" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--plane" data-dashboard-catalog-card data-nav="menu">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${z(n.accent)}</span> ${z(n.rest)}</span>
      <span class="mnyra-dash__composer-sub">${z(n.sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"plus","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${z(n.cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </button>
  `}const ca="/waiter?from=panel";function ha({iconFn:e,showEditor:t=!0}={}){return t?`
    <a href="${ca}" class="mnyra-dash__composer mnyra-dash__composer--tap mnyra-dash__composer--waiter" data-dashboard-waiter-card>
      <span class="mnyra-dash__composer-title">Mnyra <span class="mnyra-dash__composer-accent">Waiter</span></span>
      <span class="mnyra-dash__composer-sub">Këtu ju vijnë porositë nga tavolinat.</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${F(e,"external-link","w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">Waiter</span>
        <span class="mnyra-dash__composer-cta-chevron">${F(e,"chevron-right","w-4 h-4")}</span>
      </span>
    </a>
  `:""}function ua({cards:e=[],iconFn:t}={}){const a=(Array.isArray(e)?e:[]).filter(r=>r&&r.key);if(!a.length)return"";const n=a.map((r,s)=>{const h=z(r.label||"");if(r.pending)return'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>';const l=s<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"';let p="";r.imageUrl?p=`<img class="mnyra-dash__hl-media" src="${z(r.imageUrl)}" alt="" ${l} decoding="async" onerror="this.style.display='none'" />`:r.videoUrl&&(p=`<video class="mnyra-dash__hl-media" src="${z(r.videoUrl)}#t=0.1" preload="metadata" muted playsinline disablepictureinpicture tabindex="-1" aria-hidden="true"></video>`);const _=`
      <span class="mnyra-dash__hl-plate">${F(t,r.iconName||"image","w-6 h-6")}</span>
      ${p}
    `,m=r.withEye?`<span class="mnyra-dash__hl-eye">${F(t,"eye","w-4 h-4")}</span>`:"";let f;r.locked?f=`<span class="mnyra-dash__hl-lock">${F(t,"lock","w-3 h-3")}Me pagesë</span>`:r.loading?f='<span class="mnyra-dash__hl-value mnyra-dash__hl-value--pending" aria-hidden="true"></span>':r.emptyText?f=`<span class="mnyra-dash__hl-empty">${z(r.emptyText)}</span>`:f=`<span class="mnyra-dash__hl-value">${m}${z(r.value||"0")}</span>`;let g;r.locked?g=`class="mnyra-dash__hl-card mnyra-dash__hl-card--locked" data-dashboard-metric-locked="${z(r.key)}"`:r.composer?g=`class="mnyra-dash__hl-card" data-dashboard-composer="${z(r.composer)}"`:g=`class="mnyra-dash__hl-card"${r.panelTab?` data-dashboard-panel-tab="${z(r.panelTab)}"`:""}`;const w=r.locked?`${h} – me pagesë`:`${h} ${r.emptyText||r.value||""}`.trim();return`
      <button type="button" ${g} data-dashboard-metric="${z(r.key)}" aria-label="${z(w)}">
        ${_}
        <span class="mnyra-dash__hl-body">
          <span class="mnyra-dash__hl-label">${h}</span>
          ${f}
        </span>
      </button>
    `}).join("");return`
    <div class="mnyra-work__cards" data-dashboard-metrics="${z(pa(a))}">
      ${n}
      <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
    </div>
  `}function pa(e=[]){return(Array.isArray(e)?e:[]).filter(t=>t&&t.key).map(t=>[t.key,t.label||"",t.value||"",t.emptyText||"",t.imageUrl||"",t.videoUrl||"",t.iconName||"",t.panelTab||"",t.composer||"",t.pending?"p":"",t.loading?"l":"",t.locked?"x":"",t.withEye?"e":""].join("~")).join("|")}const qe=Object.freeze([Object.freeze({id:"funksionet",label:"Funksionet",iconName:"layout-grid"}),Object.freeze({id:"analitika",label:"Analitika",iconName:"bar-chart-3"}),Object.freeze({id:"opsionet",label:"Opsionet",iconName:"settings"})]);function ae(e=""){const t=String(e||"").trim().toLowerCase();return qe.some(a=>a.id===t)?t:"funksionet"}function ga({activeTab:e="funksionet",iconFn:t}={}){const a=ae(e);return`<div class="mnyra-work__pills mnyra-dash__tabs" role="tablist" data-dashboard-panel-tabs>${qe.map(r=>{const s=r.id===a;return`
      <button
        type="button"
        role="tab"
        data-dashboard-panel-tab="${z(r.id)}"
        aria-selected="${s?"true":"false"}"
        aria-label="${z(r.label)}"
        title="${z(r.label)}"
        class="mnyra-work__pill"
      >${F(t,r.iconName,"w-4 h-4")}<span class="mnyra-work__pill-label">${z(r.label)}</span></button>
    `}).join("")}</div>`}function Qe(e=""){return`
    <div class="mnyra-work__bento mnyra-dash__bento" data-dashboard-bento>
      ${e}
    </div>
  `}function ma({posts:e=[],iconFn:t}={}){const a=Array.isArray(e)?e:[];let n="";return a.length?(n=a.map(r=>{const s=[r.dateLabel,`${V(r.likesCount||0)} Likes`,`${V(r.commentsCount||0)} Kommentare`];return Number(r.impressions||0)>0&&s.push(`${V(r.impressions)} shtrirje (7 dite)`),`
        <div class="mnyra-dash__post">
          <div class="mnyra-dash__post-thumb">
            ${r.thumbUrl?`<img src="${z(r.thumbUrl)}" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" />`:F(t,r.mediaType==="video"?"play":"image","w-5 h-5")}
          </div>
          <div class="mnyra-dash__post-main">
            <p class="mnyra-dash__post-caption">${z(r.caption||"Pa tekst")}</p>
            <p class="mnyra-dash__post-meta">${z(s.filter(Boolean).join(" · "))}</p>
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
  `}function fa(){return`
    <div class="mnyra-dash__section" data-dashboard-posts>
      <div class="mnyra-dash__section-head">
        <p class="mnyra-dash__section-title">Letzte Beiträge</p>
      </div>
      <div class="mnyra-dash__skeleton" style="min-height:200px;"></div>
    </div>
  `}function ba({title:e=""}={}){return`
    <div class="mnyra-dash__paywall" data-dashboard-paywall role="dialog" aria-modal="true">
      <div class="mnyra-dash__paywall-card">
        <p class="mnyra-dash__paywall-title">${z(e||"Me pagesë")}</p>
        <p class="mnyra-dash__paywall-body">Kjo pjesë është pjesë e planit me pagesë. Shkruaj me ne dhe e hapim për llogarinë tënde.</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-paywall-close>Ne rregull</button>
      </div>
    </div>
  `}function wa(){const e=Array.from({length:4},()=>'<div class="mnyra-dash__hl-card mnyra-dash__hl-card--pending" aria-hidden="true"></div>').join(""),t=Array.from({length:4},(a,n)=>`<div class="mnyra-dash__skeleton" style="min-height:132px; border-radius:var(--dash-card-radius); margin-top:${n===0?32:22}px;"></div>`).join("");return`
    <div class="mnyra-work__cards" data-dashboard-metrics="" aria-hidden="true">
      ${e}
      <span class="mnyra-dash__hl-tail"></span>
    </div>
    ${Qe(`
      <div class="mnyra-work__pills mnyra-dash__tabs" aria-hidden="true">
        ${Array.from({length:3},()=>'<div class="mnyra-dash__skeleton" style="min-height:var(--work-pill-height); border-radius:999px;"></div>').join("")}
      </div>
      ${t}
    `)}
  `}function _a({message:e=""}={}){return`
    <div class="mnyra-dash__section">
      <div class="mnyra-dash__state">
        <p class="mnyra-dash__state-title">Te dhenat nuk mund te ngarkoheshin</p>
        <p class="mnyra-dash__state-body">${z(e||"Ju lutem kontrollo lidhjen dhe provo perseri.")}</p>
        <button type="button" class="mnyra-dash__retry" data-dashboard-retry>Provo perseri</button>
      </div>
    </div>
  `}function ka(){return`
    <div class="mnyra-dash__state" style="margin-top:8px;">
      <p class="mnyra-dash__state-title">Nuk ka profil biznesi te lidhur</p>
      <p class="mnyra-dash__state-body">Paneli eshte i disponueshem vetem per llogari biznesi. Sapo llogaria jote te lidhet me nje restorant, hotel ose dyqan, i gjen ketu te gjitha funksionet ne nje vend.</p>
    </div>
  `}const va="menyra_social_dashboard_cache_v1::",Pe="menyra_social_composer_products_v1::",Ae=2500,Ee=1200,ya=6,xa=3,za=Object.freeze({menuImageUrl:"/apps/menyra-social/assets/panel/menu-scan.jpg",qrImageUrl:"/apps/menyra-social/assets/panel/qr-stand.jpg"}),Sa=Object.freeze({menuOpens:"Menü-Aufrufe",qrScans:"QR-Scans"});function M(e){const t=Number(e);return Number.isFinite(t)?t:0}function $a(e={}){const t=String(e.createdAtClient||"").trim();if(t){const n=new Date(t);if(!Number.isNaN(n.getTime()))return n}const a=e.createdAt;if(a&&typeof a.toDate=="function")try{const n=a.toDate();if(n instanceof Date&&!Number.isNaN(n.getTime()))return n}catch{}return null}function Ka(e="",t={}){const a=Array.isArray(t.media)&&t.media.length?t.media[0]:{},n=String(a.type||t.mediaType||"image").trim().toLowerCase()==="video"?"video":"image",r=String(a.thumbUrl||(n==="image"?a.url:"")||t.thumbUrl||"").trim(),s=n==="video"?String(a.url||t.mediaUrl||"").trim():"",h=$a(t);return{id:String(e||"").trim(),caption:String(t.caption||"").trim(),mediaType:n,thumbUrl:r,videoUrl:s,likesCount:M(t.likesCount),commentsCount:M(t.commentsCount),impressions:0,dateLabel:h?h.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}):"",createdAtMs:h?h.getTime():0}}function Da({days:e=[],todayKey:t="",rawPosts:a=[]}={}){const n=Array.isArray(e)?e:[],r=be(n),s=n.find(m=>String(m?.date||m?.id||"").trim()===String(t||"").trim()),h=be(s?[s]:[]),l=r.merged?.posts&&typeof r.merged.posts=="object"?r.merged.posts:{},p=(Array.isArray(a)?a:[]).map(m=>Ka(m?.id,m?.data||{})).filter(m=>m.id).map(m=>({...m,impressions:M(l[m.id]?.impressions)})),_=p.slice().sort((m,f)=>f.createdAtMs-m.createdAtMs).slice(0,xa);return{day:String(t||"").trim(),week:r.summary,today:h.summary,posts:_,latestPost:Pa(p)}}function Pa(e=[]){const t=(Array.isArray(e)?e:[]).filter(a=>a&&a.id);return t.length?t.slice().sort((a,n)=>M(n.createdAtMs)-M(a.createdAtMs)||M(n.impressions)-M(a.impressions)||M(n.likesCount)-M(a.likesCount))[0]:null}function Aa({profile:e={},restaurant:t={}}={}){return bt({profile:e,restaurant:t,feature:"qr"})}function Ea(e={}){const t=e&&typeof e=="object"?e:{};return String(t.titleImageUrl||t.coverImageUrl||t.coverUrl||t.heroUrl||t.bannerUrl||"").trim()}function Ra({model:e=null,coverUrl:t="",subscribed:a=!1,assets:n={}}={}){const r=e?.today||{},s=!e,h=e?.latestPost||null,l=[];if(s)l.push({key:"latestPost",label:"Postimi fundit",pending:!0});else if(!h)l.push({key:"latestPost",label:"Postimi fundit",emptyText:"S'ka postim",iconName:"image",composer:"post"});else{const p=String(h.thumbUrl||"").trim();l.push({key:"latestPost",label:"Postimi fundit",value:V(M(h.impressions)),withEye:!0,imageUrl:p,videoUrl:p?"":String(h.videoUrl||"").trim(),iconName:"image",panelTab:"analitika"})}return l.push({key:"profileViews",label:"Vizitor n'profil",value:V(M(r.profileViews)),withEye:!0,loading:s,imageUrl:String(t||"").trim(),iconName:"user",panelTab:"analitika"}),l.push({key:"menuOpens",label:"Vizitor n'meny",value:V(M(r.menuOpens)),withEye:!0,loading:s&&a,locked:!a,imageUrl:String(n.menuImageUrl||"").trim(),iconName:"book-open",panelTab:"analitika"}),l.push({key:"qrScans",label:"Skanime n'tavolina",value:V(M(r.qrScans)),withEye:!0,loading:s&&a,locked:!a,imageUrl:String(n.qrImageUrl||"").trim(),iconName:"layout-grid",panelTab:"analitika"}),l}function Ha({state:e,renderFn:t,documentObj:a,firestoreApi:n={},profileApi:r={},composerApi:s={},viewApi:h={},iconFn:l,storageObj:p}={}){const _=a||(typeof document>"u"?null:document),m=_?.defaultView||(typeof window>"u"?null:window),f=typeof t=="function"?t:()=>{},g=p||(typeof localStorage>"u"?null:localStorage),w=typeof r.getBusinessProfileTypeFn=="function"?r.getBusinessProfileTypeFn:(()=>""),v=typeof r.isShopCatalogProfileFn=="function"?r.isShopCatalogProfileFn:(()=>!1),G=typeof r.getRestaurantMetaByIdFn=="function"?r.getRestaurantMetaByIdFn:(()=>null),N=typeof r.resolveRestaurantLogoFn=="function"?r.resolveRestaurantLogoFn:(()=>""),S=typeof r.resolveOwnAvatarUrlFn=="function"?r.resolveOwnAvatarUrlFn:(()=>""),O=typeof h.renderAnalyticsViewFn=="function"?h.renderAnalyticsViewFn:(()=>""),C=typeof h.renderSettingsViewFn=="function"?h.renderSettingsViewFn:(()=>""),k=typeof h.warmAnalyticsFn=="function"?h.warmAnalyticsFn:(()=>{});let K=!1,$=0,x=!1,B=null,Z=null,L="",I=!1,ce=()=>null;const Ye=300;function ne(){const d=e?.userProfile||{};return ia({businessType:w(d),isShopCatalog:v(d)})}function Je(d=""){const c=G(d)||{};return Bt(c).map(u=>({id:u.id,name:u.title,price:u.price??"",category:u.beds||u.tag||"",type:"room",imageUrl:u.imageUrl||""}))}function Xe(d=""){if(!g)return null;try{const c=g.getItem(`${Pe}${d}`);if(!c)return null;const u=JSON.parse(c),b=Array.isArray(u?.items)?u.items:null;return b&&b.length?b:null}catch{return null}}function et(d="",c=[]){if(g)try{g.setItem(`${Pe}${d}`,JSON.stringify({savedAt:Date.now(),items:c}))}catch{}}async function tt(d=""){const{db:c,collectionFn:u,queryFn:b,limitFn:y,getDocsFn:D}=n;if(!c||typeof u!="function"||typeof D!="function")throw new Error("Produktet nuk u ngarkuan.");const H=u(c,"restaurants",d,"menuItems"),A=typeof b=="function"&&typeof y=="function"?b(H,y(Ye)):H,W=await D(A),P=[];return W.forEach(U=>{const J=ce(U?.id,U?.data?.()||{});J&&P.push(J)}),P.sort((U,J)=>U.name.localeCompare(J.name,"sq")),P}async function at(d="",c){const u=String(d||"").trim();if(!u)throw new Error("Produktet nuk u ngarkuan.");if(ne()==="hotel")return Je(u);const b=tt(u).then(D=>(et(u,D),D)),y=Xe(u);return y?(typeof c=="function"?b.then(D=>c(D)).catch(()=>{}):b.catch(()=>{}),y):b}function he(){return B?Promise.resolve(B):(Z||(Z=gt(()=>import("./business-composer-controller-DEJwtfke.js"),__vite__mapDeps([0,1,2,3,4,5,6])).then(d=>(ce=typeof d?.normalizeComposerProductCore=="function"?d.normalizeComposerProductCore:(()=>null),B=d.createBusinessComposerController({documentObj:_,windowObj:_?.defaultView||null,api:{getRestaurantIdFn:()=>Q(),getBusinessMetaFn:()=>{const c=Q();if(!c)return{name:"",logoUrl:"",city:""};const u=fe(c),b=G(c)||{};return{name:u.name,logoUrl:u.logoUrl,city:String(b.city||"").trim()}},loadProductsFn:(c,u)=>at(c,u),getBusinessKindFn:()=>ne(),uploadImageFn:s.uploadImageFn,uploadVideoFn:s.uploadVideoFn,captureVideoPosterFn:s.captureVideoPosterFn,createPostFn:s.createPostFn,createStoryFn:s.createStoryFn,formatPriceFn:s.formatPriceFn,getOptimizedImageUrlFn:s.getOptimizedImageUrlFn,escapeHtmlFn:s.escapeHtmlFn,iconFn:typeof l=="function"?l:void 0,afterPublishFn:async c=>{try{await Y({force:!0})}catch{}typeof s.afterPublishFn=="function"&&await s.afterPublishFn(c)}}}),B)).catch(d=>{throw Z=null,console.error("[mnyra][dashboard] composer load failed",d),d})),Z)}function ue(){const d=m?.navigator?.connection;return!d||typeof d!="object"?!1:d.saveData===!0?!0:/(^|-)2g$/.test(String(d.effectiveType||"").trim().toLowerCase())}function nt(){if(I||B||!m||ue())return;I=!0;const d=()=>{if(he().catch(()=>{}),typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}};if(typeof m.requestIdleCallback=="function"){m.requestIdleCallback(d,{timeout:Ae});return}m.setTimeout?.(d,Ee)}function it(){if(K||!m||ue())return;K=!0;const d=()=>{try{k()}catch{}};if(typeof m.requestIdleCallback=="function"){m.requestIdleCallback(d,{timeout:Ae});return}m.setTimeout?.(d,Ee)}function rt(d="post"){const c=String(d||"").trim().toLowerCase(),u=c==="story"||c==="profile"?c:"post";if(typeof s.prewarmFn=="function")try{s.prewarmFn()}catch{}if(B){B.open(u);return}L=u,he().then(b=>{const y=L||u;L="",b?.open?.(y)}).catch(()=>{L=""})}function ie(){return(!e.dashboardView||typeof e.dashboardView!="object")&&(e.dashboardView={status:"idle",error:"",model:null,loadedSignature:"",restaurantId:"",paywall:""}),e.dashboardView}function pe(d=""){const c=ie(),u=String(d||"").trim();return String(c.restaurantId||"")===u||(c.restaurantId=u,c.model=null,c.status="idle",c.error="",c.loadedSignature="",c.paywall="",$+=1),c}function Q(){const d=e?.userProfile||{};return String(d.restaurantId||d.staffRestaurantId||"").trim()}let ge="";function st(){const d=String(e?.user?.uid||"").trim();!d||ge===d||typeof r.ensureBusinessProfileFn=="function"&&(ge=d,Promise.resolve().then(()=>r.ensureBusinessProfileFn()).catch(c=>{console.warn("[mnyra][panel] business profile could not be resolved",c)}).finally(()=>{String(e?.user?.uid||"").trim()===d&&f()}))}function ot(){const d=String(e?.user?.uid||"").trim();if(!d)return!1;const c=String(e?.__authBootstrapInFlightUid||"").trim();return!!e?.__authProfileLoadPromise||c===d}function me(d=""){return`${va}${d}`}function dt(d="",c=""){if(!g||!d)return null;try{const u=g.getItem(me(d));if(!u)return null;const b=JSON.parse(u);return!b||typeof b!="object"||String(b.day||"").trim()!==String(c||"").trim()||!b.model||typeof b.model!="object"?null:b.model}catch{return null}}function lt(d="",c=null){if(!(!g||!d||!c))try{g.setItem(me(d),JSON.stringify({day:c.day,model:c}))}catch{}}async function ct(d=""){const{db:c,collectionFn:u,queryFn:b,orderByFn:y,limitFn:D,getDocsFn:H}=n;if(!c||typeof u!="function"||typeof b!="function"||typeof y!="function"||typeof D!="function"||typeof H!="function")return[];const A=u(c,"restaurants",d,"socialPosts");return(await H(b(A,y("createdAt","desc"),D(ya)))).docs.map(P=>({id:P.id,data:P.data()||{}})).filter(P=>{const U=String(P.data.status||"active").trim().toLowerCase();return U!=="deleted"&&U!=="hidden"})}async function Y({force:d=!1}={}){const c=Q(),u=pe(c);if(!c)return;const b=mt({rangeKey:"7d"});if(!b)return;const y=`${c}::${b.toDay}`;if(!d&&u.loadedSignature===y&&u.status==="ready")return;if(!u.model){const A=dt(c,b.toDay);A&&(u.model=A,u.status="ready",f())}$+=1;const D=$;u.model||(u.status="loading",u.error="",f());try{const A={db:n.db,collectionFn:n.collectionFn,queryFn:n.queryFn,whereFn:n.whereFn,documentIdFn:n.documentIdFn,getDocsFn:n.getDocsFn,restaurantId:c},[W,P]=await Promise.allSettled([ft({...A,fromDay:b.fromDay,toDay:b.toDay}),ct(c)]);if(D!==$)return;if(W.status==="rejected")throw W.reason;P.status==="rejected"&&console.error("[mnyra][dashboard] recent posts load failed",P.reason),u.model=Da({days:W.value,todayKey:b.toDay,rawPosts:P.status==="fulfilled"?P.value:[]}),u.status="ready",u.error="",u.loadedSignature=y,lt(c,u.model)}catch(A){if(D!==$)return;console.error("[mnyra][dashboard] load failed",A),u.model||(u.status="error",u.error="Ju lutem kontrollo lidhjen dhe provo perseri.")}f()}function ht(){x||!_||(x=!0,_.addEventListener("click",d=>{try{if(String(e?.activeTab||"").trim().toLowerCase()!=="dashboard")return;if(d.target?.closest?.("[data-dashboard-retry]")){Y({force:!0});return}if(d.target?.closest?.("[data-dashboard-paywall-close]")){d.preventDefault(),ie().paywall="",f();return}const c=d.target?.closest?.("[data-dashboard-metric-locked]");if(c){d.preventDefault(),ie().paywall=String(c.getAttribute("data-dashboard-metric-locked")||"").trim(),f();return}const u=d.target?.closest?.("[data-dashboard-composer]");if(u){d.preventDefault(),rt(u.getAttribute("data-dashboard-composer"));return}const b=d.target?.closest?.("[data-dashboard-panel-tab]");if(b){d.preventDefault();const y=ae(b.getAttribute("data-dashboard-panel-tab"));if(y===ae(e?.dashboardPanelTab))return;e.dashboardPanelTab=y,f()}}catch{}}))}function fe(d=""){const c=e?.userProfile||{},u=d?G(d)||{}:{},b=String(u.name||u.restaurantName||c.name||"").trim()||"Business";let y="";try{y=String(S()||"").trim()}catch{}if(!y)try{y=String(N(u)||"").trim()}catch{}return{name:b,logoUrl:y,kind:ne(),coverUrl:Ea(u),subscribed:Aa({profile:c,restaurant:u})}}function ut(d=""){try{if(!St()||!d)return"";$t({restaurantId:d,onBadgeFn:()=>f()});const c=Kt();return Ot({enabled:!0,unseenCount:c.unseen,activeOffers:c.activeOffers||0,todayBookings:c.today,iconFn:l})}catch{return""}}function pt(){aa(_),ht();const d=Q(),c=pe(d);let u="";if(!d)st(),u=ot()?wa():ka();else{nt(),it();const b=fe(d),y=ae(e?.dashboardPanelTab);c.status==="idle"&&(c.status="loading",queueMicrotask(()=>{Y({force:!1})}));let D="";c.model?D=ma({posts:c.model.posts,iconFn:l}):c.status==="error"?D=_a({message:c.error}):D=fa();const H=`
        ${ut(d)}
        ${ra({iconFn:l})}
        ${ha({iconFn:l,showEditor:!!d})}
        ${sa({iconFn:l,showEditor:!!d})}
        ${oa({iconFn:l,showEditor:!!d})}
        ${la({iconFn:l,kind:b.kind,showEditor:!!d})}
      `;let A;y==="analitika"?A=`
          <div class="mnyra-dash__embed">${O()}</div>
          ${D}
        `:y==="opsionet"?A=`<div class="mnyra-dash__embed">${C()}</div>`:A=H;const W=Ra({model:c.model,coverUrl:b.coverUrl,subscribed:b.subscribed,assets:za}),P=String(c.paywall||"").trim();u=`
        ${ua({cards:W,iconFn:l})}
        ${Qe(`
          ${ga({activeTab:y,iconFn:l})}
          ${A}
        `)}
        ${P?ba({title:Sa[P]||"Me pagesë"}):""}
      `}return`
      <section class="mnyra-work mnyra-dash" data-dashboard-root>
        ${u}
      </section>
    `}return Object.freeze({renderDashboardView:pt,loadDashboard:Y})}export{Ia as B,te as G,Pt as M,Ha as a,Za as b,At as c,Na as d,Oa as e,Ta as f,ea as g,Qt as h,Ze as i,X as j,le as k,de as l,Le as m,Ft as n,Bt as o,ja as p,Ga as q,La as r};
