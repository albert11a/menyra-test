// LIFESKIN 2 (/lifeskin2) - derselbe Trichter, ein anderes Versprechen.
//
// Diese Pruefungen halten die Stellen zusammen, an denen der Weg erkannt
// und weitergesagt wird: Landingpage -> Sitzung -> Warteseite ->
// Heart (Bericht, Tab, Trichter) -> Therapieseite. Siehe docs/lifeskin-2.md.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { LIFESKIN_WEGE, wegGueltig, wegAusSuche, wegDerSitzung } from "../shared/lifeskin-weg.js";
import { herkunftAuslesen, wegAuslesen, Sitzung } from "../apps/lifeskin/lifeskin-session.js";
import { FRAGEN_NACH_AUFNAHME, OBERFLAECHE, OBERFLAECHE_WEGE, frageFuerWeg, t } from "../apps/lifeskin/lifeskin-content.js";
import { TEXTE, TEXTE_WEGE } from "../apps/lifeskin-astra/astra-texte.js";
import { nachWeg, baueLs2Weg, antwortMinuten, dauerText, LS2_STUFEN } from "../apps/mnyra-heart/heart-lifeskin-weg.js";
import { resolveHeartRouteView } from "../apps/mnyra-heart/heart-route-view-resolver.js";

const lies = (p) => readFileSync(p, "utf8");
const LP2 = lies("apps/lifeskin-2/index.html");
const LP1 = lies("apps/lifeskin-landing/index.html");
const APP = lies("apps/lifeskin/lifeskin-app.js");

// Sichtbarer Text der Seite: ohne Kommentare, Skripte und Tags.
function sichtbar(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "").replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

test("die Landingpage traegt den Weg am Wurzelelement und dieselbe Technik wie /lifeskin", () => {
  assert.match(LP2, /<html lang="sq" data-ls-variante="kurz" data-ls-landing="lifeskin2">/);
  // Dieselben Bildschirme des Trichters - nur die Texte sind neu.
  for (const id of ["ls-einstieg", "ls-wahl", "ls-fotopara", "ls-foto", "ls-vorbereitung", "ls-kamera",
    "ls-name", "ls-anliegen", "ls-tel", "ls-fragen", "ls-analyse", "ls-start"]) {
    assert.ok(LP2.includes(`id="${id}"`), `#${id} fehlt auf /lifeskin2`);
    assert.ok(LP1.includes(`id="${id}"`));
  }
  for (const skript of ["/apps/lifeskin/lifeskin-app.js", "/apps/lifeskin-landing/landing.js",
    "/apps/lifeskin-landing/shop.js", "/apps/lifeskin-landing/raste.js"]) {
    assert.ok(LP2.includes(`src="${skript}"`), `${skript} fehlt`);
  }
  assert.match(LP2, /href="\/apps\/lifeskin-2\/lifeskin-2\.css"/);
  assert.match(LP2, /<link rel="canonical" href="https:\/\/www\.mnyra\.com\/lifeskin2" \/>/);
});

test("das Merkmal heisst data-ls-landing - data-ls-weg am <html> machte jeden Tipp zur Wegwahl", () => {
  const wurzel = LP2.match(/<html[^>]*>/)[0];
  assert.doesNotMatch(wurzel, /data-ls-weg/);
  // Jedes [data-ls-weg] ist eine Karte, die einen Weg waehlt.
  assert.match(APP, /for \(const karte of \$\$\("\[data-ls-weg\]"\)\)/);
  assert.match(APP, /this\.#wegWaehlen\(karte\.dataset\.lsWeg\)/);
});

test("das Versprechen: Therapie mit Preis oben, 'Shiko nëse më përshtatet', 'falas' nur klein", () => {
  const text = sichtbar(LP2);
  assert.match(text, /Terapi kundër akneve, e zgjedhur për lëkurën tuaj\./);
  assert.match(text, /Dr\. Gashi kontrollon nëse terapia LifeSkin ju përshtatet/);
  // Die drei Knoepfe (oben, unten, Leiste) sagen dasselbe Wort.
  assert.equal((LP2.match(/<span class="knopf__text">Shiko nëse më përshtatet<\/span>/g) || []).length, 3);
  assert.doesNotMatch(text, /Zbuloni rutinën tuaj/);
  assert.doesNotMatch(text, /Analiza falas/);
  // Preis, Tuer und Garantie im ersten Bildschirm - vor den Faellen.
  const held = LP2.slice(LP2.indexOf('<section class="held"'), LP2.indexOf('<div class="blick"'));
  assert.match(held, /<ul class="ls2-fakte"/);
  assert.match(held, /nga 39 €/);
  assert.match(held, /Paguani te dera/);
  assert.match(held, /45 ditë garanci/);
  // Ehrlich: Passt es nicht, wird nichts geschickt.
  assert.match(text, /nuk ju dërgojmë asgjë/);
});

test("/lifeskin2 ist erreichbar: Vercel, Entwicklungsserver, Service Worker, Build", () => {
  const vercel = JSON.parse(lies("vercel.json"));
  const regeln = [...(vercel.rewrites || []), ...(vercel.routes || [])];
  for (const quelle of ["/lifeskin2", "/lifeskin2/"]) {
    const regel = regeln.find((r) => r.source === quelle);
    assert.equal(regel?.destination, "/apps/lifeskin-2/index.html", quelle);
  }
  assert.match(lies("scripts/local-dev-server.mjs"), /path === "\/lifeskin2"[^\n]*"\/apps\/lifeskin-2\/index\.html"/);
  const sw = lies("sw.js");
  assert.match(sw, /'\/lifeskin2',/);
  assert.match(sw, /'\/apps\/lifeskin-2',/);
  assert.match(lies("scripts/build-vercel-static-output.mjs"), /"apps\/lifeskin-2",/);
});

test("der Weg: nur bekannte Namen, sonst der bisherige", () => {
  // Dazu der Laden (/lifeskinshop) - docs/lifeskin-shop.md.
  assert.deepEqual([...LIFESKIN_WEGE], ["lifeskin2", "lifeskinshop"]);
  assert.equal(wegGueltig("lifeskin2"), "lifeskin2");
  assert.equal(wegGueltig("lifeskin3"), "");
  assert.equal(wegGueltig(undefined), "");
  assert.equal(wegAusSuche("?weg=lifeskin2&still=1"), "lifeskin2");
  assert.equal(wegAusSuche("?weg=<x>"), "");
  assert.equal(wegDerSitzung({ source: { weg: "lifeskin2" } }), "lifeskin2");
  assert.equal(wegDerSitzung({ source: {} }), "");
  // Der Trichter liest ihn ohne Import (Sandbox-Tests) - dieselbe Liste.
  assert.match(APP, /export function wegLesen\(wurzel\) \{\n\s+return wurzel\?\.dataset\?\.lsLanding === "lifeskin2" \? "lifeskin2" : "";/);
});

test("die Sitzung merkt sich den Weg in source und die Warteseite bekommt ihn in der Adresse", () => {
  const mit = herkunftAuslesen({ search: "?utm_campaign=ls2" }, "", "", null, { dataset: { lsLanding: "lifeskin2" } });
  assert.equal(mit.weg, "lifeskin2");
  assert.equal(mit.utmCampaign, "ls2");
  const ohne = herkunftAuslesen({ search: "" }, "", "", null, { dataset: {} });
  assert.ok(!("weg" in ohne), "ohne Weg kein Feld - alte Sitzungen bleiben, wie sie sind");
  assert.equal(wegAuslesen({ dataset: { lsLanding: "anders" } }), "");

  const pfad = Object.getOwnPropertyDescriptor(Sitzung.prototype, "berichtPfad").get;
  assert.equal(pfad.call({ id: "abc", stand: { source: { weg: "lifeskin2" } } }), "/analiza/abc?weg=lifeskin2");
  assert.equal(pfad.call({ id: "abc", stand: { source: {} } }), "/analiza/abc");
});

test("Frage 4 spricht die Worte von LifeSkin 2 - die Kennungen bleiben", () => {
  const frage = FRAGEN_NACH_AUFNAHME.find((f) => f.id === "gatishmeria");
  const neu = frageFuerWeg(frage, "lifeskin2");
  assert.equal(t(neu.titel, "sq"), "Nëse ju përshtatet, a doni ta filloni terapinë 4-javore?");
  assert.deepEqual(neu.antworten.map((a) => a.id), frage.antworten.map((a) => a.id));
  assert.equal(t(neu.antworten.find((a) => a.id === "analiza").text, "sq"), "Së pari dua të di nëse më përshtatet");
  assert.equal(frageFuerWeg(frage, ""), frage);
  assert.equal(frageFuerWeg(FRAGEN_NACH_AUFNAHME[0], "lifeskin2"), FRAGEN_NACH_AUFNAHME[0]);
  // Der Knopf auf dem Nummernschirm verspricht die Antwort, nicht die Analyse.
  assert.match(t(OBERFLAECHE_WEGE.lifeskin2.telKnopf, "sq"), /përgjigjen/);
  for (const k of Object.keys(OBERFLAECHE_WEGE.lifeskin2)) assert.ok(OBERFLAECHE[k], `${k} gibt es in OBERFLAECHE nicht`);
});

test("die Warteseite spricht von der Pruefung - und nur ueber Schluessel, die es gibt", () => {
  for (const k of Object.keys(TEXTE_WEGE.lifeskin2)) assert.ok(TEXTE[k], `${k} gibt es in TEXTE nicht`);
  assert.match(t(TEXTE_WEGE.lifeskin2.pritTitel, "sq"), /kontrollon nëse terapia ju përshtatet/);
  const astra = lies("apps/lifeskin-astra/astra.js");
  assert.match(astra, /get weg\(\) \{ return wegAusSuche\(this\.ort\?\.search\) \|\| wegGueltig\(this\.daten\?\.weg\); \}/);
  assert.match(astra, /TEXTE_WEGE\[this\.weg\]\?\.\[schluessel\]/);
});

test("die Therapieseite beginnt bei LifeSkin 2 mit dem Urteil und 'Rezervo setin tim'", async () => {
  const html = lies("apps/lifeskin-verkauf/terapia.html");
  assert.ok(html.indexOf('id="t-urteil"') > html.indexOf('id="t-syri"'));
  assert.ok(html.indexOf('id="t-urteil"') < html.indexOf('id="t-titulli"'));
  globalThis.__LIFESKIN_TEST__ = true;
  const { Terapia } = await import("../apps/lifeskin-verkauf/terapia.js");
  const seite = new Terapia({ ort: { pathname: "/terapia/abc", search: "" }, pixel: {} });
  seite.daten = { weg: "lifeskin2", preis: 39 };
  seite.produkte = [{ id: "a" }];
  assert.equal(seite.mitUrteil, true);
  assert.equal(seite.kaufWort(), "Rezervo setin tim — 39 €");
  seite.produkte = [];
  assert.equal(seite.mitUrteil, false, "ohne Produkte kein 'Po'");
  seite.daten = { preis: 39 };
  seite.produkte = [{ id: "a" }];
  assert.equal(seite.kaufWort(), "Fillo terapinë — 39 €", "der bisherige Weg bleibt, wie er war");
  const perAdresse = new Terapia({ ort: { pathname: "/terapia/abc", search: "?weg=lifeskin2" }, pixel: {} });
  perAdresse.daten = { preis: 39 };
  perAdresse.produkte = [{ id: "a" }];
  assert.equal(perAdresse.mitUrteil, true);
});

test("Heart schreibt den Weg beim Freigeben in den Bericht", () => {
  const adapter = lies("apps/mnyra-heart/heart-lifeskin-adapter.js");
  assert.match(adapter, /antworten = null, weg = "" \}\) \{/);
  assert.match(adapter, /weg: wegGueltig\(weg\),/);
  assert.match(lies("apps/mnyra-heart/heart.js"), /weg: wegDerSitzung\(findeSitzung\(store\.getState\(\)\.lifeskin \|\| \{\}, id\)\),/);
});

test("Heart: #lifeskin2 oeffnet die Lifeskin-Ansicht, die Faelle trennen sich nach Weg", () => {
  assert.equal(resolveHeartRouteView({ search: "", hash: "#lifeskin2", pathname: "/heart" }), "lifeskin");
  const sitzungen = [
    { id: "a", source: {} },
    { id: "b", source: { weg: "lifeskin2" } },
    { id: "c" },
    { id: "d", source: { weg: "unbekannt" } }
  ];
  assert.deepEqual(nachWeg(sitzungen, "").map((s) => s.id), ["a", "c", "d"]);
  assert.deepEqual(nachWeg(sitzungen, "lifeskin2").map((s) => s.id), ["b"]);
});

test("der Trichter von LifeSkin 2: vom Klick bis zum Kauf, mit der Zeit bis zur Antwort", () => {
  const s = (id, step, extra = {}) => ({ id, step, gesehen: true, source: { weg: "lifeskin2" }, ...extra });
  const sitzungen = [
    s("1", "opened"),
    s("2", "wahl"),
    s("3", "emri"),
    s("4", "result", { warteseiteGeoeffnet: true, phone: "+38344" }),
    s("5", "result", { warteseiteGeoeffnet: true, phone: "+38344", berichtGeoeffnet: true }),
    s("6", "ordered", { warteseiteGeoeffnet: true, phone: "+38344", berichtGeoeffnet: true, kasseGeoeffnet: true, hatBestellt: true })
  ];
  const berichte = {
    4: { status: "wartet", createdAt: "2026-09-27T10:00:00Z" },
    5: { status: "fertig", createdAt: "2026-09-27T10:00:00Z", freigabeAt: "2026-09-27T10:40:00Z" },
    6: { status: "bestellt", createdAt: "2026-09-27T09:00:00Z", freigabeAt: "2026-09-27T11:00:00Z" }
  };
  const weg = baueLs2Weg(sitzungen, berichte);
  const zahl = Object.fromEntries(weg.stufen.map((x) => [x.id, x.anzahl]));
  assert.deepEqual(zahl, { landing: 6, start: 5, fragen: 4, nummer: 3, abgabe: 3, antwort: 2, gesehen: 2, kasse: 1, bestellt: 1 });
  assert.deepEqual(weg.stufen.map((x) => x.id), LS2_STUFEN.map((x) => x.id));
  // Jede Stufe hoechstens so gross wie die davor.
  weg.stufen.forEach((x, i) => { if (i) assert.ok(x.anzahl <= weg.stufen[i - 1].anzahl); });
  assert.equal(weg.wartend, 1);
  assert.equal(weg.beantwortet, 2);
  assert.equal(weg.antwortUnterStunde, 1);
  assert.equal(weg.antwortMedian, 80);
  assert.equal(weg.kaufProLead, 1 / 3);
  assert.equal(antwortMinuten({ createdAt: "x" }), null);
  assert.equal(dauerText(45), "45 min");
  assert.equal(dauerText(125), "2 h 5 min");
  assert.equal(dauerText(1500), "1 T 1 h");
});

test("Heart Lifeskin 2: 'Seiten ohne Stats' fuehren auf /lifeskin2 und nehmen nur Faelle dieses Wegs", async () => {
  const { baueStillLinks, mitWegFaellen } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const zustand = {
    sitzungen: [
      { id: "alt", createdAt: "2026-09-27T12:00:00Z", source: {} },
      { id: "neu", createdAt: "2026-09-27T10:00:00Z", source: { weg: "lifeskin2" } }
    ],
    tests: [{ id: "t-alt", createdAt: "2026-09-27T13:00:00Z", source: {} }],
    berichte: { alt: { status: "wartet" }, neu: { status: "wartet" }, "t-alt": { status: "wartet" } },
    ndjekja: { an: true, faelle: [{ kennung: "alt" }, { kennung: "neu" }, { kennung: "ohne-sitzung" }] }
  };
  const ls2 = mitWegFaellen(zustand, "lifeskin2");
  assert.deepEqual(ls2.sitzungen.map((s) => s.id), ["neu"]);
  assert.deepEqual(ls2.tests, []);
  assert.deepEqual(ls2.ndjekja.faelle.map((f) => f.kennung), ["neu"]);
  const alt = mitWegFaellen(zustand, "");
  assert.deepEqual(alt.ndjekja.faelle.map((f) => f.kennung), ["alt", "ohne-sitzung"]);

  const links = baueStillLinks(ls2);
  assert.equal(links.master, "https://www.mnyra.com/lifeskin2?still=1");
  assert.equal(links.aus, "https://www.mnyra.com/lifeskin2?still=0");
  const alle = links.gruppen.flatMap((g) => g.seiten.map((x) => x.url)).filter(Boolean);
  for (const url of alle) assert.doesNotMatch(url, /mnyra\.com\/lifeskin\?/, `${url} fuehrt auf den alten Weg`);
  const warte = links.gruppen.at(-1).seiten.find((x) => x.label === "Warteseite");
  assert.equal(warte.url, "https://www.mnyra.com/analiza/neu?still=1&weg=lifeskin2", "der Fall aus Lifeskin 2, nicht der neueste alte");
  // Der alte Tab bleibt, wie er war.
  assert.equal(baueStillLinks(alt).master, "https://www.mnyra.com/lifeskin?still=1");
  assert.equal(baueStillLinks(alt).gruppen.at(-1).seiten[0].url, "https://www.mnyra.com/analiza/t-alt?still=1");
});

test("Heart Lifeskin 2: WhatsApp-Vorlagen sprechen von der Pruefung, nicht von der Analyse", async () => {
  const { vorabNachricht, nachfassNachricht, whatsappNachricht } = await import("../apps/mnyra-heart/heart-lifeskin-render.js");
  const ls2 = { id: "x", name: "Arta", source: { weg: "lifeskin2" } };
  const alt = { id: "x", name: "Arta", source: {} };
  assert.match(vorabNachricht(ls2), /kontrolloj personalisht nëse terapia LifeSkin i përshtatet/);
  assert.doesNotMatch(vorabNachricht(ls2), /analiz/i);
  assert.match(vorabNachricht(alt), /Analiza është falas/);
  const bericht = { produkte: [{ id: "a" }], raport: { shitja: { whatsapp: "Teksti." } } };
  assert.match(nachfassNachricht(ls2, bericht, "ungesehen"), /terapia LifeSkin ju përshtatet ✓/);
  assert.match(nachfassNachricht(alt, bericht, "ungesehen"), /Analiza e lëkurës suaj është gati/);
  assert.match(whatsappNachricht(ls2, bericht), /terapia LifeSkin ju përshtatet ✓/);
  assert.match(whatsappNachricht(alt, bericht), /analiza juaj është gati/);
});
