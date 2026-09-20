// DER WEG OHNE SCAN, VON DER WAHL BIS ZUR WARTESEITE.
//
// GEMESSEN, NICHT BEFUERCHTET: 184 von 222 gingen bei "Skanimi" weg. Fuer
// die, die die Kamera nicht freigeben wollen, gibt es seitdem einen
// zweiten Weg - und der fuehrte bis hierher unmittelbar an Name und Alter
// und von dort auf die Warteseite. Dr. Gashi bekam damit einen Fall ohne
// ein einziges Bild UND ohne eine einzige Auskunft: einen Namen, ein
// Alter, sonst nichts. Ein solcher Fall ist nicht zu beantworten, und ein
// Weg, der nicht zu beantworten ist, ist kein zweiter Weg.
//
// Jetzt stehen vier Fragen davor und die Nummer dahinter. Diese Datei
// haelt fest, was daran auseinanderlaufen kann:
//
//   1. DIE REIHENFOLGE. Fragen, dann Name und Alter, dann die Nummer -
//      und erst danach die Uebergabe.
//   2. WAS ANKOMMT. Der Fragenbildschirm wird auf diesem Weg ZWEIMAL
//      benutzt. Faengt der zweite Durchgang mit einer leeren Antwortkarte
//      an, loescht sein erster Schreibvorgang alles, was der erste
//      gesammelt hat - und zwar genau dann, wenn der Fall sonst fertig
//      waere.
//   3. DIE SCHRITTFOLGE. Jede Frage zaehlt, und jeder Schritt muss einer
//      sein, den die Firestore-Regeln kennen: hasOnly() weist sonst den
//      GANZEN Schreibvorgang ab, lautlos.
//   4. WAS DIE WARTESEITE DANN SAGT - und was Heart zeigt.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

import * as texte from "../apps/lifeskin/lifeskin-content.js";
import * as pose from "../apps/lifeskin/lifeskin-pose.js";
import { FRAGEN_PA_SKANIM, FRAGEN_PA_SKANIM_NUMRI } from "../apps/lifeskin/lifeskin-content.js";
import { TEXTE } from "../apps/lifeskin-astra/astra-texte.js";
import { normalisiere } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderSitzungDetail } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { lies, ohneKommentare, methode } from "./lifeskin-quelle.mjs";

const REGELN = lies("firestore.rules");
const SITZUNG = ohneKommentare(lies("apps/lifeskin/lifeskin-session.js"));
const ASTRA = ohneKommentare(lies("apps/lifeskin-astra/astra.js"));
const ASTRA_HTML = lies("apps/lifeskin-astra/index.html");

// ---------------------------------------------------------------------------
// Der Pruefstand: die echten Methoden, nur DOM, Sitzung und Uhr ersetzt
// ---------------------------------------------------------------------------

const quelle = readFileSync(new URL("../apps/lifeskin/lifeskin-app.js", import.meta.url), "utf8")
  .replace(/^import[\s\S]*?;\n/gm, "")
  .replace(/^export /gm, "")
  .replace(/this\.#(\w+)/g, "this._$1")
  .replace(/^(  (?:async )?)#(\w+)\(/gm, "$1_$2(")
  + "\nglobalThis.TrichterTest = Trichter;";

// Ein Knoten, der genug kann: Text, Merkmale, Kinder. Mehr braucht der
// Fragenbildschirm nicht, und mehr wuerde vortaeuschen, dass hier ein
// Browser laeuft.
function knoten(id = "") {
  return {
    id, textContent: "", hidden: false, disabled: false, value: "", placeholder: "",
    dataset: {}, style: {}, attrs: {}, kinder: [], offsetWidth: 1,
    set innerHTML(_wert) { this.kinder = []; },
    get innerHTML() { return ""; },
    setAttribute(name, wert) { this.attrs[name] = String(wert); },
    getAttribute(name) { return this.attrs[name] ?? null; },
    removeAttribute(name) { delete this.attrs[name]; delete this.dataset[name.replace(/^data-/, "")]; },
    appendChild(kind) { this.kinder.push(kind); return kind; },
    focus() { this.fokussiert = true; },
    addEventListener(name, fn) { (this.horcher ||= new Map()).set(name, fn); },
    klick() { this.horcher?.get("click")?.(); }
  };
}

function pruefstand() {
  const nodes = new Map();
  const hol = (name) => {
    if (!nodes.has(name)) nodes.set(name, knoten(name));
    return nodes.get(name);
  };
  // Genau die Bildschirme der Landingpage: Sie ist die einzige Seite mit
  // Wahl UND Fragen UND Namensschirm, und nur dort gibt es diesen Weg.
  for (const name of ["#ls-wahl", "#ls-vorbereitung", "#ls-name", "#ls-fragen",
    "#ls-frageblatt", "#ls-fragewahl", "#ls-frageweiter", "#ls-frageneinleitung",
    "#ls-fragenzaehler", "#ls-fragetitel", "#ls-frageunter", "#ls-fragenzurueck",
    "#ls-fragefeld", "#ls-fragefehler", "#ls-namefeld", "#ls-nameweiter"]) hol(name);

  const document = {
    querySelector: (name) => nodes.get(name) || null,
    // Die Antwortknoepfe der laufenden Frage - mehr wird nicht gesucht.
    querySelectorAll: (name) => (name === "#ls-fragewahl .ls-wahl__knopf"
      ? nodes.get("#ls-fragewahl").kinder : []),
    createElement: () => knoten(),
    addEventListener() {}, documentElement: { dataset: {} }
  };

  // Die Sitzung: sie schreibt nichts, sie merkt sich, was geschrieben
  // wuerde. Genau darum geht es - was ankommt, nicht ob es ankommt.
  const schritte = [];
  const geschrieben = [];
  const sitzung = {
    berichtPfad: "/analiza/pruef",
    schritt(name, daten) { schritte.push([name, daten || null]); },
    ergaenze(daten) { geschrieben.push(daten); return Promise.resolve(true); },
    berichtAnlegen(daten) { this.bericht = daten; return Promise.resolve(true); }
  };

  const timer = [];
  const context = vm.createContext({
    ...texte, ...pose, document, console,
    window: { addEventListener() {}, scrollTo() {} },
    history: { state: null, replaceState() {}, pushState() {} },
    // Die Uhr laeuft nicht von allein: Die Pause nach einer angetippten
    // Antwort wird im Test ausgeloest, damit jeder Schritt sichtbar bleibt.
    setTimeout: (fn) => { timer.push(fn); return timer.length; },
    clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    requestAnimationFrame: (fn) => { timer.push(fn); return timer.length; },
    getComputedStyle: () => ({}),
    STANDARD_KONFIG: { sprache: "sq" }, MESS_BREITE: 384, __LIFESKIN_TEST__: true,
    Pixel: class { starte() { return false; } melde() {} meldeWeg() {} meldeAbgabe() {} meldeLead() {} },
    besteGuete: (kodiere) => ({ jpeg: kodiere(0.9), guete: 0.9 }),
    Flaechenkamera: class { starte() { return Promise.resolve(false); } stoppe() {} },
    fotoAusDatei: async () => null,
    Sitzung: class {},
    netzVorladen() {}, netzHolen: async () => null, netzStand: () => "aus",
    telefonPruefen: (wert) => {
      const ziffern = String(wert || "").replace(/[^\d]/g, "");
      if (!ziffern) return { ok: false, grund: "leer" };
      if (ziffern.length < 8) return { ok: false, grund: "kurz" };
      return { ok: true, nummer: `+383${ziffern.replace(/^0/, "")}` };
    },
    LIFESKIN_TELEFON_VORWAHL: "",
    // Im Kontext IST globalThis das Kontextobjekt selbst - hier eine
    // eigene Eigenschaft "globalThis" zu setzen, verdeckte das echte und
    // damit auch __LIFESKIN_TEST__.
    location: { assign() {}, replace() {} }
  });
  vm.runInContext(quelle, context);

  const app = new context.TrichterTest({ variante: "kurz" });
  app.sitzung = sitzung;
  // Die ECHTE Verdrahtung, nicht nachgebaute Aufrufe: Ein Knopf, an dem
  // kein Horcher haengt, ist im Browser eine kaputte Seite - und genau
  // das wuerde ein Test, der die Methoden direkt ruft, nie bemerken.
  app._ereignisse();
  // Der Bildschirmwechsel wird nur festgehalten: Was #zeige() im Browser
  // tut - Fortschrittsbalken, Verlauf, Karten - gehoert nicht hierher.
  const besucht = [];
  app.zeige = (name) => { app.aktiv = name; besucht.push(name); };

  const takt = () => { while (timer.length) timer.shift()(); };

  return { app, nodes, hol, schritte, geschrieben, sitzung, besucht, takt };
}

// Was im Kontext entsteht, traegt einen anderen Prototyp - und
// deepEqual aus node:assert/strict vergleicht ihn mit. Ein JSON-Umlauf
// macht daraus gewoehnliche Objekte, ohne einen Wert zu aendern.
const rein = (wert) => JSON.parse(JSON.stringify(wert));

// Eine Frage beantworten, so wie ein Finger es taete: den Knopf mit dieser
// Kennung antippen.
function tippe(p, antwortId) {
  const knopf = p.nodes.get("#ls-fragewahl").kinder.find((k) => k.dataset.antwort === antwortId);
  assert.ok(knopf, `Die Antwort "${antwortId}" steht nicht auf dem Bildschirm`);
  knopf.klick();
  p.takt();
}

// ---------------------------------------------------------------------------
// 1. Der ganze Weg, einmal durchgegangen
// ---------------------------------------------------------------------------

test("ohne Scan: vier Fragen, Name und Alter, die Nummer - und dann erst die Uebergabe", async () => {
  const p = pruefstand();
  p.app._wegWaehlen("pa-skanim");

  // Die Marke zuerst, dann der Typ, dann die Fragen.
  //
  // ZWEI SCHREIBVORGAENGE, NICHT EINER: hasOnly() weist das GANZE
  // Dokument ab, sobald ein Feld darin steht, das die Regel nicht kennt.
  // Ein brandneues Feld, das mit einem alten zusammen hinausgeht, nimmt
  // das alte mit - lautlos, denn der Trichter wartet auf kein Ja.
  //
  // Die alte Karte der Vorlage ("pa-skanim") fuehrt auf Trup: Dort wird
  // beschrieben statt gezeigt, und das ist, was sie immer war.
  assert.deepEqual(rein(p.geschrieben[0]), { paSkanim: true });
  assert.deepEqual(rein(p.geschrieben[1]), { typ: "trup" });
  assert.equal(p.app.aktiv, "fragen");
  assert.equal(p.nodes.get("#ls-frageneinleitung").textContent,
    texte.FRAGEN_TEXTE.einleitungPaSkanim.sq,
    "Ueber der ersten Frage steht der Satz des falschen Wegs");

  // Vier Fragen, in der Reihenfolge der Strecke.
  assert.equal(p.nodes.get("#ls-fragetitel").textContent, texte.t(FRAGEN_PA_SKANIM[0].titel, "sq"));
  tippe(p, "pucrrat");
  p.nodes.get("#ls-frageweiter").klick();
  p.takt();
  assert.equal(p.nodes.get("#ls-fragetitel").textContent, texte.t(FRAGEN_PA_SKANIM[1].titel, "sq"));
  tippe(p, "yndyrshme");
  assert.equal(p.nodes.get("#ls-fragetitel").textContent, texte.t(FRAGEN_PA_SKANIM[2].titel, "sq"));
  tippe(p, "muaj");
  assert.equal(p.nodes.get("#ls-fragetitel").textContent, texte.t(FRAGEN_PA_SKANIM[3].titel, "sq"));
  tippe(p, "asnjera");
  p.nodes.get("#ls-frageweiter").klick();
  p.takt();

  // Jetzt Name und Alter - und der Knopf bleibt zu, bis beides dasteht.
  assert.equal(p.app.aktiv, "name");
  assert.equal(p.nodes.get("#ls-nameweiter").disabled, true);
  p.app.zustand.name = "Arta";
  p.app._nameWeiterPruefen();
  assert.equal(p.nodes.get("#ls-nameweiter").disabled, true, "Der Knopf geht ohne Alter auf");
  p.app.zustand.altersgruppe = "25-34";
  p.app._nameWeiterPruefen();
  assert.equal(p.nodes.get("#ls-nameweiter").disabled, false);

  p.app._nameWeiter();
  p.takt();

  // Und zuletzt die Nummer, allein auf ihrem Bildschirm.
  assert.equal(p.app.aktiv, "fragen");
  assert.equal(p.nodes.get("#ls-fragetitel").textContent,
    texte.t(FRAGEN_PA_SKANIM_NUMRI[0].titel, "sq"));
  assert.equal(p.nodes.get("#ls-frageunter").textContent,
    texte.t(FRAGEN_PA_SKANIM_NUMRI[0].unter, "sq"),
    "Unter der Nummer steht der Satz des Wegs MIT Scan");
  assert.equal(p.nodes.get("#ls-frageneinleitung").textContent,
    texte.FRAGEN_TEXTE.einleitungNumri.sq);
  assert.equal(p.nodes.get("#ls-fragenzaehler").textContent, "",
    "\"Frage 1 von 1\" macht aus einer Zeile ein Formular");
  // Die Zifferntastatur, nicht die Buchstaben.
  assert.equal(p.nodes.get("#ls-fragefeld").type, "tel");

  // Eine unbrauchbare Nummer kommt nicht durch - und sagt, was fehlt.
  p.app.fragen.antworten.numri = "044";
  p.app._frageWeiter();
  assert.equal(p.app.aktiv, "fragen", "Eine zu kurze Nummer fuehrt weiter");
  assert.equal(p.nodes.get("#ls-fragefehler").textContent, texte.FRAGEN_TEXTE.telKurz.sq);

  p.app.fragen.antworten.numri = "044123456";
  p.app._frageWeiter();
  await new Promise((fertig) => queueMicrotask(fertig));

  // DIE ANAMNESE TRAEGT ALLES - auch das, was der erste Durchgang
  // gesammelt hat. Faengt der zweite leer an, loescht er es hier.
  const letzte = p.geschrieben.filter((d) => d.anamnese).at(-1).anamnese;
  assert.deepEqual(rein(letzte), {
    anliegen: ["pucrrat"], lekura: "yndyrshme", kohezgjatja: "muaj",
    kujdesi: ["asnjera"], emri: "Arta", mosha: "25-34", numri: "044123456"
  });

  // Und die Nummer steht ausserdem in ihrem eigenen Feld, vereinheitlicht:
  // Dort sucht sie, wer anrufen will.
  const nummer = p.geschrieben.filter((d) => d.phone).at(-1);
  assert.equal(nummer.phone, "+38344123456");
  assert.equal(nummer.phoneConsent, true);

  // Die Uebergabe steht ganz am Ende, mit null Aufnahmen: Daran erkennt
  // die Warteseite den Weg ohne Scan.
  assert.equal(p.schritte.at(-1)[0], "result");
  assert.equal(p.sitzung.bericht.photos, 0);
  assert.equal(p.sitzung.bericht.name, "Arta");

  // Und die Aufbereitung kam auf diesem Weg nie: Sie zaehlt sieben
  // Sekunden lang Aufnahmen durch, die es hier nicht gibt.
  assert.ok(!p.besucht.includes("analyse"),
    "Der Weg ohne Scan laeuft durch die Aufbereitung");
});

// JEDE FRAGE ZAEHLT, und jeder Schritt muss einer sein, den die Regeln
// kennen. Ein Schrittname, der dort fehlt, laesst hasOnly() den GANZEN
// Schreibvorgang abweisen - lautlos, denn der naechste kommt wieder
// durch. Genau so sind hier dreimal Daten verschwunden.
test("jede Stufe dieses Wegs steht in der Schrittfolge und in den Regeln", () => {
  const p = pruefstand();
  p.app._wegWaehlen("pa-skanim");
  tippe(p, "njollat");
  p.nodes.get("#ls-frageweiter").klick();
  p.takt();
  tippe(p, "thate");
  tippe(p, "vit");
  tippe(p, "shtatzeni");
  p.nodes.get("#ls-frageweiter").klick();
  p.takt();
  p.app.zustand.name = "Arta";
  p.app.zustand.altersgruppe = "25-34";
  p.app._nameWeiter();
  p.takt();

  const gegangen = p.schritte.map(([name]) => name);
  assert.deepEqual(gegangen,
    ["pyetja1", "pyetja2", "pyetja3", "pyetja4", "emri", "numri"],
    "Der Weg ohne Scan zaehlt seine Fragen nicht einzeln");

  // Die Schrittfolge geht nie zurueck - also muessen die Stufen in dieser
  // Reihenfolge auch in lifeskin-session.js stehen.
  const liste = SITZUNG.slice(SITZUNG.indexOf("const SCHRITTE"), SITZUNG.indexOf("]);"));
  const bekannt = [...liste.matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]);
  let vorher = -1;
  for (const name of gegangen) {
    const platz = bekannt.indexOf(name);
    assert.ok(platz > -1, `Die Sitzung kennt den Schritt "${name}" nicht`);
    assert.ok(platz > vorher, `"${name}" steht in der Schrittfolge vor dem Schritt davor`);
    vorher = platz;
  }

  // Und die Regeln kennen sie ebenfalls - sonst kommt nichts davon an.
  const erlaubt = REGELN.slice(REGELN.indexOf("lifeskinSessionShapeOk"));
  const schrittliste = erlaubt.slice(erlaubt.indexOf("data.step in ["), erlaubt.indexOf("]))"));
  for (const name of [...gegangen, "wahl", "result"]) {
    assert.ok(schrittliste.includes(`"${name}"`),
      `Die Firestore-Regeln kennen den Schritt "${name}" nicht - der Schreibvorgang geht still verloren`);
  }
});

// WER SICH VERTIPPT HAT, MUSS ZURUECK KOENNEN. Ein Weg ohne Rueckweg
// kostet genau die Leute, die genau hinsehen.
test("der Pfeil fuehrt aus jeder Strecke dorthin zurueck, wo sie angefangen hat", () => {
  const p = pruefstand();
  p.app._wegWaehlen("pa-skanim");
  // Vor der ERSTEN Frage steht er auch da - dahinter liegt die Wahl.
  assert.equal(p.nodes.get("#ls-fragenzurueck").hidden, false);
  p.app._frageZurueck();
  assert.equal(p.app.aktiv, "wahl");

  // Und aus der Nummer zurueck an Name und Alter.
  p.app.zustand.paSkanim = true;
  p.app.zustand.name = "Arta";
  p.app.zustand.altersgruppe = "25-34";
  p.app._nameWeiter();
  p.takt();
  assert.equal(p.nodes.get("#ls-fragenzurueck").hidden, false);
  p.app._frageZurueck();
  assert.equal(p.app.aktiv, "name");

  // Die Antworten bleiben dabei stehen: Wer zurueckgeht, um eine zu
  // aendern, soll die anderen nicht noch einmal antippen muessen.
  assert.equal(p.app.fragen.antworten.emri, "Arta");
});

// ---------------------------------------------------------------------------
// 2. Die Warteseite
// ---------------------------------------------------------------------------

test("ohne Scan sagt die Warteseite, was wirklich kommt: Dr. Gashi schreibt", () => {
  const zeigen = methode(ASTRA, "#pritZeigen");
  assert.match(zeigen, /const ohneScan = this\.daten\.photos === 0;/,
    "Der Weg wird nicht mehr an einer ausdruecklichen Null erkannt");
  // Nur, solange sie ihn auch erreichen kann: Ein Versprechen ohne Weg
  // stuende ueber dem Tor, das nach der Nummer fragt.
  // UND SEIT DER MENYRA ENTSCHEIDET DER TYP, nicht die Zahl der Bilder:
  // Wer sein Koerperproblem beschreibt UND ein Foto dazulegt, hat eine
  // Aufnahme - und wartet trotzdem auf eine Nachricht, nicht auf eine
  // Analyse auf dieser Seite. Ein Fall ohne Typ ist einer von vorher;
  // dort entscheidet weiter die ausdrueckliche Null.
  assert.match(zeigen, /const perWhatsApp = typ === "trup" \|\| typ === "pytje" \|\| \(!typ && ohneScan\);/,
    "Die Warteseite unterscheidet die vier Wege nicht");
  assert.match(zeigen, /const wa = perWhatsApp && this\.erreichbar;/,
    "Die Ueberschrift verspricht WhatsApp auch ohne einen Weg dorthin");
  assert.match(zeigen, /this\.text\(wa \? "pritTitelWa" : "pritTitel", \{ name \}\)/);
  assert.match(zeigen, /this\.text\(wa \? "pritTitelWaOhne" : "pritTitelOhne"\)/);

  for (const schluessel of ["pritTitelWa", "pritTitelWaOhne", "pritGatiNumriWa", "pritShpejtTitel"]) {
    assert.ok(TEXTE[schluessel]?.sq && TEXTE[schluessel]?.de,
      `${schluessel} fehlt in einer Sprache`);
  }
  assert.match(TEXTE.pritTitelWa.sq, /WhatsApp/);
  assert.match(TEXTE.pritTitelWa.sq, /\{name\}/, "Der Name wird nicht eingesetzt");
  assert.match(TEXTE.pritGatiNumriWa.sq, /\{numri\}/);
});

test("der WhatsApp-Knopf verschwindet nicht mehr mit dem Tor", () => {
  // Er stand NUR im Tor - also nur so lange, wie niemand wusste, wie man
  // diesen Menschen erreicht. Sobald die Nummer dastand, war der einzige
  // Weg zu einem Menschen weg. Auf dem Weg ohne Scan trifft das jeden:
  // Dort wird die Nummer schon im Trichter verlangt.
  assert.match(ASTRA_HTML, /<div class="wait-faster" id="an-pritshpejt" hidden>/,
    "Der zweite WhatsApp-Knopf fehlt im Aufbau");
  // Er steht HINTER der Bestaetigung: Zwei gleich grosse WhatsApp-Knoepfe
  // waeren zwei Aufforderungen, und die zweite entwertet die erste.
  assert.ok(ASTRA_HTML.indexOf('id="an-pritgati"') < ASTRA_HTML.indexOf('id="an-pritshpejt"'),
    "Der schnellere Weg steht ueber der Bestaetigung");
  assert.match(ASTRA_HTML, /id="an-pritshpejtwa"[\s\S]{0,120}rel="noopener"/);

  const schneller = methode(ASTRA, "#pritSchneller");
  // KEINE ZWEITE ADRESSE: Sie ist dieselbe wie die des ersten Knopfes,
  // mitsamt der Fallnummer im Text. Zwei Stellen, die denselben Link
  // bauen, waeren frueher oder spaeter zwei verschiedene Links.
  assert.match(schneller, /\$\("#an-pritwa"\)\?\.getAttribute\("href"\)/,
    "Der zweite Knopf baut seine Adresse selbst");
  assert.match(schneller, /if \(!knopf \|\| !adresse \|\| adresse === "#"\)/,
    "Ohne hinterlegte WhatsApp-Nummer fuehrt der Knopf ins Leere");

  // Sichtbar genau dann, wenn das Tor zugeht - dort haengt er, nicht am Weg.
  const tor = methode(ASTRA, "#pritTorPruefen");
  assert.match(tor, /this\.#pritSchneller\(Boolean\(nummer\) \|\| wa\);/);
  assert.ok(tor.indexOf("#pritSchneller") < tor.indexOf('zeigen($("#an-pritgate"), true)'),
    "Bei einem Fall ohne Kontakt bleibt der zweite Knopf stehen, wo schon einer ist");

  // Und die Adresse des ersten Knopfes steht, bevor der zweite sie liest.
  const anzeigen = methode(ASTRA, "#pritZeigen");
  assert.ok(anzeigen.indexOf("this.#pritWhatsapp()") < anzeigen.indexOf("this.#pritTorPruefen()"),
    "Der zweite Knopf liest die Adresse, bevor sie gesetzt ist");
});

// ---------------------------------------------------------------------------
// 3. Heart: was der Kunde geantwortet hat
// ---------------------------------------------------------------------------

test("in Heart steht bei jedem Fall, was der Patient geantwortet hat", () => {
  const sitzung = normalisiere("abc", {
    step: "result", name: "Arta", ageBand: "25-34", phone: "+38344123456", paSkanim: true,
    anamnese: {
      anliegen: ["pucrrat", "njollat"], lekura: "yndyrshme",
      kohezgjatja: "muaj", kujdesi: ["asnjera"], emri: "Arta", mosha: "25-34"
    }
  });
  const html = renderSitzungDetail(sitzung, {}, "", [], null);

  assert.match(html, /Seine Antworten/, "Der Block fehlt in der Akte");
  // Die Frage auf Deutsch, die Antwort in beiden Sprachen: Albanisch ist,
  // was der Patient wirklich angetippt hat.
  assert.match(html, /Was stört Sie am meisten\?/);
  assert.match(html, /Pickel; Dunkle Flecken/);
  assert.match(html, /Puçrrat; Njollat e errëta/);
  assert.match(html, /Seit wann haben Sie das\?/);
  assert.match(html, /Einige Monate/);
  // Und er steht VOR dem Befund: Er wird gelesen, bevor geschrieben wird -
  // und der Prompt-Knopf steht unmittelbar darunter.
  assert.ok(html.indexOf("Seine Antworten") < html.indexOf("Prompt v5"),
    "Die Antworten stehen hinter dem Befundbogen");

  // Ein Fall ohne Antworten laesst den Block nicht verschwinden: Ein
  // Block, der einfach fehlt, laesst offen, ob es nichts gab oder ob
  // Heart nichts gefunden hat.
  const leer = renderSitzungDetail(normalisiere("leer", { step: "wahl" }), {}, "", [], null);
  assert.match(leer, /Seine Antworten/);
  assert.match(leer, /keine Antworten vor/);
});
