// Einzige Quelle fuer das Aussehen einer Beitrags-Kachel im Profil.
//
// Das Profil rendert damit seine echten Kacheln, der Business-Composer rendert
// damit die Vorschau "so sieht der Beitrag auf deinem Profil aus". Beide teilen
// sich Markup, Klassen und Masse - die Vorschau kann nicht abweichen.
//
// Alles Dynamische kommt von aussen herein (Medium, Zaehler, Datenattribute,
// Menue): der Baustein selbst kennt weder App-Zustand noch Icon-Bibliothek.

// Die Kachelmasse liegen bewusst hier, damit Profil und Vorschau dieselbe
// Geometrie benutzen.
export const PROFILE_POST_CARD_RADIUS_CLASS = "rounded-[2rem]";
export const PROFILE_POST_CARD_ASPECT_CLASS = "aspect-[4/5]";
export const PROFILE_POST_CARD_WIDE_ASPECT_CLASS = "aspect-[1.8/1]";

export function resolveProfilePostAspectClassCore({ isGrid = false, isWide = false } = {}) {
  if (!isGrid) return PROFILE_POST_CARD_ASPECT_CLASS;
  return isWide ? PROFILE_POST_CARD_WIDE_ASPECT_CLASS : PROFILE_POST_CARD_ASPECT_CLASS;
}

function noopEscape(value = "") {
  return String(value ?? "");
}

export function renderProfilePostCardMarkupCore({
  colClass = "",
  aspectClass = PROFILE_POST_CARD_ASPECT_CLASS,
  // Im Profil die Datenattribute zum Oeffnen, in der Vorschau leer.
  cardAttrs = "",
  // Fertiges Medium (Bild oder Standbild-Video).
  mediaHtml = "",
  isVideo = false,
  playIconHtml = "",
  likeLabel = "0",
  commentLabel = "0",
  likeAttrs = "",
  commentAttrs = "",
  heartIconHtml = "",
  commentIconHtml = "",
  // Das Drei-Punkte-Menue - nur im Profil, nie in der Vorschau.
  menuHtml = "",
  escapeHtmlFn
} = {}) {
  const esc = typeof escapeHtmlFn === "function" ? escapeHtmlFn : noopEscape;
  return `
    <div ${cardAttrs} role="button" tabindex="0" class="${colClass} relative ${aspectClass} ${PROFILE_POST_CARD_RADIUS_CLASS} overflow-hidden bg-white shadow-[0_30px_60px_-12px_rgba(50,50,93,0.15),0_18px_36px_-18px_rgba(0,0,0,0.15)] cursor-pointer transition-transform">
      <div class="absolute inset-0 ${PROFILE_POST_CARD_RADIUS_CLASS} overflow-hidden active:scale-[0.98] transition-transform">
        ${mediaHtml}
        ${isVideo ? `<div class="absolute top-3 left-3 w-7 h-7 text-white drop-shadow-md bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center">${playIconHtml}</div>` : ""}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 pb-4 pointer-events-none">
          <div class="w-full flex items-end justify-center">
            <div class="flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <div class="flex items-center gap-1">
                ${heartIconHtml}
                <span ${likeAttrs} class="text-[10px] font-bold tracking-wide">${esc(likeLabel)}</span>
              </div>
              <div class="w-px h-3 bg-white/20"></div>
              <div class="flex items-center gap-1">
                ${commentIconHtml}
                <span ${commentAttrs} class="text-[10px] font-bold tracking-wide">${esc(commentLabel)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${menuHtml}
    </div>
  `;
}
