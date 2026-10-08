// /dergesat - WAS GEZEICHNET WIRD (ohne Firebase, pruefbar ohne Browser:
// tests/lifeskin-dergesat.test.mjs). Regeln und Rechnung:
// shared/lifeskin-dergesat.js. Die Seite: dergesat.js.
//
// Rollen: "riba" (kadrija) und "heart" (der Inhaber mit seinem
// Heart-Zugang). Was nur der Inhaber darf - Barazuar, Riba ausbezahlt,
// Zuruecknehmen -, steht fuer Riba gar nicht erst da (firestore.rules
// wuerde es ohnehin abweisen).

import {
  CHIPS_DERGESAT, DERGESA, STATUS_CHIPS, KALIMET_RIBA, arsyejaPaGatshme, eGatshmeNeDepo, euroSq, fillimiPeriudhes, llogaritDepon, llogaritFinancen, mundTeKthehet,
  netoPasRibes, netoPosta, numeroPerChipDergesat, periudhat, prituriKthim, produkteNeDergesa, renditPerChipDergesat
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

// SECHS CHIPS IN EINER ZEILE (08.10.): Barazuar ist eigener Chip und
// zeigt nur die laufende Periode (prej).
export function renderChips(liste, aktiv, prej = "") {
  const numri = numeroPerChipDergesat(liste, prej);
  return CHIPS_DERGESAT.map((c) => `
      <button type="button" class="dg-chip${c.id === aktiv ? " dg-chip--aktiv" : ""}" data-veprim="chip" data-chip="${esc(c.id)}" aria-pressed="${c.id === aktiv ? "true" : "false"}">
        <span>${esc(c.label)}</span><b>${numri[c.id] || 0}</b>
      </button>`).join("");
}

// Welche fertigen Produkte (Anuluar im Lager) fuer diese Bestellung passen.
export function gatshmePer(d, liste) {
  return (liste || []).filter((g) => eGatshmeNeDepo(g) && !arsyejaPaGatshme(d, g));
}

function butonatPer(d, roli, laeuft, liste = []) {
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
  // Mit fertigen Produkten gepackt (08.10., nur Inhaber).
  if (heart && d.statusi !== "anuluar" && !d.ngaGatshme && gatshmePer(d, liste).length) {
    b.push(buton("nga-gatshme", "Të gatshme", { kennung: d.kennung, klasa: "dg-buton--lehte", laeuft, titull: "U paketua me produkte të gatshme nga depo" }));
  }
  if (heart && d.ngaGatshme) b.push(buton("hiq-gatshme", "Hiq gatshme", { kennung: d.kennung, klasa: "dg-buton--lehte", laeuft }));
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
  if (d.ngaGatshme) etiketat.push(`<span class="dg-etikete dg-etikete--mire">Me produkte të gatshme ✓</span>`);
  if (d.perdorurAt) etiketat.push(`<span class="dg-etikete">Përdorur për porosi tjetër</span>`);
  if (prituriKthim(d)) etiketat.push(`<span class="dg-etikete dg-etikete--keq">Pritje për kthim</span>`);
  if (!s.length && !etiketat.length) return "";
  return `<div class="dg-shenjat">${s.length ? `<small class="dg-koha">${esc(s.join(" · "))}</small>` : ""}${etiketat.join("")}</div>`;
}

export function renderListe(liste, chip, roli, laeuft = "", prej = "") {
  const rreshtat = renditPerChipDergesat(liste, chip, prej);
  if (!rreshtat.length) {
    const bosh = { porosi: "Asnjë porosi e re.", gati: "Asgjë gati për Beki.", derguar: "Asgjë në shpërndarje.", pranuar: "Asnjë e pranuar pa barazuar.",
      barazuar: "Asnjë e barazuar në këtë periudhë.", anuluar: "Asnjë e anuluar." }[chip];
    return `<p class="dg-bosh">${esc(bosh || "Asgjë.")}</p>`;
  }
  // AUFBAU "TICKET" (Konzept C, Wahl Inhaber 05.10.):
  //   Farbband oben = Stand (gelb Porosi, lila Gati, blau Dërguar, grün Pranuar, rot Anuluar)
  //   oben links    Posta Beki gross, oben rechts Fallnummer und Preis
  //   darunter      die Produkte in gleich breiten Feldern ("1× BPO")
  //   unten         die Knoepfe als buendige Leiste ueber die ganze Breite
  return rreshtat.map((d) => {
    const produkte = produkteNeDergesa(d.produkte);
    const butonat = butonatPer(d, roli, laeuft, liste);
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
// FINANCA (08.10., Inhaber): das Geld in der Reihenfolge, wie es fliesst -
// bei Posta Beki, in Kosovo, in Oesterreich. Dann Riba, dann Ndepo.
const KARTAT = Object.freeze([
  Object.freeze({ id: "financa", titull: "Financat" }),
  Object.freeze({ id: "kosova", titull: "Pare n'Kosovë" }),
  Object.freeze({ id: "austri", titull: "T'kryme n'Austri" }),
  // RIBA EINFACH (08.10.): was noch kommt, und was schon da ist.
  Object.freeze({ id: "per-riba", titull: "Për Riben" }),
  Object.freeze({ id: "riba-ngjep", titull: "Riba n'gjep" }),
  // Ndepo an letzter Stelle (Wunsch Inhaber 06.10.).
  Object.freeze({ id: "ndepo", titull: "Ndepo" })
]);
export const KARTAT_ID = Object.freeze(KARTAT.map((k) => k.id));
// Was sich sonst als Blatt oeffnen laesst: die Perioden (Kalender oben)
// und je abgeschlossene Periode ihre Zahlen ("periudha-<id>").
export const eFleteValide = (id) => KARTAT_ID.includes(id) || id === "periudhat" || /^periudha-[\w-]{1,80}$/.test(String(id || ""));

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

const shenjaSq = (n) => (!n ? euroSq(0) : n < 0 ? `− ${euroSq(-n)}` : `+ ${euroSq(n)}`);

const treRreshta = (t, emri3 = "Pranuar pa barazuar") => `
        <ul class="dg-ndarja">
          <li><span>Porosi të reja</span><span>${t.reja.numri}</span><b>${esc(euroSq(t.reja.shuma))}</b></li>
          <li><span>Në shpërndarje</span><span>${t.neShperndarje.numri}</span><b>${esc(euroSq(t.neShperndarje.shuma))}</b></li>
          <li><span>${esc(emri3)}</span><span>${t.paBarazuar.numri}</span><b>${esc(euroSq(t.paBarazuar.shuma))}</b></li>
        </ul>`;

export function renderKartat(liste, roli, _laeuft = "", lenda = null, { levizjet = [] } = {}) {
  const fin = llogaritFinancen(liste, levizjet);
  const heart = roli === "heart";
  const f = fin.financa;
  const k = fin.kosova;
  const a = fin.austri;
  const pr = fin.perRiba;
  const rn = fin.ribaNgjep;
  return `
      <section class="dg-karte dg-karte--financa"${hapKarten("financa")}>
        <h2>Financat <small>Posta e minusuar</small>${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(f.shuma))}</p>
        <p class="dg-karte__pak">Total ${f.numri} porosi</p>
        ${treRreshta(f)}
      </section>

      <section class="dg-karte dg-karte--financa"${hapKarten("kosova")}>
        <h2>Pare n'Kosovë <small>në shpi</small>${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(k.shuma))}</p>
        <p class="dg-karte__pak">${k.paDerguar.numri} barazime pa dërguar në Austri</p>
        <ul class="dg-ndarja">
          ${k.bartur ? `<li><span>Bartur</span><span></span><b>${esc(shenjaSq(k.bartur))}</b></li>` : ""}
          <li><span>Barazuar</span><span>${k.barazuar.numri}</span><b>${esc(shenjaSq(k.barazuar.shuma))}</b></li>
          <li><span>Riba · 2 € për porosi</span><span>${k.riba.numri}</span><b>${esc(shenjaSq(-k.riba.shuma))}</b></li>
          ${k.shtesa.numri ? `<li><span>Shtesa / shpenzime</span><span>${k.shtesa.numri}</span><b>${esc(shenjaSq(k.shtesa.shuma))}</b></li>` : ""}
          <li><span>Dërguar në Austri</span><span>${k.austri.numri}</span><b>${esc(shenjaSq(-k.austri.shuma))}</b></li>
        </ul>
      </section>

      <section class="dg-karte dg-karte--financa"${hapKarten("austri")}>
        <h2>T'kryme n'Austri${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(a.neto))}</p>
        <p class="dg-karte__pak">${a.numri} dërgesa · − ${esc(euroSq(a.wu))} WU</p>
        ${a.numri ? `<ul class="dg-historia">${a.lista.slice(0, 3).map((t) => `
          <li><span>${esc(kohaSq(t.at))}</span><span>${t.kennungen.length} porosi</span><b>${esc(euroSq(t.neto))}</b></li>`).join("")}</ul>`
          : `<p class="dg-karte__pak">Ende asgjë.</p>`}
      </section>

      <section class="dg-karte dg-karte--financa"${hapKarten("per-riba")}>
        <h2>Për Riben <small>2 € për porosi</small>${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(pr.shuma))}</p>
        <p class="dg-karte__pak">Total ${pr.numri} porosi</p>
        ${treRreshta(pr)}
      </section>

      <section class="dg-karte dg-karte--financa dg-karte--theksuar"${hapKarten("riba-ngjep")}>
        <h2>Riba n'gjep${shiko}</h2>
        <p class="dg-karte__shuma">${esc(euroSq(rn.shuma))}</p>
        <p class="dg-karte__pak">${rn.numri} porosi të barazuara · 2 € për porosi</p>
        ${historia(rn.grupet)}
      </section>

      ${karteNdepo(llogaritDepon(liste, heart ? lenda : null), roli)}`;
}

// ── FINANCA-LISTEN (08.10.) ────────────────────────────────────────────
// Haekchen, Betraege und Gruende tippt nur der Inhaber; Riba sieht
// dieselben Listen ohne Knoepfe (firestore.rules wuerde es abweisen).
const zgjidhje = (d, zgjedhur) => `<label class="dg-zgjidh"><input type="checkbox" data-veprim="zgjidh" data-kennung="${esc(d.kennung)}"${zgjedhur.has(d.kennung) ? " checked" : ""} aria-label="Zgjidh ${esc(d.postaBeki || d.kodi || "porosinë")}"></label>`;

function rreshtMeZgjedhje(d, shuma, heart, zgjedhur) {
  const html = rreshtDetaj(d, shuma);
  return heart ? html.replace('<li class="dg-detaj', `<li data-zgjedhur="${zgjedhur.has(d.kennung) ? "po" : "jo"}" class="dg-detaj dg-detaj--me-zgjedhje`).replace('<div class="dg-detaj__kreu">', `<div class="dg-detaj__kreu">${zgjidhje(d, zgjedhur)}`) : html;
}

function detajetFinanca(fin, roli, laeuft, zgjedhur) {
  const heart = roli === "heart";
  const f = fin.financa;
  const zgj = f.paBarazuar.lista.filter((d) => zgjedhur.has(d.kennung));
  const shumaZgj = zgj.reduce((s, d) => s + netoPosta(d), 0);
  const veprim = heart && f.paBarazuar.numri ? `
        <div class="dg-veprim">
          <button type="button" class="dg-buton dg-buton--lehte" data-veprim="zgjidh-te-gjitha" data-grupi="pranuar">${zgj.length === f.paBarazuar.numri ? "Hiq të gjitha" : "Zgjidh të gjitha"}</button>
          ${buton("barazo-zgjedhur", zgj.length ? `Barazo · ${zgj.length} porosi · ${euroSq(shumaZgj)}` : "Barazo", {
            klasa: "dg-buton--kryesor", laeuft: laeuft || (zgj.length ? "" : "bosh") })}
        </div>` : "";
  return { titull: "Financat", nen: `Total ${f.numri} porosi · ${euroSq(f.shuma)} · posta e minusuar`, trupi: `
        <section class="dg-pjese">
          <h3>Pranuar pa barazuar <small>${f.paBarazuar.numri} · ${esc(euroSq(f.paBarazuar.shuma))}</small></h3>
          ${listeOse(f.paBarazuar.lista.map((d) => rreshtMeZgjedhje(d, euroSq(netoPosta(d)), heart, zgjedhur)), "Asnjë.")}
          ${veprim}
        </section>
        <section class="dg-pjese">
          <h3>Në shpërndarje <small>${f.neShperndarje.numri} · ${esc(euroSq(f.neShperndarje.shuma))}</small></h3>
          ${listeOse(f.neShperndarje.lista.map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))), "Asnjë.")}
        </section>
        <section class="dg-pjese">
          <h3>Porosi të reja <small>${f.reja.numri} · ${esc(euroSq(f.reja.shuma))}</small></h3>
          ${listeOse(f.reja.lista.map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))), "Asnjë.")}
        </section>` };
}

function detajetKosova(fin, roli, laeuft, zgjedhur) {
  const heart = roli === "heart";
  const k = fin.kosova;
  const zgj = k.paDerguar.lista.filter((d) => zgjedhur.has(d.kennung));
  const propozim = zgj.reduce((s, d) => s + netoPasRibes(d), 0);
  const leviz = k.shtesa.lista.map((l) => `
            <li class="dg-levizje">
              <span><b>${esc(l.arsyeja)}</b><small>${esc(kohaSqPlote(l.at))}</small></span>
              <b class="${l.shuma < 0 ? "dg-minus" : "dg-plus"}">${esc(shenjaSq(l.shuma))}</b>
              ${heart ? `<button type="button" class="dg-levizje__fshi" data-veprim="fshi-levizje" data-id="${esc(l.id)}" aria-label="Fshi">×</button>` : ""}
            </li>`).join("");
  const grupet = (lista, emri, shenja) => lista.map((g) => `
            <li class="dg-levizje">
              <span><b>${esc(emri)} · ${g.numri} porosi</b><small>${esc(kohaSqPlote(g.at))}</small></span>
              <b class="${shenja < 0 ? "dg-minus" : "dg-plus"}">${esc(shenjaSq(shenja * g.shuma))}</b>
            </li>`).join("");
  return { titull: "Pare n'Kosovë", nen: `Në shpi: ${euroSq(k.shuma)}${fin.periudha.prej ? ` · që nga ${kohaSq(fin.periudha.prej)}` : ""}`, trupi: `
        ${heart ? `
        <section class="dg-pjese">
          <h3>Shto / hiq <small>p.sh. −20 për shpenzime</small></h3>
          <form class="dg-forma-financa" data-forma="levizje" autocomplete="off">
            <input name="shuma" data-ruaj="levizje-shuma" inputmode="decimal" placeholder="Shuma (+ / −)" aria-label="Shuma">
            <input name="arsyeja" data-ruaj="levizje-arsyeja" maxlength="160" placeholder="Arsyeja" aria-label="Arsyeja">
            <button type="submit" class="dg-buton dg-buton--kryesor"${laeuft ? " disabled" : ""}>+ Shto</button>
          </form>
        </section>` : ""}
        <section class="dg-pjese">
          <h3>Pa dërguar në Austri <small>${k.paDerguar.numri} · ${esc(euroSq(k.paDerguar.shuma))}</small></h3>
          ${listeOse(k.paDerguar.lista.map((d) => rreshtMeZgjedhje(d, euroSq(netoPosta(d)), heart, zgjedhur)), "Të gjitha barazimet janë dërguar.")}
          ${heart && k.paDerguar.numri ? `
          <div class="dg-veprim">
            <button type="button" class="dg-buton dg-buton--lehte" data-veprim="zgjidh-te-gjitha" data-grupi="kosova">${zgj.length === k.paDerguar.numri ? "Hiq të gjitha" : "Zgjidh të gjitha"}</button>
          </div>
          <form class="dg-forma-financa dg-forma-financa--austri" data-forma="austri" autocomplete="off">
            <label><span>Shuma që dërgon</span><input name="bruto" data-ruaj="austri-bruto" data-propozim="${esc(String(propozim).replace(".", ","))}" inputmode="decimal" placeholder="${esc(euroSq(propozim))}" aria-label="Shuma që dërgon"></label>
            <label><span>WU tarifa</span><input name="wu" data-ruaj="austri-wu" inputmode="decimal" placeholder="p.sh. 8,50" aria-label="Western Union tarifa"></label>
            <button type="submit" class="dg-buton dg-buton--kryesor"${laeuft || !zgj.length ? " disabled" : ""}>${zgj.length ? `Dërgo në Austri · ${zgj.length} porosi` : "Zgjidh barazimet"}</button>
            <small>Propozim: ${esc(euroSq(propozim))} (pa postën dhe pa 2 € për Riben)</small>
          </form>` : ""}
        </section>
        <section class="dg-pjese">
          <h3>Lëvizjet</h3>
          <ul class="dg-levizjet">
            ${leviz}
            ${grupet(k.barazuar.grupet, "Barazuar", 1)}
            ${grupet(fin.ribaNgjep.grupet, "Riba", -1)}
            ${k.bartur ? `
            <li class="dg-levizje">
              <span><b>Bartur nga periudha e kaluar</b><small>${esc(kohaSqPlote(fin.periudha.prej))}</small></span>
              <b class="${k.bartur < 0 ? "dg-minus" : "dg-plus"}">${esc(shenjaSq(k.bartur))}</b>
            </li>` : ""}
            ${fin.austri.lista.map((t) => `
            <li class="dg-levizje">
              <span><b>Dërguar në Austri · ${t.kennungen.length} porosi</b><small>${esc(kohaSqPlote(t.at))}</small></span>
              <b class="dg-minus">${esc(shenjaSq(-t.bruto))}</b>
            </li>`).join("")}
          </ul>
        </section>` };
}

function detajetAustri(fin, liste) {
  const a = fin.austri;
  const sipasKennung = new Map((liste || []).map((d) => [d.kennung, d]));
  const trupi = a.numri ? a.lista.map((t) => `
        <section class="dg-grup dg-transfer">
          <h4><span>${esc(kohaSqPlote(t.at))}</span><span>${t.kennungen.length} porosi</span><b>${esc(euroSq(t.neto))}</b></h4>
          <ul class="dg-transfer__llogari">
            <li><span>Dërguar</span><b>${esc(euroSq(t.bruto))}</b></li>
            <li><span>WU tarifa</span><b class="dg-minus">− ${esc(euroSq(t.wu))}</b></li>
            <li class="dg-transfer__neto"><span>Ardhur në Austri</span><b>${esc(euroSq(t.neto))}</b></li>
          </ul>
          ${t.shenim ? `<p class="dg-pjese__shenim">${esc(t.shenim)}</p>` : ""}
          <ol class="dg-detajet">${t.kennungen.map((k) => sipasKennung.get(k)).filter(Boolean).map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))).join("")}</ol>
        </section>`).join("") : `<p class="dg-bosh">Ende asgjë.</p>`;
  return { titull: "T'kryme n'Austri", nen: `${a.numri} dërgesa · ${euroSq(a.bruto)} − ${euroSq(a.wu)} WU = ${euroSq(a.neto)}`, trupi };
}

// ── DIE LISTE ZU EINER KARTE (06.10.) ───────────────────────────────────
// Jede Zeile: Posta Beki, Fall, Produkte, alle Zeitpunkte mit Datum und
// Uhrzeit, rechts der Betrag. Auf dem Telefon von unten, sonst mittig.

const CHIP_EMRI = Object.fromEntries(STATUS_CHIPS.map((c) => [c.id, c.njejes]));

function kohet(d) {
  return [
    ["Porosi", d.createdAt], ["Gati", d.gatiAt], ["Dërguar", d.derguarAt], ["Pranuar", d.pranuarAt],
    ["Anuluar", d.anuluarAt], ["Kthyer në depo", d.kthyerAt], ["Përdorur për porosi tjetër", d.perdorurAt], ["Barazuar", d.barazuarAt], ["Riba paguar", d.ribaPaguarAt]
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
          <p class="dg-pjese__shenim">Për çdo produkt të paketuar dalin nga depo 1 shishe, 1 stiker dhe ${esc(String(l.mbushja).replace(".", ","))} ml krem – te Gati, Dërguar, Pranuar dhe te anulimet e paketuara. Kur porosia paketohet me produkte të gatshme, për to nuk del material i ri.</p>
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

function detajetPerRiba(fin) {
  const r = fin.perRiba;
  const riba = euroSq(DERGESA.ribaPerPorosi);
  const pjese = (emri, t) => `
        <section class="dg-pjese">
          <h3>${esc(emri)} <small>${t.numri} · ${esc(euroSq(t.shuma))}</small></h3>
          ${listeOse(t.lista.map((d) => rreshtDetaj(d, riba)), "Asnjë.")}
        </section>`;
  return { titull: "Për Riben", nen: `Total ${r.numri} porosi · ${euroSq(r.shuma)} · 2 € për porosi`,
    trupi: pjese("Pranuar pa barazuar", r.paBarazuar) + pjese("Në shpërndarje", r.neShperndarje) + pjese("Porosi të reja", r.reja) };
}

// DIE PERIODEN (Kalender oben, 08.10.): die laufende mit "Mbyll periudhën"
// (nur Inhaber), darunter jede abgeschlossene zum Antippen.
const permbledhje = (fin) => [
  ["Barazuar", `${fin.kosova.barazuar.numri} porosi · ${euroSq(fin.kosova.barazuar.shuma)}`],
  ["Riba", `− ${euroSq(fin.ribaNgjep.shuma)}`],
  ["Shtesa / shpenzime", shenjaSq(fin.kosova.shtesa.shuma)],
  ["Dërguar në Austri", `${euroSq(fin.austri.bruto)} − ${euroSq(fin.austri.wu)} WU`],
  ["Ardhur në Austri", euroSq(fin.austri.neto)],
  ["Mbetur në Kosovë", euroSq(fin.kosova.shuma)]
];

const tabelaPermbledhje = (fin) => `
          <ul class="dg-transfer__llogari dg-permbledhje">${permbledhje(fin).map(([e, v], i, l) => `
            <li${i === l.length - 1 ? ' class="dg-transfer__neto"' : ""}><span>${esc(e)}</span><b>${esc(v)}</b></li>`).join("")}
          </ul>`;

const dataSot = (iso = new Date().toISOString()) => {
  const d = new Date(iso);
  const dy = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dy(d.getMonth() + 1)}-${dy(d.getDate())}`;
};

function detajetPeriudhat(liste, levizjet, roli, laeuft) {
  const heart = roli === "heart";
  const prej = fillimiPeriudhes(levizjet);
  const tani = llogaritFinancen(liste, levizjet);
  const mbyllura = periudhat(levizjet).slice().reverse();
  const minDita = prej ? dataSot(prej) : "";
  return { titull: "Periudhat", nen: prej ? `Periudha aktuale që nga ${kohaSqPlote(prej)}` : "Periudha aktuale që nga fillimi", trupi: `
        <section class="dg-pjese">
          <h3>Periudha aktuale <small>${esc(prej ? `${kohaSq(prej)} – sot` : "nga fillimi – sot")}</small></h3>
          ${tabelaPermbledhje(tani)}
          ${heart ? `
          <form class="dg-forma-financa dg-forma-financa--austri" data-forma="mbyllje" autocomplete="off">
            <label><span>Prej</span><input value="${esc(prej ? kohaSq(prej) : "Fillimi")}" disabled aria-label="Prej"></label>
            <label><span>Deri</span><input type="date" name="deri" data-ruaj="mbyllje-deri" value="${esc(dataSot())}" max="${esc(dataSot())}"${minDita ? ` min="${esc(minDita)}"` : ""} aria-label="Deri"></label>
            <button type="submit" class="dg-buton dg-buton--kryesor"${laeuft ? " disabled" : ""}>Mbyll periudhën</button>
            <small>Pas mbylljes kartat nisin nga 0. Paret që mbeten në Kosovë kalojnë si „Bartur“. Porositë që janë ende në rrugë mbeten.</small>
          </form>` : ""}
        </section>
        <section class="dg-pjese">
          <h3>Të mbyllura <small>${mbyllura.length}</small></h3>
          ${mbyllura.length ? `<ul class="dg-levizjet">${mbyllura.map((m, i) => {
            const f = llogaritFinancen(liste, levizjet, { periudha: m });
            return `
            <li class="dg-levizje dg-levizje--periudha" data-veprim="hap-karten" data-karta="periudha-${esc(m.id)}" role="button" tabindex="0">
              <span><b>${esc(m.prej ? kohaSq(m.prej) : "Fillimi")} – ${esc(kohaSq(m.deri))}</b><small>${f.kosova.barazuar.numri} barazime · ardhur ${esc(euroSq(f.austri.neto))}</small></span>
              <b>${esc(euroSq(f.austri.neto))}</b>
              ${heart && i === 0 ? `<button type="button" class="dg-levizje__fshi" data-veprim="hap-periudhen" data-id="${esc(m.id)}" aria-label="Hape përsëri" title="Hape përsëri">↺</button>` : '<span class="dg-shigjeta" aria-hidden="true">›</span>'}
            </li>`;
          }).join("")}</ul>` : `<p class="dg-bosh">Ende asnjë periudhë e mbyllur.</p>`}
        </section>` };
}

function detajetPeriudha(liste, levizjet, id) {
  const m = periudhat(levizjet).find((x) => x.id === id);
  if (!m) return null;
  const f = llogaritFinancen(liste, levizjet, { periudha: m });
  const sipasKennung = new Map((liste || []).map((d) => [d.kennung, d]));
  return { titull: `${m.prej ? kohaSq(m.prej) : "Fillimi"} – ${kohaSq(m.deri)}`, nen: "Periudhë e mbyllur", trupi: `
        <section class="dg-pjese">
          <h3>Përmbledhje</h3>
          ${tabelaPermbledhje(f)}
        </section>
        <section class="dg-pjese">
          <h3>Dërguar në Austri <small>${f.austri.numri}</small></h3>
          ${f.austri.numri ? f.austri.lista.map((t) => `
          <section class="dg-grup dg-transfer">
            <h4><span>${esc(kohaSqPlote(t.at))}</span><span>${t.kennungen.length} porosi</span><b>${esc(euroSq(t.neto))}</b></h4>
            <ul class="dg-transfer__llogari">
              <li><span>Dërguar</span><b>${esc(euroSq(t.bruto))}</b></li>
              <li><span>WU tarifa</span><b class="dg-minus">− ${esc(euroSq(t.wu))}</b></li>
              <li class="dg-transfer__neto"><span>Ardhur në Austri</span><b>${esc(euroSq(t.neto))}</b></li>
            </ul>
            <ol class="dg-detajet">${t.kennungen.map((k) => sipasKennung.get(k)).filter(Boolean).map((d) => rreshtDetaj(d, euroSq(netoPosta(d)))).join("")}</ol>
          </section>`).join("") : `<p class="dg-bosh">Asgjë.</p>`}
        </section>
        <section class="dg-pjese">
          <h3>Barazuar <small>${f.kosova.barazuar.numri} · ${esc(euroSq(f.kosova.barazuar.shuma))}</small></h3>
          ${f.kosova.barazuar.numri ? sipasGrupeve(f.kosova.barazuar.lista, "barazuarAt", netoPosta) : `<p class="dg-bosh">Asgjë.</p>`}
        </section>
        ${f.kosova.shtesa.numri ? `
        <section class="dg-pjese">
          <h3>Shtesa / shpenzime <small>${esc(shenjaSq(f.kosova.shtesa.shuma))}</small></h3>
          <ul class="dg-levizjet">${f.kosova.shtesa.lista.map((l) => `
            <li class="dg-levizje"><span><b>${esc(l.arsyeja)}</b><small>${esc(kohaSqPlote(l.at))}</small></span><b class="${l.shuma < 0 ? "dg-minus" : "dg-plus"}">${esc(shenjaSq(l.shuma))}</b></li>`).join("")}</ul>
        </section>` : ""}` };
}

export function renderDetajet(karta, liste, roli, laeuft = "", lenda = null, { levizjet = [], zgjedhur = new Set() } = {}) {
  const fin = llogaritFinancen(liste, levizjet);
  const riba = () => DERGESA.ribaPerPorosi;
  let t;
  if (karta === "ndepo") t = detajetNdepo(liste, roli, laeuft, lenda);
  else if (karta === "financa") t = detajetFinanca(fin, roli, laeuft, zgjedhur);
  else if (karta === "kosova") t = detajetKosova(fin, roli, laeuft, zgjedhur);
  else if (karta === "austri") t = detajetAustri(fin, liste);
  else if (karta === "per-riba") t = detajetPerRiba(fin);
  else if (karta === "riba-ngjep") {
    t = { titull: "Riba n'gjep", nen: `${fin.ribaNgjep.numri} porosi · ${euroSq(fin.ribaNgjep.shuma)}`,
      trupi: fin.ribaNgjep.numri ? sipasGrupeve(fin.ribaNgjep.lista, "barazuarAt", riba) : `<p class="dg-bosh">Ende asgjë në këtë periudhë.</p>` };
  } else if (karta === "periudhat") t = detajetPeriudhat(liste, levizjet, roli, laeuft);
  else if (String(karta).startsWith("periudha-")) t = detajetPeriudha(liste, levizjet, String(karta).slice(9));
  if (!t) return "";
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
