// Der ganze Weg, mit einer erfundenen Kamera: Kommt jemand vom Scan zu
// Frage 1? Das ist der zweite grosse Verlust im Trichter (33 → 7).

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
const BASIS = process.env.BASIS || "http://127.0.0.1:5173";
const PFAD = process.env.LS_PFAD || "/apps/lifeskin/index.html";
const PROXY =
  process.env.HTTPS_PROXY && /^https/.test(BASIS)
    ? {
        proxy: { server: process.env.HTTPS_PROXY },
        zusatz: ["--ignore-certificate-errors"],
      }
    : { zusatz: [] };
const AUS = new URL("../../test-results/lifeskin-trichter", import.meta.url)
  .pathname;
mkdirSync(`${AUS}/bilder`, { recursive: true });

async function lauf({ name, breite, hoehe, mitNetz }) {
  const browser = await chromium.launch({
    executablePath:
      process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
    ...(PROXY.proxy ? { proxy: PROXY.proxy } : {}),
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--allow-file-access-from-files",
      "--autoplay-policy=no-user-gesture-required",
      ...PROXY.zusatz,
    ],
  });
  const kontext = await browser.newContext({
    viewport: { width: breite, height: hoehe },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true,
    locale: "sq-AL",
    permissions: ["camera"],
  });
  const schritte = [];
  await kontext.route("**/firestore.googleapis.com/**", async (w) => {
    let k = null;
    try {
      k = w.request().postDataJSON();
    } catch {
      /* egal */
    }
    const s = k?.fields?.step?.stringValue;
    if (s) schritte.push(s);
    await w.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ name: "x", fields: {} }),
    });
  });
  if (!mitNetz) await kontext.route("**/cdn.jsdelivr.net/**", (w) => w.abort());

  const seite = await kontext.newPage();
  const jsFehler = [];
  seite.on("pageerror", (e) => jsFehler.push(String(e.message).slice(0, 200)));
  await seite.goto(`${BASIS}${PFAD}?utm_source=test`);
  await seite.waitForTimeout(1000);
  await seite.click("#ls-start");
  await seite.waitForTimeout(400);
  await seite.click("#ls-kameraoeffnen");

  // Dem Scan Zeit geben. Der Ring lockert seine Schwelle mit der Zeit und
  // loest am Ende von selbst aus - das ist der gemessene Weg, nicht der
  // Notknopf im Blatt.
  const grenze = Date.now() + 75_000;
  let stand = {};
  while (Date.now() < grenze) {
    await seite.waitForTimeout(2500);
    stand = await seite.evaluate(() => ({
      schirm: document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id || "-",
      hinweis: (
        document.querySelector("#ls-kamerahinweis")?.textContent || ""
      ).trim(),
      frage: (
        document.querySelector("#ls-fragetitel")?.textContent || ""
      ).trim(),
      video: !!document.querySelector("#ls-video")?.videoWidth,
      fehler: !document
        .querySelector("#ls-fehler")
        ?.classList.contains("ls-verstecken"),
    }));
    if (stand.schirm === "ls-fragen" || stand.schirm === "ls-analyse") break;
  }
  const sekunden = Math.round((75_000 - (grenze - Date.now())) / 1000);
  console.log(
    `${name.padEnd(28)} nach ${String(sekunden).padStart(3)}s: Schirm=${stand.schirm} Video=${stand.video ? "ja" : "nein"} Frage="${stand.frage}" Hinweis="${stand.hinweis}" Fehlerkasten=${stand.fehler}`,
  );
  console.log(
    `${" ".repeat(28)} gezaehlte Schritte: [${schritte.join(" → ")}]`,
  );
  if (jsFehler.length)
    console.log(
      `${" ".repeat(28)} JS-Fehler: ${jsFehler.slice(0, 2).join(" | ")}`,
    );
  await seite.screenshot({
    path: `${AUS}/bilder/E2E_${name.replace(/\W+/g, "_")}.png`,
  });

  // Gibt es den Notweg, wenn der Ring nicht zugeht?
  if (stand.schirm === "ls-kamera") {
    await seite.click("#ls-hilfe").catch(() => {});
    await seite.waitForTimeout(500);
    const blatt = await seite.evaluate(() => {
      const b = document.querySelector("#ls-blatt");
      const m = document.querySelector("#ls-manuell");
      const r = m?.getBoundingClientRect();
      return {
        offen: b && !b.classList.contains("ls-verstecken"),
        knopf: (m?.textContent || "").trim(),
        imBild: r ? r.bottom <= window.innerHeight + 1 && r.top >= 0 : null,
      };
    });
    console.log(
      `${" ".repeat(28)} Notweg im Blatt: offen=${blatt.offen} Knopf="${blatt.knopf}" im Bild=${blatt.imBild}`,
    );
    await seite.screenshot({
      path: `${AUS}/bilder/E2E_${name.replace(/\W+/g, "_")}_blatt.png`,
    });
    if (blatt.offen) {
      await seite.click("#ls-manuell").catch(() => {});
      await seite.waitForTimeout(4000);
      const danach = await seite.evaluate(
        () => document.querySelector('.ls-schirm[data-aktiv="ja"]')?.id || "-",
      );
      console.log(
        `${" ".repeat(28)} nach dem Notknopf: Schirm=${danach}, Schritte=[${schritte.join(" → ")}]`,
      );
      await seite.screenshot({
        path: `${AUS}/bilder/E2E_${name.replace(/\W+/g, "_")}_nach_notknopf.png`,
      });
    }
  }
  await browser.close();
}

console.log("\n═══ Der ganze Weg mit erfundener Kamera (Chromium) ═══");
await lauf({
  name: "390x844 ohne Gesichtsnetz",
  breite: 390,
  hoehe: 844,
  mitNetz: false,
});
await lauf({
  name: "360x640 ohne Gesichtsnetz",
  breite: 360,
  hoehe: 640,
  mitNetz: false,
});
await lauf({
  name: "390x844 MIT Gesichtsnetz",
  breite: 390,
  hoehe: 844,
  mitNetz: true,
});
