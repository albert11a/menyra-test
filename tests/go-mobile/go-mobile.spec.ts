// Mnyra GO auf dem Telefon - die Faelle, die dem Gast und dem Lokal wehtun.
//
// Jeder Fall geht denselben Weg, den ein Gast geht: Stadt am Eingang, GO
// oeffnen, drei Fragen, suchen, annehmen, aktivieren. Was dabei in der
// Datenbank entsteht, wird mitgeprueft - eine Buchung ist eine Zusage, und
// eine doppelte Zusage kostet das Lokal einen Tisch.

import { expect, test } from "@playwright/test";
import {
  collectPageProblems,
  currentView,
  expectNoHorizontalOverflow,
  expectReachableByFinger,
  findSmallTapTargets,
  findZoomingInputs,
  openGoPage,
  openResults,
  passLocationGate,
  prepareGoPage,
  resultCards,
  runWizard,
  search,
  swipeToActivate,
} from "./go-page";
import { listGoBookings, resetGoRuntimeData, setOfferLimits } from "./go-admin";

test.beforeEach(async ({ page }) => {
  await resetGoRuntimeData();
  await prepareGoPage(page);
});

test("Der ganze Weg: suchen, annehmen, aktivieren", async ({
  page,
}, testInfo) => {
  const problems = collectPageProblems(page);
  await passLocationGate(page);
  await openGoPage(page);
  await expectNoHorizontalOverflow(page);
  await testInfo.attach("01-frage-1", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await expectNoHorizontalOverflow(page);
  await search(page);
  await testInfo.attach("02-suche-fertig", {
    body: await page.screenshot(),
    contentType: "image/png",
  });
  await openResults(page);

  await expect(resultCards(page).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await testInfo.attach("03-ergebnisse", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await expectNoHorizontalOverflow(page);
  await testInfo.attach("04-buchung", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  const bookings = await listGoBookings("bro-pizza");
  expect(bookings.length, "genau eine Buchung").toBe(1);
  expect(String(bookings[0].status)).toBe("accepted");

  // Aktivieren: der Wisch im Lokal. Vorher die Frage, ob der Daumen ihn
  // ueberhaupt erreicht - eine Bahn unter der Kopfzeile nimmt keinen Finger an.
  await expectReachableByFinger(page, "[data-go-swipe]");
  await swipeToActivate(page);
  await page.locator("[data-go-page]").first().waitFor();
  await page.waitForTimeout(4000);
  await testInfo.attach("05-aktiviert", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  const afterActivation = await listGoBookings("bro-pizza");
  expect(afterActivation.length).toBe(1);
  expect(
    String(afterActivation[0].status),
    "nach dem Wisch ist die Buchung aktiviert",
  ).toBe("activated");
  const text = (
    await page.locator("[data-go-page]").first().innerText()
  ).replace(/\s+/g, " ");
  expect(text, "der Code steht auf der Karte").toMatch(/[A-Z0-9]{4,}/);

  expect(problems, "keine Ausnahme im Browser").toEqual([]);
});

test("Die Stadt vom Eingang kommt in GO an", async ({ page }) => {
  const payloads: string[] = [];
  page.on("request", (request) => {
    if (/us-central1\/goSearch/.test(request.url()))
      payloads.push(request.postData() || "");
  });
  await passLocationGate(page, "Prishtina");
  await openGoPage(page);

  const placeStepText = await page
    .locator("[data-go-page]")
    .first()
    .innerText();
  await runWizard(page, { party: 2, intent: "unsure" });
  await search(page);

  expect(payloads.length).toBeGreaterThan(0);
  const request = JSON.parse(payloads[0]).data.request;
  expect(
    String(request.city || ""),
    `GO sucht ohne Stadt, obwohl der Gast sie am Eingang gewaehlt hat. Schritt "Ku?" zeigt: ${placeStepText.slice(0, 200)}`,
  ).toBe("Prishtina");
});

test("Doppeltipp auf Annehmen erzeugt keine zweite Buchung", async ({
  page,
}) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);

  const accept = page.locator("[data-go-accept]").first();
  await accept.click({ force: true });
  await accept.click({ force: true, timeout: 2000 }).catch(() => {});
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(2500);

  const bookings = await listGoBookings("bro-pizza");
  expect(bookings.length, "zwei Tipps, eine Buchung").toBe(1);
});

test("Netz weg beim Buchen: keine stille Doppelbuchung", async ({
  page,
  context,
}) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);

  // Der erste Versuch faellt ins Leere: Die Anfrage geht hinaus, die Antwort
  // kommt nie. Genau der Fall, in dem ein Browser nicht weiss, ob gebucht ist.
  await context.setOffline(true);
  await page.locator("[data-go-accept]").first().click();
  await page.waitForTimeout(6000);
  const offlineText = (
    await page.locator("[data-go-page]").first().innerText()
  ).replace(/\s+/g, " ");
  await context.setOffline(false);

  expect(offlineText, "der Gast sieht einen Satz, keinen Code").not.toMatch(
    /^\s*$/,
  );

  // Zweiter Versuch, sobald das Netz wieder da ist.
  const retry = page.locator("[data-go-retry], [data-go-accept]").first();
  if (await retry.count()) await retry.click().catch(() => {});
  await page.waitForTimeout(8000);

  const bookings = await listGoBookings("bro-pizza");
  expect(
    bookings.length,
    `hoechstens eine Buchung, Text war: ${offlineText.slice(0, 200)}`,
  ).toBeLessThanOrEqual(1);
});

test("Ausverkauft: das letzte Angebot geht nur einmal", async ({
  page,
  browser,
}) => {
  await setOfferLimits("bro-pizza", "go-offer-scarce", {
    dailyGroups: 1,
    total: 1,
  });
  await setOfferLimits("bro-pizza", "go-offer-pizza", {
    dailyGroups: 0,
    total: 0,
  });
  await setOfferLimits("bro-pizza", "go-offer-coffee", {
    dailyGroups: 0,
    total: 0,
  });

  // Erster Gast nimmt.
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });

  // Zweiter Gast, eigenes Telefon.
  const secondContext = await browser.newContext({
    locale: "sq-AL",
    timezoneId: "Europe/Belgrade",
  });
  const second = await secondContext.newPage();
  await prepareGoPage(second);
  await passLocationGate(second);
  await openGoPage(second);
  await runWizard(second, { party: 2, intent: "unsure", city: "Prishtina" });
  await second.locator("[data-go-submit]").click();
  await second
    .locator("[data-go-live-open]")
    .waitFor({ state: "visible", timeout: 40_000 });
  await second.locator("[data-go-live-open]").click();
  await second.waitForTimeout(1500);
  const secondText = (
    await second.locator("[data-go-page]").first().innerText()
  ).replace(/\s+/g, " ");
  await secondContext.close();

  const bookings = await listGoBookings("bro-pizza");
  expect(
    bookings.length,
    `nur eine Buchung; zweiter Gast sah: ${secondText.slice(0, 200)}`,
  ).toBe(1);
});

test("Ohne Speicher im Browser (privater Modus) bleibt GO benutzbar", async ({
  page,
}) => {
  const problems = collectPageProblems(page);
  await page.addInitScript(() => {
    const boom = () => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    };
    try {
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        get: () => ({
          getItem: boom,
          setItem: boom,
          removeItem: boom,
          clear: boom,
          key: boom,
          length: 0,
        }),
      });
    } catch {
      /* nicht ueberschreibbar */
    }
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const goPill = page.locator("[data-main-header-tab='go']");
  const gate = page.locator("input[placeholder*='qytetin' i]");
  const reachable = (await goPill.count()) > 0 || (await gate.count()) > 0;
  expect(
    reachable,
    `Die App zeigt ohne localStorage nichts mehr. Fehler: ${problems.join(" | ").slice(0, 400)}`,
  ).toBe(true);
});

test("Fingerziele und Schriftgroessen auf allen drei GO-Ansichten", async ({
  page,
}, testInfo) => {
  await passLocationGate(page);
  await openGoPage(page);

  const report: Record<string, unknown> = {};
  const check = async (name: string) => {
    const small = await findSmallTapTargets(page);
    const zooming = await findZoomingInputs(page);
    report[name] = { small, zooming };
    expect(small, `${name}: zu kleine Ziele ${JSON.stringify(small)}`).toEqual(
      [],
    );
    expect(
      zooming,
      `${name}: iOS zoomt in diese Felder ${JSON.stringify(zooming)}`,
    ).toEqual([]);
  };

  await check("Formular");
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await check("Formular, letzter Schritt");
  await search(page);
  await openResults(page);
  await check("Ergebnisse");
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await check("Buchung");

  await testInfo.attach("fingerziele", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
});

test("Zurueck-Taste fuehrt zurueck ins Qyteti, nicht aus der App", async ({
  page,
}) => {
  await passLocationGate(page);
  const feedUrl = page.url();
  await openGoPage(page);
  const goUrl = page.url();
  expect(goUrl, "GO hat eine eigene Adresse").not.toBe(feedUrl);

  await page.evaluate(() => window.history.back());
  await page.waitForTimeout(3000);

  const url = page.url();
  const bodyText = (
    await page
      .locator("body")
      .innerText()
      .catch(() => "")
  ).replace(/\s+/g, " ");
  expect(
    url,
    `Nach Zurueck steht der Gast auf "${url}" (Text: ${bodyText.length} Zeichen). Der Wechsel auf die GO-Pille legt keinen Schritt im Verlauf an - die Zurueck-Taste fuehrt aus Mnyra heraus.`,
  ).toContain("127.0.0.1:5173");
  expect(bodyText.length, "nach Zurueck steht wieder etwas da").toBeGreaterThan(
    40,
  );
});

test("Schnelles Tippen: die gewaehlte Gruppengroesse bleibt stehen", async ({
  page,
}) => {
  const payloads: string[] = [];
  page.on("request", (request) => {
    if (/us-central1\/goSearch/.test(request.url()))
      payloads.push(request.postData() || "");
  });
  await passLocationGate(page);
  await openGoPage(page);

  // Ein Daumen wartet nicht: tippen und sofort weiter.
  await page.locator("[data-go-wheel-pick='4']").click();
  await page.locator("[data-go-step-next]").click();
  await page.locator("[data-go-intent='unsure']").click();
  await page.locator("[data-go-step='place']").waitFor({ timeout: 10_000 });
  await search(page);
  await openResults(page);
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1500);

  const sent = JSON.parse(payloads[0] || "{}")?.data?.request?.partySize;
  const bookings = await listGoBookings("bro-pizza");
  const booked = bookings[0]?.partySizeRequested;
  expect(sent, "die Suche geht mit der gewaehlten Zahl hinaus").toBe(4);
  expect(booked, "die Buchung traegt die gewaehlte Zahl").toBe(4);
});

test("Keine erfundene Entfernung auf der Angebotskarte", async ({ page }) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);
  const card = (await resultCards(page).first().innerText()).replace(
    /\s+/g,
    " ",
  );
  const distance = card.match(/([\d.,]+)\s*km/);
  const value = distance ? Number(String(distance[1]).replace(",", ".")) : 0;
  expect(
    value,
    `Die Karte zeigt "${distance?.[0] || ""}" - ein Lokal in derselben Stadt kann nicht so weit weg sein.`,
  ).toBeLessThan(100);
});

test("Der Streifen zur laufenden Oferta ist antippbar", async ({ page }) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await page.locator("[data-main-header-tab='feed']").click();
  await page.waitForTimeout(3000);

  const sticky = await page.evaluate(() => {
    const node = document
      .getElementById("mnyraGoSticky")
      ?.querySelector("button");
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const hit = document.elementFromPoint(
      Math.round(rect.left + rect.width / 2),
      Math.round(rect.top + rect.height / 2),
    );
    return {
      zIndex: getComputedStyle(node).zIndex,
      covered: !(hit && (hit === node || node.contains(hit))),
      cover: hit ? `${hit.tagName}.${String(hit.className).slice(0, 50)}` : "",
    };
  });
  expect(
    sticky,
    "der Streifen steht da, solange eine Oferta laeuft",
  ).not.toBeNull();
  expect(
    sticky?.covered,
    `Der Streifen liegt unter ${sticky?.cover} (z-index: ${sticky?.zIndex}).`,
  ).toBe(false);
});

test("Nach dem Annehmen steht die Wisch-Bahn im Bild", async ({
  page,
}, testInfo) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  await testInfo.attach("nach-dem-annehmen", {
    body: await page.screenshot(),
    contentType: "image/png",
  });

  const geometry = await page.evaluate(() => {
    const track = document.querySelector("[data-go-swipe]");
    const rect = track!.getBoundingClientRect();
    const header = document.querySelector("header");
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    return {
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      viewport: window.innerHeight,
      headerBottom: Math.round(headerBottom),
      scrollY: Math.round(window.scrollY),
    };
  });
  expect(
    geometry.top,
    `Die Bahn liegt bei ${geometry.top}px, die Kopfzeile endet bei ${geometry.headerBottom}px (Seite steht bei ${geometry.scrollY}px).`,
  ).toBeGreaterThanOrEqual(geometry.headerBottom);
  expect(
    geometry.bottom,
    `Die Bahn endet bei ${geometry.bottom}px, das Bild ist ${geometry.viewport}px hoch.`,
  ).toBeLessThanOrEqual(geometry.viewport);
});

test("Der Gast kann seine Oferta wieder absagen", async ({ page }) => {
  await passLocationGate(page);
  await openGoPage(page);
  await runWizard(page, { party: 2, intent: "unsure", city: "Prishtina" });
  await search(page);
  await openResults(page);
  await page.locator("[data-go-accept]").first().click();
  await page.locator("[data-go-swipe]").waitFor({ timeout: 30_000 });

  const before = await listGoBookings("bro-pizza");
  expect(before.length).toBe(1);

  await page.locator("[data-go-cancel]").first().click();
  await page
    .locator("[data-go-cancel-confirm]")
    .first()
    .waitFor({ timeout: 10_000 });
  await page.locator("[data-go-cancel-confirm]").first().click();
  await page.waitForTimeout(5000);

  const after = await listGoBookings("bro-pizza");
  expect(
    after.length,
    "die Buchung bleibt stehen, sie wechselt nur den Zustand",
  ).toBe(1);
  expect(String(after[0].status), "abgesagt heisst abgesagt").toBe("cancelled");

  // Und der Platz ist wieder frei: Die Karte im Qyteti darf nichts mehr zeigen.
  await page.locator("[data-main-header-tab='feed']").click();
  await page.waitForTimeout(3000);
  const feedText = (await page.locator("body").innerText()).replace(
    /\s+/g,
    " ",
  );
  expect(
    feedText,
    "nach der Absage steht keine laufende Oferta mehr im Qyteti",
  ).not.toContain("1 aktive");
});
