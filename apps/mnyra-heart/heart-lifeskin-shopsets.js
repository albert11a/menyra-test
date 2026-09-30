// DIE SETS DES LADENS (/lifeskinshop) IN HEART - Liste und Editor.
//
// Aufbau der Daten: shared/lifeskin-shop-sets.js. Gerendert wird als
// Zeichenkette wie ueberall in Heart; Aktionen laufen ueber data-action
// (heart-events.js -> heart.js). Die Einzelmittel des Ladens sind die
// Produkte mit ihren Bildern (Karte "Produkte"), die Vorher/Nachher-Faelle
// die mit Ort "Shop" (Karte "Ergebnisse").

import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";
import { klappAttr } from "./heart-lifeskin-klapp.js";
import { SETET_STANDARD, SET_PRODUKTE_MAX, setetNormalisieren, SHOP_HERO_VERHAELTNIS, setPreis } from "../../shared/lifeskin-shop-sets.js";
import { preisFuer } from "../../shared/lifeskin-preise.js";

// Die Liste, mit der Heart arbeitet: gespeichert, sonst die drei Sets, die
// heute auf der Seite stehen.
export function shopSetetListe(zustand) {
  return Array.isArray(zustand?.shopSetet) ? setetNormalisieren(zustand.shopSetet) : setetNormalisieren(SETET_STANDARD);
}

function bildVon(s, zustand) {
  return (zustand?.shopSetBilder || {})[s.id] || s.foto || "";
}

function produktName(produkte, id) {
  return (produkte || []).find((p) => String(p.id) === id)?.name || id;
}

export function renderShopSetet(zustand, produkte) {
  const liste = shopSetetListe(zustand);
  const status = zustand?.shopSetetStatus || "";
  const gespeichert = Array.isArray(zustand?.shopSetet);
  const zeilen = liste.map((s, i) => {
    const bild = bildVon(s, zustand);
    return `
      <div class="heart-rasti-zeile${s.aktiv ? "" : " heart-rasti-zeile--aus"}">
        <div class="heart-rasti-bilder">${bild
          ? `<span class="heart-rasti-bild"><img src="${escapeHtml(bild)}" alt="" loading="lazy" /></span>`
          : `<span class="heart-rasti-bild heart-rasti-bild--leer"><i>Foto</i></span>`}</div>
        <div class="heart-rasti-leib">
          <b>${escapeHtml(s.titulli)}</b>
          <small>${escapeHtml([s.nevoja, s.produkte.map((id) => produktName(produkte, id)).join(" + "), `${setPreis(s)} €`].filter(Boolean).join(" · "))}</small>
          ${s.aktiv ? "" : `<small class="heart-rasti-aus">Ausgeblendet – steht nicht im Shop</small>`}
        </div>
        <div class="heart-rasti-orte">
          <button type="button" class="heart-rasti-ort${s.aktiv ? " heart-rasti-ort--an" : ""}" data-action="lifeskin-shopset-aktiv"
                  data-id="${escapeHtml(s.id)}" aria-pressed="${s.aktiv ? "true" : "false"}" ${status ? "disabled" : ""}>${s.aktiv ? "✓ " : ""}Im Shop</button>
        </div>
        <div class="heart-rasti-aktionen">
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-shopset-schieben" data-id="${escapeHtml(s.id)}" data-richtung="hoch"
                  aria-label="Nach oben" ${i === 0 || status ? "disabled" : ""}>↑</button>
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-shopset-schieben" data-id="${escapeHtml(s.id)}" data-richtung="runter"
                  aria-label="Nach unten" ${i === liste.length - 1 || status ? "disabled" : ""}>↓</button>
          <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-shopset" data-id="${escapeHtml(s.id)}">Bearbeiten</button>
        </div>
      </div>`;
  }).join("");
  const aktiv = liste.filter((s) => s.aktiv).length;
  return `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("shopsetet")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Shop-Sets</h3>
        <span class="heart-klapp__zahl">${aktiv} im Shop</span>
      </summary>
      <p class="heart-lifeskin-block__fuss">
        Die Sets auf <b>mnyra.com/lifeskinshop</b> – in dieser Reihenfolge; das erste steht oben und in der Leiste.
        Preis: eigener Preis im Set (Bearbeiten), sonst die Staffel (1 Produkt ${preisFuer(1)} €, 2 = ${preisFuer(2)} €, 3 = ${preisFuer(3)} €).
        Einzelprodukte = Karte <b>Produkte</b> (mit ihren Bildern), Vorher/Nachher = <b>Ergebnisse</b> mit Ort <b>Shop</b>.
      </p>
      ${gespeichert ? "" : `<p class="heart-rasti-hinweis">Das sind die Sets, die jetzt im Shop stehen. Mit der ersten Änderung werden sie hier gespeichert.</p>`}
      ${status ? `<p class="heart-rasti-hinweis">Wird gespeichert …</p>` : ""}
      <div class="heart-rasti-liste">${zeilen || `<p class="heart-lifeskin-leer">Noch kein Set.</p>`}</div>
      <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-shopset-neu">
        ${renderHeartIcon("plus")}<span>Neues Set</span>
      </button>
    </details>`;
}

export function renderShopSetEditor(zustand, produkte) {
  const offen = zustand.shopSetOffen;
  const neu = offen === "__neu";
  const gespeichert = neu ? null : shopSetetListe(zustand).find((s) => s.id === offen);
  if (!neu && !gespeichert) {
    return `<section class="heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-shopset-zu">← Alle Sets</button>
      <p class="heart-lifeskin-leer">Dieses Set gibt es nicht mehr.</p></section>`;
  }
  const e = zustand.shopSetEntwurf || {};
  const s = { aktiv: true, produkte: [], ...(gespeichert || {}), ...e };
  const bild = e.foto ?? (gespeichert ? bildVon(gespeichert, zustand) : "");
  const status = zustand.shopSetStatus || "";
  const feld = (name, wort, platz, max, wert, lang = false) => `
      <label class="heart-lifeskin-feld">
        <span>${wort}</span>
        ${lang
          ? `<textarea class="heart-lifeskin-eingabe" data-shopsetfeld="${name}" maxlength="${max}" rows="3" placeholder="${escapeHtml(platz)}">${escapeHtml(wert || "")}</textarea>`
          : `<input class="heart-lifeskin-eingabe" data-shopsetfeld="${name}" maxlength="${max}" placeholder="${escapeHtml(platz)}" value="${escapeHtml(wert || "")}" />`}
      </label>`;
  const gewaehlt = new Set(s.produkte || []);
  const produktHaken = (produkte || []).map((p) => `
        <label class="heart-rasti-haken"><input type="checkbox" data-shopset-produkt value="${escapeHtml(p.id)}"${gewaehlt.has(String(p.id)) ? " checked" : ""} /> ${escapeHtml(p.name || p.id)}</label>`).join("");
  return `
    <section class="heart-lifeskin-editor heart-rasti-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-shopset-zu">← Alle Sets</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? "Neues Set" : "Set bearbeiten"}</h3>

      <div class="heart-rasti-fotos">
        <div class="heart-rasti-fotofeld">
          ${bild ? `<img src="${escapeHtml(bild)}" alt="Set" />` : `<div class="heart-rasti-fotoleer">${zustand.shopSetBildStatus === "laeuft" ? "lädt …" : "noch kein Foto"}</div>`}
          <span class="heart-rasti-fotowort">Foto des Sets</span>
          <button type="button" class="heart-lifeskin-fotoknopf" data-action="lifeskin-shopset-foto" ${status ? "disabled" : ""}>${bild ? "Foto tauschen" : "Foto wählen"}</button>
        </div>
      </div>
      ${e.bildNeu ? `<small class="heart-lifeskin-fotoneu">Neues Foto – gilt nach „Speichern“.</small>` : ""}

      ${feld("titulli", "Name des Sets", "Seti kundër akneve", 60, s.titulli)}
      ${feld("nevoja", "Bedarf (Filter oben)", "Akne", 30, s.nevoja)}
      ${feld("etiketa", "Schild auf dem Foto", "AKNE + HIDRATIM", 40, s.etiketa)}
      ${feld("teksti", "Kurztext auf der Karte", "Kujdes i përqendruar për aknet …", 200, s.teksti, true)}
      ${feld("detaje", "Text in den Details (+)", "LF ACNE për … LF MOISTUR për …", 400, s.detaje, true)}

      <div class="heart-lifeskin-feld">
        <span>Produkte im Set (höchstens ${SET_PRODUKTE_MAX})</span>
        ${produktHaken || `<p class="heart-lifeskin-leer">Noch keine Produkte – Karte „Produkte“.</p>`}
      </div>

      <label class="heart-lifeskin-feld">
        <span>Preis des Sets in € – leer = Staffel (${preisFuer((s.produkte || []).length || 2)} €)</span>
        <input class="heart-lifeskin-eingabe" data-shopsetfeld="cmimi" type="number" inputmode="numeric" min="1" max="999" step="1"
               placeholder="${preisFuer((s.produkte || []).length || 2)}" value="${s.cmimi ? escapeHtml(String(s.cmimi)) : ""}" />
      </label>

      <div class="heart-lifeskin-feld">
        <span>Zeigen</span>
        <label class="heart-rasti-haken"><input type="checkbox" data-shopsetfeld-an="aktiv"${s.aktiv ? " checked" : ""} /> Im Shop zeigen</label>
      </div>

      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern"
                data-action="lifeskin-shopset-speichern" ${status ? "disabled" : ""}>
          ${status === "laeuft" ? "Wird gespeichert …" : "Speichern"}
        </button>
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-shopset-zu">Abbrechen</button>
        ${neu ? "" : `<button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf"
                data-action="lifeskin-shopset-loeschen" ${status ? "disabled" : ""}>
          ${zustand.shopSetLoeschen ? "Wirklich löschen? Nochmal tippen" : "Löschen"}</button>`}
      </div>
    </section>`;
}

// ── Das Titelbild des Ladens ─────────────────────────────────────────
const HERO_STANDARD = "/apps/lifeskin-shop/assets/lf-acne-2.jpg";

export function renderShopHero(zustand) {
  const eigen = String(zustand?.shopHero || "");
  const status = zustand?.shopHeroStatus || "";
  return `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("shophero")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Shop-Titelbild</h3>
        <span class="heart-klapp__zahl">${eigen ? "eigenes Bild" : "Standard"}</span>
      </summary>
      <p class="heart-lifeskin-block__fuss">Das große Bild oben im Shop („The Acne Duo“). Bild wählen, dann verschieben und zoomen –
        genau dieser Ausschnitt steht im Shop.</p>
      <div style="aspect-ratio:${SHOP_HERO_VERHAELTNIS};border-radius:6px;overflow:hidden;background:#eee;max-width:420px">
        <img src="${escapeHtml(eigen || HERO_STANDARD)}" alt="Shop-Titelbild" style="width:100%;height:100%;object-fit:cover;display:block" />
      </div>
      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-shophero-waehlen" ${status ? "disabled" : ""}>Bild wählen und zuschneiden</button>
        ${eigen ? `<button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-shophero-weg" ${status ? "disabled" : ""}>Standardbild</button>` : ""}
      </div>
    </details>`;
}

export function renderShopHeroEditor(zustand) {
  const status = zustand?.shopHeroStatus || "";
  return `
    <section class="heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-shophero-zu">← Zurück</button>
      <h3 class="heart-lifeskin-block__titel">Shop-Titelbild zuschneiden</h3>
      <p class="heart-lifeskin-block__fuss">Mit dem Finger verschieben, mit dem Regler zoomen. Was im Rahmen steht, steht so im Shop.</p>
      <div data-schnitt-rahmen style="position:relative;aspect-ratio:${SHOP_HERO_VERHAELTNIS};max-width:520px;overflow:hidden;border-radius:6px;background:#111;touch-action:none;cursor:grab">
        <img data-schnitt-bild src="${escapeHtml(zustand.shopHeroRoh || "")}" alt="" draggable="false"
             style="position:absolute;left:0;top:0;max-width:none;transform-origin:0 0;user-select:none;-webkit-user-drag:none" />
      </div>
      <label class="heart-lifeskin-feld" style="max-width:520px">
        <span>Zoom</span>
        <input type="range" data-schnitt-zoom min="1" max="4" step="0.01" value="1" />
      </label>
      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern" data-action="lifeskin-shophero-speichern" ${status ? "disabled" : ""}>
          ${status === "laeuft" ? "Wird gespeichert …" : "Speichern"}</button>
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-shophero-zu">Abbrechen</button>
      </div>
    </section>`;
}
