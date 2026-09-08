// Die Bruecke von seinem Befund zu diesem Mittel.
//
// Die Seite bewies ein Problem in aller Ausfuehrlichkeit und zeigte dann
// eine Flasche. Dazwischen fehlte der Satz, den jeder Skeptiker als Erstes
// denkt: "Gut - und warum hilft ausgerechnet DAS?" Ohne ihn kauft nur, wer
// ohnehin kaufen wollte.
//
// Hier entsteht dieser Satz. Nicht aus einem Sprachmodell - das erfindet
// frueher oder spaeter eine Wirkung, die im Tiegel nicht drin ist, und bei
// einem Mittel mit Benzoylperoxid ist das keine Kleinigkeit. Sondern aus
// drei sauber getrennten Rollen:
//
//   Die Analyse   sagt, was mit der Haut ist.   Nie ein Produkt.
//   Der Katalog   sagt, was das Mittel tut.     Einmal je Produkt, von
//                                               Dr. Gashi verantwortet.
//   Dieses Modul  verbindet beides.             Sofort, kostenlos, immer
//                                               gleich.
//
// Das Ergebnis ist trotzdem patientengenau: Bei einem steht "Puqrrat aktive
// te ju jane te theksuara", beim naechsten "Poret te ju jane te moderuara" -
// weil die Regel die echten Werte SEINER Analyse einsetzt. Aber die
// Behauptung ueber das Produkt stammt immer aus dem Katalog.
//
// Reines Rechnen: kein DOM, kein Firestore. Heart und die Patientenseite
// teilen es sich, damit die Begruendung an beiden Stellen dieselbe ist.

// ---------- Die Zeichen ----------
//
// Ein Produktfoto fehlt am Anfang immer, und ein leerer Rahmen sieht nach
// Panne aus. Ein Zeichen, das die Art des Mittels trifft, sieht nach Pflege
// aus - und steht spaeter neben dem Namen weiter, auch wenn das Foto da ist.
//
// Derselbe Strich wie die uebrigen Zeichen der Seite: 24 Bildpunkte,
// currentColor, Staerke 1.8. Ein Zeichen, das aus der Reihe faellt, sieht
// nach eingekauftem Symbolsatz aus.
const Z = (inhalt) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;

export const PRODUKT_IKONA = Object.freeze({
  // Tube: schmaler Koerper, gefalzter Kopf, Deckel.
  gel: Z('<path d="M10.4 3h3.2v2h-3.2z"/><path d="M9.2 8l.5-3h4.6l.5 3"/><path d="M8.8 8h6.4l-.6 11.3A1.9 1.9 0 0 1 12.7 21h-1.4a1.9 1.9 0 0 1-1.9-1.7z"/>'),
  // Tiegel: breit, flach, mit Deckelkante.
  krem: Z('<rect x="5" y="9.4" width="14" height="11.1" rx="2.4"/><path d="M7.2 9.4V7.6A1.6 1.6 0 0 1 8.8 6h6.4a1.6 1.6 0 0 1 1.6 1.6v1.8"/><path d="M5 13h14"/>'),
  // Pipettenflasche: Koerper, Hals, Pipettenkopf.
  serum: Z('<rect x="7.6" y="10" width="8.8" height="11" rx="2"/><path d="M10 10V7.2h4V10"/><rect x="9.7" y="3" width="4.6" height="4.2" rx="1.3"/>'),
  // Pumpspender: hoher Koerper, Hals, Pumpenarm.
  pastrues: Z('<rect x="7" y="9.2" width="10" height="11.8" rx="2"/><path d="M10.6 9.2V5.6h2.8v3.6"/><path d="M13.4 6.4h2.8v2.2"/>'),
  // Flasche mit Schulter - auch der Rueckfall fuer eine unbekannte Art.
  tonik: Z('<path d="M9.5 2.6h5v3.4l2 3.2V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V9.2l2-3.2z"/><path d="M7.5 13h9"/>')
});

export function ikoneFuer(lloji) {
  return PRODUKT_IKONA[String(lloji || "").toLowerCase()] || PRODUKT_IKONA.tonik;
}

// ---------- Platzhalter ----------
//
// Ein fehlender Wert darf keine Luecke hinterlassen und erst recht keine
// leere Klammer. "Poret te ju jane te moderuara ()" ist schlimmer als gar
// kein Klammerzusatz - es sieht nach kaputter Software aus, und zwar auf
// einem Befund.
//
// Deshalb zwei Durchgaenge: erst faellt jede Klammer, in der ein leerer
// Platzhalter steckt, im Ganzen weg; dann erst wird ersetzt.
const PLATZHALTER = /\{([a-zA-Z0-9_]+)\}/g;

export function fuellePlatzhalter(text, werte = {}) {
  let s = String(text || "");
  if (!s) return "";

  const leer = (name) => !String(werte[name] ?? "").trim();

  // Klammerausdruecke mit leerem Platzhalter fallen samt Klammer weg.
  s = s.replace(/\s*\(([^()]*)\)/g, (ganz, drin) => {
    const namen = [...String(drin).matchAll(PLATZHALTER)].map((t) => t[1]);
    return namen.length && namen.some(leer) ? "" : ganz;
  });

  s = s.replace(PLATZHALTER, (_, name) => String(werte[name] ?? "").trim());

  // Was nach dem Herausfallen an Leerraum und Zeichensetzung uebrig bleibt.
  //
  // Der haeufigste Fall ist ein Patient ohne Namen: "{emri}, kjo terapi."
  // wird sonst zu ", kjo terapi." - ein Satz, der mit einem Komma anfaengt.
  return s
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,;:])\s*([.!?])/g, "$2")
    .replace(/^[\s,;:.\u2014-]+/, "")
    .trim();
}

// ---------- Trifft eine Regel? ----------
//
// Die Bedingungen sind UND-verknuepft, und eine leere Bedingung trifft
// immer. Das ist kein Nebeneffekt, sondern der Zweck: Die letzte Regel
// jedes Produkts hat ein leeres "kur", und deshalb kann der Abschnitt nie
// leer bleiben. Genau daran ist er bisher gescheitert - stand am Produkt
// keine Wirkungszeile, verschwand er ganz, und der Patient sah nach einer
// ausfuehrlichen Diagnose eine Flasche ohne Begruendung.
function alsListe(wert) {
  if (Array.isArray(wert)) return wert.map((x) => String(x).trim().toLowerCase()).filter(Boolean);
  const eins = String(wert ?? "").trim().toLowerCase();
  return eins ? [eins] : [];
}

function trifft(kur, lage) {
  const b = kur && typeof kur === "object" ? kur : {};

  if ("diagnoza" in b) {
    const erlaubt = alsListe(b.diagnoza);
    if (erlaubt.length && !erlaubt.includes(lage.diagnozaId)) return null;
  }

  if ("niveli" in b) {
    const noetig = Number(b.niveli);
    if (Number.isFinite(noetig) && !(Number(lage.niveli) >= noetig)) return null;
  }

  if ("partner" in b && Boolean(b.partner) !== Boolean(lage.partner)) return null;

  // Der getroffene Parameter wird zurueckgegeben, nicht nur "ja".
  //
  // "{grada}" und "{vlera}" muessen aus DEM Parameter kommen, den die Regel
  // genannt hat - nicht aus dem staerksten. Sonst steht unter einer Regel
  // ueber die Barriere der Wert der Poren, und der Satz ist zwar
  // persoenlich, aber falsch.
  let getroffen = null;
  if ("parametri" in b) {
    const id = String(b.parametri || "").trim().toLowerCase();
    const wert = lage.parameter.get(id);
    const ab = Number.isFinite(Number(b.nga)) ? Number(b.nga) : 1;
    if (!wert || Number(wert.shkalla) < ab) return null;
    getroffen = wert;
  }

  return { getroffen };
}

// ---------- Der Partner ----------
//
// Das Mittel, das WIRKT - und auf das sich die uebrigen beziehen duerfen.
// Ohne es faellt jede Regel mit "partner": true aus, und der Satz zum
// zweiten Produkt spricht nicht von einem ersten, das gar nicht verkauft
// wird. Das ist der ganze Grund fuer die Bedingung: Ob ein Set oder ein
// einzelnes Mittel verkauft wird, entscheidet der Haken in Heart, nicht
// dieses Modul.
//
// Nie es selbst: Sind zwei wirkende Mittel gewaehlt, verweist jedes auf das
// andere.
function partnerFuer(produkt, alle) {
  const andere = alle.filter((p) => p !== produkt && String(p.roli || "").toLowerCase() === "baze");
  return andere.length ? String(andere[0].name || andere[0].id || "").trim() : "";
}

// ---------- Die Begruendung bauen ----------

function sprachwert(knoten, sprache) {
  if (!knoten) return "";
  if (typeof knoten === "string") return knoten;
  return String(knoten[sprache] ?? knoten.sq ?? knoten.de ?? "").trim();
}

function sprachliste(knoten, sprache) {
  if (!knoten) return [];
  const roh = Array.isArray(knoten) ? knoten : (knoten[sprache] ?? knoten.sq ?? knoten.de ?? []);
  return (Array.isArray(roh) ? roh : [])
    .map((x) => String(x || "").trim())
    .filter(Boolean);
}

export function baueTerapi({ raport = {}, produkte = [], patient = {}, sprache = "sq" } = {}) {
  const liste = (Array.isArray(produkte) ? produkte : []).filter(Boolean);
  if (!liste.length) return [];

  const parameter = new Map();
  for (const w of raport.parametrat || []) {
    const id = String(w?.id || "").trim().toLowerCase();
    if (id) parameter.set(id, w);
  }

  // Der staerkste Befund als Rueckfall fuer "{gjetja}".
  //
  // Steht in der Analyse keine Nominalphrase - eine alte Analyse, ein von
  // Hand ausgefuellter Bogen -, tut es der kleingeschriebene Parametername.
  // Er liest sich hoelzerner, aber ein hoelzerner Satz ist besser als ein
  // Satz mit einem Loch darin.
  const klein = (x) => String(x || "").toLocaleLowerCase(sprache === "de" ? "de" : "sq");
  const stark = (raport.parametrat || []).filter((w) => w && w.emri && Number(w.shkalla) > 0);
  const gjetja = String(raport.gjetjaKryesore || "").trim() || klein(stark[0]?.emri || "");
  const gjetja2 = String(raport.gjetjaDyta || "").trim() || klein(stark[1]?.emri || "");

  const zonaMitBefund = (raport.zonaLista || []).find((z) => z && z.zona);

  return liste.map((produkt) => {
    const partner = partnerFuer(produkt, liste);
    const lage = {
      diagnozaId: String(raport.diagnozaId || "").trim().toLowerCase(),
      niveli: Number.isFinite(Number(raport.niveli)) ? Number(raport.niveli) : -1,
      parameter,
      partner
    };

    // Die ERSTE Regel, die passt - nicht die beste.
    //
    // Reihenfolge ist Rangfolge, und die Rangfolge gehoert Dr. Gashi. Ein
    // Punktesystem waere klueger und nicht nachvollziehbar; sie soll eine
    // Regel nach oben schieben koennen und wissen, dass sie dann gilt.
    const regeln = Array.isArray(produkt.lidhja) ? produkt.lidhja : [];
    let satz = "";
    let regulli = null;
    let getroffen = null;

    for (let i = 0; i < regeln.length; i += 1) {
      const treffer = trifft(regeln[i]?.kur, lage);
      if (!treffer) continue;
      const text = sprachwert(regeln[i]?.teksti, sprache);
      if (!text) continue;
      satz = text;
      regulli = i + 1;
      getroffen = treffer.getroffen;
      break;
    }

    // Ohne Regel die Kette aus den Stammdaten. Leer bleibt es nie.
    if (!satz) satz = sprachwert(produkt.persoenlich, sprache)
      || sprachwert(produkt.kurztext, sprache)
      || sprachwert(produkt.beschreibung, sprache);

    const werte = {
      emri: String(patient.emri || "").trim(),
      mosha: String(patient.mosha || "").trim(),
      gjetja,
      gjetja2,
      diagnoza: klein(raport.diagnoza || ""),
      grada: String(getroffen?.grada || "").trim(),
      vlera: String(getroffen?.vlera || "").trim(),
      zona: klein(zonaMitBefund?.zona || ""),
      partner
    };

    return {
      id: String(produkt.id || ""),
      name: String(produkt.name || produkt.id || ""),
      nenName: sprachwert(produkt.nenName, sprache),
      inhalt: String(produkt.inhalt || ""),
      lloji: String(produkt.lloji || "").toLowerCase(),
      roli: String(produkt.roli || "").toLowerCase(),
      ikona: ikoneFuer(produkt.lloji),
      arsyeja: fuellePlatzhalter(satz, werte),
      regulli,
      veprimi: sprachliste(produkt.veprimi, sprache).slice(0, 3),
      perberesit: (Array.isArray(produkt.perberesit) ? produkt.perberesit : [])
        .map((p) => ({
          emri: String(p?.emri || "").trim(),
          sasia: String(p?.sasia || "").trim(),
          roli: sprachwert(p?.roli, sprache)
        }))
        .filter((p) => p.emri),
      perdorimi: produkt.perdorimi
        ? {
            hapi: Number(produkt.perdorimi.hapi) || 0,
            koha: sprachwert(produkt.perdorimi.koha, sprache),
            sasia: sprachwert(produkt.perdorimi.sasia, sprache),
            si: sprachwert(produkt.perdorimi.si, sprache),
            kujdes: sprachwert(produkt.perdorimi.kujdes, sprache)
          }
        : null,
      synimi: sprachwert(produkt.synimi, sprache),
      einzelpreis: Number(produkt.einzelpreis) || 0
    };
  })
    // In der Reihenfolge der Anwendung, nicht des Katalogs. Wer morgens
    // reinigt und danach behandelt, liest es auch so.
    .sort((a, b) => (a.perdorimi?.hapi || 99) - (b.perdorimi?.hapi || 99)
      || String(a.name).localeCompare(String(b.name)));
}
