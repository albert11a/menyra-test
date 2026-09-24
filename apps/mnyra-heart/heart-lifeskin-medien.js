// KUNDENFOTOS UND -VIDEOS IN HEART ("Nga klientët tanë").
//
//   - "Mehr anzeigen -> Fotos & Videos": hochladen, Produkt und Satz dazu,
//     ein- und ausschalten, Reihenfolge, loeschen.
//   - Der Editor steht allein da (wie der Ergebnis-Editor) - eine Live-Zahl,
//     die sich aendert, wischt nichts Getipptes weg.
//   - "Reaktionen" unter Nachfassen: Views und Kommentare je Medium, jeder
//     Kommentar verbergen, zeigen oder loeschen.
//   - Im Befund eines Falls: welche davon seine Seite zeigt.
// Daten: shared/lifeskin-medien.js. Laden und Schreiben:
// heart-lifeskin-adapter.js. Upload: heart-crm-admin-write-adapter.js.

import { escapeHtml } from "./heart-ui-utils.js";
import { renderHeartIcon } from "./heart-icons.js";
import { klappAttr } from "./heart-lifeskin-klapp.js";
import { medienListe, medienAuswahl } from "../../shared/lifeskin-medien.js";

const zahl = (n) => new Intl.NumberFormat("de-DE").format(Math.max(0, Number(n) || 0));

function zeitKurz(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const heute = new Date();
  const gleich = d.toDateString() === heute.toDateString();
  const uhr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return gleich ? `heute ${uhr}` : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}. ${uhr}`;
}

function kachelBild(m, klasse = "heart-medium__bild") {
  return m.bild
    ? `<img class="${klasse}" src="${escapeHtml(m.bild)}" alt="" loading="lazy" decoding="async" />`
    : `<span class="${klasse} heart-medium__bild--leer"></span>`;
}

// ── Die Karte unter "Mehr anzeigen" ───────────────────────────────────
export function renderMedien(zustand = {}) {
  const liste = medienListe(zustand.medien);
  const standard = liste.some((m) => m.standard);
  const status = zustand.medienStatus || "";
  const fotos = liste.filter((m) => m.art === "foto").length;
  const videos = liste.length - fotos;
  const kacheln = liste.map((m, i) => `
      <div class="heart-medium${m.aktiv ? "" : " heart-medium--aus"}">
        <button type="button" class="heart-medium__oeffnen" data-action="lifeskin-medium" data-id="${escapeHtml(m.id)}"
                aria-label="${escapeHtml(`${m.art === "video" ? "Video" : "Foto"} ${m.produkt} bearbeiten`)}">
          ${kachelBild(m)}
          ${m.art === "video" ? `<span class="heart-medium__art">${renderHeartIcon("play")}</span>` : ""}
          ${m.aktiv ? "" : `<span class="heart-medium__aus">Aus</span>`}
          <span class="heart-medium__views">${renderHeartIcon("eye")}${zahl(m.views)}</span>
        </button>
        <span class="heart-medium__name">${escapeHtml(m.produkt || "Ohne Produkt")}</span>
        <span class="heart-medium__reihe">
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-medium-schieben" data-id="${escapeHtml(m.id)}" data-richtung="hoch"
                  aria-label="Nach vorn" ${i === 0 || status ? "disabled" : ""}>‹</button>
          <button type="button" class="heart-rasti-mini" data-action="lifeskin-medium-schieben" data-id="${escapeHtml(m.id)}" data-richtung="runter"
                  aria-label="Nach hinten" ${i === liste.length - 1 || status ? "disabled" : ""}>›</button>
        </span>
      </div>`).join("");

  return `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("medien")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Fotos &amp; Videos</h3>
        <span class="heart-klapp__zahl">${fotos} ${fotos === 1 ? "Foto" : "Fotos"} · ${videos} ${videos === 1 ? "Video" : "Videos"}</span>
      </summary>
      <p class="heart-lifeskin-block__fuss">
        Kundinnen mit den Produkten – auf der Analyseseite unter dem Preis („Nga klientët tanë“).
        Welche eine einzelne Seite zeigt, wählst du im Befund des Falls.
      </p>
      ${standard ? `<p class="heart-rasti-hinweis">Das sind die vier Fotos, die jetzt auf den Seiten stehen. Mit der ersten Änderung werden sie hier gespeichert.</p>` : ""}
      ${status ? `<p class="heart-rasti-hinweis">Wird gespeichert …</p>` : ""}
      <div class="heart-medien">${kacheln}</div>
      <div class="heart-medien__neu">
        <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-medium-neu" data-art="foto" ${status ? "disabled" : ""}>
          ${renderHeartIcon("camera")}<span>Foto hochladen</span>
        </button>
        <button type="button" class="heart-lifeskin-neu" data-action="lifeskin-medium-neu" data-art="video" ${status ? "disabled" : ""}>
          ${renderHeartIcon("play")}<span>Video hochladen</span>
        </button>
      </div>
    </details>`;
}

// ── Der Editor eines Mediums ──────────────────────────────────────────
export function renderMediumEditor(zustand = {}, produkte = []) {
  const offen = zustand.medienOffen;
  const neu = offen === "__neu";
  const gespeichert = neu ? null : medienListe(zustand.medien).find((m) => m.id === offen);
  if (!neu && !gespeichert) {
    return `<section class="heart-lifeskin-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-medium-zu">← Alle Fotos &amp; Videos</button>
      <p class="heart-lifeskin-leer">Dieses Foto oder Video gibt es nicht mehr.</p></section>`;
  }
  const e = zustand.medienEntwurf || {};
  const m = { aktiv: true, art: "foto", produkt: "", text: "", ...(gespeichert || {}), ...e };
  const status = zustand.medienStatus || "";
  const vorschau = e.vorschau || m.bild || "";
  const istVideo = (e.art || m.art) === "video";
  const quelle = istVideo ? (e.vorschau || m.video) : "";
  const namen = [...new Set((produkte || []).map((p) => String(p.name || "").trim()).filter(Boolean))];
  const groesse = Number(e.groesse) > 0 ? `${(Number(e.groesse) / 1048576).toFixed(1).replace(".", ",")} MB` : "";
  const knopfText = status === "hochladen" ? "Wird hochgeladen …" : status === "speichern" ? "Wird gespeichert …" : "Speichern";

  return `
    <section class="heart-lifeskin-editor heart-medium-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-medium-zu">← Alle Fotos &amp; Videos</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? (istVideo ? "Neues Video" : "Neues Foto") : (istVideo ? "Video bearbeiten" : "Foto bearbeiten")}</h3>

      <div class="heart-medium-editor__buehne">
        ${vorschau || quelle
          ? (istVideo && quelle
            ? `<video src="${escapeHtml(quelle)}" ${m.bild && !e.vorschau ? `poster="${escapeHtml(m.bild)}"` : ""} controls playsinline muted preload="metadata"></video>`
            : `<img src="${escapeHtml(vorschau)}" alt="" />`)
          : `<div class="heart-rasti-fotoleer">${istVideo ? "noch kein Video" : "noch kein Foto"}</div>`}
      </div>
      <div class="heart-medium-editor__datei">
        <button type="button" class="heart-lifeskin-fotoknopf" data-action="lifeskin-medium-datei" data-art="${istVideo ? "video" : "foto"}" ${status ? "disabled" : ""}>
          ${e.datei || !neu ? (istVideo ? "Anderes Video" : "Anderes Foto") : (istVideo ? "Video wählen" : "Foto wählen")}</button>
        ${e.datei ? `<small>${escapeHtml(e.datei)}${groesse ? ` · ${groesse}` : ""}${neu ? "" : " – gilt nach „Speichern“"}</small>` : `<small>${istVideo ? "MP4 oder MOV, höchstens 50 MB. Hochformat wirkt am besten." : "Hochformat wirkt am besten."}</small>`}
      </div>

      <label class="heart-lifeskin-feld">
        <span>Produkt</span>
        <input class="heart-lifeskin-eingabe" data-mediumfeld="produkt" maxlength="60" list="heart-medium-produkte"
               placeholder="Pore Control" value="${escapeHtml(m.produkt || "")}" />
        <datalist id="heart-medium-produkte">${namen.map((n) => `<option value="${escapeHtml(n)}"></option>`).join("")}</datalist>
      </label>
      <label class="heart-lifeskin-feld">
        <span>Ein Satz dazu (Albanisch)</span>
        <textarea class="heart-lifeskin-eingabe" data-mediumfeld="text" maxlength="240" rows="2"
                  placeholder="Lëkurë më e lëmuar, pore më pak të dukshme.">${escapeHtml(m.text || "")}</textarea>
      </label>
      <label class="heart-rasti-haken"><input type="checkbox" data-mediumfeld-an="aktiv"${m.aktiv ? " checked" : ""} /> Auf den Seiten zeigen</label>

      <div class="heart-lifeskin-editor__fuss">
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern"
                data-action="lifeskin-medium-speichern" ${status || (neu && !e.datei) ? "disabled" : ""}>${knopfText}</button>
        <button type="button" class="heart-lifeskin-resetknopf" data-action="lifeskin-medium-zu" ${status ? "disabled" : ""}>Abbrechen</button>
        ${neu ? "" : `<button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--scharf"
                data-action="lifeskin-medium-loeschen" ${status ? "disabled" : ""}>
          ${zustand.medienLoeschen ? "Wirklich löschen? Nochmal tippen" : "Löschen"}</button>`}
      </div>
      ${!neu && gespeichert ? `<p class="heart-lifeskin-block__fuss">${zahl(gespeichert.views)} Views${gespeichert.standard ? "" : " · Kommentare unter „Reaktionen“"}</p>` : ""}
    </section>`;
}

// ── Reaktionen: Views und Kommentare (unter Nachfassen) ───────────────
export function renderMedienReaktionen(zustand = {}) {
  const liste = medienListe(zustand.medien).filter((m) => !m.standard);
  const kommentare = zustand.medienKommentare || null;
  const views = liste.reduce((s, m) => s + m.views, 0);
  const alle = kommentare
    ? liste.flatMap((m) => (kommentare[m.id] || []).map((k) => ({ ...k, m })))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const zahlText = kommentare
    ? `${zahl(views)} Views · ${zahl(alle.length)} ${alle.length === 1 ? "Kommentar" : "Kommentare"}`
    : `${zahl(views)} Views`;
  const loeschen = zustand.kommentarLoeschen || "";
  const laedt = zustand.medienKommentareStatus === "laedt";

  const zeilen = liste.map((m) => {
    const anzahl = kommentare ? (kommentare[m.id] || []).length : null;
    return `
        <div class="heart-reaktion">
          ${kachelBild(m, "heart-reaktion__bild")}
          <span class="heart-reaktion__name"><b>${escapeHtml(m.produkt || "Ohne Produkt")}</b><small>${m.art === "video" ? "Video" : "Foto"}${m.aktiv ? "" : " · aus"}</small></span>
          <span class="heart-reaktion__zahl">${renderHeartIcon("eye")}${zahl(m.views)}</span>
          <span class="heart-reaktion__zahl">${renderHeartIcon("message")}${anzahl === null ? "–" : zahl(anzahl)}</span>
        </div>`;
  }).join("");

  const kommentarZeilen = alle.map((k) => {
    const schluessel = `${k.medium}/${k.id}`;
    return `
        <li class="heart-kommentar${k.verborgen ? " heart-kommentar--verborgen" : ""}">
          ${kachelBild(k.m, "heart-kommentar__bild")}
          <div class="heart-kommentar__leib">
            <p class="heart-kommentar__kopf"><b>${escapeHtml(k.name)}</b><span>${escapeHtml(zeitKurz(k.createdAt))}</span>${k.verborgen ? `<em>verborgen</em>` : ""}</p>
            <p class="heart-kommentar__text">${escapeHtml(k.text)}</p>
            <div class="heart-kommentar__knoepfe">
              <button type="button" class="heart-lifeskin-knopf" data-action="lifeskin-kommentar" data-was="${k.verborgen ? "zeigen" : "verbergen"}"
                      data-medium="${escapeHtml(k.medium)}" data-id="${escapeHtml(k.id)}">${k.verborgen ? "Wieder zeigen" : "Verbergen"}</button>
              <button type="button" class="heart-lifeskin-knopf heart-kommentar__weg" data-action="lifeskin-kommentar" data-was="loeschen"
                      data-medium="${escapeHtml(k.medium)}" data-id="${escapeHtml(k.id)}">${loeschen === schluessel ? "Wirklich löschen?" : "Löschen"}</button>
            </div>
          </div>
        </li>`;
  }).join("");

  return `
    <details class="heart-lifeskin-block heart-klapp" ${klappAttr("reaktionen")}>
      <summary class="heart-klapp__kopf">
        <h3 class="heart-lifeskin-block__titel">Fotos &amp; Videos – Reaktionen</h3>
        <span class="heart-klapp__zahl">${zahlText}</span>
      </summary>
      ${liste.length ? `
      <div class="heart-reaktionen">${zeilen}</div>
      <h4 class="heart-reaktionen__titel">Kommentare</h4>
      ${laedt && !kommentare ? `<p class="heart-lifeskin-leer">Kommentare werden geladen …</p>` : ""}
      ${kommentare && !alle.length ? `<p class="heart-lifeskin-leer">Noch kein Kommentar.</p>` : ""}
      ${alle.length ? `<ul class="heart-kommentare">${kommentarZeilen}</ul>` : ""}
      <p class="heart-lifeskin-block__fuss">Kommentare stehen sofort auf der Seite. „Verbergen“ nimmt sie dort weg, ohne sie zu löschen.</p>`
      : `<p class="heart-lifeskin-leer">Noch kein Foto oder Video gespeichert – unter „Mehr anzeigen → Fotos &amp; Videos“.</p>`}
    </details>`;
}

// ── Die Auswahl im Befund eines Falls ─────────────────────────────────
export function renderBefundMedienAuswahl(zustand = {}, bericht = null) {
  const an = new Set(medienAuswahl(bericht?.klientet));
  const liste = medienListe(zustand.medien).filter((m) => m.aktiv || an.has(m.id));
  if (!liste.length) {
    return `<p class="heart-lifeskin-leer">Kein Foto oder Video eingeschaltet – unter „Mehr anzeigen → Fotos &amp; Videos“.</p>`;
  }
  return `
    <p class="heart-befund__hilfe">Antippen zum Auswählen. Keines gewählt – die Seite zeigt den Abschnitt nicht.</p>
    <div class="heart-rasti-wahl">
      ${liste.map((m) => `
      <label class="heart-rasti-wahl__karte heart-rasti-wahl__karte--medium">
        <input type="checkbox" data-befund-klienti value="${escapeHtml(m.id)}"${an.has(m.id) ? " checked" : ""} />
        <span class="heart-rasti-wahl__bilder heart-rasti-wahl__bilder--eins">${kachelBild(m, "")}${m.art === "video" ? `<span class="heart-medium__art">${renderHeartIcon("play")}</span>` : ""}</span>
        <span class="heart-rasti-wahl__text"><b>${escapeHtml(m.produkt || (m.art === "video" ? "Video" : "Foto"))}</b><small>${escapeHtml(m.text)}</small></span>
      </label>`).join("")}
    </div>`;
}
