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
  rasteLaden, rasteFuer, rasteMitBildern, rastiProdukteText, escapeRasti as e
} from "../../shared/lifeskin-raste.js";

const BASIS = `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/config`;

export function rastiKarte(r) {
  const n = r.produkte.length;
  const cmim = r.cmimi
    ? `<p class="rasti__cmim"><span class="rasti__cmim__fjala">Terapia 28-ditore</span><strong>${e(r.cmimi)} €</strong><span class="rasti__cmim__nen">Me ${n} ${n === 1 ? "produkt" : "produkte"} · dërgesa e përfshirë</span></p>`
    : "";
  return `
          <article class="rasti" data-rasti="${e(r.id)}" data-produkte="${n}" data-cmim="${e(r.cmimi)}">
            <div class="rasti__palet">
              <figure class="gjysma">
                <img src="${e(r.para)}" alt="Para: ${e(r.gjetja)}" width="720" height="810" loading="lazy" decoding="async" />
                <figcaption class="etiket">PARA</figcaption>
              </figure>
              <figure class="gjysma gjysma--fund">
                <img src="${e(r.pas)}" alt="Pas 28 ditësh: ${e(r.gjetja)}" width="720" height="810" loading="lazy" decoding="async" />
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

async function start() {
  const bahn = document.getElementById("rastet");
  if (!bahn) return;
  let liste;
  try {
    liste = await rasteLaden(BASIS);
  } catch {
    return;
  }
  if (!liste) return;
  const faelle = await rasteMitBildern(rasteFuer(liste, "landing"), BASIS);
  const abschnitt = document.getElementById("rezultatet");
  if (!faelle.length) {
    if (abschnitt) abschnitt.hidden = true;
    return;
  }
  bahn.innerHTML = faelle.map(rastiKarte).join("");
  bahn.scrollLeft = 0;
  // Die Punkte darunter zaehlen die Karten neu (landing.js).
  document.dispatchEvent(new CustomEvent("lifeskin:raste"));
}

if (typeof document !== "undefined") start();
