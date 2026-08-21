// Die Mnyra-Bildschirme, die Landing 2 zeigt.
//
// Das hier sind keine Nachzeichnungen. Jeder Bildschirm traegt das Markup und
// die Klassennamen des echten Renderers, und die Regeln dahinter kommen aus
// derselben Quelle: Landing 2 laedt das Stylesheet der App
// (styles/tailwind.generated.css) und dazu landing2-app-mirror.css - die
// Blaetter, die in der App als JavaScript-Zeichenketten liegen, Zeichen fuer
// Zeichen abgeschrieben (scripts/generate-landing2-app-mirror.mjs).
//
// Warum nachgebaut und nicht die App eingebettet: Eine eingebettete App haette
// einen eigenen Router, eigene Listener und einen Schreibpfad. Ein Tipp auf
// "Shto" waere dann eine echte Bestellung. Landing 2 zeigt sein Lokal - sie
// fasst es nicht an.
//
// Deshalb steht in jedem Bildschirm das Markup der App, aber ohne einen
// einzigen Haken: Die data-Attribute, an denen die App ihre Handler haengt,
// sind entfernt, href fehlt, und die ganze Flaeche traegt pointer-events:none.
// Was aussieht wie ein Knopf, ist einer - er kann nur niemanden erreichen.
//
// Zu jedem Abschnitt steht die Quelle in der App. Wer eine Flaeche aendert,
// findet hier, was mitgeht. tests/landing2-parity.test.mjs haelt die
// Klassenketten gegen die echten Renderer.

import { esc, firstText, formatCount, formatPrice, initial, num, text } from "./landing2-format.js";
import { goIcon, icon } from "./landing2-icons.js";

// Derselbe Platzhalter wie in der App (PLACEHOLDER_IMAGE).
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180'%3E%3Crect width='240' height='180' fill='%23f1f5f9'/%3E%3C/svg%3E";

function img(src, alt = "", className = "", { eager = false, style = "" } = {}) {
  const safeSrc = text(src) || PLACEHOLDER_IMAGE;
  const priority = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  return `<img src="${esc(safeSrc)}" alt="${esc(alt)}" class="${esc(className)}"${style ? ` style="${esc(style)}"` : ""} ${priority} decoding="async" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}'" />`;
}

// Ein kleines rundes Logo (Feed, Suche, Karte). Ohne Bild traegt es den
// Anfangsbuchstaben - in der App steht dort der graue Platzhalter, aber der
// wuerde auf einer Verkaufsseite wie ein Fehler aussehen. Das ist ein
// bewusster Unterschied; er steht in der Dokumentation.
function logoTile(url, name = "", className = "") {
  const found = text(url);
  if (found) return img(found, "", className);
  return `<div class="${esc(className)} bg-slate-100 flex items-center justify-center text-slate-400 font-black">${esc(initial(name))}</div>`;
}

/* ------------------------------------------------------------- Der Rahmen */

// Die Flaeche, auf der ein Mnyra-Bildschirm steht.
//
// Sie traegt den Grund der App (--app-bg) und ihr Seitenpolster
// (--app-content-inline) - beides aus landing2-app-mirror.css, also dieselben
// Zahlen wie in der App. Der Rahmen selbst gehoert Landing 2: In der App ist
// das der ganze Bildschirm, hier ist es eine Karte auf einer Seite.
//
// pills: die Kopfzeile mit Qyteti / Lokalet / Mnyra GO - dieselbe Zeile wie in
// der App (app-shell-runtime-controller.js), nur ohne Handler.
//
// pan: Der Inhalt darf laenger sein als das Fenster, und der Scrollstand der
// Landing schiebt ihn kontrolliert nach oben (landing2-scroll.js). Das ist
// bewusst KEIN zweiter Scrollbereich - der Finger bedient weiter nur die
// Seite. Ohne diese Bewegung sieht ein Wirt von seinem Profil immer nur die
// oberen 450 Punkte; mit ihr sieht er beim Weiterscrollen mehr davon, ohne
// dass er lernen muesste, wo er hinfassen soll.
//
// Die Kopfzeile bleibt ausserhalb: Sie steht in der App ueber dem Inhalt und
// wandert dort auch nicht mit.
// Die Kopfzeile der App: Qyteti / Lokalet / Mnyra GO. Dieselbe Zeile wie in
// der App (app-shell-runtime-controller.js), nur ohne Handler. Sie steht
// ausserhalb des wandernden Inhalts - in der App wandert sie dort auch nicht
// mit.
function pillRow(active = "") {
  if (!active) return "";
  const tabs = [
    { id: "feed", iconName: "home", label: "Qyteti" },
    { id: "restaurants", iconName: "utensils", label: "Lokalet" },
    { id: "go", iconName: "zap", label: "Mnyra GO" }
  ];
  return `
    <div class="smart-header-tabs-row">
      ${tabs.map((tab) => `
        <span aria-current="${tab.id === active ? "page" : "false"}" class="smart-header-pill smart-header-pill--${esc(tab.id)} ${tab.id === active ? "smart-header-pill--active" : ""}">${icon(tab.iconName, "smart-header-pill__icon")}<span class="smart-header-pill__label">${esc(tab.label)}</span></span>
      `).join("")}
    </div>
  `;
}

export function screen(body = "", { pills = "", label = "", surface = "plane", pan = false } = {}) {
  return `
    <div class="l2-screen l2-screen--${esc(surface)}" role="img" aria-label="${esc(label || "Pamje nga Mnyra")}">
      <div class="l2-screen__inner">
        ${pillRow(pills)}
        <div class="l2-screen__pan${pan ? " l2-screen__pan--move" : ""}"${pan ? ' data-l2-pan="1"' : ""}>
          ${body}
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------- Der laufende Bildschirm */

// Ein Mnyra-Bildschirm, durch den man scrollt - und nicht eine Reihe von
// Aufnahmen, die einander ersetzen.
//
// Das ist der Unterschied, um den es auf dieser Seite geht. Ein Wirt, der
// sein Profil sieht und weiterwischt, soll nicht das Gefuehl haben, die Seite
// habe ihm ein anderes Bild hingelegt. Er soll das Gefuehl haben, in seinem
// Profil weiter nach unten zu scrollen - so, wie er es im Telefon taete.
//
// Drei Teile, und jeder traegt genau eine Bewegung:
//
//   head    der Kopf. Er wandert beim ersten Schritt nach oben aus dem Bild -
//           genau so weit, dass darunter nichts Fremdes hervorkommt. Wie hoch
//           er mindestens ist, misst landing2-scroll.js: mindestens so hoch,
//           dass unter ihm im ersten Zustand NICHTS zu sehen ist. Sonst
//           schaute schon beim Profilkopf die erste Beitragskachel herein -
//           und der erste Zustand waere nicht mehr "dein Profil", sondern
//           "dein Profil und noch etwas".
//   stick   was stehenbleibt, sobald der Kopf weg ist: die Reiterleiste. Sie
//           wird nicht ausgetauscht und nicht neu gebaut - es ist dieselbe
//           Leiste, die vorher unter dem Kopf stand.
//   panels  was darunter laeuft. Ein Feld je Zustand; laenger als sein
//           Fenster darf es sein, der Scrollstand schiebt es (data-l2-pan).
//
// Ein Feld kann sich ueber mehrere Zustaende erstrecken (from/to). Die
// Beitraege des Profils zum Beispiel gehoeren zu Zustand 0 UND 1: Im ersten
// liegen sie unter dem Kopf und sind nicht zu sehen, im zweiten sind sie da,
// weil der Kopf gegangen ist. Kein Wechsel, kein Aufblenden - nur Scroll.
export function flowScreen({
  pills = "",
  label = "",
  surface = "plane",
  head = "",
  // Muss der Kopf im ersten Zustand den ganzen Bildschirm fuellen?
  //
  // Beim Profil und bei Qyteti ja: Dort IST der Kopf der erste Zustand, und
  // was darunter steht, darf noch nicht hereinschauen. Beim Paneli nein -
  // dort gehoert die Flaeche unter der Reiterleiste von Anfang an zum Bild,
  // genau wie in der App. Ein Kopf, der auch dort fuellte, haette einen
  // Bildschirm voll leerer Flaeche unter den Kennzahlen erzeugt.
  headFill = false,
  stick = "",
  panels = []
} = {}) {
  const list = Array.isArray(panels) ? panels.filter(Boolean) : [];
  return `
    <div class="l2-screen l2-screen--${esc(surface)}" role="img" aria-label="${esc(label || "Pamje nga Mnyra")}">
      <div class="l2-screen__inner">
        ${pillRow(pills)}
        <div class="l2-flow">
          <div class="l2-flow__col" data-l2-col>
            ${head ? `<div class="l2-flow__head" data-l2-head="${headFill ? "fill" : "free"}">${head}</div>` : ""}
            ${stick ? `<div class="l2-flow__stick" data-l2-stick>${stick}</div>` : ""}
            <div class="l2-flow__panels" data-l2-panels>
              ${list.map((panel, index) => `
                <div class="l2-flow__panel" data-l2-panel data-from="${esc(String(panel.from ?? 0))}" data-to="${esc(String(panel.to ?? panel.from ?? 0))}"${index ? ' aria-hidden="true"' : ""}>
                  <div class="l2-flow__pan" data-l2-pan="1">${panel.html || ""}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ Profil */

// Quelle: renderBusinessProfileIdentityCard (mode "public") in
// core/profile/profile-menu-focus-render-controller.js.
//
// Uebernommen ist alles: die Karte (rounded-[2.5rem], border-slate-100,
// min-height 440px), das 160px hohe Cover mit seinem Schleier und der weissen
// Blende darunter, die runden Knoepfe oben rechts, das um 3rem
// hochgezogene Bild mit seinem Verlaufsrand, die Zaehlerspalte, der
// Namensblock mit dem Verlaufstext und die beiden Knoepfe.
function profileQuickLink(iconName = "") {
  return `<span class="w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform">${icon(iconName, "w-4 h-4")}</span>`;
}

export function previewProfileCard(profile = {}, { eager = false } = {}) {
  const profileName = text(profile.name) || "User";
  const typeLabel = text(profile.type) || "Business";
  const locationLabel = text(profile.city) || "-";
  const metaLine = `${locationLabel} / ${typeLabel}`;
  const safeBio = esc(text(profile.bio)) || esc("Nuk ka bio.");
  const followersLabel = formatCount(profile.followers);
  const hasMap = !!(text(profile.address) || (Array.isArray(profile.locations) && profile.locations.length));

  const quickLinks = [
    hasMap ? profileQuickLink("map") : "",
    firstText(profile.tiktokUrl, profile.tiktok) ? profileQuickLink("music-2") : "",
    firstText(profile.instagramUrl, profile.instagram) ? profileQuickLink("instagram") : ""
  ].filter(Boolean).join("");

  const coverUrl = text(profile.coverUrl);
  const avatarUrl = text(profile.logoUrl);

  return `
    <div class="bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm" style="min-height: var(--business-profile-card-min-height, 440px);">
      <div class="h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none">
        ${coverUrl
          ? img(coverUrl, profileName, "w-full h-full object-cover", { eager })
          : `<div class="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div><div class="relative z-10 w-14 h-14 rounded-[1.8rem] bg-white/10 text-white/70 flex items-center justify-center">${icon("store", "w-7 h-7")}</div>`
        }
        <div class="absolute inset-0" style="background:rgba(15,23,42,0.24);"></div>
        <div class="absolute inset-x-0 bottom-0" style="height:4rem;background:linear-gradient(to top, #fff 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,0) 100%);"></div>
        <div class="absolute top-4 right-4 flex items-center gap-2 z-30">
          ${quickLinks}
        </div>
      </div>
      <div class="px-8 pb-8 relative z-20" style="margin-top:-3rem;">
        <div class="flex items-end justify-between w-full">
          <div class="relative">
            <div class="relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
              ${avatarUrl
                ? img(avatarUrl, `${profileName} logo`, "w-full h-full rounded-[1.8rem] object-cover border-2 border-white bg-white", { eager })
                : `<div class="w-full h-full rounded-[1.8rem] border-2 border-white bg-slate-100 flex items-center justify-center">${icon("store", "w-8 h-8 text-slate-300")}</div>`
              }
            </div>
          </div>
          <div class="flex items-center gap-6 pb-1 pr-2">
            <div class="flex flex-col items-center min-w-0">
              <span class="font-black text-2xl text-slate-900 leading-none mb-1">${esc(String(followersLabel))}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Fans</span>
            </div>
            <div class="w-px h-8 bg-slate-100"></div>
            <span class="flex flex-col items-center min-w-0 active:scale-95 transition-transform">
              <span class="h-7 flex items-center justify-center text-slate-900">${icon("info", "w-5 h-5")}</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">Info</span>
            </span>
          </div>
        </div>
        <div class="mt-6 mb-8">
          <h1 class="font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3">${esc(profileName)}</h1>
          <p class="text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]">${safeBio}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">${esc(metaLine)}</p>
        </div>
        <div class="flex items-center gap-4">
          <span class="flex-1 h-[56px] rounded-[1.2rem] font-bold text-xs uppercase tracking-widest shadow-[0_10px_20px_-5px_rgba(15,23,42,0.25)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 text-white border border-transparent">
            <span class="relative z-10 flex items-center gap-2">Follow</span>
          </span>
          <span class="w-[56px] h-[56px] flex items-center justify-center rounded-[1.2rem] border border-slate-200 bg-white text-slate-900 active:scale-[0.95] transition-all duration-300 shadow-sm group">
            ${icon("message-circle", "w-5 h-5")}
          </span>
        </div>
      </div>
    </div>
  `;
}

// Quelle: renderProfileTabs im selben Modul.
//
// EINE Leiste, nicht zwei. Sie steht im Markup genau einmal, und wenn der
// Scrollstand den Reiter wechselt, aendern sich nur die Klassen an den beiden
// Feldern - dieselbe Bewegung, die die App zeigt, wenn jemand mit dem Finger
// auf "Menu" tippt (transition-all duration-300 steht in der Kette der App).
//
// Deshalb tragen die Felder ihre beiden Klassensaetze bei sich: Der Antrieb
// in landing2-scroll.js soll nicht wissen muessen, wie ein aktiver Reiter in
// Mnyra aussieht - er soll nur umschalten.
const PROFILE_TAB_BASE = "flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2";
const PROFILE_TAB_ON = "bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]";
const PROFILE_TAB_OFF = "text-slate-400";

export function previewProfileTabs(activeTab = "posts") {
  const tabs = [
    { id: "posts", label: "Postimet" },
    { id: "menu", label: "Menu" }
  ];
  return `
    <div class="app-content-inline mb-6 mt-4">
      <div class="bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm">
        ${tabs.map((tab) => `
          <span class="${PROFILE_TAB_BASE} ${activeTab === tab.id ? PROFILE_TAB_ON : PROFILE_TAB_OFF}"
            data-l2-tab="${esc(tab.id)}"
            data-l2-tab-on="${esc(PROFILE_TAB_ON)}"
            data-l2-tab-off="${esc(PROFILE_TAB_OFF)}">
            ${esc(tab.label)}
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

// Quelle: renderProfilePostCardMarkupCore in
// core/profile/profile-post-card-markup-utils.js - dieselbe Datei, mit der
// auch der Business-Composer seine Vorschau zeichnet.
function profilePostCard(post = {}) {
  return `
    <div class="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] transition-transform">
      <div class="absolute inset-0 rounded-[2rem] overflow-hidden active:scale-[0.98] transition-transform">
        ${img(post.imageUrl, text(post.caption) || "Postim", "w-full h-full object-cover")}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${icon("heart", "w-3 h-3 fill-rose-500 text-rose-500")}
                <span class="text-[10px] font-bold tracking-wide">${esc(formatCount(post.likeCount))}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${icon("message-circle", "w-3 h-3 text-indigo-200")}
                <span class="text-[10px] font-bold tracking-wide">${esc(formatCount(post.commentCount))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Quelle: renderPublicProfileSurface - das Raster der Beitraege.
//
// Zwei Beitraege, nicht vier. Diese Seite ist keine Profilhistorie: Der Wirt
// soll sehen, wie SEIN Beitrag in Mnyra aussieht, und dafuer reicht die
// letzte Reihe. Vier Kacheln waeren zwei Reihen, und die zweite muesste
// erscrollt werden, bevor der naechste Zustand ueberhaupt an der Reihe ist.
export function previewPosts(posts = []) {
  const shown = posts.slice(0, 2);
  if (!shown.length) {
    return `
      <div class="app-content-inline">
        <div class="col-span-2 py-24 text-center">
          <div class="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-slate-100 to-white mx-auto flex items-center justify-center text-slate-300 mb-6 shadow-sm rotate-6 border border-slate-50">
            ${icon("image", "w-9 h-9")}
          </div>
          <p class="text-slate-400 text-sm font-bold tracking-wide">Nuk u gjet permbajtje</p>
        </div>
      </div>
    `;
  }
  return `
    <div class="grid grid-cols-2 gap-4 app-content-inline grid-flow-dense pt-4">
      ${shown.map(profilePostCard).join("")}
    </div>
  `;
}

/* ------------------------------------------------------------------- Menue */

// Quelle: renderTestfirstFocusSection, renderTestfirstDrinkGridCard,
// renderTestfirstFoodCard und renderTestfirstMenuContent in
// core/profile/profile-menu-focus-render-controller.js.
function focusCard(item = {}) {
  return `
    <div class="min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2" style="box-shadow:0 4px 14px rgba(0,0,0,0.03);">
      <div class="w-full aspect-[16/9] rounded-[1.5rem] overflow-hidden bg-slate-100 relative" style="aspect-ratio:16 / 9;">
        ${img(item.imageUrl, text(item.title), "w-full h-full object-cover select-none pointer-events-none", { style: "width:100%;height:100%;object-fit:cover;object-position:50% 50%;" })}
        <div class="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-white/50">
          ${icon("sparkles", "w-3 h-3 text-amber-500")}
          <span class="text-[10px] font-black text-slate-900 uppercase tracking-widest pt-[1px]">Tipp</span>
        </div>
      </div>
      <div class="px-2 py-4">
        <h3 class="text-[17px] font-black text-slate-900 leading-tight">${esc(item.title || "")}</h3>
        <p class="text-[13px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">${esc(item.body || "")}</p>
      </div>
    </div>
  `;
}

function foodCard(item = {}, currency = "EUR") {
  const priceLabel = item.price !== null && item.price !== undefined ? formatPrice(item.price, currency) : "";
  return `
    <div class="bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative" style="padding:14px;border-radius:2.2rem;margin-bottom:20px;box-sizing:border-box;">
      <div class="w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative" style="aspect-ratio:16 / 9;border-radius:1.8rem;margin-bottom:16px;">
        <div class="w-full h-full">
          ${img(item.imageUrl, text(item.name), "w-full h-full object-cover select-none pointer-events-none", { style: "object-position:50% 50%;" })}
        </div>
        <span class="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full border border-white/80 bg-white/90 flex items-center justify-center transition-colors shadow-sm z-10 text-slate-300">
          ${icon("heart", "w-4 h-4 fill-current opacity-80")}
        </span>
      </div>
      <div class="px-2" style="padding-left:8px;padding-right:8px;">
        <div class="flex items-start justify-between gap-3 mb-1.5" style="gap:12px;margin-bottom:6px;">
          <div>
            <h4 class="text-[18px] font-black text-slate-900 leading-snug">${esc(item.name || "")}</h4>
          </div>
          <span class="text-[17px] font-black text-slate-900 whitespace-nowrap">${esc(priceLabel)}</span>
        </div>
        <p class="text-[14px] text-slate-500 line-clamp-2 leading-relaxed mb-4" style="margin-bottom:16px;">${esc(item.description || "")}</p>
        <div class="flex items-center justify-between border-t border-slate-50 pt-4 pb-1" style="padding-top:16px;padding-bottom:4px;">
          <div class="flex items-center gap-2"></div>
          <span class="bg-slate-900 text-white pl-4 pr-2 py-2 rounded-2xl text-[13px] font-bold shadow-md transition-colors flex items-center gap-2 active:scale-95" style="padding-left:16px;padding-right:8px;padding-top:8px;padding-bottom:8px;">
            <span>Shto</span>
            <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center pointer-events-none">
              ${icon("plus", "w-4 h-4 text-white")}
            </div>
          </span>
        </div>
      </div>
    </div>
  `;
}

// "Sot ne Fokus" und zwei Speisen - und ausdruecklich nicht die ganze Karte.
//
// Der Wirt muss hier nicht seine Karte lesen; er hat sie selbst geschrieben.
// Er muss sehen, wie ein Gast sie sieht. Dafuer reichen die Flaeche oben, die
// in Mnyra "Sot ne Fokus" heisst, und darunter zwei Speisen in der grossen
// Karte. Getraenke, Kategorien und die uebrigen zwanzig Produkte sagen an
// dieser Stelle nichts mehr dazu - sie machen den Zustand nur laenger, als
// ein Wisch traegt.
//
// Verkleinert wird nichts. Was nicht ins Fenster passt, schiebt der
// Scrollstand herein (landing2-scroll.js) - so, wie ein Gast in der Karte
// weiterscrollt.
export function previewMenu(profile = {}, menuItems = [], focusItems = []) {
  const currency = profile.currency || "EUR";
  const content = menuItems.filter((item) => item.cardStyle !== "testfirst_focus");
  const pool = content.length ? content : menuItems;
  const foods = pool.filter((item) => item.section !== "drink");
  const shown = (foods.length ? foods : pool).slice(0, 2);
  const focus = focusItems.slice(0, 1);

  if (!shown.length && !focus.length) {
    return `
      <div class="app-content-inline pt-4">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menuja vendoset një herë</div>
        </div>
      </div>
    `;
  }

  return `
    <div>
      ${focus.length ? `
        <div class="pt-2 pb-4">
          <div class="flex gap-4 overflow-x-auto hide-scrollbar snap-x horizontal-safe-scroll pb-4">
            ${focus.map(focusCard).join("")}
          </div>
        </div>
      ` : ""}
      <div id="menu-section" class="mt-5">
        ${shown.length ? `
          <section class="menu-type-block relative">
            <div class="menu-category-section pb-6 pt-4">
              <div class="app-content-inline">
                ${shown.map((item) => foodCard(item, currency)).join("")}
              </div>
            </div>
          </section>
        ` : ""}
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------- Produkt-Detail */

// Quelle: renderMenuDetailModalCore in core/menu/menu-modal-render-utils.js -
// die Ansicht, die ein Gast sieht, wenn er ein Produkt antippt. Uebernommen
// sind Kopfzeile, Bildflaeche, Preiszeile und die drei Info-Reiter.
export function previewProduct(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const item = menuItems.find((entry) => entry.imageUrl && entry.description)
    || menuItems.find((entry) => entry.imageUrl)
    || menuItems[0];
  if (!item) {
    return `
      <div class="app-content-inline pt-4">
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
          <div class="text-center py-12 text-[10px] font-bold uppercase tracking-widest text-slate-400">Çdo produkt merr foton, çmimin dhe alergjenët e vet</div>
        </div>
      </div>
    `;
  }
  const priceLabel = item.price !== null && item.price !== undefined ? formatPrice(item.price, currency) : "";
  // In der App stehen die drei Reiter nebeneinander und einer davon ist offen.
  // Hier ist es der dritte: Der Preis steht schon darueber, die Beschreibung
  // stand im Menue - was ein Gast an dieser Stelle wirklich sucht und sonst
  // erfragen muss, sind die Allergene. Es ist derselbe Bildschirm, nur in dem
  // Zustand, der hier etwas sagt.
  const noInfo = "Nuk ka informacion";
  const allergensText = text(item.allergens) || noInfo;
  const infoTabClass = (active) => [
    "h-10 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center select-none",
    active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200"
  ].join(" ");

  return `
    <div class="bg-white">
      <div class="menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white">
        <div class="min-w-0 flex items-center flex-1">
          <div class="min-w-0">
            <h3 class="text-[1.05rem] leading-tight font-black tracking-tight text-slate-900 truncate">${esc(item.name || "Produkt")}</h3>
            ${item.category ? `<div class="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">${esc(item.category)}</div>` : ""}
          </div>
        </div>
        <span class="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
          ${icon("x", "w-4 h-4")}
        </span>
      </div>
      <div class="px-7 py-6 bg-white/98">
        <div class="relative h-56 rounded-[2.8rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
          ${img(item.imageUrl, text(item.name), "absolute inset-0 w-full h-full object-cover", { style: "object-position:50% 50%;" })}
        </div>
        <div class="mt-6 space-y-5">
          <div class="p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Çmimi</span>
              <span class="font-black text-slate-900" style="font-size:13px;">${esc(priceLabel)}</span>
            </div>
          </div>
          <div class="border-t border-slate-100"></div>
          <div class="space-y-3">
            <div class="menu-detail-info-tabs space-y-4">
              <div class="grid grid-cols-3 gap-2 menu-detail-info-controls">
                <span class="${infoTabClass(false)}">Info</span>
                <span class="${infoTabClass(false)}">Përbërësit</span>
                <span class="${infoTabClass(true)}">Alergjenët</span>
              </div>
              <div class="menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5">
                <p class="menu-detail-info-panel text-sm text-slate-600 leading-relaxed whitespace-pre-line">${esc(allergensText)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10">
        <div class="flex gap-3 items-center w-full transition-all duration-300">
          <span class="w-[52px] h-[52px] shrink-0 rounded-[1.65rem] bg-slate-100 text-slate-600 flex items-center justify-center transition-all active:scale-95 relative">
            ${icon("message-square", "w-5 h-5")}
          </span>
          <span class="flex-1 h-[52px] rounded-[1.65rem] bg-slate-900 text-white flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span class="font-bold text-sm">Shto ne shporte</span>
            <span class="menu-detail-cart-icon">
              ${icon("shopping-bag", "w-4 h-4")}
            </span>
          </span>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------- Qyteti */

// Quelle: renderStoryTileMarkupCore (core/feed/story-tile-markup-utils.js),
// renderSpotStoryIntroCard und renderStoriesRow
// (core/feed/feed-view-orchestration-controller.js) sowie
// renderFeedCardMarkupCore (core/feed/feed-card-markup-utils.js) - dieselben
// Dateien, mit denen der Business-Composer seine Vorschau zeichnet.
function storyIntroCard() {
  return `
    <div class="flex-none w-[29%] sm:w-[120px] snap-start ml-5" style="flex:0 0 29%;width:29%;max-width:120px;margin-left:1.25rem;">
      <div class="relative h-52 rounded-2xl overflow-hidden shadow-lg p-3 flex flex-col justify-between border border-white/10" style="height:13rem;border-radius:1rem;position:relative;overflow:hidden;background:linear-gradient(145deg,#111827 0%,#1f2937 52%,#000000 100%);padding:0.75rem;display:flex;flex-direction:column;justify-content:space-between;">
        <div class="relative z-10" style="position:relative;z-index:10;">
          <div style="position:absolute;top:26px;left:13px;height:1.5rem;border-left:2px dashed rgba(255,255,255,0.8);"></div>
          <div style="position:absolute;top:49px;left:10px;width:0.5rem;height:0.5rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.7);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
            <div style="width:0.25rem;height:0.25rem;border-radius:9999px;background:#fff;"></div>
          </div>
          <div class="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 relative z-10 shadow-sm" style="position:relative;z-index:10;background:linear-gradient(180deg,rgba(255,255,255,0.22) 0%,rgba(255,255,255,0.06) 100%);">
            ${icon("map-pin", "w-3.5 h-3.5 text-white")}
          </div>
        </div>
        <div class="mt-auto relative z-10" style="margin-top:auto;position:relative;z-index:20;">
          <h2 class="font-black text-white uppercase leading-[1.05] tracking-tight w-full mb-1.5 opacity-95" style="font-size:clamp(14px,4.2vw,18px);line-height:1.05;opacity:0.95;">
            <span style="display:block;white-space:nowrap;">Spots &amp;</span>
            <span style="display:block;white-space:nowrap;">Stories</span>
          </h2>
          <p class="mb-2" style="position:relative;z-index:20;font-size:9px;line-height:1.15;color:rgb(156 163 175);">Zbulo vendet më të mira.</p>
          <div class="flex items-center gap-1 mt-1" style="position:relative;z-index:20;color:rgb(251 191 36);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
            <span>Swipe</span>
            ${icon("arrow-right", "w-2.5 h-2.5")}
          </div>
        </div>
        <div style="position:absolute;right:-1rem;bottom:-1rem;width:6rem;height:6rem;border-radius:9999px;background:rgba(255,255,255,0.05);filter:blur(24px);pointer-events:none;z-index:0;"></div>
      </div>
    </div>
  `;
}

function storyTile({ label = "", imageUrl = "", logoUrl = "" } = {}) {
  const mediaHtml = text(imageUrl)
    ? img(imageUrl, "", "absolute inset-0 w-full h-full object-cover")
    : `<div class="absolute inset-0 flex items-center justify-center text-white/80" style="background:linear-gradient(145deg,#334155 0%,#1e293b 52%,#020617 100%);">${icon("camera", "w-7 h-7")}</div>`;
  const logoImgHtml = text(logoUrl)
    ? img(logoUrl, "", "w-full h-full rounded-full object-cover bg-white")
    : `<div class="w-full h-full rounded-full bg-white text-slate-500 flex items-center justify-center" style="font-size:10px;font-weight:900;">${esc(initial(label))}</div>`;
  return `
    <span class="flex-none w-[29%] sm:w-[120px] snap-start" style="flex:0 0 29%;width:29%;max-width:120px;">
      <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="height:13rem;border-radius:1rem;position:relative;overflow:hidden;">
        ${mediaHtml}
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.2) 100%);"></div>
        <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
          <div class="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm" style="padding:2px;background:linear-gradient(135deg,#f59e0b 0%,#db2777 100%);">
            ${logoImgHtml}
          </div>
        </div>
        <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
          <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md">${esc(label)}</h3>
        </div>
      </div>
    </span>
  `;
}

function feedCard({ business = "", location = "", content = "", likes = 0, comments = 0, logoUrl = "", heroUrl = "" } = {}) {
  return `
    <div class="group feed-card">
      <div class="flex items-center justify-between mb-5 px-2">
        <span class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            ${logoTile(logoUrl, business, "w-full h-full object-cover")}
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${esc(business)} ${icon("star", "w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${esc(location)}</p>
          </div>
        </span>
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden" style="aspect-ratio:4/5">
          ${img(heroUrl, "", "w-full h-full object-cover")}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${esc(content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <span class="flex items-center gap-2 text-white/80">
                  ${icon("heart", "w-5 h-5")} <span class="text-[10px] font-black">${esc(String(Math.max(0, Math.trunc(Number(likes) || 0))))}</span>
                </span>
                <span class="flex items-center gap-2 text-white/70">
                  ${icon("message-circle", "w-5 h-5")} <span class="text-[10px] font-black">${esc(String(Math.max(0, Math.trunc(Number(comments) || 0))))}</span>
                </span>
              </div>
              <span class="flex items-center gap-2 text-white/70">
                ${icon("share-2", "w-4 h-4")} <span class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Qyteti kommt in zwei Zustaenden - und das ist keine Zerlegung aus
// Bequemlichkeit, sondern die einzige ehrliche Art, diesen Bildschirm auf
// einem Telefon zu zeigen.
//
// In der App stehen die Story-Reihe und der erste Beitrag untereinander, und
// zusammen sind sie hoeher als jedes Telefon. Wer beides gleichzeitig zeigen
// will, muss verkleinern - und eine Story-Reihe in Dreiviertelgroesse ist
// nicht mehr die Story-Reihe von Mnyra, sondern ein Bild davon.
//
// Also bleibt beides in seiner echten Groesse, und der Scrollstand macht das,
// was im echten Qyteti der Daumen macht: Er schiebt die Reihe nach oben und
// den Beitrag herein.

// Quelle: renderSpotStoryIntroCard und renderStoriesRow
// (core/feed/feed-view-orchestration-controller.js), renderStoryTileMarkupCore
// (core/feed/story-tile-markup-utils.js).
export function previewQytetiStories(profile = {}, posts = [], neighbours = []) {
  const post = posts[0] || null;
  const stories = [
    { label: text(profile.name), imageUrl: text(post?.imageUrl) || text(profile.coverUrl), logoUrl: text(profile.logoUrl) },
    ...neighbours.slice(0, 4).map((entry) => ({
      label: text(entry.name),
      imageUrl: text(entry.coverUrl),
      logoUrl: text(entry.logoUrl)
    }))
  ];
  return `
    <div class="app-content-inline pt-2">
      <div class="flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5" style="margin-left:calc(var(--app-content-inline,1.5rem) * -1);margin-right:calc(var(--app-content-inline,1.5rem) * -1);scroll-padding-left:1.25rem;">
        ${storyIntroCard()}
        ${stories.map(storyTile).join("")}
        <div class="flex-none w-1" aria-hidden="true"></div>
      </div>
    </div>
  `;
}

// Quelle: renderFeedCardMarkupCore (core/feed/feed-card-markup-utils.js).
export function previewQytetiPost(profile = {}, posts = [], focusItems = []) {
  const post = posts[0] || null;
  const offer = focusItems[0] || null;
  return `
    <div class="app-content-inline py-4 space-y-12">
      ${feedCard({
        business: text(profile.name),
        location: text(profile.city),
        content: text(post?.caption) || text(offer?.title) || text(profile.bio),
        likes: post?.likeCount || 0,
        comments: post?.commentCount || 0,
        logoUrl: text(profile.logoUrl),
        heroUrl: text(post?.imageUrl) || text(offer?.imageUrl) || text(profile.coverUrl)
      })}
    </div>
  `;
}

/* ------------------------------------------------------------------ Harta */

// Quelle: renderMapView, makeBizDivIcon und renderMapSheet in
// core/discovery/discovery-runtime-controller.js. Uebernommen sind die
// Kartenflaeche (.map-view-surface), der runde Suchknopf, der violette
// Standortknopf, die Stecknadeln und die Karte am unteren Rand.
//
// Der EINE bewusste Unterschied: Statt einer geladenen Leaflet-Kachel liegt
// hier eine gezeichnete Flaeche in derselben Farbe (#e2e8f0, die Farbe, die in
// der App unter der Kachel steht). Eine echte Kachel braeuchte Leaflet, einen
// fremden Kachelserver und die Standortfreigabe des Betrachters - fuer den
// einen Satz "Klienten sehen, was in der Naehe ist" waere das viel Technik,
// und die Stelle stuende sekundenlang leer. Alles darauf ist echt.
function mapPin({ logoUrl = "", name = "", selected = false, left = 50, top = 50 } = {}) {
  return `
    <div class="absolute" style="left:${left}%;top:${top}%;transform:translate(-50%,-100%);z-index:${selected ? 500 : 400};">
      <div class="relative flex flex-col items-center justify-center transition-all duration-300 ${selected ? "scale-110" : ""}">
        <div class="w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px] ${selected ? "border-indigo-600" : "border-white"} bg-white overflow-hidden p-0.5">
          ${logoTile(logoUrl, name, "w-full h-full object-cover rounded-xl")}
        </div>
        <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${selected ? "border-t-indigo-600" : "border-t-white drop-shadow-md"}"></div>
      </div>
    </div>
  `;
}

export function previewHarta(profile = {}, neighbours = []) {
  // Die Nachbarn stehen im oberen Teil der Flaeche. Unten liegt die Karte des
  // gewaehlten Lokals - in der App verdeckt sie dort ebenfalls, was darunter
  // steht, aber eine Stecknadel, die halb unter einer Karte hervorschaut,
  // sieht nach Fehler aus und nicht nach Karte.
  const spots = [
    { left: 20, top: 28 },
    { left: 78, top: 24 },
    { left: 14, top: 52 },
    { left: 86, top: 48 }
  ];
  const address = firstText((profile.locations || [])[0]?.address, profile.address, profile.city);
  return `
    <div class="map-view-root">
      <div class="map-view-surface">
        <div class="absolute inset-0 z-10 bg-slate-200">
          <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style="stroke:rgba(148,163,184,0.55);fill:none;stroke-width:0.5;">
            <path d="M0 32 H100 M0 68 H100 M28 0 V100 M70 0 V100" />
            <path d="M0 50 C 24 44, 40 62, 64 52 S 92 40, 100 46" style="stroke:rgba(148,163,184,0.85);stroke-width:2.2;" />
          </svg>
        </div>
        ${neighbours.slice(0, 4).map((entry, index) => mapPin({
          logoUrl: entry.logoUrl,
          name: entry.name,
          left: spots[index].left,
          top: spots[index].top
        })).join("")}
        ${mapPin({ logoUrl: profile.logoUrl, name: profile.name, selected: true, left: 50, top: 48 })}

        <div class="map-view-overlay-top">
          <div class="map-search-shell">
            <span class="map-search-expand-btn">${icon("search", "w-4 h-4")}</span>
          </div>
        </div>

        <div class="map-view-overlay-bottom-right">
          <span class="w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all">
            ${icon("navigation", "w-5 h-5 fill-white")}
          </span>
        </div>

        <div class="map-view-sheet-slot">
          <div>
            <div class="bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative">
              <div class="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full"></div>
              <span class="absolute top-4 right-4 w-8 h-8 bg-slate-100/80 rounded-full flex items-center justify-center text-slate-500">
                ${icon("x", "w-4 h-4")}
              </span>
              <div class="flex gap-4 pr-6 mt-2">
                <div class="w-20 h-20 rounded-[1.5rem] bg-slate-50 p-1 border border-slate-100 shadow-sm flex-shrink-0 overflow-hidden relative">
                  ${logoTile(profile.logoUrl, profile.name, "w-full h-full object-cover rounded-[1.3rem]")}
                </div>
                <div class="flex-1 pt-1">
                  <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1">${esc(text(profile.type) || "Restaurant")}</span>
                  <h3 class="text-lg font-black tracking-tight text-slate-900 leading-tight line-clamp-1">${esc(text(profile.name) || "Business")}</h3>
                  <div class="flex items-center gap-2 mt-1 text-[11px] font-black text-slate-700">
                    <span class="flex items-center gap-1 text-indigo-600">${icon("star", "w-3 h-3 fill-indigo-600 text-indigo-600")} 4.6</span>
                    <span class="text-emerald-500 flex items-center gap-1.5 ml-2"><div class="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div> Hapur</span>
                  </div>
                  <div class="flex items-center gap-1.5 mt-2 text-slate-500 text-[10px] font-bold line-clamp-1">
                    ${icon("map-pin", "w-3 h-3")} ${esc(address)}
                  </div>
                </div>
              </div>
              <div class="mt-5 flex gap-3">
                <span class="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center justify-center gap-2">
                  ${icon("user", "w-4 h-4")} Profil
                </span>
                <span class="w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-indigo-100/50">
                  ${icon("navigation", "w-5 h-5")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------- Lokalet */

// Quelle: renderRestaurantListCard und renderRestaurantsContent in
// core/marketplace/marketplace-view-render-utils.js.
function localCard(entry = {}, { own = false } = {}) {
  const name = text(entry.name) || "Business";
  const cuisine = text(entry.type).toUpperCase();
  const location = firstText(entry.address, entry.city) || "-";
  const hours = text(entry.openingHours) || "10:00 - 23:00";
  return `
    <article class="w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col" style="border-radius:28px;border-color:rgba(241,245,249,0.6);box-shadow:0 10px 15px -3px rgba(226,232,240,0.8),0 4px 6px -4px rgba(226,232,240,0.8);${own ? "" : "opacity:0.55;"}">
      <div class="h-44 relative overflow-hidden group">
        ${img(entry.coverUrl, own ? name : "", "w-full h-full object-cover transition-transform duration-700")}
        <div class="absolute inset-0" style="background:linear-gradient(to top,#fff 0%,rgba(255,255,255,0.2) 50%,rgba(0,0,0,0.2) 100%);"></div>
        <div class="absolute top-3.5 right-3.5 flex gap-2 z-10" style="top:0.875rem;right:0.875rem;">
          <span class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 border border-slate-200/50 shadow-sm">${icon("map", "w-4 h-4")}</span>
          <span class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-700 border border-slate-200/50 shadow-sm">${icon("heart", "w-4 h-4 text-slate-600")}</span>
          <span class="w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-slate-600 border border-slate-200/50 shadow-sm">${icon("share-2", "w-4 h-4")}</span>
        </div>
      </div>
      <div class="px-5 pb-5 pt-12 relative flex-1 flex flex-col gap-3.5" style="padding-top:3rem;gap:0.875rem;">
        <div class="absolute -top-10 left-5 z-10" style="top:-2.5rem;left:1.25rem;">
          <div class="w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden" style="width:76px;height:76px;">
            ${logoTile(entry.logoUrl, name, "w-full h-full object-cover rounded-full")}
          </div>
        </div>
        <div>
          <div class="flex items-center gap-1.5 mb-1">
            <div class="flex text-amber-500">${icon("star", "w-3.5 h-3.5 fill-amber-500 text-amber-500")}</div>
            <span class="text-[11px] font-bold text-slate-800">4.6</span>
            <span class="text-[11px] text-slate-400">(0 vleresime)</span>
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-snug tracking-tight">${esc(name)}</h2>
          ${cuisine ? `<p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5" style="margin-top:0.125rem;">${esc(cuisine)}</p>` : ""}
        </div>
        <hr class="border-slate-100" />
        <div class="flex flex-col gap-2.5 text-slate-600">
          <div class="flex items-start gap-3">
            ${icon("map-pin", "w-4 h-4 text-slate-400 shrink-0 mt-0.5")}
            <span class="text-[11px] leading-relaxed text-slate-600">${esc(location)}</span>
          </div>
          <div class="flex items-center gap-3">
            ${icon("clock", "w-4 h-4 text-slate-400 shrink-0")}
            <span class="text-[11px] text-slate-600">${esc(hours)}</span>
          </div>
        </div>
        <hr class="border-slate-100" />
        <div class="grid grid-cols-2 gap-2.5 mt-0.5">
          <span class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs transition-all duration-150">
            ${icon("user", "w-3.5 h-3.5 text-slate-400")}
            Profili
          </span>
          <span class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs tracking-wide shadow-sm transition-all duration-150">
            ${icon("book-open", "w-3.5 h-3.5 text-slate-200")}
            Menu
          </span>
        </div>
      </div>
    </article>
  `;
}

export function previewLokalet(profile = {}, neighbours = []) {
  const self = {
    name: profile.name,
    city: profile.city,
    address: profile.address,
    type: profile.type,
    logoUrl: profile.logoUrl,
    coverUrl: profile.coverUrl,
    openingHours: profile.openingHours
  };
  return `
    <section class="p-6 pb-24">
      <div class="space-y-4">
        ${localCard(self, { own: true })}
        ${neighbours.slice(0, 1).map((entry) => localCard(entry)).join("")}
      </div>
    </section>
  `;
}

/* ------------------------------------------------------------------ Kërko */

// Quelle: renderSearchView und renderSearchBusinessItem in
// core/discovery/discovery-runtime-controller.js.
export function resolveSearchTerm(profile = {}, menuItems = []) {
  const words = text(profile.name).split(/\s+/).filter((word) => word.length >= 4);
  const generic = /^(bar|cafe|kafe|restaurant|restorant|pizzeria|lokal|the|and|dhe)$/i;
  const fromName = words.find((word) => !generic.test(word));
  if (fromName) return fromName;
  const fromMenu = menuItems.map((item) => text(item.category)).find((value) => value.length >= 4);
  if (fromMenu) return fromMenu;
  return text(profile.name) || "Mnyra";
}

function searchResultItem(entry = {}, { own = false } = {}) {
  const name = text(entry.name) || "Business";
  return `
    <span class="w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all text-left" style="${own ? "" : "opacity:0.55;"}">
      ${logoTile(entry.logoUrl, name, "w-12 h-12 rounded-2xl object-contain bg-white")}
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-slate-900 truncate">${esc(name)}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${esc(text(entry.city))}</p>
      </div>
      <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Business</span>
    </span>
  `;
}

// Kerko in zwei Zustaenden: das leere Feld und das Ergebnis.
//
// Der Scroll loest den Zeitpunkt aus - das Bild danach ist das, was in Mnyra
// steht, wenn jemand den Namen wirklich eingetippt hat. Keine Suchkarte, die
// es nur hier gibt, keine Zeile, die aufzaehlt, was gerade passiert.

// Quelle: renderSearchView in core/discovery/discovery-runtime-controller.js -
// der Zustand, bevor jemand tippt.
export function previewKerkoIdle() {
  return `
    <div class="p-6 h-full">
      <div class="mb-6 px-1">
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kërko</h2>
      </div>
      <div class="relative mb-6">
        <div class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 text-sm font-semibold shadow-sm flex items-center" style="padding-left:1.25rem;padding-right:3.5rem;">
          <span class="text-slate-400">Kërko lokale, ushqime...</span><span class="l2-caret"></span>
        </div>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 text-slate-500" style="width:2.25rem;height:2.25rem;flex:0 0 auto;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;line-height:1;">
          ${icon("search", "w-4 h-4")}
        </span>
      </div>
    </div>
  `;
}

// Quelle: renderSearchView und renderSearchBusinessItem im selben Modul - der
// Zustand mit Eingabe und Treffern.
export function previewKerkoResults(profile = {}, menuItems = [], neighbours = []) {
  const term = resolveSearchTerm(profile, menuItems);
  const others = neighbours.slice(0, 2);
  return `
    <div class="p-6 h-full">
      <div class="mb-6 px-1">
        <h2 class="text-2xl font-black italic uppercase tracking-tighter">Kërko</h2>
      </div>
      <div class="relative mb-6">
        <div class="w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 text-sm font-semibold shadow-sm flex items-center" style="padding-left:1.25rem;padding-right:3.5rem;">
          <span class="text-slate-900">${esc(term)}</span><span class="l2-caret"></span>
        </div>
        <span class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 text-slate-500" style="width:2.25rem;height:2.25rem;flex:0 0 auto;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;line-height:1;">
          ${icon("x", "w-4 h-4")}
        </span>
      </div>
      <div class="space-y-4">
        <div class="space-y-4">
          ${searchResultItem({ name: profile.name, city: profile.city, logoUrl: profile.logoUrl }, { own: true })}
          ${others.map((entry) => searchResultItem(entry)).join("")}
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------- QR / Tavolina */

// Der QR am Tisch. Das Muster ist gezeichnet und fuehrt bewusst nirgendwohin:
// ein echter Code auf einer Verkaufsseite waere ein Code, den jemand
// abfotografiert - und der dann auf eine Vorschau statt auf das Lokal zeigt.
// Der Aufsteller selbst ist ein Gegenstand auf dem Tisch, kein Bildschirm der
// App; er ist deshalb der einzige Teil dieser Seite, der nicht aus einem
// Renderer der App kommt.
function qrPattern() {
  const bits = [
    "111011010101", "100010111001", "101010001110", "101101010011",
    "100011101100", "111010010101", "000001101010", "110110011101",
    "011001010010", "101011101101", "010100010011", "110111011010"
  ];
  const cells = [];
  bits.forEach((row, y) => {
    row.split("").forEach((bit, x) => {
      if (bit === "1") cells.push(`<rect x="${x * 8 + 2}" y="${y * 8 + 2}" width="7" height="7" rx="1.4" />`);
    });
  });
  return `<svg class="l2-qr__code" viewBox="0 0 100 100" aria-hidden="true">${cells.join("")}</svg>`;
}

export function previewQr(profile = {}) {
  return `
    <div class="l2-qr">
      <div class="l2-qr__card">
        <span class="l2-qr__brand">MNYRA</span>
        ${qrPattern()}
        <span class="l2-qr__name">${esc(text(profile.name))}</span>
        <span class="l2-qr__table">Tavolina 4</span>
      </div>
      <p class="l2-qr__note">Skanon - dhe menuja jote hapet.</p>
    </div>
  `;
}

/* ---------------------------------------------------------------- Porosia */

// Der Weg einer Bestellung, so wie ein Gast ihn geht - ein Bildschirm je
// Handgriff, und jeder davon der echte.
//
// Was hier frueher stand, war eine einzige Karte, die alles zugleich zeigte:
// zwei Zeilen, eine Summe, ein Knopf und darunter gleich noch die Meldung in
// der Kueche. Sie war schnell zu lesen und stand in keinem Renderer der App -
// also war sie eine Zeichnung. Jetzt sind es die drei Bildschirme, die es
// wirklich gibt.

// Quelle: renderProfileShopCartView in
// core/shop/shop-view-cart-orchestration-controller.js - die Shporta, wie sie
// bei einer Tischbestellung aussieht.
export function previewCart(profile = {}, menuItems = []) {
  const currency = profile.currency || "EUR";
  const lines = menuItems.filter((item) => item.price !== null && item.price !== undefined).slice(0, 2);
  const total = lines.reduce((sum, item) => sum + (num(item.price) || 0), 0);
  return `
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Shporta</span>
            <h3 class="text-xl font-black italic tracking-tighter">${esc(text(profile.name))}</h3>
            <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-2">Tavolina 4</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${icon("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        <div class="space-y-3">
          ${lines.map((item) => `
            <div class="p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-white shrink-0">
                  ${img(item.imageUrl, text(item.name), "w-full h-full object-cover", { style: "object-position:50% 50%;" })}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-slate-900 truncate">${esc(item.name)}</p>
                  <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">${esc(formatPrice(item.price, currency))}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("minus", "w-3 h-3")}</span>
                  <span class="w-6 text-center text-sm font-black text-slate-900">1</span>
                  <span class="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center">${icon("plus", "w-3 h-3")}</span>
                </div>
              </div>
            </div>
          `).join("")}
          <div class="pt-3 flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Totali</span>
            <span class="text-lg font-black text-slate-900">${esc(formatPrice(total, currency))}</span>
          </div>
          <span class="w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95 flex items-center justify-center">
            Dergo porosine e tavolines
          </span>
          <p class="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Direkt per tavolinen tende</p>
        </div>
      </div>
    </div>
  `;
}

// Quelle: derselbe Renderer, sein Zustand nach dem Absenden.
export function previewOrderSent(profile = {}) {
  return `
    <div class="px-5 app-main-content-safe space-y-5">
      <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Shporta</span>
            <h3 class="text-xl font-black italic tracking-tighter">${esc(text(profile.name))}</h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            ${icon("shopping-cart", "w-5 h-5")}
          </div>
        </div>
        <div class="text-center py-10">
          <div class="relative w-24 h-24 mx-auto mb-6">
            <div class="absolute inset-[22px] rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-300/40">
              ${icon("check", "w-8 h-8")}
            </div>
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600">Porosia u dergua</p>
          <h4 class="text-[22px] font-black italic tracking-tight text-slate-900 mt-3">Porosi</h4>
          <p class="text-sm font-medium text-slate-500 mt-3">Porosia juaj po pergatitet dhe do te serviret se shpejti.</p>
          <p class="text-[10px] font-black uppercase tracking-widest text-emerald-700 mt-4">Tavolina 4</p>
        </div>
      </div>
    </div>
  `;
}

/* --------------------------------------------------------------- Mnyra GO */

// Mnyra GO in drei Bildern - und keines davon ist fuer diese Seite gezeichnet.
//
// Der Vorgang hat zwei Seiten: Ein Gast sucht, ein Lokal antwortet, der Gast
// nimmt an. Wer das in eine Karte presst, muss erklaeren, wer gerade wer ist.
// Nacheinander erklaert es sich von selbst.
//
// Quelle: renderGoEntryCardCore (core/go/go-entry-card-render-utils.js) fuer
// die Karte im Qyteti - erst ohne, dann mit laufendem Vorgang - und
// renderGoOfferCardCore (core/go/go-offer-card-render-utils.js) fuer das
// Angebot dazwischen.
function goEntryCard({ title = "", subtitle = "", action = "", badge = "" } = {}) {
  return `
    <div class="app-content-inline mb-5">
      <span class="w-full text-left rounded-[2rem] bg-slate-900 px-5 py-5 active:scale-[0.99] transition-transform block">
        <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
          <span aria-hidden="true">⚡</span>
          MNYRA GO${badge ? ` <span class="text-white/50">·</span> <span class="text-white">${esc(badge)}</span>` : ""}
        </span>
        <p class="mt-2 text-lg font-black tracking-tight text-white">${esc(title)}</p>
        <p class="mt-1 text-[13px] font-semibold text-white/70">${esc(subtitle)}</p>
        <span class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900">
          ${esc(action)}
          <span aria-hidden="true">→</span>
        </span>
      </span>
    </div>
  `;
}

// Der Gast sucht: die Karte, wie sie ohne laufenden Vorgang im Qyteti steht.
export function previewGoSearch() {
  return `
    <div class="pt-4">
      ${goEntryCard({
        title: "Çka po kërkoni tani?",
        subtitle: "Lokalet kanë oferta për ju.",
        action: "Shiko ofertat"
      })}
    </div>
  `;
}

// Der Gast hat angenommen und ist unterwegs: dieselbe Karte, ihr zweiter
// Zustand. "Aktivizo në lokal" ist das, was noch fehlt - und es fehlt beim
// Wirt, nicht beim Gast.
export function previewGoAccepted(profile = {}) {
  return `
    <div class="pt-4">
      ${goEntryCard({
        badge: "1 aktive",
        title: text(profile.name),
        subtitle: "2 persona · Aktivizo në lokal",
        action: "Shiko"
      })}
    </div>
  `;
}

export function previewGo(profile = {}, focusItems = [], menuItems = []) {
  const offer = focusItems[0] || null;
  const item = menuItems.find((entry) => entry.price !== null && entry.price !== undefined) || null;
  const headline = firstText(offer?.title, item?.name, "Oferta jote");
  const photo = firstText(offer?.imageUrl, item?.imageUrl, profile.coverUrl);
  const currency = profile.currency || "EUR";
  const regular = item && item.price !== null && item.price !== undefined ? num(item.price) : null;
  const goPrice = regular !== null ? Math.round(regular * 80) / 100 : null;

  return `
    <div class="mnyra-go-page">
      <div class="mnyra-work">
        <div class="mnyra-work__bento">
          <div class="mnyra-work__pills" role="tablist">
            <span class="mnyra-work__pill" aria-selected="true">${icon("zap", "w-4 h-4")}<span class="mnyra-work__pill-label">Tani</span></span>
            <span class="mnyra-work__pill" aria-selected="false">${icon("clock", "w-4 h-4")}<span class="mnyra-work__pill-label">Ofertat</span></span>
            <span class="mnyra-work__pill" aria-selected="false">${icon("bar-chart-3", "w-4 h-4")}<span class="mnyra-work__pill-label">Statistikat</span></span>
          </div>
          <article class="mnyra-go-page__card mnyra-go-page__card--hero">
            ${photo ? img(photo, "", "mnyra-go-page__card-photo") : ""}
            <div class="mnyra-go-page__card-body">
              <div class="mnyra-go-page__card-head">
                ${text(profile.logoUrl)
                  ? img(profile.logoUrl, "", "mnyra-go-page__card-logo")
                  : `<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${goIcon("store")}</div>`}
                <div class="mnyra-go-page__card-names">
                  <p class="mnyra-go-page__card-who">${esc(text(profile.name))} <span>po ju ofron</span></p>
                </div>
              </div>
              <p class="mnyra-go-page__card-benefit${goPrice !== null ? " mnyra-go-page__card-benefit--title" : ""}">${esc(headline)}</p>
              ${goPrice !== null ? `
                <div class="mnyra-go-page__card-prices">
                  <span class="mnyra-go-page__card-price-was">${esc(formatPrice(regular, currency))}</span>
                  <span class="mnyra-go-page__card-price-go">${esc(formatPrice(goPrice, currency))}</span>
                </div>
              ` : ""}
              <p class="mnyra-go-page__card-for">për grupin tuaj</p>
              <div class="mnyra-go-page__card-meta">
                <span>${goIcon("users")}2 persona</span>
                <span>${goIcon("clock")}Sot deri 22:00</span>
                <span>${goIcon("map-pin")}${esc(text(profile.city))}</span>
              </div>
              <p class="mnyra-go-page__card-only">${goIcon("ticket-percent")}Vetëm me Mnyra GO</p>
              <span class="mnyra-go-page__cta">${goIcon("check-check")}Merr ofertën</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------- Biznesi */

// Quelle: renderDashboardMetricRow, renderDashboardPanelTabs,
// renderDashboardComposerCard, renderDashboardOfferCard und
// renderDashboardCatalogCard in core/dashboard/dashboard-render-utils.js,
// dazu die Geometrie aus core/ui/work-surface-render-utils.js.
function dashMetricCard({ label = "", value = "", iconName = "image", imageUrl = "" } = {}) {
  return `
    <span class="mnyra-dash__hl-card">
      <span class="mnyra-dash__hl-plate">${icon(iconName, "w-6 h-6")}</span>
      ${imageUrl ? img(imageUrl, "", "mnyra-dash__hl-media") : ""}
      <span class="mnyra-dash__hl-body">
        <span class="mnyra-dash__hl-label">${esc(label)}</span>
        <span class="mnyra-dash__hl-value">${esc(value)}</span>
      </span>
    </span>
  `;
}

function dashComposerCard({ accent = "", rest = "", sub = "", cta = "", plane = false } = {}) {
  return `
    <span class="mnyra-dash__composer mnyra-dash__composer--tap${plane ? " mnyra-dash__composer--plane" : ""}">
      <span class="mnyra-dash__composer-title"><span class="mnyra-dash__composer-accent">${esc(accent)}</span> ${esc(rest)}</span>
      <span class="mnyra-dash__composer-sub">${esc(sub)}</span>
      <span class="mnyra-dash__composer-cta">
        <span class="mnyra-dash__composer-cta-icon">${icon("plus", "w-4 h-4")}</span>
        <span class="mnyra-dash__composer-cta-label">${esc(cta)}</span>
        <span class="mnyra-dash__composer-cta-chevron">${icon("chevron-right", "w-4 h-4")}</span>
      </span>
    </span>
  `;
}

// Das Paneli hat mehr Seiten, als in ein Fenster passen - also bekommt es
// zwei Zustaende, so wie das Profil.
//
// Die Kennzahlen-Reihe oben und die Reiterleiste darunter gehoeren zur Seite
// und bleiben stehen; was wechselt, ist die Flaeche darunter. Genau so
// verhaelt sich das Paneli in der App, wenn der Wirt auf "Analitika" tippt.

// Quelle: renderDashboardMetricCards in
// core/dashboard/dashboard-render-utils.js - die Reihe ueber dem Bento.
//
// Sie ist der Kopf des Panelis: Beim Weiterscrollen wandert sie nach oben aus
// dem Bild, und die Reiterleiste darunter bleibt stehen. Genau das tut ein
// Daumen im echten Paneli auch.
export function previewBiznesiMetrics(profile = {}, posts = [], menuItems = []) {
  const latest = posts[0] || null;
  return `
    <div class="mnyra-dash mnyra-work">
      <div class="mnyra-work__cards">
        ${dashMetricCard({ label: "Postimi fundit", value: formatCount(latest?.likeCount || 0), iconName: "image", imageUrl: text(latest?.imageUrl) })}
        ${dashMetricCard({ label: "Vizitor n'profil", value: formatCount(profile.followers), iconName: "eye" })}
        ${dashMetricCard({ label: "Vizitor n'meny", value: formatCount(menuItems.length * 7), iconName: "book-open" })}
        ${dashMetricCard({ label: "Skanime n'tavolina", value: "0", iconName: "scan-qr-code" })}
        <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
      </div>
    </div>
  `;
}

// Quelle: renderDashboardPanelTabs im selben Modul. Dieselbe Leiste, die in
// der App die Flaeche darunter umschaltet - hier schaltet sie der Scrollstand,
// und sie sieht dabei aus wie immer.
const DASH_TABS = [
  { id: "funksionet", label: "Funksionet", iconName: "layout-grid" },
  { id: "analitika", label: "Analitika", iconName: "bar-chart-3" },
  { id: "opsionet", label: "Opsionet", iconName: "settings" }
];

export function previewBiznesiTabs(activeTab = "funksionet") {
  return `
    <div class="mnyra-dash mnyra-work">
      <div class="mnyra-work__bento mnyra-dash__bento">
        <div class="mnyra-work__pills mnyra-dash__tabs" role="tablist">
          ${DASH_TABS.map((tab) => `
            <span class="mnyra-work__pill" role="tab" aria-selected="${tab.id === activeTab ? "true" : "false"}"
              data-l2-tab="${esc(tab.id)}">${icon(tab.iconName, "w-4 h-4")}<span class="mnyra-work__pill-label">${esc(tab.label)}</span></span>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

// Quelle: renderDashboardComposerCard, renderDashboardOfferCard und
// renderDashboardCatalogCard im selben Modul.
export function previewBiznesiFunksionet() {
  return `
    <div class="mnyra-dash mnyra-work">
      <div class="mnyra-work__bento mnyra-dash__bento">
        ${dashComposerCard({ accent: "Posto", rest: "n'Mnyra", sub: "Ndaj një postim ose një story me klientët e tu.", cta: "Posto" })}
        ${dashComposerCard({ accent: "Lësho", rest: "ofertë", sub: "Krijo një zbritje ose një kupon për klientët e tu.", cta: "Ofertë", plane: true })}
        ${dashComposerCard({ accent: "Ndrysho", rest: "menunë", sub: "Shto produkte, kategori dhe çmime.", cta: "Menu", plane: true })}
      </div>
    </div>
  `;
}

// Quelle: renderDashboardRecentPosts im selben Modul.
export function previewBiznesiAnalitika(profile = {}, posts = []) {
  const list = posts.slice(0, 2);
  return `
    <div class="mnyra-dash mnyra-work">
      <div class="mnyra-work__bento mnyra-dash__bento">
        <div class="mnyra-dash__section">
          <div class="mnyra-dash__section-head">
            <p class="mnyra-dash__section-title">Postimet e fundit</p>
            <span class="mnyra-dash__section-link">Profil</span>
          </div>
          ${list.length ? `
            <div class="mnyra-dash__posts">
              ${list.map((post) => `
                <div class="mnyra-dash__post">
                  <div class="mnyra-dash__post-thumb">
                    ${text(post.imageUrl) ? img(post.imageUrl, "", "") : icon("image", "w-5 h-5")}
                  </div>
                  <div class="mnyra-dash__post-main">
                    <p class="mnyra-dash__post-caption">${esc(text(post.caption) || "Pa tekst")}</p>
                    <p class="mnyra-dash__post-meta">${esc(`${formatCount(post.likeCount || 0)} Likes · ${formatCount(post.commentCount || 0)} komente`)}</p>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : `
            <div class="mnyra-dash__state" style="border:none;">
              <p class="mnyra-dash__state-title">Ende nuk ka postime</p>
              <p class="mnyra-dash__state-body">Posto foton ose videon tende te pare qe vizitoret te te zbulojne ne feed.</p>
            </div>
          `}
        </div>
        <div class="mnyra-dash__section">
          <div class="mnyra-dash__section-head">
            <p class="mnyra-dash__section-title">Vizitor n'profil</p>
          </div>
          <div class="mnyra-work__cards">
            ${dashMetricCard({ label: "7 ditë", value: formatCount(profile.followers), iconName: "eye" })}
            ${dashMetricCard({ label: "Menuja", value: formatCount(num(profile.followers) * 2 || 0), iconName: "book-open" })}
            <span class="mnyra-dash__hl-tail" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------- Vision */

// Viele Lokale, eine Oberflaeche. Die Kacheln tragen echte Lokale aus Mnyra -
// mit erfundenen Namen waere genau das die Stelle, an der die Seite luegt.
//
// Diese Reihe ist kein Bildschirm der App, sondern eine Aussage ueber sie: Es
// gibt in Mnyra keine Ansicht "alle Lokale nebeneinander mit ihrem QR". Sie
// ist deshalb in der Sprache der Landing gesetzt, nicht in der der App.
export function previewVision(profile = {}, neighbours = []) {
  const tiles = [
    { name: profile.name, logoUrl: profile.logoUrl, own: true },
    ...neighbours.slice(0, 5)
  ];
  return `
    <div class="l2-vision">
      ${tiles.map((entry) => `
        <span class="l2-vision__tile${entry.own ? " is-own" : ""}">
          <span class="l2-vision__logo">${logoTile(entry.logoUrl, entry.name, "w-full h-full object-cover")}</span>
          <span class="l2-vision__name">${esc(text(entry.name))}</span>
          <span class="l2-vision__qr" aria-hidden="true">${icon("scan-qr-code", "w-3.5 h-3.5")}</span>
        </span>
      `).join("")}
    </div>
  `;
}

// Dieselbe Aussage von der anderen Seite: nicht "viele Lokale nebeneinander",
// sondern "viele Lokale um eine Mitte".
//
// Es ist bewusst ein zweites Bild und keine zweite Auflage des ersten. Die
// Kachelreihe oben (previewVision) sagt "in jedem Lokal derselbe QR"; hier
// steht Mnyra in der Mitte und die Lokale liegen darum. Waere es dieselbe
// Reihe, waere es die Stelle, an der ein Leser denkt "das hatte ich schon" -
// und ab da liest er quer.
//
// Auch dies ist kein Bildschirm der App, sondern eine Aussage ueber sie, und
// deshalb in der Sprache der Landing gesetzt.
export function previewOrbit(profile = {}, neighbours = []) {
  // Sechs Plaetze auf dem Kreis, im Uhrzeigersinn ab oben. Die Zahlen sind
  // ausgerechnet und stehen fest: sin/cos zur Laufzeit waere hier Rechnen fuer
  // ein Bild, das sich nie aendert.
  const spots = [
    { x: 50, y: 10 },
    { x: 85, y: 30 },
    { x: 85, y: 70 },
    { x: 50, y: 90 },
    { x: 15, y: 70 },
    { x: 15, y: 30 }
  ];
  const tiles = [
    { name: profile.name, logoUrl: profile.logoUrl, own: true },
    ...neighbours.slice(0, 5)
  ].slice(0, spots.length);
  return `
    <div class="l2-orbit" aria-hidden="true">
      <span class="l2-orbit__ring"></span>
      <span class="l2-orbit__core">MNYRA</span>
      ${tiles.map((entry, index) => `
        <span class="l2-orbit__node${entry.own ? " is-own" : ""}" style="--l2-x:${spots[index].x}%;--l2-y:${spots[index].y}%;">
          ${logoTile(entry.logoUrl, entry.name, "w-full h-full object-cover")}
        </span>
      `).join("")}
    </div>
  `;
}

/* ------------------------------------------------------------ Mnyra SAVE */

// SAVE gibt es im Code noch nicht - es gibt also keinen echten Bildschirm, den
// man hier zeigen koennte. Deshalb ist dies der einzige Abschnitt der Seite,
// der eine Zeichnung ist und keine Aufnahme, und er sagt das auch: die
// Plakette "Po vjen" steht darauf, und der Abschnitt darunter schreibt es aus.
export function previewSave(profile = {}, menuItems = []) {
  const item = menuItems.find((entry) => entry.imageUrl && entry.price !== null) || menuItems[0] || null;
  const currency = profile.currency || "EUR";
  const price = item && item.price !== null && item.price !== undefined ? num(item.price) : null;
  return `
    <div class="p-6 space-y-4">
      <span class="l2-badge l2-badge--soon">Po vjen</span>
      <div class="w-full bg-white rounded-[28px] overflow-hidden border border-slate-100/60 shadow-lg shadow-slate-200/80 flex gap-4 p-3">
        <div class="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
          ${img(item?.imageUrl, item ? text(item.name) : "", "w-full h-full object-cover")}
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-center gap-1">
          <p class="text-sm font-black text-slate-900 truncate">${esc(item?.name || "Ushqimi që ka mbetur")}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">${esc(text(profile.name))}</p>
          <div class="flex items-baseline gap-2 mt-1">
            ${price !== null ? `<span class="text-[11px] font-bold text-slate-400 line-through">${esc(formatPrice(price, currency))}</span>` : ""}
            <span class="text-base font-black text-indigo-600">${price !== null ? esc(formatPrice(Math.round(price * 50) / 100, currency)) : "-50%"}</span>
          </div>
        </div>
      </div>
      <p class="text-[11px] font-bold text-slate-400">Njerëzit pranë teje e shohin - dhe e blejnë para se ta hedhësh.</p>
    </div>
  `;
}
