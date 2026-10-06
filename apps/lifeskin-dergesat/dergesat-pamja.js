// /dergesat - WAS GEZEICHNET WIRD (ohne Firebase, pruefbar ohne Browser:
// tests/lifeskin-dergesat.test.mjs). Regeln und Rechnung:
// shared/lifeskin-dergesat.js. Die Seite: dergesat.js.
//
// Rollen: "riba" (kadrija) und "heart" (der Inhaber mit seinem
// Heart-Zugang). Was nur der Inhaber darf - Barazuar, Riba ausbezahlt,
// Zuruecknehmen -, steht fuer Riba gar nicht erst da (firestore.rules
// wuerde es ohnehin abweisen).

import {
  DERGESA, STATUS_CHIPS, KALIMET_RIBA, euroSq, llogarit, llogaritDepon, mundTeKthehet, netoPosta, numeroPerChip, prituriKthim,
  produkteNeDergesa, renditPerChip
} from "../../shared/lifeskin-dergesat.js";

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
  // Porosiat -> "Gati" (gepackt), Gati -> "Te Beki" (06.10.).
  if (d.statusi === "porosi" && mund("gati")) b.push(buton("gati", "Gati", { kennung: d.kennung, klasa: "dg-buton--kryesor", laeuft }));
  if (d.statusi === "gati" && mund("derguar")) b.push(buton("derguar", "Te Beki", { kennung: d.kennung, klasa: "dg-buton--kryesor", laeuft }));
  if (d.statusi === "derguar") {
    b.push(buton("pranuar", "Pranuar", { kennung: d.kennung, klasa: "dg-buton--mire", laeuft }));
    b.push(buton("anuluar", "Anuluar", { kennung: d.kennung, klasa: "dg-buton--keq", laeuft }));
  }
  if (prituriKthim(d)) b.push(buton("kthe-depo", "E kthyem në depo", { kennung: d.kennung, klasa: "dg-buton--kryesor", laeuft }));
  if (heart && d.statusi === "pranuar" && !d.barazuarAt) b.push(buton("barazo", "Barazuar", { kennung: d.kennung, laeuft }));
  if (heart && mundTeKthehet(d)) b.push(buton("kthe", "↺ Kthe", { kennung: d.kennung, klasa: "dg-buton--lehte", laeuft, titull: "Hapin e fundit prapa" }));
  return b.join("");
}

function shenjat(d) {
  const s = [];
  if (d.statusi === "gati" && d.gatiAt) s.push(`Gati ${kohaSq(d.gatiAt)}`);
  if (d.statusi === "derguar" && d.derguarAt) s.push(`Dërguar ${kohaSq(d.derguarAt)}`);
  if (d.statusi === "pranuar" && d.pranuarAt) s.push(`Pranuar ${kohaSq(d.pranuarAt)}`);
  if (d.statusi === "anuluar" && d.anuluarAt) s.push(`Anuluar ${kohaSq(d.anuluarAt)}`);
  const etiketat = [];
  if (d.barazuarAt) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Barazuar ✓</span>`);
  if (d.ribaPaguarAt) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Riba paguar ✓</span>`);
  if (d.kthyerAt) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Në depo ✓</span>`);
  if (prituriKthim(d)) etiketat.push(`<span class="dg-etikete dg-etikete--keq">Pritje për kthim</span>`);
  if (!s.length && !etiketat.length) return "";
  return `<div class="dg-shenjat">${s.length ? `<small class="dg-koha">${esc(s.join(" · "))}</small>` : ""}${etiketat.join("")}</div>`;
}

export function renderListe(liste, chip, roli, laeuft = "") {
  const rreshtat = renditPerChip(liste, chip);
  if (!rreshtat.length) {
    const bosh = { porosi: "Asnjë porosi e re.", gati: "Asgjë gati për Beki.", derguar: "Asgjë në rrugë.", pranuar: "Ende asnjë e pranuar.", anuluar: "Asnjë e anuluar." }[chip];
    return `<p class="dg-bosh">${esc(bosh || "Asgjë.")}</p>`;
  }
  // AUFBAU "TICKET" (Konzept C, Wahl Inhaber 05.10.):
  //   Farbband oben = Stand (gelb Porosi, lila Gati, blau Dërguar, grün Pranuar, rot Anuluar)
  //   oben links    Posta Beki gross, oben rechts Fallnummer und Preis
  //   darunter      die Produkte in gleich breiten Feldern ("1× BPO")
  //   unten         die Knoepfe als buendige Leiste ueber die ganze Breite
  return rreshtat.map((d) => {
    const produkte = produkteNeDergesa(d.produkte);
    const butonat = butonatPer(d, roli, laeuft);
    return `
      <article class="dg-rresht dg-rresht--${esc(d.statusi)}" data-kennung="${esc(d.kennung)}">
        <div class="dg-rresht__brenda">
          <div class="dg-beki">
            <small>Posta Beki</small>
            <b>${esc(d.postaBeki || "—")}</b>
          </div>
          <div class="dg-rresht__djathtas">
            ${d.kodi ? `<span class="dg-kodi">#${esc(d.kodi)}</span>` : ""}
            <b class="dg-cmimi">${esc(euroSq(d.cmimi))}</b>
          </div>
          <ul class="dg-produkte">
            ${produkte.length ? produkte.map((p) => `<li><i>${p.sasia}×</i> ${esc(p.emri)}</li>`).join("") : `<li class="dg-bosh-produkte">Pa produkte</li>`}
          </ul>
          ${shenjat(d)}
        </div>
        ${butonat ? `<div class="dg-butonat">${butonat}</div>` : ""}
      </article>`;
  }).join("");
}

// DIE KARTEN OBEN (Wischen). Jede Karte laesst sich antippen - dann kommt
// ihre Liste mit Datum und Uhrzeit (renderDetajet, 06.10.).
const KARTAT = Object.freeze([
  Object.freeze({ id: "pritje-barazim", titull: "Pritje barazim" }),
  Object.freeze({ id: "barazuar", titull: "Barazuar" }),
  Object.freeze({ id: "pritje-riba", titull: "Pritje për Riben" }),
  Object.freeze({ id: "per-riba", titull: "€ për Riben" }),
  Object.freeze({ id: "paguar-riba", titull: "Paguar Ribës" }),
  // Ndepo an letzter Stelle (Wunsch Inhaber 06.10.).
  Object.freeze({ id: "ndepo", titull: "Ndepo" })
]);
export const KARTAT_ID = Object.freeze(KARTAT.map((k) => k.id));

const hapKarten = (id) => ` data-veprim="hap-karten" data-karta="${esc(id)}" role="button" tabindex="0" aria-haspopup="dialog"`;
const shiko = `<span class="dg-karte__shiko" aria-hidden="true">Lista ›</span>`;

function historia(grupet) {
  if (!grupet.length) return `<p class="dg-karte__pak">Ende asgjë.</p>`;
  return `<ul class="dg-historia">${grupet.slice(0, 3).map((g) => `
        <li><span>${esc(kohaSq(g.at))}</span><span>${g.numri} porosi</span><b>${esc(euroSq(g.shuma))}</b></li>`).join("")}</ul>`;
}

const produkteTekst = (rreshta) => rreshta.length ? rreshta.map((p) => `${p.sasia} ${p.emri}`).join(" · ") : "—";

const sasiSq = (n) => Number(n || 0).toLocaleString("de-DE");
const mlSq = (n) => `${sasiSq(n)} ml`;

// Was im Lager steht: Shishet, Stikerat, je Krem die ml (nach Abzug von
// allem Gepackten). Dazu die Anulime: fertige Produkte und was noch
// zurueckkommen muss.
function karteNdepo(depo, roli) {
  const heart = roli === "heart";
  const l = depo.lenda;
  const pllakat = l
    ? [["Shishe", sasiSq(l.shishe.mbetur), l.shishe.mbetur < 0],
      ["Stikera", sasiSq(l.stiker.mbetur), l.stiker.mbetur < 0],
      ...l.kremet.map((k) => [`Krem ${k.emri}`, mlSq(k.mbetur), k.mbetur < 0])]
    : [];
  return `
      <section class="dg-karte dg-karte--depo"${hapKarten("ndepo")}>
        <h2>Ndepo${shiko}</h2>
        ${pllakat.length ? `<ul class="dg-depo-sasi">${pllakat.map(([emri, vlera, minus]) => `<li${minus ? ` class="dg-depo-sasi--minus"` : ""}><b>${esc(vlera)}</b><span>${esc(emri)}</span></li>`).join("")}</ul>`
          : heart ? `<p class="dg-karte__pak">Shishet, stikerat dhe kremet nuk u lexuan nga Heart.</p>` : ""}
        <ul class="dg-ndarja">
          <li><span>Produkte të gatshme</span><span></span><b>${esc(produkteTekst(depo.gatshme.produkte))}</b></li>
          <li class="${depo.pritjeKthim.numri ? "dg-ndarja--keq" : ""}"><span>Anulime · pritje për kthim</span><span></span><b>${esc(produkteTekst(depo.pritjeKthim.produkte))}</b></li>
        </ul>
      </section>`;
}

export function renderKartat(liste, roli, laeuft = "", lenda = null) {
  const ll = llogarit(liste);
  const heart = roli === "heart";
  const pb = ll.pritjeBarazim;
  return `
      <section class="dg-karte"${hapKarten("pritje-barazim")}>
        <h2>Pritje barazim <small>Posta Beki</small>${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(pb.shuma))}</p>
        <p class="dg-karte__pak">${pb.numri} porosi · −2,50 € posta për porosi</p>
        <ul class="dg-ndarja">
          <li><span>Porosi të reja</span><span>${pb.reja.numri}</span><b>${esc(euroSq(pb.reja.shuma))}</b></li>
          <li><span>Dërguar (në rrugë)</span><span>${pb.neRruge.numri}</span><b>${esc(euroSq(pb.neRruge.shuma))}</b></li>
          <li><span>Pranuar (gati për barazim)</span><span>${pb.gati.numri}</span><b>${esc(euroSq(pb.gati.shuma))}</b></li>
        </ul>
        ${heart ? buton("barazo-te-gjitha", pb.gati.numri ? `Barazuar · ${pb.gati.numri} porosi · ${euroSq(pb.gati.shuma)}` : "Barazuar", {
          klasa: "dg-buton--kryesor dg-buton--gjere", laeuft: laeuft || (pb.gati.numri ? "" : "bosh") }) : ""}
      </section>

      <section class="dg-karte"${hapKarten("barazuar")}>
        <h2>Barazuar <small>Posta Beki</small>${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.barazuar.shuma))}</p>
        <p class="dg-karte__pak">${ll.barazuar.numri} porosi gjithsej</p>
        ${historia(ll.barazuar.grupet)}
      </section>

      <section class="dg-karte"${hapKarten("pritje-riba")}>
        <h2>Pritje për Riben${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.pritjeRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.pritjeRiba.numri} porosi të dërguara · 2 € për porosi</p>
      </section>

      <section class="dg-karte dg-karte--theksuar"${hapKarten("per-riba")}>
        <h2>€ për Riben${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.perRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.perRiba.numri} porosi të pranuara · 2 € për porosi</p>
        ${heart ? buton("paguaj-riben", ll.perRiba.numri ? `Paguar · ${ll.perRiba.numri} porosi · ${euroSq(ll.perRiba.shuma)}` : "Paguar", {
          klasa: "dg-buton--kryesor dg-buton--gjere", laeuft: laeuft || (ll.perRiba.numri ? "" : "bosh") }) : ""}
      </section>

      <section class="dg-karte"${hapKarten("paguar-riba")}>
        <h2>Paguar Ribës${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(ll.paguarRiba.shuma))}</p>
        <p class="dg-karte__pak">${ll.paguarRiba.numri} porosi gjithsej</p>
        ${historia(ll.paguarRiba.grupet)}
      </section>

      ${karteNdepo(llogaritDepon(liste, heart ? lenda : null), roli)}`;
}

// ── DIE LISTE ZU EINER KARTE (06.10.) ───────────────────────────────────
// Jede Zeile: Posta Beki, Fall, Produkte, alle Zeitpunkte mit Datum und
// Uhrzeit, rechts der Betrag. Auf dem Telefon von unten, sonst mittig.

const CHIP_EMRI = Object.fromEntries(STATUS_CHIPS.map((c) => [c.id, c.njejes]));

function kohet(d) {
  return [
    ["Porosi", d.createdAt], ["Gati", d.gatiAt], ["Dërguar", d.derguarAt], ["Pranuar", d.pranuarAt],
    ["Anuluar", d.anuluarAt], ["Kthyer në depo", d.kthyerAt], ["Barazuar", d.barazuarAt], ["Riba paguar", d.ribaPaguarAt]
  ].filter(([, at]) => at).map(([emri, at]) => `<li><span>${esc(emri)}</span><time datetime="${esc(at)}">${esc(kohaSqPlote(at))}</time></li>`).join("");
}

export function kohaSqPlote(iso) {
  const d = new Date(iso);
  if (!iso || !Number.isFinite(d.getTime())) return "";
  const dy = (n) => String(n).padStart(2, "0");
  return `${dy(d.getDate())}.${dy(d.getMonth() + 1)}.${d.getFullYear()} · ${dy(d.getHours())}:${dy(d.getMinutes())}`;
}

function rreshtDetaj(d, shuma = "", { butonat = "" } = {}) {
  const produkte = produkteNeDergesa(d.produkte);
  return `
          <li class="dg-detaj dg-detaj--${esc(d.statusi)}">
            <div class="dg-detaj__kreu">
              <div class="dg-detaj__beki"><small>Posta Beki</small><b>${esc(d.postaBeki || "—")}</b></div>
              <div class="dg-detaj__djathtas">
                ${shuma ? `<b>${esc(shuma)}</b>` : ""}
                <span class="dg-detaj__statusi dg-detaj__statusi--${esc(d.statusi)}">${esc(CHIP_EMRI[d.statusi] || d.statusi)}</span>
              </div>
            </div>
            <p class="dg-detaj__produkte">${d.kodi ? `<span>#${esc(d.kodi)}</span>` : ""}${produkte.length ? produkte.map((p) => `<span><i>${p.sasia}×</i> ${esc(p.emri)}</span>`).join("") : "<span>Pa produkte</span>"}</p>
            <ul class="dg-detaj__kohet">${kohet(d)}</ul>
            ${butonat ? `<div class="dg-detaj__butonat">${butonat}</div>` : ""}
          </li>`;
}

const listeOse = (rreshta, bosh) => rreshta.length ? `<ol class="dg-detajet">${rreshta.join("")}</ol>` : `<p class="dg-bosh">${esc(bosh)}</p>`;

function sipasGrupeve(lista, fusha, vlera) {
  const grupet = new Map();
  for (const d of lista) {
    const g = grupet.get(d[fusha]) || [];
    g.push(d);
    grupet.set(d[fusha], g);
  }
  return [...grupet.entries()].map(([at, l]) => `
        <section class="dg-grup">
          <h4><span>${esc(kohaSqPlote(at))}</span><span>${l.length} porosi</span><b>${esc(euroSq(l.reduce((s, d) => s + vlera(d), 0)))}</b></h4>
          <ol class="dg-detajet">${l.map((d) => rreshtDetaj(d, euroSq(vlera(d)))).join("")}</ol>
        </section>`).join("");
}

// Eine Zelle ist eine Zahl oder [Zahl, kleine Zeile darunter].
function tabelaRresht(emertimi, ...qelizat) {
  const [emri, njesia] = Array.isArray(emertimi) ? emertimi : [emertimi, ""];
  return `<tr><th scope="row">${esc(emri)}${njesia ? `<small>${esc(njesia)}</small>` : ""}</th>${qelizat.map((q) => (Array.isArray(q)
    ? `<td>${esc(q[0])}<small>${esc(q[1])}</small></td>` : `<td>${esc(q)}</td>`)).join("")}</tr>`;
}

function detajetNdepo(liste, roli, laeuft, lenda) {
  const heart = roli === "heart";
  const depo = llogaritDepon(liste, heart ? lenda : null);
  const pjeset = [];
  const l = depo.lenda;
  if (l) {
    pjeset.push(`
        <section class="dg-pjese">
          <h3>Gjendja në depo${l.updatedAt ? ` <small>sasitë e blera u ruajtën në Heart më ${esc(kohaSqPlote(l.updatedAt))}</small>` : ""}</h3>
          <div class="dg-tabela-mbajtes"><table class="dg-tabela">
            <thead><tr><th></th><th>Blerë</th><th>Dalë</th><th>Në depo</th></tr></thead>
            <tbody>
              ${tabelaRresht("Shishe", sasiSq(l.shishe.blere), `− ${sasiSq(l.shishe.dalur)}`, sasiSq(l.shishe.mbetur))}
              ${tabelaRresht("Stikera", sasiSq(l.stiker.blere), `− ${sasiSq(l.stiker.dalur)}`, sasiSq(l.stiker.mbetur))}
              ${l.kremet.map((k) => tabelaRresht([`Krem ${k.emri}`, "ml"], sasiSq(k.blere), `− ${sasiSq(k.dalur)}`, sasiSq(k.mbetur))).join("")}
            </tbody>
          </table></div>
          <p class="dg-pjese__shenim">Për çdo produkt të paketuar dalin nga depo 1 shishe, 1 stiker dhe ${esc(String(l.mbushja).replace(".", ","))} ml krem – te Gati, Dërguar, Pranuar dhe te anulimet e paketuara.</p>
        </section>`);
  } else if (heart) {
    pjeset.push(`<p class="dg-bosh">Shishet, stikerat dhe kremet nuk u lexuan nga Heart.</p>`);
  }
  pjeset.push(`
        <section class="dg-pjese">
          <h3>Produkte të gatshme <small>nga anulimet · ${esc(produkteTekst(depo.gatshme.produkte))}</small></h3>
          ${listeOse(depo.gatshme.lista.map((d) => rreshtDetaj(d)), "Asnjë produkt i gatshëm.")}
        </section>
        <section class="dg-pjese">
          <h3>Anulime · pritje për kthim <small>${esc(produkteTekst(depo.pritjeKthim.produkte))}</small></h3>
          ${listeOse(depo.pritjeKthim.lista.map((d) => rreshtDetaj(d, "", {
            butonat: buton("kthe-depo", "E kthyem në depo", { kennung: d.kennung, klasa: "dg-buton--kryesor dg-buton--gjere", laeuft })
          })), "Asgjë në pritje për kthim.")}
        </section>`);
  const nen = l ? `${sasiSq(l.shishe.mbetur)} shishe · ${sasiSq(l.stiker.mbetur)} stikera` : `Të gatshme: ${produkteTekst(depo.gatshme.produkte)}`;
  return { titull: "Ndepo", nen, trupi: pjeset.join("") };
}

export function renderDetajet(karta, liste, roli, laeuft = "", lenda = null) {
  const ll = llogarit(liste);
  const riba = () => DERGESA.ribaPerPorosi;
  let t;
  if (karta === "ndepo") t = detajetNdepo(liste, roli, laeuft, lenda);
  else if (karta === "pritje-barazim") {
    const pb = ll.pritjeBarazim;
    t = { titull: "Pritje barazim", nen: `${pb.numri} porosi · ${euroSq(pb.shuma)}`, trupi: `
        <section class="dg-pjese">
          <h3>Pranuar · gati për barazim <small>${pb.gati.numri} · ${esc(euroSq(pb.gati.shuma))}</small></h3>
          ${listeOse(pb.lista.filter((d) => d.statusi === "pranuar").map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))), "Asnjë.")}
        </section>
        <section class="dg-pjese">
          <h3>Dërguar · në rrugë <small>${pb.neRruge.numri} · ${esc(euroSq(pb.neRruge.shuma))}</small></h3>
          ${listeOse(pb.lista.filter((d) => d.statusi === "derguar").map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))), "Asnjë.")}
        </section>
        <section class="dg-pjese">
          <h3>Porosi të reja <small>${pb.reja.numri} · ${esc(euroSq(pb.reja.shuma))}</small></h3>
          ${listeOse(pb.lista.filter((d) => d.statusi === "porosi").map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))), "Asnjë.")}
        </section>` };
  } else if (karta === "barazuar") {
    t = { titull: "Barazuar", nen: `${ll.barazuar.numri} porosi · ${euroSq(ll.barazuar.shuma)}`,
      trupi: ll.barazuar.numri ? sipasGrupeve(ll.barazuar.lista, "barazuarAt", netoPosta) : `<p class="dg-bosh">Ende asgjë.</p>` };
  } else if (karta === "pritje-riba") {
    t = { titull: "Pritje për Riben", nen: `${ll.pritjeRiba.numri} porosi · ${euroSq(ll.pritjeRiba.shuma)}`,
      trupi: listeOse(ll.pritjeRiba.lista.map((d) => rreshtDetaj(d, euroSq(riba()))), "Asgjë në rrugë.") };
  } else if (karta === "per-riba") {
    t = { titull: "€ për Riben", nen: `${ll.perRiba.numri} porosi · ${euroSq(ll.perRiba.shuma)}`,
      trupi: listeOse(ll.perRiba.lista.map((d) => rreshtDetaj(d, euroSq(riba()))), "Asgjë për t'u paguar.") };
  } else if (karta === "paguar-riba") {
    t = { titull: "Paguar Ribës", nen: `${ll.paguarRiba.numri} porosi · ${euroSq(ll.paguarRiba.shuma)}`,
      trupi: ll.paguarRiba.numri ? sipasGrupeve(ll.paguarRiba.lista, "ribaPaguarAt", riba) : `<p class="dg-bosh">Ende asgjë.</p>` };
  } else return "";
  return `
    <div class="dg-flete__sfond" data-veprim="mbyll-karten"></div>
    <section class="dg-flete__panel" role="dialog" aria-modal="true" aria-labelledby="dg-flete-titull">
      <header class="dg-flete__kreu">
        <div><h2 id="dg-flete-titull">${esc(t.titull)}</h2><p>${esc(t.nen)}</p></div>
        <button type="button" class="dg-flete__mbyll" data-veprim="mbyll-karten" aria-label="Mbyll">×</button>
      </header>
      <div class="dg-flete__trupi">${t.trupi}</div>
    </section>`;
}
