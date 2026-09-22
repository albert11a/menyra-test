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
export function alsJpeg(quelle, { breite, hoehe, dokument = globalThis.document,
  hoechsteBreite = FOTO_BREITE, stufen = FOTO_STUFEN, grenze = FOTO_HOECHSTZEICHEN } = {}) {
  const masse = zielMasse(breite, hoehe, hoechsteBreite);
  if (!masse.breite || !dokument?.createElement) return null;
  const leinwand = dokument.createElement("canvas");
  leinwand.width = masse.breite;
  leinwand.height = masse.hoehe;
  const feld = leinwand.getContext("2d");
  if (!feld) return null;
  feld.drawImage(quelle, 0, 0, masse.breite, masse.hoehe);
  const treffer = besteGuete((guete) => leinwand.toDataURL("image/jpeg", guete), stufen, grenze);
  // Die Leinwand ausdruecklich leeren: Ein Bild in voller Aufloesung sind
  // ein paar Megabyte, und auf einem Telefon mit wenig Speicher
  // entscheidet genau das, ob die Seite danach noch steht.
  try { leinwand.width = 0; leinwand.height = 0; } catch { /* egal */ }
  if (!treffer) return null;
  return { jpeg: treffer.jpeg, breite: masse.breite, hoehe: masse.hoehe, guete: treffer.guete };
}

// Die Kachel zum selben Bild. Aus DEM AUFGENOMMENEN Bild und nicht noch
// einmal aus der Kamera: Sonst zeigte die Warteseite einen anderen
// Augenblick als die Akte.
export function miniaturAus(quelle, { breite, hoehe, dokument = globalThis.document } = {}) {
  return alsJpeg(quelle, {
    breite, hoehe, dokument,
    hoechsteBreite: MINI_BREITE, stufen: MINI_STUFEN, grenze: MINI_HOECHSTZEICHEN
  });
}

// Ein Bild aus einer Datei - der freiwillige Anhang bei Trup und Pytje.
//
// KEINE KAMERA, SONDERN EIN DATEIFELD, und das ist Absicht: Auf dem
// Telefon bietet es beides an, aufnehmen oder aus der Galerie nehmen.
// Wer ein Bild von gestern hat, auf dem der Ausschlag deutlicher war,
// soll genau das schicken duerfen.
export async function ausDatei(datei, { dokument = globalThis.document } = {}) {
  if (!datei || !/^image\//.test(String(datei.type || ""))) return null;
  const quelle = await new Promise((fertig) => {
    const leser = new FileReader();
    leser.onload = () => fertig(String(leser.result || ""));
    leser.onerror = () => fertig("");
    leser.readAsDataURL(datei);
  });
  if (!quelle) return null;
  const bild = await new Promise((fertig) => {
    const el = new Image();
    el.onload = () => fertig(el);
    el.onerror = () => fertig(null);
    el.src = quelle;
  });
  if (!bild) return null;
  const gross = alsJpeg(bild, { breite: bild.naturalWidth, hoehe: bild.naturalHeight, dokument });
  if (!gross) return null;
  const mini = miniaturAus(bild, { breite: bild.naturalWidth, hoehe: bild.naturalHeight, dokument });
  return { foto: gross, mini, vorschau: mini?.jpeg || gross.jpeg };
}

// ---------------------------------------------------------------------------
// Die Kamera selbst
// ---------------------------------------------------------------------------

// Was hier NICHT passiert: messen, erkennen, von selbst ausloesen. Die
// Klasse macht den Strom auf, haelt ihn am Video und gibt auf Zuruf ein
// Bild heraus. Alles andere entscheidet der Mensch davor.
export class Flaechenkamera {
  constructor({ video, dokument = globalThis.document, medien = null, beiFehler = null } = {}) {
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
          this.stoppe();
          this.beiFehler?.("fehlerKameraBild");
          return false;
        }
      }
      this.bereit = Boolean(this.video);
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
          if (sichtbarMs - ruhigSeit >= 450 || sichtbarMs - erstesBild >= 1400) {
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
      && spur?.readyState === "live" && !spur.muted);
  }

  // Vorne oder hinten. Fuer eine Stelle am Ruecken oder am Arm hilft die
  // Kamera, in der man sich sieht, nichts.
  async wechsle() {
    return this.starte(this.richtung === "user" ? "environment" : "user");
  }

  // Das Bild, wie es gerade im Rahmen steht.
  //
  // NICHT GESPIEGELT, auch wenn die Vorschau es ist: Gespiegelt wird im
  // Stilblatt, damit sich die Bewegung richtig anfuehlt. Was die Aerztin
  // ansieht, soll die Haut zeigen, wie sie liegt - eine seitenverkehrte
  // Aufnahme laesst sie am falschen Ort suchen.
  aufnehmen() {
    const video = this.video;
    if (!this.bereit || !this.#hatBild()) return null;
    const gross = alsJpeg(video, {
      breite: video.videoWidth, hoehe: video.videoHeight, dokument: this.dokument
    });
    if (!gross) return null;
    const mini = miniaturAus(video, {
      breite: video.videoWidth, hoehe: video.videoHeight, dokument: this.dokument
    });
    return { foto: gross, mini, vorschau: gross.jpeg };
  }

  stoppe() {
    this.lauf += 1;
    this.bereit = false;
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
