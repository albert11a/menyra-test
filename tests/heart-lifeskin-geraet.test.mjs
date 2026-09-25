// IPHONE ODER ANDROID - AN JEDEM FALL, AUCH IM ARCHIV.
//
// Gewuenscht am 25.09.: sehen, ob ein Fall von einem iPhone oder einem
// Android kam - und fuer neue Faelle, aus welcher App. Offen ist, ob die
// Android-Apps von Instagram und Facebook die Live-Kamera freigeben; ein
// Scan-Fall mit "Android · IG" beantwortet es am echten Verkehr.

import test from "node:test";
import assert from "node:assert/strict";

import {
  GESCHAEFTSZONE, baueKennzahlen, baueTrichter, baueLesetiefe,
  baueHerkunft, baueVerteilung
} from "../apps/mnyra-heart/heart-lifeskin-berechnung.js";
import { renderLifeskin, renderSitzungDetail, geraetVon } from "../apps/mnyra-heart/heart-lifeskin-render.js";
import { appAus, geraetAuslesen } from "../apps/lifeskin/lifeskin-session.js";

const TAG = new Intl.DateTimeFormat("sv-SE", { timeZone: GESCHAEFTSZONE });

const sitzung = (id, extra = {}) => ({
  id, createdAt: new Date().toISOString(), tag: TAG.format(new Date()), step: "result",
  name: id, code: `LS-${id}`, photos: ["gerade"], source: {}, device: {},
  hatBestellt: false, hatAnschrift: false, hatTelefon: false, ...extra
});

function zeichne(zusatz = {}) {
  return renderLifeskin({
    status: "ready", loadedFrom: "network", sitzungen: [], tests: [], berichte: {},
    produkte: [], abdeckung: [], kennzahlen: baueKennzahlen([]), trichter: baueTrichter([]),
    lesetiefe: baueLesetiefe([]), herkunft: baueHerkunft([]), verteilung: baueVerteilung([]), verlauf: [],
    offen: "", fotos: {}, fotosStatus: "", resetGefragt: false, resetStatus: "",
    produktOffen: "", produktStatus: "", zeitraum: "heute", fach: "alle",
    bestellZeitraum: "heute", vorschau: {}, ...zusatz
  });
}

// Die Zeile eines Falls - vom Knopf bis zu seinem Ende.
function zeileVon(html, id) {
  const anfang = html.indexOf(`data-id="${id}"`);
  assert.ok(anfang > -1, `Der Fall ${id} steht nicht in der Liste`);
  return html.slice(anfang, html.indexOf("</button>", anfang));
}

test("Offen: Android traegt sein Zeichen und die App, iPhone seines", () => {
  const html = zeichne({ sitzungen: [
    sitzung("a", { device: { os: "android", app: "instagram", screen: "412x915" } }),
    sitzung("i", { device: { os: "ios", app: "" } })
  ] });
  const android = zeileVon(html, "a");
  assert.match(android, /heart-lifeskin-fall__geraet--android/);
  assert.match(android, /aria-label="Android · Instagram"/);
  assert.match(android, /<b>IG<\/b>/);
  assert.match(android, /<svg class="heart-lifeskin-fall__os"/);
  const iphone = zeileVon(html, "i");
  assert.match(iphone, /heart-lifeskin-fall__geraet--ios/);
  assert.match(iphone, /aria-label="iOS"/);
  assert.ok(!/<b>/.test(iphone.slice(iphone.indexOf("heart-lifeskin-fall__geraet"), iphone.indexOf("</span>", iphone.indexOf("heart-lifeskin-fall__geraet")) + 7)),
    "Ohne bekannte App steht auch kein Kuerzel");
});

test("Archiv: auch alte Faelle zeigen ihr System - ohne App, wenn sie keine kennen", () => {
  // Faelle von vor dem 25.09. tragen device.os, aber kein device.app.
  const html = zeichne({
    fach: "archiviert",
    sitzungen: [sitzung("alt", { device: { os: "android", browser: "chrome" } })],
    berichte: { alt: { archiviert: true } }
  });
  const zeile = zeileVon(html, "alt");
  assert.match(zeile, /heart-lifeskin-fall__geraet--android/);
  assert.match(zeile, /aria-label="Android"/);
});

test("ohne Angabe, am Rechner oder ohne Sitzung: kein Zeichen statt eines falschen", () => {
  const html = zeichne({ sitzungen: [
    sitzung("leer"), sitzung("pc", { device: { os: "andere" } })
  ] });
  assert.ok(!/heart-lifeskin-fall__geraet/.test(zeileVon(html, "leer")));
  assert.ok(!/heart-lifeskin-fall__geraet/.test(zeileVon(html, "pc")));
  assert.equal(geraetVon({ device: { os: "andere" } }), null);
  assert.equal(geraetVon({}), null);
});

test("mit Vorschaubild steht das Zeichen auf dem Bild, gegenueber der Anzahl", () => {
  const html = zeichne({
    sitzungen: [sitzung("b", { device: { os: "android", app: "facebook" }, photos: ["gerade", "links"] })],
    vorschau: { b: "data:image/jpeg;base64,AAAA" }
  });
  const zeile = zeileVon(html, "b");
  const bild = zeile.slice(zeile.indexOf("heart-lifeskin-fall__bild"), zeile.indexOf("heart-lifeskin-fall__leib"));
  assert.match(bild, /<img /);
  assert.match(bild, /aria-label="Android · Facebook"/);
  assert.match(bild, /heart-lifeskin-fall__anzahl/);
});

test("die Akte nennt das Geraet in Worten, mit Bildschirm", () => {
  const html = renderSitzungDetail(sitzung("d", {
    device: { os: "android", app: "instagram", screen: "412x915" }
  }));
  assert.match(html, /<dt>Gerät<\/dt><dd>Android · Instagram · 412x915<\/dd>/);
  const ohne = renderSitzungDetail(sitzung("e"));
  assert.ok(!/<dt>Gerät<\/dt>/.test(ohne), "Ohne Angabe steht dort nichts");
});

// ---------------------------------------------------------------------------
// Was der Trichter dafuer in die Sitzung schreibt
// ---------------------------------------------------------------------------

test("die App wird aus der Kennung des Browsers gelesen - normale Browser sind keine", () => {
  const faelle = [
    ["Mozilla/5.0 (Linux; Android 14; SM-S921B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/128.0.6613.146 Mobile Safari/537.36 Instagram 348.0.0.36.103 Android (34/14; 480dpi; 1080x2340; samsung; SM-S921B; e1s; s5e9945; de_DE; 637476142)", "instagram"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 308.0.2.18.106 (iPhone15,2; iOS 17_1; de_DE; de; scale=3.00; 1179x2556; 530339375)", "instagram"],
    ["Mozilla/5.0 (Linux; Android 13; SM-A536B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.6099.230 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/447.0.0.40.108;]", "facebook"],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/430.0.0.29.107;FBBV/551146455]", "facebook"],
    ["Mozilla/5.0 (Linux; Android 13; Pixel 7; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0 Mobile Safari/537.36 [FB_IAB/MESSENGER;FBAV/440.0.0.30.107;]", "messenger"],
    ["Mozilla/5.0 (Linux; Android 12; SM-G991B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0 Mobile Safari/537.36 musical_ly_2023207030 BytedanceWebview/d8a21c6", "tiktok"],
    ["Mozilla/5.0 (Linux; Android 11; SM-A515F; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/118.0 Mobile Safari/537.36", "webview"],
    ["Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36", ""],
    ["Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36", ""],
    ["Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1", ""]
  ];
  for (const [ua, app] of faelle) assert.equal(appAus(ua), app, ua.slice(0, 60));
  const geraet = geraetAuslesen({ userAgent: faelle[0][0] }, { width: 412, height: 915 }, { visibilityState: "visible" });
  assert.equal(geraet.os, "android");
  assert.equal(geraet.app, "instagram");
});
