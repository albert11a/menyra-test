// DER CHAT (docs/lifeskin-chat.md, 07.10.) - Bausteine, Heart-Darstellung,
// Push-Meldung und Einbau im Laden. Die Firestore-Regeln prueft
// tests/rules/lifeskin-chat.test.mjs gegen den Emulator.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  zugangGueltig, neuerZugang, nachrichtKennung, chatAnlegen, kundenText, kundenBild, kundenAntwort,
  teamText, teamProdukte, teamFormular, vorschauVon, sortiereNachrichten, ungelesen, chatUngelesen,
  chatStatus, tipptGerade, zeitMs, nachrichtMs, bildGueltig, CHAT_TEXT_MAX
} from "../shared/lifeskin-chat.js";
import {
  renderListe, renderNachrichten, renderEntwurf, renderKunde, chatName, entwurfAktiv, preisVorschlag, esc
} from "../apps/mnyra-heart/heart-chat-render.js";
import { meldungsText, meldungsKennungChat } from "../api/lifeskin-chat.js";

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("Zugang und Kennungen: unratbar, sortierbar, im erlaubten Format", () => {
  const z = neuerZugang();
  assert.ok(zugangGueltig(z) && z.length === 32);
  assert.notEqual(z, neuerZugang());
  assert.equal(zugangGueltig("abc"), false);
  const a = nachrichtKennung(1000), b = nachrichtKennung(2000);
  assert.match(a, /^[a-z0-9]{8,40}$/);
  assert.ok(a < b, "spaeter = groesser");
});

test("Nachrichten des Kunden: nur Text, Foto, Formular-Antwort - leer und zu lang nicht", () => {
  assert.equal(kundenText("   "), null);
  assert.equal(kundenText("a".repeat(5000)).text.length, CHAT_TEXT_MAX);
  assert.equal(kundenText(" Hallo ").text, "Hallo");
  assert.equal(kundenBild("javascript:alert(1)"), null);
  assert.equal(bildGueltig("data:image/jpeg;base64,AAAA"), true);
  assert.equal(bildGueltig("data:text/html;base64,AAAA"), false);
  const antwort = kundenAntwort("0abcdefgh", { emri: " Arta ", telefoni: "044", boese: "x" });
  assert.deepEqual(antwort.antwort.werte, { emri: "Arta", telefoni: "044" });
  assert.equal(kundenAntwort("BÖSE", { emri: "x" }), null);
});

test("Produktkarte: 1-5 gueltige Produkte, ein Preis, Fotos nur als Adresse", () => {
  const p = (id) => ({ id, name: id.toUpperCase(), preis: 29, foto: "data:image/jpeg;base64,GROSS" });
  const karte = teamProdukte([p("lf-acne"), p("lf-moistur"), p("x"), p("y"), p("z"), p("zu-viel")], 19, { text: "Oferta" });
  assert.equal(karte.produkte.length, 5);
  assert.equal(karte.summe, 19);
  assert.ok(karte.produkte.every((x) => !("foto" in x)), "data:-Fotos sprengen das Dokument");
  assert.equal(teamProdukte([], 10), null);
  assert.equal(teamProdukte([{ id: "a", name: "A", preis: 10 }, { id: "b", name: "B", preis: 5 }]).summe, 15);
  assert.deepEqual(teamFormular(["emri", "emri", "boese", "telefoni"]).formular.felder, ["emri", "telefoni"]);
  assert.equal(teamFormular([]), null);
});

test("Serverzeit vor Telefonuhr: Reihenfolge, ungelesen, gelesen", () => {
  const n = (id, von, atMs, t) => ({ id, von, at: { seconds: atMs / 1000, nanoseconds: 0 }, t });
  // Die Uhr des Kunden geht eine Stunde vor - die Serverzeit gewinnt.
  const liste = sortiereNachrichten([
    n("b", "team", 2000, "2026-10-07T09:00:00Z"),
    n("a", "kunde", 1000, "2026-10-07T10:00:00Z")
  ]);
  assert.deepEqual(liste.map((x) => x.id), ["a", "b"]);
  assert.equal(zeitMs({ toMillis: () => 5 }), 5);
  assert.equal(nachrichtMs({ t: "2026-10-07T10:00:00Z" }), Date.parse("2026-10-07T10:00:00Z"));
  assert.equal(ungelesen(liste, { seconds: 1.5 }, "team"), 1);
  assert.equal(ungelesen(liste, { seconds: 3 }, "team"), 0);
  const chat = { letzte: { von: "kunde", at: { seconds: 10 } }, teamGelesenAt: { seconds: 5 } };
  assert.equal(chatUngelesen(chat), true);
  assert.equal(chatUngelesen({ ...chat, teamGelesenAt: { seconds: 10 } }), false);
});

test("Status: bestellt (auch aus der Sitzung), erledigt springt bei neuer Nachricht auf offen", () => {
  const chat = { createdAt: "2026-10-07T10:00:00Z", status: "offen" };
  assert.equal(chatStatus(chat), "offen");
  assert.equal(chatStatus(chat, { order: { createdAt: "2026-10-07T10:05:00Z" } }), "bestellt");
  assert.equal(chatStatus(chat, { order: { createdAt: "2026-10-06T10:05:00Z" } }), "offen", "alte Bestellung zaehlt nicht");
  const erledigt = { ...chat, status: "erledigt", letzte: { von: "kunde", at: { seconds: 20 } }, teamGelesenAt: { seconds: 10 } };
  assert.equal(chatStatus(erledigt), "offen");
  assert.equal(chatStatus({ ...erledigt, teamGelesenAt: { seconds: 30 } }), "erledigt");
});

test("'schreibt ...' verschwindet, sobald die Nachricht da ist", () => {
  const jetzt = Date.now();
  const getippt = new Date(jetzt - 1000).toISOString();
  assert.equal(tipptGerade(getippt, jetzt), true);
  assert.equal(tipptGerade(getippt, jetzt + 10000), false, "alt");
  assert.equal(tipptGerade(getippt, jetzt, 6000, jetzt - 500), false, "Nachricht kam danach");
  assert.equal(tipptGerade("", jetzt), false);
});

test("Heart: Liste mit Chips und Entwurf, nie HTML aus dem Chat", () => {
  const jetzt = Date.now();
  const chats = [
    { id: "a".repeat(32), code: "LS-1", status: "offen", letzte: { von: "kunde", text: "<img src=x onerror=alert(1)>", at: { seconds: jetzt / 1000 } } },
    { id: "b".repeat(32), code: "LS-2", status: "erledigt", letzte: { von: "team", text: "ok", at: { seconds: jetzt / 1000 } }, teamGelesenAt: { seconds: jetzt / 1000 } },
    { id: "c".repeat(32), code: "LS-3", status: "offen", entwurf: { text: "dua të", t: new Date(jetzt).toISOString() } }
  ];
  const { html, ungelesen: zahl } = renderListe({ chats, chip: "offen", jetzt });
  assert.equal(zahl, 1);
  assert.ok(!html.includes("<img src=x"), "HTML aus dem Chat");
  assert.ok(html.includes("&lt;img"));
  assert.match(html, /schreibt: dua të/);
  assert.match(html, /Offen<span>2<\/span>/);
  assert.match(html, /Erledigt<span>1<\/span>/);
  assert.equal(entwurfAktiv(chats[2], jetzt), true);
  assert.equal(entwurfAktiv(chats[2], jetzt + 120000), false);
  assert.match(renderEntwurf(chats[2], jetzt), /schreibt gerade/);
  assert.equal(esc(`"'<>&`), "&quot;&#39;&lt;&gt;&amp;");
});

test("Heart: Unterhaltung zeigt Produkte, Formular und Antwort lesbar", () => {
  const nachrichten = [
    { id: "1", von: "kunde", art: "text", text: "Hallo", at: { seconds: 1 } },
    { id: "2", von: "team", art: "produkte", produkte: [{ id: "lf-acne", name: "LF ACNE", preis: 29 }], summe: 19, at: { seconds: 2 } },
    { id: "3", von: "team", art: "formular", formular: { felder: ["emri", "telefoni"] }, at: { seconds: 3 } },
    { id: "4", von: "kunde", art: "antwort", antwort: { antwortAuf: "3", werte: { emri: "Arta" } }, at: { seconds: 4 } }
  ];
  const html = renderNachrichten({ nachrichten, chat: {} });
  assert.match(html, /19 €/);
  assert.match(html, /Name, Telefon/);
  assert.match(html, /✓ ausgefüllt/);
  assert.match(html, /Arta/);
  assert.equal(chatName({ code: "LS-9" }, null, "Arta"), "Arta");
  assert.equal(chatName({ code: "LS-9" }, { address: { name: "Besa" } }), "Besa");
});

test("Heart: Der Kunde - Herkunft, Anzeige, Kasse, Bestellung, Klickpfad", () => {
  const sitzung = {
    id: "s1", code: "LS-1", createdAt: "2026-10-07T10:00:00Z", source: { utmSource: "ig", utmCampaign: "Acne Duo", utmContent: "Video 3" },
    device: { os: "ios", app: "instagram" }, imKorb: true, korbWert: 19, hatBestellt: true, order: { total: 19, orderId: "LS-1", chat: { nachricht: "x" } }
  };
  const html = renderKunde({ sitzung, herkunft: { label: "Anzeige", detail: "Instagram · Acne Duo · Video 3" },
    kasse: { geschrieben: { name: "Arta", telefon: "044", strasse: "", ort: "" }, versuche: [{ ergebnis: "ok" }] },
    pfad: [{ t: "2026-10-07T10:01:00Z", e: "klick", d: "Porosit" }] });
  for (const teil of ["Anzeige", "Acne Duo", "Video 3", "ios · instagram", "19 € · LS-1 · aus dem Chat", "Arta · 044", "Porosit", 'data-fall="s1"']) {
    assert.ok(html.includes(teil), teil);
  }
  assert.match(renderKunde({ chat: { code: "LS-2" } }), /Keine Sitzung gefunden \(LS-2\)/);
});

test("Preisvorschlag: Set-Preis aus Heart, sonst Staffel", () => {
  const setet = [{ id: "acne", produkte: ["lf-acne", "lf-moistur"], cmimi: 19, aktiv: true }];
  assert.equal(preisVorschlag(["lf-moistur", "lf-acne"], setet), 19);
  assert.equal(preisVorschlag(["lf-acne"], setet), 29);
  assert.equal(preisVorschlag([], setet), 0);
});

test("Push: kurzer Text, hoechstens eine Meldung je Chat und 20 s", () => {
  assert.equal(meldungsText({ code: "LS-1" }, { art: "text", text: "Hallo\n  du" }), "💬 LS-1: Hallo du");
  assert.equal(meldungsText({}, { art: "bild" }), "💬 Klient i ri: 📷 Foto");
  assert.ok(meldungsText({}, { art: "text", text: "x".repeat(300) }).length < 140);
  const z = "0123456789abcdef0123456789abcdef";
  assert.equal(meldungsKennungChat(z, 1000), meldungsKennungChat(z, 19000));
  assert.notEqual(meldungsKennungChat(z, 1000), meldungsKennungChat(z, 21000));
});

test("Einbau: Laden mit Knopf, Vollbild, Kasse aus dem Chat; Heart mit Knopf oben; ohne Pixel", () => {
  const laden = lies("apps/lifeskin-shop/index.html");
  assert.match(laden, /id="chat-knopf"/);
  assert.match(laden, /<section class="chat" id="chat" hidden role="dialog"/);
  assert.match(laden, /src="\/apps\/lifeskin-shop\/chat.js"/);
  assert.match(laden, /maxlength="2000"/);
  const chat = lies("apps/lifeskin-shop/chat.js");
  assert.doesNotMatch(chat, /\bpixel\??\.\w+\(|\bfbq\(/, "der Chat meldet nichts an Meta");
  assert.match(chat, /visualViewport/, "Hoehe ueber der Tastatur");
  assert.match(lies("apps/lifeskin-shop/chat.css"), /font: 16px/, "16 px: sonst zoomt Safari");
  const shop = lies("apps/lifeskin-shop/shop.js");
  assert.match(shop, /chatBestellen\(\{ nachrichtId = "", produkte = \[\], summe: preis = 0 \} = \{\}\)/);
  assert.match(shop, /chat: \{ nachricht: this\.korb\.set\.slice\(5\) \}/);
  assert.match(lies("apps/mnyra-heart/heart-render.js"), /data-action="chat-oeffnen"/);
  for (const seite of ["apps/mnyra-heart/index.html", "heart/index.html"]) {
    assert.match(lies(seite), /heart-chat\.css/, seite);
  }
  assert.match(lies("apps/lifeskin-shop/privatesia.html"), /ndërsa e shkruani/, "Entwurf in der Datenschutzerklaerung");
});

test("Chat-Angebot in der Kasse: Preis der Karte, nur bekannte Produkte, Korb bleibt", async () => {
  globalThis.__LIFESKIN_TEST__ = true;
  const { istChatKorb, summe } = await import("../apps/lifeskin-shop/shop.js");
  const korb = { ids: ["lf-acne", "lf-moistur"], set: "chat-0abcdefgh", cmimi: 19 };
  assert.equal(istChatKorb(korb), true);
  assert.equal(summe(korb), 19);
  assert.equal(istChatKorb({ ids: [], set: "acne" }), false);
  assert.ok(vorschauVon(kundenText("Hallo")).text === "Hallo");
  assert.equal(chatAnlegen({ sessionId: "s", code: "c" }).status, "offen");
  assert.equal(teamText(""), null);
});
