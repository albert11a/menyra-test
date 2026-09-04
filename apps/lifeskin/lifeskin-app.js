// Der Trichter: zehn Bildschirme, ein Zustand, ein Weg.
//
// Hier wird nichts gerechnet und nichts entschieden - das liegt in
// lifeskin-metrics.js, lifeskin-face.js und lifeskin-rules.js, wo es
// getestet werden kann. Dieses Modul fuehrt nur vor.
//
// Zwei Regeln, die im Code auftauchen und leicht wie Nachlaessigkeit
// aussehen, aber Absicht sind:
//
// 1. Kein Schreibvorgang haelt den Trichter an. Wenn Firestore nicht
//    erreichbar ist, laeuft der Verkauf weiter - eine Bestellung, die an der
//    Zaehlung scheitert, waere der teuerste denkbare Fehler.
// 2. Es gibt keinen Weg zurueck. Wer den Befund gesehen hat, hat ihn gesehen.

import { messeBild, fasseAufnahmenZusammen, berechneVerhaeltnisse, MESS_BREITE } from "./lifeskin-metrics.js";
import { pruefeAufnahme } from "./lifeskin-face.js";
import { erstelleBefund, ALTERSGRUPPEN } from "./lifeskin-rules.js";
import { STANDARD_KONFIG, STANDARD_PRODUKTE, tagespreis, einzelpreisSumme } from "./lifeskin-catalog.js";
import { OBERFLAECHE, BEFUND_TEXTE, STUFEN_TEXTE, HAFTUNG, findeKombination, t, fuelle } from "./lifeskin-content.js";
import { Sitzung } from "./lifeskin-session.js";

const SCHIRME = ["einstieg", "name", "vorbereitung", "kamera", "analyse", "befund", "empfehlung", "angebot", "anschrift", "danke"];

// Welche Bildschirme in den Verlauf des Browsers kommen.
//
// Kamera und Analyse nicht: Sie sind Durchgangsstationen. Wer vom Befund aus
// zurueckgeht, will nicht mitten in eine laufende Analyse, sondern zur
// Vorbereitung - und von dort die Aufnahme neu machen.
const IM_VERLAUF = Object.freeze(["einstieg", "name", "vorbereitung", "befund", "empfehlung", "angebot", "anschrift"]);

// Der Fortschritt startet bei 20 %. Siehe lifeskin-styles.css.
const FORTSCHRITT = { einstieg: 20, name: 32, vorbereitung: 44, kamera: 56, analyse: 68, befund: 78, empfehlung: 86, angebot: 92, anschrift: 96, danke: 100 };

const $ = (auswahl, wurzel = document) => wurzel.querySelector(auswahl);
const $$ = (auswahl, wurzel = document) => Array.from(wurzel.querySelectorAll(auswahl));

function schreibe(knoten, text) { if (knoten) knoten.textContent = text; }

function warte(ms) { return new Promise((fertig) => setTimeout(fertig, ms)); }

export class Trichter {
  constructor({ konfig = STANDARD_KONFIG, produkte = STANDARD_PRODUKTE } = {}) {
    this.konfig = konfig;
    this.produkte = produkte;
    this.sprache = konfig.sprache || "sq";
    this.sitzung = new Sitzung();
    this.zustand = {
      name: "",
      altersgruppe: "",
      aufnahmen: [],
      messung: null,
      verhaeltnisse: null,
      befund: null,
      anschrift: {}
    };
    this.kamera = { strom: null, laeuft: false, letztesRaster: null, gruenSeit: 0 };
  }

  text(schluessel, werte) {
    const roh = t(OBERFLAECHE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  starte() {
    this.#texteSetzen();
    this.#ereignisse();
    this.zeige("einstieg");
    this.sitzung.starte({ sprache: this.sprache });
  }

  zeige(name, { verlauf = "vor" } = {}) {
    for (const schirm of SCHIRME) {
      const knoten = $(`#ls-${schirm}`);
      if (knoten) knoten.dataset.aktiv = schirm === name ? "ja" : "nein";
    }
    const vorher = this.aktiv;
    this.aktiv = name;

    const balken = $(".ls-fortschritt__balken");
    if (balken) balken.style.width = `${FORTSCHRITT[name] ?? 20}%`;

    // Der Zurueck-Pfeil erscheint nur, wo es etwas zurueckzugehen gibt.
    const zurueck = $(`#ls-${name} [data-zurueck]`);
    if (zurueck) zurueck.hidden = name === "einstieg" || name === "danke";

    window.scrollTo(0, 0);

    if (verlauf === "nein" || !IM_VERLAUF.includes(name)) return;
    try {
      if (!vorher) {
        history.replaceState({ ls: name }, "");
      } else if (name === "danke") {
        history.replaceState({ ls: name }, "");
      } else {
        history.pushState({ ls: name }, "");
      }
    } catch {
      // Ohne Verlauf laeuft der Trichter weiter. Nur der Zurueck-Knopf des
      // Browsers verhaelt sich dann wie vorher.
    }
  }

  // Ein Schritt zurueck, egal ob per Pfeil oder per Browser-Knopf.
  //
  // Die Kamera wird dabei immer abgeschaltet: Ein weiterlaufender Kamerastrom
  // hinter einem anderen Bildschirm leert den Akku, laesst die Leuchte an und
  // ist auf dem Handy das Erste, was auffaellt.
  zurueckZu(ziel) {
    if (!SCHIRME.includes(ziel)) return;
    this.#kameraStoppen();
    this.zeige(ziel, { verlauf: "nein" });
  }

  // Wohin ein Zurueck von hier fuehrt.
  vorherigerSchirm(von = this.aktiv) {
    return {
      name: "einstieg",
      vorbereitung: "name",
      kamera: "vorbereitung",
      analyse: "vorbereitung",
      // Vom Befund aus zurueck heisst: Aufnahme wiederholen.
      befund: "vorbereitung",
      empfehlung: "befund",
      angebot: "empfehlung",
      anschrift: "angebot"
    }[von] || null;
  }

  // Alle Beschriftungen aus lifeskin-content.js. Im Aufbau steht keine
  // einzige Zeichenkette - sonst waere die zweite Sprache nachtraeglich
  // nicht mehr einzuziehen.
  #texteSetzen() {
    for (const knoten of $$("[data-text]")) {
      schreibe(knoten, this.text(knoten.dataset.text));
    }
    for (const knoten of $$("[data-platzhalter]")) {
      knoten.placeholder = this.text(knoten.dataset.platzhalter);
    }
    schreibe($("#ls-haftung"), t(HAFTUNG, this.sprache));

    const alterFeld = $("#ls-alterwahl");
    if (alterFeld && !alterFeld.children.length) {
      for (const gruppe of ALTERSGRUPPEN) {
        const knopf = document.createElement("button");
        knopf.type = "button";
        knopf.className = "ls-alter__wahl";
        knopf.textContent = gruppe;
        knopf.setAttribute("aria-pressed", "false");
        knopf.dataset.gruppe = gruppe;
        alterFeld.appendChild(knopf);
      }
    }
  }

  #ereignisse() {
    // Der Zurueck-Knopf des Browsers.
    //
    // Ohne diese Behandlung verliess er den Trichter ganz und der Besucher
    // landete irgendwo anders - bei jemandem, der aus einer Anzeige kommt,
    // heisst das: weg. Auf dem Handy ist die Wischgeste nach rechts derselbe
    // Weg, also trifft es mehr Leute, als man denkt.
    window.addEventListener("popstate", (ereignis) => {
      const ziel = ereignis.state?.ls;
      // Kein eigener Zustand: Der Besucher ist vor dem Trichter angekommen
      // und darf gehen.
      if (!ziel || !SCHIRME.includes(ziel)) return;
      this.zurueckZu(ziel);
    });

    // Der sichtbare Pfeil. Viele benutzen den Browser-Knopf nie.
    for (const knopf of $$("[data-zurueck]")) {
      knopf.addEventListener("click", () => {
        const ziel = this.vorherigerSchirm();
        if (!ziel) return;
        // ueber den Verlauf zurueck, damit beide Wege dieselbe Kette teilen
        // und der Vorwaerts-Knopf danach noch stimmt.
        if (history.state?.ls && history.length > 1) history.back();
        else this.zurueckZu(ziel);
      });
    }

    $("#ls-start")?.addEventListener("click", () => this.zeige("name"));

    $("#ls-alterwahl")?.addEventListener("click", (ereignis) => {
      const knopf = ereignis.target.closest("[data-gruppe]");
      if (!knopf) return;
      for (const anderer of $$("#ls-alterwahl .ls-alter__wahl")) {
        anderer.setAttribute("aria-pressed", anderer === knopf ? "true" : "false");
      }
      this.zustand.altersgruppe = knopf.dataset.gruppe;
      this.#nameWeiterPruefen();
    });

    $("#ls-namefeld")?.addEventListener("input", (ereignis) => {
      this.zustand.name = ereignis.target.value.trim();
      this.#nameWeiterPruefen();
    });

    $("#ls-nameweiter")?.addEventListener("click", () => {
      this.sitzung.schritt("named", {
        name: this.zustand.name,
        ageBand: this.zustand.altersgruppe
      });
      this.zeige("vorbereitung");
    });

    $("#ls-kameraoeffnen")?.addEventListener("click", () => this.#kameraStarten());
    $("#ls-manuell")?.addEventListener("click", () => this.#aufnehmen());
    $("#ls-befundweiter")?.addEventListener("click", () => {
      this.sitzung.schritt("offer");
      this.#empfehlungZeigen();
    });
    $("#ls-empfehlungweiter")?.addEventListener("click", () => this.#angebotZeigen());
    $("#ls-bestellen")?.addEventListener("click", () => {
      // Wer nach der Bestellung zurueckblaettert, sieht das Angebot wieder.
      // Von dort darf es nicht ein zweites Mal in das Formular gehen - sonst
      // liegt dieselbe Bestellung zweimal im Bericht und zweimal beim Kunden
      // vor der Tuer.
      if (this.zustand.bestellnummer) { this.zeige("danke", { verlauf: "nein" }); return; }
      this.sitzung.schritt("address");
      this.#anschriftZeigen();
    });
    $("#ls-absenden")?.addEventListener("click", () => this.#bestellungAbsenden());
    $("#ls-whatsapp")?.addEventListener("click", () => this.#whatsappGriff());

    // Jedes Feld beim Verlassen einzeln speichern. Genau daraus entsteht die
    // Liste "Anschrift da, aber nicht bestellt".
    for (const feld of $$("#ls-formular [name]")) {
      feld.addEventListener("blur", () => {
        this.zustand.anschrift[feld.name] = feld.value.trim();
        if (feld.value.trim()) {
          this.sitzung.ergaenze({ address: { ...this.zustand.anschrift } });
        }
      });
    }
  }

  #nameWeiterPruefen() {
    const knopf = $("#ls-nameweiter");
    if (knopf) knopf.disabled = !(this.zustand.name.length >= 2 && this.zustand.altersgruppe);
  }

  // ---------- Kamera ----------

  async #kameraStarten() {
    // Wer die Vorbereitung zweimal durchlaeuft, soll keinen zweiten Strom
    // aufmachen.
    this.#kameraStoppen();
    this.kamera.letztesRaster = null;
    this.kamera.gruenSeit = 0;
    const video = $("#ls-video");
    this.zeige("kamera");
    this.sitzung.schritt("camera");

    try {
      // Nur nach einer Berührung - iOS erlaubt es nicht anders.
      this.kamera.strom = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 1280 }
        },
        audio: false
      });
      video.srcObject = this.kamera.strom;
      // playsinline steht auch im Aufbau. Ohne beides springt Safari in den
      // Vollbildmodus und der Trichter bricht ab.
      video.setAttribute("playsinline", "");
      await video.play();
      this.kamera.laeuft = true;
      this.#pruefschleife();
    } catch {
      this.#fehlerZeigen("fehlerKamera", () => this.#kameraStarten());
    }
  }

  #bildHolen() {
    const video = $("#ls-video");
    const leinwand = $("#ls-leinwand");
    if (!video?.videoWidth) return null;

    const breite = MESS_BREITE;
    const hoehe = Math.round((video.videoHeight / video.videoWidth) * breite);
    leinwand.width = breite;
    leinwand.height = hoehe;
    const stift = leinwand.getContext("2d", { willReadFrequently: true });
    stift.drawImage(video, 0, 0, breite, hoehe);
    return stift.getImageData(0, 0, breite, hoehe);
  }

  #oval(bild) {
    // Deckt sich mit .ls-oval__ring im CSS. Beide Werte muessen
    // zusammenpassen, sonst prueft die Seite eine andere Stelle als die,
    // in die der Besucher sein Gesicht legt.
    return { x: bild.width * 0.16, y: bild.height * 0.14, w: bild.width * 0.68, h: bild.height * 0.60 };
  }

  #pruefschleife() {
    if (!this.kamera.laeuft) return;

    const bild = this.#bildHolen();
    if (!bild) { requestAnimationFrame(() => this.#pruefschleife()); return; }

    const ergebnis = pruefeAufnahme(bild, this.#oval(bild), this.kamera.letztesRaster);
    this.kamera.letztesRaster = ergebnis.raster;
    this.#pruefungenZeigen(ergebnis);

    if (ergebnis.bereit) {
      if (!this.kamera.gruenSeit) this.kamera.gruenSeit = Date.now();
      // Drei Sekunden Gruen, dann loest es selbst aus. Kein Ausloeser
      // bedeutet: keine Angst, etwas falsch zu machen - und gleiche
      // Aufnahmebedingungen bei jedem Besucher.
      if (Date.now() - this.kamera.gruenSeit >= 3000) { this.#aufnehmen(); return; }
    } else {
      this.kamera.gruenSeit = 0;
    }

    setTimeout(() => this.#pruefschleife(), 120);
  }

  #pruefungenZeigen(ergebnis) {
    const namen = { gesicht: "gesicht", abstand: "abstand", licht: "licht", ruhe: "ruhe" };
    for (const [schluessel] of Object.entries(namen)) {
      const knoten = $(`#ls-pruefung-${schluessel}`);
      if (knoten) knoten.dataset.ok = ergebnis.pruefungen[schluessel] ? "ja" : "nein";
    }

    const oval = $("#ls-oval");
    const anzahlOk = Object.values(ergebnis.pruefungen).filter(Boolean).length;
    if (oval) oval.dataset.stand = anzahlOk === 4 ? "gruen" : anzahlOk >= 2 ? "gelb" : "rot";

    const hinweise = {
      keinGesicht: "fehlerKeinGesicht",
      zuNah: "aufnahmeHinweisNah",
      zuFern: "aufnahmeHinweisFern",
      zuDunkel: "aufnahmeHinweisDunkel",
      zuHell: "aufnahmeHinweisHell"
    };
    schreibe($("#ls-kamerahinweis"),
      ergebnis.bereit ? this.text("aufnahmeGleich")
        : ergebnis.hinweis ? this.text(hinweise[ergebnis.hinweis])
        : "");
  }

  // Drei Aufnahmen in anderthalb Sekunden. Der Median je Messwert wirft
  // einen Wimpernschlag oder ein Lichtflackern heraus.
  async #aufnehmen() {
    if (!this.kamera.laeuft) return;
    this.kamera.laeuft = false;

    const messungen = [];
    let letztesBild = null;
    for (let i = 0; i < 3; i += 1) {
      const bild = this.#bildHolen();
      if (!bild) continue;
      const geprueft = pruefeAufnahme(bild, this.#oval(bild));
      if (geprueft.punkte) {
        messungen.push(messeBild(bild, geprueft.punkte));
        letztesBild = bild;
      }
      if (i < 2) await warte(500);
    }

    this.#kameraStoppen();

    if (!messungen.length) {
      this.#fehlerZeigen("fehlerKeinGesicht", () => this.#kameraStarten());
      return;
    }

    this.zustand.messung = fasseAufnahmenZusammen(messungen);
    this.zustand.verhaeltnisse = berechneVerhaeltnisse(this.zustand.messung);
    this.zustand.vorschau = letztesBild ? this.#alsBild(letztesBild) : null;

    this.sitzung.schritt("captured", {
      metrics: this.zustand.messung,
      ratios: this.zustand.verhaeltnisse
    });
    this.#analyseZeigen();
  }

  #alsBild(bild) {
    const leinwand = document.createElement("canvas");
    leinwand.width = bild.width;
    leinwand.height = bild.height;
    leinwand.getContext("2d").putImageData(bild, 0, 0);
    return leinwand.toDataURL("image/jpeg", 0.82);
  }

  #kameraStoppen() {
    this.kamera.laeuft = false;
    for (const spur of this.kamera.strom?.getTracks() || []) spur.stop();
    this.kamera.strom = null;
    const video = $("#ls-video");
    if (video) video.srcObject = null;
  }

  // ---------- Analyse: die sichtbare Arbeit ----------

  async #analyseZeigen() {
    this.zeige("analyse");

    const bild = $("#ls-analysebild");
    if (bild && this.zustand.vorschau) bild.src = this.zustand.vorschau;

    // Gerechnet wird sofort. Die Anzeige laeuft danach - sie erfindet
    // nichts, sie benennt, was gerade geschehen ist. Menschen bewerten ein
    // Ergebnis hoeher, wenn sie die Arbeit dahinter gesehen haben.
    this.zustand.befund = erstelleBefund({
      messung: this.zustand.messung,
      verhaeltnisse: this.zustand.verhaeltnisse,
      altersgruppe: this.zustand.altersgruppe,
      produkte: this.produkte,
      setGroesse: this.konfig.setGroesse
    });

    const zeilen = [
      this.text("analyseZonen"),
      this.text("analyseTzone"),
      this.text("analyseRoetung"),
      this.text("analyseTextur"),
      this.text("analyseVergleich", { gruppe: this.zustand.altersgruppe }),
      this.text("analyseRoutine")
    ];

    const liste = $("#ls-analyseschritte");
    liste.innerHTML = "";
    const knoten = zeilen.map((zeile) => {
      const el = document.createElement("div");
      el.className = "ls-schrittzeile";
      el.dataset.stand = "wartet";
      el.innerHTML = `<span class="ls-schrittzeile__haken" aria-hidden="true"></span><span></span>`;
      el.lastElementChild.textContent = zeile;
      liste.appendChild(el);
      return el;
    });

    const proSchritt = Math.round((this.konfig.analyseAnzeigeMs || 7000) / zeilen.length);
    for (const el of knoten) {
      el.dataset.stand = "laeuft";
      await warte(proSchritt);
      el.dataset.stand = "fertig";
      el.firstElementChild.textContent = "✓";
    }

    this.#befundZeigen();
  }

  // ---------- Befund ----------

  #befundZeigen() {
    const { hauttyp, befunde, positives, hauptbefunde } = this.zustand.befund;

    schreibe($("#ls-befundtitel"), this.text("befundTitel", { name: this.zustand.name }));
    schreibe($("#ls-hauttyp"), t(hauttyp.label, this.sprache));

    // Zuerst das Lob, dann die Probleme. Eine reine Maengelliste loest
    // Abwehr aus; ein glaubwuerdiges Lob macht die Kritik erst annehmbar.
    const lobKasten = $("#ls-lob");
    if (positives) {
      lobKasten.classList.remove("ls-verstecken");
      schreibe($("#ls-lobtext"), t(BEFUND_TEXTE[positives.id][0], this.sprache));
    } else {
      lobKasten.classList.add("ls-verstecken");
    }

    const liste = $("#ls-werte");
    liste.innerHTML = "";
    const farben = ["var(--stufe-0)", "var(--stufe-1)", "var(--stufe-2)", "var(--stufe-3)"];

    // Absteigend: Was am meisten auffaellt, steht oben.
    //
    // Der geloebte Befund faellt aus der Liste heraus. Er steht schon oben im
    // Kasten, und zweimal derselbe Satz auf einem Bildschirm liest sich wie
    // ein Fehler - gerade bei ruhiger Haut, wo ohnehin wenig zu sagen ist.
    const reihenfolge = [
      ...hauptbefunde,
      ...befunde.filter((b) => b.stufe === 0 && b.id !== positives?.id)
    ];
    for (const befund of reihenfolge) {
      const el = document.createElement("div");
      el.className = "ls-wert";
      el.innerHTML = `
        <div class="ls-wert__kopf">
          <span class="ls-wert__name"></span>
          <span class="ls-wert__stufe"></span>
        </div>
        <div class="ls-wert__leiste"><div class="ls-wert__fuell"></div></div>
        <p class="ls-wert__text"></p>`;
      schreibe($(".ls-wert__name", el), t(befund.label, this.sprache));
      schreibe($(".ls-wert__stufe", el), t(STUFEN_TEXTE[befund.stufe], this.sprache));
      schreibe($(".ls-wert__text", el), t(BEFUND_TEXTE[befund.id][befund.stufe], this.sprache));
      const fuell = $(".ls-wert__fuell", el);
      fuell.style.background = farben[befund.stufe];
      fuell.style.width = `${[14, 42, 70, 96][befund.stufe]}%`;
      liste.appendChild(el);
    }

    const kombi = findeKombination(befunde);
    const kombiKasten = $("#ls-kombi");
    if (kombi) {
      kombiKasten.classList.remove("ls-verstecken");
      schreibe(kombiKasten, t(kombi.text, this.sprache));
    } else if (!hauptbefunde.length) {
      // Kein einziger Befund: Das muss gesagt werden, sonst steht der Kunde
      // vor sechs gruenen Balken und fragt sich, wofuer er gleich zahlen soll.
      kombiKasten.classList.remove("ls-verstecken");
      schreibe(kombiKasten, this.text("befundOhneMangel"));
    } else {
      kombiKasten.classList.add("ls-verstecken");
    }

    this.sitzung.schritt("result", {
      skinType: hauttyp.id,
      findings: befunde.map((b) => ({ id: b.id, stufe: b.stufe }))
    });
    this.zeige("befund");
  }

  // ---------- Empfehlung ----------

  #empfehlungZeigen() {
    const liste = $("#ls-produkte");
    liste.innerHTML = "";

    for (const eintrag of this.zustand.befund.empfehlung) {
      const produkt = eintrag.produkt;
      const befund = this.zustand.befund.befunde.find((b) => b.id === eintrag.wegen);
      const el = document.createElement("div");
      el.className = "ls-produkt";
      el.innerHTML = `
        <img class="ls-produkt__bild" alt="" loading="lazy">
        <div class="ls-produkt__leib">
          <span class="ls-produkt__zeit"></span>
          <span class="ls-produkt__name"></span>
          <span class="ls-produkt__wegen"></span>
          <p class="ls-produkt__text"></p>
        </div>`;
      const bild = $(".ls-produkt__bild", el);
      if (produkt.photoRef) bild.src = produkt.photoRef; else bild.remove();

      schreibe($(".ls-produkt__zeit", el),
        produkt.routine === "morning" ? this.text("routineMorgens")
          : produkt.routine === "evening" ? this.text("routineAbends")
          : `${this.text("routineMorgens")} · ${this.text("routineAbends")}`);
      schreibe($(".ls-produkt__name", el), produkt.name);
      // Jedes Produkt haengt sichtbar an einem Befund. Das ist keine
      // Produktempfehlung mehr, sondern die Behandlung zu einer eben
      // angenommenen Diagnose.
      schreibe($(".ls-produkt__wegen", el),
        eintrag.grundpflege || !befund
          ? this.text("empfehlungErhaltung")
          : this.text("empfehlungWegen", { befund: t(befund.label, this.sprache).toLowerCase() }));
      schreibe($(".ls-produkt__text", el), t(produkt.beschreibung, this.sprache));
      liste.appendChild(el);
    }

    this.zeige("empfehlung");
  }

  // ---------- Angebot ----------

  #angebotZeigen() {
    const gewaehlt = this.zustand.befund.empfehlung.map((e) => e.produkt);
    const summe = einzelpreisSumme(gewaehlt);
    const sparen = { summe, gespart: summe - this.konfig.setPreis };

    schreibe($("#ls-angebottitel"), this.text("angebotTitel", { name: this.zustand.name }));
    schreibe($("#ls-anker"), `${summe} €`);
    schreibe($("#ls-setpreis"), `${this.konfig.setPreis} €`);
    // Eine Ersparnis wird nur ausgewiesen, wenn es sie gibt. Ein "Sie sparen
    // -43 EUR" waere schlimmer als gar kein Ankerpreis.
    const spartKnoten = $("#ls-spart");
    if (sparen.gespart > 0) {
      spartKnoten.classList.remove("ls-verstecken");
      schreibe(spartKnoten, this.text("angebotSpart", { betrag: sparen.gespart }));
    } else {
      spartKnoten.classList.add("ls-verstecken");
    }
    $("#ls-anker").classList.toggle("ls-verstecken", !(summe > this.konfig.setPreis));
    schreibe($("#ls-protag"), this.text("angebotProTag", {
      tage: Math.round(this.konfig.reichweiteTage / 7),
      preis: String(tagespreis(this.konfig)).replace(".", ",")
    }));
    schreibe($("#ls-rueckgabe"), this.text("angebotRueckgabe", { tage: this.konfig.rueckgabeTage }));
    schreibe($("#ls-lieferzeit"), this.text("angebotLieferung", {
      von: this.konfig.lieferzeitTage[0], bis: this.konfig.lieferzeitTage[1]
    }));

    const einzelnListe = $("#ls-einzelpreise");
    einzelnListe.innerHTML = "";
    for (const produkt of gewaehlt) {
      const zeile = document.createElement("div");
      zeile.className = "ls-preis__zeile";
      zeile.innerHTML = `<span class="ls-preis__einzeln"></span><span class="ls-preis__einzeln"></span>`;
      schreibe(zeile.children[0], `${produkt.name} ${produkt.inhalt || ""}`.trim());
      schreibe(zeile.children[1], `${produkt.einzelpreis} €`);
      einzelnListe.appendChild(zeile);
    }

    this.zeige("angebot");
  }

  // ---------- Anschrift und Bestellung ----------

  #anschriftZeigen() {
    schreibe($("#ls-uebersichtname"), this.text("angebotTitel", { name: this.zustand.name }));
    schreibe($("#ls-uebersichtpreis"), `${this.konfig.setPreis} €`);
    const nameFeld = $("#ls-formular [name='name']");
    // Den Namen haben wir schon. Ein Feld weniger ist Konversion.
    if (nameFeld && !nameFeld.value) nameFeld.value = this.zustand.name;
    this.zeige("anschrift");
  }

  async #bestellungAbsenden() {
    const knopf = $("#ls-absenden");
    const pflicht = ["name", "strasse", "ort", "telefon"];
    let fehlt = false;

    for (const feldName of pflicht) {
      const feld = $(`#ls-formular [name='${feldName}']`);
      const leer = !feld?.value.trim();
      feld?.setAttribute("aria-invalid", leer ? "true" : "false");
      if (leer && !fehlt) { feld?.focus(); fehlt = true; }
    }
    if (fehlt) return;

    knopf.disabled = true;
    schreibe(knopf, this.text("bestellLaeuft"));

    const anschrift = {};
    for (const feld of $$("#ls-formular [name]")) anschrift[feld.name] = feld.value.trim();

    const nummer = `LS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      await this.sitzung.schritt("ordered", {
        address: anschrift,
        order: {
          orderId: nummer,
          // Der Preis steht hier nur zur Anzeige. Entschieden wird er auf
          // dem Server gegen die Konfiguration - sonst bestellt jemand das
          // Set fuer einen Euro.
          total: this.konfig.setPreis,
          products: this.zustand.befund.empfehlung.map((e) => e.produkt.id),
          payment: "nachnahme",
          status: "neu",
          placedAt: new Date().toISOString()
        }
      });
      this.#dankeZeigen(nummer);
    } catch {
      knopf.disabled = false;
      schreibe(knopf, this.text("bestellKnopf"));
      this.#fehlerZeigen("fehlerBestellung", () => this.#bestellungAbsenden());
    }
  }

  #dankeZeigen(nummer) {
    this.zustand.bestellnummer = nummer;
    schreibe($("#ls-danketitel"), this.text("dankeTitel", { name: this.zustand.name }));
    schreibe($("#ls-dankenummer"), this.text("dankeNummer", { nummer }));
    this.zeige("danke");
  }

  // Der Griff nach denen, die nicht kaufen.
  //
  // Steht neben "Weiter" auf dem Befund - vor dem Angebot, solange der Befund
  // frisch ist und noch kein Preis im Raum steht.
  #whatsappGriff() {
    const knopf = $("#ls-whatsapp");
    const feld = $("#ls-whatsappnummer");
    if (feld?.classList.contains("ls-verstecken")) {
      feld.classList.remove("ls-verstecken");
      feld.focus();
      return;
    }
    const nummer = feld?.value.trim();
    if (!nummer) { feld?.focus(); return; }
    this.sitzung.ergaenze({ phone: nummer, phoneConsent: true, phoneConsentMarketing: false });
    feld.classList.add("ls-verstecken");
    knopf.disabled = true;
    schreibe(knopf, "✓");
  }

  #fehlerZeigen(schluessel, nochmal) {
    const kasten = $("#ls-fehler");
    if (!kasten) return;
    kasten.classList.remove("ls-verstecken");
    schreibe($("#ls-fehlertext"), this.text(schluessel));
    const knopf = $("#ls-fehlernochmal");
    schreibe(knopf, this.text("nochmal"));
    knopf.onclick = () => { kasten.classList.add("ls-verstecken"); nochmal?.(); };
  }
}

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => new Trichter().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
