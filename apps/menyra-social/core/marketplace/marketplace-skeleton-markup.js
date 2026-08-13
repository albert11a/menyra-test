// Die grauen Umrisse, die waehrend des Ladens an der Stelle der Lokal-Karten
// stehen. Vorher stand hier ein Satz ("Te dhenat po ngarkohen ...") - der sagte
// nichts ueber die spaetere Form, und wenn die Daten kamen, sprang das Layout.
//
// Die Umrisse tragen deshalb exakt die Masse der echten Karten: dieselbe
// Bildhoehe (h-28 in der Reihe, 12rem in der Liste), dieselbe Kartenbreite
// (w-44), dieselben Radien und Abstaende. Damit steht beim Eintreffen der Daten
// jede Zeile schon an ihrem Platz.
//
// WICHTIG - warum hier so viel inline steht:
// Mnyra liefert ein fest vorgeneriertes Tailwind-CSS aus
// (styles/tailwind.generated.css). Es wird beim Build NICHT neu erzeugt. Eine
// Klasse, die dort nicht drinsteht, tut also schlicht nichts - lautlos. Genau
// daran waren die Balken hier zuerst unsichtbar: w-2/5, w-3/5, w-4/5, w-1/3,
// h-2.5, h-3.5 und h-48 gibt es in dieser Datei nicht. Alle Masse, auf die es
// ankommt, stehen deshalb inline; die Klassen daneben sind nur noch Beiwerk.
//
// Bewusst ein eigener, winziger Baustein: die Marktplatz-Ansicht wird erst bei
// Bedarf nachgeladen, aber genau davor braucht der Rahmen die Umrisse schon.
// Beide holen sie sich von hier, damit es nur eine Fassung gibt.

const PULSE = "background:#f1f5f9;";

function bar({ height = "0.75rem", width = "100%", marginTop = "0" } = {}) {
  return `<div aria-hidden="true" class="animate-pulse" style="${PULSE}height:${height};width:${width};margin-top:${marginTop};border-radius:9999px;"></div>`;
}

function box({ height = "1rem", radius = "0" } = {}) {
  return `<div aria-hidden="true" class="animate-pulse" style="${PULSE}height:${height};width:100%;border-radius:${radius};"></div>`;
}

function skeletonBestCard() {
  return `
    <div class="bg-white border border-slate-100 shadow-sm" style="flex:0 0 auto;width:11rem;border-radius:2rem;overflow:hidden;">
      ${box({ height: "7rem" })}
      <div style="padding:1rem;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;">
          ${bar({ height: "0.625rem", width: "4rem" })}
          ${bar({ height: "0.625rem", width: "2rem" })}
        </div>
        ${bar({ height: "1rem", width: "80%" })}
        ${bar({ height: "0.625rem", width: "60%", marginTop: "0.5rem" })}
      </div>
    </div>
  `;
}

function skeletonListCard() {
  return `
    <article class="bg-white border border-slate-100 shadow-sm" style="border-radius:2rem;overflow:hidden;">
      ${box({ height: "12rem" })}
      <div style="padding:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;">
          <div style="flex:1 1 auto;min-width:0;">
            ${bar({ height: "0.625rem", width: "5rem" })}
            ${bar({ height: "1.25rem", width: "60%", marginTop: "0.5rem" })}
          </div>
          <div aria-hidden="true" class="animate-pulse" style="${PULSE}flex:0 0 auto;height:1.5rem;width:3rem;border-radius:0.75rem;"></div>
        </div>
        ${bar({ height: "0.75rem", width: "100%", marginTop: "0.75rem" })}
        ${bar({ height: "0.75rem", width: "80%", marginTop: "0.5rem" })}
        ${bar({ height: "0.75rem", width: "40%", marginTop: "1rem" })}
        ${bar({ height: "0.75rem", width: "33%", marginTop: "0.5rem" })}
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
          <div style="display:flex;gap:0.75rem;overflow:hidden;">
            ${Array.from({ length: safeBestCount }, skeletonBestCard).join("")}
          </div>
        </div>
      ` : ""}
      <div style="display:flex;flex-direction:column;gap:1rem;">
        ${Array.from({ length: safeListCount }, skeletonListCard).join("")}
      </div>
    </div>
  `;
}

export function renderMarketplaceSkeletonSectionCore(options = {}) {
  return `
    <section class="pb-24" style="padding:1.5rem;padding-bottom:6rem;">
      ${renderMarketplaceSkeletonCore(options)}
    </section>
  `;
}
