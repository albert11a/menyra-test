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
.mnyra-go-page__card-head { display: flex; align-items: center; gap: 10px; }
.mnyra-go-page__card-logo { width: 40px; height: 40px; border-radius: 14px; object-fit: cover; background: var(--go-plane, #f8fafc); flex: 0 0 auto; }
.mnyra-go-page__card-logo--empty { color: var(--go-muted, #94a3b8); display: flex; align-items: center; justify-content: center; }
.mnyra-go-page__card-logo--empty svg { width: 18px; height: 18px; }
.mnyra-go-page__card-names { min-width: 0; }
.mnyra-go-page__card-who { margin: 0; min-width: 0; font-size: 13px; font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mnyra-go-page__card-who span { color: var(--go-muted, #94a3b8); font-weight: 700; }
.mnyra-go-page__card-sponsored { margin: 2px 0 0; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: var(--go-muted, #94a3b8); }
.mnyra-go-page__card-benefit { margin: 12px 0 0; font-size: 26px; font-weight: 900; letter-spacing: -0.03em; }
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
 */
export function renderGoOfferCardCore({
  businessName = "",
  logoUrl = "",
  benefitLabel = "",
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

  return `
    <article class="mnyra-go-page__card"${cardAttrs ? ` ${cardAttrs}` : ""}>
      <div class="mnyra-go-page__card-head">
        ${logoUrl
          ? `<img class="mnyra-go-page__card-logo" src="${esc(logoUrl)}" alt="" width="40" height="40" loading="lazy" decoding="async" />`
          : `<div class="mnyra-go-page__card-logo mnyra-go-page__card-logo--empty">${goIcon("store")}</div>`}
        <div class="mnyra-go-page__card-names">
          <p class="mnyra-go-page__card-who">${esc(businessName)} <span>${esc(labels.offering)}</span></p>
          ${sponsored ? `<p class="mnyra-go-page__card-sponsored">${esc(labels.sponsored)}</p>` : ""}
        </div>
      </div>

      <p class="mnyra-go-page__card-benefit">${esc(benefitLabel)}</p>
      <p class="mnyra-go-page__card-for">${esc(labels.forGroup)}</p>

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
    </article>
  `;
}
