// Mnyra GO im Lokal - was der Wirt auf seinem Telefon sieht.
//
// Der Weg des Geldes laeuft hier entlang: Der Gast zeigt seinen Code, das
// Lokal tippt ihn ein, bestaetigt die Gruppengroesse - und erst dann entsteht
// eine Gebuehr. Was diese Faelle pruefen, ist deshalb nicht nur die
// Oberflaeche, sondern auch die Zeile im Hauptbuch.

import { expect, test, type Page } from "@playwright/test";
import {
  collectPageProblems,
  passLocationGate,
  prepareGoPage,
} from "./go-page";
import {
  db,
  listGoBookings,
  listGoLedger,
  resetGoRuntimeData,
} from "./go-admin";

const OWNER_EMAIL = "bropizza@mnyra.com";
const OWNER_PASSWORD = "Bropizza1992";

async function signInAsOwner(page: Page) {
  await passLocationGate(page);
  await page.locator("#drawerToggle").first().click();
  await page
    .locator("button:has-text('Login / Regjistrohu')")
    .first()
    .click({ timeout: 15_000 });
  await page
    .locator("input[type=password]")
    .first()
    .waitFor({ timeout: 20_000 });
  await page.locator("input[placeholder*='Email' i]").first().fill(OWNER_EMAIL);
  await page.locator("input[type=password]").first().fill(OWNER_PASSWORD);
  await page
    .locator("button:visible")
    .filter({ hasText: /Vazhdo/i })
    .first()
    .click();
  await page.locator("[data-go-business-card]").waitFor({ timeout: 40_000 });
}

/** Eine laufende Buchung, ohne den Umweg ueber ein zweites Telefon. */
async function createBookingViaApi(partySize = 3, offerId = "go-offer-pizza") {
  const base = "http://127.0.0.1:5001/mnyra-local/us-central1";
  const session = await fetch(`${base}/goEnsureGuestSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: {} }),
  }).then((response) => response.json());
  const guestToken = session?.result?.guestToken || "";
  const created = await fetch(`${base}/goCreateBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        offerId,
        restaurantId: "bro-pizza",
        request: { city: "Prishtina", partySize },
        idempotencyKey: `e2e-${Date.now()}`,
        guestToken,
      },
    }),
  }).then((response) => response.json());
  const booking = created?.result?.booking;
  const bookingToken = created?.result?.bookingToken || "";
  if (!booking?.id || !bookingToken) {
    throw new Error(
      `Buchung fehlgeschlagen: ${JSON.stringify(created).slice(0, 200)}`,
    );
  }
  const activated = await fetch(`${base}/goActivateBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { bookingToken, guestToken } }),
  }).then((response) => response.json());
  const shortCode = activated?.result?.booking?.shortCode || "";
  if (!shortCode) throw new Error("Kein Code nach dem Aktivieren.");
  return { bookingId: booking.id, shortCode, partySize };
}

test.beforeEach(async ({ page }) => {
  await resetGoRuntimeData();
  await db
    .collection("restaurants")
    .doc("bro-pizza")
    .collection("goCapacity")
    .doc("x")
    .delete()
    .catch(() => {});
  await prepareGoPage(page);
});

/**
 * Den Code eintippen, bis das Panel die Buchung zeigt.
 *
 * Ein zweiter Versuch ist erlaubt: Das Panel zeichnet neu, sobald sein
 * Firestore-Stand eintrifft, und ein Tastendruck genau dazwischen geht
 * verloren. Bleibt es auch danach leer, nennt die Meldung, was auf dem
 * Schirm stand.
 */
async function findCodeInPanel(page: Page, shortCode: string) {
  const input = page.locator("[data-go-code-input]").first();
  await input.waitFor({ timeout: 30_000 });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await input.fill(shortCode);
    await input.press("Enter");
    try {
      await page
        .locator("[data-go-booking-finalize]")
        .waitFor({ timeout: 20_000 });
      return;
    } catch {
      await page.waitForTimeout(2000);
    }
  }
  const panel = (await page.locator("body").innerText())
    .replace(/\s+/g, " ")
    .slice(0, 300);
  throw new Error(
    `Der Code ${shortCode} wurde im Panel nicht gefunden. Auf dem Schirm stand: ${panel}`,
  );
}

test("Code eintippen, bestaetigen, Gebuehr steht im Buch", async ({
  page,
}, testInfo) => {
  const problems = collectPageProblems(page);
  const { shortCode, bookingId } = await createBookingViaApi(4);
  await signInAsOwner(page);
  await page.locator("[data-go-business-card]").first().click();
  await page
    .locator("[data-go-code-input]")
    .first()
    .waitFor({ timeout: 30_000 });
  await testInfo.attach("panel", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await findCodeInPanel(page, shortCode);
  await testInfo.attach("code-gefunden", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  await page.locator("[data-go-booking-finalize]").first().click();
  await page.waitForTimeout(6000);
  await testInfo.attach("bestaetigt", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  const booking = (await listGoBookings("bro-pizza")).find(
    (entry) => entry.id === bookingId,
  );
  expect(booking, "die Buchung steht in Firestore").toBeTruthy();
  expect(String(booking?.status)).toBe("finalized");
  expect(Number(booking?.partySizeVerified)).toBe(4);
  expect(
    Number(booking?.commission?.amountCents),
    "vier Personen kosten 1,50 EUR",
  ).toBe(150);

  const ledger = (await listGoLedger()).filter(
    (entry) => entry.bookingId === bookingId,
  );
  expect(ledger.length, "genau eine Zeile im Hauptbuch fuer diesen Gast").toBe(
    1,
  );
  expect(Number(ledger[0].amountCents)).toBe(150);
  expect(problems).toEqual([]);
});

test("Ein Code loest nur einmal aus", async ({ page }) => {
  const { shortCode, bookingId } = await createBookingViaApi(2);
  await signInAsOwner(page);
  await page.locator("[data-go-business-card]").first().click();
  await findCodeInPanel(page, shortCode);
  await page.locator("[data-go-booking-finalize]").first().click();
  await page.waitForTimeout(5000);

  // Zweiter Versuch mit demselben Code.
  await page.locator("[data-go-code-input]").first().fill(shortCode);
  await page.locator("[data-go-code-input]").first().press("Enter");
  await page.waitForTimeout(4000);
  const ledger = (await listGoLedger()).filter(
    (entry) => entry.bookingId === bookingId,
  );
  expect(ledger.length, "kein zweiter Posten fuer denselben Gast").toBe(1);
});

/** Die Karte zeigt ihre Zahlen erst, wenn der Zaehler geantwortet hat. */
async function readGoCardSummary(page: Page) {
  const card = page.locator("[data-go-business-card]").first();
  await card.waitFor({ timeout: 40_000 });
  await expect(card).toContainText(/rezervime sot/, { timeout: 30_000 });
  return (await card.innerText()).replace(/\s+/g, " ");
}

test("Die Karte im Panel zeigt die aktiven Oferten des Lokals", async ({
  page,
}) => {
  await createBookingViaApi(3);
  await signInAsOwner(page);
  const summary = await readGoCardSummary(page);
  expect(
    summary,
    `Das Lokal hat drei aktive Oferten - die Karte sagt: "${summary}"`,
  ).not.toContain("0 oferta aktive");
});

test("Die Zahlen des Panels haengen nicht an der Uhr des Telefons", async ({
  browser,
}) => {
  await createBookingViaApi(3);
  const readCard = async (timezoneId: string) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:5173",
      locale: "sq-AL",
      timezoneId,
      viewport: { width: 390, height: 780 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await prepareGoPage(page);
    await signInAsOwner(page);
    const text = await readGoCardSummary(page).catch(async () => {
      const card = page.locator("[data-go-business-card]").first();
      return `(ohne Zahlen) ${(await card.innerText()).replace(/\s+/g, " ")}`;
    });
    await context.close();
    return text;
  };
  const home = await readCard("Europe/Belgrade");
  const away = await readCard("Pacific/Auckland");
  expect(
    away,
    `Dasselbe Lokal, dieselbe Buchung, andere Zeitzone im Telefon.\n  Belgrad: ${home}\n  Auckland: ${away}`,
  ).toBe(home);
});
