import test from "node:test";
import assert from "node:assert/strict";
import { austriDok, dergesaLesen, levizjeDok, levizjeLesen, llogaritFinancen, propozimAustri } from "../shared/lifeskin-dergesat.js";
import { renderKartat, renderDetajet } from "../apps/lifeskin-dergesat/dergesat-pamja.js";

const at = (day) => `2026-10-${String(day).padStart(2, "0")}T12:00:00.000Z`;
const order = (id, day = 1, cmimi = 39) => dergesaLesen({ statusi: "pranuar", postaBeki: `100${id}`, cmimi, barazuarAt: at(day) }, id);
const expense = (id, day, shuma, arsyeja = id) => levizjeLesen(levizjeDok({ jetzt: at(day), shuma, arsyeja }), id);
const transfer = (id, day, kennungen, bruto, wu = 0) => levizjeLesen(austriDok({ jetzt: at(day), kennungen, bruto, wu }), id);

test("Überweisung schließt Riba und Ausgaben ab; nächste Abrechnung startet bei null", () => {
  const liste = [order("a"), order("b")];
  const kosten = [expense("Benzin", 2, -10), expense("Shtesa", 2, 3.1)];
  const vorher = llogaritFinancen(liste, kosten);
  assert.equal(propozimAustri(vorher, ["a", "b"]), 62.1);
  const levizjet = [...kosten, transfer("t1", 3, ["a", "b"], 62.1, 5)];
  const nachher = llogaritFinancen(liste, levizjet);
  assert.equal(nachher.kosovaHapur.shuma, 0);
  assert.equal(nachher.kosovaHapur.barazuar.numri, 0);
  assert.equal(nachher.kosovaHapur.riba.shuma, 0);
  assert.equal(nachher.kosovaHapur.shtesa.numri, 0);
  const t = nachher.austri.lista[0];
  assert.deepEqual([t.barazuar.shuma, t.riba, t.shtesa.shuma, t.llogaritur, t.neto, t.diferenca], [73, 4, -6.9, 62.1, 57.1, 0]);
  const neu = llogaritFinancen([...liste, order("c", 4)], [...levizjet, expense("Neu", 5, -2)]);
  assert.deepEqual([neu.kosovaHapur.barazuar.numri, neu.kosovaHapur.riba.shuma, neu.kosovaHapur.shtesa.shuma, neu.kosovaHapur.shuma], [1, 2, -2, 32.5]);
  assert.equal(propozimAustri(neu, ["c"]), 32.5);
  assert.equal(propozimAustri(neu, []), 0);
  const html = renderDetajet("austri", liste, "heart", "", null, { levizjet });
  assert.match(html, /Riba · 2 € për porosi[\s\S]*− 4 €/);
  assert.match(html, /Shtesa \/ shpenzime · Benzin[\s\S]*− 10 €/);
  const kosova = renderDetajet("kosova", liste, "heart", "", null, { levizjet });
  assert.doesNotMatch(kosova, /Benzin|− 4 €/);
  const cards = renderKartat(liste, "heart", "", null, { levizjet });
  assert.match(cards, /T'kryme n'Austri[\s\S]*Riba · 2 € për porosi[\s\S]*− 4 €/);
});

test("Teilüberweisung: nicht gewählte Bestellung bleibt offen, alte Kosten nicht erneut abziehen", () => {
  const liste = [order("a"), order("b")];
  const kosten = [expense("alt", 2, -10)];
  assert.equal(propozimAustri(llogaritFinancen(liste, kosten), ["a"]), 24.5);
  const levizjet = [...kosten, transfer("t1", 3, ["a"], 24.5)];
  const fin = llogaritFinancen(liste, levizjet);
  assert.deepEqual(fin.kosovaHapur.paDerguar.lista.map((d) => d.kennung), ["b"]);
  assert.equal(fin.kosovaHapur.shuma, 34.5);
  assert.equal(propozimAustri(fin, ["b"]), 34.5);
  const fertig = llogaritFinancen(liste, [...levizjet, transfer("t2", 4, ["b"], 34.5)]);
  assert.equal(fertig.kosovaHapur.shuma, 0);
  assert.equal(fertig.austri.lista[0].shtesa.lista.length, 0);
});

test("Bestehende falsche Beträge bleiben nachvollziehbar und gehen als Differenz in die nächste Abrechnung", () => {
  const liste = [order("a")];
  const levizjet = [expense("alt", 2, -2), transfer("t1", 3, ["a"], 34.5)];
  const fin = llogaritFinancen(liste, levizjet);
  assert.deepEqual([fin.austri.neto, fin.austri.lista[0].llogaritur, fin.austri.lista[0].diferenca, fin.kosovaHapur.bartur], [34.5, 32.5, -2, -2]);
  const neu = [...liste, order("b", 4)];
  const offen = llogaritFinancen(neu, levizjet);
  assert.equal(propozimAustri(offen, ["b"]), 32.5);
  const fertig = llogaritFinancen(neu, [...levizjet, transfer("t2", 5, ["b"], 32.5)]);
  assert.equal(fertig.kosovaHapur.shuma, 0);
  assert.equal(fertig.austri.lista[0].bartur, -2);
  assert.equal(fertig.austri.lista[0].diferenca, 0);
});

test("Historische Periode sieht nur damalige Überweisungen; spätere Kosten bleiben offen", () => {
  const liste = [order("a"), order("b", 5)];
  const levizjet = [expense("alt", 2, -2), transfer("t1", 3, ["a"], 32.5), expense("neu", 4, -3), transfer("t2", 6, ["b"], 31.5)];
  const alt = llogaritFinancen(liste, levizjet, { periudha: { prej: "", deri: at(4) } });
  assert.equal(alt.kosovaHapur.paDerguar.numri, 0);
  assert.equal(alt.kosovaHapur.shuma, -3);
  assert.equal(alt.austri.lista[0].shtesa.shuma, -2);
  const fin = llogaritFinancen(liste, levizjet.slice().reverse());
  assert.equal(fin.kosovaHapur.shuma, 0);
  assert.deepEqual(fin.austri.lista.map((t) => t.shtesa.shuma), [-3, -2]);
});

test("Screenshot: 12 Barazuar, 11 überwiesen; die offene Bestellung hat ihre eigenen 2 € Riba", () => {
  const liste = [...Array.from({ length: 10 }, (_, i) => order(`a${i}`, 1, 27)), order("b", 1, 28.5), order("offen", 4)];
  const levizjet = [expense("s1", 2, -30), expense("s2", 2, -2.1), transfer("t1", 3, liste.slice(0, 11).map((d) => d.kennung), 251.5)];
  const fin = llogaritFinancen(liste, levizjet);
  assert.deepEqual([fin.kosovaHapur.barazuar.numri, fin.kosovaHapur.barazuar.shuma, fin.kosovaHapur.riba.shuma, fin.kosovaHapur.shtesa.numri], [1, 36.5, 2, 0]);
  assert.deepEqual([fin.austri.lista[0].riba, fin.austri.lista[0].shtesa.shuma], [22, -32.1]);
  assert.equal(fin.kosovaHapur.shuma, -0.1, "Echte Alt-Differenz nicht durch einen künstlichen Reset verstecken");
  assert.equal(fin.kosovaHapur.shuma, fin.kosova.shuma);
});
