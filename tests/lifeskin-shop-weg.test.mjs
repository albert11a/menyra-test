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
// Nur die gewaehlte Ansicht der Karte "Shop" - die anderen drei liegen
// unsichtbar in derselben Zelle (gleiche Hoehe fuer alle Chips).
function sichtbareAnsicht(html) {
  const teile = String(html).split('<div class="heart-shopansicht"').slice(1);
  return (teile.find((t) => /^ data-ansicht="[a-z]+" data-an="ja"/.test(t)) || "").split("</details>")[0];
}

const { OBERFLAECHE, OBERFLAECHE_WEGE, FRAGEN_TEXTE, FRAGEN_TEXTE_WEGE, FRAGEN_NACH_AUFNAHME, t } =
  await import("../apps/lifeskin/lifeskin-content.js");
const { TEXTE, TEXTE_WEGE } = await import("../apps/lifeskin-astra/astra-texte.js");
const { FRAGE_TIPPS, frageAus, tippZeigen } = await import("../apps/lifeskin-shop/weg.js");
const { perputhjaGueltig, perputhjaStufe } = await import("../shared/lifeskin-perputhja.js");

// ---------- Die Worte ----------

test("der Laden spricht in eigenen Worten - und nur mit Schluesseln, die es gibt", () => {
  for (const k of Object.keys(OBERFLAECHE_WEGE.lifeskinshop)) assert.ok(OBERFLAECHE[k], `${k} gibt es in OBERFLAECHE nicht`);
  for (const k of Object.keys(FRAGEN_TEXTE_WEGE.lifeskinshop || {})) assert.ok(FRAGEN_TEXTE[k], `${k} gibt es in FRAGEN_TEXTE nicht`);
  for (const k of Object.keys(TEXTE_WEGE.lifeskinshop)) assert.ok(TEXTE[k], `${k} gibt es in TEXTE nicht`);
  // Er hat nie eine Analyse versprochen: Keiner seiner Saetze sagt es.
  const saetze = [
    ...Object.values(OBERFLAECHE_WEGE.lifeskinshop),
    ...Object.values(FRAGEN_TEXTE_WEGE.lifeskinshop || {}),
    ...Object.values(TEXTE_WEGE.lifeskinshop)
  ].map((e) => t(e, "sq"));
  for (const satz of saetze) assert.doesNotMatch(satz, /analiz/i, satz);
  // Die Nummer-Seite (Fassung 29.09.) verspricht die Prozentzahl, der Knopf heisst "Përfundo".
  assert.match(t(OBERFLAECHE_WEGE.lifeskinshop.telPersoenlich, "sq"), /përqindjen e përputhjes/);
  assert.equal(OBERFLAECHE_WEGE.lifeskinshop.telKnopf, undefined);
  assert.match(t(TEXTE_WEGE.lifeskinshop.pritWarum, "sq"), /vetë Dr\. Gashi/);
});

test("im Laden drei Fragen nach der Aufnahme - ohne die Bereitschaft (Frage 4)", async () => {
  const { fragenNachAufnahme, FRAGEN } = await import("../apps/lifeskin/lifeskin-content.js");
  assert.deepEqual(fragenNachAufnahme("lifeskinshop").map((f) => f.id), ["anliegen", "kohezgjatja", "perdorimi"]);
  // Die anderen Wege behalten ihre vier.
  assert.deepEqual(fragenNachAufnahme("").map((f) => f.id), FRAGEN_NACH_AUFNAHME.map((f) => f.id));
  assert.equal(fragenNachAufnahme("lifeskin2").length, 4);
  // Keine Worte mehr fuer eine Frage, die der Laden nicht stellt.
  assert.equal(FRAGEN.find((f) => f.id === "gatishmeria").wege.lifeskinshop, undefined);
  // Keine Karte "Fotoja u ruajt ✓ 3 pyetje …" ueber der ersten Frage (29.09.):
  // Die Seite des Ladens hat die Stelle dafuer nicht mehr, /lifeskin schon.
  assert.equal(FRAGEN_TEXTE_WEGE.lifeskinshop, undefined);
  assert.doesNotMatch(lies("apps/lifeskin-shop/index.html"), /id="ls-frageneinleitung"/);
  assert.match(lies("apps/lifeskin-landing/index.html"), /id="ls-frageneinleitung"/);
  // Der Prompt weiss, dass Laden-Faelle diese Antwort nicht haben.
  for (const p of ["docs/lifeskin-prompt-v9.txt", "docs/lifeskin-prompt-v9-pa-foto.txt"]) {
    assert.match(lies(p), /keine Antwort: wie unten beschrieben\. So immer bei Fällen aus dem\s+Laden \(\/lifeskinshop\)/, p);
  }
  // Die Therapieseite zeigt den Satz am Kaufknopf nur mit Antwort.
  assert.match(lies("apps/lifeskin-verkauf/terapia.js"), /zeigen\(\$\("#t-gati"\), Boolean\(spiegel\?\.bereit\)\);/);
});

test("im Laden kuerzer (29.09.): kein Pa detyrim, drei Foto-Regeln, Frage 1 ohne zwei Antworten, Frage 3 kurz", async () => {
  const laden = lies("apps/lifeskin-shop/index.html");
  // Kein Schild "Pa detyrim" oben - im ganzen Trichter des Ladens nicht.
  assert.doesNotMatch(laden, /data-text="langPunktFalas"|ls-kopf__schild/);
  assert.equal(OBERFLAECHE_WEGE.lifeskinshop.langPunktFalas, undefined);
  // Foto-Anleitung: ohne Make-up, ohne Filter, ohne Tipp-Karte.
  const para = laden.slice(laden.indexOf('data-text="fotoParaTitel"'), laden.indexOf('id="ls-fotoweiter"'));
  assert.deepEqual([...para.matchAll(/data-text="(fotoPara[A-Za-z]+)"/g)].map((m) => m[1]),
    ["fotoParaTitel", "fotoParaLicht", "fotoParaKlar", "fotoParaNah"]);
  assert.doesNotMatch(para, /weg-tipp|KËSHILLË PËR FOTON/);
  // /lifeskin behaelt alle fuenf Regeln.
  const lifeskin = lies("apps/lifeskin-landing/index.html");
  assert.match(lifeskin, /data-text="fotoParaMakeup"/);
  assert.match(lifeskin, /data-text="fotoParaFilter"/);
  // Frage 1 im Laden ohne "Shkëlqimi" und "Nuk e di", Frage 3 kuerzer.
  const { FRAGEN, frageFuerWeg } = await import("../apps/lifeskin/lifeskin-content.js");
  const frage = (id, weg) => frageFuerWeg(FRAGEN.find((f) => f.id === id), weg);
  assert.deepEqual(frage("anliegen", "lifeskinshop").antworten.map((a) => a.id),
    ["pucrrat", "poret", "njollat", "skuqja", "thate", "rrudhat"]);
  assert.deepEqual(frage("anliegen", "").antworten.map((a) => a.id),
    ["pucrrat", "poret", "shkelqimi", "njollat", "skuqja", "thate", "rrudhat", "nukEdi"], "/lifeskin behaelt alle");
  assert.equal(t(frage("perdorimi", "lifeskinshop").titel, "sq"), "Çka keni provuar deri tani?");
  assert.equal(t(frage("perdorimi", "").titel, "sq"), "Çka keni provuar deri tash për lëkurën?");
  // Der Tipp unter Frage 1 erkennt sie weiter (an "Puçrrat").
  assert.equal(frageAus(frage("anliegen", "lifeskinshop").antworten.map((a) => a.id)), "anliegen");
});

test("im Laden kein Weg Trup/Pytje - weder auf der Wahl noch in den stillen Links", async () => {
  assert.doesNotMatch(lies("apps/lifeskin-shop/index.html"), /data-ls-weg="trup"/);
  assert.match(lies("apps/lifeskin-landing/index.html"), /data-ls-weg="trup"/, "/lifeskin muss den Weg behalten");
  const { baueStillLinks } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const titel = (weg) => baueStillLinks({ weg, tests: [], sitzungen: [], berichte: {} }).gruppen.map((g) => g.titel);
  assert.ok(!titel("lifeskinshop").includes("Trup/Pytje"));
  assert.ok(titel("").includes("Trup/Pytje"));
});

// ---------- Die Tipps ----------

test("jede der drei Fragen im Laden hat ihren Tipp - erkannt an einer Antwort, die es nur bei ihr gibt", async () => {
  const { fragenNachAufnahme } = await import("../apps/lifeskin/lifeskin-content.js");
  const fragen = fragenNachAufnahme("lifeskinshop");
  const ids = fragen.map((f) => f.id);
  assert.deepEqual(Object.keys(FRAGE_TIPPS).sort(), [...ids].sort());
  for (const frage of fragen) {
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
  const zeilen = [...sichtbareAnsicht(html).matchAll(/<div class="heart-shopschritt">\s*<span class="heart-shopschritt__nr">(\d+)<\/span>\s*<span class="heart-shopschritt__name">([^<]+)<\/span>\s*<span class="heart-shopschritt__spur"><span class="heart-shopschritt__balken" style="width:([\d.]+)%"><\/span><\/span>\s*<b class="heart-shopschritt__zahl">(\d+)<\/b>/g)]
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
  assert.match(css, /\.heart-shopschritt \{\s*display: grid;\s*grid-template-columns: 18px 7\.2rem 1fr 2\.2rem;/);
  // Der Kreis bleibt 18 px; kompakt ist nur die Zahl darin: klein, ohne Tabellenbreite.
  const kreis = css.match(/\.heart-shopschritt__nr \{[^}]*\}/)[0];
  assert.match(kreis, /width: 18px; height: 18px; border-radius: 50%;\s*border: 1\.25px solid #00796a;/);
  assert.match(kreis, /font-size: 7\.5px;/);
  assert.doesNotMatch(kreis, /tabular-nums/);
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

// ---------- Chips Shop / Scan / Foto / Analyse (29.09., Wunsch Inhaber) ----------

test("die Karte Shop hat oben vier Chips, je 13 Punkte - unten nur noch Kauf und Bericht", async () => {
  const b = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  const { renderLifeskin } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const jetzt = new Date().toISOString();
  const grund = (weg, shopChip) => renderLifeskin({
    status: "ready", loadedFrom: "network", weg, tests: [], berichte: {},
    sitzungen: [{ id: "a", createdAt: jetzt, updatedAt: jetzt, step: "opened", source: weg ? { weg } : {}, device: {} }],
    produkte: [], abdeckung: [], kennzahlen: b.baueKennzahlen([]), trichter: b.baueTrichter([]),
    lesetiefe: b.baueLesetiefe([]), herkunft: b.baueHerkunft([]), verteilung: b.baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", zeitraum: "", fach: "alle", shopChip
  });
  const namen = (html) => [...html.matchAll(/heart-shopschritt__name">([^<]+)</g)].map((m) => m[1]);
  const nummern = (html) => [...html.matchAll(/heart-shopschritt__nr">(\d+)</g)].map((m) => Number(m[1]));
  const html = grund("lifeskinshop", "shop");
  assert.deepEqual([...html.matchAll(/data-action="lifeskin-shopchip" data-wert="([a-z]+)"/g)].map((m) => m[1]), ["shop", "scan", "foto", "analyse"]);
  // Alle vier IN der Karte, ganz oben an Stelle des Titels, in einer kompakten Reihe;
  // der Kopf (zugeklappt) ist offen versteckt.
  assert.match(html, /<details class="heart-lifeskin-block heart-klapp heart-doppeltipp heart-lifeskin-block--shopweg" data-klapp="shopweg" open\s+aria-label="Shop · vom Besuch bis zum Kauf · Heute">\s*<summary class="heart-klapp__kopf" aria-label="Shop · aufklappen">[\s\S]*?<\/summary>\s*<div class="heart-lifeskin-chips heart-lifeskin-chips--shop" role="group">\s*<button[^>]*data-action="lifeskin-shopchip"/);
  const shopKarte = html.slice(html.indexOf("heart-lifeskin-block--shopweg"), html.indexOf("</details>", html.indexOf("heart-lifeskin-block--shopweg")));
  assert.doesNotMatch(shopKarte, /heart-lifeskin-block__titel|<h3/, "kein Titel mehr in der Karte");
  // Zugeklappt: eine schmale Zeile mit den vier Zahlen der Chips.
  assert.match(shopKarte, /<span class="heart-klapp__zahl heart-klapp__zahl--zu">Shop 1 · Scan 0 · Foto 0 · Analyse 0<\/span>/);
  // Gleich hoch: alle vier Ansichten liegen in der Karte, sichtbar nur die gewaehlte.
  const ansichten = (h) => [...h.matchAll(/<div class="heart-shopansicht" data-ansicht="([a-z]+)" data-an="(ja|nein)"/g)].map((m) => `${m[1]}:${m[2]}`);
  assert.deepEqual(ansichten(html), ["shop:ja", "scan:nein", "foto:nein", "analyse:nein"]);
  assert.deepEqual(ansichten(grund("lifeskinshop", "analyse")), ["shop:nein", "scan:nein", "foto:nein", "analyse:ja"]);
  const chipCss = lies("apps/mnyra-heart/heart.css");
  assert.match(chipCss, /\.heart-lifeskin-chips--shop \.heart-lifeskin-chip \{\s*flex: 1 0 auto; min-height: 32px; padding: 0 7px;\s*border-radius: 6px; font-size: 12px;\s*\}/);
  // Der gewaehlte Chip ruhig - nicht das Gruen der Kreise.
  const chipAn = chipCss.match(/\.heart-lifeskin-chips--shop \.heart-lifeskin-chip--an \{[^}]*\}/)[0];
  assert.doesNotMatch(chipAn, /#00796a/);
  assert.match(chipAn, /background: var\(--heart-surface-soft, #232327\);\s*background: color-mix\(in srgb, var\(--heart-text, #fafafa\) 10%, transparent\);/);
  assert.match(chipCss, /\.heart-shopansichten \{ display: grid; \}\s*\.heart-shopansicht \{ grid-area: 1 \/ 1;/);
  assert.match(chipCss, /\.heart-shopansicht\[data-an="nein"\] \{ visibility: hidden; \}/);
  // Doppeltipp klappt zu, ein Tipp auf die schmale Zeile auf - wie bei den Kacheln.
  assert.match(chipCss, /\.heart-doppeltipp\[open\] > \.heart-klapp__kopf \{ display: none; \}/);
  assert.match(chipCss, /\.heart-doppeltipp\[open\] > \.heart-klapp__kopf \+ \* \{ margin-top: 0; \}/);
  const ereignisse = lies("apps/mnyra-heart/heart-events.js");
  assert.match(ereignisse, /closest\?\.\("\.heart-kachelklapp:not\(\[open\]\) > summary, \.heart-doppeltipp:not\(\[open\]\) > summary"\)/);
  assert.match(ereignisse, /closest\?\.\("\.heart-kachelklapp\[open\], \.heart-doppeltipp\[open\]"\);\s*if \(!doppeltippKarte\(karte\) \|\| el\.closest\("a, button, input, select, textarea"\)\) return false;/);
  assert.doesNotMatch(grund("lifeskinshop", "shop"), /heart-lifeskin-chips--shop[^>]*>\s*<button[^>]*data-action="lifeskin-trichter"/);
  assert.deepEqual([...html.matchAll(/data-action="lifeskin-trichter" data-wert="([a-z]+)"/g)].map((m) => m[1]), ["kauf", "bericht"]);
  const scan = sichtbareAnsicht(grund("lifeskinshop", "scan"));
  assert.deepEqual(namen(scan), ["Anleitung", "Scan akzeptiert", "Scan gestartet", "Scan fertig", "Frage 1", "Frage 2", "Frage 3",
    "Name +", "Nummer", "Nummer Feld", "Loading", "Loading fertig", "Patient"]);
  assert.deepEqual(nummern(scan), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  const foto = sichtbareAnsicht(grund("lifeskinshop", "foto"));
  assert.deepEqual(namen(foto).slice(0, 4), ["Anleitung", "Foto akzeptiert", "Foto gestartet", "Foto fertig"]);
  assert.deepEqual(namen(foto).slice(4), namen(scan).slice(4));
  const analyse = sichtbareAnsicht(grund("lifeskinshop", "analyse"));
  assert.deepEqual(namen(analyse), ["Përputhja", "Gjetjet", "Pakoja", "Ndjekja", "Para - Pas", "Oferta", "F.A.Q", "Detajet", "Fundi",
    "Shport", "Arka", "Adresa", "Gotat Nalt"]);
  assert.match(analyse, /heart-shopschritte--kauf/);
  // Die anderen Tabs behalten alle Trichter-Chips.
  assert.deepEqual([...grund("", "shop").matchAll(/data-action="lifeskin-trichter" data-wert="([a-z]+)"/g)].map((m) => m[1]),
    ["main", "scan", "foto", "trup", "kauf", "gati", "bericht", "landing"]);
  // Der Chip wird gemerkt wie der Trichter.
  assert.match(lies("apps/mnyra-heart/heart-events.js"), /action === "lifeskin-shopchip"\) \{\s*operations\.setLifeskinShopChip\?\.\(target\.getAttribute\("data-wert"\)\);/);
  assert.match(lies("apps/mnyra-heart/heart.js"), /setLifeskinShopChip\(id\) \{\s*actions\.patchLifeskin\(\{ shopChip: String\(id \|\| "shop"\)\.trim\(\) \}\);/);
});

test("Scan und Foto Bildschirm fuer Bildschirm - 3 und 4 zeigen, wo es hakt", async () => {
  const { baueShopWeg } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const w = baueShopWeg([
    { typ: "scan", step: "named" },
    { typ: "scan", step: "camera", kameraOk: true },
    { typ: "scan", step: "camera", kameraOk: true, timings: { weg: { bildDa: true } } },
    { typ: "scan", step: "result", kameraOk: true, phone: "044123456", warteseiteGeoeffnet: true, timings: { weg: { bildDa: true, nummerGetippt: true } } },
    { typ: "foto", step: "fotokamera", kameraOk: true },
    { typ: "foto", step: "numri", kameraOk: true, timings: { weg: { bildDa: true } } },
    // Wer im Laden gekauft hat, ist kein Analyseweg.
    { typ: "scan", step: "ordered", shopKauf: true, hatBestellt: true }
  ]);
  assert.deepEqual(w.chips.scan.stufen.map((s) => s.anzahl), [4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  assert.equal(w.chips.scan.basis, 4);
  assert.deepEqual(w.chips.foto.stufen.map((s) => s.anzahl), [2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]);
});

test("Analyse: die Seite mit dem Ergebnis, 9 Punkte und ihr Kauf - ohne die Kasse aus dem Laden", async () => {
  const { baueShopWeg } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const { TERAPIA_ABSCHNITTE, terapiaSichtPatch, terapiaTiefe } = await import("../shared/lifeskin-shopsicht.js");
  const sicht = (...nr) => Object.fromEntries([["v", 1], ...nr.map((n) => [`s${n}`, true])]);
  const w = baueShopWeg([
    { berichtGeoeffnet: true, sahPreis: true, timings: { terapia: sicht(1, 2, 3, 4, 5, 6), kauf: { kasse: "2026-09-29T10:00:00Z" } } },
    { berichtGeoeffnet: true },
    // Korb und Kasse im Laden, dann die Analyseseite nur geoeffnet.
    { imKorb: true, kasseGeoeffnet: true, berichtGeoeffnet: true, timings: { terapia: sicht(1) } },
    // Nie auf der Analyseseite: zaehlt hier nicht.
    { step: "opened" }
  ]);
  assert.deepEqual(w.chips.analyse.stufen.map((s) => s.anzahl), [3, 1, 1, 1, 1, 1, 0, 0, 0]);
  assert.deepEqual(w.chips.analyse.kauf.map((s) => [s.label, s.anzahl]), [["Shport", 1], ["Arka", 1], ["Adresa", 0], ["Gotat Nalt", 0]]);
  // Shport = Kaufknopf gedrueckt - nur den Preis gesehen zaehlt nicht (kein Warenkorb, auch nicht in der Kachel).
  const knopf = baueShopWeg([
    { berichtGeoeffnet: true, sahPreis: true },
    { berichtGeoeffnet: true, sahPreis: true, timings: { kauf: { knopf: "2026-09-29T10:00:00Z" } } },
    { berichtGeoeffnet: true, sahPreis: true, kasseGeoeffnet: true }
  ]);
  assert.deepEqual(knopf.chips.analyse.kauf.map((s) => [s.label, s.anzahl]), [["Shport", 2], ["Arka", 1], ["Adresa", 0], ["Gotat Nalt", 0]]);
  const { imWarenkorb } = await import("../apps/mnyra-heart/heart-lifeskin-berechnung.js");
  assert.equal(imWarenkorb({ berichtGeoeffnet: true, sahPreis: true }), false, "Preis gesehen zaehlt nicht als Warenkorb");
  assert.equal(imWarenkorb({ berichtGeoeffnet: true, kasseGeoeffnet: true }), true, "die Kasse der Analyseseite ist der Warenkorb");
  // Seit dem 29.09. hat die Analyseseite einen Warenkorb vor der Kasse (terapia.js #korb).
  assert.equal(imWarenkorb({ berichtGeoeffnet: true, sahPreis: true, timings: { kauf: { knopf: "2026-09-29T10:00:00Z" } } }), true,
    "der Warenkorb der Analyseseite zaehlt, auch ohne Kasse");
  // Jeder Punkt steht so auf der Analyseseite, wie er gesucht wird.
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  for (const a of TERAPIA_ABSCHNITTE) {
    for (const wahl of a.wahl.split(",").map((x) => x.trim())) assert.match(html, new RegExp(`<section[^>]*id="${wahl.slice(1)}"`), wahl);
  }
  assert.deepEqual(terapiaSichtPatch(9), { v: 1, s9: true });
  assert.equal(terapiaSichtPatch(10), null);
  // Besuche von vor der Messung: die alten Lesemarken.
  assert.equal(terapiaTiefe({ berichtGeoeffnet: true, sahSchnitt: true }), 2);
  assert.equal(terapiaTiefe({ berichtGeoeffnet: true, sahTherapie: true }), 3);
  assert.equal(terapiaTiefe({}), 0);
});

test("die neuen Marken: Bild da, Nummer getippt, Abschnitte der Analyseseite - ohne Schritt, ohne Pixel", async () => {
  const app = lies("apps/lifeskin/lifeskin-app.js");
  assert.equal((app.match(/this\.#wegMarke\("bildDa"\);/g) || []).length, 2, "Scan und Foto melden 'Bild da'");
  assert.match(app, /if \(\/\\d\/\.test\(\$\("#ls-telfeld"\)\?\.value \|\| ""\)\) this\.#wegMarke\("nummerGetippt"\);/);
  assert.match(app, /beiStrom: \(\) => this\.#kameraOkMerken\(\),/);
  const foto = lies("apps/lifeskin/lifeskin-foto.js");
  assert.match(foto, /this\.strom = strom;\s*try \{ this\.beiStrom\?\.\(\); \}/);
  const terapia = lies("apps/lifeskin-verkauf/terapia.js");
  assert.match(terapia, /#abschnitteMessen\(\) \{\s*if \(!this\.shop \|\| this\.nurVorschau \|\| typeof IntersectionObserver !== "function"\) return;/);
  // Die Marken gehen unter timings.weg, nie als eigenes Feld (keine neue Regel).
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const aufrufe = [];
  const fetchFn = async (url) => { aufrufe.push(url); return { ok: true, status: 200, json: async () => ({}) }; };
  const sitzung = new Sitzung({ fetchFn, speicher: null });
  await sitzung.starte({ sprache: "sq" });
  await sitzung.wegMarkeSchreiben("bildDa");
  assert.match(aufrufe.at(-1), /updateMask\.fieldPaths=timings\.weg\.bildDa/);
  const vorher = aufrufe.length;
  await sitzung.wegMarkeSchreiben("kaputt; x");
  assert.equal(aufrufe.length, vorher, "ein ungueltiger Name wird nicht geschrieben");
  // Die Analyseseite schreibt ihre Punkte nur in eine bestehende Sitzung.
  const { AnalyseDaten } = await import("../apps/lifeskin-astra/astra-daten.js");
  const urls = [];
  const daten = new AnalyseDaten({ fetchFn: async (url) => { urls.push(url); return { ok: true }; }, kennung: "a".repeat(20) });
  await daten.sichtSchreiben({ v: 1, s4: true });
  assert.match(urls[0], /updateMask\.fieldPaths=timings\.terapia\.s4/);
  assert.match(urls[0], /currentDocument\.exists=true/);
});
