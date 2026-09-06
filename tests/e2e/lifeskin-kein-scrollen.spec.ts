import { test, expect, type Page } from "@playwright/test";

// Niemand scrollt, solange nur gewartet wird.
//
// Das ist keine Geschmacksfrage. Ein Bildschirm, der sich schieben laesst,
// sagt "hier ist mehr" - wer wischt und nichts findet, hat den Knopf
// zwischendurch aus dem Bild geschoben. Und der Knopf ist auf jedem dieser
// Bildschirme das Einzige, was wirklich gebraucht wird.
//
// Gescrollt wird erst, wenn der Befund da ist und Produkte darunter stehen.
//
// GEMESSEN, NICHT GESCHAETZT: Genau dieser Fehler war unsichtbar. Der
// Fortschrittsbalken lag im Fluss und brachte drei Pixel Hoehe plus
// vierundzwanzig Abstand mit - siebenundzwanzig Pixel zu viel, auf jedem
// Geraet und jedem Bildschirm, monatelang.

// Die Groessen, die in Kosovo und Albanien wirklich auf dem Tisch liegen.
// Das kleinste zuerst: Dort faellt es zuerst auseinander.
const GERAETE = [
  { name: "iPhone SE 1", breite: 320, hoehe: 568 },
  { name: "Android klein", breite: 360, hoehe: 640 },
  { name: "iPhone SE 2/3", breite: 375, hoehe: 667 },
  { name: "iPhone 12-15", breite: 390, hoehe: 844 },
  { name: "Android gross", breite: 412, hoehe: 915 },
];

const BERICHT = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    code: { stringValue: "LS-0509-K7M2P" },
    name: { stringValue: "Arlinda" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "wartet" },
    photos: { integerValue: "3" },
  },
};

// Der fertige Befund mit Therapie - der Zustand, aus dem heraus bestellt
// wird.
const BERICHT_FERTIG = {
  fields: {
    createdAt: { stringValue: "2026-09-05T18:14:00.000Z" },
    code: { stringValue: "LS-0509-K7M2P" },
    name: { stringValue: "Arlinda" },
    sprache: { stringValue: "sq" },
    status: { stringValue: "fertig" },
    photos: { integerValue: "3" },
    preis: { integerValue: "53" },
    befund: {
      stringValue:
        "Lekura juaj eshte e yndyrshme ne zonen T dhe me pore te zgjeruara. "
        + "Ne mjeker shoh inflamacion aktiv. Kjo trajtohet.",
    },
    produkte: {
      arrayValue: {
        values: [
          { mapValue: { fields: { id: { stringValue: "lifeskin-akne" }, satz: { stringValue: "Ne mengjes dhe ne mbremje." } } } },
          { mapValue: { fields: { id: { stringValue: "lifeskin-serum" }, satz: { stringValue: "Vetem ne mbremje." } } } },
        ],
      },
    },
  },
};

const PRODUKT = {
  fields: {
    name: { stringValue: "Lifeskin Gel" },
    inhalt: { stringValue: "50 ml" },
    einzelpreis: { integerValue: "34" },
  },
};

async function pruefe(seite: Page, wo: string) {
  // 1. Die Seite selbst ist nicht laenger als das Fenster.
  const masse = await seite.evaluate(() => ({
    doku: document.documentElement.scrollHeight,
    sicht: window.innerHeight,
  }));
  expect(masse.doku - masse.sicht, `${wo}: die Seite laesst sich scrollen`).toBeLessThanOrEqual(1);

  // 2. Und nichts ist dafuer abgeschnitten worden.
  //
  // Ohne diese zweite Haelfte waere die erste wertlos: Ein Kasten mit
  // overflow:hidden meldet keine Seitenlaenge und verschluckt trotzdem den
  // Text. Kaesten ohne Text sind ausgenommen - der runde Ausschnitt ueber
  // dem Kamerabild ist ein Zuschnitt und kein Verlust.
  const beschnitten = await seite.evaluate(() => {
    const raus: string[] = [];
    for (const el of Array.from(document.querySelectorAll("*"))) {
      const stil = getComputedStyle(el);
      if (stil.display === "none" || stil.visibility === "hidden") continue;
      if (!["hidden", "auto", "scroll"].includes(stil.overflowY)) continue;
      if (!el.textContent?.trim()) continue;
      const zuviel = el.scrollHeight - el.clientHeight;
      if (zuviel > 1 && el.clientHeight > 0) raus.push(`${el.id || el.className} (${zuviel}px)`);
    }
    return raus;
  });
  expect(beschnitten, `${wo}: hier wird Text abgeschnitten`).toEqual([]);
}

for (const geraet of GERAETE) {
  test.describe(`${geraet.name} (${geraet.breite}x${geraet.hoehe})`, () => {
    test.use({ viewport: { width: geraet.breite, height: geraet.hoehe } });

    test("kein Bildschirm des Trichters scrollt", async ({ page }) => {
      await page.goto("/apps/lifeskin/index.html");
      for (const schirm of ["einstieg", "name", "vorbereitung", "kamera", "analyse"]) {
        await page.evaluate((name) => {
          for (const s of Array.from(document.querySelectorAll<HTMLElement>(".ls-schirm"))) {
            s.dataset.aktiv = s.id === `ls-${name}` ? "ja" : "nein";
          }
        }, schirm);
        await page.waitForTimeout(120);
        await pruefe(page, `Trichter/${schirm}`);
      }
    });

    test("die Befundseite scrollt nicht - auch nicht mit offenem Blatt", async ({ page }) => {
      await page.route("**/firestore.googleapis.com/**", (weg) =>
        weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(BERICHT) }),
      );
      await page.goto("/apps/lifeskin-bericht/index.html");
      // Der Pfad traegt die Kennung; ohne sie zeigt die Seite "nicht
      // gefunden". Sie wird hier von Hand gesetzt, weil der lokale Server
      // keine Umschreibung kennt.
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
      await pruefe(page, "Befundseite");

      await page.click("#lb-faqknopf");
      await page.waitForTimeout(400);
      await pruefe(page, "Befundseite mit Blatt");
    });

    // Der Bestellschirm ist der letzte Schritt vor dem Geld. Er muss auf
    // ein Fenster passen - oben der Korb mit dem, was gekauft wird, unten
    // der Knopf. Als Blatt ueber der Seite tat er das nicht: Die Tastatur
    // schob den Knopf aus dem Bild und den Korb gab es gar nicht.
    test("der Bestellschirm passt auf einen Bildschirm", async ({ page }) => {
      await page.route("**/firestore.googleapis.com/**", (weg) => {
        const fertig = /\/products\//.test(weg.request().url()) ? PRODUKT : BERICHT_FERTIG;
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

      await expect(page.locator("#lb-kaufen")).toBeVisible();
      await page.click("#lb-kaufen");
      await page.waitForTimeout(400);

      // 1. Der Schirm ist da und der Befund weg.
      await expect(page.locator("#lb-bestellen")).toHaveAttribute("data-aktiv", "ja");
      await expect(page.locator("#lb-fertig")).toHaveAttribute("data-aktiv", "nein");

      // 2. Die Seite selbst laesst sich nicht schieben.
      const masse = await page.evaluate(() => ({
        doku: document.documentElement.scrollHeight,
        sicht: window.innerHeight,
      }));
      expect(masse.doku - masse.sicht, "der Bestellschirm scrollt die Seite").toBeLessThanOrEqual(1);

      // 3. Und die Mitte muss dafuer nicht scrollen - alles passt.
      const mitte = await page.evaluate(() => {
        const el = document.querySelector("#lb-bestellen .lb-bmitte") as HTMLElement | null;
        return el ? el.scrollHeight - el.clientHeight : -1;
      });
      expect(mitte, "der Bestellschirm passt nicht in ein Fenster").toBeLessThanOrEqual(1);

      // 4. Der Korb steht oben, die Felder darunter, der Knopf im Bild.
      const korb = await page.locator("#lb-bkorb").boundingBox();
      const feld = await page.locator("#lb-bname").boundingBox();
      const knopf = await page.locator("#lb-bsenden").boundingBox();
      expect(korb!.y, "der Korb steht nicht ueber den Feldern").toBeLessThan(feld!.y);
      expect(knopf!.y + knopf!.height, "der Bestellknopf liegt ausserhalb des Bildes")
        .toBeLessThanOrEqual(masse.sicht + 1);

      // 5. Der Preis steht im Korb. Wer beim Tippen nicht mehr sieht, was
      //    er zahlt, bricht ab.
      await expect(page.locator("#lb-bkorb")).toContainText("53");

      // 6. Der Pfeil fuehrt zurueck zum Befund - keine Sackgasse.
      await page.click("#lb-bzurueck");
      await page.waitForTimeout(300);
      await expect(page.locator("#lb-fertig")).toHaveAttribute("data-aktiv", "ja");
    });
  });
}
