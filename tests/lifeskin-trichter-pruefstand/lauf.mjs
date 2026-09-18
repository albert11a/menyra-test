// Der Trichter-Prueflauf.
//
// Kein Playwright-Testlaeufer: Die Matrix ist die Aussage, und sie soll als
// Tabelle herauskommen, nicht als Liste von Haken.

import { chromium, webkit, firefox } from "playwright-core";
import { writeFileSync, mkdirSync } from "node:fs";
import { GERAETE, VERWEIS, ZIEL } from "./geraete.mjs";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const CHROME = process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium";
const AUS =
  new URL("../../test-results/lifeskin-trichter", import.meta.url).pathname +
  (process.env.LS_MARKE ? "/" + process.env.LS_MARKE : "");
mkdirSync(AUS, { recursive: true });
mkdirSync(`${AUS}/bilder`, { recursive: true });

const befunde = [];
function melde(geraet, pruefung, stand, text, schwere = "hoch") {
  befunde.push({ geraet, pruefung, stand, text, schwere });
  if (stand !== "ok") {
    console.log(`  ${stand === "fehler" ? "✗" : "!"} ${pruefung}: ${text}`);
  }
}

// Firestore wird abgefangen: Kein Prueflauf schreibt in die echte Zaehlung.
async function firestoreAbfangen(kontext, protokoll) {
  await kontext.route("**/firestore.googleapis.com/**", async (weg) => {
    const anfrage = weg.request();
    let koerper = null;
    try {
      koerper = anfrage.postDataJSON();
    } catch {
      koerper = null;
    }
    protokoll.push({
      methode: anfrage.method(),
      url: anfrage.url(),
      step: koerper?.fields?.step?.stringValue || null,
      felder: koerper?.fields ? Object.keys(koerper.fields) : [],
    });
    await weg.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ name: "x", fields: {} }),
    });
  });
}

// Was auf dem Bildschirm sichtbar UND bedienbar ist.
async function knopfLage(seite, wahl) {
  return seite.evaluate((w) => {
    const el = document.querySelector(w);
    if (!el) return { da: false };
    const r = el.getBoundingClientRect();
    const stil = getComputedStyle(el);
    const mx = r.left + r.width / 2;
    const my = r.top + r.height / 2;
    const getroffen = document.elementFromPoint(mx, my);
    return {
      da: true,
      text: (el.textContent || "").trim(),
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
      unten: Math.round(r.bottom),
      fensterHoehe: window.innerHeight,
      fensterBreite: window.innerWidth,
      sichtbar:
        stil.display !== "none" &&
        stil.visibility !== "hidden" &&
        Number(stil.opacity) > 0.01,
      // Trifft der Daumen wirklich den Knopf - oder liegt etwas darueber?
      trefferOk: !!getroffen && (getroffen === el || el.contains(getroffen)),
      trefferWar: getroffen
        ? getroffen.id || getroffen.className || getroffen.tagName
        : null,
    };
  }, wahl);
}

async function seitenMasse(seite) {
  // GEMESSEN WIRD, WAS DER BESUCHER MERKT.
  //
  // body.scrollHeight allein taugt nicht: Chromium behaelt nach der
  // Einblendung (translate3d(0,10px,0)) zehn Pixel im Ueberlauf stehen,
  // obwohl kein Element mehr dort liegt und html:overflow:hidden jedes
  // Schieben verhindert. Das waere ein Waechter, der immer schlaegt.
  //
  // Also: wirklich schieben und nachsehen, ob sich etwas bewegt hat - und
  // zusaetzlich zaehlen, was UNTER dem Fensterrand liegt.
  return seite.evaluate(() => {
    const vorher = window.scrollY;
    window.scrollTo(0, 2000);
    const verschoben = window.scrollY - vorher;
    window.scrollTo(0, vorher);
    const grenze = window.innerHeight;
    const drunter = [];
    for (const el of Array.from(document.querySelectorAll("body *"))) {
      const st = getComputedStyle(el);
      if (st.display === "none" || st.visibility === "hidden") continue;
      if (Number(st.opacity) < 0.01) continue;
      const r = el.getBoundingClientRect();
      if (!r.height && !r.width) continue;
      // Nur, was der Besucher braucht: Text und Bedienelemente.
      const zaehlt = el.matches(
        "button, input, a, h1, h2, p, img, .ls-knopf, .ls-regel",
      );
      if (!zaehlt) continue;
      if (r.top >= grenze - 1 || r.bottom > grenze + 1) {
        drunter.push(
          `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} (${Math.round(r.top)}…${Math.round(r.bottom)})`,
        );
      }
    }
    return {
      verschoben,
      dokuBreite: document.documentElement.scrollWidth,
      fensterHoehe: window.innerHeight,
      fensterBreite: window.innerWidth,
      drunter: drunter.slice(0, 6),
    };
  });
}

async function beschnitten(seite) {
  return seite.evaluate(() => {
    const raus = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const stil = getComputedStyle(el);
      if (stil.display === "none" || stil.visibility === "hidden") continue;
      if (!["hidden", "auto", "scroll"].includes(stil.overflowY)) continue;
      if (!el.textContent?.trim()) continue;
      if (stil.clipPath !== "none") continue;
      if (el.clientHeight <= 1 || el.clientWidth <= 1) continue;
      // Siehe seitenMasse(): body traegt in Chromium ein Phantom von 10 px.
      if (el === document.body || el === document.documentElement) continue;
      const zuviel = el.scrollHeight - el.clientHeight;
      if (zuviel > 1) {
        const pfad = [];
        let n = el;
        while (n && n.tagName !== "BODY" && pfad.length < 4) {
          pfad.unshift(
            n.tagName.toLowerCase() +
              (n.id ? `#${n.id}` : "") +
              (typeof n.className === "string" && n.className
                ? `.${n.className.trim().split(/\s+/).join(".")}`
                : ""),
          );
          n = n.parentElement;
        }
        raus.push(
          `${pfad.join(">")} (${zuviel}px, sichtbar ${el.clientHeight}px)`,
        );
      }
    }
    return raus;
  });
}

async function schirmWechseln(seite, name) {
  await seite.evaluate((n) => {
    for (const s of Array.from(document.querySelectorAll(".ls-schirm"))) {
      s.dataset.aktiv = s.id === `ls-${n}` ? "ja" : "nein";
    }
  }, name);
  // Laenger als die Einblendung (260 ms): waehrend sie laeuft steht der
  // Bildschirm 10 px tiefer, und das waere als Ueberlauf gezaehlt worden.
  await seite.waitForTimeout(450);
}

async function laufeGeraet(geraet) {
  console.log(
    `\n── ${geraet.name} (${geraet.breite}×${geraet.hoehe}, ${geraet.engine})`,
  );
  const typ =
    geraet.engine === "webkit"
      ? webkit
      : geraet.engine === "firefox"
        ? firefox
        : chromium;
  // NUR FUER DIESEN PRUEFSTAND, nicht fuer die Seite: Der Ausgang dieser
  // Umgebung laeuft ueber einen Zwischenproxy, der TLS neu abschliesst.
  // Chromium kennt dessen Wurzel nicht und bricht mit ERR_TOO_MANY_RETRIES
  // ab - WebKit laeuft ohne das durch. Die Seite selbst wird davon nicht
  // beruehrt; sie wird genauso ausgeliefert wie jedem Besucher.
  // NUR FUER EINE ENTFERNTE ADRESSE. Der lokale Server gehoert nicht durch
  // den Proxy: Der beantwortet eine gewoehnliche HTTP-Anfrage mit 405, und
  // dann laedt die Seite ueberhaupt nicht - was hier wie ein Seitenfehler
  // aussieht und keiner ist.
  const ueberProxy = Boolean(process.env.HTTPS_PROXY) && /^https:/.test(BASIS);
  const proxy = ueberProxy
    ? { proxy: { server: process.env.HTTPS_PROXY } }
    : {};
  const start =
    geraet.engine !== "chromium"
      ? {}
      : {
          executablePath: CHROME,
          ...proxy,
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
            ...(ueberProxy ? ["--ignore-certificate-errors"] : []),
          ],
        };
  const browser = await typ.launch(start);
  const protokoll = [];
  const fehlerLog = [];
  const gescheiterteDateien = [];

  const kontext = await browser.newContext({
    viewport: { width: geraet.breite, height: geraet.hoehe },
    deviceScaleFactor: geraet.dpr,
    isMobile: geraet.touch && geraet.engine === "chromium",
    hasTouch: geraet.touch,
    userAgent: geraet.ua,
    ignoreHTTPSErrors: true,
    locale: "sq-AL",
    timezoneId: "Europe/Belgrade",
    extraHTTPHeaders: VERWEIS[geraet.quelle]
      ? { Referer: VERWEIS[geraet.quelle] }
      : {},
  });
  await firestoreAbfangen(kontext, protokoll);

  const seite = await kontext.newPage();
  seite.on("console", (m) => {
    if (m.type() === "error") fehlerLog.push(m.text().slice(0, 300));
  });
  seite.on("pageerror", (e) =>
    fehlerLog.push(`pageerror: ${String(e.message).slice(0, 300)}`),
  );
  seite.on("requestfailed", (r) => {
    const u = r.url();
    if (u.includes("firestore.googleapis.com")) return;
    gescheiterteDateien.push(
      `${u.replace(BASIS, "")} — ${r.failure()?.errorText}`,
    );
  });

  const t0 = Date.now();
  await seite.goto(BASIS + ZIEL[geraet.quelle], {
    waitUntil: "domcontentloaded",
  });

  // ---------- 0. Quer gehalten wird gar nicht erst angefangen ----------
  //
  // Auf einem quer gehaltenen Telefon ist die Buehne der Kamera so hoch wie
  // das Fenster breit; Hinweistext und Knopf liegen dann Hunderte Pixel
  // unterhalb des Bildschirms. Statt eines Trichters, der halb
  // funktioniert, steht dort die Bitte, das Telefon zu drehen.
  //
  // Hier wird deshalb etwas anderes geprueft als sonst - und das ist der
  // Punkt: Dass der Startknopf nicht zu treffen ist, ist auf diesem Geraet
  // das richtige Ergebnis und kein Fehler.
  const querTelefon = geraet.breite > geraet.hoehe && geraet.hoehe <= 560;
  if (querTelefon) {
    await seite.waitForTimeout(700);
    const sperre = await seite.evaluate(() => {
      const q = document.querySelector("#ls-quer");
      if (!q) return { da: false };
      const stil = getComputedStyle(q);
      const r = q.getBoundingClientRect();
      return {
        da: true,
        sichtbar: stil.display !== "none",
        deckend:
          Math.round(r.width) >= window.innerWidth &&
          Math.round(r.height) >= window.innerHeight,
        text: (q.innerText || "").trim().replace(/\s+/g, " "),
        obenInDerMitte: (() => {
          const el = document.elementFromPoint(
            window.innerWidth / 2,
            window.innerHeight / 2,
          );
          return el ? el.closest("#ls-quer") !== null : false;
        })(),
      };
    });
    melde(
      geraet.name,
      "Quersperre steht",
      sperre.sichtbar ? "ok" : "fehler",
      sperre.da ? "" : "#ls-quer fehlt im Aufbau",
    );
    melde(
      geraet.name,
      "Quersperre deckt den ganzen Bildschirm",
      sperre.deckend ? "ok" : "fehler",
      `${sperre.deckend}`,
    );
    melde(
      geraet.name,
      "Quersperre liegt obenauf",
      sperre.obenInDerMitte ? "ok" : "fehler",
      "In der Mitte des Bildschirms liegt etwas anderes",
    );
    melde(
      geraet.name,
      "Quersperre sagt, was zu tun ist",
      sperre.text && sperre.text.length > 10 ? "ok" : "fehler",
      sperre.text || "(leer)",
    );
    await seite.screenshot({
      path: `${AUS}/bilder/${geraet.name.replace(/[^\w]+/g, "_")}__0-quer.png`,
    });
    await browser.close();
    return { bereitMs: -1 };
  }

  // ---------- 1. Steht der Knopf, und steht Text darauf? ----------
  let bereitMs = -1;
  try {
    await seite.waitForFunction(
      () =>
        (document.querySelector("#ls-start")?.textContent || "").trim().length >
        0,
      { timeout: 8000 },
    );
    bereitMs = Date.now() - t0;
    melde(geraet.name, "Knopf beschriftet", "ok", `nach ${bereitMs} ms`);
  } catch {
    melde(
      geraet.name,
      "Knopf beschriftet",
      "fehler",
      "Der Startknopf bleibt leer — JavaScript hat die Texte nicht gesetzt.",
    );
  }
  await seite.waitForTimeout(500);

  // ---------- 2. Einstieg: Lage, Treffer, Scrollen ----------
  const knopf = await knopfLage(seite, "#ls-start");
  if (!knopf.da) {
    melde(
      geraet.name,
      "Startknopf vorhanden",
      "fehler",
      "#ls-start fehlt im Aufbau",
    );
  } else {
    melde(
      geraet.name,
      "Startknopf Text",
      knopf.text ? "ok" : "fehler",
      knopf.text || "(leer)",
    );
    const imBild = knopf.y >= 0 && knopf.unten <= knopf.fensterHoehe + 1;
    melde(
      geraet.name,
      "Startknopf im Bild",
      imBild ? "ok" : "fehler",
      `Unterkante ${knopf.unten}px, Fenster ${knopf.fensterHoehe}px`,
    );
    melde(
      geraet.name,
      "Startknopf trifft",
      knopf.trefferOk ? "ok" : "fehler",
      knopf.trefferOk
        ? "Daumen trifft den Knopf"
        : `darueber liegt: ${knopf.trefferWar}`,
    );
    melde(
      geraet.name,
      "Startknopf Groesse",
      knopf.h >= 44 ? "ok" : "fehler",
      `${knopf.w}×${knopf.h}px`,
    );
    if (geraet.iabLeiste) {
      const frei = knopf.fensterHoehe - geraet.iabLeiste;
      melde(
        geraet.name,
        "Startknopf ueber App-Leiste",
        knopf.unten <= frei ? "ok" : "warnung",
        `Unterkante ${knopf.unten}px, freie Hoehe ohne App-Leiste ${frei}px`,
      );
    }
  }

  const masse = await seitenMasse(seite);
  melde(
    geraet.name,
    "Seite laesst sich nicht schieben",
    masse.verschoben <= 1 ? "ok" : "fehler",
    `um ${masse.verschoben}px verschoben`,
  );
  melde(
    geraet.name,
    "nichts unter dem Fensterrand",
    masse.drunter.length ? "fehler" : "ok",
    masse.drunter.join(", ") || "-",
  );
  melde(
    geraet.name,
    "kein Querscrollen",
    masse.dokuBreite - masse.fensterBreite <= 1 ? "ok" : "fehler",
    `Dokument ${masse.dokuBreite}px breit, Fenster ${masse.fensterBreite}px`,
  );

  const abgeschnitten = await beschnitten(seite);
  melde(
    geraet.name,
    "nichts abgeschnitten",
    abgeschnitten.length ? "fehler" : "ok",
    abgeschnitten.join(", ") || "-",
  );

  // Ueberschrift und Bild
  const kopf = await seite.evaluate(() => {
    const h1 = document.querySelector("#ls-karten h1");
    const bild = document.querySelector("#ls-karten img");
    const hinweis = document.querySelector("#ls-einstieghinweis");
    return {
      h1: (h1?.textContent || "").trim(),
      bildGeladen: bild ? bild.complete && bild.naturalWidth > 0 : null,
      hinweis: (hinweis?.textContent || "").trim(),
      karten: document.querySelectorAll("#ls-karten .ls-karte").length,
    };
  });
  melde(
    geraet.name,
    "Ueberschrift",
    kopf.h1 ? "ok" : "fehler",
    kopf.h1 || "(leer)",
  );
  melde(
    geraet.name,
    "Bild Dr. Gashi",
    kopf.bildGeladen === true ? "ok" : "fehler",
    kopf.bildGeladen === null
      ? "kein <img>"
      : kopf.bildGeladen
        ? "geladen"
        : "NICHT geladen",
  );
  melde(
    geraet.name,
    "Hinweiszeile",
    kopf.hinweis ? "ok" : "fehler",
    kopf.hinweis || "(leer)",
  );

  await seite.screenshot({
    path: `${AUS}/bilder/${geraet.name.replace(/[^\w]+/g, "_")}__1-einstieg.png`,
  });

  // Die zweite Karte - laeuft der Wechsel, und passt sie auch?
  await seite.waitForTimeout(4900);
  const karte2 = await seite.evaluate(() => {
    const aktiv = document.querySelector(
      '#ls-karten .ls-karte[data-aktiv="ja"]',
    );
    return {
      index: Array.from(
        document.querySelectorAll("#ls-karten .ls-karte"),
      ).indexOf(aktiv),
      text: (aktiv?.textContent || "").trim().slice(0, 60),
    };
  });
  melde(
    geraet.name,
    "Kartenwechsel",
    karte2.index === 1 ? "ok" : "warnung",
    `aktive Karte ${karte2.index}: ${karte2.text}`,
  );
  const masse2 = await seitenMasse(seite);
  melde(
    geraet.name,
    "Karte 2 passt",
    masse2.verschoben <= 1 && !masse2.drunter.length ? "ok" : "fehler",
    masse2.drunter.join(", ") || `um ${masse2.verschoben}px verschiebbar`,
  );
  await seite.screenshot({
    path: `${AUS}/bilder/${geraet.name.replace(/[^\w]+/g, "_")}__1b-karte2.png`,
  });

  // ---------- 3. Der Klick auf Bildschirm 2 ----------
  let aufSchirm2 = false;
  try {
    await seite.click("#ls-start", { timeout: 4000 });
    await seite.waitForTimeout(600);
    aufSchirm2 = await seite.evaluate(
      () => document.querySelector("#ls-vorbereitung")?.dataset.aktiv === "ja",
    );
  } catch (e) {
    melde(
      geraet.name,
      "Klick auf Start",
      "fehler",
      String(e.message).split("\n")[0].slice(0, 160),
    );
  }
  melde(
    geraet.name,
    "Bildschirm 2 erscheint",
    aufSchirm2 ? "ok" : "fehler",
    aufSchirm2 ? "Vorbereitung ist aktiv" : "Bildschirm 2 kam nicht",
  );

  const gezaehlt = protokoll.filter((p) => p.step === "named").length;
  melde(
    geraet.name,
    "Schritt 'named' gezaehlt",
    gezaehlt > 0 ? "ok" : "fehler",
    gezaehlt > 0 ? `${gezaehlt}× an Firestore` : "keine Zaehlung abgesetzt",
  );

  // ---------- 4. Bildschirm 2 ----------
  const knopf2 = await knopfLage(seite, "#ls-kameraoeffnen");
  if (knopf2.da) {
    melde(
      geraet.name,
      "Kameraknopf Text",
      knopf2.text ? "ok" : "fehler",
      knopf2.text || "(leer)",
    );
    melde(
      geraet.name,
      "Kameraknopf im Bild",
      knopf2.y >= 0 && knopf2.unten <= knopf2.fensterHoehe + 1
        ? "ok"
        : "fehler",
      `Unterkante ${knopf2.unten}px, Fenster ${knopf2.fensterHoehe}px`,
    );
    melde(
      geraet.name,
      "Kameraknopf trifft",
      knopf2.trefferOk ? "ok" : "fehler",
      knopf2.trefferOk ? "-" : `darueber liegt: ${knopf2.trefferWar}`,
    );
    if (geraet.iabLeiste) {
      const frei = knopf2.fensterHoehe - geraet.iabLeiste;
      melde(
        geraet.name,
        "Kameraknopf ueber App-Leiste",
        knopf2.unten <= frei ? "ok" : "warnung",
        `Unterkante ${knopf2.unten}px, frei ${frei}px`,
      );
    }
  } else {
    melde(
      geraet.name,
      "Kameraknopf vorhanden",
      "fehler",
      "#ls-kameraoeffnen fehlt",
    );
  }
  const masse3 = await seitenMasse(seite);
  melde(
    geraet.name,
    "Bildschirm 2 passt",
    masse3.verschoben <= 1 && !masse3.drunter.length ? "ok" : "fehler",
    masse3.drunter.join(", ") || `um ${masse3.verschoben}px verschiebbar`,
  );
  const abgeschnitten2 = await beschnitten(seite);
  melde(
    geraet.name,
    "Bildschirm 2 nichts abgeschnitten",
    abgeschnitten2.length ? "fehler" : "ok",
    abgeschnitten2.join(", ") || "-",
  );
  await seite.screenshot({
    path: `${AUS}/bilder/${geraet.name.replace(/[^\w]+/g, "_")}__2-vorbereitung.png`,
  });

  // ---------- 5. Die uebrigen Bildschirme im Aufbau ----------
  for (const schirm of ["kamera", "fragen", "analyse"]) {
    await schirmWechseln(seite, schirm);
    const m = await seitenMasse(seite);
    melde(
      geraet.name,
      `Bildschirm ${schirm} passt`,
      m.verschoben <= 1 && !m.drunter.length ? "ok" : "fehler",
      m.drunter.join(", ") || `um ${m.verschoben}px verschiebbar`,
    );
    const ab = await beschnitten(seite);
    melde(
      geraet.name,
      `Bildschirm ${schirm} nichts abgeschnitten`,
      ab.length ? "fehler" : "ok",
      ab.join(", ") || "-",
    );
    await seite.screenshot({
      path: `${AUS}/bilder/${geraet.name.replace(/[^\w]+/g, "_")}__3-${schirm}.png`,
    });
  }

  // ZWEI SORTEN MELDUNG IN DER KONSOLE, und nur die eine ist ein Fehler.
  //
  // Der Kopfzeilensatz Content-Security-Policy-Report-Only traegt
  // frame-ancestors und upgrade-insecure-requests. Beide gelten in einem
  // Report-Only-Satz nicht, und jeder Browser sagt das bei jedem Aufruf in
  // der Konsole. Das ist Hausordnung, kein Seitenfehler - und wenn es hier
  // als Fehler stuende, waere jeder Lauf rot und der Waechter blind.
  const cspHinweis = (t) => /Content Security Policy/i.test(t);
  const echteFehler = fehlerLog.filter((t) => !cspHinweis(t));
  const cspFehler = fehlerLog.filter(cspHinweis);
  melde(
    geraet.name,
    "keine JS-Fehler",
    echteFehler.length ? "fehler" : "ok",
    echteFehler.slice(0, 3).join(" | ") || "-",
  );
  if (cspFehler.length) {
    melde(
      geraet.name,
      "CSP-Hinweise in der Konsole",
      "warnung",
      `${cspFehler.length} Meldung(en): frame-ancestors und upgrade-insecure-requests gelten in einem Report-Only-Satz nicht`,
    );
  }
  melde(
    geraet.name,
    "alle Dateien geladen",
    gescheiterteDateien.length ? "fehler" : "ok",
    gescheiterteDateien.slice(0, 3).join(" | ") || "-",
  );

  await browser.close();
  return { bereitMs };
}

const nur = process.argv[2];
for (const geraet of GERAETE) {
  if (nur && !geraet.name.toLowerCase().includes(nur.toLowerCase())) continue;
  try {
    await laufeGeraet(geraet);
  } catch (e) {
    melde(
      geraet.name,
      "Lauf",
      "fehler",
      `abgebrochen: ${String(e.message).split("\n")[0]}`,
    );
  }
}

writeFileSync(
  `${AUS}/befunde${process.env.LS_MARKE ? "-" + process.env.LS_MARKE : ""}.json`,
  JSON.stringify(befunde, null, 2),
);
const fehler = befunde.filter((b) => b.stand === "fehler");
const warn = befunde.filter((b) => b.stand === "warnung");
console.log(
  `\n═══ ${befunde.length} Pruefungen · ${fehler.length} Fehler · ${warn.length} Warnungen ═══`,
);
for (const f of fehler)
  console.log(`FEHLER  ${f.geraet} — ${f.pruefung}: ${f.text}`);
for (const f of warn)
  console.log(`WARNUNG ${f.geraet} — ${f.pruefung}: ${f.text}`);
