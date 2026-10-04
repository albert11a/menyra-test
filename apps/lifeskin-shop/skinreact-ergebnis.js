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

// One centered SVG owns both waiting and completion; it never implies a fake percentage.
function ergebnisRing() {
  return `<svg class="sr-result__orbit" viewBox="0 0 100 100" aria-hidden="true"><circle class="sr-orbit-track" cx="50" cy="50" r="48"/><circle class="sr-orbit-progress" cx="50" cy="50" r="48" pathLength="100"/></svg>`;
}
function ergebnisSchritte(fertig = false) {
  return `<ol class="sr-steps" aria-label="Hapat e skanimit"><li data-step="done">Skanimi</li><li data-step="${fertig ? "done" : "current"}" ${fertig ? "" : 'aria-current="step"'}>Kontrolli</li><li data-step="${fertig ? "current" : "next"}" ${fertig ? 'aria-current="step"' : ""}>Rezultati</li></ol>`;
}
function bereichZiffern(bereich) {
  return `<span>${bereich.min}</span><span class="sr-range-dash">–</span><span>${bereich.max}</span><span class="sr-range-percent">%</span>`;
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
  vorbereiten({ zurueck = true } = {}) {
    if (!this.wurzel) return;
    this.wurzel.innerHTML = `<div class="sr-result">${ergebnisSchritte()}<p class="sr-result__eyebrow">SKINREACT</p><div class="sr-result__visual">${ergebnisRing()}<div class="sr-pending" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3M9 9v1m6-1v1m-5 5c1 1 3 1 4 0"/><path class="sr-sweep" d="M6 12h12"/></svg></div><span class="sr-working">Po perpunohet</span></div><h1>Po kontrollohet skanimi yt.</h1><p data-sr-status role="status" aria-live="polite">Rezultati shfaqet këtu sapo të përfundojë kontrolli.</p><button type="button" class="sr-back">Vazhdo ne faqe</button></div>`;
    this.wurzel.querySelector(".sr-back").addEventListener("click", () => {
      this.stop();
      globalThis.__lifeskinTrichter?.zeige("einstieg");
    });
    this.wurzel.querySelector(".sr-back").hidden = !zurueck;
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
    this.wurzel.innerHTML = `<div class="sr-result sr-result--ready">${ergebnisSchritte(true)}<p class="sr-result__eyebrow">SKINREACT · REZULTATI YT</p><div class="sr-result__visual sr-result__visual--ready">${ergebnisRing()}${pershtatet ? '<span class="sr-result__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4 4 10-10"/></svg></span>' : ""}<div class="sr-result__range" aria-label="${bereich.text}">${bereichZiffern(bereich)}</div><span class="sr-working">Pershtatja me Acne Duo</span></div><h1>${pershtatet ? "Acne Duo i pershtatet lekures tende." : "Lekura jote meriton nje plan personal."}</h1><p>${pershtatet ? "Dy hapa per rutinen tende: trajtim per pucrrat dhe hidratim per lekuren." : "Sipas ketij vleresimi, kerko nje rekomandim personal para se ta zgjedhesh setin."}</p>${pershtatet ? '<div class="sr-result__products"><div class="sr-result__product"><strong>LF ACNE</strong><span>Trajton pucrrat aktive.</span></div><div class="sr-result__product"><strong>LF MOISTUR</strong><span>Hidraton dhe mbeshtet barrieren.</span></div></div>' : ""}<p class="sr-result__note">Vleresim orientues nga fotot, jo garanci rezultati.</p>${pershtatet ? '<button type="button" class="sr-order">Porosit Acne Duo</button>' : '<a class="sr-order" href="https://wa.me/436508564879">Merr nje rekomandim personal</a>'}<button type="button" class="sr-back">Kthehu ne faqe</button></div>`;
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
