// Was der erste Bildschirm wirklich herunterlaedt - und wer davon etwas hat.
import { chromium, webkit } from "playwright-core";
const BASIS = "https://www.mnyra.com";
const ZIEL = "/lifeskin";
const PROXY = {
  proxy: { server: process.env.HTTPS_PROXY },
  args: ["--ignore-certificate-errors"],
};

for (const [name, typ, start] of [
  [
    "Android · Chromium",
    chromium,
    {
      executablePath:
        process.env.MNYRA_E2E_CHROMIUM || "/opt/pw-browsers/chromium",
      ...PROXY,
    },
  ],
  ["iPhone · WebKit", webkit, {}],
]) {
  const b = await typ.launch(start);
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    ignoreHTTPSErrors: true,
    userAgent: name.startsWith("iPhone")
      ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
      : "Mozilla/5.0 (Linux; Android 14; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  });
  await c.route("**/firestore.googleapis.com/**", (w) =>
    w.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  const p = await c.newPage();
  const treffer = [];
  p.on("response", async (r) => {
    let n = 0;
    try {
      n = (await r.body()).length;
    } catch {
      n = Number(r.headers()["content-length"] || 0);
    }
    treffer.push({ url: r.url(), n });
  });
  await p.goto(BASIS + ZIEL);
  // Zehn Sekunden auf dem ERSTEN Bildschirm stehen bleiben - so lange
  // braucht jemand, der liest.
  await p.waitForTimeout(10000);
  const eigen = treffer.filter((t) => t.url.includes("mnyra.com"));
  const fremd = treffer.filter((t) => !t.url.includes("mnyra.com"));
  const summe = (a) => a.reduce((s, t) => s + t.n, 0);
  console.log(`\n── ${name}`);
  console.log(
    `   eigene Dateien : ${eigen.length.toString().padStart(3)} Anfragen, ${(summe(eigen) / 1024).toFixed(0)} KB`,
  );
  console.log(
    `   Fremd-CDN      : ${fremd.length.toString().padStart(3)} Anfragen, ${(summe(fremd) / 1024 / 1024).toFixed(2)} MB`,
  );
  for (const t of fremd.sort((a, b) => b.n - a.n).slice(0, 5)) {
    console.log(
      `       ${(t.n / 1024 / 1024).toFixed(2).padStart(6)} MB  ${t.url.replace("https://cdn.jsdelivr.net/npm/", "").slice(0, 78)}`,
    );
  }
  const verbindung = await p.evaluate(() => ({
    hatConnection: !!navigator.connection,
    typ: navigator.connection?.effectiveType || "-",
    sparen: navigator.connection?.saveData ?? null,
  }));
  console.log(
    `   navigator.connection: ${verbindung.hatConnection ? `${verbindung.typ}, saveData=${verbindung.sparen}` : "GIBT ES NICHT → das Modell wird IMMER geholt"}`,
  );
  await b.close();
}
