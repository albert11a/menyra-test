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
import { felder } from "../lifeskin/lifeskin-session.js";
import { Pixel } from "../lifeskin/lifeskin-pixel.js";
import { TEXTE, t, fuelle } from "./bericht-texte.js";

const $ = (auswahl) => document.querySelector(auswahl);

function schreibe(knoten, text) {
  if (knoten && knoten.textContent !== text) knoten.textContent = text;
}

function zeige(name) {
  for (const schirm of ["laedt", "weg", "wartet"]) {
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
    this.#wartenZeigen();
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
