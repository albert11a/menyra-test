// Einzige Quelle fuer das Aussehen einer Story-Kachel im Zbulo-Track.
// Liegt bewusst bei core/feed: die Kachel ist Teil des Feed-Tracks. Der
// Composer laedt sie fuer seine Vorschau nach.
//
// Der Feed rendert damit seine echten Kacheln, der Business-Composer rendert
// damit die linke Story-Vorschau ("so sieht man sie in Zbulo"). Beide teilen
// sich Markup, Klassen und Inline-Masse - die Vorschau kann nicht abweichen.

// Die Kachelmasse liegen bewusst hier, damit Feed und Vorschau dieselbe
// Geometrie benutzen (29% der Track-Breite, hoechstens 120px, 13rem hoch).
export const STORY_TILE_WIDTH_STYLE = "flex:0 0 29%;width:29%;max-width:120px;";
export const STORY_TILE_HEIGHT_STYLE = "height:13rem;";
export const STORY_TILE_RADIUS_STYLE = "border-radius:1rem;";

export function buildStoryTileShellStyleCore({ withMarginLeft = false } = {}) {
  return `${STORY_TILE_WIDTH_STYLE}${withMarginLeft ? "margin-left:1.25rem;" : ""}`;
}

export function buildStoryTileInnerStyleCore(extra = "") {
  return `${STORY_TILE_HEIGHT_STYLE}${STORY_TILE_RADIUS_STYLE}position:relative;overflow:hidden;${extra}`;
}

function noopEscape(value = "") {
  return String(value ?? "");
}

export function renderStoryTileMarkupCore({
  label = "",
  // Fertiges Medium (Video oder Bild) bzw. der Kamera-Platzhalter.
  mediaHtml = "",
  // Fertiges Logo-<img> - Feed und Vorschau setzen andere Lade-Attribute.
  logoImgHtml = "",
  shellStyle = buildStoryTileShellStyleCore(),
  innerStyle = buildStoryTileInnerStyleCore(),
  // Im Feed ein echter Link mit Datenattributen, in der Vorschau ohne beides.
  hrefAttr = "",
  shellAttrs = "",
  logoRingAttrs = "",
  labelAttrs = "",
  escapeHtmlFn
} = {}) {
  const esc = typeof escapeHtmlFn === "function" ? escapeHtmlFn : noopEscape;
  return `
      <a ${hrefAttr} ${shellAttrs} class="flex-none w-[29%] sm:w-[120px] snap-start cursor-pointer" style="${shellStyle}">
        <div class="relative h-52 rounded-2xl overflow-hidden shadow-md" style="${innerStyle}">
          ${mediaHtml}
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20 pointer-events-none" style="background:linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.1) 45%,rgba(0,0,0,0.2) 100%);"></div>
          <div class="absolute top-2 right-2" style="position:absolute;top:0.5rem;right:0.5rem;z-index:12;">
            <div class="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-fuchsia-600 shadow-sm" ${logoRingAttrs} style="padding:2px;background:linear-gradient(135deg,#f59e0b 0%,#db2777 100%);">
              ${logoImgHtml}
            </div>
          </div>
          <div class="absolute bottom-2 left-2 right-2" style="position:absolute;left:0.5rem;right:0.5rem;bottom:0.5rem;z-index:12;">
            <h3 class="font-medium text-[11px] text-white truncate drop-shadow-md" ${labelAttrs}>${esc(label)}</h3>
          </div>
        </div>
      </a>
    `;
}

// Platzhalter, wenn eine Story (noch) kein Medium hat - identisch zum Feed.
export function renderStoryTileMediaFallbackCore({ iconFn } = {}) {
  const icon = typeof iconFn === "function" ? iconFn : (() => "");
  return `
      <div class="absolute inset-0 flex items-center justify-center text-white/80" style="background:linear-gradient(145deg,#334155 0%,#1e293b 52%,#020617 100%);">
        ${icon("camera", "w-7 h-7")}
      </div>
    `;
}
