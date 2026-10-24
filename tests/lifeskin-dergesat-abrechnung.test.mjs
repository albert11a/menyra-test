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
  assert.deepEqual([t.barazuar.shuma, t.riba, t.shtesa.shuma, t.llogaritur, t.neto], [73, 4, -6.9, 62.1, 57.1]);
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

test("Alte Beträge vor Zusatzkosten werden korrigiert, neue Nettobeträge bleiben unverändert", () => {
  const liste = [order("a")];
  const alt = levizjeLesen({ lloji: "austri", at: at(3), kennungen: ["a"], bruto: 34.5, wu: 0, shenim: "" }, "alt");
  const kosten = expense("alt", 2, -2);
  const fin = llogaritFinancen(liste, [kosten, alt]);
  assert.deepEqual([fin.austri.bruto, fin.austri.neto, fin.kosovaHapur.shuma], [32.5, 32.5, 0]);
  assert.equal(fin.austri.lista[0].brutoRegjistruar, 34.5);
  assert.equal("bartur" in fin.kosovaHapur, false);
  const neu = [...liste, order("b", 4)];
  const offen = llogaritFinancen(neu, [kosten, alt]);
  assert.equal(propozimAustri(offen, ["b"]), 34.5);
  const fertig = llogaritFinancen(neu, [kosten, alt, expense("neu", 4, -3), transfer("t2", 5, ["b"], 31.5)]);
  assert.equal(fertig.kosovaHapur.shuma, 0);
  assert.equal(fertig.austri.lista[0].bruto, 31.5, "Nettobetrag nicht nochmals um Ausgaben reduzieren");
  assert.equal(fertig.austri.neto, 64);
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

test("Screenshot: Kosovo 34 − 2 = 32 €, Österreich 251,50 − 32,10 = 219,40 € ohne Bartur", () => {
  const liste = [...Array.from({ length: 10 }, (_, i) => order(`a${i}`, 1, 27)), order("b", 1, 31), order("offen", 4, 36.5)];
  const alt = levizjeLesen({ lloji: "austri", at: at(3), kennungen: liste.slice(0, 11).map((d) => d.kennung), bruto: 251.5, wu: 0, shenim: "" }, "t1");
  const levizjet = [expense("s1", 2, -30), expense("s2", 2, -2.1), alt];
  const fin = llogaritFinancen(liste, levizjet);
  assert.deepEqual([fin.kosovaHapur.barazuar.numri, fin.kosovaHapur.barazuar.shuma, fin.kosovaHapur.riba.shuma, fin.kosovaHapur.shtesa.numri], [1, 34, 2, 0]);
  assert.deepEqual([fin.austri.lista[0].riba, fin.austri.lista[0].shtesa.shuma], [22, -32.1]);
  assert.equal(fin.kosovaHapur.shuma, 32);
  assert.equal(fin.kosova.shuma, 32);
  assert.equal(fin.austri.neto, 219.4);
  assert.equal(fin.austri.bruto, 219.4);
  assert.equal(propozimAustri(fin, ["offen"]), 32);
  const cards = renderKartat(liste, "heart", "", null, { levizjet });
  assert.doesNotMatch(cards, /Bartur/);
  assert.match(cards, /Dërguar në Austri<\/span><span>1<\/span><b>219,40 €/);
  assert.match(cards, /T'kryme n'Austri[\s\S]*?219,40 €/);
  const html = renderDetajet("kosova", liste, "heart", "", null, { levizjet });
  assert.doesNotMatch(html, /Bartur|diferenca|Mbetur nga dërgesat|s1|s2/);
  const fertig = llogaritFinancen(liste, [...levizjet, transfer("t2", 5, ["offen"], 32)]);
  assert.equal(fertig.kosovaHapur.shuma, 0);
  assert.equal(fertig.austri.neto, 251.4);
});
