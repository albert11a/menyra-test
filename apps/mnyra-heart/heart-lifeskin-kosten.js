// PRODUKTKOSTEN (01.10., Inhaber) - was ein Produkt und ein Set wirklich
// kosten und was davon bleibt.
//
// DIE ZAHLEN STEHEN NIRGENDS IM CODE. Sie werden in Heart eingetragen und
// liegen in Firestore unter lifeskin/lifeskin/ndjekjaIntern/_produktkosten -
// einer Sammlung, die laut firestore.rules NUR das CEO-Konto lesen und
// schreiben darf (dieselbe wie die internen Notizen der Begleitung). Keine
// oeffentliche Seite, kein Trichter, kein Bericht liest sie; im Code steht
// nur, wie gerechnet wird.
//
// SO WIRD GERECHNET (Wunsch Inhaber):
//   ein Produkt = 1 Shishe + 1 Stiker + Mbushja (30 ml) Krem
//   Krem: beliebig viele, je mit Preis, Menge (ml oder l) und dem Produkt,
//   in das sie kommt. Preis je ml = Preis / Menge in ml.
//   ein Set = seine Produkte + Versand + Verpackung + Sonstiges je Bestellung
//   bleibt = Preis des Sets - Kosten des Sets
import { escapeHtml } from "./heart-ui-utils.js";
import { klappAttr } from "./heart-lifeskin-klapp.js";
import { setPreis } from "../../shared/lifeskin-shop-sets.js";

export const KOSTEN_DOK = "_produktkosten";
export const MBUSHJA_STANDARD = 30;
export const KREM_MAX = 30;
export const KOSTEN_JE_BESTELLUNG = Object.freeze([
  { id: "versand", label: "Versand je Paket" },
  { id: "verpackung", label: "Verpackung je Paket" },
  { id: "sonstiges", label: "Sonstiges je Bestellung" }
]);

function betrag(wert) {
  const zahl = Number(String(wert ?? "").replace(",", ".").trim());
  return Number.isFinite(zahl) && zahl >= 0 ? Math.round(zahl * 10000) / 10000 : 0;
}
const rund = (n) => Math.round(n * 100) / 100;

export function kremNormalisieren(roh, i = 0) {
  return {
    id: String(roh?.id || `k${i + 1}`).slice(0, 40),
    name: String(roh?.name || "").trim().slice(0, 80),
    preis: betrag(roh?.preis),
    menge: betrag(roh?.menge),
    einheit: roh?.einheit === "l" ? "l" : "ml",
    produkt: String(roh?.produkt || "").slice(0, 80)
  };
}

export function kostenNormalisieren(roh) {
  const mbushja = betrag(roh?.mbushja);
  const aus = {
    shishe: betrag(roh?.shishe),
    stiker: betrag(roh?.stiker),
    mbushja: mbushja > 0 ? mbushja : MBUSHJA_STANDARD,
    kreme: (Array.isArray(roh?.kreme) ? roh.kreme : []).slice(0, KREM_MAX).map(kremNormalisieren)
      .filter((k) => k.name || k.preis || k.menge),
    updatedAt: String(roh?.updatedAt || "")
  };
  for (const k of KOSTEN_JE_BESTELLUNG) aus[k.id] = betrag(roh?.[k.id]);
  return aus;
}

export function preisJeMl(krem) {
  const ml = krem.menge * (krem.einheit === "l" ? 1000 : 1);
  return ml > 0 ? krem.preis / ml : 0;
}

// Was EIN Produkt kostet: 1 Shishe + 1 Stiker + Mbushja ml der Krem, die
// ihm zugeordnet ist. Sind ihm mehrere zugeordnet, zaehlt die erste in der
// Liste - und die Karte sagt es.
export function produktRechnung(produktId, kosten) {
  const k = kostenNormalisieren(kosten);
  const kreme = k.kreme.filter((x) => x.produkt === produktId);
  const krem = kreme[0] || null;
  const kremKosten = krem ? preisJeMl(krem) * k.mbushja : 0;
  return {
    shishe: k.shishe, stiker: k.stiker, mbushja: k.mbushja, krem, kremKosten: rund(kremKosten),
    summe: rund(k.shishe + k.stiker + kremKosten), ohneKrem: !krem, mehrere: kreme.length > 1
  };
}

// Was eine Bestellung dieses Sets kostet und was bleibt.
export function setRechnung(set, kosten) {
  const k = kostenNormalisieren(kosten);
  const produkte = (set?.produkte || []).map((id) => ({ id, ...produktRechnung(id, k) }));
  const jeBestellung = KOSTEN_JE_BESTELLUNG.reduce((s, x) => s + k[x.id], 0);
  const summe = rund(produkte.reduce((s, p) => s + p.summe, 0) + jeBestellung);
  const preis = setPreis(set);
  const bleibt = rund(preis - summe);
  return { preis, kosten: summe, bleibt, marge: preis > 0 ? Math.round((bleibt / preis) * 100) : 0,
    fehlt: produkte.filter((p) => p.ohneKrem).map((p) => p.id) };
}

const euro = (n) => `${Number(n || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const feldWert = (n) => (n ? String(Number(n)).replace(".", ",") : "");

function feld(schluessel, label, wert, einheit = "€", platzhalter = "0,00") {
  return `
        <label class="heart-kosten__feld">
          <span>${escapeHtml(label)}</span>
          <span class="heart-kosten__eingabe"><input type="text" inputmode="decimal" autocomplete="off" placeholder="${escapeHtml(platzhalter)}"
                 data-kosten="${escapeHtml(schluessel)}" value="${escapeHtml(feldWert(wert))}"><em>${escapeHtml(einheit)}</em></span>
        </label>`;
}

// Eine Krem-Zeile. Auch die Vorlage fuer "+ Krem" (heart.js klont sie).
export function kremZeile(krem, produkte) {
  const k = kremNormalisieren(krem);
  const wahl = [`<option value="">– Produkt –</option>`]
    .concat(produkte.map((p) => `<option value="${escapeHtml(p.id)}"${p.id === k.produkt ? " selected" : ""}>${escapeHtml(p.name || p.id)}</option>`))
    .join("");
  return `
          <div class="heart-krem" data-krem="${escapeHtml(k.id)}">
            <input class="heart-krem__name" type="text" autocomplete="off" placeholder="Emri i kremit" data-krem-feld="name" value="${escapeHtml(k.name)}">
            <span class="heart-kosten__eingabe"><b class="heart-krem__etikett">Preis</b><input type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" data-krem-feld="preis" value="${escapeHtml(feldWert(k.preis))}"><em>€</em></span>
            <span class="heart-kosten__eingabe"><b class="heart-krem__etikett">Menge</b><input type="text" inputmode="decimal" autocomplete="off" placeholder="0" data-krem-feld="menge" value="${escapeHtml(feldWert(k.menge))}">
              <select data-krem-feld="einheit"><option value="ml"${k.einheit === "ml" ? " selected" : ""}>ml</option><option value="l"${k.einheit === "l" ? " selected" : ""}>l</option></select></span>
            <span class="heart-kosten__eingabe heart-krem__fuer"><b class="heart-krem__etikett">für</b><select class="heart-krem__produkt" data-krem-feld="produkt">${wahl}</select></span>
            <button type="button" class="heart-krem__weg" data-action="lifeskin-krem-weg" aria-label="Krem entfernen">×</button>
          </div>`;
}

export function renderProduktkosten(zustand = {}, sets = []) {
  const kosten = zustand.produktkosten ? kostenNormalisieren(zustand.produktkosten) : null;
  const status = zustand.produktkostenStatus || "";
  const produkte = (zustand.produkte || []).filter((p) => p?.id && p.aktiv !== false);
  const kopf = (zahl) => `
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Produktkosten</h3>
        <span class="heart-klapp__zahl">${escapeHtml(zahl)}</span>
      </summary>`;

  if (!kosten) {
    const satz = status === "fehler" ? "Konnte nicht geladen werden – aufklappen versucht es neu." : "Wird geladen …";
    return `<details class="heart-lifeskin-block heart-klapp" ${klappAttr("produktkosten")}>${kopf("nur für dich")}
      <p class="heart-lifeskin-leer">${escapeHtml(satz)}</p></details>`;
  }

  const rechnungen = sets.filter((s) => s.aktiv !== false).map((s) => ({ s, r: setRechnung(s, kosten) }));
  const erstes = rechnungen[0]?.r;
  const zahl = erstes && !erstes.fehlt.length ? `bleibt ${euro(erstes.bleibt)} je Set` : "nur für dich";
  // Nur Produkte, die in einem Set stecken oder einer Krem zugeordnet sind -
  // fuer die anderen gibt es nichts zu rechnen.
  const relevant = produkte.filter((p) => kosten.kreme.some((k) => k.produkt === p.id) || sets.some((s) => (s.produkte || []).includes(p.id)));
  // data-bewahren: Was gerade getippt wird (auch neue Krem-Zeilen), bleibt
  // stehen, wenn Heart wegen Live-Zahlen neu zeichnet - neu aufgebaut wird
  // erst nach dem Speichern oder mit anderen Produkten.
  const stempel = `${kosten.updatedAt}|${produkte.map((p) => p.id).join(",")}`;
  return `
    <details class="heart-lifeskin-block heart-klapp heart-kosten" ${klappAttr("produktkosten")}>
      ${kopf(zahl)}
      <div class="heart-kosten__form" data-bewahren="produktkosten:${escapeHtml(stempel)}">
        <h4 class="heart-kosten__titel">Je Produkt</h4>
        ${feld("shishe", "Shishe (1 copë)", kosten.shishe)}
        ${feld("stiker", "Stiker (1 copë)", kosten.stiker)}
        ${feld("mbushja", "Mbushja e një produkti", kosten.mbushja, "ml", "30")}
        <h4 class="heart-kosten__titel">Kremet</h4>
        <div class="heart-kremet" data-kremet>
          ${kosten.kreme.map((k) => kremZeile(k, produkte)).join("")}
        </div>
        <template data-krem-vorlage>${kremZeile({ id: "neu" }, produkte)}</template>
        <button type="button" class="heart-lifeskin-knopf heart-krem__neu" data-action="lifeskin-krem-neu">+ Krem</button>
        <h4 class="heart-kosten__titel">Je Bestellung</h4>
        ${KOSTEN_JE_BESTELLUNG.map((k) => feld(k.id, k.label, kosten[k.id])).join("")}
        <button type="button" class="heart-lifeskin-knopf heart-kosten__speichern" data-action="lifeskin-kosten-speichern"
                ${status === "speichert" ? "disabled" : ""}>${status === "speichert" ? "Wird gespeichert …" : "Speichern"}</button>
      </div>
      ${relevant.length ? `<h4 class="heart-kosten__titel">Kosten je Produkt</h4>
      <div class="heart-kosten__sets">${relevant.map((p) => {
        const r = produktRechnung(p.id, kosten);
        return `
        <div class="heart-kosten__set">
          <b>${escapeHtml(p.name || p.id)}</b>
          <span>Shishe ${euro(r.shishe)} + Stiker ${euro(r.stiker)} + ${escapeHtml(String(r.mbushja).replace(".", ","))} ml ${r.krem ? escapeHtml(r.krem.name || "Krem") : "Krem"} ${euro(r.kremKosten)}</span>
          <strong>${euro(r.summe)} je Produkt</strong>
          ${r.ohneKrem ? `<small>Noch keine Krem zugeordnet.</small>` : ""}
          ${r.mehrere ? `<small>Mehrere Kremet zugeordnet – gerechnet wird mit der ersten.</small>` : ""}
        </div>`;
      }).join("")}
      </div>` : ""}
      ${rechnungen.length ? `<h4 class="heart-kosten__titel">Je Set</h4>
      <div class="heart-kosten__sets">${rechnungen.map(({ s, r }) => `
        <div class="heart-kosten__set">
          <b>${escapeHtml(s.titulli || s.id)}</b>
          <span>Preis ${euro(r.preis)} · Kosten ${euro(r.kosten)}</span>
          <strong class="${r.bleibt < 0 ? "heart-kosten__minus" : ""}">bleibt ${euro(r.bleibt)} · ${r.marge} %</strong>
          ${r.fehlt.length ? `<small>Ohne Krem: ${escapeHtml(r.fehlt.join(", "))}</small>` : ""}
        </div>`).join("")}
      </div>` : ""}
      <p class="heart-lifeskin-block__fuss">Nur für dich: Die Zahlen liegen in einem Bereich, den nur dein Konto lesen darf – nicht im Code und auf keiner Seite.</p>
    </details>`;
}
