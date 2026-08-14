// Die grauen Umrisse, die an der Stelle eines Profils oder einer Menuekarte
// stehen, solange der Renderer dafuer noch nachgeladen wird.
//
// Vorher stand dort NICHTS: profile-menu-focus-render-boundary.js gab eine
// leere Zeichenkette zurueck, solange ihr Baustein
// (profile-menu-focus-render-controller, der groesste Nachlade-Brocken der App)
// noch unterwegs war. Ein Tipp auf "Profili" oder "Menu" fuehrte deshalb auf
// eine leere weisse Flaeche - und die stand dort so lange, wie das Netz fuer
// den Baustein brauchte. Genau das sah aus wie "es passiert nichts".
//
// Jetzt steht sofort die Form da, die gleich mit Inhalt gefuellt wird:
// Titelbild, Logo, Name, Zeilen, zwei Knoepfe. Wenn der Baustein ankommt,
// wechselt der Inhalt an derselben Stelle - nichts springt.
//
// WICHTIG - warum hier so viel inline steht: Mnyra liefert ein fest
// vorgeneriertes Tailwind-CSS aus (styles/tailwind.generated.css). Es wird beim
// Build NICHT neu erzeugt. Eine Klasse, die dort nicht drinsteht, tut also
// schlicht nichts - lautlos. Alle Masse, auf die es ankommt, stehen deshalb
// inline; die Klassen daneben sind nur Beiwerk. Dieselbe Regel wie in
// marketplace-skeleton-markup.js.

const PULSE = "background:#f1f5f9;";

function bar({ height = "0.75rem", width = "100%", marginTop = "0" } = {}) {
  return `<div aria-hidden="true" class="animate-pulse" style="${PULSE}height:${height};width:${width};margin-top:${marginTop};border-radius:9999px;"></div>`;
}

function block({ height = "1rem", radius = "1rem", marginTop = "0" } = {}) {
  return `<div aria-hidden="true" class="animate-pulse" style="${PULSE}height:${height};width:100%;margin-top:${marginTop};border-radius:${radius};"></div>`;
}

function skeletonRow() {
  return `
    <div style="display:flex;align-items:center;gap:0.75rem;margin-top:0.75rem;">
      <div aria-hidden="true" class="animate-pulse" style="${PULSE}flex:0 0 auto;height:1rem;width:1rem;border-radius:9999px;"></div>
      ${bar({ height: "0.75rem", width: "60%" })}
    </div>
  `;
}

export function renderProfileSkeletonCore({ rowCount = 3, cardCount = 2 } = {}) {
  const safeRowCount = Math.max(0, Math.trunc(Number(rowCount) || 0));
  const safeCardCount = Math.max(0, Math.trunc(Number(cardCount) || 0));
  return `
    <div data-profile-skeleton="1" aria-hidden="true" style="min-height:100%;background:#f8fafc;">
      ${block({ height: "12rem", radius: "0" })}
      <div style="padding:0 1.25rem;">
        <div aria-hidden="true" class="animate-pulse" style="${PULSE}height:5rem;width:5rem;border-radius:9999px;border:4px solid #fff;margin-top:-2.5rem;"></div>
        ${bar({ height: "1.25rem", width: "55%", marginTop: "1rem" })}
        ${bar({ height: "0.75rem", width: "35%", marginTop: "0.5rem" })}
        ${Array.from({ length: safeRowCount }, skeletonRow).join("")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1.25rem;">
          <div aria-hidden="true" class="animate-pulse" style="${PULSE}height:2.75rem;border-radius:0.75rem;"></div>
          <div aria-hidden="true" class="animate-pulse" style="${PULSE}height:2.75rem;border-radius:0.75rem;"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:1.5rem;padding-bottom:6rem;">
          ${Array.from({ length: safeCardCount }, () => block({ height: "9rem", radius: "1.5rem" })).join("")}
        </div>
      </div>
    </div>
  `;
}
