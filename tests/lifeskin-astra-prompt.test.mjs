// Der Prompt und die Seite muessen dasselbe meinen.
//
// Der Prompt v4 traegt eine Karte (pamja_e_faqes), die sagt, wohin jedes
// Feld auf der Analyseseite faellt. Diese Karte ist das einzige, was einen
// Schreibenden die GEWICHTUNG eines Satzes erkennen laesst: Was in der
// gruenen Ergebnisflaeche steht, liest jeder; was in einem Aufklapper
// steht, liest der, der nachsieht.
//
// Eine Karte, die nicht stimmt, ist schlimmer als keine - sie laesst
// jemanden Muehe in ein Feld stecken, das niemand sieht, und ein Feld
// leer lassen, das ganz oben steht. Deshalb prueft dieser Test sie in
// BEIDE Richtungen gegen den Ablauf der Seite:
//
//   1. Jedes Feld, das die Seite liest, steht in der Karte.
//   2. Kein Feld, das die Karte als "wird nicht gezeigt" fuehrt, wird
//      doch gelesen.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const lies = (p) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const PROMPT = JSON.parse(lies("docs/lifeskin-prompt.json"));
const ASTRA_JS = lies("apps/lifeskin-astra/astra.js");
const KATALOG = lies("apps/lifeskin/lifeskin-catalog.js");

// Der Prompt schreibt Unterstrich-Namen, Heart legt sie in Binnenmajuskel
// ab. Diese Tabelle ist die Uebersetzung - und gleichzeitig die Liste
// dessen, worauf die Seite ueberhaupt zugreift.
const UEBERSETZUNG = Object.freeze({
  "gjetjet.gjetja_kryesore": "gjetjaKryesore",
  "gjetjet.gjetja_dyta": "gjetjaDyta",
  "gjetjet.permbledhja": "gjetjet",
  "gjetjet.sipas_zonave": "zonaLista",
  "diagnoza.emri": "diagnoza",
  "diagnoza.latinisht": "diagnozaLat",
  "diagnoza.niveli_emri": "niveliEmri",
  "diagnoza.niveli": "niveli",
  "ekzaminimi": "ekzaminimi",
  "shpjegimi": "shpjegimi",
  "pa_kujdes": "paKujdes",
  "keshilla": "keshilla",
  "synimi_28": "synimi28",
  "termat": "termat",
  "nevojat": "nevojat",
  "parametrat": "parametrat",
  "raporti.parametrat_e_vleresuar": "parametratVleresuar",
  "vleresimi.statusi": "vleresimi"
});

// Was der Ablauf wirklich anfasst.
function gelesen() {
  return new Set([...ASTRA_JS.matchAll(/this\.raport\.([a-zA-Z_0-9]+)/g)].map((m) => m[1]));
}

const karte = () => JSON.stringify(PROMPT.pamja_e_faqes);

test("der Prompt ist v4 und aendert die Schemaversion nicht", () => {
  // v4 ist die PROMPT-Version. Wer daraus eine Schemaversion macht, bricht
  // shared/lifeskin-raport-v3.js und jeden Bericht, der schon beim
  // Patienten liegt.
  assert.match(PROMPT._lexo_kete_para.join(" "), /Prompt v4/);
  assert.match(PROMPT._lexo_kete_para.join(" "), /nicht die Schemaversion/);
  assert.equal(PROMPT.skema_e_pergjigjes.schema_version, 3);
  assert.equal(PROMPT.shembull_i_pergjigjes.schema_version, 3);
});

test("der Prompt traegt eine Karte, wohin die Felder auf der Seite fallen", () => {
  const k = PROMPT.pamja_e_faqes;
  assert.ok(k, "pamja_e_faqes fehlt - dann schreibt jemand blind");
  for (const teil of ["pjesa_1_rezultati", "pjesa_2_gjetjet", "pjesa_3_plani",
    "pjesa_5_analiza_e_plote", "nuk_shfaqen"]) {
    assert.ok(k[teil], `der Karte fehlt ${teil}`);
  }
});

test("jedes Feld, das die Seite liest, steht in der Karte", () => {
  // Sonst schreibt jemand einen Satz, ohne zu wissen, dass er ganz oben
  // landet - oder laesst ihn weg, weil er ihn fuer unsichtbar haelt.
  const liest = gelesen();
  // Von Heart gesetzt, nicht vom Modell - die gehoeren nicht in die Karte.
  const vonHeart = new Set(["schemaVersion", "aerztlichGeprueft"]);
  const fehlend = [];
  for (const [feld, gespeichert] of Object.entries(UEBERSETZUNG)) {
    if (!liest.has(gespeichert)) continue;
    if (!karte().includes(feld)) fehlend.push(feld);
  }
  assert.deepEqual(fehlend, [], `diese gelesenen Felder fehlen in der Karte: ${fehlend.join(", ")}`);

  // Und umgekehrt: nichts wird gelesen, was die Tabelle nicht kennt.
  const unbekannt = [...liest].filter((x) => !vonHeart.has(x)
    && !Object.values(UEBERSETZUNG).includes(x));
  assert.deepEqual(unbekannt, [],
    `die Seite liest Felder, die diese Tabelle nicht kennt: ${unbekannt.join(", ")}`);
});

test("die Karte nennt nichts als unsichtbar, was doch gelesen wird", () => {
  // Eine Karte, die luegt, ist schlimmer als keine.
  const liest = gelesen();
  const unsichtbar = PROMPT.pamja_e_faqes.nuk_shfaqen;
  // EXAKTE Namen, nicht Teilstrings: "nevojat[].kerkon" sagt nichts
  // darueber, ob nevojat als Liste gelesen wird - und genau so hat dieser
  // Test zuerst "nevojat" und "parametrat" angezeigt, die beide sehr wohl
  // gelesen werden.
  const genannt = new Set(
    Object.keys(unsichtbar)
      .flatMap((k) => k.split("/").map((x) => x.trim()))
      .filter((x) => x && x !== "shenim")
  );
  const luegen = [];
  for (const [feld, gespeichert] of Object.entries(UEBERSETZUNG)) {
    if (!genannt.has(feld)) continue;
    // Ein Eintrag, der sich selbst auf schema_version 3 einschraenkt,
    // darf im Rueckfallpfad fuer alte Befunde vorkommen - dafuer gibt es
    // den naechsten Test.
    if (feld === "gjetjet.gjetja_dyta"
      && /schema_version 3/.test(unsichtbar[feld] || "")) continue;
    if (liest.has(gespeichert)) luegen.push(feld);
  }
  assert.deepEqual(luegen, [],
    `als unsichtbar gefuehrt, aber gelesen: ${luegen.join(", ")}`);
});

test("gjetja_dyta erreicht nur alte Befunde, und die Karte sagt das so", () => {
  // Der Ablauf liest das Feld - aber ausschliesslich im Rueckfall fuer
  // einen Befund OHNE Parameterliste. Bei schema_version 3 gibt es die
  // immer, also kommt der Zweig nie dran. Die Karte darf das deshalb
  // nicht als schlichtes "unsichtbar" verkaufen, sondern muss die
  // Bedingung nennen - sonst laesst jemand das Feld leer und wundert sich
  // bei einem alten Fall.
  const eintrag = PROMPT.pamja_e_faqes.nuk_shfaqen["gjetjet.gjetja_dyta"];
  assert.ok(eintrag, "die Karte kennt gjetja_dyta nicht");
  assert.match(eintrag, /schema_version 3/, "die Karte nennt die Bedingung nicht");
  assert.match(eintrag, /\{gjetja2\}/, "die Karte verschweigt den Platzhalter");

  // Und der Zweig ist wirklich der Rueckfall: Er steht NACH der Rueckgabe
  // der Parameterzeilen.
  const zeilen = ASTRA_JS.slice(ASTRA_JS.indexOf("#gjetjeZeilen() {"));
  const rueckgabe = zeilen.indexOf("if (mitGjetje.length) return mitGjetje;");
  const dyta = zeilen.indexOf("gjetjaDyta");
  assert.ok(rueckgabe > 0 && dyta > rueckgabe,
    "gjetja_dyta wird nicht nur im Rueckfall gelesen");

  // Der Platzhalter {gjetja2} wird von keiner Satzvorlage benutzt - genau
  // das behauptet die Karte.
  assert.ok(!KATALOG.includes("{gjetja2}"),
    "eine Satzvorlage benutzt jetzt {gjetja2} - die Karte ist ueberholt");
});

test("nevojat[].teksti ist als patientenseitig gekennzeichnet", () => {
  // Er sieht wie eine Notiz an Dr. Gashi aus und ist keine: Heart
  // uebernimmt ihn in das Satzfeld des angehakten Mittels, und von dort
  // steht er auf der Produktkarte unter "Pse në këtë plan" - die
  // persoenlichste Stelle der Seite.
  const plan = JSON.stringify(PROMPT.pamja_e_faqes.pjesa_3_plani);
  assert.ok(plan.includes("nevojat[].teksti"), "der Plan-Abschnitt kennt das Feld nicht");
  assert.match(plan, /GEZEIGT|gezeigt/, "die Karte sagt nicht, dass es gezeigt wird");
  assert.match(plan, /Pse në këtë plan/, "die Karte nennt die Stelle nicht");
  // Und die Seite zeigt den Satz tatsaechlich dort.
  assert.match(ASTRA_JS, /this\.text\("pseNePlan"\)/);
  // Und der Satz kommt wirklich aus dem Befund, nicht aus dem Katalog.
  assert.match(lies("apps/lifeskin-astra/astra-daten.js"), /satz: String\(ausBericht\.satz/);
  // Heart uebernimmt ihn dorthin.
  assert.match(lies("apps/mnyra-heart/heart.js"),
    /data-produkt-satz[\s\S]{0,40}n\.teksti/);
});

test("gjetja_kryesore beginnt klein - sie steht auch mitten im Satz", () => {
  // Zwei Plaetze mit entgegengesetztem Bedarf: Ueberschrift der
  // Ergebnisflaeche (die Seite macht den ersten Buchstaben selbst gross)
  // und Platzhalter {gjetja} in den Satzvorlagen der Mittel. Ein grosser
  // Anfangsbuchstabe stuende dort falsch.
  const regel = PROMPT.kufijte_e_gjatesise["gjetjet.gjetja_kryesore"];
  assert.ok(regel, "fuer den Hauptbefund steht keine Regel");
  assert.match(regel, /KLEINGESCHRIEBEN/);
  // Das Beispiel haelt sie ein.
  const beispiel = PROMPT.shembull_i_pergjigjes.gjetjet.gjetja_kryesore;
  assert.equal(beispiel[0], beispiel[0].toLowerCase(),
    `das Beispiel beginnt gross: "${beispiel}"`);
  assert.ok(beispiel.length >= 30 && beispiel.length <= 80,
    `das Beispiel ist ${beispiel.length} Zeichen lang`);
  assert.ok(!beispiel.endsWith("."), "das Beispiel endet mit einem Punkt");
  // Und die Seite macht den ersten Buchstaben wirklich selbst gross.
  assert.match(ASTRA_JS, /function grossAnfang/);
  assert.match(ASTRA_JS, /grossAnfang\(this\.raport\.gjetjaKryesore\)/);
  // Der Platzhalter wird auch wirklich benutzt - sonst waere die
  // Kleinschreibung eine Regel ohne Grund.
  assert.ok(KATALOG.includes("{gjetja}"), "keine Satzvorlage benutzt {gjetja} mehr");
});

test("die Karte nennt die drei sichtbaren Beobachtungen und ihre Quelle", () => {
  // Sie kommen aus parametrat, nach shkalla sortiert - nicht aus
  // gjetja_kryesore und gjetja_dyta wie in der frueheren Fassung.
  const teil = JSON.stringify(PROMPT.pamja_e_faqes.pjesa_2_gjetjet);
  assert.match(teil, /DREI|drei/, "die Karte nennt die Zahl nicht");
  assert.match(teil, /shkalla/, "die Karte nennt die Sortierung nicht");
  assert.ok(teil.includes("parametrat[].thjeshte"), "thjeshte fehlt");
  assert.ok(teil.includes("parametrat[].vlera"), "vlera fehlt");
  assert.ok(teil.includes("parametrat[].grada"), "grada fehlt");
  // Und die Seite macht es so.
  assert.match(ASTRA_JS, /Number\(b\.shkalla\) - Number\(a\.shkalla\)/);
  assert.match(ASTRA_JS, /\.slice\(0, 3\)/);
});

test("fuer thjeshte steht, wann es leer bleibt", () => {
  // Die Seite zeigt thjeshte, sonst emri. Sind beide gefuellt und fast
  // gleich, stehen zwei Namen untereinander, die sich wie ein Fehler
  // lesen - der Katalog nennt die Parameter schon alltagssprachlich.
  const regel = PROMPT.kufijte_e_gjatesise["parametrat[].thjeshte"];
  assert.ok(regel, "fuer thjeshte steht keine Regel");
  assert.match(regel, /leer/);
  assert.match(ASTRA_JS, /p\.thjeshte \|\| p\.emri/);
  // Und im Beispiel ist es leer, weil der Katalog alltagssprachlich ist.
  for (const par of PROMPT.shembull_i_pergjigjes.parametrat) {
    assert.ok(par.thjeshte.length <= 40, `${par.emri}: thjeshte zu lang`);
  }
});

test("die Schlusskontrolle prueft die neuen Punkte mit", () => {
  const kontrolle = PROMPT.kontrolli_para_pergjigjes.join(" ");
  assert.match(kontrolle, /gjetja_kryesore beginnt klein/);
  assert.match(kontrolle, /nevojat\[\]\.teksti ist an den Patienten gerichtet/);
  assert.match(kontrolle, /nuk_shfaqen/);
  assert.match(kontrolle, /kufijte_e_gjatesise/);
});

test("Heart gibt den Prompt aus, der hier liegt", () => {
  // Ein Knopf, der v3 verspricht und v4 liefert, ist schlimmer als
  // keiner - dann weiss niemand, welche Fassung im Umlauf ist.
  const heart = lies("apps/mnyra-heart/heart-lifeskin-render.js");
  assert.match(heart, /Prompt v4 für diesen Fall kopieren/);
  assert.match(lies("apps/mnyra-heart/heart.js"), /fetch\('\/docs\/lifeskin-prompt\.json'/);
});

// ---------------------------------------------------------------------------
// Der Weg der Produkte: Prompt -> Heart -> Freigabe -> Seite
// ---------------------------------------------------------------------------
//
// GEMESSEN, NICHT VERMUTET, und er war an zwei Stellen unterbrochen:
//
//   1. Der Prompt nannte nirgends die Kennungen des Katalogs, und
//      hyrja.produkte_te_verifikuara war eine leere Liste. Das Modell
//      schrieb produkt_id:"" - und Heart ueberspringt jeden Bedarf ohne
//      Kennung ("if (!n.produkt_id) continue"). Es wurde also nie ein
//      Mittel angekreuzt.
//   2. Wer daraufhin von Hand ankreuzte und freigab, verlor die Kreuze
//      still: Heart setzte die Liste auf Null, sobald die Angebotssperre
//      griff, und sagte bei schema_version 3 kein Wort dazu.

test("der Prompt nennt die Kennungen des Katalogs", async () => {
  const { STANDARD_PRODUKTE } = await import("../apps/lifeskin/lifeskin-catalog.js");
  const katalog = new Set(STANDARD_PRODUKTE.map((p) => String(p.id)));

  const erlaubt = PROMPT.produkt_id_e_lejuar;
  assert.ok(Array.isArray(erlaubt) && erlaubt.length,
    "ohne erlaubte Kennungen raet das Modell oder laesst produkt_id leer");
  assert.deepEqual([...erlaubt].sort(), [...katalog].sort(),
    "die erlaubten Kennungen und der Katalog laufen auseinander");

  // Und dieselben Kennungen stehen mit ihrer Aufgabe in hyrja, damit das
  // Modell ueberhaupt zuordnen kann.
  const verifiziert = PROMPT.hyrja.produkte_te_verifikuara;
  assert.ok(verifiziert.length === katalog.size,
    `hyrja nennt ${verifiziert.length} Mittel, der Katalog ${katalog.size}`);
  for (const p of verifiziert) {
    assert.ok(katalog.has(String(p.id)), `${p.id} steht nicht im Katalog`);
    assert.ok(String(p.detyra || "").length > 30, `${p.id} hat keine dokumentierte Aufgabe`);
    assert.ok(["baze", "mbeshtetje", "pastrim"].includes(p.roli), `${p.id}: unbekannte Rolle`);
  }
});

test("das Beispiel im Prompt ordnet wirklich Mittel zu", () => {
  // Ein Beispiel mit leerer produkt_id lehrt genau den Fehler, der die
  // ganze Angebotsstrecke gekostet hat.
  const nevojat = PROMPT.shembull_i_pergjigjes.nevojat;
  assert.ok(nevojat.length >= 1, "das Beispiel nennt keinen Bedarf");
  for (const n of nevojat) {
    assert.ok(PROMPT.produkt_id_e_lejuar.includes(n.produkt_id),
      `das Beispiel benutzt die Kennung "${n.produkt_id}"`);
  }
  assert.equal(nevojat.filter((n) => n.roli === "kryesor").length, 1,
    "ohne genau ein 'kryesor' hebt die Seite kein Mittel hervor");
  assert.equal(new Set(nevojat.map((n) => n.roli)).size, nevojat.length,
    "eine Rolle kommt doppelt vor");
});

test("der Prompt sagt, was eine leere Kennung kostet", () => {
  const regeln = PROMPT.nevojat_rregullat.join(" ");
  assert.match(regeln, /produkt_id_e_lejuar/, "die Regel nennt die erlaubte Liste nicht");
  assert.match(regeln, /ANGEBOTSSTRECKE/,
    "die Regel sagt nicht, dass eine leere Kennung Plan, Paket und Kaufweg kostet");
  assert.match(regeln, /kryesor/);
  // Und die drei Bedingungen der Angebotssperre stehen in der Karte.
  const kushtet = PROMPT.pamja_e_faqes.kushtet_e_ofertes;
  assert.ok(kushtet, "die Karte nennt die Bedingungen der Angebotsstrecke nicht");
  assert.match(JSON.stringify(kushtet), /i_vleresueshem/);
  assert.match(JSON.stringify(kushtet), /produkt_id_e_lejuar/);
  assert.match(JSON.stringify(kushtet), /Dr\. Gashi/);
});

test("die Beispielantwort traegt nach dem Haken wirklich ein Angebot", async () => {
  // Der ganze Weg an einem Stueck: Was das Modell laut Prompt liefert,
  // muss nach der aerztlichen Bestaetigung Mittel auf der Seite ergeben.
  const { raportLesen } = await import("../shared/lifeskin-analyse.js");
  const { reportToWire, validateRaportV3, reportAllowsOffer, offerBlockers }
    = await import("../shared/lifeskin-raport-v3.js");

  const r = raportLesen(PROMPT.shembull_i_pergjigjes);
  validateRaportV3(reportToWire(r));

  // Ohne den Haken: gesperrt, und der Grund ist benennbar.
  assert.equal(reportAllowsOffer({ ...r, aerztlichGeprueft: false }), false);
  assert.deepEqual(offerBlockers({ ...r, aerztlichGeprueft: false }), ["ungeprueft"]);

  // Mit dem Haken: frei, und ohne weitere Sperre.
  const geprueft = { ...r, aerztlichGeprueft: true };
  assert.deepEqual(offerBlockers(geprueft), []);
  assert.equal(reportAllowsOffer(geprueft), true);

  // Und Heart findet zu jeder Kennung ein Kaestchen im Katalog.
  const { STANDARD_PRODUKTE } = await import("../apps/lifeskin/lifeskin-catalog.js");
  const katalog = new Set(STANDARD_PRODUKTE.map((p) => String(p.id)));
  const angekreuzt = geprueft.nevojat.filter((n) => n.produkt_id && katalog.has(n.produkt_id));
  assert.equal(angekreuzt.length, geprueft.nevojat.length,
    "Heart koennte nicht jedes Mittel ankreuzen");
  assert.ok(angekreuzt.length >= 1, "es wuerde kein Mittel angekreuzt");
  // Genau eines ist das gesuchte - die Seite hebt es hervor.
  assert.equal(angekreuzt.filter((n) => n.roli === "kryesor").length, 1);
});

test("Heart verwirft angekreuzte Mittel nicht mehr still", () => {
  // Dr. Gashi kreuzte an, gab frei, und auf der Seite stand kein Mittel -
  // ohne ein Wort dazu, welche der drei Bedingungen gefehlt hat.
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /const angekreuzt = produkte\.length;/,
    "Heart merkt sich nicht, ob ueberhaupt angekreuzt war");
  assert.match(heart, /const sperren = offerBlockers\(raport\);/);
  assert.match(heart, /angekreuzte Mittel wuerden nicht freigegeben/,
    "es wird kein Grund genannt");
  // Und der Ausweg gehoert dazu: Weder nevojat noch der Beurteilungsstatus
  // lassen sich im Bogen bearbeiten, also waere ein Hinweis ohne Ausweg
  // eine Sackgasse.
  assert.match(heart, /Entferne die Kreuze/, "die Meldung nennt keinen Ausweg");
  assert.match(heart, /Setze den Haken der aerztlichen Pruefung/,
    "beim fehlenden Haken wird der naheliegende Weg nicht genannt");
  // Und der Grund kommt aus derselben Stelle wie die Sperre - nicht aus
  // einer zweiten Liste von Bedingungen.
  assert.match(heart, /OFFER_BLOCKERS\[s\]/);
  assert.ok(!/aerztlichGeprueft !== true/.test(heart),
    "Heart prueft die Bedingungen ein zweites Mal selbst - sie laufen auseinander");
});

test("die Angebotssperre hat genau eine Quelle", async () => {
  const { offerBlockers, reportAllowsOffer, OFFER_BLOCKERS }
    = await import("../shared/lifeskin-raport-v3.js");
  // Jeder Grund ist benannt - ein Schluessel ohne Satz meldet nichts.
  const alle = offerBlockers({ schemaVersion: 3 });
  assert.deepEqual(alle.sort(), ["ohneBedarf", "status", "ungeprueft"]);
  for (const s of alle) assert.ok(OFFER_BLOCKERS[s], `fuer ${s} steht kein Satz`);
  // Ein alter Befund kennt diese Sperren nicht.
  assert.deepEqual(offerBlockers({ schemaVersion: 2 }), []);
  assert.equal(reportAllowsOffer({ schemaVersion: 2 }), true);
  // Und die Sperre ist genau die Abwesenheit von Gruenden.
  const voll = { schemaVersion: 3, aerztlichGeprueft: true,
    vleresimi: { statusi: "i_pjesshem" }, nevojat: [{ roli: "kryesor" }] };
  assert.equal(reportAllowsOffer(voll), true);
  assert.equal(reportAllowsOffer({ ...voll, nevojat: [] }), false);
  assert.equal(reportAllowsOffer({ ...voll, vleresimi: { statusi: "kontroll_mjekesor" } }), false);
});
