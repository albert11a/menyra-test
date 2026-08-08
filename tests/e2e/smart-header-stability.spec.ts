import { expect, test, type Page } from "@playwright/test";

// ===========================================================================
// Was der Header beim Scrollen aushalten muss
//
// Auf dem Geraet (Chrome iOS) stand ueber der Kopfzeile ein rund 23px hohes
// Band, in dem der Seiteninhalt durchschien - genau die Hoehe ihrer
// Safe-Area-Polsterung. Die Geometrie war dabei nachweislich in Ordnung: die
// Kopfzeile stand, wo sie hingehoert. Es war ein Mal-Fehler, und der entsteht
// dort, wo die klebende Kopfzeile mitten im Wischen aus dem Renderbaum
// genommen und neu aufgebaut wird.
//
// Deshalb pruefen diese Faelle auf beiden Engines:
//  1. Der Header-Knoten ueberlebt einen Neuaufbau als DERSELBE Knoten.
//  2. Ueber seiner Oberkante ist nie Platz fuer Seiteninhalt.
//  3. Seine Hoehe aendert sich beim Scrollen nicht.
//
// WebKit ist hier nicht optional: die Engine, auf der der Fehler auftrat, ist
// die von jedem iPhone - auch in Chrome.
// ===========================================================================

const FIXTURE = "/tests/e2e/fixtures/smart-header-fixture.html";

// Die Form, die renderMainShell() baut: eine Huelle, darin der Drawer (fixed,
// also ohne Platz im Fluss), die klebende Kopfzeile und der Inhalt. Dass die
// echte Shell wirklich so aussieht, haelt der letzte Fall in dieser Datei
// fest - er laesst renderMainCore selbst bauen und liest das Ergebnis mit dem
// Parser des Browsers.
function shellMarkup(inhalt: string): string {
  return `
    <div class="app-shell bg-slate-50 text-slate-900 max-w-md mx-auto md:shadow-2xl relative font-sans">
      <div id="drawerRoot" aria-hidden="true" class="fixed inset-0 z-[2000] overflow-hidden invisible pointer-events-none"></div>
      <div class="smart-header-shell">
        <div id="smart-header-top" class="smart-header-top">
          <div class="px-5 h-16 flex items-center justify-between">
            <div class="smart-header-lead flex items-center gap-3">
              <button id="drawerToggle" type="button">Menu</button>
              <b>Shpija e</b>
            </div>
            <div class="smart-header-actions flex shrink-0 items-center gap-1.5">
              <button type="button">Sprache</button>
              <button type="button">Korb</button>
            </div>
          </div>
        </div>
      </div>
      <main class="app-main-scroll app-main-scroll--with-smart-header">
        <div id="storyRow" style="height:96px;margin:0 1.5rem;border-radius:16px;background:linear-gradient(90deg,#4f46e5,#a5b4fc)"></div>
        <div id="inhalt">${inhalt}</div>
        <div style="height:2400px;background:repeating-linear-gradient(#fff,#fff 40px,#eef 40px,#eef 80px);margin:0 1.5rem"></div>
      </main>
    </div>
  `;
}

async function mountFixture(page: Page): Promise<void> {
  await page.goto(FIXTURE);
  await page.waitForFunction(() => (window as any).__fixtureBereit || (window as any).__fixtureFehler);
  const fehler = await page.evaluate(() => (window as any).__fixtureFehler || "");
  expect(fehler, "Fixture laedt Header-CSS und Controller").toBe("");
}

// Baut den echten Controller auf dem echten Dokument und setzt frisches Markup
// ein - genau der Griff, den der Render-Pfad macht.
async function renderZweimal(page: Page, erst: string, zweit: string) {
  return page.evaluate(
    ({ ersteShell, zweiteShell }) => {
      const app = document.getElementById("app")!;
      app.innerHTML = ersteShell;

      const controller = (window as any).__erzeugeController({
        state: { activeTab: "profile", userProfile: {}, notifications: [], shopCart: { items: [] } },
        documentObj: document,
        windowObj: window,
        escapeHtml: (v = "") => String(v || ""),
        icon: (name = "") => `<svg data-icon="${name}"></svg>`,
        isGuestSession: () => false,
        getChatUnreadCount: () => 0,
        resolveHeaderBranding: () => ({ title: "MNYRA", subtitle: "", logoUrl: "", isBusinessLogo: false }),
        logoFitClass: () => "object-cover"
      });

      const vorher = document.querySelector(".smart-header-shell");
      const angewendet = controller.applyAppHtmlKeepingHeader(app, zweiteShell);
      const nachher = document.querySelector(".smart-header-shell");

      return {
        angewendet,
        derselbeKnoten: vorher === nachher,
        headerNochImDokument: !!nachher && document.contains(nachher),
        inhalt: document.getElementById("inhalt")?.textContent || ""
      };
    },
    { ersteShell: shellMarkup(erst), zweiteShell: shellMarkup(zweit) }
  );
}

test("die Kopfzeile ueberlebt einen Neuaufbau als derselbe Knoten", async ({ page }) => {
  await mountFixture(page);
  const ergebnis = await renderZweimal(page, "erster Stand", "zweiter Stand");

  expect(ergebnis.angewendet, "der Einbau ohne innerHTML hat gegriffen").toBe(true);
  expect(ergebnis.derselbeKnoten, "der Header ist derselbe Knoten geblieben").toBe(true);
  expect(ergebnis.headerNochImDokument, "der Header hat den Renderbaum nie verlassen").toBe(true);
  expect(ergebnis.inhalt, "der Inhalt darunter ist trotzdem der neue").toBe("zweiter Stand");
});

test("ueber der Oberkante der Kopfzeile ist nie Platz fuer Seiteninhalt", async ({ page }) => {
  await mountFixture(page);
  await renderZweimal(page, "erster Stand", "zweiter Stand");

  for (const y of [0, 120, 400, 1200]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
    const messung = await page.evaluate(() => {
      const header = document.querySelector(".smart-header-shell")!;
      const r = header.getBoundingClientRect();
      return { top: r.top, hoehe: r.height, position: getComputedStyle(header).position };
    });
    expect(messung.position).toBe("sticky");
    expect(messung.hoehe, `Header hat bei ${y}px eine Hoehe`).toBeGreaterThan(0);
    // Steht die Oberkante unter dem Bildrand, ist genau dort das Band, in dem
    // auf dem Geraet der Inhalt durchschien.
    expect(messung.top, `Header klebt bei ${y}px oben`).toBeLessThanOrEqual(0.5);
  }
});

test("die Hoehe der Kopfzeile aendert sich beim Scrollen nicht", async ({ page }) => {
  await mountFixture(page);
  await renderZweimal(page, "erster Stand", "zweiter Stand");

  const hoehen: number[] = [];
  for (const y of [0, 200, 600, 1500, 0]) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(80);
    hoehen.push(
      await page.evaluate(() => document.querySelector(".smart-header-shell")!.getBoundingClientRect().height)
    );
  }

  // Eine Kopfzeile, die mitten im Wischen ihre Hoehe aendert, kann der
  // Compositor nicht sauber nachziehen - dann fehlt oben ein Band.
  for (const hoehe of hoehen) expect(hoehe).toBeCloseTo(hoehen[0], 1);
});

// Das klebende Element ist das, aus dem der Browser die eigene Ebene baut.
// War es durchsichtig, musste der Compositor es gegen den Inhalt dahinter
// blenden statt ihn zu ueberdecken - und wo dabei etwas fehlte, sah man den
// Inhalt. Deckend kann dort nichts mehr durch.
test("die klebende Kopfzeile malt selbst deckend", async ({ page }) => {
  await mountFixture(page);
  await renderZweimal(page, "erster Stand", "zweiter Stand");

  const farbe = await page.evaluate(
    () => getComputedStyle(document.querySelector(".smart-header-shell")!).backgroundColor
  );

  expect(farbe, "die Shell selbst hat einen Hintergrund").not.toBe("rgba(0, 0, 0, 0)");
  expect(farbe, "und der ist ganz deckend, nicht halb").not.toMatch(/^rgba\(/);
});

// Der Grund, warum die Hoehe ueberhaupt wandern konnte: iOS aendert
// env(safe-area-inset-top) waehrend des Scrollens, sobald die Adressleiste
// ein- oder ausfaehrt. Seit die Polsterung an der eingefrorenen Variable
// haengt, kann das die Kopfzeile nicht mehr erreichen.
test("die lebende Safe-Area bewegt die Hoehe der Kopfzeile nicht mehr", async ({ page }) => {
  await mountFixture(page);
  await renderZweimal(page, "erster Stand", "zweiter Stand");

  const messung = await page.evaluate(() => {
    const wurzel = document.documentElement;
    const header = document.querySelector(".smart-header-shell")!;
    const hoehe = () => header.getBoundingClientRect().height;

    // So sieht es aus, nachdem das Boot-Skript gemessen hat.
    wurzel.style.setProperty("--smart-header-safe-top", "23px");
    const eingefroren = hoehe();

    // Und das macht iOS mitten im Wischen.
    wurzel.style.setProperty("--safe-area-top", "47px");
    const nachSafeAreaWechsel = hoehe();

    // Gegenprobe: an der eingefrorenen Variable haengt sie sehr wohl - sonst
    // wuerde der Test auch dann gruen sein, wenn die Polsterung ganz fehlt.
    wurzel.style.setProperty("--smart-header-safe-top", "60px");
    const nachEingefrorenemWechsel = hoehe();

    return { eingefroren, nachSafeAreaWechsel, nachEingefrorenemWechsel };
  });

  expect(messung.nachSafeAreaWechsel, "die lebende Safe-Area erreicht die Hoehe nicht mehr").toBeCloseTo(
    messung.eingefroren,
    1
  );
  expect(
    messung.nachEingefrorenemWechsel,
    "an der eingefrorenen Variable haengt sie aber weiterhin"
  ).toBeGreaterThan(messung.eingefroren);
});

// Der alte Weg zum Vergleich: schuettet man das Markup ueber #app, ist die
// Kopfzeile hinterher ein anderer Knoten - auch dann, wenn man den alten
// danach wieder einhaengt. Das sind zwei Wechsel im Renderbaum statt keinem,
// und genau deshalb gibt es applyAppHtmlKeepingHeader.
test("der Weg ueber innerHTML verliert den Knoten - deshalb gibt es den neuen", async ({ page }) => {
  await mountFixture(page);

  const ergebnis = await page.evaluate(
    ({ ersteShell, zweiteShell }) => {
      const app = document.getElementById("app")!;
      app.innerHTML = ersteShell;
      const vorher = document.querySelector(".smart-header-shell");

      app.innerHTML = zweiteShell;
      const nachInnerHtml = document.querySelector(".smart-header-shell");

      // Auch das nachtraegliche Wiedereinhaengen macht es nicht ungeschehen:
      // der Knoten war zwischendurch draussen.
      const warDraussen = !document.contains(vorher!);
      nachInnerHtml!.replaceWith(vorher!);

      return { derselbeKnotenNachInnerHtml: vorher === nachInnerHtml, warDraussen };
    },
    { ersteShell: shellMarkup("erster Stand"), zweiteShell: shellMarkup("zweiter Stand") }
  );

  expect(ergebnis.derselbeKnotenNachInnerHtml, "innerHTML baut die Kopfzeile neu").toBe(false);
  expect(ergebnis.warDraussen, "und der alte Knoten war dabei aus dem Dokument").toBe(true);
});

// Die Form der Shell ist eine Zusage, keine Zufaelligkeit: applyAppHtml-
// KeepingHeader kann nur kindweise einsetzen, solange die Kopfzeile ein
// direktes Kind der einen Huelle ist. Aendert sich das, faellt der Render-Pfad
// still auf innerHTML zurueck - und der Riss koennte wiederkommen, ohne dass
// es jemand merkt.
test("die echte Shell haelt die Form, auf die der Einbau baut", async ({ page }) => {
  await mountFixture(page);

  const form = await page.evaluate(async () => {
    const mod = await import("/apps/menyra-social/core/ui/main-shell-render-utils.js");
    const markup = (mod as any).renderMainCore({
      state: { activeTab: "profile", profileView: { profile: { role: "business" } } },
      renderDrawerFn: () => `<div id="drawerRoot" class="fixed inset-0"></div>`,
      renderHeaderFn: () => `<div class="smart-header-shell"><div id="smart-header-top"></div></div>`,
      renderBusinessTopTabsFn: () => "",
      renderProfileViewFn: () => `<div id="profileView">Profil</div>`
    });

    const buehne = document.createElement("div");
    buehne.innerHTML = markup;
    const huelle = buehne.firstElementChild;
    const header = buehne.querySelector(".smart-header-shell");
    return {
      wurzeln: buehne.children.length,
      huelleIstAppShell: !!huelle?.classList.contains("app-shell"),
      headerIstDirektesKind: header?.parentElement === huelle,
      reihenfolge: Array.from(huelle?.children || []).map((kind) =>
        kind.tagName === "MAIN" ? "main" : (kind.id || kind.className.split(" ")[0])
      )
    };
  });

  expect(form.wurzeln, "genau eine Wurzel, sonst gibt es keine Huelle zum Einsetzen").toBe(1);
  expect(form.huelleIstAppShell, "und das ist .app-shell").toBe(true);
  expect(form.headerIstDirektesKind, "die Kopfzeile steckt in keinem Wrapper").toBe(true);
  expect(form.reihenfolge, "Drawer, Kopfzeile, Inhalt - in dieser Reihenfolge").toEqual([
    "drawerRoot",
    "smart-header-shell",
    "main"
  ]);
});
