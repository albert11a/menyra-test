// Die Datenschicht der Hauptanalyse - mnyra.com/analiza/<kennung>
//
// SIE IST BEWUSST VON DER DARSTELLUNG GETRENNT. Astra ist die Gestaltung;
// hier steht nur, woher die Angaben kommen und wohin eine Bestellung
// geht. Wer an der Seite etwas verschiebt, muss diese Datei nicht lesen,
// und wer an den Daten etwas aendert, nicht die Seite.
//
// EINE SAMMLUNG JE ZWECK, wie schon in der bisherigen Fassung:
//
//   reports/<kennung>    der Befund. Oeffentlich lesbar, damit der
//                        Patient seinen Link weitergeben kann - und
//                        deshalb OHNE Anschrift und Telefonnummer.
//   products/<id>        die Stammdaten der Mittel. Fuer jeden Patienten
//                        dieselben, darum nicht im Befund dupliziert.
//   sessions/<kennung>   alles Persoenliche: Anschrift, Telefon, was auf
//                        der Seite geschehen ist. Jeder darf ergaenzen,
//                        niemand ausser dem CEO-Konto darf lesen.
//
// Wer diese Trennung aufweicht, verschickt Anschriften mit jedem
// geteilten Link.

import { LIFESKIN_FIRESTORE_BASE, LIFESKIN_TENANT } from "../lifeskin/lifeskin-config.js";
import { felder } from "../lifeskin/lifeskin-session.js";

// Firestore verpackt jeden Wert in seinen Typ. Ausgepackt werden nur die
// Formen, die im Befund wirklich vorkommen - mehr braucht diese Seite
// nicht, und was sie nicht kennt, kann sie auch nicht falsch anzeigen.
export function wert(feld) {
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

export function dokument(roh) {
  const raus = {};
  for (const [k, v] of Object.entries(roh?.fields || {})) raus[k] = wert(v);
  return raus;
}

// Die Kennung steht im Pfad: /analiza/<kennung>
//
// NUR HEXADEZIMALZIFFERN. Die Kennung wird in lifeskin-session.js aus
// sechzehn Zufallsbytes gebaut; alles andere ist keine Kennung, sondern
// ein Tippfehler oder ein Versuch. Ein Muster, das mehr durchlaesst,
// schickt beides an Firestore.
export function kennungAusPfad(pfad = globalThis.location?.pathname || "") {
  const teile = String(pfad).split("/").filter(Boolean);
  const letztes = teile[teile.length - 1] || "";
  return /^[0-9a-f]{8,64}$/.test(letztes) ? letztes : "";
}

// Ein Text, der je Sprache vorliegt - oder einer, der es nicht tut.
//
// Heart schreibt manche Felder als { sq, de }, andere als blanke
// Zeichenkette. Beides kommt hier an, und beides muss lesbar
// herauskommen: Ein "[object Object]" im Befund ist schlimmer als eine
// fehlende Zeile.
export function sprachtext(feld, sprache) {
  if (typeof feld === "string") return feld.trim();
  if (feld && typeof feld === "object") return String(feld[sprache] || feld.sq || "").trim();
  return "";
}

export class AnalyseDaten {
  constructor({ fetchFn, kennung } = {}) {
    this.fetchFn = fetchFn || ((...a) => globalThis.fetch(...a));
    this.kennung = kennung || "";
  }

  #adresse(sammlung, id, suche = "") {
    return `${LIFESKIN_FIRESTORE_BASE}/lifeskin/${LIFESKIN_TENANT}/${sammlung}/${id}${suche}`;
  }

  // Der Befund. Kommt nichts zurueck, ist es keiner - der Aufrufer zeigt
  // dann "nicht gefunden" und nicht etwa eine halbe Seite.
  async bericht() {
    if (!this.kennung) return null;
    try {
      const antwort = await this.fetchFn(this.#adresse("reports", this.kennung));
      if (!antwort.ok) return null;
      return dokument(await antwort.json());
    } catch {
      return null;
    }
  }

  // Die Mittel stehen NICHT im Befund.
  //
  // Ihre Fotos sind Datenzeilen von mehreren hunderttausend Zeichen; zwei
  // davon sprengen ein Firestore-Dokument. Im Befund steht nur, welches
  // Mittel und welcher persoenliche Satz - alles Uebrige kommt aus der
  // Produktsammlung, die ohnehin oeffentlich lesbar ist.
  async produkte(bericht, sprache = "sq") {
    const gewaehlt = Array.isArray(bericht?.produkte) ? bericht.produkte : [];
    const raus = [];
    for (const eintrag of gewaehlt) {
      const id = typeof eintrag === "string" ? eintrag : eintrag?.id;
      if (!id) continue;
      let stamm = {};
      try {
        const antwort = await this.fetchFn(this.#adresse("products", encodeURIComponent(id)));
        if (antwort.ok) stamm = dokument(await antwort.json());
      } catch { /* ohne Stammdaten bleibt der persoenliche Satz */ }
      raus.push(this.#produkt(id, eintrag, stamm, sprache));
    }
    return raus;
  }

  #produkt(id, eintrag, stamm, sprache) {
    const ausBericht = typeof eintrag === "object" && eintrag ? eintrag : {};
    return {
      id,
      name: stamm.name || id,
      inhalt: stamm.inhalt || "",
      einzelpreis: Number(stamm.einzelpreis) || 0,
      // Nur eingebettete Bilder. Eine fremde Adresse an dieser Stelle
      // waere eine Ladequelle, die niemand geprueft hat.
      foto: typeof stamm.photoRef === "string" && stamm.photoRef.startsWith("data:image") ? stamm.photoRef : "",
      // Der persoenliche Satz zuerst: Den hat Dr. Gashi fuer DIESEN Fall
      // geschrieben. Der Katalogtext ist nur der Rueckfall.
      satz: String(ausBericht.satz || sprachtext(stamm.kurztext, sprache) || "").trim(),
      // Was das Mittel tut.
      //
      // ZUERST DAS, WAS IM BERICHT STEHT: Dr. Gashi hat es fuer diesen
      // Fall gesehen und freigegeben. Erst wenn dort nichts liegt - ein
      // alter Bericht -, kommen die Zeilen aus dem Katalog. Andersherum
      // wuerde eine spaetere Aenderung am Produkt einen Befund
      // umschreiben, der laengst beim Patienten liegt.
      veprimi: (Array.isArray(ausBericht.veprimi) && ausBericht.veprimi.length
        ? ausBericht.veprimi
        : (stamm.veprimi?.[sprache] || stamm.veprimi?.sq || []))
        .map((x) => String(x || "").trim()).filter(Boolean),
      lloji: String(stamm.lloji || "").toLowerCase(),
      nenName: sprachtext(stamm.nenName, sprache),
      // Wirkstoffe, Anwendung und Ziel bleiben am Produkt: Sie sind bei
      // jedem Patienten gleich und aendern sich nicht mit dem Befund.
      perberesit: (Array.isArray(stamm.perberesit) ? stamm.perberesit : [])
        .map((x) => ({
          emri: String(x?.emri || "").trim(),
          sasia: String(x?.sasia || "").trim(),
          roli: sprachtext(x?.roli, sprache)
        }))
        .filter((x) => x.emri),
      perdorimi: stamm.perdorimi ? {
        hapi: Number(stamm.perdorimi.hapi) || 0,
        koha: sprachtext(stamm.perdorimi.koha, sprache),
        sasia: sprachtext(stamm.perdorimi.sasia, sprache),
        si: sprachtext(stamm.perdorimi.si, sprache),
        kujdes: sprachtext(stamm.perdorimi.kujdes, sprache)
      } : null,
      synimi: sprachtext(stamm.synimi, sprache)
    };
  }

  // Was auf dieser Seite geschieht, gehoert in dieselbe Sitzung.
  //
  // Sonst stuende in Heart der Scan und danach nichts mehr: ob der
  // Patient seine Seite ueberhaupt geoeffnet hat, ob er bestellt hat -
  // das sind genau die Zahlen, an denen sich zeigt, ob dieser Weg traegt.
  //
  // Der Fehler wird geschluckt. Eine Zaehlung, die die Seite anhaelt,
  // waere teurer als jede fehlende Zahl.
  merken(daten) {
    if (!this.kennung) return Promise.resolve(undefined);
    const mit = { updatedAt: new Date().toISOString(), ...daten };
    const maske = Object.keys(mit)
      .map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
    return this.fetchFn(this.#adresse("sessions", this.kennung, `?${maske}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: felder(mit) })
    }).catch((fehler) => {
      globalThis.console?.warn?.("[lifeskin] Analyse nicht gezaehlt:", fehler?.message);
      return undefined;
    });
  }

  // Der Zustand im Befund - der Teil, den der Patient selbst sieht, und
  // der einzige, den er selbst aendern darf.
  async zustandSchreiben(werte) {
    if (!this.kennung) return false;
    const maske = Object.keys(werte).map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
    try {
      const antwort = await this.fetchFn(this.#adresse("reports", this.kennung, `?${maske}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: felder(werte) })
      });
      return Boolean(antwort.ok);
    } catch {
      return false;
    }
  }
}
