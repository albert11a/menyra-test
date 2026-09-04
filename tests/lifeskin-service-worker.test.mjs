import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SW = fs.readFileSync(path.join(process.cwd(), "sw.js"), "utf8");
const VERCEL = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));

// Die Liste aus dem Service Worker herausziehen, statt sie hier abzuschreiben.
function nichtSozialePfade() {
  const treffer = SW.match(/const NON_SOCIAL_NAVIGATION_PREFIXES = \[([\s\S]*?)\];/);
  assert.ok(treffer, "NON_SOCIAL_NAVIGATION_PREFIXES nicht gefunden");
  return Array.from(treffer[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);
}

test("der Service Worker haelt /lifeskin fuer eine eigene Seite", () => {
  // Der Fehler, der im Betrieb aufgetreten ist: Ohne diesen Eintrag gilt
  // /lifeskin als Social-Kandidat. Faellt der Netzabruf aus - und die
  // Besucher kommen aus einer Anzeige, oft im Mobilfunk - liefert der
  // Service Worker die gecachte Social-Shell aus, und der Kunde sieht ein
  // leeres Lokalprofil statt der Hautanalyse.
  const pfade = nichtSozialePfade();
  assert.ok(pfade.includes("/lifeskin"),
    "/lifeskin fehlt in NON_SOCIAL_NAVIGATION_PREFIXES");
  assert.ok(pfade.includes("/apps/lifeskin"),
    "/apps/lifeskin fehlt - die Dateien der Seite wuerden sonst ebenso behandelt");
});

test("Lifeskin wird nicht als Social-Shell zwischengespeichert", () => {
  const treffer = SW.match(/const SOCIAL_SHELL_ROUTE_PATHS = new Set\(\[([\s\S]*?)\]\)/);
  assert.ok(treffer, "SOCIAL_SHELL_ROUTE_PATHS nicht gefunden");
  const pfade = Array.from(treffer[1].matchAll(/'([^']+)'/g)).map((m) => m[1]);
  assert.ok(!pfade.includes("/lifeskin"),
    "Lifeskin darf die Social-Shell nicht auffrischen - es ist eine andere Seite");
});

test("die Route auf /lifeskin steht vor den Auffangregeln", () => {
  // Sonst faengt /:landingSlug sie ab und die Social-App haelt "lifeskin"
  // fuer den Namen eines Lokals.
  const rewrites = VERCEL.rewrites;
  const eigene = rewrites.findIndex((r) => r.source === "/lifeskin");
  const auffang = rewrites.findIndex((r) => String(r.source).includes(":landingSlug"));

  assert.ok(eigene >= 0, "Die Route /lifeskin fehlt in vercel.json");
  assert.ok(auffang >= 0, "Die Auffangregel fehlt - dann stimmt diese Pruefung nicht mehr");
  assert.ok(eigene < auffang,
    `Die eigene Route muss vor der Auffangregel stehen (${eigene} vs ${auffang})`);
  assert.equal(rewrites[eigene].destination, "/apps/lifeskin/index.html");
});

test("kein Redirect faengt /lifeskin vorher ab", () => {
  // Redirects laufen vor den Rewrites. Einer, der auf einen einteiligen
  // Pfad passt, wuerde die eigene Route nie zum Zuge kommen lassen.
  for (const redirect of VERCEL.redirects || []) {
    const quelle = String(redirect.source || "");
    if (quelle === "/lifeskin") {
      assert.fail(`Ein Redirect faengt /lifeskin ab: ${JSON.stringify(redirect)}`);
    }
  }
});

test("das gemessene Oval deckt sich mit dem gezeichneten", () => {
  // Der Fehler, an dem die Kamera im Betrieb gescheitert ist, hatte zwei
  // Haelften. Die eine war der Zuschnitt (object-fit: cover zeigte einen
  // Ausschnitt, gemessen wurde das ganze Bild). Die andere waere gewesen,
  // dass jemand spaeter das Oval im CSS verschiebt und die Rechnung nicht
  // mitzieht. Dann legt der Besucher sein Gesicht wieder woandershin, als
  // geprueft wird - und niemand sieht, warum es nicht geht.
  const css = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-styles.css"), "utf8");
  const app = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-app.js"), "utf8");

  const ring = css.match(/\.ls-oval__ring\s*\{([\s\S]*?)\}/);
  assert.ok(ring, ".ls-oval__ring nicht gefunden");
  const zahl = (name) => {
    const treffer = ring[1].match(new RegExp(`${name}:\\s*([0-9.]+)%`));
    assert.ok(treffer, `${name} im Ring nicht gefunden`);
    return Number(treffer[1]) / 100;
  };

  const ovalJs = app.match(/#oval\(bild\)\s*\{[\s\S]*?return \{([\s\S]*?)\};/);
  assert.ok(ovalJs, "#oval() nicht gefunden");
  const jsZahl = (name) => {
    const treffer = ovalJs[1].match(new RegExp(`${name}: bild\\.(?:width|height) \\* ([0-9.]+)`));
    assert.ok(treffer, `${name} in #oval() nicht gefunden`);
    return Number(treffer[1]);
  };

  assert.equal(jsZahl("x"), zahl("left"), "Die linke Kante weicht ab");
  assert.equal(jsZahl("y"), zahl("top"), "Die obere Kante weicht ab");
  assert.equal(jsZahl("w"), zahl("width"), "Die Breite weicht ab");
  assert.equal(jsZahl("h"), zahl("height"), "Die Hoehe weicht ab");
});

test("die Arbeitsleinwand ist versteckt, die Punkte nicht", () => {
  // Eine Spezifitaets-Kollision hatte die Verfolgungspunkte unsichtbar
  // gemacht: `.ls-kamera canvas { display:none }` ist staerker als
  // `.ls-netz { display:block }`, obwohl es weiter oben steht.
  const css = fs.readFileSync(path.join(process.cwd(), "apps/lifeskin/lifeskin-styles.css"), "utf8");
  assert.ok(!/\.ls-kamera canvas\s*\{[^}]*display:\s*none/.test(css),
    "`.ls-kamera canvas { display:none }` versteckt auch die Verfolgungspunkte");
  assert.ok(/#ls-leinwand\s*\{[^}]*display:\s*none/.test(css),
    "Die Arbeitsleinwand muss versteckt bleiben");
});
