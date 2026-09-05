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
  });
}
