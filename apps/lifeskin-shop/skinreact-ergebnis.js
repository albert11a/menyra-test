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
    this.wurzel.innerHTML = `<div class="sr-result"><p class="sr-result__eyebrow">SKINREACT</p><div class="sr-pending" aria-hidden="true"></div><h1>Po kontrollohet skanimi yt.</h1><p data-sr-status role="status" aria-live="polite">Rezultati shfaqet këtu sapo të përfundojë kontrolli.</p><button type="button" class="sr-back">Vazhdo në faqe</button></div>`;
    this.wurzel.querySelector(".sr-back").addEventListener("click", () => {
      this.stop();
      globalThis.__lifeskinTrichter?.zeige("einstieg");
    });
    this.pruefen();
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
        ? "Kontrolli ende nuk ka përfunduar. Mund të vazhdosh në faqe dhe ta hapësh sërish skanimin për rezultatin."
        : "Rezultati shfaqet këtu sapo të përfundojë kontrolli.";
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
    this.wurzel.innerHTML = `<div class="sr-result"><p class="sr-result__eyebrow">SKINREACT · REZULTATI YT</p><h1>Përshtatja e vlerësuar<br>me Acne Duo</h1><div class="sr-result__range">${bereich.text}</div><p>${pershtatet ? "Acne Duo është vlerësuar si i përshtatshëm për rutinën tënde." : "Për lëkurën tënde, kërko një rekomandim personal para se të zgjedhësh setin."}</p><p class="sr-result__note">Vlerësim orientues nga fotografitë. Nuk është probabilitet shërimi apo garanci rezultati.</p>${pershtatet ? '<button type="button" class="sr-order">Porosit Acne Duo <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>' : '<a class="sr-order" href="https://wa.me/436508564879">Merr një rekomandim personal</a>'}<button type="button" class="sr-back">Kthehu në faqe</button></div>`;
    this.wurzel.querySelector(".sr-order")?.addEventListener("click", () => { if (pershtatet) { this.stop(); this.kaufen(); } });
    this.wurzel.querySelector(".sr-back").addEventListener("click", () => { this.stop(); globalThis.__lifeskinTrichter?.zeige("einstieg"); });
  }
}

// Reuse the original DOM/video/canvases in place; never start a second scanner.
export function skinreactEinbetten(dokument, name) {
  const sektion = dokument?.getElementById?.("zgjedhja");
  if (!sektion) return null;
  let platz = sektion.querySelector("[data-sr-live]");
  if (!platz) {
    platz = dokument.createElement("div");
    platz.setAttribute("data-sr-live", "");
    const vorschau = sektion.querySelector(".sr-stage");
    vorschau?.after(platz);
    for (const id of ["ls-kamera", "ls-analyse"]) {
      const schirm = dokument.getElementById(id);
      if (schirm) platz.append(schirm);
    }
  }
  const inline = name === "kamera" || name === "analyse";
  sektion.dataset.srState = inline ? name : "idle";
  return { platz, inline };
}
