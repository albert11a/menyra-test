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
import {
  medienListe, medienAuswahl, kommentareAusText, KOMMENTARE_JE_MAL,
  ausschnittNormalisieren, ausschnittStil, AUSSCHNITT_STANDARD, ZOOM_MAX
} from "../../shared/lifeskin-medien.js";

const zahl = (n) => new Intl.NumberFormat("de-DE").format(Math.max(0, Number(n) || 0));

function zeitKurz(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const heute = new Date();
  const gleich = d.toDateString() === heute.toDateString();
  const uhr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return gleich ? `heute ${uhr}` : `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}. ${uhr}`;
}

function kachelBild(m, klasse = "heart-medium__bild", mitAusschnitt = true) {
  const stil = mitAusschnitt ? ausschnittStil(m.ausschnitt) : "";
  return m.bild
    ? `<img class="${klasse}" src="${escapeHtml(m.bild)}" alt="" loading="lazy" decoding="async"${stil ? ` style="${stil}"` : ""} />`
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
        Kundinnen mit den Produkten – auf der Analyseseite und im LifeSkin Shop unter der Beratungskarte („Nga klientët tanë“).
        Der Shop zeigt alle aktiven Medien in dieser Reihenfolge. Die Auswahl für eine einzelne Analyseseite legst du im Befund fest.
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
  // Nie eingestellt: so, wie die Kacheln es schon immer zeigten.
  const gesetzt = ausschnittNormalisieren(m.ausschnitt);
  const a = gesetzt || AUSSCHNITT_STANDARD;
  const knopfText = status === "hochladen" ? "Wird hochgeladen …" : status === "speichern" ? "Wird gespeichert …" : "Speichern";

  return `
    <section class="heart-lifeskin-editor heart-medium-editor">
      <button type="button" class="heart-lifeskin-zurueck" data-action="lifeskin-medium-zu">← Alle Fotos &amp; Videos</button>
      <h3 class="heart-lifeskin-block__titel">${neu ? (istVideo ? "Neues Video" : "Neues Foto") : (istVideo ? "Video bearbeiten" : "Foto bearbeiten")}</h3>

      <div class="heart-medium-editor__buehne"${vorschau || quelle ? ` data-ausschnitt-buehne data-gesetzt="${gesetzt ? "1" : ""}" data-x="${a.x}" data-y="${a.y}" data-zoom="${a.zoom}"` : ""}>
        ${vorschau || quelle
          ? (istVideo && quelle
            ? `<video data-ausschnitt-medium src="${escapeHtml(quelle)}" ${m.bild && !e.vorschau ? `poster="${escapeHtml(m.bild)}"` : ""} style="${ausschnittStil(a)}" autoplay loop playsinline muted preload="metadata"></video>`
            : `<img data-ausschnitt-medium src="${escapeHtml(vorschau)}" alt="" draggable="false" style="${ausschnittStil(a)}" />`)
          : `<div class="heart-rasti-fotoleer">${istVideo ? "noch kein Video" : "noch kein Foto"}</div>`}
      </div>
      ${vorschau || quelle ? `
      <div class="heart-medium-editor__ausschnitt">
        <small>Ausschnitt: im Bild ziehen zum Verschieben, mit zwei Fingern oder dem Regler zoomen. So steht es auf allen Seiten.</small>
        <label class="heart-medium-editor__zoom">
          <span aria-hidden="true">−</span>
          <input type="range" data-ausschnitt-zoom min="1" max="${ZOOM_MAX}" step="0.01" value="${a.zoom}" aria-label="Zoom" ${status ? "disabled" : ""} />
          <span aria-hidden="true">+</span>
        </label>
        <button type="button" class="heart-rasti-mini" data-action="lifeskin-ausschnitt-zurueck" ${status || !gesetzt ? "disabled" : ""}>Ausschnitt zurücksetzen</button>
      </div>` : ""}
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

// ── Ausschnitt im Editor: ziehen, zwei Finger, Regler ──────────────────
// Lebt waehrend der Geste nur im DOM (data-x/-y/-zoom an der Buehne) - kein
// Neuzeichnen pro Bewegung. Am Ende ruft heart.js "fertig" und legt den
// Wert in den Entwurf (ausschnittLesen).

function ausschnittAusBuehne(buehne) {
  return {
    x: Number(buehne.dataset.x), y: Number(buehne.dataset.y), zoom: Number(buehne.dataset.zoom)
  };
}

function ausschnittSetzen(buehne, roh) {
  const a = ausschnittNormalisieren(roh);
  if (!a) return;
  buehne.dataset.x = String(a.x);
  buehne.dataset.y = String(a.y);
  buehne.dataset.zoom = String(a.zoom);
  buehne.dataset.gesetzt = "1";
  const medium = buehne.querySelector("[data-ausschnitt-medium]");
  if (medium) medium.style.cssText = ausschnittStil(a);
  const regler = buehne.parentElement?.querySelector("[data-ausschnitt-zoom]");
  if (regler && Number(regler.value) !== a.zoom) regler.value = String(a.zoom);
  const zurueck = buehne.parentElement?.querySelector('[data-action="lifeskin-ausschnitt-zurueck"]');
  if (zurueck && !regler?.disabled) zurueck.disabled = false;
}

// Um wie viele Prozent verschiebt sich der Ausschnitt, wenn der Finger
// dx/dy Pixel faehrt? Das Medium ist (cover * zoom) groesser als der Rahmen;
// nur dieser Ueberstand laesst sich schieben.
function verschieben(buehne, a, dx, dy) {
  const medium = buehne.querySelector("[data-ausschnitt-medium]");
  const w = medium?.naturalWidth || medium?.videoWidth || 0;
  const h = medium?.naturalHeight || medium?.videoHeight || 0;
  const W = buehne.clientWidth, H = buehne.clientHeight;
  if (!w || !h || !W || !H) return a;
  const deckt = Math.max(W / w, H / h) * a.zoom;
  const ueberX = w * deckt - W, ueberY = h * deckt - H;
  return {
    ...a,
    x: ueberX > 0.5 ? a.x - (dx * 100) / ueberX : a.x,
    y: ueberY > 0.5 ? a.y - (dy * 100) / ueberY : a.y
  };
}

let griff = null;

export function ausschnittGriff(event, fertig) {
  const buehne = event.target?.closest?.("[data-ausschnitt-buehne]");
  if (!buehne || buehne.closest(".heart-medium-editor")?.querySelector("[data-ausschnitt-zoom]")?.disabled) return;
  if (event.pointerType === "mouse" && event.button !== 0) return;
  event.preventDefault();
  if (!griff || griff.buehne !== buehne) {
    griff?.ende();
    const zeiger = new Map();
    const lage = () => {
      const p = [...zeiger.values()];
      const mitte = { x: p.reduce((n, q) => n + q.x, 0) / p.length, y: p.reduce((n, q) => n + q.y, 0) / p.length };
      const abstand = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
      return { mitte, abstand, zahl: p.length };
    };
    const bewegen = (e) => {
      if (!zeiger.has(e.pointerId)) return;
      const vorher = lage();
      zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const jetzt = lage();
      let a = ausschnittAusBuehne(buehne);
      if (jetzt.zahl > 1 && vorher.abstand > 0) a.zoom = Math.min(ZOOM_MAX, Math.max(1, a.zoom * (jetzt.abstand / vorher.abstand)));
      a = verschieben(buehne, a, jetzt.mitte.x - vorher.mitte.x, jetzt.mitte.y - vorher.mitte.y);
      ausschnittSetzen(buehne, a);
    };
    const los = (e) => {
      zeiger.delete(e.pointerId);
      if (zeiger.size) return;
      griff.ende();
      fertig?.();
    };
    griff = {
      buehne, zeiger,
      ende() {
        globalThis.removeEventListener("pointermove", bewegen);
        globalThis.removeEventListener("pointerup", los);
        globalThis.removeEventListener("pointercancel", los);
        griff = null;
      }
    };
    globalThis.addEventListener("pointermove", bewegen);
    globalThis.addEventListener("pointerup", los);
    globalThis.addEventListener("pointercancel", los);
  }
  griff.zeiger.set(event.pointerId, { x: event.clientX, y: event.clientY });
}

export function ausschnittZoom(regler) {
  const buehne = regler?.closest?.(".heart-medium-editor")?.querySelector("[data-ausschnitt-buehne]");
  if (!buehne) return;
  ausschnittSetzen(buehne, { ...ausschnittAusBuehne(buehne), zoom: Number(regler.value) });
}

// Fuer den Entwurf: der eingestellte Ausschnitt, null = keiner,
// undefined = kein Editor da (dann bleibt, was war).
export function ausschnittLesen(wurzel = globalThis.document) {
  const buehne = wurzel?.querySelector?.("[data-ausschnitt-buehne]");
  if (!buehne) return undefined;
  return buehne.dataset.gesetzt === "1" ? ausschnittNormalisieren(ausschnittAusBuehne(buehne)) : null;
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
      ${renderKommentarSchreiben(liste)}
      ${alle.length ? `<ul class="heart-kommentare">${kommentarZeilen}</ul>` : ""}
      <p class="heart-lifeskin-block__fuss">Kommentare stehen sofort auf der Seite. „Verbergen“ nimmt sie dort weg, ohne sie zu löschen.</p>`
      : `<p class="heart-lifeskin-leer">Noch kein Foto oder Video gespeichert – unter „Mehr anzeigen → Fotos &amp; Videos“.</p>`}
    </details>`;
}

// ── Kommentare schreiben: eine Zeile = ein Kommentar ─────────────────
// Das Formular lebt nur im DOM (data-bewahren, heart-morph.js): Was
// eingefuegt ist, bleibt stehen, auch wenn Heart wegen Live-Zahlen neu
// zeichnet. Neu aufgebaut wird es nur, wenn sich die Medien aendern.
// Die Vorschau darunter und das Speichern: heart.js.
export function renderKommentarSchreiben(liste = []) {
  if (!liste.length) return "";
  const optionen = liste.map((m, i) => `
        <option value="${escapeHtml(m.id)}">${escapeHtml(m.produkt || "Ohne Produkt")} · ${m.art === "video" ? "Video" : "Foto"} ${i + 1}${m.aktiv ? "" : " (aus)"}</option>`).join("");
  return `
      <h4 class="heart-reaktionen__titel">Kommentare schreiben</h4>
      <div class="heart-kommentar-import" data-kommentar-import data-bewahren="kommentar-import:${escapeHtml(liste.map((m) => m.id).join(","))}">
        <label class="heart-lifeskin-feld">
          <span>Unter welchem Foto oder Video</span>
          <select class="heart-lifeskin-eingabe" data-kommentar-medium>${optionen}
          </select>
        </label>
        <label class="heart-lifeskin-feld">
          <span>Eine Zeile = ein Kommentar · Name, Komma, Text</span>
          <textarea class="heart-lifeskin-eingabe" data-kommentar-text rows="6" placeholder="Lind, mrrekulli ❤️&#10;Name, Text"></textarea>
        </label>
        <p class="heart-kommentar-import__vorschau" data-kommentar-vorschau>Einfügen oder tippen – jede Zeile wird ein eigener Kommentar.</p>
        <button type="button" class="heart-lifeskin-resetknopf heart-lifeskin-resetknopf--speichern"
                data-action="lifeskin-kommentare-speichern" disabled>Speichern</button>
      </div>`;
}

// Vorschau und Knopf direkt im Formular setzen (es lebt nur im DOM).
// Gibt zurueck, was gespeichert wuerde - oder null, wenn etwas nicht geht.
export function kommentarVorschauSetzen(form) {
  const feld = form?.querySelector("[data-kommentar-text]");
  if (!feld) return null;
  const vorschau = form.querySelector("[data-kommentar-vorschau]");
  const knopf = form.querySelector('[data-action="lifeskin-kommentare-speichern"]');
  const { kommentare, fehler } = kommentareAusText(feld.value);
  const n = kommentare.length;
  const zuviel = n > KOMMENTARE_JE_MAL;
  let satz = n ? `${n} ${n === 1 ? "Kommentar" : "Kommentare"} erkannt.` : "Einfügen oder tippen – jede Zeile wird ein eigener Kommentar.";
  if (fehler.length) {
    satz += ` ${fehler.length === 1 ? "1 Zeile geht nicht" : `${fehler.length} Zeilen gehen nicht`}: `
      + fehler.slice(0, 3).map((x) => `Zeile ${x.zeile} – ${x.grund}`).join(" · ")
      + (fehler.length > 3 ? " …" : "");
  }
  if (zuviel) satz += ` Höchstens ${KOMMENTARE_JE_MAL} auf einmal.`;
  if (vorschau) {
    vorschau.textContent = satz;
    vorschau.classList.toggle("heart-kommentar-import__vorschau--fehler", fehler.length > 0 || zuviel);
  }
  const gut = n > 0 && !fehler.length && !zuviel;
  if (knopf && !knopf.dataset.laeuft) {
    knopf.disabled = !gut;
    knopf.textContent = n ? `${n} ${n === 1 ? "Kommentar" : "Kommentare"} speichern` : "Speichern";
  }
  return gut ? kommentare : null;
}

// ── Die Auswahl im Befund eines Falls ─────────────────────────────────
export function renderBefundMedienAuswahl(zustand = {}, bericht = null) {
  const an = new Set(medienAuswahl(bericht?.klientet));
  const liste = medienListe(zustand.medien).filter((m) => m.aktiv || an.has(m.id));
  if (!liste.length) {
    return `<p class="heart-lifeskin-leer">Kein Foto oder Video eingeschaltet – unter „Mehr anzeigen → Fotos &amp; Videos“.</p>`;
  }
  return `
    <div class="heart-rasti-wahl">
      ${liste.map((m) => `
      <label class="heart-rasti-wahl__karte heart-rasti-wahl__karte--medium">
        <input type="checkbox" data-befund-klienti value="${escapeHtml(m.id)}"${an.has(m.id) ? " checked" : ""} />
        <span class="heart-rasti-wahl__bilder heart-rasti-wahl__bilder--eins">${kachelBild(m, "", false)}${m.art === "video" ? `<span class="heart-medium__art">${renderHeartIcon("play")}</span>` : ""}</span>
        <span class="heart-rasti-wahl__text"><b>${escapeHtml(m.produkt || (m.art === "video" ? "Video" : "Foto"))}</b><small>${escapeHtml(m.text)}</small></span>
      </label>`).join("")}
    </div>`;
}
