import { skinreactErgebnis } from "../../shared/lifeskin-skinreact.js";

export function firestoreWert(wert) {
  if (!wert || typeof wert !== "object") return null;
  if ("stringValue" in wert) return wert.stringValue;
  if ("integerValue" in wert) return Number(wert.integerValue);
  if ("booleanValue" in wert) return wert.booleanValue;
  if (wert.mapValue) return Object.fromEntries(Object.entries(wert.mapValue.fields || {}).map(([k, v]) => [k, firestoreWert(v)]));
  return null;
}
export function berichtAusRest(daten) {
  return Object.fromEntries(Object.entries(daten?.fields || {}).map(([k, v]) => [k, firestoreWert(v)]));
}

function ergebnisSchritte(fertig = false) {
  return `<ol class="sr-steps" aria-label="Hapat e skanimit"><li data-step="done">Skanimi</li><li data-step="${fertig ? "done" : "current"}" ${fertig ? "" : 'aria-current="step"'}>Kontrolli</li><li data-step="${fertig ? "current" : "next"}" ${fertig ? 'aria-current="step"' : ""}>Rezultati</li></ol>`;
}
function bereichZiffern(bereich) {
  return `<span>${bereich.min}</span><span class="sr-range-dash">–</span><span>${bereich.max}</span><span class="sr-range-percent">%</span>`;
}

function shopPreise(dokument) {
  const preis = (art) => {
    const text = dokument?.querySelector?.(`[data-preis="${art}"]`)?.textContent || "";
    const zahl = Number(text.replace("€", "").trim().replace(",", "."));
    return Number.isFinite(zahl) && zahl > 0 ? zahl : null;
  };
  return { cmimi: preis("cmimi"), vecmas: preis("vecmas") };
}

function ergebnisKarte(bereich, preise = {}, reserve = false) {
  const pershtatet = bereich.min >= 60;
  const angebot = pershtatet ? `<div class="sr-offer">${preise.cmimi ? `<strong data-preis="cmimi">${preise.cmimi} €</strong>` : ""}${preise.vecmas > preise.cmimi && preise.cmimi ? `<del data-preis="vecmas" data-preis-zbritje>${preise.vecmas} €</del>` : ""}<span>Dergesa falas</span></div>` : "";
  return `<div class="sr-result sr-result--ready${reserve ? " sr-result--reserve" : ""}"><div class="sr-result__top"><div class="sr-result__heading"><span class="sr-result__eyebrow">REZULTATI YT</span>${pershtatet ? '<svg class="sr-result__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>' : ""}</div><div class="sr-match"><div class="sr-result__range" aria-label="${bereich.text}">${bereichZiffern(bereich)}</div><span>Pershtatja me Acne Duo</span></div><h3>${pershtatet ? "Rutina jote me Acne Duo." : "Lekura jote meriton nje plan personal."}</h3></div><div class="sr-result__body">${pershtatet ? '<p>Trajtim + hidratim. Dy hapa te thjeshte.</p><div class="sr-result__products"><div class="sr-result__product"><strong>01 / LF ACNE</strong><span>Trajton pucrrat.</span><figure><img src="/apps/lifeskin-shop/assets/lf-acne-3.jpg" width="600" height="750" alt="LifeSkin LF ACNE" decoding="async"></figure></div><div class="sr-result__product"><strong>02 / LF MOISTUR</strong><span>Hidraton lekuren.</span><figure><img src="/apps/lifeskin-shop/assets/lf-moistur.jpg" width="750" height="1000" alt="LifeSkin LF MOISTUR" decoding="async"></figure></div></div>' : '<p>Kerko nje rekomandim personal para se ta zgjedhesh setin.</p>'}${angebot}${pershtatet ? '<button type="button" class="sr-order">Porosit Acne Duo</button><p class="sr-result__trust">Pagesa te dera · 45 dite garanci</p>' : '<a class="sr-order" href="https://wa.me/436508564879">Merr nje rekomandim personal</a>'}<p class="sr-result__note">Vleresim orientues nga fotot, jo garanci rezultati.</p></div></div>`;
}

// Inert, invisible content sizes the shared grid cell before any camera starts.
// It is never a displayed assessment; released reports still own the real result.
export function skinreactPlatzReservieren(dokument) {
  const workspace = dokument?.getElementById?.("zgjedhja")?.querySelector?.(".sr-workspace");
  if (!workspace?.querySelector || workspace.querySelector("[data-sr-reserve]")) return;
  const reserve = dokument.createElement("div");
  reserve.setAttribute("data-sr-reserve", "");
  reserve.setAttribute("aria-hidden", "true");
  reserve.setAttribute("inert", "");
  reserve.innerHTML = ergebnisKarte({ min: 95, max: 100, text: "95–100%" }, shopPreise(dokument), true);
  workspace.append(reserve);
}

// One request at a time. Reads the original report; no random / cached diagnosis.
export class SkinreactErgebnis {
  constructor({ sitzung, wurzel, kaufen, holen = (...args) => globalThis.fetch(...args), intervall = 2000 }) {
    Object.assign(this, { sitzung, wurzel, kaufen, holen, intervall });
    this.aktiv = false;
  }
  start() {
    if (!this.wurzel || this.aktiv) return;
    this.aktiv = true;
    this.beginn = Date.now();
    this.vorbereiten();
    this.pruefen();
  }
  vorbereiten() {
    if (!this.wurzel) return;
    this.wurzel.innerHTML = `<div class="sr-result sr-result--pending"><div class="sr-complete" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"/></svg><strong>Skanimi u kry.</strong></div>${ergebnisSchritte()}<div class="sr-processing" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="8" width="26" height="32" rx="5"/><path d="M17 18h14m-14 6h14m-14 6h8"/></svg></div><h3>Edhe pak.</h3><p data-sr-status role="status" aria-live="polite">Rezultati shfaqet ketu sapo te perfundoje kontrolli.</p><div class="sr-processing__track" aria-hidden="true"><span></span></div></div>`;
  }
  stop() { this.aktiv = false; clearTimeout(this.takt); this.abbruch?.abort(); }
  async pruefen() {
    if (!this.aktiv) return;
    this.abbruch = new AbortController();
    const frist = setTimeout(() => this.abbruch.abort(), 10000);
    try {
      const antwort = await this.holen(this.sitzung.berichtPfadVoll, { cache: "no-store", signal: this.abbruch.signal });
      if (!antwort.ok) throw new Error("connection");
      const bereich = skinreactErgebnis(berichtAusRest(await antwort.json()));
      if (!this.aktiv) return;
      if (bereich) {
        if (this.angezeigt !== bereich.id) this.anzeigen(bereich);
        if (this.aktiv) this.takt = setTimeout(() => this.pruefen(), this.intervall);
        return;
      }
      const status = this.wurzel.querySelector("[data-sr-status]");
      if (status) status.textContent = Date.now() - this.beginn > 30000
        ? "Kontrolli po vazhdon. Rezultati shfaqet ketu sapo te jete gati."
        : "Rezultati shfaqet ketu sapo te perfundoje kontrolli.";
    } catch {
      if (!this.aktiv) return;
      const status = this.wurzel.querySelector("[data-sr-status]");
      if (status) status.textContent = "Lidhja u ndërpre. Po provojmë përsëri; skanimi yt është ruajtur.";
    } finally { clearTimeout(frist); }
    if (this.aktiv) this.takt = setTimeout(() => this.pruefen(), this.intervall);
  }
  anzeigen(bereich) {
    this.angezeigt = bereich.id;
    this.sitzung.ergaenze?.({ berichtGeoeffnet: true });
    const pershtatet = bereich.min >= 60;
    this.wurzel.innerHTML = ergebnisKarte(bereich, shopPreise(this.wurzel.ownerDocument));
    this.wurzel.querySelector(".sr-order")?.addEventListener("click", () => { if (pershtatet) { this.stop(); this.kaufen(); } });
  }
}

// Reuse the original DOM/video/canvases in place; never start a second scanner.
export function skinreactEinbetten(dokument, name) {
  const sektion = dokument?.getElementById?.("zgjedhja");
  if (!sektion) return null;
  skinreactPlatzReservieren(dokument);
  let platz = sektion.querySelector("[data-sr-live]");
  if (!platz) {
    platz = dokument.createElement("div");
    platz.setAttribute("data-sr-live", "");
    const vorschau = sektion.querySelector(".sr-stage");
    vorschau?.append(platz);
    vorschau?.removeAttribute?.("aria-hidden");
    for (const id of ["ls-kamera", "ls-analyse"]) {
      const schirm = dokument.getElementById(id);
      if (schirm) platz.append(schirm);
    }
  }
  const inline = name === "kamera" || name === "analyse";
  sektion.dataset.srState = inline ? name : "idle";
  const start = dokument.getElementById("ls-start");
  if (start) {
    if (!start.dataset.srOriginal) start.dataset.srOriginal = start.innerHTML;
    start.innerHTML = name === "kamera" ? "Anulo skanimin" : start.dataset.srOriginal;
    // Invisible analysis controls still reserve their original geometry.
    start.hidden = false;
    start.disabled = name === "analyse";
  }
  return { platz, inline };
}
