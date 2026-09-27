/* DIE FAELLE IM ABSCHNITT "REZULTATE" - aus Heart statt fest im HTML.
 *
 * Das HTML traegt weiter die vier Faelle von vorher. Das ist der
 * Rueckweg: Antwortet Firestore nicht oder ist in Heart noch nichts
 * gespeichert, bleibt die Seite genau so stehen. Erst eine gespeicherte
 * Liste ersetzt die Karten - mit demselben Aufbau, also demselben
 * Aussehen.
 *
 * Ist in Heart kein Fall fuer die Landingpage eingeschaltet, verschwindet
 * der ganze Abschnitt: eine Ueberschrift ohne Faelle darunter sieht nach
 * einer kaputten Seite aus. */
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from "../lifeskin/lifeskin-config.js";
import {
  rasteLaden, rasteFuer, rasteMitBildern, rastiProdukteText, escapeRasti as e, RASTE_STANDARD
} from "../../shared/lifeskin-raste.js";

const BASIS = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config`;

// DIE EIGENEN FAELLE GIBT ES AUCH ALS WEBP - rund 40 % kleiner bei
// gleicher Schaerfe (Qualitaet 0,78). Die JPEG bleibt der Rueckfall fuer
// Browser ohne WebP. Fremde Adressen (aus Heart hochgeladen) bleiben, wie
// sie sind.
export function rastiBild(src, alt) {
  const bild = `<img src="${e(src)}" alt="${e(alt)}" width="720" height="810" loading="lazy" decoding="async" />`;
  if (!/^\/apps\/lifeskin-landing\/fotot\/rasti-[a-z0-9-]+\.jpg$/.test(String(src || ""))) return bild;
  return `<picture><source srcset="${e(String(src).replace(/\.jpg$/, ".webp"))}" type="image/webp" />${bild}</picture>`;
}

export function rastiKarte(r) {
  const n = r.produkte.length;
  const cmim = r.cmimi
    ? `<p class="rasti__cmim"><span class="rasti__cmim__fjala">Terapia 28-ditore</span><strong>${e(r.cmimi)} €</strong><span class="rasti__cmim__nen">Me ${n} ${n === 1 ? "produkt" : "produkte"} · dërgesa e përfshirë</span></p>`
    : "";
  return `
          <article class="rasti" data-rasti="${e(r.id)}" data-produkte="${n}" data-cmim="${e(r.cmimi)}">
            <div class="rasti__palet">
              <figure class="gjysma">
                ${rastiBild(r.para, `Para: ${r.gjetja || ""}`)}
                <figcaption class="etiket">PARA</figcaption>
              </figure>
              <figure class="gjysma gjysma--fund">
                ${rastiBild(r.pas, `Pas 28 ditësh: ${r.gjetja || ""}`)}
                <figcaption class="etiket etiket--fund">PAS</figcaption>
              </figure>
            </div>
            <div class="rasti__fjale">
              ${r.emri ? `<p class="rasti__kush">${e(r.emri)}</p>` : ""}
              ${r.gjetja ? `<p class="rasti__gjetja">${e(r.gjetja)}</p>` : ""}
              ${n ? `<p class="rasti__seti">Produktet: <strong>${e(rastiProdukteText(r))}</strong></p>` : ""}
              ${cmim}
            </div>
          </article>`;
}

// Dieselben Faelle als Reihe im ersten Blick (index.html, .blick):
// nur die zwei Aufnahmen mit je ihrem Schild, der Link nennt den Fall.
export function blickFall(r, i) {
  const halb = (src, wort, pas) =>
    `<span class="blick__halb">${rastiBild(src, "").replace(i < 2 ? ' loading="lazy"' : "", "")}<span class="blick__etiket${pas ? " blick__etiket--pas" : ""}" aria-hidden="true">${wort}</span></span>`;
  const name = [r.emri, r.gjetja].filter(Boolean).join(": ") || `Rasti ${i + 1}`;
  return `
            <a class="blick__fall" href="#rezultatet" data-blick="${i}" aria-label="${e(name)}, para dhe pas 28 ditësh">
              ${halb(r.para, "PARA", false)}
              ${halb(r.pas, "PAS", true)}
            </a>`;
}

// Stehen im HTML schon genau diese Faelle? Dann bleibt die Reihe, wie
// sie ist - und ihre Bilder laden nicht ein zweites Mal.
export function wieImHtml(faelle) {
  return faelle.length === RASTE_STANDARD.length &&
    faelle.every((r, i) => r.para === RASTE_STANDARD[i].para && r.pas === RASTE_STANDARD[i].pas);
}

const warten = (ms) => new Promise((fertig) => setTimeout(fertig, ms));

// Eine Aufnahme laden und dekodieren, ohne sie zu zeigen. Eigene Dateien
// als WebP - dieselbe Adresse, die <picture> gleich waehlt.
function vorladen(src) {
  const bild = new Image();
  bild.src = /^\/apps\/lifeskin-landing\/fotot\/rasti-[a-z0-9-]+\.jpg$/.test(src) ? src.replace(/\.jpg$/, ".webp") : src;
  return bild.decode().catch(() => {});
}

// Die zwei vorderen Faelle der Reihe sind fertig - oder es ist genug
// gewartet. Ein Bild, das nicht kommt, haelt die anderen nicht auf.
function bilderFertig(blick) {
  const bilder = [...blick.querySelectorAll(".blick__fall")].slice(0, 2).flatMap((f) => [...f.querySelectorAll("img")]);
  return Promise.race([Promise.all(bilder.map((b) => b.decode().catch(() => {}))), warten(1500)]);
}

async function start() {
  const bahn = document.getElementById("rastet");
  if (!bahn) return;
  const blick = document.getElementById("blick");
  const reihe = blick?.closest(".blick");
  const zeigen = async () => {
    if (!reihe?.hasAttribute("data-wartet")) return;
    await bilderFertig(blick);
    reihe.removeAttribute("data-wartet");
  };
  // Antwortet Firestore langsam, stehen die Faelle aus dem HTML nicht
  // ewig leer da.
  const notfall = setTimeout(zeigen, 1800);
  let faelle = null;
  try {
    const liste = await rasteLaden(BASIS);
    if (liste) faelle = await rasteMitBildern(rasteFuer(liste, "landing"), BASIS);
  } catch {
    faelle = null;
  }
  clearTimeout(notfall);
  if (!faelle) {
    zeigen();
    return;
  }
  const abschnitt = document.getElementById("rezultatet");
  if (!faelle.length) {
    if (abschnitt) abschnitt.hidden = true;
    if (reihe) reihe.hidden = true;
    return;
  }
  bahn.innerHTML = faelle.map(rastiKarte).join("");
  bahn.scrollLeft = 0;
  // Die Punkte darunter zaehlen die Karten neu (landing.js).
  document.dispatchEvent(new CustomEvent("lifeskin:raste"));
  // Andere Faelle als im HTML: erst fertig laden, dann in einem Zug
  // tauschen - auch wenn die Reihe schon sichtbar ist, erscheint so nie
  // ein leeres oder ein halbes Bild.
  if (blick && !wieImHtml(faelle)) {
    await Promise.race([Promise.all(faelle.slice(0, 2).flatMap((r) => [vorladen(r.para), vorladen(r.pas)])), warten(2500)]);
    blick.innerHTML = faelle.map(blickFall).join("");
    blick.scrollLeft = 0;
  }
  zeigen();
}

if (typeof document !== "undefined") start();
