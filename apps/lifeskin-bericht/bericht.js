// Die Befundseite: mnyra.com/analiza/<kennung>
//
// Sie gehoert dem Patienten. Er kommt direkt nach dem Scan hierher, sie hat
// eine eigene Adresse, er kann sie speichern und weiterschicken.
//
// ZWEI ZUSTAENDE, und heute nur der erste:
//
//   "wartet"  - Dr. Gashi hat den Fall noch nicht angesehen. Das ist der
//               Bildschirm, den fast jeder sieht.
//   "fertig"  - ihr Befund, die Therapie, die Produkte, der Kauf.
//
// WARUM EIN EIGENES DOKUMENT und nicht die Sitzung selbst: In der Sitzung
// stehen Telefonnummer und Anschrift. Waere sie oeffentlich lesbar, verschickt
// jemand, der seinen Link teilt, seine eigene Adresse mit. Das Berichtdokument
// enthaelt nur, was auf dieser Seite steht.

// Relativ und nicht absolut: Der Browser kaeme mit beidem zurecht, die
// Tests nur mit diesem - und ungetesteter Code ist hier schon zweimal teuer
// geworden.
import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT, LIFESKIN_WHATSAPP, LIFESKIN_WHATSAPP_TEXT }
  from "../lifeskin/lifeskin-config.js";
import { STANDARD_KONFIG, tagespreis } from "../lifeskin/lifeskin-catalog.js";
import { felder } from "../lifeskin/lifeskin-session.js";
import { Pixel } from "../lifeskin/lifeskin-pixel.js";
import { TEXTE, t, fuelle } from "./bericht-texte.js";

const $ = (auswahl) => document.querySelector(auswahl);

// Die Zeichen.
//
// Sie sind hier keine Zierde: Wer eine Seite ueberfliegt, haengt an
// Ueberschriften und Symbolen, nicht an Saetzen. Jedes steht fuer genau
// eine Frage, die vor dem Kauf im Kopf ist - und beantwortet sie, bevor
// irgendwer den Satz daneben liest.
const ZEICHEN = Object.freeze({
  // "Muss ich vorher zahlen?"
  hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13.5c1.6-1.2 3.2-1.1 4.6.2l2.2 2.1"/><path d="M7 11.5l4.6 1.2a2 2 0 0 0 2.2-3l-2.4-3a2 2 0 0 1 .3-2.8l1-.8"/><path d="M13 16.5l6.2-3.4a1.9 1.9 0 0 1 2.6.8c.5.9.2 2-.7 2.5l-6.4 3.8a4 4 0 0 1-3.4.3L7 18.5"/></svg>',
  // "Was, wenn es nicht wirkt?"
  schild: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 3.5v6c0 5-3.4 9-8 10.5-4.6-1.5-8-5.5-8-10.5v-6z"/><path d="M8.6 12.2l2.4 2.4 4.4-4.6"/></svg>',
  // "Wann kommt es?"
  paket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8.5h11v9H2z"/><path d="M13 11h4l3 3v3.5h-7z"/><circle cx="6" cy="19" r="1.6"/><circle cx="16.5" cy="19" r="1.6"/></svg>',
  haken: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  karton: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5l9-4 9 4v9l-9 4-9-4z"/><path d="M3 7.5l9 4 9-4"/><path d="M12 11.5v9"/></svg>',
  haus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/></svg>'
});

// Zahlen so, wie sie in Kosovo und Albanien geschrieben werden: Komma statt
// Punkt, und ganze Betraege ohne Nachkommastellen.
function zahl(wert) {
  const n = Number(wert);
  if (!Number.isFinite(n)) return "";
  return (Number.isInteger(n) ? String(n) : n.toFixed(2)).replace(".", ",");
}
function euro(wert) { return `${zahl(wert)} €`; }

function schreibe(knoten, text) {
  if (knoten && knoten.textContent !== text) knoten.textContent = text;
}

function zeige(name) {
  for (const schirm of ["laedt", "weg", "wartet", "fertig", "bestellen"]) {
    const knoten = $(`#lb-${schirm}`);
    if (knoten) knoten.dataset.aktiv = schirm === name ? "ja" : "nein";
  }
}

// Firestore-Werte in gewoehnliche zurueckverwandeln. Nur die Formen, die im
// Bericht vorkommen - mehr braucht diese Seite nicht.
function wert(feld) {
  if (!feld || typeof feld !== "object") return null;
  if ("stringValue" in feld) return feld.stringValue;
  if ("integerValue" in feld) return Number(feld.integerValue);
  if ("doubleValue" in feld) return feld.doubleValue;
  if ("booleanValue" in feld) return feld.booleanValue;
  if ("timestampValue" in feld) return feld.timestampValue;
  if ("arrayValue" in feld) return (feld.arrayValue.values || []).map(wert);
  if ("mapValue" in feld) {
    const raus = {};
    for (const [k, v] of Object.entries(feld.mapValue.fields || {})) raus[k] = wert(v);
    return raus;
  }
  return null;
}

// Die Kennung steht im Pfad: /analiza/<kennung>
function kennungAusPfad(pfad = globalThis.location?.pathname || "") {
  const teile = String(pfad).split("/").filter(Boolean);
  const letztes = teile[teile.length - 1] || "";
  return /^[0-9a-f]{8,64}$/.test(letztes) ? letztes : "";
}

// Wann Dr. Gashi antwortet - ehrlich, nicht erfunden.
//
// Vor achtzehn Uhr: heute. Danach: morgen frueh. Keine Warteschlange, keine
// Position. Wer nachts kommt und "noch 3 vor Ihnen" liest, weiss, dass es
// gelogen ist - und glaubt danach auch dem Befund nicht.
export function wartetext(stunde) {
  return stunde < 18 ? TEXTE.dauerHeute : TEXTE.dauerMorgen;
}

class Bericht {
  constructor({ fetchFn, ort, pixel } = {}) {
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.ort = ort || globalThis.location;
    this.kennung = kennungAusPfad(this.ort?.pathname);
    this.sprache = "sq";
    this.daten = null;
    this.waGetippt = false;
    this.waGefragt = false;
    this.pixel = pixel || new Pixel();
  }

  text(schluessel, werte) {
    const roh = t(TEXTE[schluessel], this.sprache);
    return werte ? fuelle(roh, werte) : roh;
  }

  async starte() {
    schreibe($("#lb-laedttext"), this.text("laedt"));
    if (!this.kennung) { this.#wegZeigen(); return; }

    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}`
      );
      if (!antwort.ok) { this.#wegZeigen(); return; }
      const roh = await antwort.json();
      this.daten = {};
      for (const [k, v] of Object.entries(roh.fields || {})) this.daten[k] = wert(v);
    } catch {
      this.#wegZeigen();
      return;
    }

    this.sprache = this.daten.sprache === "de" ? "de" : "sq";
    // Dass er seine Seite ueberhaupt geoeffnet hat, ist die erste Zahl, die
    // ueber diesen Weg entscheidet: Wer nach dem Scan nie ankommt, ist auf
    // dem Weg dorthin verloren gegangen, und dann liegt es nicht am Befund.
    this.#merken({ berichtGeoeffnet: true });
    if (this.pixel.starte()) this.pixel.melde("opened");
    this.#ereignisse();
    await this.#zeichnen();
    this.#horchen();
  }

  // Welcher Bildschirm zum Zustand gehoert.
  async #zeichnen() {
    if (this.daten.status === "wartet") { this.#wartenZeigen(); return; }
    await this.#produkteHolen();
    this.#fertigZeigen();
  }

  // OHNE NEULADEN.
  //
  // Gefragt wird in Abstaenden, nicht gelauscht. Ein echter Horchkanal
  // brauchte das Firebase-Paket - rund 460 KB auf einer Seite, die in
  // Sekunden offen sein muss und oft im Fenster von Instagram laeuft. Für
  // eine Wartezeit von Stunden ist ein Blick alle zwoelf Sekunden genauso
  // gut und kostet nichts.
  //
  // Und nur, solange die Seite wirklich zu sehen ist: Ein Handy in der
  // Tasche fragt nicht. Kommt sie zurueck, wird sofort gefragt - das ist der
  // Moment, in dem jemand nachsieht, ob der Befund da ist.
  #horchen() {
    const fertigOderWeiter = () => ["bestellt", "versandt", "zugestellt"].includes(this.daten?.status);
    const nachsehen = async () => {
      if (document.visibilityState !== "visible" || fertigOderWeiter()) return;
      const vorher = this.daten?.status;
      const frisch = await this.#holen();
      if (!frisch || frisch.status === vorher) return;
      this.daten = frisch;
      await this.#zeichnen();
    };
    this.takt = setInterval(nachsehen, 12000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") nachsehen(); });
  }

  async #holen() {
    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}`
      );
      if (!antwort.ok) return null;
      const roh = await antwort.json();
      const raus = {};
      for (const [k, v] of Object.entries(roh.fields || {})) raus[k] = wert(v);
      return raus;
    } catch { return null; }
  }

  // Die Produkte stehen NICHT im Bericht.
  //
  // Ihre Fotos sind Datenzeilen von mehreren hunderttausend Zeichen; zwei
  // davon sprengen ein Firestore-Dokument. Im Bericht steht nur, welches
  // Produkt und welcher persoenliche Satz - das Uebrige kommt aus der
  // Produktsammlung, die ohnehin oeffentlich lesbar ist.
  async #produkteHolen() {
    const gewaehlt = Array.isArray(this.daten.produkte) ? this.daten.produkte : [];
    this.produkte = [];
    for (const eintrag of gewaehlt) {
      const id = typeof eintrag === "string" ? eintrag : eintrag?.id;
      if (!id) continue;
      let stamm = {};
      try {
        const antwort = await this.fetchFn(
          `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/products/${encodeURIComponent(id)}`
        );
        if (antwort.ok) {
          const roh = await antwort.json();
          for (const [k, v] of Object.entries(roh.fields || {})) stamm[k] = wert(v);
        }
      } catch { /* ohne Stammdaten bleibt der persoenliche Satz */ }
      this.produkte.push({
        id,
        name: stamm.name || id,
        inhalt: stamm.inhalt || "",
        einzelpreis: Number(stamm.einzelpreis) || 0,
        foto: typeof stamm.photoRef === "string" && stamm.photoRef.startsWith("data:image") ? stamm.photoRef : "",
        satz: (typeof eintrag === "object" && eintrag?.satz) || stamm.kurztext?.[this.sprache] || ""
      });
    }
  }

  // Was auf dieser Seite geschieht, gehoert in dieselbe Sitzung.
  //
  // Sonst stuende in Heart der Scan und danach nichts mehr: Ob der Patient
  // seine Seite ueberhaupt geoeffnet hat, ob er sich melden wollte, ob er
  // den Link kopiert hat - das sind genau die Zahlen, an denen sich zeigt,
  // ob dieser Weg traegt. Die Sitzung darf jeder ergaenzen und niemand ausser
  // dem CEO-Konto lesen; hier gilt dieselbe Tuer wie im Trichter.
  //
  // Der Fehler wird geschluckt. Eine Zaehlung, die die Seite anhaelt, waere
  // teurer als jede fehlende Zahl.
  #merken(daten) {
    const mit = { updatedAt: new Date().toISOString(), ...daten };
    const maske = Object.keys(mit)
      .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
    return this.fetchFn(
      `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/sessions/${this.kennung}?${maske}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: felder(mit) })
      }
    ).catch((fehler) => {
      globalThis.console?.warn?.("[lifeskin] Bericht nicht gezaehlt:", fehler?.message);
    });
  }

  #wegZeigen() {
    schreibe($("#lb-wegtitel"), this.text("wegTitel"));
    schreibe($("#lb-wegtext"), this.text("wegText"));
    zeige("weg");
  }

  #wartenZeigen() {
    const name = (this.daten.name || "").trim();
    // Ohne Namen kein leerer Platz mitten im Satz. Das passiert seltener,
    // als man denkt, und sieht dann doppelt kaputt aus.
    schreibe($("#lb-titel"), name ? this.text("titel", { name }) : this.text("titelOhneName"));
    schreibe($("#lb-warum"), this.text("warum"));

    // Die Wartezeit oben, als Erstes im Blick.
    schreibe($("#lb-dauer b"), t(wartetext(new Date().getHours()), this.sprache));

    schreibe($("#lb-aktemarke"), this.text("akteMarke"));
    schreibe($("#lb-nummer"), this.daten.code || "");
    schreibe($("#lb-zeit"), this.#zeitLesbar(this.daten.createdAt));
    schreibe($("#lb-fotos"), this.text("akteFotos", { anzahl: this.daten.photos || 3 }));

    this.#schritteZeigen();

    schreibe($("#lb-benachrichtigen"), this.text("benachrichtigen"));
    schreibe($("#lb-waunter"), this.text("waUnter"));
    schreibe($("#lb-warueckfrage"), this.text("waRueckFrage"));
    schreibe($("#lb-warueckja"), this.text("waRueckJa"));
    schreibe($("#lb-kopieren"), this.text("kopieren"));
    schreibe($("#lb-faqknopf"), this.text("waWasPassiert"));

    // Das Blatt.
    schreibe($("#lb-blatttitel"), this.text("waWasPassiert"));
    schreibe($("#lb-wafaqtext"), this.text("waWasPassiertText"));
    schreibe($("#lb-kopierenunter"), this.text("kopierenUnter"));
    schreibe($("#lb-haftung"), this.text("haftung"));
    schreibe($("#lb-blattzu"), this.text("blattZu"));

    this.#whatsappSetzen();

    zeige("wartet");
  }

  // Vier Punkte: zwei erledigt, einer laeuft, einer offen.
  //
  // Er stand einmal als Liste da - vier Zeilen Text, die jeder ueberflog und
  // niemand zu Ende las. Als Balkenreihe sagt er dasselbe in einer Zeile,
  // und benannt wird nur der laufende: Das ist der einzige, der eine Frage
  // beantwortet ("was passiert gerade?"). Die anderen drei beantwortet der
  // Blick auf die Reihe.
  #schritteZeigen() {
    const liste = $("#lb-schritte");
    if (!liste) return;
    liste.innerHTML = "";

    const staende = ["fertig", "fertig", "laeuft", "offen"];
    for (const stand of staende) {
      const el = document.createElement("li");
      el.dataset.stand = stand;
      liste.appendChild(el);
    }
    schreibe($("#lb-jetzt"), this.text("schrittAnalyse"));
  }

  // ---------- Der fertige Befund ----------

  #fertigZeigen() {
    const name = (this.daten.name || "").trim();
    schreibe($("#lb-ftitel"), name ? this.text("fertigTitel", { name }) : this.text("fertigOhneName"));
    schreibe($("#lb-fvontext"), this.text("fertigVon"));
    schreibe($("#lb-fnummer"), this.daten.code || "");
    schreibe($("#lb-befundmarke"), this.text("befundMarke"));
    schreibe($("#lb-befundtext"), this.daten.befund || "");
    schreibe($("#lb-therapiemarke"), this.text("therapieMarke"));
    schreibe($("#lb-therapieunter"), this.text("therapieUnter"));
    schreibe($("#lb-fhaftung"), this.text("haftung"));

    this.#produkteZeichnen();
    this.#preisZeichnen();
    this.#sicherZeichnen();
    this.#versandZeichnen();

    zeige("fertig");
  }

  #produkteZeichnen() {
    const kasten = $("#lb-produkte");
    if (!kasten) return;
    kasten.innerHTML = "";
    for (const p of this.produkte || []) {
      const el = document.createElement("div");
      el.className = "lb-produkt";
      el.innerHTML = '<div class="lb-produkt__bild"></div>'
        + '<div class="lb-produkt__leib"><span class="lb-produkt__name"></span>'
        + '<span class="lb-produkt__inhalt"></span><p class="lb-produkt__satz"></p></div>';
      const bild = el.querySelector(".lb-produkt__bild");
      if (p.foto) {
        const img = document.createElement("img");
        img.src = p.foto; img.alt = p.name; img.loading = "lazy";
        bild.appendChild(img);
      } else {
        // Ohne Foto kein leerer Rahmen: ein Zeichen, das nach Pflege
        // aussieht, statt nach fehlendem Bild.
        bild.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v3.6l4 6.4v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 19.5V12l4-6.4z"/><path d="M5.6 14h12.8"/></svg>';
        bild.classList.add("lb-produkt__bild--leer");
      }
      schreibe(el.querySelector(".lb-produkt__name"), p.name);
      schreibe(el.querySelector(".lb-produkt__inhalt"), p.inhalt);
      schreibe(el.querySelector(".lb-produkt__satz"), p.satz);
      kasten.appendChild(el);
    }
  }

  // Der Preis steht nie allein.
  //
  // Erst die Einzelpreise, dann der Setpreis, dann der Tagesbetrag. Die
  // Reihenfolge ist die Rechnung: Wer 68 gesehen hat, liest 53 als Ersparnis
  // und nicht als Ausgabe - und 1,89 am Tag hat gar keinen Vergleichspreis
  // mehr im Regal.
  get preis() { return Number(this.daten.preis) || STANDARD_KONFIG.setPreis; }

  #preisZeichnen() {
    const einzeln = (this.produkte || []).reduce((s, p) => s + (Number(p.einzelpreis) || 0), 0);
    const gespart = Math.max(0, Math.round((einzeln - this.preis) * 100) / 100);
    schreibe($("#lb-preismarke"), this.text("preisMarke"));
    const anker = $("#lb-preisanker");
    if (einzeln > this.preis) schreibe(anker, `${euro(einzeln)}`);
    else if (anker) { anker.textContent = ""; anker.classList.add("ls-verstecken"); }
    schreibe($("#lb-preisjetzt"), euro(this.preis));
    const spar = $("#lb-preisspar");
    if (gespart > 0) schreibe(spar, this.text("preisGespart", { betrag: zahl(gespart) }));
    else if (spar) spar.classList.add("ls-verstecken");
    schreibe($("#lb-preistag"), this.text("preisTag", {
      tagespreis: zahl(tagespreis({ ...STANDARD_KONFIG, setPreis: this.preis }))
    }));
  }

  // Drei Zeilen gegen drei Fragen: Muss ich vorher zahlen? Was, wenn es
  // nicht wirkt? Wann kommt es? Sie stehen direkt ueber dem Knopf, weil dort
  // die Anspannung am groessten ist.
  #sicherListe(liste) {
    if (!liste) return;
    liste.innerHTML = "";
    const zeilen = [
      ["hand", this.text("sicherNachnahme")],
      ["schild", this.text("sicherGarantie")],
      ["paket", this.text("sicherLieferung")]
    ];
    for (const [zeichen, text] of zeilen) {
      const el = document.createElement("li");
      el.innerHTML = `<span class="lb-sicher__zeichen" aria-hidden="true">${ZEICHEN[zeichen]}</span><span></span>`;
      schreibe(el.lastElementChild, text);
      liste.appendChild(el);
    }
  }

  #sicherZeichnen() {
    this.#sicherListe($("#lb-sicher"));
    schreibe($("#lb-kaufen"), this.text("kaufKnopf", { preis: zahl(this.preis) }));
    schreibe($("#lb-kaufunter"), this.text("kaufUnter"));
    // Nach der Bestellung gibt es nichts mehr zu kaufen.
    $("#lb-leiste")?.classList.toggle("ls-verstecken", this.daten.status !== "fertig");
  }

  // ---------- Versandstand ----------
  //
  // Er steht ganz oben, sobald bestellt wurde - dort sitzt die erste Frage
  // nach dem Kauf. Bei Nachnahme ist das keine Freundlichkeit: Wer bis zur
  // Lieferung im Ungewissen bleibt, verweigert das Paket an der Tuer.
  #versandZeichnen() {
    const kasten = $("#lb-versand");
    if (!kasten) return;
    const stand = this.daten.status;
    const an = ["bestellt", "versandt", "zugestellt"].includes(stand);
    kasten.classList.toggle("ls-verstecken", !an);
    if (!an) return;

    schreibe($("#lb-versandmarke"), this.text("versandMarke"));
    schreibe($("#lb-versandzeit"), this.daten.lieferVon && this.daten.lieferBis
      ? this.text("versandErwartet", { von: this.daten.lieferVon, bis: this.daten.lieferBis })
      : "");
    schreibe($("#lb-versandzahlung"), this.text("versandZahlung", { preis: zahl(this.preis) }));

    const stufen = [
      { id: "bestellt", text: this.text("versandBestellt"), zeichen: "haken" },
      { id: "vorbereitet", text: this.text("versandVorbereitet"), zeichen: "karton" },
      { id: "versandt", text: this.text("versandUnterwegs"), zeichen: "paket" },
      { id: "zugestellt", text: this.text("versandZugestellt"), zeichen: "haus" }
    ];
    const erreicht = { bestellt: 1, versandt: 3, zugestellt: 4 }[stand] || 1;

    const spur = $("#lb-spur");
    spur.innerHTML = "";
    for (const [i, stufe] of stufen.entries()) {
      const el = document.createElement("li");
      el.dataset.stand = i + 1 < erreicht ? "fertig" : i + 1 === erreicht ? "laeuft" : "offen";
      el.innerHTML = `<span class="lb-spur__zeichen" aria-hidden="true">${ZEICHEN[stufe.zeichen]}</span><span class="lb-spur__text"></span>`;
      schreibe(el.querySelector(".lb-spur__text"), stufe.text);
      spur.appendChild(el);
    }
  }

  #whatsappSetzen() {
    const link = $("#lb-walink");
    if (!link) return;
    if (!LIFESKIN_WHATSAPP) { link.classList.add("ls-verstecken"); return; }
    const vorlage = t(LIFESKIN_WHATSAPP_TEXT, this.sprache) || "";
    const text = vorlage.split("{code}").join(this.daten.code || "");
    link.href = `https://wa.me/${LIFESKIN_WHATSAPP}?text=${encodeURIComponent(text)}`;
    schreibe(link, this.text("waKnopf"));
  }

  #ereignisse() {
    // Der Griff zum Knopf ist das Ereignis, auf das die Anzeigen lernen.
    //
    // Nicht der Kauf: Bei den geplanten Ausgaben liegen die Bestellungen
    // unter den ungefaehr fuenfzig Ereignissen je Woche, die eine
    // Anzeigengruppe braucht, um aus der Lernphase zu kommen. Die Griffe
    // liegen darueber.
    $("#lb-walink")?.addEventListener("click", () => {
      this.waGetippt = true;
      this.#merken({ waClick: true });
      this.pixel.meldeLead();
    });
    $("#lb-warueckja")?.addEventListener("click", () => {
      $("#lb-warueck")?.classList.add("ls-verstecken");
      this.#merken({ waSent: true });
      const link = $("#lb-walink");
      if (link) { link.classList.add("ls-erledigt"); schreibe(link, "✓ " + this.text("waDanke")); }
    });
    $("#lb-kopieren")?.addEventListener("click", () => this.#kopieren());
    $("#lb-kaufen")?.addEventListener("click", () => this.#bestellblatt(true));
    for (const knoten of document.querySelectorAll("[data-bestell-zu]")) {
      knoten.addEventListener("click", () => this.#bestellblatt(false));
    }
    $("#lb-bzurueck")?.addEventListener("click", () => this.#bestellblatt(false));
    $("#lb-bestellform")?.addEventListener("submit", (ereignis) => {
      ereignis.preventDefault();
      this.#bestellen();
    });
    $("#lb-faqknopf")?.addEventListener("click", () => this.#blatt(true));
    for (const knoten of document.querySelectorAll("[data-blatt-zu]")) {
      knoten.addEventListener("click", () => this.#blatt(false));
    }
    // Die Escape-Taste schliesst es auch. Auf dem Handy tut das niemand,
    // auf dem Schreibtisch erwartet es jeder.
    document.addEventListener("keydown", (ereignis) => {
      if (ereignis.key === "Escape") this.#blatt(false);
    });
    document.addEventListener("visibilitychange", () => {
      if (!this.waGetippt || this.waGefragt) return;
      if (document.visibilityState !== "visible") return;
      this.waGefragt = true;
      $("#lb-warueck")?.classList.remove("ls-verstecken");
    });
  }

  // ---------- Die Bestellung ----------

  // Ein eigener Bildschirm, kein Blatt ueber der Seite.
  //
  // Vier Felder und die Tastatur des Telefons passen nicht in ein Blatt am
  // unteren Rand: Die Tastatur schiebt es hoch, der Knopf rutscht aus dem
  // Bild, und der Kunde tippt seine Adresse, ohne noch zu sehen, was er
  // kauft. Deshalb hier eine ganze Seite - oben der Korb mit dem, was er
  // bekommt, darunter die Felder, unten fest der Knopf.
  #bestellblatt(auf) {
    const schirm = $("#lb-bestellen");
    if (!schirm) return;
    if (auf) {
      this.#korbZeichnen();
      schreibe($("#lb-besttitel"), this.text("bestellTitel"));
      // Beschriftung im Feld statt darueber: vier Zeilen weniger. Als
      // aria-label bleibt sie fuer Vorleseprogramme erhalten.
      const felder = [
        ["#lb-bname", "bestellName"],
        ["#lb-btelefon", "bestellTelefon"],
        ["#lb-badresse", "bestellAdresse"],
        ["#lb-bort", "bestellOrt"]
      ];
      for (const [wahl, schluessel] of felder) {
        const feld = $(wahl);
        if (!feld) continue;
        const wort = this.text(schluessel);
        feld.placeholder = wort;
        feld.setAttribute("aria-label", wort);
      }
      schreibe($("#lb-bsenden"), this.text("bestellSenden"));
      schreibe($("#lb-bunter"), this.text("kaufUnter"));
      // Die drei Zusagen stehen auch hier am Knopf. Der Zweifel kommt beim
      // Tippen der Adresse zurueck, nicht davor.
      this.#sicherListe($("#lb-bsicher"));
      $("#lb-bfehler")?.classList.add("ls-verstecken");
      // Den Namen kennen wir schon. Ein Feld, das der Kunde nicht noch
      // einmal tippen muss, ist ein Feld weniger zum Abbrechen.
      const namensfeld = $("#lb-bname");
      if (namensfeld && !namensfeld.value) namensfeld.value = this.daten.name || "";
    }
    zeige(auf ? "bestellen" : "fertig");
    // Kein automatischer Fokus: Die Tastatur wuerde sofort aufspringen und
    // genau den Korb verdecken, wegen dem diese Seite existiert.
  }

  // Der Korb ganz oben. Er beantwortet die Frage, die beim Adresse-Tippen
  // aufkommt: "Was zahle ich hier eigentlich gerade?"
  #korbZeichnen() {
    const kasten = $("#lb-bkorb");
    if (!kasten) return;
    kasten.innerHTML = "";
    for (const p of this.produkte || []) {
      const el = document.createElement("div");
      el.className = "lb-korb__teil";
      el.innerHTML = '<span class="lb-korb__bild" aria-hidden="true"></span>'
        + '<span class="lb-korb__leib"><span class="lb-korb__name"></span>'
        + '<span class="lb-korb__inhalt"></span></span>';
      const bild = el.querySelector(".lb-korb__bild");
      if (p.foto) {
        const img = document.createElement("img");
        img.src = p.foto; img.alt = ""; img.loading = "lazy";
        bild.appendChild(img);
      } else {
        bild.innerHTML = ZEICHEN.karton;
      }
      schreibe(el.querySelector(".lb-korb__name"), p.name);
      schreibe(el.querySelector(".lb-korb__inhalt"), p.inhalt || "");
      kasten.appendChild(el);
    }
    const summe = document.createElement("div");
    summe.className = "lb-korb__summe";
    summe.innerHTML = '<span></span><strong></strong>';
    schreibe(summe.firstElementChild, this.text("korbSumme"));
    schreibe(summe.lastElementChild, euro(this.preis));
    kasten.appendChild(summe);
    const zahlung = document.createElement("p");
    zahlung.className = "lb-korb__zahlung";
    schreibe(zahlung, this.text("korbZahlung"));
    kasten.appendChild(zahlung);
  }

  async #bestellen() {
    const werte = {
      name: $("#lb-bname")?.value.trim() || "",
      telefon: $("#lb-btelefon")?.value.trim() || "",
      strasse: $("#lb-badresse")?.value.trim() || "",
      ort: $("#lb-bort")?.value.trim() || ""
    };
    const fehler = $("#lb-bfehler");
    if (!werte.name || !werte.telefon || !werte.strasse || !werte.ort) {
      schreibe(fehler, this.text("bestellPflicht"));
      fehler?.classList.remove("ls-verstecken");
      return;
    }
    fehler?.classList.add("ls-verstecken");
    const knopf = $("#lb-bsenden");
    if (knopf) { knopf.disabled = true; schreibe(knopf, this.text("bestellLaeuft")); }

    const jetzt = new Date().toISOString();
    // ZUERST die Anschrift in die Sitzung - sie darf niemand ausser dem
    // CEO-Konto lesen. Der Bericht ist oeffentlich; eine Adresse darin waere
    // in dem Moment offen, in dem jemand seinen Link weitergibt.
    const gespeichert = await this.#merken({
      address: werte,
      phone: werte.telefon,
      order: { total: this.preis, payment: "nachnahme", status: "neu", orderId: this.daten.code || this.kennung },
      step: "ordered"
    });

    // Und dann der Zustand im Bericht - das ist der Teil, den er selbst
    // sieht, und der einzige, den er selbst aendern darf.
    const maske = ["status", "bestelltAt"].map((f) => `updateMask.fieldPaths=${f}`).join("&");
    let ok = false;
    try {
      const antwort = await this.fetchFn(
        `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/reports/${this.kennung}?${maske}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: felder({ status: "bestellt", bestelltAt: jetzt }) })
        }
      );
      ok = antwort.ok;
    } catch { ok = false; }

    if (!ok && gespeichert === undefined) {
      schreibe(fehler, this.text("bestellFehler"));
      fehler?.classList.remove("ls-verstecken");
      if (knopf) { knopf.disabled = false; schreibe(knopf, this.text("bestellSenden")); }
      return;
    }

    this.pixel.melde("ordered", { order: { total: this.preis, orderId: this.daten.code } });
    this.daten.status = "bestellt";
    this.daten.bestelltAt = jetzt;
    this.#bestellblatt(false);
    if (knopf) { knopf.disabled = false; schreibe(knopf, this.text("bestellSenden")); }
    this.#fertigZeigen();
    $("#lb-rolle")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Das Blatt auf und zu.
  //
  // Kein <details> im Fluss: Das haette den Bildschirm beim Aufklappen
  // laenger gemacht als das Fenster und damit genau das Scrollen
  // zurueckgeholt, das hier vermieden werden soll.
  #blatt(auf) {
    const blatt = $("#lb-blatt");
    if (!blatt) return;
    blatt.classList.toggle("ls-verstecken", !auf);
    $("#lb-faqknopf")?.setAttribute("aria-expanded", auf ? "true" : "false");
    if (auf) $("#lb-blattzu")?.focus();
  }

  // Den Link kopieren.
  //
  // Mit Rueckfallweg: In den Fenstern von Instagram und TikTok fehlt die
  // Zwischenablage haeufig. Dann wird der Text markiert - kopieren muss er
  // dann selbst, aber er sitzt nicht fest.
  async #kopieren() {
    const knopf = $("#lb-kopieren");
    const adresse = this.ort?.href || "";
    this.#merken({ linkKopiert: true });
    try {
      await navigator.clipboard.writeText(adresse);
      schreibe(knopf, this.text("kopiert"));
      return;
    } catch { /* weiter unten */ }
    try {
      const feld = document.createElement("input");
      feld.value = adresse;
      feld.setAttribute("readonly", "");
      feld.style.position = "fixed";
      feld.style.opacity = "0";
      document.body.appendChild(feld);
      feld.select();
      feld.setSelectionRange(0, adresse.length);
      document.execCommand("copy");
      feld.remove();
      schreibe(knopf, this.text("kopiert"));
    } catch {
      // Klappt beides nicht - in manchen App-Fenstern der Fall - wird das
      // Blatt geoeffnet. Dort steht die Adresse zum Abschreiben, und er
      // sitzt nicht vor einem Knopf, der nichts tut.
      this.#blatt(true);
      const feld = $("#lb-kopierenunter");
      if (feld) feld.textContent = adresse;
    }
  }

  // Datum und Uhrzeit, wie man sie in Prishtina und Tirana schreibt.
  //
  // NICHT toLocaleString mit "sq-AL": Die albanische Zone fehlt in vielen
  // Webansichten, und dann faellt der Browser still auf sein eigenes Gebiet
  // zurueck - auf einem Geraet mit englischer Einstellung stand hier
  // "09/05/2026, 11:07 PM". Das ist nicht nur fremd, es ist mehrdeutig: Der
  // Fuenfte im September oder der neunte im Mai? Auf einer Aktennummer mit
  // Datum darf genau das nicht offen bleiben.
  //
  // Also selbst gesetzt, in der Geschaeftszone: TT.MM.JJJJ, HH:MM.
  #zeitLesbar(iso) {
    const zeit = Date.parse(iso);
    if (!Number.isFinite(zeit)) return "";
    try {
      const teile = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Belgrade",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date(zeit));
      const w = (art) => teile.find((t) => t.type === art)?.value || "";
      const tag = w("day"), monat = w("month"), jahr = w("year");
      const stunde = w("hour"), minute = w("minute");
      if (!tag || !monat || !jahr) return "";
      // 24 Uhr gibt es nicht. en-GB liefert bei Mitternacht "24" statt "00".
      return `${tag}.${monat}.${jahr}, ${stunde === "24" ? "00" : stunde}:${minute}`;
    } catch { return ""; }
  }
}

export { Bericht, kennungAusPfad };

if (typeof document !== "undefined" && !globalThis.__LIFESKIN_TEST__) {
  const start = () => new Bericht().starte();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
}
