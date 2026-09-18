// Wie sich der erste Bildschirm unter echten Bedingungen anfuehlt:
// langsames Netz, abgerissenes Netz, blockierte Zaehlung, blockiertes
// Fremd-CDN - und was der Besucher in der ersten Sekunde sieht.

import { chromium, webkit } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const ZIEL =
  (process.env.LS_PFAD || "/apps/lifeskin/index.html") +
  "?utm_source=instagram&utm_campaign=test";
// Siehe lauf.mjs: nur fuer den Pruefstand hinter dem Zwischenproxy.
const PROXY =
  process.env.HTTPS_PROXY && /^https/.test(BASIS)
    ? {
        proxy: { server: process.env.HTTPS_PROXY },
        args: ["--ignore-certificate-errors"],
      }
    : { args: [] };
const AUS = new URL("../../test-results/lifeskin-trichter", import.meta.url)
  .pathname;
mkdirSync(`${AUS}/bilder`, { recursive: true });
const zeilen = [];
const sag = (...a) => {
  const s = a.join(" ");
  zeilen.push(s);
  console.log(s);
};

const NETZE = {
  // Werte wie in den Chrome-Entwicklerwerkzeugen.
  "schnelles 4G": {
    down: (4 * 1024 * 1024) / 8,
    up: (3 * 1024 * 1024) / 8,
    latenz: 20,
  },
  "langsames 4G": {
    down: (1.6 * 1024 * 1024) / 8,
    up: (750 * 1024) / 8,
    latenz: 150,
  },
  "3G": { down: (780 * 1024) / 8, up: (330 * 1024) / 8, latenz: 300 },
  "schlechtes 3G": {
    down: (400 * 1024) / 8,
    up: (200 * 1024) / 8,
    latenz: 500,
  },
};

async function messe({ netz, firestore = true, cdn = true, name }) {
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
    ...PROXY,
  });
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true,
    locale: "sq-AL",
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  });
  let bytes = 0;
  const seite = await kontext.newPage();
  seite.on("response", async (r) => {
    try {
      const h = r.headers()["content-length"];
      if (h) bytes += Number(h);
    } catch {
      /* egal */
    }
  });
  await kontext.route("**/firestore.googleapis.com/**", (w) =>
    firestore
      ? w.fulfill({ status: 200, contentType: "application/json", body: "{}" })
      : w.abort(),
  );
  if (!cdn) await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());

  if (netz) {
    const cdp = await kontext.newCDPSession(seite);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: netz.latenz,
      downloadThroughput: netz.down,
      uploadThroughput: netz.up,
    });
  }

  const t0 = Date.now();
  let knopfMs = -1,
    ersterInhaltMs = -1;
  await seite.goto(BASIS + ZIEL, { waitUntil: "commit" });
  try {
    await seite.waitForFunction(
      () =>
        (document.querySelector("#ls-start")?.textContent || "").trim().length >
        0,
      { timeout: 25000 },
    );
    knopfMs = Date.now() - t0;
  } catch {
    /* bleibt -1 */
  }
  try {
    const m = await seite.evaluate(
      () =>
        new Promise((f) => {
          const vorhanden = performance.getEntriesByName(
            "first-contentful-paint",
          )[0];
          if (vorhanden) return f(vorhanden.startTime);
          new globalThis.PerformanceObserver((l) => {
            for (const e of l.getEntries())
              if (e.name === "first-contentful-paint") f(e.startTime);
          }).observe({ type: "paint", buffered: true });
          setTimeout(() => f(-1), 3000);
        }),
    );
    ersterInhaltMs = Math.round(m);
  } catch {
    /* egal */
  }

  // Kann er tippen, und geht es weiter?
  let weiter = false;
  try {
    await seite.click("#ls-start", { timeout: 5000 });
    await seite.waitForTimeout(700);
    weiter = await seite.evaluate(
      () => document.querySelector("#ls-vorbereitung")?.dataset.aktiv === "ja",
    );
  } catch {
    /* bleibt false */
  }

  sag(
    `${name.padEnd(34)} erster Inhalt ${String(ersterInhaltMs).padStart(6)} ms · Knopf lesbar ${String(knopfMs).padStart(6)} ms · Bildschirm 2 ${weiter ? "JA" : "NEIN"} · ${(bytes / 1024).toFixed(0)} KB`,
  );
  await browser.close();
  return { name, ersterInhaltMs, knopfMs, weiter, bytes };
}

sag(
  "\n═══ 1. Der erste Bildschirm unter Netzbedingungen (Android/Chromium) ═══",
);
const netzErgebnis = [];
for (const [name, netz] of Object.entries(NETZE)) {
  netzErgebnis.push(await messe({ netz, name: `${name}` }));
}
sag("");
netzErgebnis.push(
  await messe({ netz: NETZE["3G"], cdn: false, name: "3G, CDN blockiert" }),
);
netzErgebnis.push(
  await messe({
    netz: NETZE["3G"],
    firestore: false,
    name: "3G, Zaehlung blockiert",
  }),
);
netzErgebnis.push(
  await messe({ firestore: false, name: "kein Netzlimit, Zaehlung tot" }),
);
netzErgebnis.push(
  await messe({ cdn: false, firestore: false, name: "CDN + Zaehlung tot" }),
);

// ---------- 2. Was sieht er in der ersten Sekunde? ----------
sag("\n═══ 2. Was steht in den ersten Millisekunden auf dem Bildschirm? ═══");
{
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
    ...PROXY,
  });
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true,
  });
  await kontext.route("**/firestore.googleapis.com/**", (w) =>
    w.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  const seite = await kontext.newPage();
  const cdp = await kontext.newCDPSession(seite);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    ...{
      latency: 300,
      downloadThroughput: (780 * 1024) / 8,
      uploadThroughput: (330 * 1024) / 8,
    },
  });
  seite.goto(BASIS + ZIEL).catch(() => {});
  for (const ms of [200, 500, 800, 1200, 2000, 3000]) {
    await seite.waitForTimeout(ms === 200 ? 200 : 300);
    const stand = await seite
      .evaluate(() => ({
        knopf: (document.querySelector("#ls-start")?.textContent || "").trim(),
        titel: (document.querySelector("#ls-karten h1")?.textContent || "")
          .trim()
          .slice(0, 40),
        bild: !!document.querySelector("#ls-karten img")?.naturalWidth,
      }))
      .catch(() => ({ knopf: "?", titel: "?", bild: false }));
    sag(
      `  ${String(ms).padStart(5)} ms  Knopf="${stand.knopf}"  Titel="${stand.titel}"  Bild=${stand.bild ? "da" : "-"}`,
    );
    await seite.screenshot({
      path: `${AUS}/bilder/ZEIT_3G_${String(ms).padStart(4, "0")}ms.png`,
    });
  }
  await browser.close();
}

// ---------- 3. Kamera: Erlaubnis, Verweigerung, gar keine Kamera ----------
sag("\n═══ 3. Die Kamera ═══");
async function kameraFall(name, { engine, erlauben, mediaDevicesWeg = false }) {
  const start =
    engine === "webkit"
      ? {}
      : {
          executablePath:
            process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
          ...PROXY,
          args: [
            ...(PROXY.args || []),
            ...(erlauben
              ? [
                  "--use-fake-ui-for-media-stream",
                  "--use-fake-device-for-media-stream",
                ]
              : []),
          ],
        };
  const browser = await (engine === "webkit" ? webkit : chromium).launch(start);
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: engine !== "webkit",
    hasTouch: true,
    ignoreHTTPSErrors: true,
    locale: "sq-AL",
    permissions: erlauben ? ["camera"] : [],
  });
  if (!erlauben) {
    try {
      await kontext.clearPermissions();
    } catch {
      /* egal */
    }
  }
  await kontext.route("**/firestore.googleapis.com/**", (w) =>
    w.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());
  if (mediaDevicesWeg) {
    await kontext.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "mediaDevices", {
          get: () => undefined,
          configurable: true,
        });
      } catch {
        /* egal */
      }
    });
  }
  const seite = await kontext.newPage();
  const fehler = [];
  seite.on("pageerror", (e) => fehler.push(String(e.message).slice(0, 160)));
  await seite.goto(BASIS + ZIEL);
  await seite.waitForTimeout(900);
  await seite.click("#ls-start");
  await seite.waitForTimeout(500);
  await seite.click("#ls-kameraoeffnen");
  await seite.waitForTimeout(3500);

  const stand = await seite.evaluate(() => {
    const kasten = document.querySelector("#ls-fehler");
    const sichtbar = kasten && !kasten.classList.contains("ls-verstecken");
    const video = document.querySelector("#ls-video");
    return {
      fehlerSichtbar: !!sichtbar,
      fehlerText: sichtbar
        ? (document.querySelector("#ls-fehlertext")?.textContent || "").trim()
        : "",
      nochmalKnopf: sichtbar
        ? (
            document.querySelector("#ls-fehlernochmal")?.textContent || ""
          ).trim()
        : "",
      hinweis: (
        document.querySelector("#ls-kamerahinweis")?.textContent || ""
      ).trim(),
      videoLaeuft: !!(video && video.videoWidth > 0),
      aktiverSchirm:
        document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id || "-",
    };
  });
  sag(
    `  ${name.padEnd(40)} Schirm=${stand.aktiverSchirm} Video=${stand.videoLaeuft ? "laeuft" : "-"} Fehlerkasten=${stand.fehlerSichtbar ? `"${stand.fehlerText}" / Knopf "${stand.nochmalKnopf}"` : "-"} Hinweis="${stand.hinweis}"`,
  );
  if (fehler.length) sag(`      JS-Fehler: ${fehler.slice(0, 2).join(" | ")}`);
  await seite.screenshot({
    path: `${AUS}/bilder/KAMERA_${name.replace(/\W+/g, "_")}.png`,
  });
  await browser.close();
}
await kameraFall("Chromium, Kamera erlaubt", {
  engine: "chromium",
  erlauben: true,
});
await kameraFall("Chromium, Kamera verweigert", {
  engine: "chromium",
  erlauben: false,
});
await kameraFall("Chromium, keine mediaDevices (alte WebView)", {
  engine: "chromium",
  erlauben: false,
  mediaDevicesWeg: true,
});
await kameraFall("WebKit/iOS, keine Kamera im Testrechner", {
  engine: "webkit",
  erlauben: false,
});
await kameraFall("WebKit/iOS, keine mediaDevices", {
  engine: "webkit",
  erlauben: false,
  mediaDevicesWeg: true,
});

// ---------- 4. Ohne JavaScript ----------
sag("\n═══ 4. Ohne JavaScript (Sparmodus, Blocker, alter Browser) ═══");
{
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
    ...PROXY,
  });
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
    ignoreHTTPSErrors: true,
  });
  const seite = await kontext.newPage();
  await seite.goto(BASIS + ZIEL);
  await seite.waitForTimeout(600);
  const s = await seite.evaluate(() => 1).catch(() => null);
  const text = (await seite.locator("body").innerText()).trim();
  sag(
    `  sichtbarer Text: ${text ? JSON.stringify(text.slice(0, 120)) : "(NICHTS - leerer Bildschirm)"}  (evaluate=${s})`,
  );
  await seite.screenshot({ path: `${AUS}/bilder/OHNE_JS.png` });
  await browser.close();
}

// ---------- 5. Bewegung abbestellt ----------
sag("\n═══ 5. prefers-reduced-motion ═══");
{
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
    ...PROXY,
  });
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
    ignoreHTTPSErrors: true,
  });
  await kontext.route("**/firestore.googleapis.com/**", (w) =>
    w.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());
  const seite = await kontext.newPage();
  await seite.goto(BASIS + ZIEL);
  await seite.waitForTimeout(900);
  const k = await seite.evaluate(() =>
    (document.querySelector("#ls-start")?.textContent || "").trim(),
  );
  await seite.click("#ls-start");
  await seite.waitForTimeout(500);
  const auf2 = await seite.evaluate(
    () => document.querySelector("#ls-vorbereitung")?.dataset.aktiv === "ja",
  );
  sag(`  Knopf="${k}"  Bildschirm 2=${auf2 ? "JA" : "NEIN"}`);
  await browser.close();
}

writeFileSync(
  `${AUS}/netz${process.env.LS_MARKE ? "-" + process.env.LS_MARKE : ""}.txt`,
  zeilen.join("\n"),
);
