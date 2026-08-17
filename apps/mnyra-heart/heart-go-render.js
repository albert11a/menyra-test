// Heart: Mnyra GO - was Mnyra selbst verdient.
//
// Die Seite beantwortet drei Fragen, und zwar in dieser Reihenfolge, weil das
// die Reihenfolge ist, in der man sie sich stellt:
//
//   1. Was habe ich verdient, und was ist davon noch nicht abgerechnet?
//   2. Wie laeuft der Trichter - gesehen, angenommen, bestaetigt?
//   3. Welches Lokal bestaetigt nicht?
//
// Die dritte ist die eigentliche: Eine angenommene Oferta, die nie bestaetigt
// wird, bleibt fuer den Gast gueltig - er kann wiederkommen oder sie
// weitergeben. Ein Lokal, das dauerhaft nicht bestaetigt, spart keine
// Provision, sondern verschenkt Rabatte. Das darf es wissen.

import { escapeHtml } from "./heart-ui-utils.js";
import { formatGoCommission } from "../../shared/go/go-commission-core.js";

function num(value) {
  const parsed = Math.trunc(Number(value) || 0);
  return parsed > 0 ? parsed : 0;
}

function renderMoneyTile(label, cents, tone = "") {
  return `
    <div class="heart-go__tile ${tone ? `heart-go__tile--${escapeHtml(tone)}` : ""}">
      <p class="heart-go__tile-label">${escapeHtml(label)}</p>
      <p class="heart-go__tile-value">${escapeHtml(formatGoCommission(cents))}</p>
    </div>
  `;
}

function renderCountTile(label, value, hint = "") {
  return `
    <div class="heart-go__tile">
      <p class="heart-go__tile-label">${escapeHtml(label)}</p>
      <p class="heart-go__tile-value">${escapeHtml(String(num(value)))}</p>
      ${hint ? `<p class="heart-go__tile-hint">${escapeHtml(hint)}</p>` : ""}
    </div>
  `;
}

/**
 * Der Trichter.
 *
 * Drei Stufen, keine vier: "angenommen" und "aktiviert" waeren dasselbe. Der
 * Gast nimmt an, das Lokal bestaetigt - dazwischen gibt es keinen dritten
 * Handgriff, und einen zu erfinden hiesse, eine Zahl zu zeigen, die niemand
 * erzeugt.
 */
function renderFunnel(totals = {}) {
  const stages = [
    { label: "E kanë parë", value: num(totals.impressions), hint: "Oferta u shfaq" },
    { label: "E kanë pranuar", value: num(totals.accepted), hint: `${totals.acceptRatePercent || 0} %` },
    { label: "E kanë konfirmuar", value: num(totals.confirmed), hint: `${totals.confirmRatePercent || 0} %` }
  ];
  const widest = Math.max(1, ...stages.map((stage) => stage.value));
  return `
    <div class="heart-go__funnel">
      ${stages.map((stage) => `
        <div class="heart-go__stage">
          <div class="heart-go__stage-head">
            <span class="heart-go__stage-label">${escapeHtml(stage.label)}</span>
            <span class="heart-go__stage-value">${escapeHtml(String(stage.value))}</span>
          </div>
          <div class="heart-go__stage-bar">
            <span style="width:${Math.round((stage.value / widest) * 100)}%"></span>
          </div>
          <span class="heart-go__stage-hint">${escapeHtml(stage.hint)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

/**
 * Die Lokale, sortiert nach dem, was sie einbringen.
 *
 * Die Quote steht neben der Luecke, weil die Luecke allein taeuscht: Ein
 * grosses Lokal hat immer eine groessere Luecke als ein kleines. Erst der
 * Prozentsatz sagt, ob jemand mitspielt.
 */
function renderRestaurantRows(restaurants = []) {
  if (!restaurants.length) {
    return `<p class="heart-go__empty">Noch keine bestätigten Oferten in diesem Zeitraum.</p>`;
  }
  return `
    <div class="heart-go__table">
      <div class="heart-go__row heart-go__row--head">
        <span>Lokal</span>
        <span>Parë</span>
        <span>Pranuar</span>
        <span>Konfirmuar</span>
        <span>Kuota</span>
        <span>Provizion</span>
      </div>
      ${restaurants.map((row) => {
    // Unter siebzig Prozent ist ein Gespraech faellig - aber erst, wenn es
    // ueberhaupt etwas zu bestaetigen gab. Bei zwei angenommenen Oferten
    // sagt eine Quote noch nichts.
    const worth = num(row.accepted) >= 5;
    const weak = worth && Number(row.confirmRatePercent) < 70;
    return `
        <div class="heart-go__row ${weak ? "heart-go__row--weak" : ""}" data-heart-go-restaurant="${escapeHtml(row.restaurantId)}">
          <span class="heart-go__cell-name">${escapeHtml(row.name || row.restaurantId)}</span>
          <span>${escapeHtml(String(num(row.impressions)))}</span>
          <span>${escapeHtml(String(num(row.accepted)))}</span>
          <span>${escapeHtml(String(num(row.confirmed)))}</span>
          <span class="${weak ? "heart-go__cell-weak" : ""}">${escapeHtml(String(Number(row.confirmRatePercent) || 0))} %</span>
          <span class="heart-go__cell-money">${escapeHtml(formatGoCommission(num(row.pendingCents) + num(row.settledCents)))}</span>
        </div>
      `;
  }).join("")}
    </div>
  `;
}

export function renderHeartGoView(go = {}) {
  if (go.status === "loading") {
    return `<div class="heart-go"><p class="heart-go__empty">Po ngarkohet…</p></div>`;
  }
  if (go.status === "error") {
    return `
      <div class="heart-go">
        <p class="heart-go__error">${escapeHtml(go.error || "Die GO-Zahlen konnten nicht geladen werden.")}</p>
        <button type="button" class="heart-go__retry" data-heart-go-reload>Erneut versuchen</button>
      </div>
    `;
  }

  const data = go.data || {};
  const totals = data.totals || {};
  const range = data.range || {};

  return `
    <div class="heart-go">
      <div class="heart-go__head">
        <div>
          <h2 class="heart-go__title">MNYRA<span class="heart-go__title-go">GO</span></h2>
          <p class="heart-go__sub">${escapeHtml(range.from || "")} – ${escapeHtml(range.to || "")} · ${escapeHtml(String(num(totals.restaurants)))} lokale</p>
        </div>
        <div class="heart-go__ranges">
          ${[7, 30, 90].map((days) => `
            <button type="button" class="heart-go__range ${Number(range.days) === days ? "is-active" : ""}"
              data-heart-go-range="${days}">${days}d</button>
          `).join("")}
        </div>
      </div>

      <div class="heart-go__tiles">
        ${renderMoneyTile("Offen", num(totals.pendingCents), "pending")}
        ${renderMoneyTile("Abgerechnet", num(totals.settledCents))}
        ${renderMoneyTile("Verdient gesamt", num(totals.earnedCents), "total")}
        ${renderCountTile("Nicht bestätigt", totals.missingConfirmations, "Angenommen, nie eingelöst")}
      </div>

      ${renderFunnel(totals)}
      ${renderRestaurantRows(Array.isArray(data.restaurants) ? data.restaurants : [])}
    </div>
  `;
}

export const HEART_GO_CSS = `
.heart-go { display: flex; flex-direction: column; gap: 18px; }
.heart-go__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.heart-go__title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.03em; }
.heart-go__title-go { color: #635bff; }
.heart-go__sub { margin: 2px 0 0; font-size: 11px; font-weight: 700; color: var(--heart-muted, #94a3b8); }
.heart-go__ranges { display: flex; gap: 6px; }
.heart-go__range {
  padding: 7px 12px; border-radius: 999px; border: 1px solid var(--heart-border, #e2e8f0);
  background: transparent; color: var(--heart-muted, #94a3b8);
  font: inherit; font-size: 11px; font-weight: 800; cursor: pointer;
}
.heart-go__range.is-active { background: #0f172a; border-color: #0f172a; color: #ffffff; }
.heart-go__tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.heart-go__tile {
  padding: 14px 16px; border-radius: 18px;
  border: 1px solid var(--heart-border, #e2e8f0); background: var(--heart-surface, #ffffff);
}
.heart-go__tile--pending { border-color: #c7d2fe; }
.heart-go__tile--total { background: #0f172a; border-color: #0f172a; }
.heart-go__tile--total .heart-go__tile-label { color: rgba(255,255,255,0.6); }
.heart-go__tile--total .heart-go__tile-value { color: #ffffff; }
.heart-go__tile-label { margin: 0; font-size: 9px; font-weight: 900; letter-spacing: 0.14em; text-transform: uppercase; color: var(--heart-muted, #94a3b8); }
.heart-go__tile-value { margin: 6px 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.heart-go__tile-hint { margin: 4px 0 0; font-size: 10px; font-weight: 700; color: var(--heart-muted, #94a3b8); }
.heart-go__funnel { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.heart-go__stage { padding: 14px 16px; border-radius: 18px; border: 1px solid var(--heart-border, #e2e8f0); }
.heart-go__stage-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.heart-go__stage-label { font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: var(--heart-muted, #94a3b8); }
.heart-go__stage-value { font-size: 20px; font-weight: 900; font-variant-numeric: tabular-nums; }
.heart-go__stage-bar { margin-top: 10px; height: 6px; border-radius: 999px; background: var(--heart-plane, #f1f5f9); overflow: hidden; }
.heart-go__stage-bar span { display: block; height: 100%; border-radius: 999px; background: #635bff; }
.heart-go__stage-hint { display: block; margin-top: 6px; font-size: 10px; font-weight: 700; color: var(--heart-muted, #94a3b8); }
.heart-go__table { border: 1px solid var(--heart-border, #e2e8f0); border-radius: 18px; overflow: hidden; }
.heart-go__row {
  display: grid; grid-template-columns: minmax(0, 2fr) repeat(4, minmax(0, 1fr)) minmax(0, 1.2fr);
  gap: 8px; padding: 11px 14px; align-items: center;
  font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums;
  border-top: 1px solid var(--heart-border, #e2e8f0);
}
.heart-go__row:first-child { border-top: 0; }
.heart-go__row--head { font-size: 9px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: var(--heart-muted, #94a3b8); }
.heart-go__row--weak { background: rgba(244, 63, 94, 0.06); }
.heart-go__cell-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; }
.heart-go__cell-weak { color: #e11d48; font-weight: 900; }
.heart-go__cell-money { text-align: right; font-weight: 900; }
.heart-go__empty, .heart-go__error { margin: 0; padding: 28px 0; text-align: center; font-size: 12px; font-weight: 700; color: var(--heart-muted, #94a3b8); }
.heart-go__error { color: #e11d48; }
.heart-go__retry {
  display: block; margin: 0 auto; padding: 9px 16px; border-radius: 999px;
  border: 1px solid var(--heart-border, #e2e8f0); background: transparent;
  font: inherit; font-size: 11px; font-weight: 800; cursor: pointer;
}
@media (max-width: 640px) {
  .heart-go__row { grid-template-columns: minmax(0, 1.6fr) repeat(2, minmax(0, 1fr)) minmax(0, 1.1fr); }
  .heart-go__row > span:nth-child(2), .heart-go__row > span:nth-child(4) { display: none; }
}
`;
