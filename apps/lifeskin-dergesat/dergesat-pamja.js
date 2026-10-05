// /dergesat - WAS GEZEICHNET WIRD (ohne Firebase, pruefbar ohne Browser:
// tests/lifeskin-dergesat.test.mjs). Regeln und Rechnung:
// shared/lifeskin-dergesat.js. Die Seite: dergesat.js.
//
// Rollen: "riba" (kadrija) und "heart" (der Inhaber mit seinem
// Heart-Zugang). Was nur der Inhaber darf - Barazuar, Riba ausbezahlt,
// Zuruecknehmen -, steht fuer Riba gar nicht erst da (firestore.rules
// wuerde es ohnehin abweisen).

import { STATUS_CHIPS, KALIMET_RIBA, euroSq, llogarit, mundTeKthehet, numeroPerChip, produkteNeDergesa, renditPerChip } from "../../shared/lifeskin-dergesat.js";

export function esc(wert) {
  return String(wert ?? "").replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z]));
}

export function kohaSq(iso) {
  const d = new Date(iso);
  if (!iso || !Number.isFinite(d.getTime())) return "";
  const dy = (n) => String(n).padStart(2, "0");
  return `${dy(d.getDate())}.${dy(d.getMonth() + 1)}. ${dy(d.getHours())}:${dy(d.getMinutes())}`;
}

const buton = (veprimi, tekst, { kennung = "", klasa = "", laeuft = "", titull = "" } = {}) => {
  const celes = `${veprimi}:${kennung}`;
  const zene = Boolean(laeuft);
  return `<button type="button" class="dg-buton${klasa ? ` ${klasa}` : ""}" data-veprim="${esc(veprimi)}"${kennung ? ` data-kennung="${esc(kennung)}"` : ""}${
    titull ? ` title="${esc(titull)}"` : ""}${zene ? " disabled" : ""}>${laeuft === celes ? "…" : esc(tekst)}</button>`;
};

export function renderChips(liste, aktiv) {
  const numri = numeroPerChip(liste);
  return STATUS_CHIPS.map((c) => `
      <button type="button" class="dg-chip${c.id === aktiv ? " dg-chip--aktiv" : ""}" data-veprim="chip" data-chip="${esc(c.id)}" aria-pressed="${c.id === aktiv ? "true" : "false"}">
        <span>${esc(c.label)}</span><b>${numri[c.id] || 0}</b>
      </button>`).join("");
}

function butonatPer(d, roli, laeuft) {
  const heart = roli === "heart";
  const b = [];
  const mund = (ne) => (KALIMET_RIBA[d.statusi] || []).includes(ne);
  if (d.statusi === "porosi" && mund("derguar")) b.push(buton("derguar", "Te Beki", { kennung: d.kennung, klasa: "dg-buton--kryesor", laeuft }));
  if (d.statusi === "derguar") {
    b.push(buton("pranuar", "Pranuar", { kennung: d.kennung, klasa: "dg-buton--mire", laeuft }));
    b.push(buton("anuluar", "Anuluar", { kennung: d.kennung, klasa: "dg-buton--keq", laeuft }));
  }
  if (heart && d.statusi === "pranuar" && !d.barazuarAt) b.push(buton("barazo", "Barazuar", { kennung: d.kennung, laeuft }));
  if (heart && mundTeKthehet(d)) b.push(buton("kthe", "↺ Kthe", { kennung: d.kennung, klasa: "dg-buton--lehte", laeuft, titull: "Hapin e fundit prapa" }));
  return b.join("");
}

function shenjat(d) {
  const s = [];
  if (d.statusi === "derguar" && d.derguarAt) s.push(`Dërguar ${kohaSq(d.derguarAt)}`);
  if (d.statusi === "pranuar" && d.pranuarAt) s.push(`Pranuar ${kohaSq(d.pranuarAt)}`);
  if (d.statusi === "anuluar" && d.anuluarAt) s.push(`Anuluar ${kohaSq(d.anuluarAt)}`);
  const etiketat = [];
  if (d.barazuarAt) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Barazuar ✓</span>`);
  if (d.ribaPaguarAt) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Riba paguar ✓</span>`);
  return `${s.length ? `<small class="dg-koha">${esc(s.join(" · "))}</small>` : ""}${etiketat.length ? `<span class="dg-etiketat">${etiketat.join("")}</span>` : ""}`;
}

export function renderListe(liste, chip, roli, laeuft = "") {
  const rreshtat = renditPerChip(liste, chip);
  if (!rreshtat.length) {
    const bosh = { porosi: "Asnjë porosi për t'u dërguar.", derguar: "Asgjë në rrugë.", pranuar: "Ende asnjë e pranuar.", anuluar: "Asnjë e anuluar." }[chip];
    return `<p class="dg-bosh">${esc(bosh || "Asgjë.")}</p>`;
  }
  // AUFBAU (Wunsch Inhaber 05.10.):
  //   oben links   Beki + Nummer, daneben je Produkt "1 BPO"
  //   oben rechts  Fallnummer und Preis
  //   darunter     die Knoepfe, links beginnend
  return rreshtat.map((d) => {
    const produkte = produkteNeDergesa(d.produkte);
    const butonat = butonatPer(d, roli, laeuft);
    return `
      <article class="dg-rresht dg-rresht--${esc(d.statusi)}" data-kennung="${esc(d.kennung)}">
        <div class="dg-rresht__koka">
          <div class="dg-beki">
            <small>Beki</small>
            <b>${esc(d.postaBeki || "—")}</b>
          </div>
          <ul class="dg-produkte">
            ${produkte.length ? produkte.map((p) => `<li><b>${p.sasia}</b> ${esc(p.emri)}</li>`).join("") : `<li class="dg-bosh-produkte">Pa produkte</li>`}
          </ul>
          <div class="dg-rresht__djathtas">
            ${d.kodi ? `<span class="dg-kodi">#${esc(d.kodi)}</span>` : ""}
            <b class="dg-cmimi">${esc(euroSq(d.cmimi))}</b>
          </div>
        </div>
        ${butonat ? `<div class="dg-butonat">${butonat}</div>` : ""}
        ${shenjat(d)}
      </article>`;
  }).join("");
}

function historia(grupet) {
  if (!grupet.length) return `<p class="dg-karte__pak">Ende asgjë.</p>`;
  return `<ul class="dg-historia">${grupet.slice(0, 30).map((g) => `
        <li><span>${esc(kohaSq(g.at))}</span><span>${g.numri} porosi</span><b>${esc(euroSq(g.shuma))}</b></li>`).join("")}</ul>`;
}

export function renderKartat(liste, roli, laeuft = "") {
  const ll = llogarit(liste);
  const heart = roli === "heart";
  const pb = ll.pritjeBarazim;
  return `
      <section class="dg-karte">
        <h2>Pritje barazim <small>Posta Beki</small></h2>
        <p class="dg-karte__shuma">${esc(euroSq(pb.shuma))}</p>
        <p class="dg-karte__pak">${pb.numri} porosi · −2,50 € posta për porosi</p>
        <ul class="dg-ndarja">
          <li><span>Dërguar (në rrugë)</span><span>${pb.neRruge.numri}</span><b>${esc(euroSq(pb.neRruge.shuma))}</b></li>
          <li><span>Pranuar (gati për barazim)</span><span>${pb.gati.numri}</span><b>${esc(euroSq(pb.gati.shuma))}</b></li>
        </ul>
        ${heart ? buton("barazo-te-gjitha", pb.gati.numri ? `Barazuar · ${pb.gati.numri} porosi · ${euroSq(pb.gati.shuma)}` : "Barazuar", {
          klasa: "dg-buton--kryesor dg-buton--gjere", laeuft: laeuft || (pb.gati.numri ? "" : "bosh") }) : ""}
      </section>

      <section class="dg-karte">
        <h2>Barazuar <small>Posta Beki</small></h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.barazuar.shuma))}</p>
        <p class="dg-karte__pak">${ll.barazuar.numri} porosi gjithsej</p>
        ${historia(ll.barazuar.grupet)}
      </section>

      <section class="dg-karte">
        <h2>Pritje për Riben</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.pritjeRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.pritjeRiba.numri} porosi të dërguara · 2 € për porosi</p>
      </section>

      <section class="dg-karte dg-karte--theksuar">
        <h2>€ për Riben</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.perRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.perRiba.numri} porosi të pranuara · 2 € për porosi</p>
        ${heart ? buton("paguaj-riben", ll.perRiba.numri ? `Paguar · ${ll.perRiba.numri} porosi · ${euroSq(ll.perRiba.shuma)}` : "Paguar", {
          klasa: "dg-buton--kryesor dg-buton--gjere", laeuft: laeuft || (ll.perRiba.numri ? "" : "bosh") }) : ""}
      </section>

      <section class="dg-karte">
        <h2>Paguar Ribës</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.paguarRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.paguarRiba.numri} porosi gjithsej</p>
        ${historia(ll.paguarRiba.grupet)}
      </section>`;
}
