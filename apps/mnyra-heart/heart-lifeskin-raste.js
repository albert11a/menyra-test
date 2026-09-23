// DIE VORHER/NACHHER-FAELLE IN HEART - Liste, Editor, Auswahl im Befund.
//
// Aufbau der Daten und Gruende: shared/lifeskin-raste.js. Hier steht nur,
// wie sie in Heart aussehen. Gerendert wird als Zeichenkette wie ueberall
// in Heart; Aktionen laufen ueber data-action (heart-events.js ->
// heart.js).
//
// ZWEI DINGE, DIE BEIM BEDIENEN ZAEHLEN:
//   - Der Editor steht allein da (wie der Produkteditor). Eine Live-Zahl,
//     die sich aendert, zeichnet ihn deshalb nicht neu.
//   - Produktzeilen und Befund-Plaetze kommen OHNE Zustandswechsel dazu
//     (DOM, aus einer Vorlage). Was gerade getippt wurde, bleibt stehen.

import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";
import {
  RASTE_STANDARD, RASTI_PRODUKTE_MAX, rasteNormalisieren, rasteFuer, rastiStandard, rastiProdukteText
} from "../../shared/lifeskin-raste.js";

// Aufklappen mit Gedaechtnis: heart-lifeskin-klapp.js.
import { klappAttr } from "./heart-lifeskin-klapp.js";
export { klappSetzen, klappOffen, klappAttr } from "./heart-lifeskin-klapp.js";

// Die Liste, mit der Heart arbeitet: gespeichert, sonst der Standard der
// Seiten - damit man sieht (und aendern kann), was dort wirklich steht.
export function rasteListe(zustand) {
  return Array.isArray(zustand?.raste) ? rasteNormalisieren(zustand.raste) : rasteNormalisieren(RASTE_STANDARD);
}

function euro(w) {
  const n = Number(w);
  return Number.isFinite(n) && n > 0 ? `${String(n).replace(".", ",")} €` : "";
}

function bilderVon(r, zustand) {
  const geladen = (zustand?.rasteBilder || {})[r.id] || {};
  return { para: geladen.para || r.para || "", pas: geladen.pas || r.pas || "" };
}

function vorschau(src, wort) {
  return src
    ? `<span class="heart-rasti-bild"><img src="${escapeHtml(src)}" alt="" loading="lazy" /><i>${wort}</i></span>`
    : `<span class="heart-rasti-bild heart-rasti-bild--leer"><i>${wort}</i></span>`;
}

// ── Die Karte unter "Mehr anzeigen" ───────────────────────────────────
export function renderRaste(zustand) {
  const liste = rasteListe(zustand);
  const gespeichert = Array.isArray(zustand?.raste);
  const status = zustand?.rasteStatus || "";
  const zeilen = liste.map((r, i) => {
    const b = bilderVon(r, zustand);
    const ort = (name, wort) => `
          <button type="button" class="heart-rasti-ort${r[name] ? " heart-rasti-ort--an" : ""}"
                  data-action="lifeskin-rasti-ort" data-id="${escapeHtml(r.id)}" data-ort="${name}"
                  aria-pressed="${r[name] ? "true" : "false"}" ${status ? "disabled" : ""}>
            ${r[name] ? "✓ " : ""}${wort}</button>`;
    const aus = !r.landing && !r.analiza;
    return `
      <div class="heart-rasti-zeile${aus ? " heart-rasti-zeile--aus" : ""}">
        <div class="heart-rasti-bilder">${vorschau(b.para, "Vorher")}${vorschau(b.pas, "Nachher")}</div>
        <div class="heart-rasti-leib">
          <b>${escapeHtml(r.emri || "Ohne Namen")}</b>
          <small>${escapeHtml([r.gjetja, r.produkte.length ? rastiProdukteText(r) : "", euro(r.cmimi)].filter(Boolean).join(" · "))}</small>
          ${aus ? `<small class="heart-rasti-aus">Ausgeschaltet – erscheint nirgends</small>` : ""}
        </div>
        <div class="heart-rasti-orte">${ort("landing", "Landing")}${ort("analiza", "Analyseseite")}</div>
        <div class="heart-rasti-aktionen">
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-rasti-schieben" data-id="${escapeHtml(r.id)}" data-richtung="hoch"
                  aria-label="Nach oben" ${i === 0 || status ? "disabled" : ""}>↑</button>
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-rasti-schieben" data-id="${escapeHtml(r.id)}" data-richtung="runter"
                  aria-label="Nach unten" ${i === liste.length - 1 || status ? "disabled" : ""}>↓</button>
          <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-rasti" data-id="${escapeHtml(r.id)}">Bearbeiten</button>
        </div>
      </div>`;
  }).join("");

  const landing = rasteFuer(liste, "landing").length;
  const analiza = rasteFuer(liste, "analiza").length;
  return `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("raste")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Ergebnisse (Vorher / Nachher)</h3>
        <span class="heart-klapp__zahl">${landing} Landing · ${analiza} Analyse</span>
      </summary>
      <p class="heart-lifeskin-block__fuss">
        Die Fälle unter „Rezultate“. Je Fall entscheidest du, wo er erscheint:
        <b>Landing</b>, <b>Analyseseite</b>, beides – oder nichts (ausgeschaltet).
        Welche Fälle eine einzelne Analyseseite zeigt, wählst du im Befund des Falls.
      </p>
      ${gespeichert ? "" : `<p class="heart-rasti-hinweis">Das sind die Fälle, die jetzt auf den Seiten stehen. Mit der ersten Änderung werden sie hier gespeichert.</p>`}
      ${status ? `<p class="heart-rasti-hinweis">Wird gespeichert …</p>` : ""}
      <div class="heart-rasti-liste">${zeilen || `<p class="heart-lifeskin-leer">Noch kein Ergebnis.</p>`}</div>
      <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-rasti-neu">
        ${renderHeartIcon("plus")}<span>Neues Ergebnis</span>
      </button>
    </details>`;
}

// ── Der Editor eines Falls ────────────────────────────────────────────
function produktOptionen(produkte, gewaehlt) {
  const liste = [...(produkte || [])];
  // Ein Produkt, das es nicht mehr gibt, bleibt waehlbar - sonst waere
  // es beim naechsten Speichern still weg.
  if (gewaehlt && !liste.some((p) => String(p.id) === gewaehlt)) liste.push({ id: gewaehlt, name: gewaehlt });
  return liste.map((p) => `<option value="${escapeHtml(p.id)}"${String(p.id) === gewaehlt ? " selected" : ""}>${escapeHtml(p.name || p.id)}</option>`).join("");
}

function produktZeile(produkte, id) {
  return `
          <div class="heart-rasti-pzeile" data-rasti-pzeile>
            <select class="heart-lifeskin-eingabe" data-rasti-produkt aria-label="Produkt">${produktOptionen(produkte, id)}</select>
            <button type="button" class="heart-rasti-mini" data-action="lifeskin-rasti-produkt-weg" aria-label="Produkt entfernen">×</button>
          </div>`;
}

export function renderRastiEditor(zustand, produkte) {
  const offen = zustand.rastOffen;
  const neu = offen === "__neu";
  const gespeichert = neu ? null : rasteListe(zustand).find((r) => r.id === offen);
  if (!neu && !gespeichert) {
    return `<section class="heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-rasti-zu">← Alle Ergebnisse</button>
      <p class="heart-lifeskin-leer">Dieses Ergebnis gibt es nicht mehr.</p></section>`;
  }
  const e = zustand.rastEntwurf || {};
  const r = { landing: true, analiza: true, produkte: [], ...(gespeichert || {}), ...e };
  const b = gespeichert ? bilderVon(gespeichert, zustand) : {};
  const para = e.para ?? b.para ?? "";
  const pas = e.pas ?? b.pas ?? "";
  const status = zustand.rastStatus || "";
  const bilderLaden = zustand.rastBilderStatus === "laeuft";
  const foto = (seite, src, wort) => `
        <div class="heart-rasti-fotofeld">
          ${src ? `<img src="${escapeHtml(src)}" alt="${wort}" />` : `<div class="heart-rasti-fotoleer">${bilderLaden ? "lädt …" : "noch kein Foto"}</div>`}
          <span class="heart-rasti-fotowort">${wort}</span>
          <button type="button" class="heart-lifeskin-fotoknopf" data-action="lifeskin-rasti-foto" data-seite="${seite}" ${status ? "disabled" : ""}>
            ${src ? "Foto tauschen" : "Foto wählen"}</button>
        </div>`;
  const produktIds = r.produkte.length ? r.produkte : (produkte?.[0] ? [String(produkte[0].id)] : []);

  return `
    <section class="heart-lifeskin-editor heart-rasti-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-rasti-zu">← Alle Ergebnisse</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? "Neues Ergebnis" : "Ergebnis bearbeiten"}</h3>

      <div class="heart-rasti-fotos">
        ${foto("para", para, "Vorher")}
        ${foto("pas", pas, "Nachher (Tag 28)")}
      </div>
      ${e.bilderNeu ? `<small class="heart-lifeskin-fotoneu">Neue Fotos – gelten nach „Speichern“.</small>` : ""}

      <label class="heart-lifeskin-feld">
        <span>Name / Überschrift</span>
        <input class="heart-lifeskin-eingabe" id="rasti-emri" data-rastifeld="emri" maxlength="80"
               placeholder="Pacienti 5 · 31 vjeç" value="${escapeHtml(r.emri || "")}" />
      </label>
      <label class="heart-lifeskin-feld">
        <span>Befund (kurz)</span>
        <input class="heart-lifeskin-eingabe" id="rasti-gjetja" data-rastifeld="gjetja" maxlength="90"
               placeholder="Akne inflamatore" value="${escapeHtml(r.gjetja || "")}" />
      </label>

      <div class="heart-lifeskin-feld">
        <span>Produkte</span>
        <div class="heart-rasti-produkte" data-rasti-produkte>
          ${produktIds.map((id) => produktZeile(produkte, id)).join("")}
        </div>
        <template data-rasti-produkt-vorlage>${produktZeile(produkte, "")}</template>
        <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-rasti-produkt-neu">
          ${renderHeartIcon("plus")}<span>Produkt hinzufügen</span>
        </button>
      </div>

      <label class="heart-lifeskin-feld heart-lifeskin-feld--kurz">
        <span>Preis in Euro</span>
        <input class="heart-lifeskin-eingabe" id="rasti-cmimi" data-rastifeld="cmimi" type="number" inputmode="decimal" min="0"
               placeholder="z. B. 39" value="${r.cmimi ? escapeHtml(String(r.cmimi)) : ""}" />
      </label>

      <div class="heart-lifeskin-feld">
        <span>Zeigen auf</span>
        <label class="heart-rasti-haken"><input type="checkbox" data-rastifeld-an="landing"${r.landing ? " checked" : ""} /> Landingpage</label>
        <label class="heart-rasti-haken"><input type="checkbox" data-rastifeld-an="analiza"${r.analiza ? " checked" : ""} /> Analyseseite (im Befund wählbar)</label>
      </div>

      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern"
                data-action="lifeskin-rasti-speichern" ${status ? "disabled" : ""}>
          ${status === "laeuft" ? "Wird gespeichert …" : "Speichern"}
        </button>
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-rasti-zu">Abbrechen</button>
        ${neu ? "" : `<button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf"
                data-action="lifeskin-rasti-loeschen" ${status ? "disabled" : ""}>
          ${zustand.rastLoeschen ? "Wirklich löschen? Nochmal tippen" : "Löschen"}</button>`}
      </div>
    </section>`;
}

// ── Die Auswahl im Befund eines Falls ─────────────────────────────────
//
// Platz 1 ist immer belegt - weniger als ein Ergebnis gibt es nicht. Ohne
// eigene Wahl steht dort der Fall, der am besten zu den Produkten passt
// (derselbe, den die Seite ohne Wahl zeigt). "+" gibt Platz 2, 3, ...
function rastiOption(r, gewaehlt) {
  const text = [r.emri, r.gjetja, r.produkte.length ? rastiProdukteText(r) : ""].filter(Boolean).join(" · ");
  return `<option value="${escapeHtml(r.id)}"${r.id === gewaehlt ? " selected" : ""}>${escapeHtml(text)}</option>`;
}

function befundPlatz(kandidaten, gewaehlt, nummer) {
  return `
          <div class="heart-rasti-platz" data-rasti-platz>
            <span class="heart-rasti-platz__nr" data-rasti-nr>${nummer}</span>
            <select class="heart-lifeskin-eingabe" data-befund-rasti aria-label="Ergebnis ${nummer}">
              ${kandidaten.map((r) => rastiOption(r, gewaehlt)).join("")}
            </select>
            <button type="button" class="heart-rasti-mini" data-action="lifeskin-rasti-platz-weg" aria-label="Entfernen"${nummer === 1 ? " hidden" : ""}>×</button>
          </div>`;
}

export function renderBefundRaste(liste, bericht) {
  const kandidaten = rasteFuer(liste, "analiza");
  if (!kandidaten.length) {
    return `
      <div class="heart-lifeskin-feld">
        <span>Ergebnisse auf der Seite (Vorher / Nachher)</span>
        <p class="heart-lifeskin-leer">Kein Ergebnis für die Analyseseite eingeschaltet – unter „Mehr anzeigen → Ergebnisse“.</p>
      </div>`;
  }
  const erlaubt = new Set(kandidaten.map((r) => r.id));
  let gewaehlt = (Array.isArray(bericht?.raste) ? bericht.raste : []).map(String).filter((id) => erlaubt.has(id));
  gewaehlt = [...new Set(gewaehlt)];
  if (!gewaehlt.length) {
    const standard = rastiStandard(liste, (bericht?.produkte || []).map((p) => String(p?.id || "")));
    gewaehlt = [standard?.id || kandidaten[0].id];
  }
  return `
      <div class="heart-lifeskin-feld" data-rasti-plaetze-feld>
        <span>Ergebnisse auf der Seite (Vorher / Nachher)</span>
        <div class="heart-rasti-plaetze" data-rasti-plaetze>
          ${gewaehlt.map((id, i) => befundPlatz(kandidaten, id, i + 1)).join("")}
        </div>
        <template data-rasti-platz-vorlage>${befundPlatz(kandidaten, "", 2)}</template>
        <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-rasti-platz-neu"
                ${gewaehlt.length >= kandidaten.length ? "hidden" : ""}>
          ${renderHeartIcon("plus")}<span>Weiteres Ergebnis</span>
        </button>
      </div>`;
}

// ── Zeilen dazu und weg - OHNE Zustandswechsel, direkt im DOM ─────────
//
// Was gerade getippt oder gewaehlt ist, bleibt so stehen. vorschlag(n)
// liefert den Preis fuer n Produkte (Heart kennt die Preistabelle), melde
// zeigt einen Hinweis.

// Der Preis folgt der Zahl der Produkte - solange dort keine eigene Zahl steht.
export function rastiPreisFolgen(vorschlag, wurzel = document) {
  const feld = wurzel.querySelector('[data-rastifeld="cmimi"]');
  if (!feld || typeof vorschlag !== "function") return;
  const anzahl = wurzel.querySelectorAll("[data-rasti-produkt]").length;
  const vorschlaege = [0, 1, 2, 3, 4, 5].map(vorschlag);
  if (feld.value && !vorschlaege.includes(Number(feld.value))) return;
  const neu = vorschlag(anzahl);
  feld.value = neu ? String(neu) : "";
}

export function rastiDom(aktion, knopf, { vorschlag, melde = () => {} } = {}, wurzel = document) {
  if (aktion === "produkt-neu") {
    const kasten = wurzel.querySelector("[data-rasti-produkte]");
    const vorlage = wurzel.querySelector("[data-rasti-produkt-vorlage]");
    if (!kasten || !vorlage) return;
    if (kasten.querySelectorAll("[data-rasti-produkt]").length >= RASTI_PRODUKTE_MAX) {
      melde(`Höchstens ${RASTI_PRODUKTE_MAX} Produkte.`);
      return;
    }
    const zeile = vorlage.content.firstElementChild.cloneNode(true);
    const wahl = zeile.querySelector("select");
    const belegt = new Set([...kasten.querySelectorAll("[data-rasti-produkt]")].map((w) => w.value));
    const frei = [...wahl.options].find((o) => !belegt.has(o.value));
    if (frei) wahl.value = frei.value;
    kasten.append(zeile);
    rastiPreisFolgen(vorschlag, wurzel);
    return;
  }
  if (aktion === "produkt-weg") {
    knopf?.closest("[data-rasti-pzeile]")?.remove();
    rastiPreisFolgen(vorschlag, wurzel);
    return;
  }

  const kasten = wurzel.querySelector("[data-rasti-plaetze]");
  if (!kasten) return;
  const plusKnopf = wurzel.querySelector('[data-action="lifeskin-rasti-platz-neu"]');
  const nummern = () => {
    const plaetze = [...kasten.querySelectorAll("[data-rasti-platz]")];
    plaetze.forEach((platz, i) => {
      platz.querySelector("[data-rasti-nr]").textContent = String(i + 1);
      platz.querySelector("select")?.setAttribute("aria-label", `Ergebnis ${i + 1}`);
      const weg = platz.querySelector('[data-action="lifeskin-rasti-platz-weg"]');
      if (weg) weg.hidden = i === 0;
    });
    const moeglich = kasten.querySelector("select")?.options.length || 0;
    if (plusKnopf) plusKnopf.hidden = plaetze.length >= moeglich;
  };
  if (aktion === "platz-neu") {
    const vorlage = wurzel.querySelector("[data-rasti-platz-vorlage]");
    if (!vorlage) return;
    const platz = vorlage.content.firstElementChild.cloneNode(true);
    const wahl = platz.querySelector("select");
    const belegt = new Set([...kasten.querySelectorAll("[data-befund-rasti]")].map((w) => w.value));
    const frei = [...wahl.options].find((o) => !belegt.has(o.value));
    if (!frei) return;
    wahl.value = frei.value;
    kasten.append(platz);
    nummern();
    return;
  }
  if (aktion === "platz-weg") {
    const platz = knopf?.closest("[data-rasti-platz]");
    if (platz && kasten.querySelectorAll("[data-rasti-platz]").length > 1) platz.remove();
    nummern();
  }
}
