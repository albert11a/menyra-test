// Mnyra GO - die Karte, die der Gast sieht. Eine Datei, zwei Orte.
//
// Sie steht im Ergebnis der Suche (go-page-render-utils.js) und in der
// Vorschau des Editors - "Kështu e sheh klienti" (business-go-render-utils.js).
// Deshalb liegt sie hier und nicht in einer der beiden Dateien: Zwei Nachbauten
// derselben Karte laufen frueher oder spaeter auseinander, und dann verspricht
// die Vorschau dem Wirt etwas anderes, als der Gast spaeter bekommt. Genau das
// war der Fall - die Vorschau war eine eigene weisse Kachel mit anderen
// Groessen, anderen Abstaenden und einem Knopf, den es so nie gab.
//
// Das Stylesheet steht daneben (GO_OFFER_CARD_CSS): Die Gaeste-Seite haengt es
// in den Kopf des Dokuments, das Editor-Modal traegt es in sich. Die Farben
// kommen ueber Variablen der GO-Seite - mit denselben Werten als Rueckfall,
// damit die Karte auch ausserhalb der Seite genau so aussieht.

import { goIcon } from "./go-icon-render-utils.js";

export const GO_OFFER_CARD_TEXTS = Object.freeze({
  offering: "po ju ofron",
  forGroup: "për grupin tuaj",
  accept: "Prano ofertën",
  sponsored: "Sponsored",
  onlyGo: "Vetëm me Mnyra GO",
  tableIncluded: "Tavolinë",
  peopleSuffix: "persona"
});

// Die drei Fassungen derselben Karte (Punkt 27, 28, 30, 32).
//
// Es sind keine drei Karten: Es ist eine Karte mit demselben Aufbau, deren
// Bild einmal fehlt, einmal oben liegt und einmal daneben steht. Welche es
// wird, entscheidet nicht der Geschmack, sondern die Lage:
//
//   kein Foto                       -> "clean"
//   ein Foto, eine Karte im Bild    -> "hero"
//   ein Foto, mehrere untereinander -> "compact"
//
// Der letzte Fall ist der Grund fuer die Uebung: Bekommt ein Gast fuenf
// Angebote, sind fuenf Karten mit je 16:9-Bild ein Bildschirm voll Scrollen,
// bevor er zwei davon verglichen hat.
export const GO_CARD_VARIANT_CLEAN = "clean";
export const GO_CARD_VARIANT_HERO = "hero";
export const GO_CARD_VARIANT_COMPACT = "compact";

const GO_CARD_VARIANTS = [GO_CARD_VARIANT_CLEAN, GO_CARD_VARIANT_HERO, GO_CARD_VARIANT_COMPACT];

/**
 * Welche Fassung eine Karte tragen soll.
 *
 * Ohne Foto gibt es nur eine Antwort - die ruhige Karte. Sie ist deshalb auch
 * der Rueckfall, wenn ein Bild ausfaellt: Eine Karte, die eine Bildflaeche
 * freihaelt, die nie gefuellt wird, ist schlechter als eine ohne.
 */
export function resolveGoCardVariant({ imageUrl = "", variant = "" } = {}) {
  if (!String(imageUrl || "").trim()) return GO_CARD_VARIANT_CLEAN;
  const wanted = String(variant || "").trim().toLowerCase();
  return GO_CARD_VARIANTS.includes(wanted) ? wanted : GO_CARD_VARIANT_HERO;
}

export const GO_OFFER_CARD_CSS = `
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
`;

function esc(value = "") {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Die Karte eines GO-Angebots, so wie der Gast sie sieht.
 *
 * `meta` sind die kleinen Zeilen unter dem Vorteil - beim Gast seine Gruppe,
 * seine Ankunft und die Entfernung, im Editor der Bereich und der Zeitraum,
 * fuer die das Angebot gilt. Beides sind dieselben Zeilen an derselben Stelle;
 * was drinsteht, weiss nur die Seite, die fragt.
 *
 * `benefitView` ist derselbe Vorteil in seinen Zeilen - aus buildGoBenefitView
 * in shared/go/go-offer-core.js. Die Karte entscheidet daran nichts mehr; sie
 * setzt hin, was dasteht: den kleinen Hinweis, die grosse Zeile, die
 * Ergaenzung, die beiden Preise, die Ersparnis. Ohne ihn bleibt `benefitLabel`
 * - eine Karte, die aus einer Buchung von damals gezeichnet wird, hat nur
 * diese eine Zeile, und sie soll sie zeigen.
 */
export function renderGoOfferCardCore({
  businessName = "",
  logoUrl = "",
  imageUrl = "",
  variant = "",
  benefitLabel = "",
  benefitView = null,
  sponsored = false,
  meta = [],
  ctaLabel = "",
  ctaIcon = "check-check",
  ctaDisabled = false,
  cardAttrs = "",
  ctaAttrs = "",
  texts = GO_OFFER_CARD_TEXTS
} = {}) {
  const labels = { ...GO_OFFER_CARD_TEXTS, ...(texts || {}) };
  const entries = (Array.isArray(meta) ? meta : []).filter((entry) => entry && entry.label);
  const cta = String(ctaLabel || labels.accept);
  const view = benefitView && typeof benefitView === "object" ? benefitView : {};
  const headline = String(view.headline || benefitLabel || "");
  const priceGo = String(view.priceGo || "");
  const priceRegular = String(view.priceRegular || "");
  const photo = String(imageUrl || "").trim();
  const mode = resolveGoCardVariant({ imageUrl: photo, variant });
  const isCompact = mode === GO_CARD_VARIANT_COMPACT;
  const photoHtml = photo
    ? `<img class="mnyra-go-page__card-photo" src="${esc(photo)}" alt="" loading="lazy" decoding="async" />`
    : "";

  // Der Kopf, der Vorteil und die Preise - in der gedraengten Fassung stehen
  // sie neben dem Bild, in den beiden anderen darunter. Es ist dieselbe Folge
  // von Zeilen: Wer anbietet, was es gibt, was es kostet.
  const bodyHtml = `
    <div class="mnyra-go-page__card-head">
      ${logoUrl
        ? `<img class="mnyra-go-page__card-logo" src="${esc(logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
        : `<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${goIcon("store")}</div>`}
      <div class="mnyra-go-page__card-names">
        <p class="mnyra-go-page__card-who">${esc(businessName)} <span>${esc(labels.offering)}</span></p>
        ${sponsored ? `<p class="mnyra-go-page__card-sponsored">${esc(labels.sponsored)}</p>` : ""}
      </div>
    </div>

    ${view.eyebrow ? `<p class="mnyra-go-page__card-eyebrow">${esc(view.eyebrow)}</p>` : ""}
    <p class="mnyra-go-page__card-benefit${priceGo ? " mnyra-go-page__card-benefit--title" : ""}">${esc(headline)}</p>
    ${view.note ? `<p class="mnyra-go-page__card-note">${esc(view.note)}</p>` : ""}
    ${priceGo ? `
      <div class="mnyra-go-page__card-prices">
        ${priceRegular ? `<span class="mnyra-go-page__card-price-was">${esc(priceRegular)}</span>` : ""}
        <span class="mnyra-go-page__card-price-go">${esc(priceGo)}</span>
      </div>
    ` : ""}
    ${view.savingLabel ? `<p class="mnyra-go-page__card-saving">${esc(view.savingLabel)}</p>` : ""}
    ${isCompact ? "" : `<p class="mnyra-go-page__card-for">${esc(labels.forGroup)}</p>`}
  `;

  const footHtml = `
    <div class="mnyra-go-page__card-meta">
      ${entries.map((entry) => `<span>${goIcon(entry.icon || "")}${esc(entry.label)}</span>`).join("")}
    </div>

    <p class="mnyra-go-page__card-only">${goIcon("ticket-percent")}${esc(labels.onlyGo)}</p>

    <button
      type="button"
      class="mnyra-go-page__cta"
      ${ctaAttrs}
      ${ctaDisabled ? "disabled" : ""}
    >${ctaIcon ? goIcon(ctaIcon) : ""}${esc(cta)}</button>
  `;

  if (isCompact) {
    return `
      <article class="mnyra-go-page__card mnyra-go-page__card--compact"${cardAttrs ? ` ${cardAttrs}` : ""}>
        <div class="mnyra-go-page__card-top">
          ${photoHtml}
          <div>${bodyHtml}</div>
        </div>
        ${footHtml}
      </article>
    `;
  }

  if (mode === GO_CARD_VARIANT_HERO) {
    return `
      <article class="mnyra-go-page__card mnyra-go-page__card--hero"${cardAttrs ? ` ${cardAttrs}` : ""}>
        ${photoHtml}
        <div class="mnyra-go-page__card-body">
          ${bodyHtml}
          ${footHtml}
        </div>
      </article>
    `;
  }

  return `
    <article class="mnyra-go-page__card"${cardAttrs ? ` ${cardAttrs}` : ""}>
      ${bodyHtml}
      ${footHtml}
    </article>
  `;
}
