import { wegDerSitzung } from "../../shared/lifeskin-weg.js";
import { statistikTag } from "../../shared/lifeskin-statistik.js";
import { DERGESA, tarifaPosta } from "../../shared/lifeskin-dergesat.js";
import { istTest } from "./heart-lifeskin-berechnung.js";
import { produktRechnung, kostenNormalisieren } from "./heart-lifeskin-kosten.js";
import { alsKlapp } from "./heart-lifeskin-klapp.js";
import { escapeHtml } from "./heart-ui-utils.js";

export const GEWINN_ZEITRAEUME = Object.freeze([
  ["heute", "Heute"], ["gestern", "Gestern"], ["vorgestern", "Vorgestern"],
  ["woche", "Letzte 7 Tage"], ["monat", "Dieser Monat"], ["max", "Max · alle"], ["vonbis", "Eigene Auswahl"]
]);
export const ADS_PREFIX = "lifeskin__ads__";
export const cent = (n) => Math.round((n + Number.EPSILON) * 100);
const euro = (n) => `${(n / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const zahl = (n) => n == null ? "—" : n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
export function datumGueltig(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export function adsCent(wert) {
  const t = String(wert ?? "").trim().replace(",", ".");
  return /^\d{1,7}(\.\d{1,2})?$/.test(t) ? cent(Number(t)) : null;
}
export function gewinnGrenzen(filter = {}, jetzt = new Date().toISOString()) {
  const heute = statistikTag(jetzt);
  if (filter.zeit === "max") return { von: "", bis: "9999-12-31" };
  if (filter.zeit === "vonbis") {
    if (!datumGueltig(filter.von) || !datumGueltig(filter.bis) || filter.von > filter.bis) return null;
    return { von: filter.von, bis: filter.bis };
  }
  if (filter.zeit === "monat") return { von: `${heute.slice(0, 7)}-01`, bis: heute };
  const d = new Date(`${heute}T12:00:00Z`);
  if (["gestern", "vorgestern"].includes(filter.zeit)) {
    d.setUTCDate(d.getUTCDate() - (filter.zeit === "gestern" ? 1 : 2));
    const tag = d.toISOString().slice(0, 10);
    return { von: tag, bis: tag };
  }
  if (filter.zeit === "woche") d.setUTCDate(d.getUTCDate() - 6);
  return { von: d.toISOString().slice(0, 10), bis: heute };
}
export function ersterSeenTag(s) {
  return Object.entries(s.timings?.ereignisse || {})
    .filter(([tag, e]) => datumGueltig(tag) && e?.berichtGeoeffnet)
    .map(([tag]) => tag).sort()[0] || "";
}

// Missing data is an unknown expense, never a zero expense.
export function bestellKosten(s, zustand) {
  const d = zustand.dergesat?.[s.id];
  const k = zustand.produktkosten ? kostenNormalisieren(zustand.produktkosten) : null;
  let items = s.order?.items;
  let ausBericht = false;
  if (!Array.isArray(items) || !items.length) {
    ausBericht = true;
    items = (zustand.berichte?.[s.id]?.produkte || []).map((p) => ({ id: typeof p === "string" ? p : p?.id, sasia: 1 }));
  }
  const fehlt = [];
  if (!k || !k.shisheStueck || !k.stikerStueck) fehlt.push("Produktkosten");
  if (!items.length) fehlt.push("Bestellprodukte");
  let produkt = 0;
  for (const item of items) {
    const r = produktRechnung(item.id, k);
    const menge = item.sasia == null ? 1 : Number(item.sasia);
    if (!item.id || r.ohneKrem || r.mehrere || !r.krem?.menge || !Number.isInteger(menge) || menge < 1) fehlt.push("Produktzuordnung/Menge");
    else produkt += cent(r.summe) * menge;
  }
  if (!d?.postaBeki) fehlt.push("Versandland (Beki-Nr.)");
  return {
    fehlt: [...new Set(fehlt)], ausBericht,
    produkt, transport: d?.postaBeki ? cent(tarifaPosta(d)) : 0,
    riba: cent(DERGESA.ribaPerPorosi), verpackung: cent(k?.verpackung || 0), sonstiges: cent(k?.sonstiges || 0),
    extra: cent(k?.verpackung || 0) + cent(k?.sonstiges || 0)
  };
}

export function baueGewinn(sitzungen = [], zustand = {}, wege = [""], jetzt) {
  const filter = zustand.gewinnFilter || { zeit: "heute" };
  const grenzen = gewinnGrenzen(filter, jetzt);
  if (!grenzen) return { fehler: "Bitte einen gültigen Zeitraum von/bis wählen." };
  const drin = (tag) => !!tag && tag >= grenzen.von && tag <= grenzen.bis;
  const tage = new Map();
  const zeile = (tag) => {
    if (!tage.has(tag)) tage.set(tag, { tag, seen: 0, bestellungen: 0, umsatz: 0, ads: 0, produkt: 0, transport: 0, riba: 0, extra: 0, verpackung: 0, sonstiges: 0, fehlt: 0, adsFehlt: false, zugestellt: 0 });
    return tage.get(tag);
  };
  const aktiv = new Set();
  const ads = new Map((zustand.gewinnAds || []).filter((a) => wege.includes(a.weg) && datumGueltig(a.tag) && Number.isSafeInteger(a.cent) && a.cent >= 0).map((a) => [`${a.weg}|${a.tag}`, a]));
  for (const a of ads.values()) if (drin(a.tag)) zeile(a.tag).ads += a.cent;
  let ohneSeenDatum = 0, ohneBestellDatum = 0, alteProdukte = 0;
  const ids = new Set(), bestellIds = new Set();
  for (const s of sitzungen) {
    if (ids.has(s.id) || istTest(s, zustand.berichte?.[s.id])) continue;
    ids.add(s.id);
    const weg = wegDerSitzung(s);
    if (!wege.includes(weg)) continue;
    const seenTag = ersterSeenTag(s);
    if (seenTag && drin(seenTag)) { zeile(seenTag).seen++; aktiv.add(`${weg}|${seenTag}`); }
    else if (!seenTag && s.berichtGeoeffnet) ohneSeenDatum++;
    if (!s.order?.orderId || s.storniert || s.order.status === "storniert" || zustand.dergesat?.[s.id]?.statusi === "anuluar") continue;
    if (bestellIds.has(s.order.orderId)) continue;
    bestellIds.add(s.order.orderId);
    const tag = statistikTag(s.order.createdAt || s.bestelltAt);
    if (!tag) { ohneBestellDatum++; continue; }
    if (!drin(tag)) continue;
    aktiv.add(`${weg}|${tag}`);
    const z = zeile(tag), kosten = bestellKosten(s, zustand);
    const total = Number(s.order.total);
    z.bestellungen++;
    if (s.order.total == null || s.order.total === "" || !Number.isFinite(total) || total < 0) kosten.fehlt.push("Bestellwert");
    else z.umsatz += cent(total);
    if (kosten.ausBericht) alteProdukte++;
    if (kosten.fehlt.length) z.fehlt++;
    for (const f of ["produkt", "transport", "riba", "extra", "verpackung", "sonstiges"]) z[f] += kosten[f];
    if (zustand.dergesat?.[s.id]?.statusi === "pranuar") z.zugestellt++;
  }
  for (const key of aktiv) if (!ads.has(key)) zeile(key.split("|")[1]).adsFehlt = true;
  const reihen = [...tage.values()].sort((a, b) => b.tag.localeCompare(a.tag));
  const summe = { seen: 0, bestellungen: 0, umsatz: 0, ads: 0, produkt: 0, transport: 0, riba: 0, extra: 0, verpackung: 0, sonstiges: 0, fehlt: 0, zugestellt: 0 };
  for (const z of reihen) for (const f of Object.keys(summe)) summe[f] += z[f];
  if (filter.zeit === "max") summe.seen += ohneSeenDatum;
  for (const z of [...reihen, summe]) z.gewinn = z.fehlt ? null : z.umsatz - z.ads - z.produkt - z.transport - z.riba - z.extra;
  const adsOffeneTage = reihen.filter((z) => z.adsFehlt).length;
  const vorlaeufig = zustand.gewinnStatus !== "bereit" || !!zustand.gewinnSpeichert || reihen.some((z) => z.adsFehlt);
  return { summe, reihen, grenzen, ohneSeenDatum, ohneBestellDatum, alteProdukte, vorlaeufig, adsOffeneTage,
    jeSeen: summe.seen && !vorlaeufig ? summe.ads / summe.seen : null,
    jeBestellung: summe.bestellungen && !vorlaeufig ? summe.ads / summe.bestellungen : null,
    analysenJeBestellung: summe.bestellungen ? summe.seen / summe.bestellungen : null };
}

export function renderGewinn(sitzungen, zustand, wege) {
  const r = baueGewinn(sitzungen, zustand, wege);
  const scope = wege.join("|");
  const plus = `<button type="button" class="heart-bestellung-plus" data-gewinn-wege="${escapeHtml(JSON.stringify(wege))}" data-action="lifeskin-gewinn-plus" aria-label="Ads-Tagesbetrag eintragen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>`;
  const filter = zustand.gewinnFilter || { zeit: "heute" };
  const kopf = `<h3 class="heart-lifeskin-block__titel">Ads · Umsatz · Gewinn</h3>`;
  const auswahl = `<div class="heart-gewinn__filter" data-morph-key="gewinn-filter:${escapeHtml(scope)}"><label>Zeitraum<select class="heart-lifeskin-eingabe" data-gewinn-filter="zeit" data-morph-key="gewinn-zeit:${escapeHtml(scope)}:${escapeHtml(filter.zeit || "heute")}">${GEWINN_ZEITRAEUME.map(([v, l]) => `<option value="${v}"${(filter.zeit || "heute") === v ? " selected" : ""}>${l}</option>`).join("")}</select></label>
    <button type="button" class="heart-lifeskin-knopf heart-gewinn__waehlen" data-action="lifeskin-gewinn-waehlen">Wählen</button>
    ${filter.zeit === "vonbis" ? `<small class="heart-gewinn__datumslabel">${escapeHtml(filter.von?.split("-").reverse().join("."))}${filter.von !== filter.bis ? ` – ${escapeHtml(filter.bis?.split("-").reverse().join("."))}` : ""}</small>` : ""}</div>`;
  const kachel = (titel, wert, zusatz = "") => `<div class="heart-gewinn__wert"><small>${titel}</small><strong>${wert}</strong>${zusatz ? `<span>${zusatz}</span>` : ""}</div>`;
  let inhalt = r.fehler ? `<p>${r.fehler}</p>` : (() => {
    const s = r.summe;
    const adsBereit = zustand.gewinnStatus === "bereit";
    return `${zustand.gewinnStatus !== "bereit" ? `<p class="heart-gewinn__status" role="status">${zustand.gewinnStatus === "fehler" ? 'Ads konnten nicht geladen werden. <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-gewinn-laden">Erneut laden</button>' : "Ads werden geladen …"}</p>` : ""}
      ${adsBereit && r.adsOffeneTage ? `<p class="heart-gewinn__status">Ads für ${r.adsOffeneTage} ${r.adsOffeneTage === 1 ? "Tag noch offen" : "Tage noch offen"}.</p>` : ""}
      <div class="heart-gewinn__raster">
      ${kachel("Umsatz", euro(s.umsatz), `${s.bestellungen} Bestellungen · ${s.zugestellt} zugestellt`)}
      ${kachel("Gewinn nach Kosten", !adsBereit || s.gewinn == null ? "—" : euro(s.gewinn), r.vorlaeufig ? "vorläufig" : "Kalkulation")}
      ${kachel("Ads-Kosten", adsBereit ? euro(s.ads) : "—")}${kachel("Seen-Analysen", zahl(s.seen), "einmal pro Fall")}
      ${kachel("Analysen / Bestellung", zahl(r.analysenJeBestellung))}
      ${kachel("Ads / Seen-Analyse", r.jeSeen == null ? "—" : euro(r.jeSeen))}
      ${kachel("Ads / Bestellung", r.jeBestellung == null ? "—" : euro(r.jeBestellung))}
      ${kachel("Bestellwert Ø", s.bestellungen ? euro(s.umsatz / s.bestellungen) : "—")}</div>
      <p class="heart-gewinn__hinweis">Abzüge: Produkte ${euro(s.produkt)} · Transport ${euro(s.transport)} · Riba ${euro(s.riba)} · Verpackung ${euro(s.verpackung)} · Sonstiges ${euro(s.sonstiges)} · Ads ${euro(s.ads)}.</p>
      ${s.fehlt ? `<p class="heart-gewinn__status">${s.fehlt} Bestellung(en) mit fehlenden Produktkosten, Produktmengen, Bestellwert oder Beki-Nr. Kosten oben sind unvollständig; Gewinn bleibt offen.</p>` : ""}
      ${r.ohneSeenDatum ? `<p>${r.ohneSeenDatum} ältere Seen-Analysen ohne Öffnungsdatum: nur in Max enthalten.</p>` : ""}
      ${r.ohneBestellDatum ? `<p>${r.ohneBestellDatum} Bestellungen ohne Bestelldatum ausgeschlossen.</p>` : ""}
      <details><summary>Tagesübersicht</summary><div class="heart-gewinn__tabelle"><table><thead><tr><th>Tag</th><th>Seen</th><th>Best.</th><th>Umsatz</th><th>Ads</th><th>Gewinn</th></tr></thead><tbody>${r.reihen.map((z) => `<tr><td>${escapeHtml(z.tag)}</td><td>${z.seen}</td><td>${z.bestellungen}</td><td>${euro(z.umsatz)}</td><td>${euro(z.ads)}${z.adsFehlt ? " *" : ""}</td><td>${z.gewinn == null ? "—" : euro(z.gewinn)}${z.adsFehlt ? " *" : ""}</td></tr>`).join("") || '<tr><td colspan="6">Keine Daten im Zeitraum.</td></tr>'}</tbody></table></div></details>`;
  })();
  return alsKlapp(`<section class="heart-lifeskin-block heart-gewinn" data-morph-key="gewinn-karte:${escapeHtml(scope)}">${kopf}<div class="heart-gewinn__inhalt" data-morph-key="gewinn-inhalt:${escapeHtml(scope)}">${auswahl}${inhalt}</div></section>`, `gewinn:${scope}`, { standard: false, zahl: r.summe ? `${r.summe.bestellungen} Best. · ${r.summe.gewinn == null ? "Kosten offen" : euro(r.summe.gewinn)}${r.vorlaeufig ? " *" : ""}` : "", kopfExtra: plus });
}
