// Einzige Quelle fuer das Aussehen einer Feed-Beitragskarte ("Zbulo").
//
// Der Feed rendert damit seine echten Karten, und der Business-Composer
// rendert damit seine Vorschau. Beide bekommen exakt dasselbe Markup und
// dieselben Klassen - eine Aenderung hier schlaegt automatisch auf beide
// Seiten durch, die Vorschau kann also nie vom echten Beitrag abweichen.
//
// Bewusst pur: keine State-, DOM- oder Firestore-Zugriffe. Alles, was sich
// zwischen Feed und Vorschau unterscheidet (Bild-Attribute, Datenattribute
// fuer Klick-Handler), kommt fertig von aussen herein.

function noopEscape(value = "") {
  return String(value ?? "");
}

export function renderFeedCardMarkupCore({
  // Identitaet
  business = "",
  location = "",
  content = "",
  likes = 0,
  comments = 0,
  isLive = false,
  // Fertige Medien-Bausteine (Feed: mit Klick-Button, Vorschau: nur Medium)
  logoImgHtml = "",
  heroMediaHtml = "",
  // Solange kein Bild bereitsteht, traegt die Buehne den grauen Platzhalter.
  heroReady = false,
  // Datenattribute: im Feed gesetzt, in der Vorschau leer (rein visuell
  // wirkungslos, damit die Vorschau keine App-Handler ausloest).
  rootAttrs = "",
  // Ecke oben rechts. Der Feed setzt hier fuer den Inhaber seinen
  // Loeschen-Knopf ein; Vorschau und fremde Karten lassen das Feld leer und
  // behalten das stumme Zeichen von vorher.
  menuHtml = "",
  profileButtonAttrs = "",
  likeButtonAttrs = "",
  likeCountAttrs = "",
  commentButtonAttrs = "",
  commentCountAttrs = "",
  shareButtonAttrs = "",
  escapeHtmlFn,
  iconFn
} = {}) {
  const esc = typeof escapeHtmlFn === "function" ? escapeHtmlFn : noopEscape;
  const icon = typeof iconFn === "function" ? iconFn : (() => "");
  return `
    <div class="group feed-card" ${rootAttrs}>
      <div class="flex items-center justify-between mb-5 px-2">
        <button ${profileButtonAttrs} class="flex items-center gap-3 text-left">
          <div class="w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 italic overflow-hidden bg-slate-200">
            ${logoImgHtml}
          </div>
          <div>
            <h4 class="text-sm font-black flex items-center gap-1.5 uppercase tracking-tighter italic text-slate-900">${esc(business)} ${icon("star", "w-3 h-3 text-indigo-500")}</h4>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${esc(location)}</p>
          </div>
        </button>
        ${menuHtml || icon("more-horizontal", "w-5 h-5 text-slate-400")}
      </div>
      <div class="p-2.5 rounded-[3.5rem] shadow-2xl overflow-hidden relative bg-white shadow-slate-200/50 border border-slate-50">
        <div class="relative rounded-[3rem] overflow-hidden ${heroReady ? "" : "bg-slate-200"}" style="aspect-ratio:4/5">
          ${heroMediaHtml}
          ${isLive ? `
            <div class="absolute top-6 left-6 bg-red-600 text-white text-[9px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> LIVE
            </div>
          ` : ""}
          <div class="absolute bottom-6 left-6 right-6 p-6 bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 text-white">
            <p class="text-sm font-medium mb-4 line-clamp-2 leading-relaxed">${esc(content)}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-4">
                <button type="button" ${likeButtonAttrs} class="flex items-center gap-2 text-white/80 hover:text-rose-400 transition-colors">
                  ${icon("heart", "w-5 h-5")} <span ${likeCountAttrs} class="text-[10px] font-black">${esc(likes)}</span>
                </button>
                <button type="button" ${commentButtonAttrs} class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                  ${icon("message-circle", "w-5 h-5")} <span ${commentCountAttrs} class="text-[10px] font-black">${esc(comments)}</span>
                </button>
              </div>
              <button type="button" ${shareButtonAttrs} class="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                ${icon("share-2", "w-4 h-4")} <span data-feed-share-label class="text-[10px] font-black uppercase tracking-widest">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Der Rahmen, in dem der Feed seine Karten stapelt. Die Vorschau setzt
// dieselbe Breite und dasselbe Innenmass, damit die Karte exakt so breit
// steht wie im echten Feed.
export const FEED_LIST_CONTAINER_CLASS = "app-content-inline py-4 space-y-12";
