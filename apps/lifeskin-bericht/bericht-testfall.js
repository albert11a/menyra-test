// Der Testfall der Befundseite.
//
// WOZU: Die Seite unter /analiza/<kennung> gehoert einem echten Patienten
// und laedt seinen Fall aus Firestore. Wer daran etwas ausprobieren will,
// braucht sonst einen echten Fall - oder er probiert an der Seite herum,
// die gerade Werbekunden empfaengt. Beides ist keine gute Idee.
//
// Diese Datei liefert stattdessen einen erfundenen Fall unter einer
// eigenen Adresse. Sie wird NUR auf dieser Adresse geladen (dynamisch,
// erst nachdem der Pfad geprueft wurde) und liegt deshalb nicht im Weg
// des echten Patienten.
//
// DREI RIEGEL, damit hier nichts passiert, was passieren koennte:
//
//   1. Es geht keine Anfrage an Firestore hinaus. Jede Adresse, die dorthin
//      zeigt, wird hier beantwortet.
//   2. Es wird nichts geschrieben. Ein PATCH - Lesemarken, Bestellung,
//      Anschrift - bekommt eine leere Antwort und verlaesst das Geraet nie.
//   3. Es wird nichts gezaehlt. Der Pixel bleibt aus, weil kein Fall
//      existiert, den man zaehlen koennte.
//
// Die Angaben sind erfunden und als solche erkennbar: LS-TEST-0000, und
// der Name ist keiner, der in Kosovo auf einer Rechnung stehen wuerde.

// Firestore verpackt jeden Wert. Was Heart schreibt, muss hier genauso
// ankommen - sonst prueft die Vorschau eine Form, die es nicht gibt.
function fs(x) {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(fs) } };
  if (typeof x === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fs(v)])) } };
  }
  if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  return { stringValue: String(x) };
}

const RAPORT = {
  fotot: 3,
  parametratVleresuar: 10,
  parametratMeGjetje: 8,
  zonat: 11,
  zonatMeNdryshime: 5,
  ekzaminimi: "Lëkura e fytyrës u vlerësua në ballë, hundë, faqe, mjekër dhe vijën e nofullës. "
    + "U kontrolluan skuqja, puçrrat aktive, poret, njollat, ngjyra, sipërfaqja, thatësia, "
    + "shtresa mbrojtëse dhe shenjat e mbetura.",
  gjetjet: "Ndryshimi kryesor është bllokimi i lehtë i poreve, më i dukshëm në ballë, me pak "
    + "acarim aktiv. Në faqe kanë mbetur edhe disa gjurmë të zbehta pas puçrrave të mëparshme.",
  gjetjaKryesore: "poret e bllokuara në ballë",
  gjetjaDyta: "gjurmët e zbehta në faqe",
  zonaLista: [
    { zona: "Balli", teksti: "Sipërfaqja është pak e pabarabartë nga pore të bllokuara dhe kokrriza të vogla nën lëkurë, pa inflamacion të theksuar." },
    { zona: "Hunda", teksti: "Poret janë më të dukshme, por pa shenja të qarta të inflamacionit aktiv." },
    { zona: "Faqet", teksti: "Ka skuqje të lehtë dhe disa njolla të zbehta që kanë mbetur pas puçrrave të mëparshme." },
    { zona: "Mjekra", teksti: "Ka bllokim të lehtë të poreve, pa puçrra të thella dhe pa inflamacion të fortë." },
    { zona: "Vija e nofullës", teksti: "Kanë mbetur disa gjurmë të sheshta nga inflamacionet e mëparshme, pa ndryshime të thella." }
  ],
  parametrat: [
    { emri: "Poret dhe folikulet", thjeshte: "Pore të bllokuara", vlera: "më shumë në ballë", shkalla: 2, grada: "e moderuar" },
    { emri: "Tekstura", thjeshte: "Sipërfaqja e lëkurës", vlera: "pak e pabarabartë", shkalla: 2, grada: "e moderuar" },
    { emri: "Njollat pas inflamacionit", thjeshte: "Gjurmë të mbetura pas puçrrave", vlera: "të lehta në faqe", shkalla: 1, grada: "e lehtë" },
    { emri: "Skuqja", thjeshte: "Skuqje difuze e lëkurës", vlera: "e lehtë në faqe", shkalla: 1, grada: "e lehtë" },
    { emri: "Keratinizimi", thjeshte: "Trashje dhe luspa", vlera: "e lehtë në ballë", shkalla: 1, grada: "e lehtë" },
    { emri: "Barriera e lëkurës", thjeshte: "Shtresa mbrojtëse", vlera: "pa dëmtim, por e ngarkuar", shkalla: 1, grada: "nën ngarkesë" },
    { emri: "Inflamacioni", thjeshte: "Aktiviteti i acarimit", vlera: "shumë i kufizuar", shkalla: 1, grada: "e lehtë" },
    { emri: "Lezionet aktive", thjeshte: "Puçrra aktive tani", vlera: "të pakta dhe të vogla", shkalla: 1, grada: "e lehtë" },
    { emri: "Shenjat e indit", thjeshte: "Gropëza dhe shenja të mbetura", vlera: "pa gropëza të dukshme", shkalla: 0, grada: "pa gjetje" },
    { emri: "Pigmentimi", thjeshte: "Njolla dhe ngjyra e lëkurës", vlera: "ngjyrë e njëtrajtshme", shkalla: 0, grada: "e barabartë" }
  ],
  diagnoza: "Akne e lehtë me pore të bllokuara",
  diagnozaLat: "Acne vulgaris, predominancë komedonale",
  niveli: 2,
  shpjegimi: [
    "Në disa pjesë të fytyrës, sidomos në ballë, poret mbushen më lehtë me yndyrë dhe qeliza të vdekura. Kjo e bën sipërfaqen pak të pabarabartë.",
    "Aktualisht ka pak acarim aktiv. Njollat e zbehta në faqe janë gjurmë të puçrrave të qetësuara më herët, jo puçrra të reja."
  ],
  paKujdes: {
    zbehet: "Skuqja e lehtë dhe gjurmët e freskëta mund të zbehen gradualisht pasi acarimi të qetësohet.",
    nukZbehet: "Poret që vazhdojnë të bllokohen e mbajnë sipërfaqen të pabarabartë, ndërsa njollat më të errëta zbehen shumë ngadalë.",
    pas6Muajsh: "Nëse modeli vazhdon, priten sërish periudha me pore të bllokuara dhe puçrra të vogla, ndërsa gjurmët e vjetra zbehen ngadalë."
  }
};

const PRODUKTE = {
  "lf-acne": {
    fields: {
      name: { stringValue: "LF ACNE" },
      inhalt: { stringValue: "30 ml" },
      einzelpreis: { integerValue: "33" },
      lloji: { stringValue: "gel" },
      nenName: fs({ sq: "Gel për lëkurë me akne", de: "Gel für Aknehaut" }),
      veprimi: fs({
        sq: [
          "Hap folikulin e bllokuar dhe largon qelizat e vdekura nga sipërfaqja",
          "Ul bakterin që ushqen inflamacionin në poret e bllokuara",
          "Qetëson skuqjen pa e tharë barrierën mbrojtëse të lëkurës"
        ],
        de: []
      }),
      perberesit: fs([
        { emri: "Acid salicilik", sasia: "2%", roli: { sq: "Pastron brendinë e porit", de: "" } },
        { emri: "Niacinamid", sasia: "4%", roli: { sq: "Ul skuqjen dhe yndyrën", de: "" } },
        { emri: "Zink PCA", sasia: "1%", roli: { sq: "Qetëson sipërfaqen", de: "" } }
      ]),
      perdorimi: fs({
        hapi: 1,
        koha: { sq: "vetëm në mbrëmje", de: "" },
        sasia: { sq: "sa një bizele", de: "" },
        si: { sq: "Pas larjes, në lëkurë të thatë. Shpërndajeni në ballë, hundë dhe mjekër dhe lëreni të thahet para hapit tjetër.", de: "" },
        kujdes: { sq: "Mos e përdorni në të njëjtin moment me acide të tjera ose retinol.", de: "" }
      }),
      synimi: fs({ sq: "Sipërfaqja në ballë bëhet më e njëtrajtshme dhe puçrrat e vogla dalin më rrallë.", de: "" })
    }
  },
  "lf-barrier": {
    fields: {
      name: { stringValue: "LF BARRIER REPAIR CREAM" },
      inhalt: { stringValue: "50 ml" },
      einzelpreis: { integerValue: "29" },
      lloji: { stringValue: "krem" },
      veprimi: fs({
        sq: [
          "Rikthen shtresën mbrojtëse që trajtimi kundër akneve e ngarkon çdo natë",
          "Mban ujin në lëkurë dhe zvogëlon tharjen e pritshme në javët e para"
        ],
        de: []
      }),
      perdorimi: fs({
        hapi: 2,
        koha: { sq: "mëngjes dhe mbrëmje", de: "" },
        sasia: { sq: "një shtresë e hollë", de: "" },
        si: { sq: "Pas gelit, kur ai është tharë plotësisht.", de: "" },
        kujdes: { sq: "", de: "" }
      })
    }
  }
};

// Der Fall selbst. Die Kennung sagt, was er ist.
const FALL = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    freigabeAt: { stringValue: "2026-09-06T08:20:00.000Z" },
    code: { stringValue: "LS-TEST-0000" },
    name: { stringValue: "Ajshe" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    preis: { integerValue: "53" },
    befund: { stringValue: RAPORT.gjetjet },
    raport: fs(RAPORT),
    produkte: {
      arrayValue: {
        values: [
          { mapValue: { fields: { id: { stringValue: "lf-acne" },
            satz: { stringValue: "Te ju, poret e bllokuara në ballë janë gjetja më e fortë. Ky gel punon pikërisht aty, çdo mbrëmje." } } } },
          { mapValue: { fields: { id: { stringValue: "lf-barrier" },
            satz: { stringValue: "Sepse gjatë 28 ditëve lëkura juaj do të ngarkohet nga trajtimi, kjo kremë mban shtresën mbrojtëse në rregull." } } } }
        ]
      }
    }
  }
};

function antwort(koerper) {
  return new Response(JSON.stringify(koerper), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

// Der Ersatz fuer fetch. Er geht nie ins Netz - weder lesend noch
// schreibend.
export function testFetch(adresse, wahl) {
  const text = String(adresse && adresse.url ? adresse.url : adresse);
  if (wahl && wahl.method && wahl.method !== "GET") return Promise.resolve(antwort({}));
  const treffer = text.match(/\/products\/([^?/]+)/);
  if (treffer) return Promise.resolve(antwort(PRODUKTE[decodeURIComponent(treffer[1])] || { fields: {} }));
  return Promise.resolve(antwort(FALL));
}
