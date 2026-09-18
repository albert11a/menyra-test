// Wer wird als "Fillo skanimin" gezaehlt - und war er ueberhaupt da?
//
// Die Frage hinter dem Trichter: 184 geoeffnet, 41 getippt. Wenn ein Teil
// der 184 nie ein Auge auf die Seite geworfen hat, ist die Quote nicht das,
// wofuer man sie haelt.

import { chromium, webkit } from "playwright-core";
const BASIS = "http://127.0.0.1:5173";
const ZIEL = "/apps/lifeskin/index.html?utm_source=facebook";

async function fall(
  name,
  {
    verstecken = false,
    engine = "chromium",
    neuLaden = 0,
    zweiterTab = false,
  } = {},
) {
  const start =
    engine === "webkit"
      ? {}
      : {
          executablePath:
            process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
        };
  const browser = await (engine === "webkit" ? webkit : chromium).launch(start);
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    hasTouch: true,
  });
  const schreibt = [];
  await kontext.route("**/firestore.googleapis.com/**", async (w) => {
    let k = null;
    try {
      k = w.request().postDataJSON();
    } catch {
      /* egal */
    }
    schreibt.push({
      methode: w.request().method(),
      step: k?.fields?.step?.stringValue || null,
      doc: w.request().url().split("/sessions/")[1]?.split("?")[0] || "",
    });
    await w.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());

  if (verstecken) {
    // So sieht eine Seite aus, die im Hintergrund geladen wird: Die
    // Meta-Apps holen Anzeigenziele auf Android vor, bevor jemand tippt.
    await kontext.addInitScript(() => {
      Object.defineProperty(document, "visibilityState", {
        get: () => "hidden",
        configurable: true,
      });
      Object.defineProperty(document, "hidden", {
        get: () => true,
        configurable: true,
      });
    });
  }

  const seite = await kontext.newPage();
  await seite.goto(BASIS + ZIEL);
  await seite.waitForTimeout(1500);
  for (let i = 0; i < neuLaden; i += 1) {
    await seite.reload();
    await seite.waitForTimeout(1200);
  }

  let zweiter = [];
  if (zweiterTab) {
    // Zweiter Tipp auf dieselbe Anzeige: Das App-Fenster oeffnet einen
    // neuen Kontext, sessionStorage ist wieder leer.
    const kontext2 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      ignoreHTTPSErrors: true,
    });
    await kontext2.route("**/firestore.googleapis.com/**", async (w) => {
      let k = null;
      try {
        k = w.request().postDataJSON();
      } catch {
        /* egal */
      }
      zweiter.push({
        step: k?.fields?.step?.stringValue || null,
        doc: w.request().url().split("/sessions/")[1]?.split("?")[0] || "",
      });
      await w.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });
    await kontext2.route("**/cdn.jsdelivr.net/**", (w) => w.abort());
    const s2 = await kontext2.newPage();
    await s2.goto(BASIS + ZIEL);
    await s2.waitForTimeout(1500);
  }

  const opened = schreibt.filter((s) => s.step === "opened");
  const docs = new Set(schreibt.map((s) => s.doc).filter(Boolean));
  console.log(
    `${name.padEnd(46)} Schreibvorgaenge=${schreibt.length} · "opened"=${opened.length} · Sitzungen=${docs.size}${zweiterTab ? ` · zweites Fenster: "opened"=${zweiter.filter((z) => z.step === "opened").length}, eigene Sitzung=${new Set(zweiter.map((z) => z.doc)).size}` : ""}`,
  );
  await browser.close();
}

console.log('\n═══ Wer landet in der Stufe "Fillo skanimin"? ═══');
await fall("normaler Besuch (Chromium)", {});
await fall("normaler Besuch (WebKit/iOS)", { engine: "webkit" });
await fall("Seite NIE sichtbar (App-Vorabladen)", { verstecken: true });
await fall("Seite NIE sichtbar (WebKit)", {
  verstecken: true,
  engine: "webkit",
});
await fall("dreimal neu geladen", { neuLaden: 3 });
await fall("zweiter Tipp auf dieselbe Anzeige", { zweiterTab: true });

// Und: bricht die Zaehlung ab, wenn der Besucher sofort wieder weggeht?
console.log("\n═══ Wer sofort wieder weggeht ═══");
for (const ms of [100, 300, 700, 1500]) {
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
  });
  const kontext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
  });
  const schreibt = [];
  await kontext.route("**/firestore.googleapis.com/**", async (w) => {
    let k = null;
    try {
      k = w.request().postDataJSON();
    } catch {
      /* egal */
    }
    schreibt.push(k?.fields?.step?.stringValue || "(ohne step)");
    await w.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());
  const seite = await kontext.newPage();
  await seite.goto(BASIS + ZIEL, { waitUntil: "commit" });
  await seite.waitForTimeout(ms);
  await seite.goto("about:blank").catch(() => {});
  await seite.waitForTimeout(400);
  console.log(
    `  nach ${String(ms).padStart(5)} ms weggegangen → gezaehlt: [${schreibt.join(", ") || "nichts"}]`,
  );
  await browser.close();
}
