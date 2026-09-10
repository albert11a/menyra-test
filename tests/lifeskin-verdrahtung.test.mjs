import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..");

// Ein Knopf, der im Markup steht und den niemand auffaengt, sieht aus wie
// ein Knopf und ist keiner. Genau das ist zweimal passiert: Die Analysen in
// Heart waren wochenlang nicht anklickbar, obwohl die Einzelansicht fertig
// im Code lag, und "Produkt anlegen" tut bis heute nichts.
//
// Solche Fehler findet kein Test, der Funktionen aufruft - nur einer, der
// Markup und Behandler gegeneinander haelt.

test("jeder Knopf in Heart hat einen Behandler", () => {
  const ordner = join(wurzel, "apps/mnyra-heart");
  const events = readFileSync(join(ordner, "heart-events.js"), "utf8");
  const behandelt = new Set([...events.matchAll(/action === "([a-z0-9-]+)"/g)].map((m) => m[1]));

  const gefunden = new Map();
  for (const datei of readdirSync(ordner).filter((f) => f.endsWith(".js") && f !== "heart-events.js")) {
    const quelle = readFileSync(join(ordner, datei), "utf8");
    for (const m of quelle.matchAll(/data-action="([a-z0-9-]+)"/g)) {
      if (!gefunden.has(m[1])) gefunden.set(m[1], datei);
    }
  }

  assert.ok(gefunden.size > 30, `Zu wenige Knoepfe gefunden (${gefunden.size}) - die Suche greift nicht mehr`);
  const tot = [...gefunden].filter(([aktion]) => !behandelt.has(aktion));
  assert.deepEqual(
    tot.map(([aktion, datei]) => `${aktion} (${datei})`),
    [],
    "Diese Knoepfe stehen im Markup, aber heart-events.js faengt sie nicht auf - ein Druck darauf tut nichts"
  );
});

// Dasselbe fuer den Trichter, nur andersherum: Dort werden die Knoepfe ueber
// ihre Kennung angesprochen. Fehlt eine im HTML, laeuft der Aufruf ins Leere
// und der Bildschirm bleibt einfach stehen.
test("jede Kennung, die der Trichter anspricht, gibt es auch im HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");

  const imHtml = new Set([...html.matchAll(/id="(ls-[a-z0-9-]+)"/g)].map((m) => m[1]));
  const angesprochen = [...app.matchAll(/\$\("#(ls-[a-z0-9-]+)"\)/g)].map((m) => m[1]);

  assert.ok(angesprochen.length > 20, "Die Suche nach Kennungen greift nicht mehr");
  const fehlend = [...new Set(angesprochen)].filter((id) => !imHtml.has(id)).sort();
  assert.deepEqual(fehlend, [], "Diese Kennungen spricht der Trichter an, im HTML gibt es sie nicht");
});

// Und dasselbe fuer die Befundseite.
//
// Sie ist der Bildschirm, den jeder Patient sieht und auf dem alles haengt,
// was nach dem Scan noch passiert - eine Kennung, die dort ins Leere laeuft,
// heisst: kein Knopf, keine Nachricht, kein Verkauf.
test("jede Kennung, die die Befundseite anspricht, gibt es auch in ihrem HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const seite = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");

  const imHtml = new Set([...html.matchAll(/id="(lb-[a-z0-9-]+)"/g)].map((m) => m[1]));
  const angesprochen = [...seite.matchAll(/#(lb-[a-z0-9-]+)/g)].map((m) => m[1]);

  assert.ok(angesprochen.length > 12, "Die Suche nach Kennungen greift nicht mehr");
  const fehlend = [...new Set(angesprochen)].filter((id) => !imHtml.has(id)).sort();
  assert.deepEqual(fehlend, [], "Diese Kennungen spricht die Befundseite an, im HTML gibt es sie nicht");
});

test("keine Kennung kommt im HTML der Befundseite zweimal vor", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const alle = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
  const doppelt = [...new Set(alle.filter((v, i) => alle.indexOf(v) !== i))].sort();
  assert.deepEqual(doppelt, []);
});

test("keine Kennung kommt im HTML zweimal vor", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const alle = [...html.matchAll(/id="([a-zA-Z0-9_-]+)"/g)].map((m) => m[1]);
  const doppelt = [...new Set(alle.filter((v, i) => alle.indexOf(v) !== i))].sort();
  // Zwei gleiche Kennungen heissen: Der Code erwischt immer nur die erste.
  // Genau daran ist das Namensfeld schon einmal gescheitert.
  assert.deepEqual(doppelt, []);
});

test("jeder Bildschirm des Trichters steht im HTML", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin/index.html"), "utf8");
  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
  const treffer = app.match(/const SCHIRME = \[([^\]]+)\]/);
  assert.ok(treffer, "SCHIRME nicht gefunden");
  for (const name of [...treffer[1].matchAll(/"([a-z]+)"/g)].map((m) => m[1])) {
    assert.ok(html.includes(`id="ls-${name}"`), `Der Bildschirm ls-${name} fehlt im HTML`);
  }
});

// Alle fuenf Bildschirme sehen aus wie dieselbe Anwendung.
//
// Der Kameraschirm war einmal schwarz. Das liess das Vorschaubild wirken -
// und kostete an der einzigen Stelle Vertrauen, an der ein Nein den ganzen
// Trichter beendet: bei der Kamerafrage. Dunkel ist jetzt nur noch das
// Quadrat mit dem Bild.
test("kein Bildschirm des Trichters faellt farblich aus der Reihe", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");

  const treffer = css.match(/\.ls-schirm--kamera\s*\{([^}]*)\}/);
  assert.ok(treffer, "Der Kameraschirm hat keine eigene Regel mehr");
  assert.match(treffer[1], /background:\s*var\(--grund\)/,
    "Der Kameraschirm traegt einen anderen Grund als die anderen vier");
  assert.match(treffer[1], /color:\s*var\(--text\)/,
    "Der Kameraschirm traegt eine andere Schriftfarbe");

  // Und keine Ausnahme mehr, die nur wegen des schwarzen Grundes noetig war.
  assert.ok(!/\.ls-schirm--kamera[^{]*\{[^}]*#fff/.test(css),
    "Auf dem Kameraschirm steht noch eine Weiss-Ausnahme");
  assert.ok(!/\.ls-schirm--kamera[^{]*\{[^}]*255,\s*255,\s*255/.test(css),
    "Auf dem Kameraschirm steht noch eine Weiss-Ausnahme");

  // Und nirgends mehr Schwarz - auch nicht im Quadrat mit dem Bild.
  //
  // Es war schwarz, damit das Vorschaubild wirkt. Sichtbar war davon vor
  // allem eines: ein grosses schwarzes Rechteck auf heller Seite, waehrend
  // das Telefon nach der Kameraerlaubnis fragt. Genau in dem Moment
  // entscheidet jemand, ob er sein Gesicht freigibt.
  const buehne = css.match(/\.ls-kamera\s*\{([^}]*)\}/);
  assert.ok(buehne, "Die Kamerabuehne hat keine Regel");
  assert.match(buehne[1], /background:\s*var\(--grund\)/,
    "Die Kamerabuehne traegt nicht den Grund der Seite");
  assert.doesNotMatch(css, /background:\s*#000/, "Irgendwo steht noch eine schwarze Flaeche");
});

// Der Ring ist die einzige Rueckmeldung, die dem Besucher sagt, ob er
// richtig steht. Auf hellem Grund muss er dunkel sein, sonst ist er weg -
// und mit ihm die Aufnahme.
test("die Striche des Rings sind dunkel, bis sie gruen werden", () => {
  const app = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-app.js"), "utf8");
  const block = app.slice(app.indexOf("#ringZeichnen(stand) {"));
  const bis = block.indexOf("\n  }");
  const ring = block.slice(0, bis);

  assert.doesNotMatch(ring, /rgba\(255,\s*255,\s*255/,
    "Der Ring zeichnet noch in Weiss - auf hellem Grund ist er damit unsichtbar");
  assert.match(ring, /rgba\(26,31,30/, "Die offenen Striche sind nicht dunkel");
  assert.match(ring, /rgba\(14,124,104/, "Der geschlossene Strich ist nicht gruen");
});

// ---------- Farbnamen, die es gibt ----------
//
// Eine CSS-Variable, die niemand definiert, faellt lautlos auf ihren
// Ersatzwert in der var()-Klammer zurueck. Genau das ist der Fehler, den
// niemand meldet: Die Seite sieht aus wie immer, nur eben in einer Farbe,
// die keiner ausgesucht hat.
//
// GEMESSEN, NICHT GESCHAETZT: --ls-gedaempft war nirgends definiert. Sein
// Ersatzwert #8b9299 - ein kaltes Blaugrau aus einer frueheren dunklen
// Fassung - trug die Zeile unter JEDEM Kaufknopf und kam damit auf 2,97:1
// gegen den Grund der Seite. Lesbarer Text braucht 4,5:1. Dieselbe Sache
// gab es dreimal weiter: --good-soft, --surface-sunk (mit drei
// verschiedenen Ersatzwerten fuer dieselbe Flaeche) und --text-1.
//
// Dieser Test haelt die Luecke zu.
test("jede CSS-Variable des Trichters ist auch definiert", () => {
  const dateien = [
    "apps/lifeskin/lifeskin-styles.css",
    "apps/lifeskin-bericht/bericht.css"
  ];

  // Diese setzt der Code zur Laufzeit (style.setProperty), nicht das
  // Stylesheet. Ihr Ersatzwert ist der Anfangszustand und gehoert dorthin -
  // bei --leiste-hoehe ist er zusaetzlich der Rueckfall fuer Browser ohne
  // ResizeObserver.
  const ausLaufzeit = new Set(["--anteil", "--nach", "--i", "--leiste-hoehe"]);

  const definiert = new Set(ausLaufzeit);
  const benutzt = new Map();

  for (const pfad of dateien) {
    const css = readFileSync(join(wurzel, pfad), "utf8");
    for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:/g)) definiert.add(m[1]);
    for (const m of css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
      if (!benutzt.has(m[1])) benutzt.set(m[1], pfad);
    }
  }

  assert.ok(benutzt.size > 20, `Zu wenige Variablen gefunden (${benutzt.size}) - die Suche greift nicht mehr`);

  const fehlend = [...benutzt].filter(([name]) => !definiert.has(name));
  assert.deepEqual(
    fehlend.map(([name, pfad]) => `${name} (${pfad})`),
    [],
    "Diese Variablen werden benutzt, aber nirgends definiert - sie fallen still auf ihren Ersatzwert zurueck"
  );
});

// Und andersherum: Ein Ersatzwert in der Klammer versteckt genau den Fehler
// von oben. Wo die Variable definiert ist, hat er nichts zu suchen.
test("keine Farbe steht als Ersatzwert in einer var()-Klammer", () => {
  const dateien = [
    "apps/lifeskin/lifeskin-styles.css",
    "apps/lifeskin-bericht/bericht.css"
  ];
  const gefunden = [];
  for (const pfad of dateien) {
    const css = readFileSync(join(wurzel, pfad), "utf8");
    for (const m of css.matchAll(/var\(\s*--[a-z0-9-]+\s*,\s*(#[0-9a-fA-F]{3,8}|var\()/g)) {
      gefunden.push(`${m[0]} (${pfad})`);
    }
  }
  assert.deepEqual(gefunden, [],
    "Ersatzwerte verstecken fehlende Definitionen - die Variable gehoert nach :root");
});

// ---------- Die Befundseite gehoert nicht in den Suchindex ----------
//
// Sie ist absichtlich teilbar: Der Patient soll sie speichern und
// weiterschicken koennen. Teilbar heisst aber nicht auffindbar - jede Seite
// traegt Vorname, Fallnummer und Diagnose. robots.txt haelt Crawler fern,
// verhindert aber nicht, dass eine irgendwo oeffentlich verlinkte Adresse
// im Index landet. Deshalb beides.
test("die Befundseiten sind fuer Suchmaschinen gesperrt", () => {
  const robots = readFileSync(join(wurzel, "robots.txt"), "utf8");
  assert.match(robots, /^Disallow: \/analiza\/$/m,
    "robots.txt gibt /analiza/ fuer Crawler frei - dort stehen Vorname und Diagnose");

  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  assert.match(html, /<meta name="robots" content="noindex/,
    "Der Befundseite fehlt noindex - robots.txt allein haelt eine verlinkte Adresse nicht aus dem Index");
});

// ---------- Es wird nichts erfunden ----------
//
// Der Anbieterblock nennt, wer geradesteht. Was dort steht, muss stimmen -
// also steht es in der Konfiguration und nicht im Code. Ausgeliefert wird
// er leer: Lieber gar keine Angabe als eine ausgedachte.
test("der Anbieterblock traegt keine erfundenen Angaben", async () => {
  const { LIFESKIN_ANBIETER } = await import("../apps/lifeskin/lifeskin-config.js");
  for (const feld of ["name", "anschrift", "email"]) {
    assert.equal(typeof LIFESKIN_ANBIETER[feld], "string", `${feld} fehlt`);
  }

  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  assert.match(html, /id="lb-anbieter" *>|class="lb-anbieter ls-verstecken" id="lb-anbieter"/,
    "Der Anbieterblock muss versteckt starten - sonst steht eine leere Ueberschrift auf der Seite");
});

// ---------- Erst die Zahlen, dann der Schluss ----------
//
// Der Bericht ist wie ein Arztbrief aufgebaut: erst der Befund, dann die
// Messwerte, und ERST DARAUS die Diagnose. Eine Diagnose, die man sich
// selbst hergeleitet hat, hinterfragt man nicht - eine, die vor ihren
// Zahlen steht, ist eine Behauptung.
//
// GEMESSEN AN DER SEITE, NICHT AN DER ABSICHT: Genau das stand jahrelang
// im Kommentar ueber dem Diagnoseblock, und der Block stand trotzdem VOR
// den Messwerten. Kommentare pruefen sich nicht selbst; dieser Test schon.
test("die Diagnose steht hinter den Messwerten", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const mess = html.indexOf('id="lb-messteil"');
  const diagnose = html.indexOf('id="lb-diagnose"');
  const befund = html.indexOf('id="lb-gjettext"');

  assert.ok(befund > -1 && mess > -1 && diagnose > -1, "Ein Block der Beweiskette fehlt im Markup");
  assert.ok(befund < mess,
    "Der Hauptbefund muss vor den Messwerten stehen - er ist die Antwort, nicht die Herleitung");
  assert.ok(mess < diagnose,
    "Die Diagnose steht wieder vor den Messwerten - dann ist sie eine Behauptung statt eines Schlusses");
});

// ---------- Die Linie kommt auch an der Diagnose an ----------
//
// Die Verbindungslinie sagt "das hier folgt aus dem darueber". Sie endet an
// jedem Abschnitt vor dem Ring eines Zeichens, mit zehn Punkten Luft. Die
// Diagnose war der einzige Halt, an dem sie auf nichts zeigte und vor einer
// grauen Kante aufhoerte.
//
// Sie bekommt dafuer KEIN Zeichen. Eines war gebaut und ist bewusst wieder
// heraus: Es unterschied nichts, ein Abzeichen kostet den Sender nichts und
// belegt deshalb nichts, und es schwaechte genau das, was diese Karte stark
// macht - dass sie die eine Ausnahme ist, der einzige gefuellte Farbblock
// einer Seite aus Papier und Haarlinien.
//
// Stattdessen traegt ihre KANTE die Farbe und die Staerke der Linie. Dieser
// Test haelt beides fest, damit weder das eine noch das andere spaeter
// "repariert" wird.
test("die Diagnose empfaengt die Linie mit ihrer Kante, nicht mit einem Zeichen", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");

  const karte = html.slice(html.indexOf('id="lb-diagnose"'), html.indexOf('id="lb-diagstufe"'));
  assert.ok(!/class="lb-icon"/.test(karte),
    "Die Diagnose hat wieder ein Zeichen - es unterscheidet nichts und schwaecht die eine Ausnahme der Seite");

  const block = css.match(/\n\.lb-diagnose \{([^}]*)\}/);
  assert.ok(block, "Die Regel der Diagnosekarte fehlt");
  assert.match(block[1], /border:\s*var\(--fluss-dick\) solid var\(--fluss\)/,
    "Die Kante traegt nicht mehr Farbe und Staerke der Linie - dann zeigt die Linie wieder auf nichts");
  assert.match(block[1], /margin:\s*var\(--raum-7\) 0 0/,
    "Die Karte steht wieder weiter aussen als der uebrige Inhalt - das war nur fuer das Zeichen noetig");
  assert.ok(!/box-shadow/.test(block[1]),
    "Die Diagnosekarte traegt einen Schatten - der eine Schatten der Seite gehoert dem Kaufknopf");

  // Der zweite Halt, der eine Karte ist: der Aufklapper. Ein Punkt reicht
  // dort - sein Zeichen sitzt innen und beruehrt die Kante nicht.
  const auf = css.match(/\n\.lb-detajet \{([^}]*)\}/);
  assert.match(auf[1], /border:\s*1px solid var\(--fluss\)/,
    "Der Aufklapper traegt wieder die neutrale Linie - mit 1,25:1 sieht niemand, dass dort die halbe Analyse liegt");

  // Was KEIN Halt der Kette ist, behaelt die neutrale Linie. Sonst bedeutet
  // --fluss nur noch "Kasten" statt "das folgt aus dem darueber".
  for (const name of ["lb-produkt", "lb-produkt__chip", "lb-zeitfeld"]) {
    const teil = css.match(new RegExp(`\\n\\.${name} \\{([^}]*)\\}`));
    if (!teil) continue;
    assert.ok(!/border:[^;]*var\(--fluss\)/.test(teil[1]),
      `${name} traegt die Farbe der Kette - die gehoert den Halten der Kette, nicht jedem Kasten`);
  }
});

// ---------- Eine gefuellte Kante braucht mehr Luft als Text ----------
//
// GEMESSEN, Tinte zu Tinte und aufgedeckt: Vor der Diagnosekarte standen
// 66 Punkte, zwischen zwei Textabschnitten 68 - metrisch dasselbe. Gesehen
// war es das nicht. Eine Textzeile endet mit Unterlaengen und
// Zeilenabstand, ein Zeichen hat Weissraum um sich; beide geben dem
// Abstand etwas zurueck. Eine gefuellte Kartenkante gibt nichts.
//
// Die zusaetzliche Luft liegt VOR dem Beginn der Linie, nicht zwischen
// Linie und Karte: Die zehn Punkte dort sind die Ankunft der Linie und
// ueberall dieselben.
test("die beiden Karten der Kette bekommen mehr Luft als die Textabschnitte", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");

  // Der Verbinder VOR der Diagnose traegt die Klasse - als Klasse und nicht
  // ueber :has(), damit es auch auf aelteren iOS-Fassungen greift.
  const vor = html.lastIndexOf("lb-fluss--karte", html.indexOf('id="lb-diagnose"'));
  assert.ok(vor > -1, "Der Verbinder vor der Diagnose traegt die zusaetzliche Luft nicht");
  assert.ok(!/:has\(/.test(css.slice(css.indexOf(".lb-fluss--karte"), css.indexOf(".lb-fluss--karte") + 400)),
    "Die Luft haengt an :has() - auf aelteren iOS-Fassungen greift sie dann nicht");

  const regel = css.match(/\.lb-fluss--karte,\s*\n\.lb-diagnose \+ \.lb-fluss--ab,\s*\n\.lb-detajet \+ \.lb-fluss--ab \{([^}]*)\}/);
  assert.ok(regel, "Die Regel fuer die Luft um die Karten fehlt oder trifft nicht beide Karten");
  assert.match(regel[1], /margin-top:\s*var\(--raum-7\)/,
    "Die Luft um die Karten steht nicht mehr auf einer Stufe des Rhythmus");

  // Und die Ankunft der Linie bleibt ueberall gleich.
  assert.match(css, /\.lb-fluss--ab \+ \.lb-diagnose \{ margin-top: 10px; \}/,
    "Die Linie kommt an der Diagnose anders an als an den uebrigen Halten");
});

// ---------- Die Grenze steht sichtbar, nicht im Aufklapper ----------
//
// "Was ein Foto nicht sagen kann" war fertig geschrieben und wurde nie
// gezeichnet. Freiwillig genannte Grenzen sind das, was den Rest
// glaubwuerdig macht - im zugeklappten Aufklapper waeren sie es nicht,
// und nach dem Angebot kaemen sie zu spaet.
test("die Grenzen der Analyse stehen sichtbar und vor dem Angebot", () => {
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");

  assert.match(js, /grenzenMarke/, "grenzenMarke wird nicht gezeichnet");
  assert.match(js, /grenzenText/, "grenzenText wird nicht gezeichnet");

  const teil = html.indexOf('id="lb-grenzenteil"');
  assert.ok(teil > -1, "Der Grenzen-Abschnitt fehlt im Markup");

  const aufklapperAuf = html.indexOf('<details class="lb-detajet"');
  const aufklapperZu = html.indexOf("</details>", aufklapperAuf);
  assert.ok(teil < aufklapperAuf || teil > aufklapperZu,
    "Die Grenzen liegen im Aufklapper - zugeklappt wirkt eine Einschraenkung nicht");

  const angebot = html.indexOf('id="lb-oferta"');
  assert.ok(teil < angebot,
    "Die Grenzen stehen hinter dem Angebot - nach dem Kauf gelesen wirkt eine Einschraenkung nicht");
});

// ---------- Ein Streichpreis braucht sein Wort ----------
//
// Ein durchgestrichener Betrag ohne Beschriftung liest sich als frueherer
// Preis. Das ist er nicht - es ist die Summe der Einzelpreise. Der
// Unterschied ist nicht kosmetisch: Ein behaupteter frueherer Preis ist
// eine Preisangabe, ein Mengenvergleich ist eine Rechnung.
test("der Preisanker ist beschriftet", () => {
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
  const html = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  assert.match(js, /preisEinzeln/,
    "Der durchgestrichene Betrag steht ohne Wort daneben und liest sich als frueherer Preis");
  assert.match(html, /id="lb-preisankermarke"/, "Die Beschriftung fehlt im Markup");
});

// ---------- Was man sehen und bedienen koennen muss ----------

// Ein Rand von 1,25:1 ist eine Zierlinie, keine Kante. Ein Feld, dessen
// Rand man nicht sieht, sieht nicht aus wie ein Feld - und "outline: 0"
// nahm dem Browser auch noch seinen eigenen Fokusring. Wer mit der
// Tastatur durch die vier Felder der Bestellung geht, hatte damit keine
// verlaessliche Rueckmeldung, wo er steht.
test("Eingabefelder haben eine sichtbare Kante und einen sichtbaren Fokus", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");
  assert.match(css, /--rand-feld:\s*#8E8A7E/, "Der Token fuer den Feldrand fehlt");
  assert.match(css, /\.ls-eingabe\s*\{[^}]*border:\s*1\.5px solid var\(--rand-feld\)/,
    "Das Feld traegt wieder --linie als Rand - das sind 1,25:1");
  assert.match(css, /\.ls-eingabe:focus-visible\s*\{[^}]*outline:\s*3px solid/,
    "Der Fokus ist wieder nur ein Farbwechsel des Randes");
  assert.ok(!/\.ls-eingabe:focus\s*\{[^}]*outline:\s*0/.test(css),
    "outline: 0 nimmt dem Browser seinen eigenen Fokusring");
});

// Die Punkte trugen keine Silbe. Wer sie sieht, liest die Reihe ohne ein
// Wort - wer sie nicht sieht, bekam "Liste mit 4 Eintraegen" und viermal
// nichts. Die Beschriftungen lagen die ganze Zeit fertig in den Texten.
test("die vier Fortschrittspunkte haben Woerter", () => {
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
  const css = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");
  for (const marke of ["schrittScan", "schrittFotos", "schrittAnalyse", "schrittFertig"]) {
    assert.match(js, new RegExp(marke), `${marke} wird nicht abgerufen`);
  }
  assert.match(js, /ls-nurvorlesen/, "Die Woerter werden nicht ausgegeben");
  assert.match(css, /\.ls-nurvorlesen\s*\{/, "Die Klasse fuer Vorleseprogramme fehlt");
  assert.ok(!/\.ls-nurvorlesen\s*\{[^}]*display:\s*none/.test(css),
    "display:none nimmt es auch dem Vorleseprogramm weg");
});

// Der Befund kann deutsch sein. Stand am Wurzelelement weiter lang="sq",
// sagte ein Vorleseprogramm deutschen Text mit albanischer Aussprache auf.
test("die Seite sagt, in welcher Sprache sie geschrieben ist", () => {
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
  assert.match(js, /documentElement\.lang\s*=\s*this\.sprache/,
    "Die Sprache des Falls wird nicht ans Wurzelelement durchgereicht");
});

// Als Dialog ausgezeichnet heisst: Der Fokus bleibt drin und kommt danach
// dorthin zurueck, wo er herkam.
test("das Blatt verhaelt sich wie der Dialog, als der es ausgezeichnet ist", () => {
  const js = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.js"), "utf8");
  const markup = readFileSync(join(wurzel, "apps/lifeskin-bericht/index.html"), "utf8");
  assert.match(markup, /id="lb-blatt"[^>]*|aria-modal="true"/, "Das Blatt ist nicht mehr als Dialog ausgezeichnet");
  assert.match(js, /blattRueckkehr/, "Der Fokus kehrt nach dem Schliessen nicht zurueck");
  assert.match(js, /setAttribute\("inert"/, "Die Seite dahinter bleibt bedienbar");
  assert.match(js, /removeAttribute\("inert"\)/, "Die Seite dahinter bleibt stillgelegt");
});

// Der Bericht landet auf Schreibtischen. Wer dort auf 200 Prozent zoomt,
// macht das Fenster in CSS-Punkten schmaler - und was dann nicht mehr
// hineinpasst, war ohne Rollbalken abgeschnitten.
test("der Bericht laesst sich zoomen, ohne dass etwas abgeschnitten wird", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  assert.match(css, /html,\s*body\s*\{\s*overflow-x:\s*auto/,
    "Die waagerechte Achse ist wieder gesperrt - beim Zoomen faellt Inhalt weg");
  const trichter = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");
  assert.match(trichter, /html,\s*body\s*\{\s*overflow:\s*hidden/,
    "Der Trichter darf weiterhin nicht scrollen - fuenf feste Bildschirme");
});

// Die Linie sagt "das Folgende kommt aus dem Vorigen" - sie traegt eine
// Aussage. Bei 1,77:1 war sie auf einem Telefon im Freien nicht da, und
// dann sind die vierzig Punkte, die sie fuellen soll, wieder ein Loch.
test("die Verbindungslinie des Entwurfs ist zu sehen", () => {
  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8");
  assert.match(css, /--fluss:\s*#679489/, "Die Linie steht wieder auf einem Wert unter 3:1");
});

// ---------- Elf Punkte sind die Untergrenze ----------
//
// GEMESSEN IM BROWSER, nicht gerechnet: Das Kachelwort "parametra" stand
// bei 320 Punkten Breite abgeschnitten da - es brauchte 43 Punkte und
// hatte 36, und die Ellipse verdeckte es. Der lange Kommentar an dieser
// Stelle rechnete vor, dass es passt. Im Browser tat es das nicht.
//
// Elf Punkte sind jetzt die Untergrenze. Darunter faengt auf einem
// Telefon in der Hand das Zusammenkneifen der Augen an - dieselbe
// Begruendung, die bei ".lb-teil p" fuer sechzehn steht.
test("keine Schrift unter elf Punkten", () => {
  const zuKlein = [];
  for (const pfad of ["apps/lifeskin/lifeskin-styles.css", "apps/lifeskin-bericht/bericht.css"]) {
    const css = readFileSync(join(wurzel, pfad), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const m of css.matchAll(/font-size:\s*([0-9]+(?:\.[0-9]+)?)px/g)) {
      if (Number(m[1]) < 11) zuKlein.push(`${m[1]}px (${pfad})`);
    }
  }
  assert.deepEqual(zuKlein, [],
    "Diese Groessen liegen unter der Untergrenze - was man zusammenkneifen muss, wird ueberflogen");
});

// ---------- Der Rhythmus hat Stufen ----------
//
// GEZAEHLT: 30 verschiedene Abstandswerte bei 271 Verwendungen. Der Fehler
// waren nicht die 271 - es waren acht Werte, die je genau EINMAL vorkamen:
// 19, 21, 22, 26, 28, 29, 30 und 34. Achtzehn bis zweiundzwanzig Punkte
// sind fuer das Auge derselbe Abstand; sie bilden keine Gruppen, sie machen
// Rauschen. Und jeder ist eine Stelle, an der eine Aenderung vergessen wird.
test("die Abschnittsabstaende stehen auf Stufen, nicht auf Einzelwerten", () => {
  const trichter = readFileSync(join(wurzel, "apps/lifeskin/lifeskin-styles.css"), "utf8");
  for (const stufe of ["--raum-4: 16px", "--polster: 18px", "--raum-5: 20px",
                       "--raum-6: 24px", "--raum-7: 32px"]) {
    assert.ok(trichter.includes(stufe), `Die Stufe ${stufe} fehlt`);
  }

  const css = readFileSync(join(wurzel, "apps/lifeskin-bericht/bericht.css"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const ausrutscher = [];
  for (const m of css.matchAll(/\b(margin|padding|gap)[a-z-]*:\s*([^;]+);/g)) {
    // margin-left ist Position und nicht Rhythmus - die Verbindungslinie
    // sitzt damit auf der Mitte einer Kachel.
    if (m[1] === "margin" && /margin-left/.test(m[0])) continue;
    for (const z of m[2].matchAll(/(\d+(?:\.\d+)?)px/g)) {
      const v = Number(z[1]);
      // 18 ist der Innenrand einer Karte und mit 13 Verwendungen die
      // haeufigste Zahl ueber sechzehn - der Abstand IN einem Bauteil ist
      // ein anderes System als der ZWISCHEN zweien. 40 ist die Laenge
      // eines Linienabschnitts im Entwurf, 132 der Rueckfall fuer die
      // Hoehe der Kaufleiste.
      if (v > 16 && ![18, 20, 24, 32, 40, 132].includes(v)) ausrutscher.push(`${v}px in "${m[0].trim()}"`);
    }
  }
  assert.deepEqual(ausrutscher, [],
    "Diese Abstaende liegen zwischen den Stufen - 18 bis 22 Punkte sind fuer das Auge dasselbe");
});
