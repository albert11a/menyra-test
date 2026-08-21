import test from "node:test";
import assert from "node:assert/strict";

import {
  renderBiznesi,
  renderClosing,
  renderDiscoveryClose,
  renderDiscoveryIntro,
  renderDiscoverySequence,
  renderFree,
  renderGoSequence,
  renderHero,
  renderOrderSequence,
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
// in welcher Reihenfolge sie stehen - und seit dem Umbau ausserdem, dass ein
// Wisch die Zustaende von Mnyra fuehrt und keine eigene Vorfuehrung.

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
  { id: "p2", imageUrl: "https://cdn.example/p2.jpg", caption: "Dje", likeCount: 8, commentCount: 1, status: "active" },
  { id: "p3", imageUrl: "https://cdn.example/p3.jpg", caption: "Pardje", likeCount: 5, commentCount: 0, status: "active" },
  { id: "p4", imageUrl: "https://cdn.example/p4.jpg", caption: "Java kaluar", likeCount: 2, commentCount: 0, status: "active" }
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
  },
  {
    id: "m3", name: "Chicken Wrap", category: "Wrap", section: "food", type: "food",
    cardStyle: "testfirst_food", description: "Me pule dhe salcë", ingredients: "Pulë",
    allergens: "Gluten", price: 3.9, imageUrl: "https://cdn.example/m3.jpg",
    orderIndex: 2, hidden: false, available: true
  },
  {
    id: "m4", name: "Patate", category: "Anash", section: "food", type: "food",
    cardStyle: "testfirst_food", description: "E freskët", ingredients: "Patate",
    allergens: "", price: 1.9, imageUrl: "https://cdn.example/m4.jpg",
    orderIndex: 3, hidden: false, available: true
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
    renderFree(),
    renderDiscoveryIntro(),
    renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours),
    renderDiscoveryClose(),
    renderWhatIsMnyra(),
    renderTableFlow(profile),
    renderStandard(profile, neighbours),
    renderZeroCut(),
    renderOrderSequence(profile, menuItems, orderPrice),
    renderGoSequence(profile, focusItems, menuItems, goPrices),
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

function count(html, needle) {
  return html.split(needle).length - 1;
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
    "E gjithë kjo falas.",             // 3. das kostet nichts
    "Shfaqu aty ku njerëzit janë.",    // 4. so werde ich gefunden
    "MNYRA është platforma e gastronomisë.", // 5. ach so, das ist Mnyra
    "MNYRA nuk mbaron te dera.",       // 6. bis an den Tisch
    "E njëjta MNYRA. Kudo.",           // 7. ueberall dieselbe
    "Kamerieri është i zënë?",         // 8. optional: Order
    "Ke tavolina bosh?",               // 9. optional: GO
    "Ka mbetur ushqim?",               // 10. optional: SAVE
    "Gjithçka nga një vend.",          // 11. Biznesi
    "Një MNYRA. Kudo.",                // 12. Vision
    "Biznesi yt është gati."           // 13. zurueck zum Lokal
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
  const frei = html.indexOf("E gjithë kjo falas.");
  const preis = html.indexOf("për çdo produkt të porositur");
  assert.ok(frei > -1 && preis > -1);
  assert.ok(frei < preis, "der erste Preis steht vor dem ersten kostenlosen Versprechen");
});

// Der Falas-Moment ist absichtlich kurz.
//
// Er kommt unmittelbar nach dem Profil, und an dieser Stelle hat der Wirt
// genau eine Frage: was kostet das. Eine Liste mit sechs Zeilen und ein
// "/ muaj" daneben laesst ihn nach dem Haken suchen - vier Worte und eine
// Null tun das nicht.
test("der Falas-Moment sagt einen Satz, nicht eine Preisliste", () => {
  const html = renderFree();
  assert.match(html, /E gjithë kjo falas\./);
  assert.match(html, /0 €/);
  assert.match(html, /Pa abonim\./);
  ["Profili", "Menuja", "Postimet", "QR"].forEach((label) => {
    assert.ok(html.includes(label), `${label} fehlt`);
  });
  assert.ok(!html.includes("muaj"), "hier steht schon eine Abo-Einheit");
  assert.ok(!html.includes("Story"), "der kurze Moment ist wieder eine Liste geworden");
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

/* ------------------------------------------- Das Profil als EIN Bildschirm */

// Der Kern des Umbaus, und der teuerste Fehler, wenn man ihn falsch macht.
//
// Ein Wirt, der sein Profil sieht und weiterwischt, soll nicht das Gefuehl
// haben, die Seite habe ihm ein anderes Bild hingelegt. Er soll das Gefuehl
// haben, in seinem Profil weiterzuscrollen. Deshalb ist das Profil EINE
// Flaeche ueber alle drei Zustaende - eine Karte, eine Reiterleiste - und
// nicht drei Aufnahmen, die einander ersetzen.
test("das Profil ist ein Bildschirm ueber drei Zustaende, nicht drei Bildschirme", () => {
  const html = renderProfileSequence(profile, posts, menuItems, focusItems);
  assert.equal(count(html, 'class="l2-screen '), 1, "das Profil steht mehr als einmal in der Buehne");
  assert.equal(count(html, "business-profile-card-min-height"), 1, "die Profilkarte steht mehrfach da");
  assert.equal(count(html, 'data-viewkey="profil"'), 1);
  assert.match(html, /data-from="0"[\s\S]{0,80}data-to="2"/, "die Flaeche traegt nicht alle drei Zustaende");
  assert.ok(html.includes('--l2-steps:3'), "die Profil-Sequenz hat nicht drei Zustaende");
});

// Zustand 1 ist Profilkopf UND Reiterleiste - und sonst nichts.
//
// Die Beitraege stehen im Markup schon da; sie liegen unter dem Kopf und
// werden erst sichtbar, wenn er nach oben gewandert ist. Wie hoch der Kopf
// dafuer mindestens sein muss, misst landing2-scroll.js auf dem Geraet: Die
// Marke dafuer ist der Kopf-Knoten, und ohne ihn schaute die erste
// Beitragskachel schon im ersten Zustand hervor.
test("der erste Profilzustand traegt Kopf und Reiterleiste - die Posts liegen darunter", () => {
  const html = renderProfileSequence(profile, posts, menuItems, focusItems);
  const head = html.indexOf("data-l2-head");
  const stick = html.indexOf("data-l2-stick");
  const panels = html.indexOf("data-l2-panels");
  assert.ok(head > -1, "es gibt keinen Kopf, der wandern koennte");
  assert.ok(stick > head, "die Reiterleiste steht nicht unter dem Kopf");
  assert.ok(panels > stick, "die Beitraege stehen nicht unter der Reiterleiste");
  // Der Kopf traegt die Profilkarte, nicht die Beitraege.
  const headBlock = html.slice(head, stick);
  assert.ok(headBlock.includes("business-profile-card-min-height"), "im Kopf steht nicht die Profilkarte");
  assert.ok(!headBlock.includes("aspect-[4/5]"), "im Kopf steht schon eine Beitragskachel");
});

// Es ist DIESELBE Leiste - eine, im Markup, ueber alle drei Zustaende.
// Was der Scroll umschaltet, sind die Klassen, die Mnyra selbst an einen
// aktiven Reiter haengt.
test("der Reiterwechsel ist der von Mnyra, keine eigene Bewegung", () => {
  const html = renderProfileSequence(profile, posts, menuItems, focusItems);
  assert.equal(count(html, 'data-l2-tab="posts"'), 1, "es gibt mehr als eine Reiterleiste");
  assert.equal(count(html, 'data-l2-tab="menu"'), 1, "es gibt mehr als eine Reiterleiste");
  assert.match(html, /data-tabs="posts,posts,menu"/, "der Scroll fuehrt den Reiter nicht");
  assert.ok(html.includes("transition-all duration-300"), "der Wechsel laeuft ohne die Bewegung der App");
});

// Zwei Beitraege, zwei Speisen, keine Getraenke.
//
// Diese Seite ist keine Profilhistorie und keine Speisekarte. Der Wirt hat
// beides selbst geschrieben; er muss hier sehen, wie ein Gast es sieht.
test("das Profil zeigt zwei Beitraege und zwei Speisen - nicht mehr", () => {
  const html = renderProfileSequence(profile, posts, menuItems, focusItems);
  assert.equal(count(html, 'class="relative aspect-[4/5]'), 2, "es stehen nicht genau zwei Beitraege da");
  assert.equal(count(html, "rounded-[2.2rem] border border-slate-100"), 2, "es stehen nicht genau zwei Speisen da");
  assert.ok(!html.includes("Coca Cola"), "im Menue-Zustand steht ein Getraenk");
  assert.ok(html.includes("Nora Burger") && html.includes("Chicken Wrap"), "es fehlen die beiden Speisen");
  // "Sot ne Fokus" - die Flaeche, die es in Mnyra dafuer gibt.
  assert.ok(html.includes("Menu e ditës"), "der Fokus-Bereich fehlt im Menue-Zustand");
});

/* -------------------------------------------------------- Die Entdeckung */

test("die Entdeckungs-Abfolge ist Qyteti, Harta, Lokalet, Kërko", () => {
  const html = renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours);
  const order = positions(html, [
    'data-viewkey="qyteti"',
    'data-viewkey="harta"',
    'data-viewkey="lokalet"',
    'data-viewkey="kerko"'
  ]);
  for (let index = 1; index < order.length; index += 1) {
    assert.ok(order[index].at > order[index - 1].at, `${order[index].needle} steht an der falschen Stelle`);
  }
  // Das eigene Lokal steht in jeder Ansicht - darum geht es.
  assert.ok(html.split("Burger Nora").length - 1 >= 4, "das Lokal kommt nicht in jeder Ansicht vor");
});

// Qyteti in zwei Zustaenden - und das ist keine Zerlegung aus Bequemlichkeit.
//
// Story-Reihe und Beitrag sind zusammen hoeher als jedes Telefon. Wer beides
// zugleich zeigen will, muss verkleinern. Also erst die Reihe allein, und der
// Scrollstand schiebt sie nach oben und den Beitrag herein - wie im Feed.
test("Qyteti zeigt erst die Story-Reihe allein, dann den Beitrag", () => {
  const html = renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours);
  const view = html.slice(html.indexOf('data-viewkey="qyteti"'), html.indexOf('data-viewkey="harta"'));
  const head = view.indexOf("data-l2-head");
  const panels = view.indexOf("data-l2-panels");
  assert.ok(head > -1 && panels > head, "Qyteti ist kein laufender Bildschirm");
  const headBlock = view.slice(head, panels);
  assert.ok(headBlock.includes("snap-x snap-mandatory"), "im Kopf steht nicht die Story-Reihe");
  assert.ok(!headBlock.includes("group feed-card"), "im ersten Qyteti-Zustand schaut schon der Beitrag herein");
  assert.ok(view.slice(panels).includes("group feed-card"), "der Beitrag steht nicht unter der Story-Reihe");
  assert.match(view, /data-from="0"[\s\S]{0,80}data-to="1"/, "Qyteti traegt nicht zwei Zustaende");
});

// Harta bekommt einen Zustand und keine zwei: Sie fuellt ihr Fenster von
// selbst, und was von selbst passt, aufzuteilen waere eine Zerlegung ohne
// Grund.
test("Harta bleibt ein Zustand", () => {
  const html = renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours);
  const view = html.slice(html.indexOf('data-viewkey="harta"'), html.indexOf('data-viewkey="lokalet"'));
  assert.match(view, /data-from="2"[\s\S]{0,80}data-to="2"/);
  assert.ok(view.includes("map-view-root"));
  assert.ok(!view.includes("data-l2-panels"), "die Karte wurde ohne Not aufgeteilt");
});

// Kerko in zwei Zustaenden: das leere Feld und das Ergebnis. Der zweite ist
// die Suche, die jemand wirklich getippt hat - keine erfundene Suchkarte.
test("Kërko zeigt erst das leere Feld, dann das Ergebnis", () => {
  const html = renderDiscoverySequence(profile, posts, focusItems, menuItems, neighbours);
  const view = html.slice(html.indexOf('data-viewkey="kerko"'));
  assert.equal(count(view, "data-l2-panel data-from"), 2, "Kërko hat nicht zwei Zustaende");
  const leer = view.indexOf("Kërko lokale, ushqime...");
  const treffer = view.indexOf("uppercase tracking-widest\">Business<");
  assert.ok(leer > -1, "der leere Suchzustand fehlt");
  assert.ok(treffer > leer, "das Ergebnis steht vor der leeren Suche");
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

/* ------------------------------------------------------ Die Zusatzfunktionen */

// Der Weg einer Bestellung ist eine Abfolge von Handgriffen, und jeder davon
// ist ein eigener Bildschirm in Mnyra. Sie in eine Karte zu pressen waere
// eine Zeichnung: schnell zu lesen und in keinem Renderer der App zu finden.
test("Order fuehrt durch die echten Schritte, nicht durch eine Karte", () => {
  const html = renderOrderSequence(profile, menuItems, formatCents(LANDING2_ORDER_CENTS_PER_ITEM, "EUR"));
  const order = positions(html, [
    'data-viewkey="produkti"',
    'data-viewkey="shporta"',
    'data-viewkey="derguar"'
  ]);
  for (let index = 1; index < order.length; index += 1) {
    assert.ok(order[index].at > order[index - 1].at, `${order[index].needle} steht an der falschen Stelle`);
  }
  assert.ok(html.includes("Shto ne shporte"), "der Handgriff, mit dem es anfaengt, fehlt");
  assert.ok(html.includes("Dergo porosine e tavolines"), "die Shporta ist nicht die von Mnyra");
  assert.ok(html.includes("Porosia u dergua"), "der Abschluss fehlt");
  assert.match(html, /0,02 €/);
  assert.match(html, /0 porosi = 0 €\./);
  // Kein Abo-Wort.
  assert.ok(!/abonim|muaj/i.test(html.replace(/Opsionale/g, "")), "Order spricht Abo-Sprache");
});

// GO hat zwei Seiten - ein Gast sucht, ein Lokal antwortet -, und wer das in
// eine Karte presst, muss erklaeren, wer gerade wer ist.
test("GO fuehrt vom Suchen ueber die Oferta bis zum Kommen", () => {
  const rows = goPriceRows((cents) => formatCents(cents, "EUR"));
  const html = renderGoSequence(profile, focusItems, menuItems, rows);
  const order = positions(html, [
    'data-viewkey="go-kerkon"',
    'data-viewkey="go-oferta"',
    'data-viewkey="go-pranuar"'
  ]);
  for (let index = 1; index < order.length; index += 1) {
    assert.ok(order[index].at > order[index - 1].at, `${order[index].needle} steht an der falschen Stelle`);
  }
  assert.ok(html.includes("Çka po kërkoni tani?"), "die Karte, mit der ein Gast anfaengt, fehlt");
  assert.ok(html.includes("po ju ofron"), "die Ergebniskarte von Mnyra GO fehlt");
  assert.ok(html.includes("Aktivizo në lokal"), "der Zustand nach dem Annehmen fehlt");
  assert.match(html, /0,10 €/);
  assert.match(html, /0,50 €/);
  assert.match(html, /Paguaj vetëm kur ka rezultat\./);
});

// Das Paneli nach derselben Regel wie das Profil: Kennzahlen und
// Reiterleiste bleiben stehen, die Flaeche darunter wechselt.
test("Biznesi laeuft in zwei Zustaenden auf einer Flaeche", () => {
  const html = renderBiznesi(profile, posts, menuItems);
  assert.equal(count(html, 'data-viewkey="paneli"'), 1, "das Paneli steht mehrfach da");
  assert.match(html, /data-tabs="funksionet,analitika"/);
  assert.ok(html.includes("data-l2-head"), "die Kennzahlen wandern nicht");
  assert.ok(html.includes("data-l2-stick"), "die Reiterleiste bleibt nicht stehen");
  assert.equal(count(html, "data-l2-panel data-from"), 2, "es gibt nicht zwei Flaechen darunter");
  assert.ok(html.includes("Ndaj një postim ose një story me klientët e tu."), "die Funksionet fehlen");
  assert.ok(html.includes("mnyra-dash__post-caption"), "die Analitika fehlt");
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
    renderOrderSequence(leer, [], "0,02 €"),
    renderGoSequence(leer, [], [], []),
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
// und ab da liest er quer.
//
// Jede Flaeche gehoert genau einem Abschnitt. Die Kennzeichen unten sind
// Stellen aus dem Markup der App, die nur in dieser einen Flaeche vorkommen.
test("kein Mnyra-Bildschirm kommt zweimal auf der Seite vor", () => {
  const html = page();
  const marks = {
    "Profil-Karte": "business-profile-card-min-height",
    "Profil-Reiter": 'data-l2-tab="posts"',
    "Menue": 'id="menu-section"',
    "Produktfenster": "menu-detail-modal-header",
    "Qyteti-Story-Reihe": "snap-x snap-mandatory",
    "Qyteti-Beitrag": "group feed-card",
    "Harta": "map-view-root",
    "Lokalet": '<section class="p-6 pb-24">',
    "Kerko-leer": "Kërko lokale, ushqime...",
    "Shporta": "Dergo porosine e tavolines",
    "Porosia gati": "Porosia u dergua",
    "GO-Oferta": "po ju ofron",
    "Aufsteller": "l2-qr__code",
    "Paneli-Reiter": 'data-l2-tab="funksionet"',
    "Kachelreihe": 'class="l2-vision"',
    "Kreis": "l2-orbit__core"
  };
  Object.entries(marks).forEach(([name, needle]) => {
    const seen = count(html, needle);
    assert.equal(seen, 1, `${name} kommt ${seen}x auf der Seite vor - erwartet genau einmal`);
  });
});

// Der Kopf traegt keine Vorschau. Er war einmal die eine Haelfte eines
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

test("jede Sequenz hat so viele Saetze und Punkte wie Zustaende", () => {
  const html = page();
  const sections = html.split('<section class="l2-seq"').slice(1);
  assert.ok(sections.length >= 5, `nur ${sections.length} gefuehrte Flaechen`);
  sections.forEach((block, index) => {
    const steps = Number((/--l2-steps:(\d+)/.exec(block) || [])[1] || 0);
    const captions = count(block, 'data-caption="');
    const dots = (block.match(/l2-seq__dot(?!s)/g) || []).length;
    assert.ok(steps > 0, `Sequenz ${index}: die Hoehe kennt die Zahl der Zustaende nicht`);
    assert.equal(captions, steps, `Sequenz ${index}: ${steps} Zustaende, aber ${captions} Saetze`);
    assert.equal(dots, steps, `Sequenz ${index}: ${steps} Zustaende, aber ${dots} Punkte`);
  });
});

// Jede Flaeche muss sagen, von welchem bis zu welchem Zustand sie gilt, und
// die Flaechen einer Sequenz muessen deren Zustaende lueckenlos abdecken.
// Eine Luecke waere ein Wisch ins Leere - und der sieht nicht nach Fehler
// aus, sondern nach einem Geraet, das gerade nicht mitkommt.
test("die Flaechen einer Sequenz decken jeden Zustand genau einmal ab", () => {
  const html = page();
  const sections = html.split('<section class="l2-seq"').slice(1);
  sections.forEach((block, index) => {
    const steps = Number((/--l2-steps:(\d+)/.exec(block) || [])[1] || 0);
    const spans = Array.from(block.matchAll(/data-from="(\d+)"\s+data-to="(\d+)"/g))
      .map((match) => [Number(match[1]), Number(match[2])]);
    // data-from/-to steht sowohl an den Flaechen als auch an den Feldern
    // darin. Gemeint sind hier die Flaechen: Sie stehen zuerst.
    const views = Array.from(block.matchAll(/data-viewkey="[^"]*"\s+data-from="(\d+)"\s+data-to="(\d+)"/g))
      .map((match) => [Number(match[1]), Number(match[2])]);
    assert.ok(spans.length >= views.length);
    assert.ok(views.length > 0, `Sequenz ${index}: gar keine Flaeche`);
    const covered = [];
    views.forEach(([from, to]) => {
      assert.ok(to >= from, `Sequenz ${index}: eine Flaeche endet vor ihrem Anfang`);
      for (let step = from; step <= to; step += 1) covered.push(step);
    });
    covered.sort((a, b) => a - b);
    assert.deepEqual(
      covered,
      Array.from({ length: steps }, (_, step) => step),
      `Sequenz ${index}: die Flaechen decken die Zustaende nicht lueckenlos ab`
    );
  });
});

test("jeder Abschnitt traegt eine Marke fuer die Messung", () => {
  const html = page();
  const marks = Array.from(html.matchAll(/data-track="([a-z0-9-]+)"/g)).map((m) => m[1]);
  assert.ok(marks.length >= 12, `nur ${marks.length} Marken - die Messung haette Luecken`);
  assert.equal(new Set(marks).size, marks.length, "eine Marke kommt doppelt vor");
});
