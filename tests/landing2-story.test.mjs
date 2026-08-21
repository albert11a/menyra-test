import test from "node:test";
import assert from "node:assert/strict";

import {
  renderBiznesi,
  renderClosing,
  renderDiscoveryClose,
  renderDiscoveryIntro,
  renderDiscoverySequence,
  renderFree,
  renderGo,
  renderHero,
  renderOrder,
  renderProduct,
  renderProfileSequence,
  renderSave,
  renderStandard,
  renderTableFlow,
  renderVision,
  renderWhatIsMnyra,
  renderZeroCut
} from "../apps/menyra-social/lead-landing-2/landing2-sections.js";
import { resolveSearchTerm } from "../apps/menyra-social/lead-landing-2/landing2-preview.js";
import { formatCents } from "../apps/menyra-social/lead-landing-2/landing2-format.js";
import {
  goPriceRows,
  LANDING2_ORDER_CENTS_PER_ITEM
} from "../apps/menyra-social/lead-landing-2/landing2-prices.js";

// Landing 2 verkauft ueber die Reihenfolge, nicht ueber die Menge.
//
// Wer die Seite oeffnet, kennt Mnyra nicht. Steht "Mnyra ist eine Plattform"
// vor seinem eigenen Logo, hat er weggewischt, bevor der Satz zu Ende ist.
// Deshalb pruefen diese Tests nicht nur, dass die Abschnitte da sind, sondern
// in welcher Reihenfolge sie stehen.

const profile = {
  name: "Burger Nora",
  bio: "Burger & më shumë",
  city: "Prishtinë",
  type: "restaurant",
  address: "Rr. Nëna Terezë 12",
  phone: "+383 44 000 000",
  currency: "EUR",
  openingHours: "10:00 - 23:00",
  logoUrl: "https://cdn.example/logo.jpg",
  coverUrl: "https://cdn.example/cover.jpg",
  instagram: "burgernora",
  followers: 1240,
  publicSlug: "burger-nora",
  locations: [{ address: "Rr. Nëna Terezë 12", lat: 42.66, lng: 21.16 }]
};

const posts = [
  { id: "p1", imageUrl: "https://cdn.example/p1.jpg", caption: "Sot", likeCount: 24, commentCount: 3, status: "active" },
  { id: "p2", imageUrl: "https://cdn.example/p2.jpg", caption: "Dje", likeCount: 8, commentCount: 1, status: "active" }
];

const menuItems = [
  {
    id: "m1", name: "Nora Burger", category: "Burger", section: "food", type: "food",
    cardStyle: "testfirst_food", description: "Me djathë dhe bacon", ingredients: "Mish viçi, djathë",
    allergens: "Gluten, laktozë", price: 4.5, imageUrl: "https://cdn.example/m1.jpg",
    orderIndex: 0, hidden: false, available: true
  },
  {
    id: "m2", name: "Coca Cola", category: "Pije", section: "drink", type: "drink",
    cardStyle: "testfirst_drink", description: "0.33l", ingredients: "", allergens: "",
    price: 1.5, imageUrl: "https://cdn.example/m2.jpg", orderIndex: 1, hidden: false, available: true
  }
];

const focusItems = [
  { id: "f1", title: "Menu e ditës", body: "Burger + pije", imageUrl: "https://cdn.example/f1.jpg", price: 5.5, category: "Burger" }
];

const neighbours = [
  { id: "n1", name: "Bar Luna", city: "Prishtinë", type: "bar", logoUrl: "https://cdn.example/n1.jpg", coverUrl: "https://cdn.example/c1.jpg" },
  { id: "n2", name: "Kafe Toska", city: "Prizren", type: "cafe", logoUrl: "https://cdn.example/n2.jpg", coverUrl: "https://cdn.example/c2.jpg" },
  { id: "n3", name: "Furra Ari", city: "Pejë", type: "bakery", logoUrl: "", coverUrl: "https://cdn.example/c3.jpg" }
];

function page() {
  const goPrices = goPriceRows((cents) => formatCents(cents, "EUR"));
  const orderPrice = formatCents(LANDING2_ORDER_CENTS_PER_ITEM, "EUR");
  return [
    renderHero(profile),
    renderProfileSequence(profile, posts, menuItems, focusItems),
    renderProduct(profile, menuItems),
    renderFree(),
    renderDiscoveryIntro(),
    renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours),
    renderDiscoveryClose(),
    renderWhatIsMnyra(),
    renderTableFlow(profile),
    renderStandard(profile, neighbours),
    renderZeroCut(),
    renderOrder(profile, menuItems, orderPrice),
    renderGo(profile, focusItems, menuItems, goPrices),
    renderSave(profile, menuItems),
    renderBiznesi(profile, posts, menuItems),
    renderVision(profile, neighbours),
    renderClosing(profile, { claimUrl: "/burger-nora" })
  ].join("\n");
}

function positions(html, needles) {
  return needles.map((needle) => {
    const at = html.indexOf(needle);
    assert.notEqual(at, -1, `"${needle}" kommt auf der Seite gar nicht vor`);
    return { needle, at };
  });
}

test("der erste Bildschirm zeigt das Lokal, nicht Mnyra", () => {
  const hero = renderHero(profile);
  const nameAt = hero.indexOf("Burger Nora");
  const pitchAt = hero.indexOf("platforma");
  assert.notEqual(nameAt, -1, "der Name des Lokals fehlt im ersten Bildschirm");
  assert.equal(pitchAt, -1, "im ersten Bildschirm wird schon Mnyra erklaert - zu frueh");
  assert.match(hero, /Kemi përgatitur diçka për ty\./);
  assert.match(hero, /Profili yt në MNYRA është gati\./);
  // Das echte Logo, nicht ein Platzhalter.
  assert.ok(hero.includes(profile.logoUrl), "das Logo des Lokals fehlt");
});

test("die Reihenfolge folgt dem Verkaufsablauf", () => {
  const html = page();
  const order = positions(html, [
    "Kemi përgatitur diçka për ty.",  // 1. mein Lokal
    "Ballina, logoja, emri",           // 2. mein fertiges Profil
    "Gjithçka që klienti duhet të dijë.", // 3. ein Produkt von innen
    "Dhe kjo është falas.",            // 4. das kostet nichts
    "Njerëzit rreth teje shohin",      // 5. so werde ich gefunden
    "MNYRA është platforma e gastronomisë.", // 6. ach so, das ist Mnyra
    "MNYRA nuk mbaron te dera.",       // 7. bis an den Tisch
    "E njëjta MNYRA. Kudo.",           // 8. ueberall dieselbe
    "Kamerieri është i zënë?",         // 9. optional: Order
    "Ke tavolina bosh?",               // 10. optional: GO
    "Ka mbetur ushqim?",               // 11. optional: SAVE
    "Gjithçka nga një vend.",          // 12. Biznesi
    "Një MNYRA. Kudo.",                // 13. Vision
    "Biznesi yt është gati."           // 14. zurueck zum Lokal
  ]);

  for (let index = 1; index < order.length; index += 1) {
    assert.ok(
      order[index].at > order[index - 1].at,
      `"${order[index].needle}" steht vor "${order[index - 1].needle}" - die Reihenfolge traegt den Verkauf`
    );
  }
});

test("das Kostenlose steht vor dem ersten Preis", () => {
  const html = page();
  const frei = html.indexOf("Dhe kjo është falas.");
  const preis = html.indexOf("për çdo produkt të porositur");
  assert.ok(frei > -1 && preis > -1);
  assert.ok(frei < preis, "der erste Preis steht vor dem ersten kostenlosen Versprechen");
});

test("die Zäsur zeigt 0 € und benennt, was frei bleibt", () => {
  const html = renderZeroCut();
  assert.match(html, /Deri këtu\?/);
  assert.match(html, /0 €/);
  assert.match(html, /MNYRA mbetet falas\./);
  ["Profili", "Menuja", "QR", "Postimet", "Harta", "Zbulimi"].forEach((label) => {
    assert.ok(html.includes(label), `${label} fehlt in der Aufzaehlung des Kostenlosen`);
  });
});

test("die Entdeckungs-Sequenz zeigt alle vier Orte", () => {
  const html = renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours);
  ["Qyteti", "Harta", "Lokalet", "Kërko"].forEach((line) => {
    assert.ok(html.includes(`<h2 class="l2-seq__title">${line}</h2>`), `${line} fehlt`);
  });
  // Das eigene Lokal steht in jeder Ansicht - darum geht es.
  assert.ok(html.split("Burger Nora").length - 1 >= 4, "das Lokal kommt nicht in jeder Ansicht vor");
});

test("der Suchbegriff kommt aus dem Lokal, nicht aus einer festen Liste", () => {
  assert.equal(resolveSearchTerm(profile, menuItems), "Burger");
  // Ein Cafe mit einem generischen Namen faellt auf die Kategorie zurueck.
  assert.equal(
    resolveSearchTerm({ name: "Bar Luna" }, [{ category: "Kafe" }]),
    "Luna"
  );
  assert.equal(
    resolveSearchTerm({ name: "Bar" }, [{ category: "Kafe" }]),
    "Kafe"
  );
});

test("Order zeigt den echten Preis und die Null-Aussage", () => {
  const html = renderOrder(profile, menuItems, formatCents(LANDING2_ORDER_CENTS_PER_ITEM, "EUR"));
  assert.match(html, /0,02 €/);
  assert.match(html, /0 porosi = 0 €\./);
  // Kein Abo-Wort.
  assert.ok(!/abonim|muaj/i.test(html.replace(/Opsionale/g, "")), "Order spricht Abo-Sprache");
});

test("GO zeigt die echten Preise nach Gruppengroesse", () => {
  const rows = goPriceRows((cents) => formatCents(cents, "EUR"));
  const html = renderGo(profile, focusItems, menuItems, rows);
  assert.match(html, /0,10 €/);
  assert.match(html, /0,50 €/);
  assert.match(html, /Paguaj vetëm kur ka rezultat\./);
});

test("SAVE ist als geplant gekennzeichnet, nicht als verfuegbar", () => {
  const html = renderSave(profile, menuItems);
  assert.ok(html.includes("Po vjen"), "SAVE wird ohne den Hinweis 'po vjen' gezeigt");
  assert.match(html, /është në përgatitje/, "es fehlt der klare Satz, dass SAVE noch nicht da ist");
});

test("das QR-Kapitel sagt, dass die Menue auch ohne Bestellen offen ist", () => {
  const html = renderTableFlow(profile);
  assert.match(html, /falas, edhe pa porosi/);
  assert.match(html, /Porosia është opsionale\./);
});

// Der Weg an den Tisch war einmal eine Reihe von vier Bildschirmen, und drei
// davon hatte der Wirt eine Minute vorher schon gesehen. Jetzt steht dort der
// einzige Bildschirm, den es an dieser Stelle noch nicht gab.
test("der Weg an den Tisch zeigt nur den Aufsteller, nicht noch einmal die App", () => {
  const html = renderTableFlow(profile);
  const screens = (html.match(/class="l2-screen /g) || []).length;
  assert.equal(screens, 1, `der Abschnitt zeigt ${screens} Bildschirme statt einem`);
  assert.ok(html.includes("l2-screen--qr"), "der Aufsteller fehlt");
  assert.ok(!html.includes("smart-header-pill"), "die Kopfzeile der App steht noch einmal da");
  assert.ok(!html.includes("business-profile-card-min-height"), "das Profil wird noch einmal gezeigt");
});

test("die Seite endet persoenlich, nicht mit einem Paket", () => {
  const html = renderClosing(profile, { claimUrl: "/burger-nora" });
  assert.ok(html.includes("Burger Nora"));
  assert.match(html, /Merr biznesin tim/);
  assert.match(html, /Falas · Pa abonim/);
  assert.ok(!/Bli tani|Zgjidh paketën|Abonohu/i.test(html), "am Ende steht eine Kaufaufforderung");
});

test("Text aus der Datenbank kann kein Markup werden", () => {
  const evil = {
    ...profile,
    name: '<img src=x onerror="alert(1)">',
    bio: "</h3><script>alert(2)</script>"
  };
  const html = [
    renderHero(evil),
    renderProfileSequence(evil, posts, menuItems, focusItems),
    renderClosing(evil, { claimUrl: "" })
  ].join("");
  assert.ok(!html.includes("<script>"), "ein Skript aus den Daten steht ungefiltert in der Seite");
  // onerror kommt in der Seite vor - als eigener Rueckfall am <img>, wenn ein
  // Bild nicht laedt. Aus den Daten darf es nicht kommen.
  assert.ok(!html.includes('onerror="alert'), "ein Attribut aus den Daten steht ungefiltert in der Seite");
  assert.ok(html.includes("&lt;img"), "der Name wird nicht maskiert");
  assert.ok(html.includes("&lt;/h3&gt;"), "die Bio wird nicht maskiert");
});

test("ein Lokal ohne Bilder ergibt trotzdem eine ganze Seite", () => {
  const leer = { name: "Lokal i Ri", city: "Prishtinë", currency: "EUR", locations: [] };
  const html = [
    renderHero(leer),
    renderProfileSequence(leer, [], [], []),
    renderFree(),
    renderDiscoverySequence(leer, [], [], [], []),
    renderTableFlow(leer),
    renderStandard(leer, []),
    renderProduct(leer, []),
    renderOrder(leer, [], "0,02 €"),
    renderGo(leer, [], [], []),
    renderSave(leer, []),
    renderBiznesi(leer, [], []),
    renderVision(leer, []),
    renderClosing(leer, { claimUrl: "" })
  ].join("");
  assert.ok(html.includes("Lokal i Ri"));
  // Auf der Seite selbst steht der Anfangsbuchstabe statt eines leeren
  // Kreises; im Mnyra-Bildschirm steht das, was die App dort zeigt - das
  // Zeichen "store" auf grauem Grund.
  assert.ok(html.includes("l2-hero__letter"), "ohne Logo bleibt oben ein leerer Kreis stehen");
  assert.ok(
    html.includes('rounded-[1.8rem] border-2 border-white bg-slate-100'),
    "im Profil fehlt der Platzhalter, den die App dort selbst zeichnet"
  );
  assert.ok(!html.includes("undefined"), "irgendwo steht 'undefined' in der Seite");
  assert.ok(!html.includes("NaN"), "irgendwo steht 'NaN' in der Seite");
});

// Die teuerste Stelle der ganzen Seite: derselbe Mnyra-Bildschirm zweimal.
//
// Wer sein Profil sieht und einen Wisch spaeter noch einmal fast dasselbe
// Profil, liest nicht "hier geht es weiter", sondern "das hatte ich schon" -
// und ab da liest er quer. Frueher stand das Profil dreimal auf der Seite
// (Kopf, Sequenz, Weg an den Tisch), die Menue zweimal, das Kerko-Fenster
// zweimal und die Kachelreihe zweimal.
//
// Jede Flaeche gehoert genau einem Abschnitt. Die Kennzeichen unten sind
// Stellen aus dem Markup der App, die nur in dieser einen Flaeche vorkommen.
test("kein Mnyra-Bildschirm kommt zweimal auf der Seite vor", () => {
  const html = page();
  const marks = {
    "Profil-Karte": "business-profile-card-min-height",
    "Menue": 'id="menu-section"',
    "Produktfenster": "menu-detail-modal-header",
    "Qyteti-Beitrag": "group feed-card",
    "Harta": "map-view-root",
    "Lokalet": '<section class="p-6 pb-24">',
    "Kerko": "l2-caret",
    "Aufsteller": "l2-qr__code",
    "Paneli": "mnyra-dash__bento",
    "Kachelreihe": 'class="l2-vision"',
    "Kreis": "l2-orbit__core"
  };
  Object.entries(marks).forEach(([name, needle]) => {
    const seen = html.split(needle).length - 1;
    assert.equal(seen, 1, `${name} kommt ${seen}x auf der Seite vor - erwartet genau einmal`);
  });
});

// Der Kopf traegt keine Vorschau mehr. Er war die eine Haelfte des
// Profil-Duplikats: oben das angeschnittene Profil, direkt darunter dasselbe
// Profil noch einmal als erster Schritt der Sequenz.
test("der Kopf zeigt Logo und Namen - und keine Vorschau", () => {
  const hero = renderHero(profile);
  assert.ok(!hero.includes("l2-screen"), "im Kopf steht noch ein Mnyra-Bildschirm");
  assert.ok(hero.includes("l2-hero__logo"), "das Logo des Lokals fehlt im Kopf");
});

// Die Beschriftung gehoert zur Flaeche, nicht zum Abschnitt: Sie steht in
// derselben stehenden Buehne, unmittelbar ueber der Vorschau, und traegt
// deshalb ihre eigene, kleinere Schrift - nicht die Plakatgroesse der
// Abschnitts-Ueberschriften.
test("die Beschriftung einer Sequenz steht bei ihrer Flaeche", () => {
  [
    renderProfileSequence(profile, posts, menuItems, focusItems),
    renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours)
  ].forEach((html, index) => {
    assert.ok(!html.includes('class="l2-h2"'), `Sequenz ${index}: die Beschriftung ist eine Abschnitts-Ueberschrift`);
    assert.ok(html.includes('class="l2-seq__title"'), `Sequenz ${index}: die Beschriftung fehlt`);
    const stage = html.indexOf("l2-seq__stage");
    const caption = html.indexOf("l2-seq__captions");
    assert.ok(caption > -1 && stage > caption, `Sequenz ${index}: die Flaeche steht vor ihrer Beschriftung`);
  });
});

// Drei bzw. vier Schritte - und keine dritte Sequenz. Alles andere sind
// gewoehnliche Abschnitte untereinander.
test("es gibt genau zwei stehende Sequenzen", () => {
  const html = page();
  const seqs = (html.match(/class="l2-seq"/g) || []).length;
  assert.equal(seqs, 2, `${seqs} stehende Sequenzen - erwartet zwei`);
  assert.ok(html.includes('--l2-steps:3'), "die Profil-Sequenz hat nicht drei Schritte");
  assert.ok(html.includes('--l2-steps:4'), "die Zbulim-Sequenz hat nicht vier Schritte");
});

test("jede Sequenz hat so viele Ansichten wie Schritte", () => {
  [
    renderProfileSequence(profile, posts, menuItems, focusItems),
    renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours)
  ].forEach((html, index) => {
    const captions = (html.match(/data-caption="/g) || []).length;
    const views = (html.match(/data-viewkey="/g) || []).length;
    const dots = (html.match(/l2-seq__dot(?!s)/g) || []).length;
    assert.equal(views, captions, `Sequenz ${index}: ${captions} Schritte, aber ${views} Ansichten`);
    assert.equal(dots, captions, `Sequenz ${index}: ${captions} Schritte, aber ${dots} Punkte`);
    assert.match(html, /--l2-steps:\d+/, `Sequenz ${index}: die Hoehe kennt die Zahl der Schritte nicht`);
  });
});

test("jeder Abschnitt traegt eine Marke fuer die Messung", () => {
  const html = page();
  const marks = Array.from(html.matchAll(/data-track="([a-z0-9-]+)"/g)).map((m) => m[1]);
  assert.ok(marks.length >= 12, `nur ${marks.length} Marken - die Messung haette Luecken`);
  assert.equal(new Set(marks).size, marks.length, "eine Marke kommt doppelt vor");
});
