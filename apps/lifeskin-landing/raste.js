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

// i: die Stelle in der Bahn. Die zwei vorderen Karten laden sofort - auf
// /lifeskin stehen sie gleich unter dem ersten Knopf, also im ersten Bild.
export function rastiKarte(r, i = 99) {
  const n = r.produkte.length;
  const bild = (src, alt) => (i < 2 ? rastiBild(src, alt).replace(' loading="lazy"', "") : rastiBild(src, alt));
  const cmim = r.cmimi
    ? `<p class="rasti__cmim"><span class="rasti__cmim__fjala">Terapia 28-ditore</span><strong>${e(r.cmimi)} €</strong><span class="rasti__cmim__nen">Me ${n} ${n === 1 ? "produkt" : "produkte"} · dërgesa e përfshirë</span></p>`
    : "";
  return `
          <article class="rasti" data-rasti="${e(r.id)}" data-produkte="${n}" data-cmim="${e(r.cmimi)}">
            <div class="rasti__palet">
              <figure class="gjysma">
                ${bild(r.para, `Para: ${r.gjetja || ""}`)}
                <figcaption class="etiket">PARA</figcaption>
              </figure>
              <figure class="gjysma gjysma--fund">
                ${bild(r.pas, `Pas 28 ditësh: ${r.gjetja || ""}`)}
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
            <a class="blick__fall" href="#rezultatet" data-blick="${e(r.id)}" aria-label="${e(name)}, para dhe pas 28 ditësh">
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
function bilderFertig(behaelter, wahl = ".blick__fall") {
  const bilder = [...behaelter.querySelectorAll(wahl)].slice(0, 2).flatMap((f) => [...f.querySelectorAll("img")]);
  return Promise.race([Promise.all(bilder.map((b) => b.decode().catch(() => {}))), warten(1500)]);
}

// OBEN ZUERST. Auf /lifeskin gibt es die Reihe im ersten Blick nicht mehr
// (die Faelle stehen selbst gleich unter dem Knopf); was in Heart "Oben"
// traegt, steht dort deshalb vorn in der Bahn. Sonst bleibt die
// Reihenfolge aus Heart.
export function obenZuerst(faelle, obenIds) {
  return [...faelle.filter((r) => obenIds.has(r.id)), ...faelle.filter((r) => !obenIds.has(r.id))];
}

// The approved comparison uses the same Heart list and image documents as the
// original card rail. Every landing case is included, regardless of "oben".
export async function vergleichFaelleLaden(basis = BASIS, holen) {
  try {
    const liste = await rasteLaden(basis, holen);
    if (liste === null) return null;
    return await rasteMitBildern(rasteFuer(liste, "landing"), basis, holen);
  } catch {
    return null;
  }
}

async function vergleichStarten(root) {
  const faelle = await vergleichFaelleLaden();
  if (faelle !== null) root.dispatchEvent(new CustomEvent("lifeskin:comparison-cases", { detail: faelle }));
}

async function start() {
  const vergleich = document.getElementById("lf-preview");
  if (vergleich) vergleichStarten(vergleich);
  const bahn = document.getElementById("rastet");
  if (!bahn) return;
  const blick = document.getElementById("blick");
  const reihe = blick?.closest(".blick");
  // DIE BAHN SELBST WARTET, wo sie im ersten Bild steht (/lifeskin,
  // data-wartet an #rastet): dieselbe Regel wie fuer die Reihe.
  const bahnZeigen = async () => {
    if (!bahn.hasAttribute("data-wartet")) return;
    await bilderFertig(bahn, ".rasti");
    bahn.removeAttribute("data-wartet");
  };
  const zeigen = async () => {
    bahnZeigen();
    if (!reihe?.hasAttribute("data-wartet")) return;
    await bilderFertig(blick);
    reihe.removeAttribute("data-wartet");
  };
  // Antwortet Firestore langsam, stehen die Faelle aus dem HTML nicht
  // ewig leer da.
  const notfall = setTimeout(zeigen, 1800);
  let faelle = null;
  let oben = [];
  try {
    const liste = await rasteLaden(BASIS);
    if (liste) {
      faelle = await rasteMitBildern(rasteFuer(liste, "landing"), BASIS);
      // Oben stehen die Faelle, die in Heart "Oben" tragen - in derselben
      // Reihenfolge, mit denselben (schon geladenen) Bildern.
      const obenIds = new Set(rasteFuer(liste, "oben").map((r) => r.id));
      oben = faelle.filter((r) => obenIds.has(r.id));
      if (!blick) faelle = obenZuerst(faelle, obenIds);
    }
  } catch {
    faelle = null;
  }
  clearTimeout(notfall);
  if (!faelle) {
    zeigen();
    return;
  }
  const abschnitt = document.getElementById("rezultatet");
  if (reihe && !oben.length) reihe.hidden = true;
  if (!faelle.length) {
    if (abschnitt) abschnitt.hidden = true;
    return;
  }
  // Wartet die Bahn noch (erstes Bild), werden die zwei vorderen Karten
  // erst fertig geladen und dann in einem Zug getauscht.
  if (bahn.hasAttribute("data-wartet") && !wieImHtml(faelle)) {
    await Promise.race([Promise.all(faelle.slice(0, 2).flatMap((r) => [vorladen(r.para), vorladen(r.pas)])), warten(2500)]);
  }
  bahn.innerHTML = faelle.map(rastiKarte).join("");
  bahn.scrollLeft = 0;
  // Die Punkte darunter zaehlen die Karten neu (landing.js).
  document.dispatchEvent(new CustomEvent("lifeskin:raste"));
  // Andere Faelle als im HTML: erst fertig laden, dann in einem Zug
  // tauschen - auch wenn die Reihe schon sichtbar ist, erscheint so nie
  // ein leeres oder ein halbes Bild.
  if (blick && oben.length && !wieImHtml(oben)) {
    await Promise.race([Promise.all(oben.slice(0, 2).flatMap((r) => [vorladen(r.para), vorladen(r.pas)])), warten(2500)]);
    blick.innerHTML = oben.map(blickFall).join("");
    blick.scrollLeft = 0;
  }
  zeigen();
}

if (typeof document !== "undefined") start();
