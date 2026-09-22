import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { telefonPruefen } from "../shared/lifeskin-telefon.js";
import { normalisiere, baueTrichter, istAnalyse, TRICHTER_STUFEN } from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { FRAGEN, FRAGEN_TEXTE } from "../apps/lifeskin/lifeskin-content.js";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");
const astra = readFileSync(join(wurzel, "apps/lifeskin-astra/astra.js"), "utf8");
const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
const html = readFileSync(join(wurzel, "apps/lifeskin-astra/index.html"), "utf8");
const regeln = readFileSync(join(wurzel, "firestore.rules"), "utf8");

// WARUM ES DIESE DATEI GIBT.
//
// Von 32 fertigen Analysen haben 13 ihren Befund gesehen - genau die 13,
// die erreichbar waren. Die Nummer ist der zweite Weg dorthin, und jeder
// Fehler darin kostet einen Patienten, der seinen Befund nie liest.

test("normale kosovarische Nummern gehen durch", () => {
  for (const roh of ["044123456", "044 123 456", "044-123-456", "049/123/456"]) {
    const e = telefonPruefen(roh);
    assert.equal(e.ok, true, `${roh} wurde abgewiesen`);
  }
});

test("wie Menschen Nummern aufschreiben, wird nicht bestraft", () => {
  // Klammern, Punkte und Leerzeichen sind kein Fehler des Patienten.
  assert.equal(telefonPruefen("+383 (0)44 123 456").ok, true);
  assert.equal(telefonPruefen("+383.44.123.456").ok, true);
  assert.equal(telefonPruefen("  044 123 456  ").ok, true);
});

test("die Diaspora wird nicht ausgesperrt", () => {
  // Ein guter Teil der Patienten sitzt in Deutschland und der Schweiz.
  // Eine Laengenregel je Land haette genau die weggeworfen.
  for (const roh of ["+4917612345678", "+41791234567", "+355692345678"]) {
    assert.equal(telefonPruefen(roh).ok, true, `${roh} wurde abgewiesen`);
  }
});

test("00 wird zu + - das ist Regel, nicht Raten", () => {
  assert.equal(telefonPruefen("0038344123456").nummer, "+38344123456");
  assert.equal(telefonPruefen("+38344123456").nummer, "+38344123456");
});

test("ohne gesetzte Vorwahl wird kein Land erraten", () => {
  // Dieselbe 044 gibt es in Kosovo UND in Albanien. Ein Anruf ins falsche
  // Land kommt nicht an - also bleibt die Null stehen.
  assert.equal(telefonPruefen("044123456").nummer, "044123456");
  // Erst wenn die Kampagne ein Land bedient, wird daraus die volle Form.
  assert.equal(telefonPruefen("044123456", "+383").nummer, "+38344123456");
  assert.equal(telefonPruefen("044123456", "+355").nummer, "+35544123456");
});

test("was sicher keine Nummer ist, wird mit Grund abgewiesen", () => {
  assert.deepEqual(telefonPruefen(""), { ok: false, grund: "leer" });
  assert.deepEqual(telefonPruefen("   "), { ok: false, grund: "leer" });
  assert.equal(telefonPruefen("044").grund, "kurz");
  assert.equal(telefonPruefen("0441234567890123456").grund, "lang");
  // Wer unsicher ist, schreibt tatsaechlich so etwas hinein.
  assert.equal(telefonPruefen("044 ose 045").grund, "zeichen");
  assert.equal(telefonPruefen("nuk e di").grund, "zeichen");
  // Ein Plus gehoert nach vorne und nirgendwo sonst.
  assert.equal(telefonPruefen("044+123456").grund, "zeichen");
});

// DIE NUMMER LEBT JETZT IM TRICHTER, NICHT AUF DER WARTESEITE.
//
// Dort war sie ein Angebot - und ein Angebot schlaegt man aus. Von 32
// fertigen Analysen haben 13 ihren Befund gesehen: genau die 13, die
// erreichbar waren. Jetzt ist sie eine Frage wie der Name, und ohne sie
// geht es nicht weiter.

test("ohne taugliche Nummer geht der Trichter nicht weiter", () => {
  const weiter = app.slice(app.indexOf("\n  #frageWeiter()"), app.indexOf("\n  #frageZurueck()", app.indexOf("\n  #frageWeiter()")));
  // Geprueft wird VOR dem Schreiben und vor dem Weitergehen. Geprueft
  // wird die Reihenfolge, nicht der Wortlaut: Ein Test, der an der Laenge
  // eines Blocks haengt, faellt beim naechsten Kommentar.
  assert.match(weiter, /if \(!this\.#antwortTaugt\(frage, wert\)\)/,
    "Eine untaugliche Antwort kommt durch");
  const pruefen = weiter.indexOf("#antwortTaugt");
  assert.ok(pruefen >= 0 && pruefen < weiter.indexOf("this.#frageSchreiben()"),
    "Geschrieben wird, bevor geprueft ist");
  assert.ok(pruefen < weiter.indexOf("this.fragen.i += 1"),
    "Weitergegangen wird, bevor geprueft ist");
  // Und der Ausstieg liegt dazwischen - sonst liefe es trotzdem weiter.
  const ausstieg = weiter.indexOf("return;", pruefen);
  assert.ok(ausstieg > 0 && ausstieg < weiter.indexOf("this.#frageSchreiben()"),
    "Eine untaugliche Antwort haelt den Weg nicht an");
});

test("jeder Grund fuehrt zu einem Satz, den der Patient lesen kann", () => {
  // Ein Knopf, der stumm nicht reagiert, sagt nicht, was fehlt - und wer
  // nicht weiss, was fehlt, hoert auf.
  const weiter = app.slice(app.indexOf("\n  #frageWeiter()"), app.indexOf("\n  #frageZurueck()", app.indexOf("\n  #frageWeiter()")));
  for (const [grund, schluessel] of [["leer", "telLeer"], ["kurz", "telKurz"],
    ["lang", "telLang"], ["zeichen", "telZeichen"]]) {
    assert.ok(weiter.includes(`${grund}: "${schluessel}"`), `Fuer "${grund}" gibt es keinen Satz`);
    assert.ok(FRAGEN_TEXTE[schluessel], `${schluessel} steht nicht in den Texten`);
  }
});

test("das Feld traegt die Zifferntastatur", () => {
  // Ohne inputmode kommt auf dem Telefon die Buchstabentastatur - das ist
  // der Unterschied zwischen "kurz eintippen" und "aufgeben".
  const zeichnen = app.slice(app.indexOf("\n  #frageZeichnen({"), app.indexOf("\n  #frageAntwort("));
  assert.match(zeichnen, /feld\.type = frage\.typ === "tel" \? "tel" : "text"/);
  assert.match(zeichnen, /feld\.inputMode = frage\.typ === "tel" \? "tel" : "text"/);
  assert.match(zeichnen, /feld\.autocomplete = frage\.typ === "tel" \? "tel"/);
});

test("die Nummer geht getrennt von allem anderen hinaus", () => {
  // Die Lehre aus der Anamnese: Ein Feld, das die Regeln nicht kennen,
  // weist mit hasOnly den GANZEN Schreibvorgang ab - still, mit 403.
  const schreiben = app.slice(app.indexOf("\n  #frageSchreiben()"), app.indexOf("\n  #frageWeiter()"));
  const aufrufe = schreiben.match(/this\.sitzung\.ergaenze\(/g) || [];
  assert.equal(aufrufe.length, 2,
    "Anamnese und Stammdaten muessen zwei Schreibvorgaenge sein");
  assert.match(schreiben, /einzeln\.phone = /,
    "Die Nummer geht nicht in ihr eigenes Feld");
});

test("phone und phoneConsent stehen in den Firestore-Regeln", () => {
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const liste = regeln.slice(regeln.indexOf("hasOnly([", anfang), regeln.indexOf("])", anfang));
  for (const feld of ["phone", "phoneConsent"]) {
    assert.ok(liste.includes(`"${feld}"`), `${feld} fehlt in der erlaubten Liste`);
  }
  assert.match(regeln.slice(anfang), /data\.phone is string && data\.phone\.size\(\) <= 40/);
});

// DIE WARTESEITE IST DAS TOR - ZWEI WEGE ZUM SELBEN ZIEL.
//
// Die Nummer war eine Weile Pflichtfrage im Trichter. Das loeste das
// Problem und schuf ein neues: Sie stand zwischen dem fertigen Scan und
// dem Ergebnis, und wer dort nicht tippen wollte, verlor alles, was er
// gerade getan hatte.
//
// Jetzt steht sie dort, wo sie hingehoert - auf der Warteseite, neben
// WhatsApp. Wer eines von beiden tut, ist erreichbar. Wer nichts tut,
// bekommt seinen Befund nie zu sehen, und genau das sagt die Zeile
// darunter.
test("die Warteseite fragt nach dem Kontakt - auf zwei Wegen", () => {
  assert.ok(html.includes('id="an-pritnr"'), "Das Nummernfeld fehlt auf der Warteseite");
  assert.ok(html.includes('id="an-pritwa"'), "Der WhatsApp-Knopf fehlt");
  assert.ok(astra.includes("#nummerSchicken"), "Die Warteseite nimmt keine Nummer entgegen");

  // Beide stehen im selben Kasten und gleich gross: Sieht einer wie der
  // Hauptweg und der andere wie ein Rest aus, hat wer kein WhatsApp hat
  // gar keinen.
  const tor = html.slice(html.indexOf('id="an-pritgate"'), html.indexOf('id="an-pritgati"'));
  assert.ok(tor.includes('id="an-pritwa"') && tor.includes('id="an-pritnr"'),
    "WhatsApp und Nummer stehen nicht im selben Kasten");
  assert.ok(tor.indexOf('id="an-pritwa"') < tor.indexOf('id="an-pritnr"'),
    "Die Reihenfolge stimmt nicht - WhatsApp ist der Weg, den die meisten gehen");

  // Und der Grund steht darunter, nicht darueber: Oben waere er eine
  // Bedingung, die man erst lesen muss.
  assert.ok(tor.indexOf('id="an-pritgatewarum"') > tor.indexOf('id="an-pritnr"'),
    "Der Grund steht ueber den beiden Wegen statt darunter");

  const texte = readFileSync(join(wurzel, "apps/lifeskin-astra/astra-texte.js"), "utf8");
  // Die Ueberschrift fragt nach dem WIE, nicht nach dem OB: "Moechten Sie
  // benachrichtigt werden?" liesse "nein" zu - auf die eine Sache, von der
  // abhaengt, ob dieser Mensch seinen Befund je zu sehen bekommt.
  assert.match(texte, /pritGateTitel:[\s\S]{0,160}Ku t'ju njoftojmë/);
  assert.ok(!texte.includes("Dëshironi t'ju kontaktoj"),
    "Der Kontakt wird wieder als Wunsch erfragt");
});

// DIE NUMMER IST KEINE FRAGE MEHR, SONDERN EIN SCHRITT.
//
// Sie stand auf der Warteseite und war dort ein Angebot - und ein Angebot
// schlaegt man aus. Von 32 fertigen Analysen haben 13 ihren Befund
// gesehen: genau die 13, die erreichbar waren. Jetzt steht sie im
// Trichter, nach dem Namen, und ohne sie geht es nicht weiter.
test("die Nummer ist eine Pflichtfrage im Trichter", () => {
  const letzte = FRAGEN[FRAGEN.length - 1];
  assert.equal(letzte.id, "numri", "Die Nummer ist nicht die letzte Frage");
  assert.equal(letzte.typ, "tel", "Die Nummer bekommt nicht die Zifferntastatur");
  // Direkt nach dem Namen - erst wer er ist, dann wie man ihn erreicht.
  assert.equal(FRAGEN[FRAGEN.length - 2].id, "emri");

  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
  // Ohne taugliche Nummer geht der Knopf nicht weiter.
  assert.match(app, /if \(!this\.#antwortTaugt\(frage, wert\)\) \{/,
    "Eine untaugliche Antwort kommt durch");
  assert.match(app, /if \(frage\?\.typ === "tel"\) return telefonPruefen\(/,
    "Die Nummer wird nicht geprueft");
  // Und der Grund steht als Satz da - ein Knopf, der stumm nicht reagiert,
  // sagt nicht, was fehlt.
  for (const schluessel of ["telLeer", "telKurz", "telLang", "telZeichen"]) {
    assert.ok(app.includes(schluessel), `Fuer ${schluessel} gibt es keinen Satz`);
  }
});

test("wer die Warteseite sieht, zaehlt als Analyse", () => {
  // Gezaehlt wurde ab der fertigen Aufnahme - zu frueh: Dazwischen liegen
  // sechs Fragen, und wer dort weggeht, hinterlaesst keinen Fall, den
  // jemand befunden koennte.
  assert.equal(istAnalyse(normalisiere("a", { step: "captured" })), false);
  assert.equal(istAnalyse(normalisiere("b", { step: "numri" })), false);
  assert.equal(istAnalyse(normalisiere("c", { step: "result", warteseiteGeoeffnet: true })), true);
  // Und ein alter Lauf, der laengst weiter ist, zaehlt auch ohne die Marke.
  assert.equal(istAnalyse(normalisiere("d", { step: "ordered" })), true);
});

// Die Warteseite ist kein Befund - der Trichter trennt sie jetzt.
test("der Trichter zaehlt jeden Bildschirm und keinen doppelt", () => {
  const ids = TRICHTER_STUFEN.map((s) => s.id);
  // Die Bildschirme des Trichters, in der Reihenfolge des Wegs - und zwar
  // die, die WIRKLICH JEDER sieht: Landingpage, Wahl, Name+Alter. Die
  // vier Fragen und die Nummernfrage sind aus dem Weg; eine Stufe, die
  // niemand mehr erreicht, ist keine Messung, sondern eine Treppe ins
  // Nichts.
  //
  // Der Scan steht NICHT darin, seit der Wahlbildschirm zwei Wege
  // aufmacht: Ein kumulativer Trichter haette jeden mitgezaehlt, der ohne
  // Scan weitergegangen ist. Er steht in seinem eigenen Kasten daneben.
  for (const stufe of ["gesehen", "wahl", "emri"]) {
    assert.ok(ids.includes(stufe), `Der Bildschirm ${stufe} zaehlt nicht`);
  }
  for (const weg of ["named", "numri", "camera"]) {
    assert.ok(!ids.includes(weg), `${weg} steht noch im Trichter, obwohl es den Bildschirm nicht gibt`);
  }
  assert.ok(!ids.includes("pyetja1"), "Eine Frage, die es nicht mehr gibt, steht im Trichter");
  // Der Trichter endet mit der Warteseite und dem, was der Patient dort
  // von sich aus tut. Der gelesene Befund steht in LESEMARKEN - dazwischen
  // liegt kein Bildschirm, sondern die Arbeit von Dr. Gashi.
  assert.ok(!ids.includes("berichtGeoeffnet"), "Der Befund steht noch im Trichter");
  assert.equal(ids[ids.length - 1], "whatsapp");
  // "erreichbar" IST jetzt eine Station: Auf der Warteseite hinterlaesst
  // der Patient seinen Kontakt - Nummer ODER WhatsApp -, und das ist das
  // Letzte, was er dort von sich aus tut. Zwei getrennte Stufen haetten
  // beide niedrig ausgesehen, obwohl zusammen jeder erreichbar ist.
  assert.ok(ids.includes("erreichbar"), "Der Kontakt zaehlt nicht");
  assert.ok(ids.indexOf("erreichbar") > ids.indexOf("warteseiteGeoeffnet"),
    "Der Kontakt steht vor der Warteseite - dort gibt es ihn noch gar nicht");

  const t = Object.fromEntries(baueTrichter([
    normalisiere("a", { step: "captured" }),
    normalisiere("b", { step: "result", warteseiteGeoeffnet: true })
  ]).map((s) => [s.id, s.anzahl]));
  assert.equal(t.wahl, 2, "Wer weiter ist als der Scan, hat die Wahl gesehen");
  // Der eine steckt bei der fertigen Aufnahme, der andere ist auf der
  // Warteseite: Name und Nummer hat nur der zweite hinter sich.
  assert.equal(t.emri, 1, "Nur einer ist ueber die Aufnahme hinaus");
  assert.equal(t.warteseiteGeoeffnet, 1);
  // Und erreichbar ist keiner von beiden: Weder liegt eine Nummer vor
  // noch wurde geschrieben.
  assert.equal(t.erreichbar, 0);
});

// KEINE FRAGE MEHR, SONDERN EINE ANSAGE.
//
// Hier stand "Dëshironi të njoftoheni kur të përfundojë?" - und auf eine
// Frage ist "nein" eine erlaubte Antwort. Sie ist hier keine: Ohne einen
// Weg zurueck bekommt der Patient seinen Befund nie zu sehen.
test("jeder Grund fuer eine abgelehnte Nummer sagt, was zu tun ist", () => {
  const texte = readFileSync(join(wurzel, "apps/lifeskin-astra/astra-texte.js"), "utf8");
  // "Ungueltig" sagt das nicht. Auch "leer" bekommt einen Satz: Der Knopf
  // darf nicht stumm bleiben, wenn das Feld noch leer ist.
  for (const schluessel of ["pritNrPflicht", "pritNrGabimShkurt", "pritNrGabimGjate",
    "pritNrGabimShenja", "pritNrGabimRuajtje"]) {
    assert.ok(texte.includes(`${schluessel}:`), `${schluessel} fehlt`);
    assert.match(astra, new RegExp(schluessel), `${schluessel} wird nie gezeigt`);
  }
  // UND ERST SPEICHERN, DANN BESTAETIGEN. Ein "Gati", das erscheint, bevor
  // der Schreibvorgang durch ist, ist eine Luege, sobald er scheitert: Der
  // Patient wartet auf einen Anruf, den niemand machen kann.
  const schicken = astra.slice(astra.indexOf("async #nummerSchicken()"));
  const rumpf = schicken.slice(0, schicken.indexOf("\n  // Den Link kopieren"));
  assert.ok(rumpf.indexOf("await this.quelle.merken") < rumpf.indexOf("#pritTorPruefen"),
    "Bestaetigt wird, bevor die Nummer wirklich steht");
  assert.match(rumpf, /if \(!antwort\?\.ok\) \{ melde\("pritNrGabimRuajtje"\); return; \}/);
  assert.match(rumpf, /phoneConsent: true/, "Die Einwilligung wird nicht mitgeschrieben");
});

test("die Warteseite zaehlt nicht mehr als gelesener Befund", () => {
  // Die Marke haengt am gezeigten Bildschirm, nicht am Laden der Seite.
  assert.match(astra, /if \(name === "prit"\) this\.#markeSetzen\("warteseiteGeoeffnet"\);/);
  assert.match(astra, /if \(name === "fertig"\) this\.#markeSetzen\("berichtGeoeffnet"\);/);
  // Und beim Laden der Seite wird keine der beiden mehr geschrieben.
  const start = astra.slice(astra.indexOf("this.daten = await this.quelle.bericht()"),
    astra.indexOf("#zeige(name) {"));
  assert.ok(!/merken\(\{\s*berichtGeoeffnet/.test(start),
    "Das Laden der Seite zaehlt weiter als gelesener Befund");
  // Die Regeln kennen das neue Feld - sonst weist hasOnly still den
  // ganzen Schreibvorgang ab.
  const anfang = regeln.indexOf("function lifeskinSessionShapeOk()");
  const liste = regeln.slice(regeln.indexOf("hasOnly([", anfang), regeln.indexOf("])", anfang));
  assert.ok(liste.includes('"warteseiteGeoeffnet"'), "warteseiteGeoeffnet fehlt in den Regeln");
});

// ══ WAS MITKOMMT, WENN JEMAND SEINE NUMMER NICHT AUSWENDIG WEISS ═════
//
// HIER HOEREN DIE LEUTE AUF, und der Grund liegt nicht an der Nummer,
// sondern daran, was man tun muss, um sie zu haben: Die wenigsten
// wissen sie auswendig. Sie holen sie sich - aus den Kontakten, aus
// WhatsApp, aus einem "Anrufen"-Knopf, von einer Webseite.
//
// GEMESSEN: Von vierzehn Schreibweisen, die so wirklich in dieses Feld
// kommen, fielen FUENF durch - und jede davon war eine gueltige Nummer.
// Was sie durchfallen liess, stand nicht auf dem Bildschirm: iOS haengt
// an eine Nummer aus den Kontakten Laufrichtungsmarken (U+200E, U+202A),
// damit "+383" nicht verdreht angezeigt wird. Fuer den, der davorsitzt,
// steht dort seine Nummer. Fuer die Pruefung stand dort ein Zeichen,
// das keine Ziffer ist.
//
// Eine Seite, die nein sagt, ohne dass etwas zu sehen waere, das man
// aendern koennte - da hoert jemand auf, und zwar zu Recht.
test("eine eingefuegte Nummer geht durch, egal woher sie kommt", () => {
  const gut = [
    ["‎+383 44 123 456", "iOS-Kontakte, Laufrichtungsmarke davor"],
    ["‪+383 44 123 456‬", "iOS-Kontakte, als Klammer um die Nummer"],
    ["+383 44 123 456‏", "Laufrichtungsmarke dahinter"],
    ["⁦+383 44 123 456⁩", "die neuere Form derselben Klammer"],
    ["﻿044 123 456", "Markierung am Anfang einer Einfuegung"],
    ["044­123­456", "weiches Trennzeichen aus Fliesstext"],
    ["044–123–456", "Gedankenstrich von einer Webseite"],
    ["044‑123‑456", "geschuetzter Bindestrich"],
    ["044−123−456", "Minuszeichen"],
    ["（044） 123 456", "breite Klammern"],
    ["tel:+38344123456", "aus einem Anrufen-Knopf kopiert"],
    ["+383 44 123 456", "geschuetzte Leerzeichen"],
    // Und das, was schon vorher ging, muss weiter gehen.
    ["044 123 456", "einfach getippt"],
    ["00383 44 123 456", "mit 00 statt Plus"],
    ["(044) 123-456", "mit Klammern und Strich"],
    ["+49 151 12345678", "Deutschland"],
    ["+41 79 123 45 67", "Schweiz"]
  ];
  for (const [roh, woher] of gut) {
    const geprueft = telefonPruefen(roh, "+383");
    assert.ok(geprueft.ok, `Abgewiesen: ${woher} (${geprueft.grund})`);
    assert.match(geprueft.nummer, /^\+?\d{8,15}$/,
      `${woher} wird nicht sauber gespeichert: ${geprueft.nummer}`);
  }
});

// UND WAS WEITER NEIN BLEIBEN MUSS.
//
// Die Pruefung weiter aufzumachen, ist nur dann richtig, wenn das
// Falsche falsch bleibt: Eine Nummer, die in Heart steht und die
// niemand anrufen kann, ist schlimmer als gar keine - dann wartet ein
// Mensch auf einen Anruf, der nicht kommen kann.
test("was keine Nummer ist, wird weiter abgewiesen", () => {
  const schlecht = [
    ["", "leer"],
    ["   ", "leer"],
    ["‎‪⁩", "nur unsichtbare Zeichen"],
    ["044 oder 045", "unsicher getippt"],
    ["nuk e di", "ein Satz statt einer Nummer"],
    ["12345", "zu kurz"],
    ["1234567890123456789", "zu lang"],
    ["+383 44 123 45a", "ein Buchstabe mittendrin"]
  ];
  for (const [roh, was] of schlecht) {
    const geprueft = telefonPruefen(roh, "+383");
    assert.ok(!geprueft.ok, `Durchgelassen, obwohl ${was}: "${roh}"`);
    assert.ok(geprueft.grund, `Kein Grund genannt bei: ${was}`);
  }
});

// ══ WER KURZ HINAUSGEHT, FAENGT NICHT VON VORNE AN ═══════════════════
//
// Dieselbe Stelle, derselbe Grund: Wer seine Nummer aus den Kontakten
// holt, geht kurz aus der Seite heraus. Die Fenster von Instagram,
// Facebook und TikTok laden den Tab neu, sobald man aus ihm heraus und
// wieder hinein wechselt - das steht schon an #uebergeben() im Code.
//
// Zurueck kam man dann auf dem Einstieg. Name weg, Alter weg, Anliegen
// weg, und der Scan von eben war fuer diesen Menschen verloren. Ein
// zweites Mal macht das niemand.
test("der Trichter merkt sich, wo jemand stand und was er schrieb", () => {
  const quelle = app;

  // Gemerkt wird in sessionStorage: Das gehoert dem einen Tab,
  // ueberlebt ein Neuladen und ist beim naechsten Besuch von selbst
  // wieder weg - genau die Grenze, die "ein Besuch" meint.
  assert.match(quelle, /sessionStorage/, "Es wird nichts mehr gemerkt");
  assert.match(quelle, /STAND_SCHLUESSEL = "lifeskin:stand"/,
    "Der Stand liegt woanders - dann findet ihn niemand wieder");

  // NUR DIE DREI BILDSCHIRME, AUF DENEN MAN ETWAS SCHREIBT.
  //
  // Kamera und Aufnahme stehen bewusst NICHT dabei: Der Browser gibt
  // die Kamera nur auf einen frischen Fingerdruck frei, ein
  // wiederhergestellter Kamerabildschirm zeigte ein totes Bild. Und
  // "wahl"/"fotopara" haetten ein Pixel-Ereignis, das dann bei jedem
  // Neuladen doppelt fiele.
  const liste = /WIEDER_AUFNEHMBAR = Object\.freeze\(\[([^\]]+)\]\)/.exec(quelle);
  assert.ok(liste, "Die Liste der wiederaufnehmbaren Bildschirme fehlt");
  const schirme = liste[1].match(/"([a-z]+)"/g).map((s) => s.replace(/"/g, ""));
  assert.deepEqual(schirme, ["name", "anliegen", "tel"],
    "Es werden andere Bildschirme wiederaufgenommen als die drei mit Eingaben");

  // Gemerkt wird, was in den FELDERN steht, nicht im mitgefuehrten
  // Zustand: Was der Browser selbst einsetzt (Autofill, eine Einfuegung
  // ueber das Kontextmenue) loest kein input-Ereignis aus.
  for (const feld of ["#ls-namefeld", "#ls-anliegenfeld", "#ls-telfeld"]) {
    assert.ok(quelle.includes(`$("${feld}")?.value`),
      `${feld} wird nicht aus dem Feld gelesen`);
  }

  // Und gemerkt wird IM AUGENBLICK DES HINAUSGEHENS. "pagehide" kommt
  // nicht auf jedem Geraet, wenn eine App in den Hintergrund geht -
  // "visibilitychange" auf hidden schon. Deshalb beide, dazu waehrend
  // des Tippens, falls eine App hart weggeraeumt wird.
  assert.match(quelle, /window\.addEventListener\("pagehide", standSichern\)/,
    "Beim Verlassen der Seite wird nichts gesichert");
  assert.match(quelle, /visibilityState === "hidden"\) standSichern\(\)/,
    "Beim Wechsel in den Hintergrund wird nichts gesichert");
  assert.match(quelle, /addEventListener\("input", standSichern\)/,
    "Waehrend des Tippens wird nichts gesichert");

  // Der Scan ist dabei nicht verloren: Die Aufnahmen liegen laengst in
  // Firestore, mitzunehmen ist nur ihre Anzahl.
  assert.match(quelle, /fotoAnzahl: Number\(this\.zustand\.fotoAnzahl\) \|\| 0/,
    "Die Zahl der Aufnahmen geht beim Neuladen verloren");
  // Und der Weg, sonst fuehrt "Vazhdo" hinter der Nummer woandershin.
  assert.match(quelle, /typ: this\.zustand\.typ \|\| ""/, "Der Weg geht verloren");
});

test("das Wiederaufnehmen zaehlt keinen Schritt ein zweites Mal", () => {
  const quelle = app;
  // Die drei Bildschirme werden beim Aufnehmen OHNE Meldung aufgebaut:
  // Der Schritt steht laengst in der Sitzung, und ein Fenster, das den
  // Tab bei jedem Wechsel neu laedt, zaehlte denselben Besuch sonst
  // immer wieder.
  for (const ruf of ["#nameZeigen(false)", "#anliegenZeigen(false)", "#telZeigen(false)"]) {
    assert.ok(quelle.includes(ruf), `${ruf} fehlt - der Schritt faellt doppelt`);
  }
  for (const schritt of ["emri", "problemi", "numri"]) {
    assert.ok(quelle.includes(`if (melden) this.sitzung.schritt("${schritt}")`),
      `${schritt} laesst sich nicht stummschalten`);
  }
});
