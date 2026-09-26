// DER KUNDENBEREICH DER BEGLEITUNG - /ndjekja#<zugang>
//
// Auftrag vom 26.09., Punkte 5-7: Nach der bestaetigten Bestellung ein
// einfacher, persoenlicher Bereich. Vor der Ankunft der Produkte: die
// Bestellung und der naechste Schritt. Die 28 Tage beginnen mit dem
// tatsaechlichen Anwendungsstart (der Kunde bestaetigt ihn, oder das Team
// setzt ihn). Danach: Plan und Produkte, Woche und Tag, der kurze Eintrag
// von heute, der naechste Termin, echte Rueckmeldungen des Teams, Kontakt.
//
// WAS HIER NIE STEHT: eine Diagnose aus einer gewaehlten Reaktion, eine
// automatische Therapieaenderung, ein Termin, der von selbst "erledigt"
// ist, eine Heilungsquote, ein Countdown, eine Serie ("7 Tage am Stueck!"),
// eine Antwortfrist, solange sie nicht festgelegt ist (NDJEKJA.antwortZeit).
//
// Ein fehlender Tag heisst "Nuk është shënuar" (nicht dokumentiert) - nie
// "nicht angewendet".

import { NdjekjaDaten } from "./ndjekja-daten.js";
import { AnalyseDaten } from "../lifeskin-astra/astra-daten.js";
import { LIFESKIN_WHATSAPP } from "../lifeskin/lifeskin-config.js";
import {
  NDJEKJA, NDJEKJA_TEXTE, PERDORIMI, MESAZH_MAX, GESCHAEFTSZONE,
  heuteIso, istDatum, anwendungsTag, wocheVon, datumPlus, naechsteKontrolle, letzteKontrolle,
  phaseVon, nachDenWochen, tagesStand, ndjesiaTekst
} from "../../shared/lifeskin-ndjekja.js";
import { el, ikone, wochenSpur, auswahl, ndjesiaAuswahl, frage } from "./ndjekja-teile.js";

const $ = (wahl) => document.querySelector(wahl);
const WOCHEN = Math.max(1, Math.round((NDJEKJA.tage || 28) / 7));

// Die Namen von Hand: Viele Telefone kennen "sq" nicht und schreiben dann
// englische Monate auf eine albanische Seite.
const DITET = ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"];
const MUAJT = ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"];

export function datumSq(iso, { mitTag = true } = {}) {
  if (!istDatum(iso)) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  const teil = `${d.getUTCDate()} ${MUAJT[d.getUTCMonth()]}`;
  return mitTag ? `${DITET[d.getUTCDay()]}, ${teil}` : teil;
}

const UHR = new Intl.DateTimeFormat("en-GB", { timeZone: GESCHAEFTSZONE, hour: "2-digit", minute: "2-digit", hour12: false });

export function zeitSq(iso) {
  const ms = Date.parse(String(iso || ""));
  if (!Number.isFinite(ms)) return "";
  const tag = heuteIso(new Date(ms));
  return `${datumSq(tag, { mitTag: false })}, ${UHR.format(new Date(ms))}`;
}

const STATUS_POROSIA = Object.freeze({
  konfirmuar: ["E konfirmuar", "E konfirmuam porosinë tuaj. Pakoja përgatitet për dërgim."],
  derguar: ["E nisur", "Pakoja juaj është nisur. Pagesa bëhet te dera, kur ta merrni."],
  dorezuar: ["E dorëzuar", "Pakoja juaj u dorëzua."],
  anuluar: ["E anuluar", "Kjo porosi u anulua. Nëse kjo është gabim, na shkruani."]
});

export class NdjekjaSeite {
  constructor({ ort = globalThis.location, fetchFn, jetzt = () => new Date(), speicher } = {}) {
    this.ort = ort;
    const zugang = String(ort?.hash || "").replace(/^#/, "").trim().toLowerCase();
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.daten = new NdjekjaDaten({ zugang, fetchFn: this.fetchFn });
    this.jetzt = jetzt;
    this.speicher = speicher === undefined ? (() => { try { return globalThis.localStorage; } catch { return null; } })() : speicher;
    // Das Team oeffnet denselben Link mit ?shiko=1 - dann nur lesen.
    this.nurLesen = (() => { try { return new URLSearchParams(ort?.search || "").get("shiko") === "1"; } catch { return false; } })();
    this.fall = null;
    this.eintraege = [];
    this.pergjigjet = [];
    this.bericht = null;
    this.produkte = [];
    this.tag = 0;
  }

  get heute() { return heuteIso(this.jetzt()); }
  get heuteTag() { return anwendungsTag(this.fall?.startAt, this.heute); }

  async starte() {
    this.#zeige("laedt");
    if (!this.daten.zugang) { this.#zeige("weg"); return; }
    const erg = await this.daten.fall();
    if (erg.status === "fehlt") { this.#zeige("weg"); return; }
    if (erg.status !== "ok") { this.#zeige("netz"); return; }
    this.fall = erg.fall;
    const [eintraege, pergjigjet] = await Promise.allSettled([this.daten.eintraege(), this.daten.pergjigjet()]);
    this.eintraege = eintraege.status === "fulfilled" ? eintraege.value : [];
    this.pergjigjet = pergjigjet.status === "fulfilled" ? pergjigjet.value : [];
    this.teilweise = eintraege.status !== "fulfilled" || pergjigjet.status !== "fulfilled";
    await this.#planLaden();
    this.tag = Math.min(this.heuteTag, 60);
    this.#zeichnen();
    this.#zeige("faqja");
  }

  // Plan und Produkte aus dem Befund - dieselben Lesewege wie die
  // Therapieseite. Fehlt etwas, bleibt der Abschnitt weg; der Bereich
  // funktioniert auch ohne.
  async #planLaden() {
    if (!this.fall?.kennung) return;
    try {
      const quelle = new AnalyseDaten({ fetchFn: this.fetchFn, kennung: this.fall.kennung });
      this.bericht = await quelle.bericht();
      if (this.bericht) this.produkte = await quelle.produkte(this.bericht, "sq");
    } catch {
      this.bericht = null;
      this.produkte = [];
    }
  }

  #zeige(was) {
    for (const [id, name] of [["#n-laedt", "laedt"], ["#n-weg", "weg"], ["#n-netz", "netz"], ["#n-faqja", "faqja"]]) {
      const knoten = $(id);
      if (knoten) knoten.hidden = name !== was;
    }
    const wa = $("#n-wegwa");
    if (was === "weg" && wa && LIFESKIN_WHATSAPP) {
      wa.href = this.#waLink("Përshëndetje! Linku i ndjekjes sime nuk hapet.");
      wa.hidden = false;
    }
    if (was === "netz") {
      const knopf = $("#n-provo");
      if (knopf && !knopf.dataset.gebunden) {
        knopf.dataset.gebunden = "1";
        knopf.addEventListener("click", () => this.starte());
      }
    }
  }

  #waLink(text) {
    const code = String(this.fall?.code || "");
    const satz = `${text}${code ? ` Kodi: ${code}` : ""}`;
    return `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(satz)}`;
  }

  // ---------- Zeichnen ----------

  #zeichnen() {
    const f = this.fall;
    const phase = phaseVon(f, this.heute);
    const tag = this.heuteTag;
    $("#n-shiko").hidden = !this.nurLesen;
    const kodi = $("#n-kodi");
    if (kodi) kodi.textContent = f.code ? `Ndjekja ${f.code}` : "";
    const kopfWa = $("#n-kopfwa");
    if (kopfWa && LIFESKIN_WHATSAPP) {
      kopfWa.href = this.#waLink("Përshëndetje! Kam një pyetje për terapinë time.");
      kopfWa.hidden = false;
    }

    const name = String(f.emri || this.bericht?.name || "").trim();
    $("#n-titulli").textContent = name ? `${name}, ${WOCHEN} javët tuaja me LifeSkin.` : `${WOCHEN} javët tuaja me LifeSkin.`;
    let gjendja = "";
    if (phase === "pritet") gjendja = `${WOCHEN} javët fillojnë ditën kur filloni përdorimin – jo ditën e porosisë.`;
    else if (phase === "aktiv" && nachDenWochen(f, this.heute)) gjendja = `${WOCHEN} javët përfunduan. Vlerësimin përmbyllës jua shkruajmë këtu.`;
    else if (phase === "aktiv") gjendja = `Sot është dita ${tag} e përdorimit.`;
    else if (phase === "perfunduar") gjendja = `Ndjekja juaj ${WOCHEN}-javore përfundoi. Faleminderit!`;
    else if (phase === "anuluar") gjendja = STATUS_POROSIA.anuluar[1];
    $("#n-gjendja").textContent = gjendja;

    this.#pritet(phase);
    this.#sot(phase);
    this.#kontrolli(phase);
    this.#pergjigjetZeichnen();
    this.#historia(phase);
    this.#plani();
    this.#kontakt();
  }

  // VOR DEM START: Bestellung, naechster Schritt, Start bestaetigen.
  #pritet(phase) {
    const ort = $("#n-pritet");
    const zeigen = phase === "pritet" || phase === "anuluar";
    ort.hidden = !zeigen;
    if (!zeigen) return;
    const [marke, satz] = STATUS_POROSIA[this.fall.porosia?.statusi] || STATUS_POROSIA.konfirmuar;
    const karte = el("div", "ndj-karta");
    const kopf = el("div", "ndj-karta__kok");
    const titel = el("span", "ndj-karta__titulli");
    titel.append(ikone("pako", "ndj-ikona ndj-ikona--vogel"), "Porosia juaj");
    kopf.append(titel, el("span", `ndj-statusi ndj-statusi--${this.fall.porosia?.statusi || "konfirmuar"}`, marke));
    karte.append(kopf, el("p", "ndj-teksti", satz));
    if (phase === "anuluar") {
      ort.replaceChildren(karte);
      return;
    }
    const hapi = el("p", "ndj-hapi");
    hapi.append(el("b", null, "Hapi i radhës: "), `Kur të filloni përdorimin, na tregoni këtu. Nga ajo ditë numërohen ${WOCHEN} javët dhe kontrollet (ditët ${NDJEKJA.kontrollTage.join(", ").replace(/, (\d+)$/, " dhe $1")}).`);
    karte.append(hapi);
    if (!this.nurLesen) {
      const zeile = el("p", "ndj-ruajtja");
      zeile.setAttribute("role", "status");
      zeile.hidden = true;
      const wahl = el("div", "ndj-zgjedhje");
      const knopf = (text, datum) => {
        const k = el("button", "ndj-opsion ndj-opsion--fort", text);
        k.type = "button";
        k.addEventListener("click", async () => {
          if (this.startet) return;
          this.startet = true;
          for (const b of wahl.querySelectorAll("button")) b.disabled = true;
          zeile.hidden = false;
          zeile.dataset.art = "ruan";
          zeile.textContent = "Po ruhet…";
          const erg = await this.daten.starten(datum);
          this.startet = false;
          if (erg.ok) {
            this.fall.startAt = datum;
            this.fall.startVon = "klienti";
            this.tag = Math.min(this.heuteTag, 60);
            this.#zeichnen();
            $("#n-sot")?.scrollIntoView?.({ block: "start", behavior: "smooth" });
            return;
          }
          for (const b of wahl.querySelectorAll("button")) b.disabled = false;
          zeile.dataset.art = "gabim";
          zeile.textContent = "Nuk u ruajt. Provoni përsëri.";
        });
        return k;
      };
      wahl.append(knopf("Fillova sot", this.heute), knopf("Fillova dje", datumPlus(this.heute, -1)));
      karte.append(wahl, zeile);
    }
    ort.replaceChildren(karte);
  }

  // DER EINTRAG - heute, oder ein frueherer Tag zum Korrigieren.
  #sot(phase) {
    const ort = $("#n-sot");
    const aktiv = phase === "aktiv" && this.tag >= 1;
    ort.hidden = !aktiv;
    if (!aktiv) return;
    const heute = this.heuteTag;
    const tag = this.tag;
    const vorhanden = this.eintraege.find((e) => e.dita === tag) || null;
    const entwurf = this.#entwurfLesen(tag);
    const werte = entwurf || vorhanden || {};
    const datum = datumPlus(this.fall.startAt, tag - 1);

    const karte = el("div", "ndj-karta ndj-karta--sot");
    const java = el("div", "ndj-java");
    const links = el("div", "ndj-java__links");
    links.append(el("b", null, `Java ${wocheVon(tag)} nga ${WOCHEN}`), wochenSpur(wocheVon(tag), WOCHEN));
    java.append(links, el("span", null, `Dita ${tag} · ${datumSq(datum)}`));
    karte.append(java);

    if (tag !== heute) {
      const zurueck = el("p", "ndj-ndryshim");
      zurueck.append(`Po ndryshoni shënimin e ditës ${tag}. `);
      const link = el("button", "ndj-lidhje", "Kthehu te sot");
      link.type = "button";
      link.addEventListener("click", () => { this.tag = heute; this.#zeichnen(); });
      zurueck.append(link);
      karte.append(zurueck);
    }

    const T = NDJEKJA_TEXTE;
    const titelPerdorimi = tag === heute ? T.perdorimiSot : `Përdorimi në ditën ${tag}`;
    this.perdorimi = auswahl(PERDORIMI.map((p) => [p.id, p.sq]), {
      einzeln: true, klasse: "ndj-zgjedhje ndj-zgjedhje--tre", titel: titelPerdorimi,
      beiAenderung: () => this.#geaendert()
    });
    this.perdorimi.setzen(werte.perdorimi ? [werte.perdorimi] : []);
    this.ndjesia = ndjesiaAuswahl({ beiAenderung: () => this.#geaendert() });
    this.ndjesia.setzen(werte.ndjesia || []);

    const feld = el("label", "ndj-mesazh");
    const titel = el("span", null, "Mesazh për ne ");
    titel.append(el("small", null, "(opsional)"));
    feld.append(titel);
    const text = el("textarea");
    text.rows = 3;
    text.maxLength = MESAZH_MAX;
    text.placeholder = "P.sh. një pyetje për përdorimin";
    text.value = String(werte.mesazh || "");
    const zaehler = el("small", "ndj-mesazh__numri", `${text.value.length}/${MESAZH_MAX}`);
    text.addEventListener("input", () => {
      zaehler.textContent = `${text.value.length}/${MESAZH_MAX}`;
      this.#geaendert();
    });
    feld.append(text, zaehler);
    this.mesazh = text;

    const knopf = el("button", "knopf knopf--gjelber", vorhanden ? "Ruaj ndryshimin" : "Ruaj shënimin");
    knopf.type = "button";
    this.ruajKnopf = knopf;
    const zeile = el("p", "ndj-ruajtja");
    zeile.setAttribute("role", "status");
    zeile.setAttribute("aria-live", "polite");
    this.ruajZeile = zeile;
    if (entwurf) this.#stand("entwurf", "Keni ndryshime të paruajtura.");
    else if (vorhanden) this.#stand("ok", `E ruajtur · ${zeitSq(vorhanden.updatedAt)}`);
    knopf.addEventListener("click", () => this.#speichern());

    karte.append(
      frage(titelPerdorimi, this.perdorimi.el),
      frage(T.ndjesiaPyetja, this.ndjesia.el, "(opsionale)"),
      feld, knopf, zeile,
      el("p", "ndj-karta__shenim", T.joDitore)
    );
    if (this.nurLesen) {
      for (const k of karte.querySelectorAll("button, textarea")) k.disabled = true;
    }
    ort.replaceChildren(karte);
  }

  #stand(art, text) {
    const zeile = this.ruajZeile;
    if (!zeile) return;
    zeile.dataset.art = art;
    zeile.textContent = text;
    zeile.hidden = !text;
  }

  #geaendert() {
    if (this.nurLesen) return;
    this.#entwurfSchreiben(this.tag, {
      perdorimi: this.perdorimi?.wert()[0] || "",
      ndjesia: this.ndjesia?.wert() || [],
      mesazh: this.mesazh?.value || ""
    });
    this.#stand("entwurf", "Keni ndryshime të paruajtura.");
  }

  #entwurfSchluessel(tag) { return `lifeskin:ndjekja:${this.daten.zugang}:${tag}`; }

  #entwurfLesen(tag) {
    try {
      const roh = JSON.parse(this.speicher?.getItem(this.#entwurfSchluessel(tag)) || "null");
      return roh && typeof roh === "object" ? roh : null;
    } catch {
      return null;
    }
  }

  #entwurfSchreiben(tag, werte) {
    try { this.speicher?.setItem(this.#entwurfSchluessel(tag), JSON.stringify(werte)); } catch { /* ohne Speicher bleibt der Text im Feld */ }
  }

  #entwurfLoeschen(tag) {
    try { this.speicher?.removeItem(this.#entwurfSchluessel(tag)); } catch { /* nichts zu tun */ }
  }

  // SPEICHERN - mit sichtbarem Stand. Scheitert es, bleibt alles im Feld
  // (und im Entwurf), und derselbe Knopf versucht es noch einmal.
  async #speichern() {
    if (this.speichert || this.nurLesen) return;
    const perdorimi = this.perdorimi?.wert()[0] || "";
    if (!perdorimi) {
      this.#stand("mungon", "Zgjidhni një nga tri mundësitë: e përdora, pjesërisht ose nuk e përdora.");
      this.perdorimi?.knoepfe[0]?.focus();
      return;
    }
    const tag = this.tag;
    const eingabe = {
      dita: tag,
      data: datumPlus(this.fall.startAt, tag - 1),
      perdorimi,
      ndjesia: this.ndjesia?.wert() || [],
      mesazh: this.mesazh?.value || ""
    };
    this.speichert = true;
    if (this.ruajKnopf) { this.ruajKnopf.disabled = true; this.ruajKnopf.setAttribute("aria-busy", "true"); }
    this.#stand("ruan", "Po ruhet…");
    let vorhanden = this.eintraege.find((e) => e.dita === tag) || null;
    let erg = await this.daten.eintragSpeichern(eingabe, { vorhanden, altFundit: this.fall.fundit });
    if (!erg.ok && erg.grund === "stand") {
      // Ein zweites Geraet war schneller: neu lesen, dann als Korrektur.
      try { this.eintraege = await this.daten.eintraege(); } catch { /* bleibt */ }
      vorhanden = this.eintraege.find((e) => e.dita === tag) || null;
      erg = await this.daten.eintragSpeichern(eingabe, { vorhanden, altFundit: this.fall.fundit });
    }
    this.speichert = false;
    if (this.ruajKnopf) { this.ruajKnopf.disabled = false; this.ruajKnopf.setAttribute("aria-busy", "false"); }
    if (!erg.ok) {
      this.#stand("gabim", globalThis.navigator?.onLine === false
        ? "Nuk ka internet. Shënimi juaj mbetet këtu – provoni përsëri kur të keni lidhje."
        : "Nuk u ruajt. Shënimi juaj mbetet këtu – provoni përsëri.");
      return;
    }
    this.eintraege = [...this.eintraege.filter((e) => e.dita !== tag), erg.eintrag].sort((a, b) => a.dita - b.dita);
    this.fall.fundit = erg.fundit;
    this.#entwurfLoeschen(tag);
    if (this.ruajKnopf) this.ruajKnopf.textContent = "Ruaj ndryshimin";
    this.#stand("ok", `U ruajt ✓ · ${zeitSq(erg.eintrag.updatedAt)}`);
    this.#historia(phaseVon(this.fall, this.heute));
  }

  // DIE TERMINE: der naechste GEPLANTE, der letzte WIRKLICH erledigte.
  #kontrolli(phase) {
    const ort = $("#n-kontrolli");
    const zeigen = phase === "aktiv" || phase === "pritet";
    ort.hidden = !zeigen;
    if (!zeigen) return;
    const karte = el("div", "ndj-karta ndj-karta--rresht");
    const text = el("div", "ndj-kontroll");
    if (phase === "pritet") {
      text.append(el("b", null, "Kontrollet e planifikuara"),
        el("span", null, `Ditët ${NDJEKJA.kontrollTage.join(", ").replace(/, (\d+)$/, " dhe $1")} pas fillimit.`));
    } else {
      const naechste = naechsteKontrolle(this.fall);
      if (naechste) {
        const vorbei = naechste.datum && naechste.datum < this.heute;
        text.append(el("b", null, `Kontrolli i radhës: dita ${naechste.dita}`),
          el("span", null, vorbei
            ? `${datumSq(naechste.datum)} – ju shkruajmë këtu pas kontrollit.`
            : `${datumSq(naechste.datum)} · i planifikuar`));
      } else {
        text.append(el("b", null, "Të gjitha kontrollet u kryen."));
      }
      const letzte = letzteKontrolle(this.fall);
      if (letzte) {
        const wann = istDatum(String(letzte.kryerAt).slice(0, 10)) ? datumSq(String(letzte.kryerAt).slice(0, 10), { mitTag: false }) : "";
        text.append(el("small", null, `Kontrolli i fundit: dita ${letzte.dita}${wann ? `, më ${wann}` : ""}${letzte.nga ? ` · ${letzte.nga}` : ""}`));
      }
    }
    karte.append(ikone("kalendar"), text);
    ort.replaceChildren(karte);
  }

  // WAS DAS TEAM GESCHRIEBEN HAT - nur Echtes, mit Datum und Absender.
  #pergjigjetZeichnen() {
    const ort = $("#n-pergjigjet");
    ort.hidden = false;
    const kopf = el("h2", null, "Nga ekipi ynë");
    if (!this.pergjigjet.length) {
      ort.replaceChildren(kopf, el("p", "ndj-bosh", this.teilweise
        ? "Mesazhet nuk u ngarkuan tani. Provoni përsëri më vonë."
        : "Këtu shfaqen udhëzimet tona pas çdo kontrolli."));
      return;
    }
    const liste = el("ul", "ndj-mesazhet");
    liste.append(...this.pergjigjet.map((p) => {
      const li = el("li", "ndj-mesazh-ekipi");
      if (p.lloji === "kontroll" && p.dita) li.append(el("span", "ndj-shenje ndj-shenje--gjelber", `Kontrolli i ditës ${p.dita}`));
      li.append(el("p", "ndj-mesazh-ekipi__teksti", p.tekst));
      li.append(el("small", null, [p.nga || "Ekipi LifeSkin", zeitSq(p.createdAt)].filter(Boolean).join(" · ")));
      return li;
    }));
    ort.replaceChildren(kopf, liste);
  }

  // DIE TAGE BISHER - das Neueste oben, jeder Tag korrigierbar.
  #historia(phase) {
    const ort = $("#n-historia");
    const bisTag = Math.min(this.heuteTag, 60);
    const zeigen = (phase === "aktiv" || phase === "perfunduar") && bisTag >= 1;
    ort.hidden = !zeigen;
    if (!zeigen) return;
    const nachTag = new Map(this.eintraege.map((e) => [e.dita, e]));
    const liste = el("ol", "ndj-ditet");
    liste.reversed = true;
    for (let tag = bisTag; tag >= 1; tag -= 1) {
      const e = nachTag.get(tag) || null;
      const stand = tagesStand(e);
      const li = el("li", `ndj-dita ndj-dita--${stand.id}`);
      const kopf = el("div", "ndj-dita__kok");
      kopf.append(el("b", null, `Dita ${tag}`), el("span", null, datumSq(datumPlus(this.fall.startAt, tag - 1), { mitTag: false })));
      const inhalt = el("div", "ndj-dita__trup");
      inhalt.append(el("span", "ndj-dita__stand", stand.sq));
      const gefuehl = ndjesiaTekst(e?.ndjesia);
      if (gefuehl) inhalt.append(el("span", "ndj-dita__ndjesia", gefuehl));
      if (e?.mesazh) inhalt.append(el("span", "ndj-dita__mesazh", `„${e.mesazh}“`));
      li.append(kopf, inhalt);
      if (!this.nurLesen && phase === "aktiv") {
        const k = el("button", "ndj-lidhje ndj-dita__ndrysho", e ? "Ndrysho" : "Shëno");
        k.type = "button";
        k.setAttribute("aria-label", `${e ? "Ndrysho" : "Shëno"} ditën ${tag}`);
        k.addEventListener("click", () => {
          this.tag = tag;
          this.#sot(phase);
          $("#n-sot")?.scrollIntoView?.({ block: "start", behavior: "smooth" });
        });
        li.append(k);
      }
      liste.append(li);
    }
    const details = el("details", "ndj-historia");
    if (bisTag <= 7) details.open = true;
    const summe = el("summary");
    const dokumentiert = this.eintraege.filter((e) => e.dita >= 1 && e.dita <= bisTag).length;
    summe.append(`Shënimet tuaja · ${dokumentiert} nga ${bisTag} ditë`);
    const plus = el("i", null, "+");
    plus.setAttribute("aria-hidden", "true");
    summe.append(plus);
    details.append(summe, liste);
    ort.replaceChildren(details);
  }

  // PLAN UND PRODUKTE - wie auf der Therapieseite, kurz.
  #plani() {
    const ort = $("#n-plani");
    if (!this.produkte.length) { ort.hidden = true; return; }
    ort.hidden = false;
    const kopf = el("h2", null, "Plani juaj");
    const liste = el("ul", "ndj-produktet");
    const sortiert = [...this.produkte].sort((a, b) => (Number(a.perdorimi?.hapi) || 9) - (Number(b.perdorimi?.hapi) || 9));
    liste.append(...sortiert.map((p) => {
      const li = el("li");
      const titel = el("div", "ndj-produkt__kok");
      titel.append(el("b", null, p.name));
      const wann = [p.perdorimi?.koha, p.perdorimi?.sasia].filter(Boolean).join(" · ");
      if (wann) titel.append(el("span", null, wann.charAt(0).toUpperCase() + wann.slice(1)));
      li.append(titel);
      const wie = [p.perdorimi?.si, p.perdorimi?.kujdes].filter(Boolean);
      if (wie.length) {
        const mehr = el("details", "ndj-produkt__si");
        const summe = el("summary", null, "Si përdoret");
        const plus = el("i", null, "+");
        plus.setAttribute("aria-hidden", "true");
        summe.append(plus);
        mehr.append(summe, ...wie.map((x) => el("p", null, x)));
        li.append(mehr);
      }
      return li;
    }));
    const teile = [kopf, liste];
    if (this.fall.kennung) {
      const link = el("a", "ndj-lidhje ndj-lidhje--blok", "Shihni analizën dhe planin e plotë");
      link.href = `/terapia/${this.fall.kennung}`;
      teile.push(link);
    }
    ort.replaceChildren(...teile);
  }

  #kontakt() {
    const ort = $("#n-kontakt");
    const teile = [el("h2", null, NDJEKJA_TEXTE.pyetjeKontakt)];
    const satz = el("p", "ndj-teksti", "Na shkruani drejtpërdrejt. Mund të na shkruani edhe te shënimi i ditës.");
    teile.push(satz);
    // Eine Antwortfrist nur, wenn sie festgelegt ist (Auftrag, Punkt 4).
    const frist = String(NDJEKJA.antwortZeit || "").trim();
    if (frist) teile.push(el("p", "ndj-teksti", `Zakonisht përgjigjemi ${frist}.`));
    if (LIFESKIN_WHATSAPP && !this.nurLesen) {
      const knopf = el("a", "knopf knopf--kontur", "Na shkruani në WhatsApp");
      knopf.href = this.#waLink("Përshëndetje! Kam një pyetje për terapinë time.");
      knopf.target = "_blank";
      knopf.rel = "noopener";
      teile.push(knopf);
    }
    ort.replaceChildren(...teile);
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => {
    const seite = new NdjekjaSeite();
    seite.starte();
    // Ein anderer Link im selben Tab (#neuer-zugang): neu laden.
    globalThis.addEventListener?.("hashchange", () => globalThis.location.reload());
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
