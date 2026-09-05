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

import { messeBild, fasseAufnahmenZusammen, berechneVerhaeltnisse, streuungUeberAufnahmen, MESS_BREITE } from "./lifeskin-metrics.js";
import { pruefeAufnahme, punkteAusOval, istHaut } from "./lifeskin-face.js";
import { massstabAusNetz, sklerAbgleich, bildGuete, rechteckUmriss } from "./lifeskin-haut.js";
import { Ringlauf, SEKTOREN, POSE_GRENZEN } from "./lifeskin-pose.js";
import { netzVorladen, netzHolen, netzStand, messeNetz, MARKE } from "./lifeskin-netz.js";
import { erstelleBefund, ALTERSGRUPPEN } from "./lifeskin-rules.js";
import { STANDARD_KONFIG, STANDARD_PRODUKTE, tagespreis, einzelpreisSumme } from "./lifeskin-catalog.js";
import { OBERFLAECHE, BEFUND_TEXTE, STUFEN_TEXTE, HAFTUNG, findeKombination, t, fuelle } from "./lifeskin-content.js";
import { Sitzung } from "./lifeskin-session.js";
import { Pixel } from "./lifeskin-pixel.js";

const SCHIRME = ["einstieg", "name", "vorbereitung", "kamera", "analyse", "befund", "empfehlung", "angebot", "anschrift", "danke"];

// Welche Bildschirme in den Verlauf des Browsers kommen.
//
// Kamera und Analyse nicht: Sie sind Durchgangsstationen. Wer vom Befund aus
// zurueckgeht, will nicht mitten in eine laufende Analyse, sondern zur
// Vorbereitung - und von dort die Aufnahme neu machen.
// Wie gross das Bild fuer die laufende Pruefung ist, und wie gross fuer die
// Aufnahme. Waehrend der Vorschau zaehlt Tempo mehr als Genauigkeit: Ein
// ruckelndes Bild laesst den Besucher glauben, die Seite sei kaputt.
const GATE_BREITE = 240;

// Wie gross die drei Aufnahmen gespeichert werden.
//
// ZWEITE FASSUNG. Die erste rechnete auf 640 Bildpunkte herunter - das war
// die Breite, bei der ein JPEG sicher klein bleibt, und es war die falsche
// Ueberlegung. Die Kamera wird mit 1440 angefordert, weil erst dort feine
// Linien und Poren ueberhaupt im Bild sind; auf 640 herunterzurechnen wirft
// genau das wieder weg, was die Aufloesung teuer erkauft hat. Und diese
// Bilder sind das, worauf eine Aerztin schaut, bevor sie einen Befund
// unterschreibt.
//
// Jetzt: volle Aufloesung der Messleinwand, gedeckelt auf 1440. Was ein
// Geraet weniger liefert, bleibt weniger - hochrechnen erfindet nichts.
const FOTO_BREITE = 1440;

// Die Qualitaetsstufen, von oben nach unten durchprobiert.
//
// Ein Firestore-Dokument darf 1 MiB gross sein, und ein Bild steht als Text
// darin - Base64 macht aus drei Byte vier Zeichen. Statt eine feste
// Qualitaet zu raten, die mal zu gross und mal zu schlecht ist, wird die
// beste genommen, die noch passt. Bei einem gleichmaessig ausgeleuchteten
// Gesicht reicht dafuer fast immer die erste.
const FOTO_STUFEN = Object.freeze([0.94, 0.88, 0.82, 0.74, 0.64]);

// Wieviel Text ein Bild hoechstens werden darf. Der Rest des Dokuments -
// Blickrichtung, Zeitstempel, Masse - liegt bei wenigen hundert Byte; der
// Abstand zur Millionengrenze ist Absicht und kein Geiz.
const FOTO_HOECHSTZEICHEN = 900000;

// Wohin der Kopf zeigen muss, damit eine Aufnahme als "rechts" oder "links"
// zaehlt. Null steht oben, gezaehlt wird im Uhrzeigersinn - dieselbe
// Rechnung wie in lifeskin-pose.js.
const FOTO_BLICKE = Object.freeze([
  { blick: "rechts", winkel: Math.PI / 2 },
  { blick: "links", winkel: (Math.PI * 3) / 2 }
]);
// Ein Viertelkreis um die Ideallinie. Enger waere ehrlicher und ginge in der
// Praxis nie zu: Kaum jemand dreht den Kopf exakt waagerecht.
const FOTO_TOLERANZ = Math.PI / 4;

// Zwei Aufloesungen, und der Unterschied ist der Punkt.
//
// VERFOLGUNG_BREITE ist, was das Gesichtsnetz je Bild zu sehen bekommt.
// Klein halten kostet nichts: Die Landmarken kommen als Anteile zurueck und
// sind auf jeder Aufloesung dieselben, und dreissig Bilder je Sekunde sind
// wichtiger als Bildpunkte.
//
// MESSUNG dagegen laeuft in voller Kameraaufloesung. Frueher wurde auch
// gemessen, was hier steht - 480 Bildpunkte -, und damit kam auf einen
// Bildpunkt rund ein halber Millimeter Haut. Poren sind kleiner als das; sie
// waren physikalisch nicht auflösbar. Siehe ABTASTUNG_MM in
// lifeskin-metrics.js.
const VERFOLGUNG_BREITE = MESS_BREITE;

// Wie weit das Bild herangeholt wird.
//
// Bei normal gehaltenem Telefon fuellt ein Gesicht nur gut vierzig Prozent
// der Bildbreite. Im Kreis sieht das verloren aus, und fuer die Messung sind
// es unnoetig wenige Bildpunkte je Millimeter Haut. Dieselbe Zahl steht in
// lifeskin-styles.css als `transform: ... scale(1.25)` am Videobild, und
// tests/lifeskin-service-worker haelt beide zusammen.
//
// SIE MUESSEN GLEICH SEIN. Laeuft der Zuschnitt der Messung dem angezeigten
// Bild davon, misst der Trichter woanders, als der Kunde hinschaut - genau
// daran ist die Kamera hier schon einmal gescheitert, und man sieht es dem
// Bildschirm nicht an.
const NAEHE = 1.25;

// Fuenf Striche je Sektor. Der Ring soll fein aussehen wie bei Face ID, aber
// er misst in acht Richtungen - alle fuenf Striche eines Sektors gehen
// gemeinsam zu.
const STRICHE_JE_SEKTOR = 5;

// Wie viele gerade Aufnahmen hoechstens. Der Befund beruht auf ihnen, und
// drei sind genug fuer einen stabilen Median; jede weitere kostet nur Zeit.
const FRONTAL_HOECHSTENS = 3;

const IM_VERLAUF = Object.freeze(["einstieg", "name", "vorbereitung", "befund", "empfehlung", "angebot", "anschrift"]);

// Der Fortschritt startet bei 20 %. Siehe lifeskin-styles.css.
const FORTSCHRITT = { einstieg: 20, name: 32, vorbereitung: 44, kamera: 56, analyse: 68, befund: 78, empfehlung: 86, angebot: 92, anschrift: 96, danke: 100 };

const $ = (auswahl, wurzel = document) => wurzel.querySelector(auswahl);
const $$ = (auswahl, wurzel = document) => Array.from(wurzel.querySelectorAll(auswahl));

function schreibe(knoten, text) { if (knoten) knoten.textContent = text; }

function warte(ms) { return new Promise((fertig) => setTimeout(fertig, ms)); }

// Die beste Qualitaet nehmen, die noch in ein Firestore-Dokument passt.
//
// Als eigene Funktion und nicht als Methode, damit sie ohne Browser
// nachrechenbar ist: `kodiere(guete)` gibt die fertige Zeichenkette zurueck,
// mehr braucht die Entscheidung nicht. Getestet in
// tests/lifeskin-fotos.test.mjs.
export function besteGuete(kodiere, stufen = FOTO_STUFEN, grenze = FOTO_HOECHSTZEICHEN) {
  for (const guete of stufen) {
    const jpeg = kodiere(guete);
    if (typeof jpeg === "string" && jpeg.length <= grenze) return { jpeg, guete };
  }
  return null;
}

export class Trichter {
  constructor({ konfig = STANDARD_KONFIG, produkte = STANDARD_PRODUKTE } = {}) {
    this.konfig = konfig;
    this.produkte = produkte;
    this.sprache = konfig.sprache || "sq";
    this.pixel = new Pixel();
    this.sitzung = new Sitzung({ beiSchritt: (name, zusatz) => this.pixel.melde(name, zusatz) });
    this.zustand = {
      name: "",
      altersgruppe: "",
      aufnahmen: [],
      messung: null,
      verhaeltnisse: null,
      befund: null,
      anschrift: {}
    };
    this.kamera = { strom: null, laeuft: false, letztesRaster: null, ring: null, proben: [], fotos: {} };
  }

  text(schluessel, werte) {
    const roh = t(OBERFLAECHE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  starte() {
    // Das Gesichtsnetz wiegt rund 6,7 MB und wird ab hier im Hintergrund
    // geholt. Bis der Kunde Namen und Alter eingegeben und die drei Hinweise
    // gelesen hat, vergehen zwanzig Sekunden - die Ladezeit liegt darin und
    // nicht vor der Kamera. Der Rueckgabewert interessiert hier niemanden:
    // Kommt es nicht, laeuft der Trichter mit der alten Erkennung weiter.
    netzVorladen();
    // Vor allem anderen: Wer sofort wieder weggeht, soll trotzdem gezaehlt
    // sein. Ohne Pixel-Kennung tut die Zeile nichts.
    if (this.pixel.starte()) this.pixel.melde("opened");
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
    $("#ls-manuell")?.addEventListener("click", () => this.#ringAbschluss({ vonHand: true }));
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
    this.kamera.proben = [];
    this.kamera.fotos = {};
    this.kamera.ring = new Ringlauf();
    this.kamera.netz = null;
    this.kamera.messleinwand = null;
    this.kamera.offeneMessungen = 0;
    this.kamera.uhr = 0;
    this.zustand.erkannt = false;
    const video = $("#ls-video");
    this.zeige("kamera");
    this.sitzung.schritt("camera");

    try {
      // Nur nach einer Berührung - iOS erlaubt es nicht anders.
      this.kamera.strom = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          // So fein, wie das Geraet hergibt - und das ist keine Spielerei,
          // sondern entscheidet, WAS ueberhaupt messbar ist.
          //
          // Bei 720 Bildpunkten Breite kommt auf einen Bildpunkt rund ein
          // Drittel Millimeter Haut. Nach Nyquist braucht eine feine Linie
          // hoechstens 0,25 mm je Bildpunkt und eine erweiterte Pore
          // hoechstens 0,20 - beides war damit ausserhalb dessen, was das
          // Bild ueberhaupt enthaelt. Gemeldet wurde trotzdem etwas.
          //
          // Mit 1440 sind es rund 0,17 mm je Bildpunkt, und Linien wie Poren
          // liegen zum ersten Mal im messbaren Bereich. Kann das Geraet es
          // nicht, liefert es weniger - `ideal` fordert, es verlangt nicht -
          // und lifeskin-haut.js meldet dann ehrlich, was nicht aufloesbar
          // war, statt eine Zahl zu erfinden.
          width: { ideal: 1440 },
          height: { ideal: 1920 }
        },
        audio: false
      });
      video.srcObject = this.kamera.strom;
      // playsinline steht auch im Aufbau. Ohne beides springt Safari in den
      // Vollbildmodus und der Trichter bricht ab.
      video.setAttribute("playsinline", "");
      await video.play();
      this.kamera.laeuft = true;
      await this.#videoBereit(video);
    } catch {
      this.#fehlerZeigen("fehlerKamera", () => this.#kameraStarten());
      return;
    }

    // Auf das Gesichtsnetz warten - aber nicht lange. Der Kamerastrom laeuft
    // schon, der Besucher sieht sich also bereits; die Frist ist der Rest,
    // der aus den 6,7 MB noch fehlt.
    schreibe($("#ls-kamerahinweis"), this.text("ringEinmessen"));
    this.#messwerteZeigen();
    this.kamera.netz = await netzHolen({ zeitgrenzeMs: 9000 });
    if (!this.kamera.laeuft) return;

    if (this.kamera.netz) {
      this.#ringschleife();
    } else {
      // Ohne Netz kein Ring. Statt den Kunden vor einem Kreis stehen zu
      // lassen, der sich nie fuellen kann, gibt es den alten Weg: kurz
      // stillhalten, drei Aufnahmen, weiter. Schlechter, aber nicht kaputt.
      this.sitzung.ergaenze({ meshFallback: true, meshState: netzStand() });
      this.#rueckfallschleife();
    }
  }

  // Warten, bis das Kamerabild seine Groesse gefunden hat.
  //
  // WARUM DAS BILD BEIM START VERZERRT WAR - und es war kein Zufall:
  //
  // Ein frisch geoeffneter <video>-Knoten hat noch kein Seitenverhaeltnis.
  // `object-fit: cover` braucht aber genau das, um zu wissen, was es
  // beschneiden soll. Bis die Metadaten da sind, zieht der Browser das erste
  // Bild also auf den ganzen quadratischen Kasten - und weil der Kasten
  // quadratisch ist und die Kamera hochkant liefert, ist die Verzerrung
  // maximal sichtbar.
  //
  // Dazu kommt ein zweiter Schub: iOS liefert oft erst einen Strom in einer
  // Aufloesung und schaltet dann auf die angeforderte um. `videoWidth`
  // aendert sich damit nach dem Start noch einmal, und mit ihr der
  // Zuschnitt, den #leinwandFuellen() rechnet. Das ist das "und dann
  // stabilisiert es sich".
  //
  // Hier wird gewartet, bis die Breite zweimal hintereinander dieselbe ist,
  // und erst dann das Bild eingeblendet. Bis dahin bleibt der Kreis schwarz -
  // schwarz und ruhig ist besser als sichtbar und falsch.
  async #videoBereit(video, { fristMs = 2500, ruheMs = 220 } = {}) {
    const kasten = $(".ls-kamera");
    if (kasten) kasten.dataset.bereit = "nein";
    const seit = Date.now();
    let letzte = 0;
    let ruhigSeit = 0;

    while (Date.now() - seit < fristMs) {
      const breite = video.videoWidth;
      if (breite > 0) {
        if (breite === letzte) {
          if (!ruhigSeit) ruhigSeit = Date.now();
          if (Date.now() - ruhigSeit >= ruheMs) break;
        } else {
          letzte = breite;
          ruhigSeit = 0;
        }
      }
      await warte(60);
    }

    // Nach der Frist wird trotzdem eingeblendet. Ein Kunde vor einem
    // schwarzen Kreis ist schlimmer als einer vor einem kurz verzerrten -
    // und auf einem langsamen Geraet kann das laenger dauern, als hier
    // gewartet wird.
    if (kasten) kasten.dataset.bereit = "ja";
    this.kamera.videoBreite = video.videoWidth;
    return video.videoWidth > 0;
  }

  // Die zugeschnittene, gespiegelte Leinwand.
  //
  // HIER LAG EINER DER FEHLER, an denen die Kamera im Betrieb gescheitert
  // ist. Das Video wird mit `object-fit: cover` angezeigt: Der Browser
  // schneidet es zu und zeigt nur den mittleren Ausschnitt. Vermessen wurde
  // aber das *ganze* Kamerabild. Der Besucher legte sein Gesicht sauber in
  // den Kreis - und in dem Bild, das gemessen wurde, war dasselbe Gesicht
  // viel kleiner.
  //
  // Und genau diese Leinwand bekommt auch das Gesichtsnetz zu sehen, nicht
  // das Videobild. Dann stehen die Landmarken in denselben Bildpunkten, die
  // gemessen werden, und es gibt nichts zurueckzurechnen. Gespiegelt wie die
  // Vorschau: Damit ist "rechts im Bild" dasselbe wie "rechts im Spiegel",
  // und der Ring folgt dem Kopf so, wie der Besucher ihn sieht.
  #leinwandFuellen({ breite = VERFOLGUNG_BREITE } = {}) {
    const video = $("#ls-video");
    const leinwand = $("#ls-leinwand");
    if (!video?.videoWidth || !video.clientWidth || !leinwand) return null;

    const kastenB = video.clientWidth;
    const kastenH = video.clientHeight;
    const massstab = Math.max(kastenB / video.videoWidth, kastenH / video.videoHeight) * NAEHE;
    const quelleB = Math.min(video.videoWidth, kastenB / massstab);
    const quelleH = Math.min(video.videoHeight, kastenH / massstab);
    const quelleX = (video.videoWidth - quelleB) / 2;
    const quelleY = (video.videoHeight - quelleH) / 2;

    const hoehe = Math.max(1, Math.round((kastenH / kastenB) * breite));
    if (leinwand.width !== breite || leinwand.height !== hoehe) {
      leinwand.width = breite;
      leinwand.height = hoehe;
    }
    const stift = leinwand.getContext("2d", { willReadFrequently: true });
    stift.save();
    stift.translate(breite, 0);
    stift.scale(-1, 1);
    stift.drawImage(video, quelleX, quelleY, quelleB, quelleH, 0, 0, breite, hoehe);
    stift.restore();
    return leinwand;
  }

  // Dieselbe Rechnung wie oben, aber in voller Kameraaufloesung und auf einer
  // eigenen Leinwand.
  //
  // Eigene Leinwand, weil die andere dem Gesichtsnetz gehoert: Wechselte sie
  // je Aufnahme die Groesse, muesste MediaPipe seinen Bildstrom neu aufsetzen
  // und die Verfolgung wuerde sichtbar stocken.
  #messleinwandFuellen() {
    const video = $("#ls-video");
    if (!video?.videoWidth || !video.clientWidth) return null;

    const kastenB = video.clientWidth;
    const kastenH = video.clientHeight;
    const massstab = Math.max(kastenB / video.videoWidth, kastenH / video.videoHeight) * NAEHE;
    const quelleB = Math.min(video.videoWidth, kastenB / massstab);
    const quelleH = Math.min(video.videoHeight, kastenH / massstab);
    const quelleX = (video.videoWidth - quelleB) / 2;
    const quelleY = (video.videoHeight - quelleH) / 2;

    const breite = Math.round(quelleB);
    const hoehe = Math.round(quelleH);
    if (!(breite > 0 && hoehe > 0)) return null;

    let leinwand = this.kamera.messleinwand;
    if (!leinwand) {
      leinwand = document.createElement("canvas");
      this.kamera.messleinwand = leinwand;
    }
    if (leinwand.width !== breite || leinwand.height !== hoehe) {
      leinwand.width = breite;
      leinwand.height = hoehe;
    }
    const stift = leinwand.getContext("2d", { willReadFrequently: true });
    stift.save();
    stift.translate(breite, 0);
    stift.scale(-1, 1);
    stift.drawImage(video, quelleX, quelleY, quelleB, quelleH, 0, 0, breite, hoehe);
    stift.restore();
    return leinwand;
  }

  #bildHolen({ breite = GATE_BREITE } = {}) {
    const leinwand = this.#leinwandFuellen({ breite });
    if (!leinwand) return null;
    return leinwand.getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, leinwand.width, leinwand.height);
  }

  // Das Oval in Bildkoordinaten. Deckt sich Zahl fuer Zahl mit
  // .ls-oval__ring im CSS - und weil das Bild derselbe Ausschnitt ist,
  // meint es auch dieselbe Stelle.
  // Der Kreis in Buehnenkoordinaten.
  //
  // Deckt sich Zahl fuer Zahl mit .ls-kamera__kreis und .ls-oval__ring im
  // CSS; tests/lifeskin-service-worker haelt beide zusammen. Ueber diese
  // Umrechnung liegen Ring und Netz genau auf dem Bild, das im Kreis steht.
  #oval(bild) {
    return { x: bild.width * 0.07, y: bild.height * 0.07, w: bild.width * 0.86, h: bild.height * 0.86 };
  }

  // Die Buehne: der quadratische Kasten, in dem der Kreis sitzt.
  //
  // Nicht das Videobild fragen - das steht seit dem runden Ausschnitt im
  // Kreis-Kasten und ist damit kleiner als die Buehne. Wer hier das Video
  // misst, zeichnet Ring und Netz um sieben Prozent verschoben, und das
  // sieht aus wie eine schlechte Erkennung, obwohl die Erkennung stimmt.
  #buehne() {
    const kasten = $(".ls-kamera");
    if (!kasten?.clientWidth) return null;
    return { width: kasten.clientWidth, height: kasten.clientHeight };
  }

  // Das Gesichtsoval INNERHALB des zugeschnittenen Bildes.
  //
  // Etwas anderes als #oval(): Jenes beschreibt, wo der Kreis auf der Buehne
  // liegt. Dieses beschreibt, wo im Kreisbild ein Gesicht zu erwarten ist -
  // und das Kreisbild ist ja bereits der Kreis. Gebraucht wird es nur vom
  // Rueckfallweg ohne Gesichtsnetz.
  #gesichtsOval(bild) {
    return { x: bild.width * 0.12, y: bild.height * 0.08, w: bild.width * 0.76, h: bild.height * 0.84 };
  }

  // Die Landmarken in Bildpunkten.
  //
  // Das Netz liefert sie als Anteile 0 bis 1. lifeskin-metrics.js erwartet
  // ein lueckenhaftes Feld, dessen Plaetze die MediaPipe-Kennungen sind -
  // und genau die stehen dort schon in PUNKT (1, 168, 10, 152, 33, 263 ...).
  // Der urspruengliche Aufbau war also von Anfang an auf dieses Netz gebaut;
  // die eigene Erkennung hat nur versucht, es nachzuahmen.
  #punkteInBildpunkten(netz, breite, hoehe) {
    const feld = [];
    for (let i = 0; i < netz.punkte.length; i += 1) {
      const p = netz.punkte[i];
      feld[i] = { x: p.x * breite, y: p.y * hoehe, z: p.z };
    }
    return feld;
  }

  #ringschleife() {
    if (!this.kamera.laeuft) return;

    const leinwand = this.#leinwandFuellen({ breite: VERFOLGUNG_BREITE });
    if (!leinwand) { setTimeout(() => this.#ringschleife(), 160); return; }

    // Der Zeitstempel muss streng wachsen, sonst verwirft MediaPipe das Bild.
    this.kamera.uhr = Math.max(this.kamera.uhr + 1, Math.round(performance.now()));
    const netz = messeNetz(leinwand, this.kamera.uhr);

    const jetzt = Date.now();
    const stand = this.kamera.ring.schritt(netz, jetzt);

    this.#ringZeichnen(stand);
    this.#netzZeichnen(netz, stand);
    this.#ringHinweisZeigen(netz, stand);

    if (stand.frontalFaellig) {
      this.#ringAufnahme(netz, leinwand, { frontal: true, stand });
      this.kamera.ring.aufnahmeVermerkt(jetzt, { frontal: true });
    } else if (stand.neuerSektor !== null) {
      this.#ringAufnahme(netz, leinwand, { sektor: stand.neuerSektor, stand });
    } else if (stand.mitte && this.#frontalAnzahl() < FRONTAL_HOECHSTENS
      && jetzt - this.kamera.ring.letzteAufnahme >= 900) {
      this.#ringAufnahme(netz, leinwand, { frontal: true, stand });
      this.kamera.ring.aufnahmeVermerkt(jetzt, { frontal: true });
    }

    if (stand.fertig) { this.#ringAbschluss(); return; }

    // So schnell, wie das Geraet es hergibt. Auf einem Handy mit GPU sind das
    // gut dreissig Bilder je Sekunde - und daran haengt das Gefuehl, verfolgt
    // zu werden.
    requestAnimationFrame(() => this.#ringschleife());
  }

  // Der Weg ohne Gesichtsnetz.
  //
  // Kein Ring, kein Tor: kurz stillhalten, drei Aufnahmen, weiter. Die alte
  // Erkennung liefert dabei nur noch den Hinweistext, sie haelt nichts mehr
  // an - genau das war der Fehler, den der Ring loesen sollte.
  #rueckfallschleife(seit = Date.now()) {
    if (!this.kamera.laeuft) return;
    const bild = this.#bildHolen({ breite: GATE_BREITE });
    if (bild) {
      const ergebnis = pruefeAufnahme(bild, this.#gesichtsOval(bild), this.kamera.letztesRaster,
        { rasterBreite: 64, schritt: 2 });
      this.kamera.letztesRaster = ergebnis.raster;
      this.#ringZeichnen({ abgedeckt: new Array(SEKTOREN).fill(false), zielSektor: null, kalibriert: false });
      const lage = {
        zuNah: "aufnahmeHinweisNah", zuFern: "aufnahmeHinweisFern",
        zuDunkel: "aufnahmeHinweisDunkel", zuHell: "aufnahmeHinweisHell"
      }[ergebnis.hinweis];
      schreibe($("#ls-kamerahinweis"), lage ? this.text(lage) : this.text("aufnahmeGleich"));
    }
    if (Date.now() - seit >= 3000) { this.#rueckfallAufnehmen(); return; }
    setTimeout(() => this.#rueckfallschleife(seit), 170);
  }

  async #rueckfallAufnehmen() {
    for (let i = 0; i < 3; i += 1) {
      const leinwand = this.#leinwandFuellen({ breite: VERFOLGUNG_BREITE });
      if (!leinwand) continue;
      const bild = leinwand.getContext("2d", { willReadFrequently: true })
        .getImageData(0, 0, leinwand.width, leinwand.height);
      const geprueft = pruefeAufnahme(bild, this.#gesichtsOval(bild));
      const punkte = geprueft.punkte || punkteAusOval(this.#gesichtsOval(bild));
      this.kamera.proben.push({ frontal: true, sektor: null, erkannt: Boolean(geprueft.punkte), messung: messeBild(bild, punkte) });
      this.zustand.erkannt = this.zustand.erkannt || Boolean(geprueft.punkte);
      this.#messwerteZeigen();
      if (i < 2) await warte(400);
    }
    this.#ringAbschluss();
  }

  #frontalAnzahl() {
    return this.kamera.proben.filter((p) => p.frontal).length;
  }

  // Der Ring mit den Strichen, eingeschrieben in denselben Kasten, den
  // #oval() misst. Ein echter Kreis: Der kleinere der beiden Kastenmasse
  // gibt den Radius.
  #ringZeichnen(stand) {
    const leinwand = $("#ls-ring");
    const buehne = this.#buehne();
    if (!leinwand || !buehne) return;

    const b = buehne.width;
    const h = buehne.height;
    if (leinwand.width !== b || leinwand.height !== h) { leinwand.width = b; leinwand.height = h; }
    const stift = leinwand.getContext("2d");
    stift.clearRect(0, 0, b, h);

    const kasten = this.#oval(buehne);
    const mx = kasten.x + kasten.w / 2;
    const my = kasten.y + kasten.h / 2;
    const radius = Math.min(kasten.w, kasten.h) / 2;

    stift.strokeStyle = "rgba(255,255,255,0.18)";
    stift.lineWidth = 1;
    stift.beginPath();
    stift.arc(mx, my, radius, 0, Math.PI * 2);
    stift.stroke();

    const striche = SEKTOREN * STRICHE_JE_SEKTOR;
    const puls = 0.5 + 0.5 * Math.sin(Date.now() / 320);

    for (let i = 0; i < striche; i += 1) {
      const sektor = Math.floor(i / STRICHE_JE_SEKTOR);
      const winkel = -Math.PI / 2 + (i / striche) * Math.PI * 2;
      const zu = stand.abgedeckt[sektor];
      const ziel = !zu && sektor === stand.zielSektor && stand.kalibriert;

      const innen = radius + 6;
      const aussen = innen + (zu ? 13 : ziel ? 11 : 7);
      stift.strokeStyle = zu
        ? "rgba(63,191,155,0.95)"
        : ziel
          ? `rgba(255,255,255,${0.35 + puls * 0.6})`
          : "rgba(255,255,255,0.22)";
      stift.lineWidth = zu || ziel ? 3.5 : 2.5;
      stift.lineCap = "round";
      stift.beginPath();
      stift.moveTo(mx + Math.cos(winkel) * innen, my + Math.sin(winkel) * innen);
      stift.lineTo(mx + Math.cos(winkel) * aussen, my + Math.sin(winkel) * aussen);
      stift.stroke();
    }
  }

  // Das Netz ueber dem Gesicht.
  //
  // Das hier ist der sichtbare Unterschied zu vorher: 478 Punkte, die dem
  // Gesicht folgen, statt zehn, die einem Rechteck folgen. Gezeichnet wird
  // jeder zweite - dichter sieht auf einem Handy nach Rauschen aus und
  // kostet nur Rechenzeit.
  #netzZeichnen(netz, stand) {
    const leinwand = $("#ls-netz");
    const buehne = this.#buehne();
    if (!leinwand || !buehne) return;

    const b = buehne.width;
    const h = buehne.height;
    if (leinwand.width !== b || leinwand.height !== h) { leinwand.width = b; leinwand.height = h; }
    const stift = leinwand.getContext("2d");
    stift.clearRect(0, 0, b, h);
    if (!netz?.punkte) return;

    // Die Landmarken stehen als Anteile am KREISBILD, gezeichnet wird auf der
    // Buehne. Ohne diese Umrechnung laegen sie um sieben Prozent daneben.
    const kreis = this.#oval(buehne);
    // Gross genug, um auf einem Handy gesehen zu werden, und klein genug,
    // dass es nicht das Gesicht zudeckt. Bei 1,4 Bildpunkten war es auf
    // einem Bildschirm mit dreifacher Dichte praktisch unsichtbar - und
    // unsichtbares Tracking ist fuer den Kunden dasselbe wie keines.
    const gruen = stand?.kalibriert;
    stift.fillStyle = gruen ? "rgba(63,191,155,0.85)" : "rgba(255,255,255,0.6)";
    for (let i = 0; i < netz.punkte.length; i += 2) {
      const p = netz.punkte[i];
      stift.fillRect(kreis.x + p.x * kreis.w - 1.1, kreis.y + p.y * kreis.h - 1.1, 2.2, 2.2);
    }
  }

  #ringHinweisZeigen(netz, stand) {
    const oval = $("#ls-oval");
    if (oval) oval.dataset.stand = !netz ? "rot" : stand.kalibriert ? "gruen" : "gelb";

    let text;
    if (!netz) {
      text = this.text("ringZurueck");
    } else if (!stand.kalibriert) {
      // Der Abstand, in echten Zahlen: Der Pupillenabstand am Kreis sagt
      // genau, wie gross das Gesicht im Bild steht. Frueher kam derselbe
      // Hinweis aus der Breite eines geschaetzten Rechtecks - und lag
      // entsprechend oft daneben.
      text = this.#abstandHinweis(netz) || this.text("ringEinmessen");
    } else if (stand.anteil >= 0.999) {
      text = this.text("ringFertig");
    } else if (stand.anteil >= 0.6) {
      text = this.text("ringFastFertig");
    } else if (stand.anteil > 0) {
      text = this.text("ringWeiter");
    } else if (stand.dauerMs >= POSE_GRENZEN.ausloeserHinweisAbMs) {
      // Nichts geht - dann nicht die Anweisung zum vierten Mal wiederholen,
      // sondern den Ausweg zeigen. Seit alle Striche zugehen muessen, ist der
      // Ausloeser unter dem Bild der einzige, und er gehoert darum genannt.
      // Beendet wird dadurch nichts.
      text = this.text("ringOhneBewegung");
    } else {
      text = this.text("ringDrehen");
    }
    schreibe($("#ls-kamerahinweis"), text);
  }

  // Steht das Gesicht gut im Kreis?
  //
  // Gemessen am Pupillenabstand, als Anteil der Kreisbreite. Ein Gesicht
  // fuellt den Kreis gut, wenn dieser Anteil um ein Viertel liegt: Der
  // Pupillenabstand betraegt rund 43 Prozent der Gesichtsbreite, und ein
  // Gesicht soll etwa drei Fuenftel des Kreises einnehmen.
  //
  // Ein Hinweis, keine Sperre. Wer ihn nicht befolgt, wird trotzdem
  // eingemessen - notfalls nach der Frist in lifeskin-pose.js.
  #abstandHinweis(netz) {
    const l = netz.punkte[MARKE.irisLinks];
    const r = netz.punkte[MARKE.irisRechts];
    if (!l || !r) return null;
    const anteil = Math.hypot(r.x - l.x, r.y - l.y);
    if (anteil < 0.20) return this.text("aufnahmeHinweisFern");
    if (anteil > 0.34) return this.text("aufnahmeHinweisNah");
    return null;
  }

  // Eine Aufnahme, sofort vermessen.
  //
  // Die Zahlen, die der Besucher waehrend der Drehung wachsen sieht, kommen
  // aus diesen Messungen - nicht aus einem Zaehler, der die Zeit abzaehlt.
  #ringAufnahme(netz, leinwand, { frontal = false, sektor = null, stand = null } = {}) {
    if (!netz?.punkte || !leinwand) return;
    // Ein Blinzeln oder ein offener Mund verdirbt die Messung: geschlossene
    // Lider geben kein Augenweiss fuer den Weissabgleich her, ein offener
    // Mund zieht die Wangenhaut straff. Ein Bild auszulassen kostet nichts -
    // es kommen genug.
    const mimik = netz.mimik;
    if (mimik && (mimik.augeZuLinks > 0.55 || mimik.augeZuRechts > 0.55 || mimik.mundOffen > 0.4)) return;

    // Gemessen wird auf der grossen Leinwand, nicht auf der, die das Netz
    // gesehen hat. Die Landmarken kommen als Anteile und passen auf beide.
    const messleinwand = this.#messleinwandFuellen() || leinwand;
    const stift = messleinwand.getContext("2d", { willReadFrequently: true });
    const bild = stift.getImageData(0, 0, messleinwand.width, messleinwand.height);
    const punkte = this.#punkteInBildpunkten(netz, messleinwand.width, messleinwand.height);

    // Das Bild holen muss sofort passieren - gleich wird die Leinwand
    // ueberschrieben. Gerechnet wird danach, ausserhalb des Bildtakts.
    //
    // In voller Kameraaufloesung dauert eine Messung ein paar Dutzend
    // Millisekunden. Liefe sie hier, stockte der Ring genau in dem
    // Augenblick, in dem ein Strich zugeht - also genau dann, wenn der
    // Besucher hinschaut. Das ist der Unterschied zwischen "es reagiert" und
    // "es hakt".
    // Das Foto wird hier nur umkopiert, nicht kodiert: drawImage auf eine
    // kleine Leinwand kostet unter einer Millisekunde. Das Kodieren zu JPEG
    // kostet ein Vielfaches und passiert deshalb erst am Ende, wenn die
    // Kamera ohnehin steht - im Bildtakt wuerde man es als Ruckeln sehen.
    this.#fotoMerken(messleinwand, { frontal, stand });

    this.kamera.offeneMessungen += 1;
    setTimeout(() => this.#probeVermessen(bild, punkte, { frontal, sektor, pose: netz.pose }), 0);
  }

  // Drei Aufnahmen behalten: gerade, nach rechts, nach links.
  //
  // Ohne eigene Aufforderung und ohne eigene Animation. Der Ring laesst den
  // Kopf ohnehin einmal herumgehen; dabei kommt jede der drei Haltungen von
  // selbst vorbei. Eine zusaetzliche Anweisung waere ein zusaetzlicher
  // Schritt, an dem Leute abspringen - und sie brauechte niemand.
  //
  // Behalten wird jeweils die BESTE Aufnahme je Richtung, nicht die erste:
  // Wer den Kopf dreht, laeuft am Ideal vorbei, und die Aufnahme kurz davor
  // oder danach ist schiefer als die mittendrin. Also wird ersetzt, solange
  // etwas Genaueres kommt.
  #blickAus({ frontal, stand }) {
    if (frontal) return { blick: "gerade", abweichung: Math.abs(stand?.betrag ?? 0) };
    const winkel = stand?.winkel;
    if (!Number.isFinite(winkel)) return null;
    for (const ziel of FOTO_BLICKE) {
      // Der kuerzere Weg um den Kreis, damit 350 Grad nicht als weit weg
      // von 10 Grad gilt.
      let abstand = Math.abs(winkel - ziel.winkel) % (Math.PI * 2);
      if (abstand > Math.PI) abstand = Math.PI * 2 - abstand;
      if (abstand <= FOTO_TOLERANZ) return { blick: ziel.blick, abweichung: abstand };
    }
    return null;
  }

  #fotoMerken(messleinwand, { frontal = false, stand = null } = {}) {
    if (!messleinwand?.width) return;
    const ziel = this.#blickAus({ frontal, stand });
    if (!ziel) return;

    const vorher = this.kamera.fotos[ziel.blick];
    if (vorher && vorher.abweichung <= ziel.abweichung) return;

    // Volle Aufloesung, nur nach oben gedeckelt. Kleiner zu rechnen als das,
    // was die Kamera liefert, waere hier ein Verlust ohne Gegenwert.
    const breite = Math.min(FOTO_BREITE, messleinwand.width);
    const hoehe = Math.max(1, Math.round(messleinwand.height * (breite / messleinwand.width)));
    // Dieselbe Leinwand wiederverwenden, wenn es schon eine gibt: Bei jedem
    // besseren Bild eine neue anzulegen, laesst den Speicher waehrend der
    // Drehung mitwachsen.
    const leinwand = vorher?.leinwand || document.createElement("canvas");
    leinwand.width = breite;
    leinwand.height = hoehe;
    leinwand.getContext("2d").drawImage(messleinwand, 0, 0, breite, hoehe);
    this.kamera.fotos[ziel.blick] = { leinwand, abweichung: ziel.abweichung, breite, hoehe };
  }

  // Erst jetzt kodieren - die Kamera steht bereits.
  //
  // In voller Aufloesung dauert das je Bild ein paar Dutzend Millisekunden.
  // Zwischen den Bildern wird deshalb einmal losgelassen, damit der Wechsel
  // zum Analysebildschirm nicht in drei Rucken passiert.
  async #fotosAlsJpeg() {
    const fertig = {};
    for (const [blick, foto] of Object.entries(this.kamera.fotos || {})) {
      const fest = this.#kodiereSoGutWieMoeglich(foto);
      if (fest) fertig[blick] = fest;
      // Die Leinwand wird nicht mehr gebraucht. Drei Bilder in voller
      // Aufloesung sind rund dreissig Megabyte - auf einem aelteren Handy
      // ist das kein Rundungsfehler.
      try { foto.leinwand.width = 0; foto.leinwand.height = 0; } catch { /* egal */ }
      await warte(0);
    }
    this.kamera.fotos = {};
    return fertig;
  }

  // Die beste Qualitaet nehmen, die noch in ein Dokument passt.
  //
  // Reicht die niedrigste Stufe nicht, wird die Breite halbiert und von
  // vorne begonnen. Das trifft nur sehr grosse, sehr unruhige Bilder -
  // und ein kleineres Foto ist immer noch besser als gar keines.
  #kodiereSoGutWieMoeglich(foto) {
    let leinwand = foto.leinwand;
    let breite = foto.breite;
    let hoehe = foto.hoehe;

    for (let versuch = 0; versuch < 3; versuch += 1) {
      let treffer = null;
      try {
        const bild = leinwand;
        treffer = besteGuete((guete) => bild.toDataURL("image/jpeg", guete));
      } catch {
        // Kein Kodierer, keine Aufnahme. Die anderen beiden gehen trotzdem.
        return null;
      }
      if (treffer) return { ...treffer, breite, hoehe };
      breite = Math.max(320, Math.round(breite / 2));
      hoehe = Math.max(1, Math.round((hoehe * breite) / (foto.breite || breite)));
      try {
        const kleiner = document.createElement("canvas");
        kleiner.width = breite;
        kleiner.height = hoehe;
        kleiner.getContext("2d").drawImage(leinwand, 0, 0, breite, hoehe);
        leinwand = kleiner;
      } catch {
        return null;
      }
    }
    return null;
  }

  #probeVermessen(bild, punkte, { frontal, sektor, pose }) {
    try {
      // Weissabgleich aus dem Augenweiss statt aus der Grauwelt-Annahme, und
      // ein Massstab in Millimetern aus dem Pupillenabstand. Beides braucht
      // das Gesichtsnetz - ohne Iris keine Sklera und keine Pupillen.
      const abgleich = sklerAbgleich(bild, punkte);
      const massstab = massstabAusNetz(punkte);
      const mm = massstab?.mmJeBildpunkt ?? null;
      const messung = messeBild(bild, punkte, { abgleich, istHaut, mmJeBildpunkt: mm });

      // Wie brauchbar diese eine Aufnahme ist - gemessen, nicht gehofft.
      // Das Gewicht entscheidet nicht, OB sie zaehlt, sondern WIE STARK:
      // Ein leicht flaues Bild ist besser als kein Bild, ein verwackeltes
      // soll den Median nicht bestimmen.
      const mitte = { x: bild.width / 2, y: bild.height / 2 };
      const guete = bildGuete(bild, rechteckUmriss({
        x: mitte.x - bild.width * 0.22, y: mitte.y - bild.height * 0.18,
        w: bild.width * 0.44, h: bild.height * 0.36
      }), { istHaut, mmJeBildpunkt: mm });

      this.kamera.proben.push({
        frontal, sektor, erkannt: true, messung, pose,
        abgleich: abgleich?.quelle || "grauwelt",
        mmJeBildpunkt: mm,
        guete
      });
      this.zustand.erkannt = true;
      this.#messwerteZeigen();
    } catch {
      // zonenAusPunkten wirft, wenn eine Landmarke fehlt. Dann ist dieses
      // eine Bild unbrauchbar, mehr nicht.
    } finally {
      this.kamera.offeneMessungen -= 1;
    }
  }

  // Die drei Zahlen unter dem Bild - gemessen, nicht erfunden.
  #messwerteZeigen() {
    const zaehler = $("#ls-messzaehler");
    const kasten = $("#ls-messwerte");
    if (!kasten) return;

    const proben = this.kamera.proben;
    schreibe(zaehler, this.text("ringGemessen", { anzahl: proben.length, gesamt: SEKTOREN + 1 }));

    const messung = proben.length ? fasseAufnahmenZusammen(proben.map((p) => p.messung)) : null;
    const werte = messung ? berechneVerhaeltnisse(messung) : null;
    // Der Hauttonwinkel, gemittelt ueber die Zonen, die einen haben.
    const toene = ["stirn", "nase", "wangeLinks", "wangeRechts", "kinn"]
      .map((z) => messung?.[z]?.hautton).filter(Number.isFinite);
    const hautton = toene.length ? toene.reduce((a, v) => a + v, 0) / toene.length : null;

    const zeilen = [
      { name: this.text("ringGlanz"), wert: werte?.glanzGesamt, zeige: (v) => `${Math.round(v * 100)} %` },
      { name: this.text("ringRoetung"), wert: werte?.roetungGesamt, zeige: (v) => `a* ${v.toFixed(1)}` },
      { name: this.text("ringHautton"), wert: hautton, zeige: (v) => `ITA ${Math.round(v)}°` }
    ];

    if (kasten.children.length !== zeilen.length) {
      kasten.innerHTML = "";
      for (let i = 0; i < zeilen.length; i += 1) {
        const el = document.createElement("div");
        el.className = "ls-messwert";
        el.dataset.da = "nein";
        el.innerHTML = '<span class="ls-messwert__name"></span><span class="ls-messwert__zahl"></span>';
        kasten.appendChild(el);
      }
    }

    zeilen.forEach((zeile, i) => {
      const el = kasten.children[i];
      schreibe(el.firstElementChild, zeile.name);
      const da = Number.isFinite(zeile.wert);
      el.dataset.da = da ? "ja" : "nein";
      schreibe(el.lastElementChild, da ? zeile.zeige(zeile.wert) : this.text("ringWartet"));
    });
  }

  // Ende der Runde.
  //
  // WELCHE AUFNAHMEN IN DEN BEFUND GEHEN, und warum nicht alle: Die Messzonen
  // haengen an den Gesichtspunkten, und ein gedrehtes Gesicht zeigt seine
  // Wange verkuerzt und im anderen Licht. Ein Median ueber alle
  // Blickrichtungen waere darum nicht robuster, sondern schiefer. Der Befund
  // beruht auf den geraden Aufnahmen; die gedrehten tragen die laufende
  // Anzeige und belegen, dass hier ein Mensch sitzt und kein Foto vor der
  // Linse haengt.
  async #ringAbschluss({ vonHand = false } = {}) {
    if (!this.kamera.laeuft) return;
    this.kamera.laeuft = false;

    // Die letzte Messung laeuft noch ausserhalb des Bildtakts. Sie ist die
    // aus der Mitte und damit die, auf der der Befund beruht - ohne dieses
    // Warten faellt ausgerechnet sie heraus.
    for (let i = 0; i < 40 && this.kamera.offeneMessungen > 0; i += 1) await warte(25);

    const proben = this.kamera.proben;
    const frontale = proben.filter((p) => p.frontal);
    const basis = frontale.length >= 2 ? frontale : proben;

    this.#kameraStoppen();

    if (!basis.length) {
      this.#fehlerZeigen("fehlerKeinGesicht", () => this.#kameraStarten());
      return;
    }

    this.zustand.aufnahmen = proben.map((p) => ({
      frontal: p.frontal, sektor: p.sektor, erkannt: p.erkannt,
      gewicht: p.guete?.gewicht ?? null, schaerfe: p.guete?.schaerfe ?? null
    }));
    // Gewichtet nach Bildguete, und dazu die Streuung ueber die Aufnahmen:
    // Die eine sagt, welcher Wert herauskommt, die andere, ob man ihm
    // glauben darf.
    this.zustand.messung = fasseAufnahmenZusammen(
      basis.map((p) => p.messung),
      { gewichte: basis.map((p) => (p.guete ? Math.max(0.05, p.guete.gewicht) : 1)) }
    );
    this.zustand.streuung = streuungUeberAufnahmen(basis.map((p) => p.messung));
    this.zustand.verhaeltnisse = berechneVerhaeltnisse(this.zustand.messung);
    this.zustand.mmJeBildpunkt = basis.map((p) => p.mmJeBildpunkt).find(Number.isFinite) ?? null;

    const fotos = await this.#fotosAlsJpeg();
    this.sitzung.fotosSpeichern(fotos);

    this.sitzung.schritt("captured", {
      // Welche Blickrichtungen als Foto danebenliegen. Steht hier weniger
      // als drei, ist der Ring nicht herumgekommen - und das sieht die
      // Aerztin, bevor sie sich ueber ein fehlendes Bild wundert.
      photos: Object.keys(fotos),
      metrics: this.zustand.messung,
      ratios: this.zustand.verhaeltnisse,
      // Wie weit der Ring kam, und ob das Netz ueberhaupt da war. Steht das
      // im Bericht durchweg schlecht, liegt es nicht am einzelnen Kunden.
      ringAnteil: this.kamera.ring ? this.kamera.ring.anteil : 0,
      ringAusschlag: this.kamera.ring ? Number(this.kamera.ring.hoechsterAusschlag.toFixed(2)) : 0,
      // Die Zahl, an der spaeter alles haengt: Wie fein wurde tatsaechlich
      // abgetastet? Steht sie ueber 0,25, waren Linien und Poren gar nicht
      // im Bild - und dann darf der Befund sie auch nicht nennen.
      mmJeBildpunkt: this.zustand.mmJeBildpunkt,
      guete: this.zustand.aufnahmen.map((a) => a.gewicht).filter(Number.isFinite),
      mesh: Boolean(this.kamera.netz),
      views: proben.length,
      byHand: vonHand
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
    const buehne = $(".ls-kamera");
    if (buehne) buehne.dataset.bereit = "nein";
    this.kamera.geglaettet = null;
    // Beide Leinwaende leeren. Bleibt der Ring stehen, liegt er beim
    // naechsten Anlauf halb gefuellt ueber einem frischen Kamerabild.
    for (const kennung of ["#ls-netz", "#ls-ring"]) {
      const leinwand = $(kennung);
      if (leinwand) leinwand.getContext("2d")?.clearRect(0, 0, leinwand.width, leinwand.height);
    }
    for (const spur of this.kamera.strom?.getTracks() || []) spur.stop();
    this.kamera.strom = null;
    const video = $("#ls-video");
    if (video) video.srcObject = null;
  }

  // ---------- Analyse: die sichtbare Arbeit ----------

  async #analyseZeigen() {
    this.zeige("analyse");


    // Gerechnet wird sofort. Die Anzeige laeuft danach - sie erfindet
    // nichts, sie benennt, was gerade geschehen ist. Menschen bewerten ein
    // Ergebnis hoeher, wenn sie die Arbeit dahinter gesehen haben.
    this.zustand.befund = erstelleBefund({
      messung: this.zustand.messung,
      verhaeltnisse: this.zustand.verhaeltnisse,
      streuung: this.zustand.streuung,
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

    const kreis = $("#ls-analysekreis");
    const zahl = $("#ls-analysezahl");
    const fortschritt = (anteil) => {
      if (kreis) kreis.style.setProperty("--anteil", String(anteil));
      schreibe(zahl, `${Math.round(anteil * 100)} %`);
    };
    fortschritt(0);

    const proSchritt = Math.round((this.konfig.analyseAnzeigeMs || 7000) / zeilen.length);
    for (const [i, el] of knoten.entries()) {
      el.dataset.stand = "laeuft";
      await warte(proSchritt);
      el.dataset.stand = "fertig";
      el.firstElementChild.textContent = "✓";
      fortschritt((i + 1) / knoten.length);
    }

    this.#befundZeigen();
  }

  // ---------- Befund ----------

  // Wie breit der Balken eines Befunds ist.
  //
  // Jede Stufe bekommt ein Viertel der Leiste. Innerhalb der untersten Stufe
  // verteilt die Ausschoepfung - also wie nah der Wert an der ersten
  // Schwelle steht. Ein Wert knapp darunter sieht damit anders aus als
  // einer bei der Haelfte, und beide heissen weiter "unauffaellig".
  #balkenbreite(befund) {
    const grund = [6, 30, 55, 80][befund.stufe] ?? 6;
    const spanne = [20, 22, 22, 16][befund.stufe] ?? 20;
    const anteil = befund.stufe === 0 && Number.isFinite(befund.ausschoepfung)
      ? Math.max(0, Math.min(1, befund.ausschoepfung))
      : 0.5;
    return Math.round(grund + spanne * anteil);
  }

  #befundZeigen() {
    const { hauttyp, befunde, positives, hauptbefunde, schwerpunkt } = this.zustand.befund;

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

    // Der Schwerpunkt - nur, wenn kein Befund eine Stufe erreicht hat.
    //
    // Erreicht einer eine Stufe, sagen die Hauptbefunde ohnehin, worauf zu
    // achten ist; dann waere das hier eine zweite Ueberschrift zum selben
    // Thema. Steht dagegen ueberall "unauffaellig", ist das der einzige
    // Satz auf dem Bildschirm, der dem Kunden etwas ueber SICH sagt - und
    // ohne ihn endet eine ruhige Messung mit "alles in Ordnung", worauf
    // niemand etwas kauft.
    const spKasten = $("#ls-schwerpunkt");
    const zeigeSchwerpunkt = Boolean(schwerpunkt) && !hauptbefunde.length;
    if (spKasten) {
      spKasten.classList.toggle("ls-verstecken", !zeigeSchwerpunkt);
      if (zeigeSchwerpunkt) schreibe($("#ls-schwerpunktname"), t(schwerpunkt.label, this.sprache));
    }

    const liste = $("#ls-werte");
    liste.innerHTML = "";
    const farben = ["var(--stufe-0)", "var(--stufe-1)", "var(--stufe-2)", "var(--stufe-3)"];

    // Absteigend: Was am meisten auffaellt, steht oben.
    //
    // Der geloebte Befund faellt aus der Liste heraus. Er steht schon oben im
    // Kasten, und zweimal derselbe Satz auf einem Bildschirm liest sich wie
    // ein Fehler - gerade bei ruhiger Haut, wo ohnehin wenig zu sagen ist.
    // Was nicht gemessen werden konnte, steht nicht auf dem Bildschirm.
    //
    // Frueher landete es hier als "unauffaellig" - denn ohne Wert ergab die
    // Stufenrechnung null. Ein Kunde las damit "Ihre Poren sind in Ordnung"
    // ueber eine Aufnahme, in der Poren gar nicht aufloesbar waren. Nichts
    // zu sagen ist an dieser Stelle die einzige ehrliche Antwort.
    // Was schon in einem der beiden Kaesten oben steht, faellt aus der Liste:
    // zweimal derselbe Name auf einem Bildschirm - einmal als "hier lohnt
    // sich Pflege" und zwei Zeilen darunter als "in Ordnung" - liest sich
    // wie ein Widerspruch, und genau das ist es auch.
    const schonOben = new Set([positives?.id, zeigeSchwerpunkt ? schwerpunkt.id : null].filter(Boolean));
    const reihenfolge = [
      ...hauptbefunde,
      ...befunde.filter((b) => b.stufe === 0 && b.messbar && b.sicher && !schonOben.has(b.id))
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
      // Der Balken folgt dem gemessenen Wert, nicht nur der Stufe.
      //
      // Vier Stufen ergaben vier feste Breiten - und bei ruhiger Haut vier
      // gleich lange Balken untereinander, die aussehen, als haette gar
      // nichts stattgefunden. Die Werte sind aber nicht gleich. Ein Viertel
      // der Skala je Stufe, darin nach Ausschoepfung verteilt: Damit sieht
      // man den Unterschied, und keine Stufe verspricht mehr, als sie sagt.
      fuell.style.width = `${this.#balkenbreite(befund)}%`;
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
      // Und wenn kein Befund eine Stufe erreicht hat, traegt der Schwerpunkt
      // den Grund. "Zur Erhaltung" ist ehrlich, aber es ist kein Grund, den
      // jemand mit sich selbst verbindet - "fuer Ihre Rötung" schon, auch
      // wenn die Rötung nur der hoechste unter lauter ruhigen Werten ist.
      const grund = befund || (eintrag.grundpflege ? null : this.zustand.befund?.schwerpunkt);
      schreibe($(".ls-produkt__wegen", el),
        eintrag.grundpflege || !grund
          ? this.text("empfehlungErhaltung")
          : this.text("empfehlungWegen", { befund: t(grund.label, this.sprache).toLowerCase() }));
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
    // Das Ereignis, auf das die Anzeigen optimieren: Es kommt oft genug vor,
    // dass Meta daraus lernen kann - anders als die Bestellung.
    this.pixel.meldeLead();
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
