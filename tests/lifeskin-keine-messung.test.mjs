import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { TEXTE } from "../apps/lifeskin-bericht/bericht-texte.js";
import { methode, ohneKommentare } from "./lifeskin-quelle.mjs";

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
test("ueber dem Gesicht liegt nichts mehr", () => {
  // Der Punktschleier zeichnete bei JEDEM Bild rund 240 Rechtecke auf eine
  // bildschirmgrosse Leinwand - auf einem schwachen Telefon genug, um den
  // Ring stocken zu lassen, und das ausgerechnet waehrend der Drehung.
  //
  // Er sollte sagen "du wirst erkannt". Das sagt der Zeiger im Ring
  // besser: Er wandert mit dem Kopf mit, in dem Augenblick, in dem der
  // sich bewegt (siehe #ringZeichnen). Face ID macht es genauso.
  assert.ok(!app.includes("#netzZeichnen"), "Der Punktschleier ist zurueck");
  assert.ok(!html.includes('id="ls-netz"'), "Die Leinwand dafuer steht noch im Aufbau");
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

// Auch die Fotos sieht der Patient nicht - IN VOLLER GROESSE.
//
// Der Satz hiess frueher "auch die Fotos sieht der Patient nicht", ohne
// Zusatz, und der Grund stand daneben: Ein Gesicht in schlechtem Licht,
// vergroessert auf einem Handybildschirm, gefaellt fast niemandem - und der
// Bildschirm, auf dem entschieden wird, ist der falsche Ort dafuer.
//
// DER GRUND GILT WEITER, DIE REGEL IST GENAUER GEWORDEN. Auf der
// Warteseite steht seit Neuestem eine Reihe von Miniaturen, 56 Punkte
// breit, zum Wischen. Das ist nicht dasselbe: Bei 56 Punkten prueft
// niemand seine Poren: Man sieht, DASS die Aufnahmen da sind. Und genau
// das ist auf diesem Bildschirm die Aufgabe - er ist der, auf dem sich
// entscheidet, ob dieser Mensch eine Nummer hinterlaesst, und wer nichts
// vor sich sieht, das ihm gehoert, hat auch nichts zu verlieren.
//
// Unveraendert verboten bleibt:
//   - eine Aufnahme in voller Aufloesung vor dem Patienten,
//   - jeder Zugriff der Seiten auf sessions/<kennung>/photos - dort liegen
//     die Bilder der Aerztin, und daneben Telefonnummer und Anschrift.
test("der Patient bekommt auch seine Fotos nicht zu sehen", () => {
  // HIER STAND EIN VERBOT, BILDER UEBERHAUPT ZU BAUEN.
  //
  // Das war das Richtige mit dem falschen Mass: Gemeint ist, dass der
  // Patient SEINE Aufnahmen nicht zurueckbekommt - nicht, dass auf dem
  // Einstieg kein Portraet von Dr. Gashi stehen darf. Als es dazukam,
  // schlug dieser Test an, und die Regel haette ein Bild verboten, um das
  // es nie ging.
  //
  // Jetzt wird geprueft, was gemeint war: WOHER ein Bild seine Quelle
  // nimmt. Erlaubt ist genau eine - die feste Datei aus dem Verzeichnis.
  // Alles, was aus der Leinwand kommt (toDataURL, Blob, ein aufgenommenes
  // jpeg), waere SEIN Gesicht und faellt durch.
  //
  // ZWEI QUELLEN, UND DIE ZWEITE ZEIGT NICHTS AN. Seit die Warteseite
  // Miniaturen bekommt, verkleinert der Trichter jede Aufnahme einmal -
  // und dafuer muss er sie dekodieren, was im Browser nur ueber ein
  // Image geht. Dieses Bild kommt nie in die Seite; es ist ein Werkzeug,
  // kein Anblick. Der Test darauf steht direkt darunter.
  const bildQuellen = [...app.matchAll(/\.src\s*=\s*([^;\n]+)/g)].map((m) => m[1].trim());
  assert.deepEqual(bildQuellen, ["ARZT_BILD", "jpeg"],
    "Ein Bild im Trichter bekommt seine Quelle von woanders als aus dem Verzeichnis");
  const verkleinern = methode(appMitKommentaren, "#miniaturBauen");
  for (const einhaengen of ["append", "prepend", "appendChild", "insertBefore", "replaceChildren"]) {
    assert.ok(!verkleinern.includes(einhaengen),
      `Der Verkleinerer haengt sein Bild mit ${einhaengen} in die Seite - dann sieht der Patient seine Aufnahme doch`);
  }
  assert.ok(!/createElement\("img"\)[\s\S]{0,400}(toDataURL|createObjectURL|\.jpeg)/.test(app),
    "Der Trichter zeigt eine Aufnahme des Patienten");
  assert.ok(!/createElement\("figure"\)/.test(app),
    "Der Trichter baut weiterhin Bildtafeln");

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
  // Jedes Bild auf der Seite muss ein Produktfoto sein. Nicht die Anzahl
  // zaehlt - Bestellschirm und Befund zeigen dieselben Produkte zweimal -
  // sondern dass ueber jedem einzelnen p.foto steht.
  const bilder = [...bericht.matchAll(/createElement\("img"\)/g)];
  assert.ok(bilder.length >= 1, "Es gibt gar kein Produktbild mehr");
  for (const treffer of bilder) {
    const davor = bericht.slice(Math.max(0, treffer.index - 400), treffer.index);
    assert.ok(davor.includes("p.foto"), "Ein Bild gehoert nicht zu einem Produkt");
  }
});

test("die Fotos gehen trotzdem an die Aerztin", () => {
  assert.ok(app.includes("fotosSpeichern"), "Die Fotos werden nicht mehr gespeichert");
  assert.ok(app.includes("#fotoMerken"), "Es werden keine Fotos mehr aufgenommen");
});

// DIE MINIATUREN AUF DER WARTESEITE - und wo die Grenze jetzt liegt.
//
// Der Patient sieht seine Aufnahmen, aber nur als Kachel und nur aus der
// kleinen Fassung neben dem Bericht. Die Bilder der Aerztin liegen in der
// Sitzung, und die Sitzung traegt Telefonnummer und Anschrift: Waere sie
// von hier aus lesbar, verschickte jeder, der seinen Link weitergibt, beides
// mit - und dieser Link ist zum Weitergeben gemacht.
//
// Genau diese Trennung haelt der Test fest. Sie ist der einzige Grund,
// warum es zwei Fassungen desselben Bildes gibt.
test("die Warteseite zeigt Miniaturen - und kommt nie an die Aufnahmen der Aerztin", () => {
  const astra = readFileSync(join(wurzel, "apps/lifeskin-astra/astra.js"), "utf8");
  const daten = readFileSync(join(wurzel, "apps/lifeskin-astra/astra-daten.js"), "utf8");
  const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

  // Sie holt die kleine Fassung, die neben dem Bericht liegt.
  assert.match(daten, /"reports", `\$\{this\.kennung\}\/thumbs`/,
    "Die Seite holt die Miniaturen nicht neben dem Bericht");
  // Und nirgends die Sammlung der Aufnahmen.
  for (const quelle of [astra, daten]) {
    assert.ok(!quelle.includes("/photos/") && !quelle.includes('"photos"'),
      "Die Analyseseite fragt die Aufnahmen aus der Sitzung an");
  }

  // DIE SITZUNG WIRD BESCHRIEBEN UND NIE GELESEN.
  //
  // Beschrieben schon: Dort landet, was auf der Seite geschieht - das ist
  // die einzige Spur, aus der sich ablesen laesst, ob dieser Weg traegt.
  // Gelesen nie: Daneben stehen Telefonnummer und Anschrift, und die
  // Regeln geben sie auch niemandem. Ein GET an dieser Stelle wuerde
  // stillschweigend nichts liefern und waere trotzdem die falsche Absicht.
  const stellen = [...ohneKommentare(daten).matchAll(/"sessions"/g)];
  assert.equal(stellen.length, 1,
    "Die Sitzung wird an mehr als einer Stelle angesprochen - geprueft ist nur die eine");
  assert.ok(methode(daten, "merken").includes('method: "PATCH"'),
    "Die eine Stelle, an der die Sitzung angesprochen wird, schreibt nicht - sie liest");

  // Die Regeln halten dieselbe Trennung: Miniaturen oeffentlich, Fotos
  // beim CEO-Konto. Faellt eine der beiden Zeilen, ist die Trennung weg -
  // und zwar still, denn sehen wuerde man es an der Seite nicht.
  const fotos = regeln.slice(regeln.indexOf("match /photos/{blick}"));
  assert.match(fotos.slice(0, 200), /allow read: if isCeoActor\(\)/,
    "Die Aufnahmen in der Sitzung sind nicht mehr allein fuer das CEO-Konto lesbar");
  const minis = regeln.slice(regeln.indexOf("match /thumbs/{blick}"));
  assert.match(minis.slice(0, 200), /allow read: if true/,
    "Die Miniaturen sind nicht lesbar - dann bleibt die Warteseite bei den Ersatzkacheln");

  // Und die Kachel bleibt eine Kachel. Der Grund, aus dem der Patient
  // seine Aufnahmen frueher gar nicht sah, gilt fuer das grosse Bild
  // weiter: Ein Gesicht in schlechtem Licht, vergroessert auf einem
  // Handybildschirm, gefaellt fast niemandem.
  const css = readFileSync(join(wurzel, "apps/lifeskin-astra/astra.css"), "utf8");
  const breite = Number(css.match(/\.wait-shot\{[^}]*width:(\d+)px/)?.[1]);
  assert.ok(Number.isFinite(breite) && breite <= 96,
    `Die Miniatur ist ${breite}px breit - das ist keine Kachel mehr, sondern ein Bild`);
  // Kein Weg, sie gross zu machen: kein Aufklapper, kein Blatt, kein Link
  // auf die Datenzeile.
  assert.ok(!/wait-shot[\s\S]{0,300}dialog/.test(astra),
    "Eine Kachel laesst sich zu einem grossen Bild oeffnen");
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

// ---------- Und jetzt misst der Trichter auch nichts mehr ----------
//
// Bisher stand hier nur, dass der PATIENT keinen Messwert zu sehen bekommt.
// Gemessen wurde trotzdem, und zwar viel: Roetung als a*, Glanz, Hautton als
// ITA-Winkel, Poren, Linien, dazu ein Weissabgleich aus dem Augenweiss und
// ein Millimeter-Massstab aus dem Pupillenabstand - je Aufnahme, ausserhalb
// des Bildtakts, damit der Ring nicht stockt.
//
// Niemand hat diese Zahlen je gelesen. Heart reicht metrics und ratios nur
// durch, gezeichnet werden sie nirgends. Und geprueft gegen einen echten
// Fall ist keine davon.
//
// Der Ring, die Striche und die drei Aufnahmen bleiben - das ist es, was
// gebraucht wird.

test("der Trichter holt keine Messtechnik mehr herein", () => {
  assert.ok(!app.includes("lifeskin-haut.js"),
    "lifeskin-haut.js wird wieder eingebunden - das ist die Bildguete-Messung");
  for (const name of ["messeBild", "fasseAufnahmenZusammen", "berechneVerhaeltnisse",
    "streuungUeberAufnahmen", "sklerAbgleich", "massstabAusNetz", "bildGuete", "rechteckUmriss"]) {
    assert.ok(!app.includes(name), `Der Trichter ruft wieder ${name}() auf`);
  }
  // MESS_BREITE und PUNKT sind keine Messung, sondern zwei Tabellenwerte:
  // die Breite der Arbeitsleinwand und die Nummer der Nasenspitze.
  assert.match(app, /import \{ MESS_BREITE, PUNKT \} from "\.\/lifeskin-metrics\.js"/);
});

test("der abgeschlossene Scan traegt keine Messwerte mehr in die Sitzung", () => {
  const ab = app.indexOf("async #ringAbschluss");
  const abschluss = app.slice(ab, app.indexOf("\n  #", ab + 10));
  for (const feld of ["metrics:", "ratios:", "mmJeBildpunkt:"]) {
    assert.ok(!abschluss.includes(feld), `Der Scan schreibt weiterhin ${feld}`);
  }
  // Was bleibt, ist das, wofuer der Scan da ist - und zwei Zahlen ueber den
  // Weg dorthin, nicht ueber die Haut.
  for (const feld of ["photos:", "ringAnteil:", "views:"]) {
    assert.ok(abschluss.includes(feld), `Der Scan schreibt ${feld} nicht mehr`);
  }
  // guete ist jetzt die Schaerfe der behaltenen Bilder: eine Aussage ueber
  // das Material, nicht ueber den Menschen.
  assert.match(abschluss, /guete: schaerfen/);
  assert.match(abschluss, /schaerfen = Object\.values\(this\.kamera\.fotos/);
});

// DAS TEUERSTE, WAS JE IM BILDTAKT STAND.
//
// Ein getImageData ueber die volle Kameraaufloesung, je Aufnahme - nur um
// gleich danach die Haut zu vermessen. Deshalb lief die Messung ueberhaupt
// ausserhalb des Takts: Im Takt haette der Ring genau dann gestockt, wenn
// ein Strich zugeht, also genau dann, wenn jemand hinsieht.
test("im Bildtakt wird kein volles Bild mehr aus der Leinwand geholt", () => {
  // Die DEFINITION, nicht den Aufruf: der steht in #ringschleife() davor.
  const auf = app.indexOf("\n  #ringAufnahme(netz, leinwand");
  const aufnahme = app.slice(auf, app.indexOf("\n  #", auf + 10));
  assert.ok(!aufnahme.includes("getImageData"),
    "Die Aufnahme holt wieder ein volles Bild aus der Leinwand");
  assert.ok(!app.includes("offeneMessungen"),
    "Die Buchhaltung fuer nebenherlaufende Messungen ist wieder da");
  // Die Notiz, DASS dort ein Gesicht war, bleibt - sie traegt views und den
  // Fehler "kein Gesicht erkannt".
  assert.match(aufnahme, /proben\.push\(\{ frontal, sektor, erkannt: true, pose: netz\.pose \}\)/);
});
