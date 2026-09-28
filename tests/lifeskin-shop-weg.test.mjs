// DER WEG DURCH DEN LADEN (/lifeskinshop) - von der Kontrolle bis zur Zahl.
//
// Siehe docs/lifeskin-shop-perputhja.md. Diese Pruefungen halten fest:
//   - Der Trichter spricht im Laden in eigenen Worten, ohne "Analyse".
//   - Die Tipps waehrend der Fragen kennen genau die vier Fragen.
//   - Die Stilblaetter des Ladens greifen nur im Laden.
//   - Die Përputhja setzt Dr. Gashi in Heart; die Software prueft sie nur.
//   - Die Therapieseite zeigt ihre Zahl, und das Teilen verschickt nie den
//     eigenen Link.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

globalThis.__LIFESKIN_TEST__ = true;

const lies = (p) => readFileSync(p, "utf8");

const { OBERFLAECHE, OBERFLAECHE_WEGE, FRAGEN_TEXTE, FRAGEN_TEXTE_WEGE, FRAGEN_NACH_AUFNAHME, frageFuerWeg, t } =
  await import("../apps/lifeskin/lifeskin-content.js");
const { TEXTE, TEXTE_WEGE } = await import("../apps/lifeskin-astra/astra-texte.js");
const { FRAGE_TIPPS, frageAus, tippZeigen } = await import("../apps/lifeskin-shop/weg.js");
const { perputhjaGueltig, perputhjaStufe } = await import("../shared/lifeskin-perputhja.js");

// ---------- Die Worte ----------

test("der Laden spricht in eigenen Worten - und nur mit Schluesseln, die es gibt", () => {
  for (const k of Object.keys(OBERFLAECHE_WEGE.lifeskinshop)) assert.ok(OBERFLAECHE[k], `${k} gibt es in OBERFLAECHE nicht`);
  for (const k of Object.keys(FRAGEN_TEXTE_WEGE.lifeskinshop)) assert.ok(FRAGEN_TEXTE[k], `${k} gibt es in FRAGEN_TEXTE nicht`);
  for (const k of Object.keys(TEXTE_WEGE.lifeskinshop)) assert.ok(TEXTE[k], `${k} gibt es in TEXTE nicht`);
  // Er hat nie eine Analyse versprochen: Keiner seiner Saetze sagt es.
  const saetze = [
    ...Object.values(OBERFLAECHE_WEGE.lifeskinshop),
    ...Object.values(FRAGEN_TEXTE_WEGE.lifeskinshop),
    ...Object.values(TEXTE_WEGE.lifeskinshop)
  ].map((e) => t(e, "sq"));
  for (const satz of saetze) assert.doesNotMatch(satz, /analiz/i, satz);
  assert.match(t(OBERFLAECHE_WEGE.lifeskinshop.telKnopf, "sq"), /përqindjen/);
  assert.match(t(TEXTE_WEGE.lifeskinshop.pritWarum, "sq"), /vetë Dr\. Gashi/);
});

test("die Bereitschaftsfrage im Laden fragt nach der Zahl, nicht nach der Analyse", () => {
  const frage = FRAGEN_NACH_AUFNAHME.find((f) => f.id === "gatishmeria");
  const shop = frageFuerWeg(frage, "lifeskinshop");
  assert.deepEqual(shop.antworten.map((a) => a.id), frage.antworten.map((a) => a.id),
    "Die Kennungen der Antworten muessen dieselben bleiben - Heart und der Bericht lesen sie");
  assert.match(t(shop.titel, "sq"), /përputhja/);
  for (const a of shop.antworten) assert.doesNotMatch(t(a.text, "sq"), /analiz/i);
  // Die anderen Wege bleiben, wie sie waren.
  assert.equal(frageFuerWeg(frage, ""), frage);
});

// ---------- Die Tipps ----------

test("jede der vier Fragen hat ihren Tipp - erkannt an einer Antwort, die es nur bei ihr gibt", () => {
  const ids = FRAGEN_NACH_AUFNAHME.map((f) => f.id);
  assert.deepEqual(Object.keys(FRAGE_TIPPS).sort(), [...ids].sort());
  for (const frage of FRAGEN_NACH_AUFNAHME) {
    const kennungen = frage.antworten.map((a) => a.id);
    assert.equal(frageAus(kennungen), frage.id, `${frage.id} wird nicht erkannt`);
  }
  assert.equal(frageAus(["gibtsnicht"]), "");
  assert.equal(frageAus([]), "");
  // Ein Tipp ist Wissen, kein Versprechen.
  for (const tipp of Object.values(FRAGE_TIPPS)) {
    assert.doesNotMatch(`${tipp.fett} ${tipp.text}`, /garant|100 ?%|shërim|zhduk/i);
  }
});

function falschesDokument() {
  const knoten = {};
  const neu = (id) => ({
    id, hidden: false, textContent: "", dataset: {}, style: {}, offsetWidth: 1, kinder: [],
    replaceChildren(...k) { this.kinder = k; this.textContent = k.map((x) => (typeof x === "string" ? x : x.textContent)).join(""); },
    querySelectorAll() { return (this.knoepfe || []).map((a) => ({ getAttribute: () => a })); }
  });
  for (const id of ["ls-fragetipp", "ls-fragewahl", "ls-fragetippmarke", "ls-fragetipptext"]) knoten[id] = neu(id);
  knoten["ls-fragetipp"].hidden = true;
  return {
    knoten,
    getElementById: (id) => knoten[id] || null,
    createElement: () => ({ textContent: "" })
  };
}

test("der Tipp steht unter der Frage, die gerade dran ist - und verschwindet bei Name und Nummer", () => {
  const dok = falschesDokument();
  const wahl = dok.knoten["ls-fragewahl"];
  const karte = dok.knoten["ls-fragetipp"];
  wahl.knoepfe = FRAGEN_NACH_AUFNAHME.find((f) => f.id === "kohezgjatja").antworten.map((a) => a.id);
  assert.equal(tippZeigen(dok), "kohezgjatja");
  assert.equal(karte.hidden, false);
  assert.equal(dok.knoten["ls-fragetippmarke"].textContent, FRAGE_TIPPS.kohezgjatja.marke);
  assert.match(dok.knoten["ls-fragetipptext"].textContent, /Jepini kohë lëkurës\./);
  // Getippte Frage (Name, Nummer): Die Knoepfe sind weg, die Karte auch.
  wahl.hidden = true;
  assert.equal(tippZeigen(dok), "");
  assert.equal(karte.hidden, true);
});

test("die Tipps haengen am Laden und aendern nichts am Trichter", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  assert.match(html, /<script type="module" src="\/apps\/lifeskin-shop\/weg\.js"><\/script>/);
  assert.match(html, /<aside class="weg-tipp" id="ls-fragetipp" hidden>/);
  const weg = lies("apps/lifeskin-shop/weg.js");
  assert.doesNotMatch(weg, /^import /m, "weg.js holt sich etwas aus dem Trichter");
  assert.doesNotMatch(weg, /pixel|fbq|sitzung|schritt\(/i, "Die Tipps zaehlen oder melden etwas");
  // /lifeskin und /lifeskin2 laden weder die Tipps noch das Kleid.
  for (const seite of ["apps/lifeskin-landing/index.html", "apps/lifeskin-2/index.html"]) {
    const andere = lies(seite);
    assert.ok(!andere.includes("lifeskin-shop/weg.js") && !andere.includes("shop-weg.css"), seite);
  }
});

// ---------- Die Stilblaetter greifen nur im Laden ----------

// Die Koepfe aller Regeln - auch in @media, ohne @keyframes.
function regelKoepfe(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const koepfe = [];
  let kopf = "";
  for (let i = 0; i < text.length; i += 1) {
    const z = text[i];
    if (z === "{") {
      const k = kopf.trim();
      kopf = "";
      if (/^@(media|supports)/.test(k)) continue;
      let tiefe = 1;
      for (i += 1; i < text.length && tiefe; i += 1) {
        if (text[i] === "{") tiefe += 1;
        else if (text[i] === "}") tiefe -= 1;
      }
      i -= 1;
      if (!k.startsWith("@")) koepfe.push(k);
    } else if (z === "}" || z === ";") {
      kopf = "";
    } else {
      kopf += z;
    }
  }
  return koepfe;
}

function teile(liste) {
  const raus = [];
  let tiefe = 0;
  let jetzt = "";
  for (const z of liste) {
    if (z === "(") tiefe += 1;
    if (z === ")") tiefe -= 1;
    if (z === "," && !tiefe) { raus.push(jetzt.trim()); jetzt = ""; } else jetzt += z;
  }
  if (jetzt.trim()) raus.push(jetzt.trim());
  return raus;
}

for (const [datei, wurzel] of [
  ["apps/lifeskin-shop/shop-weg.css", 'html[data-ls-landing="lifeskinshop"]'],
  ["apps/lifeskin-verkauf/terapia-shop.css", 'html[data-weg="lifeskinshop"]'],
  ["apps/lifeskin-astra/astra-shop.css", 'html[data-weg="lifeskinshop"]']
]) {
  test(`${datei} greift nur im Laden`, () => {
    const koepfe = regelKoepfe(lies(datei));
    assert.ok(koepfe.length > 3, "keine Regeln gefunden");
    for (const s of koepfe.flatMap(teile)) assert.ok(s.startsWith(wurzel), `ungebunden: ${s}`);
  });
}

test("die Warteseite behaelt ihre Warnfarbe", () => {
  const css = lies("apps/lifeskin-astra/astra-shop.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(css, /--orange/, "Die Sperre verloere ihre Warnfarbe");
});

// ---------- Die Përputhja: Dr. Gashi setzt sie, die Software prueft nur ----------

test("perputhjaGueltig nimmt nur eine Zahl von 1 bis 100 - und veraendert sie nicht", () => {
  assert.equal(perputhjaGueltig(92), 92);
  assert.equal(perputhjaGueltig("92"), 92);
  assert.equal(perputhjaGueltig("92%"), 92);
  assert.equal(perputhjaGueltig("87,6"), 88);
  assert.equal(perputhjaGueltig(1), 1);
  assert.equal(perputhjaGueltig(100), 100);
  for (const falsch of [0, 101, -3, "", null, undefined, "abc", NaN, {}]) assert.equal(perputhjaGueltig(falsch), null, String(falsch));
  assert.equal(perputhjaStufe(92), "larte");
  assert.equal(perputhjaStufe(85), "larte");
  assert.equal(perputhjaStufe(84), "mire");
  assert.equal(perputhjaStufe(65), "mire");
  assert.equal(perputhjaStufe(64), "pjesshme");
  assert.equal(perputhjaStufe(null), "");
});

test("keine Rechnung: Die Zahl kommt aus Heart, nirgends wird sie errechnet", () => {
  const modul = lies("shared/lifeskin-perputhja.js").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(modul, /import |antworten|anamnese|metrics|parametrat|gewicht/i,
    "Die Përputhja wird aus Daten errechnet - sie gehoert Dr. Gashi");
  assert.doesNotMatch(lies("apps/lifeskin/lifeskin-app.js"), /perputhja/i, "Der Trichter setzt eine Zahl");
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /perputhjaGueltig\(perputhjaFeld\.value\)/, "Heart liest die Zahl nicht aus dem Feld");
});

test("Heart: das Feld steht nur bei Faellen aus dem Laden, mit dem gemerkten Wert", async () => {
  const speicher = new Map();
  globalThis.localStorage = {
    getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
    setItem: (k, v) => speicher.set(k, String(v)),
    removeItem: (k) => speicher.delete(k)
  };
  const { renderSitzungDetail } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const { normalisiere } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { STANDARD_PRODUKTE } = await import("../apps/lifeskin/lifeskin-catalog.js");
  const { entwurfSchreiben, entwurfLesen, entwurfLoeschen } = await import("../apps/mnyra-heart/heart-lifeskin-entwurf.js");
  const shop = normalisiere("shop1", { createdAt: "2026-09-28T09:00:00.000Z", step: "done", name: "Arta", source: { weg: "lifeskinshop" } });
  const alt = normalisiere("alt1", { createdAt: "2026-09-28T09:00:00.000Z", step: "done", name: "Besa" });
  const ohneZahl = renderSitzungDetail(shop, null, "", STANDARD_PRODUKTE, { status: "wartet" });
  assert.match(ohneZahl, /id="lifeskin-perputhja"[^>]*value=""/);
  assert.doesNotMatch(renderSitzungDetail(alt, null, "", STANDARD_PRODUKTE, { status: "wartet" }), /lifeskin-perputhja/);
  // Heart schlaegt keine Zahl vor.
  assert.doesNotMatch(ohneZahl, /id="lifeskin-perputhja"[^>]*value="\d/);
  // Gemerkt auf dem Geraet, bis freigegeben ist.
  entwurfSchreiben("shop1", { produkte: ["lf-acne"], perputhja: 91 });
  assert.equal(entwurfLesen("shop1").perputhja, 91);
  assert.match(renderSitzungDetail(shop, null, "", STANDARD_PRODUKTE, { status: "wartet" }), /id="lifeskin-perputhja"[^>]*value="91"/);
  entwurfLoeschen("shop1");
  // Nach der Freigabe gilt, was im Bericht steht.
  const frei = renderSitzungDetail(shop, null, "", STANDARD_PRODUKTE,
    { status: "fertig", freigabeAt: "x", perputhja: 88, produkte: [{ id: "lf-acne", satz: "" }] });
  assert.match(frei, /id="lifeskin-perputhja"[^>]*value="88"/);
});

test("Heart gibt einen Laden-Fall mit Therapie nicht ohne Zahl frei - als Vorschau schon", () => {
  const heart = lies("apps/mnyra-heart/heart.js");
  const stelle = heart.indexOf("async function gibLifeskinBerichtFrei");
  const koerper = heart.slice(stelle, heart.indexOf("\n}\n", stelle));
  const sperre = koerper.indexOf("perputhjaFeld && produkte.length && !nurStaffGewaehlt && perputhja === null");
  assert.ok(sperre > 0, "Es gibt keine Sperre ohne Zahl");
  assert.ok(sperre < koerper.indexOf("gibBerichtFrei("), "Die Sperre steht hinter dem Schreiben");
  assert.match(koerper, /\n\s+perputhja,\n/, "Die Zahl geht nicht in den Bericht");
});

test("die Nachrichten aus Heart nennen die Zahl von Dr. Gashi", async () => {
  const { whatsappNachricht, nachfassNachricht, vorabNachricht } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const sitzung = { id: "x1", name: "arta k", source: { weg: "lifeskinshop" } };
  const bericht = { status: "fertig", perputhja: 92, produkte: [{ id: "lf-acne" }], raport: { shitja: { whatsapp: "Lëkura juaj ka nevojë për qetësim." } } };
  const fertig = whatsappNachricht(sitzung, bericht);
  assert.match(fertig, /^Përshëndetje Arta, e shikova vetë lëkurën tuaj: terapia LifeSkin ju përshtatet 92%\./);
  assert.ok(fertig.includes("https://www.mnyra.com/analiza/x1"));
  assert.match(nachfassNachricht(sitzung, bericht, "ungesehen"), /ju përshtatet 92%/);
  const vorab = vorabNachricht(sitzung, "30min");
  assert.match(vorab, /me përqindje sa ju përshtatet terapia LifeSkin/);
  assert.doesNotMatch(vorab, /analiz|€/i);
  // Ohne Zahl bleibt es die gewohnte Nachricht - erfunden wird keine.
  assert.match(whatsappNachricht(sitzung, { ...bericht, perputhja: null }), /analiza juaj është gati/);
});

// ---------- Die Therapieseite ----------

test("die Therapieseite zeigt die Zahl nur im Laden, nur mit Therapie", async () => {
  const { Terapia, PERPUTHJA_STUFEN, ndajeMesazhi } = await import("../apps/lifeskin-verkauf/terapia.js");
  const seite = new Terapia({ ort: { pathname: "/terapia/abc", search: "" }, pixel: {} });
  seite.daten = { weg: "lifeskinshop", perputhja: 92, preis: 39 };
  seite.produkte = [{ id: "lf-acne" }];
  assert.equal(seite.shop, true);
  assert.equal(seite.perputhja, 92);
  assert.equal(seite.kaufWort(), "Filloj rutinën time — 39 €");
  seite.produkte = [];
  assert.equal(seite.perputhja, null, "ohne Therapie keine Zahl");
  seite.produkte = [{ id: "lf-acne" }];
  seite.daten = { weg: "lifeskinshop", perputhja: "", preis: 39 };
  assert.equal(seite.perputhja, null, "ohne Zahl von Dr. Gashi kein Block");
  assert.equal(seite.kaufWort(), "Fillo terapinë — 39 €");
  // Andere Wege: nichts aendert sich, auch wenn eine Zahl im Bericht stuende.
  seite.daten = { weg: "lifeskin2", perputhja: 92, preis: 39 };
  assert.equal(seite.perputhja, null);
  assert.equal(seite.kaufWort(), "Rezervo setin tim — 39 €");
  seite.daten = { perputhja: 92, preis: 39 };
  assert.equal(seite.perputhja, null);
  // Die Worte folgen der Zahl.
  assert.match(PERPUTHJA_STUFEN.larte.titulli("Arta"), /^Arta, kjo terapi i përshtatet shumë mirë/);
  assert.equal(PERPUTHJA_STUFEN.mire.niveli, "Përputhje e mirë");
  // Geteilt wird der Laden, nie der eigene Fall.
  const { text, url } = ndajeMesazhi(92, "https://www.mnyra.com/");
  assert.equal(url, "https://www.mnyra.com/lifeskinshop?utm_source=ndaje&utm_campaign=perputhja");
  assert.match(text, /92%/);
  assert.doesNotMatch(`${text} ${url}`, /terapia\/|analiza\//);
});

test("der Block mit der Zahl steht oben, das Teilen weit unten - die Zaehlmarken bleiben", () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  const stelle = (id) => html.indexOf(`id="${id}"`);
  assert.ok(stelle("t-perputhja") > stelle("t-urteil") && stelle("t-perputhja") < stelle("t-titulli"));
  assert.ok(stelle("ndaje") > stelle("analiza") && stelle("ndaje") < stelle("instagram"));
  assert.match(html, /<link rel="stylesheet" href="\/apps\/lifeskin-verkauf\/terapia-shop\.css">/);
  const js = lies("apps/lifeskin-verkauf/terapia.js");
  assert.match(js, /const marken = \[\["#pse", "sahSchnitt"\], \["#merrni", "sahTherapie"\], \["#t-cmimi1", "sahPreis"\]\];/);
});

// ---------- Nachtrag 28.09. abends (Wunsch Inhaber) ----------

test("der Laden zaehlt in Heart ab dem Zaehlbeginn - aeltere Besuche ausgeblendet, nicht geloescht", async () => {
  const { WEG_ZAEHLT_AB, zaehltImWeg } = await import("../shared/lifeskin-weg.js");
  const { nachWeg, vorDemZaehlbeginn } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const ab = Date.parse(WEG_ZAEHLT_AB.lifeskinshop);
  assert.ok(Number.isFinite(ab), "kein Zaehlbeginn fuer den Laden");
  const vor = new Date(ab - 60000).toISOString();
  const nach = new Date(ab + 60000).toISOString();
  const s = (id, weg, createdAt, extra = {}) => ({ id, createdAt, source: weg ? { weg } : {}, ...extra });
  const sitzungen = [s("alt", "lifeskinshop", vor), s("altKauf", "lifeskinshop", vor, { order: { total: 39 } }),
    s("neu", "lifeskinshop", nach), s("ohneZeit", "lifeskinshop", ""), s("ls1", "", vor), s("ls2", "lifeskin2", vor)];
  assert.deepEqual(nachWeg(sitzungen, "lifeskinshop").map((x) => x.id), ["neu", "ohneZeit"]);
  assert.deepEqual(nachWeg(sitzungen, "lifeskinshop", { alle: true }).length, 4);
  // Die anderen Wege zaehlen weiter alles.
  assert.deepEqual(nachWeg(sitzungen, "").map((x) => x.id), ["ls1"]);
  assert.deepEqual(nachWeg(sitzungen, "lifeskin2").map((x) => x.id), ["ls2"]);
  assert.equal(zaehltImWeg(s("x", "", vor), ""), true);
  assert.deepEqual(vorDemZaehlbeginn(sitzungen, "lifeskinshop"), { anzahl: 2, bestellt: 1 });
  // Der Hinweis "Gezaehlt ab ..." steht seit dem 29.09. nicht mehr in Heart
  // (Wunsch Inhaber) - gezaehlt wird trotzdem ab dem Zaehlbeginn.
  assert.doesNotMatch(lies("apps/mnyra-heart/heart-lifeskin-render.js"), /Gezählt ab|renderZaehlbeginn/);
  // Live zaehlt ab demselben Zeitpunkt.
  assert.match(lies("apps/mnyra-heart/heart.js"), /wegDerSitzung\(s\) === weg && zaehltImWeg\(s, weg\)/);
});

test("der Zaehlbeginn blendet keinen Fall aus: Faelle zeigen auch die von davor, die Kacheln zaehlen ab dann", async () => {
  const { WEG_ZAEHLT_AB } = await import("../shared/lifeskin-weg.js");
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const ab = Date.parse(WEG_ZAEHLT_AB.lifeskinshop);
  const fall = (id, am, extra = {}) => ({ id, createdAt: new Date(am).toISOString(), updatedAt: new Date(am).toISOString(),
    step: "result", name: id, code: `LS-${id}`, photos: ["zona"], source: { weg: "lifeskinshop" }, device: {},
    hatBestellt: false, hatAnschrift: false, hatTelefon: true, ...extra });
  const alt = fall("AltVorDemBeginn", ab - 3600000);
  const neu = fall("NeuNachDemBeginn", Math.max(ab + 60000, Date.now() - 60000));
  const test = fall("EigenerTestVorher", ab - 7200000, { source: { weg: "lifeskinshop", utmCampaign: "test" } });
  const html = renderLifeskin({
    status: "ready", loadedFrom: "network", weg: "lifeskinshop", sitzungen: [alt, neu], tests: [test],
    berichte: { [alt.id]: { status: "wartet" }, [neu.id]: { status: "wartet" } },
    produkte: [], abdeckung: [], kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]),
    lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]), verteilung: b.baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", zeitraum: "", fach: "alle"
  });
  const faelle = html.slice(html.indexOf('data-klapp="faelle"'));
  assert.ok(faelle.includes("AltVorDemBeginn"), "Der Fall von vor dem Zaehlbeginn fehlt in Faelle");
  assert.ok(faelle.includes("NeuNachDemBeginn"));
  assert.ok(html.includes("EigenerTestVorher"), "Der eigene Test von davor fehlt bei Tests");
  assert.doesNotMatch(html, /Gezählt ab/);
});

test("erst Korb und Kasse, dann die Kontrolle: der neue Fall steht unter Offen, nicht unter Kasse", async () => {
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const jetzt = new Date().toISOString();
  const fall = (id, extra = {}) => ({ id, createdAt: jetzt, updatedAt: jetzt, step: "result", warteseiteGeoeffnet: true,
    name: id, code: `LS-${id}`, photos: ["zona"], source: { weg: "lifeskinshop" }, device: {},
    hatBestellt: false, hatAnschrift: false, hatTelefon: true, ...extra });
  // So kam der Fall am 28.09. um 23:21: Set in den Korb, Kasse, dann Foto.
  const vorher = fall("KorbKasseDannFoto", { imKorb: true, korbWert: 39, kasseGeoeffnet: true, kasseGeoeffnetAt: jetzt });
  const gekauft = fall("GekauftDannFoto", { imKorb: true, kasseGeoeffnet: true, hatBestellt: true, order: { total: 39 } });
  const beantwortet = fall("BeantwortetMitKasse", { berichtGeoeffnet: true, kasseGeoeffnet: true, kasseGeoeffnetAt: jetzt });
  const berichte = { [vorher.id]: { status: "wartet" }, [gekauft.id]: { status: "wartet" },
    [beantwortet.id]: { status: "fertig", freigabeAt: jetzt } };
  const zeichne = (fach) => renderLifeskin({
    status: "ready", loadedFrom: "network", weg: "lifeskinshop", sitzungen: [vorher, gekauft, beantwortet], tests: [], berichte,
    produkte: [], abdeckung: [], kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]),
    lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]), verteilung: b.baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", zeitraum: "", fach
  });
  const imFach = (html) => [...html.slice(html.indexOf(">Fälle<"), html.indexOf(">Bestellungen<"))
    .matchAll(/data-action="lifeskin-sitzung" data-id="([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(imFach(zeichne("alle")), ["GekauftDannFoto", "KorbKasseDannFoto"],
    "Ein unbeantworteter Fall fehlt unter Offen");
  // Kasse und Bestellt gelten erst nach der Antwort.
  assert.deepEqual(imFach(zeichne("kasse")), ["BeantwortetMitKasse"]);
  assert.deepEqual(imFach(zeichne("bestellt")), []);
  assert.match(lies("apps/mnyra-heart/heart-lifeskin-render.js"), /if \(zustand === "neu" && bericht\) return "alle";/,
    "Ohne Bericht (alte Laden-Kaeufe) muss es beim alten Fach bleiben");
});

test("stille Links: kein Sprung auf einen Fall, den es im stillen Modus nicht gibt", () => {
  const app = lies("apps/lifeskin/lifeskin-app.js");
  assert.match(app, /if \(this\.sitzung\.fortsetzbar\(\) && globalThis\.__mnyraStill !== true\) \{\s*globalThis\.location\.replace\(this\.sitzung\.berichtPfad\);/);
  assert.match(lies("apps/lifeskin-astra/astra.js"), /globalThis\.__mnyraStill === true\s*\? "Stiller Modus: Es wird kein Fall angelegt/);
});

test("das Titelbild springt nicht: Rahmen von Anfang an 7:5, das eigene Bild kommt vom Geraet", async () => {
  assert.match(lies("apps/lifeskin-shop/shop-rahmen.css"), /\n#ls-einstieg \.hero-photo \{ height: auto; aspect-ratio: 7 \/ 5; \}/);
  const { Dyqan } = await import("../apps/lifeskin-shop/shop.js");
  const lager = new Map();
  const dauer = { getItem: (k) => lager.get(k) ?? null, setItem: (k, v) => lager.set(k, v), removeItem: (k) => lager.delete(k) };
  const baue = () => {
    const img = { src: "/apps/lifeskin-shop/assets/lf-acne-2.jpg" };
    const attr = {};
    const rahmen = { querySelector: () => img, setAttribute: (k, v) => { attr[k] = v; }, removeAttribute: (k) => { delete attr[k]; } };
    return { img, attr, dokument: { querySelector: (w) => (w.includes("hero-photo") ? rahmen : null), defaultView: {} } };
  };
  const foto = "data:image/jpeg;base64,AA";
  const mitBild = async (url) => (url.endsWith("/shopHero")
    ? { ok: true, status: 200, json: async () => ({ fields: { foto: { stringValue: foto } } }) } : { ok: false, status: 404 });
  const erst = baue();
  await new Dyqan({ dokument: erst.dokument, speicher: null, holen: mitBild, dauerSpeicher: dauer }).titelbild();
  assert.equal(lager.get("lifeskin:shopHero"), foto, "das Bild wird nicht gemerkt");
  // Beim naechsten Oeffnen steht es sofort da - vor jeder Antwort.
  const zweit = baue();
  let offen;
  const langsam = () => new Promise((r) => { offen = r; });
  const lauf = new Dyqan({ dokument: zweit.dokument, speicher: null, holen: langsam, dauerSpeicher: dauer }).titelbild();
  assert.equal(zweit.img.src, foto);
  assert.ok("data-eigen" in zweit.attr);
  offen({ ok: false, status: 503 });
  await lauf;
  assert.equal(zweit.img.src, foto, "ohne Netz bleibt das gemerkte Bild");
  // In Heart entfernt (404): zurueck zum Standardbild, nichts mehr gemerkt.
  const dritt = baue();
  await new Dyqan({ dokument: dritt.dokument, speicher: null, holen: async () => ({ ok: false, status: 404 }), dauerSpeicher: dauer }).titelbild();
  assert.equal(dritt.img.src, "/apps/lifeskin-shop/assets/lf-acne-2.jpg");
  assert.ok(!("data-eigen" in dritt.attr));
  assert.equal(lager.has("lifeskin:shopHero"), false);
});

test("der Abschnitt #zgjedhja steht wieder wie vor dem 28.09. abends", () => {
  const html = lies("apps/lifeskin-shop/index.html");
  const abschnitt = html.slice(html.indexOf('id="zgjedhja"'), html.indexOf("</section>", html.indexOf('id="zgjedhja"')));
  assert.match(abschnitt, /ZGJEDHJE PERSONALE/);
  assert.match(abschnitt, /A është ky set për ju\?<br><span>Qartë para porosisë\.<\/span>/);
  assert.match(abschnitt, /<p class="selection-note">LF ACNE \+ LF MOISTUR · 39 €<\/p>/);
  assert.doesNotMatch(abschnitt, /kontrolli|përqindje/);
  assert.doesNotMatch(lies("apps/lifeskin-shop/shop-weg.css"), /kontrolli/);
});

test("eine Bestellung aus dem stillen Modus zaehlt in Heart als Test, nicht als Kauf", async () => {
  const { istTest, teileTests } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const still = { id: "s", order: { total: 39, still: true }, step: "ordered" };
  const echt = { id: "e", order: { total: 39 }, step: "ordered" };
  assert.equal(istTest(still), true);
  assert.equal(istTest(echt), false);
  const { echte, tests } = teileTests([still, echt]);
  assert.deepEqual(echte.map((x) => x.id), ["e"]);
  assert.deepEqual(tests.map((x) => x.id), ["s"]);
  // Live sieht dieselbe Pruefung.
  assert.match(lies("apps/mnyra-heart/heart-lifeskin-live.js"), /istTest\(/);
});

test("der Kopf der Seite fragt den Stempel unter derselben Adresse ab wie shop.js", async () => {
  const { HERO_ADRESSE, HERO_NUR_STAND } = await import("../apps/lifeskin-shop/shop.js");
  const html = lies("apps/lifeskin-shop/index.html");
  // Nur mit gemerktem Bild UND Stempel - sonst fragt shop.js selbst.
  assert.match(html, /if \(!localStorage\.getItem\("lifeskin:shopHero"\) \|\| !localStorage\.getItem\("lifeskin:shopHeroStand"\)\) return;/);
  assert.equal(html.match(/var url = "([^"]+)";/)?.[1], HERO_ADRESSE + HERO_NUR_STAND,
    "shop.js wuerde die Antwort aus dem Kopf nicht benutzen und ein zweites Mal fragen");
  // Das gemerkte Bild setzt der Einzeiler im Rahmen, bevor gezeichnet wird -
  // nur ein Bild (data:image/), und ohne globale Namen.
  const rahmen = html.slice(html.indexOf('<div class="hero-photo">'), html.indexOf("</div>", html.indexOf('<div class="hero-photo">')));
  assert.match(rahmen, /<script>\(function\(\)\{try\{var bild=localStorage\.getItem\("lifeskin:shopHero"\);if\(bild&&bild\.indexOf\("data:image\/"\)===0\)/);
  assert.match(rahmen, /setAttribute\("data-eigen",""\)\}\}catch\(e\)\{\}\}\)\(\)<\/script>/);
});

test("nach einem Kauf im Laden fuehrt Neuladen nicht auf eine Warteseite ohne Fall", async () => {
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const lager = new Map();
  const speicher = { getItem: (k) => lager.get(k) ?? null, setItem: (k, v) => lager.set(k, String(v)), removeItem: (k) => lager.delete(k) };
  const fetchFn = async () => ({ ok: true, status: 200, json: async () => ({}) });
  // Direkt im Laden gekauft: "ordered", aber nie ein Bericht.
  const kauf = new Sitzung({ fetchFn, speicher });
  await kauf.starte({ sprache: "sq" });
  await kauf.schritt("ordered", { order: { total: 39 } });
  assert.equal(new Sitzung({ fetchFn, speicher }).fortsetzbar(), null,
    "Neuladen nach dem Kauf fuehrt auf /analiza/<id> - \"Ky rast nuk u gjet\"");
  // Mit abgegebenem Bericht geht es wie bisher auf die eigene Seite -
  // auch wenn danach bestellt wurde.
  lager.clear();
  const fall = new Sitzung({ fetchFn, speicher });
  await fall.starte({ sprache: "sq" });
  assert.equal(await fall.berichtAnlegen({ name: "Arta" }), true);
  await fall.schritt("result");
  await fall.schritt("ordered", { order: { total: 39 } });
  assert.ok(new Sitzung({ fetchFn, speicher }).fortsetzbar(), "Wer seinen Fall hat, faengt wieder vorne an");
});

// ---------- Die Karte "Shop" in Heart (29.09., Wunsch Inhaber) ----------

test("die Seite Abschnitt fuer Abschnitt: 9 Namen, gemessen im Bild, gezaehlt 'bis hierher'", async () => {
  const { SHOP_ABSCHNITTE, shopSichtPatch, shopTiefe } = await import("../shared/lifeskin-shopsicht.js");
  assert.deepEqual(SHOP_ABSCHNITTE.map((a) => a.name),
    ["Acne duo", "Para - Pas", "Informata", "SkinReact", "Postimet", "Dërgesa", "Instagram", "F.A.Q", "Fundi"]);
  // Jeder Abschnitt steht so auf der Seite, wie er gesucht wird.
  const html = lies("apps/lifeskin-shop/index.html");
  const main = html.slice(html.indexOf('<main id="main">'), html.indexOf("</main>"));
  for (const [wahl, muster] of [["main > .hero", /\n<section class="hero"/], ["#rezultate", /<section[^>]*id="rezultate"/],
    ["#setet", /<section[^>]*id="setet"/], ["#zgjedhja", /<section[^>]*id="zgjedhja"/], ["#klientet", /<section[^>]*id="klientet"/],
    ["#rutina", /<section[^>]*id="rutina"/], ["main > .social-presence", /\n<section class="social-presence"/],
    ["main > .faq", /\n<section class="faq"/], ["main > .closing", /\n<section class="closing"/]]) {
    assert.ok(SHOP_ABSCHNITTE.some((a) => a.wahl === wahl), wahl);
    assert.match(main, muster, `${wahl} steht nicht (mehr) auf der Seite`);
  }
  assert.deepEqual(shopSichtPatch(4), { v: 1, s4: true });
  assert.equal(shopSichtPatch(0), null);
  assert.equal(shopSichtPatch(10), null);
  // Die Tiefe kommt aus den Feldern - ein spaeterer, kuerzerer Aufruf nimmt nichts weg.
  assert.equal(shopTiefe({ timings: { shop: { v: 1, s1: true, s2: true, s7: true } } }), 7);
  assert.equal(shopTiefe({ timings: { shop: { v: 1 } } }), 1);
  // Besuche von vor der Messung: produkteGesehen heisst bis "Informata".
  assert.equal(shopTiefe({ produkteGesehen: true }), 3);
  assert.equal(shopTiefe({}), 1);
});

test("Seite und Kauf zaehlen getrennt: Wer oben kauft, war nicht bei Fundi", async () => {
  const { baueShopWeg } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const sicht = (...nr) => ({ timings: { shop: Object.fromEntries([["v", 1], ...nr.map((n) => [`s${n}`, true])]) } });
  const w = baueShopWeg([
    { ...sicht(1, 2, 3, 4, 5, 6, 7, 8, 9) },
    { ...sicht(1, 2, 3) },
    // Oben auf "Porosit setin", gekauft, nie gescrollt.
    { ...sicht(1), imKorb: true, kasseGeoeffnet: true, adresseBegonnen: true, hatBestellt: true, order: { total: 39 } },
    // Eine Vorab-Ladung, die nie im Bild war, zaehlt nicht als Besucher.
    { gesehen: false }
  ]);
  assert.deepEqual(w.seite.map((s) => [s.nr, s.label, s.anzahl]), [
    [1, "Acne duo", 3], [2, "Para - Pas", 2], [3, "Informata", 2], [4, "SkinReact", 1], [5, "Postimet", 1],
    [6, "Dërgesa", 1], [7, "Instagram", 1], [8, "F.A.Q", 1], [9, "Fundi", 1]
  ]);
  assert.deepEqual(w.kauf.map((s) => [s.nr, s.label, s.anzahl]), [[10, "Shport", 1], [11, "Arka", 1], [12, "Adresa", 1], [13, "Gotat Nalt", 1]]);
  assert.equal(w.besucher, 3);
});

test("die Karte: Kreis mit Nummer, Name, Balken, Zahl - 1 bis 13, der Kauf abgesetzt", async () => {
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const jetzt = new Date().toISOString();
  const s = (id, extra = {}) => ({ id, createdAt: jetzt, updatedAt: jetzt, step: "opened", source: { weg: "lifeskinshop" }, device: {}, ...extra });
  const html = renderLifeskin({
    status: "ready", loadedFrom: "network", weg: "lifeskinshop", tests: [], berichte: {},
    sitzungen: [s("a", { timings: { shop: { v: 1, s1: true, s2: true } } }), s("b", { imKorb: true, korbWert: 39 })],
    produkte: [], abdeckung: [], kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]),
    lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]), verteilung: b.baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", zeitraum: "", fach: "alle"
  });
  const zeilen = [...html.matchAll(/<div class="heart-shopschritt">\s*<span class="heart-shopschritt__nr">(\d+)<\/span>\s*<span class="heart-shopschritt__name">([^<]+)<\/span>\s*<span class="heart-shopschritt__spur"><span class="heart-shopschritt__balken" style="width:([\d.]+)%"><\/span><\/span>\s*<b class="heart-shopschritt__zahl">(\d+)<\/b>/g)]
    .map((m) => [Number(m[1]), m[2], Number(m[3]), Number(m[4])]);
  assert.deepEqual(zeilen.map((z) => z[0]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(zeilen.map((z) => z[1]), ["Acne duo", "Para - Pas", "Informata", "SkinReact", "Postimet", "Dërgesa",
    "Instagram", "F.A.Q", "Fundi", "Shport", "Arka", "Adresa", "Gotat Nalt"]);
  // Alle Balken am selben Massstab: den Shop-Besuchern.
  assert.deepEqual(zeilen.map((z) => [z[2], z[3]]).slice(0, 3), [[100, 2], [50, 1], [0, 0]]);
  assert.deepEqual(zeilen[9].slice(2), [50, 1], "Shport misst nicht an den Besuchern");
  // Der Kauf steht in einem eigenen, abgesetzten Block; die Kontrolle in eigener Karte.
  assert.match(html, /<div class="heart-shopschritte heart-shopschritte--kauf">/);
  assert.match(html, /data-klapp="shopkontrolle"/);
  assert.doesNotMatch(html, /Shop geöffnet|Sets \/ Produkte angesehen/);
  // Das Aussehen: kleiner Kreis, feste Namensspalte, damit jeder Balken gleich beginnt.
  const css = lies("apps/mnyra-heart/heart.css");
  assert.match(css, /\.heart-shopschritt \{\s*display: grid;\s*grid-template-columns: 20px 5\.4rem 1fr 2\.2rem;/);
  assert.match(css, /\.heart-shopschritt__nr \{\s*width: 20px; height: 20px; border-radius: 50%;/);
});

test("der Laden misst die Abschnitte - erst nach dem Anlegen der Sitzung, ohne Pixel", async () => {
  const shop = lies("apps/lifeskin-shop/shop.js");
  assert.match(shop, /import \{ SHOP_ABSCHNITTE, shopSichtPatch \} from "\.\.\/\.\.\/shared\/lifeskin-shopsicht\.js";/);
  assert.match(shop, /for \(const a of SHOP_ABSCHNITTE\) \{\s*const el = this\.dok\.querySelector\(a\.wahl\);/);
  assert.match(shop, /if \(sitzung\.angelegt === true\) sitzung\.shopSichtSchreiben\(patch\);/);
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const aufrufe = [];
  const fetchFn = async (url, init = {}) => { aufrufe.push({ url, init }); return { ok: true, status: 200, json: async () => ({}) }; };
  const sitzung = new Sitzung({ fetchFn, speicher: null });
  await sitzung.starte({ sprache: "sq" });
  await sitzung.shopSichtSchreiben({ v: 1, s3: true });
  const letzte = aufrufe.at(-1);
  assert.match(letzte.url, /updateMask\.fieldPaths=timings\.shop\.v/);
  assert.match(letzte.url, /updateMask\.fieldPaths=timings\.shop\.s3/);
  assert.doesNotMatch(letzte.url, /fieldPaths=timings(?!\.)/, "die ganze timings-Karte wuerde ueberschrieben");
});
