// DERGESAT IN HEART - was gezeichnet und gerechnet wird, ohne Firestore
// (Auftrag 05.10.). Pruefbar ohne Browser: tests/lifeskin-dergesat.test.mjs.
//
//   produkteTePorosise(...)   was auf /dergesat als Produkte steht
//   renderDergesaChip(...)    der kleine Chip unter einer Bestellung
//   renderPostaBeki(...)      das Feld "Posta Beki" in der Akte
//   abgleichSchritte(...)     was Heart nachziehen muss, wenn auf
//                             /dergesat etwas getippt wurde

import { escapeHtml } from "./heart-ui-utils.js";
import { STATUS_CHIPS, statusiNeHeart } from "../../shared/lifeskin-dergesat.js";

// Die Produkte einer Bestellung, als Namen.
//   Laden (/lifeskinshop): die Zeilen der Bestellung.
//   Therapieseite / WhatsApp: die Produkte aus dem Befund.
export function produkteTePorosise(sitzung, bericht, produkte = []) {
  const nameVon = new Map((produkte || []).map((p) => [String(p?.id), String(p?.name || p?.id || "")]));
  const items = Array.isArray(sitzung?.order?.items) ? sitzung.order.items : [];
  if (items.length) {
    return items.map((z) => {
      const name = String(z?.name || nameVon.get(String(z?.id)) || z?.id || "").trim();
      const sasia = Number(z?.sasia) || 1;
      return name ? (sasia > 1 ? `${sasia}× ${name}` : name) : "";
    }).filter(Boolean).slice(0, 20);
  }
  const ausBefund = (bericht?.produkte || [])
    .map((p) => (typeof p === "string" ? p : p?.id))
    .filter(Boolean)
    .map((id) => nameVon.get(String(id)) || String(id));
  if (ausBefund.length) return ausBefund.slice(0, 20);
  const set = String(sitzung?.order?.set?.titulli || "").trim();
  return set ? [set] : [];
}

export function statusVonSitzung(sitzung, zustand = {}) {
  return statusiNeHeart({
    order: sitzung?.order || null,
    bericht: (zustand.berichte || {})[sitzung?.id] || null,
    dergesa: (zustand.dergesat || {})[sitzung?.id] || null
  });
}

export function renderDergesaChip(statusi, dergesa = null) {
  const chip = STATUS_CHIPS.find((c) => c.id === statusi) || STATUS_CHIPS[0];
  const nummer = dergesa?.postaBeki ? ` · Beki ${dergesa.postaBeki}` : "";
  return `<span class="heart-dergesa-chip heart-dergesa-chip--${escapeHtml(chip.id)}">${escapeHtml(chip.njejes)}${escapeHtml(nummer)}</span>`;
}

// Das Feld in der Akte (Karte "Bestellung"). Das Eingabefeld ueberlebt ein
// Neuzeichnen (data-bewahren) - der Schluessel traegt die gespeicherte
// Nummer, damit nach dem Speichern der neue Stand dasteht.
export function renderPostaBeki(sitzung, zustand = {}) {
  if (!sitzung?.order?.orderId) return "";
  const dergesa = (zustand.dergesat || {})[sitzung.id] || null;
  const statusi = statusVonSitzung(sitzung, zustand);
  const laeuft = zustand.dergesatLaeuft === `posta-beki:${sitzung.id}`;
  const gespeichert = dergesa?.postaBeki || "";
  const gesperrt = statusi === "anuluar";
  const fuss = gesperrt ? "Storniert – nicht mehr auf /dergesat."
    : dergesa ? `Steht auf /dergesat im Chip „${(STATUS_CHIPS.find((c) => c.id === dergesa.statusi) || STATUS_CHIPS[0]).label}“.`
      : "Nach dem Speichern steht die Bestellung auf /dergesat unter „Porosiat“.";
  return `
        <div class="heart-dergesa" data-dergesa-form>
          <div class="heart-dergesa__kopf"><span>Posta Beki</span>${renderDergesaChip(statusi, dergesa)}</div>
          <div class="heart-dergesa__reihe">
            <span class="heart-dergesa__feld" data-bewahren="${escapeHtml(`dg-pb:${sitzung.id}:${gespeichert}`)}">
              <input class="heart-lifeskin-eingabe" name="posta-beki" value="${escapeHtml(gespeichert)}" maxlength="60"
                     autocomplete="off" inputmode="text" placeholder="Nummer der Posta Beki" aria-label="Posta Beki"${gesperrt ? " disabled" : ""} />
            </span>
            <button type="button" class="heart-fall-knopf heart-fall-knopf--haupt heart-dergesa__knopf" data-action="dergesa" data-was="posta-beki"
                    data-id="${escapeHtml(sitzung.id)}"${laeuft || gesperrt ? " disabled" : ""}>${laeuft ? "…" : "Speichern"}</button>
          </div>
          <p class="heart-dergesa__fuss">${escapeHtml(fuss)}</p>
        </div>`;
}

// Was auf der Therapieseite des Kunden und in der Begleitung stehen soll.
const BERICHT_ZIEL = Object.freeze({ porosi: "bestellt", derguar: "versandt", pranuar: "zugestellt" });
export const NDJEKJA_ZIEL = Object.freeze({ porosi: "konfirmuar", derguar: "derguar", pranuar: "dorezuar" });
const BESTELLT_STAENDE = Object.freeze(["bestellt", "versandt", "zugestellt"]);

// Liefertag wie bei "Als versendet melden": zwei bis drei Tage ab Versand.
export function liefertag(iso, plus) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  d.setDate(d.getDate() + plus);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.`;
}

// WAS HEART NACHZIEHEN MUSS. /dergesat schreibt nur in die eigene
// Sammlung (Riba darf weder Befund noch Sitzung lesen). Heart sieht die
// Aenderung live und zieht nach:
//   Dërguar  -> Therapieseite "versendet", Begleitung "derguar"
//   Pranuar  -> Therapieseite "zugestellt", Begleitung "dorezuar"
//   Porosi   -> (zurueckgenommen) wieder "bestellt"
//   Anuluar  -> Bestellung storniert - zaehlt in keinem Umsatz mehr
// Nur, was abweicht - ein zweiter Lauf findet nichts mehr.
export function abgleichSchritte({ dergesat = {}, sitzungen = [], berichte = {} } = {}) {
  const nachId = new Map((sitzungen || []).map((s) => [s.id, s]));
  const schritte = [];
  for (const d of Object.values(dergesat || {})) {
    const sitzung = nachId.get(d.kennung);
    if (!sitzung?.order?.orderId) continue;
    if (d.statusi === "anuluar") {
      if (sitzung.order.status !== "storniert") schritte.push({ kennung: d.kennung, art: "storno" });
      continue;
    }
    if (sitzung.order.status === "storniert") continue;
    const bericht = berichte?.[d.kennung];
    const ist = String(bericht?.status || "");
    const ziel = BERICHT_ZIEL[d.statusi];
    if (!bericht || !BESTELLT_STAENDE.includes(ist) || !ziel || ist === ziel) continue;
    const felder = { status: ziel };
    const versandt = d.derguarAt || d.pranuarAt || d.updatedAt;
    if (ziel === "versandt" || ziel === "zugestellt") {
      if (!bericht.versandtAt && versandt) felder.versandtAt = versandt;
      if (ziel === "versandt" && versandt) {
        felder.lieferVon = liefertag(versandt, 2);
        felder.lieferBis = liefertag(versandt, 3);
      }
    }
    if (ziel === "zugestellt") felder.zugestelltAt = d.pranuarAt || d.updatedAt;
    schritte.push({ kennung: d.kennung, art: "bericht", felder, ndjekja: NDJEKJA_ZIEL[d.statusi] });
  }
  return schritte;
}
