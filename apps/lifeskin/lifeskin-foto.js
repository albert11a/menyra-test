// Die Aufnahme EINER Stelle - der Weg "Me foto".
//
// WARUM DAS NICHT DER SCAN IST, obwohl beides eine Kamera aufmacht.
//
// Der Scan misst ein Gesicht: Er braucht den Ring, die Blickrichtungen,
// das Gesichtsnetz und zehn Bilder, und er loest von selbst aus. Hier
// wird EINE Stelle Haut fotografiert - die Wange, die Stirn, der
// Unterarm -, und der Mensch entscheidet selbst, wann sie richtig im
// Bild liegt. Ein Oval waere dort eine Anweisung, die nicht zu befolgen
// ist, und ein Ring, der von selbst ausloest, ein Bild vom falschen
// Augenblick.
//
// DIE OBERFLAECHE SOLL SICH TROTZDEM WIE DER SCAN ANFUEHLEN: grosse
// Flaeche, ruhige Kanten, ein sichtbarer Ausloeser. Was hier anders ist,
// ist die Form - ein Rechteck mit weichen Ecken statt eines Kreises -
// und dass nichts von selbst passiert.
//
// EIGENES MODUL, aus zwei Gruenden. Erstens ist lifeskin-app.js mit dem
// Scan schon lang genug. Zweitens steht hier die einzige Rechnung dieses
// Wegs (welche Groesse, welche Qualitaet), und die laesst sich ohne
// Browser pruefen - der Rest ist Kamera und damit nur im Geraet zu
// sehen.

// Die Qualitaetsstufen, von oben nach unten durchprobiert.
//
// Ein Firestore-Dokument darf 1 MiB gross sein, und ein Bild steht als
// Text darin - Base64 macht aus drei Byte vier Zeichen. Statt eine feste
// Qualitaet zu raten, die mal zu gross und mal zu schlecht ist, wird die
// beste genommen, die noch passt.
//
// SIE STEHEN HIER UND NICHT IM TRICHTER, obwohl der Scan sie auch
// braucht: Dies ist das kleinere Modul, es haengt an nichts, und der
// Trichter holt sie von hier. Andersherum haette dieses Modul den ganzen
// Scan mitgezogen - fuer drei Zahlen und eine Schleife.
export const FOTO_STUFEN = Object.freeze([0.94, 0.88, 0.82, 0.74, 0.64]);

// Wieviel Text ein Bild hoechstens werden darf. Der Rest des Dokuments -
// Blickrichtung, Zeitstempel, Masse - liegt bei wenigen hundert Byte; der
// Abstand zur Millionengrenze ist Absicht und kein Geiz.
export const FOTO_HOECHSTZEICHEN = 900000;

// Wie breit die Aufnahme gespeichert wird.
//
// Dieselbe Grenze wie beim Scan: Was die Kamera weniger liefert, bleibt
// weniger - hochrechnen erfindet nichts, und die Aerztin sieht auf dieses
// Bild, bevor sie etwas schreibt.
export const FOTO_BREITE = 1440;

// Und die Kachel, die der Patient auf seiner Warteseite sieht. Sie liegt
// neben dem Bericht und ist damit oeffentlich lesbar - deshalb klein,
// und deshalb eine eigene Grenze.
export const MINI_BREITE = 160;
export const MINI_STUFEN = Object.freeze([0.7, 0.6, 0.5, 0.4]);
export const MINI_HOECHSTZEICHEN = 60000;

// Die beste Qualitaet nehmen, die noch in ein Firestore-Dokument passt.
//
// Als reine Funktion und nicht als Methode, damit sie ohne Browser
// nachrechenbar ist: `kodiere(guete)` gibt die fertige Zeichenkette
// zurueck, mehr braucht die Entscheidung nicht. Getestet in
// tests/lifeskin-fotos.test.mjs.
export function besteGuete(kodiere, stufen = FOTO_STUFEN, grenze = FOTO_HOECHSTZEICHEN) {
  for (const guete of stufen) {
    const jpeg = kodiere(guete);
    if (typeof jpeg === "string" && jpeg.length <= grenze) return { jpeg, guete };
  }
  return null;
}

// Auf welche Masse ein Bild heruntergerechnet wird.
//
// Das Seitenverhaeltnis bleibt, und vergroessert wird nie: Ein Telefon,
// das 720 Punkte liefert, bekommt kein Bild mit 1440 - darin stuende
// nichts, was nicht schon in den 720 steht, und es waere viermal so
// gross.
export function zielMasse(breite, hoehe, hoechsteBreite = FOTO_BREITE) {
  const b = Math.max(0, Math.round(Number(breite) || 0));
  const h = Math.max(0, Math.round(Number(hoehe) || 0));
  if (!b || !h) return { breite: 0, hoehe: 0 };
  if (b <= hoechsteBreite) return { breite: b, hoehe: h };
  const faktor = hoechsteBreite / b;
  return { breite: hoechsteBreite, hoehe: Math.max(1, Math.round(h * faktor)) };
}

// Ein Bild auf eine Leinwand zeichnen und als JPEG herausgeben.
//
// `quelle` ist alles, was drawImage annimmt: ein <video>, ein <img>, eine
// Leinwand. Die Masse kommen von aussen, weil ein Video sie anders nennt
// als ein Bild.
//
// `spiegeln` legt das Bild seitenverkehrt ab - so, wie die vordere Kamera
// es in der Vorschau zeigt. Siehe Flaechenkamera#aufnehmen().
export function alsJpeg(quelle, { breite, hoehe, dokument = globalThis.document,
  hoechsteBreite = FOTO_BREITE, stufen = FOTO_STUFEN, grenze = FOTO_HOECHSTZEICHEN,
  spiegeln = false } = {}) {
  const masse = zielMasse(breite, hoehe, hoechsteBreite);
  if (!masse.breite || !dokument?.createElement) return null;
  const leinwand = dokument.createElement("canvas");
  leinwand.width = masse.breite;
  leinwand.height = masse.hoehe;
  try {
    const feld = leinwand.getContext("2d");
    if (!feld) return null;
    if (spiegeln) {
      feld.translate(masse.breite, 0);
      feld.scale(-1, 1);
    }
    feld.drawImage(quelle, 0, 0, masse.breite, masse.hoehe);
    const treffer = besteGuete((guete) => leinwand.toDataURL("image/jpeg", guete), stufen, grenze);
    if (!treffer || !/^data:image\/jpeg;base64,.+/.test(treffer.jpeg)) return null;
    return { jpeg: treffer.jpeg, breite: masse.breite, hoehe: masse.hoehe, guete: treffer.guete };
  } catch {
    // Ein zwischenzeitlich verlorenes Frame oder Canvas darf den
    // Ausloeser nicht ohne Rueckmeldung abbrechen lassen.
    return null;
  } finally {
    try { leinwand.width = 0; leinwand.height = 0; } catch { /* egal */ }
  }
}

// Die Kachel zum selben Bild. Aus DEM AUFGENOMMENEN Bild und nicht noch
// einmal aus der Kamera: Sonst zeigte die Warteseite einen anderen
// Augenblick als die Akte.
export function miniaturAus(quelle, { breite, hoehe, dokument = globalThis.document, spiegeln = false } = {}) {
  return alsJpeg(quelle, {
    breite, hoehe, dokument, spiegeln,
    hoechsteBreite: MINI_BREITE, stufen: MINI_STUFEN, grenze: MINI_HOECHSTZEICHEN
  });
}

// Ein Bild aus einer Datei - der freiwillige Anhang bei Trup und Pytje.
//
// KEINE KAMERA, SONDERN EIN DATEIFELD, und das ist Absicht: Auf dem
// Telefon bietet es beides an, aufnehmen oder aus der Galerie nehmen.
// Wer ein Bild von gestern hat, auf dem der Ausschlag deutlicher war,
// soll genau das schicken duerfen.
//
// SEIT ES DEN AUSWEG UEBER DIE HANDYKAMERA GIBT, kommt hier auch das Bild
// an, das den Scan ersetzt (lifeskin-app.js, #systemFotoErhalten) - aus
// der Kamera-App, also 12 Megapixel und mehr. Zwei Dinge sind deshalb
// anders als vorher:
//
//  - Die Datei wird direkt als Bild geoeffnet (Objekt-Adresse) und nicht
//    erst als Text von mehreren Megabyte gelesen. Auf einem aelteren
//    Telefon im Fenster von Facebook ist dieser Text der Unterschied
//    zwischen einem Bild und einer neu geladenen Seite.
//  - Eine Datei OHNE Typangabe wird nicht verworfen: Manche Webansichten
//    auf Android liefern das Bild aus der Kamera ohne Typ. Ob es ein Bild
//    ist, entscheidet das Dekodieren - was keines ist, laedt nicht.
export async function ausDatei(datei, { dokument = globalThis.document } = {}) {
  const typ = String(datei?.type || "");
  if (!datei || (typ && !/^image\//.test(typ))) return null;
  const geladen = await bildAusDatei(datei);
  if (!geladen) return null;
  const { bild, freigeben } = geladen;
  try {
    const gross = alsJpeg(bild, { breite: bild.naturalWidth, hoehe: bild.naturalHeight, dokument });
    if (!gross) return null;
    const mini = miniaturAus(bild, { breite: bild.naturalWidth, hoehe: bild.naturalHeight, dokument });
    return { foto: gross, mini, vorschau: mini?.jpeg || gross.jpeg };
  } finally {
    freigeben();
  }
}

function bildLaden(adresse) {
  return new Promise((fertig) => {
    const el = new Image();
    el.onload = () => fertig(el);
    el.onerror = () => fertig(null);
    el.src = adresse;
  });
}

async function bildAusDatei(datei) {
  const adressen = globalThis.URL;
  if (typeof adressen?.createObjectURL === "function") {
    let adresse = "";
    try { adresse = adressen.createObjectURL(datei); } catch { adresse = ""; }
    if (adresse) {
      const bild = await bildLaden(adresse);
      const freigeben = () => { try { adressen.revokeObjectURL?.(adresse); } catch { /* egal */ } };
      if (bild) return { bild, freigeben };
      // Was der Browser aus der Datei nicht dekodiert, dekodiert er auch
      // aus Text nicht - kein zweiter Versuch ueber den teuren Umweg.
      freigeben();
      return null;
    }
  }
  // Rueckfall fuer Webansichten ohne Objekt-Adressen: als Text lesen.
  if (typeof FileReader !== "function") return null;
  const quelle = await new Promise((fertig) => {
    const leser = new FileReader();
    leser.onload = () => fertig(String(leser.result || ""));
    leser.onerror = () => fertig("");
    leser.readAsDataURL(datei);
  });
  if (!quelle) return null;
  const bild = await bildLaden(quelle);
  return bild ? { bild, freigeben: () => {} } : null;
}

// ---------------------------------------------------------------------------
// Der Sprungschutz
// ---------------------------------------------------------------------------

// KEIN SICHTBARER SPRUNG, WENN DIE KAMERA BEIM ANLAUFEN UMSCHALTET.
//
// Viele Telefonkameras liefern die ersten Bilder in einer vorlaeufigen
// Aufloesung und schalten dann um - auf alten Androids gern ein- oder
// zweimal in der ersten Sekunde. Wechselt dabei das Seitenverhaeltnis,
// zeigt `object-fit: cover` ploetzlich einen anderen Ausschnitt: Das
// Gesicht springt naeher oder weiter weg.
//
// Frueher stand deshalb der Spinner, bis die Groesse eine Weile ruhig
// war - das kostete bei jedem Start Zeit, auch auf den Geraeten, die gar
// nicht springen. Jetzt erscheint das Bild frueh, und in den ersten
// Sekunden liegt eine Leinwand genau darueber, die jedes Bild mitzeichnet
// (gleiche Klasse, gleicher Zuschnitt, gleicher Spiegel - siehe
// .ls-sprung in lifeskin-styles.css). Wer hinsieht, sieht die Leinwand.
//
// Aendert sich die Bildgroesse, zeichnet sie NICHT mit: Das letzte Bild
// vor dem Wechsel bleibt stehen, verdeckt das umschaltende Video und
// blendet erst weich aus, wenn die neue Groesse ruhig steht. Aus dem
// Sprung wird eine Ueberblendung. Dass die Leinwand oben liegt, BEVOR
// der Wechsel erkannt wird, ist der Kern: Chrome setzt Videobilder
// neben dem Hauptfaden zusammen, ein erst beim Wechsel eingeblendetes
// Standbild kaeme mindestens ein Bild zu spaet.
//
// Gemessen wird davon nichts - Scan und Aufnahme lesen weiter das Video.
export const SPRUNG_FENSTER_MS = 3000;
export const SPRUNG_RUHE_MS = 200;
export const SPRUNG_HOECHSTENS_MS = 1000;
export const SPRUNG_BLENDE_MS = 240;

export class Sprungschutz {
  constructor({ video, dokument = globalThis.document, fensterMs = SPRUNG_FENSTER_MS,
    ruheMs = SPRUNG_RUHE_MS, hoechstensMs = SPRUNG_HOECHSTENS_MS, blendeMs = SPRUNG_BLENDE_MS } = {}) {
    this.video = video || null;
    this.dokument = dokument;
    this.fensterMs = fensterMs;
    this.ruheMs = ruheMs;
    this.hoechstensMs = hoechstensMs;
    this.blendeMs = blendeMs;
    this.leinwand = null;
    this.lauf = 0;
    this.bild = 0;
    this.blende = 0;
  }

  #fenster() {
    return this.dokument?.defaultView || globalThis;
  }

  // Die Leinwand liegt unmittelbar hinter dem Video im selben Kasten:
  // darueber, aber unter allem, was danach kommt (Aufnahme, Hinweise).
  #leinwandHolen() {
    if (this.leinwand) return this.leinwand;
    const video = this.video;
    if (!video?.parentNode || typeof this.dokument?.createElement !== "function") return null;
    const leinwand = this.dokument.createElement("canvas");
    if (typeof leinwand?.getContext !== "function") return null;
    leinwand.className = "ls-sprung";
    leinwand.setAttribute?.("aria-hidden", "true");
    video.parentNode.insertBefore(leinwand, video.nextSibling);
    this.leinwand = leinwand;
    return leinwand;
  }

  // Aufrufen, sobald das Bild zu sehen ist - und noch einmal, wenn es
  // nach einer Pause wiederkommt.
  starte() {
    this.stoppe();
    const video = this.video;
    const fenster = this.#fenster();
    const leinwand = this.#leinwandHolen();
    let stift = null;
    try { stift = leinwand?.getContext("2d"); } catch { stift = null; }
    if (!stift || typeof fenster?.requestAnimationFrame !== "function") return false;
    const lauf = (this.lauf += 1);
    const ende = Date.now() + this.fensterMs;
    let masse = "";
    let gefrorenSeit = 0;
    let ruhigSeit = 0;
    const zeichnen = () => {
      const breite = video.videoWidth;
      const hoehe = video.videoHeight;
      if (leinwand.width !== breite) leinwand.width = breite;
      if (leinwand.height !== hoehe) leinwand.height = hoehe;
      stift.drawImage(video, 0, 0, breite, hoehe);
      leinwand.classList.add("ls-sprung--an");
    };
    const takt = () => {
      this.bild = 0;
      if (lauf !== this.lauf) return;
      const jetzt = Date.now();
      const hatBild = video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
      const neu = hatBild ? `${video.videoWidth}x${video.videoHeight}` : masse;
      if (gefrorenSeit) {
        if (neu !== masse) { masse = neu; ruhigSeit = jetzt; }
        if (jetzt - ruhigSeit >= this.ruheMs || jetzt - gefrorenSeit >= this.hoechstensMs) {
          this.#ausblenden(lauf, jetzt < ende ? () => {
            gefrorenSeit = 0;
            this.bild = fenster.requestAnimationFrame(takt);
          } : null);
          return;
        }
      } else if (masse && neu !== masse && leinwand.classList.contains("ls-sprung--an")) {
        // DER WECHSEL. Nicht zeichnen - das Standbild bleibt oben.
        masse = neu;
        gefrorenSeit = jetzt;
        ruhigSeit = jetzt;
      } else if (jetzt >= ende) {
        this.#ausblenden(lauf, null);
        return;
      } else if (hatBild) {
        masse = neu;
        try { zeichnen(); } catch { this.stoppe(); return; }
      }
      this.bild = fenster.requestAnimationFrame(takt);
    };
    takt();
    return true;
  }

  // Weich weg, damit der neue Ausschnitt hereinblendet statt zu springen.
  // Danach liegt die Leinwand unsichtbar und ohne Uebergang bereit: Beim
  // naechsten Zeichnen erscheint sie mit genau dem Bild, das darunter
  // ohnehin steht.
  #ausblenden(lauf, danach) {
    const leinwand = this.leinwand;
    if (!leinwand?.classList.contains("ls-sprung--an")) { if (!danach) this.stoppe(); else danach(); return; }
    leinwand.classList.add("ls-sprung--blende");
    leinwand.classList.remove("ls-sprung--an");
    this.blende = setTimeout(() => {
      this.blende = 0;
      if (lauf !== this.lauf) return;
      leinwand.classList.remove("ls-sprung--blende");
      if (danach) danach(); else this.stoppe();
    }, this.blendeMs);
  }

  stoppe() {
    this.lauf += 1;
    if (this.bild) this.#fenster()?.cancelAnimationFrame?.(this.bild);
    this.bild = 0;
    clearTimeout(this.blende);
    this.blende = 0;
    if (this.leinwand) {
      this.leinwand.classList.remove("ls-sprung--an", "ls-sprung--blende");
      // Den Bildspeicher hergeben: in voller Kameraaufloesung sind das
      // mehrere Megabyte, die nach dem Anlaufen niemand mehr braucht.
      try { this.leinwand.width = 0; this.leinwand.height = 0; } catch { /* egal */ }
    }
  }
}

// ---------------------------------------------------------------------------
// Die Kamera selbst
// ---------------------------------------------------------------------------

// Was hier NICHT passiert: messen, erkennen, von selbst ausloesen. Die
// Klasse macht den Strom auf, haelt ihn am Video und gibt auf Zuruf ein
// Bild heraus. Alles andere entscheidet der Mensch davor.
export class Flaechenkamera {
  constructor({ video, dokument = globalThis.document, medien = null, beiFehler = null, beiBereit = null } = {}) {
    this.video = video || null;
    this.dokument = dokument;
    // Woher der Strom kommt. Im Betrieb steht hier nichts und es gilt
    // navigator.mediaDevices; im Test wird eine Attrappe hereingereicht.
    //
    // ALS ARGUMENT UND NICHT UEBER globalThis: Seit Node 21 ist
    // navigator dort ein Nur-Lese-Zugriff, und ein Test, der ihn setzen
    // will, faellt um. Eine Klasse, die ihre Aussenwelt nur global
    // findet, laesst sich nicht pruefen.
    this.medienQuelle = medien;
    this.beiFehler = typeof beiFehler === "function" ? beiFehler : null;
    this.beiBereit = typeof beiBereit === "function" ? beiBereit : null;
    this.strom = null;
    // Vorne, nicht hinten. Wer "Me foto" waehlt, fotografiert meistens
    // eine Stelle im Gesicht - Wange, Stirn, Kinn -, und das geht nur
    // mit der Kamera, in der man sich sieht. Fuer alles andere steht der
    // Umschalter daneben.
    this.richtung = "user";
    // Wie beim Scan: Jeder Start bekommt eine Nummer, und was aus einem
    // Versprechen zurueckkommt, prueft sie. Ohne das ueberholen sich zwei
    // Starts - und der erste Strom bleibt offen, die Leuchte an.
    this.lauf = 0;
    this.abbrechen = null;
    this.bereit = false;
    this.waechter = null;
    this.sichtbarkeit = null;
    this.letztesBild = 0;
  }

  get laeuft() {
    return Boolean(this.strom);
  }

  async starte(richtung = this.richtung) {
    // DIE ALTE RICHTUNG BLEIBT STEHEN, BIS DIE NEUE WIRKLICH LAEUFT.
    //
    // Sie wurde hier gesetzt, bevor getUserMedia geantwortet hatte. Ein
    // misslungener Wechsel liess die Kamera damit aus UND merkte sich
    // die Richtung, an der er gescheitert war: Der zweite Versuch ging
    // wieder dorthin, und der Weg war zu.
    const vorher = this.richtung;
    const gewuenscht = richtung === "environment" ? "environment" : "user";
    this.stoppe();
    const lauf = (this.lauf += 1);
    const medien = this.medienQuelle || globalThis.navigator?.mediaDevices;
    if (!medien?.getUserMedia) {
      this.beiFehler?.("fehlerKameraBrowser");
      return false;
    }
    let frist;
    let vorbei = false;
    const abbruch = new Promise((_, nein) => {
      this.abbrechen = () => {
        vorbei = true;
        nein(Object.assign(new Error(), { name: "AbortError" }));
      };
      frist = setTimeout(() => {
        vorbei = true;
        nein(Object.assign(new Error(), { name: "TimeoutError" }));
      }, 30000);
    });
    try {
      const holen = async () => {
        const regeln = [
          { facingMode: gewuenscht, width: { ideal: 1920 } },
          { facingMode: gewuenscht },
          true
        ];
        for (let i = 0; i < regeln.length; i++) {
          try {
            const strom = await medien.getUserMedia({ audio: false, video: regeln[i] });
            if (vorbei || lauf !== this.lauf) {
              for (const spur of strom.getTracks()) spur.stop();
              return null;
            }
            return strom;
          } catch (fehler) {
            if (vorbei || lauf !== this.lauf || i === regeln.length - 1
              || !["OverconstrainedError", "ConstraintNotSatisfiedError", "AbortError"].includes(fehler?.name)) throw fehler;
          }
        }
      };
      const strom = await Promise.race([holen(), abbruch]);
      clearTimeout(frist);
      // In der Zwischenzeit wurde neu gestartet oder abgebrochen: Diesen
      // Strom sofort wieder zumachen, sonst bleibt die Leuchte an.
      if (lauf !== this.lauf) {
        for (const spur of strom?.getTracks() || []) spur.stop();
        return false;
      }
      this.strom = strom;
      // WELCHE KAMERA ES WIRKLICH GEWORDEN IST.
      //
      // facingMode ist eine Bitte, keine Bedingung ("ideal", nicht
      // "exact") - ein Geraet mit nur einer Kamera liefert dieselbe
      // zurueck. Wer sich dann selbst sieht, bekaeme trotzdem eine
      // Vorschau ohne Spiegel, weil hier "environment" stuende. Steht
      // die Auskunft nicht zur Verfuegung, gilt das Gewuenschte.
      const wirklich = strom.getVideoTracks?.()[0]?.getSettings?.()?.facingMode;
      this.richtung = wirklich === "user" || wirklich === "environment" ? wirklich : gewuenscht;
      if (this.video) {
        this.video.setAttribute("playsinline", "");
        this.video.setAttribute("webkit-playsinline", "");
        this.video.muted = true;
        this.video.defaultMuted = true;
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.srcObject = strom;
        const bereit = await this.#bildBereit(lauf);
        if (lauf !== this.lauf) return false;
        if (!bereit) {
          this.richtung = vorher;
          this.stoppe();
          this.beiFehler?.("fehlerKameraBild");
          return false;
        }
      }
      this.bereit = Boolean(this.video);
      if (this.bereit) {
        this.#ueberwachen(lauf);
        this.sprung ||= new Sprungschutz({ video: this.video, dokument: this.dokument });
        this.sprung.starte();
      }
      return true;
    } catch (fehler) {
      if (lauf !== this.lauf) return false;
      // Die Richtung faellt auf die zurueck, die vorher lief: Der
      // naechste Versuch soll nicht wieder dorthin gehen, wo es gerade
      // nicht ging.
      this.richtung = vorher;
      this.stoppe();
      // JEDER GRUND BEKOMMT SEINEN EIGENEN SATZ, und zwar denselben wie
      // beim Scan: Wer die Freigabe verweigert hat, braucht eine andere
      // Auskunft als wer eine Kamera hat, die gerade jemand anderes
      // benutzt. Die Texte stehen in lifeskin-content.js und werden von
      // beiden Wegen geteilt - zwei Saetze fuer denselben Fall waeren
      // zwei Gelegenheiten, einen davon zu vergessen.
      const grund = String(fehler?.name || "");
      this.beiFehler?.({
        NotAllowedError: "fehlerKameraErlaubnis", SecurityError: "fehlerKameraErlaubnis",
        NotSupportedError: "fehlerKameraBrowser", NotFoundError: "fehlerKameraFehlt",
        NotReadableError: "fehlerKameraBelegt", TimeoutError: "fehlerKameraWartet"
      }[grund] || "fehlerKamera");
      return false;
    } finally {
      clearTimeout(frist);
      if (lauf === this.lauf) this.abbrechen = null;
    }
  }

  // play() kann offen bleiben, obwohl Bilder kommen. Entscheidend ist
  // ein dekodiertes Bild mit kurz stabiler Aufloesung, nicht das Promise.
  // 200 ms ruhig oder 700 ms ab dem ersten Bild - dieselben Zahlen wie
  // #videoBereit() beim Scan (dort steht, warum nicht mehr 450 / 1400).
  #bildBereit(lauf) {
    const video = this.video;
    return new Promise((ja) => {
      let takt, masse = "", ruhigSeit = 0, erstesBild = 0;
      let sichtbarMs = 0, zuletzt = Date.now(), verborgen = Boolean(this.dokument?.hidden);
      let letzterStart = -1000;
      const fertig = (ok) => { clearInterval(takt); ja(ok); };
      this.abbrechen = () => fertig(false);
      const pruefen = () => {
        if (lauf !== this.lauf) { fertig(false); return; }
        const jetzt = Date.now();
        if (!verborgen) sichtbarMs += jetzt - zuletzt;
        zuletzt = jetzt;
        verborgen = Boolean(this.dokument?.hidden);
        if (verborgen) { masse = ""; erstesBild = 0; return; }
        if ((video.paused || video.readyState < 2) && sichtbarMs - letzterStart >= 800) {
          letzterStart = sichtbarMs;
          try { Promise.resolve(video.play()).catch(() => {}); } catch { /* naechster Versuch */ }
        }
        if (this.#hatBild()) {
          const neu = `${video.videoWidth}x${video.videoHeight}`;
          if (!erstesBild) erstesBild = sichtbarMs;
          if (neu !== masse) { masse = neu; ruhigSeit = sichtbarMs; }
          if (sichtbarMs - ruhigSeit >= 200 || sichtbarMs - erstesBild >= 700) {
            fertig(true); return;
          }
        } else { masse = ""; erstesBild = 0; }
        if (sichtbarMs >= 10000) fertig(false);
      };
      takt = setInterval(pruefen, 60);
      // Vor der ersten Pruefung anstossen, auch bei noch alten Metadaten.
      try { Promise.resolve(video.play()).catch(() => {}); } catch { /* Pruefung versucht erneut */ }
      pruefen();
    });
  }

  #hatBild() {
    const video = this.video;
    const spur = this.strom?.getVideoTracks?.()[0];
    return Boolean(this.strom && !this.dokument?.hidden && video?.readyState >= 2
      && video.videoWidth > 0 && video.videoHeight > 0 && !video.paused && !video.ended
      && spur?.readyState === "live" && !spur.muted && spur.enabled !== false);
  }

  #bereitSetzen(ok) {
    if (this.bereit === ok) return;
    this.bereit = ok;
    this.beiBereit?.(ok);
  }

  // Auch nach dem Start pruefen: alte Metadaten beweisen kein neues Bild.
  #ueberwachen(lauf) {
    const video = this.video;
    let bildzeit = video.currentTime;
    let verborgen = Boolean(this.dokument?.hidden);
    this.letztesBild = Date.now();
    const pruefen = () => {
      if (lauf !== this.lauf) return;
      const jetzt = Date.now();
      if (this.dokument?.hidden) {
        verborgen = true;
        this.letztesBild = jetzt;
        this.#bereitSetzen(false);
        return;
      }
      if (verborgen) {
        verborgen = false;
        bildzeit = video.currentTime;
        this.letztesBild = jetzt;
        try { Promise.resolve(video.play()).catch(() => {}); } catch { /* naechster Takt */ }
        this.sprung?.starte();
      }
      const spur = this.strom?.getVideoTracks?.()[0];
      if (!spur || spur.readyState === "ended") {
        this.stoppe(); this.beiFehler?.("fehlerKameraUnterbrochen"); return;
      }
      if (this.#hatBild() && video.currentTime !== bildzeit) {
        bildzeit = video.currentTime;
        this.letztesBild = jetzt;
        this.#bereitSetzen(true);
      } else {
        if (!this.#hatBild() || jetzt - this.letztesBild > 2000) this.#bereitSetzen(false);
        if (video.paused) {
          try { Promise.resolve(video.play()).catch(() => {}); } catch { /* naechster Takt */ }
        }
      }
      if (jetzt - this.letztesBild >= 10000) {
        this.stoppe(); this.beiFehler?.("fehlerKameraBild");
      }
    };
    this.waechter = setInterval(pruefen, 250);
    this.sichtbarkeit = pruefen;
    this.dokument?.addEventListener?.("visibilitychange", pruefen);
    pruefen();
  }

  // Vorne oder hinten. Fuer eine Stelle am Ruecken oder am Arm hilft die
  // Kamera, in der man sich sieht, nichts.
  async wechsle() {
    return this.starte(this.richtung === "user" ? "environment" : "user");
  }

  // Das Bild, wie es gerade im Rahmen steht - UND ZWAR SEITENGLEICH.
  //
  // Hier stand "nicht gespiegelt": Gespiegelt wurde nur die Vorschau im
  // Stilblatt, die Aufnahme ging ungespiegelt hinaus. Genau das sah der
  // Besucher als Fehler: Beim Ausloesen sprang sein Bild seitenverkehrt
  // um, und dasselbe umgedrehte Bild stand danach als "gespeichert" auf
  // dem Nummernschirm und auf der Warteseite.
  //
  // Jetzt ist die Aufnahme das, was im Rahmen stand. Mit der vorderen
  // Kamera heisst das: gespiegelt, wie ein Spiegel - genau wie der Scan
  // seine Bilder seit jeher ablegt (#spiegelnAuf in lifeskin-app.js).
  // Die Aerztin bekommt damit auf beiden Wegen dieselbe Seitenlage, und
  // der Befund nennt ohnehin nie "links" oder "rechts" (siehe
  // docs/lifeskin-prompt-v9.txt). Die hintere Kamera zeigt ungespiegelt
  // und nimmt ungespiegelt auf.
  aufnehmen() {
    const video = this.video;
    if (!this.bereit || !this.#hatBild() || Date.now() - this.letztesBild > 2000) return null;
    const spiegeln = this.richtung === "user";
    const gross = alsJpeg(video, {
      breite: video.videoWidth, hoehe: video.videoHeight, dokument: this.dokument, spiegeln
    });
    if (!gross) return null;
    const mini = miniaturAus(video, {
      breite: video.videoWidth, hoehe: video.videoHeight, dokument: this.dokument, spiegeln
    });
    return { foto: gross, mini, vorschau: gross.jpeg };
  }

  stoppe() {
    this.lauf += 1;
    this.sprung?.stoppe();
    this.#bereitSetzen(false);
    clearInterval(this.waechter);
    this.waechter = null;
    if (this.sichtbarkeit) this.dokument?.removeEventListener?.("visibilitychange", this.sichtbarkeit);
    this.sichtbarkeit = null;
    this.abbrechen?.();
    this.abbrechen = null;
    for (const spur of this.strom?.getTracks() || []) spur.stop();
    this.strom = null;
    if (this.video) {
      try { this.video.pause(); } catch { /* aeltere Webansichten */ }
      this.video.srcObject = null;
    }
  }
}
