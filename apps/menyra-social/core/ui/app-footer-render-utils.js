// Der Fuss der App.
//
// Er steht am Ende JEDER scrollenden Seite und gibt ihr damit ein
// definiertes Ende - vorher hoerte jede Ansicht dort auf, wo ihr Inhalt
// aufhoerte, und darunter lag eine andere Farbe (die Flaeche der App, auf iOS
// zusaetzlich der Grund hinter der Adressleiste). Ein Fuss in eben dieser
// Farbe schliesst die Seite ab, statt sie abbrechen zu lassen.
//
// Drei Regeln, an die er sich haelt - sie sind der Grund, warum er nichts
// kaputt macht:
//
//   1. Er steht IM Fluss, ganz am Ende von <main>. Nichts liegt fest, nichts
//      ueberlagert, nichts wird ueberdeckt. Er kann keine Bedienung verdecken,
//      weil er nirgends darueber liegt.
//      Bei kurzem Inhalt schiebt ihn "margin-top: auto" an den unteren Rand:
//      <main> ist ein Stapel, der mindestens den Bildschirm fuellt, und der
//      Fuss nimmt sich den uebrigen Platz als Abstand. Bei langem Inhalt gibt
//      es keinen uebrigen Platz - dann steht er einfach hinter dem Inhalt.
//   2. Er bringt seine Masse selbst mit - als Inline-Stil, nicht als Klasse.
//      Mnyra liefert ein fest vorgeneriertes Tailwind-CSS aus; eine Klasse,
//      die dort nicht drinsteht, tut lautlos nichts. Und ein <style>-Block
//      waere bei jedem Neuaufbau neu zu lesen - der Fuss steht auf JEDER
//      Seite, das waere Arbeit ohne Ertrag.
//   3. Wo die Seite nicht scrollt, steht er nicht (siehe
//      shouldShowAppFooterCore). Auf einer Karte, in einem Chat-Verlauf oder
//      auf der Wisch-Flaeche des Landings gibt es kein "Ende der Seite", an
//      das er gehoeren wuerde - dort wuerde er nur stoeren.

const FOOTER_INK = "#94a3b8";
const FOOTER_INK_STRONG = "#0f172a";
const FOOTER_HAIRLINE = "#e2e8f0";
// Der Fuss entscheidet seine Farbe nicht selbst - er uebernimmt sie von der
// Ansicht darueber. Endet eine Seite auf einer weissen Flaeche (dem Bento des
// Panels, den Kapiteln des Gates), stuende ein grauer Fuss als Kante darunter.
// Die Ansicht markiert ihre unterste Flaeche, die Huelle setzt daraufhin
// --app-footer-surface, und dieser Rueckfall gilt fuer alle anderen Seiten.
const FOOTER_SURFACE = "var(--app-footer-surface, var(--app-bg, #f8fafc))";

// Ansichten, die kein Seitenende haben. Alle drei bauen ihre Hoehe selbst und
// sperren das Scrollen: eine Karte fuellt den Bildschirm, ein offener
// Chat-Verlauf ist eine feste Spalte, und das Landing ist eine Wisch-Flaeche
// mit touch-action: none. Ein Fuss darin waere entweder unerreichbar oder
// wuerde die Geste stoeren.
export function shouldShowAppFooterCore({
  isMapView = false,
  isChatThreadOpen = false,
  isLandingTopTab = false
} = {}) {
  return !isMapView && !isChatThreadOpen && !isLandingTopTab;
}

// Das Jahr wird hereingereicht, damit der Fuss ohne Uhr pruefbar bleibt.
export function renderAppFooterCore({
  brandTitle = "MNYRA",
  year = new Date().getFullYear(),
  escapeHtmlFn
} = {}) {
  const esc = typeof escapeHtmlFn === "function"
    ? escapeHtmlFn
    : ((value = "") => String(value || ""));
  const safeYear = Math.trunc(Number(year));
  const yearText = Number.isFinite(safeYear) && safeYear > 0 ? String(safeYear) : "";
  return `
    <footer
      data-app-footer
      style="
        margin-top: auto;
        padding: 2.5rem 1.75rem calc(2.5rem + var(--safe-area-bottom, 0px));
        border-top: 1px solid ${FOOTER_HAIRLINE};
        background: ${FOOTER_SURFACE};
        text-align: center;
      "
    >
      <p style="margin:0; font-size:15px; font-weight:900; font-style:italic; letter-spacing:-0.02em; color:${FOOTER_INK_STRONG};">${esc(brandTitle)}</p>
      <p style="margin:6px 0 0; font-size:11px; font-weight:700; line-height:1.5; color:${FOOTER_INK};">Zbulo qytetin tënd.</p>
      ${yearText ? `<p style="margin:14px 0 0; font-size:10px; font-weight:700; letter-spacing:0.06em; color:${FOOTER_INK};">© ${esc(yearText)} ${esc(brandTitle)}</p>` : ""}
    </footer>
  `;
}
