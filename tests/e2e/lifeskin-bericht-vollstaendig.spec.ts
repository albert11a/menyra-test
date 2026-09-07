import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { raportLesen } from "../../shared/lifeskin-analyse.js";

// Der Befund muss GANZ ankommen.
//
// GEMESSEN, NICHT GESCHAETZT: Auf dem Telefon standen nur Ekzaminimi und
// Gjetjet und darunter sofort der Preis. Zonen, Messwerte, Diagnose,
// Erklaerung und Prognose fehlten - mehr als die Haelfte der Seite. Die
// Seite war in Ordnung; freigegeben worden war ein Bericht ohne die
// Angaben dafuer. Der alte Test hat das nicht gesehen, weil sein Beispiel
// diese Angaben selbst nicht hatte.
//
// Dieser hier nimmt das Beispiel aus dem Schema, schickt es durch
// denselben Leser wie Heart und prueft danach jeden Abschnitt einzeln.

const wurzel = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const raport = raportLesen(
  (() => {
    const md = readFileSync(join(wurzel, "docs/lifeskin-raport-schema.md"), "utf8");
    const roh = md.slice(md.indexOf("```json") + 7);
    return roh.slice(0, roh.indexOf("```"));
  })(),
);

// Firestore liefert jeden Wert verpackt. Was Heart schreibt, muss hier
// genauso ankommen - sonst prueft der Test eine Form, die es nicht gibt.
function fsWert(x: unknown): unknown {
  if (x === null || x === undefined) return { nullValue: null };
  if (Array.isArray(x)) return { arrayValue: { values: x.map(fsWert) } };
  if (typeof x === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(x as object).map(([k, v]) => [k, fsWert(v)])),
      },
    };
  }
  if (typeof x === "boolean") return { booleanValue: x };
  if (typeof x === "number") {
    return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
  }
  return { stringValue: String(x) };
}

const BERICHT = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    code: { stringValue: "LS-0509-K7M2P" },
    name: { stringValue: "Arlinda" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    preis: { integerValue: "53" },
    befund: { stringValue: String(raport.gjetjet) },
    raport: fsWert(raport),
    produkte: {
      arrayValue: {
        values: [
          {
            mapValue: {
              fields: {
                id: { stringValue: "lifeskin-akne" },
                satz: { stringValue: "Ne mengjes dhe ne mbremje." },
              },
            },
          },
        ],
      },
    },
  },
};

const PRODUKT = {
  fields: {
    name: { stringValue: "Lifeskin Akne" },
    inhalt: { stringValue: "30 ml" },
    einzelpreis: { integerValue: "34" },
  },
};

async function oeffne(page: Page) {
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url()) ? PRODUKT : BERICHT;
    return weg.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fertig),
    });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    const b = new Bericht({
      ort: {
        pathname: "/analiza/aabbccdd11223344",
        href: "https://mnyra.com/analiza/aabbccdd11223344",
      },
    });
    await b.starte();
  });
  await page.waitForTimeout(700);
}

test.use({ viewport: { width: 390, height: 844 } });

test("jeder Abschnitt des Befunds steht wirklich auf der Seite", async ({ page }) => {
  await oeffne(page);

  // Kopf: Marke und Fallnummer, Titel, Unterschrift.
  await expect(page.locator("#lb-fnummer")).toHaveText(/LS-/);
  await expect(page.locator("#lb-ftitel")).not.toBeEmpty();

  // Die Pillen - Fotos, Zonen, Parameter.
  await expect(page.locator("#lb-pillen .lb-pille")).toHaveCount(3);

  // Was untersucht wurde. NICHT der Standardsatz: der steht nur da, wenn
  // die Angaben fehlen - und genau daran war der leere Bericht zu erkennen.
  const ekz = await page.locator("#lb-ekztext").textContent();
  expect(ekz?.trim().length).toBeGreaterThan(40);
  expect(ekz).not.toContain("{zonat}");

  // Der Befund und die Zonen darunter.
  await expect(page.locator("#lb-gjettext")).not.toBeEmpty();
  await expect(page.locator("#lb-zonenknopf")).toBeVisible();
  await page.click("#lb-zonenknopf");
  await page.waitForTimeout(300);
  const zonen = page.locator("#lb-zonen .lb-zone");
  expect(await zonen.count()).toBeGreaterThanOrEqual(3);
  await expect(zonen.first().locator(".lb-zone__ort")).not.toBeEmpty();

  // Fuenf Messwerte, absteigend, mit Balken.
  const zeilen = page.locator("#lb-mess .lb-zeile");
  await expect(zeilen).toHaveCount(5);
  const stufen = await page.locator("#lb-mess .lb-stab").evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).dataset.s)),
  );
  expect(stufen).toEqual([...stufen].sort((a, b) => b - a));

  // Die Diagnose - und die Handlung darunter.
  await expect(page.locator("#lb-diagnose")).toBeVisible();
  await expect(page.locator("#lb-diagname")).not.toBeEmpty();
  await expect(page.locator("#lb-diagstufe")).not.toBeEmpty();

  // Die Erklaerung fuer den Patienten.
  await expect(page.locator("#lb-erklaerteil")).toBeVisible();
  expect(await page.locator("#lb-erklaertext .lb-satz").count()).toBeGreaterThanOrEqual(1);

  // Was ohne Pflege geschieht.
  await expect(page.locator("#lb-ohneteil")).toBeVisible();
  await expect(page.locator("#lb-zeitleiste .lb-zeitfeld")).toHaveCount(3);

  // Und erst danach die Therapie und der Preis.
  await expect(page.locator("#lb-produkte")).not.toBeEmpty();
  await expect(page.locator("#lb-kaufen")).toBeVisible();
});

test("kein Abschnitt der Seite bleibt unsichtbar oder leer", async ({ page }) => {
  await oeffne(page);

  // Jeder Abschnitt, den die Seite kennt, muss bei vollstaendigen Angaben
  // auch da sein. Ein einzelner versteckter Teil ist ein halber Bericht -
  // und ein halber Bericht verkauft nichts.
  const leer = await page.evaluate(() => {
    const ids = ["lb-pillen", "lb-ekztext", "lb-gjettext", "lb-messteil", "lb-diagnose",
                 "lb-erklaerteil", "lb-ohneteil", "lb-produkte"];
    const raus: string[] = [];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) { raus.push(`${id}: gibt es nicht`); continue; }
      if (el.classList.contains("ls-verstecken")) { raus.push(`${id}: versteckt`); continue; }
      if (!el.textContent?.trim()) raus.push(`${id}: leer`);
    }
    return raus;
  });
  expect(leer, "Diese Abschnitte fehlen dem Patienten").toEqual([]);
});
