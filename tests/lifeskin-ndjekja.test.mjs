// DIE VIERWOECHIGE BEGLEITUNG - Regeln, die auf jeder Seite gleich gelten
// (shared/lifeskin-ndjekja.js, Auftrag vom 26.09.).

import test from "node:test";
import assert from "node:assert/strict";

import {
  NDJEKJA, NDJEKJA_TEXTE, NDJESITE, PERDORIMI, KAUFWEG_VERSION, ARBEITSLISTEN,
  ndjekjaSichtbar, pruefendeStelle, heuteIso, anwendungsTag, wocheVon, kontrollPlan, naechsteKontrolle,
  letzteKontrolle, phaseVon, nachDenWochen, eintragsId, eintragBereinigen, tagesStand, eintragBrauchtBlick,
  funditNach, ndjekjaLesen, arbeitslistenVon, neuerZugang, istZugang, ndjekjaLink, linkNachricht, datumPlus
} from "../shared/lifeskin-ndjekja.js";

const START = "2026-09-20";
const fall = (extra = {}) => ndjekjaLesen({ startAt: START, porosia: { statusi: "konfirmuar" }, ...extra });

test("die Begleitung ist NICHT im Verkauf - nur die Vorschau mit ?ndjekja=1", () => {
  assert.equal(NDJEKJA.imVerkauf, false);
  assert.equal(ndjekjaSichtbar(""), false);
  assert.equal(ndjekjaSichtbar("?still=1"), false);
  assert.equal(ndjekjaSichtbar("?ndjekja=1"), true);
  assert.equal(ndjekjaSichtbar("?ndjekja=0"), false);
  assert.equal(ndjekjaSichtbar("", { imVerkauf: true }), true);
  assert.equal(KAUFWEG_VERSION.ndjekja, "ndjekja-1");
});

test("niemand wird als Pruefer genannt, solange es nicht festgelegt ist - keine Antwortfrist", () => {
  assert.equal(NDJEKJA.pruefer, "");
  assert.equal(NDJEKJA.antwortZeit, "");
  assert.equal(pruefendeStelle(), "ekipi ynë");
  assert.equal(pruefendeStelle({ pruefer: "Dr. Violeta Gashi" }), "Dr. Violeta Gashi");
});

test("die Texte stehen wortgleich wie beauftragt", () => {
  assert.equal(NDJEKJA_TEXTE.titulli, "Katër javë, me ndjekje hap pas hapi.");
  assert.equal(NDJEKJA_TEXTE.hyrja, "Shënoni përdorimin dhe si është ndier lëkura juaj. Në kontrollet e planifikuara, shqyrtojmë ecurinë dhe ju japim udhëzimet e radhës.");
  assert.equal(NDJEKJA_TEXTE.shembull, "Shembull i ndjekjes suaj");
  assert.equal(NDJEKJA_TEXTE.perdorimiSot, "Përdorimi sot");
  assert.equal(NDJEKJA_TEXTE.ndjesiaPyetja, "Si është ndier lëkura juaj?");
  assert.equal(NDJEKJA_TEXTE.pyetjeKontakt, "Keni pyetje për përdorimin?");
  assert.deepEqual(NDJESITE.map((n) => n.sq), ["Pa shqetësime", "Thatësi / tërheqje", "Skuqje", "Djegie / pickim", "Diçka tjetër"]);
  assert.deepEqual(PERDORIMI.map((p) => p.sq), ["E përdora", "Pjesërisht", "Nuk e përdora"]);
  assert.match(NDJEKJA_TEXTE.joDitore, /nuk do të thotë kontroll mjekësor çdo ditë/);
  assert.equal(NDJEKJA_TEXTE.pikat.length, 3);
  assert.deepEqual(NDJEKJA_TEXTE.rruga.map(([t]) => t), ["Fillimi", "Dita 7", "Dita 14", "Dita 21", "Dita 28"]);
  // Tag 28 verspricht keine reine Haut.
  assert.doesNotMatch(JSON.stringify(NDJEKJA_TEXTE), /plotësisht|100 ?%|garantuar|pastër/i);
  // Kein Schluessel mit fremden Buchstaben (ein kyrillisches "о" sah genauso aus).
  for (const k of Object.keys(NDJEKJA_TEXTE)) assert.match(k, /^[A-Za-z]+$/, k);
});

test("Tage zaehlen ab dem Anwendungsstart - Tag 1 ist der Starttag", () => {
  assert.equal(anwendungsTag(START, "2026-09-20"), 1);
  assert.equal(anwendungsTag(START, "2026-09-26"), 7);
  assert.equal(anwendungsTag(START, "2026-09-19"), 0, "Start in der Zukunft: noch nicht angefangen");
  assert.equal(anwendungsTag("", "2026-09-26"), 0);
  assert.equal(anwendungsTag("26.09.2026", "2026-09-26"), 0);
  assert.equal(heuteIso(new Date("2026-09-26T22:30:00Z")), "2026-09-27", "Geschaeftszone Europe/Belgrade");
  assert.equal(datumPlus("2026-09-28", 5), "2026-10-03");
});

test("Wochen: 1-7 = Woche 1, danach bis hoechstens 4", () => {
  assert.deepEqual([1, 7, 8, 14, 15, 28, 29, 40].map((t) => wocheVon(t)), [1, 1, 2, 2, 3, 4, 4, 4]);
  assert.equal(wocheVon(0), 0);
});

test("ein geplanter Termin erscheint NIE von selbst als erledigt", () => {
  const plan = kontrollPlan(fall(), NDJEKJA);
  assert.deepEqual(plan.map((k) => [k.dita, k.datum, k.statusi]), [
    [7, "2026-09-26", "planifikuar"], [14, "2026-10-03", "planifikuar"],
    [21, "2026-10-10", "planifikuar"], [28, "2026-10-17", "planifikuar"]
  ]);
  // Auch lange nach dem Datum: geplant.
  const spaet = kontrollPlan(fall({ startAt: "2026-01-01" }));
  assert.ok(spaet.every((k) => k.statusi === "planifikuar"));
  // Nur, was das Team gesetzt hat - mit Datum und Namen.
  const mit = kontrollPlan(fall({ kontrollet: { 7: { statusi: "kryer", at: "2026-09-26T10:00:00Z", nga: "Ekipi" }, 14: { statusi: "irgendwas" } } }));
  assert.equal(mit[0].statusi, "kryer");
  assert.equal(mit[0].nga, "Ekipi");
  assert.equal(mit[1].statusi, "planifikuar");
  assert.equal(letzteKontrolle(fall({ kontrollet: { 7: { statusi: "kryer", at: "x", nga: "E" } } })).dita, 7);
});

test("der naechste Termin: der erste offene - oder das eigene Datum des Teams", () => {
  assert.equal(naechsteKontrolle(fall()).dita, 7);
  const erledigt = fall({ kontrollet: { 7: { statusi: "kryer" } } });
  assert.equal(naechsteKontrolle(erledigt).dita, 14);
  const eigen = naechsteKontrolle(fall({ kontrolliRadhes: "2026-09-28" }));
  assert.deepEqual([eigen.dita, eigen.datum, eigen.eigen], [7, "2026-09-28", true]);
  const alle = fall({ kontrollet: Object.fromEntries([7, 14, 21, 28].map((d) => [d, { statusi: "kryer" }])) });
  assert.equal(naechsteKontrolle(alle), null);
});

test("Phasen: wartet, laeuft (auch nach Tag 28), abgeschlossen nur durch das Team, storniert", () => {
  assert.equal(phaseVon(fall({ startAt: "" }), "2026-09-26"), "pritet");
  assert.equal(phaseVon(fall(), "2026-09-26"), "aktiv");
  assert.equal(phaseVon(fall(), "2026-11-30"), "aktiv", "Nach 28 Tagen NICHT von selbst abgeschlossen");
  assert.equal(nachDenWochen(fall(), "2026-10-18"), true);
  assert.equal(nachDenWochen(fall(), "2026-10-17"), false);
  assert.equal(phaseVon(fall({ statusi: "perfunduar" }), "2026-09-26"), "perfunduar");
  assert.equal(phaseVon(fall({ porosia: { statusi: "anuluar" } }), "2026-09-26"), "anuluar");
});

test("ein Eintrag: nur erlaubte Werte, 'Pa shqetësime' allein, Nachricht gekuerzt", () => {
  assert.equal(eintragsId(3), "t03");
  assert.equal(eintragsId(28), "t28");
  assert.equal(eintragBereinigen({ dita: 3, perdorimi: "vielleicht" }), null);
  assert.equal(eintragBereinigen({ dita: 0, perdorimi: "po" }), null);
  const e = eintragBereinigen({ dita: 3, data: "2026-09-22", perdorimi: "po", ndjesia: ["skuqje", "hack", "skuqje", "mire"], mesazh: `  ${"a".repeat(600)}  ` }, "2026-09-22T10:00:00Z");
  assert.deepEqual(e.ndjesia, ["mire"]);
  assert.equal(e.mesazh.length, 500);
  assert.equal(e.updatedAt, "2026-09-22T10:00:00Z");
  assert.deepEqual(Object.keys(e).sort(), ["data", "dita", "mesazh", "ndjesia", "perdorimi", "updatedAt"]);
  const zwei = eintragBereinigen({ dita: 4, perdorimi: "pjeserisht", ndjesia: ["skuqje", "djegie"] });
  assert.deepEqual(zwei.ndjesia, ["skuqje", "djegie"]);
});

test("ein fehlender Tag heisst 'nicht dokumentiert', nie 'nicht angewendet'", () => {
  assert.deepEqual(tagesStand(null), { id: "pa", sq: "Nuk është shënuar" });
  assert.equal(tagesStand({ perdorimi: "jo" }).sq, "Nuk e përdora");
});

test("fundit: die Markierung einer Frage bleibt, bis das Team gelesen hat", () => {
  const frage = funditNach({ dita: 2, mesazh: "A mund ta përdor në mëngjes?", ndjesia: [] }, {}, "2026-09-21T09:00:00Z");
  assert.deepEqual(frage, { dita: 2, at: "2026-09-21T09:00:00Z", blickAt: "2026-09-21T09:00:00Z" });
  const ruhig = funditNach({ dita: 3, mesazh: "", ndjesia: ["mire"] }, frage, "2026-09-22T09:00:00Z");
  assert.equal(ruhig.blickAt, "2026-09-21T09:00:00Z", "Ein ruhiger Eintrag loescht die offene Frage nicht");
  assert.equal(eintragBrauchtBlick({ ndjesia: ["thatesi"] }), true);
  assert.equal(eintragBrauchtBlick({ ndjesia: ["mire"], mesazh: " " }), false);
});

test("Arbeitslisten fuer Heart", () => {
  const heute = "2026-09-26";
  const listen = (f, extra = {}) => [...arbeitslistenVon({ ndjekja: f, heute, ...extra })].sort();
  assert.deepEqual(listen(fall({ startAt: "" })), ["pritet"]);
  assert.deepEqual(listen(fall({ startAt: "2026-09-25" })), ["neu"]);
  assert.deepEqual(listen(fall()), ["faellig"], "Tag 7 = heute: faellig");
  // Tag 7 am 24.09. - zwei Tage drueber: noch faellig; drei: ueberfaellig.
  assert.deepEqual(listen(fall({ startAt: "2026-09-18" })), ["faellig"], "zwei Tage drueber: noch faellig");
  assert.deepEqual(listen(fall({ startAt: "2026-09-17" })), ["ueberfaellig"]);
  assert.deepEqual(listen(fall({ statusi: "perfunduar" })), ["fertig"]);
  assert.deepEqual(listen(fall({ porosia: { statusi: "anuluar" }, fundit: { blickAt: "2026-09-26T10:00:00Z" } })), []);
  const frage = fall({ startAt: "2026-09-24", fundit: { dita: 3, at: "2026-09-26T10:00:00Z", blickAt: "2026-09-26T10:00:00Z" } });
  assert.deepEqual(listen(frage), ["neu", "rueckmeldung"]);
  assert.deepEqual(listen(frage, { lexuarDeri: "2026-09-26T11:00:00Z" }), ["neu"], "gelesen: aus der Liste");
  // Mit geladenen Eintraegen zaehlen diese.
  assert.deepEqual(listen(fall({ startAt: "2026-09-24" }), { eintraege: [{ dita: 1, mesazh: "?", updatedAt: "2026-09-25T08:00:00Z" }] }), ["neu", "rueckmeldung"]);
  assert.deepEqual(ARBEITSLISTEN.map((l) => l.label), ["Neue Rückmeldung / Frage", "Kontrolle überfällig", "Kontrolle fällig", "Neu gestartet", "Wartet auf Start", "Betreuung abgeschlossen"]);
});

test("ndjekjaLesen: was nicht passt, wird leer - nie geraten", () => {
  const f = ndjekjaLesen({ startAt: "gestern", porosia: { statusi: "fliegt" }, statusi: "x", kontrollet: { 7: { statusi: "kryer", nga: 5 }, 14: "kryer" }, kontrolliRadhes: "bald" });
  assert.equal(f.startAt, "");
  assert.equal(f.porosia.statusi, "konfirmuar");
  assert.equal(f.statusi, "aktiv");
  assert.deepEqual(Object.keys(f.kontrollet), ["7"]);
  assert.equal(f.kontrolliRadhes, "");
});

test("der Zugang: 128 Bit, nur im Fragment des Links", () => {
  const z = neuerZugang();
  assert.ok(istZugang(z));
  assert.notEqual(z, neuerZugang());
  assert.equal(istZugang("abc"), false);
  assert.equal(istZugang(`${z}x`), false);
  assert.equal(ndjekjaLink(z), `https://www.mnyra.com/ndjekja#${z}`);
  assert.equal(ndjekjaLink("../etc"), "");
  const satz = linkNachricht("Arta", z);
  assert.match(satz, /^Përshëndetje Arta!/);
  assert.ok(satz.includes(`/ndjekja#${z}`));
});
