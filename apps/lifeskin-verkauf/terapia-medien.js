// KUNDENFOTOS UND -VIDEOS auf der Therapieseite ("Nga klientët tanë").
//
// Eine schmale Reihe kleiner Hochformat-Kacheln gleich unter dem Preis -
// wie "In Aktion sehen" in grossen Shops: Sie haelt den Kaufknopf nicht
// auf, zeigt aber sofort, dass echte Leute die Produkte benutzen. Antippen
// oeffnet das Foto oder Video gross, darunter die Kommentare.
//
// SCHNELL, WEIL:
// - Die Kacheln stehen sofort da (Platz reserviert, kein Springen). Die
//   vier Standardfotos kennt die Seite schon, alles andere kommt mit einem
//   einzigen batchGet (shared/lifeskin-medien.js).
// - Videos laden in der Reihe erst, wenn ihre Kachel im Bild ist, und
//   spielen nur die ersten Sekunden als stumme Schleife - bei "Daten
//   sparen" oder "weniger Bewegung" gar nicht, dann bleibt das Standbild.
// - Kommentare holt die Seite erst beim Antippen (schon beim Beruehren
//   angestossen) und nur einmal je Medium.
// Jeder Fehler endet leise: Die Seite verkauft auch ohne diese Reihe.
import {
  MEDIEN_STANDARD, medienAuswahl, medienLaden, kommentareLaden, kommentarPruefen, kommentarSchreiben, viewZaehlen
} from "../../shared/lifeskin-medien.js";

const SCHLEIFE_SEKUNDEN = 4;
const NAME_MERKEN = "lifeskin.kommentar.name";

function element(name, klasse, text) {
  const el = document.createElement(name);
  if (klasse) el.className = klasse;
  if (text !== undefined && text !== null) el.textContent = text;
  return el;
}

// "sot", "dje", sonst das Datum - so wie Leute Kommentare lesen.
export function kommentarZeit(iso, jetzt = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const tage = Math.round((tag(jetzt) - tag(d)) / 86400000);
  if (tage <= 0) return "sot";
  if (tage === 1) return "dje";
  if (tage < 7) return `${tage} ditë më parë`;
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function bewegungErlaubt() {
  try {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    if (globalThis.navigator?.connection?.saveData) return false;
  } catch { /* im Zweifel: Standbild */ }
  return true;
}

function lesen(schluessel) {
  try { return globalThis.localStorage?.getItem(schluessel) || ""; } catch { return ""; }
}
function merken(schluessel, wert) {
  try { globalThis.localStorage?.setItem(schluessel, wert); } catch { /* privat: egal */ }
}

export class KundenMedien {
  // abschnitt: die <section>, reihe: der Behaelter der Kacheln.
  // zaehlen: false in Vorschau und stillem Modus (keine Views).
  // melde(medium): ein Kommentar ist geschrieben (fuer den Klickpfad - das
  // Antippen zaehlt der Klickpfad schon selbst).
  constructor({ abschnitt, reihe, basis, tenant, fetchFn, zaehlen = true, name = "", melde, kaufen } = {}) {
    this.abschnitt = abschnitt;
    this.reihe = reihe;
    this.optionen = { basis, tenant, fetchFn };
    this.zaehlen = zaehlen;
    this.vorname = String(name || "").trim().split(/\s+/)[0] || "";
    this.melde = melde || (() => {});
    this.kaufen = kaufen || null;
    this.medien = [];
    this.kommentare = new Map();
    this.gezaehlt = new Set();
    this.offen = -1;
  }

  // Zeigt die Reihe fuer die Auswahl des Befunds. Nichts gewaehlt: nichts.
  async zeige(auswahl) {
    const ids = medienAuswahl(auswahl);
    if (!ids.length || !this.abschnitt || !this.reihe) {
      if (this.abschnitt) this.abschnitt.hidden = true;
      return [];
    }
    // Sofort: die Standardfotos, fuer den Rest leere Kacheln gleicher Groesse.
    const standard = new Map(MEDIEN_STANDARD.map((m) => [m.id, m]));
    this.#kacheln(ids.map((id) => standard.get(id) || { id, leer: true }));
    this.abschnitt.hidden = false;
    this.#ereignisse();

    let medien = [];
    try {
      medien = await medienLaden(ids, this.optionen);
    } catch { /* bleibt leer */ }
    this.medien = medien;
    if (!medien.length) {
      this.abschnitt.hidden = true;
      return medien;
    }
    this.#kacheln(medien);
    this.#schleifen();
    return medien;
  }

  // ---------- Die Reihe ----------

  // Kacheln mit gleichem Medium und Bild bleiben dieselben Knoten - kein
  // Flackern, wenn die Datenbank nur bestaetigt, was schon dasteht.
  #kacheln(liste) {
    const alt = new Map([...this.reihe.children].map((k) => [k.dataset.medium + "|" + (k.dataset.bild || ""), k]));
    const neu = liste.map((m, i) => {
      const schluessel = m.id + "|" + (m.bild || "");
      const kachel = !m.leer && alt.get(schluessel);
      if (kachel) {
        kachel.dataset.index = String(i);
        return kachel;
      }
      return this.#kachel(m, i);
    });
    this.reihe.replaceChildren(...neu);
  }

  #kachel(m, i) {
    const kachel = element("button", "medium");
    kachel.type = "button";
    kachel.dataset.medium = m.id;
    kachel.dataset.index = String(i);
    if (m.leer) {
      kachel.classList.add("medium--leer");
      kachel.disabled = true;
      kachel.setAttribute("aria-hidden", "true");
      return kachel;
    }
    kachel.dataset.bild = m.bild;
    kachel.setAttribute("aria-label", `${m.art === "video" ? "Shikoni videon" : "Shikoni foton"}${m.produkt ? ` · ${m.produkt}` : ""}`);
    const bild = element("img", "medium__bild");
    bild.src = m.bild;
    bild.alt = "";
    bild.loading = i < 3 ? "eager" : "lazy";
    bild.decoding = "async";
    kachel.append(bild);
    if (m.art === "video" && m.video) {
      kachel.classList.add("medium--video");
      kachel.dataset.video = m.video;
      kachel.append(element("span", "medium__spiel"));
    }
    if (m.produkt) kachel.append(element("span", "medium__produkt", m.produkt));
    return kachel;
  }

  #ereignisse() {
    if (this.ereignisseGebunden) return;
    this.ereignisseGebunden = true;
    this.reihe.addEventListener("click", (e) => {
      const kachel = e.target instanceof Element ? e.target.closest(".medium:not(.medium--leer)") : null;
      if (kachel) this.oeffne(Number(kachel.dataset.index) || 0);
    });
    // Beim Beruehren schon die Kommentare holen - bis der Finger oben ist,
    // sind sie meist da.
    this.reihe.addEventListener("pointerdown", (e) => {
      const kachel = e.target instanceof Element ? e.target.closest(".medium:not(.medium--leer)") : null;
      if (kachel) this.#kommentareHolen(kachel.dataset.medium);
    }, { passive: true });
  }

  // Stumme Schleife der ersten Sekunden, nur solange die Kachel im Bild ist.
  #schleifen() {
    if (typeof IntersectionObserver !== "function" || !bewegungErlaubt()) return;
    const videos = [...this.reihe.querySelectorAll(".medium--video")];
    if (!videos.length) return;
    this.schleifenBeobachter?.disconnect();
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        const kachel = e.target;
        if (e.isIntersecting && !document.hidden && this.offen < 0) this.#schleifeAn(kachel);
        else kachel.querySelector("video")?.pause();
      }
    }, { threshold: 0.6 });
    this.schleifenBeobachter = beobachter;
    // Erst wenn die Seite fertig ist - die Schleife soll nichts verdraengen.
    const los = () => videos.forEach((k) => beobachter.observe(k));
    if (document.readyState === "complete") los();
    else globalThis.addEventListener("load", los, { once: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.#alleSchleifenAus();
    });
  }

  #schleifeAn(kachel) {
    let video = kachel.querySelector("video");
    if (!video) {
      video = element("video", "medium__schleife");
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("muted", "");
      video.preload = "metadata";
      video.setAttribute("aria-hidden", "true");
      video.addEventListener("timeupdate", () => {
        if (video.currentTime >= SCHLEIFE_SEKUNDEN) video.currentTime = 0;
      });
      video.addEventListener("ended", () => { video.currentTime = 0; video.play().catch(() => {}); });
      // Erst zeigen, wenn wirklich Bilder laufen - vorher bleibt das Standbild.
      video.addEventListener("playing", () => kachel.classList.add("medium--laeuft"), { once: true });
      video.addEventListener("error", () => video.remove(), { once: true });
      video.src = kachel.dataset.video;
      kachel.insertBefore(video, kachel.querySelector(".medium__spiel"));
    }
    video.play().catch(() => {});
  }

  #alleSchleifenAus() {
    for (const v of this.reihe.querySelectorAll("video")) v.pause();
  }

  // ---------- Der Betrachter ----------

  oeffne(index) {
    const m = this.medien[index];
    if (!m) return;
    const neu = this.offen < 0;
    this.offen = index;
    this.#alleSchleifenAus();
    const b = this.#betrachter();
    this.#buehne(m);
    b.text.replaceChildren(...(m.produkt ? [element("b", null, m.produkt)] : []), m.text || "");
    b.zurueck.hidden = index <= 0;
    b.weiter.hidden = index >= this.medien.length - 1;
    b.zaehler.textContent = this.medien.length > 1 ? `${index + 1} / ${this.medien.length}` : "";
    b.fehler.hidden = true;
    if (b.kauf) b.kauf.hidden = this.kaufen?.gilt?.() === false;
    this.#kommentareZeigen(m.id);
    if (neu) {
      b.hinten.hidden = false;
      b.hinten.scrollTop = 0;
      document.body.classList.add("pa-rreshqitje");
      // Die Zurueck-Taste des Telefons schliesst den Betrachter, nicht die Seite.
      try { history.pushState({ lifeskinMedium: true }, ""); this.imVerlauf = true; } catch { this.imVerlauf = false; }
      b.schliessen.focus({ preventScroll: true });
    }
    if (this.zaehlen && !this.gezaehlt.has(m.id)) {
      this.gezaehlt.add(m.id);
      viewZaehlen(m.id, this.optionen);
    }
  }

  schliesse({ ausVerlauf = false } = {}) {
    if (this.offen < 0) return;
    this.offen = -1;
    const b = this.teile;
    b.buehne.querySelector("video")?.pause();
    b.buehne.replaceChildren();
    b.hinten.hidden = true;
    document.body.classList.remove("pa-rreshqitje");
    if (this.imVerlauf && !ausVerlauf) {
      this.imVerlauf = false;
      try { history.back(); } catch { /* egal */ }
    }
    this.imVerlauf = false;
    // Die Schleifen im Bild laufen weiter.
    for (const k of this.reihe.querySelectorAll(".medium--video video")) {
      const r = k.getBoundingClientRect();
      if (r.bottom > 0 && r.top < globalThis.innerHeight) k.play().catch(() => {});
    }
  }

  #buehne(m) {
    const buehne = this.teile.buehne;
    buehne.querySelector("video")?.pause();
    if (m.art === "video" && m.video) {
      const video = element("video", "betrachter__medium");
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.controls = true;
      video.preload = "auto";
      video.poster = m.bild;
      video.src = m.video;
      // Liefert der Server das Video nicht stueckweise (Safari braucht
      // das), holt die Seite es einmal ganz und spielt es von dort.
      video.addEventListener("error", () => this.#videoGanz(video, m.video), { once: true });
      buehne.replaceChildren(video);
      // Im Antippen gestartet - darf mit Ton spielen. Sonst stumm.
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
    } else {
      const bild = element("img", "betrachter__medium");
      bild.src = m.bild;
      bild.alt = m.produkt ? `Kliente me ${m.produkt}` : "Foto nga klientët";
      bild.decoding = "async";
      buehne.replaceChildren(bild);
    }
  }

  async #videoGanz(video, url) {
    try {
      const antwort = await fetch(url);
      if (!antwort.ok || !video.isConnected) return;
      const blob = await antwort.blob();
      if (!video.isConnected) return;
      video.src = URL.createObjectURL(blob);
      video.addEventListener("emptied", () => URL.revokeObjectURL(video.src), { once: true });
      video.play().catch(() => {});
    } catch { /* bleibt beim Standbild */ }
  }

  #betrachter() {
    if (this.teile) return this.teile;
    const hinten = element("div", "betrachter");
    hinten.hidden = true;
    hinten.setAttribute("role", "dialog");
    hinten.setAttribute("aria-modal", "true");
    hinten.setAttribute("aria-label", "Nga klientët tanë");
    hinten.dataset.pfad = "Kundenfotos gross";

    const kopf = element("div", "betrachter__kopf");
    const zaehler = element("span", "betrachter__zaehler");
    const schliessen = element("button", "betrachter__zu", "×");
    schliessen.type = "button";
    schliessen.setAttribute("aria-label", "Mbyll");
    kopf.append(zaehler, schliessen);

    const buehne = element("div", "betrachter__buehne");
    const zurueck = element("button", "betrachter__pfeil betrachter__pfeil--zurueck", "‹");
    zurueck.type = "button";
    zurueck.setAttribute("aria-label", "Më parë");
    const weiter = element("button", "betrachter__pfeil betrachter__pfeil--weiter", "›");
    weiter.type = "button";
    weiter.setAttribute("aria-label", "Më pas");
    const rahmen = element("div", "betrachter__rahmen");
    rahmen.append(buehne, zurueck, weiter);

    const blatt = element("div", "betrachter__blatt");
    const text = element("p", "betrachter__text");
    let kauf = null;
    if (this.kaufen) {
      kauf = element("button", "knopf betrachter__kauf", this.kaufen.text);
      kauf.type = "button";
    }
    const titel = element("h3", "betrachter__titel", "Komentet");
    const liste = element("ul", "komentet");
    const form = element("form", "koment-forma");
    form.noValidate = true;
    const name = element("input");
    name.name = "emri";
    name.placeholder = "Emri juaj";
    name.maxLength = 40;
    name.autocomplete = "given-name";
    name.value = lesen(NAME_MERKEN) || this.vorname;
    const feld = element("textarea");
    feld.name = "koment";
    feld.placeholder = "Shkruani një koment…";
    feld.maxLength = 500;
    feld.rows = 2;
    const senden = element("button", "koment-forma__dergo", "Dërgo");
    senden.type = "submit";
    const fehler = element("p", "koment-forma__gabim", "Nuk u dërgua. Provoni përsëri.");
    fehler.hidden = true;
    form.append(name, feld, senden, fehler);
    blatt.append(text, ...(kauf ? [kauf] : []), titel, form, liste);

    hinten.append(kopf, rahmen, blatt);
    document.body.append(hinten);
    this.teile = { hinten, kauf, buehne, zurueck, weiter, zaehler, schliessen, text, titel, liste, form, name, feld, senden, fehler };

    schliessen.addEventListener("click", () => this.schliesse());
    zurueck.addEventListener("click", () => this.oeffne(this.offen - 1));
    weiter.addEventListener("click", () => this.oeffne(this.offen + 1));
    kauf?.addEventListener("click", () => { this.schliesse(); this.kaufen.tun(); });
    form.addEventListener("submit", (e) => { e.preventDefault(); this.#senden(); });
    globalThis.addEventListener("popstate", () => {
      if (this.offen >= 0 && this.imVerlauf) { this.imVerlauf = false; this.schliesse({ ausVerlauf: true }); }
    });
    document.addEventListener("keydown", (e) => {
      if (this.offen < 0) return;
      if (e.key === "Escape") this.schliesse();
      else if (e.target instanceof Element && e.target.closest("input, textarea")) return;
      else if (e.key === "ArrowLeft") this.oeffne(this.offen - 1);
      else if (e.key === "ArrowRight") this.oeffne(this.offen + 1);
    });
    // Wischen auf dem Bild: naechstes oder voriges.
    let start = null;
    rahmen.addEventListener("touchstart", (e) => { start = e.touches[0] ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }, { passive: true });
    rahmen.addEventListener("touchend", (e) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.oeffne(this.offen + (dx < 0 ? 1 : -1));
    }, { passive: true });
    return this.teile;
  }

  // ---------- Kommentare ----------

  #kommentareHolen(id) {
    if (!id) return Promise.resolve([]);
    if (!this.kommentare.has(id)) {
      const laden = kommentareLaden(id, this.optionen).then((liste) => {
        this.kommentare.set(id, liste);
        return liste;
      });
      this.kommentare.set(id, laden);
    }
    return Promise.resolve(this.kommentare.get(id));
  }

  async #kommentareZeigen(id) {
    const b = this.teile;
    const bereit = this.kommentare.get(id);
    if (!Array.isArray(bereit)) {
      b.titel.textContent = "Komentet";
      b.liste.replaceChildren(element("li", "komentet__laedt", "Po ngarkohen…"));
    }
    const liste = await this.#kommentareHolen(id);
    if (this.medien[this.offen]?.id !== id) return;
    this.#liste(liste);
  }

  #liste(liste) {
    const b = this.teile;
    b.titel.textContent = liste.length ? `Komentet (${liste.length})` : "Komentet";
    if (!liste.length) {
      b.liste.replaceChildren(element("li", "komentet__bosh", "Ende pa komente. Shkruani të parin."));
      return;
    }
    b.liste.replaceChildren(...liste.map((k) => {
      const zeile = element("li", "koment");
      zeile.append(element("span", "koment__shkronja", (k.name.trim()[0] || "?").toUpperCase()));
      const inhalt = element("div");
      const kopf = element("p", "koment__kok");
      kopf.append(element("b", null, k.name), element("span", null, kommentarZeit(k.createdAt)));
      inhalt.append(kopf, element("p", "koment__text", k.text));
      zeile.append(inhalt);
      return zeile;
    }));
  }

  async #senden() {
    const b = this.teile;
    const m = this.medien[this.offen];
    if (!m) return;
    const eingabe = kommentarPruefen({ name: b.name.value, text: b.feld.value });
    if (!eingabe.ok) {
      (eingabe.name ? b.feld : b.name).focus();
      return;
    }
    b.fehler.hidden = true;
    b.senden.disabled = true;
    merken(NAME_MERKEN, eingabe.name);
    // Sofort sichtbar - wie abgemacht. Scheitert das Schreiben, geht er wieder.
    const vorher = Array.isArray(this.kommentare.get(m.id)) ? this.kommentare.get(m.id) : [];
    const vorlaeufig = { id: "", name: eingabe.name, text: eingabe.text, createdAt: new Date().toISOString() };
    this.kommentare.set(m.id, [vorlaeufig, ...vorher]);
    this.#liste(this.kommentare.get(m.id));
    b.feld.value = "";
    try {
      const echt = await kommentarSchreiben(m.id, eingabe, this.optionen);
      this.kommentare.set(m.id, [echt || vorlaeufig, ...vorher]);
      this.melde(m);
    } catch {
      this.kommentare.set(m.id, vorher);
      if (this.medien[this.offen]?.id === m.id) {
        this.#liste(vorher);
        b.feld.value = eingabe.text;
        b.fehler.hidden = false;
      }
    } finally {
      b.senden.disabled = false;
    }
  }
}
