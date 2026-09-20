// Der Prompt v5.3 - fuellt er die Seite, und haelt er die Namen draussen?
//
// ZWEI FEHLER, DIE AUF DER SEITE NICHT AUFFALLEN, und genau darum stehen
// sie hier:
//
//   EIN LEERES FELD SIEHT MAN NICHT. Die Analyseseite blendet aus, was
//   leer ankommt - die lateinische Zeile, das Schweregradwort, den ganzen
//   Verlaufsabschnitt. Es entsteht keine Luecke, kein Platzhalter, nichts:
//   Die Seite sieht fertig aus und ist es nicht. Ein Beispielblock mit
//   einem leeren Feld wird deshalb zu einem leeren Feld bei jedem Patienten,
//   denn ein Modell baut die naechstliegende vollstaendige Vorlage nach.
//
//   EIN PLATZHALTERNAME WIRD ABGESCHRIEBEN. In v5.1 stand ein
//   ausgeschriebener Vorname in hyrja.pacienti, und das durchgerechnete
//   Beispiel redete den Patienten damit an. Der Befund eines Menschen mit
//   dem Namen eines anderen sieht bis zu dem Namen aus wie der richtige.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { pruefeRaportV3, DIAGNOSE_IDS, PARAMETER_IDS } from "../shared/lifeskin-raport-v3.js";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const ROH = lies("docs/lifeskin-prompt-v5.json");
const PROMPT = JSON.parse(ROH);
const ASTRA = lies("apps/lifeskin-astra/astra.js");
const BEISPIELE = ["skema_e_pergjigjes", "shembull_i_pergjigjes"];

// ---------------------------------------------------------------------------
// Die Beispiele sind die Vorlage - also muessen sie durch den Vertrag gehen
// ---------------------------------------------------------------------------

test("beide Beispielbloecke sind gueltige v3-Antworten", () => {
  // Wenn die Vorlage selbst durchfaellt, faellt jede nachgebaute Antwort
  // auch durch - und Heart zeigt dem Arzt nur eine Fehlermeldung.
  for (const name of BEISPIELE) {
    assert.deepEqual(pruefeRaportV3(PROMPT[name]), [], `${name} ist keine gueltige Antwort`);
  }
});

test("die Beispiele lassen kein Feld leer, das die Seite zeigt", () => {
  for (const name of BEISPIELE) {
    const b = PROMPT[name];
    assert.ok(b.diagnoza.latinisht, `${name}: die lateinische Zeile fehlt - die Seite blendet sie aus`);
    assert.ok(b.diagnoza.emri && b.diagnoza.niveli_emri, `${name}: die Einordnung ist unvollstaendig`);
    assert.equal(b.shpjegimi.length, 2, `${name}: es sind nicht genau zwei Erklaerungsabsaetze`);
    for (const feld of ["zbehet", "nuk_zbehet", "pas_6_muajsh"]) {
      assert.ok(b.pa_kujdes[feld], `${name}: pa_kujdes.${feld} ist leer - der ganze Abschnitt verschwindet`);
    }
    assert.ok(b.synimi_28 && b.keshilla, `${name}: Ziel oder Rat fehlt`);
    assert.ok(b.gjetjet.sipas_zonave.length >= 3, `${name}: weniger als drei Zonenzeilen`);
    assert.ok(b.termat.length >= 3, `${name}: weniger als drei Begriffe`);
    assert.ok(b.nevojat.length >= 1, `${name}: kein einziger Bedarf`);
    assert.equal(b.nevojat.filter((n) => n.roli === "kryesor").length, 1,
      `${name}: es gibt nicht genau einen Hauptbedarf`);
  }
});

test("alle zehn Parameter tragen einen Satz ueber dieses Gesicht", () => {
  for (const name of BEISPIELE) {
    const b = PROMPT[name];
    assert.deepEqual(b.parametrat.map((p) => p.id).sort(), [...PARAMETER_IDS].sort(),
      `${name}: es fehlen Parameter`);
    for (const p of b.parametrat) {
      assert.ok(p.vlera.trim().length >= 12, `${name}: ${p.id} hat kein aussagekraeftiges vlera`);
      // Der Prompt fuehrt diesen Satz selbst als schlechtes Beispiel - er
      // sagt nichts ueber dieses Gesicht, und er stand trotzdem im Block.
      assert.notEqual(p.vlera.trim(), "nuk përcaktohet nga pamja",
        `${name}: ${p.id} beschreibt nichts, es weicht nur aus`);
    }
  }
});

// ---------------------------------------------------------------------------
// Die lateinische Zeile
// ---------------------------------------------------------------------------

test("fuer jede Einordnung steht eine Bezeichnung in der Tabelle", () => {
  const tabelle = PROMPT.diagnoza_latinisht?.tabela;
  assert.ok(tabelle, "Die Tabelle fehlt - dann bildet das Modell wieder selbst Latein");
  // Dieselben Kennungen wie im Vertrag, keine mehr und keine weniger: Eine
  // fehlende faellt erst beim Patienten auf, den sie betrifft.
  assert.deepEqual(Object.keys(tabelle).sort(), [...DIAGNOSE_IDS].sort(),
    "Die Tabelle deckt nicht genau die erlaubten Einordnungen ab");
  for (const [id, wert] of Object.entries(tabelle)) {
    if (id === "tjeter") continue;
    assert.ok(wert.trim().length >= 6, `${id} hat keine Bezeichnung`);
    assert.ok(wert.length <= 120, `${id}: die Bezeichnung ist laenger als das Feld erlaubt`);
  }
  // Und fuer tjeter steht da, was statt der Tabelle gilt.
  assert.equal(tabelle.tjeter, "", "tjeter traegt eine feste Bezeichnung, obwohl nichts feststeht");
  assert.match(PROMPT.diagnoza_latinisht.tjeter, /fuehrenden BEFUNDS/i,
    "Fuer tjeter steht nicht, woher die Bezeichnung dann kommt");
});

test("die Beispiele schreiben die Tabelle ab, sie erfinden nichts", () => {
  const tabelle = PROMPT.diagnoza_latinisht.tabela;
  for (const name of BEISPIELE) {
    const { id, latinisht } = PROMPT[name].diagnoza;
    assert.equal(latinisht, tabelle[id],
      `${name}: die lateinische Zeile weicht von der Tabelle ab - genau so entsteht erfundenes Latein`);
  }
});

test("der Prompt sagt, dass die Zeile nie leer bleibt", () => {
  assert.match(PROMPT.kufijte_e_gjatesise["diagnoza.latinisht"], /WIRD IMMER GEFUELLT/,
    "Die Laengenregel erlaubt die Zeile wieder leer");
  assert.match(PROMPT.gjuha.ku_shkon_termi, /nie leer, nie selbst gebildet/,
    "Die Sprachregel nennt die Tabelle nicht mehr als einzige Quelle");
  // Und der Grund steht dabei: Die Seite blendet die Zeile aus. Wer das
  // nicht weiss, haelt ein leeres Feld fuer folgenlos.
  const karte = PROMPT.pamja_e_faqes.pjesa_1_rezultati["diagnoza.emri + diagnoza.latinisht + diagnoza.niveli_emri"];
  assert.match(karte, /VERSCHWINDET, WENN SIE LEER IST/,
    "In der Karte steht nicht, dass leere Zeilen ausgeblendet werden");
  // Die Karte behauptet etwas ueber die Seite - also gegen die Seite pruefen.
  assert.match(ASTRA, /zeigen\(\$\("#an-diagnozalat"\), Boolean\(lat\)\)/,
    "Die Seite blendet die lateinische Zeile nicht mehr aus - dann stimmt die Karte nicht mehr");
});

// ---------------------------------------------------------------------------
// Kein Name, nirgends
// ---------------------------------------------------------------------------

test("im Prompt steht kein Patientenname", () => {
  // Ein Platzhaltername wird abgeschrieben. Danach traegt der Befund eines
  // Menschen den Namen eines anderen - und sieht bis dahin richtig aus.
  assert.equal(PROMPT.hyrja.pacienti.emri, "", "In hyrja.pacienti steht wieder ein Name");
  assert.equal(PROMPT.hyrja.pacienti.gjinia, "", "In hyrja.pacienti steht wieder ein Beispielwert");
  assert.equal(PROMPT.hyrja.pacienti.mosha, null, "In hyrja.pacienti steht wieder ein Beispielalter");
  for (const name of ["VALMIRE", "Valmire", "valmire"]) {
    assert.ok(!ROH.includes(name), `Der Name ${name} steht noch im Prompt`);
  }
});

test("der Prompt verbietet den Namen in der Antwort", () => {
  assert.match(PROMPT.gjuha.personalizimi, /KEIN NAME IN\s+KEINEM FELD/,
    "Die Sprachregel erlaubt den Namen wieder");
  assert.ok(!/Der Name der Patientin hoechstens einmal/.test(PROMPT.gjuha.personalizimi),
    "Die alte Regel, die den Namen einmal erlaubte, steht noch da");
  const schritte = PROMPT.kontrolli_para_pergjigjes.join("\n");
  assert.match(schritte, /SCHRITT \d+ - KEIN NAME/,
    "Die Schlusskontrolle sucht nicht nach Namen");
  // Und die Eingabe sagt, wofuer der Name ueberhaupt mitkommt.
  assert.match(PROMPT.hyrja.shenim_pacienti, /gehoert in KEIN Feld deiner Antwort/,
    "Bei der Eingabe steht nicht, dass der Name nicht in die Antwort gehoert");
});

test("in den Beispielen redet niemand den Patienten an", () => {
  // Grossgeschriebene Woerter mitten im Satz sind die Spur eines Namens.
  const verdaechtig = /(^|[\s,.;:!?"„(])([A-ZÇË][a-zçë]{2,})(?=[\s,.;:!?"“)]|$)/g;
  const erlaubt = new Set([
    "Balli", "Faqet", "Hunda", "Mjekra", "Poret", "Pore", "Komedonet", "Tekstura",
    "Njollat", "Skuqja", "Kokrrizat", "Pas", "Shmangni", "Mos", "Disa", "Acne",
    "Seborrhoea", "Dermatitis", "Melasma", "Rosacea", "Xerosis", "Cicatrices",
    "Cutis", "Hyperpigmentatio", "Pori", "Nga", "Sa", "Ajo", "Kjo", "Ato", "Ka",
    "Puçrra", "Eritema", "Zona", "Vlera", "Kur", "Ky", "Ne", "Te"
  ]);
  for (const name of BEISPIELE) {
    const b = PROMPT[name];
    const texte = [
      b.gjetjet.permbledhja, b.ekzaminimi, b.keshilla, b.synimi_28,
      ...b.shpjegimi, ...Object.values(b.pa_kujdes),
      ...b.gjetjet.sipas_zonave.map((z) => z.teksti),
      ...b.termat.map((t) => t.te_ju), ...b.nevojat.map((n) => n.teksti)
    ];
    for (const text of texte) {
      for (const treffer of String(text).matchAll(verdaechtig)) {
        const wort = treffer[2];
        const satzanfang = treffer.index === 0 || /[.!?]\s+$/.test(String(text).slice(0, treffer.index + 1));
        if (satzanfang || erlaubt.has(wort)) continue;
        assert.fail(`${name}: "${wort}" steht mitten im Satz gross - das sieht nach einem Namen aus`);
      }
    }
  }
});

// ---------------------------------------------------------------------------
// Die Vollstaendigkeit steht als Regel da, nicht nur im Beispiel
// ---------------------------------------------------------------------------

test("der Prompt verlangt die Vollstaendigkeit ausdruecklich", () => {
  const k = PROMPT.kufijte_e_gjatesise;
  assert.match(k["gjetjet.sipas_zonave[]"], /MINDESTENS DREI/, "Fuer die Zonenzeilen fehlt die Untergrenze");
  assert.match(k["termat[]"], /MINDESTENS DREI/, "Fuer die Begriffe fehlt die Untergrenze");
  assert.match(k["nevojat[]"], /MINDESTENS EIN/, "Fuer den Bedarf fehlt die Untergrenze");
  const schritte = PROMPT.kontrolli_para_pergjigjes.join("\n");
  assert.match(schritte, /SCHRITT \d+ - KEIN LEERES FELD, DAS DIE SEITE ZEIGT/,
    "Die Schlusskontrolle prueft die Vollstaendigkeit nicht mehr");
  assert.match(PROMPT.roli, /Ein leeres Feld faellt auf der Seite nicht als Luecke auf/,
    "Der Auftrag sagt nicht mehr, warum ein leeres Feld gefaehrlich ist");
});

test("die Schemaversion bleibt 3 - v5.3 ist die Prompt-Version", () => {
  // Wer hier eine Zahl hochzaehlt, bricht shared/lifeskin-raport-v3.js.
  for (const name of BEISPIELE) {
    assert.equal(PROMPT[name].schema_version, 3, `${name}: falsche Schemaversion`);
  }
  assert.match(PROMPT._lexo_kete_para[0], /v5\.3/, "Die Kopfnote nennt die neue Fassung nicht");
});

// ---------------------------------------------------------------------------
// Kein Feld ohne Regel
// ---------------------------------------------------------------------------
//
// Ein Feld, zu dem nichts dasteht, fuellt das Modell nach Gefuehl: mal zwei
// Woerter, mal einen Absatz, bei jedem Patienten anders. Auf der Seite sieht
// das aus wie Willkuer - und genau daran erkennt ein Leser, dass niemand
// hingesehen hat.
//
// Gefunden wurden so sechs Luecken auf einmal, darunter parametrat[].emri
// und diagnoza.emri: beide stehen auf der Seite.

test("jedes Textfeld des Schemas hat eine Laengenregel", () => {
  const grenzen = Object.keys(PROMPT.kufijte_e_gjatesise);
  const felder = (wert, pfad = "") => {
    if (Array.isArray(wert)) return felder(wert[0] ?? "", `${pfad}[]`);
    if (wert && typeof wert === "object") {
      return Object.entries(wert).flatMap(([k, v]) => felder(v, pfad ? `${pfad}.${k}` : k));
    }
    return [pfad];
  };
  // Zahlen und feste Kennungen brauchen keine Laenge - sie sind im Vertrag
  // festgelegt und werden dort geprueft.
  const frei = felder(PROMPT.skema_e_pergjigjes).filter((f) =>
    f && !/(schema_version|\.id|\.shkalla|\.niveli|statusi)$/.test(f) && !f.startsWith("raporti."));
  assert.ok(frei.length >= 25, `Zu wenige Felder gefunden (${frei.length}) - laeuft die Suche noch?`);

  const ohne = frei.filter((feld) =>
    !grenzen.some((g) => feld === g || feld.startsWith(g.replace(/\*$/, "")) || g.startsWith(feld)));
  assert.deepEqual(ohne, [], "Diese Felder haben keine Laengenregel - das Modell fuellt sie nach Gefuehl");
});

// Ein leeres Feld im durchgerechneten Beispiel wird zu einem leeren Feld bei
// jedem Patienten: Ein Modell baut die naechstliegende vollstaendige Vorlage
// nach. Wo eines leer BLEIBEN soll, muss die Regel das ausdruecklich sagen.
test("was im Beispiel leer bleibt, ist auch als leer vorgeschrieben", () => {
  const leer = [];
  for (const [i, p] of PROMPT.shembull_i_pergjigjes.parametrat.entries()) {
    for (const [feld, wert] of Object.entries(p)) {
      if (wert === "" ) leer.push(`parametrat[${i}].${feld}`);
    }
  }
  for (const eintrag of leer) {
    const feld = eintrag.replace(/\[\d+\]/, "[]");
    const regel = PROMPT.kufijte_e_gjatesise[feld] || "";
    assert.match(regel, /BLEIBT LEER|NUR füllen|oder leer/,
      `${eintrag} ist leer, die Regel sagt aber nicht, dass es leer bleiben darf`);
  }
});
