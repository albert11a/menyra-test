import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  normalizeComposerProductCore,
  filterComposerProductsCore,
  canPublishComposerDraftCore,
  normalizeComposerModeCore,
  resolveComposerProductTextCore,
  dedupeComposerProductsCore,
  buildComposerProductsSignatureCore,
  BUSINESS_COMPOSER_CSS
} from "../apps/menyra-social/core/composer/business-composer-controller.js";
import {
  renderDashboardComposerCard,
  renderDashboardComposerSplitCards,
  resolveDashboardKindCore,
  DASHBOARD_CSS
} from "../apps/menyra-social/core/dashboard/dashboard-render-utils.js";
import { collectHotelRoomsCore } from "../apps/menyra-social/core/profile/hotel-rooms-utils.js";

test("composer card has one button - the choice is made in the modal", () => {
  const html = renderDashboardComposerCard({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  // Ueberschrift und Untertitel bleiben Wort fuer Wort, wie sie waren.
  assert.ok(html.includes("Posto n'"));
  assert.ok(html.includes('<span class="mnyra-dash__composer-accent">Zbulo</span>'));
  assert.ok(html.includes("Ndaj një postim ose një story me klientët e tu."));
  // Genau ein Knopf, ausgefuellt, mit Plus - und er oeffnet den Beitrag.
  assert.equal((html.match(/<button/g) || []).length, 1);
  assert.ok(html.includes('class="mnyra-dash__composer-btn mnyra-dash__composer-btn--primary" data-dashboard-composer="post"'));
  assert.ok(html.includes(">Posto<"));
  assert.equal((html.match(/data-icon="plus"/g) || []).length, 1);
  // Kein zweiter Knopf mehr fuer Story - dafuer gibt es die Leiste im Modal.
  assert.ok(!html.includes('data-dashboard-composer="story"'));
  assert.ok(html.includes("mnyra-dash__composer-actions--single"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-actions--single { grid-template-columns: minmax(0, 1fr); }"));
});

test("composer knows exactly three sides", () => {
  assert.equal(normalizeComposerModeCore("post"), "post");
  assert.equal(normalizeComposerModeCore("story"), "story");
  assert.equal(normalizeComposerModeCore("profile"), "profile");
  assert.equal(normalizeComposerModeCore("PROFILE"), "profile");
  // Alles Unbekannte landet beim Beitrag - nie bei Story oder Profil.
  assert.equal(normalizeComposerModeCore("quatsch"), "post");
  assert.equal(normalizeComposerModeCore(""), "post");
  assert.equal(normalizeComposerModeCore(), "post");
});

test("modal carries its own bottom bar to switch between postim, story and profil", () => {
  // Die Leiste sitzt unten im Modal, ueber der Browserleiste des Telefons.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__foot {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 10px);"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__switch {"));
  // Drei gleich breite Felder, das aktive hebt sich weiss ab.
  const sw = BUSINESS_COMPOSER_CSS.slice(BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__switch {"));
  assert.ok(sw.slice(0, sw.indexOf("}")).includes("grid-template-columns: repeat(3, minmax(0, 1fr));"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__switch-btn[aria-selected=\"true\"] {"));
  // Waehrend des Postens ist die Leiste gesperrt.
  assert.ok(BUSINESS_COMPOSER_CSS.includes('.mnyra-bc[data-busy="1"] .mnyra-bc__foot,'));
});

test("composer card styles keep the mockup layout", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-btn--primary {"));
  // Abstand zur Begruessung darueber, kleinere Knoepfe.
  assert.ok(DASHBOARD_CSS.includes("margin-top: 34px;"));
  assert.ok(DASHBOARD_CSS.includes("min-height: 46px;"));
  // Der ausgefuellte Knopf wirft keinen eigenen Schatten mehr.
  assert.ok(!DASHBOARD_CSS.includes("rgba(79, 70, 229, 0.9)"));
  // Das Logo neben der Begruessung steht flach in der Seite, ohne Schatten.
  const greetLogoBlock = DASHBOARD_CSS.slice(
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo {"),
    DASHBOARD_CSS.indexOf(".mnyra-dash__greet-logo img,")
  );
  assert.ok(!greetLogoBlock.includes("box-shadow"), greetLogoBlock);
  // "Përshëndetje," steht in derselben Farbe wie der Name des Lokals daneben.
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__greet-hello { color: var(--dash-ink); }"));
  const titleBlock = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__greet-title {"));
  assert.ok(titleBlock.slice(0, titleBlock.indexOf("}")).includes("color: var(--dash-ink);"));
});

test("every panel card shares one radius, casts no shadow and wears the profile hairline", () => {
  // Eine Zahl fuer alle Karten - aendert man sie, aendern sich alle zugleich.
  assert.ok(DASHBOARD_CSS.includes("--dash-card-radius: 25px;"));
  // Die Haarlinie der Profil-Karten (border-slate-100).
  assert.ok(DASHBOARD_CSS.includes("--dash-hairline: #f1f5f9;"));
  // Im ganzen Panel wirft nichts mehr einen Schatten.
  assert.ok(!DASHBOARD_CSS.includes("box-shadow"), "im Panel darf kein box-shadow stehen");
  const flaechen = ["mnyra-dash__composer {", "mnyra-dash__action {", "mnyra-dash__kpi {", "mnyra-dash__posts {", "mnyra-dash__state {"];
  flaechen.forEach((sel) => {
    const start = DASHBOARD_CSS.indexOf(`.${sel}`);
    assert.ok(start > -1, `${sel} fehlt`);
    const block = DASHBOARD_CSS.slice(start, DASHBOARD_CSS.indexOf("}", start));
    assert.ok(
      block.includes("border-radius: var(--dash-card-radius);"),
      `${sel} nutzt nicht die gemeinsame Rundung: ${block}`
    );
    // Dieselbe Haarlinie wie die Profil-Karten - ausdruecklich gesetzt, weil
    // die Kacheln <button> sind und der Browser sonst seinen eigenen dicken
    // Standardrahmen zeichnet.
    assert.ok(block.includes("border: 1px solid var(--dash-hairline);"), `${sel}: Haarlinie fehlt: ${block}`);
  });
  // Der Lade-Platzhalter hat dieselbe Rundung, damit nichts springt.
  const skel = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__skeleton {"));
  assert.ok(skel.slice(0, skel.indexOf("}")).includes("border-radius: var(--dash-card-radius);"));
  // Die Knoepfe behalten ihren Umriss - sie sind keine Karten.
  const btn = DASHBOARD_CSS.slice(DASHBOARD_CSS.indexOf(".mnyra-dash__composer-btn {"));
  assert.ok(btn.slice(0, btn.indexOf("}")).includes("border: 1px solid var(--dash-border);"));
});

test("two half cards sit under the composer card and share its width", () => {
  const html = renderDashboardComposerSplitCards({ iconFn: (name) => `<i data-icon="${name}"></i>` });
  // Eine Zeile mit zwei Karten - zusammen so breit wie "Posto n'Zbulo".
  assert.ok(html.startsWith('<div class="mnyra-dash__composer-row">'));
  assert.equal((html.match(/mnyra-dash__composer--split/g) || []).length, 2);
  // Links Profil, rechts Meny - Wortbild wie bei "Posto n'Zbulo".
  const left = html.indexOf(">Profil<");
  const right = html.indexOf(">Meny<");
  assert.ok(left > -1 && right > left, `${left}/${right}`);
  assert.ok(html.includes(`Posto n'<span class="mnyra-dash__composer-accent">Profil</span>`));
  assert.ok(html.includes(`Posto n'<span class="mnyra-dash__composer-accent">Meny</span>`));
  assert.ok(html.includes("Postim që shfaqet në profilin tënd."));
  assert.ok(html.includes("Produktet dhe kategoritë e menysë."));
  // Profil oeffnet den Composer auf seiner eigenen Seite, Meny fuehrt in den
  // Menue-Editor - beides ueber die schon vorhandenen Handler.
  assert.ok(html.includes('data-dashboard-composer="profile"'));
  assert.ok(html.includes('data-nav="menu"'));
  assert.ok(html.includes('data-icon="plus"'));
  assert.ok(html.includes('data-icon="utensils"'));
  // Genau ein Knopf je Karte.
  assert.equal((html.match(/<button/g) || []).length, 2);
});

test("half card styles share the composer surface and stack their button", () => {
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer-row {"));
  assert.ok(DASHBOARD_CSS.includes(".mnyra-dash__composer--split {"));
  // Eine Spalte statt zwei, Knopf unten buendig.
  assert.ok(DASHBOARD_CSS.includes("grid-template-columns: minmax(0, 1fr);"));
  assert.ok(DASHBOARD_CSS.includes("margin-top: auto;"));
  // Schrift der beiden vorgegebenen Texte bleibt unveraendert.
  assert.ok(DASHBOARD_CSS.includes("font-size: 17px;\n  font-weight: 900;\n  letter-spacing: -0.01em;"));
  assert.ok(DASHBOARD_CSS.includes("margin: 5px 0 0;\n  font-size: 11px;\n  font-weight: 700;\n  line-height: 1.45;"));
});

test("publish is only possible with caption and image and never while posting", () => {
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: true }), true);
  assert.equal(canPublishComposerDraftCore({ caption: "   ", hasImage: true }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: false }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "", hasImage: false }), false);
  // Doppel-Tap-Schutz: waehrend eines laufenden Posts nie erneut freigeben.
  assert.equal(canPublishComposerDraftCore({ caption: "Hallo", hasImage: true, submitting: true }), false);
  assert.equal(canPublishComposerDraftCore({}), false);
});

test("product normalization keeps name, price, image and type", () => {
  const food = normalizeComposerProductCore("m1", {
    name: "  Pizza Napoli  ",
    price: 7.5,
    category: "Pica",
    imageUrl: " https://img/p.jpg ",
    type: "food"
  });
  assert.deepEqual(food, {
    id: "m1",
    name: "Pizza Napoli",
    price: 7.5,
    category: "Pica",
    type: "food",
    imageUrl: "https://img/p.jpg"
  });

  const drink = normalizeComposerProductCore("m2", { title: "Coca Cola", type: "Getränke", images: ["https://img/c.jpg"] });
  assert.equal(drink.name, "Coca Cola");
  assert.equal(drink.type, "drink");
  assert.equal(drink.imageUrl, "https://img/c.jpg");
  assert.equal(drink.price, "");

  // Ohne Namen faellt der Eintrag auf die Id zurueck, ohne Id gibt es keinen Eintrag.
  assert.equal(normalizeComposerProductCore("m3", {}).name, "m3");
  assert.equal(normalizeComposerProductCore("", { name: "X" }), null);
});

test("product search matches name and category, empty term keeps all", () => {
  const products = [
    normalizeComposerProductCore("m1", { name: "Pizza Napoli", category: "Pica" }),
    normalizeComposerProductCore("m2", { name: "Coca Cola", category: "Pije" }),
    normalizeComposerProductCore("m3", { name: "Burger", category: "Fast Food" })
  ];
  assert.equal(filterComposerProductsCore(products, "").length, 3);
  assert.equal(filterComposerProductsCore(products, "   ").length, 3);
  assert.deepEqual(filterComposerProductsCore(products, "cola").map((p) => p.id), ["m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "PIJE").map((p) => p.id), ["m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "pi").map((p) => p.id), ["m1", "m2"]);
  assert.deepEqual(filterComposerProductsCore(products, "xyz"), []);
  assert.deepEqual(filterComposerProductsCore(null, "a"), []);
});

test("composer styles carry the preview stage and the fullscreen sheet", () => {
  // Die Vorschauen bringen kein eigenes Aussehen mit: sie stellen das
  // Original nur auf eine Buehne und skalieren es als Ganzes.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage-inner {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("transform-origin: top left;"));
  // Der Feed-Beitrag steht randlos, damit er in Originalbreite passt.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__stage--bleed {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("--safe-area-top"));
  // Die Story-Reihe: eine Flex-Reihe mit dem Abstand des Feeds, die zwei
  // fremden Kacheln stehen unscharf daneben.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__story-track {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("gap: 10px;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__story-track > [data-bc-story-blur] { opacity: 0.6; }"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("filter: blur(4px) saturate(0.85);"));
});

test("product label follows the kind of business", () => {
  // Lokal mit Essen -> Meny, Shop -> Produkte, Hotel/Motel -> Dhoma.
  assert.equal(resolveComposerProductTextCore("restaurant").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore("shop").tag, "Etiketo nga produktet");
  assert.equal(resolveComposerProductTextCore("hotel").tag, "Etiketo nga dhomat");
  // Die Art kommt aus derselben Zuordnung wie die Dashboard-Kacheln.
  const kindOf = (businessType, isShopCatalog = false) => resolveDashboardKindCore({ businessType, isShopCatalog });
  assert.equal(resolveComposerProductTextCore(kindOf("cafe")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("bar")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("fastfood")).tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore(kindOf("motel")).tag, "Etiketo nga dhomat");
  assert.equal(resolveComposerProductTextCore(kindOf("hostel")).tag, "Etiketo nga dhomat");
  assert.equal(resolveComposerProductTextCore(kindOf("ecommerce", true)).tag, "Etiketo nga produktet");
  // Auch Popup-Titel, Suchfeld und Leermeldung sprechen dieselbe Sprache.
  assert.equal(resolveComposerProductTextCore("hotel").pickerTitle, "Zgjidh nga dhomat");
  assert.equal(resolveComposerProductTextCore("hotel").pickerSearch, "Kërko dhoma…");
  assert.equal(resolveComposerProductTextCore("hotel").pickerEmpty, "Nuk u gjet asnjë dhomë.");
  assert.equal(resolveComposerProductTextCore("shop").pickerTitle, "Zgjidh nga produktet");
  // Unbekanntes bleibt beim Lokal - nie leer.
  assert.equal(resolveComposerProductTextCore("").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore("quatsch").tag, "Etiketo nga menuja");
  assert.equal(resolveComposerProductTextCore().tag, "Etiketo nga menuja");
});

test("input field and upload buttons are one rounded block", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Ein Rahmen aussen, die Textflaeche selbst traegt keinen mehr.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__compose {\n  border: 1px solid var(--bc-line);\n  border-radius: 24px;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__text {\n  display: block;\n  width: 100%;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border: 0;\n  border-radius: 0;"));
  // Duenne Trennlinie, darunter die Knopfzeile mit dem Zaehler rechts.
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__compose-bar {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border-top: 1px solid var(--bc-line);\n}"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__count {"));
  // Die Knoepfe sind Pillen, nicht mehr zwei hohe Kacheln neben dem Feld.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  border-radius: 999px;\n  background: var(--bc-plane);"));
  assert.ok(!BUSINESS_COMPOSER_CSS.includes("flex: 0 0 100px;"));
  // Der Produkt-Knopf ist in allen drei Modi da - kein hidden mehr.
  assert.ok(source.includes("<button type=\"button\" class=\"mnyra-bc__tool\" data-bc-tag>"));
  assert.ok(!source.includes("nodes.tag.hidden"));
  assert.ok(!source.includes('if (mode !== "story" || submitting) return;'));
  // Zaehler zeigt die echte Grenze, nicht eine erfundene.
  assert.ok(source.includes("`${used}/${CAPTION_MAX_LENGTH}`"));
});

test("hotels tag their rooms, not menu items", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/dashboard/dashboard-view-controller.js", import.meta.url),
    "utf8"
  );
  // Zimmer stehen am Restaurant-Datensatz - kein zweiter Firestore-Lesezugriff.
  assert.ok(source.includes("collectHotelRoomsCore(record)"));
  assert.ok(source.includes('resolveBusinessKind() === "hotel"'));
  // Eine Zuordnung fuer Kacheln, Beschriftung und Datenquelle.
  assert.equal((source.match(/resolveDashboardKindCore\(\{/g) || []).length, 1);
  // Und die Art wandert bis in den Composer.
  assert.ok(source.includes("getBusinessKindFn:"));

  const rooms = collectHotelRoomsCore({
    hotelRooms: [
      { id: "r1", title: "Suita", price: 90, beds: "1 krevat dopio", images: ["https://img/r1.jpg"] },
      { id: "r2", title: "", price: 40 }
    ]
  });
  // Zimmer ohne Namen zaehlen nicht mit.
  assert.deepEqual(rooms.map((room) => room.id), ["r1"]);
  assert.equal(rooms[0].title, "Suita");
  assert.equal(rooms[0].imageUrl, "https://img/r1.jpg");
});

test("a tagged product survives the post, not only the story", async () => {
  const composerSource = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  const uploadSource = await readFile(
    new URL("../apps/menyra-social/core/media/media-upload-runtime-controller.js", import.meta.url),
    "utf8"
  );
  // Ein Satz Felder fuer beide Schreibwege - keine zweite Schreibweise.
  assert.ok(composerSource.includes("const productFields = {"));
  assert.ok(composerSource.includes("...productFields"));
  assert.equal((composerSource.match(/\.\.\.productFields/g) || []).length, 2);
  // Der Beitrag speichert sie im Dokument und in der Feed-Spiegelung.
  assert.equal((uploadSource.match(/\.\.\.tagged/g) || []).length, 2);
  assert.ok(uploadSource.includes("menuItemId: String(menuItemId || \"\").trim()"));
});

test("no status sentences under the input field", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Weder der Hinweis noch die Fertig-Meldung stehen noch irgendwo.
  assert.ok(!source.includes("duhen edhe teksti"));
  assert.ok(!source.includes("Gati për t'u postuar"));
  assert.ok(!source.includes("data-bc-hint"));
  assert.ok(!BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__hint"));
  // Der Posto-Knopf bleibt die einzige Rueckmeldung: er ist scharf oder nicht.
  assert.equal(canPublishComposerDraftCore({ caption: "hi", hasImage: true }), true);
  assert.equal(canPublishComposerDraftCore({ caption: "hi", hasImage: false }), false);
  assert.equal(canPublishComposerDraftCore({ caption: "", hasImage: true }), false);
});

test("preview starts at the same left edge as everything else", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  // Beitrag und Profil-Kachel stehen linksbuendig, ohne den leeren Rand der
  // App-Shell - aber in genau der Breite, die sie in der App haben.
  assert.ok(source.includes("const APP_CONTENT_INLINE = 24;"));
  assert.ok(source.includes("const cardWidth = Math.max(1, shellWidth - APP_CONTENT_INLINE * 2);"));
  assert.ok(source.includes("applyBleedStage(nodes.stagePost, nodes.stagePostInner, cardWidth, { centered: false });"));
  assert.ok(source.includes("applyBleedStage(nodes.stageProfile, nodes.stageProfileInner, cardWidth, { centered: false });"));
  assert.ok(!source.includes('`<div class="app-content-inline py-4">'));
  // Die Story-Reihe laeuft in der App von Rand zu Rand - sie bleibt randlos.
  assert.ok(source.includes("applyBleedStage(nodes.stageStory, nodes.stageStoryInner, shellWidth);"));
  assert.ok(source.includes('<div class="mnyra-bc__stage mnyra-bc__stage--bleed" data-bc-stage="story">'));
});

test("the chosen file sits as a thumbnail with an x in the button row", async () => {
  const source = await readFile(
    new URL("../apps/menyra-social/core/composer/business-composer-controller.js", import.meta.url),
    "utf8"
  );
  assert.ok(source.includes("data-bc-thumb-remove"));
  assert.ok(source.includes("clearDraftMedia()"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__thumb {"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes(".mnyra-bc__thumb-x {"));
  // Das x sitzt auf der oberen Ecke der Miniatur.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  top: -7px;\n  right: -7px;"));
  // Video bekommt sein Standbild ueber denselben Weg wie beim Posten.
  assert.ok(source.includes("captureThumbForVideo(draft, file)"));
  assert.ok(source.includes("draft.file !== file"));
  // Beide Object-URLs eines Entwurfs werden freigegeben - kein Leck.
  assert.ok(source.includes("function releaseDraftUrls(draft)"));
  assert.ok(!source.includes("releasePreviewUrl(draft.previewUrl);\n    draft.file = null;"));
});

test("the product sheet sits flush at the bottom", () => {
  assert.ok(BUSINESS_COMPOSER_CSS.includes("  background: rgba(15, 23, 42, 0.45);\n  padding: 0;"));
  assert.ok(BUSINESS_COMPOSER_CSS.includes("border-radius: 28px 28px 0 0;"));
  // Der Bestaetigen-Knopf haelt Abstand zur Browserleiste des Telefons.
  assert.ok(BUSINESS_COMPOSER_CSS.includes("padding: 10px 16px calc(var(--safe-area-bottom, 0px) + 16px);"));
});

test("product list is shown at once and never doubled", async () => {
  const loaderSource = await readFile(
    new URL("../apps/menyra-social/core/dashboard/dashboard-view-controller.js", import.meta.url),
    "utf8"
  );
  // Gemerkte Liste sofort, frische Liste still hinterher.
  assert.ok(loaderSource.includes("readComposerProductsCache"));
  assert.ok(loaderSource.includes("writeComposerProductsCache"));
  assert.ok(loaderSource.includes("if (!cached) return pending;"));
  assert.ok(loaderSource.includes("pending.then((items) => onFresh(items)).catch(() => {});"));

  // Jede Id genau einmal - egal aus welcher Quelle.
  const doppelt = [
    { id: "m1", name: "Coca Cola" },
    { id: "m1", name: "Coca Cola" },
    { id: "m2", name: "Uje" },
    { id: "", name: "ohne Id" },
    null
  ];
  assert.deepEqual(dedupeComposerProductsCore(doppelt).map((p) => p.id), ["m1", "m2"]);
  assert.deepEqual(dedupeComposerProductsCore(null), []);
  // Der Fingerabdruck erkennt Aenderungen an Name, Preis und Bild.
  const a = [{ id: "m1", name: "Cola", price: 2, imageUrl: "x" }];
  assert.equal(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([{ id: "m1", name: "Cola", price: 2, imageUrl: "x" }]));
  assert.notEqual(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([{ id: "m1", name: "Cola", price: 3, imageUrl: "x" }]));
  assert.notEqual(buildComposerProductsSignatureCore(a), buildComposerProductsSignatureCore([]));
});

test("the preview stage does not cut the card shadow off at its bottom edge", () => {
  // Die Buehne ist genau so hoch wie ihr Inhalt. Schnitte sie ab, endete der
  // weiche Schatten der Kachel unten mit einer harten Kante - genau so sah es
  // in der Profil-Vorschau aus.
  const stageBlock = BUSINESS_COMPOSER_CSS.slice(
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__stage {"),
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__story-track {")
  );
  assert.ok(stageBlock.includes("overflow: visible;"));
  assert.equal(stageBlock.includes("overflow: hidden;"), false);
  // Die randlose Story-Reihe schneidet weiter ab: sie steht absichtlich
  // breiter als die Buehne.
  const bleedBlock = BUSINESS_COMPOSER_CSS.slice(
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__stage--bleed {"),
    BUSINESS_COMPOSER_CSS.indexOf(".mnyra-bc__picker {")
  );
  assert.ok(bleedBlock.includes("overflow: hidden;"));
});
