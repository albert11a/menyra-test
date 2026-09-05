import test from "node:test";
import assert from "node:assert/strict";

import {
  BEFUNDE,
  BEFUND_IDS,
  SCHWELLEN,
  ALTERSFAKTOR,
  ALTERSGRUPPEN,
  STUFEN,
  bewerteBefunde,
  bestimmeHauttyp,
  findePositives,
  waehleProdukte,
  pruefeAbdeckung,
  erstelleBefund
} from "../apps/lifeskin/lifeskin-rules.js";
import {
  STANDARD_PRODUKTE,
  STANDARD_KONFIG,
  tagespreis,
  ersparnis
} from "../apps/lifeskin/lifeskin-catalog.js";

// Eine Messung, in der jede Zone auf Wunsch gesetzt werden kann.
function messungMit(ueberschreibungen = {}) {
  const leer = {
    helligkeit: 62, roetung: 9, hautton: 45,
    textur: 0.7, linien: 9, glanz: 0.02, pigment: 0.02, poren: 0.01
  };
  const zonen = {};
  for (const zone of ["stirn", "nase", "wangeLinks", "wangeRechts", "kinn"]) {
    zonen[zone] = { ...leer, ...(ueberschreibungen[zone] || {}) };
  }
  return zonen;
}

test("jeder Befund im Katalog hat Schwellen", () => {
  for (const befund of BEFUNDE) {
    const grenzen = SCHWELLEN[befund.id];
    assert.ok(Array.isArray(grenzen) && grenzen.length === 3,
      `Schwellen fehlen fuer ${befund.id}`);
    assert.ok(grenzen[0] < grenzen[1] && grenzen[1] < grenzen[2],
      `Schwellen fuer ${befund.id} steigen nicht`);
    assert.ok(befund.label.de && befund.label.sq,
      `${befund.id} fehlt in einer Sprache`);
    assert.ok(befund.beschwerde.de && befund.beschwerde.sq,
      `${befund.id} hat keine Beschwerde-Bezeichnung - die braucht der CEO-Bereich`);
  }
});

test("eine ruhige Haut bekommt keine Befunde", () => {
  const befunde = bewerteBefunde(messungMit(), "25-34");
  assert.ok(befunde.every((b) => b.stufe === 0),
    "Unauffaellige Werte duerfen keinen Befund ausloesen");
});

test("Roetung an den Wangen erreicht die Stufen der Reihe nach", () => {
  const stufen = [11, 13, 17, 21].map((a) => {
    const befunde = bewerteBefunde(
      messungMit({ wangeLinks: { roetung: a }, wangeRechts: { roetung: a } }),
      "25-34"
    );
    return befunde.find((b) => b.id === "roetung").stufe;
  });
  assert.deepEqual(stufen, [0, 1, 2, 3], "Die Roetungsstufen springen falsch");
});

test("dasselbe Gesicht wird mit 55 milder bewertet als mit 20", () => {
  // Sonst bekaeme jede aeltere Kundin die Hoechststufe bei Linien - fachlich
  // richtig, verkaeuferisch wertlos und als Text eine Beleidigung.
  const messung = messungMit({
    stirn: { linien: 24 }, wangeLinks: { linien: 24 }, wangeRechts: { linien: 24 }
  });
  const jung = bewerteBefunde(messung, "18-24").find((b) => b.id === "linien").stufe;
  const alt = bewerteBefunde(messung, "55+").find((b) => b.id === "linien").stufe;

  assert.ok(alt < jung,
    `Mit 55 muss derselbe Wert milder ausfallen (jung ${jung}, alt ${alt})`);
});

test("jede Altersgruppe hat Faktoren", () => {
  for (const gruppe of ALTERSGRUPPEN) {
    assert.ok(ALTERSFAKTOR[gruppe], `Altersfaktor fehlt fuer ${gruppe}`);
  }
});

test("glaenzende T-Zone bei ruhigen Wangen ergibt Mischhaut", () => {
  const messung = messungMit({
    stirn: { glanz: 0.13 }, nase: { glanz: 0.15 },
    wangeLinks: { glanz: 0.03 }, wangeRechts: { glanz: 0.03 }
  });
  const befunde = bewerteBefunde(messung, "25-34");
  const typ = bestimmeHauttyp({ glanzTzoneZuWange: 0.14 / 0.03, roetungWangeMinusTzone: 0 }, befunde);
  assert.equal(typ.id, "mischhaut");
});

test("geroetete Wangen ergeben empfindliche Haut", () => {
  const messung = messungMit({
    wangeLinks: { roetung: 18 }, wangeRechts: { roetung: 18 }
  });
  const befunde = bewerteBefunde(messung, "25-34");
  const typ = bestimmeHauttyp({ glanzTzoneZuWange: 1.0, roetungWangeMinusTzone: 9 }, befunde);
  assert.equal(typ.id, "empfindlich");
});

test("das Lob wird nur vergeben, wenn es stimmt", () => {
  const ruhig = bewerteBefunde(messungMit(), "25-34");
  assert.ok(findePositives(ruhig), "Bei ruhiger Haut muss ein Lob gefunden werden");

  // Alles auffaellig: dann gibt es nichts zu loben, und es wird auch nichts
  // erfunden.
  const alles = bewerteBefunde(messungMit({
    stirn:       { glanz: 0.2, linien: 40, pigment: 0.2, poren: 0.2, textur: 3, roetung: 22 },
    nase:        { glanz: 0.2, linien: 40, pigment: 0.2, poren: 0.2, textur: 3, roetung: 22 },
    wangeLinks:  { glanz: 0.2, linien: 40, pigment: 0.2, poren: 0.2, textur: 3, roetung: 22 },
    wangeRechts: { glanz: 0.2, linien: 40, pigment: 0.2, poren: 0.2, textur: 3, roetung: 22 },
    kinn:        { glanz: 0.2, linien: 40, pigment: 0.2, poren: 0.2, textur: 3, roetung: 22 }
  }), "25-34");
  assert.equal(findePositives(alles), null, "Es darf kein Lob erfunden werden");
});

test("die Empfehlung nennt zwei Produkte und begruendet jedes mit einem Befund", () => {
  const befunde = bewerteBefunde(messungMit({
    wangeLinks: { roetung: 17, textur: 2.0 },
    wangeRechts: { roetung: 17, textur: 2.0 }
  }), "25-34");

  const empfehlung = waehleProdukte(befunde, STANDARD_PRODUKTE, 2);
  assert.equal(empfehlung.length, 2, "Ein Set braucht zwei Produkte");
  for (const eintrag of empfehlung) {
    assert.ok(eintrag.produkt?.id, "Produkt fehlt");
    assert.ok(BEFUND_IDS.includes(eintrag.wegen),
      "Jedes Produkt muss an einem echten Befund haengen");
  }
  // Nicht zweimal fuer dasselbe Problem.
  assert.notEqual(empfehlung[0].wegen, empfehlung[1].wegen,
    "Zwei Produkte fuer denselben Befund sind eine Wiederholung, kein Set");
});

test("versteckte Produkte werden nicht empfohlen", () => {
  const befunde = bewerteBefunde(messungMit({
    wangeLinks: { roetung: 17 }, wangeRechts: { roetung: 17 }
  }), "25-34");
  const versteckt = STANDARD_PRODUKTE.map((p) => ({ ...p, availability: "hidden" }));
  assert.equal(waehleProdukte(befunde, versteckt, 2).length, 0);
});

test("die Abdeckungsansicht findet die Luecken im Sortiment", () => {
  const abdeckung = pruefeAbdeckung(STANDARD_PRODUKTE);
  assert.equal(abdeckung.length, BEFUNDE.length, "Jeder Befund muss geprueft werden");

  const luecken = abdeckung.filter((a) => !a.vollstaendig).map((a) => a.befund);
  // Zwei Produkte koennen sechs Befunde nicht abdecken. Genau das soll die
  // Ansicht zeigen, statt es zu verschweigen.
  assert.ok(luecken.includes("glanz"), "Glanz ist ungedeckt und muss auffallen");
  assert.ok(luecken.includes("poren"), "Poren sind ungedeckt und muessen auffallen");

  const roetung = abdeckung.find((a) => a.befund === "roetung");
  assert.ok(roetung.vollstaendig, "Roetung ist gedeckt");
  assert.ok(roetung.produkte.some((p) => p.id === "serum-01"));
});

test("ein Produkt, das erst ab 'stark' greift, gilt als Luecke", () => {
  const spaet = [{
    id: "x", name: "Spaet", availability: "visible",
    triggers: [{ befund: "roetung", abStufe: 3 }]
  }];
  const zeile = pruefeAbdeckung(spaet).find((a) => a.befund === "roetung");
  assert.ok(!zeile.vollstaendig, "Wer erst bei 'stark' hilft, deckt die Mehrheit nicht ab");
  assert.match(zeile.luecke, /ab Stufe 3/);
});

test("der Preis rechnet sich aus der Reichweite, nicht aus einer festen Zahl", () => {
  // 53 EUR auf 28 Tage. Aendert sich der Setpreis, aendert sich diese Zahl -
  // und genau deshalb steht sie hier und nicht im Text der Seite.
  assert.equal(tagespreis({ ...STANDARD_KONFIG, reichweiteTage: 28 }), 1.89);
  // Wer im CEO-Bereich die Reichweite aendert, aendert den Tagespreis mit -
  // eine falsche Reichweite auf der Seite waere der teuerste Satz im Trichter.
  assert.equal(tagespreis({ ...STANDARD_KONFIG, reichweiteTage: 56 }), 0.95);

  const e = ersparnis(STANDARD_PRODUKTE, STANDARD_KONFIG);
  assert.equal(e.summe, 68);
  assert.ok(e.prozent >= 20 && e.prozent <= 25,
    `Die Ersparnis muss im glaubwuerdigen Band 20-25% liegen, ist ${e.prozent}%`);
});

test("der ganze Befund kommt in einem Stueck heraus", () => {
  const messung = messungMit({
    wangeLinks: { roetung: 17, textur: 2.0 },
    wangeRechts: { roetung: 17, textur: 2.0 }
  });
  const ergebnis = erstelleBefund({
    messung,
    verhaeltnisse: { glanzTzoneZuWange: 1.0, roetungWangeMinusTzone: 8 },
    altersgruppe: "25-34",
    produkte: STANDARD_PRODUKTE,
    setGroesse: 2
  });

  assert.ok(ergebnis.hauttyp?.id);
  assert.equal(ergebnis.befunde.length, BEFUNDE.length);
  assert.ok(ergebnis.hauptbefunde.length > 0);
  assert.equal(ergebnis.empfehlung.length, 2);
  // Absteigend sortiert: Was am meisten auffaellt, steht oben.
  for (let i = 1; i < ergebnis.hauptbefunde.length; i += 1) {
    assert.ok(ergebnis.hauptbefunde[i - 1].stufe >= ergebnis.hauptbefunde[i].stufe);
  }
});

test("makellose Haut bekommt Grundpflege statt eines leeren Sets", () => {
  // Der Fall, an dem der Trichter im ersten Durchlauf gescheitert ist: Wenn
  // kein einziger Befund ausloest, blieb die Empfehlung leer, und das
  // Angebot wies eine Ersparnis von minus 43 Euro aus.
  const ruhig = bewerteBefunde({
    stirn:       { roetung: 9, textur: 0.7, glanz: 0.02, pigment: 0.02, poren: 0.01, linien: 9 },
    nase:        { roetung: 9, textur: 0.7, glanz: 0.02, pigment: 0.02, poren: 0.01, linien: 9 },
    wangeLinks:  { roetung: 9, textur: 0.7, glanz: 0.02, pigment: 0.02, poren: 0.01, linien: 9 },
    wangeRechts: { roetung: 9, textur: 0.7, glanz: 0.02, pigment: 0.02, poren: 0.01, linien: 9 },
    kinn:        { roetung: 9, textur: 0.7, glanz: 0.02, pigment: 0.02, poren: 0.01, linien: 9 }
  }, "25-34");
  assert.ok(ruhig.every((b) => b.stufe === 0), "Voraussetzung: kein Befund");

  const empfehlung = waehleProdukte(ruhig, STANDARD_PRODUKTE, 2);
  assert.equal(empfehlung.length, 2, "Auch ohne Befund muss ein volles Set herauskommen");
  assert.ok(empfehlung.every((e) => e.grundpflege === true),
    "Die Produkte muessen als Grundpflege gekennzeichnet sein, damit der Text nicht einen Befund erfindet");
  assert.ok(empfehlung.every((e) => e.wegen === null),
    "Ohne Befund darf kein Befund als Begruendung stehen");

  // Und der Ankerpreis stimmt wieder.
  const summe = empfehlung.reduce((s, e) => s + e.produkt.einzelpreis, 0);
  assert.ok(summe > STANDARD_KONFIG.setPreis,
    `Der Anker muss ueber dem Setpreis liegen, ist ${summe}`);
});

test("jede Stufe hat einen Text in beiden Sprachen", async () => {
  // Ohne diese Klammer stand "unauffaellig" auf einer albanischen Seite -
  // gefunden erst beim Blick auf den fertigen Bildschirm, nicht im Test.
  const { STUFEN_TEXTE } = await import("../apps/lifeskin/lifeskin-content.js");
  assert.equal(STUFEN_TEXTE.length, STUFEN.length,
    "Zu jeder Stufe im Regelwerk muss ein Text gehoeren");
  for (const eintrag of STUFEN_TEXTE) {
    assert.ok(eintrag.sq && eintrag.de, `Stufentext unvollstaendig: ${JSON.stringify(eintrag)}`);
  }
});

test("ein einziger Befund ergibt trotzdem ein volles Set", () => {
  // Der haeufigste Fall ueberhaupt - und im Durchlauf durch den fertigen
  // Trichter aufgefallen, nicht hier: Nur "Roetung, leicht" loeste allein das
  // Serum aus. Das "Set" bestand aus einem Produkt, der Ankerpreis war der
  // Einzelpreis, und die Ersparnis fiel weg. Damit bricht der gesamte
  // Preisaufbau des Angebots zusammen.
  const nurRoetung = bewerteBefunde(messungMit({
    wangeLinks: { roetung: 13 }, wangeRechts: { roetung: 13 }
  }), "25-34");
  assert.equal(nurRoetung.filter((b) => b.stufe > 0).length, 1,
    "Voraussetzung: genau ein Befund");

  const empfehlung = waehleProdukte(nurRoetung, STANDARD_PRODUKTE, 2);
  assert.equal(empfehlung.length, 2, "Ein Set braucht zwei Produkte");

  // Das erste haengt am Befund, das zweite ist Erhaltung - und sagt das auch.
  assert.equal(empfehlung[0].wegen, "roetung");
  assert.ok(!empfehlung[0].grundpflege);
  assert.equal(empfehlung[1].grundpflege, true,
    "Das aufgefuellte Produkt muss als Grundpflege gekennzeichnet sein");
  assert.equal(empfehlung[1].wegen, null,
    "Fuer das aufgefuellte Produkt darf kein Befund erfunden werden");

  // Und der Anker stimmt wieder.
  const summe = empfehlung.reduce((s, e) => s + e.produkt.einzelpreis, 0);
  assert.equal(summe, 68);
  assert.ok(summe - STANDARD_KONFIG.setPreis > 0, "Die Ersparnis muss positiv sein");

  // Kein Produkt darf doppelt im Set stehen.
  assert.notEqual(empfehlung[0].produkt.id, empfehlung[1].produkt.id);
});
