// Die grauen Umrisse, die waehrend des Ladens an der Stelle der Lokal-Karten
// stehen. Vorher stand hier ein Satz ("Te dhenat po ngarkohen ...") - der sagte
// nichts ueber die spaetere Form, und wenn die Daten kamen, sprang das Layout.
//
// Die Umrisse tragen deshalb exakt die Masse der echten Karten: dieselbe
// Bildhoehe (h-28 in der Reihe, h-48 in der Liste), dieselbe Kartenbreite
// (w-44), dieselben Radien und Abstaende. Damit steht beim Eintreffen der Daten
// jede Zeile schon an ihrem Platz.
//
// Bewusst ein eigener, winziger Baustein: die Marktplatz-Ansicht wird erst bei
// Bedarf nachgeladen, aber genau davor braucht der Rahmen die Umrisse schon.
// Beide holen sie sich von hier, damit es nur eine Fassung gibt.

function skeletonBlock(className = "") {
  return `<div aria-hidden="true" class="${className} bg-slate-100 animate-pulse"></div>`;
}

function skeletonBestCard() {
  return `
    <div class="shrink-0 w-44 rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm">
      ${skeletonBlock("h-28 w-full")}
      <div class="p-4">
        <div class="flex items-center justify-between gap-2 mb-2">
          ${skeletonBlock("h-2.5 w-16 rounded-full")}
          ${skeletonBlock("h-2.5 w-8 rounded-full")}
        </div>
        ${skeletonBlock("h-4 w-4/5 rounded-full")}
        ${skeletonBlock("mt-2 h-2.5 w-3/5 rounded-full")}
      </div>
    </div>
  `;
}

function skeletonListCard() {
  return `
    <article class="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      ${skeletonBlock("h-48 w-full")}
      <div class="p-5">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            ${skeletonBlock("h-2.5 w-20 rounded-full")}
            ${skeletonBlock("mt-2 h-5 w-3/5 rounded-full")}
          </div>
          ${skeletonBlock("h-6 w-12 rounded-xl shrink-0")}
        </div>
        ${skeletonBlock("mt-3 h-3 w-full rounded-full")}
        ${skeletonBlock("mt-2 h-3 w-4/5 rounded-full")}
        <div class="mt-4 grid grid-cols-1 gap-2">
          ${skeletonBlock("h-3 w-2/5 rounded-full")}
          ${skeletonBlock("h-3 w-1/3 rounded-full")}
        </div>
      </div>
    </article>
  `;
}

export function renderMarketplaceSkeletonCore({ bestCount = 3, listCount = 3 } = {}) {
  const safeBestCount = Math.max(0, Math.trunc(Number(bestCount) || 0));
  const safeListCount = Math.max(0, Math.trunc(Number(listCount) || 0));
  return `
    <div data-marketplace-skeleton="1" aria-hidden="true">
      ${safeBestCount ? `
        <div style="margin-bottom:2rem;">
          <div class="flex gap-3 overflow-hidden">
            ${Array.from({ length: safeBestCount }, skeletonBestCard).join("")}
          </div>
        </div>
      ` : ""}
      <div class="space-y-4">
        ${Array.from({ length: safeListCount }, skeletonListCard).join("")}
      </div>
    </div>
  `;
}

export function renderMarketplaceSkeletonSectionCore(options = {}) {
  return `
    <section class="p-6 pb-24">
      ${renderMarketplaceSkeletonCore(options)}
    </section>
  `;
}
