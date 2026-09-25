// 25.09.: Ein JSON aus ChatGPT kam in Heart mit typografischen
// Anfuehrungszeichen an (“ ” statt ") - und im Text selbst stand ein Zitat
// (Na shkruat: “Në fytyrë shenja nga aknet.”). Die alte Kur machte aus
// allen “ ” ein " und zerbrach genau dieses JSON: "kein gueltiges JSON".
import test from "node:test";
import assert from "node:assert/strict";
import { anfuehrungReparieren, raportLesen } from "../shared/lifeskin-analyse.js";

// Der Aufbau des echten Falls, mit genau seinen Stolperstellen.
const ECHT = `{
“schema_version”: 3,
“vleresimi”: {
“statusi”: “i_pjesshem”
},
“ekzaminimi”: “Vlerësimi bazohet në përshkrimin tuaj se ju shqetësojnë shenjat e mbetura nga aknet në fytyrë.”,
“gjetjet”: {
“permbledhja”: “Sipas përshkrimit tuaj, shqetësimi kryesor janë shenjat e mbetura pas aknes në fytyrë.”,
“gjetja_kryesore”: “Shenja pas aknes në fytyrë”,
“gjetja_dyta”: “”,
“sipas_zonave”: [
{
“zona”: “Fytyra”,
“teksti”: “Sipas përshkrimit tuaj, në fytyrë kanë mbetur shenja pas aknes.”
}
]
},
“parametrat”: [
{
“id”: “njollat”,
“emri”: “Njollat”,
“thjeshte”: “”,
“vlera”: “Sipas përshkrimit: shenja të mbetura nga aknet në fytyrë.”,
“shkalla”: null,
“grada”: “nuk vlerësohet”,
“termi”: “”,
“nga_vjen”: “”
}
],
“diagnoza”: {
“id”: “tjeter”,
“emri”: “Shenja pas aknes në fytyrë – sipas përshkrimit”,
“latinisht”: “Sequelae acne (anamnestisch)”,
“niveli”: 2,
“niveli_emri”: “Kërkon kujdes aktiv”
},
“shpjegimi”: [
“Përshkrimi “shenja nga aknet” i referohet ndryshimeve që mbeten pasi akneja kalon.”,
“Gjatë 4 javëve, Dr. Gashi ju ndjek çdo javë.”
],
“termat”: [],
“nevojat”: [
{
“roli”: “kryesor”,
“produkt_id”: “lf-acne”,
“gjetja”: “Shenja të krijuara nga akneja”,
“kerkon”: “Ndalim të aknes së re”,
“teksti”: “LF ACNE hap poret, largon aknen dhe ndal shpërthimet e reja në fytyrë.”
}
],
“shitja”: {
“hyrja”: “Për shenjat pas aknes në fytyrë — 2 produkte që trajtojnë shkakun.”,
“shqetesimi”: “Na shkruat: “Në fytyrë shenja nga aknet.” Pikërisht për këtë është ndërtuar terapia juaj 4-javore.”,
“problemet”: [
{
“gjetja”: “Shenja të reja nga akneja”,
“ku”: “në fytyrë”,
“produkt_id”: “lf-acne”,
“zgjidhja”: “LF ACNE hap poret, largon aknen dhe ndal shpërthimet që lënë shenja.”
}
],
“produktet”: [
{
“produkt_id”: “lf-acne”,
“per_ju”: [
“Hap poret e bllokuara që ushqejnë aknen në fytyrë.”,
“Largon aknen që mund të krijojë shenja të reja.”,
“Ndal shpërthimet e reja që lënë shenja në fytyrë.”
]
}
],
“dita_28”: “Synimi ynë pas 4 javësh: largimi i plotë i shenjave pas aknes në fytyrë.”,
“pse_tani”: “Akneja që rikthehet mund të lërë shenja të reja — fillimi tani synon ta ndalë këtë cikël.”,
“whatsapp”: “E kam përfunduar vlerësimin tuaj.”
}
}`;

test("der echte Fall liest sich - Zitate im Text bleiben Zitate", () => {
  const raport = raportLesen(ECHT);
  assert.equal(raport.diagnozaLat, "Sequelae acne (anamnestisch)");
  assert.equal(raport.shitja.shqetesimi, "Na shkruat: “Në fytyrë shenja nga aknet.” Pikërisht për këtë është ndërtuar terapia juaj 4-javore.");
  assert.equal(raport.shpjegimi[0], "Përshkrimi “shenja nga aknet” i referohet ndryshimeve që mbeten pasi akneja kalon.");
  assert.equal(raport.shitja.produktet[0].per_ju.length, 3);
});

test("Anfuehrungszeichen: Feldgrenzen werden gerade, Zitate bleiben, Kommas im Text sind kein Ende", () => {
  const raus = anfuehrungReparieren(`{“a”: “sagte “x”, dann ging sie”, “b”: [“y”, 3, true], „c“: null}`);
  assert.deepEqual(JSON.parse(raus), { a: "sagte “x”, dann ging sie", b: ["y", 3, true], c: null });
  // Gerade Zeichen im Text werden maskiert, Zeilenumbrueche im Text auch.
  assert.deepEqual(JSON.parse(anfuehrungReparieren('{"a": "er sagte "hallo" dort", "b": "zwei\nZeilen"}')),
    { a: 'er sagte "hallo" dort', b: "zwei\nZeilen" });
  // Sauberes JSON bleibt unveraendert.
  const sauber = '{"a": "x \\"y\\"", "b": [1, 2]}';
  assert.equal(anfuehrungReparieren(sauber), sauber);
});
