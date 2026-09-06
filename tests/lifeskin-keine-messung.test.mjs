import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";
import { methode } from "./lifeskin-quelle.mjs";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
const berichtHtml = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
const bericht = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
const sitzung = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-session.js"), "utf8");
// Ohne Kommentarzeilen - sonst schlaegt die Suche auf den Erklaerungen an,
// die genau beschreiben, was entfernt wurde.
const appMitKommentaren = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const app = appMitKommentaren.replace(/^[ \t]*\/\/.*$/gm, "");

// Der Patient bekommt keinen einzigen Messwert zu sehen.
//
// Der Grund ist eine Rechnung, keine Vorsicht: Eine falsche Stufe kostet
// nicht einen Kunden mit halber Wahrscheinlichkeit, sie kostet ihn ganz. Wer
// bei reiner Haut "deutliche Pigmentflecken" liest, weiss, dass die Maschine
// sich irrt - und glaubt danach auch der Aerztin nicht mehr. Der Schaden
// trifft das Einzige, was hier wirklich verkauft: ihren Namen.
//
// Keine dieser Zahlen ist je gegen einen echten Fall geprueft worden.
// Solange das so ist, bleiben sie auf der Seite unsichtbar.

test("waehrend der Aufnahme steht kein gemessener Wert auf dem Bildschirm", () => {
  assert.ok(!html.includes('id="ls-messwerte"'), "Das Wertefeld steht noch im HTML");
  for (const zeichen of ["ITA ", "a* ", "ls-messwert"]) {
    assert.ok(!app.includes(zeichen), `Der Trichter zeigt weiterhin "${zeichen}"`);
  }
});

// Auch der Zaehler ist weg, und zwar aus einem anderen Grund als die
// Messwerte: Er war nicht gefaehrlich, nur unsere Sprache. "7 von 9
// Ansichten vermessen" - was eine Ansicht sein soll, muesste man erklaeren,
// und wie weit die Aufnahme ist, sieht er am Ring, ohne ein Wort zu lesen.
test("waehrend der Aufnahme steht ueberhaupt keine Zahl auf dem Bildschirm", () => {
  assert.ok(!html.includes('id="ls-messzaehler"'), "Der Zaehler steht noch im HTML");
  assert.ok(!app.includes("ringGemessen"), "Der Zaehler wird noch gefuellt");
  assert.ok(!app.includes("messwerteZeigen"), "Die Anzeige lebt noch");
});

// Der Ausloeser von Hand hielt den Hauptweg auf.
//
// Er hiess "Foto aufnehmen" und war als Rueckfallweg gemeint. Gelesen wurde
// er als Anweisung: Wer ihn sieht, glaubt, er muesse selbst ausloesen - und
// haelt still, statt den Kopf zu drehen. Jetzt steht dort eine Frage, und
// der Ausloeser liegt im Blatt dahinter.
test("unter der Kamera steht eine Frage, kein Ausloeser", () => {
  assert.ok(html.includes('id="ls-hilfe"'), "Der Weg ins Blatt fehlt");
  assert.ok(!html.includes("aufnahmeKnopfManuell"), "Der alte Ausloeser steht noch im Fuss");
  // Der Rueckfallweg selbst bleibt - er liegt nur woanders.
  assert.ok(html.includes('id="ls-manuell"'), "Der Rueckfallweg ist ganz weg");
  const blatt = html.slice(html.indexOf('id="ls-blatt"'));
  assert.ok(blatt.slice(0, 900).includes('id="ls-manuell"'),
    "Der Ausloeser liegt nicht im Blatt");
});

// Die Punkte des Gesichtsnetzes duerfen den Kreis nicht verlassen.
//
// Sie folgen dem ganzen Kopf, der Kreis zeigt nur einen Ausschnitt. Alles
// darueber hinaus landete frei auf der Seite - auf dem alten schwarzen
// Grund kaum zu sehen, auf dem hellen sofort.
test("das Gesichtsnetz wird am Kreis beschnitten", () => {
  const block = methode(appMitKommentaren, "#netzZeichnen");
  assert.ok(block.includes("grenzeQuadrat"), "Es wird nicht auf den Kreis geprueft");
  assert.ok(/dx \* dx \+ dy \* dy > grenzeQuadrat/.test(block),
    "Der Abstand zum Mittelpunkt entscheidet nicht ueber das Zeichnen");
  assert.ok(block.includes("continue"), "Punkte ausserhalb werden nicht uebersprungen");
});

test("es gibt gar keinen Ergebnisbildschirm mehr", () => {
  // Erst wurden die Befundtexte nur versteckt. Das ist zu wenig: Was im
  // Markup steht, kommt zurueck. Der ganze Bildschirm ist weg, und der
  // Trichter endet mit der Uebergabe.
  for (const kennung of ["ls-befund", "ls-hauttyp", "ls-lob", "ls-schwerpunkt",
                         "ls-werte", "ls-kombi", "ls-aufnahmen"]) {
    assert.ok(!html.includes(`id="${kennung}"`), `${kennung} steht noch im HTML`);
  }
  assert.ok(!app.includes("STUFEN_TEXTE"), "Der Trichter haelt noch Stufentexte");
  assert.ok(!app.includes("BEFUND_TEXTE"), "Der Trichter haelt noch Befundtexte");
  assert.ok(!app.includes("hauptbefunde"), "Der Trichter waehlt noch Hauptbefunde");
  assert.ok(!app.includes("balkenbreite"), "Der Trichter zeichnet noch Befundbalken");
});

// Auch die Fotos sieht der Patient nicht.
//
// Ein Gesicht in schlechtem Licht, vergroessert auf einem Handybildschirm,
// gefaellt fast niemandem - und der Bildschirm, auf dem entschieden wird,
// ist der falsche Ort dafuer. Sie gehen weiterhin an die Aerztin, nur nicht
// zurueck an den Patienten.
test("der Patient bekommt auch seine Fotos nicht zu sehen", () => {
  assert.ok(!/createElement\("(img|figure)"\)/.test(app),
    "Der Trichter baut weiterhin Bilder");

  // Auf der Befundseite gibt es Bilder - aber nur Produktfotos.
  //
  // SEINE Aufnahmen liegen in der Untersammlung photos, und die darf nur
  // das CEO-Konto lesen. Die Seite fragt sie nirgends an; genau das haelt
  // dieser Test fest. Ein Gesicht in schlechtem Licht, vergroessert auf
  // einem Handybildschirm, gefaellt fast niemandem - und der Bildschirm,
  // auf dem gekauft wird, ist der falsche Ort dafuer.
  assert.ok(!bericht.includes("/photos/"), "Die Befundseite fragt die Aufnahmen an");
  assert.ok(!/daten\.photos\b[^)]*img|img[^;]*daten\.photos/.test(bericht),
    "Die Befundseite zeichnet die Aufnahmen des Patienten");
  const bilder = bericht.match(/createElement\("img"\)/g) || [];
  assert.equal(bilder.length, 1, "Es gibt mehr als das eine Produktbild");
  const stelle = bericht.indexOf('createElement("img")');
  assert.ok(bericht.slice(stelle - 400, stelle).includes("#produkteZeichnen")
    || bericht.slice(stelle - 400, stelle).includes("p.foto"),
    "Das Bild gehoert nicht zu einem Produkt");
});

test("die Fotos gehen trotzdem an die Aerztin", () => {
  assert.ok(app.includes("fotosSpeichern"), "Die Fotos werden nicht mehr gespeichert");
  assert.ok(app.includes("#fotoMerken"), "Es werden keine Fotos mehr aufgenommen");
});

// Was der Patient stattdessen in der Hand haelt: seine Fallnummer.
// Das Einzige nach der Aufnahme, das wahr ist und nicht falsch sein kann.
test("stattdessen steht dort die Fallnummer", () => {
  assert.ok(berichtHtml.includes('id="lb-nummer"'), "Die Fallnummer fehlt auf der Befundseite");
  const block = methode(bericht, "#wartenZeigen");
  assert.ok(block.includes("this.daten.code"), "Die Fallnummer wird nicht angezeigt");
});

test("die Befundseite sagt, was fertig ist und was laeuft - und nichts ueber die Haut", () => {
  const block = methode(bericht, "#schritteZeigen");
  // Vier Punkte, nicht vier Zeilen: zwei erledigt, einer laeuft, einer offen.
  const treffer = block.match(/const staende = \[([^\]]+)\]/);
  assert.ok(treffer, "Die vier Staende stehen nicht mehr da");
  const staende = [...treffer[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(staende, ["fertig", "fertig", "laeuft", "offen"],
    "Erledigt sind Scan und Fotos; die Analyse laeuft; das Ergebnis bleibt offen");

  // Benannt wird nur der laufende - er ist der einzige, der eine Frage
  // beantwortet.
  assert.ok(block.includes('this.text("schrittAnalyse")'), "Der laufende Schritt wird nicht benannt");

  // Und keiner der vier sagt etwas ueber die Haut.
  for (const schluessel of ["schrittScan", "schrittFotos", "schrittAnalyse", "schrittFertig"]) {
    for (const sprache of ["sq", "de"]) {
      const zeile = TEXTE[schluessel][sprache];
      assert.doesNotMatch(zeile, /Hauttyp|Falten|Pigment|Rötung|Akne|rrudha|njolla/i,
        `${schluessel}/${sprache} nennt einen Befund`);
    }
  }
});

test("der Text verspricht die Aerztin, nicht die Maschine", () => {
  // Der Name steht im Titel, direkt darueber. Der Satz darunter muss ihn
  // nicht wiederholen - er muss das Gegenteil benennen.
  assert.match(TEXTE.titel.de, /Dr\. Gashi/);
  assert.match(TEXTE.titel.sq, /Dr\. Gashi/);
  assert.match(TEXTE.titelOhneName.sq, /Dr\. Gashi/);

  for (const sprache of ["sq", "de"]) {
    const text = TEXTE.warum[sprache];
    assert.ok(text && text.length > 30, `warum fehlt fuer ${sprache}`);
    // DER Satz der Seite: Er verwandelt die Wartezeit vom Mangel in den
    // Beweis. Eine Maschine haette sofort geantwortet - und genau deshalb
    // waere ihre Antwort nichts wert.
    assert.ok(/makin|Maschine/.test(text), "Es steht nicht da, dass keine Maschine antwortet");
    // Kurz genug, dass er ganz gelesen wird. Er wirkt nur dann.
    assert.ok(text.length <= 110, `${sprache}: zu lang (${text.length} Zeichen)`);
  }
});

// DIE WICHTIGSTE ZEILE IN DIESER DATEI.
//
// Hier stand einmal das Gegenteil: dass Hauttyp und Befunde weiterhin nach
// Heart geschrieben werden muessen. Das war die alte Aufteilung - die
// Software stellt den Befund, die Aerztin schaut ihn an.
//
// Jetzt gilt: WIR MACHEN DEN SCAN, DIE ANALYSE MACHT DR. GASHI. Solange
// die Software einen Hauttyp und Stufen berechnet, steht eine maschinelle
// Diagnose in der Datenbank unter dem Namen einer Aerztin - auch wenn sie
// niemand sieht. Und sobald sie irgendwo doch auftaucht, ist sie ihre
// Aussage geworden, ohne dass sie sie je getroffen hat.
test("die Software stellt nirgends einen Befund", () => {
  // Kein Regelwerk mehr im Trichter.
  assert.ok(!app.includes("erstelleBefund"), "Der Trichter rechnet noch einen Befund");
  assert.ok(!app.includes("bewerteBefunde"), "Der Trichter bewertet noch Befunde");
  assert.ok(!app.includes("bestimmeHauttyp"), "Der Trichter bestimmt noch einen Hauttyp");
  assert.ok(!app.includes("waehleProdukte"), "Der Trichter waehlt noch Produkte aus");

  // Und nichts davon wird gespeichert. Der Schritt "result" heisst nur noch:
  // Der Fall ist vollstaendig und liegt bei Dr. Gashi.
  const stelle = app.indexOf('schritt("result")');
  assert.notEqual(stelle, -1, "Der Schritt result fehlt");
  assert.ok(!/skinType|findings|recommended/.test(app),
    "Der Trichter speichert noch Hauttyp, Befunde oder Empfehlungen");

  // Auch der Bericht, den der Patient bekommt, traegt keine Aussage: nur
  // Name, Sprache, Fallnummer, Anzahl der Fotos und den Zustand "wartet".
  const anlegen = methode(sitzung, "berichtAnlegen");
  assert.ok(anlegen.includes('status: "wartet"'), "Der Bericht entsteht nicht im Wartezustand");
  assert.ok(!/skinType|findings|stufe/i.test(anlegen), "Im Bericht steht eine Messung");
});

test("das Regelwerk gibt es nicht mehr", async () => {
  // Totes Gewicht kommt zurueck. Deshalb ist die Datei geloescht und nicht
  // nur ungenutzt.
  await assert.rejects(() => import("../apps/lifeskin/lifeskin-rules.js"));
});

test("der Trichter kennt keine Produkte", () => {
  // Welche Produkte jemand bekommt, entscheidet Dr. Gashi auf der
  // Befundseite - nicht der Scan.
  assert.ok(!app.includes("STANDARD_PRODUKTE"), "Der Trichter haelt noch Produkte");
});

// ---------- Die Fallnummer ----------

test("die Fallnummer ist kurz, lesbar und verwechselt sich nicht", async () => {
  const { codeAus } = await import("../apps/lifeskin/lifeskin-session.js");
  // LS-TTMM-XXXXX. Der Tag gehoert hinein: Sechs zufaellige Zeichen sind
  // eine Kennung, aber keine Aktennummer - mit dem Datum liest sie sich wie
  // ein Fall in einer Praxis, und die Aerztin sieht vor dem Oeffnen, von
  // wann er ist.
  const code = codeAus("a1b2c3d4e5f60718", "2026-09-05T10:00:00.000Z");
  assert.match(code, /^LS-\d{4}-[2-9A-HJ-NP-Z]{5}$/, `Unerwartete Form: ${code}`);
  assert.ok(code.startsWith("LS-0509-"), `Der Tag steht nicht drin: ${code}`);
  // Ohne Datum bleibt der reine Teil - der Trichter faellt nie aus.
  assert.match(codeAus("a1b2c3d4"), /^LS-[2-9A-HJ-NP-Z]{5}$/);
  // Ohne 0, 1, I und O IM ZUFALLSTEIL - die vier verwechselt jeder. Im
  // Datum davor ist eine Null eine Null: Vier Ziffern an dieser Stelle
  // liest jeder als Tag und Monat, da gibt es nichts zu verwechseln.
  assert.doesNotMatch(code.split("-")[2], /[01IO]/);
  assert.doesNotMatch(codeAus("a1b2c3d4"), /[01IO]/);
  // Dieselbe Sitzung ergibt immer dieselbe Nummer, auch nach einem Neuladen.
  assert.equal(codeAus("a1b2c3d4e5f60718", "2026-09-05T10:00:00.000Z"), code);
  // Aus createdAt, nicht aus der aktuellen Zeit - sonst wechselte die
  // Nummer eines Besuchs um Mitternacht.
  assert.notEqual(codeAus("a1b2c3d4e5f60718", "2026-09-06T10:00:00.000Z"), code);
  assert.equal(codeAus(""), "");
});

test("die Fallnummer kollidiert nicht", async () => {
  const { codeAus } = await import("../apps/lifeskin/lifeskin-session.js");
  // Der erste Versuch leitete beide Haelften aus derselben Zahl ab: 200.000
  // Kennungen ergaben nur 62.000 Nummern. Eine Fallnummer, die zweimal
  // vorkommt, oeffnet der Aerztin den falschen Fall.
  // Fuenf Zeichen sind 33 Millionen Nummern je Tag. Bei 20.000 Kennungen
  // an EINEM Tag sind rechnerisch sechs Doppelungen zu erwarten - bei den
  // hundert Faellen, um die es wirklich geht, ist es eine in zwanzig
  // Jahren. Die Grenze hier laesst das Erwartete zu und faellt, sobald der
  // Streuwert wieder zusammenbricht.
  const tag = "2026-09-05T10:00:00.000Z";
  const gesehen = new Set();
  for (let i = 0; i < 20000; i += 1) gesehen.add(codeAus(`${i.toString(16)}-${i * 7919}`, tag));
  assert.ok(gesehen.size >= 19960,
    `Zu viele Kollisionen: ${20000 - gesehen.size} bei 20.000 Kennungen an einem Tag`);

  // Und hundert Faelle an einem Tag muessen hundert verschiedene sein.
  const alltag = new Set();
  for (let i = 0; i < 100; i += 1) alltag.add(codeAus(`sitzung-${i}-${i * 31}`, tag));
  assert.equal(alltag.size, 100);
});

test("die Sitzung schickt ihre Fallnummer mit", async () => {
  const { Sitzung } = await import("../apps/lifeskin/lifeskin-session.js");
  const geschrieben = [];
  const sitzung = new Sitzung({
    fetchFn: async (url, optionen) => { geschrieben.push(JSON.parse(optionen.body).fields); return { ok: true }; },
    speicher: null
  });
  await sitzung.starte({ sprache: "sq" });
  assert.equal(geschrieben[0].code?.stringValue, sitzung.code);
  assert.match(sitzung.code, /^LS-/);
});
