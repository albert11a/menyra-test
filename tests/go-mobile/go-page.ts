// Die Handgriffe eines Gastes auf dem Telefon - einmal geschrieben.
//
// Jeder Fall in go-mobile.spec.ts benutzt dieselben Schritte: Stadt am
// Eingang waehlen, GO oeffnen, durch die drei Fragen, suchen, annehmen.

import { expect, type Page, type Locator } from "@playwright/test";

export const GO_SEARCH_TIMEOUT = 40_000;

export async function prepareGoPage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(globalThis, "__MENYRA_FIREBASE_EMULATORS__", {
      configurable: true,
      value: {
        enabled: true,
        projectId: "mnyra-local",
        host: "127.0.0.1",
        firestorePort: 8080,
        authPort: 9099,
        functionsPort: 5001,
      },
    });
  });
  // Fremde Adressen gibt es in diesem Netz nicht. Sie werden hier bedient,
  // damit ein Fall an einer Kartenbibliothek nicht scheitert, die mit GO
  // nichts zu tun hat.
  await page.route(
    /cdn\.tailwindcss\.com|cdn\.jsdelivr\.net|unpkg\.com/,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/javascript",
        body: "globalThis.tailwind = globalThis.tailwind || {};",
      }),
  );
}

export function collectPageProblems(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (error) =>
    problems.push(`pageerror: ${String(error).slice(0, 300)}`),
  );
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text().replace(/\s+/g, " ");
    if (
      /ERR_TUNNEL|ERR_CONNECTION|Failed to load resource|cloudfunctions\.net/.test(
        text,
      )
    )
      return;
    problems.push(`console: ${text.slice(0, 300)}`);
  });
  return problems;
}

export async function passLocationGate(page: Page, city = "Prishtina") {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const input = page.locator("input[placeholder*='qytetin' i]").first();
  await input.waitFor({ timeout: 20_000 });
  await input.fill(city);
  const suggestion = page.locator("button", { hasText: city }).first();
  await suggestion.waitFor({ timeout: 10_000 });
  await suggestion.click();
  await page
    .locator("[data-main-header-tab='go']")
    .waitFor({ timeout: 20_000 });
}

export async function openGoPage(page: Page) {
  await page.locator("[data-main-header-tab='go']").click();
  await page.locator("[data-go-step]").first().waitFor({ timeout: 20_000 });
}

export async function runWizard(
  page: Page,
  {
    party = 2,
    intent = "unsure",
    city = "",
  }: { party?: number; intent?: string; city?: string } = {},
) {
  await page.locator(`[data-go-wheel-pick='${party}']`).click();
  await page.locator("[data-go-step-next]").click();
  await page.locator(`[data-go-intent='${intent}']`).click();
  await page.locator("[data-go-step='place']").waitFor({ timeout: 10_000 });
  if (city) {
    const chip = page.locator(`[data-go-city='${city}']`);
    if (await chip.count()) {
      await chip.first().click();
    } else {
      await page.locator("[data-go-change-city]").first().click();
      const field = page.locator("[data-go-city-input]").first();
      await field.fill(city);
      await page.locator("[data-go-city-save]").first().click();
    }
  }
}

/** Die Suche starten und warten, bis der Knopf zu den Ergebnissen dasteht. */
export async function search(page: Page) {
  await page.locator("[data-go-submit]").click();
  await page
    .locator("[data-go-live-open]")
    .waitFor({ state: "visible", timeout: GO_SEARCH_TIMEOUT });
}

export async function openResults(page: Page) {
  await page.locator("[data-go-live-open]").click();
  await page.locator("[data-go-view]").first().waitFor({ timeout: 15_000 });
}

export function resultCards(page: Page): Locator {
  return page.locator("[data-go-result]");
}

export async function currentView(page: Page) {
  return page
    .locator("[data-go-view]")
    .first()
    .getAttribute("data-go-view", { timeout: 3000 })
    .catch(() => null);
}

/**
 * Den Wisch ziehen, der die Oferta im Lokal aktiviert.
 *
 * Langsam genug, dass der Browser jede Zwischenstellung sieht - ein Sprung
 * von links nach rechts ist kein Wisch, sondern ein Sprung.
 */
export async function swipeToActivate(page: Page) {
  const track = page.locator("[data-go-swipe]").first();
  await track.waitFor({ timeout: 30_000 });
  // Erst in den sichtbaren Bereich holen: Liegt die Bahn unter der Kopfzeile,
  // trifft der Finger die Kopfzeile - das ist ein eigener Fall (siehe
  // expectReachableByFinger) und nicht der Wisch, der hier geprueft wird.
  await track.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await track.boundingBox();
  if (!box) throw new Error("Die Wisch-Bahn steht nicht auf dem Bildschirm.");
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 30, y);
  await page.mouse.down();
  for (let step = 1; step <= 20; step += 1) {
    await page.mouse.move(box.x + 30 + ((box.width - 40) * step) / 20, y);
    await page.waitForTimeout(15);
  }
  await page.mouse.up();
}

/**
 * Liegt etwas unter einem anderen Element, trifft der Daumen das andere.
 *
 * Gemessen wird auf der Mittellinie - links, in der Mitte, rechts. Nicht an
 * den Ecken des Rechtecks: Ein Bedienteil mit runden Enden fuellt die eigenen
 * Ecken gar nicht aus, dort schaut immer der Untergrund durch. Das waere
 * kein Befund, sondern Geometrie.
 */
export async function expectReachableByFinger(page: Page, selector: string) {
  const result = await page.evaluate((sel) => {
    const node = document.querySelector(sel);
    if (!node) return { found: false, covered: [] as string[] };
    const rect = node.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const points: Array<[number, number]> = [
      [rect.left + rect.width / 2, y],
      [rect.left + Math.min(30, rect.width / 4), y],
      [rect.right - Math.min(30, rect.width / 4), y],
    ];
    const covered = points
      .map(([x, py]) => {
        const hit = document.elementFromPoint(Math.round(x), Math.round(py));
        // Kein Treffer heisst: Der Punkt liegt gar nicht im Bild. Das ist
        // schlimmer als verdeckt, nicht besser.
        if (!hit) return "ausserhalb des Bildes";
        if (hit === node || node.contains(hit)) return "";
        return `${hit.tagName}.${String(hit.className).slice(0, 40)}`;
      })
      .filter(Boolean) as string[];
    return { found: true, covered };
  }, selector);
  expect(result.found, `${selector} steht nicht auf der Seite`).toBe(true);
  expect(
    result.covered,
    `${selector} liegt unter: ${result.covered.join(", ")}`,
  ).toEqual([]);
}

/** Kein waagrechtes Rutschen: Auf einem Telefon ist das immer ein Fehler. */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    widest: Array.from(document.querySelectorAll("[data-go-page] *"))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          right: Math.round(rect.right),
          tag: node.tagName,
          cls: String(node.className).slice(0, 60),
        };
      })
      .filter((entry) => entry.right > document.documentElement.clientWidth + 1)
      .slice(0, 5),
  }));
  expect(
    overflow.scrollWidth,
    `Seite ist breiter als der Bildschirm: ${JSON.stringify(overflow.widest)}`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/** Was ein Daumen treffen muss, ist mindestens 44x44 CSS-Pixel gross. */
export async function findSmallTapTargets(page: Page, minSize = 44) {
  return page.evaluate((min) => {
    const selector =
      "[data-go-page] button, [data-go-page] a, [data-go-page] [role='option']";
    return Array.from(document.querySelectorAll(selector))
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          text: (node.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 40),
          cls: String(node.className).slice(0, 70),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          visible:
            rect.width > 0 &&
            rect.height > 0 &&
            style.visibility !== "hidden" &&
            style.display !== "none",
        };
      })
      .filter(
        (entry) => entry.visible && (entry.width < min || entry.height < min),
      );
  }, minSize);
}

/** iOS zoomt in jedes Feld, dessen Schrift kleiner als 16px ist. */
export async function findZoomingInputs(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("input, textarea, select"))
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map((node) => ({
        selector: node.tagName.toLowerCase() + (node.id ? `#${node.id}` : ""),
        placeholder: (node as HTMLInputElement).placeholder || "",
        fontSize: parseFloat(getComputedStyle(node).fontSize),
      }))
      .filter((entry) => entry.fontSize < 16),
  );
}
