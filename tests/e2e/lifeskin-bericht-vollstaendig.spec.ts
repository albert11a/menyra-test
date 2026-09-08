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

const VEPRIMI = [
  "Hap folikulin e bllokuar dhe largon qelizat e vdekura",
  "Ul bakterin që ushqen inflamacionin",
  "Qetëson skuqjen pa e tharë barrierën",
];

const PRODUKT = {
  fields: {
    name: { stringValue: "Lifeskin Akne" },
    inhalt: { stringValue: "30 ml" },
    einzelpreis: { integerValue: "62" },
    veprimi: fsWert({ sq: VEPRIMI, de: [] }),
  },
};

// Dasselbe Produkt ohne die Wirkungszeilen. Die Seite darf dann kein
// Versprechen erfinden - der ganze Abschnitt faellt weg.
const PRODUKT_OHNE = {
  fields: {
    name: { stringValue: "Lifeskin Akne" },
    inhalt: { stringValue: "30 ml" },
    einzelpreis: { integerValue: "62" },
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

  // Der Befund steht sofort da - er ist die Belohnung fuer den Scan.
  await expect(page.locator("#lb-gjettext")).not.toBeEmpty();

  // Die Zonen und das Verfahren liegen in den Einzelheiten, zugeklappt.
  await expect(page.locator("#lb-detajet")).toBeVisible();
  await page.locator("#lb-detajet summary").click();
  await page.waitForTimeout(300);
  const zonen = page.locator("#lb-zonen .lb-zone");
  expect(await zonen.count()).toBeGreaterThanOrEqual(3);
  await expect(zonen.first().locator(".lb-zone__ort")).not.toBeEmpty();

  // DREI Messwerte oben - die zwei staerksten und der eine, der in
  // Ordnung ist. Fuenf Balken untereinander sind nicht glaubwuerdiger,
  // nur laenger; der gute Wert ist der Kontrast, der die schlechten
  // scharf macht, und er darf deshalb nicht herausfallen.
  const zeilen = page.locator("#lb-mess .lb-zeile");
  await expect(zeilen).toHaveCount(3);
  const stufen = await page.locator("#lb-mess .lb-stab").evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).dataset.s)),
  );
  expect(stufen[0], "Der staerkste Wert steht nicht oben").toBeGreaterThanOrEqual(stufen[1]);
  expect(stufen[2], "Der gute Wert steht nicht unten").toBe(0);

  // Und es steht dabei, wie viele wirklich geprueft wurden.
  await expect(page.locator("#lb-messrest")).toHaveText(/\d+/);
  // Die uebrigen sind nicht weg - sie stehen in den Einzelheiten.
  const uebrig = await page.locator("#lb-messtjere .lb-zeile").count();
  expect(uebrig, "Die uebrigen Messwerte sind verschwunden").toBeGreaterThan(0);

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

test("die Klebeleiste traegt nur den Knopf - der Rest steht bei der Therapie", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Die drei Zusagen standen in der Leiste.
  // Die war damit dreimal so hoch, stand dauernd im Bild und schob Preis
  // und Tagesbetrag aus dem Fenster.
  await oeffne(page);

  const inLeiste = await page.evaluate(() =>
    Boolean(document.querySelector("#lb-leiste #lb-sicher")));
  expect(inLeiste, "Die Zusagen kleben wieder unten am Knopf").toBe(false);

  // Sie stehen unmittelbar unter dem Preis, im mitscrollenden Teil.
  const beiPreis = await page.evaluate(() => {
    const preis = document.querySelector(".lb-preis");
    const sicher = document.querySelector("#lb-sicher");
    if (!preis || !sicher) return null;
    return { nachPreis: preis.compareDocumentPosition(sicher) & Node.DOCUMENT_POSITION_FOLLOWING,
             gleicherTeil: preis.parentElement === sicher.parentElement };
  });
  expect(beiPreis?.gleicherTeil, "Die Zusagen stehen nicht beim Preis").toBe(true);
  expect(Boolean(beiPreis?.nachPreis), "Die Zusagen stehen vor dem Preis").toBe(true);

  // ZWEI, nicht drei: Im Angebotsblock stehen Lieferung und Zahlungsweise.
  // Die Garantie kommt dort einmal kurz unter dem Knopf; dreimal dieselbe
  // Zusage in einem Block liest sich als Verkaufstrichter.
  await expect(page.locator("#lb-sicher li")).toHaveCount(2);
  const zusagen = (await page.locator("#lb-sicher li").allTextContents()).join(" ").toLowerCase();
  expect(zusagen, "Die Zahlungsweise fehlt").toContain("paguani");
  expect(zusagen, "Die Lieferung fehlt").toContain("dërgesa");
  expect(zusagen, "Die Garantie steht wieder in derselben Liste").not.toContain("garanci");
  await expect(page.locator("#lb-ofertagaranci")).toHaveText(/garanci/i);

  // Die Leiste bleibt flach: Knopf plus die leise Zeile darunter.
  const hoehe = await page.locator("#lb-leiste").evaluate((el) => el.getBoundingClientRect().height);
  expect(hoehe, "Die Leiste ist zu hoch - sie frisst den Bildschirm").toBeLessThan(130);
});

test("Preis und Tagesbetrag stehen unter der Therapie - mit Abstand", async ({ page }) => {
  await oeffne(page);
  await page.locator(".lb-preis").scrollIntoViewIfNeeded();
  // Erst messen, wenn der Block angekommen ist: waehrend er einschwebt,
  // steht er sechzehn Punkte tiefer, und dann misst man die Bewegung
  // statt des Abstands.
  await expect(page.locator("#lb-oferta")).toHaveAttribute("data-zeig", "da");
  await page.waitForTimeout(800);

  await expect(page.locator("#lb-preisjetzt")).toHaveText(/53/);
  await expect(page.locator("#lb-preistag")).toHaveText(/28/);

  // Kein Block klebt am naechsten.
  const abstaende = await page.evaluate(() => {
    const karte = document.querySelector(".lb-produkt")?.getBoundingClientRect();
    const preis = document.querySelector(".lb-preis")?.getBoundingClientRect();
    const sicher = document.querySelector("#lb-sicher")?.getBoundingClientRect();
    if (!karte || !preis || !sicher) return null;
    return [preis.top - karte.bottom, sicher.top - preis.bottom];
  });
  expect(abstaende).not.toBeNull();
  for (const abstand of abstaende as number[]) expect(abstand).toBeGreaterThanOrEqual(10);
});

test("die Therapie traegt die vier Wochen, die Begleitung und die Rechnung", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Beim Umbau der Seite sind sie
  // herausgefallen. Ohne sie kauft er eine Flasche und rechnet einen
  // Flaschenpreis; mit ihnen kauft er eine Therapie mit einem Ende.
  await oeffne(page);

  // Der Satz mit SEINEN Befunden traegt die Ueberleitung. Der generische
  // Untertitel darunter sagte dasselbe ohne Beweis und ist weggefallen.
  await expect(page.locator("#lb-psesatz")).not.toBeEmpty();

  // Vier Wochen, in dieser Reihenfolge.
  await expect(page.locator("#lb-plan li")).toHaveCount(4);
  const zahlen = await page.locator("#lb-plan .lb-plan__zahl").allTextContents();
  expect(zahlen).toEqual(["1", "2", "3", "4"]);
  await expect(page.locator("#lb-planmarke")).toHaveText(/28/);

  // Die Begleitung - sie steht vor dem Preis, weil sie ihn erklaert.
  await expect(page.locator("#lb-betreuung")).toBeVisible();
  await expect(page.locator("#lb-betreuungtitel")).not.toBeEmpty();

  // Die Rechnung: Marke, Ankerpreis, Setpreis, Ersparnis, Tagesbetrag.
  await expect(page.locator("#lb-preismarke")).not.toBeEmpty();
  await expect(page.locator("#lb-preisanker")).toHaveText(/62/);
  await expect(page.locator("#lb-preisjetzt")).toHaveText(/53/);
  await expect(page.locator("#lb-preisspar")).toHaveText(/9/);
  await expect(page.locator("#lb-preistag")).toHaveText(/28/);

  // Und die Reihenfolge stimmt: Produkt, Angebot mit Preis, DANN die vier
  // Wochen und die Begleitung. Die ausfuehrliche Zeitleiste stand einmal
  // zwischen Produkt und Preis - dort steht sie der Entscheidung im Weg.
  const oben = await page.evaluate(() =>
    ["#lb-produkte", ".lb-preis", "#lb-plan", "#lb-betreuung"]
      .map((w) => document.querySelector(w)?.getBoundingClientRect().top ?? -1));
  expect(oben).toEqual([...oben].sort((a, b) => a - b));
});

test("der Kopf traegt seinen Namen", async ({ page }) => {
  // "Raporti dermatologjik" allein ist eine Vorlage. Mit seinem Namen ist
  // es SEIN Bericht - und die Seite ist teilbar, also steht dort nur der
  // Vorname, nie eine Anschrift.
  await oeffne(page);
  await expect(page.locator("#lb-ffuer")).toHaveText(/Arlinda/);
  const text = await page.locator("#lb-ffuer").textContent();
  expect(text).not.toMatch(/\d{4,}/);
});

test("die Pillen behaupten nie eine einzelne Zone", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Bei einem einzelnen Foto stand dort
  // "1 foto · 1 zona" - das Erste nach der Ueberschrift, und es sagte
  // "wir haben kaum hingeschaut". Drei Zonen sind ein Ergebnis, eine ist
  // keins; an ihrer Stelle steht, was immer stimmt: die Zahl der
  // beurteilten Parameter.
  await oeffne(page);
  const pillen = await page.locator("#lb-pillen .lb-pille").allTextContents();
  expect(pillen.length).toBe(3);
  expect(pillen.some((p) => /parametra|Parameter/.test(p))).toBe(true);
  for (const p of pillen) {
    expect(p, `Die Pille "${p}" behauptet eine einzelne Zone`).not.toMatch(/^1 zona/);
  }
});

test("ein Messwert steht untereinander, nicht links und rechts", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Name links, Wert rechts, Erklaerung
  // darunter, Balken quer - das zwang das Auge bei jedem Wert zweimal
  // quer ueber den Bildschirm und wieder zurueck, und bei einem langen
  // Wert blieben dem Namen 83 von 350 Pixeln. Auf einem Telefon liest es
  // von oben nach unten.
  await oeffne(page);
  const zeilen = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".lb-zeile")).map((z) => {
      const n = z.querySelector(".lb-zeile__name")!.getBoundingClientRect();
      const w = z.querySelector(".lb-zeile__wert")!.getBoundingClientRect();
      const s = z.querySelector(".lb-stab")!.getBoundingClientRect();
      const ganz = z.getBoundingClientRect();
      return { untereinander: w.top >= n.bottom - 1,
               nameBreit: n.width / ganz.width,
               balkenUnten: s.top >= w.bottom - 1,
               balkenBreit: s.width / ganz.width };
    }));
  expect(zeilen.length).toBeGreaterThan(0);
  for (const z of zeilen) {
    expect(z.untereinander, "Der Wert steht wieder neben dem Namen").toBe(true);
    expect(z.balkenUnten, "Der Balken steht nicht unter dem Wert").toBe(true);
    expect(z.nameBreit, "Der Name bekommt nicht die volle Breite").toBeGreaterThan(0.5);
    expect(z.balkenBreit, "Der Balken nutzt nicht die volle Breite").toBeGreaterThan(0.95);
  }
});

test("die Bruecke nennt SEINEN Befund und sagt, was das Mittel dagegen tut", async ({ page }) => {
  // Die Seite bewies ein Problem in aller Ausfuehrlichkeit und zeigte dann
  // eine Flasche. Dazwischen fehlte der Satz, den jeder Skeptiker als
  // Erstes denkt: "Gut - und warum hilft ausgerechnet DAS?"
  //
  // Der Satz steht jetzt ueber den Karten, die Gruende IN der Karte -
  // beim Mittel, um das es geht, statt in einem eigenen Abschnitt davor.
  await oeffne(page);

  // Der Satz kommt aus SEINER Analyse, nicht aus einer Vorlage.
  // Er nennt den staerksten Befund - in Worten, die der Patient versteht,
  // nicht im Katalognamen. Geprueft wird deshalb auf ein tragendes Wort
  // daraus, nicht auf die genaue Zeichenkette.
  const satz = (await page.locator("#lb-psesatz").textContent())!.toLowerCase();
  const staerkster = raport.parametrat[0];
  const woerter = `${staerkster.emri} ${staerkster.thjeshte || ""}`.toLowerCase()
    .split(/[^\p{L}]+/u).filter((w) => w.length >= 5);
  expect(woerter.length, "Der staerkste Befund hat kein tragendes Wort").toBeGreaterThan(0);
  expect(woerter.some((w) => satz.includes(w)),
    `Der Satz nennt seinen staerksten Befund nicht: "${satz}"`).toBe(true);

  // Und die Zeilen kommen vom Produkt - in der Karte.
  const zeilen = await page.locator(".lb-produkt .lb-tut li").allTextContents();
  expect(zeilen.length).toBe(VEPRIMI.length);
  expect(zeilen[0]).toContain(VEPRIMI[0]);

  // Die Begruendung steht VOR dem Preis - sonst traegt sie nichts.
  const oben = await page.evaluate(() =>
    ["#lb-psesatz", "#lb-produkte", ".lb-preis"].map((w) => document.querySelector(w)!.getBoundingClientRect().top));
  expect(oben).toEqual([...oben].sort((a, b) => a - b));
});

test("ohne Wirkungszeilen erfindet die Seite kein Versprechen", async ({ page }) => {
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url()) ? PRODUKT_OHNE : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  // Kein erfundenes Versprechen: Die Karte steht, die Gruende fehlen.
  await expect(page.locator(".lb-produkt")).toHaveCount(1);
  await expect(page.locator(".lb-produkt .lb-tut li")).toHaveCount(0);
});

test("die Garantie steht gross vor dem Knopf, nicht klein darunter", async ({ page }) => {
  // Sie war eine von drei Zeilen in elf Pixeln. Das ist die staerkste
  // Zusage der Seite: Sie nimmt dem Zoegernden das einzige echte Risiko ab.
  await oeffne(page);
  await expect(page.locator("#lb-garanci")).toBeVisible();
  await expect(page.locator("#lb-garancititel")).toHaveText(/30/);
  await expect(page.locator("#lb-garancitext")).not.toBeEmpty();

  const groesse = await page.locator("#lb-garancititel").evaluate((el) =>
    parseFloat(getComputedStyle(el).fontSize));
  expect(groesse, "Die Garantie steht wieder im Kleingedruckten").toBeGreaterThanOrEqual(14);

  // Und der Satz, wofuer der Bericht gilt.
  await expect(page.locator("#lb-vlen")).toHaveText(/\d{2}\.\d{2}\.\d{4}/);
});

test("jede Frage vor dem Kauf ist beantwortet", async ({ page }) => {
  // Wer eine Frage hat und keine Antwort findet, kauft nicht - er schiebt
  // es auf, und aufgeschoben heisst nie.
  await oeffne(page);
  const fragen = page.locator("#lb-pyetjet .lb-pyetje__frage");
  await expect(fragen).toHaveCount(6);

  const summen = (await fragen.locator("summary").allTextContents()).join(" ").toLowerCase();
  for (const thema of ["sigurt", "shtatzënë", "kremrat", "dërgesa", "funksionon", "fotot"]) {
    expect(summen, `Die Frage nach "${thema}" fehlt`).toContain(thema);
  }

  // Jede laesst sich aufklappen und traegt eine Antwort.
  await fragen.first().locator("summary").click();
  await page.waitForTimeout(200);
  const antwort = await fragen.first().locator("p").textContent();
  expect(antwort!.trim().length).toBeGreaterThan(40);
});

// ---------- Bewegung ----------
//
// Die Abschnitte kommen beim Herunterscrollen. Das ist gewollt: Ein
// Befund, der als fertige Wand dasteht, wird ueberflogen; einer, dessen
// Abschnitte entstehen, wird gelesen.
//
// Aber ein Befund, den eine Animation VERSCHLUCKT, waere der schlimmste
// Fehler dieser Seite - und genau das pruefen die folgenden Faelle: den
// ersten Bildschirm, den Sprung, den Aufklapper und die abgeschaltete
// Bewegung.

test("der erste Bildschirm steht sofort - er blendet sich nicht ein", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Es genuegt nicht, alles zu verstecken und
  // gleich darauf freizugeben, was im Bild steht. Dazwischen liegt ein
  // Layoutdurchgang, der Browser sieht das Verstecken - und ausgerechnet
  // der Befund, auf den jemand eine Nacht gewartet hat, blendete sich
  // ueber eine halbe Sekunde ein.
  await oeffne(page);
  const blass = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#lb-rolle *"))
      .filter((el) => el.getBoundingClientRect().height > 0
        && el.getBoundingClientRect().top < window.innerHeight
        && !el.closest(".ls-verstecken")
        // Die Marke und der lateinische Name im Diagnoseblock sind
        // absichtlich leiser gesetzt - Entwurf, keine Animation.
        && !el.className.toString().includes("lb-diagnose__")
        && Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.id || el.className.toString()));
  expect(blass, "Der erste Bildschirm blendet sich ein").toEqual([]);

  // Weiter unten wartet trotzdem etwas - sonst gaebe es die Bewegung nicht.
  const wartet = await page.evaluate(() => document.querySelectorAll('[data-zeig="warte"]').length);
  expect(wartet, "Es wird gar nichts mehr eingeblendet").toBeGreaterThan(0);
});

test("die Abschnitte kommen beim Scrollen, nicht alle auf einmal", async ({ page }) => {
  await oeffne(page);
  const zuerst = await page.evaluate(() => ({
    gesamt: document.querySelectorAll("[data-zeig]").length,
    da: document.querySelectorAll('[data-zeig="da"]').length,
  }));
  expect(zuerst.gesamt, "Es wird gar nichts bewegt").toBeGreaterThan(4);
  expect(zuerst.da, "Alles steht sofort da - dann bewegt sich nichts").toBeLessThan(zuerst.gesamt);

  await page.locator("#lb-produkte").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  const danach = await page.evaluate(() => document.querySelectorAll('[data-zeig="da"]').length);
  expect(danach, "Beim Scrollen kommt nichts dazu").toBeGreaterThan(zuerst.da);
});

test("ein Sprung ans Ende laesst keinen Abschnitt haengen", async ({ page }) => {
  // DER Grund, warum hier gerechnet und nicht beobachtet wird: Ein
  // IntersectionObserver meldet nur WECHSEL. Springt die Seite in einem
  // Satz ueber einen Abschnitt hinweg - genau das, was ein Telefon beim
  // schnellen Wischen tut -, war er nie sichtbar, es gibt keinen Wechsel,
  // und er bliebe fuer immer versteckt.
  await oeffne(page);
  await page.evaluate(() => {
    const rolle = document.querySelector("#lb-rolle")!;
    rolle.scrollTop = rolle.scrollHeight;
  });
  await page.waitForTimeout(900);
  const haengt = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-zeig="warte"]')).map((el) => el.id || el.className));
  expect(haengt, "Diese Abschnitte sind beim Sprung unsichtbar geblieben").toEqual([]);

  // Und oben angekommen steht auch dort alles.
  await page.evaluate(() => { document.querySelector("#lb-rolle")!.scrollTop = 0; });
  await page.waitForTimeout(900);
  const blass = await page.evaluate(() => {
    const wahl = ["#lb-gjettext", "#lb-diagname", "#lb-messteil", "#lb-psesatz",
      "#lb-produkte", ".lb-preis", "#lb-preisjetzt", "#lb-ofertakauf", ".lb-produkt__satz"];
    return wahl.filter((w) => {
      const el = document.querySelector(w) as HTMLElement | null;
      return !el || Number(getComputedStyle(el).opacity) < 0.99;
    });
  });
  expect(blass, "Nach dem Sprung ist eine Aussage unsichtbar geblieben").toEqual([]);
});

test("im Aufklapper wird nichts versteckt", async ({ page }) => {
  // Was zugeklappt ist, kommt nie ins Bild - eine Einblendung darin wuerde
  // nie ausloesen, und der Inhalt bliebe nach dem Aufklappen unsichtbar.
  await oeffne(page);
  await page.locator("#lb-detajet").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator("#lb-detajet summary").click();
  await page.waitForTimeout(800);
  const blass = await page.evaluate(() =>
    Array.from(document.querySelectorAll("#lb-detajet *"))
      .filter((el) => el.getBoundingClientRect().height > 0
        && !el.classList.contains("ls-verstecken")
        && Number(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.id || el.className.toString()));
  expect(blass, "Im aufgeklappten Bereich ist etwas unsichtbar").toEqual([]);
  const gestaffelt = await page.evaluate(() =>
    document.querySelectorAll("#lb-detajet [data-zeig], #lb-detajet [data-nach]").length);
  expect(gestaffelt, "Der Inhalt des Aufklappers wird mitversteckt").toBe(0);
});

test("der Lesefortschritt oben waechst mit", async ({ page }) => {
  // Er sagt zwei Dinge auf einmal: wie viel noch kommt - und dass es ein
  // Ende gibt. Angefangenes wird zu Ende gelesen, wenn man das Ende sieht.
  await oeffne(page);
  const anfang = await page.locator("#lb-fortschritt").evaluate((el) => el.getBoundingClientRect().width);
  await page.evaluate(() => {
    const rolle = document.querySelector("#lb-rolle")!;
    rolle.scrollTop = rolle.scrollHeight;
  });
  await page.waitForTimeout(400);
  const ende = await page.locator("#lb-fortschritt").evaluate((el) => el.getBoundingClientRect().width);
  expect(anfang).toBeLessThan(4);
  expect(ende, "Der Fortschritt waechst nicht").toBeGreaterThan(200);
});

test("wer Bewegung abgeschaltet hat, bekommt den Befund sofort ganz", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await oeffne(page);
  // Dann wird gar nichts erst versteckt - nicht nur nicht bewegt.
  const gestaffelt = await page.evaluate(() => document.querySelectorAll("[data-zeig]").length);
  expect(gestaffelt, "Es wird trotzdem versteckt und wieder eingeblendet").toBe(0);

  const blass = await page.evaluate(() => {
    const wahl = ["#lb-gjettext", "#lb-diagname", "#lb-messteil", "#lb-psesatz",
      "#lb-produkte", ".lb-preis", "#lb-preisjetzt", "#lb-ofertakauf", ".lb-produkt__satz"];
    return wahl.filter((w) => {
      const el = document.querySelector(w) as HTMLElement | null;
      return !el || Number(getComputedStyle(el).opacity) < 0.99;
    });
  });
  expect(blass, "Trotz abgeschalteter Bewegung ist etwas unsichtbar").toEqual([]);
});

test("der Bericht hat Luft zwischen den Abschnitten", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Zwischen zwei Abschnitten lagen 38 Pixel
  // und die Titel waren nur zweieinhalb Punkt groesser als der Text. Wo
  // alle Groessen nah beieinanderliegen, hebt sich nichts ab - und was
  // sich nicht abhebt, wird ueberflogen.
  await oeffne(page);
  const masse = await page.evaluate(() => {
    // Die Luft zwischen zwei Abschnitten besteht aus zwei Teilen: dem
    // Abstand der Rolle und dem eigenen oberen Rand des naechsten
    // Abschnitts. Wer nur von Kasten zu Kasten misst, sieht die Haelfte.
    const rolle = document.querySelector("#lb-rolle")!;
    const teil = document.querySelector(".lb-teil:not(.ls-verstecken)")!;
    const h2 = document.querySelector(".lb-teil h2")!;
    const p = document.querySelector("#lb-gjettext")!;
    return {
      // Der Behaelter vergibt keinen Abstand mehr, der Abschnitt vergibt
      // ihn ganz: Was hier steht, ist auch das, was zu sehen ist.
      rollenGap: parseFloat(getComputedStyle(rolle).rowGap),
      luft: parseFloat(getComputedStyle(rolle).rowGap) + parseFloat(getComputedStyle(teil).paddingTop),
      kopfLuft: parseFloat(getComputedStyle(document.querySelector(".lb-teil__kopf")!).marginBottom),
      titel: parseFloat(getComputedStyle(h2).fontSize),
      text: parseFloat(getComputedStyle(p).fontSize)
    };
  });
  // Kein zweiter Behaelter, der noch einmal Abstand dazugibt: Sonst ist
  // die eine Zahl, die man aendert, nie die, die man sieht.
  expect(masse.rollenGap, "Die Rolle vergibt wieder eigenen Abstand").toBe(0);
  // Eine Spanne, nach BEIDEN Seiten. Zu eng wird ueberflogen; zu viel
  // Luft macht den Bericht nur laenger, ohne ihn leichter zu machen -
  // und Scroll-Muedigkeit kostet genauso viele Leser wie eine Textwand.
  expect(masse.luft, "Die Abschnitte kleben aneinander").toBeGreaterThanOrEqual(28);
  expect(masse.luft, "Zu viel Luft - der Bericht wird nur laenger").toBeLessThanOrEqual(36);
  expect(masse.kopfLuft, "Der Titel klebt an seinem Text").toBeGreaterThanOrEqual(8);
  expect(masse.kopfLuft, "Zwischen Titel und Text steht zu viel").toBeLessThanOrEqual(12);
  expect(masse.titel - masse.text, "Titel und Text sind zu nah beieinander")
    .toBeGreaterThanOrEqual(3);
  // Und der Fliesstext ist wirklich lesbar gross.
  expect(masse.text, "Der Fliesstext ist zu klein").toBeGreaterThanOrEqual(16);
});

test("waehrend des Befunds gibt es GAR KEINEN Knopf", async ({ page }) => {
  // DER wichtigste Punkt der ganzen Seite.
  //
  // Ein Knopf am unteren Rand ist eine Abkuerzung, und eine Abkuerzung
  // nimmt man. Wer gerade erfaehrt, was mit seiner Haut ist, soll das
  // lesen - nicht danebenliegend angeboten bekommen, es zu ueberspringen.
  // Und wer beim ersten Satz "53 €" liest, liest ab da ohnehin nur noch
  // "wo wollen die mir die 53 € begruenden".
  await oeffne(page);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "aus");

  // Nicht nur blass: wirklich weg, und nicht antippbar.
  const weg = await page.locator("#lb-leiste").evaluate((el) => {
    const stil = getComputedStyle(el);
    return { unten: el.getBoundingClientRect().top >= window.innerHeight - 2,
             klickbar: stil.pointerEvents !== "none", deckung: Number(stil.opacity) };
  });
  expect(weg.klickbar, "Der Knopf ist antippbar, obwohl er nicht da sein soll").toBe(false);
  expect(weg.deckung).toBeLessThan(0.05);
});

test("die Leiste kommt mit dem Angebot - und heisst FILLO, nicht kaufen", async ({ page }) => {
  await oeffne(page);
  // Bei der Ueberleitung ist sie noch nicht da: Wer gerade erst erfaehrt,
  // dass jetzt der Plan kommt, entscheidet noch nicht.
  await page.locator(".lb-kalim").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "aus");

  await page.locator("#lb-oferta").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "kauf");

  const knopf = (await page.locator("#lb-kaufen").textContent())!;
  expect(knopf).toMatch(/53/);
  // "Fillo" ist ein Anfang, "Blej" ist ein Kauf. Die Frage soll lauten
  // "wann fange ich an", nicht "kaufe ich zwei Cremes".
  expect(knopf.toLowerCase()).toContain("fillo");
  expect(knopf.toLowerCase()).not.toContain("blej");

  // Dieselbe Beschriftung und derselbe Betrag wie im Angebotsblock: Zwei
  // Knoepfe mit zwei Beschriftungen lesen sich als zwei Angebote.
  expect(knopf.trim()).toBe((await page.locator("#lb-ofertakauf").textContent())!.trim());

  // Darunter die Zeile zu Zahlung und Versand - dieselbe wie im Angebot.
  const unter = (await page.locator("#lb-kaufunter").textContent())!.toLowerCase();
  for (const wort of ["dorëzim", "falas"]) expect(unter).toContain(wort);
  expect(unter.trim()).toBe((await page.locator("#lb-ofertaunter").textContent())!.trim().toLowerCase());

  // Und er ist jetzt wirklich antippbar.
  await expect(page.locator("#lb-leiste")).toHaveCSS("pointer-events", "auto");
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);
  await expect(page.locator("#lb-bestellen")).toHaveAttribute("data-aktiv", "ja");
});

test("der Preis kommt erst nach der Ueberleitung und nach der Liste", async ({ page }) => {
  await oeffne(page);
  // EIN Satz statt Abschlussgedanke plus Skeptikerbox.
  await expect(page.locator(".lb-kalim")).toBeVisible();
  await expect(page.locator("#lb-kalim")).toHaveText(/analiz/i);
  expect(await page.locator(".lb-szene").count(), "Der Abschlussgedanke ist zurueck").toBe(0);
  expect(await page.locator(".lb-provuar").count(), "Die Skeptikerbox ist zurueck").toBe(0);

  const stellen = await page.evaluate(() =>
    [".lb-kalim", "#lb-psesatz", "#lb-produkte", "#lb-perfshi", ".lb-preis"]
      .map((w) => document.querySelector(w)!.getBoundingClientRect().top));
  expect(stellen).toEqual([...stellen].sort((a, b) => a - b));

  // Die Liste kommt aus den Daten: die beiden Mittel mit ihren Mengen,
  // dann Plan, Begleitung und Abschlussvergleich. Die kostenlose Analyse
  // steht NICHT darin - die hat er schon, und zwar umsonst.
  const punkte = (await page.locator("#lb-perfshiliste li").allTextContents());
  expect(punkte.length, "Die Liste zaehlt nicht die Mittel des Falls").toBe(4);
  expect(punkte[0], "Das Mittel steht nicht mit seiner Menge in der Liste")
    .toContain("30 ml");
  const zusammen = punkte.join(" ").toLowerCase();
  expect(zusammen, "Der Versand steht wieder in der Leistungsliste").not.toContain("dërgesa");
  expect(zusammen, "Die Garantie steht wieder in der Leistungsliste").not.toContain("garanci");
  expect(zusammen, "Die kostenlose Erstanalyse wird als Paketbestandteil verkauft")
    .not.toContain("vlerësimi personal");
  await expect(page.locator("#lb-paketamarke")).toHaveText(/28/);
});

test("der Bestellschirm sagt, dass es der letzte Schritt ist - und was er kostet", async ({ page }) => {
  // Goal Gradient: Wer sieht, dass er fast fertig ist, bricht seltener ab.
  // Und der Preis steht auf dem letzten Knopf - unmittelbar vor der
  // endgueltigen Handlung darf es keine Ueberraschung geben.
  await oeffne(page);
  await page.locator(".lb-preis").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);

  await expect(page.locator("#lb-bschritt")).not.toBeEmpty();
  await expect(page.locator("#lb-besttitel")).not.toBeEmpty();
  await expect(page.locator("#lb-bsenden")).toHaveText(/53/);
  const unter = (await page.locator("#lb-bunter").textContent())!.toLowerCase();
  expect(unter, "Unter dem letzten Knopf steht nicht, dass erst bei Lieferung gezahlt wird")
    .toContain("merrni");

  // Der Name ist schon da - ein Feld weniger zum Abbrechen.
  await expect(page.locator("#lb-bname")).toHaveValue(/Arlinda/);
});

// Eine hohe Flasche: 20 breit, 60 hoch, mit roten Kappen ganz oben und
// ganz unten. Genau die Form, bei der ein quadratisches Kaestchen oben
// und unten etwas abschneidet - und genau diese Kappen fehlen dann.
const HOHES_BILD = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAPklEQVR42mO4a2xMNmIY1Uyi5l8/v8ORTl4yQYSsflTzqOZRzaOaRzWPah7VPKp5VPOo5lHN+DWPdlDoqBkAdPDHehLIkXUAAAAASUVORK5CYII=";

test("das Produktbild wird nicht beschnitten", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Mit "cover" fehlten bei einer hohen
  // Flasche genau Deckel und Boden - der Patient sah ein Stueck Etikett
  // und sollte daraus schliessen, was geliefert wird. Und nach dem
  // Umstellen auf "contain" war es immer noch beschnitten: Das Bild wurde
  // in seinem Gitterkasten 64x172 gross und der Ueberstand von
  // "overflow: hidden" weggeschnitten.
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url())
      ? { fields: { ...PRODUKT.fields, photoRef: { stringValue: HOHES_BILD } } }
      : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  // Das Bild laedt erst, wenn es ins Bild kommt ("lazy") - also erst
  // hinscrollen, sonst misst der Test ein leeres Element.
  await page.locator("#lb-produkte").scrollIntoViewIfNeeded();
  // Und erst messen, wenn es wirklich geladen ist - sonst sind alle
  // natuerlichen Masse null und der Test prueft nichts.
  await page.waitForFunction(() => {
    const el = document.querySelector(".lb-produkt__bild img") as HTMLImageElement | null;
    return Boolean(el && el.complete && el.naturalWidth > 0);
  });

  const masse = await page.evaluate(() => {
    const img = document.querySelector(".lb-produkt__bild img") as HTMLImageElement;
    const kasten = img.parentElement!.getBoundingClientRect();
    const b = img.getBoundingClientRect();
    return { hoch: img.naturalHeight > img.naturalWidth,
             kachel: `${Math.round(kasten.width)}x${Math.round(kasten.height)}`,
             // Ob das Bild innerhalb der Kachel bleibt, also nichts
             // abgeschnitten wird.
             ueberstandH: Math.round(b.height - kasten.height),
             ueberstandB: Math.round(b.width - kasten.width),
             fit: getComputedStyle(img).objectFit,
             kachelHoehe: kasten.height,
             // Was "contain" wirklich malt: das Bild so gross wie moeglich,
             // ohne aus dem Kasten zu ragen und ohne sein Verhaeltnis zu
             // aendern.
             gemalt: (() => {
               const v = img.naturalWidth / img.naturalHeight;
               const k = b.width / b.height;
               return v > k
                 ? { breite: b.width, hoehe: b.width / v }
                 : { breite: b.height * v, hoehe: b.height };
             })(),
             // Das Seitenverhaeltnis muss erhalten sein - sonst waere das
             // Produkt gestaucht statt beschnitten, und das ist nicht
             // besser.
             verhaeltnis: (b.width / b.height) / (img.naturalWidth / img.naturalHeight) };
  });
  expect(masse.hoch, "Die Probe ist nicht hoch - dann prueft sie nichts").toBe(true);
  // Die Kachel bleibt klein und quadratisch. Sie waechst NICHT mit dem
  // Bild - drin ist das ganze Bild, das ist der Punkt.
  expect(masse.kachel, "Die Kachel ist nicht mehr quadratisch").toBe("96x96");
  // Nichts ragt heraus, also wird nichts abgeschnitten.
  expect(masse.ueberstandH, "Das Bild ragt aus der Kachel - der Rest wird abgeschnitten")
    .toBeLessThanOrEqual(0);
  expect(masse.ueberstandB, "Das Bild ragt seitlich aus der Kachel").toBeLessThanOrEqual(0);
  // Und es ist nicht gestaucht - gestaucht waere nicht besser als
  // beschnitten. Bei "contain" ist der Kasten quadratisch und das
  // GEMALTE Bild darin behaelt sein Verhaeltnis; gerechnet wird deshalb
  // die gemalte Flaeche, nicht der Kasten.
  expect(masse.fit, "Das Bild wird gestaucht oder beschnitten").toBe("contain");
  expect(masse.gemalt.hoehe, "Das Bild nutzt die Kachelhoehe nicht ganz aus")
    .toBeCloseTo(masse.kachelHoehe, 0);
  expect(masse.gemalt.breite, "Die gemalte Breite passt nicht zum Seitenverhaeltnis")
    .toBeCloseTo(masse.kachelHoehe * (1 / 3), 0);

  // Und im Korb beim Bestellen dasselbe Bild, ebenfalls ganz.
  await page.locator(".lb-preis").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.click("#lb-kaufen");
  await page.waitForTimeout(400);
  const korb = await page.evaluate(() => {
    const img = document.querySelector(".lb-korb__bild img") as HTMLImageElement;
    if (!img) return null;
    const kasten = img.parentElement!.getBoundingClientRect();
    const b = img.getBoundingClientRect();
    return { fit: getComputedStyle(img).objectFit, ueberstand: Math.round(b.height - kasten.height) };
  });
  expect(korb, "Im Korb steht kein Bild").not.toBeNull();
  expect(korb!.fit, "Im Korb wird das Bild beschnitten").toBe("contain");
  expect(korb!.ueberstand).toBeLessThanOrEqual(0);
});

test("ein Sprung ueber die Produkte hinweg bringt den Knopf trotzdem", async ({ page }) => {
  // GEMESSEN, NICHT GESCHAETZT: Mit einem IntersectionObserver ging das
  // schief. Der meldet nur WECHSEL des Zustands - springt die Seite in
  // einem Satz von oberhalb der Produktkarten nach unterhalb, bleibt
  // "nicht sichtbar" stehen, es gibt keinen Wechsel, und der Knopf kam
  // nie. Beim langsamen Scrollen faellt das nie auf, bei einem Sprung
  // immer - und ein Sprung ist genau das, was ein Telefon beim schnellen
  // Wischen macht.
  await oeffne(page);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "aus");
  // In einem einzigen Satz ans Ende.
  await page.evaluate(() => {
    const rolle = document.querySelector("#lb-rolle")!;
    rolle.scrollTop = rolle.scrollHeight;
  });
  await page.waitForTimeout(500);
  await expect(page.locator("#lb-leiste")).toHaveAttribute("data-stufe", "kauf");
  await expect(page.locator("#lb-kaufen")).toHaveText(/53/);
});

test("die Seite schreibt die vier Marken - jede genau einmal", async ({ page }) => {
  // Heart wusste bisher drei Dinge ueber die Befundseite: geoeffnet,
  // WhatsApp getippt, bestellt. Dazwischen lagen zwei Bildschirmlaengen
  // Bericht, ueber die nichts bekannt war - und genau dort steigt aus,
  // wer aussteigt. "Es kauft niemand" ist keine Erkenntnis; "sie lesen
  // bis zur Therapie und sehen den Preis nie" ist eine.
  const geschrieben: string[] = [];
  await page.route("**/firestore.googleapis.com/**", async (weg) => {
    const anfrage = weg.request();
    if (anfrage.method() === "PATCH") {
      geschrieben.push(...new URL(anfrage.url()).searchParams
        .getAll("updateMask.fieldPaths").filter((f) => f !== "updatedAt"));
      return weg.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    const fertig = /\/products\//.test(anfrage.url()) ? PRODUKT : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  expect(geschrieben, "Beim Oeffnen darf noch keine Lesemarke stehen").toEqual(["berichtGeoeffnet"]);

  // Einmal durch, wie ein Patient.
  await page.evaluate(async () => {
    const rolle = document.querySelector("#lb-rolle")!;
    for (let y = 0; y <= rolle.scrollHeight; y += 250) {
      rolle.scrollTop = y;
      await new Promise((f) => setTimeout(f, 45));
    }
  });
  await page.waitForTimeout(600);
  for (const marke of ["sahSchnitt", "sahTherapie", "sahPreis"]) {
    expect(geschrieben, `${marke} wurde nicht geschrieben`).toContain(marke);
  }

  await page.click("#lb-kaufen");
  await page.waitForTimeout(500);
  expect(geschrieben).toContain("kasseGeoeffnet");

  // Und jede genau einmal - sonst waeren es bei jedem Scrollen neue
  // Schreibvorgaenge, und das kostet Geld und Akku.
  const doppelt = geschrieben.filter((f, i) => geschrieben.indexOf(f) !== i);
  expect(doppelt, "Diese Marken wurden mehrfach geschrieben").toEqual([]);

  // In der Reihenfolge, in der gelesen wird.
  expect(geschrieben).toEqual(["berichtGeoeffnet", "sahSchnitt", "sahTherapie", "sahPreis", "kasseGeoeffnet"]);
});

test("die Bruecke zeigt hoechstens DREI Gruende", async ({ page }) => {
  // Drei Gruende lesen sich als Auswahl - jemand hat entschieden, was
  // zaehlt. Ab vier liest es sich wieder wie eine Merkmalsliste am
  // Produkt, und die ueberzeugt niemanden, der schon fuenf Sachen
  // probiert hat.
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const fertig = /\/products\//.test(weg.request().url())
      ? { fields: { ...PRODUKT.fields,
          veprimi: fsWert({ sq: ["Eins", "Zwei", "Drei", "Vier", "Fuenf"], de: [] }) } }
      : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);
  await expect(page.locator(".lb-produkt .lb-tut li")).toHaveCount(3);
});

// Ein Produkt, wie es WIRKLICH in der Datenbank steht: mit Wirkstoffen,
// Anwendung und Ziel.
//
// GEMESSEN, NICHT GESCHAETZT: Genau daran ist die Seite in Betrieb
// gestorben. Der Knopf zu den Einzelheiten haengte sich an ein Element,
// das es in der neuen Karte nicht mehr gibt - querySelector gab null,
// appendChild warf, und der Fehler flog aus dem Zeichnen bis in
// starte(). Der Patient sah dauerhaft "Po hapet analiza juaj...".
//
// 1780 Unittests und 43 e2e-Faelle waren dabei gruen: Kein einziges
// Produkt in den Testdaten hatte diese Felder, also lief der Zweig nie.
// Ein Fixture, das flacher ist als die Wirklichkeit, prueft die
// Wirklichkeit nicht.
const PRODUKT_TIEF = {
  fields: {
    ...PRODUKT.fields,
    lloji: { stringValue: "gel" },
    nenName: fsWert({ sq: "Benzoyl Peroxide 5%", de: "" }),
    synimi: fsWert({ sq: "Ul lezionet aktive brenda 28 ditesh.", de: "" }),
    perberesit: fsWert([
      { emri: "Benzoyl Peroxide", sasia: "5%", roli: { sq: "Ul bakterin", de: "" } },
      { emri: "Niacinamide", sasia: "4%", roli: { sq: "Qeteson skuqjen", de: "" } }
    ]),
    perdorimi: fsWert({ hapi: 2, koha: { sq: "mbremje", de: "" }, sasia: { sq: "nje bize", de: "" },
      si: { sq: "Ne lekure te thate, shmang syte.", de: "" }, kujdes: { sq: "Perdor mbrojtje nga dielli.", de: "" } })
  }
};

test("eine Karte mit Wirkstoffen bringt die Seite nicht um", async ({ page }) => {
  const fehler: string[] = [];
  page.on("pageerror", (e) => fehler.push(String(e)));

  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const anfrage = weg.request();
    if (anfrage.method() === "PATCH") {
      return weg.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    const fertig = /\/products\//.test(anfrage.url()) ? PRODUKT_TIEF : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);

  // Der Befund steht da - nicht der Ladebildschirm und nicht "nicht gefunden".
  await expect(page.locator("#lb-fertig")).toHaveAttribute("data-aktiv", "ja");
  await expect(page.locator("#lb-laedt")).toHaveAttribute("data-aktiv", "nein");
  await expect(page.locator("#lb-weg")).toHaveAttribute("data-aktiv", "nein");
  expect(fehler, "Die Seite hat einen Fehler geworfen").toEqual([]);

  // Der Knopf zu den Einzelheiten haengt an der KARTE, nicht in der
  // Titelspalte - dort hat er eine Linie ueber die volle Breite.
  const knopf = page.locator(".lb-produkt > .lb-produkt__mehr");
  await expect(knopf).toHaveCount(1);

  // Und er oeffnet wirklich etwas.
  await knopf.click();
  await page.waitForTimeout(400);
  await expect(page.locator("#lb-blattinfo")).not.toBeEmpty();
  await expect(page.locator("#lb-blatttitel")).toContainText("Benzoyl Peroxide");
});

test("die Therapiekarte hat auf JEDEM Telefon denselben Rhythmus", async ({ page }) => {
  // GESEHEN AUF DEM TELEFON, DANN NACHGEMESSEN: Der Satz klebte am
  // Produktbild - aber nicht ueberall. Der Abstand haengte daran, wie die
  // drei Merkmale neben dem Namen umbrechen. Zusammen sind sie 218 Punkte
  // breit:
  //
  //   320  drei Zeilen  -> Spalte 119 hoch, Kachel 96  -> 63 Punkte Loch
  //   390  zwei Zeilen  -> Spalte  89 hoch, Kachel 96  -> 20, richtig
  //   430  eine Zeile   -> Spalte  58 hoch, Kachel 96  -> 53 Punkte Loch
  //
  // Deshalb misst dieser Test nicht eine Breite, sondern vier - und
  // verlangt, dass dieselbe Karte ueberall dieselben Abstaende hat. Eine
  // Messung auf 390 haette beide Loecher durchgelassen.
  await page.route("**/firestore.googleapis.com/**", (weg) => {
    const anfrage = weg.request();
    if (anfrage.method() === "PATCH") {
      return weg.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    }
    const fertig = /\/products\//.test(anfrage.url()) ? PRODUKT_TIEF : BERICHT;
    return weg.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fertig) });
  });
  await page.goto("/apps/lifeskin-bericht/index.html");
  await page.evaluate(async () => {
    const { Bericht } = await import("/apps/lifeskin-bericht/bericht.js");
    await new Bericht({ ort: { pathname: "/analiza/aabbccdd11223344", href: "https://mnyra.com/analiza/aabbccdd11223344" } }).starte();
  });
  await page.waitForTimeout(700);

  const gemessen: Record<number, Record<string, number>> = {};
  for (const breite of [320, 360, 390, 430]) {
    await page.setViewportSize({ width: breite, height: 900 });
    await page.waitForTimeout(120);
    gemessen[breite] = await page.evaluate(() => {
      const karte = document.querySelector(".lb-produkt") as HTMLElement;
      const r = (w: string) => karte.querySelector(w)!.getBoundingClientRect();
      const k = karte.getBoundingClientRect();
      const rd = (n: number) => Math.round(n);
      return {
        obenBild: rd(r(".lb-produkt__bild").top - k.top),
        bildSatz: rd(r(".lb-produkt__satz").top - r(".lb-produkt__bild").bottom),
        merkmaleSatz: rd(r(".lb-produkt__satz").top - r(".lb-produkt__meta").bottom),
        satzGruende: rd(r(".lb-tut").top - r(".lb-produkt__satz").bottom),
        gruendeMehr: rd(r(".lb-produkt__mehr").top - r(".lb-tut").bottom),
        mehrUnten: rd(k.bottom - r(".lb-produkt__mehr").bottom),
      };
    });
  }

  // Nichts klebt, und nichts faellt auseinander - auf keiner Breite.
  for (const [breite, masse] of Object.entries(gemessen)) {
    for (const [wo, wert] of Object.entries(masse)) {
      expect(wert, `Zu eng auf ${breite}: ${wo}`).toBeGreaterThanOrEqual(16);
      expect(wert, `Zu viel Luft auf ${breite}: ${wo}`).toBeLessThanOrEqual(26);
    }
  }

  // Und der Rhythmus ist auf allen Breiten DERSELBE. Das ist der Kern:
  // Ein Abstand, der von der Fensterbreite abhaengt, ist kein Entwurf,
  // sondern ein Nebeneffekt des Umbruchs.
  for (const breite of [360, 390, 430]) {
    expect(gemessen[breite], `Auf ${breite} steht die Karte anders da als auf 320`)
      .toEqual(gemessen[320]);
  }

  // Innerhalb einer Breite liegen die Abstaende dicht beieinander.
  const werte = Object.values(gemessen[390]);
  expect(
    Math.max(...werte) - Math.min(...werte),
    "Die Abstaende in der Karte sind ungleichmaessig",
  ).toBeLessThanOrEqual(6);
});
