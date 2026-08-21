import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildMirrorCss, MIRROR_TARGET } from "../scripts/generate-landing2-app-mirror.mjs";

const ROOT = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

function read(relativePath) {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

const PREVIEW = read("apps/menyra-social/lead-landing-2/landing2-preview.js");
const ICONS = read("apps/menyra-social/lead-landing-2/landing2-icons.js");
const APP = read("apps/menyra-social/social-app.js");

// Landing 2 zeigt echte Mnyra-Bildschirme - nicht Nachzeichnungen davon.
//
// "Echt" ist eine Behauptung, und diese Datei ist der Beleg. Sie haelt die
// Vorschau gegen die Renderer der App: Wer dort eine Karte aendert und hier
// nicht, faellt auf - und zwar hier, nicht beim Wirt, der die Seite gesehen
// hat und sich nach dem Anmelden fragt, warum die App anders aussieht.

/* --------------------------------------------------- Die Stilblaetter */

test("das gespiegelte Stilblatt ist auf dem Stand der App", () => {
  const current = read(MIRROR_TARGET);
  assert.equal(
    current,
    buildMirrorCss(),
    `${MIRROR_TARGET} weicht von den Stilblaettern der App ab.`
    + " Bitte 'node scripts/generate-landing2-app-mirror.mjs' laufen lassen."
  );
});

test("Landing 2 laedt das Stylesheet der App", () => {
  const html = read("apps/menyra-social/lead-landing-2/index.html");
  assert.ok(
    html.includes('href="/apps/menyra-social/styles/tailwind.generated.css"'),
    "ohne das Stylesheet der App waeren alle Masse hier eine zweite Schaetzung"
  );
  assert.ok(html.includes('href="/apps/menyra-social/lead-landing-2/landing2-app-mirror.css"'));
  // Reihenfolge: erst die App, dann die Spiegelung, dann die Landing.
  const app = html.indexOf("tailwind.generated.css");
  const mirror = html.indexOf("landing2-app-mirror.css");
  const own = html.indexOf("landing2-styles.css");
  assert.ok(app < mirror && mirror < own, "die Blaetter stehen in der falschen Reihenfolge");
});

/* ------------------------------------------------------- Die Symbole */

test("die Symbole sind Zeichen fuer Zeichen die der App", () => {
  const appStart = APP.indexOf("const INLINE_LUCIDE_ICON_NODES = Object.freeze({");
  const appEnd = APP.indexOf("\n});", appStart) + 4;
  const appNodes = APP.slice(appStart, appEnd);
  assert.ok(appNodes.length > 1000, "das Register der App wurde nicht gefunden");
  assert.ok(
    ICONS.includes(appNodes),
    "landing2-icons.js weicht vom Symbol-Register der App ab"
    + " (social-app.js, INLINE_LUCIDE_ICON_NODES)"
  );
});

test("die Symbole tragen dieselben SVG-Merkmale wie in der App", () => {
  const appStart = APP.indexOf("const INLINE_LUCIDE_SVG_ATTRS = Object.freeze({");
  const appEnd = APP.indexOf("});", appStart) + 3;
  assert.ok(ICONS.includes(APP.slice(appStart, appEnd)));
});

test("die GO-Symbole sind die von Mnyra GO", () => {
  const go = read("apps/menyra-social/core/go/go-icon-render-utils.js");
  ["ticket-percent", "check-check", "store", "users", "clock", "map-pin"].forEach((name) => {
    const key = name.includes("-") ? `"${name}"` : name;
    const start = go.indexOf(`\n  ${key}: `);
    assert.ok(start > 0, `${name} steht nicht im Register von GO`);
    const body = go.slice(start + 1, go.indexOf("\n  ", start + 4));
    const trimmed = body.trim().replace(/,$/, "");
    assert.ok(
      ICONS.includes(trimmed),
      `Das GO-Symbol "${name}" weicht von core/go/go-icon-render-utils.js ab`
    );
  });
});

/* --------------------------------------------------- Die Klassenketten */

// Die Probe: Jede dieser Ketten steht in einem echten Renderer der App. Steht
// sie dort nicht mehr, ist die Vorschau von ihrem Vorbild abgewichen.
const SOURCES = {
  profil: "apps/menyra-social/core/profile/profile-menu-focus-render-controller.js",
  post: "apps/menyra-social/core/profile/profile-post-card-markup-utils.js",
  feedCard: "apps/menyra-social/core/feed/feed-card-markup-utils.js",
  story: "apps/menyra-social/core/feed/story-tile-markup-utils.js",
  stories: "apps/menyra-social/core/feed/feed-view-orchestration-controller.js",
  map: "apps/menyra-social/core/discovery/discovery-runtime-controller.js",
  lokalet: "apps/menyra-social/core/marketplace/marketplace-view-render-utils.js",
  menuDetail: "apps/menyra-social/core/menu/menu-modal-render-utils.js",
  dashboard: "apps/menyra-social/core/dashboard/dashboard-render-utils.js",
  header: "apps/menyra-social/core/app-shell/app-shell-runtime-controller.js",
  cart: "apps/menyra-social/core/shop/shop-view-cart-orchestration-controller.js",
  goEntry: "apps/menyra-social/core/go/go-entry-card-render-utils.js"
};

const CLASS_CHAINS = [
  // Profil-Karte
  ["profil", 'bg-white rounded-[2.5rem] relative overflow-hidden z-10 border border-slate-100 shadow-sm'],
  ["profil", 'h-40 w-full bg-slate-900 relative overflow-hidden flex items-center justify-center select-none'],
  ["profil", 'relative w-[100px] h-[100px] rounded-[2rem] p-[3px] bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg'],
  ["profil", 'font-black text-[28px] bg-gradient-to-br from-slate-900 to-indigo-600 text-transparent bg-clip-text tracking-tight leading-none mb-3'],
  ["profil", 'text-[15px] text-slate-500 font-medium leading-relaxed max-w-[300px]'],
  ["profil", 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4'],
  ["profil", 'w-9 h-9 rounded-full bg-white text-slate-900 shadow-lg border border-white/80 flex items-center justify-center active:scale-95 transition-transform'],
  // Profil-Reiter
  ["profil", 'bg-white/60 p-1.5 rounded-[2rem] border border-white/50 shadow-sm flex items-center relative backdrop-blur-sm'],
  // Beitrags-Kachel
  ["post", 'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none'],
  ["post", 'flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]'],
  // Profil-Reiter: die beiden Felder selbst - an ihnen haengt der Wechsel
  // Postimet -> Menu, und er soll aussehen wie der der App.
  ["profil", 'flex-1 py-3.5 rounded-[1.5rem] text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2'],
  ["profil", 'bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08),0_2px_6px_-1px_rgba(0,0,0,0.04)] scale-[1.02]'],
  // Menue: "Sot ne Fokus" und die grosse Speisekarte. Die Getraenke-Kachel
  // steht nicht mehr in der Vorschau - der Menue-Zustand zeigt bewusst zwei
  // Speisen und keine Kategorienliste; ihre Kette waere hier eine Probe auf
  // etwas, das die Seite nicht zeigt.
  ["profil", 'min-w-[85%] sm:min-w-[300px] snap-center bg-white rounded-[2rem] p-2.5 border border-slate-100 flex flex-col group relative mb-2'],
  ["profil", 'bg-white p-3.5 rounded-[2.2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-5 group relative'],
  ["profil", 'w-full aspect-[16/9] rounded-[1.8rem] overflow-hidden bg-slate-100 mb-4 relative'],
  // Produktdetail
  ["menuDetail", 'menu-detail-modal-header modal-handoff-chrome flex items-center justify-between gap-4 px-7 pt-7 pb-5 border-b border-slate-100 bg-white'],
  ["menuDetail", 'w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0'],
  ["menuDetail", 'p-4 rounded-[1.3rem] border border-slate-100 bg-slate-50'],
  ["menuDetail", 'menu-detail-info-panels rounded-[1.3rem] border border-slate-100 bg-slate-50 px-4 py-3.5'],
  // Qyteti
  ["feedCard", 'p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50'],
  ["feedCard", 'absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white'],
  ["feedCard", 'w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200'],
  ["story", 'relative h-52 rounded-2xl overflow-hidden shadow-md'],
  ["story", 'w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm'],
  ["stories", 'flex overflow-x-auto gap-2.5 pb-8 pt-2 snap-x snap-mandatory no-scrollbar scroll-pl-5'],
  // Harta
  ["map", 'w-12 h-12 rounded-[1rem] shadow-lg flex items-center justify-center border-[3px]'],
  ["map", 'bg-white/95 backdrop-blur-xl rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(0,0,0,0.25)] border border-slate-100/50 relative'],
  ["map", 'w-14 h-[46px] bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-all'],
  ["map", 'w-12 h-12 rounded-2xl bg-indigo-600 shadow-[0_8px_20px_rgba(79,70,229,0.4)] flex items-center justify-center text-white active:scale-95 transition-all'],
  // Lokalet
  ["lokalet", 'w-full bg-white rounded-[28px] overflow-hidden shadow-lg shadow-slate-200/80 border border-slate-100/60 relative flex flex-col'],
  ["lokalet", 'w-[76px] h-[76px] rounded-full p-1 bg-white shadow-md border border-slate-100 overflow-hidden'],
  // Kerko
  ["map", 'w-full h-14 rounded-[2rem] border border-slate-100 bg-white px-5 text-sm font-semibold'],
  ["map", 'w-full flex items-center gap-4 p-4 rounded-[2rem] bg-white border border-slate-100 shadow-sm'],
  // Produktfenster: die Fusszeile mit "Shto ne shporte" - der Handgriff, mit
  // dem eine Bestellung anfaengt.
  ["menuDetail", 'modal-handoff-chrome px-7 pb-6 pt-4 border-t border-slate-100 bg-white/98 backdrop-blur-sm modal-footer-safe relative z-10'],
  // Shporta
  ["cart", 'bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm'],
  ["cart", 'p-3 rounded-[1.6rem] bg-slate-50 border border-slate-100 space-y-3'],
  ["cart", 'w-full py-4 rounded-[1.8rem] bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200/60 active:scale-95'],
  ["cart", 'text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600'],
  // Mnyra GO - die Karte im Qyteti, vor und nach dem Annehmen
  ["goEntry", 'inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70'],
  ["goEntry", 'mt-2 text-lg font-black tracking-tight text-white'],
  ["goEntry", 'mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-900'],
  // Biznesi
  ["dashboard", "mnyra-work__cards"],
  ["dashboard", "mnyra-work__bento mnyra-dash__bento"],
  ["dashboard", "mnyra-work__pills mnyra-dash__tabs"],
  ["dashboard", "mnyra-dash__composer mnyra-dash__composer--tap"],
  ["dashboard", "mnyra-dash__hl-plate"],
  ["dashboard", "mnyra-dash__section-head"],
  ["dashboard", "mnyra-dash__post-caption"],
  // Kopfzeile
  ["header", "smart-header-tabs-row"],
  ["header", "smart-header-pill__label"]
];

test("jede Klassenkette der Vorschau steht so in einem Renderer der App", () => {
  const cache = new Map();
  const missing = [];
  for (const [sourceKey, chain] of CLASS_CHAINS) {
    if (!PREVIEW.includes(chain)) {
      missing.push(`Vorschau: "${chain}"`);
      continue;
    }
    if (!cache.has(sourceKey)) cache.set(sourceKey, read(SOURCES[sourceKey]));
    if (!cache.get(sourceKey).includes(chain)) {
      missing.push(`${SOURCES[sourceKey]}: "${chain}"`);
    }
  }
  assert.deepEqual(missing, [], `Diese Ketten stimmen nicht mehr ueberein:\n${missing.join("\n")}`);
});

test("die GO-Karte traegt die Klassen der echten Ergebniskarte", () => {
  const go = read("apps/menyra-social/core/go/go-offer-card-render-utils.js");
  [
    "mnyra-go-page__card mnyra-go-page__card--hero",
    "mnyra-go-page__card-photo",
    "mnyra-go-page__card-body",
    "mnyra-go-page__card-head",
    "mnyra-go-page__card-logo",
    "mnyra-go-page__card-who",
    "mnyra-go-page__card-benefit",
    "mnyra-go-page__card-prices",
    "mnyra-go-page__card-price-was",
    "mnyra-go-page__card-price-go",
    "mnyra-go-page__card-for",
    "mnyra-go-page__card-meta",
    "mnyra-go-page__card-only",
    "mnyra-go-page__cta"
  ].forEach((className) => {
    assert.ok(PREVIEW.includes(className), `Der Vorschau fehlt "${className}"`);
    assert.ok(go.includes(className), `"${className}" gibt es in der App nicht mehr`);
  });
});

test("die Woerter der GO-Karte sind die der App", () => {
  const go = read("apps/menyra-social/core/go/go-offer-card-render-utils.js");
  ["po ju ofron", "për grupin tuaj", "Vetëm me Mnyra GO"].forEach((label) => {
    assert.ok(go.includes(label), `"${label}" steht so nicht mehr in der App`);
    assert.ok(PREVIEW.includes(label), `"${label}" fehlt in der Vorschau`);
  });
});

test("die Woerter des Panels sind die der App", () => {
  const dash = read("apps/menyra-social/core/dashboard/dashboard-render-utils.js");
  ["Posto", "n'Mnyra", "Ndaj një postim ose një story me klientët e tu.", "Funksionet", "Analitika", "Opsionet"]
    .forEach((label) => {
      assert.ok(dash.includes(label), `"${label}" steht so nicht mehr im Panel`);
      assert.ok(PREVIEW.includes(label), `"${label}" fehlt in der Vorschau`);
    });
});

/* ------------------------------------------------- Nur Optik, nichts sonst */

test("in der Vorschau haengt kein einziger Haken der App", () => {
  // Die Klassen sind die der App - die Datenattribute, an denen sie ihre
  // Handler festmacht, duerfen es nicht sein. Ein data-menu-open in der
  // Vorschau waere ein Klick, der ins Leere geht; ein data-nav waere einer,
  // der die Seite verlaesst.
  const forbidden = [
    "data-menu-open", "data-nav=", "data-profile-tab", "data-public-profile-follow",
    "data-open-chat", "data-search-business", "data-marketplace-open-business",
    "data-dashboard-composer", "data-dashboard-panel-tab", "data-go-", "data-feed-id",
    "data-open-post", "data-menu-card-like", "data-img-key"
  ];
  forbidden.forEach((attr) => {
    assert.ok(!PREVIEW.includes(attr), `landing2-preview.js enthaelt "${attr}"`);
  });
});

test("die Flaeche der Vorschau nimmt keine Beruehrung an", () => {
  const css = read("apps/menyra-social/lead-landing-2/landing2-styles.css");
  const block = css.slice(css.indexOf(".l2-screen {"), css.indexOf(".l2-screen--white"));
  assert.match(block, /pointer-events: none/);
  // Und keine zweite Scrollebene: die waagerechten Reihen der App stehen still.
  assert.match(css, /\.l2-screen \.overflow-x-auto[\s\S]{0,200}overflow: hidden !important/);
});
