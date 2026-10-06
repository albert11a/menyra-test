// DIE ANTWORTEN AUS DEM TRICHTER AUF DER THERAPIESEITE.
//
// Nach Scan und Foto stellt der Trichter vier Fragen (FRAGEN_NACH_AUFNAHME
// in apps/lifeskin/lifeskin-content.js): was stoert, seit wann, was schon
// probiert wurde und ob Dr. Gashi auch die Therapie vorbereiten soll (im
// Laden seit dem 29.09. nur die ersten drei - ohne die letzte Antwort bleibt
// ihr Satz weg, bereitSatz). Die Antworten liegen in der Sitzung - und die liest nur das CEO-Konto.
//
// Heart legt beim Freigeben eine KLEINE, GEPRUEFTE Abschrift in den
// Bericht (bericht.antworten), und die Therapieseite spiegelt sie zurueck:
// "Ju na thatë …". Wer seine eigenen Worte liest, liest keine Werbung,
// sondern seinen Fall - und wer selbst "Po, dua ta filloj" getippt hat,
// hoert beim Kaufknopf genau diesen Satz wieder.
//
// WAS NIE IN DEN BERICHT GEHT. Der Bericht ist oeffentlich lesbar (wer die
// Kennung hat). Deshalb nur Kennungen aus der Liste unten - kein Freitext,
// und keine Gesundheitsangabe: Schwangerschaft, Isotretinoin, aerztliche
// Behandlung ("mjek") bleiben in der Sitzung.
//
// DIE TEXTE STEHEN HIER NOCH EINMAL, weil shared/ nichts aus apps/ laden
// darf. tests/lifeskin-kaufbereit.test.mjs haelt sie mit dem Trichter
// zusammen: Aendert sich dort eine Antwort, faellt es hier auf.

export const ANTWORTEN_OEFFENTLICH = Object.freeze({
  anliegen: Object.freeze({
    pucrrat: "Aknet",
    poret: "Poret e mëdha",
    shkelqimi: "Shkëlqimi",
    njollat: "Njollat e errëta",
    skuqja: "Skuqja edhe ndjeshmëria",
    thate: "Lëkura e thatë",
    rrudhat: "Rrudhat edhe elasticiteti"
  }),
  kohezgjatja: Object.freeze({
    jave: "Prej disa javësh",
    muaj: "Prej disa muajsh",
    vit: "Prej mbi një viti",
    vjenShkon: "Vjen e shkon"
  }),
  perdorimi: Object.freeze({
    farmaci: "Kremë nga barnatorja",
    rrjete: "Produkte nga Instagrami ose TikToku",
    larje: "Vetëm sapun ose xhel larës",
    shume: "Shumë produkte, pa rezultat",
    asgje: "Asgjë deri tash"
  }),
  gatishmeria: Object.freeze({
    tani: "Po, dua ta filloj sa më shpejt",
    pasi: "Po, kur ta shoh çka më duhet",
    analiza: "Së pari dua vetëm analizën"
  })
});

const MEHRFACH = new Set(["anliegen", "perdorimi"]);

// Aus der Anamnese der Sitzung (Heart) oder aus dem Bericht (Seite): nur
// bekannte Kennungen, hoechstens zwei je Mehrfachfrage. Nichts
// Brauchbares: null - dann steht auf der Seite auch nichts.
export function antwortenLesen(roh) {
  if (!roh || typeof roh !== "object" || Array.isArray(roh)) return null;
  const raus = {};
  for (const [frage, erlaubt] of Object.entries(ANTWORTEN_OEFFENTLICH)) {
    const werte = (Array.isArray(roh[frage]) ? roh[frage] : [roh[frage]])
      .map((x) => String(x ?? "").trim())
      .filter((x) => Object.hasOwn(erlaubt, x));
    const einzeln = [...new Set(werte)];
    if (!einzeln.length) continue;
    raus[frage] = MEHRFACH.has(frage) ? einzeln.slice(0, 2) : einzeln[0];
  }
  return Object.keys(raus).length ? raus : null;
}

// Heart beim Freigeben: dieselbe Pruefung, derselbe Name.
export const antwortenFuerBericht = antwortenLesen;

// WAS ZUERST ZAEHLT, wenn zwei Dinge probiert wurden: das, was am
// deutlichsten "hat nicht geholfen" sagt.
const PERDORIMI_RANG = ["shume", "rrjete", "farmaci", "larje", "asgje"];

// Die Antwort auf "hab ich schon alles probiert". Ehrlich und ohne neue
// Wirkversprechen: Sie sagt, was an DIESER Therapie anders ist (gewaehlt
// fuer ihn, ein Plan fuer 4 Wochen), nicht, dass sie wirkt.
function perdorimiSatz(id, ohneFoto) {
  const sipas = ohneFoto ? "sipas përshkrimit tuaj" : "sipas fotove tuaja";
  switch (id) {
    case "shume":
      return "Shumë produkte pa plan e lodhin lëkurën. Këtu merrni vetëm atë që ju duhet, me radhë të qartë për 4 javë.";
    case "rrjete":
      return `Produktet nga rrjetet zgjidhen sipas reklamës. Këto i zgjodhi Dr. Gashi ${sipas}.`;
    case "farmaci":
      return `Kremi nga barnatorja është bërë për të gjithë. Kjo terapi u zgjodh vetëm për ju, ${sipas}.`;
    case "larje":
      return "Larja e pastron sipërfaqen. Këtu çdo produkt ka një detyrë të qartë te ju – dhe një plan për 4 javë.";
    case "asgje":
      return "Nuk keni humbur kohë me produkte të gabuara – filloni direkt me atë që ju duhet.";
    default:
      return "";
  }
}

// Der Satz beim Kaufknopf - sein eigenes Wort, zurueckgegeben.
function bereitSatz(id) {
  switch (id) {
    case "tani":
      return "Ju na thatë se doni të filloni sa më shpejt. Terapia juaj është gati – porosia zgjat një minutë.";
    case "pasi":
      return "Ju na thatë: „Po, kur ta shoh çka më duhet.“ Ja ku është – e zgjodhi Dr. Gashi për ju.";
    case "analiza":
      return "Analiza juaj e plotë është më poshtë. Terapia mbetet gati këtu, kur të vendosni.";
    default:
      return "";
  }
}

// ALLES, WAS DIE SEITE ZEIGT, AUS EINER STELLE.
//
//   zeilen   die Karte "Çfarë na thatë": [{ marke, text }]
//   satz     die Antwort auf das, was schon probiert wurde
//   bereit   der Satz beim Kaufknopf
//   heiss    true, wenn er selbst "so bald wie moeglich" gesagt hat
export function antwortenSpiegel(roh, { ohneFoto = false } = {}) {
  const a = antwortenLesen(roh);
  if (!a) return null;
  const T = ANTWORTEN_OEFFENTLICH;
  const zeilen = [];
  if (a.anliegen) zeilen.push({ marke: "Ju shqetëson", text: a.anliegen.map((x) => T.anliegen[x]).join(" · ") });
  if (a.kohezgjatja) zeilen.push({ marke: "Që kur", text: T.kohezgjatja[a.kohezgjatja] });
  if (a.perdorimi) zeilen.push({ marke: "Keni provuar", text: a.perdorimi.map((x) => T.perdorimi[x]).join(" · ") });
  const zuerst = PERDORIMI_RANG.find((id) => a.perdorimi?.includes(id));
  return {
    zeilen,
    satz: zuerst ? perdorimiSatz(zuerst, ohneFoto) : "",
    bereit: bereitSatz(a.gatishmeria),
    heiss: a.gatishmeria === "tani"
  };
}
