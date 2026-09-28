// DER LADEN UNTER /lifeskinshop (docs/lifeskin-shop.md) - ein eigener Weg
// mit denselben Funktionen wie /lifeskin: Sets und Einzelmittel direkt
// kaufen, "Gjeni setin" in dieselbe Analyse (Lead), Pixel, Heart-Tab.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

globalThis.__LIFESKIN_TEST__ = true;

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const HTML = lies("apps/lifeskin-shop/index.html");
const SHOP = lies("apps/lifeskin-shop/shop.js");

test("der Weg 'lifeskinshop' ist bekannt und steht in der Sitzung", async () => {
  const { LIFESKIN_WEGE, wegGueltig, WEG_NAMEN } = await import("../shared/lifeskin-weg.js");
  assert.ok(LIFESKIN_WEGE.includes("lifeskinshop"));
  assert.equal(wegGueltig("lifeskinshop"), "lifeskinshop");
  assert.equal(WEG_NAMEN.lifeskinshop, "Lifeskin Shop");
  const { herkunftAuslesen } = await import("../apps/lifeskin/lifeskin-session.js");
  const h = herkunftAuslesen({ search: "" }, "", "", null, { dataset: { lsLanding: "lifeskinshop" } });
  assert.equal(h.weg, "lifeskinshop");
});

test("die Seite: Laden als Einstieg, darunter die Bildschirme der Analyse", () => {
  assert.match(HTML, /<html lang="sq" data-ls-variante="kurz" data-ls-landing="lifeskinshop">/);
  assert.match(HTML, /<script src="\/shared\/lifeskin-still\.js"><\/script>/, "ohne stillen Modus zaehlen eigene Tests");
  assert.equal((HTML.match(/id="ls-start"/g) || []).length, 1, "genau ein Startknopf fuer den Trichter");
  assert.match(HTML, /id="ls-start" data-ls-start data-ls-quelle="shop">Gjeni setin për lëkurën tuaj/);
  for (const id of ["ls-einstieg", "ls-wahl", "ls-vorbereitung", "ls-kamera", "ls-fotopara", "ls-foto", "ls-name", "ls-tel", "ls-fragen", "ls-analyse"]) {
    assert.ok(HTML.includes(`id="${id}"`), `#${id} fehlt`);
  }
  assert.ok(HTML.indexOf('src="/apps/lifeskin/lifeskin-app.js"') > -1);
  assert.ok(HTML.indexOf('src="/apps/lifeskin-shop/shop.js"') > HTML.indexOf('src="/apps/lifeskin/lifeskin-app.js"'));
  // Die Kasse ist eine eigene Ansicht mit Feldern - das Blatt von unten
  // traegt KEIN Feld (festes Fenster + Tastatur = verrutschte Seite).
  const blatt = HTML.slice(HTML.indexOf('<dialog id="sheet"'), HTML.indexOf("</dialog>"));
  assert.doesNotMatch(blatt, /<input/);
  const kasa = HTML.slice(HTML.indexOf('<section class="kasa" id="kasa"'), HTML.indexOf("</section>", HTML.indexOf('id="kasa-faleminderit"')));
  for (const feld of ["kasa-emri", "kasa-telefoni", "kasa-adresa", "kasa-qyteti"]) assert.ok(kasa.includes(`id="${feld}"`));
  assert.doesNotMatch(HTML, /checkout-handoff|\/lifeskin2\?still|href="\/lifeskin2"/, "keine Weiterleitung mehr auf /lifeskin2");
});

test("das Stilblatt des Ladens fasst die Analyse nicht an, die Leiste haengt oben", () => {
  const css = lies("apps/lifeskin-shop/shop.css");
  const selektoren = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@keyframes[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "")
    .split("}").map((r) => r.split("{")[0]).filter((x) => x.trim() && !x.trim().startsWith("@"));
  for (const liste of selektoren) {
    for (const s of liste.split(",")) {
      const t = s.trim().replace(/^@media[^{]*\{/, "").trim();
      if (!t) continue;
      assert.ok(t.startsWith("#ls-einstieg") || t.startsWith("body:has(#ls-einstieg"), `ungebunden: ${t}`);
    }
  }
  const rahmen = lies("apps/lifeskin-shop/shop-rahmen.css");
  assert.match(rahmen, /#ls-einstieg \.sticky \{\s*bottom: auto;\s*top: 100vh;\s*top: 100dvh;\s*transform: translate\(-50%, -100%\);/);
  assert.match(rahmen, /:root\[data-ansicht\] #ls-einstieg > :not\(#kasa\) \{ display: none !important; \}/);
});

test("erreichbar: Vercel, Entwicklungsserver, Service Worker, Build", () => {
  const vercel = JSON.parse(lies("vercel.json"));
  const regeln = [...(vercel.rewrites || []), ...(vercel.routes || [])];
  assert.ok(regeln.some((r) => (r.source || r.src) === "/lifeskinshop" && /lifeskin-shop\/index\.html/.test(r.destination || r.dest)));
  assert.match(lies("scripts/local-dev-server.mjs"), /"\/lifeskinshop"[^\n]*"\/apps\/lifeskin-shop\/index\.html"/);
  const sw = lies("sw.js");
  assert.match(sw, /'\/lifeskinshop',/);
  assert.match(sw, /'\/apps\/lifeskin-shop',/);
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /"apps\/lifeskin-shop",/);
});

test("Korb, Summe, Pflichtfelder und Zeilen der Bestellung", async () => {
  const { korbLesen, korbSchreiben, summe, kasseFehler, bestellZeilen } = await import("../apps/lifeskin-shop/shop.js");
  const speicher = new Map();
  const s = { getItem: (k) => speicher.get(k) ?? null, setItem: (k, v) => speicher.set(k, v) };
  assert.deepEqual(korbLesen(s), { ids: [], set: "" });
  korbSchreiben(s, { ids: ["lf-acne", "lf-moistur", "lf-acne", "<x>"], set: "acne" });
  assert.deepEqual(korbLesen(s), { ids: ["lf-acne", "lf-moistur"], set: "acne" });
  assert.equal(korbLesen({ getItem: () => { throw new Error("gesperrt"); } }).ids.length, 0);
  assert.equal(summe({ ids: [] }), 0);
  assert.equal(summe({ ids: ["a"] }), 29);
  assert.equal(summe({ ids: ["a", "b"] }), 39);
  assert.equal(summe({ ids: ["a", "b", "c"] }), 49);
  assert.match(kasseFehler({ name: "", telefon: "1", strasse: "x", ort: "y" }), /të gjitha fushat/);
  assert.match(kasseFehler({ name: "A", telefon: "12", strasse: "x", ort: "y" }), /numër telefoni/);
  assert.equal(kasseFehler({ name: "A", telefon: "+383 44 000 000", strasse: "x", ort: "y" }), "");
  assert.deepEqual(bestellZeilen({ ids: ["lf-acne"] }, [{ id: "lf-acne", name: "LF ACNE" }]),
    [{ id: "lf-acne", name: "LF ACNE", cmimi: 29, sasia: 1 }]);
});

test("dieselben Pixel- und Heart-Aufrufe wie der Laden auf /lifeskin", () => {
  assert.match(SHOP, /this\.trichterFn\(\)\?\.pixel\?\.meldeKorb\?\.\(summe\(this\.korb\)\);/, "AddToCart fehlt");
  assert.match(SHOP, /this\.trichterFn\(\)\?\.pixel\?\.meldeKasse\?\.\(summe\(this\.korb\)\);/, "InitiateCheckout fehlt");
  assert.match(SHOP, /await sitzung\.schritt\("ordered", \{/, "Purchase (ueber schritt) fehlt");
  assert.match(SHOP, /\.\.\.pixelKennungen\(\)/, "ohne fbc/fbp ordnet Meta den Kauf nicht zu");
  for (const marke of ["produkteGesehen", "imKorb", "korbWert", "kasseGeoeffnet", "adresseBegonnen", "shopKauf"]) {
    assert.ok(SHOP.includes(`${marke}`), `Marke ${marke} fehlt`);
  }
  assert.match(SHOP, /kind: "shop",\s*burimi: "lifeskinshop",/);
  assert.match(SHOP, /ansichtOeffnen\(kasa, "kasa"/);
  // Der Laden der Landingpage startet sich nicht mit.
  assert.match(lies("apps/lifeskin-landing/shop.js"), /!globalThis\.__LIFESKIN_TEST__ && document\.getElementById\("rrjeta"\)\)/);
});

test("die Sets: Standard, Pruefung, Filter-Kennung", async () => {
  const { SETET_STANDARD, setetOderStandard, setetNormalisieren, nevojaKennung, aktiveSetet } = await import("../shared/lifeskin-shop-sets.js");
  assert.equal(setetOderStandard(null).length, SETET_STANDARD.length);
  assert.deepEqual(setetOderStandard(null).map((s) => s.id), ["acne", "pigment", "pore"]);
  assert.deepEqual(setetOderStandard({ lista: [] }), [], "gespeicherte leere Liste bleibt leer");
  const liste = setetNormalisieren([
    { id: "a", titulli: "A", produkte: ["lf-acne", "lf-acne", "lf-moistur"], foto: "https://fremd.example/x.jpg" },
    { id: "b", titulli: "", produkte: ["lf-acne"] },
    { id: "c", titulli: "C", produkte: [] },
    { id: "d", titulli: "D", produkte: ["lf-pore"], aktiv: false }
  ]);
  assert.deepEqual(liste.map((s) => s.id), ["a", "d"], "ohne Name oder Produkt faellt ein Set weg");
  assert.deepEqual(liste[0].produkte, ["lf-acne", "lf-moistur"]);
  assert.equal(liste[0].foto, "", "fremde Adressen fallen weg");
  assert.deepEqual(aktiveSetet(liste).map((s) => s.id), ["a"]);
  assert.equal(nevojaKennung("Njolla & ton"), "njolla-ton");
});

test("Vorher/Nachher: Ort 'Shop', ohne Angabe wie auf der Landing", async () => {
  const { rastiNormalisieren, rasteFuer } = await import("../shared/lifeskin-raste.js");
  assert.equal(rastiNormalisieren({ id: "a", landing: true }).shop, true);
  assert.equal(rastiNormalisieren({ id: "a", landing: false }).shop, false);
  assert.equal(rastiNormalisieren({ id: "a", landing: true, shop: false }).shop, false);
  const liste = [{ id: "a", landing: true }, { id: "b", landing: false, shop: true }].map(rastiNormalisieren);
  assert.deepEqual(rasteFuer(liste, "shop").map((r) => r.id), ["a", "b"]);
});

test("Heart: Tab 'Lifeskin Shop' mit eigenem Trichter, Umsatz und Sets", async () => {
  const { baueShopWeg } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const w = baueShopWeg([
    { step: "opened" },
    { step: "opened", produkteGesehen: true, imKorb: true, korbWert: 39 },
    { step: "ordered", shopKauf: true, hatBestellt: true, phone: "1", kasseGeoeffnet: true, adresseBegonnen: true, imKorb: true, korbWert: 39, order: { kind: "shop", total: 39, set: { titulli: "Seti për njollat" } } },
    { step: "numri", phone: "2", typ: "foto" }
  ]);
  assert.deepEqual(w.stufen.map((s) => s.anzahl), [4, 2, 2, 1, 1, 1]);
  assert.deepEqual(w.analyse.map((s) => s.anzahl), [1, 1, 0], "ein Kauf mit Nummer an der Kasse ist kein Analyse-Lead");
  assert.equal(w.umsatz, 39);
  assert.deepEqual(w.nachSet, [["Seti për njollat", 1]]);

  const { renderShopSetet, renderShopSetEditor } = await import("../apps/mnyra-heart/heart-lifeskin-shopsets.js");
  const produkte = [{ id: "lf-acne", name: "LF ACNE" }, { id: "lf-moistur", name: "LF MOISTUR" }];
  const karte = renderShopSetet({ shopSetet: null }, produkte);
  assert.equal((karte.match(/data-action="lifeskin-shopset"/g) || []).length, 3);
  assert.match(karte, /Mit der ersten Änderung werden sie hier gespeichert/);
  const editor = renderShopSetEditor({ shopSetOffen: "acne", shopSetet: null }, produkte);
  assert.match(editor, /value="lf-acne" checked/);
  assert.match(editor, /data-action="lifeskin-shopset-foto"/);
  assert.match(editor, /data-shopsetfeld="titulli"[^>]*value="Seti kundër akneve"/);

  const nav = lies("apps/mnyra-heart/heart-render.js");
  assert.match(nav, /LIFESKINSHOP_NAV = Object\.freeze\(\{ key: "lifeskinshop", label: "Lifeskin Shop" \}\)/);
  const { resolveHeartRouteView } = await import("../apps/mnyra-heart/heart-route-view-resolver.js");
  assert.equal(resolveHeartRouteView({ search: "", hash: "#lifeskinshop", pathname: "/heart" }), "lifeskin");
  const heart = lies("apps/mnyra-heart/heart.js");
  assert.match(heart, /#lifeskinshop/);
  assert.match(heart, /shop: e\.shop \?\? alt\?\.shop \?\? true,/, "der Ort Shop ginge beim Speichern eines Falls verloren");
  const events = lies("apps/mnyra-heart/heart-events.js");
  for (const a of ["lifeskin-shopset", "lifeskin-shopset-neu", "lifeskin-shopset-speichern", "lifeskin-shopset-foto", "lifeskin-shopset-aktiv", "lifeskin-shopset-schieben", "lifeskin-shopset-loeschen"]) {
    assert.ok(events.includes(`"${a}"`), `${a} fehlt`);
  }
});

test("Heart: die Tabs trennen die Faelle - der Shop steht nicht im alten Tab", async () => {
  const { nachWeg } = await import("../apps/mnyra-heart/heart-lifeskin-weg.js");
  const { mitWegFaellen } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const sitzungen = [{ id: "a", source: {} }, { id: "b", source: { weg: "lifeskin2" } }, { id: "c", source: { weg: "lifeskinshop" } }];
  assert.deepEqual(nachWeg(sitzungen, "").map((s) => s.id), ["a"]);
  assert.deepEqual(nachWeg(sitzungen, "lifeskinshop").map((s) => s.id), ["c"]);
  const zustand = { sitzungen, ndjekja: { faelle: [{ kennung: "a" }, { kennung: "b" }, { kennung: "c" }, { kennung: "ohne" }] } };
  assert.deepEqual(mitWegFaellen(zustand, "lifeskinshop").ndjekja.faelle.map((f) => f.kennung), ["c"]);
  assert.deepEqual(mitWegFaellen(zustand, "").ndjekja.faelle.map((f) => f.kennung), ["a", "ohne"]);
});

test("vorerst nur das Akne-Set im Shop; die anderen schaltet Heart ein", async () => {
  const { setetOderStandard, aktiveSetet } = await import("../shared/lifeskin-shop-sets.js");
  assert.deepEqual(aktiveSetet(setetOderStandard(null)).map((s) => s.id), ["acne"]);
  assert.equal((HTML.match(/class="set-card"/g) || []).length, 1, "der Aufbau zeigt nur das Akne-Set");
  assert.doesNotMatch(HTML + SHOP, /thellesi/, "'Seti në detaje' ist auf Wunsch weg");
});

test("einzeln nur die Mittel der Sets im Shop - vorerst LF ACNE und LF MOISTUR", async () => {
  const { einzelAusSets } = await import("../apps/lifeskin-shop/shop.js");
  const { setetOderStandard, aktiveSetet } = await import("../shared/lifeskin-shop-sets.js");
  const mittel = ["lf-acne", "lf-moistur", "lf-pigment", "lf-pore"].map((id) => ({ id }));
  assert.deepEqual(einzelAusSets(mittel, aktiveSetet(setetOderStandard(null))).map((m) => m.id), ["lf-acne", "lf-moistur"]);
  assert.deepEqual(einzelAusSets(mittel, setetOderStandard(null)).map((m) => m.id), ["lf-acne", "lf-moistur", "lf-pigment", "lf-pore"]);
  assert.equal(einzelAusSets(mittel, []).length, 4, "ohne Sets alle Mittel");
});

test("Titelbild: in Heart zuschneiden (7:5), der Shop nimmt es aus config/shopHero", async () => {
  const { ausschnitt } = await import("../apps/mnyra-heart/heart-lifeskin-schnitt.js");
  // 1000 x 1000 in einem Rahmen 350 x 250: deckt bei 0,35, mittig.
  const mitte = ausschnitt({ w: 1000, h: 1000, rw: 350, rh: 250, zoom: 1, dx: 0, dy: -50 });
  assert.equal(Math.round(mitte.sw), 1000);
  assert.equal(Math.round(mitte.sh), 714);
  assert.equal(Math.round(mitte.sy), 143);
  const nah = ausschnitt({ w: 1000, h: 1000, rw: 350, rh: 250, zoom: 2, dx: -350, dy: -350 });
  assert.equal(Math.round(nah.sw), 500);
  assert.equal(Math.round(nah.sx), 500);

  const { renderShopHero, renderShopHeroEditor } = await import("../apps/mnyra-heart/heart-lifeskin-shopsets.js");
  assert.match(renderShopHero({}), /lf-acne-2\.jpg/);
  assert.match(renderShopHero({}), /data-action="lifeskin-shophero-waehlen"/);
  assert.doesNotMatch(renderShopHero({}), /lifeskin-shophero-weg/);
  assert.match(renderShopHero({ shopHero: "data:image/jpeg;base64,AA" }), /data-action="lifeskin-shophero-weg"/);
  const editor = renderShopHeroEditor({ shopHeroRoh: "data:image/jpeg;base64,AA" });
  assert.match(editor, /data-schnitt-rahmen[^>]*aspect-ratio:1\.4/);
  assert.match(editor, /data-schnitt-zoom/);
  assert.match(editor, /data-action="lifeskin-shophero-speichern"/);
  const events = lies("apps/mnyra-heart/heart-events.js");
  for (const a of ["lifeskin-shophero-waehlen", "lifeskin-shophero-zu", "lifeskin-shophero-speichern", "lifeskin-shophero-weg"]) {
    assert.ok(events.includes(`"${a}"`), `${a} fehlt`);
  }

  // Der Shop tauscht das Bild und gibt dem Rahmen das Verhaeltnis.
  const { Dyqan } = await import("../apps/lifeskin-shop/shop.js");
  const img = { src: "/apps/lifeskin-shop/assets/lf-acne-2.jpg" };
  const attr = {};
  const rahmen = { querySelector: () => img, setAttribute: (k, v) => { attr[k] = v; } };
  const dokument = { querySelector: (w) => (w.includes("hero-photo") ? rahmen : null), defaultView: {} };
  const foto = "data:image/jpeg;base64,AA";
  const holen = async (url) => (url.endsWith("/shopHero")
    ? { ok: true, status: 200, json: async () => ({ fields: { foto: { stringValue: foto } } }) }
    : { ok: false, status: 404 });
  await new Dyqan({ dokument, speicher: null, holen }).titelbild();
  assert.equal(img.src, foto);
  assert.ok("data-eigen" in attr);
  const leer = { src: "alt" };
  const rahmen2 = { querySelector: () => leer, setAttribute: () => { throw new Error("nicht setzen"); } };
  await new Dyqan({ dokument: { querySelector: () => rahmen2, defaultView: {} }, speicher: null, holen: async () => ({ ok: false, status: 404 }) }).titelbild();
  assert.equal(leer.src, "alt", "ohne eigenes Bild bleibt das Standardbild");
  assert.match(lies("apps/lifeskin-shop/shop-rahmen.css"), /\.hero-photo\[data-eigen\] \{ height: auto; aspect-ratio: 7 \/ 5; \}/);
});
