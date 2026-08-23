import test from "node:test";
import assert from "node:assert/strict";

import {
  GO_COMMISSION_VERSION,
  goCommissionCents
} from "../shared/go/go-commission-core.js";
import {
  LEAD_LANDING_ADS_PRICE_FALLBACK,
  LEAD_LANDING_GO_COMMISSION_CENTS,
  LEAD_LANDING_GO_COMMISSION_VERSION,
  LEAD_LANDING_ORDER_CENTS_PER_ITEM,
  LEAD_LANDING_QR_INCLUDED,
  LEAD_LANDING_SERVICE_EUR,
  formatCents,
  formatEuro
} from "../apps/menyra-social/lead-landing/lead-landing-prices.js";
import { renderHero, renderSurface } from "../apps/menyra-social/lead-landing/lead-landing-sections.js";
import {
  renderChapterMore,
  renderChapterWhat,
  renderDecision,
  renderExtraPhotos,
  renderFreeFeatures,
  renderPaidFeatures,
  renderQrStands,
  renderServiceIntro,
  renderServicePhotos,
  renderServicePrice,
  renderServiceScope,
  renderZeroPrice
} from "../apps/menyra-social/lead-landing/lead-landing-sales.js";

// Die Lead-Landing hat genau eine Pointe: Mnyra ist kostenlos, der Dienst
// daneben kostet einmalig. Verschwimmt das an einer Stelle, liest der Wirt
// rueckwaerts - "also war das Kostenlose doch ein Koeder" - und die Seite hat
// sich selbst widerlegt. Diese Tests halten die Trennung fest, und sie halten
// die Zahlen gegen die, die die App wirklich abrechnet.

const PROFIL = {
  name: "Test Lokal",
  city: "Prishtine",
  phone: "+38344000000",
  currency: "EUR",
  locations: []
};

/* --------------------------------------------------- Die Zahlen stimmen */

test("die GO-Tabelle der Landing ist die echte", () => {
  assert.equal(
    LEAD_LANDING_GO_COMMISSION_VERSION,
    GO_COMMISSION_VERSION,
    "die Landing zeigt eine andere Preisfassung als shared/go/go-commission-core.js"
  );

  LEAD_LANDING_GO_COMMISSION_CENTS.forEach((cents, index) => {
    const partySize = index + 1;
    assert.equal(
      cents,
      goCommissionCents(partySize, GO_COMMISSION_VERSION),
      `Der Preis fuer ${partySize} Person(en) weicht ab`
    );
  });
});

test("Preise sind ganze Cent", () => {
  // Wer Geld in Kommazahlen rechnet, zeigt irgendwann 1.4999999999999998 EUR.
  LEAD_LANDING_GO_COMMISSION_CENTS.forEach((cents) => {
    assert.ok(Number.isInteger(cents), `${cents} ist keine ganze Zahl`);
  });
  assert.ok(Number.isInteger(LEAD_LANDING_ORDER_CENTS_PER_ITEM));
  assert.ok(Number.isInteger(LEAD_LANDING_SERVICE_EUR));
});

test("Betraege werden aus ganzen Cent gerechnet, nicht aus Kommazahlen", () => {
  assert.equal(formatCents(2), "0,02 €");
  assert.equal(formatCents(450), "4,50 €");
  assert.equal(formatCents(0), "0,00 €");
  assert.equal(formatCents(null), "");
  assert.equal(formatEuro(150), "150 €");
});

/* ------------------------------------------- Die Trennung haelt auf der Seite */

// Die Bildschirme des kostenlosen Teils. Was hier steht, ist im 0-EUR-Paket
// enthalten - und darf deshalb keinen Preis tragen.
function freierTeil() {
  return [
    renderHero(PROFIL),
    renderSurface(PROFIL, [], [], []),
    renderChapterWhat(),
    renderFreeFeatures(PROFIL, []),
    renderZeroPrice()
  ].join("");
}

test("im kostenlosen Teil steht keine Zahl mit Euro daran", () => {
  const html = freierTeil();
  const preise = html.match(/\d[\d.,]*\s*€/g) || [];
  assert.deepEqual(
    preise.filter((treffer) => !/^0\s*€$/.test(treffer)),
    [],
    "vor dem 0-EUR-Bildschirm steht schon ein Preis - dann liest sich alles davor als Angebot"
  );
});

test("die Tischbestellung steht nicht bei den kostenlosen Funktionen", () => {
  // Sie ist die kostenpflichtige Erweiterung der QR-Codes. Stuende sie zwischen
  // den kostenlosen, waere die Trennung schon dort kaputt.
  const html = renderFreeFeatures(PROFIL, []);
  assert.ok(!/nga tavolina/i.test(html), "die Tischbestellung steht im kostenlosen Teil");
  assert.ok(/delivery/i.test(html), "der Delivery-Weg fehlt - er ist Teil des kostenlosen Angebots");
});

test("der 0-EUR-Bildschirm sagt, dass es kostenlos bleibt", () => {
  const html = renderZeroPrice();
  assert.match(html, /0 €/);
  assert.match(html, /mbetet falas/i);
  assert.match(html, /Pa abonim/i);
});

test("vor dem ersten Preis steht die Trennung", () => {
  // Erst "Mnyra bleibt kostenlos", dann - mit Abstand - das Angebot.
  const html = renderServiceIntro();
  assert.match(html, /Mnyra mbetet falas/i);
  assert.match(html, /opsional/i);
  assert.ok(!/€/.test(html), "auf dem Trennbildschirm steht schon ein Preis");
});

test("der Preisbildschirm nennt den Preis, sagt einmalig und wiederholt das Kostenlose", () => {
  const html = renderServicePrice(PROFIL, {});
  assert.ok(html.includes(formatEuro(LEAD_LANDING_SERVICE_EUR)));
  assert.match(html, /Vetëm një herë/);
  assert.match(html, /Mnyra vazhdon të jetë falas/);
});

test("ein Lead darf seinen eigenen Preis mitbringen", () => {
  const html = renderServicePrice(PROFIL, { servicePrice: "199 €" });
  assert.ok(html.includes("199 €"));
  assert.ok(!html.includes(formatEuro(LEAD_LANDING_SERVICE_EUR)));
});

test("die QR-Codes im Dienst oeffnen die Menue, sie bestellen nicht", () => {
  const html = renderQrStands({});
  assert.ok(html.includes(String(LEAD_LANDING_QR_INCLUDED)));
  assert.match(html, /menunë tuaj digjitale/i);
  assert.ok(!/porosi/i.test(html), "der QR-Bildschirm verspricht schon eine Bestellung");
});

test("jede kostenpflichtige Zusatzfunktion traegt ihren Preis oder ihren Zustand", () => {
  const html = renderPaidFeatures({});
  assert.ok(html.includes(formatCents(LEAD_LANDING_ORDER_CENTS_PER_ITEM)), "der Order-Preis fehlt");
  assert.ok(html.includes(formatCents(LEAD_LANDING_GO_COMMISSION_CENTS[0])), "der GO-Preis fehlt");
  assert.ok(html.includes(LEAD_LANDING_ADS_PRICE_FALLBACK), "die Werbung steht ohne Preisangabe da");
  // Was es noch nicht gibt, wird nicht gezeigt, als gaebe es das schon.
  assert.match(html, /Së shpejti/);
});

test("die Werbung nimmt den Preis aus dem Lead, wenn einer da ist", () => {
  const html = renderPaidFeatures({ adsPrice: "prej 20 € në muaj" });
  assert.ok(html.includes("prej 20 € në muaj"));
  assert.ok(!html.includes(LEAD_LANDING_ADS_PRICE_FALLBACK));
});

/* ------------------------------------------------------- Die Entscheidung */

test("beide Wege stehen am Ende, und der kostenlose ist nicht versteckt", () => {
  const html = renderDecision(PROFIL, {});
  assert.match(html, /data-answer="paketa"/);
  assert.match(html, /data-answer="falas"/);
  assert.match(html, /Aktivizo profilin falas/);
  assert.match(html, /0 € · Pa kontratë/);
});

test("ohne Telefonnummer bleibt die Wahl trotzdem druckbar", () => {
  // Sonst faellt genau die Zahl aus der Messung, um die es geht.
  const html = renderDecision({ name: "Pa numër" }, {});
  assert.match(html, /<button type="button"[^>]*data-answer="paketa"/);
  assert.match(html, /<button type="button"[^>]*data-answer="falas"/);
});

/* ------------------------------------------------------------ Vollstaendig */

// Ein Lokal mit echten Aufnahmen: das erste Produkt traegt vier, die anderen
// zusammen drei, und ein Fokus-Bild wiederholt eines vom ersten Produkt.
const MENU = [
  { name: "Pizza", imageUrl: "p1", imageUrls: ["p1", "p2", "p3", "p4"] },
  { name: "Burger", imageUrl: "b1", imageUrls: ["b1", "b2"] },
  { name: "Cola", imageUrl: "c1", imageUrls: ["c1"] }
];
const FOKUS = [{ imageUrl: "f1" }, { imageUrl: "p2" }];

function bildAdressen(html) {
  return Array.from(html.matchAll(/src="([^"]+)"/g)).map((treffer) => treffer[1]);
}

test("die sechs Fotos sind die des ersten Produkts", () => {
  // Der Wirt erkennt sein eigenes Gericht. Sechs leere Kacheln erklaeren ihm,
  // was er bekommt - seine eigenen Aufnahmen zeigen es ihm an der Sache.
  const html = renderServicePhotos({}, MENU);
  assert.deepEqual(bildAdressen(html), ["p1", "p2", "p3", "p4"]);
  // Was das Produkt nicht hat, bleibt eine ruhige Kachel - kein fremdes Foto.
  assert.equal((html.match(/ll-tile--empty/g) || []).length, 2);
});

test("ein erstes Produkt ohne Foto haelt den Bildschirm nicht leer", () => {
  const html = renderServicePhotos({}, [{ name: "Ohne Foto" }, ...MENU]);
  assert.deepEqual(bildAdressen(html), ["p1", "p2", "p3", "p4"]);
});

test("die Zugaben sind die uebrigen Aufnahmen, ohne Wiederholung", () => {
  const html = renderExtraPhotos({}, MENU, FOKUS);
  // p1 bis p4 stehen schon auf dem Bildschirm davor - auch das Fokus-Bild p2.
  assert.deepEqual(bildAdressen(html), ["b1", "b2", "c1", "f1"]);
  assert.equal((html.match(/class="ll-tile[ "]/g) || []).length, 10);
  assert.match(html, /Fotot janë tuajat/);
});

test("was im Lead gepflegt ist, sticht die Aufnahmen des Lokals", () => {
  const gepflegt = Array.from({ length: 6 }, (_, index) => ({ url: `https://example.test/${index}.webp`, caption: "" }));
  const html = renderServicePhotos({ productPhotos: gepflegt }, MENU);
  assert.equal((html.match(/ll-tile--empty/g) || []).length, 0);
  assert.equal((html.match(/class="ll-tile"/g) || []).length, 6);
  assert.ok(!bildAdressen(html).includes("p1"));

  const extra = renderExtraPhotos({ extraPhotos: [{ url: "x1", caption: "" }] }, MENU, FOKUS);
  assert.deepEqual(bildAdressen(extra), ["x1"]);
});

test("ohne jede Aufnahme bleiben ruhige Kacheln stehen", () => {
  assert.equal((renderServicePhotos({}, []).match(/ll-tile--empty/g) || []).length, 6);
  assert.equal((renderExtraPhotos({}, [], []).match(/ll-tile--empty/g) || []).length, 10);
});

test("die Aufzaehlung sagt, was wir uebernehmen - ohne Absaetze", () => {
  const html = renderServiceScope();
  assert.match(html, /Për çdo produkt/);
  assert.match(html, /Për komplet menunë/);
  assert.ok((html.match(/<li>/g) || []).length >= 10);
});

test("die beiden Kapitelwechsel tragen einen Satz und einen Pfeil", () => {
  [renderChapterWhat(), renderChapterMore()].forEach((html) => {
    assert.match(html, /ll-chapter__arrow/);
    assert.equal((html.match(/ll-chapter__text/g) || []).length, 1);
  });
});
