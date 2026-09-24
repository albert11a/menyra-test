import test from "node:test";
import assert from "node:assert/strict";

import { renderLifeskin, fuellePlatzhalter, PLATZHALTER } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { baueKennzahlen, baueTrichter, baueHerkunft, baueVerteilung } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { STANDARD_PRODUKTE } from "../apps/lifeskin/lifeskin-catalog.js";
import { funktion, lies, ohneKommentare } from "./lifeskin-quelle.mjs";

// HTML-Notizen sind kein Markup: Eine Notiz, die erklaert, warum das
// Feld hier NICHT steht, darf den Test darauf nicht ausloesen.
const ohneHtmlKommentare = (text) => text.replace(/<!--[\s\S]*?-->/g, "");

function zustand(zusatz = {}) {
  return {
    status: "ready", loadedFrom: "network", sitzungen: [], produkte: STANDARD_PRODUKTE,
    abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    herkunft: baueHerkunft([]), verteilung: baueVerteilung([]),
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", ...zusatz
  };
}

// Das Produktfoto kommt vom Handy, ohne Umweg ueber einen Bilddienst.
//
// Vorher stand dort ein Feld "Bildadresse": Man haette das Foto erst
// irgendwo hochladen und die Adresse hineinkopieren muessen. Das ist der
// haeufigste Grund, warum jemand ein Produkt nie fertig anlegt.

test("das Foto wird vom Geraet gewaehlt, nicht als Adresse eingetippt", () => {
  const html = renderLifeskin(zustand({ produktOffen: "__neu" }));
  assert.match(html, /data-action="trigger-crm-file" data-crm-file-input="heartLifeskinFotoInput"/,
    "Es gibt keinen Knopf mehr, der die Fotoauswahl oeffnet");
  // Das Feld selbst steht NICHT hier. Siehe den Test darunter.
  assert.ok(!/<input type="file"/.test(ohneHtmlKommentare(html)),
    "Das Feld steht wieder im Kasten");
  // Die Adresse bleibt als verstecktes Feld - dort landet das fertige Bild.
  assert.match(html, /type="hidden" data-produktfeld="photoRef"/);
});

// ══ WARUM DAS FELD NICHT IM KASTEN STEHT ════════════════════════════
//
// GEMESSEN, NICHT VERMUTET: "Beim ersten Mal geht es nicht, beim
// zweiten oder dritten schon."
//
// Das versteckte <input type="file"> stand mitten im neu gezeichneten
// Bereich. Heart zeichnet bei jeder Zustandsaenderung neu und schreibt
// den Kasten per innerHTML neu - das alte Feld haengt danach an keinem
// Dokument mehr.
//
// Und genau waehrend die Fotoauswahl offensteht, passiert das: Das
// Telefon legt die Seite in den Hintergrund, beim Zurueckkommen laeuft
// eine Zustandsaenderung durch, der Bereich wird neu geschrieben - und
// das Feld mit dem gewaehlten Bild ist abgehaengt. Sein "change" steigt
// zu keinem Dokument mehr auf, der abhorchende Griff sieht nichts, und
// fuer den, der davorsitzt, ist einfach nichts passiert.
test("das Feld fuer die Fotoauswahl entsteht an <body> und nicht im Kasten", () => {
  const quelle = lies("apps/mnyra-heart/heart.js");
  const anfang = quelle.indexOf("function oeffneDateiwahl");
  assert.ok(anfang > -1, "oeffneDateiwahl heisst anders");
  const block = quelle.slice(anfang, quelle.indexOf("\n}", anfang));

  assert.match(block, /document\.createElement\("input"\)/,
    "Das Feld wird nicht mehr frisch gebaut");
  assert.match(block, /document\.body\.appendChild\(feld\)/,
    "Das Feld haengt nicht an <body> - ein Neuzeichnen nimmt es dann weg");
  assert.match(block, /feld\.addEventListener\("change"/,
    "Das Feld bringt seinen eigenen Horcher nicht mehr mit");
  // Standard: nur Bilder. Videos nur, wo es ausdruecklich verlangt ist
  // (Kundenvideos in heart-lifeskin-medien.js).
  assert.match(block, /annehmen = "image\/\*"/, "Es lassen sich wieder Nicht-Bilder waehlen");
  assert.match(block, /feld\.accept = annehmen/);

  // .click() MUSS im Griff des Fingers passieren. Steht ein await
  // davor, haelt der Browser die Auswahl fuer nicht angefordert und
  // oeffnet sie gar nicht.
  assert.ok(!/await/.test(block),
    "Vor dem Oeffnen steht ein await - dann oeffnet das Telefon die Auswahl nicht");
  assert.match(block, /feld\.click\(\)/, "Die Auswahl wird nicht mehr geoeffnet");

  // Ein Feld, das gar nicht dargestellt wird (display:none, hidden),
  // oeffnet die Fotoauswahl nicht auf jedem Telefon. Deshalb ein Punkt
  // in der Ecke statt keiner Darstellung.
  assert.ok(!/display:none|feld\.hidden = true/.test(block),
    "Das Feld wird wieder gar nicht dargestellt - dann oeffnet es manches Telefon nicht");
  assert.match(block, /opacity:0/, "Das Feld ist wieder sichtbar");

  // Wer abbricht, loest kein "change" aus. Ohne Aufraeumen haengen beim
  // naechsten Mal zwei Felder an <body>.
  assert.match(block, /feld\.remove\(\)/, "Ein abgebrochener Versuch laesst das Feld liegen");
});

test("ein vorhandenes Foto wird gezeigt und laesst sich entfernen", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,AAA" } : p);
  const html = renderLifeskin(zustand({ produkte: mitFoto, produktOffen: "lf-acne" }));
  assert.match(html, /<img src="data:image\/jpeg;base64,AAA"/);
  assert.match(html, /data-action="lifeskin-produkt-foto-weg"/);
});

test("das Bild wird verkleinert und passt in ein Dokument", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const block = quelle.slice(quelle.indexOf("async function produktfotoLesen"));
  assert.ok(block.includes("FOTO_KANTE"), "Es wird nicht verkleinert");
  // Die Grenze steht am Aufrufer, nicht mehr fest im Leser: Die EINE
  // Produktaufnahme steht allein in ihrem Dokument und darf 700 KB;
  // die Bilder der Landingpage stehen zu sechst in EINEM Dokument und
  // duerfen deshalb viel weniger (siehe LANDING_BILD_MAX).
  assert.ok(/grenze = 700000/.test(block), "Es gibt keine Groessengrenze");
  assert.ok(/jpeg\.length <= grenze/.test(block), "Die Grenze wird nicht geprueft");
  // Dieselbe Leiter wie bei den Aufnahmen: die beste Guete, die noch passt.
  assert.ok(/0\.86.*0\.78.*0\.7.*0\.62/s.test(block), "Keine Guetestufen");
});

// ALLE BILDER EINES MITTELS STEHEN IN EINEM DOKUMENT.
//
// GEMELDET, NICHT BEFUERCHTET: "Ich kann nicht mehrere gleichzeitig, und
// bei LF PORE wird es, sobald ich das zweite Bild hochlade, gar nicht
// mehr auf der Landingpage gezeigt." Ein Firestore-Dokument darf 1 MiB -
// zwei Bilder zu je 700 KB sind zu viel, und Firestore weist dann das
// GANZE Dokument ab. Fuer den, der gerade ein Bild gewaehlt hat, sieht
// das aus wie "manchmal geht es, manchmal nicht".
test("die Bilder der Landingpage haben ihre eigene, engere Grenze", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  assert.match(quelle, /const LANDING_BILD_MAX = (\d+);/);
  assert.match(quelle, /const LANDING_DOKUMENT_MAX = (\d+);/);
  const jeBild = Number(quelle.match(/const LANDING_BILD_MAX = (\d+);/)[1]);
  const jeDokument = Number(quelle.match(/const LANDING_DOKUMENT_MAX = (\d+);/)[1]);
  // Sechs Bilder sind das Hoechste - sie muessen zusammen hineinpassen,
  // und unter der harten Grenze von 1 MiB muss Luft bleiben.
  assert.ok(jeBild * 6 <= jeDokument, `Sechs Bilder zu ${jeBild} passen nicht in ${jeDokument}`);
  assert.ok(jeDokument < 1048576, "Die Grenze liegt ueber dem, was ein Dokument traegt");
  // Der Leser bekommt sie mit - sonst gilt weiter die weite Grenze.
  assert.match(quelle, /produktfotoLesen\(datei, LANDING_KANTE, LANDING_BILD_MAX\)/);
  // Und gerechnet wird VOR dem Schreiben: Eine Meldung, die sagt "ein
  // Bild weniger", ist etwas anderes als ein Schreibvorgang, der stumm
  // scheitert und alles zuruecksetzt.
  const block = quelle.slice(quelle.indexOf("async function lifeskinLandingbilder"));
  assert.match(block, /gewicht \+ bild\.length > LANDING_DOKUMENT_MAX/);
});

// Der persoenliche Satz: einmal je Produkt, nicht je Patientin.
//
// Ein Satz je Patientin von Hand waeren Minuten - und Minuten sind die
// Obergrenze dieses Geschaefts.

test("die Platzhalter werden gefuellt, nicht abgetippt", () => {
  assert.deepEqual([...PLATZHALTER], ["emri", "gjetja", "mosha"]);
  assert.equal(
    fuellePlatzhalter("{emri}, ky serum eshte per {gjetja}.", { emri: "Arta", gjetja: "skuqjen" }),
    "Arta, ky serum eshte per skuqjen."
  );
});

test("ein fehlender Wert laesst keine geschweiften Klammern stehen", () => {
  const text = fuellePlatzhalter("{emri}, per {gjetja} dhe {mosha}.", { emri: "Arta" });
  assert.doesNotMatch(text, /[{}]/, "In der Nachricht steht noch ein Platzhalter");
});

test("beide Sprachen haben ein Feld, und eine Vorschau steht daneben", () => {
  const html = renderLifeskin(zustand({ produktOffen: "lf-acne" }));
  assert.match(html, /data-produktfeld="persoenlich_sq"/);
  assert.match(html, /data-produktfeld="persoenlich_de"/);
  assert.match(html, /So liest es eine Patientin/);
  // Und die Platzhalter werden erklaert, sonst benutzt sie niemand.
  for (const name of PLATZHALTER) assert.ok(html.includes(`{${name}}`), `${name} nicht erklaert`);
});

test("der persoenliche Satz wird mitgespeichert", () => {
  const block = funktion(ohneKommentare(lies("apps/mnyra-heart/heart.js")), "produktAusFormular");
  assert.ok(block.includes("persoenlich"), "Der Satz wird nicht gespeichert");
  assert.ok(block.includes("persoenlich_sq") && block.includes("persoenlich_de"));
});

test("Foto waehlen und Foto entfernen sind beide verdrahtet", () => {
  const events = lies("apps/mnyra-heart/heart-events.js");
  const heart = lies("apps/mnyra-heart/heart.js");
  // Das Waehlen laeuft ueber den Knopf und das Feld an <body>, nicht
  // mehr ueber ein abgehorchtes Feld im Kasten.
  assert.ok(events.includes("trigger-crm-file"), "Der Knopf wird nicht aufgefangen");
  assert.match(heart, /heartLifeskinFotoInput[\s\S]{0,160}oeffneDateiwahl\(false/,
    "Das Produktfoto geht nicht ueber das neue Feld");
  assert.match(heart, /heartLifeskinLandingInput[\s\S]{0,160}oeffneDateiwahl\(true/,
    "Die Landingbilder gehen nicht ueber das neue Feld");
  assert.ok(events.includes("lifeskin-produkt-foto-weg"), "Das Entfernen wird nicht aufgefangen");
});

// ---------------------------------------------------------------------------
// Das getauschte Foto muss ein Neuzeichnen ueberleben
// ---------------------------------------------------------------------------
//
// GEMESSEN, NICHT GESCHAETZT: Das gewaehlte Bild stand nur im versteckten
// Feld des Formulars. Die Erfolgsmeldung danach ist eine
// Zustandsaenderung, Heart zeichnet bei jeder neu und schreibt den ganzen
// Bereich neu - mit dem ALTEN Bild darin. "Speichern" schrieb danach, was
// schon dastand: Auf dem Telefon liess sich ein Produktfoto nicht
// tauschen, und es sah nach einem toten Knopf aus.

test("das gewaehlte Foto steht im Entwurf, nicht nur im Formular", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,ALT" } : p);
  const html = renderLifeskin(zustand({
    produkte: mitFoto,
    produktOffen: "lf-acne",
    produktEntwurf: { photoRef: "data:image/jpeg;base64,NEU" }
  }));
  assert.match(html, /<img src="data:image\/jpeg;base64,NEU"/,
    "Die Vorschau zeigt weiter das alte Bild");
  assert.match(html, /data-produktfeld="photoRef" value="data:image\/jpeg;base64,NEU"/,
    "Gespeichert wuerde das alte Bild");
  assert.doesNotMatch(html, /base64,ALT/, "Das alte Bild steht noch irgendwo");
});

test("ein entferntes Foto bleibt entfernt, auch nach dem Neuzeichnen", () => {
  const mitFoto = STANDARD_PRODUKTE.map((p) =>
    p.id === "lf-acne" ? { ...p, photoRef: "data:image/jpeg;base64,ALT" } : p);
  const html = renderLifeskin(zustand({
    produkte: mitFoto,
    produktOffen: "lf-acne",
    produktEntwurf: { photoRef: "" }
  }));
  assert.doesNotMatch(html, /base64,ALT/, "Das entfernte Bild steht wieder da");
  assert.match(html, /heart-lifeskin-fotoleer/, "Es fehlt der leere Platz");
});

test("auch das Getippte ueberlebt die Fotowahl", () => {
  // Wer einen Satz getippt hat und dann ein Foto waehlt, soll den Satz
  // wiederfinden - deshalb wandert das GANZE Formular in den Entwurf.
  const html = renderLifeskin(zustand({
    produktOffen: "lf-acne",
    produktEntwurf: { name: "LF ACNE PRO", persoenlich_sq: "{emri}, ky serum …" }
  }));
  assert.match(html, /value="LF ACNE PRO"/, "Der getippte Name ist weg");
  assert.match(html, /\{emri\}, ky serum …/, "Der getippte Satz ist weg");
});

test("der Entwurf wird gelesen, bevor etwas neu gezeichnet wird", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const block = funktion(quelle, "lifeskinProduktfoto");
  assert.ok(block.includes("produktEntwurfLesen"),
    "Das Foto landet wieder nur im Formular");
  assert.ok(block.includes("patchLifeskin"),
    "Das Foto steht nirgends, was ein Neuzeichnen ueberlebt");
  // Und der Entwurf gilt nur, solange dieses Produkt offen ist.
  assert.ok(/produktOffen: "", produktEntwurf: null/.test(quelle),
    "Der Entwurf ueberlebt das Schliessen des Formulars");
});

test("die Fotoauswahl haengt an einem Knopf, nicht an einem <label>", () => {
  // Ein <label> um ein Feld mit display:none herum oeffnet die
  // Fotoauswahl nicht auf jedem Telefon. Ueberall sonst in Heart klickt
  // ein Knopf das versteckte Feld an - hier jetzt auch.
  const html = renderLifeskin(zustand({ produktOffen: "lf-acne" }));
  assert.match(html, /data-action="trigger-crm-file" data-crm-file-input="heartLifeskinFotoInput"/);
  assert.doesNotMatch(html, /<label class="heart-lifeskin-fotoknopf"/,
    "Die Auswahl haengt wieder am <label>");
});

test("dasselbe Bild laesst sich zweimal waehlen", () => {
  // Frueher musste das Feld dafuer geleert werden: Ohne Leeren meldet
  // die zweite Wahl derselben Datei keine Aenderung. Jetzt entsteht zu
  // jeder Wahl ein frisches Feld und das alte wird weggenommen - ein
  // Feld, das es beim zweiten Mal gar nicht mehr gibt, kann sich an die
  // erste Wahl nicht erinnern.
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const anfang = quelle.indexOf("function oeffneDateiwahl");
  const block = quelle.slice(anfang, quelle.indexOf("\n}", anfang));
  assert.match(block, /document\.createElement\("input"\)/,
    "Das Feld wird wiederverwendet - dann meldet dieselbe Datei keine Aenderung");
  assert.match(block, /feld\.remove\(\)/, "Das alte Feld bleibt liegen");
});

// ══ DREI ALTE BILDER DUERFEN DAS DOKUMENT NICHT DICHTMACHEN ══════════
//
// GEMESSEN AM GERAET: "Kein Platz mehr für ein weiteres Bild" - bei
// DREI von sechs Bildern.
//
// Die drei lagen dort aus der Zeit vor LANDING_BILD_MAX, jedes mit
// mehreren hundert Kilobyte. Der Riegel rechnete ihr Gewicht einfach
// dazu und sagte ab; dieselbe Meldung kam bei jedem weiteren Versuch.
// Wer sechs Bilder anlegen will, kommt so nie an.
//
// Ein Bild, das zu schwer ist, ist aber kein Grund abzusagen: Es ist
// ein Bild, das noch einmal durch die Leinwand muss.
test("alte, zu schwere Bilder werden eingepasst statt abgewiesen", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const anfang = quelle.indexOf("async function lifeskinLandingbilder");
  assert.ok(anfang > -1, "lifeskinLandingbilder heisst anders");
  const block = quelle.slice(anfang, quelle.indexOf("\nasync function", anfang + 10));

  // Die alten gehen denselben Weg wie die neuen.
  assert.match(block, /bildPressen\(await bildLaden\(bild\), LANDING_KANTE, LANDING_BILD_MAX\)/,
    "Ein zu schweres Bild wird nicht mehr eingepasst");
  // Nur wenn es noetig ist - sonst jedes Mal alle Bilder neu rechnen.
  assert.match(block, /> LANDING_DOKUMENT_MAX\) \{/,
    "Es wird immer eingepasst, auch wenn alles laengst passt");
  // Ein Bild, das sich nicht noch einmal rechnen laesst, bleibt liegen.
  // (ohneKommentare nimmt nur //-Zeilen - die Notiz im catch steht noch da.)
  const nackt = block.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.match(nackt, /catch \{\s*alte\.push\(bild\);/,
    "Ein Bild, das sich nicht pressen laesst, geht verloren");
  // Und geschrieben wird die EINGEPASSTE Liste, nicht die alte.
  assert.match(block, /landingFototSchreiben\(\[\.\.\.alte, \.\.\.neue\]/,
    "Geschrieben werden die alten, ungepressten Bilder");

  // bildPressen nimmt ein geladenes Bild und keine Datei - nur so kann
  // ein Bild, das schon in Firestore liegt, denselben Weg gehen.
  assert.match(quelle, /function bildPressen\(bild, kante, grenze\)/,
    "bildPressen nimmt keine Adresse mehr an");
  assert.match(quelle, /function bildLaden\(adresse\)/, "bildLaden fehlt");
});

// Die Rechnung dahinter, an Zahlen nachgestellt: Sechs Bilder auf
// ihrem Anteil muessen in das Dokument passen, und drei alte Brocken
// duerfen nach dem Einpassen kein Hindernis mehr sein.
test("sechs eingepasste Bilder passen, drei alte Brocken nicht", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"));
  const jeBild = Number(/LANDING_BILD_MAX = (\d+)/.exec(quelle)[1]);
  const jeDokument = Number(/LANDING_DOKUMENT_MAX = (\d+)/.exec(quelle)[1]);
  const hoechstens = Number(/LANDING_FOTOT_MAX = (\d+)/.exec(quelle)?.[1] || 6);

  const passenNoch = (liste, neu) => {
    let gewicht = liste.reduce((s, n) => s + n, 0);
    const rein = [];
    for (const bild of neu) {
      if (gewicht + bild > jeDokument) break;
      gewicht += bild;
      rein.push(bild);
    }
    return rein.length;
  };
  const einpassen = (liste) => liste.map((n) => Math.min(n, jeBild));

  // Der gemeldete Fall: drei Bilder aus der alten Zeit.
  const alteBrocken = [300000, 300000, 300000];
  assert.equal(passenNoch(alteBrocken, [jeBild]), 0,
    "Der Test stellt den gemeldeten Fall nicht nach");
  assert.equal(passenNoch(einpassen(alteBrocken), [jeBild]), 1,
    "Auch nach dem Einpassen geht kein weiteres Bild hinein");

  // Und das Hoechste geht ganz auf.
  const voll = Array.from({ length: hoechstens - 1 }, () => jeBild);
  assert.equal(passenNoch(voll, [jeBild]), 1,
    `${hoechstens} eingepasste Bilder passen nicht in das Dokument`);
  assert.ok(jeBild * hoechstens <= jeDokument,
    `${hoechstens} Bilder zu ${jeBild} passen nicht in ${jeDokument}`);
});

// ══ WENN DIE GUETE NICHT REICHT, GEHT DIE KANTE HERUNTER ═════════════
//
// GEMESSEN IM BROWSER: Ein sehr detailreiches Bild (2000 Punkte, volles
// Rauschen, 4,66 MB) kommt bei 1000 Punkten Kante auch mit Guete 0,46
// nicht unter 150 KB. Frueher flog dann ein Fehler - "Bitte ein
// kleineres waehlen" -, und das ist fuer jemanden, der ein ganz
// normales Foto gewaehlt hat, keine Auskunft, sondern eine Sackgasse.
//
// Mit der zweiten Leiter: 146435 Zeichen bei Kante 750, Guete 0,62.
// Ein gewoehnliches Produktfoto braucht sie gar nicht erst: 234983 ->
// 84815 Zeichen, Kante 1000, Guete 0,86.
test("reicht die Guete nicht, wird das Bild kleiner statt abgewiesen", () => {
  const quelle = ohneKommentare(lies("apps/mnyra-heart/heart.js"))
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const anfang = quelle.indexOf("function bildPressen");
  assert.ok(anfang > -1, "bildPressen heisst anders");
  const block = quelle.slice(anfang, quelle.indexOf("\n}", anfang));

  // Jede Runde nimmt ein Viertel der Kante weg - das endet garantiert.
  assert.match(block, /kante \* 0\.75 \*\* runde/,
    "Die Kante geht nicht mehr herunter, wenn die Guete nicht reicht");
  assert.match(block, /runde < 5/, "Die Leiter hat keine Stufenzahl mehr");

  // Die Runde selbst wirft nicht, sie sagt nur "hat nicht gepasst" -
  // sonst kaeme die zweite Leiter nie zum Zug.
  const zeichnen = quelle.slice(quelle.indexOf("function bildZeichnen"));
  const zBlock = zeichnen.slice(0, zeichnen.indexOf("\n}"));
  assert.ok(!/throw/.test(zBlock),
    "Eine Runde wirft wieder - dann wird die Kante nie kleiner");
  assert.match(zBlock, /return "";/, "Eine Runde sagt nicht mehr, dass sie nicht gepasst hat");

  // Ganz aufgeben darf es trotzdem, sonst liefe es still ins Leere.
  assert.match(block, /throw new Error/,
    "Nach allen Stufen wird nicht mehr gesagt, dass es nicht ging");
});
